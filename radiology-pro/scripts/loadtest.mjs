// Load test: 200 radiologists of one teleradiology company using Radiopis at the same time.
// Runs the real server (production build) against a FAKE AI server (no API key, no cost): every AI answer takes
// LT_AI_MIN_MS–LT_AI_MAX_MS (default 2–6 s) and a share LT_AI_429 (default 3 %) is answered "rate limited" like the
// real API does under pressure.
//
//   npm run build && node scripts/loadtest.mjs
//   LT_USERS=200 LT_MINUTES=3 AI_MAX_CONCURRENT=40 node scripts/loadtest.mjs
//
// Phases: 1) IT imports 200 people  2) everybody logs in at 8:00 (same second) and sets an own password
// 3) everybody opens the app (and syncs templates / style)  4) a dictation shift: each radiologist dictates,
// background pre-processing runs in pauses, then "Przygotuj opis"  5) spike: all 200 press "Przygotuj opis"
// in the same second. Prints latency percentiles, errors, AI queue figures, server memory and responsiveness.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTemplate, reportFromTemplate, TEMPLATES } from '../public/js/templates.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const N = Number(process.env.LT_USERS) || 200;
const MINUTES = Number(process.env.LT_MINUTES) || 3;
const AI_MIN = Number(process.env.LT_AI_MIN_MS) || 2000;
const AI_MAX = Number(process.env.LT_AI_MAX_MS) || 6000;
const AI_429 = process.env.LT_AI_429 !== undefined ? Number(process.env.LT_AI_429) : 0.03;
const PROD = existsSync(path.join(ROOT, 'dist', 'app', 'index.html'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------------------------------------------------------------- fake AI server
const ai = { calls: 0, inflight: 0, peak: 0, rateLimited: 0 };
const mock = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', async () => {
    ai.calls++;
    if (Math.random() < AI_429) {
      ai.rateLimited++;
      res.writeHead(429, { 'Content-Type': 'application/json', 'retry-after': '1' });
      return res.end(JSON.stringify({ type: 'error', error: { type: 'rate_limit_error', message: 'rate limited (simulated)' } }));
    }
    ai.inflight++;
    ai.peak = Math.max(ai.peak, ai.inflight);
    await sleep(rnd(AI_MIN, AI_MAX));
    ai.inflight--;
    const learn = /You study how one radiologist/.test(Buffer.concat(chunks).toString('utf8'));
    const text = learn
      ? JSON.stringify({ rules: [], phrases: [], questions: [], glossary: [], summary: 'ok' })
      : JSON.stringify({ edits: [{ op: 'insert', target: 'TOP', text: 'W jamie otrzewnej niewielka ilość wolnego płynu.', reason: '' }], conclusion: '- Niewielka ilość wolnego płynu w jamie otrzewnej.', warnings: [] });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'msg_lt', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn',
      usage: { input_tokens: 2500, output_tokens: 450, cache_read_input_tokens: 9000, cache_creation_input_tokens: 0 } }));
  });
});
await new Promise((r) => mock.listen(0, '127.0.0.1', r));

// ---------------------------------------------------------------- the real server
const dataDir = mkdtempSync(path.join(os.tmpdir(), 'radiopis-lt-'));
const PORT = 3900 + Math.floor(Math.random() * 90);
const BASE = `http://127.0.0.1:${PORT}`;
const ADMIN = { email: 'owner@loadtest.invalid', password: 'loadtest-owner-2026' };
const env = {
  ...process.env, NODE_ENV: PROD ? 'production' : 'development', PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: dataDir,
  ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: ADMIN.password, ANTHROPIC_API_KEY: 'loadtest-fake-key', ANTHROPIC_BASE_URL: `http://127.0.0.1:${mock.address().port}`,
  AI_PROVIDER: 'anthropic', LOG_REQUESTS: '0', BACKUP_DISABLED: '1', UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE || '8', RESEND_API_KEY: '',
};
const server = spawn(process.execPath, ['server.js'], { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (d) => { serverLog += d; });
server.stderr.on('data', (d) => { serverLog += d; });
for (let i = 0; i < 100; i++) {
  try { if ((await fetch(`${BASE}/healthz`)).ok) break; } catch { /* starting */ }
  await sleep(100);
}

// ---------------------------------------------------------------- measurement
const stats = new Map(); // name → { ms: [], status: Map }
function note(name, ms, status) {
  if (!stats.has(name)) stats.set(name, { ms: [], status: new Map() });
  const s = stats.get(name);
  s.ms.push(ms);
  s.status.set(status, (s.status.get(status) || 0) + 1);
}
const pct = (arr, p) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor((p / 100) * a.length))]; };

async function req(name, method, p, { body, cookie, headers = {}, raw = false } = {}) {
  const t = Date.now();
  let res;
  try {
    res = await fetch(`${BASE}${p}`, { method, redirect: 'manual', headers: { 'X-Radiopis': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (err) {
    note(name, Date.now() - t, 'NETWORK');
    return { status: 0, data: null, error: err };
  }
  const text = await res.text();
  note(name, Date.now() - t, res.status);
  let data = null;
  if (!raw) try { data = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, data, res, text, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}

// memory + responsiveness of the server while under load
const rss = [];
const health = [];
let sampling = true;
let currentPhase = 'start';
(async () => {
  while (sampling) {
    try { const m = /VmRSS:\s+(\d+)/.exec(readFileSync(`/proc/${server.pid}/status`, 'utf8')); if (m) rss.push(Number(m[1]) / 1024); } catch { /* not linux */ }
    const t = Date.now();
    try { await fetch(`${BASE}/healthz`); health.push({ phase: currentPhase, ms: Date.now() - t }); } catch { health.push({ phase: currentPhase, ms: -1 }); }
    await sleep(500);
  }
})();

const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const phases = [];
async function phase(name, fn) {
  const t = Date.now();
  log(`▶ ${name}`);
  currentPhase = name;
  const extra = await fn();
  const ms = Date.now() - t;
  const h = health.filter((x) => x.phase === name && x.ms >= 0).map((x) => x.ms);
  phases.push({ name, ms, ...extra, healthzP95: pct(h, 95), healthzMax: h.length ? Math.max(...h) : 0 });
  log(`  ✓ ${name}: ${(ms / 1000).toFixed(1)} s${extra ? ` ${JSON.stringify(extra)}` : ''}`);
}

// ---------------------------------------------------------------- scenario
let owner;
let itCookie;
let people = [];
const templateIds = TEMPLATES.slice(0, 60).map((t) => t.id);

await phase('setup: owner creates the organisation and its IT administrator', async () => {
  owner = (await req('login (owner)', 'POST', '/api/auth/login', { body: ADMIN })).cookie;
  const org = await req('admin: create org', 'POST', '/api/admin/orgs', { cookie: owner, body: { name: 'Teleradiologia Testowa', seats: N + 5, days: 14, pricePerSeat: 249, itEmail: 'it@lt.invalid', itName: 'IT' } });
  const l = await req('login (temp password)', 'POST', '/api/auth/login', { body: { email: 'it@lt.invalid', password: org.data.it.tempPassword } });
  await req('first password', 'POST', '/api/me/first-password', { cookie: l.cookie, body: { next: 'informatyk-2026', accept: true } });
  itCookie = l.cookie;
});

await phase(`IT imports ${N} radiologists in one paste`, async () => {
  const text = Array.from({ length: N }, (_, i) => `radiolog${i + 1}@lt.invalid;Radiolog Testowy ${i + 1};${1000000 + i}`).join('\n');
  const r = await req('IT: bulk import', 'POST', '/api/it/import', { cookie: itCookie, body: { text } });
  if (r.status !== 200) throw new Error(`import failed: ${r.status} ${r.text}`);
  people = r.data.created.map((c) => ({ email: c.email, temp: c.tempPassword, password: `Haslo-${c.email.split('@')[0]}-2026` }));
  return { created: r.data.created.length, skipped: r.data.skipped.length };
});

await phase(`8:00 — all ${N} log in at the same moment and set their own password`, async () => {
  await Promise.all(people.map(async (p) => {
    const l = await req('login (temp password)', 'POST', '/api/auth/login', { body: { email: p.email, password: p.temp } });
    if (l.status !== 200) return;
    const f = await req('first password', 'POST', '/api/me/first-password', { cookie: l.cookie, body: { next: p.password, accept: true } });
    if (f.status === 200) p.cookie = l.cookie;
  }));
  return { ready: people.filter((p) => p.cookie).length };
});

const profileBlob = JSON.stringify({ rules: Array.from({ length: 30 }, (_, i) => `Reguła stylu numer ${i}: pisz zwięźle.`), phrases: [], samples: Array.from({ length: 10 }, () => ({ text: 'Badanie wykonano w trybie ostrodyżurowym. '.repeat(40) })) });
const learnedBlob = JSON.stringify({ reports: { ct_head_normal: Array.from({ length: 12 }, () => ({ body: 'Struktury linii pośrodkowej nieprzemieszczone. '.repeat(120), conclusion: '- Bez zmian.' })) } });

await phase(`all ${N} open the app (page, script, style, status, sync of templates and style)`, async () => {
  const etags = {};
  await Promise.all(people.filter((p) => p.cookie).map(async (p) => {
    for (const f of ['/app/', '/app/js/app.js', '/app/styles.css']) {
      const r = await req(`GET ${f}`, 'GET', f, { cookie: p.cookie, raw: true });
      if (r.res?.headers.get('etag')) etags[f] = r.res.headers.get('etag');
    }
    await req('GET /api/status', 'GET', '/api/status', { cookie: p.cookie });
    await req('GET /api/sync', 'GET', '/api/sync', { cookie: p.cookie });
    await req('PUT /api/sync (style profile)', 'PUT', '/api/sync/radvox.profile.v1', { cookie: p.cookie, body: { value: profileBlob } });
    await req('PUT /api/sync (learned)', 'PUT', '/api/sync/radvox.learned.v1', { cookie: p.cookie, body: { value: learnedBlob } });
  }));
  // a second visit: the browser revalidates (304) instead of downloading the app again
  await Promise.all(people.filter((p) => p.cookie).map((p) => req('GET /app/js/app.js (revisit)', 'GET', '/app/js/app.js', { cookie: p.cookie, raw: true, headers: { 'If-None-Match': etags['/app/js/app.js'] || '' } })));
  return { learnedKb: Math.round(learnedBlob.length / 1024), profileKb: Math.round(profileBlob.length / 1024) };
});

/** One "Przygotuj opis" the way the app does it: retried twice when the server says busy / rate limited. */
async function prepare(p, reportId, templateId) {
  const t0 = Date.now();
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await req('AI: Przygotuj opis (one attempt)', 'POST', '/api/format', { cookie: p.cookie, body: { templateId, report: reportFromTemplate(getTemplate(templateId)), dictation: 'w jamie otrzewnej niewielka ilość wolnego płynu reszta bez zmian', reportId } });
    if (r.status === 200) { note('AI: Przygotuj opis (as the radiologist sees it)', Date.now() - t0, 200); return true; }
    if (!['busy', 'ai_rate'].includes(r.data?.code) || attempt === 2) { note('AI: Przygotuj opis (as the radiologist sees it)', Date.now() - t0, r.status); return false; }
    await sleep(Math.min(15, Number(r.res.headers.get('retry-after')) || 5) * 1000);
  }
  return false;
}

await phase(`dictation shift: ${N} radiologists working for ${MINUTES} min (background pre-processing + "Przygotuj opis")`, async () => {
  const until = Date.now() + MINUTES * 60_000;
  let reports = 0;
  let failed = 0;
  await Promise.all(people.filter((p) => p.cookie).map(async (p, i) => {
    await sleep(rnd(0, 20_000)); // people start a few seconds apart
    let n = 0;
    let lastStatus = 0;
    while (Date.now() < until) {
      const reportId = `r-${i}-${n++}`;
      const templateId = templateIds[(i + n) % templateIds.length];
      // dictating: 1–3 pauses → background pre-processing (may be refused when busy: that's fine)
      const pauses = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < pauses; k++) {
        await sleep(rnd(4000, 9000));
        req('AI: background pre-processing', 'POST', '/api/format', { cookie: p.cookie, body: { templateId, report: reportFromTemplate(getTemplate(templateId)), dictation: 'wolny płyn', reportId, background: true } });
      }
      if (await prepare(p, reportId, templateId)) reports++; else failed++;
      if (Date.now() - lastStatus > 60_000) { lastStatus = Date.now(); req('GET /api/status', 'GET', '/api/status', { cookie: p.cookie }); }
      await sleep(rnd(8000, 25_000)); // check the images, paste into RIS, open the next study
    }
  }));
  return { reports, failed, reportsPerMinute: Math.round(reports / MINUTES) };
});

await phase(`spike: all ${N} press "Przygotuj opis" in the same second`, async () => {
  const t = Date.now();
  const ok = await Promise.all(people.filter((p) => p.cookie).map((p, i) => prepare(p, `spike-${i}`, templateIds[i % templateIds.length])));
  return { ok: ok.filter(Boolean).length, failed: ok.filter((x) => !x).length, lastDoneAfterS: Math.round((Date.now() - t) / 1000) };
});

const overview = await req('admin overview', 'GET', '/api/admin/overview', { cookie: owner });
const orgs = await req('admin orgs', 'GET', '/api/admin/orgs', { cookie: owner });
sampling = false;
await sleep(600);

// ---------------------------------------------------------------- report
const rows = [...stats.entries()].map(([name, s]) => ({
  name, n: s.ms.length, p50: pct(s.ms, 50), p95: pct(s.ms, 95), p99: pct(s.ms, 99), max: Math.max(...s.ms),
  status: [...s.status.entries()].sort().map(([k, v]) => `${k}×${v}`).join(' '),
}));
const result = {
  date: new Date().toISOString(), users: N, minutes: MINUTES, prodBuild: PROD, node: process.version, cpus: os.cpus().length,
  aiConcurrency: Number(process.env.AI_MAX_CONCURRENT) || 60, fakeAi: { latencyMs: [AI_MIN, AI_MAX], rateLimitedShare: AI_429, ...ai },
  phases, endpoints: rows,
  server: {
    rssMbMax: Math.round(Math.max(...rss)), rssMbEnd: Math.round(rss.at(-1) || 0),
    healthzMs: { p50: pct(health.filter((x) => x.ms >= 0).map((x) => x.ms), 50), p95: pct(health.filter((x) => x.ms >= 0).map((x) => x.ms), 95), max: Math.max(...health.map((x) => x.ms)), failures: health.filter((x) => x.ms < 0).length },
    eventLoop: overview.data?.server?.loop,
    aiQueue: overview.data?.server?.ai,
  },
  billing: { reportsThisMonth: overview.data?.ai?.reports, costUsd: overview.data?.ai?.costUsd, org: orgs.data?.orgs?.[0] && { seatsUsed: orgs.data.orgs[0].seatsUsed, reports: orgs.data.orgs[0].reports, activeUsers: orgs.data.orgs[0].activeUsers } },
  serverErrors: (serverLog.match(/Error|error/g) || []).length,
};
console.log('\n=== Endpoints (ms) ===');
console.table(rows);
console.log('=== Phases ===');
console.table(phases.map((p) => ({ phase: p.name.slice(0, 60), seconds: +(p.ms / 1000).toFixed(1), healthzP95: p.healthzP95, healthzMax: p.healthzMax })));
console.log('=== Server ===');
console.log(JSON.stringify(result.server, null, 2));
console.log('=== Fake AI ===', JSON.stringify(result.fakeAi));
console.log('=== Billing check ===', JSON.stringify(result.billing));
const out = process.env.LT_OUT || path.join(dataDir, 'loadtest-result.json');
writeFileSync(out, JSON.stringify(result, null, 2));
console.log(`\nWynik zapisany: ${out}`);
if (result.serverErrors) console.log(`Server log (errors):\n${serverLog.split('\n').filter((l) => /rror/.test(l)).slice(0, 20).join('\n')}`);

server.kill('SIGTERM');
await new Promise((r) => server.on('exit', r));
mock.close();
process.exit(0);

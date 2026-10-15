// Central learning (archive → global knowledge → every AI request), the walls around it (IT, customers, users),
// and RODO functions: terms acceptance, data export, erasure, retention, two-factor login, e-mail redaction.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock;
let app;
let url;
let lastAiBody = '';
const aiBodies = [];

before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      lastAiBody = body;
      aiBodies.push(body);
      const global = /You help improve a Polish radiology reporting assistant used by many/.test(body);
      const text = global
        ? JSON.stringify({ summary: 'Radiolodzy usuwają z wniosków zalecenia kontroli.', general_rules: ['Do not add follow-up advice to the conclusion unless dictated.'], template_rules: [{ template_id: 'ct_head_normal', rules: ['Keep the sinus statement.'] }], phrasing: [{ from: 'Bez zmian ogniskowych.', to: 'Nie stwierdza się zmian ogniskowych.' }], avoid_in_conclusion: ['Wskazana kontrola.'], keep_statements: [], glossary: [{ en: 'free fluid', pl: 'wolny płyn' }] })
        : JSON.stringify({ edits: [], conclusion: '- Bez zmian.', warnings: [] });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '1.0';
  delete process.env.AI_PROVIDER;
  delete process.env.RESEND_API_KEY;
  const { openDb } = await import('../lib/db.js');
  openDb(':memory:');
  const { openLearningDb } = await import('../lib/learning.js');
  openLearningDb(':memory:');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
  const { createUser } = await import('../lib/auth.js');
  await createUser({ email: 'owner@example.com', password: 'ownerhaslo123', name: 'Owner', role: 'admin' });
});
after(() => { app?.close(); mock?.close(); });

const H = (cookie = '') => ({ 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) });
async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, headers: H(cookie), body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
async function login(email, password) {
  const r = await call('POST', '/api/auth/login', { email, password });
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  return { cookie: r.cookie, next: r.data.next };
}
const format = (cookie, extra = {}) => call('POST', '/api/format', { templateId: 'ct_head_normal', report: reportFromTemplate(getTemplate('ct_head_normal')), dictation: 'bez zmian', reportId: `r-${Math.random()}`, ...extra }, cookie);

let owner;
let org;
const rads = []; // { email, cookie, id }
let itCookie;

test('setup: an organisation with IT and 4 radiologists who accept the terms at first login', async () => {
  owner = (await login('owner@example.com', 'ownerhaslo123')).cookie;
  const o = await call('POST', '/api/admin/orgs', { name: 'Tele A', seats: 10, itEmail: 'it@a.test' }, owner);
  org = o.data.org;
  const it = await login('it@a.test', o.data.it.tempPassword);
  // without accepting the terms: refused
  const noAccept = await call('POST', '/api/me/first-password', { next: 'informatyk2026' }, it.cookie);
  assert.equal(noAccept.res.status, 400);
  assert.match(noAccept.data.error, /regulamin/);
  assert.equal((await call('POST', '/api/me/first-password', { next: 'informatyk2026', accept: true }, it.cookie)).res.status, 200);
  itCookie = it.cookie;
  const imp = await call('POST', '/api/it/import', { text: 'r1@a.test;Radiolog Jeden\nr2@a.test;Radiolog Dwa\nr3@a.test;Radiolog Trzy\nr4@a.test;Radiolog Cztery' }, itCookie);
  for (const c of imp.data.created) {
    const l = await login(c.email, c.tempPassword);
    await call('POST', '/api/me/first-password', { next: `haslo-${c.email}-1`, accept: true }, l.cookie);
    const me = await call('GET', '/api/me', undefined, l.cookie);
    assert.equal(me.data.termsVersion, '1.0', 'acceptance recorded');
    assert.ok(me.data.termsAcceptedAt);
    rads.push({ email: c.email, cookie: l.cookie, id: me.data.user.id });
  }
});

test('new terms version: everybody must accept again before working (proof per user)', async () => {
  await call('PUT', '/api/admin/settings', { termsVersion: '1.1' }, owner);
  const f = await format(rads[0].cookie);
  assert.equal(f.res.status, 402);
  assert.equal(f.data.code, 'terms');
  const page = await call('GET', '/app/', undefined, rads[0].cookie);
  assert.equal(page.res.headers.get('location'), '/accept');
  for (const r of rads) assert.equal((await call('POST', '/api/me/accept', { accept: true }, r.cookie)).res.status, 200);
  await call('POST', '/api/me/accept', { accept: true }, itCookie);
  assert.equal((await format(rads[0].cookie)).res.status, 200);
  const { one } = await import('../lib/db.js');
  assert.ok(one("SELECT COUNT(*) AS n FROM audit WHERE action = 'terms.accept' AND detail LIKE 'wersja 1.1%'").n >= 4);
});

const style = (pairs) => JSON.stringify(pairs.map(([ai, final]) => ({ ai, final, at: 1 })));
const learned = (removed, extra = {}) => JSON.stringify({ conclusionRemoved: removed, conclusionAdded: [], restored: [], reports: {}, translations: [], ...extra });

test('every lesson is archived permanently and de-identified, even after the app drops it', async () => {
  const sync = (r, key, value) => call('PUT', `/api/sync/${key}`, { value }, r.cookie);
  // 3 radiologists independently make the same wording correction and delete the same conclusion line
  for (const r of rads.slice(0, 3)) {
    await sync(r, 'radvox.style.v1', style([['Bez zmian ogniskowych.', 'Nie stwierdza się zmian ogniskowych.']]));
    await sync(r, 'radvox.learned.v1', learned(['Wskazana kontrola.']));
  }
  // one radiologist alone: a personal habit, and text with identifiers
  await sync(rads[3], 'radvox.learned.v1', learned(['Pacjent Jan Kowalski, PESEL 85010112345, badanie z 03.10.2026, tel. 601 202 303.'], {
    reports: { ct_head_normal: [{ body: 'Pani Anna Nowak. Struktury linii pośrodkowej nieprzemieszczone. Zmiana 12 x 8 mm.', conclusion: '- Bez zmian.', at: 1 }] },
  }));
  // the app later forgets the correction (rolling window) — the archive keeps it
  await sync(rads[0], 'radvox.style.v1', style([['Inne zdanie.', 'Inne zdanie poprawione.']]));
  const { learningDb } = await import('../lib/learning.js');
  const items = learningDb().prepare('SELECT kind, content, (SELECT COUNT(*) FROM contributors c WHERE c.item_id = items.id) AS n FROM items').all();
  const pair = items.find((i) => i.kind === 'style_pair' && i.content.includes('Nie stwierdza się zmian ogniskowych'));
  assert.ok(pair, 'kept after the app dropped it');
  assert.equal(pair.n, 3, 'three different radiologists');
  const all = JSON.stringify(items);
  for (const leak of ['Kowalski', '85010112345', '03.10.2026', '601 202 303', 'Nowak']) assert.ok(!all.includes(leak), `identifier left: ${leak}`);
  assert.match(all, /\[OSOBA\]/);
  assert.match(all, /\[PESEL\]/);
  assert.match(all, /\[DATA\]/);
  assert.match(all, /12 x 8 mm/, 'measurements are kept');
  // the item rows carry no user id at all
  const cols = learningDb().prepare('PRAGMA table_info(items)').all().map((c) => c.name);
  assert.ok(!cols.some((c) => /user|email/.test(c)));
});

test('nobody but the owner can reach the learning archive or the global knowledge', async () => {
  for (const [who, cookie] of [['IT', itCookie], ['radiologist', rads[0].cookie]]) {
    for (const p of ['/api/admin/learning', '/api/admin/learning/export', '/api/admin/learning/versions/1']) {
      assert.equal((await call('GET', p, undefined, cookie)).res.status, 403, `${who} ${p}`);
    }
    assert.equal((await call('POST', '/api/admin/learning/versions', { method: 'counts' }, cookie)).res.status, 403);
  }
  assert.equal((await call('GET', '/api/admin/learning', undefined, '')).res.status, 401);
  // the IT API has no learning or report content at all
  const ov = await call('GET', '/api/it/overview', undefined, itCookie);
  assert.ok(!JSON.stringify(ov.data).match(/learn|style|Nie stwierdza/i));
  const pr = await call('GET', '/api/it/problems', undefined, itCookie);
  assert.equal(pr.res.status, 200);
  assert.ok(!JSON.stringify(pr.data).match(/learn|style|Nie stwierdza/i));
  // a radiologist sees only their own synced data
  const mine = await call('GET', '/api/sync', undefined, rads[1].cookie);
  assert.ok(!JSON.stringify(mine.data).includes('Inne zdanie'));
});

let version;
test('owner builds global knowledge: only lessons shared by ≥ 3 radiologists; draft → edit → publish', async () => {
  const st = await call('GET', '/api/admin/learning', undefined, owner);
  assert.ok(st.data.stats.items >= 4);
  assert.equal(st.data.stats.contributors, 4);
  const v = await call('POST', '/api/admin/learning/versions', { method: 'counts', minContributors: 3 }, owner);
  assert.equal(v.res.status, 200, JSON.stringify(v.data));
  const c = v.data.version.content;
  assert.deepEqual(c.phrasing, [{ from: 'Bez zmian ogniskowych.', to: 'Nie stwierdza się zmian ogniskowych.' }]);
  assert.deepEqual(c.avoid_in_conclusion, ['Wskazana kontrola.']);
  assert.ok(!JSON.stringify(c).includes('[OSOBA]'), 'a single radiologist\'s lesson is not used');
  // too strict: nothing shared by 5 radiologists
  assert.equal((await call('POST', '/api/admin/learning/versions', { method: 'counts', minContributors: 5 }, owner)).res.status, 400);
  // AI distillation
  const ai = await call('POST', '/api/admin/learning/versions', { method: 'ai', minContributors: 3, note: 'test' }, owner);
  assert.equal(ai.res.status, 200, JSON.stringify(ai.data));
  assert.match(lastAiBody, /Wskazana kontrola/, 'shared lessons go to the AI');
  assert.ok(!lastAiBody.includes('[OSOBA]'), 'non-shared lessons do not');
  version = ai.data.version;
  assert.deepEqual(version.content.template_rules, { ct_head_normal: ['Keep the sinus statement.'] });
  // edit the draft (drop the glossary), publish
  const ed = await call('PATCH', `/api/admin/learning/versions/${version.id}`, { content: { ...version.content, glossary: [] } }, owner);
  assert.deepEqual(ed.data.version.content.glossary, []);
  const pub = await call('POST', `/api/admin/learning/versions/${version.id}`, {}, owner);
  assert.equal(pub.data.version.status, 'published');
  // published versions are immutable
  assert.equal((await call('PATCH', `/api/admin/learning/versions/${version.id}`, { content: {} }, owner)).res.status, 400);
});

test('the published global knowledge is used in every report — server-side only, personal style still wins', async () => {
  const f = await format(rads[3].cookie);
  assert.equal(f.res.status, 200);
  const sent = JSON.parse(lastAiBody);
  const text = JSON.stringify(sent.messages);
  assert.match(text, /global_guidance/);
  assert.match(text, /Keep the sinus statement/);
  assert.match(text, /Nie stwierdza się zmian ogniskowych/);
  assert.match(JSON.stringify(sent.system), /OWN preferences .* always override global_guidance/);
  assert.ok(!JSON.stringify(f.data).includes('global_guidance'), 'never sent to the browser');
  assert.ok(!JSON.stringify(f.data).includes('Keep the sinus'));
  const { one } = await import('../lib/db.js');
  assert.equal(one('SELECT global_version FROM usage ORDER BY id DESC LIMIT 1').global_version, version.id, 'traceability');
  // switched off → not used
  await call('POST', '/api/admin/learning/unpublish', {}, owner);
  await format(rads[3].cookie);
  assert.ok(!JSON.stringify(JSON.parse(lastAiBody).messages).includes('global_guidance'));
  await call('POST', `/api/admin/learning/versions/${version.id}`, {}, owner); // re-publish (rollback works the same way)
});

test('owner export: the whole archive and every version as JSON lines (no pseudonyms)', async () => {
  const res = await fetch(`${url}/api/admin/learning/export`, { headers: { Cookie: owner } });
  assert.equal(res.status, 200);
  const lines = (await res.text()).trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(lines[0].type, 'meta');
  assert.ok(lines.filter((l) => l.type === 'item').length >= 4);
  assert.ok(lines.some((l) => l.type === 'version' && l.status === 'published'));
  assert.ok(!JSON.stringify(lines).match(/"who"|"org":"/));
});

test('RODO: data export, erasure keeps anonymous lessons, IT removal, retention, e-mail redaction', async () => {
  const exp = await fetch(`${url}/api/me/export`, { headers: { Cookie: rads[1].cookie } });
  assert.equal(exp.status, 200);
  assert.match(exp.headers.get('content-disposition'), /attachment/);
  const data = await exp.json();
  assert.equal(data.account.email, rads[1].email);
  assert.ok(data.syncedAppData['radvox.style.v1']);
  // organisation members are removed by their IT (controller), not by themselves
  assert.equal((await call('POST', '/api/me/delete', { password: `haslo-${rads[1].email}-1` }, rads[1].cookie)).res.status, 400);
  const { learningDb, pseudonym } = await import('../lib/learning.js');
  const linksBefore = learningDb().prepare('SELECT COUNT(*) AS n FROM contributors WHERE who = ?').get(pseudonym('user', rads[1].id)).n;
  assert.ok(linksBefore > 0);
  assert.equal((await call('DELETE', `/api/it/users/${rads[1].id}`, undefined, itCookie)).res.status, 200);
  assert.equal(learningDb().prepare('SELECT COUNT(*) AS n FROM contributors WHERE who = ?').get(pseudonym('user', rads[1].id)).n, 0, 'link removed');
  assert.ok(learningDb().prepare("SELECT COUNT(*) AS n FROM items WHERE content LIKE '%Nie stwierdza się zmian ogniskowych%'").get().n, 'lesson stays');
  const { one } = await import('../lib/db.js');
  const gone = one('SELECT email, name, npwz FROM users WHERE id = ?', rads[1].id);
  assert.match(gone.email, /usuniety\.invalid$/);
  assert.equal(one("SELECT COUNT(*) AS n FROM audit WHERE detail LIKE ?", `%${rads[1].email}%`).n, 0, 'the e-mail is not kept in the log');
  // an individual (non-organisation) account can delete itself
  const reg = await call('POST', '/api/auth/register', { email: 'solo@example.com', password: 'solohaslo2026', name: 'Solo Radiolog', accept: true });
  assert.equal(reg.res.status, 200);
  assert.equal((await call('POST', '/api/me/delete', { password: 'zle-haslo-1' }, reg.cookie)).res.status, 400);
  assert.equal((await call('POST', '/api/me/delete', { password: 'solohaslo2026' }, reg.cookie)).res.status, 200);
  assert.equal((await call('POST', '/api/auth/login', { email: 'solo@example.com', password: 'solohaslo2026' })).res.status, 401);
  // retention
  const { run } = await import('../lib/db.js');
  run("INSERT INTO audit(ts, actor_id, action) VALUES (?, NULL, 'old')", Date.now() - 800 * 86400000);
  run("INSERT INTO outbox(ts, to_addr, subject, body, status) VALUES (?, 'x@y.z', 's', 'b', 'logged')", Date.now() - 100 * 86400000);
  const { runJobs } = await import('../lib/jobs.js');
  const done = await runJobs();
  assert.ok(done.auditDeleted >= 1);
  assert.ok(done.outboxDeleted >= 1);
  // a temporary password is never stored in the outbox copy
  const { sendMail } = await import('../lib/mail.js');
  await sendMail('x@y.z', 'Konto', 'Hasło tymczasowe: abcd-ef23-gh45\nLink: https://x/reset?token=SECRETTOKEN123');
  const last = one('SELECT body FROM outbox ORDER BY id DESC LIMIT 1').body;
  assert.ok(!last.includes('abcd-ef23-gh45'));
});

test('two-factor login: password alone is not enough; wrong codes limited; robots', async () => {
  const { totpCode } = await import('../lib/totp.js');
  const setup = await call('POST', '/api/me/2fa/setup', {}, owner);
  assert.match(setup.data.uri, /^otpauth:\/\/totp\//);
  assert.equal((await call('POST', '/api/me/2fa/enable', { code: '000000' }, owner)).res.status, 400);
  assert.equal((await call('POST', '/api/me/2fa/enable', { code: totpCode(setup.data.secret) }, owner)).res.status, 200);
  const ov = await call('GET', '/api/admin/overview', undefined, owner);
  assert.equal(ov.data.me2fa, true);
  const step1 = await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' });
  assert.equal(step1.data.need2fa, true);
  assert.ok(!step1.cookie, 'no session after the password alone');
  assert.equal((await call('POST', '/api/auth/login-2fa', { ticket: step1.data.ticket, code: '123456' })).res.status, 401);
  const ok = await call('POST', '/api/auth/login-2fa', { ticket: step1.data.ticket, code: totpCode(setup.data.secret) });
  assert.equal(ok.res.status, 200);
  assert.ok(ok.cookie);
  assert.equal((await call('POST', '/api/auth/login-2fa', { ticket: step1.data.ticket, code: totpCode(setup.data.secret) })).res.status, 401, 'ticket single use');
  const s2 = await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' });
  for (let i = 0; i < 5; i++) await call('POST', '/api/auth/login-2fa', { ticket: s2.data.ticket, code: '000000' });
  assert.equal((await call('POST', '/api/auth/login-2fa', { ticket: s2.data.ticket, code: totpCode(setup.data.secret) })).data.code, 'expired', 'after 5 wrong codes');
  assert.equal((await fetch(`${url}/site/admin.js`)).status, 404, 'owner panel code not public');
  assert.equal((await fetch(`${url}/site/admin.js`, { headers: { Cookie: rads[0].cookie } })).status, 404);
  assert.equal((await fetch(`${url}/site/it.js`, { headers: { Cookie: itCookie } })).status, 200);
  assert.equal((await fetch(`${url}/site/admin.js`, { headers: { Cookie: ok.cookie } })).status, 200);
  const robots = await (await fetch(`${url}/robots.txt`)).text();
  assert.match(robots, /Disallow: \/app\//);
  const head = await fetch(`${url}/app/`, { redirect: 'manual' });
  assert.equal(head.headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('IT problems view and tickets reach the owner', async () => {
  const t = await call('POST', '/api/it/tickets', { subject: 'Wolne odpowiedzi AI', body: 'Od 9:00 odpowiedzi trwają 30 s.' }, itCookie);
  assert.equal(t.res.status, 200);
  const owner2 = await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' });
  const { totpCode } = await import('../lib/totp.js');
  const { one } = await import('../lib/db.js');
  const sec = one("SELECT totp_secret FROM users WHERE email = 'owner@example.com'").totp_secret;
  const ok = await call('POST', '/api/auth/login-2fa', { ticket: owner2.data.ticket, code: totpCode(sec) });
  const list = await call('GET', '/api/admin/tickets', undefined, ok.cookie);
  assert.equal(list.data.tickets[0].subject, 'Wolne odpowiedzi AI');
  await call('PATCH', `/api/admin/tickets/${list.data.tickets[0].id}`, { answer: 'Sprawdzamy.', status: 'closed' }, ok.cookie);
  const pr = await call('GET', '/api/it/problems', undefined, itCookie);
  assert.equal(pr.data.tickets[0].answer, 'Sprawdzamy.');
  assert.equal(pr.data.service.ai, true);
});

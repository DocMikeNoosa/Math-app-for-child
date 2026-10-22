// RadVox Pro: the "Błąd mowy" entries go to the administrator (admin panel → Błędy mowy) — identifiers removed,
// only the owner can read them, CSV export, kept 180 days, part of the RODO export and removed with the account.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

let app, url, db, owner, doc, docId;

before(async () => {
  Object.assign(process.env, { ANTHROPIC_API_KEY: 'test', DB_FILE: ':memory:', BACKUP_DISABLED: '1' });
  delete process.env.AI_PROVIDER;
  db = await import('../lib/db.js');
  db.openDb(':memory:');
  (await import('../lib/learning.js')).openLearningDb(':memory:');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
  const { createUser } = await import('../lib/auth.js');
  await createUser({ email: 'owner@example.com', password: 'ownerhaslo123', name: 'Owner', role: 'admin' });
  docId = (await createUser({ email: 'doc@example.com', password: 'dochaslo1234', name: 'Lek. Jan Testowy' })).id;
  owner = (await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' })).cookie;
  doc = (await call('POST', '/api/auth/login', { email: 'doc@example.com', password: 'dochaslo1234' })).cookie;
});
after(() => { app?.close(); });

async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, text: data ? '' : await res.text(), cookie: (res.headers.get('set-cookie') || '').split(';')[0] };
}

const entry = {
  title: 'TK głowy', lang: 'pl', heard: 'krwiak osiem mm PESEL 44051401359', report: 'Krwiak 18 mm.', types: ['number', 'bogus'],
  note: 'usłyszał 18 zamiast 8', auto: { missing: ['8'], added: ['18', '<script>'] },
};

test('a doctor sends an entry; identifiers are removed and unknown values dropped', async () => {
  assert.equal((await call('POST', '/api/me/speech-log', entry)).res.status, 401, 'login required');
  assert.equal((await call('POST', '/api/me/speech-log', { ...entry, types: [] }, doc)).res.status, 400, 'a type must be ticked');
  const r = await call('POST', '/api/me/speech-log', entry, doc);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  const row = db.one('SELECT * FROM speech_log');
  assert.equal(row.user_id, docId);
  assert.doesNotMatch(row.heard, /44051401359/, 'PESEL removed');
  assert.deepEqual(JSON.parse(row.types), ['number']);
  assert.deepEqual(JSON.parse(row.auto), { missing: ['8'], added: ['18'] });
  await call('POST', '/api/me/speech-log', { ...entry, types: ['none', 'side'], report: 'Bez zmian.' }, doc);
  assert.deepEqual(JSON.parse(db.one('SELECT types FROM speech_log ORDER BY id DESC').types), ['none']);
  assert.equal(db.one('SELECT fixed FROM speech_log ORDER BY id DESC').fixed, 0);
});

test('"the AI corrected it" is stored only with an error; the report for buyers has the numbers and a strict CSP', async () => {
  await call('POST', '/api/me/speech-log', { ...entry, types: ['term'], fixed: true }, doc);
  assert.equal(db.one('SELECT fixed FROM speech_log ORDER BY id DESC').fixed, 1);
  await call('POST', '/api/me/speech-log', { ...entry, types: ['none'], fixed: true }, doc);
  assert.equal(db.one('SELECT fixed FROM speech_log ORDER BY id DESC').fixed, 0);
  const s = (await call('GET', '/api/admin/speech-log', undefined, owner)).data.summary;
  assert.equal(s.total, 4);
  assert.equal(s.fixed, 1);
  assert.equal(s.finalGood, 3, 'two without error + one corrected by the AI');
  assert.equal((await call('GET', '/api/admin/speech-log/report', undefined, doc)).res.status, 403);
  const r = await call('GET', '/api/admin/speech-log/report?days=30', undefined, owner);
  assert.equal(r.res.status, 200);
  assert.match(r.res.headers.get('content-type'), /text\/html/);
  assert.match(r.res.headers.get('content-security-policy'), /script-src 'sha256-[A-Za-z0-9+/=]+'/);
  assert.match(r.text, /Opisy końcowe poprawne/);
  assert.match(r.text, /75%/);
  assert.match(r.text, /ostatnie 30 dni/);
  for (const id of db.all('SELECT id FROM speech_log ORDER BY id DESC LIMIT 2').map((x) => x.id)) db.run('DELETE FROM speech_log WHERE id = ?', id);
});

test('only the administrator sees the log: summary, per doctor, entries, CSV export, delete', async () => {
  assert.equal((await call('GET', '/api/admin/speech-log', undefined, doc)).res.status, 403);
  const r = await call('GET', '/api/admin/speech-log', undefined, owner);
  assert.equal(r.res.status, 200);
  assert.equal(r.data.summary.total, 2);
  assert.equal(r.data.summary.withError, 1);
  assert.equal(r.data.summary.byType.number, 1);
  assert.equal(r.data.byUser[0].author, 'doc@example.com');
  assert.equal(r.data.byUser[0].total, 2);
  assert.equal(r.data.entries[0].author_name, 'Lek. Jan Testowy');
  const csv = await call('GET', '/api/admin/speech-log/export', undefined, owner);
  assert.equal(csv.res.status, 200);
  assert.match(csv.res.headers.get('content-type'), /text\/csv/);
  assert.match(csv.text, /"Lekarz"/);
  assert.match(csv.text, /"doc@example.com";"TK głowy"/);
  const id = r.data.entries[0].id;
  assert.equal((await call('DELETE', `/api/admin/speech-log/${id}`, undefined, owner)).res.status, 200);
  assert.equal(db.one('SELECT COUNT(*) AS n FROM speech_log').n, 1);
});

test('entries older than 180 days are dropped; the RODO export includes them; erasing the account removes them', async () => {
  db.run('INSERT INTO speech_log(user_id, ts, report, types) VALUES (?, ?, ?, ?)', docId, Date.now() - 200 * 86400000, 'stary', '["none"]');
  assert.equal((await call('GET', '/api/admin/speech-log', undefined, owner)).data.summary.total, 1, 'old entry not shown');
  await call('POST', '/api/me/speech-log', entry, doc);
  assert.equal(db.one("SELECT COUNT(*) AS n FROM speech_log WHERE report = 'stary'").n, 0, 'pruned on the next entry');
  const exp = await call('GET', '/api/me/export', undefined, doc);
  const data = exp.data || JSON.parse(exp.text);
  assert.equal(data.speechLog.length, 2);
  const del = await call('POST', '/api/me/delete', { password: 'dochaslo1234' }, doc);
  assert.equal(del.res.status, 200, JSON.stringify(del.data));
  assert.equal(db.one('SELECT COUNT(*) AS n FROM speech_log WHERE user_id = ?', docId).n, 0);
});

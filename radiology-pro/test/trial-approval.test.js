// New trials wait for the owner's approval; the owner sets days and a report limit for the whole trial.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

let app, url, adminCookie;
before(async () => {
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '';
  process.env.ANTHROPIC_API_KEY = 'x';
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
  adminCookie = (await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' })).cookie;
});
after(() => app?.close());

async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, cookie: (res.headers.get('set-cookie') || '').split(';')[0] };
}

test('a new account waits: no app, no AI, until the owner approves it', async () => {
  const reg = await call('POST', '/api/auth/register', { email: 'czeka@example.com', password: 'czekahaslo2026', name: 'Lek. Czekająca', npwz: '5425740', accept: true });
  assert.equal(reg.res.status, 200);
  assert.equal(reg.data.next, '/account');
  const me = await call('GET', '/api/me', undefined, reg.cookie);
  assert.equal(me.data.access.code, 'pending');
  const appPage = await call('GET', '/app/', undefined, reg.cookie);
  assert.equal(appPage.res.status, 302);
  const ai = await call('POST', '/api/format', {}, reg.cookie);
  assert.equal(ai.res.status, 402);
  assert.equal(ai.data.code, 'pending');

  const o = await call('GET', '/api/admin/overview', undefined, adminCookie);
  const p = o.data.pending.find((u) => u.email === 'czeka@example.com');
  assert.ok(p, 'listed on the owner dashboard');
  assert.equal(o.data.trialDefaults.reports, 60);

  const ok = await call('POST', `/api/admin/users/${p.id}/approve-trial`, { days: 7, reports: 2 }, adminCookie);
  assert.equal(ok.res.status, 200);
  assert.equal(ok.data.user.subStatus, 'trial');
  assert.equal(ok.data.user.trialReports, 2);
  const left = ok.data.user.subUntil - Date.now();
  assert.ok(left > 6.9 * 86400000 && left <= 7 * 86400000);
  const me2 = await call('GET', '/api/me', undefined, reg.cookie);
  assert.equal(me2.data.access.ok, true);
  assert.equal((await call('GET', '/app/', undefined, reg.cookie)).res.status, 200);
});

test('the trial report limit counts the whole trial; paying lifts it', async () => {
  const { one, run } = await import('../lib/db.js');
  const { quotaCheck } = await import('../lib/plans.js');
  const u = one("SELECT * FROM users WHERE email = 'czeka@example.com'");
  const add = (rid, month) => run("INSERT INTO usage(user_id, ts, month, kind, ok, report_id, cost_usd) VALUES (?, ?, ?, 'format', 1, ?, 0)", u.id, Date.now(), month, rid);
  add('r1', '2026-09'); add('r2', '2026-10');
  const q = quotaCheck(one('SELECT * FROM users WHERE id = ?', u.id), 'r3');
  assert.equal(q.ok, false, 'two reports over two months use up a two-report trial');
  assert.equal(q.code, 'quota');
  assert.equal(quotaCheck(one('SELECT * FROM users WHERE id = ?', u.id), 'r2').ok, true, 'a report already counted can be finished');
  run("UPDATE users SET plan = 'pro', sub_status = 'active', sub_until = ? WHERE id = ?", Date.now() + 30 * 86400000, u.id);
  assert.equal(quotaCheck(one('SELECT * FROM users WHERE id = ?', u.id), 'r3').ok, true, 'paid plan uses the plan limit');
});

test('the owner can reject: the account is blocked and logged out', async () => {
  const reg = await call('POST', '/api/auth/register', { email: 'nie@example.com', password: 'niehaslo2026', name: 'Lek. Odrzucona', npwz: '7107919', accept: true });
  const o = await call('GET', '/api/admin/overview', undefined, adminCookie);
  const p = o.data.pending.find((u) => u.email === 'nie@example.com');
  assert.equal((await call('POST', `/api/admin/users/${p.id}/reject-trial`, {}, adminCookie)).res.status, 200);
  const me = await call('GET', '/api/me', undefined, reg.cookie);
  assert.notEqual(me.res.status, 200);
});

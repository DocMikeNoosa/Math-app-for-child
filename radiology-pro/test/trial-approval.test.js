// Free trial for anyone (e.g. from an advert): confirm the e-mail → trial starts by itself; a repeat sign-up (same
// browser, same phone, same licence number, many from one internet address) waits for the owner, who sets days and
// reports. Throwaway mailboxes are refused. The licence number is optional.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

let app, url, adminCookie, db;
before(async () => {
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '';
  process.env.ANTHROPIC_API_KEY = 'x';
  db = await import('../lib/db.js');
  db.openDb(':memory:');
  const { openLearningDb } = await import('../lib/learning.js');
  openLearningDb(':memory:');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
  const { createUser } = await import('../lib/auth.js');
  await createUser({ email: 'owner@example.com', password: 'ownerhaslo123', name: 'Owner', role: 'admin' });
  adminCookie = (await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' })).cookies.rv_sid;
});
after(() => app?.close());

async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  const cookies = {};
  for (const c of res.headers.getSetCookie?.() || []) { const [kv] = c.split(';'); const [k] = kv.split('='); cookies[k === 'radiopis_sid' ? 'rv_sid' : k] = kv; }
  return { res, data, cookies };
}
const lastLink = (email) => {
  const m = db.one('SELECT body FROM outbox WHERE to_addr = ? ORDER BY id DESC LIMIT 1', email)?.body.match(/\/verify\?token=([\w-]+)/);
  return m ? `/verify?token=${m[1]}` : null;
};
const register = (email, extra = {}, cookie) => call('POST', '/api/auth/register', { email, password: 'haslotestowe2026', name: 'Lek. Test', accept: true, ...extra }, cookie);

test('no licence number needed; throwaway mailboxes refused; invalid number refused only when given', async () => {
  assert.equal((await register('kto@mailinator.com')).res.status, 400);
  assert.equal((await register('zly@example.com', { npwz: '1234567' })).res.status, 400);
  const r = await register('anna@example.com');
  assert.equal(r.res.status, 200);
  assert.equal(r.data.next, '/account');
  assert.ok(r.cookies.rv_dev, 'browser id cookie set');
});

test('confirming the e-mail starts the trial automatically, with the trial limits', async () => {
  const r = await call('POST', '/api/auth/login', { email: 'anna@example.com', password: 'haslotestowe2026' });
  const me = await call('GET', '/api/me', undefined, r.cookies.rv_sid);
  assert.equal(me.data.access.code, 'verify');
  assert.equal((await call('POST', '/api/format', {}, r.cookies.rv_sid)).res.status, 402);
  assert.equal((await call('POST', '/api/me/resend-verify', {}, r.cookies.rv_sid)).res.status, 200);
  const link = lastLink('anna@example.com');
  assert.ok(link);
  const v = await call('GET', link, undefined, r.cookies.rv_sid);
  assert.equal(v.res.status, 302);
  assert.equal(v.res.headers.get('location'), '/app/');
  const u = db.one("SELECT * FROM users WHERE email = 'anna@example.com'");
  assert.equal(u.sub_status, 'trial');
  assert.equal(u.trial_reports, 60);
  assert.ok(u.sub_until - Date.now() > 13.9 * 86400000);
  assert.equal((await call('GET', link)).res.headers.get('location'), '/login?verify=bad', 'link works once');
});

test('a second sign-up from the same browser waits for the owner, with the reason shown', async () => {
  const first = db.one("SELECT signup_device FROM users WHERE email = 'anna@example.com'").signup_device;
  await register('anna2@example.com', {}, `rv_dev=${first}`);
  await call('GET', lastLink('anna2@example.com'));
  const u = db.one("SELECT * FROM users WHERE email = 'anna2@example.com'");
  assert.equal(u.sub_status, 'pending');
  assert.match(u.trial_flags, /to samo urządzenie co anna@example.com/);
  const o = await call('GET', '/api/admin/overview', undefined, adminCookie);
  const p = o.data.pending.find((x) => x.email === 'anna2@example.com');
  assert.match(p.trialFlags, /urządzenie/);
  const ok = await call('POST', `/api/admin/users/${p.id}/approve-trial`, { days: 3, reports: 5 }, adminCookie);
  assert.equal(ok.data.user.subStatus, 'trial');
  assert.equal(ok.data.user.trialReports, 5);
});

test('same phone or licence number, or many sign-ups from one address, also wait', async () => {
  await register('tel1@example.com', { phone: '+48 600 100 200' }); await call('GET', lastLink('tel1@example.com'));
  await register('tel2@example.com', { phone: '600100200' }); await call('GET', lastLink('tel2@example.com'));
  assert.match(db.one("SELECT trial_flags FROM users WHERE email = 'tel2@example.com'").trial_flags, /ten sam telefon/);
  await register('pwz1@example.com', { npwz: '5425740' }); await call('GET', lastLink('pwz1@example.com'));
  await register('pwz2@example.com', { npwz: '5425740' }); await call('GET', lastLink('pwz2@example.com'));
  assert.match(db.one("SELECT trial_flags FROM users WHERE email = 'pwz2@example.com'").trial_flags, /numer PWZ/);
  // all these came from 127.0.0.1: beyond 2 per 30 days the address itself is a reason
  assert.match(db.one("SELECT trial_flags FROM users WHERE email = 'pwz2@example.com'").trial_flags, /adresu internetowego/);
});

test('trial limits: whole-trial total and per-day cap; paying lifts them', async () => {
  const { quotaCheck, settings } = await import('../lib/plans.js');
  const u = db.one("SELECT * FROM users WHERE email = 'anna2@example.com'"); // approved: 5 reports
  const add = (rid, ts) => db.run("INSERT INTO usage(user_id, ts, month, kind, ok, report_id, cost_usd) VALUES (?, ?, '2026-10', 'format', 1, ?, 0)", u.id, ts, rid);
  for (let i = 0; i < 4; i++) add(`old${i}`, Date.now() - 3 * 86400000);
  assert.equal(quotaCheck(db.one('SELECT * FROM users WHERE id = ?', u.id), 'n1').ok, true);
  add('n1', Date.now());
  const q = quotaCheck(db.one('SELECT * FROM users WHERE id = ?', u.id), 'n2');
  assert.equal(q.ok, false); assert.match(q.reason, /okresu próbnego/);
  db.run('UPDATE users SET trial_reports = 1000 WHERE id = ?', u.id);
  for (let i = 0; i < settings().trialDailyReports; i++) add(`d${i}`, Date.now());
  const d = quotaCheck(db.one('SELECT * FROM users WHERE id = ?', u.id), 'n3');
  assert.equal(d.ok, false); assert.match(d.reason, /dziennie/);
  db.run("UPDATE users SET plan = 'pro', sub_status = 'active', sub_until = ? WHERE id = ?", Date.now() + 30 * 86400000, u.id);
  assert.equal(quotaCheck(db.one('SELECT * FROM users WHERE id = ?', u.id), 'n3').ok, true);
});

test('the owner can require approval of every trial, and reject one', async () => {
  db.setSetting('appSettings', { ...JSON.parse(db.one("SELECT value FROM settings WHERE key = 'appSettings'")?.value || '{}'), trialApproval: true, trialsPerIp: 1000 });
  await register('reczne@example.com'); await call('GET', lastLink('reczne@example.com'));
  const u = db.one("SELECT * FROM users WHERE email = 'reczne@example.com'");
  assert.equal(u.sub_status, 'pending');
  assert.equal((await call('POST', `/api/admin/users/${u.id}/reject-trial`, {}, adminCookie)).res.status, 200);
  assert.equal(db.one('SELECT blocked FROM users WHERE id = ?', u.id).blocked, 1);
});

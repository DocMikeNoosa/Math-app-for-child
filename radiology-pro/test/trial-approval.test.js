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

test('sign-up needs no licence number; throwaway mailboxes refused', async () => {
  assert.equal((await register('kto@mailinator.com')).res.status, 400);
  const r = await register('anna@example.com', { marketing: true });
  assert.equal(r.res.status, 200);
  assert.equal(r.data.next, '/account');
  assert.ok(r.cookies.rv_dev, 'browser id cookie set');
  assert.equal(db.one("SELECT marketing_ok FROM users WHERE email = 'anna@example.com'").marketing_ok, 1);
});

test('confirming the e-mail starts the trial automatically, with the trial limits', async () => {
  const r = await call('POST', '/api/auth/login', { email: 'anna@example.com', password: 'haslotestowe2026' });
  const me = await call('GET', '/api/me', undefined, r.cookies.rv_sid);
  assert.equal(me.data.access.code, 'verify');
  assert.equal((await call('POST', '/api/format', {}, r.cookies.rv_sid)).res.status, 402);
  assert.equal((await call('POST', '/api/me/resend-verify', {}, r.cookies.rv_sid)).res.status, 200);
  const link = lastLink('anna@example.com');
  const v = await call('GET', link, undefined, r.cookies.rv_sid);
  assert.equal(v.res.headers.get('location'), '/app/');
  const u = db.one("SELECT * FROM users WHERE email = 'anna@example.com'");
  assert.equal(u.sub_status, 'trial');
  assert.equal(u.trial_reports, 60);
  assert.equal((await call('GET', link)).res.headers.get('location'), '/login?verify=bad', 'link works once');
});

test('hospital: colleagues on one shared computer start trials normally; beyond the limit the next one waits', async () => {
  const pc = db.one("SELECT signup_device FROM users WHERE email = 'anna@example.com'").signup_device;
  for (const who of ['kolega1', 'kolega2']) {
    await register(`${who}@szpital.pl`, {}, `rv_dev=${pc}`);
    await call('GET', lastLink(`${who}@szpital.pl`));
    assert.equal(db.one('SELECT sub_status FROM users WHERE email = ?', `${who}@szpital.pl`).sub_status, 'trial', `${who} starts at once`);
  }
  await register('kolega3@szpital.pl', {}, `rv_dev=${pc}`);
  await call('GET', lastLink('kolega3@szpital.pl'));
  const u = db.one("SELECT * FROM users WHERE email = 'kolega3@szpital.pl'");
  assert.equal(u.sub_status, 'pending', '4th trial from one computer in 90 days waits');
  assert.match(u.trial_flags, /4\. konto z tego samego komputera/);
  const o = await call('GET', '/api/admin/overview', undefined, adminCookie);
  const p = o.data.pending.find((x) => x.email === 'kolega3@szpital.pl');
  const ok = await call('POST', `/api/admin/users/${p.id}/approve-trial`, { days: 3, reports: 5 }, adminCookie);
  assert.equal(ok.data.user.subStatus, 'trial');
  assert.equal(ok.data.user.trialReports, 5);
});

test('same phone number = the same person: waits; one internet address allows several colleagues first', async () => {
  await register('tel1@example.com', { phone: '+48 600 100 200' }); await call('GET', lastLink('tel1@example.com'));
  await register('tel2@example.com', { phone: '600100200' }); await call('GET', lastLink('tel2@example.com'));
  assert.match(db.one("SELECT trial_flags FROM users WHERE email = 'tel2@example.com'").trial_flags, /ten sam telefon/);
  // all sign-ups in this test come from 127.0.0.1 (like one hospital): by now more than 5 in 30 days
  assert.match(db.one("SELECT trial_flags FROM users WHERE email = 'tel2@example.com'").trial_flags, /adresu internetowego/);
  assert.doesNotMatch(db.one("SELECT trial_flags FROM users WHERE email = 'kolega1@szpital.pl'").trial_flags, /adresu/);
});

test('cost guards: a flood of sign-ups, or the monthly trial AI budget used up, makes new trials wait', async () => {
  const { trialFlags } = await import('../lib/trial-guard.js');
  const fresh = { id: -1, signup_device: 'nowe-urzadzenie-0001', signup_ip: '10.9.9.9', phone: '' };
  assert.deepEqual(trialFlags(fresh, { trialsPerDay: 1000, trialBudgetPln: 0 }), []);
  assert.match(trialFlags(fresh, { trialsPerDay: 2, trialBudgetPln: 0 }).join(), /na dobę/);
  const u = db.one("SELECT id FROM users WHERE email = 'anna@example.com'");
  db.run("INSERT INTO usage(user_id, ts, month, kind, ok, report_id, cost_usd) VALUES (?, ?, ?, 'format', 1, 'drogi', 100)", u.id, Date.now(), new Date().toISOString().slice(0, 7));
  assert.match(trialFlags(fresh, { trialsPerDay: 1000, trialBudgetPln: 300, usdPln: 3.65 }).join(), /budżet AI okresów próbnych wyczerpany/);
  db.run("DELETE FROM usage WHERE report_id = 'drogi'");
});
test('trial limits: whole-trial total and per-day cap; paying lifts them', async () => {
  const { quotaCheck, settings } = await import('../lib/plans.js');
  const u = db.one("SELECT * FROM users WHERE email = 'kolega3@szpital.pl'"); // approved: 5 reports
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

test('owner: trials overview with costs, and a standard e-mail only to people who agreed, never twice a week', async () => {
  db.setSetting('appSettings', { ...JSON.parse(db.one("SELECT value FROM settings WHERE key = 'appSettings'")?.value || '{}'), trialApproval: false });
  const t = await call('GET', '/api/admin/trials', undefined, adminCookie);
  assert.equal(t.res.status, 200);
  assert.ok(t.data.summary.active >= 3);
  assert.match(t.data.template.body, /\{imię\}/);
  const body = { audience: 'active', subject: 'Jak Ci idzie?', body: 'Dzień dobry {imię}, {okres} {link}', onlyConsent: true };
  const prev = await call('POST', '/api/admin/trials/message', { ...body, preview: true }, adminCookie);
  assert.deepEqual(prev.data.emails, ['anna@example.com'], 'only the person who agreed to offers');
  const sent = await call('POST', '/api/admin/trials/message', body, adminCookie);
  assert.equal(sent.data.sent, 1);
  const mail = db.one("SELECT * FROM outbox WHERE to_addr = 'anna@example.com' ORDER BY id DESC LIMIT 1");
  assert.equal(mail.subject, 'Jak Ci idzie?');
  assert.match(mail.body, /okres próbny trwa do/);
  assert.match(mail.body, /\/account/);
  assert.doesNotMatch(mail.body, /\{/);
  assert.equal((await call('POST', '/api/admin/trials/message', { ...body, preview: true }, adminCookie)).data.count, 0, 'not again within 7 days');
});

test('trial ends: one automatic e-mail, access stops', async () => {
  const { runJobs } = await import('../lib/jobs.js');
  const u = db.one("SELECT * FROM users WHERE email = 'kolega1@szpital.pl'");
  db.run('UPDATE users SET sub_until = ? WHERE id = ?', Date.now() - 1000, u.id);
  await runJobs();
  await runJobs();
  const mails = db.all("SELECT * FROM outbox WHERE to_addr = 'kolega1@szpital.pl' AND subject LIKE '%zakończył%'");
  assert.equal(mails.length, 1);
  assert.equal(db.one('SELECT sub_status FROM users WHERE id = ?', u.id).sub_status, 'expired');
});

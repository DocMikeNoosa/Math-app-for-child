// Accounts, subscriptions, quotas, usage metering, administrator API, Stripe webhooks, sync, security.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock;
let app;
let url;
let mockCalls = 0;

before(async () => {
  // mock Anthropic API: every call "costs" 1000 input + 500 output tokens, 8000 cache-read tokens
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      mockCalls++;
      const isLearn = /You study how one radiologist/.test(body);
      const text = isLearn
        ? JSON.stringify({ rules: ['R'], phrases: [], questions: [], glossary: [], summary: 's' })
        : JSON.stringify({ edits: [{ op: 'insert', target: 'TOP', text: 'Krwiak podtwardówkowy po stronie lewej.', reason: '' }], conclusion: '- Krwiak podtwardówkowy po stronie lewej.', warnings: [] });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 500, cache_read_input_tokens: 8000, cache_creation_input_tokens: 0 } }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  delete process.env.AI_PROVIDER;
  delete process.env.RESEND_API_KEY;
  const { openDb, setSetting } = await import('../lib/db.js');
  openDb(':memory:');
  setSetting('appSettings', { trialApproval: false, verifyEmail: false, trialsPerIp: 1000 }); // trials start at once here (sign-up checks: test/trial-approval)
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
  const { createUser } = await import('../lib/auth.js');
  await createUser({ email: 'admin@example.com', password: 'adminhaslo123', name: 'Admin', role: 'admin' });
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
  return r.cookie;
}
const report = () => reportFromTemplate(getTemplate('ct_head_normal'));
const format = (cookie, reportId) => call('POST', '/api/format', { templateId: 'ct_head_normal', report: report(), dictation: 'krwiak podtwardówkowy', reportId }, cookie);

test('registration creates a trial account and logs in; weak passwords and duplicates are refused', async () => {
  let r = await call('POST', '/api/auth/register', { email: 'a@example.com', password: 'krotkie', name: 'A', npwz: '8139595', accept: true });
  assert.equal(r.res.status, 400);
  r = await call('POST', '/api/auth/register', { email: 'a@example.com', password: 'dobrehaslo123', name: 'A', npwz: '8187109' });
  assert.equal(r.res.status, 400, 'terms must be accepted');
  r = await call('POST', '/api/auth/register', { email: 'A@Example.com', password: 'dobrehaslo123', name: 'Anna Nowak', npwz: '2147514', accept: true });
  assert.equal(r.res.status, 200);
  assert.match(r.cookie, /^radiopis_sid=/);
  const me = await call('GET', '/api/me', undefined, r.cookie);
  assert.equal(me.data.user.email, 'a@example.com', 'e-mail stored in lower case');
  assert.equal(me.data.user.subStatus, 'trial');
  assert.equal(me.data.access.ok, true);
  assert.ok(me.data.user.subUntil > Date.now() + 13 * 86400000);
  assert.ok(!('pwd' in me.data.user), 'no password hash leaves the server');
  r = await call('POST', '/api/auth/register', { email: 'a@example.com', password: 'dobrehaslo123', name: 'A', npwz: '9155433', accept: true });
  assert.equal(r.res.status, 409);
});

test('login: wrong password, rate limiting and logout', async () => {
  let r = await call('POST', '/api/auth/login', { email: 'a@example.com', password: 'zlehaslo000' });
  assert.equal(r.res.status, 401);
  const cookie = await login('a@example.com', 'dobrehaslo123');
  r = await call('POST', '/api/auth/logout', {}, cookie);
  assert.equal(r.res.status, 200);
  r = await call('GET', '/api/me', undefined, cookie);
  assert.equal(r.res.status, 401, 'the session is gone after logout');
  // 8 failures lock the e-mail for 15 minutes
  for (let i = 0; i < 8; i++) await call('POST', '/api/auth/login', { email: 'locked@example.com', password: 'x' });
  r = await call('POST', '/api/auth/login', { email: 'locked@example.com', password: 'x' });
  assert.equal(r.res.status, 429);
  (await import('../lib/auth.js')).resetRateLimits();
});

test('AI calls are metered per report; several calls for one report count once', async () => {
  const cookie = await login('a@example.com', 'dobrehaslo123');
  for (const id of ['rep-1', 'rep-1', 'rep-1', 'rep-2']) {
    const r = await format(cookie, id);
    assert.equal(r.res.status, 200, JSON.stringify(r.data));
    assert.ok(!('usage' in r.data), 'token usage is not sent to the browser');
  }
  const me = await call('GET', '/api/me', undefined, cookie);
  assert.equal(me.data.usage.reports, 2);
  const admin = await login('admin@example.com', 'adminhaslo123');
  const users = await call('GET', '/api/admin/users?q=a@example', undefined, admin);
  const row = users.data.users.find((u) => u.email === 'a@example.com');
  assert.equal(row.reports, 2);
  assert.equal(row.calls, 4);
  // 4 calls × (1000 × $4 + 500 × $20 + 8000 × $0.20) / 1e6 = 4 × 0.0156 = $0.0624
  assert.ok(Math.abs(row.costUsd - 0.0624) < 1e-9, String(row.costUsd));
});

test('monthly quota with 10 % grace; admin override lifts it', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  const r0 = await call('POST', '/api/auth/register', { email: 'q@example.com', password: 'dobrehaslo123', name: 'Q', npwz: '5163352', accept: true });
  const cookie = r0.cookie;
  const id = (await call('GET', '/api/admin/users?q=q@example', undefined, admin)).data.users[0].id;
  // a paying user (a trial has its own whole-trial limit — test/trial-approval)
  await call('POST', `/api/admin/users/${id}/extend`, { plan: 'pro', interval: 'month', count: 1, provider: 'free' }, admin);
  await call('PATCH', `/api/admin/users/${id}`, { quotaOverride: 2 }, admin);
  assert.equal((await format(cookie, 'a')).res.status, 200);
  assert.equal((await format(cookie, 'b')).res.status, 200);
  const third = await format(cookie, 'c'); // quota 2 → hard limit ceil(2 × 1.1) = 3
  assert.equal(third.res.status, 200);
  assert.equal(third.data.quota.warn, true, 'over the quota: the browser is warned');
  const fourth = await format(cookie, 'd');
  assert.equal(fourth.res.status, 402);
  assert.equal(fourth.data.code, 'quota');
  assert.equal((await format(cookie, 'a')).res.status, 200, 'more calls for a report already counted are allowed');
  await call('PATCH', `/api/admin/users/${id}`, { quotaOverride: null }, admin);
  assert.equal((await format(cookie, 'd')).res.status, 200);
});

test('expired subscription: no AI, app redirects to the account page; extension restores access', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  const r0 = await call('POST', '/api/auth/register', { email: 'e@example.com', password: 'dobrehaslo123', name: 'E', npwz: '1171271', accept: true });
  const cookie = r0.cookie;
  const id = (await call('GET', '/api/admin/users?q=e@example', undefined, admin)).data.users[0].id;
  await call('PATCH', `/api/admin/users/${id}`, { subUntil: Date.now() - 1000 }, admin);
  let r = await format(cookie, 'x');
  assert.equal(r.res.status, 402);
  assert.equal(r.data.code, 'expired');
  const page = await fetch(`${url}/app/`, { headers: { Cookie: cookie }, redirect: 'manual' });
  assert.equal(page.status, 302);
  assert.match(page.headers.get('location'), /^\/account/);
  r = await call('POST', `/api/admin/users/${id}/extend`, { plan: 'pro', interval: 'month', count: 1, provider: 'transfer', amountPln: 399, ref: 'FV/1/2026' }, admin);
  assert.equal(r.res.status, 200);
  assert.equal(r.data.user.plan, 'pro');
  assert.equal(r.data.user.subStatus, 'active');
  assert.ok(r.data.user.subUntil > Date.now() + 27 * 86400000);
  assert.equal((await format(cookie, 'x')).res.status, 200);
  const pays = await call('GET', '/api/admin/payments', undefined, admin);
  assert.ok(pays.data.payments.some((p) => p.ref === 'FV/1/2026' && p.amount_pln === 399));
});

test('blocked user is logged out and cannot log in', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  const r0 = await call('POST', '/api/auth/register', { email: 'b@example.com', password: 'dobrehaslo123', name: 'B', npwz: '3179190', accept: true });
  const id = (await call('GET', '/api/admin/users?q=b@example', undefined, admin)).data.users[0].id;
  await call('PATCH', `/api/admin/users/${id}`, { blocked: true }, admin);
  assert.equal((await call('GET', '/api/me', undefined, r0.cookie)).res.status, 401);
  assert.equal((await call('POST', '/api/auth/login', { email: 'b@example.com', password: 'dobrehaslo123' })).res.status, 403);
});

test('device limit: the oldest session is logged out (no account sharing)', async () => {
  const { planById } = await import('../lib/plans.js');
  const max = planById('trial').devices;
  const cookies = [];
  for (let i = 0; i <= max; i++) cookies.push(await login('a@example.com', 'dobrehaslo123'));
  assert.equal((await call('GET', '/api/me', undefined, cookies[0])).res.status, 401, 'oldest session dropped');
  assert.equal((await call('GET', '/api/me', undefined, cookies.at(-1))).res.status, 200);
});

test('non-admins cannot use the admin API or page', async () => {
  const cookie = await login('a@example.com', 'dobrehaslo123');
  assert.equal((await call('GET', '/api/admin/overview', undefined, cookie)).res.status, 403);
  const page = await fetch(`${url}/admin`, { headers: { Cookie: cookie }, redirect: 'manual' });
  assert.equal(page.status, 302);
  assert.equal((await call('GET', '/api/admin/overview')).res.status, 401);
});

test('admin overview, plans, settings, exports and audit log', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  const o = await call('GET', '/api/admin/overview', undefined, admin);
  assert.equal(o.res.status, 200);
  assert.ok(o.data.users.total >= 4);
  assert.ok(o.data.ai.reports >= 4 && o.data.ai.costUsd > 0);
  assert.ok(o.data.mrrPln >= 399, 'the extended Pro user counts in MRR');
  let r = await call('GET', '/api/admin/plans', undefined, admin);
  const plans = r.data.plans.map((p) => (p.id === 'start' ? { ...p, pricePln: 199 } : p));
  r = await call('PUT', '/api/admin/plans', { plans }, admin);
  assert.equal(r.data.plans.find((p) => p.id === 'start').pricePln, 199);
  r = await call('PUT', '/api/admin/plans', { plans: plans.filter((p) => p.id !== 'trial') }, admin);
  assert.equal(r.res.status, 400, 'the trial plan cannot be removed');
  r = await call('PUT', '/api/admin/settings', { usdPln: 4, trialDays: 7, bankAccount: 'PL00 1234' }, admin);
  assert.equal(r.data.settings.usdPln, 4);
  const pub = await call('GET', '/api/plans');
  assert.ok(!pub.data.plans.some((p) => p.id === 'trial'), 'trial is not a public plan');
  assert.ok(!pub.data.plans.some((p) => 'stripePrice' in p), 'Stripe ids are not public');
  const csvRes = await fetch(`${url}/api/admin/export/users.csv`, { headers: H(admin) });
  const csv = await csvRes.text();
  assert.match(csvRes.headers.get('content-type'), /text\/csv/);
  assert.match(csv, /a@example\.com/);
  assert.ok(!/scrypt\$/.test(csv), 'no password hashes in exports');
  const audit = await call('GET', '/api/admin/audit', undefined, admin);
  assert.ok(audit.data.audit.some((a) => a.action === 'plans.update'));
  assert.ok(audit.data.audit.some((a) => a.action === 'subscription.extend'));
});

test('admin creates a user with an invitation link; the link sets the password once', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  const r = await call('POST', '/api/admin/users', { email: 'inv@example.com', name: 'Zaproszony', plan: 'start', amountPln: 0 }, admin);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.user.plan, 'start');
  assert.equal(r.data.user.subStatus, 'active');
  const token = new URL(r.data.link).searchParams.get('token');
  assert.equal((await call('POST', '/api/auth/reset-check', { token })).res.status, 200);
  const set = await call('POST', '/api/auth/reset', { token, password: 'nowehaslo123' });
  assert.equal(set.res.status, 200);
  assert.equal((await call('POST', '/api/auth/reset', { token, password: 'innehaslo123' })).res.status, 400, 'one use only');
  await login('inv@example.com', 'nowehaslo123');
  const out = await call('GET', '/api/admin/outbox', undefined, admin);
  assert.ok(out.data.outbox.some((m) => m.to_addr === 'inv@example.com' && m.status === 'logged'), 'without a mail provider the e-mail is kept in the outbox');
});

test('password reset request answers the same for unknown e-mails', async () => {
  const a = await call('POST', '/api/auth/forgot', { email: 'a@example.com' });
  const b = await call('POST', '/api/auth/forgot', { email: 'nobody@example.com' });
  assert.equal(a.res.status, 200);
  assert.deepEqual(a.data, b.data);
});

function stripeSig(payload, secret = 'whsec_test', t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex')}`;
}

test('Stripe webhook: signature required; subscription and invoice update the account (idempotent)', async () => {
  const admin = await login('admin@example.com', 'adminhaslo123');
  // give plan "max" a Stripe price
  const plans = (await call('GET', '/api/admin/plans', undefined, admin)).data.plans.map((p) => (p.id === 'max' ? { ...p, stripePrice: 'price_max_m' } : p));
  await call('PUT', '/api/admin/plans', { plans }, admin);
  const uid = (await call('GET', '/api/admin/users?q=a@example', undefined, admin)).data.users[0].id;
  const end = Math.floor(Date.now() / 1000) + 30 * 86400;
  const event = { id: 'evt_1', type: 'customer.subscription.updated', data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', metadata: { user_id: String(uid) }, items: { data: [{ current_period_end: end, price: { id: 'price_max_m' } }] } } } };
  const payload = JSON.stringify(event);
  let res = await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(payload, 'wrong') }, body: payload });
  assert.equal(res.status, 400, 'bad signature refused');
  res = await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(payload, 'whsec_test', Math.floor(Date.now() / 1000) - 3600) }, body: payload });
  assert.equal(res.status, 400, 'old signature refused (replay)');
  res = await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(payload) }, body: payload });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).result, 'ok');
  res = await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(payload) }, body: payload });
  assert.equal((await res.json()).result, 'duplicate');
  let row = (await call('GET', `/api/admin/users/${uid}`, undefined, admin)).data.user;
  assert.equal(row.plan, 'max');
  assert.equal(row.subStatus, 'active');
  assert.equal(row.subUntil, end * 1000);
  const inv = JSON.stringify({ id: 'evt_2', type: 'invoice.paid', data: { object: { id: 'in_1', customer: 'cus_1', subscription: 'sub_1', amount_paid: 92127, currency: 'pln', lines: { data: [{ period: { end } }] } } } });
  await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(inv) }, body: inv });
  const detail = (await call('GET', `/api/admin/users/${uid}`, undefined, admin)).data;
  assert.ok(detail.payments.some((p) => p.ref === 'in_1' && p.amount_pln === 921.27));
  const failed = JSON.stringify({ id: 'evt_3', type: 'invoice.payment_failed', data: { object: { id: 'in_2', customer: 'cus_1' } } });
  await fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Stripe-Signature': stripeSig(failed) }, body: failed });
  row = (await call('GET', `/api/admin/users/${uid}`, undefined, admin)).data.user;
  assert.equal(row.subStatus, 'past_due');
  assert.equal(row.access, true, 'past due keeps access for the grace days');
});

test('settings sync between devices: only known keys, size-limited, per user', async () => {
  const cookie = await login('a@example.com', 'dobrehaslo123');
  let r = await call('PUT', '/api/sync/radvox.profile.v1', { value: '{"rules":["x"]}' }, cookie);
  assert.equal(r.res.status, 200);
  r = await call('PUT', '/api/sync/radvox.learned.v1', { value: '{"exampleReports":[{"body":"PESEL 85010112345 krwiak"}]}' }, cookie);
  assert.equal(r.res.status, 200, 'what the AI learns from corrections is synced too');
  r = await call('GET', '/api/sync', undefined, cookie);
  assert.ok(!r.data['radvox.learned.v1'].value.includes('85010112345'), 'PESEL removed before storing');
  assert.ok(r.data['radvox.learned.v1'].value.includes('[PESEL]'));
  r = await call('PUT', '/api/sync/evil.key', { value: 'x' }, cookie);
  assert.equal(r.res.status, 400);
  r = await call('GET', '/api/sync', undefined, cookie);
  assert.equal(r.data['radvox.profile.v1'].value, '{"rules":["x"]}');
  const other = await login('inv@example.com', 'nowehaslo123');
  r = await call('GET', '/api/sync', undefined, other);
  assert.deepEqual(r.data, {}, 'users never see each other\'s data');
});

test('security headers and public pages', async () => {
  const res = await fetch(`${url}/`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  for (const p of ['/login', '/register', '/forgot', '/privacy', '/terms']) assert.equal((await fetch(`${url}${p}`)).status, 200, p);
  assert.equal((await fetch(`${url}/app/js/templates-pro/abdomen.js`, { redirect: 'manual' })).status, 302, 'templates are not public');
});

test('jobs: expiry and reminders', async () => {
  const { runJobs } = await import('../lib/jobs.js');
  const { run, one } = await import('../lib/db.js');
  const u = one("SELECT id FROM users WHERE email = 'e@example.com'");
  run("UPDATE users SET sub_until = ?, sub_status = 'active', reminded = 0, stripe_sub = NULL WHERE id = ?", Date.now() + 3 * 86400000, u.id);
  let done = await runJobs();
  assert.ok(done.reminded >= 1);
  done = await runJobs();
  assert.equal(one('SELECT reminded FROM users WHERE id = ?', u.id).reminded, 7, 'the 7-day reminder is sent once');
  run('UPDATE users SET sub_until = ? WHERE id = ?', Date.now() - 1000, u.id);
  await runJobs();
  assert.equal(one('SELECT sub_status FROM users WHERE id = ?', u.id).sub_status, 'expired');
});

test('cost guard: background pre-processing is capped per report; "Przygotuj opis" is not', async () => {
  const cookie = await login('a@example.com', 'dobrehaslo123');
  const bg = (id) => call('POST', '/api/format', { templateId: 'ct_head_normal', report: report(), dictation: 'krwiak', reportId: id, background: true }, cookie);
  for (let i = 0; i < 4; i++) assert.equal((await bg('bg-1')).res.status, 200);
  const fifth = await bg('bg-1');
  assert.equal(fifth.res.status, 429);
  assert.equal(fifth.data.code, 'bg_limit');
  assert.equal((await format(cookie, 'bg-1')).res.status, 200, 'the explicit request still works');
});

test('licence number check digit (NPWZ): optional at sign-up, but a given number must be well-formed', async () => {
  const { validNpwz } = await import('../lib/npwz.js');
  assert.ok(validNpwz('5425740'));
  assert.ok(!validNpwz('1234567'), 'wrong check digit');
  assert.ok(!validNpwz('0123456') && !validNpwz('542574') && !validNpwz('abcdefg'));
});

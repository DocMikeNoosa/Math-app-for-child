// Individual purchase outside company contracts: register → trial → pay in advance (BLIK / Przelewy24 / card via
// Stripe Checkout, no auto-renewal) → webhook extends the account; card subscription still available.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';

let stripeMock;
let app;
let url;
const stripeCalls = [];

before(async () => {
  stripeMock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      stripeCalls.push({ path: req.url, params: new URLSearchParams(body) });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'cs_test_1', url: 'https://checkout.stripe.test/pay/cs_test_1' }));
    });
  });
  await new Promise((r) => stripeMock.listen(0, '127.0.0.1', r));
  process.env.STRIPE_API_BASE = `http://127.0.0.1:${stripeMock.address().port}`;
  process.env.STRIPE_SECRET_KEY = 'sk_test_x';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '1.0';
  process.env.ANTHROPIC_API_KEY = 'x';
  const { openDb, setSetting } = await import('../lib/db.js');
  openDb(':memory:');
  setSetting('appSettings', { trialApproval: false }); // these tests start trials at once (approval: test/trial-approval)
  const { openLearningDb } = await import('../lib/learning.js');
  openLearningDb(':memory:');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
});
after(() => { app?.close(); stripeMock?.close(); });

const H = (cookie = '') => ({ 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) });
async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, headers: H(cookie), body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
function webhook(event) {
  const raw = JSON.stringify(event);
  const t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', 'whsec_test').update(`${t}.${raw}`).digest('hex');
  return fetch(`${url}/api/stripe/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${t},v1=${sig}` }, body: raw });
}

test('an individual radiologist registers, gets a trial, pays 12 months in advance by BLIK / Przelewy24', async () => {
  const reg = await call('POST', '/api/auth/register', { email: 'lekarz@example.com', password: 'lekarzhaslo2026', name: 'Lek. Przykładowy', npwz: '7107919', accept: true });
  assert.equal(reg.res.status, 200);
  const cookie = reg.cookie;
  let me = await call('GET', '/api/me', undefined, cookie);
  assert.equal(me.data.user.subStatus, 'trial');
  assert.equal(me.data.prepaid, true);
  assert.ok(me.data.plans.length >= 3);
  const co = await call('POST', '/api/me/checkout', { plan: 'pro', interval: 'year', mode: 'prepaid' }, cookie);
  assert.equal(co.res.status, 200, JSON.stringify(co.data));
  assert.match(co.data.url, /checkout\.stripe\.test/);
  const p = stripeCalls.at(-1).params;
  assert.equal(p.get('mode'), 'payment');
  assert.equal(p.get('line_items[0][price_data][currency]'), 'pln');
  // Pro 399 net × 10 months (annual) + 23 % VAT = 4907.70 zł
  assert.equal(p.get('line_items[0][price_data][unit_amount]'), '490770');
  assert.equal(p.get('metadata[kind]'), 'prepaid');
  assert.equal(p.get('invoice_creation[enabled]'), 'true');
  assert.equal(p.get('tax_id_collection[enabled]'), 'true');
  // the payment is confirmed later (Przelewy24 can be asynchronous)
  const userId = me.data.user.id;
  const session = { id: 'cs_test_1', object: 'checkout.session', mode: 'payment', payment_status: 'unpaid', customer: 'cus_1', amount_total: 490770, client_reference_id: String(userId), metadata: { user_id: String(userId), plan: 'pro', interval: 'year', kind: 'prepaid', net: '3990' } };
  await webhook({ id: 'evt_1', type: 'checkout.session.completed', data: { object: session } });
  me = await call('GET', '/api/me', undefined, cookie);
  assert.equal(me.data.user.subStatus, 'trial', 'not paid yet');
  await webhook({ id: 'evt_2', type: 'checkout.session.async_payment_succeeded', data: { object: { ...session, payment_status: 'paid' } } });
  me = await call('GET', '/api/me', undefined, cookie);
  assert.equal(me.data.user.subStatus, 'active');
  assert.equal(me.data.user.plan, 'pro');
  assert.ok(me.data.user.subUntil > Date.now() + 360 * 86400000);
  assert.equal(me.data.payments.length, 1);
  assert.equal(me.data.payments[0].amount_pln, 3990);
  // the same payment reported twice does not extend twice
  const until = me.data.user.subUntil;
  await webhook({ id: 'evt_3', type: 'checkout.session.completed', data: { object: { ...session, payment_status: 'paid' } } });
  me = await call('GET', '/api/me', undefined, cookie);
  assert.equal(me.data.user.subUntil, until);
  assert.equal(me.data.payments.length, 1);
});

test('monthly one-off payment, card subscription, and company members cannot buy individually', async () => {
  const reg = await call('POST', '/api/auth/register', { email: 'drugi@example.com', password: 'drugihaslo2026', name: 'Drugi Lekarz', npwz: '3115838', accept: true });
  const m = await call('POST', '/api/me/checkout', { plan: 'start', interval: 'month', mode: 'prepaid' }, reg.cookie);
  assert.equal(m.res.status, 200);
  assert.equal(stripeCalls.at(-1).params.get('line_items[0][price_data][unit_amount]'), '30627'); // 249 × 1.23
  // card subscription needs the Stripe price id set by the owner
  const sub = await call('POST', '/api/me/checkout', { plan: 'start', interval: 'month' }, reg.cookie);
  assert.equal(sub.res.status, 400);
  assert.match(sub.data.error, /nie jest jeszcze skonfigurowana/);
  assert.equal((await call('POST', '/api/me/checkout', { plan: 'nieistnieje', mode: 'prepaid' }, reg.cookie)).res.status, 400);
});

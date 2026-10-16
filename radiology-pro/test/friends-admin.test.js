// Friends, the owner's side and the friend's first steps: invitation link, one-tick disclaimer, key check with a clear
// reason, suspend / restore, moving a friend to a trial, to "must pay" or to a free paid plan — and back.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock, app, url, db, owner;
let reply = { status: 200, error: null };
const ok = { id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify({ edits: [], conclusion: '- Bez zmian.', warnings: [] }) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } };

before(async () => {
  mock = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      res.writeHead(reply.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(reply.status === 200 ? ok : { type: 'error', error: reply.error }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  Object.assign(process.env, { ANTHROPIC_API_KEY: 'owner-service-key', ANTHROPIC_BASE_URL: `http://127.0.0.1:${mock.address().port}`, KEYS_SECRET: 'test-secret', DB_FILE: ':memory:', BACKUP_DISABLED: '1', TERMS_VERSION: '1.1' });
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
  owner = (await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' })).cookie;
});
after(() => { app?.close(); mock?.close(); });

async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, text: data ? '' : await res.text(), cookie: (res.headers.get('set-cookie') || '').split(';')[0] };
}
const tpl = getTemplate('ct_head_normal');
const format = (cookie, reportId) => call('POST', '/api/format', { templateId: 'ct_head_normal', report: reportFromTemplate(tpl), dictation: 'bez zmian', reportId }, cookie);
const KEY = 'sk-ant-api03-FRIENDKEY-abcdefghijklmnopqrstuvwxyz9876';
let anna, annaCookie;

test('owner adds a friend: account + ready message with the link and the key guide; the friend does the rest', async () => {
  const r = await call('POST', '/api/admin/friends', { name: 'Lek. Anna Kowalska', email: 'anna@example.com', sendEmail: true }, owner);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  anna = r.data.user.id;
  assert.equal(r.data.user.state, 'invited');
  assert.match(r.data.message, /^Cześć Anna!/);
  assert.ok(r.data.message.includes(r.data.link));
  assert.match(r.data.message, /\/klucz-api/);
  assert.equal(r.data.mailed, true);
  assert.match(db.one("SELECT body FROM outbox WHERE to_addr = 'anna@example.com'").body, /\/reset\?token=/);
  // the friend sets a password → one tick → straight to the key guide on the account page
  const set = await call('POST', '/api/auth/reset', { token: r.data.link.split('token=')[1], password: 'annahaslo2026' });
  annaCookie = set.cookie;
  assert.equal(set.data.next, '/accept', 'the disclaimer comes first');
  assert.equal((await format(annaCookie, 'a0')).data.code, 'terms', 'no AI before the disclaimer is accepted');
  assert.equal((await call('POST', '/api/me/accept', { accept: false }, annaCookie)).res.status, 400);
  const acc = await call('POST', '/api/me/accept', { accept: true }, annaCookie);
  assert.equal(acc.data.next, '/account?klucz=1');
  assert.equal(db.one('SELECT terms_version FROM users WHERE id = ?', anna).terms_version, '1.1');
  const list = await call('GET', '/api/admin/friends', undefined, owner);
  assert.equal(list.data.friends.find((f) => f.id === anna).state, 'nokey');
});

test('the key is tested before it is saved, with a reason the friend can act on', async () => {
  const tryKey = async (status, error) => { reply = { status, error }; const r = await call('POST', '/api/me/api-key', { key: KEY }, annaCookie); reply = { status: 200, error: null }; return r; };
  let r = await tryKey(401, { type: 'authentication_error', message: 'invalid x-api-key' });
  assert.equal(r.res.status, 400);
  assert.match(r.data.error, /błędny, wyłączony albo wygasł/);
  r = await tryKey(400, { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' });
  assert.match(r.data.error, /nie ma środków/);
  r = await tryKey(400, { type: 'invalid_request_error', message: 'anthropic-workspace-id is required when authenticating with an identity-linked API key' });
  assert.match(r.data.error, /workspace „Default”/);
  assert.equal(db.one('SELECT api_key_enc FROM users WHERE id = ?', anna).api_key_enc, '', 'a key that does not work is not saved');
  // Anthropic busy: not the key's fault → saved, checked again at the first report
  r = await tryKey(529, { type: 'overloaded_error', message: 'Overloaded' });
  assert.equal(r.res.status, 200);
  assert.equal(r.data.keyChecked, false);
  r = await call('POST', '/api/me/api-key', { key: KEY }, annaCookie);
  assert.equal(r.data.keyChecked, true);
  assert.equal((await format(annaCookie, 'a1')).res.status, 200);
  // later the friend's credit runs out: a plain message, not a server alarm
  reply = { status: 400, error: { type: 'invalid_request_error', message: 'Your credit balance is too low' } };
  const out = await format(annaCookie, 'a2');
  reply = { status: 200, error: null };
  assert.equal(out.res.status, 402);
  assert.match(out.data.error, /Doładuj/);
});

test('suspend and restore: the friend cannot log in while suspended, the key survives', async () => {
  await call('PATCH', `/api/admin/users/${anna}`, { blocked: true }, owner);
  const login = await call('POST', '/api/auth/login', { email: 'anna@example.com', password: 'annahaslo2026' });
  assert.equal(login.res.status, 403);
  assert.equal((await call('GET', '/api/admin/friends', undefined, owner)).data.friends.find((f) => f.id === anna).state, 'suspended');
  await call('PATCH', `/api/admin/users/${anna}`, { blocked: false }, owner);
  annaCookie = (await call('POST', '/api/auth/login', { email: 'anna@example.com', password: 'annahaslo2026' })).cookie;
  assert.equal((await format(annaCookie, 'a3')).res.status, 200, 'works again with the same key');
});

test('a fresh invitation link when the first one got lost', async () => {
  const r = await call('POST', '/api/admin/friends', { name: 'Piotr Nowak', email: 'piotr@example.com' }, owner);
  const again = await call('POST', `/api/admin/users/${r.data.user.id}/invite-link`, {}, owner);
  assert.match(again.data.link, /\/reset\?token=/);
  assert.notEqual(again.data.link, r.data.link);
  const used = await call('POST', `/api/admin/users/${anna}/invite-link`, {}, owner);
  assert.match(used.data.link, /\/login$/, 'someone who already logged in just gets the login page');
});

test('owner moves a friend to a trial, to "must pay", to a free paid plan, and back to friend', async () => {
  const change = (body) => call('POST', `/api/admin/users/${anna}/change-access`, { notify: true, ...body }, owner);
  let r = await change({ mode: 'trial', days: 7, reports: 20 });
  assert.equal(r.res.status, 200);
  let u = db.one('SELECT * FROM users WHERE id = ?', anna);
  assert.equal(u.sub_status, 'trial');
  assert.equal(u.trial_reports, 20);
  assert.equal(u.api_key_enc, '', 'own key no longer needed → wiped');
  assert.match(db.one("SELECT body FROM outbox WHERE to_addr = 'anna@example.com' ORDER BY id DESC LIMIT 1").body, /okresie próbnym: 7 dni, do 20 opisów/);
  await change({ mode: 'pay', plan: 'pro' });
  u = db.one('SELECT * FROM users WHERE id = ?', anna);
  assert.equal(u.sub_status, 'expired');
  assert.equal(u.plan, 'pro');
  assert.equal((await format(annaCookie, 'a4')).data.code, 'expired', 'sees the price list');
  await change({ mode: 'gift', plan: 'start', months: 2 });
  u = db.one('SELECT * FROM users WHERE id = ?', anna);
  assert.equal(u.sub_status, 'active');
  assert.equal(u.plan, 'start');
  assert.ok(u.sub_until > Date.now() + 55 * 86400000);
  assert.equal(db.one('SELECT provider, amount_pln FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 1', anna).provider, 'free');
  await change({ mode: 'friend' });
  assert.equal(db.one('SELECT * FROM users WHERE id = ?', anna).sub_status, 'friend');
  assert.equal((await call('POST', `/api/admin/users/${anna}/change-access`, { mode: 'nonsense' }, owner)).res.status, 400);
});

test('an existing account becomes a friend only after the owner confirms', async () => {
  db.setSetting('appSettings', { verifyEmail: false, trialsPerIp: 1000 });
  await call('POST', '/api/auth/register', { email: 'ewa@example.com', password: 'ewahaslo20266', name: 'Ewa', accept: true });
  const first = await call('POST', '/api/admin/friends', { email: 'ewa@example.com' }, owner);
  assert.equal(first.res.status, 409);
  assert.equal(first.data.exists, true);
  assert.notEqual(db.one("SELECT sub_status FROM users WHERE email = 'ewa@example.com'").sub_status, 'friend');
  const yes = await call('POST', '/api/admin/friends', { email: 'ewa@example.com', convert: true }, owner);
  assert.equal(yes.data.converted, true);
  assert.match(yes.data.link, /\/login$/);
  assert.equal(db.one("SELECT sub_status FROM users WHERE email = 'ewa@example.com'").sub_status, 'friend');
  assert.equal((await call('POST', '/api/admin/friends', { email: 'owner@example.com', convert: true }, owner)).res.status, 409, 'never the admin account');
});

test('the key guide is public (can be sent to a friend) and only the owner manages friends', async () => {
  const g = await fetch(`${url}/klucz-api`);
  assert.equal(g.status, 200);
  const html = await g.text();
  assert.match(html, /platform\.claude\.com\/settings\/keys/);
  assert.match(html, /Never/);
  assert.equal((await call('GET', '/api/admin/friends', undefined, annaCookie)).res.status, 403);
  assert.equal((await call('POST', '/api/admin/friends', { email: 'x@example.com' }, annaCookie)).res.status, 403);
});

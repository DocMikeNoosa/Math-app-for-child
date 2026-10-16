// Friends' version: free accounts that use their OWN Anthropic API key — their reports never cost the owner anything.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock, app, url, db, adminCookie, friendCookie, friendId;
const requests = [];
let replyStatus = 200;

const message = (text) => ({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1000, output_tokens: 500 } });
const OK = message(JSON.stringify({ edits: [{ op: 'insert', target: 'TOP', text: 'Krwiak podtwardówkowy 8 mm.', reason: '' }], conclusion: '- Krwiak podtwardówkowy.', warnings: [] }));

before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      requests.push({ key: req.headers['x-api-key'], body: JSON.parse(body || '{}') });
      res.writeHead(replyStatus, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(replyStatus === 200 ? OK : { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_API_KEY = 'owner-service-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.KEYS_SECRET = 'test-secret-for-friend-keys';
  delete process.env.AI_PROVIDER;
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  process.env.TERMS_VERSION = '';
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
  adminCookie = (await call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'ownerhaslo123' })).cookie;
});
after(() => { app?.close(); mock?.close(); });

async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, text: data ? '' : await res.text(), cookie: (res.headers.get('set-cookie') || '').split(';')[0] };
}
const tpl = getTemplate('ct_head_normal');
const format = (cookie, reportId = 'r1') => call('POST', '/api/format', { templateId: 'ct_head_normal', report: reportFromTemplate(tpl), dictation: 'krwiak osiem milimetrów', reportId }, cookie);

test('owner creates a friend: free account, no plan to pay, asked for their own key', async () => {
  const r = await call('POST', '/api/admin/users', { name: 'Kolega Jan', email: 'jan@kolega.pl', friend: true, sendEmail: true }, adminCookie);
  assert.equal(r.res.status, 200);
  assert.equal(r.data.user.friend, true);
  friendId = r.data.user.id;
  const mail = db.one("SELECT body FROM outbox WHERE to_addr = 'jan@kolega.pl' ORDER BY id DESC LIMIT 1").body;
  assert.match(mail, /klucz API Claude/);
  const token = r.data.link.split('token=')[1];
  const set = await call('POST', '/api/auth/reset', { token, password: 'kolegahaslo2026' });
  friendCookie = set.cookie;
  const me = await call('GET', '/api/me', undefined, friendCookie);
  assert.equal(me.data.access.ok, true);
  assert.equal(me.data.plan.id, 'friend');
  assert.equal(me.data.friend.key, '');
  const noKey = await format(friendCookie);
  assert.equal(noKey.res.status, 402);
  assert.equal(noKey.data.code, 'own_key');
  assert.equal(requests.length, 0, 'nothing sent to Anthropic, nothing charged to the owner');
});

test('the friend saves a key: stored encrypted, shown only masked, never sent back', async () => {
  assert.equal((await call('POST', '/api/me/api-key', { key: 'not-a-key' }, friendCookie)).res.status, 400);
  const key = 'sk-ant-api03-FRIENDSOWNKEY-abcdefghijklmnopqrstuvwxyz1234';
  const r = await call('POST', '/api/me/api-key', { key }, friendCookie);
  assert.equal(r.res.status, 200);
  assert.equal(r.data.friend.key, 'sk-ant-…1234');
  assert.doesNotMatch(JSON.stringify(r.data), /FRIENDSOWNKEY/);
  const stored = db.one('SELECT api_key_enc FROM users WHERE id = ?', friendId).api_key_enc;
  assert.match(stored, /^v1:/);
  assert.doesNotMatch(stored, /FRIENDSOWNKEY/, 'database holds only the encrypted key');
  const admin = await call('GET', `/api/admin/users/${friendId}`, undefined, adminCookie);
  assert.doesNotMatch(JSON.stringify(admin.data), /FRIENDSOWNKEY|v1:/, 'the owner cannot see it either');
});

test("a friend's report goes out with THEIR key and is not the owner's cost; other users still use the service key", async () => {
  const r = await format(friendCookie);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  assert.equal(requests.at(-1).key, 'sk-ant-api03-FRIENDSOWNKEY-abcdefghijklmnopqrstuvwxyz1234');
  const u = db.one('SELECT COALESCE(SUM(cost_usd),0) AS owner, COALESCE(SUM(own_cost_usd),0) AS own FROM usage WHERE user_id = ?', friendId);
  assert.equal(u.owner, 0);
  assert.ok(u.own > 0);
  const me = await call('GET', '/api/me', undefined, friendCookie);
  assert.ok(me.data.friend.ownCostUsd > 0, 'the friend sees their own cost');
  const o = await call('GET', '/api/admin/overview', undefined, adminCookie);
  assert.equal(o.data.ai.costUsd, 0, "owner's AI cost unchanged");
  // an ordinary trial user right after: the service key
  db.setSetting('appSettings', { verifyEmail: false, trialsPerIp: 1000 });
  const reg = await call('POST', '/api/auth/register', { email: 'zwykly@example.com', password: 'zwyklyhaslo2026', name: 'Zwykły', accept: true });
  assert.equal((await format(reg.cookie, 'z1')).res.status, 200);
  assert.equal(requests.at(-1).key, 'owner-service-key');
});

test('friends have no report limit (they pay); a broken key gives the friend a clear message, not the owner an alarm', async () => {
  for (let i = 0; i < 3; i++) assert.equal((await format(friendCookie, `f${i}`)).res.status, 200);
  replyStatus = 401;
  const bad = await format(friendCookie, 'bad');
  replyStatus = 200;
  assert.equal(bad.res.status, 402);
  assert.equal(bad.data.code, 'own_key');
  assert.match(bad.data.error, /Twój klucz API/);
});

test('friends get the gold app: gold icon, own installable app', async () => {
  const page = await call('GET', '/app/', undefined, friendCookie);
  assert.equal(page.res.status, 200);
  assert.match(page.text, /app-friend\.webmanifest/);
  assert.match(page.text, /radvox-friend-192\.png/);
  assert.match(page.text, /<body class="friend">/);
  const man = await (await fetch(`${url}/app-friend.webmanifest`)).json();
  assert.match(man.icons[0].src, /radvox-friend/);
  assert.notEqual(man.id, '/app/');
  const reg = await call('POST', '/api/auth/login', { email: 'zwykly@example.com', password: 'zwyklyhaslo2026' });
  const normal = await call('GET', '/app/', undefined, reg.cookie);
  assert.match(normal.text, /href="\/app\.webmanifest"/);
  assert.doesNotMatch(normal.text, /friend/);
});

test('the friend can remove the key; the owner can end the friends version (key wiped, access ends)', async () => {
  const del = await call('DELETE', '/api/me/api-key', undefined, friendCookie);
  assert.equal(del.data.friend.key, '');
  await call('POST', '/api/me/api-key', { key: 'sk-ant-api03-SECONDKEY-abcdefghijklmnopqrstuvwxyz1234' }, friendCookie);
  const end = await call('PATCH', `/api/admin/users/${friendId}`, { friend: false }, adminCookie);
  assert.equal(end.res.status, 200);
  const u = db.one('SELECT * FROM users WHERE id = ?', friendId);
  assert.equal(u.api_key_enc, '');
  assert.equal(u.sub_status, 'expired');
  assert.equal((await format(friendCookie, 'after')).res.status, 402);
});

test('key encryption round trip', async () => {
  const { seal, open, maskKey } = await import('../lib/secret-box.js');
  const box = seal('sk-ant-xyz-123456');
  assert.notEqual(box, 'sk-ant-xyz-123456');
  assert.equal(open(box), 'sk-ant-xyz-123456');
  assert.equal(open(box.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A'))), '', 'tampered → nothing');
  assert.equal(maskKey('sk-ant-xyz-123456'), 'sk-ant-…3456');
});

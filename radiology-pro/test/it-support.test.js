// Everything an organisation's IT needs to fix problems — and nothing that exposes the owner's IP:
// problem reports from the app, workstation check, unlock, two-factor reset, devices, owner's two-factor reset.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

let app;
let url;
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
});
after(() => app?.close());

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
async function call(method, path, body, cookie) {
  const res = await fetch(`${url}${path}`, { method, headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1', 'User-Agent': UA, ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
const login = async (email, password) => (await call('POST', '/api/auth/login', { email, password }));

let owner; let it; let rad; let radId;
test('setup', async () => {
  owner = (await login('owner@example.com', 'ownerhaslo123')).cookie;
  const o = await call('POST', '/api/admin/orgs', { name: 'Szpital', seats: 5, itEmail: 'it@s.test' }, owner);
  const l = await login('it@s.test', o.data.it.tempPassword);
  await call('POST', '/api/me/first-password', { next: 'informatyk2026' }, l.cookie);
  it = l.cookie;
  const add = await call('POST', '/api/it/users', { email: 'rad@s.test', name: 'Radiolog' }, it);
  radId = add.data.user.id;
  const r = await login('rad@s.test', add.data.tempPassword);
  await call('POST', '/api/me/first-password', { next: 'radiolog2026' }, r.cookie);
  rad = r.cookie;
});

test('the app reports technical problems; IT sees them with an explanation and the browser', async () => {
  assert.equal((await call('POST', '/api/me/event', { kind: 'speech', code: 'network' }, rad)).data.ok, true);
  assert.equal((await call('POST', '/api/me/event', { kind: 'mic', code: 'no-data', detail: 'Urządzenie: PowerMic II' }, rad)).data.ok, true);
  assert.equal((await call('POST', '/api/me/event', { kind: 'hack', code: 'x' }, rad)).data.ok, false, 'unknown kinds are refused');
  const pr = await call('GET', '/api/it/problems', undefined, it);
  const speech = pr.data.issues.find((i) => i.event === 'speech:network');
  assert.ok(speech, JSON.stringify(pr.data.issues));
  assert.match(speech.text, /zapora|proxy/i);
  assert.equal(speech.ua, 'Chrome 131 · Windows');
  assert.ok(pr.data.issues.some((i) => i.event === 'mic:no-data' && /Nuance|Dragon/.test(i.text)));
  // a workstation check result sent by the radiologist
  await call('POST', '/api/me/event', { kind: 'check', code: 'problems', detail: 'BŁĄD  Rozpoznawanie mowy: błąd: network' }, rad);
  const pr2 = await call('GET', '/api/it/problems', undefined, it);
  assert.equal(pr2.data.checks[0].email, 'rad@s.test');
  assert.match(pr2.data.checks[0].detail, /network/);
  // flood protection: at most 40 per hour per person
  for (let i = 0; i < 45; i++) await call('POST', '/api/me/event', { kind: 'clipboard', code: 'denied' }, rad);
  const { one } = await import('../lib/db.js');
  assert.ok(one('SELECT COUNT(*) AS n FROM client_events WHERE user_id = ?', radId).n <= 40);
});

test('IT: unlock a locked login, see devices, log out one device, reset two-factor', async () => {
  const { resetRateLimits } = await import('../lib/auth.js');
  resetRateLimits();
  for (let i = 0; i < 8; i++) await login('rad@s.test', 'zle-haslo-1');
  assert.equal((await login('rad@s.test', 'radiolog2026')).res.status, 429, 'locked out');
  let d = await call('GET', `/api/it/users/${radId}/details`, undefined, it);
  assert.equal(d.data.lockedOut, true);
  assert.equal((await call('POST', `/api/it/users/${radId}/unlock`, {}, it)).res.status, 200);
  const second = await login('rad@s.test', 'radiolog2026');
  assert.equal(second.res.status, 200, 'unlocked, same password');
  d = await call('GET', `/api/it/users/${radId}/details`, undefined, it);
  assert.equal(d.data.devices.length, 2);
  assert.equal(d.data.devices[0].browser, 'Chrome 131 · Windows');
  assert.ok(d.data.events.length >= 2);
  // log out one device only
  const dev = d.data.devices[0].id;
  assert.equal((await call('DELETE', `/api/it/users/${radId}/devices?device=${dev}`, undefined, it)).res.status, 200);
  d = await call('GET', `/api/it/users/${radId}/details`, undefined, it);
  assert.equal(d.data.devices.length, 1);
  // two-factor: the radiologist switches it on, loses the phone, IT switches it off
  const { totpCode } = await import('../lib/totp.js');
  const s = await call('POST', '/api/me/2fa/setup', {}, rad);
  await call('POST', '/api/me/2fa/enable', { code: totpCode(s.data.secret) }, rad);
  assert.equal((await login('rad@s.test', 'radiolog2026')).data.need2fa, true);
  assert.equal((await call('POST', `/api/it/users/${radId}/reset-2fa`, {}, it)).res.status, 200);
  const after2fa = await login('rad@s.test', 'radiolog2026');
  assert.equal(after2fa.data.need2fa, undefined);
  assert.equal(after2fa.res.status, 200);
  const { one } = await import('../lib/db.js');
  assert.ok(one("SELECT COUNT(*) AS n FROM outbox WHERE to_addr = 'rad@s.test' AND subject LIKE '%dwuetapowe%'").n >= 1, 'the person is told');
  assert.ok(one("SELECT COUNT(*) AS n FROM audit WHERE action = 'it.user.reset_2fa'").n >= 1, 'logged');
});

test('owner can reset two-factor too (e.g. for an IT administrator)', async () => {
  const { totpCode } = await import('../lib/totp.js');
  const s = await call('POST', '/api/me/2fa/setup', {}, it);
  await call('POST', '/api/me/2fa/enable', { code: totpCode(s.data.secret) }, it);
  const { one } = await import('../lib/db.js');
  const itId = one("SELECT id FROM users WHERE email = 'it@s.test'").id;
  assert.equal((await call('POST', `/api/admin/users/${itId}/reset-2fa`, {}, owner)).res.status, 200);
  assert.equal(one('SELECT totp_on FROM users WHERE id = ?', itId).totp_on, 0);
});

test('IP stays protected: IT tools contain no learning, no report text, no server internals', async () => {
  const it2 = (await login('it@s.test', 'informatyk2026')).cookie;
  const blobs = [
    await call('GET', '/api/it/problems', undefined, it2),
    await call('GET', `/api/it/users/${radId}/details`, undefined, it2),
    await call('GET', '/api/it/overview', undefined, it2),
  ].map((r) => JSON.stringify(r.data));
  for (const b of blobs) {
    assert.ok(!/global_guidance|learning|style_pair|SYSTEM_PROMPT|ANTHROPIC|claude-/i.test(b), b.slice(0, 200));
  }
  assert.equal((await call('GET', '/api/admin/learning', undefined, it2)).res.status, 403);
  // the workstation check page is public (IT tests before accounts exist); the microphone module is bundled in production only
  const page = await fetch(`${url}/check`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Test stanowiska/);
  const { readFileSync } = await import('node:fs');
  assert.match(readFileSync(new URL('../server.js', import.meta.url), 'utf8'), /p === '\/js\/mic-button\.js' && !PROD/);
});

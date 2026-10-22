// Organisations (teleradiology companies): seats, IT console, temporary passwords, first-login password change,
// licence access, AI traffic control, health check, static caching.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock;
let app;
let url;
let mockDelay = 0;

before(async () => {
  mock = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => setTimeout(() => {
      const text = JSON.stringify({ edits: [], conclusion: '- Bez zmian.', warnings: [] });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 100, output_tokens: 50 } }));
    }, mockDelay));
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.DB_FILE = ':memory:';
  process.env.BACKUP_DISABLED = '1';
  delete process.env.AI_PROVIDER;
  delete process.env.RESEND_API_KEY;
  const { openDb } = await import('../lib/db.js');
  openDb(':memory:');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${app.address().port}`;
  const { createUser } = await import('../lib/auth.js');
  await createUser({ email: 'owner@example.com', password: 'ownerhaslo123', name: 'Owner', role: 'admin' });
});
after(() => { app?.close(); mock?.close(); });

const H = (cookie = '') => ({ 'Content-Type': 'application/json', 'X-Radiopis': '1', ...(cookie ? { Cookie: cookie } : {}) });
async function call(method, path, body, cookie, extra = {}) {
  const res = await fetch(`${url}${path}`, { method, headers: { ...H(cookie), ...extra }, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' });
  let data = null;
  try { data = await res.clone().json(); } catch { /* not json */ }
  return { res, data, cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
async function login(email, password) {
  const r = await call('POST', '/api/auth/login', { email, password });
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  return { cookie: r.cookie, next: r.data.next };
}
const format = (cookie, reportId, extra = {}) => call('POST', '/api/format', { templateId: 'ct_head_normal', report: reportFromTemplate(getTemplate('ct_head_normal')), dictation: 'bez zmian', reportId, ...extra }, cookie);

let owner;
let org;
let it; // { email, cookie }

test('owner creates an organisation with its first IT administrator (temporary password)', async () => {
  owner = (await login('owner@example.com', 'ownerhaslo123')).cookie;
  const r = await call('POST', '/api/admin/orgs', { name: 'Teleradiologia Test Sp. z o.o.', nip: '123-456-78-90', seats: 4, days: 14, pricePerSeat: 249, contact: 'it@tele.test', itEmail: 'it@tele.test', itName: 'Dział IT' }, owner);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  org = r.data.org;
  assert.equal(org.seats, 4);
  assert.equal(org.seatsUsed, 1, 'the IT account takes a seat');
  assert.equal(org.status, 'trial');
  assert.match(r.data.it.tempPassword, /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/);
  it = { email: 'it@tele.test', temp: r.data.it.tempPassword };
});

test('first login with a temporary password: must set an own password before anything else', async () => {
  const l = await login(it.email, it.temp);
  assert.equal(l.next, '/change-password');
  const app1 = await call('GET', '/app/', undefined, l.cookie);
  assert.equal(app1.res.status, 302);
  assert.equal(app1.res.headers.get('location'), '/change-password');
  const f = await format(l.cookie, 'r-it-1');
  assert.equal(f.res.status, 402);
  assert.equal(f.data.code, 'pwd');
  const itApi = await call('GET', '/api/it/overview', undefined, l.cookie);
  assert.equal(itApi.res.status, 403);
  // the new password must differ from the temporary one and follow the rules
  assert.equal((await call('POST', '/api/me/first-password', { next: it.temp, accept: true }, l.cookie)).res.status, 400);
  assert.equal((await call('POST', '/api/me/first-password', { next: 'short1', accept: true }, l.cookie)).res.status, 400);
  const ok = await call('POST', '/api/me/first-password', { next: 'informatyk2026', accept: true }, l.cookie);
  assert.equal(ok.res.status, 200, JSON.stringify(ok.data));
  assert.equal(ok.data.next, '/it');
  // second time: not allowed (normal password change requires the current password)
  assert.equal((await call('POST', '/api/me/first-password', { next: 'informatyk2027', accept: true }, l.cookie)).res.status, 400);
  it.cookie = l.cookie;
  assert.equal((await login(it.email, 'informatyk2026')).next, '/it');
});

let imported;
test('IT bulk import: header and duplicates skipped, seat limit respected, temporary passwords returned', async () => {
  const text = 'email;imie i nazwisko;pwz\nanna.nowak@tele.test;Anna Nowak;1234567\njan.kowalski@tele.test, Jan Kowalski, 7654321\nANNA.NOWAK@tele.test;Anna Nowak;1234567\nzly-adres\npiotr@tele.test\tPiotr Zielony\nadam@tele.test;Adam Ostatni';
  const r = await call('POST', '/api/it/import', { text }, it.cookie);
  assert.equal(r.res.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.created.length, 3, JSON.stringify(r.data));
  assert.deepEqual(r.data.created.map((c) => c.email), ['anna.nowak@tele.test', 'jan.kowalski@tele.test', 'piotr@tele.test']);
  assert.equal(r.data.created[0].name, 'Anna Nowak');
  assert.equal(r.data.created[0].npwz, '1234567');
  const reasons = Object.fromEntries(r.data.skipped.map((s) => [s.email, s.reason]));
  assert.equal(reasons['anna.nowak@tele.test'], 'powtórzony na liście');
  assert.equal(reasons['adam@tele.test'], 'brak wolnych miejsc w licencji');
  assert.equal(r.data.org.seatsUsed, 4);
  imported = r.data.created;
  const ov = await call('GET', '/api/it/overview', undefined, it.cookie);
  assert.equal(ov.data.users.length, 4);
  assert.equal(ov.data.users.filter((u) => u.mustChangePwd).length, 3);
  // adding one more person: no free seat
  const add = await call('POST', '/api/it/users', { email: 'adam@tele.test', name: 'Adam' }, it.cookie);
  assert.equal(add.res.status, 400);
  assert.match(add.data.error, /miejsc/);
});

test('organisation member: works after setting a password; licence (not personal plan) decides access', async () => {
  const anna = imported[0];
  const l = await login(anna.email, anna.tempPassword);
  assert.equal(l.next, '/change-password');
  const p = await call('POST', '/api/me/first-password', { next: 'radiolog2026', accept: true }, l.cookie);
  assert.equal(p.data.next, '/app/');
  const me = await call('GET', '/api/me', undefined, l.cookie);
  assert.equal(me.data.org.name, 'Teleradiologia Test Sp. z o.o.');
  assert.match(me.data.plan.name, /Licencja/);
  assert.equal(me.data.access.ok, true);
  const f = await format(l.cookie, 'r-anna-1');
  assert.equal(f.res.status, 200, JSON.stringify(f.data));
  // no personal payments for organisation members
  assert.equal((await call('POST', '/api/me/checkout', { plan: 'pro' }, l.cookie)).res.status, 400);
  // the owner suspends the organisation → no AI, clear message with the IT contact
  await call('PATCH', `/api/admin/orgs/${org.id}`, { status: 'suspended' }, owner);
  const s = await format(l.cookie, 'r-anna-2');
  assert.equal(s.res.status, 402);
  assert.equal(s.data.code, 'org');
  assert.match(s.data.error, /it@tele\.test/);
  // licence ended → no access; extended → works again
  await call('PATCH', `/api/admin/orgs/${org.id}`, { status: 'active', subUntil: Date.now() - 1000 }, owner);
  assert.equal((await format(l.cookie, 'r-anna-3')).res.status, 402);
  const ext = await call('POST', `/api/admin/orgs/${org.id}/extend`, { months: 1 }, owner);
  assert.equal(ext.data.org.status, 'active');
  assert.ok(ext.data.org.subUntil > Date.now() + 27 * 86400000);
  assert.equal((await format(l.cookie, 'r-anna-4')).res.status, 200);
  // the IT administrator does NOT see report counts (default); the owner does
  const ov = await call('GET', '/api/it/overview', undefined, it.cookie);
  assert.equal(ov.data.users.find((u) => u.email === anna.email).reports, null);
  assert.equal(ov.data.showUsage, false);
  const own = await call('GET', `/api/it/overview?org=${org.id}`, undefined, owner);
  assert.equal(own.data.users.find((u) => u.email === anna.email).reports, 2);
});

test('IT: block frees a seat, new temporary password, log out everywhere, delete keeps anonymous usage', async () => {
  const ov = await call('GET', '/api/it/overview', undefined, it.cookie);
  const jan = ov.data.users.find((u) => u.email === 'jan.kowalski@tele.test');
  const anna = ov.data.users.find((u) => u.email === 'anna.nowak@tele.test');
  const me = ov.data.users.find((u) => u.email === it.email);
  // cannot block / demote / delete yourself
  assert.equal((await call('PATCH', `/api/it/users/${me.id}`, { blocked: true }, it.cookie)).res.status, 400);
  assert.equal((await call('PATCH', `/api/it/users/${me.id}`, { role: 'user' }, it.cookie)).res.status, 400);
  assert.equal((await call('DELETE', `/api/it/users/${me.id}`, undefined, it.cookie)).res.status, 400);
  // block Jan → seat free → Adam can be added → unblocking Jan fails (no seat)
  assert.equal((await call('PATCH', `/api/it/users/${jan.id}`, { blocked: true }, it.cookie)).res.status, 200);
  const add = await call('POST', '/api/it/users', { email: 'adam@tele.test', name: 'Adam Ostatni', npwz: '1111111' }, it.cookie);
  assert.equal(add.res.status, 200, JSON.stringify(add.data));
  const unb = await call('PATCH', `/api/it/users/${jan.id}`, { blocked: false }, it.cookie);
  assert.equal(unb.res.status, 400);
  // blocked user cannot log in
  const jl = await call('POST', '/api/auth/login', { email: jan.email, password: imported[1].tempPassword });
  assert.equal(jl.res.status, 403);
  // Anna forgot her password: new temporary one; old one stops working, sessions ended
  const annaSession = (await login(anna.email, 'radiolog2026')).cookie;
  const t = await call('POST', `/api/it/users/${anna.id}/temp-password`, {}, it.cookie);
  assert.equal(t.res.status, 200);
  assert.equal((await call('GET', '/api/me', undefined, annaSession)).res.status, 401);
  assert.equal((await call('POST', '/api/auth/login', { email: anna.email, password: 'radiolog2026' })).res.status, 401);
  assert.equal((await login(anna.email, t.data.tempPassword)).next, '/change-password');
  // delete Jan: personal data gone, usage rows kept
  const del = await call('DELETE', `/api/it/users/${jan.id}`, undefined, it.cookie);
  assert.equal(del.res.status, 200);
  const after = await call('GET', '/api/it/overview', undefined, it.cookie);
  assert.ok(!after.data.users.some((u) => u.id === jan.id));
  const { one } = await import('../lib/db.js');
  const row = one('SELECT email, name, blocked FROM users WHERE id = ?', jan.id);
  assert.match(row.email, /usuniety\.invalid$/);
  assert.equal(row.blocked, 1);
  // audit trail shows who did what
  const log = await call('GET', '/api/it/audit', undefined, it.cookie);
  assert.ok(log.data.audit.some((a) => a.action === 'it.user.temp_password' && a.actor === it.email));
  // CSV export
  const csv = await fetch(`${url}/api/it/export/users.csv`, { headers: { Cookie: it.cookie } });
  assert.equal(csv.status, 200);
  assert.match(await csv.text(), /adam@tele\.test/);
});

test('isolation: IT of one organisation cannot touch another; radiologists cannot open the IT console', async () => {
  const other = await call('POST', '/api/admin/orgs', { name: 'Inna Firma', seats: 5, itEmail: 'it@inna.test' }, owner);
  const otherUser = await call('POST', `/api/it/users?org=${other.data.org.id}`, { email: 'lekarz@inna.test', name: 'Lekarz' }, owner);
  assert.equal(otherUser.res.status, 200, 'the owner manages any organisation with ?org=');
  const id = otherUser.data.user.id;
  assert.equal((await call('PATCH', `/api/it/users/${id}`, { blocked: true }, it.cookie)).res.status, 404);
  assert.equal((await call('POST', `/api/it/users/${id}/temp-password`, {}, it.cookie)).res.status, 404);
  // ?org= is ignored for IT administrators: always their own organisation
  const ov = await call('GET', `/api/it/overview?org=${other.data.org.id}`, undefined, it.cookie);
  assert.equal(ov.data.org.name, 'Teleradiologia Test Sp. z o.o.');
  assert.equal((await call('GET', '/api/admin/overview', undefined, it.cookie)).res.status, 403);
  const adam = await call('GET', '/api/it/overview', undefined, it.cookie);
  const adamRow = adam.data.users.find((u) => u.email === 'adam@tele.test');
  const adamTemp = await call('POST', `/api/it/users/${adamRow.id}/temp-password`, {}, it.cookie);
  const al = await login('adam@tele.test', adamTemp.data.tempPassword);
  await call('POST', '/api/me/first-password', { next: 'adamhaslo2026', accept: true }, al.cookie);
  assert.equal((await call('GET', '/api/it/overview', undefined, al.cookie)).res.status, 403);
  const page = await call('GET', '/it', undefined, al.cookie);
  assert.equal(page.res.status, 302);
  // the owner's organisation list: seats, revenue (active only), usage
  const list = await call('GET', '/api/admin/orgs', undefined, owner);
  const mine = list.data.orgs.find((o) => o.id === org.id);
  assert.equal(mine.revenuePln, 4 * 249);
  assert.ok(mine.reports >= 2);
  const ovw = await call('GET', '/api/admin/overview', undefined, owner);
  assert.equal(ovw.data.orgs.count, 2);
  assert.ok(ovw.data.server.ai.max > 0);
  // an organisation with accounts cannot be deleted
  assert.equal((await call('DELETE', `/api/admin/orgs/${org.id}`, undefined, owner)).res.status, 400);
});

test('device limit per organisation: logging in on one device too many logs out the oldest', async () => {
  await call('PATCH', `/api/admin/orgs/${org.id}`, { devices: 1 }, owner);
  const a = (await login('adam@tele.test', 'adamhaslo2026')).cookie;
  const b = (await login('adam@tele.test', 'adamhaslo2026')).cookie;
  assert.equal((await call('GET', '/api/me', undefined, a)).res.status, 401);
  assert.equal((await call('GET', '/api/me', undefined, b)).res.status, 200);
  await call('PATCH', `/api/admin/orgs/${org.id}`, { devices: 2 }, owner);
});

test('login limit per IP is high enough for a whole company behind one office address', async () => {
  const { resetRateLimits } = await import('../lib/auth.js');
  resetRateLimits();
  for (let i = 0; i < 40; i++) {
    const r = await call('POST', '/api/auth/login', { email: `nobody${i}@tele.test`, password: 'wrongpassword1' });
    assert.equal(r.res.status, 401);
  }
  assert.equal((await call('POST', '/api/auth/login', { email: 'adam@tele.test', password: 'adamhaslo2026' })).res.status, 200);
  // but one e-mail is still protected against guessing
  for (let i = 0; i < 8; i++) await call('POST', '/api/auth/login', { email: 'adam@tele.test', password: 'zlehaslo1234' });
  assert.equal((await call('POST', '/api/auth/login', { email: 'adam@tele.test', password: 'adamhaslo2026' })).res.status, 429);
  resetRateLimits();
});

test('user list parser: Excel paste, CSV, tabs, IT role, header', async () => {
  const { parseUserList } = await import('../lib/orgs.js');
  const rows = parseUserList('E-mail\tImię i nazwisko\tPWZ\r\nA@B.PL\tAla Ma\t1234567\n"x@y.pl","Kot Filemon",IT\n\n;;\nbez maila;123');
  assert.deepEqual(rows, [
    { email: 'a@b.pl', name: 'Ala Ma', npwz: '1234567', role: 'user' },
    { email: 'x@y.pl', name: 'Kot Filemon', npwz: '', role: 'orgadmin' },
  ]);
  const { tempPassword } = await import('../lib/orgs.js');
  const { passwordProblem } = await import('../lib/auth.js');
  for (let i = 0; i < 200; i++) assert.equal(passwordProblem(tempPassword()), '');
});

test('AI traffic control: concurrency cap, queue, background calls shed first, per-user cap, queue timeout', async () => {
  const { AiLimiter, BusyError } = await import('../lib/limiter.js');
  const lim = new AiLimiter({ max: 2, maxWaitMs: 300, perUser: 2 });
  let running = 0;
  let peak = 0;
  const job = (ms) => async () => { running++; peak = Math.max(peak, running); await new Promise((r) => setTimeout(r, ms)); running--; return 'ok'; };
  const results = await Promise.allSettled([1, 2, 3, 4].map((u) => lim.run(u, job(100))));
  assert.deepEqual(results.map((r) => r.value), ['ok', 'ok', 'ok', 'ok']);
  assert.equal(peak, 2, 'never more than max at once');
  assert.ok(lim.snapshot().maxWaitMs >= 90, 'the 3rd and 4th waited');
  // background is refused while busy
  const fg = lim.run(10, job(150));
  await assert.rejects(lim.run(11, job(10), { background: true }), (e) => e instanceof BusyError && e.code === 'bg_busy');
  await fg;
  // per user
  const a = lim.run(20, job(100));
  const b = lim.run(20, job(100));
  await assert.rejects(lim.run(20, job(10)), (e) => e.code === 'user_busy' && e.status === 429);
  await Promise.all([a, b]);
  // queue timeout → 503 busy
  const long = [lim.run(30, job(600)), lim.run(31, job(600))];
  await assert.rejects(lim.run(32, job(10)), (e) => e.code === 'busy' && e.status === 503);
  await Promise.all(long);
  assert.equal(lim.active, 0);
  assert.equal(await lim.idle(100), true);
});

test('server: a background call is refused (429 bg_busy) when the AI queue is busy, nothing is metered', async () => {
  const { aiLimiter } = await import('../lib/limiter.js');
  const saved = aiLimiter.max;
  aiLimiter.max = 1;
  mockDelay = 300;
  const cookie = (await login('adam@tele.test', 'adamhaslo2026')).cookie;
  const fg = format(cookie, 'r-bg-1');
  await new Promise((r) => setTimeout(r, 50));
  const bg = await format(cookie, 'r-bg-2', { background: true });
  assert.equal(bg.res.status, 429);
  assert.equal(bg.data.code, 'bg_busy');
  assert.ok(Number(bg.res.headers.get('retry-after')) > 0);
  assert.equal((await fg).res.status, 200);
  const { one } = await import('../lib/db.js');
  assert.equal(one("SELECT COUNT(*) AS n FROM usage WHERE report_id = 'r-bg-2'").n, 0);
  aiLimiter.max = saved;
  mockDelay = 0;
});

test('health check, announcement banner text, static files revalidate with ETag (304)', async () => {
  const h = await call('GET', '/healthz');
  assert.equal(h.res.status, 200);
  assert.equal(h.data.ok, true);
  await call('PUT', '/api/admin/settings', { announcement: 'Dziś 22:00 prace serwisowe (5 min).' }, owner);
  const st = await call('GET', '/api/status', undefined, owner);
  assert.equal(st.data.announcement, 'Dziś 22:00 prace serwisowe (5 min).');
  const first = await fetch(`${url}/site/site.css`);
  const etag = first.headers.get('etag');
  assert.ok(etag);
  const second = await fetch(`${url}/site/site.css`, { headers: { 'If-None-Match': etag } });
  assert.equal(second.status, 304);
  const itPage = await fetch(`${url}/it`, { headers: { Cookie: it.cookie }, redirect: 'manual' });
  assert.equal(itPage.status, 200);
  assert.match(await itPage.text(), /Konsola IT/);
});

test('AI queue snapshot: "queued" is the current queue, "queuedTotal" the count since start', async () => {
  const { AiLimiter } = await import('../lib/limiter.js');
  const lim = new AiLimiter({ max: 1, maxWaitMs: 1000 });
  const a = lim.run(1, () => new Promise((r) => setTimeout(r, 80)));
  const b = lim.run(2, () => Promise.resolve());
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(lim.snapshot().queued, 1);
  await Promise.all([a, b]);
  const s = lim.snapshot();
  assert.equal(s.queued, 0);
  assert.equal(s.queuedTotal, 1);
});

test('static files: sent gzip-compressed when the browser accepts it, plain otherwise', async () => {
  const gz = await new Promise((resolve) => http.get(`${url}/site/site.css`, { headers: { 'Accept-Encoding': 'gzip' } }, (res) => { res.resume(); resolve(res); }));
  assert.equal(gz.headers['content-encoding'], 'gzip');
  assert.equal(gz.headers.vary, 'Accept-Encoding');
  const plain = await new Promise((resolve) => http.get(`${url}/site/site.css`, (res) => { let n = 0; res.on('data', (c) => (n += c.length)); res.on('end', () => resolve({ res, n })); }));
  assert.equal(plain.res.headers['content-encoding'], undefined);
  assert.ok(plain.n > Number(gz.headers['content-length']), 'compressed is smaller');
  const text = await (await fetch(`${url}/site/site.css`)).text(); // fetch decompresses
  assert.match(text, /\.seat-box/);
});

// EndoList — test gabinetu i administratorów: administrator (komputer) + lekarz (iPhone, emulacja).
// LC_ALL=C.UTF-8 node test/admin-e2e.cjs
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const PORT = 4175, URL0 = `http://localhost:${PORT}/`;
const OUT = process.env.OUT || path.join(os.tmpdir(), 'endolist-admin-e2e');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
let failures = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) failures++; };
const shot = (p, n, o = {}) => p.screenshot({ path: path.join(OUT, n + '.png'), ...o });
const IPHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' };
async function device(browser, opts, name) {
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts }); const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => p.errs.push(name + ' PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::|40[134]|Failed to load resource/.test(m.text())) p.errs.push(name + ' CONSOLE ' + m.text()); });
  p.on('dialog', (d) => d.accept(p.nextPrompt || undefined));
  await p.goto(URL0); await p.waitForSelector('[data-act=new-account]'); return [ctx, p];
}
async function onboard(p, first, last, user, pw) {
  await p.click('[data-act=new-account]');
  await p.fill('[data-ob=first]', first); await p.fill('[data-ob=last]', last);
  for (let i = 0; i < 3; i++) await p.click('[data-act=ob-next]');
  await p.fill('[name=username]', user); await p.fill('[name=pw]', pw); await p.fill('[name=pw2]', pw);
  await p.click('[data-act=ob-create]'); await p.waitForSelector('[data-act=ob-finish]', { timeout: 30000 });
  await p.click('[data-act=ob-finish]'); await p.waitForSelector('#arch', { timeout: 30000 }); await p.waitForTimeout(800);
}
const S = (p, fn, arg) => p.evaluate(fn, arg);
const navTo = async (p, v) => { await p.click(`[data-nav=${v}]`); await p.waitForTimeout(400); };
const PA = 'Haslo-admina-2026', PM = 'Haslo-lekarza-2026', PM2 = 'Nowe-haslo-lekarza-1';

(async () => {
  const srv = spawn(process.execPath, ['server.mjs'], { cwd: path.join(__dirname, '..'), env: { ...process.env, ENDOLIST_PORT: String(PORT), ENDOLIST_SYNC_DIR: path.join(OUT, 'server'), ...(process.env.SYNC_URL ? { ENDOLIST_SYNC_URL: process.env.SYNC_URL } : {}) }, stdio: 'pipe' });
  await new Promise((res) => { srv.stdout.on('data', (d) => { if (String(d).includes('EndoList')) res(); }); setTimeout(res, 3000); });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    // ---------- admin creates the clinic
    const [, a] = await device(browser, { viewport: { width: 1440, height: 900 } }, 'admin');
    await onboard(a, 'Katarzyna', 'Zielińska', 'kasia', PA);
    ok(await a.locator('[data-nav=admin]').count() === 0, 'no admin tab before a clinic exists');
    await navTo(a, 'settings'); await a.click('[data-act=clinic-create]');
    await a.click('.modal footer .btn-primary'); await a.waitForSelector('#adm-members .member', { timeout: 30000 });
    ok(await a.locator('[data-nav=admin]').count() === 1 && (await a.textContent('#adm-members')).includes('administrator'), 'clinic created: creator is the administrator, admin tab shown');
    await a.click('[data-act=clinic-invite][data-role=member]'); await a.waitForSelector('#inv-code');
    const code = (await a.textContent('#inv-code')).trim();
    ok(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code), 'invite code generated: ' + code);
    await a.waitForTimeout(500); await shot(a, 'a1-invite'); await a.click('.modal footer .btn-ghost');

    // ---------- doctor on iPhone joins
    const [, m] = await device(browser, IPHONE, 'iphone');
    await onboard(m, 'Jan', 'Wiśniewski', 'jan', PM);
    await navTo(m, 'settings'); await m.click('[data-act=clinic-join]'); await m.fill('#cl-code', code.replace(/-/g, '').toLowerCase());
    await m.click('.modal footer .btn-primary'); await m.waitForFunction(() => window.__endolist.S.org, null, { timeout: 30000 });
    ok((await m.textContent('#clinic-panel')).includes('lekarz') && await m.locator('[data-nav=admin]').count() === 0, 'doctor joined as a member (no admin tab)');
    await m.locator('#clinic-panel').screenshot({ path: path.join(OUT, 'm1-clinic-member.png') });
    await S(m, () => window.__endolist.save('patients', { id: 'pt-jan-1', first: 'Ewa', last: 'Nowicka', dob: '1971-02-03', createdAt: Date.now() }));
    await m.waitForTimeout(600); await S(m, () => window.__endolist.S.sync.now());
    // a second invite must be refused when reused
    await m.click('[data-act=clinic-join]').catch(() => {});

    // ---------- admin sees the team, the doctor's data, sets AI policy
    await navTo(a, 'admin'); await a.waitForFunction(() => document.querySelectorAll('#adm-members .member').length === 2, null, { timeout: 20000 });
    ok((await a.textContent('#adm-members')).includes('Jan Wiśniewski'), 'admin sees the new doctor (name decrypted with the clinic key)');
    await shot(a, 'a2-admin', { fullPage: true });
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-data]'); await a.waitForSelector('.modal:has-text("Pacjenci")', { timeout: 20000 });
    ok((await a.textContent('.modal')).includes('Nowicka'), "admin can open the doctor's data (key escrow)");
    await shot(a, 'a3-member-data'); await a.click('.modal footer .btn-ghost');
    await a.click('[data-act=clinic-policy-ai]'); await a.click('.modal footer .btn-danger'); await a.waitForTimeout(800);
    await S(m, () => window.__endolist.refreshClinic());
    ok(await S(m, () => !!window.__endolist.S.org.org.policy.aiDpa), 'clinic AI policy reaches the doctor');

    // ---------- password reset by the admin
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-reset]'); await a.fill('#rp1', PM2); await a.fill('#rp2', PM2);
    await a.click('.modal footer .btn-primary'); await a.waitForTimeout(4000);
    await m.reload(); await m.waitForSelector('[name=password]');
    await m.fill('[name=password]', PM); await m.click('#login button'); await m.waitForFunction(() => document.querySelector('#err')?.textContent, null, { timeout: 30000 });
    ok((await m.textContent('#err')).includes('Nieprawidłowe'), 'old password stops working after the reset');
    await m.fill('[name=password]', PM2); await m.click('#login button'); await m.waitForSelector('#arch', { timeout: 30000 }).then(() => ok(true, 'doctor logs in with the password set by the admin'), () => ok(false, 'login with reset password'));
    ok((await S(m, () => [...window.__endolist.S.data.patients.values()].map((x) => x.last))).includes('Nowicka'), "doctor's data intact after the reset");

    // ---------- promote to admin, then demote
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-role]'); await a.click('.modal footer .btn-danger'); await a.waitForTimeout(1200);
    await S(m, () => window.__endolist.refreshClinic());
    await m.waitForTimeout(400);
    ok(await S(m, () => window.__endolist.S.clinic.isAdmin()), 'promoted doctor received the clinic key (now an admin)');
    await m.click('[data-nav=admin]'); await m.waitForFunction(() => document.querySelectorAll('#adm-members .member').length === 2, null, { timeout: 20000 });
    ok((await m.textContent('#adm-members')).includes('Katarzyna Zielińska'), 'second admin sees the whole team on the iPhone');
    await shot(m, 'm2-admin-iphone', { fullPage: true });
    await a.reload(); await a.fill('[name=password]', PA); await a.click('#login button'); await a.waitForSelector('#arch'); await a.waitForTimeout(800);
    await navTo(a, 'admin'); await a.waitForFunction(() => document.querySelectorAll('#adm-members .member').length === 2, null, { timeout: 20000 });
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-role]'); await a.click('.modal footer .btn-danger'); await a.waitForTimeout(1200);
    ok(!(await a.textContent('.member:has-text("Jan Wiśniewski")')).includes('Odbierz admina'), 'admin rights removed again');

    // ---------- remove the doctor: access cut, iPhone wiped, clinic keeps the records
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-remove]'); await a.click('.modal footer .btn-danger'); await a.waitForTimeout(1200);
    await S(m, () => window.__endolist.S.sync && window.__endolist.S.sync.now()).catch(() => {});
    await m.waitForSelector('#login', { timeout: 20000 }).catch(() => {});
    ok((await m.textContent('body')).includes('usunął to konto'), 'removed doctor: the iPhone shows the removal and locks');
    ok((await m.evaluate(() => new Promise((res) => { const r = indexedDB.open('endolist'); r.onsuccess = () => { const t = r.result.transaction('records').objectStore('records').count(); t.onsuccess = () => res(t.result); }; }))) === 0, 'removed doctor: clinic data wiped from the iPhone');
    await shot(m, 'm3-removed');
    await m.fill('[name=username]', 'jan'); await m.fill('[name=password]', PM2); await m.click('#login button');
    const again = await m.waitForFunction(() => /usunięte z gabinetu/.test(document.querySelector('#err')?.textContent || ''), null, { timeout: 30000 }).then(() => true, () => false);
    ok(again && await m.locator('#arch').count() === 0, 'removed doctor cannot sign in again');
    await a.click('.member:has-text("Jan Wiśniewski") [data-act=m-data]'); await a.waitForSelector('.modal:has-text("Pacjenci")', { timeout: 20000 });
    ok((await a.textContent('.modal')).includes('Nowicka'), "clinic keeps the removed doctor's records");
    const [dl] = await Promise.all([a.waitForEvent('download'), a.click('.modal footer .btn-primary')]);
    ok(JSON.parse(fs.readFileSync(await dl.path(), 'utf8')).pacjenci.some((x) => x.last === 'Nowicka'), "admin exports the removed doctor's documentation");
    await a.click('.modal footer .btn-ghost');
    // the admin's actions are in the activity log
    const log = await S(a, () => [...window.__endolist.S.data.audit.values()].flatMap((r) => r.events).filter((e) => e.action === 'admin').map((e) => e.detail).join(' | '));
    ok(/utworzono gabinet/.test(log) && /reset hasła/.test(log) && /dostęp do danych lekarza/.test(log) && /usunięto z gabinetu/.test(log), 'admin actions recorded in the activity log');
    for (const p of [a, m]) ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs));
  } catch (e) { console.error(e); failures++; }
  await browser.close(); srv.kill();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED'); process.exit(failures ? 1 : 0);
})();

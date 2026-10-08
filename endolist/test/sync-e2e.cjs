// EndoList — test synchronizacji: komputer ↔ iPhone (emulacja w Chromium) przez serwer synchronizacji.
// Uruchamia własny serwer z włączoną synchronizacją. Uruchom: LC_ALL=C.UTF-8 node test/sync-e2e.cjs
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const PORT = 4174, URL0 = `http://localhost:${PORT}/`, SYNC = process.env.SYNC_URL || `http://localhost:${PORT}/sync`; // SYNC_URL: e.g. a Cloudflare Worker (wrangler dev)
const OUT = process.env.OUT || path.join(os.tmpdir(), 'endolist-sync-e2e');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const DATA = path.join(OUT, 'server-data');
let failures = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) failures++; };
const shot = (p, n, o = {}) => p.screenshot({ path: path.join(OUT, n + '.png'), ...o });
const IPHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' };
const PW = 'Tajne-haslo-123', PW2 = 'Nowe-haslo-456';

async function device(browser, opts, name) {
  const ctx = await browser.newContext(opts);
  const p = await ctx.newPage(); p.errs = [];
  p.on('pageerror', (e) => p.errs.push(name + ' PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::|401|Failed to load resource/.test(m.text())) p.errs.push(name + ' CONSOLE ' + m.text()); });
  await p.goto(URL0); await p.waitForTimeout(400);
  return [ctx, p];
}
const syncNow = (p) => p.evaluate(() => window.__endolist.S.sync.now());
const data = (p, store) => p.evaluate((store) => [...window.__endolist.S.data[store].values()], store);

(async () => {
  const srv = spawn(process.execPath, ['server.mjs'], { cwd: path.join(__dirname, '..'), env: { ...process.env, ENDOLIST_PORT: String(PORT), ENDOLIST_SYNC_DIR: DATA, ...(process.env.SYNC_URL ? { ENDOLIST_SYNC_URL: SYNC } : {}) }, stdio: 'pipe' });
  await new Promise((res) => { srv.stdout.on('data', (d) => { if (String(d).includes('EndoList')) res(); }); setTimeout(res, 3000); });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    // ---------- desktop: new account, enable sync
    const [, d] = await device(browser, { viewport: { width: 1440, height: 900 } }, 'desktop');
    await d.reload(); await d.waitForSelector('[data-act=new-account]');
    ok(await d.locator('#login').count() === 1, 'fresh device with a sync server starts at the login screen');
    await d.click('[data-act=new-account]');
    await d.fill('[data-ob=first]', 'Katarzyna'); await d.fill('[data-ob=last]', 'Zielińska');
    for (let i = 0; i < 3; i++) await d.click('[data-act=ob-next]');
    await d.fill('[name=username]', 'kasia'); await d.fill('[name=pw]', PW); await d.fill('[name=pw2]', PW);
    await d.click('[data-act=ob-create]'); await d.waitForSelector('[data-act=ob-finish]', { timeout: 20000 });
    await d.click('[data-act=ob-finish]'); await d.waitForSelector('#arch', { timeout: 20000 });
    await d.click('[data-act=pick-patient]');
    await d.fill('.modal [data-f=first]', 'Anna'); await d.fill('.modal [data-f=last]', 'Kowalska'); await d.fill('.modal [data-f=dob]', '1980-03-12');
    await d.click('.modal footer .btn-primary'); await d.waitForTimeout(500);
    await syncNow(d); await d.waitForTimeout(500);
    ok((await d.textContent('#status')).includes('Zsynchronizowano'), 'desktop: new account is synced automatically (no setup step)');
    await d.click('[data-nav=settings]'); await d.waitForSelector('[data-act=sync-now]');
    await shot(d, 's02-desktop-settings');
    if (!process.env.SYNC_URL) {
      const files = fs.readdirSync(DATA); const raw = fs.readFileSync(path.join(DATA, files[0]), 'utf8');
      ok(files.length === 1 && !/Kowalska|Anna|Zieli|1980-03-12|kasia/.test(raw), 'server stores only ciphertext (no names, dates or login)');
    }

    // ---------- iPhone: sign in with the same account from the server
    const [, m] = await device(browser, IPHONE, 'iphone');
    await shot(m, 's03-iphone-welcome');
    // the ordinary login form: login + password are enough on a new device
    await m.fill('[name=username]', 'kasia'); await m.fill('[name=password]', 'zle-haslo-000'); await m.click('#login button');
    await m.waitForFunction(() => document.querySelector('#err')?.textContent, null, { timeout: 30000 });
    ok((await m.textContent('#err')).includes('Nieprawidłowy'), 'iPhone: wrong password rejected');
    await m.fill('[name=password]', PW); await shot(m, 's04-iphone-signin');
    await m.click('#login button'); await m.waitForSelector('#arch', { timeout: 30000 }); await m.waitForTimeout(800);
    const mp = await data(m, 'patients');
    ok(mp.length === 1 && mp[0].last === 'Kowalska', 'iPhone: patient from desktop downloaded and decrypted');
    ok((await m.evaluate(() => window.__endolist.settings().doctor.last)) === 'Zielińska', 'iPhone: doctor settings synced');
    ok(await m.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'iPhone: no horizontal scrolling');
    await shot(m, 's05-iphone-visit');

    // ---------- iPhone edits → desktop
    await m.click('[data-act=pick-patient]'); await m.waitForTimeout(300);
    await m.click('.modal [data-pid]'); await m.waitForTimeout(400);
    await m.tap('#arch g.tooth[data-fdi="36"]'); await m.waitForSelector('#ws'); await m.waitForTimeout(1200);
    await shot(m, 's06-iphone-tooth');
    await m.click('[data-ttab=endo]'); await m.selectOption('[data-b="t.endo.proc"]', 'RCT'); await m.waitForTimeout(200);
    await m.click('[data-quick="apexloc"]');
    await m.click('[data-act=ws-save]'); await m.waitForTimeout(600);
    await m.fill('[data-b="v.notes"]', 'Wpis z iPhone’a'); await m.locator('[data-b="v.notes"]').blur(); await m.waitForTimeout(800);
    await syncNow(m); await syncNow(d); await d.waitForTimeout(500);
    const dv = await data(d, 'visits');
    ok(dv.some((v) => v.teeth.some((t) => t.fdi === 36 && t.endo.proc === 'RCT') && v.notes === 'Wpis z iPhone’a'), 'desktop: visit with tooth 36 entered on iPhone arrived');
    await d.click('[data-nav=patients]'); await d.waitForTimeout(300); await shot(d, 's07-desktop-after-iphone');

    // ---------- desktop edits → iPhone (and conflict: last writer wins)
    const vid = dv.find((v) => v.teeth.length).id;
    await d.evaluate((id) => { const v = structuredClone(window.__endolist.S.data.visits.get(id)); v.notes = 'Z komputera (starsza)'; window.__endolist.save('visits', v); }, vid);
    await d.waitForTimeout(600);
    await m.evaluate((id) => { const v = structuredClone(window.__endolist.S.data.visits.get(id)); v.notes = 'Z iPhone’a (nowsza)'; window.__endolist.save('visits', v); }, vid);
    await m.waitForTimeout(600);
    await syncNow(d); await syncNow(m); await syncNow(d); await d.waitForTimeout(300);
    const nd = (await data(d, 'visits')).find((v) => v.id === vid).notes, nm = (await data(m, 'visits')).find((v) => v.id === vid).notes;
    ok(nd === 'Z iPhone’a (nowsza)' && nm === nd, `conflict resolved the same way on both devices (newer wins): "${nd}" / "${nm}"`);
    await d.evaluate(() => { const p = { id: 'p-new', first: 'Jan', last: 'Nowicki', pesel: '', dob: '1975-05-05', createdAt: Date.now() }; window.__endolist.save('patients', p); });
    await d.waitForTimeout(600); await syncNow(d); await syncNow(m);
    ok((await data(m, 'patients')).some((p) => p.last === 'Nowicki'), 'iPhone: new patient from desktop arrived');
    // deletion propagates (encrypted tombstone)
    await d.evaluate(async () => { const { S } = window.__endolist; S.data.patients.delete('p-new'); await S.session.del('patients', 'p-new'); });
    await syncNow(d); await syncNow(m);
    ok(!(await data(m, 'patients')).some((p) => p.last === 'Nowicki'), 'iPhone: deletion from desktop propagated');

    // ---------- automatic sync (no manual trigger): desktop edit shows up on the phone by itself
    await d.evaluate(() => { const st = window.__endolist.settings(); st.doctor.phone = '+48 25 111 22 33'; window.__endolist.save('settings', st); });
    await m.waitForFunction(() => window.__endolist.settings().doctor.phone === '+48 25 111 22 33', null, { timeout: 30000 }).then(() => ok(true, 'automatic: desktop change appeared on iPhone without manual sync'), () => ok(false, 'automatic sync to iPhone'));

    // ---------- password change on desktop → phone and a new device
    await d.click('[data-nav=settings]'); await d.click('[data-act=change-pw]');
    await d.fill('#pw0', PW); await d.fill('#pw1', PW2); await d.fill('#pw2', PW2);
    await d.click('.modal footer .btn-primary'); await d.waitForTimeout(4000);
    await syncNow(d);
    await m.reload(); await m.waitForSelector('[name=password]'); // the phone has not synced since the change
    await m.fill('[name=password]', PW2); await m.click('#login button'); await m.waitForSelector('#arch', { timeout: 30000 }).then(() => ok(true, 'iPhone: unlocks with the new password set on desktop'), () => ok(false, 'iPhone: new password'));
    const [, n] = await device(browser, IPHONE, 'ipad');
    await n.fill('[name=username]', 'kasia'); await n.fill('[name=password]', PW2); await n.click('#login button'); await n.waitForSelector('#arch', { timeout: 30000 }).then(() => ok(true, 'third device: signs in with the new password'), () => ok(false, 'third device sign-in'));
    ok((await data(n, 'visits')).some((v) => v.id === vid), 'third device: full history downloaded');

    // ---------- iPhone: letter view, touch selection → comment
    await m.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = ''; window.__endolist.save('settings', st); });
    await m.click('[data-nav=patients]'); await m.click('[data-open-patient]'); await m.waitForTimeout(300); await m.click('[data-open-visit]:has-text("36")'); await m.waitForTimeout(400);
    await m.click('[data-act=gen-letter]'); await m.waitForTimeout(600);
    if (await m.locator('.modal [data-f=last]').count()) { await m.fill('.modal [data-f=last]', 'Nowak'); await m.click('.modal footer .btn-primary'); await m.waitForTimeout(600); }
    if (await m.locator('.modal').count()) await m.click('.modal footer .btn-primary');
    await m.waitForSelector('#paper', { timeout: 20000 }); await m.waitForTimeout(600);
    await shot(m, 's08-iphone-letter');
    await m.evaluate(() => { const p = document.querySelector('#paper [data-loc="opening"]'); const r = document.createRange(); r.setStart(p.firstChild, 0); r.setEnd(p.firstChild, 12); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
    await m.waitForSelector('#selbtn.on', { timeout: 3000 }).then(() => ok(true, 'iPhone: selecting text shows "Dodaj uwagę"'), () => ok(false, 'iPhone: selection button'));
    await shot(m, 's09-iphone-selection');
    await m.dispatchEvent('#selbtn', 'pointerdown'); await m.waitForSelector('.note-pop', { timeout: 3000 });
    await m.fill('#np-text', 'Krócej'); await shot(m, 's10-iphone-note');
    await m.click('#np-done'); await m.waitForTimeout(500);
    ok((await m.locator('#paper mark.note').count()) === 1, 'iPhone: comment saved on the highlighted passage');
    await syncNow(m); await syncNow(d);
    ok((await data(d, 'letters')).some((l) => (l.notes || []).some((x) => x.comment === 'Krócej')), 'desktop: letter with the iPhone comment arrived');

    // ---------- offline: changes queue up and are sent later
    await m.context().setOffline(true);
    await m.evaluate(() => { const st = window.__endolist.settings(); st.doctor.npwz = '1234567'; window.__endolist.save('settings', st); });
    await m.waitForTimeout(600); await syncNow(m);
    ok((await m.textContent('#status')).includes('Offline'), 'iPhone offline: status says it will sync later');
    await m.context().setOffline(false); await syncNow(m); await syncNow(d);
    ok((await d.evaluate(() => window.__endolist.settings().doctor.npwz)) === '1234567', 'after reconnecting: offline change delivered to desktop');

    const [, o] = await device(browser, { viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' }, 'old-pc'); // so the test can stand in a config without a sync server
    await o.route('**/config.json', (r) => r.fulfill({ contentType: 'application/json', body: '{"syncUrl": ""}' }));
    await o.evaluate(() => localStorage.clear()); await o.reload(); await o.waitForSelector('[data-ob=first]');
    await o.fill('[data-ob=first]', 'Jan'); await o.fill('[data-ob=last]', 'Wiśniewski');
    for (let i = 0; i < 3; i++) await o.click('[data-act=ob-next]');
    await o.fill('[name=username]', 'jan'); await o.fill('[name=pw]', PW); await o.fill('[name=pw2]', PW);
    await o.click('[data-act=ob-create]'); await o.waitForSelector('[data-act=ob-finish]', { timeout: 20000 }); await o.click('[data-act=ob-finish]'); await o.waitForSelector('#arch');
    await o.evaluate(() => { window.__endolist.save('patients', { id: 'old-1', first: 'Ewa', last: 'Starsza', dob: '1960-01-01', createdAt: Date.now() }); });
    await o.waitForTimeout(800);
    ok(!(await o.evaluate(() => !!window.__endolist.S.sync)), 'old account: no sync before a server was configured');
    await o.unroute('**/config.json'); if (process.env.SYNC_URL) await o.route('**/config.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ syncUrl: SYNC }) }));
    await o.reload(); await o.fill('[name=password]', PW); await o.click('#login button'); await o.waitForSelector('#arch');
    await o.waitForFunction(() => window.__endolist.S.syncStatus?.state === 'ok', null, { timeout: 30000 }).catch(() => {});
    ok(await o.evaluate(() => !!window.__endolist.S.sync), 'old account: sync switched on automatically at the next login');
    const [, q] = await device(browser, IPHONE, 'iphone-jan');
    await q.fill('[name=username]', 'jan'); await q.fill('[name=password]', PW); await q.click('#login button'); await q.waitForSelector('#arch', { timeout: 30000 });
    ok((await data(q, 'patients')).some((x) => x.last === 'Starsza'), 'old account: its earlier data is available on the iPhone');
    ok((await data(q, 'patients')).every((x) => x.last !== 'Kowalska'), 'accounts stay separate (no data from another login)');

    for (const p of [d, m, n, o, q]) ok(p.errs.length === 0, 'no page errors ' + JSON.stringify(p.errs));
  } catch (e) { console.error(e); failures++; }
  await browser.close(); srv.kill();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})();

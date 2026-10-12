// Two-device cloud test against the Firebase emulators: sign-up, sync, live updates, offline queue, backups, restore.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const FB = '/tmp/claude-0/-home-user-Math-app-for-child/3fd052c0-89d4-5c38-9a23-f0c33470083d/scratchpad/fbemu/node_modules/firebase/';
const URL0 = 'http://localhost:8765/index.html';
const CFG = { apiKey: 'demo-key', authDomain: 'demo-wb.firebaseapp.com', projectId: 'demo-wb', appId: '1:1:web:1', emulator: true };
const EMAIL = 'family' + Date.now() + '@example.com';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

async function device(browser, name) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    const f = route.request().url().split('/').pop();
    route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(FB + f) });
  });
  await ctx.addInitScript((cfg) => { if (!localStorage.getItem('aus-learn.firebase')) localStorage.setItem('aus-learn.firebase', JSON.stringify(cfg)); }, CFG);
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push(name + ' PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|favicon|404/.test(m.text())) p.errs.push(name + ' ' + m.text()); });
  await p.goto(URL0);
  await p.waitForFunction(() => window.LA && LA.cloud && ['signedout', 'synced', 'local', 'offline', 'error'].includes(LA.cloud.status), null, { timeout: 20000 });
  return { ctx, p };
}
const status = (p) => p.evaluate(() => LA.cloud.status + ' | ' + LA.cloud.detail);
const waitSynced = (p) => p.waitForFunction(() => LA.cloud.status === 'synced', null, { timeout: 20000 });

(async () => {
  const b = await chromium.launch();
  // ---- device A: make a learner and some progress, then create the family account
  const A = await device(b, 'A');
  ok((await status(A.p)).startsWith('signedout'), 'A starts signed out: ' + (await status(A.p)));
  await A.p.fill('#wname', 'Tosia');
  await A.p.click('text=Start');
  await A.p.waitForTimeout(300);
  await A.p.evaluate(() => { LA.store.markLesson('y3.maths.place-value.thousands', { score: 1 }); LA.store.save(); });
  await A.p.evaluate(() => LA.go('parent/cloud'));
  await A.p.fill('input[type=email]', EMAIL);
  await A.p.fill('input[type=password]', 'secret123');
  await A.p.click('text=Create family account');
  await waitSynced(A.p);
  ok(true, 'A signed up and synced');
  await A.p.waitForTimeout(3500);

  // ---- device B: empty, signs in, receives everything
  const B = await device(b, 'B');
  ok(await B.p.locator('text=Already using the app on another device?').count() === 1, 'B welcome offers sign-in');
  await B.p.click('button:has-text("Sign in")');
  await B.p.fill('input[type=email]', EMAIL);
  await B.p.fill('input[type=password]', 'secret123');
  await B.p.click('.card button.btn:has-text("Sign in")');
  await waitSynced(B.p);
  await B.p.waitForTimeout(800);
  const bState = await B.p.evaluate(() => ({ names: LA.store.profiles().map((p) => p.name), done: LA.store.isLessonDone('y3.maths.place-value.thousands') }));
  ok(bState.names.join() === 'Tosia', 'B got the learner: ' + bState.names);
  ok(bState.done, 'B got A’s finished lesson');

  // ---- live update B -> A
  await B.p.evaluate(() => { LA.store.markLesson('y3.english.sentences.what-is-a-sentence', { score: 1 }); LA.store.save(); });
  await A.p.waitForFunction(() => LA.store.isLessonDone('y3.english.sentences.what-is-a-sentence'), null, { timeout: 20000 }).then(() => ok(true, 'A received B’s lesson live'), () => ok(false, 'A did not receive B’s lesson live'));

  // ---- offline on A: work keeps, uploads later, nothing lost on either side
  await A.ctx.setOffline(true);
  await A.p.evaluate(() => { LA.store.markLesson('y3.science.living.alive', { score: 1 }); LA.store.save(); });
  await B.p.evaluate(() => { LA.store.markLesson('y3.hass.community-change.then-now', { score: 1 }); LA.store.save(); }); // concurrent on B
  await A.p.waitForTimeout(4000);
  ok(await A.p.evaluate(() => LA.store.isLessonDone('y3.science.living.alive')), 'A keeps offline work locally');
  await A.ctx.setOffline(false);
  await A.p.evaluate(() => window.dispatchEvent(new Event('online')));
  const both = async (p) => p.evaluate(() => ['y3.maths.place-value.thousands', 'y3.english.sentences.what-is-a-sentence', 'y3.science.living.alive', 'y3.hass.community-change.then-now'].map((k) => LA.store.isLessonDone(k)));
  await B.p.waitForFunction(() => LA.store.isLessonDone('y3.science.living.alive'), null, { timeout: 40000 }).then(() => ok(true, 'B received A’s offline work after reconnect'), () => ok(false, 'B never got A’s offline work'));
  await A.p.waitForFunction(() => LA.store.isLessonDone('y3.hass.community-change.then-now'), null, { timeout: 40000 }).catch(() => {});
  ok((await both(A.p)).every(Boolean), 'A has all 4 lessons (merge, nothing lost): ' + (await both(A.p)));
  ok((await both(B.p)).every(Boolean), 'B has all 4 lessons (merge, nothing lost): ' + (await both(B.p)));

  // ---- backups
  const days = await A.p.evaluate(() => LA.cloud.listBackups());
  ok(days.length >= 1, 'cloud daily backup exists: ' + days.join());
  const snaps = await A.p.evaluate(() => LA.backup.list());
  ok(snaps.length >= 1, 'device snapshots exist: ' + snaps.map((s) => s.reason).join());
  // simulate a disaster on B: localStorage wiped -> mirror restores on reload
  await B.p.evaluate(() => { localStorage.removeItem('aus-learn.v1'); });
  await B.p.reload();
  await B.p.waitForFunction(() => window.LA && LA.store.profiles().length > 0, null, { timeout: 20000 }).then(() => ok(true, 'B recovered after localStorage was wiped'), () => ok(false, 'B did not recover'));
  // restore from cloud backup merges (does not delete newer work)
  const n = await A.p.evaluate((d) => LA.cloud.restoreBackup(d), days[0]);
  ok(n >= 1 && (await both(A.p)).every(Boolean), 'restore from cloud backup merged, newer work kept');
  // API key travels via the private secret doc
  await A.p.evaluate(() => { LA.store.state().settings.apiKey = 'sk-test-123'; LA.store.saveMain(); });
  await A.p.waitForTimeout(4000);
  const C = await device(b, 'C');
  await C.p.evaluate(() => LA.go('parent/cloud'));
  await C.p.fill('input[type=email]', EMAIL);
  await C.p.fill('input[type=password]', 'secret123');
  await C.p.click('.card button.btn:has-text("Sign in")');
  await waitSynced(C.p);
  ok((await C.p.evaluate(() => LA.store.settings().apiKey)) === 'sk-test-123', 'AI key available on a newly signed-in device');
  // wrong password message
  await C.p.evaluate(() => LA.cloud.signOut());
  await C.p.waitForTimeout(500);
  await C.p.evaluate(() => LA.go('parent/cloud'));
  await C.p.fill('input[type=email]', EMAIL);
  await C.p.fill('input[type=password]', 'wrongpass');
  await C.p.click('.card button.btn:has-text("Sign in")');
  await C.p.waitForTimeout(1500);
  const errTxt = await C.p.locator('.card .small').allInnerTexts();
  ok(errTxt.some((t) => /not right|Wrong password/.test(t)), 'friendly wrong-password message');
  await A.p.screenshot({ path: 'cloud-parent.png', fullPage: true });
  // idle check: no endless re-uploads between devices
  let writes = 0;
  const count = (r) => { if (/127\.0\.0\.1:8080.*Write/.test(r.url())) writes++; };
  A.p.on('request', count); B.p.on('request', count);
  await A.p.waitForTimeout(15000);
  ok(writes <= 2, 'idle devices settle (write requests in 15 s: ' + writes + ')');

  const errs = A.p.errs.concat(B.p.errs, C.p.errs);
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

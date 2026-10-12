const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    window.__spoken = [];
    const fake = { speaking: false, pending: false, getVoices: () => [{ name: 'Karen', lang: 'en-AU', voiceURI: 'karen' }, { name: 'Zosia', lang: 'pl-PL', voiceURI: 'zosia' }], speak: (u) => { window.__spoken.push(u.text); }, cancel() {}, resume() {}, addEventListener() {} };
    Object.defineProperty(window, 'speechSynthesis', { value: fake });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400);
  await p.fill('#wname', 'Tosia'); await p.tap('.card button.btn.big'); await p.waitForTimeout(200);
  await p.evaluate(() => LA.go('quiz/y3.maths.place-value', { mode: 'testout' })); await p.waitForTimeout(200);
  await p.locator('.card .btn.big').first().tap(); await p.waitForTimeout(200);
  const wrong = async () => {
    const q = await p.evaluate(() => ({ t: LA.ui.currentQuestion.type, a: LA.ui.currentQuestion.answer, n: (LA.ui.currentQuestion.options || []).length }));
    if (q.t === 'mc') { const opts = p.locator('.opt:not([disabled])'); const cnt = await opts.count(); for (let i = 0; i < cnt; i++) { const idx = await opts.nth(i).evaluate((el) => [...el.parentNode.children].indexOf(el)); if (idx !== q.a) { await opts.nth(i).tap(); break; } } }
    else { await p.fill('.answer-input', '99999'); await p.locator('.answer-row .btn').tap(); }
    await p.waitForTimeout(250);
  };
  window_spoken = () => p.evaluate(() => window.__spoken.join(' | '));
  await wrong();
  ok(await p.locator('.feedback.bad:has-text("Not quite"), .feedback.warn').count() === 1, 'test-out: wrong answer → "Not quite" + second chance');
  ok(/Not quite|close/.test(await window_spoken()), 'feedback spoken: ' + (await window_spoken()).slice(-80));
  await wrong();
  ok(await p.locator('.feedback.info:has-text("The answer is")').count() === 1, 'second miss → answer + explanation');
  ok(/learn it together/.test(await window_spoken()), 'explanation spoken aloud');
  await p.locator('button:has-text("Show me how")').tap(); await p.waitForTimeout(250);
  ok(await p.locator('.modal h2:has-text("Let’s learn it")').count() === 1, '"Show me how" opens the mini lesson');
  await p.locator('.modal .btn').last().tap(); await p.waitForTimeout(150);
  await p.locator('.q-wrap .btn.big').tap(); await p.waitForTimeout(200);
  const q = await p.evaluate(() => ({ t: LA.ui.currentQuestion.type, a: LA.ui.currentQuestion.answer }));
  if (q.t === 'mc') await p.locator('.opt').nth(q.a).tap(); else { await p.fill('.answer-input', String(Array.isArray(q.a) ? q.a[0] : q.a)); await p.locator('.answer-row .btn').tap(); }
  await p.waitForTimeout(250);
  ok(await p.locator('.feedback.good').count() === 1, 'right answer → "Correct" shown in test-out mode');
  ok(await p.evaluate(() => LA.store.settings().autoRead === true), 'read-aloud is on by default');
  console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no page errors');
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

// End-to-end walk through both programmes in a real browser (Chromium via Playwright).
// Run: serve the folder (python3 -m http.server 8765 in learn/) then: node tests/e2e.js
// AI calls are mocked, so no key is needed.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const BASE = process.env.APP_URL || 'http://localhost:8765/index.html';
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1180, height: 820 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/ERR_|favicon/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  const apiCalls = [];
  await p.route('https://api.anthropic.com/**', async (route) => {
    const body = JSON.parse(route.request().postData());
    apiCalls.push({ headers: route.request().headers(), body });
    const last = JSON.stringify(body.messages[body.messages.length - 1].content);
    let text = 'Think of **3 groups of 4** — that makes 12.';
    if (/JSON array/.test(last)) text = '[{"type":"mc","q":"What is 3 x 4?","options":["12","7","34","10"],"answer":0,"explain":"3 groups of 4."},{"type":"input","q":"What is 5 x 2?","answer":"10","explain":"Double 5."}]';
    if (/below|par|assessment/i.test(last)) text = '**Mathematics: on par.** Keep practising times tables for 5 minutes a day.';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'm', type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn' }) });
  });
  const go = (path) => p.evaluate((x) => LA.go(x), path);
  async function answer(correct) {
    const q = await p.evaluate(() => { const q = LA.ui.currentQuestion; return { type: q.type, answer: q.answer, n: q.options ? q.options.length : 0, dictation: !!q.dictation }; });
    if (q.type === 'mc') await p.locator('.opt').nth(correct ? q.answer : (q.answer + 1) % q.n).click();
    else if (q.type === 'input') {
      const a = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      await p.fill('.answer-input', correct ? String(a).replace('.', LA_DEC) : 'zzzz');
      await p.click('.answer-row .btn');
    } else if (q.type === 'write') {
      await p.fill('textarea', 'This is my answer with plenty of words to pass the minimum length check for writing tasks today.');
      await p.click('text=I’m finished');
      return 'write';
    }
    return q.type;
  }
  let LA_DEC = '.';
  async function runAll(correct) {
    for (let guard = 0; guard < 40; guard++) {
      if (!(await p.locator('.q-wrap').count())) return;
      const before = await p.evaluate(() => LA.ui.currentQuestion && LA.ui.currentQuestion.iid);
      const t = await answer(correct);
      if (t === 'write') { await p.waitForTimeout(150); continue; }
      if (!correct) { await p.waitForTimeout(80); if (await p.locator('.answer-input').count() && !(await p.locator('.answer-input').isDisabled())) { await p.fill('.answer-input', 'zzzz'); await p.click('.answer-row .btn'); } else if (await p.locator('.opt:not([disabled])').count()) { const q = await p.evaluate(() => ({ a: LA.ui.currentQuestion.answer, n: LA.ui.currentQuestion.options.length })); await p.locator('.opt').nth((q.a + 2) % q.n).click(); } }
      const next = p.locator('.q-wrap .btn.big');
      if (await next.count()) await next.click();
      await p.waitForTimeout(60);
      const after = await p.evaluate(() => LA.ui.currentQuestion && LA.ui.currentQuestion.iid);
      if (after === before && (await p.locator('.q-wrap').count())) { /* exam mode moves on by itself */ }
    }
  }

  await p.goto(BASE);
  await p.waitForTimeout(400);
  // onboarding
  await p.fill('#wname', 'Tosia');
  await p.click('.card button.btn.big');
  await p.waitForTimeout(250);
  ok(await p.locator('h1:has-text("How it works")').count() === 1, 'tutorial shown after onboarding');
  await p.click('.content > .row .btn.big');
  await p.waitForTimeout(250);
  ok(await p.locator('.plan-item').count() >= 2, 'today’s plan has items');
  // AI key for AI features
  await p.evaluate(() => { LA.store.state().settings.apiKey = 'sk-test'; LA.store.saveMain(); });
  // lesson flow via Start today
  await p.click('.hero .btn.big');
  await p.waitForTimeout(250);
  ok(await p.locator('.step-card').count() === 1, 'lesson opens on Learn together');
  for (let i = 0; i < 12 && (await p.locator('button:has-text("Next step")').count()); i++) { await p.click('button:has-text("Next step")'); await p.waitForTimeout(40); }
  await p.click('button:has-text("Let’s practise")');
  await p.waitForTimeout(150);
  await runAll(true);
  ok(await p.locator('text=Homework is ready').count() === 1, 'practice done → homework assigned');
  const lessonKey = await p.evaluate(() => Object.keys(LA.store.P().lessons)[0]);
  ok(!!lessonKey, 'lesson ticked off: ' + lessonKey);
  await p.click('button:has-text("See homework")');
  await p.click('button:has-text("Start homework")');
  await runAll(true);
  ok(await p.locator('.result-big').count() === 1, 'homework finished');
  // chapter quiz
  const chKey = lessonKey.split('.').slice(0, 3).join('.');
  await go('quiz/' + chKey);
  await p.waitForTimeout(200);
  const startQuiz = p.locator('.card .btn.big');
  if (await startQuiz.count()) await startQuiz.first().click();
  await runAll(true);
  ok(await p.evaluate((k) => LA.store.isChapterPassed(k), chKey), 'chapter quiz passed: ' + chKey);
  // wrong answers create extra practice and offer AI explanation
  await go('lesson/y3.maths.times-tables.' + (await p.evaluate(() => LA.index.chapters['y3.maths.times-tables'].lessons[0].id)));
  await p.waitForTimeout(150);
  await p.click('.seg button:nth-child(2)');
  await p.waitForTimeout(150);
  await answer(false);
  await p.waitForTimeout(80);
  await answer(false);
  await p.waitForTimeout(120);
  const explainBtn = p.locator('button:has-text("Explain it another way")');
  if (await explainBtn.count()) { await explainBtn.click(); await p.waitForTimeout(400); }
  ok(apiCalls.length >= 1 && (await p.locator('.ai-box').count()) >= 1, 'AI explanation shown after two wrong tries');
  ok(apiCalls.every((c) => c.headers['anthropic-dangerous-direct-browser-access'] === 'true'), 'API calls use the browser-access header');
  // tutor chat
  await p.click('.tutor-fab');
  await p.fill('.tutor-input input', 'Help me with 3 x 4');
  await p.click('.tutor-input .btn');
  await p.waitForTimeout(500);
  ok(await p.locator('.msg.assistant:has-text("groups of 4")').count() >= 1, 'tutor chat answers');
  await p.click('.tutor-head button:last-child');
  // screens
  for (const v of ['subjects', 'subject/y3.english', 'chapter/y3.english.sentences', 'homework', 'words', 'bridge', 'help', 'curriculum', 'exam/y3.maths', 'challenge/y3.maths.place-value', 'practice/skill/y3.maths.place-value']) {
    await go(v);
    await p.waitForTimeout(120);
    ok(!(await p.locator('h2:has-text("Something went wrong")').count()), 'screen renders: ' + v);
  }
  // parent portal
  for (const t of ['overview', 'assign', 'settings', 'learners', 'cloud']) {
    await go('parent/' + t);
    await p.waitForTimeout(150);
    ok(!(await p.locator('h2:has-text("Something went wrong")').count()), 'parent tab renders: ' + t);
  }
  // Polish programme
  await p.evaluate(() => { LA.state.prog = 'pl'; LA.go('home'); });
  await p.waitForTimeout(200);
  ok(await p.locator('h2:has-text("Plan na dziś")').count() === 1, 'Polish home in Polish');
  LA_DEC = ',';
  await go('lesson/p3.polski.ou.dyktando-ou');
  await p.waitForTimeout(150);
  await p.click('.seg button:nth-child(2)');
  await p.waitForTimeout(150);
  ok(await p.locator('.dictation-play').count() === 1, 'Polish dictation question shown');
  await runAll(true);
  ok(await p.evaluate(() => LA.store.isLessonDone('p3.polski.ou.dyktando-ou')), 'Polish dictation lesson completed');
  await go('lesson/p3.matematyka.liczby-1000.setki');
  await p.waitForTimeout(150);
  await p.click('.seg button:nth-child(2)');
  await runAll(true);
  ok(await p.evaluate(() => LA.store.isLessonDone('p3.matematyka.liczby-1000.setki')), 'Polish maths lesson completed');
  // iPad portrait and phone: tab bar, no sideways scrolling
  for (const [w, hgt, name] of [[820, 1180, 'iPad portrait'], [390, 844, 'phone']]) {
    await p.setViewportSize({ width: w, height: hgt });
    await go('home');
    await p.waitForTimeout(200);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok((await p.locator('.tabbar').isVisible()) && over <= 1, `${name}: tab bar visible, no horizontal scroll (${over}px)`);
  }
  // dark theme still works
  await p.evaluate(() => { LA.store.setSetting('theme', 'dark'); LA.refresh(); });
  await p.waitForTimeout(100);
  ok((await p.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark', 'dark theme option works');

  console.log(errs.length ? 'ERRORS:\n' + [...new Set(errs)].join('\n') : 'no page errors');
  ok(!errs.length, 'no page errors');
  console.log(fails ? fails + ' FAILED' : 'ALL PASSED');
  await b.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

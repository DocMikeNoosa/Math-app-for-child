const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const URL = 'file://' + require('path').join(__dirname, '..', 'index.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts.g/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  let apiRequests = [];
  await p.route('https://api.anthropic.com/**', async route => {
    const req = route.request();
    const body = JSON.parse(req.postData());
    apiRequests.push({ headers: req.headers(), body });
    const last = body.messages[body.messages.length - 1].content;
    let text = 'G\'day! Think of **3 groups of 4** apples. That makes 12.';
    if (/JSON array/.test(last)) text = 'Here you go:\n[{"type":"mc","q":"What is 3 x 4?","options":["12","7","34","10"],"answer":0,"explain":"3 groups of 4 is 12."},{"type":"input","q":"What is 5 x 2?","answer":"10","explain":"Double 5."},{"type":"mc","q":"bad","options":["a"],"answer":3}]';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', content: [{ type: 'text', text }], stop_reason: 'end_turn' }) });
  });

  async function answerCurrent(correct) {
    const q = await p.evaluate(() => { const q = LA.ui.currentQuestion; return { type: q.type, answer: q.answer, n: q.options ? q.options.length : 0 }; });
    if (q.type === 'mc') {
      const idx = correct ? q.answer : (q.answer + 1) % q.n;
      await p.locator('.opt').nth(idx).click();
    } else if (q.type === 'input') {
      const a = Array.isArray(q.answer) ? q.answer[0] : q.answer;
      await p.fill('.answer-input', correct ? String(typeof a === 'number' ? +a.toFixed(6) : a) : 'zzz');
      await p.click('text=Check ✔');
    } else if (q.type === 'write') {
      await p.fill('textarea', 'This is my story about a kangaroo who found a shiny rock in the bush and took it home to show her mum and all her friends.');
      await p.click('text=I’m finished ✔');
      return 'write';
    }
    return q.type;
  }
  async function runPractice(correct) {
    for (let k = 0; k < 30; k++) {
      if (!(await p.$('.qcard'))) return;
      if (!(await p.$('.qtext'))) return;
      const t = await answerCurrent(correct);
      await sleep(30);
      if (t === 'write') continue;
      if (!correct) { // second wrong try reveals
        if (await p.$('.answer-input:not([disabled])')) { await p.fill('.answer-input', 'zzz'); await p.click('text=Check ✔'); }
        else if (await p.$('.opt:not([disabled]):not(.wrong)') && !(await p.$('.feedback.info'))) { const qa = await p.evaluate(() => { const q = LA.ui.currentQuestion; return (q.answer + 2) % q.options.length; }); await p.locator('.opt').nth(qa).click(); }
      }
      await sleep(30);
      const nb = p.locator('button:has-text("Next →"), button:has-text("Finish ✔"), button:has-text("Finish quiz ✔")');
      if (await nb.count()) await nb.first().click();
      await sleep(30);
    }
  }
  async function runQuiz(correctFn) {
    for (let k = 0; k < 40; k++) {
      if (!(await p.$('.qtext'))) return;
      await answerCurrent(correctFn(k));
      await sleep(25);
    }
  }

  // 1. onboarding
  await p.goto(URL);
  ok(await p.isVisible('text=Welcome to your Learning Workbook'), 'welcome screen');
  await p.fill('input[aria-label="Learner first name"]', 'Sam');
  await p.click('text=Let’s start!');
  await sleep(200);
  ok(await p.isVisible('text=Today’s homework'), 'home with homework');
  const hwCount = await p.locator('.hw-item').count();
  ok(hwCount >= 2, 'homework has items: ' + hwCount);
  ok((await p.locator('.subject-tile').count()) === 7, '7 subject tiles');

  // 2. visit every page (year 3)
  const keys = await p.evaluate(() => { const y = LA.curriculum[3]; return { subs: y.subjects.map(s => s.key), chs: y.subjects.flatMap(s => s.chapters.map(c => c.key)), ls: y.subjects.flatMap(s => s.chapters.flatMap(c => c.lessons.map(l => l.key))) }; });
  for (const k of keys.subs) { await p.goto(URL + '#/subject/' + k); await sleep(20); }
  for (const k of keys.chs) { await p.goto(URL + '#/chapter/' + k); await sleep(10); }
  for (const k of keys.ls) { await p.goto(URL + '#/lesson/' + k); await sleep(10); }
  ok(errs.length === 0, 'visited all Y3 pages without errors (' + (keys.subs.length + keys.chs.length + keys.ls.length) + ' pages) ' + errs.slice(0, 3).join(' | '));

  // 3. lesson practice correct -> complete
  await p.goto(URL + '#/lesson/y3.maths.place-value.thousands');
  await p.click('text=Start practice');
  await runPractice(true);
  ok(await p.isVisible('text=Lesson complete'), 'lesson completes with correct answers');
  ok(await p.evaluate(() => LA.store.isLessonDone('y3.maths.place-value.thousands')), 'lesson stored done');
  ok(await p.evaluate(() => LA.store.P().homework[LA.U.todayKey()].items.find(i => i.ref === 'y3.maths.place-value.thousands').done), 'homework item ticked');

  // 4. lesson practice wrong -> dwell, then retry wrong again -> moves on w/ remediation
  await p.goto(URL + '#/lesson/y3.maths.place-value.read-write');
  await p.click('text=Start practice');
  await runPractice(false);
  ok(await p.isVisible('text=Let’s look at this one again'), 'dwell screen after low practice score');
  ok(!(await p.evaluate(() => LA.store.isLessonDone('y3.maths.place-value.read-write'))), 'lesson not ticked after fail');
  await p.click('text=Try new questions');
  await runPractice(false);
  ok(await p.evaluate(() => LA.store.openRemediation().some(r => r.skill === 'y3.maths.place-value.read-write')), 'remediation created after 2nd failure');

  // 5. quiz fail -> blocking remediation -> retake locked
  await p.goto(URL + '#/quiz/y3.maths.patterns');
  await p.click('button:has-text("Start →")');
  await runQuiz(k => k === 0);
  ok(await p.isVisible('text=Not passed yet'), 'quiz fail result');
  const blocking = await p.evaluate(() => LA.store.openRemediation().filter(r => r.chapterKey === 'y3.maths.patterns' && r.blocking).length);
  ok(blocking > 0, 'blocking remediation after quiz fail: ' + blocking);
  await p.goto(URL + '#/home');
  await p.goto(URL + '#/quiz/y3.maths.patterns');
  ok(await p.isDisabled('button:has-text("Start →")'), 'retake locked until extra practice');
  // do remediations
  for (let r = 0; r < 5; r++) {
    const id = await p.evaluate(() => { const x = LA.store.openRemediation().find(r => r.chapterKey === 'y3.maths.patterns' && r.blocking); return x && x.id; });
    if (!id) break;
    await p.goto(URL + '#/practice/rem/' + id);
    await p.click('button:has-text("Start practice")');
    await runPractice(true);
    await sleep(50);
  }
  ok((await p.evaluate(() => LA.store.openRemediation().filter(r => r.chapterKey === 'y3.maths.patterns' && r.blocking).length)) === 0, 'remediation cleared');
  await p.goto(URL + '#/quiz/y3.maths.patterns');
  ok(!(await p.isDisabled('button:has-text("Start →")')), 'retake unlocked');
  await p.click('button:has-text("Start →")');
  await runQuiz(() => true);
  ok(await p.isVisible('text=You passed'), 'quiz pass');
  ok(await p.evaluate(() => LA.store.isChapterPassed('y3.maths.patterns')), 'chapter stored passed');

  // 6. test out
  await p.goto(URL + '#/quiz/y3.science.living?mode=testout');
  await p.click('button:has-text("Start →")');
  await runQuiz(() => true);
  ok(await p.isVisible('text=Tested out'), 'test out success');
  ok(await p.evaluate(() => LA.index.chapters['y3.science.living'].lessons.every(l => LA.store.isLessonDone(l.key))), 'test out ticks all lessons');

  // 7. writing lesson
  await p.goto(URL + '#/lesson/y3.english.narrative.write-story');
  await p.click('text=Start practice');
  await runPractice(true);
  ok(await p.isVisible('text=Lesson complete'), 'writing lesson completes');

  // 8. listening lesson shows hidden words + play
  await p.goto(URL + '#/lesson/y3.english.listening.listen-notices');
  ok(await p.isVisible('text=Show the words'), 'listening block hides text');
  await p.click('text=Start practice');
  ok(await p.isVisible('text=Play the listening passage'), 'listening replay in questions');

  // 9. start point
  await p.goto(URL + '#/subject/y3.hass');
  await p.click('text=Choose where to start');
  await p.selectOption('.modal select', '3');
  await p.click('.modal button:has-text("Start here")');
  await sleep(100);
  ok((await p.locator('.status.skipped').count()) === 3, 'start point marks 3 chapters skipped');
  const nxt = await p.evaluate(() => LA.tutor.nextStep(LA.index.subjects['y3.hass']).chapter.key);
  ok(nxt === 'y3.hass.neighbours', 'next step after start point: ' + nxt);

  // 10. parent area + AI settings
  await p.goto(URL + '#/parent');
  ok(await p.isVisible('text=Progress by subject'), 'parent report');
  await p.goto(URL + '#/parent/settings');
  await p.fill('input[aria-label="Anthropic API key"]', 'sk-ant-test');
  await p.selectOption('select[aria-label="Daily minutes"]', '60');
  await p.click('text=Save settings');
  await p.click('text=Test the AI connection');
  await sleep(300);
  ok(await p.isVisible('text=✓ Working'), 'AI connection test (mocked)');
  const r0 = apiRequests[0];
  ok(r0 && r0.headers['x-api-key'] === 'sk-ant-test' && r0.headers['anthropic-version'] === '2023-06-01' && r0.headers['anthropic-dangerous-direct-browser-access'] === 'true', 'API headers');
  ok(r0 && r0.body.model === 'claude-opus-5-5' && r0.body.fallbacks === 'default' && r0.headers['anthropic-beta'] === 'server-side-fallback-2026-07-01' && r0.body.output_config.effort === 'low', 'API body: model/fallbacks/effort');
  ok(r0 && /Year 3/.test(r0.body.system) && /Australian/.test(r0.body.system), 'system prompt has year + Australian context');

  // 11. AI chat
  await p.goto(URL + '#/lesson/y3.maths.times-tables.groups');
  await p.click('.koa-fab');
  await p.fill('input[aria-label="Message Koa"]', 'What is 3 times 4?');
  await p.click('.koa-input button');
  await sleep(300);
  ok(await p.isVisible('.msg.assistant >> text=3 groups of 4'), 'Koa chat reply rendered');
  ok(/Current lesson/.test(apiRequests[apiRequests.length - 1].body.system), 'chat sends lesson context');
  await p.click('.koa-head button[aria-label="Close"]');

  // 12. AI generated practice
  await p.goto(URL + '#/practice/skill/' + encodeURIComponent('y3.maths.times-tables.groups'));
  await p.click('text=Koa, make me new questions');
  await sleep(400);
  ok(await p.isVisible('text=Made by Koa for you'), 'AI questions shown');
  const aiq = await p.evaluate(() => LA.ui.currentQuestion.q);
  ok(aiq === 'What is 3 x 4?', 'AI question parsed; invalid one dropped');
  await runPractice(true);
  ok(await p.isVisible('text=Nailed it'), 'AI practice completes');

  // 13. explain mistake with AI in practice
  await p.goto(URL + '#/lesson/y3.maths.times-tables.facts-3-4');
  await p.click('text=Start practice');
  await answerCurrent(false); await sleep(30);
  if (await p.$('.answer-input:not([disabled])')) { await p.fill('.answer-input', 'zzz'); await p.click('text=Check ✔'); }
  await sleep(50);
  await p.click('text=Explain it another way');
  await sleep(300);
  ok(await p.isVisible('.ai-box >> text=3 groups of 4'), 'AI explanation box');

  // 14. homework regenerated with 60 min
  await p.goto(URL + '#/home');
  const mins = await p.evaluate(() => LA.store.P().homework[LA.U.todayKey()].budget);
  ok(mins === 60, 'homework budget follows settings: ' + mins);

  // 15. PIN gate
  await p.goto(URL + '#/parent/settings');
  await p.fill('input[aria-label="Parent PIN"]', '1234');
  await p.click('text=Save settings');
  await p.reload(); await sleep(100);
  await p.goto(URL + '#/parent');
  ok(await p.isVisible('text=Grown-ups only'), 'PIN gate shows');
  await p.fill('input[aria-label="Parent PIN"]', '1234'); await p.keyboard.press('Enter'); await sleep(100);
  ok(await p.isVisible('text=Progress by subject'), 'PIN unlocks');

  // 16. Year 4 profile + all pages
  await p.goto(URL + '#/parent/children');
  await p.click('text=+ Add a learner'); await sleep(100);
  await p.fill('input[aria-label="Learner first name"]', 'Lily');
  await p.click('button:has-text("Year 4")');
  await p.click('text=Let’s start!'); await sleep(200);
  ok(await p.isVisible('text=Year 4'), 'year 4 profile');
  const k4 = await p.evaluate(() => { const y = LA.curriculum[4]; return { chs: y.subjects.flatMap(s => s.chapters.map(c => c.key)), ls: y.subjects.flatMap(s => s.chapters.flatMap(c => c.lessons.map(l => l.key))), subs: y.subjects.map(s=>s.key) }; });
  const before = errs.length;
  for (const k of k4.subs) { await p.goto(URL + '#/subject/' + k); await sleep(10); }
  for (const k of k4.chs) { await p.goto(URL + '#/chapter/' + k); await sleep(10); }
  for (const k of k4.ls) { await p.goto(URL + '#/lesson/' + k); await sleep(10); }
  ok(errs.length === before, 'visited all Y4 pages without errors');
  await p.goto(URL + '#/lesson/y4.maths.times-tables.tables-6-9');
  await p.click('text=Start practice'); await runPractice(true);
  ok(await p.isVisible('text=Lesson complete'), 'Y4 lesson completes');
  await p.goto(URL + '#/curriculum');
  ok(await p.isVisible('text=Curriculum coverage'), 'curriculum page');

  // 17. persistence across reload
  await p.reload(); await sleep(100);
  ok(await p.evaluate(() => LA.store.profiles().length === 2 && LA.store.activeProfile().name === 'Lily'), 'state persists after reload');

  // screenshots
  await p.goto(URL + '#/home'); await sleep(150); await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'home.png'), fullPage: true });
  await p.goto(URL + '#/lesson/y4.science.water-cycle.cycle'); await sleep(150); await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'lesson4.png') });
  await p.goto(URL + '#/lesson/y4.maths.time.clocks'); await p.click('text=Start practice'); await sleep(100); await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'question.png') });
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await m.goto(URL); await sleep(200); await m.screenshot({ path: require('path').join(require('os').tmpdir(), 'mobile-dark.png') });
  await m.goto(URL + '#/subject/y4.english'); await sleep(150); await m.screenshot({ path: require('path').join(require('os').tmpdir(), 'mobile-subject.png') });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(!overflow, 'no horizontal scroll on phone');

  ok(errs.length === 0, 'no console/page errors overall ' + errs.slice(0, 5).join(' | '));
  console.log(fails ? `\n${fails} FAILURES` : '\nALL PASSED');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });

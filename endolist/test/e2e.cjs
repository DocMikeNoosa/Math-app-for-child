// EndoList — test end-to-end (Playwright + Chromium). Uruchom serwer (node server.mjs), potem: LC_ALL=C.UTF-8 node test/e2e.cjs
// Zastępniki: folder (OPFS z tym samym API), passkey (wirtualny uwierzytelniacz z PRF), rozpoznawanie mowy (fałszywy
// SpeechRecognition) i API Claude (odpowiedzi testowe — oznaczone jako MOCK, nie są prawdziwymi wynikami AI).
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const URL0 = process.env.ENDOLIST_URL || 'http://localhost:4173/';
const OUT = process.env.OUT || path.join(os.tmpdir(), 'endolist-e2e');
const PROFILE = path.join(OUT, 'profile');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const init = `
window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); return r.getDirectoryHandle('EndoList', { create: true }); };
window.SpeechRecognition = class { start() { setTimeout(() => { const r = [{ transcript: window.__speak || 'usunięto stary wkład metalowy' }]; r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); }, 150); } stop() { setTimeout(() => this.onend && this.onend(), 30); } abort() {} };`;
let failures = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) failures++; };
function pesel(y, m, d, female) { // valid PESEL for tests
  const mm = m + (y >= 2000 ? 20 : 0), base = `${String(y % 100).padStart(2, '0')}${String(mm).padStart(2, '0')}${String(d).padStart(2, '0')}123${female ? 4 : 5}`;
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3], s = base.split('').reduce((a, x, i) => a + w[i] * +x, 0); return base + ((10 - (s % 10)) % 10);
}
async function launch() {
  const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1500, height: 960 }, acceptDownloads: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  await ctx.addInitScript(init);
  const p = ctx.pages()[0] || (await ctx.newPage());
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_FAILED|net::|GPU stall|WebGL/.test(m.text())) p.errs.push('CONSOLE ' + m.text()); });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true } });
  await p.goto(URL0); await p.waitForTimeout(400);
  return [ctx, p];
}
async function opfsTree(p) { return p.evaluate(async () => { const out = []; async function walk(d, pre) { for await (const [n, h] of d.entries()) { if (h.kind === 'directory') await walk(h, pre + n + '/'); else out.push(pre + n); } } await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('EndoList'), ''); return out.sort(); }); }
async function opfsRead(p, rel) { return Buffer.from(await p.evaluate(async (rel) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('EndoList'); const parts = rel.split('/'); for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x); const f = await (await d.getFileHandle(parts.at(-1))).getFile(); const a = new Uint8Array(await f.arrayBuffer()); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); }, rel), 'base64'); }
const shot = (p, n, o = {}) => p.screenshot({ path: path.join(OUT, n + '.png'), ...o });

// MOCK Claude API: answers depend on which task the system prompt describes
const aiCalls = [];
async function mockAI(p, reviseOut) {
  await p.route('https://api.anthropic.com/**', async (route) => {
    const body = route.request().postDataJSON(); const sys = body.system[0].text; aiCalls.push({ body, headers: route.request().headers() });
    let out;
    if (sys.includes('automatycznego rozpoznawania mowy')) out = { text: 'Usunięto stary wkład metalowy przy użyciu ultradźwięków.', warnings: [] };
    else if (sys.includes('Poprawiasz istniejący list')) out = reviseOut(body);
    else out = { opening: 'MOCK', sections: [], recommendations: [], closing: 'MOCK', warnings: [] };
    // the app streams (SSE) — answer like the real API does
    const text = JSON.stringify(out), ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
    const sseBody = ev('message_start', { type: 'message_start', message: { id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 1 } } })
      + ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })
      + ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } })
      + ev('content_block_stop', { type: 'content_block_stop', index: 0 })
      + ev('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 10 } })
      + ev('message_stop', { type: 'message_stop' });
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: sseBody });
  });
}

(async () => {
  let [ctx, p] = await launch();
  // ---------- onboarding
  await p.selectOption('[data-ob=title]', 'lek. dent.'); await p.selectOption('[data-ob=gender]', 'f');
  await p.fill('[data-ob=first]', 'Katarzyna'); await p.fill('[data-ob=last]', 'Zielińska'); await p.fill('[data-ob=specialty]', 'specjalista endodoncji');
  await shot(p, '01-welcome');
  await p.click('[data-act=ob-next]');
  ok((await p.inputValue('[data-ob=practice]')) === 'Centrum Stomatologiczne' && (await p.inputValue('[data-ob=group]')) === 'Niewiński Group', 'clinic defaults prefilled');
  await p.fill('[data-ob=phone]', '+48 25 000 00 00'); await p.fill('[data-ob=email]', 'rejestracja@example.pl');
  await p.waitForSelector('.logo-slot img', { timeout: 5000 });
  ok(await p.locator('.logo-slot img').count() === 1, 'Centrum Stomatologiczne logo prefilled');
  await shot(p, '02-clinic');
  await p.click('[data-act=ob-next]');
  const sig = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 600; c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 200); x.strokeStyle = '#1a2a6c'; x.lineWidth = 5; x.beginPath(); x.moveTo(40, 140); x.bezierCurveTo(120, 20, 160, 190, 240, 90); x.bezierCurveTo(300, 30, 330, 170, 420, 100); x.bezierCurveTo(470, 70, 520, 120, 560, 80); x.stroke(); return c.toDataURL('image/png').split(',')[1]; });
  fs.writeFileSync(path.join(OUT, 'sig.png'), Buffer.from(sig, 'base64'));
  await p.setInputFiles('#ob-sig-input', path.join(OUT, 'sig.png')); await p.waitForTimeout(400);
  await p.click('[data-act=ob-next]');
  await p.fill('[name=username]', 'kasia'); await p.fill('[name=pw]', 'Tajne-haslo-123'); await p.fill('[name=pw2]', 'Tajne-haslo-123');
  await p.click('[data-act=ob-create]'); await p.waitForSelector('[data-act=ob-finish]', { timeout: 20000 });
  await p.click('[data-act=ob-passkey]'); await p.waitForTimeout(1200);
  ok((await p.textContent('#pk-state')).includes('dodany'), 'passkey (PRF) registered');
  await p.click('[data-act=ob-finish]'); await p.waitForSelector('#arch', { timeout: 20000 });
  ok(await p.locator('.clinic-logo.dark img').count() === 1, 'clinic logo (light version) shown in top bar');
  await p.click('.banner [data-act=folder-pick]'); await p.waitForTimeout(1000);
  // ---------- patient with PESEL + referrer
  const PES = pesel(1980, 3, 12, true);
  await p.click('[data-act=pick-patient]');
  await p.fill('.modal [data-f=first]', 'Anna'); await p.fill('.modal [data-f=last]', 'Kowalska'); await p.fill('.modal [data-f=pesel]', PES); await p.waitForTimeout(100);
  ok((await p.inputValue('.modal [data-f=dob]')) === '1980-03-12' && (await p.inputValue('.modal [data-f=sex]')) === 'f' && (await p.textContent('.pesel-state')).includes('poprawny'), 'PESEL fills date of birth and sex: ' + PES);
  await shot(p, '03-patient');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.click('[data-act=pick-referrer]');
  await p.selectOption('.modal [data-f=gender]', 'f'); await p.fill('.modal [data-f=first]', 'Maria'); await p.fill('.modal [data-f=last]', 'Nowak');
  await p.fill('.modal [data-f=clinic]', 'Gabinet Stomatologiczny Uśmiech'); await p.fill('.modal [data-f=address]', 'ul. Kwiatowa 5\n08-110 Siedlce'); await p.fill('.modal [data-f=email]', 'm.nowak@usmiech.example');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.fill('[data-b="v.date"]', '2026-10-08');
  ok(await p.locator('#flow .fstep.done').count() === 1 && (await p.textContent('#flow .fstep.on')).includes('Zęby'), 'visit guide: step 1 (patient + referrer) done, step 2 (teeth) next');
  ok(await p.locator('[data-b="v.notes"]').count() === 0 && await p.locator('[data-act=vnotes-open]').count() === 1, 'visit notes tucked behind a button while empty');
  await p.click('[data-act=vnotes-open]'); ok(await p.locator('[data-b="v.notes"]').isVisible(), 'visit notes open on click');
  await shot(p, '04-visit-empty');
  // ---------- tooth 36 in the enlarged workspace
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(1500);
  ok(await p.locator('#stage canvas').count() === 1, '3D model rendered (WebGL canvas)');
  await p.click('[data-act=cfg][data-i="1"]'); await p.waitForTimeout(300);
  await p.selectOption('[data-b="t.roots.1.lateral"]', 'srodkowa'); await p.waitForTimeout(800);
  await shot(p, '05-ws-anatomy');
  ok(await p.locator('#ws-tabs .step').count() === 7 && await p.locator('#ws-tabs .step.on.done[data-ttab=anat]').count() === 1 && (await p.textContent('#ws-tabs [data-ttab=dx] .n')) === '2', 'tooth card shows 7 numbered steps; step 1 active and ticked once anatomy is chosen');
  await p.click('.step-nav [data-ttab=dx]'); await p.waitForTimeout(200);
  ok(await p.locator('#ws-tabs .step.on[data-ttab=dx]').count() === 1 && (await p.textContent('.step-nav')).includes('Krok 2 z 7'), '"Dalej" moves to step 2 (Badanie)');
  await p.click('#ws-tabs [data-ttab=anat]'); await p.waitForTimeout(200);
  await p.click('[data-ttab=dx]');
  await p.fill('[data-b="t.dx.history.cc"]', 'ból przy nagryzaniu od dwóch tygodni');
  const seg = (k, v) => p.click(`[data-seg="${k}"] button[data-v="${v}"]`);
  await seg('t.dx.tests.cold', 'nr'); await seg('t.dx.tests.ept', 'neg'); await seg('t.dx.tests.perc', 'pain'); await seg('t.dx.tests.palp', 'wnl'); await seg('t.dx.tests.bite', 'pain'); await p.fill('[data-b="t.dx.tests.probe"]', '3'); await seg('t.dx.tests.mob', 'phys');
  await p.click('label.chip:has(input[data-arr="t.dx.radio"][value=parl])');
  ok((await p.textContent('#dxbox')).includes('Martwica miazgi'), 'dx suggestion in workspace');
  await p.click('[data-ttab=endo]');
  await p.selectOption('[data-b="t.endo.proc"]', 'RCT'); await p.waitForTimeout(200);
  for (const q of ['apexloc', 'wlxray', 'irrig:us', 'obtur:cwt', 'sealer:uszczelniacz bioceramiczny', 'temp:cavit', 'postxray']) await p.click(`[data-quick="${q}"]`);
  await seg('t.endo.anesth', 'block'); await p.fill('[data-b="t.endo.agent"]', 'Ubistesin forte, 1 karpula');
  const wls = p.locator('table.wl input[data-b$=".wl"]'); const wl = ['21', '21', '20,5', '21']; for (let i = 0; i < 4; i++) await wls.nth(i).fill(wl[i]);
  await p.fill('[data-b="t.endo.naocl"]', '5,25');
  // prognosis: large card right in the Endodoncja tab
  ok(await p.locator('#ws .prog-card .prog-seg button[data-v="good"]').isVisible(), 'prognosis card visible in the Endodoncja tab');
  await seg('t.rec.prog', 'fair'); await p.waitForTimeout(100);
  ok(await p.locator('#ws .prog-card.p-fair').count() === 1 && (await p.textContent('#ws .prog-card')).includes('niepewne'), 'prognosis chosen in Endodoncja (card shows the choice)'); await p.locator('#ws .prog-card').scrollIntoViewIfNeeded(); await p.locator('#ws .ws-right').screenshot({ path: path.join(OUT, '06b-prognosis.png') });
  await p.waitForTimeout(700);
  await shot(p, '06-ws-endo');
  await p.click('[data-ttab=mat]');
  await p.click('[data-act=pick-prod][data-name="ProTaper Gold"]');
  await p.selectOption('#mat-cat', 'apex'); await p.click('[data-act=pick-prod][data-name="Raypex 6"]');
  await p.selectOption('#mat-cat', 'sealer'); await p.fill('#mat-name', 'Mój uszczelniacz testowy'); await p.click('[data-act=add-prod]');
  ok(await p.locator('.chip.prod').count() === 3, '3 products chosen (incl. custom)');
  // microscope: big toggle on the Materials tab (not hidden), on by default for endo, brand optional
  ok(await p.locator('.micro-card.on label.micro-toggle').isVisible() && await p.locator('[data-b="t.endo.microBrand"]').isVisible(), 'microscope button visible on Materials tab (ticked by default) with optional brand field');
  await p.click('.micro-card label.micro-toggle'); await p.waitForTimeout(200);
  ok(await p.locator('.micro-card.on').count() === 0 && await p.locator('[data-b="t.endo.microBrand"]').count() === 0, 'microscope can be unticked (brand field hides)');
  await p.click('.micro-card label.micro-toggle'); await p.waitForTimeout(200);
  ok(await p.locator('.micro-card.on').count() === 1, 'microscope ticked again');
  await p.fill('[data-b="t.endo.microBrand"]', 'Zeiss Extaro 300'); await p.waitForTimeout(300);
  await shot(p, '07-ws-materials');
  // manual description with dictation (fake recogniser) + AI cleanup (MOCK)
  await mockAI(p, () => ({}));
  // a saved API key is enough: AI works straight away
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = ' sk-ant-test '; window.__endolist.save('settings', st); });
  await p.click('[data-ttab=manual]');
  await p.evaluate((pes) => { window.__speak = `pacjentka Anna Kowalska PESEL ${pes} telefon 501 234 567 kierowała doktor Maria Nowak usunięto stary wkład metalowy`; }, PES);
  await p.click('[data-mic="t.manual"]'); await p.waitForTimeout(500); await p.click('[data-mic="t.manual"]'); await p.waitForTimeout(1200);
  ok((await p.inputValue('[data-b="t.manual"]')) === 'Usunięto stary wkład metalowy przy użyciu ultradźwięków.', 'dictation → AI-cleaned text in manual description');
  const dIn = JSON.stringify(aiCalls.at(-1).body);
  ok(!/Kowalsk|Anna|Nowak|Maria|501 234|\d{11}/.test(dIn) && dIn.includes('[OSOBA-') && dIn.includes('[PESEL]'), 'RODO: names, PESEL and phone replaced by tokens before reaching AI');
  await p.evaluate(() => { window.__speak = ''; });
  await shot(p, '08-ws-manual');
  await p.click('[data-ttab=rec]');
  await p.selectOption('[data-b="t.rec.restor"]', 'crown'); await p.waitForTimeout(100); await seg('t.rec.time', '30d'); await seg('t.rec.control', '6-12m'); ok(await p.locator('#ws .prog-card [data-v="fair"].on').count() === 1, 'same prognosis shown in Zalecenia'); await seg('t.rec.prog', 'good');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  ok(await p.locator('#ws').count() === 0 && (await p.textContent('#vteeth')).includes('36'), 'tooth saved and workspace closed');
  ok(await p.locator('#flow .fstep.done').count() === 2 && await p.locator('#flow [data-act=flow-letter]:not([disabled])').count() === 1, 'visit guide: teeth done, step 3 (letter) ready');
  // tooth 37: filling with product; tooth 16 just viewed
  await p.click('#arch g.tooth[data-fdi="37"]'); await p.waitForSelector('#ws'); await p.click('[data-ttab=work]');
  await p.click('[data-act=add-work][data-type=FILL]'); await seg('t.work.0.cls', 'II');
  for (const s of ['M', 'O', 'D']) await p.click(`label.chip:has(input[data-arr="t.work.0.surf"][value=${s}])`);
  await p.selectOption('[data-b="t.work.0.mat"]', 'kompozyt'); await p.fill('[data-b="t.work.0.product"]', 'Filtek One Bulk Fill');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  await p.click('#arch g.tooth[data-fdi="16"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(1500); await shot(p, '09-ws-16');
  await p.click('[data-act=ws-cancel]'); await p.waitForTimeout(300); if (await p.locator('.modal').count()) await p.click('.modal footer .btn-danger'); await p.waitForTimeout(300);
  ok(!(await p.textContent('#vteeth')).includes('Pierwszy trzonowiec górny'), 'cancelled tooth not added');
  // tooth 26: examined only (no treatment) — must still be marked on the letter schematic
  await p.click('#arch g.tooth[data-fdi="26"]'); await p.waitForSelector('#ws'); await p.click('[data-ttab=dx]'); await seg('t.dx.tests.cold', 'wnl'); await seg('t.dx.tests.perc', 'wnl');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  await shot(p, '10-visit-full');
  // ---------- letter: built-in generator (no key)
  await p.unroute('https://api.anthropic.com/**');
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = ''; window.__endolist.save('settings', st); });
  await p.click('[data-act=gen-letter]'); await p.waitForSelector('#paper', { timeout: 20000 }); await p.waitForTimeout(800);
  const L0 = await p.evaluate(() => { const S = window.__endolist.S; return S.data.letters.get(S.letterId); });
  ok(L0.source === 'auto', 'letter created by built-in generator');
  console.log('--- LETTER (built-in generator) ---\n' + [L0.content.salutation, L0.content.opening, ...L0.content.sections.map((s) => s.heading + '\n' + s.paragraphs.join('\n')), 'Zalecenia: ' + L0.content.recommendations.join(' | '), L0.content.closing].join('\n'));
  ok((await p.textContent('#paper')).includes(PES), 'PESEL shown in the letter');
  const chart = await p.evaluate(() => { const svg = document.querySelector('#paper .lchart svg'); const badges = [...svg.querySelectorAll('circle[fill="#1d3557"]')].length; const txt = [...svg.querySelectorAll('text')].filter((t) => t.getAttribute('fill') === '#ffffff').map((t) => t.textContent); return { badges, txt }; });
  ok(['36', '37', '26'].every((n) => chart.txt.includes(n)), 'letter schematic marks every tooth in the letter (36 endo, 37 filling, 26 examined): ' + chart.txt.join(','));
  const body = await p.evaluate(() => [...document.querySelectorAll('#paper .lp, #paper h5')].map((e) => e.textContent).join(' '));
  ok(!/ProTaper|Raypex|Filtek/.test(body) && (await p.textContent('#paper .lchart')).includes('ProTaper Gold'), 'materials in the side box, not in the letter text');
  ok(/Przeprowadziłam leczenie kanałowe/.test(body) && /Kanały wypełniłam/.test(body), 'letter written in the first person by the doctor');
  ok((await p.textContent('#paper')).includes('lek. dent. Katarzyna Zielińska'), 'letter signed by the logged-in doctor');
  { const lc = await p.textContent('#paper .lchart'); ok(lc.includes('mikroskop Zeiss Extaro 300') && (lc.match(/mikroskop/g) || []).length === 1 && /mikroskopu zabiegowego/.test(body), 'microscope in the letter text, brand in the materials box (only for the root-canal tooth)'); }
  ok(await p.locator('#rside .next-card [data-act=next-patient]').isVisible() && await p.locator('#rside .next-card [data-act=go-home]').isVisible(), '"Nowy pacjent" and "Strona główna" buttons next to the letter');
  await shot(p, '11-review', { fullPage: true });
  // highlight a passage → popover → comment → tick "done"
  const sel = await p.evaluate(() => {
    const el = document.querySelector('#paper [data-loc="sections.0.paragraphs.0"]'); el.scrollIntoView({ block: 'center' }); const txt = el.firstChild; const s = txt.textContent; const i = s.indexOf('W badaniu'); const r = document.createRange(); r.setStart(txt, i); r.setEnd(txt, s.indexOf('.', i) + 1);
    const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); const b = r.getBoundingClientRect(); return { x: b.left + 5, y: b.top + 5, q: r.toString() };
  });
  await p.mouse.move(sel.x, sel.y); await p.mouse.up(); await p.waitForSelector('.note-pop', { timeout: 3000 });
  await p.fill('#np-text', 'Za długie — skróć wyniki badania do najważniejszych.');
  await p.waitForTimeout(600); await shot(p, '12-highlight-popover');
  await p.click('#np-done'); await p.waitForTimeout(300);
  ok(await p.locator('mark.note').count() === 1 && await p.locator('.note-card').count() === 1, 'note saved and passage highlighted');
  await p.click('#gen-edit'); await p.fill('#gen-text', 'Bardziej zwięźle i bardziej formalnie.');
  await shot(p, '13-notes', { fullPage: true });
  // AI revision (MOCK response, applies a visible change so the flow can be checked)
  await mockAI(p, (body) => { const inp = JSON.parse(body.messages[0].content); const l = inp.letter; l.sections[0].paragraphs[0] = l.sections[0].paragraphs[0].replace(/W badaniu [^.]*\./, 'W badaniu ząb nie reagował na testy żywotności, a opukiwanie było bolesne.'); return { ...l, changes: ['Skrócono opis badania zęba 36.', 'Ujednolicono styl na bardziej formalny.'], warnings: [] }; });
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = 'sk-ant-test'; window.__endolist.save('settings', st); });
  await p.evaluate(() => window.__endolist.rerender());
  await p.click('[data-act=revise]'); await p.waitForTimeout(1500);
  const rv = aiCalls.at(-1); const rIn = JSON.parse(rv.body.messages[0].content);
  ok(rIn.annotations.length === 1 && rIn.annotations[0].quote.startsWith('W badaniu') && rIn.instruction.includes('zwięźle'), 'revision request carries the highlight + general instruction');
  ok(!/Kowalska|Anna|Nowak|Maria|1980|Zielińska|Katarzyna|Uśmiech|\d{11}/.test(JSON.stringify(rIn)), 'revision request contains no personal data / PESEL');
  ok((await p.textContent('#paper')).includes('nie reagował na testy żywotności') && (await p.textContent('#rside')).includes('Skrócono opis badania'), 'AI revision applied and changes listed');
  await shot(p, '14-revised', { fullPage: true });
  // manual editing
  await p.click('label.switch:has(#manual-edit)'); await p.waitForTimeout(200);
  await p.click('#paper [data-loc="closing"]'); await p.keyboard.press('End'); await p.keyboard.type(' Pozdrawiam serdecznie.');
  await p.click('label.switch:has(#manual-edit)'); await p.waitForTimeout(200);
  ok((await p.evaluate(() => { const S = window.__endolist.S; return S.data.letters.get(S.letterId).content.closing; })).endsWith('Pozdrawiam serdecznie.'), 'manual edit saved');
  // save PDF
  await p.click('[data-act=save-pdf]'); await p.waitForTimeout(2500);
  const tree = await opfsTree(p); const pdf = tree.find((x) => x.startsWith('Listy/') && x.endsWith('.pdf'));
  ok(!!pdf, 'PDF saved: ' + pdf);
  fs.writeFileSync(path.join(OUT, 'letter.pdf'), await opfsRead(p, pdf));
  ok(!(await opfsRead(p, 'Kopia zapasowa (nie edytować)/endolist-dane.json')).toString().includes('Kowalska'), 'backup encrypted');
  // ProDentis: a plain treatment record for the chart, not the letter
  await p.click('[data-act=prodentis]'); await p.waitForSelector('#pd-text');
  const rec = await p.inputValue('#pd-text'); await p.waitForTimeout(600); await shot(p, '14b-prodentis');
  console.log('--- PRODENTIS RECORD ---\n' + rec);
  ok(/Ząb 36 — pierwszy trzonowiec dolny lewy/.test(rec) && /Rozpoznanie: martwica miazgi \(K04\.1\)/.test(rec) && /Leczenie: Wykonano leczenie kanałowe/.test(rec) && /Materiały i sprzęt: .*ProTaper Gold/.test(rec), 'ProDentis entry: per tooth — diagnosis, treatment, materials');
  ok(!/Szanown|Dziękuj|Przeprowadziłam|Pozdrawiam|Z wyrazami|skierowani/.test(rec), 'ProDentis entry has no letter phrasing (salutation, thanks, first person)');
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(URL0).origin });
  await p.fill('#pd-text', rec + '\nDopisek testowy.'); await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  ok((await p.evaluate(() => navigator.clipboard.readText())).endsWith('Dopisek testowy.'), 'ProDentis entry can be edited and copied');
  await p.click('.modal footer .btn-ghost'); await p.waitForTimeout(200);
  // print: big button, opens the letter PDF in a new window and calls print
  ok(await p.locator('.letter-main [data-act=print].btn-xl').count() === 1, 'big "Drukuj" button next to e-mail and PDF');
  await p.click('.letter-main [data-act=print]');
  await p.waitForFunction(() => document.querySelector('#print-frame')?.src.startsWith('blob:'), null, { timeout: 20000 }).catch(() => {});
  ok(await p.evaluate(() => document.querySelector('#print-frame')?.src.startsWith('blob:')), 'Drukuj loads the letter PDF and opens printing');
  // after the letter: home and next patient
  const letterId = await p.evaluate(() => window.__endolist.S.letterId);
  await p.click('#rside [data-act=go-home]'); await p.waitForSelector('#arch', { timeout: 5000 }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const S = window.__endolist.S; return S.view === 'visit' && !S.patientId && !S.letterId; }) && !(await p.textContent('#vteeth')).includes('36'), '"Strona główna" → empty main screen (new visit)');
  await p.evaluate((id) => window.__endolist.go('letter', { letterId: id }), letterId); await p.waitForSelector('#rside .next-card', { timeout: 10000 });
  await p.click('#rside [data-act=next-patient]'); await p.waitForSelector('.modal #psearch', { timeout: 5000 });
  ok(await p.evaluate(() => window.__endolist.S.view === 'visit') && await p.locator('.modal').count() === 1, '"Nowy pacjent" → fresh visit + patient picker');
  await p.click('.modal footer .btn-ghost'); await p.waitForTimeout(300);
  await p.click('.brand[data-act=go-home]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => window.__endolist.S.view === 'visit'), 'clicking the logo goes to the main screen');
  console.log('ERRORS-1', p.errs);
  // lock + passkey, restart + password, persistence
  await p.click('[data-act=lock]'); await p.waitForSelector('#login', { timeout: 10000 });
  ok(await p.locator('.auth-brand img.light').count() === 1, 'clinic logo on the login screen');
  await shot(p, '15-lock');
  await p.click('[data-act=passkey-login]'); await p.waitForSelector('#arch', { timeout: 15000 });
  await ctx.close();
  [ctx, p] = await launch();
  await p.fill('[name=password]', 'Tajne-haslo-123'); await p.click('#login button'); await p.waitForSelector('#arch', { timeout: 20000 });
  await p.click('[data-nav=patients]'); ok((await p.textContent('table.list')).includes('Kowalska'), 'data persisted after restart');
  // ---------- RODO: activity log, right of access/portability, erasure
  await p.click('[data-nav=settings]'); await p.waitForSelector('#rodo-panel');
  ok((await p.textContent('#rodo-panel')).includes('logowanie'), 'activity log shown in Settings');
  await p.locator('#rodo-panel').screenshot({ path: path.join(OUT, '16-rodo-panel.png') });
  const [csv] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=audit-csv]')]);
  const log = fs.readFileSync(await csv.path(), 'utf8'); if (process.env.SHOWLOG) console.log(log);
  ok(['logowanie', 'zapis PDF', 'użycie AI', 'otwarcie karty pacjenta', 'utworzenie listu', 'blokada'].every((x) => log.includes(x)) && log.includes('Anna Kowalska'), 'activity log (CSV) records login, record access, letters, PDF, AI use, lock');
  await p.click('[data-nav=patients]'); await p.click('[data-open-patient]'); await p.waitForTimeout(300);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=patient-export]')]);
  const ex = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(ex.pacjent.last === 'Kowalska' && ex.wizyty.length >= 1 && ex.listy.length >= 1, 'patient data export (RODO art. 15/20): patient, visits, letters');
  await p.click('[data-act=patient-delete]'); await p.fill('#del-confirm', 'zly'); await p.click('.modal footer .btn-danger'); await p.waitForTimeout(300);
  ok(await p.locator('#del-confirm').count() === 1, 'erasure needs the surname typed to confirm');
  await p.fill('#del-confirm', 'Kowalska'); await p.click('.modal footer .btn-danger'); await p.waitForTimeout(1200);
  const left = await p.evaluate(() => { const S = window.__endolist.S; return { p: S.data.patients.size, v: [...S.data.visits.values()].filter((v) => v.teeth.length).length, l: S.data.letters.size }; });
  ok(left.p === 0 && left.v === 0 && left.l === 0, 'patient erased with all visits and letters ' + JSON.stringify(left));
  console.log('ERRORS-2', p.errs);
  await ctx.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

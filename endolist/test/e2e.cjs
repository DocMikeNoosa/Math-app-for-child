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
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify(out) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } }) });
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
  // placeholder test logos (NOT the real clinic logos — those could not be downloaded in the build environment)
  const mkLogo = (txt, col) => p.evaluate(([txt, col]) => { const c = document.createElement('canvas'); c.width = 520; c.height = 140; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 520, 140); x.fillStyle = col; x.font = 'bold 44px sans-serif'; x.fillText(txt, 24, 88); x.strokeStyle = col; x.lineWidth = 4; x.strokeRect(6, 6, 508, 128); return c.toDataURL('image/png').split(',')[1]; }, [txt, col]);
  fs.writeFileSync(path.join(OUT, 'logo1.png'), Buffer.from(await mkLogo('LOGO KLINIKI', '#0b4f8a'), 'base64'));
  fs.writeFileSync(path.join(OUT, 'logo2.png'), Buffer.from(await mkLogo('LOGO GRUPY', '#8a6d0b'), 'base64'));
  await p.click('[data-act=ob-logo][data-k=logo]'); await p.setInputFiles('#ob-logo-input', path.join(OUT, 'logo1.png')); await p.waitForTimeout(400);
  await p.click('[data-act=ob-logo][data-k=groupLogo]'); await p.setInputFiles('#ob-logo-input', path.join(OUT, 'logo2.png')); await p.waitForTimeout(400);
  ok(await p.locator('.logo-slot img').count() === 2, 'two logos uploaded in onboarding');
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
  ok(await p.locator('.clinic-logo img').count() === 1, 'clinic logo shown in top bar');
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
  await shot(p, '04-visit-empty');
  // ---------- tooth 36 in the enlarged workspace
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(1500);
  ok(await p.locator('#stage canvas').count() === 1, '3D model rendered (WebGL canvas)');
  await p.click('[data-act=cfg][data-i="1"]'); await p.waitForTimeout(300);
  await p.selectOption('[data-b="t.roots.1.lateral"]', 'srodkowa'); await p.waitForTimeout(800);
  await shot(p, '05-ws-anatomy');
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
  await p.waitForTimeout(700);
  await shot(p, '06-ws-endo');
  await p.click('[data-ttab=mat]');
  await p.click('[data-act=pick-prod][data-name="ProTaper Gold"]');
  await p.selectOption('#mat-cat', 'apex'); await p.click('[data-act=pick-prod][data-name="Raypex 6"]');
  await p.selectOption('#mat-cat', 'sealer'); await p.fill('#mat-name', 'Mój uszczelniacz testowy'); await p.click('[data-act=add-prod]');
  ok(await p.locator('.chip.prod').count() === 3, '3 products chosen (incl. custom)');
  await shot(p, '07-ws-materials');
  // manual description with dictation (fake recogniser) + AI cleanup (MOCK)
  await mockAI(p, () => ({}));
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = 'sk-ant-test'; window.__endolist.save('settings', st); });
  await p.click('[data-ttab=manual]');
  await p.click('[data-mic="t.manual"]'); await p.waitForTimeout(500); await p.click('[data-mic="t.manual"]'); await p.waitForTimeout(1200);
  ok((await p.inputValue('[data-b="t.manual"]')) === 'Usunięto stary wkład metalowy przy użyciu ultradźwięków.', 'dictation → AI-cleaned text in manual description');
  await shot(p, '08-ws-manual');
  await p.click('[data-ttab=rec]');
  await p.selectOption('[data-b="t.rec.restor"]', 'crown'); await p.waitForTimeout(100); await seg('t.rec.time', '30d'); await seg('t.rec.control', '6-12m'); await seg('t.rec.prog', 'good');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  ok(await p.locator('#ws').count() === 0 && (await p.textContent('#vteeth')).includes('36'), 'tooth saved and workspace closed');
  // tooth 37: filling with product; tooth 16 just viewed
  await p.click('#arch g.tooth[data-fdi="37"]'); await p.waitForSelector('#ws'); await p.click('[data-ttab=work]');
  await p.click('[data-act=add-work][data-type=FILL]'); await seg('t.work.0.cls', 'II');
  for (const s of ['M', 'O', 'D']) await p.click(`label.chip:has(input[data-arr="t.work.0.surf"][value=${s}])`);
  await p.selectOption('[data-b="t.work.0.mat"]', 'kompozyt'); await p.fill('[data-b="t.work.0.product"]', 'Filtek One Bulk Fill');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  await p.click('#arch g.tooth[data-fdi="16"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(1500); await shot(p, '09-ws-16');
  await p.click('[data-act=ws-cancel]'); await p.waitForTimeout(300); if (await p.locator('.modal').count()) await p.click('.modal footer .btn-danger'); await p.waitForTimeout(300);
  ok(!(await p.textContent('#vteeth')).includes('Pierwszy trzonowiec górny'), 'cancelled tooth not added');
  await shot(p, '10-visit-full');
  // ---------- letter: built-in generator (no key)
  await p.unroute('https://api.anthropic.com/**');
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = ''; window.__endolist.save('settings', st); });
  await p.click('[data-act=gen-letter]'); await p.waitForSelector('#paper', { timeout: 20000 }); await p.waitForTimeout(800);
  const L0 = await p.evaluate(() => { const S = window.__endolist.S; return S.data.letters.get(S.letterId); });
  ok(L0.source === 'auto', 'letter created by built-in generator');
  console.log('--- LETTER (built-in generator) ---\n' + [L0.content.salutation, L0.content.opening, ...L0.content.sections.map((s) => s.heading + '\n' + s.paragraphs.join('\n')), 'Zalecenia: ' + L0.content.recommendations.join(' | '), L0.content.closing].join('\n'));
  ok((await p.textContent('#paper')).includes(PES), 'PESEL shown in the letter');
  await shot(p, '11-review', { fullPage: true });
  // highlight a passage → popover → comment → tick "done"
  const sel = await p.evaluate(() => {
    const el = document.querySelector('#paper [data-loc="sections.0.paragraphs.0"]'); const txt = el.firstChild; const s = txt.textContent; const i = s.indexOf('W badaniu'); const r = document.createRange(); r.setStart(txt, i); r.setEnd(txt, s.indexOf('.', i) + 1);
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
  await mockAI(p, (body) => { const inp = JSON.parse(body.messages[0].content); const l = inp.letter; l.sections[0].paragraphs[0] = l.sections[0].paragraphs[0].replace(/W badaniu:[^.]*\./, 'W badaniu: brak reakcji na testy żywotności, bolesne opukiwanie.'); return { ...l, changes: ['Skrócono opis badania zęba 36.', 'Ujednolicono styl na bardziej formalny.'], warnings: [] }; });
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = 'sk-ant-test'; window.__endolist.save('settings', st); });
  await p.evaluate(() => window.__endolist.rerender());
  await p.click('[data-act=revise]'); await p.waitForTimeout(1500);
  const rv = aiCalls.at(-1); const rIn = JSON.parse(rv.body.messages[0].content);
  ok(rIn.annotations.length === 1 && rIn.annotations[0].quote.startsWith('W badaniu') && rIn.instruction.includes('zwięźle'), 'revision request carries the highlight + general instruction');
  ok(!/Kowalska|Anna|Nowak|Maria|1980|Zielińska|Katarzyna|Uśmiech|\d{11}/.test(JSON.stringify(rIn)), 'revision request contains no personal data / PESEL');
  ok((await p.textContent('#paper')).includes('brak reakcji na testy żywotności') && (await p.textContent('#rside')).includes('Skrócono opis badania'), 'AI revision applied and changes listed');
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
  console.log('ERRORS-1', p.errs);
  // lock + passkey, restart + password, persistence
  await p.click('[data-act=lock]'); await p.waitForSelector('#login', { timeout: 10000 });
  ok(await p.locator('.auth-brand img').count() === 2, 'clinic logos on the login screen');
  await shot(p, '15-lock');
  await p.click('[data-act=passkey-login]'); await p.waitForSelector('#arch', { timeout: 15000 });
  await ctx.close();
  [ctx, p] = await launch();
  await p.fill('[name=password]', 'Tajne-haslo-123'); await p.click('#login button'); await p.waitForSelector('#arch', { timeout: 20000 });
  await p.click('[data-nav=patients]'); ok((await p.textContent('table.list')).includes('Kowalska'), 'data persisted after restart');
  console.log('ERRORS-2', p.errs);
  await ctx.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

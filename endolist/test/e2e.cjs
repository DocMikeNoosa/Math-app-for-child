// EndoList — test end-to-end (Playwright + Chromium). Uruchom serwer (node server.mjs), potem: node test/e2e.cjs
// Folder (File System Access) jest zastępowany katalogiem OPFS z tym samym API; passkey — wirtualnym uwierzytelniaczem z PRF.
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const URL0 = process.env.ENDOLIST_URL || 'http://localhost:4173/';
const OUT = process.env.OUT || path.join(os.tmpdir(), 'endolist-e2e');
const PROFILE = path.join(OUT, 'profile');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const mock = `window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); return r.getDirectoryHandle('EndoList', { create: true }); };`;
let failures = 0;
const ok = (c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + msg); if (!c) failures++; };

async function launch() {
  const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1480, height: 960 }, acceptDownloads: true });
  await ctx.addInitScript(mock);
  const p = ctx.pages()[0] || (await ctx.newPage());
  p.errs = [];
  p.on('pageerror', (e) => p.errs.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/favicon|ERR_FAILED|net::/.test(m.text())) p.errs.push('CONSOLE ' + m.text()); });
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, hasPrf: true, automaticPresenceSimulation: true } });
  p.cdp = cdp; p.authId = authenticatorId;
  await p.goto(URL0); await p.waitForTimeout(400);
  return [ctx, p];
}
async function opfsTree(p) { return p.evaluate(async () => { const out = []; async function walk(d, pre) { for await (const [n, h] of d.entries()) { if (h.kind === 'directory') await walk(h, pre + n + '/'); else out.push(pre + n); } } await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('EndoList'), ''); return out.sort(); }); }
async function opfsRead(p, rel) { return Buffer.from(await p.evaluate(async (rel) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('EndoList'); const parts = rel.split('/'); for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x); const f = await (await d.getFileHandle(parts.at(-1))).getFile(); const a = new Uint8Array(await f.arrayBuffer()); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); }, rel), 'base64'); }

(async () => {
  let [ctx, p] = await launch();
  await p.screenshot({ path: path.join(OUT, '01-welcome.png') });
  // ---------- onboarding
  await p.selectOption('[data-ob=title]', 'lek. dent.'); await p.selectOption('[data-ob=gender]', 'f');
  await p.fill('[data-ob=first]', 'Katarzyna'); await p.fill('[data-ob=last]', 'Zielińska'); await p.fill('[data-ob=specialty]', 'specjalista endodoncji');
  await p.click('[data-act=ob-next]');
  await p.fill('[data-ob=practice]', 'Gabinet Endodontyczny EndoDent'); await p.fill('[data-ob=address]', 'ul. Świdnicka 12/4, 50-068 Wrocław'); await p.fill('[data-ob=city]', 'Wrocław');
  await p.fill('[data-ob=phone]', '+48 71 123 45 67'); await p.fill('[data-ob=email]', 'gabinet@endodent.example'); await p.fill('[data-ob=npwz]', '1234567');
  await p.click('[data-act=ob-next]');
  const sig = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 600; c.height = 200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 600, 200); x.strokeStyle = '#1a2a6c'; x.lineWidth = 5; x.beginPath(); x.moveTo(40, 140); x.bezierCurveTo(120, 20, 160, 190, 240, 90); x.bezierCurveTo(300, 30, 330, 170, 420, 100); x.bezierCurveTo(470, 70, 520, 120, 560, 80); x.stroke(); return c.toDataURL('image/png').split(',')[1]; });
  fs.writeFileSync(path.join(OUT, 'sig.png'), Buffer.from(sig, 'base64'));
  await p.setInputFiles('#ob-sig-input', path.join(OUT, 'sig.png')); await p.waitForTimeout(400);
  ok(await p.locator('.sig-prev').count() === 1, 'signature preview shown');
  await p.click('[data-act=ob-next]');
  await p.fill('[name=username]', 'kasia'); await p.fill('[name=pw]', 'Tajne-haslo-123'); await p.fill('[name=pw2]', 'Tajne-haslo-123');
  await p.screenshot({ path: path.join(OUT, '02-account.png') });
  await p.click('[data-act=ob-create]'); await p.waitForSelector('[data-act=ob-finish]', { timeout: 20000 });
  await p.click('[data-act=ob-passkey]'); await p.waitForTimeout(1200);
  ok((await p.textContent('#pk-state')).includes('dodany'), 'passkey (PRF) registered: ' + (await p.textContent('#pk-state')).trim());
  await p.click('[data-act=ob-finish]'); await p.waitForSelector('#arch', { timeout: 20000 });
  // ---------- folder
  await p.click('.banner [data-act=folder-pick]'); await p.waitForTimeout(1000);
  ok((await p.textContent('#status')).includes('kopia'), 'folder connected: ' + (await p.textContent('#status')));
  await p.screenshot({ path: path.join(OUT, '03-visit-empty.png') });
  // ---------- patient + referrer
  await p.click('[data-act=pick-patient]');
  await p.fill('.modal [data-f=first]', 'Anna'); await p.fill('.modal [data-f=last]', 'Kowalska'); await p.fill('.modal [data-f=dob]', '1980-03-12');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.click('[data-act=pick-referrer]');
  await p.selectOption('.modal [data-f=gender]', 'f'); await p.fill('.modal [data-f=first]', 'Maria'); await p.fill('.modal [data-f=last]', 'Nowak');
  await p.fill('.modal [data-f=clinic]', 'Gabinet Stomatologiczny Uśmiech'); await p.fill('.modal [data-f=address]', 'ul. Kwiatowa 5\n50-100 Wrocław'); await p.fill('.modal [data-f=email]', 'm.nowak@usmiech.example');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.fill('[data-b="v.date"]', '2026-10-08');
  // ---------- tooth 36: anatomy
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.waitForTimeout(200);
  ok((await p.textContent('.hintbox')).includes('2 korzenie'), 'anatomy hint for 36');
  await p.click('[data-act=cfg][data-i="1"]'); await p.waitForTimeout(150);
  ok(await p.locator('.canal-chip').count() === 4, '36 config with 4 canals');
  await p.selectOption('[data-b="t.roots.1.lateral"]', 'srodkowa');
  await p.screenshot({ path: path.join(OUT, '04-anatomy.png') });
  // dx
  await p.click('[data-ttab=dx]');
  await p.fill('[data-b="t.dx.history.cc"]', 'ból przy nagryzaniu od dwóch tygodni');
  const seg = (k, v) => p.click(`[data-seg="${k}"] button[data-v="${v}"]`);
  await seg('t.dx.tests.cold', 'nr'); await seg('t.dx.tests.ept', 'neg'); await seg('t.dx.tests.perc', 'pain'); await seg('t.dx.tests.palp', 'wnl'); await seg('t.dx.tests.bite', 'pain'); await p.fill('[data-b="t.dx.tests.probe"]', '3'); await seg('t.dx.tests.mob', 'phys');
  await p.click('label.chip:has(input[data-arr="t.dx.radio"][value=parl])');
  const dxText = await p.textContent('#dxbox');
  ok(dxText.includes('Martwica miazgi') && dxText.includes('K04.1') && dxText.includes('Objawowe zapalenie tkanek okołowierzchołkowych'), 'dx suggestion PN + SAP with ICD');
  await p.screenshot({ path: path.join(OUT, '05-dx.png') });
  // endo
  await p.click('[data-ttab=endo]');
  await p.selectOption('[data-b="t.endo.proc"]', 'RCT'); await p.waitForTimeout(150);
  await seg('t.endo.anesth', 'block'); await p.fill('[data-b="t.endo.agent"]', '4% artykaina z adrenaliną 1:100 000');
  const wl = ['21', '21', '20,5', '21'];
  const wlInputs = p.locator('table.wl input[data-b$=".wl"]'); for (let i = 0; i < 4; i++) await wlInputs.nth(i).fill(wl[i]);
  await p.locator('table.wl input[data-b$=".maf"]').nth(0).fill('35/.04');
  await p.click('label.chip:has(input[data-arr="t.endo.irrig"][value=us])'); await p.waitForTimeout(150);
  await p.fill('[data-b="t.endo.naocl"]', '5,25');
  await p.selectOption('[data-b="t.endo.obtur"]', 'cwt'); await p.waitForTimeout(150);
  await p.fill('[data-b="t.endo.sealer"]', 'uszczelniacz bioceramiczny'); await p.selectOption('[data-b="t.endo.temp"]', 'cavit');
  await p.click('label.chip:has(input[data-arr="t.endo.findings"][value=oblit])');
  await p.screenshot({ path: path.join(OUT, '06-endo.png') });
  await p.click('[data-ttab=rec]');
  await p.selectOption('[data-b="t.rec.restor"]', 'crown'); await p.waitForTimeout(100); await seg('t.rec.time', '30d'); await seg('t.rec.control', '6-12m'); await seg('t.rec.prog', 'good');
  // tooth 37: non-endo work
  await p.click('#arch g.tooth[data-fdi="37"]'); await p.click('[data-ttab=work]');
  await p.click('[data-act=add-work][data-type=FILL]'); await seg('t.work.0.cls', 'II');
  for (const s of ['M', 'O', 'D']) await p.click(`label.chip:has(input[data-arr="t.work.0.surf"][value=${s}])`);
  await p.selectOption('[data-b="t.work.0.mat"]', 'kompozyt');
  await p.click('[data-act=add-work][data-type=CROWNPREP]');
  await p.screenshot({ path: path.join(OUT, '07-work.png') });
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.click('[data-ttab=anat]'); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, '08-visit-full.png'), fullPage: false });
  // ---------- other dentist's earlier visit (for combining)
  await p.click('[data-act=save-visit]'); await p.waitForTimeout(300);
  await p.click('[data-nav=patients]'); await p.click('[data-open-patient]'); await p.click('[data-act=other-visit]');
  await p.fill('[data-b="v.date"]', '2026-09-20'); await p.fill('[data-b="v.otherDentist"]', 'lek. dent. Jan Wiśniewski');
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.click('[data-ttab=endo]'); await p.selectOption('[data-b="t.endo.proc"]', 'PULPEXT'); await p.waitForTimeout(100);
  await seg('t.endo.status', 'stage'); await p.waitForTimeout(100); await p.selectOption('[data-b="t.endo.medic"]', 'caoh');
  await p.click('[data-act=save-visit]'); await p.waitForTimeout(300);
  // ---------- generate letter (no AI key → built-in), combining both visits
  await p.click('[data-nav=patients]'); await p.click('[data-open-patient]');
  await p.click('[data-act=patient-letter]'); await p.waitForTimeout(200);
  const picks = p.locator('.modal .pick'); ok(await picks.count() === 2, 'combine dialog lists 2 visits');
  for (let i = 0; i < 2; i++) if (!(await picks.nth(i).getAttribute('class')).includes('on')) await picks.nth(i).click();
  await p.click('.modal footer .btn-primary'); await p.waitForSelector('#pdfprev', { timeout: 20000 }); await p.waitForTimeout(2500);
  const letterState = await p.evaluate(() => { const S = window.__endolist.S; const L = S.data.letters.get(S.letterId); return L; });
  ok(letterState.visitIds.length === 2 && letterState.source === 'auto', 'combined letter created (built-in generator)');
  ok(letterState.content.salutation === 'Szanowna Pani Doktor,', 'salutation: ' + letterState.content.salutation);
  console.log('--- LETTER (built-in) ---\n' + letterState.content.opening + '\n' + letterState.content.sections.map((s) => s.heading + '\n' + s.paragraphs.join('\n')).join('\n') + '\nZalecenia: ' + letterState.content.recommendations.join(' | ') + '\n' + letterState.content.closing);
  console.log('GLANCE', JSON.stringify(letterState.glance));
  await p.screenshot({ path: path.join(OUT, '09-letter.png') });
  // save PDF to folder
  await p.click('[data-act=save-pdf]'); await p.waitForTimeout(2500);
  let tree = await opfsTree(p); console.log('FOLDER', tree);
  const pdf = tree.find((x) => x.startsWith('Listy/') && x.endsWith('.pdf'));
  ok(!!pdf && pdf.includes('Kowalska Anna (1980-03-12)') && pdf.includes('2026-'), 'PDF saved in patient folder: ' + pdf);
  fs.writeFileSync(path.join(OUT, 'letter.pdf'), await opfsRead(p, pdf));
  ok(tree.includes('Kopia zapasowa (nie edytować)/endolist-dane.json'), 'encrypted backup written');
  const backup = (await opfsRead(p, 'Kopia zapasowa (nie edytować)/endolist-dane.json')).toString();
  ok(!backup.includes('Kowalska') && !backup.includes('Nowak') && !backup.includes('artykaina'), 'backup contains no plaintext patient data');
  // ProDentis export + email draft
  await p.click('[data-act=prodentis]'); await p.click('.modal footer .btn-primary'); await p.waitForTimeout(1200);
  tree = await opfsTree(p); ok(tree.some((x) => x.endsWith('opis ProDentis.txt')), 'ProDentis TXT saved next to PDF');
  await p.click('[data-act=email]');
  ok((await p.inputValue('#em-to')) === 'm.nowak@usmiech.example', 'email prefilled with referrer address');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.modal footer button:has-text(".eml")')]);
  const emlPath = path.join(OUT, 'draft.eml'); await dl.saveAs(emlPath);
  const eml = fs.readFileSync(emlPath, 'utf8');
  ok(eml.includes('X-Unsent: 1') && eml.includes('Content-Type: application/pdf') && eml.includes('To: m.nowak@usmiech.example'), '.eml draft has PDF attachment');
  // ---------- AI path (mocked API): check payload has no personal data
  let aiReq = null, aiHdr = {};
  await p.route('https://api.anthropic.com/**', async (route) => {
    aiReq = route.request().postDataJSON(); aiHdr = route.request().headers();
    const out = { opening: 'Serdecznie dziękuję za skierowanie Pacjentki — z przyjemnością przekazuję informację o leczeniu.', sections: [{ heading: 'Ząb 36 — pierwszy trzonowiec dolny lewy', paragraphs: ['AI: tekst o zębie 36.'] }, { heading: 'Ząb 37 — drugi trzonowiec dolny lewy', paragraphs: ['AI: tekst o zębie 37.'] }], recommendations: ['Ząb 36: korona protetyczna w ciągu 30 dni.'], closing: 'Cieszę się, że mogłam pomóc — w razie dolegliwości zapraszam ponownie.', warnings: [] };
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'request-id': 'req_test' }, body: JSON.stringify({ id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify(out) }], stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } }) });
  });
  await p.evaluate(() => { const st = window.__endolist.settings(); st.ai.key = 'sk-ant-test'; st.ai.enabled = true; window.__endolist.save('settings', st); });
  await p.click('[data-act=regen]'); await p.waitForTimeout(2500);
  const L2 = await p.evaluate(() => { const S = window.__endolist.S; return S.data.letters.get(S.letterId); });
  ok(L2.source === 'ai' && L2.content.sections[0].paragraphs[0].startsWith('AI:'), 'AI letter applied');
  const reqStr = JSON.stringify(aiReq || {});
  ok(aiReq && aiReq.model === 'claude-opus-5-5' && aiReq.fallbacks === 'default' && aiReq.output_config?.format?.type === 'json_schema', 'AI request: model, fallbacks, structured output');
  ok(!/Kowalska|Anna|Nowak|Maria|1980|Zielińska|Katarzyna|Uśmiech/.test(reqStr), 'AI request contains no names/DOB');
  ok(reqStr.includes('20,5') && reqStr.includes('MB'), 'AI request contains clinical facts');
  ok(aiHdr['anthropic-beta'] === 'server-side-fallback-2026-07-01' && aiHdr['anthropic-dangerous-direct-browser-access'] === 'true' && aiHdr['x-api-key'] === 'sk-ant-test', 'AI request headers: ' + aiHdr['anthropic-beta']);
  await p.unroute('https://api.anthropic.com/**');
  console.log('ERRORS-1', p.errs);
  // ---------- lock + passkey login
  await p.click('[data-act=lock]'); await p.waitForSelector('#login', { timeout: 10000 });
  await p.screenshot({ path: path.join(OUT, '10-lock.png') });
  await p.click('[data-act=passkey-login]'); await p.waitForSelector('#arch', { timeout: 15000 });
  ok(true, 'unlocked with passkey');
  await ctx.close();
  // ---------- restart browser: password login, data persisted
  [ctx, p] = await launch();
  await p.fill('[name=password]', 'zle-haslo'); await p.click('#login button'); await p.waitForTimeout(2500);
  ok((await p.textContent('#err')).includes('Nieprawidłowe'), 'wrong password rejected');
  await p.fill('[name=password]', 'Tajne-haslo-123'); await p.click('#login button'); await p.waitForSelector('#arch', { timeout: 20000 });
  await p.click('[data-nav=patients]');
  ok((await p.textContent('table.list')).includes('Kowalska'), 'data persisted after browser restart');
  // ---------- wipe browser storage → restore from folder
  await p.evaluate(() => new Promise((r) => { const q = indexedDB.deleteDatabase('endolist'); q.onsuccess = q.onerror = q.onblocked = () => r(); setTimeout(r, 2000); }));
  await ctx.close(); [ctx, p] = await launch();
  ok(await p.locator('[data-ob=first]').count() === 1, 'after wipe: app starts empty (onboarding)');
  await p.click('[data-act=restore-start]'); await p.click('.modal footer .btn-primary'); await p.waitForSelector('#login', { timeout: 10000 }); await p.waitForTimeout(500);
  await p.fill('[name=password]', 'Tajne-haslo-123'); await p.click('#login button'); await p.waitForSelector('#arch', { timeout: 20000 });
  await p.click('[data-nav=patients]'); await p.click('[data-open-patient]');
  const pt = await p.textContent('main');
  ok(pt.includes('Kowalska') && pt.includes('Wiśniewski'), 'restored patient, visits and letters from folder');
  await p.click('[data-nav=settings]'); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(OUT, '11-settings.png'), fullPage: true });
  console.log('ERRORS-2', p.errs);
  await ctx.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

// DentList — test wielospecjalistyczny (Playwright): lekarz ogólny, zabiegi wielu specjalności, zabiegi w obrębie jamy ustnej, uzębienie mleczne, historia wizyt, wpis ProDentis.
// Zastępniki: folder (OPFS z tym samym API), passkey (wirtualny uwierzytelniacz z PRF), rozpoznawanie mowy (fałszywy
// SpeechRecognition) i API Claude (odpowiedzi testowe — oznaczone jako MOCK, nie są prawdziwymi wynikami AI).
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');
const URL0 = process.env.DENTLIST_URL || 'http://localhost:4174/';
const OUT = process.env.OUT || path.join(os.tmpdir(), 'dentlist-spec-e2e');
const PROFILE = path.join(OUT, 'profile');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const init = `
window.showDirectoryPicker = async () => { const r = await navigator.storage.getDirectory(); return r.getDirectoryHandle('DentList', { create: true }); };
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
async function opfsTree(p) { return p.evaluate(async () => { const out = []; async function walk(d, pre) { for await (const [n, h] of d.entries()) { if (h.kind === 'directory') await walk(h, pre + n + '/'); else out.push(pre + n); } } await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('DentList'), ''); return out.sort(); }); }
async function opfsRead(p, rel) { return Buffer.from(await p.evaluate(async (rel) => { let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('DentList'); const parts = rel.split('/'); for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x); const f = await (await d.getFileHandle(parts.at(-1))).getFile(); const a = new Uint8Array(await f.arrayBuffer()); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); }, rel), 'base64'); }
const shot = (p, n, o = {}) => p.screenshot({ path: path.join(OUT, n + '.png'), ...o });

(async () => {
  const [ctx, p] = await launch();
  const seg = (k, v) => p.click(`[data-seg="${k}"] button[data-v="${v}"]`);
  const chip = (path, v) => p.click(`label.chip:has(input[data-arr="${path}"][value="${v}"])`);
  // ---------- onboarding: general dentist (male)
  await p.selectOption('[data-ob=title]', 'lek. dent.'); await p.selectOption('[data-ob=gender]', 'm');
  await p.fill('[data-ob=first]', 'Jan'); await p.fill('[data-ob=last]', 'Kowal');
  ok(await p.inputValue('[data-ob=home]') === 'zach', 'default home specialty: stomatologia zachowawcza');
  await p.click('[data-act=ob-next]'); await p.waitForSelector('.logo-slot img', { timeout: 5000 }); await p.click('[data-act=ob-next]'); await p.click('[data-act=ob-next]');
  await p.fill('[name=username]', 'jan'); await p.fill('[name=pw]', 'Tajne-haslo-123'); await p.fill('[name=pw2]', 'Tajne-haslo-123');
  await p.click('[data-act=ob-create]'); await p.waitForSelector('[data-act=ob-finish]', { timeout: 20000 });
  await p.click('[data-act=ob-finish]'); await p.waitForSelector('#arch', { timeout: 20000 });
  await p.click('.banner [data-act=folder-pick]'); await p.waitForTimeout(800);
  ok((await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())) === '#8e9bff' && (await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())) === '#050614', 'accent and background colour follow the home specialty (zachowawcza: indigo)');
  // ---------- adult patient + referrer
  await p.click('[data-act=pick-patient]'); await p.fill('.modal [data-f=first]', 'Tomasz'); await p.fill('.modal [data-f=last]', 'Nowicki'); await p.fill('.modal [data-f=dob]', '1975-05-20'); await p.selectOption('.modal [data-f=sex]', 'm');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.click('[data-act=pick-referrer]'); await p.selectOption('.modal [data-f=gender]', 'f'); await p.fill('.modal [data-f=first]', 'Ewa'); await p.fill('.modal [data-f=last]', 'Lis');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.fill('[data-b="v.date"]', '2026-10-10');
  ok(await p.locator('#arch g.tooth').count() === 32, 'adult: permanent dentition chart (32 teeth)');
  // tooth 48: surgical extraction (chirurgia)
  await p.click('#arch g.tooth[data-fdi="48"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(900);
  ok(await p.locator('#ws-tabs .step.on[data-ttab=dx]').count() === 1 && (await p.textContent('#ws-tabs .step:nth-child(2)')).includes('Zabiegi'), 'general dentist: steps start with Badanie, then Zabiegi');
  ok(!(await p.locator('#ws-tabs [data-ttab=endo], #ws-tabs [data-ttab=anat]').count()) && (await p.locator('#xray-sw[hidden]').count()) === 1 && !(await p.textContent('#stage-legend')).includes('kanał'), 'general dentist: no root-canal steps, canals or X-ray switch on a plain tooth');
  await p.fill('[data-b="t.dx.other"]', 'K01.1 Zęby zaklinowane');
  await p.click('#ws-tabs [data-ttab=work]'); await p.waitForTimeout(200);
  ok(await p.locator('.spchip').count() >= 9, 'procedure picker lists the specialties');
  await p.click('[data-act=work-spec][data-spec=chir]'); await p.waitForTimeout(150);
  await p.click('[data-act=add-work][data-type=IMPACT]'); await p.waitForTimeout(200);
  await seg('t.work.0.impaction', 'full'); await seg('t.work.0.pos', 'mesio');
  await chip('t.work.0.steps', 'flap'); await chip('t.work.0.steps', 'osteo'); await chip('t.work.0.steps', 'sep');
  await p.selectOption('[data-b="t.work.0.anesth"]', 'block'); await p.fill('[data-b="t.work.0.agent"]', 'Ubistesin forte, 1 karpula'); await p.fill('[data-b="t.work.0.suture"]', 'Vicryl 4-0');
  await p.waitForTimeout(300); await shot(p, '01-ws-chir');
  ok(await p.locator('.workcard.spcard .sptag').first().textContent() === 'Chirurgia', 'procedure card tagged with its specialty');
  ok((await p.textContent('#stage-legend')).includes('usunięty'), 'extraction: the model shows the removed tooth as an outline');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  // tooth 36: implant (implantologia)
  await p.click('#arch g.tooth[data-fdi="36"]'); await p.waitForSelector('#ws'); await p.click('#ws-tabs [data-ttab=work]');
  await p.click('[data-act=work-spec][data-spec=impl]'); await p.click('[data-act=add-work][data-type=IMPLANT]'); await p.waitForTimeout(200);
  await p.fill('[data-b="t.work.0.system"]', 'Straumann BLX'); await p.fill('[data-b="t.work.0.diam"]', '4,5'); await p.fill('[data-b="t.work.0.len"]', '10'); await p.fill('[data-b="t.work.0.torque"]', '35');
  await p.selectOption('[data-b="t.work.0.protocol"]', 'two'); await p.fill('[data-b="t.work.0.bone"]', 'Bio-Oss');
  await p.waitForTimeout(500);
  ok((await p.textContent('#stage-legend')).includes('implant ze śrubą gojącą') && !(await p.locator('#ws-tabs [data-ttab=endo]').count()), 'implant: model shows the implant (no canals), no endodontic steps');
  await shot(p, '01b-ws-implant');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  // tooth 26: crown seated (protetyka) + tooth 37: filling (zachowawcza)
  await p.click('#arch g.tooth[data-fdi="26"]'); await p.waitForSelector('#ws'); await p.click('#ws-tabs [data-ttab=work]');
  await p.click('[data-act=work-spec][data-spec=prot]'); await p.click('[data-act=add-work][data-type=CROWN]'); await p.waitForTimeout(200);
  await seg('t.work.0.stage', 'seat'); await p.waitForTimeout(200);
  ok((await p.textContent('#stage-legend')).includes('korona'), '3D: crown drawn on the tooth');
  await p.waitForTimeout(600); await shot(p, '01c-ws-crown');
  await p.fill('[data-b="t.work.0.mat"]', 'cyrkon monolityczny'); await p.fill('[data-b="t.work.0.cement"]', 'RelyX Universal');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  await p.click('#arch g.tooth[data-fdi="37"]'); await p.waitForSelector('#ws'); await p.click('#ws-tabs [data-ttab=work]');
  await p.click('[data-act=work-spec][data-spec=zach]'); await p.click('[data-act=add-work][data-type=FILL]'); await seg('t.work.0.cls', 'II'); await chip('t.work.0.surf', 'O'); await chip('t.work.0.surf', 'D');
  await p.selectOption('[data-b="t.work.0.mat"]', 'kompozyt'); await p.fill('[data-b="t.work.0.product"]', 'Filtek One Bulk Fill');
  await p.waitForTimeout(300);
  ok((await p.textContent('#stage-legend')).includes('wypełnienie (OD)'), '3D: filling drawn on the recorded surfaces (OD)');
  await shot(p, '01d-ws-fill');
  ok((await p.locator('#sp-rail .rail-b').count()) === 10 && (await p.locator('#sp-rail .rail-b.has[data-spec=zach]').count()) === 1, 'side rail lists all 10 specialties, marks the ones used on this tooth');
  await p.click('#sp-rail [data-spec=perio]'); await p.waitForTimeout(300);
  ok((await p.locator('#ws-tabs .step.on[data-ttab=work]').count()) === 1 && (await p.locator('.spchip.on[data-spec=perio]').count()) >= 1, 'side rail: Periodontologia opens Zabiegi with periodontal procedures');
  await p.click('[data-ttab=mat]'); await p.waitForTimeout(200);
  ok((await p.locator('[data-act=mat-spec].on[data-spec=perio]').count()) === 1 && (await p.locator('.cat-chips .chip').first().textContent()).length > 2 && !(await p.locator('.micro-card').count()), 'Materiały: specialty-specific categories (perio), no microscope card outside endodontics');
  await p.click('#ws-tabs [data-ttab=work]'); await p.waitForTimeout(200);
  await p.click('#ws-tab [data-ttab=endo]'); await p.waitForTimeout(300);
  ok((await p.locator('#ws-tabs .step.on[data-ttab=endo]').count()) === 1 && (await p.locator('#ws-tabs [data-ttab=anat]').count()) === 1 && (await p.textContent('#stage-legend')).includes('kanał'), 'endodontics still available: Zabiegi › Endodoncja adds the root-canal steps and shows the canals');
  await p.click('#ws-tabs [data-ttab=work]'); await p.waitForTimeout(200);
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  // ---------- orthodontic tooth card (side rail → Ortodoncja): own steps, examination, procedures, materials, 3D
  await p.click('#arch g.tooth[data-fdi="13"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(600);
  await p.click('#sp-rail [data-spec=orto]'); await p.waitForTimeout(400);
  const steps = await p.$$eval('#ws-tabs .step .l', (els) => els.map((e) => e.firstChild.textContent));
  ok(steps.join('|') === 'Badanie|Zabiegi|Materiały|Opis własny|Zalecenia' && (await p.textContent('#ws-tabs')).includes('Ortodoncja') && (await p.textContent('#ws-spec')).includes('Ortodoncja') && (await p.getAttribute('#ws', 'data-spec')) === 'orto', 'orthodontic card: own steps (no Anatomia / Endodoncja), badge and colours: ' + steps.join(', '));
  await p.click('#ws-tabs [data-ttab=work]'); await p.waitForTimeout(300);
  ok((await p.locator('[data-act=add-work][data-type=BRACKET]').count()) === 1 && (await p.locator('[data-act=add-work][data-type=IPR]').count()) === 1 && (await p.locator('[data-act=add-work][data-type=ATTACH]').count()) === 1, 'orthodontic procedures on a tooth: bracket, IPR, attachment…');
  await p.click('[data-act=add-work][data-type=BRACKET]'); await p.waitForTimeout(200);
  const pick = async (k, v) => ((await p.locator(`[data-seg="${k}"]`).count()) ? seg(k, v) : p.selectOption(`[data-b="${k}"]`, v));
  await pick('t.work.0.kind', 'ceram'); await pick('t.work.0.rx', 'mbt'); await p.waitForTimeout(500);
  ok((await p.textContent('#stage-legend')).includes('zamek ceramiczny'), '3D: ceramic bracket with arch wire on the tooth');
  await shot(p, '01e-ws-orto');
  await p.click('#ws-tabs [data-ttab=dx]'); await p.waitForTimeout(200);
  ok((await p.textContent('#ws-tab')).includes('Badanie ortodontyczne') && (await p.locator('details.pulp-more').count()) === 1, 'orthodontic examination (pulp tests folded away)');
  await p.click('label.chip:has(input[data-arr="t.sx.orto.pos"][value="rot"])'); await p.fill('[data-b="t.sx.orto.rot"]', '20'); await pick('t.sx.orto.contact', 'open'); await p.waitForTimeout(200);
  await shot(p, '01f-ws-orto-exam');
  await p.click('#ws-tabs [data-ttab=mat]'); await p.waitForTimeout(200);
  ok((await p.locator('[data-act=mat-spec].on[data-spec=orto]').count()) === 1 && (await p.textContent('.cat-chips')).includes('Wyciągi'), 'orthodontic materials and equipment (brackets, wires, elastics, scanners…)');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  const rec13 = await p.evaluate(() => { const v = window.__dentlist.curVisit(); return v.teeth.find((t) => t.fdi === 13); });
  ok(rec13?.sx?.orto?.contact === 'open' && rec13.work[0].type === 'BRACKET', 'orthodontic examination and bracket saved on tooth 13');
  // ---------- whole mouth: periodontal exam + fixed braces
  await p.click('[data-act=mouth-open]'); await p.waitForTimeout(200);
  await p.click('#vmouth [data-act=mproc-spec][data-spec=perio]'); await p.click('#vmouth [data-act=add-mproc][data-type=PERIO_DX]'); await p.waitForTimeout(300);
  await seg('v.procs.0.stage', 'III'); await seg('v.procs.0.grade', 'B'); await p.waitForTimeout(150); await seg('v.procs.0.extent', 'gen'); await p.waitForTimeout(150);
  await p.fill('[data-b="v.procs.0.bop"]', '35'); await p.fill('[data-b="v.procs.0.ppd"]', '6'); await p.locator('[data-b="v.procs.0.ppd"]').blur();
  await p.click('#vmouth [data-act=mproc-spec][data-spec=orto]'); await p.click('#vmouth [data-act=add-mproc][data-type=FIXED]'); await p.waitForTimeout(300);
  await seg('v.procs.1.arch', 'both'); await p.waitForTimeout(150); await p.selectOption('[data-b="v.procs.1.kind"]', 'self'); await p.waitForTimeout(150);
  await p.fill('[data-b="v.procs.1.system"]', 'Damon Q2'); await p.fill('[data-b="v.procs.1.wire"]', 'NiTi .014'); await p.locator('[data-b="v.procs.1.wire"]').blur(); await p.waitForTimeout(300);
  const v = await p.evaluate(() => { const S = window.__endolist?.S || window.__dentlist?.S; return S.data.visits.get(S.visitId); });
  ok(v.procs.length === 2 && v.procs[0].stage === 'III' && v.procs[1].system === 'Damon Q2', 'whole-mouth procedures saved on the visit');
  const cls = await p.evaluate(() => Object.fromEntries([48, 36, 26, 37].map((f) => [f, document.querySelector(`#arch g.tooth[data-fdi="${f}"]`).getAttribute('class')])));
  ok(/sp-chir/.test(cls[48]) && /sp-impl/.test(cls[36]) && /sp-prot/.test(cls[26]) && /sp-zach/.test(cls[37]), 'chart colours teeth by specialty: ' + JSON.stringify(cls));
  await shot(p, '02-visit');
  // ---------- letter (built-in writer)
  await p.click('#actionbar [data-act=gen-letter]'); await p.waitForSelector('#paper', { timeout: 20000 }); await p.waitForTimeout(800);
  const L = await p.evaluate(() => { const S = (window.__endolist || window.__dentlist).S; return S.data.letters.get(S.letterId); });
  const all = [L.content.opening, ...L.content.sections.flatMap((x) => [x.heading, ...x.paragraphs]), ...L.content.recommendations].join('\n');
  console.log('--- LETTER ---\n' + all);
  ok(/Usunąłem zatrzymany ząb/.test(all) && /Wszczepiłem implant/.test(all) && /Osadziłem koronę protetyczną/.test(all) && /Wypełniłem ubytek/.test(all), 'letter: first person (male) for every specialty');
  ok(L.content.sections.some((x) => x.heading === 'Periodontologia') && L.content.sections.some((x) => x.heading === 'Ortodoncja'), 'letter: sections for whole-mouth specialties');
  ok(/zęby zaklinowane \(K01\.1\)/.test(all), 'letter: ICD-10 diagnosis from the list');
  const box = await p.textContent('#paper .lchart');
  ok(box.includes('Straumann BLX') && box.includes('Jama ustna') && box.includes('Ortodoncja'), 'letter side box: materials + whole-mouth summary');
  ok(await p.evaluate(() => !!document.querySelector('#paper .lchart svg linearGradient[id="lsp-chir"]')), 'letter chart uses specialty gradients');
  await shot(p, '03-letter', { fullPage: true });
  // ProDentis entry
  await p.click('[data-act=prodentis]'); await p.waitForSelector('#pd-text'); const rec = await p.inputValue('#pd-text');
  console.log('--- PRODENTIS ---\n' + rec);
  ok(/Usunięto zatrzymany ząb/.test(rec) && /Wszczepiono implant \(Straumann BLX/.test(rec) && /Jama ustna/.test(rec) && /Ortodoncja: Założono aparat stały/.test(rec) && /Periodontologia: Przeprowadzono badanie periodontologiczne/.test(rec), 'ProDentis entry covers every specialty (impersonal)');
  await p.waitForTimeout(500); await shot(p, '04-prodentis');
  await p.click('.modal footer .btn-ghost'); await p.waitForTimeout(200);
  await p.click('[data-act=save-pdf]'); await p.waitForTimeout(2500);
  const tree = await opfsTree(p); const pdf = tree.find((x) => x.startsWith('Listy/') && x.endsWith('.pdf'));
  ok(!!pdf, 'PDF saved: ' + pdf); if (pdf) fs.writeFileSync(path.join(OUT, 'letter.pdf'), await opfsRead(p, pdf));
  // ---------- child: primary dentition + paediatric procedure
  await p.click('.brand[data-act=go-home]'); await p.waitForTimeout(300);
  await p.click('[data-act=pick-patient]'); await p.fill('.modal [data-f=first]', 'Zosia'); await p.fill('.modal [data-f=last]', 'Nowicka'); await p.fill('.modal [data-f=dob]', '2022-03-01');
  await p.click('.modal footer .btn-primary'); await p.waitForTimeout(300);
  await p.click('[data-act=pick-referrer]'); await p.click('.modal [data-rid]'); await p.waitForTimeout(300);
  ok(await p.locator('#arch g.tooth').count() === 20 && await p.locator('#arch g.tooth[data-fdi="54"]').count() === 1, 'child under 6: primary dentition chart (20 teeth)');
  await p.click('#arch g.tooth[data-fdi="84"]'); await p.waitForSelector('#ws'); await p.waitForTimeout(900);
  ok((await p.textContent('#ws .ws-title')).includes('mleczny'), 'primary tooth named correctly: ' + await p.textContent('#ws .ws-title'));
  await p.click('#ws-tabs [data-ttab=work]'); await p.click('[data-act=work-spec][data-spec=ped]'); await p.click('[data-act=add-work][data-type=SEAL]'); await p.waitForTimeout(200);
  await p.fill('[data-b="t.work.0.product"]', 'Helioseal F Plus'); await shot(p, '05-ws-ped');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  ok(/sp-ped/.test(await p.getAttribute('#arch g.tooth[data-fdi="84"]', 'class')), 'primary tooth coloured by specialty');
  await seg('v.dentition', 'perm'); await p.waitForTimeout(300);
  ok(await p.locator('#arch g.tooth').count() === 32, 'dentition switch shows permanent teeth');
  await seg('v.dentition', 'prim'); await p.waitForTimeout(300);
  await shot(p, '06-visit-child');
  // ---------- patient card: visit history
  await p.click('[data-nav=patients]'); await p.waitForTimeout(300);
  await p.click('tr[data-open-patient]:has-text("Nowicki")'); await p.waitForSelector('.vh');
  const chips = await p.$$eval('.vh-chip', (els) => els.map((e) => e.textContent));
  ok(chips.some((c) => c.startsWith('48')) && chips.some((c) => c.startsWith('JU')), 'visit history: shorthand chips per tooth and whole mouth: ' + chips.join(' | '));
  await p.click('.vh-head'); await p.waitForTimeout(300);
  const body = await p.textContent('.vh-item.open .vh-body');
  ok(body.includes('Wszczepiono implant') && body.includes('Ortodoncja'), 'visit history expands to full detail');
  await p.click('[data-act=vh-filter][data-spec=impl]'); await p.waitForTimeout(200);
  ok((await p.$$eval('.vh-chip', (els) => els.map((e) => e.textContent))).every((c) => c.includes('Implant')), 'visit history filter by specialty');
  await p.click('[data-act=vh-filter][data-spec=""]'); await p.waitForTimeout(200);
  await shot(p, '07-history', { fullPage: true });
  // ---------- complaint (medical director): patient card → Skarga
  ok(await p.locator('[data-nav=complaints]').count() >= 1, 'Skargi in the navigation (single doctor = director)');
  await p.click('[data-act=complaint-new]'); await p.waitForSelector('.cmp');
  ok((await p.textContent('.cmp .who')).includes('Tomasz Nowicki'), 'complaint opened from the patient card has the patient preselected');
  await p.click('.cmp-visit'); await p.waitForTimeout(300);
  await p.selectOption('[data-c=source]', 'lawyer'); await p.waitForTimeout(300);
  await p.fill('[data-c=sender]', 'Kancelaria Radcy Prawnego Marek Zając'); await p.fill('[data-c=senderAddress]', 'ul. Długa 1\n00-001 Warszawa');
  await p.fill('[data-c=summary]', 'Pacjent Tomasz Nowicki zarzuca ból i obrzęk po usunięciu zęba 48 oraz żąda zwrotu kosztów.');
  const scan = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 900; c.height = 1200; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 900, 1200); x.fillStyle = '#222'; x.font = '40px serif'; x.fillText('Wezwanie do zapłaty', 80, 120); return c.toDataURL('image/png').split(',')[1]; });
  fs.writeFileSync(path.join(OUT, 'pismo.png'), Buffer.from(scan, 'base64'));
  await p.setInputFiles('#scan-input', path.join(OUT, 'pismo.png')); await p.waitForSelector('.scan img');
  ok(await p.locator('.scan img').count() === 1, 'scan of the letter attached (stored encrypted)');
  for (const k of ['consent', 'complication', 'control']) await p.click(`label.chip:has(input[data-crb="${k}"])`);
  await p.fill('[data-c=position]', 'Ekstrakcję przeprowadzono prawidłowo; obrzęk i ból są typowe po usunięciu zatrzymanego zęba i ustąpiły po tygodniu.');
  await p.click('[data-cseg=tone] button[data-v=concil]'); await p.waitForTimeout(200);
  // built-in draft (no AI key)
  await p.click('[data-act=complaint-draft]'); await p.waitForSelector('[data-cr=body]');
  const draft = await p.inputValue('[data-cr=body]');
  console.log('--- COMPLAINT DRAFT (built-in) ---\n' + draft);
  ok(/Z dokumentacji medycznej wynika/.test(draft) && /Usunięto zatrzymany ząb/.test(draft) && /świadomą zgodę/.test(draft) && /typowe po usunięciu/.test(draft), 'built-in draft: facts from the record + ticked arguments + director position');
  await shot(p, '08-complaint', { fullPage: true });
  // AI draft (MOCK): pseudonymised payload, scan only with consent
  const calls = [];
  await p.route('https://api.anthropic.com/**', async (route) => {
    const body = route.request().postDataJSON(); calls.push(body);
    const tok = (JSON.stringify(body.messages).match(/\[OSOBA-\d+\]/) || ['[?]'])[0]; // a real model echoes the tokens it was given
    const out = { subject: 'Odpowiedź na pismo z dnia 10.10.2026 dotyczące leczenia Pacjenta', paragraphs: [`W odpowiedzi na pismo w sprawie ${tok} przedstawiam stanowisko.`, 'Usunięcie zatrzymanego zęba 48 przeprowadzono zgodnie z zasadami.'], warnings: ['Sprawdź, czy w dokumentacji jest podpisana zgoda.'] };
    const text = JSON.stringify(out), ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: ev('message_start', { type: 'message_start', message: { id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } }) + ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }) + ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } }) + ev('content_block_stop', { type: 'content_block_stop', index: 0 }) + ev('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } }) + ev('message_stop', { type: 'message_stop' }) });
  });
  await p.evaluate(() => { const st = window.__dentlist.settings(); st.ai.key = 'sk-ant-test'; window.__dentlist.save('settings', st); window.__dentlist.rerender(); });
  await p.click('[data-act=complaint-draft]'); await p.waitForFunction(() => document.querySelector('[data-cr=body]')?.value.includes('zgodnie z zasadami'), null, { timeout: 15000 });
  const c1 = calls.at(-1), txt1 = JSON.stringify(c1.messages);
  ok(c1.system[0].text.includes('dyrektora medycznego') && typeof c1.messages[0].content === 'string', 'AI request: complaint prompt, no scan without consent');
  ok(!/Nowicki|Tomasz|Zając|Marek|Długa/.test(txt1) && txt1.includes('Usunięto zatrzymany ząb'), 'AI request: patient, sender and address pseudonymised; treatment record included');
  ok((await p.textContent('.cmp')).includes('Sprawdź, czy w dokumentacji jest podpisana zgoda') && /Tomasz Nowicki|Nowicki/.test(await p.inputValue('[data-cr=body]')), 'AI draft shown with warnings; tokens restored locally');
  await p.click('label.cmp-check'); await p.waitForTimeout(200);
  await p.click('[data-act=complaint-draft]'); await p.waitForTimeout(1500);
  const c2 = calls.at(-1);
  ok(Array.isArray(c2.messages[0].content) && c2.messages[0].content[0].type === 'image' && c2.messages[0].content[0].source.media_type === 'image/jpeg', 'AI request: scan attached only after the director allows it');
  await p.click('[data-act=complaint-pdf]'); await p.waitForTimeout(2500);
  const tree2 = await opfsTree(p); const cpdf = tree2.find((x) => x.startsWith('Skargi/') && x.endsWith('.pdf'));
  ok(!!cpdf, 'response PDF saved: ' + cpdf); if (cpdf) fs.writeFileSync(path.join(OUT, 'odpowiedz.pdf'), await opfsRead(p, cpdf));
  await p.click('[data-nav=complaints]'); await p.waitForTimeout(300);
  ok((await p.textContent('#view table.list')).includes('Tomasz Nowicki') && (await p.textContent('#view table.list')).includes('w opracowaniu'), 'complaints list with status');
  await shot(p, '09-complaints');
  // complaint about a patient treated outside the app: patient data, description, documents → draft
  await p.click('[data-act=complaint-new]'); await p.waitForSelector('.cmp');
  await p.click('[data-cseg=mode] button[data-v=outside]'); await p.waitForSelector('[data-co=last]');
  await p.fill('[data-co=first]', 'Barbara'); await p.fill('[data-co=last]', 'Wiśniewska'); await p.fill('[data-co=dates]', '03.2025');
  await p.fill('[data-co=treatment]', '12.03.2025 ząb 46: leczenie kanałowe w znieczuleniu, koferdam, trzy kanały, wypełnienie metodą fali ciągłej, RTG kontrolne prawidłowe.\n\n02.04.2025: odbudowa kompozytowa zęba 46.');
  await p.fill('[data-c=summary]', 'Pacjentka zarzuca ból zęba 46 po leczeniu.');
  await p.selectOption('#doc-kind', 'plan'); await p.setInputFiles('#doc-input', path.join(OUT, 'pismo.png')); await p.waitForSelector('.scan img');
  ok((await p.textContent('.cmp')).includes('Plan leczenia'), 'outside patient: treatment plan photo attached as documentation');
  await p.click('[data-act=complaint-draft]'); await p.waitForFunction(() => document.querySelector('[data-cr=body]')?.value.includes('zgodnie z zasadami') || document.querySelector('[data-cr=body]')?.value.length > 50, null, { timeout: 15000 });
  const c3 = calls.at(-1), txt3 = JSON.stringify(c3?.messages || '');
  ok(c3 && txt3.includes('treated_outside_app') && txt3.includes('fali ciągłej') && !/Wiśniewsk|Barbara/.test(txt3) && typeof c3.messages[0].content === 'string', 'outside patient (AI MOCK): description sent, name pseudonymised, documents only with consent');
  await p.click('label.cmp-check:has([data-cchk=allowDocsAI])'); await p.waitForTimeout(200);
  await p.click('[data-act=complaint-draft]'); await p.waitForTimeout(1500);
  const c4 = calls.at(-1);
  ok(Array.isArray(c4.messages[0].content) && c4.messages[0].content.some((x) => x.type === 'image'), 'outside patient (AI MOCK): documentation image attached after consent');
  await shot(p, '09b-complaint-outside', { fullPage: true });
  await p.evaluate(() => { const st = window.__dentlist.settings(); st.ai.key = ''; window.__dentlist.save('settings', st); });
  await p.click('[data-act=complaint-draft]'); await p.waitForTimeout(800);
  const d5 = await p.inputValue('[data-cr=body]');
  ok(/wynika następujący przebieg leczenia/.test(d5) && /fali ciągłej/.test(d5) && /plan leczenia/.test(d5), 'outside patient: built-in draft uses the description and lists the documents');
  await p.evaluate(() => { const st = window.__dentlist.settings(); st.ai.key = 'sk-ant-test'; window.__dentlist.save('settings', st); });
  // ---------- assistant: typed / spoken commands → the right place in the app
  const ask = async (text) => { if (!(await p.locator('#asst').count())) { await p.keyboard.press('Control+k'); await p.waitForSelector('#asst-input'); } await p.fill('#asst-input', text); await p.press('#asst-input', 'Enter'); await p.waitForTimeout(700); };
  await p.click('[data-nav=visit]'); await p.waitForTimeout(300);
  await p.keyboard.press('Control+k'); await p.waitForSelector('#asst-input');
  ok(await p.locator('#asst .chips .chip').count() >= 6, 'assistant opens with Ctrl+K, examples shown');
  await shot(p, '10-assistant');
  await ask('otwórz ząb 36');
  ok(await p.locator('#ws[aria-label="Ząb 36"], #ws .ws[aria-label="Ząb 36"]').count() === 1 && !(await p.locator('#asst').count()), 'assistant: "otwórz ząb 36" opens the tooth card');
  const nWork = await p.locator('#ws-tab .spcard').count();
  await p.click('#ws [data-act=assistant]'); await p.waitForSelector('#asst-input');
  await ask('dodaj koronę 36');
  ok((await p.locator('#ws-tab .spcard').count()) === nWork + 1 && (await p.locator('#ws-tabs .step.on[data-ttab=work]').count()) === 1, 'assistant: "dodaj koronę 36" adds a crown in the open tooth card (Zabiegi step)');
  await p.click('[data-act=ws-save]'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => window.__dentlist.curVisit().teeth.find((t) => t.fdi === 36)?.work.some((w) => w.type === 'CROWN')), 'crown on 36 saved in the visit');
  await ask('leczenie kanałowe 26');
  ok(await p.locator('#ws-tabs .step.on[data-ttab=endo]').count() === 1 && (await p.getAttribute('#ws .ws', 'aria-label')) === 'Ząb 26', 'assistant: "leczenie kanałowe 26" opens tooth 26 at the Endodoncja step');
  await p.click('[data-act=ws-cancel]'); await p.waitForTimeout(300); if (await p.locator('.overlay footer .btn').count()) { await p.click('.overlay footer .btn:last-child'); await p.waitForTimeout(300); }
  const nProcs = await p.evaluate(() => (window.__dentlist.curVisit().procs || []).length);
  await ask('skaling');
  ok(await p.evaluate((n) => { const pr = window.__dentlist.curVisit().procs || []; return pr.length === n + 1 && pr.at(-1).type === 'SCALE'; }, nProcs), 'assistant: "skaling" adds a whole-mouth procedure');
  await ask('gdzie zmienić podpis');
  ok((await p.evaluate(() => window.__dentlist.S.view)) === 'settings' && (await p.locator('section.asst-flash h3:has-text("Lekarz i gabinet")').count()) === 1, 'assistant: "gdzie zmienić podpis" opens Settings at the doctor section');
  await ask('pokaż pacjenta Nowickiego');
  ok((await p.evaluate(() => window.__dentlist.S.view)) === 'patient' && (await p.textContent('#view h2')).includes('Nowicki'), 'assistant: patient found by an inflected surname');
  await ask('pokaż skargi');
  ok((await p.evaluate(() => window.__dentlist.S.view)) === 'complaints', 'assistant: "pokaż skargi"');
  // AI fallback (MOCK) for an unusual phrasing
  await p.unroute('https://api.anthropic.com/**');
  const acalls = [];
  await p.route('https://api.anthropic.com/**', async (route) => {
    const body = route.request().postDataJSON(); acalls.push(body);
    const cmd = JSON.parse(body.messages[0].content).command;
    const out = /przysłał/.test(cmd) ? { action: 'go', params: { view: 'referrers', query: '', fdi: '', step: '', type: '', section: '', what: '' }, reply: 'Otwieram lekarzy kierujących — tam dodasz lekarza.' } : { action: 'answer', params: { view: '', query: '', fdi: '', step: '', type: '', section: '', what: '' }, reply: 'Listy zapisujesz przyciskiem „Zapisz PDF" na ekranie listu.' };
    const text = JSON.stringify(out), ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: ev('message_start', { type: 'message_start', message: { id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } }) + ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }) + ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } }) + ev('content_block_stop', { type: 'content_block_stop', index: 0 }) + ev('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 5 } }) + ev('message_stop', { type: 'message_stop' }) });
  });
  await ask('chcę wpisać doktora, który przysłał tego chorego'); await p.waitForTimeout(800);
  const a1 = acalls.at(-1);
  ok(!!a1 && a1.system[0].text.includes('nawigacji') && JSON.parse(a1.messages[0].content).app.actions.go && (await p.evaluate(() => window.__dentlist.S.view)) === 'referrers', 'assistant (AI MOCK): unusual phrasing → AI picks the action from the app list → Lekarze kierujący');
  const nA = acalls.length;
  await ask('a jak się w ogóle robi te pdf-y z listów?'); await p.waitForTimeout(500);
  ok((await p.textContent('#asst-reply')).includes('Zapisz PDF') && acalls.length === nA, 'assistant: a "how do I" question about letters is answered in the panel (no AI needed)');
  await ask('opowiedz mi coś o tej aplikacji'); await p.waitForTimeout(800);
  ok((await p.textContent('#asst-reply')).includes('Zapisz PDF') && acalls.length === nA + 1, 'assistant (AI MOCK): free question → text answer from AI in the panel');
  await p.unroute('https://api.anthropic.com/**');
  await p.evaluate(() => { const st = window.__dentlist.settings(); st.ai.key = ''; window.__dentlist.save('settings', st); });
  await ask('chcę być na profilu chirurgicznym'); await p.waitForTimeout(300);
  ok((await p.evaluate(() => window.__dentlist.settings().doctor.home)) === 'chir' && (await p.getAttribute('html', 'data-spec')) === 'chir', 'assistant: "chcę być na profilu chirurgicznym" switches the profile to surgery');
  await ask('profil zachowawczy'); await p.waitForTimeout(300);
  ok((await p.evaluate(() => window.__dentlist.settings().doctor.home)) === 'zach', 'assistant: "profil zachowawczy" switches back');
  await ask('pokaż mi gdzie są kopje zapasowe danych'); await p.waitForTimeout(300);
  await ask('jakaś zupełnie dziwna rzecz z kopją'); await p.waitForTimeout(300);
  ok((await p.locator('#asst-reply [data-asst-ex]').count()) >= 1, 'assistant: not sure → offers "did you mean…" commands');
  await p.click('#asst-reply [data-asst-ex]'); await p.waitForTimeout(500);
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  if (await p.locator('#asst').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
  ok(!(await p.locator('#asst').count()), 'assistant closes with Esc');
  console.log('ERRORS', p.errs);
  ok(!p.errs.length, 'no page errors');
  await ctx.close();
  console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

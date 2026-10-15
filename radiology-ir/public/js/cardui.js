// "Karta zabiegu" and "List do kierującego" views of RadVox IR.
// Card: branch → region diagram → click vessels / organs → per lesion: finding, numbers, procedures,
// devices from the catalogue → access, drugs, dose, outcome, complications, recommendations.
// From the card: the REPORT (card text → AI merge into a template) and the LETTER to the referring doctor.
import { partLabel } from './diagram.js';
import { showDiagram } from './diagram3d.js';
import { createModel3D } from './model3d.js';
import { CLINICAL, lesionFacts, lesionAuto, fieldValue } from './clinical.js';
import { variantsFor, applyVariants, variantById } from './variants.js';
import { loadDiagrams } from './diagrams/index.js';
import { procLabel, proceduresFor, suggestTemplates } from './anatomy.js';
import {
  FINDINGS, findingDef, ACCESS_SITES, GUIDANCE, ANAESTHESIA, URGENCY, OUTCOME, SIDES,
  emptyCard, newLesion, deviceText, lesionBadge, cardToText, cardGaps, cardProcedures,
  builtinLetter, fillLetter, pseudonymiseLetter, greeting, figureCaption, figureCallout, PH,
} from './card.js';
import { renderFigure } from './figure.js';
import { Dictation, speechSupported } from './speech.js';
import { localParse, applyParsed } from './parse.js';

const CARD_KEY = 'radvox.card.v1';
const PATIENT_KEY = 'radvox.patient.v1'; // sessionStorage only — never kept after the browser closes
const REFERRERS_KEY = 'radvox.referrers.v1';
const SENDER_KEY = 'radvox.sender.v1';
const ASSETS_KEY = 'radvox.letterAssets.v1'; // { logo, sign } — images, this computer only
const CUSTOM_DEV_KEY = 'radvox.devices.custom.v1';
const BRANCHES = [['Vascular', 'Naczyniowe', 'Vascular'], ['Neuro', 'Neuro', 'Neuro'], ['NonVascular', 'Nienaczyniowe', 'Non-vascular']];

let api = null; // functions from app.js
let diagrams = [];
let categories = [];
const ui = {
  card: emptyCard(),
  active: null, // lesion id being edited
  view: 'report',
  letter: { text: '', subject: '', warnings: [], lang: 'pl', length: 'standard', recipient: 'referring_doctor', warn: true, source: '' },
  dev: { target: null, cat: null, item: null }, // device picker: target = lesion id or 'general'
};
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lang = () => (api.state().outputLang === 'en' ? 'en' : 'pl');
const t2 = (pl, en) => (lang() === 'en' ? en : pl);
const lbl = (pair) => (Array.isArray(pair) ? pair[lang() === 'en' ? 1 : 0] : pair);
const baseDiagram = (id) => diagrams.find((d) => d.id === id) || null;
/** The diagram with this patient's anatomical variants applied (parts thinner / missing / added). */
const diagramOf = (id) => applyVariants(baseDiagram(id), ui.card.variants || []);
let viewer = null; // { key, ctrl } — the live 3D (or 2D) view
const partOf = (dId, pId) => diagramOf(dId)?.parts.find((p) => p.id === pId) || null;
const labelOf = (l, lg = lang()) => {
  const p = partOf(l.diagram, l.part);
  const base = partLabel(p, lg) || l.part;
  if (p && !p.side && l.side) return `${base} (${{ right: ['strona prawa', 'right'], left: ['strona lewa', 'left'], both: ['obustronnie', 'bilateral'] }[l.side][lg === 'en' ? 1 : 0]})`;
  return base;
};
const anatOf = (l) => partOf(l.diagram, l.part)?.anat || diagramOf(l.diagram)?.anat || null;
const store = {
  get(k, def, s = localStorage) { try { return JSON.parse(s.getItem(k) || 'null') ?? def; } catch { return def; } },
  set(k, v, s = localStorage) { try { s.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

// ---------------------------------------------------------------- persistence
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    store.set(CARD_KEY, { card: ui.card, letter: ui.letter, view: ui.view });
    renderCount();
  }, 200);
}
function patient() { return store.get(PATIENT_KEY, {}, sessionStorage); }
function savePatient() {
  store.set(PATIENT_KEY, { name: $('lfPatient').value.trim(), dob: $('lfDob').value.trim(), sex: segValue('lfSex', 'sex'), date: $('lfDate').value, referrer: $('lfReferrer').value.trim(), unit: $('lfUnit').value.trim(), title: segValue('lfTitle', 'title'),
    addr: $('lfRefAddr').value.trim(), city: $('lfRefCity').value.trim(), rcontact: $('lfRefContact').value.trim(), pwz: $('lfRefPwz').value.trim() }, sessionStorage);
}

/** Start a new card (new patient). */
export function resetCard() {
  ui.card = emptyCard();
  ui.active = null;
  ui.letter = { ...ui.letter, text: '', subject: '', warnings: [], source: '' };
  try { sessionStorage.removeItem(PATIENT_KEY); } catch { /* ignore */ }
  for (const id of ['lfPatient', 'lfDob', 'lfReferrer', 'lfUnit', 'lfRefAddr', 'lfRefCity', 'lfRefContact', 'lfRefPwz']) $(id).value = '';
  $('lfDate').value = today();
  setSeg('lfSex', 'sex', '');
  setSeg('lfTitle', 'title', 'team');
  save();
  renderCard();
  renderLetter();
}
const today = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- views
export function setView(view) {
  ui.view = ['card', 'report', 'letter'].includes(view) ? view : 'report';
  for (const b of $('viewTabs').querySelectorAll('[data-view]')) b.setAttribute('aria-selected', String(b.dataset.view === ui.view));
  $('viewCard').hidden = ui.view !== 'card';
  $('viewReport').hidden = ui.view !== 'report';
  $('viewLetter').hidden = ui.view !== 'letter';
  document.body.dataset.view = ui.view;
  if (ui.view === 'card') renderCard();
  if (ui.view === 'letter') renderLetter();
  save();
}
export const currentView = () => ui.view;
function renderCount() {
  const n = ui.card.lesions.length;
  $('cardCount').hidden = !n;
  $('cardCount').textContent = String(n);
  $('letterDot').hidden = !ui.letter.text;
}

// ---------------------------------------------------------------- card
function segValue(id, key) { return $(id).querySelector('[aria-pressed="true"]')?.dataset[key] ?? ''; }
function setSeg(id, key, value) { for (const b of $(id).querySelectorAll(`[data-${key}]`)) b.setAttribute('aria-pressed', String(b.dataset[key] === value)); }

const PRIMARY = { Vascular: 'body3d', Neuro: 'neuro3d' };
function regionList(branch = ui.card.branch) {
  const list = diagrams.filter((d) => !branch || d.branches.includes(branch));
  const first = PRIMARY[branch];
  return first ? [...list.filter((d) => d.id === first), ...list.filter((d) => d.id !== first)] : list;
}

export function renderCard() {
  if (!api) return;
  const c = ui.card;
  $('cardBranch').innerHTML = BRANCHES.map(([id, pl, en]) => `<button type="button" data-branch="${id}" aria-pressed="${c.branch === id}">${esc(lang() === 'en' ? en : pl)}</button>`).join('');
  const regions = regionList();
  if (c.branch && (!c.diagram || !regions.some((d) => d.id === c.diagram))) c.diagram = regions[0]?.id || null;
  $('cardRegions').innerHTML = !c.branch
    ? `<span class="card-hint">${t2('Wybierz rodzaj zabiegu', 'Choose the type of procedure')} →</span>`
    : regions.map((d) => {
      const n = c.lesions.filter((l) => l.diagram === d.id).length;
      return `<button type="button" class="chip-btn region-chip" data-diagram="${d.id}" aria-pressed="${d.id === c.diagram}">${esc(lbl(d.label))}${n ? `<span class="count">${n}</span>` : ''}</button>`;
    }).join('');
  $('cardUrgency').innerHTML = URGENCY.map(([id, pl, en]) => `<option value="${id}"${c.urgency === id ? ' selected' : ''}>${esc(t2('Tryb: ', 'Setting: '))}${esc(lang() === 'en' ? en : pl)}</option>`).join('');
  renderDiagramArea();
  renderSide();
  renderGaps();
  renderCount();
}

function renderDiagramArea() {
  const c = ui.card;
  const d = diagramOf(c.diagram);
  const host = $('dgmHost');
  const dropViewer = () => { if (viewer) { viewer.ctrl.dispose(); viewer = null; } };
  if (!c.branch) {
    dropViewer();
    host.innerHTML = `<div class="dgm-start">
      <div class="start-steps">
        <div class="st"><b>1</b><span>${t2('Powiedz, co zrobiłeś', 'Say what you did')}</span><small>${t2('mikrofon lub tekst u góry — schemat i karta ustawią się same', 'microphone or text above — the diagram and the card set themselves up')}</small></div>
        <div class="st"><b>2</b><span>${t2('Sprawdź i uzupełnij', 'Check and complete')}</span><small>${t2('sprzęt, rozmiary, wynik — kilka kliknięć', 'devices, sizes, result — a few clicks')}</small></div>
        <div class="st"><b>3</b><span>${t2('Opis i list', 'Report and letter')}</span><small>${t2('jednym przyciskiem na dole', 'one button at the bottom')}</small></div>
      </div>
      <div class="start-or">${t2('albo wybierz ręcznie i kliknij naczynie na schemacie:', 'or choose by hand and click the vessel on the diagram:')}</div>
      <div class="start-branches">${BRANCHES.map(([id, pl, en]) => `<button type="button" class="dgm-start-btn" data-branch="${id}"><b>${esc(lang() === 'en' ? en : pl)}</b><small>${esc(id === 'Vascular' ? t2('aorta, tętnice szyjne, trzewne, kończyny, żyły', 'aorta, carotids, visceral, limbs, veins') : id === 'Neuro' ? t2('tętniaki, AVM, udar, tętnice szyjne i kręgowe', 'aneurysms, AVM, stroke, carotid and vertebral arteries') : t2('drenaże, biopsje, ablacje, kręgosłup', 'drainage, biopsy, ablation, spine'))}</small></button>`).join('')}</div>
    </div>`;
    $('dgmHint').hidden = true;
    return;
  }
  if (!d) { dropViewer(); host.innerHTML = `<div class="dgm-start"><p>${t2('Brak schematu dla tej grupy.', 'No diagram for this group.')}</p></div>`; return; }
  const marks = {};
  for (const l of c.lesions) if (l.diagram === d.id) marks[l.part] = lesionBadge(l);
  const activeLes = c.lesions.find((l) => l.id === ui.active);
  const active = activeLes?.diagram === d.id ? activeLes.part : null;
  const key = `${d.id}|${c.branch}|${JSON.stringify((c.variants || []).filter((v) => variantById(v.id)?.diagrams.includes(d.id)))}`;
  if (viewer && viewer.key === key && host.firstChild) viewer.ctrl.update({ marks, active, lang: lang(), lesions: lesionsFor(d.id) });
  else {
    dropViewer();
    const lesions = lesionsFor(d.id);
    let ctrl = null;
    // carotid work in the vascular branch: open the brain/neck model on the neck
    const view = d.id === 'neuro3d' && c.branch === 'Vascular' ? 'neck' : undefined;
    if (d.kind === 'model3d') ctrl = createModel3D(host, d, { marks, active, lang: lang(), onPick: pickPart, lesions, view });
    if (!ctrl && d.kind === 'list') ctrl = organList(host, d, { marks, active });
    if (!ctrl) ctrl = showDiagram(host, d, { marks, active, lang: lang(), onPick: pickPart });
    viewer = { key, ctrl };
    window.radvoxDiagram = viewer.ctrl; // for automated tests
  }
  $('dgmHint').hidden = false;
  $('dgmHint').textContent = d.kind === 'list' ? t2('Kliknij narząd, aby dodać zmianę; stronę wybierzesz w karcie zmiany.', 'Click an organ to add a lesion; choose the side in the lesion card.') : t2('Przeciągnij, aby obrócić · kółko = zoom · kliknij naczynie lub narząd, aby dodać zmianę · P = prawa strona pacjenta.', 'Drag to rotate · wheel = zoom · click a vessel or organ to add a lesion · P = patient\'s right.');
}

/** What the 3D model draws for each lesion (narrowing, clot, sac, devices). */
function lesionsFor(diagramId) {
  return ui.card.lesions.filter((l) => l.diagram === diagramId).map((l) => {
    const { notes, id, ...rest } = l; void notes; void id;
    return { ...rest, devices: (l.devices || []).map((d) => ({ cat: d.cat, name: d.name, size: d.size, qty: d.qty })) };
  });
}
/** Non-vascular regions: a clean list of organs instead of a drawing. */
function organList(host, d, { marks }) {
  const draw = (m) => {
    host.innerHTML = `<div class="organ-list"><div class="ol-title">${esc(lbl(d.label))}</div><div class="ol-grid">${d.parts.map((p) => `<button type="button" class="ol-item${Object.prototype.hasOwnProperty.call(m, p.id) ? ' on' : ''}" data-organ="${p.id}"><span>${esc(lbl(p.label))}</span>${m[p.id] ? `<b>${esc(m[p.id])}</b>` : ''}</button>`).join('')}</div></div>`;
  };
  draw(marks);
  host.onclick = (e) => { const b = e.target.closest('[data-organ]'); if (b) pickPart(b.dataset.organ); };
  return { update(next) { draw(next.marks || marks); }, dispose() { host.onclick = null; host.textContent = ''; }, reset() {}, snapshot: () => null };
}

function pickPart(partId, t = 0.5) {
  const c = ui.card;
  // a second click on the same vessel far from the first one is a second lesion (tandem lesions)
  const same = c.lesions.filter((l) => l.diagram === c.diagram && l.part === partId);
  const existing = same.find((l) => Math.abs((l.t ?? 0.5) - t) < 0.25) || (same.length && !Number.isFinite(t) ? same[0] : null);
  if (existing) ui.active = existing.id;
  else {
    const part = partOf(c.diagram, partId);
    const l = newLesion(c.diagram, partId, part?.kind || 'vessel', Number.isFinite(t) ? Math.round(t * 100) / 100 : 0.5);
    c.lesions.push(l);
    ui.active = l.id;
  }
  save();
  renderCard();
  setTimeout(() => $('cardSide').querySelector('.les-editor select, .les-editor input')?.focus(), 0);
}

function sectionOpen(id) { return store.get('radvox.cardOpen.v2', {})[id] ?? false; }
function rememberOpen(id, open) { const o = store.get('radvox.cardOpen.v2', {}); o[id] = open; store.set('radvox.cardOpen.v2', o); }

const sec_ = (id, title, body, summary = '') => `<details class="card-sec" data-sec="${id}"${sectionOpen(id) ? ' open' : ''}><summary><span>${esc(title)}</span><span class="sec-sum">${esc(summary)}</span></summary><div class="sec-body">${body}</div></details>`;

function renderSide() {
  const c = ui.card;
  const lg = lang();
  const les = c.lesions.find((l) => l.id === ui.active) || null;
  const list = c.lesions.length
    ? c.lesions.map((l, i) => `<li class="${l.id === ui.active ? 'on' : ''}"><button type="button" class="les-pick" data-les="${l.id}"><span class="les-num">${i + 1}</span><span class="les-name">${esc(labelOf(l))}</span><span class="les-badge">${esc(lesionBadge(l))}</span></button><button type="button" class="x-btn" data-del-les="${l.id}" title="${t2('Usuń', 'Remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('')
    : `<li class="les-empty">${t2('Brak zaznaczonych zmian — kliknij schemat.', 'Nothing marked yet — click the diagram.')}</li>`;
  const sites = ACCESS_SITES[c.branch || 'Vascular'];
  const opt = (arr, cur) => `<option value="">—</option>${arr.map(([id, pl, en]) => `<option value="${id}"${cur === id ? ' selected' : ''}>${esc(lg === 'en' ? en : pl)}</option>`).join('')}`;
  const devList = (devs, owner) => devRows(devs.map((d) => [d, c.devices.indexOf(d)]), owner);
  const generalDevs = c.devices.filter((d) => d.cat !== 'drugs');
  const drugs = c.devices.filter((d) => d.cat === 'drugs');
  const dev = c.devices;

  $('cardSide').innerHTML = `
    <div class="les-head"><span>${t2('Zmiany', 'Lesions')}</span></div>
    <ul class="les-list">${list}</ul>
    ${les ? lesionEditor(les) : ''}
    <div class="les-head more-head"><span>${t2('Szczegóły zabiegu', 'Procedure details')}</span><small>${t2('rozwiń, jeśli potrzebne', 'open when needed')}</small></div>
    ${variantSection()}
    ${clinicalSection()}
    ${sec_('indication', t2('Wskazanie', 'Indication'), `<textarea id="cfIndication" rows="2" spellcheck="true" placeholder="${t2('np. objawowe zwężenie tętnicy szyjnej wewnętrznej prawej, TIA', 'e.g. symptomatic right ICA stenosis, TIA')}">${esc(c.indication)}</textarea>`, c.indication ? '✓' : '')}
    ${sec_('access', t2('Dostęp, znieczulenie, kontrola obrazowa', 'Access, anaesthesia, guidance'), `
      <div class="cf-row"><label>${t2('Dostęp', 'Access')}</label><select id="cfSite">${opt(sites, c.access.site)}</select>
        <div class="seg" id="cfSide">${SIDES.map(([id, pl, en]) => `<button type="button" data-side="${id}" aria-pressed="${c.access.side === id}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>
      <div class="cf-row"><label>${t2('Koszulka', 'Sheath')}</label><input id="cfSheath" type="text" value="${esc(c.access.sheath)}" placeholder="${t2('np. 6 F', 'e.g. 6 F')}" /></div>
      <div class="cf-row"><label>${t2('Hemostaza', 'Haemostasis')}</label><input id="cfClosure" type="text" list="cfClosureList" value="${esc(c.access.closure)}" placeholder="${t2('np. urządzenie zamykające / ucisk', 'e.g. closure device / compression')}" /><datalist id="cfClosureList">${closureOptions()}</datalist></div>
      <div class="cf-row"><label>${t2('Znieczulenie', 'Anaesthesia')}</label><div class="seg" id="cfAnaes">${ANAESTHESIA.map(([id, pl, en]) => `<button type="button" data-anaes="${id}" aria-pressed="${c.anaesthesia === id}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>
      <div class="cf-row"><label>${t2('Kontrola', 'Guidance')}</label><div class="chips" id="cfGuidance">${GUIDANCE.map(([id, pl, en]) => `<button type="button" class="anat-chip" data-guide="${id}" aria-pressed="${c.guidance.includes(id)}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>`,
    c.access.site ? (sites.find((x) => x[0] === c.access.site)?.[lg === 'en' ? 2 : 1] || '') : '')}
    ${sec_('devices', t2('Sprzęt ogólny i leki', 'General devices and drugs'), `
      <p class="sec-note">${t2('Koszulki, cewniki prowadzące, prowadniki, zamknięcie — oraz leki (heparyna, trombolityk, nimodypina…).', 'Sheaths, guide catheters, wires, closure — and drugs (heparin, thrombolytic, nimodipine…).')}</p>
      ${devList(generalDevs.map((d) => d), 'general')}
      <button type="button" class="btn btn-small" data-add-dev="general">+ ${t2('Sprzęt', 'Device')}</button>
      ${drugs.length ? `<div class="sec-sub">${t2('Leki', 'Drugs')}</div>${devRows(drugs.map((d) => [d, dev.indexOf(d)]), 'general')}` : ''}
      <button type="button" class="btn btn-small" data-add-dev="general" data-cat="drugs">+ ${t2('Lek', 'Drug')}</button>`,
    c.devices.length ? String(c.devices.length) : '')}
    ${sec_('dose', t2('Kontrast i dawka', 'Contrast and dose'), `
      <div class="cf-grid3">
        <div class="field"><label for="cfContrast">${t2('Kontrast (ml)', 'Contrast (ml)')}</label><input id="cfContrast" type="text" inputmode="decimal" value="${esc(c.contrast)}" /></div>
        <div class="field"><label for="cfFluoro">${t2('Fluoroskopia (min)', 'Fluoroscopy (min)')}</label><input id="cfFluoro" type="text" inputmode="decimal" value="${esc(c.fluoro)}" /></div>
        <div class="field"><label for="cfDose">${t2('Dawka', 'Dose')} <select id="cfDoseUnit">${['Gy·cm²', 'mGy', 'mGy·cm', 'µGy·m²'].map((u) => `<option${c.doseUnit === u ? ' selected' : ''}>${u}</option>`).join('')}</select></label><input id="cfDose" type="text" inputmode="decimal" value="${esc(c.dose)}" /></div>
      </div>`, [c.contrast && `${c.contrast} ml`, c.fluoro && `${c.fluoro} min`].filter(Boolean).join(' · '))}
    ${sec_('result', t2('Wynik i powikłania', 'Result and complications'), `
      <div class="cf-row"><label>${t2('Wynik', 'Result')}</label><div class="seg" id="cfOutcome">${OUTCOME.map(([id, pl, en]) => `<button type="button" data-outcome="${id}" aria-pressed="${c.outcome === id}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>
      <div class="cf-row"><label class="lf-check"><input type="checkbox" id="cfNoComp"${c.complications.none ? ' checked' : ''} /> ${t2('bez powikłań', 'no complications')}</label></div>
      <textarea id="cfComp" rows="2" spellcheck="true" placeholder="${t2('Powikłania: co, leczenie, stan obecny', 'Complications: what, management, current status')}"${c.complications.none ? ' hidden' : ''}>${esc(c.complications.text)}</textarea>`,
    `${OUTCOME.find((x) => x[0] === c.outcome)?.[lg === 'en' ? 2 : 1] || ''}${c.complications.none ? '' : ` · ${t2('powikłania', 'complications')}`}`)}
    ${sec_('recs', t2('Zalecenia i kontrola', 'Recommendations and follow-up'), `
      <textarea id="cfRecs" rows="2" spellcheck="true" placeholder="${t2('np. ASA 75 mg + klopidogrel 75 mg przez 3 miesiące; leżenie 6 h', 'e.g. aspirin 75 mg + clopidogrel 75 mg for 3 months; bed rest 6 h')}">${esc(c.recommendations)}</textarea>
      <textarea id="cfFollow" rows="2" spellcheck="true" placeholder="${t2('Kontrola: np. USG Doppler za 1 miesiąc, DSA za 6 miesięcy', 'Follow-up: e.g. Doppler US in 1 month, DSA in 6 months')}">${esc(c.followUp)}</textarea>`,
    c.recommendations || c.followUp ? '✓' : '')}
    ${sec_('notes', t2('Uwagi (opis własny)', 'Notes (free text)'), `<textarea id="cfNotes" rows="3" spellcheck="true" placeholder="${t2('Wszystko, czego nie ma w polach — np. trudności techniczne, wariant anatomiczny', 'Anything not covered above — e.g. technical difficulty, anatomical variant')}">${esc(c.notes)}</textarea>`, c.notes ? '✓' : '')}
  `;
}

function variantSection() {
  const c = ui.card;
  const list = c.diagram ? variantsFor(c.diagram) : [];
  if (!list.length) return '';
  const lg = lang();
  const chosen = (id) => (c.variants || []).find((v) => v.id === id);
  const sideSeg = (v) => `<span class="var-side">${[['right', 'P', 'R'], ['left', 'L', 'L'], ['both', t2('oba', 'both'), 'both']].map(([id, pl, en]) => `<button type="button" data-vside="${v.id}:${id}" aria-pressed="${chosen(v.id)?.side === id}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</span>`;
  const n = (c.variants || []).filter((v) => list.some((x) => x.id === v.id)).length;
  const body = `<p class="sec-note">${t2('Zaznacz warianty — model 3D zmieni się (np. cienki P1 przy płodowej PCA), a wariant trafi do opisu i listu.', 'Mark the variants — the 3D model changes (e.g. thin P1 with a fetal PCA) and the variant goes into the report and the letter.')}</p>
    <div class="var-list">${list.map((v) => { const on = Boolean(chosen(v.id)); return `<div class="var-item${on ? ' on' : ''}"><button type="button" class="anat-chip" data-variant="${v.id}" aria-pressed="${on}">${esc(v.label[lg === 'en' ? 1 : 0])}${v.effect ? '<span class="var-3d" title="zmienia model 3D">3D</span>' : ''}</button>${on && v.sided ? sideSeg(v) : ''}</div>`; }).join('')}</div>`;
  return sec_('variants', t2('Warianty anatomiczne', 'Anatomical variants'), body, n ? String(n) : '');
}

function fieldInput(f, value, prefix, id) {
  const lg = lang();
  const lab = esc(lbl(f.label));
  if (f.type === 'select') return `<div class="field"><label for="${id}">${lab}</label><select id="${id}" data-${prefix}="${f.key}"><option value="">—</option>${f.options.map(([v, pl, en]) => `<option value="${esc(v)}"${String(value ?? '') === v ? ' selected' : ''}>${esc(lg === 'en' ? en : pl)}</option>`).join('')}</select></div>`;
  if (f.type === 'bool') return `<div class="field field-bool"><label class="lf-check"><input type="checkbox" id="${id}" data-${prefix}="${f.key}"${value ? ' checked' : ''} /> ${lab}</label></div>`;
  return `<div class="field"><label for="${id}">${lab}</label><input id="${id}" data-${prefix}="${f.key}" type="text" inputmode="${f.type === 'num' ? 'decimal' : 'text'}" value="${esc(value ?? '')}" /></div>`;
}
// procedures that fit a finding (the rest stay behind „wszystkie”)
const REL_PROCS = {
  aneurysm: ['coiling', 'stent_coiling', 'flow_diverter', 'intrasaccular', 'stent_graft', 'embolization', 'aneurysm_embolization', 'stent'],
  pseudoaneurysm: ['embolization', 'stent_graft', 'aneurysm_embolization'],
  thrombus: ['stroke_thrombectomy', 'thrombectomy', 'thrombolysis', 'pta', 'stent'],
  stenosis: ['carotid_stenting', 'intracranial_stenting', 'pta', 'stent', 'atherectomy', 'stent_graft'],
  occlusion: ['carotid_stenting', 'intracranial_stenting', 'pta', 'stent', 'thrombectomy', 'atherectomy', 'stroke_thrombectomy'],
  dissection: ['carotid_stenting', 'intracranial_stenting', 'stent', 'stent_graft'],
  avm: ['avm_embolization'], davf: ['davf_embolization'], spasm: ['vasospasm'],
  bleeding: ['embolization', 'epistaxis', 'stent_graft', 'tumour_embolization'],
  tumour: ['tumour_embolization', 'embolization', 'chemoembolization', 'radioembolization'],
};
// device categories offered as one-tap chips for each procedure
const QUICK = {
  coiling: ['neuro_coil', 'neuro_microcatheter', 'neuro_microwire', 'neuro_intermediate'],
  stent_coiling: ['neuro_coil', 'neuro_stent_coil', 'neuro_balloon', 'neuro_microcatheter'],
  flow_diverter: ['flow_diverter', 'neuro_microcatheter', 'neuro_intermediate', 'neuro_microwire'],
  intrasaccular: ['intrasaccular', 'neuro_microcatheter', 'neuro_coil'],
  stroke_thrombectomy: ['stent_retriever', 'neuro_aspiration', 'neuro_balloon_guide', 'neuro_microcatheter'],
  carotid_stenting: ['stent_carotid', 'embolic_protection', 'balloon_pta', 'neuro_guide'],
  intracranial_stenting: ['neuro_angioplasty_stent', 'neuro_balloon', 'neuro_microcatheter'],
  avm_embolization: ['neuro_liquid_embolic', 'neuro_microcatheter', 'neuro_coil'],
  davf_embolization: ['neuro_liquid_embolic', 'neuro_coil', 'neuro_microcatheter', 'neuro_balloon'],
  tumour_embolization: ['particles', 'neuro_liquid_embolic', 'microcatheter'],
  mma_embolization: ['particles', 'neuro_liquid_embolic', 'neuro_coil'],
  vasospasm: ['neuro_balloon', 'neuro_microcatheter'],
  stent: ['stent_se_peripheral', 'stent_be_peripheral', 'stent_covered_peripheral', 'balloon_pta'],
  pta: ['balloon_pta', 'balloon_dcb', 'balloon_high_pressure', 'guidewire'],
  stent_graft: ['aortic_evar', 'aortic_tevar', 'stent_covered_peripheral', 'balloon_occlusion'],
  embolization: ['coil_detachable', 'coil_pushable', 'vascular_plug', 'particles', 'liquid_embolic', 'microcatheter'],
  aneurysm_embolization: ['coil_detachable', 'vascular_plug', 'liquid_embolic', 'microcatheter'],
  thrombectomy: ['thrombectomy', 'thrombolysis_catheter', 'balloon_pta'],
  thrombolysis: ['thrombolysis_catheter'],
  atherectomy: ['atherectomy', 'embolic_protection', 'balloon_dcb'],
  chemoembolization: ['particles', 'microcatheter'],
  radioembolization: ['radioembolization', 'microcatheter'],
  epistaxis: ['particles', 'neuro_microcatheter', 'coil_pushable'],
};
const QUICK_BY_FINDING = {
  aneurysm: ['neuro_coil', 'neuro_stent_coil', 'flow_diverter', 'intrasaccular'], thrombus: ['stent_retriever', 'neuro_aspiration'],
  stenosis: ['stent_carotid', 'balloon_pta', 'stent_se_peripheral'], occlusion: ['balloon_pta', 'stent_se_peripheral'], avm: ['neuro_liquid_embolic'], davf: ['neuro_liquid_embolic', 'neuro_coil'],
};
const isCoilDev = (d) => /coil|spiral/i.test(`${d.cat} ${d.name}`) && !/stent_coil/.test(d.cat);
/** Device rows: name, size typed in place, − qty + and remove. `items` = [[device, index in its list]]. */
function devRows(items, owner) {
  const lg = lang();
  if (!items.length) return '';
  return `<ul class="dev-list dev-edit">${items.map(([d, i]) => `<li>
    <span class="dv-name" title="${esc(deviceText(d, lg))}">${d.common ? '<span class="pl-star">★</span>' : ''}${esc(d.name)}${d.maker ? ` <small>${esc(d.maker)}</small>` : ''}</span>
    <input class="dv-size" type="text" data-dsize="${owner}:${i}" value="${esc(d.size || '')}" placeholder="${t2('rozmiar', 'size')}" aria-label="${t2('Rozmiar', 'Size')}" />
    <span class="dv-qty"><button type="button" data-dqty="${owner}:${i}:-1" aria-label="−">−</button><b>${Number(d.qty) || 1}</b><button type="button" data-dqty="${owner}:${i}:1" aria-label="+">+</button></span>
    <button type="button" class="x-btn" data-del-dev="${owner}:${i}" title="${t2('Usuń', 'Remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('')}</ul>`;
}
function quickDevices(l) {
  const avail = new Set(devCategories().map((x) => x.id));
  let cats = [...new Set((l.procs || []).flatMap((p) => QUICK[p] || []))];
  if (!cats.length) cats = QUICK_BY_FINDING[l.finding] || [];
  cats = cats.filter((x) => avail.has(x)).slice(0, 4);
  return cats.map((cid) => {
    const c = categories.find((x) => x.id === cid);
    if (!c) return '';
    const items = [...(c.items || []).filter((i) => i.common), ...(c.items || []).filter((i) => !i.common)].slice(0, 5);
    return `<div class="qd-row"><span class="qd-cat">${esc(lbl(c.label))}</span><div class="qd-chips">${items.map((it) => `<button type="button" class="qd-chip" data-qdev="${esc(`${cid}|${it.name}|${it.maker || ''}`)}">${it.common ? '<span class="pl-star">★</span>' : ''}${esc(it.name)}</button>`).join('')}<button type="button" class="qd-chip more" data-add-dev="${l.id}" data-cat="${cid}">${t2('więcej…', 'more…')}</button></div></div>`;
  }).join('');
}
function leStep(l, n, id, title, summary, body, openByDefault) {
  const key = `${l.id}:${id}`;
  const open = ui.leOpen?.[key] ?? openByDefault;
  return `<details class="le-step" data-step="${key}"${open ? ' open' : ''}><summary><span class="le-n">${n}</span><span class="le-st">${esc(title)}</span><span class="le-sum">${esc(summary)}</span></summary><div class="le-body">${body}</div></details>`;
}
function lesionEditor(l) {
  const lg = lang();
  const kind = l.kind === 'organ' ? 'organ' : 'vessel';
  const def = findingDef(kind, l.finding) || FINDINGS[kind][0];
  const d = diagramOf(l.diagram);
  const vascular = ui.card.branch !== 'Neuro';
  const fields = def.fields.filter((f) => vascular || !f.vascularOnly);
  const pre = fields.filter((f) => f.group === 'pre').map((f) => fieldInput(f, l[f.key], 'lfield', `lf_${f.key}`)).join('');
  const post = fields.filter((f) => f.group === 'post').map((f) => fieldInput(f, l[f.key], 'lfield', `lf_${f.key}`)).join('');
  const facts = lesionFacts(l, lg, { vascular });
  const computed = facts.computed;
  const anat = anatOf(l);
  const all = proceduresFor(anat, api.templates()).filter((p) => branchFits(p));
  const rel = all.filter((p) => (REL_PROCS[l.finding] || []).includes(p) || l.procs.includes(p));
  const showAll = ui.allProcs || !rel.length;
  const procs = showAll ? all : rel;
  const procChips = procs.map((p) => `<button type="button" class="anat-chip" data-proc="${p}" aria-pressed="${l.procs.includes(p)}">${esc(procLabel(p, lg))}</button>`).join('')
    + (rel.length && all.length > rel.length ? `<button type="button" class="link-btn" data-allprocs="1">${showAll ? t2('tylko pasujące', 'matching only') : t2(`wszystkie (${all.length})`, `all (${all.length})`)}</button>` : '');
  const position = d?.kind === 'model3d' ? `<div class="cf-row"><label for="leT">${t2('Miejsce na naczyniu', 'Position on vessel')}</label><input id="leT" type="range" min="0" max="100" value="${Math.round((l.t ?? 0.5) * 100)}" /><span class="le-pos">${(l.t ?? 0.5) < 0.34 ? t2('proksymalnie', 'proximal') : (l.t ?? 0.5) > 0.66 ? t2('dystalnie', 'distal') : t2('środek', 'mid')}</span></div>` : '';
  const sideRow = d?.kind === 'list' ? `<div class="cf-row"><label>${t2('Strona', 'Side')}</label><div class="seg" id="leSide">${[['', '—', '—'], ['right', 'prawa', 'right'], ['left', 'lewa', 'left'], ['both', 'obustronnie', 'bilateral']].map(([v, pl, en]) => `<button type="button" data-lside="${v}" aria-pressed="${(l.side || '') === v}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>` : '';
  const coils = l.devices.filter(isCoilDev).reduce((a, x) => a + (Number(x.qty) || 1), 0);
  const others = l.devices.filter((x) => !isCoilDev(x)).map((x) => x.name);
  const devSum = [coils ? (lg === 'en' ? `${coils} coil${coils > 1 ? 's' : ''}` : `${coils} ${coils === 1 ? 'spirala' : coils < 5 ? 'spirale' : 'spiral'}`) : '', ...others].filter(Boolean).join(', ');
  const step1 = `<div class="cf-row"><label for="leFinding">${t2('Zmiana', 'Finding')}</label><select id="leFinding">${FINDINGS[kind].map((f) => `<option value="${f.id}"${f.id === l.finding ? ' selected' : ''}>${esc(lbl(f.label))}</option>`).join('')}</select></div>
    ${position}${sideRow}
    ${pre ? `<div class="cf-grid2">${pre}</div>` : ''}
    <div class="le-calc" id="leCalc"${computed.length ? '' : ' hidden'}>${computed.map((c) => `<span>${esc(c)}</span>`).join('')}</div>`;
  const step2 = `<div class="chips">${procChips || `<span class="sec-note">${t2('Brak zabiegów dla tej okolicy.', 'No procedures for this region.')}</span>`}</div>`;
  const step3 = `${devRows(l.devices.map((x, i) => [x, i]), l.id)}
    ${coils ? `<div class="sec-note coil-total">${t2('Spirale łącznie', 'Coils in total')}: <b>${coils}</b></div>` : ''}
    <div class="qd">${quickDevices(l)}</div>
    <button type="button" class="btn btn-small" data-add-dev="${l.id}">${t2('Szukaj w katalogu sprzętu…', 'Search the device catalogue…')}</button>`;
  const step4 = `${post ? `<div class="cf-grid2">${post}</div>` : ''}<input id="leNotes" type="text" value="${esc(l.notes)}" placeholder="${t2('Uwagi do tej zmiany (opcjonalnie)', 'Notes on this lesion (optional)')}" />`;
  const preSum = [lbl(def.label), ...facts.pre.slice(0, 3)].join(', ');
  return `<div class="les-editor">
    <div class="le-title">${esc(labelOf(l))}</div>
    ${leStep(l, 1, 'finding', t2('Zmiana', 'Finding'), preSum, step1, !facts.pre.length)}
    ${leStep(l, 2, 'procs', t2('Leczenie', 'Treatment'), l.procs.map((p) => procLabel(p, lg)).join(', ') || t2('wybierz', 'choose'), step2, !l.procs.length)}
    ${leStep(l, 3, 'devices', t2('Sprzęt', 'Devices'), devSum || t2('wybierz', 'choose'), step3, Boolean(l.procs.length) && !l.devices.length)}
    ${leStep(l, 4, 'result', t2('Wynik', 'Result'), facts.post.join(', ') || (post ? t2('uzupełnij', 'fill in') : '—'), step4, Boolean(l.devices.length) && !facts.post.length && Boolean(post))}
  </div>`;
}

function clinicalSection() {
  const b = ui.card.branch;
  const secs = CLINICAL[b];
  if (!secs) return '';
  const c = ui.card.clinical || {};
  return secs.map((sec, i) => {
    const filled = sec.fields.filter((f) => fieldValue(f, c[f.key], lang())).length;
    return sec_(`clin_${b}_${i}`, lbl(sec.title), `<div class="cf-grid2">${sec.fields.map((f) => fieldInput(f, c[f.key], 'clin', `cl_${f.key}`)).join('')}</div>${clinicalExtra(sec)}`, filled ? String(filled) : '');
  }).join('');
}
function clinicalExtra(sec) {
  if (!sec.fields.some((f) => f.key === 'puncture')) return '';
  const lines = cardToText({ ...emptyCard(), branch: ui.card.branch, clinical: ui.card.clinical, complications: { none: false, text: '' }, outcome: '' }, { lang: lang() }).split('\n').filter((x) => /min/.test(x));
  return lines.length ? `<div class="le-calc">${lines.map((x) => `<span>${esc(x.replace(/^[^:]+:\s*/, ''))}</span>`).join('')}</div>` : '';
}
// procedures of the other branches are hidden (e.g. no coiling under "Non-vascular")
const NEURO_ONLY = new Set(['neuro_angio', 'stroke_thrombectomy', 'coiling', 'stent_coiling', 'flow_diverter', 'intrasaccular', 'intracranial_stenting', 'avm_embolization', 'davf_embolization', 'vasospasm', 'venous_sinus', 'mma_embolization', 'bot', 'spinal_angio', 'epistaxis']);
const NONVASC = new Set(['nephrostomy', 'ureteral_stent', 'biliary_drainage', 'biliary_stent', 'cholecystostomy', 'biopsy', 'drainage', 'pleural', 'paracentesis', 'ablation', 'gastrostomy', 'gi_stent', 'vertebroplasty', 'injection', 'marker']);
function branchFits(p) {
  const b = ui.card.branch;
  if (b === 'NonVascular') return NONVASC.has(p) || p === 'sclerotherapy';
  if (b === 'Neuro') return NEURO_ONLY.has(p) || ['carotid_stenting', 'stent', 'pta', 'embolization', 'tumour_embolization', 'thrombolysis', 'diag_angio'].includes(p);
  return !NONVASC.has(p) && !NEURO_ONLY.has(p);
}
function closureOptions() {
  const cat = categories.find((x) => x.id === 'closure') || categories.find((x) => /closure|zamyk/i.test(`${x.id} ${x.label?.join(' ')}`));
  const items = cat ? [...(cat.generic || []), ...(cat.items || []).map((i) => `${i.name} (${i.maker})`)] : [];
  return [...items, t2('ucisk manualny', 'manual compression'), t2('opaska uciskowa na tętnicę promieniową', 'radial compression band')].map((x) => `<option value="${esc(x)}">`).join('');
}

function renderGaps() {
  const gaps = cardGaps(ui.card, lang());
  $('cardGaps').textContent = gaps.length ? `${t2('Brakuje', 'Missing')}: ${gaps.join(', ')}` : t2('Karta kompletna', 'Card complete');
  $('cardGaps').classList.toggle('ok', !gaps.length);
}

// all inputs of the card update the model directly
function onCardInput(e) {
  const c = ui.card;
  const el = e.target;
  const les = c.lesions.find((l) => l.id === ui.active);
  const v = el.value;
  switch (el.id) {
    case 'cfIndication': c.indication = v; break;
    case 'cfSheath': c.access.sheath = v; break;
    case 'cfClosure': c.access.closure = v; break;
    case 'cfContrast': c.contrast = v; break;
    case 'cfFluoro': c.fluoro = v; break;
    case 'cfDose': c.dose = v; break;
    case 'cfComp': c.complications.text = v; break;
    case 'cfRecs': c.recommendations = v; break;
    case 'cfFollow': c.followUp = v; break;
    case 'cfNotes': c.notes = v; break;
    case 'leNotes': if (les) les.notes = v; break;
    default:
      if (el.dataset.dsize) {
        const [owner, i] = el.dataset.dsize.split(':');
        const list = owner === 'general' ? c.devices : c.lesions.find((l) => l.id === owner)?.devices;
        if (list?.[Number(i)]) list[Number(i)].size = v;
        if (owner !== 'general') refreshBadges();
      } else if (el.dataset.lfield && les) {
        les[el.dataset.lfield] = el.type === 'checkbox' ? el.checked : v;
        // calculators: stenosis % from the diameters, ratios, Spetzler-Martin
        Object.assign(les, lesionAuto(les));
        if (les.pre !== undefined && $('lf_pre') && document.activeElement !== $('lf_pre') && $('lf_pre').value !== String(les.pre ?? '')) $('lf_pre').value = les.pre;
        const calc = lesionFacts(les, lang(), { vascular: ui.card.branch !== 'Neuro' }).computed;
        $('leCalc').hidden = !calc.length;
        $('leCalc').innerHTML = calc.map((x) => `<span>${esc(x)}</span>`).join('');
        refreshBadges();
      } else if (el.dataset.clin) {
        c.clinical = c.clinical || {};
        c.clinical[el.dataset.clin] = el.type === 'checkbox' ? el.checked : v;
      } else if (el.id === 'leT' && les) {
        les.t = Number(v) / 100;
        el.nextElementSibling.textContent = les.t < 0.34 ? t2('proksymalnie', 'proximal') : les.t > 0.66 ? t2('dystalnie', 'distal') : t2('środek', 'mid');
        refreshBadges();
      }
  }
  save();
  renderGaps();
}
function refreshBadges() {
  // redraw the diagram badges and the list without re-rendering the inputs being typed in
  renderDiagramArea();
  const les = ui.card.lesions.find((l) => l.id === ui.active);
  const badge = $('cardSide').querySelector(`[data-les="${les?.id}"] .les-badge`);
  if (badge && les) badge.textContent = lesionBadge(les);
}
function onCardChange(e) {
  const c = ui.card;
  const el = e.target;
  const les = c.lesions.find((l) => l.id === ui.active);
  if (el.id === 'cfSite') c.access.site = el.value;
  else if (el.id === 'cfDoseUnit') c.doseUnit = el.value;
  else if (el.id === 'cardUrgency') c.urgency = el.value;
  else if (el.id === 'cfNoComp') { c.complications.none = el.checked; $('cfComp').hidden = el.checked; if (!el.checked) $('cfComp').focus(); }
  else if (el.id === 'leFinding' && les) { les.finding = el.value; renderSide(); refreshBadges(); }
  else if ((el.dataset.lfield || el.dataset.clin) && (el.type === 'checkbox' || el.tagName === 'SELECT')) { onCardInput(e); if (el.dataset.clin) renderSide(); return; }
  save();
  renderGaps();
}
function onCardClick(e) {
  const c = ui.card;
  const b = e.target.closest('button');
  if (!b) return;
  const les = c.lesions.find((l) => l.id === ui.active);
  if (b.dataset.branch) {
    c.branch = b.dataset.branch; c.diagram = null;
    // the open lesion editor belongs to the old branch's region — close it unless that region is shared
    if (les && !regionList().some((d) => d.id === les.diagram)) ui.active = null;
    renderCard(); save(); return;
  }
  if (b.dataset.diagram) { c.diagram = b.dataset.diagram; renderCard(); save(); return; }
  if (b.dataset.les) {
    ui.active = b.dataset.les;
    const l = c.lesions.find((x) => x.id === ui.active);
    if (l && l.diagram !== c.diagram) c.diagram = l.diagram;
    renderCard();
    focusLesion(l);
    return;
  }
  if (b.dataset.allprocs) { ui.allProcs = !ui.allProcs; renderSide(); return; }
  if (b.dataset.qdev && les) {
    const [cat, name, maker] = b.dataset.qdev.split('|');
    const same = les.devices.find((x) => x.name === name && !x.size);
    let idx;
    if (same) { same.qty = (Number(same.qty) || 1) + 1; idx = les.devices.indexOf(same); }
    else { les.devices.push({ cat, name, maker: maker || '', size: '', qty: 1 }); idx = les.devices.length - 1; }
    // choosing a device for a lesion that has no procedure yet: tick the procedure it implies
    if (!les.procs.length) { const p = Object.entries(QUICK).find(([, cats]) => cats[0] === cat)?.[0]; if (p && branchFits(p)) les.procs.push(p); }
    ui.leOpen = { ...(ui.leOpen || {}), [`${les.id}:devices`]: true };
    save(); renderSide(); refreshBadges(); renderGaps();
    setTimeout(() => $('cardSide').querySelector(`[data-dsize="${les.id}:${idx}"]`)?.focus(), 0);
    return;
  }
  if (b.dataset.dqty) {
    const [owner, i, step] = b.dataset.dqty.split(':');
    const list = owner === 'general' ? c.devices : c.lesions.find((l) => l.id === owner)?.devices;
    const d = list?.[Number(i)];
    if (d) d.qty = Math.max(1, Math.min(99, (Number(d.qty) || 1) + Number(step)));
    save(); renderSide(); if (owner !== 'general') refreshBadges();
    return;
  }
  if (b.dataset.delLes) {
    c.lesions = c.lesions.filter((l) => l.id !== b.dataset.delLes);
    if (ui.active === b.dataset.delLes) ui.active = c.lesions.at(-1)?.id || null;
    renderCard(); save(); return;
  }
  if (b.dataset.proc && les) {
    les.procs = les.procs.includes(b.dataset.proc) ? les.procs.filter((p) => p !== b.dataset.proc) : [...les.procs, b.dataset.proc];
    // a procedure chosen → show its devices next
    if (les.procs.includes(b.dataset.proc)) ui.leOpen = { ...(ui.leOpen || {}), [`${les.id}:devices`]: true };
    save(); renderSide(); renderGaps(); return;
  }
  if (b.dataset.variant) {
    const id = b.dataset.variant;
    const v = variantById(id);
    c.variants = c.variants || [];
    if (c.variants.some((x) => x.id === id)) c.variants = c.variants.filter((x) => x.id !== id);
    else c.variants.push({ id, side: v?.sided ? (c.access.side || 'right') : '' });
    save(); renderCard(); return;
  }
  if (b.dataset.vside) {
    const [id, side] = b.dataset.vside.split(':');
    const x = (c.variants || []).find((y) => y.id === id);
    if (x) x.side = side;
    save(); renderCard(); return;
  }
  if (b.dataset.addDev) { openDevPicker(b.dataset.addDev, b.dataset.cat || null); return; }
  if (b.dataset.delDev) {
    const [owner, i] = b.dataset.delDev.split(':');
    const list = owner === 'general' ? c.devices : c.lesions.find((l) => l.id === owner)?.devices;
    if (list) list.splice(Number(i), 1);
    renderSide(); save(); if (owner !== 'general') refreshBadges(); return;
  }
  if (b.dataset.lside !== undefined && les) { les.side = b.dataset.lside; setSeg('leSide', 'lside', les.side); save(); return; }
  if (b.dataset.side && b.closest('#cfSide')) { c.access.side = c.access.side === b.dataset.side ? '' : b.dataset.side; setSeg('cfSide', 'side', c.access.side); save(); return; }
  if (b.dataset.anaes) { c.anaesthesia = b.dataset.anaes; setSeg('cfAnaes', 'anaes', c.anaesthesia); save(); return; }
  if (b.dataset.outcome) { c.outcome = b.dataset.outcome; setSeg('cfOutcome', 'outcome', c.outcome); save(); return; }
  if (b.dataset.guide) {
    const g = b.dataset.guide;
    c.guidance = c.guidance.includes(g) ? c.guidance.filter((x) => x !== g) : [...c.guidance, g];
    b.setAttribute('aria-pressed', String(c.guidance.includes(g)));
    save();
  }
}

// ---------------------------------------------------------------- device picker
function customDevices() { return store.get(CUSTOM_DEV_KEY, []); }
function openDevPicker(target, cat = null) {
  ui.dev = { target, cat: cat || ui.dev.cat || null, item: null };
  const cats = devCategories();
  if (!cats.some((x) => x.id === ui.dev.cat)) ui.dev.cat = target === 'general' ? (cats.find((x) => /sheath/.test(x.id))?.id || cats[0]?.id) : suggestCategory(target, cats);
  $('devSearch').value = '';
  $('devSize').value = '';
  $('devQty').value = '1';
  $('devPicker').hidden = false;
  renderDevPicker();
  setTimeout(() => $('devSearch').focus(), 0);
}
function devCategories() {
  const b = ui.card.branch;
  return categories.filter((x) => !b || !Array.isArray(x.branches) || x.branches.includes(b) || x.id === 'drugs');
}
function suggestCategory(lesionId, cats) {
  const l = ui.card.lesions.find((x) => x.id === lesionId);
  const p = l?.procs[0] || '';
  const want = { stent: /stent/, pta: /balloon|balon/, carotid_stenting: /carotid/, stent_graft: /graft/, embolization: /coil/, aneurysm_embolization: /coil/, coiling: /coil/, stent_coiling: /coil/, flow_diverter: /flow/, stroke_thrombectomy: /retriev|aspir/, chemoembolization: /particle|bead|micros/, radioembolization: /radio|y90|y-90/, biopsy: /biops/, drainage: /drain/, nephrostomy: /nephro|drain/, biliary_drainage: /bil/, ablation: /ablat/, vertebroplasty: /verteb|kypho/ }[p];
  return (want && cats.find((x) => want.test(`${x.id} ${x.label.join(' ').toLowerCase()}`))?.id) || cats[0]?.id;
}
function renderDevPicker() {
  const cats = devCategories();
  const q = $('devSearch').value.trim().toLowerCase();
  $('devCats').innerHTML = cats.map((x) => `<button type="button" class="anat-item" data-dcat="${x.id}" aria-pressed="${!q && x.id === ui.dev.cat}"><span class="lbl">${esc(lbl(x.label))}</span><span class="count">${(x.items?.length || 0) + (x.generic?.length || 0)}</span></button>`).join('');
  const custom = customDevices();
  let rows = [];
  const pool = q ? cats : cats.filter((x) => x.id === ui.dev.cat);
  for (const x of pool) {
    // own entries, then the products most used in Poland, then generic descriptions, then the rest
    for (const cu of custom.filter((y) => y.cat === x.id)) rows.push({ ...cu, custom: true });
    for (const it of (x.items || []).filter((i) => i.common)) rows.push({ cat: x.id, name: it.name, maker: it.maker || '', common: true });
    for (const g of x.generic || []) rows.push({ cat: x.id, name: g, maker: '', generic: true });
    for (const it of (x.items || []).filter((i) => !i.common)) rows.push({ cat: x.id, name: it.name, maker: it.maker || '' });
  }
  if (q) {
    const words = q.split(/\s+/);
    rows = rows.filter((r) => { const h = `${r.name} ${r.maker} ${lbl(categories.find((x) => x.id === r.cat)?.label || '')}`.toLowerCase(); return words.every((w) => h.includes(w)); });
    rows.sort((a, b) => (Boolean(b.custom) - Boolean(a.custom)) || (Boolean(b.common) - Boolean(a.common)));
  }
  const catName = (id) => lbl(categories.find((x) => x.id === id)?.label || '');
  $('devItems').innerHTML = (rows.length ? rows.slice(0, 250).map((r, i) => `<button type="button" class="dev-item${ui.dev.item && ui.dev.item.name === r.name && ui.dev.item.cat === r.cat ? ' on' : ''}" data-dev="${i}"><span class="dn">${r.common ? `<span class="pl-star" title="${t2('Często stosowane w Polsce (publikacje z polskich ośrodków)', 'Commonly used in Poland (Polish centre publications)')}">★</span>` : ''}${esc(r.name)}</span>${r.maker ? `<span class="dm">${esc(r.maker)}</span>` : r.generic ? `<span class="dm gen">${t2('ogólnie', 'generic')}</span>` : ''}${q ? `<span class="dc">${esc(catName(r.cat))}</span>` : ''}${r.custom ? `<span class="dm gen">${t2('własny', 'own')}</span>` : ''}</button>`).join('') : '')
    + (q ? `<button type="button" class="dev-item dev-own" data-own="1">+ ${t2('Dodaj własny', 'Add own')}: <b>${esc($('devSearch').value.trim())}</b></button>` : '');
  ui.dev.rows = rows;
  const cat = categories.find((x) => x.id === (ui.dev.item?.cat || ui.dev.cat));
  $('devSizeLabel').textContent = cat?.size?.length ? `${t2('Rozmiar', 'Size')} (${cat.size.join(' / ')})` : t2('Rozmiar', 'Size');
  $('devSize').placeholder = cat?.id === 'drugs' ? t2('np. 5000 j.m.', 'e.g. 5000 IU') : t2('np. 6 × 80 mm', 'e.g. 6 × 80 mm');
  $('devChosen').textContent = ui.dev.item ? `${ui.dev.item.name}${ui.dev.item.maker ? ` (${ui.dev.item.maker})` : ''}` : t2('Wybierz urządzenie z listy', 'Choose a device from the list');
  $('devAdd').disabled = !ui.dev.item;
}
function devClick(e) {
  if (e.target === $('devPicker')) { closeDevPicker(); return; }
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.dcat) { ui.dev.cat = b.dataset.dcat; $('devSearch').value = ''; renderDevPicker(); return; }
  if (b.dataset.dev !== undefined) { ui.dev.item = ui.dev.rows[Number(b.dataset.dev)]; renderDevPicker(); $('devSize').focus(); return; }
  if (b.dataset.own) {
    const name = $('devSearch').value.trim();
    if (!name) return;
    const item = { cat: ui.dev.cat || 'other', name, maker: '' };
    store.set(CUSTOM_DEV_KEY, [...customDevices().filter((x) => !(x.cat === item.cat && x.name === name)), item].slice(-200));
    ui.dev.item = item;
    $('devSearch').value = '';
    renderDevPicker();
    $('devSize').focus();
  }
}
function addDevice() {
  const it = ui.dev.item;
  if (!it) return;
  const d = { cat: it.cat, name: it.name, maker: it.maker || '', size: $('devSize').value.trim(), qty: Math.max(1, Number($('devQty').value) || 1) };
  if (ui.dev.target === 'general') ui.card.devices.push(d);
  else ui.card.lesions.find((l) => l.id === ui.dev.target)?.devices.push(d);
  save();
  closeDevPicker();
  if (ui.dev.target !== 'general') ui.leOpen = { ...(ui.leOpen || {}), [`${ui.dev.target}:devices`]: true };
  renderSide();
  if (ui.dev.target !== 'general') refreshBadges();
  api.toast(`${t2('Dodano', 'Added')}: ${deviceText(d, lang())}`, 'ok', 1800);
}
function closeDevPicker() { $('devPicker').hidden = true; }

// ---------------------------------------------------------------- card → report
function cardText(lg = lang()) { return cardToText(ui.card, { lang: lg, partOf, labelOf: (l) => labelOf(l, lg) }); }

async function cardToReport() {
  const c = ui.card;
  if (!c.lesions.length && !c.indication.trim() && !c.notes.trim()) { api.toast(t2('Karta jest pusta — zaznacz zmianę na schemacie.', 'The card is empty — mark a lesion on the diagram.'), 'warn'); return; }
  const lg = api.state().outputLang === 'en' ? 'en' : 'pl';
  if (api.isBlank()) {
    const procs = cardProcedures(c);
    const first = c.lesions.find((l) => l.procs.length);
    const anat = first ? anatOf(first) : (c.lesions[0] ? anatOf(c.lesions[0]) : null);
    const labels = first ? [partOf(first.diagram, first.part)?.label?.[0], partOf(first.diagram, first.part)?.label?.[1]].filter(Boolean) : [];
    let tpl = null;
    for (const p of procs) { tpl = suggestTemplates(api.templates(), p, anat, [], labels)[0]; if (tpl) break; }
    if (!tpl) {
      api.setDictation(cardText(lg));
      setView('report');
      api.toast(t2('Wybierz szablon — opis zostanie przygotowany z karty zaraz po wyborze.', 'Choose a template — the report is prepared from the card right after.'), 'info', 4200);
      api.prepareAfterPick();
      return;
    }
    api.selectTemplate(tpl.id);
  }
  api.setDictation(cardText(lg));
  setView('report');
  await api.process({ inputLang: lg });
}

// ---------------------------------------------------------------- letter
function letterCtx() {
  const p = patient();
  const sender = store.get(SENDER_KEY, {});
  const d = p.date || today();
  const [y, m, dd] = d.split('-');
  return {
    patient: p.name || '', dob: p.dob || '', date: y ? `${dd}.${m}.${y}` : '', referrer: p.referrer || '', referrerTitle: p.title || 'team', sex: p.sex || '',
    signature: [sender.name, sender.unit, sender.contact].filter(Boolean).join('\n'),
    unit: p.unit || '', addr: p.addr || '', city: p.city || '', rcontact: p.rcontact || '', pwz: p.pwz || '',
  };
}
// ---------------------------------------------------------------- letter figures (3D schematic of each treated lesion)
const figCache = new Map();
function letterFigureLesions() {
  const all = ui.card.lesions.filter((l) => diagramOf(l.diagram)?.kind === 'model3d' && l.finding !== 'normal');
  const treated = all.filter((l) => l.procs?.length || l.devices?.length);
  return (treated.length ? treated : all).slice(0, 4);
}
function letterFigures(lg) {
  if (figCache.size > 24) figCache.clear();
  return letterFigureLesions().map((l, i) => {
    const d = diagramOf(l.diagram);
    const lesions = lesionsFor(l.diagram);
    const index = ui.card.lesions.filter((x) => x.diagram === l.diagram).indexOf(l);
    const key = JSON.stringify([l.diagram, lesions, index, ui.card.variants, lg]);
    let src = figCache.get(key);
    if (src === undefined) { src = renderFigure(d, lesions, index, { lang: lg, callout: figureCallout(l, lg), compact: true }); figCache.set(key, src); }
    if (!src) return null;
    return { src, caption: figureCaption(l, partOf(l.diagram, l.part), lg, { label: labelOf(l, lg), n: i + 1, vascular: ui.card.branch !== 'Neuro' }) };
  }).filter(Boolean);
}
const figuresHtml = (figs) => (figs.length ? `${figs.map((f) => `<figure class="lp-fig"><img src="${f.src}" alt="${esc(f.caption)}" /><figcaption>${esc(f.caption)}</figcaption></figure>`).join('')}<div class="lp-fig-note">${esc(t2('Schemat poglądowy — nie odwzorowuje dokładnie anatomii pacjenta.', 'Schematic — not the exact anatomy of the patient.'))}</div>` : '');
function renderLetterFigures() {
  const L = ui.letter;
  const on = Boolean(L.text) && L.figures !== false;
  $('lpFigures').hidden = !on;
  if (!on) { $('lpFigures').innerHTML = ''; return; }
  $('lpFigures').innerHTML = figuresHtml(letterFigures(L.lang));
}

// ---------------------------------------------------------------- letter layout: logo, sender, recipient, signature
const assets = () => store.get(ASSETS_KEY, {});
function letterHeadHtml(ctx, { print = false } = {}) {
  const sender = store.get(SENDER_KEY, {});
  const a = assets();
  const unit = sender.unit || (print ? '' : t2('Pracownia Radiologii Zabiegowej', 'Interventional Radiology'));
  const from = `<div class="lp-from">${a.logo ? `<img class="lp-logo" src="${a.logo}" alt="logo" />` : ''}<div class="lp-from-txt">${esc(unit)}${sender.contact ? `<br><span>${esc(sender.contact)}</span>` : ''}</div></div>`;
  const date = `<div class="lp-date">${esc(ctx.date ? `${t2('Data', 'Date')}: ${ctx.date}` : '')}</div>`;
  const to = [ctx.referrer ? `<b>${esc(ctx.referrer)}</b>${ctx.pwz ? `<span class="lp-pwz"> · ${esc(t2('nr PWZ', 'licence no.'))} ${esc(ctx.pwz)}</span>` : ''}` : '', ...[ctx.unit, ctx.addr, ctx.city, ctx.rcontact].filter(Boolean).map(esc)].filter(Boolean);
  return `${from}${date}<div class="lp-to">${to.length ? `${esc(t2('Do', 'To'))}:<br>${to.join('<br>')}` : ''}</div>`;
}
function signHtml(ctx) {
  const a = assets();
  const lines = String(ctx.signature || '').split('\n').filter(Boolean);
  if (!a.sign && !lines.length) return '';
  return `${a.sign ? `<img class="lp-sign-img" src="${a.sign}" alt="${esc(t2('podpis', 'signature'))}" />` : ''}${lines.length ? `<div class="lp-sign-txt">${lines.map(esc).join('<br>')}</div>` : ''}`;
}
/** The letter text without the signature placeholder (the signature block is drawn separately, with the image). */
const bodyWithoutSignature = (text) => String(text || '').split(PH.signature).join('').replace(/\s+$/, '');

function renderLetter() {
  if (!api) return;
  const L = ui.letter;
  setSeg('lfLang', 'lang', L.lang);
  setSeg('lfLength', 'len', L.length);
  setSeg('lfRecipient', 'rec', L.recipient);
  $('lfWarn').checked = L.warn !== false;
  $('lfFigures').checked = L.figures !== false;
  const ctx = letterCtx();
  $('lpHead').innerHTML = letterHeadHtml(ctx);
  const filled = fillLetter(bodyWithoutSignature(L.text), ctx, L.lang);
  $('lpSubject').textContent = L.subject || '';
  $('lpSubject').hidden = !L.subject;
  $('lpBody').innerText = filled;
  $('lpEmpty').hidden = Boolean(L.text);
  $('lpBody').hidden = !L.text;
  $('lpSign').innerHTML = L.text ? signHtml(ctx) : '';
  $('lpSign').hidden = !L.text || !$('lpSign').innerHTML;
  if (ui.view === 'letter') renderLetterFigures();
  $('lfWarningsList').innerHTML = (L.warnings || []).map((w) => `<li>${esc(w)}</li>`).join('');
  $('lfWarnings').hidden = !(L.warnings || []).length;
  for (const id of ['lfRevise', 'lfPrint', 'lfCopy']) $(id).disabled = !L.text;
  $('lfWrite').querySelector('span').textContent = L.text ? t2('Napisz od nowa', 'Write again') : t2('Napisz list', 'Write letter');
  renderCount();
}
/** Read back the edited letter (names → placeholders) so nothing personal is stored. */
function captureLetter() {
  if (!ui.letter.text) return;
  const ctx = letterCtx();
  const body = pseudonymiseLetter($('lpBody').innerText.replace(/\u00a0/g, ' '), ctx, ui.letter.lang).replace(/\s+$/, '');
  ui.letter.text = body.includes(PH.signature) ? body : `${body}\n${PH.signature}`;
  ui.letter.subject = $('lpSubject').innerText.trim();
  save();
}
function letterFacts(lg) {
  const text = cardText(lg);
  return api.scrub(text);
}
async function writeLetter({ revise = false } = {}) {
  const L = ui.letter;
  captureLetter();
  const report = api.isBlank() ? '' : api.reportText();
  const facts = letterFacts(L.lang);
  if (!facts.trim() && !report.trim()) { api.toast(t2('Brak danych — uzupełnij kartę zabiegu albo opis.', 'No data — fill in the procedure card or the report.'), 'warn'); return; }
  if (!api.state().ai) { builtin(); api.toast(t2('Brak AI — użyto wzoru bez AI.', 'No AI — the built-in letter was used.'), 'warn'); return; }
  const instruction = $('lfInstruction').value.trim();
  if (revise && !instruction) { api.toast(t2('Napisz, co poprawić.', 'Say what to change.'), 'warn'); $('lfInstruction').focus(); return; }
  const ctx = letterCtx();
  const body = {
    facts, report: api.scrub(pseudonymiseLetter(report, ctx, L.lang)), clinical: api.scrub(api.clinical()), lang: L.lang, sex: ctx.sex,
    length: L.length, recipient: L.recipient, warningSigns: L.warn !== false, styleRules: api.styleRules(), mode: api.state().aiMode,
    ...(revise ? { previous: L.text, instruction: api.scrub(instruction) } : {}),
  };
  $('lfProcessing').hidden = false;
  $('lfWrite').disabled = true;
  $('lfRevise').disabled = true;
  try {
    const res = await fetch('/api/letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
    ui.letter = { ...L, text: data.letter, subject: data.subject || '', warnings: data.warnings || [], source: 'ai' };
    if (revise) $('lfInstruction').value = '';
    save();
    renderLetter();
    api.toast(revise ? t2('List poprawiony', 'Letter revised') : t2('List gotowy — sprawdź go przed wysłaniem', 'Letter ready — check it before sending'), 'ok', 3200);
  } catch (err) {
    api.toast(`${t2('Nie udało się napisać listu', 'Could not write the letter')}: ${err.message}`, 'err', 5000);
  } finally {
    $('lfProcessing').hidden = true;
    $('lfWrite').disabled = false;
    renderLetter();
  }
}
function builtin() {
  const L = ui.letter;
  const procs = cardProcedures(ui.card).map((p) => procLabel(p, L.lang));
  ui.letter = { ...L, text: builtinLetter(ui.card, { lang: L.lang, partOf, labelOf: (l) => labelOf(l, L.lang) }), subject: procs.length ? `${L.lang === 'en' ? 'Procedure summary' : 'Informacja o wykonanym zabiegu'}: ${procs.join(', ')}` : '', warnings: cardGaps(ui.card, L.lang).map((g) => `${L.lang === 'en' ? 'Missing' : 'Brak'}: ${g}`), source: 'builtin' };
  save();
  renderLetter();
}
function letterPlain() {
  captureLetter();
  const ctx = letterCtx();
  const L = ui.letter;
  return [L.subject ? `${L.lang === 'en' ? 'Subject' : 'Dotyczy'}: ${L.subject}` : '', fillLetter(L.text, ctx, L.lang)].filter(Boolean).join('\n\n');
}
function printLetter() {
  captureLetter();
  const ctx = letterCtx();
  const L = ui.letter;
  const body = esc(fillLetter(bodyWithoutSignature(L.text), ctx, L.lang)).replace(/\n/g, '<br>');
  const figs = L.figures !== false ? figuresHtml(letterFigures(L.lang)) : '';
  const html = `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><title>${esc(L.subject || 'List')}</title>
    <style>@page{size:A4;margin:16mm 18mm 18mm}body{font:11pt/1.5 Georgia,'Times New Roman',serif;color:#111;margin:0}
    .lp-head{display:grid;grid-template-columns:1fr auto;gap:4px 20px;border-bottom:1px solid #999;padding-bottom:8px;margin-bottom:14px;font:9.5pt/1.4 Arial,sans-serif}
    .lp-from{display:flex;gap:12px;align-items:center}.lp-logo{max-height:20mm;max-width:60mm;object-fit:contain}.lp-from span{color:#555}
    .lp-date{text-align:right}.lp-to{grid-column:1/-1;justify-self:end;min-width:45%;margin-top:8px;font:10pt/1.4 Arial,sans-serif}.lp-pwz{color:#555}
    .s{font-weight:bold;margin:0 0 12px}
    .lp-figs{float:right;width:58mm;margin:0 0 3mm 6mm}.lp-fig{margin:0 0 3mm;break-inside:avoid;page-break-inside:avoid}
    .lp-fig img{display:block;width:100%;border:1px solid #ddd;border-radius:3px}.lp-fig figcaption{font:7.2pt/1.3 Arial,sans-serif;color:#333;margin-top:2px}
    .lp-fig-note{font:italic 6.5pt/1.2 Arial,sans-serif;color:#777}
    .lp-sign{margin-top:8mm;break-inside:avoid;page-break-inside:avoid}.lp-sign-img{display:block;max-height:22mm;max-width:65mm;object-fit:contain;margin-bottom:1mm}
    .lp-sign-txt{font:10pt/1.4 Arial,sans-serif}</style></head><body>
    <div class="lp-head">${letterHeadHtml(ctx, { print: true })}</div>
    ${L.subject ? `<p class="s">${esc(L.lang === 'en' ? 'Subject' : 'Dotyczy')}: ${esc(L.subject)}</p>` : ''}
    ${figs ? `<div class="lp-figs">${figs}</div>` : ''}<div>${body}</div>
    <div class="lp-sign">${signHtml(ctx)}</div></body></html>`;
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.append(frame);
  frame.contentDocument.open();
  frame.contentDocument.write(html);
  frame.contentDocument.close();
  window.radvoxLastPrint = html; // for automated tests
  setTimeout(() => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 2000); }, 300);
}
function rememberReferrer() {
  const name = $('lfReferrer').value.trim();
  if (!name) return;
  const list = store.get(REFERRERS_KEY, []).filter((r) => r.name !== name);
  list.push({ name, unit: $('lfUnit').value.trim(), title: segValue('lfTitle', 'title'), addr: $('lfRefAddr').value.trim(), city: $('lfRefCity').value.trim(), rcontact: $('lfRefContact').value.trim(), pwz: $('lfRefPwz').value.trim() });
  store.set(REFERRERS_KEY, list.slice(-60));
  renderReferrers();
}
function renderReferrers() {
  $('lfReferrers').innerHTML = store.get(REFERRERS_KEY, []).map((r) => `<option value="${esc(r.name)}">${esc(r.unit || '')}</option>`).join('');
}

// ---------------------------------------------------------------- init
// ---------------------------------------------------------------- „Powiedz, co zrobiłeś” (dictation → card)
let sayRec = null;
const sayLang = () => (document.querySelector('#inLang [aria-pressed="true"]')?.dataset.lang === 'en' ? 'en' : 'pl');
function focusLesion(l) {
  if (!l || !viewer?.ctrl?.focus) return;
  const idx = ui.card.lesions.filter((x) => x.diagram === l.diagram).indexOf(l);
  if (idx >= 0) setTimeout(() => viewer?.ctrl?.focus?.(idx), 30);
}
/** Microphone of the card (button, Space key, PowerMic): speech goes into the text box, stopping applies it. */
export const cardMicActive = () => Boolean(sayRec?.active);
export function toggleCardMic() {
  if (!speechSupported) { api.toast(t2('Ta przeglądarka nie rozpoznaje mowy — wpisz tekst (Chrome i Edge rozpoznają mowę).', 'This browser has no speech recognition — type the text (Chrome and Edge have it).'), 'warn', 4000); $('sayText').focus(); return; }
  if (sayRec?.active) {
    const before = sayRec.before;
    sayRec.stop().then(() => { $('sayInterim').textContent = ''; if ($('sayText').value.trim() && $('sayText').value.trim() !== before.trim()) sayApply(); });
    return;
  }
  sayRec = new Dictation({
    lang: sayLang() === 'en' ? 'en-GB' : 'pl-PL',
    onFinal: (t) => { const ta = $('sayText'); ta.value = `${ta.value.trim()} ${t}`.trim(); },
    onInterim: (t) => { $('sayInterim').textContent = t; },
    onStateChange: (on) => { api.recLight?.(on); $('sayMic').classList.toggle('rec', on); $('sayMic').setAttribute('aria-pressed', String(on)); $('cardSay').classList.toggle('rec', on); },
    onError: (m) => api.toast(m, 'err', 4500),
  });
  sayRec.before = $('sayText').value;
  try { sayRec.start(); } catch { api.toast(t2('Nie udało się włączyć mikrofonu.', 'Could not start the microphone.'), 'err'); }
}
async function sayApply() {
  const text = $('sayText').value.trim();
  if (!text) { api.toast(t2('Powiedz lub wpisz, co zostało zrobione.', 'Say or type what was done.'), 'warn'); $('sayText').focus(); return; }
  const lg = sayLang();
  const btn = $('sayApply');
  btn.disabled = true; btn.classList.add('busy');
  let parsed = null; let via = 'local';
  try {
    if (api.state().ai) {
      try {
        const res = await fetch('/api/card-parse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: api.scrub(text), lang: lg, mode: api.state().aiMode }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `${res.status}`);
        parsed = data; via = 'ai';
      } catch (err) {
        api.toast(`${t2('AI niedostępne — rozpoznano bez AI', 'AI unavailable — understood without AI')} (${err.message})`, 'warn', 4000);
      }
    }
    if (!parsed) parsed = localParse(text, { categories });
    ui.undo = JSON.stringify({ card: ui.card, active: ui.active });
    const r = applyParsed(ui.card, parsed, { diagrams, categories, lang: lang() });
    // keep the words for the report / letter AI — only when something was understood
    if (r.summary.length) ui.card.dictation = [...(ui.card.dictation || []), text].slice(-12);
    if (r.activeId) { ui.active = r.activeId; ui.leOpen = {}; }
    save();
    renderCard();
    focusLesion(ui.card.lesions.find((l) => l.id === ui.active));
    $('sayText').value = '';
    const nothing = !r.summary.length;
    $('sayResult').hidden = false;
    $('sayResult').classList.toggle('empty', nothing);
    $('sayResult').innerHTML = `<span class="sr-tag">${via === 'ai' ? 'AI' : t2('bez AI', 'no AI')}</span>
      <span class="sr-text">${nothing ? t2('Nie rozpoznałem naczynia ani zabiegu — kliknij naczynie na schemacie albo powiedz to inaczej (np. „tętniak AComA”, „zwężenie lewej SFA 80%”).', 'I did not recognise a vessel or procedure — click the vessel on the diagram or say it differently (e.g. "AComA aneurysm", "left SFA stenosis 80%").') : `${t2('Wpisano', 'Added')}: ${r.summary.map(esc).join(' · ')}`}</span>
      <span class="sr-acts"><button type="button" class="link-btn" id="sayUndo">${t2('Cofnij', 'Undo')}</button><button type="button" class="x-btn" id="sayClose" title="${t2('Zamknij', 'Close')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></span>
      ${r.warnings.length ? `<span class="sr-warn">⚠ ${r.warnings.map(esc).join(' · ')}</span>` : ''}`;
  } finally {
    btn.disabled = false; btn.classList.remove('busy');
  }
}
function undoSay() {
  if (!ui.undo) return;
  const u = JSON.parse(ui.undo);
  ui.card = u.card; ui.active = u.active; ui.undo = null;
  save(); renderCard();
  $('sayResult').hidden = true;
  api.toast(t2('Cofnięto', 'Undone'), 'ok', 1500);
}

export async function initCard(appApi) {
  api = appApi;
  const saved = store.get(CARD_KEY, null);
  if (saved?.card) ui.card = { ...emptyCard(), ...saved.card, clinical: saved.card.clinical || {}, variants: Array.isArray(saved.card.variants) ? saved.card.variants : [], access: { ...emptyCard().access, ...(saved.card.access || {}) }, complications: { ...emptyCard().complications, ...(saved.card.complications || {}) } };
  if (saved?.letter) ui.letter = { ...ui.letter, ...saved.letter };
  ui.active = ui.card.lesions.at(-1)?.id || null;
  const p = patient();
  $('lfPatient').value = p.name || '';
  $('lfDob').value = p.dob || '';
  $('lfReferrer').value = p.referrer || '';
  $('lfUnit').value = p.unit || '';
  $('lfRefAddr').value = p.addr || ''; $('lfRefCity').value = p.city || ''; $('lfRefContact').value = p.rcontact || ''; $('lfRefPwz').value = p.pwz || '';
  $('lfDate').value = p.date || today();
  setSeg('lfSex', 'sex', p.sex || '');
  setSeg('lfTitle', 'title', p.title || 'team');
  const sender = store.get(SENDER_KEY, {});
  $('lfSenderName').value = sender.name || '';
  $('lfSenderUnit').value = sender.unit || '';
  $('lfSenderContact').value = sender.contact || '';
  renderReferrers();

  const [list, devs] = await Promise.all([loadDiagrams(), import('./devices.js').catch(() => null)]);
  diagrams = list;
  categories = devs?.DEVICE_CATEGORIES || [];

  $('viewTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-view]'); if (b) { captureLetter(); setView(b.dataset.view); } });
  const cv = $('viewCard');
  cv.addEventListener('input', onCardInput);
  cv.addEventListener('change', onCardChange);
  cv.addEventListener('click', onCardClick);
  cv.addEventListener('toggle', (e) => {
    const d = e.target.closest?.('.card-sec');
    if (d) rememberOpen(d.dataset.sec, d.open);
    const st = e.target.closest?.('.le-step');
    if (st) ui.leOpen = { ...(ui.leOpen || {}), [st.dataset.step]: st.open };
  }, true);
  // „Powiedz, co zrobiłeś”
  $('sayApply').addEventListener('click', () => sayApply());
  $('sayMic').addEventListener('click', () => toggleCardMic());
  $('sayText').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sayApply(); } });
  $('sayResult').addEventListener('click', (e) => { if (e.target.closest('#sayUndo')) undoSay(); if (e.target.closest('#sayClose')) $('sayResult').hidden = true; });
  $('cardToReport').addEventListener('click', cardToReport);
  $('cardToLetter').addEventListener('click', () => setView('letter'));
  $('cardClear').addEventListener('click', async () => {
    if (ui.card.lesions.length && !(await api.askConfirm(t2('Wyczyścić kartę zabiegu?', 'Clear the procedure card?'), { ok: t2('Wyczyść', 'Clear'), danger: true }))) return;
    const branch = ui.card.branch;
    ui.card = { ...emptyCard(), branch };
    ui.active = null;
    save(); renderCard();
  });
  // device picker
  $('devPicker').addEventListener('click', devClick);
  $('devSearch').addEventListener('input', () => { ui.dev.item = null; renderDevPicker(); });
  $('devAdd').addEventListener('click', addDevice);
  $('closeDev').addEventListener('click', closeDevPicker);
  $('devPicker').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeDevPicker(); }
    if (e.key === 'Enter' && (e.target.id === 'devSize' || e.target.id === 'devQty')) { e.preventDefault(); addDevice(); }
  });
  // letter
  const lf = $('viewLetter');
  lf.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.lang && b.closest('#lfLang')) { captureLetter(); ui.letter.lang = b.dataset.lang; save(); renderLetter(); }
    else if (b.dataset.len) { ui.letter.length = b.dataset.len; save(); renderLetter(); }
    else if (b.dataset.rec) { ui.letter.recipient = b.dataset.rec; save(); renderLetter(); }
    else if (b.dataset.sex !== undefined && b.closest('#lfSex')) { setSeg('lfSex', 'sex', b.dataset.sex); savePatient(); }
    else if (b.dataset.title) { captureLetter(); setSeg('lfTitle', 'title', b.dataset.title); savePatient(); renderLetter(); }
  });
  for (const id of ['lfPatient', 'lfDob', 'lfDate', 'lfReferrer', 'lfUnit', 'lfRefAddr', 'lfRefCity', 'lfRefContact', 'lfRefPwz']) {
    $(id).addEventListener('focus', captureLetter);
    $(id).addEventListener('change', () => {
      if (/^lfRef(Addr|City|Contact|Pwz)$|^lfUnit$/.test(id)) rememberReferrer();
      if (id === 'lfReferrer') {
        const r = store.get(REFERRERS_KEY, []).find((x) => x.name === $('lfReferrer').value.trim());
        if (r) {
          if (!$('lfUnit').value.trim()) $('lfUnit').value = r.unit || '';
          for (const [id, k] of [['lfRefAddr', 'addr'], ['lfRefCity', 'city'], ['lfRefContact', 'rcontact'], ['lfRefPwz', 'pwz']]) if (!$(id).value.trim()) $(id).value = r[k] || '';
          setSeg('lfTitle', 'title', r.title || 'team');
        }
        rememberReferrer();
      }
      savePatient();
      renderLetter();
    });
  }
  for (const id of ['lfSenderName', 'lfSenderUnit', 'lfSenderContact']) {
    $(id).addEventListener('focus', captureLetter);
    $(id).addEventListener('change', () => { store.set(SENDER_KEY, { name: $('lfSenderName').value.trim(), unit: $('lfSenderUnit').value.trim(), contact: $('lfSenderContact').value.trim() }); renderLetter(); });
  }
  // logo and signature (images, this computer only)
  const imgToDataUrl = (src, maxW, maxH) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, maxW / (img.naturalWidth || maxW), maxH / (img.naturalHeight || maxH));
      const cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round((img.naturalWidth || maxW) * k)); cv.height = Math.max(1, Math.round((img.naturalHeight || maxH) * k));
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      resolve(cv.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
  const renderAssets = () => {
    const a = assets();
    $('lfLogoPrev').innerHTML = a.logo ? `<img src="${a.logo}" alt="logo" />` : `<span>${t2('brak', 'none')}</span>`;
    $('lfSignPrev').innerHTML = a.sign ? `<img src="${a.sign}" alt="${t2('podpis', 'signature')}" />` : `<span>${t2('brak', 'none')}</span>`;
    $('lfLogoDel').hidden = !a.logo; $('lfSignDel').hidden = !a.sign;
  };
  const setAsset = (k, v) => {
    const a = assets();
    if (v) a[k] = v; else delete a[k];
    try { localStorage.setItem(ASSETS_KEY, JSON.stringify(a)); } catch { api.toast(t2('Obraz jest za duży, aby go zapisać.', 'The image is too large to save.'), 'err'); return; }
    renderAssets(); renderLetter();
  };
  const readFile = (input, k, maxW, maxH) => {
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { api.toast(t2('Plik jest za duży (maks. 8 MB).', 'File too large (max 8 MB).'), 'err'); return; }
    const r = new FileReader();
    r.onload = async () => {
      try { setAsset(k, await imgToDataUrl(r.result, maxW, maxH)); api.toast(k === 'logo' ? t2('Logo zapisane', 'Logo saved') : t2('Podpis zapisany', 'Signature saved'), 'ok', 1600); } catch { api.toast(t2('Nie udało się odczytać obrazu.', 'Could not read the image.'), 'err'); }
    };
    r.readAsDataURL(f);
  };
  $('lfLogoPick').addEventListener('click', () => $('lfLogoFile').click());
  $('lfSignPick').addEventListener('click', () => $('lfSignFile').click());
  $('lfLogoFile').addEventListener('change', () => readFile($('lfLogoFile'), 'logo', 720, 240));
  $('lfSignFile').addEventListener('change', () => readFile($('lfSignFile'), 'sign', 720, 240));
  $('lfLogoDel').addEventListener('click', () => setAsset('logo', null));
  $('lfSignDel').addEventListener('click', () => setAsset('sign', null));
  // signature pad: mouse, finger or stylus
  const pad = $('lfSignCanvas');
  const pctx = pad.getContext('2d');
  let drawing = false; let inked = false;
  const padPoint = (e) => { const r = pad.getBoundingClientRect(); return [(e.clientX - r.left) * (pad.width / r.width), (e.clientY - r.top) * (pad.height / r.height)]; };
  const clearPad = () => { pctx.clearRect(0, 0, pad.width, pad.height); inked = false; };
  pad.style.touchAction = 'none';
  pad.addEventListener('pointerdown', (e) => { drawing = true; pad.setPointerCapture(e.pointerId); const [x, y] = padPoint(e); pctx.beginPath(); pctx.moveTo(x, y); });
  pad.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const [x, y] = padPoint(e);
    pctx.lineTo(x, y);
    pctx.strokeStyle = '#1a2a6c'; pctx.lineCap = 'round'; pctx.lineJoin = 'round';
    pctx.lineWidth = e.pointerType === 'pen' && e.pressure > 0 ? 1.4 + e.pressure * 2.6 : 2.6;
    pctx.stroke();
    inked = true;
  });
  const endStroke = () => { drawing = false; };
  pad.addEventListener('pointerup', endStroke);
  pad.addEventListener('pointercancel', endStroke);
  $('lfSignDraw').addEventListener('click', () => { clearPad(); $('lfSignPad').hidden = false; });
  $('lfSignClear').addEventListener('click', clearPad);
  $('lfSignCancel').addEventListener('click', () => { $('lfSignPad').hidden = true; });
  $('lfSignSave').addEventListener('click', () => {
    if (!inked) { api.toast(t2('Podpisz się w polu powyżej.', 'Sign in the box above.'), 'warn'); return; }
    // crop to the ink
    const { data } = pctx.getImageData(0, 0, pad.width, pad.height);
    let x0 = pad.width; let y0 = pad.height; let x1 = 0; let y1 = 0;
    for (let y = 0; y < pad.height; y++) for (let x = 0; x < pad.width; x++) if (data[(y * pad.width + x) * 4 + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(pad.width - 1, x1 + m); y1 = Math.min(pad.height - 1, y1 + m);
    const out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
    out.getContext('2d').drawImage(pad, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
    setAsset('sign', out.toDataURL('image/png'));
    $('lfSignPad').hidden = true;
    api.toast(t2('Podpis zapisany', 'Signature saved'), 'ok', 1600);
  });
  renderAssets();
  $('lfWarn').addEventListener('change', () => { ui.letter.warn = $('lfWarn').checked; save(); });
  $('lfFigures').addEventListener('change', () => { ui.letter.figures = $('lfFigures').checked; save(); renderLetterFigures(); });
  $('lfWrite').addEventListener('click', () => writeLetter());
  $('lfRevise').addEventListener('click', () => writeLetter({ revise: true }));
  $('lfInstruction').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); writeLetter({ revise: true }); } });
  $('lfBuiltin').addEventListener('click', builtin);
  $('lfCopy').addEventListener('click', async () => {
    try {
      const plain = letterPlain();
      const figs = ui.letter.figures !== false ? letterFigures(ui.letter.lang) : [];
      if (figs.length && window.ClipboardItem && navigator.clipboard.write) {
        const plainAll = `${plain}\n\n${figs.map((f) => f.caption).join('\n')}`;
        const a = assets();
        const html = `${a.logo ? `<p><img src="${a.logo}" height="60" alt="logo" /></p>` : ''}${figs.map((f) => `<table align="right" style="margin:0 0 8px 12px;width:230px"><tr><td><img src="${f.src}" width="230" /><br><small style="font-family:Arial,sans-serif;font-size:8pt">${esc(f.caption)}</small></td></tr></table>`).join('')}<div style="font-family:Georgia,serif">${esc(plain).replace(/\n/g, '<br>')}</div>${a.sign ? `<p><img src="${a.sign}" height="70" alt="podpis" /></p>` : ''}`;
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([plainAll], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })]);
      } else await navigator.clipboard.writeText(plain);
      api.toast(t2('List skopiowany', 'Letter copied'), 'ok', 1800); } catch { api.toast(t2('Nie udało się skopiować', 'Copy failed'), 'err'); }
  });
  $('lfPrint').addEventListener('click', printLetter);
  $('lpBody').addEventListener('blur', captureLetter);
  $('lpSubject').addEventListener('blur', captureLetter);

  setView(saved?.view || 'report');
  renderCard();
  renderLetter();
}

/** For the today-list archive: the card and letter (no patient data). */
export const cardSnapshot = () => JSON.parse(JSON.stringify({ card: ui.card, letter: ui.letter }));
/** Called when the report language changes. */
export function onLanguageChanged() { if (ui.view === 'card') renderCard(); }
export const cardIsEmpty = () => !ui.card.lesions.length && !ui.card.indication.trim();
export { greeting };

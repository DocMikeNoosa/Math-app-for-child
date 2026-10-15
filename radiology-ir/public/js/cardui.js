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
  builtinLetter, fillLetter, pseudonymiseLetter, greeting, figureCaption, figureCallout,
} from './card.js';
import { renderFigure } from './figure.js';

const CARD_KEY = 'radvox.card.v1';
const PATIENT_KEY = 'radvox.patient.v1'; // sessionStorage only — never kept after the browser closes
const REFERRERS_KEY = 'radvox.referrers.v1';
const SENDER_KEY = 'radvox.sender.v1';
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
  store.set(PATIENT_KEY, { name: $('lfPatient').value.trim(), dob: $('lfDob').value.trim(), sex: segValue('lfSex', 'sex'), date: $('lfDate').value, referrer: $('lfReferrer').value.trim(), unit: $('lfUnit').value.trim(), title: segValue('lfTitle', 'title') }, sessionStorage);
}

/** Start a new card (new patient). */
export function resetCard() {
  ui.card = emptyCard();
  ui.active = null;
  ui.letter = { ...ui.letter, text: '', subject: '', warnings: [], source: '' };
  try { sessionStorage.removeItem(PATIENT_KEY); } catch { /* ignore */ }
  for (const id of ['lfPatient', 'lfDob', 'lfReferrer', 'lfUnit']) $(id).value = '';
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
    host.innerHTML = `<div class="dgm-start">${BRANCHES.map(([id, pl, en]) => `<button type="button" class="dgm-start-btn" data-branch="${id}"><b>${esc(lang() === 'en' ? en : pl)}</b><small>${esc(id === 'Vascular' ? t2('aorta, tętnice trzewne, kończyny, żyły, wieńcowe', 'aorta, visceral, limbs, veins, coronary') : id === 'Neuro' ? t2('koło Willisa, tętnice szyjne i kręgowe, zatoki, rdzeń', 'circle of Willis, carotid and vertebral arteries, sinuses, spine') : t2('drogi żółciowe, nerki, narządy, klatka, kręgosłup, szyja', 'biliary, kidneys, organs, chest, spine, neck'))}</small></button>`).join('')}</div>`;
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

function sectionOpen(id) { return store.get('radvox.cardOpen.v1', { indication: true, access: true })[id] ?? false; }
function rememberOpen(id, open) { const o = store.get('radvox.cardOpen.v1', { indication: true, access: true }); o[id] = open; store.set('radvox.cardOpen.v1', o); }

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
  const devList = (devs, owner) => `<ul class="dev-list">${devs.map((d, i) => `<li><span>${esc(deviceText(d, lg))}</span><button type="button" class="x-btn" data-del-dev="${owner}:${i}" title="${t2('Usuń', 'Remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('')}</ul>`;
  const generalDevs = c.devices.filter((d) => d.cat !== 'drugs');
  const drugs = c.devices.filter((d) => d.cat === 'drugs');
  const dev = c.devices;

  $('cardSide').innerHTML = `
    <div class="les-head"><span>${t2('Zmiany', 'Lesions')}</span></div>
    <ul class="les-list">${list}</ul>
    ${les ? lesionEditor(les) : ''}
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
      ${drugs.length ? `<div class="sec-sub">${t2('Leki', 'Drugs')}</div><ul class="dev-list">${drugs.map((d) => `<li><span>${esc(deviceText(d, lg))}</span><button type="button" class="x-btn" data-del-dev="general:${dev.indexOf(d)}" title="${t2('Usuń', 'Remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('')}</ul>` : ''}
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
function lesionEditor(l) {
  const lg = lang();
  const kind = l.kind === 'organ' ? 'organ' : 'vessel';
  const def = findingDef(kind, l.finding) || FINDINGS[kind][0];
  const d = diagramOf(l.diagram);
  const vascular = ui.card.branch !== 'Neuro';
  const fields = def.fields.filter((f) => vascular || !f.vascularOnly);
  const pre = fields.filter((f) => f.group === 'pre').map((f) => fieldInput(f, l[f.key], 'lfield', `lf_${f.key}`)).join('');
  const post = fields.filter((f) => f.group === 'post').map((f) => fieldInput(f, l[f.key], 'lfield', `lf_${f.key}`)).join('');
  const computed = lesionFacts(l, lg, { vascular }).computed;
  const anat = anatOf(l);
  const procs = proceduresFor(anat, api.templates()).filter((p) => branchFits(p));
  const procChips = procs.map((p) => `<button type="button" class="anat-chip" data-proc="${p}" aria-pressed="${l.procs.includes(p)}">${esc(procLabel(p, lg))}</button>`).join('');
  const position = d?.kind === 'model3d' ? `<div class="cf-row"><label for="leT">${t2('Miejsce na naczyniu', 'Position on vessel')}</label><input id="leT" type="range" min="0" max="100" value="${Math.round((l.t ?? 0.5) * 100)}" /><span class="le-pos">${(l.t ?? 0.5) < 0.34 ? t2('proksymalnie', 'proximal') : (l.t ?? 0.5) > 0.66 ? t2('dystalnie', 'distal') : t2('środek', 'mid')}</span></div>` : '';
  const sideRow = d?.kind === 'list' ? `<div class="cf-row"><label>${t2('Strona', 'Side')}</label><div class="seg" id="leSide">${[['', '—', '—'], ['right', 'prawa', 'right'], ['left', 'lewa', 'left'], ['both', 'obustronnie', 'bilateral']].map(([v, pl, en]) => `<button type="button" data-lside="${v}" aria-pressed="${(l.side || '') === v}">${esc(lg === 'en' ? en : pl)}</button>`).join('')}</div></div>` : '';
  return `<div class="les-editor">
    <div class="le-title">${esc(labelOf(l))}</div>
    <div class="cf-row"><label for="leFinding">${t2('Zmiana', 'Finding')}</label><select id="leFinding">${FINDINGS[kind].map((f) => `<option value="${f.id}"${f.id === l.finding ? ' selected' : ''}>${esc(lbl(f.label))}</option>`).join('')}</select></div>
    ${position}${sideRow}
    ${pre ? `<div class="le-sub">${t2('Przed leczeniem', 'Before treatment')}</div><div class="cf-grid2">${pre}</div>` : ''}
    <div class="le-calc" id="leCalc"${computed.length ? '' : ' hidden'}>${computed.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
    <div class="le-sub">${t2('Wykonano', 'Performed')}</div>
    <div class="chips">${procChips || `<span class="sec-note">${t2('Brak zabiegów dla tej okolicy.', 'No procedures for this region.')}</span>`}</div>
    <div class="le-sub">${t2('Sprzęt użyty w tej zmianie', 'Devices used for this lesion')}</div>
    <ul class="dev-list">${l.devices.map((dv, i) => `<li><span>${esc(deviceText(dv, lg))}</span><button type="button" class="x-btn" data-del-dev="${l.id}:${i}" title="${t2('Usuń', 'Remove')}"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('')}</ul>
    <button type="button" class="btn btn-small" data-add-dev="${l.id}">+ ${t2('Stent, flow diverter, spirala, balon, cewnik…', 'Stent, flow diverter, coil, balloon, catheter…')}</button>
    ${post ? `<div class="le-sub">${t2('Wynik', 'Result')}</div><div class="cf-grid2">${post}</div>` : ''}
    <input id="leNotes" type="text" value="${esc(l.notes)}" placeholder="${t2('Uwagi do tej zmiany (opcjonalnie)', 'Notes on this lesion (optional)')}" />
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
      if (el.dataset.lfield && les) {
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
    renderCard(); return;
  }
  if (b.dataset.delLes) {
    c.lesions = c.lesions.filter((l) => l.id !== b.dataset.delLes);
    if (ui.active === b.dataset.delLes) ui.active = c.lesions.at(-1)?.id || null;
    renderCard(); save(); return;
  }
  if (b.dataset.proc && les) {
    les.procs = les.procs.includes(b.dataset.proc) ? les.procs.filter((p) => p !== b.dataset.proc) : [...les.procs, b.dataset.proc];
    b.setAttribute('aria-pressed', String(les.procs.includes(b.dataset.proc)));
    save(); renderGaps(); return;
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
    renderSide(); save(); return;
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
  renderSide();
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
    unit: p.unit || '',
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
    if (src === undefined) { src = renderFigure(d, lesions, index, { lang: lg, callout: figureCallout(l, lg) }); figCache.set(key, src); }
    if (!src) return null;
    return { src, caption: figureCaption(l, partOf(l.diagram, l.part), lg, { label: labelOf(l, lg), n: i + 1, vascular: ui.card.branch !== 'Neuro' }) };
  }).filter(Boolean);
}
const figuresHtml = (figs) => figs.map((f) => `<figure class="lp-fig"><img src="${f.src}" alt="${esc(f.caption)}" /><figcaption>${esc(f.caption)}</figcaption></figure>`).join('');
function renderLetterFigures() {
  const L = ui.letter;
  const on = Boolean(L.text) && L.figures !== false;
  $('lpFigures').hidden = !on;
  if (!on) { $('lpFigures').innerHTML = ''; return; }
  $('lpFigures').innerHTML = figuresHtml(letterFigures(L.lang));
}

function renderLetter() {
  if (!api) return;
  const L = ui.letter;
  setSeg('lfLang', 'lang', L.lang);
  setSeg('lfLength', 'len', L.length);
  setSeg('lfRecipient', 'rec', L.recipient);
  $('lfWarn').checked = L.warn !== false;
  $('lfFigures').checked = L.figures !== false;
  const ctx = letterCtx();
  const sender = store.get(SENDER_KEY, {});
  $('lpHead').innerHTML = `<div class="lp-from">${esc(sender.unit || t2('Pracownia Radiologii Zabiegowej', 'Interventional Radiology'))}${sender.contact ? `<br><span>${esc(sender.contact)}</span>` : ''}</div>
    <div class="lp-date">${esc(ctx.date ? `${t2('Data', 'Date')}: ${ctx.date}` : '')}</div>
    <div class="lp-to">${ctx.referrer || ctx.unit ? `${esc(t2('Do', 'To'))}: <b>${esc(ctx.referrer)}</b>${ctx.unit ? `<br>${esc(ctx.unit)}` : ''}` : ''}</div>`;
  const filled = fillLetter(L.text, ctx, L.lang);
  $('lpSubject').textContent = L.subject || '';
  $('lpSubject').hidden = !L.subject;
  $('lpBody').innerText = filled;
  $('lpEmpty').hidden = Boolean(L.text);
  $('lpBody').hidden = !L.text;
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
  ui.letter.text = pseudonymiseLetter($('lpBody').innerText.replace(/ /g, ' '), ctx, ui.letter.lang);
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
  const sender = store.get(SENDER_KEY, {});
  const body = esc(fillLetter(L.text, ctx, L.lang)).replace(/\n/g, '<br>');
  const figs = L.figures !== false ? figuresHtml(letterFigures(L.lang)) : '';
  const html = `<!doctype html><html lang="${L.lang}"><head><meta charset="utf-8"><title>${esc(L.subject || 'List')}</title>
    <style>@page{size:A4;margin:22mm 20mm}body{font:11.5pt/1.55 Georgia,'Times New Roman',serif;color:#111}
    .h{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #999;padding-bottom:10px;margin-bottom:22px;font:10pt/1.4 Arial,sans-serif}
    .to{margin:0 0 18px auto;width:55%;font:10.5pt/1.4 Arial,sans-serif}.s{font-weight:bold;margin:0 0 16px}
    .lp-fig{margin:18px 0 0;break-inside:avoid;page-break-inside:avoid}.lp-fig img{display:block;width:100%;max-width:150mm;border:1px solid #ddd;border-radius:4px}
    .lp-fig figcaption{font:8.5pt/1.35 Arial,sans-serif;color:#333;margin-top:4px;max-width:150mm}</style></head><body>
    <div class="h"><div>${esc(sender.unit || '')}${sender.contact ? `<br>${esc(sender.contact)}` : ''}</div><div>${esc(ctx.date)}</div></div>
    ${ctx.referrer || ctx.unit ? `<div class="to">${esc(ctx.referrer)}${ctx.unit ? `<br>${esc(ctx.unit)}` : ''}</div>` : ''}
    ${L.subject ? `<p class="s">${esc(L.lang === 'en' ? 'Subject' : 'Dotyczy')}: ${esc(L.subject)}</p>` : ''}<div>${body}</div>${figs}</body></html>`;
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.append(frame);
  frame.contentDocument.open();
  frame.contentDocument.write(html);
  frame.contentDocument.close();
  setTimeout(() => { frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 2000); }, 150);
}
function rememberReferrer() {
  const name = $('lfReferrer').value.trim();
  if (!name) return;
  const list = store.get(REFERRERS_KEY, []).filter((r) => r.name !== name);
  list.push({ name, unit: $('lfUnit').value.trim(), title: segValue('lfTitle', 'title') });
  store.set(REFERRERS_KEY, list.slice(-60));
  renderReferrers();
}
function renderReferrers() {
  $('lfReferrers').innerHTML = store.get(REFERRERS_KEY, []).map((r) => `<option value="${esc(r.name)}">${esc(r.unit || '')}</option>`).join('');
}

// ---------------------------------------------------------------- init
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
  cv.addEventListener('toggle', (e) => { const d = e.target.closest?.('.card-sec'); if (d) rememberOpen(d.dataset.sec, d.open); }, true);
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
  for (const id of ['lfPatient', 'lfDob', 'lfDate', 'lfReferrer', 'lfUnit']) {
    $(id).addEventListener('focus', captureLetter);
    $(id).addEventListener('change', () => {
      if (id === 'lfReferrer') {
        const r = store.get(REFERRERS_KEY, []).find((x) => x.name === $('lfReferrer').value.trim());
        if (r) { if (!$('lfUnit').value.trim()) $('lfUnit').value = r.unit || ''; setSeg('lfTitle', 'title', r.title || 'team'); }
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
        const html = `<div style="font-family:Georgia,serif">${esc(plain).replace(/\n/g, '<br>')}</div>${figs.map((f) => `<p><img src="${f.src}" width="560" /><br><small style="font-family:Arial,sans-serif">${esc(f.caption)}</small></p>`).join('')}`;
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

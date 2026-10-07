import { TEMPLATES, GROUPS, SNIPPETS, SNIPPET_GROUPS, SECTION_LABELS, getTemplate, regionLabel, templatesByRegion, reportFromTemplate, reportToText } from './templates.js';
import { convertSpokenFor, tidy, scrubIdentifiers, wordDiff } from './polish-text.js';
import { localMerge, findConflicts, applyConflicts } from './crosscheck.js';
import { Dictation, LevelMeter, speechSupported } from './speech.js';

const $ = (id) => document.getElementById(id);
const els = Object.fromEntries(
  [
    'tplCurrent', 'tplGroupChip', 'tplRegion', 'tplTitle', 'aiStatus', 'helpBtn', 'settingsBtn',
    'recWrap', 'recBtn', 'recViz', 'recState', 'recTimer', 'dictation', 'interim', 'instruction', 'processBtn', 'autoProcess',
    'clearDictation', 'speechBadge', 'snippetsBtn', 'snippetsPop',
    'undoBtn', 'redoBtn', 'acceptBtn', 'resetBtn', 'copyBtn', 'examHeader', 'bodyText', 'bodyLabel', 'conclusion', 'paper',
    'conflicts', 'conflictsList', 'fixAllBtn', 'corrections', 'correctionsList', 'correctionsTitle', 'warnings', 'warningsList',
    'processing', 'processingText', 'footWords', 'footSource', 'footSaved', 'reportScroll', 'inLang', 'outLang', 'conclusionLabel', 'newReportBtn', 'aiMode', 'aiModeHint',
    'picker', 'pickerSearch', 'pickerTabs', 'pickerRecent', 'pickerBody', 'closePicker',
    'settings', 'closeSettings', 'overlay', 'stylePrefs', 'speechInfo', 'helpModal', 'closeHelp', 'toasts',
  ].map((id) => [id, $(id)]),
);

// ---------------------------------------------------------------- state
const STORE_KEY = 'radvox.v2';
const DEFAULT_TEMPLATE = 'ct_head_normal';
const state = {
  ai: false,
  model: null,
  report: reportFromTemplate(getTemplate(DEFAULT_TEMPLATE)),
  baseline: null, // snapshot that highlights are computed against
  history: [],
  future: [],
  warnings: [],
  corrections: [],
  ignore: [], // template sentences the radiologist chose to keep despite a conflict
  recent: [],
  inputLang: 'pl', // language of the dictation
  outputLang: 'pl', // language the report is written in
  aiMode: 'fast', // fast | accurate | turbo
  copied: null, // report as it was when last copied
  source: 'Szablon',
  busy: false,
  recording: false,
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const template = () => getTemplate(state.report.templateId) || getTemplate(DEFAULT_TEMPLATE);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!saved) return;
    if (saved.report && getTemplate(saved.report.templateId) && ['header', 'body', 'conclusion'].every((k) => typeof saved.report[k] === 'string')) {
      state.report = { ...saved.report, lang: saved.report.lang === 'en' ? 'en' : 'pl' };
    }
    state.inputLang = saved.inputLang === 'en' ? 'en' : 'pl';
    state.outputLang = saved.outputLang === 'en' ? 'en' : 'pl';
    state.aiMode = ['fast', 'accurate', 'turbo'].includes(saved.aiMode) ? saved.aiMode : 'fast';
    els.dictation.value = saved.dictation || '';
    els.stylePrefs.value = saved.style || '';
    els.autoProcess.checked = saved.autoProcess !== false;
    state.recent = (saved.recent || []).filter((id) => getTemplate(id));
    state.ignore = Array.isArray(saved.ignore) ? saved.ignore : [];
  } catch { /* storage unavailable — start fresh */ }
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        report: state.report, dictation: els.dictation.value, style: els.stylePrefs.value,
        autoProcess: els.autoProcess.checked, recent: state.recent, ignore: state.ignore,
        inputLang: state.inputLang, outputLang: state.outputLang, aiMode: state.aiMode,
      }));
      els.footSaved.textContent = 'Zapisano lokalnie';
    } catch {
      els.footSaved.textContent = 'Brak zapisu lokalnego';
    }
  }, 250);
}

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fold = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

function highlighted(oldText, newText) {
  if (oldText == null || oldText === newText) return esc(newText);
  return wordDiff(oldText, newText).map((seg) => (seg.added ? `<mark class="add">${esc(seg.text)}</mark>` : esc(seg.text))).join('');
}
function readEditable(el) {
  return el.innerText.replace(/ /g, ' ').replace(/\n+$/, '');
}
function toast(message, kind = 'info', ms = 2800) {
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.innerHTML = `<span class="t-dot"></span><span>${esc(message)}</span>`;
  els.toasts.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, ms);
}

// ---------------------------------------------------------------- rendering
function renderTemplateButton() {
  const t = template();
  const trauma = t.group === 'Trauma';
  els.tplGroupChip.textContent = trauma ? 'URAZ' : 'BEZ URAZU';
  els.tplGroupChip.classList.toggle('trauma', trauma);
  els.tplRegion.textContent = regionLabel(t.section);
  els.tplTitle.textContent = t.title;
  els.tplCurrent.title = `${t.exam} — zmień szablon (T)`;
}

function renderReport() {
  const r = state.report;
  const base = state.baseline;
  renderTemplateButton();
  els.examHeader.textContent = r.header;
  const L = SECTION_LABELS[r.lang === 'en' ? 'en' : 'pl'];
  els.bodyLabel.textContent = L.body;
  els.conclusionLabel.textContent = L.conclusion;
  for (const el of [els.examHeader, els.bodyText, els.conclusion]) el.lang = r.lang === 'en' ? 'en' : 'pl';
  renderLangToggles();
  els.bodyText.innerHTML = highlighted(base?.body, r.body);
  els.conclusion.innerHTML = highlighted(base?.conclusion, r.conclusion);
  els.conclusion.parentElement.classList.toggle('changed', Boolean(base && base.conclusion !== r.conclusion));
  renderPanels();
  renderMeta();
}

function renderPanels() {
  // corrections (what the cross-check removed / rewrote)
  els.correctionsList.innerHTML = state.corrections
    .map((c) => `<li><del>${esc(c.removed)}</del>${c.replacement ? `<span class="arrow">→</span><ins>${esc(c.replacement)}</ins>` : '<span class="arrow">→</span><ins><em>usunięto</em></ins>'}${c.reason ? `<span class="why">${esc(c.reason)}</span>` : ''}</li>`)
    .join('');
  els.corrections.hidden = state.corrections.length === 0;
  els.correctionsTitle.textContent = `Skorygowano szablon (${state.corrections.length})`;
  // warnings
  els.warningsList.innerHTML = state.warnings.map((w) => `<li>${esc(w)}</li>`).join('');
  els.warnings.hidden = state.warnings.length === 0;
  renderConflicts();
}

let liveConflicts = [];
function renderConflicts() {
  liveConflicts = findConflicts(template(), state.report, { ignore: state.ignore });
  els.conflicts.hidden = liveConflicts.length === 0;
  els.conflictsList.innerHTML = liveConflicts
    .map((c, i) => `<li>
      <span class="c-old">„${esc(c.original)}”</span>
      <span class="c-why">sprzeczne z: „${esc(c.trigger || '')}” · ${c.replacement ? `zmienić na: „${esc(c.replacement)}”` : 'usunąć'}</span>
      <span class="c-actions"><button class="mini-btn strong" data-fix="${i}">Popraw</button><button class="mini-btn" data-keep="${i}" title="Zostaw bez zmian">Pomiń</button></span>
    </li>`)
    .join('');
}

function renderMeta() {
  els.undoBtn.disabled = state.history.length === 0;
  els.redoBtn.disabled = state.future.length === 0;
  els.acceptBtn.disabled = !state.baseline && !state.warnings.length && !state.corrections.length;
  const words = reportToText(state.report, template()).split(/\s+/).filter(Boolean).length;
  els.footWords.textContent = `${words} słów`;
  els.footSource.textContent = state.source;
}

// ---------------------------------------------------------------- report mutations
function commit(next, { baseline = null, warnings = [], corrections = [], source } = {}) {
  state.history.push(clone(state.report));
  if (state.history.length > 100) state.history.shift();
  state.future = [];
  state.report = next;
  state.baseline = baseline;
  state.warnings = warnings;
  state.corrections = corrections;
  if (source) state.source = source;
  renderReport();
  save();
}

function selectTemplate(id) {
  const t = getTemplate(id);
  if (!t) return;
  state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 6);
  if (id === state.report.templateId) { save(); return; }
  const wasEdited = !same(state.report, reportFromTemplate(template()));
  state.ignore = [];
  commit(reportFromTemplate(t), { source: 'Szablon' });
  toast(wasEdited ? `${t.title} — „Cofnij” przywróci poprzedni opis` : t.title, 'info');
  if (state.outputLang === 'en') translateReport('en');
}

function undo() {
  if (!state.history.length) return;
  state.future.push(clone(state.report));
  state.report = state.history.pop();
  state.baseline = null;
  state.warnings = [];
  state.corrections = [];
  renderReport();
  save();
}
function redo() {
  if (!state.future.length) return;
  state.history.push(clone(state.report));
  state.report = state.future.pop();
  state.baseline = null;
  state.warnings = [];
  state.corrections = [];
  renderReport();
  save();
}
function acceptChanges() {
  state.baseline = null;
  state.warnings = [];
  state.corrections = [];
  renderReport();
  toast('Zmiany zaakceptowane', 'ok', 1600);
}
function resetReport() {
  state.ignore = [];
  commit(reportFromTemplate(template()), { source: 'Szablon' });
  toast('Nowy opis z szablonu — „Cofnij” przywróci poprzedni', 'info');
  if (state.outputLang === 'en') translateReport('en');
}

function fixConflicts(list) {
  if (!list.length) return;
  const next = applyConflicts(template(), state.report, list);
  const corrections = [...state.corrections, ...list.map((c) => ({ removed: c.original, replacement: c.replacement, reason: `sprzeczne z: „${c.trigger}”` }))];
  commit(next, { baseline: clone(state.report), warnings: state.warnings, corrections, source: state.source });
}

// Manual edits: DOM → state, one undo step per focus session, live conflict check.
let editSnapshot = null;
let conflictTimer = null;
function onEditFocus() { editSnapshot = clone(state.report); }
function onEditInput(e) {
  const el = e.target;
  if (el === els.examHeader) state.report.header = readEditable(el).replace(/\n/g, ' ');
  else if (el === els.bodyText) state.report.body = readEditable(el);
  else if (el === els.conclusion) state.report.conclusion = readEditable(el);
  renderMeta();
  save();
  clearTimeout(conflictTimer);
  conflictTimer = setTimeout(renderConflicts, 450);
}
function onEditBlur() {
  if (editSnapshot && !same(editSnapshot, state.report)) {
    state.history.push(editSnapshot);
    state.future = [];
    if (!state.source.includes('edycja')) state.source = `${state.source} + edycja`;
    renderMeta();
    renderConflicts();
  }
  editSnapshot = null;
}

// ---------------------------------------------------------------- AI processing
async function process() {
  if (state.busy) return;
  if (state.recording) await stopRecording({ auto: false });
  if (document.activeElement?.isContentEditable) document.activeElement.blur();

  const dictation = scrubIdentifiers(els.dictation.value.trim());
  const instruction = scrubIdentifiers(els.instruction.value.trim());
  if (!dictation && !instruction) {
    toast('Brak tekstu do opracowania — podyktuj lub wpisz opis.', 'warn');
    els.dictation.focus();
    return;
  }

  const t = template();
  const before = clone(state.report);
  const needsAI = state.inputLang === 'en' || state.outputLang === 'en' || before.lang === 'en';
  if (needsAI && !state.ai) {
    toast('Dyktowanie lub opis po angielsku wymaga AI (Claude) — przełącz na PL albo dodaj klucz API.', 'warn', 5000);
    return;
  }
  let result = null;
  let source = '';
  const started = performance.now();
  setBusy(true);
  try {
    if (state.ai) {
      try {
        const res = await fetch('/api/format', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: t.id, report: before, dictation, instruction, style: els.stylePrefs.value, inputLang: state.inputLang, outputLang: state.outputLang, mode: state.aiMode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
        result = data;
        source = `Claude · ${data.model || state.model}`;
      } catch (err) {
        if (needsAI) {
          toast(`${err.message} Dyktat został zachowany.`, 'err', 5000);
          return;
        }
        toast(`${err.message} Użyto trybu lokalnego.`, 'err', 5000);
      }
    }
    if (!result) {
      if (!dictation) {
        toast('Polecenia dla AI wymagają połączenia z Claude.', 'warn');
        return;
      }
      result = localMerge(t, before, dictation);
      source = 'Tryb lokalny';
    }
  } finally {
    setBusy(false);
  }

  commit(result.report, { baseline: before, warnings: result.warnings || [], corrections: result.corrections || [], source });
  els.dictation.value = '';
  els.instruction.value = '';
  save();

  const n = (result.corrections || []).length;
  const secs = ((performance.now() - started) / 1000).toFixed(1).replace('.', ',');
  toast(`${n ? `Opis zaktualizowany · zmieniono ${n} ${n === 1 ? 'zdanie' : 'zdania'} szablonu` : 'Opis zaktualizowany'} · ${secs} s`, 'ok', 3600);
  const firstMark = els.paper.querySelector('mark.add');
  firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------------------------------------------------------------- new report (next patient)
async function newReport() {
  if (state.busy) return;
  const t = template();
  const pristine = same({ ...state.report, lang: 'pl' }, reportFromTemplate(t));
  const copied = state.copied && same(state.copied, state.report);
  const pending = els.dictation.value.trim();
  if ((!pristine && !copied) || pending) {
    const what = pending && (pristine || copied) ? 'Dyktat nie został opracowany.' : 'Bieżący opis nie został skopiowany.';
    if (!window.confirm(`${what}\nZakończyć ten opis i zacząć nowy?`)) return;
  }
  if (state.recording) await stopRecording({ auto: false });
  els.dictation.value = '';
  els.instruction.value = '';
  els.interim.textContent = '';
  state.ignore = [];
  state.copied = null;
  commit(reportFromTemplate(t), { source: 'Szablon' });
  els.reportScroll.scrollTo({ top: 0 });
  toast(`Nowy opis · ${t.title} — możesz dyktować (Cofnij przywróci poprzedni)`, 'ok', 3200);
  if (state.outputLang === 'en') await translateReport('en');
}

const AI_MODE_HINTS = {
  fast: 'Szybki — krótsze „zastanawianie się” AI; zalecany na co dzień.',
  accurate: 'Dokładny — AI dłużej analizuje opis; wolniej, przy trudnych przypadkach.',
  turbo: 'Turbo — szybsze generowanie tekstu (ok. 2× droższe); gdy niedostępne, używany jest tryb Szybki.',
};
function renderAiMode() {
  els.aiMode.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === state.aiMode)));
  els.aiModeHint.textContent = AI_MODE_HINTS[state.aiMode];
}

// ---------------------------------------------------------------- languages
const translationCache = new Map(); // pristine template translations: "templateId:lang" → report

function renderLangToggles() {
  const mark = (group, value) => group.querySelectorAll('button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.lang === value));
    b.disabled = b.dataset.lang === 'en' && !state.ai && value !== 'en';
    b.title = b.disabled ? 'Wymaga AI (Claude) — brak klucza API' : '';
  });
  mark(els.inLang, state.inputLang);
  mark(els.outLang, state.outputLang);
  els.dictation.lang = state.inputLang;
  els.dictation.placeholder = state.inputLang === 'en'
    ? 'Dictate or type in English… e.g. “left subdural haematoma, 8 mm thick, otherwise unremarkable”'
    : 'Dyktuj lub wpisz… np. „krwiak podtwardówkowy nad lewą półkulą grubości 8 mm, reszta bez zmian”';
}

async function setInputLang(lang) {
  if (lang === state.inputLang) return;
  if (lang === 'en' && !state.ai) return toast('Dyktowanie po angielsku wymaga AI (Claude).', 'warn');
  if (state.recording) await stopRecording({ auto: false });
  state.inputLang = lang;
  dictationEngine.lang = lang === 'en' ? 'en-US' : 'pl-PL';
  renderLangToggles();
  save();
  toast(lang === 'en' ? 'Dyktowanie: angielski (opis powstaje w wybranym języku opisu)' : 'Dyktowanie: polski', 'info');
}

async function setOutputLang(lang) {
  if (lang === state.outputLang && lang === state.report.lang) return;
  if (lang === 'en' && !state.ai) return toast('Opis po angielsku wymaga AI (Claude).', 'warn');
  state.outputLang = lang;
  renderLangToggles();
  save();
  await translateReport(lang);
}

/** Translate the current report (cached for untouched templates). */
async function translateReport(lang) {
  const r = state.report;
  if (r.lang === lang) return;
  const pristineTpl = reportFromTemplate(template());
  const pristine = same({ ...r, lang: 'pl' }, pristineTpl) || (r.lang === 'en' && translationCache.get(`${r.templateId}:en`) && same(r, translationCache.get(`${r.templateId}:en`)));
  if (pristine && lang === 'pl') {
    commit(pristineTpl, { source: 'Szablon' });
    return;
  }
  const key = `${r.templateId}:${lang}`;
  if (pristine && translationCache.has(key)) {
    commit(clone(translationCache.get(key)), { source: 'Szablon (EN)' });
    return;
  }
  if (!state.ai) {
    state.outputLang = r.lang;
    renderLangToggles();
    return toast('Tłumaczenie wymaga AI (Claude).', 'warn');
  }
  setBusy(true, lang === 'en' ? 'Claude tłumaczy opis na angielski…' : 'Claude tłumaczy opis na polski…');
  try {
    const res = await fetch('/api/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: r.templateId, report: r, translate: true, inputLang: state.inputLang, outputLang: lang, style: els.stylePrefs.value, mode: state.aiMode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
    if (pristine) translationCache.set(key, clone(data.report));
    commit(data.report, { warnings: data.warnings || [], source: `Claude · tłumaczenie ${lang.toUpperCase()}` });
    toast(lang === 'en' ? 'Opis przetłumaczony na angielski' : 'Opis przetłumaczony na polski', 'ok');
  } catch (err) {
    state.outputLang = state.report.lang;
    renderLangToggles();
    save();
    toast(`Nie udało się przetłumaczyć: ${err.message}`, 'err', 5000);
  } finally {
    setBusy(false);
  }
}

function setBusy(busy, label) {
  state.busy = busy;
  els.processBtn.disabled = busy;
  els.processBtn.classList.toggle('busy', busy);
  els.processBtn.querySelector('.btn-label').textContent = busy ? 'Opracowywanie…' : state.ai ? 'Opracuj z AI' : 'Wstaw do szablonu';
  els.processing.hidden = !busy;
  els.processingText.textContent = label || (state.ai ? 'Claude opracowuje opis…' : 'Wstawianie do szablonu…');
}

// ---------------------------------------------------------------- copy
async function copyReport() {
  if (document.activeElement?.isContentEditable) document.activeElement.blur();
  const text = reportToText(state.report, template());
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  if (ok) {
    state.copied = clone(state.report);
    els.copyBtn.classList.add('done');
    els.copyBtn.querySelector('.btn-label').textContent = 'Skopiowano';
    setTimeout(() => {
      els.copyBtn.classList.remove('done');
      els.copyBtn.querySelector('.btn-label').textContent = 'Kopiuj opis';
    }, 1800);
    toast(liveConflicts.length ? 'Skopiowano — uwaga: w opisie są nierozwiązane sprzeczności' : 'Skopiowano do schowka — wklej do RIS (Ctrl+V)', liveConflicts.length ? 'warn' : 'ok', 3600);
  } else {
    toast('Nie udało się skopiować — zaznacz tekst ręcznie.', 'err');
  }
}

// ---------------------------------------------------------------- template picker
const REGION_ICONS = {
  'CT Head': '<circle cx="12" cy="10" r="7"/><path d="M9 21h6M12 17v4"/>',
  'Facial bones': '<path d="M6 8a6 6 0 0 1 12 0v4a6 6 0 0 1-12 0z"/><path d="M9 10h.01M15 10h.01M10 15h4"/>',
  'Vascular / Neuro': '<path d="M12 3v6M12 9c-4 0-6 3-6 6v6M12 9c4 0 6 3 6 6v6"/>',
  Spine: '<rect x="9" y="2.5" width="6" height="4" rx="1.5"/><rect x="9" y="10" width="6" height="4" rx="1.5"/><rect x="9" y="17.5" width="6" height="4" rx="1.5"/>',
  'Chest / Thorax': '<path d="M12 3v18M12 7c-3 0-7 1-7 6v6M12 7c3 0 7 1 7 6v6M5 13h14"/>',
  'Aorta / Vascular': '<path d="M9 21V9a3 3 0 0 1 6 0v1M9 12H6M15 13h3"/>',
  'Abdomen / Pelvis': '<path d="M5 6c0 8 3 14 7 14s7-6 7-14"/><path d="M8 11h8M9 15h6"/>',
  Combined: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
};
const picker = { group: 'Non-trauma', active: 0, items: [] };

function openPicker() {
  picker.group = template().group;
  els.pickerSearch.value = '';
  els.picker.hidden = false;
  renderPicker();
  setTimeout(() => els.pickerSearch.focus(), 0);
}
function closePicker() { els.picker.hidden = true; }

function itemButton(t, { tag = '' } = {}) {
  const cur = t.id === state.report.templateId;
  return `<button class="t-item${cur ? ' current' : ''}" data-id="${t.id}" title="${esc(t.exam)}">${esc(t.title)}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</button>`;
}

function renderPicker() {
  const q = fold(els.pickerSearch.value.trim());
  els.pickerTabs.innerHTML = GROUPS.map((g) => {
    const n = TEMPLATES.filter((t) => t.group === g.id).length;
    const trauma = g.id === 'Trauma';
    return `<button class="tab${trauma ? ' trauma' : ''}" role="tab" aria-selected="${!q && picker.group === g.id}" data-group="${g.id}"><span class="dotc"></span>${g.label}<span class="count">${n}</span></button>`;
  }).join('');
  const recent = state.recent.map(getTemplate).filter(Boolean);
  els.pickerRecent.innerHTML = recent.length && !q
    ? `<span class="lbl">Ostatnie</span>${recent.map((t) => `<button class="chip-btn" data-id="${t.id}">${esc(t.title)}</button>`).join('')}`
    : '';

  if (q) {
    const tokens = q.split(/\s+/);
    const scored = TEMPLATES.map((t) => {
      const title = fold(`${t.title} ${t.exam}`);
      const meta = fold(`${regionLabel(t.section)} ${t.section} ${GROUPS.find((g) => g.id === t.group)?.label} ${t.group}`);
      const body = fold(t.body);
      let score = 0;
      for (const tok of tokens) {
        if (title.includes(tok)) score += 10;
        else if (meta.includes(tok)) score += 5;
        else if (body.includes(tok)) score += 1;
        else return null;
      }
      return { t, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score || a.t.priority - b.t.priority);
    els.pickerBody.innerHTML = scored.length
      ? `<div class="results">${scored.map(({ t }) => itemButton(t, { tag: `${t.group === 'Trauma' ? 'Uraz' : 'Bez urazu'} · ${regionLabel(t.section)}` })).join('')}</div>`
      : '<div class="no-results">Brak szablonów — spróbuj innego słowa.</div>';
  } else {
    const regions = templatesByRegion(picker.group);
    els.pickerBody.innerHTML = `<div class="regions${picker.group === 'Trauma' ? ' trauma-mode' : ''}">${regions
      .map((r) => `<section class="region">
        <div class="region-head"><span class="region-icon"><svg viewBox="0 0 24 24">${REGION_ICONS[r.id] || ''}</svg></span>${esc(r.label)}<span class="region-count">${r.templates.length}</span></div>
        ${r.templates.map((t) => itemButton(t)).join('')}
      </section>`)
      .join('')}</div>`;
  }
  picker.items = [...els.pickerBody.querySelectorAll('.t-item')];
  picker.active = q ? 0 : Math.max(0, picker.items.findIndex((b) => b.dataset.id === state.report.templateId));
  markActive();
}
function markActive() {
  picker.items.forEach((b, i) => b.classList.toggle('active', i === picker.active));
  picker.items[picker.active]?.scrollIntoView({ block: 'nearest' });
}
function pickerKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); closePicker(); return; }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (!picker.items.length) return;
    picker.active = (picker.active + (e.key === 'ArrowDown' ? 1 : -1) + picker.items.length) % picker.items.length;
    markActive();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const b = picker.items[picker.active];
    if (b) { selectTemplate(b.dataset.id); closePicker(); }
  } else if (e.key === 'Tab' && document.activeElement === els.pickerSearch && !els.pickerSearch.value) {
    e.preventDefault();
    picker.group = picker.group === 'Trauma' ? 'Non-trauma' : 'Trauma';
    renderPicker();
  }
}

// ---------------------------------------------------------------- snippets
function renderSnippets() {
  els.snippetsPop.innerHTML = SNIPPET_GROUPS.map((g) => {
    const items = SNIPPETS.filter((s) => s.section === g.id);
    if (!items.length) return '';
    return `<div class="pop-group">${g.label}</div>${items
      .map((s) => `<button class="pop-item" role="menuitem" data-snippet="${s.id}">${esc(s.title)}<small>${esc(s.text)}</small></button>`)
      .join('')}`;
  }).join('');
}
function toggleSnippets(open = els.snippetsPop.hidden) {
  els.snippetsPop.hidden = !open;
  els.snippetsBtn.setAttribute('aria-expanded', String(open));
  if (open) els.snippetsPop.querySelector('.pop-item')?.focus();
}
function insertSnippet(id) {
  const s = SNIPPETS.find((x) => x.id === id);
  if (!s) return;
  const ta = els.dictation;
  const start = ta.selectionStart ?? ta.value.length;
  const end = ta.selectionEnd ?? ta.value.length;
  const before = ta.value.slice(0, start);
  const sep = before && !/\s$/.test(before) ? ' ' : '';
  const text = sep + s.text;
  ta.value = before + text + ta.value.slice(end);
  const caret = start + text.length;
  toggleSnippets(false);
  ta.focus();
  ta.setSelectionRange(caret, caret);
  save();
}

// ---------------------------------------------------------------- recording
const meter = new LevelMeter();
let timerStart = 0;
let timerId = null;
const dictationEngine = new Dictation({
  lang: 'pl-PL',
  onFinal: (text) => {
    if (!text) return;
    const prev = els.dictation.value.replace(/\s+$/, '');
    const chunk = convertSpokenFor(state.inputLang)(text);
    els.dictation.value = tidy(prev ? `${prev} ${chunk}` : chunk, { closeSentences: false }) + ' ';
    els.dictation.scrollTop = els.dictation.scrollHeight;
    save();
  },
  onInterim: (text) => { els.interim.textContent = text; },
  onStateChange: (on) => { if (!on && state.recording) stopRecording({ auto: true }); },
  onError: (msg) => toast(msg, 'err', 5000),
});

function startRecording() {
  if (!speechSupported) {
    toast('Rozpoznawanie mowy działa w Chrome lub Edge. Możesz wpisać tekst ręcznie.', 'warn', 5000);
    els.dictation.focus();
    return;
  }
  if (state.busy) return;
  try {
    dictationEngine.start();
  } catch {
    toast('Nie udało się uruchomić rozpoznawania mowy.', 'err');
    return;
  }
  state.recording = true;
  document.body.classList.add('recording');
  els.recBtn.setAttribute('aria-pressed', 'true');
  els.recBtn.setAttribute('aria-label', 'Zatrzymaj dyktowanie');
  els.recState.textContent = 'Nagrywanie… mów';
  timerStart = Date.now();
  timerId = setInterval(tick, 250);
  tick();
  meter.start();
}

let stopping = false;
async function stopRecording({ auto = true } = {}) {
  if (!state.recording || stopping) return;
  stopping = true;
  els.recState.textContent = 'Kończenie…';
  await dictationEngine.stop();
  meter.stop();
  clearInterval(timerId);
  state.recording = false;
  stopping = false;
  document.body.classList.remove('recording');
  els.recBtn.setAttribute('aria-pressed', 'false');
  els.recBtn.setAttribute('aria-label', 'Rozpocznij dyktowanie');
  els.recState.textContent = 'Naciśnij, aby dyktować';
  els.interim.textContent = '';
  if (auto && els.autoProcess.checked && els.dictation.value.trim()) process();
}
const toggleRecording = () => (state.recording ? stopRecording({ auto: true }) : startRecording());
function tick() {
  const s = Math.floor((Date.now() - timerStart) / 1000);
  els.recTimer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Radial visualiser around the record button.
function drawViz() {
  const c = els.recViz;
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = Math.round(c.clientWidth * dpr);
  if (size && c.width !== size) { c.width = size; c.height = size; }
  ctx.clearRect(0, 0, c.width, c.height);
  const cx = c.width / 2;
  const r0 = c.width * 0.355;
  const bars = 72;
  const bins = meter.bins();
  const t = performance.now() / 1000;
  const rec = state.recording;
  for (let i = 0; i < bars; i++) {
    const a = (i / bars) * Math.PI * 2 - Math.PI / 2;
    let v;
    if (bins) {
      const k = Math.floor(((i < bars / 2 ? i : bars - i) / (bars / 2)) * (bins.length * 0.7));
      v = bins[k] / 255;
    } else {
      v = rec ? 0.08 + 0.05 * Math.sin(t * 3 + i * 0.5) : 0.04 + 0.025 * Math.sin(t * 1.2 + i * 0.35);
    }
    const len = c.width * (0.012 + v * 0.11);
    ctx.strokeStyle = rec ? `rgba(255, ${110 + v * 60}, ${125 + v * 40}, ${0.35 + v * 0.65})` : `rgba(89, 212, 255, ${0.18 + v * 2})`;
    ctx.lineWidth = c.width * 0.009;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r0, cx + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * (r0 + len), cx + Math.sin(a) * (r0 + len));
    ctx.stroke();
  }
  requestAnimationFrame(drawViz);
}

// ---------------------------------------------------------------- AI status
async function checkStatus() {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const data = await res.json();
    state.ai = Boolean(data.ai);
    state.model = data.model;
  } catch {
    state.ai = false;
  }
  els.aiStatus.classList.toggle('ok', state.ai);
  els.aiStatus.classList.toggle('local', !state.ai);
  els.aiStatus.querySelector('.label').textContent = state.ai ? 'AI: Claude' : 'Tryb lokalny (bez AI)';
  els.aiStatus.title = state.ai ? `Model: ${state.model}` : 'Brak klucza ANTHROPIC_API_KEY na serwerze — dyktat jest wstawiany i sprawdzany regułami lokalnymi.';
  if (!state.ai) {
    state.inputLang = 'pl';
    state.outputLang = state.report.lang;
  }
  dictationEngine.lang = state.inputLang === 'en' ? 'en-US' : 'pl-PL';
  renderLangToggles();
  setBusy(false);
}

// ---------------------------------------------------------------- settings / help
function openSettings(open) {
  els.settings.classList.toggle('open', open);
  els.settings.setAttribute('aria-hidden', String(!open));
  els.overlay.hidden = !open;
  if (open) els.stylePrefs.focus();
}
const openHelp = (open) => { els.helpModal.hidden = !open; };

// ---------------------------------------------------------------- events
const isTyping = (el) => el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);

function bind() {
  els.recBtn.addEventListener('click', toggleRecording);
  els.processBtn.addEventListener('click', process);
  els.copyBtn.addEventListener('click', copyReport);
  els.undoBtn.addEventListener('click', undo);
  els.redoBtn.addEventListener('click', redo);
  els.acceptBtn.addEventListener('click', acceptChanges);
  els.resetBtn.addEventListener('click', resetReport);
  els.clearDictation.addEventListener('click', () => { els.dictation.value = ''; save(); els.dictation.focus(); });
  els.dictation.addEventListener('input', save);
  els.stylePrefs.addEventListener('input', save);
  els.autoProcess.addEventListener('change', save);
  els.settingsBtn.addEventListener('click', () => openSettings(true));
  els.closeSettings.addEventListener('click', () => openSettings(false));
  els.overlay.addEventListener('click', () => openSettings(false));
  els.helpBtn.addEventListener('click', () => openHelp(true));
  els.closeHelp.addEventListener('click', () => openHelp(false));
  els.helpModal.addEventListener('click', (e) => { if (e.target === els.helpModal) openHelp(false); });

  els.newReportBtn.addEventListener('click', newReport);
  els.aiMode.addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    state.aiMode = b.dataset.mode;
    renderAiMode();
    save();
  });

  // languages
  els.inLang.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && !b.disabled) setInputLang(b.dataset.lang); });
  els.outLang.addEventListener('click', (e) => { const b = e.target.closest('[data-lang]'); if (b && !b.disabled && !state.busy) setOutputLang(b.dataset.lang); });

  // template picker
  els.tplCurrent.addEventListener('click', openPicker);
  els.closePicker.addEventListener('click', closePicker);
  els.picker.addEventListener('click', (e) => {
    if (e.target === els.picker) return closePicker();
    const tab = e.target.closest('[data-group]');
    if (tab) { picker.group = tab.dataset.group; els.pickerSearch.value = ''; renderPicker(); els.pickerSearch.focus(); return; }
    const item = e.target.closest('[data-id]');
    if (item) { selectTemplate(item.dataset.id); closePicker(); }
  });
  els.pickerSearch.addEventListener('input', renderPicker);
  els.picker.addEventListener('keydown', pickerKey);

  // snippets
  els.snippetsBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleSnippets(); });
  els.snippetsPop.addEventListener('click', (e) => {
    const b = e.target.closest('[data-snippet]');
    if (b) insertSnippet(b.dataset.snippet);
  });
  document.addEventListener('click', (e) => {
    if (!els.snippetsPop.hidden && !e.target.closest('.pop-wrap')) toggleSnippets(false);
  });

  // conflicts
  els.conflictsList.addEventListener('click', (e) => {
    const fix = e.target.closest('[data-fix]');
    const keep = e.target.closest('[data-keep]');
    if (fix) fixConflicts([liveConflicts[Number(fix.dataset.fix)]]);
    if (keep) {
      state.ignore.push(liveConflicts[Number(keep.dataset.keep)].original);
      save();
      renderConflicts();
    }
  });
  els.fixAllBtn.addEventListener('click', () => fixConflicts(liveConflicts));

  // report editing
  els.paper.addEventListener('focusin', (e) => { if (e.target.isContentEditable) onEditFocus(); });
  els.paper.addEventListener('focusout', (e) => { if (e.target.isContentEditable) onEditBlur(); });
  els.paper.addEventListener('input', (e) => { if (e.target.isContentEditable) onEditInput(e); });
  els.paper.addEventListener('paste', (e) => {
    if (!e.target.closest('[contenteditable]')) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });
  els.examHeader.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); els.examHeader.blur(); } });

  els.dictation.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); process(); } });
  els.instruction.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); process(); } });

  document.addEventListener('keydown', (e) => {
    if (!els.picker.hidden) return; // picker handles its own keys
    const typing = isTyping(document.activeElement);
    if (e.key === 'Escape') { openSettings(false); openHelp(false); toggleSnippets(false); return; }
    if (e.key === 'F2') { e.preventDefault(); toggleRecording(); return; }
    if (e.altKey && (e.key === 'n' || e.key === 'N' || e.code === 'KeyN')) { e.preventDefault(); newReport(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); process(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); copyReport(); return; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) { e.preventDefault(); redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' && document.activeElement !== els.recBtn && !document.activeElement?.closest('button')) { e.preventDefault(); toggleRecording(); return; }
    if (e.key === 't' || e.key === 'T') { e.preventDefault(); openPicker(); return; }
    if (e.key === 'w' || e.key === 'W') { e.preventDefault(); toggleSnippets(); return; }
    if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setInputLang(state.inputLang === 'pl' ? 'en' : 'pl'); return; }
    if (e.key === '?') openHelp(true);
  });
  window.addEventListener('beforeunload', () => { if (state.recording) dictationEngine.stop(); });
}

// ---------------------------------------------------------------- init
function init() {
  load();
  renderSnippets();
  renderReport();
  renderAiMode();
  bind();
  if (!speechSupported) {
    els.speechBadge.hidden = false;
    els.speechInfo.textContent = 'Ta przeglądarka nie obsługuje rozpoznawania mowy (Web Speech API). Użyj Chrome lub Edge, albo wpisuj tekst ręcznie.';
  } else {
    els.speechInfo.textContent = 'Wbudowane rozpoznawanie mowy przeglądarki (język polski). W Chrome dźwięk jest przetwarzany przez serwery Google i wymaga internetu.';
  }
  checkStatus();
  requestAnimationFrame(drawViz);
}

init();

// Exposed for automated UI tests.
window.__radvox = { state, process, copyReport, selectTemplate };

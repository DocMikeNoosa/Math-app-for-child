import './hosted.js'; // hosted version: session, subscription, sync — must run first
import { TEMPLATES, GROUPS, REGIONS, SNIPPETS, SNIPPET_GROUPS, SECTION_LABELS, getTemplate, regionLabel, templatesByRegion, reportFromTemplate, reportToText, setUserTemplates, isBuiltin, builtinRaw, rawOf, cleanRaw, parseTemplate } from './templates.js';
import { convertSpokenFor, tidy, scrubIdentifiers, wordDiff } from './polish-text.js';
import { localMerge, findConflicts, applyConflicts, splitSentences, analyseFinding, isIncidental, shortenFinding, defaultConclusion } from './crosscheck.js';
import { Dictation, LevelMeter, speechSupported } from './speech.js';
import { parseVoiceCommands, dropLastSentence, dropLastWord, COMMAND_LABELS } from './voice-commands.js';
import { styleExamplesFrom, addStyleExamples, conclusionChanges, reportChanged, addUnique, similarity } from './style-learning.js';
import { MicButton } from './mic-button.js';
import { listInputs, InputTester, inputError } from './audio-input.js';

const $ = (id) => document.getElementById(id);
const els = Object.fromEntries(
  [
    'tplCurrent', 'tplGroupChip', 'tplRegion', 'tplTitle', 'aiStatus', 'helpBtn', 'settingsBtn',
    'recWrap', 'recBtn', 'recViz', 'recState', 'recTimer', 'dictation', 'interim', 'instruction', 'processBtn', 'prepState', 'micHint',
    'clearDictation', 'speechBadge', 'snippetsBtn', 'snippetsPop',
    'undoBtn', 'redoBtn', 'acceptBtn', 'resetBtn', 'copyBtn', 'examHeader', 'bodyText', 'bodyLabel', 'conclusion', 'paper',
    'conflicts', 'conflictsList', 'fixAllBtn', 'corrections', 'correctionsList', 'correctionsTitle', 'warnings', 'warningsList',
    'processing', 'processingText', 'footWords', 'footSource', 'footSaved', 'reportScroll', 'inLang', 'outLang', 'conclusionLabel', 'newReportBtn', 'aiMode', 'aiModeHint',
    'newTplBtn', 'tplMenuBtn', 'tplMenu', 'exportTpl', 'importTpl', 'importFile',
    'tplEditor', 'tplEditorTitle', 'closeTplEditor', 'tplName', 'tplGroup', 'tplRegionSelect', 'tplText', 'tplFromReport', 'tplCheck',
    'tplDelete', 'tplDuplicate', 'tplCancel', 'tplSave',
    'picker', 'pickerSearch', 'pickerTabs', 'pickerRecent', 'pickerBody', 'closePicker',
    'settings', 'closeSettings', 'overlay', 'stylePrefs', 'speechInfo', 'helpModal', 'closeHelp', 'toasts',
    'emptyState', 'emptyRecent', 'emptyPick', 'versionInfo', 'learnSummary', 'clinical', 'clinicalMic',
    'learnBtn', 'learnDot', 'learnModal', 'closeLearn', 'learnOn', 'learnProfileSummary', 'learnText', 'learnLang', 'learnAdd', 'learnSamples',
    'learnAnalyze', 'learnStatus', 'learnQSec', 'learnQuestions', 'learnRules', 'learnRuleInput', 'learnRuleAdd', 'learnPhrases', 'learnAuto', 'learnForget',
    'cpToggle', 'cpCount', 'cpoints', 'enVariant', 'pairEn', 'pairPl', 'pairAdd', 'pairList', 'pairCount', 'glossEn', 'glossPl', 'glossAdd', 'glossList',
    'origBtn', 'origModal', 'origTitle', 'origBody', 'closeOrig', 'origCopyAll',
    'clock', 'todayBtn', 'todayCount', 'todayModal', 'todayTitle', 'todayList', 'todayClear', 'closeToday',
    'bgProcess', 'learnStyle', 'styleCount', 'styleList', 'clearStyle',
    'micStatus', 'micSetup', 'micSetupRow', 'micSkip', 'micConnect', 'micConnectAny', 'micLearn', 'micForget', 'micModeToggle', 'micModeHold', 'micLedRow', 'micLedStatus', 'micLedFind', 'micLedTest', 'micLedAsk', 'micLedQ', 'micLedYes', 'micLedNo', 'micLedStop', 'audioInput', 'audioTest', 'audioLevelWrap', 'audioLevel', 'audioStatus', 'micDiag', 'micDiagBox', 'micDiagCopy', 'keyLearn', 'keyClear', 'keyStatus',
  ].map((id) => [id, $(id)]),
);

// ---------------------------------------------------------------- state
const STORE_KEY = 'radvox.v2';
// The app starts blank: no template until the radiologist picks one.
const blankReport = (lang = 'pl') => ({ templateId: null, header: '', body: '', conclusion: '', lang });
const state = {
  ai: false,
  model: null,
  report: blankReport(),
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
  source: 'Brak szablonu',
  busy: false,
  prepareAfterPick: false, // "Przygotuj opis" pressed before a template was chosen
  recording: false,
  reportId: newId(), // identifies this report in today's list
  lastAI: null, // the report as the AI produced it (for style learning)
  recordKey: null, // keyboard key bound to start / stop dictation (e.g. F9 sent by a PowerMic)
  enVariant: 'en-US', // English speech recognition: en-US or en-GB
  enDictations: [], // English dictations of this report (→ EN→PL learning pairs)
};
function newId() { return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
const clone = (o) => JSON.parse(JSON.stringify(o));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const template = () => (state.report.templateId ? getTemplate(state.report.templateId) : null);
const isBlank = () => !template();

// ---------------------------------------------------------------- user templates
const USER_TPL_KEY = 'radvox.templates.v1';
let userTemplates = { edited: {}, custom: [], deleted: [] };
function loadUserTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_TPL_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      userTemplates = { edited: saved.edited || {}, custom: Array.isArray(saved.custom) ? saved.custom : [], deleted: Array.isArray(saved.deleted) ? saved.deleted : [] };
    }
  } catch { /* storage unavailable */ }
  setUserTemplates(userTemplates);
}
function saveUserTemplates() {
  setUserTemplates(userTemplates);
  try {
    localStorage.setItem(USER_TPL_KEY, JSON.stringify(userTemplates));
  } catch {
    toast('Nie udało się zapisać szablonów w przeglądarce.', 'err');
  }
}

function load() {
  loadUserTemplates();
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!saved) return;
    // The app always opens blank. A report left unfinished last time goes to today's list.
    const r = saved.report;
    const t = r && getTemplate(r.templateId);
    if (t && ['header', 'body', 'conclusion'].every((k) => typeof r[k] === 'string') && !same({ ...r, lang: 'pl' }, reportFromTemplate(t))
      && !today.items.some((x) => x.id === saved.reportId)) {
      today.items.push({ id: saved.reportId || newId(), time: Date.now(), title: t.title, text: reportToText(r, t), report: r, unfinished: true });
      saveToday();
    }
    state.inputLang = saved.inputLang === 'en' ? 'en' : 'pl';
    state.outputLang = saved.outputLang === 'en' ? 'en' : 'pl';
    state.aiMode = ['fast', 'accurate', 'turbo'].includes(saved.aiMode) ? saved.aiMode : 'fast';
    els.stylePrefs.value = saved.style || '';
    els.clinical.value = saved.clinical || '';
    els.bgProcess.checked = saved.bgProcess !== false;
    els.learnStyle.checked = saved.learnStyle !== false;
    state.recordKey = typeof saved.recordKey === 'string' ? saved.recordKey : null;
    state.enVariant = saved.enVariant === 'en-GB' ? 'en-GB' : 'en-US';
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
        report: state.report, dictation: els.dictation.value, style: els.stylePrefs.value, clinical: els.clinical.value,
        bgProcess: els.bgProcess.checked, learnStyle: els.learnStyle.checked, recordKey: state.recordKey, reportId: state.reportId, enVariant: state.enVariant,
        recent: state.recent, ignore: state.ignore,
        inputLang: state.inputLang, outputLang: state.outputLang, aiMode: state.aiMode,
      }));
      els.footSaved.textContent = 'Zapisano lokalnie';
    } catch {
      els.footSaved.textContent = 'Brak zapisu lokalnego';
    }
  }, 250);
}

// ---------------------------------------------------------------- in-app confirmation dialog
// (replaces the browser's own "127.0.0.1 says…" pop-up). Resolves true / false. Enter = OK, Esc = cancel.
function askConfirm(message, { ok = 'Tak', cancel = 'Anuluj', danger = false } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'modal confirm-modal';
    wrap.setAttribute('role', 'alertdialog');
    wrap.setAttribute('aria-modal', 'true');
    const card = document.createElement('div');
    card.className = 'modal-card confirm-card';
    const msg = document.createElement('div');
    msg.className = 'confirm-msg';
    String(message).split('\n').forEach((line, i) => {
      const p = document.createElement('p');
      if (i === 0) p.className = 'confirm-lead';
      p.textContent = line;
      msg.append(p);
    });
    const actions = document.createElement('div');
    actions.className = 'confirm-actions';
    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'btn';
    no.textContent = cancel;
    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    yes.textContent = ok;
    actions.append(no, yes);
    card.append(msg, actions);
    wrap.append(card);
    const prevFocus = document.activeElement;
    const done = (v) => {
      document.removeEventListener('keydown', onKey, true);
      wrap.remove();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      resolve(v);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(false); }
      else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); done(document.activeElement !== no); }
      else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === yes ? no : yes).focus(); }
      else if (e.key === ' ') { e.preventDefault(); e.stopPropagation(); } // Space is the dictation key: never answers the dialog
      else e.stopPropagation(); // other app shortcuts stay off while the dialog is open
    };
    no.addEventListener('click', () => done(false));
    yes.addEventListener('click', () => done(true));
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) done(false); });
    document.addEventListener('keydown', onKey, true);
    document.body.append(wrap);
    yes.focus();
  });
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
  // at most a few at a time, so they never cover the report
  while (els.toasts.children.length > 3) els.toasts.firstElementChild.remove();
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, ms);
}

// ---------------------------------------------------------------- rendering
function renderTemplateButton() {
  const t = template();
  els.tplCurrent.classList.toggle('empty', !t);
  if (!t) {
    els.tplGroupChip.textContent = 'SZABLON';
    els.tplGroupChip.classList.remove('trauma');
    els.tplRegion.textContent = 'Nowy opis';
    els.tplTitle.textContent = 'Wybierz szablon…';
    els.tplCurrent.title = 'Wybierz szablon (T)';
    return;
  }
  const trauma = t.group === 'Trauma';
  els.tplGroupChip.textContent = trauma ? 'URAZ' : 'BEZ URAZU';
  els.tplGroupChip.classList.toggle('trauma', trauma);
  els.tplRegion.textContent = regionLabel(t.section);
  els.tplTitle.textContent = t.title;
  els.tplCurrent.title = `${t.exam} — zmień szablon (T)`;
}

function renderEmpty() {
  const blank = isBlank();
  document.body.classList.toggle('no-template', blank);
  els.emptyState.hidden = !blank;
  els.paper.hidden = blank;
  if (!blank) return;
  const recent = state.recent.map(getTemplate).filter(Boolean);
  els.emptyRecent.innerHTML = recent.length
    ? `<span class="lbl">Ostatnio używane</span>${recent.map((t) => `<button class="chip-btn${t.group === 'Trauma' ? ' trauma' : ''}" data-id="${esc(t.id)}">${esc(t.title)}</button>`).join('')}`
    : '';
}

function renderReport() {
  const r = state.report;
  const base = state.baseline;
  renderTemplateButton();
  renderEmpty();
  els.examHeader.textContent = r.header;
  const L = SECTION_LABELS[r.lang === 'en' ? 'en' : 'pl'];
  els.bodyLabel.textContent = L.body;
  els.conclusionLabel.textContent = L.conclusion;
  for (const el of [els.examHeader, els.bodyText, els.conclusion]) el.lang = r.lang === 'en' ? 'en' : 'pl';
  renderLangToggles();
  els.bodyText.innerHTML = highlighted(base?.body, r.body);
  els.conclusion.innerHTML = highlighted(base?.conclusion, r.conclusion);
  els.conclusion.parentElement.classList.toggle('changed', Boolean(base && base.conclusion !== r.conclusion));
  renderCPoints();
  renderPanels();
  renderMeta();
}

function renderPanels() {
  // corrections (what the cross-check removed / rewrote)
  els.correctionsList.innerHTML = state.corrections
    .map((c, i) => `<li><del>${esc(c.removed)}</del>${c.replacement ? `<span class="arrow">→</span><ins>${esc(c.replacement)}</ins>` : '<span class="arrow">→</span><ins><em>usunięto</em></ins>'}${c.reason ? `<span class="why">${esc(c.reason)}</span>` : ''}${present(c.removed) ? '' : `<span class="c-actions"><button class="mini-btn" data-copy-corr="${i}">Kopiuj</button><button class="mini-btn accent" data-restore="${i}" title="Wstaw to zdanie szablonu z powrotem do opisu">Przywróć</button></span>`}</li>`)
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
  liveConflicts = isBlank() ? [] : findConflicts(template(), state.report, { ignore: state.ignore });
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
  const words = isBlank() ? 0 : reportToText(state.report, template()).split(/\s+/).filter(Boolean).length;
  for (const b of [els.copyBtn, els.resetBtn]) b.disabled = isBlank();
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
  const wasEdited = !isBlank() && !same({ ...state.report, lang: 'pl' }, reportFromTemplate(template()));
  state.ignore = [];
  if (wasEdited) archiveCurrent();
  state.reportId = newId();
  state.enDictations = [];
  state.lastAI = null;
  commit(reportFromTemplate(t), { source: 'Szablon' });
  if (!state.prepareAfterPick) toast(wasEdited ? `${t.title} — „Cofnij” przywróci poprzedni opis` : t.title, 'info');
  const prepare = state.prepareAfterPick;
  state.prepareAfterPick = false;
  (async () => {
    if (state.outputLang === 'en') await translateReport('en');
    if (prepare) process();
  })();
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
  if (isBlank()) return;
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
    renderCPoints();
  }
  editSnapshot = null;
}

/** The clinical-details box grows with its text and is marked when filled. */
function renderClinical() {
  const el = els.clinical;
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  el.closest('.clinical-box').classList.toggle('filled', Boolean(el.value.trim()));
}

// ---------------------------------------------------------------- learning module ("Nauka AI")
const PROFILE_KEY = 'radvox.profile.v1';
let profile = { rules: [], phrases: [], glossary: [], summary: '', questions: [], answers: [], samples: [], analyzedAt: 0, itemsAtAnalysis: 0 };
let learnSampleLang = 'pl';
function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    if (saved && typeof saved === 'object') profile = { ...profile, ...saved };
    for (const k of ['rules', 'phrases', 'glossary', 'questions', 'answers', 'samples']) if (!Array.isArray(profile[k])) profile[k] = [];
  } catch { /* ignore */ }
}
function saveProfile() {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch { toast('Nie udało się zapisać — pamięć przeglądarki pełna?', 'err'); }
  renderLearnDot();
  if (!els.learnModal.hidden) renderLearn();
}
const learnedItems = () => styleExamples.length + learned.conclusionRemoved.length + learned.conclusionAdded.length + learned.restored.length
  + Object.values(learned.reports).reduce((a, r) => a + r.length, 0) + profile.samples.length + profile.answers.length + (learned.translations || []).length;
function renderLearnDot() {
  const pending = profile.questions.length > 0 || learnedItems() - (profile.itemsAtAnalysis || 0) >= 8;
  els.learnDot.hidden = !pending;
  const tip = document.getElementById('learnTipState');
  if (tip) {
    const n = learnedItems();
    const on = !els.learnStyle || els.learnStyle.checked;
    tip.textContent = `${pending ? 'Są nowe pytania lub materiał do analizy — kliknij. ' : ''}${on ? 'Nauka włączona' : 'Nauka wyłączona'} · zebrano ${n} ${n === 1 ? 'przykład' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'przykłady' : 'przykładów'}.`;
  }
}
/** A pasted report / phrase, or an edited template (kind 'szablon'). */
function addSample(text, lang = 'pl', kind = 'przykład', title = '') {
  const clean = scrubIdentifiers(String(text || '').replace(/\r/g, '').trim());
  if (!clean) return false;
  profile.samples = [...profile.samples.filter((x) => x.text !== clean && !(kind === 'szablon' && x.kind === 'szablon' && x.title === title)), { text: clean.slice(0, 8000), lang, kind, title, at: Date.now() }].slice(-40);
  saveProfile();
  return true;
}
/** The analysis' glossary plus every term the radiologist added by hand (his entries win). */
function mergeGlossary(fromAI, current) {
  const manual = current.filter((g) => g.manual);
  const key = (g) => g.en.trim().toLowerCase();
  return [...fromAI.filter((g) => !manual.some((m) => key(m) === key(g))), ...manual].slice(-80);
}
/** EN→PL pairs for a request: same template first, newest first, at most 6. */
function translationsFor(templateId) {
  const all = (learned.translations || []).slice().reverse();
  const same = all.filter((x) => x.templateId === templateId);
  return [...same, ...all.filter((x) => x.templateId !== templateId)].slice(0, 6).map(({ en, pl }) => ({ en: en.slice(0, 3000), pl: pl.slice(0, 4000) }));
}
/** Up to 3 of the radiologist's own texts in the report language, sent with each request. */
function samplesFor(lang) {
  const own = profile.samples.filter((x) => x.kind !== 'szablon');
  const same = own.filter((x) => x.lang === lang);
  return (same.length ? same : own).slice(-3).map((x) => x.text.slice(0, 2500));
}
function renderLearn() {
  els.learnOn.checked = els.learnStyle.checked;
  els.learnProfileSummary.textContent = profile.summary ? `${profile.summary}${profile.analyzedAt ? ` (analiza: ${new Date(profile.analyzedAt).toLocaleDateString('pl-PL')})` : ''}` : '';
  els.learnLang.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === learnSampleLang)));
  const X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  els.learnSamples.innerHTML = profile.samples.length
    ? profile.samples.slice().reverse().map((x, i) => `<li><span class="learn-tag">${x.kind === 'szablon' ? 'SZABLON' : x.lang.toUpperCase()}</span><span class="txt" title="${esc(x.text.slice(0, 600))}">${esc(x.title ? `${x.title}: ` : '')}${esc(x.text.replace(/\s+/g, ' ').slice(0, 160))}</span><button class="x-btn" data-del-sample="${profile.samples.length - 1 - i}" title="Usuń przykład">${X}</button></li>`).join('')
    : '<li class="learn-empty">Brak przykładów — wklej kilka swoich opisów.</li>';
  els.learnRules.innerHTML = profile.rules.length
    ? profile.rules.map((r, i) => `<li><span class="txt" contenteditable="true" data-rule="${i}" spellcheck="true">${esc(r)}</span><button class="x-btn" data-del-rule="${i}" title="Usuń regułę">${X}</button></li>`).join('')
    : '<li class="learn-empty">Jeszcze brak reguł — dodaj przykłady i kliknij „Analizuj mój styl”, albo dopisz regułę sam.</li>';
  els.learnPhrases.innerHTML = profile.phrases.length
    ? profile.phrases.map((x, i) => `<li><span class="txt"><span class="sit">${esc(x.situation)}</span>${esc(x.preferred)}</span><button class="x-btn" data-del-phrase="${i}" title="Usuń">${X}</button></li>`).join('')
    : '<li class="learn-empty">—</li>';
  const tr = learned.translations || [];
  els.pairCount.textContent = tr.length ? `Pary EN → PL: ${tr.length} (${tr.filter((x) => x.manual).length} dodane ręcznie)` : 'Brak par — zapiszą się same, gdy skopiujesz opis podyktowany po angielsku.';
  els.pairList.innerHTML = tr.slice().reverse().slice(0, 12).map((x, i) => `<li><span class="learn-tag">EN→PL</span><span class="txt" title="${esc(`${x.en}\n→\n${x.pl}`.slice(0, 900))}">${esc(x.en.replace(/\s+/g, ' ').slice(0, 70))} → ${esc(x.pl.replace(/\s+/g, ' ').slice(0, 90))}</span><button class="x-btn" data-del-pair="${tr.length - 1 - i}" title="Usuń parę">${X}</button></li>`).join('');
  els.glossList.innerHTML = profile.glossary.length
    ? profile.glossary.map((g, i) => `<li><span class="txt"><span class="arrow-en">${esc(g.en)} →</span> ${esc(g.pl)}</span><button class="x-btn" data-del-gloss="${i}" title="Usuń">${X}</button></li>`).join('')
    : '<li class="learn-empty">Słownik jest pusty — AI uzupełni go przy analizie stylu albo dodaj termin sam.</li>';
  els.learnQSec.hidden = !profile.questions.length;
  els.learnQuestions.innerHTML = profile.questions.map((q, i) => `<div class="learn-q" data-q="${i}">
      <div class="q">${esc(q.question)}</div>
      <textarea data-q-text="${i}" rows="2" spellcheck="true" lang="pl">${esc(q.suggestion)}</textarea>
      ${q.options?.length ? `<div class="opts">${q.options.map((o) => `<button class="chip-btn" data-q-opt="${i}" data-text="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
      <div class="btn-row"><button class="btn btn-small btn-primary" data-q-save="${i}">Zapisz moją wersję</button><button class="btn btn-small" data-q-skip="${i}">Pomiń</button></div>
    </div>`).join('');
  const n = learnedItems();
  els.learnAuto.textContent = `Zapamiętane: poprawki sformułowań ${styleExamples.length} · usunięte z wniosków ${learned.conclusionRemoved.length} · dodane do wniosków ${learned.conclusionAdded.length} · przywrócone zdania ${learned.restored.length} · Twoje gotowe opisy ${Object.values(learned.reports).reduce((a, r) => a + r.length, 0)} · przykłady ${profile.samples.length} · odpowiedzi ${profile.answers.length}. ${n - (profile.itemsAtAnalysis || 0) > 0 ? `Nowe od ostatniej analizy: ${n - (profile.itemsAtAnalysis || 0)}.` : ''}`;
}
function openLearn(open = true) {
  if (open) renderLearn();
  els.learnModal.hidden = !open;
  if (open) setTimeout(() => els.learnText.focus(), 0);
}
async function analyzeStyle() {
  if (!state.ai) { toast('Analiza stylu wymaga AI — AI jest teraz niedostępne.', 'warn'); return; }
  const body = {
    samples: profile.samples.map(({ text, lang }) => ({ text, lang })),
    edits: styleExamples.map(({ ai, final }) => ({ ai, final })),
    conclusionRemoved: learned.conclusionRemoved,
    conclusionAdded: learned.conclusionAdded,
    restored: learned.restored,
    answers: profile.answers,
    translations: (learned.translations || []).map(({ en, pl }) => ({ en, pl })),
    glossary: profile.glossary.map(({ en, pl }) => ({ en, pl })),
    profile: { rules: profile.rules, phrases: profile.phrases },
  };
  els.learnAnalyze.disabled = true;
  els.learnAnalyze.classList.add('busy');
  els.learnStatus.textContent = 'AI analizuje Twój styl… (zwykle 20–60 s)';
  try {
    const res = await fetch('/api/learn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
    profile = { ...profile, rules: data.rules || [], phrases: data.phrases || [], glossary: mergeGlossary(data.glossary || [], profile.glossary), summary: data.summary || '', questions: data.questions || [], analyzedAt: Date.now(), itemsAtAnalysis: learnedItems() };
    saveProfile();
    els.learnStatus.textContent = `Gotowe: ${profile.rules.length} reguł, ${profile.phrases.length} sformułowań, ${profile.glossary.length} terminów EN→PL${profile.questions.length ? `, ${profile.questions.length} ${profile.questions.length === 1 ? 'pytanie' : 'pytania'} poniżej` : ''}. AI będzie się ich trzymać w każdym opisie.`;
    toast('Styl przeanalizowany — reguły zapisane', 'ok');
  } catch (err) {
    els.learnStatus.textContent = `Nie udało się: ${err.message}`;
    toast(`Analiza nie powiodła się: ${err.message}`, 'err', 5000);
  } finally {
    els.learnAnalyze.disabled = false;
    els.learnAnalyze.classList.remove('busy');
  }
}
function answerQuestion(i, skip = false) {
  const q = profile.questions[i];
  if (!q) return;
  if (!skip) {
    const final = els.learnQuestions.querySelector(`[data-q-text="${i}"]`).value.trim();
    if (!final) { toast('Wpisz swoją wersję albo kliknij „Pomiń”.', 'warn'); return; }
    profile.answers = [...profile.answers, { question: q.question, suggestion: q.suggestion, final }].slice(-30);
    // the answer is also an exact phrase pair the report AI sees with every request
    if (final !== q.suggestion) styleExamples = addStyleExamples(styleExamples, [{ ai: q.suggestion, final }]);
    profile.phrases = [...profile.phrases.filter((p) => p.preferred !== final), { situation: q.question.slice(0, 160), preferred: final }].slice(-30);
    saveStyle();
  }
  profile.questions.splice(i, 1);
  saveProfile();
  if (!skip) toast('Zapisano — AI będzie tak pisać', 'ok', 2200);
}

// ---------------------------------------------------------------- conclusion points
let cpOpen = true;
let cpEditing = -1;
const cpHidden = new Set(); // points deleted for this report (not suggested again)
let cpOffList = []; // points unticked in this report — offered again exactly as they were

/** Conclusion lines: { main: [stripped lines], recs: 'recommendation paragraph' }. */
function splitConclusion(text) {
  const [main, ...recs] = String(text || '').split(/\n\n(?=[^\n]*$)/);
  const looksRec = recs.length && !/^\s*(?:[-–•]|\d+[.)])\s/.test(recs[0]);
  return {
    main: (looksRec ? main : String(text || '')).split('\n').map((l) => stripB(l)).filter(Boolean),
    recs: looksRec ? recs.join('\n\n').trim() : '',
  };
}
function joinConclusion(main, recs) {
  const t = template();
  const body = main.map((l, i) => (t?.bullet === 'number' ? `${i + 1}. ${l}` : `- ${l}`)).join('\n');
  return [body, recs].filter(Boolean).join('\n\n');
}
/** Points the radiologist may want: findings of the body not in the conclusion, template lines. */
function conclusionCandidates() {
  const t = template();
  if (!t) return [];
  const { main, recs } = splitConclusion(state.report.conclusion);
  const present = (x) => main.some((m) => m === x || similarity(m, x) >= 0.5) || recs.includes(x);
  const tplBody = new Set(splitSentences(t.body));
  const out = cpOffList.filter((x) => !present(x)).map((text) => ({ text, tag: 'wyłączone' }));
  const offered = (x) => out.some((o) => o.text === x || similarity(o.text, x) >= 0.5);
  for (const sentence of splitSentences(state.report.body)) {
    if (tplBody.has(sentence)) continue;
    const f = analyseFinding(sentence);
    if (!f.concepts.size) continue;
    const short = shortenFinding(sentence);
    if (short && !present(short) && !present(sentence) && !offered(short)) out.push({ text: short, tag: isIncidental(f) ? 'przewlekłe / incydentalne' : 'z opisu' });
  }
  for (const line of t.conclusion.split('\n').map(stripB).filter(Boolean)) if (!present(line) && !offered(line)) out.push({ text: line, tag: 'szablon' });
  const def = defaultConclusion(t);
  if (!present(def) && !offered(def)) out.push({ text: def, tag: 'norma' });
  return out.filter((o) => !cpHidden.has(o.text)).filter((o, i, a) => a.findIndex((x) => x.text === o.text) === i).slice(0, 8);
}
function renderCPoints() {
  if (!els.cpoints) return;
  const blank = !template();
  els.cpToggle.hidden = blank;
  if (blank) { els.cpoints.innerHTML = ''; return; }
  const { main, recs } = splitConclusion(state.report.conclusion);
  const cands = conclusionCandidates();
  els.cpCount.textContent = cands.length ? `Punkty · ${cands.length} propozycji` : 'Punkty';
  els.cpToggle.setAttribute('aria-expanded', String(cpOpen));
  els.cpoints.classList.toggle('closed', !cpOpen);
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const PEN = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
  const row = (text, i, on, tag = '') => `<div class="cp-row${on ? '' : ' off'}">
      <button class="cp-check" aria-pressed="${on}" ${on ? `data-cp-off="${i}"` : `data-cp-on="${esc(text)}"`} title="${on ? 'Wyłącz z wniosków' : 'Dodaj do wniosków'}">${on ? CHECK : ''}</button>
      <span class="cp-text">${on && cpEditing === i ? `<input data-cp-input="${i}" value="${esc(text)}" />` : `${esc(text)}${tag ? `<span class="cp-tag">${esc(tag)}</span>` : ''}`}</span>
      ${on ? `<button class="x-btn edit" data-cp-edit="${i}" title="Edytuj punkt">${PEN}</button>` : ''}
      <button class="x-btn" ${on ? `data-cp-del="${i}"` : `data-cp-hide="${esc(text)}"`} title="Usuń punkt">${X}</button>
    </div>`;
  els.cpoints.innerHTML = [
    ...main.map((l, i) => row(l, i, true)),
    recs ? row(recs, 'rec', true, 'zalecenie') : '',
    cands.length ? '<div class="cp-head">Proponowane — kliknij, aby dodać</div>' : '',
    ...cands.map((c) => row(c.text, -1, false, c.tag)),
  ].join('');
  if (cpEditing >= 0) { const inp = els.cpoints.querySelector('[data-cp-input]'); inp?.focus(); inp?.select(); }
}
function setConclusion(main, recs) {
  const next = { ...state.report, conclusion: joinConclusion(main, recs) };
  commit(next, { baseline: clone(state.report), warnings: state.warnings, corrections: state.corrections, source: state.source });
}
function cpAction(e) {
  const b = e.target.closest('button');
  if (!b) return;
  const { main, recs } = splitConclusion(state.report.conclusion);
  const ds = b.dataset;
  if (ds.cpOff !== undefined) {
    cpOffList = [...cpOffList.filter((x) => x !== (ds.cpOff === 'rec' ? recs : main[Number(ds.cpOff)])), ds.cpOff === 'rec' ? recs : main[Number(ds.cpOff)]];
    if (ds.cpOff === 'rec') setConclusion(main, '');
    else { main.splice(Number(ds.cpOff), 1); setConclusion(main, recs); }
  } else if (ds.cpDel !== undefined) {
    const text = ds.cpDel === 'rec' ? recs : main[Number(ds.cpDel)];
    cpHidden.add(text);
    if (ds.cpDel === 'rec') setConclusion(main, '');
    else { main.splice(Number(ds.cpDel), 1); setConclusion(main, recs); }
    toast('Punkt usunięty z wniosków — AI zapamięta to po skopiowaniu opisu', 'info', 2400);
  } else if (ds.cpHide !== undefined) {
    cpHidden.add(ds.cpHide);
    renderCPoints();
  } else if (ds.cpOn !== undefined) {
    const text = ds.cpOn;
    cpOffList = cpOffList.filter((x) => x !== text);
    if (/konsultacj|consultation/i.test(text) && !analyseFinding(text).concepts.size) { setConclusion(main, recs ? `${recs} ${text}` : text); return; }
    // pathology points go before the normal ("Bez …") lines
    const isPath = analyseFinding(text).concepts.size > 0;
    const firstNormal = main.findIndex((l) => !analyseFinding(l).concepts.size);
    if (isPath && firstNormal >= 0) main.splice(firstNormal, 0, text); else main.push(text);
    setConclusion(main, recs);
  } else if (ds.cpEdit !== undefined) {
    cpEditing = ds.cpEdit === 'rec' ? -1 : Number(ds.cpEdit);
    renderCPoints();
  }
}
function cpCommitEdit(input) {
  const i = Number(input.dataset.cpInput);
  const { main, recs } = splitConclusion(state.report.conclusion);
  const v = input.value.trim();
  cpEditing = -1;
  if (!v) main.splice(i, 1); else main[i] = /[.!?]$/.test(v) ? v : `${v}.`;
  setConclusion(main, recs);
}

// ---------------------------------------------------------------- original template: view, copy, restore
const stripB = (l) => l.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim();
const present = (sentence) => state.report.body.includes(sentence) || state.report.conclusion.includes(sentence);

/** Put a template sentence the app removed back where it was in the template. */
function restoreSentence(sentence, replaced = '') {
  const t = template();
  if (!t || !sentence || present(sentence)) return;
  const r = clone(state.report);
  const inConclusion = t.conclusion.split('\n').map(stripB).some((l) => l === sentence || splitSentences(l).includes(sentence));
  if (replaced && (r.body.includes(replaced) || r.conclusion.includes(replaced))) {
    // the sentence was rewritten: put the original wording back
    if (r.body.includes(replaced)) r.body = r.body.replace(replaced, sentence);
    else r.conclusion = r.conclusion.replace(replaced, sentence);
  } else if (inConclusion) {
    const [main, ...recs] = r.conclusion.split(/\n\n(?=[^\n]*$)/);
    const numbered = (main.match(/^\s*\d+[.)]/gm) || []).length;
    const line = t.bullet === 'number' ? `${numbered + 1}. ${sentence}` : `- ${sentence}`;
    r.conclusion = [main.trim() ? `${main.replace(/\s+$/, '')}\n${line}` : line, ...recs].join('\n\n');
  } else {
    // after the nearest earlier template sentence still in the report (or before the next one)
    const order = splitSentences(t.body);
    const at = order.indexOf(sentence);
    const lines = r.body.split('\n');
    const lineOf = (s) => lines.findIndex((l) => l.includes(s));
    let idx = -1;
    for (let k = at - 1; k >= 0 && idx < 0; k--) { const li = lineOf(order[k]); if (li >= 0) idx = li + 1; }
    for (let k = at + 1; k < order.length && idx < 0; k++) { const li = lineOf(order[k]); if (li >= 0) idx = li; }
    if (idx < 0) idx = lines.length;
    lines.splice(idx, 0, sentence);
    r.body = lines.join('\n');
  }
  if (!state.ignore.includes(sentence)) state.ignore.push(sentence); // the cross-check leaves it alone now
  learned.restored = addUnique(learned.restored, [sentence], 30);
  saveStyle();
  commit(r, { baseline: clone(state.report), warnings: state.warnings, corrections: state.corrections, source: state.source });
  if (!els.origModal.hidden) renderOriginal();
  toast('Zdanie szablonu przywrócone — AI nie usunie go ponownie w tym opisie', 'ok', 3200);
}

function renderOriginal() {
  const t = template();
  if (!t) return;
  els.origTitle.textContent = `Oryginalny szablon — ${t.title}`;
  const sent = (s) => {
    const gone = !present(s);
    return `<span class="o-sent${gone ? ' gone' : ''}" data-copy="${esc(s)}" title="${gone ? 'Usunięte z opisu — kliknij, aby skopiować' : 'Kliknij, aby skopiować'}">${esc(s)}</span>${gone ? `<button class="mini-btn accent o-restore" data-restore-s="${esc(s)}">Przywróć</button>` : ''}`;
  };
  const block = (text, isConclusion) => text.split('\n').map((line) => {
    if (!line.trim()) return '<div class="o-gap"></div>';
    if (/^[\p{L} ,/-]+:\s*$/u.test(line.trim())) return `<div class="o-head">${esc(line.trim())}</div>`;
    const bullet = isConclusion ? (line.match(/^\s*(?:[-–•]|\d+[.)])\s*/) || [''])[0] : '';
    const body = isConclusion ? line.slice(bullet.length) : line;
    const parts = splitSentences(body);
    return `<div class="o-line">${esc(bullet)}${(parts.length ? parts : [body.trim()]).map(sent).join(' ')}</div>`;
  }).join('');
  const removed = [...splitSentences(t.body), ...t.conclusion.split('\n').map(stripB).filter(Boolean)].filter((x) => !present(x)).length;
  els.origBody.innerHTML = `
    <p class="hint">Kliknij zdanie, aby je skopiować. <span class="o-legend">Zaznaczone</span> zdania nie występują w bieżącym opisie (usunięte lub zmienione) — „Przywróć” wstawia je z powrotem w to samo miejsce. ${removed ? `Usuniętych / zmienionych: ${removed}.` : ''}</p>
    <div class="o-exam">${esc(t.header)}</div>
    <div class="o-label">Opis</div>${block(t.body, false)}
    <div class="o-label">Wnioski</div>${block(t.conclusion, true)}`;
}
function openOriginal(open = true) {
  if (open && !template()) { toast('Najpierw wybierz szablon.', 'warn'); return; }
  if (open) renderOriginal();
  els.origModal.hidden = !open;
}

// ---------------------------------------------------------------- AI processing
/** Everything the server needs for one "prepare report" call. */
function formatPayload() {
  const t = template();
  return {
    templateId: t.id,
    template: rawOf(t),
    report: clone(state.report),
    dictation: scrubIdentifiers(els.dictation.value.trim()),
    instruction: scrubIdentifiers(els.instruction.value.trim()),
    clinical: scrubIdentifiers(els.clinical.value.trim()),
    style: els.stylePrefs.value,
    styleExamples: els.learnStyle.checked ? styleExamples.slice(-12).map(({ ai, final }) => ({ ai, final })) : [],
    learned: els.learnStyle.checked ? learnedFor(t.id) : null,
    profile: els.learnStyle.checked && (profile.rules.length || profile.phrases.length || profile.glossary.length) ? { rules: profile.rules, phrases: profile.phrases, glossary: profile.glossary.map(({ en, pl }) => ({ en, pl })) } : null,
    translations: els.learnStyle.checked && state.inputLang === 'en' ? translationsFor(t.id) : [],
    samples: els.learnStyle.checked ? samplesFor(state.outputLang) : [],
    keep: state.ignore.slice(-40),
    inputLang: state.inputLang,
    outputLang: state.outputLang,
    mode: state.aiMode,
    reportId: state.reportId,
  };
}
const payloadKey = (p) => JSON.stringify(p);

// When the server is busy (many radiologists at once) or the AI provider asks to slow down, a report the
// radiologist asked for is retried automatically (twice, after the wait the server suggests). Background
// pre-processing is never retried — "Przygotuj opis" does it when needed. A bare 502/503/504 without our JSON
// comes from the proxy while the server restarts (an update) — also retried.
const RETRY_CODES = new Set(['busy', 'ai_rate']);
async function callFormat(payload, attempt = 0) {
  const res = await fetch('/api/format', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (!payload.background && attempt < 2 && (RETRY_CODES.has(data.code) || ([502, 503, 504].includes(res.status) && !data.error))) {
      const wait = Math.min(15, Math.max(2, Number(res.headers.get('Retry-After')) || 5));
      toast(`Serwer AI jest teraz obciążony — ponawiam za ${wait} s…`, 'warn', wait * 1000);
      await new Promise((r) => setTimeout(r, wait * 1000));
      return callFormat(payload, attempt + 1);
    }
    throw new Error(data.error || `Błąd ${res.status}`);
  }
  return data;
}

// Background preparation while dictating: in each pause the current dictation is sent to the AI,
// so that "Przygotuj opis" can show the result at once. One request at a time; the latest wins.
const prefetch = { key: null, promise: null, result: null, inflight: false, again: false, timer: null };
const PREFETCH_DELAY = 1800;

function bgEnabled() { return els.bgProcess.checked && state.ai; }
function schedulePrefetch(delay = PREFETCH_DELAY) {
  clearTimeout(prefetch.timer);
  if (!bgEnabled()) return;
  prefetch.timer = setTimeout(runPrefetch, delay);
}
function runPrefetch() {
  if (!bgEnabled() || state.busy || isBlank()) return;
  const payload = formatPayload();
  if (!payload.dictation && !payload.instruction) return;
  const key = payloadKey(payload);
  if (key === prefetch.key) return;
  if (prefetch.inflight) { prefetch.again = true; return; }
  prefetch.key = key;
  prefetch.result = null;
  prefetch.inflight = true;
  renderPrepState();
  prefetch.promise = callFormat({ ...payload, background: true })
    .then((data) => { if (prefetch.key === key) prefetch.result = data; return data; })
    .finally(() => {
      prefetch.inflight = false;
      renderPrepState();
      if (prefetch.again) { prefetch.again = false; runPrefetch(); }
    });
  prefetch.promise.catch(() => { if (prefetch.key === key) prefetch.key = null; }); // retried by "Przygotuj opis"
}
function renderPrepState() {
  if (isBlank()) { els.prepState.hidden = true; return; }
  const p = formatPayload();
  const has = Boolean(p.dictation || p.instruction);
  const current = has && prefetch.key === payloadKey(p);
  const ready = current && prefetch.result;
  const working = current && prefetch.inflight;
  els.prepState.hidden = !(bgEnabled() && has && (ready || working));
  els.prepState.className = `prep-state${ready ? ' ready' : working ? ' working' : ''}`;
  els.prepState.textContent = ready ? 'Opis gotowy' : working ? 'AI przygotowuje w tle…' : '';
}
function onDictationChanged() {
  save();
  renderPrepState();
  schedulePrefetch();
}

async function process() {
  if (state.busy) return;
  if (state.recording) await stopRecording();
  if (document.activeElement?.isContentEditable) document.activeElement.blur();

  if (isBlank()) {
    const has = els.dictation.value.trim() || els.instruction.value.trim();
    state.prepareAfterPick = Boolean(has);
    toast(has ? 'Wybierz szablon — opis zostanie przygotowany zaraz po wyborze' : 'Najpierw wybierz szablon', 'info', 3600);
    openPicker();
    return;
  }
  const payload = formatPayload();
  const { dictation, instruction } = payload;
  if (!dictation && !instruction) {
    toast('Brak tekstu do opracowania — podyktuj lub wpisz opis.', 'warn');
    els.dictation.focus();
    return;
  }

  const t = template();
  const before = clone(state.report);
  const needsAI = state.inputLang === 'en' || state.outputLang === 'en' || before.lang === 'en';
  if (needsAI && !state.ai) {
    toast('Dyktowanie lub opis po angielsku wymaga AI — AI jest chwilowo niedostępne. Przełącz na PL.', 'warn', 5000);
    return;
  }
  let result = null;
  let source = '';
  let instant = false;
  const started = performance.now();
  clearTimeout(prefetch.timer);
  const key = payloadKey(payload);
  if (state.ai && prefetch.key === key && prefetch.result) instant = true;
  setBusy(true);
  try {
    if (state.ai) {
      try {
        let data = null;
        if (prefetch.key === key && prefetch.result) data = prefetch.result;
        else if (prefetch.key === key && prefetch.inflight) data = await prefetch.promise.catch(() => null);
        if (!data) data = await callFormat(payload);
        result = data;
        source = 'AI';
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
        toast('Polecenia dla AI wymagają połączenia z AI.', 'warn');
        return;
      }
      result = localMerge(t, before, dictation, { ignore: state.ignore, clinical: payload.clinical });
      source = 'Tryb lokalny';
    }
  } finally {
    setBusy(false);
  }

  commit(result.report, { baseline: before, warnings: result.warnings || [], corrections: result.corrections || [], source });
  state.lastAI = source.startsWith('AI') ? clone(result.report) : state.lastAI;
  if (payload.inputLang === 'en' && dictation && result.report.lang === 'pl') state.enDictations.push(dictation);
  els.dictation.value = '';
  els.instruction.value = '';
  chunkStack.length = 0;
  prefetch.key = null;
  prefetch.result = null;
  renderPrepState();
  save();

  const n = (result.corrections || []).length;
  const secs = ((performance.now() - started) / 1000).toFixed(1).replace('.', ',');
  toast(`${n ? `Opis gotowy · zmieniono ${n} ${n === 1 ? 'zdanie' : 'zdania'} szablonu` : 'Opis gotowy'} · ${instant ? 'przygotowany w tle' : `${secs} s`}`, 'ok', 3600);
  const firstMark = els.paper.querySelector('mark.add');
  firstMark?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---------------------------------------------------------------- new report (next patient)
async function newReport() {
  if (state.busy) return;
  const t = template();
  const pristine = !t || same({ ...state.report, lang: 'pl' }, reportFromTemplate(t));
  const copied = (state.copied && same(state.copied, state.report)) || today.items.some((x) => !x.unfinished && same(x.report, state.report));
  const pending = els.dictation.value.trim();
  if ((!pristine && !copied) || pending) {
    const what = pending && (pristine || copied) ? 'Dyktat nie został opracowany.' : 'Bieżący opis nie został skopiowany.';
    if (!(await askConfirm(`${what}\nZakończyć ten opis i zacząć nowy?`, { ok: 'Nowy opis' }))) return;
  }
  if (state.recording) await stopRecording();
  if (!pristine) { learnFromEdits(); archiveCurrent(); }
  els.dictation.value = '';
  els.instruction.value = '';
  els.clinical.value = '';
  renderClinical();
  els.interim.textContent = '';
  chunkStack.length = 0;
  state.ignore = [];
  state.copied = null;
  state.lastAI = null;
  state.reportId = newId();
  cpHidden.clear();
  cpOffList = [];
  state.enDictations = [];
  renderPrepState();
  if (!t && !pending) { openPicker(); return; } // already blank
  commit(blankReport(state.outputLang), { source: 'Brak szablonu' });
  els.reportScroll.scrollTo({ top: 0 });
  toast('Nowy opis — wybierz szablon (T). „Cofnij” przywróci poprzedni opis.', 'ok', 3200);
}

const AI_MODE_HINTS = {
  fast: 'Szybki — krótsze „zastanawianie się” AI; zalecany na co dzień.',
  accurate: 'Dokładny — AI dłużej analizuje opis; wolniej, przy trudnych przypadkach.',
  turbo: 'Turbo — szybsze generowanie tekstu (ok. 2× droższe); gdy niedostępne, używany jest tryb Szybki.',
};
function renderEnVariant() {
  els.enVariant.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === state.enVariant)));
}
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
    b.title = b.disabled ? 'Wymaga AI — AI jest teraz niedostępne' : '';
  });
  mark(els.inLang, state.inputLang);
  mark(els.outLang, state.outputLang);
  els.processBtn.dataset.langs = `Mówisz po ${state.inputLang === 'en' ? 'angielsku' : 'polsku'} → opis po ${state.outputLang === 'en' ? 'angielsku' : 'polsku'}`;
  els.processBtn.title = `${els.processBtn.dataset.langs} (Ctrl+Enter)`;
  els.dictation.lang = state.inputLang;
  els.dictation.placeholder = state.inputLang === 'en'
    ? 'Dictate or type in English… e.g. “left subdural haematoma, 8 mm thick, otherwise unremarkable”'
    : 'Dyktuj lub wpisz… np. „krwiak podtwardówkowy nad lewą półkulą grubości 8 mm, reszta bez zmian”';
}

async function setInputLang(lang) {
  if (lang === state.inputLang) return;
  if (lang === 'en' && !state.ai) return toast('Dyktowanie po angielsku wymaga AI.', 'warn');
  if (state.recording) await stopRecording();
  state.inputLang = lang;
  dictationEngine.lang = lang === 'en' ? state.enVariant : 'pl-PL';
  renderLangToggles();
  save();
  toast(lang === 'en' ? 'Dyktowanie: angielski (opis powstaje w wybranym języku opisu)' : 'Dyktowanie: polski', 'info');
}

async function setOutputLang(lang) {
  if (lang === state.outputLang && lang === state.report.lang) return;
  if (lang === 'en' && !state.ai) return toast('Opis po angielsku wymaga AI.', 'warn');
  state.outputLang = lang;
  renderLangToggles();
  save();
  await translateReport(lang);
}

/** Translate the current report (cached for untouched templates). */
async function translateReport(lang) {
  const r = state.report;
  if (r.lang === lang) return;
  if (isBlank()) { state.report = { ...r, lang }; renderReport(); return; }
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
    return toast('Tłumaczenie wymaga AI.', 'warn');
  }
  setBusy(true, lang === 'en' ? 'AI tłumaczy opis na angielski…' : 'AI tłumaczy opis na polski…');
  try {
    const res = await fetch('/api/format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: state.reportId, templateId: r.templateId, template: rawOf(template()), report: r, translate: true, inputLang: state.inputLang, outputLang: lang, style: els.stylePrefs.value, mode: state.aiMode }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
    if (pristine) translationCache.set(key, clone(data.report));
    commit(data.report, { warnings: data.warnings || [], source: `AI · tłumaczenie ${lang.toUpperCase()}` });
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
  els.processBtn.querySelector('.btn-label').textContent = busy ? 'Przygotowuję…' : 'Przygotuj opis';
  els.processBtn.title = `${state.ai ? 'AI wstawia dyktat do szablonu, sprawdza sprzeczności i pisze wnioski' : 'Wstawia dyktat do szablonu regułami lokalnymi'} — ${els.processBtn.dataset.langs || ''} (Ctrl+Enter)`;
  els.processing.hidden = !busy;
  els.processingText.textContent = label || (state.ai ? 'AI opracowuje opis…' : 'Wstawianie do szablonu…');
}

// ---------------------------------------------------------------- copy
/** Technical problems go to the organisation's IT console (codes only — never report text). */
function reportProblem(kind, code, detail = '') {
  window.dispatchEvent(new CustomEvent('radiopis:problem', { detail: { kind, code, detail } }));
}

async function copyReport() {
  if (isBlank()) { toast('Brak opisu do skopiowania — wybierz szablon.', 'warn'); return; }
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
    learnFromEdits();
    archiveCurrent();
    els.copyBtn.classList.add('done');
    els.copyBtn.querySelector('.btn-label').textContent = 'Skopiowano';
    setTimeout(() => {
      els.copyBtn.classList.remove('done');
      els.copyBtn.querySelector('.btn-label').textContent = 'Kopiuj opis';
    }, 1800);
    toast(liveConflicts.length ? 'Skopiowano — uwaga: w opisie są nierozwiązane sprzeczności' : 'Skopiowano do schowka — wklej do RIS (Ctrl+V)', liveConflicts.length ? 'warn' : 'ok', 3600);
  } else {
    toast('Nie udało się skopiować — zaznacz tekst ręcznie.', 'err');
    reportProblem('clipboard', 'denied');
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
  Neck: '<path d="M9 3v5c0 2-2 3-2 6v7M15 3v5c0 2 2 3 2 6v7"/><path d="M10 12h4"/>',
  Heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  'Pelvis / Hips': '<path d="M4 8c2 0 4 1 5 3l3 2 3-2c1-2 3-3 5-3"/><circle cx="7.5" cy="15.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>',
  'Upper limb': '<path d="M7 3l2 8-2 5 3 5M12 11l3 1 3 4"/>',
  'Lower limb': '<path d="M10 3l-1 9 1 6-2 3h4M14 3l1 9-1 6"/>',
  Paediatric: '<circle cx="12" cy="7" r="3"/><path d="M8 21v-5l-2-3 6-2 6 2-2 3v5"/>',
  Combined: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
};
const picker = { group: 'Non-trauma', mod: 'all', active: 0, items: [] };
// Modality filter for the (large) template library: TK / MR / RTG / USG.
const MODALITIES = [['all', 'Wszystkie'], ['ct', 'TK'], ['mr', 'MR'], ['xr', 'RTG'], ['us', 'USG']];
function modalityOf(t) {
  const id = t.id || '';
  const title = t.title || '';
  const exam = t.exam || '';
  if (/^(mr|mra|mrv)_/.test(id) || /^(MR|MRA|MRV)\b/.test(title) || /^(MR|Rezonans|Angio-MR|MRCP)\b/i.test(exam)) return 'mr';
  if (/^us_/.test(id) || /^USG\b/i.test(title) || /^USG\b/i.test(exam)) return 'us';
  if (/^(xr|fl|mmg|dxa)_/.test(id) || /^RTG\b/i.test(title) || /^(RTG|Zdjęcie|Mammografi|Densytometri|Urografia klasyczna|Badanie kontrastowe)/i.test(exam)) return 'xr';
  return 'ct';
}
const modMatch = (t) => picker.mod === 'all' || modalityOf(t) === picker.mod;

function openPicker() {
  picker.group = template()?.group || getTemplate(state.recent[0])?.group || picker.group;
  els.pickerSearch.value = '';
  els.picker.hidden = false;
  renderPicker();
  setTimeout(() => els.pickerSearch.focus(), 0);
}
function closePicker() {
  els.picker.hidden = true;
  if (isBlank()) state.prepareAfterPick = false;
}

const PENCIL = '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>';
function itemButton(t, { tag = '' } = {}) {
  const cur = t.id === state.report.templateId;
  const badge = t.custom ? '<span class="t-badge">mój</span>' : t.edited ? '<span class="t-badge edited">zmieniony</span>' : '';
  return `<div class="t-row"><button class="t-item${cur ? ' current' : ''}" data-id="${esc(t.id)}" title="${esc(t.exam)}">${esc(t.title)}${badge}${tag ? `<span class="tag">${esc(tag)}</span>` : ''}</button><button class="t-edit" data-edit="${esc(t.id)}" title="Edytuj szablon" aria-label="Edytuj szablon ${esc(t.title)}">${PENCIL}</button></div>`;
}

function renderPicker() {
  const q = fold(els.pickerSearch.value.trim());
  els.pickerTabs.innerHTML = GROUPS.map((g) => {
    const n = TEMPLATES.filter((t) => t.group === g.id && modMatch(t)).length;
    const trauma = g.id === 'Trauma';
    return `<button class="tab${trauma ? ' trauma' : ''}" role="tab" aria-selected="${!q && picker.group === g.id}" data-group="${g.id}"><span class="dotc"></span>${g.label}<span class="count">${n}</span></button>`;
  }).join('') + `<span class="tab-sep" aria-hidden="true"></span>${MODALITIES.map(([id, label]) => `<button class="tab mod" aria-selected="${picker.mod === id}" data-mod="${id}" title="${id === 'all' ? 'Wszystkie metody' : `Tylko ${label}`}">${label}</button>`).join('')}`;
  const recent = state.recent.map(getTemplate).filter(Boolean);
  els.pickerRecent.innerHTML = recent.length && !q
    ? `<span class="lbl">Ostatnie</span>${recent.map((t) => `<button class="chip-btn" data-id="${t.id}">${esc(t.title)}</button>`).join('')}`
    : '';

  if (q) {
    const tokens = q.split(/\s+/);
    const scored = TEMPLATES.filter(modMatch).map((t) => {
      const title = fold(`${t.title} ${t.titleEn || ''} ${t.exam}`); // Polish name, former English name, exam line
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
    const regions = templatesByRegion(picker.group).map((r) => ({ ...r, templates: r.templates.filter(modMatch) })).filter((r) => r.templates.length);
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
  if (!els.tplEditor.hidden) return;
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

// ---------------------------------------------------------------- template editor
const editor = { id: null, isNew: true };

function setEditorGroup(g) {
  els.tplGroup.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === g)));
}
function editorGroup() {
  return els.tplGroup.querySelector('[aria-pressed="true"]')?.dataset.group || 'Non-trauma';
}
function checkEditorText() {
  const text = els.tplText.value.trim();
  if (!text) { els.tplCheck.textContent = 'Wpisz treść szablonu.'; els.tplCheck.classList.add('bad'); return; }
  const t = parseTemplate({ id: 'x', title: 'x', text });
  const bodyLines = t.body.split('\n').filter((l) => l.trim()).length;
  const concl = t.conclusion.split('\n').filter((l) => l.trim()).length;
  const ok = concl > 0 && bodyLines > 0;
  els.tplCheck.classList.toggle('bad', !ok);
  els.tplCheck.textContent = ok
    ? `Badanie: „${t.exam}” · Opis: ${bodyLines} linii · Wnioski: ${concl} ${concl === 1 ? 'linia' : 'linie'}`
    : 'Brakuje części „Opis:” lub „Wnioski:” — pierwsza linia to nazwa badania, potem „Opis:”, opis, „Wnioski:” i wnioski (- …).';
}

/** Open the editor for an existing template (id) or a new one (prefill = raw fields). */
function openEditor(id, prefill = null) {
  const t = id ? getTemplate(id) : null;
  editor.id = t ? t.id : null;
  editor.isNew = !t;
  const raw = t ? rawOf(t) : { title: '', group: picker.group || 'Non-trauma', section: template()?.section || 'CT Head', text: '', ...(prefill || {}) };
  els.tplEditorTitle.textContent = t ? `Edycja: ${t.title}` : 'Nowy szablon';
  els.tplName.value = raw.title;
  setEditorGroup(raw.group);
  els.tplRegionSelect.innerHTML = REGIONS.map((r) => `<option value="${esc(r.id)}"${r.id === raw.section ? ' selected' : ''}>${esc(r.label)}</option>`).join('');
  els.tplText.value = raw.text;
  const builtin = t && isBuiltin(t.id);
  els.tplDelete.hidden = !t;
  els.tplDelete.textContent = builtin ? (userTemplates.edited[t.id] ? 'Przywróć oryginał' : 'Ukryj') : 'Usuń';
  els.tplDelete.title = builtin ? (userTemplates.edited[t.id] ? 'Cofnij moje zmiany w tym szablonie' : 'Ukryj ten szablon z menu') : 'Usuń ten szablon';
  els.tplDuplicate.hidden = !t;
  checkEditorText();
  els.tplEditor.hidden = false;
  setTimeout(() => (t ? els.tplText : els.tplName).focus(), 0);
}
function closeEditor() { els.tplEditor.hidden = true; }

function afterTemplatesChanged(changedId) {
  saveUserTemplates();
  // keep the open report in sync if it is still the untouched template
  const t = template();
  if (!t) {
    if (state.report.templateId) commit(blankReport(state.report.lang), { source: 'Brak szablonu' }); // its template was removed
  } else if (changedId === t.id && state.history.length === 0 && state.report.lang === 'pl') {
    state.report = reportFromTemplate(t);
    renderReport();
  }
  renderTemplateButton();
  if (!els.picker.hidden) renderPicker();
}

function saveEditor() {
  const raw = cleanRaw({
    id: editor.isNew ? `custom_${Date.now()}` : editor.id,
    title: els.tplName.value,
    group: editorGroup(),
    section: els.tplRegionSelect.value,
    text: els.tplText.value,
    priority: editor.isNew ? 50 : getTemplate(editor.id)?.priority ?? 50, // keep its place in the menu
  });
  if (!raw) { toast('Podaj nazwę i treść szablonu.', 'warn'); return; }
  const wasCurrent = state.report.templateId === raw.id;
  const pristineBefore = wasCurrent && !isBlank() && same({ ...state.report, lang: 'pl' }, reportFromTemplate(template()));
  if (!editor.isNew && isBuiltin(raw.id)) userTemplates.edited[raw.id] = raw;
  else if (!editor.isNew) userTemplates.custom = userTemplates.custom.map((c) => (c.id === raw.id ? raw : c));
  else userTemplates.custom.push(raw);
  saveUserTemplates();
  if (pristineBefore) commit(reportFromTemplate(getTemplate(raw.id)), { source: 'Szablon' });
  addSample(raw.text, 'pl', 'szablon', raw.title);
  renderTemplateButton();
  if (!els.picker.hidden) renderPicker();
  closeEditor();
  toast(editor.isNew ? `Dodano szablon „${raw.title}”` : `Zapisano szablon „${raw.title}”`, 'ok');
  if (editor.isNew) { selectTemplate(raw.id); closePicker(); }
}

async function deleteFromEditor() {
  const t = getTemplate(editor.id);
  if (!t) return;
  if (isBuiltin(t.id)) {
    if (userTemplates.edited[t.id]) {
      if (!(await askConfirm(`Przywrócić oryginalną treść szablonu „${t.title}”?`, { ok: 'Przywróć' }))) return;
      delete userTemplates.edited[t.id];
    } else {
      if (!(await askConfirm(`Ukryć szablon „${t.title}” z menu?\nPrzywrócisz go importem lub czyszcząc dane przeglądarki.`, { ok: 'Ukryj', danger: true }))) return;
      userTemplates.deleted.push(t.id);
    }
  } else {
    if (!(await askConfirm(`Usunąć szablon „${t.title}”?`, { ok: 'Usuń', danger: true }))) return;
    userTemplates.custom = userTemplates.custom.filter((c) => c.id !== t.id);
  }
  closeEditor();
  afterTemplatesChanged(t.id);
  toast('Zmieniono szablony', 'ok');
}

function exportTemplates() {
  const data = { app: 'RadVox Pro', version: 1, exported: new Date().toISOString(), templates: userTemplates };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'radvox-szablony.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  const n = userTemplates.custom.length + Object.keys(userTemplates.edited).length;
  toast(`Wyeksportowano ${n} ${n === 1 ? 'szablon' : 'szablonów'} do pliku radvox-szablony.json`, 'ok');
}

async function importTemplates(file) {
  try {
    const data = JSON.parse(await file.text());
    const src = data?.templates || {};
    let n = 0;
    for (const [id, raw] of Object.entries(src.edited || {})) {
      const clean = cleanRaw({ ...raw, id });
      if (clean && builtinRaw(id)) { userTemplates.edited[id] = clean; n++; }
    }
    for (const raw of src.custom || []) {
      const clean = cleanRaw(raw);
      if (!clean) continue;
      const existing = userTemplates.custom.findIndex((c) => c.id === clean.id);
      if (existing >= 0) userTemplates.custom[existing] = clean;
      else userTemplates.custom.push(clean);
      n++;
    }
    afterTemplatesChanged(null);
    toast(n ? `Zaimportowano ${n} ${n === 1 ? 'szablon' : 'szablonów'}` : 'W pliku nie było szablonów', n ? 'ok' : 'warn');
  } catch {
    toast('To nie jest plik szablonów RadVox Pro.', 'err');
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
const chunkStack = []; // dictation text before each recognised fragment (for "cofnij to")

// Where spoken text goes: the dictation (default) or the clinical-details box.
let speechTarget = 'dictation';
let clinicalStartedRecording = false;
function setSpeechTarget(target) {
  speechTarget = target;
  document.body.classList.toggle('target-clinical', target === 'clinical');
  els.clinicalMic.setAttribute('aria-pressed', String(target === 'clinical'));
  if (target === 'dictation') clinicalStartedRecording = false;
}
function appendClinical(text) {
  if (!text) return;
  const chunk = tidy(convertSpokenFor(state.inputLang)(text), { closeSentences: false });
  const cur = els.clinical.value.replace(/\s+$/, '');
  if (!chunk) return;
  // continue the same sentence: "Ból brzucha, gorączka…" (not a new capital after the comma)
  const next = cur && !/[.!?]$/.test(cur) ? chunk.charAt(0).toLowerCase() + chunk.slice(1) : chunk.charAt(0).toUpperCase() + chunk.slice(1);
  els.clinical.value = cur ? `${cur}${/[.;,:]$/.test(cur) ? '' : ','} ${next}` : next;
  renderClinical();
}

function appendDictation(text) {
  if (speechTarget === 'clinical') { appendClinical(text); return; }
  const prev = els.dictation.value.replace(/\s+$/, '');
  chunkStack.push(els.dictation.value);
  if (chunkStack.length > 60) chunkStack.shift();
  const chunk = convertSpokenFor(state.inputLang)(text);
  els.dictation.value = tidy(prev ? `${prev} ${chunk}` : chunk, { closeSentences: false }) + ' ';
  els.dictation.scrollTop = els.dictation.scrollHeight;
}

function setDictation(value) {
  els.dictation.value = value;
  while (chunkStack.length && chunkStack[chunkStack.length - 1].length >= value.length) chunkStack.pop();
}

/** Run a spoken command (see voice-commands.js). */
function runVoiceCommand(part) {
  const v = els.dictation.value;
  // editing commands act on the clinical box while dictating into it
  if (speechTarget === 'clinical' && ['deleteSentence', 'deleteWord', 'undoChunk', 'clear'].includes(part.cmd)) {
    const c = els.clinical.value;
    els.clinical.value = part.cmd === 'deleteWord' ? dropLastWord(c).trim() : part.cmd === 'clear' ? '' : dropLastSentence(c.replace(/[;,]\s*/g, '. '), '').replace(/\.\s/g, ', ').trim();
    renderClinical();
    onDictationChanged();
    toast(COMMAND_LABELS[part.cmd], 'info', 1800);
    return;
  }
  switch (part.cmd) {
    case 'deleteSentence': setDictation(dropLastSentence(v, chunkStack[chunkStack.length - 1] ?? '')); break;
    case 'deleteWord': setDictation(dropLastWord(v)); break;
    case 'undoChunk': setDictation(chunkStack.length ? chunkStack[chunkStack.length - 1] : ''); break;
    case 'clear': setDictation(''); chunkStack.length = 0; break;
    case 'clinical': {
      // everything said from now on goes into the clinical details, until "koniec danych klinicznych"
      setSpeechTarget('clinical');
      appendClinical(part.text);
      toast('Dyktujesz dane kliniczne — powrót: „koniec danych klinicznych”', 'info', 3600);
      return;
    }
    case 'endClinical': setSpeechTarget('dictation'); break;
    case 'instruction': {
      const cur = els.instruction.value.trim();
      els.instruction.value = cur ? `${cur}; ${part.text}` : part.text;
      toast(`Polecenie dla AI: „${part.text}” — wykonane po „Przygotuj opis”`, 'info', 3600);
      return;
    }
    case 'prepare': setTimeout(process, 0); break;
    case 'copy': setTimeout(copyReport, 0); return;
    case 'stop': setTimeout(stopRecording, 0); break;
    default: return;
  }
  toast(COMMAND_LABELS[part.cmd], 'info', 1800);
}

const dictationEngine = new Dictation({
  lang: 'pl-PL',
  onFinal: (text) => {
    if (!text) return;
    for (const part of parseVoiceCommands(text)) {
      if (part.cmd) runVoiceCommand(part);
      else appendDictation(part.text);
    }
    onDictationChanged();
  },
  onInterim: (text) => { els.interim.textContent = text; },
  onStateChange: (on) => { if (!on && state.recording) stopRecording(); },
  onError: (msg, code) => { toast(msg, 'err', 5000); if (code) reportProblem('speech', code); },
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
  mic.setLed(true); // red light on the PowerMic
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
// Stopping only ends the dictation; the report is made with "Przygotuj opis".
async function stopRecording() {
  if (!state.recording || stopping) return;
  stopping = true;
  els.recState.textContent = 'Kończenie…';
  await dictationEngine.stop();
  meter.stop();
  clearInterval(timerId);
  state.recording = false;
  stopping = false;
  mic.setLed(false);
  document.body.classList.remove('recording');
  els.recBtn.setAttribute('aria-pressed', 'false');
  els.recBtn.setAttribute('aria-label', 'Rozpocznij dyktowanie');
  els.recState.textContent = 'Naciśnij, aby dyktować';
  els.interim.textContent = '';
  setSpeechTarget('dictation');
  schedulePrefetch(300);
}
const toggleRecording = () => (state.recording ? stopRecording() : startRecording());
// end of a press-and-hold: stop only what is running (never start)
const releaseRecording = () => { if (state.recording) stopRecording(); };
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

// ---------------------------------------------------------------- clock
const clockFmt = new Intl.DateTimeFormat('pl-PL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' });
function tickClock() {
  const now = new Date();
  els.clock.innerHTML = `<span class="c-date">${esc(clockFmt.format(now))}</span><span class="c-time">${esc(timeFmt.format(now))}</span>`;
  els.clock.dateTime = now.toISOString();
  if (today.date && today.date !== dayKey(now)) { loadToday(); renderTodayCount(); } // midnight: new day
}

// ---------------------------------------------------------------- today's reports
const TODAY_KEY = 'radvox.today.v1';
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
let today = { date: dayKey(), items: [] };
function loadToday() {
  try {
    const saved = JSON.parse(localStorage.getItem(TODAY_KEY) || 'null');
    today = saved && saved.date === dayKey() && Array.isArray(saved.items) ? saved : { date: dayKey(), items: [] };
  } catch { today = { date: dayKey(), items: [] }; }
  if (today.date !== dayKey()) today = { date: dayKey(), items: [] };
  saveToday();
}
function saveToday() {
  try { localStorage.setItem(TODAY_KEY, JSON.stringify(today)); } catch { /* ignore */ }
}
/** Keep the current report in today's list (one entry per report, updated on each copy). */
function archiveCurrent() {
  if (today.date !== dayKey()) loadToday();
  const t = template();
  if (!t) return;
  const report = clone(state.report);
  if (same({ ...report, lang: 'pl' }, reportFromTemplate(t))) return;
  const entry = { id: state.reportId, time: Date.now(), title: t.title, text: reportToText(report, t), report };
  if (today.items.some((x) => x.id !== entry.id && x.text === entry.text)) return; // e.g. brought back with "Cofnij"
  const i = today.items.findIndex((x) => x.id === entry.id);
  if (i >= 0) today.items[i] = { ...entry, time: today.items[i].time };
  else today.items.push(entry);
  saveToday();
  renderTodayCount();
}
function renderTodayCount() {
  const n = today.items.length;
  els.todayCount.textContent = String(n);
  els.todayCount.classList.toggle('zero', n === 0);
  els.todayBtn.title = `Dzisiejsze opisy: ${n} (D)`;
}
const summaryOf = (item) => {
  const lines = item.report.conclusion.split('\n').map((l) => l.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim()).filter(Boolean);
  return lines.join(' · ') || item.report.body.split('\n').find((l) => l.trim()) || '';
};
function renderToday() {
  const items = today.items.slice().sort((a, b) => b.time - a.time);
  els.todayTitle.textContent = `Dzisiejsze opisy (${items.length}) · ${clockFmt.format(new Date())}`;
  els.todayList.innerHTML = items.length
    ? items.map((it) => `<li class="today-item">
        <span class="time">${esc(timeFmt.format(new Date(it.time)))}</span>
        <span class="what"><span class="title">${esc(it.title)}${it.unfinished ? '<span class="t-badge edited">niedokończony</span>' : ''}</span><span class="sum" title="${esc(summaryOf(it))}">${esc(summaryOf(it))}</span></span>
        <span class="acts"><button class="mini-btn" data-today-copy="${esc(it.id)}">Kopiuj</button><button class="mini-btn accent" data-today-open="${esc(it.id)}">Otwórz</button></span>
      </li>`).join('')
    : '<li class="today-empty">Dziś nie skopiowano jeszcze żadnego opisu.</li>';
}
function openToday(open = true) {
  if (open) { if (today.date !== dayKey()) loadToday(); renderToday(); }
  els.todayModal.hidden = !open;
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (err) { reportProblem('clipboard', 'denied', err?.name || ''); return false; }
}
function openTodayItem(id) {
  const it = today.items.find((x) => x.id === id);
  if (!it) return;
  if (!getTemplate(it.report.templateId)) { toast('Szablon tego opisu już nie istnieje.', 'warn'); return; }
  archiveCurrent();
  state.reportId = it.id;
  state.lastAI = null;
  state.copied = clone(it.report);
  state.outputLang = it.report.lang === 'en' ? 'en' : 'pl';
  commit(clone(it.report), { source: 'Dzisiejsze opisy' });
  openToday(false);
  toast(`Otwarto opis z ${timeFmt.format(new Date(it.time))} — „Cofnij” wraca do poprzedniego`, 'info', 3200);
}

// ---------------------------------------------------------------- learn my style
const STYLE_KEY = 'radvox.style.v1';
let styleExamples = [];
function loadStyle() {
  try {
    const saved = JSON.parse(localStorage.getItem(STYLE_KEY) || '[]');
    styleExamples = Array.isArray(saved) ? saved.filter((x) => x && typeof x.ai === 'string' && typeof x.final === 'string') : [];
  } catch { styleExamples = []; }
}
function saveStyle() {
  try {
    localStorage.setItem(STYLE_KEY, JSON.stringify(styleExamples));
    localStorage.setItem(LEARNED_KEY, JSON.stringify(learned));
  } catch { /* ignore */ }
  renderStyle();
}
/** On copy: sentences the radiologist reworded after the AI wrote them become style examples. */
function learnFromEdits() {
  if (!els.learnStyle.checked || !state.lastAI || state.lastAI.templateId !== state.report.templateId) return;
  const ai = state.lastAI;
  const final = clone(state.report);
  state.lastAI = clone(state.report); // the same edits are not learned twice
  const pairs = styleExamplesFrom(ai, final);
  const concl = conclusionChanges(ai, final);
  const changed = reportChanged(ai, final);
  if (pairs.length) styleExamples = addStyleExamples(styleExamples, pairs);
  if (concl.removed.length) learned.conclusionRemoved = addUnique(learned.conclusionRemoved, concl.removed, 40);
  if (concl.added.length) learned.conclusionAdded = addUnique(learned.conclusionAdded, concl.added, 30);
  // the finished report itself is the best example of how the radiologist arranges a report
  if (changed && final.lang === 'pl') {
    const list = (learned.reports[final.templateId] || []).filter((r) => r.body !== final.body);
    learned.reports[final.templateId] = [...list, { body: final.body, conclusion: final.conclusion, at: Date.now() }].slice(-2);
    const ids = Object.keys(learned.reports);
    const last = (id) => learned.reports[id][learned.reports[id].length - 1]?.at || 0;
    if (ids.length > 40) delete learned.reports[ids.sort((a, b) => last(a) - last(b))[0]];
  }
  // English dictation → the Polish text the radiologist signed: an EN→PL learning pair
  let pairAdded = false;
  if (state.enDictations.length && final.lang === 'pl') {
    const t = template();
    const tpl = new Set(t ? [...splitSentences(t.body), ...t.conclusion.split('\n').map(stripB)] : []);
    const own = [...splitSentences(final.body), ...final.conclusion.split('\n').map(stripB)].filter((x) => x && !tpl.has(x));
    if (own.length) {
      learned.translations = [...(learned.translations || []).filter((x) => x.id !== state.reportId), { id: state.reportId, templateId: final.templateId, en: state.enDictations.join('\n'), pl: own.join('\n'), at: Date.now() }].slice(-30);
      pairAdded = true;
    }
  }
  if (!pairs.length && !concl.removed.length && !concl.added.length && !changed && !pairAdded) return;
  saveStyle();
  const n = pairs.length + concl.removed.length + concl.added.length;
  toast(n ? `Zapamiętano ${n} ${n === 1 ? 'Twoją poprawkę' : 'Twoich poprawek'} — AI uwzględni je w następnych opisach` : 'Zapamiętano układ Twojego opisu', 'info', 2600);
}

// What the app learned, sent to the AI (only for the current template's example reports).
const LEARNED_KEY = 'radvox.learned.v1';
let learned = { conclusionRemoved: [], conclusionAdded: [], restored: [], reports: {}, translations: [] };
function loadLearned() {
  try {
    const saved = JSON.parse(localStorage.getItem(LEARNED_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      learned = {
        conclusionRemoved: Array.isArray(saved.conclusionRemoved) ? saved.conclusionRemoved : [],
        conclusionAdded: Array.isArray(saved.conclusionAdded) ? saved.conclusionAdded : [],
        restored: Array.isArray(saved.restored) ? saved.restored : [],
        reports: saved.reports && typeof saved.reports === 'object' ? saved.reports : {},
        translations: Array.isArray(saved.translations) ? saved.translations : [],
      };
    }
  } catch { /* ignore */ }
}
function learnedFor(templateId) {
  const reports = (learned.reports[templateId] || []).map(({ body, conclusion }) => ({ body, conclusion }));
  return { conclusionRemoved: learned.conclusionRemoved, conclusionAdded: learned.conclusionAdded, restored: learned.restored, exampleReports: reports };
}
function renderStyle() {
  const n = styleExamples.length;
  const nReports = Object.values(learned.reports).reduce((a, r) => a + r.length, 0);
  const total = n + learned.conclusionRemoved.length + learned.conclusionAdded.length + learned.restored.length + nReports;
  els.styleCount.textContent = total ? `${total}` : '';
  els.clearStyle.hidden = !total;
  els.learnSummary.textContent = total
    ? `Poprawki sformułowań: ${n} · usunięte z wniosków: ${learned.conclusionRemoved.length} · dodane do wniosków: ${learned.conclusionAdded.length} · przywrócone zdania szablonu: ${learned.restored.length} · Twoje wzorcowe opisy: ${nReports}`
    : 'Jeszcze nic — RadVox Pro uczy się, gdy poprawiasz opis przed skopiowaniem.';
  els.styleList.innerHTML = styleExamples.slice().reverse().slice(0, 30).map((p, i) => `<li><del>${esc(p.ai)}</del><ins>${esc(p.final)}</ins><button data-style-del="${n - 1 - i}" title="Zapomnij ten przykład" aria-label="Usuń przykład"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join('');
}

// ---------------------------------------------------------------- dictation button (PowerMic / key)
// 'toggle': press = start / press again = stop; 'hold': hold to talk, release = stop
let holdStarted = false;
const rawReports = [];
const mic = new MicButton({
  onPress: () => {
    if (state.busy) return;
    if (mic.mode === 'hold') holdStarted = !state.recording;
    toggleRecording();
  },
  onRelease: () => { if (holdStarted) { holdStarted = false; releaseRecording(); } },
  onChange: () => renderMic(),
  onRaw: (reportId, bytes) => {
    rawReports.push(`#${reportId}: ${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join(' ')}`);
    if (rawReports.length > 8) rawReports.shift();
    if (els.micDiagBox.open) renderMicDiag();
  },
});
function micReport() {
  const d = mic.diagnose();
  return [
    `Przeglądarka: ${navigator.userAgent}`,
    `WebHID: ${d.supported ? 'tak' : 'NIE'} · połączony: ${d.connected ? 'tak' : 'nie'} · tryb: ${d.mode === 'hold' ? 'przytrzymaj' : 'naciśnij'}`,
    `Urządzenie: ${d.product || '—'} (vendor ${d.vendorId}, product ${d.productId})`,
    `Kolekcje HID: ${d.collections.map((c) => `${c.usagePage}/${c.usage}${c.protected ? ' (zablokowana przez przeglądarkę)' : ''}`).join(', ') || '—'}`,
    `Odebrane raporty: ${d.reportsReceived} · przycisk: ${d.binding ? `raport ${d.binding.reportId}, bajt ${d.binding.byte}, maska 0x${d.binding.mask.toString(16)}` : 'nienauczony'}`,
    `Ostatnie dane: ${rawReports.length ? `\n  ${rawReports.join('\n  ')}` : '—'}`,
    `Dioda: ${d.led ? `${d.led.type} ${d.led.reportId}, bajt ${d.led.byte}, maska 0x${d.led.mask.toString(16)}` : 'nieustawiona'} · możliwe miejsca: ${d.leds} (standardowe: ${d.ledsStandard})${d.ledError ? ` · błąd: ${d.ledError}` : ''}`,
    `Wskazówka: ${d.hint}`,
  ].join('\n');
}
function renderMicDiag() { els.micDiag.textContent = micReport(); }
const KEY_NAMES = { Space: 'Spacja', Enter: 'Enter', Pause: 'Pause', ScrollLock: 'Scroll Lock', Insert: 'Insert' };
const keyLabel = (code) => KEY_NAMES[code] || code.replace(/^Key|^Digit/, '').replace(/^Numpad/, 'Num ');
let learningKey = false;
let keyHoldStarted = false;

function renderMic() {
  if (!mic.supported) {
    els.micStatus.textContent = 'Ta przeglądarka nie obsługuje WebHID (użyj Chrome lub Edge). Możesz przypisać klawisz poniżej.';
    els.micConnect.disabled = els.micConnectAny.disabled = true;
  } else if (mic.connected) {
    els.micStatus.textContent = mic.bound ? `Połączono: ${mic.name}. Przycisk nauczony — ${mic.mode === 'hold' ? 'przytrzymaj, aby dyktować' : 'naciśnij, aby zacząć / zakończyć dyktowanie'}.` : `Połączono: ${mic.name}. Kliknij „Naucz przycisk” i naciśnij przycisk nagrywania dwa razy.`;
  } else if (mic.known) {
    els.micStatus.textContent = `Zapamiętano: ${mic.name || 'urządzenie'} — niepodłączone. Podłącz mikrofon lub kliknij „Połącz PowerMic”.`;
  } else {
    els.micStatus.textContent = 'Nie połączono. Kliknij „Połącz PowerMic”, wybierz mikrofon z listy, a potem naucz przycisk.';
  }
  els.micLearn.hidden = !mic.connected;
  els.micModeToggle.checked = mic.mode === 'toggle';
  els.micModeHold.checked = mic.mode === 'hold';
  renderLed();
  if (els.micDiagBox.open) renderMicDiag();
  els.micForget.hidden = !mic.known;
  els.keyStatus.textContent = learningKey ? 'naciśnij klawisz…' : state.recordKey ? keyLabel(state.recordKey) : 'brak (Spacja / F2 zawsze działają)';
  els.keyClear.hidden = !state.recordKey;
  els.micHint.textContent = mic.connected && mic.bound ? 'mikrofon' : state.recordKey ? keyLabel(state.recordKey) : '';
  // on the main screen, right under the record button: a PowerMic that needs one click (never hidden in settings)
  // "Bez PowerMica": working with the computer's own microphone — no reminder until a dictation mic is plugged in
  const skipped = (() => { try { return localStorage.getItem(MIC_SKIP_KEY) === '1'; } catch { return false; } })();
  const showSetup = mic.needsSetup && (mic.connected || !skipped);
  els.micSetupRow.hidden = !showSetup;
  if (showSetup) {
    els.micSetup.textContent = !mic.connected
      ? 'PowerMic niepołączony — kliknij tutaj'
      : `${mic.replaced ? 'Nowy mikrofon' : 'Mikrofon'} — kliknij tutaj i naciśnij przycisk nagrywania 2×`;
  }
}
const MIC_SKIP_KEY = 'radvox.micskip.v1';
function skipMicSetup() {
  try { localStorage.setItem(MIC_SKIP_KEY, '1'); } catch { /* private mode: hidden until reload */ }
  els.micSetupRow.hidden = true;
  toast('Dobrze — dyktujesz mikrofonem komputera: przycisk na ekranie, Spacja lub F2. PowerMica połączysz kiedyś w ⚙ Ustawieniach.', 'info', 6000);
}
// one click from the main screen: connect (the browser asks once), learn the button, then find the red light
async function setupMicFromMain() {
  try { localStorage.removeItem(MIC_SKIP_KEY); } catch { /* ignore */ }
  openSettings(true);
  els.micStatus.scrollIntoView({ block: 'center' });
  if (!mic.connected) await connectMic(false);
  else await learnMicButton();
}
async function connectMic(any) {
  try {
    if (await mic.connect({ any })) {
      mic.autoLed();
      toast('Mikrofon połączony — naciśnij przycisk nagrywania, aby go nauczyć', 'info', 4000);
      learnMicButton();
    }
  } catch (err) {
    // the list was empty or closed: a newer model may introduce itself differently — the full list shows it
    if (err?.name === 'NotFoundError') { if (!any) toast('Nie było mikrofonu na liście? Kliknij „Inne urządzenie…” (obok „Połącz PowerMic”) — tam są wszystkie urządzenia; wybierz z nazwą PowerMic / Nuance / SpeechMike.', 'warn', 9000); }
    else { toast(`Nie udało się połączyć: ${err.message}`, 'err', 5000); reportProblem('mic', 'open-failed', err.message); }
  }
}
async function learnMicButton() {
  els.micStatus.textContent = 'Naciśnij teraz DWA RAZY przycisk nagrywania na mikrofonie (naciśnij – puść – naciśnij – puść)…';
  const r = await mic.learn();
  if (r.ok) {
    mic.replaced = false;
    toast(mic.mode === 'hold' ? 'Przycisk zapamiętany — przytrzymaj, aby dyktować' : 'Przycisk zapamiętany — naciśnij raz: dyktowanie, drugi raz: stop', 'ok', 4000);
    // the red light: automatic when the device declares one; otherwise go straight to "find the red light"
    if (!mic.autoLed() && mic.ledCandidates().length && ledStep < 0) setTimeout(() => ledTry(0), 1200);
  }
  else if (r.reason === 'no-data') { toast(mic.diagnose().hint, 'err', 10000); els.micDiagBox.open = true; }
  else toast('Nie rozpoznano przycisku — spróbuj jeszcze raz, naciskając tylko przycisk nagrywania (bez ruszania kulką / myszką).', 'warn', 7000);
  if (!r.ok) reportProblem('mic', r.reason, micReport());
  renderMic();
  renderMicDiag();
}

// red "recording" light: used automatically when the device declares one standard light; otherwise the user finds
// it once — each possible switch is turned on in turn and the user says whether the light came on
let ledStep = -1;
function renderLed() {
  els.micLedRow.hidden = !mic.connected;
  if (!mic.connected) return;
  const n = mic.ledCandidates().length;
  els.micLedStatus.textContent = mic.led ? 'Czerwona dioda: świeci podczas dyktowania.'
    : n ? 'Czerwona dioda: nieustawiona — kliknij „Znajdź czerwoną diodę” (trwa ok. minuty).'
      : 'Czerwona dioda: ten mikrofon nie pozwala przeglądarce sterować diodą. Dyktowanie działa normalnie.';
  els.micLedFind.hidden = !n || ledStep >= 0;
  els.micLedFind.textContent = mic.led ? 'Szukaj diody ponownie' : 'Znajdź czerwoną diodę';
  els.micLedTest.hidden = !mic.led || ledStep >= 0;
  els.micLedAsk.hidden = ledStep < 0;
}
async function ledTry(n) {
  if (n === 0) await mic.setLed(false);
  const c = await mic.tryLed(n);
  if (!c) {
    ledStep = -1;
    await mic.setLed(state.recording);
    toast('Nie znaleziono diody, którą przeglądarka może włączyć. Dyktowanie działa normalnie — tylko bez czerwonego światła.', 'warn', 7000);
    renderLed();
    return;
  }
  ledStep = n;
  els.micLedQ.textContent = `Próba ${n + 1} z ${mic.ledCandidates().length}: czy czerwona dioda na mikrofonie świeci TERAZ?`;
  renderLed();
}
async function ledDone(found) {
  const c = mic.ledCandidates()[ledStep];
  if (c) await mic.setLed(false, c);
  ledStep = -1;
  if (found && c) { mic.saveLed(c); toast('Dioda zapamiętana — będzie świecić podczas dyktowania', 'ok', 4000); }
  await mic.setLed(state.recording);
  renderLed();
}

// microphones on this computer: list + level test (dictation itself uses the browser's default microphone)
const inputTester = new InputTester();
let inputTestTimer = 0;
async function renderInputs() {
  const list = await listInputs();
  const def = list.find((d) => d.deviceId === 'default');
  const defName = def?.label ? ` — ${def.label.replace(/^(default|domyślne|domyślny)\s*-\s*/i, '')}` : '';
  const cur = els.audioInput.value;
  const others = list.filter((d) => d.deviceId && !['default', 'communications'].includes(d.deviceId));
  els.audioInput.innerHTML = `<option value="">Domyślny (ten dyktuje)${esc(defName)}</option>${others.map((d, i) => `<option value="${esc(d.deviceId)}">${esc(d.label || `Mikrofon ${i + 1}`)}</option>`).join('')}`;
  els.audioInput.value = [...els.audioInput.options].some((o) => o.value === cur) ? cur : '';
  if (!inputTester.running) {
    els.audioStatus.textContent = !list.length ? 'Nie wykryto mikrofonu — podłącz mikrofon albo sprawdź, czy nie jest wyłączony w Windows (Ustawienia → Prywatność → Mikrofon).'
      : `Wykryte mikrofony: ${others.length || list.length}. Wybierz jeden i kliknij „Sprawdź mikrofon”.`;
  }
}
function stopInputTest() {
  clearTimeout(inputTestTimer);
  if (!inputTester.running) return;
  const heard = inputTester.peak >= 0.04;
  inputTester.stop();
  els.audioTest.textContent = 'Sprawdź mikrofon';
  els.audioLevelWrap.hidden = true;
  els.audioStatus.textContent = heard ? 'Mikrofon działa — słychać głos.' : 'Nie usłyszano dźwięku. Sprawdź, czy mikrofon nie jest wyciszony (przełącznik / Windows → Dźwięk → Wejście) lub wybierz inny.';
}
async function startInputTest() {
  if (inputTester.running) { stopInputTest(); return; }
  try {
    const name = await inputTester.start(els.audioInput.value, (lvl) => { els.audioLevel.style.width = `${Math.round(lvl * 100)}%`; });
    els.audioTest.textContent = 'Zakończ test';
    els.audioLevelWrap.hidden = false;
    els.audioStatus.textContent = `Słucham: ${name || 'mikrofon'}. Powiedz coś — pasek powinien się poruszać.`;
    inputTestTimer = setTimeout(stopInputTest, 12000);
    renderInputs(); // names are visible once the microphone is allowed
  } catch (err) {
    els.audioStatus.textContent = inputError(err);
  }
}

// ---------------------------------------------------------------- AI status
async function checkStatus() {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    const data = await res.json();
    state.ai = Boolean(data.ai);
    state.model = data.model;
    if (data.version) els.versionInfo.textContent = `RadVox Pro ${data.version}${data.user ? ` · ${data.user.email}` : ''}`;
  } catch {
    state.ai = false;
  }
  els.aiStatus.classList.toggle('ok', state.ai);
  els.aiStatus.classList.toggle('local', !state.ai);
  els.aiStatus.querySelector('.label').textContent = state.ai ? 'AI: włączone' : 'Tryb lokalny (bez AI)';
  els.aiStatus.title = state.ai ? `Model: ${state.model}` : 'AI chwilowo niedostępne — dyktat jest wstawiany i sprawdzany regułami lokalnymi.';
  if (!state.ai) {
    state.inputLang = 'pl';
    state.outputLang = state.report.lang;
  }
  dictationEngine.lang = state.inputLang === 'en' ? state.enVariant : 'pl-PL';
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
  els.dictation.addEventListener('input', () => { chunkStack.length = 0; onDictationChanged(); });
  els.instruction.addEventListener('input', onDictationChanged);
  els.clinical.addEventListener('input', () => { renderClinical(); onDictationChanged(); });
  els.clinicalMic.addEventListener('click', async () => {
    if (speechTarget === 'clinical') {
      const stop = clinicalStartedRecording;
      setSpeechTarget('dictation');
      if (stop && state.recording) await stopRecording();
      return;
    }
    if (!state.recording) {
      startRecording();
      if (!state.recording) return;
      setSpeechTarget('clinical');
      clinicalStartedRecording = true;
    } else {
      setSpeechTarget('clinical');
    }
    toast('Dyktujesz dane kliniczne — kliknij ponownie lub powiedz „koniec danych klinicznych”', 'info', 3600);
  });
  // clicking into the dictation box sends speech back there
  els.dictation.addEventListener('focus', () => { if (speechTarget === 'clinical') setSpeechTarget('dictation'); });
  els.clinical.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); els.dictation.focus(); } });
  els.stylePrefs.addEventListener('input', save);
  els.bgProcess.addEventListener('change', () => { save(); renderPrepState(); schedulePrefetch(300); });
  els.learnStyle.addEventListener('change', save);
  els.clearStyle.addEventListener('click', async () => {
    if (!(await askConfirm('Zapomnieć wszystko, czego RadVox Pro nauczył się z Twoich poprawek?', { ok: 'Zapomnij', danger: true }))) return;
    styleExamples = [];
    learned = { conclusionRemoved: [], conclusionAdded: [], restored: [], reports: {}, translations: [] };
    saveStyle();
  });
  els.styleList.addEventListener('click', (e) => {
    const b = e.target.closest('[data-style-del]');
    if (!b) return;
    styleExamples.splice(Number(b.dataset.styleDel), 1);
    saveStyle();
  });

  // learning module
  els.learnBtn.addEventListener('click', () => openLearn(true));
  els.closeLearn.addEventListener('click', () => openLearn(false));
  els.learnModal.addEventListener('click', (e) => {
    if (e.target === els.learnModal) return openLearn(false);
    const ds = e.target.closest('button')?.dataset || {};
    if (ds.lang) { learnSampleLang = ds.lang; els.learnText.lang = ds.lang; renderLearn(); return; }
    if (ds.delSample !== undefined) { profile.samples.splice(Number(ds.delSample), 1); saveProfile(); return; }
    if (ds.delRule !== undefined) { profile.rules.splice(Number(ds.delRule), 1); saveProfile(); return; }
    if (ds.delPhrase !== undefined) { profile.phrases.splice(Number(ds.delPhrase), 1); saveProfile(); return; }
    if (ds.delGloss !== undefined) { profile.glossary.splice(Number(ds.delGloss), 1); saveProfile(); return; }
    if (ds.delPair !== undefined) { learned.translations.splice(Number(ds.delPair), 1); saveStyle(); renderLearn(); return; }
    if (ds.qOpt !== undefined) { els.learnQuestions.querySelector(`[data-q-text="${ds.qOpt}"]`).value = ds.text; return; }
    if (ds.qSave !== undefined) { answerQuestion(Number(ds.qSave)); return; }
    if (ds.qSkip !== undefined) { answerQuestion(Number(ds.qSkip), true); }
  });
  els.learnRules.addEventListener('focusout', (e) => {
    const el = e.target.closest('[data-rule]');
    if (!el) return;
    const v = el.innerText.trim();
    const i = Number(el.dataset.rule);
    if (v === profile.rules[i]) return;
    if (v) profile.rules[i] = v; else profile.rules.splice(i, 1);
    saveProfile();
  });
  els.learnAdd.addEventListener('click', () => {
    if (addSample(els.learnText.value, learnSampleLang)) { els.learnText.value = ''; toast('Przykład dodany — kliknij „Analizuj mój styl”, gdy dodasz kilka', 'ok', 3000); }
    else toast('Wklej najpierw tekst opisu lub sformułowania.', 'warn');
  });
  els.learnAnalyze.addEventListener('click', analyzeStyle);
  els.pairAdd.addEventListener('click', () => {
    const en = scrubIdentifiers(els.pairEn.value.trim());
    const pl = scrubIdentifiers(els.pairPl.value.trim());
    if (!en || !pl) { toast('Wpisz tekst angielski i swoją polską wersję.', 'warn'); return; }
    learned.translations = [...(learned.translations || []), { id: newId(), manual: true, en, pl, at: Date.now() }].slice(-30);
    els.pairEn.value = '';
    els.pairPl.value = '';
    saveStyle();
    renderLearn();
    toast('Para EN → PL zapisana — AI użyje jej przy angielskim dyktacie', 'ok');
  });
  const addGloss = () => {
    const en = els.glossEn.value.trim();
    const pl = els.glossPl.value.trim();
    if (!en || !pl) { toast('Wpisz termin angielski i polski.', 'warn'); return; }
    profile.glossary = [...profile.glossary.filter((g) => g.en.toLowerCase() !== en.toLowerCase()), { en, pl, manual: true }].slice(-80);
    els.glossEn.value = '';
    els.glossPl.value = '';
    saveProfile();
    els.glossEn.focus();
  };
  els.glossAdd.addEventListener('click', addGloss);
  els.glossPl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addGloss(); } });
  els.enVariant.addEventListener('click', (e) => {
    const b = e.target.closest('[data-variant]');
    if (!b) return;
    state.enVariant = b.dataset.variant;
    if (state.inputLang === 'en') dictationEngine.lang = state.enVariant;
    renderEnVariant();
    save();
  });
  const addRule = () => {
    const v = els.learnRuleInput.value.trim();
    if (!v) return;
    profile.rules = [...profile.rules, v].slice(-25);
    els.learnRuleInput.value = '';
    saveProfile();
  };
  els.learnRuleAdd.addEventListener('click', addRule);
  els.learnRuleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addRule(); } });
  els.learnOn.addEventListener('change', () => { els.learnStyle.checked = els.learnOn.checked; save(); renderLearnDot(); toast(els.learnOn.checked ? 'AI używa Twojego stylu' : 'AI nie używa Twojego stylu (nauka wyłączona)', 'info'); });
  els.learnForget.addEventListener('click', async () => {
    if (!(await askConfirm('Zapomnieć wszystko: przykłady, reguły, sformułowania, odpowiedzi i zapamiętane poprawki?', { ok: 'Zapomnij', danger: true }))) return;
    profile = { rules: [], phrases: [], glossary: [], summary: '', questions: [], answers: [], samples: [], analyzedAt: 0, itemsAtAnalysis: 0 };
    styleExamples = [];
    learned = { conclusionRemoved: [], conclusionAdded: [], restored: [], reports: {}, translations: [] };
    saveStyle();
    saveProfile();
  });

  // conclusion points
  els.cpToggle.addEventListener('click', () => { cpOpen = !cpOpen; try { localStorage.setItem('radvox.cpOpen', cpOpen ? '1' : '0'); } catch { /* ignore */ } renderCPoints(); });
  els.cpoints.addEventListener('click', cpAction);
  els.cpoints.addEventListener('keydown', (e) => {
    const inp = e.target.closest('[data-cp-input]');
    if (!inp) return;
    if (e.key === 'Enter') { e.preventDefault(); cpCommitEdit(inp); }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cpEditing = -1; renderCPoints(); }
  });
  els.cpoints.addEventListener('focusout', (e) => { const inp = e.target.closest('[data-cp-input]'); if (inp && cpEditing >= 0) cpCommitEdit(inp); });

  // original template
  els.origBtn.addEventListener('click', () => openOriginal(true));
  els.closeOrig.addEventListener('click', () => openOriginal(false));
  els.origCopyAll.addEventListener('click', async () => {
    const t = template();
    if (t) toast((await copyText(reportToText(reportFromTemplate(t), t))) ? 'Skopiowano oryginalny szablon' : 'Nie udało się skopiować.', 'ok');
  });
  els.origModal.addEventListener('click', async (e) => {
    if (e.target === els.origModal) return openOriginal(false);
    const r = e.target.closest('[data-restore-s]');
    if (r) { restoreSentence(r.dataset.restoreS); return; }
    const c = e.target.closest('[data-copy]');
    if (c) toast((await copyText(c.dataset.copy)) ? 'Skopiowano zdanie — wklej je w opisie (Ctrl+V)' : 'Nie udało się skopiować.', 'ok', 2200);
  });
  els.correctionsList.addEventListener('click', async (e) => {
    const r = e.target.closest('[data-restore]');
    const c = e.target.closest('[data-copy-corr]');
    if (r) { const x = state.corrections[Number(r.dataset.restore)]; if (x) restoreSentence(x.removed, x.replacement); }
    if (c) { const x = state.corrections[Number(c.dataset.copyCorr)]; if (x) toast((await copyText(x.removed)) ? 'Skopiowano zdanie szablonu' : 'Nie udało się skopiować.', 'ok', 2000); }
  });

  // today's reports
  els.todayBtn.addEventListener('click', () => openToday(true));
  els.closeToday.addEventListener('click', () => openToday(false));
  els.todayModal.addEventListener('click', async (e) => {
    if (e.target === els.todayModal) return openToday(false);
    const c = e.target.closest('[data-today-copy]');
    if (c) {
      const it = today.items.find((x) => x.id === c.dataset.todayCopy);
      if (it) toast((await copyText(it.text)) ? `Skopiowano opis z ${timeFmt.format(new Date(it.time))}` : 'Nie udało się skopiować.', 'ok');
      return;
    }
    const o = e.target.closest('[data-today-open]');
    if (o) openTodayItem(o.dataset.todayOpen);
  });
  els.todayClear.addEventListener('click', async () => {
    if (!(await askConfirm('Usunąć listę dzisiejszych opisów z tej przeglądarki?', { ok: 'Usuń', danger: true }))) return;
    today.items = [];
    saveToday();
    renderToday();
    renderTodayCount();
  });

  // dictation button
  els.micConnect.addEventListener('click', () => connectMic(false));
  els.micSetup.addEventListener('click', setupMicFromMain);
  els.micSkip.addEventListener('click', skipMicSetup);
  els.micConnectAny.addEventListener('click', () => connectMic(true));
  for (const r of [els.micModeToggle, els.micModeHold]) {
    r.addEventListener('change', () => {
      if (!r.checked) return;
      mic.setMode(r.value);
      toast(r.value === 'hold' ? 'Przytrzymaj przycisk, aby dyktować — puść, aby zakończyć' : 'Naciśnij, aby dyktować — naciśnij ponownie, aby zakończyć', 'info', 3000);
    });
  }
  els.micLedFind.addEventListener('click', () => ledTry(0));
  els.micLedYes.addEventListener('click', () => ledDone(true));
  els.micLedNo.addEventListener('click', () => ledTry(ledStep + 1));
  els.micLedStop.addEventListener('click', () => ledDone(false));
  els.micLedTest.addEventListener('click', async () => {
    const ok = await mic.setLed(true);
    if (!ok) toast(`Nie udało się włączyć diody${mic.ledError ? `: ${mic.ledError}` : ''}`, 'warn', 5000);
    setTimeout(() => mic.setLed(state.recording), 1500);
  });
  els.audioTest.addEventListener('click', startInputTest);
  els.audioInput.addEventListener('change', () => { if (inputTester.running) { stopInputTest(); startInputTest(); } });
  navigator.mediaDevices?.addEventListener?.('devicechange', renderInputs);
  els.micDiagBox.addEventListener('toggle', () => { if (els.micDiagBox.open) renderMicDiag(); });
  els.micDiagCopy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(micReport()); toast('Raport skopiowany — wklej go w zgłoszeniu do działu IT / wsparcia', 'ok', 4000); } catch { toast('Zaznacz tekst raportu i skopiuj ręcznie.', 'warn'); }
  });
  els.micLearn.addEventListener('click', learnMicButton);
  els.micForget.addEventListener('click', async () => { await mic.disconnect(); toast('Mikrofon odłączony', 'info'); });
  els.keyLearn.addEventListener('click', () => { learningKey = true; renderMic(); els.keyLearn.blur(); });
  els.keyClear.addEventListener('click', () => { state.recordKey = null; save(); renderMic(); });
  // capture phase: a learned key works everywhere, also while typing in the dictation box
  document.addEventListener('keydown', (e) => {
    if (learningKey) {
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      learningKey = false;
      if (e.key === 'Escape') { renderMic(); return; }
      if (e.key.length === 1 && !/^F\d+$/.test(e.code)) {
        toast('Wybierz klawisz, który nie wpisuje tekstu (np. F9, F10, Pause, Insert).', 'warn', 4000);
      } else {
        state.recordKey = e.code;
        save();
        toast(`Klawisz nagrywania: ${keyLabel(e.code)}`, 'ok');
      }
      renderMic();
      return;
    }
    if (state.recordKey && e.code === state.recordKey && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      if (!state.busy) {
        if (mic.mode === 'hold') keyHoldStarted = !state.recording;
        toggleRecording();
      }
    }
  }, true);
  // hold mode: releasing the key ends the dictation it started
  document.addEventListener('keyup', (e) => {
    if (!keyHoldStarted || e.code !== state.recordKey) return;
    e.preventDefault();
    e.stopPropagation();
    keyHoldStarted = false;
    releaseRecording();
  }, true);
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

  // blank start screen
  els.emptyPick.addEventListener('click', openPicker);
  els.emptyRecent.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) selectTemplate(b.dataset.id); });

  // template picker
  els.tplCurrent.addEventListener('click', openPicker);
  els.closePicker.addEventListener('click', closePicker);
  els.picker.addEventListener('click', (e) => {
    if (e.target === els.picker) return closePicker();
    const mod = e.target.closest('[data-mod]');
    if (mod) { picker.mod = mod.dataset.mod; renderPicker(); els.pickerSearch.focus(); return; }
    const tab = e.target.closest('[data-group]');
    if (tab) { picker.group = tab.dataset.group; els.pickerSearch.value = ''; renderPicker(); els.pickerSearch.focus(); return; }
    const edit = e.target.closest('[data-edit]');
    if (edit) { openEditor(edit.dataset.edit); return; }
    const item = e.target.closest('[data-id]');
    if (item) { selectTemplate(item.dataset.id); closePicker(); }
  });
  els.pickerSearch.addEventListener('input', renderPicker);
  els.newTplBtn.addEventListener('click', () => openEditor(null));
  els.tplMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); els.tplMenu.hidden = !els.tplMenu.hidden; });
  els.exportTpl.addEventListener('click', () => { els.tplMenu.hidden = true; exportTemplates(); });
  els.importTpl.addEventListener('click', () => { els.tplMenu.hidden = true; els.importFile.click(); });
  els.importFile.addEventListener('change', () => { if (els.importFile.files[0]) importTemplates(els.importFile.files[0]); els.importFile.value = ''; });
  document.addEventListener('click', (e) => { if (!els.tplMenu.hidden && !e.target.closest('#tplMenu') && e.target !== els.tplMenuBtn) els.tplMenu.hidden = true; });

  // template editor
  els.tplGroup.addEventListener('click', (e) => { const b = e.target.closest('[data-group]'); if (b) setEditorGroup(b.dataset.group); });
  els.tplText.addEventListener('input', checkEditorText);
  els.tplFromReport.addEventListener('click', () => {
    if (isBlank()) { toast('Brak bieżącego opisu — najpierw wybierz szablon.', 'warn'); return; }
    els.tplText.value = reportToText({ ...state.report, lang: 'pl' }, template());
    if (!els.tplName.value.trim()) els.tplName.value = `${template().title} (mój)`;
    checkEditorText();
  });
  els.tplSave.addEventListener('click', saveEditor);
  els.tplCancel.addEventListener('click', closeEditor);
  els.closeTplEditor.addEventListener('click', closeEditor);
  els.tplDelete.addEventListener('click', deleteFromEditor);
  els.tplDuplicate.addEventListener('click', () => {
    const t = getTemplate(editor.id);
    if (!t) return;
    openEditor(null, { ...rawOf(t), title: `${t.title} (kopia)`, text: els.tplText.value });
  });
  els.tplEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeEditor(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'Enter')) { e.preventDefault(); saveEditor(); }
  });
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
    if (!els.picker.hidden || !els.tplEditor.hidden) return; // picker / editor handle their own keys
    const typing = isTyping(document.activeElement);
    if (e.key === 'Escape') { openSettings(false); openHelp(false); openToday(false); openOriginal(false); openLearn(false); toggleSnippets(false); return; }
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
    if (e.key === 'o' || e.key === 'O') { e.preventDefault(); openOriginal(els.origModal.hidden); return; }
    if (e.key === 'd' || e.key === 'D') { e.preventDefault(); openToday(els.todayModal.hidden); return; }
    if (e.key === 'l' || e.key === 'L') { e.preventDefault(); setInputLang(state.inputLang === 'pl' ? 'en' : 'pl'); return; }
    if (e.key === '?') openHelp(true);
  });
  window.addEventListener('beforeunload', () => { if (state.recording) dictationEngine.stop(); });
  window.addEventListener('pagehide', () => { mic.setLed(false); inputTester.stop(); });
}

// ---------------------------------------------------------------- init
function init() {
  loadStyle();
  loadLearned();
  loadProfile();
  try { cpOpen = localStorage.getItem('radvox.cpOpen') !== '0'; } catch { /* ignore */ }
  loadToday();
  load();
  renderSnippets();
  renderReport();
  renderAiMode();
  renderEnVariant();
  renderStyle();
  renderTodayCount();
  tickClock();
  setInterval(tickClock, 10_000);
  bind();
  renderMic();
  mic.restore().then(() => { if (mic.connected) mic.autoLed(); renderMic(); });
  renderInputs();
  renderPrepState();
  renderClinical();
  renderLearnDot();
  if (!speechSupported) {
    els.speechBadge.hidden = false;
    els.speechInfo.textContent = 'Ta przeglądarka nie obsługuje rozpoznawania mowy (Web Speech API). Użyj Chrome lub Edge, albo wpisuj tekst ręcznie.';
  } else {
    els.speechInfo.textContent = 'Wbudowane rozpoznawanie mowy przeglądarki (język polski). W Chrome dźwięk jest przetwarzany przez serwery Google i wymaga internetu.';
  }
  checkStatus();
  // keep-alive for the desktop launcher (the background server stops when the window is closed)
  setInterval(() => { fetch('/api/status', { cache: 'no-store' }).catch(() => {}); }, 60_000);
  requestAnimationFrame(drawViz);
}

init();

// Exposed for automated UI tests.
window.__radvox = { profile: () => profile, conclusionCandidates, restoreSentence, openOriginal, learned: () => learned, state, process, copyReport, selectTemplate, newReport, runVoiceCommand, onFinal: (t) => dictationEngine.onFinal(t), prefetch, styleExamples: () => styleExamples, today: () => today, mic };

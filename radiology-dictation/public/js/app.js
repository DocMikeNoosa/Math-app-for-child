import { TEMPLATES, getTemplate, reportFromTemplate } from './templates.js';
import { convertSpoken, tidy, scrubIdentifiers, localMerge, wordDiff, reportToText } from './polish-text.js';
import { Dictation, LevelMeter, speechSupported } from './speech.js';

const $ = (id) => document.getElementById(id);
const els = {
  templates: $('templates'), recWrap: $('recWrap'), recBtn: $('recBtn'), recViz: $('recViz'),
  recState: $('recState'), recTimer: $('recTimer'), dictation: $('dictation'), interim: $('interim'),
  instruction: $('instruction'), processBtn: $('processBtn'), autoProcess: $('autoProcess'),
  clearDictation: $('clearDictation'), speechBadge: $('speechBadge'), aiStatus: $('aiStatus'),
  undoBtn: $('undoBtn'), redoBtn: $('redoBtn'), acceptBtn: $('acceptBtn'), resetBtn: $('resetBtn'),
  labelsToggle: $('labelsToggle'), copyBtn: $('copyBtn'), modalityBadge: $('modalityBadge'),
  examTitle: $('examTitle'), technique: $('technique'), sections: $('sections'), conclusion: $('conclusion'),
  warnings: $('warnings'), warningsList: $('warningsList'), processing: $('processing'), processingText: $('processingText'),
  footWords: $('footWords'), footSource: $('footSource'), footSaved: $('footSaved'), reportScroll: $('reportScroll'),
  settings: $('settings'), settingsBtn: $('settingsBtn'), closeSettings: $('closeSettings'), overlay: $('overlay'),
  stylePrefs: $('stylePrefs'), speechInfo: $('speechInfo'), helpBtn: $('helpBtn'), helpModal: $('helpModal'), closeHelp: $('closeHelp'),
  toasts: $('toasts'),
};

// ---------------------------------------------------------------- state
const STORE_KEY = 'radvox.v1';
const state = {
  ai: false,
  model: null,
  report: reportFromTemplate(TEMPLATES[0]),
  baseline: null, // report snapshot that highlights are computed against (null = no highlights)
  history: [],
  future: [],
  warnings: [],
  source: 'Szablon',
  busy: false,
  recording: false,
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const sameReport = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (!saved) return;
    const tpl = getTemplate(saved.report?.templateId);
    if (tpl && saved.report.sections?.length === tpl.sections.length) state.report = saved.report;
    els.dictation.value = saved.dictation || '';
    els.stylePrefs.value = saved.style || '';
    els.autoProcess.checked = saved.autoProcess !== false;
    els.labelsToggle.checked = Boolean(saved.labels);
  } catch { /* storage unavailable — start fresh */ }
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        report: state.report,
        dictation: els.dictation.value,
        style: els.stylePrefs.value,
        autoProcess: els.autoProcess.checked,
        labels: els.labelsToggle.checked,
      }));
      els.footSaved.textContent = 'Zapisano lokalnie';
    } catch {
      els.footSaved.textContent = 'Brak zapisu lokalnego';
    }
  }, 250);
}

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function highlighted(oldText, newText) {
  if (oldText == null || oldText === newText) return esc(newText);
  return wordDiff(oldText, newText)
    .map((seg) => (seg.added ? `<mark class="add">${esc(seg.text)}</mark>` : esc(seg.text)))
    .join('');
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

function currentTemplate() {
  return getTemplate(state.report.templateId);
}

// ---------------------------------------------------------------- rendering
function renderTemplates() {
  els.templates.innerHTML = '';
  TEMPLATES.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'tpl';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(t.id === state.report.templateId));
    b.dataset.id = t.id;
    b.innerHTML = `<span class="tpl-mod mod-${t.modality}">${t.modality}</span>
      <span class="tpl-text"><div class="tpl-name">${esc(t.name)}</div><div class="tpl-sub">${esc(t.subtitle)}</div></span>
      <span class="tpl-key">${i + 1}</span>`;
    b.addEventListener('click', () => { selectTemplate(t.id); b.blur(); });
    els.templates.appendChild(b);
  });
}

function renderReport({ flash = [] } = {}) {
  const r = state.report;
  const base = state.baseline;
  const tpl = currentTemplate();
  [...els.templates.children].forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === r.templateId)));

  els.modalityBadge.textContent = tpl.modality;
  els.modalityBadge.className = `modality-badge mod-${tpl.modality}`;
  els.examTitle.textContent = r.title;
  els.technique.innerHTML = highlighted(base?.technique, r.technique);

  els.sections.innerHTML = '';
  r.sections.forEach((s, i) => {
    const oldText = base ? base.sections[i]?.text : null;
    const changed = base && oldText !== s.text;
    const row = document.createElement('div');
    row.className = `sec${changed ? ' changed' : ''}${s.text.trim() ? '' : ' empty'}${flash.includes(s.id) ? ' flash' : ''}`;
    row.dataset.id = s.id;
    row.innerHTML = `<div class="sec-label">${esc(s.label)}</div>
      <div class="editable" contenteditable="true" spellcheck="true" lang="pl" data-sec="${i}">${highlighted(oldText, s.text)}</div>`;
    els.sections.appendChild(row);
  });

  const conclChanged = base && base.conclusion !== r.conclusion;
  els.conclusion.innerHTML = highlighted(base?.conclusion, r.conclusion);
  els.conclusion.parentElement.classList.toggle('changed', Boolean(conclChanged));

  renderWarnings();
  renderMeta();
}

function renderWarnings() {
  els.warningsList.innerHTML = state.warnings.map((w) => `<li>${esc(w)}</li>`).join('');
  els.warnings.hidden = state.warnings.length === 0;
}

function renderMeta() {
  els.undoBtn.disabled = state.history.length === 0;
  els.redoBtn.disabled = state.future.length === 0;
  els.acceptBtn.disabled = !state.baseline && state.warnings.length === 0;
  const words = reportToText(state.report).split(/\s+/).filter(Boolean).length;
  els.footWords.textContent = `${words} słów`;
  els.footSource.textContent = state.source;
}

// ---------------------------------------------------------------- report mutations
function commit(next, { baseline = null, warnings = [], source, flash = [] } = {}) {
  state.history.push(clone(state.report));
  if (state.history.length > 100) state.history.shift();
  state.future = [];
  state.report = next;
  state.baseline = baseline;
  state.warnings = warnings;
  if (source) state.source = source;
  renderReport({ flash });
  save();
}

function selectTemplate(id) {
  if (id === state.report.templateId) return;
  const tpl = getTemplate(id);
  const wasEdited = !sameReport(state.report, reportFromTemplate(currentTemplate()));
  commit(reportFromTemplate(tpl), { source: 'Szablon' });
  toast(wasEdited ? `Szablon: ${tpl.name} — „Cofnij” przywróci poprzedni opis` : `Szablon: ${tpl.name}`, 'info');
}

function undo() {
  if (!state.history.length) return;
  state.future.push(clone(state.report));
  state.report = state.history.pop();
  state.baseline = null;
  state.warnings = [];
  renderReport();
  save();
}

function redo() {
  if (!state.future.length) return;
  state.history.push(clone(state.report));
  state.report = state.future.pop();
  state.baseline = null;
  state.warnings = [];
  renderReport();
  save();
}

function acceptChanges() {
  state.baseline = null;
  state.warnings = [];
  renderReport();
  toast('Zmiany zaakceptowane', 'ok', 1600);
}

function resetReport() {
  commit(reportFromTemplate(currentTemplate()), { source: 'Szablon' });
  toast('Nowy opis z szablonu — „Cofnij” przywróci poprzedni', 'info');
}

// Manual edits in the report: sync DOM → state, record one undo step per focus session.
let editSnapshot = null;
function onEditFocus() { editSnapshot = clone(state.report); }
function onEditInput(e) {
  const el = e.target;
  if (el === els.examTitle) state.report.title = readEditable(el).replace(/\n/g, ' ');
  else if (el === els.technique) state.report.technique = readEditable(el);
  else if (el === els.conclusion) state.report.conclusion = readEditable(el);
  else if (el.dataset.sec != null) {
    const s = state.report.sections[Number(el.dataset.sec)];
    s.text = readEditable(el);
    el.parentElement.classList.toggle('empty', !s.text.trim());
  }
  renderMeta();
  save();
}
function onEditBlur() {
  if (editSnapshot && !sameReport(editSnapshot, state.report)) {
    state.history.push(editSnapshot);
    state.future = [];
    state.source = state.source.includes('edycja') ? state.source : `${state.source} + edycja`;
    renderMeta();
  }
  editSnapshot = null;
}

// ---------------------------------------------------------------- AI processing
async function process() {
  if (state.busy) return;
  if (state.recording) await stopRecording({ auto: false });
  if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();

  const dictation = scrubIdentifiers(els.dictation.value.trim());
  const instruction = scrubIdentifiers(els.instruction.value.trim());
  if (!dictation && !instruction) {
    toast('Brak tekstu do opracowania — podyktuj lub wpisz opis.', 'warn');
    els.dictation.focus();
    return;
  }

  const template = currentTemplate();
  const before = clone(state.report);
  let result = null;
  let source = '';

  setBusy(true);
  try {
    if (state.ai) {
      try {
        const res = await fetch('/api/format', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: template.id, report: before, dictation, instruction, style: els.stylePrefs.value }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Błąd ${res.status}`);
        result = data;
        source = `Claude · ${data.model || state.model}`;
      } catch (err) {
        toast(`${err.message} Użyto trybu lokalnego.`, 'err', 5000);
      }
    }
    if (!result) {
      if (!dictation) {
        toast('Polecenia dla AI wymagają połączenia z Claude.', 'warn');
        return;
      }
      result = localMerge(template, before, dictation);
      source = 'Tryb lokalny';
    }
  } finally {
    setBusy(false);
  }

  const flash = [...(result.changed || [])];
  commit(result.report, { baseline: before, warnings: result.warnings || [], source, flash });
  els.dictation.value = '';
  els.instruction.value = '';
  save();

  const nChanged = (result.changed || []).length + (result.conclusionChanged ? 1 : 0);
  toast(nChanged ? `Opis zaktualizowany (${nChanged} ${nChanged === 1 ? 'zmiana' : 'zmiany'}) — sprawdź podświetlenia` : 'Brak zmian w opisie', nChanged ? 'ok' : 'warn');
  const first = els.sections.querySelector('.sec.changed') || (result.conclusionChanged ? els.conclusion : null);
  first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setBusy(busy) {
  state.busy = busy;
  els.processBtn.disabled = busy;
  els.processBtn.classList.toggle('busy', busy);
  els.processBtn.querySelector('.btn-label').textContent = busy ? 'Opracowywanie' : state.ai ? 'Opracuj z AI' : 'Wstaw do szablonu';
  els.processing.hidden = !busy;
  els.processingText.textContent = state.ai ? 'Claude opracowuje opis…' : 'Wstawianie do szablonu…';
}

// ---------------------------------------------------------------- copy
async function copyReport() {
  if (document.activeElement && document.activeElement.isContentEditable) document.activeElement.blur();
  const text = reportToText(state.report, { labels: els.labelsToggle.checked });
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
    els.copyBtn.classList.add('done');
    els.copyBtn.querySelector('.btn-label').textContent = 'Skopiowano';
    setTimeout(() => {
      els.copyBtn.classList.remove('done');
      els.copyBtn.querySelector('.btn-label').textContent = 'Kopiuj opis';
    }, 1800);
    toast('Skopiowano do schowka — wklej do systemu RIS (Ctrl+V)', 'ok');
  } else {
    toast('Nie udało się skopiować — zaznacz tekst ręcznie.', 'err');
  }
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
    const chunk = convertSpoken(text);
    els.dictation.value = tidy(prev ? `${prev} ${chunk}` : chunk, { closeSentences: false }) + ' ';
    els.dictation.scrollTop = els.dictation.scrollHeight;
    save();
  },
  onInterim: (text) => { els.interim.textContent = text; },
  onStateChange: (on) => { if (!on && state.recording) stopRecording({ auto: true }); },
  onError: (msg) => toast(msg, 'err', 5000),
});

async function startRecording() {
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
  els.recWrap.parentElement.classList.add('recording');
  els.recBtn.setAttribute('aria-pressed', 'true');
  els.recBtn.setAttribute('aria-label', 'Zatrzymaj dyktowanie');
  els.recState.textContent = 'Nagrywanie… mów teraz';
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
  els.recWrap.parentElement.classList.remove('recording');
  document.body.classList.remove('recording');
  els.recBtn.setAttribute('aria-pressed', 'false');
  els.recBtn.setAttribute('aria-label', 'Rozpocznij dyktowanie');
  els.recState.textContent = 'Naciśnij, aby dyktować';
  els.interim.textContent = '';
  if (auto && els.autoProcess.checked && els.dictation.value.trim()) process();
}

function toggleRecording() {
  if (state.recording) stopRecording({ auto: true });
  else startRecording();
}

function tick() {
  const s = Math.floor((Date.now() - timerStart) / 1000);
  els.recTimer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// Radial visualiser around the record button.
function drawViz() {
  const c = els.recViz;
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = c.clientWidth * dpr;
  if (c.width !== size) { c.width = size; c.height = size; }
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2;
  const r0 = size * 0.355;
  const bars = 72;
  const bins = meter.bins();
  const t = performance.now() / 1000;
  const rec = state.recording;
  for (let i = 0; i < bars; i++) {
    const a = (i / bars) * Math.PI * 2 - Math.PI / 2;
    let v;
    if (bins) {
      const k = Math.floor((i < bars / 2 ? i : bars - i) / (bars / 2) * (bins.length * 0.7));
      v = bins[k] / 255;
    } else {
      v = rec ? 0.08 + 0.05 * Math.sin(t * 3 + i * 0.5) : 0.04 + 0.025 * Math.sin(t * 1.2 + i * 0.35);
    }
    const len = size * (0.012 + v * 0.11);
    const x1 = cx + Math.cos(a) * r0;
    const y1 = cx + Math.sin(a) * r0;
    const x2 = cx + Math.cos(a) * (r0 + len);
    const y2 = cx + Math.sin(a) * (r0 + len);
    ctx.strokeStyle = rec ? `rgba(255, ${110 + v * 60}, ${125 + v * 40}, ${0.35 + v * 0.65})` : `rgba(89, 212, 255, ${0.18 + v * 2})`;
    ctx.lineWidth = size * 0.009;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
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
  const label = els.aiStatus.querySelector('.label');
  els.aiStatus.classList.toggle('ok', state.ai);
  els.aiStatus.classList.toggle('local', !state.ai);
  label.textContent = state.ai ? `AI: Claude` : 'Tryb lokalny (bez AI)';
  els.aiStatus.title = state.ai ? `Model: ${state.model}` : 'Brak klucza ANTHROPIC_API_KEY na serwerze — dyktat jest wstawiany do szablonu regułami lokalnymi.';
  setBusy(false);
}

// ---------------------------------------------------------------- settings / help
function openSettings(open) {
  els.settings.classList.toggle('open', open);
  els.settings.setAttribute('aria-hidden', String(!open));
  els.overlay.hidden = !open;
  if (open) els.stylePrefs.focus();
}
function openHelp(open) { els.helpModal.hidden = !open; }

// ---------------------------------------------------------------- events
function isTyping(el) {
  return el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);
}

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
  els.labelsToggle.addEventListener('change', save);
  els.settingsBtn.addEventListener('click', () => openSettings(true));
  els.closeSettings.addEventListener('click', () => openSettings(false));
  els.overlay.addEventListener('click', () => openSettings(false));
  els.helpBtn.addEventListener('click', () => openHelp(true));
  els.closeHelp.addEventListener('click', () => openHelp(false));
  els.helpModal.addEventListener('click', (e) => { if (e.target === els.helpModal) openHelp(false); });

  const paper = $('paper');
  paper.addEventListener('focusin', (e) => { if (e.target.isContentEditable) onEditFocus(); });
  paper.addEventListener('focusout', (e) => { if (e.target.isContentEditable) onEditBlur(); });
  paper.addEventListener('input', (e) => { if (e.target.isContentEditable) onEditInput(e); });
  paper.addEventListener('paste', (e) => {
    if (!e.target.closest('[contenteditable]')) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });
  els.examTitle.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); els.examTitle.blur(); } });

  els.dictation.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); process(); }
  });
  els.instruction.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); process(); }
  });

  document.addEventListener('keydown', (e) => {
    const typing = isTyping(document.activeElement);
    if (e.key === 'Escape') { openSettings(false); openHelp(false); return; }
    if (e.key === 'F2') { e.preventDefault(); toggleRecording(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); process(); return; }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); copyReport(); return; }
    if (typing) return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) { e.preventDefault(); redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === ' ' && document.activeElement !== els.recBtn) { e.preventDefault(); toggleRecording(); return; }
    if (e.key === '?') { openHelp(true); return; }
    const n = Number(e.key);
    if (n >= 1 && n <= TEMPLATES.length) selectTemplate(TEMPLATES[n - 1].id);
  });

  window.addEventListener('beforeunload', () => { if (state.recording) dictationEngine.stop(); });
}

// ---------------------------------------------------------------- init
function init() {
  load();
  renderTemplates();
  renderReport();
  bind();
  if (!speechSupported) {
    els.speechBadge.textContent = 'brak mowy';
    els.speechBadge.classList.add('off');
    els.speechInfo.textContent = 'Ta przeglądarka nie obsługuje rozpoznawania mowy (Web Speech API). Użyj Chrome lub Edge, albo wpisuj tekst ręcznie.';
  } else {
    els.speechInfo.textContent = 'Używane jest wbudowane rozpoznawanie mowy przeglądarki (język: polski). W Chrome dźwięk jest przetwarzany przez serwery Google i wymaga internetu.';
  }
  checkStatus();
  requestAnimationFrame(drawViz);
}

init();

// Exposed for automated UI tests.
window.__radvox = { state, process, copyReport, selectTemplate };

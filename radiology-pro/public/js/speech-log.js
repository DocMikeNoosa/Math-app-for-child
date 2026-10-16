// Speech-recognition error log: what the browser HEARD next to the FINAL report, so the radiologist (or, in RadVox Pro,
// the administrator) can measure how often recognition goes wrong — above all numbers, sides and negations — and decide
// whether a better speech engine is needed. Pure functions + a small local store (RadVox, RadVox IR); RadVox Pro sends
// the entries to the server instead. Only made-up or anonymised cases belong here.
const KEY = 'radvox.speechlog.v1';
export const MAX_ENTRIES = 300;
const MAX_TEXT = 20_000;

/** Kinds of errors the radiologist can tick ('none' = checked, everything right). */
export const ERROR_TYPES = [
  ['number', 'Liczba / wymiar'],
  ['side', 'Strona (prawy / lewy)'],
  ['negation', 'Przeczenie („nie”, „bez”)'],
  ['term', 'Termin medyczny'],
  ['missing', 'Brakujące lub dodane słowo'],
  ['other', 'Inne'],
];
const TYPE_IDS = new Set(ERROR_TYPES.map(([id]) => id));
export const typeLabel = (id) => (id === 'none' ? 'Bez błędów' : (ERROR_TYPES.find(([k]) => k === id) || [id, id])[1]);

/** Numbers in a text, normalised ("8,5" and "8.5" → "8.5"; "12 x 8" → "12", "8"). */
export function numbersIn(text) {
  return (String(text || '').match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.').replace(/^0+(?=\d)/, ''));
}

/**
 * Automatic check of the numbers: dictated numbers missing from the report ("missing"), and numbers in the report that
 * were neither heard nor in the template ("added"). Counts repeats (two "8"s heard → two expected).
 */
export function compareNumbers(heard, report, template = '') {
  const count = (list) => list.reduce((m, n) => m.set(n, (m.get(n) || 0) + 1), new Map());
  const h = count(numbersIn(heard));
  const r = count(numbersIn(report));
  const t = count(numbersIn(template));
  const missing = [];
  const added = [];
  for (const [n, k] of h) for (let i = 0; i < k - (r.get(n) || 0); i++) missing.push(n);
  for (const [n, k] of r) for (let i = 0; i < k - (h.get(n) || 0) - (t.get(n) || 0); i++) added.push(n);
  return { missing, added };
}

const clip = (s) => String(s || '').slice(0, MAX_TEXT);

/** A log entry. `types` may be ['none'] (checked, no error) or any of ERROR_TYPES. `heardForNumbers`: the heard text
 * with spelled-out numbers converted to digits ("osiem" → 8), used only for the automatic number check. */
export function makeEntry({ heard = '', heardForNumbers = null, dictation = '', report = '', template = '', title = '', lang = 'pl', types = [], fixed = false, note = '', now = Date.now() } = {}) {
  const t = [...new Set((types || []).filter((x) => x === 'none' || TYPE_IDS.has(x)))];
  return {
    id: `${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    ts: now,
    title: String(title || '').slice(0, 200),
    lang: lang === 'en' ? 'en' : 'pl',
    heard: clip(heard),
    dictation: clip(dictation),
    report: clip(report),
    types: t.includes('none') ? ['none'] : t,
    // the recognition error was there, but the AI corrected it: the final report was right
    fixed: !t.includes('none') && t.length > 0 && Boolean(fixed),
    note: String(note || '').slice(0, 2000),
    auto: compareNumbers(heardForNumbers ?? heard, report, template),
  };
}

/** Did the final report come out right? ('none' = nothing wrong; an error the AI corrected also counts as right). */
export const finalOk = (e) => {
  const bad = (e.types || []).filter((x) => x !== 'none');
  return !bad.length || Boolean(e.fixed);
};

/** 95% confidence interval of a proportion (Wilson) — honest error bars for small samples. */
export function wilson(k, n, z = 1.96) {
  if (!n) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)];
}

/**
 * Totals: how many checked, how many with a recognition error, how many of those the AI corrected, how many final
 * reports were right (with a 95% interval), per error type — overall and for errors that reached the final report.
 */
export function summarize(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const byType = Object.fromEntries(ERROR_TYPES.map(([id]) => [id, 0]));
  const finalByType = Object.fromEntries(ERROR_TYPES.map(([id]) => [id, 0]));
  let withError = 0;
  let fixed = 0;
  let autoFlag = 0;
  for (const e of list) {
    const types = (e.types || []).filter((x) => x !== 'none');
    if (types.length) withError++;
    if (types.length && e.fixed) fixed++;
    for (const x of types) {
      if (x in byType) byType[x]++;
      if (!e.fixed && x in finalByType) finalByType[x]++;
    }
    if (e.auto && (e.auto.missing?.length || e.auto.added?.length)) autoFlag++;
  }
  const total = list.length;
  const finalGood = total - withError + fixed;
  return {
    total, withError, clean: total - withError, fixed, finalGood, finalErrors: total - finalGood, byType, finalByType, autoFlag,
    errorRate: total ? withError / total : 0,
    finalRate: total ? finalGood / total : 0,
    finalCI: wilson(finalGood, total),
    fixedRate: withError ? fixed / withError : 0,
  };
}

/** Monday of the week of a timestamp (local time), as YYYY-MM-DD. */
function weekOf(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Everything for the statistics page: totals, per week (trend) and per examination, for entries in [from, to]. */
export function stats(entries, { from = 0, to = Infinity } = {}) {
  const list = (Array.isArray(entries) ? entries : []).filter((e) => e.ts >= from && e.ts <= to).sort((a, b) => a.ts - b.ts);
  const group = (key) => {
    const m = new Map();
    for (const e of list) { const k = key(e); if (!m.has(k)) m.set(k, []); m.get(k).push(e); }
    return [...m].map(([k, es]) => ({ key: k, ...summarize(es) }));
  };
  return {
    ...summarize(list),
    first: list[0]?.ts || null,
    last: list[list.length - 1]?.ts || null,
    weeks: group((e) => weekOf(e.ts)),
    exams: group((e) => e.title || '—').sort((a, b) => b.total - a.total),
  };
}

/** The page's only script (the print button) — exported so a server can allow exactly it in its CSP (hash). */
export const PRINT_SCRIPT = "document.getElementById('printBtn').addEventListener('click', () => window.print());";
const pc = (x) => `${(Math.round(x * 1000) / 10).toLocaleString('pl-PL')}%`;
const escH = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dateStr = (ts) => (ts ? new Date(ts).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');

/**
 * A printable page (save as PDF) with the statistics, for potential buyers. States the method and its limits plainly:
 * self-reported checks of made-up / anonymised cases, sample size and 95% interval — no claims beyond the data.
 */
export function statsPage(st, { product = 'RadVox', generated = Date.now(), scope = '' } = {}) {
  const [lo, hi] = st.finalCI;
  const weeks = st.weeks.slice(-16);
  const W = 640;
  const H = 170;
  const bw = weeks.length ? Math.min(46, (W - 40) / weeks.length - 8) : 0;
  const bars = weeks.map((w, i) => {
    const x = 30 + i * ((W - 40) / Math.max(1, weeks.length)) + 4;
    const h = Math.round(w.finalRate * (H - 40));
    return `<rect x="${x.toFixed(1)}" y="${H - 20 - h}" width="${bw.toFixed(1)}" height="${h}" rx="3" fill="#2f7d6d"/>
      <text x="${(x + bw / 2).toFixed(1)}" y="${H - 24 - h}" text-anchor="middle" font-size="10" fill="#333">${Math.round(w.finalRate * 100)}%</text>
      <text x="${(x + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="9" fill="#777">${escH(w.key.slice(5).split('-').reverse().join('.'))}</text>
      <text x="${(x + bw / 2).toFixed(1)}" y="${H + 7}" text-anchor="middle" font-size="9" fill="#999">n=${w.total}</text>`;
  }).join('');
  const typeRows = ERROR_TYPES.map(([id, label]) => `<tr><td>${escH(label)}</td><td class="n">${st.byType[id]}</td><td class="n">${st.total ? pc(st.byType[id] / st.total) : '—'}</td><td class="n">${st.finalByType[id]}</td><td class="n">${st.total ? pc(st.finalByType[id] / st.total) : '—'}</td></tr>`).join('');
  const examRows = st.exams.slice(0, 15).map((x) => `<tr><td>${escH(x.key)}</td><td class="n">${x.total}</td><td class="n">${pc(x.errorRate)}</td><td class="n">${pc(x.finalRate)}</td></tr>`).join('');
  const small = st.total < 100;
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${escH(product)} — statystyki jakości opisów</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font: 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; color: #1d2329; max-width: 760px; margin: 24px auto; padding: 0 16px; background: #fff; }
  h1 { font-size: 22px; margin: 0 0 4px; } h2 { font-size: 15px; margin: 26px 0 8px; border-bottom: 1px solid #e3e7ea; padding-bottom: 4px; }
  .sub { color: #66717c; margin: 0 0 18px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .kpi { border: 1px solid #e3e7ea; border-radius: 10px; padding: 10px 12px; }
  .kpi .v { font-size: 24px; font-weight: 700; } .kpi .l { font-size: 11px; color: #66717c; text-transform: uppercase; letter-spacing: .4px; } .kpi .d { font-size: 11.5px; color: #66717c; }
  .kpi.main { border-color: #2f7d6d; background: #f1f8f6; } .kpi.main .v { color: #2f7d6d; }
  table { width: 100%; border-collapse: collapse; font-size: 12.5px; } th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #eef1f3; } th { color: #66717c; font-weight: 600; font-size: 11.5px; } .n { text-align: right; font-variant-numeric: tabular-nums; }
  .note { font-size: 11.5px; color: #555f69; background: #f7f8f9; border-radius: 8px; padding: 10px 12px; }
  .warn { color: #8a5a00; }
  .print { position: fixed; top: 12px; right: 12px; padding: 8px 14px; border-radius: 8px; border: 1px solid #2f7d6d; background: #2f7d6d; color: #fff; font: inherit; cursor: pointer; }
  @media print { .print { display: none; } body { margin: 0; } }
  @media (max-width: 640px) { .kpis { grid-template-columns: 1fr 1fr; } }
</style></head><body>
<button class="print" id="printBtn">Drukuj / zapisz PDF</button>
<h1>${escH(product)} — jakość opisów z dyktowania</h1>
<p class="sub">${escH(scope ? `${scope} · ` : '')}okres: ${dateStr(st.first)} – ${dateStr(st.last)} · sprawdzonych opisów: <b>${st.total}</b> · wygenerowano ${dateStr(generated)}</p>
<div class="kpis">
  <div class="kpi main"><div class="l">Opisy końcowe poprawne</div><div class="v">${st.total ? pc(st.finalRate) : '—'}</div><div class="d">${st.finalGood} z ${st.total}${st.total ? ` · 95% CI ${pc(lo)}–${pc(hi)}` : ''}</div></div>
  <div class="kpi"><div class="l">Bez żadnego błędu</div><div class="v">${st.total ? pc(1 - st.errorRate) : '—'}</div><div class="d">${st.clean} opisów</div></div>
  <div class="kpi"><div class="l">Błędy mowy poprawione przez AI</div><div class="v">${st.withError ? pc(st.fixedRate) : '—'}</div><div class="d">${st.fixed} z ${st.withError} błędów rozpoznawania</div></div>
  <div class="kpi"><div class="l">Błąd w opisie końcowym</div><div class="v">${st.total ? pc(st.finalErrors / st.total) : '—'}</div><div class="d">${st.finalErrors} opisów — wychwycone przy weryfikacji</div></div>
</div>
${small ? `<p class="warn">Uwaga: mała próba (${st.total} opisów) — przedział ufności jest szeroki; wyniki są orientacyjne.</p>` : ''}
${weeks.length > 1 ? `<h2>Opisy końcowe poprawne — tydzień po tygodniu</h2><svg viewBox="0 0 ${W} ${H + 12}" width="100%" role="img" aria-label="Odsetek poprawnych opisów w kolejnych tygodniach">${bars}</svg>` : ''}
<h2>Rodzaje błędów</h2>
<table><thead><tr><th>Rodzaj</th><th class="n">Błędy rozpoznawania</th><th class="n">% opisów</th><th class="n">W opisie końcowym</th><th class="n">% opisów</th></tr></thead><tbody>${typeRows}</tbody></table>
${examRows ? `<h2>Według rodzaju badania</h2><table><thead><tr><th>Badanie</th><th class="n">Opisy</th><th class="n">Z błędem rozpoznawania</th><th class="n">Opis końcowy poprawny</th></tr></thead><tbody>${examRows}</tbody></table>` : ''}
<h2>Metoda</h2>
<p class="note">Radiolog po przygotowaniu opisu porównuje tekst rozpoznany z mowy z opisem końcowym i zaznacza: „bez błędów”, rodzaj błędu rozpoznawania oraz to, czy błąd został poprawiony przez AI (opis końcowy poprawny), czy pozostał w opisie końcowym. Liczby są dodatkowo porównywane automatycznie. Dane pochodzą z kontroli wykonanych przez radiologów na przypadkach zmyślonych lub zanonimizowanych; nie obejmują opisów, których nie oznaczono. „Poprawny” oznacza zgodność z tym, co radiolog podyktował — aplikacja nie stawia diagnoz, a każdy opis przed użyciem weryfikuje i podpisuje radiolog. Przedział ufności 95% metodą Wilsona.</p>
<script>${PRINT_SCRIPT}</script>
</body></html>`;
}

/** CSV for Excel (semicolon-separated, as Polish Excel expects; UTF-8 with BOM). An "author" column is added when the
 * entries carry one (RadVox Pro administrator export). */
export function toCSV(entries) {
  const list = entries || [];
  const withAuthor = list.some((e) => e.author);
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Data', ...(withAuthor ? ['Lekarz'] : []), 'Badanie', 'Język', 'Błędy', 'Opis końcowy poprawny', 'Liczby niedopasowane (usłyszane, brak w opisie)', 'Liczby dodane w opisie', 'Uwagi', 'Usłyszane', 'Opis końcowy'];
  const rows = list.map((e) => [
    new Date(e.ts).toISOString().replace('T', ' ').slice(0, 16), ...(withAuthor ? [e.author || ''] : []), e.title, e.lang, (e.types || []).map(typeLabel).join(', '), finalOk(e) ? 'tak' : 'nie',
    (e.auto?.missing || []).join(' '), (e.auto?.added || []).join(' '), e.note, e.heard, e.report,
  ]);
  return `\uFEFF${[head, ...rows].map((r) => r.map(q).join(';')).join('\r\n')}\r\n`;
}

// ---------------------------------------------------------------- local store (RadVox, RadVox IR)
export function loadLocal() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}
export function saveLocal(entry) {
  const list = [entry, ...loadLocal()].slice(0, MAX_ENTRIES);
  try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}
export function removeLocal(id) {
  const list = loadLocal().filter((e) => e.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* full or private mode */ }
  return list;
}
export function clearLocal() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}

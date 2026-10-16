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
export function makeEntry({ heard = '', heardForNumbers = null, dictation = '', report = '', template = '', title = '', lang = 'pl', types = [], note = '', now = Date.now() } = {}) {
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
    note: String(note || '').slice(0, 2000),
    auto: compareNumbers(heardForNumbers ?? heard, report, template),
  };
}

/** Totals for the summary: how many checked, how many with an error, per type, and the error rate. */
export function summarize(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const byType = Object.fromEntries(ERROR_TYPES.map(([id]) => [id, 0]));
  let withError = 0;
  let autoFlag = 0;
  for (const e of list) {
    const types = (e.types || []).filter((x) => x !== 'none');
    if (types.length) withError++;
    for (const x of types) if (x in byType) byType[x]++;
    if (e.auto && (e.auto.missing?.length || e.auto.added?.length)) autoFlag++;
  }
  return { total: list.length, withError, clean: list.length - withError, byType, autoFlag, errorRate: list.length ? withError / list.length : 0 };
}

/** CSV for Excel (semicolon-separated, as Polish Excel expects; UTF-8 with BOM). An "author" column is added when the
 * entries carry one (RadVox Pro administrator export). */
export function toCSV(entries) {
  const list = entries || [];
  const withAuthor = list.some((e) => e.author);
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Data', ...(withAuthor ? ['Lekarz'] : []), 'Badanie', 'Język', 'Błędy', 'Liczby niedopasowane (usłyszane, brak w opisie)', 'Liczby dodane w opisie', 'Uwagi', 'Usłyszane', 'Opis końcowy'];
  const rows = list.map((e) => [
    new Date(e.ts).toISOString().replace('T', ' ').slice(0, 16), ...(withAuthor ? [e.author || ''] : []), e.title, e.lang, (e.types || []).map(typeLabel).join(', '),
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

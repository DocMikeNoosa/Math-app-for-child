// Polish dictation text processing — shared by the browser and the server.
//  - normalizeDictation: voice commands, number words → digits, units, spine levels
//  - localMerge: non-AI fallback that routes dictated sentences into template sections
//  - wordDiff: word-level diff used to highlight what changed in the report
//  - reportToText: plain-text export for the clipboard

// ---------------------------------------------------------------- numbers
const UNITS = {
  zero: 0, jeden: 1, jedna: 1, jedno: 1, jednego: 1, jednej: 1,
  dwa: 2, dwie: 2, dwóch: 2, dwu: 2, trzy: 3, trzech: 3, cztery: 4, czterech: 4,
  pięć: 5, pięciu: 5, sześć: 6, sześciu: 6, siedem: 7, siedmiu: 7, osiem: 8, ośmiu: 8,
  dziewięć: 9, dziewięciu: 9,
};
const TEENS = {
  dziesięć: 10, dziesięciu: 10, jedenaście: 11, jedenastu: 11, dwanaście: 12, dwunastu: 12,
  trzynaście: 13, trzynastu: 13, czternaście: 14, czternastu: 14, piętnaście: 15, piętnastu: 15,
  szesnaście: 16, szesnastu: 16, siedemnaście: 17, siedemnastu: 17, osiemnaście: 18, osiemnastu: 18,
  dziewiętnaście: 19, dziewiętnastu: 19,
};
const TENS = {
  dwadzieścia: 20, dwudziestu: 20, trzydzieści: 30, trzydziestu: 30, czterdzieści: 40, czterdziestu: 40,
  pięćdziesiąt: 50, pięćdziesięciu: 50, sześćdziesiąt: 60, sześćdziesięciu: 60,
  siedemdziesiąt: 70, siedemdziesięciu: 70, osiemdziesiąt: 80, osiemdziesięciu: 80,
  dziewięćdziesiąt: 90, dziewięćdziesięciu: 90,
};
const HUNDREDS = {
  sto: 100, stu: 100, dwieście: 200, dwustu: 200, trzysta: 300, trzystu: 300, czterysta: 400, czterystu: 400,
  pięćset: 500, pięciuset: 500, sześćset: 600, sześciuset: 600, siedemset: 700, siedmiuset: 700,
  osiemset: 800, ośmiuset: 800, dziewięćset: 900, dziewięciuset: 900,
};
const ONE_WORDS = new Set(['jeden', 'jedna', 'jedno', 'jednego', 'jednej']);
const UNIT_START = /^(mm|cm|ml|milimetr|centymetr|mililitr|jednost|procent|%|na$|przecinek$)/;

function splitPunct(word) {
  const m = word.match(/^(.*?)([.,;:!?]*)$/u);
  return { core: m[1], punct: m[2] };
}

// Parse a run of number words starting at index i. Returns {value, end, words} or null.
function parseNumberWords(cores, i) {
  let value = 0;
  let j = i;
  let used = 0;
  const w = () => (cores[j] || '').toLowerCase();
  if (/^\d+$/.test(cores[j] || '')) return { value: Number(cores[j]), end: j + 1, words: 0, digits: true };
  if (w() in HUNDREDS) { value += HUNDREDS[w()]; j++; used++; }
  if (w() in TENS) { value += TENS[w()]; j++; used++; }
  if (w() in TEENS && value % 100 === 0) { value += TEENS[w()]; j++; used++; }
  else if (w() in UNITS && (value % 10 === 0)) {
    if (!(UNITS[w()] === 0 && used > 0)) { value += UNITS[w()]; j++; used++; }
  }
  if (!used) return null;
  return { value, end: j, words: used, digits: false };
}

function convertNumbers(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const parts = words.map(splitPunct);
  const cores = parts.map((p) => p.core);
  const out = [];
  let i = 0;
  while (i < parts.length) {
    const num = parseNumberWords(cores, i);
    if (!num || num.digits) {
      if (num && num.digits) { out.push(parts[i].core + parts[i].punct); i++; continue; }
      out.push(parts[i].core + parts[i].punct);
      i++;
      continue;
    }
    let str = String(num.value);
    let end = num.end;
    // decimal: "<num> przecinek <num>" → "a,b" (only when no punctuation interrupts)
    if (!parts[end - 1].punct && (cores[end] || '').toLowerCase() === 'przecinek' && !parts[end].punct) {
      const frac = parseNumberWords(cores, end + 1);
      if (frac) { str += ',' + String(frac.value); end = frac.end; }
    }
    const next = (cores[end] || '').toLowerCase();
    const single = end - i === 1 && ONE_WORDS.has(cores[i].toLowerCase());
    if (single && !UNIT_START.test(next)) {
      out.push(parts[i].core + parts[i].punct);
      i++;
      continue;
    }
    out.push(str + parts[end - 1].punct);
    i = end;
  }
  return out.join(' ');
}

// ---------------------------------------------------------------- commands
const L = '[\\p{L}\\d]';
function word(re) { return new RegExp(`(?<!${L})(?:${re})(?!${L})`, 'giu'); }

const COMMANDS = [
  [word('nowy akapit'), '\n\n'],
  [word('nowa linia|nowa linijka|następna linia'), '\n'],
  [word('otwórz nawias'), ' ('],
  [word('zamknij nawias'), ') '],
  [word('dwukropek'), ': '],
  [word('średnik'), '; '],
  [word('myślnik'), ' – '],
  [word('znak zapytania'), '? '],
  [word('kropka'), '. '],
  [word('przecinek'), ', '],
];

/** Full normalisation of a finished dictation (punctuated, capitalised). */
export function normalizeDictation(raw) {
  return tidy(convertSpoken(raw));
}

/** Voice commands, numbers, units and spine levels — no sentence closing. */
export function convertSpoken(raw) {
  if (!raw) return '';
  // Keep paragraph breaks the user typed; process each line separately.
  const lines = String(raw).replace(/\r/g, '').split('\n');
  let text = lines.map((line) => convertNumbers(line)).join('\n');

  for (const [re, rep] of COMMANDS) text = text.replace(re, rep);

  // units
  const NUM = '(\\d+(?:,\\d+)?)';
  text = text
    .replace(new RegExp(`${NUM}\\s*(?:milimetr\\p{L}*|mm)(?!\\p{L})`, 'giu'), '$1 mm')
    .replace(new RegExp(`${NUM}\\s*(?:centymetr\\p{L}*|cm)(?!\\p{L})`, 'giu'), '$1 cm')
    .replace(new RegExp(`${NUM}\\s*(?:mililitr\\p{L}*|ml)(?!\\p{L})`, 'giu'), '$1 ml')
    .replace(new RegExp(`${NUM}\\s*(?:jednost\\p{L}*\\s+hounsfield\\p{L}*|jednost\\p{L}*\\s+h\\b|jednost\\p{L}*|j\\.?\\s?h\\.?)(?!\\p{L})`, 'giu'), '$1 j.H.')
    .replace(new RegExp(`${NUM}\\s*(?:procent\\p{L}*)(?!\\p{L})`, 'giu'), '$1%');
  // "12 na 8 mm" → "12 x 8 mm"
  for (let k = 0; k < 2; k++) text = text.replace(new RegExp(`${NUM}\\s+na\\s+(?=\\d)`, 'gu'), '$1 x ');

  // spine levels: "l 4" → "L4", "th 12" → "Th12"; "L4 L5" → "L4/L5"
  text = text.replace(/(?<![\p{L}\d])(c|th|l|s)\s?(\d{1,2})(?!\d)/giu, (_, seg, n) => {
    const s = seg.toLowerCase() === 'th' ? 'Th' : seg.toUpperCase();
    return s + n;
  });
  text = text.replace(/(?<![\p{L}])((?:C|Th|L|S)\d{1,2})(?:\s*[-–/]\s*|\s+)((?:C|Th|L|S)\d{1,2})(?![\d])/gu, '$1/$2');

  return text;
}

/** Spacing, punctuation and sentence capitalisation. */
export function tidy(text, { closeSentences = true } = {}) {
  let t = String(text)
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/([.,;:!?])(?=[\p{L}(])/gu, '$1 ')
    .replace(/([.,;:!?])\1+/g, '$1')
    .replace(/,\./g, '.')
    .replace(/^[\s.,;:]+/, '')
    .replace(/(?<!\p{L})j\. H\./gu, 'j.H.')
    .trim();
  // capitalise sentence starts
  t = t.replace(/(^|[.!?]\s+|\n+)(\p{Ll})/gu, (_, pre, ch) => pre + ch.toUpperCase());
  if (!closeSentences) return t;
  // close the last sentence of each paragraph
  t = t
    .split('\n')
    .map((p) => (/[\p{L}\d)%]$/u.test(p.trim()) ? p.trim() + '.' : p.trim()))
    .join('\n');
  return t;
}

// ---------------------------------------------------------------- privacy
/** Remove obvious patient identifiers (PESEL) before text leaves the browser. */
export function scrubIdentifiers(text) {
  return String(text || '').replace(/(?<!\d)\d{11}(?!\d)/g, '[PESEL]');
}

// ---------------------------------------------------------------- diff
function tokens(s) { return String(s || '').match(/\s+|[^\s]+/g) || []; }

/** Word diff: returns segments of the new text with added=true for inserted words. */
export function wordDiff(oldText, newText) {
  const a = tokens(oldText);
  const b = tokens(newText);
  const n = a.length;
  const m = b.length;
  if (n * m > 400000) return [{ text: newText, added: oldText !== newText }];
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = [];
  let i = 0;
  let j = 0;
  const push = (text, added) => {
    const last = out[out.length - 1];
    if (last && last.added === added) last.text += text;
    else out.push({ text, added });
  };
  while (j < m) {
    if (i < n && a[i] === b[j]) { push(b[j], false); i++; j++; }
    else if (i < n && dp[i + 1][j] >= dp[i][j + 1]) i++;
    else { push(b[j], !/^\s+$/.test(b[j])); j++; }
  }
  // join added words separated only by an unchanged space into one highlight
  const merged = [];
  for (let k = 0; k < out.length; k++) {
    const seg = out[k];
    const prev = merged[merged.length - 1];
    if (!seg.added && /^\s+$/.test(seg.text) && prev?.added && out[k + 1]?.added) {
      prev.text += seg.text + out[k + 1].text;
      k++;
    } else if (prev && prev.added === seg.added) prev.text += seg.text;
    else merged.push({ ...seg });
  }
  return merged;
}

// Is a lesson plausible radiology reporting language? Only plausible lessons may reach the central (global) learning.
// Someone fooling around or sabotaging (keyboard mashing, jokes, insults, links, code, text about anything but
// medicine) must not teach the app for everybody. Personal learning is not affected — it only affects that user.
//
// Deliberately conservative: a rare but valid term that is rejected costs nothing (it simply is not shared), while
// junk that gets through could reach every radiologist. Medical *sense* of well-formed text is judged later, by the
// AI distillation step and by the owner's review before publishing (lib/global-learning.js).

// Stems of words that occur in imaging reports (Polish and English, lower case, without endings).
const MEDICAL_STEMS = [
  // modalities, technique, report
  'tk', 'ct', 'mr', 'mri', 'rtg', 'usg', 'pet', 'spect', 'angio', 'badani', 'opis', 'wniosk', 'skan', 'sekwencj', 'kontrast', 'wzmocni',
  'wzmacnia', 'faz', 'tętnicz', 'żyln', 'natywn', 'warstw', 'rekonstrukc', 'projekc', 'przekr', 'sygnał', 'flair', 'dwi', 'adc', 'swi',
  't1', 't2', 'stir', 'hu', 'densyj', 'hipodens', 'hiperdens', 'izodens', 'hipointens', 'hiperintens', 'izointens', 'echogen',
  'hipoechogen', 'hiperechogen', 'bezechow', 'dopler', 'przepływ', 'restrykc', 'dyfuzj', 'perfuzj', 'artefakt', 'jakość',
  // anatomy
  'głow', 'mózg', 'móżdż', 'pień', 'komor', 'zbiornik', 'czaszk', 'kość', 'kości', 'kostn', 'kręg', 'rdzeń', 'rdzeni', 'kanał',
  'krążk', 'dysk', 'staw', 'więzad', 'łąkotk', 'chrząstk', 'mięś', 'ścięgn', 'kaletk', 'płuc', 'opłuc', 'oskrzel', 'tchawic',
  'śródpiersi', 'serc', 'osierdz', 'aort', 'tętnic', 'żył', 'naczy', 'wątrob', 'pęcherzyk', 'żółc', 'trzustk', 'śledzion', 'nerk',
  'nadnercz', 'moczow', 'pęcherz', 'jelit', 'żołąd', 'przełyk', 'odbytnic', 'esic', 'kątnic', 'wyrostk', 'otrzewn', 'zaotrzewn',
  'macic', 'jajnik', 'przydatk', 'prostat', 'jąd', 'pierś', 'sutk', 'pach', 'tarczyc', 'ślinian', 'krtań', 'gardł', 'zatok',
  'oczodoł', 'ucho', 'skroni', 'sklepieni', 'szyj', 'klatk', 'brzuch', 'miedni', 'kończyn', 'bark', 'łokci', 'nadgarst', 'ręk',
  'biodr', 'kolan', 'skokow', 'stop', 'udow', 'piszczel', 'strzałk', 'ramienn', 'łopatk', 'obojczyk', 'mostek', 'żebr', 'krzyż',
  'guzicz', 'lędźw', 'piersiow', 'szyjn', 'węzł', 'chłonn', 'tkank', 'tłuszcz', 'skór', 'miąższ', 'korow', 'rdzeniow', 'przestrz',
  'płat', 'segment', 'zakręt', 'bruzd', 'jądr', 'wzgórz', 'torebk', 'istot', 'biał', 'szar', 'opon', 'przysadk', 'siodł',
  // findings and terms
  'zmian', 'ognisk', 'guz', 'masa', 'mas', 'torbiel', 'torbielk', 'naczyniak', 'gruczolak', 'tłuszczak', 'przerzut', 'nowotw', 'rak',
  'chłoniak', 'naciek', 'zapal', 'ropie', 'ropień', 'płyn', 'wysięk', 'przesięk', 'krwiak', 'krwaw', 'krwotok', 'wylew', 'obrzęk',
  'zawał', 'udar', 'niedokrwien', 'zator', 'zatorow', 'zakrzep', 'tętniak', 'rozwarstw', 'zwęż', 'poszerz', 'niedrożn', 'drożn',
  'odma', 'niedodm', 'rozedm', 'zagęszcz', 'konsolidac', 'matow', 'mleczn', 'guzek', 'guzk', 'złam', 'zwichn', 'podwichn', 'szczelin',
  'zwapni', 'kalcyfik', 'zwyrodn', 'osteofit', 'przepuklin', 'wypuklin', 'protruzj', 'ekstruzj', 'ucisk', 'modzel', 'zanik',
  'demieliniz', 'hydrocefal', 'wodogłowi', 'przesunię', 'linii', 'pośrodkow', 'symetr', 'asymetr', 'prawidłow', 'nieprawidłow',
  'patolog', 'zmienion', 'niezmienion', 'cech', 'objaw', 'ostry', 'ostr', 'przewlek', 'śwież', 'stary', 'star', 'podostr', 'pourazow',
  'uraz', 'pooperac', 'stan po', 'implant', 'endoprotez', 'stent', 'dren', 'cewnik', 'zespoleni', 'proteza', 'klips', 'szew',
  'wymiar', 'średnic', 'grubość', 'objętoś', 'wielkoś', 'kształt', 'zarys', 'brzeg', 'granic', 'jednorod', 'niejednorod', 'struktur',
  'położen', 'obustronn', 'jednostronn', 'prawostronn', 'lewostronn', 'prawy', 'praw', 'lewy', 'lew', 'przyśrodk', 'boczn', 'przedni',
  'tylny', 'tyln', 'górn', 'doln', 'proksymaln', 'dystaln', 'podejrz', 'różnicow', 'sugeruj', 'przemawia', 'nie można wykluczyć',
  'wyklucz', 'kontroln', 'zalec', 'korelac', 'kliniczn', 'wskazan', 'porówn', 'poprzedni', 'progresj', 'regresj', 'stabiln', 'bez zmian',
  'bi-rads', 'li-rads', 'pi-rads', 'tirads', 'aspects', 'fleischner', 'bosniak', 'mm', 'cm', 'ml',
  // report language and anatomy found in the template library
  'uwidoczn', 'uwidaczn', 'nieposzerz', 'niepogrub', 'pogrubi', 'ciągł', 'zachowan', 'przemieszcz', 'nieprzemieszcz', 'odłam',
  'blaszk', 'papierowat', 'sitow', 'komórk', 'ciał', 'obc', 'wewnątrz', 'gałk', 'wodociąg', 'przedsion', 'nosow', 'przegrod',
  'kielich', 'miedniczk', 'przykręg', 'łódeczk', 'księżyc', 'szpar', 'przepon', 'kopuł', 'powietrz', 'mielin', 'moszn',
  'przytarczyc', 'ścian', 'cieniując', 'przewod', 'mlekow', 'kurczliw', 'obciążen', 'powikłan', 'endometri', 'błon', 'ropniak',
  'podtwardówk', 'nadtwardówk', 'korzen', 'ogon', 'końsk', 'siateczk', 'ziarnist', 'bronchogram', 'ubytk', 'wypełnieni', 'nisz',
  'wrzod', 'stref', 'przejściow', 'gęstoś', 'acr', 'who', 't-score', 'z-score', 'menopauz', 'wiek kalendarz', 'ms', 'r2',
  'zaburzen', 'okolic', 'pozycj', 'ocen', 'ograniczon', 'leżąc', 'wolne', 'wolny', 'wolnego', 'zrąb', 'krezk', 'pęcherzyk',
  // English
  'lesion', 'mass', 'nodul', 'tumo', 'cyst', 'fractur', 'hemorrh', 'haemorrh', 'bleed', 'infarct', 'ischem', 'ischaem', 'stroke',
  'effusion', 'edema', 'oedema', 'lymph', 'node', 'arter', 'vein', 'venous', 'vessel', 'aneurysm', 'dissection', 'stenosis', 'occlusion',
  'thromb', 'embol', 'contrast', 'enhanc', 'normal', 'abnormal', 'finding', 'impression', 'conclusion', 'lung', 'pleura', 'liver',
  'hepat', 'kidney', 'renal', 'spleen', 'pancrea', 'bowel', 'colon', 'brain', 'cerebr', 'ventric', 'spine', 'spinal', 'vertebr', 'disc',
  'joint', 'ligament', 'tendon', 'muscle', 'bone', 'osseous', 'cortex', 'cortical', 'heart', 'cardiac', 'aort', 'pericard', 'thyroid',
  'adrenal', 'bladder', 'uter', 'ovar', 'prostat', 'breast', 'axill', 'soft tissue', 'fat', 'fluid', 'collection', 'abscess', 'pneumo',
  'consolidation', 'opacit', 'atelecta', 'emphysema', 'calcif', 'degenerat', 'hernia', 'compression', 'atroph', 'demyelin', 'shift',
  'midline', 'symmetr', 'bilateral', 'unilateral', 'right', 'left', 'anterior', 'posterior', 'superior', 'inferior', 'medial', 'lateral',
  'suspicious', 'consistent', 'suggest', 'differential', 'recommend', 'follow-up', 'follow up', 'correlat', 'clinical', 'comparison',
  'prior', 'previous', 'progress', 'regress', 'stable', 'unchanged', 'acute', 'chronic', 'subacute', 'post-operative', 'postoperative',
  'diameter', 'measur', 'size', 'volume', 'density', 'attenuation', 'signal', 'intensity', 'diffusion', 'restrict', 'perfusion',
];

// Offensive words (Polish and English): a lesson containing them is never shared. Stems, lower case.
const OFFENSIVE = ['kurw', 'chuj', 'huj', 'pierdol', 'jeb', 'pizd', 'skurwy', 'cip', 'fiut', 'dupa', 'dupek', 'debil', 'idiot', 'kretyn',
  'spierdal', 'zajeb', 'wypierdal', 'fuck', 'shit', 'bitch', 'cunt', 'dick', 'asshole', 'bastard', 'nigg', 'faggot', 'pedał', 'ciot'];

const VOWELS = /[aeiouyąęóAEIOUYĄĘÓ]/;
const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];
const words = (t) => String(t || '').toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}\-+/.]*/gu) || [];

function isKeyboardRun(w) {
  if (w.length < 4) return false;
  return KEYBOARD_ROWS.some((row) => row.includes(w) || row.split('').reverse().join('').includes(w));
}

// Everyday words that also occur in reports (sides, sizes, age…): they count only half — "lewy ma kota" is not medicine.
const WEAK = new Set(['praw', 'prawy', 'lew', 'lewy', 'star', 'stary', 'mas', 'masa', 'stop', 'szar', 'biał', 'ostr', 'ostry', 'górn', 'doln',
  'right', 'left', 'size', 'prior', 'wolne', 'wolny', 'wolnego', 'ocen', 'pozycj', 'okolic', 'zachowan', 'ogon', 'ms', 'fat', 'node', 'normal', 'jakość', 'brzeg', 'granic', 'kształt', 'linii', 'poprzedni', 'previous', 'rak', 'guz']);

/** Medical words in a text (weak everyday words count 0.5): stems matched at word starts, multi-word stems in the text. */
export function medicalHits(text) {
  const t = ` ${String(text || '').toLowerCase()} `;
  const ws = words(text);
  let n = 0;
  for (const w of ws) {
    const s = MEDICAL_STEMS.find((x) => !x.includes(' ') && (w === x || (x.length >= 3 && w.startsWith(x))));
    if (s) n += WEAK.has(s) ? 0.5 : 1;
  }
  for (const x of MEDICAL_STEMS) if (x.includes(' ') && t.includes(` ${x}`)) n++;
  return n;
}

/**
 * Check one text. Returns '' if it looks like real medical writing, or a short reason (Polish) why not.
 * `short`: a single line (conclusion line, phrase, rule, glossary term) — needs at least one medical word;
 * longer texts need a reasonable share of medical words.
 */
export function textProblem(text, { short = false } = {}) {
  const t = String(text || '').trim();
  if (!t) return '';
  const lower = t.toLowerCase();
  if (/https?:\/\/|www\.|<\/?[a-z]+[\s>]|\bselect\b.+\bfrom\b|\bfunction\s*\(|=>|\{\s*"|;\s*$/i.test(t)) return 'link lub kod';
  if (/(.)\1{5,}/u.test(t)) return 'powtarzane znaki';
  const ws = words(t);
  if (!ws.length) return 'brak słów';
  if (OFFENSIVE.some((o) => ws.some((w) => w.startsWith(o)))) return 'treść obraźliwa';
  const letters = (t.match(/\p{L}/gu) || []).length;
  const visible = t.replace(/\s/g, '').length;
  if (letters / visible < 0.55) return 'za mało liter (cyfry, symbole)';
  // keyboard mashing and made-up words: no vowel, very long consonant runs, keyboard rows, absurd length
  const alpha = ws.filter((w) => /\p{L}{3,}/u.test(w));
  const odd = alpha.filter((w) => !VOWELS.test(w) || /[bcćdfghjklłmnńpqrsśtvwxzźż]{6,}/i.test(w) || isKeyboardRun(w) || w.length > 28);
  // medical abbreviations have no vowels (TK, MR, RTG, ADC…): never count them as odd
  const oddReal = odd.filter((w) => !medicalHits(w) && !/^[a-z]{1,4}\d*$/i.test(w));
  if (alpha.length && oddReal.length / alpha.length > (short ? 0.34 : 0.2)) return 'słowa bez sensu (losowe litery)';
  // one word repeated over and over
  if (ws.length >= 6) {
    const counts = new Map();
    for (const w of ws) counts.set(w, (counts.get(w) || 0) + 1);
    if (Math.max(...counts.values()) / ws.length > 0.4) return 'to samo słowo wiele razy';
  }
  const hits = medicalHits(lower);
  if (short) return hits >= 1 ? '' : 'brak słownictwa medycznego';
  if (hits < 2 || hits / ws.length < 0.06) return 'brak słownictwa medycznego';
  return '';
}

const SHORT = new Set(['concl_removed', 'concl_added', 'restored', 'rule', 'phrase', 'glossary', 'answer']);

/**
 * Is a whole lesson good enough for the central learning? Returns '' (yes) or the reason it is not.
 * kind/content as stored in the learning archive (lib/learning.js).
 */
export function lessonProblem(kind, content) {
  const c = content || {};
  const short = SHORT.has(kind);
  const texts = Object.entries(c).filter(([, v]) => typeof v === 'string' && v.trim());
  if (!texts.length) return 'pusta lekcja';
  if (kind === 'glossary') {
    // a term pair: both sides are words, at least one side is medical vocabulary
    for (const [, v] of texts) {
      const p = textProblem(v, { short: true });
      if (p && p !== 'brak słownictwa medycznego') return p;
    }
    return medicalHits(`${c.en} ${c.pl}`) >= 1 ? '' : 'brak słownictwa medycznego';
  }
  if (kind === 'style_pair' || kind === 'answer') {
    // the corrected version must itself be sensible medical text; a correction that turns a medical sentence into
    // something unrelated is sabotage, not style
    const before = c.ai ?? c.suggestion ?? '';
    const after = c.final ?? '';
    const p = textProblem(after, { short: String(after).length < 160 });
    if (p) return `poprawka: ${p}`;
    if (medicalHits(before) >= 2 && medicalHits(after) === 0) return 'poprawka usuwa całą treść medyczną';
    return '';
  }
  for (const [k, v] of texts) {
    const p = textProblem(v, { short: short || String(v).length < 160 });
    if (p) return k === 'conclusion' && !c.body ? p : texts.length > 1 ? `${k}: ${p}` : p;
  }
  return '';
}

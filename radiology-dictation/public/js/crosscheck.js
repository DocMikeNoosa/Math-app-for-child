// Cross-check between dictated findings and template "normal" statements.
// Rule: what the radiologist dictated always has priority over template text.
//
// Each sentence is analysed for
//   concepts – what kind of finding it is about (bleed, stone, fracture, …)
//   organs   – where (with a hierarchy: ureter ⊂ urinary tract ⊂ abdomen, …)
//   side     – right / left
//   negation – "bez", "nie stwierdza się", … ("nie można wykluczyć" counts as positive)
// A template statement conflicts with a dictated positive finding when they share a concept
// (or the statement says the organ is normal) and the finding's organ is the statement's
// organ or lies inside it. Conflicting parts of list sentences are removed and the rest is
// re-joined grammatically; whole sentences go when nothing true is left.

import { normalizeDictation, tidy } from './polish-text.js';
import { formatConclusion } from './templates.js';

// ---------------------------------------------------------------- lexicon
const CONCEPTS = {
  bleed: ['krwaw', 'krwiak', 'krwotok', 'krwi', 'krew', 'ukrwotoczn', 'wynaczyn'],
  collection: ['zbiornik'],
  ischemia: ['niedokrwien', 'udar', 'zawał'],
  edema: ['obrzęk'],
  mass: ['efekt masy', 'efektu masy', 'efektem masy', 'przemieszcz', 'przesunię', 'wgłobi', 'wklinow'],
  focal: ['ognisk', 'guz', 'przerzut', 'nowotw', 'torbiel', 'hipodens', 'hiperdens', 'malacj', 'lakun', 'naciek', 'hipoechogen', 'hiperechogen'],
  fracture: ['złama', 'szczelin', 'odłam'],
  dislocation: ['zwichnię', 'podwichnię', 'kręgozmyk', 'listez'],
  stone: ['złog', 'złóg', 'złogi', 'kamic', 'kamień', 'kamieni', 'konkrement'],
  dilatation: ['poszerz', 'rozszerz', 'wodonercz', 'wodogłow', 'zastój', 'zastoj'],
  aneurysm: ['tętniak'],
  stranding: ['zatarci', 'pasm'],
  freeAir: ['wolne powietrz', 'wolnego powietrz', 'wolnym powietrz', 'pneumoperiton'],
  pneumothorax: ['odma', 'odmy', 'odmą', 'odmie'],
  fluid: ['płyn', 'wysięk', 'wodobrzusz'],
  occlusion: ['zwęż', 'stenoz', 'niedrożn', 'okluzj', 'zakrzep', 'skrzepl', 'zator', 'ubytek wypełnienia', 'ubytki wypełnienia', 'ubytków w wypełnieniu', 'ubytek w wypełnieniu'],
  dissection: ['rozwarstwi'],
  atrophy: ['zanik', 'atrofi'],
  thickening: ['pogrubi'],
  enhancement: ['wzmacniaj', 'wzmocni'],
  injury: ['uraz', 'stłucz', 'pourazow', 'rozerw', 'laceracj', 'pęknię'],
  nodes: ['węzł', 'węzeł', 'limfaden'],
  inflammation: ['zapal', 'ropień', 'ropnia', 'ropniak'],
  consolidation: ['zagęszcz', 'konsolidac', 'niedodm', 'mlecznej szyby', 'matowej szyby'],
  asymmetry: ['asymetr'],
  disc: ['przepuklin', 'protruz', 'ekstruz', 'uwypukl', 'sekwestr'],
  degeneration: ['zwyrodnien', 'osteofit', 'przerost', 'artroz', 'modic'],
  enlargement: ['powiększ', 'hepatomegal', 'splenomegal', 'kardiomegal'],
  parenchyma: ['stłuszcz', 'niejednorodn', 'marsko', 'włóknien'],
  smallVessel: ['naczyniopochodn', 'leukoara'],
  malformation: ['naczyniak', 'malformac', 'nieprawidłowych naczyń', 'nieprawidłowe naczyni'],
  foreignBody: ['ciało obce', 'ciała obcego'],
};
// Words that make a template statement a generic "this organ is normal".
// Extra stems recognised only in template statements.
const TEMPLATE_ONLY = { parenchyma: ['echostruktur'] };
const NORMAL = [
  'prawidłow', 'bez odchyleń', 'bez istotnych', 'bez zmian', 'bez patologii', 'bez cech patologii',
  'granicach normy', 'w normie', 'zachowan', 'drożn', 'powietrzn', 'upowietrzn', 'symetryczn', 'gładk',
  'jednorodn', 'bez cech urazu', 'bez cech ostrej', 'niepowiększ', 'nieposzerz', 'cienk', 'niepogrubi', 'patologi',
];
const ACUTE = ['śwież', 'ostr', 'aktywn'];
const CHRONIC = ['przebyt', 'stary', 'starego', 'starych', 'stare', 'przewlekł', 'zastarzał', 'pozostałość', 'malacj', 'gliot', 'wygojon'];

const ORGANS = {
  head: { stems: ['głow'] },
  intracranial: { parents: ['head'], stems: ['wewnątrzczaszk', 'śródczaszk', 'mózg', 'mózgow', 'półkul', 'płat', 'płacie', 'płata', 'istot', 'móżdż', 'pień mózgu', 'pnia mózgu', 'zewnątrzosiow', 'podtward', 'nadtward', 'podpajęczyn', 'jąder podstawy', 'jądrach podstawy', 'wzgórz', 'torebk', 'okołokomor', 'przymózgow', 'zbiorniki podstawy', 'śródmózgow'] },
  ventricles: { parents: ['intracranial'], stems: ['komor', 'komór', 'układ komorow'] },
  midline: { parents: ['intracranial'], stems: ['pośrodkow', 'linii środkowej', 'linia środkowa', 'linii pośrodkowej'] },
  skull: { parents: ['head', 'bone'], stems: ['czaszk', 'sklepien', 'pokryw', 'kości ciemieniow', 'kości czołow', 'kości skroniow', 'kości potylic', 'kość ciemieniow', 'kość czołow', 'kość skroniow', 'kość potylic', 'łuski'] },
  face: { parents: ['head', 'bone'], stems: ['twarzoczaszk', 'kości twarzy'] },
  orbit: { parents: ['face'], stems: ['oczodo', 'wewnątrzoczodoł', 'gałk ocz', 'gałki ocz'] },
  zygoma: { parents: ['face'], stems: ['jarzm'] },
  tmj: { parents: ['face'], stems: ['skroniowo-żuchw', 'żuchw', 'kłykc', 'wyrostk kłykciow'] },
  maxilla: { parents: ['face'], stems: ['szczęk', 'podniebien', 'zębodoł'] },
  nasal: { parents: ['face'], stems: ['kości nosa', 'kości nosow', 'przegrod nos', 'przegrody nos'] },
  sinus: { parents: ['head'], stems: ['przynosow', 'zatok szczęk', 'zatoki szczęk', 'zatoce szczęk', 'zatok czoł', 'zatoki czoł', 'zatoce czoł', 'sitow', 'klinow'] },
  mastoid: { parents: ['head'], stems: ['sutkowat'] },
  scalp: { parents: ['head', 'soft'], stems: ['podczepcow', 'skóry głowy', 'powłok głowy', 'powłokach głowy'] },
  vessels: { stems: ['naczyń', 'naczyni', 'tętnic', 'tętnicy', 'tętnice', 'tętniczy'] },
  venous: { parents: ['vessels'], stems: ['strzałkow', 'esowat', 'jamist', 'żył', 'żyły', 'żylne', 'żyln'] },
  headArteries: { parents: ['vessels'], stems: ['szyjn', 'kręgow tętnic', 'tętnic kręgow', 'tętnicy kręgow', 'tętnice kręgow', 'willis', 'podstawn', 'tętnic mózg', 'tętnicy mózg', 'tętnicy środkowej mózgu', 'wewnątrzczaszkowych naczyń'] },
  aorta: { parents: ['vessels'], stems: ['aort', 'aorc'] },
  bone: { stems: ['kost', 'kości', 'kość', 'kośc'] },
  spine: { parents: ['bone'], stems: ['kręgosłup', 'kręg', 'trzon', 'międzywyrostk', 'wyrostk kolczyst'] },
  cspine: { parents: ['spine'], stems: ['szyjn', 'czaszkowo-szyjn', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'] },
  tspine: { parents: ['spine'], stems: ['kręgosłup piersiow', 'kręgosłupa piersiow', 'kręgosłupie piersiow', 'th1', 'th2', 'th3', 'th4', 'th5', 'th6', 'th7', 'th8', 'th9', 'th10', 'th11', 'th12'] },
  lspine: { parents: ['spine'], stems: ['lędźwiow', 'l1', 'l2', 'l3', 'l4', 'l5', 's1', 'krzyżow'] },
  disc: { parents: ['spine'], stems: ['krąż', 'dysk'] },
  canal: { parents: ['spine'], stems: ['kanał kręgow', 'kanału kręgow', 'kanale kręgow', 'otwor międzykręg', 'otwory międzykręg', 'otworów międzykręg', 'otworu międzykręg', 'otworze międzykręg', 'korzeni', 'korzeń', 'worek opon', 'worka opon'] },
  cord: { parents: ['spine'], stems: ['stożek rdzen', 'stożka rdzen', 'rdzeń', 'rdzenia', 'rdzeniu', 'ogon koński', 'ogona końsk'] },
  chest: { stems: ['klatk piersiow', 'klatki piersiow', 'klatce piersiow', 'klatkę piersiow'] },
  lung: { parents: ['chest'], stems: ['płuc', 'oskrzel', 'tchawic'] },
  pleura: { parents: ['chest'], stems: ['opłucn'] },
  mediastinum: { parents: ['chest'], stems: ['śródpiers', 'grasic', 'przełyk'] },
  heart: { parents: ['chest'], stems: ['serc', 'osierd'] },
  ribs: { parents: ['chest', 'bone'], stems: ['żebr', 'żeber'] },
  sternum: { parents: ['chest', 'bone'], stems: ['mostk'] },
  shoulderGirdle: { parents: ['chest', 'bone'], stems: ['łopatk', 'obojczyk'] },
  abdomen: { stems: ['jam brzuszn', 'jamie brzuszn', 'jamy brzuszn', 'jamę brzuszn', 'otrzewn', 'brzuch'] },
  liver: { parents: ['abdomen'], stems: ['wątrob'] },
  biliary: { parents: ['abdomen'], stems: ['pęcherzyk', 'żółciow', 'żółciowych', 'cholestaz'] },
  pancreas: { parents: ['abdomen'], stems: ['trzustk', 'trzustc', 'wirsung'] },
  spleen: { parents: ['abdomen'], stems: ['śledzion'] },
  adrenal: { parents: ['abdomen'], stems: ['nadnercz'] },
  urinary: { parents: ['abdomen'], stems: ['układ moczow', 'układzie moczow', 'układu moczow', 'dróg moczow', 'drogach moczow', 'drogi moczow', 'kamic nerkow', 'kamicy nerkow', 'kamica nerkow', 'kamicą nerkow'] },
  kidney: { parents: ['urinary'], stems: ['nerk', 'nerek', 'nerce', 'okołonerk', 'wodonercz', 'kielich', 'miedniczk'] },
  ureter: { parents: ['urinary'], stems: ['moczowod', 'moczowód', 'połączeni miedniczkowo', 'pęcherzowo-moczowod'] },
  bladder: { parents: ['urinary', 'pelvis'], stems: ['pęcherz moczow', 'pęcherza moczow', 'pęcherzu moczow'] },
  bowel: { parents: ['abdomen'], stems: ['jelit', 'okręż', 'wyrostek robacz', 'wyrostka robacz', 'wyrostku robacz', 'esic', 'kątnic', 'dwunast', 'żołąd', 'krezk'] },
  pelvis: { stems: ['miednic'] },
  pelvicBone: { parents: ['pelvis', 'bone'], stems: ['kości miednic', 'talerz', 'panewk', 'kości łonow', 'spojeni', 'kości krzyżow', 'krzyżowo-biodr', 'kości kulszow'] },
  soft: { stems: ['tkank', 'mięś', 'podskórn', 'powłok'] },
};
const RIGHT = ['prawa', 'prawej', 'prawy', 'prawym', 'prawego', 'prawą', 'prawe', 'prawych', 'prawostronn'];
const LEFT = ['lewa', 'lewej', 'lewy', 'lewym', 'lewego', 'lewą', 'lewe', 'lewych', 'lewostronn'];

const NEGATION_RE = /(^|[^\p{L}])(bez|nie|brak|braku|wykluczono|wyklucza się|nie ma|ani)([^\p{L}]|$)/u;
const UNCERTAIN_RE = /nie (można|da się|należy) wykluczyć|nie wyklucza|nie jest wykluczon|niewykluczon|podejrzeni|prawdopodobn|możliw|sugeruj|nasuwa|w różnicowaniu/u;
const CLAUSE_BREAK_RE = /[,;:()–]|\s(ale|lecz|natomiast|jednak|a|z|ze|oraz|i)\s/gu;

// ---------------------------------------------------------------- matching primitives
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const reCache = new Map();
function termRe(term, allowNie = false) {
  const key = `${term}|${allowNie}`;
  if (!reCache.has(key)) {
    const core = escapeRe(term);
    const src = term.includes(' ') ? core : `(?<![\\p{L}\\d])${allowNie ? '(?:nie)?' : ''}${core}`;
    reCache.set(key, new RegExp(src, 'gu'));
  }
  const re = reCache.get(key);
  re.lastIndex = 0;
  return re;
}
const has = (lc, terms, allowNie = false) => terms.some((t) => termRe(t, allowNie).test(lc));

function isNegatedAt(lc, idx) {
  let start = 0;
  for (const m of lc.slice(0, idx).matchAll(CLAUSE_BREAK_RE)) start = m.index + m[0].length;
  if (UNCERTAIN_RE.test(lc.slice(start, idx + 30))) return false;
  if (NEGATION_RE.test(lc.slice(start, idx))) return true;
  // Lists governed by one negation: "bez cech krwawienia, obrzęku mózgu ani efektu masy" —
  // still negated unless a positive clause ("z …", "natomiast …") starts in between.
  const head = lc.slice(0, idx);
  let lastNeg = -1;
  for (const m of head.matchAll(/(^|[^\p{L}])(bez|brak|nie stwierdz\p{L}*|nie uwidoczni\p{L}*)(?=[^\p{L}]|$)/gu)) lastNeg = m.index;
  if (lastNeg < 0) return false;
  const between = head.slice(lastNeg);
  return !/[.;]|\s(z|ze|natomiast|ale|lecz|jednak|oraz z)\s/u.test(between.slice(4));
}

export function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+|\n+/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !/^[\p{L} /-]+:$/u.test(s)); // skip sub-headers like "Głowa:"
}

/** Concepts with negation info for a dictated sentence. */
function findingConcepts(sentence) {
  const lc = sentence.toLowerCase();
  const out = new Set();
  for (const [name, terms] of Object.entries(CONCEPTS)) {
    for (const t of terms) {
      for (const m of lc.matchAll(termRe(t))) if (!isNegatedAt(lc, m.index)) out.add(name);
    }
  }
  // "zmiany pourazowe" covers every traumatic finding
  if (['fracture', 'dislocation', 'pneumothorax', 'bleed', 'freeAir'].some((c) => out.has(c))) out.add('injury');
  return out;
}

/** Concepts mentioned by a template statement (statements are mostly negations). */
function statementConcepts(text) {
  const lc = text.toLowerCase();
  const out = new Set();
  for (const [name, terms] of Object.entries(CONCEPTS)) if (has(lc, terms, true)) out.add(name);
  for (const [name, terms] of Object.entries(TEMPLATE_ONLY)) if (has(lc, terms)) out.add(name);
  // a generic "normal" statement only when it names no specific finding
  if (!out.size && has(lc, NORMAL, false)) out.add('normal');
  return out;
}

function organsIn(text) {
  const lc = text.toLowerCase();
  const out = new Set();
  for (const [name, o] of Object.entries(ORGANS)) if (has(lc, o.stems)) out.add(name);
  // a more specific organ makes its generic stems redundant ("tętnice szyjne" ≠ cervical spine)
  if (out.has('headArteries') && out.has('cspine') && !/kręg|c\d/.test(lc)) out.delete('cspine');
  // "kamica nerkowa" means the urinary tract as a whole
  if (out.has('urinary') && /kamic\p{L}* nerkow/u.test(lc)) out.delete('kidney');
  // keep the most specific organs ("kości podstawy czaszki" → skull, not every bone)
  for (const o of [...out]) for (const other of out) if (other !== o && selfAndAncestors(other).has(o)) out.delete(o);
  return out;
}

function sideOf(text) {
  const lc = text.toLowerCase();
  if (/obustronn|(?<![\p{L}])obu(?![\p{L}])|obie(?![\p{L}])|obydw/u.test(lc)) return 'both';
  const r = has(lc, RIGHT);
  const l = has(lc, LEFT);
  return r && !l ? 'R' : l && !r ? 'L' : null;
}

const ancestorsCache = new Map();
function selfAndAncestors(name) {
  if (!ancestorsCache.has(name)) {
    const out = new Set([name]);
    const stack = [name];
    while (stack.length) for (const p of ORGANS[stack.pop()]?.parents || []) if (!out.has(p)) { out.add(p); stack.push(p); }
    ancestorsCache.set(name, out);
  }
  return ancestorsCache.get(name);
}

export function analyse(text) {
  const lc = text.toLowerCase();
  return {
    text,
    concepts: statementConcepts(text),
    organs: organsIn(text),
    side: sideOf(text),
    acute: has(lc, ACUTE),
  };
}

export function analyseFinding(text) {
  const lc = text.toLowerCase();
  return {
    text,
    concepts: findingConcepts(text),
    organs: organsIn(text),
    side: sideOf(text),
    chronic: has(lc, CHRONIC),
  };
}

/** Does a dictated positive finding contradict a template statement? */
export function contradicts(stmt, finding, { wholeExam = false } = {}) {
  if (!finding.concepts.size) return false;
  if (stmt.acute && finding.chronic) return false;
  if (stmt.side && finding.side && stmt.side !== 'both' && finding.side !== 'both' && stmt.side !== finding.side) return false;

  const shared = [...stmt.concepts].filter((c) => c !== 'normal' && finding.concepts.has(c));
  const organMatch =
    stmt.organs.size > 0 &&
    finding.organs.size > 0 &&
    [...finding.organs].some((fo) => [...stmt.organs].some((so) => selfAndAncestors(fo).has(so)));

  if (shared.length) {
    if (!stmt.organs.size) return true; // e.g. "Bez wolnego płynu" / whole-exam statement
    if (organMatch) return true;
    // finding without a location: specific concepts still count (except ambiguous fluid)
    if (!finding.organs.size && shared.some((c) => c !== 'fluid')) return true;
    return false;
  }
  if (stmt.concepts.has('normal')) {
    if (organMatch) return true;
    if (wholeExam && !stmt.organs.size) return true; // "Bez cech ostrej patologii w badaniu"
  }
  return false;
}

// ---------------------------------------------------------------- list-sentence editing
const SEP_RE = /(,\s+|\s+i\s+|\s+oraz\s+|\s+ani\s+|\s+lub\s+)/u;
const NEG_LEAD_RE = /(?:^|\s)(bez cech|bez|brak cech|brak|nie stwierdza się|nie stwierdzono|nie uwidoczniono|nie uwidacznia się)\s+/iu;
const HAS_NEG_RE = /(^|[^\p{L}])(bez|brak|nie|ani)([^\p{L}]|$)/iu;

function firstOrganIndex(text) {
  const lc = text.toLowerCase();
  let best = -1;
  for (const o of Object.values(ORGANS)) {
    for (const st of o.stems) {
      const m = termRe(st).exec(lc);
      if (m && (best < 0 || m.index < best)) best = m.index;
    }
  }
  return best;
}

/**
 * Remove the parts of a template sentence contradicted by findings.
 * context: organs from a section header ("Klatka piersiowa:") for sentences naming none.
 * Returns { text, removed, trigger } — text is '' when nothing true remains.
 */
export function pruneSentence(sentence, findings, { wholeExam = false, context = null } = {}) {
  const whole = analyse(sentence);
  if (!whole.organs.size && context?.size) whole.organs = context;
  const end = /[.!?]$/.test(sentence) ? sentence.slice(-1) : '.';
  const core = sentence.replace(/[.!?]\s*$/, '');
  const parts = core.split(SEP_RE);
  const items = [];
  for (let i = 0; i < parts.length; i += 2) items.push({ text: parts[i], sep: parts[i - 1] || '' });
  const hitBy = (stmt) => findings.find((f) => contradicts(stmt, f, { wholeExam }));

  if (items.length === 1) {
    const trig = hitBy(whole);
    return trig ? { text: '', removed: true, trigger: trig.text } : { text: sentence, removed: false };
  }

  // Item-level analysis; an item inherits the sentence's organs / concepts when it names none.
  let trigger = null;
  const v = items.map((it) => {
    const a = analyse(it.text);
    const stmt = {
      ...a,
      concepts: a.concepts.size ? a.concepts : whole.concepts,
      organs: a.organs.size ? a.organs : whole.organs,
      side: a.side || whole.side,
      acute: a.acute, // "ostrych zmian niedokrwiennych" — qualifier belongs to its own item
    };
    const f = hitBy(stmt);
    if (f && !trigger) trigger = f.text;
    return { ...it, own: a, hit: Boolean(f), text: it.text };
  });
  if (!v.some((x) => x.hit)) return { text: sentence, removed: false };
  if (v.every((x) => x.hit)) return { text: '', removed: true, trigger };

  // The predicate sits on the last item ("… i nadnercza o prawidłowym wyglądzie"); keep it.
  const last = v[v.length - 1];
  const keptIdx = v.map((x, i) => (x.hit ? -1 : i)).filter((i) => i >= 0);
  if (last.hit) {
    const m = last.text.match(/\s(o\s|bez\s|prawidłow|mają|ma\s|są\s|nie\s|w\s|–|-)(.*)$/u);
    const k = v[keptIdx[keptIdx.length - 1]];
    if (m && !k.text.endsWith(last.text.slice(m.index))) k.text += last.text.slice(m.index);
  }

  // A kept item may have lost the negation (or "Bez cech urazu …") that governed it.
  for (const i of keptIdx) {
    const it = v[i];
    if (HAS_NEG_RE.test(it.text) || /^\p{Lu}/u.test(it.text)) continue;
    let p = i - 1;
    while (p >= 0 && !HAS_NEG_RE.test(v[p].text)) p--;
    if (p < 0 || !v[p].hit) continue;
    // nearest kept item between p and i already carries the negation → fine
    if (keptIdx.some((k) => k > p && k < i)) continue;
    const gov = v[p].text;
    const lead = gov.match(NEG_LEAD_RE);
    if (!lead) continue;
    // keep the sentence subject ("Struktury mózgowia bez …") when its item is removed
    const leadStart = p === 0 ? 0 : lead.index + (lead[0].startsWith(' ') ? 1 : 0);
    let prefix = gov.slice(leadStart, lead.index + lead[0].length);
    const justOrgan = !it.own.concepts.size || it.own.concepts.has('normal');
    if (justOrgan) {
      const negPart = lead.index + (lead[0].startsWith(' ') ? 1 : 0);
      const oi = firstOrganIndex(gov.slice(negPart));
      if (oi > 0) prefix = gov.slice(leadStart, negPart + oi);
    }
    it.text = prefix + it.text;
  }

  // The subject of a removed first item ("Struktury mózgowia bez zmian ogniskowych") stays.
  if (v[0].hit) {
    const lead = v[0].text.match(NEG_LEAD_RE);
    const subject = lead && lead.index > 0 ? v[0].text.slice(0, lead.index).trim() : '';
    const first = v[keptIdx[0]];
    if (subject && !first.text.startsWith(subject)) first.text = `${subject} ${first.text.replace(/^\p{Lu}/u, (c) => c.toLowerCase())}`;
  }

  const kept = keptIdx.map((i) => v[i]);
  const conj = (v.slice().reverse().find((x) => /\s(i|oraz|ani|lub)\s/u.test(x.sep))?.sep || ' i ').trim();
  let text = kept[0].text.trim();
  for (let i = 1; i < kept.length; i++) text += (i === kept.length - 1 ? ` ${conj} ` : ', ') + kept[i].text.trim();
  text = text.replace(/^\p{Ll}/u, (c) => c.toUpperCase()) + end;
  return { text, removed: true, trigger };
}

// ---------------------------------------------------------------- report-level checks
const stripBullet = (s) => s.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim();
const isHeader = (line) => /^[\p{L} ,/-]+:\s*$/u.test(line.trim());

function templateSentences(template) {
  return {
    body: new Set(splitSentences(template.body)),
    conclusion: new Set(splitSentences(template.conclusion).map(stripBullet)),
  };
}

/** Positive findings written by the radiologist (anything that is not template text). */
export function findingsOf(template, report) {
  const tpl = templateSentences(template);
  const own = [
    ...splitSentences(report.body).filter((s) => !tpl.body.has(s)),
    ...splitSentences(report.conclusion).map(stripBullet).filter((s) => !tpl.conclusion.has(s)),
  ];
  return own.map(analyseFinding).filter((f) => f.concepts.size);
}

/**
 * Template statements still in the report that contradict a finding.
 * Returns [{ where: 'body'|'conclusion', original, replacement, trigger }].
 */
export function findConflicts(template, report, { ignore = [] } = {}) {
  const findings = findingsOf(template, report);
  if (!findings.length) return [];
  const tpl = templateSentences(template);
  const out = [];
  let context = null;
  for (const line of report.body.split('\n')) {
    if (isHeader(line)) { context = organsIn(line); continue; }
    if (!line.trim()) continue;
    for (const s of splitSentences(line)) {
      if (!tpl.body.has(s) || ignore.includes(s)) continue;
      const r = pruneSentence(s, findings, { context });
      if (r.removed) out.push({ where: 'body', original: s, replacement: r.text, trigger: r.trigger });
    }
  }
  for (const line of report.conclusion.split('\n')) {
    const s = stripBullet(line);
    if (!s || !tpl.conclusion.has(s) || ignore.includes(s)) continue;
    const r = pruneSentence(s, findings, { wholeExam: true });
    if (r.removed) out.push({ where: 'conclusion', original: s, replacement: r.text, trigger: r.trigger });
  }
  return out;
}

/** Apply conflict fixes to a report (lines emptied by a removal disappear). */
export function applyConflicts(template, report, conflicts) {
  let lines = report.body.split('\n').map((text) => ({ text, was: text.trim() !== '' }));
  for (const c of conflicts.filter((x) => x.where === 'body')) {
    const line = lines.find((l) => l.text.includes(c.original));
    if (line) line.text = line.text.replace(c.original, c.replacement).replace(/[ \t]{2,}/g, ' ').trim();
  }
  lines = lines.filter((l) => !(l.was && !l.text.trim()));
  // a header left without content goes too
  const body = lines
    .map((l) => l.text)
    .filter((t, i, arr) => !(isHeader(t) && (i === arr.length - 1 || !arr[i + 1].trim() || isHeader(arr[i + 1]))))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '');

  let conclusionLines = report.conclusion.split('\n');
  for (const c of conflicts.filter((x) => x.where === 'conclusion')) {
    conclusionLines = conclusionLines
      .map((l) => (stripBullet(l) === c.original ? (c.replacement ? l.replace(c.original, c.replacement) : null) : l))
      .filter((l) => l !== null);
  }
  return { ...report, body, conclusion: renumber(conclusionLines.join('\n').trim(), template.bullet) };
}

function renumber(conclusion, style) {
  if (style !== 'number') return conclusion;
  let n = 0;
  return conclusion.split('\n').map((l) => (/^\s*\d+[.)]\s/.test(l) ? l.replace(/^\s*\d+[.)]/, () => `${++n}.`) : l)).join('\n');
}

// Clinical urgency used to order conclusion lines.
const URGENCY = ['bleed', 'mass', 'pneumothorax', 'dissection', 'occlusion', 'freeAir', 'ischemia', 'edema', 'fracture', 'dislocation', 'injury', 'aneurysm', 'consolidation', 'fluid', 'stone', 'dilatation', 'inflammation', 'focal', 'nodes', 'disc', 'enlargement'];
function urgency(f) {
  const ranks = [...f.concepts].map((c) => URGENCY.indexOf(c)).filter((i) => i >= 0);
  return (ranks.length ? Math.min(...ranks) : URGENCY.length) + (f.chronic ? 100 : 0);
}

/** Short conclusion form of a finding sentence. */
export function shortenFinding(sentence) {
  let s = sentence.trim().replace(/[.!?]+$/, '');
  s = s.replace(/^(uwidoczniono|stwierdzono|stwierdza się|widoczn\p{L}*|obecn\p{L}*|widać|w badaniu (uwidoczniono|stwierdzono))\s+/iu, '');
  // negative side-details ("…, bez efektu masy") belong in the description, not the conclusion
  s = s.replace(/,?\s+(bez|nie)\s[^,;]*$/iu, '');
  s = s.replace(/\s{2,}/g, ' ').trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) + '.' : '';
}

/** Conclusion lines from the pathological findings in the body, most urgent first. */
export function conclusionFromFindings(template, report) {
  const tpl = templateSentences(template);
  return splitSentences(report.body)
    .filter((s) => !tpl.body.has(s))
    .map(analyseFinding)
    .filter((f) => f.concepts.size)
    .sort((a, b) => urgency(a) - urgency(b))
    .map((f) => shortenFinding(f.text))
    .filter(Boolean);
}

export function draftConclusion(template, report) {
  return formatConclusion(conclusionFromFindings(template, report), template.bullet);
}

/**
 * Cross-check: remove every template statement contradicted by a dictated finding, then make
 * sure the conclusion states the pathology (short form, most urgent first) ahead of the
 * template's remaining, still-true conclusion lines.
 * Returns { report, corrections, warnings }.
 */
export function enforceConsistency(template, report) {
  const conflicts = findConflicts(template, report);
  let next = applyConflicts(template, report, conflicts);
  const corrections = conflicts.map((c) => ({
    removed: c.original,
    replacement: c.replacement,
    reason: c.trigger ? `sprzeczne z: „${c.trigger}”` : '',
  }));
  const warnings = [];
  const lines = next.conclusion.split('\n').map(stripBullet).filter(Boolean);
  const findings = conclusionFromFindings(template, next);
  const auto = new Set(findings);
  // Pathology lines in the conclusion; if all of them were generated here before, regenerate.
  const pathLines = lines.filter((l) => analyseFinding(l).concepts.size);
  const userWritten = pathLines.some((l) => !auto.has(l));
  const missing = findings.some((f) => !lines.includes(f));
  if (!userWritten && missing) {
    const rest = lines.filter((l) => !analyseFinding(l).concepts.size);
    next = { ...next, conclusion: formatConclusion([...findings, ...rest], template.bullet) };
    warnings.push('Wnioski utworzono automatycznie z opisanych zmian — zweryfikuj je.');
  }
  return { report: next, corrections, warnings };
}

// ---------------------------------------------------------------- local (non-AI) merge
const CONCLUSION_RE = /^(wnios\p{L}*|podsumow\p{L}*|konkluzj\p{L}*)[\s:,–-]*/iu;
const REST_NORMAL_RE = /^(poza tym|pozostał\p{L}*|reszta|w pozostałym zakresie)\b.*(bez (zmian|odchyleń|istotnych)|w normie|prawidłow\p{L}*)/iu;

function organScore(a, b) {
  let s = 0;
  for (const x of a) for (const y of b) if (selfAndAncestors(x).has(y) || selfAndAncestors(y).has(x)) s += x === y ? 3 : 1;
  return s;
}

/** Insert a dictated sentence next to the body line about the same organ. */
function insertFinding(body, sentence) {
  const lines = body.split('\n');
  const f = analyseFinding(sentence);
  let best = -1;
  let bestScore = 0;
  lines.forEach((line, i) => {
    if (!line.trim() || /:\s*$/.test(line)) return;
    const score = organScore(f.organs, organsIn(line));
    if (score > bestScore) { best = i; bestScore = score; }
  });
  if (best < 0) {
    // no matching organ: add as its own line at the end of the description
    return `${body.replace(/\s+$/, '')}\n${sentence}`;
  }
  lines.splice(best + 1, 0, sentence);
  return lines.join('\n');
}

/**
 * Non-AI fallback: place dictated sentences in the description next to the matching
 * organ, then cross-check the whole report. Returns { report, warnings, corrections }.
 */
export function localMerge(template, report, dictation) {
  const sentences = splitSentences(normalizeDictation(dictation));
  const bodyAdd = [];
  const conclusionAdd = [];
  let inConclusion = false;
  for (let s of sentences) {
    if (CONCLUSION_RE.test(s)) {
      inConclusion = true;
      s = tidy(s.replace(CONCLUSION_RE, ''));
      if (!s || s === '.') continue;
    }
    if (inConclusion) conclusionAdd.push(s);
    else if (!REST_NORMAL_RE.test(s)) bodyAdd.push(s);
  }

  let body = report.body;
  for (const s of bodyAdd) {
    // A purely negative sentence already stated by the template adds nothing ("bez cech krwawienia").
    const f = analyseFinding(s);
    const neg = statementConcepts(s);
    if (!f.concepts.size && neg.size && [...neg].every((c) => c !== 'normal' && statementConcepts(body).has(c))) continue;
    body = insertFinding(body, s);
  }

  let conclusion = report.conclusion;
  if (conclusionAdd.length) {
    const tpl = templateSentences(template);
    const ownLines = conclusion.split('\n').map(stripBullet).filter((s) => s && !tpl.conclusion.has(s));
    const keep = ownLines; // dictated conclusions replace the default "normal" ones
    conclusion = formatConclusion([...keep, ...conclusionAdd], template.bullet);
  }

  const checked = enforceConsistency(template, { ...report, body, conclusion });
  return { report: checked.report, warnings: checked.warnings, corrections: checked.corrections };
}

// Procedure card ("Karta zabiegu"): structured record of an IR procedure — branch, region (diagram),
// lesions clicked on the diagram with findings, procedures and devices, access, drugs, dose, complications.
// The card feeds both documents: the factual REPORT (via the dictation → AI merge) and the LETTER to the
// referring doctor. Pure functions only (used in the browser and in tests).
import { procLabel } from './anatomy.js';
import { variantText } from './variants.js';
import { lesionFacts, lesionDef, clinicalFacts } from './clinical.js';

const L = (pair, lang) => (Array.isArray(pair) ? pair[lang === 'en' ? 1 : 0] : pair);
// decimal separator of numbers only ("18.5" → "18,5" in Polish), never dots in units such as "j.m."
const num = (v, lang) => String(v ?? '').trim().replace(lang === 'en' ? /(\d),(\d)/g : /(\d)\.(\d)/g, lang === 'en' ? '$1.$2' : '$1,$2');
const endDot = (s) => (/[.!?]$/.test(s) ? s : s + '.');
const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';

// Lesion types with their fields, scales and calculators live in clinical.js.
export { LESIONS as FINDINGS, lesionDef as findingDef } from './clinical.js';

export const ACCESS_SITES = {
  Vascular: [
    ['cfa', 'tętnica udowa wspólna', 'common femoral artery'], ['radial', 'tętnica promieniowa', 'radial artery'], ['distal_radial', 'dystalna tętnica promieniowa (tabakierka)', 'distal radial artery (snuffbox)'],
    ['brachial', 'tętnica ramienna', 'brachial artery'], ['popliteal_a', 'tętnica podkolanowa', 'popliteal artery'], ['pedal', 'tętnica stopy / goleni (retrogradnie)', 'pedal / tibial artery (retrograde)'],
    ['cfa_antegrade', 'tętnica udowa wspólna – antegradowo', 'common femoral artery – antegrade'], ['cfv', 'żyła udowa wspólna', 'common femoral vein'], ['ijv', 'żyła szyjna wewnętrzna', 'internal jugular vein'],
    ['popliteal_v', 'żyła podkolanowa', 'popliteal vein'], ['basilic', 'żyła odłokciowa / ramienna', 'basilic / brachial vein'], ['fistula', 'przetoka / proteza dializacyjna', 'dialysis fistula / graft'],
    ['transhepatic', 'przezwątrobowo', 'transhepatic'], ['translumbar', 'przezlędźwiowo', 'translumbar'],
  ],
  Neuro: [
    ['cfa', 'tętnica udowa wspólna', 'common femoral artery'], ['radial', 'tętnica promieniowa', 'radial artery'], ['distal_radial', 'dystalna tętnica promieniowa (tabakierka)', 'distal radial artery (snuffbox)'],
    ['brachial', 'tętnica ramienna', 'brachial artery'], ['cca_direct', 'bezpośrednie nakłucie tętnicy szyjnej', 'direct carotid puncture'], ['cfv', 'żyła udowa wspólna', 'common femoral vein'], ['ijv', 'żyła szyjna wewnętrzna', 'internal jugular vein'],
  ],
  NonVascular: [
    ['percutaneous', 'przezskórnie', 'percutaneous'], ['transhepatic', 'przezwątrobowo', 'transhepatic'], ['transgluteal', 'przezpośladkowo', 'transgluteal'],
    ['transpedicular', 'przeznasadowo', 'transpedicular'], ['transgastric', 'przezżołądkowo', 'transgastric'], ['existing_drain', 'przez istniejący dren / nefrostomię', 'via an existing drain / nephrostomy'],
    ['peroral', 'przez usta (pod fluoroskopią)', 'peroral (fluoroscopic)'], ['transrectal', 'przezodbytniczo', 'transrectal'],
  ],
};
export const GUIDANCE = [['us', 'USG', 'ultrasound'], ['ct', 'TK', 'CT'], ['fluoro', 'fluoroskopia', 'fluoroscopy'], ['cbct', 'CBCT', 'cone-beam CT'], ['ct_fluoro', 'TK-fluoroskopia', 'CT fluoroscopy'], ['mr', 'MR', 'MRI']];
export const ANAESTHESIA = [['local', 'miejscowe', 'local anaesthesia'], ['sedation', 'sedacja', 'sedation'], ['general', 'ogólne', 'general anaesthesia'], ['none', 'bez znieczulenia', 'none']];
export const URGENCY = [['planned', 'planowy', 'elective'], ['urgent', 'pilny', 'urgent'], ['emergency', 'ze wskazań nagłych', 'emergency']];
export const OUTCOME = [['success', 'skuteczny technicznie', 'technically successful'], ['partial', 'częściowo skuteczny', 'partially successful'], ['failed', 'nieskuteczny', 'technically unsuccessful']];
export const SIDES = [['right', 'prawa', 'right'], ['left', 'lewa', 'left']];
const pick = (list, id, lang) => { const x = list.find((y) => y[0] === id); return x ? x[lang === 'en' ? 2 : 1] : ''; };

export function emptyCard() {
  return {
    branch: null, diagram: null, urgency: 'planned', indication: '', variants: [], clinical: {},
    access: { site: '', side: '', sheath: '', closure: '' }, guidance: [], anaesthesia: '',
    lesions: [], devices: [], contrast: '', fluoro: '', dose: '', doseUnit: 'Gy·cm²',
    complications: { none: true, text: '' }, outcome: 'success', recommendations: '', followUp: '', notes: '',
  };
}
export const newLesion = (diagram, part, kind, t = 0.5) => ({ id: `les${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, diagram, part, kind, t, side: '', finding: kind === 'organ' ? 'mass' : 'stenosis', pre: '', post: '', size: '', length: '', extra: '', procs: [], devices: [], notes: '' });

/** "Supera (Abbott) 6 × 80 mm ×2" — a device line. */
export function deviceText(d, lang = 'pl') {
  if (!d) return '';
  const name = d.maker ? `${d.name} (${d.maker})` : d.name;
  const size = has(d.size) ? ` ${num(d.size, lang)}` : '';
  const qty = Number(d.qty) > 1 ? ` ×${d.qty}` : '';
  return `${name}${size}${qty}`.trim();
}

/** Short badge for the diagram: "80%→0%", "eTICI 3", "Ø 7 mm". */
export function lesionBadge(l) {
  if (!l) return '';
  if ((l.finding === 'stenosis' || l.finding === 'occlusion') && has(l.pre)) return `${String(l.pre).replace(/%$/, '')}%${has(l.post) ? `→${String(l.post).replace(/%$/, '')}%` : ''}`;
  if (l.finding === 'occlusion') return has(l.post) ? `occl→${l.post}%` : 'occl';
  if (l.finding === 'thrombus') return has(l.post) ? `eTICI ${l.post}` : has(l.pre) ? `eTICI ${l.pre}` : 'clot';
  if (l.finding === 'aneurysm' && has(l.size)) return `${String(l.size).slice(0, 12)} mm${has(l.post) ? ` · RR ${l.post}` : ''}`;
  if (has(l.post)) return String(l.post).slice(0, 12);
  if (has(l.size)) return `${String(l.size).slice(0, 10)} mm`;
  return '•';
}

/** One lesion as a sentence block (Polish or English). `part` = the diagram part object. */
export function lesionText(l, part, lang = 'pl', { label, vascular = true } = {}) {
  const en = lang === 'en';
  const where = label || (part ? part.label[en ? 1 : 0] : l.part);
  const def = lesionDef(l.kind, l.finding);
  const facts = lesionFacts(l, lang, { vascular });
  const head = def && l.finding !== 'other' ? def.label[en ? 1 : 0].toLowerCase() : '';
  const pos = Number.isFinite(l.t) && part?.pts ? (l.t < 0.34 ? (en ? 'proximal part' : 'odcinek proksymalny') : l.t > 0.66 ? (en ? 'distal part' : 'odcinek dystalny') : (en ? 'mid part' : 'odcinek środkowy')) : '';
  const bits = [head, pos, ...facts.pre, ...facts.computed].filter(Boolean);
  let s = `${where}${bits.length ? ` — ${bits.join(', ')}` : ''}.`;
  if (l.procs?.length) s += ` ${en ? 'Performed' : 'Wykonano'}: ${l.procs.map((p) => procLabel(p, lang).replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase()).join(', ')}.`;
  if (l.devices?.length) s += ` ${en ? 'Devices' : 'Sprzęt'}: ${l.devices.map((d) => deviceText(d, lang)).join('; ')}.`;
  if (facts.post.length) s += ` ${en ? 'Result' : 'Wynik'}: ${facts.post.join(', ')}.`;
  if (has(l.notes)) s += ` ${String(l.notes).trim().replace(/([^.!?])$/, '$1.')}`;
  return s;
}

/** Procedures done on the card, most important first (for the template suggestion and the letter title). */
export function cardProcedures(card) {
  const out = [];
  for (const l of card.lesions || []) for (const p of l.procs || []) if (!out.includes(p)) out.push(p);
  return out;
}

/**
 * The whole card as plain text — used as "dictation" for the report AI and as the fact sheet for the letter.
 * `partOf(diagramId, partId)` returns the diagram part; `labelOf(lesion)` (optional) its display label with side.
 */
export function cardToText(card, { lang = 'pl', partOf = () => null, labelOf = null } = {}) {
  const en = lang === 'en';
  const lines = [];
  const procs = cardProcedures(card);
  if (procs.length) lines.push(`${en ? 'Procedure' : 'Zabieg'}: ${procs.map((p) => procLabel(p, lang)).join(', ')}${card.urgency ? ` (${en ? 'setting' : 'tryb'}: ${pick(URGENCY, card.urgency, lang)})` : ''}.`);
  if (has(card.indication)) lines.push(`${en ? 'Indication' : 'Wskazanie'}: ${String(card.indication).trim().replace(/([^.!?])$/, '$1.')}`);
  if (card.anaesthesia) lines.push(`${en ? 'Anaesthesia' : 'Znieczulenie'}: ${pick(ANAESTHESIA, card.anaesthesia, lang)}.`);
  if (card.guidance?.length) lines.push(`${en ? 'Guidance' : 'Kontrola obrazowa'}: ${card.guidance.map((g) => pick(GUIDANCE, g, lang)).filter(Boolean).join(', ')}.`);
  const a = card.access || {};
  if (a.site || has(a.sheath) || has(a.closure)) {
    const site = a.site ? pick([...ACCESS_SITES.Vascular, ...ACCESS_SITES.Neuro, ...ACCESS_SITES.NonVascular], a.site, lang) : '';
    const side = a.side ? pick(SIDES, a.side, lang) : '';
    const where = [en ? side : '', site, en ? '' : side].filter(Boolean).join(' ');
    const parts = [where, has(a.sheath) ? `${en ? 'sheath' : 'koszulka'} ${num(a.sheath, lang)}` : '', has(a.closure) ? `${en ? 'haemostasis' : 'hemostaza'}: ${a.closure}` : ''].filter(Boolean);
    lines.push(`${en ? 'Access' : 'Dostęp'}: ${parts.join('; ')}.`);
  }
  for (const line of clinicalFacts(card.clinical || {}, card.branch === 'Neuro' ? 'Neuro' : card.branch === 'Vascular' ? 'Vascular' : null, lang)) lines.push(line);
  const vars = (card.variants || []).map((v) => variantText(v, lang)).filter(Boolean);
  if (vars.length) lines.push(`${en ? 'Anatomical variants' : 'Warianty anatomiczne'}: ${vars.join('; ')}.`);
  (card.lesions || []).forEach((l, i) => {
    const part = partOf(l.diagram, l.part);
    lines.push(`${en ? 'Lesion' : 'Zmiana'} ${i + 1}: ${lesionText(l, part, lang, { label: labelOf ? labelOf(l) : undefined, vascular: card.branch !== 'Neuro' })}`);
  });
  const general = (card.devices || []).filter((d) => d.cat !== 'drugs');
  const drugs = (card.devices || []).filter((d) => d.cat === 'drugs');
  if (general.length) lines.push(`${en ? 'Other devices' : 'Pozostały sprzęt'}: ${general.map((d) => deviceText(d, lang)).join('; ')}.`);
  if (drugs.length) lines.push(endDot(`${en ? 'Drugs' : 'Leki'}: ${drugs.map((d) => deviceText(d, lang)).join('; ')}`));
  const dose = [has(card.contrast) ? `${en ? 'contrast' : 'kontrast'} ${num(card.contrast, lang)} ml` : '', has(card.fluoro) ? `${en ? 'fluoroscopy time' : 'czas fluoroskopii'} ${num(card.fluoro, lang)} min` : '', has(card.dose) ? `${en ? 'dose' : 'dawka'} ${num(card.dose, lang)} ${card.doseUnit || 'Gy·cm²'}` : ''].filter(Boolean);
  if (dose.length) lines.push(`${dose.join(', ').replace(/^./, (c) => c.toUpperCase())}.`);
  if (card.outcome) lines.push(`${en ? 'Technical result' : 'Wynik techniczny'}: ${pick(OUTCOME, card.outcome, lang)}.`);
  const c = card.complications || {};
  if (c.none && !has(c.text)) lines.push(en ? 'Complications: none.' : 'Powikłania: bez powikłań.');
  else if (has(c.text)) lines.push(`${en ? 'Complications' : 'Powikłania'}: ${String(c.text).trim().replace(/([^.!?])$/, '$1.')}`);
  if (has(card.recommendations)) lines.push(`${en ? 'Recommendations' : 'Zalecenia'}: ${String(card.recommendations).trim().replace(/([^.!?])$/, '$1.')}`);
  if (has(card.followUp)) lines.push(`${en ? 'Follow-up' : 'Kontrola'}: ${String(card.followUp).trim().replace(/([^.!?])$/, '$1.')}`);
  if (has(card.notes)) lines.push(String(card.notes).trim().replace(/([^.!?])$/, '$1.'));
  return lines.join('\n');
}

/** Values a complete record should have (shown before writing the report / letter). */
export function cardGaps(card, lang = 'pl') {
  const en = lang === 'en';
  const out = [];
  if (!card.lesions?.length) out.push(en ? 'no vessel / organ marked on the diagram' : 'nie zaznaczono naczynia / narządu na schemacie');
  if (card.lesions?.length && !cardProcedures(card).length) out.push(en ? 'no procedure chosen' : 'nie wybrano zabiegu');
  if (!card.access?.site) out.push(en ? 'access' : 'dostęp');
  if (card.branch !== 'NonVascular' && !card.contrast) out.push(en ? 'contrast volume' : 'ilość kontrastu');
  if (card.branch !== 'NonVascular' && !card.fluoro) out.push(en ? 'fluoroscopy time' : 'czas fluoroskopii');
  if (card.branch !== 'NonVascular' && !card.dose) out.push(en ? 'dose (KAP)' : 'dawka (KAP)');
  if (!card.complications?.none && !card.complications?.text) out.push(en ? 'complications' : 'powikłania');
  return out;
}

// ---------------------------------------------------------------- letter placeholders
// The letter is written with placeholders; names are filled in on this computer only (never sent to the AI).
export const PH = { greeting: '[[ZWROT]]', patient: '[[PACJENT]]', dob: '[[DATA_UR]]', date: '[[DATA_ZABIEGU]]', referrer: '[[LEKARZ]]', signature: '[[PODPIS]]' };

export function greeting(title, lang = 'pl') {
  if (lang === 'en') return title === 'team' ? 'Dear Colleagues,' : 'Dear Doctor,';
  return { female: 'Szanowna Pani Doktor,', male: 'Szanowny Panie Doktorze,', team: 'Szanowni Państwo,' }[title] || 'Szanowni Państwo,';
}

/** Fill the placeholders with local data. */
export function fillLetter(text, ctx = {}, lang = 'pl') {
  const dash = lang === 'en' ? '[patient]' : '[pacjent]';
  return String(text || '')
    .replaceAll(PH.greeting, greeting(ctx.referrerTitle, lang))
    .replaceAll(PH.patient, ctx.patient || dash)
    .replaceAll(PH.dob, ctx.dob || '…')
    .replaceAll(PH.date, ctx.date || '…')
    .replaceAll(PH.referrer, ctx.referrer || '…')
    .replaceAll(PH.signature, ctx.signature || '…');
}
/** Back to placeholders before the letter is stored or sent to the AI. */
export function pseudonymiseLetter(text, ctx = {}, lang = 'pl') {
  let t = String(text || '');
  const swap = (value, ph) => { if (value && String(value).trim().length > 1) t = t.split(String(value)).join(ph); };
  swap(ctx.signature, PH.signature);
  swap(greeting(ctx.referrerTitle, lang), PH.greeting);
  swap(ctx.patient, PH.patient);
  swap(ctx.dob, PH.dob);
  swap(ctx.referrer, PH.referrer);
  swap(ctx.date, PH.date);
  return t;
}

/** Built-in letter (no AI): a plain, correct letter assembled from the card. */
export function builtinLetter(card, { lang = 'pl', partOf = () => null, labelOf = null } = {}) {
  const en = lang === 'en';
  const procs = cardProcedures(card).map((p) => procLabel(p, lang).replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase());
  const what = procs.length ? procs.join(', ') : en ? 'the planned procedure' : 'zaplanowany zabieg';
  const out = [PH.greeting, ''];
  out.push(en
    ? `Thank you for referring ${PH.patient} (date of birth ${PH.dob}). On ${PH.date} we performed: ${what}.`
    : `dziękujemy za skierowanie Pacjenta/Pacjentki ${PH.patient} (data urodzenia ${PH.dob}). W dniu ${PH.date} wykonaliśmy: ${what}.`);
  if (has(card.indication)) out.push(en ? `Indication: ${card.indication.trim().replace(/([^.!?])$/, '$1.')}` : `Wskazanie: ${card.indication.trim().replace(/([^.!?])$/, '$1.')}`);
  const les = card.lesions || [];
  if (les.length) {
    out.push('');
    out.push(en ? 'Procedure details:' : 'Przebieg i wynik:');
    les.forEach((l) => out.push(`- ${lesionText(l, partOf(l.diagram, l.part), lang, { label: labelOf ? labelOf(l) : undefined })}`));
  }
  out.push('');
  out.push(`${en ? 'Technical result' : 'Wynik techniczny'}: ${pick(OUTCOME, card.outcome || 'success', lang)}.`);
  const c = card.complications || {};
  out.push(c.none && !has(c.text) ? (en ? 'There were no complications.' : 'Zabieg przebiegł bez powikłań.') : `${en ? 'Complications' : 'Powikłania'}: ${String(c.text || '…').trim().replace(/([^.!?])$/, '$1.')}`);
  const drugs = (card.devices || []).filter((d) => d.cat === 'drugs');
  if (drugs.length) out.push(endDot(`${en ? 'Drugs given' : 'Podane leki'}: ${drugs.map((d) => deviceText(d, lang)).join('; ')}`));
  if (has(card.recommendations) || has(card.followUp)) {
    out.push('');
    out.push(en ? 'Recommendations:' : 'Zalecenia:');
    if (has(card.recommendations)) out.push(`- ${card.recommendations.trim().replace(/([^.!?])$/, '$1.')}`);
    if (has(card.followUp)) out.push(`- ${en ? 'Follow-up' : 'Kontrola'}: ${card.followUp.trim().replace(/([^.!?])$/, '$1.')}`);
  }
  out.push('');
  out.push(en ? 'Please do not hesitate to contact us with any questions.' : 'W razie pytań pozostajemy do dyspozycji.');
  out.push('');
  out.push(en ? 'Kind regards,' : 'Z wyrazami szacunku,');
  out.push(PH.signature);
  return out.join('\n');
}

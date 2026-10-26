// "Say what you did" → procedure card. Two paths produce the same structure:
//   • the AI (/api/ucard-parse, lib/cardparse.js) — best understanding of free speech,
//   • localParse() below — rule-based, works offline and without AI (Polish and English).
// applyParsed() merges the result into the card: lesions on the right vessel of the 3D model, findings,
// procedures, devices (matched to the catalogue), access, anaesthesia, dose, clinical scores.
// Nothing is guessed: what is not said stays empty.
import { newLesion } from './card.js';
import { LESIONS, ETICI } from './clinical.js';

const norm = (s) => String(s || '').normalize('NFC');
const NUMW = {
  jeden: 1, jedna: 1, jedną: 1, jedno: 1, jednej: 1, jednego: 1, one: 1, single: 1,
  dwa: 2, dwie: 2, dwóch: 2, dwoma: 2, two: 2, trzy: 3, trzech: 3, trzema: 3, three: 3, cztery: 4, czterech: 4, four: 4,
  pięć: 5, pięciu: 5, five: 5, sześć: 6, sześciu: 6, six: 6, siedem: 7, siedmiu: 7, seven: 7, osiem: 8, ośmiu: 8, eight: 8,
  dziewięć: 9, dziewięciu: 9, nine: 9, dziesięć: 10, dziesięciu: 10, ten: 10, jedenaście: 11, eleven: 11, dwanaście: 12, twelve: 12,
};
const NUMRE = `(\\d{1,2}|${Object.keys(NUMW).join('|')})`;
const toNum = (w) => (/^\d+$/u.test(w) ? Number(w) : NUMW[String(w).toLowerCase()] || null);
const dec = (s) => String(s).replace('.', ',');

// ------------------------------------------------------------------ vessels: words → model part (base id)
// side: true = paired vessel (needs right / left). t = default position along the vessel.
const V = (re, base, model, extra = {}) => ({ re, base, model, ...extra });
const VESSELS = [
  // neuro — most specific first
  V(/\b(acom-?a|acoa|acom|a-?com)\b|łącząc[\p{L}\d_]*\s+przedni|anterior communicating/iu, 'acom', 'neuro3d'),
  V(/\b(pcom-?a|pcoa|pcom|p-?com)\b|łącząc[\p{L}\d_]*\s+tyln|posterior communicating/iu, 'pcom', 'neuro3d', { side: true, t: 0.15 }),
  V(/szczyt[\p{L}\d_]*\s+(tętnicy\s+)?podstawn|basilar\s+(tip|apex)|\bBA\s+tip\b|top of the basilar/iu, 'ba_tip', 'neuro3d'),
  V(/tętnic[\p{L}\d_]*\s+podstawn|\bbasilar\b/iu, 'ba', 'neuro3d'),
  V(/\bPICA\b|tyln[\p{L}\d_]*\s+doln[\p{L}\d_]*\s+móżdżk/iu, 'pica', 'neuro3d', { side: true, t: 0.2 }),
  V(/\bAICA\b|przedni[\p{L}\d_]*\s+doln[\p{L}\d_]*\s+móżdżk/iu, 'aica', 'neuro3d', { side: true, t: 0.2 }),
  V(/\bSCA\b(?!\s*(prox|podobojcz))|górn[\p{L}\d_]*\s+móżdżk|superior cerebellar/iu, 'sca', 'neuro3d', { side: true, t: 0.15 }),
  V(/obrzeżn[\p{L}\d_]*\s+spoidł|callosomarginal/iu, 'callosomarginal', 'neuro3d', { side: true }),
  V(/okołospoidł|pericallosal|\bA4\b|\bA5\b/iu, 'aca_a4', 'neuro3d', { side: true }),
  V(/\bA3\b|kolan[\p{L}\d_]*\s+(ciała modzelowatego|ACA)/iu, 'aca_a3', 'neuro3d', { side: true }),
  V(/\bA2\b/iu, 'aca_a2', 'neuro3d', { side: true }),
  V(/\bA1\b/iu, 'aca_a1', 'neuro3d', { side: true }),
  V(/\bACA\b|przedni[\p{L}\d_]*\s+mózg|anterior cerebral/iu, 'aca_a1', 'neuro3d', { side: true, generic: true }),
  V(/(rozwidleni|bifurkacj|podział)[\p{L}\d_]*\s+([\p{L}\d_]+\s+){0,2}(MCA|tętnicy środkowej mózgu)|\bMCA\s+(bifurcation|rozwidleni|bifurkacj)[\p{L}\d_]*|MCA bi(furcation)?\b/iu, 'mca_bif', 'neuro3d', { side: true, t: 0.5 }),
  V(/\bM1\b/iu, 'mca_m1', 'neuro3d', { side: true }),
  V(/\bM2\b/iu, 'mca_m2s', 'neuro3d', { side: true, inferior: 'mca_m2i' }),
  V(/\bM3\b/iu, 'mca_m3s', 'neuro3d', { side: true, inferior: 'mca_m3i' }),
  V(/\bM4\b/iu, 'mca_m4s', 'neuro3d', { side: true, inferior: 'mca_m4i' }),
  V(/\bMCA\b|środkow[\p{L}\d_]*\s+mózg|middle cerebral/iu, 'mca_m1', 'neuro3d', { side: true, generic: true }),
  V(/\bP1\b/iu, 'pca_p1', 'neuro3d', { side: true }),
  V(/\bP2\b/iu, 'pca_p2', 'neuro3d', { side: true }),
  V(/\bP3\b/iu, 'pca_p3', 'neuro3d', { side: true }),
  V(/\bPCA\b|tyln[\p{L}\d_]*\s+mózg|posterior cerebral/iu, 'pca_p2', 'neuro3d', { side: true, t: 0.2, generic: true }),
  V(/\bICA[- ]?T\b|szczyt[\p{L}\d_]*\s+(tętnicy szyjnej wewnętrznej|ICA)|(rozwidleni|bifurkacj)[\p{L}\d_]*\s+(tętnicy szyjnej wewnętrznej|ICA)|ICA terminus|carotid terminus/iu, 'ica_t', 'neuro3d', { side: true }),
  V(/\bC7\b|odcin[\p{L}\d_]*\s+łącząc|communicating segment/iu, 'ica_c7', 'neuro3d', { side: true }),
  V(/\bC6\b|odcin[\p{L}\d_]*\s+oczn|ophthalmic segment|paraklinoid|paraclinoid|tętniak[\p{L}\d_]*\s+oczn/iu, 'ica_c6', 'neuro3d', { side: true }),
  V(/\bC5\b|odcin[\p{L}\d_]*\s+klinow|clinoid segment/iu, 'ica_c5', 'neuro3d', { side: true }),
  V(/\bC4\b|jamist|syfon|kawern|cavernous|siphon/iu, 'ica_c4', 'neuro3d', { side: true }),
  V(/\bC3\b|poszarpan|lacer/iu, 'ica_c3', 'neuro3d', { side: true }),
  V(/\bC2\b|skalist|petrous/iu, 'ica_c2', 'neuro3d', { side: true }),
  V(/\bAChA\b|naczyniówkow[\p{L}\d_]*\s+przedni|anterior choroidal/iu, 'acha', 'neuro3d', { side: true, t: 0.15 }),
  V(/tętnic[\p{L}\d_]*\s+oczn|ophthalmic artery/iu, 'opha', 'neuro3d', { side: true, t: 0.15 }),
  V(/\bMMA\b|oponow[\p{L}\d_]*\s+środkow|middle meningeal/iu, 'mma', 'neuro3d', { side: true }),
  V(/\bV4\b|kręgow[\p{L}\d_]*\s+wewnątrzczaszk|intradural vertebral/iu, 'va_v4', 'neuro3d', { side: true }),
  V(/\bV3\b/iu, 'va_v3', 'neuro3d', { side: true }),
  V(/\bV2\b/iu, 'va_v2', 'neuro3d', { side: true }),
  V(/\bV1\b|ujści[\p{L}\d_]*\s+(tętnicy\s+)?kręgow|vertebral (artery )?origin|VA ostium/iu, 'va_ost', 'neuro3d', { side: true }),
  V(/tętnic[\p{L}\d_]*\s+kręgow|\bVA\b|vertebral artery/iu, 'va_v1', 'neuro3d', { side: true, generic: true }),
  V(/(rozwidleni|bifurkacj|opuszk)[\p{L}\d_]*\s+(tętnicy\s+)?szyjn|opuszk[\p{L}\d_]*\s+(tętnicy\s+)?szyjn|carotid (bifurcation|bulb)/iu, 'carotid_bif', 'neuro3d', { side: true, t: 0.6 }),
  V(/\bECA\b|szyjn[\p{L}\d_]*\s+zewnętrzn|external carotid/iu, 'eca_prox', 'neuro3d', { side: true }),
  V(/\bCCA\b|szyjn[\p{L}\d_]*\s+wspóln|common carotid/iu, 'cca_mid', 'neuro3d', { side: true }),
  V(/\bICA\b|szyjn[\p{L}\d_]*\s+wewnętrzn|internal carotid/iu, 'ica_c1', 'neuro3d', { side: true, t: 0.12, generic: true }),
  V(/\bCAS\b|stentowani[\p{L}\d_]*\s+(tętnicy\s+)?szyjn|tętnic[\p{L}\d_]*\s+szyjn|carotid/iu, 'carotid_bif', 'neuro3d', { side: true, t: 0.6, generic: true }),
  // body
  V(/\bTEVAR\b|aort[\p{L}\d_]*\s+piersiow|aort[\p{L}\d_]*\s+zstępując|thoracic aort/iu, 'dta_proximal', 'body3d'),
  V(/\bEVAR\b|\bAAA\b|aort[\p{L}\d_]*\s+brzuszn|podnerkow|infrarenal|abdominal aort/iu, 'aorta_infrarenal', 'body3d'),
  V(/rozwidleni[\p{L}\d_]*\s+aorty|aortic bifurcation/iu, 'aortic_bifurcation', 'body3d'),
  V(/pni[\p{L}\d_]*\s+trzewn|pień\s+trzewny|coeliac|celiac/iu, 'coeliac_trunk', 'body3d'),
  V(/\bSMA\b|krezkow[\p{L}\d_]*\s+górn|superior mesenteric/iu, 'sma_proximal', 'body3d'),
  V(/\bIMA\b|krezkow[\p{L}\d_]*\s+doln|inferior mesenteric/iu, 'ima', 'body3d'),
  V(/śledzionow|splenic/iu, 'splenic_mid', 'body3d'),
  V(/\bGDA\b|żołądkowo-dwunastnicz|gastroduodenal/iu, 'gda', 'body3d'),
  V(/\bRHA\b|wątrobow[\p{L}\d_]*\s+praw|right hepatic/iu, 'right_hepatic', 'body3d'),
  V(/\bLHA\b|wątrobow[\p{L}\d_]*\s+lew|left hepatic/iu, 'left_hepatic', 'body3d'),
  V(/wątrobow[\p{L}\d_]*\s+właściw|proper hepatic/iu, 'proper_hepatic', 'body3d'),
  V(/\bCHA\b|wątrobow[\p{L}\d_]*\s+wspóln|common hepatic/iu, 'common_hepatic', 'body3d'),
  V(/nerkow|\brenal\b/iu, 'renal_artery', 'body3d', { side: true, t: 0.25 }),
  V(/maciczn|uterine|prostat/iu, 'uterine_prostatic', 'body3d', { side: true }),
  V(/biodrow[\p{L}\d_]*\s+wewnętrzn|\bIIA\b|internal iliac/iu, 'iia', 'body3d', { side: true }),
  V(/biodrow[\p{L}\d_]*\s+zewnętrzn|\bEIA\b|external iliac/iu, 'eia', 'body3d', { side: true }),
  V(/biodrow[\p{L}\d_]*\s+wspóln|\bCIA\b|common iliac|biodrow/iu, 'cia', 'body3d', { side: true }),
  V(/udow[\p{L}\d_]*\s+głębok|\bPFA\b|profunda/iu, 'pfa', 'body3d', { side: true, t: 0.15 }),
  V(/udow[\p{L}\d_]*\s+powierzchown|\bSFA\b|superficial femoral/iu, 'sfa_mid', 'body3d', { side: true, proximal: 'sfa_proximal', distal: 'sfa_distal' }),
  V(/udow[\p{L}\d_]*\s+wspóln|\bCFA\b|common femoral/iu, 'cfa', 'body3d', { side: true }),
  V(/podkolan|popliteal/iu, 'popliteal_p2', 'body3d', { side: true, proximal: 'popliteal_p1', distal: 'popliteal_p3' }),
  V(/pni[\p{L}\d_]*\s+piszczelowo|pień\s+piszczelowo|\bTPT\b|tibioperoneal/iu, 'tpt', 'body3d', { side: true }),
  V(/piszczelow[\p{L}\d_]*\s+przedni|\bATA\b|anterior tibial/iu, 'ata_proximal', 'body3d', { side: true, distal: 'ata_distal' }),
  V(/piszczelow[\p{L}\d_]*\s+tyln|posterior tibial/iu, 'pta_proximal', 'body3d', { side: true, distal: 'pta_distal' }),
  V(/strzałkow|peroneal/iu, 'peroneal', 'body3d', { side: true }),
  V(/grzbietow[\p{L}\d_]*\s+stopy|dorsalis pedis/iu, 'dorsalis_pedis', 'body3d', { side: true }),
  V(/podobojczykow|subclavian/iu, 'SUBCLAVIAN', 'body3d', { side: true }),
];

const SIDE_RE = /\b(praw[\p{L}\d_]*|right|lew[\p{L}\d_]*|left)\b/giu;
const sideOf = (w) => (/^(praw|right)/iu.test(w) ? 'right' : /^(lew|left)/iu.test(w) ? 'left' : '');

// ------------------------------------------------------------------ findings
const FINDING_RE = [
  ['aneurysm', /tętniak|aneurysm|\bsac\b/iu],
  ['pseudoaneurysm', /tętniak[\p{L}\d_]*\s+rzekom|pseudoaneurysm|pseudotętniak/iu],
  ['avm', /\bAVM\b|malformacj[\p{L}\d_]*\s+(tętniczo|naczyni)|arteriovenous malformation|naczyniak tętniczo/iu],
  ['davf', /przetok|\bdAVF\b|\bCCF\b|fistul/iu],
  ['thrombus', /zakrzep|skrzeplin|zator|\budar|trombektomi|thrombectom|thromb|embol(us|ism)\b|\bLVO\b/iu],
  ['occlusion', /okluzj|niedrożn|zamknięci|occlu|\bCTO\b/iu],
  ['dissection', /rozwarstwi|dysekcj|dissect/iu],
  ['spasm', /skurcz|wazospazm|vasospasm/iu],
  ['bleeding', /krwawi|wynaczyni|extravasa|bleed/iu],
  ['stenosis', /zwężeni|stenoz|stenos|\bzwężon/iu],
];
function findingOf(t0) {
  // "no residual stenosis" / "residual stenosis 10%" describes the result, not the lesion
  const t = String(t0).replace(/(bez\s+(istotnego\s+)?)?(zwężeni[\p{L}]*|stenoz[\p{L}]*)\s+(resztkow|rezydualn)[\p{L}]*|residual stenosis|no residual stenosis/giu, ' ');
  const hits = FINDING_RE.filter(([, re]) => re.test(t)).map(([id]) => id);
  if (hits.includes('pseudoaneurysm')) return 'pseudoaneurysm';
  if (hits.includes('occlusion') && hits.includes('stenosis') && !/\d{2}\s*%/.test(t)) return 'occlusion';
  for (const id of ['avm', 'davf', 'aneurysm', 'thrombus', 'dissection', 'spasm', 'bleeding', 'occlusion', 'stenosis']) if (hits.includes(id)) return id;
  return '';
}

// ------------------------------------------------------------------ devices (catalogue matching)
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
let catIndex = null;
function catalogueIndex(categories) {
  if (catIndex?.src === categories) return catIndex.list;
  const list = [];
  for (const c of categories || []) for (const it of c.items || []) {
    const name = String(it.name || '').trim();
    if (name.length < 3) continue;
    // "SpiderFX" = "Spider FX" = "Spider-FX": spaces and hyphens are optional everywhere
    const body = [...name.replace(/[\s-]+/gu, '')].map((ch) => escRe(ch)).join('[\\s-]?');
    const short = name.length <= 4;
    const same = list.find((x) => x.name.toLowerCase() === name.toLowerCase());
    if (same) { same.cats.push(c.id); continue; }
    list.push({ cat: c.id, cats: [c.id], name, maker: it.maker || '', re: new RegExp(`(^|[^\\p{L}\\d])${body}(?=$|[^\\p{L}])`, short ? 'u' : 'iu') });
  }
  list.sort((a, b) => b.name.length - a.name.length);
  // short forms: "Indigo" → "Indigo System…", "Pipeline Shield" → "Pipeline Flex with Shield Technology"
  const COMMON = /^(stent|balloon|balon|coil|system|flex|catheter|cewnik|sheath|guide|wire|micro|super|pro|plus|ultra|soft|neuro|vascular|peripheral|cardiac|cook|long|short|mini|smart|easy|select|advance|power|total|nano|rapid|fast|large|small)$/iu;
  const first = new Map();
  for (const it of list) {
    const w = it.name.split(/[\s-]+/u)[0];
    if (w.length < 5 || w === it.name || COMMON.test(w) || /\d/u.test(w)) continue;
    if (!first.has(w.toLowerCase())) first.set(w.toLowerCase(), []);
    first.get(w.toLowerCase()).push(it);
  }
  for (const [w, items] of first) {
    if (list.some((x) => x.name.toLowerCase() === w)) continue;
    list.push({ ...items[0], family: items, re: new RegExp(`(^|[^\\p{L}\\d])${escRe(items[0].name.split(/[\s-]+/u)[0])}(?=$|[^\\p{L}])`, 'iu') });
  }
  catIndex = { src: categories, list };
  return list;
}
const genericOf = (categories, cat) => (categories || []).find((c) => c.id === cat)?.generic?.[0] || '';
const SIZE_AFTER = /^[\s,:-]*(?:\(?\s*)?(\d+(?:[.,]\d+)?\s*(?:mm|cm|F)?\s*(?:[x×]|na)\s*\d+(?:[.,]\d+)?\s*(?:mm|cm)?|\d+(?:[.,]\d+)?\s*(?:mm|cm|F|ml))/iu;

function findDevices(seg, ctx, categories) {
  const out = [];
  let rest = seg;
  for (const it of catalogueIndex(categories)) {
    const m = rest.match(it.re);
    if (!m) continue;
    const at = m.index + m[1].length;
    let after = rest.slice(at + m[0].length - m[1].length);
    // a short form: pick the family member whose other words follow ("Pipeline Shield" → … with Shield …)
    let chosen = it;
    if (it.family) {
      const near = after.slice(0, 30).toLowerCase();
      chosen = it.family.map((x) => ({ x, score: x.name.toLowerCase().split(/[\s-]+/u).slice(1).filter((w) => w.length > 2 && near.includes(w)).length })).sort((a, b) => b.score - a.score)[0].x;
      const extra = after.match(new RegExp(`^(\\s+(${chosen.name.split(/[\s-]+/u).slice(1).map(escRe).join('|')}))+`, 'iu'));
      if (extra) after = after.slice(extra[0].length);
    }
    const sz = after.match(SIZE_AFTER);
    // quantity: "pięć spiral Target", "Target ×3", "3 × Target"
    const before = rest.slice(Math.max(0, at - 40), at);
    const qm = before.match(new RegExp(`${NUMRE}\\s*(?:[x×]\\s*)?(?:spiral[\\p{L}\\d_]*|coil[\\p{L}\\d_]*|szt[\\p{L}\\d_]*\\.?)?\\s*$`, 'iu')) || after.match(/^\s*[x×]\s*(\d{1,2})\b/u);
    // the same product listed in a neuro and a peripheral category: pick by the treated region
    const NEURO_CATS = /^(neuro_|flow_diverter|intrasaccular|stent_retriever|stent_carotid|embolic_protection)/;
    const cat = chosen.cats.find((c) => (ctx.model === 'neuro3d') === NEURO_CATS.test(c)) || chosen.cat;
    out.push({ cat, name: chosen.name, maker: chosen.maker, size: sz ? sz[1].replace(/\s*na\s*/iu, ' × ').replace(/\s*x\s*/iu, ' × ').trim() : '', qty: qm ? toNum(qm[1]) || 1 : 1, at });
    const used = rest.length - at - after.length + (sz ? sz[0].length : 0);
    rest = rest.slice(0, at) + ' '.repeat(used) + rest.slice(at + used);
  }
  // generic devices said without a brand
  const neuro = ctx.model === 'neuro3d';
  const coilWords = rest.match(new RegExp(`${NUMRE}\\s+(?:[\\p{L}\\d_]+\\s+)?(spiral|mikrospiral|coil)[\\p{L}\\d_]*`, 'iu'));
  const coilCount = seg.match(new RegExp(`${NUMRE}\\s+(?:[\\p{L}\\d_]+\\s+)?(spiral|mikrospiral|coil)[\\p{L}\\d_]*`, 'iu'));
  const brandedCoils = out.filter((d) => /coil/u.test(d.cat));
  if (coilCount && brandedCoils.length === 1 && brandedCoils[0].qty === 1) brandedCoils[0].qty = toNum(coilCount[1]) || 1;
  if (!brandedCoils.length && (coilWords || /spiral|\bcoil/iu.test(rest))) {
    const cat = neuro ? 'neuro_coil' : 'coil_detachable';
    out.push({ cat, name: neuro ? 'Spirala odczepialna' : genericOf(categories, cat) || 'Spirala', maker: '', size: '', qty: coilWords ? toNum(coilWords[1]) || 1 : 1, generic: true });
  }
  const has = (re) => out.some((d) => re.test(d.cat));
  if (/\bstent[\p{L}\d_]*|stentowa/iu.test(rest) && !has(/stent|flow_diverter|aortic/u) && !/stent[- ]?retriever|stentriever/iu.test(rest)) {
    const cat = ctx.base === 'carotid_bif' || ctx.base === 'ica_c1' || ctx.base === 'cca_mid' ? 'stent_carotid'
      : neuro ? (ctx.finding === 'aneurysm' ? 'neuro_stent_coil' : 'neuro_angioplasty_stent')
        : /renal|sma|coeliac/u.test(ctx.base) ? 'stent_renal_visceral' : 'stent_se_peripheral';
    out.push({ cat, name: genericOf(categories, cat) || 'Stent', maker: '', size: '', qty: 1, generic: true });
  }
  if (/flow[- ]?diverter|stent[\p{L}\d_]*\s+(przekierowując|zmieniając)[\p{L}\d_]*\s+przepływ/iu.test(rest) && !has(/flow_diverter/u)) out.push({ cat: 'flow_diverter', name: genericOf(categories, 'flow_diverter') || 'Flow diverter', maker: '', size: '', qty: 1, generic: true });
  if (/stentgraft|stent[- ]graft|endoprotez/iu.test(rest) && !has(/aortic|covered/u)) {
    const cat = ctx.base === 'aorta_infrarenal' || ctx.base === 'aortic_bifurcation' ? 'aortic_evar' : /^dta|^arch/u.test(ctx.base) ? 'aortic_tevar' : 'stent_covered_peripheral';
    out.push({ cat, name: genericOf(categories, cat) || 'Stentgraft', maker: '', size: '', qty: 1, generic: true });
  }
  if (/\bonyx|\bsquid|\bphil\b|\bEVOH\b/iu.test(rest) === false && /klej|glue|nbca|histoacryl|glubran/iu.test(rest) && !has(/liquid/u)) {
    const cat = neuro ? 'neuro_liquid_embolic' : 'liquid_embolic';
    out.push({ cat, name: genericOf(categories, cat).includes('NBCA') ? genericOf(categories, cat) : 'Klej cyjanoakrylowy (NBCA)', maker: '', size: '', qty: 1, generic: true });
  }
  if (/\bbalon[\p{L}\d_]*|balloon|angioplastyk|\bPTA\b/iu.test(rest) && !has(/balloon/u) && !/balon[\p{L}\d_]*\s+prowadząc|balloon guide|\bBGC\b/iu.test(rest)) {
    const cat = neuro && ctx.finding === 'aneurysm' ? 'neuro_balloon' : neuro ? 'neuro_balloon' : /\bDCB\b|lekow|paklitaks|drug[- ]coated/iu.test(rest) ? 'balloon_dcb' : 'balloon_pta';
    out.push({ cat, name: genericOf(categories, cat) || 'Balon', maker: '', size: '', qty: 1, generic: true });
  }
  const list = out.map(({ at, ...d }) => { void at; return d; });
  list.rest = rest;
  return list;
}

// ------------------------------------------------------------------ fields per finding
const firstMatch = (t, re) => { const m = t.match(re); return m ? m.slice(1).find((x) => x !== undefined) : null; };
const ROMAN = { i: '1', ii: '2', iii: '3a' };
function lesionFields(finding, seg, full = seg) {
  const f = {};
  const size = seg.match(/(\d+(?:[.,]\d+)?)\s*(?:mm\s*)?(?:[x×]|na)\s*(\d+(?:[.,]\d+)?)(?:\s*(?:[x×]|na)\s*(\d+(?:[.,]\d+)?))?\s*(mm|cm)?/iu);
  if (finding === 'aneurysm' || finding === 'pseudoaneurysm') {
    if (size) f.size = [size[1], size[2], size[3]].filter(Boolean).map(dec).join(' × ');
    else { const one = seg.match(/(?:tętniak|aneurysm)[^.;]{0,40}?(?<![\p{L}\d])(\d+(?:[.,]\d+)?)\s*mm/iu); if (one) f.size = dec(one[1]); }
    const neck = firstMatch(seg, /szyj[\p{L}\d_]*\s*(?:tętniaka\s*)?(?:o\s*)?(?:szerokości\s*)?(\d+(?:[.,]\d+)?)\s*mm|neck\s*(?:of\s*)?(\d+(?:[.,]\d+)?)/iu);
    if (neck) f.extra = dec(neck);
    if (/pęknięt|krwawiąc[\p{L}\d_]*\s+tętniak|ruptured|\bSAH\b|podpajęczynówk/iu.test(seg)) f.ruptured = true;
    if (/wrzecionowat|fusiform/iu.test(seg)) f.morph = 'fusiform';
    else if (/workowat|saccular/iu.test(seg)) f.morph = 'saccular';
    else if (/blister|pęcherzykow/iu.test(seg)) f.morph = 'blister';
    const dir = seg.match(/skierowan[\p{L}\d_]*\s+(ku\s+górze|do\s+góry|ku\s+przodowi|do\s+przodu|do\s+tyłu|ku\s+tyłowi|ku\s+dołowi|w\s+dół|przyśrodkowo|bocznie)|projecting\s+(superiorly|anteriorly|posteriorly|inferiorly|medially|laterally)/iu);
    if (dir) {
      const d = (dir[1] || dir[2]).toLowerCase();
      f.dir = /gór|superior/u.test(d) ? 'sup' : /przod|anterior/u.test(d) ? 'ant' : /ty|posterior/u.test(d) ? 'post' : /dół|doł|inferior/u.test(d) ? 'inf' : /przyśr|medial/u.test(d) ? 'med' : 'lat';
    }
    const rr = seg.match(/Raymond(?:[- ]?Roy)?\s*(?:(?:klas|class)[\p{L}\d_]*\s*)?(3a|3b|[123]|iii|ii|i)\b|\bRR\s*(3a|3b|[123])\b|\bRROC\s*(3a|3b|[123])/iu);
    if (rr) { const v = (rr[1] || rr[2] || rr[3]).toLowerCase(); f.post = ROMAN[v] || (v === '3' ? '3a' : v); }
    else if (/całkowit[\p{L}\d_]*\s+(wyłączeni|okluzj)|complete occlusion/iu.test(seg)) f.post = '1';
    const okm = seg.match(/\bOKM\s*([ABCD][123]?)/iu); if (okm) f.okm = okm[1].toUpperCase();
    const wos = seg.match(/\bWOS\s*([ABCD])\b/iu); if (wos) f.wos = wos[1].toUpperCase();
    const pd = seg.match(/(?:gęstość upakowania|packing density)\D{0,6}(\d{1,2})\s*%/iu); if (pd) f.packing = pd[1];
  }
  if (finding === 'stenosis' || finding === 'occlusion') {
    const pcts = [...seg.matchAll(/(\d{1,3})\s*%/gu)].map((m) => Number(m[1])).filter((x) => x <= 100);
    const resid = seg.match(/(?:resztkow|rezydualn|residual|do)[\p{L}\d_]*\D{0,22}?(\d{1,2})\s*%/iu);
    if (finding === 'stenosis' && pcts.length) f.pre = String(resid && pcts[0] === Number(resid[1]) && pcts.length > 1 ? pcts[1] : pcts[0]);
    if (resid && String(resid[1]) !== f.pre) f.post = resid[1];
    else if (/bez\s+(istotnego\s+)?zwężenia\s+resztkow|no residual stenosis|bez\s+rezydualn/iu.test(seg)) f.post = '0';
    const len = seg.match(/(?:długoś[\p{L}\d_]*|na\s+odcinku|length|odcink[\p{L}\d_]*)\D{0,10}(\d+(?:[.,]\d+)?)\s*(mm|cm)/iu);
    if (len) f.length = String(Math.round(Number(len[1].replace(',', '.')) * (len[2].toLowerCase() === 'cm' ? 10 : 1)));
    const tasc = seg.match(/TASC\s*(?:II\s*)?([ABCD])\b/iu); if (tasc) f.tasc = tasc[1].toUpperCase();
    if (finding === 'stenosis' && /objawow/iu.test(seg) && !/bezobjawow/iu.test(seg)) f.symptomatic = true;
    if (finding === 'occlusion' && /przewlekł|\bCTO\b|chronic/iu.test(seg)) f.chronic = true;
    const pacss = seg.match(/PACSS\s*([0-4])/iu); if (pacss) f.calc = pacss[1];
  }
  if (finding === 'thrombus') {
    const tici = [...seg.matchAll(/\be?TICI\s*(2b50|2b67|2a|2b|2c|[0-3])\b/giu)].map((m) => m[1].toLowerCase());
    const ok = (v) => ETICI.some(([id]) => id === v);
    if (tici.length >= 2) { if (ok(tici[0])) f.pre = tici[0]; if (ok(tici[tici.length - 1])) f.post = tici[tici.length - 1]; }
    else if (tici.length === 1 && ok(tici[0])) f.post = tici[0];
    if (tici.includes('2b')) f._warn = 'eTICI 2b — wybierz 2b50 lub 2b67';
    const passes = seg.match(new RegExp(`${NUMRE}\\s*(?:przejś|pass|podejś)`, 'iu'));
    if (passes) f.passes = String(toNum(passes[1]));
    else if (/(w\s+)?pierwsz[\p{L}\d_]*\s+(przejści|podejści)|first pass/iu.test(seg)) f.passes = '1';
    const asp = /aspiracj|\bADAPT\b|aspiration/iu.test(full); const sr = /stent[- ]?retriever|stentriever|solitaire|trevo|pREset|tigertriever|embotrap|catch/iu.test(full);
    if (asp && sr) f.tech = 'combined'; else if (asp) f.tech = 'asp'; else if (sr) f.tech = 'sr';
    if (/balon[\p{L}\d_]*\s+prowadząc|\bBGC\b|balloon guide/iu.test(full)) f.bgc = true;
    const len = seg.match(/skrzeplin[\p{L}\d_]*\D{0,12}(\d+)\s*mm/iu); if (len) f.length = len[1];
  }
  if (finding === 'avm') {
    const cm = seg.match(/(\d+(?:[.,]\d+)?)\s*cm/iu); const mm = seg.match(/nidus[\p{L}\d_]*\D{0,12}(\d+)\s*mm/iu);
    const d = cm ? Number(cm[1].replace(',', '.')) : mm ? Number(mm[1]) / 10 : null;
    if (d) f.sm_size = d < 3 ? '1' : d <= 6 ? '2' : '3';
    if (/elokwent|eloquent/iu.test(seg)) f.sm_eloquent = true;
    if (/głębok[\p{L}\d_]*\s+drenaż|deep (venous )?drainage/iu.test(seg)) f.sm_deep = true;
    const occ = seg.match(/(?:wyłącz|zamknięt|occlu|embolizowan)[\p{L}\d_]*\D{0,25}?(\d{1,3})\s*%|(\d{1,3})\s*%\s*(?:nidus|AVM|malformacj)/iu);
    if (occ) f.post = occ[1] || occ[2];
    else if (/całkowit[\p{L}\d_]*\s+(wyłączeni|zamknięci|embolizacj)|complete(ly)? (occlu|obliter)/iu.test(seg)) f.post = '100';
  }
  if (finding === 'davf') {
    const cog = seg.match(/Cognard\s*(IIa\s*\+\s*b|IIa|IIb|III|IV|V|I)\b/iu); if (cog) f.cognard = cog[1].replace(/\s/gu, '').replace(/^iia\+b$/iu, 'IIa+b').replace(/^(i+|iv|v)/iu, (x) => x.toUpperCase()).replace(/A/u, 'a').replace(/B$/u, 'b');
    const bor = seg.match(/Borden\s*(III|II|I)\b/iu); if (bor) f.borden = bor[1].toUpperCase();
    if (/korow[\p{L}\d_]*\s+refluks|cortical venous reflux|\bCVR\b/iu.test(seg)) f.cvr = true;
    if (/całkowit[\p{L}\d_]*\s+(wyłączeni|zamknięci)|complete/iu.test(seg)) f.post = 'complete';
    else if (/częściow|partial/iu.test(seg)) f.post = 'partial';
  }
  if (finding === 'spasm') {
    if (/ciężk|znaczn|severe/iu.test(seg)) f.pre = 'severe'; else if (/umiarkowan|moderate/iu.test(seg)) f.pre = 'moderate'; else if (/łagodn|mild/iu.test(seg)) f.pre = 'mild';
    const drug = seg.match(/(nimodypin[\p{L}\d_]*|milrinon[\p{L}\d_]*|werapamil[\p{L}\d_]*|verapamil|nimodipine|milrinone)[^.,;]*/iu); if (drug) f.drug = drug[0].trim();
    if (/ustąpi|resolved/iu.test(seg)) f.post = 'resolved'; else if (/popraw|improv/iu.test(seg)) f.post = 'improved';
  }
  if (finding === 'dissection' && /ogranicz[\p{L}\d_]*\s+przepływ|flow[- ]limiting/iu.test(seg)) f.flowlimiting = true;
  // keep only fields that exist for this finding
  const def = LESIONS.vessel.find((x) => x.id === finding);
  const keys = new Set((def?.fields || []).map((x) => x.key));
  const out = {};
  for (const [k, v] of Object.entries(f)) if (keys.has(k) || k === '_warn') out[k] = v;
  return out;
}

// ------------------------------------------------------------------ procedures inferred from what was said
function proceduresFor(finding, devices, seg, ctx) {
  const has = (re) => devices.some((d) => re.test(d.cat));
  const p = [];
  const neuro = ctx.model === 'neuro3d';
  const carotid = ['carotid_bif', 'ica_c1', 'cca_mid'].includes(ctx.base);
  if (finding === 'aneurysm' || finding === 'pseudoaneurysm') {
    if (neuro) {
      if (has(/flow_diverter/u)) p.push('flow_diverter');
      if (has(/intrasaccular/u)) p.push('intrasaccular');
      if (has(/coil/u)) p.push(has(/neuro_stent_coil|neuro_balloon/u) || /asyst|assist|remodel/iu.test(seg) ? 'stent_coiling' : 'coiling');
      else if (has(/neuro_stent_coil/u)) p.push('stent_coiling');
    } else {
      if (has(/aortic_evar|aortic_tevar|aortic_branched|covered/u)) p.push('stent_graft');
      if (has(/coil|plug|liquid|particles/u)) p.push('embolization');
    }
  }
  if (finding === 'thrombus') p.push(neuro ? 'stroke_thrombectomy' : 'thrombectomy');
  if (finding === 'stenosis' || finding === 'occlusion' || finding === 'dissection') {
    if (carotid && (has(/stent/u) || /stent/iu.test(seg))) p.push('carotid_stenting');
    else if (neuro && has(/stent|balloon/u)) p.push('intracranial_stenting');
    else if (!neuro) {
      if (has(/aortic|covered/u)) p.push('stent_graft');
      else if (has(/stent/u)) p.push('stent');
      if (has(/balloon/u) || /angioplast|\bPTA\b/iu.test(seg)) p.push('pta');
      if (has(/atherectomy/u)) p.push('atherectomy');
    }
  }
  if (finding === 'avm') p.push('avm_embolization');
  if (finding === 'davf') p.push('davf_embolization');
  if (finding === 'spasm') p.push('vasospasm');
  if (finding === 'bleeding' || (!finding && has(/coil|plug|particles|liquid/u))) p.push('embolization');
  if (ctx.base === 'mma' && /embolizac/iu.test(seg)) p.push('mma_embolization');
  if (/chemoemboliz|\bTACE\b/iu.test(seg)) p.push('chemoembolization');
  return [...new Set(p)];
}

// ------------------------------------------------------------------ the whole dictation
/**
 * @param text       what the doctor said
 * @param categories DEVICE_CATEGORIES
 * @returns parsed card data (same shape as the AI path)
 */
export function localParse(text, { categories = [] } = {}) {
  const raw = norm(text);
  const out = { branch: '', lesions: [], access: {}, devices: [], clinical: {}, warnings: [] };
  // access first, and cut it out so "prawa tętnica udowa wspólna" is not taken for a treated vessel
  let body = raw;
  const acc = raw.match(/(?:dostęp[\p{L}\d_]*|nakłuci[\p{L}\d_]*|punkcj[\p{L}\d_]*|access|via|przez)\s+(?:przez\s+)?((?:praw|lew|right|left)[\p{L}\d_]*\s+)?(tętnic[\p{L}\d_]*\s+)?(udow[\p{L}\d_]*(?:\s+wspóln[\p{L}\d_]*)?|CFA|common femoral|femoral|promieniow[\p{L}\d_]*|radial|ramienn[\p{L}\d_]*|brachial)(\s+(?:praw|lew|right|left)[\p{L}\d_]*)?/iu);
  const acc2 = acc ? null : raw.match(/((?:praw|lew|right|left)[\p{L}]*\s+)?(tętnic[\p{L}]*\s+)?(udow[\p{L}]*(?:\s+wspóln[\p{L}]*)?|femoral|promieniow[\p{L}]*|radial|ramienn[\p{L}]*|brachial)\s+(?:access|dostęp|approach)/iu);
  const accM = acc || acc2;
  if (accM && !acc) {
    const what = accM[3].toLowerCase();
    out.access.site = /promieniow|radial/u.test(what) ? 'radial' : /ramienn|brachial/u.test(what) ? 'brachial' : 'cfa';
    const s = sideOf((accM[1] || '').trim()); if (s) out.access.side = s;
    body = raw.slice(0, accM.index) + ' '.repeat(accM[0].length) + raw.slice(accM.index + accM[0].length);
  }
  if (acc) {
    const what = acc[3].toLowerCase();
    out.access.site = /promieniow|radial/u.test(what) ? (/dystaln|distal|tabakier/iu.test(raw) ? 'distal_radial' : 'radial') : /ramienn|brachial/u.test(what) ? 'brachial' : 'cfa';
    const s = sideOf((acc[1] || acc[4] || '').trim());
    if (s) out.access.side = s;
    body = raw.slice(0, acc.index) + ' '.repeat(acc[0].length) + raw.slice(acc.index + acc[0].length);
  }
  const sheath = raw.match(/(?:koszul[\p{L}\d_]*|sheath|introduktor[\p{L}\d_]*|cewnik[\p{L}\d_]*\s+prowadząc[\p{L}\d_]*)\D{0,12}?(\d{1,2})\s*F\b|(\d{1,2})\s*F\s*(?:koszul|sheath)/iu);
  if (sheath) out.access.sheath = `${sheath[1] || sheath[2]} F`;
  else if (accM) { const near = raw.slice(accM.index, accM.index + accM[0].length + 30).match(/(?<![\p{L}\d])(\d{1,2})\s?F(?:r|rench)?(?![\p{L}])/u); if (near) out.access.sheath = `${near[1]} F`; }
  const closure = raw.match(/Angio-?Seal|Perclose(?:\s+ProGlide)?|ProGlide|FemoSeal|MynxGrip|Mynx|StarClose|ExoSeal|ucisk[\p{L}\d_]*(?:\s+ręczn[\p{L}\d_]*)?|opatrunek\s+uciskow[\p{L}\d_]*|manual compression/iu);
  if (closure) out.access.closure = closure[0];
  // anaesthesia, outcome, complications, dose
  if (/znieczuleni[\p{L}\d_]*\s+ogóln|w\s+(znieczuleniu\s+)?ogólnym|intubac|general an(a)?esthesia/iu.test(raw)) out.anaesthesia = 'general';
  else if (/sedacj|sedation/iu.test(raw)) out.anaesthesia = 'sedation';
  else if (/znieczuleni[\p{L}\d_]*\s+miejscow|local an(a)?esthesia/iu.test(raw)) out.anaesthesia = 'local';
  if (/nieskuteczn|niepowodzeni|technically unsuccessful|failed/iu.test(raw)) out.outcome = 'failed';
  else if (/częściowo\s+skuteczn|partially successful/iu.test(raw)) out.outcome = 'partial';
  else if (/skuteczn|z\s+powodzeniem|technically successful|successful/iu.test(raw)) out.outcome = 'success';
  if (/bez\s+(żadnych\s+)?(powikłań|komplikacji)|no complications|without complications|uncomplicated/iu.test(raw)) out.complications = { none: true };
  else { const comp = raw.match(/powikłani[\p{L}\d_]*:?\s+([^.;]+)/iu); if (comp && !/bez/iu.test(comp[0])) out.complications = { none: false, text: comp[1].trim() }; }
  const contrast = raw.match(/(\d{1,4})\s*ml\s*(?:kontrast|środka|contrast)|kontrast[\p{L}\d_]*\D{0,12}(\d{1,4})\s*ml|contrast\D{0,8}(\d{1,4})\s*ml/iu);
  if (contrast) out.contrast = contrast[1] || contrast[2] || contrast[3];
  const fluoro = raw.match(/(?:fluoroskop|skopi|fluoro)[\p{L}\d_]*\D{0,14}?(\d+(?:[.,]\d+)?)\s*min|(\d+(?:[.,]\d+)?)\s*min[\p{L}\d_]*\s*(?:fluoroskop|skopi|fluoro)/iu);
  if (fluoro) out.fluoro = dec(fluoro[1] || fluoro[2]);
  const dose = raw.match(/(\d+(?:[.,]\d+)?)\s*(Gy\s*[·*.]?\s*cm\s*(?:2|²)|Gycm2|mGy)/iu);
  if (dose) { out.dose = dec(dose[1]); out.doseUnit = /mGy/iu.test(dose[2]) ? 'mGy' : 'Gy·cm²'; }
  // clinical
  const nihss = raw.match(/NIHSS\D{0,6}(\d{1,2})/iu); if (nihss) out.clinical.nihss = nihss[1];
  const aspects = raw.match(/ASPECTS\D{0,6}(\d{1,2})/iu); if (aspects) out.clinical.aspects = aspects[1];
  if (/tromboliz[\p{L}\d_]*\s+dożyln|\brt-?PA\b|alteplaz|tenekteplaz|\bIVT\b|iv thrombolysis/iu.test(raw)) out.clinical.ivt = true;
  const time = (re) => { const m = raw.match(re); return m ? m[1].replace('.', ':').padStart(5, '0') : null; };
  const punct = time(/(?:nakłuci|punkcj|puncture)[\p{L}\d_]*\D{0,10}(\d{1,2}[:.]\d{2})/iu); if (punct) out.clinical.puncture = punct;
  const reper = time(/(?:reperfuzj|rekanaliz|reperfusion)[\p{L}\d_]*\D{0,10}(\d{1,2}[:.]\d{2})/iu); if (reper) out.clinical.reperfusion = reper;
  const onset = time(/(?:początek objawów|zachorowani|ostatnio zdrow|onset|last known well)[\p{L}\d_]*\D{0,10}(\d{1,2}[:.]\d{2})/iu); if (onset) out.clinical.onset = onset;
  const hh = raw.match(/Hunt[- ]?(?:and[- ]?|i[- ]?)?Hess\D{0,6}([1-5]|IV|V|I{1,3})\b/iu); if (hh) out.clinical.hunthess = { i: '1', ii: '2', iii: '3', iv: '4', v: '5' }[hh[1].toLowerCase()] || hh[1];
  const wfns = raw.match(/WFNS\D{0,6}([1-5]|IV|V|I{1,3})\b/iu); if (wfns) out.clinical.wfns = { i: '1', ii: '2', iii: '3', iv: '4', v: '5' }[wfns[1].toLowerCase()] || wfns[1];
  const fisher = raw.match(/Fisher\D{0,10}([1-4])/iu); if (fisher) out.clinical.fisher = fisher[1];
  const ruth = raw.match(/Rutherford\D{0,6}([0-6])/iu); if (ruth) out.clinical.rutherford = ruth[1];
  const abi = raw.match(/\bABI\D{0,6}(\d[.,]\d{1,2})/iu); if (abi) out.clinical.abi = dec(abi[1]);
  // drugs
  const hep = raw.match(/heparyn[\p{L}\d_]*|heparin/iu);
  if (hep) { const dose2 = raw.slice(hep.index).match(/^\D{0,25}?(\d[\d\s]{2,6})\s*(j\.?\s*m\.?|IU|U|jednostek)/iu); out.devices.push({ cat: 'drugs', name: 'Heparyna niefrakcjonowana i.v. (j.m.)', maker: '', size: dose2 ? `${dose2[1].replace(/\s/gu, '')} j.m.` : '', qty: 1, generic: true }); }
  const ind = raw.match(/wskazani[\p{L}\d_]*:?\s+([^.;]+)/iu); if (ind) out.indication = ind[1].trim();
  const rec = raw.match(/zalec[\p{L}\d_]*:?\s+([^.]+)/iu); if (rec) out.recommendations = rec[1].trim();
  const fu = raw.match(/(?:kontrol[\p{L}\d_]*|follow[- ]?up)\s+([\p{L}\d_]*\s*)?(?:DSA|angiograf|MR|TK|CT|USG|doppler)[^.]*/iu); if (fu) out.followUp = fu[0].trim();

  // lesions: find vessel mentions, sentence by sentence
  const anchors = [];
  for (const v of VESSELS) {
    const re = new RegExp(v.re.source, `${v.re.flags.replace('g', '')}g`);
    for (const m of body.matchAll(re)) anchors.push({ v, pos: m.index, end: m.index + m[0].length });
  }
  anchors.sort((a, b) => a.pos - b.pos || (b.end - b.pos) - (a.end - a.pos));
  let kept = [];
  for (const a of anchors) if (!kept.some((k) => a.pos < k.end && a.end > k.pos)) kept.push(a);
  // "MCA M2", "tętnica szyjna wewnętrzna … C6": a general name next to a precise one is the same vessel
  kept = kept.filter((a) => !(a.v.generic && kept.some((k) => k !== a && !k.v.generic && k.v.model === a.v.model && Math.abs(k.pos - a.pos) < 30 && !/[.;\n]/.test(body.slice(Math.min(a.end, k.end), Math.max(a.pos, k.pos))))));
  // merge repeated mentions of the same vessel in one sentence
  const sentences = [];
  const re = /[^.;\n]+[.;\n]?/gu;
  for (const m of body.matchAll(re)) sentences.push({ start: m.index, end: m.index + m[0].length });
  const lesions = [];
  let last = null;
  for (const s of sentences) {
    const inS = kept.filter((a) => a.pos >= s.start && a.pos < s.end);
    if (!inS.length) { if (last) last.text += ` ${body.slice(s.start, s.end)}`; continue; }
    inS.forEach((a, i) => {
      const from = i === 0 ? s.start : a.pos;
      const to = i + 1 < inS.length ? inS[i + 1].pos : s.end;
      const segText = body.slice(from, to);
      const prev = lesions.find((l) => l.base === a.v.base);
      // a vessel named again (e.g. "…of the AComA. The AComA aneurysm was…") is the same lesion
      if (prev && (prev === last || i > 0)) { prev.text += ` ${segText}`; last = prev; return; }
      // side: nearest side word around the mention in the same sentence
      let side = '';
      if (a.v.side) {
        let best = Infinity;
        for (const m of body.slice(s.start, s.end).matchAll(SIDE_RE)) {
          const p = s.start + m.index;
          const d = p < a.pos ? a.pos - p : p - a.end;
          if (d < best && d < 45) { best = d; side = sideOf(m[0]); }
        }
      }
      last = { v: a.v, base: a.v.base, side, text: segText };
      lesions.push(last);
    });
  }
  for (const l of lesions) {
    const seg = l.text;
    let base = l.v.base;
    if (l.v.inferior && /doln|inferior/iu.test(seg)) base = l.v.inferior;
    if (l.v.proximal && /proksymaln|początkow|proximal/iu.test(seg)) base = l.v.proximal;
    else if (l.v.distal && /dystaln|kanał[\p{L}\d_]*\s+przywodziciel|distal|hunter/iu.test(seg)) base = l.v.distal;
    if (base === 'SUBCLAVIAN') base = l.side === 'left' ? 'lsa' : 'rsa';
    const finding = findingOf(seg) || (/(embolizac|spiral|coil)/iu.test(seg) ? '' : 'stenosis');
    const ctx = { model: l.v.model, base, finding };
    const devices = findDevices(seg, ctx, categories);
    // a sentence that only adds results ("…Raymond-Roy 1") still fills the fields of the lesion it names
    const fieldsFor = finding || (/Raymond|\bRR\s*\d|\bOKM\b|\bWOS\b/iu.test(seg) ? 'aneurysm' : /\bT?TICI\b/iu.test(seg) ? 'thrombus' : /\d\s*%/u.test(seg) ? 'stenosis' : '');
    const fields = lesionFields(fieldsFor, devices.rest ?? seg, seg);
    if (fields._warn) { out.warnings.push(fields._warn); delete fields._warn; }
    let t = l.v.t ?? 0.5;
    if (/proksymaln|początkow|proximal|ujści|ostium|origin/iu.test(seg) && !l.v.proximal) t = 0.15;
    else if (/dystaln|obwodow|distal/iu.test(seg) && !l.v.distal) t = 0.82;
    if (l.v.side && !l.side) out.warnings.push(`${l.v.base.replace(/_/gu, ' ')}: nie podano strony — sprawdź`);
    out.lesions.push({ model: l.v.model, base, side: l.v.side ? l.side || 'right' : '', finding: finding || 'other', fieldsFor, t, fields, procs: proceduresFor(finding, devices, seg, ctx), devices });
  }
  // devices said outside any lesion (sheath, guide catheter…): general list
  if (!out.lesions.length) {
    const devs = findDevices(body, { model: '', base: '', finding: '' }, categories).filter((d) => !d.generic);
    out.devices.push(...devs);
  } else {
    // general-access devices named in a lesion's text belong to the card, not the lesion
    for (const l of out.lesions) {
      const keep = [];
      for (const d of l.devices) (/^(sheath|long_sheath|closure|guidewire|diagnostic_catheter|neuro_guide|guide_catheter)$/u.test(d.cat) ? out.devices : keep).push(d);
      l.devices = keep;
    }
  }
  // branch
  const models = new Set(out.lesions.map((l) => l.model));
  const neuroWords = /tętniak[\p{L}\d_]*\s+(mózg|wewnątrzczaszk)|udar|trombektomi|\bSAH\b|AVM|przetok[\p{L}\d_]*\s+opon|flow diverter|spiral/iu.test(raw);
  if (models.has('neuro3d') && !models.has('body3d')) {
    const onlyNeck = out.lesions.every((l) => /carotid_bif|ica_c1|cca_mid|eca|va_ost|va_v1|sca_prox/u.test(l.base));
    out.branch = onlyNeck && !neuroWords ? (/neuro/iu.test(raw) ? 'Neuro' : 'Vascular') : 'Neuro';
  } else if (models.has('body3d')) out.branch = 'Vascular';
  else if (/drenaż|biopsj|nefrostom|gastrostom|ablacj|wertebroplast|drain|biopsy/iu.test(raw)) out.branch = 'NonVascular';
  return out;
}

// ------------------------------------------------------------------ merging into the card
/** Find a model part: `base` + side → the part id that exists in the models. */
export function resolvePart(diagrams, model, base, side) {
  const order = model ? [model, ...diagrams.map((d) => d.id).filter((id) => id !== model)] : diagrams.map((d) => d.id);
  const ids = side === 'left' ? [`${base}_l`, base, `${base}_r`] : [`${base}_r`, base, `${base}_l`];
  for (const did of order) {
    const d = diagrams.find((x) => x.id === did);
    if (!d?.parts) continue;
    for (const id of ids) { const p = d.parts.find((x) => x.id === id); if (p) return { diagram: d.id, part: p }; }
  }
  return null;
}

/** Match a device said / returned by the AI to the catalogue (exact name first, then contains). */
export function matchDevice(categories, dev) {
  const name = String(dev.name || '').trim().toLowerCase();
  if (!name) return null;
  let best = null;
  for (const c of categories || []) {
    if (dev.cat && c.id !== dev.cat && best) continue;
    for (const it of c.items || []) {
      const n = it.name.toLowerCase();
      const score = n === name ? 3 : name.includes(n) && n.length >= 4 ? 2 : n.includes(name) && name.length >= 4 ? 1 : 0;
      if (score && (!best || score > best.score || (score === best.score && c.id === dev.cat))) best = { score, cat: c.id, name: it.name, maker: it.maker || '' };
    }
  }
  return best;
}

/**
 * Merge parsed data into the card. Returns { activeId, summary: [...], warnings: [...] }.
 * Only what was said is written; existing values are kept unless the dictation gives a new one.
 */
export function applyParsed(card, parsed, { diagrams = [], categories = [], lang = 'pl' } = {}) {
  const en = lang === 'en';
  const summary = []; const warnings = [...(parsed.warnings || [])];
  if (parsed.branch && ['Vascular', 'Neuro', 'NonVascular'].includes(parsed.branch)) card.branch = parsed.branch;
  let activeId = null;
  const devFix = (d) => {
    const m = d.generic ? null : matchDevice(categories, d);
    const qty = Math.max(1, Math.min(99, Number(d.qty) || 1));
    return m ? { cat: m.cat, name: m.name, maker: m.maker, size: d.size || '', qty } : { cat: d.cat || 'other', name: String(d.name || '').slice(0, 120), maker: d.maker || '', size: d.size || '', qty };
  };
  for (const pl of parsed.lesions || []) {
    const hit = pl.part ? (() => { for (const d of diagrams) { const p = d.parts?.find((x) => x.id === pl.part); if (p) return { diagram: d.id, part: p }; } return null; })() : resolvePart(diagrams, pl.model, pl.base, pl.side);
    if (!hit) { warnings.push(`${en ? 'Vessel not found' : 'Nie znaleziono naczynia'}: ${pl.part || pl.base}`); continue; }
    const t = Number.isFinite(pl.t) ? pl.t : 0.5;
    let les = card.lesions.find((l) => l.diagram === hit.diagram && l.part === hit.part.id && Math.abs((l.t ?? 0.5) - t) < 0.3);
    const fresh = !les;
    if (!les) { les = newLesion(hit.diagram, hit.part.id, hit.part.kind || 'vessel', t); card.lesions.push(les); }
    if (pl.finding && pl.finding !== 'other') les.finding = pl.finding;
    else if (fresh) les.finding = 'other';
    const fieldsFit = (pl.finding && pl.finding !== 'other') || !pl.fieldsFor || les.finding === pl.fieldsFor || fresh;
    if (fieldsFit) for (const [k, v] of Object.entries(pl.fields || {})) if (v !== '' && v !== null && v !== undefined) les[k] = v;
    les.procs = [...new Set([...(les.procs || []), ...(pl.procs || [])])];
    for (const d of (pl.devices || []).map(devFix)) {
      const same = les.devices.find((x) => x.name === d.name && x.cat === d.cat);
      if (same) { if (d.size) same.size = d.size; if (d.qty > 1) same.qty = d.qty; } else les.devices.push(d);
    }
    if (!activeId) activeId = les.id;
    const label = hit.part.label?.[en ? 1 : 0] || hit.part.id;
    const sideTxt = hit.part.side === 'left' ? (en ? ' (left)' : ' (lewa)') : hit.part.side === 'right' ? (en ? ' (right)' : ' (prawa)') : '';
    const def = LESIONS.vessel.find((x) => x.id === les.finding);
    const bits = [def ? def.label[en ? 1 : 0].toLowerCase() : '', les.size ? `${les.size} mm` : '', les.pre && les.finding === 'stenosis' ? `${les.pre}%` : ''].filter(Boolean);
    summary.push(`${label}${sideTxt}${bits.length ? ` — ${bits.join(', ')}` : ''}`);
    const devs = (pl.devices || []).length;
    if (devs) summary.push(`${en ? 'devices' : 'sprzęt'}: ${les.devices.map((d) => `${d.qty > 1 ? `${d.qty} × ` : ''}${d.name}`).join(', ')}`);
  }
  // card-level
  if (parsed.access) {
    for (const k of ['site', 'side', 'sheath', 'closure']) if (parsed.access[k]) card.access[k] = parsed.access[k];
    if (parsed.access.site) summary.push(`${en ? 'access' : 'dostęp'}: ${parsed.access.side ? `${parsed.access.side === 'left' ? (en ? 'left' : 'lewa') : (en ? 'right' : 'prawa')} ` : ''}${parsed.access.site.toUpperCase()}${parsed.access.sheath ? `, ${parsed.access.sheath}` : ''}`);
  }
  if (parsed.anaesthesia) card.anaesthesia = parsed.anaesthesia;
  if (parsed.outcome) card.outcome = parsed.outcome;
  if (parsed.complications) {
    card.complications = { none: Boolean(parsed.complications.none), text: parsed.complications.none ? '' : (parsed.complications.text || card.complications.text || '') };
    if (parsed.complications.none) summary.push(en ? 'no complications' : 'bez powikłań');
  }
  for (const k of ['contrast', 'fluoro', 'dose', 'doseUnit']) if (parsed[k]) card[k] = String(parsed[k]);
  if (parsed.indication && !card.indication) card.indication = parsed.indication;
  if (parsed.recommendations) card.recommendations = parsed.recommendations;
  if (parsed.followUp) card.followUp = parsed.followUp;
  if (parsed.urgency) card.urgency = parsed.urgency;
  if (parsed.clinical && Object.keys(parsed.clinical).length) { card.clinical = { ...(card.clinical || {}), ...parsed.clinical }; summary.push(Object.entries(parsed.clinical).map(([k, v]) => `${k.toUpperCase()} ${v === true ? '✓' : v}`).join(', ')); }
  for (const d of (parsed.devices || []).map(devFix)) if (!card.devices.some((x) => x.name === d.name && x.size === d.size)) card.devices.push(d);
  const first = card.lesions.find((l) => l.id === activeId);
  if (first) card.diagram = first.diagram;
  return { activeId, summary, warnings };
}

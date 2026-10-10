// EndoList — treść listu: fakty z wizyt, skróty do schematu, generator offline (PL) z wariantami uprzejmości.
import {
  toothInfo, canalLabel, PULP_DX, PERI_DX, ENDO, ENDO_STATUS, IRRIG, MEDIC, FINDINGS, RADIO,
  WORK, POST_TYPE, IMPL_PREP, RTIME, CONTROL, PROG, LATERAL,
} from './data.js';
import { finalDx } from './dx.js';

/* ------------------------------------------------------------ polszczyzna */
export const PT = {
  f: { nom: 'Pacjentka', gen: 'Pacjentki', acc: 'Pacjentkę', ins: 'Pacjentką', welcome: 'mile widziana', came: 'zgłosiła się', reported: 'podawała' },
  m: { nom: 'Pacjent', gen: 'Pacjenta', acc: 'Pacjenta', ins: 'Pacjentem', welcome: 'mile widziany', came: 'zgłosił się', reported: 'podawał' },
};
const past = (stem, g) => stem + (g === 'm' ? 'em' : 'am'); // mogł-am / mogł-em
export const plNum = (v) => String(v ?? '').trim().replace('.', ',');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const low = (s) => (s ? s[0].toLowerCase() + s.slice(1) : s);
const join = (a, sep = ', ', last = ' i ') => { a = a.filter(Boolean); return a.length < 2 ? a.join('') : a.slice(0, -1).join(sep) + last + a[a.length - 1]; };
function canalsWord(n) { if (n === 1) return 'kanał'; const d = n % 10, t = n % 100; return d >= 2 && d <= 4 && (t < 12 || t > 14) ? 'kanały' : 'kanałów'; }
const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
export const fmtDateLong = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS_GEN[m - 1]} ${y}`; };
export const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${d}.${m}.${y}`; };
function rootGen(label) {
  if (!label || label === 'korzeń') return 'korzenia';
  const words = label.replace(/^korzeń\s*/, '').split(' ');
  return 'korzenia ' + words.map((w) => (/y$/.test(w) ? w.slice(0, -1) + 'ego' : /y\)$/.test(w) ? w.slice(0, -2) + 'ego)' : w)).join(' ');
}

/* ------------------------------------------------------------ frazy kliniczne */
export function examPhrases(dx) {
  const x = dx.tests || {}, out = [];
  out.push({ wnl: 'prawidłowa reakcja na zimno', exag: 'nasilona, krótkotrwała reakcja na zimno', ling: 'przedłużony ból po bodźcu zimnym', nr: 'brak reakcji na zimno' }[x.cold]);
  out.push({ pos: `dodatni test elektryczny${x.eptVal ? ` (${x.eptVal})` : ''}`, neg: `ujemny test elektryczny${x.eptVal ? ` (${x.eptVal})` : ''}` }[x.ept]);
  out.push({ wnl: 'prawidłowa reakcja na ciepło', ling: 'przedłużony ból po bodźcu ciepłym', nr: 'brak reakcji na ciepło' }[x.heat]);
  out.push({ pain: 'bolesne opukiwanie', wnl: 'opukiwanie niebolesne' }[x.perc]);
  out.push({ pain: 'bolesna palpacja okolicy wierzchołka', wnl: 'palpacja niebolesna' }[x.palp]);
  out.push({ pain: 'ból przy nagryzaniu', release: 'ból przy zwolnieniu nacisku', wnl: 'nagryzanie bez dolegliwości' }[x.bite]);
  if (x.probe !== '' && x.probe != null) out.push(x.probeIso ? `izolowana wąska kieszeń ${plNum(x.probe)} mm` : `głębokość kieszonek nie przekraczała ${plNum(x.probe)} mm`);
  else if (x.probeIso) out.push('izolowana wąska kieszeń');
  if (x.mob === 'phys') out.push('ruchomość fizjologiczna'); else if (['I', 'II', 'III'].includes(x.mob)) out.push(`ruchomość ${x.mob}°`);
  if (x.swelling === 'intra') out.push('obrzęk wewnątrzustny'); else if (x.swelling === 'extra') out.push('obrzęk zewnątrzustny');
  if (x.sinus === 'yes') out.push('obecna przetoka');
  return out.filter(Boolean);
}
export function radioPhrase(dx) {
  const f = (dx.radio || []).map((k) => RADIO[k]).filter(Boolean).map((s, i) => (i ? low(s) : s));
  let s = f.join(', ');
  if (dx.radioNote) s = s ? `${s}; ${dx.radioNote.trim().replace(/\.$/, '')}` : dx.radioNote.trim().replace(/\.$/, '');
  return s;
}
export function dxPhrase(dx, icd = true) {
  const d = finalDx(dx);
  const p = [];
  if (d.pulp) p.push(low(PULP_DX[d.pulp].label) + (icd && PULP_DX[d.pulp].icd ? ` (${PULP_DX[d.pulp].icd})` : ''));
  if (d.peri) p.push(low(PERI_DX[d.peri].label) + (icd && PERI_DX[d.peri].icd ? ` (${PERI_DX[d.peri].icd})` : ''));
  return p.join('; ');
}
const OBT_INS = { cwt: 'metodą fali ciągłej (CWT)', wvc: 'metodą pionowej kondensacji ciepłej gutaperki', lat: 'metodą kondensacji bocznej na zimno', sc: 'techniką pojedynczego ćwieka', carrier: 'gutaperką na nośniku', thermo: 'metodą termoplastyczną (wstrzykiwanie gutaperki)' };
const SEAL_INS = { 'uszczelniacz bioceramiczny': 'uszczelniaczem bioceramicznym', 'AH Plus': 'uszczelniaczem AH Plus', 'uszczelniacz na bazie żywicy epoksydowej': 'uszczelniaczem na bazie żywicy epoksydowej', 'uszczelniacz z wodorotlenkiem wapnia': 'uszczelniaczem z wodorotlenkiem wapnia', 'uszczelniacz cynkowo-tlenkowo-eugenolowy': 'uszczelniaczem cynkowo-tlenkowo-eugenolowym' };
const MAT_INS = { kompozyt: 'materiałem kompozytowym', 'kompozyt typu bulk-fill': 'kompozytem typu bulk-fill', kompomer: 'kompomerem', 'cement glasjonomerowy': 'cementem glasjonomerowym', amalgamat: 'amalgamatem', 'materiał bioaktywny': 'materiałem bioaktywnym' };
const ANESTH_INS = { infil: 'nasiękowym', block: 'przewodowym', pdl: 'śródwięzadłowym', intrapulp: 'dokomorowym' };
const TEMP_INS = { cavit: 'opatrunkiem tymczasowym (Cavit)', gic: 'opatrunkiem z cementu glasjonomerowego', cavitgic: 'opatrunkiem tymczasowym (Cavit + cement glasjonomerowy)', teflon: 'opatrunkiem tymczasowym (taśma PTFE + Cavit)' };

const PROD_PREFIX = { files: 'narzędzia', glide: 'ścieżka szybowania', apex: 'endometr', motor: 'endomotor', activation: '', sealer: 'uszczelniacz', obtsys: 'system obturacji', repair: '', medic: '', temp: '', composite: 'kompozyt', adhesive: 'system łączący', post: '', cement: 'cement', anesth: '', isolation: '', micro: 'mikroskop', imaging: '', other: '' };
export function productList(rec) {
  return (rec.products || []).map((x) => { const pre = PROD_PREFIX[x.cat]; return pre && !x.name.toLowerCase().includes(pre.slice(0, 6)) ? `${pre} ${x.name}` : x.name; }).join(', ');
}

/** Canal anatomy goes into the letter only once the dentist has confirmed it (or entered working lengths). */
export const anatKnown = (rec) => !!rec.anatOk || (rec.roots || []).some((r) => r.canals.some((c) => c.wl));

export function endoSentences(rec, P) {
  const e = rec.endo || {}, pr = ENDO[e.proc];
  if (!pr) return [];
  const out = [];
  if (pr.consult) { if (e.note) out.push(cap(e.note.trim())); return out; }
  const verb = e.status === 'planned' ? 'Zaplanowano' : e.status === 'stage' && pr.staged ? 'Rozpoczęto' : 'Wykonano';
  const name = pr.acc;
  if (e.status === 'planned') { out.push(`${verb} ${name}.`); return out; }
  const cond = [];
  if (e.anesth && e.anesth !== 'none') cond.push(`w znieczuleniu ${ANESTH_INS[e.anesth]}${e.agent ? ` (${e.agent.trim()})` : ''}`);
  else if (e.agent) cond.push(`w znieczuleniu miejscowym (${e.agent.trim()})`);
  if (e.dam && !pr.surgical) cond.push('w izolacji koferdamem');
  if (e.micro) cond.push('z użyciem mikroskopu zabiegowego');
  out.push(`${verb} ${name}${cond.length ? ' ' + join(cond, ', ', ', ') : ''}.`);
  const canals = anatKnown(rec) ? (rec.roots || []).flatMap((r) => r.canals.map((c) => ({ ...c, root: r }))) : [];
  if (pr.canals && canals.length) {
    const n = canals.length, single = n === 1;
    const names = canals.map((c) => canalLabel(c.name)).filter((x) => x !== 'kanał');
    const wl = canals.filter((c) => c.wl);
    let s = single ? 'Opracowano chemomechanicznie kanał' : `Opracowano chemomechanicznie ${n} ${canalsWord(n)}${names.length ? ` (${names.join(', ')})` : ''}`;
    if (wl.length) s += single ? ` do długości roboczej ${plNum(wl[0].wl)} mm` : `; długość robocza: ${wl.map((c) => `${canalLabel(c.name)} ${plNum(c.wl)} mm`).join(', ')}`;
    out.push(s + '.');
    if (e.apexloc || e.wlxray) out.push(`Długość roboczą wyznaczono ${[e.apexloc && 'endometrem', e.wlxray && 'na podstawie zdjęcia RTG'].filter(Boolean).join(' i ')}.`);
    const maf = canals.filter((c) => c.maf);
    if (maf.length) out.push(`Rozmiar końcowy opracowania: ${maf.map((c) => (single ? c.maf : `${canalLabel(c.name)} ${c.maf}`)).join(', ')}.`);
    const ir = (e.irrig || []).filter((k) => !['us', 'sonic', 'xp', 'laser'].includes(k)).map((k) => (k === 'naocl' && e.naocl ? `${plNum(e.naocl)}% NaOCl` : IRRIG[k]));
    const act = (e.irrig || []).filter((k) => ['us', 'sonic', 'xp', 'laser'].includes(k)).map((k) => IRRIG[k]);
    if (ir.length || act.length) out.push(`Płukanie: ${join(ir, ', ', ', ')}${act.length ? `, ${join(act, ', ', ', ')}` : ''}.`);
  }
  for (const r of anatKnown(rec) ? rec.roots || [] : []) if (r.lateral) out.push(r.lateral === 'delta' ? `Stwierdzono deltę korzeniową w obrębie ${rootGen(r.label)}.` : `Stwierdzono kanał boczny ${LATERAL[r.lateral]} ${rootGen(r.label)}.`);
  if (e.medic && e.status === 'stage') out.push(`Założono opatrunek leczniczy (${MEDIC[e.medic]}).`);
  else if (e.medic) out.push(`Zastosowano ${MEDIC[e.medic]} jako opatrunek leczniczy.`);
  if (pr.obt && e.status === 'done' && e.obtur) out.push(`${!canals.length ? 'System kanałowy wypełniono' : canals.length === 1 ? 'Kanał wypełniono' : 'Kanały wypełniono'} ${OBT_INS[e.obtur]}${e.sealer ? ` z ${SEAL_INS[e.sealer] || `uszczelniaczem (${e.sealer})`}` : ''}.`);
  if (pr.material && e.material) {
    const m = e.material.trim();
    out.push({ PULPOT: `Miazgę w komorze zaopatrzono materiałem: ${m}.`, DPC: `Obnażoną miazgę pokryto materiałem: ${m}.`, IPC: `Dno ubytku pokryto materiałem: ${m}.`, APEX: `Wykonano barierę wierzchołkową z materiału: ${m}.`, REP: `Barierę koronową wykonano z materiału: ${m}.`, APICO: `Wykonano wsteczne wypełnienie materiałem: ${m}.`, PERF: `Perforację zamknięto materiałem: ${m}.` }[e.proc] || `Zastosowany materiał: ${m}.`);
  }
  if (e.temp === 'comp') out.push('Ząb odbudowano materiałem kompozytowym.');
  else if (e.temp) out.push(`Ząb zaopatrzono ${TEMP_INS[e.temp]}.`);
  if (e.postxray) out.push('Wykonano kontrolne zdjęcie RTG.');
  if ((e.findings || []).length) out.push(`Śródzabiegowo: ${join(e.findings.map((k) => FINDINGS[k]), '; ', '; ')}.`);
  if (e.status === 'stage' && pr.staged) out.push(`${P.nom} zgłosi się na kolejną wizytę w celu zakończenia leczenia.`);
  if (e.note) out.push(cap(e.note.trim().replace(/([^.])$/, '$1.')));
  return out;
}

export function workSentence(w) {
  const note = w.note ? ` ${cap(w.note.trim().replace(/([^.])$/, '$1.'))}` : '';
  switch (w.type) {
    case 'FILL': {
      const surf = (w.surf || []).join('');
      return `Wykonano wypełnienie ubytku${w.cls ? ` klasy ${w.cls} wg Blacka` : ''}${surf ? ` (${surf})` : ''}${w.mat ? ` ${MAT_INS[w.mat] || `materiałem: ${w.mat}`}` : ''}${w.product ? ` (${w.product})` : ''}.${note}`;
    }
    case 'BUILDUP': return `Wykonano odbudowę zęba po leczeniu kanałowym${w.mat ? ` ${MAT_INS[w.mat] || w.mat}` : ''}${w.postType ? ` z wkładem ${POST_TYPE[w.postType]}` : ''}${w.product ? ` (${w.product})` : ''}.${note}`;
    case 'POST': return `Osadzono wkład koronowo-korzeniowy${w.postType ? ` ${POST_TYPE[w.postType]}` : ''}${w.product ? ` (${w.product})` : ''}.${note}`;
    case 'CROWNPREP': return `Opracowano ząb pod koronę protetyczną.${note}`;
    case 'TEMPCROWN': return `Osadzono koronę tymczasową.${note}`;
    case 'CROWN': return `Osadzono koronę protetyczną.${note}`;
    case 'ONLAY': return `Osadzono wkład/nakład (onlay).${note}`;
    case 'EXT': return `Wykonano ekstrakcję zęba.${note}`;
    case 'IMPLPREP': return `Przygotowanie do implantacji: ${(w.prep || []).map((k) => IMPL_PREP[k]).join(', ') || 'kwalifikacja do leczenia implantologicznego'}.${note}`;
    case 'IMPLANT': return `Wszczepiono implant.${note}`;
    case 'PERIO': return `Wykonano leczenie periodontologiczne (skaling).${note}`;
    default: return (w.note ? cap(w.note.trim().replace(/([^.])$/, '$1.')) : '');
  }
}

export function recSentences(rec) {
  const r = rec.rec || {}, out = [];
  if (r.restor && r.restor !== 'none') {
    if (r.restor === 'after') out.push('Ostateczną odbudowę zęba proszę zaplanować po zakończeniu leczenia kanałowego.');
    else {
      const what = { crown: 'korony protetycznej', onlay: 'nakładu (onlay) z pokryciem guzków', postcrown: 'wkładu koronowo-korzeniowego i korony protetycznej', direct: 'odbudowy bezpośredniej (kompozytowej)', access: 'ostatecznego zamknięcia dostępu w istniejącej koronie' }[r.restor];
      const why = ['crown', 'onlay', 'postcrown'].includes(r.restor) ? ', aby zabezpieczyć ząb przed złamaniem i mikroprzeciekiem' : '';
      out.push(`Zalecam wykonanie ${what}${RTIME[r.time] ? ' ' + RTIME[r.time] : ''}${why}.`);
    }
  }
  if (r.control) out.push(`Kontrola kliniczna i radiologiczna ${CONTROL[r.control]}.`);
  if (r.note) out.push(cap(r.note.trim().replace(/([^.])$/, '$1.')));
  return out;
}

/* ------------------------------------------------------------ list pisany w 1. osobie (generator wbudowany) */
// Verb in the first person past tense, by the author's gender: v('przeprowadził', g) → przeprowadziłam / przeprowadziłem.
const v = (stem, g) => stem + (g === 'm' ? 'em' : 'am');
const IRREG = { rozpoczął: ['rozpoczęłam', 'rozpocząłem'], zamknął: ['zamknęłam', 'zamknąłem'], usunął: ['usunęłam', 'usunąłem'], ominął: ['ominęłam', 'ominąłem'] };
// Intra-operative findings as first-person sentences (removals are merged into one sentence, told before the shaping).
const FIND_REMOVED = { postrem: 'wkład koronowo-korzeniowy', oldrem: 'stare wypełnienie kanałowe', sepret: 'złamane narzędzie' };
const FIND_1P = {
  mb2: (g) => `${cap(v('odnalazł', g))} i ${v('opracował', g)} kanał MB2.`, extra: (g) => `${cap(v('odnalazł', g))} dodatkowy kanał.`,
  oblit: (g, one) => (one ? 'Kanał był częściowo zobliterowany.' : 'Kanały były częściowo zobliterowane.'), curve: (g, one) => (one ? 'Kanał był silnie zakrzywiony.' : 'Kanały były silnie zakrzywione.'),
  crack: (g) => `${cap(v('stwierdził', g))} linię pęknięcia.`, vrf: () => 'Istnieje podejrzenie pionowego złamania korzenia.',
  sepbp: (g) => `${cap(vi('ominął', g))} złamane narzędzie.`, sepleft: (g) => `Złamane narzędzie ${v('pozostawił', g)} w kanale.`,
  perf: (g) => `${cap(vi('zamknął', g))} perforację.`, resorp: (g) => `${cap(v('stwierdził', g))} resorpcję.`,
  ledge: (g) => `W kanale ${v('stwierdził', g)} stopień (niedrożność).`, pus: () => 'Z kanału wydobywał się wysięk ropny.',
  bleed: (g) => `${cap(v('obserwował', g))} krwawienie z kanału.`, open: () => 'Wierzchołek korzenia był otwarty.',
  notneg: () => 'Nie udało się udrożnić kanału na pełną długość.',
};
const vi = (k, g) => IRREG[k][g === 'm' ? 1 : 0];

/** Examination in two natural sentences: what was abnormal ("W badaniu ząb nie reagował na zimno…, a nagryzanie wywoływało ból.")
 *  and, separately, the normal findings ("Palpacja … była niebolesna, a ruchomość zęba fizjologiczna."). */
export function examNarrative(dx) {
  const x = dx.tests || {}, tooth = [], abn = [], nor = [];
  if (x.cold === 'nr' && x.ept === 'neg') tooth.push(`nie reagował na zimno ani na test elektryczny${x.eptVal ? ` (${x.eptVal})` : ''}`);
  else {
    const c = { wnl: 'prawidłowo reagował na zimno', exag: 'reagował na zimno nasilonym, krótkotrwałym bólem', ling: 'reagował na zimno bólem utrzymującym się po usunięciu bodźca', nr: 'nie reagował na zimno' }[x.cold];
    if (c) tooth.push(c);
    const e = { pos: `reagował na test elektryczny${x.eptVal ? ` (${x.eptVal})` : ''}`, neg: `nie reagował na test elektryczny${x.eptVal ? ` (${x.eptVal})` : ''}` }[x.ept];
    if (e) tooth.push(e);
  }
  const h = { wnl: 'prawidłowo reagował na ciepło', ling: 'reagował na ciepło przedłużonym bólem', nr: 'nie reagował na ciepło' }[x.heat];
  if (h) tooth.push(h);
  if (x.perc === 'pain') abn.push('opukiwanie było bolesne'); else if (x.perc === 'wnl') nor.push('opukiwanie było niebolesne');
  if (x.palp === 'pain') abn.push('palpacja okolicy wierzchołka wywoływała ból'); else if (x.palp === 'wnl') nor.push('palpacja okolicy wierzchołka była niebolesna');
  if (x.bite === 'pain') abn.push('nagryzanie wywoływało ból'); else if (x.bite === 'release') abn.push('ból pojawiał się przy zwolnieniu nacisku'); else if (x.bite === 'wnl') nor.push('nagryzanie nie wywoływało dolegliwości');
  if (x.probe !== '' && x.probe != null) (x.probeIso ? abn : nor).push(x.probeIso ? `obecna była izolowana wąska kieszeń o głębokości ${plNum(x.probe)} mm` : `głębokość kieszonek nie przekraczała ${plNum(x.probe)} mm`);
  else if (x.probeIso) abn.push('obecna była izolowana wąska kieszeń');
  if (x.mob === 'phys') nor.push('ruchomość zęba była fizjologiczna'); else if (['I', 'II', 'III'].includes(x.mob)) abn.push(`ruchomość zęba odpowiadała ${x.mob}°`);
  if (x.swelling === 'intra') abn.push('obecny był obrzęk wewnątrzustny'); else if (x.swelling === 'extra') abn.push('obecny był obrzęk zewnątrzustny');
  if (x.sinus === 'yes') abn.push('obecna była przetoka');
  const first = [tooth.length ? 'ząb ' + join(tooth, ', ', ' i ') : '', ...abn].filter(Boolean);
  const out = [];
  if (first.length) out.push(`W badaniu ${join(first, ', ', ', a ')}.`);
  if (nor.length) out.push(first.length ? `${cap(join(nor, ', ', ', a '))}.` : `W badaniu ${join(nor, ', ', ', a ')}.`);
  return out.join(' ');
}

const ACT_INS = { us: 'z aktywacją ultradźwiękową', sonic: 'z aktywacją soniczną', xp: 'z użyciem XP-endo Finisher', laser: 'z aktywacją laserową' };
/** Root canal treatment told by the author ("Przeprowadziłam leczenie kanałowe…"). */
export function endoNarrative(rec, P, g) {
  const e = rec.endo || {}, pr = ENDO[e.proc];
  if (!pr) return [];
  const out = [];
  if (pr.consult) { if (e.note) out.push(cap(e.note.trim().replace(/([^.])$/, '$1.'))); return out; }
  if (e.status === 'planned') { out.push(`${cap(v('zaplanował', g))} ${pr.acc}.`); if (e.note) out.push(cap(e.note.trim().replace(/([^.])$/, '$1.'))); return out; }
  const cond = [];
  if (e.anesth && e.anesth !== 'none') cond.push(`w znieczuleniu ${ANESTH_INS[e.anesth]}${e.agent ? ` (${e.agent.trim()})` : ''}`);
  else if (e.agent) cond.push(`w znieczuleniu miejscowym (${e.agent.trim()})`);
  if (e.dam && !pr.surgical) cond.push('w izolacji koferdamem');
  if (e.micro) cond.push('z użyciem mikroskopu zabiegowego');
  const start = e.status === 'stage' && pr.staged ? cap(vi('rozpoczął', g)) : cap(v('przeprowadził', g));
  out.push(`${start} ${pr.acc}${cond.length ? ' ' + join(cond, ', ', ' i ') : ''}.`);
  const removed = (e.findings || []).filter((k) => FIND_REMOVED[k]).map((k) => FIND_REMOVED[k]);
  if (removed.length) out.push(`${cap(vi('usunął', g))} ${join(removed, ', ', ' i ')}.`);
  const canals = anatKnown(rec) ? (rec.roots || []).flatMap((r) => r.canals.map((c) => ({ ...c, root: r }))) : [];
  if (pr.canals && canals.length) {
    const n = canals.length, single = n === 1;
    const names = canals.map((c) => canalLabel(c.name)).filter((x) => x !== 'kanał');
    const wl = canals.filter((c) => c.wl);
    const how = [e.apexloc && 'endometrem', e.wlxray && (e.apexloc ? 'potwierdzonej zdjęciem RTG' : 'na podstawie zdjęcia RTG')].filter(Boolean);
    const howTxt = how.length ? `, wyznaczonej ${how[0]}${how[1] ? ` i ${how[1]}` : ''}` : '';
    let s = single ? `${cap(v('opracował', g))} chemomechanicznie kanał` : `${cap(v('opracował', g))} chemomechanicznie ${n} ${canalsWord(n)}${names.length ? ` (${names.join(', ')})` : ''}`;
    if (wl.length) s += single ? ` do długości roboczej ${plNum(wl[0].wl)} mm${howTxt}` : ` do długości roboczej ${wl.map((c) => `${canalLabel(c.name)} ${plNum(c.wl)} mm`).join(', ')}${howTxt}`;
    else if (how.length) s += `; długość roboczą ${v('wyznaczył', g)} ${how.map((x) => x.replace('potwierdzonej zdjęciem RTG', 'i zdjęciem RTG').replace('na podstawie zdjęcia RTG', 'na podstawie zdjęcia RTG')).join(' ')}`;
    out.push(s + '.');
    const maf = canals.filter((c) => c.maf);
    if (maf.length) out.push(`Końcowy rozmiar opracowania: ${maf.map((c) => (single ? c.maf : `${canalLabel(c.name)} ${c.maf}`)).join(', ')}.`);
    const ir = (e.irrig || []).filter((k) => !ACT_INS[k]).map((k) => (k === 'naocl' && e.naocl ? `${plNum(e.naocl)}% NaOCl` : IRRIG[k]));
    const act = (e.irrig || []).filter((k) => ACT_INS[k]).map((k) => ACT_INS[k]);
    if (ir.length) out.push(`${single ? 'Kanał' : 'Kanały'} ${v('płukał', g)} ${join(ir, ', ', ' i ')}${act.length ? `, ${join(act, ', ', ' i ')}` : ''}.`);
    else if (act.length) out.push(`Płukanie ${single ? 'kanału' : 'kanałów'} ${v('prowadził', g)} ${join(act, ', ', ' i ')}.`);
  }
  for (const r of anatKnown(rec) ? rec.roots || [] : []) if (r.lateral) out.push(r.lateral === 'delta' ? `W obrębie ${rootGen(r.label)} ${v('stwierdził', g)} deltę korzeniową.` : `${cap(v('uwidocznił', g))} kanał boczny ${LATERAL[r.lateral]} ${rootGen(r.label)}.`);
  for (const k of e.findings || []) if (!FIND_REMOVED[k]) out.push(FIND_1P[k] ? FIND_1P[k](g, canals.length === 1) : cap(`${FINDINGS[k] || k}.`));
  if (e.medic && e.status === 'stage') out.push(`Do kanałów ${v('założył', g)} opatrunek leczniczy (${MEDIC[e.medic]}).`);
  else if (e.medic) out.push(`Jako opatrunek leczniczy ${v('zastosował', g)} ${MEDIC[e.medic]}.`);
  if (pr.obt && e.status === 'done' && e.obtur) out.push(`${!canals.length ? 'System kanałowy' : canals.length === 1 ? 'Kanał' : 'Kanały'} ${v('wypełnił', g)} ${OBT_INS[e.obtur]}${e.sealer ? ` z ${SEAL_INS[e.sealer] || `uszczelniaczem (${e.sealer})`}` : ''}.`);
  if (pr.material && e.material) {
    const m = e.material.trim();
    out.push({ PULPOT: `Miazgę w komorze ${v('zaopatrzył', g)} materiałem ${m}.`, DPC: `Obnażoną miazgę ${v('pokrył', g)} materiałem ${m}.`, IPC: `Dno ubytku ${v('pokrył', g)} materiałem ${m}.`, APEX: `Barierę wierzchołkową ${v('wykonał', g)} z materiału ${m}.`, REP: `Barierę koronową ${v('wykonał', g)} z materiału ${m}.`, APICO: `Wsteczne wypełnienie ${v('wykonał', g)} materiałem ${m}.`, PERF: `Perforację ${vi('zamknął', g)} materiałem ${m}.` }[e.proc] || `${cap(v('zastosował', g))} materiał ${m}.`);
  }
  if (e.temp === 'comp') out.push(`Na zakończenie ${v('odbudował', g)} ząb materiałem kompozytowym.`);
  else if (e.temp) out.push(`Na zakończenie ząb ${v('zabezpieczył', g)} ${TEMP_INS[e.temp]}.`);
  if (e.postxray) out.push(e.status === 'done' ? `Leczenie ${v('zakończył', g)} kontrolnym zdjęciem RTG.` : `${cap(v('wykonał', g))} kontrolne zdjęcie RTG.`);
  if (e.status === 'stage' && pr.staged) out.push(`${P.nom} zgłosi się na kolejną wizytę w celu zakończenia leczenia.`);
  if (e.note) out.push(cap(e.note.trim().replace(/([^.])$/, '$1.')));
  return out;
}
/** Other work on the tooth, told by the author; brand names go to the materials box, not the text. */
export function workNarrative(w, g) {
  const note = w.note ? ` ${cap(w.note.trim().replace(/([^.])$/, '$1.'))}` : '';
  switch (w.type) {
    case 'FILL': { const surf = (w.surf || []).join(''); return `${cap(v('wypełnił', g))} ubytek${w.cls ? ` klasy ${w.cls} wg Blacka` : ''}${surf ? ` (${surf})` : ''}${w.mat ? ` ${MAT_INS[w.mat] || `materiałem: ${w.mat}`}` : ''}.${note}`; }
    case 'BUILDUP': return `${cap(v('odbudował', g))} ząb po leczeniu kanałowym${w.mat ? ` ${MAT_INS[w.mat] || w.mat}` : ''}${w.postType ? ` z wkładem ${POST_TYPE[w.postType]}` : ''}.${note}`;
    case 'POST': return `${cap(v('osadził', g))} wkład koronowo-korzeniowy${w.postType ? ` ${POST_TYPE[w.postType]}` : ''}.${note}`;
    case 'CROWNPREP': return `${cap(v('opracował', g))} ząb pod koronę protetyczną.${note}`;
    case 'TEMPCROWN': return `${cap(v('osadził', g))} koronę tymczasową.${note}`;
    case 'CROWN': return `${cap(v('osadził', g))} koronę protetyczną.${note}`;
    case 'ONLAY': return `${cap(v('osadził', g))} nakład (onlay).${note}`;
    case 'EXT': return `${cap(vi('usunął', g))} ząb.${note}`;
    case 'IMPLPREP': return `W ramach przygotowania do leczenia implantologicznego: ${(w.prep || []).map((k) => IMPL_PREP[k]).join(', ') || 'kwalifikacja'}.${note}`;
    case 'IMPLANT': return `${cap(v('wszczepił', g))} implant.${note}`;
    case 'PERIO': return `${cap(v('przeprowadził', g))} leczenie periodontologiczne (skaling).${note}`;
    default: return (w.note ? cap(w.note.trim().replace(/([^.])$/, '$1.')) : '');
  }
}
/** Materials and equipment per tooth — shown in a side box next to the schematic, not in the letter text. */
export function materialsFor(visits) {
  const { teeth } = collect(visits);
  return teeth.map(([fdi, entries]) => {
    const items = [];
    for (const { visit, rec } of entries) {
      if (visit.performer === 'other') continue;
      const pr = ENDO[rec.endo?.proc];
      if (rec.endo?.micro && pr && !pr.consult && rec.endo.status !== 'planned') { const mb = rec.endo.microBrand?.trim(); if (!mb) items.push('mikroskop zabiegowy'); else if (!(rec.products || []).some((x) => x.name === mb)) items.push(`mikroskop ${mb}`); }
      for (const x of rec.products || []) { const pre = PROD_PREFIX[x.cat]; items.push(pre && !x.name.toLowerCase().includes(pre.slice(0, 6)) ? `${pre} ${x.name}` : x.name); }
      for (const w of rec.work || []) if (w.product) items.push(w.product);
    }
    return { fdi, items: [...new Set(items)] };
  }).filter((m) => m.items.length);
}

/* ------------------------------------------------------------ fakty (z wybranych wizyt) */
/** Groups the selected visits by tooth. Each entry: { visit, rec } in date order. */
/** Root canal details actually entered (not the routine defaults such as rubber dam or NaOCl/EDTA). */
export function endoEntered(rec) {
  const e = rec.endo || {};
  return !!(e.obtur || e.sealer || e.medic || e.apexloc || e.wlxray || e.postxray || e.temp || (e.findings || []).length || (rec.roots || []).some((r) => r.canals.some((c) => c.wl || c.maf)));
}
/** A tooth with root canal details but no procedure chosen is described as root canal treatment (nothing gets lost). */
function normalized(rec) {
  const e = rec.endo || {};
  if (e.proc || !endoEntered(rec)) return rec;
  return { ...rec, endo: { ...e, proc: 'RCT', status: e.medic && !e.obtur ? 'stage' : e.status || 'done' } };
}
export function collect(visits) {
  const sorted = [...visits].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const byTooth = new Map();
  for (const v of sorted) for (const rec0 of v.teeth || []) {
    const rec = normalized(rec0);
    if (!byTooth.has(rec.fdi)) byTooth.set(rec.fdi, []);
    byTooth.get(rec.fdi).push({ visit: v, rec });
  }
  return { sorted, teeth: [...byTooth.entries()].sort((a, b) => a[0] - b[0]) };
}

export function markFor(entries) {
  let best = '';
  const rank = { endo: 5, stage: 4, work: 3, plan: 2, exam: 1, '': 0 };
  for (const { rec } of entries) {
    const e = rec.endo || {}, pr = ENDO[e.proc];
    let m = '';
    if (pr && !pr.consult) m = e.status === 'done' ? 'endo' : e.status === 'stage' ? 'stage' : 'plan';
    else if ((rec.work || []).length) m = 'work';
    else if (pr && pr.consult) m = 'plan';
    else m = 'exam'; // examined / described only — still marked on the schematic
    if (rank[m] > rank[best]) best = m;
  }
  return best;
}

/** Shorthand notes under the letter schematic. */
export function glance(visits) {
  const { teeth } = collect(visits);
  return teeth.map(([fdi, entries]) => {
    const parts = [];
    for (const { rec } of entries) {
      const e = rec.endo || {}, pr = ENDO[e.proc];
      if (pr) {
        let s = pr.consult ? 'Konsultacja' : `${pr.short} ${e.status === 'done' ? 'zakończone' : e.status === 'stage' ? '— etap I' : '— plan'}`;
        if (pr.canals && e.status !== 'planned' && anatKnown(rec)) {
          const cs = (rec.roots || []).flatMap((r) => r.canals);
          if (cs.length) {
            const wl = cs.filter((c) => c.wl);
            s += ` · ${cs.length} ${cs.length === 1 ? 'kanał' : 'k.'}`;
            if (wl.length) s += `: ${wl.map((c) => (canalLabel(c.name) === 'kanał' ? '' : canalLabel(c.name) + ' ') + plNum(c.wl)).join(', ')} mm`;
            else if (cs.length > 1) s += ` (${cs.map((c) => c.name).join(', ')})`;
          }
        }
        if (pr.obt && e.status === 'done' && e.obtur) s += ` · ${{ cwt: 'CWT', wvc: 'kond. pionowa', lat: 'kond. boczna', sc: 'single cone', carrier: 'nośnik', thermo: 'termoplast.' }[e.obtur]}${e.sealer === 'uszczelniacz bioceramiczny' ? ' + BC' : ''}`;
        if (e.medic && e.status === 'stage') s += ` · ${e.medic === 'caoh' ? 'Ca(OH)2' : MEDIC[e.medic]}`;
        parts.push(s);
      }
      for (const w of rec.work || []) {
        if (w.type === 'FILL') parts.push(`Wyp.${w.cls ? ` kl. ${w.cls}` : ''}${(w.surf || []).length ? ' ' + w.surf.join('') : ''}`);
        else parts.push(WORK[w.type]?.short || 'Inne');
      }
      const r = rec.rec || {};
      if (r.restor && !['none', 'after', ''].includes(r.restor)) parts.push(`Zal.: ${{ crown: 'korona', onlay: 'onlay', postcrown: 'wkład + korona', direct: 'odbudowa bezp.', access: 'zamknięcie dostępu' }[r.restor]}${r.time === '30d' ? ' ≤30 dni' : r.time === '2w' ? ' ≤2 tyg.' : r.time === '60d' ? ' ≤2 mies.' : r.time === 'asap' ? ' pilnie' : ''}`);
      if (r.control) parts.push(`kontrola ${{ '3m': '3 mies.', '6m': '6 mies.', '12m': '12 mies.', '6-12m': '6/12 mies.', '1-4y': '1–4 lata' }[r.control]}`);
    }
    const last = [...entries].reverse().find(({ rec }) => ENDO[rec.endo?.proc]?.canals && anatKnown(rec));
    const canals = last ? (last.rec.roots || []).reduce((n, r) => n + r.canals.length, 0) : 0;
    if (!parts.length) { const d = dxPhrase(entries.at(-1).rec.dx || {}, false); parts.push(d ? `Badanie · ${d.split(';')[0]}` : 'Badanie'); }
    return { fdi, mark: markFor(entries), canals, text: [...new Set(parts)].join(' · ') };
  });
}

/* ------------------------------------------------------------ uprzejmości (warianty) */
export const OPENINGS = [
  (P) => `Dziękuję za skierowanie ${P.gen} do mojego gabinetu.`,
  (P) => `Uprzejmie dziękuję za powierzenie mi leczenia ${P.gen}.`,
  (P) => `Dziękuję za zaufanie i skierowanie ${P.gen} na leczenie endodontyczne.`,
  (P) => `Bardzo dziękuję za skierowanie ${P.gen}. Poniżej przekazuję informację o przeprowadzonym leczeniu.`,
  (P) => `Dziękuję za przekazanie ${P.gen} pod moją opiekę. Uprzejmie informuję o przebiegu leczenia.`,
  (P) => `Serdecznie dziękuję za skierowanie. Przesyłam informację o leczeniu przeprowadzonym u ${P.gen}.`,
  (P) => `Dziękuję za skierowanie ${P.gen} — z przyjemnością przekazuję podsumowanie leczenia.`,
  (P) => `Uprzejmie dziękuję za skierowanie ${P.gen} i przekazuję informację o wykonanym leczeniu.`,
];
export const OPENINGS_REPEAT = [
  (P) => `Dziękuję za ponowne zaufanie i skierowanie ${P.gen}.`,
  (P) => `Ponownie dziękuję za współpracę i skierowanie ${P.gen} do mojego gabinetu.`,
];
export const CLOSINGS = [
  (P, g) => `Z przyjemnością ${past('zaopiekował', g)} się ${P.ins}. W razie dolegliwości lub pytań proszę śmiało kierować ${P.acc} ponownie.`,
  (P, g) => `Cieszę się, że ${past('mogł', g)} pomóc. Gdyby pojawiły się jakiekolwiek problemy, chętnie ponownie przyjmę ${P.acc}.`,
  (P) => `Dziękuję za współpracę. W razie nowych dolegliwości zapraszam do ponownego skierowania ${P.gen}.`,
  (P) => `Pozostaję do dyspozycji w razie pytań. W przypadku jakichkolwiek dolegliwości ${P.nom} może zgłosić się do mnie ponownie.`,
  (P) => `Było mi miło pomóc. Jeśli pojawią się jakiekolwiek problemy, chętnie ponownie zajmę się ${P.ins}.`,
  (P) => `Dziękuję za możliwość współpracy. W razie potrzeby ${P.nom} jest zawsze ${P.welcome} w moim gabinecie.`,
  (P, g) => `Z przyjemnością ${past('pomogł', g)} w leczeniu ${P.gen}. W razie wątpliwości proszę o kontakt lub ponowne skierowanie.`,
  (P) => `Bardzo dziękuję za zaufanie. Gdyby potrzebna była dalsza opieka, chętnie ponownie przyjmę ${P.acc}.`,
];
function pickVariant(list, used, args) {
  const texts = list.map((f) => f(...args));
  const fresh = texts.filter((t) => !used.includes(t));
  const pool = fresh.length ? fresh : texts;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function salutation(ref) {
  if (!ref) return 'Szanowni Państwo,';
  if (ref.kind === 'clinic') return 'Szanowni Państwo,';
  return ref.gender === 'm' ? 'Szanowny Panie Doktorze,' : 'Szanowna Pani Doktor,';
}

/* ------------------------------------------------------------ generator offline */
export function buildOffline({ visits, patient, doctor, referrer, used = { openings: [], closings: [] }, repeat = false, icd = true }) {
  const P = PT[patient.sex === 'm' ? 'm' : 'f'], g = doctor.gender === 'm' ? 'm' : 'f';
  const { teeth } = collect(visits);
  const opening = pickVariant(repeat ? [...OPENINGS_REPEAT, ...OPENINGS] : OPENINGS, used.openings, [P]);
  const sections = [];
  const recs = [];
  for (const [fdi, entries] of teeth) {
    const ti = toothInfo(fdi), paras = [];
    const multi = entries.length > 1;
    for (const { visit, rec } of entries) {
      const dx = rec.dx || {}, other = visit.performer === 'other';
      // treatment done elsewhere earlier: reported impersonally
      if (other) {
        const lines = [...endoSentences(rec, P), ...(rec.work || []).map(workSentence).filter(Boolean)];
        if (rec.manual && rec.manual.trim()) lines.push(cap(rec.manual.trim().replace(/([^.!?])$/, '$1.')));
        if (lines.length) paras.push(`${visit.date ? fmtDate(visit.date) + ' ' : ''}ząb był leczony w innym gabinecie${visit.otherDentist ? ` (${visit.otherDentist})` : ''}: ${low(lines.join(' '))}`.replace(/^./, (c) => c.toUpperCase()));
        continue;
      }
      // 1) why the patient came and what I found
      const a = [];
      const cc = dx.history?.cc?.trim().replace(/\.$/, '');
      const hx = [dx.history?.spontaneous && 'ból samoistny', dx.history?.night && 'ból nocny', dx.history?.deep && 'głęboką próchnicę'].filter(Boolean);
      if (cc) a.push(`${P.nom} ${P.came}${multi && visit.date ? ` (${fmtDate(visit.date)})` : ''} z dolegliwościami ze strony tego zęba — ${low(cc)}.`);
      else if (multi && visit.date) a.push(`Podczas wizyty ${fmtDate(visit.date)}:`);
      if (hx.length) a.push(`W wywiadzie ${P.reported} ${join(hx, ', ', ' i ')}.`);
      const ex = examNarrative(dx);
      if (ex) a.push(ex);
      const rp = radioPhrase(dx);
      if (rp) a.push(`W obrazie RTG: ${low(rp)}.`);
      const d = dxPhrase(dx, icd);
      if (d && (rec.endo?.proc || ex)) a.push(`Na tej podstawie ${v('ustalił', g)} rozpoznanie: ${d.replace(/; /g, ', ')}.`);
      // 2) what I did
      const b = [...endoNarrative(rec, P, g), ...(rec.work || []).map((w) => workNarrative(w, g)).filter(Boolean)];
      if (rec.manual && rec.manual.trim()) b.push(cap(rec.manual.trim().replace(/([^.!?])$/, '$1.')));
      if (a.length) paras.push(a.join(' '));
      if (b.length) paras.push(b.join(' '));
      recs.push(...recSentences(rec).map((x) => (teeth.length > 1 ? `Ząb ${fdi}: ${low(x)}` : x)));
      if (rec.rec?.prog) recs.push(`${teeth.length > 1 ? `Ząb ${fdi} — rokowanie` : 'Rokowanie'}: ${PROG[rec.rec.prog]}.`);
    }
    sections.push({ heading: `Ząb ${fdi} — ${ti.name}`, paragraphs: paras });
  }
  const closing = pickVariant(CLOSINGS, used.closings, [P, g]);
  return { opening, sections, recommendations: [...new Set(recs)], closing, warnings: [] };
}

/* ------------------------------------------------------------ dane dla AI (bez danych osobowych) */
export function aiPayload({ visits, patient, doctor, referrer, used, repeat, icd = true, draft }) {
  const { teeth } = collect(visits);
  return {
    language: 'pl',
    doctor: { grammatical_gender: doctor.gender === 'm' ? 'male' : 'female' },
    addressee: referrer ? { kind: referrer.kind === 'clinic' ? 'clinic' : 'doctor', grammatical_gender: referrer.kind === 'clinic' ? null : referrer.gender === 'm' ? 'male' : 'female' } : { kind: 'clinic', grammatical_gender: null },
    patient: { grammatical_gender: patient.sex === 'm' ? 'male' : 'female' },
    repeat_referral: !!repeat,
    include_icd10: !!icd,
    avoid_openings: used.openings.slice(-6),
    avoid_closings: used.closings.slice(-6),
    teeth: teeth.map(([fdi, entries]) => ({
      tooth: String(fdi),
      tooth_name: toothInfo(fdi).name,
      history: entries.map(({ visit, rec }) => ({
        date: visit.date,
        performed_by: visit.performer === 'other' ? (visit.otherDentist || 'inny lekarz') : 'self',
        reason: rec.dx?.history?.cc || '',
        examination: examPhrases(rec.dx || {}),
        radiology: radioPhrase(rec.dx || {}),
        diagnosis: dxPhrase(rec.dx || {}, icd),
        anatomy: (anatKnown(rec) ? rec.roots || [] : []).map((r) => ({ root: r.label || r.name, canals: r.canals.map((c) => ({ canal: canalLabel(c.name), working_length_mm: c.wl ? plNum(c.wl) : null, reference: c.ref || null, final_size: c.maf || null })), lateral_canal: r.lateral ? LATERAL[r.lateral] : null })),
        endodontic_treatment: rec.endo?.proc ? { procedure: ENDO[rec.endo.proc]?.label, status: ENDO_STATUS[rec.endo.status], sentences: endoSentences(rec, PT[patient.sex === 'm' ? 'm' : 'f']) } : null,
        other_work: (rec.work || []).map(workSentence).filter(Boolean),
        products: (rec.products || []).map((x) => `${x.name} (${x.cat})`),
        free_text_notes: rec.manual || '',
        recommendations: visit.performer === 'other' ? [] : recSentences(rec),
        prognosis: visit.performer === 'other' ? null : (rec.rec?.prog ? PROG[rec.rec.prog] : null),
      })),
    })),
    visit_notes: visits.filter((v) => v.notes).map((v) => ({ date: v.date, note: v.notes })),
    draft,
  };
}

/* ------------------------------------------------------------ wpis do dokumentacji (ProDentis) */
const RESTOR_REC = { crown: 'korona protetyczna', onlay: 'nakład (onlay) z pokryciem guzków', postcrown: 'wkład koronowo-korzeniowy i korona protetyczna', direct: 'odbudowa bezpośrednia (kompozytowa)', access: 'ostateczne zamknięcie dostępu w istniejącej koronie', after: 'ostateczna odbudowa po zakończeniu leczenia kanałowego' };
const HIST_STATUS = { treated: 'ząb leczony wcześniej kanałowo', initiated: 'leczenie kanałowe rozpoczęte wcześniej' };
/** Treatment record for the patient's chart (e.g. ProDentis): what was found, done and used — no letter phrasing.
 *  One block per visit and tooth; impersonal clinical style ("Wykonano…"). */
export function recordEntry({ visits, patient = {}, doctor = '', fmtDate = (d) => d }) {
  const P = PT[patient.sex === 'm' ? 'm' : 'f'];
  const mats = new Map(materialsFor(visits).map((m) => [m.fdi, m.items]));
  const sorted = [...visits].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const out = [];
  for (const v of sorted) {
    const teeth = [...(v.teeth || [])].map(normalized).sort((a, b) => a.fdi - b.fdi);
    if (!teeth.length) continue;
    if (out.length) out.push('');
    out.push(`Data: ${fmtDate(v.date)}${v.performer === 'other' ? ` — leczenie wykonane wcześniej (${v.otherDentist?.trim() || 'inny lekarz'})` : ''}`);
    for (const rec of teeth) {
      const dx = rec.dx || {}, h = dx.history || {}, r = rec.rec || {};
      out.push('', `Ząb ${rec.fdi} — ${toothInfo(rec.fdi).name}`);
      const hist = [h.cc?.trim(), h.spontaneous && 'ból samoistny', h.night && 'ból nocny', h.deep && 'głęboka próchnica / obnażenie miazgi', HIST_STATUS[h.status]].filter(Boolean);
      if (hist.length) out.push(`Wywiad: ${hist.join(', ')}.`);
      const ex = examPhrases(dx).map((x) => x.replace(/^głębokość kieszonek nie przekraczała (.*)$/, 'kieszonki do $1')); if (ex.length) out.push(`Badanie: ${ex.join(', ')}.`);
      const rad = radioPhrase(dx); if (rad) out.push(`RTG: ${low(rad)}.`);
      const d = dxPhrase(dx); if (d) out.push(`Rozpoznanie: ${d}.`);
      const done = [...endoSentences(rec, P), ...(rec.work || []).map(workSentence).filter(Boolean)];
      if (done.length) out.push(`Leczenie: ${done.join(' ')}`);
      if (rec.manual?.trim()) out.push(`Opis: ${cap(rec.manual.trim().replace(/([^.])$/, '$1.'))}`);
      const used = (mats.get(rec.fdi) || []).filter((m) => !done.join(' ').includes(m));
      if (v.performer !== 'other' && used.length) out.push(`Materiały i sprzęt: ${mats.get(rec.fdi).join(', ')}.`);
      const rc = [];
      if (r.restor && r.restor !== 'none' && RESTOR_REC[r.restor]) rc.push(`${RESTOR_REC[r.restor]}${r.restor !== 'after' && RTIME[r.time] ? ' ' + RTIME[r.time] : ''}`);
      if (r.control) rc.push(`kontrola kliniczna i RTG ${CONTROL[r.control]}`);
      if (r.note?.trim()) rc.push(low(r.note.trim().replace(/\.$/, '')));
      if (rc.length) out.push(`Zalecenia: ${rc.join('; ')}.`);
      if (r.prog && v.performer !== 'other') out.push(`Rokowanie: ${PROG[r.prog]}.`);
    }
  }
  if (sorted.some((v) => v.notes?.trim())) out.push('', `Uwagi: ${sorted.map((v) => v.notes?.trim()).filter(Boolean).join(' ')}`);
  if (doctor) out.push('', doctor);
  return out.join('\n');
}

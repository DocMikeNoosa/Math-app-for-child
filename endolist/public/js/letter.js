// EndoList — treść listu: fakty z wizyt, skróty do schematu, generator offline (PL) z wariantami uprzejmości.
import {
  toothInfo, canalLabel, PULP_DX, PERI_DX, ENDO, ENDO_STATUS, IRRIG, MEDIC, FINDINGS, RADIO,
  WORK, POST_TYPE, IMPL_PREP, RTIME, CONTROL, PROG, LATERAL,
} from './data.js';
import { finalDx } from './dx.js';

/* ------------------------------------------------------------ polszczyzna */
export const PT = {
  f: { nom: 'Pacjentka', gen: 'Pacjentki', acc: 'Pacjentkę', ins: 'Pacjentką', welcome: 'mile widziana' },
  m: { nom: 'Pacjent', gen: 'Pacjenta', acc: 'Pacjenta', ins: 'Pacjentem', welcome: 'mile widziany' },
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
  if (x.probe !== '' && x.probe != null) out.push(x.probeIso ? `izolowana wąska kieszeń ${plNum(x.probe)} mm` : `głębokość kieszonek do ${plNum(x.probe)} mm`);
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
      return `Wykonano wypełnienie ubytku${w.cls ? ` klasy ${w.cls} wg Blacka` : ''}${surf ? ` (${surf})` : ''}${w.mat ? ` ${MAT_INS[w.mat] || `materiałem: ${w.mat}`}` : ''}.${note}`;
    }
    case 'BUILDUP': return `Wykonano odbudowę zęba po leczeniu kanałowym${w.mat ? ` ${MAT_INS[w.mat] || w.mat}` : ''}${w.postType ? ` z wkładem ${POST_TYPE[w.postType]}` : ''}.${note}`;
    case 'POST': return `Osadzono wkład koronowo-korzeniowy${w.postType ? ` ${POST_TYPE[w.postType]}` : ''}.${note}`;
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

/* ------------------------------------------------------------ fakty (z wybranych wizyt) */
/** Groups the selected visits by tooth. Each entry: { visit, rec } in date order. */
export function collect(visits) {
  const sorted = [...visits].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const byTooth = new Map();
  for (const v of sorted) for (const rec of v.teeth || []) {
    if (!byTooth.has(rec.fdi)) byTooth.set(rec.fdi, []);
    byTooth.get(rec.fdi).push({ visit: v, rec });
  }
  return { sorted, teeth: [...byTooth.entries()].sort((a, b) => a[0] - b[0]) };
}

export function markFor(entries) {
  let best = '';
  const rank = { endo: 4, stage: 3, work: 2, plan: 1, '': 0 };
  for (const { rec } of entries) {
    const e = rec.endo || {}, pr = ENDO[e.proc];
    let m = '';
    if (pr && !pr.consult) m = e.status === 'done' ? 'endo' : e.status === 'stage' ? 'stage' : 'plan';
    else if ((rec.work || []).length) m = 'work';
    else if (pr && pr.consult) m = 'plan';
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
    return { fdi, mark: markFor(entries), text: [...new Set(parts)].join(' · ') };
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
    const multi = entries.length > 1 || entries.some((x) => x.visit.performer === 'other');
    for (const { visit, rec } of entries) {
      const lines = [];
      const prefix = multi ? `${fmtDate(visit.date)}${visit.performer === 'other' ? ` — leczenie wykonane wcześniej${visit.otherDentist ? ` (${visit.otherDentist})` : ' w innym gabinecie'}` : ''}: ` : '';
      const dx = rec.dx || {};
      if (dx.history?.cc) lines.push(`Powód zgłoszenia: ${low(dx.history.cc.trim().replace(/\.$/, ''))}.`);
      const hx = [dx.history?.spontaneous && 'ból samoistny', dx.history?.night && 'ból nocny', dx.history?.deep && 'głęboka próchnica'].filter(Boolean);
      if (hx.length) lines.push(`W wywiadzie: ${hx.join(', ')}.`);
      const ex = examPhrases(dx);
      if (ex.length) lines.push(`W badaniu: ${ex.join(', ')}.`);
      const rp = radioPhrase(dx);
      if (rp) lines.push(`RTG: ${low(rp)}.`);
      const d = dxPhrase(dx, icd);
      if (d && (rec.endo?.proc || ex.length)) lines.push(`Rozpoznanie: ${d}.`);
      lines.push(...endoSentences(rec, P));
      for (const w of rec.work || []) { const s = workSentence(w); if (s) lines.push(s); }
      if (lines.length) paras.push(prefix + lines.join(' '));
      if (visit.performer !== 'other') recs.push(...recSentences(rec).map((s) => (teeth.length > 1 ? `Ząb ${fdi}: ${low(s)}` : s)));
      if (rec.rec?.prog && visit.performer !== 'other') recs.push(`${teeth.length > 1 ? `Ząb ${fdi} — rokowanie` : 'Rokowanie'}: ${PROG[rec.rec.prog]}.`);
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
        recommendations: visit.performer === 'other' ? [] : recSentences(rec),
        prognosis: visit.performer === 'other' ? null : (rec.rec?.prog ? PROG[rec.rec.prog] : null),
      })),
    })),
    visit_notes: visits.filter((v) => v.notes).map((v) => ({ date: v.date, note: v.notes })),
    draft,
  };
}

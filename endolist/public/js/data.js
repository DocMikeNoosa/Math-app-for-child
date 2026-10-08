// EndoList — dane kliniczne: anatomia zębów (FDI), rozpoznania, procedury, terminologia PL.

/* ------------------------------------------------------------------ zęby */
export const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const POS_NAME = ['', 'siekacz przyśrodkowy', 'siekacz boczny', 'kieł', 'pierwszy przedtrzonowiec', 'drugi przedtrzonowiec', 'pierwszy trzonowiec', 'drugi trzonowiec', 'trzeci trzonowiec'];

export function toothInfo(fdi) {
  const q = Math.floor(fdi / 10), pos = fdi % 10;
  const upper = q === 1 || q === 2;
  const right = q === 1 || q === 4;
  const type = pos <= 2 ? 'incisor' : pos === 3 ? 'canine' : pos <= 5 ? 'premolar' : 'molar';
  return {
    fdi, q, pos, upper, right, type,
    name: `${POS_NAME[pos]} ${upper ? 'górny' : 'dolny'} ${right ? 'prawy' : 'lewy'}`,
  };
}

/* --------------------------------------------- anatomia korzeni i kanałów
   Konfiguracje „najczęstsze" i warianty opisane jakościowo (bez podawania odsetków). */
const R = (name, label, canals) => ({ name, label, canals: canals.map((c) => ({ name: c })) });

export function anatomy(fdi) {
  const t = toothInfo(fdi), p = t.pos;
  if (t.upper) {
    if (p === 1) return { hint: '1 korzeń, 1 kanał — niemal zawsze.', configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }], extra: [] };
    if (p === 2) return { hint: '1 korzeń, 1 kanał. Częste zakrzywienie wierzchołkowej części korzenia.', configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }], extra: [] };
    if (p === 3) return { hint: '1 korzeń, 1 kanał — najdłuższy korzeń w uzębieniu.', configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }], extra: [] };
    if (p === 4) return {
      hint: 'Najczęściej 2 korzenie (policzkowy i podniebienny) z 2 kanałami. Możliwy 1 korzeń z 2 kanałami; rzadko 3 korzenie.',
      configs: [
        { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('P', 'podniebienny', ['P'])] },
        { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'P'])] },
        { label: '3 korzenie · 3 kanały', roots: [R('MB', 'policzkowy bliższy', ['MB']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] },
      ], extra: ['B', 'P', 'MB', 'DB'] };
    if (p === 5) return {
      hint: 'Najczęściej 1 korzeń; 1 kanał lub 2 kanały (B, P) — obie konfiguracje są częste.',
      configs: [
        { label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] },
        { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'P'])] },
        { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('P', 'podniebienny', ['P'])] },
      ], extra: ['B', 'P'] };
    if (p === 6) return {
      hint: '3 korzenie (MB, DB, P). Drugi kanał policzkowy bliższy (MB2) obecny w większości przypadków — warto go poszukać.',
      configs: [
        { label: '3 korzenie · 4 kanały (z MB2)', roots: [R('MB', 'policzkowy bliższy', ['MB', 'MB2']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '3 korzenie · 3 kanały', roots: [R('MB', 'policzkowy bliższy', ['MB']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '3 korzenie · 5 kanałów (MB3)', roots: [R('MB', 'policzkowy bliższy', ['MB', 'MB2', 'MB3']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
      ], extra: ['MB2', 'MB3', 'DB2', 'P2'] };
    if (p === 7) return {
      hint: '3 korzenie (MB, DB, P), zwykle 3 kanały; MB2 możliwy. Częściej niż w zębie 6 korzenie zrośnięte.',
      configs: [
        { label: '3 korzenie · 3 kanały', roots: [R('MB', 'policzkowy bliższy', ['MB']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '3 korzenie · 4 kanały (z MB2)', roots: [R('MB', 'policzkowy bliższy', ['MB', 'MB2']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('P', 'podniebienny', ['P'])] },
      ], extra: ['MB2', 'DB2'] };
    return {
      hint: 'Anatomia bardzo zmienna — często korzenie zrośnięte. Zwykle 3 kanały.',
      configs: [
        { label: '3 korzenie · 3 kanały', roots: [R('MB', 'policzkowy bliższy', ['MB']), R('DB', 'policzkowy dalszy', ['DB']), R('P', 'podniebienny', ['P'])] },
        { label: '1 korzeń (zrośnięty) · 1 kanał', roots: [R('K', 'korzeń zrośnięty', ['K'])] },
        { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('P', 'podniebienny', ['P'])] },
      ], extra: ['MB2', 'DB2'] };
  }
  // żuchwa
  if (p <= 2) return {
    hint: '1 korzeń; najczęściej 1 kanał, dość często 2 kanały (B i L) — warto sprawdzić drugi kanał językowy.',
    configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }, { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'L'])] }], extra: ['B', 'L'] };
  if (p === 3) return {
    hint: '1 korzeń, 1 kanał; rzadko 2 kanały lub 2 korzenie.',
    configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }, { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'L'])] }, { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('L', 'językowy', ['L'])] }], extra: ['B', 'L'] };
  if (p === 4) return {
    hint: 'Najczęściej 1 korzeń, 1 kanał; niekiedy podział kanału na B i L w części wierzchołkowej.',
    configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }, { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'L'])] }, { label: '2 korzenie · 2 kanały', roots: [R('B', 'policzkowy', ['B']), R('L', 'językowy', ['L'])] }], extra: ['B', 'L'] };
  if (p === 5) return {
    hint: '1 korzeń, 1 kanał; rzadko 2 kanały.',
    configs: [{ label: '1 korzeń · 1 kanał', roots: [R('K', 'korzeń', ['K'])] }, { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń', ['B', 'L'])] }], extra: ['B', 'L'] };
  if (p === 6) return {
    hint: '2 korzenie (bliższy M, dalszy D). Najczęściej 3 kanały (MB, ML, D); często 4 (DB, DL). Możliwy kanał środkowy bliższy (MM) i dodatkowy korzeń dalszo-językowy (radix entomolaris).',
    configs: [
      { label: '2 korzenie · 3 kanały', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['D'])] },
      { label: '2 korzenie · 4 kanały', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['DB', 'DL'])] },
      { label: '2 korzenie · 4 kanały (z MM)', roots: [R('M', 'bliższy', ['MB', 'MM', 'ML']), R('D', 'dalszy', ['D'])] },
      { label: '3 korzenie (radix entomolaris)', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['DB']), R('RE', 'dalszo-językowy (radix)', ['DL'])] },
    ], extra: ['MM', 'DB', 'DL'] };
  if (p === 7) return {
    hint: '2 korzenie (M, D), zwykle 3 kanały. Możliwa konfiguracja C-kształtna (korzenie zrośnięte).',
    configs: [
      { label: '2 korzenie · 3 kanały', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['D'])] },
      { label: '2 korzenie · 4 kanały', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['DB', 'DL'])] },
      { label: 'C-kształtny', roots: [R('C', 'C-kształtny', ['C'])] },
      { label: '1 korzeń · 2 kanały', roots: [R('K', 'korzeń zrośnięty', ['M', 'D'])] },
    ], extra: ['DB', 'DL', 'MM'] };
  return {
    hint: 'Anatomia bardzo zmienna; zwykle 2 korzenie, często zrośnięte.',
    configs: [
      { label: '2 korzenie · 3 kanały', roots: [R('M', 'bliższy', ['MB', 'ML']), R('D', 'dalszy', ['D'])] },
      { label: '2 korzenie · 2 kanały', roots: [R('M', 'bliższy', ['M']), R('D', 'dalszy', ['D'])] },
      { label: '1 korzeń (zrośnięty) · 1 kanał', roots: [R('K', 'korzeń zrośnięty', ['K'])] },
    ], extra: ['DB', 'DL'] };
}

/** Root layout for a chosen number of roots — keeps the canals already entered where names match. */
export function rootsForCount(fdi, n, current = []) {
  const a = anatomy(fdi);
  let cfg = a.configs.find((c) => c.roots.length === n);
  if (!cfg) cfg = { roots: Array.from({ length: n }, (_, i) => R(`K${i + 1}`, `korzeń ${i + 1}`, [`K${i + 1}`])) };
  const old = new Map(current.flatMap((r) => r.canals).map((c) => [c.name, c]));
  return cfg.roots.map((r) => ({ ...r, lateral: '', canals: r.canals.map((c) => ({ name: c.name, wl: '', ref: '', maf: '', ...(old.get(c.name) || {}) })) }));
}

export function configRoots(cfg, current = []) {
  const old = new Map(current.flatMap((r) => r.canals).map((c) => [c.name, c]));
  return cfg.roots.map((r) => ({ name: r.name, label: r.label, lateral: '', canals: r.canals.map((c) => ({ name: c.name, wl: '', ref: '', maf: '', ...(old.get(c.name) || {}) })) }));
}

export const canalLabel = (name) => (name === 'K' ? 'kanał' : name);
export const LATERAL = { '': 'brak', koronowa: 'w 1/3 przyszyjkowej', srodkowa: 'w 1/3 środkowej', wierzcholkowa: 'w 1/3 przywierzchołkowej', delta: 'delta korzeniowa' };

/* ------------------------------------------------------------- rozpoznania (AAE, terminologia PL) */
export const PULP_DX = {
  NP: { label: 'Miazga prawidłowa', icd: '' },
  RP: { label: 'Odwracalne zapalenie miazgi', icd: 'K04.0' },
  SIP: { label: 'Objawowe nieodwracalne zapalenie miazgi', icd: 'K04.0' },
  AIP: { label: 'Bezobjawowe nieodwracalne zapalenie miazgi', icd: 'K04.0' },
  PN: { label: 'Martwica miazgi', icd: 'K04.1' },
  PT: { label: 'Ząb leczony wcześniej endodontycznie', icd: '' },
  PIT: { label: 'Ząb z rozpoczętym wcześniej leczeniem endodontycznym', icd: '' },
};
export const PERI_DX = {
  NAT: { label: 'Prawidłowe tkanki okołowierzchołkowe', icd: '' },
  SAP: { label: 'Objawowe zapalenie tkanek okołowierzchołkowych', icd: 'K04.4' },
  AAP: { label: 'Bezobjawowe zapalenie tkanek okołowierzchołkowych', icd: 'K04.5' },
  AAA: { label: 'Ostry ropień okołowierzchołkowy', icd: 'K04.7' },
  CAA: { label: 'Przewlekły ropień okołowierzchołkowy z przetoką', icd: 'K04.6' },
  CO: { label: 'Zagęszczające zapalenie kości (osteitis condensans)', icd: '' },
};

export const T_COLD = { nt: 'nie badano', wnl: 'prawidłowa', exag: 'nasilona, krótkotrwała', ling: 'ból przedłużony', nr: 'brak reakcji' };
export const T_HEAT = { nt: 'nie badano', wnl: 'prawidłowa', ling: 'ból przedłużony', nr: 'brak reakcji' };
export const T_EPT = { nt: 'nie badano', pos: 'dodatni', neg: 'ujemny' };
export const T_PERC = { nt: 'nie badano', wnl: 'niebolesne', pain: 'bolesne' };
export const T_PALP = { nt: 'nie badano', wnl: 'niebolesna', pain: 'bolesna' };
export const T_BITE = { nt: 'nie badano', wnl: 'bez bólu', pain: 'ból przy nagryzaniu', release: 'ból przy zwolnieniu' };
export const T_MOB = { '': 'nie badano', phys: 'fizjologiczna', I: 'I°', II: 'II°', III: 'III°' };
export const T_SWELL = { none: 'brak', intra: 'wewnątrzustny', extra: 'zewnątrzustny' };
export const T_SINUS = { no: 'brak', yes: 'obecna' };

export const RADIO = {
  pdl: 'Poszerzenie szpary ozębnej', parl: 'Zmiana okołowierzchołkowa (przejaśnienie)', opac: 'Zagęszczenie struktury kostnej okołowierzchołkowo',
  caries: 'Głęboki ubytek próchnicowy', rest: 'Rozległe wypełnienie', rcf: 'Wcześniejsze wypełnienie kanałowe', underfill: 'Niedopełnienie kanałów',
  post: 'Wkład koronowo-korzeniowy', oblit: 'Obliteracja kanału', intres: 'Resorpcja wewnętrzna', extres: 'Resorpcja zewnętrzna',
  open: 'Otwarty wierzchołek', furc: 'Zanik kości w okolicy furkacji', frac: 'Podejrzenie złamania / pęknięcia korzenia',
};

/* ------------------------------------------------------------- endodoncja */
export const ENDO = {
  RCT: { label: 'Leczenie kanałowe', short: 'Endo', canals: true, obt: true, acc: 'leczenie kanałowe', staged: true },
  RETX: { label: 'Ponowne leczenie kanałowe (reendo)', short: 'Re-endo', canals: true, obt: true, acc: 'ponowne leczenie kanałowe', staged: true },
  PULPEXT: { label: 'Ekstyrpacja miazgi (pulpektomia doraźna)', short: 'Ekstyrpacja', canals: true, acc: 'ekstyrpację miazgi (pulpektomię doraźną)' },
  PULPOT: { label: 'Pulpotomia', short: 'Pulpotomia', material: true, acc: 'pulpotomię' },
  DPC: { label: 'Bezpośrednie pokrycie miazgi', short: 'Pokrycie bezp.', material: true, acc: 'bezpośrednie pokrycie miazgi' },
  IPC: { label: 'Pośrednie pokrycie miazgi', short: 'Pokrycie pośr.', material: true, acc: 'pośrednie pokrycie miazgi' },
  APEX: { label: 'Apeksyfikacja', short: 'Apeksyfikacja', canals: true, material: true, acc: 'apeksyfikację', staged: true },
  REP: { label: 'Leczenie regeneracyjne (REP)', short: 'REP', canals: true, material: true, acc: 'leczenie regeneracyjne (REP)', staged: true },
  APICO: { label: 'Resekcja wierzchołka korzenia (mikrochirurgia endodontyczna)', short: 'Resekcja', material: true, surgical: true, acc: 'resekcję wierzchołka korzenia' },
  PERF: { label: 'Zamknięcie perforacji', short: 'Perforacja', material: true, acc: 'zamknięcie perforacji' },
  IND: { label: 'Nacięcie i drenaż ropnia', short: 'Nacięcie', surgical: true, acc: 'nacięcie i drenaż ropnia' },
  CONSULT: { label: 'Konsultacja / diagnostyka endodontyczna', short: 'Konsultacja', consult: true, acc: 'konsultację' },
};
export const ENDO_STATUS = { done: 'zakończone', stage: 'etap I — opatrunek leczniczy', planned: 'zaplanowane' };
export const ANESTH = { '': '—', infil: 'nasiękowe', block: 'przewodowe', pdl: 'śródwięzadłowe', intrapulp: 'dokomorowe', none: 'bez znieczulenia' };
export const IRRIG = { naocl: 'NaOCl', edta: 'EDTA 17%', chx: 'CHX 2%', saline: 'sól fizjologiczna', us: 'aktywacja ultradźwiękowa', sonic: 'aktywacja soniczna', xp: 'XP-endo Finisher', laser: 'aktywacja laserowa' };
export const OBTUR = { '': '—', cwt: 'fala ciągła (CWT)', wvc: 'kondensacja pionowa ciepłej gutaperki', lat: 'kondensacja boczna na zimno', sc: 'technika pojedynczego ćwieka', carrier: 'gutaperka na nośniku', thermo: 'termoplastyczna z wstrzykiwaniem' };
export const SEALER = ['uszczelniacz bioceramiczny', 'AH Plus', 'uszczelniacz na bazie żywicy epoksydowej', 'uszczelniacz z wodorotlenkiem wapnia', 'uszczelniacz cynkowo-tlenkowo-eugenolowy'];
export const MEDIC = { '': 'brak', caoh: 'wodorotlenek wapnia', ledermix: 'Ledermix', tap: 'pasta antybiotykowa (TAP)' };
export const TEMP = { '': '—', cavit: 'Cavit', gic: 'cement glasjonomerowy', cavitgic: 'Cavit + cement glasjonomerowy', comp: 'odbudowa kompozytowa', teflon: 'taśma PTFE + Cavit' };
export const MATERIAL_ENDO = ['MTA', 'Biodentine', 'bioceramiczna pasta naprawcza', 'wodorotlenek wapnia', 'TheraCal'];
export const FINDINGS = {
  mb2: 'odnaleziono i opracowano kanał MB2', extra: 'odnaleziono dodatkowy kanał', oblit: 'kanały częściowo zobliterowane',
  curve: 'silnie zakrzywione kanały', crack: 'stwierdzono linię pęknięcia', vrf: 'podejrzenie pionowego złamania korzenia',
  sepret: 'usunięto złamane narzędzie', sepbp: 'ominięto złamane narzędzie', sepleft: 'złamane narzędzie pozostawiono w kanale',
  perf: 'zamknięto perforację', resorp: 'stwierdzono resorpcję', postrem: 'usunięto wkład koronowo-korzeniowy',
  oldrem: 'usunięto stare wypełnienie kanałowe', ledge: 'stopień / niedrożność w kanale', pus: 'wysięk ropny z kanału',
  bleed: 'krwawienie z kanału', open: 'otwarty wierzchołek', notneg: 'nie udało się udrożnić kanału na pełną długość',
};

/* ------------------------------------------------------------- inne prace */
export const BLACK = {
  I: 'Klasa I — bruzdy i dołki (powierzchnie żujące, otwory ślepe)',
  II: 'Klasa II — powierzchnie styczne zębów przedtrzonowych i trzonowych',
  III: 'Klasa III — powierzchnie styczne siekaczy i kłów bez brzegu siecznego',
  IV: 'Klasa IV — powierzchnie styczne siekaczy i kłów z brzegiem siecznym',
  V: 'Klasa V — okolica przyszyjkowa (1/3 przydziąsłowa)',
  VI: 'Klasa VI — brzegi sieczne i szczyty guzków',
};
export const SURFACES = { O: 'żująca', M: 'mezjalna', D: 'dystalna', B: 'policzkowa / wargowa', L: 'językowa / podniebienna', I: 'brzeg sieczny' };
export const FILL_MAT = ['kompozyt', 'kompozyt typu bulk-fill', 'kompomer', 'cement glasjonomerowy', 'amalgamat', 'materiał bioaktywny'];
export const WORK = {
  FILL: { label: 'Wypełnienie ubytku (leczenie próchnicy)', short: 'Wyp.' },
  BUILDUP: { label: 'Odbudowa zęba po leczeniu kanałowym', short: 'Odbudowa' },
  POST: { label: 'Wkład koronowo-korzeniowy', short: 'Wkład' },
  CROWNPREP: { label: 'Opracowanie zęba pod koronę protetyczną', short: 'Prep. pod koronę' },
  TEMPCROWN: { label: 'Korona tymczasowa', short: 'Korona tymcz.' },
  CROWN: { label: 'Osadzenie korony protetycznej', short: 'Korona' },
  ONLAY: { label: 'Wkład/nakład (inlay / onlay / overlay)', short: 'Onlay' },
  EXT: { label: 'Ekstrakcja zęba', short: 'Ekstrakcja' },
  IMPLPREP: { label: 'Przygotowanie do implantacji', short: 'Przyg. do implantu' },
  IMPLANT: { label: 'Wszczepienie implantu', short: 'Implant' },
  PERIO: { label: 'Leczenie periodontologiczne / skaling', short: 'Perio' },
  OTHER: { label: 'Inna procedura', short: 'Inne' },
};
export const POST_TYPE = { fiber: 'z włókna szklanego', cast: 'lany (metalowy)', zirc: 'cyrkonowy' };
export const IMPL_PREP = { socket: 'ekstrakcja z zachowaniem zębodołu (socket preservation)', graft: 'augmentacja kości', sinus: 'podniesienie dna zatoki szczękowej (sinus lift)', cbct: 'ocena CBCT i planowanie', ridge: 'poszerzenie wyrostka zębodołowego' };

/* ------------------------------------------------------------- zalecenia */
export const RESTOR = { '': '—', crown: 'korona protetyczna', onlay: 'nakład (onlay) z pokryciem guzków', postcrown: 'wkład koronowo-korzeniowy i korona', direct: 'odbudowa bezpośrednia (kompozytowa)', access: 'ostateczne zamknięcie dostępu w istniejącej koronie', after: 'po zakończeniu leczenia kanałowego', none: 'nie wymaga' };
export const RTIME = { '': '', '2w': 'w ciągu 2 tygodni', '30d': 'w ciągu 30 dni', '60d': 'w ciągu 2 miesięcy', asap: 'możliwie szybko' };
export const CONTROL = { '': 'bez kontroli', '3m': 'za 3 miesiące', '6m': 'za 6 miesięcy', '12m': 'za 12 miesięcy', '6-12m': 'za 6 i 12 miesięcy', '1-4y': 'za 1 rok, następnie do 4 lat' };
export const PROG = { '': '—', good: 'dobre', fair: 'niepewne', poor: 'złe' };

/* ------------------------------------------------------------- adresaci */
export const DOC_TITLES = ['lek. dent.', 'dr n. med.', 'dr n. med. i n. o zdr.', 'dr hab. n. med.', 'prof. dr hab. n. med.', 'lek.', 'lek. stom.'];

/* ------------------------------------------------------------- materiały i sprzęt (podpowiedzi; lekarz może dopisać własne) */
export const PRODUCT_CATS = {
  files: 'Narzędzia (system)', glide: 'Ścieżka szybowania', apex: 'Endometr', motor: 'Endomotor', activation: 'Aktywacja płukania',
  sealer: 'Uszczelniacz', obtsys: 'System obturacji', repair: 'Materiał bioceramiczny / MTA', medic: 'Opatrunek leczniczy', temp: 'Opatrunek tymczasowy',
  composite: 'Kompozyt', adhesive: 'System łączący', post: 'Wkład / materiał na rdzeń', cement: 'Cement', anesth: 'Środek znieczulający',
  isolation: 'Izolacja', micro: 'Mikroskop', imaging: 'Diagnostyka obrazowa', other: 'Inne',
};
export const PRODUCTS = {
  files: ['ProTaper Gold', 'ProTaper Next', 'ProTaper Ultimate', 'WaveOne Gold', 'Reciproc Blue', 'HyFlex EDM', 'HyFlex CM', 'TruNatomy', 'Mtwo', 'K3XF', 'EdgeFile', 'XP-endo Shaper', 'Vortex Blue', 'One Curve', '2Shape', 'F360', 'pilniki ręczne K-file', 'pilniki ręczne H-file'],
  glide: ['ProGlider', 'WaveOne Gold Glider', 'R-Pilot', 'PathFile', 'HyFlex EDM Glide Path', 'C+ File', 'K-file #10/#15'],
  apex: ['Raypex 6', 'Propex Pixi', 'Propex IQ', 'Root ZX mini', 'Root ZX II', 'Woodpex III', 'Apex ID'],
  motor: ['X-Smart Pro+', 'X-Smart IQ', 'VDW.Connect Drive', 'VDW.Gold Reciproc', 'Tri Auto ZX2', 'Endo Radar Pro'],
  activation: ['EndoActivator', 'EDDY', 'Ultra X', 'XP-endo Finisher', 'IRRI S (końcówka ultradźwiękowa)', 'PIPS (laser Er:YAG)'],
  sealer: ['AH Plus', 'AH Plus Bioceramic Sealer', 'BioRoot RCS', 'TotalFill BC Sealer', 'CeraSeal', 'Well-Root ST', 'GuttaFlow 2', 'GuttaFlow bioseal', 'Apexit Plus', 'Sealapex', 'Endomethasone N'],
  obtsys: ['Calamus Dual', 'BeeFill 2in1', 'Elements Free', 'E&Q Master', 'Fast-Pack / Fast-Fill', 'Gutta Smart', 'SuperEndo α2 / β2', 'System B', 'Thermafil', 'GuttaCore'],
  repair: ['ProRoot MTA', 'MTA Angelus', 'Biodentine', 'TotalFill BC RRM Putty', 'NeoMTA 2', 'MTA Repair HP', 'Bio-C Repair', 'Well-Root PT', 'TheraCal LC', 'TheraCal PT'],
  medic: ['Calcicur', 'UltraCal XS', 'Calxyl', 'Metapex', 'Ledermix', 'Apexcal'],
  temp: ['Cavit G', 'Cavit W', 'Coltosol F', 'Ketac Molar', 'Fuji IX GP', 'Fermit N', 'Clip F', 'IRM'],
  composite: ['Filtek Universal Restorative', 'Filtek Z550', 'Filtek One Bulk Fill', 'Filtek Supreme XTE', 'Estelite Asteria', 'Estelite Sigma Quick', 'G-ænial A’CHORD', 'Tetric EvoCeram', 'Tetric PowerFill', 'Tetric Prime', 'Essentia', 'Charisma Diamond', 'Harmonize', 'Venus Diamond', 'Omnichroma', 'SDR flow+', 'everX Posterior', 'everX Flow', 'Beautifil II'],
  adhesive: ['Clearfil SE Bond 2', 'Clearfil Universal Bond Quick', 'Scotchbond Universal Plus', 'OptiBond FL', 'OptiBond Universal', 'G-Premio Bond', 'Adhese Universal', 'Prime&Bond active', 'iBond Universal'],
  post: ['RelyX Fiber Post', 'DT Light-Post', 'Rebilda Post', 'GC Fiber Post', 'FRC Postec Plus', 'Rebilda DC', 'LuxaCore Z', 'Clearfil DC Core Plus', 'MultiCore Flow'],
  cement: ['RelyX Universal', 'RelyX Unicem 2', 'Variolink Esthetic', 'Panavia V5', 'Panavia SA Cement Universal', 'SpeedCEM Plus', 'Fuji PLUS', 'Ketac Cem'],
  anesth: ['Ubistesin (artykaina 4% z adrenaliną)', 'Ubistesin forte (artykaina 4% z adrenaliną)', 'Septanest (artykaina 4% z adrenaliną)', 'Citocartin (artykaina 4% z adrenaliną)', 'Mepivastesin (mepiwakaina 3%)', 'Scandonest 3% (mepiwakaina)'],
  isolation: ['koferdam', 'OptraDam Plus', 'koferdam bezlateksowy', 'uszczelniacz koferdamu (OpalDam)'],
  micro: ['Zeiss Extaro 300', 'Zeiss OPMI pico', 'Leica M320', 'Global G6', 'lupy powiększające'],
  imaging: ['RTG wewnątrzustne (RVG)', 'CBCT', 'zdjęcie pantomograficzne'],
  other: [],
};

/* Szybkie, najczęstsze czynności endodontyczne (zaznaczenia) → pola rekordu */
export const QUICK = [
  ['dam', 'Koferdam'], ['micro', 'Mikroskop'], ['apexloc', 'Endometr'], ['wlxray', 'RTG pomiarowe'],
  ['irrig:naocl', 'NaOCl'], ['irrig:edta', 'EDTA 17%'], ['irrig:us', 'Aktywacja ultradźwiękowa'], ['irrig:chx', 'CHX 2%'],
  ['medic:caoh', 'Ca(OH)₂'], ['obtur:cwt', 'Obturacja CWT'], ['obtur:wvc', 'Kondensacja pionowa'], ['sealer:uszczelniacz bioceramiczny', 'Uszczelniacz bioceramiczny'],
  ['temp:cavit', 'Cavit'], ['temp:comp', 'Odbudowa kompozytowa'], ['postxray', 'RTG kontrolne'],
];

/* ------------------------------------------------------------- PESEL */
export function parsePesel(p) {
  p = String(p || '').replace(/\D/g, '');
  if (p.length !== 11) return null;
  const d = p.split('').map(Number), w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = w.reduce((a, x, i) => a + x * d[i], 0);
  if ((10 - (sum % 10)) % 10 !== d[10]) return null;
  let y = d[0] * 10 + d[1], m = d[2] * 10 + d[3]; const day = d[4] * 10 + d[5];
  let c = 1900;
  if (m > 80) { c = 1800; m -= 80; } else if (m > 60) { c = 2200; m -= 60; } else if (m > 40) { c = 2100; m -= 40; } else if (m > 20) { c = 2000; m -= 20; }
  y += c;
  const dt = new Date(Date.UTC(y, m - 1, day));
  if (dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== day) return null;
  return { dob: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`, sex: d[9] % 2 ? 'm' : 'f' };
}

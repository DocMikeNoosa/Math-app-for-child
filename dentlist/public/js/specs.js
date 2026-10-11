// DentList — specjalności stomatologiczne: kolory, procedury (z polami formularza), materiały i sprzęt (rynek PL).
// Procedura ma zakres: 't' = ząb, 'm' = cała jama ustna (wizyta), 'b' = oba (np. kwadrant / okolica).
// Zdania do listu (1. osoba) i do dokumentacji (forma bezosobowa) powstają z tych samych pól.

/* ------------------------------------------------------------------ specjalności */
// Kolory: każda specjalność ma własny, wyraźny kolor (color → color2) i własne ciemne tło (bg: [tło, góra gradientu, panele]),
// tak jak endodoncja ma granat z akwamaryną z oryginalnej aplikacji EndoList.
export const SPECS = {
  zach: { label: 'Stomatologia zachowawcza', short: 'Zachowawcza', color: '#8fa2ff', color2: '#5f6ff0', bg: ['#040416', '#0c0b35', '#121136'], icon: 'tooth' },
  endo: { label: 'Endodoncja', short: 'Endodoncja', color: '#5fd8c8', color2: '#3b8fd9', icon: 'tooth' },
  chir: { label: 'Chirurgia stomatologiczna', short: 'Chirurgia', color: '#6be39a', color2: '#34b36e', bg: ['#04160b', '#0b351c', '#113621'], icon: 'tooth' },
  impl: { label: 'Implantologia', short: 'Implantologia', color: '#ecc970', color2: '#c99a3c', bg: ['#041016', '#0b2835', '#112b36'], icon: 'tooth' },
  perio: { label: 'Periodontologia', short: 'Periodontologia', color: '#f592c9', color2: '#d4589f', bg: ['#16040f', '#350b25', '#361129'], icon: 'tooth' },
  prot: { label: 'Protetyka stomatologiczna', short: 'Protetyka', color: '#bba3ff', color2: '#8a6af0', bg: ['#0b0416', '#1c0b35', '#211136'], icon: 'tooth' },
  orto: { label: 'Ortodoncja', short: 'Ortodoncja', color: '#c2e36a', color2: '#8fbf3a', bg: ['#0a1604', '#19350b', '#1e3611'], icon: 'tooth' },
  ped: { label: 'Stomatologia dziecięca', short: 'Dziecięca', color: '#ffab70', color2: '#ff7f6b', bg: ['#130416', '#2e0b35', '#301136'], icon: 'tooth' },
  mfs: { label: 'Chirurgia szczękowo-twarzowa', short: 'Szczękowo-twarzowa', color: '#ff6f78', color2: '#d93848', bg: ['#160406', '#350b10', '#361116'], icon: 'tooth' },
  hig: { label: 'Higienizacja i profilaktyka', short: 'Higienizacja', color: '#cdf3ee', color2: '#7fd4cb', bg: ['#041615', '#0b3534', '#113635'], icon: 'tooth' },
};
export const SPEC_ORDER = ['zach', 'endo', 'chir', 'impl', 'perio', 'prot', 'orto', 'ped', 'mfs', 'hig'];
/** Specialist title for the letter header, by home specialty. */
export const SPEC_TITLE = {
  zach: 'lekarz dentysta', endo: 'specjalista endodoncji', chir: 'specjalista chirurgii stomatologicznej', impl: 'implantolog',
  perio: 'specjalista periodontologii', prot: 'specjalista protetyki stomatologicznej', orto: 'specjalista ortodoncji',
  ped: 'specjalista stomatologii dziecięcej', mfs: 'specjalista chirurgii szczękowo-twarzowej', hig: 'higienistka stomatologiczna',
};

/* ------------------------------------------------------------------ pola formularza */
// opts: { key: 'etykieta' } albo { key: ['etykieta w formularzu', 'fraza w zdaniu'] }
const S = (k, label, opts, say) => ({ k, type: 'sel', label, opts, say });
const M = (k, label, opts, say) => ({ k, type: 'multi', label, opts, say });
const T = (k, label, say, ph = '', list = '') => ({ k, type: 'text', label, say, ph, list });
const N = (k, label, unit, say) => ({ k, type: 'num', label, unit, say });
const NOTE = { k: 'note', type: 'area', label: 'Uwagi', ph: 'opcjonalnie' };
const V = (stem, imp) => ({ f: stem + 'am', m: stem + 'em', imp });
const VI = (f, m, imp) => ({ f, m, imp });
const DO = V('wykonał', 'Wykonano'), RUN = V('przeprowadził', 'Przeprowadzono'), SEAT = V('osadził', 'Osadzono'), PUT = V('założył', 'Założono');
const REMOVE = VI('usunęłam', 'usunąłem', 'Usunięto');
const TAKE = V('pobrał', 'Pobrano'), TRY = V('przymierzył', 'Przymierzono'), GIVE = V('oddał', 'Oddano'), ADJ = V('skorygował', 'Skorygowano'), PREP = V('opracował', 'Opracowano');

const ANESTH_F = S('anesth', 'Znieczulenie', { '': '—', topical: ['powierzchniowe', 'powierzchniowym'], infil: ['nasiękowe', 'nasiękowym'], block: ['przewodowe', 'przewodowym'], pdl: ['śródwięzadłowe', 'śródwięzadłowym'], ga: ['ogólne', 'ogólnym'] }, 'w znieczuleniu {v}');
const AGENT_F = T('agent', 'Środek znieczulający', '{v}', 'np. Ubistesin forte, 1 karpula', 'anesth');
const SUTURE_F = T('suture', 'Szwy', 'szwy: {v}', 'np. Vicryl 4-0', 'suture');
const HEMO_F = T('hemostat', 'Opatrunek / hemostatyk', 'opatrunek: {v}', 'np. Spongostan', 'hemostat');
const BONE_F = T('bone', 'Materiał kościozastępczy', 'materiał: {v}', 'np. Bio-Oss', 'bone');
const MEMB_F = T('membrane', 'Membrana', 'membrana: {v}', 'np. Bio-Gide', 'membrane');
const ARCH_F = S('arch', 'Łuk', { '': '—', up: ['szczęka', 'szczęka'], lo: ['żuchwa', 'żuchwa'], both: ['szczęka i żuchwa', 'szczęka i żuchwa'] }, '{v}');
const AREA_F = T('area', 'Zakres / zęby', 'zakres: {v}', 'np. kwadrant 1 i 4, zęby 16–14');
const CEMENT_F = T('cement', 'Cement', 'cement: {v}', 'np. RelyX Universal', 'cement');
// an option may carry its own verb: [label, phrase, verb] — e.g. "Osadziłam koronę" instead of "Wykonałam osadzenie korony"
const PROT_STAGE = (what) => S('stage', 'Etap', { prep: ['opracowanie', `ząb pod ${what[0]}`, PREP], imp: ['wycisk / skan', `wycisk (skan) pod ${what[0]}`, TAKE], try: ['przymiarka', what[2], TRY], seat: ['osadzenie', what[2], SEAT] });

/* ------------------------------------------------------------------ procedury */
export const PROCS = {
  /* --- stomatologia zachowawcza */
  FILL: { spec: 'zach', scope: 't', label: 'Wypełnienie ubytku (leczenie próchnicy)', short: 'Wyp.', special: 'fill' },
  REFILL: { spec: 'zach', scope: 't', label: 'Wymiana / naprawa wypełnienia', short: 'Wymiana wyp.', v: DO, acc: '{kind}', fields: [S('kind', 'Zakres', { replace: ['wymiana', 'wymianę wypełnienia'], repair: ['naprawa', 'naprawę wypełnienia'] }), { k: 'surf', type: 'surf', label: 'Powierzchnie', say: 'powierzchnie: {v}' }, T('product', 'Materiał', '{v}', 'np. Filtek Universal', 'composite'), NOTE] },
  BONDING: { spec: 'zach', scope: 't', label: 'Odbudowa estetyczna (bonding)', short: 'Bonding', v: DO, acc: 'estetyczną odbudowę kompozytową', fields: [M('goal', 'Cel', { shape: 'korekta kształtu', diast: 'zamknięcie diastemy', edge: 'odbudowa brzegu siecznego', color: 'maskowanie przebarwienia' }, '{v}'), T('product', 'Materiał', '{v}', 'np. Estelite Asteria', 'composite'), NOTE] },
  VENEER_D: { spec: 'zach', scope: 't', label: 'Licówka kompozytowa (bezpośrednia)', short: 'Licówka komp.', v: DO, acc: 'licówkę kompozytową metodą bezpośrednią', fields: [T('product', 'Materiał', '{v}', '', 'composite'), NOTE] },
  BUILDUP: { spec: 'zach', scope: 't', label: 'Odbudowa zęba po leczeniu kanałowym', short: 'Odbudowa', v: V('odbudował', 'Odbudowano'), acc: 'ząb po leczeniu kanałowym', fields: [S('mat', 'Materiał', { '': '—', komp: ['kompozyt', 'materiałem kompozytowym'], bulk: ['kompozyt bulk-fill', 'kompozytem typu bulk-fill'], core: ['materiał na rdzeń', 'materiałem do odbudowy rdzenia'], gic: ['cement glasjonomerowy', 'cementem glasjonomerowym'] }, '{v}'), S('post', 'Wkład', { '': 'bez wkładu', fiber: ['z włókna szklanego', 'z wkładem z włókna szklanego'], cast: ['lany', 'z wkładem lanym'] }, '{v}'), T('product', 'Produkt', '{v}', 'np. Rebilda DC', 'post'), NOTE] },
  ICON: { spec: 'zach', scope: 't', label: 'Infiltracja próchnicy początkowej (ICON)', short: 'ICON', v: DO, acc: 'infiltrację próchnicy początkowej żywicą', fields: [T('product', 'Preparat', '{v}', 'ICON (DMG)'), NOTE] },
  BLEACH_INT: { spec: 'zach', scope: 't', label: 'Wybielanie wewnętrzne zęba', short: 'Wybiel. wewn.', v: RUN, acc: 'wybielanie wewnętrzne zęba', fields: [T('product', 'Preparat', '{v}', 'np. Opalescence Endo', 'bleach'), N('sessions', 'Wizyta nr', '', 'wizyta {v}'), NOTE] },
  DESENS: { spec: 'zach', scope: 'b', label: 'Leczenie nadwrażliwości zębiny', short: 'Nadwrażliwość', v: DO, acc: 'zabieg znoszenia nadwrażliwości zębiny', fields: [T('product', 'Preparat', '{v}', 'np. Gluma', 'desens'), NOTE] },
  TEMPFILL: { spec: 'zach', scope: 't', label: 'Opatrunek tymczasowy', short: 'Opatrunek', v: PUT, acc: 'opatrunek tymczasowy', fields: [T('product', 'Materiał', '{v}', 'np. Cavit', 'temp'), NOTE] },
  BLEACH: { spec: 'zach', scope: 'm', label: 'Wybielanie zębów', short: 'Wybielanie', v: RUN, acc: '{kind}', fields: [S('kind', 'Rodzaj', { office: ['gabinetowe', 'wybielanie gabinetowe'], home: ['nakładkowe (domowe)', 'wybielanie nakładkowe — wydano nakładki'], combo: ['łączone', 'wybielanie łączone (gabinetowe i nakładkowe)'] }), T('product', 'System', '{v}', 'np. Opalescence Boost', 'bleach'), T('shade', 'Kolor przed → po', 'kolor: {v}', 'np. A3 → A1'), NOTE] },

  /* --- chirurgia stomatologiczna */
  EXT: { spec: 'chir', scope: 't', label: 'Ekstrakcja zęba', short: 'Ekstrakcja', v: REMOVE, acc: 'ząb', fields: [S('kind', 'Rodzaj', { simple: ['prosta', 'ekstrakcja prosta'], surgical: ['chirurgiczna', 'ekstrakcja chirurgiczna'] }, '{v}'), M('steps', 'Przebieg', { flap: 'z odwarstwieniem płata śluzówkowo-okostnowego', osteo: 'z osteotomią', sep: 'z separacją korzeni', curet: 'wyłyżeczkowanie zębodołu', socket: 'zabezpieczenie zębodołu' }, '{v}'), ANESTH_F, AGENT_F, HEMO_F, SUTURE_F, NOTE] },
  IMPACT: { spec: 'chir', scope: 't', label: 'Usunięcie zęba zatrzymanego (dłutowanie)', short: 'Dłutowanie', v: REMOVE, acc: 'zatrzymany ząb', fields: [S('impaction', 'Zatrzymanie', { full: ['całkowite w kości', 'zatrzymany całkowicie w kości'], partial: ['częściowe', 'zatrzymany częściowo'], soft: ['pod błoną śluzową', 'zatrzymany pod błoną śluzową'] }, '{v}'), S('pos', 'Ułożenie', { vert: 'pionowe', mesio: 'mezjoangularne', disto: 'dystoangularne', horiz: 'poziome' }, 'ułożenie {v}'), M('steps', 'Przebieg', { flap: 'z odwarstwieniem płata', osteo: 'z osteotomią', sep: 'z separacją zęba', piezo: 'z użyciem piezochirurgii', prf: 'z wypełnieniem zębodołu PRF' }, '{v}'), ANESTH_F, AGENT_F, HEMO_F, SUTURE_F, NOTE] },
  HEMISECT: { spec: 'chir', scope: 't', label: 'Hemisekcja / radisekcja / amputacja korzenia', short: 'Hemisekcja', v: DO, acc: '{kind}', fields: [S('kind', 'Zabieg', { hemi: ['hemisekcja', 'hemisekcję zęba'], radi: ['radisekcja', 'radisekcję'], amp: ['amputacja korzenia', 'amputację korzenia'] }), T('root', 'Korzeń', 'korzeń: {v}', 'np. dalszy'), ANESTH_F, SUTURE_F, NOTE] },
  CYST: { spec: 'chir', scope: 'b', label: 'Wyłuszczenie / odbarczenie torbieli', short: 'Torbiel', v: DO, acc: '{kind}', fields: [S('kind', 'Zabieg', { ect: ['cystektomia', 'wyłuszczenie torbieli (cystektomię)'], ot: ['cystotomia', 'odbarczenie torbieli (cystotomię)'] }), T('site', 'Okolica', 'okolica: {v}'), M('extra', 'Dodatkowo', { histo: 'materiał przesłano do badania histopatologicznego', apico: 'z jednoczasową resekcją wierzchołka', bone: 'ubytek wypełniono materiałem kościozastępczym' }, '{v}'), BONE_F, SUTURE_F, NOTE] },
  APICO_S: { spec: 'chir', scope: 't', label: 'Resekcja wierzchołka korzenia', short: 'Resekcja', v: DO, acc: 'resekcję wierzchołka korzenia', fields: [M('steps', 'Przebieg', { retro: 'wsteczne opracowanie końcówkami ultradźwiękowymi', fill: 'wsteczne wypełnienie', micro: 'pod mikroskopem' }, '{v}'), T('material', 'Materiał wstecznego wypełnienia', 'materiał: {v}', 'np. Biodentine, MTA', 'repair'), ANESTH_F, SUTURE_F, NOTE] },
  BIOPSY: { spec: 'chir', scope: 'b', label: 'Biopsja (pobranie wycinka)', short: 'Biopsja', v: V('pobrał', 'Pobrano'), acc: 'wycinek do badania histopatologicznego', fields: [S('kind', 'Rodzaj', { exc: ['wycinająca', 'biopsja wycinająca'], inc: ['nacinająca', 'biopsja nacinająca'] }, '{v}'), T('site', 'Lokalizacja', 'z okolicy: {v}'), SUTURE_F, NOTE] },
  OAC: { spec: 'chir', scope: 't', label: 'Zamknięcie połączenia ustno-zatokowego', short: 'Zamkn. poł. u-z', v: VI('zamknęłam', 'zamknąłem', 'Zamknięto'), acc: 'połączenie ustno-zatokowe', fields: [S('method', 'Metoda', { rehr: ['płat Rehrmanna', 'płatem przedsionkowym (Rehrmanna)'], bichat: ['ciało tłuszczowe policzka', 'z użyciem ciała tłuszczowego policzka'], pal: ['płat podniebienny', 'płatem podniebiennym'], prf: ['PRF', 'z użyciem PRF'] }, '{v}'), SUTURE_F, NOTE] },
  FREN: { spec: 'chir', scope: 'm', label: 'Plastyka wędzidełka', short: 'Wędzidełko', v: DO, acc: 'plastykę wędzidełka', fields: [S('where', 'Wędzidełko', { up: ['wargi górnej', 'wędzidełko wargi górnej'], lo: ['wargi dolnej', 'wędzidełko wargi dolnej'], tongue: ['języka', 'wędzidełko języka'] }, '{v}'), S('method', 'Metoda', { scalpel: 'skalpelem', laser: 'laserem', z: 'metodą Z-plastyki' }, '{v}'), SUTURE_F, NOTE] },
  ALVEO: { spec: 'chir', scope: 'b', label: 'Alweoloplastyka', short: 'Alweoloplastyka', v: DO, acc: 'alweoloplastykę', fields: [T('site', 'Okolica', 'okolica: {v}'), SUTURE_F, NOTE] },
  EXPOSE: { spec: 'chir', scope: 't', label: 'Odsłonięcie zęba zatrzymanego (ortodontycznie)', short: 'Odsłonięcie', v: V('odsłonił', 'Odsłonięto'), acc: 'zatrzymany ząb', fields: [M('steps', 'Przebieg', { bracket: 'z naklejeniem zaczepu ortodontycznego', apical: 'płatem przesuniętym dowierzchołkowo', window: 'metodą okienkową' }, '{v}'), NOTE] },
  DRYSOCKET: { spec: 'chir', scope: 't', label: 'Leczenie suchego zębodołu', short: 'Suchy zębodół', v: RUN, acc: 'leczenie suchego zębodołu', fields: [M('steps', 'Przebieg', { rinse: 'płukanie zębodołu', curet: 'delikatne łyżeczkowanie', dress: 'opatrunek do zębodołu' }, '{v}'), HEMO_F, NOTE] },
  INCISION: { spec: 'chir', scope: 'b', label: 'Nacięcie i drenaż ropnia', short: 'Nacięcie ropnia', v: DO, acc: 'nacięcie i drenaż ropnia', fields: [S('approach', 'Dostęp', { intra: ['wewnątrzustny', 'wewnątrzustnie'], extra: ['zewnątrzustny', 'zewnątrzustnie'] }, '{v}'), M('extra', 'Dodatkowo', { drain: 'założono sączek', culture: 'pobrano materiał na posiew' }, '{v}'), ANESTH_F, NOTE] },
  REPLANT: { spec: 'chir', scope: 't', label: 'Replantacja zęba', short: 'Replantacja', v: DO, acc: 'replantację zęba', fields: [T('time', 'Czas poza zębodołem', 'czas poza zębodołem: {v}', 'np. 30 min'), S('splint', 'Szynowanie', { flex: ['szyna elastyczna', 'z szyną elastyczną'], none: ['bez szyny', 'bez szynowania'] }, '{v}'), NOTE] },
  SUTREM: { spec: 'chir', scope: 'b', label: 'Kontrola i usunięcie szwów', short: 'Zdjęcie szwów', v: REMOVE, acc: 'szwy', fields: [S('healing', 'Gojenie', { ok: ['prawidłowe', 'gojenie prawidłowe'], slow: ['opóźnione', 'gojenie opóźnione'] }, '{v}'), NOTE] },

  /* --- implantologia */
  IMPLANT: { spec: 'impl', scope: 't', label: 'Wszczepienie implantu', short: 'Implant', v: V('wszczepił', 'Wszczepiono'), acc: 'implant', fields: [T('system', 'System', '{v}', 'np. Straumann BLX', 'implsys'), N('diam', 'Średnica', 'mm', 'Ø {v} mm'), N('len', 'Długość', 'mm', 'długość {v} mm'), N('torque', 'Moment wkręcenia', 'Ncm', '{v} Ncm'), N('isq', 'ISQ', '', 'ISQ {v}'), S('protocol', 'Protokół', { two: ['dwuetapowy', 'protokół dwuetapowy'], one: ['jednoetapowy', 'protokół jednoetapowy (śruba gojąca)'], imm: ['implantacja natychmiastowa', 'implantacja natychmiastowa'], load: ['natychmiastowe obciążenie', 'natychmiastowe obciążenie'] }, '{v}'), M('extra', 'Dodatkowo', { guide: 'z szablonem chirurgicznym', flapless: 'bez odwarstwiania płata', gbr: 'z jednoczasową augmentacją' }, '{v}'), BONE_F, MEMB_F, ANESTH_F, SUTURE_F, NOTE] },
  SINUS: { spec: 'impl', scope: 't', label: 'Podniesienie dna zatoki (sinus lift)', short: 'Sinus lift', v: DO, acc: 'podniesienie dna zatoki szczękowej', fields: [S('approach', 'Metoda', { open: ['otwarta (okno boczne)', 'metodą otwartą (okno boczne)'], closed: ['zamknięta (osteotomy)', 'metodą zamkniętą'] }, '{v}'), BONE_F, MEMB_F, M('extra', 'Dodatkowo', { simult: 'z jednoczasową implantacją', perf: 'perforacja błony Schneidera — zaopatrzona' }, '{v}'), NOTE] },
  GBR: { spec: 'impl', scope: 'b', label: 'Augmentacja kości (GBR)', short: 'GBR', v: DO, acc: 'augmentację kości (sterowana regeneracja kości)', fields: [S('dir', 'Kierunek', { h: ['pozioma', 'augmentacja pozioma'], v: ['pionowa', 'augmentacja pionowa'] }, '{v}'), BONE_F, MEMB_F, T('fix', 'Mocowanie', 'mocowanie: {v}', 'np. piny tytanowe'), NOTE] },
  BLOCK: { spec: 'impl', scope: 'b', label: 'Przeszczep bloku kostnego', short: 'Blok kostny', v: DO, acc: 'przeszczep bloku kostnego', fields: [S('source', 'Pochodzenie', { auto: ['autogenny', 'blok autogenny'], allo: ['allogeniczny', 'blok allogeniczny'], xeno: ['ksenogeniczny', 'blok ksenogeniczny'] }, '{v}'), T('donor', 'Miejsce pobrania', 'miejsce pobrania: {v}', 'np. linia skośna żuchwy'), NOTE] },
  SOCKET: { spec: 'impl', scope: 't', label: 'Zachowanie zębodołu (socket preservation)', short: 'Socket pres.', v: DO, acc: 'zabezpieczenie zębodołu (socket preservation)', fields: [BONE_F, MEMB_F, NOTE] },
  UNCOVER: { spec: 'impl', scope: 't', label: 'Odsłonięcie implantu (II etap)', short: 'Odsłonięcie impl.', v: V('odsłonił', 'Odsłonięto'), acc: 'implant', fields: [T('healing', 'Śruba gojąca', 'śruba gojąca {v}', 'np. 4,5 × 3 mm'), N('isq', 'ISQ', '', 'ISQ {v}'), NOTE] },
  ABUT: { spec: 'impl', scope: 't', label: 'Osadzenie łącznika', short: 'Łącznik', v: SEAT, acc: 'łącznik', fields: [T('kind', 'Rodzaj', '{v}', 'np. Multi-Unit', 'abut'), N('torque', 'Moment', 'Ncm', '{v} Ncm'), NOTE] },
  PERIIMPL: { spec: 'impl', scope: 't', label: 'Leczenie zapalenia okołowszczepowego', short: 'Periimplantitis', v: RUN, acc: 'leczenie zapalenia tkanek okołowszczepowych', fields: [M('steps', 'Leczenie', { mech: 'oczyszczanie mechaniczne', air: 'piaskowanie (glicyna / erytrytol)', surg: 'leczenie chirurgiczne z dekontaminacją powierzchni', regen: 'zabieg regeneracyjny' }, '{v}'), T('product', 'Preparat', '{v}', '', 'periolocal'), NOTE] },

  /* --- periodontologia */
  PERIO_DX: { spec: 'perio', scope: 'm', label: 'Badanie periodontologiczne', short: 'Badanie perio', v: RUN, acc: 'badanie periodontologiczne', fields: [S('stage', 'Stadium', { I: 'I', II: 'II', III: 'III', IV: 'IV' }, 'zapalenie przyzębia — stadium {v}'), S('grade', 'Stopień', { A: 'A', B: 'B', C: 'C' }, 'stopień {v}'), S('extent', 'Rozległość', { loc: ['zlokalizowane', 'postać zlokalizowana'], gen: ['uogólnione', 'postać uogólniona'], mi: ['trzonowcowo-siekaczowe', 'wzorzec trzonowcowo-siekaczowy'] }, '{v}'), T('psr', 'PSR (sekstanty)', 'PSR: {v}', 'np. 3 2 3 / 3 2 4'), N('bop', 'BOP', '%', 'BOP {v}%'), N('pi', 'Wskaźnik płytki', '%', 'wskaźnik płytki {v}%'), N('ppd', 'Najgłębsza kieszeń', 'mm', 'kieszenie do {v} mm'), NOTE] },
  SRP: { spec: 'perio', scope: 'b', label: 'Skaling poddziąsłowy i wygładzanie korzeni', short: 'SRP', v: DO, acc: 'skaling poddziąsłowy i wygładzanie powierzchni korzeni', fields: [AREA_F, M('how', 'Sposób', { fm: 'protokół full-mouth (24 h)', us: 'skalerem ultradźwiękowym', gracey: 'kiretami Gracey', gbt: 'z piaskowaniem poddziąsłowym' }, '{v}'), ANESTH_F, T('local', 'Lek miejscowy', '{v}', '', 'periolocal'), NOTE] },
  FLAP: { spec: 'perio', scope: 'b', label: 'Kiretaż otwarty (zabieg płatowy)', short: 'Kiretaż otwarty', v: DO, acc: 'kiretaż otwarty (zabieg płatowy)', fields: [AREA_F, ANESTH_F, SUTURE_F, NOTE] },
  REGEN: { spec: 'perio', scope: 't', label: 'Regeneracja tkanek przyzębia (GTR / Emdogain)', short: 'Regeneracja', v: RUN, acc: 'zabieg regeneracji tkanek przyzębia', fields: [T('product', 'Materiał', '{v}', 'np. Emdogain', 'regen'), BONE_F, MEMB_F, SUTURE_F, NOTE] },
  RECESSION: { spec: 'perio', scope: 'b', label: 'Pokrycie recesji dziąsłowej', short: 'Pokrycie recesji', v: DO, acc: 'zabieg pokrycia recesji dziąsłowej', fields: [S('tech', 'Technika', { caf: ['płat przesunięty koronowo (CAF)', 'płatem przesuniętym koronowo'], tun: ['technika tunelowa', 'techniką tunelową'], lat: ['płat przesunięty bocznie', 'płatem przesuniętym bocznie'], fgg: ['wolny przeszczep dziąsłowy', 'wolnym przeszczepem dziąsłowym'] }, '{v}'), T('graft', 'Przeszczep / matryca', '{v}', 'np. CTG z podniebienia', 'softgraft'), SUTURE_F, NOTE] },
  GINGIVECT: { spec: 'perio', scope: 'b', label: 'Gingiwektomia / gingiwoplastyka', short: 'Gingiwektomia', v: DO, acc: '{kind}', fields: [S('kind', 'Zabieg', { gx: ['gingiwektomia', 'gingiwektomię'], gp: ['gingiwoplastyka', 'gingiwoplastykę'] }), S('method', 'Metoda', { scalpel: 'skalpelem', laser: 'laserem', electro: 'elektrochirurgicznie' }, '{v}'), AREA_F, NOTE] },
  CROWNLEN: { spec: 'perio', scope: 't', label: 'Chirurgiczne wydłużenie korony klinicznej', short: 'Wydłużenie korony', v: DO, acc: 'chirurgiczne wydłużenie korony klinicznej', fields: [M('steps', 'Przebieg', { osteo: 'z osteoplastyką' }, '{v}'), SUTURE_F, NOTE] },
  SPLINT: { spec: 'perio', scope: 'b', label: 'Szynowanie zębów', short: 'Szynowanie', v: DO, acc: 'szynowanie zębów', fields: [T('teeth', 'Zęby', 'zęby {v}', 'np. 33–43'), T('product', 'Materiał', '{v}', 'np. everStick PERIO', 'splintmat'), NOTE] },
  PERIO_MAINT: { spec: 'perio', scope: 'm', label: 'Leczenie podtrzymujące (SPT)', short: 'SPT', v: RUN, acc: 'wizytę leczenia podtrzymującego', fields: [M('steps', 'Zakres', { scale: 'skaling', air: 'piaskowanie', ohi: 'instruktaż higieny', recall: 'ocena wskaźników' }, '{v}'), N('bop', 'BOP', '%', 'BOP {v}%'), N('pi', 'Wskaźnik płytki', '%', 'wskaźnik płytki {v}%'), NOTE] },

  /* --- protetyka */
  CROWN: { spec: 'prot', scope: 't', label: 'Korona protetyczna', short: 'Korona', v: DO, acc: '{stage}', fields: [PROT_STAGE(['koronę protetyczną', 'korony protetycznej', 'koronę protetyczną']), T('mat', 'Materiał', '{v}', 'np. cyrkon monolityczny', 'crownmat'), T('shade', 'Kolor', 'kolor {v}', 'np. A2'), CEMENT_F, NOTE] },
  BRIDGE: { spec: 'prot', scope: 't', label: 'Most protetyczny (filar / przęsło)', short: 'Most', v: DO, acc: '{stage}', fields: [PROT_STAGE(['most', 'mostu', 'most']), S('role', 'Element', { abut: 'filar', pontic: 'przęsło' }, '{v} mostu'), T('mat', 'Materiał', '{v}', '', 'crownmat'), CEMENT_F, NOTE] },
  VENEER: { spec: 'prot', scope: 't', label: 'Licówka (pośrednia)', short: 'Licówka', v: DO, acc: '{stage}', fields: [PROT_STAGE(['licówkę', 'licówki', 'licówkę']), T('mat', 'Materiał', '{v}', 'np. IPS e.max Press', 'crownmat'), CEMENT_F, NOTE] },
  INLAY: { spec: 'prot', scope: 't', label: 'Inlay / onlay / overlay / endokorona', short: 'Onlay', v: DO, acc: '{stage}', fields: [PROT_STAGE(['uzupełnienie pośrednie', 'uzupełnienia pośredniego', 'uzupełnienie pośrednie']), S('kind', 'Rodzaj', { inlay: 'inlay', onlay: 'onlay', overlay: 'overlay', endo: 'endokorona' }, '{v}'), T('mat', 'Materiał', '{v}', '', 'crownmat'), CEMENT_F, NOTE] },
  POST: { spec: 'prot', scope: 't', label: 'Wkład koronowo-korzeniowy', short: 'Wkład', v: SEAT, acc: 'wkład koronowo-korzeniowy', fields: [S('kind', 'Rodzaj', { fiber: ['z włókna szklanego', 'z włókna szklanego'], cast: ['lany', 'lany'], zirc: ['cyrkonowy', 'cyrkonowy'] }, '{v}'), T('product', 'Produkt', '{v}', 'np. RelyX Fiber Post', 'post'), CEMENT_F, NOTE] },
  TEMPCROWN: { spec: 'prot', scope: 't', label: 'Uzupełnienie tymczasowe', short: 'Tymczasowe', v: DO, acc: 'uzupełnienie tymczasowe', fields: [S('kind', 'Wykonanie', { chair: ['w gabinecie', 'metodą bezpośrednią w gabinecie'], lab: ['laboratoryjne', 'laboratoryjne (PMMA)'] }, '{v}'), T('product', 'Materiał', '{v}', 'np. Protemp 4', 'tempmat'), CEMENT_F, NOTE] },
  IMPL_PROS: { spec: 'prot', scope: 't', label: 'Uzupełnienie na implancie', short: 'Korona na impl.', v: DO, acc: '{stage}', fields: [S('stage', 'Etap', { imp: ['wycisk / skan', 'wycisk (skan) z poziomu implantu', TAKE], try: ['przymiarka', 'uzupełnienie na implancie', TRY], seat: ['osadzenie', 'uzupełnienie na implancie', SEAT] }), S('fix', 'Mocowanie', { screw: ['przykręcane', 'uzupełnienie przykręcane'], cem: ['cementowane', 'uzupełnienie cementowane'] }, '{v}'), T('mat', 'Materiał', '{v}', '', 'crownmat'), N('torque', 'Moment', 'Ncm', '{v} Ncm'), NOTE] },
  DENTURE: { spec: 'prot', scope: 'm', label: 'Proteza ruchoma', short: 'Proteza', v: DO, acc: '{stage}', fields: [S('stage', 'Etap', { imp1: ['wyciski anatomiczne', 'wyciski anatomiczne', TAKE], imp2: ['wyciski czynnościowe', 'wyciski czynnościowe', TAKE], bite: ['rejestracja zwarcia', 'rejestrację zwarcia'], try: ['przymiarka w wosku', 'protezę w wosku', TRY], give: ['oddanie protezy', 'protezę', GIVE], adj: ['korekta', 'protezę', ADJ] }), S('kind', 'Rodzaj', { full: 'proteza całkowita', partial: 'proteza częściowa akrylowa', skel: 'proteza szkieletowa', over: 'proteza nakładowa na implantach', flex: 'proteza elastyczna' }, '{v}'), ARCH_F, T('mat', 'Materiał', '{v}', '', 'denture'), NOTE] },
  DENT_FIX: { spec: 'prot', scope: 'm', label: 'Naprawa / podścielenie protezy', short: 'Naprawa protezy', v: DO, acc: '{kind}', fields: [S('kind', 'Zabieg', { repair: ['naprawa', 'naprawę protezy'], reline: ['podścielenie', 'podścielenie protezy'], rebase: ['wymiana płyty', 'wymianę płyty protezy'] }), ARCH_F, T('product', 'Materiał', '{v}', '', 'denture'), NOTE] },
  SPLINT_OCC: { spec: 'prot', scope: 'm', label: 'Szyna zgryzowa / relaksacyjna', short: 'Szyna', v: DO, acc: '{stage}', fields: [S('stage', 'Etap', { imp: ['wycisk / skan', 'wycisk (skan) do szyny zgryzowej', TAKE], give: ['oddanie', 'szynę zgryzową', GIVE], adj: ['korekta', 'szynę zgryzową', ADJ] }), S('kind', 'Rodzaj', { mich: 'szyna stabilizacyjna (Michigan)', relax: 'szyna relaksacyjna', nti: 'szyna NTI', repos: 'szyna repozycyjna' }, '{v}'), ARCH_F, NOTE] },
  IMPRESSION: { spec: 'prot', scope: 'b', label: 'Wycisk / skan / rejestracja zwarcia', short: 'Wycisk/skan', v: DO, acc: '{kind}', fields: [S('kind', 'Rodzaj', { imp: ['wycisk', 'wycisk'], scan: ['skan wewnątrzustny', 'skan wewnątrzustny'], bite: ['rejestracja zwarcia', 'rejestrację zwarcia'], bow: ['łuk twarzowy', 'pomiar łukiem twarzowym'] }), T('product', 'Materiał / skaner', '{v}', 'np. Impregum, TRIOS 5', 'impression'), NOTE] },
  TMD: { spec: 'prot', scope: 'm', label: 'Diagnostyka zaburzeń skroniowo-żuchwowych', short: 'Diagn. SSŻ', v: RUN, acc: 'diagnostykę zaburzeń czynnościowych narządu żucia', fields: [M('find', 'Objawy', { click: 'trzaski w stawach', pain: 'ból mięśni żucia', limit: 'ograniczenie odwodzenia', brux: 'bruksizm' }, '{v}'), N('open', 'Odwodzenie', 'mm', 'odwodzenie {v} mm'), NOTE] },

  /* --- ortodoncja */
  ORTHO_DX: { spec: 'orto', scope: 'm', label: 'Diagnostyka ortodontyczna', short: 'Diagnostyka orto', v: RUN, acc: 'diagnostykę ortodontyczną', fields: [S('angle', 'Klasa Angle’a', { I: 'I', II1: 'II/1', II2: 'II/2', III: 'III' }, 'klasa {v} Angle’a'), N('oj', 'Nagryzanie poziome', 'mm', 'nagryzanie poziome {v} mm'), N('ob', 'Nagryzanie pionowe', 'mm', 'nagryzanie pionowe {v} mm'), M('find', 'Wady', { crowd: 'stłoczenia', space: 'szpary', cross: 'zgryz krzyżowy', open: 'zgryz otwarty', deep: 'zgryz głęboki', scissor: 'zgryz przewieszony', mid: 'przesunięcie linii pośrodkowej', impact: 'zęby zatrzymane', agen: 'braki zawiązków' }, '{v}'), M('records', 'Dokumentacja', { ceph: 'analiza cefalometryczna', pano: 'pantomogram', photo: 'fotografie', scan: 'skan / modele', cbct: 'CBCT' }, 'dokumentacja: {v}'), T('plan', 'Plan leczenia', 'plan: {v}'), NOTE] },
  FIXED: { spec: 'orto', scope: 'm', label: 'Aparat stały — założenie', short: 'Aparat stały', v: PUT, acc: 'aparat stały', fields: [S('arch', 'Łuk', { up: ['górny', 'na łuk górny'], lo: ['dolny', 'na łuk dolny'], both: ['oba', 'na oba łuki'] }, '{v}'), S('kind', 'Rodzaj', { metal: 'zamki metalowe', cer: 'zamki estetyczne (ceramiczne)', self: 'zamki samoligaturujące', ling: 'aparat lingwalny' }, '{v}'), T('system', 'System', 'system {v}', 'np. 3M Victory', 'brackets'), T('wire', 'Łuk', 'łuk {v}', 'np. NiTi .014', 'wires'), T('glue', 'Klej', 'klej {v}', 'np. Transbond XT', 'orthoadh'), NOTE] },
  ORTHO_CTRL: { spec: 'orto', scope: 'm', label: 'Wizyta kontrolna (aparat stały)', short: 'Kontrola orto', v: RUN, acc: 'wizytę kontrolną', fields: [M('steps', 'Czynności', { wire: 'wymiana łuku', act: 'aktywacja', lig: 'wymiana ligatur', elast: 'elastyki międzyszczękowe', chain: 'łańcuszek elastyczny', rebond: 'ponowne naklejenie zamka', bend: 'gięcia łuku' }, '{v}'), T('wire', 'Łuk', 'łuk {v}', '', 'wires'), T('next', 'Następna wizyta', 'następna wizyta: {v}', 'np. za 6 tygodni'), NOTE] },
  ALIGNERS: { spec: 'orto', scope: 'm', label: 'Leczenie nakładkami (alignery)', short: 'Alignery', v: RUN, acc: '{stage}', fields: [S('stage', 'Etap', { scan: ['skan do planu', 'skan do zaplanowania leczenia nakładkami', DO], start: ['rozpoczęcie', 'leczenie nakładkami', VI('rozpoczęłam', 'rozpocząłem', 'Rozpoczęto')], give: ['wydanie nakładek', 'kolejne nakładki', V('wydał', 'Wydano')], ref: ['korekta (refinement)', 'skan do korekty planu (refinement)', DO] }), T('system', 'System', '{v}', 'np. Invisalign', 'aligners'), T('trays', 'Nakładki nr', 'nakładki nr {v}', 'np. 1–6'), M('extra', 'Dodatkowo', { att: 'założenie attachmentów', ipr: 'redukcja szkliwa międzyzębowego (IPR)' }, '{v}'), NOTE] },
  REMOVABLE: { spec: 'orto', scope: 'm', label: 'Aparat ruchomy / czynnościowy', short: 'Aparat ruchomy', v: DO, acc: '{stage}', fields: [S('stage', 'Etap', { imp: ['wycisk / skan', 'wycisk (skan) do aparatu ruchomego', TAKE], give: ['oddanie aparatu', 'aparat', GIVE], ctrl: ['kontrola i aktywacja', 'aparat', VI('skontrolowałam i aktywowałam', 'skontrolowałem i aktywowałem', 'Skontrolowano i aktywowano')] }), T('kind', 'Aparat', 'aparat: {v}', 'np. płytka Schwarza', 'removable'), ARCH_F, NOTE] },
  EXPANSION: { spec: 'orto', scope: 'm', label: 'Ekspansja szczęki (RME / MARPE)', short: 'Ekspansja', v: PUT, acc: 'aparat do ekspansji szczęki', fields: [T('kind', 'Rodzaj', '{v}', 'np. hyrax, MARPE'), T('protocol', 'Aktywacja', 'aktywacja: {v}', 'np. 2 × ¼ obrotu dziennie'), NOTE] },
  TAD: { spec: 'orto', scope: 'b', label: 'Miniimplant ortodontyczny (TAD)', short: 'Miniimplant', v: V('wprowadził', 'Wprowadzono'), acc: 'miniimplant ortodontyczny', fields: [T('site', 'Lokalizacja', 'lokalizacja: {v}', 'np. między 15 a 16'), T('product', 'System', '{v}', '', 'tad'), N('len', 'Długość', 'mm', 'długość {v} mm'), NOTE] },
  DEBOND: { spec: 'orto', scope: 'm', label: 'Zdjęcie aparatu stałego', short: 'Zdjęcie aparatu', v: VI('zdjęłam', 'zdjąłem', 'Zdjęto'), acc: 'aparat stały', fields: [S('arch', 'Łuk', { up: ['górny', 'z łuku górnego'], lo: ['dolny', 'z łuku dolnego'], both: ['oba', 'z obu łuków'] }, '{v}'), M('extra', 'Dodatkowo', { polish: 'usunięcie resztek kleju i polerowanie', fluor: 'fluoryzacja' }, '{v}'), NOTE] },
  RETAIN: { spec: 'orto', scope: 'm', label: 'Retencja', short: 'Retencja', v: PUT, acc: '{kind}', fields: [S('kind', 'Rodzaj', { fixed: ['retainer stały', 'retainer stały'], essix: ['szyna retencyjna', 'szynę retencyjną'], hawley: ['płytka Hawleya', 'płytkę retencyjną (Hawleya)'] }), ARCH_F, T('product', 'Materiał', '{v}', '', 'retainer'), NOTE] },
  SEPAR: { spec: 'orto', scope: 'b', label: 'Separacja zębów', short: 'Separacja', v: PUT, acc: 'separatory', fields: [T('teeth', 'Zęby', 'zęby {v}', 'np. 16, 26'), NOTE] },

  /* --- stomatologia dziecięca */
  SEAL: { spec: 'ped', scope: 't', label: 'Lakowanie bruzd', short: 'Lakowanie', v: V('zalakował', 'Zalakowano'), acc: 'bruzdy', fields: [S('kind', 'Rodzaj', { std: ['lakowanie', 'lakowanie'], ext: ['lakowanie poszerzone', 'lakowanie poszerzone'] }, '{v}'), T('product', 'Lak', '{v}', 'np. Helioseal F Plus', 'sealant'), NOTE] },
  PULPOT_P: { spec: 'ped', scope: 't', label: 'Pulpotomia zęba mlecznego', short: 'Pulpotomia', v: DO, acc: 'pulpotomię', fields: [T('product', 'Materiał', '{v}', 'np. Biodentine', 'pedpulp'), T('restor', 'Odbudowa', 'odbudowa: {v}', 'np. korona stalowa'), ANESTH_F, NOTE] },
  PULPECT_P: { spec: 'ped', scope: 't', label: 'Pulpektomia zęba mlecznego', short: 'Pulpektomia', v: DO, acc: 'pulpektomię', fields: [T('fill', 'Wypełnienie kanałów', 'kanały wypełniono: {v}', 'np. Vitapex', 'pedpulp'), ANESTH_F, NOTE] },
  SSC: { spec: 'ped', scope: 't', label: 'Korona pedodontyczna', short: 'Korona ped.', v: SEAT, acc: 'koronę pedodontyczną', fields: [S('kind', 'Rodzaj', { steel: 'stalowa', hall: ['stalowa — metoda Halla', 'korona stalowa metodą Halla'], zirc: 'cyrkonowa', strip: ['celuloidowa (strip crown)', 'korona typu strip crown'] }, '{v}'), T('product', 'Produkt', '{v}', '', 'pedcrown'), CEMENT_F, NOTE] },
  EXT_P: { spec: 'ped', scope: 't', label: 'Ekstrakcja zęba mlecznego', short: 'Ekstr. mleczn.', v: REMOVE, acc: 'ząb mleczny', fields: [ANESTH_F, AGENT_F, HEMO_F, NOTE] },
  SPACE: { spec: 'ped', scope: 't', label: 'Utrzymywacz przestrzeni', short: 'Utrzym. przestrz.', v: SEAT, acc: 'utrzymywacz przestrzeni', fields: [S('kind', 'Rodzaj', { band: ['pierścień z pętlą', 'pierścień z pętlą'], ling: ['łuk językowy', 'łuk językowy'], nance: ['aparat Nance’a', 'aparat Nance’a'], rem: ['płytka', 'płytka ruchoma'] }, '{v}'), NOTE] },
  SDF: { spec: 'ped', scope: 'b', label: 'Lakierowanie SDF (zatrzymanie próchnicy)', short: 'SDF', v: V('zastosował', 'Zastosowano'), acc: 'diaminę fluorku srebra (SDF)', fields: [T('product', 'Preparat', '{v}', 'np. Riva Star', 'sdf'), NOTE] },
  TRAUMA: { spec: 'ped', scope: 't', label: 'Leczenie urazu zęba', short: 'Uraz', v: RUN, acc: 'leczenie urazu zęba', fields: [S('kind', 'Uraz', { conc: 'wstrząśnienie', sub: 'podwichnięcie', lux: 'zwichnięcie', avul: 'zwichnięcie całkowite', frE: 'złamanie szkliwa / zębiny', frP: 'złamanie z odsłonięciem miazgi', root: 'złamanie korzenia' }, 'rozpoznanie: {v}'), M('steps', 'Leczenie', { splint: 'szynowanie', repos: 'repozycja', recon: 'odbudowa (przyklejenie odłamka / kompozyt)', pulp: 'pokrycie miazgi', vit: 'kontrola żywotności' }, '{v}'), NOTE] },
  ADAPT: { spec: 'ped', scope: 'm', label: 'Wizyta adaptacyjna', short: 'Adaptacja', v: RUN, acc: 'wizytę adaptacyjną', fields: [M('steps', 'Przebieg', { tsd: 'metoda „powiedz–pokaż–zrób”', ohi: 'instruktaż higieny z rodzicem', diet: 'porada dietetyczna', risk: 'ocena ryzyka próchnicy' }, '{v}'), NOTE] },
  FLUOR: { spec: 'ped', scope: 'm', label: 'Fluoryzacja (lakier fluorkowy)', short: 'Fluoryzacja', v: RUN, acc: 'fluoryzację kontaktową', fields: [T('product', 'Preparat', '{v}', 'np. Duraphat', 'fluoride'), AREA_F, NOTE] },

  /* --- higienizacja i profilaktyka */
  SCALE: { spec: 'hig', scope: 'm', label: 'Skaling naddziąsłowy', short: 'Skaling', v: DO, acc: 'skaling naddziąsłowy', fields: [S('device', 'Sposób', { us: ['ultradźwięki', 'skalerem ultradźwiękowym'], hand: ['narzędzia ręczne', 'narzędziami ręcznymi'] }, '{v}'), T('product', 'Urządzenie', '{v}', 'np. EMS Piezon', 'perioinst'), NOTE] },
  AIRFLOW: { spec: 'hig', scope: 'm', label: 'Piaskowanie', short: 'Piaskowanie', v: DO, acc: 'piaskowanie', fields: [T('powder', 'Proszek', 'proszek: {v}', 'np. AIRFLOW Plus', 'powder'), NOTE] },
  POLISH: { spec: 'hig', scope: 'm', label: 'Polerowanie zębów', short: 'Polerowanie', v: DO, acc: 'polerowanie zębów', fields: [T('paste', 'Pasta', 'pasta: {v}', 'np. Cleanic', 'paste'), NOTE] },
  GBT: { spec: 'hig', scope: 'm', label: 'Profilaktyka GBT', short: 'GBT', v: RUN, acc: 'zabieg profilaktyczny GBT (Guided Biofilm Therapy)', fields: [M('steps', 'Etapy', { disc: 'wybarwienie płytki', air: 'AIRFLOW', ps: 'PIEZON PS', ohi: 'instruktaż higieny' }, '{v}'), NOTE] },
  OHI: { spec: 'hig', scope: 'm', label: 'Instruktaż higieny jamy ustnej', short: 'Instruktaż', v: RUN, acc: 'instruktaż higieny jamy ustnej', fields: [T('advice', 'Zalecone środki', 'zalecono: {v}', 'np. szczoteczki międzyzębowe', 'oralcare'), NOTE] },

  /* --- chirurgia szczękowo-twarzowa */
  FRACTURE: { spec: 'mfs', scope: 'm', label: 'Zaopatrzenie złamania', short: 'Złamanie', v: V('zaopatrzył', 'Zaopatrzono'), acc: 'złamanie {bone}', fields: [S('bone', 'Kość', { mand: 'żuchwy', max: 'szczęki', zyg: 'kości jarzmowej', orb: 'oczodołu', nas: 'kości nosowych', alv: 'wyrostka zębodołowego' }), S('method', 'Leczenie', { orif: ['osteosynteza płytkowa', 'osteosynteza płytkowa (ORIF)'], imf: ['unieruchomienie międzyszczękowe', 'unieruchomienie międzyszczękowe'], splint: ['szyna nazębna', 'szyna nazębna'], cons: ['zachowawcze', 'leczenie zachowawcze'] }, '{v}'), T('product', 'Materiał', '{v}', 'np. ChM, KLS Martin', 'osteo'), M('extra', 'Dodatkowo', { ga: 'w znieczuleniu ogólnym' }, '{v}'), NOTE] },
  OSTEOTOMY: { spec: 'mfs', scope: 'm', label: 'Chirurgia ortognatyczna (osteotomia)', short: 'Osteotomia', v: DO, acc: 'osteotomię', fields: [M('kind', 'Rodzaj', { lf1: 'Le Fort I', bsso: 'obustronna strzałkowa osteotomia żuchwy (BSSO)', genio: 'genioplastyka', sarpe: 'SARPE' }, '{v}'), T('product', 'Osteosynteza', '{v}', '', 'osteo'), NOTE] },
  LESION: { spec: 'mfs', scope: 'b', label: 'Usunięcie zmiany (guz, torbiel)', short: 'Usunięcie zmiany', v: REMOVE, acc: 'zmianę', fields: [T('kind', 'Rodzaj zmiany', '{v}', 'np. włókniak'), T('site', 'Lokalizacja', 'lokalizacja: {v}'), M('extra', 'Dodatkowo', { histo: 'materiał przesłano do badania histopatologicznego', ga: 'w znieczuleniu ogólnym' }, '{v}'), SUTURE_F, NOTE] },
  TMJ_PROC: { spec: 'mfs', scope: 'm', label: 'Zabieg w obrębie stawu skroniowo-żuchwowego', short: 'Zabieg SSŻ', v: DO, acc: '{kind}', fields: [S('kind', 'Zabieg', { arthro: ['artrocenteza', 'artrocentezę stawu skroniowo-żuchwowego'], inj: ['iniekcja dostawowa', 'iniekcję dostawową'], botox: ['toksyna botulinowa', 'iniekcję toksyny botulinowej do mięśni żucia'] }), S('side', 'Strona', { r: 'prawa', l: 'lewa', both: 'obustronnie' }, 'strona: {v}'), T('product', 'Preparat', '{v}', '', 'tmjmat'), NOTE] },

  OTHER: { spec: 'zach', scope: 'b', label: 'Inna procedura', short: 'Inne', v: DO, acc: 'zabieg', fields: [{ k: 'note', type: 'area', label: 'Opis procedury', ph: 'Opisz wykonaną procedurę' }] },
};
/** Procedures offered under each specialty (a procedure can appear under more than one). */
export const SPEC_PROCS = {
  zach: ['FILL', 'REFILL', 'BONDING', 'VENEER_D', 'BUILDUP', 'ICON', 'DESENS', 'TEMPFILL', 'BLEACH_INT', 'BLEACH', 'OTHER'],
  endo: ['BUILDUP', 'TEMPFILL', 'BLEACH_INT', 'APICO_S'],
  chir: ['EXT', 'IMPACT', 'HEMISECT', 'APICO_S', 'CYST', 'BIOPSY', 'OAC', 'FREN', 'ALVEO', 'EXPOSE', 'DRYSOCKET', 'INCISION', 'REPLANT', 'SUTREM'],
  impl: ['IMPLANT', 'SINUS', 'GBR', 'BLOCK', 'SOCKET', 'UNCOVER', 'ABUT', 'PERIIMPL', 'IMPL_PROS'],
  perio: ['PERIO_DX', 'SRP', 'FLAP', 'REGEN', 'RECESSION', 'GINGIVECT', 'CROWNLEN', 'SPLINT', 'PERIO_MAINT'],
  prot: ['CROWN', 'BRIDGE', 'VENEER', 'INLAY', 'POST', 'TEMPCROWN', 'IMPL_PROS', 'DENTURE', 'DENT_FIX', 'SPLINT_OCC', 'IMPRESSION', 'TMD'],
  orto: ['ORTHO_DX', 'FIXED', 'ORTHO_CTRL', 'ALIGNERS', 'REMOVABLE', 'EXPANSION', 'TAD', 'SEPAR', 'DEBOND', 'RETAIN', 'EXPOSE'],
  ped: ['SEAL', 'FILL', 'PULPOT_P', 'PULPECT_P', 'SSC', 'EXT_P', 'SPACE', 'SDF', 'TRAUMA', 'FLUOR', 'ADAPT'],
  mfs: ['FRACTURE', 'OSTEOTOMY', 'LESION', 'TMJ_PROC', 'BIOPSY', 'INCISION', 'CYST'],
  hig: ['SCALE', 'AIRFLOW', 'POLISH', 'GBT', 'FLUOR', 'OHI', 'SEAL'],
};
export const procsFor = (spec, scope) => (SPEC_PROCS[spec] || []).filter((k) => PROCS[k] && (scope === 't' ? PROCS[k].scope !== 'm' : PROCS[k].scope !== 't'));

/* ------------------------------------------------------------------ zdania z pól */
const optLabel = (o) => (Array.isArray(o) ? o[0] : o);
const optPhrase = (o) => (Array.isArray(o) ? o[1] : o);
const plNum = (v) => String(v ?? '').trim().replace('.', ',');
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const joinPl = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} i ${a.at(-1)}`);
export const SURF_NAMES = { O: 'żująca', M: 'mezjalna', D: 'dystalna', B: 'policzkowa / wargowa', L: 'językowa / podniebienna', I: 'brzeg sieczny' };
/** Text of one field value, or '' when empty. */
export function fieldText(f, val) {
  if (val == null || val === '' || (Array.isArray(val) && !val.length)) return '';
  let v = '';
  if (f.type === 'sel') v = optPhrase(f.opts[val] ?? val);
  else if (f.type === 'multi') v = joinPl(val.map((x) => optPhrase(f.opts[x] ?? x)));
  else if (f.type === 'surf') v = val.join('');
  else if (f.type === 'num') v = plNum(val);
  else v = String(val).trim();
  if (!v) return '';
  return f.say ? f.say.replace('{v}', v) : v;
}
/** Sentence for a procedure. mode: 'f' / 'm' (author's gender, first person) or 'imp' (clinical record). */
export function procSentence(w, mode = 'imp') {
  const p = PROCS[w.type];
  if (!p || p.special) return '';
  if (w.type === 'OTHER') return w.note ? cap(w.note.trim().replace(/([^.!?])$/, '$1.')) : '';
  const used = new Set(); let vb = p.v;
  const acc = p.acc.replace(/\{(\w+)\}/g, (_, k) => {
    used.add(k); const f = p.fields.find((x) => x.k === k); if (!f) return '';
    const o = f.opts[w[k]] ?? Object.values(f.opts)[0];
    if (Array.isArray(o) && o[2]) vb = o[2];
    return optPhrase(o);
  });
  const det = p.fields.filter((f) => f.k !== 'note' && !used.has(f.k)).map((f) => fieldText(f, w[f.k])).filter(Boolean);
  const verb = mode === 'imp' ? vb.imp : cap(vb[mode === 'm' ? 'm' : 'f']);
  const note = w.note && w.type !== 'OTHER' ? ` ${cap(w.note.trim().replace(/([^.!?])$/, '$1.'))}` : '';
  return `${verb} ${acc}${det.length ? ` (${det.join(', ')})` : ''}.${note}`;
}
/** Short label for summaries and the visit history (e.g. "Ekstrakcja", "Korona — osadzenie"). */
export function procShort(w) {
  const p = PROCS[w.type]; if (!p) return 'Inne';
  if (p.special === 'fill') return `Wyp.${w.cls ? ' kl. ' + w.cls : ''}${(w.surf || []).length ? ' ' + w.surf.join('') : ''}`;
  const st = p.fields?.find((f) => f.k === 'stage' && f.label === 'Etap'); const kind = p.fields?.find((f) => f.k === 'kind' && p.acc.includes('{kind}'));
  if (st && w.stage) return `${p.short} — ${optLabel(st.opts[w.stage])}`;
  if (kind && w.kind) return `${p.short}: ${optLabel(kind.opts[w.kind])}`;
  return p.short;
}
export const specOf = (w) => w.spec || PROCS[w.type]?.spec || 'zach';
export { optLabel };

/* ------------------------------------------------------------------ rozpoznania spoza endodoncji (ICD-10) */
export const DX_OTHER = [
  'K02.0 Próchnica ograniczona do szkliwa', 'K02.1 Próchnica zębiny', 'K02.3 Próchnica zatrzymana', 'K02.5 Próchnica z odsłonięciem miazgi',
  'K03.0 Starcie zębów (atrycja)', 'K03.1 Ścieranie zębów (abrazja)', 'K03.2 Erozja zębów', 'K03.6 Złogi na zębach (kamień nazębny)', 'K03.7 Przebarwienia twardych tkanek zęba',
  'K00.0 Brak zawiązków zębów (hipodoncja)', 'K00.4 Zaburzenia rozwoju zębów (np. MIH)', 'K00.6 Zaburzenia wyrzynania zębów',
  'K01.0 Zęby zatrzymane', 'K01.1 Zęby zaklinowane', 'K04.6 Ropień okołowierzchołkowy z przetoką', 'K04.8 Torbiel korzeniowa',
  'K05.0 Ostre zapalenie dziąseł', 'K05.1 Przewlekłe zapalenie dziąseł', 'K05.3 Przewlekłe zapalenie przyzębia', 'K05.2 Ostre zapalenie przyzębia (ropień przyzębny)',
  'K06.0 Recesja dziąsła', 'K06.1 Przerost dziąseł', 'K07.2 Nieprawidłowości relacji łuków zębowych', 'K07.3 Nieprawidłowości ustawienia zębów',
  'K07.6 Zaburzenia stawu skroniowo-żuchwowego', 'K08.1 Utrata zębów (ekstrakcja, choroba przyzębia)', 'K08.2 Zanik bezzębnego wyrostka zębodołowego', 'K08.3 Pozostawiony korzeń zęba',
  'K09.0 Torbiel zębopochodna rozwojowa', 'K10.3 Zapalenie zębodołu (suchy zębodół)', 'K12.0 Nawracające afty jamy ustnej', 'M26.6 Zaburzenia stawu skroniowo-żuchwowego',
  'S02.5 Złamanie zęba', 'S02.6 Złamanie żuchwy', 'S03.2 Zwichnięcie zęba', 'T85.6 Powikłanie implantu (periimplantitis)',
];

/* ------------------------------------------------------------------ materiały i sprzęt (podpowiedzi, rynek PL) */
export const EXTRA_CATS = {
  liner: ['Podkład / liner', 'zach'], gic: ['Cement glasjonomerowy / kompomer', 'zach'], matrix: ['Matryce i kliny', 'zach'], curing: ['Lampa polimeryzacyjna', 'zach'],
  polish: ['Polerki / paski', 'zach'], bleach: ['Wybielanie', 'zach'], desens: ['Preparat na nadwrażliwość', 'zach'],
  suture: ['Szwy', 'chir'], hemostat: ['Hemostatyki / opatrunki zębodołowe', 'chir'], surgtools: ['Narzędzia chirurgiczne / piezochirurgia', 'chir'], prf: ['Koncentraty krwi (PRF)', 'chir'],
  implsys: ['System implantologiczny', 'impl'], implmotor: ['Silnik chirurgiczny', 'impl'], isq: ['Pomiar stabilności implantu', 'impl'], abut: ['Łączniki', 'impl'],
  bone: ['Materiał kościozastępczy', 'impl'], membrane: ['Membrana', 'impl'],
  perioinst: ['Skalery / urządzenia', 'perio'], curette: ['Kirety / sondy', 'perio'], periolocal: ['Leki miejscowe (perio)', 'perio'], softgraft: ['Przeszczep / matryca tkanek miękkich', 'perio'], regen: ['Materiał regeneracyjny', 'perio'], splintmat: ['Szynowanie', 'perio'],
  impression: ['Materiał wyciskowy / skaner', 'prot'], crownmat: ['Materiał uzupełnienia', 'prot'], tempmat: ['Uzupełnienia tymczasowe', 'prot'], cadcam: ['CAD/CAM', 'prot'], denture: ['Materiał protezy', 'prot'],
  brackets: ['Zamki / aparat stały', 'orto'], aligners: ['System nakładek', 'orto'], wires: ['Łuki', 'orto'], orthoadh: ['Klej ortodontyczny', 'orto'], removable: ['Aparat ruchomy / czynnościowy', 'orto'], tad: ['Miniimplanty', 'orto'], retainer: ['Retencja', 'orto'],
  sealant: ['Lak szczelinowy', 'ped'], fluoride: ['Preparat fluorkowy', 'ped'], pedcrown: ['Korony pedodontyczne', 'ped'], pedpulp: ['Materiał do pulpotomii / pulpektomii', 'ped'], sdf: ['Diamina fluorku srebra (SDF)', 'ped'],
  powder: ['Proszek do piaskowania', 'hig'], paste: ['Pasta profilaktyczna', 'hig'], oralcare: ['Środki do higieny domowej', 'hig'],
  osteo: ['Osteosynteza (płytki, śruby)', 'mfs'], tmjmat: ['Preparaty do iniekcji (SSŻ)', 'mfs'],
  laser: ['Laser', 'all'],
};
export const EXTRA_PRODUCTS = {
  composite: ['Omnichroma', 'Venus Pearl', 'Venus Diamond', 'Harmonize', 'Gradia Direct', 'Admira Fusion', 'Ceram.x Spectra ST', 'Beautifil II', 'SDR flow+', 'G-ænial Universal Injectable', 'Tetric EvoFlow', 'Filtek Supreme Flowable'],
  anesth: ['Lignocaina 2%', 'Citanest 3% z oktapresyną', 'żel do znieczulenia powierzchniowego (benzokaina)'],
  imaging: ['zdjęcie cefalometryczne', 'zdjęcie zgryzowe', 'skan wewnątrzustny', 'fotografia kliniczna'],
  liner: ['Vitrebond', 'Ionoseal', 'TheraCal LC', 'Dycal', 'Life (Kerr)', 'Calcimol LC', 'ACTIVA BioACTIVE Base/Liner', 'Biodentine'],
  gic: ['Fuji IX GP', 'Fuji IX GP Extra', 'EQUIA Forte HT', 'Ketac Molar', 'Ketac Universal', 'Riva Self Cure', 'ChemFil Rock', 'Fuji II LC', 'Ionolux', 'Dyract XP (kompomer)', 'Compoglass F (kompomer)', 'Twinky Star (kompomer)'],
  matrix: ['Palodent V3', 'Palodent 360', 'Composi-Tight 3D Fusion', 'Quickmat Deluxe', 'Tofflemire', 'Unimatrix', 'Slick Bands', 'kliny drewniane / plastikowe', 'paski celuloidowe'],
  curing: ['Elipar DeepCure-S', 'Bluephase G4', 'Bluephase PowerCure', 'VALO Grand', 'Woodpecker LED.F', 'Demi Plus'],
  polish: ['Sof-Lex', 'Enhance', 'OptraPol', 'OptraGloss', 'Diacomp Plus Twist', 'Kenda', 'Jiffy', 'paski polerskie Sof-Lex'],
  bleach: ['Opalescence Boost', 'Opalescence PF', 'Opalescence Go', 'Philips Zoom WhiteSpeed', 'Philips Zoom NiteWhite', 'Pola Office+', 'Pola Night', 'White Dental Beauty', 'Opalescence Endo'],
  desens: ['Gluma Desensitizer', 'Clinpro XT Varnish', 'Bifluorid 12', 'Shield Force Plus', 'Telio CS Desensitizer', 'Admira Protect', 'MI Paste Plus'],
  suture: ['Vicryl 4-0', 'Vicryl Rapide 4-0', 'Safil 4-0', 'Supramid 4-0', 'Seralon 5-0', 'Prolene 5-0', 'Monocryl 5-0', 'Cytoplast PTFE', 'Resolon 5-0', 'jedwab 3-0'],
  hemostat: ['Spongostan Dental', 'Gelatamp', 'Surgicel', 'Hemocollagene', 'Alveogyl', 'Lyostypt', 'TachoSil', 'wosk kostny'],
  surgtools: ['Piezosurgery (Mectron)', 'Woodpecker Ultrasurgery', 'Satelec Piezotome', 'kleszcze ekstrakcyjne', 'dźwignie Beina', 'periotom', 'Benex (ekstraktor korzeni)', 'kątnica chirurgiczna'],
  prf: ['PRF', 'A-PRF', 'i-PRF', 'CGF (Medifuge)', 'PRP'],
  implsys: ['Straumann BLX', 'Straumann BLT', 'Straumann TLX', 'NobelActive', 'NobelParallel CC', 'Osstem TSIII', 'Osstem SOI', 'MegaGen AnyRidge', 'MegaGen BlueDiamond', 'Dentium SuperLine', 'Dentium NR Line', 'Neodent Helix GM', 'BEGO Semados', 'Alpha-Bio NeO', 'MIS C1', 'MIS V3', 'BioHorizons Tapered', 'Zimmer TSV', 'Bredent copaSKY', 'Anthogyr Axiom', 'Ankylos', 'Astra Tech EV', 'Implant Direct Legacy', 'C-Tech Esthetic Line'],
  implmotor: ['W&H Implantmed', 'NSK Surgic Pro2', 'Bien-Air Chiropro', 'Osstem MS Pro'],
  isq: ['Osstell Beacon', 'Osstell IDx', 'Penguin RFA'],
  abut: ['łącznik tytanowy standardowy', 'łącznik indywidualny CAD/CAM', 'Ti-base', 'Multi-Unit', 'łącznik cyrkonowy', 'Locator', 'zatrzask kulowy'],
  bone: ['Bio-Oss', 'Bio-Oss Collagen', 'cerabone', 'maxresorb', 'OsteoBiol Gen-Os', 'OsteoBiol mp3', 'Endobon', 'easy-graft', 'NovaBone', 'kość autogenna'],
  membrane: ['Bio-Gide', 'Jason membrane', 'OsteoBiol Evolution', 'Cytoplast TXT-200', 'Cytoplast Ti-250', 'BEGO Collagen Membrane', 'OSSIX Plus', 'siatka tytanowa'],
  perioinst: ['EMS AIRFLOW Prophylaxis Master', 'EMS Piezon', 'EMS AIRFLOW One', 'Satelec P5 Newtron', 'Woodpecker UDS', 'NSK Varios', 'Cavitron', 'Mectron Combi touch', 'końcówka PS (Perio Slim)'],
  curette: ['kirety Gracey (Hu-Friedy)', 'kirety Columbia', 'kirety Mini Five', 'sierpy', 'sonda UNC-15', 'sonda WHO', 'sonda Nabersa'],
  periolocal: ['Elyzol', 'PerioChip', 'Chlorhexamed żel 1%', 'Corsodyl', 'Atridox', 'Ligosan', 'Gengigel', 'Perio Plus+'],
  softgraft: ['przeszczep łącznotkankowy (CTG) z podniebienia', 'wolny przeszczep dziąsłowy (FGG)', 'mucoderm', 'Geistlich Mucograft', 'Geistlich Fibro-Gide', 'Mucograft Seal'],
  regen: ['Emdogain', 'Osteogain', 'Bio-Oss + Bio-Gide', 'PerioGlas', 'hyaDENT BG'],
  splintmat: ['everStick PERIO', 'Ribbond', 'G-Fix', 'drut ortodontyczny + kompozyt', 'Dentapreg'],
  impression: ['Impregum Penta', 'Express XT', 'Aquasil Ultra+', 'Honigum Pro', 'Panasil', 'Zetaplus / Oranwash', 'Elite HD+', 'Hydrogum 5 (alginat)', 'Orthoprint (alginat)', 'Ypeen (alginat)', 'Futar (rejestracja zwarcia)', '3Shape TRIOS 5', 'iTero Element 5D', 'Medit i700', 'Medit i900', 'Primescan', 'Aoralscan 3'],
  crownmat: ['cyrkon monolityczny', 'cyrkon licowany porcelaną', 'IPS e.max CAD', 'IPS e.max Press', 'metalowo-ceramiczna (CoCr)', 'metalowo-ceramiczna na złocie', 'Katana Zirconia', 'Prettau', 'VITA Enamic', 'Celtra Duo', 'Cerasmart', 'PMMA', 'kompozyt laboratoryjny', 'porcelana skaleniowa'],
  tempmat: ['Protemp 4', 'Luxatemp Star', 'Structur 3', 'Integrity', 'Telio CS C&B', 'TempBond NE', 'Freegenol'],
  cadcam: ['CEREC', 'inLab', 'Planmeca PlanMill', 'Roland DWX', 'drukarka 3D (Formlabs / SprintRay)'],
  denture: ['akryl Superacryl Plus', 'Vertex', 'Paladon', 'szkielet CoCr', 'Valplast', 'acetal', 'zęby SR Phonares', 'zęby Major', 'Rebase II', 'GC Reline', 'Ufi Gel'],
  brackets: ['3M Victory Series', '3M Clarity Advanced', '3M SmartClip', 'Damon Q2', 'Damon Clear', 'Empower 2', 'In-Ovation', 'Forestadent BioQuick', 'GAC Experience', 'Symetri Clear', 'Incognito (lingwalny)'],
  aligners: ['Invisalign', 'Spark', 'ClearCorrect', 'Angel Aligner', 'Orthocaps', 'SureSmile Aligners', 'nakładki wykonane w gabinecie'],
  wires: ['NiTi .012', 'NiTi .014', 'NiTi .016', 'NiTi .016×.022', 'NiTi .018×.025', 'CuNiTi .014×.025', 'TMA .017×.025', 'stal .016×.022', 'stal .019×.025'],
  orthoadh: ['Transbond XT', 'Transbond Plus SEP', 'GC Ortho Connect', 'Blugloo', 'Grengloo', 'Light Bond'],
  removable: ['płytka Schwarza', 'Twin Block', 'Bionator Baltersa', 'regulator funkcji Fränkla', 'aktywator Andresena-Häupla', 'Myobrace', 'Trainer T4K', 'maska twarzowa (Delaire)', 'headgear'],
  tad: ['Benefit', 'Dual-Top', 'tomas-pin (Dentaurum)', 'Aarhus', 'VectorTAS', 'Spider Screw'],
  retainer: ['retainer stały (drut skręcany)', 'Ortho FlexTech', 'szyna Essix', 'Vivera', 'płytka Hawleya', 'Zendura', 'Erkodur'],
  sealant: ['Helioseal F Plus', 'Fissurit FX', 'Clinpro Sealant', 'Grandio Seal', 'Fuji Triage', 'UltraSeal XT plus'],
  fluoride: ['Duraphat', 'Fluor Protector S', 'Profluorid Varnish', 'Embrace Varnish', 'Clinpro White Varnish', 'Bifluorid 12', 'Elmex gelée', 'MI Varnish'],
  pedcrown: ['korony stalowe 3M', 'NuSmile ZR', 'Kinder Krowns', 'korony celuloidowe (strip crown)', 'Cheng Crowns'],
  pedpulp: ['Biodentine', 'MTA Angelus', 'NeoPutty', 'siarczan żelaza (Astringedent)', 'Vitapex', 'Metapex', 'Endoflas', 'Calxyl', 'Pulpotec'],
  sdf: ['Riva Star', 'Advantage Arrest', 'Saforide'],
  powder: ['AIRFLOW Plus (erytrytol)', 'AIRFLOW Classic Comfort', 'Clinpro Glycine Prophy Powder', 'Perio-Mate', 'Lunos Gentle Clean', 'wodorowęglan sodu'],
  paste: ['Cleanic', 'Detartrine', 'Proxyt', 'Nupro', 'CleanJoy', 'Lunos'],
  oralcare: ['szczoteczka soniczna', 'szczoteczki międzyzębowe (Curaprox / TePe)', 'nić dentystyczna', 'irygator', 'płukanka z CHX (krótko)', 'pasta z fluorem 1450 ppm', 'Duraphat 5000'],
  osteo: ['ChM (płytki tytanowe)', 'KLS Martin', 'DePuy Synthes', 'Stryker', 'Medartis MODUS', 'Medicon', 'szyny Schuchardta', 'śruby IMF'],
  tmjmat: ['kwas hialuronowy', 'i-PRF', 'toksyna botulinowa', 'sól fizjologiczna (płukanie)'],
  laser: ['Fotona LightWalker', 'Biolase Waterlase', 'Biolase Epic X', 'laser diodowy', 'laser biostymulacyjny'],
};
/** Which material categories belong to which specialty (shared ones come first for everyone). */
export const SPEC_CATS = {
  zach: ['composite', 'adhesive', 'liner', 'gic', 'matrix', 'curing', 'polish', 'isolation', 'bleach', 'desens', 'temp'],
  endo: ['files', 'glide', 'apex', 'motor', 'activation', 'sealer', 'obtsys', 'repair', 'medic', 'temp', 'isolation', 'micro'],
  chir: ['anesth', 'suture', 'hemostat', 'surgtools', 'prf', 'bone', 'membrane'],
  impl: ['implsys', 'implmotor', 'isq', 'abut', 'bone', 'membrane', 'prf', 'suture'],
  perio: ['perioinst', 'curette', 'periolocal', 'softgraft', 'regen', 'splintmat', 'suture'],
  prot: ['impression', 'crownmat', 'cement', 'tempmat', 'post', 'cadcam', 'denture'],
  orto: ['brackets', 'aligners', 'wires', 'orthoadh', 'removable', 'tad', 'retainer'],
  ped: ['sealant', 'fluoride', 'pedcrown', 'pedpulp', 'gic', 'sdf', 'composite'],
  mfs: ['osteo', 'suture', 'bone', 'membrane', 'tmjmat', 'anesth'],
  hig: ['perioinst', 'powder', 'paste', 'fluoride', 'oralcare'],
  all: ['anesth', 'imaging', 'micro', 'laser', 'other'],
};

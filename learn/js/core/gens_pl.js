/* Generatory do języka polskiego: ortografia, gramatyka, słownictwo. Słowa z krótkimi uzasadnieniami reguł. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const { pick, shuffle } = U;
  const G = LA.gens;
  const S = LA.STRETCH;

  const gapMC = (word, gapWord, options, ans, why) => ({
    type: 'mc', fixed: true, q: `Uzupełnij lukę: **${gapWord}**`, options, answer: options.indexOf(ans),
    explain: `Piszemy **${word}**. ${why}`, sayAfter: word,
  });

  /* ---------- ó / u ---------- */
  const OU = [
    ['stół', 'st_ł', 'ó', 'ó wymienia się na o: stół – stoły.'], ['wóz', 'w_z', 'ó', 'ó wymienia się na o: wóz – wozy.'], ['sól', 's_l', 'ó', 'ó wymienia się na o: sól – solić.'],
    ['mój', 'm_j', 'ó', 'ó wymienia się na o: mój – moja.'], ['lód', 'l_d', 'ó', 'ó wymienia się na o: lód – lody.'], ['nóż', 'n_ż', 'ó', 'ó wymienia się na o: nóż – noże.'],
    ['dół', 'd_ł', 'ó', 'ó wymienia się na o: dół – doły.'], ['ból', 'b_l', 'ó', 'ó wymienia się na o: ból – boleć.'], ['łódka', 'ł_dka', 'ó', 'ó wymienia się na o: łódka – łodzie.'],
    ['zrób', 'zr_b', 'ó', 'ó wymienia się na o: zrób – zrobić.'], ['pióro', 'pi_ro', 'ó', 'ó wymienia się na e: pióro – pierze.'], ['wiózł', 'wi_zł', 'ó', 'ó wymienia się na e: wiózł – wiezie.'],
    ['róża', 'r_ża', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'], ['góra', 'g_ra', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'], ['ogórek', 'og_rek', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'],
    ['krótki', 'kr_tki', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'], ['półka', 'p_łka', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'], ['żółw', 'ż_łw', 'ó', 'To ó niewymienne — trzeba je zapamiętać.'],
    ['ósemka', '_semka', 'ó', 'Na początku wyrazu piszemy u, ale wyjątki to: ósmy, ósemka, ów.'], ['kotów', 'kot_w', 'ó', 'Końcówkę -ów piszemy przez ó: kotów, domów.'],
    ['kreskówka', 'kresk_wka', 'ó', 'Zakończenie -ówka piszemy przez ó: kreskówka, pocztówka.'], ['pocztówka', 'poczt_wka', 'ó', 'Zakończenie -ówka piszemy przez ó.'],
    ['ucho', '_cho', 'u', 'Na początku wyrazu piszemy u: ucho, ulica, uczeń.'], ['ulica', '_lica', 'u', 'Na początku wyrazu piszemy u.'], ['uczeń', '_czeń', 'u', 'Na początku wyrazu piszemy u.'],
    ['kupuje', 'kup_je', 'u', 'Zakończenie -uje piszemy przez u: kupuje, rysuje.'], ['rysuje', 'rys_je', 'u', 'Zakończenie -uje piszemy przez u.'], ['rysunek', 'rys_nek', 'u', 'Zakończenie -unek piszemy przez u: rysunek, ratunek.'],
    ['fartuszek', 'fart_szek', 'u', 'Zakończenie -uszek piszemy przez u: fartuszek, kożuszek.'], ['malutki', 'mal_tki', 'u', 'Zakończenie -utki piszemy przez u: malutki, cieplutki.'],
    ['mucha', 'm_cha', 'u', 'To u — trzeba je zapamiętać.'], ['kura', 'k_ra', 'u', 'To u — trzeba je zapamiętać.'], ['burza', 'b_rza', 'u', 'To u — trzeba je zapamiętać.'], ['kogut', 'kog_t', 'u', 'To u — trzeba je zapamiętać.'],
    ['ogród', 'ogr_d', 'ó', 'ó wymienia się na o: ogród – ogrody.'], ['zakręt', 'zakr_t', null, null],
  ].filter((x) => x[2]);
  G.plOU = () => { const [w, g, a, why] = pick(OU); return gapMC(w, g, ['ó', 'u'], a, why); };

  /* ---------- rz / ż ---------- */
  const RZZ = [
    ['morze', 'mo_e', 'rz', 'rz wymienia się na r: morze – morski.'], ['dworzec', 'dwo_ec', 'rz', 'rz wymienia się na r: dworzec – dworca? Nie — dworzec – dwór.'], ['górze', 'gó_e', 'rz', 'rz wymienia się na r: o górze – góra.'],
    ['kołnierz', 'kołnie_', 'rz', 'rz wymienia się na r: kołnierz – kołnierzyk? Zapamiętaj: kołnierz.'],
    ['lekarz', 'leka_', 'rz', 'Zakończenia -arz, -erz piszemy przez rz: lekarz, kucharz, rycerz.'], ['kucharz', 'kucha_', 'rz', 'Zakończenie -arz piszemy przez rz.'], ['rycerz', 'ryce_', 'rz', 'Zakończenie -erz piszemy przez rz.'],
    ['brzeg', 'b_eg', 'rz', 'Po b, p, d, t, g, k, ch, j, w piszemy rz: brzeg, drzewo, trzy.'], ['drzewo', 'd_ewo', 'rz', 'Po d piszemy rz.'], ['trzy', 't_y', 'rz', 'Po t piszemy rz.'], ['grzyb', 'g_yb', 'rz', 'Po g piszemy rz.'],
    ['krzesło', 'k_esło', 'rz', 'Po k piszemy rz.'], ['przyjaciel', 'p_yjaciel', 'rz', 'Po p piszemy rz.'], ['wrzesień', 'w_esień', 'rz', 'Po w piszemy rz.'], ['chrząszcz', 'ch_ąszcz', 'rz', 'Po ch piszemy rz.'],
    ['może', 'mo_e', 'ż', 'ż wymienia się na g: może – mogę.'], ['dróżka', 'dró_ka', 'ż', 'ż wymienia się na g: dróżka – droga.'], ['drużyna', 'dru_yna', 'ż', 'ż wymienia się na h: drużyna – druh.'],
    ['kożuch', 'ko_uch', 'ż', 'ż wymienia się na z: kożuch – koza.'], ['wożę', 'wo_ę', 'ż', 'ż wymienia się na z: wożę – wozić.'],
    ['żaba', '_aba', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'], ['żółty', '_ółty', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'], ['żyrafa', '_yrafa', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'],
    ['plaża', 'pla_a', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'], ['żuk', '_uk', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'], ['róża', 'ró_a', 'ż', 'To ż niewymienne — trzeba je zapamiętać.'],
  ].filter((x) => x[0] !== 'dworzec' && x[0] !== 'kołnierz');
  RZZ.push(['dworzec', 'dwo_ec', 'rz', 'rz wymienia się na r: dworzec – dwór.']);
  G.plRZ = () => { const [w, g, a, why] = pick(RZZ); return gapMC(w, g, ['rz', 'ż'], a, why); };

  /* ---------- ch / h ---------- */
  const CHH = [
    ['dach', 'da_', 'ch', 'Na końcu wyrazu piszemy ch: dach, mech, brzuch.'], ['mech', 'me_', 'ch', 'Na końcu wyrazu piszemy ch.'], ['brzuch', 'brzu_', 'ch', 'Na końcu wyrazu piszemy ch.'], ['groch', 'gro_', 'ch', 'Na końcu wyrazu piszemy ch.'],
    ['schody', 's_ody', 'ch', 'Po s piszemy ch: schody, schronisko.'], ['schronisko', 's_ronisko', 'ch', 'Po s piszemy ch.'],
    ['mucha', 'mu_a', 'ch', 'ch wymienia się na sz: mucha – musze.'], ['ucho', 'u_o', 'ch', 'ch wymienia się na sz: ucho – uszy.'], ['cicho', 'ci_o', 'ch', 'ch wymienia się na sz: cicho – cisza.'], ['suchy', 'su_y', 'ch', 'ch wymienia się na sz: suchy – susza.'],
    ['chleb', '_leb', 'ch', 'To ch — trzeba je zapamiętać.'], ['chmura', '_mura', 'ch', 'To ch — trzeba je zapamiętać.'],
    ['druh', 'dru_', 'h', 'h wymienia się na ż: druh – drużyna.'], ['herbata', '_erbata', 'h', 'To h niewymienne — zapamiętaj.'], ['hulajnoga', '_ulajnoga', 'h', 'To h niewymienne — zapamiętaj.'],
    ['hamak', '_amak', 'h', 'To h niewymienne — zapamiętaj.'], ['hałas', '_ałas', 'h', 'To h niewymienne — zapamiętaj.'], ['huśtawka', '_uśtawka', 'h', 'To h niewymienne — zapamiętaj.'], ['harcerz', '_arcerz', 'h', 'To h niewymienne — zapamiętaj.'], ['hokej', '_okej', 'h', 'To h niewymienne — zapamiętaj.'],
  ];
  G.plCH = () => { const [w, g, a, why] = pick(CHH); return gapMC(w, g, ['ch', 'h'], a, why); };

  G.plOrto = (a) => pick([G.plOU, G.plRZ, G.plCH])(a);
  /* Dyktando z wyrazów z trudnościami ortograficznymi */
  G.plDyktando = (a) => {
    const all = OU.concat(RZZ, CHH);
    const [w, , , why] = pick(a.set === 'ou' ? OU : a.set === 'rz' ? RZZ : a.set === 'ch' ? CHH : all);
    return { type: 'input', dictation: true, q: '', say: w, answer: [w], explain: `Piszemy **${w}**. ${why}` };
  };
  S.plDyktando = () => ({});

  /* ---------- wielka litera ---------- */
  const CAPS = [
    ['Warszawa', 'warszawa', 'Nazwy miast piszemy wielką literą.'], ['Wisła', 'wisła', 'Nazwy rzek piszemy wielką literą.'], ['Tatry', 'tatry', 'Nazwy gór piszemy wielką literą.'], ['Polska', 'polska', 'Nazwy państw piszemy wielką literą.'],
    ['Ania', 'ania', 'Imiona piszemy wielką literą.'], ['Kowalski', 'kowalski', 'Nazwiska piszemy wielką literą.'], ['Burek', 'burek', 'Imiona zwierząt piszemy wielką literą.'], ['Bałtyk', 'bałtyk', 'Nazwy mórz piszemy wielką literą.'],
    ['Wielkanoc', 'wielkanoc', 'Nazwy świąt piszemy wielką literą.'], ['Polak', 'polak', 'Nazwy mieszkańców państw piszemy wielką literą (ale przymiotnik „polski” małą).'],
  ];
  const LOWER = [['poniedziałek', 'Dni tygodnia piszemy małą literą.'], ['styczeń', 'Nazwy miesięcy piszemy małą literą.'], ['polski', 'Przymiotniki od nazw państw piszemy małą literą: polski, angielski.'], ['wiosna', 'Pory roku piszemy małą literą.'], ['angielski', 'Przymiotniki od nazw państw piszemy małą literą.'], ['sobota', 'Dni tygodnia piszemy małą literą.']];
  G.plCaps = () => {
    if (Math.random() < 0.5) {
      const [W, w, why] = pick(CAPS);
      return { type: 'mc', fixed: true, q: `Jak poprawnie zapisać? (to nazwa własna lub szczególna)`, options: [W, w], answer: 0, explain: why };
    }
    const [w, why] = pick(LOWER);
    const W = w[0].toUpperCase() + w.slice(1);
    return { type: 'mc', fixed: true, q: `Jak poprawnie zapisać ten wyraz w środku zdania?`, options: [W, w], answer: 1, explain: why + ' (Uwaga: po angielsku Monday i January piszemy wielką literą!)' };
  };

  /* ---------- części mowy ---------- */
  const POS = [
    ['kot', 'rzeczownik'], ['szkoła', 'rzeczownik'], ['radość', 'rzeczownik'], ['drzewo', 'rzeczownik'], ['Ania', 'rzeczownik'],
    ['biegnie', 'czasownik'], ['czyta', 'czasownik'], ['pisałam', 'czasownik'], ['śpiewać', 'czasownik'], ['będzie grać', 'czasownik'],
    ['zielony', 'przymiotnik'], ['wesoła', 'przymiotnik'], ['wysokie', 'przymiotnik'], ['puszysty', 'przymiotnik'], ['mądra', 'przymiotnik'],
  ];
  const POS4 = POS.concat([['szybko', 'przysłówek'], ['cicho', 'przysłówek'], ['wczoraj', 'przysłówek'], ['pięć', 'liczebnik'], ['trzeci', 'liczebnik'], ['na', 'przyimek'], ['pod', 'przyimek'], ['i', 'spójnik'], ['ale', 'spójnik']]);
  const POS_Q = { rzeczownik: 'kto? co?', czasownik: 'co robi? co się z nim dzieje?', przymiotnik: 'jaki? jaka? jakie?', przysłówek: 'jak? kiedy? gdzie?', liczebnik: 'ile? który z kolei?', przyimek: 'łączy się z rzeczownikiem: na, pod, w, za', spójnik: 'łączy wyrazy i zdania: i, a, ale, lub' };
  G.plPOS = (a) => {
    const list = a.level === 4 ? POS4 : POS;
    const [w, cls] = pick(list);
    const all = a.level === 4 ? ['rzeczownik', 'czasownik', 'przymiotnik', 'przysłówek', 'liczebnik', 'przyimek', 'spójnik'] : ['rzeczownik', 'czasownik', 'przymiotnik'];
    const opts = a.level === 4 ? shuffle([cls, ...shuffle(all.filter((x) => x !== cls)).slice(0, 3)]) : all;
    return { type: 'mc', fixed: a.level !== 4, q: `Jaką częścią mowy jest wyraz **${w}**?`, options: opts, answer: opts.indexOf(cls), explain: `**${w}** to ${cls} — odpowiada na pytanie: ${POS_Q[cls]}.` };
  };
  S.plPOS = () => ({ level: 4 });

  /* ---------- rodzaj rzeczownika ---------- */
  const GENDER = [['stół', 'męski'], ['kot', 'męski'], ['koń', 'męski'], ['ołówek', 'męski'], ['lampa', 'żeński'], ['kawa', 'żeński'], ['noc', 'żeński'], ['mysz', 'żeński'], ['pani', 'żeński'], ['okno', 'nijaki'], ['dziecko', 'nijaki'], ['słońce', 'nijaki'], ['imię', 'nijaki'], ['jabłko', 'nijaki']];
  G.plGender = () => {
    const [w, g] = pick(GENDER);
    const opts = ['męski', 'żeński', 'nijaki'];
    const pron = { męski: 'ten', żeński: 'ta', nijaki: 'to' }[g];
    return { type: 'mc', fixed: true, q: `Jaki rodzaj ma rzeczownik **${w}**?`, options: opts, answer: opts.indexOf(g), explain: `Mówimy: **${pron} ${w}**. „ten” – rodzaj męski, „ta” – żeński, „to” – nijaki.` };
  };

  /* ---------- liczba mnoga ---------- */
  const PLURAL = [['kot', 'koty'], ['pies', 'psy'], ['dziecko', 'dzieci'], ['człowiek', 'ludzie'], ['oko', 'oczy'], ['ucho', 'uszy'], ['ręka', 'ręce'], ['kwiat', 'kwiaty'], ['dom', 'domy'], ['krzesło', 'krzesła'], ['ptak', 'ptaki'], ['okno', 'okna'], ['brat', 'bracia'], ['nauczyciel', 'nauczyciele']];
  G.plPlural = () => { const [s, p] = pick(PLURAL); return { type: 'input', q: `Napisz wyraz **${s}** w liczbie mnogiej (jeden → wiele).`, answer: [p], explain: `${s} → ${p}. Niektóre wyrazy zmieniają się nieregularnie: człowiek → ludzie, dziecko → dzieci.` }; };

  /* ---------- antonimy, synonimy, zdrobnienia ---------- */
  const ANT = [['wysoki', 'niski'], ['szybki', 'wolny'], ['ciepły', 'zimny'], ['dzień', 'noc'], ['początek', 'koniec'], ['wesoły', 'smutny'], ['pełny', 'pusty'], ['otworzyć', 'zamknąć'], ['głośno', 'cicho'], ['jasny', 'ciemny'], ['stary', 'młody'], ['mokry', 'suchy']];
  G.plAntonym = () => { const [w, a] = pick(ANT); const opts = shuffle([a, ...shuffle(ANT.filter((x) => x[0] !== w).map((x) => x[1])).slice(0, 3)]); return { type: 'mc', q: `Wybierz wyraz o **przeciwnym** znaczeniu do **${w}**.`, options: opts, answer: opts.indexOf(a), explain: `${w} ↔ ${a} — to wyrazy o przeciwnym znaczeniu (antonimy).` }; };
  const SYN = [['duży', 'wielki'], ['ładny', 'piękny'], ['szybko', 'prędko'], ['wesoły', 'radosny'], ['zmęczony', 'znużony'], ['mądry', 'bystry'], ['mówić', 'rzec'], ['dom', 'budynek'], ['zaczynać', 'rozpoczynać'], ['przyjaciel', 'kolega']];
  G.plSynonym = () => { const [w, s] = pick(SYN); const opts = shuffle([s, ...shuffle(SYN.filter((x) => x[0] !== w).map((x) => x[1])).slice(0, 3)]); return { type: 'mc', q: `Wybierz wyraz o **podobnym** znaczeniu do **${w}**.`, options: opts, answer: opts.indexOf(s), explain: `${w} i ${s} znaczą prawie to samo (wyrazy bliskoznaczne).` }; };
  const DIM = [['kot', 'kotek'], ['dom', 'domek'], ['ręka', 'rączka'], ['noga', 'nóżka'], ['książka', 'książeczka'], ['pies', 'piesek'], ['kwiat', 'kwiatek'], ['las', 'lasek'], ['głowa', 'główka'], ['słońce', 'słoneczko']];
  G.plDiminutive = () => { const [w, d] = pick(DIM); return { type: 'input', q: `Utwórz zdrobnienie od wyrazu **${w}**.`, answer: [d], explain: `${w} → ${d}. Uwaga na wymianę: noga → nóżka, głowa → główka (ó!).` }; };

  /* ---------- nie z czasownikami i przymiotnikami ---------- */
  const NIE = [['nie idę', 'nieidę', 0, 'Nie z czasownikami piszemy osobno.'], ['nie wiem', 'niewiem', 0, 'Nie z czasownikami piszemy osobno.'], ['nie lubię', 'nielubię', 0, 'Nie z czasownikami piszemy osobno.'], ['nie śpi', 'niespi', 0, 'Nie z czasownikami piszemy osobno.'],
    ['niewysoki', 'nie wysoki', 0, 'Nie z przymiotnikami piszemy razem.'], ['nieduży', 'nie duży', 0, 'Nie z przymiotnikami piszemy razem.'], ['niegrzeczny', 'nie grzeczny', 0, 'Nie z przymiotnikami piszemy razem.'], ['nieprawda', 'nie prawda', 0, 'Nie z rzeczownikami piszemy razem.'], ['nie ma', 'niema', 0, '„nie ma” zawsze piszemy osobno — to czasownik.']];
  G.plNie = () => { const [good, bad, , why] = pick(NIE); const opts = shuffle([good, bad]); return { type: 'mc', fixed: true, q: `Który zapis jest poprawny?`, options: opts, answer: opts.indexOf(good), explain: why }; };

  /* ---------- głoski i litery ---------- */
  const SOUNDS = [['szafa', 5, 4, 'sz-a-f-a'], ['chata', 5, 4, 'ch-a-t-a'], ['rzeka', 5, 4, 'rz-e-k-a'], ['mucha', 5, 4, 'm-u-ch-a'], ['czapka', 6, 5, 'cz-a-p-k-a'], ['szkoła', 6, 5, 'sz-k-o-ł-a'], ['dzban', 5, 4, 'dz-b-a-n'], ['kot', 3, 3, 'k-o-t'], ['lampa', 5, 5, 'l-a-m-p-a']];
  G.plSounds = () => {
    const [w, l, g, split] = pick(SOUNDS);
    if (Math.random() < 0.5) return { type: 'input', numeric: true, q: `Ile **liter** ma wyraz **${w}**?`, answer: l, explain: `Litery piszemy: ${w.split('').join('-')} → ${l}.` };
    return { type: 'input', numeric: true, q: `Ile **głosek** słyszymy w wyrazie **${w}**?`, answer: g, explain: `Głoski słyszymy: ${split} → ${g}. Dwuznaki (sz, cz, rz, ch, dz) to jedna głoska, ale dwie litery.` };
  };

  /* ---------- rodzaje zdań ---------- */
  const SENT = [['Czy pójdziesz ze mną do parku', 'pytające', '?'], ['Zamknij okno', 'rozkazujące', '.'], ['Jutro jedziemy nad morze', 'oznajmujące', '.'], ['Ale piękna tęcza', 'wykrzyknikowe', '!'], ['Gdzie jest mój plecak', 'pytające', '?'], ['Uważaj na schodach', 'rozkazujące', '!'], ['Mój kot ma na imię Mruczek', 'oznajmujące', '.']];
  G.plSentence = () => {
    const [s, kind, p] = pick(SENT);
    if (Math.random() < 0.5) { const opts = ['oznajmujące', 'pytające', 'rozkazujące', 'wykrzyknikowe']; return { type: 'mc', fixed: true, q: `Jakie to zdanie? **${s}${p}**`, options: opts, answer: opts.indexOf(kind), explain: `Zdanie oznajmujące coś stwierdza, pytające o coś pyta, rozkazujące wydaje polecenie, wykrzyknikowe wyraża silne uczucia.` }; }
    return { type: 'mc', fixed: true, q: `Jaki znak postawisz na końcu? **${s}___**`, options: ['.', '?', '!'], answer: ['.', '?', '!'].indexOf(p), explain: `To zdanie ${kind}. ${kind === 'pytające' ? 'Na końcu pytania stawiamy znak zapytania.' : kind === 'wykrzyknikowe' ? 'Silne uczucia oznaczamy wykrzyknikiem.' : 'Zdania oznajmujące kończymy kropką; rozkazujące kropką lub wykrzyknikiem.'}` };
  };

  /* ---------- czas czasownika ---------- */
  const TENSE = [['pisałam', 'przeszły'], ['czytałem', 'przeszły'], ['biegaliśmy', 'przeszły'], ['piszę', 'teraźniejszy'], ['czytasz', 'teraźniejszy'], ['śpiewamy', 'teraźniejszy'], ['będę pisać', 'przyszły'], ['pojedziemy', 'przyszły'], ['będzie padać', 'przyszły']];
  G.plTense = () => { const [w, t] = pick(TENSE); const opts = ['przeszły', 'teraźniejszy', 'przyszły']; return { type: 'mc', fixed: true, q: `W jakim czasie jest czasownik **${w}**?`, options: opts, answer: opts.indexOf(t), explain: `Czas przeszły — co się działo (wczoraj), teraźniejszy — co się dzieje (teraz), przyszły — co będzie się działo (jutro). „${w}” to czas ${t}.` }; };
  /* ---------- klasa 4: przypadki, stopniowanie, części zdania ---------- */
  const CASES = [['mianownik', 'kto? co?'], ['dopełniacz', 'kogo? czego?'], ['celownik', 'komu? czemu?'], ['biernik', 'kogo? co?'], ['narzędnik', '(z) kim? (z) czym?'], ['miejscownik', '(o) kim? (o) czym?'], ['wołacz', 'o!']];
  const CASE_ITEMS = [
    ['Nie mam **kota**.', 'kota', 'dopełniacz'], ['Daję prezent **mamie**.', 'mamie', 'celownik'], ['Widzę **las**.', 'las', 'biernik'], ['Idę z **bratem**.', 'bratem', 'narzędnik'], ['Myślę o **wakacjach**.', 'wakacjach', 'miejscownik'],
    ['**Mamo**, chodź tutaj!', 'Mamo', 'wołacz'], ['**Pies** szczeka.', 'Pies', 'mianownik'], ['Boję się **burzy**.', 'burzy', 'dopełniacz'], ['Pomagam **koledze**.', 'koledze', 'celownik'], ['Piszę **ołówkiem**.', 'ołówkiem', 'narzędnik'],
    ['Opowiadam o **smoku**.', 'smoku', 'miejscownik'], ['Kocham **babcię**.', 'babcię', 'biernik'], ['**Ania** czyta.', 'Ania', 'mianownik'], ['Nie lubię **szpinaku**.', 'szpinaku', 'dopełniacz'], ['Jadę **rowerem**.', 'rowerem', 'narzędnik'], ['**Kasiu**, pomóż mi!', 'Kasiu', 'wołacz'],
  ];
  G.plCase = () => {
    const [sent, w, c] = pick(CASE_ITEMS);
    const names = CASES.map((x) => x[0]);
    const opts = shuffle([c, ...shuffle(names.filter((n) => n !== c)).slice(0, 3)]);
    const qq = CASES.find((x) => x[0] === c)[1];
    return { type: 'mc', q: `W jakim przypadku jest wyróżniony wyraz? ${sent}`, options: opts, answer: opts.indexOf(c), explain: `**${w}** odpowiada na pytanie **${qq}** → ${c}. Kolejność: M, D, C, B, N, Ms, W (Ma Dużo Cukru, Bo Na Mleku Wyrosła).` };
  };
  const DEG = [['duży', 'większy', 'największy'], ['mały', 'mniejszy', 'najmniejszy'], ['dobry', 'lepszy', 'najlepszy'], ['zły', 'gorszy', 'najgorszy'], ['szybki', 'szybszy', 'najszybszy'], ['wysoki', 'wyższy', 'najwyższy'], ['ładny', 'ładniejszy', 'najładniejszy'], ['mądry', 'mądrzejszy', 'najmądrzejszy'], ['ciepły', 'cieplejszy', 'najcieplejszy'], ['długi', 'dłuższy', 'najdłuższy']];
  G.plDegree = () => {
    const [a, b, c] = pick(DEG);
    if (Math.random() < 0.5) return { type: 'input', q: `Podaj **stopień wyższy** przymiotnika **${a}**.`, answer: [b], explain: `${a} → ${b} → ${c}. Uwaga na stopniowanie nieregularne: dobry – lepszy, zły – gorszy, duży – większy, mały – mniejszy.` };
    return { type: 'input', q: `Podaj **stopień najwyższy** przymiotnika **${a}**.`, answer: [c], explain: `${a} → ${b} → ${c}. Stopień najwyższy tworzymy, dodając „naj-” do stopnia wyższego.` };
  };
  S.plDegree = () => ({});
  const SP = [['Mały **kot** pije mleko.', 'podmiot'], ['Mały kot **pije** mleko.', 'orzeczenie'], ['**Dzieci** bawią się w parku.', 'podmiot'], ['Dzieci **bawią się** w parku.', 'orzeczenie'], ['Wczoraj **padał** deszcz.', 'orzeczenie'], ['Wczoraj padał **deszcz**.', 'podmiot'], ['**Ola** napisała list.', 'podmiot'], ['Ola **napisała** list.', 'orzeczenie'], ['Nad łąką **latają** motyle.', 'orzeczenie'], ['Nad łąką latają **motyle**.', 'podmiot']];
  G.plSubjPred = () => {
    const [s, k] = pick(SP);
    const opts = ['podmiot', 'orzeczenie'];
    return { type: 'mc', fixed: true, q: `Jaką częścią zdania jest wyróżniony wyraz? ${s}`, options: opts, answer: opts.indexOf(k), explain: k === 'podmiot' ? 'Podmiot odpowiada na pytanie **kto? co?** — wykonuje czynność.' : 'Orzeczenie odpowiada na pytanie **co robi? co się z nim dzieje?** — zwykle jest czasownikiem.' };
  };
  /* wiek z roku (historia kl. 4) */
  G.plCentury = (a) => {
    const big = a.big;
    const y = pick([U.randInt(1, 999), U.randInt(1000, 2026), U.randInt(1000, 2026), [966, 1025, 1410, 1683, 1791, 1918, 1939, 1989, 2004][U.randInt(0, 8)]]);
    const c = Math.ceil(y / 100);
    const round = y % 100 === 0;
    if (big && Math.random() < 0.4) {
      const py = U.randInt(1, 20) * 100 + U.randInt(1, 99);
      const pc = Math.ceil(py / 100);
      return { type: 'input', q: `W którym wieku był rok **${py} p.n.e.**? Wpisz liczbę rzymską.`, answer: [U.toRoman(pc), String(pc)], explain: `Przed naszą erą liczymy tak samo: ${py} → ${pc}. wiek p.n.e. (${U.toRoman(pc)} w. p.n.e.).` };
    }
    return { type: 'input', q: `W którym wieku był rok **${y}**? Wpisz liczbę rzymską (np. XV).`, answer: [U.toRoman(c), String(c)], explain: round ? `Rok ${y} jest ostatnim rokiem ${U.toRoman(c)} wieku (wiek kończy się na roku „00”).` : `Odrzuć dwie ostatnie cyfry i dodaj 1: ${y} → ${Math.floor(y / 100)} + 1 = ${c} → **${U.toRoman(c)}** wiek.` };
  };
  S.plCentury = () => ({ big: true });
})();

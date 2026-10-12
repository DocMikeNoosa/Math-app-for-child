/* Klasa 4 — język polski (podstawa programowa, II etap edukacyjny). Zadania z gwiazdką wykraczają nieco ponad poziom klasy. */
(function () {
  const { mc, pf, inp, gen, write, dict, star } = LA.Q;

  const T_KLEKS = `Akademia pana Kleksa mieściła się na końcu ulicy Czekoladowej. Przyjmowano do niej tylko chłopców, których imiona zaczynały się na literę A. Pan Kleks miał długą brodę, ogromne okulary i kieszenie pełne różnych dziwnych przedmiotów.\n\nLekcje w Akademii były niezwykłe. Na kleksografii uczniowie robili kleksy atramentem i odczytywali z nich kształty zwierząt. Na lekcji przędzenia liter wyciągali z kłębka czarne literki. Pan Kleks potrafił powiększać się i zmniejszać, a dziurawe przedmioty naprawiał, łatając je… kawałkami ciszy.\n\nNarratorem jest Adaś Niezgódka, który opowiada o swoim pobycie w Akademii.`;
  const T_NARNIA = `Czworo rodzeństwa — Piotr, Zuzanna, Edmund i Łucja — zamieszkało w czasie wojny w starym domu profesora. Pewnego dnia najmłodsza, Łucja, schowała się w ogromnej szafie. Zamiast tylnej ścianki poczuła pod stopami śnieg, a nad sobą zobaczyła gałęzie drzew. Tak trafiła do Narnii — krainy, w której Biała Czarownica sprawiła, że zawsze była zima, ale nigdy nie przychodziło Boże Narodzenie.\n\nPrawowitym królem Narnii był lew Aslan. Gdy powrócił, śnieg zaczął topnieć.`;
  const T_JESIEN = `**Jesień**\n\nPrzyszła jesień ruda, złota,\nw liściach szumi, w deszczu szlocha.\nWiatr — jak urwis — gna przez pola,\nstrąca jabłka z drzew na rolach.\n\nSłońce blade, zaspane,\nchowa się za chmur firanę.\nA ja patrzę spod parasola:\nszaro, mokro… lecz wesoło!`;
  const L_LIST = `Kochana Babciu! Piszę do Ciebie z kolonii nad jeziorem. Codziennie pływamy kajakami, a wieczorem siedzimy przy ognisku i śpiewamy. Wczoraj widziałam czaplę! Mam nową koleżankę, Martę, która mieszka w Poznaniu. Jedzenie jest smaczne, tylko trochę tęsknię za Twoimi pierogami. Wracam w sobotę. Ściskam Cię mocno, Tosia.`;

  LA.addSubject('pl4', {
    id: 'polski',
    intro: 'Lektury i teksty kultury, środki stylistyczne, odmiana wyrazów przez przypadki, osoby i czasy, zdanie i jego części, ortografia, interpunkcja, opowiadanie, opis, list i inne formy wypowiedzi.',
    chapters: [
      {
        id: 'rzeczownik', term: 1, strand: 'Kształcenie językowe', bridge: 'parts-of-speech',
        title: 'Rzeczownik i jego odmiana',
        summary: 'Rzeczowniki własne i pospolite, rodzaj i liczba, odmiana przez przypadki (deklinacja).',
        outcomes: ['Odróżniam rzeczowniki własne i pospolite', 'Znam 7 przypadków i pytania', 'Odmieniam rzeczownik przez przypadki'],
        lessons: [
          {
            id: 'wlasne', title: 'Rzeczowniki własne i pospolite', minutes: 12,
            blocks: [
              { type: 'read', text: '**Rzeczowniki pospolite** nazywają wiele podobnych rzeczy: *miasto, rzeka, pies* — piszemy je **małą literą**.\n**Rzeczowniki własne** nazywają jedną, konkretną rzecz lub osobę: *Kraków, Wisła, Burek, Tosia* — piszemy je **wielką literą**.\n\nRzeczownik ma **rodzaj** (męski, żeński, nijaki) i **liczbę** (pojedynczą, mnogą).' },
              { type: 'vocab', words: [['rzeczownik własny', 'nazwa jednej konkretnej rzeczy', 'proper noun'], ['rzeczownik pospolity', 'nazwa ogólna', 'common noun']] },
            ],
            practice: [
              mc('Który rzeczownik jest własny?', ['góra', 'Giewont', 'szczyt', 'dolina'], 1, 'Giewont to nazwa konkretnego szczytu.'),
              mc('Który rzeczownik jest pospolity?', ['Bałtyk', 'Warszawa', 'jezioro', 'Mazury'], 2, '„jezioro” to nazwa ogólna.'),
              gen('plGender', {}, 2), gen('plPlural', {}, 2),
            ],
          },
          {
            id: 'przypadki', title: 'Siedem przypadków', minutes: 15,
            blocks: [
              { type: 'read', text: 'Rzeczownik **odmienia się przez przypadki** — to **deklinacja**.\n\n- **Mianownik (M.)** — kto? co? → *kot*\n- **Dopełniacz (D.)** — kogo? czego? → *(nie ma) kota*\n- **Celownik (C.)** — komu? czemu? → *(przyglądam się) kotu*\n- **Biernik (B.)** — kogo? co? → *(widzę) kota*\n- **Narzędnik (N.)** — (z) kim? (z) czym? → *(bawię się z) kotem*\n- **Miejscownik (Ms.)** — (o) kim? (o) czym? → *(myślę o) kocie*\n- **Wołacz (W.)** — o! → *kocie!*\n\nZapamiętaj kolejność: **Ma Dużo Cukru, Bo Na Mleku Wyrosła**.' },
              { type: 'tip', text: 'W angielskim nie ma przypadków — dlatego „cat” zawsze wygląda tak samo. W polskim końcówka mówi nam, jaką rolę wyraz pełni w zdaniu.' },
              { type: 'vocab', words: [['przypadek', 'forma rzeczownika zależna od pytania', 'grammatical case'], ['deklinacja', 'odmiana przez przypadki', 'declension'], ['końcówka', 'zmieniająca się część na końcu wyrazu', 'ending']] },
            ],
            practice: [gen('plCase', {}, 6), mc('Jakie pytania ma dopełniacz?', ['kto? co?', 'kogo? czego?', 'komu? czemu?'], 1, 'Dopełniacz: kogo? czego?', { fixed: true })],
          },
          {
            id: 'odmiana', title: 'Odmieniamy rzeczowniki', minutes: 15,
            blocks: [
              { type: 'read', text: 'Odmiana wyrazu **szkoła** (liczba pojedyncza):\n- M. szkoła, D. szkoły, C. szkole, B. szkołę, N. szkołą, Ms. (o) szkole, W. szkoło!\n\nOdmiana pomaga w **ortografii**: *Kraków → w Krakowie* (ó → o), *morze → nad morzem*.' },
            ],
            practice: [
              inp('Wpisz wyraz **kot** w dopełniaczu: Nie ma … .', ['kota'], 'D. (kogo?) kota.'),
              inp('Wpisz wyraz **mama** w celowniku: Daję kwiaty … .', ['mamie'], 'C. (komu?) mamie.'),
              inp('Wpisz wyraz **rower** w narzędniku: Jadę … .', ['rowerem'], 'N. (czym?) rowerem.'),
              inp('Wpisz wyraz **las** w miejscowniku: Spaceruję po … .', ['lesie'], 'Ms. (o czym? po czym?) lesie.'),
              inp('Wpisz wyraz **Kasia** w wołaczu: … , chodź do nas!', ['Kasiu'], 'Wołacz: Kasiu!'),
              gen('plCase', {}, 3),
            ],
          },
          {
            id: 'tematy', title: '★ Temat i końcówka', minutes: 12,
            blocks: [{ type: 'read', text: 'Wyraz odmienny składa się z **tematu** (część stała) i **końcówki** (część zmienna).\n\n*kot-a, kot-u, kot-em* → temat **kot**, końcówki **-a, -u, -em**.\n\nCzasem w temacie zachodzą **oboczności** (wymiany): *stół → stol-e*, *ręka → ręc-e*, *noga → nodz-e*.' }],
            practice: [
              mc('Jaka jest końcówka w wyrazie **książkami**?', ['-ami', 'książ-', '-kami', '-i'], 0, 'Temat: książk-, końcówka: -ami.'),
              mc('W której parze jest oboczność (wymiana) w temacie?', ['dom – domu', 'ręka – ręce', 'okno – okna'], 1, 'k → c: ręka – ręce.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plCase', {}, 6), mc('Który rzeczownik piszemy wielką literą?', ['Bałtyk', 'jezioro', 'rzeka'], 0, 'Bałtyk to nazwa własna morza.'), mc('Ile jest przypadków w języku polskim?', ['5', '6', '7', '8'], 2, 'Siedem.', { fixed: true }), mc('Który przypadek odpowiada na pytanie „z kim? z czym?”?', ['narzędnik', 'celownik', 'biernik'], 0, 'Narzędnik.', { fixed: true })] },
        challenge: [star(mc('W zdaniu „Przyglądam się wiewiórce” wyraz „wiewiórce” jest w…', ['celowniku', 'miejscowniku', 'dopełniaczu'], 0, 'Komu się przyglądam? wiewiórce → celownik.', { fixed: true })), star(mc('Biernik i dopełniacz wyrazu „kot” wyglądają tak samo (kota). Jak je odróżnić?', ['Po pytaniu w zdaniu: widzę kogo? co? (B.) / nie ma kogo? czego? (D.)', 'Nie da się', 'Po długości'], 0, 'Zadajemy pytanie od czasownika.', { fixed: true }))],
      },
      {
        id: 'czasownik', term: 1, strand: 'Kształcenie językowe', bridge: 'parts-of-speech',
        title: 'Czasownik',
        summary: 'Osoba, liczba, czas i rodzaj czasownika; bezokolicznik; pisownia nie z czasownikami; tryb rozkazujący.',
        lessons: [
          {
            id: 'osoba', title: 'Osoba i liczba', minutes: 12,
            blocks: [
              { type: 'read', text: 'Czasownik odmienia się przez **osoby** — to **koniugacja**:\n\n- **1. osoba**: (ja) czytam — (my) czytamy\n- **2. osoba**: (ty) czytasz — (wy) czytacie\n- **3. osoba**: (on, ona, ono) czyta — (oni, one) czytają\n\n**Bezokolicznik** to forma podstawowa: *czytać, pisać, biec*.' },
              { type: 'vocab', words: [['bezokolicznik', 'forma podstawowa czasownika', 'infinitive'], ['osoba', 'kto wykonuje czynność', 'person'], ['koniugacja', 'odmiana przez osoby', 'conjugation']] },
            ],
            practice: [
              mc('W jakiej osobie jest czasownik **piszecie**?', ['1. os. l. mn.', '2. os. l. mn.', '3. os. l. mn.'], 1, '(wy) piszecie → 2. osoba liczby mnogiej.', { fixed: true }),
              mc('W jakiej osobie jest czasownik **biegnę**?', ['1. os. l. poj.', '2. os. l. poj.', '3. os. l. poj.'], 0, '(ja) biegnę.', { fixed: true }),
              mc('Który wyraz to bezokolicznik?', ['śpiewa', 'śpiewać', 'śpiewaliśmy'], 1, 'Bezokolicznik kończy się zwykle na -ć: śpiewać.', { fixed: true }),
              inp('Odmień: (oni) … (czytać)', ['czytają'], 'oni czytają.'),
            ],
          },
          {
            id: 'czasy', title: 'Czasy i rodzaj', minutes: 12,
            blocks: [
              { type: 'read', text: '**Czas przeszły** — co się działo: *pisałem, pisałam, pisało*. W czasie przeszłym widać **rodzaj**: *on czytał, ona czytała, ono czytało*.\n**Czas teraźniejszy** — co się dzieje: *piszę*.\n**Czas przyszły**:\n- prosty: *napiszę*\n- złożony: *będę pisać / będę pisała*' },
            ],
            practice: [gen('plTense', {}, 5), mc('Który czasownik jest w czasie przeszłym, rodzaju żeńskim?', ['czytał', 'czytała', 'czyta'], 1, 'ona czytała.', { fixed: true })],
          },
          {
            id: 'nie-czas', title: 'Pisownia „nie” z czasownikami', minutes: 12,
            blocks: [{ type: 'read', text: '**Nie** z czasownikami piszemy **osobno**: *nie wiem, nie lubię, nie było*.\n\nWyjątki — piszemy **razem**, bo bez „nie” takie wyrazy nie istnieją: *nienawidzić, niepokoić, niedowidzieć, niedosłyszeć*.' }],
            practice: [gen('plNie', {}, 4), mc('Który zapis jest poprawny?', ['nienawidzę', 'nie nawidzę'], 0, 'Wyjątek: nienawidzić piszemy razem.', { fixed: true }), dict('nie wiem', 'Nie wiem, gdzie jest mój zeszyt.')],
          },
          {
            id: 'tryby', title: '★ Tryby czasownika', minutes: 12,
            blocks: [{ type: 'read', text: '- **Oznajmujący** — informuje: *czytam, czytałem*\n- **Rozkazujący** — prośba, polecenie: *czytaj! czytajmy!*\n- **Przypuszczający** — możliwość, z cząstką **-by**: *czytałbym, czytałabyś*\n\nCząstkę **-by** piszemy **razem** z czasownikiem: *poszłabym, zrobiłby*.' }],
            practice: [
              mc('W jakim trybie jest **zamknij**?', ['oznajmującym', 'rozkazującym', 'przypuszczającym'], 1, 'To polecenie.', { fixed: true }),
              mc('Który zapis jest poprawny?', ['poszła bym', 'poszłabym'], 1, '-by z czasownikiem piszemy razem.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plTense', {}, 3), gen('plNie', {}, 3), mc('(my) … (iść)', ['idziemy', 'idą', 'idziecie'], 0, 'my idziemy.', { fixed: true }), mc('Bezokolicznik to…', ['forma podstawowa czasownika', 'czas przyszły', 'osoba'], 0, 'Forma podstawowa.', { fixed: true })] },
        challenge: [star(mc('Ile czasowników w formie osobowej jest w zdaniu: „Gdy wróciłam, mama gotowała, a tata czytał”?', ['2', '3', '4'], 1, 'wróciłam, gotowała, czytał → 3.', { fixed: true }))],
      },
      {
        id: 'przymiotnik', term: 1, strand: 'Kształcenie językowe', bridge: 'parts-of-speech',
        title: 'Przymiotnik, przysłówek, liczebnik',
        summary: 'Stopniowanie przymiotników i przysłówków, liczebniki główne i porządkowe, przyimek i spójnik.',
        lessons: [
          {
            id: 'stopniowanie', title: 'Stopniowanie przymiotników', minutes: 15,
            blocks: [
              { type: 'read', text: 'Przymiotnik ma trzy **stopnie**:\n- **równy**: wysoki\n- **wyższy**: wyższy\n- **najwyższy**: najwyższy\n\nStopniowanie:\n- **proste**: miły – milszy – najmilszy\n- **nieregularne**: dobry – lepszy – najlepszy, zły – gorszy – najgorszy, duży – większy – największy, mały – mniejszy – najmniejszy\n- **opisowe**: zmęczony – **bardziej** zmęczony – **najbardziej** zmęczony' },
            ],
            practice: [gen('plDegree', {}, 6), mc('Który przymiotnik stopniujemy opisowo?', ['ładny', 'kolorowy', 'szybki'], 1, 'bardziej kolorowy, najbardziej kolorowy.', { fixed: true })],
          },
          {
            id: 'przyslowek4', title: 'Przysłówek', minutes: 12,
            blocks: [{ type: 'read', text: '**Przysłówek** określa czasownik i odpowiada na pytania: **jak? gdzie? kiedy?** — *szybko, tutaj, jutro*.\n\nWiele przysłówków powstaje od przymiotników: *cichy → cicho, wesoły → wesoło*.\n\nPrzysłówki też się stopniują: *szybko – szybciej – najszybciej*, *dobrze – lepiej – najlepiej*.\n\n**Nie** z przysłówkami od przymiotników piszemy **razem**: *niedaleko, niewesoło*.' }],
            practice: [gen('plPOS', { level: 4 }, 4), inp('Utwórz przysłówek od przymiotnika **głośny**.', ['głośno'], 'głośny → głośno.'), inp('Podaj stopień wyższy przysłówka **dobrze**.', ['lepiej'], 'dobrze – lepiej – najlepiej.')],
          },
          {
            id: 'liczebnik', title: 'Liczebnik, przyimek, spójnik', minutes: 12,
            blocks: [{ type: 'read', text: '**Liczebnik** — ile? (główny: *pięć, sto*) lub który z kolei? (porządkowy: *piąty, setny*).\n**Przyimek** — łączy się z rzeczownikiem: *na, pod, w, za, przed, obok*.\n**Spójnik** — łączy wyrazy i zdania: *i, a, ale, lecz, oraz, lub, bo, że*.\n\nPrzyimek i spójnik są **nieodmienne**.' }],
            practice: [
              mc('Który liczebnik jest porządkowy?', ['trzy', 'trzeci', 'troje'], 1, 'który z kolei? trzeci.', { fixed: true }),
              mc('Który wyraz jest przyimkiem?', ['pod', 'i', 'szybko'], 0, '„pod stołem” — przyimek.', { fixed: true }),
              mc('Który wyraz jest spójnikiem?', ['ale', 'nad', 'pięć'], 0, '„ale” łączy zdania.', { fixed: true }),
              gen('plPOS', { level: 4 }, 3),
            ],
          },
          {
            id: 'odmienne', title: 'Części mowy odmienne i nieodmienne', minutes: 12,
            blocks: [{ type: 'read', text: '**Odmienne**: rzeczownik, czasownik, przymiotnik, liczebnik, zaimek.\n**Nieodmienne**: przysłówek, przyimek, spójnik, partykuła, wykrzyknik.\n\n(Przysłówek się nie odmienia, ale się stopniuje.)' }],
            practice: [
              mc('Która część mowy jest nieodmienna?', ['rzeczownik', 'przyimek', 'czasownik'], 1, 'Przyimek.', { fixed: true }),
              mc('Która część mowy się odmienia?', ['spójnik', 'przymiotnik', 'przysłówek'], 1, 'Przymiotnik odmienia się przez przypadki, liczby i rodzaje.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plDegree', {}, 4), gen('plPOS', { level: 4 }, 4), mc('Liczebnik główny to…', ['siedem', 'siódmy', 'siódemka'], 0, 'ile? siedem.', { fixed: true })] },
        challenge: [star(mc('Ile przyimków jest w zdaniu: „Kot spał pod stołem, a pies leżał na kanapie obok drzwi”?', ['2', '3', '4'], 1, 'pod, na, obok → 3.', { fixed: true })), star(gen('plDegree', {}, 2))],
      },
      {
        id: 'zdanie', term: 1, strand: 'Kształcenie językowe', bridge: 'sentences',
        title: 'Zdanie i jego części',
        summary: 'Podmiot i orzeczenie, określenia, zdanie pojedyncze i złożone, wykres zdania, równoważnik.',
        lessons: [
          {
            id: 'podmiot', title: 'Podmiot i orzeczenie', minutes: 15,
            blocks: [
              { type: 'read', text: '**Orzeczenie** mówi, co robi podmiot lub co się z nim dzieje (zwykle **czasownik**): *Ptak* **śpiewa**.\n**Podmiot** — kto? co? wykonuje czynność (zwykle **rzeczownik w mianowniku**): **Ptak** *śpiewa*.\n\nRazem tworzą **związek główny** zdania.\n\nCzasem podmiot jest **domyślny**: *Idę do szkoły.* (kto? ja — domyślnie).' },
              { type: 'vocab', words: [['podmiot', 'kto? co? wykonuje czynność', 'subject'], ['orzeczenie', 'co robi? co się dzieje?', 'predicate (verb)']] },
            ],
            practice: [gen('plSubjPred', {}, 6), mc('W zdaniu „Czytam ciekawą książkę” podmiot jest…', ['„książkę”', 'domyślny (ja)', '„ciekawą”'], 1, 'Podmiot domyślny: ja.', { fixed: true })],
          },
          {
            id: 'okreslenia', title: '★ Określenia: przydawka, dopełnienie, okolicznik', minutes: 15,
            blocks: [{ type: 'read', text: 'To części zdania z klasy 5 — dla ambitnych!\n- **przydawka** określa rzeczownik: jaki? czyj? który? — *rudy kot*\n- **dopełnienie** uzupełnia czasownik: kogo? czego? co? — *pije* **mleko**\n- **okolicznik** mówi o okolicznościach: gdzie? kiedy? jak? — *pije* **w kuchni**' }],
            practice: [
              mc('Jaką częścią zdania jest „rudy” w zdaniu „Rudy kot śpi”?', ['przydawka', 'orzeczenie', 'okolicznik'], 0, 'jaki kot? rudy → przydawka.', { fixed: true }),
              mc('Jaką częścią zdania jest „wieczorem” w zdaniu „Wieczorem czytam”?', ['podmiot', 'okolicznik', 'dopełnienie'], 1, 'kiedy? → okolicznik czasu.', { fixed: true }),
            ],
          },
          {
            id: 'zlozone', title: 'Zdanie pojedyncze i złożone', minutes: 12,
            blocks: [{ type: 'read', text: '**Zdanie pojedyncze** ma **jedno** orzeczenie: *Pada deszcz.*\n**Zdanie złożone** ma **dwa lub więcej** orzeczeń: *Pada deszcz, więc* **zostaję** *w domu.*\n\nIle orzeczeń — tyle zdań składowych! Przed **ale, lecz, więc, bo, że, który, gdy, ponieważ** stawiamy przecinek.\n\n**Równoważnik zdania** nie ma orzeczenia: *Cisza w klasie. Pożar!*' }],
            practice: [
              mc('Które zdanie jest złożone?', ['Ola czyta.', 'Ola czyta, a Jaś rysuje.', 'Wesoła Ola czyta książkę.'], 1, 'Dwa orzeczenia: czyta, rysuje.', { fixed: true }),
              mc('Co jest równoważnikiem zdania?', ['Koniec lekcji.', 'Lekcja się skończyła.', 'Dzwoni dzwonek.'], 0, 'Brak orzeczenia.', { fixed: true }),
              mc('Gdzie postawisz przecinek? „Nie poszłam do kina bo byłam chora.”', ['przed „bo”', 'po „kina” i „bo”', 'nigdzie'], 0, 'Przed „bo”.', { fixed: true }),
            ],
          },
          {
            id: 'interpunkcja', title: 'Interpunkcja: przecinek, dwukropek, cudzysłów', minutes: 12,
            blocks: [{ type: 'read', text: '- **Przecinek**: przy wyliczaniu, przed spójnikami *ale, lecz, więc, bo, że*, po wołaczu\n- **Dwukropek**: przed wyliczeniem — *Kupiłam: chleb, masło i mleko.*\n- **Cudzysłów**: tytuły i cytaty — *Czytam „Akademię pana Kleksa”.*\n- **Myślnik**: w dialogu' }],
            practice: [
              mc('Który zapis jest poprawny?', ['Lubię: kotlety, ziemniaki i surówkę.', 'Lubię kotlety, ziemniaki i surówkę.'], 1, 'Dwukropek stawiamy, gdy wyliczenie zapowiada np. „takie owoce:”.', { fixed: true }),
              mc('Jak zapisać tytuł książki w zdaniu?', ['w cudzysłowie', 'w nawiasie', 'dużymi literami w całości'], 0, 'W cudzysłowie.', { fixed: true }),
              gen('plSentence', {}, 2),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plSubjPred', {}, 5), mc('Zdanie złożone ma…', ['co najmniej dwa orzeczenia', 'jedno orzeczenie', 'brak orzeczenia'], 0, 'Co najmniej dwa.', { fixed: true }), mc('Równoważnik zdania nie ma…', ['orzeczenia', 'kropki', 'liter'], 0, 'Orzeczenia.', { fixed: true })] },
        challenge: [star(mc('Ile zdań składowych ma: „Kiedy wróciłam do domu, zobaczyłam, że kot zjadł rybę”?', ['2', '3', '4'], 1, 'wróciłam, zobaczyłam, zjadł → 3.', { fixed: true }))],
      },
      {
        id: 'ortografia4', term: 1, strand: 'Ortografia', bridge: 'spelling',
        title: 'Ortografia klasy 4',
        summary: 'Powtórka ó/u, rz/ż, ch/h; nie z różnymi częściami mowy; wielka i mała litera; zakończenia -ii, -ji, -i.',
        lessons: [
          {
            id: 'powtorka', title: 'Powtórka: ó, rz, ch', minutes: 15,
            blocks: [{ type: 'read', text: 'Przypomnij sobie najważniejsze zasady:\n- **ó** wymienia się na **o, e, a**: *wózek – wozy*\n- **rz** wymienia się na **r** i występuje po **b, p, d, t, g, k, ch, j, w**: *morze – morski, drzewo*\n- **ż** wymienia się na **g, h, dz, z, s**: *książka – księga*\n- **ch** wymienia się na **sz** i występuje na końcu wyrazów: *mucha – muszka, dach*' }],
            practice: [gen('plOrto', {}, 8)],
          },
          {
            id: 'nie-czesci', title: '„Nie” z różnymi częściami mowy', minutes: 15,
            blocks: [{ type: 'read', text: '**Razem**: nie z **rzeczownikami** (*nieprawda, niepokój*), **przymiotnikami** (*niewysoki*), **przysłówkami od przymiotników** (*nieładnie*).\n\n**Osobno**: nie z **czasownikami** (*nie wiem*), **liczebnikami** (*nie pięć*), **przyimkami** (*nie na stole*), przymiotnikami i przysłówkami w **stopniu wyższym i najwyższym** (*nie lepszy, nie najgorzej*), oraz gdy jest **przeciwstawienie** (*nie wysoki, lecz niski*).' }],
            practice: [gen('plNie', {}, 4), mc('Który zapis jest poprawny?', ['nie lepszy', 'nielepszy'], 0, 'Stopień wyższy — osobno.', { fixed: true }), mc('Który zapis jest poprawny?', ['nie dźwiedź', 'niedźwiedź'], 1, 'Rzeczownik — razem (i to wyraz bez wersji bez „nie”).', { fixed: true }), mc('Który zapis jest poprawny?', ['niepięć', 'nie pięć'], 1, 'Liczebnik — osobno.', { fixed: true })],
          },
          {
            id: 'ii-ji', title: 'Zakończenia -ii, -ji, -i', minutes: 12,
            blocks: [{ type: 'read', text: 'W dopełniaczu, celowniku i miejscowniku rzeczowników żeńskich:\n- **-ii** po spółgłoskach (oprócz c, s, z): *historia – historii, Maria – Marii, chemia – chemii*\n- **-ji** po **c, s, z**: *lekcja – lekcji, poezja – poezji, Azja – Azji*\n- **-i** po samogłoskach: *nadzieja – nadziei, kolej – kolei, szyja – szyi*' }],
            practice: [
              mc('Uzupełnij: Nie było lekc_ .', ['ji', 'ii', 'i'], 0, 'Po c piszemy -ji: lekcji.', { fixed: true }),
              mc('Uzupełnij: Lubię lekcje histor_ .', ['ji', 'ii', 'i'], 1, 'Po r piszemy -ii: historii.', { fixed: true }),
              mc('Uzupełnij: Nie mam nadzie_ .', ['ji', 'ii', 'i'], 2, 'Po samogłosce: nadziei.', { fixed: true }),
              mc('Jak poprawnie? Mieszkałam w …', ['Australji', 'Australii', 'Australi'], 1, 'Po l piszemy -ii: Australii.', { fixed: true }),
            ],
          },
          {
            id: 'dyktando4', title: 'Dyktando klasy 4', minutes: 15,
            blocks: [{ type: 'read', text: 'Posłuchaj Sowy Zosi i napisz poprawnie każdy wyraz. Pisz piórem lub Apple Pencil — Zosia sprawdzi i pokaże błędy.' }],
            practice: [gen('plDyktando', { set: 'all' }, 8), dict('lekcji', 'Nie było dziś lekcji muzyki.'), dict('historii', 'Lubię lekcje historii.')],
          },
        ],
        quiz: { n: 10, items: [gen('plOrto', {}, 4), gen('plNie', {}, 3), gen('plCaps', {}, 2), mc('Uzupełnij: Mieszkam w Polsce, w Europie, ale mama urodziła się w Az_ .', ['ji', 'ii', 'i'], 0, 'Azja → Azji (po z: -ji).', { fixed: true })] },
        challenge: [star(mc('Który zapis jest poprawny?', ['To nie prawda, tylko plotka.', 'To nieprawda, tylko plotka.'], 1, 'Rzeczownik „nieprawda” piszemy razem.', { fixed: true })), star(mc('W którym wyrazie jest błąd?', ['olimpiady', 'Marii', 'poezii', 'lekcji'], 2, 'Poprawnie: poezji (po z: -ji).'))],
      },
      {
        id: 'srodki', term: 2, strand: 'Kształcenie literackie', bridge: 'poetry',
        title: 'Poezja i środki stylistyczne',
        summary: 'Wers, strofa, rym, refren; epitet, porównanie, uosobienie, wyraz dźwiękonaśladowczy; podmiot liryczny.',
        lessons: [
          {
            id: 'budowa-wiersza', title: 'Budowa wiersza', minutes: 12,
            blocks: [
              { type: 'read', text: T_JESIEN },
              { type: 'read', text: '- **wers** — jedna linijka\n- **strofa** (zwrotka) — grupa wersów\n- **rym** — podobne brzmienie końcówek wersów: *złota – szlocha*, *pola – rolach*\n- **refren** — powtarzający się fragment\n- **podmiot liryczny** — „ja” mówiące w wierszu (to nie zawsze sam poeta!)' },
              { type: 'vocab', words: [['strofa', 'zwrotka', 'stanza'], ['refren', 'powtarzany fragment', 'chorus, refrain'], ['podmiot liryczny', 'osoba mówiąca w wierszu', 'speaker']] },
            ],
            practice: [
              mc('Ile strof ma wiersz „Jesień”?', ['1', '2', '4'], 1, 'Dwie strofy po 4 wersy.', { fixed: true }),
              mc('Kto mówi w wierszu „Jesień”?', ['wiatr', 'podmiot liryczny patrzący spod parasola', 'jesień'], 1, '„A ja patrzę spod parasola”.', { fixed: true }),
            ],
          },
          {
            id: 'epitet', title: 'Epitet i porównanie', minutes: 12,
            blocks: [{ type: 'read', text: '**Epitet** — wyraz określający, zwykle przymiotnik, który maluje obraz: *jesień* **ruda, złota**, **blade** *słońce*.\n\n**Porównanie** — zestawia dwie rzeczy za pomocą słów **jak, niczym, jakby, podobny do**: *wiatr* **jak urwis**.' }],
            practice: [
              mc('Co jest porównaniem?', ['wiatr jak urwis', 'blade słońce', 'kap, kap'], 0, 'Jest słowo „jak”.', { fixed: true }),
              mc('Co jest epitetem?', ['ruda jesień', 'deszcz szlocha', 'szu, szu'], 0, '„ruda” określa jesień.', { fixed: true }),
              mc('Który wyraz zwykle wprowadza porównanie?', ['jak', 'i', 'pod'], 0, '„jak”, „niczym”.', { fixed: true }),
            ],
          },
          {
            id: 'uosobienie', title: 'Uosobienie i wyrazy dźwiękonaśladowcze', minutes: 12,
            blocks: [{ type: 'read', text: '**Uosobienie** (personifikacja) — przedmiot lub zjawisko zachowuje się jak człowiek: *jesień* **szlocha**, *słońce* **zaspane**.\n\n**Ożywienie** — rzecz zachowuje się jak zwierzę lub żywa istota: *wiatr* **gna**.\n\n**Wyrazy dźwiękonaśladowcze** naśladują odgłosy: *kap, szu, bum, miau, plusk*.' }],
            practice: [
              mc('Co jest uosobieniem?', ['jesień w deszczu szlocha', 'jesień ruda', 'liście szumią szu-szu'], 0, 'Szlochanie to czynność człowieka.', { fixed: true }),
              mc('Który wyraz jest dźwiękonaśladowczy?', ['plusk', 'pięknie', 'pole'], 0, 'Naśladuje odgłos wody.', { fixed: true }),
              write('Napisz 4 zdania o zimie: użyj epitetu, porównania, uosobienia i wyrazu dźwiękonaśladowczego.', ['Epitet', 'Porównanie (jak…)', 'Uosobienie', 'Wyraz dźwiękonaśladowczy'], 25, { homework: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Strofa to…', ['zwrotka', 'linijka', 'tytuł'], 0, 'Zwrotka.', { fixed: true }), mc('„Słońce się uśmiecha” to…', ['uosobienie', 'porównanie', 'epitet'], 0, 'Uśmiech to cecha człowieka.', { fixed: true }), mc('„Oczy jak gwiazdy” to…', ['porównanie', 'uosobienie', 'rym'], 0, 'Porównanie z „jak”.', { fixed: true }), mc('„Zielona łąka” — „zielona” to…', ['epitet', 'wyraz dźwiękonaśladowczy', 'refren'], 0, 'Epitet.', { fixed: true })] },
        challenge: [star(write('Napisz własny wiersz (2 strofy po 4 wersy) o morzu z rymami, epitetami i porównaniem.', ['2 strofy', 'Rymy', 'Epitety', 'Porównanie'], 30))],
      },
      {
        id: 'lektury4', term: 2, strand: 'Kształcenie literackie', bridge: 'literature',
        title: 'Lektury klasy 4',
        summary: '„Akademia pana Kleksa”, „Opowieści z Narnii”, baśnie i legendy; narrator, bohater, fabuła, świat przedstawiony, fantastyka.',
        lessons: [
          {
            id: 'kleks', title: '„Akademia pana Kleksa” — Jan Brzechwa', minutes: 15,
            blocks: [{ type: 'read', title: 'Akademia pana Kleksa', text: T_KLEKS }, { type: 'read', text: '**Świat przedstawiony** to wszystko, co jest w utworze: **czas**, **miejsce**, **bohaterowie**, **wydarzenia** (fabuła).\n\n**Narrator** opowiada historię. Gdy jest jednym z bohaterów i mówi „ja”, to **narrator pierwszoosobowy** (jak Adaś).' }],
            practice: [
              mc('Kto jest narratorem „Akademii pana Kleksa”?', ['pan Kleks', 'Adaś Niezgódka', 'Jan Brzechwa'], 1, 'Adaś Niezgódka.', { fixed: true }),
              mc('Jakie imiona mieli uczniowie Akademii?', ['na literę A', 'na literę K', 'dowolne'], 0, 'Tylko na literę A.', { fixed: true }),
              mc('Na jakiej ulicy była Akademia?', ['Czekoladowej', 'Cukrowej', 'Miodowej'], 0, 'Czekoladowej.', { fixed: true }),
              mc('Co jest w tej książce fantastyczne?', ['łatanie przedmiotów ciszą', 'ulica', 'chłopcy'], 0, 'To niemożliwe w prawdziwym świecie.', { fixed: true }),
              mc('Kto napisał „Akademię pana Kleksa”?', ['Jan Brzechwa', 'Julian Tuwim', 'Henryk Sienkiewicz'], 0, 'Jan Brzechwa.', { fixed: true }),
            ],
          },
          {
            id: 'narnia', title: '„Opowieści z Narnii” — C.S. Lewis', minutes: 15,
            blocks: [{ type: 'read', title: 'Lew, czarownica i stara szafa', text: T_NARNIA }, { type: 'read', text: 'W tej książce są **dwa światy**: realistyczny (dom profesora) i **fantastyczny** (Narnia). Przejściem jest szafa. C.S. Lewis był pisarzem z Wielkiej Brytanii (urodzonym w Irlandii).' }],
            practice: [
              mc('Kto pierwszy trafił do Narnii?', ['Piotr', 'Łucja', 'Edmund', 'Zuzanna'], 1, 'Łucja.', { fixed: true }),
              mc('Jak dzieci dostawały się do Narnii?', ['przez szafę', 'przez okno', 'samolotem'], 0, 'Przez szafę.', { fixed: true }),
              mc('Kto był prawowitym królem Narnii?', ['Biała Czarownica', 'lew Aslan', 'profesor'], 1, 'Aslan.', { fixed: true }),
              mc('Co zrobiła Biała Czarownica?', ['sprawiła, że zawsze była zima', 'zbudowała zamek z czekolady', 'pomogła dzieciom'], 0, 'Wieczna zima bez świąt.', { fixed: true }),
            ],
          },
          {
            id: 'fabula', title: 'Fabuła, wątek, bohaterowie', minutes: 12,
            blocks: [{ type: 'read', text: '**Fabuła** — wydarzenia w kolejności.\n**Wątek** — ciąg wydarzeń związanych z jednym bohaterem lub sprawą (główny i poboczne).\n**Bohater główny** — najważniejsza postać; **drugoplanowy**; **epizodyczny** (pojawia się na chwilę).\n\nBohatera opisujemy: wygląd, cechy charakteru (z przykładami zachowań!), moja ocena.' }],
            practice: [
              mc('Bohater, który pojawia się tylko na chwilę, to bohater…', ['główny', 'epizodyczny', 'drugoplanowy'], 1, 'Epizodyczny.', { fixed: true }),
              write('Opisz pana Kleksa albo Łucję: wygląd, 3 cechy charakteru z przykładami, twoja opinia.', ['Wygląd', '3 cechy z przykładami', 'Opinia'], 45, { homework: true }),
            ],
          },
          {
            id: 'basnie4', title: 'Baśń, legenda, mit', minutes: 12,
            blocks: [{ type: 'read', text: '- **Baśń** — czary, dobro zwycięża, „dawno, dawno temu” (Andersen, bracia Grimm)\n- **Legenda** — prawdziwe miejsce lub postać + fantastyka (o Wandzie, o Kraku, o Popielu)\n- **Mit** ★ — opowieść starożytnych o bogach i herosach, wyjaśnia świat (mity greckie — klasa 5)' }],
            practice: [
              mc('Co odróżnia legendę od baśni?', ['związek z prawdziwym miejscem lub postacią', 'brak bohaterów', 'zawsze jest wierszem'], 0, 'Legenda jest osadzona w realnym miejscu.', { fixed: true }),
              mc('Kto napisał „Królową Śniegu” i „Brzydkie kaczątko”?', ['Hans Christian Andersen', 'Jan Brzechwa', 'C.S. Lewis'], 0, 'Andersen, Dania.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Narrator pierwszoosobowy mówi…', ['„ja”', '„on”', 'nic'], 0, '„ja”.', { fixed: true }), mc('Świat przedstawiony to…', ['czas, miejsce, bohaterowie, wydarzenia', 'tylko tytuł', 'okładka'], 0, 'Wszystko, co jest w utworze.', { fixed: true }), mc('Kto napisał „Opowieści z Narnii”?', ['C.S. Lewis', 'Andersen', 'Brzechwa'], 0, 'C.S. Lewis.', { fixed: true })] },
        challenge: [star(mc('Dlaczego zima w Narnii bez Bożego Narodzenia jest szczególnie smutna?', ['bo jest zimno, a nie ma radości ani nadziei, które niosą święta', 'bo nie ma śniegu', 'bo jest gorąco'], 0, 'To symbol braku nadziei.', { fixed: true }))],
      },
      {
        id: 'sluchanie4', term: 2, strand: 'Kształcenie literackie', bridge: 'listening',
        title: 'Słuchanie i list',
        summary: 'Słuchanie ze zrozumieniem, budowa listu prywatnego, adresowanie koperty.',
        lessons: [
          {
            id: 'list-sluch', title: 'Słuchanie: list z kolonii', minutes: 10,
            blocks: [{ type: 'listen', title: 'List', text: L_LIST }],
            practice: [
              mc('Skąd pisze Tosia?', ['z kolonii nad jeziorem', 'z Krakowa', 'z Australii'], 0, 'Z kolonii nad jeziorem.', { listen: true, fixed: true }),
              mc('Jakiego ptaka widziała?', ['czaplę', 'bociana', 'orła'], 0, 'Czaplę.', { listen: true, fixed: true }),
              mc('Za czym tęskni?', ['za pierogami babci', 'za kotem', 'za szkołą'], 0, 'Za pierogami babci.', { listen: true, fixed: true }),
              mc('Kiedy wraca?', ['w sobotę', 'w niedzielę', 'w piątek'], 0, 'W sobotę.', { listen: true, fixed: true }),
            ],
          },
          {
            id: 'list4', title: 'List prywatny i koperta', minutes: 15,
            blocks: [{ type: 'read', text: 'Elementy listu: **miejscowość i data**, **nagłówek** (zwrot do adresata: *Kochana Babciu!*), **wstęp**, **rozwinięcie**, **zakończenie**, **pozdrowienia**, **podpis**, ewentualnie **PS** (dopisek).\n\nZwroty grzecznościowe do adresata piszemy **wielką literą**: *Ty, Ciebie, Twój, Wam*.\n\nNa kopercie: adresat w **prawym dolnym** rogu, nadawca w **lewym górnym**, znaczek w **prawym górnym**.' }],
            practice: [
              mc('Gdzie na kopercie piszemy adres odbiorcy?', ['w prawym dolnym rogu', 'w lewym górnym', 'na odwrocie'], 0, 'Prawy dolny róg.', { fixed: true }),
              mc('Co oznacza PS?', ['dopisek po podpisie', 'początek listu', 'podpis'], 0, 'Postscriptum — dopisek.', { fixed: true }),
              write('Napisz list do kogoś z rodziny w Australii o tym, jak minął ci tydzień w szkole.', ['Miejscowość i data', 'Nagłówek', 'Wstęp, rozwinięcie, zakończenie', 'Pozdrowienia i podpis', 'Ty/Ciebie wielką literą'], 60, { homework: true }),
            ],
          },
        ],
        quiz: { n: 5, items: [mc('Nagłówek listu to…', ['zwrot do adresata', 'podpis', 'data'], 0, 'Zwrot do adresata.', { fixed: true }), mc('Nadawca na kopercie jest…', ['w lewym górnym rogu', 'w prawym dolnym', 'nigdzie'], 0, 'Lewy górny róg.', { fixed: true }), mc('W liście piszemy wielką literą…', ['Ciebie, Twój', 'poniedziałek', 'kot'], 0, 'Zwroty do adresata.', { fixed: true })] },
      },
      {
        id: 'wypowiedzi', term: 2, strand: 'Tworzenie wypowiedzi', bridge: 'narrative',
        title: 'Formy wypowiedzi',
        summary: 'Opowiadanie odtwórcze i twórcze, opis przedmiotu, postaci i krajobrazu, ogłoszenie, zaproszenie, dedykacja, plan ramowy i szczegółowy.',
        lessons: [
          {
            id: 'plan4', title: 'Plan ramowy i szczegółowy', minutes: 12,
            blocks: [{ type: 'read', text: '**Plan ramowy** — tylko główne punkty (1, 2, 3…).\n**Plan szczegółowy** — punkty z podpunktami (1a, 1b…).\n\nPunkty zapisujemy **jednolicie**: albo zdaniami, albo **równoważnikami** (bez czasownika): *Wyprawa do lasu. Spotkanie z jeżem.*' }],
            practice: [
              mc('Który punkt planu jest równoważnikiem zdania?', ['Łucja wchodzi do szafy.', 'Wejście Łucji do szafy.'], 1, 'Brak orzeczenia — równoważnik.', { fixed: true }),
              write('Napisz plan ramowy (5 punktów) przygód Łucji w Narnii, używając równoważników.', ['5 punktów', 'Równoważniki', 'Kolejność wydarzeń'], 15),
            ],
          },
          {
            id: 'opowiadanie4', title: 'Opowiadanie odtwórcze i twórcze', minutes: 20,
            blocks: [{ type: 'read', text: '**Odtwórcze** — opowiadasz to, co przeczytałaś (np. przygodę z lektury), własnymi słowami.\n**Twórcze** — wymyślasz własną historię, np. dalsze losy bohatera.\n\nPamiętaj: **trójdzielna kompozycja**, **akapity**, **dialog**, **słownictwo opisujące uczucia**, **zwrot akcji** (*nagle, niespodziewanie*).' }],
            practice: [write('Napisz opowiadanie twórcze: „Moja lekcja w Akademii pana Kleksa”.', ['Wstęp, rozwinięcie, zakończenie', 'Akapity', 'Dialog', 'Zwrot akcji', 'Uczucia bohatera'], 80, { homework: true })],
          },
          {
            id: 'opis4', title: 'Opis postaci i krajobrazu', minutes: 15,
            blocks: [{ type: 'read', text: '**Opis postaci**: przedstawienie → wygląd (od ogółu do szczegółu) → cechy charakteru i zainteresowania (z przykładami) → twój stosunek do postaci.\n\n**Opis krajobrazu**: co widzę na **pierwszym planie**, w **głębi**, w **tle**; kolory, dźwięki, zapachy; nastrój.' }],
            practice: [
              mc('Od czego zaczynamy opis postaci?', ['od przedstawienia osoby', 'od oceny', 'od zakończenia'], 0, 'Kto to jest.', { fixed: true }),
              write('Opisz bliską osobę z rodziny (wygląd, charakter, co razem robicie).', ['Przedstawienie', 'Wygląd', 'Cechy z przykładami', 'Twój stosunek'], 60, { homework: true }),
            ],
          },
          {
            id: 'krotkie', title: 'Ogłoszenie, zaproszenie, dedykacja', minutes: 12,
            blocks: [{ type: 'read', text: '**Ogłoszenie** — kto ogłasza? co? gdzie? kiedy? kontakt.\n**Zaproszenie** — kogo, na co, gdzie, kiedy, kto zaprasza; zwroty grzecznościowe.\n**Dedykacja** — krótki tekst, np. na książce w prezencie: dla kogo, z jakiej okazji, życzenia, podpis, data.' }],
            practice: [
              mc('Czego NIE musi zawierać ogłoszenie?', ['miejsca i czasu', 'informacji, czego dotyczy', 'opisu twoich wakacji'], 2, 'Ogłoszenie jest krótkie i konkretne.', { fixed: true }),
              write('Napisz ogłoszenie o zgubionym kocie.', ['Co się stało', 'Wygląd kota', 'Gdzie i kiedy', 'Kontakt'], 25),
              write('Napisz dedykację do książki, którą dajesz przyjaciółce na urodziny.', ['Dla kogo', 'Okazja', 'Życzenia', 'Podpis i data'], 15),
            ],
          },
        ],
        quiz: { n: 5, items: [mc('Plan szczegółowy ma…', ['podpunkty', 'tylko jeden punkt', 'rysunki'], 0, 'Podpunkty.', { fixed: true }), mc('Opowiadanie odtwórcze to…', ['opowiedzenie przeczytanej historii', 'wymyślenie nowej', 'wiersz'], 0, 'Odtworzenie.', { fixed: true }), mc('Opis krajobrazu porządkujemy według…', ['planów: pierwszy, głąb, tło', 'alfabetu', 'długości wyrazów'], 0, 'Według planów.', { fixed: true })] },
        challenge: [star(write('Napisz opowiadanie z perspektywy przedmiotu: „Pamiętnik starej szafy”.', ['Narrator pierwszoosobowy (szafa)', 'Trójdzielna kompozycja', 'Uosobienie', 'Dialog'], 100))],
      },
      {
        id: 'slownictwo', term: 2, strand: 'Kształcenie językowe', bridge: 'vocabulary',
        title: 'Słownictwo i słowniki',
        summary: 'Wyrazy bliskoznaczne i przeciwstawne, wyrazy wieloznaczne, związki frazeologiczne, korzystanie ze słowników.',
        lessons: [
          {
            id: 'synonimy', title: 'Synonimy i antonimy', minutes: 12,
            blocks: [{ type: 'read', text: '**Synonimy** (wyrazy bliskoznaczne) — podobne znaczenie: *mądry – bystry*.\n**Antonimy** (wyrazy przeciwstawne) — przeciwne: *wysoki – niski*.\n\nSynonimy pomagają unikać **powtórzeń** w wypracowaniach.' }],
            practice: [gen('plSynonym', {}, 4), gen('plAntonym', {}, 4)],
          },
          {
            id: 'frazeologia', title: 'Związki frazeologiczne', minutes: 12,
            blocks: [{ type: 'read', text: '**Związek frazeologiczny** to utarte połączenie wyrazów o przenośnym znaczeniu:\n- *bujać w obłokach* — marzyć, nie uważać\n- *mieć muchy w nosie* — być w złym humorze\n- *trzymać język za zębami* — dochować tajemnicy\n- *wziąć nogi za pas* — uciec\n- *mieć głowę na karku* — być rozsądnym\n- *rzucać grochem o ścianę* — mówić bez skutku' }],
            practice: [
              mc('Co znaczy „mieć muchy w nosie”?', ['być w złym humorze', 'być chorym', 'lubić owady'], 0, 'Być obrażonym, w złym humorze.', { fixed: true }),
              mc('Co znaczy „wziąć nogi za pas”?', ['uciec', 'założyć pasek', 'usiąść'], 0, 'Uciec.', { fixed: true }),
              mc('Co znaczy „trzymać język za zębami”?', ['nie zdradzić tajemnicy', 'mieć chory ząb', 'dużo mówić'], 0, 'Zachować tajemnicę.', { fixed: true }),
              mc('Kto „buja w obłokach”?', ['ktoś zamyślony, marzyciel', 'pilot', 'ptak'], 0, 'Marzyciel.', { fixed: true }),
            ],
          },
          {
            id: 'slowniki', title: 'Słowniki i wyrazy wieloznaczne', minutes: 12,
            blocks: [{ type: 'read', text: '- **Słownik ortograficzny** — jak poprawnie napisać wyraz\n- **Słownik języka polskiego** — co znaczy wyraz\n- **Słownik wyrazów bliskoznacznych** — synonimy\n- **Słownik polsko-angielski** — tłumaczenia\n\n**Wyrazy wieloznaczne** mają kilka znaczeń: *zamek* (budowla, w drzwiach, błyskawiczny), *pióro* (ptasie, do pisania), *klucz* (do drzwi, ptaków, wiolinowy).' }],
            practice: [
              mc('W którym słowniku sprawdzisz, jak napisać „żółw”?', ['ortograficznym', 'wyrazów bliskoznacznych', 'polsko-angielskim'], 0, 'Ortograficznym.', { fixed: true }),
              mc('Który wyraz jest wieloznaczny?', ['zamek', 'stół', 'kot'], 0, 'Zamek: budowla, w drzwiach, przy kurtce.', { fixed: true }),
              mc('Słowniki układają wyrazy…', ['alfabetycznie', 'od najkrótszych', 'losowo'], 0, 'Alfabetycznie.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [gen('plSynonym', {}, 2), gen('plAntonym', {}, 2), mc('„Mieć głowę na karku” znaczy…', ['być rozsądnym', 'mieć ból szyi', 'nosić czapkę'], 0, 'Być rozsądnym.', { fixed: true })] },
        challenge: [star(mc('„Rzucać grochem o ścianę” znaczy…', ['mówić coś bez skutku', 'gotować zupę', 'bawić się'], 0, 'Nikt nie słucha.', { fixed: true }))],
      },
    ],
  });
})();

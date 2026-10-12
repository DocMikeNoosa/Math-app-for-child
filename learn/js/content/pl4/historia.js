/* Klasa 4 — historia (podstawa programowa, II etap edukacyjny): wprowadzenie do historii i postacie z dziejów Polski. */
(function () {
  const { mc, pf, num, inp, gen, write, star } = LA.Q;

  LA.addSubject('pl4', {
    id: 'historia',
    intro: 'Czym jest historia i jak mierzymy czas, źródła historyczne, mała i wielka ojczyzna, oraz najważniejsze postacie i wydarzenia z dziejów Polski — od Mieszka I do Jana Pawła II.',
    chapters: [
      {
        id: 'czas', term: 1, strand: 'Wprowadzenie do historii', bridge: 'history',
        title: 'Historia i czas',
        summary: 'Czym zajmuje się historia, źródła historyczne, oś czasu, era, tysiąclecie, wiek, liczenie upływu czasu.',
        outcomes: ['Rozróżniam źródła pisane i niepisane', 'Określam wiek dla podanego roku', 'Liczę upływ czasu na osi czasu'],
        lessons: [
          {
            id: 'zrodla', title: 'Źródła historyczne', minutes: 12,
            blocks: [{ type: 'read', text: '**Historia** bada przeszłość ludzi. Wiedzę czerpiemy ze **źródeł historycznych**:\n- **pisane**: kroniki, listy, dokumenty, pamiętniki, gazety\n- **niepisane**: **materialne** (budowle, monety, narzędzia, ubrania), **ikonograficzne** (obrazy, zdjęcia), **ustne** (wspomnienia, legendy), audiowizualne (filmy, nagrania)\n\nŹródła przechowują **muzea**, **archiwa** i **biblioteki**. Badacze wykopalisk to **archeolodzy**.' }, { type: 'vocab', words: [['źródło historyczne', 'ślad przeszłości', 'historical source'], ['archeolog', 'bada wykopaliska', 'archaeologist'], ['kronika', 'opis wydarzeń rok po roku', 'chronicle'], ['archiwum', 'miejsce przechowywania dokumentów', 'archive']] }],
            practice: [mc('Które źródło jest pisane?', ['list babci z 1960 roku', 'stara moneta', 'zdjęcie'], 0, 'List jest tekstem.', { fixed: true }), mc('Stary miecz to źródło…', ['materialne', 'pisane', 'ustne'], 0, 'Przedmiot — źródło materialne.', { fixed: true }), mc('Wspomnienia dziadka to źródło…', ['ustne', 'pisane', 'materialne'], 0, 'Ustne.', { fixed: true }), mc('Gdzie przechowuje się stare dokumenty?', ['w archiwum', 'w sklepie', 'w szkole muzycznej'], 0, 'W archiwum.', { fixed: true })],
          },
          {
            id: 'era', title: 'Oś czasu, era, wiek', minutes: 15,
            blocks: [{ type: 'read', text: 'Liczymy lata od narodzin Chrystusa (rok 1):\n- **p.n.e.** — przed naszą erą (liczymy wstecz)\n- **n.e.** — naszej ery\n\nNie ma roku zerowego!\n\n**Wiek** = 100 lat, **tysiąclecie** = 1000 lat. Wieki zapisujemy **cyframi rzymskimi**.\n\nJak obliczyć wiek? Rok 1410 → odrzucamy dwie ostatnie cyfry (14) i dodajemy 1 → **XV wiek**. Ale rok **1900** to ostatni rok **XIX** wieku (wiek kończy się na „00”).\n\nRok 2026 → XXI wiek. XXI wiek trwa od 2001 do 2100.' }],
            practice: [gen('plCentury', {}, 5), mc('W którym wieku jest rok 2000?', ['XX', 'XXI'], 0, '2000 to ostatni rok XX wieku.', { fixed: true })],
          },
          {
            id: 'liczenie', title: 'Obliczanie upływu czasu', minutes: 12,
            blocks: [{ type: 'read', text: 'Ile lat minęło? **Odejmij**: od chrztu Polski (966) do bitwy pod Grunwaldem (1410): 1410 − 966 = **444 lata**.\n\nGdy jedno wydarzenie jest **p.n.e.**, a drugie **n.e.** — **dodajemy** lata i odejmujemy 1 (bo nie było roku 0): od 50 p.n.e. do 50 n.e. minęło 99 lat. ★' }],
            practice: [num('Ile lat minęło od roku 966 do 1410?', 444, '1410 − 966 = 444.'), num('Ile lat minęło od 1918 do 2026?', 108, '2026 − 1918 = 108.'), num('Ile lat minęło od uchwalenia Konstytucji 3 Maja (1791) do odzyskania niepodległości (1918)?', 127, '1918 − 1791 = 127.')],
          },
        ],
        quiz: { n: 8, items: [gen('plCentury', {}, 4), mc('Wiek to…', ['100 lat', '10 lat', '1000 lat'], 0, '100 lat.', { fixed: true }), mc('Moneta to źródło…', ['materialne', 'pisane'], 0, 'Materialne.', { fixed: true })] },
        challenge: [star(gen('plCentury', { big: true }, 2)), star(num('Ile lat minęło od 753 p.n.e. (legendarne założenie Rzymu) do 2026 roku?', 2778, '753 + 2026 − 1 = 2778 (nie było roku 0).'))],
      },
      {
        id: 'ojczyzna4', term: 1, strand: 'Wprowadzenie do historii', bridge: 'national-symbols',
        title: 'Mała i wielka ojczyzna',
        summary: 'Rodzina i jej historia, mała ojczyzna (region), ojczyzna, naród, symbole narodowe, święta państwowe, Polonia.',
        lessons: [
          {
            id: 'rodzina-hist', title: 'Historia mojej rodziny', minutes: 12,
            blocks: [{ type: 'read', text: '**Drzewo genealogiczne** pokazuje przodków: rodziców, dziadków, pradziadków. **Genealogia** to nauka o pochodzeniu rodzin.\n\nPamiątki rodzinne (zdjęcia, listy, medale) to źródła historyczne naszej rodziny!' }, { type: 'activity', text: 'Narysujcie razem drzewo genealogiczne rodziny Tosi — z polską i (jeśli jest) australijską gałęzią.' }],
            practice: [mc('Rodzice twoich dziadków to…', ['pradziadkowie', 'wujkowie', 'kuzyni'], 0, 'Pradziadkowie.', { fixed: true }), write('Opisz jedną pamiątkę rodzinną: co to jest, do kogo należała, co opowiada.', ['Co to', 'Czyja', 'Historia pamiątki'], 30, { homework: true })],
          },
          {
            id: 'mala', title: 'Mała ojczyzna i Polonia', minutes: 12,
            blocks: [{ type: 'read', text: '**Mała ojczyzna** — miejsce, w którym się wychowujemy (miasto, wieś, region). **Ojczyzna** — kraj przodków, z którym czujemy więź. **Naród** — wspólnota ludzi o wspólnym języku, historii i kulturze.\n\n**Polonia** — Polacy i osoby polskiego pochodzenia mieszkające za granicą: m.in. w USA, Niemczech, Wielkiej Brytanii, Kanadzie, a także w **Australii** (Sydney, Melbourne, Adelajda).\n\n**Mniejszości narodowe** w Polsce: m.in. Niemcy, Ukraińcy, Białorusini, Litwini.' }],
            practice: [mc('Polonia to…', ['Polacy mieszkający za granicą', 'stolica Polski', 'polska rzeka'], 0, 'Polacy za granicą.', { fixed: true }), mc('Mała ojczyzna to…', ['miejsce, w którym się wychowujemy', 'cała Europa', 'tylko Warszawa'], 0, 'Najbliższa okolica.', { fixed: true })],
          },
          {
            id: 'symbole4', title: 'Symbole i święta narodowe', minutes: 12,
            blocks: [{ type: 'read', text: '**Godło** — biały orzeł w koronie na czerwonej tarczy; **barwy** — biało-czerwone; **hymn** — „Mazurek Dąbrowskiego” (słowa Józef Wybicki, 1797, Włochy — dla Legionów Polskich).\n\nŚwięta: **3 Maja** (Konstytucja 1791), **11 Listopada** (Niepodległość 1918), **2 maja** (Dzień Flagi i Dzień Polonii i Polaków za Granicą), **1 marca** (Żołnierze Wyklęci), **15 sierpnia** (Święto Wojska Polskiego — Bitwa Warszawska 1920).' }],
            practice: [mc('Gdzie powstał „Mazurek Dąbrowskiego”?', ['we Włoszech', 'w Warszawie', 'w Australii'], 0, 'W 1797 r. w Reggio nell’Emilia, dla Legionów we Włoszech.', { fixed: true }), mc('Dzień Polonii i Polaków za Granicą obchodzimy…', ['2 maja', '11 listopada', '24 grudnia'], 0, '2 maja.', { fixed: true }), mc('Co upamiętnia 15 sierpnia?', ['Bitwę Warszawską 1920', 'chrzest Polski', 'Grunwald'], 0, '„Cud nad Wisłą”.', { fixed: true })],
          },
        ],
        quiz: { n: 6, items: [mc('Naród to…', ['wspólnota języka, historii i kultury', 'jedna rodzina', 'drużyna'], 0, 'Wspólnota.', { fixed: true }), mc('Słowa hymnu napisał…', ['Józef Wybicki', 'Jan Matejko', 'Mikołaj Kopernik'], 0, 'Józef Wybicki.', { fixed: true }), mc('Drzewo genealogiczne pokazuje…', ['przodków', 'gatunki drzew', 'mapę'], 0, 'Przodków.', { fixed: true })] },
        challenge: [star(mc('Dlaczego hymn wspomina „marsz, marsz, Dąbrowski, z ziemi włoskiej do Polski”?', ['bo Legiony gen. Dąbrowskiego walczyły we Włoszech, gdy Polski nie było na mapie', 'bo Dąbrowski lubił spacery', 'bo Włochy to część Polski'], 0, 'Polska była wtedy pod zaborami.', { fixed: true }))],
      },
      {
        id: 'piastowie', term: 1, strand: 'Postacie i wydarzenia', bridge: 'history',
        title: 'Piastowie',
        summary: 'Mieszko I i Dobrawa, chrzest Polski 966, Bolesław Chrobry i zjazd gnieźnieński, koronacja 1025, Kazimierz Wielki.',
        lessons: [
          {
            id: 'mieszko4', title: 'Mieszko I i chrzest Polski', minutes: 15,
            blocks: [{ type: 'read', text: '**Mieszko I** — pierwszy historyczny władca Polan z rodu **Piastów**. W **966 roku** przyjął **chrzest**. Jego żoną była czeska księżniczka **Dobrawa**.\n\nDlaczego chrzest był ważny?\n- Polska weszła do grona państw chrześcijańskich Europy\n- przybyli duchowni, którzy znali **pismo** — powstawały kroniki, szkoły\n- zaczęto budować kościoły z kamienia\n\nDokument „**Dagome iudex**” (ok. 991 r.) opisuje granice państwa Mieszka.' }],
            practice: [num('W którym roku Mieszko I przyjął chrzest?', 966, '966.'), mc('Kim była Dobrawa?', ['czeską księżniczką, żoną Mieszka', 'polską królową z XVIII wieku', 'legendarną smoczycą'], 0, 'Żona Mieszka I.', { fixed: true }), mc('Ród pierwszych władców Polski to…', ['Piastowie', 'Jagiellonowie', 'Habsburgowie'], 0, 'Piastowie.', { fixed: true }), gen('plCentury', {}, 1)],
          },
          {
            id: 'chrobry', title: 'Bolesław Chrobry — pierwszy król', minutes: 12,
            blocks: [{ type: 'read', text: '**Bolesław Chrobry** (syn Mieszka) — **chrobry** znaczy „dzielny”.\n- **997** — misja i śmierć **św. Wojciecha** w Prusach; Bolesław wykupił jego ciało\n- **1000** — **zjazd gnieźnieński**: cesarz Otton III odwiedził grób św. Wojciecha; powstało **arcybiskupstwo w Gnieźnie**\n- **1025** — **koronacja** Bolesława na **pierwszego króla Polski**' }],
            practice: [num('W którym roku Bolesław Chrobry został koronowany?', 1025, '1025.'), mc('Co znaczy przydomek „Chrobry”?', ['dzielny', 'gruby', 'mądry'], 0, 'Dzielny.', { fixed: true }), num('W którym roku odbył się zjazd gnieźnieński?', 1000, 'W roku 1000.'), mc('Który cesarz przybył do Gniezna?', ['Otton III', 'Karol Wielki', 'Napoleon'], 0, 'Otton III.', { fixed: true })],
          },
          {
            id: 'kazimierz', title: 'Kazimierz Wielki', minutes: 12,
            blocks: [{ type: 'read', text: '**Kazimierz Wielki** — ostatni król z dynastii Piastów (panował 1333–1370).\n„**Zastał Polskę drewnianą, a zostawił murowaną**” — budował zamki i mury miejskie.\n- **1364** — założył **Akademię Krakowską** (dziś Uniwersytet Jagielloński), jedną z najstarszych uczelni w Europie\n- ujednolicił prawo i dbał o chłopów („król chłopów”)\n- **uczta u Wierzynka** — podejmował królów i cesarza' }],
            practice: [num('W którym roku założono Akademię Krakowską?', 1364, '1364.'), mc('Dokończ: „Zastał Polskę drewnianą, a zostawił…”', ['murowaną', 'złotą', 'szklaną'], 0, '…murowaną.', { fixed: true }), mc('Kazimierz Wielki był ostatnim królem z dynastii…', ['Piastów', 'Jagiellonów', 'Wazów'], 0, 'Piastów.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Pierwszy król Polski to…', ['Bolesław Chrobry', 'Mieszko I', 'Kazimierz Wielki'], 0, 'Bolesław Chrobry, 1025.', { fixed: true }), mc('Akademię Krakowską założył…', ['Kazimierz Wielki', 'Mieszko I', 'Jan III Sobieski'], 0, 'Kazimierz Wielki, 1364.', { fixed: true }), mc('W którym wieku był chrzest Polski?', ['X', 'XI', 'IX'], 0, '966 → X wiek.', { fixed: true }), mc('Św. Wojciech zginął w…', ['Prusach', 'Rzymie', 'Krakowie'], 0, 'W Prusach (997).', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od chrztu Polski do założenia Akademii Krakowskiej?', 398, '1364 − 966 = 398.')), star(mc('Dlaczego zjazd gnieźnieński był ważny?', ['bo powstało polskie arcybiskupstwo, niezależne od Niemiec', 'bo zbudowano Wawel', 'bo pokonano Krzyżaków'], 0, 'Kościół w Polsce stał się samodzielny.', { fixed: true }))],
      },
      {
        id: 'jagiellonowie', term: 1, strand: 'Postacie i wydarzenia', bridge: 'history',
        title: 'Jadwiga, Jagiełło i Grunwald',
        summary: 'Królowa Jadwiga i unia z Litwą, Władysław Jagiełło, bitwa pod Grunwaldem 1410, Mikołaj Kopernik.',
        lessons: [
          {
            id: 'jadwiga', title: 'Jadwiga i Jagiełło', minutes: 12,
            blocks: [{ type: 'read', text: '**Jadwiga** — koronowana na **króla** Polski (tak brzmiał tytuł!) w 1384 roku, mając około 10 lat. Wyszła za mąż za wielkiego księcia Litwy **Jagiełłę** — tak powstała **unia polsko-litewska** (1385, Krewo) i dynastia **Jagiellonów**.\n\nJadwiga przekazała swoje klejnoty na odnowienie Akademii Krakowskiej. Jest **świętą** Kościoła.' }],
            practice: [mc('Z jakim państwem Polska zawarła unię dzięki małżeństwu Jadwigi?', ['z Litwą', 'z Czechami', 'z Węgrami'], 0, 'Z Litwą.', { fixed: true }), mc('Jak nazywa się dynastia zapoczątkowana przez Jagiełłę?', ['Jagiellonowie', 'Piastowie', 'Wazowie'], 0, 'Jagiellonowie.', { fixed: true }), mc('Na co Jadwiga przeznaczyła klejnoty?', ['na Akademię Krakowską', 'na wojsko', 'na nową koronę'], 0, 'Na uczelnię.', { fixed: true })],
          },
          {
            id: 'grunwald', title: 'Bitwa pod Grunwaldem', minutes: 15,
            blocks: [{ type: 'read', text: '**15 lipca 1410 roku** wojska polsko-litewskie pod wodzą **Władysława Jagiełły** pokonały **Zakon Krzyżacki** pod **Grunwaldem**. To jedna z największych bitew średniowiecznej Europy.\n\nPrzed bitwą posłowie krzyżaccy przynieśli **dwa nagie miecze** — miało to obrazić króla. Wielki mistrz **Ulrich von Jungingen** zginął w bitwie.\n\nBitwę namalował **Jan Matejko** („Bitwa pod Grunwaldem”). Rycerz **Zawisza Czarny** słynął z odwagi — „polegać jak na Zawiszy”.' }],
            practice: [num('W którym roku była bitwa pod Grunwaldem?', 1410, '1410.'), mc('Z kim walczyli Polacy i Litwini pod Grunwaldem?', ['z Krzyżakami', 'z Rzymianami', 'ze Szwedami'], 0, 'Z Zakonem Krzyżackim.', { fixed: true }), mc('Co przynieśli posłowie krzyżaccy?', ['dwa nagie miecze', 'złotą koronę', 'list pokojowy'], 0, 'Dwa nagie miecze.', { fixed: true }), mc('Co znaczy „polegać jak na Zawiszy”?', ['ufać komuś całkowicie', 'przewrócić się', 'bać się'], 0, 'Zawisza był niezawodny.', { fixed: true })],
          },
          {
            id: 'kopernik4', title: 'Mikołaj Kopernik', minutes: 12,
            blocks: [{ type: 'read', text: '**Mikołaj Kopernik** (1473–1543) — urodził się w **Toruniu**, studiował w Krakowie i we Włoszech. Był astronomem, lekarzem, matematykiem; bronił **Olsztyna** przed Krzyżakami.\n\nW dziele „**O obrotach sfer niebieskich**” udowodnił, że to **Ziemia krąży wokół Słońca** (teoria **heliocentryczna**), a nie odwrotnie.\n\n„Wstrzymał Słońce, ruszył Ziemię, polskie wydało go plemię.”' }],
            practice: [mc('Gdzie urodził się Kopernik?', ['w Toruniu', 'w Krakowie', 'w Gdańsku'], 0, 'W Toruniu.', { fixed: true }), mc('Teoria Kopernika to teoria…', ['heliocentryczna (Słońce w centrum)', 'geocentryczna (Ziemia w centrum)'], 0, 'Helios = Słońce.', { fixed: true }), mc('Którego miasta Kopernik bronił przed Krzyżakami?', ['Olsztyna', 'Warszawy', 'Poznania'], 0, 'Olsztyna.', { fixed: true }), gen('plCentury', {}, 1)],
          },
        ],
        quiz: { n: 8, items: [mc('Bitwa pod Grunwaldem — rok…', ['1410', '1683', '966'], 0, '1410.', { fixed: true }), mc('Jadwiga poślubiła…', ['Jagiełłę', 'Kopernika', 'Chrobrego'], 0, 'Jagiełłę.', { fixed: true }), mc('Kopernik udowodnił, że…', ['Ziemia krąży wokół Słońca', 'Słońce krąży wokół Ziemi', 'Ziemia jest płaska'], 0, 'Heliocentryzm.', { fixed: true }), mc('Obraz „Bitwa pod Grunwaldem” namalował…', ['Jan Matejko', 'Józef Chełmoński', 'Olga Boznańska'], 0, 'Matejko.', { fixed: true })] },
        challenge: [star(mc('W którym wieku żył Kopernik?', ['XV–XVI', 'XIII', 'XVIII'], 0, '1473–1543.', { fixed: true })), star(num('Ile lat po bitwie pod Grunwaldem urodził się Kopernik?', 63, '1473 − 1410 = 63.'))],
      },
      {
        id: 'rzeczpospolita', term: 2, strand: 'Postacie i wydarzenia', bridge: 'history',
        title: 'Rzeczpospolita szlachecka i rozbiory',
        summary: 'Jan Zamoyski, Jan III Sobieski i odsiecz wiedeńska 1683, Konstytucja 3 Maja, Tadeusz Kościuszko, rozbiory.',
        lessons: [
          {
            id: 'sobieski', title: 'Jan III Sobieski i odsiecz wiedeńska', minutes: 12,
            blocks: [{ type: 'read', text: '**Jan III Sobieski** — król i wódz. **12 września 1683 roku** pod **Wiedniem** pokonał armię **turecką**. Szarża **husarii** (jazdy ze skrzydłami na plecach) przesądziła o zwycięstwie.\n\nSobieski napisał do papieża: „**Przybyliśmy, zobaczyliśmy, a Bóg zwyciężył**”.\n\nJego letnia rezydencja to pałac w **Wilanowie** (Warszawa).' }],
            practice: [num('W którym roku była odsiecz wiedeńska?', 1683, '1683.'), mc('Z kim walczył Sobieski pod Wiedniem?', ['z Turkami', 'z Krzyżakami', 'z Rosjanami'], 0, 'Z Turkami.', { fixed: true }), mc('Husaria to…', ['polska ciężka jazda ze skrzydłami', 'rodzaj statku', 'taniec'], 0, 'Słynna polska jazda.', { fixed: true }), mc('Pałac Sobieskiego to…', ['Wilanów', 'Wawel', 'Malbork'], 0, 'Wilanów.', { fixed: true })],
          },
          {
            id: 'konstytucja', title: 'Konstytucja 3 Maja i rozbiory', minutes: 15,
            blocks: [{ type: 'read', text: 'W XVIII wieku Rzeczpospolita słabła, a sąsiedzi — **Rosja, Prusy i Austria** — zabierali jej ziemie: **rozbiory** (1772, 1793, 1795).\n\nPróbą ratunku była **Konstytucja 3 Maja 1791** — pierwsza w Europie spisana nowoczesna konstytucja: wzmacniała władzę, znosiła **liberum veto** (każdy poseł mógł zerwać obrady).\n\nPo **III rozbiorze (1795)** Polska zniknęła z mapy na **123 lata**.' }],
            practice: [mc('Które państwa dokonały rozbiorów Polski?', ['Rosja, Prusy, Austria', 'Francja, Anglia, Hiszpania', 'Szwecja, Dania, Norwegia'], 0, 'Rosja, Prusy i Austria.', { fixed: true }), num('W którym roku był III rozbiór?', 1795, '1795.'), mc('Co zniosła Konstytucja 3 Maja?', ['liberum veto', 'szkoły', 'wojsko'], 0, 'Liberum veto.', { fixed: true }), num('Ile rozbiorów Polski było?', 3, 'Trzy.')],
          },
          {
            id: 'kosciuszko', title: 'Tadeusz Kościuszko', minutes: 12,
            blocks: [{ type: 'read', text: '**Tadeusz Kościuszko** — bohater **dwóch narodów**: walczył o niepodległość **Stanów Zjednoczonych**, a w **1794 roku** stanął na czele **powstania** w Polsce (przysięga na Rynku w Krakowie). W bitwie pod **Racławicami** odważnie walczyli **kosynierzy** — chłopi z kosami.\n\nNajwyższy szczyt Australii, **Mount Kosciuszko**, nazwał na jego cześć polski podróżnik Paweł Edmund Strzelecki (1840).' }],
            practice: [num('W którym roku wybuchło powstanie kościuszkowskie?', 1794, '1794.'), mc('Kim byli kosynierzy?', ['chłopami walczącymi kosami', 'rycerzami', 'marynarzami'], 0, 'Chłopi z kosami.', { fixed: true }), mc('Którą górę w Australii nazwano na cześć Kościuszki?', ['Mount Kosciuszko', 'Uluru', 'Mount Everest'], 0, 'Mount Kosciuszko.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Odsiecz wiedeńska — rok…', ['1683', '1410', '1794'], 0, '1683.', { fixed: true }), mc('Racławice to bitwa…', ['powstania kościuszkowskiego', 'z Krzyżakami', 'z Turkami'], 0, '1794.', { fixed: true }), mc('Po III rozbiorze Polska…', ['zniknęła z mapy', 'powiększyła się', 'zdobyła kolonie'], 0, 'Zniknęła na 123 lata.', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od III rozbioru (1795) do odzyskania niepodległości (1918)?', 123, '1918 − 1795 = 123.')), star(gen('plCentury', {}, 2))],
      },
      {
        id: 'niepodleglosc', term: 2, strand: 'Postacie i wydarzenia', bridge: 'history',
        title: 'Walka o niepodległość i II Rzeczpospolita',
        summary: 'Maria Skłodowska-Curie, Romuald Traugutt i powstanie styczniowe, Józef Piłsudski i 1918, Eugeniusz Kwiatkowski i Gdynia.',
        lessons: [
          {
            id: 'sklodowska', title: 'Maria Skłodowska-Curie', minutes: 12,
            blocks: [{ type: 'read', text: '**Maria Skłodowska-Curie** (1867–1934) urodziła się w **Warszawie** pod zaborem rosyjskim. Dziewczętom nie wolno było studiować na uniwersytecie, więc uczyła się na **tajnym Uniwersytecie Latającym**, a potem wyjechała do **Paryża**.\n\nOdkryła pierwiastki **polon** (nazwany na cześć Polski!) i **rad**. Jako pierwsza osoba otrzymała **dwie Nagrody Nobla** (fizyka 1903, chemia 1911).' }],
            practice: [mc('Jaki pierwiastek Maria nazwała na cześć Polski?', ['polon', 'rad', 'tlen'], 0, 'Polon.', { fixed: true }), num('Ile Nagród Nobla zdobyła Maria Skłodowska-Curie?', 2, 'Dwie.'), mc('Dokąd wyjechała na studia?', ['do Paryża', 'do Sydney', 'do Moskwy'], 0, 'Do Paryża.', { fixed: true })],
          },
          {
            id: 'traugutt', title: 'Powstanie styczniowe — Romuald Traugutt', minutes: 12,
            blocks: [{ type: 'read', text: 'W XIX wieku Polacy wiele razy walczyli z zaborcami: **powstanie listopadowe (1830)** i **styczniowe (1863)**. Ostatnim dyktatorem powstania styczniowego był **Romuald Traugutt** — stracony przez Rosjan w 1864 roku na stokach Cytadeli w Warszawie.\n\nMimo klęsk powstania podtrzymały **ducha narodowego**. Po powstaniu nasiliła się **rusyfikacja** (zakaz polskiego w szkołach) i **germanizacja**.' }],
            practice: [num('W którym roku wybuchło powstanie styczniowe?', 1863, '1863.'), mc('Kto był ostatnim dyktatorem powstania styczniowego?', ['Romuald Traugutt', 'Józef Piłsudski', 'Tadeusz Kościuszko'], 0, 'Romuald Traugutt.', { fixed: true }), mc('Rusyfikacja to…', ['zmuszanie Polaków do porzucenia polskości na rzecz rosyjskiej', 'nauka rosyjskich tańców', 'budowa dróg'], 0, 'Wynaradawianie.', { fixed: true })],
          },
          {
            id: 'pilsudski', title: 'Józef Piłsudski i 11 listopada 1918', minutes: 15,
            blocks: [{ type: 'read', text: '**Józef Piłsudski** utworzył **Legiony Polskie** w czasie I wojny światowej. **11 listopada 1918 roku** przejął władzę nad wojskiem w Warszawie — Polska **odzyskała niepodległość** po 123 latach.\n\nW **1920 roku** Polacy obronili się przed bolszewicką Rosją w **Bitwie Warszawskiej** („Cud nad Wisłą”).\n\nPiłsudski został **Naczelnikiem Państwa**; nazywano go **Marszałkiem**.' }],
            practice: [num('W którym roku Polska odzyskała niepodległość?', 1918, '1918.'), mc('Jak nazywano Bitwę Warszawską 1920?', ['Cud nad Wisłą', 'Potop', 'Odsiecz'], 0, 'Cud nad Wisłą.', { fixed: true }), mc('Piłsudski utworzył…', ['Legiony Polskie', 'Akademię Krakowską', 'husarię'], 0, 'Legiony.', { fixed: true })],
          },
          {
            id: 'gdynia', title: 'Eugeniusz Kwiatkowski i budowa Gdyni', minutes: 10,
            blocks: [{ type: 'read', text: 'Odrodzona Polska miała tylko mały dostęp do **morza**. Gdańsk był **Wolnym Miastem**, więc z małej wioski rybackiej zbudowano **port w Gdyni** — jeden z najnowocześniejszych w Europie. Budowę wspierał minister **Eugeniusz Kwiatkowski** (także twórca **Centralnego Okręgu Przemysłowego**).\n\nGdynia rozwijała się tak szybko, że nazywano ją „**miastem z morza i marzeń**”.' }],
            practice: [mc('Jaki port zbudowano w okresie międzywojennym?', ['Gdynię', 'Szczecin', 'Kołobrzeg'], 0, 'Gdynię.', { fixed: true }), mc('Kto wspierał budowę Gdyni?', ['Eugeniusz Kwiatkowski', 'Mikołaj Kopernik', 'Jan Paweł II'], 0, 'Eugeniusz Kwiatkowski.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Polon odkryła…', ['Maria Skłodowska-Curie', 'Jadwiga', 'Dobrawa'], 0, 'Maria Skłodowska-Curie.', { fixed: true }), mc('11 listopada 1918 to…', ['odzyskanie niepodległości', 'chrzest Polski', 'odsiecz wiedeńska'], 0, 'Niepodległość.', { fixed: true }), mc('Gdańsk w okresie międzywojennym był…', ['Wolnym Miastem', 'stolicą Polski', 'częścią Litwy'], 0, 'Wolne Miasto Gdańsk.', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od powstania styczniowego (1863) do odzyskania niepodległości?', 55, '1918 − 1863 = 55.')), star(mc('W którym wieku Maria Skłodowska-Curie otrzymała pierwszego Nobla (1903)?', ['XX', 'XIX', 'XXI'], 0, '1903 → XX wiek.', { fixed: true }))],
      },
      {
        id: 'xx-wiek', term: 2, strand: 'Postacie i wydarzenia', bridge: 'history',
        title: 'II wojna światowa i czasy najnowsze',
        summary: 'Wybuch II wojny (1939), Szare Szeregi, Witold Pilecki, Powstanie Warszawskie, Jan Paweł II, Solidarność i 1989.',
        lessons: [
          {
            id: 'wojna', title: 'II wojna światowa i Szare Szeregi', minutes: 15,
            blocks: [{ type: 'read', text: '**1 września 1939** Niemcy napadły na Polskę, a **17 września** — Związek Sowiecki. Bohatersko bronili się m.in. żołnierze na **Westerplatte**.\n\nW czasie okupacji działało **Polskie Państwo Podziemne**. Harcerze z **Szarych Szeregów** — **„Zośka”, „Alek” i „Rudy”** — prowadzili **mały sabotaż** (napisy „Polska walczy”, znak **Kotwicy**). Ich historię opisał Aleksander Kamiński w książce „**Kamienie na szaniec**”.\n\n**Witold Pilecki** dobrowolnie dał się zamknąć w obozie **Auschwitz**, by przekazać światu prawdę o nim.' }, { type: 'tip', text: 'To trudny temat. Mówcie spokojnie, na poziomie dziecka: o odwadze, pomocy innym i o tym, że pamiętamy.' }],
            practice: [mc('Kiedy wybuchła II wojna światowa?', ['1 września 1939', '11 listopada 1918', '15 lipca 1410'], 0, '1 września 1939.', { fixed: true }), mc('Co oznaczał znak Kotwicy?', ['Polska Walcząca', 'port w Gdyni', 'harcerski obóz'], 0, 'Symbol Polski Walczącej.', { fixed: true }), mc('Kto opisał losy „Zośki”, „Alka” i „Rudego”?', ['Aleksander Kamiński', 'Jan Brzechwa', 'Henryk Sienkiewicz'], 0, '„Kamienie na szaniec”.', { fixed: true })],
          },
          {
            id: 'powstanie-w', title: 'Powstanie Warszawskie', minutes: 12,
            blocks: [{ type: 'read', text: '**1 sierpnia 1944** o godzinie **17:00** („Godzina W”) w Warszawie wybuchło **powstanie** przeciwko Niemcom. Walczyli żołnierze **Armii Krajowej**, także młodzież i harcerze (np. jako łącznicy i sanitariuszki). Powstanie trwało **63 dni**. Po jego upadku Niemcy prawie całkowicie zniszczyli Warszawę.\n\nCo roku 1 sierpnia o 17:00 w Warszawie wyją syreny i ludzie stają na minutę w ciszy.' }],
            practice: [inp('O której godzinie wybuchło Powstanie Warszawskie? (np. 12:00)', ['17:00'], '„Godzina W” — 17:00.', { check: 'time', strict24: true }), num('Ile dni trwało Powstanie Warszawskie?', 63, '63 dni.'), mc('Kto głównie walczył w Powstaniu Warszawskim?', ['żołnierze Armii Krajowej', 'husaria', 'kosynierzy'], 0, 'Armia Krajowa.', { fixed: true })],
          },
          {
            id: 'janpawel', title: 'Jan Paweł II i „Solidarność”', minutes: 12,
            blocks: [{ type: 'read', text: 'Po wojnie Polska była zależna od **ZSRS** — rządzili komuniści.\n\n**1978** — kardynał **Karol Wojtyła** z Krakowa został papieżem **Janem Pawłem II**. Jego słowa „**Niech zstąpi Duch Twój i odnowi oblicze ziemi. Tej ziemi!**” (1979) dodały Polakom odwagi.\n\n**1980** — strajki w **Stoczni Gdańskiej**, powstał związek „**Solidarność**”, na czele z **Lechem Wałęsą**.\n\n**1989** — **Okrągły Stół** i częściowo wolne wybory 4 czerwca → Polska znów w pełni niepodległa i demokratyczna. **1999** — NATO, **2004** — Unia Europejska.' }],
            practice: [mc('Kim był Karol Wojtyła?', ['papieżem Janem Pawłem II', 'królem Polski', 'astronomem'], 0, 'Papież od 1978.', { fixed: true }), mc('Kto stał na czele „Solidarności”?', ['Lech Wałęsa', 'Józef Piłsudski', 'Witold Pilecki'], 0, 'Lech Wałęsa.', { fixed: true }), num('W którym roku Polska wstąpiła do Unii Europejskiej?', 2004, '2004.'), mc('Gdzie zaczęły się strajki w 1980 roku?', ['w Stoczni Gdańskiej', 'w Krakowie', 'w Zakopanem'], 0, 'W Stoczni Gdańskiej.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Powstanie Warszawskie wybuchło w roku…', ['1944', '1939', '1989'], 0, '1944.', { fixed: true }), mc('Westerplatte broniło się w…', ['1939', '1683', '1920'], 0, 'We wrześniu 1939.', { fixed: true }), mc('Polska wstąpiła do NATO w…', ['1999', '2004', '1989'], 0, '1999.', { fixed: true }), mc('„Solidarność” powstała w…', ['1980', '1918', '1944'], 0, '1980.', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od wybuchu II wojny światowej do wolnych wyborów w 1989?', 50, '1989 − 1939 = 50.')), star(mc('Ułóż chronologicznie: Grunwald, odsiecz wiedeńska, chrzest Polski. Co jest w środku?', ['Grunwald', 'odsiecz wiedeńska', 'chrzest Polski'], 0, '966 → 1410 → 1683.', { fixed: true }))],
      },
    ],
  });
})();

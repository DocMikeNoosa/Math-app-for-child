/* Klasa 3 — edukacja społeczna (z elementami historii i etyki), podstawa programowa I etapu edukacyjnego. */
(function () {
  const { mc, pf, num, write, star } = LA.Q;

  LA.addSubject('pl3', {
    id: 'spoleczna',
    intro: 'Rodzina i szkoła, zasady i prawa dziecka, moja miejscowość, Polska i jej symbole, święta narodowe, legendy, sławni Polacy, Polska w Europie.',
    chapters: [
      {
        id: 'rodzina-szkola', term: 1, strand: 'Ja i inni', bridge: 'rules',
        title: 'Rodzina, szkoła i zasady',
        summary: 'Członkowie rodziny i ich obowiązki, prawa i obowiązki ucznia, zasady w grupie, prawa dziecka, rozwiązywanie konfliktów.',
        outcomes: ['Opisuję swoją rodzinę i obowiązki domowe', 'Znam prawa i obowiązki ucznia', 'Wiem, jak rozwiązać konflikt bez przemocy'],
        lessons: [
          {
            id: 'rodzina', title: 'Moja rodzina', minutes: 12,
            blocks: [
              { type: 'read', text: '**Rodzina** to najbliżsi: rodzice, rodzeństwo, dziadkowie, ciocie, wujkowie, kuzyni.\n\nCiekawe nazwy krewnych:\n- **teściowie** — rodzice męża lub żony\n- **wnuk, wnuczka** — dziecko syna lub córki\n- **prawnuk** — dziecko wnuka\n\nKażdy w rodzinie ma **obowiązki**: sprzątanie pokoju, nakrywanie do stołu, wyprowadzanie psa. Rodzina pomaga sobie i spędza czas razem.' },
              { type: 'vocab', words: [['rodzeństwo', 'bracia i siostry', 'siblings'], ['dziadkowie', 'rodzice rodziców', 'grandparents'], ['kuzyn', 'dziecko cioci lub wujka', 'cousin'], ['obowiązek', 'coś, co trzeba zrobić', 'chore, duty']] },
            ],
            practice: [
              mc('Kim jest dla ciebie siostra twojej mamy?', ['babcią', 'ciocią', 'kuzynką', 'siostrą'], 1, 'Siostra mamy to ciocia.'),
              mc('Kim jest dla ciebie syn twojej cioci?', ['bratem', 'wujkiem', 'kuzynem', 'wnukiem'], 2, 'Kuzyn.'),
              mc('Kim jesteś dla swojej babci?', ['wnuczką', 'córką', 'siostrą'], 0, 'Wnuczką.', { fixed: true }),
              write('Napisz, jakie masz obowiązki w domu i dlaczego warto je wykonywać.', ['Co najmniej 2 obowiązki', 'Dlaczego to ważne'], 20, { homework: true }),
            ],
          },
          {
            id: 'uczen', title: 'Prawa i obowiązki ucznia', minutes: 12,
            blocks: [
              { type: 'read', text: 'Uczeń ma **prawa**: do nauki, do szacunku, do wyrażania zdania, do pomocy nauczyciela, do odpoczynku.\n\nI **obowiązki**: przychodzić na czas, odrabiać prace domowe, szanować innych i ich rzeczy, przestrzegać regulaminu szkoły.\n\nKażda klasa ustala **kontrakt** (zasady) — wszyscy się do niego stosują.' },
            ],
            practice: [
              mc('Co jest obowiązkiem ucznia?', ['spóźnianie się', 'odrabianie prac domowych', 'przeszkadzanie innym'], 1, 'Odrabianie prac domowych.', { fixed: true }),
              mc('Co jest prawem ucznia?', ['prawo do szacunku', 'prawo do bicia', 'prawo do niszczenia ławek'], 0, 'Prawo do szacunku.', { fixed: true }),
              pf('Zasady w klasie obowiązują wszystkich uczniów.', true, 'Tak, dla wszystkich.'),
            ],
          },
          {
            id: 'prawa-dziecka', title: 'Prawa dziecka', minutes: 12,
            blocks: [
              { type: 'read', text: '**Konwencja o prawach dziecka** to ważny dokument, który przyjęła ONZ w 1989 roku. Pomysł na nią zgłosiła **Polska**! Inspiracją był **Janusz Korczak** — lekarz i pedagog, który opiekował się sierotami.\n\nKażde dziecko ma prawo do: życia i zdrowia, nauki, zabawy i odpoczynku, wyrażania swojego zdania, ochrony przed przemocą, posiadania imienia i obywatelstwa.\n\nW Polsce działa **Rzecznik Praw Dziecka**, a dzieci mogą dzwonić po pomoc pod bezpłatny numer **116 111**.' },
            ],
            practice: [
              mc('Kto był inspiracją Konwencji o prawach dziecka?', ['Janusz Korczak', 'Fryderyk Chopin', 'Mikołaj Kopernik'], 0, 'Janusz Korczak.', { fixed: true }),
              mc('Które z nich jest prawem dziecka?', ['prawo do zabawy i odpoczynku', 'prawo do prowadzenia samochodu', 'prawo do niechodzenia do szkoły'], 0, 'Zabawa i odpoczynek.', { fixed: true }),
              mc('Pod jaki numer dziecko może zadzwonić po pomoc i rozmowę?', ['116 111', '000', '997'], 0, 'Telefon zaufania dla dzieci i młodzieży: 116 111.', { fixed: true }),
            ],
          },
          {
            id: 'konflikty', title: 'Jak rozwiązywać konflikty?', minutes: 12,
            blocks: [
              { type: 'read', text: 'Konflikty zdarzają się każdemu. Jak je rozwiązać?\n1. **Uspokój się** — weź trzy głębokie oddechy.\n2. **Powiedz, co czujesz**: „Jest mi przykro, kiedy…”\n3. **Wysłuchaj** drugiej osoby.\n4. **Poszukajcie rozwiązania** dobrego dla obu stron (kompromis).\n5. Jeśli nie umiecie — poproście o pomoc dorosłego.\n\nNigdy nie używamy przemocy ani przezwisk.' },
            ],
            practice: [
              mc('Kolega zabrał ci piłkę. Co robisz?', ['biję go', 'mówię spokojnie, że mi przykro i proszę o oddanie', 'płaczę i krzyczę'], 1, 'Spokojna rozmowa.', { fixed: true }),
              mc('Co to jest kompromis?', ['wygrywa silniejszy', 'rozwiązanie, na które zgadzają się obie strony', 'kłótnia'], 1, 'Każdy trochę ustępuje.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Rodzice taty to dla ciebie…', ['dziadkowie', 'wujkowie', 'kuzyni'], 0, 'Dziadkowie.', { fixed: true }), mc('Kontrakt klasowy to…', ['zasady ustalone w klasie', 'lista zakupów', 'plan lekcji'], 0, 'Zasady klasy.', { fixed: true }), mc('Rozwiązując konflikt, najpierw…', ['się uspokajam', 'krzyczę', 'uciekam'], 0, 'Uspokajam się.', { fixed: true })] },
        challenge: [star(mc('Brat twojego taty ma córkę. Kim ona jest dla ciebie?', ['siostrą', 'ciocią', 'kuzynką', 'bratanicą'], 2, 'Córka wujka to kuzynka.')), star(mc('Dlaczego zasady są potrzebne w grupie?', ['żeby nauczyciel mógł karać', 'żeby wszyscy czuli się bezpiecznie i traktowani sprawiedliwie', 'nie są potrzebne'], 1, 'Zasady chronią wszystkich.', { fixed: true }))],
      },
      {
        id: 'miejscowosc', term: 1, strand: 'Moja okolica', bridge: 'local-community',
        title: 'Moja miejscowość i region',
        summary: 'Miasto i wieś, instytucje w miejscowości, zawody, adres, region i jego tradycje.',
        lessons: [
          {
            id: 'miasto-wies', title: 'Miasto i wieś', minutes: 12,
            blocks: [
              { type: 'read', text: '**Miasto** — dużo ludzi, bloki, sklepy, tramwaje, teatry, szpitale.\n**Wieś** — mniej ludzi, domy z ogrodami, pola, gospodarstwa, zwierzęta hodowlane.\n\nW każdej miejscowości są ważne miejsca (**instytucje**): **urząd gminy lub miasta** (prowadzi go wójt, burmistrz lub prezydent miasta), **szkoła**, **poczta**, **przychodnia**, **biblioteka**, **posterunek policji**, **straż pożarna**.' },
              { type: 'vocab', words: [['urząd', 'miejsce, gdzie załatwia się sprawy', 'council office'], ['burmistrz', 'szef miasta', 'mayor'], ['wójt', 'szef gminy wiejskiej', 'head of a rural district']] },
            ],
            practice: [
              mc('Kto kieruje gminą wiejską?', ['wójt', 'król', 'dyrektor szkoły'], 0, 'Wójt.', { fixed: true }),
              mc('Gdzie wypożyczysz książkę?', ['na poczcie', 'w bibliotece', 'w przychodni'], 1, 'W bibliotece.', { fixed: true }),
              mc('Kto kieruje dużym miastem, takim jak Warszawa?', ['wójt', 'prezydent miasta', 'sołtys'], 1, 'Prezydent miasta.', { fixed: true }),
            ],
          },
          {
            id: 'zawody', title: 'Zawody ludzi', minutes: 12,
            blocks: [
              { type: 'read', text: 'Ludzie wykonują różne **zawody**: lekarz, nauczycielka, strażak, policjant, rolnik, piekarz, informatyk, kierowca, weterynarz, architekt.\n\nKażdy zawód jest potrzebny. Do niektórych trzeba długo się uczyć (lekarz — ok. 6 lat studiów!).' },
            ],
            practice: [
              mc('Kto leczy zwierzęta?', ['weterynarz', 'architekt', 'piekarz'], 0, 'Weterynarz.', { fixed: true }),
              mc('Kto projektuje budynki?', ['architekt', 'listonosz', 'rolnik'], 0, 'Architekt.', { fixed: true }),
              write('Kim chciałabyś zostać w przyszłości? Napisz, dlaczego, i czego trzeba się nauczyć.', ['Zawód', 'Dlaczego', 'Czego trzeba się nauczyć'], 25, { homework: true }),
            ],
          },
          {
            id: 'adres', title: 'Mój adres i region', minutes: 12,
            blocks: [
              { type: 'read', text: 'Adres to: **imię i nazwisko, ulica i numer domu/mieszkania, kod pocztowy, miejscowość**.\n\nKod pocztowy w Polsce wygląda tak: **00-950** (dwie cyfry, myślnik, trzy cyfry).\n\nPolska dzieli się na **16 województw**. Regiony mają swoje tradycje: **górale** na Podhalu (strój, muzyka), **Kaszubi** nad morzem (własny język kaszubski), **Ślązacy**, **Kurpie** (wycinanki).' },
              { type: 'tip', text: 'Naucz się swojego adresu na pamięć — przyda się, gdy się zgubisz.' },
            ],
            practice: [
              mc('Na ile województw dzieli się Polska?', ['10', '16', '20', '49'], 1, '16 województw.', { fixed: true }),
              mc('Który zapis to polski kod pocztowy?', ['00-950', '2000', 'NSW 2000', '9-50'], 0, 'Dwie cyfry, myślnik, trzy cyfry.'),
              mc('Kto mieszka na Podhalu?', ['górale', 'Kaszubi', 'Kurpie'], 0, 'Górale.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Urzędem w mieście kieruje…', ['burmistrz lub prezydent miasta', 'dyrektor szkoły', 'policjant'], 0, 'Burmistrz/prezydent.', { fixed: true }), mc('Kod pocztowy ma…', ['5 cyfr', '3 cyfry', '10 cyfr'], 0, 'Pięć cyfr: 00-000.', { fixed: true }), mc('Kaszubi mieszkają…', ['nad morzem', 'w Tatrach', 'na Śląsku'], 0, 'Na Pomorzu, nad morzem.', { fixed: true })] },
        challenge: [star(mc('Jak nazywa się mniejsza część gminy wiejskiej (jedna wieś), którą kieruje sołtys?', ['sołectwo', 'województwo', 'powiat'], 0, 'Sołectwo.', { fixed: true }))],
      },
      {
        id: 'ojczyzna', term: 1, strand: 'Polska — moja ojczyzna', bridge: 'national-symbols',
        title: 'Polska i jej symbole',
        summary: 'Godło, flaga, hymn; stolica; Polacy w kraju i za granicą; Polska i Australia na mapie świata.',
        outcomes: ['Opisuję godło, flagę i hymn Polski', 'Wiem, jak zachować się podczas hymnu', 'Wskazuję stolicę Polski'],
        lessons: [
          {
            id: 'symbole', title: 'Godło, flaga i hymn', minutes: 15,
            blocks: [
              { type: 'read', text: '**Symbole narodowe Polski**:\n- **Godło** — biały orzeł ze złotą koroną na czerwonym tle\n- **Flaga** — biało-czerwona (biały pas u góry, czerwony na dole)\n- **Hymn** — „**Mazurek Dąbrowskiego**”, słowa napisał **Józef Wybicki** w 1797 roku. Zaczyna się: „Jeszcze Polska nie zginęła, kiedy my żyjemy…”\n\nPodczas hymnu **stoimy prosto, w ciszy**, nie jemy, nie rozmawiamy, chłopcy zdejmują czapki.\n\n**2 maja** to Dzień Flagi.' },
              { type: 'tip', text: 'Flaga Australii jest niebieska z gwiazdami Krzyża Południa i brytyjską flagą w rogu. Porównajcie obie flagi!' },
            ],
            practice: [
              mc('Jak wygląda godło Polski?', ['biały orzeł w koronie na czerwonym tle', 'czerwony orzeł na białym tle', 'lew na niebieskim tle'], 0, 'Biały orzeł w złotej koronie na czerwonym tle.', { fixed: true }),
              mc('Jaki kolor jest na górze polskiej flagi?', ['czerwony', 'biały'], 1, 'Biały u góry, czerwony na dole.', { fixed: true }),
              mc('Jak nazywa się hymn Polski?', ['„Rota”', '„Mazurek Dąbrowskiego”', '„Sto lat”', '„Advance Australia Fair”'], 1, '„Mazurek Dąbrowskiego”.'),
              mc('Kto napisał słowa hymnu?', ['Józef Wybicki', 'Adam Mickiewicz', 'Jan Brzechwa'], 0, 'Józef Wybicki.', { fixed: true }),
              mc('Jak zachowujemy się podczas hymnu?', ['siedzimy i jemy', 'stoimy prosto w ciszy', 'tańczymy'], 1, 'Postawa „na baczność”, cisza.', { fixed: true }),
            ],
          },
          {
            id: 'stolica', title: 'Warszawa — stolica Polski', minutes: 12,
            blocks: [
              { type: 'read', text: '**Warszawa** leży nad **Wisłą**. Jest stolicą od końca XVI wieku — przeniósł ją tam z Krakowa król **Zygmunt III Waza** (jego pomnik to **Kolumna Zygmunta**).\n\nW Warszawie pracują **Prezydent RP**, **Sejm i Senat** oraz **rząd**.\n\nSymbol Warszawy to **Syrenka** z mieczem i tarczą. Ważne miejsca: Zamek Królewski, Stare Miasto, Łazienki Królewskie, Pałac Kultury i Nauki.\n\nW czasie II wojny światowej Warszawa została prawie całkiem zniszczona i odbudowana.' },
            ],
            practice: [
              mc('Jaki symbol ma Warszawa?', ['smoka', 'Syrenkę', 'koziołki'], 1, 'Syrenkę.', { fixed: true }),
              mc('Nad jaką rzeką leży Warszawa?', ['Odrą', 'Wisłą', 'Wartą'], 1, 'Nad Wisłą.', { fixed: true }),
              mc('Kto przeniósł stolicę z Krakowa do Warszawy?', ['Zygmunt III Waza', 'Mieszko I', 'Bolesław Chrobry'], 0, 'Zygmunt III Waza.', { fixed: true }),
              mc('Gdzie obraduje Sejm?', ['w Krakowie', 'w Warszawie', 'w Gdańsku'], 1, 'W Warszawie.', { fixed: true }),
            ],
          },
          {
            id: 'polska-swiat', title: 'Polska w Europie i na świecie', minutes: 12,
            blocks: [
              { type: 'read', text: 'Polska leży w **Europie Środkowej**. Sąsiedzi: **Niemcy** (zachód), **Czechy i Słowacja** (południe), **Ukraina, Białoruś** (wschód), **Litwa i Rosja** (obwód kaliningradzki, północny wschód). Na północy — **Morze Bałtyckie**.\n\nOd **2004 roku** Polska jest w **Unii Europejskiej**. Pieniądze w Polsce to **złoty (zł)**.\n\n**Australia** jest na drugim końcu świata — to jednocześnie państwo i kontynent. Lot z Polski trwa ponad 20 godzin!' },
            ],
            practice: [
              mc('Z którym państwem Polska graniczy na zachodzie?', ['z Niemcami', 'z Ukrainą', 'z Litwą'], 0, 'Z Niemcami.', { fixed: true }),
              num('W którym roku Polska wstąpiła do Unii Europejskiej?', 2004, 'W 2004 roku.'),
              mc('Na jakim kontynencie leży Polska?', ['w Europie', 'w Azji', 'w Australii'], 0, 'W Europie.', { fixed: true }),
              mc('Jak nazywają się pieniądze w Polsce?', ['euro', 'złoty', 'dolar'], 1, 'Złoty.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Godło Polski to…', ['orzeł', 'lew', 'niedźwiedź'], 0, 'Biały orzeł.', { fixed: true }), mc('Dzień Flagi obchodzimy…', ['2 maja', '11 listopada', '24 grudnia'], 0, '2 maja.', { fixed: true }), mc('Stolica Polski to…', ['Kraków', 'Warszawa', 'Gdańsk'], 1, 'Warszawa.', { fixed: true }), mc('Hymn zaczyna się od słów…', ['„Jeszcze Polska nie zginęła…”', '„Sto lat…”', '„Wlazł kotek…”'], 0, '„Jeszcze Polska nie zginęła, kiedy my żyjemy”.', { fixed: true })] },
        challenge: [star(mc('Ile państw graniczy z Polską?', ['5', '7', '9'], 1, 'Niemcy, Czechy, Słowacja, Ukraina, Białoruś, Litwa, Rosja → 7.', { fixed: true }))],
      },
      {
        id: 'swieta', term: 2, strand: 'Polska — moja ojczyzna', bridge: 'celebrations',
        title: 'Święta i tradycje',
        summary: 'Święta narodowe (11 Listopada, 3 Maja), święta rodzinne i religijne, tradycje polskie i australijskie.',
        lessons: [
          {
            id: 'narodowe', title: 'Święta narodowe', minutes: 15,
            blocks: [
              { type: 'read', text: '- **11 listopada — Narodowe Święto Niepodległości**. W 1918 roku Polska odzyskała niepodległość po **123 latach** niewoli (zaborów). Ważną postacią był **Józef Piłsudski**.\n- **3 maja — Święto Konstytucji 3 Maja**. W 1791 roku uchwalono pierwszą w Europie (i drugą na świecie) nowoczesną konstytucję.\n- **2 maja — Dzień Flagi**.\n\nW te dni wywieszamy flagi i bierzemy udział w uroczystościach.' },
              { type: 'vocab', words: [['niepodległość', 'wolność państwa', 'independence'], ['konstytucja', 'najważniejsze prawo w państwie', 'constitution'], ['zabory', 'czas, gdy Polskę podzielili sąsiedzi', 'partitions']] },
            ],
            practice: [
              mc('Kiedy obchodzimy Święto Niepodległości?', ['3 maja', '11 listopada', '1 stycznia'], 1, '11 listopada.', { fixed: true }),
              num('W którym roku Polska odzyskała niepodległość?', 1918, 'W 1918 roku.'),
              num('Ile lat Polski nie było na mapie (zabory)?', 123, '123 lata.'),
              mc('Co uchwalono 3 maja 1791 roku?', ['konstytucję', 'hymn', 'nową walutę'], 0, 'Konstytucję 3 Maja.', { fixed: true }),
            ],
          },
          {
            id: 'tradycje', title: 'Tradycje i zwyczaje', minutes: 12,
            blocks: [
              { type: 'read', text: '- **Wigilia** (24 grudnia) — opłatek, 12 potraw, pierwsza gwiazdka, puste miejsce przy stole dla wędrowca\n- **Wielkanoc** — pisanki, święconka, **śmigus-dyngus** (lany poniedziałek)\n- **Andrzejki** (29/30 listopada) — wróżby, lanie wosku\n- **Topienie Marzanny** — pożegnanie zimy (pierwszy dzień wiosny)\n- **Tłusty czwartek** — pączki!\n\nW **Australii**: Australia Day (26 stycznia), Anzac Day (25 kwietnia), Boże Narodzenie latem — często na plaży!' },
            ],
            practice: [
              mc('Co dzielimy w Wigilię?', ['opłatek', 'tort', 'pączki'], 0, 'Opłatek.', { fixed: true }),
              mc('Kiedy topi się Marzannę?', ['w pierwszy dzień wiosny', 'w Wigilię', 'w Andrzejki'], 0, 'Na powitanie wiosny.', { fixed: true }),
              mc('Co jemy w tłusty czwartek?', ['pączki', 'pierniki', 'jajka'], 0, 'Pączki i faworki.', { fixed: true }),
              mc('Jaka pora roku jest w Australii w Boże Narodzenie?', ['zima', 'lato'], 1, 'Lato — półkula południowa.', { fixed: true }),
              write('Opisz swoją ulubioną tradycję rodzinną.', ['Jakie to święto', 'Co robicie', 'Dlaczego ją lubisz'], 25, { homework: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Konstytucja 3 Maja została uchwalona w roku…', ['1791', '1918', '2004'], 0, '1791.', { fixed: true }), mc('Śmigus-dyngus to tradycja…', ['wielkanocna', 'bożonarodzeniowa', 'andrzejkowa'], 0, 'Wielkanocna.', { fixed: true }), mc('Kto był ważną postacią odzyskania niepodległości w 1918 roku?', ['Józef Piłsudski', 'Mikołaj Kopernik', 'Fryderyk Chopin'], 0, 'Józef Piłsudski.', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od odzyskania niepodległości (1918) do wejścia do Unii Europejskiej (2004)?', 86, '2004 − 1918 = 86.'))],
      },
      {
        id: 'legendy-historia', term: 2, strand: 'Polska — moja ojczyzna', bridge: 'history',
        title: 'Legendy i początki Polski',
        summary: 'Legenda o Lechu, Czechu i Rusie, Gniezno, Mieszko I i chrzest Polski, pierwszy król Bolesław Chrobry.',
        lessons: [
          {
            id: 'lech', title: 'Legenda o Lechu, Czechu i Rusie', minutes: 12,
            blocks: [
              { type: 'read', text: 'Dawno temu trzej bracia — **Lech, Czech i Rus** — wędrowali ze swoimi plemionami, szukając nowego domu. Lech zobaczył na wielkim dębie **gniazdo białego orła** na tle czerwonego zachodzącego słońca. Postanowił zostać i założył gród **Gniezno** (od słowa „gniazdo”). Czech poszedł na południe, a Rus na wschód.\n\nTa legenda tłumaczy, skąd wziął się **biały orzeł na czerwonym tle** w godle Polski.' },
            ],
            practice: [
              mc('Jaki gród założył Lech?', ['Kraków', 'Gniezno', 'Warszawę'], 1, 'Gniezno.', { fixed: true }),
              mc('Od jakiego słowa pochodzi nazwa Gniezno?', ['gniew', 'gniazdo', 'gnom'], 1, 'Od „gniazda” orła.', { fixed: true }),
              mc('Co wyjaśnia ta legenda?', ['skąd wziął się orzeł w godle', 'dlaczego pada deszcz', 'kto pokonał smoka'], 0, 'Pochodzenie godła.', { fixed: true }),
            ],
          },
          {
            id: 'mieszko', title: 'Mieszko I i Bolesław Chrobry', minutes: 15,
            blocks: [
              { type: 'read', text: '**Mieszko I** — pierwszy znany władca Polski. W **966 roku** przyjął **chrzest** — to uważa się za początek państwa polskiego. Jego żoną była czeska księżniczka **Dobrawa**.\n\n**Bolesław Chrobry** — syn Mieszka — w **1025 roku** został **pierwszym królem Polski**.\n\nRód pierwszych władców nazywamy **Piastami** (od legendarnego Piasta Kołodzieja).' },
            ],
            practice: [
              num('W którym roku odbył się chrzest Polski?', 966, 'W 966 roku.'),
              mc('Kto był pierwszym królem Polski?', ['Mieszko I', 'Bolesław Chrobry', 'Zygmunt III Waza'], 1, 'Bolesław Chrobry (1025).', { fixed: true }),
              mc('Jak nazywa się ród pierwszych władców Polski?', ['Piastowie', 'Jagiellonowie', 'Wazowie'], 0, 'Piastowie.', { fixed: true }),
            ],
          },
          {
            id: 'slawni', title: 'Sławni Polacy', minutes: 15,
            blocks: [
              { type: 'read', text: '- **Mikołaj Kopernik** — astronom: „wstrzymał Słońce, ruszył Ziemię”\n- **Maria Skłodowska-Curie** — uczona, odkryła polon i rad; jako pierwsza osoba zdobyła **dwie Nagrody Nobla**\n- **Fryderyk Chopin** — kompozytor i pianista; jego muzyka (mazurki, polonezy) znana jest na całym świecie\n- **Jan Paweł II** — papież z Polski\n- **Paweł Edmund Strzelecki** — polski podróżnik, który nazwał najwyższą górę Australii **Górą Kościuszki** (Mount Kosciuszko)!' },
            ],
            practice: [
              mc('Kto zdobył dwie Nagrody Nobla?', ['Maria Skłodowska-Curie', 'Fryderyk Chopin', 'Mikołaj Kopernik'], 0, 'Maria Skłodowska-Curie.', { fixed: true }),
              mc('Kto był kompozytorem?', ['Kopernik', 'Chopin', 'Strzelecki'], 1, 'Fryderyk Chopin.', { fixed: true }),
              mc('Jak nazywa się najwyższa góra Australii, nazwana przez Polaka?', ['Uluru', 'Góra Kościuszki', 'Rysy'], 1, 'Mount Kosciuszko — na cześć Tadeusza Kościuszki.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Chrzest Polski to rok…', ['966', '1025', '1918'], 0, '966.', { fixed: true }), mc('Biały orzeł z legendy siedział w gnieździe na…', ['dębie', 'sośnie', 'skale'], 0, 'Na dębie.', { fixed: true }), mc('Kopernik był…', ['astronomem', 'kompozytorem', 'królem'], 0, 'Astronomem.', { fixed: true })] },
        challenge: [star(num('Ile lat minęło od chrztu Polski (966) do koronacji Bolesława Chrobrego (1025)?', 59, '1025 − 966 = 59.')), star(mc('Dlaczego Mount Kosciuszko ma polską nazwę?', ['Bo nazwał ją polski podróżnik Strzelecki na cześć Tadeusza Kościuszki.', 'Bo leży w Polsce.', 'Bo zdobył ją Kopernik.'], 0, 'Strzelecki w 1840 roku.', { fixed: true }))],
      },
    ],
  });
})();

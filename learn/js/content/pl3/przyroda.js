/* Klasa 3 — edukacja przyrodnicza (podstawa programowa, I etap edukacyjny). */
(function () {
  const { mc, pf, inp, num, gen, write, star } = LA.Q;

  LA.addSubject('pl3', {
    id: 'przyroda',
    intro: 'Pory roku i pogoda, ekosystemy (las, łąka, pole, staw), rośliny i zwierzęta, łańcuchy pokarmowe, woda, krajobrazy Polski, ciało i zdrowie, ochrona przyrody.',
    chapters: [
      {
        id: 'pogoda', term: 1, strand: 'Środowisko przyrodnicze', bridge: 'weather',
        title: 'Pogoda i pory roku',
        summary: 'Składniki pogody, termometr, obserwacje pogody, cztery pory roku w Polsce, zjawiska atmosferyczne.',
        outcomes: ['Wymieniam składniki pogody', 'Odczytuję temperaturę z termometru', 'Opisuję pory roku w Polsce'],
        lessons: [
          {
            id: 'skladniki', title: 'Z czego składa się pogoda?', minutes: 12,
            blocks: [
              { type: 'read', text: 'Pogodę opisujemy, podając:\n- **temperaturę** powietrza (ciepło czy zimno?) — mierzymy **termometrem** w stopniach Celsjusza (°C)\n- **zachmurzenie** — bezchmurnie, częściowe, całkowite\n- **opady** — deszcz, śnieg, grad, mżawka\n- **wiatr** — siła i kierunek\n\nPogoda zmienia się z dnia na dzień. Ludzie, którzy ją przewidują, to **synoptycy**.' },
              { type: 'vocab', words: [['temperatura', 'jak ciepło lub zimno', 'temperature'], ['opady', 'woda spadająca z chmur', 'precipitation'], ['zachmurzenie', 'ile chmur jest na niebie', 'cloud cover'], ['termometr', 'przyrząd do mierzenia temperatury', 'thermometer']] },
            ],
            practice: [
              mc('Czym mierzymy temperaturę?', ['wagą', 'termometrem', 'linijką', 'zegarem'], 1, 'Termometrem.'),
              mc('Co NIE jest opadem?', ['deszcz', 'śnieg', 'grad', 'wiatr'], 3, 'Wiatr to ruch powietrza, nie opad.'),
              num('Termometr wskazuje 5 stopni poniżej zera. Wpisz temperaturę (np. -5).', -5, 'Poniżej zera zapisujemy z minusem: −5°C.'),
              mc('Jest −3°C. Co spadnie z chmur?', ['deszcz', 'śnieg', 'nic nie może spaść'], 1, 'Poniżej zera woda zamarza — pada śnieg.', { fixed: true }),
            ],
          },
          {
            id: 'pory-roku', title: 'Cztery pory roku', minutes: 15,
            blocks: [
              { type: 'read', text: 'W Polsce są **cztery pory roku**:\n- **wiosna** (od 21 marca) — dni się wydłużają, kwitną przebiśniegi i krokusy, wracają bociany\n- **lato** (od 22 czerwca) — najdłuższe dni, upały, burze, dojrzewają owoce\n- **jesień** (od 23 września) — liście żółkną i opadają, ptaki odlatują, zbieramy grzyby\n- **zima** (od 22 grudnia) — najkrótsze dni, mróz, śnieg, niektóre zwierzęta zapadają w sen zimowy' },
              { type: 'tip', text: 'W Australii pory roku są odwrotne! Gdy w Polsce jest zima (grudzień), w Australii jest lato. To dlatego, że Australia leży na półkuli południowej.' },
            ],
            practice: [
              mc('Kiedy zaczyna się astronomiczna wiosna?', ['1 stycznia', '21 marca', '22 czerwca', '23 września'], 1, '21 marca.'),
              mc('W której porze roku ptaki odlatują do ciepłych krajów?', ['wiosna', 'lato', 'jesień', 'zima'], 2, 'Jesienią.', { fixed: true }),
              mc('Kiedy dni są najdłuższe?', ['wiosną', 'latem', 'jesienią', 'zimą'], 1, 'Najdłuższy dzień jest około 22 czerwca.', { fixed: true }),
              mc('Jaka pora roku jest w Australii w grudniu?', ['zima', 'lato', 'jesień', 'wiosna'], 1, 'Na półkuli południowej pory roku są odwrotne.'),
              mc('Który kwiat zakwita jako jeden z pierwszych wiosną?', ['słonecznik', 'przebiśnieg', 'róża', 'mak'], 1, 'Przebiśnieg — „przebija śnieg”.'),
            ],
          },
          {
            id: 'zjawiska', title: 'Zjawiska pogodowe i bezpieczeństwo', minutes: 12,
            blocks: [
              { type: 'read', text: 'Groźne zjawiska:\n- **burza** — błyskawice i grzmoty. Nie chowamy się pod samotnym drzewem, wychodzimy z wody, zostajemy w budynku.\n- **wichura** — silny wiatr łamie gałęzie. Unikamy drzew i lasu.\n- **upał** — pijemy wodę, nosimy czapkę, unikamy słońca w południu.\n- **mróz i gołoledź** — ciepłe ubranie, ostrożnie na śliskich chodnikach.\n\nCiekawe zjawiska: **tęcza** (słońce + krople deszczu), **mgła**, **szron**, **rosa**.' },
            ],
            practice: [
              mc('Co robisz w czasie burzy na łące?', ['chowam się pod wysokim drzewem', 'kucam z dala od drzew i wysokich miejsc, a potem szukam schronienia', 'kąpię się w stawie', 'puszczam latawiec'], 1, 'Samotne drzewa przyciągają pioruny.'),
              mc('Kiedy powstaje tęcza?', ['gdy świeci słońce i pada deszcz', 'w nocy', 'gdy jest mróz', 'gdy wieje wiatr'], 0, 'Światło słońca rozszczepia się w kroplach deszczu.'),
              mc('Ile kolorów ma tęcza?', ['3', '5', '7', '10'], 2, 'Czerwony, pomarańczowy, żółty, zielony, niebieski, granatowy, fioletowy.', { fixed: true }),
              gen('readGraph', {}, 1),
            ],
          },
          {
            id: 'kalendarz-pogody', title: '★ Kalendarz pogody', minutes: 12,
            blocks: [
              { type: 'read', text: 'Prowadź **kalendarz pogody** przez tydzień: codziennie o tej samej porze zapisz temperaturę, zachmurzenie, opady i wiatr (symbolami ☀️ ⛅ ☁️ 🌧️ ❄️ 💨).\n\nNa koniec policz: ile dni było słonecznych? Jaka była najwyższa temperatura? Jak zmieniała się pogoda?' },
              { type: 'activity', text: 'Narysujcie tabelkę na 7 dni i uzupełniajcie ją razem codziennie rano.' },
            ],
            practice: [
              num('Rano było 4°C, a w południe 11°C. O ile stopni się ociepliło?', 7, '11 − 4 = 7.'),
              num('W nocy było −2°C, a w dzień 3°C. O ile stopni się ociepliło?', 5, 'Od −2 do 0 to 2 stopnie, od 0 do 3 to 3 stopnie. Razem 5.'),
              write('Napisz krótką prognozę pogody na jutro, jak w telewizji.', ['Temperatura', 'Zachmurzenie', 'Opady', 'Wiatr', 'Rada, jak się ubrać'], 20, { homework: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Synoptyk to osoba, która…', ['przewiduje pogodę', 'leczy zwierzęta', 'buduje domy'], 0, 'Przewiduje pogodę.', { fixed: true }), mc('Kiedy zaczyna się zima astronomiczna?', ['22 grudnia', '1 grudnia', '6 stycznia'], 0, '22 grudnia.', { fixed: true }), pf('Podczas burzy można się schować pod samotnym drzewem.', false, 'To niebezpieczne.'), mc('Rosa to…', ['krople wody na trawie rano', 'rodzaj śniegu', 'silny wiatr'], 0, 'Para wodna skrapla się na zimnej trawie.', { fixed: true })] },
        challenge: [star(num('Temperatura spadła z 6°C do −4°C. O ile stopni spadła?', 10, 'Od 6 do 0 to 6 stopni, od 0 do −4 to 4. Razem 10.')), star(mc('Dlaczego zimą w Polsce dni są krótkie?', ['Bo Słońce świeci słabiej.', 'Bo Ziemia jest nachylona i nasza półkula jest wtedy odwrócona od Słońca.', 'Bo jest dużo chmur.', 'Bo jest zimno.'], 1, 'Nachylenie osi Ziemi powoduje pory roku.'))],
      },
      {
        id: 'rosliny', term: 1, strand: 'Środowisko przyrodnicze', bridge: 'living',
        title: 'Rośliny',
        summary: 'Budowa rośliny, czego potrzebuje do życia, warzywa i owoce, drzewa liściaste i iglaste.',
        lessons: [
          {
            id: 'budowa', title: 'Budowa rośliny', minutes: 12,
            blocks: [
              { type: 'read', text: 'Roślina ma:\n- **korzeń** — trzyma ją w ziemi, pobiera wodę\n- **łodygę** (u drzew: **pień**) — przewodzi wodę do liści\n- **liście** — wytwarzają pokarm dzięki światłu\n- **kwiat** — z niego powstaje **owoc** z **nasionami**\n\nRoślina do życia potrzebuje: **wody, światła, powietrza, odpowiedniej temperatury i gleby**.' },
              { type: 'vocab', words: [['korzeń', 'część w ziemi', 'root'], ['łodyga', 'część, która trzyma liście', 'stem'], ['liść', 'zielona część rośliny', 'leaf'], ['nasiono', 'z niego wyrasta nowa roślina', 'seed']] },
            ],
            practice: [
              mc('Która część rośliny pobiera wodę z ziemi?', ['liść', 'korzeń', 'kwiat', 'owoc'], 1, 'Korzeń.'),
              mc('Z czego powstaje owoc?', ['z liścia', 'z kwiatu', 'z korzenia'], 1, 'Z kwiatu.', { fixed: true }),
              mc('Czego roślina NIE potrzebuje do życia?', ['wody', 'światła', 'cukierków', 'powietrza'], 2, 'Rośliny same wytwarzają pokarm.'),
              pf('Roślina w ciemnej szafie będzie dobrze rosła.', false, 'Bez światła roślina żółknie i więdnie.'),
            ],
          },
          {
            id: 'drzewa', title: 'Drzewa liściaste i iglaste', minutes: 12,
            blocks: [
              { type: 'read', text: '**Drzewa liściaste** mają szerokie liście, które jesienią zrzucają: **dąb** (owoc: żołądź), **kasztanowiec** (kasztan), **klon**, **brzoza**, **lipa**, **buk**.\n\n**Drzewa iglaste** mają igły i szyszki; większość jest zielona przez cały rok: **sosna**, **świerk**, **jodła**. Wyjątek: **modrzew** zrzuca igły na zimę!' },
            ],
            practice: [
              mc('Owocem dębu jest…', ['kasztan', 'żołądź', 'szyszka', 'jabłko'], 1, 'Żołądź.'),
              mc('Które drzewo jest iglaste?', ['brzoza', 'lipa', 'sosna', 'klon'], 2, 'Sosna ma igły.'),
              mc('Które drzewo iglaste zrzuca igły na zimę?', ['świerk', 'modrzew', 'jodła', 'sosna'], 1, 'Modrzew.'),
              mc('Brzozę łatwo rozpoznać po…', ['białej korze', 'czerwonych liściach', 'szyszkach'], 0, 'Biała kora w czarne plamki.', { fixed: true }),
            ],
          },
          {
            id: 'warzywa', title: 'Warzywa, owoce i zboża', minutes: 12,
            blocks: [
              { type: 'read', text: 'Jemy różne części roślin:\n- **korzenie**: marchew, burak, rzodkiewka\n- **liście**: sałata, kapusta, szpinak\n- **łodygi** (bulwy): ziemniak (to bulwa pędowa), kalarepa\n- **owoce**: pomidor, ogórek, jabłko, śliwka\n- **nasiona**: groch, fasola, zboża\n\n**Zboża** w Polsce: **pszenica** (chleb, makaron), **żyto** (chleb razowy), **owies** (płatki owsiane), **jęczmień** (kasza).' },
            ],
            practice: [
              mc('Którą część marchwi jemy?', ['liść', 'korzeń', 'owoc', 'kwiat'], 1, 'Korzeń.'),
              mc('Z którego zboża robimy płatki owsiane?', ['pszenica', 'owies', 'żyto', 'jęczmień'], 1, 'Z owsa.'),
              mc('Z czego robi się mąkę na zwykły chleb i makaron?', ['z pszenicy', 'z owsa', 'z ziemniaków', 'z grochu'], 0, 'Z pszenicy.'),
              mc('Który z nich jest owocem (z punktu widzenia przyrody)?', ['marchew', 'sałata', 'pomidor', 'ziemniak'], 2, 'Pomidor powstaje z kwiatu i ma nasiona — to owoc.'),
            ],
          },
          {
            id: 'eksperyment', title: '★ Doświadczenie: kiełkowanie fasoli', minutes: 15,
            blocks: [
              { type: 'read', text: '**Doświadczenie** sprawdza, co się stanie. Przygotuj dwa słoiki z wilgotną watą i ziarnami fasoli.\n- Słoik A: na parapecie, podlewany.\n- Słoik B: na parapecie, **bez wody**.\n\n**Hipoteza** (przypuszczenie): fasola bez wody nie wykiełkuje.\n\nObserwuj przez 7 dni i zapisuj. Zmieniamy **tylko jedną rzecz** (wodę) — wtedy wiemy, co ma wpływ.' },
              { type: 'activity', text: 'Zróbcie to doświadczenie naprawdę! Codziennie zróbcie zdjęcie lub rysunek.' },
            ],
            practice: [
              mc('Co to jest hipoteza?', ['wynik doświadczenia', 'przypuszczenie, które sprawdzamy', 'rodzaj rośliny'], 1, 'Przypuszczenie przed doświadczeniem.', { fixed: true }),
              mc('Dlaczego w doświadczeniu zmieniamy tylko jedną rzecz?', ['bo tak jest szybciej', 'żeby wiedzieć, co spowodowało różnicę', 'bo nie mamy słoików'], 1, 'Wtedy porównanie jest uczciwe.', { fixed: true }),
              write('Zapisz wyniki obserwacji fasoli (albo przewidywania): co się działo w słoiku A i B?', ['Słoik A', 'Słoik B', 'Wniosek'], 20),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Liście wytwarzają pokarm dzięki…', ['światłu', 'ciemności', 'kamieniom'], 0, 'Dzięki światłu słonecznemu.', { fixed: true }), mc('Kasztan to owoc…', ['dębu', 'kasztanowca', 'sosny'], 1, 'Kasztanowca.', { fixed: true }), mc('Które drzewo ma szyszki?', ['świerk', 'lipa', 'buk'], 0, 'Świerk to drzewo iglaste.', { fixed: true }), mc('Z żyta pieczemy…', ['chleb razowy', 'tort', 'pizzę'], 0, 'Chleb żytni/razowy.', { fixed: true })] },
        challenge: [star(mc('Dlaczego drzewa liściaste zrzucają liście jesienią?', ['Bo nie lubią koloru zielonego.', 'Żeby zimą nie tracić wody i nie łamać się pod śniegiem.', 'Bo wiatr je zrywa.', 'Bo są chore.'], 1, 'Zimą woda jest zamarznięta — drzewo oszczędza wodę.'))],
      },
      {
        id: 'ekosystemy', term: 1, strand: 'Środowisko przyrodnicze', bridge: 'food-chains',
        title: 'Las, łąka, pole i staw',
        summary: 'Ekosystemy Polski: warstwy lasu, mieszkańcy łąki, pola i stawu; łańcuchy pokarmowe.',
        outcomes: ['Opisuję warstwy lasu', 'Wymieniam mieszkańców łąki, pola i stawu', 'Układam łańcuch pokarmowy'],
        lessons: [
          {
            id: 'las', title: 'Warstwy lasu', minutes: 15,
            blocks: [
              { type: 'read', text: 'Las ma **cztery warstwy**:\n1. **Korony drzew** — wiewiórki, ptaki (dzięcioł, sowa)\n2. **Podszyt** — krzewy: leszczyna, jałowiec, kruszyna\n3. **Runo leśne** — mchy, paprocie, jagody, grzyby, poziomki\n4. **Ściółka** — opadłe liście i igły; mieszkają tu mrówki, dżdżownice, jeże\n\nZasady w lesie: nie hałasujemy, nie śmiecimy, nie rozpalamy ognisk, nie zrywamy roślin chronionych.' },
              { type: 'vocab', words: [['runo leśne', 'niskie rośliny w lesie', 'forest floor plants'], ['podszyt', 'krzewy w lesie', 'understorey'], ['ściółka', 'warstwa opadłych liści', 'leaf litter']] },
            ],
            practice: [
              mc('W której warstwie lasu rosną jagody i grzyby?', ['korony drzew', 'podszyt', 'runo leśne', 'ściółka'], 2, 'Runo leśne.', { fixed: true }),
              mc('Leszczyna to krzew rosnący w…', ['koronach drzew', 'podszycie', 'stawie'], 1, 'Podszyt to warstwa krzewów.', { fixed: true }),
              mc('Co jest zabronione w lesie?', ['spacer', 'obserwowanie ptaków', 'rozpalanie ognisk w niedozwolonych miejscach', 'zbieranie śmieci'], 2, 'Grozi pożarem.'),
              pf('Ściółka to warstwa opadłych liści i igieł.', true, 'Tak.'),
            ],
          },
          {
            id: 'laka-pole', title: 'Łąka i pole', minutes: 12,
            blocks: [
              { type: 'read', text: '**Łąka** — rosną trawy i kwiaty: mniszek lekarski (dmuchawiec), koniczyna, rumianek, jaskier. Żyją tu motyle, pszczoły, koniki polne, kret, bocian (poluje na żaby).\n\n**Pole** — uprawia je rolnik: zboża, ziemniaki, buraki, rzepak. Mieszkają tu zające, kuropatwy, myszy polne, skowronki.\n\nPrace rolnika: **wiosną** orka i siew, **latem** żniwa, **jesienią** wykopki.' },
            ],
            practice: [
              mc('Mniszek lekarski to inaczej…', ['dmuchawiec', 'róża', 'tulipan', 'paproć'], 0, 'Jego nasiona fruwają na „spadochronikach”.'),
              mc('Kiedy są żniwa?', ['wiosną', 'latem', 'zimą'], 1, 'Latem zbiera się zboże.', { fixed: true }),
              mc('Który zwierzak mieszka pod ziemią na łące?', ['bocian', 'kret', 'motyl', 'zając'], 1, 'Kret kopie korytarze.'),
              mc('Wykopki to zbiór…', ['jabłek', 'ziemniaków', 'zboża'], 1, 'Jesienią wykopuje się ziemniaki.', { fixed: true }),
            ],
          },
          {
            id: 'staw', title: 'Staw i jego mieszkańcy', minutes: 12,
            blocks: [
              { type: 'read', text: 'W **stawie** i przy nim żyją: **żaby**, **traszki**, **ryby** (karp, karaś), **kaczki**, **łabędzie**, **ważki**, **nartniki** (chodzą po wodzie!).\n\nRośliny: **trzcina**, **pałka wodna**, **grążele i lilie wodne**, **rzęsa wodna**.\n\n**Cykl rozwoju żaby**: skrzek (jaja) → kijanka → kijanka z nogami → młoda żaba → dorosła żaba.' },
            ],
            practice: [
              mc('Jak nazywają się jaja żaby?', ['kijanki', 'skrzek', 'ikra kurza', 'larwy'], 1, 'Skrzek.'),
              mc('Co jest drugie w cyklu rozwoju żaby?', ['skrzek', 'kijanka', 'dorosła żaba'], 1, 'Skrzek → kijanka → żaba.', { fixed: true }),
              mc('Który owad potrafi chodzić po wodzie?', ['nartnik', 'motyl', 'mrówka', 'biedronka'], 0, 'Nartnik.'),
            ],
          },
          {
            id: 'lancuch', title: 'Łańcuch pokarmowy', minutes: 15,
            blocks: [
              { type: 'read', text: '**Łańcuch pokarmowy** pokazuje, kto kogo zjada:\n\n**trawa → zając → lis**\n**liście → gąsienica → sikorka → jastrząb**\n\n- **Roślinożercy** jedzą rośliny (zając, sarna)\n- **Mięsożercy** jedzą inne zwierzęta (lis, wilk, sowa)\n- **Wszystkożercy** jedzą i rośliny, i zwierzęta (dzik, niedźwiedź, człowiek)\n\nNa początku łańcucha zawsze jest **roślina**.' },
              { type: 'vocab', words: [['roślinożerca', 'je rośliny', 'herbivore'], ['mięsożerca', 'je mięso', 'carnivore'], ['wszystkożerca', 'je wszystko', 'omnivore'], ['łańcuch pokarmowy', 'kto kogo zjada', 'food chain']] },
            ],
            practice: [
              mc('Co jest na początku każdego łańcucha pokarmowego?', ['lis', 'roślina', 'człowiek', 'woda'], 1, 'Roślina.'),
              mc('Uzupełnij łańcuch: trawa → ___ → lis', ['zając', 'sowa', 'dąb', 'żaba'], 0, 'Zając je trawę, lis zjada zająca.'),
              mc('Dzik to…', ['roślinożerca', 'mięsożerca', 'wszystkożerca'], 2, 'Dzik je żołędzie, korzenie i robaki.', { fixed: true }),
              mc('Sowa to…', ['roślinożerca', 'mięsożerca', 'wszystkożerca'], 1, 'Sowa poluje na myszy.', { fixed: true }),
              mc('Co się stanie, gdy zniknie trawa?', ['nic', 'zające nie będą miały pokarmu, a potem lisy', 'lisów będzie więcej'], 1, 'Wszystkie ogniwa są ze sobą połączone.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 10, items: [mc('Ile warstw ma las?', ['2', '3', '4', '5'], 2, 'Cztery.', { fixed: true }), mc('Mięsożercą jest…', ['sarna', 'wilk', 'zając'], 1, 'Wilk.', { fixed: true }), mc('Skrzek to…', ['jaja żaby', 'rodzaj ryby', 'roślina'], 0, 'Jaja żaby.', { fixed: true }), mc('Rzepak rośnie na…', ['polu', 'w stawie', 'w lesie'], 0, 'Na polu.', { fixed: true }), mc('Wiewiórka mieszka najczęściej w…', ['koronach drzew', 'stawie', 'ściółce'], 0, 'W koronach drzew.', { fixed: true })] },
        challenge: [star(mc('Ułóż łańcuch: sikorka, liście dębu, jastrząb, gąsienica. Kto jest trzeci?', ['gąsienica', 'sikorka', 'jastrząb', 'liście'], 1, 'liście → gąsienica → sikorka → jastrząb.')), star(mc('Dlaczego dżdżownice są ważne dla lasu i pola?', ['Bo straszą ptaki.', 'Bo spulchniają glebę i przerabiają liście na próchnicę.', 'Bo jedzą grzyby.', 'Nie są ważne.'], 1, 'Użyźniają glebę.'))],
      },
      {
        id: 'zwierzeta', term: 2, strand: 'Środowisko przyrodnicze', bridge: 'life-cycles',
        title: 'Zwierzęta i ich życie',
        summary: 'Ssaki, ptaki, ryby, płazy, gady, owady; jak zwierzęta przygotowują się do zimy; zwierzęta chronione.',
        lessons: [
          {
            id: 'grupy', title: 'Grupy zwierząt', minutes: 15,
            blocks: [
              { type: 'read', text: '- **Ssaki** — mają sierść, karmią młode mlekiem (pies, sarna, wieloryb, człowiek)\n- **Ptaki** — mają pióra, dziób, składają jaja (bocian, wróbel)\n- **Ryby** — żyją w wodzie, mają łuski i skrzela (karp, szczupak)\n- **Płazy** — żyją w wodzie i na lądzie, mają wilgotną skórę (żaba, traszka)\n- **Gady** — mają suchą skórę z łuskami (jaszczurka, żmija, żółw)\n- **Owady** — mają 6 nóg i 3 części ciała (pszczoła, mrówka, biedronka)' },
            ],
            practice: [
              mc('Wieloryb to…', ['ryba', 'ssak', 'płaz'], 1, 'Wieloryb karmi młode mlekiem i oddycha płucami.', { fixed: true }),
              mc('Ile nóg ma owad?', ['4', '6', '8'], 1, 'Sześć. Pająk ma 8 — to nie owad!', { fixed: true }),
              mc('Żaba to…', ['gad', 'płaz', 'ssak'], 1, 'Płaz — wilgotna skóra, żyje w wodzie i na lądzie.', { fixed: true }),
              mc('Kto ma pióra?', ['jaszczurka', 'wróbel', 'kot', 'karp'], 1, 'Ptaki mają pióra.'),
              pf('Pająk jest owadem.', false, 'Pająk ma 8 nóg — to pajęczak.'),
            ],
          },
          {
            id: 'zima-zwierzeta', title: 'Jak zwierzęta zimują?', minutes: 12,
            blocks: [
              { type: 'read', text: '- **Sen zimowy**: niedźwiedź, jeż, borsuk, nietoperz, świstak\n- **Odlot do ciepłych krajów**: bocian, jaskółka, żuraw, skowronek\n- **Zapasy**: wiewiórka (orzechy, żołędzie), chomik\n- **Zmiana futra**: zając bielak, gronostaj (zimą białe)\n- **Przylatują do nas na zimę**: gil, jemiołuszka\n\nZimą możemy dokarmiać ptaki ziarnem i słoniną — **nigdy chlebem!**' },
            ],
            practice: [
              mc('Które zwierzę zapada w sen zimowy?', ['wiewiórka', 'jeż', 'sarna', 'wróbel'], 1, 'Jeż śpi w liściach.'),
              mc('Który ptak odlatuje na zimę?', ['bocian', 'wróbel', 'sikorka', 'gil'], 0, 'Bocian leci aż do Afryki.'),
              mc('Czym NIE dokarmiamy ptaków?', ['ziarnem słonecznika', 'słoniną', 'chlebem', 'kulami tłuszczowymi'], 2, 'Chleb szkodzi ptakom.'),
              mc('Który ptak przylatuje do Polski na zimę?', ['bocian', 'gil', 'jaskółka'], 1, 'Gil przylatuje z północy.', { fixed: true }),
            ],
          },
          {
            id: 'chronione', title: 'Zwierzęta i rośliny chronione', minutes: 12,
            blocks: [
              { type: 'read', text: 'Niektóre gatunki są rzadkie i chronione prawem. W Polsce to np.: **żubr**, **bóbr**, **niedźwiedź brunatny**, **orzeł bielik** (jest w godle Polski!), **bocian czarny**, **wilk**.\n\nRośliny chronione: **szarotka**, **sasanka**, **przylaszczka**, **konwalia** (częściowo), **pióropusznik**.\n\n**Parki narodowe** chronią przyrodę — np. Białowieski (żubry!), Tatrzański, Kampinoski. Jest ich w Polsce **23**.' },
            ],
            practice: [
              mc('Które zwierzę żyje w Puszczy Białowieskiej i jest symbolem ochrony przyrody?', ['żubr', 'kangur', 'lew', 'słoń'], 0, 'Żubr.'),
              mc('Ile parków narodowych jest w Polsce?', ['5', '13', '23', '100'], 2, '23.', { fixed: true }),
              mc('Która roślina jest chroniona i rośnie w Tatrach?', ['szarotka', 'mniszek', 'pokrzywa', 'koniczyna'], 0, 'Szarotka.'),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Ssaki karmią młode…', ['mlekiem', 'ziarnem', 'liśćmi'], 0, 'Mlekiem.', { fixed: true }), mc('Jaszczurka to…', ['gad', 'płaz', 'owad'], 0, 'Gad.', { fixed: true }), mc('Wiewiórka na zimę…', ['robi zapasy', 'odlatuje', 'zmienia futro na białe'], 0, 'Zbiera orzechy.', { fixed: true }), mc('Bielik jest w…', ['godle Polski', 'herbie Krakowa', 'fladze Australii'], 0, 'Biały orzeł.', { fixed: true })] },
        challenge: [star(mc('Nietoperz lata, ale jest…', ['ptakiem', 'ssakiem', 'owadem'], 1, 'Nietoperz karmi młode mlekiem — to ssak.', { fixed: true })), star(mc('Dlaczego zając bielak zimą jest biały?', ['bo jest stary', 'żeby był niewidoczny na śniegu', 'bo marznie'], 1, 'To kamuflaż.', { fixed: true }))],
      },
      {
        id: 'woda', term: 2, strand: 'Zjawiska fizyczne', bridge: 'water-cycle',
        title: 'Woda i jej stany',
        summary: 'Stany skupienia wody, krążenie wody w przyrodzie, oszczędzanie wody, ★ co pływa, a co tonie.',
        lessons: [
          {
            id: 'stany', title: 'Lód, woda, para', minutes: 12,
            blocks: [
              { type: 'read', text: 'Woda występuje w trzech **stanach skupienia**:\n- **stałym** — lód, śnieg, grad\n- **ciekłym** — woda w kranie, deszcz\n- **gazowym** — para wodna\n\n- **topnienie**: lód → woda (ciepło)\n- **zamarzanie**: woda → lód (poniżej 0°C)\n- **parowanie**: woda → para\n- **skraplanie**: para → woda (np. na zimnej szybie)' },
              { type: 'vocab', words: [['stan skupienia', 'ciało stałe, ciecz, gaz', 'state of matter'], ['topnienie', 'lód zamienia się w wodę', 'melting'], ['parowanie', 'woda zamienia się w parę', 'evaporation'], ['skraplanie', 'para zamienia się w wodę', 'condensation']] },
            ],
            practice: [
              mc('Lód to woda w stanie…', ['stałym', 'ciekłym', 'gazowym'], 0, 'Stałym.', { fixed: true }),
              mc('Jak nazywa się zamiana lodu w wodę?', ['parowanie', 'topnienie', 'zamarzanie', 'skraplanie'], 1, 'Topnienie.'),
              mc('Para na zimnej szybie zamienia się w kropelki. To…', ['skraplanie', 'topnienie', 'zamarzanie'], 0, 'Skraplanie.', { fixed: true }),
              num('W ilu stopniach Celsjusza woda zamarza?', 0, 'W 0°C.'),
            ],
          },
          {
            id: 'krazenie', title: 'Krążenie wody w przyrodzie', minutes: 12,
            blocks: [
              { type: 'read', text: 'Woda ciągle krąży:\n1. Słońce ogrzewa wodę w morzach i jeziorach → **parowanie**\n2. Para unosi się i ochładza → **skraplanie** → powstają **chmury**\n3. Z chmur spadają **opady** (deszcz, śnieg)\n4. Woda spływa rzekami do morza lub wsiąka w ziemię\n…i wszystko zaczyna się od nowa!' },
            ],
            practice: [
              mc('Co powoduje parowanie wody z jezior?', ['Księżyc', 'ciepło Słońca', 'wiatr'], 1, 'Ciepło Słońca.', { fixed: true }),
              mc('Z czego powstają chmury?', ['z dymu', 'ze skroplonej pary wodnej', 'z piasku'], 1, 'Z kropelek wody.', { fixed: true }),
              mc('Ułóż kolejność: opady, parowanie, chmury. Co jest drugie?', ['opady', 'parowanie', 'chmury'], 2, 'Parowanie → chmury → opady.', { fixed: true }),
            ],
          },
          {
            id: 'oszczedzanie', title: 'Oszczędzamy wodę', minutes: 10,
            blocks: [{ type: 'read', text: 'Wody pitnej jest mało. Jak oszczędzać?\n- zakręcaj kran podczas mycia zębów\n- bierz krótki prysznic zamiast kąpieli\n- zgłaszaj cieknące krany\n- podlewaj ogród deszczówką' }],
            practice: [
              mc('Jak oszczędzać wodę?', ['zostawiać kran odkręcony', 'zakręcać kran przy myciu zębów', 'codziennie długa kąpiel'], 1, 'Zakręcamy kran.', { fixed: true }),
              write('Wymyśl 3 sposoby oszczędzania wody w twoim domu.', ['3 sposoby', 'Pełne zdania'], 15, { homework: true }),
            ],
          },
          {
            id: 'plywanie', title: '★ Co pływa, a co tonie?', minutes: 12,
            blocks: [
              { type: 'read', text: 'Doświadczenie: wrzuć do miski z wodą: korek, gwóźdź, jabłko, kamień, plastikową nakrętkę, monetę.\n\n- **Pływają**: korek, jabłko, drewno, plastik (lżejsze od wody o tej samej wielkości)\n- **Toną**: gwóźdź, kamień, moneta\n\nCiekawostka: wielkie statki są z metalu, a pływają — bo mają kształt, który wypiera dużo wody!' },
            ],
            practice: [
              mc('Co będzie pływać?', ['gwóźdź', 'korek', 'kamień', 'moneta'], 1, 'Korek jest bardzo lekki.'),
              mc('Dlaczego stalowy statek pływa?', ['bo jest mały', 'bo ma kształt wypierający dużo wody', 'bo jest pomalowany'], 1, 'Kształt kadłuba.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Para wodna to stan…', ['gazowy', 'stały', 'ciekły'], 0, 'Gazowy.', { fixed: true }), mc('Zamarzanie to…', ['woda → lód', 'lód → woda', 'woda → para'], 0, 'Woda zamienia się w lód.', { fixed: true }), mc('Opady spadają z…', ['chmur', 'drzew', 'gór'], 0, 'Z chmur.', { fixed: true })] },
        challenge: [star(mc('Dlaczego zimą okna w kuchni „parują” od środka?', ['Bo ciepła para z gotowania skrapla się na zimnej szybie.', 'Bo pada deszcz.', 'Bo szyba jest brudna.'], 0, 'Skraplanie na zimnej powierzchni.', { fixed: true }))],
      },
      {
        id: 'polska-krajobrazy', term: 2, strand: 'Środowisko przyrodnicze', bridge: 'maps-geo',
        title: 'Krajobrazy Polski i kierunki świata',
        summary: 'Kierunki świata, kompas, mapa Polski: góry, wyżyny, niziny, morze; najważniejsze rzeki.',
        lessons: [
          {
            id: 'kierunki', title: 'Kierunki świata', minutes: 12,
            blocks: [
              { type: 'read', text: 'Cztery **główne kierunki świata**: **północ (N)**, **południe (S)**, **wschód (E)**, **zachód (W)**.\n\nSłońce **wschodzi na wschodzie**, w południe jest **na południu**, **zachodzi na zachodzie**.\n\n**Kompas** — igła magnetyczna zawsze wskazuje **północ**. Na mapie północ jest **u góry**.' },
              { type: 'vocab', words: [['północ', 'kierunek w górę mapy', 'north'], ['południe', 'w dół mapy', 'south'], ['wschód', 'w prawo', 'east'], ['zachód', 'w lewo', 'west']] },
            ],
            practice: [gen('direction', {}, 3), mc('Gdzie wschodzi Słońce?', ['na zachodzie', 'na wschodzie', 'na północy'], 1, 'Na wschodzie.', { fixed: true }), mc('Co wskazuje igła kompasu?', ['południe', 'północ', 'wschód'], 1, 'Północ.', { fixed: true })],
          },
          {
            id: 'mapa', title: 'Mapa Polski', minutes: 15,
            blocks: [
              { type: 'read', text: 'Na mapie **kolory** oznaczają wysokość:\n- **zielony** — niziny (nisko)\n- **żółty, pomarańczowy** — wyżyny\n- **brązowy** — góry (wysoko)\n- **niebieski** — wody\n\nPolska od północy do południa:\n- **Morze Bałtyckie** (północ) — plaże, wydmy\n- **Pojezierza** — dużo jezior (Mazury)\n- **Niziny** — największa część Polski\n- **Wyżyny** — np. Wyżyna Krakowsko-Częstochowska\n- **Góry** (południe) — **Tatry** (najwyższy szczyt Polski: **Rysy, 2499 m**), **Sudety**, **Beskidy**' },
            ],
            practice: [
              mc('Jakim kolorem na mapie oznacza się góry?', ['zielonym', 'niebieskim', 'brązowym'], 2, 'Brązowym.', { fixed: true }),
              mc('Gdzie leży Morze Bałtyckie względem Polski?', ['na północy', 'na południu', 'na wschodzie'], 0, 'Na północy.', { fixed: true }),
              mc('Najwyższy szczyt Polski to…', ['Śnieżka', 'Rysy', 'Giewont', 'Babia Góra'], 1, 'Rysy w Tatrach.'),
              mc('Jak nazywa się kraina wielu jezior na północnym wschodzie Polski?', ['Mazury', 'Tatry', 'Podhale', 'Śląsk'], 0, 'Mazury — Kraina Wielkich Jezior.'),
            ],
          },
          {
            id: 'rzeki', title: 'Rzeki Polski', minutes: 12,
            blocks: [
              { type: 'read', text: 'Najdłuższa rzeka Polski to **Wisła** (ponad 1000 km). Płynie z gór (Beskid Śląski, Barania Góra) przez Kraków i Warszawę do Bałtyku koło Gdańska.\n\nDruga co do długości: **Odra** — płynie przez Wrocław i Szczecin.\n\nInne rzeki: Warta, Bug, Narew, San.\n\nCzęści rzeki: **źródło** (początek), **koryto**, **ujście** (koniec, gdzie wpada do morza lub innej rzeki).' },
            ],
            practice: [
              mc('Najdłuższa rzeka Polski to…', ['Odra', 'Wisła', 'Warta', 'Bug'], 1, 'Wisła.'),
              mc('Przez które miasto NIE płynie Wisła?', ['Kraków', 'Warszawa', 'Wrocław', 'Toruń'], 2, 'Przez Wrocław płynie Odra.'),
              mc('Ujście rzeki to…', ['jej początek', 'miejsce, gdzie wpada do morza lub innej rzeki', 'most'], 1, 'Koniec rzeki.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [gen('direction', {}, 2), mc('Tatry to…', ['góry', 'jezioro', 'rzeka'], 0, 'Góry.', { fixed: true }), mc('Kolor zielony na mapie to…', ['niziny', 'góry', 'morze'], 0, 'Niziny.', { fixed: true }), mc('Wisła wpada do…', ['Morza Bałtyckiego', 'Odry', 'Morza Czarnego'], 0, 'Do Bałtyku.', { fixed: true })] },
        challenge: [star(mc('Jesteś w Warszawie i jedziesz do Zakopanego (w Tatrach). W jakim kierunku jedziesz?', ['na północ', 'na południe', 'na wschód', 'na zachód'], 1, 'Tatry leżą na południu Polski.', { fixed: true })), star(num('Rysy mają 2499 m, a Śnieżka 1603 m. O ile metrów Rysy są wyższe?', 896, '2499 − 1603 = 896.'))],
      },
      {
        id: 'zdrowie', term: 2, strand: 'Człowiek i zdrowie', bridge: 'healthy-eating',
        title: 'Moje ciało i zdrowie',
        summary: 'Zmysły, najważniejsze narządy, piramida zdrowego żywienia, higiena, pierwsza pomoc i telefon 112.',
        lessons: [
          {
            id: 'zmysly', title: 'Zmysły i narządy', minutes: 12,
            blocks: [
              { type: 'read', text: 'Mamy **5 zmysłów**: **wzrok** (oczy), **słuch** (uszy), **węch** (nos), **smak** (język), **dotyk** (skóra).\n\nNajważniejsze narządy:\n- **serce** — pompuje krew\n- **płuca** — oddychanie\n- **mózg** — myślenie, kieruje całym ciałem\n- **żołądek** — trawienie\n- **szkielet** (kości) — podpora, ochrona' },
            ],
            practice: [
              mc('Którym zmysłem czujemy zapach?', ['wzrok', 'węch', 'słuch', 'dotyk'], 1, 'Węch — nos.'),
              mc('Który narząd pompuje krew?', ['płuca', 'serce', 'żołądek', 'mózg'], 1, 'Serce.'),
              mc('Czym oddychamy?', ['płucami', 'sercem', 'żołądkiem'], 0, 'Płucami.', { fixed: true }),
            ],
          },
          {
            id: 'zywienie', title: 'Zdrowe odżywianie', minutes: 12,
            blocks: [
              { type: 'read', text: '**Piramida zdrowego żywienia** (od podstawy):\n1. **Ruch** — codziennie co najmniej godzina!\n2. **Warzywa i owoce** — najwięcej\n3. **Produkty zbożowe** — pełnoziarniste pieczywo, kasze\n4. **Nabiał** — mleko, jogurt, ser\n5. **Mięso, ryby, jajka, rośliny strączkowe**\n6. **Tłuszcze** — niewiele\n\nSłodycze i słodkie napoje — rzadko. Pij **wodę**! Jedz **5 posiłków** dziennie.' },
            ],
            practice: [
              mc('Czego powinniśmy jeść najwięcej?', ['słodyczy', 'warzyw i owoców', 'chipsów'], 1, 'Warzyw i owoców.', { fixed: true }),
              mc('Co najlepiej gasi pragnienie?', ['cola', 'woda', 'sok z cukrem'], 1, 'Woda.', { fixed: true }),
              mc('Który posiłek jest najzdrowszy?', ['chipsy i cola', 'kanapka z pełnoziarnistego chleba z warzywami', 'cukierki'], 1, 'Pełnoziarnisty chleb i warzywa.', { fixed: true }),
            ],
          },
          {
            id: 'pomoc', title: 'Bezpieczeństwo i pierwsza pomoc', minutes: 12,
            blocks: [
              { type: 'read', text: 'Numery alarmowe w Polsce:\n- **112** — numer alarmowy (wszystkie służby, działa w całej Europie)\n- **999** — pogotowie ratunkowe\n- **998** — straż pożarna\n- **997** — policja\n\nGdy dzwonisz, powiedz: **co się stało, gdzie jesteś, kto potrzebuje pomocy**, i nie rozłączaj się pierwszy.\n\nW Australii numer alarmowy to **000**!' },
            ],
            practice: [
              mc('Jaki jest europejski numer alarmowy?', ['112', '000', '911', '123'], 0, '112.', { fixed: true }),
              mc('Jaki numer ma straż pożarna w Polsce?', ['997', '998', '999'], 1, '998.', { fixed: true }),
              mc('Jaki numer alarmowy obowiązuje w Australii?', ['112', '000', '999'], 1, '000 (Triple Zero).', { fixed: true }),
              mc('Co mówisz, dzwoniąc po pomoc?', ['tylko swoje imię', 'co się stało i gdzie jesteś', 'nic, od razu się rozłączam'], 1, 'Co, gdzie, kto.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Ile mamy zmysłów?', ['3', '5', '7'], 1, 'Pięć.', { fixed: true }), mc('Pogotowie ratunkowe to numer…', ['999', '997', '998'], 0, '999.', { fixed: true }), mc('Na dole piramidy żywienia jest…', ['ruch', 'tłuszcz', 'słodycze'], 0, 'Aktywność fizyczna.', { fixed: true })] },
        challenge: [star(mc('Kolega skaleczył się w palec. Co robisz najpierw?', ['nic', 'przemywam ranę czystą wodą i zakładam plaster / wołam dorosłego', 'smaruję masłem'], 1, 'Czysta woda, opatrunek, pomoc dorosłego.', { fixed: true }))],
      },
      {
        id: 'ekologia', term: 2, strand: 'Środowisko przyrodnicze', bridge: 'sustainability',
        title: 'Dbamy o Ziemię',
        summary: 'Segregacja odpadów, recykling, oszczędzanie energii; ★ Układ Słoneczny.',
        lessons: [
          {
            id: 'segregacja', title: 'Segregacja odpadów', minutes: 12,
            blocks: [
              { type: 'read', text: 'W Polsce segregujemy śmieci do **5 pojemników**:\n- **żółty** — metale i tworzywa sztuczne (butelki plastikowe, puszki, kartony po mleku)\n- **niebieski** — papier (gazety, kartony)\n- **zielony** — szkło (słoiki, butelki szklane)\n- **brązowy** — bio (obierki, liście)\n- **czarny** — odpady zmieszane\n\n**Recykling** — z odpadów robi się nowe rzeczy.' },
            ],
            practice: [
              mc('Do którego pojemnika wrzucisz plastikową butelkę?', ['żółtego', 'niebieskiego', 'zielonego', 'brązowego'], 0, 'Żółty — metale i tworzywa sztuczne.', { fixed: true }),
              mc('Do którego pojemnika wrzucisz gazetę?', ['żółtego', 'niebieskiego', 'zielonego', 'brązowego'], 1, 'Niebieski — papier.', { fixed: true }),
              mc('Do którego pojemnika wrzucisz słoik?', ['żółtego', 'niebieskiego', 'zielonego', 'brązowego'], 2, 'Zielony — szkło.', { fixed: true }),
              mc('Do którego pojemnika wrzucisz obierki z ziemniaków?', ['żółtego', 'niebieskiego', 'zielonego', 'brązowego'], 3, 'Brązowy — bio.', { fixed: true }),
            ],
          },
          {
            id: 'energia', title: 'Oszczędzamy energię', minutes: 10,
            blocks: [{ type: 'read', text: 'Prąd często powstaje ze spalania węgla — to zanieczyszcza powietrze. Czystsza energia pochodzi ze **słońca**, **wiatru** i **wody**.\n\nJak oszczędzać: gaś światło, wyłączaj ładowarki, nie zostawiaj otwartej lodówki, chodź pieszo lub jeździj rowerem.' }],
            practice: [
              mc('Która energia jest odnawialna (czysta)?', ['z węgla', 'ze słońca', 'z benzyny'], 1, 'Energia słoneczna.', { fixed: true }),
              write('Napisz 3 zasady ekologa, które możesz stosować w domu.', ['3 zasady', 'Pełne zdania'], 15, { homework: true }),
            ],
          },
          {
            id: 'kosmos', title: '★ Ziemia i Układ Słoneczny', minutes: 15,
            blocks: [
              { type: 'read', text: 'Ziemia to **planeta**, która krąży wokół **Słońca** (gwiazdy). Jeden obieg trwa **rok**. Ziemia obraca się wokół własnej osi — to trwa **dobę** (24 godziny) i daje dzień i noc.\n\n**Księżyc** krąży wokół Ziemi.\n\nPlanety od Słońca: **Merkury, Wenus, Ziemia, Mars, Jowisz, Saturn, Uran, Neptun**.\n\n**Mikołaj Kopernik** — polski astronom — odkrył, że to Ziemia krąży wokół Słońca!' },
            ],
            practice: [
              mc('Ile trwa obrót Ziemi wokół własnej osi?', ['godzinę', 'dobę', 'rok'], 1, 'Dobę — 24 godziny.', { fixed: true }),
              mc('Która planeta jest największa?', ['Ziemia', 'Mars', 'Jowisz', 'Merkury'], 2, 'Jowisz.'),
              mc('Kto odkrył, że Ziemia krąży wokół Słońca?', ['Fryderyk Chopin', 'Mikołaj Kopernik', 'Maria Skłodowska-Curie'], 1, 'Mikołaj Kopernik.', { fixed: true }),
              num('Ile jest planet w Układzie Słonecznym?', 8, 'Osiem.'),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Pojemnik na szkło jest…', ['zielony', 'żółty', 'niebieski'], 0, 'Zielony.', { fixed: true }), mc('Recykling to…', ['wyrzucanie do lasu', 'przetwarzanie odpadów na nowe rzeczy', 'palenie śmieci'], 1, 'Ponowne przetwarzanie.', { fixed: true }), mc('Ziemia krąży wokół…', ['Księżyca', 'Słońca', 'Marsa'], 1, 'Słońca.', { fixed: true })] },
        challenge: [star(mc('Która planeta jest trzecia od Słońca?', ['Wenus', 'Ziemia', 'Mars'], 1, 'Merkury, Wenus, Ziemia.', { fixed: true })), star(mc('Gdzie wrzucisz karton po mleku?', ['do niebieskiego (papier)', 'do żółtego (tworzywa i opakowania wielomateriałowe)', 'do zielonego'], 1, 'Karton po mleku ma warstwę folii i aluminium — idzie do żółtego.', { fixed: true }))],
      },
    ],
  });
})();

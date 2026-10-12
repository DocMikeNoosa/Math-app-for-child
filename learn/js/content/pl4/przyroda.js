/* Klasa 4 — przyroda (podstawa programowa, II etap edukacyjny). */
(function () {
  const { mc, pf, num, inp, gen, write, star } = LA.Q;

  LA.addSubject('pl4', {
    id: 'przyroda',
    intro: 'Jak poznawać przyrodę, orientacja w terenie, pogoda i klimat, ruchy Ziemi, organizmy i ich środowiska, budowa i higiena człowieka, substancje i ich właściwości, krajobraz okolicy.',
    chapters: [
      {
        id: 'poznawanie', term: 1, strand: 'Poznajemy przyrodę', bridge: 'science-inquiry',
        title: 'Jak poznawać przyrodę?',
        summary: 'Składniki przyrody ożywionej i nieożywionej, obserwacja, doświadczenie, przyrządy: lupa, mikroskop, kompas, termometr.',
        outcomes: ['Odróżniam elementy przyrody ożywionej i nieożywionej', 'Planuję doświadczenie z próbą kontrolną', 'Używam lupy i mikroskopu'],
        lessons: [
          {
            id: 'skladniki', title: 'Przyroda ożywiona i nieożywiona', minutes: 12,
            blocks: [{ type: 'read', text: '**Przyroda nieożywiona**: woda, powietrze, skały, gleba, światło słoneczne.\n**Przyroda ożywiona**: organizmy — rośliny, zwierzęta, grzyby, bakterie.\n\nOrganizmy żywe: **oddychają, odżywiają się, rosną, rozmnażają się, reagują na bodźce, wydalają, poruszają się** — to **czynności życiowe**.\n\nRzeczy zrobione przez człowieka (dom, rower) to **wytwory człowieka**.' }, { type: 'vocab', words: [['przyroda ożywiona', 'organizmy żywe', 'living things'], ['przyroda nieożywiona', 'woda, skały, powietrze', 'non-living things'], ['czynności życiowe', 'to, co robi każdy organizm', 'life processes']] }],
            practice: [
              mc('Co należy do przyrody nieożywionej?', ['grzyb', 'kamień', 'mrówka', 'mech'], 1, 'Kamień nie jest organizmem.'),
              mc('Co jest wytworem człowieka?', ['skała', 'rower', 'drzewo'], 1, 'Rower zrobił człowiek.', { fixed: true }),
              mc('Która cecha NIE jest czynnością życiową?', ['oddychanie', 'rozmnażanie', 'świecenie na niebiesko'], 2, 'Czynności życiowe: oddychanie, odżywianie, wzrost, rozmnażanie, reagowanie, wydalanie, ruch.', { fixed: true }),
              pf('Grzyby należą do przyrody ożywionej.', true, 'To organizmy.'),
            ],
          },
          {
            id: 'doswiadczenie', title: 'Obserwacja i doświadczenie', minutes: 15,
            blocks: [{ type: 'read', text: '**Obserwacja** — uważne oglądanie bez wpływania na zjawisko (np. ptaki w karmniku).\n**Doświadczenie** — sami zmieniamy warunki i sprawdzamy, co się stanie.\n\nEtapy doświadczenia:\n1. **Problem badawczy** (pytanie)\n2. **Hipoteza** (przypuszczenie)\n3. **Zestaw kontrolny** (bez zmian) i **badawczy** (zmieniamy jeden czynnik)\n4. **Wyniki** i **wniosek**' }],
            practice: [
              mc('Zestaw kontrolny to ten, w którym…', ['niczego nie zmieniamy', 'zmieniamy wszystko', 'nie ma roślin'], 0, 'Służy do porównania.', { fixed: true }),
              mc('Hipoteza to…', ['przypuszczenie', 'wynik', 'przyrząd'], 0, 'Przypuszczenie do sprawdzenia.', { fixed: true }),
              mc('Liczenie ptaków w karmniku to…', ['obserwacja', 'doświadczenie'], 0, 'Nie zmieniamy warunków.', { fixed: true }),
              write('Zaplanuj doświadczenie: „Czy rzeżucha potrzebuje światła?”. Opisz zestaw kontrolny i badawczy.', ['Problem', 'Hipoteza', 'Zestaw kontrolny', 'Zestaw badawczy', 'Jak sprawdzisz wynik'], 30, { homework: true }),
            ],
          },
          {
            id: 'przyrzady', title: 'Przyrządy przyrodnika', minutes: 12,
            blocks: [{ type: 'read', text: '- **Lupa** — powiększa kilka razy\n- **Mikroskop** — powiększa nawet setki razy; widać **komórki**\n- **Lornetka** — przybliża odległe obiekty (ptaki)\n- **Kompas** — wyznacza kierunki\n- **Termometr** — temperatura\n- **Taśma miernicza, waga, stoper**\n\nMikroskop: **okular** (przy oku), **obiektyw** (przy preparacie), **stolik**, **śruby** do ustawiania ostrości, **lusterko lub lampka**. Powiększenie = powiększenie okularu · powiększenie obiektywu.' }],
            practice: [
              mc('Czym obejrzysz komórki skórki cebuli?', ['lupą', 'mikroskopem', 'lornetką'], 1, 'Komórki są bardzo małe.', { fixed: true }),
              num('Okular powiększa 10 razy, obiektyw 40 razy. Ile razy powiększa mikroskop?', 400, '10 · 40 = 400.'),
              mc('Czym obserwujesz ptaka na odległym drzewie?', ['lornetką', 'mikroskopem', 'termometrem'], 0, 'Lornetka przybliża.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 8, items: [mc('Organizm to…', ['każda istota żywa', 'każdy kamień', 'budynek'], 0, 'Istota żywa.', { fixed: true }), mc('Okular w mikroskopie jest…', ['przy oku', 'przy preparacie'], 0, 'Przy oku.', { fixed: true }), mc('W doświadczeniu zmieniamy…', ['jeden czynnik', 'wszystkie czynniki'], 0, 'Jeden.', { fixed: true }), num('Okular 5×, obiektyw 20×. Powiększenie?', 100, '5 · 20 = 100.')] },
        challenge: [star(mc('Dlaczego w doświadczeniu potrzebny jest zestaw kontrolny?', ['żeby było ładniej', 'żeby porównać wyniki i mieć pewność, co spowodowało zmianę', 'żeby zużyć więcej roślin'], 1, 'Bez porównania nie wiemy, czy to badany czynnik działał.', { fixed: true }))],
      },
      {
        id: 'orientacja', term: 1, strand: 'Orientacja w terenie', bridge: 'maps',
        title: 'Orientacja w terenie',
        summary: 'Kierunki główne i pośrednie, kompas, wyznaczanie kierunków za pomocą Słońca i gnomonu, plan, mapa, skala.',
        lessons: [
          {
            id: 'kierunki4', title: 'Kierunki główne i pośrednie', minutes: 12,
            blocks: [{ type: 'read', text: '**Główne**: północ (N), południe (S), wschód (E), zachód (W).\n**Pośrednie**: północny wschód (NE), południowy wschód (SE), południowy zachód (SW), północny zachód (NW).\n\n**Róża kierunków** przedstawia wszystkie 8 kierunków. Na mapie północ jest u góry.' }],
            practice: [gen('direction', {}, 3), mc('Między północą a wschodem leży…', ['północny wschód', 'południowy zachód', 'północny zachód'], 0, 'NE.', { fixed: true }), mc('Skrót SW oznacza…', ['południowy zachód', 'północny wschód', 'południowy wschód'], 0, 'S = south (południe), W = west (zachód).', { fixed: true })],
          },
          {
            id: 'slonce', title: 'Kierunki według Słońca i gnomonu', minutes: 12,
            blocks: [{ type: 'read', text: 'W Polsce Słońce **w południe** (około 12:00, latem 13:00) jest **najwyżej** i świeci z **południa**. Wtedy cień jest **najkrótszy** i wskazuje **północ**.\n\n**Gnomon** to pionowy patyk wbity w ziemię. Najkrótszy cień gnomonu wyznacza **linię południka** (północ–południe).\n\nInne wskazówki (mniej pewne): mech na pniach, mrowiska — dlatego najlepszy jest kompas.' }],
            practice: [
              mc('W którą stronę wskazuje najkrótszy cień w południe (w Polsce)?', ['północ', 'południe', 'wschód'], 0, 'Słońce jest na południu, cień pada na północ.', { fixed: true }),
              mc('Kiedy cień jest najkrótszy?', ['rano', 'w południe', 'wieczorem'], 1, 'Gdy Słońce jest najwyżej.', { fixed: true }),
              mc('W Australii w południe Słońce jest…', ['na północy', 'na południu'], 0, 'Na półkuli południowej Słońce w południe jest na północy!', { fixed: true }),
            ],
          },
          {
            id: 'plan-mapa', title: 'Plan, mapa i skala', minutes: 15,
            blocks: [{ type: 'read', text: '**Plan** — dokładny rysunek małego terenu z góry (klasa, ogród). **Mapa** — większy teren, bardziej uproszczony.\n\n**Legenda** wyjaśnia znaki na mapie. **Skala** mówi, ile razy zmniejszono teren:\n- **liczbowa**: 1 : 1000 (1 cm = 10 m)\n- **mianowana**: 1 cm – 10 m\n- **liniowa**: odcinek z podziałką\n\n**Orientowanie mapy**: ustaw ją tak, by północ na mapie wskazywała północ w terenie.' }],
            practice: [num('Skala 1 : 1000. Ścieżka na planie ma 6 cm. Ile metrów ma w rzeczywistości?', 60, '6 · 1000 cm = 6000 cm = 60 m.'), mc('Co wyjaśnia znaki na mapie?', ['legenda', 'skala', 'tytuł'], 0, 'Legenda.', { fixed: true }), num('Skala 1 cm – 500 m. Na mapie 4 cm. Ile to kilometrów?', 2, '4 · 500 m = 2000 m = 2 km.')],
          },
        ],
        quiz: { n: 8, items: [gen('direction', {}, 2), mc('Gnomon służy do…', ['wyznaczania kierunków', 'mierzenia temperatury', 'powiększania'], 0, 'Kierunki.', { fixed: true }), mc('Skala 1 : 100 znaczy, że 1 cm na planie to…', ['1 m', '10 m', '100 m'], 0, '100 cm = 1 m.', { fixed: true })] },
        challenge: [star(mc('Idziesz na północny wschód i robisz pół obrotu. W jakim kierunku teraz idziesz?', ['południowy zachód', 'północny zachód', 'południowy wschód'], 0, 'Pół obrotu = kierunek przeciwny.', { fixed: true })), star(num('Skala 1 : 50 000. Na mapie 8 cm. Ile to km?', 4, '8 · 50 000 cm = 400 000 cm = 4 km.'))],
      },
      {
        id: 'pogoda4', term: 1, strand: 'Pogoda i klimat', bridge: 'weather',
        title: 'Pogoda, Słońce i pory roku',
        summary: 'Składniki pogody i przyrządy meteorologiczne, rodzaje chmur, ruch obrotowy i obiegowy Ziemi, zmiany wysokości Słońca, klimat Polski i Australii.',
        lessons: [
          {
            id: 'przyrzady-pogody', title: 'Pomiary pogody', minutes: 15,
            blocks: [{ type: 'read', text: '- **temperatura** → **termometr** (°C)\n- **ciśnienie** atmosferyczne → **barometr** (hPa)\n- **opady** → **deszczomierz** (mm)\n- **wiatr**: kierunek → **wiatrowskaz**, prędkość → **wiatromierz** (anemometr)\n- **zachmurzenie** — obserwacja nieba\n\n**Wiatr nazywamy od kierunku, z którego wieje**: wiatr zachodni wieje **z zachodu**.\n\nRodzaje chmur: **pierzaste** (wysoko, cienkie), **kłębiaste** (białe „baranki”, burzowe cumulonimbusy), **warstwowe** (szara warstwa, mżawka).' }],
            practice: [
              mc('Czym mierzymy ciśnienie?', ['barometrem', 'termometrem', 'deszczomierzem'], 0, 'Barometr.', { fixed: true }),
              mc('Wiatr północny wieje…', ['z północy', 'na północ'], 0, 'Nazwa od kierunku, z którego wieje.', { fixed: true }),
              mc('Czym mierzymy ilość opadów?', ['wiatromierzem', 'deszczomierzem', 'barometrem'], 1, 'Deszczomierz.', { fixed: true }),
              num('Temperatura spadła z 3°C do −5°C. O ile stopni?', 8, '3 + 5 = 8.'),
            ],
          },
          {
            id: 'ruchy-ziemi', title: 'Ruch obrotowy i obiegowy Ziemi', minutes: 15,
            blocks: [{ type: 'read', text: '**Ruch obrotowy** — Ziemia obraca się wokół własnej osi z zachodu na wschód w ciągu **doby** → **dzień i noc**, pozorna wędrówka Słońca po niebie (wschód → południe → zachód).\n\n**Ruch obiegowy** — Ziemia krąży wokół Słońca w ciągu **roku**. Oś Ziemi jest **nachylona**, więc zmienia się wysokość Słońca → **pory roku**.\n\nW Polsce: **22 czerwca** — najdłuższy dzień, Słońce najwyżej; **22 grudnia** — najkrótszy dzień, Słońce najniżej; **21 marca** i **23 września** — dzień równy nocy (równonoc).' }],
            practice: [
              mc('Co powoduje dzień i noc?', ['ruch obrotowy Ziemi', 'ruch obiegowy Ziemi', 'Księżyc'], 0, 'Obrót wokół osi.', { fixed: true }),
              mc('Co powoduje pory roku?', ['ruch obiegowy i nachylenie osi Ziemi', 'chmury', 'odległość od Księżyca'], 0, 'Obieg + nachylenie osi.', { fixed: true }),
              mc('Kiedy w Polsce jest najkrótszy dzień?', ['22 czerwca', '22 grudnia', '21 marca'], 1, 'Przesilenie zimowe.', { fixed: true }),
              mc('Kiedy w Australii (np. w Sydney) jest najdłuższy dzień?', ['około 22 grudnia', 'około 22 czerwca'], 0, 'Na półkuli południowej wszystko jest odwrotnie.', { fixed: true }),
            ],
          },
          {
            id: 'klimat', title: 'Pogoda a klimat', minutes: 12,
            blocks: [{ type: 'read', text: '**Pogoda** — stan atmosfery w danej chwili (dziś pada).\n**Klimat** — typowa pogoda w danym miejscu przez wiele lat.\n\nPolska ma klimat **umiarkowany przejściowy** — 4 pory roku, zmienne pogody (wpływ oceanu i lądu). Australia ma wiele klimatów: tropikalny na północy (pora deszczowa i sucha), suchy (pustynny) w środku, umiarkowany na południu.' }],
            practice: [mc('„Jutro będzie padać” to informacja o…', ['pogodzie', 'klimacie'], 0, 'Pogoda — krótko.', { fixed: true }), mc('Jaki klimat ma Polska?', ['umiarkowany', 'tropikalny', 'polarny'], 0, 'Umiarkowany przejściowy.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Wiatromierz mierzy…', ['prędkość wiatru', 'temperaturę', 'opady'], 0, 'Prędkość wiatru.', { fixed: true }), mc('Doba trwa…', ['24 godziny', '12 godzin', 'tydzień'], 0, '24 h.', { fixed: true }), mc('Równonoc wiosenna jest…', ['21 marca', '22 czerwca', '22 grudnia'], 0, '21 marca.', { fixed: true }), mc('Chmury burzowe to…', ['kłębiaste', 'pierzaste'], 0, 'Kłębiaste (cumulonimbus).', { fixed: true })] },
        challenge: [star(mc('Dlaczego Słońce „wschodzi” na wschodzie?', ['bo Ziemia obraca się z zachodu na wschód', 'bo Słońce krąży wokół Ziemi', 'bo tak chce Księżyc'], 0, 'To pozorny ruch Słońca.', { fixed: true })), star(mc('Gdy w Polsce jest lato, w Australii jest…', ['zima', 'lato', 'wiosna'], 0, 'Półkule mają odwrotne pory roku.', { fixed: true }))],
      },
      {
        id: 'organizmy', term: 1, strand: 'Organizmy', bridge: 'living',
        title: 'Organizmy i ich środowisko',
        summary: 'Komórka, organizmy jedno- i wielokomórkowe, sposoby odżywiania, łańcuchy i sieci pokarmowe, zależności w przyrodzie.',
        lessons: [
          {
            id: 'komorka', title: 'Komórka — podstawa życia', minutes: 12,
            blocks: [{ type: 'read', text: 'Każdy organizm zbudowany jest z **komórek**. Są organizmy **jednokomórkowe** (bakterie, pantofelek, drożdże) i **wielokomórkowe** (człowiek ma ich biliony!).\n\nKomórki widać pod **mikroskopem**.' }],
            practice: [mc('Z czego zbudowane są wszystkie organizmy?', ['z komórek', 'z kamieni', 'z plastiku'], 0, 'Z komórek.', { fixed: true }), mc('Który organizm jest jednokomórkowy?', ['bakteria', 'pies', 'dąb'], 0, 'Bakteria.', { fixed: true })],
          },
          {
            id: 'odzywianie', title: 'Jak odżywiają się organizmy?', minutes: 15,
            blocks: [{ type: 'read', text: '**Samożywne** (producenci) — wytwarzają pokarm same z wody, dwutlenku węgla i światła: **rośliny** (fotosynteza).\n**Cudzożywne** (konsumenci) — zjadają inne organizmy:\n- **roślinożercy** (sarna, zając) — mają płaskie zęby do rozcierania\n- **drapieżniki** (wilk, sowa) — kły, pazury, dobry wzrok\n- **wszystkożercy** (dzik, człowiek)\n- **pasożyty** (kleszcz, tasiemiec) — żyją kosztem innych\n- **destruenci** (grzyby, bakterie) — rozkładają martwe szczątki' }],
            practice: [
              mc('Które organizmy są samożywne?', ['rośliny', 'zwierzęta', 'grzyby'], 0, 'Rośliny wytwarzają pokarm w fotosyntezie.', { fixed: true }),
              mc('Kleszcz to…', ['pasożyt', 'roślinożerca', 'producent'], 0, 'Pasożyt — żywi się krwią.', { fixed: true }),
              mc('Kto rozkłada martwe liście w lesie?', ['grzyby i bakterie', 'wilki', 'sarny'], 0, 'Destruenci.', { fixed: true }),
              mc('Drapieżnik ma…', ['ostre kły i pazury', 'tylko płaskie zęby'], 0, 'Do chwytania ofiar.', { fixed: true }),
            ],
          },
          {
            id: 'siec', title: 'Łańcuchy i sieci pokarmowe', minutes: 15,
            blocks: [{ type: 'read', text: '**Łańcuch pokarmowy**: producent → konsument I rzędu → konsument II rzędu…\n\n*trawa → konik polny → żaba → bocian*\n\nW przyrodzie łańcuchy łączą się w **sieć pokarmową** — jeden organizm może jeść wiele innych i być zjadany przez wielu.' }],
            practice: [mc('Kto jest producentem w łańcuchu: trawa → konik polny → żaba → bocian?', ['trawa', 'żaba', 'bocian'], 0, 'Roślina.', { fixed: true }), mc('Kto jest konsumentem I rzędu?', ['konik polny', 'żaba', 'bocian'], 0, 'Je rośliny.', { fixed: true }), mc('Co się stanie, gdy zniknie żaba?', ['bocian straci pokarm, a koników polnych może być więcej', 'nic', 'trawa zniknie'], 0, 'Zmiana jednego ogniwa wpływa na inne.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Fotosynteza zachodzi w…', ['roślinach', 'kamieniach', 'wilkach'], 0, 'W roślinach.', { fixed: true }), mc('Wszystkożercą jest…', ['dzik', 'wilk', 'sarna'], 0, 'Dzik.', { fixed: true }), mc('Na początku łańcucha jest…', ['producent', 'drapieżnik'], 0, 'Producent.', { fixed: true })] },
        challenge: [star(mc('Dlaczego bez destruentów las „utonąłby” w liściach?', ['bo nikt nie rozkładałby martwych szczątków', 'bo drzewa przestałyby rosnąć', 'bo zabrakłoby wody'], 0, 'Destruenci zamieniają szczątki w próchnicę.', { fixed: true }))],
      },
      {
        id: 'czlowiek', term: 2, strand: 'Człowiek', bridge: 'human-body',
        title: 'Budowa i funkcjonowanie człowieka',
        summary: 'Skóra, układ ruchu, pokarmowy, oddechowy, krwionośny, nerwowy i zmysły; dojrzewanie.',
        outcomes: ['Wymieniam narządy głównych układów', 'Opisuję drogę pokarmu i powietrza', 'Wiem, jak dbać o każdy układ'],
        lessons: [
          {
            id: 'ruchu', title: 'Układ ruchu i skóra', minutes: 12,
            blocks: [{ type: 'read', text: '**Szkielet** (206 kości u dorosłego) — podpora i ochrona: **czaszka** chroni mózg, **klatka piersiowa** — serce i płuca, **kręgosłup** — rdzeń kręgowy.\n**Mięśnie** poruszają kośćmi. **Stawy** łączą kości ruchomo (kolano, łokieć).\n\n**Skóra** chroni przed drobnoustrojami, reguluje temperaturę (pot), odbiera bodźce (dotyk, ból, ciepło).' }],
            practice: [mc('Co chroni mózg?', ['czaszka', 'kręgosłup', 'żebra'], 0, 'Czaszka.', { fixed: true }), num('Ile kości ma szkielet dorosłego człowieka?', 206, '206.'), mc('Kolano to przykład…', ['stawu', 'mięśnia', 'narządu zmysłu'], 0, 'Staw.', { fixed: true })],
          },
          {
            id: 'pokarmowy', title: 'Układ pokarmowy', minutes: 15,
            blocks: [{ type: 'read', text: 'Droga pokarmu: **jama ustna** (zęby rozdrabniają, ślina) → **gardło** → **przełyk** → **żołądek** (soki trawienne) → **jelito cienkie** (wchłanianie składników do krwi) → **jelito grube** (wchłanianie wody) → odbyt.\n\nPomagają: **wątroba** i **trzustka**.\n\nDbamy: myjemy zęby 2 razy dziennie, jemy regularnie, dużo warzyw, pijemy wodę.' }],
            practice: [mc('Gdzie składniki pokarmowe przechodzą do krwi?', ['w jelicie cienkim', 'w przełyku', 'w gardle'], 0, 'Jelito cienkie.', { fixed: true }), mc('Co jest po przełyku?', ['żołądek', 'jelito grube', 'gardło'], 0, 'Żołądek.', { fixed: true }), mc('Który narząd pomaga w trawieniu, choć pokarm przez niego nie przechodzi?', ['wątroba', 'przełyk', 'żołądek'], 0, 'Wątroba wytwarza żółć.', { fixed: true })],
          },
          {
            id: 'oddechowy', title: 'Układ oddechowy i krwionośny', minutes: 15,
            blocks: [{ type: 'read', text: '**Oddechowy**: nos (ogrzewa i oczyszcza powietrze) → gardło → krtań → **tchawica** → **oskrzela** → **płuca**. Pobieramy **tlen**, wydychamy **dwutlenek węgla**.\n\n**Krwionośny**: **serce** pompuje krew przez **naczynia krwionośne** (tętnice, żyły, naczynia włosowate). Krew rozprowadza tlen i składniki pokarmowe. Tętno spoczynkowe dziecka: około 80–100 uderzeń na minutę.\n\nDbamy: ruch na świeżym powietrzu, nie palimy, unikamy smogu.' }],
            practice: [mc('Jaki gaz pobieramy z powietrza?', ['tlen', 'dwutlenek węgla', 'azot'], 0, 'Tlen.', { fixed: true }), mc('Co pompuje krew?', ['serce', 'płuca', 'wątroba'], 0, 'Serce.', { fixed: true }), mc('Którędy powietrze wpada do płuc?', ['przez tchawicę i oskrzela', 'przez przełyk', 'przez żołądek'], 0, 'Tchawica → oskrzela → płuca.', { fixed: true })],
          },
          {
            id: 'nerwowy', title: 'Układ nerwowy i zmysły', minutes: 12,
            blocks: [{ type: 'read', text: '**Mózg** kieruje całym organizmem, **rdzeń kręgowy** i **nerwy** przewodzą informacje.\n\nZmysły: wzrok (oko), słuch i równowaga (ucho), węch (nos), smak (język — słodki, słony, kwaśny, gorzki, umami), dotyk (skóra).\n\nDbamy: sen 9–11 godzin, przerwy od ekranów, czytanie przy dobrym świetle, ciche słuchawki.' }],
            practice: [mc('Co kieruje całym organizmem?', ['mózg', 'serce', 'żołądek'], 0, 'Mózg.', { fixed: true }), mc('Narząd równowagi znajduje się w…', ['uchu', 'oku', 'nosie'], 0, 'W uchu wewnętrznym.', { fixed: true }), mc('Ile godzin snu potrzebuje dziecko w wieku 9–10 lat?', ['4–5', '9–11', '15–16'], 1, '9–11 godzin.', { fixed: true })],
          },
          {
            id: 'dojrzewanie', title: 'Dojrzewanie', minutes: 10,
            blocks: [{ type: 'read', text: 'Człowiek przechodzi etapy życia: niemowlę, dziecko, **okres dojrzewania**, dorosłość, starość.\n\nW okresie dojrzewania ciało rośnie szybciej i się zmienia, mogą zmieniać się nastroje. To naturalne! Ważna jest **higiena** (codzienny prysznic, czyste ubrania) i rozmowa z rodzicami.' }, { type: 'tip', text: 'Ta lekcja jest krótka i ogólna. Jeśli Tosia ma pytania, porozmawiajcie spokojnie — na jej poziomie.' }],
            practice: [mc('Który etap jest po dzieciństwie?', ['okres dojrzewania', 'starość', 'niemowlęctwo'], 0, 'Okres dojrzewania.', { fixed: true }), pf('Zmiany w ciele w okresie dojrzewania są naturalne.', true, 'Tak.')],
          },
        ],
        quiz: { n: 10, items: [mc('Tchawica należy do układu…', ['oddechowego', 'pokarmowego', 'ruchu'], 0, 'Oddechowego.', { fixed: true }), mc('Żołądek należy do układu…', ['pokarmowego', 'nerwowego', 'krwionośnego'], 0, 'Pokarmowego.', { fixed: true }), mc('Rdzeń kręgowy chroni…', ['kręgosłup', 'czaszka', 'żebra'], 0, 'Kręgosłup.', { fixed: true }), mc('Krew rozprowadza…', ['tlen i składniki pokarmowe', 'tylko wodę', 'powietrze'], 0, 'Tlen i składniki.', { fixed: true }), mc('Smak umami to…', ['jeden z pięciu smaków (np. bulion, pomidory)', 'rodzaj kości'], 0, 'Piąty smak.', { fixed: true })] },
        challenge: [star(num('Serce bije 90 razy na minutę. Ile razy uderzy w ciągu 10 minut?', 900, '90 · 10 = 900.')), star(mc('Dlaczego oddychamy nosem, a nie ustami?', ['nos ogrzewa, nawilża i oczyszcza powietrze', 'bo usta są do jedzenia', 'nie ma różnicy'], 0, 'Nos to „filtr” i „grzejnik”.', { fixed: true }))],
      },
      {
        id: 'zdrowie4', term: 2, strand: 'Człowiek', bridge: 'safety',
        title: 'Zdrowie i bezpieczeństwo',
        summary: 'Choroby zakaźne i jak się chronić, pasożyty, trujące rośliny i grzyby, uzależnienia, pierwsza pomoc.',
        lessons: [
          {
            id: 'choroby', title: 'Choroby zakaźne', minutes: 12,
            blocks: [{ type: 'read', text: 'Choroby zakaźne wywołują **wirusy** (grypa, ospa) i **bakterie** (angina). Przenoszą się drogą **kropelkową**, przez **brudne ręce**, wodę, jedzenie lub ukąszenia (kleszcz → borelioza).\n\nChronimy się: **mycie rąk** (30 s z mydłem), zasłanianie ust przy kichaniu, **szczepienia**, zdrowe jedzenie, sen.\n\nPo wycieczce do lasu sprawdzamy, czy nie ma **kleszcza**.' }],
            practice: [mc('Jak długo myjemy ręce?', ['3 sekundy', 'około 30 sekund', '10 minut'], 1, 'Około 30 sekund.', { fixed: true }), mc('Kleszcz może przenosić…', ['boreliozę', 'złamanie', 'próchnicę'], 0, 'Boreliozę.', { fixed: true }), mc('Kichamy…', ['w łokieć lub chusteczkę', 'na kolegę', 'w dłoń i podajemy rękę'], 0, 'W łokieć lub chusteczkę.', { fixed: true })],
          },
          {
            id: 'trujace', title: 'Trujące rośliny i grzyby', minutes: 12,
            blocks: [{ type: 'read', text: 'Trujące: **muchomor sromotnikowy** (najgroźniejszy grzyb — śmiertelnie trujący!), muchomor czerwony, **konwalia**, **wawrzynek wilczełyko**, **cis** (nasiona i igły), **bieluń**.\n\nZasada: **nie zbieramy i nie jemy** grzybów ani owoców, których nie znamy. Grzyby sprawdza dorosły znawca.\n\nZatrucie: wołamy dorosłego, dzwonimy **112**, zachowujemy resztki do zbadania.' }],
            practice: [mc('Najgroźniejszy grzyb w Polsce to…', ['muchomor sromotnikowy', 'prawdziwek', 'kurka'], 0, 'Muchomor sromotnikowy.', { fixed: true }), mc('Co robisz z nieznanymi jagodami w lesie?', ['nie jem ich', 'zjadam szybko', 'daję młodszemu bratu'], 0, 'Nie jemy nieznanych roślin.', { fixed: true })],
          },
          {
            id: 'uzaleznienia', title: 'Uzależnienia i asertywność', minutes: 12,
            blocks: [{ type: 'read', text: '**Uzależnienie** — gdy ktoś nie może przestać czegoś robić lub używać, mimo że mu to szkodzi: papierosy (także e-papierosy), alkohol, narkotyki, a także **gry i telefon**.\n\n**Asertywność** — umiejętność powiedzenia **„nie”** w sposób spokojny i stanowczy: „Nie, dziękuję. Nie chcę.”' }],
            practice: [mc('Kolega namawia cię na e-papierosa. Co mówisz?', ['„Nie, dziękuję, nie chcę.”', '„No dobra, raz można.”'], 0, 'Asertywne „nie”.', { fixed: true }), pf('Można uzależnić się od gier komputerowych.', true, 'Tak, dlatego ważne są przerwy i limity.')],
          },
        ],
        quiz: { n: 6, items: [mc('Szczepienia chronią przed…', ['chorobami zakaźnymi', 'złamaniami', 'oparzeniami'], 0, 'Chorobami zakaźnymi.', { fixed: true }), mc('Grypę wywołują…', ['wirusy', 'pasożyty', 'grzyby'], 0, 'Wirusy.', { fixed: true }), mc('Asertywność to…', ['spokojne „nie”', 'krzyk', 'ucieczka'], 0, 'Spokojne i stanowcze odmawianie.', { fixed: true })] },
        challenge: [star(mc('Dlaczego antybiotyk nie pomaga na grypę?', ['bo działa na bakterie, a grypę wywołuje wirus', 'bo jest za słodki', 'bo grypa to nie choroba'], 0, 'Antybiotyki działają na bakterie.', { fixed: true }))],
      },
      {
        id: 'substancje', term: 2, strand: 'Substancje i zjawiska', bridge: 'states-of-matter',
        title: 'Substancje i ich przemiany',
        summary: 'Stany skupienia i ich zmiany, rozszerzalność cieplna, przewodniki i izolatory ciepła, mieszaniny i rozpuszczanie, krążenie wody.',
        lessons: [
          {
            id: 'stany4', title: 'Stany skupienia i ich zmiany', minutes: 15,
            blocks: [{ type: 'read', text: '**Ciała stałe** mają własny kształt (lód, żelazo). **Ciecze** przyjmują kształt naczynia (woda, olej). **Gazy** wypełniają całe naczynie (powietrze, para).\n\nPrzemiany:\n- **topnienie**: stały → ciecz\n- **krzepnięcie** (zamarzanie): ciecz → stały\n- **parowanie**: ciecz → gaz\n- **skraplanie**: gaz → ciecz\n- **resublimacja**: gaz → stały (szron!) ★\n- **sublimacja**: stały → gaz (suchy lód) ★' }, { type: 'vocab', words: [['krzepnięcie', 'ciecz zamienia się w ciało stałe', 'freezing / solidifying'], ['skraplanie', 'gaz zamienia się w ciecz', 'condensation'], ['parowanie', 'ciecz zamienia się w gaz', 'evaporation']] }],
            practice: [mc('Lód zamienia się w wodę. To…', ['topnienie', 'krzepnięcie', 'parowanie'], 0, 'Topnienie.', { fixed: true }), mc('Szron na szybie powstaje z pary wodnej bez etapu cieczy. To…', ['resublimacja', 'topnienie', 'parowanie'], 0, 'Gaz → ciało stałe.', { fixed: true }), mc('Który stan przyjmuje kształt naczynia, ale ma stałą objętość?', ['ciecz', 'gaz', 'ciało stałe'], 0, 'Ciecz.', { fixed: true })],
          },
          {
            id: 'rozszerzalnosc', title: 'Rozszerzalność cieplna i przewodnictwo', minutes: 12,
            blocks: [{ type: 'read', text: 'Ciała po ogrzaniu się **rozszerzają**, a po ochłodzeniu **kurczą** — dlatego mosty mają szczeliny dylatacyjne, a przewody elektryczne latem zwisają.\n\n**Przewodniki ciepła**: metale (garnek, łyżeczka nagrzewa się w herbacie).\n**Izolatory**: drewno, plastik, wełna, styropian, powietrze (dlatego ubieramy się „na cebulkę”).' }],
            practice: [mc('Dlaczego latem przewody elektryczne bardziej zwisają?', ['bo się rozszerzają od ciepła', 'bo ptaki na nich siedzą', 'bo są stare'], 0, 'Rozszerzalność cieplna.', { fixed: true }), mc('Który materiał jest dobrym przewodnikiem ciepła?', ['metal', 'wełna', 'styropian'], 0, 'Metal.', { fixed: true }), mc('Dlaczego rączka garnka jest często z plastiku?', ['plastik to izolator, nie parzy', 'bo jest ładny', 'bo jest ciężki'], 0, 'Izolator.', { fixed: true })],
          },
          {
            id: 'mieszaniny', title: 'Mieszaniny i rozpuszczanie', minutes: 12,
            blocks: [{ type: 'read', text: '**Rozpuszczanie**: cukier w herbacie znika — powstaje **roztwór**. Szybciej rozpuszcza się w **ciepłej** wodzie, przy **mieszaniu** i gdy jest **rozdrobniony**.\n\nNie wszystko się rozpuszcza: piasek, olej.\n\nRozdzielanie mieszanin: **przesiewanie** (sito), **sączenie** (filtr — piasek z wody), **odparowanie** (sól z wody), **magnes** (opiłki żelaza).' }],
            practice: [mc('Jak oddzielić piasek od wody?', ['sączenie przez filtr', 'odparowanie soli', 'magnesem'], 0, 'Filtr zatrzyma piasek.', { fixed: true }), mc('Jak odzyskać sól z wody morskiej?', ['odparować wodę', 'przesiać', 'użyć magnesu'], 0, 'Odparowanie.', { fixed: true }), mc('Kiedy cukier rozpuści się najszybciej?', ['w ciepłej wodzie z mieszaniem', 'w zimnej bez mieszania'], 0, 'Ciepło i mieszanie przyspieszają.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Krzepnięcie to…', ['ciecz → ciało stałe', 'gaz → ciecz'], 0, 'Ciecz → ciało stałe.', { fixed: true }), mc('Izolatorem jest…', ['wełna', 'miedź', 'aluminium'], 0, 'Wełna.', { fixed: true }), mc('Opiłki żelaza z piasku oddzielimy…', ['magnesem', 'sitem', 'filtrem'], 0, 'Magnesem.', { fixed: true })] },
        challenge: [star(mc('Dlaczego zimą butelka pełna wody pęka na mrozie?', ['bo woda zamarzając zwiększa objętość', 'bo plastik się topi', 'bo butelka się kurczy'], 0, 'Lód zajmuje więcej miejsca niż woda — to wyjątek wśród substancji!', { fixed: true }))],
      },
      {
        id: 'krajobraz', term: 2, strand: 'Krajobraz najbliższej okolicy', bridge: 'rocks-soil',
        title: 'Krajobraz najbliższej okolicy',
        summary: 'Formy terenu, skały (piasek, glina, granit, wapień), gleba, wody powierzchniowe, krajobrazy naturalne i kulturowe, ochrona przyrody.',
        lessons: [
          {
            id: 'formy', title: 'Formy terenu', minutes: 12,
            blocks: [{ type: 'read', text: '**Formy wypukłe**: wzniesienie (pagórek), wzgórze, góra — ma **szczyt**, **zbocze**, **podnóże**.\n**Formy wklęsłe**: dolina, wąwóz, kotlina.\n\nTeren może być **płaski** lub **pagórkowaty**. Wysokość mierzymy od poziomu morza (m n.p.m.).' }],
            practice: [mc('Która forma jest wklęsła?', ['dolina', 'pagórek', 'góra'], 0, 'Dolina.', { fixed: true }), mc('Najwyższy punkt wzniesienia to…', ['szczyt', 'podnóże', 'zbocze'], 0, 'Szczyt.', { fixed: true }), mc('Skrót m n.p.m. oznacza…', ['metry nad poziomem morza', 'metry na północ', 'mapa na planie'], 0, 'Metry nad poziomem morza.', { fixed: true })],
          },
          {
            id: 'skaly', title: 'Skały i gleba', minutes: 12,
            blocks: [{ type: 'read', text: 'Skały:\n- **piasek** — sypki, przepuszcza wodę\n- **glina** — plastyczna po zwilżeniu, słabo przepuszcza wodę (cegły, garnki)\n- **granit** — twardy, z widocznymi kryształkami (schody, pomniki; Tatry, Karkonosze)\n- **wapień** — reaguje z octem (burzy się); budulec, cement; Jura Krakowsko-Częstochowska\n\n**Gleba** powstaje ze skał i szczątków organizmów (**próchnica**). Żyją w niej dżdżownice, bakterie, krety.' }],
            practice: [mc('Która skała burzy się po polaniu octem?', ['wapień', 'granit', 'piasek'], 0, 'Wapień.', { fixed: true }), mc('Z czego robi się cegły?', ['z gliny', 'z granitu', 'z piasku'], 0, 'Z gliny.', { fixed: true }), mc('Próchnica powstaje z…', ['rozłożonych szczątków organizmów', 'wody', 'powietrza'], 0, 'Szczątki organizmów.', { fixed: true })],
          },
          {
            id: 'wody-ochrona', title: 'Wody i ochrona przyrody', minutes: 12,
            blocks: [{ type: 'read', text: 'Wody płynące: **rzeki**, strumienie, kanały. Wody stojące: **jeziora**, stawy (sztuczne), bagna.\nRzeka: **źródło**, **koryto**, **brzegi** (prawy i lewy — patrząc z biegiem rzeki), **dopływy**, **ujście**.\n\n**Krajobraz naturalny** — bez zmian przez człowieka. **Kulturowy** — przekształcony (miasta, pola).\n\nFormy ochrony przyrody: **park narodowy**, **rezerwat**, **pomnik przyrody** (np. stary dąb), **park krajobrazowy**, **ochrona gatunkowa**.' }],
            practice: [mc('Staw to woda…', ['stojąca, sztuczna', 'płynąca', 'morska'], 0, 'Staw zrobił człowiek.', { fixed: true }), mc('Stary, okazały dąb może być…', ['pomnikiem przyrody', 'parkiem narodowym', 'rezerwatem'], 0, 'Pomnik przyrody.', { fixed: true }), mc('Prawy brzeg rzeki określamy, patrząc…', ['z biegiem rzeki', 'pod prąd', 'z góry'], 0, 'Z biegiem rzeki.', { fixed: true })],
          },
        ],
        quiz: { n: 8, items: [mc('Granit jest…', ['twardy, z kryształkami', 'sypki', 'plastyczny'], 0, 'Twardy.', { fixed: true }), mc('Krajobraz miejski to krajobraz…', ['kulturowy', 'naturalny'], 0, 'Kulturowy.', { fixed: true }), mc('Ujście rzeki to…', ['miejsce, gdzie wpada do innej wody', 'jej początek'], 0, 'Koniec rzeki.', { fixed: true })] },
        challenge: [star(mc('Dlaczego po deszczu na glinie tworzą się kałuże, a na piasku nie?', ['glina słabo przepuszcza wodę, piasek dobrze', 'bo glina jest ciepła', 'bo piasek jest mokry'], 0, 'Przepuszczalność skał.', { fixed: true }))],
      },
    ],
  });
})();

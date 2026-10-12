/* Klasa 3 — edukacja plastyczna, muzyczna, techniczna i informatyczna (zajęcia uzupełniające; w planie dnia raz w tygodniu). */
(function () {
  const { mc, pf, num, write, star } = LA.Q;

  LA.addSubject('pl3', {
    id: 'sztuka',
    intro: 'Barwy i techniki plastyczne, polscy malarze, rytm i nuty, instrumenty, polskie tańce narodowe i Chopin.',
    chapters: [
      {
        id: 'barwy', term: 1, strand: 'Plastyka', bridge: 'visual-arts',
        title: 'Barwy i techniki plastyczne',
        summary: 'Barwy podstawowe i pochodne, ciepłe i zimne, techniki: akwarela, wydzieranka, kolaż, grafika.',
        lessons: [
          {
            id: 'podstawowe', title: 'Barwy podstawowe i pochodne', minutes: 12,
            blocks: [
              { type: 'read', text: '**Barwy podstawowe**: **czerwona, żółta, niebieska** — nie da się ich uzyskać przez mieszanie.\n\n**Barwy pochodne** powstają z mieszania dwóch podstawowych:\n- żółta + niebieska = **zielona**\n- czerwona + żółta = **pomarańczowa**\n- czerwona + niebieska = **fioletowa**\n\n**Barwy ciepłe** (czerwona, pomarańczowa, żółta) kojarzą się ze słońcem i ogniem. **Zimne** (niebieska, zielona, fioletowa) — z wodą, lodem i cieniem.' },
              { type: 'activity', text: 'Zmieszajcie farby na talerzyku: zróbcie trzy barwy pochodne i namalujcie nimi tęczę.' },
            ],
            practice: [
              mc('Co powstanie z żółtej i niebieskiej?', ['zielona', 'fioletowa', 'pomarańczowa'], 0, 'Zielona.', { fixed: true }),
              mc('Co powstanie z czerwonej i niebieskiej?', ['zielona', 'fioletowa', 'brązowa'], 1, 'Fioletowa.', { fixed: true }),
              mc('Która barwa jest podstawowa?', ['zielona', 'żółta', 'pomarańczowa'], 1, 'Żółta.', { fixed: true }),
              mc('Która barwa jest zimna?', ['pomarańczowa', 'niebieska', 'czerwona'], 1, 'Niebieska.', { fixed: true }),
            ],
          },
          {
            id: 'techniki', title: 'Techniki plastyczne', minutes: 12,
            blocks: [{ type: 'read', text: '- **Akwarela** — farby wodne, przezroczyste\n- **Wydzieranka** — obrazek z wydzieranych kawałków papieru\n- **Kolaż** — praca z naklejanych różnych materiałów (gazety, tkaniny)\n- **Grafika** (np. stempel z ziemniaka) — odbijanie wzoru\n- **Rzeźba** — z gliny, plasteliny, masy solnej\n- **Wycinanka** — ludowa sztuka z kolorowego papieru (np. kurpiowska, łowicka)' }],
            practice: [
              mc('Praca z naklejonych różnych materiałów to…', ['kolaż', 'akwarela', 'rzeźba'], 0, 'Kolaż.', { fixed: true }),
              mc('Wycinanki łowickie i kurpiowskie to sztuka…', ['ludowa', 'komputerowa', 'kosmiczna'], 0, 'Ludowa.', { fixed: true }),
              write('Opisz, jaką pracę plastyczną wykonałaś ostatnio i jaką techniką.', ['Temat', 'Technika', 'Użyte barwy'], 15),
            ],
          },
          {
            id: 'malarze', title: 'Polscy malarze', minutes: 12,
            blocks: [{ type: 'read', text: '- **Jan Matejko** — malował wielkie obrazy historyczne, np. „**Bitwa pod Grunwaldem**”\n- **Józef Chełmoński** — krajobrazy wsi i zwierzęta, np. „Babie lato”, „Bociany”\n- **Olga Boznańska** — portrety\n- **Stanisław Wyspiański** — witraże, kwiaty, portrety dzieci\n\nObrazy oglądamy w **muzeach** i **galeriach**. Obraz przedstawiający krajobraz to **pejzaż**, osobę — **portret**, przedmioty (np. owoce) — **martwa natura**.' }],
            practice: [
              mc('Kto namalował „Bitwę pod Grunwaldem”?', ['Jan Matejko', 'Fryderyk Chopin', 'Józef Wybicki'], 0, 'Jan Matejko.', { fixed: true }),
              mc('Obraz przedstawiający krajobraz to…', ['portret', 'pejzaż', 'martwa natura'], 1, 'Pejzaż.', { fixed: true }),
              mc('Obraz przedstawiający owoce w misie to…', ['martwa natura', 'portret', 'pejzaż'], 0, 'Martwa natura.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Barwy podstawowe to…', ['czerwona, żółta, niebieska', 'zielona, fioletowa, pomarańczowa', 'biała i czarna'], 0, 'Czerwona, żółta, niebieska.', { fixed: true }), mc('Portret przedstawia…', ['osobę', 'góry', 'owoce'], 0, 'Osobę.', { fixed: true }), mc('Czerwona + żółta = …', ['pomarańczowa', 'zielona', 'fioletowa'], 0, 'Pomarańczowa.', { fixed: true })] },
        challenge: [star(mc('Barwa dopełniająca to ta, której brakuje do trzech podstawowych. Jaka barwa dopełnia zieloną?', ['czerwona', 'żółta', 'niebieska'], 0, 'Zielona = żółta + niebieska, brakuje czerwonej.', { fixed: true }))],
      },
      {
        id: 'muzyka', term: 2, strand: 'Muzyka', bridge: 'music',
        title: 'Muzyka: rytm, nuty i tańce',
        summary: 'Rytm i wartości nut, gama, instrumenty, polskie tańce narodowe, Fryderyk Chopin.',
        lessons: [
          {
            id: 'nuty', title: 'Nuty i gama', minutes: 12,
            blocks: [
              { type: 'read', text: 'Nuty zapisujemy na **pięciolinii**. Na początku stoi **klucz wiolinowy**.\n\n**Gama C-dur**: **do, re, mi, fa, sol, la, si, do** (literami: c, d, e, f, g, a, h, c).\n\nWartości rytmiczne:\n- **cała nuta** — 4 ćwierćnuty (liczymy: raz-dwa-trzy-cztery)\n- **półnuta** — 2 ćwierćnuty\n- **ćwierćnuta** — 1 (raz)\n- **ósemka** — pół ćwierćnuty' },
              { type: 'vocab', words: [['pięciolinia', 'pięć linii do zapisu nut', 'staff (stave)'], ['klucz wiolinowy', 'znak na początku pięciolinii', 'treble clef'], ['ćwierćnuta', 'nuta o wartości 1', 'crotchet / quarter note']] },
            ],
            practice: [
              num('Ile ćwierćnut trwa cała nuta?', 4, 'Cztery.'),
              num('Ile ćwierćnut trwa półnuta?', 2, 'Dwie.'),
              mc('Jaki dźwięk jest po „mi” w gamie?', ['re', 'fa', 'sol'], 1, 'do, re, mi, **fa**.', { fixed: true }),
              num('Ile linii ma pięciolinia?', 5, 'Pięć — stąd nazwa.'),
            ],
          },
          {
            id: 'instrumenty', title: 'Instrumenty muzyczne', minutes: 12,
            blocks: [{ type: 'read', text: '- **Strunowe**: skrzypce, wiolonczela, gitara, harfa, kontrabas\n- **Dęte**: flet, trąbka, klarnet, saksofon, puzon\n- **Perkusyjne**: bęben, kotły, talerze, trójkąt, ksylofon\n- **Klawiszowe**: fortepian, pianino, organy, akordeon\n\nDuży zespół muzyków grający razem to **orkiestra**, a prowadzi ją **dyrygent**.' }],
            practice: [
              mc('Do jakiej grupy należą skrzypce?', ['strunowe', 'dęte', 'perkusyjne'], 0, 'Strunowe.', { fixed: true }),
              mc('Trąbka to instrument…', ['dęty', 'strunowy', 'klawiszowy'], 0, 'Dęty.', { fixed: true }),
              mc('Kto prowadzi orkiestrę?', ['dyrygent', 'solista', 'reżyser'], 0, 'Dyrygent.', { fixed: true }),
              mc('Australijski instrument dęty Aborygenów to…', ['didgeridoo', 'skrzypce', 'akordeon'], 0, 'Didgeridoo.', { fixed: true }),
            ],
          },
          {
            id: 'tance', title: 'Polskie tańce narodowe i Chopin', minutes: 12,
            blocks: [{ type: 'read', text: 'Pięć **polskich tańców narodowych**: **polonez** (dostojny, chodzony), **mazur** (szybki, z przytupem), **krakowiak** (skoczny, z Krakowa), **kujawiak** (wolny, łagodny), **oberek** (bardzo szybki, wirowy).\n\nPolonez tańczy się na studniówce. **Fryderyk Chopin** komponował **mazurki** i **polonezy** na fortepian. Co pięć lat w Warszawie odbywa się **Międzynarodowy Konkurs Pianistyczny im. Fryderyka Chopina**.' }],
            practice: [
              mc('Który taniec jest dostojny i „chodzony”?', ['polonez', 'oberek', 'krakowiak'], 0, 'Polonez.', { fixed: true }),
              num('Ile jest polskich tańców narodowych?', 5, 'Pięć.'),
              mc('Na jakim instrumencie grał Chopin?', ['na fortepianie', 'na skrzypcach', 'na flecie'], 0, 'Na fortepianie.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Gama C-dur zaczyna się od…', ['do', 'mi', 'la'], 0, 'do.', { fixed: true }), mc('Flet to instrument…', ['dęty', 'strunowy', 'perkusyjny'], 0, 'Dęty.', { fixed: true }), mc('Krakowiak to taniec…', ['skoczny', 'bardzo wolny', 'australijski'], 0, 'Skoczny.', { fixed: true })] },
        challenge: [star(num('Ile ósemek mieści się w jednej całej nucie?', 8, 'Cała = 4 ćwierćnuty = 8 ósemek.'))],
      },
    ],
  });

  LA.addSubject('pl3', {
    id: 'technika',
    intro: 'Bezpieczne narzędzia i materiały, ruch drogowy, urządzenia w domu, algorytmy, kodowanie i bezpieczeństwo w internecie.',
    chapters: [
      {
        id: 'technika-dom', term: 1, strand: 'Edukacja techniczna', bridge: 'materials',
        title: 'Materiały, narzędzia i urządzenia',
        summary: 'Materiały i ich właściwości, bezpieczne posługiwanie się narzędziami, urządzenia domowe i prąd.',
        lessons: [
          {
            id: 'materialy', title: 'Materiały i narzędzia', minutes: 12,
            blocks: [{ type: 'read', text: 'Materiały: **papier** (lekki, łatwo go ciąć), **drewno** (twarde), **metal** (wytrzymały, przewodzi prąd), **plastik** (lekki, wodoodporny), **szkło** (przezroczyste, kruche), **tkanina** (miękka).\n\nBezpieczne narzędzia: nożyczki podajemy **rączką do drugiej osoby**, nie biegamy z nimi; po pracy sprzątamy stanowisko.' }],
            practice: [
              mc('Który materiał jest przezroczysty i kruchy?', ['drewno', 'szkło', 'tkanina'], 1, 'Szkło.', { fixed: true }),
              mc('Jak podajemy nożyczki?', ['ostrzem do kolegi', 'rączką do kolegi', 'rzucamy'], 1, 'Rączką do drugiej osoby.', { fixed: true }),
              mc('Który materiał przewodzi prąd?', ['metal', 'plastik', 'drewno'], 0, 'Metal.', { fixed: true }),
            ],
          },
          {
            id: 'prad', title: 'Prąd i urządzenia w domu', minutes: 12,
            blocks: [{ type: 'read', text: 'Urządzenia elektryczne ułatwiają życie: lodówka, pralka, odkurzacz, czajnik.\n\nZasady bezpieczeństwa:\n- nie dotykamy gniazdek i kabli mokrymi rękami\n- nie wkładamy nic do gniazdka\n- nie ciągniemy za kabel\n- uszkodzone urządzenie zgłaszamy dorosłemu' }],
            practice: [
              pf('Można dotykać urządzeń elektrycznych mokrymi rękami.', false, 'Woda przewodzi prąd — to bardzo niebezpieczne.'),
              mc('Co zrobisz, gdy zobaczysz uszkodzony kabel?', ['sam go naprawię', 'powiem dorosłemu', 'dotknę go'], 1, 'Mówię dorosłemu.', { fixed: true }),
            ],
          },
          {
            id: 'droga', title: 'Bezpiecznie na drodze', minutes: 15,
            blocks: [{ type: 'read', text: '- Przechodzimy przez jezdnię na **pasach**; patrzymy: **w lewo, w prawo, jeszcze raz w lewo**.\n- Na **czerwonym** świetle stoimy, na **zielonym** idziemy.\n- Po zmroku nosimy **odblaski** (poza miastem pieszy musi je mieć!).\n- Dziecko do lat 10 jeździ rowerem pod opieką dorosłego; od **10 lat** można zdobyć **kartę rowerową**.\n- Na rowerze zawsze **kask**!\n\nZnaki: **ostrzegawcze** — trójkątne, żółte z czerwoną obwódką; **zakazu** — okrągłe z czerwoną obwódką; **nakazu** — okrągłe, niebieskie; **informacyjne** — prostokątne, niebieskie.' }],
            practice: [
              mc('W którą stronę patrzymy najpierw przed przejściem przez jezdnię w Polsce?', ['w lewo', 'w prawo', 'do góry'], 0, 'W lewo, w prawo, w lewo. (W Australii ruch jest lewostronny — tam najpierw w prawo!)', { fixed: true }),
              num('Od ilu lat można zdobyć kartę rowerową?', 10, 'Od 10 lat.'),
              mc('Jaki kształt mają znaki ostrzegawcze?', ['trójkąt', 'koło', 'prostokąt'], 0, 'Trójkąt.', { fixed: true }),
              mc('Co nosimy po zmroku, żeby kierowcy nas widzieli?', ['odblaski', 'okulary przeciwsłoneczne', 'czarną kurtkę'], 0, 'Odblaski.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Znaki zakazu są…', ['okrągłe z czerwoną obwódką', 'trójkątne', 'zielone'], 0, 'Okrągłe, czerwona obwódka.', { fixed: true }), mc('Na czerwonym świetle…', ['stoimy', 'biegniemy', 'idziemy powoli'], 0, 'Stoimy.', { fixed: true }), mc('Plastik jest…', ['wodoodporny', 'przezroczysty zawsze', 'ciężki jak metal'], 0, 'Wodoodporny.', { fixed: true })] },
        challenge: [star(mc('Dlaczego w Australii przed przejściem patrzy się najpierw w prawo?', ['bo tam ruch jest lewostronny i auta najpierw nadjeżdżają z prawej', 'bo tak jest ładniej', 'nie ma różnicy'], 0, 'W Australii jeździ się lewą stroną.', { fixed: true }))],
      },
      {
        id: 'informatyka', term: 2, strand: 'Edukacja informatyczna', bridge: 'algorithms',
        title: 'Algorytmy, kodowanie i internet',
        summary: 'Algorytm jako przepis krok po kroku, polecenia i pętle, programowanie w Scratchu, bezpieczeństwo w sieci.',
        lessons: [
          {
            id: 'algorytm', title: 'Co to jest algorytm?', minutes: 12,
            blocks: [{ type: 'read', text: '**Algorytm** to dokładny przepis krok po kroku, jak coś zrobić. Kolejność kroków jest ważna!\n\nAlgorytm „mycie zębów”:\n1. Nałóż pastę na szczoteczkę.\n2. Myj zęby 2 minuty.\n3. Wypłucz usta.\n4. Umyj szczoteczkę.\n\nKomputer wykonuje algorytmy zapisane jako **program**.' }],
            practice: [
              mc('Algorytm to…', ['przepis krok po kroku', 'rodzaj komputera', 'gra'], 0, 'Przepis krok po kroku.', { fixed: true }),
              mc('Co jest pierwsze w algorytmie „robienie herbaty”?', ['wypij herbatę', 'zagotuj wodę', 'dodaj cytrynę'], 1, 'Najpierw gotujemy wodę.', { fixed: true }),
            ],
          },
          {
            id: 'petle', title: 'Polecenia i pętle', minutes: 15,
            blocks: [{ type: 'read', text: 'Robot rozumie polecenia: **naprzód**, **w lewo**, **w prawo**.\n\nZamiast pisać 4 razy „naprzód, w prawo”, używamy **pętli**: **powtórz 4 razy [naprzód, w prawo]** — robot narysuje kwadrat!\n\nW **Scratchu** (programie dla dzieci) układamy kolorowe bloczki poleceń. Duszek (np. kotek) wykonuje program.' }],
            practice: [
              mc('Co narysuje robot: powtórz 4 razy [naprzód 10, obróć w prawo o 90°]?', ['kwadrat', 'trójkąt', 'koło'], 0, 'Cztery równe boki i kąty proste.', { fixed: true }),
              num('Robot ma iść 3 kroki naprzód 5 razy. Ile kroków zrobi?', 15, '3 · 5 = 15.'),
              mc('Pętla w programie służy do…', ['powtarzania poleceń', 'wyłączania komputera', 'rysowania kolorów'], 0, 'Powtarzania.', { fixed: true }),
            ],
          },
          {
            id: 'internet', title: 'Bezpiecznie w internecie', minutes: 12,
            blocks: [{ type: 'read', text: 'Zasady bezpieczeństwa w sieci:\n- **nie podajemy** nieznajomym imienia, nazwiska, adresu, szkoły, zdjęć\n- **hasło** to tajemnica — znają je tylko rodzice\n- nie spotykamy się z osobami poznanymi w internecie\n- gdy coś nas niepokoi — **od razu mówimy rodzicom**\n- pamiętamy o **przerwach** od ekranu' }],
            practice: [
              mc('Ktoś nieznajomy w grze prosi o twój adres. Co robisz?', ['podaję adres', 'nie podaję i mówię rodzicom', 'umawiam się na spotkanie'], 1, 'Nigdy nie podajemy danych.', { fixed: true }),
              pf('Swoim hasłem można się dzielić z kolegami.', false, 'Hasło jest tajne.'),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Program to…', ['algorytm zapisany dla komputera', 'film', 'książka'], 0, 'Algorytm dla komputera.', { fixed: true }), mc('W Scratchu programujemy…', ['bloczkami', 'młotkiem', 'farbami'], 0, 'Bloczkami.', { fixed: true }), mc('Hasło powinni znać…', ['tylko rodzice', 'wszyscy koledzy', 'nieznajomi'], 0, 'Tylko rodzice.', { fixed: true })] },
        challenge: [star(mc('Robot: powtórz 3 razy [naprzód 10, obróć w prawo o 120°]. Co narysuje?', ['trójkąt', 'kwadrat', 'linię'], 0, '3 boki → trójkąt (3 · 120° = 360°).', { fixed: true }))],
      },
    ],
  });
})();

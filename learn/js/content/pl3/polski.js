/* Klasa 3 — edukacja polonistyczna (podstawa programowa, I etap edukacyjny). Zadania z gwiazdką wykraczają nieco ponad poziom klasy. */
(function () {
  const { mc, pf, inp, gen, write, dict, star } = LA.Q;

  const T_JEZ = `Jesienny poranek był chłodny i mglisty. Jaś wyszedł z babcią do lasu na grzyby. Wziął ze sobą mały wiklinowy koszyk i nożyk.\n\nPod wysoką sosną zobaczył brązowy kapelusz. — Babciu, prawdziwek! — zawołał. Babcia pokazała mu, jak ostrożnie wykręcić grzyb, żeby nie zniszczyć grzybni.\n\nPotem spotkali jeża. Zwierzątko szukało liści na zimowe legowisko. Jaś nie dotykał jeża, tylko cicho patrzył, jak znika w krzakach.\n\nDo domu wrócili w południe. Koszyk był pełny, a Jaś był dumny, bo sam znalazł aż siedem grzybów.`;
  const T_SMOK = `Dawno temu pod Wawelem, w głębokiej jamie, mieszkał groźny smok. Co tydzień mieszkańcy Krakowa musieli przyprowadzać mu owce, bo inaczej smok niszczył domy i pola.\n\nKról Krak obiecał, że kto pokona smoka, ten dostanie rękę jego córki. Próbowali rycerze w lśniących zbrojach, ale żaden nie dał rady.\n\nWtedy zgłosił się ubogi szewczyk Skuba. Napełnił skórę barana siarką i podrzucił ją pod smoczą jamę. Smok połknął przynętę. W brzuchu zaczęło go strasznie piec, więc pobiegł do Wisły i pił, i pił, aż… pękł!\n\nSkuba ożenił się z królewną, a Kraków znów był bezpieczny. Do dziś pod Wawelem stoi pomnik smoka, który zieje ogniem.`;
  const T_PSZCZOLY = `Pszczoły żyją w ulach, w dużych rodzinach. W jednym ulu może mieszkać nawet kilkadziesiąt tysięcy pszczół!\n\nNajważniejsza jest **matka** — składa jaja. **Robotnice** zbierają nektar i pyłek z kwiatów, budują plastry z wosku i opiekują się larwami. **Trutnie** są potrzebne matce do założenia nowej rodziny.\n\nPszczoły są bardzo pożyteczne. Przenoszą pyłek z kwiatu na kwiat i dzięki temu na drzewach rosną owoce. Z nektaru robią miód.\n\nPszczoła użądli tylko wtedy, gdy się boi. Dlatego przy pszczołach zachowujemy spokój i nie machamy rękami.`;
  const T_OGLOSZENIE = `Uwaga, uczniowie klas trzecich!\nW piątek jedziemy na wycieczkę do Muzeum Przyrodniczego. Zbiórka o godzinie 8:00 przed szkołą. Powrót około 14:30. Zabierzcie drugie śniadanie, picie i wygodne buty. Koszt wycieczki to 35 zł — prosimy oddać pieniądze wychowawczyni do środy.`;
  const T_WIERSZ = `**Deszczyk**\n\nKap, kap, kap — po szybie,\nkap, kap — na parapet.\nDeszczyk w kałużach płynie\njak mały, srebrny statek.\n\nParasol jest jak grzybek,\nczerwony w białe kropki.\nA ja w kaloszach skaczę —\nhop! — przez wszystkie stopki.`;
  const L_SKLEP = `Ania poszła z tatą do sklepu. Mieli kupić chleb, masło, sześć jajek i mleko. Przy kasie Ania przypomniała sobie, że mama prosiła jeszcze o jabłka. Tata wrócił po jabłka, a Ania pilnowała koszyka. Zapłacili czterdzieści dwa złote.`;
  const L_MORZE = `W wakacje Ola pojechała z rodziną nad Bałtyk, do Gdańska. Codziennie rano chodzili na plażę. Ola budowała zamki z piasku i zbierała muszelki. Najbardziej podobał jej się rejs statkiem po zatoce. Widziała z daleka latarnię morską. Ostatniego dnia padał deszcz, więc poszli do oceanarium.`;

  LA.addSubject('pl3', {
    id: 'polski',
    intro: 'Czytanie ze zrozumieniem, słuchanie, pisanie, ortografia (ó/u, rz/ż, ch/h), wielka litera, części mowy, zdania, lektury i własne teksty.',
    chapters: [
      {
        id: 'abc', term: 1, strand: 'Kształcenie językowe', bridge: 'alphabet',
        title: 'Alfabet, głoski i sylaby',
        summary: 'Porządek alfabetyczny, litery i głoski, dwuznaki, samogłoski i spółgłoski, podział na sylaby.',
        outcomes: ['Znam alfabet i układam wyrazy alfabetycznie', 'Odróżniam litery od głosek', 'Dzielę wyrazy na sylaby'],
        lessons: [
          {
            id: 'alfabet', title: 'Alfabet polski', minutes: 12,
            blocks: [
              { type: 'read', text: 'Polski alfabet ma **32 litery**:\n\n**a ą b c ć d e ę f g h i j k l ł m n ń o ó p r s ś t u w y z ź ż**\n\nW polskich wyrazach nie ma liter **q, v, x** — występują tylko w wyrazach obcych (np. *taxi*).\n\nLitery ze znakami (ą, ę, ć, ł, ń, ó, ś, ź, ż) stoją **zaraz po** swojej „zwykłej” literze: a → ą, c → ć, l → ł.' },
              { type: 'example', title: 'Kolejność alfabetyczna', text: 'Patrzymy na **pierwszą literę**. Gdy jest taka sama — na drugą.\n\nkot, **la**s, **le**w → *kot, las, lew* (a jest przed e).' },
              { type: 'tip', text: 'Po angielsku alfabet ma 26 liter — bez ą, ę, ł… Dlatego słowniki polskie i angielskie wyglądają trochę inaczej.' },
              { type: 'vocab', words: [['alfabet', 'wszystkie litery w ustalonej kolejności', 'alphabet'], ['litera', 'znak, który piszemy', 'letter'], ['kolejność alfabetyczna', 'porządek jak w alfabecie', 'alphabetical order']] },
            ],
            practice: [
              mc('Który wyraz będzie pierwszy w kolejności alfabetycznej?', ['dom', 'balon', 'cukier', 'ekran'], 1, 'b jest przed c, d i e.'),
              mc('Który wyraz będzie pierwszy alfabetycznie?', ['łódka', 'lampa', 'mama', 'nos'], 1, 'l jest przed ł, a ł przed m.'),
              mc('Która litera NIE występuje w polskich wyrazach?', ['ż', 'v', 'ń', 'ł'], 1, 'Litera v pojawia się tylko w wyrazach obcych.'),
              inp('Jaka litera jest w alfabecie zaraz po literze **s**?', ['ś'], 'Po s jest ś, potem t.'),
              mc('Ułóż alfabetycznie: sowa, rak, osa. Który wyraz będzie drugi?', ['sowa', 'rak', 'osa'], 1, 'o → r → s, więc: osa, rak, sowa.'),
            ],
          },
          {
            id: 'gloski', title: 'Litery i głoski', minutes: 12,
            blocks: [
              { type: 'read', text: '**Litery** piszemy i widzimy. **Głoski** wymawiamy i słyszymy.\n\nCzasem dwie litery to **jedna głoska** — to **dwuznaki**: **ch, cz, dz, dź, dż, rz, sz**.\n\n*szafa* — 5 liter (s-z-a-f-a), ale 4 głoski (sz-a-f-a).\n\nGłoski dzielimy na **samogłoski** (a, ą, e, ę, i, o, ó, u, y) i **spółgłoski** (wszystkie pozostałe).' },
              { type: 'vocab', words: [['głoska', 'dźwięk, który słyszymy', 'sound'], ['dwuznak', 'dwie litery, jedna głoska', 'digraph'], ['samogłoska', 'a, e, i, o, u, y, ą, ę, ó', 'vowel'], ['spółgłoska', 'pozostałe głoski', 'consonant']] },
            ],
            practice: [gen('plSounds', {}, 5), mc('Który wyraz zawiera dwuznak?', ['kot', 'czapka', 'lato', 'nos'], 1, '„cz” to dwuznak.'), mc('Która litera to samogłoska?', ['k', 'y', 'm', 'ł'], 1, 'y to samogłoska.')],
          },
          {
            id: 'sylaby', title: 'Dzielimy wyrazy na sylaby', minutes: 12,
            blocks: [
              { type: 'read', text: 'Wyrazy dzielimy na **sylaby** tak, jak mówimy powoli: *ma-ma, szko-ła, ko-ło-wrot-ki*.\n\nW każdej sylabie jest **jedna samogłoska** (a, e, i, o, u, y, ą, ę, ó).\n\nIle samogłosek, tyle sylab! *ba-lon* — 2 samogłoski (a, o) → 2 sylaby.\n\nUwaga: „i” przed inną samogłoską często nie tworzy osobnej sylaby: *nie-bo*, *pia-sek*.' },
              { type: 'activity', text: 'Klaszczcie razem przy każdej sylabie: *hi-po-po-tam* (4 klaśnięcia!), *ro-wer*, *tram-wa-jem*.' },
            ],
            practice: [
              mc('Na ile sylab dzielimy wyraz **samolot**?', ['2', '3', '4'], 1, 'sa-mo-lot → 3 sylaby.', { fixed: true }),
              mc('Który podział jest poprawny?', ['szk-oła', 'szko-ła', 'sz-koła'], 1, 'szko-ła: każda sylaba ma samogłoskę.', { fixed: true }),
              mc('Ile sylab ma wyraz **biedronka**?', ['2', '3', '4'], 1, 'bie-dron-ka → 3.', { fixed: true }),
              mc('Ile sylab ma wyraz **kot**?', ['1', '2', '3'], 0, 'kot ma jedną samogłoskę → 1 sylaba.', { fixed: true }),
              mc('Który wyraz ma 4 sylaby?', ['telefon', 'kalendarz', 'telewizor', 'parasol'], 2, 'te-le-wi-zor → 4.'),
            ],
          },
          {
            id: 'zmiekczenia', title: 'Zmiękczenia: ś, si, ć, ci…', minutes: 12,
            blocks: [
              { type: 'read', text: 'Głoski miękkie zapisujemy na dwa sposoby:\n- **ś, ć, ź, dź, ń** — **przed spółgłoską** i **na końcu wyrazu**: *ślimak, liść, koń*\n- **si, ci, zi, dzi, ni** — **przed samogłoską**: *siano, ciocia, zima, dziadek, niebo*\n\nPorównaj: *liść* — ale *liście*; *koń* — ale *konie* (tu „i” zmiękcza).' },
              { type: 'example', title: 'Sprawdzanie', text: 'Co jest po głosce? Samogłoska → piszemy z „i”: *ciasto*. Spółgłoska albo koniec → kreska: *ćma*, *łabędź*.' },
            ],
            practice: [
              mc('Jak poprawnie napisać?', ['śiano', 'siano'], 1, 'Przed samogłoską piszemy si: siano.', { fixed: true }),
              mc('Jak poprawnie napisać?', ['liść', 'lisc', 'lisić'], 0, 'Na końcu wyrazu piszemy ć: liść.', { fixed: true }),
              mc('Jak poprawnie napisać?', ['ćiocia', 'ciocia'], 1, 'Przed samogłoską: ci.', { fixed: true }),
              mc('Jak poprawnie napisać?', ['ślimak', 'silimak'], 0, 'Przed spółgłoską: ś.', { fixed: true }),
              dict('dziadek', 'Mój dziadek ma ogród.'), dict('koń', 'Koń biegnie po łące.'),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plSounds', {}, 3), mc('Który wyraz jest pierwszy alfabetycznie?', ['żaba', 'zebra', 'źrebak'], 1, 'z → ź → ż.', { fixed: true }), mc('Ile sylab ma wyraz **czekolada**?', ['3', '4', '5'], 1, 'cze-ko-la-da → 4.', { fixed: true }), mc('Jak poprawnie napisać?', ['niebo', 'ńebo'], 0, 'Przed samogłoską: ni.', { fixed: true })] },
        challenge: [star(mc('Ułóż alfabetycznie: ćma, cebula, czapla. Który wyraz będzie ostatni?', ['ćma', 'cebula', 'czapla'], 0, 'cebula (ce…), czapla (cz…), ćma (ć jest po c, więc po wszystkich wyrazach na c…). Ostatnia: ćma.')), star(inp('Ile głosek jest w wyrazie **dżdżownica**? Wpisz liczbę.', ['8'], 'dż-dż-o-w-n-i-c-a → 8 głosek (10 liter).', { numeric: true }))],
      },
      {
        id: 'czytanie', term: 1, strand: 'Czytanie i słuchanie', bridge: 'reading',
        title: 'Czytamy ze zrozumieniem',
        summary: 'Czytanie opowiadań, legend i tekstów informacyjnych; szukanie informacji w tekście i wyciąganie wniosków.',
        outcomes: ['Znajduję w tekście ważne informacje', 'Wskazuję bohaterów, miejsce i czas akcji', 'Odróżniam legendę od tekstu informacyjnego'],
        lessons: [
          {
            id: 'opowiadanie', title: 'Opowiadanie: „Na grzybach”', minutes: 15,
            blocks: [
              { type: 'read', title: 'Na grzybach', text: T_JEZ },
              { type: 'tip', text: 'Przeczytajcie tekst na głos — na zmianę po jednym akapicie. Potem odpowiedz na pytania bez zaglądania… a jeśli trzeba, wróć do tekstu!' },
              { type: 'vocab', words: [['grzybnia', 'podziemna część grzyba', 'mycelium'], ['legowisko', 'miejsce, gdzie zwierzę śpi', 'den, bed'], ['wiklinowy', 'zrobiony z wikliny (gałązek)', 'wicker']] },
            ],
            practice: [
              mc('Z kim Jaś poszedł do lasu?', ['z mamą', 'z babcią', 'z tatą', 'sam'], 1, 'W tekście: „Jaś wyszedł z babcią do lasu”.'),
              mc('Jaka była pora roku?', ['wiosna', 'lato', 'jesień', 'zima'], 2, '„Jesienny poranek”.'),
              mc('Co robił jeż?', ['jadł grzyby', 'szukał liści na legowisko', 'spał', 'uciekał przed psem'], 1, 'Jeż szukał liści na zimowe legowisko.'),
              inp('Ile grzybów sam znalazł Jaś? Wpisz liczbę.', ['7', 'siedem'], '„sam znalazł aż siedem grzybów”.'),
              mc('Dlaczego Jaś nie dotykał jeża?', ['Bo się bał psa.', 'Bo nie wolno niepokoić dzikich zwierząt.', 'Bo jeż był w koszyku.', 'Bo padał deszcz.'], 1, 'Dzikie zwierzęta obserwujemy z daleka i ich nie dotykamy.'),
              mc('Jak czuł się Jaś na końcu?', ['smutny', 'zły', 'dumny', 'przestraszony'], 2, '„Jaś był dumny”.'),
            ],
          },
          {
            id: 'legenda', title: 'Legenda o smoku wawelskim', minutes: 15,
            blocks: [
              { type: 'read', title: 'O smoku wawelskim', text: T_SMOK },
              { type: 'read', text: '**Legenda** to opowieść przekazywana od dawna. Wydarzyła się „dawno temu”, w **prawdziwym miejscu** (Kraków, Wawel, Wisła), ale są w niej **elementy fantastyczne** (smok!).' },
              { type: 'vocab', words: [['legenda', 'dawna opowieść o prawdziwym miejscu z elementami fantastycznymi', 'legend'], ['szewc', 'człowiek, który naprawia buty', 'shoemaker'], ['przynęta', 'coś, co zwabia', 'bait']] },
            ],
            practice: [
              mc('Gdzie mieszkał smok?', ['w lesie', 'w jamie pod Wawelem', 'w Wiśle', 'w zamku'], 1, '„pod Wawelem, w głębokiej jamie”.'),
              mc('Kto pokonał smoka?', ['król Krak', 'rycerz', 'szewczyk Skuba', 'królewna'], 2, 'Smoka pokonał szewczyk Skuba.'),
              mc('Czym Skuba wypełnił skórę barana?', ['piaskiem', 'siarką', 'wodą', 'kamieniami'], 1, 'Napełnił ją siarką.'),
              mc('Co jest w tej legendzie fantastyczne (nieprawdziwe)?', ['Kraków', 'Wisła', 'smok', 'król'], 2, 'Smoki nie istnieją — to element fantastyczny.'),
              pf('Legenda opowiada o prawdziwym mieście.', true, 'Kraków to prawdziwe miasto.'),
              mc('Jaka cecha najlepiej opisuje Skubę?', ['sprytny', 'leniwy', 'tchórzliwy', 'chciwy'], 0, 'Wymyślił sprytny sposób na smoka.'),
            ],
          },
          {
            id: 'informacyjny', title: 'Tekst informacyjny: pszczoły', minutes: 15,
            blocks: [
              { type: 'read', title: 'Pracowite pszczoły', text: T_PSZCZOLY },
              { type: 'read', text: '**Tekst informacyjny** podaje prawdziwe wiadomości (fakty). Nie ma w nim bohaterów jak w bajce. Często ma **śródtytuły**, wyróżnione słowa i zdjęcia.' },
            ],
            practice: [
              mc('Kto w ulu składa jaja?', ['robotnice', 'matka', 'trutnie'], 1, 'Matka składa jaja.', { fixed: true }),
              mc('Co robią robotnice?', ['tylko śpią', 'zbierają nektar i budują plastry', 'składają jaja', 'pilnują lasu'], 1, 'Robotnice zbierają nektar i pyłek, budują plastry.'),
              mc('Dlaczego pszczoły są pożyteczne?', ['Bo żądlą.', 'Bo przenoszą pyłek i dzięki nim rosną owoce.', 'Bo są żółte.', 'Bo mieszkają w ulach.'], 1, 'Zapylają kwiaty.'),
              pf('Pszczoła żądli zawsze, gdy zobaczy człowieka.', false, 'Żądli tylko, gdy się boi.'),
              mc('To jest tekst…', ['informacyjny', 'legenda', 'wiersz', 'baśń'], 0, 'Podaje fakty o pszczołach.', { fixed: true }),
            ],
          },
          {
            id: 'ogloszenie', title: 'Ogłoszenie i zaproszenie', minutes: 12,
            blocks: [
              { type: 'read', title: 'Ogłoszenie', text: T_OGLOSZENIE },
              { type: 'read', text: 'Ogłoszenie odpowiada na pytania: **co? gdzie? kiedy? dla kogo?** i co trzeba zrobić.\n\nZaproszenie mówi: **kogo** zapraszamy, **na co**, **gdzie**, **kiedy** i **kto** zaprasza.' },
            ],
            practice: [
              mc('Dokąd jadą uczniowie?', ['do zoo', 'do Muzeum Przyrodniczego', 'do kina', 'nad morze'], 1, 'Do Muzeum Przyrodniczego.'),
              inp('O której godzinie jest zbiórka? (np. 8:00)', ['8:00', '8', 'ósmej', 'o 8:00', '8.00'], 'Zbiórka o 8:00.'),
              inp('Ile kosztuje wycieczka (w złotych)? Wpisz liczbę.', ['35'], '35 zł.', { numeric: true }),
              mc('Do kiedy trzeba oddać pieniądze?', ['do poniedziałku', 'do środy', 'do piątku', 'do soboty'], 1, 'Do środy.'),
              write('Napisz zaproszenie na swoje urodziny dla koleżanki lub kolegi.', ['Do kogo', 'Na co zapraszasz', 'Gdzie i kiedy', 'Podpis'], 25, { homework: true }),
            ],
          },
          {
            id: 'wniosek', title: '★ Czytamy między wierszami', minutes: 12,
            blocks: [
              { type: 'read', text: 'Czasem tekst nie mówi czegoś wprost — trzeba się **domyślić** (wyciągnąć wniosek).\n\n*Kasia otworzyła parasol i założyła kalosze.* → Nikt nie napisał, że pada deszcz, ale się tego **domyślamy**.\n\nSzukamy **wskazówek** w tekście.' },
            ],
            practice: [
              mc('Tomek ziewnął, przetarł oczy i spojrzał na zegar: była 22:00. Co można wywnioskować?', ['Tomek jest głodny.', 'Tomek jest śpiący.', 'Tomek idzie do szkoły.', 'Tomek jest wesoły.'], 1, 'Ziewanie, późna godzina → jest śpiący.'),
              mc('Na stole stał tort ze świeczkami, a goście śpiewali „Sto lat”. Co się działo?', ['lekcja', 'urodziny', 'wycieczka', 'zakupy'], 1, 'Tort, świeczki, „Sto lat” → urodziny.'),
              mc('Ala wróciła ze dworu z czerwonym nosem i zimnymi rękami. Jaka była pogoda?', ['upał', 'mróz', 'burza', 'ciepły deszcz'], 1, 'Czerwony nos, zimne ręce → mróz.'),
            ],
          },
        ],
        quiz: { n: 10, items: [
          mc('Kto był bohaterem opowiadania „Na grzybach”?', ['Jaś', 'Skuba', 'Ola', 'Ania'], 0, 'Jaś i babcia.'),
          mc('Co zrobił smok po połknięciu przynęty?', ['zasnął', 'pił wodę z Wisły', 'uciekł', 'zjadł owce'], 1, 'Pił wodę z Wisły, aż pękł.'),
          mc('Z czego pszczoły robią miód?', ['z wosku', 'z nektaru', 'z liści', 'z wody'], 1, 'Z nektaru.'),
          mc('Legenda to…', ['prawdziwy artykuł z gazety', 'dawna opowieść z elementami fantastycznymi', 'przepis kulinarny', 'list'], 1, 'Legenda ma elementy fantastyczne.'),
          mc('Ogłoszenie odpowiada na pytanie…', ['kiedy i gdzie?', 'jaki jest kolor?', 'ile waży?', 'kto wygra?'], 0, 'Co, gdzie, kiedy.'),
          pf('Robotnice opiekują się larwami.', true, 'Tak, w tekście.'),
          mc('Kto obiecał nagrodę za pokonanie smoka?', ['Skuba', 'król Krak', 'rycerz', 'babcia'], 1, 'Król Krak.'),
          mc('Co Jaś miał ze sobą w lesie?', ['wiadro', 'koszyk i nożyk', 'rower', 'plecak'], 1, 'Wiklinowy koszyk i nożyk.'),
        ] },
        challenge: [star(mc('Dlaczego babcia uczyła Jasia ostrożnie wykręcać grzyby?', ['żeby było szybciej', 'żeby w tym miejscu znów wyrosły grzyby', 'żeby koszyk był lżejszy', 'bo grzyby są trujące'], 1, 'Nie niszczymy grzybni — wtedy grzyby wyrosną znowu.')), star(mc('Jaki morał płynie z legendy o smoku?', ['Siła jest najważniejsza.', 'Mądrość i spryt mogą być silniejsze niż miecz.', 'Smoki są dobre.', 'Nie warto pomagać.'], 1, 'Skuba wygrał sprytem, nie siłą.'))],
      },
      {
        id: 'sluchanie', term: 1, strand: 'Czytanie i słuchanie', bridge: 'poetry',
        title: 'Słuchamy uważnie',
        summary: 'Słuchanie tekstów czytanych przez Sowę Zosię i odpowiadanie na pytania; zapamiętywanie szczegółów.',
        lessons: [
          {
            id: 'sklep', title: 'Słuchanie: w sklepie', minutes: 10,
            blocks: [
              { type: 'read', text: 'Dobry słuchacz:\n- patrzy na mówiącego (lub zamyka oczy i wyobraża sobie),\n- słucha **słów-kluczy**: kto? co? gdzie? kiedy? ile?\n- nie przerywa.\n\nNaciśnij **Słuchaj** i posłuchaj historii.' },
              { type: 'listen', title: 'Zakupy', text: L_SKLEP },
            ],
            practice: [
              mc('Z kim Ania poszła do sklepu?', ['z mamą', 'z tatą', 'z babcią', 'z bratem'], 1, 'Z tatą.', { listen: true }),
              inp('Ile jajek mieli kupić? Wpisz liczbę.', ['6', 'sześć'], 'Sześć jajek.', { listen: true }),
              mc('O czym przypomniała sobie Ania?', ['o chlebie', 'o jabłkach', 'o mleku', 'o serze'], 1, 'O jabłkach.', { listen: true }),
              inp('Ile zapłacili (w złotych)?', ['42', 'czterdzieści dwa'], 'Czterdzieści dwa złote.', { listen: true, numeric: true }),
            ],
          },
          {
            id: 'morze', title: 'Słuchanie: wakacje nad morzem', minutes: 10,
            blocks: [{ type: 'listen', title: 'Nad Bałtykiem', text: L_MORZE }],
            practice: [
              mc('Do jakiego miasta pojechała Ola?', ['Kraków', 'Gdańsk', 'Zakopane', 'Poznań'], 1, 'Do Gdańska.', { listen: true }),
              mc('Co najbardziej podobało się Oli?', ['zamki z piasku', 'rejs statkiem', 'oceanarium', 'muszelki'], 1, 'Rejs statkiem po zatoce.', { listen: true }),
              mc('Dlaczego ostatniego dnia poszli do oceanarium?', ['bo było zimno', 'bo padał deszcz', 'bo Ola była chora', 'bo zamknęli plażę'], 1, 'Padał deszcz.', { listen: true }),
              mc('Co widziała Ola z daleka?', ['zamek', 'latarnię morską', 'górę', 'most'], 1, 'Latarnię morską.', { listen: true }),
            ],
          },
          {
            id: 'wiersz', title: 'Wiersz: „Deszczyk”', minutes: 12,
            blocks: [
              { type: 'listen', title: 'Deszczyk', text: T_WIERSZ.replace(/\*\*/g, '') },
              { type: 'read', text: T_WIERSZ + '\n\n**Wiersz** składa się z **wersów** (linijek) i **zwrotek**. Często ma **rymy**: *szybie – płynie*, *statek – parapet* (prawie), *kropki – stopki*.' },
              { type: 'vocab', words: [['wers', 'jedna linijka wiersza', 'line'], ['zwrotka', 'grupa wersów', 'verse, stanza'], ['rym', 'podobne brzmienie końcówek', 'rhyme']] },
            ],
            practice: [
              mc('Ile zwrotek ma wiersz „Deszczyk”?', ['1', '2', '3', '4'], 1, 'Dwie zwrotki po 4 wersy.', { fixed: true }),
              mc('Do czego porównano parasol?', ['do statku', 'do grzybka', 'do kałuży', 'do kropli'], 1, '„Parasol jest jak grzybek”.'),
              mc('Który wyraz rymuje się z **kropki**?', ['stopki', 'deszczyk', 'statek', 'szyba'], 0, 'kropki – stopki.'),
              mc('Słowa „kap, kap, kap” naśladują…', ['wiatr', 'odgłos deszczu', 'śpiew ptaka', 'kroki'], 1, 'To wyrazy dźwiękonaśladowcze.'),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Wers to…', ['jedna linijka wiersza', 'cały wiersz', 'tytuł', 'autor'], 0, 'Wers to linijka.'), mc('Rymują się wyrazy…', ['kot – płot', 'kot – pies', 'dom – las', 'mama – tata'], 0, 'kot – płot.'), mc('Dobry słuchacz…', ['przerywa', 'słucha słów-kluczy', 'rozmawia z kolegą', 'nie patrzy'], 1, 'Słucha uważnie słów-kluczy.')] },
        challenge: [star(write('Dopisz trzecią zwrotkę wiersza „Deszczyk” (4 wersy, z rymami).', ['4 wersy', 'Przynajmniej jedna para rymów', 'Temat: deszcz'], 16))],
      },
      {
        id: 'ou', term: 1, strand: 'Ortografia', bridge: 'spelling',
        title: 'Ortografia: ó i u',
        summary: 'Kiedy piszemy ó (wymiana na o, a, e; końcówki -ów, -ówka), a kiedy u (-uje, -unek, -uszek, na początku i końcu wyrazów).',
        outcomes: ['Stosuję zasady pisowni ó i u', 'Sprawdzam pisownię przez wymianę'],
        lessons: [
          {
            id: 'o-wymienne', title: 'Ó wymienne', minutes: 15,
            blocks: [
              { type: 'read', text: '**Ó** piszemy, gdy w innej formie wyrazu albo w wyrazie pokrewnym wymienia się na **o, e** lub **a**:\n- *stół* → sto**ł**y → **o**\n- *wiózł* → wi**e**źć → **e**\n- *pióro* → pi**e**rze → **e**\n- *lód* → l**o**dy → **o**\n\nTo **ó wymienne**. Zawsze szukaj wymiany!' },
              { type: 'example', title: 'Jak sprawdzić?', text: '*r_g* — róg czy rug? → **rogi** → wymienia się na o → **róg**.' },
              { type: 'vocab', words: [['wymiana', 'zmiana jednej głoski na inną w formie wyrazu', 'alternation'], ['wyraz pokrewny', 'wyraz z tej samej rodziny', 'related word']] },
            ],
            practice: [gen('plOU', {}, 6), dict('stół', 'Na stole stoi wazon.'), dict('mróz', 'W styczniu był mróz.')],
          },
          {
            id: 'o-koncowki', title: 'Ó w końcówkach -ów, -ówka, -ówna', minutes: 12,
            blocks: [
              { type: 'read', text: 'Ó piszemy też w **zakończeniach**:\n- **-ów**: Kraków, Rzeszów, kotów, domów\n- **-ówka**: złotówka, żarówka, pocztówka\n- **-ówna**: Nowakówna, Malinówna\n\nWyjątki do zapamiętania: *zasuwka, skuwka* (od „zasuwać”, „skuwać”).' },
            ],
            practice: [
              mc('Jak napisać?', ['Krak_w → Kraków', 'Krak_w → Krakuw'], 0, 'Końcówka -ów.', { fixed: true }),
              mc('Uzupełnij: żar_wka', ['ó', 'u'], 0, 'Końcówka -ówka.', { fixed: true }),
              mc('Uzupełnij: poczt_wka', ['ó', 'u'], 0, 'Końcówka -ówka.', { fixed: true }),
              dict('złotówka', 'Mam w portfelu złotówkę.'), dict('ołówek', 'Piszę ołówkiem.'), gen('plOU', {}, 2),
            ],
          },
          {
            id: 'u-zasady', title: 'Kiedy piszemy u', minutes: 15,
            blocks: [
              { type: 'read', text: '**U** piszemy:\n- w zakończeniach **-uje, -ujesz, -ujemy**: *maluje, rysuje, buduje*\n- w zakończeniach **-unek, -uszek, -uchna, -utki, -usieńki**: *rysunek, kożuszek, mamusia… malutki*\n- **na początku** wyrazów: *ucho, ul, ulica*\n- **na końcu** wyrazów: *tu, kakadu, ku*\n- gdy **nie ma wymiany**: *mucha, kura, sznurek, but*\n\n**Ó niewymienne** trzeba zapamiętać: *góra, król, córka, żółw, chór, skóra, wróbel, ogórek*.' },
            ],
            practice: [
              mc('Uzupełnij: mal_je', ['ó', 'u'], 1, '-uje piszemy przez u.', { fixed: true }),
              mc('Uzupełnij: rys_nek', ['ó', 'u'], 1, '-unek piszemy przez u.', { fixed: true }),
              mc('Uzupełnij: _l (dom pszczół)', ['ó', 'u'], 1, 'Na początku wyrazu: u.', { fixed: true }),
              mc('Uzupełnij: g_ra (ó niewymienne)', ['ó', 'u'], 0, 'góra — ó niewymienne, trzeba zapamiętać.', { fixed: true }),
              dict('rysunek', 'Mój rysunek wisi na ścianie.'), dict('buduje', 'Tata buduje domek dla ptaków.'), gen('plOU', {}, 2),
            ],
          },
          {
            id: 'dyktando-ou', title: 'Dyktando: ó i u', minutes: 12,
            blocks: [
              { type: 'read', text: 'Czas na dyktando! Sowa Zosia przeczyta wyraz — napisz go poprawnie. Pomyśl o zasadzie, zanim napiszesz.\n\nMożesz pisać na klawiaturze albo **Apple Pencil** (przycisk ✍️).' },
              { type: 'tip', text: 'Niech dziecko głośno powie zasadę, np. „stół, bo stoły”. To najlepszy sposób, żeby ją zapamiętać.' },
            ],
            practice: [gen('plDyktando', { set: 'ou' }, 8)],
          },
        ],
        quiz: { n: 10, items: [gen('plOU', {}, 6), gen('plDyktando', { set: 'ou' }, 4)] },
        challenge: [star(mc('W którym wyrazie jest błąd?', ['wróbel', 'żółw', 'kożuszek', 'ogurek'], 3, 'Poprawnie: ogórek (ó niewymienne).')), star(mc('Która zasada wyjaśnia pisownię wyrazu **pszczółka**?', ['ó wymienia się na o (pszczoła)', 'końcówka -uje', 'u na początku', 'ó niewymienne'], 0, 'pszczółka → pszczoła: wymiana ó na o.'))],
      },
      {
        id: 'rz', term: 1, strand: 'Ortografia', bridge: 'spelling',
        title: 'Ortografia: rz i ż',
        summary: 'Rz wymienne na r, rz po spółgłoskach, ż wymienne na g, dz, h, z, s, ś; ż niewymienne.',
        lessons: [
          {
            id: 'rz-wymienne', title: 'Rz wymienne na r', minutes: 15,
            blocks: [
              { type: 'read', text: '**Rz** piszemy, gdy w innej formie wyrazu wymienia się na **r**:\n- *morze* → mo**r**ski\n- *rowerzysta* → rowe**r**\n- *na górze* → gó**r**a\n- *Piotrze!* → Piot**r**\n\nRz piszemy też w zakończeniach **-arz, -erz, -mierz**: *lekarz, kucharz, żołnierz*.' },
              { type: 'vocab', words: [['wymiana rz na r', 'morze — morski', 'rz → r alternation']] },
            ],
            practice: [gen('plRZ', {}, 6), dict('lekarz', 'Lekarz bada chorego.')],
          },
          {
            id: 'rz-spolgloski', title: 'Rz po spółgłoskach', minutes: 12,
            blocks: [
              { type: 'read', text: 'Po spółgłoskach **b, p, d, t, g, k, ch, j, w** piszemy **rz**:\n- **brz**oza, **prz**yjaciel, **drz**ewo, **trz**y, **grz**yb, **krz**esło, **chrz**an, **wrz**esień\n\nWyjątki do zapamiętania: *pszenica, pszczoła, kształt, bukszpan* — tam jest sz, a nie rz.' },
            ],
            practice: [
              mc('Uzupełnij: d_ewo', ['rz', 'ż'], 0, 'Po d piszemy rz.', { fixed: true }),
              mc('Uzupełnij: k_esło', ['rz', 'ż'], 0, 'Po k piszemy rz.', { fixed: true }),
              mc('Uzupełnij: p_yjaciel', ['rz', 'ż'], 0, 'Po p piszemy rz.', { fixed: true }),
              mc('Uzupełnij: p_czoła', ['rz', 'sz'], 1, 'Wyjątek: pszczoła.', { fixed: true }),
              dict('drzewo', 'Na drzewie siedzi sowa.'), dict('grzyb', 'W lesie rośnie grzyb.'), dict('trzy', 'Mam trzy kredki.'),
            ],
          },
          {
            id: 'z-wymienne', title: 'Ż wymienne i niewymienne', minutes: 15,
            blocks: [
              { type: 'read', text: '**Ż** piszemy, gdy wymienia się na **g, dz, h, z, s, ś**:\n- *książka* → księ**g**a\n- *mosiężny* → mosią**dz**\n- *drużyna* → dru**h**\n- *wożę* → wo**z**ić\n- *wyżej* → wy**s**oko\n- *ważyć* → wa**g**a\n\n**Ż niewymienne** trzeba zapamiętać: *żaba, żółw, żyrafa, żaglówka, żuraw, jeż, żart, plaża*.' },
            ],
            practice: [gen('plRZ', {}, 5), mc('Uzupełnij: ksią_ka', ['rz', 'ż'], 1, 'książka → księga (ż → g).', { fixed: true }), dict('żaba', 'Żaba skacze do stawu.'), dict('jeż', 'Jeż śpi pod liśćmi.')],
          },
          {
            id: 'dyktando-rz', title: 'Dyktando: rz i ż', minutes: 12,
            blocks: [{ type: 'read', text: 'Posłuchaj i napisz. Pamiętaj: wymiana na **r** → rz; wymiana na **g, h, z, s** → ż; po **b, p, d, t, g, k, ch, j, w** → rz.' }],
            practice: [gen('plDyktando', { set: 'rz' }, 8)],
          },
        ],
        quiz: { n: 10, items: [gen('plRZ', {}, 6), gen('plDyktando', { set: 'rz' }, 4)] },
        challenge: [star(mc('W którym wyrazie jest błąd?', ['brzoza', 'pszenica', 'krzesło', 'pszyjaciel'], 3, 'Poprawnie: przyjaciel — po p piszemy rz.')), star(mc('Dlaczego **dróżka** piszemy przez ż i ó?', ['dróżka → droga: ó → o, ż → g', 'bo to wyjątek', 'bo jest na początku', 'bo -uje'], 0, 'Obie litery są wymienne: droga.'))],
      },
      {
        id: 'ch', term: 2, strand: 'Ortografia', bridge: 'spelling',
        title: 'Ortografia: ch i h, wielka litera',
        summary: 'Ch wymienne na sz, ch na końcu wyrazów, h wymienne na g i ż; wielka litera w nazwach własnych.',
        lessons: [
          {
            id: 'ch-h', title: 'Ch i h', minutes: 15,
            blocks: [
              { type: 'read', text: '**Ch** piszemy:\n- gdy wymienia się na **sz**: *mucha* → mu**sz**ka, *ucho* → u**sz**y\n- na **końcu wyrazu**: *dach, mech, groch, brzuch*\n- po **s**: *schody, schować, schronisko*\n\n**H** piszemy, gdy wymienia się na **g** lub **ż**: *druh* → dru**ż**yna. Większość wyrazów z h trzeba po prostu zapamiętać (**h niewymienne**): *hamak, herbata, hałas, huśtawka, harcerz, hokej*.' },
            ],
            practice: [gen('plCH', {}, 6), dict('dach', 'Na dachu siedzi kot.'), dict('herbata', 'Babcia pije herbatę.')],
          },
          {
            id: 'wielka', title: 'Wielka litera', minutes: 15,
            blocks: [
              { type: 'read', text: '**Wielką literą** piszemy:\n- początek zdania\n- imiona i nazwiska: *Ania Kowalska*\n- imiona zwierząt: *Burek, Mruczek*\n- nazwy miast, rzek, gór, państw: *Kraków, Wisła, Tatry, Polska*\n- nazwy świąt: *Boże Narodzenie, Wielkanoc*\n- tytuły książek (pierwszy wyraz): *„Dzieci z Bullerbyn”*\n\n**Małą literą** piszemy: **dni tygodnia** i **miesiące** (*poniedziałek, maj*) oraz przymiotniki *polski, angielski*.' },
              { type: 'tip', text: 'Po angielsku jest inaczej: *Monday, May, Polish* piszemy wielką literą! Tosia uczy się obu języków — warto to porównać.' },
            ],
            practice: [gen('plCaps', {}, 8)],
          },
          {
            id: 'dyktando-mix', title: 'Wielkie dyktando klasy 3', minutes: 15,
            blocks: [{ type: 'read', text: 'Dyktando z wszystkich trudności: **ó/u, rz/ż, ch/h**. Przypomnij sobie zasady, zanim zaczniesz!' }],
            practice: [gen('plDyktando', { set: 'all' }, 10)],
          },
        ],
        quiz: { n: 10, items: [gen('plCH', {}, 4), gen('plCaps', {}, 3), gen('plOrto', {}, 3)] },
        challenge: [star(mc('Który zapis jest w całości poprawny?', ['W poniedziałek jedziemy do Krakowa.', 'W Poniedziałek jedziemy do krakowa.', 'w poniedziałek jedziemy do Krakowa.', 'W poniedziałek jedziemy do krakowa.'], 0, 'Zdanie od wielkiej litery, dzień tygodnia małą, miasto wielką.')), star(mc('W którym wyrazie jest błąd?', ['schody', 'chałas', 'mucha', 'brzuch'], 1, 'Poprawnie: hałas (h niewymienne).'))],
      },
      {
        id: 'czesci-mowy', term: 2, strand: 'Kształcenie językowe', bridge: 'parts-of-speech',
        title: 'Części mowy',
        summary: 'Rzeczownik, czasownik, przymiotnik; rodzaj i liczba rzeczownika; czasy czasownika; ★ przysłówek i liczebnik.',
        outcomes: ['Rozpoznaję rzeczownik, czasownik i przymiotnik', 'Określam rodzaj i liczbę rzeczownika', 'Rozpoznaję czas czasownika'],
        lessons: [
          {
            id: 'rzeczownik', title: 'Rzeczownik', minutes: 12,
            blocks: [
              { type: 'read', text: '**Rzeczownik** to nazwa osoby, zwierzęcia, rzeczy, rośliny lub zjawiska. Odpowiada na pytania **kto? co?**\n\n*mama, pies, stół, róża, deszcz, radość*\n\nRzeczownik ma **rodzaj**:\n- męski — **ten** stół\n- żeński — **ta** lampa\n- nijaki — **to** okno\n\nI **liczbę**: pojedynczą (*kot*) i mnogą (*koty*).' },
              { type: 'vocab', words: [['rzeczownik', 'kto? co?', 'noun'], ['rodzaj', 'męski, żeński, nijaki', 'gender'], ['liczba mnoga', 'wiele', 'plural']] },
            ],
            practice: [gen('plGender', {}, 4), gen('plPlural', {}, 3)],
          },
          {
            id: 'czasownik', title: 'Czasownik', minutes: 12,
            blocks: [
              { type: 'read', text: '**Czasownik** mówi, co ktoś robi albo co się z czymś dzieje. Pytania: **co robi? co się z nim dzieje?**\n\n*biega, czyta, rośnie, pada*\n\nCzasownik ma **czas**:\n- przeszły — wczoraj **czytałam**\n- teraźniejszy — teraz **czytam**\n- przyszły — jutro **będę czytać** / **przeczytam**' },
            ],
            practice: [gen('plTense', {}, 5), gen('plNie', {}, 2)],
          },
          {
            id: 'przymiotnik', title: 'Przymiotnik', minutes: 12,
            blocks: [
              { type: 'read', text: '**Przymiotnik** opisuje cechy. Pytania: **jaki? jaka? jakie?**\n\n*zielony liść, wesoła dziewczynka, wysokie drzewo*\n\nPrzymiotnik dopasowuje się do rzeczownika: *duży dom, duża szafa, duże okno*.\n\n**Nie** z przymiotnikami piszemy **razem**: *niewysoki, niebieski*.' },
            ],
            practice: [gen('plPOS', {}, 5), gen('plAntonym', {}, 2), gen('plSynonym', {}, 2)],
          },
          {
            id: 'przyslowek', title: '★ Przysłówek i liczebnik', minutes: 12,
            blocks: [
              { type: 'read', text: 'To części mowy z klasy 4 — dla ambitnych!\n\n**Przysłówek** opisuje czynność: **jak? kiedy? gdzie?** — *szybko biegnie, wczoraj padało, tu mieszkam*.\n\n**Liczebnik** mówi **ile?** albo **który?** — *pięć jabłek, trzecia klasa*.' },
            ],
            practice: [gen('plPOS', { level: 4 }, 6)],
          },
          {
            id: 'zdrobnienia', title: 'Rodzina wyrazów i zdrobnienia', minutes: 12,
            blocks: [
              { type: 'read', text: '**Wyrazy pokrewne** mają wspólną część i podobne znaczenie: *las, leśny, lasek, leśniczy*.\n\n**Zdrobnienia** nazywają coś małego lub miłego: *kot → kotek, ręka → rączka, noga → nóżka*.\n\nZdrobnienia pomagają w ortografii: *nóżka* (ó, bo noga), *główka* (ó, bo głowa).' },
            ],
            practice: [gen('plDiminutive', {}, 5), mc('Który wyraz NIE jest z rodziny wyrazu **las**?', ['leśniczy', 'lasek', 'leśny', 'lato'], 3, '„lato” nie ma związku z lasem.')],
          },
        ],
        quiz: { n: 12, items: [gen('plPOS', {}, 4), gen('plGender', {}, 2), gen('plTense', {}, 2), gen('plPlural', {}, 2), gen('plDiminutive', {}, 2)] },
        challenge: [star(gen('plPOS', { level: 4 }, 3)), star(mc('Ile przymiotników jest w zdaniu: „Mały, rudy kot pije ciepłe mleko”?', ['1', '2', '3', '4'], 2, 'mały, rudy, ciepłe → 3.', { fixed: true }))],
      },
      {
        id: 'zdania', term: 2, strand: 'Kształcenie językowe', bridge: 'sentences',
        title: 'Zdania i interpunkcja',
        summary: 'Rodzaje zdań, znaki interpunkcyjne, zdanie i równoważnik, przecinek przy wyliczaniu, dialog.',
        lessons: [
          {
            id: 'rodzaje', title: 'Rodzaje zdań', minutes: 12,
            blocks: [
              { type: 'read', text: '- **Oznajmujące** — informuje: *Jutro jest sobota.*\n- **Pytające** — pyta: *Czy masz psa?*\n- **Rozkazujące** — prosi lub rozkazuje: *Zamknij drzwi.*\n- **Wykrzyknikowe** — wyraża uczucia: *Jak pięknie!*\n\nNa końcu zdania stawiamy **kropkę (.)**, **znak zapytania (?)** lub **wykrzyknik (!)**.' },
            ],
            practice: [gen('plSentence', {}, 6)],
          },
          {
            id: 'przecinek', title: 'Przecinek', minutes: 12,
            blocks: [
              { type: 'read', text: 'Przecinek stawiamy:\n- przy **wyliczaniu**: *Kupiłam jabłka, gruszki, śliwki i banany.* (przed **i** nie stawiamy!)\n- przed **ale, lecz, że, bo, który, gdy**: *Chciałam iść, ale padało.*\n- po zwrocie do kogoś: *Mamo, chodź tutaj!*' },
            ],
            practice: [
              mc('Gdzie brakuje przecinka? „Lubię lody ale wolę ciasto.”', ['po „lubię”', 'przed „ale”', 'po „wolę”', 'nigdzie'], 1, 'Przed „ale” stawiamy przecinek.'),
              mc('Który zapis jest poprawny?', ['Mam kota, psa, i chomika.', 'Mam kota, psa i chomika.', 'Mam kota psa i chomika.'], 1, 'Przed „i” nie stawiamy przecinka.', { fixed: true }),
              mc('Który zapis jest poprawny?', ['Tato chodź!', 'Tato, chodź!'], 1, 'Po zwrocie do kogoś: przecinek.', { fixed: true }),
              mc('Gdzie brakuje przecinka? „Wiem że jutro pada.”', ['przed „że”', 'po „jutro”', 'nigdzie'], 0, 'Przed „że” stawiamy przecinek.', { fixed: true }),
            ],
          },
          {
            id: 'dialog', title: 'Dialog i myślnik', minutes: 12,
            blocks: [
              { type: 'read', text: 'W **dialogu** każdą wypowiedź zaczynamy **od nowej linii** i **myślnika (—)**:\n\n— Dzień dobry, pani Basiu! — zawołała Ola.\n— Dzień dobry, Olu. Dokąd idziesz?\n— Do biblioteki.' },
              { type: 'activity', text: 'Przeczytajcie dialog z podziałem na role. Potem wymyślcie własny dialog w sklepie.' },
            ],
            practice: [
              mc('Czym zaczynamy każdą wypowiedź w dialogu?', ['kropką', 'myślnikiem', 'przecinkiem', 'cudzysłowem'], 1, 'Myślnikiem (—), od nowej linii.'),
              write('Napisz krótki dialog (3–4 wypowiedzi) między tobą a sprzedawcą w piekarni.', ['Każda wypowiedź od nowej linii', 'Myślniki', 'Zwroty grzecznościowe: dzień dobry, proszę, dziękuję'], 20, { homework: true }),
            ],
          },
          {
            id: 'rownowaznik', title: '★ Zdanie i równoważnik zdania', minutes: 10,
            blocks: [{ type: 'read', text: '**Zdanie** ma czasownik w formie osobowej: *Pada deszcz.*\n**Równoważnik zdania** nie ma takiego czasownika, ale też jest zrozumiały: *Cisza! Wycieczka do lasu. Pożar!*' }],
            practice: [
              mc('Co jest równoważnikiem zdania?', ['Idę do szkoły.', 'Pożar!', 'Kot śpi.', 'Mama gotuje.'], 1, '„Pożar!” nie ma czasownika.'),
              mc('Co jest zdaniem?', ['Piękny dzień.', 'Uwaga!', 'Świeci słońce.', 'Dobranoc.'], 2, '„świeci” to czasownik.'),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('plSentence', {}, 5), mc('Przed którym wyrazem stawiamy przecinek?', ['i', 'ale', 'oraz', 'lub'], 1, 'Przed „ale”.'), mc('Jaki znak kończy zdanie pytające?', ['.', '?', '!'], 1, 'Znak zapytania.', { fixed: true })] },
        challenge: [star(mc('Ile zdań jest w tekście: „Pada. Zostaję w domu, bo nie mam parasola. Szkoda!”?', ['1', '2', '3'], 2, 'Trzy wypowiedzenia (w tym równoważnik „Szkoda!”).', { fixed: true }))],
      },
      {
        id: 'pisanie', term: 2, strand: 'Tworzenie wypowiedzi', bridge: 'narrative',
        title: 'Piszemy własne teksty',
        summary: 'Opowiadanie z planem, opis przedmiotu i zwierzęcia, list, życzenia, notatka.',
        outcomes: ['Piszę opowiadanie z początkiem, rozwinięciem i zakończeniem', 'Opisuję przedmiot i zwierzę', 'Piszę list i życzenia'],
        lessons: [
          {
            id: 'plan', title: 'Plan wydarzeń', minutes: 12,
            blocks: [
              { type: 'read', text: '**Plan** to lista najważniejszych wydarzeń po kolei. Pomaga napisać opowiadanie.\n\nPlan „Na grzybach”:\n1. Wyprawa do lasu z babcią.\n2. Znalezienie prawdziwka.\n3. Spotkanie z jeżem.\n4. Powrót z pełnym koszykiem.' },
            ],
            practice: [
              mc('Co powinno być pierwsze w planie legendy o smoku?', ['Smok pękł.', 'Smok mieszka pod Wawelem i niszczy okolicę.', 'Skuba żeni się z królewną.', 'Smok pije wodę.'], 1, 'Najpierw przedstawiamy sytuację.'),
              mc('Co powinno być ostatnie?', ['Skuba żeni się z królewną.', 'Król ogłasza nagrodę.', 'Rycerze walczą.', 'Skuba przygotowuje barana.'], 0, 'To zakończenie.'),
            ],
          },
          {
            id: 'opowiadanie-pis', title: 'Opowiadanie', minutes: 20,
            blocks: [
              { type: 'read', text: 'Opowiadanie ma trzy części:\n1. **Wstęp** — kto? gdzie? kiedy?\n2. **Rozwinięcie** — co się wydarzyło (po kolei)?\n3. **Zakończenie** — jak się skończyło? co czuł bohater?\n\nUżywaj słów: *najpierw, potem, następnie, nagle, w końcu*.\nKażdą część zaczynaj od **akapitu** (wcięcia).' },
            ],
            practice: [write('Napisz opowiadanie „Niezwykła przygoda w parku”. Ułóż je według planu.', ['Wstęp: kto, gdzie, kiedy', 'Rozwinięcie: co się stało', 'Zakończenie', 'Słowa: najpierw, potem, nagle', 'Wielkie litery i kropki'], 50, { homework: true })],
          },
          {
            id: 'opis', title: 'Opis przedmiotu i zwierzęcia', minutes: 15,
            blocks: [
              { type: 'read', text: 'Opis przedmiotu: **co to jest → wygląd (kształt, kolor, wielkość, materiał) → do czego służy → co o nim myślę**.\n\nOpis zwierzęcia: **jakie to zwierzę → wygląd (sierść, łapy, ogon) → zachowanie → dlaczego je lubię**.\n\nUżywaj wielu **przymiotników**: *puszysty, rudy, zwinny, wesoły*.' },
            ],
            practice: [write('Opisz swoją ulubioną zabawkę albo zwierzę.', ['Co to jest', 'Wygląd: co najmniej 4 przymiotniki', 'Do czego służy / jak się zachowuje', 'Twoja opinia'], 40, { homework: true })],
          },
          {
            id: 'list', title: 'List i życzenia', minutes: 15,
            blocks: [
              { type: 'read', text: '**List** ma:\n1. Miejscowość i datę (w prawym górnym rogu): *Warszawa, 12 października 2026 r.*\n2. Zwrot do adresata z wykrzyknikiem lub przecinkiem: *Droga Babciu!*\n3. Treść\n4. Pozdrowienia: *Ściskam Cię mocno,*\n5. Podpis\n\nW listach zwroty do adresata piszemy **wielką literą**: *Ciebie, Tobie, Twój*.' },
            ],
            practice: [
              mc('Gdzie w liście piszemy datę?', ['na dole', 'w prawym górnym rogu', 'na środku', 'nie piszemy'], 1, 'W prawym górnym rogu.'),
              mc('Jak poprawnie w liście?', ['Dziękuję ci za prezent.', 'Dziękuję Ci za prezent.'], 1, 'W listach: Ci, Ciebie, Twój wielką literą.', { fixed: true }),
              write('Napisz list do koleżanki lub kolegi z Australii. Opowiedz o swojej szkole w Polsce.', ['Miejscowość i data', 'Zwrot do adresata', 'Treść', 'Pozdrowienia i podpis', 'Ci / Ciebie wielką literą'], 45, { homework: true }),
            ],
          },
          {
            id: 'notatka', title: '★ Notatka i streszczenie', minutes: 12,
            blocks: [{ type: 'read', text: '**Notatka** zapisuje tylko najważniejsze informacje — krótko, w punktach.\n\nNotatka o pszczołach:\n- żyją w ulach, w rodzinach\n- matka — składa jaja; robotnice — zbierają nektar; trutnie\n- zapylają kwiaty, robią miód' }],
            practice: [write('Zrób notatkę w punktach z legendy o smoku wawelskim (4–5 punktów).', ['Punkty', 'Tylko najważniejsze', 'Kolejność wydarzeń'], 20)],
          },
        ],
        quiz: { n: 6, items: [mc('Z ilu części składa się opowiadanie?', ['2', '3', '5'], 1, 'Wstęp, rozwinięcie, zakończenie.', { fixed: true }), mc('Co piszemy na początku listu?', ['podpis', 'miejscowość i datę', 'pozdrowienia'], 1, 'Miejscowość i datę.', { fixed: true }), mc('W opisie zwierzęcia używamy dużo…', ['przymiotników', 'liczb', 'pytań'], 0, 'Przymiotniki opisują cechy.', { fixed: true }), mc('Słowo „nagle” pomaga…', ['zakończyć list', 'pokazać zwrot akcji w opowiadaniu', 'opisać kolor'], 1, 'Wprowadza niespodziewane wydarzenie.')] },
        challenge: [star(write('Napisz opowiadanie z dialogiem (min. 3 wypowiedzi) pt. „Gdyby zwierzęta umiały mówić”.', ['Trzy części', 'Dialog z myślnikami', 'Akapity', 'Ciekawe przymiotniki'], 70))],
      },
      {
        id: 'lektury', term: 2, strand: 'Czytanie i słuchanie', bridge: 'literature',
        title: 'Lektury i baśnie',
        summary: 'Baśń, bajka z morałem, rozmowa o lekturach klasy 3 (np. „Dzieci z Bullerbyn”, „Pinokio”), opinia o książce.',
        lessons: [
          {
            id: 'basn', title: 'Baśń i bajka', minutes: 12,
            blocks: [
              { type: 'read', text: '**Baśń** — opowieść z czarami, dobrymi i złymi postaciami; dobro zwycięża (np. „Kopciuszek”, „Królowa Śniegu”).\n\n**Bajka** — krótki utwór, często o zwierzętach, które zachowują się jak ludzie; kończy się **morałem** (nauką), np. bajki Ignacego Krasickiego.\n\n*„Kruk i lis”*: lis pochlebstwem wyłudził ser od kruka. **Morał**: nie ufaj pochlebcom.' },
              { type: 'vocab', words: [['baśń', 'opowieść z czarami', 'fairy tale'], ['bajka', 'krótki utwór z morałem', 'fable'], ['morał', 'nauka płynąca z utworu', 'moral']] },
            ],
            practice: [
              mc('Co ma bajka na końcu?', ['rymowankę', 'morał', 'zagadkę', 'dialog'], 1, 'Bajka kończy się morałem.'),
              mc('Który utwór to baśń?', ['„Kopciuszek”', 'przepis na ciasto', 'ogłoszenie', 'list'], 0, 'Kopciuszek to baśń.'),
              mc('Jaki morał ma bajka „Kruk i lis”?', ['Jedz dużo sera.', 'Nie ufaj pochlebcom.', 'Lisy są dobre.', 'Śpiewaj głośno.'], 1, 'Pochlebstwo bywa podstępem.'),
            ],
          },
          {
            id: 'bullerbyn', title: 'Lektura: „Dzieci z Bullerbyn”', minutes: 15,
            blocks: [
              { type: 'read', text: '„Dzieci z Bullerbyn” napisała szwedzka pisarka **Astrid Lindgren**. Opowiada o szóstce dzieci z małej wioski Bullerbyn — **Lisa** (narratorka), jej bracia **Lasse i Bosse**, **Britta i Anna** oraz **Olle**. Dzieci bawią się, chodzą do szkoły, świętują i przeżywają drobne przygody.\n\nTo książka o **przyjaźni** i radości z codziennych chwil.' },
              { type: 'tip', text: 'Jeśli macie książkę — czytajcie po jednym rozdziale wieczorem. Po każdym rozdziale niech Tosia opowie, co było najzabawniejsze.' },
            ],
            practice: [
              mc('Kto napisał „Dzieci z Bullerbyn”?', ['Jan Brzechwa', 'Astrid Lindgren', 'Julian Tuwim', 'Hans Christian Andersen'], 1, 'Astrid Lindgren, pisarka ze Szwecji.'),
              mc('Kto opowiada historię?', ['Lisa', 'Olle', 'Bosse', 'nauczycielka'], 0, 'Narratorką jest Lisa.'),
              mc('O czym jest ta książka?', ['o wojnie', 'o przyjaźni i zabawach dzieci', 'o kosmosie', 'o smokach'], 1, 'O przyjaźni i codziennych przygodach.'),
            ],
          },
          {
            id: 'opinia', title: 'Moja opinia o książce', minutes: 15,
            blocks: [{ type: 'read', text: 'Opinię wyrażamy zwrotami: *Moim zdaniem… Uważam, że… Podobało mi się, ponieważ… Nie podobało mi się, bo…*\n\nZawsze **uzasadnij** opinię — powiedz **dlaczego**.' }],
            practice: [write('Napisz, jaką książkę ostatnio czytałaś i czy ci się podobała. Uzasadnij.', ['Tytuł i autor', 'O czym jest', 'Moim zdaniem… ponieważ…', 'Komu polecisz'], 35, { homework: true })],
          },
        ],
        quiz: { n: 6, items: [mc('Morał to…', ['nauka z utworu', 'tytuł', 'bohater', 'rym'], 0, 'Nauka płynąca z utworu.', { fixed: true }), mc('W baśni zazwyczaj…', ['zło wygrywa', 'dobro zwycięża', 'nie ma bohaterów'], 1, 'Dobro zwycięża.', { fixed: true }), mc('Astrid Lindgren pochodziła ze…', ['Szwecji', 'Polski', 'Australii'], 0, 'Ze Szwecji.', { fixed: true })] },
        challenge: [star(mc('Czym różni się legenda od baśni?', ['Legenda dzieje się w prawdziwym miejscu.', 'Baśń zawsze jest wierszem.', 'Legenda nie ma bohaterów.', 'Nie ma różnicy.'], 0, 'Legenda wiąże się z prawdziwym miejscem lub historią.'))],
      },
    ],
  });
})();

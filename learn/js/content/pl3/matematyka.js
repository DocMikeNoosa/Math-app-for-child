/* Klasa 3 — edukacja matematyczna (podstawa programowa, I etap edukacyjny). Zadania z gwiazdką wykraczają nieco ponad poziom klasy. */
(function () {
  const { mc, pf, inp, num, gen, write, star } = LA.Q;
  const SVG = LA.SVG;

  LA.addSubject('pl3', {
    id: 'matematyka',
    intro: 'Liczby do 1000 (i dalej!), dodawanie i odejmowanie, tabliczka mnożenia, dzielenie, zadania tekstowe, pieniądze, mierzenie, czas, kalendarz, cyfry rzymskie i figury.',
    chapters: [
      {
        id: 'liczby-1000', term: 1, strand: 'Liczby', bridge: 'place-value',
        title: 'Liczby do 1000',
        summary: 'Czytamy, zapisujemy, porównujemy i rozkładamy liczby trzycyfrowe na setki, dziesiątki i jedności.',
        outcomes: ['Czytam i zapisuję liczby do 1000', 'Wiem, ile jest setek, dziesiątek i jedności', 'Porównuję liczby znakami <, >, =', 'Liczę dziesiątkami i setkami w przód i w tył'],
        lessons: [
          {
            id: 'setki', title: 'Setki, dziesiątki i jedności', minutes: 15,
            blocks: [
              { type: 'read', text: '## Każda cyfra ma swoje miejsce\nW liczbie **352**:\n- **3** to **setki** → 300\n- **5** to **dziesiątki** → 50\n- **2** to **jedności** → 2\n\nCzyli 352 = 300 + 50 + 2.\n\n**10 jedności** to **1 dziesiątka**. **10 dziesiątek** to **1 setka**. **10 setek** to **1 tysiąc** (1000)!' },
              { type: 'visual', svg: '<table class="gridmap"><tr><th>setki</th><th>dziesiątki</th><th>jedności</th></tr><tr><td>3</td><td>5</td><td>2</td></tr></table>' },
              { type: 'example', title: 'Ile jest warta cyfra 4?', text: 'W liczbie **463** cyfra 4 to setki → jest warta **400**.\nW liczbie **346** cyfra 4 to dziesiątki → jest warta **40**.\nTa sama cyfra, inne miejsce — inna wartość!' },
              { type: 'tip', text: 'Zero trzyma miejsce. W liczbie 405 zero mówi: „nie ma dziesiątek”.' },
              { type: 'vocab', words: [['setki', 'grupy po 100', 'hundreds'], ['dziesiątki', 'grupy po 10', 'tens'], ['jedności', 'pojedyncze sztuki', 'ones'], ['cyfra', 'znak 0–9, z którego budujemy liczby', 'digit']] },
            ],
            practice: [gen('placeValue', { min: 100, max: 999 }, 4), gen('expanded', { min: 100, max: 999 }, 2), num('Ile dziesiątek ma liczba 460? (wszystkich dziesiątek)', 46, '4 setki to 40 dziesiątek, plus 6 dziesiątek = 46 dziesiątek.')],
          },
          {
            id: 'czytanie', title: 'Czytamy i zapisujemy liczby', minutes: 12,
            blocks: [
              { type: 'read', text: 'Liczby trzycyfrowe czytamy od setek:\n- 245 → „dwieście czterdzieści pięć”\n- 608 → „sześćset osiem”\n- 1000 → „tysiąc”\n\nUwaga na setki: **sto, dwieście, trzysta, czterysta, pięćset, sześćset, siedemset, osiemset, dziewięćset**.' },
              { type: 'example', title: 'Słownie → cyframi', text: '„siedemset dwa” → 7 setek, **0 dziesiątek**, 2 jedności → **702**.' },
            ],
            practice: [gen('wordsToNum', { min: 100, max: 999 }, 3), gen('numToWords', { min: 100, max: 999 }, 3)],
          },
          {
            id: 'porownywanie', title: 'Porównujemy liczby', minutes: 12,
            blocks: [
              { type: 'read', text: 'Porównujemy od najwyższego rzędu — najpierw **setki**, potem dziesiątki, na końcu jedności.\n\n- 538 i 583: setki równe (5), dziesiątki: 3 < 8, więc **538 < 583**.\n\n**>** znaczy „większe od”, **<** — „mniejsze od”, **=** — „równe”.\n\n> Dzióbek znaku zawsze wskazuje liczbę mniejszą.' },
            ],
            practice: [gen('compare', { min: 100, max: 999 }, 3), gen('largest', { min: 100, max: 999 }, 3)],
          },
          {
            id: 'liczenie', title: 'Liczymy dziesiątkami i setkami', minutes: 12,
            blocks: [
              { type: 'read', text: 'Liczyć można nie tylko po 1:\n- **dziesiątkami**: 340, 350, 360, 370…\n- **setkami**: 200, 300, 400, 500…\n- **w tył**: 810, 800, 790, 780…\n\nTo ciągi liczbowe — znajdź regułę i licz dalej!' },
            ],
            practice: [gen('pattern', { maxStep: 10 }, 3), num('Jaka liczba jest o 10 większa od 795?', 805, '795 + 10 = 805. Uwaga na przejście przez setkę!'), num('Jaka liczba jest o 100 mniejsza od 1000?', 900, '1000 − 100 = 900.'), gen('oddEven', { max: 999 }, 2)],
          },
          {
            id: 'tysiac-plus', title: '★ Liczby powyżej tysiąca', minutes: 12,
            blocks: [
              { type: 'read', text: 'Po tysiącu liczymy dalej: 1000, 1001… 2000… aż do **10 000** (dziesięć tysięcy).\n\nW liczbie **4 352**:\n- 4 → tysiące (4000)\n- 3 → setki (300)\n- 5 → dziesiątki (50)\n- 2 → jedności (2)\n\nTo trochę ponad program klasy 3 — świetne wyzwanie!' },
            ],
            practice: [gen('placeValue', { min: 1000, max: 9999 }, 3), gen('wordsToNum', { min: 1000, max: 9999 }, 2), gen('compare', { min: 1000, max: 9999 }, 1)],
          },
        ],
        quiz: { n: 10, items: [gen('placeValue', { min: 100, max: 999 }, 3), gen('wordsToNum', { min: 100, max: 999 }, 2), gen('compare', { min: 100, max: 999 }, 2), gen('expanded', { min: 100, max: 999 }, 2), gen('largest', { min: 100, max: 999 }, 1)] },
        challenge: [star(num('Ile setek jest w liczbie 4 700?', 47, '4 tysiące = 40 setek, plus 7 setek = 47 setek.')), star(num('Najmniejsza liczba trzycyfrowa o różnych cyfrach to…', 102, '1 na początku (nie może być 0), potem najmniejsze inne cyfry: 0 i 2 → 102.')), star(num('Największa liczba trzycyfrowa parzysta to…', 998, '999 jest nieparzysta, więc 998.'))],
      },
      {
        id: 'dodawanie', term: 1, strand: 'Działania', bridge: 'add-sub',
        title: 'Dodawanie i odejmowanie',
        summary: 'Liczymy w pamięci do 100, dodajemy i odejmujemy pełne dziesiątki i setki, sprawdzamy wyniki.',
        lessons: [
          {
            id: 'w-pamieci', title: 'Liczymy w pamięci do 100', minutes: 15,
            blocks: [
              { type: 'read', text: 'Sposoby na szybkie liczenie:\n- **Przez dziesiątkę**: 38 + 7 → 38 + 2 = 40, 40 + 5 = 45\n- **Rozkład**: 46 + 23 → 40 + 20 = 60, 6 + 3 = 9, razem 69\n- **Pełne dziesiątki**: 57 + 30 → 67, 77, 87\n- **Odejmowanie przez dziesiątkę**: 52 − 8 → 52 − 2 = 50, 50 − 6 = 44' },
              { type: 'example', title: 'Odejmowanie przez doliczanie', text: '71 − 45 → od 45 do 50 to 5, od 50 do 71 to 21. Razem **26**.' },
            ],
            practice: [gen('add', { digits: 2, regroup: true }, 3), gen('sub', { digits: 2, regroup: true }, 3)],
          },
          {
            id: 'setki-dodawanie', title: 'Dodajemy pełne setki i dziesiątki', minutes: 12,
            blocks: [
              { type: 'read', text: 'Jeśli wiesz, że **3 + 4 = 7**, to wiesz też, że:\n- 30 + 40 = **70**\n- 300 + 400 = **700**\n\nTak samo z odejmowaniem: 9 − 5 = 4, więc 900 − 500 = **400**.\n\nDodawanie dziesiątek do liczb trzycyfrowych: 450 + 30 = 480, 480 + 40 = 520 (przejście przez setkę!).' },
            ],
            practice: [num('300 + 500 = ?', 800, '3 setki + 5 setek = 8 setek = 800.'), num('700 − 400 = ?', 300, '7 setek − 4 setki = 3 setki.'), num('460 + 50 = ?', 510, '460 + 40 = 500, potem + 10 = 510.'), num('830 − 60 = ?', 770, '830 − 30 = 800, potem − 30 = 770.'), gen('missing', { max: 100 }, 2)],
          },
          {
            id: 'pisemne', title: '★ Dodawanie i odejmowanie pisemne', minutes: 15,
            blocks: [
              { type: 'read', text: 'Duże liczby dodajemy **pisemnie** — jedna pod drugą, jedności pod jednościami.\n\n**347 + 285**\n1. Jedności: 7 + 5 = 12 → piszemy **2**, 1 dziesiątkę zapamiętujemy\n2. Dziesiątki: 4 + 8 + 1 = 13 → piszemy **3**, 1 setkę zapamiętujemy\n3. Setki: 3 + 2 + 1 = **6**\n\nWynik: **632**. W klasie 3 to wyzwanie — pisemnie uczy się zwykle w klasie 4.' },
              { type: 'tip', text: 'Zawsze najpierw oszacuj: 347 + 285 to około 350 + 290 = 640. Wynik 632 jest blisko — pasuje!' },
            ],
            practice: [gen('add', { digits: 3 }, 3), gen('sub', { digits: 3 }, 3)],
          },
          {
            id: 'sprawdzanie', title: 'Sprawdzamy wyniki', minutes: 12,
            blocks: [
              { type: 'read', text: 'Dodawanie i odejmowanie to działania **odwrotne**.\n\nJeśli **56 + 27 = 83**, to:\n- 83 − 27 = 56\n- 83 − 56 = 27\n\nOdejmowanie sprawdzamy dodawaniem: 83 − 27 = 56, bo 56 + 27 = 83 ✔' },
            ],
            practice: [gen('missing', { max: 100 }, 4), pf('Działanie 64 − 28 = 36 jest dobre, bo 36 + 28 = 64.', true, '36 + 28 = 64, więc odejmowanie było poprawne.')],
          },
          {
            id: 'zadania', title: 'Zadania tekstowe z dodawaniem i odejmowaniem', minutes: 15,
            blocks: [
              { type: 'read', text: 'Jak rozwiązywać zadania tekstowe:\n1. **Przeczytaj** uważnie (najlepiej dwa razy).\n2. **Co wiem?** Co trzeba obliczyć?\n3. **Działanie** — dodawanie (razem, więcej o…) czy odejmowanie (zostało, o ile mniej, o ile więcej)?\n4. **Oblicz** i **sprawdź**.\n5. Napisz **odpowiedź** pełnym zdaniem.' },
              { type: 'example', title: 'Przykład', text: 'W bibliotece było 345 książek. Wypożyczono 120. Ile książek zostało?\n**345 − 120 = 225.** Odpowiedź: Zostało 225 książek.' },
            ],
            practice: [gen('addWord', { max: 500 }, 4), write('Ułóż własne zadanie tekstowe na odejmowanie i je rozwiąż. Pamiętaj o odpowiedzi pełnym zdaniem.', ['Treść zadania z liczbami', 'Działanie', 'Odpowiedź pełnym zdaniem'], 20)],
          },
        ],
        quiz: { n: 10, items: [gen('add', { digits: 2 }, 3), gen('sub', { digits: 2 }, 3), gen('missing', { max: 100 }, 2), gen('addWord', { max: 500 }, 2)] },
        challenge: [star(num('Pomyślałam liczbę. Dodałam 48 i otrzymałam 100. Jaką liczbę pomyślałam?', 52, '100 − 48 = 52.')), star(num('Ola ma 125 zł, a Kuba o 38 zł więcej. Ile mają razem?', 288, 'Kuba: 125 + 38 = 163. Razem: 125 + 163 = 288.'))],
      },
      {
        id: 'tabliczka', term: 1, strand: 'Działania', bridge: 'times-tables',
        title: 'Tabliczka mnożenia',
        summary: 'Mnożenie jako dodawanie jednakowych składników i cała tabliczka mnożenia do 100.',
        lessons: [
          {
            id: 'co-to-mnozenie', title: 'Co to jest mnożenie?', minutes: 12,
            blocks: [
              { type: 'read', text: '**Mnożenie** to szybkie dodawanie takich samych liczb.\n\n4 talerze, na każdym 3 ciastka: 3 + 3 + 3 + 3 = 12, czyli **4 · 3 = 12**.\n\nKolejność czynników nie zmienia wyniku: **4 · 3 = 3 · 4**.\n\nLiczby, które mnożymy, to **czynniki**, a wynik to **iloczyn**.' },
              { type: 'visual', svg: SVG.array(4, 3) },
              { type: 'vocab', words: [['czynnik', 'liczba, którą mnożymy', 'factor'], ['iloczyn', 'wynik mnożenia', 'product'], ['razy', 'znak · w mnożeniu', 'times']] },
            ],
            practice: [gen('arrayMul', { maxR: 5, maxC: 6 }, 3), mc('Który zapis oznacza 5 + 5 + 5?', ['3 · 5', '5 · 5', '5 + 3', '15 · 3'], 0, 'Trzy razy po 5 to 3 · 5 = 15.')],
          },
          {
            id: 'razy-2-5-10', title: 'Mnożymy przez 2, 5 i 10', minutes: 12,
            blocks: [{ type: 'read', text: '- **· 2** to podwajanie: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20\n- **· 5** kończy się na 0 albo 5: 5, 10, 15, 20, 25…\n- **· 10** dopisuje zero: 7 · 10 = 70\n\n> · 5 to połowa z · 10! 8 · 10 = 80, więc 8 · 5 = 40.' }],
            practice: [gen('mulFact', { tables: [2, 5, 10] }, 6)],
          },
          {
            id: 'razy-3-4', title: 'Mnożymy przez 3 i 4', minutes: 12,
            blocks: [{ type: 'read', text: '- **· 3**: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30\n- **· 4**: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40\n\n> · 4 to podwojenie podwojenia: 7 · 4 → 7 · 2 = 14, 14 · 2 = **28**.' }],
            practice: [gen('mulFact', { tables: [3, 4] }, 6)],
          },
          {
            id: 'razy-6-9', title: 'Mnożymy przez 6, 7, 8 i 9', minutes: 15,
            blocks: [{ type: 'read', text: 'Sztuczki:\n- **· 6** = · 5 i jeszcze raz: 7 · 6 → 35 + 7 = **42**\n- **· 8** = trzy razy podwajanie: 6 · 8 → 12, 24, **48**\n- **· 9** = · 10 minus jeden raz: 7 · 9 → 70 − 7 = **63** (suma cyfr wyniku to 9!)\n- **· 7** — zamieniaj czynniki: 7 · 4 = 4 · 7 = 28' }],
            practice: [gen('mulFact', { tables: [6, 7, 8, 9] }, 8)],
          },
          {
            id: 'cala-tabliczka', title: 'Cała tabliczka mnożenia', minutes: 12,
            blocks: [
              { type: 'read', text: 'Tabliczkę mnożenia trzeba znać **na pamięć** — szybko i bez liczenia na palcach.\n\nĆwicz codziennie po kilka minut. Najtrudniejsze iloczyny: 6 · 7 = 42, 7 · 8 = 56, 6 · 8 = 48, 7 · 7 = 49, 8 · 8 = 64.' },
              { type: 'activity', text: 'Zabawa w „Szybkie karty”: rodzic mówi działanie (np. 6 · 7), dziecko odpowiada jak najszybciej. Ile poprawnych w 1 minutę?' },
            ],
            practice: [gen('mulFact10', {}, 10)],
          },
        ],
        quiz: { n: 12, items: [gen('mulFact10', {}, 10), gen('arrayMul', { maxR: 6, maxC: 8 }, 2)] },
        challenge: [star(num('Ile to jest 12 · 4?', 48, '10 · 4 = 40, 2 · 4 = 8, razem 48.')), star(num('Ile to jest 15 · 3?', 45, '10 · 3 = 30, 5 · 3 = 15, razem 45.')), star(num('Iloczyn dwóch liczb to 36, a jedna z nich to 4. Jaka jest druga?', 9, '4 · 9 = 36.'))],
      },
      {
        id: 'dzielenie', term: 1, strand: 'Działania', bridge: 'mul-div',
        title: 'Dzielenie i zadania z mnożeniem',
        summary: 'Dzielenie na równe części i po tyle samo, dzielenie z resztą i zadania tekstowe.',
        lessons: [
          {
            id: 'na-czesci', title: 'Dzielenie na równe części', minutes: 12,
            blocks: [
              { type: 'read', text: '**Dzielenie** to rozdzielanie po równo.\n\n- **Podział na części**: 12 cukierków dla 3 dzieci → każde dostaje **4** (12 : 3 = 4)\n- **Podział po tyle**: 12 cukierków po 3 do torebki → **4** torebki\n\nDzielenie sprawdzamy mnożeniem: 12 : 3 = 4, bo 3 · 4 = 12.' },
              { type: 'vocab', words: [['dzielna', 'liczba, którą dzielimy', 'dividend'], ['dzielnik', 'liczba, przez którą dzielimy', 'divisor'], ['iloraz', 'wynik dzielenia', 'quotient']] },
            ],
            practice: [gen('divFact', { tables: [2, 3, 4, 5, 10] }, 5), gen('divWord', { tables: [2, 3, 4, 5] }, 1)],
          },
          {
            id: 'dzielenie-tabliczka', title: 'Dzielenie w zakresie tabliczki', minutes: 12,
            blocks: [{ type: 'read', text: 'Każde mnożenie ma dwa dzielenia:\n**6 · 7 = 42** → **42 : 6 = 7** i **42 : 7 = 6**.\n\nGdy dzielisz, pytaj: „przez co trzeba pomnożyć dzielnik, aby wyszła dzielna?”' }],
            practice: [gen('divFact10', {}, 8)],
          },
          {
            id: 'reszta', title: '★ Dzielenie z resztą', minutes: 12,
            blocks: [{ type: 'read', text: 'Czasem nie da się podzielić po równo — coś **zostaje**. To **reszta**.\n\n17 : 5 = 3 **r 2**, bo 3 · 5 = 15, a do 17 brakuje 2.\n\nReszta jest zawsze **mniejsza** od dzielnika.' }],
            practice: [gen('divRem', { maxDiv: 5, maxQ: 9 }, 4), pf('Reszta może być większa od dzielnika.', false, 'Gdyby reszta była większa, dałoby się podzielić jeszcze raz.')],
          },
          {
            id: 'zadania-mnozenie', title: 'Zadania tekstowe z mnożeniem i dzieleniem', minutes: 15,
            blocks: [{ type: 'read', text: 'Słowa podpowiedzi:\n- **po… w każdym, razy, kilka razy więcej** → mnożenie\n- **po równo, podziel, ile razy mniej, ile w każdej** → dzielenie\n\nPrzykład: W 6 rzędach stoi po 8 krzeseł. Ile krzeseł? **6 · 8 = 48**.' }],
            practice: [gen('mulWord', { tables: [3, 4, 5, 6] }, 3), gen('divWord', { tables: [3, 4, 5, 6] }, 2), gen('twoStep', {}, 1)],
          },
        ],
        quiz: { n: 10, items: [gen('divFact10', {}, 5), gen('mulWord', {}, 2), gen('divWord', {}, 2), gen('divRem', { maxDiv: 5, maxQ: 9 }, 1)] },
        challenge: [star(num('Liczba jest 4 razy większa od 9. Jaka to liczba?', 36, '4 razy większa → mnożymy: 9 · 4 = 36.')), star(num('Liczba jest 6 razy mniejsza od 54. Jaka to liczba?', 9, '6 razy mniejsza → dzielimy: 54 : 6 = 9.')), star(gen('twoStep', {}, 1))],
      },
      {
        id: 'ulamki', term: 1, strand: 'Liczby', bridge: 'fractions',
        title: 'Połowa, ćwierć i inne części',
        summary: 'Dzielimy całość na równe części: połowa, trzecia część, ćwierć — na figurach i na liczbach.',
        lessons: [
          {
            id: 'polowa-cwierc', title: 'Połowa i ćwierć', minutes: 12,
            blocks: [
              { type: 'read', text: 'Gdy dzielimy całość na **2 równe części**, każda to **połowa** (1/2).\nGdy na **4 równe części** — każda to **ćwierć** (1/4).\n\nCzęści muszą być **równe**! Krzywo przecięta pizza nie ma prawdziwych połówek.' },
              { type: 'visual', svg: SVG.fractionCircle(4, 1) + '<p class="small">jedna ćwierć (1/4) koła</p>' },
            ],
            practice: [gen('unitFraction', { dens: [2, 3, 4] }, 4), num('Ile ćwierci ma jedna cała pizza?', 4, 'Całość podzielona na 4 równe części.')],
          },
          {
            id: 'czesci-liczby', title: 'Połowa i ćwierć liczby', minutes: 12,
            blocks: [{ type: 'read', text: '**Połowa** liczby = dzielimy przez 2: połowa z 16 to **8**.\n**Ćwierć** liczby = dzielimy przez 4: ćwierć z 20 to **5**.\n**Trzecia część** = dzielimy przez 3: 1/3 z 12 to **4**.' }],
            practice: [gen('fractionOf', { dens: [2, 3, 4], maxEach: 10 }, 5), num('Ile minut to pół godziny?', 30, 'Połowa z 60 minut to 30 minut.')],
          },
          {
            id: 'ulamki-wyzwanie', title: '★ Więcej części: ułamki', minutes: 12,
            blocks: [{ type: 'read', text: 'Zapis **3/4** czytamy „trzy czwarte”: całość podzielono na 4 części i bierzemy 3.\n\nLiczba na dole to **mianownik** (na ile części dzielimy), na górze **licznik** (ile części bierzemy). Ułamki poznasz dokładnie w klasie 4 — to twoje pierwsze spotkanie z nimi!' }],
            practice: [gen('unitFraction', { dens: [3, 4, 5, 6] }, 3), gen('fractionWhole', { dens: [3, 4, 5] }, 2)],
          },
        ],
        quiz: { n: 8, items: [gen('unitFraction', { dens: [2, 3, 4] }, 3), gen('fractionOf', { dens: [2, 3, 4] }, 4)] },
        challenge: [star(num('Ile to jest 3/4 z 20?', 15, '1/4 z 20 = 5, a 3/4 to 3 · 5 = 15.')), star(gen('fractionCompare', {}, 1))],
      },
      {
        id: 'pieniadze', term: 2, strand: 'Pieniądze', bridge: 'money',
        title: 'Złote i grosze',
        summary: 'Polskie monety i banknoty, zakupy, reszta i planowanie wydatków.',
        lessons: [
          {
            id: 'monety', title: 'Monety i banknoty', minutes: 12,
            blocks: [
              { type: 'read', text: 'W Polsce płacimy **złotymi (zł)** i **groszami (gr)**.\n\n**1 zł = 100 gr**\n\n- Monety: 1 gr, 2 gr, 5 gr, 10 gr, 20 gr, 50 gr, 1 zł, 2 zł, 5 zł\n- Banknoty: 10 zł, 20 zł, 50 zł, 100 zł, 200 zł, 500 zł\n\nZapis **3,45 zł** oznacza 3 złote i 45 groszy.' },
            ],
            practice: [gen('coins', {}, 4), num('Ile groszy ma 1 złoty?', 100, '1 zł = 100 gr.'), num('Ile monet 20-groszowych to 1 zł?', 5, '5 · 20 gr = 100 gr = 1 zł.')],
          },
          {
            id: 'zakupy', title: 'Robimy zakupy', minutes: 15,
            blocks: [{ type: 'read', text: '**Ile razem?** Dodajemy ceny: 2,50 zł + 1,20 zł = **3,70 zł**.\n\n**Reszta**: zapłaciłeś 5 zł za coś za 3,70 zł → doliczamy: 3,70 → 4,00 (30 gr) → 5,00 (1 zł). Reszta = **1,30 zł**.' }],
            practice: [gen('moneyTotal', {}, 3), gen('moneyChange', { note: [1000, 2000] }, 3)],
          },
          {
            id: 'budzet', title: 'Planujemy wydatki', minutes: 12,
            blocks: [{ type: 'read', text: 'Zanim coś kupisz, sprawdź:\n1. Ile mam pieniędzy?\n2. Ile kosztuje to, co chcę kupić (razem)?\n3. Czy wystarczy? Ile zostanie?\n\nOszczędzanie to odkładanie pieniędzy na później — np. do skarbonki.' }],
            practice: [gen('budget', {}, 4), write('Masz 50 zł na prezenty dla rodziny. Zaplanuj, co kupisz i ile to kosztuje. Czy coś zostanie?', ['Lista prezentów z cenami', 'Suma wydatków', 'Ile zostanie'], 25)],
          },
        ],
        quiz: { n: 9, items: [gen('coins', {}, 2), gen('moneyTotal', {}, 3), gen('moneyChange', { note: [1000, 2000] }, 2), gen('budget', {}, 2)] },
        challenge: [star(gen('moneyTotal', { items: 3 }, 1)), star(num('Zeszyt kosztuje 3,50 zł. Ile kosztuje 6 zeszytów? (w złotych)', 21, '6 · 3,50 zł = 21 zł (6 · 3 zł = 18 zł i 6 · 50 gr = 3 zł).'))],
      },
      {
        id: 'mierzenie', term: 2, strand: 'Pomiary', bridge: 'measurement',
        title: 'Mierzymy: długość, masa, pojemność',
        summary: 'Centymetry, metry, milimetry, kilometry; kilogramy, dekagramy, gramy; litry i mililitry.',
        lessons: [
          {
            id: 'dlugosc', title: 'Długość: mm, cm, m, km', minutes: 15,
            blocks: [
              { type: 'read', text: 'Długość mierzymy linijką, taśmą lub miarką.\n- **1 cm = 10 mm**\n- **1 m = 100 cm**\n- **1 km = 1000 m**\n\nMierząc linijką, zacznij od **zera**, a nie od brzegu linijki!' },
              { type: 'activity', text: 'Zmierz linijką: ołówek, książkę, swoją dłoń. Zapisz wyniki w centymetrach. Co jest najdłuższe?' },
            ],
            practice: [gen('convertLen', { kinds: ['m-cm', 'cm-m', 'cm-mm', 'km-m'] }, 4), gen('chooseUnit', {}, 2)],
          },
          {
            id: 'masa', title: 'Masa: kg, dag, g', minutes: 12,
            blocks: [{ type: 'read', text: 'Masę mierzymy na **wadze**.\n- **1 kg = 100 dag**\n- **1 dag = 10 g**\n- **1 kg = 1000 g**\n\nDekagramów (dag) używamy w sklepie: „poproszę 20 dag sera”.' }],
            practice: [gen('convertLen', { kinds: ['kg-dag', 'dag-g', 'kg-g'] }, 4), gen('chooseUnit', {}, 1), num('Pół kilograma to ile dekagramów?', 50, '1 kg = 100 dag, połowa to 50 dag.')],
          },
          {
            id: 'pojemnosc', title: 'Pojemność: l i ml', minutes: 12,
            blocks: [{ type: 'read', text: 'Pojemność to ile płynu mieści naczynie.\n- **1 l = 1000 ml**\n- pół litra = **500 ml**, ćwierć litra = **250 ml**\n\nNa kartonie mleka jest napisane „1 l”, a na małym soczku „200 ml”.' }],
            practice: [gen('convertLen', { kinds: ['L-mL', 'half-L'] }, 3), num('Ile szklanek po 250 ml napełnimy z 1 litra?', 4, '1000 ml : 250 ml = 4.'), gen('readScale', {}, 1)],
          },
          {
            id: 'temperatura', title: 'Temperatura i termometr', minutes: 10,
            blocks: [{ type: 'read', text: 'Temperaturę mierzymy **termometrem**, w **stopniach Celsjusza (°C)**.\n- Woda zamarza w **0 °C**\n- Woda wrze w **100 °C**\n- Zdrowy człowiek ma około **36,6 °C**\n\nZimą w Polsce bywa poniżej zera, np. **−5 °C** (minus pięć stopni).' }],
            practice: [num('W jakiej temperaturze zamarza woda? (°C)', 0, '0 °C.'), num('Rano było 4 °C, w południe 11 °C. O ile stopni się ociepliło?', 7, '11 − 4 = 7.'), mc('Co pokazuje −3 °C?', ['3 stopnie mrozu (poniżej zera)', '3 stopnie ciepła', '30 stopni', 'gorączkę'], 0, 'Minus oznacza temperaturę poniżej zera — mróz.')],
          },
        ],
        quiz: { n: 10, items: [gen('convertLen', { kinds: ['m-cm', 'cm-mm', 'kg-dag', 'dag-g', 'L-mL'] }, 5), gen('chooseUnit', {}, 3), gen('readScale', {}, 2)] },
        challenge: [star(gen('convertLen', { kinds: ['mixed'] }, 1)), star(num('Kot waży 4 kg 30 dag. Ile to dekagramów?', 430, '4 kg = 400 dag, plus 30 dag = 430 dag.'))],
      },
      {
        id: 'czas', term: 2, strand: 'Czas', bridge: 'time',
        title: 'Zegar, kalendarz i cyfry rzymskie',
        summary: 'Odczytujemy godziny, liczymy upływ czasu, poznajemy kalendarz i cyfry rzymskie I–XII.',
        lessons: [
          {
            id: 'zegar', title: 'Która godzina?', minutes: 15,
            blocks: [
              { type: 'read', text: 'Zegar ma dwie wskazówki:\n- **krótka** pokazuje **godziny**\n- **długa** pokazuje **minuty** (każda cyfra to 5 minut)\n\nDoba ma 24 godziny. Po południu mówimy np. **15:30** zamiast 3:30.\n- kwadrans po = :15, wpół do = :30, za kwadrans = :45' },
              { type: 'visual', svg: SVG.clock(7, 15) + '<p class="small">7:15 — kwadrans po siódmej</p>' },
            ],
            practice: [gen('readClock', { step: 5 }, 4), gen('clock24', {}, 2)],
          },
          {
            id: 'uplyw', title: 'Ile czasu minęło?', minutes: 12,
            blocks: [{ type: 'read', text: 'Liczymy od początku do końca, najlepiej „skokami” do pełnej godziny.\n\nOd **8:40** do **9:15**: do 9:00 → 20 minut, potem 15 minut. Razem **35 minut**.\n\n1 godzina = 60 minut, 1 minuta = 60 sekund, doba = 24 godziny.' }],
            practice: [gen('timeAfter', { maxMin: 45 }, 3), gen('duration', {}, 2), gen('timeUnits', {}, 2)],
          },
          {
            id: 'kalendarz', title: 'Kalendarz', minutes: 12,
            blocks: [{ type: 'read', text: 'Rok ma **12 miesięcy** i **365 dni** (przestępny 366).\n\nMiesiące: styczeń, luty, marzec, kwiecień, maj, czerwiec, lipiec, sierpień, wrzesień, październik, listopad, grudzień.\n\n> Policz na knykciach: miesiące „na knykciu” mają 31 dni, „w dołku” 30 (luty 28 lub 29).\n\nPory roku w Polsce: wiosna, lato, jesień, zima.' }],
            practice: [gen('calendar', {}, 5), gen('timeUnits', {}, 1)],
          },
          {
            id: 'rzymskie', title: 'Cyfry rzymskie', minutes: 12,
            blocks: [
              { type: 'read', text: 'Rzymianie zapisywali liczby literami:\n**I = 1, V = 5, X = 10**\n\nI, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII\n\nZasada: mniejsza cyfra **przed** większą — odejmujemy (IV = 5 − 1 = 4). **Po** większej — dodajemy (VI = 5 + 1 = 6).\n\nCyframi rzymskimi zapisujemy miesiące (np. 12 X 2026) i wieki.' },
            ],
            practice: [gen('roman', { max: 12 }, 6)],
          },
        ],
        quiz: { n: 10, items: [gen('readClock', {}, 3), gen('timeAfter', {}, 2), gen('calendar', {}, 2), gen('roman', { max: 12 }, 3)] },
        challenge: [star(gen('roman', { max: 39 }, 2)), star(num('Film trwał 1 godzinę 25 minut. Ile to minut?', 85, '60 + 25 = 85 minut.'))],
      },
      {
        id: 'figury', term: 2, strand: 'Geometria', bridge: 'shapes',
        title: 'Figury geometryczne i obwód',
        summary: 'Trójkąty, kwadraty, prostokąty, koła; obliczamy obwód; rysujemy figury symetryczne.',
        lessons: [
          {
            id: 'figury-plaskie', title: 'Figury płaskie', minutes: 12,
            blocks: [
              { type: 'read', text: '- **Trójkąt** — 3 boki, 3 wierzchołki\n- **Kwadrat** — 4 równe boki, 4 kąty proste\n- **Prostokąt** — 4 boki (przeciwległe równe), 4 kąty proste\n- **Koło** — nie ma boków ani wierzchołków\n\nKwadrat to szczególny prostokąt — ma wszystkie boki równe!' },
              { type: 'vocab', words: [['bok', 'odcinek tworzący figurę', 'side'], ['wierzchołek', 'punkt, gdzie spotykają się boki', 'vertex'], ['kąt prosty', 'kąt jak róg kartki', 'right angle']] },
            ],
            practice: [gen('shape2d', {}, 4), pf('Każdy kwadrat jest prostokątem.', true, 'Kwadrat ma 4 kąty proste i przeciwległe boki równe — jest prostokątem z równymi bokami.')],
          },
          {
            id: 'obwod', title: 'Obwód figury', minutes: 15,
            blocks: [{ type: 'read', text: '**Obwód** to suma długości wszystkich boków — tyle, ile mrówka przejdzie dookoła figury.\n\nProstokąt 5 cm × 3 cm: 5 + 3 + 5 + 3 = **16 cm**.\nKwadrat o boku 4 cm: 4 + 4 + 4 + 4 = **16 cm** (albo 4 · 4).' }],
            practice: [gen('perimeter', { max: 10 }, 5), num('Trójkąt ma boki 3 cm, 4 cm i 5 cm. Jaki ma obwód? (cm)', 12, '3 + 4 + 5 = 12 cm.')],
          },
          {
            id: 'symetria', title: 'Symetria', minutes: 12,
            blocks: [
              { type: 'read', text: 'Figura jest **symetryczna**, gdy po złożeniu na pół obie części dokładnie się pokrywają. Linia złożenia to **oś symetrii**.\n\nSymetryczne są np. motyl, liść, litera A, serce.' },
              { type: 'activity', text: 'Złóż kartkę na pół, narysuj przy zgięciu połowę serca, wytnij i rozłóż. Masz figurę symetryczną!' },
            ],
            practice: [gen('symmetry', {}, 4)],
          },
          {
            id: 'bryly', title: 'Bryły', minutes: 12,
            blocks: [{ type: 'read', text: 'Bryły są „przestrzenne” — można je wziąć do ręki:\n- **sześcian** (kostka do gry) — 6 ścian kwadratowych\n- **prostopadłościan** (pudełko) — 6 ścian\n- **walec** (puszka), **stożek** (lejek, rożek), **kula** (piłka)' }],
            practice: [gen('shape3d', {}, 5)],
          },
        ],
        quiz: { n: 10, items: [gen('shape2d', {}, 3), gen('perimeter', { max: 10 }, 3), gen('symmetry', {}, 2), gen('shape3d', {}, 2)] },
        challenge: [star(num('Obwód kwadratu to 36 cm. Jaką długość ma jego bok? (cm)', 9, '36 : 4 = 9 cm.')), star(num('Prostokąt ma obwód 20 cm, a jeden bok 6 cm. Ile ma drugi bok? (cm)', 4, '20 − 6 − 6 = 8, a 8 : 2 = 4 cm.')), star(gen('areaRect', { max: 8 }, 1))],
      },
      {
        id: 'dane-zadania', term: 2, strand: 'Zadania i dane', bridge: 'data',
        title: 'Diagramy, tabele i łamigłówki',
        summary: 'Odczytujemy diagramy i tabele, rozwiązujemy zadania dwudziałaniowe i łamigłówki.',
        lessons: [
          {
            id: 'diagramy', title: 'Diagramy słupkowe i tabele', minutes: 12,
            blocks: [
              { type: 'read', text: '**Diagram słupkowy** pokazuje liczby słupkami. Ma **tytuł**, **podpisy** i **skalę**.\n\nNajwyższy słupek = najwięcej. Możesz pytać: o ile więcej? ile razem?' },
              { type: 'visual', svg: SVG.bars(['Pies', 'Kot', 'Rybka', 'Chomik'], [7, 5, 2, 3], 'Zwierzęta w naszej klasie') },
            ],
            practice: [gen('readGraph', {}, 4), gen('tally', {}, 1)],
          },
          {
            id: 'dwudzialaniowe', title: 'Zadania dwudziałaniowe', minutes: 15,
            blocks: [{ type: 'read', text: 'Niektóre zadania mają **dwa kroki**.\n\nKasia kupiła 3 zeszyty po 4 zł i zapłaciła 20 zł. Ile reszty dostała?\n1. 3 · 4 = 12 zł (koszt)\n2. 20 − 12 = **8 zł** (reszta)\n\nZapisz oba działania i odpowiedź.' }],
            practice: [gen('twoStep', {}, 3), gen('mulWord', {}, 1), num('Na 4 półkach stało po 9 książek. Zabrano 7. Ile książek zostało?', 29, '4 · 9 = 36, 36 − 7 = 29.')],
          },
          {
            id: 'lamiglowki', title: 'Łamigłówki i logiczne myślenie', minutes: 12,
            blocks: [{ type: 'read', text: 'Łamigłówki ćwiczą myślenie:\n- **Kwadraty magiczne**: suma w każdym wierszu, kolumnie i po przekątnej jest taka sama.\n- **Ciągi**: znajdź regułę.\n- **Zgadnij liczbę**: „Pomyślałam liczbę, dodałam 7 i wyszło 20” → 20 − 7 = 13.' }],
            practice: [gen('pattern', { maxStep: 9, mult: true }, 2), num('Pomyślałam liczbę, pomnożyłam przez 3 i wyszło 27. Jaka to liczba?', 9, 'Odwracamy: 27 : 3 = 9.'), mc('Co pasuje dalej? 2, 4, 8, 16, …', ['32', '18', '20', '24'], 0, 'Każda liczba jest 2 razy większa: 16 · 2 = 32.'), gen('chance', {}, 1)],
          },
        ],
        quiz: { n: 8, items: [gen('readGraph', {}, 4), gen('twoStep', {}, 2), gen('pattern', { mult: true }, 2)] },
        challenge: [star(num('W kwadracie magicznym suma każdego wiersza to 15. Wiersz ma liczby 8, ☐, 6. Jaka liczba jest w okienku?', 1, '15 − 8 − 6 = 1.')), star(num('Tata jest 4 razy starszy od Kasi, która ma 9 lat. Ile lat ma tata?', 36, '9 · 4 = 36.'))],
      },
    ],
  });
})();

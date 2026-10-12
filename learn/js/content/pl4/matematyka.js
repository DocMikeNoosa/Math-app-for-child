/* Klasa 4 — matematyka (podstawa programowa, II etap edukacyjny). Zadania z gwiazdką wykraczają nieco ponad poziom klasy. */
(function () {
  const { mc, pf, num, inp, gen, write, star } = LA.Q;
  const SVG = LA.SVG;

  LA.addSubject('pl4', {
    id: 'matematyka',
    intro: 'Liczby wielocyfrowe, działania pisemne, kolejność działań i potęgi, ułamki zwykłe i dziesiętne, proste i kąty, wielokąty, obwody i pola, jednostki, prostopadłościany, dane i zadania tekstowe.',
    chapters: [
      {
        id: 'liczby', term: 1, strand: 'Liczby naturalne', bridge: 'place-value',
        title: 'Liczby naturalne',
        summary: 'Dziesiątkowy system pozycyjny, liczby wielocyfrowe, oś liczbowa, porównywanie, zaokrąglanie, system rzymski.',
        outcomes: ['Czytam i zapisuję liczby do miliona i dalej', 'Zaznaczam liczby na osi liczbowej', 'Zaokrąglam liczby', 'Zapisuję liczby w systemie rzymskim'],
        lessons: [
          {
            id: 'system', title: 'System dziesiątkowy', minutes: 15,
            blocks: [
              { type: 'read', text: 'Używamy **dziesięciu cyfr**: 0, 1, 2, …, 9. Wartość cyfry zależy od **miejsca** (pozycji) — to **system pozycyjny**.\n\nRzędy: jedności, dziesiątki, setki, **tysiące**, dziesiątki tysięcy, setki tysięcy, **miliony**.\n\nW liczbie **352 718**: 3 → setki tysięcy (300 000), 5 → dziesiątki tysięcy (50 000), 2 → tysiące (2000), 7 → setki, 1 → dziesiątki, 8 → jedności.\n\nDuże liczby zapisujemy w grupach po trzy cyfry, z odstępem: **1 250 000**.' },
              { type: 'vocab', words: [['system pozycyjny', 'wartość cyfry zależy od miejsca', 'place value system'], ['rząd', 'miejsce cyfry: jedności, dziesiątki…', 'place'], ['milion', '1 000 000', 'million']] },
            ],
            practice: [gen('placeValue', { min: 10000, max: 999999 }, 4), gen('expanded', { min: 1000, max: 99999 }, 2), num('Ile tysięcy jest w liczbie 47 300? (wszystkich tysięcy)', 47, '47 300 = 47 tysięcy i 300.')],
          },
          {
            id: 'czytanie', title: 'Czytamy i zapisujemy duże liczby', minutes: 12,
            blocks: [{ type: 'read', text: '„dwadzieścia trzy tysiące czterdzieści” → 23 **0**40 — pamiętaj o zerach!\n\nCzytamy grupami: **23** tysiące **040**.\n\n1 000 000 — milion. 1 000 000 000 — **miliard**.' }],
            practice: [gen('wordsToNum', { min: 10000, max: 99999 }, 3), gen('numToWords', { min: 10000, max: 99999 }, 3)],
          },
          {
            id: 'os', title: 'Oś liczbowa i porównywanie', minutes: 12,
            blocks: [
              { type: 'read', text: 'Na **osi liczbowej** liczby rosną w prawo. Ważna jest **jednostka** (odległość między kreskami).\n\nPorównujemy: najpierw **liczba cyfr** (więcej cyfr = większa liczba), potem cyfry od najwyższego rzędu.\n\n45 892 < 45 928, bo setki: 8 < 9.' },
              { type: 'visual', svg: SVG.numberLine(0, 100, 10, 70, 2, 'pl') },
            ],
            practice: [gen('compare', { min: 10000, max: 999999 }, 3), gen('largest', { min: 10000, max: 99999 }, 2), mc('Na osi jedna kratka to 50. Strzałka jest 3 kratki za zerem. Jaka to liczba?', ['53', '150', '350', '3'], 1, '3 · 50 = 150.')],
          },
          {
            id: 'zaokraglanie', title: 'Zaokrąglanie', minutes: 12,
            blocks: [{ type: 'read', text: 'Zaokrąglamy, patrząc na **cyfrę na prawo** od rzędu, do którego zaokrąglamy:\n- **0, 1, 2, 3, 4** → w dół\n- **5, 6, 7, 8, 9** → w górę\n\n4 **7**38 do tysięcy → 5000 (bo 7 ≥ 5)\n4 **3**38 do tysięcy → 4000\n\nZapis: 4738 ≈ 5000 (≈ czytamy „w przybliżeniu”).' }],
            practice: [gen('round', { to: 10, min: 100, max: 9999 }, 2), gen('round', { to: 100, min: 1000, max: 99999 }, 2), gen('round', { to: 1000, min: 1000, max: 99999 }, 2)],
          },
          {
            id: 'rzymskie', title: 'System rzymski', minutes: 15,
            blocks: [{ type: 'read', text: 'Znaki rzymskie: **I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000**.\n\nZasady:\n- znaki dodajemy: XII = 10 + 1 + 1 = 12\n- mniejszy przed większym — odejmujemy: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900\n- ten sam znak najwyżej **3 razy** z rzędu: III, XXX (ale nie IIII)\n\nMMXXVI = 2026. Rzymskich liczb używamy do zapisu **wieków** (XXI wiek), miesięcy w datach i na zegarach.' }],
            practice: [gen('roman', { max: 100 }, 4), mc('Jak zapisać 2026 cyframi rzymskimi?', ['MMXXVI', 'MMXXIV', 'MMXVI', 'MCMXXVI'], 0, 'MM = 2000, XX = 20, VI = 6.'), num('Ile to MCMXC?', 1990, 'M = 1000, CM = 900, XC = 90.')],
          },
        ],
        quiz: { n: 10, items: [gen('placeValue', { min: 10000, max: 999999 }, 2), gen('wordsToNum', { min: 10000, max: 99999 }, 2), gen('compare', { min: 10000, max: 999999 }, 2), gen('round', { to: 1000, min: 1000, max: 99999 }, 2), gen('roman', { max: 100 }, 2)] },
        challenge: [star(num('Ile jest liczb czterocyfrowych?', 9000, 'Od 1000 do 9999: 9999 − 1000 + 1 = 9000.')), star(num('Zapisz cyframi arabskimi: MMCDXLIV', 2444, 'MM 2000 + CD 400 + XL 40 + IV 4.')), star(num('Najmniejsza liczba pięciocyfrowa o różnych cyfrach to…', 10234, '1, potem 0, 2, 3, 4.'))],
      },
      {
        id: 'dodawanie4', term: 1, strand: 'Działania', bridge: 'add-sub',
        title: 'Dodawanie i odejmowanie',
        summary: 'W pamięci i pisemnie, z przekraczaniem progów; sprawdzanie wyników; szacowanie; zadania tekstowe.',
        lessons: [
          {
            id: 'pamiec', title: 'Rachunki w pamięci', minutes: 12,
            blocks: [{ type: 'read', text: 'Sprytne liczenie:\n- 398 + 245 → 400 + 245 − 2 = **643**\n- 1000 − 367 → dopełnij do 1000: 367 + 33 = 400, + 600 = 1000 → **633**\n- 2500 + 3700 → 25 setek + 37 setek = 62 setki = **6200**\n\n**Składniki** dodajemy, wynik to **suma**. Przy odejmowaniu: **odjemna − odjemnik = różnica**.' }, { type: 'vocab', words: [['suma', 'wynik dodawania', 'sum'], ['różnica', 'wynik odejmowania', 'difference'], ['składnik', 'liczba, którą dodajemy', 'addend']] }],
            practice: [gen('add', { digits: 3 }, 2), gen('sub', { digits: 3 }, 2), num('1000 − 367 = ?', 633, 'Doliczanie: 367 → 400 (33) → 1000 (600). Razem 633.'), num('2500 + 3700 = ?', 6200, '25 setek + 37 setek = 62 setki.')],
          },
          {
            id: 'pisemne4', title: 'Dodawanie i odejmowanie pisemne', minutes: 15,
            blocks: [{ type: 'read', text: '**Dodawanie pisemne** — cyfry tego samego rzędu pod sobą; dodajemy od jedności; przenosimy „1” do wyższego rzędu.\n\n**Odejmowanie pisemne** — gdy górna cyfra jest za mała, **pożyczamy** 1 z wyższego rzędu (to 10 w niższym).\n\n  5 0 0 3\n− 2 7 4 8\n= 2 2 5 5\n\nSprawdzenie: 2255 + 2748 = 5003 ✔' }],
            practice: [gen('add', { digits: 4 }, 3), gen('sub', { digits: 4 }, 3)],
          },
          {
            id: 'szacowanie', title: 'Szacowanie i sprawdzanie', minutes: 12,
            blocks: [{ type: 'read', text: 'Przed liczeniem **oszacuj** wynik (zaokrąglij liczby). Po liczeniu **sprawdź**: czy wynik jest blisko szacunku? Odejmowanie sprawdzamy dodawaniem.\n\n4895 + 3112 ≈ 4900 + 3100 = 8000. Wynik 8007 — pasuje!' }],
            practice: [gen('estimate', {}, 3), gen('missing', { max: 1000 }, 3)],
          },
          {
            id: 'zadania4', title: 'Zadania tekstowe: o ile więcej, o ile mniej', minutes: 15,
            blocks: [{ type: 'read', text: '- **O ile więcej / mniej?** → odejmowanie (różnica)\n- **o 25 więcej** → dodaj 25\n- **o 25 mniej** → odejmij 25\n\nZadanie: Tatry mają szczyt Rysy (2499 m), a Śnieżka ma 1603 m. **O ile** Rysy są wyższe? 2499 − 1603 = **896 m**.' }],
            practice: [gen('addWord', { max: 9999 }, 4), num('Bilet do zoo kosztuje 28 zł, a do kina o 9 zł więcej. Ile kosztuje bilet do kina?', 37, '28 + 9 = 37 zł.')],
          },
        ],
        quiz: { n: 10, items: [gen('add', { digits: 4 }, 3), gen('sub', { digits: 4 }, 3), gen('missing', { max: 1000 }, 2), gen('addWord', { max: 9999 }, 2)] },
        challenge: [star(num('Suma dwóch liczb to 1000. Jedna jest o 200 większa od drugiej. Jaka jest większa liczba?', 600, '(1000 + 200) : 2 = 600, druga 400.')), star(num('Od jakiej liczby trzeba odjąć 3478, żeby otrzymać 5609?', 9087, '5609 + 3478 = 9087.'))],
      },
      {
        id: 'mnozenie4', term: 1, strand: 'Działania', bridge: 'mul-div',
        title: 'Mnożenie i dzielenie',
        summary: 'Tabliczka mnożenia, mnożenie i dzielenie przez 10, 100, 1000, pisemne mnożenie przez liczbę jednocyfrową, dzielenie z resztą.',
        lessons: [
          {
            id: 'tabliczka4', title: 'Tabliczka mnożenia — powtórka', minutes: 12,
            blocks: [{ type: 'read', text: 'Tabliczka mnożenia musi być **automatyczna**! Najtrudniejsze: 6 · 7 = 42, 7 · 8 = 56, 6 · 8 = 48, 7 · 7 = 49, 8 · 8 = 64, 9 · 7 = 63.\n\n**Czynnik · czynnik = iloczyn**, **dzielna : dzielnik = iloraz**.' }, { type: 'vocab', words: [['iloczyn', 'wynik mnożenia', 'product'], ['iloraz', 'wynik dzielenia', 'quotient'], ['dzielna', 'liczba, którą dzielimy', 'dividend'], ['dzielnik', 'liczba, przez którą dzielimy', 'divisor']] }],
            practice: [gen('mulFact', { tables: [6, 7, 8, 9] }, 4), gen('divFact', { tables: [6, 7, 8, 9] }, 4)],
          },
          {
            id: 'przez10', title: 'Mnożenie i dzielenie przez 10, 100, 1000', minutes: 12,
            blocks: [{ type: 'read', text: '- **· 10** → dopisz 1 zero: 37 · 10 = 370\n- **· 100** → 2 zera: 37 · 100 = 3700\n- **: 10** → skreśl 1 zero: 4500 : 10 = 450\n- **: 100** → skreśl 2 zera: 4500 : 100 = 45\n\nMnożenie pełnych dziesiątek: 40 · 30 → 4 · 3 = 12, dopisz 2 zera → **1200**.' }],
            practice: [gen('mulBy10', { maxN: 999, ks: [10, 100, 1000] }, 4), num('40 · 30 = ?', 1200, '4 · 3 = 12 i dwa zera.'), num('5600 : 100 = ?', 56, 'Skreślamy dwa zera.'), num('700 · 80 = ?', 56000, '7 · 8 = 56 i trzy zera.')],
          },
          {
            id: 'pisemne-mnozenie', title: 'Mnożenie pisemne', minutes: 15,
            blocks: [{ type: 'read', text: '**347 · 6**\n1. 7 · 6 = 42 → piszemy 2, zapamiętujemy 4\n2. 4 · 6 = 24, + 4 = 28 → piszemy 8, zapamiętujemy 2\n3. 3 · 6 = 18, + 2 = 20 → piszemy 20\n\nWynik: **2082**. Szacunek: 350 · 6 = 2100 ✔' }],
            practice: [gen('mul2by1', { maxA: 999, maxB: 9 }, 5), gen('mulWord', { tables: [6, 7, 8, 9] }, 2)],
          },
          {
            id: 'reszta4', title: 'Dzielenie z resztą', minutes: 12,
            blocks: [{ type: 'read', text: '**47 : 5 = 9 r 2**, bo 5 · 9 = 45, a 47 − 45 = 2.\n\nReszta jest zawsze **mniejsza od dzielnika**!\n\nSprawdzenie: 9 · 5 + 2 = 47 ✔\n\nW zadaniach myśl, co zrobić z resztą: 47 osób, auta po 5 miejsc — potrzeba **10 aut** (9 pełnych i jedno dla 2 osób).' }],
            practice: [gen('divRem', { maxDiv: 9, maxQ: 30, rem: true }, 4), num('47 dzieci jedzie autami po 5 miejsc. Ile aut potrzeba?', 10, '47 : 5 = 9 r 2 — potrzeba jeszcze jednego auta: 10.')],
          },
          {
            id: 'dzielenie-pisemne', title: '★ Dzielenie pisemne przez liczbę jednocyfrową', minutes: 15,
            blocks: [{ type: 'read', text: '**756 : 3**\n1. 7 : 3 = 2 r 1 → piszemy 2, reszta 1 dołącza do 5 → 15\n2. 15 : 3 = 5 → piszemy 5\n3. 6 : 3 = 2 → piszemy 2\n\nWynik: **252**. Sprawdzenie: 252 · 3 = 756 ✔' }],
            practice: [gen('divRem', { maxDiv: 9, maxQ: 150 }, 4)],
          },
        ],
        quiz: { n: 10, items: [gen('mulFact', { tables: [6, 7, 8, 9] }, 2), gen('mulBy10', { maxN: 999, ks: [10, 100, 1000] }, 2), gen('mul2by1', { maxA: 999, maxB: 9 }, 3), gen('divRem', { maxDiv: 9, maxQ: 30, rem: true }, 3)] },
        challenge: [star(num('Iloczyn liczb 25 i 4 pomnożony przez 37 to…', 3700, '25 · 4 = 100, 100 · 37 = 3700. Sprytnie!')), star(num('Jaka jest największa możliwa reszta przy dzieleniu przez 8?', 7, 'Reszta musi być mniejsza od dzielnika.')), star(num('Ile to 125 · 8?', 1000, '125 · 8 = 1000 — warto zapamiętać.'))],
      },
      {
        id: 'kolejnosc', term: 1, strand: 'Działania', bridge: 'order-of-operations',
        title: 'Kolejność działań i potęgi',
        summary: 'Kolejność wykonywania działań, nawiasy, kwadrat i sześcian liczby, zadania wielodziałaniowe.',
        lessons: [
          {
            id: 'kolejnosc-dzialan', title: 'Kolejność działań', minutes: 15,
            blocks: [{ type: 'read', text: 'Kolejność:\n1. działania w **nawiasach**\n2. **potęgowanie**\n3. **mnożenie i dzielenie** (od lewej do prawej)\n4. **dodawanie i odejmowanie** (od lewej do prawej)\n\n5 + 3 · 4 = 5 + 12 = **17** (nie 32!)\n(5 + 3) · 4 = 8 · 4 = **32**' }],
            practice: [gen('orderOps', {}, 6)],
          },
          {
            id: 'potegi', title: 'Kwadrat i sześcian liczby', minutes: 12,
            blocks: [{ type: 'read', text: '**Kwadrat** liczby: 5² = 5 · 5 = 25 (czytamy „pięć do kwadratu”).\n**Sześcian** liczby: 2³ = 2 · 2 · 2 = 8 („dwa do sześcianu”).\n\nNazwy pochodzą od figur: pole kwadratu o boku 5 to 5² = 25, a sześcian o krawędzi 2 składa się z 2³ = 8 kostek.' }],
            practice: [gen('power', {}, 6), num('10² = ?', 100, '10 · 10 = 100.')],
          },
          {
            id: 'wielodzialaniowe', title: 'Zadania wielodziałaniowe', minutes: 15,
            blocks: [{ type: 'read', text: 'W zadaniach z kilkoma krokami zapisz **plan**:\n\nKupiono 3 zeszyty po 4 zł i długopis za 6 zł. Zapłacono banknotem 50 zł. Ile reszty?\n1. 3 · 4 = 12 zł (zeszyty)\n2. 12 + 6 = 18 zł (razem)\n3. 50 − 18 = **32 zł** reszty\n\nJednym wyrażeniem: 50 − (3 · 4 + 6) = 32.' }],
            practice: [gen('twoStep', {}, 3), num('Kupiono 3 zeszyty po 4 zł i długopis za 6 zł. Ile reszty z 50 zł?', 32, '50 − (3 · 4 + 6) = 32.'), num('Bilet ulgowy kosztuje 12 zł, a normalny 20 zł. Ile zapłaci rodzina: 2 dorosłych i 3 dzieci?', 76, '2 · 20 + 3 · 12 = 40 + 36 = 76.')],
          },
        ],
        quiz: { n: 10, items: [gen('orderOps', {}, 5), gen('power', {}, 3), gen('twoStep', {}, 2)] },
        challenge: [star(gen('orderOps', { hard: true }, 2)), star(num('Oblicz: 2³ + 3² · 2', 26, '8 + 9 · 2 = 8 + 18 = 26.')), star(num('Wstaw liczbę: (… + 4) · 3 = 30', 6, '30 : 3 = 10, 10 − 4 = 6.'))],
      },
      {
        id: 'ulamki4', term: 1, strand: 'Ułamki', bridge: 'fractions',
        title: 'Ułamki zwykłe',
        summary: 'Licznik i mianownik, ułamek jako część całości i jako iloraz, liczby mieszane, porównywanie, rozszerzanie i skracanie, dodawanie i odejmowanie o tych samych mianownikach.',
        lessons: [
          {
            id: 'czesc', title: 'Ułamek jako część całości', minutes: 12,
            blocks: [{ type: 'read', text: 'W ułamku **3/4**: **mianownik** (4) mówi, na ile równych części podzielono całość, **licznik** (3) — ile części wzięto. Kreska ułamkowa zastępuje znak dzielenia: 3/4 = 3 : 4.' }, { type: 'visual', svg: SVG.fractionBar(4, 3) }, { type: 'vocab', words: [['licznik', 'liczba nad kreską', 'numerator'], ['mianownik', 'liczba pod kreską', 'denominator'], ['kreska ułamkowa', 'zastępuje dzielenie', 'fraction bar']] }],
            practice: [gen('unitFraction', { dens: [2, 3, 4, 5, 6, 8] }, 3), gen('fractionOf', { dens: [2, 3, 4, 5, 10], nonUnit: true }, 3)],
          },
          {
            id: 'mieszane', title: 'Liczby mieszane', minutes: 12,
            blocks: [{ type: 'read', text: '**Liczba mieszana** = całości + ułamek: 2 1/3 (dwie i jedna trzecia).\n\nUłamek **niewłaściwy** ma licznik ≥ mianownika: 7/3. Zamiana: 7 : 3 = 2 r 1 → **2 1/3**.' }],
            practice: [gen('mixedNumeral', { dens: [2, 3, 4, 5] }, 4), gen('fractionWhole', { dens: [2, 3, 4, 5, 8] }, 2)],
          },
          {
            id: 'porownywanie-ul', title: 'Porównywanie, rozszerzanie i skracanie', minutes: 15,
            blocks: [{ type: 'read', text: '- Te same mianowniki: większy licznik → większy ułamek: 5/8 > 3/8\n- Te same liczniki: mniejszy mianownik → większy ułamek: 1/3 > 1/5\n\n**Rozszerzanie**: mnożymy licznik i mianownik przez tę samą liczbę: 1/2 = 2/4 = 4/8.\n**Skracanie**: dzielimy przez tę samą liczbę: 6/9 = 2/3.' }],
            practice: [gen('fractionCompare', {}, 3), gen('equivFraction', {}, 3)],
          },
          {
            id: 'dodawanie-ul', title: 'Dodawanie i odejmowanie ułamków', minutes: 12,
            blocks: [{ type: 'read', text: 'Gdy mianowniki są **takie same**, dodajemy (odejmujemy) **tylko liczniki**:\n2/7 + 3/7 = **5/7**\n5/9 − 1/9 = **4/9**\n\nMianownik się **nie zmienia**!' }],
            practice: [inp('2/7 + 3/7 = ? (zapisz jako ułamek, np. 1/2)', ['5/7'], 'Liczniki: 2 + 3 = 5, mianownik zostaje 7.', { check: 'fraction' }), inp('5/9 − 1/9 = ?', ['4/9'], '5 − 1 = 4.', { check: 'fraction' }), inp('3/8 + 4/8 = ?', ['7/8'], '3 + 4 = 7.', { check: 'fraction' }), inp('1 − 2/5 = ?', ['3/5'], '1 = 5/5; 5/5 − 2/5 = 3/5.', { check: 'fraction' }), gen('fractionLine', { dens: [4, 5, 8, 10] }, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('fractionOf', { dens: [2, 3, 4, 5, 10], nonUnit: true }, 2), gen('mixedNumeral', { dens: [2, 3, 4, 5] }, 2), gen('fractionCompare', {}, 2), gen('equivFraction', {}, 2), inp('4/11 + 5/11 = ?', ['9/11'], '4 + 5 = 9.', { check: 'fraction' })] },
        challenge: [star(inp('2 3/5 + 1 4/5 = ? (liczba mieszana, np. 4 2/5)', ['4 2/5', '22/5'], '3 całości + 7/5 = 3 + 1 2/5 = 4 2/5.', { check: 'fraction' })), star(num('3/4 godziny to ile minut?', 45, '1/4 godziny = 15 min, 3 · 15 = 45.')), star(num('2/3 z 27 uczniów to ilu uczniów?', 18, '27 : 3 = 9, 9 · 2 = 18.'))],
      },
      {
        id: 'dziesietne', term: 2, strand: 'Ułamki', bridge: 'money',
        title: 'Ułamki dziesiętne',
        summary: 'Zapis dziesiętny, części dziesiąte i setne, porównywanie, dodawanie i odejmowanie, wyrażenia dwumianowane (zł i gr, m i cm).',
        lessons: [
          {
            id: 'zapis', title: 'Zapis dziesiętny', minutes: 12,
            blocks: [{ type: 'read', text: '1/10 = **0,1** (jedna dziesiąta), 1/100 = **0,01** (jedna setna).\n\nW liczbie **3,47**: 3 całości, 4 dziesiąte, 7 setnych.\n\nW Polsce piszemy **przecinek**: 3,47. (W Australii i po angielsku — kropkę: 3.47!)' }, { type: 'tip', text: 'To ważna różnica między programami: w części australijskiej Tosia pisze 3.47, a w polskiej 3,47.' }],
            practice: [gen('decimalTenths', {}, 3), gen('decimalHundredths', {}, 3)],
          },
          {
            id: 'porownywanie-dz', title: 'Porównywanie ułamków dziesiętnych', minutes: 12,
            blocks: [{ type: 'read', text: 'Wyrównaj liczbę cyfr po przecinku, dopisując zera: 0,5 i 0,47 → **0,50** i 0,47 → 0,50 > 0,47.\n\nZera na końcu nie zmieniają wartości: 2,3 = 2,30 = 2,300.' }],
            practice: [gen('decimalCompare', {}, 5)],
          },
          {
            id: 'dzialania-dz', title: 'Dodawanie i odejmowanie', minutes: 15,
            blocks: [{ type: 'read', text: 'Piszemy **przecinek pod przecinkiem** i liczymy jak liczby naturalne:\n\n  12,75\n+  3,50\n= 16,25' }],
            practice: [gen('decimalAdd', {}, 5)],
          },
          {
            id: 'dwumianowane', title: 'Złote i grosze, metry i centymetry', minutes: 12,
            blocks: [{ type: 'read', text: '1 zł = 100 gr → 3 zł 45 gr = **3,45 zł**; 5 gr = **0,05 zł**\n1 m = 100 cm → 2 m 7 cm = **2,07 m**\n1 kg = 1000 g → 1 kg 250 g = **1,25 kg** (★)' }],
            practice: [gen('moneyTotal', {}, 2), gen('moneyChange', {}, 2), num('Zapisz w złotych: 7 zł 5 gr (np. 7,05)', 7.05, '5 gr to 0,05 zł.'), num('Zapisz w metrach: 3 m 40 cm', 3.4, '40 cm = 0,40 m.')],
          },
        ],
        quiz: { n: 10, items: [gen('decimalTenths', {}, 2), gen('decimalCompare', {}, 3), gen('decimalAdd', {}, 3), gen('moneyChange', {}, 2)] },
        challenge: [star(num('Ile to 0,25 + 0,75 + 1,5?', 2.5, '0,25 + 0,75 = 1, + 1,5 = 2,5.')), star(num('Zapisz w kilogramach: 2 kg 50 g', 2.05, '50 g = 0,050 kg.'))],
      },
      {
        id: 'proste', term: 2, strand: 'Geometria', bridge: 'shapes',
        title: 'Proste, odcinki i kąty',
        summary: 'Prosta, półprosta, odcinek; proste prostopadłe i równoległe; rodzaje kątów; mierzenie kątów kątomierzem.',
        lessons: [
          {
            id: 'prosta', title: 'Prosta, półprosta, odcinek', minutes: 12,
            blocks: [{ type: 'read', text: '- **Prosta** — nie ma początku ani końca\n- **Półprosta** — ma początek, nie ma końca\n- **Odcinek** — ma dwa końce; możemy zmierzyć jego **długość**\n\nOdcinek AB zapisujemy |AB| = 5 cm.' }, { type: 'vocab', words: [['prosta', 'linia bez końców', 'line'], ['półprosta', 'linia z jednym początkiem', 'ray'], ['odcinek', 'część prostej z dwoma końcami', 'line segment']] }],
            practice: [mc('Co ma dwa końce?', ['prosta', 'półprosta', 'odcinek'], 2, 'Odcinek.', { fixed: true }), mc('Co ma początek, ale nie ma końca?', ['prosta', 'półprosta', 'odcinek'], 1, 'Półprosta.', { fixed: true }), num('Ile odcinków wyznaczają 3 punkty A, B, C, które nie leżą na jednej prostej?', 3, 'AB, BC, AC.')],
          },
          {
            id: 'prostopadle', title: 'Proste prostopadłe i równoległe', minutes: 12,
            blocks: [{ type: 'read', text: '**Prostopadłe** (⊥) — przecinają się pod **kątem prostym** (90°): jak krawędzie zeszytu.\n**Równoległe** (∥) — nigdy się nie przecinają: jak tory kolejowe.' }],
            practice: [mc('Tory kolejowe to przykład prostych…', ['równoległych', 'prostopadłych'], 0, 'Nigdy się nie przecinają.', { fixed: true }), mc('Pod jakim kątem przecinają się proste prostopadłe?', ['45°', '90°', '180°'], 1, '90°, kąt prosty.', { fixed: true }), mc('Znak ⊥ oznacza…', ['prostopadłość', 'równoległość', 'równość'], 0, 'Prostopadłość.', { fixed: true })],
          },
          {
            id: 'katy', title: 'Rodzaje kątów i kątomierz', minutes: 15,
            blocks: [{ type: 'read', text: '- **ostry**: mniejszy niż 90°\n- **prosty**: 90°\n- **rozwarty**: między 90° a 180°\n- **półpełny**: 180°\n- **pełny**: 360°\n\n**Kątomierz**: środek na wierzchołku kąta, linia 0° na ramieniu; odczytujemy na skali zaczynającej się od 0.' }],
            practice: [gen('angleCompare', {}, 3), mc('Kąt 120° to kąt…', ['ostry', 'prosty', 'rozwarty'], 2, 'Między 90° a 180°.', { fixed: true }), mc('Kąt 35° to kąt…', ['ostry', 'prosty', 'rozwarty'], 0, 'Mniej niż 90°.', { fixed: true }), num('Ile stopni ma kąt półpełny?', 180, '180°.')],
          },
        ],
        quiz: { n: 8, items: [gen('angleCompare', {}, 2), mc('Kąt pełny ma…', ['90°', '180°', '360°'], 2, '360°.', { fixed: true }), mc('Prosta nie ma…', ['początku ani końca', 'długości', 'punktów'], 0, 'Ani początku, ani końca.', { fixed: true }), mc('Kąt 90° to kąt…', ['prosty', 'ostry', 'rozwarty'], 0, 'Prosty.', { fixed: true })] },
        challenge: [star(num('Wskazówki zegara o 3:00 tworzą kąt prosty. Jaki kąt tworzą o 6:00?', 180, 'Półpełny — 180°.')), star(num('Ile stopni ma kąt między wskazówkami o 1:00?', 30, '360° : 12 = 30°.'))],
      },
      {
        id: 'wielokaty', term: 2, strand: 'Geometria', bridge: 'measurement',
        title: 'Wielokąty, obwody i pola',
        summary: 'Prostokąt i kwadrat, trójkąty, koło i okrąg; obwód; pole w centymetrach kwadratowych.',
        lessons: [
          {
            id: 'prostokat', title: 'Prostokąt i kwadrat', minutes: 12,
            blocks: [{ type: 'read', text: '**Prostokąt** ma 4 kąty proste, przeciwległe boki równe i równoległe.\n**Kwadrat** to prostokąt o wszystkich bokach równych.\n\n**Przekątna** łączy przeciwległe wierzchołki. Prostokąt ma 2 przekątne.' }],
            practice: [pf('Każdy kwadrat jest prostokątem.', true, 'Ma 4 kąty proste.'), pf('Każdy prostokąt jest kwadratem.', false, 'Nie każdy ma równe boki.'), num('Ile przekątnych ma prostokąt?', 2, 'Dwie.')],
          },
          {
            id: 'obwod', title: 'Obwód wielokąta', minutes: 12,
            blocks: [{ type: 'read', text: '**Obwód** to suma długości wszystkich boków.\n- prostokąt: Ob = 2 · a + 2 · b\n- kwadrat: Ob = 4 · a\n\nProstokąt 5 cm × 3 cm: Ob = 2 · 5 + 2 · 3 = **16 cm**.' }],
            practice: [gen('perimeter', { max: 20 }, 4), num('Obwód kwadratu wynosi 36 cm. Jaka jest długość boku?', 9, '36 : 4 = 9.')],
          },
          {
            id: 'pole', title: 'Pole prostokąta i kwadratu', minutes: 15,
            blocks: [{ type: 'read', text: '**Pole** mówi, ile miejsca zajmuje figura. Mierzymy je w **kwadratach jednostkowych**: 1 cm² (centymetr kwadratowy) — kwadrat o boku 1 cm.\n- prostokąt: P = a · b\n- kwadrat: P = a · a = a²\n\nProstokąt 5 cm × 3 cm: P = **15 cm²**.' }],
            practice: [gen('areaSquares', {}, 2), gen('areaRect', { max: 12 }, 4)],
          },
          {
            id: 'trojkaty', title: 'Trójkąty i koło', minutes: 12,
            blocks: [{ type: 'read', text: 'Trójkąty ze względu na boki: **równoboczny** (3 równe), **równoramienny** (2 równe), **różnoboczny**.\nZe względu na kąty: **ostrokątny**, **prostokątny**, **rozwartokątny**.\n\n**Okrąg** to linia; **koło** — okrąg z wnętrzem. **Promień** (r) łączy środek z okręgiem, **średnica** (d) = 2 · r.' }],
            practice: [mc('Trójkąt o trzech równych bokach to…', ['równoboczny', 'równoramienny', 'różnoboczny'], 0, 'Równoboczny.', { fixed: true }), num('Promień koła ma 4 cm. Ile ma średnica?', 8, 'd = 2 · r = 8 cm.'), mc('Trójkąt z kątem prostym to…', ['prostokątny', 'ostrokątny', 'rozwartokątny'], 0, 'Prostokątny.', { fixed: true })],
          },
        ],
        quiz: { n: 10, items: [gen('perimeter', { max: 20 }, 3), gen('areaRect', { max: 12 }, 3), num('Pole kwadratu o boku 7 cm to … cm²', 49, '7 · 7 = 49.'), mc('Średnica to…', ['dwa promienie', 'połowa promienia', 'obwód'], 0, 'd = 2r.', { fixed: true })] },
        challenge: [star(num('Prostokąt ma pole 48 cm² i jeden bok 6 cm. Jaki jest jego obwód?', 28, 'Drugi bok 48 : 6 = 8; Ob = 2 · 6 + 2 · 8 = 28.')), star(num('Ile kwadratów o boku 2 cm zmieści się w prostokącie 10 cm × 6 cm?', 15, '5 · 3 = 15.')), star(num('1 m² to ile cm²?', 10000, '100 cm · 100 cm = 10 000 cm².'))],
      },
      {
        id: 'jednostki', term: 2, strand: 'Pomiary', bridge: 'time',
        title: 'Jednostki: długość, masa, czas, skala',
        summary: 'Zamiana jednostek długości i masy, obliczenia zegarowe i kalendarzowe, lata przestępne, skala i plan.',
        lessons: [
          {
            id: 'dlugosc-masa', title: 'Długość i masa', minutes: 12,
            blocks: [{ type: 'read', text: '**Długość**: 1 cm = 10 mm, 1 dm = 10 cm, 1 m = 100 cm, 1 km = 1000 m.\n**Masa**: 1 dag = 10 g, 1 kg = 100 dag = 1000 g, 1 t (tona) = 1000 kg.' }],
            practice: [gen('convertLen', { kinds: ['m-cm', 'cm-mm', 'km-m', 'm-dm'] }, 3), gen('convertLen', { kinds: ['kg-dag', 'dag-g'] }, 2), num('Ile kilogramów ma 1 tona?', 1000, '1 t = 1000 kg.')],
          },
          {
            id: 'zegar4', title: 'Obliczenia zegarowe', minutes: 12,
            blocks: [{ type: 'read', text: 'Godzina = 60 minut, minuta = 60 sekund, doba = 24 godziny.\n\nObliczanie czasu trwania: film od **17:45** do **19:20** → do 18:00 = 15 min, do 19:00 = 1 h, do 19:20 = 20 min → **1 h 35 min**.' }],
            practice: [gen('duration', { maxLen: 180 }, 3), gen('timeAfter', { maxMin: 90 }, 2), gen('clock24', {}, 2)],
          },
          {
            id: 'kalendarz4', title: 'Kalendarz i lata przestępne', minutes: 12,
            blocks: [{ type: 'read', text: 'Rok ma **365 dni**, a rok **przestępny 366** (luty ma 29 dni). Lata przestępne występują co 4 lata, np. 2024, **2028**.\n\nRok = 12 miesięcy = 52 tygodnie i 1 dzień (lub 2).\n\nWiek = 100 lat. XXI wiek: lata 2001–2100.' }],
            practice: [gen('calendar', {}, 3), mc('Który rok jest przestępny?', ['2026', '2027', '2028'], 2, '2028 dzieli się przez 4.', { fixed: true }), num('Ile dni ma luty w roku przestępnym?', 29, '29.')],
          },
          {
            id: 'skala', title: 'Skala i plan', minutes: 15,
            blocks: [{ type: 'read', text: '**Skala 1 : 100** oznacza, że 1 cm na planie to 100 cm (1 m) w rzeczywistości.\n\nPokój na planie w skali 1 : 100 ma 4 cm × 3 cm → w rzeczywistości **4 m × 3 m**.\n\nNa mapach skala bywa bardzo mała, np. 1 : 100 000 (1 cm = 1 km).' }],
            practice: [num('Skala 1 : 100. Odcinek na planie ma 5 cm. Ile metrów ma w rzeczywistości?', 5, '5 cm · 100 = 500 cm = 5 m.'), num('Skala 1 : 1000. Na planie 3 cm. Ile metrów w rzeczywistości?', 30, '3 · 1000 = 3000 cm = 30 m.'), num('Na mapie w skali 1 : 100 000 odległość to 7 cm. Ile to kilometrów?', 7, '1 cm = 1 km.')],
          },
        ],
        quiz: { n: 10, items: [gen('convertLen', { kinds: ['m-cm', 'km-m', 'kg-dag'] }, 3), gen('duration', { maxLen: 180 }, 2), gen('calendar', {}, 2), num('Skala 1 : 50. Na planie 2 cm. Ile cm w rzeczywistości?', 100, '2 · 50 = 100 cm.')] },
        challenge: [star(num('Ile sekund ma godzina?', 3600, '60 · 60 = 3600.')), star(num('Ile dni mają razem styczeń i luty w roku przestępnym?', 60, '31 + 29 = 60.')), star(inp('Pociąg wyjechał o 22:40 i jechał 3 h 35 min. O której przyjechał? (np. 4:05)', ['2:15'], '22:40 + 3 h = 1:40, + 35 min = 2:15 w nocy.', { check: 'time', strict24: true }))],
      },
      {
        id: 'bryly-dane', term: 2, strand: 'Geometria i dane', bridge: 'data',
        title: 'Prostopadłościany i dane',
        summary: 'Prostopadłościan i sześcian: ściany, krawędzie, wierzchołki, siatki; odczytywanie diagramów i tabel.',
        lessons: [
          {
            id: 'prostopadloscian', title: 'Prostopadłościan i sześcian', minutes: 12,
            blocks: [{ type: 'read', text: '**Prostopadłościan** ma **6 ścian** (prostokątów), **12 krawędzi** i **8 wierzchołków**. Przykład: pudełko, cegła.\n**Sześcian** — wszystkie ściany są równymi kwadratami (kostka do gry).\n\n**Siatka** bryły to jej rozłożone ściany — z siatki można skleić bryłę.' }],
            practice: [num('Ile krawędzi ma prostopadłościan?', 12, '12.'), num('Ile wierzchołków ma sześcian?', 8, '8.'), num('Ile ścian ma sześcian?', 6, '6.'), num('Sześcian ma krawędź 3 cm. Jaka jest suma długości wszystkich krawędzi?', 36, '12 · 3 = 36 cm.')],
          },
          {
            id: 'diagramy', title: 'Diagramy i tabele', minutes: 12,
            blocks: [{ type: 'read', text: 'Dane przedstawiamy w **tabelach** i na **diagramach** (słupkowych, kołowych, piktogramach). Zawsze sprawdź **skalę** na osi — jedna kratka może oznaczać np. 5 osób!' }],
            practice: [gen('readGraph', { scale: 5 }, 3), gen('readGraph', { scale: 2, total: true }, 2)],
          },
          {
            id: 'zadania-dane', title: '★ Zadania z danymi', minutes: 12,
            blocks: [{ type: 'read', text: '**Średnia**: dodaj wszystkie wartości i podziel przez ich liczbę.\n\nTemperatury: 4°, 6°, 8° → (4 + 6 + 8) : 3 = **6°**.' }],
            practice: [num('Oceny Tosi: 5, 4, 6. Jaka jest średnia?', 5, '(5 + 4 + 6) : 3 = 15 : 3 = 5.'), num('W 4 dni przeczytała 12, 15, 9 i 24 strony. Ile średnio stron dziennie?', 15, '60 : 4 = 15.')],
          },
        ],
        quiz: { n: 8, items: [gen('readGraph', { scale: 5 }, 3), num('Ile ścian ma prostopadłościan?', 6, '6.'), num('Ile krawędzi ma sześcian?', 12, '12.')] },
        challenge: [star(num('Pole jednej ściany sześcianu to 9 cm². Ile wynosi pole całej powierzchni sześcianu?', 54, '6 · 9 = 54 cm².')), star(num('Średnia trzech liczb to 10. Dwie z nich to 8 i 9. Jaka jest trzecia?', 13, 'Suma 30; 30 − 8 − 9 = 13.'))],
      },
    ],
  });
})();

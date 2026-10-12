/* Klasa 4 — plastyka, muzyka, technika i informatyka (przedmioty uzupełniające; w planie dnia raz w tygodniu). */
(function () {
  const { mc, pf, num, write, star } = LA.Q;

  LA.addSubject('pl4', {
    id: 'sztuka',
    intro: 'Plastyka: barwa, kontrast, faktura, kompozycja, dziedzictwo kulturowe. Muzyka: zapis nutowy, metrum, dynamika, tempo, hymn i pieśni.',
    chapters: [
      {
        id: 'plastyka4', term: 1, strand: 'Plastyka', bridge: 'visual-arts',
        title: 'Środki wyrazu plastycznego',
        summary: 'Barwy czyste i złamane, kontrast, światłocień, faktura, kompozycja; architektura i rzeźba wokół nas.',
        lessons: [
          {
            id: 'barwa4', title: 'Barwa i kontrast', minutes: 12,
            blocks: [{ type: 'read', text: '**Barwy czyste** — intensywne, bez domieszek. **Barwy złamane** — z domieszką czerni, bieli lub barwy dopełniającej (stonowane).\n\n**Barwy dopełniające** leżą naprzeciw siebie w kole barw: czerwona – zielona, niebieska – pomarańczowa, żółta – fioletowa. Postawione obok siebie tworzą najsilniejszy **kontrast**.\n\n**Barwy achromatyczne**: biel, czerń i szarości.' }],
            practice: [
              mc('Jaka barwa jest dopełniająca do czerwonej?', ['zielona', 'żółta', 'fioletowa'], 0, 'Czerwona – zielona.', { fixed: true }),
              mc('Biel, czerń i szarości to barwy…', ['achromatyczne', 'ciepłe', 'pochodne'], 0, 'Achromatyczne.', { fixed: true }),
              mc('Barwa z domieszką szarości to barwa…', ['złamana', 'czysta', 'podstawowa'], 0, 'Złamana.', { fixed: true }),
            ],
          },
          {
            id: 'faktura', title: 'Faktura, światłocień, kompozycja', minutes: 12,
            blocks: [{ type: 'read', text: '**Faktura** — wygląd powierzchni (gładka, chropowata, puszysta). **Światłocień** — jasne i ciemne miejsca, które dają wrażenie bryły.\n\n**Kompozycja** — układ elementów na obrazie: **symetryczna**, **asymetryczna**, **otwarta** (jakby wychodziła poza ramę), **zamknięta**, **rytmiczna** (powtarzające się elementy).' }],
            practice: [
              mc('Układ, w którym lewa i prawa strona są takie same, to kompozycja…', ['symetryczna', 'otwarta', 'asymetryczna'], 0, 'Symetryczna.', { fixed: true }),
              mc('Kora drzewa ma fakturę…', ['chropowatą', 'gładką jak szkło'], 0, 'Chropowatą.', { fixed: true }),
              write('Opisz kompozycję i barwy dowolnego obrazu (np. „Słoneczniki” van Gogha albo „Babie lato” Chełmońskiego).', ['Rodzaj kompozycji', 'Barwy ciepłe/zimne', 'Nastrój'], 25),
            ],
          },
          {
            id: 'dziedzictwo', title: 'Dziedzictwo kulturowe', minutes: 12,
            blocks: [{ type: 'read', text: 'Polskie zabytki na liście **UNESCO**: Stare Miasto w **Krakowie**, Kopalnia Soli w **Wieliczce**, Stare Miasto w **Warszawie** (odbudowane po wojnie), Zamek w **Malborku**, **Puszcza Białowieska**, drewniane kościoły.\n\nW Australii: **Opera w Sydney**, **Uluru-Kata Tjuta**, **Wielka Rafa Koralowa**.' }],
            practice: [
              mc('Która kopalnia jest na liście UNESCO?', ['w Wieliczce', 'w Bełchatowie'], 0, 'Kopalnia Soli w Wieliczce.', { fixed: true }),
              mc('Który obiekt w Australii jest na liście UNESCO?', ['Opera w Sydney', 'Wawel', 'Malbork'], 0, 'Opera w Sydney.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Niebieska i pomarańczowa to barwy…', ['dopełniające', 'achromatyczne'], 0, 'Dopełniające.', { fixed: true }), mc('Kompozycja otwarta…', ['wydaje się wychodzić poza ramę', 'jest zawsze symetryczna'], 0, 'Wychodzi poza ramę.', { fixed: true }), mc('Zamek w Malborku zbudowali…', ['Krzyżacy', 'Rzymianie'], 0, 'Zakon Krzyżacki.', { fixed: true })] },
        challenge: [star(mc('Dlaczego Stare Miasto w Warszawie wpisano na listę UNESCO, choć jest odbudowane?', ['za wyjątkową, wierną odbudowę po zniszczeniach wojennych', 'bo jest najstarsze w Europie'], 0, 'Odbudowa była wyjątkowa na skalę światową.', { fixed: true }))],
      },
      {
        id: 'muzyka4', term: 2, strand: 'Muzyka', bridge: 'music',
        title: 'Muzyka: metrum, dynamika, tempo',
        summary: 'Takt i metrum, pauzy, dynamika (piano, forte), tempo, hymn państwowy i pieśni patriotyczne.',
        lessons: [
          {
            id: 'metrum', title: 'Takt i metrum', minutes: 12,
            blocks: [{ type: 'read', text: 'Utwór dzielimy na **takty** kreskami taktowymi. **Metrum** mówi, ile i jakich wartości jest w takcie:\n- **2/4** — dwie ćwierćnuty (marsz, polka)\n- **3/4** — trzy ćwierćnuty (walc, mazurek, polonez)\n- **4/4** — cztery ćwierćnuty\n\n**Pauza** to znak ciszy — ma takie same wartości jak nuty.' }],
            practice: [num('Ile ćwierćnut mieści się w takcie 3/4?', 3, 'Trzy.'), mc('W jakim metrum jest walc?', ['3/4', '2/4', '4/4'], 0, 'Raz-dwa-trzy.', { fixed: true }), num('Ile ósemek mieści się w takcie 2/4?', 4, '2 ćwierćnuty = 4 ósemki.')],
          },
          {
            id: 'dynamika', title: 'Dynamika i tempo', minutes: 12,
            blocks: [{ type: 'read', text: '**Dynamika** — głośność: **piano (p)** cicho, **forte (f)** głośno, **mezzoforte (mf)** średnio, **crescendo** — coraz głośniej, **diminuendo** — coraz ciszej.\n\n**Tempo** — szybkość: **largo** (bardzo wolno), **andante** (spokojnie), **allegro** (szybko), **presto** (bardzo szybko).' }],
            practice: [mc('Co oznacza „forte”?', ['głośno', 'cicho', 'szybko'], 0, 'Głośno.', { fixed: true }), mc('Coraz głośniej to…', ['crescendo', 'diminuendo', 'largo'], 0, 'Crescendo.', { fixed: true }), mc('Allegro oznacza tempo…', ['szybkie', 'bardzo wolne'], 0, 'Szybkie.', { fixed: true })],
          },
          {
            id: 'piesni', title: 'Hymn i pieśni patriotyczne', minutes: 12,
            blocks: [{ type: 'read', text: '„**Mazurek Dąbrowskiego**” ma metrum **3/4** i rytm mazurka. Inne pieśni: „**Rota**” (słowa Maria Konopnicka), „**Pierwsza Brygada**”, „**Warszawianka**”.\n\nHymn Australii to „**Advance Australia Fair**”.' }],
            practice: [mc('Kto napisał słowa „Roty”?', ['Maria Konopnicka', 'Józef Wybicki', 'Adam Mickiewicz'], 0, 'Maria Konopnicka.', { fixed: true }), mc('Jak nazywa się hymn Australii?', ['Advance Australia Fair', 'Waltzing Matilda', 'God Save the King'], 0, 'Advance Australia Fair (od 1984).', { fixed: true })],
          },
        ],
        quiz: { n: 6, items: [mc('Piano oznacza…', ['cicho', 'głośno'], 0, 'Cicho.', { fixed: true }), mc('Kreski dzielą utwór na…', ['takty', 'zwrotki'], 0, 'Takty.', { fixed: true }), mc('Polonez ma metrum…', ['3/4', '2/4'], 0, '3/4.', { fixed: true })] },
        challenge: [star(num('Ile szesnastek mieści się w takcie 4/4?', 16, '4 ćwierćnuty · 4 szesnastki = 16.'))],
      },
    ],
  });

  LA.addSubject('pl4', {
    id: 'technika',
    intro: 'Technika: karta rowerowa (przepisy, znaki, budowa roweru), materiały i rysunek techniczny. Informatyka: komputer, programowanie w Scratchu, dokumenty tekstowe, bezpieczeństwo w sieci.',
    chapters: [
      {
        id: 'karta-rowerowa', term: 1, strand: 'Technika', bridge: 'safety',
        title: 'Karta rowerowa',
        summary: 'Budowa i wyposażenie roweru, znaki drogowe, pierwszeństwo przejazdu, skręcanie, bezpieczna jazda.',
        lessons: [
          {
            id: 'rower', title: 'Obowiązkowe wyposażenie roweru', minutes: 12,
            blocks: [{ type: 'read', text: 'Rower musi mieć:\n- z przodu **białe lub żółte selektywne światło** (po zmroku)\n- z tyłu **czerwone światło odblaskowe** (odblask) i **czerwone światło pozycyjne**\n- co najmniej **jeden sprawny hamulec**\n- **dzwonek** lub inny sygnał o nieprzeraźliwym dźwięku\n\nKartę rowerową można zdobyć od **10 lat**. W Polsce kask jest **zalecany** (zawsze go zakładaj!), a w Australii — **obowiązkowy** z mocy prawa.' }],
            practice: [
              mc('Jakiego koloru odblask musi być z tyłu roweru?', ['czerwony', 'biały', 'zielony'], 0, 'Czerwony.', { fixed: true }),
              mc('Ile sprawnych hamulców musi mieć rower co najmniej?', ['jeden', 'dwa', 'trzy'], 0, 'Co najmniej jeden.', { fixed: true }),
              mc('W którym kraju kask rowerowy jest obowiązkowy dla wszystkich?', ['w Australii', 'w Polsce'], 0, 'W Australii kask jest obowiązkowy.', { fixed: true }),
            ],
          },
          {
            id: 'znaki', title: 'Znaki drogowe', minutes: 15,
            blocks: [{ type: 'read', text: '- **Ostrzegawcze** (A) — trójkąt, żółte tło, czerwona obwódka\n- **Zakazu** (B) — koło, białe tło, czerwona obwódka\n- **Nakazu** (C) — niebieskie koło (np. C-13 „droga dla rowerów”)\n- **Informacyjne** (D) — niebieski prostokąt (np. D-6 „przejście dla pieszych”)\n- **A-7 „ustąp pierwszeństwa”** — odwrócony trójkąt\n- **B-20 „STOP”** — ośmiokąt, trzeba się zatrzymać' }],
            practice: [
              mc('Znak STOP ma kształt…', ['ośmiokąta', 'koła', 'trójkąta'], 0, 'Ośmiokąt.', { fixed: true }),
              mc('Znak „droga dla rowerów” to znak…', ['nakazu', 'zakazu', 'ostrzegawczy'], 0, 'Niebieskie koło — nakaz.', { fixed: true }),
              mc('„Ustąp pierwszeństwa” to…', ['odwrócony trójkąt', 'niebieski prostokąt'], 0, 'Odwrócony trójkąt.', { fixed: true }),
            ],
          },
          {
            id: 'manewry', title: 'Jazda i pierwszeństwo', minutes: 15,
            blocks: [{ type: 'read', text: '- Rowerzysta jedzie **drogą dla rowerów**, a gdy jej nie ma — **prawą krawędzią jezdni**.\n- Przed skrętem **sygnalizujemy ręką** i patrzymy za siebie.\n- **Skręt w lewo** — zbliżamy się do osi jezdni, ustępujemy pojazdom z naprzeciwka.\n- Na skrzyżowaniu równorzędnym — **zasada prawej ręki**: ustępujemy pojazdom z prawej.\n- Przez przejście dla pieszych rower **przeprowadzamy**.\n- Dziecko do 10 lat może jechać chodnikiem pod opieką dorosłego.' }],
            practice: [
              mc('Na skrzyżowaniu równorzędnym ustępujesz pojazdom…', ['z prawej strony', 'z lewej strony'], 0, 'Zasada prawej ręki.', { fixed: true }),
              mc('Jak przekraczasz przejście dla pieszych z rowerem?', ['przeprowadzam rower', 'przejeżdżam szybko'], 0, 'Przeprowadzamy.', { fixed: true }),
              mc('Przed skrętem w lewo…', ['sygnalizuję lewą ręką i patrzę za siebie', 'skręcam bez patrzenia'], 0, 'Sygnał i obserwacja.', { fixed: true }),
            ],
          },
        ],
        quiz: { n: 6, items: [mc('Znaki ostrzegawcze mają kształt…', ['trójkąta', 'koła'], 0, 'Trójkąta.', { fixed: true }), mc('Kartę rowerową można zdobyć od…', ['10 lat', '7 lat', '15 lat'], 0, '10 lat.', { fixed: true }), mc('Gdzie jedzie rowerzysta, gdy nie ma drogi dla rowerów?', ['prawą krawędzią jezdni', 'środkiem jezdni'], 0, 'Prawą krawędzią.', { fixed: true })] },
        challenge: [star(mc('W Australii jeździ się lewą stroną. Komu ustępuje się na skrzyżowaniu równorzędnym w Australii?', ['pojazdom z prawej (tak jak w Polsce, zasada „give way to the right”)', 'pojazdom z lewej'], 0, 'W Australii też obowiązuje ustępowanie z prawej na skrzyżowaniach bez znaków.', { fixed: true }))],
      },
      {
        id: 'informatyka4', term: 2, strand: 'Informatyka', bridge: 'algorithms',
        title: 'Komputer, Scratch i dokumenty',
        summary: 'Budowa komputera, pliki i foldery, programowanie w Scratchu (zdarzenia, pętle, warunki), edytor tekstu, bezpieczeństwo.',
        lessons: [
          {
            id: 'komputer', title: 'Budowa komputera, pliki i foldery', minutes: 12,
            blocks: [{ type: 'read', text: '**Urządzenia wejścia**: klawiatura, mysz, mikrofon, ekran dotykowy. **Wyjścia**: monitor, głośniki, drukarka. **Procesor** wykonuje obliczenia, **pamięć RAM** przechowuje dane na czas pracy, **dysk** — na stałe.\n\nDane zapisujemy w **plikach** (np. `wypracowanie.docx`), a pliki porządkujemy w **folderach**. Część po kropce to **rozszerzenie** (rodzaj pliku).' }],
            practice: [mc('Który element jest urządzeniem wejścia?', ['mikrofon', 'głośnik', 'drukarka'], 0, 'Mikrofon.', { fixed: true }), mc('Rozszerzenie pliku „zdjecie.jpg” to…', ['jpg', 'zdjecie'], 0, 'jpg — obraz.', { fixed: true }), mc('Co wykonuje obliczenia w komputerze?', ['procesor', 'monitor', 'mysz'], 0, 'Procesor.', { fixed: true })],
          },
          {
            id: 'scratch4', title: 'Scratch: zdarzenia, pętle, warunki', minutes: 15,
            blocks: [{ type: 'read', text: '- **Zdarzenie**: „kiedy kliknięto zieloną flagę” — program startuje\n- **Pętla**: „powtórz 10 razy”, „zawsze”\n- **Warunek**: „jeżeli dotyka koloru czerwonego, to…”\n- **Zmienna**: przechowuje wartość, np. **punkty**\n\nPrzykład gry: duszek zbiera jabłka; „jeżeli dotyka jabłka, to zmień punkty o 1”.' }],
            practice: [mc('Do czego służy zmienna „punkty”?', ['do przechowywania wyniku', 'do zmiany koloru tła'], 0, 'Przechowuje wartość.', { fixed: true }), mc('Blok „jeżeli … to” to…', ['warunek', 'pętla', 'zdarzenie'], 0, 'Warunek.', { fixed: true }), num('Pętla „powtórz 5 razy” zawiera „przesuń o 10 kroków”. O ile kroków przesunie się duszek?', 50, '5 · 10 = 50.')],
          },
          {
            id: 'edytor', title: 'Edytor tekstu i bezpieczeństwo', minutes: 12,
            blocks: [{ type: 'read', text: 'W edytorze tekstu: **pogrubienie** (Ctrl/Cmd + B), *kursywa* (Ctrl/Cmd + I), wyrównanie, wstawianie obrazów. **Ctrl/Cmd + S** — zapisz! **Ctrl/Cmd + Z** — cofnij.\n\nBezpieczeństwo: silne hasło (długie, z cyframi i znakami), nie klikamy w podejrzane linki, szanujemy **prawa autorskie** (podajemy źródło zdjęć i tekstów).' }],
            practice: [mc('Skrót do zapisania pliku to…', ['Ctrl/Cmd + S', 'Ctrl/Cmd + B', 'Ctrl/Cmd + Z'], 0, 'S jak save.', { fixed: true }), mc('Które hasło jest najsilniejsze?', ['Kot!Na3Drzewach2026', '1234', 'tosia'], 0, 'Długie, z cyframi i znakami.', { fixed: true }), pf('Można bez pytania kopiować cudze zdjęcia z internetu do swojej pracy.', false, 'Trzeba szanować prawa autorskie i podawać źródło.')],
          },
        ],
        quiz: { n: 6, items: [mc('Pamięć RAM przechowuje dane…', ['na czas pracy', 'na zawsze'], 0, 'Na czas pracy.', { fixed: true }), mc('Pętla „zawsze”…', ['powtarza bez końca', 'wykonuje się raz'], 0, 'Bez końca.', { fixed: true }), mc('Ctrl/Cmd + Z to…', ['cofnij', 'zapisz'], 0, 'Cofnij.', { fixed: true })] },
        challenge: [star(mc('Program: zmienna x = 2; powtórz 3 razy [x = x · 2]. Ile wynosi x na końcu?', ['16', '8', '6'], 0, '2 → 4 → 8 → 16.', { fixed: true }))],
      },
    ],
  });
})();

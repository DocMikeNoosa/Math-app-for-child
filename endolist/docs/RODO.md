# EndoList — RODO / ochrona danych

Dokument dla administratora danych (kliniki) i inspektora ochrony danych (IOD).

Opisuje, jak EndoList przetwarza dane osobowe, jakie zabezpieczenia ma wbudowane i co musi zrobić klinika.

> **Ważne:** zgodność z RODO zapewnia administrator danych, a nie sam program. EndoList dostarcza środki techniczne (art. 25 i 32 RODO) i narzędzia do realizacji praw pacjentów. Umowy, rejestry, upoważnienia i decyzje opisane w części „Do zrobienia przez klinikę" należą do administratora. Ten dokument nie jest poradą prawną — ostateczną ocenę powinien wydać IOD lub prawnik kliniki.

## 1. Role i podstawy prawne

| | |
|---|---|
| **Administrator** | Podmiot leczniczy, w którym lekarz udziela świadczeń (np. NZOZ Centrum Stomatologiczne). Przy praktyce prowadzonej samodzielnie — lekarz. |
| **Użytkownik** | Lekarz upoważniony do przetwarzania danych (art. 29 RODO). |
| **Cel** | Dokumentowanie leczenia i informowanie lekarza kierującego o jego przebiegu (ciągłość leczenia). |
| **Podstawy** | Art. 6 ust. 1 lit. c i art. 9 ust. 2 lit. h RODO (opieka zdrowotna).<br>Ustawa o prawach pacjenta i Rzeczniku Praw Pacjenta: art. 24 — prowadzenie dokumentacji; art. 26 ust. 3 pkt 1 — udostępnienie podmiotowi udzielającemu świadczeń, jeżeli jest to niezbędne do zapewnienia ciągłości świadczeń.<br>Tajemnica lekarska: art. 40 ustawy o zawodach lekarza i lekarza dentysty. |
| **Kategorie danych** | Pacjent: imię i nazwisko, PESEL lub data urodzenia, płeć, dane o stanie zdrowia jamy ustnej i leczeniu.<br>Lekarze kierujący: imię i nazwisko, gabinet, adres, e-mail. |

## 2. Gdzie są dane

| Miejsce | Co | Ochrona |
|---|---|---|
| Urządzenie (przeglądarka / aplikacja, IndexedDB) | wszystkie dane | AES-256-GCM; klucz z hasła (PBKDF2, 600 000 iteracji) lub z klucza dostępu (passkey, PRF); automatyczna blokada po bezczynności |
| Folder kopii zapasowej na komputerze | kopia danych | zaszyfrowana (jak wyżej) |
| Folder `Listy/` na komputerze | listy w PDF | **niezaszyfrowane** — wymagane szyfrowanie dysku (BitLocker / FileVault) |
| Serwer synchronizacji (Cloudflare Workers + D1, opcjonalnie) | zaszyfrowane rekordy | szyfrowanie end-to-end: serwer nie zna hasła, klucza danych, loginu (przechowuje skrót) ani nazwiska lekarza. Baza wyłącznie w UE (`--jurisdiction eu`). Widoczne metadane: liczba, rodzaj i czas zmian rekordów |
| Anthropic (Claude API, opcjonalnie) | dane kliniczne do napisania / poprawy listu | **pseudonimizacja** przed wysłaniem (pkt 3); AI działa po wpisaniu klucza API kliniki |
| E-mail | list w PDF | zależy od poczty kliniki — zalecana poczta służbowa z szyfrowaniem TLS |
| GitHub Pages | tylko kod aplikacji | brak danych pacjentów (serwer widzi adres IP otwierającego stronę) |

Aplikacja nie używa plików cookie, analityki ani zewnętrznych czcionek i bibliotek ładowanych z internetu. Wszystkie pliki są wbudowane.

## 3. Wbudowane środki (art. 25 i 32 RODO)

- **Szyfrowanie** wszystkich danych na urządzeniu i w kopiach; synchronizacja end-to-end.
- **Kontrola dostępu:**
  - login i hasło (min. 12 znaków; nie da się go odzyskać, więc nikt poza użytkownikiem nie odszyfruje danych);
  - opcjonalnie passkey (Face ID / Touch ID / Windows Hello);
  - automatyczna blokada (5–60 min);
  - blokada konta na serwerze po 8 nieudanych próbach logowania.
- **AI tylko z kluczem kliniki:** AI działa po wpisaniu klucza API z konta kliniki (console.anthropic.com), którego warunki (Commercial Terms) obejmują umowę powierzenia (DPA). Bez klucza nic nie jest wysyłane, a listy tworzy generator wbudowany, lokalnie. W gabinecie administrator może wyłączyć AI dla wszystkich.
- **Pseudonimizacja przed AI:**
  - imiona i nazwiska (pacjenta, lekarzy, także odmienione), PESEL, daty urodzenia, numery telefonów, adresy e-mail i dane adresata są zastępowane znacznikami `[OSOBA-1]`, `[PESEL]`… i przywracane lokalnie w odpowiedzi;
  - PESEL, adres i data urodzenia nigdy nie są potrzebne AI;
  - to samo dotyczy tekstu dyktowanego i wpisanego ręcznie;
  - weryfikują to testy automatyczne.
- **Rejestr zdarzeń (rozliczalność):**
  - zapisywane są: logowanie, blokada, otwarcie karty pacjenta, wizyty lub listu, utworzenie listu, zapis PDF, druk, e-mail, eksport ProDentis, eksport danych, usunięcia, użycie AI, zmiany zabezpieczeń;
  - każde zdarzenie ma czas, urządzenie i użytkownika;
  - rejestr jest zaszyfrowany, synchronizowany i do pobrania jako CSV (Ustawienia → Ochrona danych).
- **Integralność i dostępność:** kopia zapasowa w folderze (najnowsza oraz 60 kopii dziennych), synchronizacja między urządzeniami, usunięcia zapisywane jako zaszyfrowane „nagrobki", żeby stara kopia ich nie przywróciła.
- **Minimalizacja:** serwer synchronizacji nie zna tożsamości lekarza; AI dostaje wyłącznie dane kliniczne.

## 3a. Gabinet i administratorzy

- **Zakładanie:** gabinet zakłada pierwsza osoba, która zostaje administratorem. Kolejni lekarze i administratorzy dołączają jednorazowym kodem zaproszenia, ważnym 7 dni. Kod zawiera odcisk klucza gabinetu, więc urządzenie sprawdza, czy dołącza do właściwego gabinetu.
- **Uprawnienia administratorów:**
  - zapraszanie lekarzy;
  - nadawanie i odbieranie uprawnień administratora (gabinet musi mieć co najmniej jednego);
  - usuwanie członków;
  - reset zapomnianego hasła;
  - odczyt i eksport danych oraz rejestru zdarzeń lekarza (ciągłość dokumentacji, rozliczalność);
  - decyzja o użyciu AI w całym gabinecie.
- **Depozyt kluczy:** klucz danych każdego lekarza jest dodatkowo zaszyfrowany kluczem gabinetu. Klucz prywatny gabinetu mają wyłącznie administratorzy; serwer go nie ma. Lekarz jest o tym informowany przy dołączaniu.
- **Usunięcie członka:** natychmiast odcina mu dostęp na serwerze. Jego urządzenia przy najbliższym połączeniu usuwają dane gabinetu. Dokumentacja pozostaje w gabinecie.
- **Rejestr:** każda czynność administracyjna (zaproszenie, zmiana roli, reset hasła, dostęp do danych lekarza, eksport, usunięcie) trafia do rejestru zdarzeń.
- **Ograniczenie:** odebranie uprawnień administratora natychmiast blokuje mu funkcje administracyjne na serwerze. Osoba ta mogła jednak wcześniej poznać klucz gabinetu. Przy odejściu administratora w konflikcie — zmienić hasła i, w razie wątpliwości, założyć gabinet od nowa (nowy klucz).
- **Do dokumentacji kliniki:**
  - lista administratorów i zakres ich upoważnień (art. 29 i 32 ust. 4 RODO);
  - informacja dla lekarzy o depozycie kluczy.

## 4. Prawa pacjenta — jak je zrealizować w EndoList

| Prawo | Gdzie |
|---|---|
| Dostęp (art. 15) i przenoszenie (art. 20) | Karta pacjenta → **Eksport danych**: plik JSON z danymi, wizytami i treścią listów; listy w PDF z widoku listu. Plik nie jest zaszyfrowany — przekazać bezpiecznie. |
| Sprostowanie (art. 16) | Karta pacjenta → Edytuj dane; wizyty i listy można edytować. |
| Usunięcie (art. 17) | Karta pacjenta → ikona kosza → wpisanie nazwiska. Usuwa kartę, wizyty i listy na wszystkich urządzeniach. **Uwaga:** prawo do usunięcia nie obejmuje dokumentacji medycznej, którą trzeba przechowywać (art. 17 ust. 3 lit. b i c RODO). |
| Okres przechowywania | Ustawienia → Ochrona danych → „Przechowywanie": pacjenci po okresie 20 lat od końca roku ostatniego wpisu (art. 29 ustawy o prawach pacjenta; wyjątki m.in. zgon — 30 lat, dzieci do 2. r.ż. — 22 lata). |

EndoList nie zastępuje głównej dokumentacji medycznej gabinetu (np. ProDentis). Listy należy dołączać do dokumentacji w systemie gabinetu.

## 5. Do zrobienia przez klinikę (lista kontrolna)

1. **Rejestr czynności przetwarzania** (art. 30): dopisać czynność według wzoru w pkt 6.
2. **Umowy powierzenia (art. 28):**
   - **Cloudflare** — jeśli działa synchronizacja: konto firmowe kliniki; Cloudflare udostępnia DPA (Data Processing Addendum).
   - **Anthropic** — jeśli używane jest AI: klucz API z konta firmowego kliniki (console.anthropic.com); DPA jest częścią Commercial Terms i zawiera standardowe klauzule umowne (SCC) na transfer poza EOG. Sprawdzić u Anthropic: okres przechowywania zapytań i dostępność zero data retention.
   - **Dostawca poczty**, jeśli listy są wysyłane e-mailem.
3. **Upoważnienie** lekarza do przetwarzania danych (art. 29 i 32 ust. 4).
4. **Urządzenia:**
   - szyfrowanie dysku (BitLocker / FileVault) — ze względu na PDF-y w folderze `Listy/`;
   - blokada ekranu iPhone'a kodem lub Face ID;
   - aktualny system;
   - brak współdzielonych kont systemowych.
5. **Klauzula informacyjna** dla pacjentów (art. 13): uwzględnić odbiorców, czyli lekarzy kierujących i podmioty przetwarzające (dostawców usług IT: hostingu i synchronizacji, a przy AI — Anthropic), oraz transfer poza EOG przy AI (na podstawie SCC).
6. **Ocena skutków (DPIA, art. 35):** motyw 91 RODO wskazuje, że przetwarzanie danych pacjentów przez pojedynczego lekarza zwykle nie jest „na dużą skalę". Decyzję, czy DPIA jest wymagana (lub zalecana przy użyciu AI), podejmuje administrator z IOD.
7. **Procedura naruszeń** (art. 33 i 34):
   - zgłoszenie do UODO w ciągu 72 godzin od wykrycia;
   - przy utracie urządzenia: dane w aplikacji są zaszyfrowane, co zwykle zmniejsza ryzyko dla osób (art. 34 ust. 3 lit. a), ale PDF-y w folderze i wyeksportowane pliki nie są zaszyfrowane;
   - po utracie urządzenia: zmienić hasło na innym urządzeniu i usunąć klucz dostępu utraconego urządzenia.
8. **Hasło:** silne, unikalne, przechowywane w menedżerze haseł. Bez hasła danych nie da się odzyskać.
9. **Okresowy przegląd** (np. co rok): rejestr zdarzeń i dane po okresie przechowywania.

## 6. Wzór wpisu do rejestru czynności przetwarzania

| Pole | Treść |
|---|---|
| Nazwa czynności | Informowanie lekarzy kierujących o leczeniu endodontycznym (EndoList) |
| Cel | Zapewnienie ciągłości leczenia; dokumentowanie leczenia |
| Kategorie osób | Pacjenci; lekarze kierujący |
| Kategorie danych | Dane identyfikacyjne (imię, nazwisko, PESEL lub data urodzenia); dane o stanie zdrowia; dane kontaktowe lekarzy |
| Odbiorcy | Lekarze i podmioty kierujące; podmioty przetwarzające: Cloudflare (synchronizacja, dane zaszyfrowane, UE), Anthropic (AI, dane spseudonimizowane), dostawca poczty |
| Transfer poza EOG | Anthropic (USA) — standardowe klauzule umowne w DPA; tylko gdy AI jest włączone |
| Okres przechowywania | Zgodnie z art. 29 ustawy o prawach pacjenta (co do zasady 20 lat od końca roku ostatniego wpisu) |
| Środki bezpieczeństwa | Pkt 3 tego dokumentu |

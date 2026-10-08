# EndoList — serwer synchronizacji

Pozwala pracować na tych samych danych na **iPhonie**, komputerze w gabinecie i w przeglądarce w domu.

## Jak chronione są dane

- Każdy rekord (pacjent, wizyta, list, ustawienia) jest szyfrowany **na urządzeniu** (AES-256-GCM) kluczem, który nigdy nie opuszcza urządzeń. Serwer dostaje wyłącznie szyfrogram.
- Serwer nie zna loginu (przechowuje jego skrót SHA-256), hasła ani nazwiska lekarza. Przechowuje opakowany klucz (tak jak plik kopii zapasowej) — do jego otwarcia potrzebne jest hasło.
- Po 8 błędnych próbach logowania konto jest blokowane na 10 minut.
- Serwer widzi metadane: liczbę i rodzaj rekordów (np. „visits"), ich rozmiar i czas zmian.
- Konflikty: jeśli ten sam rekord zmieniono na dwóch urządzeniach, zostaje wersja zapisana później.

**RODO:** dane są zaszyfrowane end-to-end, ale nadal są to dane o zdrowiu powierzone podmiotowi przetwarzającemu (Cloudflare). Przed użyciem z prawdziwymi pacjentami skonsultuj to z inspektorem ochrony danych kliniki (umowa powierzenia — Cloudflare udostępnia DPA).

## Wdrożenie na Cloudflare (jednorazowo, ok. 10 minut)

Potrzebne: bezpłatne konto Cloudflare i Node.js.

```
cd sync-server
npx wrangler login                                   # logowanie do Cloudflare w przeglądarce
npx wrangler d1 create endolist-sync                 # wypisze database_id
#   → wklej database_id do wrangler.toml
npx wrangler d1 execute endolist-sync --remote --file schema.sql
npx wrangler deploy                                  # wypisze adres, np. https://endolist-sync.<nazwa>.workers.dev
```

Potem **jeden raz** podaj ten adres aplikacji — od tej chwili wszystkie urządzenia synchronizują się same:

- **Wersja internetowa (GitHub Pages):** w repozytorium GitHub → Settings → Secrets and variables → Actions → zakładka *Variables* → **New repository variable**: nazwa `ENDOLIST_SYNC_URL`, wartość = adres z `wrangler deploy`. Następnie Actions → „Deploy to GitHub Pages" → *Run workflow* (albo dowolny push).
- **Wersja zainstalowana na komputerze (ikona na pulpicie):** wpisz adres do pliku `sync-url.txt` w folderze EndoList (obok `server.mjs`) i uruchom aplikację ponownie.

Co się wtedy dzieje:

- **nowe konto** jest od razu zakładane także na serwerze synchronizacji;
- **istniejące konto** (np. utworzone wcześniej na komputerze) włącza synchronizację samo przy najbliższym logowaniu hasłem i wysyła na serwer wszystkie dotychczasowe dane;
- **na każdym innym urządzeniu** wystarczy zwykły ekran logowania: login + hasło → dane są pobierane i odszyfrowywane;
- **zmiana hasła** na jednym urządzeniu działa od razu na pozostałych (nowe hasło otwiera konto także tam, gdzie zmiana jeszcze nie dotarła);
- jeśli Safari usunie dane strony (iOS robi to po ok. 7 dniach nieużywania strony **niedodanej** do ekranu początkowego), wystarczy zalogować się ponownie — wszystko zostanie pobrane z serwera.

Bez skonfigurowanego adresu synchronizację można nadal włączyć ręcznie: **Ustawienia → Synchronizacja → Włącz synchronizację**.

Plan bezpłatny Workers + D1 powinien wystarczyć dla jednego gabinetu (aktualne limity: developers.cloudflare.com/d1/platform/limits). Jeden rekord może mieć maks. 1,9 MB (limit wiersza D1 to 2 MB).

## Pierwsze uruchomienie na iPhonie

1. Otwórz w Safari adres wersji internetowej EndoList (GitHub Pages, https://).
2. Zaloguj się **tym samym loginem i hasłem** co na komputerze — dane zostaną pobrane.
3. Safari → Udostępnij → **Do ekranu początkowego** — EndoList ma wtedy własną ikonę, działa jak aplikacja, a iOS nie usuwa jej danych.
4. Opcjonalnie: Ustawienia → Dodaj klucz dostępu → logowanie Face ID.

Klucz dostępu (passkey) jest przypisany do adresu strony: klucz dodany w wersji `localhost` nie działa w wersji internetowej i odwrotnie. Hasło działa wszędzie.

## Lokalnie (testy, sieć w gabinecie)

```
ENDOLIST_SYNC_DIR=./dane-sync node server.mjs        # ten sam protokół pod http://localhost:4173/sync
node test/sync-api.mjs http://localhost:4173/sync     # test protokołu
```

iPhone wymaga **https://**, więc serwer lokalny nadaje się do testów i synchronizacji między przeglądarkami na tym samym komputerze, ale nie do iPhone'a.

## Protokół (v1)

| Metoda | Ścieżka | Autoryzacja | Opis |
|---|---|---|---|
| GET | `/v1/health` | — | test serwera |
| POST | `/v1/register` | tokeny w treści | utworzenie konta (pierwsze urządzenie) |
| POST | `/v1/login` | token logowania (PBKDF2 z hasła) | zaszyfrowany nagłówek konta — nowe urządzenie |
| POST | `/v1/push` | `Bearer` token synchronizacji (HKDF z klucza danych) | wysłanie zaszyfrowanych rekordów |
| GET | `/v1/pull?acct=&since=` | `Bearer` | zmiany od numeru sekwencji |
| PUT | `/v1/header` | `Bearer` | zmiana hasła / kluczy dostępu |
| DELETE | `/v1/account` | `Bearer` | usunięcie danych z serwera |

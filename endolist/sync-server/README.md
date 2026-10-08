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

Ten adres wpisz w EndoList: **Ustawienia → Synchronizacja → Włącz synchronizację**.

Plan bezpłatny Workers + D1 powinien wystarczyć dla jednego gabinetu (aktualne limity: developers.cloudflare.com/d1/platform/limits). Jeden rekord może mieć maks. 1,9 MB (limit wiersza D1 to 2 MB).

## Pierwsze uruchomienie na iPhonie

1. Na komputerze: Ustawienia → Synchronizacja → **Włącz** (adres serwera, login, hasło).
2. Na iPhonie otwórz w Safari adres wersji internetowej EndoList (GitHub Pages, https://).
3. **„Mam konto na innym urządzeniu"** (lub „Konto z innego urządzenia" na ekranie logowania) → ten sam adres serwera, login i hasło.
4. Safari → Udostępnij → **Do ekranu początkowego** — EndoList ma wtedy własną ikonę i działa jak aplikacja.
5. Opcjonalnie: Ustawienia → Dodaj klucz dostępu → logowanie Face ID.

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

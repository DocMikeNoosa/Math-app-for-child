# Ochrona własności intelektualnej Usługodawcy

## Co jest chronione technicznie (Radiopis 1.1)
- **Kod serwera** (instrukcje dla AI, logika nauki, rozliczenia, bazy danych) nigdy nie opuszcza serwera. Serwer
  musi należeć do Ciebie — **klient nie dostaje dostępu do serwera, repozytorium ani kopii zapasowych**.
- **Kod przeglądarki** jest wydawany tylko zalogowanym użytkownikom z aktywną licencją, łączony, minimalizowany i
  zaciemniany (`npm run build`), bez map źródeł. Uwaga: kodu działającego w przeglądarce nie da się w pełni ukryć —
  dlatego najcenniejsze elementy (instrukcje AI, wiedza globalna, archiwum) są wyłącznie na serwerze.
- **Archiwum nauki i wiedza globalna**: osobna baza `learning.db`, dostęp tylko z konta właściciela (rola `admin`,
  zalecane 2FA); brak jakiegokolwiek interfejsu dla IT klienta, klienta lub użytkownika; wiedza globalna dodawana do
  zapytań AI po stronie serwera i nigdy nie wysyłana do przeglądarki; eksport tylko dla właściciela (z wpisem w dzienniku).
- **Konsola IT klienta**: tylko konta, hasła tymczasowe, blokady, problemy techniczne i zgłoszenia. Bez treści
  opisów, bez nauki, domyślnie nawet bez liczby opisów na osobę.
- **Trwałość**: archiwum tylko rośnie (brak funkcji kasowania lekcji), kopie codzienne (szyfrowane) obu baz, kopia
  poza serwerem, eksport JSONL — wiedza nie ginie i może być użyta do innych celów (np. nowy produkt, trenowanie modeli,
  analizy).
- `robots.txt` i nagłówek `noindex` dla aplikacji i paneli.

## Co musisz zabezpieczyć umową
- Regulamin (`/terms`, pkt 5–6) i umowa licencyjna: licencja niewyłączna na czas umowy; zakaz dekompilacji,
  scrapingu, tworzenia produktów konkurencyjnych i trenowania innych modeli na wynikach; wyniki uczenia i dane
  zanonimizowane są własnością Usługodawcy; licencja użytkownika na wykorzystanie zanonimizowanych poprawek.
- **Tajemnica przedsiębiorstwa** (art. 11 ust. 2 UZNK) chroni informacje, wobec których podjęto „rozsądne działania
  w celu utrzymania ich w poufności” — powyższe zabezpieczenia techniczne + klauzule poufności w umowach + NDA dla
  współpracowników to te działania. Zachowaj tę listę jako dowód.
- Autorskie prawa majątkowe do kodu: jeżeli ktoś (np. programista) tworzy kod — umowa z przeniesieniem praw.
- Nie przekazuj klientom pliku `.env`, kluczy, dostępu SSH ani kopii zapasowych; wdrożenie u klienta (on-premise)
  oznaczałoby przekazanie kodu serwera — w takim przypadku potrzebna odrębna, restrykcyjna umowa.

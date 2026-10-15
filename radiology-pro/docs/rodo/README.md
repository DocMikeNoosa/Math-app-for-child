# Radiopis — pakiet zgodności (RODO i inne wymogi)

> **Wzory do weryfikacji przez prawnika / IOD i doradcę regulacyjnego.** Oprogramowanie realizuje środki
> techniczne; zgodność prawna wymaga jeszcze dokumentów, umów i decyzji, których program nie zastąpi.
> Wersja 1.0, październik 2026.

## Co jest już wbudowane w aplikację (środki techniczne)

| Wymóg | Jak zrealizowano | Gdzie |
|---|---|---|
| Podstawa i przejrzystość (art. 5, 12–14) | Informacja o przetwarzaniu `/privacy`, regulamin `/terms`; akceptacja z **wersją i datą** przy pierwszym logowaniu i ponownie po każdej zmianie wersji | `termsVersion` w Ustawieniach, `users.terms_version/terms_at`, dziennik `terms.accept` |
| Minimalizacja (art. 5 ust. 1 lit. c) | PESEL usuwany przed AI i przed zapisem; bieżący opis i lista dzisiejszych opisów tylko w przeglądarce; serwer nie archiwizuje opisów | `scrubIdentifiers`, `hosted.js` |
| Prawo dostępu i przenoszenia (art. 15, 20) | „Pobierz kopię moich danych” — plik JSON | Konto → Twoje dane (RODO) |
| Prawo do usunięcia (art. 17) | Konto indywidualne: samodzielnie; w organizacji: dział IT („Usuń”). Usuwane: dane osobowe, sesje, dane synchronizowane, tokeny, pseudonim w archiwum nauki, e-mail z dziennika | `eraseUser()` |
| Sprzeciw / wyłączenie nauki (art. 21) | Wyłączenie nauki w module „Uczenie AI”; sprzeciw e-mailem | aplikacja, `/privacy` |
| Okresy przechowywania (art. 5 ust. 1 lit. e) | Dziennik 730 dni, kopie e-maili 90 dni, nieużywane sesje 7 dni, kopie zapasowe 14 dni — automatycznie (zadania co godzinę) | Ustawienia, `lib/jobs.js` |
| Bezpieczeństwo (art. 32) | HTTPS, scrypt, 2FA (TOTP), limity logowań, limit urządzeń, wylogowanie po bezczynności, role i separacja organizacji, szyfrowane kopie (AES-256-GCM), dziennik zdarzeń, brak haseł w kopiach e-maili, serwer w PL/UE | `tom-art32.md` |
| Rozliczalność (art. 5 ust. 2) | Dziennik zdarzeń (kto, co, kiedy), eksport CSV; ślad: która wersja wiedzy globalnej użyta w każdym zapytaniu AI | Admin → Dziennik |
| Anonimizacja danych do nauki | Archiwum nauki bez identyfikatorów użytkownika; usuwanie PESEL, dat, telefonów, e-maili, numerów, imion i nazwisk po tytułach; wiedza globalna tylko z lekcji ≥ K lekarzy (k-anonimowość) | `lib/learning.js`, `lib/global-learning.js` |

## Co musisz zrobić Ty (lista kontrolna przed sprzedażą)

1. **Role**: dla organizacji jesteś **podmiotem przetwarzającym** — podpisz z każdą firmą **umowę powierzenia**
   (`umowa-powierzenia.md`). Dla kont indywidualnych jesteś **administratorem**.
2. **Rejestry** (art. 30): uzupełnij `rejestr-czynnosci.md` (jako administrator i jako podmiot przetwarzający).
3. **DPIA** (art. 35): dane o zdrowiu + nowe technologie (AI) → ocena skutków jest praktycznie obowiązkowa
   (`dpia.md`). Kluczowe ryzyka: rozpoznawanie mowy w przeglądarce (dźwięk u Google/Microsoft), transfer do USA przy
   API Anthropic, dane pacjentów podyktowane mimo zakazu.
4. **Podmioty przetwarzające** (`podmioty-przetwarzajace.md`): zawrzyj umowy / zaakceptuj DPA dostawców (hosting, AI,
   e-mail, płatności). Rozważ Amazon Bedrock w UE zamiast API w USA.
5. **IOD**: oceń, czy musisz wyznaczyć inspektora ochrony danych (przetwarzanie danych o zdrowiu na dużą skalę → często tak).
6. **Procedura naruszeń** (`naruszenia.md`) — 72 godziny na zgłoszenie do UODO.
7. **Ustaw `BACKUP_KEY`** i przechowuj go poza serwerem; włącz 2FA na koncie właściciela.
8. **Dokumenty**: uzupełnij `[ ]` w `/privacy` i `/terms`, daj do sprawdzenia prawnikowi, potem podnieś `termsVersion`.
9. **Inne wymogi** — `inne-wymogi.md` (MDR, AI Act, KSeF, regulamin UŚUDE, NIS2 u klientów).
10. **Ochrona własności intelektualnej** — `ochrona-ip.md`.

# Ocena skutków dla ochrony danych (DPIA, art. 35 RODO) — konspekt

**Do przeprowadzenia przed wdrożeniem produkcyjnym (z IOD / prawnikiem).** Przesłanki: dane o zdrowiu (art. 9),
nowe technologie (AI), potencjalnie duża skala (setki lekarzy) — wykaz UODO operacji wymagających DPIA.

1. **Opis przetwarzania**: przepływ dyktat → przeglądarka (rozpoznawanie mowy) → serwer RadVox Pro → model AI →
   projekt opisu → lekarz kopiuje do RIS. Dane kont, dane o korzystaniu, archiwum nauki (zanonimizowane).
2. **Niezbędność i proporcjonalność**: minimalizacja (brak archiwum opisów, usuwanie PESEL), retencja, podstawy prawne.
3. **Ryzyka i środki**

| Ryzyko | Prawdopodobieństwo / skutek | Środki | Ryzyko rezydualne |
|---|---|---|---|
| Lekarz podyktuje imię i nazwisko pacjenta | średnie / wysoki | szkolenie, komunikat przy akceptacji regulaminu, PESEL usuwany, anonimizacja archiwum, brak archiwum opisów | [ocenić] |
| Rozpoznawanie mowy w przeglądarce wysyła dźwięk do Google / Microsoft | wysokie / wysoki | informacja w `/privacy`; **rozważyć** dostawcę mowy w UE z umową powierzenia | [ocenić — kluczowe] |
| Transfer do USA (API Anthropic) | pewne przy wariancie A / średni | SCC/DPF, umowa z dostawcą, **wariant Bedrock UE** | [ocenić] |
| Przejęcie konta | niskie / wysoki | 2FA, limity, wylogowanie po bezczynności, dziennik | niskie |
| Ponowna identyfikacja z archiwum nauki | niskie / średni | usuwanie identyfikatorów, k ≥ 3 lekarzy, dostęp tylko właściciela | niskie |
| Utrata danych | niskie / średni | kopie codzienne, szyfrowane, poza serwerem, test odtworzenia | niskie |
| Błąd AI w opisie (bezpieczeństwo pacjenta) | średnie / wysoki | lekarz zatwierdza każdy opis, mechanizm kontroli krzyżowej, oznaczenie zmian | [ocenić — także MDR] |

4. **Konsultacje**: IOD, ewentualnie przedstawiciele użytkowników; w razie wysokiego ryzyka rezydualnego —
   uprzednie konsultacje z Prezesem UODO (art. 36).

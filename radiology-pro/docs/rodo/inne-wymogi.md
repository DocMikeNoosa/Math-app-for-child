# Inne wymogi prawne poza RODO — do weryfikacji

**Stan wiedzy autora oprogramowania, nie porada prawna. Każdy punkt potwierdź u specjalisty.**

1. **Wyrób medyczny (MDR 2017/745)** — oprogramowanie, które dostarcza informacji wykorzystywanych do decyzji
   diagnostycznych, może być wyrobem medycznym (reguła 11 → zwykle klasa IIa lub wyższa, z udziałem jednostki
   notyfikowanej). Radiopis redaguje tekst z dyktatu, ale także porządkuje ustalenia według pilności i proponuje
   wnioski — **to wymaga opinii doradcy regulacyjnego przed sprzedażą**. Polski organ: URPL. Wersjonowanie wiedzy
   globalnej z akceptacją właściciela i ślad wersji w zapytaniach ułatwia kontrolę zmian, jeśli MDR będzie miało
   zastosowanie.
2. **AI Act (rozporządzenie 2024/1689)** — jeżeli Radiopis okaże się wyrobem medycznym wymagającym oceny przez
   jednostkę notyfikowaną, będzie systemem AI wysokiego ryzyka (obowiązki m.in. zarządzanie ryzykiem, dane, dokumentacja,
   nadzór człowieka, rejestrowanie zdarzeń). Niezależnie od tego: obowiązek kompetencji w zakresie AI (art. 4) oraz
   obowiązki przejrzystości. Daty stosowania poszczególnych obowiązków — sprawdzić aktualny stan.
3. **Ustawa o świadczeniu usług drogą elektroniczną** — regulamin udostępniony przed zawarciem umowy (jest: `/terms`).
4. **KSeF** — faktury ustrukturyzowane dla firm (sprawdź aktualny harmonogram obowiązku); podłącz program księgowy.
5. **Ustawa o prawach pacjenta / dokumentacja medyczna** — dokumentacją jest opis w RIS placówki; Radiopis jej nie
   przechowuje (projekt opisu w przeglądarce). Potwierdź z klientami.
6. **Tajemnica lekarska** — dyktat bez danych identyfikujących; umowa powierzenia z klientem.
7. **Cyberbezpieczeństwo (NIS2 / ustawa o KSC)** — podmioty lecznicze mogą być podmiotami kluczowymi / ważnymi i
   wymagać od dostawców bezpieczeństwa łańcucha dostaw — przygotuj opis zabezpieczeń (`tom-art32.md`).
8. **Prawo konsumenckie** — nie dotyczy (usługa B2B); jeżeli lekarze kupują jako osoby fizyczne prowadzące
   działalność — sprawdź uprawnienia „przedsiębiorcy na prawach konsumenta”.
9. **Znak towarowy** — nazwa „Radiopis” nie była sprawdzona w rejestrach UPRP / EUIPO.

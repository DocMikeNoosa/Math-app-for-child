# Umowa powierzenia przetwarzania danych osobowych (wzór, art. 28 RODO)

**Wzór do weryfikacji przez prawnika.**

zawarta w dniu [data] pomiędzy **[Organizacja — nazwa, adres, NIP]** („Administrator”) a **[Usługodawca — nazwa,
adres, NIP]** („Podmiot przetwarzający”), w związku z umową licencyjną na korzystanie z usługi Radiopis z dnia [data]
(„Umowa główna”).

## § 1. Przedmiot, charakter i cel
1. Administrator powierza przetwarzanie danych osobowych w zakresie niezbędnym do świadczenia usługi Radiopis
   (przygotowywanie projektów opisów badań obrazowych na podstawie dyktatu, zarządzanie kontami użytkowników).
2. Charakter przetwarzania: przechowywanie, przesyłanie do modelu AI, porządkowanie, usuwanie.
3. Czas: przez okres obowiązywania Umowy głównej.

## § 2. Kategorie osób i danych
- **Użytkownicy** (lekarze, personel IT Administratora): imię i nazwisko, e-mail, numer PWZ, dane techniczne
  (IP, przeglądarka, czas logowania), dane o korzystaniu, szablony i materiał nauki stylu.
- **Pacjenci** (wyłącznie gdy mimo zaleceń zostaną podyktowani): dane zawarte w treści dyktatu, w tym dane o zdrowiu
  (art. 9 RODO). Administrator zobowiązuje się instruować użytkowników, by nie dyktowali danych identyfikujących.

## § 3. Obowiązki Podmiotu przetwarzającego
1. Przetwarza dane wyłącznie na udokumentowane polecenie Administratora (niniejsza umowa i Umowa główna).
2. Zapewnia, że osoby upoważnione zobowiązały się do zachowania tajemnicy.
3. Stosuje środki z art. 32 RODO opisane w Załączniku nr 1 (`tom-art32.md`).
4. Korzysta z dalszych podmiotów przetwarzających z Załącznika nr 2 (`podmioty-przetwarzajace.md`); o zmianach
   informuje z [14]-dniowym wyprzedzeniem, Administrator może wnieść sprzeciw.
5. Pomaga Administratorowi w realizacji praw osób (eksport danych, usuwanie kont — funkcje dostępne w konsoli IT
   i na stronie konta) oraz w obowiązkach z art. 32–36.
6. Zgłasza Administratorowi naruszenie ochrony danych **bez zbędnej zwłoki, nie później niż w [24] godziny**
   od jego stwierdzenia.
7. Po zakończeniu umowy usuwa dane osobowe (konta zostają zanonimizowane w ciągu [30] dni, kopie zapasowe wygasają
   po [14] dniach), chyba że prawo wymaga ich przechowywania.
8. Udostępnia informacje niezbędne do wykazania zgodności i umożliwia audyty (po uzgodnieniu terminu, na koszt
   Administratora, z zachowaniem tajemnicy przedsiębiorstwa Podmiotu przetwarzającego).

## § 4. Dane zanonimizowane i wyniki uczenia
1. Administrator przyjmuje do wiadomości, że Podmiot przetwarzający — po **nieodwracalnej anonimizacji** — wykorzystuje
   poprawki i wzorce stylu do ulepszania usługi. Dane zanonimizowane nie są danymi osobowymi; wyniki uczenia stanowią
   własność i tajemnicę przedsiębiorstwa Podmiotu przetwarzającego.
2. Do czasu usunięcia konta archiwum przechowuje wyłącznie pseudonim użytkownika (HMAC z tajnym kluczem) służący do
   zliczania, ilu różnych lekarzy wniosło daną poprawkę; jest on usuwany wraz z kontem.
   [Prawnik: potwierdzić podstawę — art. 6 ust. 4 RODO / odrębne postanowienie Umowy głównej.]

## § 5. Przekazywanie poza EOG
[Wariant A: przetwarzanie AI w UE (Amazon Bedrock, region eu-central-1).] [Wariant B: Anthropic PBC (USA) —
standardowe klauzule umowne / Data Privacy Framework; Administrator wyraża zgodę.]

## § 6. Postanowienia końcowe
[Odpowiedzialność, prawo właściwe, sąd, załączniki: 1 — środki techniczne i organizacyjne; 2 — lista dalszych
podmiotów przetwarzających.]

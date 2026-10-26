# PowerMic 4 — odczyt kodu czerwonej diody (instrukcja dla działu IT)

**Cel:** RadVox steruje przyciskiem PowerMic 4, ale nie zna polecenia, którym oprogramowanie Nuance zapala czerwoną
diodę nagrywania (producent go nie publikuje). Odczytamy je z komunikacji USB, gdy diodę zapala program Nuance
(Dragon Medical One / PowerScribe / inny, w którym dioda działa). Trwa to ok. 15 minut, nic nie zmienia w systemie
poza instalacją dwóch darmowych, powszechnie używanych narzędzi (można je potem odinstalować). Nie są przesyłane
żadne dane pacjentów — rejestrujemy tylko ruch USB mikrofonu przez minutę, w ciszy (bez dyktowania).

Urządzenie: **PowerMic 4**, USB VID **0x0554**, PID **0x0064** (kolekcja HID 0xFFA0/0x0001; raport wyjściowy 0,
9 bajtów).

## 1. Instalacja (jednorazowo, wymaga uprawnień administratora)

1. Pobierz **Wireshark** dla Windows ze strony https://www.wireshark.org/download.html i zainstaluj.
2. W instalatorze zaznacz **„Install USBPcap”** (to składnik do podglądu USB). Po instalacji uruchom ponownie komputer.

## 2. Nagranie (ok. 1 minuty)

1. Podłącz PowerMic 4. Uruchom program Nuance, w którym dioda **działa** (np. Dragon Medical One / PowerScribe).
   RadVox i inne przeglądarki z RadVox — **zamknij**.
2. Uruchom Wireshark **jako administrator**. Na liście interfejsów pojawią się **USBPcap1**, **USBPcap2**…
   Wybierz ten, do którego podłączony jest PowerMic (jeśli nie wiesz — zrób próbę po kolei; właściwy pokazuje
   pakiety, gdy poruszasz kulką PowerMica).
3. Kliknij start (niebieska płetwa) i **od razu**:
   - naciśnij na PowerMicu przycisk nagrywania (**dioda się zapala**), odczekaj 3 sekundy,
   - naciśnij ponownie (**dioda gaśnie**), odczekaj 3 sekundy,
   - powtórz to **3 razy**.
4. Zatrzymaj nagrywanie (czerwony kwadrat).

## 3. Odczyt

1. W polu filtra wpisz i zatwierdź Enterem:

   ```
   usb.setup.bRequest == 0x09 || (usb.transfer_type == 0x01 && usb.endpoint_address.direction == 0)
   ```

   (pokazuje tylko komunikaty **od komputera do mikrofonu**: SET_REPORT oraz przerwania OUT).
2. Powinno zostać kilka pakietów pojawiających się w rytm włączania / wyłączania diody.
3. Zapisz plik: **File → Save As…** (format `.pcapng`) — oraz zrób zrzut ekranu listy pakietów z rozwiniętymi
   bajtami danych (dolny panel, sekcja „Data” / „HID Data” / „Data Fragment”).

## 4. Co odesłać

- plik `.pcapng` (jest mały — zawiera tylko ruch USB z tej minuty), **albo**
- zrzut ekranu z bajtami danych pakietów przy **zapaleniu** i przy **zgaszeniu** diody.

Wystarczy przekazać to lekarzowi (właścicielowi RadVox) — kod zostanie wpisany w RadVox:
**⚙ Ustawienia → Diagnostyka mikrofonu → „Kod czerwonej diody”** (pola „włącz” i „wyłącz”, bajty szesnastkowo,
np. `00 01 00 00 00 00 00 00 00`).

## Bezpieczeństwo

- Wireshark z USBPcap tylko **odczytuje** ruch USB; niczego nie wysyła do urządzenia.
- PowerMic jest też mikrofonem USB, więc nagranie może zawierać dźwięk otoczenia z tej minuty. Dlatego w trakcie
  **nic nie mów i nie dyktuj** (wystarczy naciskać przycisk) — wtedy plik nie zawiera żadnych danych pacjentów.
- Po zakończeniu Wireshark i USBPcap można odinstalować (Panel sterowania → Programy).

# Procedura postępowania w razie naruszenia ochrony danych (art. 33–34 RODO)

1. **Wykrycie** (alert, zgłoszenie IT klienta, nietypowe wpisy w dzienniku): zapisz datę i godzinę stwierdzenia.
2. **Ograniczenie skutków** (od razu): zablokuj konta / „wyloguj ze wszystkich urządzeń”, zmień hasła i klucze
   (`ANTHROPIC_API_KEY`, `ADMIN_PASSWORD`), w razie potrzeby komunikat w aplikacji lub zatrzymanie usługi.
3. **Ocena**: jakie dane, ilu osób, czy dane o zdrowiu, czy zaszyfrowane (kopie z `BACKUP_KEY` — ryzyko niskie).
4. **Powiadomienia**:
   - jako **podmiot przetwarzający** — powiadom każdą dotkniętą organizację w terminie z umowy powierzenia
     (wzór: 24 h);
   - jako **administrator** (konta indywidualne) — zgłoszenie do **Prezesa UODO w 72 godziny** (formularz na
     biznes.gov.pl), a przy wysokim ryzyku — zawiadomienie osób, których dane dotyczą.
5. **Dokumentacja**: każde naruszenie (także niezgłaszane) wpisz do rejestru naruszeń: data, opis, skutki, decyzja,
   działania naprawcze.
6. **Przegląd**: co poprawić, aby się nie powtórzyło.

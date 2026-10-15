# Środki techniczne i organizacyjne (art. 32 RODO) — Załącznik 1 do umowy powierzenia

## Techniczne (wbudowane w Radiopis 1.1)
- **Szyfrowanie w transmisji**: HTTPS (TLS) z automatycznym certyfikatem; HSTS; aplikacja niedostępna bez proxy.
- **Szyfrowanie kopii**: kopie zapasowe obu baz szyfrowane AES-256-GCM (klucz z hasła `BACKUP_KEY`, scrypt).
- **Uwierzytelnianie**: hasła min. 10 znaków (litera + cyfra) przechowywane jako skrót scrypt; logowanie dwuetapowe
  (TOTP); hasła tymczasowe wymuszają zmianę przy pierwszym logowaniu; limit 8 nieudanych prób na konto / 15 min.
- **Sesje**: losowy token w ciasteczku HttpOnly/Secure/SameSite, serwer przechowuje tylko skrót; wylogowanie po
  7 dniach bezczynności; limit jednocześnie zalogowanych urządzeń; „wyloguj ze wszystkich urządzeń”.
- **Kontrola dostępu**: role (właściciel / IT organizacji / lekarz); IT widzi wyłącznie konta własnej organizacji;
  archiwum nauki i wiedza globalna dostępne tylko dla właściciela; ochrona CSRF; nagłówki bezpieczeństwa (CSP).
- **Minimalizacja**: PESEL usuwany przed AI; opisy nie są archiwizowane na serwerze; anonimizacja archiwum nauki.
- **Rozliczalność**: dziennik zdarzeń (logowania, zmiany kont, eksporty, akceptacje regulaminu, publikacje wiedzy
  globalnej); ślad wersji wiedzy globalnej w każdym zapytaniu AI; dzienniki serwera bez treści medycznych.
- **Dostępność i odporność**: kopie codzienne + kopia poza serwerem (`offsite-backup.sh`), procedura odtworzenia
  (`restore.sh`), monitoring `/healthz`, kolejka AI chroniąca przed przeciążeniem, łagodne zatrzymanie przy
  aktualizacjach, automatyczne aktualizacje bezpieczeństwa systemu, zapora, fail2ban.
- **Retencja**: automatyczne usuwanie starych wpisów dziennika, kopii e-maili i sesji.

## Organizacyjne (do wdrożenia przez Usługodawcę)
- Upoważnienia i zobowiązania do poufności dla osób z dostępem do serwera.
- Klucz `BACKUP_KEY` i hasła administratora w menedżerze haseł; 2FA na koncie właściciela i u dostawców (hosting, AI).
- Okresowy test odtworzenia kopii (np. co kwartał) i przegląd uprawnień.
- Procedura naruszeń (`naruszenia.md`), szkolenie użytkowników (nie dyktować danych identyfikujących).

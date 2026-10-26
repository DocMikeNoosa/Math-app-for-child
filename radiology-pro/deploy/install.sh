#!/usr/bin/env bash
# RadVox Pro — installation in one line, for a fresh Ubuntu 24.04 server (e.g. AWS Lightsail, Frankfurt).
# In the server's terminal (Lightsail: "Connect using SSH") paste:
#
#   curl -fsSL https://raw.githubusercontent.com/DocMikeNoosa/Math-app-for-child/claude/polish-radiology-dictation-e0ov8p/radiology-pro/deploy/install.sh | sudo bash
#
# It asks a few questions (domain, e-mail, password, AI key), checks the domains, downloads RadVox Pro, secures the
# server (setup-server.sh), writes the settings (.env) and starts everything. Running it again = update.
# For tests: RADVOX_DRY=1 (only the questions and the settings file, in RADVOX_DIR).
set -euo pipefail

REPO="${RADVOX_REPO:-https://github.com/DocMikeNoosa/Math-app-for-child.git}"
BRANCH="${RADVOX_BRANCH:-claude/polish-radiology-dictation-e0ov8p}"
DIR="${RADVOX_DIR:-/opt/radvox-pro}"
DRY="${RADVOX_DRY:-0}"
DEPLOY="$DIR/radiology-pro/deploy"

say() { printf '\n\033[1;36m%s\033[0m\n' "$*"; }
ok() { printf '  \033[1;32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[1;33m!\033[0m %s\n' "$*"; }
die() { printf '\n\033[1;31mBłąd: %s\033[0m\n' "$*"; exit 1; }

# questions come from the keyboard even when this script itself arrives through "curl … | sudo bash"
if [ -t 0 ]; then exec 3<&0; elif (exec 3</dev/tty) 2>/dev/null; then exec 3</dev/tty; else exec 3<&0; fi
ask() { # ask VAR "question" "default"
  local reply
  if [ -n "${3:-}" ]; then printf '%s [%s]: ' "$2" "$3"; else printf '%s: ' "$2"; fi
  IFS= read -r reply <&3 || true
  printf -v "$1" '%s' "${reply:-${3:-}}"
}
ask_secret() { # ask_secret VAR "question"
  local reply
  printf '%s: ' "$2"
  IFS= read -rs reply <&3 || true
  printf '\n'
  printf -v "$1" '%s' "$reply"
}

if [ "$DRY" != "1" ]; then
  [ "$(id -u)" -eq 0 ] || die "uruchom z sudo:  curl -fsSL … | sudo bash"
  . /etc/os-release
  [ "${ID:-}" = "ubuntu" ] || die "ten instalator jest dla Ubuntu 24.04 (wykryto: ${PRETTY_NAME:-?})."
fi

# ---------------------------------------------------------------- update of an existing installation
if [ -f "$DEPLOY/.env" ] && [ "$DRY" != "1" ]; then
  say "RadVox Pro jest już zainstalowany — aktualizuję do najnowszej wersji"
  git -C "$DIR" fetch -q origin "$BRANCH" && git -C "$DIR" checkout -q "$BRANCH" && git -C "$DIR" reset -q --hard "origin/$BRANCH"
  cd "$DEPLOY" && docker compose up -d --build
  ok "Zaktualizowano. Zmiany działają od razu (trwające dyktowanie nie jest przerywane)."
  exit 0
fi

cat <<'TXT'

  ┌──────────────────────────────────────────────────────────────┐
  │  RadVox Pro — instalacja                                     │
  │  Odpowiedz na kilka pytań. W nawiasach [ ] jest propozycja — │
  │  wystarczy nacisnąć Enter, aby ją przyjąć.                   │
  └──────────────────────────────────────────────────────────────┘
TXT

# ---------------------------------------------------------------- questions
say "1/5  Adres strony"
ask MAIN "Główna domena (adres, pod którym działa RadVox Pro)" "radvox.ai"
MAIN="$(printf '%s' "$MAIN" | tr 'A-Z' 'a-z' | sed -E 's#^https?://##; s#/.*$##; s/^www\.//')"
[[ "$MAIN" =~ ^[a-z0-9-]+(\.[a-z0-9-]+)+$ ]] || die "„$MAIN” nie wygląda na domenę (np. radvox.ai)."
ask OTHERS "Pozostałe domeny, oddzielone spacją (przekierują na główną)" "radvox.pl radvox.eu"
EXTRA="www.$MAIN"
for d in $OTHERS; do
  d="$(printf '%s' "$d" | tr 'A-Z' 'a-z' | sed -E 's#^https?://##; s#/.*$##; s/^www\.//')"
  [[ "$d" =~ ^[a-z0-9-]+(\.[a-z0-9-]+)+$ ]] || die "„$d” nie wygląda na domenę."
  [ "$d" = "$MAIN" ] && continue
  EXTRA="$EXTRA $d www.$d"
done

say "2/5  Twoje konto administratora"
ask EMAIL "Twój e-mail (login do panelu administratora i powiadomienia o certyfikacie)" ""
[[ "$EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] || die "to nie wygląda na adres e-mail."
while :; do
  echo "Hasło administratora: min. 10 znaków, litera i cyfra; bez spacji, cudzysłowów, # i \$. (Nie widać go przy pisaniu.)"
  ask_secret PASS "Hasło"
  ask_secret PASS2 "Powtórz hasło"
  if [ "$PASS" != "$PASS2" ]; then warn "hasła się różnią — spróbuj jeszcze raz"; continue; fi
  if [ ${#PASS} -lt 10 ] || ! [[ "$PASS" =~ [A-Za-z] ]] || ! [[ "$PASS" =~ [0-9] ]]; then warn "za słabe: min. 10 znaków, litera i cyfra"; continue; fi
  if [[ "$PASS" =~ [[:space:]\"\'#\$\\\`] ]]; then warn "bez spacji, cudzysłowów, # \$ \\ i \` — spróbuj jeszcze raz"; continue; fi
  break
done

say "3/5  Sztuczna inteligencja"
echo "Klucz API Anthropic (zaczyna się od sk-ant-; z platform.claude.com → API keys)."
echo "Możesz go dodać później — wtedy naciśnij Enter (aplikacja ruszy, ale AI nie będzie działać)."
ask_secret AIKEY "Klucz API"
if [ -n "$AIKEY" ] && ! [[ "$AIKEY" =~ ^sk-ant-[A-Za-z0-9_-]{20,}$ ]]; then die "to nie wygląda na klucz API (zaczyna się od sk-ant-). Uruchom instalator jeszcze raz."; fi

say "4/5  Wysyłanie e-maili (opcjonalne)"
echo "Klucz z resend.com (zaczyna się od re_) — do e-maili z linkami, zaproszeniami, przypomnieniami."
echo "Bez niego e-maile są widoczne tylko w panelu administratora. Enter = później."
ask_secret RESEND "Klucz Resend"

# ---------------------------------------------------------------- domains → this server
say "5/5  Sprawdzam domeny"
IP="$(curl -fsS --max-time 8 https://checkip.amazonaws.com 2>/dev/null | tr -d '[:space:]' || true)"
[ -n "$IP" ] && ok "adres tego serwera: $IP" || warn "nie udało się ustalić adresu IP serwera"
DNS_BAD=""
for d in $MAIN $EXTRA; do
  got="$(getent ahostsv4 "$d" 2>/dev/null | awk 'NR==1{print $1}' || true)"
  if [ -n "$IP" ] && [ "$got" = "$IP" ]; then ok "$d → $got"
  else warn "$d → ${got:-brak} (powinno być ${IP:-IP serwera})"; DNS_BAD="$DNS_BAD $d"; fi
done
if [ -n "$DNS_BAD" ]; then
  echo
  echo "  Nie wszystkie domeny wskazują jeszcze na ten serwer. To nic złego — instalacja przebiegnie,"
  echo "  a kłódka (HTTPS) pojawi się sama, gdy u rejestratora domen ustawisz rekordy A na ${IP:-IP serwera}"
  echo "  (zwykle od kilku minut do kilku godzin)."
fi

# ---------------------------------------------------------------- download + secure the server
if [ "$DRY" != "1" ]; then
  say "Instaluję (5–10 minut — nic nie trzeba robić)"
  apt-get update -q >/dev/null && apt-get install -yq git curl openssl >/dev/null
  if [ -d "$DIR/.git" ]; then git -C "$DIR" fetch -q origin "$BRANCH" && git -C "$DIR" checkout -q "$BRANCH" && git -C "$DIR" reset -q --hard "origin/$BRANCH"
  else rm -rf "$DIR"; git clone -q --branch "$BRANCH" --depth 1 "$REPO" "$DIR"; fi
  ok "pobrano RadVox Pro"
  bash "$DEPLOY/setup-server.sh" >/tmp/radvox-setup.log 2>&1 || { tail -20 /tmp/radvox-setup.log; die "przygotowanie serwera nie powiodło się (szczegóły powyżej)"; }
  ok "serwer zabezpieczony (zapora, automatyczne aktualizacje, Docker)"
fi

# ---------------------------------------------------------------- settings
mkdir -p "$DEPLOY"
ENVF="$DEPLOY/.env"
[ -f "$DEPLOY/.env.example" ] && cp "$DEPLOY/.env.example" "$ENVF" || : > "$ENVF"
setv() { # setv KEY VALUE — replace the line KEY=… (or add it)
  local k="$1" v="$2" tmp
  tmp="$(mktemp)"
  grep -v -E "^${k}=" "$ENVF" > "$tmp" || true
  printf '%s=%s\n' "$k" "$v" >> "$tmp"
  cat "$tmp" > "$ENVF"; rm -f "$tmp"
}
BACKUP_KEY="$(openssl rand -base64 32 | tr -d '\n')"
KEYS_SECRET="$(openssl rand -base64 32 | tr -d '\n')"
setv DOMAIN "$MAIN"
setv EXTRA_DOMAINS "$EXTRA"
setv PUBLIC_URL "https://$MAIN"
setv ACME_EMAIL "$EMAIL"
setv ADMIN_EMAIL "$EMAIL"
setv ADMIN_PASSWORD "$PASS"
setv AI_PROVIDER "anthropic"
setv ANTHROPIC_API_KEY "$AIKEY"
setv RESEND_API_KEY "$RESEND"
setv MAIL_FROM "RadVox Pro <no-reply@$MAIN>"
setv SUPPORT_EMAIL "$EMAIL"
setv BACKUP_KEY "$BACKUP_KEY"
setv KEYS_SECRET "$KEYS_SECRET"
chmod 600 "$ENVF"
ok "ustawienia zapisane (plik .env — tylko na tym serwerze)"

if [ "$DRY" = "1" ]; then ok "test (RADVOX_DRY=1): bez instalacji i uruchamiania"; exit 0; fi

# ---------------------------------------------------------------- start
say "Uruchamiam RadVox Pro (pierwszy start: 3–6 minut)"
cd "$DEPLOY"
docker compose up -d --build >/tmp/radvox-start.log 2>&1 || { tail -30 /tmp/radvox-start.log; die "nie udało się uruchomić (szczegóły powyżej)"; }
for i in $(seq 1 90); do
  st="$(docker inspect --format '{{.State.Health.Status}}' "$(docker compose ps -q app)" 2>/dev/null || true)"
  [ "$st" = "healthy" ] && break
  sleep 4
done
[ "$st" = "healthy" ] && ok "aplikacja działa" || { docker compose logs --tail 30 app; die "aplikacja nie wystartowała (szczegóły powyżej)"; }

# "radvox-update": one word to install a newer version later
cat > /usr/local/bin/radvox-update <<UPD
#!/usr/bin/env bash
set -e
git -C "$DIR" fetch -q origin "$BRANCH" && git -C "$DIR" reset -q --hard "origin/$BRANCH"
cd "$DEPLOY" && docker compose up -d --build
echo "RadVox Pro zaktualizowany."
UPD
chmod +x /usr/local/bin/radvox-update

cat <<TXT

  ┌──────────────────────────────────────────────────────────────┐
  │  GOTOWE — RadVox Pro działa                                  │
  └──────────────────────────────────────────────────────────────┘

  Zaloguj się:   https://$MAIN/login
                 e-mail: $EMAIL   (hasło: to, które wpisałeś)
TXT
[ -n "$DNS_BAD" ] && printf '\n  Uwaga: domeny%s jeszcze nie wskazują na %s — strona otworzy się,\n  gdy ustawisz rekordy A u rejestratora domen (kłódka pojawi się sama).\n' "$DNS_BAD" "${IP:-ten serwer}"
cat <<TXT

  ZAPISZ TERAZ w bezpiecznym miejscu (menedżer haseł / kartka w sejfie) — klucz kopii zapasowych:

      $BACKUP_KEY

  Bez niego kopii bazy nie da się odczytać. Nie wysyłaj go nikomu.

  Aktualizacja w przyszłości: wpisz   sudo radvox-update
TXT

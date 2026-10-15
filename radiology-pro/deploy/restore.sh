#!/usr/bin/env bash
# Restore a database from a backup file. Usage (in the deploy folder):
#   sudo bash restore.sh data/backups/radiopis-20261015-0310.db[.enc]     → accounts database
#   sudo bash restore.sh data/backups/learning-20261015-0310.db[.enc]     → learning archive
# Encrypted copies (.enc) are decrypted with BACKUP_KEY from .env. The current file is kept as *.before-restore-<time>.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
BACKUP="${1:-}"
[ -f "$BACKUP" ] || { echo "Podaj plik kopii, np.: bash restore.sh data/backups/radiopis-20261015-0310.db.enc"; ls -1t data/backups 2>/dev/null | head -6; exit 1; }
case "$(basename "$BACKUP")" in
  radiopis-*) TARGET=radiopis.db ;;
  learning-*) TARGET=learning.db ;;
  *) echo "Nieznany plik (oczekiwano radiopis-… lub learning-…)."; exit 1 ;;
esac
SRC="$BACKUP"
if [[ "$BACKUP" == *.enc ]]; then
  echo "==> Odszyfrowuję (BACKUP_KEY z .env)"
  REL="${BACKUP#data/}"
  docker compose run --rm --no-deps -T app node --disable-warning=ExperimentalWarning scripts/decrypt-backup.mjs "/data/$REL" /data/restore-tmp.db
  SRC=data/restore-tmp.db
fi
sqlite3 "$SRC" "PRAGMA integrity_check;" | grep -qx ok || { echo "Plik kopii jest uszkodzony: $BACKUP"; exit 1; }
echo "==> Zatrzymuję aplikację"
docker compose stop app
STAMP=$(date +%Y%m%d-%H%M%S)
[ -f "data/$TARGET" ] && mv "data/$TARGET" "data/$TARGET.before-restore-$STAMP"
rm -f "data/$TARGET-wal" "data/$TARGET-shm"
if [ "$SRC" = data/restore-tmp.db ]; then mv "$SRC" "data/$TARGET"; else cp "$SRC" "data/$TARGET"; fi
chown 1000:1000 "data/$TARGET"
echo "==> Uruchamiam aplikację"
docker compose start app
echo "Przywrócono data/$TARGET z $BACKUP (poprzedni plik: data/$TARGET.before-restore-$STAMP)."

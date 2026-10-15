#!/usr/bin/env bash
# Restore the database from a backup file. Usage:  sudo bash restore.sh data/backups/radiopis-20261015-0310.db
# The current database is kept as data/radiopis.db.before-restore-<time>.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP="${1:-}"
[ -f "$BACKUP" ] || { echo "Podaj plik kopii, np.: bash restore.sh data/backups/radiopis-20261015-0310.db"; ls -1 "$SCRIPT_DIR/data/backups" 2>/dev/null | tail -5; exit 1; }
sqlite3 "$BACKUP" "PRAGMA integrity_check;" | grep -qx ok || { echo "Plik kopii jest uszkodzony: $BACKUP"; exit 1; }
cd "$SCRIPT_DIR"
echo "==> Zatrzymuję aplikację"
docker compose stop app
STAMP=$(date +%Y%m%d-%H%M%S)
[ -f data/radiopis.db ] && mv data/radiopis.db "data/radiopis.db.before-restore-$STAMP"
rm -f data/radiopis.db-wal data/radiopis.db-shm
cp "$BACKUP" data/radiopis.db
chown 1000:1000 data/radiopis.db
echo "==> Uruchamiam aplikację"
docker compose start app
echo "Przywrócono z $BACKUP (poprzednia baza: data/radiopis.db.before-restore-$STAMP)."

#!/usr/bin/env bash
# Copy the daily database backups to a second place (another data centre / object storage in the EU).
# The app already makes a backup every day into ./data/backups — this script only copies them off the server.
# Needs rclone (apt-get install rclone) with a remote named "offsite" configured once by `rclone config`
# (e.g. S3-compatible object storage of OVHcloud / Scaleway / Backblaze EU, or another server via SFTP).
# Cron (every night at 03:30):  30 3 * * * /opt/radiopis/radiology-pro/deploy/offsite-backup.sh >> /var/log/radiopis-offsite.log 2>&1
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/data/backups"
DEST="${OFFSITE_DEST:-offsite:radiopis-backups}"
command -v rclone >/dev/null || { echo "Brak rclone: apt-get install rclone"; exit 1; }
ls "$SRC"/radiopis-*.db >/dev/null 2>&1 || { echo "$(date -Is) brak kopii w $SRC"; exit 1; }
# copy (not sync): copies deleted locally after 14 days stay off-site; set a lifecycle rule there (e.g. 90 days)
rclone copy "$SRC" "$DEST" --include "radiopis-*.db" --immutable
echo "$(date -Is) OK: $(ls "$SRC" | wc -l) plików w $SRC → $DEST"

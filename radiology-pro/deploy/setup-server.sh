#!/usr/bin/env bash
# One-time preparation of a fresh Ubuntu 24.04 LTS server for RadVox Pro.
# Run as root:  sudo bash setup-server.sh
# Installs: Docker (official repository), firewall (only SSH, HTTP, HTTPS open), automatic security updates,
# fail2ban (SSH brute-force protection), swap (if RAM < 4 GB), time zone Europe/Warsaw.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then echo "Uruchom jako root: sudo bash setup-server.sh"; exit 1; fi
. /etc/os-release
if [ "${ID:-}" != "ubuntu" ]; then echo "Ten skrypt jest dla Ubuntu (wykryto: ${PRETTY_NAME:-?})."; exit 1; fi
export DEBIAN_FRONTEND=noninteractive

echo "==> Aktualizacja systemu"
apt-get update -q
apt-get upgrade -yq
apt-get install -yq ca-certificates curl git ufw unattended-upgrades fail2ban sqlite3

echo "==> Docker (oficjalne repozytorium)"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get install -yq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
systemctl enable --now docker

echo "==> Zapora: otwarte tylko SSH (22), HTTP (80), HTTPS (443)"
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp
ufw --force enable

echo "==> Automatyczne aktualizacje bezpieczeństwa"
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'CONF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
CONF
systemctl enable --now unattended-upgrades fail2ban

echo "==> Strefa czasowa"
timedatectl set-timezone Europe/Warsaw || true

MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$MEM_MB" -lt 3800 ] && [ ! -f /swapfile ]; then
  echo "==> Plik wymiany 2 GB (pamięć: ${MEM_MB} MB)"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# the app runs as user "node" (uid 1000) inside the container: it must be able to write the data folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mkdir -p "$SCRIPT_DIR/data/backups"
chown -R 1000:1000 "$SCRIPT_DIR/data"

echo
echo "Gotowe. Dalej:"
echo "  1. cd $SCRIPT_DIR && cp .env.example .env && nano .env      (uzupełnij domenę, hasło administratora, klucz AI)"
echo "  2. docker compose up -d --build"
echo "  3. otwórz https://TWOJA-DOMENA/login"

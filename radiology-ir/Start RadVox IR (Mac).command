#!/bin/bash
# Double-click to start RadVox IR on a Mac.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "Node.js is not installed. Install it from https://nodejs.org (LTS) and open this file again."
  read -r -p "Press Enter to close."
  exit 1
fi
# the API key saved by RadVox / RadVox IR in ~/.radvox is shared
if [ ! -f .env ] && [ ! -f "$HOME/.radvox/.env" ]; then
  echo ""
  read -r -p "Paste your Anthropic API key here and press Enter: " KEY
  printf 'ANTHROPIC_API_KEY=%s\n' "$KEY" > .env
fi
if [ ! -d node_modules ]; then
  echo "Installing - first start only, please wait..."
  npm install --no-audit --no-fund
fi
echo ""
echo "RadVox IR is running. Keep this window open. Close it to stop RadVox IR."
(sleep 4; open "http://127.0.0.1:3300") &
node server.js
echo ""
echo "RadVox IR stopped. If you see an error above, send a screenshot of this window."
read -r -p "Press Enter to close."

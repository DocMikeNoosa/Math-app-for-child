#!/bin/bash
# EndoList - uruchamia lokalny serwer i otwiera aplikacje w oknie Chrome.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then osascript -e 'display alert "EndoList" message "Zainstaluj Node.js ze strony nodejs.org (wersja LTS) i uruchom ponownie."'; exit 1; fi
(node server.mjs >/dev/null 2>&1 &)
sleep 1.5
if [ -d "/Applications/Google Chrome.app" ]; then open -na "Google Chrome" --args --app=http://localhost:4173
elif [ -d "/Applications/Microsoft Edge.app" ]; then open -na "Microsoft Edge" --args --app=http://localhost:4173
else open http://localhost:4173; fi

#!/bin/bash
# EndoList (Mac): tworzy aplikację „EndoList" w folderze Aplikacje (z ikoną) i uruchamia ją.
cd "$(dirname "$0")"
APPDIR="$(pwd)"
NODE="$(command -v node)"
if [ -z "$NODE" ]; then osascript -e 'display alert "EndoList" message "Zainstaluj Node.js ze strony nodejs.org (wersja LTS) i uruchom ten plik ponownie."'; exit 1; fi
TARGET="$HOME/Applications/EndoList.app"
mkdir -p "$HOME/Applications"
rm -rf "$TARGET"
cat > /tmp/endolist-launcher.applescript <<APPLESCRIPT
try
  do shell script "curl -s -m 1 http://localhost:4173/api/status | grep -q EndoList"
on error
  do shell script "cd " & quoted form of "$APPDIR" & " && nohup " & quoted form of "$NODE" & " server.mjs > /dev/null 2>&1 &"
  delay 1.5
end try
try
  do shell script "open -na 'Google Chrome' --args --app=http://localhost:4173"
on error
  try
    do shell script "open -na 'Microsoft Edge' --args --app=http://localhost:4173"
  on error
    open location "http://localhost:4173"
  end try
end try
APPLESCRIPT
osacompile -o "$TARGET" /tmp/endolist-launcher.applescript
cp "launcher/endolist.icns" "$TARGET/Contents/Resources/applet.icns"
touch "$TARGET"
echo "Gotowe: aplikacja EndoList jest w folderze Aplikacje (w katalogu domowym). Możesz przeciągnąć ją do Docka."
open "$TARGET"

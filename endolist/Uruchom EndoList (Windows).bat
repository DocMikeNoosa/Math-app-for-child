@echo off
rem EndoList - uruchamia lokalny serwer i otwiera aplikacje w oknie Edge/Chrome.
cd /d "%~dp0"
where node >nul 2>nul || (echo Zainstaluj Node.js ze strony https://nodejs.org (wersja LTS^) i uruchom ponownie. & pause & exit /b 1)
start "EndoList" /min node server.mjs
timeout /t 2 /nobreak >nul
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:4173
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:4173
) else (
  start "" http://localhost:4173
)

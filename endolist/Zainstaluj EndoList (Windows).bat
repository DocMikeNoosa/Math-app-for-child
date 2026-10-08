@echo off
title Instalacja EndoList
cd /d "%~dp0"
if not exist "server.mjs" (
  echo.
  echo Ten plik zostal otwarty z wnetrza archiwum ZIP.
  echo Kliknij ZIP prawym przyciskiem, wybierz "Wyodrebnij wszystkie..." i uruchom ten plik z wypakowanego folderu.
  echo.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nie jest zainstalowany. Zainstaluj go ze strony https://nodejs.org ^(wersja LTS^) i uruchom ten plik ponownie.
  echo.
  pause
  exit /b 1
)
echo.
echo Tworzenie ikony EndoList na pulpicie i w menu Start...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher\install-shortcuts.ps1"
if errorlevel 1 (
  echo Nie udalo sie utworzyc ikon. Wyslij zrzut ekranu tego okna.
  pause
  exit /b 1
)
echo.
echo Gotowe! Od teraz wystarczy kliknac ikone EndoList na pulpicie.
powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0launcher\EndoList.ps1"
timeout /t 3 >nul

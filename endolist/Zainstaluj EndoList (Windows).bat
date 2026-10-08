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
echo.
echo Otwieranie EndoList... (do 20 sekund)
echo Jesli okno EndoList sie nie pojawi, kliknij dwukrotnie plik
echo "EndoList - pomoc przy uruchamianiu" w tym folderze i wyslij zrzut ekranu.
powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0launcher\EndoList.ps1"
timeout /t 8 >nul

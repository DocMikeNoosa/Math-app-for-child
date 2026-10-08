@echo off
title EndoList - pomoc przy uruchamianiu
cd /d "%~dp0"
echo Uruchamianie EndoList w trybie pomocy...
echo Jesli cos pojdzie nie tak, zrob zrzut ekranu tego okna i drugiego okna (serwer).
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher\EndoList.ps1" -Visible
echo.
echo Dziennik: %LOCALAPPDATA%\EndoList
pause

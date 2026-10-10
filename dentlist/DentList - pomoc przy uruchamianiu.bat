@echo off
title DentList - pomoc przy uruchamianiu
cd /d "%~dp0"
echo Uruchamianie DentList w trybie pomocy...
echo Jesli cos pojdzie nie tak, zrob zrzut ekranu tego okna i drugiego okna (serwer).
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher\DentList.ps1" -Visible
echo.
echo Dziennik: %LOCALAPPDATA%\DentList
pause

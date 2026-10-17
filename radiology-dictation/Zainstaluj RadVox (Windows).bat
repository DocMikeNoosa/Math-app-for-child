@echo off
title Install RadVox
cd /d "%~dp0"
if not exist "package.json" (
  echo.
  echo This file was opened from inside the ZIP file, so it cannot run.
  echo Right-click the ZIP file, choose "Extract All...", then "Extract",
  echo and start this file again from the extracted folder.
  echo.
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed. Install it from https://nodejs.org ^(LTS^) and run this file again.
  echo.
  pause
  exit /b 1
)

echo.
echo === RadVox installation ===
echo.
echo Installing components, please wait...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo Installation failed. Send a screenshot of this window.
  pause
  exit /b 1
)

set "KEYDIR=%USERPROFILE%\.radvox"
if not exist "%KEYDIR%" mkdir "%KEYDIR%"
if not exist "%KEYDIR%\.env" if exist ".env" copy /y ".env" "%KEYDIR%\.env" >nul
if exist "%KEYDIR%\.env" (
  echo.
  choice /c YN /n /m "Your API key is already saved. Replace it with a new key? [Y/N] "
  if errorlevel 2 goto shortcuts
)
echo.
set /p KEY=Paste your Anthropic API key here and press Enter: 
call echo ANTHROPIC_API_KEY=%%KEY%%> "%KEYDIR%\.env"

:shortcuts
echo.
echo Creating the RadVox icon on your desktop and in the Start menu...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launcher\install-shortcuts.ps1"
if errorlevel 1 (
  echo Could not create the icons. Send a screenshot of this window.
  pause
  exit /b 1
)
echo.
echo Done! From now on just double-click the RadVox icon on your desktop.
echo Starting RadVox now...
powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0launcher\RadVox.ps1"
timeout /t 3 >nul

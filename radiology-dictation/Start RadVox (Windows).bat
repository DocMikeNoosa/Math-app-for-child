@echo off
title RadVox
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed. Install it from https://nodejs.org ^(LTS^) and run this file again.
  echo.
  pause
  exit /b 1
)
if not exist ".env" (
  echo.
  set /p KEY=Paste your Anthropic API key here and press Enter: 
  call echo ANTHROPIC_API_KEY=%%KEY%%> .env
)
if not exist "node_modules" (
  echo Installing - first start only, please wait...
  call npm install --no-audit --no-fund
)
echo.
echo RadVox is running. Keep this window open. Close it to stop RadVox.
start "" "http://127.0.0.1:3000"
node server.js
pause

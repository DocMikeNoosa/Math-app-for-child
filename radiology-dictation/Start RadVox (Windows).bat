@echo off
title RadVox
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
if not exist ".env" (
  echo.
  set /p KEY=Paste your Anthropic API key here and press Enter: 
  call echo ANTHROPIC_API_KEY=%%KEY%%> .env
)
if not exist "node_modules" (
  echo Installing - first start only, please wait...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo Installation failed. Send a screenshot of this window.
    pause
    exit /b 1
  )
)
echo.
echo RadVox is running. Keep this window open. Close it to stop RadVox.
rem Open the browser a few seconds later, once the server is listening.
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start "" http://127.0.0.1:3000"
node server.js
echo.
echo RadVox stopped. If you see an error above, send a screenshot of this window.
pause

@echo off
title RadVox IR
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
rem the API key saved by RadVox / RadVox IR in %USERPROFILE%\.radvox is shared
if not exist ".env" if not exist "%USERPROFILE%\.radvox\.env" (
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
echo RadVox IR is running. Keep this window open. Close it to stop RadVox IR.
rem Open the browser a few seconds later, once the server is listening.
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start "" http://127.0.0.1:3300"
node server.js
echo.
echo RadVox IR stopped. If you see an error above, send a screenshot of this window.
pause

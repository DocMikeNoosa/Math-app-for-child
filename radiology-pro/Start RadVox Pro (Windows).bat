@echo off
title RadVox Pro (test na tym komputerze)
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
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=5)?0:1)"
if errorlevel 1 (
  echo.
  echo RadVox Pro needs a newer Node.js ^(version 22.5 or later^).
  echo Install the current LTS version from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b 1
)

set "CFG=%USERPROFILE%\.radiopis"
if not exist "%CFG%" mkdir "%CFG%"
if not exist "%CFG%\.env" (
  echo.
  echo === First start: settings ===
  rem reuse the API key saved by RadVox, if there is one
  if exist "%USERPROFILE%\.radvox\.env" findstr /b "ANTHROPIC_API_KEY=" "%USERPROFILE%\.radvox\.env" > "%CFG%\.env"
  findstr /b "ANTHROPIC_API_KEY=sk" "%CFG%\.env" >nul 2>nul
  if errorlevel 1 (
    set /p KEY=Paste your Anthropic API key here and press Enter: 
    call echo ANTHROPIC_API_KEY=%%KEY%%> "%CFG%\.env"
  ) else (
    echo Using the API key you already saved for RadVox.
  )
  >> "%CFG%\.env" echo ADMIN_EMAIL=admin@radiopis.local
  >> "%CFG%\.env" echo ADMIN_PASSWORD=Radiopis2026
  >> "%CFG%\.env" echo DATA_DIR=%CFG%\data
  >> "%CFG%\.env" echo PORT=3100
)
if not exist "node_modules" (
  echo.
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
echo ===============================================================
echo  RadVox Pro is running:  http://127.0.0.1:3100
echo  Administrator login:  admin@radiopis.local
echo  Password:             Radiopis2026
echo  Keep this window open. Close it to stop RadVox Pro.
echo ===============================================================
echo.
start "" /min cmd /c "timeout /t 4 /nobreak >nul & start "" http://127.0.0.1:3100/login"
node --disable-warning=ExperimentalWarning server.js
echo.
echo RadVox Pro stopped. If you see an error above, send a screenshot of this window.
pause

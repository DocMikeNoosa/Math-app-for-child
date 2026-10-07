# RadVox launcher (Windows): starts RadVox in the background - no console window -
# and opens it in its own app window (Chrome or Edge). Used by the desktop / Start-menu icon.
$ErrorActionPreference = 'SilentlyContinue'
$App = Split-Path -Parent $PSScriptRoot
$Url = 'http://127.0.0.1:3000'
Add-Type -AssemblyName PresentationFramework

function Show-Message([string]$text) {
  [System.Windows.MessageBox]::Show($text, 'RadVox') | Out-Null
}

function Test-RadVox {
  try {
    $r = Invoke-WebRequest -Uri "$Url/api/status" -UseBasicParsing -TimeoutSec 1
    return ($r.StatusCode -eq 200)
  } catch { return $false }
}

if (-not (Test-RadVox)) {
  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node) {
    Show-Message "Node.js nie jest zainstalowany.`nZainstaluj go ze strony nodejs.org (wersja LTS) i spróbuj ponownie."
    exit 1
  }
  if (-not (Test-Path (Join-Path $App 'node_modules'))) {
    Show-Message "RadVox nie jest jeszcze zainstalowany.`nUruchom najpierw plik „Zainstaluj RadVox (Windows)” w folderze aplikacji."
    exit 1
  }
  # stop automatically about 20 minutes after the app window is closed
  $env:RADVOX_IDLE_EXIT_MIN = '20'
  Start-Process -FilePath $node -ArgumentList 'server.js' -WorkingDirectory $App -WindowStyle Hidden
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-RadVox) { $ready = $true; break }
  }
  if (-not $ready) {
    Show-Message "RadVox nie uruchomił się.`nUruchom plik „Start RadVox (Windows)” w folderze aplikacji, aby zobaczyć komunikat błędu."
    exit 1
  }
}

# Open as an app window (no address bar). Chrome first, then Edge, then the default browser.
$candidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)
$browser = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if ($browser) {
  Start-Process -FilePath $browser -ArgumentList "--app=$Url", '--window-size=1440,900'
} else {
  Start-Process $Url
}

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

function Get-RadVoxStatus {
  try { return Invoke-RestMethod -Uri "$Url/api/status" -TimeoutSec 1 } catch { return $null }
}

# Stop the RadVox server (node) that is listening on port 3000.
function Stop-RunningRadVox {
  $ids = @()
  try {
    $ids = @(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop | Select-Object -ExpandProperty OwningProcess -Unique)
  } catch {
    $ids = @(netstat -ano -p tcp | Select-String ':3000\s+\S+\s+LISTENING\s+(\d+)' | ForEach-Object { [int]$_.Matches[0].Groups[1].Value } | Select-Object -Unique)
  }
  foreach ($id in $ids) {
    $proc = Get-Process -Id $id -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq 'node') { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue }
  }
  for ($i = 0; $i -lt 20; $i++) {
    if (-not (Test-RadVox)) { return $true }
    Start-Sleep -Milliseconds 250
  }
  return (-not (Test-RadVox))
}

function Same-Folder([string]$a, [string]$b) {
  if (-not $a -or -not $b) { return $false }
  try { return ([IO.Path]::GetFullPath($a).TrimEnd('\', '/') -ieq [IO.Path]::GetFullPath($b).TrimEnd('\', '/')) } catch { return $false }
}

# An older copy of RadVox (another folder or another version) may still be running in the
# background - e.g. after an update. Replace it with this one.
$myVersion = ''
try { $myVersion = (Get-Content (Join-Path $App 'package.json') -Raw | ConvertFrom-Json).version } catch { }
$running = Get-RadVoxStatus
if ($running) {
  $current = (Same-Folder $running.dir $App) -and ($running.version -eq $myVersion)
  if (-not $current) {
    if (-not (Stop-RunningRadVox)) {
      Show-Message "W tle działa starsza wersja RadVox i nie udało się jej zamknąć.`nUruchom ponownie komputer i kliknij ikonę RadVox jeszcze raz."
      exit 1
    }
  }
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

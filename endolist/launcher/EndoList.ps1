# EndoList - uruchamia aplikacje (serwer na tym komputerze) i otwiera ja w osobnym oknie Chrome / Edge.
#  -Visible   : tryb pomocy - serwer w widocznym oknie, postep na ekranie (do zrzutu ekranu przy problemach)
#  -NoBrowser : tylko uruchom serwer (testy)
param([switch]$Visible, [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$App = Split-Path -Parent $PSScriptRoot
$Port = 4173
if ($env:ENDOLIST_PORT) { $Port = [int]$env:ENDOLIST_PORT }
$Url = "http://localhost:$Port"
$LogDir = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'EndoList'
if (-not ([Environment]::GetFolderPath('LocalApplicationData'))) { $LogDir = Join-Path ([System.IO.Path]::GetTempPath()) 'EndoList' }
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$Log = Join-Path $LogDir 'endolist-start.log'
function Log([string]$m) { $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m"; try { Add-Content -Path $Log -Value $line -Encoding UTF8 } catch {}; if ($Visible) { Write-Host $m } }
function Show-Message([string]$text) {
  Log "MESSAGE: $text"
  # topmost message box (a hidden launcher's dialog could otherwise open behind other windows)
  try { Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show($text, 'EndoList', 'OK', 'Warning', 'Button1', 'DefaultDesktopOnly') | Out-Null } catch { Write-Host $text }
}
# Raw HTTP to 127.0.0.1 (no proxy, no IPv6 detour, no Internet Explorer engine). Returns the response text or ''.
function Get-Local([string]$path, [string]$extraHeader = '') {
  $c = New-Object System.Net.Sockets.TcpClient
  try {
    $iar = $c.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne(800)) { return '' }
    $c.EndConnect($iar)
    $s = $c.GetStream(); $s.ReadTimeout = 2000
    $req = [System.Text.Encoding]::ASCII.GetBytes("GET $path HTTP/1.1`r`nHost: localhost`r`n$extraHeader" + "Connection: close`r`n`r`n")
    $s.Write($req, 0, $req.Length)
    return (New-Object System.IO.StreamReader($s)).ReadToEnd()
  } catch { return '' } finally { $c.Close() }
}
$MyVersion = '0'; try { $MyVersion = (Get-Content -Raw -Encoding UTF8 (Join-Path $App 'package.json') | ConvertFrom-Json).version } catch {}
# An EndoList server from another (older) installation keeps running in the background after an update — replace it.
function Stop-OtherServer {
  Log 'Zatrzymuję poprzednią wersję EndoList działającą w tle…'
  [void](Get-Local '/api/quit' "X-EndoList: quit`r`n")
  Start-Sleep -Milliseconds 600
  if ($env:OS -eq 'Windows_NT') {
    try { Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $_.CommandLine -and ($_.CommandLine -match 'launcher\\server\.ps1' -or $_.CommandLine -match 'server\.mjs') -and $_.ProcessId -ne $PID } | ForEach-Object { Log "  zatrzymuję proces $($_.ProcessId)"; Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } } catch { Log "  CIM: $($_.Exception.Message)" }
    try { Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop | ForEach-Object { if ($_.OwningProcess -ne $PID) { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue } } } catch {}
  }
  for ($i = 0; $i -lt 20; $i++) { if (-not (Get-Local '/api/status')) { return $true }; Start-Sleep -Milliseconds 250 }
  return $false
}
# Is EndoList answering? Plain TCP to 127.0.0.1 (no proxy, no IPv6 detour, no Internet Explorer engine).
function Test-EndoList {
  $c = New-Object System.Net.Sockets.TcpClient
  try {
    $iar = $c.BeginConnect('127.0.0.1', $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne(800)) { return $false }
    $c.EndConnect($iar)
    $s = $c.GetStream(); $s.ReadTimeout = 2000
    $req = [System.Text.Encoding]::ASCII.GetBytes("GET /api/status HTTP/1.1`r`nHost: localhost`r`nConnection: close`r`n`r`n")
    $s.Write($req, 0, $req.Length)
    $text = (New-Object System.IO.StreamReader($s)).ReadToEnd()
    return ($text -match '"app"\s*:\s*"EndoList"')
  } catch { return $false } finally { $c.Close() }
}

try {
  Log "Start (folder: $App)"
  if (-not (Test-Path (Join-Path $App 'public\index.html')) -and -not (Test-Path (Join-Path $App 'public/index.html'))) { Show-Message "Nie znaleziono plików aplikacji w folderze:`n$App`n`nWypakuj cały plik ZIP (prawy przycisk → Wyodrębnij wszystkie) i uruchom instalację ponownie."; exit 1 }
  $status = Get-Local '/api/status'
  if ($status -match '"app"\s*:\s*"EndoList"') {
    $ver = ''; if ($status -match '"version"\s*:\s*"([^"]*)"') { $ver = $Matches[1] }
    $dirOk = $status.Replace('\\', '\').Contains($App)
    if ($ver -ne $MyVersion -or -not $dirOk) {
      Log "W tle działa inna wersja ($ver) — uruchamiam $MyVersion z: $App"
      if (-not (Stop-OtherServer)) { Show-Message "Nie udało się zatrzymać poprzedniej wersji EndoList.`n`nUruchom ponownie komputer i kliknij ikonę EndoList jeszcze raz.`n`nDziennik: $Log"; exit 1 }
    }
  }
  if (Test-EndoList) { Log "Serwer już działa ($MyVersion)." }
  else {
    $node = $null; try { $node = (Get-Command node -ErrorAction Stop).Source } catch {}
    $style = 'Hidden'; if ($Visible) { $style = 'Normal' }
    $win = @{}; if ($env:OS -eq 'Windows_NT') { $win = @{ WindowStyle = $style } }  # -WindowStyle exists only on Windows
    if ($node) {
      Log "Uruchamiam serwer (Node.js: $node)"
      Start-Process -FilePath $node -ArgumentList 'server.mjs' -WorkingDirectory $App @win
    } else {
      # no Node.js needed: the built-in Windows PowerShell serves the app on this computer only
      $ps = $null
      if ($env:SystemRoot) { $ps = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe' }
      if (-not $ps -or -not (Test-Path $ps)) { $ps = (Get-Process -Id $PID).Path }
      $server = Join-Path $PSScriptRoot 'server.ps1'
      $args2 = "-NoProfile -ExecutionPolicy Bypass -File `"$server`""
      if ($Visible) { $args2 = "-NoProfile -NoExit -ExecutionPolicy Bypass -File `"$server`"" }
      Log "Uruchamiam serwer (PowerShell: $ps)"
      Start-Process -FilePath $ps -ArgumentList $args2 -WorkingDirectory $App @win
    }
    $ready = $false
    for ($i = 0; $i -lt 80; $i++) { Start-Sleep -Milliseconds 250; if (Test-EndoList) { $ready = $true; break } }
    if (-not $ready) { Show-Message "EndoList nie uruchomił się.`n`nKliknij dwukrotnie plik „EndoList - pomoc przy uruchamianiu” w folderze EndoList i wyślij zrzut ekranu okien, które się pojawią.`n`nDziennik: $Log"; exit 1 }
    Log 'Serwer gotowy.'
  }
  if ($NoBrowser) { exit 0 }
  $chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  $edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
  if ($chrome) { Log "Otwieram Chrome: $chrome"; Start-Process -FilePath $chrome -ArgumentList "--app=$Url" }
  elseif ($edge) { Log "Otwieram Edge: $edge"; Start-Process -FilePath $edge -ArgumentList "--app=$Url" }
  else { Log 'Otwieram domyślną przeglądarkę'; Start-Process $Url }
  Log 'OK'
} catch {
  Show-Message "Błąd uruchamiania EndoList:`n$($_.Exception.Message)`n`nDziennik: $Log"
  exit 1
}

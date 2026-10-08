# EndoList - uruchamia aplikacje w tle (bez okna konsoli) i otwiera ja w osobnym oknie Edge / Chrome.
$ErrorActionPreference = 'SilentlyContinue'
$App = Split-Path -Parent $PSScriptRoot
$Url = 'http://localhost:4173'
Add-Type -AssemblyName PresentationFramework
function Show-Message([string]$text) { [System.Windows.MessageBox]::Show($text, 'EndoList') | Out-Null }
function Test-EndoList { try { $r = Invoke-RestMethod -Uri "$Url/api/status" -TimeoutSec 1; return ($r.app -eq 'EndoList') } catch { return $false } }

if (-not (Test-EndoList)) {
  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node) { Show-Message "Node.js nie jest zainstalowany.`nZainstaluj go ze strony nodejs.org (wersja LTS) i spróbuj ponownie."; exit 1 }
  Start-Process -FilePath $node -ArgumentList 'server.mjs' -WorkingDirectory $App -WindowStyle Hidden
  $ready = $false
  for ($i = 0; $i -lt 60; $i++) { Start-Sleep -Milliseconds 250; if (Test-EndoList) { $ready = $true; break } }
  if (-not $ready) { Show-Message 'Nie udało się uruchomić EndoList. Uruchom ponownie komputer i spróbuj jeszcze raz.'; exit 1 }
}
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$chrome = @("$env:ProgramFiles\Google\Chrome\Application\chrome.exe", "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe", "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($chrome) { Start-Process $chrome "--app=$Url" } elseif ($edge) { Start-Process $edge "--app=$Url" } else { Start-Process $Url }

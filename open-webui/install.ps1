# One-line installer for Windows. Paste into PowerShell:
#   irm https://raw.githubusercontent.com/DocMikeNoosa/Math-app-for-child/claude/dazzling-bohr-1gdahq/open-webui/install.ps1 | iex
# It installs Docker Desktop if needed, downloads this folder to %USERPROFILE%\LocalAI
# and runs setup.ps1. Safe to run again: your chats, models and .env are kept.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'   # makes downloads much faster in Windows PowerShell 5.1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Repo   = 'DocMikeNoosa/Math-app-for-child'
$Branch = 'claude/dazzling-bohr-1gdahq'
$Target = Join-Path $env:USERPROFILE 'LocalAI'

# Windows PowerShell 5.1 turns a native program's stderr output into a fatal error when it is
# redirected while ErrorActionPreference is 'Stop'. Run such commands through this instead;
# it returns stdout, drops stderr, and leaves $LASTEXITCODE for the caller to check.
function Invoke-Native([scriptblock]$Command) {
    $old = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & $Command 2>$null } finally { $ErrorActionPreference = $old }
}

function Say([string]$msg) { Write-Host ">>> $msg" -ForegroundColor Cyan }

# ---------- 1. Docker Desktop ----------
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Say 'Docker Desktop is not installed - installing it now (accept the Windows prompt).'
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Write-Host 'winget is missing. Install Docker Desktop from https://www.docker.com/products/docker-desktop/ then run this line again.' -ForegroundColor Yellow
        return
    }
    winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
    Write-Host ''
    Write-Host 'Docker Desktop is installed. Now:' -ForegroundColor Green
    Write-Host '  1. Restart Windows.'
    Write-Host '  2. Open "Docker Desktop" from the Start menu and accept its terms (skip sign-in is fine).'
    Write-Host '  3. Paste the same install line into PowerShell again.'
    return
}

Invoke-Native { docker info } | Out-Null
if ($LASTEXITCODE -ne 0) {
    $exe = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
    if (Test-Path $exe) {
        Say 'Starting Docker Desktop...'
        Start-Process $exe
        for ($i = 0; $i -lt 90; $i++) {
            Start-Sleep -Seconds 2
            Invoke-Native { docker info } | Out-Null
            if ($LASTEXITCODE -eq 0) { break }
        }
    }
    Invoke-Native { docker info } | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Docker Desktop is not running yet. Open it from the Start menu, wait for "Engine running", then paste the install line again.' -ForegroundColor Yellow
        return
    }
}

# ---------- 2. Download the setup files ----------
Say "Downloading setup files to $Target"
$tmp = Join-Path $env:TEMP ("localai-" + [guid]::NewGuid())
New-Item -ItemType Directory -Path $tmp | Out-Null
$zip = Join-Path $tmp 'src.zip'
Invoke-WebRequest -UseBasicParsing "https://github.com/$Repo/archive/refs/heads/$Branch.zip" -OutFile $zip
Expand-Archive -Path $zip -DestinationPath $tmp
$src = Get-ChildItem -Path $tmp -Directory | ForEach-Object { Join-Path $_.FullName 'open-webui' } | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $src) { throw 'Downloaded archive does not contain the open-webui folder.' }
New-Item -ItemType Directory -Force -Path $Target | Out-Null
Get-ChildItem -Path $src -Force | Where-Object { $_.Name -ne '.env' } | Copy-Item -Destination $Target -Recurse -Force
Remove-Item -Recurse -Force $tmp

# ---------- 3. Run setup ----------
Say 'Running setup'
# images.ps1 sets $global:LocalAIArgs (e.g. '-Images') before running this script.
$extra = @()
if ($global:LocalAIArgs) { $extra = @($global:LocalAIArgs) }
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Target 'setup.ps1') @extra

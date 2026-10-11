# One-command setup for Open WebUI + Ollama on Windows (PowerShell).
#   .\setup.cmd                 detect hardware, download models, start
#   .\setup.cmd -Tier large     force a tier: small | medium | large | max
#   .\setup.cmd -Cpu            ignore the NVIDIA GPU
#   .\setup.cmd -DryRun         only show what would be installed
#   .\setup.cmd -Down           stop everything (models and chats are kept)
#   .\setup.cmd -Images         add picture making (ComfyUI)
#   .\setup.cmd -Video          add picture + video making (ComfyUI)
param(
    [ValidateSet('', 'auto', 'small', 'medium', 'large', 'max')]
    [string]$Tier = '',
    [switch]$Cpu,
    [switch]$DryRun,
    [switch]$Down,
    [switch]$Images,
    [switch]$Video
)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

function Fail([string]$msg) { Write-Host "ERROR: $msg" -ForegroundColor Red; exit 1 }

function Get-EnvValue([string]$name) {
    $line = Get-Content .env | Where-Object { $_ -match "^$name=" } | Select-Object -Last 1
    if ($line) { return $line.Substring($name.Length + 1).Trim() }
    return ''
}

# ---------- .env ----------
if (-not (Test-Path .env)) {
    $chars = [char[]](48..57 + 65..90 + 97..122)
    $secret = -join (1..48 | ForEach-Object { $chars | Get-Random })
    $content = (Get-Content .env.example) -replace '^WEBUI_SECRET_KEY=.*', "WEBUI_SECRET_KEY=$secret"
    # ASCII without BOM so Docker Compose reads the first line correctly.
    [IO.File]::WriteAllText((Join-Path $PSScriptRoot '.env'), (($content -join "`n") + "`n"), [Text.Encoding]::ASCII)
    Write-Host 'Created .env'
}

# ---------- hardware detection ----------
$gpu = $false
$memGB = 0
$where = ''
$hasNvidia = $false
if (-not $Cpu -and (Get-Command nvidia-smi -ErrorAction SilentlyContinue)) {
    $vram = & nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>$null
    if ($LASTEXITCODE -eq 0 -and $vram) { $hasNvidia = $true }
}
if ($hasNvidia) {
    $vramMB = ($vram | ForEach-Object { [int]($_.Trim()) } | Measure-Object -Sum).Sum
    $memGB = [math]::Floor($vramMB / 1024)
    $where = 'NVIDIA VRAM'
    $gpu = $true
} else {
    if (Get-Command Get-CimInstance -ErrorAction SilentlyContinue) {
        $ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
    } else {
        $ramBytes = [double]((Get-Content /proc/meminfo | Select-String '^MemTotal') -replace '\D', '') * 1024
    }
    $ramGB = [math]::Floor($ramBytes / 1GB)
    # Docker Desktop's WSL2 VM gets about half of system RAM by default.
    $memGB = [math]::Floor($ramGB * 0.5)
    $where = "system RAM, CPU only ($ramGB GB total)"
}

if (-not $Tier) { $Tier = Get-EnvValue 'TIER' }
if (-not $Tier -or $Tier -eq 'auto') {
    if ($memGB -ge 80) { $Tier = 'max' }
    elseif ($memGB -ge 24) { $Tier = 'large' }
    elseif ($memGB -ge 16) { $Tier = 'medium' }
    else { $Tier = 'small' }
}

# ---------- model sets (Ollama library tags, verified Oct 2026) ----------
switch ($Tier) {
    'small'  { $tModels = 'qwen3.5:9b,medgemma1.5'; $tDefault = 'qwen3.5:9b'; $tWhisper = 'small' }
    'medium' { $tModels = 'gpt-oss:20b,qwen3.5:9b,medgemma1.5'; $tDefault = 'gpt-oss:20b'; $tWhisper = 'medium' }
    'large'  { $tModels = 'qwen3.8,gpt-oss:20b,gemma4:26b,medgemma:27b,medgemma1.5'; $tDefault = 'qwen3.8'; $tWhisper = 'Systran/faster-whisper-large-v3' }
    'max'    { $tModels = 'qwen3.8,gpt-oss:120b,gemma4:31b,medgemma:27b,medgemma1.5'; $tDefault = 'qwen3.8'; $tWhisper = 'Systran/faster-whisper-large-v3' }
    default  { Fail "unknown tier '$Tier' (use small, medium, large or max)" }
}
# Large Whisper on a CPU is too slow for comfortable dictation.
if (-not $gpu -and $tWhisper -like 'Systran/*') { $tWhisper = 'medium' }

# Values in .env win over tier defaults; passed to Docker Compose via the environment.
$env:MODELS = Get-EnvValue 'MODELS';               if (-not $env:MODELS) { $env:MODELS = $tModels }
$env:DEFAULT_MODEL = Get-EnvValue 'DEFAULT_MODEL'; if (-not $env:DEFAULT_MODEL) { $env:DEFAULT_MODEL = $tDefault }
$env:WHISPER_MODEL = Get-EnvValue 'WHISPER_MODEL'; if (-not $env:WHISPER_MODEL) { $env:WHISPER_MODEL = $tWhisper }

Write-Host "Hardware : ~$memGB GB usable for models ($where)"
Write-Host "Tier     : $Tier"
Write-Host "Models   : $env:MODELS"
Write-Host "Default  : $env:DEFAULT_MODEL"
Write-Host "Voice    : Whisper $env:WHISPER_MODEL"
if ($DryRun) { exit 0 }

# ---------- run ----------
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Fail 'Docker Desktop is not installed. Install it with:  winget install Docker.DockerDesktop  (then restart Windows and open Docker Desktop once).'
}
docker compose version *> $null
if ($LASTEXITCODE -ne 0) { Fail 'Docker Compose v2 is required. Update Docker Desktop.' }
docker info *> $null
if ($LASTEXITCODE -ne 0) { Fail 'Docker Desktop is not running. Start it from the Start menu, wait until it says "Engine running", then try again.' }

$files = @('-f', 'docker-compose.yml')
if ($Down) { docker compose @files --profile images down; exit $LASTEXITCODE }
if ($gpu) {
    Write-Host 'Enabling NVIDIA GPU for models and voice.'
    $files += @('-f', 'docker-compose.gpu.yml')
}

docker compose @files up -d ollama open-webui
if ($LASTEXITCODE -ne 0) { Fail 'Could not start the containers - see the messages above.' }

if ($Images -or $Video) {
    # ---------- pictures / video (ComfyUI) ----------
    # Official model links, taken from ComfyUI's own workflow templates.
    $hf = 'https://huggingface.co/Comfy-Org'
    $dl = @(
        "diffusion_models|$hf/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_int8_convrot.safetensors",
        "text_encoders|$hf/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b_fp8_mixed.safetensors",
        "vae|$hf/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"
    )
    $wf = @('image_z_image_turbo_int8|1_-_Make_a_picture')
    if ($Video) {
        $dl += @(
            "diffusion_models|$hf/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors",
            "text_encoders|$hf/Wan_2.1_ComfyUI_repackaged/resolve/main/split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
            "vae|$hf/Wan_2.2_ComfyUI_Repackaged/resolve/main/split_files/vae/wan2.2_vae.safetensors"
        )
        $wf += 'video_wan2_2_5B_ti2v|2_-_Make_a_video'
    }
    # Pick the ComfyUI build that matches the graphics card (from the image maintainer's table):
    # cu130 = RTX 20/30/40/50 series and needs NVIDIA driver 580+; cu126 = older cards (GTX 10 series etc.).
    if ($gpu -and -not $env:COMFY_TAG_GPU) {
        $info = (& nvidia-smi --query-gpu=compute_cap,driver_version --format=csv,noheader 2>$null | Select-Object -First 1)
        $cap = 0.0; $drv = 0
        if ($info) {
            $parts = $info -split ','
            [void][double]::TryParse($parts[0].Trim(), [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$cap)
            [void][int]::TryParse(($parts[1].Trim() -split '\.')[0], [ref]$drv)
        }
        if ($cap -ge 7.5 -and $drv -ge 580) { $env:COMFY_TAG_GPU = 'cu130-slim' }
        elseif ($cap -ge 12) { Fail "Your graphics card needs a newer NVIDIA driver (you have $drv, need 580 or newer). Update it with the NVIDIA App or from nvidia.com/drivers, restart, then run this again." }
        elseif ($cap -gt 0) { $env:COMFY_TAG_GPU = 'cu126-slim' }
        Write-Host "Graphics card compute capability $cap, driver $drv -> ComfyUI build $env:COMFY_TAG_GPU"
    }
    $env:COMFY_DOWNLOADS = $dl -join ' '
    $env:COMFY_WORKFLOWS = $wf -join ' '

    # Free the graphics card: unload chat models that are sitting in memory.
    $loaded = docker exec ollama ollama ps 2>$null | Select-Object -Skip 1 | ForEach-Object { ($_ -split '\s+')[0] } | Where-Object { $_ }
    foreach ($m in $loaded) { docker exec ollama ollama stop $m *> $null }

    docker compose @files --profile images up -d comfyui
    if ($LASTEXITCODE -ne 0) { Fail 'Could not start ComfyUI - see the messages above.' }
    Write-Host 'Downloading picture/video models (about 10 GB for pictures, 18 GB more for video)...'
    docker compose @files --profile images run --rm comfyui-models
    if ($LASTEXITCODE -ne 0) { Fail 'Some picture/video models failed to download - see above. Run the same command again to resume.' }

    $cport = '8188'
    Write-Host -NoNewline 'Waiting for ComfyUI'
    for ($i = 0; $i -lt 300; $i++) {
        try {
            Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 "http://localhost:$cport/system_stats" | Out-Null
            Write-Host ''
            Write-Host "Pictures ready: http://localhost:$cport" -ForegroundColor Green
            Write-Host 'Open the Workflows panel on the left and choose "1 - Make a picture".'
            Write-Host "Your pictures are saved in: $(Join-Path $PSScriptRoot 'pictures')"
            Start-Process "http://localhost:$cport"
            exit 0
        } catch {
            Write-Host -NoNewline '.'
            Start-Sleep -Seconds 2
        }
    }
    Write-Host ''
    Fail 'ComfyUI did not respond. Check: docker compose logs comfyui'
}

Write-Host 'Downloading models (first run can take a long time)...'
docker compose @files run --rm model-puller
if ($LASTEXITCODE -ne 0) {
    Write-Host 'WARNING: some models failed to download - see above. You can also pull models in Open WebUI > Admin > Settings > Models.' -ForegroundColor Yellow
}

$port = Get-EnvValue 'WEBUI_PORT'; if (-not $port) { $port = '3000' }
Write-Host -NoNewline 'Waiting for Open WebUI (first start also downloads the Whisper model)'
for ($i = 0; $i -lt 300; $i++) {
    try {
        Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 "http://localhost:$port/health" | Out-Null
        Write-Host ''
        Write-Host "Ready: http://localhost:$port" -ForegroundColor Green
        Write-Host 'The first account you create becomes the admin.'
        Start-Process "http://localhost:$port"
        exit 0
    } catch {
        Write-Host -NoNewline '.'
        Start-Sleep -Seconds 2
    }
}
Write-Host ''
Fail "Open WebUI did not respond on port $port. Check: docker compose logs open-webui"

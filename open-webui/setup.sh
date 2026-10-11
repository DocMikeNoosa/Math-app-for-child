#!/usr/bin/env bash
# One-command setup for Open WebUI + Ollama with the best open models your hardware can run.
#   ./setup.sh                 detect hardware, download models, start
#   ./setup.sh --tier large    force a tier: small | medium | large | max
#   ./setup.sh --cpu           ignore the NVIDIA GPU
#   ./setup.sh --dry-run       only show what would be installed
#   ./setup.sh --down          stop everything (models and chats are kept)
set -euo pipefail
cd "$(dirname "$0")"

die() { echo "ERROR: $*" >&2; exit 1; }

tier_arg="" force_cpu=0 dry_run=0 down=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier) tier_arg="${2:-}"; shift 2 ;;
    --cpu) force_cpu=1; shift ;;
    --dry-run) dry_run=1; shift ;;
    --down) down=1; shift ;;
    -h|--help) sed -n '2,7p' "$0"; exit 0 ;;
    *) die "unknown option: $1 (see --help)" ;;
  esac
done

if [[ ! -f .env ]]; then
  cp .env.example .env
  secret=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 48 || true)
  sed -i.bak "s/^WEBUI_SECRET_KEY=.*/WEBUI_SECRET_KEY=${secret}/" .env && rm -f .env.bak
  echo "Created .env"
fi
envval() { grep -E "^$1=" .env | tail -1 | cut -d= -f2- || true; }

# ---------- hardware detection ----------
os=$(uname -s)
gpu=0 mem_gb=0 where=""
if [[ "$os" == "Darwin" ]]; then
  # Apple Silicon: native Ollama uses the Metal GPU; macOS lets it use ~70% of unified memory.
  ram_gb=$(( $(sysctl -n hw.memsize) / 1024 / 1024 / 1024 ))
  mem_gb=$(( ram_gb * 70 / 100 )); where="Mac unified memory (${ram_gb} GB total)"; gpu=1
elif [[ $force_cpu -eq 0 ]] && command -v nvidia-smi >/dev/null && nvidia-smi >/dev/null 2>&1; then
  vram_mb=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | awk '{s+=$1} END {print s+0}')
  mem_gb=$(( vram_mb / 1024 )); where="NVIDIA VRAM"; gpu=1
else
  ram_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
  ram_gb=$(( ram_kb / 1024 / 1024 ))
  mem_gb=$(( ram_gb * 70 / 100 )); where="system RAM, CPU only (${ram_gb} GB total)"
fi

tier="${tier_arg:-$(envval TIER)}"
if [[ -z "$tier" || "$tier" == "auto" ]]; then
  if   (( mem_gb >= 80 )); then tier=max
  elif (( mem_gb >= 24 )); then tier=large
  elif (( mem_gb >= 16 )); then tier=medium
  else tier=small
  fi
fi

# ---------- model sets (Ollama library tags, verified Oct 2026) ----------
case "$tier" in
  small)  t_models="qwen3.5:9b,medgemma1.5"
          t_default="qwen3.5:9b";  t_whisper="small" ;;
  medium) t_models="gpt-oss:20b,qwen3.5:9b,medgemma1.5"
          t_default="gpt-oss:20b"; t_whisper="medium" ;;
  large)  t_models="qwen3.8,gpt-oss:20b,gemma4:26b,medgemma:27b,medgemma1.5"
          t_default="qwen3.8";     t_whisper="Systran/faster-whisper-large-v3" ;;
  max)    t_models="qwen3.8,gpt-oss:120b,gemma4:31b,medgemma:27b,medgemma1.5"
          t_default="qwen3.8";     t_whisper="Systran/faster-whisper-large-v3" ;;
  *) die "unknown tier '$tier' (use small, medium, large or max)" ;;
esac
# Large Whisper on a CPU is too slow for comfortable dictation.
[[ $gpu -eq 0 && "$t_whisper" == Systran/* ]] && t_whisper="medium"

# Values in .env win over tier defaults.
export MODELS="$(envval MODELS)";               MODELS="${MODELS:-$t_models}"
export DEFAULT_MODEL="$(envval DEFAULT_MODEL)"; DEFAULT_MODEL="${DEFAULT_MODEL:-$t_default}"
export WHISPER_MODEL="$(envval WHISPER_MODEL)"; WHISPER_MODEL="${WHISPER_MODEL:-$t_whisper}"

echo "Hardware : ~${mem_gb} GB usable for models (${where})"
echo "Tier     : ${tier}"
echo "Models   : ${MODELS}"
echo "Default  : ${DEFAULT_MODEL}"
echo "Voice    : Whisper ${WHISPER_MODEL}"
[[ $dry_run -eq 1 ]] && exit 0

# ---------- run ----------
command -v docker >/dev/null || die "Docker is not installed. Get it from https://docs.docker.com/get-docker/"
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required (docker compose ...)."
docker info >/dev/null 2>&1 || die "Docker is installed but not running. Start Docker Desktop / the docker service first."

if [[ $down -eq 1 ]]; then docker compose down; exit 0; fi

if [[ "$os" == "Darwin" ]]; then
  # Docker on macOS cannot use the Apple GPU, so Ollama runs natively and only the UI runs in Docker.
  command -v ollama >/dev/null || die "Install Ollama for Mac first: https://ollama.com/download (then re-run)."
  curl -fsS http://localhost:11434/api/version >/dev/null 2>&1 || { open -a Ollama 2>/dev/null || (ollama serve >/dev/null 2>&1 &); sleep 5; }
  failed=""
  for m in $(echo "$MODELS" | tr ',' ' '); do echo ">>> pulling $m"; ollama pull "$m" || failed="$failed $m"; done
  [[ -n "$failed" ]] && echo "WARNING: failed to download:$failed"
  OLLAMA_BASE_URL=http://host.docker.internal:11434 docker compose up -d --no-deps open-webui
else
  files=(-f docker-compose.yml)
  if [[ $gpu -eq 1 ]]; then
    echo "Enabling NVIDIA GPU for models and voice."
    files+=(-f docker-compose.gpu.yml)
  fi
  docker compose "${files[@]}" up -d ollama open-webui
  echo "Downloading models (first run can take a long time)..."
  docker compose "${files[@]}" up model-puller \
    || echo "WARNING: some models failed to download - see above. You can also pull models in Open WebUI > Admin > Settings > Models."
fi

port=$(envval WEBUI_PORT); port=${port:-3000}
echo -n "Waiting for Open WebUI (first start also downloads the Whisper model)"
for _ in $(seq 1 300); do
  if curl -fsS "http://localhost:${port}/health" >/dev/null 2>&1; then
    echo; echo "Ready: http://localhost:${port}"
    echo "The first account you create becomes the admin."
    exit 0
  fi
  echo -n "."; sleep 2
done
echo; die "Open WebUI did not respond on port ${port}. Check: docker compose logs open-webui"

# Local AI: Open WebUI + Ollama

A private ChatGPT-style assistant that runs entirely on your own computer, using the
strongest open-weight models available in the Ollama library (checked October 2026).
Nothing you type or say leaves your machine.

## Quick start

1. Install **Docker Desktop** (Windows/Mac) or Docker Engine (Linux): https://docs.docker.com/get-docker/
   - **Mac:** also install **Ollama for Mac**: https://ollama.com/download. It uses the Apple GPU, which Docker can't.
   - **Windows:** run the script from **WSL2** (Ubuntu) or Git Bash.
   - **NVIDIA GPU (Linux/WSL2):** install the NVIDIA Container Toolkit so Docker can use the GPU.
2. Run:
   ```bash
   cd open-webui
   ./setup.sh --dry-run   # shows what it will install for your hardware
   ./setup.sh             # installs and starts everything
   ```
3. Open **http://localhost:3000** and create an account. The first account becomes the admin.

The first run downloads tens of GB of models, so give it time. Later starts are instant.

## What gets installed

`setup.sh` measures your GPU memory (or Mac unified memory or system RAM) and picks a tier:

| Tier | Usable memory | Reasoning / automation | Medical | Voice (Whisper) | Disk |
|---|---|---|---|---|---|
| small  | < 16 GB  | `qwen3.5:9b` | `medgemma1.5` (4B) | small | ~11 GB |
| medium | 16–23 GB | `gpt-oss:20b`, `qwen3.5:9b` | `medgemma1.5` | medium | ~25 GB |
| large  | 24–79 GB | **`qwen3.8`** (27B), `gpt-oss:20b`, `gemma4:26b` | **`medgemma:27b`**, `medgemma1.5` | large-v3 | ~75 GB |
| max    | 80 GB+   | `qwen3.8`, **`gpt-oss:120b`**, `gemma4:31b` | `medgemma:27b`, `medgemma1.5` | large-v3 | ~125 GB |

Only one large model is held in memory at a time, so the tier only has to fit your largest model.
Override with `./setup.sh --tier large`, or set `MODELS=` in `.env` to choose models yourself.

**What each model is for**
- **qwen3.8 / qwen3.5**: strong general reasoning, with a thinking mode, tool calling and image input.
- **gpt-oss (20b/120b)**: OpenAI's open-weight reasoning model (Apache 2.0). Reasoning effort is adjustable, and it is good at tool use and automation.
- **gemma4**: Google's multimodal model (text and images). The 26B is a fast mixture-of-experts model.
- **MedGemma 27B / 1.5**: Google's medical models (text and medical images). MedGemma 1.5 adds CT/MRI volumes,
  histopathology and chest X-ray comparison. **Developer models, not medical devices:** don't rely on their
  output alone for diagnosis or treatment decisions.

## Voice

- **Speech to text** uses local Whisper inside Open WebUI. Click the microphone in the chat box, or use the
  headset icon for hands-free voice mode. With an NVIDIA GPU it runs on the GPU (`:cuda` image).
  The Whisper model downloads on first use. Change it with `WHISPER_MODEL` in `.env`.
- **Text to speech** uses your browser's built-in voices by default (Admin > Settings > Audio).

## Automation / tools

Models that support tool calling (qwen3.x, gpt-oss) can use Open WebUI **Tools** and **web search**.
- Admin > Settings > Models > *model* > Advanced Params > **Function Calling = Native** gives the best tool use.
- Workspace > Tools lets you add community tools (calculators, web fetch, calendars, etc.).
- Open WebUI also has an OpenAI-compatible API (Settings > Account > API keys) for scripts and n8n/Zapier-style automation.

## Everyday commands

```bash
./setup.sh               # start (and download any new models listed in .env)
./setup.sh --down        # stop; your chats and models are kept
docker compose pull && ./setup.sh   # update Open WebUI and Ollama
docker compose logs -f open-webui   # troubleshoot
```

Add a model later: put it in `MODELS=` in `.env` and re-run `./setup.sh`, or pull it in
Admin > Settings > Models. Browse models at https://ollama.com/library.

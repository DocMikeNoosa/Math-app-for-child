# RadVox — Polish radiology dictation (prototype)

A dark, web-based dictation app for Polish radiology reports. You dictate in Polish,
and the text goes into a structured report template (TK głowy, TK klatki piersiowej,
MR kręgosłupa L-S, USG jamy brzusznej). Claude rewrites it in radiological language and
puts each finding in the right section. You check the highlighted changes, edit anything
inline, and copy the finished report into your RIS.

## Quick start

```bash
cd radiology-dictation
npm install
cp .env.example .env        # then put your key in ANTHROPIC_API_KEY
npm start                   # → http://127.0.0.1:3000
```

Open the address in **Chrome or Edge**. Those browsers have Polish speech recognition
built in; Firefox and Safari don't, but you can still type there.

Get an API key at <https://console.anthropic.com>. It is billed per use (roughly 1–5 US
cents per report). If there is no key, the app still runs in **local mode**: dictated
sentences go into template sections by keyword rules, without AI rewriting.

## How to use

1. Choose a template (or press keys `1`–`4`).
2. Click the big microphone button (or press `Space` / `F2`) and dictate. For example:
   *"w prawym płacie czołowym obszar hipodensyjny dwanaście milimetrów bez efektu masy kropka
   reszta bez zmian kropka wnioski podejrzenie przebytego udaru"*
3. Stop recording. With "Opracuj automatycznie" switched on, the text is processed
   straight away (otherwise press **Opracuj z AI** or `Ctrl+Enter`).
4. Changed text is highlighted in blue. Anything Claude was unsure about appears under
   **Do sprawdzenia**.
5. Click into any section to edit it by hand. **Cofnij / Ponów** undo and redo, and
   **Akceptuj zmiany** clears the highlights.
6. **Kopiuj opis** (`Ctrl+Shift+C`) copies plain text ready to paste into the RIS. The
   **Nagłówki** switch adds organ names in front of each line.

You can dictate more later: new dictation is merged into the existing report. You can also
type an instruction (e.g. *"skróć wnioski"*). Under ⚙ **Mój styl opisu** you can save
personal style rules that are sent with every request.

Voice commands: `kropka`, `przecinek`, `dwukropek`, `nowa linia`, `nowy akapit`,
`otwórz/zamknij nawias`. Numbers and units are converted automatically
("dwa przecinek pięć milimetra" → "2,5 mm", "l cztery l pięć" → "L4/L5").

## How it works

| Part | File |
|---|---|
| Speech recognition (Web Speech API, pl-PL) + microphone visualiser | `public/js/speech.js` |
| Templates (normal text per section) | `public/js/templates.js` |
| Polish text: numbers, units, voice commands, local fallback, diff, export | `public/js/polish-text.js` |
| UI | `public/index.html`, `public/styles.css`, `public/js/app.js` |
| Server (static files + `/api/format`) | `server.js` |
| Claude prompt, JSON schema, merge | `lib/claude.js` |

Claude (default `claude-opus-5-5`, effort `medium`) gets the template, the current report,
the dictation and your style rules. It returns structured JSON (`output_config.format`,
validated against a schema). It is instructed **never to invent findings or change
measurements, sides or levels**, and to report doubts as warnings. The server merges the
result into the report section by section, so no section can be lost. The server-side
refusal fallback (`fallbacks: "default"`) is on; set `CLAUDE_FALLBACKS=0` to turn it off.

## Privacy — read before clinical use

- 11-digit numbers (PESEL) are removed before anything is sent to the AI. Still, don't
  dictate patient identifiers.
- **Chrome's speech recognition sends audio to Google's servers.** That is fine for a
  prototype but not for patient data in production. Before clinical use, replace it with
  speech recognition hosted under a GDPR data processing agreement (e.g. a self-hosted
  Whisper model in the EU).
- The report text is sent to the Anthropic API. Production use with health data needs a
  data processing agreement and a legal review.
- Your settings and the current report are stored only in this browser (localStorage).
- This is a writing aid, not a diagnostic tool. The radiologist reviews and signs every report.

## Tests

```bash
npm test
```

The tests cover the Polish text processing, the local fallback, the diff, the export, the
server, and the Claude call path (against a mock Anthropic API that checks the request shape
and error handling).

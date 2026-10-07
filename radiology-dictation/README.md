# RadVox — Polish radiology dictation (prototype)

A dark, web-based dictation app for Polish radiology reports. You pick one of your own templates
(trauma / non-trauma, by anatomical region) and dictate in Polish. Claude rewrites the dictation in
radiological language, inserts it in the right place, **removes every template statement the
dictation contradicts**, and writes a short conclusion from the pathological findings. You check
the highlighted changes, edit anything inline, and copy the report into your RIS.

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

1. **Choose a template**: click the template button in the top bar (or press `T`). Templates are
   grouped **Uraz / Bez urazu** (trauma / non-trauma) and then by anatomical region. Typing
   searches every template (e.g. "kub", "żebra"), recently used ones are listed first, and the
   arrow keys plus Enter work too.
2. Click the big microphone button (or press `Space` / `F2`) and dictate in Polish.
3. Stop recording. With "Auto po zatrzymaniu" switched on, the text is processed straight away
   (otherwise press **Opracuj z AI** or `Ctrl+Enter`).
4. Changed text is highlighted. **Skorygowano szablon** lists every template sentence that was
   removed or rewritten, and why. **Do sprawdzenia** lists anything to verify.
5. Edit the report directly. **Cofnij / Ponów** undo and redo, and **Akceptuj** clears the highlights.
6. **Kopiuj opis** (`Ctrl+Shift+C`) copies the report in exactly the template's own layout
   (Badanie / Opis / Wnioski).

**Wstawki** (`W`) inserts ready-made fragments (snippets) into the dictation box. You can dictate
again later and the new dictation is merged into the report. Type an instruction ("skróć wnioski")
for the AI, and set personal style rules under ⚙.

## Findings first, new report, speed

- **Findings first:** pathological findings go to the top of the description, right under the
  technique / comparison line, most urgent first (bleeding, mass effect, pneumothorax… before
  fractures, before old or incidental findings). The normal template text follows. Claude is
  instructed to do this, and the rule-based checker re-orders the report as a safety net
  (Polish reports). Multi-region templates (e.g. total body) list findings before "Głowa:".
- **Nowy opis** (`Alt+N`): finishes the report and starts a clean one with the same template.
  If the report wasn't copied, or there is unprocessed dictation, it asks first. "Cofnij" can
  still bring the previous report back. The small **Szablon** button only resets the template
  text of the current report.
- **Speed (⚙ → Tryb AI):** **Szybki** (default, low effort), **Dokładny** (medium effort,
  slower), **Turbo** (fast output mode, about 2× the price per report; if it's unavailable or
  rate-limited the app falls back to Szybki automatically). Each processed report shows how
  many seconds it took.

## Cross-check: dictation always beats the template

Every template sentence is a default "normal" statement. After each dictation the whole report is
checked, and any template statement contradicted by a dictated finding is removed. If only part of
a list sentence is contradicted, only that part goes and the rest is re-joined grammatically:

| Dictated | Template before → after |
|---|---|
| subdural haematoma | "Struktury mózgowia bez zmian ogniskowych, bez cech krwawienia śródczaszkowego, ostrych zmian niedokrwiennych…" → "Struktury mózgowia bez zmian ogniskowych, bez cech ostrych zmian niedokrwiennych…" |
| left ureteric stone | "Nie stwierdza się złogów w układzie moczowym." → removed ("Bez cech wodonercza" stays, because a stone alone doesn't imply hydronephrosis) |
| rib fracture | "Nie uwidoczniono złamań mostka, żeber i kręgosłupa piersiowego." → "Nie uwidoczniono złamań mostka i kręgosłupa piersiowego." |
| splenic laceration | "Bez cech urazu wątroby, śledziony, trzustki…" → "Bez cech urazu wątroby, trzustki…" |
| old lacunar infarcts | "bez zmian ogniskowych" removed; "Bez cech ostrej patologii" kept (old ≠ acute) |

This works in two layers:
- **Claude** gets a mandatory cross-check instruction and returns a list of what it changed.
- **A deterministic checker** (`public/js/crosscheck.js`) runs afterwards as a safety net, and is
  also the whole engine in local mode. It uses a Polish radiology vocabulary of finding types,
  organs (with hierarchy, e.g. ureter ⊂ urinary tract ⊂ abdomen), sides, negation ("bez", "nie
  stwierdza się"), uncertainty ("nie można wykluczyć" counts as a finding), acute vs old changes,
  and sub-headings such as "Klatka piersiowa:".

If you type a finding by hand, the checker does not change your text. Instead a red
**Sprzeczność z szablonem** (conflict with the template) panel appears, with **Popraw** (fix) /
**Pomiń** (skip) per sentence and **Popraw wszystkie** (fix all).

## Conclusions (Wnioski)

When the report contains pathology, the conclusion is written automatically: a short form of each
relevant pathological finding, most urgent first (bleed, mass effect, pneumothorax… before old or
minor findings), in the template's own style ("- …" or "1. …"). Template conclusion lines that are
still true (e.g. "Bez wewnątrzczaszkowych zmian pourazowych") are kept underneath, and
contradicted ones are removed. Dictating "wnioski …" yourself replaces the automatic conclusion.
Claude writes these conclusions in proper radiological shorthand; local mode reuses your own
sentences, shortened.

## Languages: dictate PL / EN, report PL / EN

Two switches (both need Claude, so they're locked when there is no API key):

- **Mowa PL | EN** (dictation language; `L` toggles it). This sets the speech recognition
  language (pl-PL / en-US) and the voice commands: Polish "kropka" / "przecinek" or English
  "full stop" / "comma" / "new line", "five by four millimetres" → "5 x 4 mm",
  "l four l five" → "L4/L5".
- **Opis PL | EN** (report language, next to "Kopiuj opis"). The report is written in this
  language whatever language you dictate in. Switching it translates the current report. An
  untouched template switches back to Polish instantly, without a call, and English template
  translations are cached for the session. An English report copies with
  "Examination: / Findings: / Conclusion:".

So you can dictate in English and get a Polish report, or the other way round.

**Fidelity check (`fidelityWarnings`):** after every AI response, the app checks that each
number from the dictation (2.5 = 2,5) and each side (right/left ↔ prawa/lewa) appears in the
report. If not, a warning appears under "Do sprawdzenia". The rule-based template cross-check
understands Polish only, so with an English report the cross-check is done by Claude alone.

## Layouts

- **Full screen**: dictation panel on the left, report on the right.
- **Half screen** (about 700–1180 px wide): the dictation becomes a compact strip above the report.
- **Phone**: everything stacks.

## Templates

`public/js/template-data.js` holds your 45 entries (35 report templates and 10 snippets), plus
MR L-S and USG abdomen from the first prototype (47 in total). To add or change a template, edit
that file. The text format is the same as in your template manager (first line =
examination, `Opis:`, body, `Wnioski:`, conclusion lines).

## How it works

| Part | File |
|---|---|
| Speech recognition (Web Speech API, pl-PL) + microphone visualiser | `public/js/speech.js` |
| Templates: parsing, trauma/region catalogue, snippets, export | `public/js/templates.js`, `public/js/template-data.js` |
| Cross-check, local merge, conclusions | `public/js/crosscheck.js` |
| Polish text: numbers, units, voice commands, diff | `public/js/polish-text.js` |
| UI | `public/index.html`, `public/styles.css`, `public/js/app.js` |
| Server (static files + `/api/format`) | `server.js` |
| Claude prompt, JSON schema, safety-net merge | `lib/claude.js` |

Claude (default `claude-opus-5-5`, effort `medium`) returns structured JSON (`output_config.format`)
containing the header, body, conclusion, corrections and warnings. The refusal fallback
(`fallbacks: "default"`) is on; set `CLAUDE_FALLBACKS=0` to turn it off.

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

The tests cover the Polish text processing, all 35 templates (parsing and an exact export round trip), the cross-check and conclusions on real templates, the
server, and the Claude call path (against a mock Anthropic API that checks the request shape
and error handling).

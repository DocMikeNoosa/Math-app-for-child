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

## Desktop icon (Windows) — recommended for daily use

1. Install Node.js (nodejs.org, LTS) once.
2. Unzip RadVox, open the `radiology-dictation` folder and double-click
   **Zainstaluj RadVox (Windows)**. It installs the components, asks for your API key once
   (saved in `C:\Users\<you>\.radvox\.env`, so updates keep it) and creates a **RadVox** icon on
   the desktop and in the Start menu.
3. From then on just double-click **RadVox**. The app starts in the background with no console
   window and opens in its own Chrome / Edge app window. It switches itself off about
   20 minutes after you close the window.

After downloading a new version, run **Zainstaluj RadVox (Windows)** from the new folder once;
it points the icon at the new version and keeps your key. If an older copy of RadVox is still
running in the background, the icon stops it and starts the new one (it compares the folder
and version reported by `/api/status`). The version and folder in use are shown at the bottom of
⚙ Settings. Your templates and settings live in
the browser and stay as they are.

Files: `launcher/RadVox.ps1` (starts the server hidden, waits for it, opens the app window),
`launcher/install-shortcuts.ps1` (creates the icons), `public/icons/radvox.ico`. The server stops
when idle if `RADVOX_IDLE_EXIT_MIN` is set (the launcher sets 20); the page pings it every minute.

## How to use

1. **Choose a template.** The app opens blank. Click **Wybierz szablon**, a recently used
   template, or the template button in the top bar (or press `T`). You can also dictate first:
   if you press Przygotuj opis before choosing, the template list opens and the report is
   prepared as soon as you pick one.

   Template list details: Templates are
   grouped **Uraz / Bez urazu** (trauma / non-trauma) and then by anatomical region. Typing
   searches every template (e.g. "kub", "żebra"), recently used ones are listed first, and the
   arrow keys plus Enter work too.
2. Click the big microphone button (or press `Space` / `F2`, or the button on your dictation
   microphone) and dictate in Polish, in any order.
3. Stop recording. Stopping does **not** create the report. You can dictate more, use voice
   commands, or type. When you're done, press **Przygotuj opis** (`Ctrl+Enter`, or say
   "przygotuj opis").
4. Changed text is highlighted. **Skorygowano szablon** lists every template sentence that was
   removed or rewritten, and why. **Do sprawdzenia** lists anything to verify.
5. Edit the report directly. **Cofnij / Ponów** undo and redo, and **Akceptuj** clears the highlights.
6. **Kopiuj opis** (`Ctrl+Shift+C`) copies the report in exactly the template's own layout
   (Badanie / Opis / Wnioski).

**Wstawki** (`W`) inserts ready-made fragments (snippets) into the dictation box. You can dictate
again later and the new dictation is merged into the report. Type an instruction ("skróć wnioski")
for the AI, and set personal style rules under ⚙.

## Dictation workflow (new in this version)

- **Przygotuj opis (Prepare report).** The report is made only when you ask for it.
- **Prepared in the background while you dictate** (⚙ → "Opracowuj w tle podczas dyktowania",
  on by default).
  - In each pause the dictation so far goes to the AI. When you press Przygotuj opis the result
    is usually already there ("Opis gotowy"), so it appears at once.
  - If you dictated more since the last pause, the app waits for or makes a fresh request.
  - Cost: each pause is a request, so AI costs are roughly 2–4× higher (the instructions and the
    template are cached). Switch it off to pay only for Przygotuj opis.
- **Voice commands** (recognised anywhere in what you say):

  | Say | Does |
  |---|---|
  | "skasuj ostatnie zdanie" / "delete last sentence" | removes the last sentence of the dictation |
  | "skasuj ostatnie słowo" / "delete last word" | removes the last word |
  | "cofnij to" / "scratch that" | removes the last spoken fragment |
  | "wyczyść dyktat" / "clear dictation" | empties the dictation box |
  | "przygotuj opis" / "prepare report" | prepares the report |
  | "kopiuj opis" / "copy report" | copies the report |
  | "zakończ dyktowanie" / "stop dictation" | stops recording |
  | "zmień …", "popraw …", "dodaj do wniosków …", "usuń z opisu …", "skróć …", "polecenie …" | goes to the AI instruction field and is carried out with the next Przygotuj opis |

- **Dictation microphone button (Nuance PowerMic or similar)**, set up under ⚙:
  - **Połącz PowerMic** connects the microphone through WebHID (Chrome / Edge). Then press the
    button you want to use; RadVox learns it.
  - Press once to start dictating, press again to stop. Stopping never creates the report.
  - Alternative: **Przypisz klawisz** binds any non-typing key (F9, F10, Pause…), for example a
    key that Nuance PowerMic Manager sends for the microphone button. The key works everywhere
    in the app, even while typing.
  - Limitation: this was tested with simulated button reports only, not a real PowerMic. Some
    drivers (Dragon / PowerMic Manager) may keep the device for themselves; then use the
    key-binding option.
- **Dzisiaj (Today's reports)** (`D`): every report you copy, or finish with Nowy opis, is listed
  with its time. You can copy it again or open it back in the editor. Only today's reports are
  kept, and only in this browser.
- **Learn my style** (⚙ → "Ucz się mojego stylu", on by default):
  - When you reword the AI's sentences before copying, RadVox stores the pair "AI version → your
    version" (up to 50, in this browser).
  - The latest 12 pairs go to Claude with each request as style examples (word choice,
    abbreviations, phrasing), never as content. You can delete single examples or all of them.
- **Clock**: a small date and time sits in the top bar.

## Classifications and consultation line

- **Classifications**: when the dictation gives the data a standard system needs, Claude adds the
  category to that finding's conclusion line. Supported systems:
  - Fleischner 2017 (incidental lung nodules);
  - Bosniak 2019;
  - ACR TI-RADS (points + TR);
  - LI-RADS v2018;
  - ASPECTS;
  - Fazekas.

  If something is missing, no category is given; instead there is a warning naming the missing
  data (e.g. "Bosniak: brak informacji o wzmocnieniu"). This is a prompt rule only: there is no
  separate calculator yet, so always check the category.
- **Consultation recommendations** ("Wskazana pilna konsultacja neurochirurgiczna.") never stay in
  the description. They go on one line under the conclusion, after an empty line, without a
  hyphen. Several
  recommendations share that line, urgent ones first.
  - Claude is instructed to do this.
  - The rule-based checker (`extractRecommendations` / `placeRecommendations` in `crosscheck.js`)
    enforces it for Polish and English reports and in local mode.
  - Recommendations are only included when you dictate them.

## Order of findings, new report, speed

- **Order follows clinical logic, not the order you dictated in:**
  - **Leading findings** (haemorrhage, mass effect, acute ischaemia, oedema, pneumothorax,
    dissection, occlusion, free air / fluid, organ laceration, the obstructing stone in a KUB,
    disc herniation, a suspicious mass) go to the top of the description, right under the
    technique / comparison line, most urgent first.
  - **Secondary findings** (fractures, old or incidental lesions, cysts, degenerative and
    small-vessel change, sinus mucosa…) stay in their anatomical place in the template, next to
    the statements about the same structure. A skull fracture stays with the bones; an L1 fracture
    goes under the lumbar part of a whole-body template.
  - **Linked findings** move up together: an epidural haematoma with the skull fracture beneath
    it, a pneumothorax / haemothorax with same-side rib fractures, a pelvic fracture with active
    bleeding.
  - **Combined studies** (sub-headings such as "Głowa:", "Kręgosłup szyjny:", "Klatka
    piersiowa:", "Jama brzuszna i miednica:"): the same rules apply **within each section**.
    Every finding goes under its own region's heading (liver injury under the abdomen, rib
    fractures under the chest), never above the first heading. Each section starts with its
    most relevant findings; if a section has no leading finding, its fractures / injuries come
    first.
  - **Related normal statements follow the finding**: rib fractures → "Bez cech odmy
    opłucnowej i bez cech krwiaka opłucnowego. Bez cech urazu płuc."; vertebral fracture →
    alignment / no dislocation; solid-organ injury → no active extravasation, other organs
    uninjured; intracranial bleed → oedema / mass effect, ventricles; ureteric stone →
    hydronephrosis statement. A liver / spleen injury is followed by the haemoperitoneum, in the
    description and in the conclusion.
  - **Layout**: when the leading findings come from different body systems (e.g. a ruptured
    spleen and a ureteric stone), each system's group, with its related normal statements, is
    its own paragraph, separated by an empty line. The conclusion is ordered the same way
    (brain/skull lines together, then abdominal organs, spine, chest wall…) but without empty
    lines between them. The still-true normal lines come last, and the consultation line sits
    under everything after one empty line.
  - Claude follows these rules (and may add other clinical links). The rule-based checker
    (`findingRank`, `linkedTo`, `arrangeFindings` in `crosscheck.js`) enforces them as a safety
    net for Polish reports.
- **Nowy opis** (`Alt+N`): finishes the report and returns to the blank screen, ready for the
  next patient's template. If the report wasn't copied, or there is unprocessed dictation, it
  asks first. "Cofnij" can still bring the previous report back. A report left unfinished
  when the app was closed is not lost: it appears in **Dzisiaj** marked "niedokończony", and
  the app opens blank. The small **Szablon** button only resets the template
  text of the current report.
- **Speed:**
  - For dictation Claude returns only the changes (`edits`: insert this finding at the top or
    after a given sentence, replace or delete a given sentence) plus the conclusion, instead of
    rewriting the whole report. Far less text to generate means a faster answer.
  - `lib/edits.js` applies the edits. If a target sentence can't be found, the finding is still
    inserted at the top and a warning is shown.
  - The instructions and the template are cached (`cache_control`).
  - Translation still uses the full-report format.
  - ⚙ → **Tryb AI**: **Szybki** (default, low effort), **Dokładny** (medium effort), **Turbo**
    (fast output mode, about 2× the price; falls back to Szybki when unavailable). Each processed
    report shows how many seconds it took.

## Your own templates

- Open the template menu (`T`) and click **✎** next to any template to edit it. Edited
  templates are marked "zmieniony"; **Przywróć oryginał** undoes the change, and **Ukryj** hides
  a built-in template you don't use.
- **+ Nowy szablon** creates your own template (marked "mój"): name, Uraz / Bez urazu, region,
  and the text in the usual format (`Badanie: …` / `Opis:` / `Wnioski:`). **Wstaw bieżący opis**
  turns the current report into a template; **Duplikuj** copies an existing one.
- **⋯ → Eksportuj / Importuj** saves your templates to a file (`radvox-szablony.json`) for backup
  or to share with a colleague, who imports it in their copy of RadVox.
- Your templates are stored in this browser (localStorage) and sent with each AI request.

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
| Polish text: numbers, units, punctuation commands, diff | `public/js/polish-text.js` |
| Voice editing commands | `public/js/voice-commands.js` |
| Learn my style (sentence pairs) | `public/js/style-learning.js` |
| Dictation microphone button (WebHID, learn mode) | `public/js/mic-button.js` |
| UI | `public/index.html`, `public/styles.css`, `public/js/app.js` |
| Server (static files + `/api/format`) | `server.js` |
| Claude prompt, JSON schema, safety-net merge | `lib/claude.js` |

Claude (default `claude-opus-5-5`; effort set by the AI mode, default `low`) returns structured JSON (`output_config.format`)
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
- Your settings, the current report, today's reports and the learned style examples are stored
  only in this browser (localStorage). Today's list is cleared automatically the next day.
- This is a writing aid, not a diagnostic tool. The radiologist reviews and signs every report.

## Tests

```bash
npm test
```

The tests cover the consultation line, voice commands, style learning, the microphone button
logic, the Polish text processing, all 35 templates (parsing and an exact export round trip), the cross-check and conclusions on real templates, the
server, and the Claude call path (against a mock Anthropic API that checks the request shape
and error handling).

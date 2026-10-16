# RadVox — project handoff (for another Claude conversation)

Read this first, then `README.md` (features in detail) and the code. Repository:
https://github.com/DocMikeNoosa/Math-app-for-child — branch `claude/polish-radiology-dictation-e0ov8p`, folder
`radiology-dictation/`. Version 0.16.2 (see `package.json`). 0.16.2: PowerMic „found but not connected” fixed — a microphone is several HID parts (keyboard, media keys, the maker's part 0xFFA0 with button + light); restore / „Wykryj mikrofon” / the chooser used to open the FIRST part listed (order changes with USB port / restart), now mic-button.js interfaceScore/rankInterfaces/openBest open the best part (falls back to the next if it cannot be opened), openAllowed() for already-allowed devices, a better part arriving later replaces a worse one; the report shows the opened part, all parts with scores and the open error. 0.16.1: quality statistics for buyers — in „Błąd mowy” the radiologist also ticks „AI poprawiło ten błąd” (entry.fixed: recognition error corrected, final report right); speech-log.js summarize/stats (final reports correct + Wilson 95% CI, errors corrected by AI, per type overall and in the final report, per week, per exam) and statsPage (printable HTML, save as PDF; states the method and limits, small-sample warning, no claims beyond the data; one script PRINT_SCRIPT allowed by CSP hash in Pro). RadVox / IR: Settings → „Statystyki (PDF dla klientów)”; Pro: admin → Błędy mowy → „Raport dla klientów (PDF)” (/api/admin/speech-log/report?days=30|90), column speech_log.fixed. 0.16.0: speech-recognition error log — „Błąd mowy” button on the report toolbar shows the raw recognised text (heardLog, reset with „Nowy opis”) next to the final report, an automatic number check (public/js/speech-log.js compareNumbers: dictated numbers missing from the report / numbers added that were neither heard nor in the template; spelled-out numbers converted first), error types to tick (or „Bez błędów”) and a note; stored in this browser (radvox.speechlog.v1, max 300), Settings → Dziennik rozpoznawania mowy: totals, error rate, list, CSV for Excel, clear. Same in IR; in Pro the entries go to the server (table speech_log, identifiers scrubbed, 180 days, RODO export/erase) and the admin panel tab „Błędy mowy” (totals, per doctor, entries, CSV, delete). Tests test/speech-log*.test.js. 0.15.5: changed at the doctor's request — GROUP, DO NOT MERGE: the AI puts same / similar findings (e.g. left and right subdural haematomas, all fractures, all nodules, one organ) together in one group of the report and conclusion, each lesion keeps its own description; new sentences go next to an existing one of the same group (insert after it). Self-correction rule unchanged. 0.15.4 (superseded): the AI groups every mention of the same finding (e.g. a subdural haematoma mentioned at the start and again at the end) into one description and one conclusion line, also across dictation parts (replace edit of the existing sentence); different lesions stay separate (warning if unsure); self-corrections ("nie…", "poprawka", "nie 8, tylko 11 mm") keep only the corrected value, two values without a correction marker → warning, never a guess. Same rules in IR (same device / vessel / value, chronology kept) and Pro; tests test/grouping.test.js. 0.15.3: a button release is taken from any message (PowerMic 4 may report it in its status message) — presses only from genuine button messages; timeline of button messages and light changes in the report („Test przycisku”); „Znajdź czerwony kolor” lights one channel of the light command at a time (all channels = orange on PowerMic 4). 0.15.2: PowerMic 4 built in (KNOWN_BUTTONS + KNOWN_LEDS: button byte 8 bit 0 in "80 00 00 20" messages; light = output report 0 [02 ff×8] on, [02 00×8] off — attempt 259 on a real device); learned buttons carry a message signature so status messages ("…08…", light echo) never count as presses; presses ignored for 0.5 s after a light change; first press after start fixed. 0.15.1: step-by-step light check of a range of attempts (Diagnostyka → „Sprawdzaj po kolei”), KNOWN_LEDS in mic-button.js (built-in light code per model, used automatically in all apps — add the PowerMic 4 code there once found). 0.15.0: NO DIAGNOSIS — the AI only restates and summarises what was dictated (no inferred diagnosis, differential, classification, interpretation, recommendation or own normal statement); the safety code no longer inserts a default normal line (template lines or a warning instead); tests test/no-diagnosis.test.js. 0.14.6: automatic light-code search (Diagnostyka → „Szukaj kodu automatycznie”): every command byte of the vendor output report is flashed (two value patterns), the user clicks when the light flashes, the last 10 are checked one by one; confirmation first (undocumented commands). 0.14.5: PowerMic 4 light code can be typed in (Diagnostyka → „Kod czerwonej diody”, own on/off commands); IT guide to read it from Nuance software: docs/POWERMIC-LED-CAPTURE.md. 0.14.4: recording sound is a choice (marimba default, soft tone, bell, click, none) with preview; the diagnostic report lists the device layout, every red-light attempt and which microphone the voice comes from; Settings warn when a PowerMic is connected but the voice comes from another microphone. 0.14.3: first-start window (microphone: computer or dictation mic; start/stop sound), "Wykryj mikrofon" in Settings → Mikrofon, soft start/stop chime (public/js/chime.js, can be switched off), faster red-light search (groups first, then halves; keyboard part skipped). 0.14.2: a new PowerMic replacing the remembered one is taken over automatically (or with one click on the main screen), its button is learned with two presses and the red light is found right after.
UI rule from the radiologist: do NOT change the look of buttons (keep the thin blue rim on active
toggles) or the overall layout when adding features — add functionality in the existing style.

## The person and the goal
- Owner: a Polish radiologist, not technical — explain things in short, simple steps.
- Goal: an AI-powered dictation app for **Polish radiology reports**: dictate (Polish or English), the app
  merges the dictation into the radiologist's own templates, removes template statements the dictation
  contradicts, orders findings clinically and writes the conclusion ("Wnioski"). The radiologist reviews
  and copies the report into the RIS.
- Preferences: never invent facts (say "I don't know"); test everything before delivering; deliver a
  polished, working app. Only made-up / anonymised cases for now (not GDPR-ready).
- Possible future: commercial web version with logins/subscriptions; an **Italian** version (asked about,
  not started — recommended as one app with a PL/IT language setting); a password-protected hosted link
  for friends (asked about, not started).

## How it works
- `server.js` — Node 20+ HTTP server (static files + `/api/status`, `/api/format`). Key in
  `~/.radvox/.env` (`ANTHROPIC_API_KEY`). Idle auto-exit for the desktop launcher.
- `lib/claude.js` — the Claude prompt (`SYSTEM_PROMPT`), JSON schemas, request building
  (structured outputs, prompt caching, speed modes fast/accurate/turbo). Normal dictation returns compact
  "edits" (`lib/edits.js` applies them); translation returns the full report.
- `public/js/crosscheck.js` — deterministic Polish safety net run after the AI (and the whole engine
  without AI): lexicon of finding concepts / organs (hierarchy) / sides / negation; prunes contradicted
  template statements grammatically; section-aware ordering; pertinent negatives; conclusion generation
  and layout; consultation line.
- `public/js/app.js` + `index.html` + `styles.css` — dark UI (vanilla JS). Speech: Web Speech API
  (Chrome/Edge, pl-PL / en-US) in `speech.js`.
- Other modules: `templates.js` / `template-data.js` (the radiologist's 35 templates + the shared library in `templates-pro/`: 397 templates + 112 snippets in total, same as Radiopis),
  `polish-text.js` (spoken numbers/units/punctuation), `voice-commands.js`, `style-learning.js`,
  `mic-button.js` (Nuance PowerMic via WebHID + key binding).
- Windows install: `Zainstaluj RadVox (Windows).bat` → desktop icon (`launcher/RadVox.ps1`, no console).
- Tests: `npm test` (90 unit tests). UI was tested with Playwright + a mock Claude server (scripts not in
  the repo).

## Report rules the radiologist asked for (keep these)
1. Dictation always overrides the template: contradicted template statements are removed or rewritten
   (e.g. blood in the head removes "bez cech krwawienia"; a stone removes "bez złogów").
2. Dictation order doesn't matter; the app orders findings:
   - leading findings (bleed, pneumothorax, organ laceration, obstructing stone…) on top, most urgent first;
   - secondary findings stay anatomical (skull fracture with the bones) unless linked
     (epidural haematoma + skull fracture; pneumothorax + rib fractures; liver injury → haemoperitoneum);
   - **combined templates** (sub-headings "Głowa:", "Klatka piersiowa:"…): each finding goes under its own
     section, never above the first heading; most relevant first within each section;
   - **pertinent negatives follow the finding** (rib fractures → "Bez cech odmy… krwiaka opłucnowego";
     spine fracture → alignment; organ injury → no active extravasation; stone → hydronephrosis);
   - findings from **different body systems** at the top of the description are separate paragraphs
     (empty line between).
3. Conclusion: short forms of the pathology, grouped by body system, most urgent first, **no empty lines
   inside the conclusion**; still-true normal template lines last.
4. A dictated consultation ("Wskazana pilna konsultacja neurochirurgiczna.") never goes in the body: one
   line under the conclusion, **after one empty line, no hyphen**. Only when dictated.
5. EMERGENCY RELEVANCE (v0.9): the radiologist is an emergency radiologist.
   - Body order: technique line; the comparison line, only when dictated; relevant findings with
     pertinent negatives; normals plus expected / age-related findings; bones last.
   - The conclusion contains ONLY findings relevant to the patient now. Age-related, chronic or
     degenerative findings (small-vessel disease, atrophy, old lacunes, degenerative change, cysts,
     calcifications) never appear in it, except in dementia studies or when dictated as "wnioski".
   - With nothing relevant, the conclusion is the normal line ("Bez ostrej patologii
     wewnątrzczaszkowej." / "Bez wewnątrzczaszkowych zmian pourazowych.").
   - The original template can always be viewed ("Oryginał"), copied from and restored; restored
     sentences are protected.
   - The app learns from the radiologist's edits: wording, conclusion lines removed or added,
     restored sentences, and example final reports per template.
5b. CLINICAL DETAILS + EMERGENCY TIERS (v0.10): an optional "Dane kliniczne" box (or the voice
   command "dane kliniczne …") gives context, and is never copied into the report.
   - Findings are ranked in tiers: (1) life-threatening; (2) acute; (3) important non-acute, which
     always goes in the conclusion (metastases, new mass, large aneurysm); (4) incidental, which
     stays in the body only.
   - Within a tier, findings answering the clinical question come first. Clinical context never
     outranks a tier-1 finding.
   - Example: ruptured AAA first in the body and conclusion; liver metastases also in the conclusion.
5c. LAYOUT (v0.11): the most common use is a NARROW window (~450–560 px wide) beside the PACS,
   sometimes narrow and full-height. Below 760 px: a slim dictation strip on top and the report
   filling the rest with its own scroll. Clinical details can be dictated with the mic inside the
   box, or by voice ("dane kliniczne …" until "koniec danych klinicznych").
5d. LEARNING + CONCLUSION POINTS (v0.12):
   - "Nauka AI" panel: the user pastes their own reports or phrases. `POST /api/learn`
     (`lib/learn.js`) asks Claude for a style profile (rules, preferred phrases) plus at most 3
     clarification questions, each with a suggested phrase the user rewrites.
   - The profile and own samples are sent with every report (cached block). Every edit is still
     learned automatically.
   - Under the conclusion, "Punkty": tick/untick, edit or delete each line; tick in suggested
     points (findings not in the conclusion, template normal lines).
   - Languages are clearly labelled ("Mówię", "Opis po"), in the original button style.
5e. ENGLISH → POLISH IS A FIRST-CLASS PATH (v0.13): the radiologist dictates better in English;
   the report is Polish.
   - The prompt has a dedicated EN→PL section: idiomatic Polish, never word-for-word.
   - Every EN-dictated report that is copied becomes a learning pair (English dictation → signed
     Polish text). Up to 6 pairs are sent with each English dictation, together with a binding
     EN→PL glossary (built by the analysis plus manual entries).
   - English accent setting: en-GB / en-US.
6. Classifications (Fleischner, Bosniak, TI-RADS, LI-RADS, ASPECTS, Fazekas) only from dictated data;
   otherwise a warning naming what is missing.
7. Workflow: app opens **blank** (choose a template); stopping dictation does NOT make the report — the
   "Przygotuj opis" button does (background pre-processing during pauses makes it instant); "Nowy opis"
   returns to blank. Voice commands, PowerMic toggle (press = start, press = stop), today's reports list,
   style learning from edits, bold date/clock in the top bar.

## Known gaps / ideas discussed
- Speech recognition is Chrome's general Google engine — the biggest weakness. Options priced: ElevenLabs
  Scribe Realtime (~$0.39/h audio), Azure Speech (~$1/h, EU region, custom vocabulary). Test on real
  dictations before choosing.
- Not validated on real dictations at scale; real Claude output quality and the real PowerMic were never
  tested by the developer (no key / no device in the build environment).
- No RIS/PACS integration (copy-paste), no comparison with prior studies, no accounts/audit log, legal
  (GDPR, possibly medical-device rules) not addressed.
- Suggested next steps: in-app error log for a 30–50 case test; better speech recognition; prior-study
  comparison and measurement helpers; trial by a colleague; then hosting/legal; Italian version.

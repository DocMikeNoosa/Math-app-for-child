# RadVox — project handoff (for another Claude conversation)

Read this first, then `README.md` (features in detail) and the code. Repository:
https://github.com/DocMikeNoosa/Math-app-for-child — branch `claude/polish-radiology-dictation-e0ov8p`, folder
`radiology-dictation/`. Version 0.14.2 (see `package.json`). 0.14.2: a new PowerMic replacing the remembered one is taken over automatically (or with one click on the main screen), its button is learned with two presses and the red light is found right after.
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

# RadVox IR — handoff

Folder `radiology-ir/` in https://github.com/DocMikeNoosa/Math-app-for-child, branch `claude/polish-radiology-dictation-e0ov8p`.
It is a copy of RadVox (`radiology-dictation/`, v0.14.1) turned into an interventional / neurointerventional
radiology app (v1.0.0). Read `README.md` first.

## The person
A Polish emergency radiologist, not technical: explain in short, simple steps. Never invent facts — say "I don't know".
Test everything before delivering. Only made-up / anonymised cases. Keep the RadVox look (buttons, layout) —
RadVox IR only changes the colours (crimson accent, amber recording) and adds the „Zabieg” button.

## Technical notes
- Port 3300 (RadVox 3000). The localStorage keys are the same as RadVox, but the port makes the origin different,
  so the data is separate. The API key file `~/.radvox/.env` is shared.
- Templates: 190 + 43 snippets in `public/js/templates-ir/` (6 files + `index.js`).
  - `parseTemplate` reads Polish (Badanie / Opis / Wnioski) and English (Procedure / Findings / Conclusion) labels.
  - `t.en` holds the parsed English version.
  - `reportFromTemplate(t, lang)` and `isPristine(report, t)` replace the old `lang: 'pl'` comparisons.
- Menu language = report language (`state.outputLang`); `setMenuLang` / `titleOf` in `templates.js`. Group and
  section labels are `[pl, en]` pairs (`sections.js`).
- `lib/claude.js` has the IR system prompt.
  - It contains no EMERGENCY / TIER / Fleischner rules; the tests check this.
  - `finish()` calls `checkProcedure` (`public/js/procedure.js`) instead of `enforceConsistency`.
- `crosscheck.js` is still loaded for helpers (splitSentences, etc.); its diagnostic engine is not used.
  `template-data.js` and the diagnostic tests were removed.
- Tests: 58 (`npm test`): `ir.test.js`, `server.test.js` (mock API), plus the shared voice / style / text tests.

## Version 1.1 (card / 3D / letter)
- `public/js/card.js`: card model and text, built-in letter, placeholders. `cardui.js`: card, letter and device-picker UI.
  `diagram3d.js`: three.js renderer (`public/vendor/three.mjs`, copied from EndoList), with the SVG renderer
  (`diagram.js`) as fallback. `diagrams/*.js`: 17 regions, with an optional `z` per part (number, or one value per path vertex).
- `variants.js`: anatomical variants. `effect(side)` → hide / scale / add parts. `devices.js`: equipment catalogue.
- `lib/letter.js` + `POST /api/letter`. The letter is stored with placeholders only. The patient's name lives in sessionStorage.
- Tools: `tools/check-diagrams.mjs`, `tools/preview-diagram.mjs` (2D PNG), `tools/preview-3d.mjs` (3D PNG).
- Tests: `test/card.test.js`, plus the earlier tests (67 in total).

## Open items
- Clinical review of the templates by an IR / neuro-IR specialist (see README „Not checked yet").
- Not yet tested against the real AI from here (no API key in the build environment).

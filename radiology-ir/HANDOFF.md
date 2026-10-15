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

## Version 1.4 (dictation → card)
- `public/js/parse.js`:
  - `localParse(text, { categories })` is the rule-based parser (Polish / English, Unicode-aware). It handles the vessel
    alias table → model base id + side, findings and fields, catalogue device matching (flexible spacing, brand short
    forms, quantities, sizes), procedures inferred from finding + devices, and card-level data.
  - `applyParsed(card, parsed, { diagrams, categories })` merges the result into the card. It updates an existing lesion
    on the same vessel; a sentence with results only fills the fields of the matching lesion.
  - Helpers: `resolvePart`, `matchDevice`.
- `lib/cardparse.js` + `POST /api/card-parse`:
  - the Claude prompt is cached, together with the app vocabulary (parts, findings / fields, procedures, catalogue,
    clinical keys);
  - the output uses a strict JSON schema;
  - `normaliseCardParse` drops anything outside the vocabulary.
- `cardui.js`:
  - the `#cardSay` bar (`toggleCardMic`, which app.js routes Space / PowerMic to on the card; `sayApply`; `undoSay`);
  - lesion editor in steps (`leStep`), `REL_PROCS` (procedures per finding), `QUICK` (device categories per
    procedure);
  - `devRows` for editing size and quantity in place;
  - `focusLesion` → `model3d.focus(index)`.
- `card.dictation` (the last sentences) is added to `cardToText` as the radiologist's verbatim words.
- Tests: 79 (`test/parse.test.js`, plus a server test for the card parse).

## Version 1.3 (letter figures, realism, Polish equipment ranking)
- `public/js/figure.js`: `renderFigure(model, lesions, index, { lang, callout })`. It renders the lesion off-screen
  (`createModel3D(..., { figure: true })`, `frame(index)`, `figureLabels()`) and draws the labels, callout and scale bar
  on a 2D canvas. Output is a PNG data URL (memory only).
- `model3d.js`:
  - custom tapered tubes (`tubeGeo`), joint smoothing and organic waviness;
  - `model.decor` rules for fine branches (merged mesh, not clickable);
  - studio PMREM environment;
  - devices: `laserStent`, `braid`, `coilMass`, nidus `tangle`;
  - `chainSpan` lets devices continue into neighbouring segments;
  - per-view `hide` regex;
  - figure camera: front-oblique, perpendicular to the vessel or dome, with vessels far from the lesion hidden.
- `card.js`: `figureCallout`, `figureCaption`, `coilCount`. `cardui.js`: `letterFigures` (cached), `#lpFigures`, print
  and copy (ClipboardItem with HTML).
- `devices-pl.js` (generated from research notes): `PL_ORDER` with confidence, and `PL_ADD`. `devices.js` applies it;
  items with confidence high/medium get `common: true` (★ in the picker).
- Templates and regions can carry `also: ['Vascular']`. The carotid / vertebral section uses it.
- Tests: 71.

## Version 1.2 (true 3D models)
- `public/js/models/neuro3d.js`, `body3d.js`: segments `S(id, pl, en, r, pts)` in mm (x = patient left, y = up,
  z = anterior). `P(...)` = paired, written for the right side and mirrored to `_l` by `expandModel`.
- `public/js/model3d.js`: tube renderer. Lesions are drawn on vessels. Picking returns `{id, t}`; the vessel whose wall
  is under the pointer wins. View buttons; `screenPoint` / `snapshot`.
- `public/js/clinical.js`: lesion field definitions, calculators and scales; card-level clinical sections.
- Non-vascular regions are organ lists (`nv_*`, from `anatomy.js`). The coronary and heart modules were removed.
- Tests: 68 (`npm test`). The connectivity test checks that every segment starts on another vessel.

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

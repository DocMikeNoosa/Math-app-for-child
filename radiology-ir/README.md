# RadVox IR — dictation for interventional and neurointerventional radiology

RadVox IR is the interventional-radiology sister of **RadVox** (`../radiology-dictation`). It has the same
layout and the same dictation / AI / learning features, a **crimson** colour scheme (RadVox is teal) and an amber
recording button. It runs on its own port (**3300**), so RadVox (3000) and RadVox IR can be open at the same time.

## What is different from RadVox

- **190 procedure templates + 43 snippets**, every one in **Polish and English** (name and full text):
  - **Naczyniowe / Vascular (71):**
    - aorta (EVAR, TEVAR, endoleaks);
    - visceral and renal arteries;
    - liver oncology (cTACE, DEB-TACE, TARE planning and treatment, PVE);
    - haemorrhage and trauma;
    - chest vessels (BAE, pulmonary AVM, PE thrombolysis, SVC);
    - pelvis (UAE, PAE, varicocele);
    - peripheral arteries (PTA, stents, DCB, CTO, acute limb ischaemia);
    - veins (DVT, May-Thurner, IVC filter), TIPS / BRTO;
    - dialysis access; ports / PICC / tunnelled catheters.
  - **Nienaczyniowe / Non-vascular (66):**
    - biliary (PTBD, stents, cholecystostomy);
    - urinary (nephrostomy, ureteric stent);
    - biopsies of every organ;
    - drainages, thoracentesis / paracentesis;
    - ablation (liver, kidney, lung, bone, thyroid);
    - gastrostomy and GI stents;
    - spine / MSK (vertebroplasty, kyphoplasty, injections), coeliac neurolysis, hook-wire localisation.
  - **Neurointerwencja / Neurointervention (53):**
    - cerebral and spinal DSA, balloon test occlusion;
    - stroke thrombectomy (ICA-T, M1, M2, basilar, tandem, failed);
    - aneurysm coiling (AComA, PComA, MCA, basilar tip, PICA), balloon- / stent-assisted coiling;
    - flow diverters, intrasaccular device, parent vessel occlusion;
    - carotid / vertebral / intracranial stenting;
    - AVM and dural fistulae, CCF;
    - tumour embolization, vasospasm;
    - venous sinus thrombectomy / stenting, epistaxis, carotid blowout;
    - MMA embolization.
- **Template language PL / EN.**
  - Names and template text are Polish by default.
  - The PL / EN switch in the template menu, or the report-language switch, shows English names and loads the
    template's own English text, with no AI needed for that.
  - Dictation paths: PL → PL, EN → PL, EN → EN, and PL → EN.
- **„Zabieg” (key A) — procedure by anatomy:**
  1. Body part (brain / circle of Willis, neck, chest, abdomen, pelvis, upper limb, lower limb, spine / MSK).
  2. One or more vessels or organs, e.g. ICA C1–C7, ACA A1–A3, AComA, MCA M1–M4 / bifurcation, PComA, PCA P1–P4,
     basilar trunk / tip, SCA, AICA, PICA, VA V1–V4, dural sinuses, coeliac / hepatic / splenic / SMA / renal,
     iliac / uterine / prostatic, femoral … tibial, liver, kidney, bile ducts… Then the side.
  3. The procedure.
  4. A suggested template: the one naming the chosen vessel comes first.

  „Wstaw” opens the template and fills its „Lokalizacja:” / „Target:” line (e.g. „Rozwidlenie MCA – strona lewa”).
- **Report structure:** Wskazanie, Lokalizacja, Znieczulenie, Dostęp, Sprzęt, Przebieg zabiegu, Wynik,
  Zużycie środka kontrastowego / Czas fluoroskopii / Dawka, Powikłania, Zalecenia, then Wnioski.
  - Every value the operator must give (sizes, French, doses, volumes, times, grades) is „…” in the
    templates, never an invented number.
- **AI rules for procedures** (`lib/claude.js`):
  - Order = chronology: nothing is moved to the top as in diagnostic reports.
  - Before- and after-treatment statements are both true, e.g. active bleeding before and none on the control run.
  - A dictated complication replaces „bez powikłań”; a failed or partial result rewrites every success statement.
  - Scales (eTICI, Raymond-Roy, OKM, NASCET…) are added only from dictated data.
  - „…” is never filled with a guess.
  - After every report the app lists the key values still left as „…” (access, devices, result, contrast / time /
    dose, complications, conclusion).
- **No diagnostic engine:** RadVox's automatic contradiction pruning and conclusion re-ordering are switched off
  (`public/js/procedure.js` replaces them). Without AI, dictated „Dostęp …”, „Sprzęt …” etc. fill their lines,
  other sentences are added to the end of „Przebieg zabiegu”, and „Wnioski …” replaces the conclusion.

## Start

- **Windows:**
  1. Unzip and open `radiology-ir`.
  2. Run **Zainstaluj RadVox IR (Windows)** once. It creates the **RadVox IR** icon.
  3. Then use the icon, or **Start RadVox IR (Windows)**.
- **Mac:** double-click **Start RadVox IR (Mac).command**.
- **Command line:** `npm install && npm start` → <http://127.0.0.1:3300>.

The API key is shared with RadVox: if RadVox is installed, its key in `~/.radvox/.env` is used and nothing is asked.

## Files

- `public/js/templates-ir/*.js`: the library.
  - Fields: `id`, `title`, `titleEn`, `group` (Vascular | NonVascular | Neuro | Snippets), `section`, `priority`,
    `proc` (procedure keys), `anat` (body parts), `text`, `textEn`.
  - Check it with `npm run check-templates`.
- `public/js/sections.js`: groups and menu sections (PL / EN labels).
- `public/js/anatomy.js`: body parts → vessels / organs → procedures, and template suggestions.
- `public/js/procedure.js`: procedure-report safety net (missing values, empty conclusion) and the no-AI merge.
- Tests: `npm test`. AI calls are tested against a mock server; a real AI run needs your key.

## Not checked yet

The templates were written from general IR knowledge and have not yet been reviewed by an interventional
radiologist. Practice varies, e.g.:
- the order of steps in tandem stroke lesions;
- the balloon test occlusion protocol;
- the TARE details;
- the proximal splenic embolization landing zone;
- the thrombolysis regimen.

Please read through the templates you use and edit them (pencil icon in the menu). Your edits are kept in the
browser and the AI learns from them.

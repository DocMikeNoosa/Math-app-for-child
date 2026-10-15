# RadVox IR — dictation for interventional and neurointerventional radiology

RadVox IR is the interventional-radiology sister of **RadVox** (`../radiology-dictation`). It has the same
layout and the same dictation / AI / learning features, a **crimson** colour scheme (RadVox is teal) and an amber
recording button. It runs on its own port (**3300**), so RadVox (3000) and RadVox IR can be open at the same time.

## Version 1.5 — letter layout: small schematic, logo, signature, referrer details

- The **schematic is small**: it sits in the upper right corner of the letter body (about 6 cm wide in print), and the
  text flows around it. It is redrawn for that size: larger lettering, only the treated vessel and the callout are
  labelled, and it is zoomed on the lesion. The small print underneath (coils, devices, result) stays.
- **Logo** of the hospital / clinic in the upper left corner. Upload it under *Nadawca i podpis* → *Wybierz plik…*
  (PNG / JPG).
- **Operator's signature** above the sender block. Either upload a scan (*Wgraj skan…*) or sign with the mouse, a
  finger or a stylus (*Narysuj*). The logo and the signature are stored only on this computer and never go to the AI.
- **Referrer details** (*Dane lekarza kierującego*): street, postcode and town, phone / e-mail and licence number
  (PWZ). They appear in the „Do:" block and are remembered with the doctor's name. The next time you pick that doctor,
  they are filled in.
- **Drukuj / PDF** uses the same layout (A4). **Kopiuj list** pastes the logo, the small picture on the right and the
  signature into e-mail / Word (when the browser allows images on the clipboard).

## Version 1.4 — „Powiedz, co zrobiłeś": say it, check it, done

The procedure card is now built around one box at the top: **Powiedz, co zrobiłeś** (say what you did).
1. **Say or type what you did.** Click the microphone (or press Space / the PowerMic button), speak, click again — or
   type and press Enter. Example: „Embolizacja tętniaka AComA 6 na 5 mm, szyja 3 mm, pięć spiral MicroPlex Cosmos, stent
   LVIS EVO 3,5 × 18, Raymond-Roy 1, dostęp prawa udowa 6 F, znieczulenie ogólne, bez powikłań".
   - The card fills itself: the vessel (with side and segment), the finding and its numbers, the procedure, the devices
     (matched to the catalogue, with sizes and quantities), access, anaesthesia, contrast / fluoroscopy / dose,
     NIHSS / ASPECTS / times, Hunt-Hess, Rutherford… The 3D model zooms to the lesion and shows the treatment.
   - A green line shows what was entered, with **Cofnij** (undo). More sentences can be added at any time; a sentence
     about the same vessel updates it.
   - With AI the dictation is understood by Claude, which is given the app's exact vessel list and device catalogue.
     Without AI (or if the AI fails) a built-in parser does it. It understands Polish and English, including inflected
     Polish words, number words and brand short forms. Nothing that was not said is filled in.
2. **Check and complete — four small steps per lesion:** Zmiana (finding) → Leczenie (treatment) → Sprzęt (devices) →
   Wynik (result). Only the open step is shown. The summary line of each step shows what is already there.
   - Treatment shows only the procedures that fit the finding (all of them one click away).
   - Devices: one-tap ★ chips with the products most used in Poland for the chosen procedure (e.g. coils, assist
     stents, remodelling balloons, microcatheters for coiling). Type the size directly in the list; − / + changes the
     quantity; the total number of coils is shown.
3. **Report and letter** with the buttons at the bottom, as before. The dictated words also go to the report / letter AI
   (the card fields take precedence).

Other changes:
- The left dictation panel is hidden on the card (one place to dictate). Procedure details (access, dose,
  recommendations…) are folded under „Szczegóły zabiegu".
- A start screen explains the three steps.

## Version 1.3 — schematic figures in the letter, realistic 3D vessels, equipment used in Poland

- **The letter has a figure for each treated lesion** (up to 4): a 3D schematic centred on the lesion, showing the
  treatment. Examples:
  - a coiled aneurysm with the coil pack;
  - stent-assisted coiling;
  - a flow diverter across the neck;
  - an AVM with its Onyx / Squid cast and draining vein;
  - a carotid stent with a protection filter;
  - a peripheral stent.

  The figure has the vessel names, a callout (e.g. „Tętniak · 6 × 5 mm · 5 spiral · LVIS EVO") and a scale bar. Below
  it, small print lists the coils (total and each type with size and quantity), the other devices and the result
  (Raymond-Roy, eTICI, residual stenosis…). The figures:
  - are drawn on this computer only, and are never sent to the AI or stored;
  - can be switched off with „schematy zabiegu";
  - are included in **Drukuj / PDF**, and in **Kopiuj list** when the browser allows images on the clipboard.
- **More realistic 3D vessels:**
  - the vessels taper and the joints are smooth;
  - small arteries have a natural wave;
  - fine cortical and perforating branches are drawn on the brain surface;
  - the walls are glossy;
  - the circle-of-Willis view hides the neck.
- **Devices are drawn as they look:** laser-cut stents with zig-zag rings, braided flow diverters, platinum coil packs
  that fill the sac, the WEB, plugs and liquid embolic casts. Stents follow the vessel wall across neighbouring
  segments (e.g. CCA → bulb → ICA).
- **Carotid stenting is in both Neuro and Vascular.** The carotid templates show under both groups, and in Vascular the
  carotid/brain model opens on the neck view.
- **Equipment ordered by use in Poland.** In each category, the products used most often in Poland come first and are
  marked ★. There are 41 new products (620 in total), e.g.:
  - Balton (Warsaw): Mer, Robin, Jaguar, Neptun C, Nefro C, Lovix;
  - CGuard Prime, Derivo 2heal, Accero, Comaneci 17, FemoSeal, and others.

  **Source:** Polish peer-reviewed series (Szczecin, Bydgoszcz, WIM Warsaw, Bródno, Kraków, Katowice, Wrocław, Gdańsk) and
  manufacturer pages. Polish tender documents could not be read, so **this is not a sales ranking**. Peripheral categories
  rely more on the EU market position. Details are in `public/js/devices-pl.js`.

## Version 1.2 — true 3D neurovascular and vascular models, clinical scales

What changed:
- **Neuro** has one true 3D model in millimetres: from the aortic arch to the cortical branches (121 vessel
  segments). It covers:
  - ICA C1–C7 and the carotid bifurcation;
  - ECA branches (including MMA, IMA and STA);
  - vertebral V1–V4, PICA, AICA, SCA, the basilar artery and its tip;
  - PCA P1–P4, PComA, AChA and the ophthalmic artery;
  - ACA A1–A4, AComA, the callosomarginal and frontopolar arteries;
  - MCA M1 with the lenticulostriate arteries, the bifurcation, and M2–M4.
  Views: Willis, AP, lateral, posterior circulation, neck, whole.
- **Vascular** has one true 3D model of the body (109 segments). It covers:
  - the thoracic aorta by zones 0–3;
  - the coeliac, SMA and IMA trees, the renal arteries;
  - the internal iliac branches (including the prostatic / uterine artery);
  - the leg arteries down to the pedal arch.
  Views: aorta, arch (LAO), visceral, renal, pelvis, thigh, knee / calf, whole.
- Lesions are **drawn on the model** at the place you click (proximal / mid / distal): narrowing, clot, aneurysm sac
  (with size and dome direction), stent, flow diverter, stent graft, coils, WEB, plug.
- Each lesion has proper clinical fields. Examples:
  - stenosis with **NASCET / WASID % calculated from the diameters**, TASC II and PACSS;
  - thrombus with eTICI before / after, technique, BGC, passes and **first-pass effect**;
  - aneurysm with size, neck, **dome-to-neck ratio**, Raymond-Roy, OKM and WOS;
  - AVM with **Spetzler-Martin**;
  - dAVF with Cognard / Borden.
- Card sections:
  - stroke (NIHSS, ASPECTS, times with **puncture-to-reperfusion** calculated);
  - SAH (Hunt-Hess, WFNS, Fisher);
  - PAD (Rutherford, ABI, WIfI);
  - aorta / EVAR neck;
  - carotid.
- Removed: the heart / coronary module, the bone-and-joint and liver drawings. Non-vascular procedures now use a
  clean **organ list** (click an organ, choose the side).
- 90 anatomical variants (35 neuro, 29 body). Many reshape the 3D model.

## Version 1.1 — procedure card, 3D anatomy and the letter to the referring doctor

RadVox IR is now a hybrid of a dictation app and a letter writer, like EndoList. The right-hand side has three tabs
(keys **1 / 2 / 3**):

1. **Karta zabiegu** (procedure card):
   1. Choose the branch: **Naczyniowe / Neuro / Nienaczyniowe**.
   2. Choose the region. A **3D model** appears: drag to rotate, use the wheel to zoom, double-click to reset. There are 17
      regions:
      - circle of Willis, neck vessels, venous sinuses, spinal vessels;
      - aorta, visceral arteries, pelvis and legs, upper limb, veins, coronary arteries, chest vessels;
      - liver and bile ducts (Couinaud segments), urinary tract, abdominal organs and spaces, chest organs, spine and
        joints, neck organs and node levels.
   3. Click a vessel or organ to add a lesion:
      - the finding (stenosis %, occlusion, thrombus with eTICI before / after, aneurysm with size and neck, bleeding,
        AVM…), and the residual value;
      - the procedures performed;
      - the **devices** from the catalogue: 74 categories, 611 commercial products plus generic descriptions — sheaths,
        catheters, wires, balloons, stents, stent grafts, coils, plugs, embolics, stent retrievers, flow diverters,
        biopsy needles, drains, ablation systems, drugs… Your own entries are remembered.
   4. **Warianty anatomiczne** (anatomical variants): 96 variants across the regions. Examples are fetal PCA, A1
      hypoplasia, azygos ACA, MCA trifurcation, persistent trigeminal artery, bovine arch, arteria lusoria, replaced
      RHA / LHA, accessory renal artery, peronea magna and duplex kidney. Many of them **change the 3D model** (a thin
      P1, an extra M2 trunk, a single A2…); all of them go into the report and the letter.
   5. Fill in access, anaesthesia, drugs, contrast / fluoroscopy / dose, result, complications and recommendations.
   6. „Utwórz opis z karty” sends the card as dictation. The AI picks a template and writes the procedure report.
2. **Opis**: the report for the hospital system, as before (dictation PL / EN, report PL / EN).
3. **List do kierującego** (letter to the referring doctor):
   - Enter the referring doctor (remembered), the greeting (Pani / Pan / Zespół), the patient and the date.
   - Options: language PL / EN, length, a specialist or a GP as reader, and warning signs on or off.
   - „Napisz list”: Claude writes a letter in plain clinical language — what was done, result, complications, drugs,
     follow-up and implanted devices.
   - „Popraw z AI” revises it; „Bez AI” builds a letter from a fixed pattern.
   - Copy or print / PDF.
   - **Patient names never reach the AI.** The letter is written with placeholders ([[PACJENT]], [[DATA_UR]]…), filled
     in only on this computer. The patient's name is kept only until the browser is closed.

Vessel abbreviations (MCA, PCA, PComA, SMA, RHA, CFA…) stay in their English form in Polish reports and letters.



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

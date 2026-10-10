# DentList

DentList is the multi-specialty version of **EndoList** for **Centrum Stomatologiczne (Niewiński Group)**. It records treatment from every dental specialty and writes professional Polish letters to the referring doctor. It also produces records for the patient chart (ProDentis), shows a colour-coded visit history, and lets the medical director handle complaints. All patient data is encrypted.

> **The original app is separate and unchanged.** "EndoList", referred to as *the original* or *the endodontics one*, is **version 2.4.1**, in the `endolist/` folder. DentList is a copy with its own name, port (4174), data, login space and installer. Installing one never touches the other.

## Specialties

There are 10 specialties, each with its own subdued colour gradient. The colours appear on the chart, the procedure cards, the letter chart and the visit history.

**Specialties:** Stomatologia zachowawcza · Endodoncja · Chirurgia stomatologiczna · Implantologia · Periodontologia · Protetyka · Ortodoncja · Stomatologia dziecięca · Chirurgia szczękowo-twarzowa · Higienizacja i profilaktyka.

- **Home specialty:** each doctor chooses one in the first-start screen or in Settings. It sets the order of the tooth-card steps, the default procedures and materials, and the accent colour. Every specialty is **always available**: an endodontist can record a filling, and a general dentist can record a root canal or an extraction.
- **Procedures:** 83 in total, each with its own fields (for example an implant has system, Ø, length, Ncm, ISQ and protocol; a crown has stage, material and cement). They fall into two kinds:
  - **Tooth procedures:** recorded on the chart.
  - **Whole-mouth procedures:** orthodontics, periodontal charting and staging, dentures, splints, hygiene and so on. These are recorded in the visit panel "Zabiegi w obrębie jamy ustnej".
- **Materials and equipment:** brands available on the Polish market, grouped by specialty (implant systems, bone substitutes and membranes, sutures, brackets and aligners, impression materials, sealants, fluorides and more).
- **Primary teeth (51–85):** patients under 6 start on the primary-dentition chart. A switch changes between primary and permanent teeth.
- **Other diagnosis (ICD-10):** a field with suggestions, e.g. K02.1, K05.3, K01.1, K07.x.

## Visit history (patient card)

- Each visit shows short chips per tooth, plus "JU" for whole-mouth procedures, coloured by specialty.
- You can filter by specialty.
- Click a visit to expand it to the full clinical record; it can be copied as a ProDentis entry.

## Clinic overview (administrators / medical director)

- The **Placówka** view shows **all doctors' patients and all their treatment**. The data is decrypted with the clinic key, is read-only, and every access is recorded in the activity log.
- From there, a **complaint about another doctor's patient** can be opened. The complaint keeps an encrypted snapshot of that patient's visits as they were at the time of the complaint.

## Complaints and letters (Skargi)

Available to administrators (or to a single doctor without a clinic).

1. **Patient and treatment:** choose the patient (from the whole clinic) and tick the visits concerned.
2. **The letter:** record the source (patient, family, law firm, Rzecznik Praw Pacjenta, chamber of physicians, NFZ, insurer), sender, date received, deadline and the allegations in brief.
   - Add **scans or photos of the letter**. On a phone you can take a photo.
   - Scans are stored inside the encrypted record.
3. **Position:**
   - Tick the **preset arguments** that are true in this case (informed consent, current medical knowledge, documentation and X-rays, known complication, prognosis, non-compliance with instructions, and more).
   - Write your **own position** and, optionally, an **offer**, and choose a **tone**.
4. **Response:** an **AI-drafted response** (or a built-in draft without AI):
   - It describes the treatment from the documentation and answers each allegation.
   - It never admits liability unless your position says so.
   - Warnings point out things to check.
   - Save it as PDF, print it or copy it.
   - Patient, sender and address data are pseudonymised before reaching the AI. The scan is sent to the AI **only** if you tick "Pozwól AI odczytać skan pisma".
   - The response is always a **draft** for the medical director. For letters from a law firm or compensation claims, consult a lawyer or the liability (OC) insurer.

## Workflow

1. **Patient and referrer:** enter first name, last name and **PESEL** (it fills in the date of birth and sex, with checksum validation) or the date of birth. Then choose the referring doctor or clinic; the app remembers them.
2. **Dentition chart:** click a tooth and an **enlarged tooth card** opens:
   - **3D model** of that tooth (drag to rotate, X-ray view) with its most common anatomy: number of roots and canals, MB2, MM, radix, C-shaped. Pink means pulp or canal, teal means filled canal, violet means a lateral canal.
   - **Anatomia:** configuration, number of roots, canals (add or remove), lateral canals.
   - **Badanie i rozpoznanie:** tests and X-ray findings; a suggested AAE diagnosis in Polish with an ICD-10 code.
   - **Endodoncja:** one-click ticks for the most common steps (rubber dam, microscope, apex locator, measurement X-ray, NaOCl, EDTA, ultrasonic activation, Ca(OH)₂, CWT, bioceramic sealer, Cavit, control X-ray), plus anaesthesia, working lengths, irrigation, obturation, sealer and intra-operative findings.
   - **Inne prace:** fillings (Black's class I–VI, surfaces, material and product), build-ups, posts, crown preparation, crowns, onlays, extraction, implant preparation, implant placement, perio, "other".
   - **Materiały i sprzęt:** a catalog of brands available in Poland (instruments, apex locators, sealers, obturation systems, MTA and bioceramics, composites, adhesives, posts, cements, anaesthetics, microscopes). Anything typed by hand is remembered for next time.
   - **Opis własny:** a free-text description of anything not covered by the form, typed or **dictated**. AI puts it into proper dental language and checks it against the rest of the data.
   - **Zalecenia:** restoration and its deadline, follow-up, prognosis.
   - **Zapisz ząb:** saves the tooth. Then choose the next one.
3. **Generuj list:** you can combine several visits, including treatment done earlier by other dentists. The opening and closing courtesies change from letter to letter for each recipient.
4. **Review:**
   - **Select a passage** that is wrong or reads badly. A small window appears: describe what is wrong and how it should read, then tick **Gotowe**. Repeat for further passages, one at a time.
   - Optionally tick **Edytuj cały list** and describe the changes in your own words (or dictate them).
   - **Popraw list z AI** applies all comments at once. The changes made are listed in the side panel, and **Sugestie AI** point out possible inconsistencies.
   - **Edycja ręczna** lets you edit the text directly. **Wygeneruj od nowa** writes the letter again from scratch.
5. **PDF / e-mail / ProDentis / print:**
   - The PDF is filed as `Listy/<Nazwisko Imię (data ur.)>/<RRRR-MM-DD> … .pdf`.
   - E-mail: a draft with the attachment (.eml), the share menu, or the mail program.

**Dictation** (microphone button next to text fields) works in Chrome and Edge, as in RadVox. After dictation, AI fixes speech-recognition errors in dental terms, product names, numbers and tooth numbers. This can be switched off in Settings.

## Logos

The Centrum Stomatologiczne logo (from the clinic's website, as provided) is built in: it appears in the app, on the login screen and in the letter header. You can replace it or add the group logo under **Settings → Logo kliniki i grupy**.

## iPhone and sync

- **iPhone:** the layout adapts to the phone:
  - tab bar at the bottom of the screen
  - the tooth card opens full screen
  - the letter fits the screen width
  - dialogs slide up from the bottom
- **Highlights on iPhone:** press and hold on the letter text to select a passage. A **Dodaj uwagę** button then appears for adding a comment.
- **Sync** keeps the same data on iPhone, the practice computer and the browser.
  - Once the server address is configured (one time, see below), every device just uses the normal login screen. The same login and password open the account and download all its data.
  - New accounts are created on the server too. Existing accounts start syncing at their next password login, including all earlier data.
  - A password changed on one device works on the others straight away.
  - Each change is encrypted on the device before it is sent. The server stores only ciphertext and does not know the login, the password or any names.
  - New device: **"Mam konto na innym urządzeniu"** → server address, login and password.
- **Server:** the sync server is set up once, on a free Cloudflare account. See [`sync-server/README.md`](sync-server/README.md).
- **Folder backups:** the iPhone cannot save to a computer folder. With sync on, the data reaches the computer, which keeps making folder backups.

## Installation

**Desktop icon (local).** Unzip DentList, then:

- **Windows** (no extra programs needed; Windows PowerShell serves the app on this computer only, and Node.js is used if it's installed): double-click `Zainstaluj DentList (Windows).bat`. This creates an **DentList** icon (a tooth on a navy background) on the desktop and in the Start menu. Clicking it starts the app in its own window, with no console.
- **Mac** (needs Node.js LTS from nodejs.org): double-click `Zainstaluj DentList (Mac).command`. This creates **DentList.app** with the icon in `~/Applications`; drag it to the Dock.

**Link for other doctors (GitHub Pages).** The `.github/workflows/pages.yml` workflow publishes the `public/` folder. Enable it under Settings → Pages → Source: *GitHub Actions*. From the link, the app can also be installed via Chrome or Edge (menu ⋮ → *Install DentList*). Each doctor has separate, encrypted data on their own computer.

## Clinic and administrators

- **Setup:** Settings → **Gabinet** → *Załóż gabinet*. The person who creates the clinic becomes its first administrator. This needs sync to be on.
- **Admins** get an **Administracja** tab, where they can:
  - invite doctors or more admins with a one-time code valid for 7 days;
  - grant or remove admin rights (there is always at least one admin);
  - remove a person, which cuts off their access and wipes clinic data from their devices on the next sync, while the clinic keeps the records;
  - reset a forgotten password;
  - view and export a doctor's data and activity log;
  - turn AI on or off for the whole clinic.
- **How it works:** each doctor's data key is also locked to the clinic key, which only admins hold. The server can't read anything.
- **Logging:** every admin action is recorded in the activity log.
- **Joining:** a doctor enters the invite code under Settings → Gabinet → *Dołącz kodem zaproszenia*.

## AI and privacy (RODO)

- **Model:** Claude (`claude-opus-5-5`), using the clinic's own API key from console.anthropic.com, which is stored encrypted.
- **AI on with a key:** AI works as soon as the clinic's API key is saved in Settings (Anthropic's Commercial Terms for API accounts include a data processing agreement). Without a key, nothing is sent and the built-in writer is used. In a clinic, an admin can turn AI off for everyone.
- **Pseudonymisation:** before anything is sent to AI, the app replaces names (including inflected forms), PESEL, dates of birth, phone numbers, e-mail addresses and the referrer's details with tokens. It puts them back locally in the reply. This covers dictated and hand-typed text too.
- **Settings → Ochrona danych (RODO):**
  - a log of activity (logins, opened records, letters, PDFs, e-mails, AI use, deletions), exportable to CSV;
  - a review of data past the retention period.
- **Patient page:**
  - **Eksport danych** (RODO Art. 15 and 20);
  - deletion of all the patient's data, with confirmation by surname.
- **Documentation for the clinic and its data protection officer (IOD):** [`docs/RODO.md`](docs/RODO.md) covers roles, legal bases, a checklist, and a template entry for the record of processing activities.

## ProDentis

There is no public API or import format for ProDentis (Infotel Software). The export saves the PDF (to attach to the patient's documents) and a text summary to paste into the visit description. A direct integration needs Infotel's cooperation.

## Development and tests

```
node server.mjs                      # http://localhost:4174 (+ /api/status)
LC_ALL=C.UTF-8 node test/e2e.cjs     # end-to-end test (Playwright + Chromium)
LC_ALL=C.UTF-8 node test/sync-e2e.cjs  # sync: computer ↔ iPhone (emulated) ↔ third device
node test/ai-sdk.mjs                 # Claude API through the real SDK (local stand-in, no key needed)
LC_ALL=C.UTF-8 node test/admin-e2e.cjs # clinic: admin (computer) + doctor (iPhone): invite, roles, reset, removal
node test/sync-api.mjs <address>      # sync protocol (local server or Cloudflare Worker)
```

The test uses stand-ins for the folder (OPFS), the passkey (virtual authenticator with PRF), speech recognition (a fake SpeechRecognition) and the Claude API (test responses, not real AI output). It runs onboarding with logos, signature and passkey; a patient with PESEL; the tooth card with the 3D model, ticks, materials and dictation; filling the card; generating the letter; highlight → comment → AI revision; manual edits; PDF; backup; the lock screen with logos; and a browser restart.

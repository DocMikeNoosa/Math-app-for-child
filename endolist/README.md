# EndoList

EndoList is an app for a Polish endodontist. You record work per tooth on a dentition chart, and it writes a professional referral letter in Polish (with AI, or with the built-in generator). The letter is a PDF with a small black-and-white dentition schematic and shorthand notes in the top-right corner.

## What it does

- **Visit screen:** a curved FDI dentition chart. Click a tooth to see its most common anatomy (roots and canals). You can change the number of roots, add canals (e.g. MB2, MM, radix) or lateral canals, then fill in:
  - **Badanie i rozpoznanie:** tests, X-ray findings, and a suggested AAE diagnosis in Polish with an ICD-10 code.
  - **Endodoncja:** procedure, status, anaesthesia, rubber dam, microscope, working lengths, irrigation, obturation, sealer, temporary restoration and intra-operative findings.
  - **Inne prace:** fillings with Black's class (I–VI) and surfaces, build-ups, posts, crown preparation, crowns, onlays, extraction, implant preparation, implant placement, perio.
  - **Zalecenia:** restoration and its deadline, follow-up, prognosis.
- **Combining visits:** a letter can combine several visits for the same patient, including treatment done earlier by another dentist (the "Inny lekarz" visit option).
- **Letter:**
  - The opening and closing courtesies change from letter to letter. The app remembers recent wording per recipient so the same doctor or clinic doesn't get the same text twice.
  - Everything is editable before saving, and the PDF preview is live.
  - Before generating, the app asks who the letter is for (a doctor as Pani/Pan Doktor, or a clinic) and remembers the answer.
- **Saving and sending:**
  - PDFs are filed into `Listy/<Nazwisko Imię (data ur.)>/<RRRR-MM-DD> … .pdf` in a folder you choose.
  - Email: share sheet, `.eml` draft with the PDF attached, or the default mail program.
  - ProDentis export (see below).
- **Security:**
  - Login and password, optional passkey (Touch ID / Face ID / Windows Hello / iPhone via QR code).
  - All data is encrypted on the device (AES-256-GCM).
  - Auto-lock after inactivity.
- **Backup:** an encrypted copy is written to the chosen folder after every change (latest copy plus 60 daily copies). If the browser's data is wiped, "Przywróć z kopii" on the login screen restores everything.

## Running it

**Online link (to share with other doctors).** After this branch is merged to `main` and GitHub Pages is switched on (repo Settings → Pages → Source: **GitHub Actions**), the app is at:

`https://docmikenoosa.github.io/Math-app-for-child/endolist/`

In Chrome or Edge, use menu ⋮ → **Install EndoList** to get a desktop app that works offline. Each doctor's data stays encrypted in their own browser; nothing is stored on a server.

**Installed locally (no hosting needed).** Install Node.js (LTS) once, then double-click:

- Windows: `Uruchom EndoList (Windows).bat`
- Mac: `Uruchom EndoList (Mac).command`

It opens at `http://localhost:4173` in an app window, and can be installed from there as well.

Use **Chrome or Edge**. Safari and Firefox work, but can't save automatically into a folder; letters download instead, and backups have to be downloaded by hand in Settings.

## AI and privacy

- **Model:** letters are written by Claude (`claude-opus-5-5`) using the doctor's own API key from console.anthropic.com, entered in Settings. The key is stored inside the encrypted vault.
- **What is sent:** only clinical facts — tooth numbers, test results, the treatment description, and grammatical gender (needed for correct Polish). Patient names, dates of birth and addresses are not sent; the app adds them to the letter locally.
- **Free-text fields:** text you type yourself (e.g. the chief complaint or notes) is sent as written, so don't put patient names there.
- **Without an API key:** the built-in Polish generator writes the letter instead.

## ProDentis

I couldn't find a public API or import format for ProDentis (Infotel Software). The export therefore:

1. saves the PDF letter, which you attach to the patient's documents in ProDentis, and
2. produces a plain-text summary to paste into the visit description (copy button, or a `.txt` saved next to the PDF).

If Infotel provides an import interface, a direct integration could be added.

## Development

```
node server.mjs                # http://localhost:4173
LC_ALL=C.UTF-8 node test/e2e.cjs  # end-to-end test (Playwright + Chromium)
```

The test uses an in-browser folder in place of the real folder picker and a virtual passkey authenticator. It runs onboarding (with signature and passkey), a full visit, combining with another dentist's visit, letter generation, PDF filing, email draft, ProDentis export, the AI request (mocked, checked for absence of personal data), lock and unlock (password and passkey), a browser restart, and a restore after wiping browser data.

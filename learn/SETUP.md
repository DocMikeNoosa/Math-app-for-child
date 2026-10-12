# Setup guide (one time, about 15 minutes)

The app works straight away on one device. These two steps give it its own web address
(needed for the iPad microphone and Home Screen install) and a family cloud account
(log in on the iPad and the computer, with automatic backups).

## 1. Give the app a web address (GitHub Pages)

1. Merge the branch `claude/aus-curriculum-y3-y4` into `main` on GitHub.
2. On GitHub open the repository → **Settings → Pages** → under *Build and deployment*
   choose **Source: GitHub Actions**.
3. The workflow *Publish to GitHub Pages* runs on every push to `main`. When it finishes,
   the app is at:
   `https://docmikenoosa.github.io/Math-app-for-child/learn/`

   (GitHub Pages is free for public repositories; a private repository needs a paid GitHub plan.)

## 2. Family cloud account (Firebase, free tier)

1. Go to <https://console.firebase.google.com> → **Add project** (any name, e.g. `tosia-workbook`).
   Google Analytics is not needed.
2. **Authentication** → *Get started* → **Sign-in method** → enable **Email/Password**.
   Then **Settings → Authorised domains** → *Add domain* → `docmikenoosa.github.io`.
3. **Firestore Database** → *Create database* → choose a location (e.g. `australia-southeast1`
   or `europe-central2`) → start in **production mode**.
   Open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules) and **Publish**.
   These rules mean only your family login can read or write your data.
4. **Project settings** (gear icon) → *Your apps* → click the **web** icon `</>` → register an app
   (no hosting needed). Copy the `firebaseConfig = { … }` block.
5. Put the config in the app — either:
   - **easiest:** open the app → **Parent → Cloud & backup** → paste the block → **Connect**
     (do this once on each device), or
   - **once for all devices:** paste it into [`js/config.js`](js/config.js) (`firebase: { … }`) and push.
6. In the app: **Parent → Cloud & backup → Create family account** (email + password).
   On every other device: **Sign in** with the same email and password.

## 3. AI tutor (optional)

Get an API key at <https://console.anthropic.com> → *API keys*, then **Parent → Settings → AI tutor**.
It powers the tutor chat, alternative explanations, AI-made practice, handwriting reading and the progress
assessment. Usage is billed to your Anthropic account. When signed in to the family cloud the key is kept
in your private cloud space, so every device has it.

## 4. On the iPad

- Open the address in **Safari** → Share → **Add to Home Screen**. It then opens full-screen and works offline.
- Best voices: Settings → Accessibility → Spoken Content → Voices → **English (Australia) → Karen**
  and **Polish → Zosia** (download the *Enhanced* versions).
- The first time she taps the microphone, allow access (Settings → Safari → Microphone if it was declined).

## How work is protected

1. Saved instantly on the device, with a second copy in the browser’s database.
2. Daily snapshots on the device (30 days) and one before every sync or restore.
3. Live cloud sync between devices — copies are merged, finished work is never overwritten.
4. A dated cloud backup every day (kept 60 days), restorable from **Parent → Cloud & backup**.
5. Backup files you can save to Files / iCloud Drive (a reminder appears monthly).

## Tests (for developers)

```
cd learn
node tests/validate.js            # checks every lesson, quiz, challenge and exam in all four programmes
python3 -m http.server 8765 &     # then, with Playwright installed:
node tests/e2e.js                 # walks through both programmes in a browser
node tests/cloud.test.js          # two-device sync test (needs the Firebase emulators running)
```

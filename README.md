# Matematyka Tosi 🧮✨

A child-friendly math practice app for a 9-year-old preparing for grade 3 of
Polish primary school (podstawa programowa, edukacja wczesnoszkolna). Default
language: **Polski**, with full **English** translation switchable at runtime
in the parent settings.

It ships in **two editions with identical features and logic**:

1. **Web app** (`docs/` — no Mac, no App Store needed): a Progressive Web App
   that runs in Safari/Chrome, can be added to the iPhone home screen like a
   real app, and works offline after the first visit.
2. **Native iOS app** (Swift + SwiftUI, iOS 17+): kept ready for a future
   App Store / TestFlight release.

## Using the web app on an iPhone (no Mac needed)

**Option A — GitHub Pages (recommended, permanent):**
1. On github.com open this repository → **Settings → Pages**.
2. Under "Build and deployment" choose **Deploy from a branch**, pick this
   branch and the **`/docs`** folder, and save.
3. After ~1 minute the app is live at
   `https://<your-username>.github.io/Math-app-for-child/`.
4. Open that link in **Safari on the iPhone** → Share button → **Add to Home
   Screen**. It gets its own icon, launches full-screen and works offline.

**Option B — run from any computer on your Wi-Fi:**

```sh
python3 -m http.server 8123 --directory docs
```

then open `http://<computer-ip>:8123` in the iPhone's Safari (same Wi-Fi).

Progress, coins, trophies, the parent PIN and statistics are stored on the
device (localStorage). The PIN is stored as a SHA-256 hash.

## Features

- **Curriculum-true problem generator** (pure, unit-tested):
  addition/subtraction within 100 with tens-boundary crossing control,
  multiplication table & always-exact division, never-negative subtraction,
  never ÷0, ×1 only at Easy, missing-operand ("7 × _ = 56") and two-step
  ("4 + 3 × 2") problems only at Genius, never the same problem twice in a row.
- **Four-screen flow**: operations (multi-select + 🎲 Losowo) → range
  (20/30/50/100, curriculum defaults) → difficulty (🙂😃🤩🧠) → practice with a
  ≥64 pt calculator keypad, haptics, coin counter and 5-problem streak stars.
- **Answer logic**: correct → synthesized ascending chime, confetti, rotating
  pool of 28 Polish praise phrases (never repeating back-to-back, always
  addressing the child by name in the vocative, with 💬 explanations of the
  fancy words); 1st wrong → gentle retry; 2nd → tens/ones hint; 3rd →
  **interactive graphical tutorial** of that exact problem (number-line jumps,
  tens/ones decomposition, groups-of-objects, fair sharing into baskets) which
  neither counts as correct nor breaks the streak.
- **Rewards**: every 5 correct answers a full-screen celebration with original
  vector characters (unicorn, puppy, kitten, bunny, rainbow, star, dragon,
  teddy — all drawn in SwiftUI, no assets, no network) escalating over 5 tiers;
  gold-coin collection; a 12-step trophy ladder (every 10 coins) from the pot
  of gold to the magical superstar.
- **Moje skarby** (no PIN): coins, trophy shelves with mysterious silhouettes
  of future trophies, best streaks, 10 fun badges, and the child-changeable
  celebration theme (unicorns/puppies/kittens/mixed).
- **Parent zone** (4-digit PIN in Keychain, set during onboarding, with a
  security-question recovery): session config (also mid-session), language,
  full statistics dashboard (Swift Charts: accuracy over time, problems/day,
  per-operation comparison, solve-time trend, app-usage time; time frames:
  Dzisiaj/Tydzień/Miesiąc/Od zawsze/Zakres własny), daily time limit with a
  kind 5-minute warning and a gentle "good night" screen (PIN override),
  fridge-worthy **PDF diploma** (PDFKit, share/AirPrint), PIN/name/volume/reset.
- **All sounds synthesized at runtime** with AVFoundation (correct, gentle
  wrong, coin, escalating fanfares, trophy, sleepy jingle) — nothing bundled,
  nothing downloaded.

## Project layout

```
docs/                         Web app (PWA): index.html, core.js (ported,
                              tested logic), app.js (UI), styles.css, sw.js,
                              manifest, icons — served as-is by GitHub Pages
scripts/web-core-tests/       Web-core test suite (node --test), a port of
                              the Swift suites — 45 tests
run.sh                        One-command build & launch (macOS, simulator)
MatematykaTosi.xcodeproj      Xcode 16 project (file-system-synchronized
                              groups, shared scheme included)
MatematykaTosi/
  Core/                       Pure logic: generator, tutorial plans, practice
                              state machine, stats, time limit, trophies/
                              badges, praise bank, L10n, Keychain PIN store,
                              sound synth, theme
  Models/                     SwiftData models (AppState, AttemptRecord, UsageSession)
  Views/                      Onboarding, setup flow, practice, tutorial,
                              celebration, treasures, parent zone, time limit
MatematykaTosiTests/          Unit tests (XCTest, 5 suites / 66 tests)
scripts/linux-core-tests.sh   Runs the full core test suite with any
                              Swift ≥ 5.8 toolchain on Linux (used in review)
```

Notes on two deliberate choices:

- **Localization** lives in code (`Core/L10n.swift` + bilingual data in the
  praise bank, trophies, badges and tutorial plans) rather than in
  locale-bound string catalogs, because the parent switches Polski/English
  *inside the app at runtime*, independent of the system locale — every string
  in the app, including tutorials and certificates, follows the setting
  instantly.
- **Statistics/limit/generator logic** is pure and takes `now`, `Calendar` and
  a seedable RNG as parameters, so all of it is deterministic under test.

## Running the app — one command

On a Mac with Xcode 16+:

```sh
./run.sh
```

This picks (and boots) an iPhone simulator, builds the app, installs it and
launches it. Alternatively open `MatematykaTosi.xcodeproj` in Xcode and press
⌘R; for a physical iPhone set your signing team first.

## Tests

```sh
node --test scripts/web-core-tests/core.test.cjs   # web core (45 tests, any OS)
./run.sh test        # full XCTest suite in the iOS simulator (macOS)
```

The web edition is additionally verified end-to-end in a real Chromium
(Playwright): onboarding PIN → operations/range/level → 5 correct answers →
celebration → coin → 3 wrong answers → tutorial (kindness rule) → treasures →
theme → parent PIN (wrong + right) → live language switch → statistics with
all five time frames → persistence across reload — with zero console errors.

The five suites (66 tests) cover: problem generation (all operation × range ×
difficulty combinations, crossing/borrow rules, exact division, no
back-to-back repeats, Genius formats), the practice state machine (the exact
correct/wrong/wrong/wrong→tutorial answer logic, milestone-every-5, the
tutorial kindness rule, input handling, mid-session config changes),
statistics aggregation (every time frame incl. custom, summary math, daily
series, usage), coin/trophy/milestone/badge logic, praise rotation and Polish
vocative, tutorial plans (every plan ends with the correct answer), and
time-limit enforcement (overlap at midnight, warning/reached thresholds,
override expiry).

All of this logic is platform-independent and the identical suite also runs
on Linux with any Swift ≥ 5.8 toolchain (this is how the code in this repo
was verified: `scripts/linux-core-tests.sh` — 66/66 passing):

```sh
scripts/linux-core-tests.sh
```

## Manual end-to-end checklist

Onboarding PIN (twice + security question) → select operations → range →
level → solve 5 problems → celebration → collect coin → reach 10 coins →
trophy unlock → Moje skarby gallery → cogwheel → parent PIN → statistics with
each time frame → set a time limit (watch the 5-minute banner and the good
night screen, override with PIN) → switch language to English → export the
certificate PDF via the share sheet.

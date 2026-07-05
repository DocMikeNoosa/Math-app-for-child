# Matematyka Tosi 🧮✨

A child-friendly, fully offline **native iOS app** (Swift + SwiftUI, iOS 17+, portrait)
for a 9-year-old preparing for grade 3 of Polish primary school (podstawa
programowa, edukacja wczesnoszkolna). Default language: **Polski**, with full
**English** translation switchable at runtime in the parent settings.

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
MatematykaTosi.xcodeproj      Xcode 16 project (file-system-synchronized groups)
MatematykaTosi/
  Core/                       Pure logic: generator, tutorial plans, stats,
                              time limit, trophies/badges, praise bank, L10n,
                              Keychain PIN store, sound synth, theme
  Models/                     SwiftData models (AppState, AttemptRecord, UsageSession)
  Views/                      Onboarding, setup flow, practice, tutorial,
                              celebration, treasures, parent zone, time limit
MatematykaTosiTests/          Unit tests (XCTest)
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

## Building

1. Open `MatematykaTosi.xcodeproj` in Xcode 16 or newer.
2. Select the `MatematykaTosi` scheme and an iPhone (iOS 17+) simulator or device.
3. Run. (Signing: automatic; set your team for a physical device.)

## Tests

`⌘U` in Xcode, or:

```sh
xcodebuild test -project MatematykaTosi.xcodeproj -scheme MatematykaTosi \
  -destination 'platform=iOS Simulator,name=iPhone 16'
```

Covered: problem generation (all operation × range × difficulty combinations,
crossing/borrow rules, exact division, no back-to-back repeats, Genius
formats), statistics aggregation (every time frame incl. custom, summary math,
daily series, usage), coin/trophy/milestone logic, praise rotation and Polish
vocative, tutorial plans (every plan ends with the correct answer), and
time-limit enforcement (overlap at midnight, warning/reached thresholds,
override expiry).

## Manual end-to-end checklist

Onboarding PIN (twice + security question) → select operations → range →
level → solve 5 problems → celebration → collect coin → reach 10 coins →
trophy unlock → Moje skarby gallery → cogwheel → parent PIN → statistics with
each time frame → set a time limit (watch the 5-minute banner and the good
night screen, override with PIN) → switch language to English → export the
certificate PDF via the share sheet.

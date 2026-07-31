# RyczałtRx — Medical Practice Take-Home Calculator

A dark, radiology-styled take-home pay calculator for a single-owner Polish medical
practice taxed with **14% ryczałt** (ryczałt od przychodów ewidencjonowanych).

Open **`index.html`** in any modern browser — no install, no server, no dependencies.
All data stays in your browser (localStorage).

## What it does

- **Take-home calculation** — enter the month's total revenue (przychód) and get the
  full breakdown: social ZUS, health contribution (NFZ), 14% ryczałt tax, and take-home.
- **Asks which month** — the app is date/time aware but never assumes the current month;
  it suggests the last *completed* month and asks you to confirm which month the total is for.
- **Monthly records** — save, edit, and delete each month; per-year totals; effective
  deduction rate per month.
- **Trends** — revenue vs. take-home line chart and a "where the money goes"
  stacked composition chart (take-home / social ZUS / tax / health), with hover tooltips
  and 12-month / 24-month / this-year / all ranges.
- **File import** — bring totals from another app via CSV / JSON / TXT
  (recognizes `2026-03`, `03/2026`, `March 2026`, `marzec 2026`, Polish decimal commas,
  and `;`/`,`/tab delimiters), with a preview before anything is written.
- **Export** — computed table as CSV, full backup as JSON (re-importable).
- **Editable rates per year** — tax %, each social ZUS component, health tier amounts,
  and a health-tier override live in ⚙ *Rates & ZUS*.

## Tax logic (2026 defaults, editable)

| Item | Value |
|---|---|
| Ryczałt rate | 14% (medical professions) |
| Social ZUS (duży ZUS, base 5 652,60 zł) | emerytalna 1 103,27 + rentowa 452,16 + wypadkowa 94,39 + FP/FS 138,47 (+ chorobowa 138,47, optional) |
| Health, annual revenue ≤ 60 000 zł | 498,35 zł/mo |
| Health, 60 000–300 000 zł | 830,58 zł/mo |
| Health, > 300 000 zł | 1 495,04 zł/mo |

The health tier is picked automatically from cumulative year-to-date revenue.
By default the calculation deducts social contributions and 50% of the health
contribution from revenue before applying the tax rate (both toggleable), and
rounds tax to whole złoty.

> **Estimates only.** Rates change yearly — verify with your accountant / ZUS before
> filing. Nothing here is tax advice.

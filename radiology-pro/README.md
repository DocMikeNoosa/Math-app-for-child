# RadVox Pro — AI dictation for Polish radiology reports (subscription version)

RadVox Pro is the commercial, hosted version of RadVox (the original desktop app is in
`../radiology-dictation/`). Radiologists log in from any computer, dictate in Polish or English and get a
Polish (or English) report built from their templates, with clinically ordered findings and conclusions.

*Working name: "RadVox Pro". Change it with `BRAND_NAME` (server) and the `RadVox Pro` text in `public/index.html` /
`public/site/*.html`. Check trademark registers (EUIPO, UPRP) and the domain before launch.*

## What is in this version

| Area | What it does |
|---|---|
| Dictation app (`/app/`) | Everything from RadVox 0.13: templates, dictation PL/EN, AI report, safety net, learning module, conclusion points, clinical details, PowerMic, voice commands, narrow-window layout. |
| Templates | **397 templates + 112 snippets** in Polish: the radiologist's own 35 + 362 new ones (CT, CTA, MR incl. heart and breast, X-ray incl. contrast studies, mammography and DXA, ultrasound; trauma / non-trauma; adults / children; combined studies). Files: `public/js/template-data.js` (own set) and `public/js/templates-pro/*.js` (library). Validate with `npm run check-templates`. |
| Languages | PL → PL and EN → PL are the main paths; EN → EN and PL → EN also work. |
| Accounts | Registration with a free trial, login, password reset by e-mail, invitations from the admin, scrypt password hashes, HttpOnly session cookie, login rate limiting, **device limit per plan** (prevents account sharing). |
| Subscriptions | Plans with monthly report quotas (10% grace), trial → paid, monthly/annual, card payments via **Stripe** (Checkout + Customer Portal + signed webhooks) or **bank transfer** recorded by the admin. Automatic expiry, reminders 7 and 1 day before the end, past-due grace days. |
| Usage metering | Every AI call stores tokens and cost (from the API's own usage numbers). Several calls for one report count as **one report**. Background pre-processing is capped per report (cost guard). |
| Admin panel (`/admin`) | Dashboard (paying users, MRR, AI cost, margin, reports, cost per report, 30-day chart, expiring/past-due lists, top-cost users, server configuration), users (search/filter, detail drawer: extend subscription, record payment, change plan/limit/status, reset link, log out, block, delete, notes, monthly usage, payments, devices, history), AI usage per user and month, payments, plans & prices editor with a margin calculator, settings, audit log, outgoing e-mail, CSV exports (users, usage, payments for accounting). |
| Device sync | Own templates, the style profile and what the AI learned from the radiologist's corrections (style pairs, example reports, conclusion changes) follow the user to every computer — stored on the server with PESEL numbers removed. The current report and today's list never leave the browser; they are cleared when another user logs in on the same browser and on logout. |
| Organisations (1.1) | For teleradiology companies: **one licence, N seats**, per-user monthly report limit, devices per user, price per seat. The owner creates them in **Admin → Organizacje** (with the first IT administrator) and extends the licence there. |
| IT console (`/it`, 1.1) | For the company's IT administrator: seats used / free, add a person, **bulk import** (paste from Excel / CSV) with **temporary passwords** (copy or download CSV, optional e-mail), block (frees the seat at once), new temporary password, log out everywhere, delete (personal data removed, anonymous usage kept), change log, CSV export. Temporary passwords must be replaced at the first login. IT sees only its own organisation. |
| Central AI learning (1.2) | Every lesson from every radiologist (wording corrections, deleted / added conclusion lines, restored statements, example reports, EN→PL pairs, style rules, glossary) is archived **permanently** and **de-identified** in its own database (`learning.db`), so nothing is lost when the app's rolling memory drops old examples. The owner turns lessons shared by ≥ K radiologists into a versioned **global knowledge** (counts or AI distillation), reviews / edits / publishes / rolls back; it is added server-side to every AI request (personal style overrides it), and every usage row records the version (traceability). Owner-only (`Admin → Nauka globalna AI`), JSONL export; never visible to IT, customers or users, never sent to a browser. |
| RODO & security (1.2) | Terms / privacy acceptance with version and time (re-acceptance when the version changes), data export (art. 15/20), erasure (self for individuals, by IT for organisations; also removes the learning pseudonym and the e-mail from old log entries), automatic retention (log, e-mail copies, idle sessions), no passwords in stored e-mails, **encrypted backups** (`BACKUP_KEY`), **two-factor login** (TOTP), user notified when IT resets their password, robots / noindex. Document pack (Polish drafts for a lawyer): `docs/rodo/` — checklist, DPA template, records of processing, TOMs, DPIA outline, breach procedure, sub-processors, MDR / AI Act notes, IP protection. |
| IT support (1.2) | **Workstation check** (`/check`, no login needed): browser, HTTPS, connection, clock, cookies, microphone level, speech recognition (shows `network` when a firewall blocks the browser's speech service), clipboard, PowerMic / SpeechMike live data — with a fix for each problem and a report to copy or send to IT. The app reports technical problems automatically (speech, microphone button, clipboard, AI errors — codes only). IT console: problems with explanations, workstation results, per person devices (log out one device), unlock login, reset two-factor, IT guide with browser policies and ready `.reg` files for Chrome / Edge. Nothing about the server, code or AI learning is exposed. |
| Operations (1.1) | **AI traffic control** (concurrency cap + fair queue, background calls shed first, per-user cap, clear "busy" answers, automatic retry in the app), daily **online database backups** with retention + manual backup button, `/healthz`, graceful shutdown during updates, JSON request log without patient data, server health on the dashboard (queue, rejections, memory, event-loop freezes, last backup), announcement banner for all users, ETag revalidation of the app files. Deployment kit in `deploy/` (Docker Compose + Caddy HTTPS, server setup, off-site backup, restore) — see **DEPLOY.md**. Load test with 200 simultaneous users: `scripts/loadtest.mjs`, results in `docs/LOAD-TEST.md`. |
| Code protection | The app's code is served only to logged-in users with an active subscription. `npm run build` bundles, minifies and **obfuscates** the browser code (templates become encoded strings). AI instructions, billing and the database are server-only. Security headers (CSP, frame-deny, HSTS in production), CSRF header check on all API writes. |
| Privacy | PESEL numbers stripped before the AI; no report archive on the server; self-hosted fonts (no Google requests); optional **EU processing via Claude on Amazon Bedrock** (`AI_PROVIDER=bedrock`, `AWS_REGION=eu-central-1`). |
| Public site (1.2) | New sales website (`/`): animated live demo in the hero (dictation → finished report with the safety net and tiered conclusion), feature bento with motion, real app screenshot, section for companies, pricing from the admin panel (month / year), BLIK · Przelewy24 · card, security, FAQ. Self-contained (own fonts, no trackers or external requests), responsive, respects reduced motion. `landing.css`, `landing.js`, `img/`. |
| Individual purchase (1.2) | Without a company contract: register → 14-day trial → pay **in advance for 1 or 12 months by BLIK, Przelewy24 or card** (Stripe Checkout, no product setup needed, invoice + NIP) or a card subscription, or bank transfer. |

## Test on a Windows computer (one click)

Extract the ZIP, open `radiology-pro`, double-click **Start RadVox Pro (Windows).bat** (needs Node.js 22.5+).
It reuses the API key saved by RadVox, starts RadVox Pro on http://127.0.0.1:3100 and opens the login page.
Administrator: `admin@radiopis.local` / `Radiopis2026` (local test only — change it in
`%USERPROFILE%\.radiopis\.env` before any real use). Data: `%USERPROFILE%\.radiopis\data`.

## Run locally (development)

```bash
cd radiology-pro
npm install
cp .env.example .env      # fill in ANTHROPIC_API_KEY, ADMIN_EMAIL, ADMIN_PASSWORD
npm start                 # http://127.0.0.1:3000
```

Node 22.5+ (uses the built-in SQLite). The first start creates the administrator from `ADMIN_EMAIL` /
`ADMIN_PASSWORD`. Data is stored in `data/radiopis.db` (set `DATA_DIR` to move it).

## Production

**Step-by-step server guide (Poland / EU): [DEPLOY.md](DEPLOY.md)** — Docker Compose with Caddy (automatic HTTPS),
server setup script, daily backups + off-site copy, restore, monitoring, updates, capacity for 200 radiologists.

Without Docker:

```bash
npm run build                          # protected browser bundle in dist/
NODE_ENV=production npm start          # serves dist/, secure cookies, HSTS
```

Put it behind HTTPS and set `PUBLIC_URL` and `TRUST_PROXY=1` (only when the app is reachable through the proxy
alone).

### Stripe (optional)
1. Create products/prices (PLN, monthly and yearly) in Stripe.
2. Put the price ids (`price_…`) into **Admin → Plans and prices**.
3. Set `STRIPE_SECRET_KEY`, add a webhook to `https://<domain>/api/stripe/webhook` with the events
   `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`,
   `invoice.payment_failed`, and set `STRIPE_WEBHOOK_SECRET`.
Without Stripe, users see bank-transfer details (Admin → Settings) and the admin records payments by hand.

### E-mail (optional)
`RESEND_API_KEY` + `MAIL_FROM`. Without it, every message (reset links, reminders) is kept in
**Admin → Log and mail**, and the admin can copy reset/invitation links from the user drawer.

## Tests

`npm test` — 134 tests (incl. organisations, IT console, seats, temporary passwords, licence access, AI queue,
health check, learning archive and de-identification, global knowledge and its access walls, RODO export / erasure /
retention, terms acceptance, two-factor login): report engine and templates (every library template passes the safety net without
changes or self-contradictions), server + Claude request shape (mock API), accounts, quotas, device limit,
expiry, admin API, exports, Stripe webhook signatures/idempotency, sync isolation, security headers,
background cost guard. `npm run loadtest` — 200 simultaneous users against a fake AI (see `docs/LOAD-TEST.md`).
UI was checked with Playwright against a mock AI server (development and the
obfuscated production build).

## Layout

```
server.js            HTTP server: pages, auth, AI endpoints with metering, admin API, Stripe webhook
lib/db.js            SQLite schema and helpers          lib/auth.js     accounts, sessions, tokens
lib/plans.js         plans, prices, quotas, AI cost      lib/billing.js  subscriptions, Stripe
lib/jobs.js          hourly expiry / reminders / alerts  lib/mail.js     e-mail (Resend or outbox)
lib/ai-client.js     Anthropic API or Bedrock (EU)       lib/claude.js   report prompt + request
lib/learn.js         style analysis                      lib/brand.js    product name
lib/orgs.js          organisations, seats, temp passwords lib/limiter.js AI concurrency queue
lib/backup.js        daily (encrypted) backups          deploy/         compose, Caddy, setup, backup, restore
lib/learning.js      permanent learning archive         lib/global-learning.js  central knowledge versions
lib/totp.js          two-factor login                   docs/rodo/      RODO / legal / IP document pack
public/              the dictation app (+ public/js/hosted.js: session, sync, account menu)
public/site/         landing, login, account, admin, legal pages
scripts/build.mjs    protected production build          tools/check-templates.mjs  template validator
```

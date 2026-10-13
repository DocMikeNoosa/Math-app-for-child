# Radiopis — AI dictation for Polish radiology reports (subscription version)

Radiopis is the commercial, hosted version of RadVox (the original desktop app is in
`../radiology-dictation/`). Radiologists log in from any computer, dictate in Polish or English and get a
Polish (or English) report built from their templates, with clinically ordered findings and conclusions.

*Working name: "Radiopis". Change it with `BRAND_NAME` (server) and the `Radiopis` text in `public/index.html` /
`public/site/*.html`. Check trademark registers (EUIPO, UPRP) and the domain before launch.*

## What is in this version

| Area | What it does |
|---|---|
| Dictation app (`/app/`) | Everything from RadVox 0.13: templates, dictation PL/EN, AI report, safety net, learning module, conclusion points, clinical details, PowerMic, voice commands, narrow-window layout. |
| Templates | **249 templates + 75 snippets** in Polish: the radiologist's own 35 + 214 new ones (CT, CTA, MR, X-ray, ultrasound; trauma / non-trauma; adults / children; combined studies). Files: `public/js/template-data.js` (own set) and `public/js/templates-pro/*.js` (library). Validate with `npm run check-templates`. |
| Languages | PL → PL and EN → PL are the main paths; EN → EN and PL → EN also work. |
| Accounts | Registration with a free trial, login, password reset by e-mail, invitations from the admin, scrypt password hashes, HttpOnly session cookie, login rate limiting, **device limit per plan** (prevents account sharing). |
| Subscriptions | Plans with monthly report quotas (10% grace), trial → paid, monthly/annual, card payments via **Stripe** (Checkout + Customer Portal + signed webhooks) or **bank transfer** recorded by the admin. Automatic expiry, reminders 7 and 1 day before the end, past-due grace days. |
| Usage metering | Every AI call stores tokens and cost (from the API's own usage numbers). Several calls for one report count as **one report**. Background pre-processing is capped per report (cost guard). |
| Admin panel (`/admin`) | Dashboard (paying users, MRR, AI cost, margin, reports, cost per report, 30-day chart, expiring/past-due lists, top-cost users, server configuration), users (search/filter, detail drawer: extend subscription, record payment, change plan/limit/status, reset link, log out, block, delete, notes, monthly usage, payments, devices, history), AI usage per user and month, payments, plans & prices editor with a margin calculator, settings, audit log, outgoing e-mail, CSV exports (users, usage, payments for accounting). |
| Device sync | Own templates and the style profile follow the user to every computer. Report text never leaves the browser storage (current report, today's list and automatically learned examples stay local; they are cleared when another user logs in on the same browser and on logout). |
| Code protection | The app's code is served only to logged-in users with an active subscription. `npm run build` bundles, minifies and **obfuscates** the browser code (templates become encoded strings). AI instructions, billing and the database are server-only. Security headers (CSP, frame-deny, HSTS in production), CSRF header check on all API writes. |
| Privacy | PESEL numbers stripped before the AI; no report archive on the server; self-hosted fonts (no Google requests); optional **EU processing via Claude on Amazon Bedrock** (`AI_PROVIDER=bedrock`, `AWS_REGION=eu-central-1`). |
| Public site | Landing page with live pricing, FAQ, login/registration pages, draft privacy policy and terms (marked as drafts for a lawyer). |

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

```bash
npm run build                          # protected browser bundle in dist/
NODE_ENV=production npm start          # serves dist/, secure cookies, HSTS
```

or with Docker: `docker build -t radiopis . && docker run -d -p 3000:3000 -v radiopis-data:/data --env-file .env radiopis`.
(The Dockerfile was checked by replaying its steps; the image itself was not built in the development environment.)

Put it behind HTTPS (e.g. Caddy or nginx with Let's Encrypt, or a platform that terminates TLS) and set
`PUBLIC_URL` and `TRUST_PROXY=1`. Back up the `data/` folder (one SQLite file) daily.

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

`npm test` — 108 tests: report engine and templates (every library template passes the safety net without
changes or self-contradictions), server + Claude request shape (mock API), accounts, quotas, device limit,
expiry, admin API, exports, Stripe webhook signatures/idempotency, sync isolation, security headers,
background cost guard. UI was checked with Playwright against a mock AI server (development and the
obfuscated production build).

## Layout

```
server.js            HTTP server: pages, auth, AI endpoints with metering, admin API, Stripe webhook
lib/db.js            SQLite schema and helpers          lib/auth.js     accounts, sessions, tokens
lib/plans.js         plans, prices, quotas, AI cost      lib/billing.js  subscriptions, Stripe
lib/jobs.js          hourly expiry / reminders / alerts  lib/mail.js     e-mail (Resend or outbox)
lib/ai-client.js     Anthropic API or Bedrock (EU)       lib/claude.js   report prompt + request
lib/learn.js         style analysis                      lib/brand.js    product name
public/              the dictation app (+ public/js/hosted.js: session, sync, account menu)
public/site/         landing, login, account, admin, legal pages
scripts/build.mjs    protected production build          tools/check-templates.mjs  template validator
```

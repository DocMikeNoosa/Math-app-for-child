# RadVox Pro (formerly Radiopis) — handoff for another Claude conversation

Repository: https://github.com/DocMikeNoosa/Math-app-for-child — branch `claude/polish-radiology-dictation-e0ov8p`.
Two apps live side by side:
- `radiology-dictation/` — **RadVox**, the original single-user desktop app (see its own HANDOFF.md).
- `radiology-pro/` — **RadVox Pro** (renamed from the working name Radiopis on 16 Oct 2026; violet icon — RadVox is cyan, IR red), the commercial hosted version with accounts, subscriptions and
  an admin panel. Version 1.2.0 (rollout-ready for a teleradiology company of ~200 radiologists). Read `README.md`
  here first, then `DEPLOY.md` (server) and `docs/LOAD-TEST.md` (200-user test).

## The person
A Polish emergency radiologist, not technical: explain in short, simple steps. Never invent facts — say
"I don't know". Test everything before delivering. Only made-up / anonymised cases until the legal side is done.
UI rule for the dictation app: do not change the look of buttons (thin blue rim on active toggles) or the
overall layout — add functionality in the existing style.

## Business context (October 2026)
- Market research (web, sources in the business plan): direct Polish competitors exist — **opisy.ai**, **Nodum**,
  **askRadek** (free beta) — none publishes prices. Speech-only: MagicSpeech (~453 zł/month incl. hardware),
  Newton Dictate. ~3,900–4,300 radiology specialists in Poland; 1.9 M CT scans in 2024.
- Name "Opisio" was dropped (too close to opisy.ai). "Radiopis" had no web hits; trademark registers NOT checked.
- Default plans (editable in the admin panel): trial 14 days / 60 reports; Start 249 zł / 300; Pro 399 zł / 800;
  Dyżur+ 649 zł / 1600 (net, + 23% VAT). Annual = 10 × monthly.
- AI cost per report was only **estimated** (no API key in the build environment): roughly 0.10–0.70 zł; the admin
  panel measures the real value — set prices finally after a beta.
- Open legal items: MDR status (conclusion writing may be Class IIa — get a regulatory opinion), GDPR (DPA with
  customers, DPIA, Anthropic ZDR/DPA or Bedrock EU), KSeF e-invoicing (connect an invoicing tool), lawyer review of
  `/privacy` and `/terms` drafts.

## Rollout (1.1, October 2026)
- Target customer: a teleradiology company with ~200 radiologists; 2-week trial for a limited number of seats,
  then a subscription per seat (pricing advice given: ~249 PLN/seat at volume, 349 list, 100-seat minimum,
  setup fee 10–20k PLN — not final).
- Roles: `admin` (the owner — everything), `orgadmin` (the company's IT: only its own organisation, `/it`),
  `user` (radiologist). Organisation members have `org_id`, `plan = 'org'`, `sub_status = 'org'`; access follows
  the organisation's licence (`orgs.status`, `orgs.sub_until`), not a personal subscription.
- Seats = non-blocked accounts of the organisation (IT accounts count too). Blocking frees a seat; deleting
  anonymises the account (`u<id>@usuniety.invalid`) so usage statistics stay.
- Temporary passwords (`abcd-ef23-gh45`) → `must_change_pwd = 1` → everything except `/change-password` is
  blocked (API answers 402 code `pwd`).
- AI traffic control: `lib/limiter.js` (`AI_MAX_CONCURRENT`, `AI_QUEUE_WAIT_MS`, `AI_PER_USER`); background calls
  are refused first (429 `bg_busy`); busy → 503 `busy` + Retry-After; the app retries "Przygotuj opis" twice.
- Cross-check speed-up (Oct 2026): substring pre-check before each term regex — 6× faster, verified identical on
  4,764 template × dictation cases.
- Deployment kit: `deploy/` (compose + Caddy + setup/offsite/restore scripts). Not run on a real cloud server from
  the development environment (no Docker daemon there) — first deployment must follow DEPLOY.md and be checked.

## Central learning, RODO, IP (1.2, October 2026)
- Owner's request: individual learning per radiologist **plus** the app learning from all users; all learning saved
  permanently and reusable; never accessible to IT admins or the subscribing company; code never available to them.
- `lib/learning.js`: separate `learning.db`, `items` (de-identified, no user id, unique by hash, `seen` count) +
  `contributors` (HMAC pseudonym of user and org; deleted on erasure) + `versions` (global knowledge history).
  Captured on every `PUT /api/sync` of `radvox.style.v1` / `radvox.learned.v1` / `radvox.profile.v1`.
- `lib/global-learning.js`: lessons with ≥ K contributors (default 3) → draft (counts or AI) → owner publishes →
  `guidanceFor(templateId)` → `global_guidance` in the cached user block; `usage.global_version` records it.
- RODO: `termsVersion` setting (env `TERMS_VERSION`, default '1.0'; tests set it to '' except orgs/rodo tests),
  access code `terms` → `/accept`; `/api/me/export`, `/api/me/delete`, `eraseUser()`; retention in jobs; 2FA
  (`lib/totp.js`, `/api/auth/login-2fa`); encrypted backups (`BACKUP_KEY`, `scripts/decrypt-backup.mjs`).
- IT console: `/api/it/problems`, tickets → owner (`Admin → Zgłoszenia`); report counts hidden unless `itShowUsage`.
- Known residual risks (told to the owner): Chrome / Edge speech recognition sends audio to Google / Microsoft;
  Anthropic API = transfer to the USA unless Bedrock EU is used; browser code can be obfuscated but never fully
  hidden; an IT admin can still reset a password and sign in as a radiologist (the radiologist is e-mailed and it
  is logged).

## PowerMic fix and IT support (1.2)
- PowerMic "toggle never worked" (owner's station): learning bound the first changed bit, and the first report has no
  baseline, so a constant status bit could be learned. Now `chooseButton()` learns from two presses (bit that goes on
  and off, ignores constant and noisy bits); hold-to-talk mode; diagnose() + raw data view; same `mic-button.js` in
  all three apps (RadVox PL, RadVox IR, Radiopis). Not tested with a physical PowerMic here (no hardware) —
  simulated device reports in `test/mic-button.test.js`.
- `client_events` (codes only, 30 days), `/api/me/event`, `EVENT_HELP` texts, `/api/it/users/:id/{details,unlock,reset-2fa,devices}`,
  `/check` page (public), owner `reset-2fa`.

## Friends' version (1.3)
- `sub_status = 'friend'` (plan `friend`): no quota, 3 devices, needs own key (`access().needKey`). Key: POST/DELETE
  `/api/me/api-key`, sealed with `lib/secret-box.js` in `users.api_key_enc`; wiped on erase or when the owner turns
  "friend" off (account becomes expired).
- `lib/ai-client.js` `withOwnKey()` (AsyncLocalStorage) routes `/api/format` and `/api/learn` to the friend's key with
  the direct Anthropic API; a 401 becomes 402 `own_key`. Cost goes to `usage.own_cost_usd` (not `cost_usd`).
- Gold: `body.friend` class, `radvox-friend-*.png/.ico`, `app-friend.webmanifest` (index rewritten server-side).
- Test account `przyjaciel@test.radvoxpro.local`. Tests: `test/friends.test.js`.
- The account page no longer asks for the PWZ number (kept if already stored).

## Technical notes
- Templates: 397 + 112 snippets (MR and X-ray libraries completed Oct 2026: mr-body-msk-2.js, mr-neuro-spine-2.js, xray-2.js).
- Node 22.5+, built-in `node:sqlite`, no framework. `npm test` (175 tests), `npm run loadtest` (200 users, fake AI), `npm run build` (obfuscated bundle),
  `NODE_ENV=production` serves `dist/`.
- Report counting: the browser sends `reportId` (one per report); usage rows with the same id count once.
- `background: true` marks pre-processing calls; capped per report by `maxBackgroundCalls` (settings).
- Sync keys: `radvox.templates.v1`, `radvox.profile.v1`, `radvox.style.v1`, `radvox.learned.v1` (PESEL scrubbed server-side). Never synced: current report, today's list. Local keys are cleared when a different user logs in.
- Clinical details: correlate, never dismiss — unexpected findings keep their tier (prompt rule + test "trauma referral + acute stroke").
- CSRF: every non-GET `/api/*` call needs the header `X-Radiopis: 1` (added by `public/js/hosted.js` and
  `public/site/common.js`).
- Engine change vs RadVox: advice / caveat lines ("do rozważenia MR…", "nie wyklucza…") always end the conclusion.
- AI provider: `AI_PROVIDER=bedrock` uses `@anthropic-ai/bedrock-sdk` (AnthropicBedrockMantle); server-side
  fallbacks and fast mode are disabled there (not supported on Bedrock).

## Not done yet / ideas
- Real deployment (needs the owner's hosting, domain, AI account, e-mail) — follow DEPLOY.md.
- SSO (Microsoft Entra ID / Google) and two-factor login for organisations; KSeF invoicing integration;
  per-report B2B billing for teleradiology; better speech recognition (Azure / ElevenLabs) — the browser's engine is the weakest part.
- Italian version (asked about; not started).

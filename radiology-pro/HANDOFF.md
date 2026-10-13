# Radiopis — handoff for another Claude conversation

Repository: https://github.com/DocMikeNoosa/Math-app-for-child — branch `claude/polish-radiology-dictation-e0ov8p`.
Two apps live side by side:
- `radiology-dictation/` — **RadVox**, the original single-user desktop app (see its own HANDOFF.md).
- `radiology-pro/` — **Radiopis** (working name), the commercial hosted version with accounts, subscriptions and
  an admin panel. Version 1.0.0. Read `README.md` here first.

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

## Technical notes
- Templates: 397 + 112 snippets (MR and X-ray libraries completed Oct 2026: mr-body-msk-2.js, mr-neuro-spine-2.js, xray-2.js).
- Node 22.5+, built-in `node:sqlite`, no framework. `npm test` (108 tests), `npm run build` (obfuscated bundle),
  `NODE_ENV=production` serves `dist/`.
- Report counting: the browser sends `reportId` (one per report); usage rows with the same id count once.
- `background: true` marks pre-processing calls; capped per report by `maxBackgroundCalls` (settings).
- Sync keys: `radvox.templates.v1`, `radvox.profile.v1` only. Local keys are cleared when a different user logs in.
- CSRF: every non-GET `/api/*` call needs the header `X-Radiopis: 1` (added by `public/js/hosted.js` and
  `public/site/common.js`).
- Engine change vs RadVox: advice / caveat lines ("do rozważenia MR…", "nie wyklucza…") always end the conclusion.
- AI provider: `AI_PROVIDER=bedrock` uses `@anthropic-ai/bedrock-sdk` (AnthropicBedrockMantle); server-side
  fallbacks and fast mode are disabled there (not supported on Bedrock).

## Not done yet / ideas
- Real deployment (needs the owner's hosting, domain, Stripe and e-mail accounts).
- KSeF invoicing integration; team/clinic accounts (one invoice, many seats); per-report B2B billing for
  teleradiology; better speech recognition (Azure / ElevenLabs) — the browser's engine is the weakest part.
- Italian version (asked about; not started).

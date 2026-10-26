# Load test — 200 radiologists at the same time (October 2026)

`node scripts/loadtest.mjs` (or `npm run loadtest`) runs the real production build of the server against a **fake
AI server**. The fake AI answers each request in 2–6 s and refuses 3 % of requests with "rate limited", the way the
real API does under pressure. No API key, no cost.

**Machine:** the development container: 4 CPUs, Node 22.22. The test program and the server shared the same 4 CPUs,
so real numbers on a dedicated server should be a little better.

## The scenario (deliberately harsher than real life)

1. The company's IT imports 200 radiologists in one paste.
2. At "8:00" all 200 log in **in the same second** with their temporary passwords. They set their own password and
   accept the terms.
3. All 200 open the app at once: page, the 863 KB app script, styles, status, and syncing their templates and
   style.
4. **A 3-minute dictation shift.** Every radiologist dictates without a break:
   - 1–3 background pre-processing calls;
   - then "Przygotuj opis";
   - then 8–25 s for the next study.

   That is **≈ 370 reports a minute**. 200 real radiologists produce perhaps 20–40 a minute at peak, so this is
   about **10× reality**.
5. **Spike:** all 200 press "Przygotuj opis" in the same second.

## Final result (version 1.2, default settings, `AI_MAX_CONCURRENT=60`)

| What | Result |
|---|---|
| Reports in the 3-minute shift | **1,129, 0 failed** |
| Spike: 200 clicks in the same second | **200 / 200 answered**, the last after 21 s |
| "Przygotuj opis" as the radiologist sees it (incl. automatic retry) | median 4.2 s · 95 % within 10.7 s · max 21 s |
| Background pre-processing | 852 done, 1,414 skipped on purpose when busy (saves AI cost; the report button always has priority) |
| Morning rush: 200 first logins + own password + terms | 5.0 s for everybody (each step ≈ 2.5 s) |
| 200 open the app at once | 3.4 s; a revisit takes 60 ms (the browser re-checks the file, server answers "unchanged") |
| Server memory | max 334 MB |
| Longest server "freeze" (event loop) | 0.25 s (once, while 200 opened the app); 99 % of the time under 27 ms |
| Errors / crashes in the server log | none |
| Billing check | reports counted once each, seats and AI cost correct in the admin panel |

## What the test found, and what was fixed

| # | Problem found | Fix | Effect |
|---|---|---|---|
| 1 | The AI safety cross-check took ~12 ms of CPU per report; with many answers arriving together the server froze up to ~1 s | A quick text check before each of hundreds of term patterns (logic unchanged — **verified identical on 4,764 template × dictation cases**) | 6× faster (2 ms); also faster in the browser |
| 2 | The AI queue cap (40) made reports wait up to 16 s (p95) in the 10× scenario | Default raised to 60, configurable | p95 10.7 s at 60, 7.6 s at 100 (the cap must match your Anthropic rate limit) |
| 3 | First login: 3 slow password hashes per person (5.4 s in the rush) | One hash replaced by a pattern check | 2.5 s |
| 4 | Dashboard showed a total count as "currently queued" | Field renamed and tested | correct live queue |
| 5 | The app script was sent uncompressed, read from disk each time | In-memory cache + gzip (~4× smaller) + "unchanged" answers | less bandwidth for hospital networks |
| 6 | Archiving learning on every sync froze the server for 0.5 s when 200 synced at once | Archiving runs after the answer, one at a time | freeze 0.25 s; app opening back to 3.4 s |
| 7 | Login limit of 30 failures per IP would lock out a whole company behind one office IP | 100 per IP (configurable); still 8 per e-mail | no company-wide lock-out |
| 8 | Behind a proxy the client IP could be forged | Take the proxy's own entry | correct per-IP limits |

## Earlier runs (for comparison)

| Run | AI cap | "Przygotuj opis" p95 | Spike: last answer | Longest freeze |
|---|---|---|---|---|
| Before fixes | 40 | 15.8 s | 25 s | ~1 s (seen by health checks) |
| After fixes 1, 3 | 40 | 16.4 s | 24 s | 0.28 s |
| After fixes 1, 3 | 100 | 7.6 s | 12 s | 0.19 s |
| Final (all fixes + learning archive) | 60 | 10.7 s | 21 s | 0.25 s |

## What this test does NOT prove

- **Real AI speed and limits.** The fake AI answers in 2–6 s. The real model's speed, and above all **your Anthropic
  rate limit**, decide the real waiting time. Check the limits in the Anthropic Console; ask for a higher limit
  before rolling out to 200 people. Then set `AI_MAX_CONCURRENT` to what that limit allows.
- **Real network and server.** Run the same test once on your server after deployment: change `BASE` to your address
  or run it on the server. The real numbers will differ from these.
- **Browser speech recognition** is not part of the test (it runs in each radiologist's browser).

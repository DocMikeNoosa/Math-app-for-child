# RadVox Pro — Go-Live Runbook (radvox.pl on AWS Frankfurt)

Instructions for the person/assistant setting up the server. One server on AWS Lightsail in Frankfurt (EU) runs both the website and the RadVox Pro application. radvox.eu and radvox.ai redirect to radvox.pl. Expect about 1.5–2 hours, plus waiting for DNS.

- Server: AWS Lightsail, Frankfurt (eu-central-1), Zone A
- System: Ubuntu 24.04 LTS, 4 GB RAM plan (2 vCPU)
- Main address: https://radvox.pl
- Redirects: www.radvox.pl, radvox.eu, www.radvox.eu, radvox.ai, www.radvox.ai → https://radvox.pl
- Software: Docker + Caddy (automatic HTTPS), one-line installer
- Code: github.com/DocMikeNoosa/Math-app-for-child, branch `claude/polish-radiology-dictation-e0ov8p`, folder `radiology-pro`
- Full technical guide: `radiology-pro/DEPLOY.md` in the same repository

## RULES FOR THE HELPER (read first)

1. The owner (Dr Mól) creates every account with the owner's own email and card. Only the owner holds the passwords, the Anthropic API key, the BACKUP_KEY and the GitHub token.
2. The owner types or pastes secrets personally (or uses the owner's password manager). Secrets are NEVER sent by email, chat or text message — including to the helper.
3. No real patient data goes into the system until stage 11 is complete. Test only with made-up cases.
4. Do not guess. If a screen looks different from these steps, stop and ask the owner.

---

## Stage 1 — Prepare the accounts (OWNER)

- [ ] AWS account: aws.amazon.com → Create an AWS account (owner's email and card). Basic (free) support plan.
- [ ] Secure the root login with MFA: Account → Security credentials → Assign MFA device (authenticator app).
- [ ] Billing alert: AWS Budgets → Create budget → Monthly cost budget, email alert at an amount the owner chooses.
- [ ] Anthropic API key: platform.claude.com → add credit → set a monthly spend limit → API keys → Create key (name `radvox-pro-server`). Store it in the password manager. It is pasted once, into the installer.
- [ ] Domain logins ready: OVH (radvox.pl) and the registrar(s) where radvox.eu and radvox.ai were bought.

## Stage 2 — Create the server in Frankfurt (HELPER, owner logged in)

- [ ] lightsail.aws.amazon.com → Create instance.
- [ ] Location: **Frankfurt, Zone A (eu-central-1a)** — keeps stored data in the EU.
- [ ] Platform: Linux/Unix → Blueprint: OS Only → **Ubuntu 24.04 LTS**.
- [ ] Plan: **4 GB RAM** (2 vCPU). Name: `radvox-pro` → Create instance. Wait for "Running".
- [ ] Static IP: Networking tab → Attach static IP → name `radvox-pro-ip`. Write the IP down — every DNS record uses it.
- [ ] Firewall: Networking tab → IPv4 Firewall → + Add rule → **HTTPS (443)**. Keep SSH (22) and HTTP (80) — HTTP is needed to obtain the certificate.
- [ ] Snapshots tab → **Enable automatic snapshots** (daily image of the whole server).

## Stage 3 — Point the domains at the server (HELPER, owner logged in to registrars)

Each domain needs two A records pointing to the static IP. TTL 300 while setting up.

| Domain | Record | Name | Value |
|---|---|---|---|
| radvox.pl (OVH) | A | @ (empty) | static IP |
| radvox.pl (OVH) | A | www | static IP |
| radvox.eu | A | @ and www | static IP |
| radvox.ai | A | @ and www | static IP |

OVH (radvox.pl):
- OVH Manager → Web Cloud → Domain names → radvox.pl → DNS zone. (The owner's OVH account is on manager.ca.ovhcloud.com — same steps.)
- EDIT the existing A records for the root (empty name) and www to the static IP. Do not add second copies next to them.
- DELETE any AAAA (IPv6) records for the root and www — OVH's default parking AAAA records block the HTTPS certificate.
- If www is a CNAME pointing to the root, that is fine.

radvox.eu and radvox.ai were not in the OVH account — find out from the owner where they were bought, then add the same A records there.

- [ ] Check: all six names (radvox.pl, www.radvox.pl, radvox.eu, www.radvox.eu, radvox.ai, www.radvox.ai) show the static IP at dnschecker.org (type A). Usually minutes, sometimes a few hours.

## Stage 4 — Install RadVox Pro (HELPER, owner types the secrets)

1. In Lightsail, open the instance → **Connect using SSH** (browser terminal).
2. Paste this one line and press Enter:

```
curl -fsSL https://raw.githubusercontent.com/DocMikeNoosa/Math-app-for-child/claude/polish-radiology-dictation-e0ov8p/radiology-pro/deploy/install.sh | sudo bash
```

3. Answer the questions (they are in Polish):

| Question | Answer |
|---|---|
| Główna domena | type **radvox.pl** (the default is radvox.ai — do NOT just press Enter) |
| Pozostałe domeny | type **radvox.eu radvox.ai** (www versions are added automatically) |
| Twój e-mail | the owner's email — this is the admin login and receives certificate notices |
| Hasło administratora (×2) | OWNER types it: min. 10 characters, a letter and a digit, no spaces, quotes, # or $ |
| Klucz API Anthropic | OWNER pastes the key from stage 1 (starts with `sk-ant-`) |
| Klucz z resend.com | press Enter for now (stage 7) |

The installer secures the server (firewall, automatic security updates, fail2ban), installs Docker, downloads RadVox Pro to `/opt/radvox-pro`, writes the settings file and starts the app. 5–10 minutes. At the end it prints the login address and a **BACKUP_KEY**.

- [ ] **The OWNER saves the BACKUP_KEY in the password manager immediately.** Without it, the encrypted backups cannot be opened.
- If DNS was not pointing at the server yet, the installer warns and continues; HTTPS switches on by itself once DNS arrives.

## Stage 5 — Check it is live (HELPER)

- [ ] https://radvox.pl/healthz answers and the browser shows the padlock.
- [ ] https://radvox.pl shows the RadVox Pro website; https://radvox.pl/login shows the login page.
- [ ] www.radvox.pl, radvox.eu, radvox.ai and their www versions all redirect to https://radvox.pl.
- [ ] On the server: `cd /opt/radvox-pro/radiology-pro/deploy && sudo docker compose ps` shows `app` (healthy) and `caddy`.

## Stage 6 — First login and admin lock-down (OWNER)

- [ ] Log in at https://radvox.pl/login with the email and password from stage 4.
- [ ] Turn on two-step login (2FA) for the admin account.
- [ ] Dashboard (Pulpit → Serwer teraz): AI configured, backup time shown. Click "Zrób kopię bazy" once to test.
- [ ] Open "Aplikacja" and prepare one MADE-UP report (e.g. CT KUB) to confirm the AI answers.

## Stage 7 — Email: password resets and invitations (HELPER, owner creates account)

Without email the app works, but reset links and invitations only appear in the admin panel. The app uses Resend.

- [ ] Resend account (owner's email) → Domains → Add domain `radvox.pl` (choose an EU region if offered).
- [ ] Add the DNS records Resend shows (TXT for SPF/DKIM, possibly MX for a subdomain) in the OVH DNS zone → Verify.
- [ ] API Keys → create a key (sending access). The OWNER puts it on the server:

```
sudo nano /opt/radvox-pro/radiology-pro/deploy/.env
# set: RESEND_API_KEY=re_...   (save: Ctrl+O, Enter; exit: Ctrl+X)
cd /opt/radvox-pro/radiology-pro/deploy && sudo docker compose up -d
```

- [ ] Test: on /login use "Nie pamiętam hasła" for a test account; the email arrives from no-reply@radvox.pl.

## Stage 8 — Off-site backup copy (HELPER)

The app already backs up both databases daily (encrypted with the BACKUP_KEY, 14 days kept on the server), and Lightsail snapshots add a daily image. One more copy must live OUTSIDE this server, in the EU:

- [ ] Create EU object storage with S3 access (e.g. OVHcloud Object Storage, Scaleway, or Backblaze B2 in an EU region), in the owner's name.
- [ ] On the server: `sudo apt-get install -y rclone`, then `sudo rclone config` → new remote named exactly `offsite` (type S3, keys from the storage provider).
- [ ] Test once, then schedule nightly:

```
cd /opt/radvox-pro/radiology-pro/deploy && sudo bash offsite-backup.sh
sudo crontab -e
# add this line:
30 3 * * * /opt/radvox-pro/radiology-pro/deploy/offsite-backup.sh >> /var/log/radvoxpro-offsite.log 2>&1
```

## Stage 9 — Monitoring (HELPER)

- [ ] Uptime monitor (e.g. UptimeRobot or Better Stack) on https://radvox.pl/healthz, alerts to the owner's email/phone.
- [ ] AWS billing alert from stage 1 is active.

## Stage 10 — Make the code private, keep updates working (HELPER, owner logged in to GitHub)

The repository is public so the installer could download it. After installing:

- [ ] GitHub → repository → Settings → Change visibility → **Private**.
- [ ] Create a fine-grained personal access token for this one repository only: Contents = Read-only, with an expiry date.
- [ ] On the server (the OWNER pastes the token):

```
sudo git -C /opt/radvox-pro remote set-url origin https://x-access-token:PASTE_TOKEN_HERE@github.com/DocMikeNoosa/Math-app-for-child.git
sudo radvox-update
```

From then on, a new version is installed with one command: `sudo radvox-update` (do it at a quiet hour; short pause, reports in progress are retried automatically).

Note: once the repository is private, links to files in it (including this runbook) stop working for anyone not logged in with access.

## Stage 11 — Before real patients or paying customers (OWNER)

EU data residency: accounts, reports, settings and backups are stored on the server in Frankfurt. When a report is prepared, its text is sent to the AI provider (Anthropic) for processing, with patient identifiers such as PESEL removed by the app first. Check with Anthropic where API requests are processed and whether an EU option or contractual safeguards apply, and describe this in the privacy notice.

- [ ] AWS: confirm the GDPR Data Processing Addendum applies to the account.
- [ ] Anthropic: review and accept their data-processing terms for API use.
- [ ] Resend and the backup storage provider: same check.
- [ ] Privacy notice and terms (already in the app at /privacy and /terms) reviewed by a lawyer.
- [ ] Written opinion from a medical-device (EU MDR) lawyer on whether RadVox Pro counts as a medical device.
- [ ] Company and invoicing in place before charging (accountant).

## Stage 12 — If something goes wrong

| Symptom | What to do |
|---|---|
| Site doesn't open | `cd /opt/radvox-pro/radiology-pro/deploy && sudo docker compose ps`, then `sudo docker compose up -d`. Check DNS (stage 3). |
| "Connection not private" / no padlock | DNS not pointing at the server yet, an AAAA record points elsewhere, or port 80/443 closed. Wait 10 min, then `sudo docker compose logs caddy`. |
| AI says "chwilowo niedostępne" | Wrong/empty `ANTHROPIC_API_KEY` in `.env`, or the Anthropic spend limit was reached. Fix, then `sudo docker compose up -d`. |
| Disk full | `df -h`; `sudo docker system prune -f`. |
| Need to restore | `sudo bash restore.sh data/backups/radiopis-YYYYMMDD-HHMM.db.enc` (accounts) or `learning-…` (AI learning). The previous file is kept. Whole-server restore: Lightsail snapshot. |
| Logs | `sudo docker compose logs --since 1h app` (contains no report text and no patient data). |

## Stage 13 — Hand-over to the owner

- [ ] Static IP and Lightsail instance name written down.
- [ ] Owner confirms they hold (in the owner's password manager): AWS login + MFA, admin password + 2FA, Anthropic key, BACKUP_KEY, GitHub token, Resend and storage logins.
- [ ] Automatic snapshots, nightly off-site backup and uptime monitor confirmed working.
- [ ] Owner logged in with 2FA on and prepared a made-up test report.

Prices are not quoted here — check the current Lightsail plan price and Anthropic usage costs on their own pages.

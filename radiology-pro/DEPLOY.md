# Radiopis — putting it on a server in Poland / the EU

This guide is for you (the owner) or the IT person who helps you. Every step is a short action. Total time:
about 1–2 hours the first time, most of it waiting for DNS.

**Where things live after deployment**

| What | Where |
|---|---|
| The app for radiologists | `https://YOUR-DOMAIN/app/` |
| Your owner panel (all organisations, costs, settings) | `https://YOUR-DOMAIN/admin` |
| The company's IT console (their radiologists' accounts) | `https://YOUR-DOMAIN/it` |
| Database + daily backups | on the server, folder `radiology-pro/deploy/data` |

---

## 0. What you need before you start

1. **A domain**, e.g. `radiopis.pl` or a subdomain such as `app.radiopis.pl`. Any Polish registrar is fine
   (e.g. OVHcloud, home.pl, nazwa.pl).
2. **An AI account** — one of:
   - **Anthropic API**: [console.anthropic.com](https://console.anthropic.com).
     - Add a payment method and create an API key.
     - In *Settings → Limits*, set a **monthly spend limit**.
     - On the same page, check your **rate-limit tier** (see *Capacity* below).
   - **Amazon Bedrock in Frankfurt** (`eu-central-1`): data is processed in the EU.
     - First check that the Claude model you want is offered there for your account.
     - I could not verify this from here.
3. **A server**: a virtual machine (VPS) with **Ubuntu 24.04 LTS**, **2 vCPU, 4 GB RAM, 40 GB disk**. The load
   test with 200 simultaneous users used under 0.5 GB of memory; 4 vCPU / 8 GB gives comfortable headroom.
   Providers with a data centre **in Poland** (check their current offer and price yourself):
   - **Google Cloud** — region `europe-central2` (Warsaw).
   - **Microsoft Azure** — region *Poland Central* (Warsaw).
   - **OVHcloud** — a Polish data centre near Warsaw (check which products are offered there).
   - Any EU provider is also GDPR-compatible (e.g. Hetzner in Germany / Finland), but for Polish customers
     "data in Poland" is a selling point.
4. **The program**: this repository (download the ZIP or `git clone`).

> Legal before real patients: see **`docs/rodo/README.md`**. It covers:
> - the RODO checklist;
> - the data-processing agreement (DPA) template;
> - the records of processing and the DPIA outline;
> - the breach procedure;
> - MDR / AI Act notes;
> - IP protection.
>
> Until those are done, use only made-up / anonymised cases. **Keep the server under your own account** — never give
> a customer SSH access, the repository, `.env` or backups. That is what keeps your code and the learning yours.

---

## 1. Create the server

1. At your provider, create a VM:
   - **Ubuntu 24.04 LTS**, region **Warsaw**;
   - 2–4 vCPU, 4–8 GB RAM, 40 GB SSD;
   - log in with an **SSH key** (safer than a password).
2. In the provider's firewall, allow incoming **22, 80, 443**.
3. Write down the server's **public IP address**.

## 2. Point your domain at the server

At your domain registrar, add an **A record**: name `@` (or e.g. `app`) → the server's IP. It usually takes
5–60 minutes to work. Check from your computer:

```
ping YOUR-DOMAIN
```

It should show the server's IP.

## 3. Prepare the server (one command)

Log in (`ssh ubuntu@SERVER-IP`) and run:

```bash
sudo mkdir -p /opt/radiopis && sudo chown $USER /opt/radiopis && cd /opt/radiopis
git clone https://github.com/DocMikeNoosa/Math-app-for-child.git .
#   (private repository: use a GitHub token, or upload the ZIP with scp and unzip it here)
cd radiology-pro/deploy
sudo bash setup-server.sh
```

The script installs:
- **Docker**;
- a **firewall** (only SSH, HTTP and HTTPS open);
- **automatic security updates**;
- **fail2ban** (blocks SSH password guessing).

It also sets the Polish time zone and prepares the data folder.

## 4. Fill in the settings

```bash
cp .env.example .env
nano .env
```

Fill in at least:
- `DOMAIN` and `PUBLIC_URL` (your domain);
- `ACME_EMAIL`;
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` (your own strong password; the example one is refused);
- `ANTHROPIC_API_KEY` (or the Bedrock lines);
- `BACKUP_KEY`: create it with `openssl rand -base64 32`. **Save a copy in your password manager** — encrypted
  backups cannot be read without it.

Save with Ctrl+O, Enter, Ctrl+X.

Never send `.env` to anyone — it holds your keys.

## 5. Start

```bash
sudo docker compose up -d --build
```

The first start takes 2–5 minutes (it builds the app). Check:

```bash
sudo docker compose ps                    # both "app" and "caddy" should be "running" / "healthy"
curl -s https://YOUR-DOMAIN/healthz       # → {"ok":true,...}
```

The HTTPS certificate is obtained automatically within about a minute (padlock in the browser).

## 6. First login and the first company

1. Open `https://YOUR-DOMAIN/login` and log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
   On the account page:
   - change the password;
   - **switch on two-factor login** (a code from your phone). Your account protects the whole service and the AI
     learning archive. The dashboard shows a red reminder until 2FA is on.
2. **Pulpit → Konfiguracja serwera**: AI must say *działa* and mode must say *produkcja*.
3. **Organizacje → + Nowa organizacja**:
   - company name, NIP;
   - **seats** (e.g. 20 for a trial);
   - status *okres próbny*, **14 days**;
   - price per seat (e.g. 249);
   - the IT contact;
   - the e-mail of their **IT administrator**.
4. You get the IT administrator's **temporary password**. Give it to them by phone or an encrypted message, not
   plain e-mail.
5. Their IT person logs in. They choose their own password, then open the **IT console**. There they:
   - paste the list of radiologists (e-mail; name; PWZ) from Excel;
   - download the CSV with the temporary passwords and hand them out.
6. Each radiologist logs in, sets their own password and starts dictating.

**When the trial ends:** **Organizacje → Edytuj → Przedłuż o 1 / 12 miesięcy** (sets the status to *aktywna*).
Seats can be changed at any time.

## 7. Backups — automatic, plus one copy elsewhere

- The app makes a **backup every day** of both databases into `deploy/data/backups` and keeps 14 days:
  - `radiopis-…` — accounts;
  - `learning-…` — the AI learning archive. It only ever grows, so every copy holds all learning so far.
- With `BACKUP_KEY` set, the copies are encrypted (`.enc`).
- You can also click **Pulpit → Zrób kopię bazy**.
- The dashboard shows the time of the last backup. Red "stara!" means more than 26 hours old.
- **A copy must also live outside the server** (fire, deleted account, ransomware):

  1. `sudo apt-get install -y rclone`, then `rclone config`.
  2. Create a remote called **`offsite`**. It can be EU object storage (e.g. OVHcloud, Scaleway, Backblaze EU —
     S3 type) or another server over SFTP.
  3. Test it: `sudo bash offsite-backup.sh`.
  4. Make it nightly: `sudo crontab -e` and add:
     ```
     30 3 * * * /opt/radiopis/radiology-pro/deploy/offsite-backup.sh >> /var/log/radiopis-offsite.log 2>&1
     ```
- **Restore** (only when something went wrong):
  - `sudo bash restore.sh data/backups/radiopis-YYYYMMDD-HHMM.db.enc` — accounts;
  - `sudo bash restore.sh data/backups/learning-YYYYMMDD-HHMM.db.enc` — learning archive.

  The previous file is kept next to it.
- **Your own copy of the learning**: **Admin → Nauka globalna AI → Eksport całego archiwum** downloads one JSONL
  file with every lesson and every version. Keep it e.g. once a month — it is yours to reuse for anything.

## 8. Central AI learning (once a month, 5 minutes)

1. **Admin → Nauka globalna AI**: see how many lessons and radiologists the archive has.
2. **Utwórz szkic** with method *Analiza AI* and "min. 3 radiologists".
   - Only corrections that at least 3 different radiologists made independently are used.
   - One person's habit never becomes a rule for everybody.
3. **Open the draft**: untick anything you do not want, then **Opublikuj**. From then on every report of every user
   gets it. A radiologist's own style still wins.
4. **If something gets worse:**
   - open an older version → *Przywróć*; or
   - *Wyłącz wiedzę globalną*.

   Every version is kept forever, and each AI call records which version it used.

Nobody except you can see the archive or the versions: not the companies' IT, not the companies, not the
radiologists.

## 9. Monitoring (know before your customers call)

- Create a free monitor for `https://YOUR-DOMAIN/healthz` with a 1-minute interval and an e-mail / SMS alert.
  For example UptimeRobot or Better Stack; check where they store data if that matters to you.
- Your dashboard (**Pulpit → Serwer teraz**) shows:
  - logged-in users;
  - AI calls running and queued;
  - rejected calls;
  - memory;
  - the longest server "freeze";
  - the last backup.
- Logs: `sudo docker compose logs --since 1h app`. One line per request, with no report text and no patient data.

## 10. Updating to a new version

```bash
cd /opt/radiopis && git pull && cd radiology-pro/deploy && sudo docker compose up -d --build
```

The app finishes AI answers already in progress, and Caddy holds new requests for up to 30 s during the
restart. Radiologists see at most a short pause; the app retries a report automatically. If you prefer, do it
in a quiet hour. To warn everyone first, use **Ustawienia → Komunikat dla wszystkich użytkowników**.

## 11. Capacity — 200 radiologists

The test (`node scripts/loadtest.mjs`) simulates 200 people with a fake AI that answers in 2–6 s. See
`docs/LOAD-TEST.md` for the full results. What matters for you:

- **The server is not the limit.** The real limit is your **AI rate limit** at Anthropic: requests per minute
  and tokens per minute, which grow with your usage tier.
- **Rough real-world estimate** (assumptions, not measurements):
  - at peak, 150 radiologists on shift each finish 10 reports an hour → **25 reports a minute**;
  - with background pre-processing that is **≈ 60 AI calls a minute**;
  - that is roughly 150,000 uncached input tokens and 30,000 output tokens a minute.
  - Anthropic's documentation says cached prompt reads mostly do not count towards the input limit. Check the
    current numbers on the *Limits* page of the Console, and ask Anthropic for a higher limit before a
    200-user rollout.
- **Test result** (10× the real load, fake AI): 1,129 reports in 3 minutes, **0 failed**. All 200 radiologists
  clicking at the same second were answered within 21 s. Memory under 0.4 GB.
- `AI_MAX_CONCURRENT` (default 60) is how many AI calls run at once.
  - If you see **"Odrzucone (przeciążenie)" > 0** or long queue waits on the dashboard, raise it — but only up to
    what your Anthropic limit allows.
  - Otherwise Anthropic answers "slow down"; the app retries, but reports get slower.
- When it is busy, background pre-processing pauses first. The radiologists' own **"Przygotuj opis"** always
  has priority and is retried automatically.

## 12. If something goes wrong

| Symptom | What to do |
|---|---|
| The site does not open at all | `sudo docker compose ps` — is everything running? `sudo docker compose up -d`. Check the DNS (step 2). |
| "Your connection is not private" | DNS does not point to the server yet, or ports 80/443 are closed. Wait 10 min. Then `sudo docker compose logs caddy`. |
| AI: "chwilowo niedostępne" | Wrong or empty API key in `.env`; or the Anthropic spend limit was reached. Fix it, then `sudo docker compose up -d`. |
| Many "Serwer AI jest obciążony" messages | Dashboard → *Serwer teraz*. Raise `AI_MAX_CONCURRENT` and the Anthropic limit (section 10). |
| A radiologist forgot their password | Their IT: IT console → ⋯ → *Nowe hasło tymczasowe*. Or the radiologist uses "Nie pamiętam hasła" (needs e-mail configured). |
| A laptop was lost | IT console → ⋯ → *Wyloguj ze wszystkich urządzeń*, then *Nowe hasło tymczasowe*. |
| Someone leaves the company | IT console → *Zablokuj*. The seat is freed at once. |
| Whole company locked out after many wrong passwords | The limit is 8 failures per e-mail and 100 per IP in 15 minutes. It clears by itself after 15 min. A *Nowe hasło tymczasowe* clears it for that person. |
| The server disk is full | `df -h`. Old Docker images: `sudo docker system prune -f`. Fewer backups: `BACKUP_KEEP_DAYS` in `.env`. |
| The database is damaged | `restore.sh` with the latest good backup (section 7). |

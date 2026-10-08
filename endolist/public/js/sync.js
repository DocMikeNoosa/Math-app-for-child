// EndoList — synchronizacja między urządzeniami (iPhone ↔ komputer ↔ wersja internetowa), szyfrowana end-to-end.
// Serwer widzi wyłącznie zaszyfrowane rekordy. Konflikty: wygrywa nowsza zmiana danego rekordu (pacjent, wizyta, list…).
import { kv, acctId, loginToken, openRemoteProfile } from './vault.js';

const PUSH_BATCH = 200, MAX_BYTES = 1_900_000;

export function normUrl(u) {
  let s = String(u || '').trim().replace(/\/+$/, '');
  if (!s) throw new Error('Podaj adres serwera synchronizacji.');
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  const url = new URL(s);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !local) throw new Error('Adres serwera musi zaczynać się od https:// (wymaga tego iPhone i bezpieczeństwo danych).');
  return s;
}

async function api(base, method, path, { body, token, query } = {}) {
  let r;
  try {
    r = await fetch(base + path + (query ? '?' + new URLSearchParams(query) : ''), {
      method, cache: 'no-store',
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { const e = new Error('Brak połączenia z serwerem synchronizacji.'); e.offline = true; throw e; }
  let data = null; try { data = await r.json(); } catch {}
  if (!r.ok) {
    const msg = { 401: 'Nieprawidłowy login lub hasło (albo konto nie istnieje na tym serwerze).', 409: 'Ten login jest już zajęty na serwerze synchronizacji.', 429: 'Zbyt wiele nieudanych prób — spróbuj ponownie za kilka minut.', 413: 'Za duże dane do wysłania.' }[r.status] || `Błąd serwera synchronizacji (${r.status}).`;
    const e = new Error(msg); e.status = r.status; e.code = data?.error; throw e;
  }
  return data;
}

export async function checkServer(url) {
  const base = normUrl(url);
  const h = await api(base, 'GET', '/v1/health');
  if (!h || h.app !== 'EndoList-sync') throw new Error('Pod tym adresem nie działa serwer synchronizacji EndoList.');
  return base;
}

const cfgKey = (pid) => `sync:${pid}`;
export const loadConfig = (pid) => kv.get(cfgKey(pid));
const saveConfig = (pid, cfg) => kv.set(cfgKey(pid), cfg);

/** Enables sync for an unlocked account on this device (first device registers the account on the server). */
export async function enableSync(session, { url, login, password }) {
  const base = await checkServer(url);
  const acct = await acctId(login);
  const [lt, st] = await Promise.all([loginToken(login, password), session.syncToken()]);
  await api(base, 'POST', '/v1/register', { body: { acct, login: lt, sync: st, header: session.header() } });
  const cfg = { url: base, login: login.trim(), acct, cursor: 0, headerAt: 0, last: 0, enabled: true };
  await saveConfig(session.pid, cfg);
  return cfg;
}

/** Signs in on a new device (e.g. iPhone): fetches the encrypted account header, opens it with the password. */
export async function signInFromServer({ url, login, password }) {
  const base = await checkServer(url);
  const acct = await acctId(login);
  const r = await api(base, 'POST', '/v1/login', { body: { acct, login: await loginToken(login, password) } });
  const session = await openRemoteProfile(r.header, password, login);
  const prev = (await loadConfig(session.pid)) || {};
  const cfg = { cursor: 0, ...prev, url: base, login: login.trim(), acct, headerAt: r.headerAt, last: 0, enabled: true };
  await saveConfig(session.pid, cfg);
  return { session, cfg };
}

export class SyncClient {
  /** hooks: onRecords([{store, id, obj}]), onHeader(), onStatus(status) */
  constructor(session, cfg, hooks = {}) {
    this.s = session; this.cfg = cfg; this.h = hooks;
    this.status = { state: 'idle', last: cfg.last || 0, msg: '' };
    this.running = null; this.again = false; this.timer = null; this.debounce = null;
  }
  setStatus(p) { Object.assign(this.status, p); this.h.onStatus?.(this.status); }
  start() {
    this.s.onPut = () => this.soon();
    this.onVis = () => this.now(); // also when hidden: on iPhone the app may be suspended right after switching away
    this.onOnline = () => this.now();
    document.addEventListener('visibilitychange', this.onVis);
    window.addEventListener('online', this.onOnline);
    this.timer = setInterval(() => { if (document.visibilityState === 'visible') this.now(); }, 20000);
    return this.now();
  }
  stop() {
    this.s.onPut = null; clearInterval(this.timer); clearTimeout(this.debounce);
    document.removeEventListener('visibilitychange', this.onVis); window.removeEventListener('online', this.onOnline);
  }
  soon(ms = 1200) { clearTimeout(this.debounce); this.debounce = setTimeout(() => this.now(), ms); }
  /** Runs one push + pull round (coalesces concurrent calls). */
  async now() {
    if (this.running) { this.again = true; return this.running; }
    this.running = (async () => {
      do { this.again = false; await this.round(); } while (this.again);
    })().finally(() => { this.running = null; });
    return this.running;
  }
  async round() {
    this.setStatus({ state: 'busy' });
    try {
      const token = this.token ||= await this.s.syncToken();
      const { url, acct } = this.cfg;
      // ---- push local changes
      const pending = (await this.s.rawRecords()).filter((r) => !r.syn);
      const tooBig = pending.filter((r) => r.ct.length > MAX_BYTES);
      const send = pending.filter((r) => r.ct.length <= MAX_BYTES).map(({ k, iv, ct, at }) => ({ k, iv, ct, at }));
      for (let i = 0; i < send.length; i += PUSH_BATCH) {
        const part = send.slice(i, i + PUSH_BATCH);
        await api(url, 'POST', '/v1/push', { token, body: { acct, records: part } });
        await this.s.markSynced(part);
      }
      if (this.cfg.headerDirty) await this.pushHeader();
      // ---- pull remote changes
      let more = true, changes = [];
      while (more) {
        const r = await api(url, 'GET', '/v1/pull', { token, query: { acct, since: this.cfg.cursor } });
        for (const rec of r.records) {
          const local = await this.s.getRaw(rec.k);
          if (local && local.at >= rec.at) continue; // ours is newer (or the same) — it was / will be pushed
          const row = { k: rec.k, iv: rec.iv, ct: rec.ct, at: rec.at, syn: 1 };
          let obj; try { obj = await this.s.decryptRecord(row); } catch { console.warn('sync: cannot decrypt', rec.k); continue; }
          await this.s.putRaw(row);
          const [, store, ...rest] = rec.k.split('|');
          changes.push({ store, id: rest.join('|'), obj });
        }
        this.cfg.cursor = r.seq; more = r.more;
        if (r.headerAt > (this.cfg.headerAt || 0)) {
          const differs = await this.s.adoptHeader(r.header);
          this.cfg.headerAt = r.headerAt; this.h.onHeader?.();
          if (differs) await this.pushHeader();
        }
        if (changes.length >= 200 || !more) { if (changes.length) await this.h.onRecords?.(changes); changes = []; }
      }
      this.cfg.last = Date.now();
      await saveConfig(this.s.pid, this.cfg);
      this.setStatus({ state: tooBig.length ? 'error' : 'ok', last: this.cfg.last, msg: tooBig.length ? `${tooBig.length} rekord(y) za duże do synchronizacji` : '' });
    } catch (e) {
      await saveConfig(this.s.pid, this.cfg).catch(() => {});
      this.setStatus({ state: e.offline ? 'offline' : 'error', msg: e.message });
      if (!e.offline) console.warn('sync', e);
    }
  }
  /** Queues the account header (wrapped keys) for upload after a password or passkey change. */
  async headerChanged(newPassword) {
    this.cfg.headerDirty = true;
    if (newPassword) this.cfg.pendingLogin = await loginToken(this.cfg.login, newPassword); // a derived token, never the password
    await saveConfig(this.s.pid, this.cfg);
    return this.now();
  }
  async pushHeader() {
    const body = { acct: this.cfg.acct, header: this.s.header(), at: Date.now(), ...(this.cfg.pendingLogin ? { login: this.cfg.pendingLogin } : {}) };
    const r = await api(this.cfg.url, 'PUT', '/v1/header', { token: this.token ||= await this.s.syncToken(), body });
    this.cfg.headerAt = r.headerAt; this.cfg.headerDirty = false; delete this.cfg.pendingLogin;
    await saveConfig(this.s.pid, this.cfg);
  }
  async disable({ wipe = false } = {}) {
    this.stop();
    if (wipe) await api(this.cfg.url, 'DELETE', '/v1/account', { token: this.token ||= await this.s.syncToken(), body: { acct: this.cfg.acct } });
    this.cfg.enabled = false; await saveConfig(this.s.pid, this.cfg);
  }
}

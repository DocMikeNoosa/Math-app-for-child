// EndoList — konta lokalne, szyfrowanie danych (AES-GCM), logowanie hasłem lub kluczem dostępu (passkey, WebAuthn PRF).
// Wszystkie dane pacjentów są zapisywane wyłącznie w postaci zaszyfrowanej. Klucz danych (DEK) jest
// opakowany kluczem z hasła (PBKDF2) oraz — opcjonalnie — kluczem z passkeya (rozszerzenie PRF).

const enc = new TextEncoder(), dec = new TextDecoder();
const PBKDF2_ITER = 600000;
const PRF_SALT = enc.encode('EndoList/passkey-prf/v1');

export const b64 = {
  from(buf) { const a = new Uint8Array(buf); let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000)); return btoa(s); },
  to(str) { const s = atob(str); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; },
  url(buf) { return this.from(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  fromUrl(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return this.to(s); },
};
const rnd = (n) => crypto.getRandomValues(new Uint8Array(n));
export const uid = () => Date.now().toString(36) + b64.url(rnd(6));

/* ------------------------------------------------------------ IndexedDB */
let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open('endolist', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('profiles', { keyPath: 'id' }); d.createObjectStore('records', { keyPath: 'k' }); d.createObjectStore('kv'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode); const s = t.objectStore(store); const out = fn(s);
    t.oncomplete = () => res(out && 'result' in out ? out.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}
export const kv = {
  get: (k) => tx('kv', 'readonly', (s) => s.get(k)),
  set: (k, v) => tx('kv', 'readwrite', (s) => s.put(v, k)),
  del: (k) => tx('kv', 'readwrite', (s) => s.delete(k)),
};

/* ------------------------------------------------------------ crypto helpers */
async function kekFromPassword(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITER }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function kekFromPrf(prfOut) {
  const base = await crypto.subtle.importKey('raw', prfOut, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: enc.encode('EndoList passkey KEK v1') }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function wrap(kek, raw) { const iv = rnd(12); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, kek, raw); return { iv: b64.from(iv), ct: b64.from(ct) }; }
async function unwrap(kek, w) { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.to(w.iv) }, kek, b64.to(w.ct))); }
const importDek = (raw) => crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);

/* ------------------------------------------------------------ profiles */
export async function listProfiles() { return (await tx('profiles', 'readonly', (s) => s.getAll())) || []; }
async function saveProfile(p) { await tx('profiles', 'readwrite', (s) => s.put(p)); }
const norm = (u) => u.trim().toLowerCase();

export class Session {
  constructor(profile, dekRaw, dek) { this.profile = profile; this.dekRaw = dekRaw; this.dek = dek; }
  get pid() { return this.profile.id; }
  key(store, id) { return `${this.pid}|${store}|${id}`; }
  async put(store, obj) {
    const k = this.key(store, obj.id); const iv = rnd(12);
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(k) }, this.dek, enc.encode(JSON.stringify(obj)));
    // `at` always moves past the version being replaced (even if this device's clock is behind another's) — last writer wins
    const prev = await this.getRaw(k);
    const rec = { k, iv: b64.from(iv), ct: b64.from(ct), at: Math.max(Date.now(), (prev?.at || 0) + 1, (this.lastAt || 0) + 1) };
    this.lastAt = rec.at;
    await tx('records', 'readwrite', (s) => s.put(rec));
    this.onPut?.(rec);
  }
  // deletions are kept as encrypted tombstones so a restore from an older backup cannot resurrect them
  async del(store, id) { await this.put(store, { id, _deleted: true, updatedAt: Date.now() }); }
  async decryptRecord(r) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.to(r.iv), additionalData: enc.encode(r.k) }, this.dek, b64.to(r.ct));
    return JSON.parse(dec.decode(pt));
  }
  async rawRecords() { return (await tx('records', 'readonly', (s) => s.getAll(IDBKeyRange.bound(`${this.pid}|`, `${this.pid}|￿`)))) || []; }
  /** Loads and decrypts every record of this profile: { store: Map(id -> obj) } */
  async loadAll() {
    const out = {};
    for (const r of await this.rawRecords()) {
      const [, store] = r.k.split('|');
      try { const o = await this.decryptRecord(r); if (!o._deleted) (out[store] ??= new Map()).set(r.k.split('|').slice(2).join('|'), o); } catch (e) { console.warn('record decrypt failed', r.k, e); }
    }
    return out;
  }
  /* ---- synchronizacja: surowe (zaszyfrowane) rekordy i nagłówek konta */
  getRaw(k) { return tx('records', 'readonly', (s) => s.get(k)); }
  putRaw(r) { return tx('records', 'readwrite', (s) => s.put(r)); }
  /** Marks pushed records as synced unless they changed meanwhile. */
  async markSynced(recs) {
    const d = await db();
    await new Promise((res, rej) => {
      const t = d.transaction('records', 'readwrite'), st = t.objectStore('records');
      for (const r of recs) { const g = st.get(r.k); g.onsuccess = () => { const cur = g.result; if (cur && cur.at === r.at && !cur.syn) st.put({ ...cur, syn: 1 }); }; }
      t.oncomplete = res; t.onerror = () => rej(t.error);
    });
  }
  /** Token for the sync server, derived from the data key — only unlocked devices can compute it. */
  async syncToken() {
    const base = await crypto.subtle.importKey('raw', this.dekRaw, 'HKDF', false, ['deriveBits']);
    return b64.url(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: enc.encode('EndoList sync token v1') }, base, 256));
  }
  header() {
    // no login or name: the server must not learn who the account belongs to (the login is typed on the new device)
    const { id, salt, pw, passkeys, created, userHandle, removedPasskeys } = this.profile;
    return { id, salt, pw, passkeys: passkeys || [], removedPasskeys: removedPasskeys || [], created, userHandle };
  }
  /** Adopts the account header from another device (password change, passkeys). Returns true if the merged header differs from the remote one. */
  async adoptHeader(h) {
    if (!h || h.id !== this.pid) return false;
    const removed = new Set([...(h.removedPasskeys || []), ...(this.profile.removedPasskeys || [])]);
    const byId = new Map();
    for (const k of [...(h.passkeys || []), ...(this.profile.passkeys || [])]) if (!removed.has(k.id) && !byId.has(k.id)) byId.set(k.id, k);
    const merged = [...byId.values()];
    const differs = merged.length !== (h.passkeys || []).length || removed.size !== (h.removedPasskeys || []).length;
    Object.assign(this.profile, { salt: h.salt, pw: h.pw, passkeys: merged, removedPasskeys: [...removed] });
    await saveProfile(this.profile);
    return differs;
  }
  async changePassword(oldPw, newPw) {
    const kek = await kekFromPassword(oldPw, b64.to(this.profile.salt));
    await unwrap(kek, this.profile.pw); // throws if wrong
    const salt = rnd(16);
    this.profile.salt = b64.from(salt);
    this.profile.pw = await wrap(await kekFromPassword(newPw, salt), this.dekRaw);
    await saveProfile(this.profile);
  }
  async addPasskey(label = 'Klucz dostępu') { const pk = await registerPasskey(this.profile, this.dekRaw, label); this.profile.passkeys = [...(this.profile.passkeys || []), pk]; await saveProfile(this.profile); return pk; }
  async removePasskey(id) { this.profile.passkeys = (this.profile.passkeys || []).filter((p) => p.id !== id); this.profile.removedPasskeys = [...new Set([...(this.profile.removedPasskeys || []), id])]; await saveProfile(this.profile); }
  async updateProfile(patch) { Object.assign(this.profile, patch); await saveProfile(this.profile); }
  /** Encrypted backup: the profile header (with wrapped keys only) + encrypted records. Restoring needs the password. */
  async exportBackup() {
    const { id, username, displayName, salt, pw, passkeys, created, userHandle } = this.profile;
    const records = (await this.rawRecords()).map((r) => ({ k: r.k, iv: r.iv, ct: r.ct, at: r.at }));
    return { app: 'EndoList', format: 1, exportedAt: new Date().toISOString(), profile: { id, username, displayName, salt, pw, passkeys, created, userHandle }, records };
  }
}

export async function createProfile({ username, displayName, password }) {
  const all = await listProfiles();
  if (all.some((p) => norm(p.username) === norm(username))) throw new Error('Taki login już istnieje na tym komputerze.');
  const dekRaw = rnd(32), salt = rnd(16);
  const profile = { id: uid(), username: username.trim(), displayName, salt: b64.from(salt), pw: await wrap(await kekFromPassword(password, salt), dekRaw), passkeys: [], created: Date.now(), userHandle: b64.url(rnd(16)) };
  await saveProfile(profile);
  return new Session(profile, dekRaw, await importDek(dekRaw));
}

export async function unlockPassword(username, password) {
  const p = (await listProfiles()).find((x) => norm(x.username) === norm(username));
  if (!p) throw new Error('Nie znaleziono takiego użytkownika.');
  let raw;
  try { raw = await unwrap(await kekFromPassword(password, b64.to(p.salt)), p.pw); } catch { throw new Error('Nieprawidłowe hasło.'); }
  return new Session(p, raw, await importDek(raw));
}

/* ------------------------------------------------------------ passkeys */
export const passkeySupported = () => !!(window.PublicKeyCredential && navigator.credentials && window.isSecureContext && location.protocol !== 'file:');

async function registerPasskey(profile, dekRaw, label) {
  if (!passkeySupported()) throw new Error('Klucze dostępu wymagają otwarcia aplikacji przez https:// lub localhost.');
  const cred = await navigator.credentials.create({ publicKey: {
    rp: { name: 'EndoList', id: location.hostname },
    user: { id: b64.fromUrl(profile.userHandle), name: profile.username, displayName: profile.displayName || profile.username },
    challenge: rnd(32),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'required' },
    timeout: 120000,
    extensions: { prf: { eval: { first: PRF_SALT } } },
  } });
  const ext = cred.getClientExtensionResults() || {};
  if (!ext.prf || ext.prf.enabled === false) throw new Error('To urządzenie lub przeglądarka nie obsługuje szyfrowania kluczem dostępu (rozszerzenie PRF). Logowanie hasłem działa nadal.');
  let out = ext.prf.results && ext.prf.results.first;
  if (!out) {
    // niektóre uwierzytelniacze zwracają wynik PRF dopiero przy logowaniu
    const a = await navigator.credentials.get({ publicKey: { challenge: rnd(32), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id: cred.rawId }], userVerification: 'required', timeout: 120000, extensions: { prf: { eval: { first: PRF_SALT } } } } });
    out = a.getClientExtensionResults()?.prf?.results?.first;
    if (!out) throw new Error('Klucz dostępu nie zwrócił danych szyfrujących (PRF). Spróbuj innego urządzenia lub korzystaj z hasła.');
  }
  return { id: b64.url(cred.rawId), label, created: Date.now(), w: await wrap(await kekFromPrf(out), dekRaw) };
}

export async function unlockPasskey() {
  if (!passkeySupported()) throw new Error('Klucze dostępu wymagają https:// lub localhost.');
  const a = await navigator.credentials.get({ publicKey: { challenge: rnd(32), rpId: location.hostname, userVerification: 'required', timeout: 120000, extensions: { prf: { eval: { first: PRF_SALT } } } } });
  const id = b64.url(a.rawId);
  const profiles = await listProfiles();
  const handle = a.response.userHandle ? b64.url(a.response.userHandle) : null;
  const p = profiles.find((x) => (handle && x.userHandle === handle) || (x.passkeys || []).some((k) => k.id === id));
  if (!p) throw new Error('Ten klucz dostępu nie jest przypisany do żadnego konta na tym komputerze.');
  const pk = (p.passkeys || []).find((k) => k.id === id);
  if (!pk) throw new Error('Ten klucz dostępu został usunięty z konta.');
  const out = a.getClientExtensionResults()?.prf?.results?.first;
  if (!out) throw new Error('Klucz dostępu nie zwrócił danych szyfrujących (PRF). Zaloguj się hasłem.');
  let raw;
  try { raw = await unwrap(await kekFromPrf(out), pk.w); } catch { throw new Error('Nie udało się odszyfrować danych tym kluczem.'); }
  return new Session(p, raw, await importDek(raw));
}

/* ------------------------------------------------------------ synchronizacja: konto na nowym urządzeniu */
export const normLogin = (u) => norm(u);
/** Server account id: SHA-256 of the normalised sync login (the login itself is not stored on the server). */
export async function acctId(login) { const d = await crypto.subtle.digest('SHA-256', enc.encode('endolist:acct:v1:' + norm(login))); return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
/** Login token for fetching the account header on a new device (PBKDF2 of the password, separate salt from the data key). */
export async function loginToken(login, password) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
  return b64.url(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('endolist:login:v1:' + norm(login)), iterations: PBKDF2_ITER }, base, 256));
}
/** Opens an account header received from the sync server with the password and stores the profile on this device. */
export async function openRemoteProfile(header, password, login) {
  let raw;
  try { raw = await unwrap(await kekFromPassword(password, b64.to(header.salt)), header.pw); } catch { throw new Error('Nieprawidłowe hasło.'); }
  const profiles = await listProfiles();
  let p = profiles.find((x) => x.id === header.id);
  if (!p && profiles.some((x) => norm(x.username) === norm(login))) throw new Error('Na tym urządzeniu istnieje już inne konto o tym loginie.');
  p = { username: login.trim(), displayName: '', ...(p || {}), ...header };
  await saveProfile(p);
  return new Session(p, raw, await importDek(raw));
}

/* ------------------------------------------------------------ restore */
/** Imports an encrypted backup. Records are merged (newer `at` wins). Returns the profile id. */
export async function importBackup(data) {
  if (!data || data.app !== 'EndoList' || !data.profile) throw new Error('To nie jest kopia zapasowa EndoList.');
  const profiles = await listProfiles();
  let p = profiles.find((x) => x.id === data.profile.id);
  if (!p) {
    if (profiles.some((x) => norm(x.username) === norm(data.profile.username))) throw new Error('Na tym komputerze istnieje już inne konto o tym loginie.');
    p = data.profile; await saveProfile(p);
  }
  let n = 0;
  const existing = new Map((await tx('records', 'readonly', (s) => s.getAll(IDBKeyRange.bound(`${p.id}|`, `${p.id}|￿`)))).map((r) => [r.k, r]));
  for (const r of data.records || []) {
    if (!r.k.startsWith(p.id + '|')) continue;
    const cur = existing.get(r.k);
    if (cur && (cur.at || 0) >= (r.at || 0)) continue;
    await tx('records', 'readwrite', (s) => s.put(r)); n++;
  }
  return { profileId: p.id, username: p.username, imported: n };
}

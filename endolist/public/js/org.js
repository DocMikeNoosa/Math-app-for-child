// EndoList — gabinet i administratorzy.
// Każdy lekarz ma parę kluczy (ECDH P-256). Gabinet ma własną parę kluczy; klucz prywatny gabinetu mają tylko
// administratorzy (zapisany w ich zaszyfrowanych danych). Klucz danych każdego członka jest dodatkowo zaszyfrowany
// kluczem publicznym gabinetu („depozyt") — dzięki temu administrator może zresetować hasło lekarza i zachować
// dostęp do dokumentacji po jego odejściu. Serwer przechowuje wyłącznie klucze publiczne i zaszyfrowane bloki.
import { b64, rewrapHeader, sessionFor, loginToken } from './vault.js';
import { api } from './sync.js';

const enc = new TextEncoder(), dec = new TextDecoder();
const EC = { name: 'ECDH', namedCurve: 'P-256' };
const pubOnly = (j) => ({ kty: j.kty, crv: j.crv, x: j.x, y: j.y });
const sha256 = async (bytes) => new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
const hex = (u8) => [...u8].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function genKeyPair() {
  const k = await crypto.subtle.generateKey(EC, true, ['deriveBits']);
  return { pub: pubOnly(await crypto.subtle.exportKey('jwk', k.publicKey)), priv: await crypto.subtle.exportKey('jwk', k.privateKey) };
}
async function aesFrom(privJwk, pubJwk, info) {
  const priv = await crypto.subtle.importKey('jwk', privJwk, EC, false, ['deriveBits']);
  const pub = await crypto.subtle.importKey('jwk', pubOnly(pubJwk), EC, false, []);
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: pub }, priv, 256);
  const base = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: enc.encode(info) }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
/** Encrypts bytes for the holder of a private key (ephemeral ECDH + HKDF + AES-GCM). */
export async function seal(pubJwk, bytes) {
  const eph = await genKeyPair(); const key = await aesFrom(eph.priv, pubJwk, 'EndoList seal v1'); const iv = crypto.getRandomValues(new Uint8Array(12));
  return { v: 1, epk: eph.pub, iv: b64.from(iv), ct: b64.from(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes)) };
}
export async function open(privJwk, sealed) {
  const key = await aesFrom(privJwk, sealed.epk, 'EndoList seal v1');
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64.to(sealed.iv) }, key, b64.to(sealed.ct)));
}
const sealJson = (pub, o) => seal(pub, enc.encode(JSON.stringify(o)));
const openJson = async (priv, s) => JSON.parse(dec.decode(await open(priv, s)));

/* ------------------------------------------------------------ invite codes: XXXX-XXXX-XXXX-XXXX
 * 10 secret characters (the server keeps only their SHA-256) + 6 characters of the clinic key fingerprint,
 * so a joining device can check that the key it receives really belongs to the clinic that issued the code. */
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const b32 = (u8, n) => [...u8].slice(0, n).map((b) => ALPH[b % 32]).join('');
export async function fingerprint(pubJwk) { const p = pubOnly(pubJwk); return b32(await sha256(enc.encode(JSON.stringify([p.crv, p.kty, p.x, p.y]))), 6); }
const codeHash = async (secret) => hex(await sha256(enc.encode('endolist:invite:v1:' + secret)));
export function parseCode(code) {
  const c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/O/g, '0').replace(/I/g, '1');
  if (c.length !== 16) throw new Error('Kod zaproszenia ma 16 znaków (np. ABCD-EFGH-JKLM-NPQR).');
  return { secret: c.slice(0, 10), fp: c.slice(10) };
}

/* ------------------------------------------------------------ keys stored in the user's own encrypted records ('keys' store) */
async function userKeys(ctx) {
  let k = ctx.keys.get('user');
  if (!k) { const kp = await genKeyPair(); k = { id: 'user', ...kp }; await ctx.saveKey(k); }
  return k;
}
const orgKey = (ctx) => ctx.keys.get('org') || null;

/**
 * ctx: { session, cfg (sync config: url, acct), token (sync token), keys: Map, saveKey(rec), profileName }
 */
export class Clinic {
  constructor(ctx) { this.c = ctx; this.state = null; }
  call(method, path, opts = {}) { return api(this.c.cfg.url, method, path, { token: this.c.token, ...opts, body: opts.body ? { acct: this.c.cfg.acct, ...opts.body } : undefined, query: method === 'GET' ? { acct: this.c.cfg.acct, ...(opts.query || {}) } : undefined }); }
  async meta() { return { login: this.c.cfg.login, name: this.c.profileName || this.c.cfg.login, pid: this.c.session.pid }; }

  /** Current clinic state; null when not a member. Also picks up the clinic key after being made an admin. */
  async refresh() {
    let r;
    try { r = await this.call('GET', '/v1/org'); } catch (e) { if (e.status === 404) { this.state = null; return null; } throw e; }
    if (r.me.role === 'admin' && r.me.grant && !orgKey(this.c)) {
      const uk = this.c.keys.get('user');
      if (uk) { try { const priv = await openJson(uk.priv, r.me.grant); await this.c.saveKey({ id: 'org', orgId: r.org.orgId, priv, pub: r.org.pub }); } catch (e) { console.warn('grant', e); } }
    }
    this.state = r;
    return r;
  }
  isAdmin() { return this.state?.me.role === 'admin' && !!orgKey(this.c); }

  async create(name) {
    const uk = await userKeys(this.c), ok = await genKeyPair();
    const body = { name, pub: ok.pub, userPub: uk.pub, meta: await sealJson(ok.pub, await this.meta()), escrow: await seal(ok.pub, this.c.session.dekRaw) };
    const r = await this.call('POST', '/v1/org/create', { body });
    await this.c.saveKey({ id: 'org', orgId: r.orgId, priv: ok.priv, pub: ok.pub });
    return this.refresh();
  }
  async invite(role) {
    const fp = await fingerprint(this.state.org.pub);
    const secret = b32(crypto.getRandomValues(new Uint8Array(10)), 10);
    const r = await this.call('POST', '/v1/org/invite', { body: { code: await codeHash(secret), role } });
    const raw = secret + fp;
    return { code: raw.match(/.{4}/g).join('-'), expires: r.expires, role };
  }
  async join(code) {
    const { secret, fp } = parseCode(code);
    const h = await codeHash(secret);
    let info; try { info = await this.call('GET', '/v1/org/invite-info', { query: { code: h } }); } catch (e) { if (e.status === 404) throw new Error('Kod zaproszenia jest nieprawidłowy, wykorzystany lub wygasł.'); throw e; }
    if ((await fingerprint(info.pub)) !== fp) throw new Error('Kod nie pasuje do klucza gabinetu — poproś administratora o nowe zaproszenie.');
    const uk = await userKeys(this.c);
    await this.call('POST', '/v1/org/join', { body: { code: h, userPub: uk.pub, meta: await sealJson(info.pub, await this.meta()), escrow: await seal(info.pub, this.c.session.dekRaw) } });
    return this.refresh();
  }
  /** Members with names decrypted (admins only). */
  async members() {
    const ok = orgKey(this.c); if (!ok || !this.state?.members) return [];
    return Promise.all(this.state.members.map(async (m) => { let meta = {}; try { meta = await openJson(ok.priv, m.meta); } catch {} return { ...m, ...meta, self: m.acct === this.c.cfg.acct }; }));
  }
  async setRole(m, role) {
    const body = { member: m.acct, role };
    if (role === 'admin') body.grant = await sealJson(m.userPub, orgKey(this.c).priv);
    await this.call('POST', '/v1/org/member', { body }); return this.refresh();
  }
  async setStatus(m, status) { await this.call('POST', '/v1/org/member', { body: { member: m.acct, status } }); return this.refresh(); }
  async setPolicy(policy) { await this.call('POST', '/v1/org/policy', { body: { policy } }); return this.refresh(); }
  async rename(name) { await this.call('POST', '/v1/org/name', { body: { name } }); return this.refresh(); }
  async memberKey(m) { return open(orgKey(this.c).priv, m.escrow); }
  /** Admin password reset: the member's data key (from the escrow) wrapped with a new password. */
  async resetPassword(m, newPassword) {
    const dek = await this.memberKey(m);
    const first = await this.call('GET', '/v1/org/pull', { query: { member: m.acct, since: Number.MAX_SAFE_INTEGER } });
    const header = await rewrapHeader(first.header, dek, newPassword);
    await this.call('PUT', '/v1/org/header', { body: { member: m.acct, header, login: await loginToken(m.login, newPassword) } });
  }
  /** Admin access to a member's data (read-only): { patients, visits, letters, referrers, audit } as Maps. */
  async memberData(m) {
    const dek = await this.memberKey(m);
    let since = 0, more = true, header = null; const rows = [];
    while (more) { const r = await this.call('GET', '/v1/org/pull', { query: { member: m.acct, since } }); rows.push(...r.records); since = r.seq; more = r.more; header = r.header; }
    const s = await sessionFor(header, dek);
    const out = {};
    for (const r of rows) {
      const [, store, ...rest] = r.k.split('|'); if (store === 'keys') continue;
      try { const o = await s.decryptRecord(r); if (!o._deleted) (out[store] ??= new Map()).set(rest.join('|'), o); } catch {}
    }
    return out;
  }
}

// EndoList — serwer synchronizacji (zero-knowledge). Wspólna logika dla serwera lokalnego (server.mjs) i Cloudflare Worker.
// Serwer przechowuje WYŁĄCZNIE zaszyfrowane rekordy {k, iv, ct, at} oraz zaszyfrowany nagłówek konta (opakowane klucze).
// Klucz danych nigdy nie opuszcza urządzeń. Tokeny są przechowywane jako skróty SHA-256.
//
// Store interface (async):
//   getAccount(acct) -> {acct, loginHash, syncHash, header, headerAt, seq, fails, lockUntil} | null
//   createAccount(a)  -> boolean (false if exists)
//   updateAccount(acct, patch)
//   upsertRecords(acct, recs) -> { seq, accepted }   // last-writer-wins by `at`, assigns increasing seq
//   pullRecords(acct, since, limit) -> [{k, iv, ct, at, seq}]
//   deleteAccount(acct)

export const LIMITS = { pushRecords: 500, recordBytes: 1_900_000, pullRecords: 200, failLock: 8, lockMs: 10 * 60 * 1000 };
const ACCT = /^[0-9a-f]{64}$/, TOKEN = /^[A-Za-z0-9_-]{43}$/;

export async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
// constant-time comparison of two hex strings
function same(a, b) { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

export const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400' };
const out = (status, body) => ({ status, body });
const bad = (msg) => out(400, { error: 'bad_request', message: msg });

function validRecord(r, acctPid) {
  return r && typeof r.k === 'string' && r.k.length < 300 && typeof r.iv === 'string' && r.iv.length < 40 && typeof r.ct === 'string' && r.ct.length <= LIMITS.recordBytes
    && Number.isFinite(r.at) && (!acctPid || r.k.startsWith(acctPid + '|'));
}
function validHeader(h) { return h && typeof h === 'object' && typeof h.id === 'string' && typeof h.salt === 'string' && h.pw && typeof h.pw.ct === 'string' && JSON.stringify(h).length < 64_000; }

/**
 * @param req {method, path ('/v1/...'), query: URLSearchParams, auth: string|null, body: object|null}
 * @returns {status, body}
 */
export async function handle(req, store, now = Date.now()) {
  const { method, path } = req;
  if (method === 'GET' && path === '/v1/health') return out(200, { ok: true, app: 'EndoList-sync', v: 1 });

  const body = req.body || {};
  const acct = method === 'GET' ? req.query.get('acct') : body.acct;
  if (!ACCT.test(acct || '')) return bad('acct');

  if (method === 'POST' && path === '/v1/register') {
    if (!TOKEN.test(body.login || '') || !TOKEN.test(body.sync || '') || !validHeader(body.header)) return bad('register');
    const syncHash = await sha256hex(body.sync), loginHash = await sha256hex(body.login);
    const ex = await store.getAccount(acct);
    if (ex) {
      // the same account linking again (e.g. after re-enabling sync) — allowed only with its sync token
      if (!same(ex.syncHash, syncHash)) return out(409, { error: 'exists' });
      await store.updateAccount(acct, { loginHash, header: JSON.stringify(body.header), headerAt: now });
      return out(200, { ok: true, relinked: true, seq: ex.seq });
    }
    const ok = await store.createAccount({ acct, loginHash, syncHash, header: JSON.stringify(body.header), headerAt: now, seq: 0, fails: 0, lockUntil: 0, created: now });
    return ok ? out(201, { ok: true, seq: 0 }) : out(409, { error: 'exists' });
  }

  if (method === 'POST' && path === '/v1/login') {
    if (!TOKEN.test(body.login || '')) return bad('login');
    const a = await store.getAccount(acct);
    if (!a) return out(401, { error: 'auth' });
    if (a.lockUntil > now) return out(429, { error: 'locked', retryAfter: Math.ceil((a.lockUntil - now) / 1000) });
    if (!same(a.loginHash, await sha256hex(body.login))) {
      const fails = (a.fails || 0) + 1;
      await store.updateAccount(acct, fails >= LIMITS.failLock ? { fails: 0, lockUntil: now + LIMITS.lockMs } : { fails });
      return out(401, { error: 'auth' });
    }
    if (a.fails) await store.updateAccount(acct, { fails: 0 });
    return out(200, { header: JSON.parse(a.header), headerAt: a.headerAt });
  }

  // ---- everything below needs the sync token (derived from the data key, so only unlocked devices have it)
  const tok = (req.auth || '').replace(/^Bearer\s+/i, '');
  if (!TOKEN.test(tok)) return out(401, { error: 'auth' });
  const a = await store.getAccount(acct);
  if (!a || !same(a.syncHash, await sha256hex(tok))) return out(401, { error: 'auth' });
  const pid = JSON.parse(a.header).id;

  if (method === 'PUT' && path === '/v1/header') {
    if (!validHeader(body.header) || body.header.id !== pid) return bad('header');
    if (body.login !== undefined && !TOKEN.test(body.login)) return bad('login');
    const at = Number.isFinite(body.at) ? body.at : now;
    if (at < (a.headerAt || 0)) return out(200, { ok: true, stale: true, headerAt: a.headerAt });
    await store.updateAccount(acct, { header: JSON.stringify(body.header), headerAt: at, ...(body.login ? { loginHash: await sha256hex(body.login) } : {}) });
    return out(200, { ok: true, headerAt: at });
  }
  if (method === 'POST' && path === '/v1/push') {
    const recs = body.records;
    if (!Array.isArray(recs) || recs.length > LIMITS.pushRecords) return bad('records');
    for (const r of recs) if (!validRecord(r, pid)) return bad('record ' + String(r?.k).slice(0, 60));
    const res = await store.upsertRecords(acct, recs.map(({ k, iv, ct, at }) => ({ k, iv, ct, at })));
    return out(200, res);
  }
  if (method === 'GET' && path === '/v1/pull') {
    const since = Math.max(0, parseInt(req.query.get('since') || '0', 10) || 0);
    const limit = Math.min(LIMITS.pullRecords, Math.max(1, parseInt(req.query.get('limit') || String(LIMITS.pullRecords), 10) || LIMITS.pullRecords));
    const records = await store.pullRecords(acct, since, limit);
    const seq = records.length ? records[records.length - 1].seq : since;
    return out(200, { records, seq, more: records.length === limit, head: a.seq, header: JSON.parse(a.header), headerAt: a.headerAt });
  }
  if (method === 'DELETE' && path === '/v1/account') { await store.deleteAccount(acct); return out(200, { ok: true }); }
  return out(404, { error: 'not_found' });
}

/* ------------------------------------------------------------ in-memory / JSON-file store (local server, tests) */
export class FileStore {
  constructor(dir, fs, pathMod) { this.dir = dir; this.fs = fs; this.path = pathMod; this.cache = new Map(); }
  file(acct) { return this.path.join(this.dir, acct + '.json'); }
  async load(acct) {
    if (this.cache.has(acct)) return this.cache.get(acct);
    let v = null;
    try { v = JSON.parse(await this.fs.readFile(this.file(acct), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (v) this.cache.set(acct, v);
    return v;
  }
  async persist(acct) {
    const v = this.cache.get(acct); await this.fs.mkdir(this.dir, { recursive: true });
    const tmp = this.file(acct) + '.tmp'; await this.fs.writeFile(tmp, JSON.stringify(v)); await this.fs.rename(tmp, this.file(acct));
  }
  async getAccount(acct) { const v = await this.load(acct); return v ? v.account : null; }
  async createAccount(a) { if (await this.load(a.acct)) return false; this.cache.set(a.acct, { account: a, records: {} }); await this.persist(a.acct); return true; }
  async updateAccount(acct, patch) { const v = await this.load(acct); Object.assign(v.account, patch); await this.persist(acct); }
  async upsertRecords(acct, recs) {
    const v = await this.load(acct); let accepted = 0;
    for (const r of recs) { const cur = v.records[r.k]; if (cur && cur.at >= r.at) continue; v.records[r.k] = { ...r, seq: ++v.account.seq }; accepted++; }
    if (accepted) await this.persist(acct);
    return { seq: v.account.seq, accepted };
  }
  async pullRecords(acct, since, limit) { const v = await this.load(acct); return Object.values(v.records).filter((r) => r.seq > since).sort((a, b) => a.seq - b.seq).slice(0, limit); }
  async deleteAccount(acct) { this.cache.delete(acct); await this.fs.rm(this.file(acct), { force: true }); }
}

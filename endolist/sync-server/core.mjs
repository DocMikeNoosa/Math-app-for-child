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
// Clinic (organisation) — optional:
//   getOrg(orgId) / createOrg(org) / updateOrg(orgId, patch)
//   getMember(acct) -> {acct, orgId, role: 'admin'|'member', status: 'active'|'removed', meta, escrow, userPub, grant, lastSeen, joined} | null
//   putMember(m) / listMembers(orgId)
//   getInvite(hash) / putInvite(inv) / deleteInvite(hash) / countInvites(orgId)

export const LIMITS = { pushRecords: 500, recordBytes: 1_900_000, pullRecords: 200, failLock: 8, lockMs: 10 * 60 * 1000 };
const ACCT = /^[0-9a-f]{64}$/, TOKEN = /^[A-Za-z0-9_-]{43}$/, HEX64 = /^[0-9a-f]{64}$/, ORG = /^[0-9a-f]{32}$/;
const blob = (x, max = 20_000) => x && typeof x === 'object' && JSON.stringify(x).length < max;
const randomHex = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('');
// a removed clinic member loses access everywhere (their devices wipe clinic data on the next contact)
const removed = (m) => m && m.status === 'removed';

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
    if (store.getMember && removed(await store.getMember(acct))) return out(403, { error: 'removed' });
    return out(200, { header: JSON.parse(a.header), headerAt: a.headerAt });
  }

  // ---- everything below needs the sync token (derived from the data key, so only unlocked devices have it)
  const tok = (req.auth || '').replace(/^Bearer\s+/i, '');
  if (!TOKEN.test(tok)) return out(401, { error: 'auth' });
  const a = await store.getAccount(acct);
  if (!a || !same(a.syncHash, await sha256hex(tok))) return out(401, { error: 'auth' });
  const pid = JSON.parse(a.header).id;
  const me = store.getMember ? await store.getMember(acct) : null;
  if (removed(me)) return out(403, { error: 'removed' });
  if (path.startsWith('/v1/org')) return org(req, store, now, acct, me);

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
    if (me && now - (me.lastSeen || 0) > 5 * 60 * 1000) await store.putMember({ ...me, lastSeen: now });
    const seq = records.length ? records[records.length - 1].seq : since;
    return out(200, { records, seq, more: records.length === limit, head: a.seq, header: JSON.parse(a.header), headerAt: a.headerAt });
  }
  if (method === 'DELETE' && path === '/v1/account') {
    if (me) return out(403, { error: 'org_member', message: 'Konto należy do gabinetu — dane może usunąć administrator.' });
    await store.deleteAccount(acct); return out(200, { ok: true });
  }
  return out(404, { error: 'not_found' });
}

/* ------------------------------------------------------------ clinic: members, invites, admin actions
 * The server only stores public keys and sealed blobs; it cannot read member data. Admin rights are enforced here
 * (who may call what) and cryptographically (only admins hold the clinic private key that opens the key escrow). */
async function org(req, store, now, acct, me) {
  const { method, path } = req, body = req.body || {};
  const isAdmin = me && me.role === 'admin';
  const activeAdmins = async (orgId) => (await store.listMembers(orgId)).filter((m) => m.role === 'admin' && m.status === 'active');

  if (method === 'POST' && path === '/v1/org/create') {
    if (me) return out(409, { error: 'already_member' });
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 200 || !blob(body.pub, 2000) || !blob(body.meta) || !blob(body.escrow) || !blob(body.userPub, 2000)) return bad('org');
    const orgId = randomHex(16);
    await store.createOrg({ orgId, name: body.name.trim(), pub: body.pub, policy: { aiDpa: false }, created: now });
    await store.putMember({ acct, orgId, role: 'admin', status: 'active', meta: body.meta, escrow: body.escrow, userPub: body.userPub, grant: null, lastSeen: now, joined: now });
    return out(201, { orgId });
  }
  if (method === 'GET' && path === '/v1/org/invite-info') {
    const inv = await store.getInvite(req.query.get('code') || '');
    if (!inv || inv.expires < now) return out(404, { error: 'invite' });
    const o = await store.getOrg(inv.orgId);
    return out(200, { orgId: o.orgId, name: o.name, pub: o.pub, role: inv.role });
  }
  if (method === 'POST' && path === '/v1/org/join') {
    if (me) return out(409, { error: 'already_member' });
    if (!HEX64.test(body.code || '') || !blob(body.meta) || !blob(body.escrow) || !blob(body.userPub, 2000)) return bad('join');
    const inv = await store.getInvite(body.code);
    if (!inv || inv.expires < now) return out(404, { error: 'invite' });
    await store.deleteInvite(body.code); // single use
    await store.putMember({ acct, orgId: inv.orgId, role: inv.role, status: 'active', meta: body.meta, escrow: body.escrow, userPub: body.userPub, grant: null, lastSeen: now, joined: now });
    return out(200, { orgId: inv.orgId, role: inv.role });
  }
  if (!me) return out(404, { error: 'no_org' });
  const o = await store.getOrg(me.orgId);
  if (method === 'GET' && path === '/v1/org') {
    const members = isAdmin ? (await store.listMembers(me.orgId)).map(({ acct: a, role, status, meta, escrow, userPub, lastSeen, joined }) => ({ acct: a, role, status, meta, escrow, userPub, lastSeen, joined })) : null;
    return out(200, { org: { orgId: o.orgId, name: o.name, pub: o.pub, policy: o.policy }, me: { role: me.role, status: me.status, grant: me.grant }, members });
  }
  if (method === 'PUT' && path === '/v1/org/me') {
    const patch = {};
    if (body.meta !== undefined) { if (!blob(body.meta)) return bad('meta'); patch.meta = body.meta; }
    if (body.escrow !== undefined) { if (!blob(body.escrow)) return bad('escrow'); patch.escrow = body.escrow; }
    await store.putMember({ ...me, ...patch }); return out(200, { ok: true });
  }
  // ---- admins only
  if (!isAdmin) return out(403, { error: 'not_admin' });
  if (method === 'POST' && path === '/v1/org/invite') {
    if (!HEX64.test(body.code || '') || !['admin', 'member'].includes(body.role)) return bad('invite');
    if ((await store.countInvites(me.orgId, now)) >= 50) return out(429, { error: 'too_many_invites' });
    await store.putInvite({ hash: body.code, orgId: me.orgId, role: body.role, expires: now + 7 * 24 * 3600 * 1000, createdBy: acct });
    return out(201, { ok: true, expires: now + 7 * 24 * 3600 * 1000 });
  }
  if (method === 'POST' && path === '/v1/org/policy') {
    if (!blob(body.policy, 2000)) return bad('policy');
    await store.updateOrg(me.orgId, { policy: { aiDpa: !!body.policy.aiDpa } }); return out(200, { ok: true });
  }
  if (method === 'POST' && path === '/v1/org/name') {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.length > 200) return bad('name');
    await store.updateOrg(me.orgId, { name: body.name.trim() }); return out(200, { ok: true });
  }
  // actions on one member
  const m = ACCT.test(body.member || req.query.get('member') || '') ? await store.getMember(body.member || req.query.get('member')) : null;
  if (!m || m.orgId !== me.orgId) return out(404, { error: 'member' });
  if (method === 'POST' && path === '/v1/org/member') {
    const role = body.role ?? m.role, status = body.status ?? m.status;
    if (!['admin', 'member'].includes(role) || !['active', 'removed'].includes(status)) return bad('member');
    if (m.role === 'admin' && m.status === 'active' && (role !== 'admin' || status !== 'active') && (await activeAdmins(me.orgId)).length <= 1) return out(409, { error: 'last_admin', message: 'Gabinet musi mieć co najmniej jednego administratora.' });
    if (role === 'admin' && body.grant !== undefined && !blob(body.grant, 20_000)) return bad('grant');
    await store.putMember({ ...m, role, status, grant: role === 'admin' ? (body.grant ?? m.grant) : null });
    return out(200, { ok: true });
  }
  // read a member's records (encrypted — only an admin's clinic key opens the member's data key)
  if (method === 'GET' && path === '/v1/org/pull') {
    const since = Math.max(0, parseInt(req.query.get('since') || '0', 10) || 0);
    const records = await store.pullRecords(m.acct, since, LIMITS.pullRecords);
    const ma = await store.getAccount(m.acct);
    return out(200, { records, seq: records.length ? records[records.length - 1].seq : since, more: records.length === LIMITS.pullRecords, header: JSON.parse(ma.header) });
  }
  // password reset by an admin: a new header (data key wrapped with the new password) + new login token
  if (method === 'PUT' && path === '/v1/org/header') {
    const ma = await store.getAccount(m.acct);
    if (!validHeader(body.header) || body.header.id !== JSON.parse(ma.header).id || !TOKEN.test(body.login || '')) return bad('header');
    await store.updateAccount(m.acct, { header: JSON.stringify(body.header), headerAt: now, loginHash: await sha256hex(body.login), fails: 0, lockUntil: 0 });
    return out(200, { ok: true, headerAt: now });
  }
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
  // clinic data: one small JSON file
  async orgData() {
    if (this.org) return this.org;
    try { this.org = JSON.parse(await this.fs.readFile(this.path.join(this.dir, '_org.json'), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; this.org = { orgs: {}, members: {}, invites: {} }; }
    return this.org;
  }
  async saveOrg() { await this.fs.mkdir(this.dir, { recursive: true }); const f = this.path.join(this.dir, '_org.json'); await this.fs.writeFile(f + '.tmp', JSON.stringify(this.org)); await this.fs.rename(f + '.tmp', f); }
  async getOrg(id) { return (await this.orgData()).orgs[id] || null; }
  async createOrg(o) { (await this.orgData()).orgs[o.orgId] = o; await this.saveOrg(); }
  async updateOrg(id, patch) { Object.assign((await this.orgData()).orgs[id], patch); await this.saveOrg(); }
  async getMember(acct) { return (await this.orgData()).members[acct] || null; }
  async putMember(m) { (await this.orgData()).members[m.acct] = m; await this.saveOrg(); }
  async listMembers(orgId) { return Object.values((await this.orgData()).members).filter((m) => m.orgId === orgId); }
  async getInvite(h) { return (await this.orgData()).invites[h] || null; }
  async putInvite(i) { (await this.orgData()).invites[i.hash] = i; await this.saveOrg(); }
  async deleteInvite(h) { delete (await this.orgData()).invites[h]; await this.saveOrg(); }
  async countInvites(orgId, now) { return Object.values((await this.orgData()).invites).filter((i) => i.orgId === orgId && i.expires > now).length; }
}

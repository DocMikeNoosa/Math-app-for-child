// EndoList — serwer synchronizacji na Cloudflare Workers + D1 (bezpłatny plan wystarcza dla jednego gabinetu).
// Wdrożenie: zob. README.md w tym folderze.
import { handle, CORS } from './core.mjs';

const MAX_BODY = 25 * 1024 * 1024;

class D1Store {
  constructor(db) { this.db = db; }
  async getAccount(acct) {
    const r = await this.db.prepare('SELECT * FROM accounts WHERE acct = ?').bind(acct).first();
    return r ? { acct: r.acct, loginHash: r.login_hash, syncHash: r.sync_hash, header: r.header, headerAt: r.header_at, seq: r.seq, fails: r.fails, lockUntil: r.lock_until } : null;
  }
  async createAccount(a) {
    const r = await this.db.prepare('INSERT OR IGNORE INTO accounts (acct, login_hash, sync_hash, header, header_at, seq, fails, lock_until, created) VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)')
      .bind(a.acct, a.loginHash, a.syncHash, a.header, a.headerAt, a.created).run();
    return r.meta.changes === 1;
  }
  async updateAccount(acct, p) {
    const map = { loginHash: 'login_hash', header: 'header', headerAt: 'header_at', fails: 'fails', lockUntil: 'lock_until' };
    const keys = Object.keys(p).filter((k) => map[k]);
    if (!keys.length) return;
    await this.db.prepare(`UPDATE accounts SET ${keys.map((k) => `${map[k]} = ?`).join(', ')} WHERE acct = ?`).bind(...keys.map((k) => p[k]), acct).run();
  }
  async upsertRecords(acct, recs) {
    if (!recs.length) { const a = await this.getAccount(acct); return { seq: a.seq, accepted: 0 }; }
    // one transaction: reserve a block of sequence numbers, then upsert (newer `at` wins)
    const stmts = [this.db.prepare('UPDATE accounts SET seq = seq + ? WHERE acct = ?').bind(recs.length, acct)];
    const base = `(SELECT seq FROM accounts WHERE acct = ?) - ${recs.length}`;
    recs.forEach((r, i) => stmts.push(this.db.prepare(
      `INSERT INTO records (acct, k, iv, ct, at, seq) VALUES (?, ?, ?, ?, ?, ${base} + ${i + 1})
       ON CONFLICT (acct, k) DO UPDATE SET iv = excluded.iv, ct = excluded.ct, at = excluded.at, seq = excluded.seq WHERE excluded.at > records.at`,
    ).bind(acct, r.k, r.iv, r.ct, r.at, acct)));
    const res = await this.db.batch(stmts);
    const accepted = res.slice(1).reduce((n, x) => n + (x.meta.changes || 0), 0);
    const a = await this.getAccount(acct);
    return { seq: a.seq, accepted };
  }
  async pullRecords(acct, since, limit) {
    const r = await this.db.prepare('SELECT k, iv, ct, at, seq FROM records WHERE acct = ? AND seq > ? ORDER BY seq LIMIT ?').bind(acct, since, limit).all();
    return r.results;
  }
  // ---- clinic
  async getOrg(id) { const r = await this.db.prepare('SELECT * FROM orgs WHERE org_id = ?').bind(id).first(); return r ? { orgId: r.org_id, name: r.name, pub: JSON.parse(r.pub), policy: JSON.parse(r.policy), created: r.created } : null; }
  async createOrg(o) { await this.db.prepare('INSERT INTO orgs (org_id, name, pub, policy, created) VALUES (?, ?, ?, ?, ?)').bind(o.orgId, o.name, JSON.stringify(o.pub), JSON.stringify(o.policy), o.created).run(); }
  async updateOrg(id, p) { const o = await this.getOrg(id); const n = { ...o, ...p }; await this.db.prepare('UPDATE orgs SET name = ?, policy = ? WHERE org_id = ?').bind(n.name, JSON.stringify(n.policy), id).run(); }
  member(r) { return r ? { acct: r.acct, orgId: r.org_id, role: r.role, status: r.status, meta: JSON.parse(r.meta), escrow: JSON.parse(r.escrow), userPub: JSON.parse(r.user_pub), grant: r.grant_blob ? JSON.parse(r.grant_blob) : null, lastSeen: r.last_seen, joined: r.joined } : null; }
  async getMember(acct) { return this.member(await this.db.prepare('SELECT * FROM members WHERE acct = ?').bind(acct).first()); }
  async putMember(m) {
    await this.db.prepare('INSERT OR REPLACE INTO members (acct, org_id, role, status, meta, escrow, user_pub, grant_blob, last_seen, joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(m.acct, m.orgId, m.role, m.status, JSON.stringify(m.meta), JSON.stringify(m.escrow), JSON.stringify(m.userPub), m.grant ? JSON.stringify(m.grant) : null, m.lastSeen || 0, m.joined || 0).run();
  }
  async listMembers(orgId) { return (await this.db.prepare('SELECT * FROM members WHERE org_id = ?').bind(orgId).all()).results.map((r) => this.member(r)); }
  async getInvite(h) { const r = await this.db.prepare('SELECT * FROM invites WHERE hash = ?').bind(h).first(); return r ? { hash: r.hash, orgId: r.org_id, role: r.role, expires: r.expires, createdBy: r.created_by } : null; }
  async putInvite(i) { await this.db.prepare('INSERT OR REPLACE INTO invites (hash, org_id, role, expires, created_by) VALUES (?, ?, ?, ?, ?)').bind(i.hash, i.orgId, i.role, i.expires, i.createdBy).run(); }
  async deleteInvite(h) { await this.db.prepare('DELETE FROM invites WHERE hash = ?').bind(h).run(); }
  async countInvites(orgId, now) { return (await this.db.prepare('SELECT COUNT(*) AS n FROM invites WHERE org_id = ? AND expires > ?').bind(orgId, now).first()).n; }
  async deleteAccount(acct) { await this.db.batch([this.db.prepare('DELETE FROM records WHERE acct = ?').bind(acct), this.db.prepare('DELETE FROM accounts WHERE acct = ?').bind(acct)]); }
}

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS } });

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    let body = null;
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY) return json(413, { error: 'too_large' });
      try { body = await request.json(); } catch { return json(400, { error: 'bad_json' }); }
    }
    try {
      const r = await handle({ method: request.method, path: url.pathname.replace(/\/+$/, ''), query: url.searchParams, auth: request.headers.get('Authorization'), body }, new D1Store(env.DB));
      return json(r.status, r.body);
    } catch (e) { console.error(e); return json(500, { error: 'server' }); }
  },
};

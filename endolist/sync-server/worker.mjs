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

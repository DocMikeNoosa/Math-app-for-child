// Database (SQLite, built into Node 22+): users, sessions, subscriptions, usage, payments, audit.
// One file, no external server. Path: DATA_DIR/radiopis.db (default ./data).
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

let db = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL DEFAULT '',
  pwd TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',            -- user | admin
  blocked INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'trial',
  sub_status TEXT NOT NULL DEFAULT 'trial',     -- trial | active | past_due | canceled | expired
  sub_until INTEGER NOT NULL DEFAULT 0,         -- ms; access ends after this moment
  quota_override INTEGER,                       -- reports / month, overrides the plan
  npwz TEXT NOT NULL DEFAULT '',                -- licence number (numer prawa wykonywania zawodu)
  company TEXT NOT NULL DEFAULT '',
  nip TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',                -- admin-only note
  stripe_customer TEXT,
  stripe_sub TEXT,
  reminded INTEGER NOT NULL DEFAULT 0,          -- last expiry reminder sent (days before: 7 / 1)
  cost_alerted TEXT NOT NULL DEFAULT '',        -- month (YYYY-MM) of the last cost alert
  created_at INTEGER NOT NULL,
  last_login INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                          -- sha256 of the cookie token
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  ua TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS usage (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  month TEXT NOT NULL,                          -- YYYY-MM (UTC)
  kind TEXT NOT NULL,                           -- format | learn
  report_id TEXT NOT NULL DEFAULT '',           -- one id per report: several AI calls can belong to one report
  model TEXT NOT NULL DEFAULT '',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cache_write INTEGER NOT NULL DEFAULT 0,
  cache_read INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0,
  ms INTEGER NOT NULL DEFAULT 0,
  ok INTEGER NOT NULL DEFAULT 1,
  lang TEXT NOT NULL DEFAULT ''                 -- e.g. pl>pl, en>pl, en>en
);
CREATE INDEX IF NOT EXISTS usage_user_month ON usage(user_id, month);
CREATE INDEX IF NOT EXISTS usage_month ON usage(month);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ts INTEGER NOT NULL,
  amount_pln REAL NOT NULL,
  provider TEXT NOT NULL,                       -- stripe | transfer | manual
  ref TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT '',
  period_until INTEGER,
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS payments_user ON payments(user_id);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,
  actor_id INTEGER,
  action TEXT NOT NULL,
  target_id INTEGER,
  detail TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS user_data (                      -- per-user app data synced across devices
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, key)
);
CREATE TABLE IF NOT EXISTS tokens (                         -- password-reset / invitation tokens
  id TEXT PRIMARY KEY,                                      -- sha256 of the token
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS webhook_events (id TEXT PRIMARY KEY, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS outbox (                         -- e-mails (sent or, without a mail provider, only logged)
  id INTEGER PRIMARY KEY,
  ts INTEGER NOT NULL,
  to_addr TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL
);
`;

export function openDb(file = process.env.DB_FILE || path.join(process.env.DATA_DIR || path.join(APP_DIR, 'data'), 'radiopis.db')) {
  if (db) return db;
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  db.exec(SCHEMA);
  return db;
}

export function getDb() {
  return db || openDb();
}

/** Close (tests). */
export function closeDb() {
  if (db) db.close();
  db = null;
}

export const one = (sql, ...p) => getDb().prepare(sql).get(...p) || null;
export const all = (sql, ...p) => getDb().prepare(sql).all(...p);
export const run = (sql, ...p) => getDb().prepare(sql).run(...p);

export function tx(fn) {
  const d = getDb();
  d.exec('BEGIN');
  try {
    const r = fn();
    d.exec('COMMIT');
    return r;
  } catch (err) {
    d.exec('ROLLBACK');
    throw err;
  }
}

export function getSetting(key, fallback = null) {
  const row = one('SELECT value FROM settings WHERE key = ?', key);
  if (!row) return fallback;
  try { return JSON.parse(row.value); } catch { return fallback; }
}
export function setSetting(key, value) {
  run('INSERT INTO settings(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, JSON.stringify(value));
}

export function audit(actorId, action, targetId = null, detail = '') {
  run('INSERT INTO audit(ts, actor_id, action, target_id, detail) VALUES (?, ?, ?, ?, ?)', Date.now(), actorId ?? null, action, targetId ?? null, String(detail).slice(0, 2000));
}

/** YYYY-MM of a timestamp (UTC). */
export const monthOf = (ts = Date.now()) => new Date(ts).toISOString().slice(0, 7);

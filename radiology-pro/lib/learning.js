// The learning archive: everything the AI learns from radiologists is kept PERMANENTLY, de-identified, in its own
// database file (DATA_DIR/learning.db) — separate from accounts, so it can be backed up, exported and reused on its
// own, and it is never lost when the app's rolling per-user memory drops old examples or a user is deleted.
//
// Who can see it: only the owner of the service (role 'admin'). Never organisation IT administrators, never the
// subscribing company, never other users. It is not sent to any browser.
//
// Privacy (RODO): before storing, identifiers are removed (PESEL, dates, e-mails, phone numbers, long ID numbers,
// names after "Pan/Pani/pacjent…"). The item itself carries no user id. Only a separate link table holds a keyed
// pseudonym of the contributor (HMAC with a secret) — used to count how many different radiologists made the same
// correction; it is deleted when the account is erased, after which the items are anonymous.
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let ldb = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,                 -- sha256 of kind + template + content: the same lesson is stored once
  kind TEXT NOT NULL,                        -- style_pair | concl_removed | concl_added | restored | example_report | en_pl | rule | phrase | glossary | sample
  template_id TEXT NOT NULL DEFAULT '',
  lang TEXT NOT NULL DEFAULT 'pl',
  content TEXT NOT NULL,                     -- JSON, de-identified
  first_seen INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  seen INTEGER NOT NULL DEFAULT 1            -- how many times it arrived (all users, all devices)
);
CREATE INDEX IF NOT EXISTS items_kind ON items(kind, template_id);
CREATE TABLE IF NOT EXISTS contributors (    -- pseudonymous link, deleted on account erasure
  item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  who TEXT NOT NULL,                         -- HMAC(secret, user id)
  org TEXT NOT NULL DEFAULT '',              -- HMAC(secret, organisation id) — to require lessons from several companies
  at INTEGER NOT NULL,
  PRIMARY KEY (item_id, who)
);
CREATE INDEX IF NOT EXISTS contributors_who ON contributors(who);
CREATE TABLE IF NOT EXISTS versions (        -- global knowledge distilled from the archive; append-only history
  id INTEGER PRIMARY KEY,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',      -- draft | published | archived
  method TEXT NOT NULL DEFAULT '',           -- counts | ai
  stats TEXT NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,                     -- JSON { general_rules, template_rules, glossary, avoid_in_conclusion, phrasing, summary }
  published_at INTEGER,
  note TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

export function openLearningDb(file = process.env.LEARNING_DB_FILE || (process.env.DB_FILE === ':memory:' ? ':memory:' : path.join(process.env.DATA_DIR || path.join(APP_DIR, 'data'), 'learning.db'))) {
  if (ldb) return ldb;
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  ldb = new DatabaseSync(file);
  ldb.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000; PRAGMA synchronous = NORMAL;');
  ldb.exec(SCHEMA);
  return ldb;
}
export const learningDb = () => ldb || openLearningDb();
export function closeLearningDb() { if (ldb) ldb.close(); ldb = null; }
const one = (sql, ...p) => learningDb().prepare(sql).get(...p) || null;
const all = (sql, ...p) => learningDb().prepare(sql).all(...p);
const run = (sql, ...p) => learningDb().prepare(sql).run(...p);

// ---------------------------------------------------------------- pseudonyms
function secret() {
  if (process.env.LEARNING_SECRET) return process.env.LEARNING_SECRET;
  let row = one("SELECT value FROM meta WHERE key = 'secret'");
  if (!row) {
    run("INSERT OR IGNORE INTO meta(key, value) VALUES ('secret', ?)", crypto.randomBytes(32).toString('base64'));
    row = one("SELECT value FROM meta WHERE key = 'secret'");
  }
  return row.value;
}
export const pseudonym = (kind, id) => (id ? crypto.createHmac('sha256', secret()).update(`${kind}:${id}`).digest('base64url').slice(0, 22) : '');

// ---------------------------------------------------------------- de-identification
const NAME_WORD = '[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:-[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)?';
const RULES = [
  [/(?<!\d)\d{11}(?!\d)/g, '[PESEL]'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[EMAIL]'],
  [/(?<![\d,.])\d{1,2}[./-]\d{1,2}[./-](?:19|20)\d{2}(?![\d])/g, '[DATA]'],
  [/(?<![\d,.])(?:19|20)\d{2}-\d{2}-\d{2}(?!\d)/g, '[DATA]'],
  [/(?<![\d,.])(?:\+48[\s-]?)?(?:\d{3}[\s-]\d{3}[\s-]\d{3}|\d{2}[\s-]\d{3}[\s-]\d{2}[\s-]\d{2})(?![\d,])/g, '[TELEFON]'],
  [/(?<![\d,.])\d{7,}(?![\d,])/g, '[NUMER]'],
  // a capitalised name after a title / "pacjent" (lower-case words after them are left alone: "pacjent z bólem")
  [new RegExp(`(?<!\\p{L})([Pp]ani|[Pp]anią|[Pp]ana|[Pp]anu|[Pp]an|[Pp]acjentka|[Pp]acjentki|[Pp]acjenta|[Pp]acjent|[Cc]hora|[Cc]hory|[Dd]r\\.?|[Ll]ek\\.|[Ii]mię i nazwisko:?|[Nn]azwisko:?)\\s+${NAME_WORD}(?:\\s+${NAME_WORD})?`, 'gu'), (m, title) => `${title} [OSOBA]`],
  [/\b(nr|numer)\s+(badania|skierowania|zlecenia|historii choroby|ks\.?\s*gł\.?)\s*:?\s*[\w/-]+/giu, '$1 $2 [NUMER]'],
];
/** Remove personal identifiers from a text (best effort; keeps clinical measurements such as "12 x 8 mm"). */
export function deidentify(text) {
  let s = String(text ?? '');
  for (const [re, rep] of RULES) s = s.replace(re, rep);
  return s.trim();
}
const clean = (v, len = 6000) => deidentify(String(v ?? '').slice(0, len));

// ---------------------------------------------------------------- capture
/** Turn one synced value (the app's local learning keys) into archive items. */
export function itemsFromSync(key, raw) {
  let v;
  try { v = JSON.parse(raw); } catch { return []; }
  const out = [];
  const push = (kind, content, templateId = '', lang = 'pl') => {
    if (Object.values(content).some((x) => typeof x === 'string' && x.trim())) out.push({ kind, content, templateId: String(templateId || '').slice(0, 80), lang });
  };
  if (key === 'radvox.style.v1' && Array.isArray(v)) {
    for (const p of v) if (p && typeof p.ai === 'string' && typeof p.final === 'string' && p.ai !== p.final) push('style_pair', { ai: clean(p.ai, 800), final: clean(p.final, 800) });
  }
  if (key === 'radvox.learned.v1' && v && typeof v === 'object') {
    for (const s of Array.isArray(v.conclusionRemoved) ? v.conclusionRemoved : []) if (typeof s === 'string') push('concl_removed', { text: clean(s, 400) });
    for (const s of Array.isArray(v.conclusionAdded) ? v.conclusionAdded : []) if (typeof s === 'string') push('concl_added', { text: clean(s, 400) });
    for (const s of Array.isArray(v.restored) ? v.restored : []) if (typeof s === 'string') push('restored', { text: clean(s, 400) });
    for (const [tid, list] of Object.entries(v.reports && typeof v.reports === 'object' ? v.reports : {})) {
      for (const r of Array.isArray(list) ? list : []) if (r && typeof r.body === 'string') push('example_report', { body: clean(r.body, 8000), conclusion: clean(r.conclusion, 3000) }, tid);
    }
    for (const t of Array.isArray(v.translations) ? v.translations : []) if (t && typeof t.en === 'string' && typeof t.pl === 'string') push('en_pl', { en: clean(t.en, 3000), pl: clean(t.pl, 3000) }, t.templateId, 'en>pl');
  }
  if (key === 'radvox.profile.v1' && v && typeof v === 'object') {
    for (const r of Array.isArray(v.rules) ? v.rules : []) if (typeof r === 'string') push('rule', { text: clean(r, 400) });
    for (const p of Array.isArray(v.phrases) ? v.phrases : []) if (p && typeof p === 'object') push('phrase', { situation: clean(p.situation, 300), preferred: clean(p.preferred ?? p.phrase, 400) });
    for (const g of Array.isArray(v.glossary) ? v.glossary : []) if (g && typeof g.en === 'string' && typeof g.pl === 'string') push('glossary', { en: clean(g.en, 120).toLowerCase(), pl: clean(g.pl, 160) }, '', 'en>pl');
    for (const s of Array.isArray(v.samples) ? v.samples : []) if (s && typeof s.text === 'string') push('sample', { text: clean(s.text, 8000) }, '', s.lang === 'en' ? 'en' : 'pl');
    for (const a of Array.isArray(v.answers) ? v.answers : []) if (a && typeof a === 'object') push('answer', { question: clean(a.question, 400), suggestion: clean(a.suggestion, 600), final: clean(a.final, 600) });
  }
  return out;
}

const hashOf = (it) => crypto.createHash('sha256').update(`${it.kind}|${it.templateId}|${JSON.stringify(it.content)}`).digest('hex');

/**
 * Store new lessons from one sync (called on every PUT /api/sync of a learning key). Returns the number of new items.
 * Never throws into the request: learning must not break the radiologist's work.
 */
export function captureLearning(userId, orgId, key, raw) {
  try {
    const items = itemsFromSync(key, raw);
    if (!items.length) return 0;
    const now = Date.now();
    const who = pseudonym('user', userId);
    const org = orgId ? pseudonym('org', orgId) : '';
    const d = learningDb();
    let added = 0;
    d.exec('BEGIN');
    try {
      const ins = d.prepare('INSERT INTO items(hash, kind, template_id, lang, content, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(hash) DO UPDATE SET last_seen = excluded.last_seen, seen = seen + 1 RETURNING id, first_seen');
      const link = d.prepare('INSERT OR IGNORE INTO contributors(item_id, who, org, at) VALUES (?, ?, ?, ?)');
      for (const it of items) {
        const r = ins.get(hashOf(it), it.kind, it.templateId, it.lang, JSON.stringify(it.content), now, now);
        if (r.first_seen === now) added++;
        link.run(r.id, who, org, now);
      }
      d.exec('COMMIT');
    } catch (err) { d.exec('ROLLBACK'); throw err; }
    return added;
  } catch (err) {
    console.error('learning capture', err.message);
    return 0;
  }
}

/** RODO erasure: remove the pseudonymous links of a user; the lessons stay, now fully anonymous. */
export function forgetContributor(userId) {
  return Number(run('DELETE FROM contributors WHERE who = ?', pseudonym('user', userId)).changes);
}

// ---------------------------------------------------------------- owner's view
export function archiveStats() {
  const byKind = all(`SELECT i.kind, COUNT(*) AS items, SUM(i.seen) AS seen,
      SUM(CASE WHEN (SELECT COUNT(*) FROM contributors c WHERE c.item_id = i.id) >= 2 THEN 1 ELSE 0 END) AS shared
      FROM items i GROUP BY i.kind ORDER BY items DESC`);
  return {
    items: one('SELECT COUNT(*) AS n FROM items').n,
    contributors: one('SELECT COUNT(DISTINCT who) AS n FROM contributors').n,
    organisations: one("SELECT COUNT(DISTINCT org) AS n FROM contributors WHERE org <> ''").n,
    templates: one("SELECT COUNT(DISTINCT template_id) AS n FROM items WHERE template_id <> ''").n,
    firstAt: one('SELECT MIN(first_seen) AS t FROM items').t,
    lastAt: one('SELECT MAX(last_seen) AS t FROM items').t,
    byKind,
    lastWeek: one('SELECT COUNT(*) AS n FROM items WHERE first_seen > ?', Date.now() - 7 * 86400000).n,
  };
}

/** Lessons shared by at least `minContributors` different radiologists (and `minOrgs` organisations, if any). */
export function sharedItems(kind, { minContributors = 3, minOrgs = 1, limit = 200 } = {}) {
  return all(`SELECT i.id, i.kind, i.template_id, i.lang, i.content, i.seen,
        COUNT(c.who) AS contributors, COUNT(DISTINCT NULLIF(c.org, '')) AS orgs
      FROM items i JOIN contributors c ON c.item_id = i.id
      WHERE i.kind = ? GROUP BY i.id HAVING contributors >= ? AND (orgs >= ? OR orgs = 0)
      ORDER BY contributors DESC, i.seen DESC LIMIT ?`, kind, minContributors, minOrgs, limit)
    .map((r) => ({ ...r, content: JSON.parse(r.content) }));
}

/** Everything, for the owner's export (JSON lines). Pseudonyms are not exported — only counts. */
export function* exportArchive() {
  yield JSON.stringify({ type: 'meta', exportedAt: new Date().toISOString(), stats: archiveStats() });
  for (const r of learningDb().prepare(`SELECT i.*, (SELECT COUNT(*) FROM contributors c WHERE c.item_id = i.id) AS contributors FROM items i ORDER BY i.id`).iterate()) {
    yield JSON.stringify({ type: 'item', id: r.id, kind: r.kind, templateId: r.template_id, lang: r.lang, content: JSON.parse(r.content), seen: r.seen, contributors: r.contributors, firstSeen: r.first_seen, lastSeen: r.last_seen });
  }
  for (const v of all('SELECT * FROM versions ORDER BY id')) yield JSON.stringify({ type: 'version', ...v, stats: JSON.parse(v.stats), content: JSON.parse(v.content) });
}

export const versions = () => all('SELECT id, created_at, status, method, stats, published_at, note FROM versions ORDER BY id DESC LIMIT 50').map((v) => ({ ...v, stats: JSON.parse(v.stats) }));
export function getVersion(id) {
  const v = one('SELECT * FROM versions WHERE id = ?', id);
  return v ? { ...v, stats: JSON.parse(v.stats), content: JSON.parse(v.content) } : null;
}
export function addVersion({ method, stats, content, note = '' }) {
  const info = run('INSERT INTO versions(created_at, status, method, stats, content, note) VALUES (?, ?, ?, ?, ?, ?)', Date.now(), 'draft', method, JSON.stringify(stats), JSON.stringify(content), String(note).slice(0, 500));
  return getVersion(Number(info.lastInsertRowid));
}
export function updateVersionContent(id, content) {
  run("UPDATE versions SET content = ? WHERE id = ? AND status = 'draft'", JSON.stringify(content), id);
  return getVersion(id);
}
/** Publish one version (the previous published one is archived — never deleted). */
export function publishVersion(id) {
  const d = learningDb();
  d.exec('BEGIN');
  try {
    run("UPDATE versions SET status = 'archived' WHERE status = 'published'");
    run("UPDATE versions SET status = 'published', published_at = ? WHERE id = ?", Date.now(), id);
    d.exec('COMMIT');
  } catch (err) { d.exec('ROLLBACK'); throw err; }
  return getVersion(id);
}
export function unpublishAll() { run("UPDATE versions SET status = 'archived' WHERE status = 'published'"); }
export function publishedVersion() {
  const v = one("SELECT * FROM versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1");
  return v ? { ...v, content: JSON.parse(v.content) } : null;
}

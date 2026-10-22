// Database backups: online copies of BOTH databases (accounts: radiopis.db, learning archive: learning.db) — users
// keep working during the copy. One per day, kept BACKUP_KEEP_DAYS days (default 14) in BACKUP_DIR
// (default DATA_DIR/backups). The learning archive only grows, so every copy contains all learning so far.
//
// With BACKUP_KEY set (a long passphrase, kept OUTSIDE the server too — without it backups cannot be read),
// every copy is encrypted (AES-256-GCM, key from scrypt) and only the encrypted file stays on disk: a copied or
// stolen backup reveals nothing (RODO art. 32). Decrypt: node scripts/decrypt-backup.mjs <file.enc> <out.db>.
import { backup } from 'node:sqlite';
import crypto from 'node:crypto';
import { createReadStream, createWriteStream, mkdirSync, readdirSync, statSync, unlinkSync, openSync, readSync, closeSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { getDb, getSetting, setSetting } from './db.js';
import { learningDb } from './learning.js';

export const backupDir = () => process.env.BACKUP_DIR || path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'backups');
const keepDays = () => Math.max(1, Number(process.env.BACKUP_KEEP_DAYS) || 14);
const MAGIC = Buffer.from('RPB1');
const FILE_RE = /^(radiopis|learning)-\d{8}-\d{4}\.db(\.enc)?$/;

const keyFrom = (pass, salt) => crypto.scryptSync(String(pass), salt, 32, { N: 16384, r: 8, p: 1 });

export async function encryptFile(src, dest, pass) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyFrom(pass, salt), iv);
  const out = createWriteStream(dest);
  out.write(Buffer.concat([MAGIC, salt, iv]));
  await pipeline(createReadStream(src), cipher, out, { end: false });
  await new Promise((resolve, reject) => out.end(cipher.getAuthTag(), (err) => (err ? reject(err) : resolve())));
}

export async function decryptFile(src, dest, pass) {
  const size = statSync(src).size;
  const fd = openSync(src, 'r');
  const head = Buffer.alloc(32);
  const tag = Buffer.alloc(16);
  readSync(fd, head, 0, 32, 0);
  readSync(fd, tag, 0, 16, size - 16);
  closeSync(fd);
  if (!head.subarray(0, 4).equals(MAGIC)) throw new Error('To nie jest zaszyfrowana kopia RadVox Pro.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyFrom(pass, head.subarray(4, 20)), head.subarray(20, 32));
  decipher.setAuthTag(tag);
  try {
    await pipeline(createReadStream(src, { start: 32, end: size - 17 }), decipher, createWriteStream(dest));
  } catch (err) {
    try { unlinkSync(dest); } catch { /* nothing written */ }
    throw new Error(/auth/i.test(err.message) ? 'Zły klucz BACKUP_KEY albo uszkodzony plik.' : err.message);
  }
}

async function copyOne(db, dir, name, stamp) {
  const plain = path.join(dir, `${name}-${stamp}.db`);
  await backup(db, plain, { rate: 200 });
  if (!process.env.BACKUP_KEY) return plain;
  await encryptFile(plain, `${plain}.enc`, process.env.BACKUP_KEY);
  unlinkSync(plain);
  return `${plain}.enc`;
}

export async function backupNow(dir = backupDir()) {
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/^(\d{8})/, '$1-');
  const started = Date.now();
  const main = await copyOne(getDb(), dir, 'radiopis', stamp);
  const learning = await copyOne(learningDb(), dir, 'learning', stamp);
  // retention (the newest copy of each kind is always kept)
  const cutoff = Date.now() - keepDays() * 86400000;
  let removed = 0;
  for (const f of readdirSync(dir)) {
    if (!FILE_RE.test(f)) continue;
    const full = path.join(dir, f);
    if (full !== main && full !== learning && statSync(full).mtimeMs < cutoff) { unlinkSync(full); removed++; }
  }
  const info = { file: path.basename(main), learningFile: path.basename(learning), size: statSync(main).size, learningSize: statSync(learning).size, encrypted: Boolean(process.env.BACKUP_KEY), ms: Date.now() - started, at: Date.now(), removed };
  setSetting('lastBackup', info);
  return info;
}

export const lastBackup = () => getSetting('lastBackup', null);

/** Daily backup: called from the hourly jobs; runs when the last one is older than 23 hours. */
export async function backupIfDue(now = Date.now()) {
  if (process.env.BACKUP_DISABLED === '1') return null;
  const last = lastBackup();
  if (last && now - last.at < 23 * 3600_000) return null;
  return backupNow();
}

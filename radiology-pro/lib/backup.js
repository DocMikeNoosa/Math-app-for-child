// Database backups: an online copy of the SQLite file (users keep working during the copy), one per day,
// kept for BACKUP_KEEP_DAYS days (default 14) in BACKUP_DIR (default DATA_DIR/backups).
// Copy the backup folder to another place (another server / object storage) — see DEPLOY.md.
import { backup } from 'node:sqlite';
import { mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { getDb, getSetting, setSetting } from './db.js';

export const backupDir = () => process.env.BACKUP_DIR || path.join(process.env.DATA_DIR || path.join(process.cwd(), 'data'), 'backups');
const keepDays = () => Math.max(1, Number(process.env.BACKUP_KEEP_DAYS) || 14);

export async function backupNow(dir = backupDir()) {
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/^(\d{8})/, '$1-');
  const file = path.join(dir, `radiopis-${stamp}.db`);
  const started = Date.now();
  await backup(getDb(), file, { rate: 200 });
  const size = statSync(file).size;
  // retention
  const cutoff = Date.now() - keepDays() * 86400000;
  let removed = 0;
  for (const f of readdirSync(dir)) {
    if (!/^radiopis-\d{8}-\d{4}\.db$/.test(f)) continue;
    const full = path.join(dir, f);
    if (statSync(full).mtimeMs < cutoff) { unlinkSync(full); removed++; }
  }
  const info = { file: path.basename(file), size, ms: Date.now() - started, at: Date.now(), removed };
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

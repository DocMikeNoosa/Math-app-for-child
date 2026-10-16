// Encryption of secrets stored in the database (friends' own API keys): AES-256-GCM. The key comes from KEYS_SECRET
// (set it on the server and keep a copy outside it), or else from a random file next to the database (data/.keys-secret)
// — then a stolen copy of the database alone cannot reveal the keys.
import crypto from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

let key = null;
function masterKey() {
  if (key) return key;
  if (process.env.KEYS_SECRET) return (key = crypto.createHash('sha256').update(process.env.KEYS_SECRET).digest());
  const dir = process.env.DATA_DIR || path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data');
  const file = path.join(dir, '.keys-secret');
  if (!existsSync(file)) { mkdirSync(dir, { recursive: true }); writeFileSync(file, crypto.randomBytes(32).toString('base64'), { mode: 0o600 }); }
  return (key = crypto.createHash('sha256').update(readFileSync(file, 'utf8').trim()).digest());
}

export function seal(text) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', masterKey(), iv);
  const enc = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return `v1:${iv.toString('base64')}:${c.getAuthTag().toString('base64')}:${enc.toString('base64')}`;
}

export function open(box) {
  const [v, iv, tag, enc] = String(box || '').split(':');
  if (v !== 'v1' || !enc) return '';
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', masterKey(), Buffer.from(iv, 'base64'));
    d.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([d.update(Buffer.from(enc, 'base64')), d.final()]).toString('utf8');
  } catch { return ''; }
}

/** What the owner of a key may see of it: the start and the last four characters. */
export const maskKey = (k) => (k ? `${k.slice(0, 7)}…${k.slice(-4)}` : '');

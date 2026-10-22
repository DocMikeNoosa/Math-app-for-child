// Organisations (e.g. a teleradiology company): one licence with a number of seats, many users.
// Roles: 'admin' = the owner of the service (everything), 'orgadmin' = the organisation's IT administrator
// (manages only the users of their own organisation), 'user' = a radiologist.
import crypto from 'node:crypto';
import { one, all, run, audit } from './db.js';

export const ROLES = ['user', 'orgadmin', 'admin'];
export const ORG_STATUS = ['trial', 'active', 'suspended'];

export const getOrg = (id) => (id ? one('SELECT * FROM orgs WHERE id = ?', id) : null);
export const listOrgs = () => all('SELECT * FROM orgs ORDER BY name COLLATE NOCASE');

/** Seats in use = accounts that are not blocked (blocking a user frees the seat). */
export const seatsUsed = (orgId) => one('SELECT COUNT(*) AS n FROM users WHERE org_id = ? AND blocked = 0', orgId).n;
export const orgUsers = (orgId) => all('SELECT * FROM users WHERE org_id = ? ORDER BY name COLLATE NOCASE, email', orgId);

const clean = (v, len) => (typeof v === 'string' ? v.trim().slice(0, len) : '');
const int = (v, d, min, max) => (Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.min(max, Math.max(min, Math.round(Number(v)))) : d);

export function createOrg(b, actorId) {
  const now = Date.now();
  const days = int(b.days, 14, 1, 3660);
  const info = run(
    `INSERT INTO orgs(name, nip, seats, status, sub_until, plan, quota_per_user, devices, price_per_seat, contact, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    clean(b.name, 200), String(b.nip || '').replace(/[^\d]/g, '').slice(0, 10), int(b.seats, 10, 1, 5000),
    ORG_STATUS.includes(b.status) ? b.status : 'trial', typeof b.subUntil === 'number' ? b.subUntil : now + days * 86400000,
    clean(b.plan, 40) || 'pro', b.quotaPerUser === '' || b.quotaPerUser == null ? null : int(b.quotaPerUser, null, 0, 100000),
    int(b.devices, 2, 1, 10), Math.max(0, Number(b.pricePerSeat) || 0), clean(b.contact, 200), clean(b.note, 2000), now,
  );
  const id = Number(info.lastInsertRowid);
  audit(actorId, 'org.create', null, `${id}: ${clean(b.name, 200)}`);
  return getOrg(id);
}

export function updateOrg(org, b, actorId) {
  const changes = [];
  const set = (col, val, label) => { run(`UPDATE orgs SET ${col} = ? WHERE id = ?`, val, org.id); changes.push(label); };
  if (typeof b.name === 'string' && b.name.trim()) set('name', clean(b.name, 200), 'nazwa');
  if (typeof b.nip === 'string') set('nip', b.nip.replace(/[^\d]/g, '').slice(0, 10), 'NIP');
  if (b.seats !== undefined) set('seats', int(b.seats, org.seats, 1, 5000), `miejsca ${b.seats}`);
  if (ORG_STATUS.includes(b.status)) set('status', b.status, `status ${b.status}`);
  if (typeof b.subUntil === 'number') set('sub_until', b.subUntil, `licencja do ${new Date(b.subUntil).toISOString().slice(0, 10)}`);
  if (typeof b.plan === 'string' && b.plan) set('plan', clean(b.plan, 40), `plan ${b.plan}`);
  if ('quotaPerUser' in b) set('quota_per_user', b.quotaPerUser === '' || b.quotaPerUser == null ? null : int(b.quotaPerUser, null, 0, 100000), `limit ${b.quotaPerUser ?? 'z planu'}`);
  if (b.devices !== undefined) set('devices', int(b.devices, org.devices, 1, 10), `urządzenia ${b.devices}`);
  if (b.pricePerSeat !== undefined) set('price_per_seat', Math.max(0, Number(b.pricePerSeat) || 0), `cena ${b.pricePerSeat}`);
  if (typeof b.contact === 'string') set('contact', clean(b.contact, 200), 'kontakt');
  if (typeof b.note === 'string') set('note', clean(b.note, 2000), 'notatka');
  if (typeof b.subUntil === 'number') run('UPDATE orgs SET reminded = 0 WHERE id = ?', org.id);
  audit(actorId, 'org.update', null, `${org.id}: ${changes.join(', ')}`);
  return getOrg(org.id);
}

/**
 * A temporary password that is easy to read out or type: 3 groups of 4 characters (no 0/O, 1/l/I),
 * always with a letter and a digit. The user must replace it at the first login.
 */
export function tempPassword() {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const pool = letters + digits;
  const pick = (set) => set[crypto.randomInt(set.length)];
  let s = '';
  for (let i = 0; i < 12; i++) s += pick(pool);
  s = pick(letters) + s.slice(1, 11) + pick(digits);
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

export const TEMP_PASSWORD_RE = /^[a-z2-9]{4}-[a-z2-9]{4}-[a-z2-9]{4}$/;

/** Parse a pasted list / CSV of users: one per line — e-mail, name, PWZ (separated by ; , or tab). */
export function parseUserList(text) {
  const rows = [];
  for (const line of String(text || '').replace(/\r/g, '').split('\n')) {
    const parts = line.split(/[;,\t]/).map((x) => x.trim().replace(/^"|"$/g, ''));
    const emailIdx = parts.findIndex((x) => /@/.test(x));
    if (emailIdx < 0) continue; // header or empty line
    const email = parts[emailIdx].toLowerCase();
    const rest = parts.filter((_, i) => i !== emailIdx);
    const npwz = rest.find((x) => /^\d{5,8}$/.test(x)) || '';
    const name = rest.filter((x) => x && x !== npwz && !/^(orgadmin|admin|it|user)$/i.test(x)).join(' ').replace(/\s+/g, ' ').trim();
    const role = rest.some((x) => /^(orgadmin|it)$/i.test(x)) ? 'orgadmin' : 'user';
    rows.push({ email, name, npwz, role });
  }
  return rows;
}

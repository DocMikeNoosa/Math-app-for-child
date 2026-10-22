// Accounts and sessions: scrypt password hashes, random session tokens in an HttpOnly cookie
// (only their SHA-256 is stored), login rate limiting, device limit per plan, reset tokens.
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { one, all, run, audit } from './db.js';
import { settings, devicesOf } from './plans.js';

const scrypt = promisify(crypto.scrypt);
const SESSION_DAYS = 30;
export const COOKIE = 'radiopis_sid';

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const randomToken = () => crypto.randomBytes(32).toString('base64url');

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(String(password).normalize('NFKC'), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password, stored) {
  const [alg, salt, hash] = String(stored || '').split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  const key = await scrypt(String(password).normalize('NFKC'), Buffer.from(salt, 'base64'), 64, { N: 16384, r: 8, p: 1 });
  const expected = Buffer.from(hash, 'base64');
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** Password rules: at least 10 characters, a letter and a digit. Returns an error text or ''. */
export function passwordProblem(p) {
  const s = String(p || '');
  if (s.length < 10) return 'Hasło musi mieć co najmniej 10 znaków.';
  if (s.length > 200) return 'Hasło jest za długie.';
  if (!/\p{L}/u.test(s) || !/\d/.test(s)) return 'Hasło musi zawierać literę i cyfrę.';
  return '';
}

export async function createUser({ email, password, name = '', role = 'user', plan = null, npwz = '', company = '', nip = '', phone = '', orgId = null, mustChangePwd = false }, actorId = null) {
  const now = Date.now();
  const trialDays = settings().trialDays;
  // members of an organisation have no personal subscription: the organisation's licence applies
  const p = orgId ? 'org' : plan || 'trial';
  const until = p === 'trial' ? now + trialDays * 86400000 : 0;
  const status = orgId ? 'org' : p === 'trial' ? 'trial' : 'expired';
  const pwd = await hashPassword(password);
  const info = run(
    `INSERT INTO users(email, name, pwd, role, plan, sub_status, sub_until, npwz, company, nip, phone, created_at, org_id, must_change_pwd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    String(email).trim().toLowerCase(), String(name).trim().slice(0, 120), pwd, role, p,
    status, until, String(npwz).trim().slice(0, 20), String(company).trim().slice(0, 200),
    String(nip).replace(/[^\d]/g, '').slice(0, 10), String(phone).trim().slice(0, 30), now, orgId, mustChangePwd ? 1 : 0,
  );
  const id = Number(info.lastInsertRowid);
  audit(actorId ?? id, 'user.create', id, `${email} (${role}, ${orgId ? `org ${orgId}` : p})`);
  return getUser(id);
}

export const getUser = (id) => one('SELECT * FROM users WHERE id = ?', id);
export const getUserByEmail = (email) => one('SELECT * FROM users WHERE email = ?', String(email || '').trim().toLowerCase());

/** Fields safe to send to the browser. */
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id, email: u.email, name: u.name, role: u.role, plan: u.plan, subStatus: u.sub_status, subUntil: u.sub_until,
    npwz: u.npwz, company: u.company, nip: u.nip, phone: u.phone, createdAt: u.created_at, hasStripe: Boolean(u.stripe_customer),
    orgId: u.org_id || null, mustChangePwd: Boolean(u.must_change_pwd),
  };
}

// ---- login rate limiting (in memory): 8 failures per 15 min per e-mail and LOGIN_IP_LIMIT (default 100) per IP.
// The IP limit is generous on purpose: a whole company often reaches the server from one office IP address.
const fails = new Map();
const WINDOW = 15 * 60_000;
const IP_LIMIT = Number(process.env.LOGIN_IP_LIMIT) || 100;
function failCount(key) {
  const now = Date.now();
  const list = (fails.get(key) || []).filter((t) => now - t < WINDOW);
  fails.set(key, list);
  return list.length;
}
export function loginBlocked(email, ip) {
  return failCount(`e:${String(email).toLowerCase()}`) >= 8 || failCount(`i:${ip}`) >= IP_LIMIT;
}
export function noteFailure(email, ip) {
  for (const k of [`e:${String(email).toLowerCase()}`, `i:${ip}`]) fails.set(k, [...(fails.get(k) || []), Date.now()]);
}
export function clearFailures(email) { fails.delete(`e:${String(email).toLowerCase()}`); }
// forget old entries (otherwise the map grows with every e-mail / IP ever seen)
setInterval(() => { for (const k of [...fails.keys()]) failCount(k) || fails.delete(k); }, WINDOW).unref();
export function resetRateLimits() { fails.clear(); }

// ---- sessions
export function createSession(user, { ip = '', ua = '', device = '' } = {}) {
  const token = randomToken();
  const now = Date.now();
  run('INSERT INTO sessions(id, user_id, created_at, last_seen, expires_at, ip, ua) VALUES (?, ?, ?, ?, ?, ?, ?)',
    sha256(token), user.id, now, now, now + SESSION_DAYS * 86400000, String(ip).slice(0, 64), String(ua).slice(0, 300));
  // Device limit: the plan (or organisation) allows N devices at once; the oldest sessions are logged out
  // (prevents account sharing).
  const max = devicesOf(user);
  const extra = all('SELECT id, last_seen FROM sessions WHERE user_id = ? ORDER BY last_seen DESC LIMIT -1 OFFSET ?', user.id, max);
  for (const s of extra) run('DELETE FROM sessions WHERE id = ?', s.id);
  run('UPDATE users SET last_login = ? WHERE id = ?', now, user.id);
  const kicked = extra.filter((s) => now - s.last_seen < 15 * 60000).length; // pushed out a device that was in use
  run('INSERT INTO logins(user_id, ts, ip, device, ua, kicked) VALUES (?, ?, ?, ?, ?, ?)', user.id, now, String(ip).slice(0, 64), String(device).slice(0, 64), String(ua).slice(0, 300), kicked);
  run('DELETE FROM logins WHERE user_id = ? AND ts < ?', user.id, now - 90 * 86400000);
  return token;
}

/** The user of a request's session cookie (and refreshes last_seen at most once a minute). */
export function sessionUser(token) {
  if (!token) return null;
  const s = one('SELECT * FROM sessions WHERE id = ?', sha256(token));
  if (!s) return null;
  const now = Date.now();
  if (now > s.expires_at || now - s.last_seen > settings().sessionIdleDays * 86400000) {
    run('DELETE FROM sessions WHERE id = ?', s.id);
    return null;
  }
  if (now - s.last_seen > 60_000) run('UPDATE sessions SET last_seen = ? WHERE id = ?', now, s.id);
  const user = getUser(s.user_id);
  return user ? { user, sessionId: s.id } : null;
}

export function deleteSession(token) {
  if (token) run('DELETE FROM sessions WHERE id = ?', sha256(token));
}
export function deleteUserSessions(userId, exceptSessionId = null) {
  if (exceptSessionId) run('DELETE FROM sessions WHERE user_id = ? AND id <> ?', userId, exceptSessionId);
  else run('DELETE FROM sessions WHERE user_id = ?', userId);
}
export const userSessions = (userId) => all('SELECT id, created_at, last_seen, ip, ua FROM sessions WHERE user_id = ? ORDER BY last_seen DESC', userId);

// ---- one-time tokens (password reset, invitation)
export function createOneTimeToken(userId, purpose, hours = 2) {
  const token = randomToken();
  run('DELETE FROM tokens WHERE user_id = ? AND purpose = ?', userId, purpose);
  run('INSERT INTO tokens(id, user_id, purpose, expires_at) VALUES (?, ?, ?, ?)', sha256(token), userId, purpose, Date.now() + hours * 3600_000);
  return token;
}
export function useOneTimeToken(token, purpose) {
  const row = one('SELECT * FROM tokens WHERE id = ? AND purpose = ?', sha256(String(token || '')), purpose);
  if (!row) return null;
  run('DELETE FROM tokens WHERE id = ?', row.id);
  return Date.now() > row.expires_at ? null : getUser(row.user_id);
}
export function peekOneTimeToken(token, purpose) {
  const row = one('SELECT * FROM tokens WHERE id = ? AND purpose = ?', sha256(String(token || '')), purpose);
  return row && Date.now() <= row.expires_at ? getUser(row.user_id) : null;
}

/** The user's own password (clears a "must change" flag). */
export async function setPassword(userId, password) {
  run('UPDATE users SET pwd = ?, must_change_pwd = 0 WHERE id = ?', await hashPassword(password), userId);
}
/** A temporary password set by an administrator: the user must choose an own one at the next login. */
export async function setTempPassword(userId, password) {
  run('UPDATE users SET pwd = ?, must_change_pwd = 1 WHERE id = ?', await hashPassword(password), userId);
}

// ---- cookies
export function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
export function sessionCookie(token, { secure = false, clear = false } = {}) {
  const attrs = [`${COOKIE}=${clear ? '' : encodeURIComponent(token)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${clear ? 0 : SESSION_DAYS * 86400}`];
  if (secure) attrs.push('Secure');
  return attrs.join('; ');
}

/** Locked out right now by the per-e-mail limit (for the IT "problems" view). */
export const isLockedOut = (email) => failCount(`e:${String(email).toLowerCase()}`) >= 8;

// ---- second step of a login with two-factor authentication: a short-lived ticket after a correct password
const pending2fa = new Map(); // ticket → { userId, exp, tries }
export function create2faTicket(userId) {
  const ticket = randomToken();
  pending2fa.set(ticket, { userId, exp: Date.now() + 5 * 60_000, tries: 0 });
  for (const [k, v] of pending2fa) if (v.exp < Date.now()) pending2fa.delete(k);
  return ticket;
}
/** Returns the user id when the ticket is valid; at most 5 code attempts per ticket. */
export function use2faTicket(ticket, ok) {
  const t = pending2fa.get(String(ticket || ''));
  if (!t || t.exp < Date.now() || t.tries >= 5) { pending2fa.delete(ticket); return { error: 'expired' }; }
  t.tries++;
  if (!ok(t.userId)) return { error: 'code', left: 5 - t.tries };
  pending2fa.delete(ticket);
  return { userId: t.userId };
}

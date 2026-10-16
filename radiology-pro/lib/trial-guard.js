// Free trials for anyone (e.g. from an advert) without letting one person collect trial after trial.
// No single check is proof of identity; together they make a repeat trial more trouble than paying, and anything
// suspicious goes to the owner's approval queue instead of being refused outright (a hospital shares one IP).
import { all } from './db.js';

// Throwaway mailbox services (a free trial needs an address the person keeps).
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com', 'grr.la',
  '10minutemail.com', '10minutemail.net', 'temp-mail.org', 'tempmail.com', 'tempmail.net', 'temp-mail.io',
  'yopmail.com', 'yopmail.net', 'yopmail.fr', 'trashmail.com', 'trashmail.de', 'getnada.com', 'nada.email',
  'dispostable.com', 'maildrop.cc', 'mohmal.com', 'throwawaymail.com', 'fakeinbox.com', 'emailondeck.com',
  'mintemail.com', 'mailnesia.com', 'tempr.email', 'spamgourmet.com', 'mailcatch.com', 'moakt.com', 'tempail.com',
  'mytemp.email', 'tmpmail.org', 'tmpmail.net', 'burnermail.io', 'discard.email', 'mailpoof.com', 'inboxkitten.com',
  'emailfake.com', 'fakemail.net', 'spambox.us', 'mail.tm', 'mailbox.in.ua', 'dropmail.me', 'cs.email',
  '33mail.com', 'anonaddy.me', 'tempinbox.com', 'minuteinbox.com', 'luxusmail.org', 'tempmailo.com', 'byom.de',
]);

export function isDisposableEmail(email) {
  const domain = String(email || '').toLowerCase().split('@')[1] || '';
  // also catches subdomains such as xyz.mailinator.com
  return [...DISPOSABLE].some((d) => domain === d || domain.endsWith(`.${d}`));
}

const DAY = 86400000;

/**
 * Reasons this new self-registered account looks like a repeat trial. Empty = start the trial automatically.
 * Only other self-registered accounts count (members of an organisation never had a personal trial).
 */
export function trialFlags(user, { trialsPerIp = 2, now = Date.now() } = {}) {
  const others = all('SELECT id, email, signup_ip, signup_device, npwz, phone, created_at FROM users WHERE id <> ? AND org_id IS NULL AND role = ?', user.id, 'user');
  const flags = [];
  const sameDevice = user.signup_device ? others.filter((o) => o.signup_device && o.signup_device === user.signup_device) : [];
  if (sameDevice.length) flags.push(`to samo urządzenie co ${sameDevice.map((o) => o.email).slice(0, 3).join(', ')}`);
  const digits = (s) => String(s || '').replace(/\D/g, '');
  if (digits(user.phone).length >= 9) {
    const samePhone = others.filter((o) => digits(o.phone).slice(-9) === digits(user.phone).slice(-9));
    if (samePhone.length) flags.push(`ten sam telefon co ${samePhone.map((o) => o.email).slice(0, 3).join(', ')}`);
  }
  if (user.npwz) {
    const sameNpwz = others.filter((o) => o.npwz && o.npwz === user.npwz);
    if (sameNpwz.length) flags.push(`ten sam numer PWZ co ${sameNpwz.map((o) => o.email).slice(0, 3).join(', ')}`);
  }
  if (user.signup_ip) {
    const sameIp = others.filter((o) => o.signup_ip === user.signup_ip && now - o.created_at < 30 * DAY);
    if (sameIp.length >= trialsPerIp) flags.push(`${sameIp.length + 1}. rejestracja z tego samego adresu internetowego w 30 dni`);
  }
  return flags;
}

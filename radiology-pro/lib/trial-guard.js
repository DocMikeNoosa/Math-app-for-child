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
 * Why this new self-registered account should wait for the owner instead of starting its trial automatically.
 * Empty = start now. Designed for shared hospital computers and one hospital internet address: a few colleagues on one
 * computer / address start normally; only beyond the limits, or on a hard signal (same phone), does a sign-up wait.
 * The two cost guards (new trials per day, monthly AI budget for trials) protect the owner's bill from a flood.
 */
export function trialFlags(user, opts = {}) {
  const { trialsPerDevice = 3, trialsPerIp = 5, trialsPerDay = 15, trialBudgetPln = 300, usdPln = 3.65, now = Date.now() } = opts;
  const others = all("SELECT id, email, signup_ip, signup_device, phone, created_at, sub_status FROM users WHERE id <> ? AND org_id IS NULL AND role = 'user' AND signup_device <> ''", user.id);
  const flags = [];
  const sameDevice = user.signup_device ? others.filter((o) => o.signup_device === user.signup_device && now - o.created_at < 90 * DAY) : [];
  if (sameDevice.length >= trialsPerDevice) flags.push(`${sameDevice.length + 1}. konto z tego samego komputera w 90 dni (${sameDevice.map((o) => o.email).slice(0, 3).join(', ')})`);
  const digits = (v) => String(v || '').replace(/\D/g, '');
  if (digits(user.phone).length >= 9) {
    const samePhone = others.filter((o) => digits(o.phone).slice(-9) === digits(user.phone).slice(-9));
    if (samePhone.length) flags.push(`ten sam telefon co ${samePhone.map((o) => o.email).slice(0, 3).join(', ')}`);
  }
  if (user.signup_ip) {
    const sameIp = others.filter((o) => o.signup_ip === user.signup_ip && now - o.created_at < 30 * DAY);
    if (sameIp.length >= trialsPerIp) flags.push(`${sameIp.length + 1}. konto z tego samego adresu internetowego w 30 dni`);
  }
  const startedToday = all("SELECT COUNT(*) AS n FROM audit WHERE action = 'trial.start' AND ts > ?", now - DAY)[0].n;
  if (startedToday >= trialsPerDay) flags.push(`limit nowych okresów próbnych na dobę (${trialsPerDay}) — chroni koszty`);
  const month = new Date(now).toISOString().slice(0, 7);
  const costUsd = all("SELECT COALESCE(SUM(g.cost_usd), 0) AS c FROM usage g JOIN users u ON u.id = g.user_id WHERE g.month = ? AND u.plan = 'trial' AND u.org_id IS NULL", month)[0].c;
  if (trialBudgetPln && costUsd * usdPln >= trialBudgetPln) flags.push(`miesięczny budżet AI okresów próbnych wyczerpany (${Math.round(costUsd * usdPln)} z ${trialBudgetPln} zł)`);
  return flags;
}

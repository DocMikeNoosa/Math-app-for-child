// Subscription plans, AI cost calculation and access rules.
import { getSetting, one, monthOf } from './db.js';

// USD per million tokens (Anthropic list prices). Cache writes: 5-minute cache = 1.25 × input.
// Fast output mode ("turbo") costs 2 × on Opus.
export const MODEL_PRICES = {
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
};

/** Cost in USD of one API response's usage. */
export function costUsd(model, usage = {}) {
  const key = Object.keys(MODEL_PRICES).find((k) => String(model || '').startsWith(k)) || 'claude-opus-5-5';
  const p = MODEL_PRICES[key];
  const fast = usage.speed === 'fast' ? 2 : 1;
  const m = 1e6;
  return fast * (
    ((usage.input_tokens || 0) * p.input) / m +
    ((usage.output_tokens || 0) * p.output) / m +
    ((usage.cache_creation_input_tokens || 0) * p.cacheWrite) / m +
    ((usage.cache_read_input_tokens || 0) * p.cacheRead) / m
  );
}

// Defaults — the administrator edits them in the admin panel (stored in settings.plans).
// Prices are monthly, net (PLN, before VAT). quota = reports per month; devices = logged-in devices at once.
export const DEFAULT_PLANS = [
  { id: 'trial', name: 'Okres próbny', pricePln: 0, quota: 60, devices: 1, days: 14, public: false },
  { id: 'start', name: 'Start', pricePln: 249, quota: 300, devices: 2, public: true, stripePrice: '' },
  { id: 'pro', name: 'Pro', pricePln: 399, quota: 800, devices: 2, public: true, stripePrice: '', featured: true },
  { id: 'max', name: 'Dyżur+', pricePln: 649, quota: 1600, devices: 3, public: true, stripePrice: '' },
];

export const DEFAULT_SETTINGS = {
  usdPln: 3.65,              // exchange rate used for cost reports
  trialDays: 14,
  registrationOpen: true,
  requireNpwz: true,         // self-registration needs a valid licence number (NPWZ); one free trial per number
  graceRatio: 0.1,           // reports allowed above the quota before blocking (10 %)
  costAlertRatio: 0.5,       // e-mail the admin when a user's AI cost exceeds 50 % of the plan price
  graceDaysPastDue: 3,       // access kept after a failed payment
  annualMonths: 10,          // yearly plan = price × 10 (2 months free)
  maxBackgroundCalls: 4,     // background pre-processing calls per report (cost guard); "Przygotuj opis" is never limited
  // RODO / terms: users must accept this version of the terms + privacy notice before working ('' = not required).
  // Raise it whenever the documents change: everybody accepts again at the next visit (proof kept per user).
  termsVersion: process.env.TERMS_VERSION ?? '1.0',
  sessionIdleDays: 7,        // log out a device unused for this many days (RODO art. 32: unattended sessions)
  auditRetentionDays: 730,   // security / change log kept for 2 years, then deleted
  outboxRetentionDays: 90,   // copies of sent e-mails
  itShowUsage: false,        // organisations' IT sees report counts per person (off: IT sees only accounts and problems)
  globalLearning: true,      // use the published global (central) knowledge in AI requests
};

export function plans() {
  const saved = getSetting('plans', null);
  return Array.isArray(saved) && saved.length ? saved : DEFAULT_PLANS;
}
export function settings() {
  return { ...DEFAULT_SETTINGS, ...(getSetting('appSettings', {}) || {}) };
}
export const planById = (id) => plans().find((p) => p.id === id) || plans().find((p) => p.id === 'trial') || DEFAULT_PLANS[0];

/** Reports (distinct report ids with a successful AI call) and cost of a user in a month. */
export function monthUsage(userId, month = monthOf()) {
  const r = one(
    `SELECT COUNT(DISTINCT CASE WHEN kind = 'format' AND ok = 1 AND report_id <> '' THEN report_id END) AS reports,
            COUNT(*) AS calls, COALESCE(SUM(cost_usd), 0) AS cost
       FROM usage WHERE user_id = ? AND month = ?`,
    userId, month,
  );
  return { reports: r?.reports || 0, calls: r?.calls || 0, costUsd: r?.cost || 0 };
}

const orgOf = (user) => (user?.org_id ? one('SELECT * FROM orgs WHERE id = ?', user.org_id) : null);

/** Monthly report limit: the user's own override, else the organisation's limit, else the plan's. */
export function quotaOf(user) {
  if (user.quota_override != null) return user.quota_override;
  const org = orgOf(user);
  if (org) return org.quota_per_user ?? planById(org.plan).quota;
  return planById(user.plan).quota;
}

/** Devices logged in at the same time. */
export function devicesOf(user) {
  if (user.role === 'admin') return 10;
  const org = orgOf(user);
  return Math.max(1, org ? org.devices : planById(user.plan).devices || 2);
}

/**
 * Can this user use the app now? Returns { ok, reason, code } — code is used by the browser:
 * 'expired' → go to the account page to pay, 'blocked' → contact, 'quota' → limit reached.
 */
export function access(user, now = Date.now()) {
  if (!user) return { ok: false, code: 'login', reason: 'Zaloguj się.' };
  if (user.role === 'admin') return { ok: true };
  if (user.blocked) return { ok: false, code: 'blocked', reason: 'Konto zablokowane — skontaktuj się z administratorem.' };
  if (user.must_change_pwd) return { ok: false, code: 'pwd', reason: 'Ustaw własne hasło, aby rozpocząć pracę.' };
  const tv = settings().termsVersion;
  if (tv && user.terms_version !== tv) return { ok: false, code: 'terms', reason: 'Zaakceptuj regulamin i informację o przetwarzaniu danych, aby rozpocząć pracę.' };
  const org = orgOf(user);
  if (org) {
    // members of an organisation: the organisation's licence decides (no personal subscription, no payments)
    const contact = org.contact ? ` (${org.contact})` : '';
    if (org.status === 'suspended') return { ok: false, code: 'org', reason: `Dostęp organizacji ${org.name} jest wstrzymany — skontaktuj się z działem IT${contact}.` };
    if (!org.sub_until || now > org.sub_until) {
      return { ok: false, code: 'org', reason: org.status === 'trial' ? `Okres próbny organizacji ${org.name} zakończył się — skontaktuj się z działem IT${contact}.` : `Licencja organizacji ${org.name} wygasła — skontaktuj się z działem IT${contact}.` };
    }
    return { ok: true, org: org.name };
  }
  const grace = user.sub_status === 'past_due' ? settings().graceDaysPastDue * 86400000 : 0;
  if (!user.sub_until || now > user.sub_until + grace) {
    return { ok: false, code: 'expired', reason: user.sub_status === 'trial' ? 'Okres próbny zakończył się — wybierz plan.' : 'Subskrypcja wygasła — odnów ją, aby dalej pracować.' };
  }
  return { ok: true };
}

/** Is there room for one more report this month? (A call for a report already counted is always allowed.) */
export function quotaCheck(user, reportId) {
  if (user.role === 'admin') return { ok: true };
  const quota = quotaOf(user);
  const used = monthUsage(user.id);
  if (reportId && one('SELECT 1 AS x FROM usage WHERE user_id = ? AND month = ? AND report_id = ? AND ok = 1 LIMIT 1', user.id, monthOf(), reportId)) {
    return { ok: true, used: used.reports, quota };
  }
  const hard = Math.ceil(quota * (1 + settings().graceRatio));
  if (used.reports >= hard) return { ok: false, code: 'quota', used: used.reports, quota, reason: `Wykorzystano limit ${quota} opisów w tym miesiącu. Zmień plan na wyższy albo skontaktuj się z nami.` };
  return { ok: true, used: used.reports, quota, warn: used.reports >= quota };
}

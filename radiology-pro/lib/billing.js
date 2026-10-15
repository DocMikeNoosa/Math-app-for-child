// Subscriptions: manual payments (bank transfer / invoice, recorded by the administrator) and
// Stripe Checkout + Customer Portal (cards, and the Polish methods Stripe offers) with signed webhooks.
// Stripe is optional: without STRIPE_SECRET_KEY the account page shows bank-transfer details instead.
import crypto from 'node:crypto';
import { one, run, audit, tx } from './db.js';
import { plans, planById, settings } from './plans.js';
import { getUser } from './auth.js';
import { sendMail, adminEmail } from './mail.js';
import { BRAND } from './brand.js';

const DAY = 86400000;

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

/** Add one month (or one year) to a date, keeping the day of month where possible. */
export function addPeriod(from, interval = 'month', count = 1) {
  const d = new Date(from);
  if (interval === 'year') d.setUTCFullYear(d.getUTCFullYear() + count);
  else d.setUTCMonth(d.getUTCMonth() + count);
  return d.getTime();
}

/**
 * Record a payment and extend the subscription (manual / transfer). The new period starts at the
 * later of now and the current end, so paying early never loses days.
 */
export function extendSubscription(userId, { plan, interval = 'month', count = 1, until = null, amountPln = null, provider = 'manual', ref = '', note = '' }, actorId = null) {
  return tx(() => {
    const u = getUser(userId);
    if (!u) throw new Error('no user');
    const p = planById(plan || u.plan);
    const start = Math.max(Date.now(), u.sub_until || 0);
    const end = until || addPeriod(start, interval, count);
    const amount = amountPln ?? (interval === 'year' ? p.pricePln * settings().annualMonths * count : p.pricePln * count);
    run("UPDATE users SET plan = ?, sub_status = 'active', sub_until = ?, reminded = 0 WHERE id = ?", p.id, end, u.id);
    if (amount > 0 || provider !== 'manual') {
      run('INSERT INTO payments(user_id, ts, amount_pln, provider, ref, plan, period_until, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        u.id, Date.now(), Number(amount) || 0, provider, String(ref).slice(0, 120), p.id, end, String(note).slice(0, 500));
    }
    audit(actorId, 'subscription.extend', u.id, `${p.id} → ${new Date(end).toISOString().slice(0, 10)} (${provider}${amount ? `, ${amount} PLN` : ''})`);
    return getUser(u.id);
  });
}

// ---------------------------------------------------------------- Stripe (REST, form-encoded)
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function stripe(method, pathName, params = null) {
  const res = await fetch(`${process.env.STRIPE_API_BASE || 'https://api.stripe.com'}/v1${pathName}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params ? form(params).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data;
}

/** Stripe price id of a plan for a billing interval (set in the admin panel). */
export function stripePriceOf(plan, interval) {
  return interval === 'year' ? plan.stripePriceYear || '' : plan.stripePrice || '';
}

export async function createCheckout(user, planId, interval, baseUrl) {
  const p = plans().find((x) => x.id === planId && x.public);
  if (!p) throw new Error('Nieznany plan.');
  const price = stripePriceOf(p, interval);
  if (!price) throw new Error('Płatność online dla tego planu nie jest jeszcze skonfigurowana.');
  const session = await stripe('POST', '/checkout/sessions', {
    mode: 'subscription',
    line_items: { 0: { price, quantity: 1 } },
    ...(user.stripe_customer ? { customer: user.stripe_customer } : { customer_email: user.email }),
    client_reference_id: String(user.id),
    metadata: { user_id: String(user.id), plan: p.id },
    subscription_data: { metadata: { user_id: String(user.id), plan: p.id } },
    allow_promotion_codes: 'true',
    billing_address_collection: 'required',
    tax_id_collection: { enabled: 'true' },
    locale: 'pl',
    success_url: `${baseUrl}/account?paid=1`,
    cancel_url: `${baseUrl}/account?canceled=1`,
  });
  return session.url;
}

/** Gross amount (PLN) of a plan period: net price (+ yearly discount) + VAT. */
export function periodPrice(p, interval) {
  const net = interval === 'year' ? p.pricePln * settings().annualMonths : p.pricePln;
  const vat = settings().vatRate ?? 0.23;
  return { net, gross: Math.round(net * (1 + vat) * 100) / 100 };
}

/**
 * One-off payment for 1 month or 12 months in advance — BLIK, Przelewy24 or card (whatever is enabled in the
 * Stripe dashboard). Nothing renews automatically; the account is extended when Stripe confirms the payment.
 * No Stripe product/price setup needed (the amount comes from the plan in the admin panel).
 */
export async function createPrepaidCheckout(user, planId, interval, baseUrl) {
  const p = plans().find((x) => x.id === planId && x.public);
  if (!p) throw new Error('Nieznany plan.');
  if (!p.pricePln) throw new Error('Ten plan nie ma ceny.');
  if (user.stripe_sub && user.sub_status === 'active') throw new Error('Masz aktywną subskrypcję kartą — zmienisz ją przyciskiem „Zarządzaj płatnością kartą”.');
  const { net, gross } = periodPrice(p, interval);
  const meta = { user_id: String(user.id), plan: p.id, interval, kind: 'prepaid', net: String(net) };
  const session = await stripe('POST', '/checkout/sessions', {
    mode: 'payment',
    line_items: { 0: { quantity: 1, price_data: { currency: 'pln', unit_amount: Math.round(gross * 100), product_data: { name: `${BRAND.name} ${p.name} — ${interval === 'year' ? '12 miesięcy' : '1 miesiąc'} (z góry)`, description: `${p.quota} opisów / mies., ${p.devices} urządz. Kwota zawiera 23% VAT.` } } } },
    ...(user.stripe_customer ? { customer: user.stripe_customer } : { customer_email: user.email, customer_creation: 'always' }),
    client_reference_id: String(user.id),
    metadata: meta,
    payment_intent_data: { metadata: meta },
    invoice_creation: { enabled: 'true', invoice_data: { metadata: meta } },
    allow_promotion_codes: 'true',
    billing_address_collection: 'required',
    tax_id_collection: { enabled: 'true' },
    locale: 'pl',
    success_url: `${baseUrl}/account?paid=1`,
    cancel_url: `${baseUrl}/account?canceled=1`,
  });
  return session.url;
}

/** A confirmed one-off payment → extend the account (idempotent by the Checkout session id). */
function applyPrepaid(o) {
  const u = userForStripe(o);
  if (!u || o.metadata?.kind !== 'prepaid' || o.payment_status !== 'paid') return false;
  if (one('SELECT id FROM payments WHERE ref = ?', o.id)) return false;
  if (o.customer) run('UPDATE users SET stripe_customer = ? WHERE id = ?', o.customer, u.id);
  extendSubscription(u.id, { plan: o.metadata.plan, interval: o.metadata.interval === 'year' ? 'year' : 'month', count: 1, amountPln: Number(o.metadata.net) || (o.amount_total || 0) / 123, provider: 'stripe', ref: o.id, note: `jednorazowo, brutto ${((o.amount_total || 0) / 100).toFixed(2)} PLN` });
  return true;
}

export async function createPortal(user, baseUrl) {
  if (!user.stripe_customer) throw new Error('Brak subskrypcji online.');
  const s = await stripe('POST', '/billing_portal/sessions', { customer: user.stripe_customer, return_url: `${baseUrl}/account`, locale: 'pl' });
  return s.url;
}

/** Verify a Stripe-Signature header (HMAC-SHA256 of "t.payload", 5-minute tolerance). */
export function verifyStripeSignature(raw, header, secret = process.env.STRIPE_WEBHOOK_SECRET, now = Date.now()) {
  if (!secret || !header) return false;
  let t = null;
  const sigs = [];
  for (const kv of String(header).split(',')) {
    const [k, v] = kv.split('=');
    if (k === 't') t = Number(v);
    else if (k === 'v1' && v) sigs.push(v);
  }
  if (!t || !sigs.length || Math.abs(now / 1000 - t) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

const STATUS = { active: 'active', trialing: 'active', past_due: 'past_due', unpaid: 'past_due', incomplete: 'past_due', canceled: 'canceled', incomplete_expired: 'canceled', paused: 'canceled' };

function planFromPrice(priceId) {
  return plans().find((p) => p.stripePrice === priceId || p.stripePriceYear === priceId) || null;
}

function userForStripe(obj) {
  const meta = Number(obj?.metadata?.user_id || obj?.client_reference_id || 0);
  return (meta && getUser(meta))
    || (obj?.subscription && one('SELECT * FROM users WHERE stripe_sub = ?', obj.subscription))
    || (obj?.id && one('SELECT * FROM users WHERE stripe_sub = ?', obj.id))
    || (obj?.customer && one('SELECT * FROM users WHERE stripe_customer = ?', obj.customer));
}

function applySubscription(sub) {
  const u = userForStripe(sub);
  if (!u) return;
  const item = sub.items?.data?.[0];
  // current_period_end lives on the subscription (older API versions) or on its items (newer ones)
  const end = (sub.current_period_end || item?.current_period_end || 0) * 1000;
  const plan = planFromPrice(item?.price?.id);
  const status = STATUS[sub.status] || 'past_due';
  run('UPDATE users SET stripe_customer = COALESCE(?, stripe_customer), stripe_sub = ?, sub_status = ?, sub_until = MAX(sub_until, ?), plan = COALESCE(?, plan), reminded = 0 WHERE id = ?',
    sub.customer || null, sub.id, status, end || 0, plan?.id || null, u.id);
  audit(null, 'stripe.subscription', u.id, `${sub.status} → ${end ? new Date(end).toISOString().slice(0, 10) : '?'}${plan ? ` (${plan.id})` : ''}`);
}

/** Handle a verified Stripe event. Idempotent (each event id is processed once). */
export async function handleStripeEvent(event) {
  if (!event?.id || one('SELECT id FROM webhook_events WHERE id = ?', event.id)) return 'duplicate';
  run('INSERT INTO webhook_events(id, ts) VALUES (?, ?)', event.id, Date.now());
  const o = event.data?.object || {};
  switch (event.type) {
    case 'checkout.session.async_payment_succeeded':
      applyPrepaid(o);
      break;
    case 'checkout.session.completed': {
      if (o.mode === 'payment') { applyPrepaid(o); break; } // BLIK / Przelewy24 / card, paid in advance
      const u = userForStripe(o);
      if (!u) break;
      run('UPDATE users SET stripe_customer = ?, stripe_sub = ? WHERE id = ?', o.customer || u.stripe_customer, o.subscription || u.stripe_sub, u.id);
      if (o.subscription && stripeEnabled()) {
        try { applySubscription(await stripe('GET', `/subscriptions/${o.subscription}`)); } catch (err) { console.error('stripe subscription fetch', err.message); }
      }
      audit(null, 'stripe.checkout', u.id, o.id || '');
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      applySubscription(o);
      break;
    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
      const u = userForStripe(o);
      if (!u || !o.id || one('SELECT id FROM payments WHERE ref = ?', o.id)) break;
      const line = o.lines?.data?.[0];
      const until = (line?.period?.end || 0) * 1000 || null;
      run('INSERT INTO payments(user_id, ts, amount_pln, provider, ref, plan, period_until, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        u.id, Date.now(), (o.amount_paid || 0) / 100, 'stripe', o.id, u.plan, until, String(o.currency || '').toUpperCase());
      break;
    }
    case 'invoice.payment_failed': {
      const u = userForStripe(o);
      if (!u) break;
      run("UPDATE users SET sub_status = 'past_due' WHERE id = ?", u.id);
      audit(null, 'stripe.payment_failed', u.id, o.id || '');
      await sendMail(u.email, `${BRAND.name}: płatność nie powiodła się`, `Dzień dobry,\n\nnie udało się pobrać opłaty za subskrypcję ${BRAND.name}. Dostęp pozostaje aktywny jeszcze przez ${settings().graceDaysPastDue} dni. Zaktualizuj metodę płatności na stronie konta.`);
      if (adminEmail()) await sendMail(adminEmail(), `${BRAND.name}: nieudana płatność — ${u.email}`, `Nieudana płatność użytkownika ${u.email} (faktura ${o.id || '?'}).`);
      break;
    }
    default:
      return 'ignored';
  }
  return 'ok';
}

export const DAY_MS = DAY;

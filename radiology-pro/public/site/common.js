// Shared helpers for the site, account and administrator pages.
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: { 'X-Radiopis': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  if (!res.ok) {
    const err = new Error(data.error || `Błąd ${res.status}`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function toast(text, kind = 'info', ms = 3200) {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.setAttribute('role', 'status');
  t.textContent = text;
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

export function showMsg(el, text, kind = 'err') {
  el.className = `msg ${kind}`;
  el.textContent = text;
  el.hidden = !text;
}

const TZ = 'Europe/Warsaw';
export const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString('pl-PL', { timeZone: TZ }) : '—');
export const fmtDateTime = (ms) => (ms ? new Date(ms).toLocaleString('pl-PL', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' }) : '—');
export const fmtPln = (v, digits = 0) => `${(Number(Number(v || 0).toFixed(digits)) || 0).toLocaleString('pl-PL', { minimumFractionDigits: digits, maximumFractionDigits: digits })} zł`;
export const fmtUsd = (v) => `$${Number(v || 0).toFixed(Number(v) < 10 ? 3 : 2)}`;
export const fmtNum = (v) => Number(v || 0).toLocaleString('pl-PL');
export const daysLeft = (ms) => Math.ceil((ms - Date.now()) / 86400000);

export const STATUS_LABEL = { friend: 'przyjaciel', verify: 'e-mail niepotwierdzony', pending: 'czeka na zatwierdzenie', trial: 'okres próbny', active: 'aktywna', past_due: 'zaległa płatność', canceled: 'anulowana', expired: 'wygasła' };
export function statusPill(u) {
  if (u.blocked) return '<span class="pill err">zablokowany</span>';
  const st = u.subStatus;
  if (st === 'friend') return '<span class="pill gold">przyjaciel</span>';
  if (st === 'pending') return '<span class="pill warn">czeka na zatwierdzenie</span>';
  if (st === 'verify') return '<span class="pill warn">e-mail niepotwierdzony</span>';
  if (st === 'org') return u.subUntil > Date.now() ? '<span class="pill info">organizacja</span>' : '<span class="pill err">licencja org. wygasła</span>';
  const live = u.subUntil > Date.now();
  const kind = !live || st === 'expired' ? 'err' : st === 'past_due' ? 'warn' : st === 'trial' ? 'info' : st === 'canceled' ? 'warn' : 'ok';
  return `<span class="pill ${kind}">${esc(!live && st !== 'past_due' ? 'wygasła' : STATUS_LABEL[st] || st)}</span>`;
}

export const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

/** Fill [data-brand] elements with the product name. */
export async function brand() {
  try {
    const d = await api('/api/plans');
    for (const el of $$('[data-brand]')) el.textContent = d.brand.name;
    return d;
  } catch { return null; }
}

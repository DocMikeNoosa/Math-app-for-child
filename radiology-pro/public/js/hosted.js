// Hosted (subscription) version: runs before the app.
// - adds the app header to API calls (CSRF protection) and handles an expired session / subscription / quota
// - keeps the user's own templates, style profile and everything learned from corrections in sync between computers
// - a different user on the same browser never sees the previous user's local data
const SYNC_KEYS = ['radvox.templates.v1', 'radvox.profile.v1', 'radvox.style.v1', 'radvox.learned.v1'];
const LOCAL_KEYS = ['radvox.v2', 'radvox.templates.v1', 'radvox.style.v1', 'radvox.learned.v1', 'radvox.profile.v1', 'radvox.today.v1', 'radvox.mic.v1', 'radvox.cpOpen'];
const PRIVATE_KEYS = ['radvox.v2', 'radvox.today.v1']; // the current report and today's reports
const META_KEY = 'radiopis.sync';
const OWNER_KEY = 'radiopis.owner';

const nativeFetch = window.fetch.bind(window);
const origSet = Storage.prototype.setItem;
const origRemove = Storage.prototype.removeItem;
const isApi = (u) => typeof u === 'string' && u.startsWith('/api/');

let bannerShown = '';
export function showBanner(text, { error = false, link = true, onClose = null } = {}) {
  if (bannerShown === text) return;
  bannerShown = text;
  const show = () => {
    document.querySelector('.hosted-banner')?.remove();
    const b = document.createElement('div');
    b.className = `hosted-banner${error ? ' err' : ''}`;
    b.setAttribute('role', 'alert');
    const span = document.createElement('span');
    span.className = 'grow';
    span.textContent = text;
    b.append(span);
    if (link) {
      const a = document.createElement('a');
      a.href = '/account';
      a.textContent = 'Konto i plan →';
      b.append(a);
    }
    const x = document.createElement('button');
    x.textContent = '×';
    x.setAttribute('aria-label', 'Zamknij');
    x.addEventListener('click', () => { b.remove(); bannerShown = ''; onClose?.(); });
    b.append(x);
    document.body.append(b);
  };
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
}

// ---------------------------------------------------------------- friends: top up the API account
// Shown when the friend's API credit has run out: what happened, a button to the payment page, and a re-check.
let creditOpen = false;
export function showCreditDialog(billingUrl = 'https://platform.claude.com/settings/billing') {
  if (creditOpen) return;
  creditOpen = true;
  const show = () => {
    const wrap = document.createElement('div');
    wrap.className = 'credit-dialog';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = `<div class="credit-box">
      <div class="credit-icon">!</div>
      <h2>Doładuj konto API</h2>
      <p>Skończyły się środki na Twoim koncie API, dlatego AI nie może teraz przygotować opisu. Doładowanie trwa minutę — jak telefon na kartę.</p>
      <ol>
        <li>Kliknij <b>„Doładuj teraz”</b> — strona płatności otworzy się w nowej karcie.</li>
        <li>Kliknij <b>Buy credits</b>, wybierz kwotę (proponujemy <b>20 USD</b>) i zapłać kartą.</li>
        <li>Wróć tutaj i kliknij <b>„Wpłaciłem — sprawdź”</b>.</li>
      </ol>
      <details><summary>Co to jest konto API?</summary><p>To Twoje osobiste konto z przedpłaconymi środkami na korzystanie z AI. Za każdym razem, gdy aplikacja użyje AI (np. przygotuje opis), pobierana jest niewielka opłata — to naprawdę niewiele. Nie wydasz więcej, niż wpłacisz. Jeśli nie chcesz pamiętać o doładowaniu, na tej samej stronie możesz włączyć automatyczne doładowanie (<i>auto-reload</i>).</p></details>
      <div class="credit-msg" hidden></div>
      <div class="credit-actions">
        <a class="credit-primary" target="_blank" rel="noopener"></a>
        <button type="button" class="credit-check">Wpłaciłem — sprawdź</button>
        <button type="button" class="credit-close">Zamknij</button>
      </div>
    </div>`;
    const a = wrap.querySelector('.credit-primary');
    a.href = billingUrl;
    a.textContent = 'Doładuj teraz ↗';
    const msg = wrap.querySelector('.credit-msg');
    const close = () => { wrap.remove(); creditOpen = false; };
    wrap.querySelector('.credit-close').addEventListener('click', close);
    wrap.querySelector('.credit-check').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      b.disabled = true; b.textContent = 'Sprawdzam…';
      try {
        const r = await nativeFetch('/api/me/api-key-check', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1' }, body: '{}' });
        const d = await r.json().catch(() => ({}));
        if (r.ok) {
          msg.hidden = false; msg.className = 'credit-msg ok';
          msg.textContent = d.unchecked ? 'Nie udało się teraz sprawdzić — spróbuj przygotować opis.' : 'Środki są — możesz dyktować dalej.';
          setTimeout(close, 1800);
        } else { msg.hidden = false; msg.className = 'credit-msg err'; msg.textContent = d.error || 'Nie udało się sprawdzić.'; }
      } catch { msg.hidden = false; msg.className = 'credit-msg err'; msg.textContent = 'Brak połączenia — spróbuj za chwilę.'; }
      b.disabled = false; b.textContent = 'Wpłaciłem — sprawdź';
    });
    document.body.append(wrap);
    a.focus();
  };
  if (document.body) show(); else document.addEventListener('DOMContentLoaded', show);
}

window.fetch = async (input, init = {}) => {
  const u = typeof input === 'string' ? input : input?.url;
  if (!isApi(u)) return nativeFetch(input, init);
  const res = await nativeFetch(input, { ...init, credentials: 'same-origin', headers: { ...(init.headers || {}), 'X-Radiopis': '1' } });
  if (u.startsWith('/api/sync')) return res;
  if (res.status === 401) {
    location.href = '/login?next=/app/';
  } else if (res.status === 402) {
    const d = await res.clone().json().catch(() => ({}));
    if (d.code === 'pwd') { location.href = '/change-password'; return res; }
    if (d.code === 'own_credit') { showCreditDialog(d.billingUrl); return res; }
    showBanner(d.error || 'Brak dostępu.', { error: d.code !== 'quota' });
  } else if (res.ok && u === '/api/format') {
    const d = await res.clone().json().catch(() => null);
    if (d?.quota?.warn) showBanner(`Przekroczono miesięczny limit opisów (${d.quota.limit}). Możesz jeszcze chwilę pracować — rozważ wyższy plan.`);
  } else if (res.ok && u === '/api/status') {
    const d = await res.clone().json().catch(() => null);
    if (d && !d.user) location.href = '/login?next=/app/';
    else if (d && d.access && !d.access.ok) {
      if (d.access.code === 'pwd') location.href = '/change-password';
      else showBanner(d.access.reason, { error: true });
    } else if (d?.access?.needKey) {
      showBanner('Ostatni krok: dodaj swój klucz API na stronie konta (jest tam instrukcja krok po kroku) — potem AI przygotuje opisy.');
    } else if (d?.credit?.out) {
      showCreditDialog(d.credit.billingUrl);
    } else if (d?.announcement && sessionStorage.getItem('radiopis.ann') !== d.announcement) {
      showBanner(d.announcement, { link: false, onClose: () => sessionStorage.setItem('radiopis.ann', d.announcement) });
    }
  }
  return res;
};

// ---------------------------------------------------------------- sync
const readMeta = () => { try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; } };
const writeMeta = (m) => { try { origSet.call(localStorage, META_KEY, JSON.stringify(m)); } catch { /* ignore */ } };
const timers = {};

async function push(key) {
  const value = localStorage.getItem(key);
  try {
    const res = value === null
      ? await nativeFetch(`/api/sync/${encodeURIComponent(key)}`, { method: 'DELETE', credentials: 'same-origin', headers: { 'X-Radiopis': '1' } })
      : await nativeFetch(`/api/sync/${encodeURIComponent(key)}`, { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1' }, body: JSON.stringify({ value }) });
    if (res.ok) {
      const m = readMeta();
      m[key] = { at: Date.now(), dirty: false };
      writeMeta(m);
    }
  } catch { /* offline: stays dirty, pushed next time */ }
}
function schedule(key) {
  const m = readMeta();
  m[key] = { ...(m[key] || {}), dirty: true };
  writeMeta(m);
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => push(key), 1500);
}
Storage.prototype.setItem = function setItem(key, value) {
  origSet.call(this, key, value);
  if (this === window.localStorage && SYNC_KEYS.includes(key)) schedule(key);
};
Storage.prototype.removeItem = function removeItem(key) {
  origRemove.call(this, key);
  if (this === window.localStorage && SYNC_KEYS.includes(key)) schedule(key);
};

let me = null;
async function start() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 5000);
  try {
    const st = await nativeFetch('/api/status', { credentials: 'same-origin', signal: ctrl.signal }).then((r) => r.json());
    me = st.user;
    if (!me) { location.href = '/login?next=/app/'; return; }
    // another user on this browser: start clean (their reports and style never leak to the next person)
    const owner = localStorage.getItem(OWNER_KEY);
    if (owner && owner !== String(me.id)) {
      for (const k of [...LOCAL_KEYS, META_KEY]) origRemove.call(localStorage, k);
    }
    origSet.call(localStorage, OWNER_KEY, String(me.id));
    const data = await nativeFetch('/api/sync', { credentials: 'same-origin', signal: ctrl.signal }).then((r) => (r.ok ? r.json() : {}));
    const meta = readMeta();
    for (const k of SYNC_KEYS) {
      const srv = data[k];
      const local = localStorage.getItem(k);
      const m = meta[k] || { at: 0, dirty: false };
      if (m.dirty && local !== null) { push(k); continue; } // changed here while offline: this device wins
      if (srv && srv.value !== local && srv.at > (m.at || 0)) {
        origSet.call(localStorage, k, srv.value);
        meta[k] = { at: srv.at, dirty: false };
      } else if (!srv && local !== null) {
        push(k); // first sync from this device
      }
    }
    writeMeta(meta);
  } catch { /* offline or slow: the app starts with what this browser has */ }
  finally { clearTimeout(timer); }
}
await start();

// ---------------------------------------------------------------- account menu
function wireAccount() {
  const btn = document.getElementById('accountBtn');
  const pop = document.getElementById('accountPop');
  if (!btn || !pop) return;
  if (me) {
    document.getElementById('accountWho').textContent = me.name || me.email;
    if (me.role === 'admin') document.getElementById('accountAdmin').hidden = false;
    if (me.role === 'orgadmin') document.getElementById('accountIt').hidden = false;
  }
  btn.addEventListener('click', (e) => { e.stopPropagation(); pop.hidden = !pop.hidden; });
  document.addEventListener('click', (e) => { if (!pop.hidden && !pop.contains(e.target)) pop.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') pop.hidden = true; });
  document.getElementById('accountLogout').addEventListener('click', async () => {
    for (const k of PRIVATE_KEYS) origRemove.call(localStorage, k);
    await Promise.all(SYNC_KEYS.map((k) => (readMeta()[k]?.dirty ? push(k) : null)));
    location.href = '/logout';
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireAccount); else wireAccount();

export const hostedUser = () => me;

// ---------------------------------------------------------------- technical problems → the organisation's IT console
// (error codes and the microphone diagnostic only — never report text). The same problem is sent at most once a minute.
const sentProblems = new Map();
window.addEventListener('radiopis:problem', (e) => {
  const { kind, code, detail } = e.detail || {};
  const key = `${kind}:${code}`;
  if (Date.now() - (sentProblems.get(key) || 0) < 60_000) return;
  sentProblems.set(key, Date.now());
  nativeFetch('/api/me/event', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Radiopis': '1' }, body: JSON.stringify({ kind, code, detail }) }).catch(() => {});
});

// ---------------------------------------------------------------- installable desktop app (Chrome / Edge)
// The installed app is this same web app in its own window: one server, one account, so templates, learning and
// settings saved to the account are the same in the browser and on every computer.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
let installEvent = null;
const runningInstalled = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
function renderInstall() {
  const btn = document.getElementById('installApp');
  const status = document.getElementById('installStatus');
  if (!btn || !status) return;
  btn.hidden = !installEvent || runningInstalled();
  status.textContent = runningInstalled()
    ? 'Pracujesz w zainstalowanej aplikacji. Konto, szablony i nauka są te same co w przeglądarce i na innych komputerach.'
    : installEvent
      ? 'Zainstaluj RadVox Pro jak zwykły program: własne okno, ikona na pulpicie i pasku zadań. Wszystko zostaje na Twoim koncie, więc jest zsynchronizowane.'
      : 'Aby zainstalować jak program: w Chrome lub Edge kliknij ikonę instalacji na końcu paska adresu albo menu ⋮ → „Zainstaluj RadVox Pro” (Edge: Aplikacje → Zainstaluj tę witrynę jako aplikację).';
}
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; renderInstall(); });
window.addEventListener('appinstalled', () => { installEvent = null; renderInstall(); });
document.addEventListener('click', async (e) => {
  if (!e.target.closest?.('#installApp') || !installEvent) return;
  installEvent.prompt();
  try { await installEvent.userChoice; } catch { /* closed */ }
  installEvent = null;
  renderInstall();
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderInstall); else renderInstall();

// Account page: subscription, plan choice (Stripe or bank transfer), invoice data, password, devices.
import { $, $$, api, esc, toast, showMsg, fmtDate, fmtDateTime, fmtPln, fmtUsd, daysLeft, statusPill, CHECK } from './common.js';

let me = null;
let interval = 'month';
const PROVIDER = { stripe: 'karta (online)', transfer: 'przelew', manual: 'ręcznie', free: 'bezpłatnie' };

function deviceName(ua) {
  const b = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Przeglądarka';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : '';
  return `${b}${os ? ` · ${os}` : ''}`;
}

function renderPlans() {
  const months = me.annualMonths || 10;
  $('#plans').innerHTML = me.plans.map((p) => {
    const current = me.user.plan === p.id && me.access.ok && me.user.subStatus !== 'trial';
    const price = interval === 'year' ? p.pricePln * months : p.pricePln;
    const online = interval === 'year' ? p.onlineYear : p.online;
    return `<div class="plan${p.featured ? ' featured' : ''}${current ? ' current' : ''}">
      ${current ? '<span class="pill ok badge">Twój plan</span>' : p.featured ? '<span class="pill info badge">Polecany</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <div class="price">${fmtPln(price)}<small> / ${interval === 'year' ? 'rok' : 'mies.'}</small></div>
      <div class="price-note">netto${interval === 'year' ? ` · ${12 - months} mies. gratis` : ''}</div>
      <ul><li>${CHECK}<span>${p.quota.toLocaleString('pl-PL')} opisów / mies.</span></li><li>${CHECK}<span>${p.devices} ${p.devices === 1 ? 'urządzenie' : 'urządzenia'}</span></li></ul>
      <div class="plan-pay">
        ${me.prepaid ? `<button class="btn ${p.featured ? 'btn-primary' : ''}" data-prepaid="${esc(p.id)}">${current ? 'Przedłuż' : 'Kup'} ${interval === 'year' ? '12 mies.' : '1 mies.'} — BLIK, Przelewy24, karta</button>` : ''}
        ${online ? `<button class="btn${me.prepaid ? ' btn-ghost' : p.featured ? ' btn-primary' : ''}" data-plan="${esc(p.id)}">Subskrypcja kartą (odnawiana)</button>` : ''}
        ${!me.prepaid && !online ? `<button class="btn" data-transfer="${esc(p.id)}">Wybierz — przelew</button>` : `<button class="btn btn-ghost btn-sm" data-transfer="${esc(p.id)}">Przelew tradycyjny / faktura proforma</button>`}
      </div>
    </div>`;
  }).join('');
  for (const b of $$('[data-plan]')) b.addEventListener('click', () => checkout(b.dataset.plan, b));
  for (const b of $$('[data-prepaid]')) b.addEventListener('click', () => checkout(b.dataset.prepaid, b, 'prepaid'));
  for (const b of $$('[data-transfer]')) b.addEventListener('click', () => transfer(b.dataset.transfer));
}

async function checkout(plan, btn, mode = 'subscription') {
  btn.disabled = true;
  try {
    const d = await api('/api/me/checkout', { method: 'POST', body: { plan, interval, mode } });
    location.href = d.url;
  } catch (err) {
    toast(err.message, 'err', 5000);
    btn.disabled = false;
  }
}

function transfer(planId) {
  const p = me.plans.find((x) => x.id === planId);
  const months = me.annualMonths || 10;
  const net = interval === 'year' ? p.pricePln * months : p.pricePln;
  const gross = Math.round(net * 1.23 * 100) / 100;
  const box = $('#bank');
  if (!me.bank) {
    showMsg(box, `Plan ${p.name}: ${fmtPln(net)} netto (${fmtPln(gross, 2)} brutto). Płatność przelewem — napisz do nas${me.brand.supportEmail ? ` (${me.brand.supportEmail})` : ''}, a prześlemy fakturę proforma. Dostęp włączymy po zaksięgowaniu wpłaty.`, 'info');
  } else {
    box.className = 'msg info';
    box.hidden = false;
    box.innerHTML = `<b>Przelew za plan ${esc(p.name)} (${interval === 'year' ? 'rok' : 'miesiąc'})</b><br>
      Kwota: <b>${fmtPln(gross, 2)}</b> brutto (${fmtPln(net)} netto + 23% VAT)<br>
      Odbiorca: ${esc(me.bank.name)}<br>
      Numer konta: <span class="mono">${esc(me.bank.account)}</span><br>
      Tytuł: <span class="mono">${esc(`${me.brand.name} ${p.name} ${interval === 'year' ? '12m' : '1m'} — ${me.user.email}`)}</span><br>
      <span class="dim">Dostęp przedłużymy po zaksięgowaniu wpłaty (zwykle 1 dzień roboczy). Faktura na dane z formularza obok.</span>`;
  }
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function render() {
  const u = me.user;
  $('#who').textContent = `${u.name} · ${u.email}`;
  $('#adminLink').hidden = u.role !== 'admin';
  $('#itLink').hidden = u.role !== 'orgadmin';
  const org = me.org;
  const owner = u.role === 'admin';
  const friend = me.friend;
  document.body.classList.toggle('friend', Boolean(friend));
  if (friend) for (const l of document.querySelectorAll('link[rel="icon"]')) l.href = '/icons/radvox-friend-192.png';
  $('#friendCard').hidden = !friend;
  if (friend) {
    $('#keyMasked').textContent = friend.key || 'brak — wklej klucz poniżej';
    $('#ownCost').textContent = `${fmtUsd(friend.ownCostUsd)} (płatne przez Ciebie w Anthropic)`;
    $('#keyRemove').hidden = !friend.key;
    if (!friend.key) { $('#keyGuide').open = true; loadKeyGuide(); }
  }
  $('#choose').hidden = Boolean(org) || owner || Boolean(friend);
  $('#paymentsCard').hidden = Boolean(org) || owner || Boolean(friend);
  if (org) u.subUntil = org.subUntil;
  $('#statusPill').innerHTML = owner ? '<span class="pill ok">właściciel</span>' : statusPill({ ...u, blocked: false, ...(me.org ? { subStatus: 'org', subUntil: me.org.subUntil } : {}) });
  $('#planName').textContent = owner ? 'Właściciel usługi' : me.plan.name;
  const left = daysLeft(u.subUntil);
  $('#until').textContent = owner || friend ? 'bez terminu' : u.subUntil ? `${fmtDate(u.subUntil)}${left > 0 ? ` (${left} dni)` : ''}` : '—';
  const pct = me.plan.quota ? Math.min(100, (me.usage.reports / me.plan.quota) * 100) : 0;
  $('#usageText').textContent = me.plan.quota ? `${me.usage.reports} z ${me.plan.quota}` : `${me.usage.reports} (bez limitu)`;
  $('#meterBar').style.width = `${pct}%`;
  $('#meter').className = `meter${pct >= 100 ? ' err' : pct >= 80 ? ' warn' : ''}`;
  $('#meter').hidden = !me.plan.quota;
  $('#portalBtn').hidden = !u.hasStripe;
  $('#appLink').hidden = !me.access.ok;
  $('#chooseTitle').textContent = me.access.ok && u.subStatus !== 'trial' ? 'Zmień lub przedłuż plan' : 'Wybierz plan';
  const p = new URLSearchParams(location.search);
  if (p.get('paid')) showMsg($('#notice'), 'Dziękujemy! Płatność przyjęta — dostęp zaktualizuje się w ciągu kilku sekund (odśwież stronę).', 'ok');
  else if (p.get('canceled')) showMsg($('#notice'), 'Płatność anulowana — nic nie zostało pobrane.', 'info');
  else if (owner) showMsg($('#notice'), 'Konto właściciela usługi — pełny dostęp bez subskrypcji. Włącz logowanie dwuetapowe poniżej.', 'info');
  else if (p.get('verify') === 'bad' && me.access.code === 'verify') showMsg($('#notice'), 'Link potwierdzający wygasł lub był już użyty — wyślij nowy przyciskiem poniżej.', 'warn');
  else if (me.friend && !me.friend.key) showMsg($('#notice'), 'Ostatni krok: wklej swój klucz API Claude w kartę „Twój klucz API” poniżej. Nie masz go jeszcze? Instrukcja krok po kroku jest pod polem.', 'info');
  else if (!me.access.ok) showMsg($('#notice'), me.access.reason, me.access.code === 'verify' || me.access.code === 'pending' ? 'info' : 'err');
  else if (org) showMsg($('#notice'), `Licencję zapewnia ${org.name}${org.status === 'trial' ? ' (okres próbny)' : ''}. Sprawy konta i hasła: dział IT${org.contact ? ` — ${org.contact}` : ''}.`, 'info');
  else if (u.subStatus === 'trial') showMsg($('#notice'), `Okres próbny: zostało ${left} dni. Wybierz plan, aby pracować dalej bez przerwy.`, 'info');
  else if (friend) showMsg($('#notice'), 'Wersja dla przyjaciół — wszystko za darmo, opisy rozliczasz własnym kluczem API.', 'info');
  else if (u.subUntil > 0 && left <= 7 && !u.hasStripe) showMsg($('#notice'), `Subskrypcja kończy się za ${left} dni.`, 'info');
  $('#verifyRow').hidden = me.access.code !== 'verify';
  renderPlans();
  $('#payments').innerHTML = me.payments.length
    ? me.payments.map((x) => `<tr><td>${fmtDate(x.ts)}</td><td>${esc(x.plan)}</td><td>${fmtDate(x.period_until)}</td><td>${esc(PROVIDER[x.provider] || x.provider)}</td><td class="num">${fmtPln(x.amount_pln, 2)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty">Brak płatności</td></tr>';
  const f = $('#profileForm');
  f.name.value = u.name; f.phone.value = u.phone; f.company.value = u.company; f.nip.value = u.nip;
  $('#sessions').innerHTML = me.sessions.map((s) => `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${esc(deviceName(s.ua))}</b>${s.current ? ' <span class="pill ok">to urządzenie</span>' : ''}<span class="sub dim">ostatnio ${fmtDateTime(s.last_seen)}</span></div>`).join('');
  renderPrivacy();
  $('#devicesNote').textContent = `Plan pozwala na ${me.plan.devices} ${me.plan.devices === 1 ? 'zalogowane urządzenie' : 'zalogowane urządzenia'} jednocześnie — przy logowaniu na kolejnym najstarsze jest wylogowywane.`;
}

function renderPrivacy() {
  const u = me.user;
  $('#termsInfo').textContent = me.termsAcceptedAt ? `Zaakceptowany regulamin i informacja o danych: wersja ${me.termsVersion}, ${fmtDateTime(me.termsAcceptedAt)}.` : '';
  $('#deleteBtn').hidden = Boolean(u.orgId) || u.role === 'admin';
  $('#deleteNote').textContent = u.orgId ? 'Konto należy do organizacji — o jego usunięcie poproś dział IT. Kopię danych możesz pobrać sam(a).' : '';
  $('#tfaPill').innerHTML = me.twoFactor ? '<span class="pill ok">włączone</span>' : '<span class="pill warn">wyłączone</span>';
  const box = $('#tfaBox');
  if (me.twoFactor) {
    box.innerHTML = `<form id="tfaOff" class="row"><div class="field"><label>Hasło</label><input name="password" type="password" autocomplete="current-password" required /></div><div class="field" style="flex:0 1 140px"><label>Kod z aplikacji</label><input name="code" inputmode="numeric" maxlength="7" required /></div><div class="field" style="flex:0 0 auto;align-self:flex-end"><button class="btn btn-sm" type="submit">Wyłącz</button></div></form>`;
    $('#tfaOff').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api('/api/me/2fa/disable', { method: 'POST', body: { password: e.target.password.value, code: e.target.code.value } }); toast('Logowanie dwuetapowe wyłączone', 'ok'); load(); } catch (err) { toast(err.message, 'err'); }
    });
  } else {
    box.innerHTML = '<button class="btn btn-sm btn-primary" id="tfaStart">Włącz logowanie dwuetapowe</button>';
    $('#tfaStart').addEventListener('click', async () => {
      try {
        const d = await api('/api/me/2fa/setup', { method: 'POST', body: {} });
        box.innerHTML = `<ol class="small" style="padding-left:18px;line-height:1.6">
            <li>Otwórz aplikację uwierzytelniającą w telefonie i dodaj konto („+” → „wpisz klucz”).</li>
            <li>Wpisz klucz: <b class="mono" style="user-select:all;letter-spacing:1px">${esc(d.secret.replace(/(.{4})/g, '$1 ').trim())}</b> <span class="dim">(typ: oparty na czasie)</span><br><span class="dim">Na telefonie możesz też otworzyć: </span><a href="${esc(d.uri)}">dodaj w aplikacji</a></li>
            <li>Wpisz 6-cyfrowy kod, który pokaże aplikacja:</li></ol>
          <form id="tfaOn" class="row"><div class="field" style="flex:0 1 160px"><input name="code" inputmode="numeric" maxlength="7" autocomplete="one-time-code" required /></div><div class="field" style="flex:0 0 auto"><button class="btn btn-sm btn-primary" type="submit">Potwierdź i włącz</button></div></form>`;
        $('#tfaOn').addEventListener('submit', async (e) => {
          e.preventDefault();
          try { await api('/api/me/2fa/enable', { method: 'POST', body: { code: e.target.code.value } }); toast('Logowanie dwuetapowe włączone. Inne urządzenia zostały wylogowane.', 'ok', 5000); load(); } catch (err) { toast(err.message, 'err', 5000); }
        });
      } catch (err) { toast(err.message, 'err'); }
    });
  }
}

$('#deleteBtn').addEventListener('click', async () => {
  const pass = prompt('Usunięcie konta jest nieodwracalne: dane osobowe, szablony i nauczony styl zostaną usunięte. Wpisz hasło, aby potwierdzić.');
  if (!pass) return;
  try {
    await api('/api/me/delete', { method: 'POST', body: { password: pass } });
    location.href = '/?deleted=1';
  } catch (err) { toast(err.message, 'err', 5000); }
});

async function load() {
  try {
    me = await api('/api/me');
    for (const el of $$('[data-brand]')) el.textContent = me.brand.name;
    render();
  } catch (err) {
    if (err.status === 401) location.href = '/login?next=/account';
    else toast(err.message, 'err');
  }
}

for (const b of $$('.billing-toggle button')) {
  b.addEventListener('click', () => {
    interval = b.dataset.interval;
    for (const x of $$('.billing-toggle button')) x.setAttribute('aria-pressed', String(x === b));
    $('#bank').hidden = true;
    renderPlans();
  });
}
$('#portalBtn').addEventListener('click', async () => {
  try { location.href = (await api('/api/me/portal', { method: 'POST', body: {} })).url; } catch (err) { toast(err.message, 'err'); }
});
$('#profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    me = await api('/api/me/update', { method: 'POST', body: { name: f.name.value, phone: f.phone.value, company: f.company.value, nip: f.nip.value } });
    render();
    toast('Zapisano', 'ok');
  } catch (err) { toast(err.message, 'err'); }
});
$('#pwdForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api('/api/me/password', { method: 'POST', body: { current: f.current.value, next: f.next.value } });
    f.reset();
    toast('Hasło zmienione. Inne urządzenia zostały wylogowane.', 'ok');
    load();
  } catch (err) { toast(err.message, 'err'); }
});
$('#logoutOthers').addEventListener('click', async () => {
  await api('/api/me/logout-others', { method: 'POST', body: {} });
  toast('Wylogowano inne urządzenia', 'ok');
  load();
});
load();

$('#resendVerify')?.addEventListener('click', async (e) => {
  e.target.disabled = true;
  try { await api('/api/me/resend-verify', { method: 'POST', body: {} }); toast('Wysłaliśmy nowy link — sprawdź skrzynkę (także SPAM).', 'ok', 5000); }
  catch (err) { toast(err.message, 'err'); e.target.disabled = false; }
});

$('#keyForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  if (!$('#apiKey').value.trim()) return toast('Najpierw wklej klucz (Ctrl+V).', 'err');
  btn.disabled = true; btn.textContent = 'Sprawdzam klucz…';
  try {
    const r = await api('/api/me/api-key', { method: 'POST', body: { key: $('#apiKey').value } });
    me = r; $('#apiKey').value = ''; render();
    toast(r.keyChecked === false ? 'Klucz zapisany. Anthropic nie odpowiedział teraz, więc sprawdzimy go przy pierwszym opisie.' : 'Klucz działa i jest zapisany — możesz dyktować.', 'ok', 6000);
  } catch (err) { toast(err.message, 'err', 9000); }
  finally { btn.disabled = false; btn.textContent = 'Zapisz klucz'; }
});
$('#keyRemove')?.addEventListener('click', async () => {
  if (!window.confirm('Usunąć zapisany klucz API? Bez klucza AI nie przygotuje opisów.')) return;
  try { me = await api('/api/me/api-key', { method: 'DELETE' }); render(); toast('Klucz usunięty.', 'info'); } catch (err) { toast(err.message, 'err'); }
});

// the step-by-step key guide comes from the public page /klucz-api (one text for both places)
let guideLoaded = false;
async function loadKeyGuide() {
  if (guideLoaded) return;
  guideLoaded = true;
  try {
    const html = await (await fetch('/klucz-api')).text();
    const g = new DOMParser().parseFromString(html, 'text/html').querySelector('#guide');
    if (g) $('#keyGuideBody').replaceChildren(...g.childNodes);
  } catch { guideLoaded = false; }
}
$('#keyGuide')?.addEventListener('toggle', () => { if ($('#keyGuide').open) loadKeyGuide(); });
if (new URLSearchParams(location.search).has('klucz')) setTimeout(() => $('#friendCard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);

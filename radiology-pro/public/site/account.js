// Account page: subscription, plan choice (Stripe or bank transfer), invoice data, password, devices.
import { $, $$, api, esc, toast, showMsg, fmtDate, fmtDateTime, fmtPln, daysLeft, statusPill, CHECK } from './common.js';

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
      ${online ? `<button class="btn ${p.featured ? 'btn-primary' : ''}" data-plan="${esc(p.id)}">${current ? 'Przedłuż' : 'Wybierz'} — zapłać kartą</button>` : `<button class="btn" data-transfer="${esc(p.id)}">Wybierz — przelew</button>`}
    </div>`;
  }).join('');
  for (const b of $$('[data-plan]')) b.addEventListener('click', () => checkout(b.dataset.plan, b));
  for (const b of $$('[data-transfer]')) b.addEventListener('click', () => transfer(b.dataset.transfer));
}

async function checkout(plan, btn) {
  btn.disabled = true;
  try {
    const d = await api('/api/me/checkout', { method: 'POST', body: { plan, interval } });
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
  $('#choose').hidden = Boolean(org);
  $('#paymentsCard').hidden = Boolean(org);
  if (org) u.subUntil = org.subUntil;
  $('#statusPill').innerHTML = statusPill({ ...u, blocked: false, ...(me.org ? { subStatus: 'org', subUntil: me.org.subUntil } : {}) });
  $('#planName').textContent = me.plan.name;
  const left = daysLeft(u.subUntil);
  $('#until').textContent = u.subUntil ? `${fmtDate(u.subUntil)}${left > 0 ? ` (${left} dni)` : ''}` : '—';
  const pct = me.plan.quota ? Math.min(100, (me.usage.reports / me.plan.quota) * 100) : 0;
  $('#usageText').textContent = `${me.usage.reports} z ${me.plan.quota}`;
  $('#meterBar').style.width = `${pct}%`;
  $('#meter').className = `meter${pct >= 100 ? ' err' : pct >= 80 ? ' warn' : ''}`;
  $('#portalBtn').hidden = !u.hasStripe;
  $('#appLink').hidden = !me.access.ok;
  $('#chooseTitle').textContent = me.access.ok && u.subStatus !== 'trial' ? 'Zmień lub przedłuż plan' : 'Wybierz plan';
  const p = new URLSearchParams(location.search);
  if (p.get('paid')) showMsg($('#notice'), 'Dziękujemy! Płatność przyjęta — dostęp zaktualizuje się w ciągu kilku sekund (odśwież stronę).', 'ok');
  else if (p.get('canceled')) showMsg($('#notice'), 'Płatność anulowana — nic nie zostało pobrane.', 'info');
  else if (!me.access.ok) showMsg($('#notice'), me.access.reason, 'err');
  else if (org) showMsg($('#notice'), `Licencję zapewnia ${org.name}${org.status === 'trial' ? ' (okres próbny)' : ''}. Sprawy konta i hasła: dział IT${org.contact ? ` — ${org.contact}` : ''}.`, 'info');
  else if (u.subStatus === 'trial') showMsg($('#notice'), `Okres próbny: zostało ${left} dni. Wybierz plan, aby pracować dalej bez przerwy.`, 'info');
  else if (left <= 7 && !u.hasStripe) showMsg($('#notice'), `Subskrypcja kończy się za ${left} dni.`, 'info');
  renderPlans();
  $('#payments').innerHTML = me.payments.length
    ? me.payments.map((x) => `<tr><td>${fmtDate(x.ts)}</td><td>${esc(x.plan)}</td><td>${fmtDate(x.period_until)}</td><td>${esc(PROVIDER[x.provider] || x.provider)}</td><td class="num">${fmtPln(x.amount_pln, 2)}</td></tr>`).join('')
    : '<tr><td colspan="5" class="empty">Brak płatności</td></tr>';
  const f = $('#profileForm');
  f.name.value = u.name; f.npwz.value = u.npwz; f.phone.value = u.phone; f.company.value = u.company; f.nip.value = u.nip;
  $('#sessions').innerHTML = me.sessions.map((s) => `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${esc(deviceName(s.ua))}</b>${s.current ? ' <span class="pill ok">to urządzenie</span>' : ''}<span class="sub dim">ostatnio ${fmtDateTime(s.last_seen)}</span></div>`).join('');
  $('#devicesNote').textContent = `Plan pozwala na ${me.plan.devices} ${me.plan.devices === 1 ? 'zalogowane urządzenie' : 'zalogowane urządzenia'} jednocześnie — przy logowaniu na kolejnym najstarsze jest wylogowywane.`;
}

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
    me = await api('/api/me/update', { method: 'POST', body: { name: f.name.value, npwz: f.npwz.value, phone: f.phone.value, company: f.company.value, nip: f.nip.value } });
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

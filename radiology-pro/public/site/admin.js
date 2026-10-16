// Administrator panel: dashboard, users (with detail drawer and actions), AI usage and costs,
// payments, plans and prices (with a margin calculator), settings, audit log and outgoing e-mail.
import { $, $$, api, brand, esc, toast, fmtDate, fmtDateTime, fmtPln, fmtUsd, fmtNum, daysLeft, statusPill, STATUS_LABEL } from './common.js';

let overviewData = null;
let plansData = [];
const PROVIDER = { stripe: 'Stripe', transfer: 'przelew', manual: 'ręcznie', free: 'gratis' };
const LANG = { 'pl>pl': 'PL → PL', 'en>pl': 'EN → PL', 'en>en': 'EN → EN', 'pl>en': 'PL → EN' };
const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—');

// ---------------------------------------------------------------- tabs
const loaders = { dash: loadDash, users: loadUsers, orgs: loadOrgs, learning: loadLearning, tickets: loadTickets, usage: loadUsage, payments: loadPayments, plans: loadPlans, settings: loadSettings, log: loadLog };
function openTab(name) {
  for (const b of $$('.admin-tabs button')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  for (const p of $$('[data-panel]')) p.hidden = p.dataset.panel !== name;
  history.replaceState(null, '', `#${name}`);
  loaders[name]?.().catch((err) => toast(err.message, 'err'));
}
for (const b of $$('.admin-tabs button')) b.addEventListener('click', () => openTab(b.dataset.tab));

// ---------------------------------------------------------------- dashboard
function kpi(label, value, note = '', cls = '') {
  return `<div class="kpi"><div class="label">${esc(label)}</div><div class="value ${cls}">${value}</div><div class="note">${note}</div></div>`;
}
async function loadDash() {
  const o = await api('/api/admin/overview');
  overviewData = o;
  $('#kpis').innerHTML = [
    kpi('Płacący użytkownicy', fmtNum(o.users.paid), `${o.users.trial} w okresie próbnym · ${o.users.expired} wygasłych`),
    kpi('Przychód miesięczny (MRR)', fmtPln(o.mrrPln), `wpłaty w tym miesiącu: ${fmtPln(o.paidThisMonthPln)}`),
    kpi('Koszt AI (ten miesiąc)', fmtPln(o.ai.costPln), `${fmtUsd(o.ai.costUsd)} · kurs ${o.usdPln}`),
    kpi('Marża po kosztach AI', fmtPln(o.marginPln), o.mrrPln ? `${pct(o.marginPln, o.mrrPln)} przychodu` : 'brak przychodu', o.marginPln >= 0 ? 'good' : 'bad'),
    kpi('Opisy (ten miesiąc)', fmtNum(o.ai.reports), `${fmtNum(o.ai.calls)} zapytań AI · ${o.ai.callsPerReport.toFixed(1)} na opis`),
    kpi('Koszt AI na opis', fmtPln(o.ai.costPerReportPln, 2), `śr. czas odpowiedzi ${(o.ai.avgMs / 1000).toFixed(1)} s · błędy: ${o.ai.errors}`),
    kpi('Organizacje', fmtNum(o.orgs.count), `${fmtNum(o.orgs.seatsUsed)} / ${fmtNum(o.orgs.seats)} miejsc zajętych · ${fmtPln(o.orgs.mrrPln)} / mies.`),
  ].join('');
  const sv = o.server;
  const ai = sv.ai;
  const bk = sv.backup;
  const bkAge = bk?.at ? (Date.now() - bk.at) / 3600000 : null;
  $('#server').innerHTML = [
    ['Zalogowani aktywni (15 min)', fmtNum(sv.sessions)],
    ['Zapytania AI teraz', `${ai.active} / ${ai.max}${ai.queued ? ` <span class="pill warn">${ai.queued} w kolejce</span>` : ''}`],
    ['Najdłuższe czekanie w kolejce', `${(ai.maxWaitMs / 1000).toFixed(1)} s <span class="dim small">(śr. ${(ai.avgWaitMs / 1000).toFixed(1)} s)</span>`],
    ['Odrzucone (przeciążenie)', ai.rejectedBusy ? `<span class="pill err">${ai.rejectedBusy}</span>` : '<span class="pill ok">0</span>'],
    ['Pominięte w tle (oszczędność)', fmtNum(ai.rejectedBg)],
    ['Pamięć serwera', `${sv.rssMb} MB`],
    ['Najdłuższe „zamrożenie” (ostatnia godzina)', `${sv.loop.maxMs} ms ${sv.loop.maxMs > 500 ? '<span class="pill warn">wysokie</span>' : '<span class="pill ok">OK</span>'} <span class="dim small">99%: ${sv.loop.p99Ms} ms</span>`],
    ['Działa od', `${Math.floor(sv.uptimeS / 3600)} h ${Math.floor((sv.uptimeS % 3600) / 60)} min`],
    ['Ostatnia kopia bazy', bk?.error ? `<span class="pill err">błąd</span>` : bk?.at ? `${fmtDateTime(bk.at)} <span class="dim small">${(bk.size / 1048576).toFixed(1)} MB</span>${bkAge > 26 ? ' <span class="pill err">stara!</span>' : ''}` : '<span class="pill warn">brak</span>'],
  ].map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
  if (!o.me2fa && !$('#tfaWarn')) $('#kpis').insertAdjacentHTML('beforebegin', '<div class="msg err" id="tfaWarn">Twoje konto właściciela chroni całą usługę i archiwum nauki AI. <a href="/account">Włącz logowanie dwuetapowe →</a></div>');
  else $('#tfaWarn')?.remove();
  loadTickets().catch(() => {});
  for (const org of o.orgs.expiring) toast(`Licencja ${org.name} kończy się ${fmtDate(org.subUntil)}`, 'warn', 6000);
  renderPending(o);
  drawChart(o.daily);
  const userCell = (u) => `<td><b>${esc(u.name || u.email)}</b><span class="sub">${esc(u.email)}</span></td>`;
  $('#expiring').innerHTML = o.expiring.length ? o.expiring.map((u) => `<tr class="click" data-user="${u.id}">${userCell(u)}<td>${esc(u.planName)}</td><td>${statusPill(u)}</td><td>${fmtDate(u.subUntil)} (${daysLeft(u.subUntil)} d)</td></tr>`).join('') : '<tr><td colspan="4" class="empty">Brak</td></tr>';
  $('#pastDue').innerHTML = o.pastDue.length ? o.pastDue.map((u) => `<tr class="click" data-user="${u.id}">${userCell(u)}<td>${esc(u.planName)}</td><td>${fmtDate(u.subUntil)}</td></tr>`).join('') : '<tr><td colspan="3" class="empty">Brak</td></tr>';
  $('#topCost').innerHTML = o.topCost.length ? o.topCost.map((u) => `<tr class="click" data-user="${u.id}">${userCell(u)}<td class="num">${u.reports}</td><td class="num">${fmtPln(u.costPln, 2)}</td><td class="num">${pct(u.costPln, u.pricePln)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">Brak zużycia</td></tr>';
  const totalLang = o.byLang.reduce((s, x) => s + x.calls, 0);
  $('#byLang').innerHTML = o.byLang.length ? o.byLang.map((x) => `<li><span>${esc(LANG[x.lang] || x.lang || '—')}</span><span class="dim">${fmtNum(x.calls)} · ${pct(x.calls, totalLang)}</span></li>`).join('') : '<li class="dim">Brak danych</li>';
  const c = o.config;
  const yes = (v, ok = 'tak', no = 'NIE') => (v ? `<span class="pill ok">${ok}</span>` : `<span class="pill err">${no}</span>`);
  $('#config').innerHTML = [
    ['AI', `${yes(c.ai, 'działa', 'brak klucza')} <span class="dim small">${esc(c.model)} · ${esc(c.provider)}</span>`],
    ['Płatności kartą (Stripe)', yes(c.stripe, 'włączone', 'wyłączone')],
    ['Webhook Stripe', yes(c.stripeWebhook, 'ustawiony', 'brak sekretu')],
    ['Wysyłka e-mail', yes(c.mail, 'włączona', 'tylko dziennik')],
    ['E-mail administratora (alerty)', c.adminEmail ? esc(c.adminEmail) : '<span class="pill warn">brak</span>'],
    ['Tryb', c.prod ? '<span class="pill ok">produkcja</span>' : '<span class="pill warn">deweloperski</span>'],
    ['Wersja', esc(c.version)],
  ].map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
}

function drawChart(daily) {
  const svg = $('#chart');
  const days = [];
  for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  const map = Object.fromEntries(daily.map((d) => [d.day, d]));
  const rows = days.map((d) => ({ day: d, reports: map[d]?.reports || 0, cost: map[d]?.cost || 0 }));
  const W = 600, H = 180, pad = 4;
  const maxR = Math.max(1, ...rows.map((r) => r.reports));
  const maxC = Math.max(0.0001, ...rows.map((r) => r.cost));
  const bw = (W - pad) / rows.length;
  const bars = rows.map((r, i) => {
    const h = ((H - pad) * r.reports) / maxR;
    return `<rect class="bar" x="${(pad + i * bw + 1).toFixed(1)}" y="${(H - pad - h).toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${h.toFixed(1)}"><title>${r.day}: ${r.reports} opisów, ${fmtUsd(r.cost)}</title></rect>`;
  }).join('');
  const pts = rows.map((r, i) => `${(pad + i * bw + bw / 2).toFixed(1)},${(H - pad - ((H - pad) * r.cost) / maxC).toFixed(1)}`).join(' ');
  svg.innerHTML = `<line class="grid" x1="${pad}" y1="${H - pad}" x2="${W}" y2="${H - pad}"/>${bars}<polyline class="line" points="${pts}" vector-effect="non-scaling-stroke"/>`;
  $('#axisFrom').textContent = rows[0].day.slice(5).replace('-', '.');
  $('#axisTo').textContent = rows.at(-1).day.slice(5).replace('-', '.');
  $('#chartNote').textContent = `maks. ${maxR} opisów / dzień · ${fmtUsd(maxC)} / dzień`;
}

$('#backupNow').addEventListener('click', async (e) => {
  e.target.disabled = true;
  try {
    const d = await api('/api/admin/backup', { method: 'POST', body: {} });
    toast(`Kopia zapisana: ${d.file} (${(d.size / 1048576).toFixed(1)} MB)`, 'ok', 5000);
    loadDash();
  } catch (err) { toast(err.message, 'err'); } finally { e.target.disabled = false; }
});

$('#runJobs').addEventListener('click', async () => {
  const d = await api('/api/admin/jobs', { method: 'POST', body: {} });
  toast(`Wygaszono: ${d.expired} · przypomnienia: ${d.reminded} · alerty kosztów: ${d.costAlerts}`, 'ok', 5000);
  loadDash();
});

// ---------------------------------------------------------------- users
let searchTimer = null;
async function loadUsers() {
  const q = encodeURIComponent($('#q').value.trim());
  const d = await api(`/api/admin/users?q=${q}&filter=${$('#filter').value}`);
  const rate = overviewData?.usdPln;
  $('#users').innerHTML = d.users.length ? d.users.map((u) => `<tr class="click" data-user="${u.id}">
      <td><b>${esc(u.name || '—')}</b>${u.role === 'admin' ? ' <span class="pill info">admin</span>' : u.role === 'orgadmin' ? ' <span class="pill info">IT</span>' : ''}${u.mustChangePwd ? ' <span class="pill warn">hasło tymcz.</span>' : ''}<span class="sub">${esc(u.email)}</span></td>
      <td>${esc(u.planName)}${u.quotaOverride != null ? ' <span class="pill warn">limit*</span>' : ''}${u.stripe ? ' <span class="pill">karta</span>' : ''}</td>
      <td>${statusPill(u)}</td>
      <td>${fmtDate(u.subUntil)}</td>
      <td class="num">${u.reports} / ${u.quota}</td>
      <td class="num">${fmtPln(u.costPln, 2)}</td>
      <td class="num">${u.pricePln && u.subStatus === 'active' ? fmtPln(u.pricePln - u.costPln) : '—'}</td>
      <td>${fmtDateTime(u.lastLogin)}</td></tr>`).join('') : '<tr><td colspan="8" class="empty">Brak użytkowników</td></tr>';
  $('#usersNote').textContent = `${d.users.length} użytkowników · miesiąc ${d.month}${rate ? ` · koszt w PLN wg kursu ${rate}` : ''} · kliknij wiersz, aby zobaczyć szczegóły`;
}
$('#q').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => loadUsers().catch((e) => toast(e.message, 'err')), 250); });
$('#filter').addEventListener('change', () => loadUsers().catch((e) => toast(e.message, 'err')));
document.addEventListener('click', (e) => {
  const row = e.target.closest('[data-user]');
  if (row) openUser(Number(row.dataset.user));
});

// ---------------------------------------------------------------- user drawer
function closeLayers() { $('#drawer').hidden = true; $('#modal').hidden = true; $('#overlay').hidden = true; }
$('#overlay').addEventListener('click', closeLayers);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLayers(); });

let orgsList = null;
async function openUser(id) {
  const d = await api(`/api/admin/users/${id}`);
  if (!plansData.length) plansData = (await api('/api/admin/plans')).plans;
  if (!orgsList) orgsList = (await api('/api/admin/orgs')).orgs;
  const u = d.user;
  const orgOpts = `<option value="">— brak (konto indywidualne) —</option>${orgsList.map((o) => `<option value="${o.id}"${o.id === u.orgId ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}`;
  const roleOpts = [['user', 'radiolog'], ['orgadmin', 'administrator IT organizacji'], ['admin', 'administrator usługi (Ty)']].map(([k, v]) => `<option value="${k}"${k === u.role ? ' selected' : ''}>${v}</option>`).join('');
  const planOpts = plansData.map((p) => `<option value="${esc(p.id)}"${p.id === u.plan ? ' selected' : ''}>${esc(p.name)} (${fmtPln(p.pricePln)})</option>`).join('');
  const dr = $('#drawer');
  dr.innerHTML = `
    <div class="drawer-head"><div><h2>${esc(u.name || u.email)}</h2><div class="dim small">${esc(u.email)} · konto od ${fmtDate(u.createdAt)}</div></div><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <div class="kpis">
      ${kpi('Status', statusPill(u), `do ${fmtDate(u.subUntil)}`)}
      ${kpi('Opisy (mies.)', `${u.reports} / ${u.quota}`, `${u.calls} zapytań AI`)}
      ${kpi('Koszt AI (mies.)', fmtPln(u.costPln, 2), `${fmtUsd(u.costUsd)}${u.pricePln ? ` · ${pct(u.costPln, u.pricePln)} ceny planu` : ''}`)}
    </div>
    ${u.orgId ? `<div class="msg info">Licencja z organizacji <b>${esc(u.orgName)}</b> (do ${fmtDate(u.subUntil)}). Przedłużasz ją w zakładce „Organizacje”.</div>` : ''}
    <h3${u.orgId ? ' hidden' : ''}>Przedłuż / zapisz płatność</h3>
    <form id="extendForm" class="card" style="padding:16px"${u.orgId ? ' hidden' : ''}>
      <div class="row">
        <div class="field"><label>Plan</label><select name="plan">${planOpts}</select></div>
        <div class="field"><label>Okres</label><select name="interval"><option value="month">miesiąc</option><option value="year">rok</option></select></div>
        <div class="field" style="flex:0 1 90px"><label>Ile</label><input name="count" type="number" min="1" max="36" value="1" /></div>
      </div>
      <div class="row">
        <div class="field"><label>Sposób</label><select name="provider"><option value="transfer">przelew</option><option value="manual">ręcznie</option><option value="free">gratis (0 zł)</option></select></div>
        <div class="field"><label>Kwota netto zł <span class="faint">(puste = z cennika)</span></label><input name="amountPln" type="number" step="0.01" min="0" /></div>
        <div class="field"><label>Nr faktury / ref.</label><input name="ref" /></div>
      </div>
      <button class="btn btn-primary" type="submit">Przedłuż dostęp</button>
      <p class="dim small" style="margin:8px 0 0">Nowy okres zaczyna się od późniejszej z dat: dziś lub obecny koniec dostępu.</p>
    </form>
    <h3>Konto</h3>
    <form id="editForm" class="card" style="padding:16px">
      <div class="row"><div class="field"><label>Imię i nazwisko</label><input name="name" value="${esc(u.name)}" /></div><div class="field"><label>E-mail</label><input name="email" value="${esc(u.email)}" /></div></div>
      <div class="row"><div class="field"><label>PWZ</label><input name="npwz" value="${esc(u.npwz)}" /></div><div class="field"><label>Telefon</label><input name="phone" value="${esc(u.phone)}" /></div></div>
      <div class="row"><div class="field"><label>Firma</label><input name="company" value="${esc(u.company)}" /></div><div class="field"><label>NIP</label><input name="nip" value="${esc(u.nip)}" /></div></div>
      <div class="row">
        <div class="field"><label>Dostęp do (data)</label><input name="until" type="date" value="${u.subUntil ? new Date(u.subUntil).toISOString().slice(0, 10) : ''}" /></div>
        <div class="field"><label>Status</label><select name="subStatus">${Object.entries(STATUS_LABEL).map(([k, v]) => `<option value="${k}"${k === u.subStatus ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="field"><label>Limit opisów <span class="faint">(puste = z planu)</span></label><input name="quotaOverride" type="number" min="0" value="${u.quotaOverride ?? ''}" /></div>
      </div>
      <div class="field"><label>Notatka (widoczna tylko dla administratora)</label><textarea name="note">${esc(u.note)}</textarea></div>
      <div class="row"><div class="field"><label>Organizacja</label><select name="orgId">${orgOpts}</select></div><div class="field"><label>Rola</label><select name="role">${roleOpts}</select></div></div>
      <button class="btn" type="submit">Zapisz zmiany</button>
    </form>
    <div class="actions" style="margin-top:12px">
      <button class="btn btn-sm" data-act="reset-link">Link do zmiany hasła</button>
      <button class="btn btn-sm" data-act="logout">Wyloguj ze wszystkich urządzeń</button>
      ${u.twoFactor ? '<button class="btn btn-sm" data-act="reset2fa">Wyłącz logowanie dwuetapowe</button>' : ''}
      <button class="btn btn-sm ${u.blocked ? '' : 'btn-danger'}" data-act="block">${u.blocked ? 'Odblokuj' : 'Zablokuj'}</button>
      <button class="btn btn-sm btn-danger" data-act="delete">Usuń konto</button>
    </div>
    <div id="linkBox" style="margin-top:10px" hidden></div>
    <h3>Zużycie miesięczne</h3>
    <div class="table-wrap"><table><thead><tr><th>Miesiąc</th><th class="num">Opisy</th><th class="num">Zapyt.</th><th class="num">Tokeny we/wy</th><th class="num">Koszt</th></tr></thead><tbody>
      ${d.months.length ? d.months.map((m) => `<tr><td>${m.month}</td><td class="num">${m.reports}</td><td class="num">${m.calls}</td><td class="num">${fmtNum(m.input)} / ${fmtNum(m.output)}</td><td class="num">${fmtPln(m.costPln, 2)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">Brak</td></tr>'}
    </tbody></table></div>
    <p class="dim small">Języki: ${d.byLang.map((x) => `${esc(LANG[x.lang] || x.lang)} ${x.calls}`).join(' · ') || '—'}</p>
    <h3>Płatności</h3>
    <div class="table-wrap"><table><thead><tr><th>Data</th><th>Plan</th><th>Do</th><th>Sposób</th><th>Ref.</th><th class="num">Kwota</th></tr></thead><tbody>
      ${d.payments.length ? d.payments.map((p) => `<tr><td>${fmtDate(p.ts)}</td><td>${esc(p.plan)}</td><td>${fmtDate(p.period_until)}</td><td>${esc(PROVIDER[p.provider] || p.provider)}</td><td>${esc(p.ref)}</td><td class="num">${fmtPln(p.amount_pln, 2)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Brak</td></tr>'}
    </tbody></table></div>
    <h3>Urządzenia</h3>
    <div class="small">${d.sessions.length ? d.sessions.map((s) => `<div class="dim">${fmtDateTime(s.last_seen)} · ${esc(s.ip)} · ${esc(s.ua.slice(0, 80))}</div>`).join('') : '<span class="dim">Nie jest zalogowany</span>'}</div>
    <h3>Historia</h3>
    <div class="small">${d.audit.map((a) => `<div style="padding:4px 0;border-bottom:1px solid var(--line)"><span class="dim">${fmtDateTime(a.ts)}</span> · <b>${esc(a.action)}</b> ${esc(a.detail)} <span class="faint">${esc(a.actor || 'system')}</span></div>`).join('') || '<span class="dim">Brak</span>'}</div>`;
  $('#overlay').hidden = false;
  dr.hidden = false;
  dr.scrollTop = 0;
  dr.querySelector('[data-close]').addEventListener('click', closeLayers);

  $('#extendForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api(`/api/admin/users/${id}/extend`, { method: 'POST', body: { plan: f.plan.value, interval: f.interval.value, count: Number(f.count.value), provider: f.provider.value, amountPln: f.provider.value === 'free' ? 0 : f.amountPln.value, ref: f.ref.value } });
      toast('Dostęp przedłużony', 'ok');
      openUser(id); refreshCurrent();
    } catch (err) { toast(err.message, 'err'); }
  });
  $('#editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const body = { name: f.name.value, email: f.email.value, npwz: f.npwz.value, phone: f.phone.value, company: f.company.value, nip: f.nip.value, note: f.note.value, subStatus: f.subStatus.value, quotaOverride: f.quotaOverride.value === '' ? null : Number(f.quotaOverride.value), orgId: f.orgId.value ? Number(f.orgId.value) : null, role: f.role.value };
    if (u.orgId) { delete body.subStatus; delete body.subUntil; }
    if (f.until.value && !u.orgId) body.subUntil = Date.parse(`${f.until.value}T23:59:59`);
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
      toast('Zapisano', 'ok');
      openUser(id); refreshCurrent();
    } catch (err) { toast(err.message, 'err'); }
  });
  for (const b of dr.querySelectorAll('[data-act]')) {
    b.addEventListener('click', async () => {
      const act = b.dataset.act;
      try {
        if (act === 'reset-link') {
          const r = await api(`/api/admin/users/${id}/reset-link`, { method: 'POST', body: {} });
          const box = $('#linkBox');
          box.hidden = false;
          box.innerHTML = `<label>Link (ważny 24 h) — wyślij użytkownikowi:</label><div class="copybox"><input readonly value="${esc(r.link)}" /><button class="btn btn-sm" type="button">Kopiuj</button></div>`;
          box.querySelector('button').addEventListener('click', () => { navigator.clipboard.writeText(r.link); toast('Skopiowano', 'ok'); });
        } else if (act === 'reset2fa') {
          if (!window.confirm(`Wyłączyć logowanie dwuetapowe dla ${u.email}? (np. zgubiony telefon)`)) return;
          await api(`/api/admin/users/${id}/reset-2fa`, { method: 'POST', body: {} });
          toast('Logowanie dwuetapowe wyłączone', 'ok');
          openUser(id);
        } else if (act === 'logout') {
          await api(`/api/admin/users/${id}/logout`, { method: 'POST', body: {} });
          toast('Wylogowano', 'ok');
        } else if (act === 'block') {
          await api(`/api/admin/users/${id}`, { method: 'PATCH', body: { blocked: !u.blocked } });
          openUser(id); refreshCurrent();
        } else if (act === 'delete') {
          if (!window.confirm(`Usunąć konto ${u.email} wraz z historią zużycia i płatności? Tej operacji nie można cofnąć.`)) return;
          await api(`/api/admin/users/${id}`, { method: 'DELETE' });
          toast('Konto usunięte', 'ok');
          closeLayers(); refreshCurrent();
        }
      } catch (err) { toast(err.message, 'err'); }
    });
  }
}

function refreshCurrent() {
  const tab = $('.admin-tabs button[aria-selected="true"]')?.dataset.tab || 'dash';
  loaders[tab]?.().catch(() => {});
}

// ---------------------------------------------------------------- add user
$('#addUser').addEventListener('click', async () => {
  if (!plansData.length) plansData = (await api('/api/admin/plans')).plans;
  const m = $('#modal');
  m.innerHTML = `<div class="drawer-head"><h2>Nowy użytkownik</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <form id="newUser">
      <div class="row"><div class="field"><label>Imię i nazwisko</label><input name="name" required /></div><div class="field"><label>E-mail</label><input name="email" type="email" required /></div></div>
      <div class="row"><div class="field"><label>PWZ</label><input name="npwz" /></div><div class="field"><label>Telefon</label><input name="phone" /></div></div>
      <div class="row"><div class="field"><label>Firma</label><input name="company" /></div><div class="field"><label>NIP</label><input name="nip" /></div></div>
      <div class="row">
        <div class="field"><label>Plan</label><select name="plan">${plansData.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select></div>
        <div class="field"><label>Okres</label><select name="interval"><option value="month">miesiąc</option><option value="year">rok</option></select></div>
        <div class="field"><label>Kwota netto zł</label><input name="amountPln" type="number" step="0.01" min="0" placeholder="0 = bez płatności" /></div>
      </div>
      <div class="field"><label class="check"><input type="checkbox" name="sendEmail" checked /> Wyślij zaproszenie e-mailem</label></div>
      <div class="field"><label class="check"><input type="checkbox" name="admin" /> Administrator</label></div>
      <button class="btn btn-primary" type="submit">Utwórz konto</button>
    </form><div id="newLink" style="margin-top:12px" hidden></div>`;
  $('#overlay').hidden = false;
  m.hidden = false;
  m.querySelector('[data-close]').addEventListener('click', closeLayers);
  $('#newUser').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const r = await api('/api/admin/users', { method: 'POST', body: { name: f.name.value, email: f.email.value, npwz: f.npwz.value, phone: f.phone.value, company: f.company.value, nip: f.nip.value, plan: f.plan.value, interval: f.interval.value, amountPln: Number(f.amountPln.value) || 0, sendEmail: f.sendEmail.checked, role: f.admin.checked ? 'admin' : 'user' } });
      const box = $('#newLink');
      box.hidden = false;
      box.innerHTML = `<div class="msg ok">Konto utworzone. Link do ustawienia hasła (ważny 7 dni):</div><div class="copybox"><input readonly value="${esc(r.link)}" /><button class="btn btn-sm" type="button">Kopiuj</button></div>`;
      box.querySelector('button').addEventListener('click', () => { navigator.clipboard.writeText(r.link); toast('Skopiowano', 'ok'); });
      f.querySelector('button[type=submit]').disabled = true;
      refreshCurrent();
    } catch (err) { toast(err.message, 'err'); }
  });
});

// ---------------------------------------------------------------- usage
async function loadUsage() {
  const mi = $('#month');
  if (!mi.value) mi.value = new Date().toISOString().slice(0, 7);
  const d = await api(`/api/admin/usage?month=${mi.value}`);
  $('#perUser').innerHTML = d.perUser.length ? d.perUser.map((u) => `<tr class="click" data-user="${u.id}">
    <td><b>${esc(u.name || u.email)}</b><span class="sub">${esc(u.email)}</span></td><td>${esc(u.plan)}</td>
    <td class="num">${u.reports}</td><td class="num">${u.calls}</td><td class="num">${u.reports ? (u.calls / u.reports).toFixed(1) : '—'}</td>
    <td class="num">${fmtNum(u.input)} / ${fmtNum(u.output)}</td><td class="num">${fmtNum(u.cacheRead)}</td>
    <td class="num">${fmtPln(u.costPln, 2)}<span class="sub">${fmtUsd(u.costUsd)}</span></td><td class="num">${fmtPln(u.costPerReportPln, 2)}</td>
    <td class="num">${pct(u.costPln, u.pricePln)}</td><td class="num">${u.errors || 0}</td></tr>`).join('') : '<tr><td colspan="11" class="empty">Brak zużycia w tym miesiącu</td></tr>';
  $('#months').innerHTML = d.months.length ? d.months.map((m) => `<tr><td>${m.month}</td><td class="num">${fmtNum(m.reports)}</td><td class="num">${fmtNum(m.calls)}</td><td class="num">${fmtUsd(m.costUsd)}</td><td class="num">${fmtPln(m.costPln, 2)}</td><td class="num">${m.reports ? fmtPln(m.costPln / m.reports, 2) : '—'}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Brak</td></tr>';
}
$('#month').addEventListener('change', () => loadUsage().catch((e) => toast(e.message, 'err')));

// ---------------------------------------------------------------- payments
async function loadPayments() {
  const d = await api('/api/admin/payments');
  $('#paymentsTable').innerHTML = d.payments.length ? d.payments.map((p) => `<tr class="click" data-user="${p.user_id}"><td>${fmtDateTime(p.ts)}</td><td><b>${esc(p.name || p.email)}</b><span class="sub">${esc(p.email)}</span></td><td>${esc(p.company || '—')}<span class="sub">${esc(p.nip || '')}</span></td><td>${esc(p.plan)}</td><td>${fmtDate(p.period_until)}</td><td>${esc(PROVIDER[p.provider] || p.provider)}</td><td>${esc(p.ref)}</td><td class="num">${fmtPln(p.amount_pln, 2)}</td></tr>`).join('') : '<tr><td colspan="8" class="empty">Brak płatności</td></tr>';
}

// ---------------------------------------------------------------- plans + calculator
function planRow(p) {
  return `<tr data-plan-row>
    <td><input name="id" value="${esc(p.id)}" style="width:90px" ${p.id === 'trial' ? 'readonly' : ''} /></td>
    <td><input name="name" value="${esc(p.name)}" style="width:140px" /></td>
    <td class="num"><input name="pricePln" type="number" min="0" value="${p.pricePln}" style="width:90px" /></td>
    <td class="num"><input name="quota" type="number" min="0" value="${p.quota}" style="width:90px" /></td>
    <td class="num"><input name="devices" type="number" min="1" max="10" value="${p.devices}" style="width:70px" /></td>
    <td><input name="public" type="checkbox" ${p.public ? 'checked' : ''} ${p.id === 'trial' ? 'disabled' : ''} /></td>
    <td><input name="featured" type="checkbox" ${p.featured ? 'checked' : ''} /></td>
    <td><input name="stripePrice" value="${esc(p.stripePrice || '')}" placeholder="price_…" style="width:150px" /></td>
    <td><input name="stripePriceYear" value="${esc(p.stripePriceYear || '')}" placeholder="price_…" style="width:150px" /></td>
    <td>${p.id === 'trial' ? `<input name="days" type="hidden" value="${p.days || 14}" />` : '<button class="btn btn-sm btn-ghost" data-del-plan type="button">✕</button>'}</td></tr>`;
}
function readPlans() {
  return $$('[data-plan-row]').map((r) => {
    const v = (n) => r.querySelector(`[name="${n}"]`);
    return { id: v('id').value, name: v('name').value, pricePln: Number(v('pricePln').value), quota: Number(v('quota').value), devices: Number(v('devices').value), public: v('public').checked, featured: v('featured').checked, stripePrice: v('stripePrice').value, stripePriceYear: v('stripePriceYear').value, ...(v('days') ? { days: Number(v('days').value) } : {}) };
  });
}
function renderCalc() {
  const cost = Number($('#calcCost').value) || 0;
  $('#calc').innerHTML = readPlans().filter((p) => p.id !== 'trial').map((p) => {
    const full = p.quota * cost;
    const half = (p.quota * cost) / 2;
    return `<tr><td>${esc(p.name)}</td><td class="num">${fmtPln(p.pricePln)}</td><td class="num">${fmtPln(full)}</td><td class="num">${fmtPln(p.pricePln - full)} (${pct(p.pricePln - full, p.pricePln)})</td><td class="num">${fmtPln(half)}</td><td class="num">${fmtPln(p.pricePln - half)} (${pct(p.pricePln - half, p.pricePln)})</td></tr>`;
  }).join('');
}
async function loadPlans() {
  plansData = (await api('/api/admin/plans')).plans;
  $('#plansTable').innerHTML = plansData.map(planRow).join('');
  if (!overviewData) overviewData = await api('/api/admin/overview');
  if (!$('#calcCost').value) $('#calcCost').value = (overviewData.ai.costPerReportPln || 0.45).toFixed(2);
  renderCalc();
}
$('#plansTable').addEventListener('input', renderCalc);
$('#plansTable').addEventListener('click', (e) => { if (e.target.closest('[data-del-plan]')) { e.target.closest('tr').remove(); renderCalc(); } });
$('#calcCost').addEventListener('input', renderCalc);
$('#addPlan').addEventListener('click', () => { $('#plansTable').insertAdjacentHTML('beforeend', planRow({ id: 'nowy', name: 'Nowy plan', pricePln: 0, quota: 500, devices: 2, public: false })); renderCalc(); });
$('#savePlans').addEventListener('click', async () => {
  try {
    plansData = (await api('/api/admin/plans', { method: 'PUT', body: { plans: readPlans() } })).plans;
    toast('Plany zapisane — cennik na stronie zaktualizowany', 'ok');
    loadPlans();
  } catch (err) { toast(err.message, 'err'); }
});

// ---------------------------------------------------------------- trial approval
function renderPending(o) {
  const list = o.pending || [];
  $('#pendingCard').hidden = !list.length;
  $('#pendingCount').textContent = list.length;
  const d = o.trialDefaults || { days: 14, reports: 60 };
  $('#pendingRows').innerHTML = list.map((u) => `<tr data-pending="${u.id}">
    <td><b>${esc(u.name || u.email)}</b><span class="sub">${esc(u.email)}</span></td>
    <td>${esc(u.npwz || '—')}<span class="sub">${esc(u.phone || '')}</span></td>
    <td>${fmtDateTime(u.createdAt)}</td>
    <td><input type="number" min="1" max="90" value="${d.days}" data-days aria-label="Dni okresu próbnego" style="width:72px" /></td>
    <td><input type="number" min="1" max="10000" value="${d.reports}" data-reports aria-label="Liczba opisów" style="width:80px" /></td>
    <td style="white-space:nowrap"><button class="btn btn-sm btn-primary" data-approve>Zatwierdź</button> <button class="btn btn-sm btn-ghost" data-reject>Odrzuć</button></td></tr>`).join('');
}
$('#pendingRows').addEventListener('click', async (e) => {
  const row = e.target.closest('[data-pending]');
  if (!row) return;
  const id = row.dataset.pending;
  try {
    if (e.target.closest('[data-approve]')) {
      const days = Number(row.querySelector('[data-days]').value), reports = Number(row.querySelector('[data-reports]').value);
      await api(`/api/admin/users/${id}/approve-trial`, { method: 'POST', body: { days, reports } });
      toast(`Zatwierdzono: ${days} dni, ${reports} opisów — użytkownik dostał e-mail`, 'ok');
    } else if (e.target.closest('[data-reject]')) {
      await api(`/api/admin/users/${id}/reject-trial`, { method: 'POST', body: {} });
      toast('Odrzucono — konto zablokowane', 'info');
    } else return;
    loadDash();
  } catch (err) { toast(err.message, 'err'); }
});

// ---------------------------------------------------------------- settings
async function loadSettings() {
  const { settings: s } = await api('/api/admin/settings');
  const f = $('#settingsForm');
  for (const k of ['usdPln', 'trialDays', 'trialReports', 'graceRatio', 'costAlertRatio', 'graceDaysPastDue', 'annualMonths', 'maxBackgroundCalls', 'bankName', 'bankAccount', 'announcement', 'termsVersion', 'sessionIdleDays', 'auditRetentionDays', 'outboxRetentionDays']) f[k].value = s[k] ?? '';
  f.registrationOpen.checked = s.registrationOpen;
  f.requireNpwz.checked = s.requireNpwz !== false;
  f.trialApproval.checked = s.trialApproval !== false;
  f.globalLearning.checked = s.globalLearning;
  f.itShowUsage.checked = s.itShowUsage;
}
$('#settingsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api('/api/admin/settings', { method: 'PUT', body: { usdPln: Number(f.usdPln.value), trialDays: Number(f.trialDays.value), trialReports: Number(f.trialReports.value), trialApproval: f.trialApproval.checked, graceRatio: Number(f.graceRatio.value), costAlertRatio: Number(f.costAlertRatio.value), graceDaysPastDue: Number(f.graceDaysPastDue.value), annualMonths: Number(f.annualMonths.value), maxBackgroundCalls: Number(f.maxBackgroundCalls.value), bankName: f.bankName.value, bankAccount: f.bankAccount.value, registrationOpen: f.registrationOpen.checked, requireNpwz: f.requireNpwz.checked, announcement: f.announcement.value, termsVersion: f.termsVersion.value, sessionIdleDays: Number(f.sessionIdleDays.value), auditRetentionDays: Number(f.auditRetentionDays.value), outboxRetentionDays: Number(f.outboxRetentionDays.value), globalLearning: f.globalLearning.checked, itShowUsage: f.itShowUsage.checked } });
    toast('Ustawienia zapisane', 'ok');
  } catch (err) { toast(err.message, 'err'); }
});

// ---------------------------------------------------------------- organisations
const ORG_STATUS = { trial: 'okres próbny', active: 'aktywna', suspended: 'wstrzymana' };
function orgPill(o) {
  if (o.status === 'suspended') return '<span class="pill err">wstrzymana</span>';
  if (!o.access) return '<span class="pill err">wygasła</span>';
  return o.status === 'trial' ? '<span class="pill info">okres próbny</span>' : '<span class="pill ok">aktywna</span>';
}
let orgPlans = [];
async function loadOrgs() {
  const d = await api('/api/admin/orgs');
  orgsList = d.orgs;
  orgPlans = d.plans;
  $('#orgs').innerHTML = d.orgs.length ? d.orgs.map((o) => `<tr>
      <td><b>${esc(o.name)}</b><span class="sub">${o.nip ? `NIP ${esc(o.nip)} · ` : ''}${esc(o.contact || 'brak kontaktu IT')}</span></td>
      <td>${orgPill(o)}</td>
      <td>${fmtDate(o.subUntil)}${o.access ? ` <span class="dim small">(${daysLeft(o.subUntil)} d)</span>` : ''}</td>
      <td class="num">${o.seatsUsed} / ${o.seats}</td>
      <td class="num">${o.activeUsers}</td>
      <td class="num">${fmtNum(o.reports)}</td>
      <td class="num">${fmtPln(o.costPln, 2)}</td>
      <td class="num">${o.revenuePln ? fmtPln(o.revenuePln) : '—'}</td>
      <td class="num">${o.revenuePln ? fmtPln(o.marginPln) : '—'}</td>
      <td class="num" style="white-space:nowrap"><a class="btn btn-sm" href="/it?org=${o.id}">Konsola IT</a> <button class="btn btn-sm" data-org="${o.id}">Edytuj</button></td></tr>`).join('')
    : '<tr><td colspan="10" class="empty">Brak organizacji — kliknij „+ Nowa organizacja”.</td></tr>';
}

function orgForm(o = null) {
  const planOpts = orgPlans.map((p) => `<option value="${esc(p.id)}"${(o ? o.plan : 'pro') === p.id ? ' selected' : ''}>${esc(p.name)} (${p.quota} opisów)</option>`).join('');
  const until = o ? new Date(o.subUntil).toISOString().slice(0, 10) : '';
  return `
    <div class="row"><div class="field"><label>Nazwa</label><input name="name" required value="${esc(o?.name || '')}" /></div><div class="field" style="flex:0 1 160px"><label>NIP</label><input name="nip" value="${esc(o?.nip || '')}" /></div></div>
    <div class="row">
      <div class="field"><label>Miejsca (konta)</label><input name="seats" type="number" min="1" max="5000" value="${o?.seats ?? 10}" /></div>
      <div class="field"><label>Cena netto / miejsce / mies. (zł)</label><input name="pricePerSeat" type="number" min="0" step="1" value="${o?.pricePerSeat ?? 0}" /></div>
      <div class="field"><label>Urządzenia na osobę</label><input name="devices" type="number" min="1" max="10" value="${o?.devices ?? 2}" /></div>
    </div>
    <div class="row">
      <div class="field"><label>Status</label><select name="status">${Object.entries(ORG_STATUS).map(([k, v]) => `<option value="${k}"${(o?.status || 'trial') === k ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
      ${o ? `<div class="field"><label>Licencja do</label><input name="until" type="date" value="${until}" /></div>` : '<div class="field"><label>Okres próbny / licencja (dni)</label><input name="days" type="number" min="1" value="14" /></div>'}
    </div>
    <div class="row">
      <div class="field"><label>Limit opisów z planu</label><select name="plan">${planOpts}</select></div>
      <div class="field"><label>…albo własny limit / osobę / mies.</label><input name="quotaPerUser" type="number" min="0" value="${o?.quotaOverride ?? ''}" placeholder="z planu" /></div>
    </div>
    <div class="field"><label>Kontakt IT (widoczny dla radiologów)</label><input name="contact" value="${esc(o?.contact || '')}" placeholder="np. it@firma.pl, tel. 22 000 00 00" /></div>
    <div class="field"><label>Notatka (tylko dla Ciebie)</label><textarea name="note">${esc(o?.note || '')}</textarea></div>`;
}
const orgBody = (f) => ({
  name: f.name.value, nip: f.nip.value, seats: Number(f.seats.value), pricePerSeat: Number(f.pricePerSeat.value), devices: Number(f.devices.value),
  status: f.status.value, plan: f.plan.value, quotaPerUser: f.quotaPerUser.value === '' ? null : Number(f.quotaPerUser.value), contact: f.contact.value, note: f.note.value,
});

$('#addOrg').addEventListener('click', async () => {
  if (!orgPlans.length) await loadOrgs();
  const m = $('#modal');
  m.innerHTML = `<div class="drawer-head"><h2>Nowa organizacja</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <form id="orgNew">${orgForm()}
      <h3>Pierwszy administrator IT <span class="faint small">(opcjonalnie)</span></h3>
      <div class="row"><div class="field"><label>E-mail</label><input name="itEmail" type="email" /></div><div class="field"><label>Imię i nazwisko</label><input name="itName" /></div></div>
      <button class="btn btn-primary" type="submit">Utwórz</button>
    </form><div id="orgOut" style="margin-top:12px"></div>`;
  $('#overlay').hidden = false;
  m.hidden = false;
  m.querySelector('[data-close]').addEventListener('click', closeLayers);
  $('#orgNew').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const d = await api('/api/admin/orgs', { method: 'POST', body: { ...orgBody(f), days: Number(f.days.value), itEmail: f.itEmail.value, itName: f.itName.value } });
      orgsList = null;
      f.hidden = true;
      $('#orgOut').innerHTML = `<div class="msg ok">Utworzono: <b>${esc(d.org.name)}</b> (${d.org.seats} miejsc, do ${fmtDate(d.org.subUntil)}).</div>${d.it ? `<p>Dane logowania administratora IT — <b>pokazywane tylko teraz</b>:</p><pre class="cred mono">Adres: ${esc(location.origin)}/login
E-mail: ${esc(d.it.email)}
Hasło tymczasowe: ${esc(d.it.tempPassword)}</pre>` : ''}<div class="actions"><a class="btn btn-sm btn-primary" href="/it?org=${d.org.id}">Otwórz konsolę IT</a><button class="btn btn-sm" data-close>Zamknij</button></div>`;
      $('#orgOut').querySelector('[data-close]').addEventListener('click', closeLayers);
      loadOrgs();
    } catch (err) { toast(err.message, 'err', 6000); }
  });
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-org]');
  if (!b) return;
  const o = (orgsList || []).find((x) => x.id === Number(b.dataset.org));
  if (!o) return;
  const m = $('#modal');
  m.innerHTML = `<div class="drawer-head"><div><h2>${esc(o.name)}</h2><div class="dim small">${o.seatsUsed} / ${o.seats} miejsc · ${fmtNum(o.reports)} opisów w tym miesiącu</div></div><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <div class="actions" style="margin-bottom:14px">
      <button class="btn btn-sm btn-primary" data-ext="1">Przedłuż o 1 miesiąc</button>
      <button class="btn btn-sm" data-ext="12">o 12 miesięcy</button>
      <a class="btn btn-sm" href="/it?org=${o.id}">Konsola IT</a>
    </div>
    <form id="orgEdit">${orgForm(o)}<div class="actions"><button class="btn btn-primary" type="submit">Zapisz</button><span class="grow"></span><button class="btn btn-sm btn-danger" type="button" id="orgDel">Usuń organizację</button></div></form>`;
  $('#overlay').hidden = false;
  m.hidden = false;
  m.querySelector('[data-close]').addEventListener('click', closeLayers);
  for (const x of m.querySelectorAll('[data-ext]')) {
    x.addEventListener('click', async () => {
      try {
        const d = await api(`/api/admin/orgs/${o.id}/extend`, { method: 'POST', body: { months: Number(x.dataset.ext) } });
        toast(`Licencja aktywna do ${fmtDate(d.org.subUntil)}`, 'ok');
        closeLayers(); loadOrgs();
      } catch (err) { toast(err.message, 'err'); }
    });
  }
  $('#orgEdit').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const body = orgBody(f);
    if (f.until.value) body.subUntil = Date.parse(`${f.until.value}T23:59:59`);
    try {
      await api(`/api/admin/orgs/${o.id}`, { method: 'PATCH', body });
      toast('Zapisano', 'ok');
      closeLayers(); loadOrgs();
    } catch (err) { toast(err.message, 'err', 6000); }
  });
  $('#orgDel').addEventListener('click', async () => {
    if (!window.confirm(`Usunąć organizację ${o.name}? (Możliwe tylko, gdy nie ma kont.)`)) return;
    try {
      await api(`/api/admin/orgs/${o.id}`, { method: 'DELETE' });
      toast('Usunięto', 'ok');
      closeLayers(); loadOrgs();
    } catch (err) { toast(err.message, 'err', 6000); }
  });
});

// ---------------------------------------------------------------- central learning
const KIND = {
  style_pair: 'Poprawki sformułowań', concl_removed: 'Usunięte z wniosków', concl_added: 'Dodane do wniosków', restored: 'Przywrócone zdania szablonu',
  example_report: 'Wzorcowe opisy', en_pl: 'Pary EN → PL', rule: 'Reguły stylu (osobiste)', phrase: 'Ulubione sformułowania', glossary: 'Słownik EN → PL',
  sample: 'Wklejone własne opisy', answer: 'Odpowiedzi na pytania AI',
};
const VSTATUS = { draft: '<span class="pill warn">szkic</span>', published: '<span class="pill ok">opublikowana — działa</span>', archived: '<span class="pill">archiwalna</span>' };
async function loadLearning() {
  const d = await api('/api/admin/learning');
  const st = d.stats;
  $('#lkpis').innerHTML = [
    kpi('Lekcje w archiwum', fmtNum(st.items), `${fmtNum(st.lastWeek)} nowych w 7 dni · od ${fmtDate(st.firstAt)}`),
    kpi('Radiolodzy uczący AI', fmtNum(st.contributors), `${fmtNum(st.organisations)} organizacji · ${fmtNum(st.templates)} szablonów`),
    kpi('Wiedza globalna', d.publishedId ? `wersja ${d.publishedId}` : '—', d.enabled ? (d.publishedId ? 'używana w każdym opisie' : 'brak opublikowanej wersji') : 'wyłączona w ustawieniach', d.publishedId && d.enabled ? 'good' : ''),
    kpi('Opisy z wiedzą globalną', fmtNum(d.aiCallsWithGlobal), 'zapytania AI (ślad: która wersja)'),
  ].join('');
  $('#lkinds').innerHTML = st.byKind.length ? st.byKind.map((k) => `<tr><td>${esc(KIND[k.kind] || k.kind)}</td><td class="num">${fmtNum(k.items)}</td><td class="num">${fmtNum(k.shared)}</td><td class="num">${fmtNum(k.seen)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">Archiwum jest puste — lekcje pojawią się, gdy radiolodzy zaczną poprawiać opisy.</td></tr>';
  $('#lversions').innerHTML = d.versions.length ? d.versions.map((v) => `<tr><td>${v.id}</td><td>${fmtDateTime(v.created_at)}${v.note ? `<span class="sub">${esc(v.note)}</span>` : ''}</td><td>${v.method === 'ai' ? 'AI' : 'liczby'}<span class="sub">≥${v.stats.minContributors} radiologów</span></td><td>${VSTATUS[v.status] || v.status}</td><td class="num"><button class="btn btn-sm" data-version="${v.id}">Otwórz</button></td></tr>`).join('') : '<tr><td colspan="5" class="empty">Brak wersji</td></tr>';
}
$('#lnew').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const b = f.querySelector('button');
  b.disabled = true;
  b.textContent = f.method.value === 'ai' ? 'AI analizuje lekcje… (do 2 min)' : 'Liczenie…';
  try {
    const d = await api('/api/admin/learning/versions', { method: 'POST', body: { method: f.method.value, minContributors: Number(f.minContributors.value), minOrgs: Number(f.minOrgs.value), note: f.note.value } });
    toast(`Utworzono szkic wersji ${d.version.id}`, 'ok');
    await loadLearning();
    openVersion(d.version.id);
  } catch (err) { toast(err.message, 'err', 7000); } finally { b.disabled = false; b.textContent = 'Utwórz szkic'; }
});
$('#lunpub').addEventListener('click', async () => {
  if (!window.confirm('Wyłączyć wiedzę globalną? AI będzie używać tylko osobistego stylu radiologów (wersje zostają w archiwum).')) return;
  await api('/api/admin/learning/unpublish', { method: 'POST', body: {} });
  toast('Wiedza globalna wyłączona', 'ok');
  loadLearning();
});
const SECTIONS = [
  ['general_rules', 'Reguły ogólne', (x) => esc(x)],
  ['phrasing', 'Sformułowania (zamiast → pisz)', (x) => `<del>${esc(x.from)}</del> → <b>${esc(x.to)}</b>`],
  ['avoid_in_conclusion', 'Nie wpisuj do wniosków', (x) => esc(x)],
  ['keep_statements', 'Nie usuwaj zdań szablonu', (x) => esc(x)],
  ['glossary', 'Słownik EN → PL', (x) => `${esc(x.en)} → <b>${esc(x.pl)}</b>`],
];
document.addEventListener('click', (e) => { const b = e.target.closest('[data-version]'); if (b) openVersion(Number(b.dataset.version)); });
async function openVersion(id) {
  const { version: v } = await api(`/api/admin/learning/versions/${id}`);
  const c = v.content;
  const draft = v.status === 'draft';
  const item = (key, i, html) => `<li>${draft ? `<label class="check"><input type="checkbox" data-keep="${key}:${i}" checked /> <span>${html}</span></label>` : html}</li>`;
  const tpl = Object.entries(c.template_rules || {});
  const dr = $('#drawer');
  dr.innerHTML = `<div class="drawer-head"><div><h2>Wiedza globalna — wersja ${v.id}</h2><div class="dim small">${fmtDateTime(v.created_at)} · ${v.method === 'ai' ? 'analiza AI' : 'same liczby'} · lekcje od ≥${v.stats.minContributors} radiologów · ${VSTATUS[v.status]}</div></div><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    ${c.summary ? `<div class="msg info">${esc(c.summary)}</div>` : ''}
    ${draft ? '<p class="dim small">Odznacz wszystko, czego nie chcesz w wiedzy globalnej, potem „Zapisz” i „Opublikuj”. Opublikowane wersje są niezmienne (ślad zmian).</p>' : ''}
    ${SECTIONS.map(([key, title, fmt]) => (c[key]?.length ? `<h3>${title} (${c[key].length})</h3><ul class="vlist">${c[key].map((x, i) => item(key, i, fmt(x))).join('')}</ul>` : '')).join('')}
    ${tpl.length ? `<h3>Reguły dla szablonów (${tpl.length})</h3>${tpl.map(([tid, rules]) => `<div class="small"><b class="mono">${esc(tid)}</b><ul class="vlist">${rules.map((r, i) => item(`tpl:${tid}`, i, esc(r))).join('')}</ul></div>`).join('')}` : ''}
    <div class="actions" style="margin-top:16px">${draft ? '<button class="btn" id="vsave">Zapisz zmiany szkicu</button><button class="btn btn-primary" id="vpub">Opublikuj (działa od razu dla wszystkich)</button>' : v.status === 'archived' ? '<button class="btn btn-primary" id="vpub">Przywróć tę wersję (opublikuj ponownie)</button>' : ''}</div>
    <h3>Statystyki źródłowe</h3><pre class="cred mono small">${esc(JSON.stringify(v.stats.shared || {}, null, 1))}</pre>`;
  $('#overlay').hidden = false;
  dr.hidden = false;
  dr.scrollTop = 0;
  dr.querySelector('[data-close]').addEventListener('click', closeLayers);
  const collect = () => {
    const keep = new Set([...dr.querySelectorAll('[data-keep]')].filter((x) => x.checked).map((x) => x.dataset.keep));
    const out = { ...c, template_rules: [] };
    for (const [key] of SECTIONS) out[key] = (c[key] || []).filter((_, i) => keep.has(`${key}:${i}`));
    out.template_rules = tpl.map(([tid, rules]) => ({ template_id: tid, rules: rules.filter((_, i) => keep.has(`tpl:${tid}:${i}`)) }));
    return out;
  };
  $('#vsave')?.addEventListener('click', async () => {
    try { await api(`/api/admin/learning/versions/${id}`, { method: 'PATCH', body: { content: collect() } }); toast('Zapisano szkic', 'ok'); openVersion(id); } catch (err) { toast(err.message, 'err'); }
  });
  $('#vpub')?.addEventListener('click', async () => {
    if (!window.confirm('Opublikować tę wersję? Od teraz będzie używana w każdym opisie wszystkich użytkowników (poprzednia trafi do archiwum).')) return;
    try {
      if (draft) await api(`/api/admin/learning/versions/${id}`, { method: 'PATCH', body: { content: collect() } });
      await api(`/api/admin/learning/versions/${id}`, { method: 'POST', body: {} });
      toast('Opublikowano', 'ok');
      closeLayers();
      loadLearning();
    } catch (err) { toast(err.message, 'err'); }
  });
}

// ---------------------------------------------------------------- tickets
async function loadTickets() {
  const d = await api('/api/admin/tickets');
  const open = d.tickets.filter((t) => t.status !== 'closed').length;
  $('#ticketCount').hidden = !open;
  $('#ticketCount').textContent = open;
  $('#ticketList').innerHTML = d.tickets.length ? d.tickets.map((t) => `<details class="log-row"${t.status !== 'closed' ? ' open' : ''}><summary><b>${esc(t.subject)}</b> <span class="pill ${t.status === 'closed' ? 'ok' : 'warn'}">${t.status === 'closed' ? 'zamknięte' : 'otwarte'}</span> <span class="dim">${esc(t.org || '')} · ${esc(t.author || '')} · ${fmtDateTime(t.ts)}</span></summary>
      <p style="white-space:pre-wrap">${esc(t.body)}</p>
      <form data-ticket="${t.id}"><div class="field"><label>Odpowiedź (widzi ją dział IT)</label><textarea name="answer" rows="3">${esc(t.answer)}</textarea></div>
      <div class="actions"><button class="btn btn-sm" name="status" value="open">Zapisz</button><button class="btn btn-sm btn-primary" name="status" value="closed">Zapisz i zamknij</button></div></form></details>`).join('') : '<p class="dim">Brak zgłoszeń.</p>';
  for (const f of $$('[data-ticket]')) {
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await api(`/api/admin/tickets/${f.dataset.ticket}`, { method: 'PATCH', body: { answer: f.answer.value, status: e.submitter?.value || 'open' } }); toast('Zapisano', 'ok'); loadTickets(); } catch (err) { toast(err.message, 'err'); }
    });
  }
}

// ---------------------------------------------------------------- log
async function loadLog() {
  const [a, o] = await Promise.all([api('/api/admin/audit'), api('/api/admin/outbox')]);
  $('#audit').innerHTML = a.audit.map((x) => `<tr${x.target_id ? ` class="click" data-user="${x.target_id}"` : ''}><td>${fmtDateTime(x.ts)}</td><td>${esc(x.actor || 'system')}</td><td><b>${esc(x.action)}</b></td><td>${esc(x.target || '')}</td><td style="white-space:normal">${esc(x.detail)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">Brak</td></tr>';
  $('#outbox').innerHTML = o.outbox.map((m) => `<details><summary><span>${esc(m.subject)}<span class="sub dim">${esc(m.to_addr)} · ${fmtDateTime(m.ts)}</span></span><span class="pill ${m.status === 'sent' ? 'ok' : m.status === 'logged' ? '' : 'err'}">${esc(m.status === 'logged' ? 'nie wysłano (brak poczty)' : m.status)}</span></summary><p style="white-space:pre-wrap">${esc(m.body)}</p></details>`).join('') || '<p class="dim">Brak wiadomości</p>';
}

window.addEventListener('hashchange', () => { const t = location.hash.slice(1); if (t in loaders) openTab(t); });
brand();
const start = location.hash.slice(1);
openTab(start in loaders ? start : 'dash');

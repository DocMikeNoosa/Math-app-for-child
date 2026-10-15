// IT console for an organisation's IT administrator: seats, users (add, bulk import with temporary passwords,
// block, new temporary password, log out everywhere, delete), change log. The service owner opens it with ?org=ID.
import { $, $$, api, brand, esc, toast, fmtDate, fmtDateTime, fmtNum, daysLeft } from './common.js';

brand();
const ORG = new URLSearchParams(location.search).get('org');
const q = (path) => (ORG ? `${path}${path.includes('?') ? '&' : '?'}org=${encodeURIComponent(ORG)}` : path);
let data = null;

const ROLE = { user: 'radiolog', orgadmin: 'IT' };
const STATUS = { trial: 'okres próbny', active: 'aktywna', suspended: 'wstrzymana' };

// ---------------------------------------------------------------- tabs
const loaders = { people: load, problems: loadProblems, log: loadLog };
function openTab(name) {
  for (const b of $$('.admin-tabs button')) b.setAttribute('aria-selected', String(b.dataset.tab === name));
  for (const p of $$('[data-panel]')) p.hidden = p.dataset.panel !== name;
  loaders[name]?.().catch((err) => toast(err.message, 'err'));
}
for (const b of $$('.admin-tabs button')) b.addEventListener('click', () => openTab(b.dataset.tab));

// ---------------------------------------------------------------- overview + people
function kpi(label, value, note = '', cls = '') {
  return `<div class="kpi"><div class="label">${esc(label)}</div><div class="value ${cls}">${value}</div><div class="note">${note}</div></div>`;
}

async function load() {
  data = await api(q('/api/it/overview'));
  const o = data.org;
  $('#orgName').textContent = o.name;
  $('#ownerLink').hidden = !data.owner;
  $('#csvLink').href = q('/api/it/export/users.csv');
  $('#helpDevices').textContent = o.devices;
  const left = daysLeft(o.subUntil);
  const pill = !o.access ? '<span class="pill err">brak dostępu</span>' : o.status === 'trial' ? '<span class="pill info">okres próbny</span>' : '<span class="pill ok">licencja aktywna</span>';
  $('#orgLine').innerHTML = `${pill} <span>${o.access ? `do ${fmtDate(o.subUntil)} (${left} ${left === 1 ? 'dzień' : 'dni'})` : `status: ${esc(STATUS[o.status] || o.status)}, do ${fmtDate(o.subUntil)}`}</span> · limit ${fmtNum(o.quotaPerUser)} opisów / osobę / miesiąc`;
  const pct = o.seats ? Math.min(100, Math.round((o.seatsUsed / o.seats) * 100)) : 0;
  $('#seatBox').innerHTML = `<div class="seat-num"><b>${o.seatsUsed}</b> / ${o.seats}</div><div class="dim small">zajęte miejsca w licencji</div><div class="meter${pct >= 100 ? ' err' : pct >= 90 ? ' warn' : ''}"><i style="width:${pct}%"></i></div>`;
  const notice = $('#notice');
  if (!o.access) { notice.className = 'msg err'; notice.textContent = 'Licencja organizacji nie jest aktywna — radiolodzy nie mogą teraz pracować. Skontaktuj się z dostawcą usługi.'; notice.hidden = false; }
  else if (left <= 7) { notice.className = 'msg info'; notice.textContent = `Licencja kończy się ${fmtDate(o.subUntil)} — skontaktuj się z dostawcą usługi, aby ją przedłużyć.`; notice.hidden = false; }
  else notice.hidden = true;

  const users = data.users;
  const active = users.filter((u) => !u.blocked);
  const working = users.filter((u) => u.reports > 0).length;
  const pending = active.filter((u) => u.mustChangePwd).length;
  const reports = users.reduce((s, u) => s + u.reports, 0);
  for (const th of $$('[data-usage]')) th.hidden = !data.showUsage;
  $('#kpis').innerHTML = [
    kpi('Wolne miejsca', fmtNum(o.seatsFree), `${o.seatsUsed} zajętych z ${o.seats}`, o.seatsFree ? '' : 'bad'),
    kpi('Aktywne konta', fmtNum(active.length), `${users.length - active.length} zablokowanych`),
    data.showUsage ? kpi('Opisy w tym miesiącu', fmtNum(reports), working ? `${working} osób pracuje · śr. ${Math.round(reports / working)} na osobę` : '—') : '',
    kpi('Czekają na 1. logowanie', fmtNum(pending), pending ? 'mają jeszcze hasło tymczasowe' : 'wszyscy ustawili hasło', pending ? '' : 'good'),
  ].join('');
  loadProblems(true).catch(() => {});
  renderPeople();
}

function statusOf(u) {
  if (u.blocked) return '<span class="pill err">zablokowany</span>';
  if (u.mustChangePwd) return '<span class="pill warn">czeka na 1. logowanie</span>';
  return '<span class="pill ok">aktywny</span>';
}

function renderPeople() {
  const text = $('#q').value.trim().toLowerCase();
  const f = $('#filter').value;
  const list = data.users.filter((u) => {
    if (text && !`${u.name} ${u.email} ${u.npwz}`.toLowerCase().includes(text)) return false;
    if (f === 'active') return !u.blocked && !u.mustChangePwd;
    if (f === 'pending') return !u.blocked && u.mustChangePwd;
    if (f === 'idle') return !u.blocked && !u.reports;
    if (f === 'blocked') return u.blocked;
    if (f === 'it') return u.role === 'orgadmin';
    return true;
  });
  $('#people').innerHTML = list.length ? list.map((u) => `<tr>
      <td><b>${esc(u.name || '—')}</b>${u.id === data.me ? ' <span class="pill info">Ty</span>' : ''}<span class="sub">${esc(u.email)}</span></td>
      <td class="mono">${esc(u.npwz || '—')}</td>
      <td>${u.role === 'orgadmin' ? '<span class="pill info">IT</span>' : 'radiolog'}</td>
      <td>${statusOf(u)}</td>
      ${data.showUsage ? `<td class="num">${fmtNum(u.reports)}</td>` : ''}
      <td>${u.lastSeen ? fmtDateTime(u.lastSeen) : u.lastLogin ? fmtDateTime(u.lastLogin) : '<span class="faint">nigdy</span>'}</td>
      <td class="num">${u.devices}</td>
      <td class="num"><button class="btn btn-sm" data-user="${u.id}" aria-label="Działania: ${esc(u.name || u.email)}">⋯ Działania</button></td></tr>`).join('')
    : `<tr><td colspan="8" class="empty">${data.users.length ? 'Nikt nie pasuje do filtra' : 'Brak użytkowników — dodaj pierwszą osobę albo zaimportuj listę.'}</td></tr>`;
  $('#peopleNote').textContent = `${list.length} z ${data.users.length} osób · miesiąc ${data.month}`;
}
$('#q').addEventListener('input', renderPeople);
$('#filter').addEventListener('change', renderPeople);

// ---------------------------------------------------------------- modal helpers
function closeModal() { $('#modal').hidden = true; $('#overlay').hidden = true; }
$('#overlay').addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
function openModal(html) {
  const m = $('#modal');
  m.innerHTML = html;
  m.hidden = false;
  $('#overlay').hidden = false;
  m.querySelector('[data-close]')?.addEventListener('click', closeModal);
  m.querySelector('input, select, textarea, button:not([data-close])')?.focus();
  return m;
}

const loginUrl = () => `${location.origin}/login`;
function credentialsText(list) {
  return list.map((c) => `${c.name ? `${c.name}\n` : ''}Adres: ${loginUrl()}\nE-mail: ${c.email}\nHasło tymczasowe: ${c.tempPassword}`).join('\n\n');
}
function credentialsBox(list, note = '') {
  return `<div class="cred-box">
      <div class="msg ok" style="margin-bottom:10px">Hasło tymczasowe jest pokazywane <b>tylko teraz</b>. Przekaż je osobie (np. telefonicznie albo w zaszyfrowanej wiadomości). ${note}</div>
      <pre class="cred mono">${esc(credentialsText(list))}</pre>
      <div class="actions"><button class="btn btn-sm btn-primary" data-copy>Skopiuj</button>${list.length > 1 ? '<button class="btn btn-sm" data-dl>Pobierz CSV z hasłami</button>' : ''}<button class="btn btn-sm btn-ghost" data-close>Zamknij</button></div>
    </div>`;
}
function wireCredentials(m, list) {
  m.querySelector('[data-copy]')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(credentialsText(list)); toast('Skopiowano', 'ok'); } catch { toast('Nie udało się skopiować — zaznacz tekst ręcznie.', 'err'); }
  });
  m.querySelector('[data-dl]')?.addEventListener('click', () => {
    const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['email', 'imie_nazwisko', 'pwz', 'haslo_tymczasowe', 'adres'], ...list.map((c) => [c.email, c.name, c.npwz, c.tempPassword, loginUrl()])];
    const blob = new Blob([`﻿${rows.map((r) => r.map(cell).join(';')).join('\n')}\n`], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hasla-tymczasowe-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  });
  m.querySelector('[data-close]')?.addEventListener('click', closeModal);
}

// ---------------------------------------------------------------- add one person
$('#addBtn').addEventListener('click', () => {
  if (data && data.org.seatsFree <= 0) return toast('Brak wolnych miejsc w licencji — zablokuj nieużywane konto albo poproś o więcej miejsc.', 'err', 6000);
  const m = openModal(`
    <div class="drawer-head"><h2>Dodaj osobę</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <form id="addForm">
      <div class="field"><label for="aEmail">E-mail (login)</label><input id="aEmail" name="email" type="email" required autocomplete="off" /></div>
      <div class="row"><div class="field"><label for="aName">Imię i nazwisko</label><input id="aName" name="name" /></div><div class="field" style="flex:0 1 150px"><label for="aNpwz">PWZ</label><input id="aNpwz" name="npwz" inputmode="numeric" /></div></div>
      <div class="field"><label for="aRole">Rola</label><select id="aRole" name="role"><option value="user">radiolog</option><option value="orgadmin">administrator IT (zarządza kontami, może też dyktować)</option></select></div>
      ${data.mail ? '<div class="field"><label class="check"><input type="checkbox" name="sendEmail" checked /> Wyślij dane logowania e-mailem</label></div>' : '<p class="dim small">Wysyłka e-mail nie jest skonfigurowana — przekaż dane logowania samodzielnie.</p>'}
      <button class="btn btn-primary" type="submit">Utwórz konto</button>
    </form>`);
  m.querySelector('#addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    f.querySelector('button[type=submit]').disabled = true;
    try {
      const d = await api(q('/api/it/users'), { method: 'POST', body: { email: f.email.value, name: f.name.value, npwz: f.npwz.value, role: f.role.value, sendEmail: Boolean(f.sendEmail?.checked) } });
      const c = [{ email: d.user.email, name: d.user.name, npwz: f.npwz.value, tempPassword: d.tempPassword }];
      wireCredentials(openModal(`<div class="drawer-head"><h2>Konto utworzone</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>${credentialsBox(c, d.mailed ? 'Dane zostały też wysłane e-mailem.' : '')}`), c);
      load();
    } catch (err) {
      toast(err.message, 'err', 6000);
      f.querySelector('button[type=submit]').disabled = false;
    }
  });
});

// ---------------------------------------------------------------- bulk import
$('#importBtn').addEventListener('click', () => {
  const m = openModal(`
    <div class="drawer-head"><h2>Import listy osób</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <p class="dim small">Wklej listę z Excela albo wybierz plik CSV. Jedna osoba w wierszu: <b>e-mail</b>, imię i nazwisko, PWZ (kolejność dowolna, separator: średnik, przecinek lub tabulator). Wpisz „IT” w wierszu, aby nadać rolę administratora IT. Wiersz nagłówka jest pomijany.</p>
    <div class="field"><textarea id="impText" rows="9" placeholder="jan.kowalski@firma.pl;Jan Kowalski;1234567&#10;anna.nowak@firma.pl;Anna Nowak;7654321"></textarea></div>
    <div class="field"><label for="impFile">…albo plik (.csv, .txt)</label><input id="impFile" type="file" accept=".csv,.txt,text/csv,text/plain" /></div>
    <p class="small" id="impCount">Na liście: 0 osób · wolnych miejsc: ${data.org.seatsFree}</p>
    ${data.mail ? '<div class="field"><label class="check"><input type="checkbox" id="impMail" /> Wyślij każdej osobie dane logowania e-mailem</label></div>' : ''}
    <div class="actions"><button class="btn btn-primary" id="impGo" disabled>Importuj</button></div>`);
  const ta = m.querySelector('#impText');
  const count = () => {
    const n = ta.value.split('\n').filter((l) => /@/.test(l)).length;
    m.querySelector('#impCount').innerHTML = `Na liście: <b>${n}</b> ${n === 1 ? 'osoba' : 'osób'} · wolnych miejsc: <b>${data.org.seatsFree}</b>${n > data.org.seatsFree ? ' — <span class="pill warn">nadmiarowe osoby zostaną pominięte</span>' : ''}`;
    m.querySelector('#impGo').disabled = !n;
  };
  ta.addEventListener('input', count);
  m.querySelector('#impFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 250_000) return toast('Plik jest za duży (maks. 250 KB).', 'err');
    ta.value = await file.text();
    count();
  });
  m.querySelector('#impGo').addEventListener('click', async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Tworzenie kont…';
    try {
      const d = await api(q('/api/it/import'), { method: 'POST', body: { text: ta.value, sendEmail: Boolean(m.querySelector('#impMail')?.checked) } });
      const skipped = d.skipped.length ? `<h3>Pominięto (${d.skipped.length})</h3><div class="table-wrap"><table><thead><tr><th>E-mail</th><th>Powód</th></tr></thead><tbody>${d.skipped.map((s) => `<tr><td>${esc(s.email)}</td><td>${esc(s.reason)}</td></tr>`).join('')}</tbody></table></div>` : '';
      const r = openModal(`<div class="drawer-head"><h2>Utworzono ${d.created.length} ${d.created.length === 1 ? 'konto' : 'kont'}</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
        ${d.created.length ? credentialsBox(d.created, d.mailed ? `Wysłano ${d.mailed} e-maili.` : 'Pobierz CSV — zawiera hasła wszystkich osób.') : '<p>Nie utworzono żadnego konta.</p><div class="actions"><button class="btn btn-sm" data-close>Zamknij</button></div>'}${skipped}`);
      wireCredentials(r, d.created);
      load();
    } catch (err) {
      toast(err.message, 'err', 6000);
      e.target.disabled = false;
      e.target.textContent = 'Importuj';
    }
  });
});

// ---------------------------------------------------------------- one person's actions
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-user]');
  if (b) openPerson(Number(b.dataset.user));
});

function openPerson(id) {
  const u = data.users.find((x) => x.id === id);
  if (!u) return;
  const self = u.id === data.me;
  const m = openModal(`
    <div class="drawer-head"><div><h2>${esc(u.name || u.email)}</h2><div class="dim small">${esc(u.email)} · konto od ${fmtDate(u.createdAt)}${data.showUsage ? ` · ${fmtNum(u.reports)} opisów w tym miesiącu` : ''}</div></div><button class="btn btn-sm btn-ghost" data-close>✕</button></div>
    <form id="editForm">
      <div class="row"><div class="field"><label for="eName">Imię i nazwisko</label><input id="eName" name="name" value="${esc(u.name)}" /></div><div class="field" style="flex:0 1 150px"><label for="eNpwz">PWZ</label><input id="eNpwz" name="npwz" value="${esc(u.npwz)}" /></div></div>
      <div class="field"><label for="eEmail">E-mail (login)</label><input id="eEmail" name="email" type="email" value="${esc(u.email)}" /></div>
      <div class="field"><label for="eRole">Rola</label><select id="eRole" name="role"${self ? ' disabled' : ''}><option value="user"${u.role === 'user' ? ' selected' : ''}>radiolog</option><option value="orgadmin"${u.role === 'orgadmin' ? ' selected' : ''}>administrator IT</option></select></div>
      <button class="btn" type="submit">Zapisz zmiany</button>
    </form>
    <h3>Działania</h3>
    <div class="action-list">
      <button class="btn btn-sm" data-act="temp">Nowe hasło tymczasowe<small>gdy ktoś zapomniał hasła — wyloguje go wszędzie</small></button>
      <button class="btn btn-sm" data-act="logout">Wyloguj ze wszystkich urządzeń<small>np. zgubiony laptop, wspólny komputer</small></button>
      ${self ? '' : `<button class="btn btn-sm ${u.blocked ? '' : 'btn-danger'}" data-act="block">${u.blocked ? 'Odblokuj' : 'Zablokuj'}<small>${u.blocked ? 'przywraca dostęp (zajmuje miejsce w licencji)' : 'dostęp kończy się od razu, miejsce się zwalnia'}</small></button>
      <button class="btn btn-sm btn-danger" data-act="delete">Usuń konto<small>kasuje dane osobowe; nie da się cofnąć</small></button>`}
    </div>
    <div id="actOut" style="margin-top:12px"></div>`);
  m.querySelector('#editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await api(q(`/api/it/users/${id}`), { method: 'PATCH', body: { name: f.name.value, npwz: f.npwz.value, email: f.email.value, ...(self ? {} : { role: f.role.value }) } });
      toast('Zapisano', 'ok');
      closeModal();
      load();
    } catch (err) { toast(err.message, 'err', 6000); }
  });
  for (const b of m.querySelectorAll('[data-act]')) {
    b.addEventListener('click', async () => {
      const act = b.dataset.act;
      try {
        if (act === 'temp') {
          if (!confirm(`Ustawić nowe hasło tymczasowe dla ${u.email}? Obecne hasło przestanie działać.`)) return;
          const d = await api(q(`/api/it/users/${id}/temp-password`), { method: 'POST', body: {} });
          const c = [{ email: d.email, name: u.name, tempPassword: d.tempPassword }];
          wireCredentials(openModal(`<div class="drawer-head"><h2>Nowe hasło tymczasowe</h2><button class="btn btn-sm btn-ghost" data-close>✕</button></div>${credentialsBox(c)}`), c);
          load();
          return;
        }
        if (act === 'logout') { await api(q(`/api/it/users/${id}/logout`), { method: 'POST', body: {} }); toast('Wylogowano ze wszystkich urządzeń', 'ok'); }
        if (act === 'block') {
          if (!u.blocked && !confirm(`Zablokować ${u.email}? Osoba straci dostęp od razu.`)) return;
          await api(q(`/api/it/users/${id}`), { method: 'PATCH', body: { blocked: !u.blocked } });
          toast(u.blocked ? 'Odblokowano' : 'Zablokowano', 'ok');
        }
        if (act === 'delete') {
          if (prompt(`Usunięcie konta ${u.email} jest nieodwracalne. Wpisz USUŃ, aby potwierdzić.`) !== 'USUŃ') return;
          await api(q(`/api/it/users/${id}`), { method: 'DELETE' });
          toast('Konto usunięte', 'ok');
        }
        closeModal();
        load();
      } catch (err) { toast(err.message, 'err', 6000); }
    });
  }
}

// ---------------------------------------------------------------- problems and tickets
const ISSUE = { locked: 'zablokowane logowanie', pending: 'nie zalogował(a) się', errors: 'błędy AI' };
async function loadProblems(countOnly = false) {
  const d = await api(q('/api/it/problems'));
  const n = d.issues.length + (d.service.ai ? 0 : 1) + (d.service.licence ? 0 : 1);
  $('#probCount').hidden = !n;
  $('#probCount').textContent = n;
  if (countOnly) return;
  const s = d.service;
  const ok = (v, yes, no) => (v ? `<span class="pill ok">${yes}</span>` : `<span class="pill err">${no}</span>`);
  $('#service').innerHTML = [
    ['AI', ok(s.ai, 'działa', 'niedostępne')],
    ['Licencja', `${ok(s.licence, 'aktywna', 'nieaktywna')} <span class="dim small">do ${fmtDate(s.licenceUntil)}</span>`],
    ['Wolne miejsca', fmtNum(s.seatsFree)],
    ['Błędy AI (24 h)', s.errorRate24h > 0.05 ? `<span class="pill warn">${(s.errorRate24h * 100).toFixed(1)}%</span>` : `<span class="pill ok">${(s.errorRate24h * 100).toFixed(1)}%</span>`],
    ['Obciążenie', s.busy ? '<span class="pill warn">duże — odpowiedzi mogą być wolniejsze</span>' : '<span class="pill ok">normalne</span>'],
    ...(s.announcement ? [['Komunikat dostawcy', esc(s.announcement)]] : []),
  ].map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
  $('#issues').innerHTML = d.issues.length
    ? d.issues.map((i) => `<div class="log-row"><span class="pill warn">${esc(ISSUE[i.kind] || i.kind)}</span> <b>${esc(i.name || i.email)}</b> <span class="dim">${esc(i.email)}</span><div class="dim">${esc(i.text)}</div><button class="btn btn-sm" data-user="${i.id}" style="margin-top:6px">⋯ Działania</button></div>`).join('')
    : '<p class="dim">Brak problemów — wszystko działa.</p>';
  $('#tickets').innerHTML = d.tickets.length
    ? d.tickets.map((t) => `<details class="log-row"><summary><b>${esc(t.subject)}</b> <span class="pill ${t.status === 'closed' ? 'ok' : 'info'}">${t.status === 'closed' ? 'zamknięte' : 'otwarte'}</span> <span class="dim">${fmtDateTime(t.ts)} · ${esc(t.author || '')}</span></summary><p style="white-space:pre-wrap">${esc(t.body)}</p>${t.answer ? `<div class="msg info" style="white-space:pre-wrap">Odpowiedź (${fmtDateTime(t.answered_at)}): ${esc(t.answer)}</div>` : ''}</details>`).join('')
    : '<p class="dim">Brak zgłoszeń.</p>';
}
$('#ticketForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await api(q('/api/it/tickets'), { method: 'POST', body: { subject: f.subject.value, body: f.body.value } });
    f.reset();
    toast('Zgłoszenie wysłane do dostawcy', 'ok');
    loadProblems();
  } catch (err) { toast(err.message, 'err'); }
});

// ---------------------------------------------------------------- change log
const ACTION = {
  'user.create': 'utworzono konto', 'it.user.update': 'zmiana konta', 'it.user.temp_password': 'nowe hasło tymczasowe', 'it.user.logout_all': 'wylogowano wszędzie',
  'it.user.delete': 'usunięto konto', 'org.import': 'import listy', 'it.export': 'pobrano listę', 'password.first': 'ustawił(a) własne hasło',
  'password.change': 'zmiana hasła', 'password.reset': 'reset hasła (e-mail)', 'user.update': 'zmiana (właściciel usługi)',
};
async function loadLog() {
  const d = await api(q('/api/it/audit'));
  $('#audit').innerHTML = d.audit.map((a) => `<div class="log-row"><span class="dim">${fmtDateTime(a.ts)}</span> · <b>${esc(ACTION[a.action] || a.action)}</b>${a.target ? ` · ${esc(a.target)}` : ''} ${a.detail && !/^\d+$/.test(a.detail) ? `<span class="dim">${esc(a.detail.replace(/^\d+: /, ''))}</span>` : ''} <span class="faint">— ${esc(a.actor || 'system')}</span></div>`).join('') || '<span class="dim">Brak zdarzeń</span>';
}

load().catch((err) => {
  if (err.code === 'pwd') location.href = '/change-password';
  else toast(err.message, 'err', 8000);
});

// Landing page: plans and prices from the server (the administrator edits them in the admin panel).
import { $, $$, api, esc, fmtPln, CHECK } from './common.js';

$('#year').textContent = new Date().getFullYear();
let data = null;
let interval = 'month';

function features(p) {
  return [
    `${p.quota.toLocaleString('pl-PL')} opisów miesięcznie`,
    'Wszystkie szablony + własne',
    'Dyktat PL / EN → opis PL lub EN',
    'Nauka Twojego stylu',
    `${p.devices} ${p.devices === 1 ? 'urządzenie' : 'urządzenia'} jednocześnie`,
    'Wsparcie e-mail po polsku',
  ];
}

function render() {
  const months = data.annualMonths || 10;
  $('#yearSave').textContent = `${12 - months} mies. gratis`;
  $('#plans').innerHTML = data.plans.map((p) => {
    const monthly = interval === 'year' ? (p.pricePln * months) / 12 : p.pricePln;
    const note = interval === 'year' ? `${fmtPln(p.pricePln * months)} netto rocznie` : 'netto / miesiąc';
    return `<div class="plan${p.featured ? ' featured' : ''}">
      ${p.featured ? '<span class="pill info badge">Najczęściej wybierany</span>' : ''}
      <h3>${esc(p.name)}</h3>
      <div class="price">${fmtPln(Math.round(monthly))}<small> / mies.</small></div>
      <div class="price-note">${note} + 23% VAT</div>
      <ul>${features(p).map((f) => `<li>${CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a class="btn ${p.featured ? 'btn-primary' : ''}" href="/register">Wypróbuj ${data.trialDays} dni za darmo</a>
    </div>`;
  }).join('');
}

for (const b of $$('.billing-toggle button')) {
  b.addEventListener('click', () => {
    interval = b.dataset.interval;
    for (const x of $$('.billing-toggle button')) x.setAttribute('aria-pressed', String(x === b));
    if (data) render();
  });
}

api('/api/plans').then((d) => {
  data = d;
  $('#heroTrial').textContent = d.trialDays;
  for (const el of $$('[data-brand]')) el.textContent = d.brand.name;
  if (d.brand.supportEmail) $('#contactLink').href = `mailto:${d.brand.supportEmail}`;
  else $('#contactLink').href = '/register';
  render();
}).catch(() => { $('#plans').innerHTML = '<p class="dim">Cennik chwilowo niedostępny.</p>'; });

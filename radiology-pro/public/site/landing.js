// Sales website: live hero demo (dictation → finished report), scroll reveals, counters, pricing from the server.
import { $, $$, api, esc, fmtPln } from './common.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
$('#year').textContent = new Date().getFullYear();

// ---------------------------------------------------------------- nav
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------------------------------------------------------------- marquee
const STUDIES = ['TK głowy — uraz', 'Angio-TK tętnic płucnych', 'TK całego ciała (politrauma)', 'MR kręgosłupa lędźwiowego', 'RTG klatki piersiowej', 'USG jamy brzusznej', 'TK KUB', 'MR głowy z kontrastem', 'Angio-TK aorty', 'MR serca', 'Mammografia', 'TK zatok', 'MR kolana', 'USG tarczycy (TI-RADS)', 'TK klatki — guzek (Fleischner)', 'MR wątroby (LI-RADS)', 'RTG kości — złamanie', 'TK jamy brzusznej z kontrastem', 'Angio-TK mózgowia (udar)', 'USG Doppler żył'];
const chips = STUDIES.map((s) => `<span><b>${esc(s.split(' — ')[0])}</b>${s.includes(' — ') ? ` — ${esc(s.split(' — ')[1])}` : ''}</span>`).join('');
$('#marquee').innerHTML = chips + chips;

// ---------------------------------------------------------------- reveal on scroll + counters
function countUp(el) {
  const end = Number(el.dataset.count);
  if (reduced) { el.textContent = end; return; }
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / 1400);
    el.textContent = Math.round(end * (1 - (1 - p) ** 3));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    for (const c of e.target.querySelectorAll('[data-count]')) countUp(c);
    io.unobserve(e.target);
  }
}, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
for (const el of $$('.reveal')) io.observe(el);

// glow that follows the mouse on feature tiles
for (const t of $$('.tile')) {
  t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', `${e.clientX - r.left}px`);
    t.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}

// product screenshot: tilted until it scrolls into view
const frame = $('#frame');
if (frame && !reduced) {
  const tilt = () => {
    const r = frame.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
    frame.style.setProperty('--tilt', `${(14 * (1 - p)).toFixed(2)}deg`);
    frame.style.setProperty('--sc', (0.94 + 0.06 * p).toFixed(3));
  };
  addEventListener('scroll', tilt, { passive: true });
  tilt();
}

// ---------------------------------------------------------------- hero demo (fictional cases)
const SCENES = [
  {
    title: 'TK głowy bez kontrastu · uraz', lang: 'PL → PL', exam: 'Badanie: TK głowy bez kontrastu',
    dict: 'ostry krwiak podtwardówkowy nad lewą półkulą grubości 8 mm, przemieszczenie linii pośrodkowej w prawo o 4 mm, złamanie lewej kości ciemieniowej, wnioski: pilna konsultacja neurochirurgiczna',
    body: [
      { t: 'Badanie wykonano w trybie ostrodyżurowym.' },
      { t: 'Ostry krwiak podtwardówkowy nad lewą półkulą mózgu o grubości 8 mm, z przemieszczeniem struktur linii pośrodkowej w prawo o 4 mm.', add: true },
      { t: 'Złamanie lewej kości ciemieniowej.', add: true },
      { t: 'Bez cech krwawienia wewnątrzczaszkowego.', gone: true },
      { t: 'Układ komorowy symetryczny, nieposzerzony.' },
      { t: 'Struktury linii pośrodkowej nieprzemieszczone.', gone: true },
      { t: 'Kości sklepienia i podstawy czaszki bez zmian pourazowych.', gone: true },
      { t: 'Zatoki przynosowe i jamy wyrostków sutkowatych powietrzne.' },
    ],
    concl: [
      { t: 'Ostry krwiak podtwardówkowy lewostronny (8 mm) z przemieszczeniem linii pośrodkowej o 4 mm.', c: 't1' },
      { t: 'Złamanie lewej kości ciemieniowej.', c: 't2' },
      { t: 'Wskazana pilna konsultacja neurochirurgiczna.', c: 'adv' },
    ],
    safety: 'Usunięto 3 zdania sprzeczne z dyktatem',
  },
  {
    title: 'TK układu moczowego (KUB)', lang: 'EN → PL', exam: 'Badanie: TK jamy brzusznej i miednicy bez kontrastu (KUB)',
    dict: '5 mm stone in the distal left ureter with mild upstream hydronephrosis, no free fluid, rest unremarkable',
    body: [
      { t: 'Badanie wykonano bez podania środka kontrastowego.' },
      { t: 'W dystalnym odcinku moczowodu lewego złóg wielkości 5 mm z niewielkim poszerzeniem UKM nerki lewej powyżej.', add: true },
      { t: 'Nerki prawidłowej wielkości i położenia.' },
      { t: 'Układy kielichowo-miedniczkowe obu nerek nieposzerzone.', gone: true },
      { t: 'UKM nerki prawej nieposzerzony.', add: true },
      { t: 'Moczowody nieposzerzone, bez złogów na przebiegu.', gone: true },
      { t: 'Bez wolnego płynu w jamie otrzewnej.' },
      { t: 'Pęcherz moczowy słabo wypełniony, bez zmian.' },
    ],
    concl: [{ t: 'Złóg w dystalnym odcinku moczowodu lewego (5 mm) z niewielkim poszerzeniem UKM nerki lewej.', c: 't2' }],
    safety: 'Usunięto 2 zdania sprzeczne z dyktatem',
  },
];

const D = { title: $('#dTitle'), lang: $('#dLang'), orb: $('#dOrb'), wave: $('#dWave'), state: $('#dState'), time: $('#dTime'), dict: $('#dDict'), prep: $('#dPrep'), doc: $('#dDoc'), safety: $('#dSafety'), safetyText: $('#dSafetyText') };
D.wave.innerHTML = '<i></i>'.repeat(30);
const bars = [...D.wave.children];
let waveTimer = null;
function waveOn(on) {
  clearInterval(waveTimer);
  if (on) waveTimer = setInterval(() => bars.forEach((b, i) => { b.style.height = `${4 + Math.abs(Math.sin(Date.now() / 160 + i * 0.7)) * Math.random() * 22}px`; }), 90);
  else bars.forEach((b) => { b.style.height = '4px'; });
}

function renderTemplate(s) {
  D.doc.innerHTML = `<div class="exam">${esc(s.exam)}</div><div class="hd">Opis</div><div id="dBody">${s.body.filter((l) => !l.add).map((l) => `<span class="s" data-t="${esc(l.t)}">${esc(l.t)}</span>`).join('')}</div><div class="hd w">Wnioski</div><div class="concl" id="dConcl"><span class="c" style="color:var(--faint)">—</span></div>`;
}

function finalState(s) {
  D.title.textContent = s.title;
  D.lang.textContent = s.lang;
  D.dict.textContent = s.dict;
  D.doc.innerHTML = `<div class="exam">${esc(s.exam)}</div><div class="hd">Opis</div>${s.body.filter((l) => !l.gone).map((l) => `<span class="s${l.add ? ' new' : ''}">${esc(l.t)}</span>`).join('')}<div class="hd w">Wnioski</div><div class="concl">${s.concl.map((c) => `<span class="c ${c.c}">${c.c === 'adv' ? '' : '- '}${esc(c.t)}</span>`).join('')}</div>`;
  D.safetyText.textContent = s.safety;
  D.safety.classList.add('hit');
}

let visible = true;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.1 }).observe($('.demo'));
const waitVisible = async () => { while (!visible || document.hidden) await sleep(400); };

async function play(s) {
  await waitVisible();
  D.title.textContent = s.title;
  D.lang.textContent = s.lang;
  D.safety.classList.remove('hit');
  D.safetyText.textContent = 'Siatka bezpieczeństwa aktywna';
  D.prep.classList.remove('busy', 'press', 'done');
  D.prep.lastChild.textContent = 'Przygotuj opis';
  D.dict.innerHTML = '<span class="caret"></span>';
  D.time.textContent = '00:00';
  renderTemplate(s);
  await sleep(900);
  // dictation
  D.orb.classList.add('rec');
  D.state.textContent = 'Nagrywanie';
  waveOn(true);
  const t0 = Date.now();
  const clock = setInterval(() => { const sec = Math.floor((Date.now() - t0) / 1000) + 1; D.time.textContent = `00:${String(sec).padStart(2, '0')}`; }, 250);
  const caret = D.dict.querySelector('.caret');
  for (const w of s.dict.split(' ')) {
    const span = document.createElement('span');
    span.className = 'w';
    span.textContent = `${w} `;
    D.dict.insertBefore(span, caret);
    await sleep(120 + Math.random() * 110);
  }
  clearInterval(clock);
  waveOn(false);
  D.orb.classList.remove('rec');
  D.state.textContent = 'Dyktat';
  caret.remove();
  await sleep(600);
  // "Przygotuj opis"
  D.prep.classList.add('press');
  await sleep(160);
  D.prep.classList.remove('press');
  D.prep.classList.add('busy');
  D.prep.lastChild.textContent = 'AI przygotowuje opis…';
  await sleep(1300);
  D.prep.classList.remove('busy');
  D.prep.lastChild.textContent = 'Przygotuj opis';
  // safety net: contradicted template sentences
  const body = $('#dBody');
  for (const l of s.body.filter((x) => x.gone)) body.querySelector(`[data-t="${CSS.escape(l.t)}"]`)?.classList.add('gone');
  D.safety.classList.add('hit');
  D.safetyText.textContent = s.safety;
  await sleep(1100);
  for (const el of body.querySelectorAll('.gone')) el.classList.add('out');
  await sleep(450);
  // new sentences in clinical order
  let prev = null;
  for (const l of s.body) {
    const existing = l.add ? null : body.querySelector(`[data-t="${CSS.escape(l.t)}"]`);
    if (l.gone) continue;
    if (l.add) {
      const el = document.createElement('span');
      el.className = 's new';
      el.textContent = l.t;
      if (prev) prev.after(el); else body.prepend(el);
      prev = el;
      await sleep(380);
    } else prev = existing || prev;
  }
  for (const el of body.querySelectorAll('.out')) el.remove();
  // conclusion
  const concl = $('#dConcl');
  concl.innerHTML = '';
  for (const c of s.concl) {
    const el = document.createElement('span');
    el.className = `c ${c.c}`;
    el.textContent = `${c.c === 'adv' ? '' : '- '}${c.t}`;
    concl.append(el);
    await sleep(420);
  }
  await sleep(1300);
  D.prep.classList.add('done');
  D.prep.lastChild.textContent = 'Skopiowano do RIS';
  await sleep(3800);
}

if (reduced) finalState(SCENES[0]);
else (async () => { for (let i = 0; ; i = (i + 1) % SCENES.length) await play(SCENES[i]); })();

// ---------------------------------------------------------------- pricing
let data = null;
let interval = 'month';
const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const FOR = { start: 'Dla pracujących na część etatu', pro: 'Dla większości radiologów', max: 'Dla dyżurujących dużo' };
function features(p) {
  return [`${p.quota.toLocaleString('pl-PL')} opisów miesięcznie`, '397 szablonów + Twoje własne', 'Dyktat PL / EN → opis PL lub EN', 'Uczenie AI Twojego stylu', `${p.devices} ${p.devices === 1 ? 'urządzenie' : 'urządzenia'} jednocześnie`, 'Wsparcie e-mail po polsku'];
}
function renderPlans() {
  const months = data.annualMonths || 10;
  $('#yearSave').textContent = `${12 - months} mies. gratis`;
  $('#plans').innerHTML = data.plans.map((p) => {
    const monthly = interval === 'year' ? (p.pricePln * months) / 12 : p.pricePln;
    return `<div class="plan${p.featured ? ' featured' : ''} reveal in">
      ${p.featured ? '<span class="badge">Najczęściej wybierany</span>' : ''}
      <h3>${esc(p.name)}</h3><div class="for">${esc(FOR[p.id] || '')}</div>
      <div class="price"><b>${fmtPln(Math.round(monthly)).replace(' zł', '')}</b><span>zł / mies.</span></div>
      <div class="price-note">${interval === 'year' ? `${fmtPln(p.pricePln * months)} netto za rok` : 'netto, płatne co miesiąc'}</div>
      <ul>${features(p).map((f) => `<li>${CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a class="go" href="/register">Wypróbuj ${data.trialDays} dni za darmo</a>
    </div>`;
  }).join('') + `<div class="plan team reveal in">
      <h3>Zespół / firma</h3><div class="for">Teleradiologia, szpitale, pracownie</div>
      <div class="price"><b style="font-size:38px">Wycena</b></div>
      <div class="price-note">licencja na miejsca, jedna faktura</div>
      <ul>${['Konsola IT i import listy osób', 'Logowanie dwuetapowe, limity urządzeń', 'Umowa powierzenia (RODO)', 'Pilotaż dla części zespołu', 'Opiekun wdrożenia'].map((f) => `<li>${CHECK}<span>${esc(f)}</span></li>`).join('')}</ul>
      <a class="go" href="#kontakt">Porozmawiajmy</a>
    </div>`;
}
function placeKnob() {
  const on = $('.toggle button[aria-pressed="true"]');
  const knob = $('.toggle .knob');
  knob.style.width = `${on.offsetWidth}px`;
  knob.style.transform = `translateX(${on.offsetLeft - 5}px)`;
}
for (const b of $$('.toggle button')) {
  b.addEventListener('click', () => {
    interval = b.dataset.interval;
    for (const x of $$('.toggle button')) x.setAttribute('aria-pressed', String(x === b));
    placeKnob();
    if (data) renderPlans();
  });
}
addEventListener('resize', placeKnob);
placeKnob();
document.fonts?.ready.then(placeKnob);

api('/api/plans').then((d) => {
  data = d;
  for (const el of [$('#heroTrial'), $('#trialDays'), ...$$('.trialN')]) if (el) el.textContent = d.trialDays;
  for (const el of $$('[data-brand]')) el.textContent = d.brand.name;
  const mail = d.brand.supportEmail ? `mailto:${d.brand.supportEmail}?subject=${encodeURIComponent(`${d.brand.name} dla firmy`)}` : '/register';
  $('#contactLink').href = mail;
  $('#orgContact').href = mail;
  renderPlans();
}).catch(() => { $('#plans').innerHTML = '<p style="text-align:center;color:var(--dim)">Cennik chwilowo niedostępny.</p>'; });

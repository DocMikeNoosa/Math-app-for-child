// Friends' setup wizard: the rules (one tick), what an API key is, an Anthropic account, credits, a key, paste + check.
// One step at a time; the step is remembered, so a friend who closes the tab continues where they stopped.
import { $, $$, api, showMsg } from './common.js';

const STEPS = ['rules', 'what', 'account', 'credits', 'key', 'paste', 'done'];
const LABEL = { rules: 'Zasady', what: 'Klucz API', account: 'Konto', credits: 'Środki', key: 'Klucz', paste: 'Wklej', done: 'Gotowe' };
const SAVE = 'rv.witaj.step';
let me = null;
let steps = STEPS;
let current = 'what';

const remember = (s) => { try { localStorage.setItem(SAVE, s); } catch { /* private mode */ } };
const remembered = () => { try { return localStorage.getItem(SAVE); } catch { return null; } };

function show(step) {
  current = step;
  for (const s of $$('.wz-step')) s.hidden = s.dataset.step !== step;
  const i = steps.indexOf(step);
  $('#progress').innerHTML = steps.map((s, j) => `<li class="${j < i ? 'done' : j === i ? 'now' : ''}"><span>${j < i ? '✓' : j + 1}</span><em>${LABEL[s]}</em></li>`).join('');
  if (step !== 'done' && step !== 'rules') remember(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (step === 'paste') setTimeout(() => $('#apiKey').focus(), 300);
}
const next = () => show(steps[Math.min(steps.length - 1, steps.indexOf(current) + 1)]);
const back = () => show(steps[Math.max(0, steps.indexOf(current) - 1)]);
for (const b of $$('[data-next]')) b.addEventListener('click', next);
for (const b of $$('[data-back]')) b.addEventListener('click', back);

$('#rulesNext').addEventListener('click', async () => {
  if (!$('#accept').checked) return showMsg($('#rulesMsg'), 'Zaznacz pole powyżej, aby przejść dalej.');
  try {
    await api('/api/me/accept', { method: 'POST', body: { accept: true } });
    steps = STEPS.filter((s) => s !== 'rules');
    show(me.friend?.key ? 'done' : 'what');
  } catch (err) { showMsg($('#rulesMsg'), err.message); }
});

$('#showKey').addEventListener('change', (e) => { $('#apiKey').type = e.target.checked ? 'text' : 'password'; });

// which earlier step fixes a given problem
function fixStep(message) {
  if (/środków|Billing/i.test(message)) return ['credits', 'Wróć do kroku „Środki”'];
  if (/klucz|workspace|wygasł/i.test(message)) return ['key', 'Utwórz nowy klucz'];
  return null;
}

$('#keyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = $('#apiKey').value.trim();
  const msg = $('#keyMsg');
  if (!key) return showMsg(msg, 'Pole jest puste — kliknij w nie i wklej klucz (Ctrl + V).');
  if (!key.startsWith('sk-ant-')) return showMsg(msg, 'To nie jest klucz — klucz zaczyna się od „sk-ant-”. Wróć na stronę Anthropic, kliknij Copy przy kluczu i wklej ponownie.');
  const btn = $('#keySave');
  btn.disabled = true; btn.textContent = 'Sprawdzam klucz w Anthropic…';
  msg.hidden = true;
  try {
    await api('/api/me/api-key', { method: 'POST', body: { key } });
    $('#apiKey').value = '';
    try { localStorage.removeItem(SAVE); } catch { /* ignore */ }
    show('done');
  } catch (err) {
    showMsg(msg, err.message);
    const fix = fixStep(err.message);
    if (fix) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn btn-sm'; b.style.marginLeft = '8px'; b.textContent = fix[1];
      b.addEventListener('click', () => show(fix[0]));
      msg.append(' ', b);
    }
  } finally { btn.disabled = false; btn.textContent = 'Sprawdź i zapisz'; }
});

(async () => {
  try { me = await api('/api/me'); } catch { location.href = '/login?next=/witaj'; return; }
  if (!me.friend) { location.href = '/account'; return; }
  const first = String(me.user.name || '').replace(/^(lek\.|dr n\. med\.|dr|prof\.)\s+/i, '').split(/\s+/)[0];
  $('#hello').textContent = first ? `Witaj, ${first}!` : 'Witaj!';
  const needRules = me.access?.code === 'terms';
  if (!needRules) steps = STEPS.filter((s) => s !== 'rules');
  if (needRules) show('rules');
  else if (me.friend.key) show('done');
  else show(steps.includes(remembered()) ? remembered() : 'what');
})();

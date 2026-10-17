// Workstation check: everything dictation needs on THIS computer, with a fix for each problem in plain Polish.
// Nothing is recorded or sent anywhere except (on request) the text report to the organisation's IT.
import { $, api, esc, toast, brand } from './common.js';
import { MicButton } from '../js/mic-button.js';

brand();
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const results = new Map(); // id → { status, text, fix }
let mic = null; // PowerMic / SpeechMike test (created below)
let me = null;
api('/api/me').then((d) => { me = d.user; $('#sendReport').hidden = false; }).catch(() => {});

const CHECKS = [
  ['browser', 'Przeglądarka'],
  ['secure', 'Bezpieczne połączenie (HTTPS)'],
  ['server', 'Połączenie z RadVox Pro'],
  ['clock', 'Zegar komputera'],
  ['storage', 'Ciasteczka i pamięć przeglądarki'],
  ['mic', 'Mikrofon'],
  ['speech', 'Rozpoznawanie mowy'],
  ['clipboard', 'Kopiowanie do schowka (wklejanie do RIS)'],
  ['hid', 'Obsługa przycisku mikrofonu (WebHID)'],
];
const ICON = { wait: '…', run: '⟳', ok: '✓', warn: '!', err: '✕' };
function render() {
  $('#checks').innerHTML = CHECKS.map(([id, title]) => {
    const r = results.get(id) || { status: 'wait', text: 'nie sprawdzono' };
    return `<div class="check ${r.status}"><span class="ci">${ICON[r.status]}</span><div class="cb"><b>${esc(title)}</b><div class="dim small">${esc(r.text)}</div>${r.fix ? `<div class="fix small">${esc(r.fix)}</div>` : ''}</div></div>`;
  }).join('');
  $('#report').textContent = reportText();
}
const set = (id, status, text, fix = '') => { results.set(id, { status, text, fix }); render(); };
render();

function browserInfo() {
  const ua = navigator.userAgent;
  const edge = /Edg\/(\d+)/.exec(ua);
  const chrome = /Chrome\/(\d+)/.exec(ua);
  const name = edge ? 'Edge' : chrome ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'inna';
  const version = Number((edge || chrome)?.[1] || 0);
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : /Android/.test(ua) ? 'Android' : 'inny system';
  return { name, version, os };
}

async function checkBrowser() {
  const b = browserInfo();
  if (b.name === 'Chrome' || b.name === 'Edge') {
    if (b.version && b.version < 110) return set('browser', 'warn', `${b.name} ${b.version} · ${b.os} — stara wersja`, 'Zaktualizuj przeglądarkę do bieżącej wersji (zasady aktualizacji Chrome / Edge w domenie).');
    return set('browser', 'ok', `${b.name} ${b.version} · ${b.os}`);
  }
  set('browser', 'err', `${b.name} · ${b.os}`, 'Dyktowanie wymaga przeglądarki Chrome lub Edge (Firefox i Safari nie mają rozpoznawania mowy). Zainstaluj Chrome lub Edge.');
}
function checkSecure() {
  if (window.isSecureContext) set('secure', 'ok', location.protocol === 'https:' ? 'HTTPS' : 'adres lokalny');
  else set('secure', 'err', 'połączenie bez HTTPS', 'Mikrofon i schowek działają tylko przez HTTPS — otwieraj RadVox Pro adresem https://.');
}
async function checkServer() {
  const times = [];
  let serverDate = null;
  try {
    for (let i = 0; i < 3; i++) {
      const t = performance.now();
      const res = await fetch('/healthz', { cache: 'no-store' });
      times.push(performance.now() - t);
      serverDate = res.headers.get('date') ? Date.parse(res.headers.get('date')) : serverDate;
      if (!res.ok) throw new Error(`status ${res.status}`);
    }
    const ms = Math.round(Math.min(...times));
    set('server', ms > 800 ? 'warn' : 'ok', `odpowiedź w ${ms} ms`, ms > 800 ? 'Wolne połączenie — sprawdź proxy / VPN; przy dużych opóźnieniach dyktowanie będzie wolniejsze.' : '');
  } catch (err) {
    set('server', 'err', `brak połączenia (${err.message})`, 'Zapora / proxy blokuje adres RadVox Pro. Odblokuj HTTPS (port 443) do domeny RadVox Pro.');
  }
  if (serverDate) {
    const diff = Math.round((Date.now() - serverDate) / 1000);
    if (Math.abs(diff) > 90) set('clock', 'warn', `różnica ${diff > 0 ? '+' : ''}${diff} s względem serwera`, 'Ustaw automatyczną synchronizację czasu w Windows (kody logowania dwuetapowego mogą nie działać).');
    else set('clock', 'ok', 'zgodny z serwerem');
  } else set('clock', 'warn', 'nie można porównać', '');
}
function checkStorage() {
  let ls = false;
  try { localStorage.setItem('radiopis.check', '1'); localStorage.removeItem('radiopis.check'); ls = true; } catch { /* blocked */ }
  if (navigator.cookieEnabled && ls) set('storage', 'ok', 'włączone');
  else set('storage', 'err', `${navigator.cookieEnabled ? '' : 'ciasteczka wyłączone '}${ls ? '' : 'pamięć zablokowana'}`.trim(), 'Zezwól na ciasteczka i dane witryn dla adresu RadVox Pro (bez tego logowanie i ustawienia nie działają). Nie używaj trybu incognito / gościa.');
}
async function checkMic() {
  set('mic', 'run', 'zezwól na mikrofon i powiedz coś…');
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    const fix = err.name === 'NotAllowedError' ? 'Zezwól na mikrofon dla adresu RadVox Pro (kłódka przy adresie → Mikrofon → Zezwalaj) lub zasadą AudioCaptureAllowedUrls; sprawdź Ustawienia Windows → Prywatność → Mikrofon.' : err.name === 'NotFoundError' ? 'Nie wykryto mikrofonu — podłącz go i ustaw jako domyślne urządzenie nagrywania w Windows.' : 'Mikrofon jest zajęty lub zablokowany — zamknij inne programy korzystające z mikrofonu.';
    return set('mic', 'err', `brak dostępu (${err.name})`, fix);
  }
  const devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput').map((d) => d.label).filter(Boolean);
  const ctx = new AudioContext();
  const an = ctx.createAnalyser();
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Float32Array(an.fftSize);
  let peak = 0;
  const end = Date.now() + 3500;
  while (Date.now() < end) {
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (const v of buf) sum += v * v;
    peak = Math.max(peak, Math.sqrt(sum / buf.length));
    set('mic', 'run', `poziom: ${'▮'.repeat(Math.min(20, Math.round(peak * 200)))} (mów coś)`);
    await new Promise((r) => setTimeout(r, 120));
  }
  stream.getTracks().forEach((t) => t.stop());
  ctx.close();
  const used = devices[0] || 'domyślny';
  if (peak < 0.01) set('mic', 'warn', `${used}: bardzo cichy lub brak sygnału`, 'Sprawdź, czy mikrofon nie jest wyciszony (przycisk na mikrofonie, Windows → Dźwięk → Nagrywanie) i czy wybrane jest właściwe urządzenie.');
  else set('mic', 'ok', `${used} — sygnał OK${devices.length > 1 ? ` (mikrofonów: ${devices.length})` : ''}`);
}
function checkSpeech() {
  return new Promise((resolve) => {
    if (!SR) { set('speech', 'err', 'brak w tej przeglądarce', 'Użyj Chrome lub Edge.'); return resolve(); }
    set('speech', 'run', 'powiedz: „test, opis radiologiczny”…');
    const rec = new SR();
    rec.lang = 'pl-PL';
    rec.interimResults = true;
    rec.continuous = false;
    let heard = '';
    let done = false;
    const finish = (status, text, fix) => { if (done) return; done = true; clearTimeout(t); try { rec.abort(); } catch { /* ended */ } set('speech', status, text, fix); resolve(); };
    const t = setTimeout(() => finish(heard ? 'ok' : 'warn', heard ? `rozpoznano: „${heard}”` : 'nic nie rozpoznano w 10 s', heard ? '' : 'Mów wyraźnie, blisko mikrofonu. Jeśli mikrofon działa, a mowy nie rozpoznano — sprawdź zaporę (usługa mowy przeglądarki).'), 10000);
    rec.onresult = (e) => {
      heard = [...e.results].map((r) => r[0].transcript).join(' ').trim();
      set('speech', 'run', `słyszę: „${heard}”`);
      if ([...e.results].some((r) => r.isFinal)) finish('ok', `rozpoznano: „${heard}”`);
    };
    rec.onerror = (e) => {
      const fixes = {
        network: 'Przeglądarka nie łączy się z usługą rozpoznawania mowy (Chrome → Google, Edge → Microsoft). Zapora / proxy / inspekcja TLS blokuje ten ruch — odblokuj usługi mowy producenta przeglądarki dla tego komputera.',
        'not-allowed': 'Brak zgody na mikrofon — zezwól dla adresu RadVox Pro (lub zasadą AudioCaptureAllowedUrls).',
        'service-not-allowed': 'Rozpoznawanie mowy wyłączone zasadami przeglądarki / systemu albo tryb gościa.',
        'audio-capture': 'Przeglądarka nie widzi mikrofonu — sprawdź domyślne urządzenie nagrywania.',
        'language-not-supported': 'Zaktualizuj przeglądarkę.',
        'no-speech': 'Nie usłyszano mowy — mów głośniej lub sprawdź mikrofon.',
      };
      finish(e.error === 'no-speech' ? 'warn' : 'err', `błąd: ${e.error}`, fixes[e.error] || 'Nieznany błąd rozpoznawania mowy.');
    };
    rec.onend = () => { if (!done) finish(heard ? 'ok' : 'warn', heard ? `rozpoznano: „${heard}”` : 'zakończono bez wyniku', heard ? '' : 'Powtórz test i mów wyraźnie.'); };
    try { rec.start(); } catch (err) { finish('err', `nie można uruchomić (${err.message})`, 'Zamknij inne karty używające mikrofonu i spróbuj ponownie.'); }
  });
}
async function checkClipboard() {
  try {
    await navigator.clipboard.writeText('RadVox Pro — test schowka');
    set('clipboard', 'ok', 'działa');
  } catch (err) {
    set('clipboard', 'err', `zablokowane (${err.name})`, 'Zezwól na schowek dla adresu RadVox Pro (kłódka przy adresie → Schowek) lub zasadą ClipboardAllowedForUrls.');
  }
}
function checkHid() {
  if ('hid' in navigator) set('hid', 'ok', 'obsługiwane — sprawdź przycisk w sekcji poniżej');
  else set('hid', 'warn', 'brak WebHID', 'Przycisk PowerMic działa w Chrome / Edge. Alternatywa: tryb klawisza (przycisk wysyła np. F9) — Ustawienia aplikacji → Klawisz nagrywania.');
}

$('#runAll').addEventListener('click', async (e) => {
  e.target.disabled = true;
  results.clear();
  render();
  checkClipboard(); // needs the click
  await checkBrowser();
  checkSecure();
  checkStorage();
  checkHid();
  await checkServer();
  await checkMic();
  await checkSpeech();
  e.target.disabled = false;
  const bad = [...results.values()].filter((r) => r.status === 'err').length;
  toast(bad ? `Znaleziono problemy: ${bad} — rozwiązania pod każdym punktem` : 'Wszystko gotowe do dyktowania', bad ? 'err' : 'ok', 5000);
});

// ---------------------------------------------------------------- PowerMic / SpeechMike
const raw = [];
mic = new MicButton({
  onPress: () => toast('Przycisk działa ✓', 'ok', 1500),
  onChange: () => renderHid(),
  onRaw: (id, bytes) => { raw.push(`#${id}: ${[...bytes].map((b) => b.toString(16).padStart(2, '0')).join(' ')}`); if (raw.length > 10) raw.shift(); renderHid(); },
  persist: false, // the test never changes the button saved in the app
});
function hidText() {
  const d = mic.diagnose();
  return [
    `Urządzenie: ${d.product || '—'} (vendor ${d.vendorId}, product ${d.productId})`,
    `Kolekcje HID: ${d.collections.map((c) => `${c.usagePage}/${c.usage}${c.protected ? ' (zablokowana)' : ''}`).join(', ') || '—'}`,
    `Odebrane raporty: ${d.reportsReceived}`,
    `Przycisk: ${d.binding ? `raport ${d.binding.reportId}, bajt ${d.binding.byte}, maska 0x${d.binding.mask.toString(16)}` : '—'}`,
    `Dane: ${raw.length ? `\n  ${raw.join('\n  ')}` : '—'}`,
    `Wskazówka: ${d.hint}`,
  ].join('\n');
}
function renderHid() {
  $('#hidOut').textContent = hidText();
  $('#hidLearn').hidden = !mic.connected;
  const d = mic.diagnose();
  $('#hidPill').innerHTML = !d.connected ? '<span class="pill">niepodłączony</span>' : d.binding ? '<span class="pill ok">przycisk działa</span>' : d.reportsReceived ? '<span class="pill info">dane docierają</span>' : '<span class="pill warn">brak danych</span>';
  $('#report').textContent = reportText();
}
async function hidConnect(any) {
  try {
    if (await mic.connect({ any })) { renderHid(); hidLearn(); }
  } catch (err) { if (err?.name !== 'NotFoundError') { toast(err.message, 'err', 8000); $('#hidOut').textContent = `${err.message}\n\n${hidText()}`; } }
}
async function hidLearn() {
  $('#hidOut').textContent = 'Naciśnij przycisk nagrywania DWA RAZY…';
  const r = await mic.learn(15000);
  const binding = r.binding;
  mic.config = binding ? { binding } : null; // keep the result on screen only
  if (r.ok) toast('Przycisk rozpoznany — w aplikacji kliknij „Naucz przycisk” (Ustawienia)', 'ok', 6000);
  else toast(r.reason === 'no-data' ? 'Mikrofon nie wysłał żadnych danych — wskazówka poniżej' : 'Nie rozpoznano przycisku — spróbuj jeszcze raz', 'err', 6000);
  renderHid();
}
$('#hidConnect').addEventListener('click', () => hidConnect(false));
$('#hidAny').addEventListener('click', () => hidConnect(true));
$('#hidLearn').addEventListener('click', hidLearn);
if (!('hid' in navigator)) { $('#hidConnect').disabled = true; $('#hidAny').disabled = true; $('#hidOut').textContent = 'Ta przeglądarka nie obsługuje WebHID — użyj Chrome lub Edge.'; }

// ---------------------------------------------------------------- report
function reportText() {
  const b = browserInfo();
  const lines = [`Test stanowiska RadVox Pro — ${new Date().toLocaleString('pl-PL')}`, `${b.name} ${b.version || ''} · ${b.os} · ${navigator.language}`, ''];
  for (const [id, title] of CHECKS) {
    const r = results.get(id);
    if (!r) continue;
    lines.push(`${r.status === 'ok' ? 'OK ' : r.status === 'warn' ? 'UWAGA' : r.status === 'err' ? 'BŁĄD' : '…'}  ${title}: ${r.text}${r.fix ? `\n      → ${r.fix}` : ''}`);
  }
  if (mic && (mic.connected || mic.reports)) lines.push('', 'Przycisk mikrofonu:', hidText());
  return lines.join('\n');
}
$('#copyReport').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(reportText()); toast('Skopiowano', 'ok'); } catch { toast('Zaznacz raport i skopiuj ręcznie.', 'warn'); }
});
$('#sendReport').addEventListener('click', async () => {
  if (!results.size) return toast('Najpierw uruchom test.', 'warn');
  const bad = [...results.values()].filter((r) => r.status === 'err').length;
  try {
    await api('/api/me/event', { method: 'POST', body: { kind: 'check', code: bad ? 'problems' : 'ok', detail: reportText() } });
    toast(me ? 'Wynik wysłany — dział IT zobaczy go w konsoli IT' : 'Wysłano', 'ok', 5000);
  } catch (err) { toast(err.message, 'err'); }
});

// EndoList — aplikacja (UI). Dane: zaszyfrowane lokalnie (vault.js). Listy: AI (ai.js) lub generator offline (letter.js).
import * as V from './vault.js';
import {
  toothInfo, anatomy, configRoots, rootsForCount, canalLabel, LATERAL, PULP_DX, PERI_DX, T_COLD, T_HEAT, T_EPT, T_PERC, T_PALP, T_BITE, T_MOB, T_SWELL, T_SINUS,
  RADIO, ENDO, ENDO_STATUS, ANESTH, IRRIG, OBTUR, SEALER, MEDIC, TEMP, MATERIAL_ENDO, FINDINGS, BLACK, SURFACES, FILL_MAT, WORK, POST_TYPE, IMPL_PREP,
  PRODUCTS, PRODUCT_CATS, QUICK, parsePesel,
  RESTOR, CONTROL, PROG, DOC_TITLES,
} from './data.js';
import { suggestDx, finalDx } from './dx.js';
import { archSVG, toothDetailSVG } from './odontogram.js';
import { buildOffline, aiPayload, glance, salutation, markFor, fmtDate, PT, materialsFor } from './letter.js';
import { generateLetter, reviseLetter, cleanDictation, testKey } from './ai.js';
import { Pseudonymizer } from './privacy.js';
import { Clinic, fingerprint } from './org.js';
import { Tooth3D, webglOk, drewSomething } from './tooth3d.js';
import { Dictation, speechSupported } from './speech.js';
import { letterPaperHTML } from './letterview.js';
import { buildLetterPDF } from './pdf.js';
import { SyncClient, loadConfig, enableSync, signInFromServer, normUrl, defaultSyncUrl } from './sync.js';
import { Folder, fsSupported, names, download, emlDraft, canShareFile, mailto, prodentisText } from './files.js';

/* ================================================================ utils */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const debounce = (fn, ms) => { let t; const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; f.flush = (...a) => { clearTimeout(t); return fn(...a); }; return f; };
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] ??= {}), o); t[last] = v; };
const initials = (a, b) => ((a || '')[0] || '') + ((b || '')[0] || '');
function toast(msg, kind = '') { const t = document.createElement('div'); t.className = `toast ${kind}`; t.textContent = msg; $('#toasts').appendChild(t); setTimeout(() => t.remove(), kind === 'err' ? 7000 : 3800); }
const I = (name) => `<svg class="i" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
const ICONS = {
  tooth: '<path d="M7 3c2.2 0 3.3 1 5 1s2.8-1 5-1c3 0 4 3 3.2 7-.6 3.2-1.6 5-2.3 9-.5 2.6-2.4 3.1-3.1.4l-1.3-4.8c-.5-1.6-2.5-1.6-3 0L9.2 19.4c-.7 2.7-2.6 2.2-3.1-.4-.7-4-1.7-5.8-2.3-9C3 6 4 3 7 3z"/>',
  user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.2-3.8 4.1-5.6 7.5-5.6s6.3 1.8 7.5 5.6"/>',
  users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M2.8 19.5c1-3.2 3.4-4.8 6.2-4.8s5.2 1.6 6.2 4.8"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.8 14.9c1.7.6 2.9 2 3.5 4.6"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14.5 8.5l2 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 6.5 12 13l8.5-6.5"/>',
  save: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>', back: '<path d="M15 5l-7 7 7 7"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M8.8 12.2l2.2 2.2 4.4-4.6"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  sync: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 3.5v5h-5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20.5v-5h5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.6"/><path d="M11 18.5h2"/>',
  install: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 7v6M9.5 10.5 12 13l2.5-2.5M8 20h8"/>',
};

/* ================================================================ state */
const DEFAULT_SETTINGS = {
  id: 'main',
  doctor: { title: 'lek. dent.', first: '', last: '', gender: 'f', specialty: '', practice: 'Centrum Stomatologiczne', group: 'Niewiński Group', address: 'ul. Henryka Sienkiewicza 54, Siedlce', city: 'Siedlce', phone: '', email: '', npwz: '', signature: '', useSignature: true, logo: '', groupLogo: '' },
  letter: { signoff: 'Z wyrazami szacunku,', icd: true, title: 'Informacja o przeprowadzonym leczeniu' },
  ai: { key: '', enabled: true, effort: 'medium', cleanDictation: true },
  customProducts: {},
  security: { autolock: 15 },
  used: {},
};
export const APP_VERSION = '2.3.2';
const WRITER = 2; // letter writer generation (first-person narrative)
const S = { session: null, folder: null, data: null, view: 'visit', visitId: null, fdi: null, ttab: 'anat', letterId: null, patientId: null, search: '', saving: 0, backingUp: false, installEvt: null, lastActive: Date.now(), previewUrl: null, sync: null, syncStatus: null };
const D = () => S.data;
const settings = () => S.data.settings.get('main');
/* RODO: AI only after the clinic confirms a data processing agreement with Anthropic; identifiers never leave the device */
// a saved API key switches AI on; in a clinic the administrators can switch it off for everyone
const aiAllowed = () => (S.org ? !!S.org.org.policy?.aiDpa : true);
const aiKey = () => { const a = settings().ai, k = (a.key || '').trim(); return k && a.enabled !== false && aiAllowed() ? k : ''; };
const TITLE_WORDS = /^(lek|dent|dr|hab|n|med|prof|stom|lekarz|dentysta|pani|pan)\.?$/i;
function pseudoFor(patient, referrer, visits = []) {
  const d = settings().doctor;
  const people = [patient, referrer && referrer.kind !== 'clinic' ? referrer : null, { first: d.first, last: d.last }];
  for (const v of visits) if (v?.otherDentist) { const w = v.otherDentist.split(/\s+/).filter((x) => x.length >= 3 && !TITLE_WORDS.test(x)); if (w.length) people.push({ first: w[0], last: w.slice(1).join(' ') }); }
  const extra = [patient?.pesel, patient?.dob, patient?.dob && fmtDate(patient.dob), patient?.phone, patient?.email, referrer?.clinic, referrer?.email, referrer?.phone, ...(referrer?.address || '').split('\n'), d.npwz, d.phone, d.email].filter((x) => x && String(x).trim().length >= 4);
  return new Pseudonymizer({ people: people.filter(Boolean), extra });
}
/** Identifiers for an AI call made from the current screen (dictation, manual description). */
function pseudoHere() {
  if (S.view === 'letter') { const L = D().letters.get(S.letterId); if (L) return pseudoFor(D().patients.get(L.patientId), D().referrers.get(L.referrerId), L.visitIds.map((id) => D().visits.get(id))); }
  const v = curVisit(); return pseudoFor(v && D().patients.get(v.patientId), v && D().referrers.get(v.referrerId), v ? [v] : []);
}
/** The logged-in doctor signs every letter: her name, title, specialty and signature come from her own account. */
const signer = () => settings().doctor;
const doctorName = () => { const d = settings().doctor; return [d.title, d.first, d.last].filter(Boolean).join(' '); };

/* ================================================================ persistence */
const dirty = new Map();
// writes are queued, so awaiting flushSave.flush() (e.g. before locking) also waits for writes already in progress
let saveQueue = Promise.resolve();
const flushSave = debounce(() => (saveQueue = saveQueue.then(async () => {
  const items = [...dirty.values()]; dirty.clear();
  if (!items.length) return;
  S.saving++; renderStatus();
  try { for (const [store, obj] of items) await S.session.put(store, obj); } catch (e) { toast('Nie udało się zapisać: ' + e.message, 'err'); }
  S.saving--; renderStatus(); scheduleBackup();
})), 350);
function save(store, obj) { if (store === 'settings') mirrorBrand(); obj.updatedAt = Date.now(); D()[store].set(obj.id, obj); dirty.set(store + obj.id, [store, obj]); flushSave(); }
async function remove(store, id) { D()[store].delete(id); await S.session.del(store, id); scheduleBackup(); }
const scheduleBackup = debounce(backupNow, 2500);
async function backupNow() {
  if (!S.folder || !S.folder.ok() || S.backingUp) return false;
  S.backingUp = true; renderStatus();
  try { await S.folder.backup(JSON.stringify(await S.session.exportBackup())); S.folder.error = ''; return true; }
  catch (e) { S.folder.error = e.message || String(e); if (e.name === 'NotAllowedError') S.folder.perm = 'prompt'; return false; }
  finally { S.backingUp = false; renderStatus(); renderBanner(); }
}

/* ================================================================ rejestr zdarzeń (RODO art. 5 ust. 2, art. 32 — rozliczalność) */
// One encrypted record per device per day: { id: 'YYYY-MM-DD_device', device, events: [{ at, user, action, detail, patientId }] } — synced like other data.
const DEVICE_ID = (() => { try { let d = localStorage.getItem('endolist:device'); if (!d) { d = V.uid(); localStorage.setItem('endolist:device', d); } return d; } catch { return 'dev'; } })();
const deviceName = () => { const u = navigator.userAgent; return /iPhone/.test(u) ? 'iPhone' : /iPad/.test(u) ? 'iPad' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : 'komputer'; };
const AUDIT_ACT = { admin: 'administracja', login: 'logowanie', lock: 'blokada', view: 'otwarcie karty pacjenta', 'letter-create': 'utworzenie listu', pdf: 'zapis PDF', print: 'drukowanie', email: 'wysłanie e-mailem', prodentis: 'eksport ProDentis', export: 'eksport danych pacjenta', delete: 'usunięcie danych', backup: 'pobranie kopii zapasowej', ai: 'użycie AI', sync: 'synchronizacja', security: 'bezpieczeństwo konta' };
const viewed = new Map();
function audit(action, detail = '', patientId = '') {
  if (!S.session || !S.data?.audit) return;
  if (action === 'view') { const k = patientId; if (Date.now() - (viewed.get(k) || 0) < 10 * 60000) return; viewed.set(k, Date.now()); }
  const id = `${today()}_${DEVICE_ID}`;
  const rec = D().audit.get(id) || { id, day: today(), device: deviceName(), events: [] };
  rec.events.push({ at: Date.now(), user: S.session.profile.username, action, detail, patientId: patientId || '' });
  save('audit', rec); flushSave.flush(); // written at once: the log must survive closing the app
}
function auditEvents() { return [...D().audit.values()].flatMap((r) => (r.events || []).map((e) => ({ ...e, device: r.device }))).sort((a, b) => b.at - a.at); }

/* ================================================================ model helpers */
function newToothRec(fdi, other = false) {
  return {
    fdi, config: 0, anatOk: false, roots: configRoots(anatomy(fdi).configs[0]),
    dx: { history: { cc: '', spontaneous: false, night: false, deep: false, status: 'virgin' }, tests: { cold: 'nt', heat: 'nt', ept: 'nt', eptVal: '', perc: 'nt', palp: 'nt', bite: 'nt', probe: '', probeIso: false, mob: '', swelling: 'none', sinus: 'no' }, radio: [], radioNote: '', pulp: '', peri: '' },
    // defaults describe the author's own routine; a visit by another dentist starts empty so nothing is assumed
    endo: { proc: '', status: 'done', anesth: other ? '' : 'infil', agent: '', dam: !other, micro: !other, irrig: other ? [] : ['naocl', 'edta'], naocl: '', medic: '', obtur: '', sealer: '', temp: '', material: '', findings: [], note: '' },
    work: [], rec: { restor: '', time: '30d', control: '', prog: '', note: '' },
  };
}
function newVisit(patientId = '', referrerId = '') { return { id: V.uid(), patientId, referrerId, date: today(), performer: 'self', otherDentist: '', teeth: [], notes: '', createdAt: Date.now(), updatedAt: Date.now() }; }
const curVisit = () => D().visits.get(S.visitId);
const curTooth = () => S.ws?.draft || null;
const patientName = (p) => (p ? [p.first, p.last].filter(Boolean).join(' ') : '');
const refName = (r) => (!r ? '' : r.kind === 'clinic' ? r.clinic || 'Klinika' : [r.title, r.first, r.last].filter(Boolean).join(' '));
const visitsOf = (pid) => [...D().visits.values()].filter((v) => v.patientId === pid).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
const lettersOf = (pid) => [...D().letters.values()].filter((l) => l.patientId === pid).sort((a, b) => b.createdAt - a.createdAt);
function toothSummary(rec) {
  const pr = ENDO[rec.endo?.proc];
  const bits = [];
  if (pr) bits.push(pr.short + (pr.consult ? '' : rec.endo.status === 'done' ? ' ✓' : rec.endo.status === 'stage' ? ' · etap I' : ' · plan'));
  for (const w of rec.work || []) bits.push(w.type === 'FILL' ? `Wyp.${w.cls ? ' kl. ' + w.cls : ''}` : WORK[w.type]?.short);
  if (!bits.length) { const d = finalDx(rec.dx); if (d.pulp) bits.push(PULP_DX[d.pulp].label); }
  return bits.join(' · ') || 'do uzupełnienia';
}

/* ================================================================ auth screens */
async function boot() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); S.installEvt = e; if (S.session) renderTop(); });
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  const profiles = await V.listProfiles();
  S.syncUrl = await defaultSyncUrl();
  // with a sync server, a new device starts at the login screen: the same login and password open the account everywhere
  if (!profiles.length && !S.syncUrl) renderOnboarding(); else renderLock(profiles);
}

/** Clinic branding (not sensitive) is mirrored to localStorage so it can be shown before login. */
function brandHTML() {
  let b = {}; try { b = JSON.parse(localStorage.getItem('endolist:brand') || '{}'); } catch {}
  const logos = [b.logo, b.groupLogo].filter(Boolean);
  if (b.light || logos.length) return `<div class="auth-brand">${b.light ? `<img class="light" src="${b.light}" alt="">` : ''}${logos.map((l) => `<img src="${l}" alt="">`).join('')}</div>`;
  return b.practice ? `<div class="auth-brand text">${esc(b.practice)}${b.group ? `<small>${esc(b.group)}</small>` : ''}</div>` : '';
}
function mirrorBrand() { try { const d = settings().doctor; localStorage.setItem('endolist:brand', JSON.stringify({ logo: d.logoDefault ? '' : d.logo, light: d.logoDefault && d.logo ? BRAND_LOGO_LIGHT : '', groupLogo: d.groupLogo, practice: d.practice, group: d.group })); } catch {} }
function authShell(inner, wide = false) { $('#root').innerHTML = `<div class="auth"><div class="auth-card ${wide ? 'wide' : ''}">${inner}</div></div>`; }

function renderLock(profiles, err = '') {
  const last = localStorage.getItem('endolist:lastUser') || profiles[0]?.username || '';
  authShell(`
    ${brandHTML()}<div class="auth-logo">${I('tooth')}</div>
    <h1>EndoList</h1><p class="lead">${profiles.length ? 'Zaloguj się, aby odblokować zaszyfrowane dane.' : 'Zaloguj się kontem EndoList — dane z innych urządzeń zostaną pobrane i odszyfrowane.'}</p>
    <form id="login" class="grid" autocomplete="on">
      <label class="f"><span>Login</span><input type="text" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" value="${esc(last)}" required></label>
      <label class="f"><span>Hasło</span><input type="password" name="password" autocomplete="current-password" required autofocus></label>
      <button class="btn btn-primary btn-lg" type="submit">${I('lock')} Odblokuj</button>
      <div class="err" id="err">${esc(err)}</div>
    </form>
    ${V.passkeySupported() && profiles.some((p) => (p.passkeys || []).length) ? `<div class="or">lub</div><button class="btn btn-soft btn-lg" style="width:100%" data-act="passkey-login">${I('key')} Zaloguj kluczem dostępu</button>` : ''}
    <div class="row" style="justify-content:center;margin-top:20px">
      <button class="btn btn-ghost btn-sm" data-act="new-account">${I('plus')} Nowe konto</button>
      <button class="btn btn-ghost btn-sm" data-act="restore-start">${I('folder')} Przywróć z kopii</button>
      <button class="btn btn-ghost btn-sm" data-act="sync-signin">${I('sync')} Konto z innego urządzenia</button>
    </div>`);
  const pw = $('[name=password]'); if (last) pw.focus(); else $('[name=username]').focus();
  $('#login').onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target), btn = e.target.querySelector('button');
    btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Odszyfrowywanie…';
    try { await passwordLogin(f.get('username'), f.get('password'), btn); }
    catch (er) { btn.disabled = false; btn.innerHTML = `${I('lock')} Odblokuj`; $('#err').textContent = er.message; }
  };
}

let OB = null;
function renderOnboarding(step = 0) {
  if (!OB) { OB = { doctor: clone(DEFAULT_SETTINGS.doctor), username: '', aiKey: '' }; brandLogoData().then((l) => { if (l && !OB.doctor.logo) { OB.doctor.logo = l; OB.doctor.logoDefault = true; if (OB.step === 1) { readOB(); renderOnboarding(1); } } }); }
  const steps = `<div class="steps">${[0, 1, 2, 3, 4].map((i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
  const d = OB.doctor;
  const titleOpts = DOC_TITLES.map((t) => `<option ${d.title === t ? 'selected' : ''}>${t}</option>`).join('');
  const body = [
    `<h1>Witaj w EndoList</h1><p class="lead">Kto będzie podpisywać listy?</p>
     <div class="grid g2">
      <label class="f"><span>Tytuł</span><select data-ob="title">${titleOpts}</select></label>
      <label class="f"><span>Forma</span><select data-ob="gender"><option value="f" ${d.gender === 'f' ? 'selected' : ''}>Pani</option><option value="m" ${d.gender === 'm' ? 'selected' : ''}>Pan</option></select></label>
      <label class="f"><span>Imię</span><input type="text" data-ob="first" value="${esc(d.first)}" autofocus></label>
      <label class="f"><span>Nazwisko</span><input type="text" data-ob="last" value="${esc(d.last)}"></label>
      <label class="f all"><span>Specjalizacja / opis (opcjonalnie)</span><input type="text" data-ob="specialty" value="${esc(d.specialty)}" placeholder="np. specjalista endodoncji"></label>
     </div><p class="hint" style="margin-top:10px">Forma (Pani/Pan) pozwala poprawnie odmieniać zwroty w listach, np. „mogłam/mogłem pomóc".</p>`,
    `<h1>Gabinet</h1><p class="lead">Dane do nagłówka listu.</p>
     <div class="grid g2">
      <label class="f"><span>Gabinet / klinika</span><input type="text" data-ob="practice" value="${esc(d.practice)}"></label>
      <label class="f"><span>Grupa</span><input type="text" data-ob="group" value="${esc(d.group)}"></label>
      <label class="f all"><span>Adres</span><input type="text" data-ob="address" value="${esc(d.address)}" placeholder="ul. Przykładowa 1, 50-001 Wrocław"></label>
      <label class="f"><span>Miejscowość (do daty)</span><input type="text" data-ob="city" value="${esc(d.city)}" placeholder="Wrocław"></label>
      <label class="f"><span>Nr prawa wykonywania zawodu</span><input type="text" data-ob="npwz" value="${esc(d.npwz)}" placeholder="opcjonalnie"></label>
      <label class="f"><span>Telefon</span><input type="tel" data-ob="phone" value="${esc(d.phone)}"></label>
      <label class="f"><span>E-mail</span><input type="email" data-ob="email" value="${esc(d.email)}"></label>
     </div>
     <div class="label">Logo kliniki i grupy</div>
     <div class="grid g2">${['logo', 'groupLogo'].map((k) => `<div class="logo-slot">${d[k] ? `<img src="${d[k]}" alt="">` : `<span class="faint small">${k === 'logo' ? 'Logo kliniki (np. Centrum Stomatologiczne)' : 'Logo grupy (np. Niewiński Group)'}</span>`}<div class="row" style="margin-top:8px"><button class="btn btn-sm" data-act="ob-logo" data-k="${k}">${d[k] ? 'Zmień' : 'Dodaj plik'}</button></div></div>`).join('')}</div>
     <input type="file" id="ob-logo-input" accept="image/*" hidden>`,
    `<h1>Podpis</h1><p class="lead">Dodaj skan podpisu, aby listy wyglądały profesjonalnie.</p>
     <div style="text-align:center">${d.signature ? `<img class="sig-prev" style="margin:0 auto 14px" src="${d.signature}" alt="">` : '<div class="hint" style="margin-bottom:14px">Najlepiej zdjęcie podpisu na białej kartce lub plik PNG.</div>'}
     <div class="row" style="justify-content:center"><button class="btn btn-soft" data-act="ob-sig">${I('plus')} ${d.signature ? 'Zmień' : 'Wybierz'} plik podpisu</button>${d.signature ? `<button class="btn btn-ghost" data-act="ob-sig-clear">Usuń</button>` : ''}</div>
     <div style="margin-top:16px"><label class="switch"><input type="checkbox" data-ob-check="useSignature" ${d.useSignature ? 'checked' : ''}><span class="track"><span class="thumb"></span></span>Umieszczaj podpis na listach</label></div></div>
     <input type="file" id="ob-sig-input" accept="image/*" hidden>`,
    `<h1>Zabezpieczenie</h1><p class="lead">Login i hasło chronią dane pacjentów. Dane są szyfrowane na urządzeniu.</p>
     <form id="ob-acc" class="grid">
      <label class="f"><span>Login</span><input type="text" name="username" autocomplete="username" value="${esc(OB.username || (d.first + (d.last ? '.' + d.last : '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\s+/g, ''))}" required></label>
      <label class="f"><span>Hasło (min. 12 znaków)</span><input type="password" name="pw" autocomplete="new-password" minlength="12" required></label>
      <label class="f"><span>Powtórz hasło</span><input type="password" name="pw2" autocomplete="new-password" minlength="12" required></label>
      ${S.syncUrl ? '<div class="hint" style="color:var(--accent)">Tym samym loginem i hasłem zalogujesz się na iPhonie i na innych komputerach — dane synchronizują się automatycznie (szyfrowane na urządzeniu).</div>' : ''}
      <div class="hint">Hasła nie da się odzyskać — bez niego nie ma dostępu do danych. Zapisz je w bezpiecznym miejscu. Po utworzeniu konta możesz dodać klucz dostępu (passkey), np. z iPhone'a.</div>
      <div class="err" id="err"></div>
     </form>`,
    `<h1>Gotowe</h1><p class="lead">Konto zostało utworzone. Dwie opcjonalne rzeczy:</p>
     <div class="grid">
      <div class="panel" style="padding:14px 16px"><div class="row"><b style="color:var(--strong)">${I('key')} Klucz dostępu (passkey)</b><span class="grow"></span><button class="btn btn-soft btn-sm" data-act="ob-passkey" ${V.passkeySupported() ? '' : 'disabled'}>Dodaj</button></div>
      <div class="hint" style="margin-top:6px">${V.passkeySupported() ? 'Logowanie Touch ID / Face ID / Windows Hello lub iPhone\'em (kod QR). Hasło nadal działa.' : 'Dostępne, gdy aplikacja jest otwarta przez https:// lub localhost.'}</div><div id="pk-state" class="small" style="margin-top:6px"></div></div>
      <div class="panel" style="padding:14px 16px"><b style="color:var(--strong)">${I('spark')} Asystent AI (Claude)</b>
      <div class="hint" style="margin:6px 0 10px">Klucz API z console.anthropic.com. Do AI trafiają wyłącznie dane kliniczne — bez imion, nazwisk i dat urodzenia. Bez klucza listy tworzy wbudowany generator.</div>
      <input type="password" id="ob-key" placeholder="sk-ant-…" value="${esc(OB.aiKey)}" autocomplete="off"></div>
     </div>`,
  ][step];
  const nav = step < 3 ? `<div class="row" style="margin-top:22px">${step ? `<button class="btn btn-ghost" data-act="ob-prev">${I('back')} Wstecz</button>` : `<span class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-act="sync-signin">${I('sync')} Mam konto na innym urządzeniu</button><button class="btn btn-ghost btn-sm" data-act="restore-start">${I('folder')} Mam kopię</button></span>`}<span class="grow"></span><button class="btn btn-primary" data-act="ob-next">Dalej</button></div>`
    : step === 3 ? `<div class="row" style="margin-top:22px"><button class="btn btn-ghost" data-act="ob-prev">${I('back')} Wstecz</button><span class="grow"></span><button class="btn btn-primary" data-act="ob-create">${I('shield')} Utwórz konto</button></div>`
      : `<div class="row" style="margin-top:22px"><span class="grow"></span><button class="btn btn-primary btn-lg" data-act="ob-finish">Zaczynamy</button></div>`;
  authShell(`<div class="auth-logo">${I('tooth')}</div>${steps}${body}${nav}`, true);
  OB.step = step;
  const si = $('#ob-sig-input'); if (si) si.onchange = async () => { const f = si.files[0]; if (f) { readOB(); OB.doctor.signature = await signatureData(f); renderOnboarding(2); } };
  const af = $('[autofocus]'); if (af) af.focus();
}
function readOB() { $$('[data-ob]').forEach((el) => { OB.doctor[el.dataset.ob] = el.value.trim(); }); $$('[data-ob-check]').forEach((el) => { OB.doctor[el.dataset.obCheck] = el.checked; }); }

/**
 * Login with login + password on any device:
 *  - account on this device → unlock locally (if the password was changed on another device, the server copy is used);
 *  - account not on this device → downloaded from the sync server and decrypted here.
 */
async function passwordLogin(username, password, btn) {
  const prof = await V.findProfile(username);
  if (prof) {
    try { return await enter(await V.unlockPassword(username, password), { password }); }
    catch (e) {
      const cfg = await loadConfig(prof.id);
      if (!cfg?.enabled || e.message !== 'Nieprawidłowe hasło.') throw e;
      try { const { session } = await signInFromServer({ url: cfg.url, login: cfg.login, password }); return await enter(session, { password }); }
      catch (e2) { throw e2.offline ? new Error('Nieprawidłowe hasło. (Jeśli zmieniono je na innym urządzeniu, połącz się z internetem.)') : e; }
    }
  }
  if (!S.syncUrl) throw new Error('Nie znaleziono takiego użytkownika na tym urządzeniu.');
  if (btn) btn.innerHTML = '<span class="spin"></span> Pobieranie danych z serwera…';
  const { session, cfg } = await signInFromServer({ url: S.syncUrl, login: username, password }).catch((e) => { if (e.code === 'removed') throw new Error('To konto zostało usunięte z gabinetu przez administratora.'); throw e; });
  const first = new SyncClient(session, cfg, {}); await first.now(); first.stop();
  if (first.status.state !== 'ok') throw new Error(first.status.msg || 'Nie udało się pobrać danych.');
  await enter(session, { password });
  toast('Dane pobrane z serwera i odszyfrowane na tym urządzeniu.', 'ok');
}

/** Existing accounts (e.g. created before the sync server existed) join sync at their next password login. */
async function autoEnableSync(password) {
  if (!S.syncUrl || !password || S.sync) return;
  if (await loadConfig(S.session.pid)) return; // enabled already, or switched off on purpose
  try {
    await enableSync(S.session, { url: S.syncUrl, login: S.session.profile.username, password });
    await startSync(); renderBanner();
    toast('Synchronizacja włączona — dane są teraz dostępne na innych urządzeniach z tym samym loginem.', 'ok');
  } catch (e) { S.syncProblem = e.status === 409 ? 'Login „' + S.session.profile.username + '" jest już zajęty na serwerze synchronizacji przez inne konto.' : e.message; renderBanner(); }
}

async function enter(session, { password } = {}) {
  S.session = session;
  localStorage.setItem('endolist:lastUser', session.profile.username);
  const all = await session.loadAll();
  S.data = { patients: all.patients || new Map(), visits: all.visits || new Map(), letters: all.letters || new Map(), referrers: all.referrers || new Map(), settings: all.settings || new Map(), audit: all.audit || new Map(), keys: all.keys || new Map() };
  if (!S.data.settings.get('main')) S.data.settings.set('main', clone(DEFAULT_SETTINGS));
  const st = settings(); for (const k of Object.keys(DEFAULT_SETTINGS)) if (typeof DEFAULT_SETTINGS[k] === 'object' && !Array.isArray(DEFAULT_SETTINGS[k])) st[k] = { ...DEFAULT_SETTINGS[k], ...(st[k] || {}) };
  if ((st.doctor.logoDefault || (!st.doctor.logo && isCentrum(st.doctor))) && !st.doctor.logoCleared) { const l = await brandLogoData(); if (l) { st.doctor.logo = l; st.doctor.logoDefault = true; save('settings', st); } }
  mirrorBrand();
  S.folder = new Folder(session.pid);
  if (fsSupported()) await S.folder.init();
  S.view = 'visit'; S.visitId = null;
  audit('login');
  renderApp();
  if (S.folder.ok()) backupNow();
  await startSync();
  await autoEnableSync(password);
}

/* ================================================================ synchronizacja (iPhone ↔ komputer ↔ przeglądarka) */
async function startSync() {
  const cfg = await loadConfig(S.session.pid);
  if (!cfg?.enabled) { S.sync = null; renderStatus(); return; }
  S.sync = new SyncClient(S.session, cfg, {
    onStatus: (st) => { S.syncStatus = { ...st }; renderStatus(); if (st.state === 'ok' && S.clinic && Date.now() - (S.clinicAt || 0) > 30000) { S.clinicAt = Date.now(); refreshClinic(); } },
    onRecords: applyRemote,
    onHeader: () => { if (S.view === 'settings' && !editing()) renderView(); },
    onRemoved: () => removedFromClinic(),
  });
  await S.sync.start();
  await initClinic();
}

/* ================================================================ gabinet i administratorzy */
async function initClinic() {
  if (!S.sync || S.clinic) return;
  S.clinic = new Clinic({ session: S.session, cfg: S.sync.cfg, token: await S.session.syncToken(), keys: D().keys, saveKey: async (k) => { save('keys', k); await flushSave.flush(); }, profileName: doctorName() });
  await refreshClinic();
  clearInterval(S.clinicTimer); S.clinicTimer = setInterval(() => { if (document.visibilityState === 'visible') refreshClinic(); }, 120000);
}
async function refreshClinic({ render = true } = {}) {
  if (!S.clinic) return;
  const wasAdmin = S.clinic.isAdmin(), had = !!S.org;
  try { S.org = await S.clinic.refresh(); } catch (e) { if (e.code === 'removed') return removedFromClinic(); console.warn('clinic', e); return; }
  if (render && (wasAdmin !== S.clinic.isAdmin() || had !== !!S.org)) { renderTop(); if (['settings', 'admin'].includes(S.view) && !editing()) renderView(); }
}
/** Removed by an administrator: clinic data is erased from this device (it stays with the clinic). */
async function removedFromClinic() {
  if (S.wiping) return; S.wiping = true;
  const pid = S.session.pid;
  try { await V.deleteProfile(pid); await V.kv.del(`dir:${pid}`); await V.kv.del(`lastBackup:${pid}`); localStorage.removeItem('endolist:lastUser'); } catch (e) { console.warn(e); }
  S.session = null; S.sync?.stop(); clearInterval(S.clinicTimer);
  renderLock(await V.listProfiles(), 'Administrator gabinetu usunął to konto. Dane gabinetu zostały usunięte z tego urządzenia.');
}
const editing = () => { const a = document.activeElement; return !!(a && a.closest('#view, #ws, .overlay') && (a.matches('input, textarea, select') || a.isContentEditable)); };
let remoteRender = false;
function applyRemote(changes) {
  let n = 0, top = false;
  for (const { store, id, obj } of changes) {
    if (!D()[store] || dirty.has(store + id)) continue; // a local edit is waiting to be saved — it is newer
    if (obj._deleted) D()[store].delete(id); else D()[store].set(id, obj);
    if (store === 'settings') { const st = settings(); for (const k of Object.keys(DEFAULT_SETTINGS)) if (typeof DEFAULT_SETTINGS[k] === 'object' && !Array.isArray(DEFAULT_SETTINGS[k])) st[k] = { ...DEFAULT_SETTINGS[k], ...(st[k] || {}) }; mirrorBrand(); top = true; }
    n++;
  }
  if (!n) return;
  scheduleBackup();
  if (top) renderTop();
  if (S.ws || editing() || document.querySelector('.overlay')) { remoteRender = true; return; } // never pull the rug out from under an open form
  renderView();
}
document.addEventListener('focusout', () => setTimeout(() => { if (remoteRender && S.session && !S.ws && !editing() && !document.querySelector('.overlay')) { remoteRender = false; renderView(); } }, 50));
const syncTime = (t) => (t ? new Date(t).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '—');

function syncSetupModal() {
  const def = S.syncUrl || '';
  modal({ title: 'Włącz synchronizację', body: `<p class="muted" style="margin-top:0">Dane są szyfrowane na tym urządzeniu, zanim trafią na serwer — serwer nie zna hasła ani klucza danych. Na iPhonie i innych urządzeniach zalogujesz się tym samym loginem i hasłem.</p>
    <div class="grid"><label class="f" ${def ? 'hidden' : ''}><span>Adres serwera synchronizacji</span><input type="url" id="sy-url" value="${esc(def)}" placeholder="https://endolist-sync.twoja-nazwa.workers.dev" autocomplete="url" inputmode="url"></label>
    <label class="f"><span>Login synchronizacji</span><input type="text" id="sy-login" value="${esc(S.session.profile.username)}" autocomplete="username" autocapitalize="none"></label>
    <label class="f"><span>Hasło konta (potwierdzenie)</span><input type="password" id="sy-pw" autocomplete="current-password"></label></div>
    <div class="hint" style="margin-top:8px">Jeżeli login jest zajęty na serwerze (inny lekarz), wybierz inny — np. z nazwiskiem.</div><div class="err" id="sy-err"></div>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('sync')} Włącz`, cls: 'btn-primary', onClick: async (ov, btn) => {
      const url = $('#sy-url', ov).value, login = $('#sy-login', ov).value.trim(), pw = $('#sy-pw', ov).value;
      const err = $('#sy-err', ov); err.textContent = '';
      if (!login) { err.textContent = 'Podaj login.'; return false; }
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Łączenie…'; }
      try {
        await V.unlockPassword(S.session.profile.username, pw); // confirms the password before it is used for the login token
        await enableSync(S.session, { url, login, password: pw }); audit('sync', 'włączono');
        S.syncUrl = normUrl(url); S.syncProblem = '';
        await startSync(); toast('Synchronizacja włączona.', 'ok'); renderView();
      } catch (er) { err.textContent = er.message; if (btn) { btn.disabled = false; btn.innerHTML = `${I('sync')} Włącz`; } return false; }
    } }] });
}
function syncSignInModal() {
  const def = S.syncUrl || '';
  modal({ title: 'Zaloguj się kontem z innego urządzenia', body: `<p class="muted" style="margin-top:0">Pobierze zaszyfrowane dane z serwera synchronizacji (np. z komputera w gabinecie) i odszyfruje je na tym urządzeniu Twoim hasłem.</p>
    <div class="grid"><label class="f" ${def ? 'hidden' : ''}><span>Adres serwera synchronizacji</span><input type="url" id="si-url" value="${esc(def)}" placeholder="https://endolist-sync.twoja-nazwa.workers.dev" autocomplete="url" inputmode="url"></label>
    <label class="f"><span>Login</span><input type="text" id="si-login" autocomplete="username" autocapitalize="none"></label>
    <label class="f"><span>Hasło</span><input type="password" id="si-pw" autocomplete="current-password"></label></div><div class="err" id="si-err"></div>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('sync')} Zaloguj`, cls: 'btn-primary', onClick: async (ov, btn) => {
      const url = $('#si-url', ov).value, login = $('#si-login', ov).value.trim(), pw = $('#si-pw', ov).value;
      const err = $('#si-err', ov); err.textContent = '';
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Pobieranie danych…'; }
      try {
        const { session, cfg } = await signInFromServer({ url, login, password: pw });
        localStorage.setItem('endolist:syncUrl', cfg.url); S.syncUrl = cfg.url;
        // first full download before showing the app
        const first = new SyncClient(session, cfg, {}); await first.now(); first.stop();
        if (first.status.state === 'error' || first.status.state === 'offline') throw new Error(first.status.msg);
        document.querySelector('.overlay')?.remove();
        await enter(session, { password: pw }); toast('Dane pobrane i odszyfrowane.', 'ok');
      } catch (er) { err.textContent = er.message; if (btn) { btn.disabled = false; btn.innerHTML = `${I('sync')} Zaloguj`; } return false; }
    } }] });
}

/* ================================================================ app shell */
function renderApp() {
  $('#root').innerHTML = `<div class="app"><header class="topbar" id="top"></header><div id="banner"></div><main id="view"></main><div id="actionbar"></div></div>`;
  renderTop(); renderBanner(); renderView();
}
function renderTop() {
  const st = settings();
  $('#top').innerHTML = `
    <div class="brand"><div class="mark">${I('tooth')}</div><div><b>EndoList</b><small>${esc(doctorName() || S.session.profile.username)}</small></div>${st.doctor.logo && st.doctor.logoDefault ? `<span class="clinic-logo dark"><img src="${BRAND_LOGO_LIGHT}" alt="${esc(st.doctor.practice)}"></span>` : st.doctor.logo ? `<span class="clinic-logo"><img src="${st.doctor.logo}" alt="${esc(st.doctor.practice)}"></span>` : st.doctor.practice ? `<span class="clinic-name">${esc(st.doctor.practice)}${st.doctor.group ? `<small>${esc(st.doctor.group)}</small>` : ''}</span>` : ''}</div>
    <nav class="nav">
      ${[['visit', 'tooth', 'Wizyta'], ['patients', 'users', 'Pacjenci'], ['referrers', 'link', 'Lekarze kierujący', 'Kierujący'], ['settings', 'gear', 'Ustawienia'], ...(S.clinic?.isAdmin() ? [['admin', 'shield', 'Administracja']] : [])].map(([v, ic, l, short]) => `<button data-nav="${v}" class="${S.view === v || (S.view === 'letter' && v === 'patients') || (S.view === 'patient' && v === 'patients') ? 'on' : ''}">${I(ic)}<span>${short ? `<i class="nl">${l}</i><i class="ns">${short}</i>` : l}</span></button>`).join('')}
    </nav>
    <div class="top-right">
      <span class="pill" id="status"></span>
      ${S.installEvt ? `<button class="btn btn-ghost btn-sm" data-act="install">${I('install')} Zainstaluj</button>` : ''}
      <button class="btn btn-ghost btn-icon" title="Zablokuj" data-act="lock">${I('lock')}</button>
    </div>`;
  void st; renderStatus();
}
function renderStatus() {
  const el = $('#status'); if (!el) return;
  let cls = 'pill', txt;
  if (S.saving || S.backingUp) { cls += ' busy'; txt = S.backingUp ? 'Kopia zapasowa…' : 'Zapisywanie…'; }
  else if (S.folder?.ok() && !S.folder.error && !S.sync) { cls += ' ok'; txt = `Zaszyfrowano · kopia ${S.folder.lastBackup ? new Date(S.folder.lastBackup).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : '—'}`; }
  else if (S.sync && S.syncStatus?.state === 'ok') { cls += ' ok'; txt = `Zsynchronizowano ${syncTime(S.syncStatus.last)}`; }
  else if (S.sync && S.syncStatus?.state === 'busy') { cls += ' busy'; txt = 'Synchronizacja…'; }
  else if (S.sync && S.syncStatus?.state === 'offline') { cls += ' warn'; txt = 'Offline · zsynchronizuje po połączeniu'; }
  else if (S.sync && S.syncStatus?.state === 'error') { cls += ' warn'; txt = 'Błąd synchronizacji'; }
  else { cls += ' warn'; txt = 'Zaszyfrowano · brak kopii w folderze'; }
  if (S.sync && S.syncStatus?.state === 'ok' && S.folder?.ok() && S.folder.lastBackup) txt += ` · kopia ${syncTime(S.folder.lastBackup)}`;
  el.className = cls; el.title = S.syncStatus?.msg || ''; el.innerHTML = `<span class="dot"></span><span class="txt">${esc(txt)}</span>`;
}
function renderBanner() {
  const b = $('#banner'); if (!b) return;
  let h = '';
  if (S.syncUrl && !S.sync) h = `<div class="banner warn"><span class="grow"><b>Dane są tylko na tym urządzeniu.</b> ${S.syncProblem ? esc(S.syncProblem) + ' ' : ''}Włącz synchronizację, aby mieć do nich dostęp na iPhonie i innych komputerach.</span><button class="btn btn-primary btn-sm" data-act="sync-setup">${I('sync')} Włącz</button></div>`;
  else if ((!fsSupported() || matchMedia('(pointer: coarse)').matches) && S.sync) h = ''; // phone: the computer keeps the folder backups
  else if (!fsSupported()) h = `<div class="banner warn"><span class="grow">Ta przeglądarka nie zapisuje automatycznie do folderu. Dla automatycznych kopii i archiwum listów użyj <b>Chrome</b> lub <b>Edge</b>. Kopię możesz pobrać w Ustawieniach albo włączyć <b>synchronizację</b> z komputerem.</span><button class="btn btn-sm" data-nav="settings">Ustawienia</button></div>`;
  else if (!S.folder.root) h = `<div class="banner info"><span class="grow"><b>Wybierz folder na komputerze</b> (np. Dokumenty › EndoList) — listy będą tam porządkowane według pacjentów, a zaszyfrowana kopia danych aktualizowana automatycznie.</span><button class="btn btn-primary btn-sm" data-act="folder-pick">${I('folder')} Wybierz folder</button></div>`;
  else if (!S.folder.ok()) h = `<div class="banner warn"><span class="grow"><b>Połącz ponownie folder „${esc(S.folder.root.name)}".</b> Po ponownym uruchomieniu przeglądarka prosi o zgodę. Dane w aplikacji są bezpieczne.</span><button class="btn btn-primary btn-sm" data-act="folder-reconnect">Połącz</button></div>`;
  else if (S.folder.error) h = `<div class="banner warn"><span class="grow"><b>Kopia nie powiodła się:</b> ${esc(S.folder.error)}</span><button class="btn btn-sm" data-act="backup-now">Spróbuj ponownie</button></div>`;
  else if (!settings().doctor.last) h = `<div class="banner info"><span class="grow">Uzupełnij dane lekarza i gabinetu, które pojawią się w nagłówku listu.</span><button class="btn btn-sm" data-nav="settings">Ustawienia</button></div>`;
  b.innerHTML = h;
}
function renderView() {
  const v = $('#view'); $('#actionbar').innerHTML = '';
  if (S.view === 'visit') { v.innerHTML = viewVisit(); afterVisit(); const pv = curVisit()?.patientId; if (pv) audit('view', 'wizyta', pv); }
  else if (S.view === 'patients') v.innerHTML = viewPatients();
  else if (S.view === 'patient') { v.innerHTML = viewPatient(); audit('view', '', S.patientId); }
  else if (S.view === 'referrers') v.innerHTML = viewReferrers();
  else if (S.view === 'settings') v.innerHTML = viewSettings();
  else if (S.view === 'admin') { v.innerHTML = viewAdmin(); fillAdmin(); }
  else if (S.view === 'letter') { v.innerHTML = viewLetter(); afterLetter(); const pl = D().letters.get(S.letterId)?.patientId; if (pl) audit('view', 'list', pl); }
  $$('#top .nav button').forEach((b) => b.classList.toggle('on', b.dataset.nav === S.view || (['letter', 'patient'].includes(S.view) && b.dataset.nav === 'patients')));
}
function go(view, opts = {}) { Object.assign(S, opts, { view }); renderView(); window.scrollTo(0, 0); renderBanner(); }

/* ================================================================ form helpers */
function val(path) {
  const [root, ...rest] = path.split('.'); const p = rest.join('.');
  const base = { v: curVisit(), t: curTooth(), s: settings(), L: D().letters.get(S.letterId)?.content }[root];
  return getPath(base, p);
}
function seg(path, opts, { bad = [], re = false } = {}) {
  const v = String(val(path) ?? '');
  return `<div class="seg" data-seg="${path}" ${re ? 'data-re="1"' : ''}>${Object.entries(opts).map(([k, l]) => `<button type="button" data-v="${esc(k)}" class="${v === k ? 'on' : ''} ${bad.includes(k) ? 'bad' : ''}">${esc(l)}</button>`).join('')}</div>`;
}
function inp(path, label, { type = 'text', ph = '', cls = '', list = '', area = false, rows = 2 } = {}) {
  const v = val(path) ?? '';
  const field = area ? `<textarea data-b="${path}" rows="${rows}" placeholder="${esc(ph)}">${esc(v)}</textarea>` : `<input type="${type}" data-b="${path}" value="${esc(v)}" placeholder="${esc(ph)}" ${list ? `list="${list}"` : ''}>`;
  return label ? `<label class="f ${cls}"><span>${label}</span>${field}</label>` : field;
}
function sel(path, label, opts, { cls = '', re = false } = {}) {
  const v = String(val(path) ?? '');
  return `<label class="f ${cls}">${label ? `<span>${label}</span>` : ''}<select data-b="${path}" ${re ? 'data-re="1"' : ''}>${Object.entries(opts).map(([k, l]) => `<option value="${esc(k)}" ${v === k ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
}
function chipsArr(path, opts) { const a = val(path) || []; return `<div class="chips">${Object.entries(opts).map(([k, l]) => `<label class="chip"><input type="checkbox" data-arr="${path}" value="${esc(k)}" ${a.includes(k) ? 'checked' : ''}>${esc(l)}</label>`).join('')}</div>`; }
function sw(path, label, { re = false } = {}) { return `<label class="switch"><input type="checkbox" data-b="${path}" ${val(path) ? 'checked' : ''} ${re ? 'data-re="1"' : ''}><span class="track"><span class="thumb"></span></span>${esc(label)}</label>`; }

/* ================================================================ VISIT */
function ensureVisit() {
  let v = curVisit();
  if (!v) { v = newVisit(); D().visits.set(v.id, v); S.visitId = v.id; }
  return v;
}
function visitMarks(v) {
  const marks = {}, inv = new Set();
  for (const t of v.teeth) { const m = markFor([{ visit: v, rec: t }]); if (m) marks[t.fdi] = m; else inv.add(t.fdi); }
  return { marks, inv };
}
function viewVisit() {
  const v = ensureVisit();
  const p = D().patients.get(v.patientId), r = D().referrers.get(v.referrerId);
  const { marks, inv } = visitMarks(v);
  return `
  <div class="visitbar">
    <button class="who ${p ? '' : 'empty'}" data-act="pick-patient"><span class="av">${p ? esc(initials(p.first, p.last).toUpperCase()) : I('user')}</span><span><small>Pacjent</small><b>${p ? esc(patientName(p)) : 'Wybierz pacjenta'}</b>${p && (p.pesel || p.dob) ? `<em>${p.pesel ? 'PESEL ' + esc(p.pesel) : 'ur. ' + fmtDate(p.dob)}</em>` : ''}</span></button>
    <button class="who ${r ? '' : 'empty'}" data-act="pick-referrer"><span class="av ref">${r ? esc((r.kind === 'clinic' ? (r.clinic || 'K')[0] : initials(r.first, r.last)).toUpperCase()) : I('link')}</span><span><small>Lekarz kierujący</small><b>${r ? esc(refName(r)) : 'Wybierz adresata'}</b></span></button>
    <label class="f datebox"><span>Data wizyty</span><input type="date" data-b="v.date" value="${esc(v.date)}"></label>
    <div class="f"><span>Kto leczył</span>${seg('v.performer', { self: doctorName() ? `Ja (${doctorName()})` : "Ja", other: 'Inny lekarz' }, { re: true })}</div>
    ${v.performer === 'other' ? `<label class="f" style="min-width:220px"><span>Lekarz / gabinet</span><input type="text" data-b="v.otherDentist" value="${esc(v.otherDentist)}" placeholder="np. lek. dent. Jan Nowak"></label>` : ''}
    <span class="grow"></span>
    <button class="btn btn-ghost" data-act="new-visit">${I('plus')} Nowa wizyta</button>
  </div>
  <div class="visit2">
    <section class="panel">
      <header><h3>Uzębienie</h3><span class="sub">Kliknij ząb, aby otworzyć jego kartę · numeracja FDI</span></header>
      <div class="arch-wrap" id="arch">${archSVG({ marks, selected: null, multi: inv })}</div>
      <div class="legend"><span><i class="lg-endo"></i>leczenie kanałowe</span><span><i class="lg-stage"></i>w trakcie</span><span><i class="lg-work"></i>inne prace</span><span><i class="lg-plan"></i>plan / konsultacja</span></div>
    </section>
    <section class="panel vside">
      <header><h3>Zęby w tej wizycie</h3><span class="sub" id="vcount">${v.teeth.length || ''}</span></header>
      <div class="body" id="vteeth">${visitTeethList(v)}</div>
      <div class="body" style="border-top:1px solid var(--line)">
        <div class="row" style="margin-bottom:8px"><span class="label" style="margin:0">Uwagi do całej wizyty</span><span class="grow"></span>${micBtn('v.notes')}</div>
        <textarea data-b="v.notes" rows="3" placeholder="Opcjonalnie — np. ogólny stan, zalecenia dla pacjenta. AI uwzględni je w liście.">${esc(v.notes)}</textarea>
      </div>
    </section>
  </div>`;
}
function visitTeethList(v) {
  if (!v.teeth.length) return `<div class="empty" style="padding:36px 10px"><b>Brak zębów</b>Kliknij ząb na schemacie — otworzy się powiększona karta zęba z jego anatomią.</div>`;
  return v.teeth.map((t) => { const d = finalDx(t.dx), ti = toothInfo(t.fdi);
    return `<button class="vtooth" data-open-tooth="${t.fdi}"><span class="vt-num">${t.fdi}</span><span class="grow"><b>${esc(ti.name[0].toUpperCase() + ti.name.slice(1))}</b><small>${esc(toothSummary(t))}</small>${d.pulp || d.peri ? `<small class="faint">${esc([d.pulp && PULP_DX[d.pulp].label, d.peri && PERI_DX[d.peri].label].filter(Boolean).join(' · '))}</small>` : ''}</span><span class="vt-edit">${I('edit')}</span></button>`; }).join('');
}
function afterVisit() {
  const v = curVisit(), n = v.teeth.length;
  $('#actionbar').innerHTML = `<div class="actionbar"><span class="sum">${n ? `<b>${n}</b> ${n === 1 ? 'ząb' : n < 5 ? 'zęby' : 'zębów'}: ${v.teeth.map((t) => t.fdi).join(', ')}` : 'Kliknij ząb na schemacie'}</span>
    <button class="btn" data-act="save-visit">${I('check')} Zapisz wizytę</button>
    <button class="btn btn-primary btn-xl" data-act="gen-letter" ${n ? '' : 'disabled'}>${I('spark')} Generuj list</button></div>`;
}
function refreshVisit() {
  const v = curVisit(); if (!v || S.view !== 'visit') return;
  const { marks, inv } = visitMarks(v);
  $('#arch').innerHTML = archSVG({ marks, selected: S.ws?.fdi ?? null, multi: inv });
  $('#vteeth').innerHTML = visitTeethList(v); $('#vcount').textContent = v.teeth.length || '';
  afterVisit();
}

/* ================================================================ TOOTH WORKSPACE (powiększona karta zęba) */
function openTooth(fdi) {
  const v = curVisit(), ex = v.teeth.find((t) => t.fdi === fdi);
  S.ws = { fdi, isNew: !ex, draft: clone(ex || newToothRec(fdi, v.performer === 'other')), dirty: !ex };
  S.ttab = 'anat';
  const ov = document.createElement('div'); ov.className = 'ws-overlay'; ov.id = 'ws';
  ov.innerHTML = workspaceHTML();
  $('#modal-root').appendChild(ov);
  mount3D(); renderDx(); refreshVisit();
}
function workspaceHTML() {
  const t = S.ws.draft, ti = toothInfo(t.fdi);
  const counts = { anat: (t.roots || []).reduce((a, r) => a + r.canals.length, 0), work: (t.work || []).length, mat: (t.products || []).length, manual: t.manual ? '✓' : '' };
  const tabs = [['anat', 'Anatomia', counts.anat], ['dx', 'Badanie i rozpoznanie'], ['endo', 'Endodoncja', t.endo.proc ? '✓' : ''], ['work', 'Inne prace', counts.work || ''], ['mat', 'Materiały i sprzęt', counts.mat || ''], ['manual', 'Opis własny', counts.manual], ['rec', 'Zalecenia']];
  return `<div class="ws" role="dialog" aria-modal="true" aria-label="Ząb ${t.fdi}">
    <header class="ws-head"><div class="tp-num">${t.fdi}</div><div class="grow"><div class="ws-title">${esc(ti.name[0].toUpperCase() + ti.name.slice(1))}</div><div class="tp-name" id="ws-sum">${esc(toothSummary(t))}</div></div>
      ${S.ws.isNew ? '' : `<button class="btn btn-ghost btn-sm btn-danger" data-act="rm-tooth">${I('trash')} Usuń ząb</button>`}
      <button class="btn btn-ghost" data-act="ws-cancel">Anuluj</button>
      <button class="btn btn-primary" data-act="ws-save">${I('check')} Zapisz ząb</button></header>
    <div class="ws-body">
      <div class="ws-left">
        <div class="stage" id="stage"></div>
        <div class="stage-bar"><label class="switch"><input type="checkbox" id="xray" ${S.xray !== false ? 'checked' : ''}><span class="track"><span class="thumb"></span></span>Widok rentgenowski</label><label class="switch"><input type="checkbox" id="flat2d" ${localStorage.getItem('endolist:no3d') === '1' ? 'checked' : ''}><span class="track"><span class="thumb"></span></span>Widok 2D</label><span class="grow"></span><span class="hint">Przeciągnij, aby obrócić</span></div>
        <div class="stage-legend"><span><i style="background:#ff3b66"></i>miazga / kanał</span><span><i style="background:#14d8c0"></i>wypełnienie kanałowe</span><span><i style="background:#9a86ff"></i>kanał boczny</span></div>
      </div>
      <div class="ws-right"><div class="tabs" id="ws-tabs">${tabs.map(([k, l, b]) => `<button data-ttab="${k}" class="${S.ttab === k ? 'on' : ''}">${l}${b ? ` <span class="badge">${b}</span>` : ''}</button>`).join('')}</div>
        <div class="tp-body" id="ws-tab">${tabBody(t)}</div></div>
    </div></div>`;
}
const tabBody = (t) => ({ anat: tabAnat, dx: tabDx, endo: tabEndo, work: tabWork, mat: tabMat, manual: tabManual, rec: tabRec }[S.ttab])(t);
function refreshWorkspace({ tabs = true, model = false } = {}) {
  if (!S.ws) return;
  const t = S.ws.draft;
  if (tabs) { const y = $('#ws-tab').scrollTop; const nb = document.createElement('div'); nb.innerHTML = workspaceHTML(); $('#ws-tabs').innerHTML = nb.querySelector('#ws-tabs').innerHTML; $('#ws-tab').innerHTML = tabBody(t); $('#ws-tab').scrollTop = y; renderDx(); }
  $('#ws-sum').textContent = toothSummary(t);
  if (model) update3D();
}
function opts3D(t) { return { done: t.endo.status === 'done' && !!ENDO[t.endo.proc]?.obt, all: true }; }
function mount3D() {
  const el = $('#stage'), t = S.ws.draft;
  const flat = (why) => {
    if (why) console.warn('3D unavailable — 2D drawing instead:', why);
    if (S.t3d) { try { S.t3d.dispose(); } catch {} S.t3d = null; }
    if (!$('#stage')) return;
    el.innerHTML = toothDetailSVG(S.ws?.draft || t, { done: opts3D(S.ws?.draft || t).done ? 'all' : false }); el.classList.add('flat');
    const xr = $('#xray')?.closest('label'); if (xr) xr.hidden = true;
  };
  if (localStorage.getItem('endolist:no3d') === '1' || !webglOk()) return flat(localStorage.getItem('endolist:no3d') === '1' ? 'turned off' : 'no WebGL 2');
  let retried = false;
  const start = () => {
    S.t3d = new Tooth3D(el); S.t3d.xray = S.xray !== false; S.t3d.setTooth(S.ws?.draft || t, opts3D(S.ws?.draft || t));
    const mine = S.t3d;
    // health check: after opening and after every resize (e.g. maximising the window) the tooth must really be drawn
    const check = () => {
      if (S.t3d !== mine) return;
      if (drewSomething(mine)) return;
      if (!retried) { retried = true; try { mine.dispose(); } catch {} S.t3d = null; el.innerHTML = ''; try { start(); } catch (e) { flat(e); } return; }
      flat('nothing rendered');
    };
    mine.onResized = debounce(check, 900);
    mine.renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); if (!retried) { retried = true; setTimeout(() => { if (S.t3d === mine) { try { mine.dispose(); } catch {} S.t3d = null; el.innerHTML = ''; try { start(); } catch (er) { flat(er); } } }, 300); } else flat('context lost'); });
    setTimeout(check, 1500);
  };
  try { start(); } catch (e) { flat(e); }
}
const update3D = debounce(() => { if (!S.ws) return; const t = S.ws.draft; if (S.t3d) S.t3d.setTooth(t, opts3D(t)); else $('#stage').innerHTML = toothDetailSVG(t, { done: opts3D(t).done ? 'all' : false }); }, 120);
function closeWorkspace() { if (S.t3d) { S.t3d.dispose(); S.t3d = null; } $('#ws')?.remove(); S.ws = null; refreshVisit(); }
function saveWorkspace() {
  const v = curVisit(), t = S.ws.draft;
  const i = v.teeth.findIndex((x) => x.fdi === t.fdi);
  if (i >= 0) v.teeth[i] = t; else v.teeth.push(t);
  v.teeth.sort((a, b) => a.fdi - b.fdi);
  save('visits', v); toast(`Zapisano ząb ${t.fdi}.`, 'ok'); closeWorkspace();
}

function tabAnat(t) {
  const a = anatomy(t.fdi), n = t.roots.length;
  return `<div class="hintbox"><b>Najczęstsza anatomia:</b> ${esc(a.hint)}</div>
    <div class="label">Konfiguracja${t.anatOk ? '' : ' <span class="todo">— kliknij, aby potwierdzić</span>'}</div>
    <div class="chips">${a.configs.map((c, i) => `<button class="chip ${t.config === i && t.anatOk ? 'on' : ''}" data-act="cfg" data-i="${i}">${esc(c.label)}</button>`).join('')}</div>
    <div class="label">Liczba korzeni</div>
    <div class="seg">${[1, 2, 3, 4].map((k) => `<button data-act="roots" data-n="${k}" class="${n === k ? 'on' : ''}">${k}</button>`).join('')}</div>
    <div class="label">Korzenie i kanały</div>
    ${t.roots.map((r, ri) => `<div class="rootcard"><div class="rh">${esc(r.label || 'korzeń')} <small>${r.canals.length} ${r.canals.length === 1 ? 'kanał' : r.canals.length < 5 ? 'kanały' : 'kanałów'}</small><span class="grow"></span>
      <select data-b="t.roots.${ri}.lateral" class="mini" title="Kanał boczny">${Object.entries(LATERAL).map(([k, l]) => `<option value="${k}" ${r.lateral === k ? 'selected' : ''}>${k ? 'Kanał boczny: ' + l : 'Kanał boczny: brak'}</option>`).join('')}</select></div>
      <div class="chips">${r.canals.map((c, ci) => `<span class="canal-chip"><input data-b="t.roots.${ri}.canals.${ci}.name" value="${esc(c.name)}" aria-label="Nazwa kanału"><button data-act="rm-canal" data-r="${ri}" data-c="${ci}" title="Usuń kanał">×</button></span>`).join('')}
      ${[...new Set([...(anatomy(t.fdi).extra || []), 'dodatkowy'])].filter((x) => !r.canals.some((c) => c.name === x)).slice(0, 5).map((x) => `<button class="chip add" data-act="add-canal" data-r="${ri}" data-name="${esc(x)}">+ ${esc(x)}</button>`).join('')}</div></div>`).join('')}
    <div class="hint" style="margin-top:12px">Model po lewej odświeża się na bieżąco. Długości robocze wpiszesz w zakładce Endodoncja.</div>`;
}

function tabDx(t) {
  return `<div class="label">Wywiad</div>
    <div class="row nowrap">${inp('t.dx.history.cc', '', { ph: 'Powód zgłoszenia, np. ból przy nagryzaniu od 2 tygodni' })}${micBtn('t.dx.history.cc')}</div>
    <div class="row" style="margin-top:10px;gap:16px">${sw('t.dx.history.spontaneous', 'Ból samoistny')}${sw('t.dx.history.night', 'Ból nocny')}${sw('t.dx.history.deep', 'Głęboka próchnica / obnażenie')}</div>
    <div class="test" style="margin-top:8px"><span>Stan zęba</span>${seg('t.dx.history.status', { virgin: 'nieleczony', treated: 'leczony kanałowo', initiated: 'leczenie rozpoczęte' })}</div>
    <div class="label">Testy</div>
    <div class="test"><span>Zimno</span>${seg('t.dx.tests.cold', T_COLD, { bad: ['exag', 'ling', 'nr'] })}</div>
    <div class="test"><span>Test elektryczny</span><div class="row">${seg('t.dx.tests.ept', T_EPT, { bad: ['neg'] })}<input type="text" data-b="t.dx.tests.eptVal" value="${esc(t.dx.tests.eptVal)}" placeholder="wynik" style="width:90px;height:34px"></div></div>
    <div class="test"><span>Ciepło</span>${seg('t.dx.tests.heat', T_HEAT, { bad: ['ling', 'nr'] })}</div>
    <div class="test"><span>Opukiwanie</span>${seg('t.dx.tests.perc', T_PERC, { bad: ['pain'] })}</div>
    <div class="test"><span>Palpacja</span>${seg('t.dx.tests.palp', T_PALP, { bad: ['pain'] })}</div>
    <div class="test"><span>Nagryzanie</span>${seg('t.dx.tests.bite', T_BITE, { bad: ['pain', 'release'] })}</div>
    <div class="test"><span>Kieszonki</span><div class="row"><input type="number" min="0" max="15" data-b="t.dx.tests.probe" value="${esc(t.dx.tests.probe)}" placeholder="maks. mm" style="width:110px;height:34px">${sw('t.dx.tests.probeIso', 'izolowana wąska')}</div></div>
    <div class="test"><span>Ruchomość</span>${seg('t.dx.tests.mob', T_MOB, { bad: ['II', 'III'] })}</div>
    <div class="test"><span>Obrzęk</span>${seg('t.dx.tests.swelling', T_SWELL, { bad: ['intra', 'extra'] })}</div>
    <div class="test"><span>Przetoka</span>${seg('t.dx.tests.sinus', T_SINUS, { bad: ['yes'] })}</div>
    <div class="label">RTG / CBCT</div>
    ${chipsArr('t.dx.radio', RADIO)}
    <div class="row nowrap" style="margin-top:8px">${inp('t.dx.radioNote', '', { ph: 'Dodatkowy opis, np. zmiana ok. 4 mm przy wierzchołku korzenia bliższego' })}${micBtn('t.dx.radioNote')}</div>
    <div class="label">Rozpoznanie</div><div id="dxbox"></div>
    <div class="grid g2" style="margin-top:10px">
      ${sel('t.dx.pulp', 'Miazga (zmień ręcznie)', { '': 'jak sugerowane', ...Object.fromEntries(Object.entries(PULP_DX).map(([k, v]) => [k, v.label])) })}
      ${sel('t.dx.peri', 'Tkanki okołowierzchołkowe', { '': 'jak sugerowane', ...Object.fromEntries(Object.entries(PERI_DX).map(([k, v]) => [k, v.label])) })}
    </div>`;
}
function renderDx() {
  const el = $('#dxbox'), t = curTooth(); if (!el || !t) return;
  const s = suggestDx(t.dx);
  const one = (k, map, why) => `<div><div class="k">${k}</div><div class="v">${s[why] ? esc(map[s[why]].label) + (map[s[why]].icd ? `<span class="icd">${map[s[why]].icd}</span>` : '') : '—'}</div>${s.why[why].length ? `<ul>${s.why[why].map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}</div>`;
  el.innerHTML = `<div class="dxbox"><div class="grid g2">${one('Sugestia: miazga', PULP_DX, 'pulp')}${one('Sugestia: tkanki okołowierzchołkowe', PERI_DX, 'peri')}</div>
    ${s.warn.map((w) => `<div class="warnline">${esc(w)}</div>`).join('')}<div class="hint" style="margin-top:8px">Terminologia AAE, kody ICD-10. Sugestia na podstawie wpisanych danych — zawsze do potwierdzenia klinicznego.</div></div>`;
}

function quickOn(t, key) {
  const e = t.endo, [f, v] = key.split(':');
  if (!v) return !!e[f];
  if (f === 'irrig') return (e.irrig || []).includes(v);
  return e[f] === v;
}
function quickToggle(t, key) {
  const e = t.endo, [f, v] = key.split(':'), on = quickOn(t, key);
  if (!v) e[f] = !on;
  else if (f === 'irrig') e.irrig = on ? e.irrig.filter((x) => x !== v) : [...(e.irrig || []), v];
  else e[f] = on ? '' : v;
  // ticking any treatment step means root canal treatment was done (rubber dam / microscope alone do not)
  if (!on && !e.proc && !['dam', 'micro'].includes(f)) { e.proc = 'RCT'; e.status = f === 'medic' && !e.obtur ? 'stage' : 'done'; }
}
function tabEndo(t) {
  const e = t.endo, pr = ENDO[e.proc];
  const procs = { '': '— brak leczenia endodontycznego —', ...Object.fromEntries(Object.entries(ENDO).map(([k, v]) => [k, v.label])) };
  const quick = `<div class="label">Najczęstsze — zaznacz</div><div class="chips">${QUICK.map(([k, l]) => `<button class="chip ${quickOn(t, k) ? 'on' : ''}" data-quick="${esc(k)}">${quickOn(t, k) ? '✓ ' : ''}${esc(l)}</button>`).join('')}</div>`;
  if (!pr) return `${sel('t.endo.proc', 'Procedura', procs, { re: true })}${quick}<div class="hint" style="margin-top:10px">Wybierz procedurę endodontyczną. Prace inne niż endodontyczne dodasz w zakładce „Inne prace", a wszystko, czego nie ma w formularzu — w zakładce „Opis własny".</div>`;
  const canals = t.roots.flatMap((r, ri) => r.canals.map((c, ci) => ({ c, ri, ci })));
  return `<div class="grid g3">${sel('t.endo.proc', 'Procedura', procs, { cls: 'span2', re: true })}${pr.consult ? '' : `<div class="f"><span>Status</span>${seg('t.endo.status', ENDO_STATUS, { re: true })}</div>`}</div>
    ${pr.consult ? `<div class="row nowrap" style="margin-top:12px">${inp('t.endo.note', 'Opis konsultacji', { area: true, rows: 4, ph: 'Wnioski z konsultacji, zalecany plan leczenia…' })}${micBtn('t.endo.note')}</div>` : e.status === 'planned' ? `<div style="margin-top:12px">${inp('t.endo.note', 'Uwagi', { area: true, rows: 2 })}</div>` : `
    ${quick}
    <div class="label">Znieczulenie</div>
    <div class="test"><span>Rodzaj</span>${seg('t.endo.anesth', ANESTH)}</div>
    <div class="row" style="margin:6px 0 4px"><input type="text" data-b="t.endo.agent" value="${esc(e.agent)}" list="dl-anesth" placeholder="Środek i dawka, np. Ubistesin forte, 1 karpula"></div>
    <datalist id="dl-anesth">${PRODUCTS.anesth.map((x) => `<option>${esc(x)}</option>`).join('')}</datalist>
    ${pr.canals ? `<div class="label">Kanały — długość robocza</div>
    <table class="wl"><thead><tr><th>Kanał</th><th>DR (mm)</th><th>Punkt odniesienia</th><th>Rozmiar końcowy</th></tr></thead><tbody>
    ${canals.map(({ c, ri, ci }) => `<tr><td>${esc(canalLabel(c.name))}</td><td><input type="text" inputmode="decimal" data-b="t.roots.${ri}.canals.${ci}.wl" value="${esc(c.wl)}" placeholder="21,0"></td><td><input type="text" data-b="t.roots.${ri}.canals.${ci}.ref" value="${esc(c.ref)}" placeholder="np. guzek MB"></td><td><input type="text" data-b="t.roots.${ri}.canals.${ci}.maf" value="${esc(c.maf)}" placeholder="np. 35/.04"></td></tr>`).join('')}
    </tbody></table><div class="hint">${t.anatOk ? 'Kanały pochodzą z zakładki Anatomia.' : '<span class="todo">Liczba kanałów nie jest jeszcze potwierdzona</span> — wybierz konfigurację w zakładce Anatomia lub wpisz długości robocze.'}</div>
    <div class="label">Płukanie</div>${chipsArr('t.endo.irrig', IRRIG)}
    ${e.irrig.includes('naocl') ? `<div style="max-width:200px;margin-top:8px">${inp('t.endo.naocl', 'Stężenie NaOCl (%)', { ph: 'np. 5,25' })}</div>` : ''}` : ''}
    <div class="grid g2" style="margin-top:14px">
      ${pr.obt && e.status === 'done' ? sel('t.endo.obtur', 'Wypełnienie kanałów', OBTUR, { re: true }) + `<label class="f"><span>Uszczelniacz</span><input type="text" data-b="t.endo.sealer" value="${esc(e.sealer)}" list="dl-sealer" placeholder="np. AH Plus, BioRoot RCS"></label>` : ''}
      ${pr.canals ? sel('t.endo.medic', 'Opatrunek leczniczy w kanale', MEDIC) : ''}
      ${pr.material ? `<label class="f"><span>Materiał</span><input type="text" data-b="t.endo.material" value="${esc(e.material)}" list="dl-mat" placeholder="np. Biodentine"></label>` : ''}
      ${pr.surgical && e.proc === 'IND' ? '' : sel('t.endo.temp', 'Zaopatrzenie zęba po zabiegu', TEMP)}
    </div>
    <datalist id="dl-sealer">${[...SEALER, ...PRODUCTS.sealer, ...custom('sealer')].map((s) => `<option>${esc(s)}</option>`).join('')}</datalist><datalist id="dl-mat">${[...MATERIAL_ENDO, ...PRODUCTS.repair, ...custom('repair')].map((s) => `<option>${esc(s)}</option>`).join('')}</datalist>
    <div class="label">Obserwacje śródzabiegowe</div>${chipsArr('t.endo.findings', FINDINGS)}
    <div class="row nowrap" style="margin-top:12px">${inp('t.endo.note', 'Dodatkowe uwagi do listu', { area: true, rows: 2, ph: 'Opcjonalnie' })}${micBtn('t.endo.note')}</div>`}`;
}

function tabWork(t) {
  const matOpts = { '': '—', ...Object.fromEntries(FILL_MAT.map((m) => [m, m])) };
  const items = (t.work || []).map((w, i) => {
    let body = '';
    if (w.type === 'FILL') body = `<div class="f"><span>Klasa wg Blacka</span>${seg(`t.work.${i}.cls`, { I: 'I', II: 'II', III: 'III', IV: 'IV', V: 'V', VI: 'VI' })}</div>
      ${w.cls ? `<div class="hint" style="margin:6px 0 2px">${esc(BLACK[w.cls])}</div>` : ''}
      <div class="f" style="margin-top:10px"><span>Powierzchnie</span><div class="chips">${Object.entries(SURFACES).map(([k, l]) => `<label class="chip" title="${esc(l)}"><input type="checkbox" data-arr="t.work.${i}.surf" value="${k}" ${(w.surf || []).includes(k) ? 'checked' : ''}>${k}</label>`).join('')}</div></div>
      <div class="grid g2" style="margin-top:10px">${sel(`t.work.${i}.mat`, 'Rodzaj materiału', matOpts)}<label class="f"><span>Produkt</span><input type="text" data-b="t.work.${i}.product" value="${esc(w.product || '')}" list="dl-comp" placeholder="np. Filtek One Bulk Fill"></label></div>
      <div style="margin-top:10px">${inp(`t.work.${i}.note`, 'Uwagi', { ph: 'opcjonalnie' })}</div>`;
    else if (w.type === 'BUILDUP') body = `<div class="grid g2">${sel(`t.work.${i}.mat`, 'Materiał', matOpts)}${sel(`t.work.${i}.postType`, 'Wkład', { '': 'bez wkładu', ...POST_TYPE })}<label class="f all"><span>Produkt</span><input type="text" data-b="t.work.${i}.product" value="${esc(w.product || '')}" list="dl-post" placeholder="np. Rebilda DC, RelyX Fiber Post"></label></div><div style="margin-top:10px">${inp(`t.work.${i}.note`, 'Uwagi', { ph: 'opcjonalnie' })}</div>`;
    else if (w.type === 'POST') body = `<div class="grid g2">${sel(`t.work.${i}.postType`, 'Rodzaj wkładu', { '': '—', ...POST_TYPE })}<label class="f"><span>Produkt</span><input type="text" data-b="t.work.${i}.product" value="${esc(w.product || '')}" list="dl-post"></label></div><div style="margin-top:10px">${inp(`t.work.${i}.note`, 'Uwagi', { ph: 'opcjonalnie' })}</div>`;
    else if (w.type === 'IMPLPREP') body = `${chipsArr(`t.work.${i}.prep`, IMPL_PREP)}<div style="margin-top:10px">${inp(`t.work.${i}.note`, 'Uwagi', { ph: 'opcjonalnie' })}</div>`;
    else body = `<div class="row nowrap">${inp(`t.work.${i}.note`, w.type === 'OTHER' ? 'Opis procedury' : 'Uwagi', { ph: w.type === 'OTHER' ? 'Opisz wykonaną procedurę' : 'opcjonalnie', area: w.type === 'OTHER', rows: 3 })}${micBtn(`t.work.${i}.note`)}</div>`;
    return `<div class="workcard"><div class="wh">${esc(WORK[w.type].label)}<span class="grow"></span><button class="btn btn-ghost btn-sm" data-act="rm-work" data-i="${i}">${I('x')}</button></div>${body}</div>`;
  }).join('');
  return `${items || '<div class="hint" style="margin-bottom:12px">Brak innych prac przy tym zębie.</div>'}
    <datalist id="dl-comp">${[...PRODUCTS.composite, ...custom('composite')].map((x) => `<option>${esc(x)}</option>`).join('')}</datalist><datalist id="dl-post">${[...PRODUCTS.post, ...custom('post')].map((x) => `<option>${esc(x)}</option>`).join('')}</datalist>
    <div class="label">Dodaj pracę</div><div class="chips">${Object.entries(WORK).map(([k, v]) => `<button class="chip add" data-act="add-work" data-type="${k}">+ ${esc(v.label)}</button>`).join('')}</div>
    <div class="hint" style="margin-top:12px">Nie ma tu wykonanej procedury? Opisz ją w zakładce <b>Opis własny</b> — AI włączy ją do listu.</div>`;
}

const custom = (cat) => (settings().customProducts || {})[cat] || [];
function tabMat(t) {
  const cat = S.matCat || 'files';
  const all = [...PRODUCTS[cat], ...custom(cat)];
  const chosen = t.products || [];
  return `<div class="label">Użyte materiały i sprzęt</div>
    <div class="chips">${chosen.length ? chosen.map((x, i) => `<span class="chip on prod">${esc(x.name)}<small>${esc(PRODUCT_CATS[x.cat] || '')}</small><button data-act="rm-prod" data-i="${i}">×</button></span>`).join('') : '<span class="hint">Nic jeszcze nie dodano.</span>'}</div>
    <div class="label">Dodaj</div>
    <div class="grid g2"><label class="f"><span>Kategoria</span><select id="mat-cat">${Object.entries(PRODUCT_CATS).map(([k, l]) => `<option value="${k}" ${k === cat ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label class="f"><span>Nazwa (wybierz lub wpisz własną)</span><div class="row nowrap"><input type="text" id="mat-name" list="dl-cat" placeholder="Zacznij pisać…"><button class="btn btn-soft" data-act="add-prod">${I('plus')}</button></div></label></div>
    <datalist id="dl-cat">${all.map((x) => `<option>${esc(x)}</option>`).join('')}</datalist>
    <div class="label">Szybki wybór — ${esc(PRODUCT_CATS[cat])}</div>
    <div class="chips">${all.length ? all.map((x) => `<button class="chip add ${chosen.some((c) => c.name === x) ? 'on' : ''}" data-act="pick-prod" data-name="${esc(x)}">${esc(x)}</button>`).join('') : '<span class="hint">Brak podpowiedzi — wpisz nazwę powyżej.</span>'}</div>
    <div class="hint" style="margin-top:12px">Produkty wpisane ręcznie są zapamiętywane i pojawią się jako podpowiedzi przy kolejnych zębach. Lista podpowiedzi obejmuje popularne produkty dostępne w Polsce — można dopisać dowolne inne.</div>`;
}
function tabManual(t) {
  return `<div class="hintbox">Opisz własnymi słowami pracę, której nie ma w formularzu — możesz też <b>podyktować</b> (przycisk mikrofonu). AI uporządkuje tekst, przełoży go na język stomatologiczny i sprawdzi zgodność z resztą danych przy tworzeniu listu.</div>
    <div class="row" style="margin:14px 0 8px"><span class="label" style="margin:0">Opis wykonanej pracy</span><span class="grow"></span>${micBtn('t.manual', true)}<button class="btn btn-sm" data-act="clean-manual" ${settings().ai.key ? '' : 'disabled title="Wymaga klucza API"'}>${I('spark')} Popraw tekst (AI)</button></div>
    <textarea data-b="t.manual" rows="10" placeholder="np. Usunięto stary wkład metalowy ultradźwiękami, kanał D udrożniono do pełnej długości, pozostawiono pod obserwacją rysę na ścianie mezjalnej…">${esc(t.manual || '')}</textarea>
    <div class="interim" id="interim-t.manual"></div>`;
}
function tabRec(t) {
  return `<div class="grid g2">${sel('t.rec.restor', 'Odbudowa', RESTOR, { re: true })}${!['', 'none', 'after'].includes(t.rec.restor) ? `<div class="f"><span>Termin</span>${seg('t.rec.time', { '2w': '2 tyg.', '30d': '30 dni', '60d': '2 mies.', asap: 'pilnie', '': 'bez terminu' })}</div>` : '<div></div>'}</div>
    <div class="label">Kontrola</div>${seg('t.rec.control', CONTROL)}
    <div class="label">Rokowanie</div>${seg('t.rec.prog', PROG)}
    <div class="row nowrap" style="margin-top:14px">${inp('t.rec.note', 'Dodatkowe zalecenia', { area: true, rows: 2, ph: 'Opcjonalnie' })}${micBtn('t.rec.note')}</div>`;
}

/* ================================================================ dyktowanie */
function micBtn(path, big = false) { return speechSupported ? `<button type="button" class="mic ${big ? 'big' : ''}" data-mic="${esc(path)}" title="Dyktuj (Chrome/Edge)">${I('mic')}</button>` : ''; }
let DICT = null;
async function toggleMic(btn) {
  if (DICT) { const same = DICT.btn === btn; await stopMic(); if (same) return; }
  const target = btn.dataset.mic, el = target.startsWith('#') ? $(target) : $(`[data-b="${target}"]`);
  if (!el) return;
  const base = el.value.trim(), finals = [];
  const interim = $(`#interim-${CSS.escape(target)}`);
  const d = new Dictation({
    lang: 'pl-PL',
    onFinal: (txt) => { if (!txt) return; finals.push(txt); el.value = [base, finals.join(' ')].filter(Boolean).join(' '); el.dispatchEvent(new Event('input', { bubbles: true })); },
    onInterim: (txt) => { if (interim) interim.textContent = txt; },
    onError: (m) => toast(m, 'err'),
    onStateChange: (on) => { btn.classList.toggle('rec', on); },
  });
  DICT = { d, btn, el, base, finals, target };
  try { d.start(); btn.classList.add('rec'); } catch { DICT = null; toast('Dyktowanie działa w przeglądarce Chrome lub Edge.', 'err'); }
}
async function stopMic() {
  const x = DICT; if (!x) return; DICT = null;
  await x.d.stop(); x.btn.classList.remove('rec');
  const dictated = x.finals.join(' ').trim();
  const st = settings();
  if (!dictated || !aiKey() || st.ai.cleanDictation === false) return;
  x.btn.classList.add('busy');
  try {
    const r = await cleanDictation(aiKey(), dictated, 'Pole: ' + x.target, { pseudo: pseudoHere() }); audit('ai', 'poprawa dyktowania (dane zanonimizowane)', curVisit()?.patientId || D().letters.get(S.letterId)?.patientId);
    x.el.value = [x.base, r.text].filter(Boolean).join(' '); x.el.dispatchEvent(new Event('input', { bubbles: true }));
    if ((r.warnings || []).length) toast('Dyktowanie: ' + r.warnings.join(' '), 'err');
  } catch (e) { toast('Nie udało się poprawić dyktowania: ' + e.message, 'err'); }
  x.btn.classList.remove('busy');
}

/* ================================================================ modals */
function modal({ title, body, buttons = [], wide = false, onClose }) {
  const ov = document.createElement('div'); ov.className = 'overlay';
  ov.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><header><h3>${esc(title)}</h3><button class="btn btn-ghost btn-icon btn-sm" data-x>${I('x')}</button></header><div class="mb">${body}</div>${buttons.length ? `<footer>${buttons.map((b, i) => `<button class="btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}</footer>` : ''}</div>`;
  const close = () => { ov.remove(); onClose && onClose(); };
  ov.addEventListener('mousedown', (e) => { if (e.target === ov) close(); });
  ov.addEventListener('click', async (e) => { if (e.target.closest('[data-x]')) return close(); const b = e.target.closest('footer [data-i]'); if (b) { const def = buttons[+b.dataset.i]; const r = def.onClick ? await def.onClick(ov, b) : undefined; if (r !== false) close(); } });
  ov.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  $('#modal-root').appendChild(ov);
  const af = ov.querySelector('[autofocus]'); if (af && !ov.contains(document.activeElement)) af.focus();
  return { el: ov, close };
}
function confirmBox(title, text, okLabel = 'Usuń') { return new Promise((res) => modal({ title, body: `<p style="margin:0;color:var(--dim)">${text}</p>`, buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(false) }, { label: okLabel, cls: 'btn-danger', onClick: () => res(true) }], onClose: () => res(false) })); }

function patientForm(p = {}) {
  return `<div class="grid g2">
    <label class="f"><span>Imię</span><input type="text" data-f="first" value="${esc(p.first || '')}" autofocus></label>
    <label class="f"><span>Nazwisko</span><input type="text" data-f="last" value="${esc(p.last || '')}"></label>
    <label class="f"><span>Data urodzenia <i class="faint">(opcjonalnie)</i></span><input type="date" data-f="dob" value="${esc(p.dob || '')}"></label>
    <label class="f"><span>PESEL <i class="faint">(opcjonalnie)</i></span><input type="text" inputmode="numeric" autocomplete="off" data-f="pesel" value="${esc(p.pesel || '')}" placeholder="można pominąć"><em class="pesel-state"></em></label>
    <label class="f"><span>Płeć (do odmiany w liście)</span><select data-f="sex"><option value="f" ${p.sex !== 'm' ? 'selected' : ''}>Pacjentka</option><option value="m" ${p.sex === 'm' ? 'selected' : ''}>Pacjent</option></select></label>
    <label class="f"><span>Telefon</span><input type="tel" data-f="phone" value="${esc(p.phone || '')}"></label>
    <label class="f all"><span>E-mail</span><input type="email" data-f="email" value="${esc(p.email || '')}"></label>
  </div><div class="hint" style="margin-top:8px">Wystarczy imię i nazwisko. PESEL nie jest wymagany — jeśli go wpiszesz, uzupełni datę urodzenia i płeć, a w liście pojawi się zamiast daty urodzenia. Dane osobowe nigdy nie są wysyłane do AI.</div>`;
}
/** PESEL → data urodzenia i płeć, z kontrolą sumy kontrolnej */
function wirePesel(el) {
  const f = $('[data-f=pesel]', el); if (!f) return;
  const upd = () => { const v = f.value.replace(/\D/g, ''); const st = $('.pesel-state', el); if (!v) { st.textContent = ''; return; } const r = parsePesel(v); if (r) { $('[data-f=dob]', el).value = r.dob; $('[data-f=sex]', el).value = r.sex; st.textContent = '✓ poprawny'; st.className = 'pesel-state ok'; } else { st.textContent = v.length === 11 ? '✗ błędna suma kontrolna' : `${v.length}/11`; st.className = 'pesel-state ' + (v.length === 11 ? 'bad' : ''); } };
  f.addEventListener('input', upd); upd();
}
function validPatient(f) {
  if (!f.last && !f.first) { toast('Podaj imię i nazwisko.', 'err'); return false; }
  f.pesel = (f.pesel || '').replace(/\D/g, '');
  if (f.pesel && !parsePesel(f.pesel) && !confirm(`PESEL ${f.pesel} nie przechodzi kontroli (${f.pesel.length === 11 ? 'błędna cyfra kontrolna lub data' : `ma ${f.pesel.length} cyfr zamiast 11`}).\n\nOK — zapisz mimo to\nAnuluj — popraw`)) return false;
  return true;
}
const readForm = (el) => Object.fromEntries($$('[data-f]', el).map((i) => [i.dataset.f, i.type === 'checkbox' ? i.checked : i.value.trim()]));

function pickPatient() {
  return new Promise((res) => {
    const list = [...D().patients.values()].sort((a, b) => (a.last || '').localeCompare(b.last || '', 'pl'));
    const rows = (q) => list.filter((p) => !q || `${p.first} ${p.last} ${p.dob} ${p.pesel || ''}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40)
      .map((p) => `<button class="pick" data-pid="${p.id}"><span class="check">${I('user')}</span><span class="grow"><b>${esc(patientName(p))}</b><small>${p.pesel ? 'PESEL ' + p.pesel + ' · ' : ''}${p.dob ? 'ur. ' + fmtDate(p.dob) : ''}${visitsOf(p.id).length ? ` · wizyt: ${visitsOf(p.id).length}` : ''}</small></span></button>`).join('') || '<div class="hint">Brak pacjentów — dodaj nowego poniżej.</div>';
    const m = modal({ title: 'Pacjent', wide: true, body: `${list.length ? `<input type="search" id="psearch" placeholder="Szukaj po nazwisku…" autofocus><div id="plist" style="margin:12px 0 16px">${rows('')}</div><div class="label">Nowy pacjent</div>` : ''}${patientForm()}`,
      buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(null) }, { label: `${I('plus')} Dodaj pacjenta`, cls: 'btn-primary', onClick: (ov) => { const f = readForm(ov); if (!validPatient(f)) return false; const p = { id: V.uid(), ...f, createdAt: Date.now() }; save('patients', p); res(p); } }],
      onClose: () => res(null) });
    wirePesel(m.el);
    const s = $('#psearch', m.el); if (s) s.oninput = () => { $('#plist', m.el).innerHTML = rows(s.value); };
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-pid]'); if (b) { res(D().patients.get(b.dataset.pid)); m.el.remove(); } });
  });
}
function referrerForm(r = {}) {
  const titles = DOC_TITLES.map((t) => `<option ${r.title === t ? 'selected' : ''}>${t}</option>`).join('');
  return `<div class="f" style="margin-bottom:12px"><span>Adresat</span><div class="seg" id="rkind"><button type="button" data-k="doctor" class="${r.kind !== 'clinic' ? 'on' : ''}">Lekarz</button><button type="button" data-k="clinic" class="${r.kind === 'clinic' ? 'on' : ''}">Klinika / gabinet</button></div></div>
  <input type="hidden" data-f="kind" value="${r.kind === 'clinic' ? 'clinic' : 'doctor'}">
  <div class="grid g2">
    <label class="f rk-doc"><span>Tytuł</span><select data-f="title">${titles}</select></label>
    <label class="f rk-doc"><span>Forma</span><select data-f="gender"><option value="f" ${r.gender !== 'm' ? 'selected' : ''}>Pani Doktor</option><option value="m" ${r.gender === 'm' ? 'selected' : ''}>Pan Doktor</option></select></label>
    <label class="f rk-doc"><span>Imię</span><input type="text" data-f="first" value="${esc(r.first || '')}" autofocus></label>
    <label class="f rk-doc"><span>Nazwisko</span><input type="text" data-f="last" value="${esc(r.last || '')}"></label>
    <label class="f all"><span>Nazwa kliniki / gabinetu</span><input type="text" data-f="clinic" value="${esc(r.clinic || '')}"></label>
    <label class="f all"><span>Adres</span><textarea data-f="address" rows="2" placeholder="ul. …&#10;00-000 Miasto">${esc(r.address || '')}</textarea></label>
    <label class="f"><span>E-mail (do wysyłki listu)</span><input type="email" data-f="email" value="${esc(r.email || '')}"></label>
    <label class="f"><span>Telefon</span><input type="tel" data-f="phone" value="${esc(r.phone || '')}"></label>
  </div>`;
}
function wireRefForm(el) {
  const apply = (k) => { $('[data-f=kind]', el).value = k; $$('#rkind button', el).forEach((b) => b.classList.toggle('on', b.dataset.k === k)); $$('.rk-doc', el).forEach((x) => { x.hidden = k === 'clinic'; }); };
  $('#rkind', el).onclick = (e) => { const b = e.target.closest('[data-k]'); if (b) apply(b.dataset.k); };
  apply($('[data-f=kind]', el).value);
}
function editReferrer(r, title = 'Lekarz kierujący') {
  return new Promise((res) => {
    const m = modal({ title, body: referrerForm(r || {}), buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(null) }, { label: 'Zapisz', cls: 'btn-primary', onClick: (ov) => {
      const f = readForm(ov); if (f.kind === 'clinic' ? !f.clinic : !f.last) { toast(f.kind === 'clinic' ? 'Podaj nazwę kliniki.' : 'Podaj nazwisko lekarza.', 'err'); return false; }
      const o = { ...(r || { id: V.uid(), createdAt: Date.now() }), ...f }; save('referrers', o); res(o);
    } }], onClose: () => res(null) });
    wireRefForm(m.el);
  });
}
function pickReferrer() {
  return new Promise((res) => {
    const list = [...D().referrers.values()].sort((a, b) => refName(a).localeCompare(refName(b), 'pl'));
    const m = modal({ title: 'Do kogo jest list?', wide: true,
      body: `${list.length ? `<input type="search" id="rsearch" placeholder="Szukaj lekarza lub kliniki…" autofocus><div id="rlist" style="margin:12px 0 16px"></div><div class="label">Nowy adresat</div>` : '<p class="muted" style="margin-top:0">Podaj lekarza kierującego lub klinikę — dane zostaną zapamiętane.</p>'}${referrerForm({})}`,
      buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(null) }, { label: `${I('plus')} Dodaj adresata`, cls: 'btn-primary', onClick: (ov) => {
        const f = readForm(ov); if (f.kind === 'clinic' ? !f.clinic : !f.last) { toast(f.kind === 'clinic' ? 'Podaj nazwę kliniki.' : 'Podaj nazwisko lekarza.', 'err'); return false; }
        const o = { id: V.uid(), createdAt: Date.now(), ...f }; save('referrers', o); res(o);
      } }], onClose: () => res(null) });
    wireRefForm(m.el);
    const draw = (q = '') => { const el = $('#rlist', m.el); if (el) el.innerHTML = list.filter((r) => !q || `${refName(r)} ${r.clinic}`.toLowerCase().includes(q.toLowerCase())).map((r) => `<button class="pick" data-rid="${r.id}"><span class="check">${I(r.kind === 'clinic' ? 'users' : 'user')}</span><span class="grow"><b>${esc(refName(r))}</b><small>${esc([r.kind === 'clinic' ? '' : r.clinic, r.email].filter(Boolean).join(' · '))}</small></span></button>`).join(''); };
    draw(); const s = $('#rsearch', m.el); if (s) s.oninput = () => draw(s.value);
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-rid]'); if (b) { res(D().referrers.get(b.dataset.rid)); m.el.remove(); } });
  });
}
function pickVisits(patientId, preselect) {
  return new Promise((res) => {
    const vs = visitsOf(patientId).filter((v) => v.teeth.length);
    const chosen = new Set(preselect);
    const m = modal({ title: 'Połączyć wizyty w jednym liście?', wide: true,
      body: `<p class="muted" style="margin-top:0">Zaznacz wizyty, które mają znaleźć się w liście — także leczenie wykonane wcześniej przez innych lekarzy.</p><div id="vlist">${vs.map((v) => `<button class="pick ${chosen.has(v.id) ? 'on' : ''}" data-vid="${v.id}"><span class="check">${I('check')}</span><span class="grow"><b>${fmtDate(v.date)} · ${v.performer === 'other' ? esc(v.otherDentist || 'inny lekarz') : 'moje leczenie'}</b><small>${v.teeth.map((t) => `${t.fdi}: ${esc(toothSummary(t))}`).join(' · ')}</small></span></button>`).join('')}</div>`,
      buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(null) }, { label: `${I('spark')} Generuj list`, cls: 'btn-primary', onClick: () => { if (!chosen.size) { toast('Zaznacz co najmniej jedną wizytę.', 'err'); return false; } res([...chosen]); } }], onClose: () => res(null) });
    m.el.addEventListener('click', (e) => { const b = e.target.closest('[data-vid]'); if (!b) return; const id = b.dataset.vid; chosen.has(id) ? chosen.delete(id) : chosen.add(id); b.classList.toggle('on', chosen.has(id)); });
  });
}

/* ================================================================ letter generation */
function askSignerName() {
  return new Promise((res) => {
    const d = settings().doctor;
    modal({ title: 'Kto podpisuje listy?', body: `<p class="muted" style="margin-top:0">Listy podpisuje zalogowana lekarka / lekarz. Uzupełnij dane raz — pojawią się pod każdym listem.</p>
      <div class="grid g2"><label class="f"><span>Tytuł</span><select id="sn-title">${DOC_TITLES.map((t) => `<option ${d.title === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="f"><span>Forma</span><select id="sn-g"><option value="f" ${d.gender !== 'm' ? 'selected' : ''}>Pani</option><option value="m" ${d.gender === 'm' ? 'selected' : ''}>Pan</option></select></label>
      <label class="f"><span>Imię</span><input type="text" id="sn-first" value="${esc(d.first)}" autofocus></label><label class="f"><span>Nazwisko</span><input type="text" id="sn-last" value="${esc(d.last)}"></label></div>`,
      buttons: [{ label: 'Anuluj', cls: 'btn-ghost', onClick: () => res(false) }, { label: 'Zapisz i kontynuuj', cls: 'btn-primary', onClick: (ov) => {
        const first = $('#sn-first', ov).value.trim(), last = $('#sn-last', ov).value.trim();
        if (!last) { toast('Podaj nazwisko.', 'err'); return false; }
        const st = settings(); Object.assign(st.doctor, { title: $('#sn-title', ov).value, gender: $('#sn-g', ov).value, first, last }); save('settings', st); renderTop(); res(true);
      } }], onClose: () => res(false) });
  });
}
async function startLetter(fromVisitId) {
  if (!settings().doctor.last && !(await askSignerName())) return;
  let v = D().visits.get(fromVisitId);
  if (!v.patientId) { const p = await pickPatient(); if (!p) return; v.patientId = p.id; save('visits', v); }
  if (!v.referrerId) { const r = await pickReferrer(); if (!r) return; v.referrerId = r.id; save('visits', v); }
  save('visits', v);
  const others = visitsOf(v.patientId).filter((x) => x.id !== v.id && x.teeth.length);
  let ids = [v.id];
  if (others.length) { ids = await pickVisits(v.patientId, [v.id]); if (!ids) return; }
  await createLetter({ patientId: v.patientId, referrerId: v.referrerId, visitIds: ids });
}
function usedFor(refId) { const st = settings(); st.used[refId] ??= { openings: [], closings: [] }; return st.used[refId]; }
async function createLetter({ patientId, referrerId, visitIds, existing }) {
  audit('letter-create', existing ? 'ponowne wygenerowanie' : '', patientId);
  const patient = D().patients.get(patientId), referrer = D().referrers.get(referrerId);
  const visits = visitIds.map((id) => D().visits.get(id)).filter(Boolean);
  const st = settings(), doctor = st.doctor, used = usedFor(referrerId);
  const repeat = [...D().letters.values()].some((l) => l.referrerId === referrerId && l.id !== existing?.id);
  const draft = buildOffline({ visits, patient, doctor, referrer, used, repeat, icd: st.letter.icd });
  let content = draft, source = 'auto', warnings = [], aiError = '';
  if (!st.ai.key) aiError = 'Brak klucza API (Ustawienia → Asystent AI).';
  else if (st.ai.enabled === false) aiError = 'AI wyłączone w Ustawieniach.';
  else if (!aiAllowed()) aiError = 'AI wyłączone przez administratora gabinetu.';
  const busy = modal({ title: st.ai.enabled && aiKey() ? 'Asystent AI pisze list…' : 'Tworzenie listu…', body: `<div class="row" style="gap:14px;padding:8px 0 4px"><span class="spin" style="width:22px;height:22px;border-radius:50%;border:2.5px solid var(--accent);border-right-color:transparent;animation:spin .8s linear infinite"></span><span class="muted">${st.ai.enabled && st.ai.key ? 'Do AI trafiają tylko dane kliniczne, bez danych osobowych pacjenta.' : 'Generator wbudowany (bez AI).'}</span></div>` });
  if (st.ai.enabled && aiKey()) {
    try {
      const out = await generateLetter(aiKey(), aiPayload({ visits, patient, doctor, referrer, used, repeat, icd: st.letter.icd, draft }), { effort: st.ai.effort, pseudo: pseudoFor(patient, referrer, visits) });
      audit('ai', 'list wygenerowany przez AI (dane zanonimizowane)', patient?.id);
      content = { opening: out.opening, sections: out.sections, recommendations: out.recommendations, closing: out.closing };
      warnings = out.warnings || []; source = 'ai';
    } catch (e) { aiError = e.message; toast(`AI nie zadziałało: ${e.message} Użyto generatora wbudowanego.`, 'err'); }
  }
  busy.close();
  const letter = existing || { id: V.uid(), createdAt: Date.now(), files: [] };
  Object.assign(letter, {
    patientId, referrerId, visitIds, date: existing?.date || today(), source, aiError, writer: WRITER, warnings, notes: [], lastChanges: [], instruction: '', genEdit: false,
    content: { title: st.letter.title, salutation: salutation(referrer), signoff: st.letter.signoff, ...content },
    glance: glance(visits),
  });
  used.openings = [...used.openings, letter.content.opening].slice(-10);
  used.closings = [...used.closings, letter.content.closing].slice(-10);
  save('settings', st); save('letters', letter);
  go('letter', { letterId: letter.id });
}

/* ================================================================ LETTER view (przegląd, uwagi, poprawki AI) */
function viewLetter() {
  const L = D().letters.get(S.letterId); if (!L) return '<div class="empty">Nie znaleziono listu.</div>';
  const p = D().patients.get(L.patientId), r = D().referrers.get(L.referrerId);
  L.notes ??= [];
  return `<div class="pagehead"><button class="btn btn-ghost" data-act="letter-back">${I('back')} Wróć</button>
    <div><h2>List — ${esc(patientName(p))}</h2><div class="small muted">do: ${esc(refName(r))} · ${fmtDate(L.date)} · <span class="ai-badge ${L.source === 'ai' ? '' : 'off'}" title="${esc(L.aiError || '')}">${L.source === 'ai' ? `${I('spark')} napisane przez AI` : 'generator wbudowany (bez AI)'}</span></div></div>
    <span class="grow"></span>
    <div class="letter-tools">
      <button class="btn btn-ghost btn-sm" data-act="regen">${I('refresh')} Wygeneruj od nowa</button>
      <button class="btn btn-ghost btn-sm" data-act="pdf-preview">${I('doc')} Podgląd PDF</button>
      <button class="btn btn-ghost btn-sm" data-act="print">${I('print')} Drukuj</button>
      <button class="btn btn-ghost btn-sm" data-act="prodentis">${I('copy')} ProDentis</button>
    </div>
    <div class="letter-main">
      <button class="btn btn-soft btn-xl" data-act="email">${I('mail')} Wyślij e-mailem</button>
      <button class="btn btn-primary btn-xl" data-act="save-pdf">${I('save')} Zapisz PDF</button>
    </div></div>
  <div class="review">
    <div class="paper-wrap">
      <div class="paper-tools">${S.manualEdit ? '<span class="hint">Edycja ręczna: kliknij w tekst i popraw go bezpośrednio.</span>' : `<div class="ai-tip">${I('spark')}<span><b>Chcesz coś zmienić?</b> ${COARSE ? 'Przytrzymaj palec na tekście i zaznacz fragment, który Ci nie odpowiada' : 'Zaznacz myszką fragment, który Ci nie odpowiada'} — opisz, jak ma brzmieć, a ${aiKey() ? 'AI poprawi list (przycisk „Popraw list z AI” z prawej)' : 'popraw go ręcznie lub dodaj klucz AI w Ustawieniach'}.</span></div>`}<span class="grow"></span>
        <label class="switch"><input type="checkbox" id="manual-edit" ${S.manualEdit ? 'checked' : ''}><span class="track"><span class="thumb"></span></span>Edycja ręczna</label></div>
      <div id="paper">${paperHTML(L)}</div>
    </div>
    <aside class="panel review-side" id="rside">${reviewSide(L)}</aside>
  </div>`;
}
function paperHTML(L) { return letterPaperHTML(letterCtxFull(L), S.manualEdit ? [] : L.notes || [], { editable: S.manualEdit, hints: true }); }
function reviewSide(L) {
  const notes = L.notes || [], hasKey = !!aiKey(), n = notes.filter((x) => x.comment).length;
  const inst = L.instruction || '';
  const d = signer();
  const signHint = !d.signature ? `<div class="banner info" style="margin:0 0 12px"><span class="grow small">List podpisze <b>${esc(doctorName() || 'zalogowany lekarz')}</b>. Dodaj skan podpisu, aby pojawiał się pod listem.</span><button class="btn btn-sm" data-nav="settings">Dodaj podpis</button></div>` : '';
  const why = L.source !== 'ai' ? `<div class="banner ${L.aiError && !/Brak klucza/.test(L.aiError) ? 'warn' : 'info'}" style="margin:0 0 12px"><span class="grow small"><b>Ten list napisał generator wbudowany, nie AI.</b>${L.aiError ? ` Powód: ${esc(L.aiError)}` : ''}</span>${aiKey() ? `<button class="btn btn-sm btn-primary" data-act="regen-ai">${I('spark')} Spróbuj z AI</button>` : '<button class="btn btn-sm" data-nav="settings">Ustawienia AI</button>'}</div>` : '';
  const old = (L.writer || 0) < WRITER ? `<div class="banner info" style="margin:0 0 12px"><span class="grow small">Ten list powstał w starszej wersji aplikacji. Kliknij <b>Wygeneruj od nowa</b>, aby otrzymać nowy styl (list w pierwszej osobie, materiały w ramce z boku).</span></div>` : '';
  return `<div class="body">${why}${old}${signHint}
    <div class="rs-h">${I('edit')} Uwagi do poprawy <span class="badge">${notes.length || ''}</span></div>
    ${notes.length ? notes.map((x) => `<div class="note-card ${x.done ? 'done' : ''}" data-note-card="${x.id}">
        <button class="nq" data-act="goto-note" data-id="${x.id}">„${esc(x.quote.length > 90 ? x.quote.slice(0, 90) + '…' : x.quote)}"</button>
        <textarea data-note-text="${x.id}" rows="2" placeholder="Co poprawić?">${esc(x.comment)}</textarea>
        <div class="row"><label class="chk-done"><input type="checkbox" data-note-done="${x.id}" ${x.done ? 'checked' : ''}>Gotowe</label><span class="grow"></span><button class="btn btn-ghost btn-sm" data-act="rm-note" data-id="${x.id}">${I('trash')}</button></div></div>`).join('')
      : '<div class="hint">Zaznacz w liście fragment, który brzmi źle lub jest nieprawdziwy, i opisz, jak ma wyglądać. Możesz dodać kilka uwag po kolei.</div>'}
    <div class="rs-sep"></div>
    <label class="chk-done big"><input type="checkbox" id="gen-edit" ${L.genEdit || inst ? 'checked' : ''}>Edytuj cały list</label>
    <div id="gen-box" ${L.genEdit || inst ? '' : 'hidden'}>
      <div class="row nowrap" style="margin-top:8px"><textarea id="gen-text" rows="4" placeholder="Opisz własnymi słowami, jak zmienić list, np. „krócej", „bardziej formalnie", „dodaj, że ząb wymaga pilnej odbudowy"…">${esc(inst)}</textarea>${micBtn('#gen-text')}</div>
    </div>
    <button class="btn btn-primary btn-lg" style="width:100%;margin-top:14px" data-act="revise" ${n || inst ? '' : 'disabled'}>${I('spark')} Popraw list z AI${n ? ` (${n} ${n === 1 ? 'uwaga' : n < 5 ? 'uwagi' : 'uwag'})` : ''}</button>
    ${hasKey ? '' : '<div class="hint" style="margin-top:8px">Poprawki AI wymagają klucza API (Ustawienia). Bez niego włącz „Edycja ręczna" i popraw tekst bezpośrednio.</div>'}
    ${(L.warnings || []).length ? `<div class="rs-sep"></div><div class="rs-h">${I('spark')} Sugestie AI</div>${L.warnings.map((w, i) => `<div class="sugg"><span>${esc(w)}</span><button class="btn btn-ghost btn-sm" data-act="use-sugg" data-i="${i}" title="Dodaj do poleceń">${I('plus')}</button></div>`).join('')}` : ''}
    ${(L.lastChanges || []).length ? `<div class="rs-sep"></div><div class="rs-h">${I('check')} Ostatnie zmiany AI</div><ul class="changes">${L.lastChanges.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
    ${L.files.length ? `<div class="rs-sep"></div><div class="hint">Zapisano: <code class="path">${esc(L.files.at(-1).path)}</code></div>` : ''}
  </div>`;
}
function rerenderLetter() { const p = $('#paper'); if (!p) return; const L = D().letters.get(S.letterId); p.innerHTML = paperHTML(L); $('#rside').innerHTML = reviewSide(L); }
function letterCtxFull(L) {
  const ctx = letterCtx(L);
  if (!ctx.dates.length) ctx.dates = [...new Set(L.visitIds.map((id) => D().visits.get(id)?.date).filter(Boolean))].sort();
  return ctx;
}
function letterCtx(L) {
  const st = settings(), p = D().patients.get(L.patientId), r = D().referrers.get(L.referrerId);
  const visits = L.visitIds.map((id) => D().visits.get(id)).filter(Boolean);
  // schematic marks and materials are always taken from the current visit data
  const live = visits.length ? glance(visits) : L.glance;
  return { doctor: signer(), patient: p || {}, referrer: r, content: L.content, glance: live, materials: materialsFor(visits), dates: [...new Set(visits.filter((v) => v.performer !== 'other').map((v) => v.date))].sort(), letterDate: L.date, title: L.content.title };
}
async function letterBlob(L) { return buildLetterPDF(letterCtxFull(L)); }
function afterLetter() {}
/* selection → note popover */
function paperSelection() {
  if (S.view !== 'letter' || S.manualEdit) return null;
  const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const quote = sel.toString().replace(/\s+/g, ' ').trim(); if (quote.length < 2) return null;
  const node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
  const host = node && node.closest('#paper [data-loc]'); if (!host) return null;
  const endNode = sel.focusNode && (sel.focusNode.nodeType === 1 ? sel.focusNode : sel.focusNode.parentElement);
  const loc = host.dataset.loc, sameBlock = endNode && endNode.closest('[data-loc]') === host;
  return { loc, quote: sameBlock ? quote : host.innerText.trim(), rect: sel.getRangeAt(0).getBoundingClientRect() };
}
function onPaperSelect() { if (COARSE) return; const info = paperSelection(); if (info) showNotePop(info); }
// Touch (iPhone): selecting text with the system handles shows a button; tapping it opens the comment box.
const COARSE = matchMedia('(pointer: coarse)').matches;
let pendingSel = null, selHide = null;
function selBtn() { let b = $('#selbtn'); if (!b) { b = document.createElement('button'); b.id = 'selbtn'; b.className = 'selbtn'; b.type = 'button'; b.innerHTML = `${I('edit')} Dodaj uwagę do zaznaczenia`; b.addEventListener('pointerdown', (e) => { e.preventDefault(); const info = pendingSel; b.classList.remove('on'); if (info) { window.getSelection()?.removeAllRanges(); showNotePop(info); } }); document.body.appendChild(b); } return b; }
document.addEventListener('selectionchange', debounce(() => {
  if (!COARSE) return;
  const info = paperSelection();
  clearTimeout(selHide);
  if (info && !$('.note-pop')) { pendingSel = info; selBtn().classList.add('on'); }
  else selHide = setTimeout(() => { if (!paperSelection()) { pendingSel = null; $('#selbtn')?.classList.remove('on'); } }, 700);
}, 200));
function showNotePop({ loc, quote, rect }) {
  $('.note-pop')?.remove();
  const pop = document.createElement('div'); pop.className = 'note-pop';
  pop.innerHTML = `<div class="np-q">„${esc(quote.length > 140 ? quote.slice(0, 140) + '…' : quote)}"</div>
    <div class="row nowrap"><textarea id="np-text" rows="3" placeholder="Co jest nie tak i jak powinno być?"></textarea>${micBtn('#np-text')}</div>
    <div class="row" style="margin-top:8px"><label class="chk-done"><input type="checkbox" id="np-done">Gotowe — zapisz uwagę</label><span class="grow"></span><button class="btn btn-ghost btn-sm" id="np-cancel">Anuluj</button></div>`;
  document.body.appendChild(pop);
  const w = 360, x = Math.min(window.innerWidth - w - 14, Math.max(14, rect.left + rect.width / 2 - w / 2));
  const y = rect.bottom + 10 + 220 > window.innerHeight ? Math.max(14, rect.top - 230) : rect.bottom + 10;
  Object.assign(pop.style, { left: x + 'px', top: y + 'px', width: w + 'px' });
  const ta = $('#np-text', pop); ta.focus();
  const commit = () => {
    const comment = ta.value.trim();
    if (!comment) { toast('Opisz, co poprawić.', 'err'); $('#np-done', pop).checked = false; return; }
    const L = D().letters.get(S.letterId);
    L.notes = [...(L.notes || []), { id: V.uid(), loc, quote, comment, done: true }]; save('letters', L);
    pop.remove(); window.getSelection()?.removeAllRanges(); rerenderLetter();
  };
  $('#np-done', pop).onchange = (e) => { if (e.target.checked) commit(); };
  ta.onkeydown = (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit(); if (e.key === 'Escape') pop.remove(); };
  $('#np-cancel', pop).onclick = () => { if (DICT) stopMic(); pop.remove(); };
}
async function reviseWithAI(L) {
  const st = settings();
  const inst = ($('#gen-text')?.value || L.instruction || '').trim();
  const notes = (L.notes || []).filter((x) => x.comment);
  if (!aiKey()) return toast(st.ai.key ? (S.org ? 'AI jest wyłączone przez administratora gabinetu. Użyj edycji ręcznej.' : 'AI jest wyłączone w Ustawieniach (Asystent AI). Użyj edycji ręcznej.') : 'Poprawki AI wymagają klucza API — dodaj go w Ustawieniach lub użyj edycji ręcznej.', 'err');
  if (!notes.length && !inst) return toast('Dodaj uwagę lub polecenie.', 'err');
  const p = D().patients.get(L.patientId) || {}, r = D().referrers.get(L.referrerId);
  const visits = L.visitIds.map((id) => D().visits.get(id)).filter(Boolean);
  const facts = aiPayload({ visits, patient: p, doctor: st.doctor, referrer: r, used: { openings: [], closings: [] }, icd: st.letter.icd });
  delete facts.draft;
  const { opening, sections, recommendations, closing } = L.content;
  const busy = modal({ title: 'AI poprawia list…', body: `<div class="row" style="gap:14px;padding:8px 0 4px"><span class="spin big"></span><span class="muted">Wprowadzam ${notes.length} ${notes.length === 1 ? 'uwagę' : 'uwag(i)'}${inst ? ' i polecenie ogólne' : ''}.</span></div>` });
  try {
    audit('ai', 'poprawa listu przez AI (dane zanonimizowane)', L.patientId);
    const out = await reviseLetter(aiKey(), { letter: { opening, sections, recommendations, closing }, annotations: notes.map((x) => ({ location: x.loc, quote: x.quote, comment: x.comment })), instruction: inst, facts: facts.teeth, visit_notes: facts.visit_notes, doctor: facts.doctor, patient: facts.patient, addressee: facts.addressee, include_icd10: facts.include_icd10 }, { effort: st.ai.effort, pseudo: pseudoFor(p, r, visits) });
    L.history = [...(L.history || []), { at: Date.now(), content: clone(L.content), notes, instruction: inst }].slice(-15);
    Object.assign(L.content, { opening: out.opening, sections: out.sections, recommendations: out.recommendations, closing: out.closing });
    L.notes = []; L.instruction = ''; L.genEdit = false; L.lastChanges = out.changes || []; L.warnings = out.warnings || []; L.source = 'ai';
    save('letters', L); busy.close(); renderView(); toast('List poprawiony.', 'ok');
  } catch (e) { busy.close(); toast(e.message, 'err'); }
}
async function pdfPreview(L) {
  const b = await letterBlob(L); const url = URL.createObjectURL(b);
  modal({ title: 'Podgląd PDF', wide: true, body: `<iframe src="${url}#view=FitH" style="width:100%;height:72vh;border:0;border-radius:12px;background:#2a3242"></iframe>`, onClose: () => URL.revokeObjectURL(url) });
}

function letterFileInfo(L) {
  const p = D().patients.get(L.patientId) || {}, r = D().referrers.get(L.referrerId);
  return names(p, L, r, L.glance.map((g) => g.fdi));
}
async function saveLetterPdf(L, { quiet = false } = {}) {
  const { folder, base } = letterFileInfo(L);
  const blob = await letterBlob(L);
  let path;
  if (S.folder && (await S.folder.ensure())) {
    let name = base + '.pdf';
    if (await S.folder.exists(['Listy', folder, name]) && !L.files.some((f) => f.path.endsWith(name))) { let k = 2; while (await S.folder.exists(['Listy', folder, `${base} (${k}).pdf`])) k++; name = `${base} (${k}).pdf`; }
    await S.folder.write(['Listy', folder, name], blob);
    path = `${S.folder.root.name}/Listy/${folder}/${name}`;
  } else { download(blob, base + '.pdf'); path = `Pobrane/${base}.pdf`; }
  L.files = [...L.files.filter((f) => f.path !== path), { path, at: Date.now() }]; save('letters', L);
  if (!quiet) toast(`Zapisano: ${path}`, 'ok');
  return { blob, path, fileName: path.split('/').pop() };
}
async function emailLetter(L) {
  const p = D().patients.get(L.patientId) || {}, r = D().referrers.get(L.referrerId) || {};
  const ini = `${(p.first || '')[0] || ''}.${(p.last || '')[0] || ''}.`.replace(/^\.|\.\.$/g, '');
  const body = `${L.content.salutation}\n\nw załączeniu przesyłam informację o leczeniu ${PT[p.sex === 'm' ? 'm' : 'f'].gen} ${patientName(p)}.\n\n${L.content.signoff}\n${doctorName()}${settings().doctor.practice ? '\n' + settings().doctor.practice : ''}${settings().doctor.phone ? '\ntel. ' + settings().doctor.phone : ''}`;
  const subject = `Informacja o leczeniu — ${ini || 'Pacjent'} (${fmtDate(L.date)})`;
  const m = modal({ title: 'Wyślij list e-mailem', wide: true, body: `
    <div class="grid g2"><label class="f"><span>Do</span><input type="email" id="em-to" value="${esc(r.email || '')}" placeholder="adres e-mail lekarza / kliniki"></label><label class="f"><span>Temat</span><input type="text" id="em-sub" value="${esc(subject)}"></label>
    <label class="f all"><span>Treść</span><textarea id="em-body" rows="7">${esc(body)}</textarea></label></div>
    <div class="hint" style="margin-top:10px">List w PDF zostanie dołączony. W temacie domyślnie są tylko inicjały pacjenta (RODO). Wiadomość wysyłasz ze swojego programu pocztowego.</div>`,
    buttons: [
      { label: 'Anuluj', cls: 'btn-ghost' },
      { label: `${I('save')} Szkic z załącznikiem (.eml)`, onClick: async (ov) => { const { blob, fileName } = await saveLetterPdf(L, { quiet: true }); const eml = await emlDraft({ to: $('#em-to', ov).value, subject: $('#em-sub', ov).value, body: $('#em-body', ov).value, pdfBlob: blob, fileName }); download(eml, fileName.replace(/\.pdf$/, '.eml')); markSent(L, r, $('#em-to', ov).value); toast('Otwórz pobrany plik .eml — otworzy się jako gotowa wiadomość z załącznikiem (Outlook, Apple Mail, Thunderbird).', 'ok'); } },
      { label: `${I('mail')} Program pocztowy`, onClick: async (ov) => { const { path } = await saveLetterPdf(L, { quiet: true }); location.href = mailto({ to: $('#em-to', ov).value, subject: $('#em-sub', ov).value, body: $('#em-body', ov).value + '\n\n[Załącz plik PDF z listem]' }); markSent(L, r, $('#em-to', ov).value); toast(`Dołącz plik: ${path}`, 'ok'); } },
      { label: `${I('link')} Udostępnij…`, cls: 'btn-primary', onClick: async (ov) => {
        const { blob, fileName } = await saveLetterPdf(L, { quiet: true });
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (!canShareFile(file)) { toast('Ta przeglądarka nie udostępnia plików — użyj „Szkic z załącznikiem".', 'err'); return false; }
        try { await navigator.share({ files: [file], title: $('#em-sub', ov).value, text: $('#em-body', ov).value }); markSent(L, r, $('#em-to', ov).value); } catch (e) { if (e.name !== 'AbortError') toast('Udostępnianie nie powiodło się.', 'err'); return false; }
      } },
    ] });
  void m;
}
function markSent(L, r, to) { L.emailedAt = Date.now(); L.emailedTo = to; save('letters', L); if (r && to && !r.email) { r.email = to; save('referrers', r); } }
function prodentisModal(L) {
  const p = D().patients.get(L.patientId) || {};
  const text = prodentisText({ patient: p, letterDate: fmtDate(L.date), content: L.content, glance: L.glance, doctorName: doctorName() });
  modal({ title: 'Eksport do ProDentis', wide: true, body: `
    <p class="muted" style="margin-top:0">ProDentis nie udostępnia publicznego interfejsu do importu dokumentów, dlatego eksport działa tak: <b>PDF</b> listu dołączasz do dokumentacji pacjenta w ProDentis, a <b>opis tekstowy</b> wklejasz do opisu wizyty.</p>
    <textarea readonly rows="10" style="font-family:var(--mono);font-size:12px">${esc(text)}</textarea>`,
    buttons: [{ label: 'Zamknij', cls: 'btn-ghost' },
      { label: `${I('copy')} Kopiuj opis`, onClick: async () => { try { await navigator.clipboard.writeText(text); toast('Skopiowano opis — wklej go w ProDentis.', 'ok'); } catch { toast('Nie udało się skopiować.', 'err'); } return false; } },
      { label: `${I('save')} Zapisz PDF + TXT`, cls: 'btn-primary', onClick: async () => {
        const { folder, base } = letterFileInfo(L); await saveLetterPdf(L, { quiet: true });
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        if (S.folder?.ok()) { await S.folder.write(['Listy', folder, `${base} – opis ProDentis.txt`], blob); toast(`Zapisano w folderze Listy/${folder}`, 'ok'); } else { download(blob, `${base} – opis ProDentis.txt`); toast('Pobrano PDF i TXT.', 'ok'); }
      } }] });
}

/* ================================================================ PATIENTS */
function viewPatients() {
  const q = S.search.toLowerCase();
  const list = [...D().patients.values()].filter((p) => !q || `${p.first} ${p.last} ${p.dob}`.toLowerCase().includes(q)).sort((a, b) => (a.last || '').localeCompare(b.last || '', 'pl'));
  return `<div class="pagehead"><h2>Pacjenci</h2><span class="tag g">${D().patients.size}</span><span class="grow"></span><input type="search" class="search" id="search" placeholder="Szukaj pacjenta…" value="${esc(S.search)}"><button class="btn btn-primary" data-act="add-patient">${I('plus')} Nowy pacjent</button></div>
  <section class="panel">${list.length ? `<table class="list"><thead><tr><th>Pacjent</th><th>Ostatnia wizyta</th><th>Zęby</th><th>Listy</th></tr></thead><tbody>
  ${list.map((p) => { const vs = visitsOf(p.id), ls = lettersOf(p.id); const teeth = [...new Set(vs.flatMap((v) => v.teeth.map((t) => t.fdi)))].sort((a, b) => a - b);
    return `<tr class="click" data-open-patient="${p.id}"><td><b style="color:var(--strong)">${esc(patientName(p))}</b><div class="tiny faint">${p.dob ? 'ur. ' + fmtDate(p.dob) : ''}</div></td><td>${vs[0] ? fmtDate(vs[0].date) : '—'}</td><td>${teeth.map((t) => `<span class="tag">${t}</span>`).join('') || '—'}</td><td>${ls.length ? `<span class="tag v">${ls.length}</span>` : '—'}</td></tr>`; }).join('')}
  </tbody></table>` : `<div class="empty"><b>${q ? 'Brak wyników' : 'Brak pacjentów'}</b>${q ? '' : 'Pacjenci pojawią się tu po dodaniu wizyty.'}</div>`}</section>`;
}
function viewPatient() {
  const p = D().patients.get(S.patientId); if (!p) return '<div class="empty">Nie znaleziono pacjenta.</div>';
  const vs = visitsOf(p.id), ls = lettersOf(p.id);
  return `<div class="pagehead"><button class="btn btn-ghost" data-nav="patients">${I('back')} Pacjenci</button><div><h2>${esc(patientName(p))}</h2><div class="small muted">${p.pesel ? 'PESEL ' + esc(p.pesel) + ' · ' : ''}${p.dob ? 'ur. ' + fmtDate(p.dob) : ''}${p.phone ? ' · ' + esc(p.phone) : ''}</div></div><span class="grow"></span>
    <button class="btn btn-ghost" data-act="patient-export" title="Prawo dostępu i przenoszenia danych (RODO art. 15, 20)">${I('save')} Eksport danych</button><button class="btn btn-ghost btn-danger" data-act="patient-delete" title="Usunięcie wszystkich danych pacjenta">${I('trash')}</button><button class="btn" data-act="edit-patient">Edytuj dane</button><button class="btn" data-act="other-visit">${I('plus')} Leczenie z innego gabinetu</button><button class="btn btn-soft" data-act="patient-visit">${I('plus')} Nowa wizyta</button><button class="btn btn-primary btn-lg" data-act="patient-letter" ${vs.some((v) => v.teeth.length) ? '' : 'disabled'}>${I('spark')} Generuj list</button></div>
  <div class="settings">
    <section class="panel"><header><h3>Wizyty</h3><span class="sub">${vs.length}</span></header>${vs.length ? `<table class="list"><tbody>${vs.map((v) => `<tr class="click" data-open-visit="${v.id}"><td style="width:110px">${fmtDate(v.date)}</td><td>${v.performer === 'other' ? `<span class="tag o">${esc(v.otherDentist || 'inny lekarz')}</span>` : '<span class="tag g">moje leczenie</span>'}</td><td>${v.teeth.map((t) => `<span class="tag ${markFor([{ visit: v, rec: t }]) === 'work' ? 'v' : ''}" title="${esc(toothSummary(t))}">${t.fdi}</span>`).join('') || '<span class="faint">—</span>'}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-act="del-visit" data-id="${v.id}">${I('trash')}</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Brak wizyt.</div>'}</section>
    <section class="panel"><header><h3>Listy</h3><span class="sub">${ls.length}</span></header>${ls.length ? `<table class="list"><tbody>${ls.map((l) => `<tr class="click" data-open-letter="${l.id}"><td style="width:110px">${fmtDate(l.date)}</td><td>${esc(refName(D().referrers.get(l.referrerId)))}<div class="tiny faint">${l.glance.map((g) => g.fdi).join(', ')}${l.emailedAt ? ' · wysłano e-mailem' : ''}</div></td><td>${l.source === 'ai' ? '<span class="tag">AI</span>' : ''}${l.files.length ? '<span class="tag v">PDF</span>' : ''}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-act="del-letter" data-id="${l.id}">${I('trash')}</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">Brak listów.</div>'}</section>
  </div>`;
}

/* ================================================================ REFERRERS */
function viewReferrers() {
  const list = [...D().referrers.values()].sort((a, b) => refName(a).localeCompare(refName(b), 'pl'));
  return `<div class="pagehead"><h2>Lekarze kierujący</h2><span class="tag g">${list.length}</span><span class="grow"></span><button class="btn btn-primary" data-act="add-referrer">${I('plus')} Dodaj</button></div>
  <section class="panel">${list.length ? `<table class="list"><thead><tr><th>Adresat</th><th>Klinika</th><th>Kontakt</th><th>Listy</th><th></th></tr></thead><tbody>${list.map((r) => `<tr class="click" data-edit-ref="${r.id}"><td><b style="color:var(--strong)">${esc(refName(r))}</b></td><td>${esc(r.kind === 'clinic' ? '' : r.clinic || '')}<div class="tiny faint" style="white-space:pre-line">${esc(r.address || '')}</div></td><td class="small">${esc(r.email || '')}<br>${esc(r.phone || '')}</td><td>${[...D().letters.values()].filter((l) => l.referrerId === r.id).length}</td><td style="text-align:right"><button class="btn btn-ghost btn-sm" data-act="del-ref" data-id="${r.id}">${I('trash')}</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty"><b>Brak adresatów</b>Lekarze kierujący są zapamiętywani przy tworzeniu listów.</div>'}</section>`;
}

/* ================================================================ SETTINGS */
function viewSettings() {
  const st = settings(), d = st.doctor, pr = S.session.profile;
  return `<div class="pagehead"><h2>Ustawienia</h2></div><div class="settings"><div>
    <section class="panel"><header><h3>Lekarz i gabinet</h3><span class="sub">nagłówek i podpis listu</span></header><div class="body"><div class="grid g2">
      ${sel('s.doctor.title', 'Tytuł', Object.fromEntries(DOC_TITLES.map((t) => [t, t])))}${sel('s.doctor.gender', 'Forma', { f: 'Pani', m: 'Pan' })}
      ${inp('s.doctor.first', 'Imię')}${inp('s.doctor.last', 'Nazwisko')}
      ${inp('s.doctor.specialty', 'Specjalizacja', { cls: 'all', ph: 'np. specjalista endodoncji' })}
      ${inp('s.doctor.practice', 'Gabinet / klinika')}${inp('s.doctor.group', 'Grupa')}${inp('s.doctor.address', 'Adres', { cls: 'all' })}
      ${inp('s.doctor.city', 'Miejscowość')}${inp('s.doctor.npwz', 'NPWZ')}${inp('s.doctor.phone', 'Telefon')}${inp('s.doctor.email', 'E-mail')}
    </div>
    <div class="label">Logo kliniki i grupy (w aplikacji i na listach)</div>
    <div class="grid g2">${['logo', 'groupLogo'].map((k) => `<div class="logo-slot">${d[k] ? `<img src="${d[k]}" alt="">` : `<span class="faint small">${k === 'logo' ? 'Logo kliniki' : 'Logo grupy'}</span>`}<div class="row" style="margin-top:8px"><button class="btn btn-sm" data-act="logo-pick" data-k="${k}">${d[k] ? 'Zmień' : 'Dodaj'}</button>${d[k] ? `<button class="btn btn-ghost btn-sm" data-act="logo-clear" data-k="${k}">Usuń</button>` : ''}</div></div>`).join('')}</div>
    <input type="file" id="logo-input" accept="image/*" hidden>
    <div class="label">Podpis</div><div class="row">${d.signature ? `<img class="sig-prev" src="${d.signature}" alt="">` : '<span class="faint small">Brak</span>'}<span class="grow"></span><button class="btn btn-sm" data-act="sig-pick">${d.signature ? 'Zmień' : 'Dodaj'} podpis</button>${d.signature ? '<button class="btn btn-ghost btn-sm" data-act="sig-clear">Usuń</button>' : ''}</div>
    <div style="margin-top:10px">${sw('s.doctor.useSignature', 'Umieszczaj podpis na listach')}</div><input type="file" id="sig-input" accept="image/*" hidden>
    </div></section>
    <section class="panel"><header><h3>Listy</h3></header><div class="body"><div class="grid g2">${inp('s.letter.title', 'Tytuł listu', { cls: 'all' })}${inp('s.letter.signoff', 'Formuła końcowa')}<div class="f"><span>Kody ICD-10</span><div style="padding-top:8px">${sw('s.letter.icd', 'Podawaj kody ICD-10 przy rozpoznaniach')}</div></div></div>
      <div class="row" style="margin-top:14px"><button class="btn btn-sm" data-act="sample">${I('doc')} Podgląd przykładowego listu</button></div></div></section>
  </div><div>
    <section class="panel"><header><h3>${I('spark')} Asystent AI</h3><span class="sub">Claude (Anthropic)</span></header><div class="body">
      <div class="row" style="gap:18px">${sw('s.ai.enabled', 'Pisz listy z pomocą AI')}${sw('s.ai.cleanDictation', 'Poprawiaj dyktowanie (AI)')}</div>
      ${S.org ? `<div class="dpa ${aiAllowed() ? 'ok' : ''}" style="margin-top:12px"><b>${aiAllowed() ? 'AI dozwolone w gabinecie' : 'AI wyłączone w gabinecie'}</b> <span class="faint small">— decyzja administratora gabinetu „${esc(S.org.org.name)}"${S.clinic?.isAdmin() ? ' (zmienisz ją w zakładce Administracja)' : ''}</span>
      <div class="hint" style="margin-top:6px">${aiAllowed() ? 'Przed każdym wysłaniem imiona, nazwiska, PESEL, daty urodzenia, telefony i e-maile są zastępowane znacznikami; aplikacja przywraca je lokalnie.' : 'Listy tworzy generator wbudowany — bez wysyłania danych.'}</div></div>` : `<div class="dpa ${aiKey() ? 'ok' : ''}" style="margin-top:12px"><b>${aiKey() ? 'AI włączone' : st.ai.key ? 'AI wyłączone (przełącznik powyżej)' : 'Wpisz klucz API, aby włączyć AI'}</b>
      <div class="hint" style="margin-top:6px">Przed każdym wysłaniem imiona, nazwiska, PESEL, daty urodzenia, telefony i e-maile są zastępowane znacznikami; aplikacja przywraca je lokalnie. Klucz z konta API kliniki (console.anthropic.com) — warunki Commercial Terms obejmują umowę powierzenia danych (DPA).</div></div>`}
      <div class="grid g2" style="margin-top:12px"><label class="f all"><span>Klucz API</span><input type="password" data-b="s.ai.key" value="${esc(st.ai.key)}" placeholder="sk-ant-…" autocomplete="off"></label>
      <div class="f"><span>Staranność</span>${seg('s.ai.effort', { low: 'szybko', medium: 'standard', high: 'dokładnie' })}</div><div class="f"><span>&nbsp;</span><button class="btn btn-sm" data-act="test-key">Sprawdź AI</button></div></div>
      <p class="hint" style="margin-top:12px">Do AI wysyłane są wyłącznie dane kliniczne (numery zębów, wyniki badań, opis leczenia) oraz rodzaj gramatyczny — bez imion, nazwisk, dat urodzenia i adresów, które aplikacja wstawia lokalnie. Klucz jest przechowywany w zaszyfrowanym sejfie. Bez klucza listy tworzy generator wbudowany.</p>
    </div></section>
    <section class="panel"><header><h3>${I('shield')} Bezpieczeństwo</h3></header><div class="body">
      <div class="kv"><div>Login</div><div><b>${esc(pr.username)}</b></div><div>Szyfrowanie</div><div>AES-256-GCM, klucz z hasła (PBKDF2, 600 000 iteracji)</div></div>
      <div class="label">Klucze dostępu (passkey)</div>
      ${(pr.passkeys || []).map((k) => `<div class="row" style="margin-bottom:6px"><span class="tag">${I('key')}</span><span class="grow small">${esc(k.label)} · dodano ${new Date(k.created).toLocaleDateString('pl-PL')}</span><button class="btn btn-ghost btn-sm" data-act="pk-del" data-id="${k.id}">${I('trash')}</button></div>`).join('') || '<div class="faint small" style="margin-bottom:8px">Brak</div>'}
      <button class="btn btn-sm btn-soft" data-act="pk-add" ${V.passkeySupported() ? '' : 'disabled'}>${I('plus')} Dodaj klucz dostępu</button>
      <div class="hint" style="margin-top:6px">${V.passkeySupported() ? 'Touch ID, Face ID, Windows Hello lub iPhone (kod QR na komputerze). Wymaga obsługi rozszerzenia PRF.' : 'Klucze dostępu działają, gdy aplikacja jest otwarta przez https:// lub localhost.'}</div>
      <div class="grid g2" style="margin-top:14px"><div class="f"><span>Automatyczna blokada</span>${seg('s.security.autolock', { 5: '5 min', 15: '15 min', 30: '30 min', 60: '60 min' })}</div><div class="f"><span>&nbsp;</span><button class="btn btn-sm" data-act="change-pw">Zmień hasło</button></div></div>
    </div></section>
    <section class="panel" id="clinic-panel"><header><h3>${I('users')} Gabinet</h3><span class="sub">zespół i administratorzy</span></header><div class="body">${clinicPanel()}</div></section>
    <section class="panel" id="rodo-panel"><header><h3>${I('shield')} Ochrona danych (RODO)</h3></header><div class="body">${rodoPanel()}</div></section>
    <section class="panel" id="sync-panel"><header><h3>${I('sync')} Synchronizacja</h3><span class="sub">iPhone ↔ komputer ↔ przeglądarka</span></header><div class="body">${syncPanel()}</div></section>
    <section class="panel"><header><h3>${I('folder')} Folder i kopie zapasowe</h3></header><div class="body">
      <div class="kv"><div>Folder</div><div>${fsSupported() ? (S.folder.root ? `<b>${esc(S.folder.root.name)}</b> ${S.folder.ok() ? '<span class="tag">połączony</span>' : '<span class="tag o">wymaga połączenia</span>'}` : '<span class="tag o">nie wybrano</span>') : '<span class="tag o">niedostępne w tej przeglądarce</span>'}</div><div>Ostatnia kopia</div><div>${S.folder.lastBackup ? new Date(S.folder.lastBackup).toLocaleString('pl-PL') : '—'}</div></div>
      <div class="row" style="margin-top:12px">${fsSupported() ? `<button class="btn btn-sm btn-soft" data-act="folder-pick">${S.folder.root ? 'Zmień folder' : 'Wybierz folder'}</button>${S.folder.root && !S.folder.ok() ? '<button class="btn btn-sm" data-act="folder-reconnect">Połącz</button>' : ''}${S.folder.ok() ? '<button class="btn btn-sm" data-act="backup-now">Utwórz kopię teraz</button>' : ''}` : ''}<button class="btn btn-sm" data-act="download-backup">Pobierz kopię (.json)</button></div>
      <div class="hint" style="margin-top:12px">Struktura folderu: <code class="path">Listy/Kowalska Anna (1980-03-12)/2026-10-08 Kowalska Anna – ząb 36 – do lek. dent. Nowak.pdf</code> oraz <code class="path">Kopia zapasowa (nie edytować)/</code> — zaszyfrowana kopia (najnowsza + 60 dziennych). Po utracie danych przeglądarki: „Przywróć z kopii" na ekranie logowania.</div>
    </div></section>
    <section class="panel"><header><h3>${I('install')} Aplikacja</h3><span class="sub">wersja ${APP_VERSION}</span></header><div class="body small muted" style="line-height:1.6">
      ${S.installEvt ? `<button class="btn btn-sm btn-primary" data-act="install" style="margin-bottom:10px">${I('install')} Zainstaluj na tym komputerze</button><br>` : ''}
      W Chrome / Edge: menu ⋮ → „Zainstaluj EndoList" — aplikacja pojawi się w menu Start / Launchpadzie i działa offline.
      ${['localhost', '127.0.0.1'].includes(location.hostname) ? 'Ta kopia działa lokalnie na tym komputerze. Innym lekarzom wyślij adres wersji internetowej (GitHub Pages) albo folder z aplikacją.' : `Link do udostępnienia innym lekarzom: <code class="path">${esc(location.origin + location.pathname)}</code>`} Każdy lekarz ma własne, oddzielne i zaszyfrowane dane na swoim urządzeniu — na serwer trafiają wyłącznie zaszyfrowane dane i tylko przy włączonej synchronizacji.
    </div></section>
  </div></div>`;
}

function syncPanel() {
  const c = S.sync?.cfg, st = S.syncStatus || {};
  if (!S.sync) return `<p class="small muted" style="margin:0 0 12px;line-height:1.6">Pracuj na iPhonie, w gabinecie i w domu na tych samych danych. Każda zmiana jest szyfrowana na urządzeniu (AES-256) i dopiero wtedy wysyłana — serwer nie może odczytać danych pacjentów.</p>
    <button class="btn btn-sm btn-primary" data-act="sync-setup">${I('sync')} Włącz synchronizację</button>
    <div class="hint" style="margin-top:10px">Na drugim urządzeniu (np. iPhone): otwórz EndoList → „Konto z innego urządzenia" → ten sam adres serwera, login i hasło. Serwer synchronizacji uruchamia się raz — instrukcja w pliku <code class="path">sync-server/README.md</code>.</div>`;
  const state = { ok: '<span class="tag">aktywna</span>', busy: '<span class="tag">trwa…</span>', offline: '<span class="tag o">offline</span>', error: '<span class="tag o">błąd</span>', idle: '<span class="tag">aktywna</span>' }[st.state || 'idle'];
  return `<div class="kv"><div>Stan</div><div>${state}${st.msg ? ` <span class="small muted">${esc(st.msg)}</span>` : ''}</div><div>Serwer</div><div><code class="path">${esc(c.url)}</code></div><div>Login</div><div><b>${esc(c.login)}</b></div><div>Ostatnio</div><div>${c.last ? new Date(c.last).toLocaleString('pl-PL') : '—'}</div></div>
    <div class="row" style="margin-top:12px"><button class="btn btn-sm btn-soft" data-act="sync-now">${I('refresh')} Synchronizuj teraz</button><button class="btn btn-sm btn-ghost" data-act="sync-off">Wyłącz na tym urządzeniu</button><button class="btn btn-sm btn-ghost" data-act="sync-wipe">${I('trash')} Usuń dane z serwera</button></div>
    <div class="hint" style="margin-top:10px">${I('phone')} iPhone: otwórz EndoList w Safari → „Konto z innego urządzenia" → adres serwera, login <b>${esc(c.login)}</b> i hasło. Potem „Udostępnij → Do ekranu początkowego", aby mieć ikonę aplikacji. Zmiany pojawiają się na innych urządzeniach w ciągu kilkunastu sekund.</div>`;
}

function rodoPanel() {
  const ev = auditEvents(), old = retentionCandidates();
  const pName = (id) => { const p = D().patients.get(id); return p ? patientName(p) : ''; };
  return `<div class="kv"><div>Szyfrowanie</div><div>AES-256-GCM na urządzeniu; serwer synchronizacji widzi tylko szyfrogram</div>
      <div>AI</div><div>${aiKey() ? '<span class="tag">włączone · dane zanonimizowane</span>' : settings().ai.key ? '<span class="tag o">wyłączone</span>' : '<span class="tag">wyłączone (brak klucza)</span>'}</div>
      <div>Blokada</div><div>po ${esc(String(settings().security.autolock))} min bezczynności</div>
      <div>Przechowywanie</div><div>${old.length ? `<span class="tag o">${old.length} pacjent(ów) po okresie przechowywania</span> <button class="btn btn-sm" data-act="retention-review">Przejrzyj</button>` : 'brak danych po okresie 20 lat'}</div></div>
    <div class="label">Rejestr zdarzeń <span class="faint">(${ev.length})</span></div>
    <div class="audit">${ev.slice(0, 40).map((e) => `<div class="ae"><span class="t">${new Date(e.at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</span><span>${esc(AUDIT_ACT[e.action] || e.action)}${e.detail && !/^[a-z0-9-]{12,}$/i.test(e.detail) ? ' · ' + esc(e.detail) : ''}${e.patientId && pName(e.patientId) ? ' · ' + esc(pName(e.patientId)) : ''}</span><span class="d">${esc(e.device || '')}</span></div>`).join('') || '<div class="faint small">Brak zdarzeń.</div>'}</div>
    <div class="row" style="margin-top:10px"><button class="btn btn-sm" data-act="audit-csv">${I('save')} Eksport rejestru (CSV)</button></div>
    <div class="hint" style="margin-top:10px">Prawa pacjenta: eksport danych i usunięcie — na karcie pacjenta. Dokumentacja dla administratora i IOD: <code class="path">docs/RODO.md</code>.</div>`;
}
/** Patients whose last entry is older than the 20-year retention period (art. 29 ustawy o prawach pacjenta). */
function retentionCandidates() {
  const limit = new Date(); limit.setFullYear(limit.getFullYear() - 21); // end of the calendar year of the last entry + 20 years
  const cut = `${limit.getFullYear()}-12-31`;
  return [...D().patients.values()].filter((p) => {
    const last = [...visitsOf(p.id).map((v) => v.date || ''), ...lettersOf(p.id).map((l) => l.date || ''), new Date(p.createdAt || 0).toISOString().slice(0, 10)].sort().at(-1) || '';
    return last && last <= cut;
  });
}
function retentionModal() {
  const list = retentionCandidates();
  modal({ title: 'Dane po okresie przechowywania', wide: true, body: `<p class="muted" style="margin-top:0">Dokumentację medyczną przechowuje się co do zasady 20 lat od końca roku ostatniego wpisu (art. 29 ustawy o prawach pacjenta i Rzeczniku Praw Pacjenta; są wyjątki, np. zgon pacjenta — 30 lat, dzieci do 2. r.ż. — 22 lata). Sprawdź wyjątki przed usunięciem.</p>
    ${list.map((p) => `<div class="row" style="margin-bottom:6px"><span class="grow">${esc(patientName(p))} <span class="faint small">${p.dob ? 'ur. ' + fmtDate(p.dob) : ''}</span></span><button class="btn btn-sm btn-danger" data-act="patient-delete-from-list" data-id="${p.id}">${I('trash')} Usuń</button></div>`).join('') || '<div class="faint">Brak.</div>'}`,
    buttons: [{ label: 'Zamknij', cls: 'btn-ghost' }] });
}
function exportPatient(pid) {
  const p = D().patients.get(pid); if (!p) return;
  const visits = visitsOf(pid), letters = lettersOf(pid);
  const refs = [...new Set([...visits.map((v) => v.referrerId), ...letters.map((l) => l.referrerId)].filter(Boolean))].map((id) => D().referrers.get(id)).filter(Boolean);
  const data = { informacja: 'Dane pacjenta przetwarzane w aplikacji EndoList (RODO art. 15 i 20). Plik NIE jest zaszyfrowany — przekaż go bezpiecznie.', wyeksportowano: new Date().toISOString(), administrator: [settings().doctor.practice, settings().doctor.group].filter(Boolean).join(' · '), pacjent: p, wizyty: visits, listy: letters.map((l) => ({ id: l.id, data: l.date, adresat: refName(D().referrers.get(l.referrerId)), tresc: l.content, wyslano: l.emailedAt ? new Date(l.emailedAt).toISOString() : null })), lekarze_kierujacy: refs };
  download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `Dane pacjenta – ${[p.last, p.first].filter(Boolean).join(' ')} – ${today()}.json`);
  audit('export', 'pełny eksport (JSON)', pid);
  toast('Pobrano dane pacjenta (plik niezaszyfrowany — przekaż go bezpiecznie). Listy w PDF możesz zapisać z widoku listu.', 'ok');
}
function deletePatient(pid) {
  const p = D().patients.get(pid); if (!p) return;
  const vs = visitsOf(pid), ls = lettersOf(pid);
  modal({ title: 'Usunąć wszystkie dane pacjenta?', body: `<p class="muted" style="margin-top:0">Zostaną trwale usunięte: karta pacjenta, ${vs.length} wizyt(y) i ${ls.length} list(y) — na wszystkich zsynchronizowanych urządzeniach. Pliki PDF zapisane w folderze nie są usuwane.</p>
    <p class="small" style="color:var(--warn)">Prawo do usunięcia danych (RODO art. 17) nie obejmuje dokumentacji medycznej, którą trzeba przechowywać przez okres wymagany prawem (art. 17 ust. 3 lit. b i c RODO). Upewnij się, że oryginał dokumentacji jest w systemie gabinetu (np. ProDentis).</p>
    <label class="f"><span>Aby potwierdzić, wpisz nazwisko: ${esc(p.last || p.first)}</span><input type="text" id="del-confirm" autocomplete="off"></label>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('trash')} Usuń trwale`, cls: 'btn-danger', onClick: async (ov) => {
      if ($('#del-confirm', ov).value.trim().toLowerCase() !== String(p.last || p.first).trim().toLowerCase()) { toast('Nazwisko się nie zgadza.', 'err'); return false; }
      audit('delete', 'pacjent i wszystkie jego dane', pid);
      for (const l of ls) await remove('letters', l.id);
      for (const v of vs) await remove('visits', v.id);
      await remove('patients', pid);
      if (S.visitId && !D().visits.get(S.visitId)) S.visitId = null;
      document.querySelectorAll('.overlay').forEach((o) => o.remove());
      go('patients'); toast('Dane pacjenta usunięte.', 'ok');
    } }] });
}
function exportAuditCsv() {
  const pName = (id) => { const p = D().patients.get(id); return p ? patientName(p) : (id ? '(usunięty)' : ''); };
  const q = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`;
  const rows = [['czas', 'urządzenie', 'użytkownik', 'zdarzenie', 'szczegóły', 'pacjent'], ...auditEvents().map((e) => [new Date(e.at).toISOString(), e.device, e.user, AUDIT_ACT[e.action] || e.action, e.detail, pName(e.patientId)])];
  download(new Blob(['\ufeff' + rows.map((r) => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `endolist-rejestr-zdarzen-${today()}.csv`);
}

function clinicPanel() {
  if (!S.sync) return `<p class="small muted" style="margin:0">Gabinet (zespół lekarzy z administratorami) wymaga synchronizacji — włącz ją powyżej lub poniżej.</p>`;
  if (!S.org) return `<p class="small muted" style="margin:0 0 12px;line-height:1.6">Załóż gabinet, aby zostać jego <b>administratorem</b>: zapraszać lekarzy i innych administratorów, resetować zapomniane hasła, zachować dostęp do dokumentacji po odejściu lekarza i decydować o użyciu AI. Albo dołącz do istniejącego gabinetu kodem zaproszenia.</p>
    <div class="row"><button class="btn btn-sm btn-primary" data-act="clinic-create">${I('shield')} Załóż gabinet (zostanę administratorem)</button><button class="btn btn-sm" data-act="clinic-join">${I('users')} Dołącz kodem zaproszenia</button></div>`;
  const admin = S.clinic.isAdmin();
  return `<div class="kv"><div>Gabinet</div><div><b>${esc(S.org.org.name)}</b></div><div>Twoja rola</div><div>${admin ? '<span class="tag">administrator</span>' : '<span class="tag">lekarz</span>'}</div></div>
    ${admin ? `<div class="row" style="margin-top:12px"><button class="btn btn-sm btn-primary" data-nav="admin">${I('shield')} Otwórz administrację</button></div>` : ''}
    <div class="hint" style="margin-top:10px">Administratorzy gabinetu mają dostęp do Twoich danych w celu zapewnienia ciągłości dokumentacji (np. po zmianie pracy) i mogą zresetować Twoje hasło. Każdy taki dostęp jest zapisywany w rejestrze zdarzeń.</div>`;
}
function clinicCreateModal() {
  modal({ title: 'Załóż gabinet', body: `<p class="muted" style="margin-top:0">Zostaniesz pierwszym administratorem. Kolejnych lekarzy i administratorów zaprosisz kodem.</p><label class="f"><span>Nazwa gabinetu</span><input type="text" id="cl-name" value="${esc([settings().doctor.practice, settings().doctor.group].filter(Boolean).join(' · '))}"></label>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('shield')} Załóż`, cls: 'btn-primary', onClick: async (ov, btn) => {
      const name = $('#cl-name', ov).value.trim(); if (!name) { toast('Podaj nazwę.', 'err'); return false; }
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Tworzenie kluczy…';
      try { S.org = await S.clinic.create(name); audit('admin', 'utworzono gabinet ' + name); toast('Gabinet utworzony — jesteś administratorem.', 'ok'); renderTop(); go('admin'); }
      catch (e) { toast(e.message, 'err'); btn.disabled = false; btn.innerHTML = 'Załóż'; return false; }
    } }] });
}
function clinicJoinModal() {
  modal({ title: 'Dołącz do gabinetu', body: `<p class="muted" style="margin-top:0">Wpisz kod zaproszenia od administratora gabinetu. Administratorzy będą mieli dostęp do Twoich danych (ciągłość dokumentacji, reset hasła); każdy dostęp jest rejestrowany.</p><label class="f"><span>Kod zaproszenia</span><input type="text" id="cl-code" placeholder="ABCD-EFGH-JKLM-NPQR" autocapitalize="characters" autocomplete="off" spellcheck="false"></label>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('users')} Dołącz`, cls: 'btn-primary', onClick: async (ov, btn) => {
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Dołączanie…';
      try { S.org = await S.clinic.join($('#cl-code', ov).value); audit('admin', 'dołączono do gabinetu ' + S.org.org.name); toast(`Dołączono do gabinetu „${S.org.org.name}".`, 'ok'); renderTop(); renderView(); }
      catch (e) { toast(e.message, 'err'); btn.disabled = false; btn.innerHTML = 'Dołącz'; return false; }
    } }] });
}
async function clinicInvite(role) {
  const inv = await S.clinic.invite(role);
  audit('admin', `zaproszenie (${role === 'admin' ? 'administrator' : 'lekarz'})`);
  const text = `Zaproszenie do gabinetu „${S.org.org.name}" w EndoList${role === 'admin' ? ' (rola: administrator)' : ''}.\nKod: ${inv.code}\nWażny do: ${new Date(inv.expires).toLocaleDateString('pl-PL')}.\nEndoList → Ustawienia → Gabinet → Dołącz kodem zaproszenia.`;
  modal({ title: role === 'admin' ? 'Zaproszenie administratora' : 'Zaproszenie lekarza', body: `<p class="muted" style="margin-top:0">Przekaż kod osobiście lub bezpiecznym kanałem. Kod jest jednorazowy i ważny 7 dni (do ${new Date(inv.expires).toLocaleDateString('pl-PL')}). Osoba zapraszana musi mieć konto EndoList z włączoną synchronizacją.</p>
    <div class="invite-code" id="inv-code">${inv.code}</div><div class="hint" style="text-align:center">rola: <b>${role === 'admin' ? 'administrator' : 'lekarz'}</b></div>`,
    buttons: [{ label: 'Zamknij', cls: 'btn-ghost' }, ...(navigator.share ? [{ label: 'Udostępnij', onClick: () => { navigator.share({ text }).catch(() => {}); return false; } }] : []), { label: `${I('copy')} Kopiuj`, cls: 'btn-primary', onClick: async () => { try { await navigator.clipboard.writeText(text); toast('Skopiowano zaproszenie.', 'ok'); } catch { toast('Zaznacz kod i skopiuj go ręcznie.', 'err'); } return false; } }] });
}

function viewAdmin() {
  if (!S.clinic?.isAdmin()) return '<div class="empty">Brak uprawnień administratora.</div>';
  const o = S.org.org;
  return `<div class="pagehead"><div><h2>Administracja</h2><div class="small muted">${esc(o.name)} <button class="btn btn-ghost btn-sm" data-act="clinic-rename">${I('edit')}</button></div></div><span class="grow"></span>
      <button class="btn" data-act="clinic-invite" data-role="member">${I('plus')} Zaproś lekarza</button><button class="btn btn-soft" data-act="clinic-invite" data-role="admin">${I('shield')} Zaproś administratora</button></div>
    <div class="settings"><div>
      <section class="panel"><header><h3>Zespół</h3><span class="sub" id="adm-count"></span></header><div class="body" id="adm-members"><div class="row"><span class="spin"></span><span class="muted">Odszyfrowywanie listy…</span></div></div></section>
    </div><div>
      <section class="panel"><header><h3>${I('spark')} Zasady gabinetu</h3></header><div class="body">
        <div class="dpa ${o.policy?.aiDpa ? 'ok' : ''}"><div class="row"><b class="grow">${o.policy?.aiDpa ? 'AI dozwolone (umowa powierzenia z Anthropic potwierdzona)' : 'AI wyłączone dla całego gabinetu'}</b><button class="btn btn-sm" data-act="clinic-policy-ai">${o.policy?.aiDpa ? 'Wyłącz' : 'Zezwól'}</button></div>
        <div class="hint" style="margin-top:6px">Decyzja administratora danych obowiązuje wszystkich lekarzy gabinetu. Dane do AI są zawsze anonimizowane.</div></div>
      </div></section>
      <section class="panel"><header><h3>${I('key')} Bezpieczeństwo</h3></header><div class="body small muted" style="line-height:1.6">
        Klucz gabinetu: <code class="path" id="adm-fp"></code><br>
        Administratorzy mają klucz gabinetu, który otwiera depozyt kluczy lekarzy — mogą zresetować hasło i odczytać dane członka (ciągłość dokumentacji). Serwer synchronizacji nie ma tego klucza. Usunięcie członka natychmiast odcina mu dostęp, a jego urządzenia przy najbliższym połączeniu usuwają dane gabinetu. Każda czynność administracyjna trafia do rejestru zdarzeń.
      </div></section>
    </div></div>`;
}
async function fillAdmin() {
  if (!S.clinic?.isAdmin()) return;
  await refreshClinic({ render: false });
  const ms = (await S.clinic.members()).sort((a, b) => (a.status === b.status ? 0 : a.status === 'active' ? -1 : 1) || (a.role === b.role ? 0 : a.role === 'admin' ? -1 : 1) || String(a.name).localeCompare(String(b.name), 'pl'));
  const el = $('#adm-members'); if (!el) return;
  $('#adm-count').textContent = `${ms.filter((m) => m.status === 'active').length} aktywnych`;
  fingerprint(S.org.org.pub).then((f) => { const x = $('#adm-fp'); if (x) x.textContent = f; });
  const admins = ms.filter((m) => m.role === 'admin' && m.status === 'active').length;
  const ago = (t) => (t ? new Date(t).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : '—');
  el.innerHTML = ms.map((m) => `<div class="member ${m.status}">
      <div class="grow"><b>${esc(m.name || m.login || '?')}</b>${m.self ? ' <span class="faint small">(Ty)</span>' : ''}<div class="small muted">login: ${esc(m.login || '?')} · ostatnio: ${ago(m.lastSeen)}</div></div>
      <span class="tag ${m.role === 'admin' ? '' : 'v'}">${m.role === 'admin' ? 'administrator' : 'lekarz'}</span>${m.status === 'removed' ? '<span class="tag o">usunięty</span>' : ''}
      <div class="row m-act">${m.status === 'active' ? `
        ${m.role === 'admin' && admins <= 1 ? '<span class="faint small" style="padding:0 8px">jedyny administrator</span>' : `<button class="btn btn-ghost btn-sm" data-act="m-role" data-acct="${m.acct}" data-v="${m.role === 'admin' ? 'member' : 'admin'}">${m.role === 'admin' ? 'Odbierz admina' : 'Nadaj admina'}</button>`}
        ${m.self ? '' : `<button class="btn btn-ghost btn-sm" data-act="m-reset" data-acct="${m.acct}">${I('key')} Reset hasła</button>`}
        <button class="btn btn-ghost btn-sm" data-act="m-data" data-acct="${m.acct}">${I('doc')} Dane</button>
        ${m.self ? '' : `<button class="btn btn-ghost btn-sm btn-danger" data-act="m-remove" data-acct="${m.acct}">${I('trash')} Usuń z gabinetu</button>`}` : `
        <button class="btn btn-ghost btn-sm" data-act="m-data" data-acct="${m.acct}">${I('doc')} Dane</button>
        <button class="btn btn-ghost btn-sm" data-act="m-restore" data-acct="${m.acct}">Przywróć dostęp</button>`}</div></div>`).join('') || '<div class="faint">Brak członków.</div>';
}
async function memberAction(kind, acct, v) {
  const m = (await S.clinic.members()).find((x) => x.acct === acct); if (!m) return;
  const who = m.name || m.login;
  try {
    if (kind === 'role') {
      if (!(await confirmBox(v === 'admin' ? `Nadać uprawnienia administratora: ${who}?` : `Odebrać uprawnienia administratora: ${who}?`, v === 'admin' ? 'Administrator może zarządzać zespołem, resetować hasła i odczytywać dane wszystkich lekarzy gabinetu.' : 'Osoba straci dostęp do administracji na serwerze.', v === 'admin' ? 'Nadaj' : 'Odbierz'))) return;
      await S.clinic.setRole(m, v); audit('admin', `${v === 'admin' ? 'nadano' : 'odebrano'} uprawnienia administratora: ${who}`);
    } else if (kind === 'remove') {
      if (!(await confirmBox(`Usunąć ${who} z gabinetu?`, 'Konto straci dostęp natychmiast; przy najbliższym połączeniu urządzenia tej osoby usuną dane gabinetu. Dokumentacja pozostaje w gabinecie — administratorzy nadal mają do niej dostęp („Dane").', 'Usuń z gabinetu'))) return;
      await S.clinic.setStatus(m, 'removed'); audit('admin', `usunięto z gabinetu: ${who}`);
    } else if (kind === 'restore') {
      await S.clinic.setStatus(m, 'active'); audit('admin', `przywrócono dostęp: ${who}`);
    } else if (kind === 'reset') return resetMemberPassword(m);
    else if (kind === 'data') return memberDataModal(m);
    toast('Zapisano.', 'ok');
  } catch (e) { toast(e.message, 'err'); }
  if (S.view === 'admin') { renderTop(); renderView(); }
}
function resetMemberPassword(m) {
  const who = m.name || m.login;
  modal({ title: `Reset hasła: ${who}`, body: `<p class="muted" style="margin-top:0">Nadaj nowe hasło tymczasowe i przekaż je osobiście. Dotychczasowe hasło przestanie działać; dane lekarza pozostają nienaruszone.</p>
    <div class="grid"><label class="f"><span>Nowe hasło (min. 12 znaków)</span><input type="password" id="rp1" autocomplete="new-password"></label><label class="f"><span>Powtórz</span><input type="password" id="rp2" autocomplete="new-password"></label></div>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: `${I('key')} Ustaw nowe hasło`, cls: 'btn-primary', onClick: async (ov, btn) => {
      const a = $('#rp1', ov).value, b = $('#rp2', ov).value;
      if (a.length < 12) { toast('Hasło musi mieć co najmniej 12 znaków.', 'err'); return false; }
      if (a !== b) { toast('Hasła różnią się.', 'err'); return false; }
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Ustawianie…';
      try { await S.clinic.resetPassword(m, a); audit('admin', `reset hasła: ${who}`); toast(`Nowe hasło ustawione dla: ${who}.`, 'ok'); }
      catch (e) { toast(e.message, 'err'); btn.disabled = false; btn.innerHTML = 'Ustaw nowe hasło'; return false; }
    } }] });
}
async function memberDataModal(m) {
  const who = m.name || m.login;
  const busy = modal({ title: `Dane: ${who}`, body: '<div class="row"><span class="spin"></span><span class="muted">Odszyfrowywanie…</span></div>' });
  let d;
  try { d = await S.clinic.memberData(m); } catch (e) { busy.close(); return toast(e.message, 'err'); }
  busy.close();
  audit('admin', `dostęp do danych lekarza: ${who}`);
  const pts = [...(d.patients?.values() || [])], vis = [...(d.visits?.values() || [])], lets = [...(d.letters?.values() || [])];
  const ev = [...(d.audit?.values() || [])].flatMap((r) => (r.events || []).map((e) => ({ ...e, device: r.device }))).sort((a, b) => b.at - a.at);
  const pn = (id) => { const p = d.patients?.get(id); return p ? [p.first, p.last].filter(Boolean).join(' ') : ''; };
  modal({ title: `Dane: ${who}`, wide: true, body: `<div class="kv"><div>Pacjenci</div><div><b>${pts.length}</b></div><div>Wizyty</div><div>${vis.length}</div><div>Listy</div><div>${lets.length}</div></div>
    <div class="label">Pacjenci</div><div class="small" style="max-height:160px;overflow:auto">${pts.map((p) => `<div>${esc([p.last, p.first].filter(Boolean).join(' '))} <span class="faint">${p.dob ? fmtDate(p.dob) : ''}</span></div>`).join('') || '<span class="faint">brak</span>'}</div>
    <div class="label">Rejestr zdarzeń</div><div class="audit">${ev.slice(0, 30).map((e) => `<div class="ae"><span class="t">${new Date(e.at).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}</span><span>${esc(AUDIT_ACT[e.action] || e.action)}${e.detail && !/^[a-z0-9-]{12,}$/i.test(e.detail) ? ' · ' + esc(e.detail) : ''}${pn(e.patientId) ? ' · ' + esc(pn(e.patientId)) : ''}</span><span class="d">${esc(e.device || '')}</span></div>`).join('') || '<div class="faint small">Brak.</div>'}</div>
    <p class="hint">Dostęp tylko do odczytu; został zapisany w rejestrze zdarzeń. Eksport zawiera dane osobowe i nie jest szyfrowany — przechowuj go zgodnie z zasadami gabinetu.</p>`,
    buttons: [{ label: 'Zamknij', cls: 'btn-ghost' }, { label: `${I('save')} Eksport (JSON)`, cls: 'btn-primary', onClick: () => {
      download(new Blob([JSON.stringify({ lekarz: { login: m.login, nazwa: m.name }, wyeksportowano: new Date().toISOString(), pacjenci: pts, wizyty: vis, listy: lets, lekarze_kierujacy: [...(d.referrers?.values() || [])], rejestr: ev }, null, 2)], { type: 'application/json' }), `Dane lekarza – ${m.login} – ${today()}.json`);
      audit('admin', `eksport danych lekarza: ${who}`); return false;
    } }] });
}

/* ================================================================ events */
document.addEventListener('click', async (e) => {
  const t = e.target;
  const nav = t.closest('[data-nav]'); if (nav && S.session) { S.search = ''; go(nav.dataset.nav); return; }
  const segb = t.closest('.seg[data-seg] button');
  if (segb) { const sg = segb.parentElement; setBound(sg.dataset.seg, segb.dataset.v); $$('button', sg).forEach((b) => b.classList.toggle('on', b === segb)); if (sg.dataset.re || sg.dataset.seg.startsWith('v.')) rerender(sg.dataset.seg); return; }
  const mic = t.closest('[data-mic]'); if (mic) { toggleMic(mic); return; }
  const tooth = t.closest('#arch g.tooth'); if (tooth) { openTooth(+tooth.dataset.fdi); return; }
  const tch = t.closest('[data-open-tooth]'); if (tch) { openTooth(+tch.dataset.openTooth); return; }
  const tt = t.closest('[data-ttab]'); if (tt) { S.ttab = tt.dataset.ttab; refreshWorkspace(); return; }
  const qk = t.closest('[data-quick]'); if (qk && S.ws) { quickToggle(S.ws.draft, qk.dataset.quick); S.ws.dirty = true; refreshWorkspace({ model: true }); return; }
  const row = t.closest('[data-open-patient]'); if (row) { go('patient', { patientId: row.dataset.openPatient }); return; }
  const rv = t.closest('[data-open-visit]'); if (rv && !t.closest('button')) { go('visit', { visitId: rv.dataset.openVisit }); return; }
  const rl = t.closest('[data-open-letter]'); if (rl && !t.closest('button')) { go('letter', { letterId: rl.dataset.openLetter }); return; }
  const re = t.closest('[data-edit-ref]'); if (re && !t.closest('button')) { await editReferrer(D().referrers.get(re.dataset.editRef)); renderView(); return; }
  const a = t.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act;
  try { await action(act, a); } catch (er) { console.error(er); toast(er.message || String(er), 'err'); }
});

async function action(act, a) {
  const v = S.session ? curVisit() : null, rec = S.session ? curTooth() : null;
  switch (act) {
    /* auth & onboarding */
    case 'new-account': OB = null; return renderOnboarding(0);
    case 'ob-next': readOB(); if (OB.step === 0 && !OB.doctor.last) return toast('Podaj nazwisko.', 'err'); return renderOnboarding(OB.step + 1);
    case 'ob-prev': readOB(); return renderOnboarding(OB.step - 1);
    case 'ob-sig': return $('#ob-sig-input').click();
    case 'ob-logo': { const el = $('#ob-logo-input'), k = a.dataset.k; el.onchange = async () => { const f = el.files[0]; if (f) { readOB(); OB.doctor[k] = await logoData(f); if (k === 'logo') OB.doctor.logoDefault = false; renderOnboarding(1); } }; return el.click(); }
    case 'ob-sig-clear': readOB(); OB.doctor.signature = ''; return renderOnboarding(2);
    case 'ob-create': {
      const f = new FormData($('#ob-acc'));
      if (!$('#ob-acc').reportValidity()) return;
      if (f.get('pw') !== f.get('pw2')) { $('#err').textContent = 'Hasła różnią się.'; return; }
      a.disabled = true; a.innerHTML = '<span class="spin"></span> Tworzenie…';
      try {
        const s = await V.createProfile({ username: f.get('username'), displayName: [OB.doctor.title, OB.doctor.first, OB.doctor.last].filter(Boolean).join(' '), password: f.get('pw') });
        if (S.syncUrl) {
          // the account lives on the sync server from the start → the same login and password work on every device
          a.innerHTML = '<span class="spin"></span> Rejestracja na serwerze synchronizacji…';
          try { await enableSync(s, { url: S.syncUrl, login: f.get('username'), password: f.get('pw') }); }
          catch (er) {
            if (er.status === 409) { await V.deleteProfile(s.pid); throw new Error('Ten login jest już zajęty na serwerze synchronizacji — wybierz inny (np. z nazwiskiem).'); }
            await V.deleteProfile(s.pid); throw er;
          }
        }
        OB.session = s; OB.username = f.get('username');
        const st = clone(DEFAULT_SETTINGS); st.doctor = { ...st.doctor, ...OB.doctor };
        await s.put('settings', st);
        renderOnboarding(4);
      } catch (er) { a.disabled = false; a.innerHTML = `${I('shield')} Utwórz konto`; $('#err').textContent = er.message; }
      return;
    }
    case 'ob-passkey': { try { await OB.session.addPasskey(navigator.platform.includes('Mac') ? 'Mac / iPhone' : 'Klucz dostępu'); $('#pk-state').innerHTML = `<span style="color:var(--ok)">✓ Klucz dostępu dodany.</span>`; } catch (er) { if (er.name !== 'NotAllowedError') $('#pk-state').innerHTML = `<span style="color:#ff9aa4">${esc(er.message)}</span>`; } return; }
    case 'ob-finish': {
      const key = $('#ob-key')?.value.trim();
      const s = OB.session; const all = await s.loadAll(); const st = all.settings?.get('main');
      if (key && st) { st.ai.key = key; await s.put('settings', st); }
      OB = null; return enter(s);
    }
    case 'passkey-login': { try { await enter(await V.unlockPasskey()); } catch (er) { if (er.name !== 'NotAllowedError') { const el = $('#err'); if (el) el.textContent = er.message; } } return; }
    case 'restore-start': return restoreFlow();
    case 'patient-export': return exportPatient(S.patientId);
    case 'patient-delete': return deletePatient(S.patientId);
    case 'audit-csv': return exportAuditCsv();
    case 'retention-review': return retentionModal();
    case 'clinic-create': return clinicCreateModal();
    case 'clinic-join': return clinicJoinModal();
    case 'clinic-invite': return clinicInvite(a.dataset.role);
    case 'clinic-policy-ai': { const on = !S.org.org.policy?.aiDpa; if (on && !(await confirmBox('Zezwolić na AI w gabinecie?', 'Potwierdzasz jako administrator, że gabinet (administrator danych) zawarł z Anthropic umowę powierzenia (DPA). Dane będą wysyłane wyłącznie w postaci zanonimizowanej.', 'Zezwól'))) return; await S.clinic.setPolicy({ aiDpa: on }); audit('admin', on ? 'AI dozwolone w gabinecie' : 'AI wyłączone w gabinecie'); return renderView(); }
    case 'clinic-rename': { const n = prompt('Nazwa gabinetu', S.org.org.name); if (n && n.trim()) { await S.clinic.rename(n.trim()); audit('admin', 'zmiana nazwy gabinetu'); renderView(); } return; }
    case 'm-role': return memberAction('role', a.dataset.acct, a.dataset.v);
    case 'm-remove': return memberAction('remove', a.dataset.acct);
    case 'm-restore': return memberAction('restore', a.dataset.acct);
    case 'm-reset': return memberAction('reset', a.dataset.acct);
    case 'm-data': return memberAction('data', a.dataset.acct);
    case 'patient-delete-from-list': document.querySelectorAll('.overlay').forEach((o) => o.remove()); return deletePatient(a.dataset.id);
    case 'sync-signin': return syncSignInModal();
    case 'sync-setup': return syncSetupModal();
    case 'sync-now': if (S.sync) { await S.sync.now(); if (S.syncStatus?.state === 'ok') toast('Zsynchronizowano.', 'ok'); else toast(S.syncStatus?.msg || 'Synchronizacja nie powiodła się.', 'err'); renderView(); } return;
    case 'sync-off': if (await confirmBox('Wyłączyć synchronizację na tym urządzeniu?', 'Dane zostają na tym urządzeniu i na serwerze. Inne urządzenia nadal się synchronizują.', 'Wyłącz')) { audit('sync', 'wyłączono na urządzeniu'); await S.sync?.disable(); S.sync = null; S.clinic = null; S.org = null; clearInterval(S.clinicTimer); S.syncStatus = null; renderStatus(); renderBanner(); renderView(); } return;
    case 'sync-wipe': if (await confirmBox('Usunąć dane z serwera?', 'Zaszyfrowane dane tego konta zostaną usunięte z serwera synchronizacji, a synchronizacja wyłączona na wszystkich urządzeniach. Dane na urządzeniach pozostają.', 'Usuń z serwera')) { try { audit('sync', 'usunięto dane z serwera'); await S.sync?.disable({ wipe: true }); S.sync = null; S.clinic = null; S.org = null; S.syncStatus = null; toast('Usunięto dane z serwera.', 'ok'); } catch (er) { toast(er.message, 'err'); } renderStatus(); renderView(); } return;
    case 'lock': return lockNow();
    case 'install': if (S.installEvt) { S.installEvt.prompt(); S.installEvt = null; renderTop(); } return;
    /* folder */
    case 'folder-pick': {
      try { await S.folder.pick(); } catch (er) { if (er.name !== 'AbortError') toast('Nie udało się otworzyć folderu: ' + er.message, 'err'); return; }
      const bk = await S.folder.readBackup();
      if (bk && bk.profile?.id === S.session.pid) { const r = await V.importBackup(bk); if (r.imported) { await reloadData(); toast(`Przywrócono z folderu: ${r.imported} rekordów.`, 'ok'); } }
      if (await backupNow()) toast(`Połączono z folderem „${S.folder.root.name}".`, 'ok');
      renderBanner(); renderView(); return;
    }
    case 'folder-reconnect': if (await S.folder.reconnect()) { toast('Folder połączony.', 'ok'); await backupNow(); } else toast('Nie udzielono zgody.', 'err'); renderBanner(); renderView(); return;
    case 'backup-now': S.folder.error = ''; if (await backupNow()) toast('Kopia zapasowa utworzona.', 'ok'); renderBanner(); return renderView();
    case 'download-backup': audit('backup', 'zaszyfrowana kopia .json'); download(new Blob([JSON.stringify(await S.session.exportBackup())], { type: 'application/json' }), `endolist-kopia-${today()}.json`); return toast('Pobrano zaszyfrowaną kopię. Do odtworzenia potrzebne jest hasło.', 'ok');
    /* visit */
    case 'new-visit': { const nv = newVisit(v?.patientId || '', v?.referrerId || ''); D().visits.set(nv.id, nv); return go('visit', { visitId: nv.id }); }
    case 'pick-patient': { const p = await pickPatient(); if (p) { v.patientId = p.id; save('visits', v); renderView(); } return; }
    case 'pick-referrer': { const r = await pickReferrer(); if (r) { v.referrerId = r.id; save('visits', v); renderView(); } return; }
    case 'save-visit': if (!v.patientId) { const p = await pickPatient(); if (!p) return; v.patientId = p.id; } save('visits', v); renderView(); return toast('Wizyta zapisana.', 'ok');
    case 'gen-letter': save('visits', v); return startLetter(v.id);
    case 'ws-save': return saveWorkspace();
    case 'ws-cancel': if (S.ws.dirty && !(await confirmBox('Odrzucić zmiany?', `Zmiany w zębie ${S.ws.fdi} nie zostały zapisane.`, 'Odrzuć'))) return; return closeWorkspace();
    case 'rm-tooth': if (!(await confirmBox('Usunąć ząb z wizyty?', `Ząb ${rec.fdi} i wszystkie wpisane dla niego dane zostaną usunięte z tej wizyty.`))) return; v.teeth = v.teeth.filter((x) => x.fdi !== rec.fdi); save('visits', v); return closeWorkspace();
    case 'cfg': { const c = anatomy(rec.fdi).configs[+a.dataset.i]; rec.config = +a.dataset.i; rec.anatOk = true; rec.roots = configRoots(c, rec.roots); S.ws.dirty = true; return refreshWorkspace({ model: true }); }
    case 'roots': rec.anatOk = true; rec.roots = rootsForCount(rec.fdi, +a.dataset.n, rec.roots); rec.config = anatomy(rec.fdi).configs.findIndex((c) => c.roots.length === +a.dataset.n); S.ws.dirty = true; return refreshWorkspace({ model: true });
    case 'add-canal': { const name = a.dataset.name === 'dodatkowy' ? 'X' : a.dataset.name; rec.roots[+a.dataset.r].canals.push({ name, wl: '', ref: '', maf: '' }); rec.config = -1; rec.anatOk = true; S.ws.dirty = true; return refreshWorkspace({ model: true }); }
    case 'rm-canal': rec.roots[+a.dataset.r].canals.splice(+a.dataset.c, 1); rec.config = -1; rec.anatOk = true; S.ws.dirty = true; return refreshWorkspace({ model: true });
    case 'add-work': rec.work.push({ id: V.uid(), type: a.dataset.type, cls: '', surf: [], mat: '', product: '', postType: '', prep: [], note: '' }); S.ws.dirty = true; return refreshWorkspace();
    case 'rm-work': rec.work.splice(+a.dataset.i, 1); S.ws.dirty = true; return refreshWorkspace();
    case 'add-prod': case 'pick-prod': {
      const cat = S.matCat || 'files', name = (act === 'pick-prod' ? a.dataset.name : $('#mat-name').value).trim(); if (!name) return;
      rec.products ??= [];
      const i = rec.products.findIndex((x) => x.name === name);
      if (i >= 0 && act === 'pick-prod') rec.products.splice(i, 1); else if (i < 0) rec.products.push({ cat, name });
      if (!PRODUCTS[cat].includes(name)) { const st = settings(); st.customProducts ??= {}; const l = st.customProducts[cat] ??= []; if (!l.includes(name)) { l.push(name); save('settings', st); } }
      S.ws.dirty = true; return refreshWorkspace();
    }
    case 'rm-prod': rec.products.splice(+a.dataset.i, 1); S.ws.dirty = true; return refreshWorkspace();
    case 'clean-manual': {
      if (!rec.manual?.trim()) return toast('Najpierw wpisz lub podyktuj opis.', 'err');
      a.disabled = true; a.innerHTML = '<span class="spin"></span> Poprawianie…';
      try { const r = await cleanDictation(aiKey(), rec.manual, 'Opis wykonanej pracy przy zębie ' + rec.fdi, { pseudo: pseudoHere() }); audit('ai', 'poprawa opisu zęba (dane zanonimizowane)', curVisit()?.patientId); rec.manual = r.text; S.ws.dirty = true; refreshWorkspace(); if (r.warnings?.length) toast(r.warnings.join(' '), 'err'); else toast('Tekst poprawiony.', 'ok'); } catch (er) { toast(er.message, 'err'); a.disabled = false; }
      return;
    }
    /* letter */
    case 'letter-back': { const L = D().letters.get(S.letterId); return go('patient', { patientId: L.patientId }); }
    case 'save-pdf': { const L = D().letters.get(S.letterId); audit('pdf', L.id, L.patientId); return saveLetterPdf(L); }
    case 'email': { const L = D().letters.get(S.letterId); audit('email', L.id, L.patientId); return emailLetter(L); }
    case 'prodentis': { const L = D().letters.get(S.letterId); audit('prodentis', L.id, L.patientId); return prodentisModal(L); }
    case 'print': { audit('print', S.letterId, D().letters.get(S.letterId)?.patientId); const b = await letterBlob(D().letters.get(S.letterId)); const w = window.open(URL.createObjectURL(b)); if (!w) toast('Zezwól na wyskakujące okna, aby drukować.', 'err'); else setTimeout(() => { try { w.print(); } catch {} }, 800); return; }
    case 'regen-ai': { const L = D().letters.get(S.letterId); if ((L.notes || []).length && !(await confirmBox('Napisać list od nowa przez AI?', 'Obecna treść i uwagi zostaną zastąpione.', 'Napisz'))) return; await createLetter({ patientId: L.patientId, referrerId: L.referrerId, visitIds: L.visitIds, existing: L }); return; }
    case 'regen': { const L = D().letters.get(S.letterId); if (!(await confirmBox('Wygenerować list od nowa?', 'Obecna treść i uwagi zostaną zastąpione nową wersją listu.', 'Wygeneruj'))) return; return createLetter({ patientId: L.patientId, referrerId: L.referrerId, visitIds: L.visitIds, existing: L }); }
    case 'pdf-preview': return pdfPreview(D().letters.get(S.letterId));
    case 'revise': { const L = D().letters.get(S.letterId); L.instruction = $('#gen-text')?.value || ''; return reviseWithAI(L); }
    case 'use-sugg': { const L = D().letters.get(S.letterId); const w = L.warnings[+a.dataset.i]; L.genEdit = true; L.instruction = [L.instruction || $('#gen-text')?.value || '', w].filter(Boolean).join('\n'); save('letters', L); return rerenderLetter(); }
    case 'rm-note': { const L = D().letters.get(S.letterId); L.notes = L.notes.filter((x) => x.id !== a.dataset.id); save('letters', L); return rerenderLetter(); }
    case 'goto-note': { const m = $(`mark[data-note="${a.dataset.id}"]`); if (m) { m.scrollIntoView({ behavior: 'smooth', block: 'center' }); m.classList.add('flash'); setTimeout(() => m.classList.remove('flash'), 1200); } return; }
    /* patients */
    case 'add-patient': { const p = await pickPatient(); if (p) go('patient', { patientId: p.id }); return; }
    case 'edit-patient': { const p = D().patients.get(S.patientId); const m = modal({ title: 'Dane pacjenta', wide: true, body: patientForm(p), buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: 'Zapisz', cls: 'btn-primary', onClick: (ov) => { const f = readForm(ov); if (!validPatient(f)) return false; Object.assign(p, f); save('patients', p); renderView(); } }] }); wirePesel(m.el); return; }
    case 'patient-visit': case 'other-visit': {
      const last = visitsOf(S.patientId)[0];
      const nv = newVisit(S.patientId, last?.referrerId || '');
      if (act === 'other-visit') { nv.performer = 'other'; nv.date = ''; }
      D().visits.set(nv.id, nv); save('visits', nv); return go('visit', { visitId: nv.id, fdi: null, ttab: 'anat' });
    }
    case 'patient-letter': {
      const vs = visitsOf(S.patientId).filter((x) => x.teeth.length);
      const ids = await pickVisits(S.patientId, vs.slice(0, 1).map((x) => x.id)); if (!ids) return;
      let refId = vs.find((x) => ids.includes(x.id) && x.referrerId)?.referrerId;
      if (!refId) { const r = await pickReferrer(); if (!r) return; refId = r.id; }
      return createLetter({ patientId: S.patientId, referrerId: refId, visitIds: ids });
    }
    case 'del-visit': if (await confirmBox('Usunąć wizytę?', 'Wizyta zostanie trwale usunięta. Zapisane pliki PDF nie są usuwane.')) { audit('delete', 'wizyta', D().visits.get(a.dataset.id)?.patientId); await remove('visits', a.dataset.id); renderView(); } return;
    case 'del-letter': if (await confirmBox('Usunąć list?', 'List zostanie usunięty z aplikacji. Zapisane pliki PDF pozostaną w folderze.')) { audit('delete', 'list', D().letters.get(a.dataset.id)?.patientId); await remove('letters', a.dataset.id); renderView(); } return;
    /* referrers */
    case 'add-referrer': await editReferrer(null); return renderView();
    case 'del-ref': if (await confirmBox('Usunąć adresata?', 'Adresat zostanie usunięty z listy. Istniejące listy pozostaną.')) { await remove('referrers', a.dataset.id); renderView(); } return;
    /* settings */
    case 'sig-pick': { const el = $('#sig-input'); el.onchange = async () => { const f = el.files[0]; if (f) { settings().doctor.signature = await signatureData(f); save('settings', settings()); renderView(); } }; return el.click(); }
    case 'sig-clear': settings().doctor.signature = ''; save('settings', settings()); return renderView();
    case 'logo-pick': { const el = $('#logo-input'), k = a.dataset.k; el.onchange = async () => { const f = el.files[0]; if (f) { settings().doctor[k] = await logoData(f); if (k === 'logo') settings().doctor.logoDefault = false; save('settings', settings()); renderTop(); renderView(); } }; return el.click(); }
    case 'logo-clear': settings().doctor[a.dataset.k] = ''; if (a.dataset.k === 'logo') { settings().doctor.logoDefault = false; settings().doctor.logoCleared = true; } save('settings', settings()); renderTop(); return renderView();
    case 'test-key': { a.disabled = true; a.innerHTML = '<span class="spin"></span> Sprawdzanie…'; try { await testKey((settings().ai.key || '').trim()); toast('AI działa — połączenie z Claude, klucz i środki na koncie są w porządku.', 'ok'); } catch (er) { toast(er.message, 'err'); } a.disabled = false; a.textContent = 'Sprawdź AI'; return; }
    case 'pk-add': { try { await S.session.addPasskey(/iPhone|iPad/.test(navigator.userAgent) ? 'iPhone / iPad' : 'Klucz dostępu'); audit('security', 'dodano klucz dostępu'); toast('Dodano klucz dostępu.', 'ok'); scheduleBackup(); S.sync?.headerChanged().catch(() => {}); renderView(); } catch (er) { if (er.name !== 'NotAllowedError') toast(er.message, 'err'); } return; }
    case 'pk-del': if (await confirmBox('Usunąć klucz dostępu?', 'Logowanie tym kluczem przestanie działać. Hasło działa nadal.')) { audit('security', 'usunięto klucz dostępu'); await S.session.removePasskey(a.dataset.id); scheduleBackup(); S.sync?.headerChanged().catch(() => {}); renderView(); } return;
    case 'change-pw': return changePassword();
    case 'sample': return sampleLetter();
  }
}
function rerender(path) { if (path.startsWith('v.')) { renderView(); return; } if (path.startsWith('t.')) refreshWorkspace({ model: true }); else if (path.startsWith('s.')) renderView(); }
function setBound(path, value) {
  const [root, ...rest] = path.split('.'); const p = rest.join('.');
  if (root === 's') { setPath(settings(), p, value); save('settings', settings()); return; }
  if (root === 'L') { const L = D().letters.get(S.letterId); setPath(L.content, p, value); save('letters', L); return; }
  if (root === 't') {
    const t = curTooth(); if (!t) return;
    setPath(t, p, value); S.ws.dirty = true;
    if (p.startsWith('roots.') && value) t.anatOk = true;
    if (p === 'endo.proc' && ENDO[value]?.consult) t.endo.status = 'done';
    renderDx(); $('#ws-sum').textContent = toothSummary(t);
    if (p.startsWith('roots.') || p.startsWith('endo.status') || p.startsWith('endo.proc')) update3D();
    return;
  }
  const v = curVisit(); if (!v) return;
  setPath(v, p, value); save('visits', v);
}
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'search') { S.search = el.value; const pos = el.selectionStart; renderView(); const s = $('#search'); s.focus(); s.setSelectionRange(pos, pos); return; }
  if (el.dataset.noteText) { const L = D().letters.get(S.letterId); const n = L.notes.find((x) => x.id === el.dataset.noteText); if (n) { n.comment = el.value; save('letters', L); } return; }
  if (el.id === 'gen-text') { const L = D().letters.get(S.letterId); L.instruction = el.value; save('letters', L); const b = $('[data-act=revise]'); if (b) b.disabled = !(el.value.trim() || (L.notes || []).some((x) => x.comment)); return; }
  const lp = el.closest && el.closest('#paper [data-loc][contenteditable]');
  if (lp) { const L = D().letters.get(S.letterId); setPath(L.content, lp.dataset.loc, lp.innerText.replace(/\s+\n/g, '\n').trim()); save('letters', L); return; }
  if (el.dataset.b && el.type !== 'checkbox' && el.tagName !== 'SELECT') setBound(el.dataset.b, el.value);
});
document.addEventListener('mouseup', (e) => { if (e.target.closest && e.target.closest('#paper')) setTimeout(onPaperSelect, 10); });
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'xray') { S.xray = el.checked; if (S.t3d) S.t3d.setXray(el.checked); return; }
  if (el.id === 'flat2d') { try { localStorage.setItem('endolist:no3d', el.checked ? '1' : '0'); } catch {} if (S.t3d) { S.t3d.dispose(); S.t3d = null; } const st = $('#stage'); if (st) { st.innerHTML = ''; st.classList.remove('flat'); const xr = $('#xray')?.closest('label'); if (xr) xr.hidden = false; mount3D(); } return; }
  if (el.id === 'mat-cat') { S.matCat = el.value; return refreshWorkspace(); }
  if (el.id === 'manual-edit') { S.manualEdit = el.checked; return renderView(); }
  if (el.id === 'gen-edit') { const L = D().letters.get(S.letterId); L.genEdit = el.checked; save('letters', L); $('#gen-box').hidden = !el.checked; if (el.checked) $('#gen-text').focus(); return; }
  if (el.dataset.noteDone) { const L = D().letters.get(S.letterId); const n = L.notes.find((x) => x.id === el.dataset.noteDone); if (n) { n.done = el.checked; save('letters', L); rerenderLetter(); } return; }
  if (el.dataset.arr) { const arr = [...(val(el.dataset.arr) || [])]; const i = arr.indexOf(el.value); if (el.checked && i < 0) arr.push(el.value); if (!el.checked && i >= 0) arr.splice(i, 1); setBound(el.dataset.arr, arr); if (el.dataset.arr.startsWith('t.')) refreshWorkspace(); return; }
  if (el.dataset.b && el.type === 'checkbox') { setBound(el.dataset.b, el.checked); if (el.dataset.re) rerender(el.dataset.b); return; }
  if (el.dataset.b && el.tagName === 'SELECT') { setBound(el.dataset.b, el.value); if (el.dataset.re || el.dataset.b.startsWith('s.')) rerender(el.dataset.b); }
});

/* ================================================================ misc flows */
async function signatureData(file) {
  const url = URL.createObjectURL(file);
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 900 / Math.max(im.width, im.height)); const w = Math.round(im.width * k), h = Math.round(im.height * k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    // white paper → transparent, so the signature sits cleanly on the letter
    const d = x.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const l = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3; if (l > 215) d.data[i + 3] = 0; else if (l > 160) d.data[i + 3] = Math.round(((215 - l) / 55) * 255); }
    x.putImageData(d, 0, 0); return cv.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
/** Built-in Centrum Stomatologiczne logo (the clinic's own logo): navy for letters, light for the dark UI. */
const BRAND_LOGO = 'brand/centrum-logo.png', BRAND_LOGO_LIGHT = 'brand/centrum-logo-light.png';
async function brandLogoData() {
  try { const b = await (await fetch(BRAND_LOGO)).blob(); return await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); }); } catch { return ''; }
}
const isCentrum = (d) => /centrum stomatologiczne/i.test(d.practice || '');
async function logoData(file) {
  const url = URL.createObjectURL(file);
  try {
    const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const k = Math.min(1, 1000 / Math.max(im.width, im.height)); const cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
    cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); return cv.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}
async function reloadData() { const all = await S.session.loadAll(); for (const k of ['patients', 'visits', 'letters', 'referrers', 'settings', 'audit', 'keys']) if (all[k]) S.data[k] = all[k]; if (!S.data.settings.get('main')) S.data.settings.set('main', clone(DEFAULT_SETTINGS)); }
async function lockNow() {
  audit('lock');
  await Promise.race([(async () => { await flushSave.flush(); await S.sync?.now(); })(), new Promise((r) => setTimeout(r, 4000))]).catch(() => {});
  location.reload();
}
function changePassword() {
  modal({ title: 'Zmień hasło', body: `<div class="grid"><label class="f"><span>Obecne hasło</span><input type="password" id="pw0" autofocus></label><label class="f"><span>Nowe hasło (min. 12 znaków)</span><input type="password" id="pw1"></label><label class="f"><span>Powtórz nowe hasło</span><input type="password" id="pw2"></label></div>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' }, { label: 'Zmień hasło', cls: 'btn-primary', onClick: async (ov) => {
      const [a, b, c] = ['#pw0', '#pw1', '#pw2'].map((s) => $(s, ov).value);
      if (b.length < 12) { toast('Nowe hasło musi mieć co najmniej 12 znaków.', 'err'); return false; }
      if (b !== c) { toast('Hasła różnią się.', 'err'); return false; }
      try { await S.session.changePassword(a, b); audit('security', 'zmiana hasła'); toast('Hasło zmienione.', 'ok'); scheduleBackup(); S.sync?.headerChanged(b).catch(() => {}); } catch { toast('Obecne hasło jest nieprawidłowe.', 'err'); return false; }
    } }] });
}
function restoreFlow() {
  modal({ title: 'Przywróć z kopii zapasowej', body: `<p class="muted" style="margin-top:0">Wybierz folder EndoList (z podfolderem „Kopia zapasowa") albo plik kopii .json. Do odblokowania danych potrzebne będzie hasło konta.</p><input type="file" id="rf" accept=".json,application/json" hidden>`,
    buttons: [{ label: 'Anuluj', cls: 'btn-ghost' },
      { label: `${I('doc')} Plik .json`, onClick: () => { const el = $('#rf'); el.onchange = async () => { const f = el.files[0]; if (!f) return; try { const r = await V.importBackup(JSON.parse(await f.text())); localStorage.setItem('endolist:lastUser', r.username); toast(`Przywrócono konto „${r.username}" (${r.imported} rekordów). Zaloguj się hasłem.`, 'ok'); renderLock(await V.listProfiles()); document.querySelector('.overlay')?.remove(); } catch (er) { toast(er.message, 'err'); } }; el.click(); return false; } },
      ...(fsSupported() ? [{ label: `${I('folder')} Folder`, cls: 'btn-primary', onClick: async () => {
        try {
          const h = await window.showDirectoryPicker({ id: 'endolist', mode: 'readwrite', startIn: 'documents' });
          const d = await h.getDirectoryHandle('Kopia zapasowa (nie edytować)'); const f = await (await d.getFileHandle('endolist-dane.json')).getFile();
          const r = await V.importBackup(JSON.parse(await f.text()));
          await V.kv.set(`dir:${r.profileId}`, h); localStorage.setItem('endolist:lastUser', r.username);
          toast(`Przywrócono konto „${r.username}" (${r.imported} rekordów). Zaloguj się hasłem.`, 'ok'); renderLock(await V.listProfiles());
        } catch (er) { if (er.name !== 'AbortError') toast(er.name === 'NotFoundError' ? 'W tym folderze nie ma kopii EndoList.' : er.message, 'err'); return false; }
      } }] : [])] });
}
async function sampleLetter() {
  const st = settings();
  const roots = configRoots(anatomy(36).configs[1]); roots.forEach((r, i) => r.canals.forEach((c, j) => { c.wl = ['21', '21', '20,5', '21'][i * 2 + j]; }));
  const rec = newToothRec(36); rec.roots = roots; rec.config = 1;
  Object.assign(rec.dx.tests, { cold: 'nr', ept: 'neg', perc: 'pain', palp: 'wnl', bite: 'pain', probe: '3', mob: 'phys' }); rec.dx.radio = ['parl'];
  Object.assign(rec.endo, { proc: 'RCT', status: 'done', anesth: 'block', agent: '4% artykaina z adrenaliną 1:100 000', irrig: ['naocl', 'edta', 'us'], naocl: '5,25', obtur: 'cwt', sealer: 'uszczelniacz bioceramiczny', temp: 'cavit' });
  Object.assign(rec.rec, { restor: 'crown', time: '30d', control: '6-12m', prog: 'good' });
  const rec2 = newToothRec(37); rec2.work = [{ type: 'FILL', cls: 'II', surf: ['M', 'O', 'D'], mat: 'kompozyt' }];
  const visit = { date: today(), performer: 'self', teeth: [rec, rec2] };
  const patient = { first: 'Anna', last: 'Przykładowa', sex: 'f', dob: '1980-03-12' }, referrer = { kind: 'doctor', gender: 'f', title: 'lek. dent.', first: 'Maria', last: 'Nowak', clinic: 'Gabinet Stomatologiczny Uśmiech', address: 'ul. Kwiatowa 5\n50-100 Wrocław' };
  const content = buildOffline({ visits: [visit], patient, doctor: st.doctor, referrer, icd: st.letter.icd });
  const blob = await buildLetterPDF({ doctor: st.doctor, patient, referrer, content: { title: st.letter.title, salutation: salutation(referrer), signoff: st.letter.signoff, ...content }, glance: glance([visit]), dates: [visit.date], letterDate: today() });
  const url = URL.createObjectURL(blob);
  modal({ title: 'Przykładowy list', wide: true, body: `<iframe src="${url}#view=FitH" style="width:100%;height:70vh;border:0;border-radius:12px;background:#2a3242"></iframe>`, onClose: () => URL.revokeObjectURL(url) });
}

/* auto-lock */
['mousemove', 'keydown', 'mousedown', 'touchstart', 'wheel'].forEach((ev) => document.addEventListener(ev, () => { S.lastActive = Date.now(); }, { passive: true }));
setInterval(() => { if (S.session && Date.now() - S.lastActive > (+settings().security.autolock || 15) * 60000) lockNow(); }, 20000);
window.addEventListener('beforeunload', () => { flushSave.flush(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && S.session) { flushSave.flush(); scheduleBackup.flush(); } });

boot().catch((e) => { console.error(e); $('#root').innerHTML = `<div class="auth"><div class="auth-card"><h1>Błąd uruchomienia</h1><p class="lead">${esc(e.message)}</p><p class="hint">Upewnij się, że nie używasz trybu prywatnego / incognito.</p></div></div>`; });

// test hooks (used by the automated tests only)
window.__endolist = { S, save, settings, rerender: () => (S.view === 'letter' ? rerenderLetter() : renderView()), refreshClinic };

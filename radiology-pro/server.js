// Radiopis — hosted (SaaS) version of the radiology dictation app.
// Public: landing page, login / registration / password reset, Stripe webhook.
// Logged in: the dictation app (/app/), account page, AI endpoints (metered per user).
// Administrator: /admin — users, subscriptions, usage, AI costs, payments, plans, settings, audit log.
import './lib/env.js';
import http from 'node:http';
import crypto from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatWithClaude, ClaudeError, MODEL } from './lib/claude.js';
import { analyzeStyle, cleanLearnInput, cleanProfile, cleanTranslations } from './lib/learn.js';
import { getTemplate, cleanRaw, parseTemplate } from './public/js/templates.js';
import { scrubIdentifiers } from './public/js/polish-text.js';
import { openDb, closeDb, one, all, run, tx, audit, monthOf, getSetting, setSetting } from './lib/db.js';
import {
  COOKIE, parseCookies, sessionCookie, sessionUser, createSession, deleteSession, deleteUserSessions, userSessions,
  createUser, getUser, getUserByEmail, verifyPassword, passwordProblem, setPassword, publicUser, EMAIL_RE,
  loginBlocked, noteFailure, clearFailures, createOneTimeToken, useOneTimeToken, peekOneTimeToken, setTempPassword,
} from './lib/auth.js';
import { getOrg, listOrgs, seatsUsed, orgUsers, createOrg, updateOrg, tempPassword, parseUserList, ORG_STATUS } from './lib/orgs.js';
import { aiLimiter, BusyError } from './lib/limiter.js';
import { lastBackup, backupNow } from './lib/backup.js';
import { plans, planById, settings, access, quotaCheck, quotaOf, monthUsage, costUsd, DEFAULT_PLANS, DEFAULT_SETTINGS } from './lib/plans.js';
import { extendSubscription, stripeEnabled, createCheckout, createPortal, verifyStripeSignature, handleStripeEvent } from './lib/billing.js';
import { sendMail, adminEmail, mailConfigured } from './lib/mail.js';
import { runJobs, startJobs } from './lib/jobs.js';
import { BRAND } from './lib/brand.js';
import { aiConfigured, PROVIDER } from './lib/ai-client.js';

const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(APP_DIR, 'public');
const DIST = path.join(APP_DIR, 'dist');
const VERSION = JSON.parse(readFileSync(path.join(APP_DIR, 'package.json'), 'utf8')).version;
const PROD = process.env.NODE_ENV === 'production';
// In production the app is served from dist/ (bundled, minified and obfuscated by `npm run build`).
const APP_ROOT = () => (PROD && existsSync(path.join(DIST, 'app', 'index.html')) ? path.join(DIST, 'app') : PUBLIC);
const SITE_ROOT = () => (PROD && existsSync(path.join(DIST, 'site')) ? path.join(DIST, 'site') : path.join(PUBLIC, 'site'));
const MAX_BODY = 200 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};
// Same-origin JSON requests carry this header (a cross-site form or script cannot set it → CSRF protection).
const CSRF_HEADER = 'x-radiopis';
// Keys of the app's local storage that follow the user to every device: own templates, the style profile and
// everything learned from the radiologist's corrections (style pairs, conclusion changes, example reports, EN→PL
// pairs) — so the AI keeps learning on every workstation. PESEL numbers are removed before storing.
// Never synced: the current report and today's list of reports (they stay on the device).
export const SYNC_KEYS = ['radvox.templates.v1', 'radvox.profile.v1', 'radvox.style.v1', 'radvox.learned.v1'];
const SYNC_MAX = 1_500_000;

const aiAvailable = () => aiConfigured();

// ---------------------------------------------------------------- helpers
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=(), hid=(self)',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com",
};
function headers(extra = {}) {
  const h = { ...SECURITY_HEADERS, ...extra };
  if (PROD) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  return h;
}
function sendJson(res, status, data, extra = {}) {
  res.writeHead(status, headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }));
  res.end(JSON.stringify(data));
}
function redirect(res, to, extra = {}) {
  res.writeHead(302, headers({ Location: to, 'Cache-Control': 'no-store', ...extra }));
  res.end();
}
function readRaw(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new ClaudeError('Zbyt duże zapytanie.', 413));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
async function readJson(req, limit) {
  const raw = await readRaw(req, limit);
  try { return raw ? JSON.parse(raw) : {}; } catch { throw new ClaudeError('Nieprawidłowy JSON.', 400); }
}
// Behind the reverse proxy (Caddy) the real address is the LAST entry of X-Forwarded-For (the one the proxy added);
// earlier entries can be forged by the client. TRUST_PROXY=1 only when the app is reachable through the proxy alone.
const clientIp = (req) => (process.env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',').pop().trim() : '') || req.socket.remoteAddress || '';
const isSecure = (req) => PROD || req.headers['x-forwarded-proto'] === 'https';
function baseUrl(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  return `${isSecure(req) ? 'https' : 'http'}://${req.headers.host}`;
}
const str = (v, len = 200) => (typeof v === 'string' ? v.trim().slice(0, len) : '');

function currentUser(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  const s = sessionUser(token);
  return s ? { ...s, token } : null;
}

// ---------------------------------------------------------------- static files
async function serveFile(res, root, rel, { cache = 'no-cache', status = 200, req = null } = {}) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403, headers());
    return res.end('Forbidden');
  }
  if (!PROD || rel.endsWith('.html') || rel.endsWith('.js')) {
    // never serve source maps or internal notes
    if (/\.(map|md|mjs)$/i.test(file)) { res.writeHead(404, headers()); return res.end(); }
  }
  try {
    const st = await stat(file);
    if (!st.isFile()) throw new Error('not a file');
    const etag = `W/"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    if (req && req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers({ ETag: etag, 'Cache-Control': cache }));
      return res.end();
    }
    const data = await readFile(file);
    res.writeHead(status, headers({ 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': cache, ETag: etag }));
    res.end(req?.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, headers({ 'Content-Type': 'text/plain; charset=utf-8' }));
    res.end('Nie znaleziono');
  }
}
const sitePage = (res, name, req = null) => serveFile(res, SITE_ROOT(), `${name}.html`, { req });

// ---------------------------------------------------------------- AI usage metering
function recordUsage(user, { kind, reportId = '', model = '', usage = null, ms = 0, ok = true, lang = '' }) {
  const u = usage || {};
  run(`INSERT INTO usage(user_id, ts, month, kind, report_id, model, input_tokens, output_tokens, cache_write, cache_read, cost_usd, ms, ok, lang)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  user.id, Date.now(), monthOf(), kind, String(reportId).slice(0, 64), model || '', u.input_tokens || 0, u.output_tokens || 0,
  u.cache_creation_input_tokens || 0, u.cache_read_input_tokens || 0, usage ? costUsd(model, u) : 0, ms, ok ? 1 : 0, lang);
}

function validReport(report) {
  return report && typeof report === 'object' && ['header', 'body', 'conclusion'].every((k) => typeof report[k] === 'string')
    && report.header.length + report.body.length + report.conclusion.length < 60000;
}
export function cleanStyleExamples(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((x) => x && typeof x.ai === 'string' && typeof x.final === 'string' && x.ai.trim() && x.final.trim())
    .slice(-20).map((x) => ({ ai: x.ai.trim().slice(0, 600), final: x.final.trim().slice(0, 600) }));
}
const strList = (v, max, len) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).slice(-max).map((x) => x.trim().slice(0, len)) : []);
export function cleanLearned(l) {
  if (!l || typeof l !== 'object') return null;
  const out = {
    conclusion_removed: strList(l.conclusionRemoved, 30, 300),
    conclusion_added: strList(l.conclusionAdded, 20, 300),
    restored: strList(l.restored, 20, 400),
    example_reports: (Array.isArray(l.exampleReports) ? l.exampleReports : [])
      .filter((r) => r && typeof r.body === 'string' && typeof r.conclusion === 'string')
      .slice(-2).map((r) => ({ body: r.body.slice(0, 6000), conclusion: r.conclusion.slice(0, 2000) })),
  };
  return Object.values(out).some((v) => v.length) ? out : null;
}

/** AI errors for the browser. A bad server API key (401) is the operator's problem, not the user's login. */
function sendAiError(res, err) {
  if (err.status === 401) {
    console.error('AI: authentication failed — check the API key / AWS credentials');
    return sendJson(res, 503, { error: 'Usługa AI chwilowo niedostępna — administrator został powiadomiony.' });
  }
  if (err instanceof BusyError) return sendJson(res, err.status, { error: err.message, code: err.code }, { 'Retry-After': String(err.retryAfter) });
  if (err.status === 429) return sendJson(res, 429, { error: err.message, code: 'ai_rate' }, { 'Retry-After': '10' });
  return sendJson(res, err.status, { error: err.message });
}

/** Login + active subscription (+ optional quota) for the AI endpoints. Sends the error itself. */
function guardAi(res, ctx, reportId = null) {
  if (!ctx) { sendJson(res, 401, { error: 'Sesja wygasła — zaloguj się ponownie.', code: 'login' }); return null; }
  const a = access(ctx.user);
  if (!a.ok) { sendJson(res, 402, { error: a.reason, code: a.code }); return null; }
  if (!aiAvailable()) { sendJson(res, 503, { error: 'AI chwilowo niedostępne.', code: 'no_api_key' }); return null; }
  if (reportId !== null) {
    const q = quotaCheck(ctx.user, reportId);
    if (!q.ok) { sendJson(res, 402, { error: q.reason, code: q.code }); return null; }
    return q;
  }
  return { ok: true };
}

async function handleFormat(req, res, ctx) {
  const body = await readJson(req);
  const reportId = str(body.reportId, 64) || `r-${Date.now()}`;
  const q = guardAi(res, ctx, reportId);
  if (!q) return;
  if (body.background === true) {
    // cost guard: background pre-processing during dictation pauses is capped per report
    const n = one("SELECT COUNT(*) AS n FROM usage WHERE user_id = ? AND report_id = ? AND kind = 'format'", ctx.user.id, reportId).n;
    if (n >= settings().maxBackgroundCalls) return sendJson(res, 429, { error: 'Przetwarzanie w tle wstrzymane dla tego opisu — użyj „Przygotuj opis”.', code: 'bg_limit' });
  }
  const raw = body.template ? cleanRaw(body.template) : null;
  const template = raw ? parseTemplate(raw) : getTemplate(body.templateId);
  if (!template) return sendJson(res, 400, { error: 'Nieznany szablon.' });
  if (!validReport(body.report)) return sendJson(res, 400, { error: 'Nieprawidłowa struktura raportu.' });
  const dictation = String(body.dictation || '').slice(0, 20000);
  const instruction = String(body.instruction || '').slice(0, 2000);
  const translate = body.translate === true;
  if (!translate && !dictation.trim() && !instruction.trim()) return sendJson(res, 400, { error: 'Brak dyktowanego tekstu.' });
  const lang = (v) => (v === 'en' ? 'en' : 'pl');
  const started = Date.now();
  const langTag = `${lang(body.inputLang)}>${lang(body.outputLang)}`;
  try {
    const result = await aiLimiter.run(ctx.user.id, () => formatWithClaude({
      template, report: body.report, dictation, instruction,
      style: String(body.style || '').slice(0, 4000),
      styleExamples: cleanStyleExamples(body.styleExamples),
      learned: cleanLearned(body.learned),
      keep: strList(body.keep, 40, 600),
      clinical: String(body.clinical || '').slice(0, 2000),
      profile: cleanProfile(body.profile),
      samples: strList(body.samples, 6, 3000),
      translations: cleanTranslations(body.translations, 6),
      inputLang: lang(body.inputLang), outputLang: lang(body.outputLang), translate,
      mode: ['fast', 'accurate', 'turbo'].includes(body.mode) ? body.mode : 'fast',
    }), { background: body.background === true });
    const { usage, ...out } = result;
    recordUsage(ctx.user, { kind: 'format', reportId, model: result.model, usage, ms: Date.now() - started, lang: langTag });
    sendJson(res, 200, { ...out, quota: { used: q.used ?? null, limit: q.quota ?? null, warn: Boolean(q.warn) } });
  } catch (err) {
    if (err instanceof BusyError) return sendAiError(res, err); // refused before calling the AI: nothing to meter
    recordUsage(ctx.user, { kind: 'format', reportId: '', ms: Date.now() - started, ok: false, lang: langTag });
    if (err instanceof ClaudeError) return sendAiError(res, err);
    console.error(err);
    sendJson(res, 500, { error: 'Błąd serwera.' });
  }
}

async function handleLearn(req, res, ctx) {
  const body = await readJson(req);
  if (!guardAi(res, ctx)) return;
  const input = cleanLearnInput(body);
  const evidence = input.samples.length + input.edits.length + input.conclusion_removed.length + input.conclusion_added.length + input.answers.length + input.translations.length + input.glossary_current.length;
  if (!evidence) return sendJson(res, 400, { error: 'Brak materiału do nauki — dodaj przykłady swoich opisów.' });
  // style analysis is heavier: at most 20 per user per month
  const learns = one("SELECT COUNT(*) AS n FROM usage WHERE user_id = ? AND month = ? AND kind = 'learn' AND ok = 1", ctx.user.id, monthOf()).n;
  if (ctx.user.role !== 'admin' && learns >= 20) return sendJson(res, 429, { error: 'Limit analiz stylu w tym miesiącu (20) został wykorzystany.' });
  const started = Date.now();
  try {
    const { usage, model, ...out } = await aiLimiter.run(ctx.user.id, () => analyzeStyle(input));
    recordUsage(ctx.user, { kind: 'learn', model, usage, ms: Date.now() - started });
    sendJson(res, 200, out);
  } catch (err) {
    if (err instanceof BusyError) return sendAiError(res, err);
    recordUsage(ctx.user, { kind: 'learn', ms: Date.now() - started, ok: false });
    if (err instanceof ClaudeError) return sendAiError(res, err);
    console.error(err);
    sendJson(res, 500, { error: 'Błąd serwera.' });
  }
}

// ---------------------------------------------------------------- accounts
function bankDetails() {
  const b = settings();
  return b.bankAccount ? { account: b.bankAccount, name: b.bankName || BRAND.company || BRAND.name, title: `${BRAND.name} — {email}` } : null;
}

/** Where to go after logging in. */
function homeFor(user) {
  if (user.must_change_pwd) return '/change-password';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'orgadmin') return '/it';
  return access(user).ok ? '/app/' : '/account';
}

function mePayload(ctx) {
  const u = ctx.user;
  const p = planById(u.plan);
  const used = monthUsage(u.id);
  const org = getOrg(u.org_id);
  return {
    user: publicUser(u),
    org: org ? { name: org.name, status: org.status, subUntil: org.sub_until, contact: org.contact, devices: org.devices } : null,
    plan: org ? { id: 'org', name: `Licencja: ${org.name}`, pricePln: 0, quota: quotaOf(u), devices: org.devices } : { id: p.id, name: p.name, pricePln: p.pricePln, quota: quotaOf(u), devices: p.devices },
    usage: { month: monthOf(), reports: used.reports },
    access: access(u),
    sessions: userSessions(u.id).map((s) => ({ ...s, current: s.id === ctx.sessionId, id: undefined })),
    payments: all('SELECT ts, amount_pln, provider, plan, period_until FROM payments WHERE user_id = ? ORDER BY ts DESC LIMIT 24', u.id),
    plans: plans().filter((x) => x.public).map(({ stripePrice, stripePriceYear, ...x }) => ({ ...x, online: Boolean(stripeEnabled() && stripePrice), onlineYear: Boolean(stripeEnabled() && stripePriceYear) })),
    annualMonths: settings().annualMonths,
    bank: bankDetails(),
    brand: BRAND,
  };
}

async function handleAuth(req, res, route) {
  const body = await readJson(req, 20_000);
  const ip = clientIp(req);
  const ua = String(req.headers['user-agent'] || '');
  const secure = isSecure(req);

  if (route === 'login') {
    const email = str(body.email, 254).toLowerCase();
    if (loginBlocked(email, ip)) return sendJson(res, 429, { error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.' });
    const user = getUserByEmail(email);
    if (!user || !(await verifyPassword(String(body.password || ''), user.pwd))) {
      noteFailure(email, ip);
      return sendJson(res, 401, { error: 'Nieprawidłowy e-mail lub hasło.' });
    }
    if (user.blocked) return sendJson(res, 403, { error: 'Konto zablokowane — skontaktuj się z administratorem.' });
    clearFailures(email);
    const token = createSession(user, { ip, ua });
    audit(user.id, 'login', user.id, ip);
    return sendJson(res, 200, { ok: true, next: homeFor(user) }, { 'Set-Cookie': sessionCookie(token, { secure }) });
  }

  if (route === 'register') {
    if (!settings().registrationOpen) return sendJson(res, 403, { error: 'Rejestracja jest chwilowo zamknięta.' });
    const email = str(body.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Podaj prawidłowy adres e-mail.' });
    const problem = passwordProblem(body.password);
    if (problem) return sendJson(res, 400, { error: problem });
    if (!str(body.name)) return sendJson(res, 400, { error: 'Podaj imię i nazwisko.' });
    if (body.accept !== true) return sendJson(res, 400, { error: 'Zaakceptuj regulamin i politykę prywatności.' });
    if (loginBlocked(email, ip)) return sendJson(res, 429, { error: 'Zbyt wiele prób. Spróbuj później.' });
    if (getUserByEmail(email)) { noteFailure(email, ip); return sendJson(res, 409, { error: 'Konto z tym adresem już istnieje — zaloguj się.' }); }
    const user = await createUser({ email, password: body.password, name: body.name, npwz: str(body.npwz, 20), phone: str(body.phone, 30) });
    const token = createSession(user, { ip, ua });
    await sendMail(user.email, `Witamy w ${BRAND.name}`, `Dzień dobry,\n\ndziękujemy za rejestrację. Okres próbny trwa ${settings().trialDays} dni.\nAplikacja: ${baseUrl(req)}/app/\nKonto i subskrypcja: ${baseUrl(req)}/account`);
    if (adminEmail()) await sendMail(adminEmail(), `${BRAND.name}: nowy użytkownik — ${user.email}`, `${user.name} <${user.email}>, NPWZ: ${user.npwz || '—'}, tel.: ${user.phone || '—'}`);
    return sendJson(res, 200, { ok: true, next: '/app/' }, { 'Set-Cookie': sessionCookie(token, { secure }) });
  }

  if (route === 'logout') {
    const ctx = currentUser(req);
    if (ctx) deleteSession(ctx.token);
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', { secure, clear: true }) });
  }

  if (route === 'forgot') {
    const email = str(body.email, 254).toLowerCase();
    const user = getUserByEmail(email);
    if (user && !loginBlocked(email, ip)) {
      noteFailure(email, ip); // also limits how many reset e-mails can be requested
      const t = createOneTimeToken(user.id, 'reset', 2);
      await sendMail(user.email, `${BRAND.name}: ustaw nowe hasło`, `Dzień dobry,\n\naby ustawić nowe hasło, otwórz link (ważny 2 godziny):\n${baseUrl(req)}/reset?token=${t}\n\nJeśli to nie Ty prosisz o zmianę hasła, zignoruj tę wiadomość.`);
    }
    return sendJson(res, 200, { ok: true }); // same answer whether the account exists or not
  }

  if (route === 'reset-check') {
    const u = peekOneTimeToken(body.token, 'reset') || peekOneTimeToken(body.token, 'invite');
    return sendJson(res, u ? 200 : 400, u ? { ok: true, email: u.email } : { error: 'Link wygasł lub jest nieprawidłowy.' });
  }

  if (route === 'reset') {
    const problem = passwordProblem(body.password);
    if (problem) return sendJson(res, 400, { error: problem });
    const user = useOneTimeToken(body.token, 'reset') || useOneTimeToken(body.token, 'invite');
    if (!user) return sendJson(res, 400, { error: 'Link wygasł lub jest nieprawidłowy.' });
    await setPassword(user.id, body.password);
    deleteUserSessions(user.id);
    audit(user.id, 'password.reset', user.id);
    const token = createSession(user, { ip, ua });
    return sendJson(res, 200, { ok: true, next: homeFor(getUser(user.id)) }, { 'Set-Cookie': sessionCookie(token, { secure }) });
  }
  return sendJson(res, 404, { error: 'Nie znaleziono.' });
}

async function handleMe(req, res, ctx, route) {
  if (!ctx) return sendJson(res, 401, { error: 'Zaloguj się.', code: 'login' });
  if (route === '' && req.method === 'GET') return sendJson(res, 200, mePayload(ctx));
  const body = await readJson(req, 20_000);
  const u = ctx.user;
  if (route === 'update') {
    run('UPDATE users SET name = ?, npwz = ?, company = ?, nip = ?, phone = ? WHERE id = ?',
      str(body.name, 120) || u.name, str(body.npwz, 20), str(body.company, 200), String(body.nip || '').replace(/[^\d]/g, '').slice(0, 10), str(body.phone, 30), u.id);
    return sendJson(res, 200, mePayload({ ...ctx, user: getUser(u.id) }));
  }
  if (route === 'password') {
    if (!(await verifyPassword(String(body.current || ''), u.pwd))) return sendJson(res, 400, { error: 'Obecne hasło jest nieprawidłowe.' });
    const problem = passwordProblem(body.next);
    if (problem) return sendJson(res, 400, { error: problem });
    await setPassword(u.id, body.next);
    deleteUserSessions(u.id, ctx.sessionId);
    audit(u.id, 'password.change', u.id);
    return sendJson(res, 200, { ok: true });
  }
  if (route === 'first-password') {
    // first login with a temporary password from the IT administrator: choose an own password
    if (!u.must_change_pwd) return sendJson(res, 400, { error: 'Hasło jest już ustawione — zmień je na stronie konta.' });
    const problem = passwordProblem(body.next);
    if (problem) return sendJson(res, 400, { error: problem });
    if (await verifyPassword(String(body.next), u.pwd)) return sendJson(res, 400, { error: 'Nowe hasło musi być inne niż tymczasowe.' });
    await setPassword(u.id, body.next);
    deleteUserSessions(u.id, ctx.sessionId);
    audit(u.id, 'password.first', u.id);
    return sendJson(res, 200, { ok: true, next: homeFor(getUser(u.id)) });
  }
  if (route === 'logout-others') {
    deleteUserSessions(u.id, ctx.sessionId);
    return sendJson(res, 200, { ok: true });
  }
  if ((route === 'checkout' || route === 'portal') && u.org_id) return sendJson(res, 400, { error: 'Licencję opłaca Twoja organizacja — skontaktuj się z działem IT.' });
  if (route === 'checkout') {
    try {
      return sendJson(res, 200, { url: await createCheckout(u, str(body.plan, 40), body.interval === 'year' ? 'year' : 'month', baseUrl(req)) });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }
  if (route === 'portal') {
    try { return sendJson(res, 200, { url: await createPortal(u, baseUrl(req)) }); } catch (err) { return sendJson(res, 400, { error: err.message }); }
  }
  return sendJson(res, 404, { error: 'Nie znaleziono.' });
}

async function handleSync(req, res, ctx, key) {
  if (!ctx) return sendJson(res, 401, { error: 'Zaloguj się.', code: 'login' });
  if (req.method === 'GET' && !key) {
    const rows = all('SELECT key, value, updated_at FROM user_data WHERE user_id = ?', ctx.user.id);
    return sendJson(res, 200, Object.fromEntries(rows.map((r) => [r.key, { value: r.value, at: r.updated_at }])));
  }
  if (!SYNC_KEYS.includes(key)) return sendJson(res, 400, { error: 'Nieznany klucz.' });
  if (req.method === 'PUT') {
    const raw = await readRaw(req, SYNC_MAX + 1000);
    let value;
    try { value = JSON.parse(raw).value; } catch { return sendJson(res, 400, { error: 'Nieprawidłowy JSON.' }); }
    if (typeof value !== 'string' || value.length > SYNC_MAX) return sendJson(res, 413, { error: 'Za dużo danych.' });
    value = scrubIdentifiers(value);
    run('INSERT INTO user_data(user_id, key, value, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', ctx.user.id, key, value, Date.now());
    return sendJson(res, 200, { ok: true });
  }
  if (req.method === 'DELETE') {
    run('DELETE FROM user_data WHERE user_id = ? AND key = ?', ctx.user.id, key);
    return sendJson(res, 200, { ok: true });
  }
  return sendJson(res, 405, { error: 'Metoda niedozwolona.' });
}

// ---------------------------------------------------------------- administrator
const usdPln = () => settings().usdPln;

function adminUserRow(u, month = monthOf()) {
  const used = monthUsage(u.id, month);
  const p = planById(u.plan);
  const org = getOrg(u.org_id);
  return {
    id: u.id, email: u.email, name: u.name, role: u.role, blocked: Boolean(u.blocked), plan: u.plan, planName: org ? org.name : p.name,
    subStatus: org ? 'org' : u.sub_status, subUntil: org ? org.sub_until : u.sub_until, quota: quotaOf(u), quotaOverride: u.quota_override,
    orgId: org?.id || null, orgName: org?.name || '', mustChangePwd: Boolean(u.must_change_pwd),
    reports: used.reports, calls: used.calls, costUsd: used.costUsd, costPln: used.costUsd * usdPln(), pricePln: org ? org.price_per_seat : p.pricePln,
    lastLogin: u.last_login, createdAt: u.created_at, npwz: u.npwz, company: u.company, nip: u.nip, phone: u.phone, note: u.note,
    stripe: Boolean(u.stripe_sub), access: access(u).ok,
  };
}

function serverHealth() {
  const mem = process.memoryUsage();
  return {
    uptimeS: Math.round(process.uptime()), rssMb: Math.round(mem.rss / 1048576), heapMb: Math.round(mem.heapUsed / 1048576),
    sessions: one('SELECT COUNT(*) AS n FROM sessions WHERE last_seen > ?', Date.now() - 15 * 60_000).n,
    ai: aiLimiter.snapshot(), backup: lastBackup(), node: process.version,
  };
}

function overview() {
  const now = Date.now();
  const month = monthOf();
  const users = all("SELECT * FROM users WHERE role <> 'admin' AND org_id IS NULL");
  const activePaid = users.filter((u) => u.sub_status === 'active' && u.sub_until > now && !u.blocked);
  const trials = users.filter((u) => u.sub_status === 'trial' && u.sub_until > now);
  const orgs = orgRows(month);
  const orgMrr = orgs.reduce((s, o) => s + o.revenuePln, 0);
  const mrr = activePaid.reduce((s, u) => s + (planById(u.plan).pricePln || 0), 0) + orgMrr;
  const m = one("SELECT COUNT(DISTINCT CASE WHEN kind='format' AND ok=1 AND report_id<>'' THEN user_id || ':' || report_id END) AS reports, COUNT(*) AS calls, COALESCE(SUM(cost_usd),0) AS cost, SUM(CASE WHEN ok=0 THEN 1 ELSE 0 END) AS errors, COALESCE(AVG(CASE WHEN ok=1 AND kind='format' THEN ms END),0) AS avgMs FROM usage WHERE month = ?", month);
  const paidThisMonth = one('SELECT COALESCE(SUM(amount_pln),0) AS s FROM payments WHERE ts >= ?', Date.parse(`${month}-01T00:00:00Z`)).s;
  const costPln = m.cost * usdPln();
  const byLang = all("SELECT lang, COUNT(*) AS calls FROM usage WHERE month = ? AND kind='format' GROUP BY lang ORDER BY calls DESC", month);
  const expiring = users.filter((u) => u.sub_until > now && u.sub_until - now < 7 * 86400000 && !(u.stripe_sub && u.sub_status === 'active'))
    .sort((a, b) => a.sub_until - b.sub_until).map((u) => adminUserRow(u, month));
  const pastDue = users.filter((u) => u.sub_status === 'past_due').map((u) => adminUserRow(u, month));
  const topCost = all('SELECT user_id, SUM(cost_usd) AS c FROM usage WHERE month = ? GROUP BY user_id ORDER BY c DESC LIMIT 5', month)
    .map((r) => adminUserRow(getUser(r.user_id), month));
  // daily series for the last 30 days
  const since = now - 30 * 86400000;
  const daily = all(`SELECT strftime('%Y-%m-%d', ts / 1000, 'unixepoch') AS day,
      COUNT(DISTINCT CASE WHEN kind='format' AND ok=1 AND report_id<>'' THEN user_id || ':' || report_id END) AS reports,
      COALESCE(SUM(cost_usd),0) AS cost FROM usage WHERE ts >= ? GROUP BY day ORDER BY day`, since);
  return {
    month, usdPln: usdPln(),
    users: { total: users.length, paid: activePaid.length, trial: trials.length, expired: users.filter((u) => u.sub_status === 'expired').length, blocked: users.filter((u) => u.blocked).length },
    mrrPln: mrr, paidThisMonthPln: paidThisMonth,
    ai: { reports: m.reports, calls: m.calls, costUsd: m.cost, costPln, errors: m.errors || 0, avgMs: Math.round(m.avgMs || 0), costPerReportPln: m.reports ? costPln / m.reports : 0, callsPerReport: m.reports ? m.calls / m.reports : 0 },
    marginPln: mrr - costPln,
    orgs: { count: orgs.length, seats: orgs.reduce((s, o) => s + o.seats, 0), seatsUsed: orgs.reduce((s, o) => s + o.seatsUsed, 0), mrrPln: orgMrr,
      expiring: orgs.filter((o) => o.subUntil > now && o.subUntil - now < 7 * 86400000) },
    byLang, expiring, pastDue, topCost, daily,
    server: serverHealth(),
    config: { ai: aiAvailable(), model: MODEL, provider: PROVIDER, stripe: stripeEnabled(), stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET), mail: mailConfigured(), adminEmail: adminEmail(), version: VERSION, prod: PROD },
  };
}

function csv(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const cell = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    // formula injection guard for spreadsheets
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",;\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return `﻿${cols.join(';')}\n${rows.map((r) => cols.map((c) => cell(r[c])).join(';')).join('\n')}\n`;
}
const iso = (ms) => (ms ? new Date(ms).toISOString().slice(0, 19).replace('T', ' ') : '');

async function handleAdmin(req, res, ctx, parts) {
  if (!ctx) return sendJson(res, 401, { error: 'Zaloguj się.', code: 'login' });
  if (ctx.user.role !== 'admin') return sendJson(res, 403, { error: 'Brak uprawnień.' });
  const me = ctx.user.id;
  const [section, idStr, action] = parts;
  const url = new URL(req.url, 'http://x');
  const method = req.method;

  if (section === 'overview' && method === 'GET') return sendJson(res, 200, overview());
  if (section === 'orgs') return handleAdminOrgs(req, res, me, idStr, action);
  if (section === 'backup' && method === 'POST') {
    try { return sendJson(res, 200, await backupNow()); } catch (err) { return sendJson(res, 500, { error: `Kopia nie powiodła się: ${err.message}` }); }
  }

  if (section === 'users' && !idStr && method === 'GET') {
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const filter = url.searchParams.get('filter') || 'all';
    const month = url.searchParams.get('month') || monthOf();
    const now = Date.now();
    let users = all('SELECT * FROM users ORDER BY created_at DESC');
    if (q) users = users.filter((u) => `${u.email} ${u.name} ${u.npwz} ${u.company} ${u.nip}`.toLowerCase().includes(q));
    const f = {
      active: (u) => u.sub_status === 'active' && u.sub_until > now,
      trial: (u) => u.sub_status === 'trial' && u.sub_until > now,
      expiring: (u) => u.sub_until > now && u.sub_until - now < 7 * 86400000,
      expired: (u) => u.sub_until <= now || u.sub_status === 'expired',
      past_due: (u) => u.sub_status === 'past_due',
      blocked: (u) => u.blocked,
      admins: (u) => u.role === 'admin',
      orgadmins: (u) => u.role === 'orgadmin',
      org: (u) => Boolean(u.org_id),
    }[filter];
    if (f) users = users.filter(f);
    return sendJson(res, 200, { users: users.map((u) => adminUserRow(u, month)), month });
  }

  if (section === 'users' && !idStr && method === 'POST') {
    const body = await readJson(req, 20_000);
    const email = str(body.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) return sendJson(res, 400, { error: 'Nieprawidłowy e-mail.' });
    if (getUserByEmail(email)) return sendJson(res, 409, { error: 'Taki użytkownik już istnieje.' });
    const tempPassword = `${crypto.randomUUID()}A1`;
    const plan = plans().some((p) => p.id === body.plan) ? body.plan : 'trial';
    let user = await createUser({ email, password: tempPassword, name: str(body.name, 120), role: body.role === 'admin' ? 'admin' : 'user', plan: plan === 'trial' ? 'trial' : plan, npwz: str(body.npwz, 20), company: str(body.company, 200), nip: str(body.nip, 20), phone: str(body.phone, 30) }, me);
    if (plan !== 'trial') user = extendSubscription(user.id, { plan, interval: body.interval === 'year' ? 'year' : 'month', count: Number(body.count) || 1, amountPln: Number(body.amountPln) || 0, provider: 'manual', note: 'utworzono przez administratora' }, me);
    const t = createOneTimeToken(user.id, 'invite', 24 * 7);
    const link = `${baseUrl(req)}/reset?token=${t}`;
    if (body.sendEmail !== false) await sendMail(user.email, `Zaproszenie do ${BRAND.name}`, `Dzień dobry,\n\nzałożyliśmy dla Ciebie konto w ${BRAND.name}. Ustaw hasło (link ważny 7 dni):\n${link}`);
    return sendJson(res, 200, { user: adminUserRow(user), link });
  }

  if (section === 'users' && idStr) {
    const u = getUser(Number(idStr));
    if (!u) return sendJson(res, 404, { error: 'Nie ma takiego użytkownika.' });
    if (!action && method === 'GET') {
      const months = all("SELECT month, COUNT(DISTINCT CASE WHEN kind='format' AND ok=1 AND report_id<>'' THEN report_id END) AS reports, COUNT(*) AS calls, COALESCE(SUM(cost_usd),0) AS cost, SUM(input_tokens) AS input, SUM(output_tokens) AS output, SUM(cache_read) AS cacheRead, SUM(cache_write) AS cacheWrite FROM usage WHERE user_id = ? GROUP BY month ORDER BY month DESC LIMIT 12", u.id);
      return sendJson(res, 200, {
        user: adminUserRow(u),
        months: months.map((m) => ({ ...m, costPln: m.cost * usdPln() })),
        byLang: all("SELECT lang, COUNT(*) AS calls FROM usage WHERE user_id = ? AND kind='format' GROUP BY lang", u.id),
        payments: all('SELECT * FROM payments WHERE user_id = ? ORDER BY ts DESC', u.id),
        sessions: userSessions(u.id).map(({ id, ...s }) => s),
        audit: all('SELECT a.*, x.email AS actor FROM audit a LEFT JOIN users x ON x.id = a.actor_id WHERE a.target_id = ? ORDER BY a.ts DESC LIMIT 100', u.id),
      });
    }
    if (!action && method === 'PATCH') {
      const b = await readJson(req, 20_000);
      const changes = [];
      const set = (col, val, label) => { run(`UPDATE users SET ${col} = ? WHERE id = ?`, val, u.id); changes.push(label); };
      if (typeof b.name === 'string') set('name', str(b.name, 120), 'nazwa');
      if (typeof b.email === 'string') {
        const e = str(b.email, 254).toLowerCase();
        if (!EMAIL_RE.test(e)) return sendJson(res, 400, { error: 'Nieprawidłowy e-mail.' });
        const other = getUserByEmail(e);
        if (other && other.id !== u.id) return sendJson(res, 409, { error: 'Ten e-mail jest już używany.' });
        set('email', e, `e-mail ${e}`);
      }
      if (typeof b.plan === 'string' && plans().some((p) => p.id === b.plan)) set('plan', b.plan, `plan ${b.plan}`);
      if (typeof b.blocked === 'boolean') { set('blocked', b.blocked ? 1 : 0, b.blocked ? 'zablokowano' : 'odblokowano'); if (b.blocked) deleteUserSessions(u.id); }
      if ('quotaOverride' in b) set('quota_override', b.quotaOverride === null || b.quotaOverride === '' ? null : Math.max(0, Number(b.quotaOverride) || 0), `limit ${b.quotaOverride ?? 'z planu'}`);
      if (typeof b.note === 'string') set('note', b.note.slice(0, 2000), 'notatka');
      if (typeof b.subUntil === 'number') set('sub_until', b.subUntil, `dostęp do ${iso(b.subUntil).slice(0, 10)}`);
      if (['trial', 'active', 'past_due', 'canceled', 'expired'].includes(b.subStatus)) set('sub_status', b.subStatus, `status ${b.subStatus}`);
      if ('orgId' in b) {
        const orgId = b.orgId ? Number(b.orgId) : null;
        if (orgId && !getOrg(orgId)) return sendJson(res, 400, { error: 'Nie ma takiej organizacji.' });
        if (orgId !== (u.org_id || null)) {
          set('org_id', orgId, orgId ? `organizacja ${orgId}` : 'bez organizacji');
          if (orgId) { set('plan', 'org', 'plan organizacji'); set('sub_status', 'org', 'status org'); }
          else { set('plan', 'trial', 'plan trial'); set('sub_status', 'expired', 'status expired'); if (u.role === 'orgadmin') set('role', 'user', 'rola user'); }
        }
      }
      if (['admin', 'user', 'orgadmin'].includes(b.role) && b.role !== u.role) {
        if (u.id === me && b.role !== 'admin') return sendJson(res, 400, { error: 'Nie możesz odebrać sobie uprawnień administratora.' });
        if (b.role === 'orgadmin' && !getUser(u.id).org_id) return sendJson(res, 400, { error: 'Administrator IT musi należeć do organizacji.' });
        set('role', b.role, `rola ${b.role}`);
      }
      for (const k of ['npwz', 'company', 'nip', 'phone']) if (typeof b[k] === 'string') set(k, str(b[k], 200), k);
      audit(me, 'user.update', u.id, changes.join(', '));
      return sendJson(res, 200, { user: adminUserRow(getUser(u.id)) });
    }
    if (action === 'extend' && method === 'POST') {
      const b = await readJson(req, 20_000);
      const updated = extendSubscription(u.id, {
        plan: plans().some((p) => p.id === b.plan) ? b.plan : u.plan,
        interval: b.interval === 'year' ? 'year' : 'month', count: Math.min(36, Math.max(1, Number(b.count) || 1)),
        until: typeof b.until === 'number' ? b.until : null,
        amountPln: b.amountPln === '' || b.amountPln === undefined ? null : Number(b.amountPln),
        provider: ['transfer', 'manual', 'stripe', 'free'].includes(b.provider) ? b.provider : 'manual', ref: str(b.ref, 120), note: str(b.note, 500),
      }, me);
      return sendJson(res, 200, { user: adminUserRow(updated) });
    }
    if (action === 'reset-link' && method === 'POST') {
      const t = createOneTimeToken(u.id, 'reset', 24);
      const link = `${baseUrl(req)}/reset?token=${t}`;
      audit(me, 'user.reset_link', u.id);
      return sendJson(res, 200, { link });
    }
    if (action === 'logout' && method === 'POST') {
      deleteUserSessions(u.id);
      audit(me, 'user.logout_all', u.id);
      return sendJson(res, 200, { ok: true });
    }
    if (!action && method === 'DELETE') {
      if (u.id === me) return sendJson(res, 400, { error: 'Nie możesz usunąć własnego konta.' });
      run('DELETE FROM users WHERE id = ?', u.id);
      audit(me, 'user.delete', u.id, u.email);
      return sendJson(res, 200, { ok: true });
    }
  }

  if (section === 'plans') {
    if (method === 'GET') return sendJson(res, 200, { plans: plans(), defaults: DEFAULT_PLANS });
    if (method === 'PUT') {
      const b = await readJson(req, 50_000);
      if (!Array.isArray(b.plans) || !b.plans.length) return sendJson(res, 400, { error: 'Brak planów.' });
      const clean = b.plans.map((p) => ({
        id: str(p.id, 30).toLowerCase().replace(/[^a-z0-9_-]/g, ''), name: str(p.name, 60), pricePln: Math.max(0, Number(p.pricePln) || 0),
        quota: Math.max(0, Math.round(Number(p.quota) || 0)), devices: Math.min(10, Math.max(1, Math.round(Number(p.devices) || 1))),
        public: Boolean(p.public), featured: Boolean(p.featured), stripePrice: str(p.stripePrice, 80), stripePriceYear: str(p.stripePriceYear, 80),
        ...(p.id === 'trial' ? { days: Math.max(1, Number(p.days) || 14), public: false } : {}),
      })).filter((p) => p.id && p.name);
      if (!clean.some((p) => p.id === 'trial')) return sendJson(res, 400, { error: 'Plan „trial” (okres próbny) musi istnieć.' });
      if (new Set(clean.map((p) => p.id)).size !== clean.length) return sendJson(res, 400, { error: 'Identyfikatory planów muszą być unikalne.' });
      setSetting('plans', clean);
      audit(me, 'plans.update', null, clean.map((p) => `${p.id}:${p.pricePln}/${p.quota}`).join(' '));
      return sendJson(res, 200, { plans: clean });
    }
  }

  if (section === 'settings') {
    if (method === 'GET') return sendJson(res, 200, { settings: settings(), defaults: DEFAULT_SETTINGS });
    if (method === 'PUT') {
      const b = await readJson(req, 20_000);
      const cur = settings();
      const num = (v, d, min, max) => (Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Number(v))) : d);
      const next = {
        usdPln: num(b.usdPln, cur.usdPln, 1, 20), trialDays: Math.round(num(b.trialDays, cur.trialDays, 0, 90)),
        registrationOpen: typeof b.registrationOpen === 'boolean' ? b.registrationOpen : cur.registrationOpen,
        graceRatio: num(b.graceRatio, cur.graceRatio, 0, 1), costAlertRatio: num(b.costAlertRatio, cur.costAlertRatio, 0.05, 5),
        graceDaysPastDue: Math.round(num(b.graceDaysPastDue, cur.graceDaysPastDue, 0, 30)), annualMonths: num(b.annualMonths, cur.annualMonths, 1, 12),
        maxBackgroundCalls: Math.round(num(b.maxBackgroundCalls, cur.maxBackgroundCalls, 0, 20)),
        bankAccount: typeof b.bankAccount === 'string' ? str(b.bankAccount, 60) : cur.bankAccount || '',
        bankName: typeof b.bankName === 'string' ? str(b.bankName, 120) : cur.bankName || '',
        announcement: typeof b.announcement === 'string' ? str(b.announcement, 300) : cur.announcement || '',
      };
      setSetting('appSettings', next);
      audit(me, 'settings.update', null, JSON.stringify(next));
      return sendJson(res, 200, { settings: settings() });
    }
  }

  if (section === 'usage' && method === 'GET') {
    const month = url.searchParams.get('month') || monthOf();
    const perUser = all(`SELECT u.id, u.email, u.name, u.plan, COUNT(DISTINCT CASE WHEN g.kind='format' AND g.ok=1 AND g.report_id<>'' THEN g.report_id END) AS reports,
        COUNT(*) AS calls, SUM(g.input_tokens) AS input, SUM(g.output_tokens) AS output, SUM(g.cache_read) AS cacheRead, SUM(g.cache_write) AS cacheWrite,
        COALESCE(SUM(g.cost_usd),0) AS costUsd, SUM(CASE WHEN g.ok=0 THEN 1 ELSE 0 END) AS errors
        FROM usage g JOIN users u ON u.id = g.user_id WHERE g.month = ? GROUP BY u.id ORDER BY costUsd DESC`, month)
      .map((r) => ({ ...r, costPln: r.costUsd * usdPln(), pricePln: planById(r.plan).pricePln, costPerReportPln: r.reports ? (r.costUsd * usdPln()) / r.reports : 0 }));
    const months = all("SELECT month, COUNT(DISTINCT CASE WHEN kind='format' AND ok=1 AND report_id<>'' THEN user_id || ':' || report_id END) AS reports, COUNT(*) AS calls, COALESCE(SUM(cost_usd),0) AS costUsd FROM usage GROUP BY month ORDER BY month DESC LIMIT 12")
      .map((m) => ({ ...m, costPln: m.costUsd * usdPln() }));
    return sendJson(res, 200, { month, perUser, months });
  }

  if (section === 'payments' && method === 'GET') {
    return sendJson(res, 200, { payments: all('SELECT p.*, u.email, u.name, u.company, u.nip FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.ts DESC LIMIT 500') });
  }
  if (section === 'audit' && method === 'GET') {
    return sendJson(res, 200, { audit: all('SELECT a.*, x.email AS actor, t.email AS target FROM audit a LEFT JOIN users x ON x.id = a.actor_id LEFT JOIN users t ON t.id = a.target_id ORDER BY a.ts DESC LIMIT 300') });
  }
  if (section === 'outbox' && method === 'GET') {
    return sendJson(res, 200, { outbox: all('SELECT * FROM outbox ORDER BY ts DESC LIMIT 200') });
  }
  if (section === 'jobs' && method === 'POST') {
    return sendJson(res, 200, await runJobs(Date.now(), baseUrl(req)));
  }
  if (section === 'export' && method === 'GET') {
    const kind = idStr;
    let rows = [];
    if (kind === 'users.csv') rows = all('SELECT * FROM users ORDER BY id').map((u) => ({ id: u.id, email: u.email, imie_nazwisko: u.name, rola: u.role, plan: u.plan, status: u.sub_status, dostep_do: iso(u.sub_until), zablokowany: u.blocked, npwz: u.npwz, firma: u.company, nip: u.nip, telefon: u.phone, utworzono: iso(u.created_at), ostatnie_logowanie: iso(u.last_login) }));
    else if (kind === 'usage.csv') rows = all("SELECT u.email, g.month, COUNT(DISTINCT CASE WHEN g.kind='format' AND g.ok=1 AND g.report_id<>'' THEN g.report_id END) AS opisy, COUNT(*) AS zapytania, ROUND(SUM(g.cost_usd), 4) AS koszt_usd FROM usage g JOIN users u ON u.id = g.user_id GROUP BY u.id, g.month ORDER BY g.month DESC, u.email");
    else if (kind === 'payments.csv') rows = all('SELECT p.ts, u.email, u.name, u.company, u.nip, p.amount_pln, p.provider, p.ref, p.plan, p.period_until, p.note FROM payments p JOIN users u ON u.id = p.user_id ORDER BY p.ts DESC').map((p) => ({ ...p, ts: iso(p.ts), period_until: iso(p.period_until) }));
    else return sendJson(res, 404, { error: 'Nieznany eksport.' });
    res.writeHead(200, headers({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${kind}"`, 'Cache-Control': 'no-store' }));
    audit(me, 'export', null, kind);
    return res.end(csv(rows));
  }
  return sendJson(res, 404, { error: 'Nie znaleziono.' });
}

// ---------------------------------------------------------------- organisations: IT console (/it) and owner's view
const DELETED_DOMAIN = '@usuniety.invalid';

/** The organisation an IT request may manage: an IT administrator → their own; the owner → ?org=ID. Sends the error itself. */
function itScope(res, ctx, url) {
  if (!ctx) { sendJson(res, 401, { error: 'Zaloguj się.', code: 'login' }); return null; }
  if (ctx.user.must_change_pwd) { sendJson(res, 403, { error: 'Najpierw ustaw własne hasło.', code: 'pwd' }); return null; }
  let org = null;
  if (ctx.user.role === 'admin') org = getOrg(Number(url.searchParams.get('org')));
  else if (ctx.user.role === 'orgadmin') org = getOrg(ctx.user.org_id);
  else { sendJson(res, 403, { error: 'Brak uprawnień.' }); return null; }
  if (!org) { sendJson(res, 404, { error: 'Nie znaleziono organizacji.' }); return null; }
  return org;
}

function orgPublic(org) {
  const used = seatsUsed(org.id);
  return {
    id: org.id, name: org.name, nip: org.nip, seats: org.seats, seatsUsed: used, seatsFree: Math.max(0, org.seats - used),
    status: org.status, subUntil: org.sub_until, plan: org.plan, planName: planById(org.plan).name,
    quotaPerUser: org.quota_per_user ?? planById(org.plan).quota, quotaOverride: org.quota_per_user, devices: org.devices,
    pricePerSeat: org.price_per_seat, contact: org.contact, note: org.note, createdAt: org.created_at,
    access: org.status !== 'suspended' && org.sub_until > Date.now(),
  };
}

/** All users of an organisation with this month's reports and devices — 3 queries, whatever the number of users. */
function orgUserRows(orgId, month = monthOf()) {
  const reports = new Map(all(`SELECT g.user_id, COUNT(DISTINCT CASE WHEN g.kind='format' AND g.ok=1 AND g.report_id<>'' THEN g.report_id END) AS reports
      FROM usage g JOIN users u ON u.id = g.user_id WHERE u.org_id = ? AND g.month = ? GROUP BY g.user_id`, orgId, month).map((r) => [r.user_id, r.reports]));
  const sess = new Map(all(`SELECT s.user_id, COUNT(*) AS n, MAX(s.last_seen) AS seen FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE u.org_id = ? AND s.expires_at > ? GROUP BY s.user_id`, orgId, Date.now()).map((r) => [r.user_id, r]));
  return orgUsers(orgId).filter((u) => !u.email.endsWith(DELETED_DOMAIN)).map((u) => ({
    id: u.id, email: u.email, name: u.name, npwz: u.npwz, role: u.role, blocked: Boolean(u.blocked), mustChangePwd: Boolean(u.must_change_pwd),
    createdAt: u.created_at, lastLogin: u.last_login, lastSeen: sess.get(u.id)?.seen || null, devices: sess.get(u.id)?.n || 0,
    reports: reports.get(u.id) || 0,
  }));
}

/** Create one member of an organisation. Returns { user, tempPassword } or { error }. */
async function addOrgUser(org, b, actorId, { checkSeats = true } = {}) {
  const email = str(b.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: 'nieprawidłowy e-mail' };
  if (getUserByEmail(email)) return { error: 'konto z tym adresem już istnieje' };
  if (checkSeats && seatsUsed(org.id) >= org.seats) return { error: 'brak wolnych miejsc w licencji' };
  const pass = tempPassword();
  try {
    const user = await createUser({ email, password: pass, name: str(b.name, 120), npwz: str(b.npwz, 20), company: org.name, nip: org.nip, role: b.role === 'orgadmin' ? 'orgadmin' : 'user', orgId: org.id, mustChangePwd: true }, actorId);
    return { user, tempPassword: pass };
  } catch (err) {
    if (/UNIQUE/i.test(String(err.message))) return { error: 'konto z tym adresem już istnieje' };
    throw err;
  }
}

function welcomeText(req, org, user, pass) {
  return `Dzień dobry,\n\n${org.name} założył(a) dla Ciebie konto w ${BRAND.name} — aplikacji do dyktowania opisów radiologicznych.\n\nAdres: ${baseUrl(req)}/login\nE-mail: ${user.email}\nHasło tymczasowe: ${pass}\n\nPrzy pierwszym logowaniu ustawisz własne hasło. W razie problemów skontaktuj się z działem IT${org.contact ? ` (${org.contact})` : ''}.`;
}

async function handleIt(req, res, ctx, parts) {
  const url = new URL(req.url, 'http://x');
  const org = itScope(res, ctx, url);
  if (!org) return;
  const me = ctx.user.id;
  const method = req.method;
  const [section, idStr, action] = parts;

  if (section === 'overview' && method === 'GET') {
    return sendJson(res, 200, { org: orgPublic(org), users: orgUserRows(org.id), month: monthOf(), me, owner: ctx.user.role === 'admin', mail: mailConfigured() });
  }

  if (section === 'users' && !idStr && method === 'POST') {
    const b = await readJson(req, 20_000);
    const r = await addOrgUser(org, b, me);
    if (r.error) return sendJson(res, r.error.includes('istnieje') ? 409 : 400, { error: `Nie dodano: ${r.error}.` });
    let mailed = false;
    if (b.sendEmail === true && mailConfigured()) { await sendMail(r.user.email, `Twoje konto w ${BRAND.name}`, welcomeText(req, org, r.user, r.tempPassword)); mailed = true; }
    return sendJson(res, 200, { user: { id: r.user.id, email: r.user.email, name: r.user.name }, tempPassword: r.tempPassword, mailed });
  }

  if (section === 'import' && method === 'POST') {
    const b = await readJson(req, 300_000);
    const rows = Array.isArray(b.rows) ? b.rows : parseUserList(b.text);
    if (!rows.length) return sendJson(res, 400, { error: 'Brak adresów e-mail na liście.' });
    if (rows.length > 1000) return sendJson(res, 400, { error: 'Najwięcej 1000 osób naraz.' });
    const created = [];
    const skipped = [];
    const seen = new Set();
    let free = org.seats - seatsUsed(org.id);
    const todo = [];
    for (const row of rows) {
      const email = str(row.email, 254).toLowerCase();
      if (seen.has(email)) { skipped.push({ email, reason: 'powtórzony na liście' }); continue; }
      seen.add(email);
      if (!EMAIL_RE.test(email)) { skipped.push({ email, reason: 'nieprawidłowy e-mail' }); continue; }
      if (getUserByEmail(email)) { skipped.push({ email, reason: 'konto już istnieje' }); continue; }
      if (free <= 0) { skipped.push({ email, reason: 'brak wolnych miejsc w licencji' }); continue; }
      free--;
      todo.push({ ...row, email });
    }
    // password hashing is deliberately slow: 8 at a time keeps the server responsive for everybody else
    for (let i = 0; i < todo.length; i += 8) {
      const batch = await Promise.all(todo.slice(i, i + 8).map((row) => addOrgUser(org, row, me, { checkSeats: false })));
      batch.forEach((r, j) => (r.error ? skipped.push({ email: todo[i + j].email, reason: r.error }) : created.push({ email: r.user.email, name: r.user.name, npwz: r.user.npwz, role: r.user.role, tempPassword: r.tempPassword })));
    }
    let mailed = 0;
    if (b.sendEmail === true && mailConfigured()) {
      for (const c of created) { await sendMail(c.email, `Twoje konto w ${BRAND.name}`, welcomeText(req, org, c, c.tempPassword)); mailed++; }
    }
    audit(me, 'org.import', null, `${org.id}: dodano ${created.length}, pominięto ${skipped.length}`);
    return sendJson(res, 200, { created, skipped, mailed, org: orgPublic(org) });
  }

  if (section === 'users' && idStr) {
    const u = getUser(Number(idStr));
    if (!u || u.org_id !== org.id || u.email.endsWith(DELETED_DOMAIN)) return sendJson(res, 404, { error: 'Nie ma takiego użytkownika w organizacji.' });
    const self = u.id === me;
    if (!action && method === 'PATCH') {
      const b = await readJson(req, 20_000);
      const changes = [];
      if (typeof b.name === 'string') { run('UPDATE users SET name = ? WHERE id = ?', str(b.name, 120), u.id); changes.push('nazwa'); }
      if (typeof b.npwz === 'string') { run('UPDATE users SET npwz = ? WHERE id = ?', str(b.npwz, 20), u.id); changes.push('PWZ'); }
      if (typeof b.email === 'string' && str(b.email, 254).toLowerCase() !== u.email) {
        const e = str(b.email, 254).toLowerCase();
        if (!EMAIL_RE.test(e)) return sendJson(res, 400, { error: 'Nieprawidłowy e-mail.' });
        if (getUserByEmail(e)) return sendJson(res, 409, { error: 'Ten e-mail jest już używany.' });
        run('UPDATE users SET email = ? WHERE id = ?', e, u.id); changes.push(`e-mail ${e}`);
      }
      if (b.role === 'user' || b.role === 'orgadmin') {
        if (self && b.role !== u.role) return sendJson(res, 400, { error: 'Nie możesz zmienić własnej roli.' });
        if (u.role !== b.role) { run('UPDATE users SET role = ? WHERE id = ?', b.role, u.id); changes.push(`rola ${b.role}`); }
      }
      if (typeof b.blocked === 'boolean' && b.blocked !== Boolean(u.blocked)) {
        if (self) return sendJson(res, 400, { error: 'Nie możesz zablokować własnego konta.' });
        if (!b.blocked && seatsUsed(org.id) >= org.seats) return sendJson(res, 400, { error: 'Brak wolnych miejsc w licencji — zablokuj inne konto albo poproś o więcej miejsc.' });
        run('UPDATE users SET blocked = ? WHERE id = ?', b.blocked ? 1 : 0, u.id);
        if (b.blocked) deleteUserSessions(u.id);
        changes.push(b.blocked ? 'zablokowano' : 'odblokowano');
      }
      audit(me, 'it.user.update', u.id, changes.join(', '));
      return sendJson(res, 200, { ok: true });
    }
    if (action === 'temp-password' && method === 'POST') {
      const pass = tempPassword();
      await setTempPassword(u.id, pass);
      deleteUserSessions(u.id);
      clearFailures(u.email);
      audit(me, 'it.user.temp_password', u.id);
      return sendJson(res, 200, { tempPassword: pass, email: u.email });
    }
    if (action === 'logout' && method === 'POST') {
      deleteUserSessions(u.id);
      audit(me, 'it.user.logout_all', u.id);
      return sendJson(res, 200, { ok: true });
    }
    if (!action && method === 'DELETE') {
      if (self) return sendJson(res, 400, { error: 'Nie możesz usunąć własnego konta.' });
      // personal data removed; the anonymous usage history stays for the organisation's statistics and billing
      tx(() => {
        run(`UPDATE users SET email = ?, name = 'Usunięty użytkownik', npwz = '', phone = '', note = '', pwd = '!', blocked = 1, must_change_pwd = 0 WHERE id = ?`, `u${u.id}${DELETED_DOMAIN}`, u.id);
        run('DELETE FROM sessions WHERE user_id = ?', u.id);
        run('DELETE FROM user_data WHERE user_id = ?', u.id);
        run('DELETE FROM tokens WHERE user_id = ?', u.id);
      });
      audit(me, 'it.user.delete', u.id, u.email);
      return sendJson(res, 200, { ok: true });
    }
  }

  if (section === 'audit' && method === 'GET') {
    return sendJson(res, 200, {
      audit: all(`SELECT a.ts, a.action, a.detail, x.email AS actor, t.email AS target FROM audit a
          LEFT JOIN users x ON x.id = a.actor_id LEFT JOIN users t ON t.id = a.target_id
          WHERE (t.org_id = ? OR x.org_id = ?) AND a.action NOT IN ('login') ORDER BY a.ts DESC LIMIT 300`, org.id, org.id),
    });
  }

  if (section === 'export' && idStr === 'users.csv' && method === 'GET') {
    const rows = orgUserRows(org.id).map((u) => ({
      email: u.email, imie_nazwisko: u.name, pwz: u.npwz, rola: u.role === 'orgadmin' ? 'IT' : 'radiolog', zablokowany: u.blocked ? 'tak' : 'nie',
      haslo_tymczasowe: u.mustChangePwd ? 'tak' : 'nie', opisy_w_miesiacu: u.reports, ostatnie_logowanie: iso(u.lastLogin), utworzono: iso(u.createdAt),
    }));
    audit(me, 'it.export', null, `${org.id}`);
    res.writeHead(200, headers({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="uzytkownicy.csv"', 'Cache-Control': 'no-store' }));
    return res.end(csv(rows) || '﻿brak\n');
  }
  return sendJson(res, 404, { error: 'Nie znaleziono.' });
}

/** Owner: organisations with seats, this month's usage, AI cost and margin. */
function orgRows(month = monthOf()) {
  const usage = new Map(all(`SELECT u.org_id, COUNT(DISTINCT CASE WHEN g.kind='format' AND g.ok=1 AND g.report_id<>'' THEN g.user_id || ':' || g.report_id END) AS reports,
      COUNT(*) AS calls, COALESCE(SUM(g.cost_usd),0) AS cost, COUNT(DISTINCT g.user_id) AS activeUsers
      FROM usage g JOIN users u ON u.id = g.user_id WHERE g.month = ? AND u.org_id IS NOT NULL GROUP BY u.org_id`, month).map((r) => [r.org_id, r]));
  return listOrgs().map((o) => {
    const x = usage.get(o.id) || { reports: 0, calls: 0, cost: 0, activeUsers: 0 };
    const p = orgPublic(o);
    const revenue = p.access && o.status === 'active' ? o.seats * o.price_per_seat : 0;
    const costPln = x.cost * usdPln();
    return { ...p, reports: x.reports, calls: x.calls, activeUsers: x.activeUsers, costUsd: x.cost, costPln, revenuePln: revenue, marginPln: revenue - costPln };
  });
}

async function handleAdminOrgs(req, res, me, idStr, action) {
  const method = req.method;
  if (!idStr && method === 'GET') return sendJson(res, 200, { orgs: orgRows(), plans: plans().map((p) => ({ id: p.id, name: p.name, quota: p.quota })) });
  if (!idStr && method === 'POST') {
    const b = await readJson(req, 20_000);
    if (!str(b.name)) return sendJson(res, 400, { error: 'Podaj nazwę organizacji.' });
    const itEmail = str(b.itEmail, 254).toLowerCase();
    if (itEmail && (!EMAIL_RE.test(itEmail) || getUserByEmail(itEmail))) return sendJson(res, 400, { error: EMAIL_RE.test(itEmail) ? 'Konto z adresem administratora IT już istnieje.' : 'Nieprawidłowy e-mail administratora IT.' });
    const org = createOrg(b, me);
    let it = null;
    if (itEmail) {
      const r = await addOrgUser(org, { email: itEmail, name: b.itName, role: 'orgadmin' }, me, { checkSeats: false });
      if (r.error) return sendJson(res, 400, { error: r.error, org: orgPublic(org) });
      it = { email: r.user.email, tempPassword: r.tempPassword };
    }
    return sendJson(res, 200, { org: orgPublic(getOrg(org.id)), it });
  }
  const org = getOrg(Number(idStr));
  if (!org) return sendJson(res, 404, { error: 'Nie znaleziono organizacji.' });
  if (!action && method === 'PATCH') {
    const b = await readJson(req, 20_000);
    if (b.status !== undefined && !ORG_STATUS.includes(b.status)) return sendJson(res, 400, { error: 'Nieznany status.' });
    return sendJson(res, 200, { org: orgPublic(updateOrg(org, b, me)) });
  }
  if (action === 'extend' && method === 'POST') {
    const b = await readJson(req, 20_000);
    const months = Math.min(36, Math.max(1, Number(b.months) || 1));
    const from = Math.max(Date.now(), org.sub_until);
    const d = new Date(from);
    d.setMonth(d.getMonth() + months);
    const until = typeof b.until === 'number' ? b.until : d.getTime();
    return sendJson(res, 200, { org: orgPublic(updateOrg(org, { subUntil: until, status: b.status === 'trial' ? 'trial' : 'active' }, me)) });
  }
  if (!action && method === 'DELETE') {
    const n = one('SELECT COUNT(*) AS n FROM users WHERE org_id = ? AND email NOT LIKE ?', org.id, `%${DELETED_DOMAIN}`).n;
    if (n) return sendJson(res, 400, { error: `Organizacja ma ${n} kont — najpierw je usuń lub przenieś.` });
    run('DELETE FROM orgs WHERE id = ?', org.id);
    audit(me, 'org.delete', null, `${org.id}: ${org.name}`);
    return sendJson(res, 200, { ok: true });
  }
  return sendJson(res, 404, { error: 'Nie znaleziono.' });
}

// ---------------------------------------------------------------- router
// One JSON line per API call (no request bodies, no report text — never patient data). LOG_REQUESTS=0 turns it off.
const LOG_REQUESTS = process.env.LOG_REQUESTS ? process.env.LOG_REQUESTS === '1' : PROD;
function logRequest(req, res, started, p) {
  if (!LOG_REQUESTS || (!p.startsWith('/api/') && res.statusCode < 500) || p === '/api/status') return;
  console.log(JSON.stringify({ t: new Date().toISOString(), m: req.method, p: p.replace(/\/\d+(?=\/|$)/g, '/:id'), s: res.statusCode, ms: Date.now() - started, u: res.uid ?? null }));
}

let shuttingDown = false;

export function createServer() {
  return http.createServer(async (req, res) => {
    const started = Date.now();
    let p = '';
    res.on('finish', () => logRequest(req, res, started, p));
    try {
      const url = new URL(req.url, 'http://localhost');
      p = url.pathname;
      const method = req.method;

      // health check for the proxy / uptime monitor: database answers and the server is not shutting down
      if (p === '/healthz') {
        let db = false;
        try { db = one('SELECT 1 AS ok')?.ok === 1; } catch { /* reported below */ }
        const ok = db && !shuttingDown;
        return sendJson(res, ok ? 200 : 503, { ok, db, shuttingDown, version: VERSION, uptimeS: Math.round(process.uptime()) });
      }

      // Stripe webhook: raw body, its own signature — before the CSRF check
      if (p === '/api/stripe/webhook' && method === 'POST') {
        const raw = await readRaw(req, 1024 * 1024);
        if (!verifyStripeSignature(raw, req.headers['stripe-signature'])) return sendJson(res, 400, { error: 'bad signature' });
        let event;
        try { event = JSON.parse(raw); } catch { return sendJson(res, 400, { error: 'bad json' }); }
        return sendJson(res, 200, { result: await handleStripeEvent(event) });
      }

      if (p.startsWith('/api/')) {
        if (!['GET', 'HEAD'].includes(method)) {
          const origin = req.headers.origin;
          if (req.headers[CSRF_HEADER] !== '1' || (origin && new URL(origin).host !== req.headers.host)) {
            return sendJson(res, 403, { error: 'Nieprawidłowe żądanie.' });
          }
        }
        const ctx = currentUser(req);
        res.uid = ctx?.user.id;
        if (p === '/api/status') {
          const a = ctx ? access(ctx.user) : { ok: false, code: 'login' };
          return sendJson(res, 200, { ai: aiAvailable() && a.ok, model: aiAvailable() ? MODEL : null, version: VERSION, hosted: true, user: ctx ? publicUser(ctx.user) : null, access: a, brand: BRAND, announcement: settings().announcement || '' });
        }
        if (p === '/api/plans' && method === 'GET') {
          return sendJson(res, 200, { plans: plans().filter((x) => x.public).map(({ stripePrice, stripePriceYear, ...x }) => x), trialDays: settings().trialDays, annualMonths: settings().annualMonths, registrationOpen: settings().registrationOpen, brand: BRAND });
        }
        if (p.startsWith('/api/auth/') && method === 'POST') return await handleAuth(req, res, p.slice('/api/auth/'.length));
        if (p === '/api/me' || p.startsWith('/api/me/')) return await handleMe(req, res, ctx, p.slice('/api/me'.length).replace(/^\//, ''));
        if (p === '/api/sync' || p.startsWith('/api/sync/')) return await handleSync(req, res, ctx, decodeURIComponent(p.slice('/api/sync'.length).replace(/^\//, '')));
        if (p === '/api/format' && method === 'POST') return await handleFormat(req, res, ctx);
        if (p === '/api/learn' && method === 'POST') return await handleLearn(req, res, ctx);
        if (p.startsWith('/api/admin/')) return await handleAdmin(req, res, ctx, p.slice('/api/admin/'.length).split('/').filter(Boolean));
        if (p.startsWith('/api/it/')) return await handleIt(req, res, ctx, p.slice('/api/it/'.length).split('/').filter(Boolean));
        return sendJson(res, 404, { error: 'Nie znaleziono.' });
      }

      if (!['GET', 'HEAD'].includes(method)) { res.writeHead(405, headers()); return res.end(); }

      // public pages
      if (p === '/' ) return sitePage(res, 'index', req);
      if (['/login', '/register', '/reset', '/forgot', '/privacy', '/terms'].includes(p)) {
        if (p === '/login' || p === '/register') {
          const c = currentUser(req);
          if (c) return redirect(res, homeFor(c.user));
        }
        return sitePage(res, p.slice(1), req);
      }
      if (p.startsWith('/site/')) return serveFile(res, SITE_ROOT(), p.slice('/site/'.length), { cache: 'public, max-age=3600', req });
      if (p.startsWith('/fonts/') || p.startsWith('/icons/')) return serveFile(res, PUBLIC, p.slice(1), { cache: 'public, max-age=604800', req });
      if (p === '/favicon.ico') return serveFile(res, PUBLIC, 'icons/radvox.ico', { cache: 'public, max-age=604800', req });

      // logged-in pages
      const ctx = currentUser(req);
      if (p === '/change-password') {
        if (!ctx) return redirect(res, '/login');
        if (!ctx.user.must_change_pwd) return redirect(res, homeFor(ctx.user));
        return sitePage(res, 'change-password', req);
      }
      if (ctx?.user.must_change_pwd && ['/account', '/admin', '/it'].includes(p)) return redirect(res, '/change-password');
      if (p === '/account') return ctx ? sitePage(res, 'account', req) : redirect(res, '/login?next=/account');
      if (p === '/admin') {
        if (!ctx) return redirect(res, '/login?next=/admin');
        if (ctx.user.role !== 'admin') return redirect(res, '/app/');
        return sitePage(res, 'admin', req);
      }
      if (p === '/it') {
        if (!ctx) return redirect(res, '/login?next=/it');
        if (ctx.user.role !== 'orgadmin' && ctx.user.role !== 'admin') return redirect(res, '/app/');
        return sitePage(res, 'it', req);
      }
      if (p === '/logout') {
        if (ctx) deleteSession(ctx.token);
        return redirect(res, '/login', { 'Set-Cookie': sessionCookie('', { secure: isSecure(req), clear: true }) });
      }

      // the application itself: only for logged-in users with access (the code is never public)
      if (p === '/app') return redirect(res, '/app/');
      if (p.startsWith('/app/')) {
        if (!ctx) return redirect(res, `/login?next=${encodeURIComponent(p)}`);
        const a = access(ctx.user);
        if (!a.ok) return redirect(res, a.code === 'pwd' ? '/change-password' : '/account?need=1');
        let rel = p.slice('/app/'.length) || 'index.html';
        if (rel === 'index.html' || rel === '') rel = 'index.html';
        if (rel.startsWith('site/') || rel.startsWith('js/templates-pro/BRIEF') || rel.includes('check.mjs')) { res.writeHead(404, headers()); return res.end(); }
        return serveFile(res, APP_ROOT(), rel, { cache: 'private, no-cache', req });
      }
      res.writeHead(404, headers({ 'Content-Type': 'text/plain; charset=utf-8' }));
      res.end('Nie znaleziono');
    } catch (err) {
      if (err instanceof ClaudeError) { if (!res.headersSent) sendJson(res, err.status, { error: err.message }); return; }
      console.error(err);
      if (!res.headersSent) sendJson(res, 500, { error: 'Błąd serwera.' });
    }
  });
}

/** First start: create the administrator from ADMIN_EMAIL + ADMIN_PASSWORD when no administrator exists. */
export async function ensureAdmin() {
  if (one("SELECT id FROM users WHERE role = 'admin' LIMIT 1")) return null;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  if (passwordProblem(password)) throw new Error(`ADMIN_PASSWORD: ${passwordProblem(password)}`);
  const existing = getUserByEmail(email);
  if (existing) { run("UPDATE users SET role = 'admin' WHERE id = ?", existing.id); return getUser(existing.id); }
  return createUser({ email, password, name: 'Administrator', role: 'admin' });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  openDb();
  const admin = await ensureAdmin();
  if (admin) console.log(`Utworzono administratora: ${admin.email}`);
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || (PROD ? '0.0.0.0' : '127.0.0.1');
  startJobs();
  const server = createServer();
  // behind a reverse proxy: keep idle connections a little longer than the proxy does
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.listen(PORT, HOST, () => {
    console.log(`${BRAND.name} ${VERSION} działa: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(aiAvailable() ? `AI: ${MODEL} (${PROVIDER}), maks. ${aiLimiter.max} zapytań naraz` : 'UWAGA: brak ANTHROPIC_API_KEY — AI niedostępne.');
    if (!one("SELECT id FROM users WHERE role = 'admin' LIMIT 1")) console.log('UWAGA: brak administratora — ustaw ADMIN_EMAIL i ADMIN_PASSWORD i uruchom ponownie.');
  });
  // Graceful stop (update / restart): no new connections, AI answers already in progress are finished (up to 30 s).
  const stop = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal}: zatrzymywanie — kończę rozpoczęte zapytania AI…`);
    server.close();
    server.closeIdleConnections?.();
    const clean = await aiLimiter.idle(30_000);
    closeDb();
    console.log(clean ? 'Zatrzymano.' : 'Zatrzymano (niektóre zapytania AI przerwane po 30 s).');
    process.exit(0);
  };
  process.on('SIGTERM', () => stop('SIGTERM'));
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('unhandledRejection', (err) => console.error('unhandledRejection', err));
}

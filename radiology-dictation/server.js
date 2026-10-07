import './lib/env.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatWithClaude, ClaudeError, MODEL } from './lib/claude.js';
import { getTemplate, cleanRaw, parseTemplate } from './public/js/templates.js';

const APP_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(APP_DIR, 'public');
const VERSION = JSON.parse(readFileSync(path.join(APP_DIR, 'package.json'), 'utf8')).version;
const MAX_BODY = 200 * 1024;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
};

function aiAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
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

function validReport(report) {
  return (
    report &&
    typeof report === 'object' &&
    ['header', 'body', 'conclusion'].every((k) => typeof report[k] === 'string') &&
    report.header.length + report.body.length + report.conclusion.length < 60000
  );
}

async function handleFormat(req, res) {
  if (!aiAvailable()) return sendJson(res, 503, { error: 'Brak klucza API — AI niedostępne.', code: 'no_api_key' });
  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    if (err instanceof ClaudeError) return sendJson(res, err.status, { error: err.message });
    return sendJson(res, 400, { error: 'Nieprawidłowy JSON.' });
  }
  // The browser sends the template it uses (built-in, edited or the user's own).
  const raw = body.template ? cleanRaw(body.template) : null;
  const template = raw ? parseTemplate(raw) : getTemplate(body.templateId);
  if (!template) return sendJson(res, 400, { error: 'Nieznany szablon.' });
  if (!validReport(body.report)) return sendJson(res, 400, { error: 'Nieprawidłowa struktura raportu.' });
  const dictation = String(body.dictation || '').slice(0, 20000);
  const instruction = String(body.instruction || '').slice(0, 2000);
  const translate = body.translate === true;
  if (!translate && !dictation.trim() && !instruction.trim()) return sendJson(res, 400, { error: 'Brak dyktowanego tekstu.' });
  const lang = (v) => (v === 'en' ? 'en' : 'pl');
  try {
    const result = await formatWithClaude({
      template,
      report: body.report,
      dictation,
      instruction,
      style: String(body.style || '').slice(0, 4000),
      styleExamples: cleanStyleExamples(body.styleExamples),
      inputLang: lang(body.inputLang),
      outputLang: lang(body.outputLang),
      translate,
      mode: ['fast', 'accurate', 'turbo'].includes(body.mode) ? body.mode : 'fast',
    });
    sendJson(res, 200, result);
  } catch (err) {
    if (err instanceof ClaudeError) return sendJson(res, err.status, { error: err.message });
    console.error(err);
    sendJson(res, 500, { error: 'Błąd serwera.' });
  }
}

/** Learned style pairs from the browser: at most 20, each sentence at most 600 characters. */
export function cleanStyleExamples(list) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((x) => x && typeof x.ai === 'string' && typeof x.final === 'string' && x.ai.trim() && x.final.trim())
    .slice(-20)
    .map((x) => ({ ai: x.ai.trim().slice(0, 600), final: x.final.trim().slice(0, 600) }));
}

async function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nie znaleziono');
  }
}

// When started by the desktop icon, stop after the app window has been closed for a while
// (the page pings /api/status every minute). RADVOX_IDLE_EXIT_MIN=0 or unset → never.
let lastSeen = Date.now();
const IDLE_EXIT_MIN = Number(process.env.RADVOX_IDLE_EXIT_MIN) || 0;

export function createServer() {
  return http.createServer(async (req, res) => {
    lastSeen = Date.now();
    try {
      if (req.url === '/api/status' && req.method === 'GET') {
        // version + folder let the desktop launcher replace an older copy that is still running
        return sendJson(res, 200, { ai: aiAvailable(), model: aiAvailable() ? MODEL : null, version: VERSION, dir: APP_DIR });
      }
      if (req.url === '/api/format' && req.method === 'POST') return await handleFormat(req, res);
      if (req.method === 'GET' || req.method === 'HEAD') return await serveStatic(req, res);
      res.writeHead(405);
      res.end();
    } catch (err) {
      console.error(err);
      if (!res.headersSent) sendJson(res, 500, { error: 'Błąd serwera.' });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = process.env.HOST || '127.0.0.1';
  if (IDLE_EXIT_MIN > 0) {
    setInterval(() => {
      if (Date.now() - lastSeen > IDLE_EXIT_MIN * 60_000) {
        console.log('RadVox: okno zamknięte — zatrzymuję serwer.');
        process.exit(0);
      }
    }, Math.min(30_000, (IDLE_EXIT_MIN * 60_000) / 2)).unref();
  }
  createServer().listen(PORT, HOST, () => {
    console.log(`RadVox działa: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(aiAvailable() ? `AI: ${MODEL}` : 'AI: brak ANTHROPIC_API_KEY — tryb lokalny (bez AI)');
  });
}

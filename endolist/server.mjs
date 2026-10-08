// EndoList — lokalny serwer (bez zależności). Uruchom: node server.mjs  →  http://localhost:4173
// localhost jest „bezpiecznym kontekstem": działają klucze dostępu (passkey), folder i instalacja aplikacji.
import http from 'node:http';
import fs, { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handle, CORS, FileStore } from './sync-server/core.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.env.ENDOLIST_PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };

// Optional sync endpoint (/sync/v1/...) — enabled with ENDOLIST_SYNC_DIR=<folder>. The same API runs on Cloudflare (sync-server/).
const SYNC_DIR = process.env.ENDOLIST_SYNC_DIR || '';
const syncStore = SYNC_DIR ? new FileStore(path.resolve(SYNC_DIR), fs, path) : null;
async function syncRequest(req, res, sub) {
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS }); res.end(body === null ? '' : JSON.stringify(body)); };
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  let body = null;
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const chunks = []; let n = 0;
    for await (const c of req) { n += c.length; if (n > 25 * 1024 * 1024) return send(413, { error: 'too_large' }); chunks.push(c); }
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'); } catch { return send(400, { error: 'bad_json' }); }
  }
  const u = new URL(req.url, 'http://x');
  const r = await handle({ method: req.method, path: sub.replace(/\/+$/, ''), query: u.searchParams, auth: req.headers.authorization || null, body }, syncStore);
  send(r.status, r.body);
}

const VERSION = JSON.parse(await readFile(path.join(path.dirname(ROOT), 'package.json'), 'utf8')).version;
const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p === '/api/status') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); return res.end(JSON.stringify({ app: 'EndoList', version: VERSION, dir: path.dirname(ROOT), sync: !!syncStore })); }
    if (syncStore && p.startsWith('/sync/')) return await syncRequest(req, res, p.slice(5));
    if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    const st = await stat(file).catch(() => null);
    if (!st || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Nie znaleziono'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    res.end(await readFile(file));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
server.on('error', (e) => { if (e.code === 'EADDRINUSE') { console.log(`EndoList już działa: http://localhost:${PORT}`); process.exit(0); } throw e; });
const HOST = process.env.ENDOLIST_HOST || '127.0.0.1';
server.listen(PORT, HOST, () => console.log(`EndoList: http://localhost:${PORT}${syncStore ? `  (synchronizacja: /sync, dane w ${SYNC_DIR})` : ''}`));

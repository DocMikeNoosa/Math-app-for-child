// Render one diagram to a PNG for checking: node tools/preview-diagram.mjs public/js/diagrams/willis.js [out.png] [--mark]
// --mark selects every part (with a badge) so all clickable parts are visible in yellow.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = await import('/opt/node-tools/node_modules/playwright/index.mjs'); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');
const file = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : file.replace(/\.js$/, '.png'));
const mark = process.argv.includes('--mark');
const rel = path.relative(ROOT, file).split(path.sep).join('/');

const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/diagram.css">
<style>body{margin:0;background:#0d1218;font-family:Inter,sans-serif}#h{width:900px;height:900px;padding:10px;box-sizing:border-box}#t{color:#ccc;padding:6px 10px;font:13px monospace}</style>
<div id="t"></div><div id="h"></div>
<script type="module">
import { renderDiagram } from '/js/diagram.js';
import d from '/${rel}';
const marks = {};
if (${mark}) for (const p of d.parts) marks[p.id] = p.id.replace(/_(r|l)$/, '').slice(0, 8);
renderDiagram(document.getElementById('h'), d, { marks });
document.getElementById('t').textContent = d.id + ' — ' + d.parts.length + ' parts';
window.done = true;
</script>`;
const types = { '.js': 'text/javascript', '.css': 'text/css' };
const srv = http.createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page); return; }
  try {
    const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const browser = await (playwright.chromium || playwright.default.chromium).launch();
const pg = await browser.newPage({ viewport: { width: 900, height: 930 } });
const errors = [];
pg.on('pageerror', (e) => errors.push(e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
await pg.waitForFunction(() => window.done, null, { timeout: 5000 }).catch(() => {});
await pg.screenshot({ path: out });
await browser.close();
srv.close();
console.log(errors.length ? `errors: ${errors.join(' | ')}` : `saved ${out}`);

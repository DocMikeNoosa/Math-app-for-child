// Render a diagram in 3D to PNG: node tools/preview-3d.mjs public/js/diagrams/willis.js out.png [yawDeg] [pitchDeg] [--mark]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = await import('/opt/node-tools/node_modules/playwright/index.mjs'); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');
const file = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3] || file.replace(/\.js$/, '-3d.png'));
const yaw = Number(process.argv[4] || 0); const pitch = Number(process.argv[5] || 0);
const mark = process.argv.includes('--mark');
const rel = path.relative(ROOT, file).split(path.sep).join('/');
const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/diagram.css">
<style>body{overflow:auto}#h{width:880px;height:880px;position:relative}</style><div id="h"></div>
<script type="module">
import { create3D } from '/js/diagram3d.js';
import d from '/${rel}';
const marks = {};
if (${mark}) d.parts.slice(0, 6).forEach((p) => { marks[p.id] = '80%'; });
const v = create3D(document.getElementById('h'), d, { marks, active: ${mark} ? d.parts[0].id : null });
window.v = v; window.ok = Boolean(v);
</script>`;
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = http.createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page); return; }
  try { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const browser = await (playwright.chromium || playwright.default.chromium).launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await browser.newPage({ viewport: { width: 880, height: 880 } });
const errors = [];
pg.on('pageerror', (e) => errors.push(e.stack || e.message));
pg.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
await pg.waitForFunction(() => window.ok !== undefined, null, { timeout: 15000 }).catch(() => {});
if (yaw || pitch) {
  await pg.mouse.move(440, 440); await pg.mouse.down(); await pg.mouse.move(440 + yaw / 0.008 * Math.PI / 180, 440 + pitch / 0.008 * Math.PI / 180, { steps: 5 }); await pg.mouse.up();
}
await pg.waitForTimeout(400);
await pg.screenshot({ path: out });
console.log(await pg.evaluate(() => window.ok), errors.length ? `errors: ${errors.join(' | ')}` : `saved ${out}`);
await browser.close(); srv.close();

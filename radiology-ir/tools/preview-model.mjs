// Render a 3D model to PNG: node tools/preview-model.mjs neuro3d out.png [view] [yawDeg] [pitchDeg] [--lesions]
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const playwright = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public');
const [id, out, view = '', yaw = '0', pitch = '0'] = process.argv.slice(2);
const les = process.argv.includes('--lesions');
const page = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/diagram.css">
<style>body{overflow:auto}#h{width:1000px;height:900px;position:relative}</style><div id="h"></div>
<script type="module">
import { createModel3D, expandModel } from '/js/model3d.js';
import m from '/js/models/${id}.js';
const model = expandModel(m);
const lesions = ${les} ? (model.id === 'neuro3d' ? [
  { part: 'ica_c6_l', t: 0.5, finding: 'aneurysm', size: '9 x 7', extra: '4', dir: 'sup', devices: [{ cat: 'neuro_coil', name: 'coil', size: '8 x 20' }] },
  { part: 'mca_m1_r', t: 0.6, finding: 'thrombus', length: '8' },
  { part: 'ica_c1_l', t: 0.25, finding: 'stenosis', pre: '80', length: '12', devices: [{ cat: 'stent_carotid', name: 'stent', size: '8 x 30 mm' }] },
  { part: 'acom', t: 0.5, finding: 'aneurysm', size: '6 x 5', extra: '3', dir: 'ant', devices: [{ cat: 'flow_diverter', name: 'FD', size: '4 x 20' }] },
] : [
  { part: 'sfa_mid_l', t: 0.5, finding: 'stenosis', pre: '85', length: '40', devices: [{ cat: 'stent_se_peripheral', name: 'stent', size: '6 x 80' }] },
  { part: 'aorta_infrarenal', t: 0.5, finding: 'aneurysm', size: '62', extra: '25', dir: 'ant', devices: [{ cat: 'aortic_evar', name: 'EVAR graft', size: '28 x 140' }] },
  { part: 'renal_artery_r', t: 0.2, finding: 'stenosis', pre: '75', length: '8' },
]) : [];
const marks = {}; for (const l of lesions) marks[l.part] = l.finding;
const v = createModel3D(document.getElementById('h'), model, { view: '${view}' || undefined, lesions, marks });
window.v = v; window.ok = Boolean(v);
</script>`;
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css' };
const srv = http.createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(page); return; }
  try { const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0])); res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' }); res.end(await readFile(p)); } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const browser = await playwright.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await browser.newPage({ viewport: { width: 1000, height: 900 } });
const errors = [];
pg.on('pageerror', (e) => errors.push(e.stack || e.message));
await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
await pg.waitForFunction(() => window.ok !== undefined, null, { timeout: 20000 }).catch(() => {});
if (Number(yaw) || Number(pitch)) { await pg.mouse.move(500, 450); await pg.mouse.down(); await pg.mouse.move(500 + Number(yaw) / 0.008 * Math.PI / 180, 450 + Number(pitch) / 0.008 * Math.PI / 180, { steps: 5 }); await pg.mouse.up(); }
await pg.waitForTimeout(500);
await pg.screenshot({ path: out });
console.log(errors.length ? `errors: ${errors.join(' | ')}` : `saved ${out}`);
await browser.close(); srv.close();

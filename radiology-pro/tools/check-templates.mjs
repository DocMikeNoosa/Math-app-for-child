// Validates a templates-pro file: node check.mjs <file>
import { pathToFileURL } from 'node:url';
import { TEMPLATE_DATA } from '../public/js/template-data.js';
const SECTIONS = ['CT Head', 'Facial bones', 'Vascular / Neuro', 'Neck', 'Spine', 'Chest / Thorax', 'Heart', 'Aorta / Vascular', 'Abdomen / Pelvis', 'Upper limb', 'Lower limb', 'Pelvis / Hips', 'Paediatric', 'Combined'];
const SNIP = ['Head snippets', 'Trauma snippets', 'General snippets', 'Chest snippets', 'Abdomen snippets', 'MSK snippets', 'Vascular snippets'];
import { readdirSync } from 'node:fs';
import path from 'node:path';
const files = process.argv.slice(2);
const seen = new Set(TEMPLATE_DATA.map((t) => t.id));
// ids from the other library files must not be reused either
const LIB = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'js', 'templates-pro');
for (const f of readdirSync(LIB).filter((x) => x.endsWith('.js'))) {
  const full = path.join(LIB, f);
  if (files.some((a) => path.resolve(a) === full)) continue;
  for (const t of (await import(pathToFileURL(full).href)).default) seen.add(t.id);
}
let bad = 0; let n = 0;
const err = (t, m) => { bad++; console.log(`✗ ${t?.id}: ${m}`); };
for (const f of files) {
  const list = (await import(pathToFileURL(f).href)).default;
  if (!Array.isArray(list)) { console.log(`✗ ${f}: default export is not an array`); process.exit(1); }
  for (const t of list) {
    n++;
    for (const k of ['id', 'title', 'group', 'section', 'text']) if (typeof t[k] !== 'string' || !t[k].trim()) err(t, `missing ${k}`);
    if (typeof t.priority !== 'number') err(t, 'priority must be a number');
    if (!/^[a-z0-9_]+$/.test(t.id || '')) err(t, 'id must be snake_case');
    if (seen.has(t.id)) err(t, 'duplicate id'); seen.add(t.id);
    if (!['Trauma', 'Non-trauma', 'Snippets'].includes(t.group)) err(t, 'bad group');
    if (t.group === 'Snippets') { if (!SNIP.includes(t.section)) err(t, 'bad snippet section'); if (/Opis:|Wnioski:/.test(t.text)) err(t, 'snippet must not contain Opis/Wnioski'); continue; }
    if (!SECTIONS.includes(t.section)) err(t, `bad section ${t.section}`);
    const lines = t.text.split('\n');
    if (!/^Badanie: \S/.test(lines[0])) err(t, 'first line must be "Badanie: …"');
    const o = lines.indexOf('Opis:'); const w = lines.indexOf('Wnioski:');
    if (o < 1 || w < o) err(t, 'needs "Opis:" then "Wnioski:" lines');
    const concl = lines.slice(w + 1).filter((l) => l.trim());
    if (!concl.length || concl.some((l) => !l.startsWith('- '))) err(t, 'conclusion lines must start with "- "');
    if (/[ \t]$/m.test(t.text)) err(t, 'trailing spaces');
    if (/\n\n\n/.test(t.text)) err(t, 'double empty line');
  }
}
console.log(bad ? `${bad} problem(s) in ${n} templates` : `OK — ${n} templates`);
process.exit(bad ? 1 : 0);

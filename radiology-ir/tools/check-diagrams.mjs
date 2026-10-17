// Validates diagram modules: node tools/check-diagrams.mjs public/js/diagrams/*.js
import { pathToFileURL } from 'node:url';
import { BODY_PARTS } from '../public/js/anatomy.js';
const PARTS = BODY_PARTS.map((b) => b.id);
let bad = 0; let n = 0;
const err = (d, m) => { bad++; console.log(`✗ ${d}: ${m}`); };
const seenDiagrams = new Set();
for (const f of process.argv.slice(2).filter((x) => !x.endsWith('index.js'))) {
  const d = (await import(pathToFileURL(f).href)).default;
  const name = d?.id || f;
  if (!d || typeof d !== 'object') { err(f, 'no default export'); continue; }
  if (!/^[a-z0-9_]+$/.test(d.id || '')) err(name, 'id must be snake_case');
  if (seenDiagrams.has(d.id)) err(name, 'duplicate diagram id'); seenDiagrams.add(d.id);
  if (!Array.isArray(d.branches) || !d.branches.length || d.branches.some((b) => !['Vascular', 'NonVascular', 'Neuro'].includes(b))) err(name, 'bad branches');
  if (!PARTS.includes(d.anat)) err(name, `anat must be one of ${PARTS.join(', ')}`);
  if (!Array.isArray(d.label) || d.label.length !== 2) err(name, 'label must be [pl, en]');
  if (!/^0 0 \d+ \d+$/.test(d.viewBox || '')) err(name, 'viewBox must be "0 0 W H"');
  if (typeof d.backdrop !== 'string') err(name, 'backdrop must be a string');
  const ids = new Set();
  for (const p of d.parts || []) {
    n++;
    if (!/^[a-z0-9_]+$/.test(p.id || '')) err(name, `part id ${p.id}`);
    if (ids.has(p.id)) err(name, `duplicate part ${p.id}`); ids.add(p.id);
    if (!Array.isArray(p.label) || p.label.length !== 2 || !p.label[0] || !p.label[1]) err(name, `${p.id}: label must be [pl, en]`);
    if (!['vessel', 'organ'].includes(p.kind)) err(name, `${p.id}: kind`);
    if (!['', 'right', 'left'].includes(p.side ?? '')) err(name, `${p.id}: side`);
    if (p.side === 'right' && !p.id.endsWith('_r')) err(name, `${p.id}: right-side ids end with _r`);
    if (p.side === 'left' && !p.id.endsWith('_l')) err(name, `${p.id}: left-side ids end with _l`);
    if (p.z !== undefined && !(typeof p.z === 'number' || (Array.isArray(p.z) && p.z.every((v) => typeof v === 'number')))) err(name, `${p.id}: z must be a number or an array of numbers`);
    if (p.depth !== undefined && typeof p.depth !== 'number') err(name, `${p.id}: depth must be a number`);
    if (p.anat !== undefined && !PARTS.includes(p.anat)) err(name, `${p.id}: part anat ${p.anat}`);
    if (typeof p.d !== 'string' || !/^[Mm]/.test(p.d.trim())) err(name, `${p.id}: path d must start with M`);
    if (/[^MmLlHhVvCcSsQqTtAaZz0-9.,\s-]/.test(p.d || '')) err(name, `${p.id}: invalid characters in path`);
  }
  if ((d.parts || []).length < 6) err(name, 'too few parts');
}
console.log(bad ? `${bad} problem(s) in ${n} parts` : `OK — ${n} parts in ${seenDiagrams.size} diagram(s)`);
process.exit(bad ? 1 : 0);

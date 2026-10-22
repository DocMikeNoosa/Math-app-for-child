// Validates IR template files: node tools/check-templates.mjs public/js/templates-ir/*.js
import { pathToFileURL } from 'node:url';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { PROCEDURES, BODY_PARTS } from '../public/js/anatomy.js';
import { REGION_IDS, SNIPPET_IDS, GROUP_IDS } from '../public/js/sections.js';

const files = process.argv.slice(2);
const seen = new Set();
// ids from the other library files must not be reused either
const LIB = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public', 'js', 'templates-ir');
for (const f of readdirSync(LIB).filter((x) => x.endsWith(".js") && x !== "index.js")) {
  const full = path.join(LIB, f);
  if (files.some((a) => path.resolve(a) === full)) continue;
  try { for (const t of (await import(pathToFileURL(full).href)).default) seen.add(t.id); } catch { /* checked on its own */ }
}
const PARTS = BODY_PARTS.map((b) => b.id);
let bad = 0; let n = 0;
const err = (t, m) => { bad++; console.log(`✗ ${t?.id}: ${m}`); };

function checkText(t, text, lang) {
  const H = lang === 'pl' ? { head: /^Badanie: \S/, body: 'Opis:', concl: 'Wnioski:', target: /^Lokalizacja: / }
    : { head: /^Procedure: \S/, body: 'Findings:', concl: 'Conclusion:', target: /^Target: / };
  const lines = text.split('\n');
  if (!H.head.test(lines[0])) err(t, `${lang}: first line must be "${lang === 'pl' ? 'Badanie' : 'Procedure'}: …"`);
  const o = lines.indexOf(H.body); const w = lines.indexOf(H.concl);
  if (o < 1 || w < o) err(t, `${lang}: needs "${H.body}" then "${H.concl}" lines`);
  if (!lines.slice(o + 1, w).some((l) => H.target.test(l))) err(t, `${lang}: body needs a "${lang === 'pl' ? 'Lokalizacja' : 'Target'}: …" line`);
  const concl = lines.slice(w + 1).filter((l) => l.trim());
  if (!concl.length || concl.some((l) => !l.startsWith('- '))) err(t, `${lang}: conclusion lines must start with "- "`);
  if (/[ \t]$/m.test(text)) err(t, `${lang}: trailing spaces`);
  if (/\n\n\n/.test(text)) err(t, `${lang}: double empty line`);
}

for (const f of files) {
  const list = (await import(pathToFileURL(f).href)).default;
  if (!Array.isArray(list)) { console.log(`✗ ${f}: default export is not an array`); process.exit(1); }
  for (const t of list) {
    n++;
    for (const k of ['id', 'title', 'titleEn', 'group', 'section', 'text', 'textEn']) if (typeof t[k] !== 'string' || !t[k].trim()) err(t, `missing ${k}`);
    if (typeof t.priority !== 'number') err(t, 'priority must be a number');
    if (!/^[a-z0-9_]+$/.test(t.id || '')) err(t, 'id must be snake_case');
    if (seen.has(t.id)) err(t, 'duplicate id'); seen.add(t.id);
    if (![...GROUP_IDS, 'Snippets'].includes(t.group)) err(t, `bad group ${t.group}`);
    if (t.group === 'Snippets') {
      if (!SNIPPET_IDS.includes(t.section)) err(t, `bad snippet section ${t.section}`);
      if (/Opis:|Wnioski:|Findings:|Conclusion:/.test(t.text + t.textEn)) err(t, 'snippet must not contain section headers');
      continue;
    }
    if (!REGION_IDS[t.group]?.includes(t.section)) err(t, `section ${t.section} not in group ${t.group}`);
    if (!Array.isArray(t.proc) || !t.proc.length) err(t, 'proc must be a non-empty array');
    else for (const p of t.proc) if (!PROCEDURES[p]) err(t, `unknown proc ${p}`);
    if (!Array.isArray(t.anat) || !t.anat.length) err(t, 'anat must be a non-empty array');
    else for (const a of t.anat) if (!PARTS.includes(a)) err(t, `unknown anat ${a}`);
    if (typeof t.text === 'string') checkText(t, t.text, 'pl');
    if (typeof t.textEn === 'string') checkText(t, t.textEn, 'en');
  }
}
console.log(bad ? `${bad} problem(s) in ${n} templates` : `OK — ${n} templates`);
process.exit(bad ? 1 : 0);

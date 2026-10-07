// Apply Claude's compact "edits" to the report body (much faster than rewriting the report).
import { splitSentences } from '../public/js/crosscheck.js';

const norm = (s) => String(s || '').replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim().toLowerCase();
const INTRO_RE = /^(badanie (wykonano|porówn|wykonane)|porównano|w porównaniu|porównanie|sekwencj|protokół|technika|examination performed|study performed|comparison|technique)/iu;

/** Find a target sentence in the body: exact first, then whitespace/case/full-stop tolerant. */
function locate(lines, target) {
  const t = String(target || '').trim();
  if (!t) return null;
  for (let i = 0; i < lines.length; i++) if (lines[i].includes(t)) return { i, match: t };
  const nt = norm(t);
  for (let i = 0; i < lines.length; i++) {
    for (const s of splitSentences(lines[i])) if (norm(s) === nt) return { i, match: s };
  }
  return null;
}

function topIndex(lines) {
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    if (INTRO_RE.test(lines[i].trim())) idx = i + 1;
    else break;
  }
  return idx;
}

/**
 * Returns { body, corrections, failed } — corrections describe replaced template statements,
 * failed lists edits whose target sentence could not be found (inserts still land at the top).
 */
export function applyEdits(body, edits) {
  const lines = String(body || '').split('\n').map((text) => ({ text, was: text.trim() !== '' }));
  const plain = () => lines.map((l) => l.text);
  const corrections = [];
  const failed = [];
  const topInserts = [];

  for (const e of Array.isArray(edits) ? edits : []) {
    if (!e || typeof e !== 'object') continue;
    const text = String(e.text || '').trim();
    if (e.op === 'replace') {
      const at = locate(plain(), e.target);
      if (!at) { failed.push(String(e.target)); continue; }
      const line = lines[at.i];
      line.text = line.text.replace(at.match, text).replace(/[ \t]{2,}/g, ' ').trim();
      corrections.push({ removed: at.match, replacement: text, reason: String(e.reason || '') });
    } else if (e.op === 'insert' && text) {
      if (String(e.target).trim().toUpperCase() === 'TOP') { topInserts.push(text); continue; }
      // the target may also be a sub-heading ("Klatka piersiowa:") → top of that section
      const at = locate(plain(), e.target);
      if (!at) { failed.push(String(e.target)); topInserts.push(text); continue; }
      // several inserts after the same sentence keep their order
      const anchor = lines[at.i];
      let pos = at.i + 1;
      while (pos < lines.length && lines[pos].after === anchor) pos++;
      lines.splice(pos, 0, { text, was: true, after: anchor });
    }
  }

  let out = lines.filter((l) => !(l.was && !l.text.trim())).map((l) => l.text);
  if (topInserts.length) {
    const idx = topIndex(out);
    const block = [...(idx > 0 ? [''] : []), ...topInserts, ''];
    out.splice(idx, 0, ...block);
  }
  const result = out.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
  return { body: result, corrections, failed };
}

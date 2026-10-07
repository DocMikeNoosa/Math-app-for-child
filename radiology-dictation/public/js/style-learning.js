// "Learn my style": when the radiologist edits the AI's text before copying, the changed
// sentences are kept as pairs { ai, final } and sent to Claude with later requests as examples.

import { splitSentences } from './crosscheck.js';

const words = (s) => String(s).toLowerCase().replace(/[^\p{L}\d,]+/gu, ' ').trim().split(/\s+/).filter(Boolean);

/** Share of words two sentences have in common (0..1, against the longer one). */
export function similarity(a, b) {
  const wa = words(a);
  const wb = words(b);
  if (!wa.length || !wb.length) return 0;
  const pool = new Map();
  for (const w of wb) pool.set(w, (pool.get(w) || 0) + 1);
  let common = 0;
  for (const w of wa) {
    if (pool.get(w)) { common++; pool.set(w, pool.get(w) - 1); }
  }
  return common / Math.max(wa.length, wb.length);
}

const sentencesOf = (r) => [...splitSentences(r.body), ...splitSentences(r.conclusion).map((s) => s.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim())];

/**
 * Pairs of sentences the AI wrote and the radiologist reworded. Sentences that were only
 * added or only deleted are ignored: those are content, not style.
 */
export function styleExamplesFrom(aiReport, finalReport) {
  if (!aiReport || !finalReport || (aiReport.lang || 'pl') !== (finalReport.lang || 'pl')) return [];
  const before = sentencesOf(aiReport);
  const after = sentencesOf(finalReport);
  const beforeSet = new Set(before);
  const afterSet = new Set(after);
  const removed = before.filter((s) => !afterSet.has(s));
  const added = after.filter((s) => !beforeSet.has(s));
  const pairs = [];
  const used = new Set();
  for (const a of removed) {
    let best = null;
    let bestScore = 0.45; // must still be recognisably the same sentence
    for (const f of added) {
      if (used.has(f)) continue;
      const score = similarity(a, f);
      if (score > bestScore) { best = f; bestScore = score; }
    }
    if (best && best !== a) {
      used.add(best);
      pairs.push({ ai: a, final: best });
    }
  }
  return pairs;
}

/** Add new pairs to the stored list (newest last, no duplicates, at most `max`). */
export function addStyleExamples(list, pairs, max = 50) {
  const key = (p) => `${p.ai}→${p.final}`;
  const seen = new Set(pairs.map(key));
  return [...list.filter((p) => !seen.has(key(p))), ...pairs.map((p) => ({ ...p, at: p.at || Date.now() }))].slice(-max);
}

// Central learning: what MANY radiologists taught the app becomes knowledge for everybody.
//
// 1. Every lesson is archived (lib/learning.js), de-identified, with a count of how many different radiologists
//    (and organisations) made it.
// 2. The owner creates a new version of the "global knowledge" in the admin panel:
//    - "counts": lessons made independently by at least K radiologists (default 3) — wording corrections,
//      conclusion lines they delete, template statements they restore, EN→PL terms;
//    - "ai": the same shared lessons distilled by Claude into short general rules (per template where useful).
//    Only lessons shared by ≥ K radiologists are used — one person's habit never becomes everybody's rule, and no
//    single radiologist's text can be recognised (k-anonymity).
// 3. The owner reviews the draft (can remove any line) and publishes it. Every version is kept forever; any
//    earlier one can be re-published (rollback). This is the change control a medical device needs.
// 4. The published version is added to every AI request on the server ("global_guidance"). Personal learning
//    always wins over it. It is never sent to a browser and never shown to IT administrators or customers.
import Anthropic from '@anthropic-ai/sdk';
import { getClient, MODEL } from './ai-client.js';
import { ClaudeError } from './claude.js';
import { sharedItems, archiveStats, addVersion, publishedVersion } from './learning.js';

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const list = (v, max, fn) => (Array.isArray(v) ? v.map(fn).filter(Boolean).slice(0, max) : []);

export const GLOBAL_DEFAULTS = { minContributors: 3, minOrgs: 1 };

/** Lessons shared by enough radiologists, grouped by kind. */
export function candidates({ minContributors = GLOBAL_DEFAULTS.minContributors, minOrgs = GLOBAL_DEFAULTS.minOrgs } = {}) {
  const get = (kind, limit = 150) => sharedItems(kind, { minContributors, minOrgs, limit });
  return {
    stylePairs: get('style_pair').map((r) => ({ from: r.content.ai, to: r.content.final, contributors: r.contributors })),
    conclusionRemoved: get('concl_removed').map((r) => ({ text: r.content.text, contributors: r.contributors })),
    conclusionAdded: get('concl_added').map((r) => ({ text: r.content.text, contributors: r.contributors })),
    restored: get('restored').map((r) => ({ text: r.content.text, contributors: r.contributors })),
    glossary: get('glossary', 300).map((r) => ({ en: r.content.en, pl: r.content.pl, contributors: r.contributors })),
    rules: get('rule').map((r) => ({ text: r.content.text, contributors: r.contributors })),
    phrases: get('phrase').map((r) => ({ situation: r.content.situation, preferred: r.content.preferred, contributors: r.contributors })),
  };
}

/** Deterministic version: the shared lessons as they are. */
export function countsContent(c) {
  // one Polish term per English term: the one most radiologists chose
  const gl = new Map();
  for (const g of c.glossary) if (!gl.has(g.en) || gl.get(g.en).contributors < g.contributors) gl.set(g.en, g);
  return {
    summary: 'Wspólne poprawki wielu radiologów (bez interpretacji AI).',
    general_rules: c.rules.slice(0, 20).map((r) => r.text),
    template_rules: {},
    phrasing: c.stylePairs.slice(0, 40).map(({ from, to }) => ({ from, to })),
    avoid_in_conclusion: c.conclusionRemoved.slice(0, 40).map((r) => r.text),
    keep_statements: c.restored.slice(0, 30).map((r) => r.text),
    glossary: [...gl.values()].slice(0, 120).map(({ en, pl }) => ({ en, pl })),
  };
}

export const GLOBAL_PROMPT = `You help improve a Polish radiology reporting assistant used by many radiologists. You receive lessons that several radiologists made INDEPENDENTLY while correcting the assistant's reports (each lesson carries the number of different radiologists who made it). Distil them into short, general, reusable instructions for the assistant.

Rules:
- Only style, wording, structure, terminology and conclusion conventions. Never medical facts, thresholds, diagnoses or anything that would add, remove or change a finding.
- Prefer lessons made by more radiologists. Merge duplicates and near-duplicates. Drop anything contradictory, idiosyncratic or unclear.
- Write instructions in English, quote Polish wording exactly as radiologists wrote it.
- "phrasing": wording replacements worth applying for everybody (from → to), Polish.
- "avoid_in_conclusion": kinds of conclusion lines radiologists consistently delete (quote typical wording).
- "keep_statements": template statements radiologists consistently restore (do not drop them).
- "glossary": EN → PL terminology they agree on.
- "template_rules": only when a lesson clearly concerns one template id (given as template_id); otherwise general.
- Never include names, dates, identifiers or patient details (the input is already de-identified; keep it so).
- summary: 2–3 sentences in Polish for the service owner describing what changed.`;

export const GLOBAL_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    general_rules: { type: 'array', items: { type: 'string' } },
    template_rules: { type: 'array', items: { type: 'object', properties: { template_id: { type: 'string' }, rules: { type: 'array', items: { type: 'string' } } }, required: ['template_id', 'rules'], additionalProperties: false } },
    phrasing: { type: 'array', items: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'], additionalProperties: false } },
    avoid_in_conclusion: { type: 'array', items: { type: 'string' } },
    keep_statements: { type: 'array', items: { type: 'string' } },
    glossary: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, pl: { type: 'string' } }, required: ['en', 'pl'], additionalProperties: false } },
  },
  required: ['summary', 'general_rules', 'template_rules', 'phrasing', 'avoid_in_conclusion', 'keep_statements', 'glossary'],
  additionalProperties: false,
};

/** Size-limited, clean global knowledge (also used when the owner edits a draft). */
export function cleanGlobal(p) {
  const tr = {};
  const rawTr = Array.isArray(p?.template_rules) ? p.template_rules : Object.entries(p?.template_rules || {}).map(([template_id, rules]) => ({ template_id, rules }));
  for (const t of rawTr.slice(0, 200)) {
    const id = str(t?.template_id, 80);
    const rules = list(t?.rules, 10, (r) => str(r, 300) || null);
    if (id && rules.length) tr[id] = rules;
  }
  return {
    summary: str(p?.summary, 1000),
    general_rules: list(p?.general_rules, 30, (r) => str(r, 300) || null),
    template_rules: tr,
    phrasing: list(p?.phrasing, 60, (x) => (str(x?.from, 300) && str(x?.to, 300) ? { from: str(x.from, 300), to: str(x.to, 300) } : null)),
    avoid_in_conclusion: list(p?.avoid_in_conclusion, 60, (r) => str(r, 300) || null),
    keep_statements: list(p?.keep_statements, 40, (r) => str(r, 400) || null),
    glossary: list(p?.glossary, 200, (g) => (str(g?.en, 120) && str(g?.pl, 200) ? { en: str(g.en, 120), pl: str(g.pl, 200) } : null)),
  };
}

const emptyCandidates = (c) => !Object.values(c).some((x) => x.length);

/** Create a new draft version. method: 'counts' (no AI) or 'ai'. */
export async function createGlobalVersion({ method = 'counts', minContributors, minOrgs, note = '' } = {}) {
  const opts = { minContributors: Math.max(2, Number(minContributors) || GLOBAL_DEFAULTS.minContributors), minOrgs: Math.max(1, Number(minOrgs) || 1) };
  const c = candidates(opts);
  const stats = { ...opts, archive: archiveStats(), shared: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, v.length])) };
  if (emptyCandidates(c)) throw new ClaudeError(`Za mało wspólnych lekcji: żadna poprawka nie została jeszcze zrobiona niezależnie przez ${opts.minContributors} radiologów.`, 400);
  if (method !== 'ai') return addVersion({ method: 'counts', stats, content: cleanGlobal(countsContent(c)), note });
  let response;
  try {
    response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 12000,
      system: GLOBAL_PROMPT,
      output_config: { effort: 'high', format: { type: 'json_schema', schema: GLOBAL_SCHEMA } },
      messages: [{ role: 'user', content: JSON.stringify(c) }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }
  const text = response.content.find((b) => b.type === 'text')?.text;
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502); }
  return addVersion({ method: 'ai', stats: { ...stats, model: response.model, usage: response.usage || null }, content: cleanGlobal(parsed), note });
}

// ---------------------------------------------------------------- use in every report
let cache = { id: null, content: null };
export function invalidateGlobal() { cache = { id: null, content: null }; }
function current() {
  if (cache.id === null) {
    const v = publishedVersion();
    cache = { id: v ? v.id : 0, content: v ? cleanGlobal(v.content) : null };
  }
  return cache;
}
export const publishedId = () => current().id || null;

/** What one AI request gets from the published global knowledge (or null). */
export function guidanceFor(templateId, { inputLang = 'pl', outputLang = 'pl' } = {}) {
  const g = current().content;
  if (!g) return null;
  const rules = [...(g.template_rules[templateId] || []), ...g.general_rules].slice(0, 30);
  const out = {};
  if (rules.length) out.rules = rules;
  if (outputLang === 'pl') {
    if (g.phrasing.length) out.phrasing = g.phrasing.slice(0, 40);
    if (g.avoid_in_conclusion.length) out.avoid_in_conclusion = g.avoid_in_conclusion.slice(0, 40);
    if (g.keep_statements.length) out.keep_statements = g.keep_statements.slice(0, 30);
    if (inputLang === 'en' && g.glossary.length) out.glossary = g.glossary.slice(0, 150);
  }
  return Object.keys(out).length ? out : null;
}

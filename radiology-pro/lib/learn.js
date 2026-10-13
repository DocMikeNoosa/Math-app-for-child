// "Nauka" — the learning module. Claude studies the radiologist's own reports, phrases and edits
// and turns them into a style profile (rules + preferred phrases) that is sent with every report
// request. When something is unclear it asks a few short questions, each with a suggested phrase
// the radiologist rewrites in their own words.
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeError, MODEL } from './claude.js';
import { getClient } from './ai-client.js';

export const LEARN_PROMPT = `You study how one radiologist writes radiology reports so that a reporting assistant can write exactly like them. The radiologist is a Polish EMERGENCY radiologist; reports are in Polish (sometimes English).

You receive JSON with:
- "samples": reports, report fragments or phrases the radiologist wrote (each with a language tag). These are the strongest evidence of their style.
- "edits": pairs {"ai", "final"} — sentences the assistant wrote and how the radiologist corrected them.
- "conclusion_removed" / "conclusion_added": conclusion lines they deleted from / added to the assistant's conclusions.
- "restored": template statements they put back after the assistant removed them.
- "translations": English dictations of the radiologist with the Polish text he finally signed (he often dictates in English and the report is written in Polish). Learn how he renders English findings in Polish.
- "glossary_current": his current EN → PL terms.
- "answers": their answers to your earlier questions (question, suggestion, their version). Their version is authoritative.
- "current_profile": the profile from the previous analysis (may be empty). Keep what is still supported, refine it, drop what the new evidence contradicts.

Analyse with great care — syntax, word choice, word order, sentence length, punctuation, abbreviations and units (e.g. "j.H.", "mm" vs "cm", "x" in dimensions, decimal comma), how negative statements are phrased ("Bez cech …", "Nie stwierdza się …"), how findings are described (location → finding → size, or finding → location …), how the body is structured (order of organs, paragraphs, sub-headings, technique / comparison lines) and how the conclusion is written (numbering, length, what is included, how recommendations are phrased).

Return:
- "rules": up to 25 short, concrete, imperative rules in Polish that a writer could follow mechanically (e.g. "Wymiary zapisuj jako 12 x 8 mm, bez kropki po mm.", "Negacje zaczynaj od „Bez cech …”, nie „Nie stwierdza się …”.", "We wnioskach podawaj tylko rozpoznanie i wymiar, bez lokalizacji segmentowej."). Only rules supported by the evidence; no generic advice.
- "glossary": up to 80 English → Polish term pairs {"en", "pl"} the radiologist uses (from "translations", "glossary_current" and answers; keep his entries unless contradicted). Terms or short phrases only, Polish exactly as he writes them.
- "phrases": up to 30 preferred phrasings: {"situation": what it is used for (Polish, short), "preferred": the radiologist's exact wording}. Copy wording exactly from the evidence.
- "questions": at most 3 questions in Polish about things that are genuinely unclear or inconsistent in the evidence and matter for future reports (e.g. two competing phrasings, or an English term whose Polish rendering is unclear — then put the English term in the question and your Polish proposal in "suggestion"). Each has "question", "suggestion" (your best-guess phrase, written as you would put it in a report) and "options" (0–3 alternative phrasings). Ask nothing that the answers already settle. If nothing important is unclear, return no questions.
- "summary": 1–3 sentences in Polish describing the style.

Never invent clinical content. Never include patient data. Rules and phrases must describe style, not medical findings.`;

export const LEARN_SCHEMA = {
  type: 'object',
  properties: {
    rules: { type: 'array', items: { type: 'string' } },
    phrases: {
      type: 'array',
      items: {
        type: 'object',
        properties: { situation: { type: 'string' }, preferred: { type: 'string' } },
        required: ['situation', 'preferred'],
        additionalProperties: false,
      },
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: { question: { type: 'string' }, suggestion: { type: 'string' }, options: { type: 'array', items: { type: 'string' } } },
        required: ['question', 'suggestion', 'options'],
        additionalProperties: false,
      },
    },
    glossary: {
      type: 'array',
      items: {
        type: 'object',
        properties: { en: { type: 'string' }, pl: { type: 'string' } },
        required: ['en', 'pl'],
        additionalProperties: false,
      },
    },
    summary: { type: 'string' },
  },
  required: ['rules', 'phrases', 'questions', 'glossary', 'summary'],
  additionalProperties: false,
};

const str = (v, len) => (typeof v === 'string' ? v.trim().slice(0, len) : '');
const list = (v, max, fn) => (Array.isArray(v) ? v.map(fn).filter(Boolean).slice(-max) : []);

/** Validate / size-limit what the browser sends. */
export function cleanLearnInput(body = {}) {
  let budget = 60000; // characters of samples
  const samples = [];
  for (const s of Array.isArray(body.samples) ? body.samples.slice(-40) : []) {
    const text = str(s?.text, 8000);
    if (!text || budget - text.length < 0) continue;
    budget -= text.length;
    samples.push({ text, lang: s?.lang === 'en' ? 'en' : 'pl' });
  }
  return {
    samples,
    edits: list(body.edits, 40, (e) => (e && str(e.ai, 600) && str(e.final, 600) ? { ai: str(e.ai, 600), final: str(e.final, 600) } : null)),
    conclusion_removed: list(body.conclusionRemoved, 40, (x) => str(x, 300) || null),
    conclusion_added: list(body.conclusionAdded, 30, (x) => str(x, 300) || null),
    restored: list(body.restored, 30, (x) => str(x, 400) || null),
    translations: cleanTranslations(body.translations, 20),
    glossary_current: cleanGlossary(body.glossary),
    answers: list(body.answers, 30, (a) => (a && str(a.final, 600) ? { question: str(a.question, 400), suggestion: str(a.suggestion, 600), final: str(a.final, 600) } : null)),
    current_profile: cleanProfile(body.profile) || { rules: [], phrases: [] },
  };
}

/** EN → PL examples: [{ en: English dictation, pl: the Polish text the radiologist signed }]. */
export function cleanTranslations(v, max = 6) {
  return list(v, max, (t) => (t && str(t.en, 3000) && str(t.pl, 4000) ? { en: str(t.en, 3000), pl: str(t.pl, 4000) } : null));
}
/** EN → PL glossary: [{ en, pl }]. */
export function cleanGlossary(v) {
  return list(v, 80, (g) => (g && str(g.en, 120) && str(g.pl, 200) ? { en: str(g.en, 120), pl: str(g.pl, 200) } : null));
}

/** A style profile: { rules: [string], phrases: [{situation, preferred}], glossary: [{en, pl}] } (size-limited). */
export function cleanProfile(p) {
  if (!p || typeof p !== 'object') return null;
  const rules = list(p.rules, 25, (r) => str(r, 300) || null);
  const phrases = list(p.phrases, 30, (x) => (x && str(x.preferred, 300) ? { situation: str(x.situation, 160), preferred: str(x.preferred, 300) } : null));
  const glossary = cleanGlossary(p.glossary);
  return rules.length || phrases.length || glossary.length ? { rules, phrases, glossary } : null;
}


export async function analyzeStyle(input) {
  let response;
  try {
    response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: LEARN_PROMPT,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: LEARN_SCHEMA } },
      messages: [{ role: 'user', content: JSON.stringify(input, null, 2) }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }
  if (response.stop_reason === 'refusal') throw new ClaudeError('AI odmówiło analizy tego tekstu.', 422);
  const text = response.content.find((b) => b.type === 'text')?.text;
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502); }
  const profile = { rules: [], phrases: [], glossary: [], ...(cleanProfile(parsed) || {}) };
  return {
    ...profile,
    questions: list(parsed.questions, 3, (q) => (q && str(q.question, 400) && str(q.suggestion, 600) ? { question: str(q.question, 400), suggestion: str(q.suggestion, 600), options: list(q.options, 3, (o) => str(o, 600) || null) } : null)),
    summary: str(parsed.summary, 600),
    model: response.model,
    usage: response.usage || null,
  };
}

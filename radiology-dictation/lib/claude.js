// Claude-powered report formatting.
import Anthropic from '@anthropic-ai/sdk';

export const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.CLAUDE_EFFORT || 'medium';
// Server-side refusal fallback (beta). Set CLAUDE_FALLBACKS=0 to disable.
const USE_FALLBACKS = process.env.CLAUDE_FALLBACKS !== '0';

export const SYSTEM_PROMPT = `You are a writing assistant for a Polish radiologist. You turn raw speech-recognition dictation into polished Polish radiology report text and insert it into a structured report template.

You receive JSON with:
- "template": the examination template, with each section's default normal text and the default conclusion.
- "current_report": the report as it is now. It may already contain the radiologist's own edits and earlier dictation — treat it as the source of truth and preserve it.
- "dictation": new raw dictation (may contain speech-recognition errors, missing punctuation, spelled-out numbers).
- "instruction": an optional editing command from the radiologist (e.g. "skróć wnioski").
- "style_preferences": optional personal style rules. Follow them.

Your job:
1. Correct obvious speech-recognition errors and grammar, and rewrite the dictation in concise, professional Polish radiological language using standard terminology and accepted abbreviations (e.g. mm, cm, j.H., T1-/T2-zależny, L4/L5, MPR). Numbers as digits, Polish decimal comma, dimensions as "12 x 8 mm".
2. Place each finding in the section it belongs to. When a finding concerns a structure whose section still contains the default normal text, replace or adjust that normal text so the section no longer contradicts the finding, keeping any parts of the normal text that remain true. Findings that fit no section go to "other".
3. "Reszta bez zmian", "poza tym w normie" and similar phrases mean: keep the remaining sections' normal text unchanged.
4. Conclusions ("Wnioski"): if the radiologist dictated conclusions, polish them. If findings were added but the conclusion still says the study is normal, write a short, appropriate conclusion that summarises only the dictated findings, using cautious radiological phrasing.
5. Apply the instruction, if any, to the whole report.

Strict safety rules — never break these:
- Never invent findings, measurements, sides, levels, locations or diagnoses that were not dictated or already present in the report.
- Never change a number, unit, side (prawy/lewy), vertebral level or anatomical location that was dictated. If speech recognition clearly garbled one of these and the intended value is not certain, keep it as dictated and add a warning.
- Never silently drop a dictated finding.
- Do not add recommendations unless dictated or requested in the instruction.
- If something is ambiguous or seems clinically inconsistent (e.g. side not given, contradictory statements, conclusion inconsistent with findings), add a short warning in Polish to "warnings" instead of guessing.

Return every section id from the template exactly once, in template order, with its full final text (an empty string is allowed for "other"). Return the final technique and conclusion text. All report text and warnings must be in Polish.`;

export function buildSchema(template) {
  return {
    type: 'object',
    properties: {
      technique: { type: 'string' },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', enum: template.sections.map((s) => s.id) },
            text: { type: 'string' },
          },
          required: ['id', 'text'],
          additionalProperties: false,
        },
      },
      conclusion: { type: 'string' },
      warnings: { type: 'array', items: { type: 'string' } },
    },
    required: ['technique', 'sections', 'conclusion', 'warnings'],
    additionalProperties: false,
  };
}

export function buildUserMessage({ template, report, dictation, instruction, style }) {
  const payload = {
    template: {
      title: template.title,
      technique: template.technique,
      sections: template.sections.map((s) => ({ id: s.id, label: s.label, normal_text: s.normal })),
      default_conclusion: template.conclusion,
    },
    current_report: {
      title: report.title,
      technique: report.technique,
      sections: report.sections.map((s) => ({ id: s.id, label: s.label, text: s.text })),
      conclusion: report.conclusion,
    },
    dictation: dictation || '',
    instruction: instruction || '',
    style_preferences: style || '',
  };
  return JSON.stringify(payload, null, 2);
}

/** Merge Claude's output onto the current report; never lose a section. */
export function mergeResult(template, report, result) {
  const byId = new Map((result.sections || []).map((s) => [s.id, s.text]));
  const sections = report.sections.map((sec) => {
    const text = byId.has(sec.id) ? String(byId.get(sec.id)).trim() : sec.text;
    return { ...sec, text };
  });
  const missing = report.sections.filter((s) => !byId.has(s.id)).map((s) => s.label);
  const warnings = Array.isArray(result.warnings) ? result.warnings.filter(Boolean) : [];
  if (missing.length && missing.some((l) => l !== 'Inne')) {
    warnings.push(`AI nie zwróciło sekcji: ${missing.join(', ')} — pozostawiono bez zmian.`);
  }
  const next = {
    ...report,
    technique: typeof result.technique === 'string' && result.technique.trim() ? result.technique.trim() : report.technique,
    sections,
    conclusion: typeof result.conclusion === 'string' && result.conclusion.trim() ? result.conclusion.trim() : report.conclusion,
  };
  const changed = sections.filter((s, i) => s.text !== report.sections[i].text).map((s) => s.id);
  return {
    report: next,
    warnings,
    changed,
    conclusionChanged: next.conclusion !== report.conclusion,
    techniqueChanged: next.technique !== report.technique,
  };
}

export class ClaudeError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

let client = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}

export async function formatWithClaude({ template, report, dictation, instruction, style }) {
  const params = {
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: EFFORT,
      format: { type: 'json_schema', schema: buildSchema(template) },
    },
    messages: [{ role: 'user', content: buildUserMessage({ template, report, dictation, instruction, style }) }],
  };

  let response;
  try {
    response = USE_FALLBACKS
      ? await getClient().beta.messages.create({
          ...params,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
        })
      : await getClient().messages.create(params);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.BadRequestError) throw new ClaudeError(`Błąd zapytania do AI: ${err.message}`, 400);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }

  if (response.stop_reason === 'refusal') throw new ClaudeError('AI odmówiło przetworzenia tego tekstu.', 422);
  if (response.stop_reason === 'max_tokens') throw new ClaudeError('Odpowiedź AI została ucięta — spróbuj krótszego fragmentu.', 502);

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new ClaudeError('AI nie zwróciło tekstu.', 502);
  let parsed;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502);
  }
  return { ...mergeResult(template, report, parsed), model: response.model, usage: response.usage };
}

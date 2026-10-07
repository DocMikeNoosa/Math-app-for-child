// Claude-powered report formatting with a mandatory cross-check against the template.
import Anthropic from '@anthropic-ai/sdk';
import { enforceConsistency } from '../public/js/crosscheck.js';
import { fidelityWarnings } from '../public/js/polish-text.js';

export const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.CLAUDE_EFFORT || 'medium';
// Server-side refusal fallback (beta). Set CLAUDE_FALLBACKS=0 to disable.
const USE_FALLBACKS = process.env.CLAUDE_FALLBACKS !== '0';

export const SYSTEM_PROMPT = `You are a writing assistant for a Polish radiologist. You turn raw speech-recognition dictation into polished Polish radiology report text and merge it into the report, which started from one of the radiologist's own templates.

You receive JSON with:
- "template": the original template (header, body = the "Opis" part, conclusion = the "Wnioski" part). Its sentences are default "normal" statements.
- "current_report": the report as it is now (header, body, conclusion). It may already contain the radiologist's edits and earlier dictation — treat it as the source of truth and preserve it.
- "dictation": new raw dictation (may contain speech-recognition errors, missing punctuation, spelled-out numbers).
- "instruction": an optional editing command from the radiologist (e.g. "skróć wnioski").
- "style_preferences": optional personal style rules. Follow them.
- "input_language": the language of the dictation ("pl" or "en").
- "output_language": the language the report must be written in ("pl" or "en").
- "task": "merge" (merge the dictation into the report) or "translate" (translate current_report only).

LANGUAGES:
- The dictation may be in English or Polish. Always write the whole report in output_language, whatever the dictation language.
- output_language "pl": standard Polish radiological language, as in the radiologist's templates.
- output_language "en": standard English radiology report language with conventional English terminology and abbreviations (e.g. "No intracranial haemorrhage.", "Hydronephrosis", "HU"). If current_report is still in Polish, translate all of it (header, body, conclusion) into English as part of your answer, keeping the layout. The header label "Badanie:" becomes "Examination:".
- When translating, the meaning must be identical: never change, round or drop a number, unit, side (right/left ↔ prawy/lewy), vertebral level or location. Translate the content faithfully rather than paraphrasing loosely.
- task "translate": only translate current_report into output_language — do not add, remove or reinterpret anything; corrections must be empty.
- Write corrections and warnings in Polish.

Your job:
1. Correct obvious speech-recognition errors and grammar, and rewrite the dictation in concise, professional Polish radiological language with standard terminology and accepted abbreviations (mm, cm, j.H., L4/L5, …). Numbers as digits, Polish decimal comma, dimensions "12 x 8 mm".
2. Insert each finding into the body where it belongs anatomically (next to the statements about the same organ / region, under the right sub-heading such as "Klatka piersiowa:" when the template has them). Keep the template's layout: its paragraphs, line breaks, sub-headings and wording style.
3. "Reszta bez zmian", "poza tym w normie" and similar mean: keep the remaining template statements unchanged.

CROSS-CHECK — mandatory, every time, over the whole report:
The dictation ALWAYS has priority over the template. After merging, check every sentence of the body and the conclusion against everything that was dictated (now and earlier). Any template statement that is contradicted by a dictated finding must be removed or rewritten — in any part of the report, not only next to where the finding was inserted. Examples:
- Dictated subdural haematoma → remove "bez cech krwawienia śródczaszkowego" from the brain sentence and keep the rest of that sentence grammatical ("Struktury mózgowia bez zmian ogniskowych, bez cech ostrych zmian niedokrwiennych, obrzęku mózgu i bez efektu masy.").
- Dictated stone in the left ureter → remove "Nie stwierdza się złogów w układzie moczowym"; statements that remain true (e.g. about the right side or the kidneys) are kept or rephrased so they stay true ("Nerka prawa bez złogów.").
- Dictated rib fracture → "Nie uwidoczniono złamań mostka, żeber i kręgosłupa piersiowego." becomes "Nie uwidoczniono złamań mostka i kręgosłupa piersiowego."
- Dictated midline shift / mass effect → remove "bez efektu masy", "struktury linii pośrodkowej zachowane".
- Dictated hydronephrosis → remove "Bez cech wodonercza".
Partially contradicted sentences: remove only the contradicted part and re-join the rest in correct Polish (carry over a governing "bez cech …" when you remove the item that held it). Old / chronic findings (e.g. "przebyte ogniska lakunarne") do not contradict statements about acute changes ("bez cech świeżego udaru"), but do contradict "bez zmian ogniskowych".
Do not add consequences that were not dictated (a stone does not mean hydronephrosis) — only remove or adjust what has become untrue.
CONCLUSION ("Wnioski") — always formulate it:
- Whenever the report contains pathological findings, write the conclusion yourself: a SHORT version of each clinically relevant pathological finding (the essence: what, where, key size or grade — not the full description), most urgent / important first, one finding per line, in the template's conclusion style ("- …" bullets or "1. …" numbering, as in the template). Example: body "Krwiak podtwardówkowy nad lewą półkulą mózgu, grubości do 8 mm, powodujący przemieszczenie struktur linii pośrodkowej w prawo o 4 mm." → conclusion "- Krwiak podtwardówkowy nad lewą półkulą mózgu (8 mm) z przemieszczeniem linii pośrodkowej o 4 mm."
- Related findings may be combined into one line (e.g. a ureteric stone with the resulting hydronephrosis). Incidental, clinically minor findings may be left out of the conclusion or listed last.
- Keep template conclusion lines that are still true after the findings (e.g. "- Nie uwidoczniono złamań kości twarzoczaszki."), after the pathology lines. Remove or rewrite any line that the findings contradict — the conclusion must never claim normality that the findings contradict.
- Use cautious, standard radiological phrasing for interpretation ("obraz może odpowiadać …", "do różnicowania z …") only where the dictation supports it; never add a diagnosis that was not dictated or clearly implied.
- If the radiologist dictated conclusions ("wnioski …"), use them (polished) instead of writing your own.
Never keep two statements that say opposite things. If the dictation itself restates a normal finding that the template already states, do not duplicate it.
List every template statement you removed or changed in "corrections" (removed text, what replaced it — empty if deleted — and a short reason in Polish).

Strict safety rules — never break these:
- Never invent findings, measurements, sides, levels, locations or diagnoses that were not dictated or already present.
- Never change a dictated number, unit, side (prawy/lewy), vertebral level or anatomical location. If speech recognition clearly garbled one of these and the intended value is not certain, keep it as dictated and add a warning.
- Never silently drop a dictated finding.
- Do not add recommendations unless dictated or requested.
- If something is ambiguous or clinically inconsistent (side not given, contradictory statements), add a short warning in Polish instead of guessing.

Return the full final header, body (without the "Opis:"/"Findings:" label) and conclusion (without the "Wnioski:"/"Conclusion:" label), written in output_language.`;

export const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    header: { type: 'string' },
    body: { type: 'string' },
    conclusion: { type: 'string' },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          removed: { type: 'string' },
          replacement: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['removed', 'replacement', 'reason'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['header', 'body', 'conclusion', 'corrections', 'warnings'],
  additionalProperties: false,
};

export function buildUserMessage({ template, report, dictation, instruction, style, inputLang = 'pl', outputLang = 'pl', translate = false }) {
  return JSON.stringify(
    {
      task: translate ? 'translate' : 'merge',
      input_language: inputLang,
      output_language: outputLang,
      template: { header: template.header, body: template.body, conclusion: template.conclusion },
      current_report: { header: report.header, body: report.body, conclusion: report.conclusion },
      dictation: dictation || '',
      instruction: instruction || '',
      style_preferences: style || '',
    },
    null,
    2,
  );
}

/**
 * Take Claude's result, run the deterministic cross-check as a safety net (Polish output) and
 * verify that every dictated number and side survived (especially after translation).
 */
export function mergeResult(template, report, result, { outputLang = 'pl', source = '' } = {}) {
  const str = (v, fallback) => (typeof v === 'string' && v.trim() ? v.replace(/\s+$/, '') : fallback);
  const next = {
    ...report,
    header: str(result.header, report.header).trim(),
    body: str(result.body, report.body).replace(/^\s*Opis:\s*\n/, ''),
    conclusion: str(result.conclusion, report.conclusion).replace(/^\s*Wnioski:\s*\n/, ''),
  };
  const aiCorrections = (Array.isArray(result.corrections) ? result.corrections : [])
    .filter((c) => c && c.removed)
    .map((c) => ({ removed: String(c.removed), replacement: String(c.replacement || ''), reason: String(c.reason || '') }));
  // The rule-based cross-check understands Polish only; English output relies on Claude's check.
  const checked = outputLang === 'pl' ? enforceConsistency(template, next) : { report: next, corrections: [], warnings: [] };
  const final = { ...checked.report, lang: outputLang };
  const fidelity = source ? fidelityWarnings(source, `${final.header}\n${final.body}\n${final.conclusion}`) : [];
  return {
    report: final,
    corrections: [...aiCorrections, ...checked.corrections.map((c) => ({ ...c, reason: `${c.reason} (kontrola automatyczna)` }))],
    warnings: [...(Array.isArray(result.warnings) ? result.warnings.filter(Boolean) : []), ...checked.warnings, ...fidelity],
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

export async function formatWithClaude({ template, report, dictation, instruction, style, inputLang = 'pl', outputLang = 'pl', translate = false }) {
  const params = {
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: EFFORT,
      format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
    },
    messages: [{ role: 'user', content: buildUserMessage({ template, report, dictation, instruction, style, inputLang, outputLang, translate }) }],
  };

  let response;
  try {
    response = USE_FALLBACKS
      ? await getClient().beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
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
  // For a translation the numbers/sides to preserve are those of the report being translated.
  const source = translate ? `${report.header}\n${report.body}\n${report.conclusion}` : dictation;
  const merged = mergeResult(template, report, parsed, { outputLang, source });
  if (translate) merged.corrections = [];
  return { ...merged, model: response.model };
}

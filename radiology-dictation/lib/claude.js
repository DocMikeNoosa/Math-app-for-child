// Claude-powered report formatting with a mandatory cross-check against the template.
import Anthropic from '@anthropic-ai/sdk';
import { enforceConsistency } from '../public/js/crosscheck.js';
import { fidelityWarnings } from '../public/js/polish-text.js';
import { applyEdits } from './edits.js';

export const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
// Speed modes chosen in the app: 'fast' (default, low effort), 'accurate' (medium effort),
// 'turbo' (low effort + fast output mode, about 2x the price). CLAUDE_EFFORT overrides the effort.
export const MODES = {
  fast: { effort: 'low', turbo: false },
  accurate: { effort: 'medium', turbo: false },
  turbo: { effort: 'low', turbo: true },
};
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
2. ORDER OF FINDINGS (clinical logic, decided by you):
   - LEADING findings — clinically critical or the primary finding of the study — go at the TOP of the body, right below the template's technique / comparison lines (e.g. "Badanie wykonano w trybie ostrodyżurowym."), most urgent first. Examples: intracranial haemorrhage, mass effect / herniation, acute ischaemia, cerebral oedema, pneumothorax, active bleeding, aortic dissection, vessel occlusion, free air, solid-organ laceration, the obstructing stone (and its hydronephrosis) in a KUB, disc herniation in a spine MR, a suspicious mass.
   - SECONDARY findings stay in their ANATOMICAL place in the template, next to the statements about the same structure (in the template's head-to-toe order): a skull fracture stays with the bones, old lacunes / small-vessel change with the brain parenchyma, a simple cyst with its organ, degenerative change with the spine, sinus mucosal thickening with the sinuses.
   - LINKED findings: when a secondary finding belongs to a leading one, put it directly after that leading finding at the top — e.g. an epidural haematoma and the skull fracture beneath it; a pneumothorax / haemothorax and the rib fractures on the same side; a pelvic fracture with active bleeding. Use your clinical judgement for other such links.
   - In multi-region templates (e.g. "Głowa:", "Klatka piersiowa:") leading findings go before the first sub-heading; secondary findings go under their own sub-heading.
   Otherwise keep the template's layout: its paragraphs, line breaks, sub-headings and wording style.
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
In output_mode "full", list every template statement you removed or changed in "corrections" (removed text, what replaced it — empty if deleted — and a short reason in Polish). In output_mode "edits" the replace edits are that record.

Strict safety rules — never break these:
- Never invent findings, measurements, sides, levels, locations or diagnoses that were not dictated or already present.
- Never change a dictated number, unit, side (prawy/lewy), vertebral level or anatomical location. If speech recognition clearly garbled one of these and the intended value is not certain, keep it as dictated and add a warning.
- Never silently drop a dictated finding.
- Do not add recommendations unless dictated or requested.
- If something is ambiguous or clinically inconsistent (side not given, contradictory statements), add a short warning in Polish instead of guessing.

OUTPUT FORMAT — the JSON field "output_mode" in the input says which one to use:
- "edits" (normal dictation — be brief, this is what makes the app fast): do NOT return the report. Return only the changes to current_report.body as "edits", applied in order:
  • {"op": "replace", "target": <one complete sentence copied EXACTLY, character for character, from current_report.body>, "text": <its new version, or "" to delete it>, "reason": <short reason in Polish>} — for contradicted or partly contradicted template statements and any rewording.
  • {"op": "insert", "target": "TOP" for a leading finding (top of the body), or <a sentence copied exactly from current_report.body> after which a secondary finding is inserted (next to the same structure), "text": <the new finding sentence(s)>, "reason": ""}.
  Also return "conclusion": the complete final conclusion text (without the "Wnioski:" label), and "warnings".
- "full" (translation, or a language change): return the complete final header, body (without the "Opis:"/"Findings:" label) and conclusion (without the "Wnioski:"/"Conclusion:" label) in output_language, plus "corrections" and "warnings".`;

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

export const EDITS_SCHEMA = {
  type: 'object',
  properties: {
    edits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          op: { type: 'string', enum: ['replace', 'insert'] },
          target: { type: 'string' },
          text: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['op', 'target', 'text', 'reason'],
        additionalProperties: false,
      },
    },
    conclusion: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['edits', 'conclusion', 'warnings'],
  additionalProperties: false,
};

/** Edits are much shorter than a full report; translation / language changes need the full text. */
export function outputModeFor({ report, outputLang = 'pl', translate = false }) {
  return translate || (report.lang || 'pl') !== outputLang ? 'full' : 'edits';
}

/**
 * The user turn as two content blocks: the template (stable per template → cached together with
 * the system prompt) and the per-request part. Both are JSON objects.
 */
export function buildUserContent({ template, report, dictation, instruction, style, inputLang = 'pl', outputLang = 'pl', translate = false }) {
  const fixed = { template: { header: template.header, body: template.body, conclusion: template.conclusion } };
  const variable = {
    task: translate ? 'translate' : 'merge',
    output_mode: outputModeFor({ report, outputLang, translate }),
    input_language: inputLang,
    output_language: outputLang,
    current_report: { header: report.header, body: report.body, conclusion: report.conclusion },
    dictation: dictation || '',
    instruction: instruction || '',
    style_preferences: style || '',
  };
  return [
    { type: 'text', text: JSON.stringify(fixed, null, 2), cache_control: { type: 'ephemeral' } },
    { type: 'text', text: JSON.stringify(variable, null, 2) },
  ];
}

const str = (v, fallback) => (typeof v === 'string' && v.trim() ? v.replace(/\s+$/, '') : fallback);

/** Shared tail: rule-based cross-check (Polish), fidelity check, warnings. */
function finish(template, next, aiCorrections, aiWarnings, { outputLang, source }) {
  const checked = outputLang === 'pl' ? enforceConsistency(template, next) : { report: next, corrections: [], warnings: [] };
  const final = { ...checked.report, lang: outputLang };
  const fidelity = source ? fidelityWarnings(source, `${final.header}\n${final.body}\n${final.conclusion}`) : [];
  return {
    report: final,
    corrections: [...aiCorrections, ...checked.corrections.map((c) => ({ ...c, reason: `${c.reason} (kontrola automatyczna)` }))],
    warnings: [...(Array.isArray(aiWarnings) ? aiWarnings.filter(Boolean) : []), ...checked.warnings, ...fidelity],
  };
}

/**
 * Full-report answer: take Claude's report, then run the deterministic cross-check as a safety
 * net (Polish output) and verify that every dictated number and side survived.
 */
export function mergeResult(template, report, result, { outputLang = 'pl', source = '' } = {}) {
  const next = {
    ...report,
    header: str(result.header, report.header).trim(),
    body: str(result.body, report.body).replace(/^\s*(Opis|Findings):\s*\n/, ''),
    conclusion: str(result.conclusion, report.conclusion).replace(/^\s*(Wnioski|Conclusion):\s*\n/, ''),
  };
  const aiCorrections = (Array.isArray(result.corrections) ? result.corrections : [])
    .filter((c) => c && c.removed)
    .map((c) => ({ removed: String(c.removed), replacement: String(c.replacement || ''), reason: String(c.reason || '') }));
  return finish(template, next, aiCorrections, result.warnings, { outputLang, source });
}

/** Edits answer: apply the edits to the current report, then the same checks. */
export function mergeEditsResult(template, report, result, { outputLang = 'pl', source = '' } = {}) {
  const applied = applyEdits(report.body, result.edits);
  const next = {
    ...report,
    body: applied.body,
    conclusion: str(result.conclusion, report.conclusion).replace(/^\s*(Wnioski|Conclusion):\s*\n/, ''),
  };
  const warnings = [...(Array.isArray(result.warnings) ? result.warnings : [])];
  if (applied.failed.length) {
    warnings.push(`AI odwołało się do zdań, których nie ma w opisie (${applied.failed.length}) — sprawdź opis; nowe zmiany dodano na górze.`);
  }
  return finish(template, next, applied.corrections, warnings, { outputLang, source });
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

/** Build the request for a speed mode. */
export function buildRequest({ template, report, dictation, instruction, style, inputLang, outputLang, translate, mode = 'fast' }) {
  const m = MODES[mode] || MODES.fast;
  const params = {
    model: MODEL,
    max_tokens: 16000,
    // the instructions never change → cached, so they aren't re-processed on every request
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: {
      effort: process.env.CLAUDE_EFFORT || m.effort,
      format: { type: 'json_schema', schema: outputModeFor({ report, outputLang, translate }) === 'edits' ? EDITS_SCHEMA : OUTPUT_SCHEMA },
    },
    messages: [{ role: 'user', content: buildUserContent({ template, report, dictation, instruction, style, inputLang, outputLang, translate }) }],
  };
  const betas = [];
  if (USE_FALLBACKS) {
    betas.push('server-side-fallback-2026-07-01');
    params.fallbacks = 'default';
  }
  if (m.turbo) {
    betas.push('fast-mode-2026-02-01');
    params.speed = 'fast';
  }
  // Turbo: no SDK retries — on a rate limit we switch to normal speed immediately instead.
  const options = m.turbo ? { maxRetries: 0 } : undefined;
  return betas.length ? { beta: true, params: { ...params, betas }, options } : { beta: false, params, options };
}

async function send(req) {
  return req.beta ? getClient().beta.messages.create(req.params, req.options) : getClient().messages.create(req.params, req.options);
}

export async function formatWithClaude({ template, report, dictation, instruction, style, inputLang = 'pl', outputLang = 'pl', translate = false, mode = 'fast' }) {
  const args = { template, report, dictation, instruction, style, inputLang, outputLang, translate };
  let response;
  try {
    try {
      response = await send(buildRequest({ ...args, mode }));
    } catch (err) {
      // Turbo has its own rate limit and may be unavailable: fall back to the normal fast mode.
      if (mode === 'turbo' && (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.BadRequestError)) {
        response = await send(buildRequest({ ...args, mode: 'fast' }));
      } else throw err;
    }
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
  const edits = outputModeFor({ report, outputLang, translate }) === 'edits';
  const merged = edits ? mergeEditsResult(template, report, parsed, { outputLang, source }) : mergeResult(template, report, parsed, { outputLang, source });
  if (translate) merged.corrections = [];
  return { ...merged, model: response.model };
}

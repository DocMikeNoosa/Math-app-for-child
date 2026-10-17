// Summary letter to the referring doctor ("List do lekarza kierującego"). Separate from the report:
// the report is the factual record for the hospital system; the letter tells the referring colleague,
// in plain clinical language, what was done, how it went and what happens next.
// Names never reach the AI: the browser sends the facts with placeholders and fills them in locally.
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeError, MODEL, MODES } from './claude.js';

export const PLACEHOLDERS = ['[[ZWROT]]', '[[PACJENT]]', '[[DATA_UR]]', '[[DATA_ZABIEGU]]', '[[LEKARZ]]', '[[PODPIS]]'];

export const LETTER_PROMPT = `You write the summary letter from an interventional / neurointerventional radiologist to the doctor who referred the patient (a GP, surgeon, neurologist, oncologist, nephrologist…). It is NOT the procedure report: the report is the factual technical record for the hospital system; the letter explains to a colleague, clearly and briefly, what was done, the result, and what happens next.

You receive JSON with:
- "facts": the procedure card — what the radiologist recorded (procedure, indication, access, every treated vessel / organ with findings before and after, devices with sizes, drugs, dose, outcome, complications, recommendations, follow-up). This is the source of truth.
- "report": the final procedure report (may be empty). Use it for detail; if it conflicts with "facts", follow "facts" and add a warning.
- "clinical_details": optional clinical background / referral question.
- "language": "pl" or "en" — write the whole letter in this language.
- "recipient": "referring_doctor" (default), "gp", "patient_record" — adapt the depth of technical detail (a GP needs less device detail, a surgeon / neurologist more).
- "length": "short" | "standard" | "detailed".
- "patient_sex": "F", "M" or "" (grammar only).
- "include_warning_signs": true/false — whether to add a short paragraph of warning signs that should prompt contact (see rules).
- "style_rules": optional rules from the radiologist (follow them).
- "previous_letter" + "instruction": when present, revise previous_letter according to the instruction and change nothing else.

Placeholders — use them EXACTLY, never invent names, dates or titles:
- [[ZWROT]] alone on the first line (the greeting, filled in locally, e.g. "Szanowny Panie Doktorze,"),
- [[PACJENT]] for the patient's name, [[DATA_UR]] for the date of birth, [[DATA_ZABIEGU]] for the procedure date,
- [[PODPIS]] alone on the last line (the radiologist's signature block).
Polish: after "[[ZWROT]]" the text continues with a lower-case letter (Polish letter convention: comma after the greeting).
"patient_sex" ("F", "M" or "") tells you the grammatical gender to use (pacjentka / pacjent, przebyła / przebył). When it is empty, use neutral constructions, e.g. "Dziękujemy za skierowanie [[PACJENT]] (ur. [[DATA_UR]]) …", "Zabieg wykonano w dniu [[DATA_ZABIEGU]] …", "U chorego/chorej" is NOT acceptable — rephrase instead.

Content and order (adapt headings to the length; use short paragraphs, a few bullet points only for lists such as recommendations):
1. Thanks for the referral, patient reference, indication (one sentence).
2. What was done, in plain clinical language: procedure, target (vessel / organ, side), approach; key technical points that matter to the colleague (e.g. stent type and size and location, coils / embolic agent, drain type and size, number of biopsy cores, ablation).
3. Result: technical result and the key numbers (e.g. residual stenosis, eTICI, Raymond-Roy class, occlusion, drained volume).
4. Complications: state them honestly with management and current status, or "bez powikłań" ONLY if the facts say none.
5. Medication (antiplatelet / anticoagulation regimen and duration) ONLY as recorded in the facts / report — never propose a regimen yourself; if the procedure usually needs one (e.g. a stent) and none is recorded, add a warning instead.
6. Recommendations and follow-up for the referring doctor (imaging, drain care / exchange date, clinic visit, results of histology to be awaited) — only as recorded.
7. Implanted devices worth knowing for the future (stent / stent graft / coils / filter / port / drain), listed briefly — do not state MRI safety unless recorded.
8. If include_warning_signs: one short paragraph with the usual warning signs for THIS procedure that should prompt contact (e.g. puncture-site bleeding or swelling, limb pain / pallor, fever, drain stopping, new neurological deficit). These are generic safety advice; keep it to 2–4 items and add the warning "Sprawdź objawy alarmowe w liście." so the radiologist reviews them.
9. Offer of contact, courtesy closing ("Z wyrazami szacunku," / "Kind regards,"), then [[PODPIS]].

Abbreviations: vessel and procedure abbreviations stay in their universal English form in Polish letters too (ICA, MCA, PCA, PComA, SMA, RHA, CFA, SFA, IVC, TACE, TARE, EVAR, TEVAR, DSA, eTICI…); for a GP you may add the full Polish name once in brackets, e.g. "MCA (tętnica środkowa mózgu)". Anatomical variants from the facts are mentioned only when they matter for the referring doctor (e.g. for future imaging or surgery).

Strict rules:
- Never invent facts, numbers, devices, drugs, doses, dates, results, histology or plans. Values left as "…" in the facts stay unmentioned or "…" — never guess them.
- Never change a number, side, level, vessel or device from the facts.
- Professional, warm, concise collegial tone; standard medical Polish (or English). No marketing language.
- Write warnings (in Polish) for anything missing that the letter would normally contain (e.g. no recommendations, no antiplatelet regimen after stenting, complications unclear) and for any conflict between facts and report.
Return JSON: "subject" (short subject line, no names — e.g. "Informacja o wykonanym zabiegu: embolizacja tętnic macicznych"), "letter" (the full letter text with placeholders, plain text, paragraphs separated by one empty line), "warnings" (array of short Polish strings).`;

export const LETTER_SCHEMA = {
  type: 'object',
  properties: {
    subject: { type: 'string' },
    letter: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['subject', 'letter', 'warnings'],
  additionalProperties: false,
};

const s = (v, max) => String(v ?? '').slice(0, max);
/** Clean the browser's request. */
export function cleanLetterInput(body = {}) {
  return {
    facts: s(body.facts, 20000),
    report: s(body.report, 30000),
    clinical_details: s(body.clinical, 3000),
    language: body.lang === 'en' ? 'en' : 'pl',
    patient_sex: ['F', 'M'].includes(body.sex) ? body.sex : '',
    recipient: ['referring_doctor', 'gp', 'patient_record'].includes(body.recipient) ? body.recipient : 'referring_doctor',
    length: ['short', 'standard', 'detailed'].includes(body.length) ? body.length : 'standard',
    include_warning_signs: body.warningSigns !== false,
    style_rules: Array.isArray(body.styleRules) ? body.styleRules.filter((x) => typeof x === 'string').slice(0, 25).map((x) => x.slice(0, 300)) : [],
    ...(body.previous && body.instruction ? { previous_letter: s(body.previous, 20000), instruction: s(body.instruction, 3000) } : {}),
  };
}

export function buildLetterRequest(input, mode = 'fast') {
  const m = MODES[mode] || MODES.fast;
  return {
    model: MODEL,
    max_tokens: 8000,
    system: [{ type: 'text', text: LETTER_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: process.env.CLAUDE_EFFORT || m.effort, format: { type: 'json_schema', schema: LETTER_SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify(input, null, 2) }],
  };
}

/** The letter must keep the greeting and signature placeholders; add them if the AI dropped them. */
export function normaliseLetter(text) {
  let t = String(text || '').replace(/\r/g, '').trim();
  if (!t.includes('[[ZWROT]]')) t = `[[ZWROT]]\n\n${t}`;
  if (!t.includes('[[PODPIS]]')) t = `${t}\n[[PODPIS]]`;
  return t.replace(/\n{3,}/g, '\n\n');
}

let client = null;
const getClient = () => (client ||= new Anthropic());

export async function writeLetter(input, mode = 'fast') {
  if (!input.facts.trim() && !input.report.trim()) throw new ClaudeError('Brak danych o zabiegu — uzupełnij kartę zabiegu lub opis.', 400);
  let response;
  try {
    response = await getClient().messages.create(buildLetterRequest(input, mode));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }
  if (response.stop_reason === 'refusal') throw new ClaudeError('AI odmówiło napisania listu.', 422);
  if (response.stop_reason === 'max_tokens') throw new ClaudeError('Odpowiedź AI została ucięta — spróbuj krótszej wersji listu.', 502);
  const text = response.content.find((b) => b.type === 'text')?.text;
  let parsed;
  try { parsed = JSON.parse(text); } catch { throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502); }
  return {
    subject: s(parsed.subject, 300).trim(),
    letter: normaliseLetter(parsed.letter),
    warnings: (Array.isArray(parsed.warnings) ? parsed.warnings : []).filter((w) => typeof w === 'string' && w.trim()).slice(0, 12),
    model: response.model,
  };
}

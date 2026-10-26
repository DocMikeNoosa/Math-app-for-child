// "Say what you did" → structured procedure card, with Claude. The model gets the exact vocabulary of the app
// (vessel ids of the 3D models, findings and their fields, procedures, device catalogue, clinical scores) and
// returns only what was said. The answer is validated against the same vocabulary before it reaches the card.
import Anthropic from '@anthropic-ai/sdk';
import { ClaudeError, MODEL, MODES } from './claude.js';
import { expandModel } from '../public/js/model3d.js';
import neuro3d from '../public/js/models/neuro3d.js';
import body3d from '../public/js/models/body3d.js';
import { organLists, DIAGRAM_IDS } from '../public/js/diagrams/index.js';
import { LESIONS, CLINICAL } from '../public/js/clinical.js';
import { PROCEDURES } from '../public/js/anatomy.js';
import { DEVICE_CATEGORIES } from '../public/js/devices.js';
import { ACCESS_SITES, ANAESTHESIA, OUTCOME } from '../public/js/card.js';

let vocabCache = null;
/** Everything the AI may use, as compact text, plus lookup sets for validation. */
export async function vocabulary() {
  if (vocabCache) return vocabCache;
  const diagrams = [expandModel(neuro3d), expandModel(body3d)];
  for (const id of DIAGRAM_IDS) {
    try { diagrams.push((await import(`../public/js/diagrams/${id}.js`)).default); } catch { /* optional */ }
  }
  diagrams.push(...organLists());
  const parts = new Map(); // id → { kind, diagram }
  const lines = [];
  for (const d of diagrams) {
    lines.push(`## ${d.id} (${d.label?.[1] || d.id})`);
    for (const p of d.parts || []) {
      if (parts.has(p.id)) continue;
      parts.set(p.id, { kind: p.kind || 'vessel', diagram: d.id });
      lines.push(`${p.id}: ${p.label?.[1] || ''}${p.side ? ` (${p.side})` : ''}`);
    }
  }
  const findings = { vessel: new Map(), organ: new Map() };
  const findingLines = [];
  for (const kind of ['vessel', 'organ']) {
    for (const f of LESIONS[kind]) {
      findings[kind].set(f.id, new Map(f.fields.map((x) => [x.key, x])));
      findingLines.push(`${kind}/${f.id} (${f.label[1]}): ${f.fields.map((x) => `${x.key}=${x.label[1]}${x.type === 'select' ? ` [${x.options.map((o) => o[0]).join('|')}]` : x.type === 'bool' ? ' [true|false]' : x.unit ? ` [${x.unit}]` : ''}`).join('; ') || '—'}`);
    }
  }
  const procs = new Set(Object.keys(PROCEDURES));
  const cats = new Set(DEVICE_CATEGORIES.map((c) => c.id));
  const devLines = DEVICE_CATEGORIES.map((c) => `${c.id} (${c.label[1]}): ${(c.items || []).map((i) => i.name).join(' | ')}`);
  const clinical = new Set();
  const clinLines = [];
  for (const [branch, secs] of Object.entries(CLINICAL)) for (const s of secs) for (const f of s.fields) { clinical.add(f.key); clinLines.push(`${f.key} (${branch}: ${f.label[1]})${f.type === 'select' ? ` [${f.options.map((o) => o[0]).join('|')}]` : f.type === 'bool' ? ' [true|false]' : ''}`); }
  const sites = new Set(Object.values(ACCESS_SITES).flat().map((x) => x[0]));
  const text = [
    '# VESSELS / ORGANS (part ids; _r = patient right, _l = patient left)', ...lines,
    '\n# FINDINGS and their fields (key=meaning [allowed values])', ...findingLines,
    `\n# PROCEDURES: ${[...procs].map((p) => `${p} (${PROCEDURES[p][1]})`).join('; ')}`,
    '\n# DEVICE CATEGORIES and catalogue product names', ...devLines,
    `\n# CLINICAL keys: ${clinLines.join('; ')}`,
    `\n# ACCESS sites: ${[...sites].join(', ')}; anaesthesia: ${ANAESTHESIA.map((a) => a[0]).join(', ')}; outcome: ${OUTCOME.map((o) => o[0]).join(', ')}`,
  ].join('\n');
  vocabCache = { text, parts, findings, procs, cats, clinical, sites };
  return vocabCache;
}

export const CARD_PARSE_PROMPT = `You fill in the procedure card of an interventional / neurointerventional radiology dictation app from what the radiologist said (Polish or English, speech recognition — expect misspelled brand names and spelled-out numbers).

Return ONLY what was said. Never add findings, devices, sizes, numbers, results or sides that were not stated. If something is unclear (e.g. the side of a paired vessel), leave it out and add a short Polish warning.

Rules:
- lesions: one entry per treated / described vessel or organ. "part" MUST be an id from the VESSELS / ORGANS list (with _r / _l for the patient's right / left). Choose the most specific segment that was named (e.g. "tętniak rozwidlenia MCA lewej" → mca_bif_l; "zwężenie tętnicy szyjnej wewnętrznej prawej" with stenting → carotid_bif_r; "tętniak AComA" → acom; "SFA" without detail → sfa_mid_*).
- The access vessel (e.g. "dostęp przez prawą tętnicę udową") is NOT a lesion — put it in "access".
- finding: an id from FINDINGS for that kind (vessel or organ). fields: only keys listed for that finding, values as strings in the allowed format (select → one of the allowed values; bool → "true"; sizes like "7 × 5"; percentages as numbers without %).
- position: "proximal" | "mid" | "distal" | "" along the vessel, only if said.
- procedures: ids from PROCEDURES that were done on this lesion (e.g. coils only → coiling; coils + stent or remodelling balloon → stent_coiling; carotid stent → carotid_stenting).
- devices: "category" = a DEVICE CATEGORY id; "name" = the exact catalogue product name when the device matches one (correct obvious speech-recognition errors, e.g. "lvis evo" → "LVIS EVO"), otherwise a short generic Polish description; "size" as said (e.g. "4 mm × 8 cm"); "quantity" = number of pieces said (e.g. "pięć spiral" → 5), default 1. Devices for the access (sheath, guide catheter, closure) and drugs (category "drugs") go into general_devices.
- clinical: keys from CLINICAL only (NIHSS, ASPECTS, times as HH:MM, Hunt-Hess, Fisher, Rutherford, ABI…).
- branch: "Neuro" for neurointerventional work (intracranial vessels, stroke, aneurysm, AVM; carotid stenting dictated by a neurointerventionalist), "Vascular" for aorta / visceral / peripheral (and carotid stenting otherwise), "NonVascular" for drainage, biopsy, ablation etc.; "" if unclear.
- no_complications: true only if it was said that there were no complications.

Return JSON matching the schema.`;

const DEV = { type: 'object', properties: { category: { type: 'string' }, name: { type: 'string' }, size: { type: 'string' }, quantity: { type: 'integer' } }, required: ['category', 'name', 'size', 'quantity'], additionalProperties: false };
const KV = { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' } }, required: ['key', 'value'], additionalProperties: false };
export const CARD_PARSE_SCHEMA = {
  type: 'object',
  properties: {
    branch: { type: 'string', enum: ['Vascular', 'Neuro', 'NonVascular', ''] },
    lesions: { type: 'array', items: { type: 'object', properties: { part: { type: 'string' }, finding: { type: 'string' }, position: { type: 'string', enum: ['proximal', 'mid', 'distal', ''] }, fields: { type: 'array', items: KV }, procedures: { type: 'array', items: { type: 'string' } }, devices: { type: 'array', items: DEV } }, required: ['part', 'finding', 'position', 'fields', 'procedures', 'devices'], additionalProperties: false } },
    general_devices: { type: 'array', items: DEV },
    access: { type: 'object', properties: { site: { type: 'string' }, side: { type: 'string', enum: ['right', 'left', ''] }, sheath: { type: 'string' }, closure: { type: 'string' } }, required: ['site', 'side', 'sheath', 'closure'], additionalProperties: false },
    anaesthesia: { type: 'string' }, outcome: { type: 'string' },
    no_complications: { type: 'boolean' }, complications: { type: 'string' },
    contrast_ml: { type: 'string' }, fluoroscopy_min: { type: 'string' }, dose: { type: 'string' }, dose_unit: { type: 'string' },
    indication: { type: 'string' }, recommendations: { type: 'string' }, follow_up: { type: 'string' },
    clinical: { type: 'array', items: KV },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['branch', 'lesions', 'general_devices', 'access', 'anaesthesia', 'outcome', 'no_complications', 'complications', 'contrast_ml', 'fluoroscopy_min', 'dose', 'dose_unit', 'indication', 'recommendations', 'follow_up', 'clinical', 'warnings'],
  additionalProperties: false,
};

const s = (v, max = 300) => String(v ?? '').trim().slice(0, max);
const POS = { proximal: 0.15, mid: 0.5, distal: 0.82 };
/** Keep only what fits the app's vocabulary; convert to the card format used by applyParsed(). */
export function normaliseCardParse(raw, vocab) {
  const out = { branch: ['Vascular', 'Neuro', 'NonVascular'].includes(raw?.branch) ? raw.branch : '', lesions: [], devices: [], access: {}, clinical: {}, warnings: [] };
  const dev = (d) => (vocab.cats.has(d?.category) || d?.category === 'drugs' ? { cat: d.category, name: s(d.name, 120), size: s(d.size, 40), qty: Math.max(1, Math.min(99, Number(d.quantity) || 1)) } : null);
  for (const l of Array.isArray(raw?.lesions) ? raw.lesions : []) {
    const part = vocab.parts.get(l.part);
    if (!part) { out.warnings.push(`Nieznane naczynie / narząd: ${s(l.part, 40)}`); continue; }
    const kind = part.kind === 'organ' ? 'organ' : 'vessel';
    const fields = vocab.findings[kind].get(l.finding);
    const lesion = { part: l.part, finding: fields ? l.finding : 'other', t: POS[l.position] ?? 0.5, fields: {}, procs: [], devices: [] };
    for (const kv of Array.isArray(l.fields) ? l.fields : []) {
      const f = fields?.get(kv.key);
      if (!f) continue;
      let v = s(kv.value, 60);
      if (f.type === 'bool') { if (v === 'true') lesion.fields[kv.key] = true; continue; }
      if (f.type === 'select' && !f.options.some((o) => o[0] === v)) continue;
      if (f.type === 'num') v = v.replace('%', '').trim();
      if (v) lesion.fields[kv.key] = v;
    }
    lesion.procs = (Array.isArray(l.procedures) ? l.procedures : []).filter((p) => vocab.procs.has(p));
    lesion.devices = (Array.isArray(l.devices) ? l.devices : []).map(dev).filter(Boolean);
    out.lesions.push(lesion);
  }
  out.devices = (Array.isArray(raw?.general_devices) ? raw.general_devices : []).map(dev).filter(Boolean);
  const a = raw?.access || {};
  if (vocab.sites.has(a.site)) out.access.site = a.site;
  if (['right', 'left'].includes(a.side)) out.access.side = a.side;
  if (s(a.sheath)) out.access.sheath = s(a.sheath, 30);
  if (s(a.closure)) out.access.closure = s(a.closure, 80);
  if (['local', 'sedation', 'general', 'none'].includes(raw?.anaesthesia)) out.anaesthesia = raw.anaesthesia;
  if (['success', 'partial', 'failed'].includes(raw?.outcome)) out.outcome = raw.outcome;
  if (raw?.no_complications) out.complications = { none: true };
  else if (s(raw?.complications)) out.complications = { none: false, text: s(raw.complications, 600) };
  if (s(raw?.contrast_ml)) out.contrast = s(raw.contrast_ml, 10);
  if (s(raw?.fluoroscopy_min)) out.fluoro = s(raw.fluoroscopy_min, 10);
  if (s(raw?.dose)) { out.dose = s(raw.dose, 12); if (['Gy·cm²', 'mGy', 'mGy·cm', 'µGy·m²'].includes(raw.dose_unit)) out.doseUnit = raw.dose_unit; }
  if (s(raw?.indication)) out.indication = s(raw.indication, 600);
  if (s(raw?.recommendations)) out.recommendations = s(raw.recommendations, 800);
  if (s(raw?.follow_up)) out.followUp = s(raw.follow_up, 400);
  for (const kv of Array.isArray(raw?.clinical) ? raw.clinical : []) if (vocab.clinical.has(kv.key) && s(kv.value)) out.clinical[kv.key] = kv.value === 'true' ? true : s(kv.value, 20);
  out.warnings.push(...(Array.isArray(raw?.warnings) ? raw.warnings : []).filter((w) => typeof w === 'string' && w.trim()).slice(0, 8).map((w) => s(w, 200)));
  return out;
}

export async function buildCardParseRequest(text, lang = 'pl', mode = 'fast') {
  const vocab = await vocabulary();
  const m = MODES[mode] || MODES.fast;
  return {
    model: MODEL,
    max_tokens: 6000,
    system: [{ type: 'text', text: `${CARD_PARSE_PROMPT}\n\n${vocab.text}`, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: process.env.CLAUDE_EFFORT || m.effort, format: { type: 'json_schema', schema: CARD_PARSE_SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify({ dictation: s(text, 6000), language: lang === 'en' ? 'en' : 'pl' }) }],
  };
}

let client = null;
const getClient = () => (client ||= new Anthropic());

export async function parseCard(text, lang = 'pl', mode = 'fast') {
  if (!String(text || '').trim()) throw new ClaudeError('Brak tekstu — powiedz lub wpisz, co zostało zrobione.', 400);
  let response;
  try {
    response = await getClient().messages.create(await buildCardParseRequest(text, lang, mode));
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }
  if (response.stop_reason === 'refusal') throw new ClaudeError('AI odmówiło odczytania dyktatu.', 422);
  if (response.stop_reason === 'max_tokens') throw new ClaudeError('Odpowiedź AI została ucięta.', 502);
  const out = response.content.find((b) => b.type === 'text')?.text;
  let parsed;
  try { parsed = JSON.parse(out); } catch { throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502); }
  return normaliseCardParse(parsed, await vocabulary());
}

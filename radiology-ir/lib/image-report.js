// Report from images: angiography / fluoroscopy screenshots, photos of the monitor, exported
// frames or a PDF are read by Claude and written into the procedure template.
import Anthropic from '@anthropic-ai/sdk';
import { MODEL, ClaudeError, mergeResult } from './claude.js';

export const MAX_IMAGES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // per image, after base64 decoding (API limit)
export const MAX_PDF_BYTES = 15 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const USE_FALLBACKS = process.env.CLAUDE_FALLBACKS !== '0';

// Reading images needs more thought than polishing dictation: one effort level higher.
export const IMAGE_MODES = {
  fast: { effort: 'medium', turbo: false },
  accurate: { effort: 'high', turbo: false },
  turbo: { effort: 'medium', turbo: true },
};

export const IMAGE_PROMPT = `You are an assistant for a Polish interventional and neurointerventional radiologist. You receive images from one procedure — DSA / angiography runs, roadmaps, fluoroscopy frames, 3D rotational reconstructions, CT/MR screenshots, photos of the monitor, dose-report screens, or a PDF — and write the procedure report from them, in the radiologist's template.

You receive the images, then JSON with:
- "template": the procedure template (header, body = "Opis", conclusion = "Wnioski"). Its labelled lines ("Wskazanie:", "Lokalizacja:", "Znieczulenie:", "Dostęp:", "Sprzęt:", "Przebieg zabiegu:", "Wynik:", "Zużycie środka kontrastowego / Czas fluoroskopii / Dawka", "Powikłania:", "Zalecenia:") and its "…" placeholders are the structure to fill.
- "current_report": the report as it is now, when the radiologist already worked on it — keep everything in it and add what the images show.
- "note": optional text from the radiologist (what was done, devices, values, side). It ALWAYS has priority over what you read from the images.
- "clinical_details": optional indication / history — may fill an empty "Wskazanie" line.
- "style_profile", "own_samples": the radiologist's style — follow it; never copy findings from samples.
- "output_language": "pl" or "en" — write the whole report in it (standard Polish or English IR language; vessel and procedure abbreviations stay in English: ICA, MCA M1, AComA, PComA, BA, VA, SFA, CFA, DSA, eTICI…).

HOW TO READ THE IMAGES:
1. Identify the procedure, target vessel / organ and its segment, the lesion (e.g. saccular aneurysm of the AComA, stenosis, occlusion, bleeding, AVM), the devices visible (coils, stent, flow diverter, intrasaccular device, balloon, stent-graft, catheters, wires, embolic agent, drains) and the result on control runs (aneurysm occlusion, residual neck / sac filling, patency, recanalisation, persisting stenosis, extravasation or not).
2. Pre-treatment and post-treatment images are both true — describe the pre-treatment finding in the diagnostic part of "Przebieg zabiegu" and the control result in the control part, "Wynik" and the conclusion.
3. MEASUREMENTS:
   a. Numbers drawn on the images (measurement lines with values, calipers, QCA, scale bars, on-screen device data) are used exactly as shown, with their units.
   b. Otherwise give the BEST ESTIMATE from reference points visible in the same image and the same projection: a calibrated scale bar or marker catheter; a catheter or sheath of known size (1 F = 0,33 mm: 4 F ≈ 1,3 mm, 5 F ≈ 1,7 mm, 6 F ≈ 2,0 mm); a device of known diameter (coil loops of a dictated or labelled size, stent diameter); typical vessel calibre only as the last resort. Round sensibly (to 0,5 mm for small aneurysms, 1 mm otherwise) and write "ok." before the value in Polish ("approx." in English), e.g. "tętniak o wymiarach ok. 6 x 4 mm, szyja ok. 3 mm".
   c. For a saccular aneurysm give, when possible: dome size (height x width), neck width, dome-to-neck ratio if the radiologist's style uses it, direction of projection, daughter sac / irregularity. For a stenosis: degree as % (NASCET-type for the ICA), length. For a vessel: calibre.
   d. Never present an estimate as measured. Every value you read or estimated goes into "image_readings" with how you got it.
4. GRADES (Raymond-Roy / RROC, O'Kelly-Marotta, eTICI / mTICI, residual stenosis %, Rutherford, Spetzler-Martin, Cognard…): give your best visual grading from the control run when the images show it, and list it in "image_readings" (basis "estimated") so the radiologist confirms it.
5. SIDE AND LEVEL: state a side (prawy / lewy) only when it is certain from on-image labels (R/L markers, series names, projection text), from the note, or from unambiguous anatomy (e.g. the vessel name in the series description). If it is not certain, leave "…" and add a warning. Never guess a side.
6. WHAT THE IMAGES CANNOT SHOW: contrast volume, fluoroscopy time, dose (KAP / air kerma), anaesthesia, heparin, access site, sheath size, closure and complications outside the images stay "…" — unless the value is visible on an image (e.g. a dose-report screen, a labelled access run) or written in the note. Never fill a placeholder with a typical or assumed value.
7. COMPLICATIONS: report a complication only if it is visible (contrast extravasation, thrombus, vasospasm, dissection flap, coil protrusion / migration, non-target embolisation) or in the note. If nothing abnormal is visible on the control runs, keep the template's "bez powikłań" statement only as "w obrazach kontrolnych bez cech powikłań" if the radiologist's template uses such wording; otherwise leave "Powikłania:" for the radiologist to confirm and add a warning.
8. Remove or rewrite template statements that the images or the note contradict (wrong device type, wrong result, a success claim that the control run does not show). Keep the template's sensible sentences that are not contradicted.
9. PATIENT DATA: images may show the patient's name, PESEL, date of birth, ID numbers, hospital or operator names. NEVER copy any personal identifier into the report, the readings or the warnings.
10. If an image is unreadable, of another patient, or does not match the procedure, say so in a warning instead of guessing. Do not describe what you cannot see.

CONCLUSION ("Wnioski") — short (1–4 lines): what was done, where, the technical result (with the estimated grade, if any), then complications or important findings (e.g. a second aneurysm, residual filling). It must match the body exactly.

OUTPUT: return the complete final "header", "body" (without the "Opis:"/"Findings:" label) and "conclusion" (without the "Wnioski:"/"Conclusion:" label) in output_language; "image_readings" — every value, grade, side or device you took from the images: {"item": what it is, in Polish, e.g. "szerokość szyi tętniaka", "value": as written in the report, "basis": "measured" (value shown on the image) or "estimated" (your estimate), "how": short note in Polish on how you got it, e.g. "oszacowano względem cewnika 5 F"}; and "warnings" (in Polish) — what is uncertain or still missing.`;

export const IMAGE_SCHEMA = {
  type: 'object',
  properties: {
    header: { type: 'string' },
    body: { type: 'string' },
    conclusion: { type: 'string' },
    image_readings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          value: { type: 'string' },
          basis: { type: 'string', enum: ['measured', 'estimated'] },
          how: { type: 'string' },
        },
        required: ['item', 'value', 'basis', 'how'],
        additionalProperties: false,
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['header', 'body', 'conclusion', 'image_readings', 'warnings'],
  additionalProperties: false,
};

export const PICK_PROMPT = `You are an assistant for an interventional radiologist. From the procedure images (and the radiologist's optional note), choose the ONE template from the catalogue that best fits the procedure shown. Return its exact "id", and a short reason in Polish. If no template fits or the images do not show a procedure, return an empty id and say why in the reason.`;

export const PICK_SCHEMA = {
  type: 'object',
  properties: { template_id: { type: 'string' }, reason: { type: 'string' } },
  required: ['template_id', 'reason'],
  additionalProperties: false,
};

const base64Bytes = (b64) => Math.floor((b64.length * 3) / 4) - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);

/**
 * Images from the browser: [{ type: 'image/jpeg' | … | 'application/pdf', data: <base64> }].
 * Returns the cleaned list or throws a ClaudeError with a message for the radiologist.
 */
export function cleanImages(list) {
  if (!Array.isArray(list) || !list.length) throw new ClaudeError('Dodaj co najmniej jeden obraz.', 400);
  if (list.length > MAX_IMAGES) throw new ClaudeError(`Za dużo obrazów — najwięcej ${MAX_IMAGES} naraz.`, 400);
  return list.map((x, i) => {
    const type = String(x?.type || '');
    const data = String(x?.data || '').replace(/^data:[^,]*,/, '');
    if (!data || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) throw new ClaudeError(`Obraz ${i + 1}: nieprawidłowe dane.`, 400);
    if (type === 'application/pdf') {
      if (base64Bytes(data) > MAX_PDF_BYTES) throw new ClaudeError(`Plik PDF ${i + 1} jest za duży (najwięcej 15 MB).`, 413);
      return { type, data };
    }
    if (!IMAGE_TYPES.includes(type)) throw new ClaudeError(`Obraz ${i + 1}: nieobsługiwany format (JPG, PNG, WebP, GIF lub PDF).`, 400);
    if (base64Bytes(data) > MAX_IMAGE_BYTES) throw new ClaudeError(`Obraz ${i + 1} jest za duży (najwięcej 5 MB).`, 413);
    return { type, data };
  });
}

/** Image / PDF content blocks, each with a short label so the AI can refer to "obraz 2". */
export function imageBlocks(images) {
  const out = [];
  images.forEach((img, i) => {
    out.push({ type: 'text', text: `Obraz ${i + 1}:` });
    out.push(img.type === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: img.type, data: img.data } }
      : { type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } });
  });
  return out;
}

function withMode(params, mode) {
  const m = IMAGE_MODES[mode] || IMAGE_MODES.fast;
  params.output_config.effort = process.env.CLAUDE_EFFORT || m.effort;
  const betas = [];
  if (USE_FALLBACKS) {
    betas.push('server-side-fallback-2026-07-01');
    params.fallbacks = 'default';
  }
  if (m.turbo) {
    betas.push('fast-mode-2026-02-01');
    params.speed = 'fast';
  }
  const options = m.turbo ? { maxRetries: 0 } : undefined;
  return betas.length ? { beta: true, params: { ...params, betas }, options } : { beta: false, params, options };
}

/** The request that writes the report from the images into the template. */
export function buildImageRequest({ images, template, report = null, note = '', clinical = '', profile = null, samples = [], outputLang = 'pl', mode = 'fast' }) {
  const tpl = outputLang === 'en' && template.en ? template.en : template;
  const input = {
    template: { header: tpl.header, body: tpl.body, conclusion: tpl.conclusion },
    current_report: report ? { header: report.header, body: report.body, conclusion: report.conclusion } : null,
    note: note || '',
    clinical_details: clinical || '',
    output_language: outputLang,
  };
  if (profile) input.style_profile = { rules: profile.rules || [], phrases: profile.phrases || [] };
  if (samples.length) input.own_samples = samples;
  return withMode({
    model: MODEL,
    max_tokens: 16000,
    system: [{ type: 'text', text: IMAGE_PROMPT, cache_control: { type: 'ephemeral' } }],
    output_config: { format: { type: 'json_schema', schema: IMAGE_SCHEMA } },
    messages: [{ role: 'user', content: [...imageBlocks(images), { type: 'text', text: JSON.stringify(input, null, 2) }] }],
  }, mode);
}

/** The request that picks a template when none is selected yet. */
export function buildPickRequest({ images, catalog, note = '', mode = 'fast' }) {
  return withMode({
    model: MODEL,
    max_tokens: 2000,
    system: [{ type: 'text', text: PICK_PROMPT }],
    output_config: { format: { type: 'json_schema', schema: PICK_SCHEMA } },
    messages: [{ role: 'user', content: [...imageBlocks(images), { type: 'text', text: JSON.stringify({ note: note || '', catalogue: catalog }, null, 2) }] }],
  }, mode === 'accurate' ? 'fast' : mode);
}

/** Readings → warning lines, so the radiologist sees what came from the images. */
export function readingWarnings(readings) {
  if (!Array.isArray(readings)) return [];
  const list = readings.filter((r) => r && r.item && r.value);
  const est = list.filter((r) => r.basis !== 'measured');
  const meas = list.filter((r) => r.basis === 'measured');
  const line = (r) => `${r.item}: ${r.value}${r.how ? ` (${r.how})` : ''}`;
  const out = [];
  if (est.length) out.push(`Oszacowano z obrazu — sprawdź: ${est.map(line).join('; ')}.`);
  if (meas.length) out.push(`Odczytano z pomiarów na obrazie: ${meas.map(line).join('; ')}.`);
  return out;
}

let client = null;
function getClient() {
  if (!client) client = new Anthropic();
  return client;
}
async function send(req) {
  return req.beta ? getClient().beta.messages.create(req.params, req.options) : getClient().messages.create(req.params, req.options);
}

async function call(build, mode) {
  let response;
  try {
    try {
      response = await send(build(mode));
    } catch (err) {
      if (mode === 'turbo' && (err instanceof Anthropic.RateLimitError || err instanceof Anthropic.BadRequestError)) response = await send(build('fast'));
      else throw err;
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ClaudeError('Nieprawidłowy klucz API Anthropic.', 401);
    if (err instanceof Anthropic.RateLimitError) throw new ClaudeError('Przekroczono limit zapytań do AI — spróbuj za chwilę.', 429);
    if (err instanceof Anthropic.BadRequestError) throw new ClaudeError(`Błąd zapytania do AI: ${err.message}`, 400);
    if (err instanceof Anthropic.APIConnectionError) throw new ClaudeError('Brak połączenia z serwerem AI.', 503);
    if (err instanceof Anthropic.APIError) throw new ClaudeError(`Błąd AI (${err.status}): ${err.message}`, 502);
    throw err;
  }
  if (response.stop_reason === 'refusal') throw new ClaudeError('AI odmówiło przetworzenia tych obrazów.', 422);
  if (response.stop_reason === 'max_tokens') throw new ClaudeError('Odpowiedź AI została ucięta — spróbuj z mniejszą liczbą obrazów.', 502);
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) throw new ClaudeError('AI nie zwróciło tekstu.', 502);
  try {
    return { parsed: JSON.parse(textBlock.text), model: response.model };
  } catch {
    throw new ClaudeError('Nie udało się odczytać odpowiedzi AI.', 502);
  }
}

/** Choose a template id from the catalogue ([{ id, title }]); '' when none fits. */
export async function pickTemplate({ images, catalog, note = '', mode = 'fast' }) {
  const { parsed } = await call((m) => buildPickRequest({ images, catalog, note, mode: m }), mode);
  const id = String(parsed.template_id || '');
  return { id: catalog.some((c) => c.id === id) ? id : '', reason: String(parsed.reason || '') };
}

/** Write the report from the images. */
export async function reportFromImages({ images, template, report = null, note = '', clinical = '', profile = null, samples = [], outputLang = 'pl', mode = 'fast' }) {
  const { parsed, model } = await call((m) => buildImageRequest({ images, template, report, note, clinical, profile, samples, outputLang, mode: m }), mode);
  return finishImageResult(template, report, parsed, { outputLang, model });
}

/** Shared tail (also used by the tests): cross-check, then the readings as warnings. */
export function finishImageResult(template, report, parsed, { outputLang = 'pl', model = MODEL } = {}) {
  const tpl = outputLang === 'en' && template.en ? template.en : template;
  const start = report || { header: tpl.header, body: tpl.body, conclusion: tpl.conclusion };
  const merged = mergeResult(template, { ...start, templateId: template.id, lang: outputLang }, { ...parsed, corrections: [] }, { outputLang });
  const readings = (Array.isArray(parsed.image_readings) ? parsed.image_readings : []).map((r) => ({
    item: String(r?.item || ''), value: String(r?.value || ''), basis: r?.basis === 'measured' ? 'measured' : 'estimated', how: String(r?.how || ''),
  }));
  return {
    report: { ...merged.report, templateId: template.id },
    corrections: [],
    warnings: [...readingWarnings(readings), ...merged.warnings],
    readings,
    model,
  };
}

// Template catalogue: parsing, grouping (trauma / non-trauma → anatomical region), snippets
// and plain-text export in the template's own format.
import { TEMPLATE_DATA as BASE_DATA } from './template-data.js';
import NEURO from './templates-pro/neuro-headneck.js';
import CHEST from './templates-pro/chest-vascular.js';
import ABDOMEN from './templates-pro/abdomen.js';
import MSK from './templates-pro/msk-spine-xray.js';
import MRUS from './templates-pro/mr-neuro-us.js';
import MRBODY2 from './templates-pro/mr-body-msk-2.js';
import MRNEURO2 from './templates-pro/mr-neuro-spine-2.js';
import XRAY2 from './templates-pro/xray-2.js';

// The radiologist's own set first, then the extended library.
const TEMPLATE_DATA = [...BASE_DATA, ...NEURO, ...CHEST, ...ABDOMEN, ...MSK, ...MRUS, ...MRBODY2, ...MRNEURO2, ...XRAY2];

export const GROUPS = [
  { id: 'Trauma', label: 'Uraz' },
  { id: 'Non-trauma', label: 'Bez urazu' },
];

// Anatomical order, head to pelvis; combined studies last.
export const REGIONS = [
  { id: 'CT Head', label: 'Głowa' },
  { id: 'Facial bones', label: 'Twarzoczaszka' },
  { id: 'Neck', label: 'Szyja' },
  { id: 'Vascular / Neuro', label: 'Naczynia głowy i szyi' },
  { id: 'Spine', label: 'Kręgosłup' },
  { id: 'Chest / Thorax', label: 'Klatka piersiowa' },
  { id: 'Heart', label: 'Serce' },
  { id: 'Aorta / Vascular', label: 'Aorta i naczynia' },
  { id: 'Abdomen / Pelvis', label: 'Jama brzuszna i miednica' },
  { id: 'Pelvis / Hips', label: 'Miednica kostna i biodra' },
  { id: 'Upper limb', label: 'Kończyna górna' },
  { id: 'Lower limb', label: 'Kończyna dolna' },
  { id: 'Paediatric', label: 'Dzieci' },
  { id: 'Combined', label: 'Badania łączone' },
  { id: 'Other', label: 'Inne' },
];

export const SNIPPET_GROUPS = [
  { id: 'Head snippets', label: 'Głowa' },
  { id: 'Trauma snippets', label: 'Uraz' },
  { id: 'Chest snippets', label: 'Klatka piersiowa' },
  { id: 'Abdomen snippets', label: 'Jama brzuszna' },
  { id: 'Vascular snippets', label: 'Naczynia' },
  { id: 'MSK snippets', label: 'Układ ruchu' },
  { id: 'General snippets', label: 'Ogólne' },
];

const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.title.localeCompare(b.title);

const BUILTIN = TEMPLATE_DATA.filter((t) => t.group !== 'Snippets');
// TEMPLATES is updated in place when the user's own / edited templates change.
export const TEMPLATES = BUILTIN.map(parseTemplate);
export const SNIPPETS = TEMPLATE_DATA.filter((t) => t.group === 'Snippets').sort(byPriority);

export function getTemplate(id) {
  if (isCombo(id)) return combinedTemplate(comboParts(id));
  return TEMPLATES.find((t) => t.id === id) || null;
}

// ---------------------------------------------------------------- combined studies
// Two or more templates chosen together (e.g. thoracic + lumbar spine in one examination) become ONE template:
// one header naming every part, one description with a sub-heading per part, one conclusion. Its id lists the parts
// ("combo:ct_t_spine_trauma+ct_l_spine"), so it is rebuilt from the current templates wherever it is used.
const COMBO = 'combo:';
export const isCombo = (id) => typeof id === 'string' && id.startsWith(COMBO);
export const comboId = (ids) => `${COMBO}${ids.join('+')}`;
export const comboParts = (id) => (isCombo(id) ? id.slice(COMBO.length).split('+').filter(Boolean) : []);
const examName = (t) => String(t.exam || t.header || '').replace(/^\s*(Badanie|Examination)\s*:\s*/i, '').replace(/:\s*$/, '').trim();

/** "TK kręgosłupa piersiowego bez kontrastu" + "TK kręgosłupa lędźwiowego bez kontrastu" → "TK kręgosłupa piersiowego oraz kręgosłupa lędźwiowego bez kontrastu". Pure, for tests. */
export function joinExams(names) {
  const words = names.map((n) => n.split(/\s+/).filter(Boolean));
  if (words.length < 2 || words.some((w) => !w.length)) return names.join(' oraz ');
  const head = words.every((w) => w[0] === words[0][0]) ? words[0][0] : '';
  let tail = 0;
  while (words.every((w) => w.length - (head ? 1 : 0) - tail > 1 && w[w.length - 1 - tail] === words[0][words[0].length - 1 - tail])) tail++;
  const middles = words.map((w) => w.slice(head ? 1 : 0, w.length - tail).join(' '));
  const list = middles.length > 2 ? `${middles.slice(0, -1).join(', ')} oraz ${middles[middles.length - 1]}` : middles.join(' oraz ');
  return [head, list, ...words[0].slice(words[0].length - tail)].filter(Boolean).join(' ');
}
/** A sub-heading the description can carry (letters, spaces, commas, slashes and hyphens only, ends with ":"). */
const sectionHeading = (t) => {
  const h = examName(t).replace(/[–—]/g, '-').replace(/[^\p{L} ,/-]+/gu, ' ').replace(/\s+/g, ' ').trim();
  return `${h.charAt(0).toUpperCase()}${h.slice(1)}:`;
};
let comboCache = new Map();
/** The combined template of the given template ids (null if fewer than two exist). */
export function combinedTemplate(ids) {
  const parts = [...new Set(ids)].map((x) => (isCombo(x) ? null : getTemplate(x))).filter(Boolean);
  if (parts.length < 2) return parts[0] || null;
  const id = comboId(parts.map((t) => t.id));
  if (comboCache.has(id)) return comboCache.get(id);
  const header = `Badanie: ${joinExams(parts.map(examName))}`;
  // technique lines („Badanie wykonano w trybie ostrodyżurowym.”) once, above the parts
  const INTRO = /^(Badanie wykonano|Wykonano|Badanie przeprowadzono|Porównano)/i;
  const intro = [];
  const bodies = parts.map((t) => {
    const lines = t.body.trim().split('\n');
    while (lines.length && (INTRO.test(lines[0].trim()) || (!lines[0].trim() && intro.length))) {
      const l = lines.shift().trim();
      if (l && !intro.includes(l)) intro.push(l);
    }
    return lines.join('\n').trim();
  });
  const body = [...(intro.length ? [intro.join('\n')] : []), ...parts.map((t, i) => `${sectionHeading(t)}\n${bodies[i]}`)].join('\n\n');
  const seen = new Set();
  const lines = [];
  for (const t of parts) {
    for (const l of t.conclusion.split('\n')) {
      const text = l.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim();
      if (text && !seen.has(text.toLowerCase())) { seen.add(text.toLowerCase()); lines.push(text); }
    }
  }
  const conclusion = formatConclusion(lines, parts[0].bullet);
  const t = parseTemplate({
    id, title: parts.map((x) => x.title).join(' + '), group: parts.some((x) => x.group === 'Trauma') ? 'Trauma' : 'Non-trauma',
    section: 'Combined', priority: 50, text: `${header}\nOpis:\n${body}\n\nWnioski:\n${conclusion}`,
  });
  t.combo = parts.map((x) => x.id);
  comboCache.set(id, t);
  return t;
}

export const isBuiltin = (id) => BUILTIN.some((t) => t.id === id);
export const builtinRaw = (id) => BUILTIN.find((t) => t.id === id) || null;

/** The raw fields of a template ({ id, title, group, section, priority, text }). */
export const rawOf = (t) => ({ id: t.id, title: t.title, group: t.group, section: t.section, priority: t.priority ?? 50, text: t.text });

/** Validate a raw template coming from the user, an import file or the browser. */
export function cleanRaw(t) {
  if (!t || typeof t !== 'object') return null;
  const text = String(t.text || '').replace(/\r/g, '').trim();
  const title = String(t.title || '').trim().slice(0, 120);
  if (!text || !title || text.length > 20000) return null;
  return {
    id: String(t.id || '').slice(0, 80) || `custom_${Date.now()}`,
    title,
    group: t.group === 'Trauma' ? 'Trauma' : 'Non-trauma',
    section: REGIONS.some((r) => r.id === t.section) ? t.section : 'Other',
    priority: Number.isFinite(t.priority) ? t.priority : 50,
    text,
  };
}

/**
 * Apply the user's templates: { edited: { id: raw }, custom: [raw], deleted: [id] }.
 * Edited built-ins replace the originals; custom ones are added; deleted built-ins are hidden.
 */
// Names retired because they could offend ("OLD" for a head CT with age-related atrophy). A copy the user
// edited before the rename takes the current name, unless they had renamed it themselves.
const RETIRED_TITLES = new Set(["CT Head + C-spine trauma OLD", "CT Head + Facial bones + C-spine trauma OLD", "CT Head + Facial bones trauma OLD", "CT Head normal OLD", "CT Head trauma OLD"]);

export function setUserTemplates(user = {}) {
  const edited = user.edited || {};
  const deleted = new Set(user.deleted || []);
  const list = BUILTIN.filter((t) => !deleted.has(t.id)).map((t) => {
    const e = cleanRaw(edited[t.id]);
    if (e && RETIRED_TITLES.has(e.title)) e.title = t.title;
    return parseTemplate(e ? { ...e, id: t.id, edited: true } : t);
  });
  for (const c of user.custom || []) {
    const raw = cleanRaw(c);
    if (raw && !list.some((t) => t.id === raw.id)) list.push(parseTemplate({ ...raw, custom: true }));
  }
  TEMPLATES.splice(0, TEMPLATES.length, ...list);
  comboCache = new Map(); // combined templates are rebuilt from the changed parts
}

export function regionLabel(sectionId) {
  return REGIONS.find((r) => r.id === sectionId)?.label || sectionId;
}

/** Templates of one group, bucketed by region in anatomical order. */
export function templatesByRegion(groupId) {
  return REGIONS.map((r) => ({
    ...r,
    templates: TEMPLATES.filter((t) => t.group === groupId && t.section === r.id).sort(byPriority),
  })).filter((r) => r.templates.length);
}

/**
 * Split template text into header / body / conclusion.
 * Handles "Badanie: X", "X:" and plain first-line headers, with or without "Opis:".
 */
export function parseTemplate(raw) {
  const text = String(raw.text || '').replace(/\r/g, '');
  const lines = text.split('\n');
  const header = lines[0].trim();
  let rest = lines.slice(1).join('\n');
  const hasOpis = /^\s*Opis:\s*$/m.test(rest);
  if (hasOpis) rest = rest.replace(/^\s*Opis:\s*$/m, '');
  const wIdx = rest.search(/^\s*Wnioski:\s*$/m);
  const body = (wIdx >= 0 ? rest.slice(0, wIdx) : rest).replace(/^\n+|\s+$/g, '');
  const conclusion = wIdx >= 0 ? rest.slice(wIdx).replace(/^\s*Wnioski:\s*\n?/, '').replace(/\s+$/, '') : '';
  const exam = header.replace(/^Badanie:\s*/i, '').replace(/:\s*$/, '');
  return {
    ...raw,
    header,
    exam,
    body,
    conclusion,
    hasOpis,
    bullet: /^\s*\d+\./m.test(conclusion) ? 'number' : 'dash',
  };
}

/** Fresh report from a template. */
export function reportFromTemplate(t) {
  return { templateId: t.id, header: t.header, body: t.body, conclusion: t.conclusion, lang: 'pl' };
}

export const SECTION_LABELS = {
  pl: { body: 'Opis', conclusion: 'Wnioski', clinical: 'Dane kliniczne' },
  en: { body: 'Findings', conclusion: 'Conclusion', clinical: 'Clinical details' },
};

/** Plain text in the same layout as the template (for the clipboard / RIS). */
export function reportToText(report, template) {
  const L = SECTION_LABELS[report.lang === 'en' ? 'en' : 'pl'];
  const parts = [report.header.trim()];
  // clinical details entered for this study go into the report, under their own heading
  if (String(report.clinical || '').trim()) parts.push(`${L.clinical}: ${report.clinical.trim()}`);
  const body = report.body.trim();
  if (body) parts.push(template?.hasOpis === false ? body : `${L.body}:\n${body}`);
  if (report.conclusion.trim()) parts.push(`${L.conclusion}:\n${report.conclusion.trim()}`);
  return parts.join('\n\n');
}

/** Format conclusion lines in the template's bullet style. */
export function formatConclusion(lines, style = 'dash', start = 1) {
  return lines
    .map((l) => l.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .map((l, i) => (style === 'number' ? `${start + i}. ${l}` : `- ${l}`))
    .join('\n');
}

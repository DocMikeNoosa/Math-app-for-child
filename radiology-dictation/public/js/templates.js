// Template catalogue: parsing, grouping (trauma / non-trauma → anatomical region), snippets
// and plain-text export in the template's own format.
import { TEMPLATE_DATA } from './template-data.js';

export const GROUPS = [
  { id: 'Trauma', label: 'Uraz' },
  { id: 'Non-trauma', label: 'Bez urazu' },
];

// Anatomical order, head to pelvis; combined studies last.
export const REGIONS = [
  { id: 'CT Head', label: 'Głowa' },
  { id: 'Facial bones', label: 'Twarzoczaszka' },
  { id: 'Vascular / Neuro', label: 'Naczynia głowy i szyi' },
  { id: 'Spine', label: 'Kręgosłup' },
  { id: 'Chest / Thorax', label: 'Klatka piersiowa' },
  { id: 'Aorta / Vascular', label: 'Aorta' },
  { id: 'Abdomen / Pelvis', label: 'Jama brzuszna i miednica' },
  { id: 'Combined', label: 'Badania łączone' },
  { id: 'Other', label: 'Inne' },
];

export const SNIPPET_GROUPS = [
  { id: 'Head snippets', label: 'Głowa' },
  { id: 'Trauma snippets', label: 'Uraz' },
  { id: 'General snippets', label: 'Ogólne' },
];

const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.title.localeCompare(b.title);

const BUILTIN = TEMPLATE_DATA.filter((t) => t.group !== 'Snippets');
// TEMPLATES is updated in place when the user's own / edited templates change.
export const TEMPLATES = BUILTIN.map(parseTemplate);
export const SNIPPETS = TEMPLATE_DATA.filter((t) => t.group === 'Snippets').sort(byPriority);

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
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
export function setUserTemplates(user = {}) {
  const edited = user.edited || {};
  const deleted = new Set(user.deleted || []);
  const list = BUILTIN.filter((t) => !deleted.has(t.id)).map((t) => {
    const e = cleanRaw(edited[t.id]);
    return parseTemplate(e ? { ...e, id: t.id, edited: true } : t);
  });
  for (const c of user.custom || []) {
    const raw = cleanRaw(c);
    if (raw && !list.some((t) => t.id === raw.id)) list.push(parseTemplate({ ...raw, custom: true }));
  }
  TEMPLATES.splice(0, TEMPLATES.length, ...list);
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
  pl: { body: 'Opis', conclusion: 'Wnioski' },
  en: { body: 'Findings', conclusion: 'Conclusion' },
};

/** Plain text in the same layout as the template (for the clipboard / RIS). */
export function reportToText(report, template) {
  const L = SECTION_LABELS[report.lang === 'en' ? 'en' : 'pl'];
  const parts = [report.header.trim()];
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

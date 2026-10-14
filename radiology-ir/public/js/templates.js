// Template catalogue (interventional radiology): parsing, grouping (vascular / non-vascular / neuro
// → section), snippets, Polish / English versions and plain-text export in the template's own format.
import IR_TEMPLATES from './templates-ir/index.js';
import { GROUPS as G, REGIONS as R, SNIPPET_GROUPS as S } from './sections.js';

const TEMPLATE_DATA = IR_TEMPLATES;

// Menu language: 'pl' (default) or 'en' — template names and template text.
let menuLang = 'pl';
export const setMenuLang = (lang) => { menuLang = lang === 'en' ? 'en' : 'pl'; };
export const getMenuLang = () => menuLang;
const pick = (label) => (Array.isArray(label) ? label[menuLang === 'en' ? 1 : 0] : label);

// Labels follow the menu language (getters, so existing code reading .label keeps working).
const withLabel = (x) => ({ ...x, labels: x.label, get label() { return pick(this.labels); } });
export const GROUPS = G.map(withLabel);
export const REGIONS = R.map(withLabel);
export const SNIPPET_GROUPS = S.map(withLabel);
export const groupLabel = (id) => GROUPS.find((g) => g.id === id)?.label || id;

/** Menu name of a template in the current menu language. */
export const titleOf = (t) => (t && menuLang === 'en' && t.titleEn ? t.titleEn : t?.title || '');

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
export const rawOf = (t) => ({ id: t.id, title: t.title, group: t.group, section: t.section, priority: t.priority ?? 50, text: t.text, ...(t.titleEn ? { titleEn: t.titleEn } : {}), ...(t.textEn ? { textEn: t.textEn } : {}), ...(t.proc ? { proc: t.proc } : {}), ...(t.anat ? { anat: t.anat } : {}) });

/** Validate a raw template coming from the user, an import file or the browser. */
export function cleanRaw(t) {
  if (!t || typeof t !== 'object') return null;
  const text = String(t.text || '').replace(/\r/g, '').trim();
  const title = String(t.title || '').trim().slice(0, 120);
  if (!text || !title || text.length > 20000) return null;
  return {
    id: String(t.id || '').slice(0, 80) || `custom_${Date.now()}`,
    title,
    group: GROUPS.some((g) => g.id === t.group) ? t.group : 'Vascular',
    section: REGIONS.some((r) => r.id === t.section) ? t.section : 'Other',
    priority: Number.isFinite(t.priority) ? t.priority : 50,
    text,
    ...(typeof t.titleEn === 'string' && t.titleEn.trim() ? { titleEn: t.titleEn.trim().slice(0, 120) } : {}),
    ...(typeof t.textEn === 'string' && t.textEn.trim() && t.textEn.length <= 20000 ? { textEn: t.textEn.replace(/\r/g, '').trim() } : {}),
    ...(Array.isArray(t.proc) ? { proc: t.proc.filter((x) => typeof x === 'string').slice(0, 10) } : {}),
    ...(Array.isArray(t.anat) ? { anat: t.anat.filter((x) => typeof x === 'string').slice(0, 10) } : {}),
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
    id: r.id,
    label: r.label,
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
  const hasOpis = /^\s*(Opis|Findings|Description):\s*$/m.test(rest);
  if (hasOpis) rest = rest.replace(/^\s*(Opis|Findings|Description):\s*$/m, '');
  const wIdx = rest.search(/^\s*(Wnioski|Conclusion|Conclusions):\s*$/m);
  const body = (wIdx >= 0 ? rest.slice(0, wIdx) : rest).replace(/^\n+|\s+$/g, '');
  const conclusion = wIdx >= 0 ? rest.slice(wIdx).replace(/^\s*(Wnioski|Conclusions?):\s*\n?/, '').replace(/\s+$/, '') : '';
  const exam = header.replace(/^(Badanie|Procedure|Examination):\s*/i, '').replace(/:\s*$/, '');
  // the English version of a bilingual template
  const en = raw.textEn && !raw.isEn ? parseTemplate({ id: raw.id, text: raw.textEn, isEn: true }) : null;
  return {
    ...raw,
    ...(en ? { en: { header: en.header, body: en.body, conclusion: en.conclusion, exam: en.exam } } : {}),
    header,
    exam,
    body,
    conclusion,
    hasOpis,
    bullet: /^\s*\d+\./m.test(conclusion) ? 'number' : 'dash',
  };
}

/** Fresh report from a template. */
export function reportFromTemplate(t, lang = 'pl') {
  if (lang === 'en' && t.en) return { templateId: t.id, header: t.en.header, body: t.en.body, conclusion: t.en.conclusion, lang: 'en' };
  return { templateId: t.id, header: t.header, body: t.body, conclusion: t.conclusion, lang: 'pl' };
}

/** True when the report is still exactly the template (in either language). */
export function isPristine(report, t) {
  if (!t) return true;
  const eq = (a, b) => a.header === b.header && a.body === b.body && a.conclusion === b.conclusion;
  return eq(report, reportFromTemplate(t, 'pl')) || Boolean(t.en && eq(report, reportFromTemplate(t, 'en')));
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

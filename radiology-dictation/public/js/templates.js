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
];

export const SNIPPET_GROUPS = [
  { id: 'Head snippets', label: 'Głowa' },
  { id: 'Trauma snippets', label: 'Uraz' },
  { id: 'General snippets', label: 'Ogólne' },
];

const byPriority = (a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.title.localeCompare(b.title);

export const TEMPLATES = TEMPLATE_DATA.filter((t) => t.group !== 'Snippets').map(parseTemplate);
export const SNIPPETS = TEMPLATE_DATA.filter((t) => t.group === 'Snippets').sort(byPriority);

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
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

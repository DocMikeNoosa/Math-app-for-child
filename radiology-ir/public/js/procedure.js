// Procedure-report rules (interventional radiology). Shared by the server (after the AI) and the
// browser (local mode without AI). Unlike diagnostic reports, nothing is re-ordered or pruned
// automatically: a procedure report states what was found BEFORE and what was achieved AFTER
// treatment, and both are true.
import { normalizeDictation, tidy } from './polish-text.js';
import { splitSentences } from './crosscheck.js';

// Labelled lines of the templates, Polish and English.
export const FIELDS = [
  { key: 'indication', pl: 'Wskazanie', en: 'Indication', re: /^wskazani\p{L}*|^indication/iu },
  { key: 'target', pl: 'Lokalizacja', en: 'Target', re: /^lokalizacj\p{L}*|^naczyni\p{L}* docelow\p{L}*|^target/iu },
  { key: 'anaesthesia', pl: 'Znieczulenie', en: 'Anaesthesia', re: /^znieczuleni\p{L}*|^sedacj\p{L}*|^ana?esthesia|^sedation/iu },
  { key: 'access', pl: 'Dostęp', en: 'Access', re: /^dostęp\p{L}*|^access/iu },
  { key: 'devices', pl: 'Sprzęt', en: 'Devices', re: /^sprzęt\p{L}*|^materiał\p{L}*|^devices?|^equipment/iu },
  { key: 'result', pl: 'Wynik', en: 'Result', re: /^wynik\p{L}*|^result/iu },
  { key: 'dose', pl: 'Zużycie środka kontrastowego', en: 'Contrast', re: /^zużyci\p{L}* (środka )?kontrast\p{L}*|^kontrast\p{L}*|^contrast|^dawk\p{L}*|^dose|^czas fluoroskopii|^fluoroscopy time/iu },
  { key: 'complications', pl: 'Powikłania', en: 'Complications', re: /^powikłani\p{L}*|^complications?/iu },
  { key: 'recommendations', pl: 'Zalecenia', en: 'Recommendations', re: /^zaleceni\p{L}*|^recommendations?/iu },
];
const NARRATIVE = { pl: 'Przebieg zabiegu:', en: 'Procedure details:' };
// Lines whose "…" matter for the record (shown in the "still missing" warning).
const KEY_FIELDS = ['target', 'access', 'devices', 'result', 'dose', 'complications'];

/** The labelled field a body line belongs to ("Dostęp: …", "Dawka (DLP): …"), or null. */
function fieldOfLine(line) {
  const m = line.trim().match(/^([^:]{2,40}):/u);
  return m ? FIELDS.find((f) => f.re.test(m[1].trim())) || null : null;
}

/** Names of key lines (and the conclusion) that still contain the "…" placeholder. */
export function missingValues(report) {
  const lang = report.lang === 'en' ? 'en' : 'pl';
  const out = [];
  for (const line of String(report.body || '').split('\n')) {
    const f = fieldOfLine(line);
    if (f && KEY_FIELDS.includes(f.key) && line.includes('…')) {
      if (f.key === 'dose') out.push(lang === 'en' ? 'contrast / fluoroscopy time / dose' : 'kontrast / czas fluoroskopii / dawka');
      else out.push(f[lang].toLowerCase());
    }
  }
  if (String(report.conclusion || '').includes('…')) out.push(lang === 'en' ? 'conclusion' : 'wnioski');
  return [...new Set(out)];
}

/** Safety net after the AI: never an empty conclusion; list the values still missing. */
export function checkProcedure(template, report, lang = 'pl') {
  const warnings = [];
  let next = { ...report };
  if (!String(next.conclusion || '').split('\n').some((l) => l.replace(/^\s*(?:[-–•]|\d+[.)])\s*/, '').trim())) {
    const tplConclusion = lang === 'en' && template.en ? template.en.conclusion : template.conclusion;
    next = { ...next, conclusion: tplConclusion };
    warnings.push('Wnioski były puste — wstawiono wnioski z szablonu; zweryfikuj je.');
  }
  const missing = missingValues({ ...next, lang });
  if (missing.length) warnings.push(`Uzupełnij (zostało „…”): ${missing.join(', ')}.`);
  return { report: next, corrections: [], warnings };
}

const CONCLUSION_RE = /^(wnios\p{L}*|podsumow\p{L}*|konkluzj\p{L}*|conclusions?|impression)[\s:,–-]*/iu;

/** The value of a dictated "Dostęp: prawa tętnica udowa" sentence, or null. */
function dictatedField(sentence) {
  const s = sentence.trim();
  for (const f of FIELDS) {
    const m = s.match(new RegExp(`^(?:${f.re.source})[\\s:,–-]+`, 'iu'));
    if (m && s.length > m[0].length) return { field: f, value: s.slice(m[0].length) };
  }
  return null;
}

/**
 * Local merge without AI: "Dostęp …", "Sprzęt …" etc. fill their labelled line, "wnioski …"
 * replaces the conclusion, everything else is added to the end of the procedure narrative.
 */
export function localProcedureMerge(template, report, dictation) {
  const lang = report.lang === 'en' ? 'en' : 'pl';
  const lines = String(report.body || '').split('\n');
  const narrative = [];
  const conclusion = [];
  let inConclusion = false;
  for (let s of splitSentences(normalizeDictation(dictation))) {
    if (CONCLUSION_RE.test(s)) {
      inConclusion = true;
      s = tidy(s.replace(CONCLUSION_RE, ''));
      if (!s || s === '.') continue;
    }
    if (inConclusion) { conclusion.push(s); continue; }
    const d = dictatedField(s);
    if (d) {
      const i = lines.findIndex((l) => fieldOfLine(l)?.key === d.field.key);
      // tidy() capitalises; after "Dostęp:" the value continues in lower case (acronyms such as "USG" stay)
      let value = tidy(d.value);
      if (!/^\p{Lu}{2}/u.test(value)) value = value.charAt(0).toLowerCase() + value.slice(1);
      if (i >= 0) {
        const label = lines[i].slice(0, lines[i].indexOf(':') + 1);
        // the dose line holds three values: keep it and add the dictated one
        lines[i] = d.field.key === 'dose' && !lines[i].includes('…') ? `${lines[i]} ${tidy(d.value)}` : `${label} ${value}`;
        continue;
      }
    }
    narrative.push(s);
  }
  if (narrative.length) {
    // after the last line of the narrative = before the first labelled line that follows it
    let at = lines.findIndex((l) => l.trim() === NARRATIVE[lang] || l.trim() === NARRATIVE.pl || l.trim() === NARRATIVE.en);
    if (at < 0) at = lines.length - 1;
    else {
      let j = at + 1;
      while (j < lines.length && lines[j].trim() && !fieldOfLine(lines[j])) j++;
      at = j - 1;
    }
    lines.splice(at + 1, 0, narrative.join(' '));
  }
  let concl = report.conclusion;
  if (conclusion.length) concl = conclusion.map((s) => `- ${s}`).join('\n');
  const next = { ...report, body: lines.join('\n'), conclusion: concl };
  const checked = checkProcedure(template, next, lang);
  return { report: checked.report, warnings: checked.warnings, corrections: [] };
}

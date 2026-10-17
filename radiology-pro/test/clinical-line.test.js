// Clinical details entered for a study go into the report under „Dane kliniczne:” (rewritten by the AI, tidied by the
// app without AI) — never into the description or the conclusion; they also steer clinical relevance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate, reportFromTemplate, reportToText } from '../public/js/templates.js';
import { SYSTEM_PROMPT, OUTPUT_SCHEMA, EDITS_SCHEMA, mergeEditsResult, mergeResult } from '../lib/claude.js';

const t = getTemplate('ct_kub_noncontrast');

test('the report text has „Dane kliniczne:” right under the examination line, only when given', () => {
  const r = reportFromTemplate(t);
  assert.doesNotMatch(reportToText(r, t), /Dane kliniczne/);
  const txt = reportToText({ ...r, clinical: 'Kolka nerkowa lewostronna, gorączka 38,5°C.' }, t);
  const lines = txt.split('\n');
  assert.match(lines[0], /^Badanie:/);
  assert.equal(lines[2], 'Dane kliniczne: Kolka nerkowa lewostronna, gorączka 38,5°C.');
  assert.match(reportToText({ ...r, lang: 'en', clinical: 'Left renal colic.' }, t), /\nClinical details: Left renal colic\./);
});

test('the AI returns the rewritten clinical details separately; the server puts them on the report', () => {
  assert.ok(OUTPUT_SCHEMA.required.includes('clinical_details'));
  assert.ok(EDITS_SCHEMA.required.includes('clinical_details'));
  assert.match(SYSTEM_PROMPT, /"clinical_details" \(both modes\)/);
  assert.match(SYSTEM_PROMPT, /never copy it into the body or the conclusion/);
  assert.match(SYSTEM_PROMPT, /CLINICAL DETAILS decide relevance/);
  const r = reportFromTemplate(t);
  const out = mergeEditsResult(t, r, { edits: [], conclusion: r.conclusion, clinical_details: 'Kolka nerkowa lewostronna.', warnings: [] }, { clinical: 'kolka nerkowa lewostronna' });
  assert.equal(out.report.clinical, 'Kolka nerkowa lewostronna.');
  assert.doesNotMatch(out.report.body, /Kolka/);
  const none = mergeResult(t, r, { header: r.header, body: r.body, conclusion: r.conclusion, clinical_details: 'zmyślone', corrections: [], warnings: [] }, {});
  assert.equal(none.report.clinical, '', 'no clinical details given → no line, whatever the AI returned');
});

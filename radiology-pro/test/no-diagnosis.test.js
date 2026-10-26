// The AI never diagnoses: it only restates and summarises what the radiologist dictated (and the template's own
// still-true lines). No inferred diagnosis, differential, classification, interpretation, recommendation or
// normal / negative statement of its own — in the AI instructions and in the app's own safety code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';
import { enforceConsistency } from '../public/js/crosscheck.js';

test('the AI instructions forbid diagnosing and allow only a summary without changing the meaning', () => {
  assert.match(SYSTEM_PROMPT, /NO DIAGNOSIS — THE MOST IMPORTANT RULE/);
  assert.match(SYSTEM_PROMPT, /must NOT become "udar niedokrwienny"/);
  assert.match(SYSTEM_PROMPT, /changing the meaning is not/);
  assert.match(SYSTEM_PROMPT, /Never compute, infer or suggest one yourself/);
  assert.match(SYSTEM_PROMPT, /Never write a new normal \/ negative statement of your own/);
  assert.match(SYSTEM_PROMPT, /do NOT write "Bez cech zapalenia wyrostka robaczkowego\."/);
  // the old permissions are gone
  assert.doesNotMatch(SYSTEM_PROMPT, /clearly implied/);
  assert.doesNotMatch(SYSTEM_PROMPT, /add the category to that finding's conclusion line/);
  assert.doesNotMatch(SYSTEM_PROMPT, /you may add one short negative conclusion line/);
});

const template = { id: 'x', header: 'Badanie: TK', body: 'Wątroba prawidłowej wielkości.', conclusion: '', bullet: 'dash' };

test('the app never writes a normal statement of its own: empty conclusion → warning for the radiologist', () => {
  const r = enforceConsistency(template, { header: template.header, body: template.body, conclusion: '' });
  assert.equal(r.report.conclusion.trim(), '');
  assert.ok(r.warnings.some((w) => /Wnioski: brak/.test(w)));
});

test("…but the radiologist's own template normal line is kept when nothing contradicts it", () => {
  const t = { ...template, conclusion: '- Bez cech ostrej patologii w zakresie badania.' };
  const r = enforceConsistency(t, { header: t.header, body: `${t.body}\nZmiany naczyniopochodne w istocie białej.`, conclusion: '' });
  assert.equal(r.report.conclusion, t.conclusion, 'age-related change does not contradict "acute"');
});

// Combined studies (e.g. thoracic + lumbar spine in one examination): one template built from several, with one
// header, a sub-heading per part, one conclusion without repeated lines; the emergency picker list exists.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate, comboId, comboParts, isCombo, combinedTemplate, joinExams, reportFromTemplate, reportToText, parseTemplate, cleanRaw } from '../public/js/templates.js';
import { SYSTEM_PROMPT } from '../lib/claude.js';
import { enforceConsistency } from '../public/js/crosscheck.js';

test('joining examination names: shared modality and contrast written once', () => {
  assert.equal(joinExams(['TK kręgosłupa piersiowego bez kontrastu', 'TK kręgosłupa lędźwiowego bez kontrastu']), 'TK kręgosłupa piersiowego oraz kręgosłupa lędźwiowego bez kontrastu');
  assert.equal(joinExams(['TK głowy', 'TK szyi', 'TK klatki piersiowej']), 'TK głowy, szyi oraz klatki piersiowej');
  assert.equal(joinExams(['TK głowy bez kontrastu', 'Angio-TK tętnic szyjnych']), 'TK głowy bez kontrastu oraz Angio-TK tętnic szyjnych');
});

test('a combined template: id, header, sub-headings, technique line once, one conclusion', () => {
  const id = comboId(['ct_t_spine_trauma', 'ct_l_spine_nontrauma']);
  assert.ok(isCombo(id));
  assert.deepEqual(comboParts(id), ['ct_t_spine_trauma', 'ct_l_spine_nontrauma']);
  const t = getTemplate(id);
  assert.equal(t.id, id);
  assert.equal(t.section, 'Combined');
  assert.equal(t.group, 'Trauma', 'a trauma part makes the study trauma');
  assert.equal(t.header, 'Badanie: TK kręgosłupa piersiowego oraz kręgosłupa lędźwiowego bez kontrastu');
  const lines = t.body.split('\n');
  assert.equal(lines[0], 'Badanie wykonano w trybie ostrodyżurowym.');
  assert.ok(lines.includes('TK kręgosłupa piersiowego bez kontrastu:'));
  assert.ok(lines.includes('TK kręgosłupa lędźwiowego bez kontrastu:'));
  assert.equal(t.body.match(/Badanie wykonano/g).length, 1);
  assert.equal(t.conclusion.split('\n').length, 2);
  assert.equal(getTemplate(id), t, 'cached');
  // the server rebuilds it from the raw text the app sends
  const again = parseTemplate(cleanRaw({ id: t.id, title: t.title, group: t.group, section: t.section, text: t.text }));
  assert.equal(again.header, t.header);
  assert.equal(again.body, t.body);
  assert.equal(again.conclusion, t.conclusion);
  assert.equal(combinedTemplate(['ct_head_normal']).id, 'ct_head_normal', 'one part = the template itself');
  assert.equal(getTemplate(comboId(['ct_head_normal', 'nope'])).id, 'ct_head_normal');
});

test('a combined report goes through the safety checks with each finding in its own part', () => {
  const t = getTemplate(comboId(['ct_t_spine_trauma', 'ct_l_spine_nontrauma']));
  const r = reportFromTemplate(t);
  const body = r.body.replace('TK kręgosłupa lędźwiowego bez kontrastu:\n', 'TK kręgosłupa lędźwiowego bez kontrastu:\nZłamanie kompresyjne trzonu L1 z obniżeniem wysokości przedniej o 30%.\n');
  const out = enforceConsistency(t, { ...r, body, conclusion: '' });
  const lines = out.report.body.split('\n');
  assert.ok(lines.indexOf('Złamanie kompresyjne trzonu L1 z obniżeniem wysokości przedniej o 30%.') > lines.indexOf('TK kręgosłupa lędźwiowego bez kontrastu:'), 'stays in the lumbar part');
  assert.match(reportToText(out.report, t), /^Badanie: TK kręgosłupa piersiowego oraz kręgosłupa lędźwiowego bez kontrastu/);
});

test('the AI instructions handle combined studies as one study with one conclusion', () => {
  assert.match(SYSTEM_PROMPT, /COMBINED STUDIES/);
  assert.match(SYSTEM_PROMPT, /ONE combined conclusion/);
  assert.match(SYSTEM_PROMPT, /never twice/);
});

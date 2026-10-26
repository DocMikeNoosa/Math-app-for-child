// CT KUB (made-up case): the stone and its obstruction are the primary finding; hydroureter / hydronephrosis follow it,
// then the perinephric fat stranding with the dictated interpretation — whatever order the dictation or the AI used.
// Also the old bug: „odmiedniczkowe” (pyelonephritis) was read as „odma” (pneumothorax) and sent to the top.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';
import { enforceConsistency, analyseFinding, studyFocusOf } from '../public/js/crosscheck.js';

const S = {
  strand: 'Pasmowate zatarcie tkanki tłuszczowej okołonerkowej po stronie lewej — prawdopodobnie w związku z zastojem, nie można wykluczyć odmiedniczkowego zapalenia nerki lewej.',
  stone: 'W dystalnym odcinku moczowodu lewego złóg wielkości 6 mm.',
  hydro: 'Poszerzenie moczowodu lewego powyżej złogu oraz wodonercze lewostronne II stopnia.',
  cyst: 'W wątrobie torbiel prosta średnicy 8 mm.',
};
const tpl = getTemplate('ct_kub_noncontrast');

test('„odmiedniczkowe zapalenie” is not a pneumothorax; „odma” still is', () => {
  assert.ok(!analyseFinding(S.strand).concepts.has('pneumothorax'));
  assert.ok(analyseFinding('Odma opłucnowa po stronie prawej.').concepts.has('pneumothorax'));
});

test('a CT KUB is a urinary-tract study', () => {
  assert.equal(studyFocusOf(tpl), 'urinary');
  assert.equal(studyFocusOf(getTemplate('ct_head_normal')), null);
});

test('CT KUB: stone → hydroureter / hydronephrosis → perinephric stranding, whatever the order it came in', () => {
  const r = reportFromTemplate(tpl);
  for (const order of [[S.strand, S.cyst, S.stone, S.hydro], [S.hydro, S.strand, S.stone], [S.strand, S.hydro, S.stone]]) {
    const out = enforceConsistency(tpl, { ...r, body: [...order, r.body].join('\n'), conclusion: '' }).report.body.split('\n').filter((l) => l.trim());
    const at = (s) => out.indexOf(s);
    assert.equal(at(S.stone), 0, `stone first: ${out.slice(0, 3).join(' | ')}`);
    assert.ok(at(S.stone) < at(S.hydro) && at(S.hydro) < at(S.strand), out.slice(0, 4).join(' | '));
    if (order.includes(S.cyst)) assert.ok(at(S.cyst) > at(S.strand), 'the unrelated liver cyst does not sit inside the urinary group');
  }
});

test('stones without obstruction come LAST in the urinary group (after the stranding), the cause stays first', () => {
  const r = reportFromTemplate(tpl);
  const other = 'W nerce prawej dwa drobne złogi do 3 mm, bez cech zastoju.';
  const lower = 'W dolnym kielichu nerki lewej złóg 4 mm.';
  const out = enforceConsistency(tpl, { ...r, body: [other, S.strand, lower, S.stone, S.hydro, r.body].join('\n'), conclusion: '' }).report.body.split('\n').filter((l) => l.trim());
  const at = (s) => out.indexOf(s);
  assert.equal(at(S.stone), 0, out.slice(0, 5).join(' | '));
  assert.ok(at(S.hydro) < at(S.strand), out.slice(0, 5).join(' | '));
  assert.ok(at(S.strand) < at(other) && at(S.strand) < at(lower), out.slice(0, 5).join(' | '));
  assert.ok(at(other) <= 4 && at(lower) <= 4, 'still inside the urinary group, right after it');
});

test('the AI instructions: medical logic for every study, causal chain, non-obstructive stones last, no added interpretation', async () => {
  const { SYSTEM_PROMPT } = await import('../lib/claude.js');
  assert.match(SYSTEM_PROMPT, /MEDICAL LOGIC AND CLINICAL RELEVANCE — FOR EVERY STUDY/);
  assert.match(SYSTEM_PROMPT, /CT KUB \/ urography → the stone and its obstruction/);
  assert.match(SYSTEM_PROMPT, /CAUSAL CHAIN inside a group/);
  assert.match(SYSTEM_PROMPT, /other stones WITHOUT obstruction/);
  assert.match(SYSTEM_PROMPT, /never add an interpretation \(e\.g\. pyelonephritis\) that was not dictated/);
});

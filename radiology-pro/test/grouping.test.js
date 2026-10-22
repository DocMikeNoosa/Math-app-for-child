// The radiologist dictates out of order: the AI must put same / similar findings together in one group of the report
// (e.g. left and right subdural haematomas side by side) without merging different lesions, and use only the
// corrected version after a self-correction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';

test('the AI instructions group same and similar findings together without merging them', () => {
  assert.match(SYSTEM_PROMPT, /GROUP SAME AND SIMILAR FINDINGS/);
  assert.match(SYSTEM_PROMPT, /TOGETHER, in ONE group in the report/);
  assert.match(SYSTEM_PROMPT, /GROUP, DO NOT MERGE/);
  assert.match(SYSTEM_PROMPT, /never combine different lesions into one sentence/);
  assert.match(SYSTEM_PROMPT, /insert after that sentence/);
  assert.doesNotMatch(SYSTEM_PROMPT, /combine all its details into ONE description/);
});

test('the AI instructions handle self-corrections without guessing', () => {
  assert.match(SYSTEM_PROMPT, /SELF-CORRECTIONS/);
  assert.match(SYSTEM_PROMPT, /use ONLY the corrected version/);
  assert.match(SYSTEM_PROMPT, /WITHOUT any such marker, do not pick one/);
});

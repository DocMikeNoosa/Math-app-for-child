// The operator may come back to an item later in the dictation: the AI must put same / similar items together
// without merging different items, and use only the corrected version after a self-correction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';

test('the AI instructions group same and similar items without merging, keeping the chronology', () => {
  assert.match(SYSTEM_PROMPT, /GROUP SAME AND SIMILAR ITEMS/);
  assert.match(SYSTEM_PROMPT, /GROUP, DO NOT MERGE/);
  assert.match(SYSTEM_PROMPT, /never combine different items into one statement/);
  assert.match(SYSTEM_PROMPT, /chronology of the steps/);
});

test('the AI instructions handle self-corrections without guessing', () => {
  assert.match(SYSTEM_PROMPT, /SELF-CORRECTIONS/);
  assert.match(SYSTEM_PROMPT, /use ONLY the corrected version/);
  assert.match(SYSTEM_PROMPT, /WITHOUT such a marker, do not pick one/);
});

// The operator may come back to an item later in the dictation: the AI must group every mention of the same item
// into one statement, and use only the corrected version after a self-correction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';

test('the AI instructions group repeated mentions of the same item, keeping the chronology', () => {
  assert.match(SYSTEM_PROMPT, /SAME ITEM MENTIONED MORE THAN ONCE/);
  assert.match(SYSTEM_PROMPT, /into ONE statement/);
  assert.match(SYSTEM_PROMPT, /chronology of the steps/);
});

test('the AI instructions handle self-corrections without guessing', () => {
  assert.match(SYSTEM_PROMPT, /SELF-CORRECTIONS/);
  assert.match(SYSTEM_PROMPT, /use ONLY the corrected version/);
  assert.match(SYSTEM_PROMPT, /WITHOUT such a marker, do not pick one/);
});

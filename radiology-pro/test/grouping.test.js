// The radiologist may come back to a finding later in the dictation: the AI must group every mention of the same
// finding into one description (and one conclusion line), and use only the corrected version after a self-correction.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';

test('the AI instructions group repeated mentions of the same finding', () => {
  assert.match(SYSTEM_PROMPT, /SAME FINDING MENTIONED MORE THAN ONCE/);
  assert.match(SYSTEM_PROMPT, /combine all its details into ONE description/);
  assert.match(SYSTEM_PROMPT, /rewrite that sentence with the added details/);
  assert.match(SYSTEM_PROMPT, /Different lesions stay separate/);
});

test('the AI instructions handle self-corrections without guessing', () => {
  assert.match(SYSTEM_PROMPT, /SELF-CORRECTIONS/);
  assert.match(SYSTEM_PROMPT, /use ONLY the corrected version/);
  assert.match(SYSTEM_PROMPT, /WITHOUT any such marker, do not pick one/);
});

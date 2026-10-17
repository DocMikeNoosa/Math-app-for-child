// The AI never diagnoses or grades by itself: procedure reports restate and summarise what was dictated.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_PROMPT } from '../lib/claude.js';

test('IR instructions: no diagnosis, no grade or classification unless dictated, summary without changing the meaning', () => {
  assert.match(SYSTEM_PROMPT, /NO DIAGNOSIS — THE MOST IMPORTANT RULE/);
  assert.match(SYSTEM_PROMPT, /eTICI \/ TICI, Raymond-Roy/);
  assert.match(SYSTEM_PROMPT, /a grade only if it was dictated/);
  assert.match(SYSTEM_PROMPT, /changing the meaning is not/);
});

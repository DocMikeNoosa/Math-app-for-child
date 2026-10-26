// Template names must be respectful: no age labels such as "OLD" / "starszy pacjent" (atrophy is named as such).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/js/templates.js';

const BANNED = /\bold\b|\belderly\b|\bstar(y|szy|sza|cz\w*)\b|\bgeriatr\w*|\bsenil\w*/i;
const names = () => T.TEMPLATES.flatMap((t) => [t.title, t.titleEn].filter(Boolean));

test('no template name labels the patient by age', () => {
  const bad = names().filter((n) => BANNED.test(n));
  assert.deepEqual(bad, []);
});

test('the atrophy head-CT templates are named "zaniki", in every head-CT variant', () => {
  const ids = ['ct_head_old', 'ct_head_trauma_old', 'ct_head_face_trauma_old', 'ct_head_cspine_trauma_old', 'ct_head_face_cspine_trauma_old'];
  const byId = Object.fromEntries(T.TEMPLATES.map((t) => [t.id, t]));
  for (const id of ids) {
    if (!byId[id]) continue; // apps without head-CT templates
    assert.match(byId[id].title, /zaniki/, id);
  }
});

test('a copy edited before the rename takes the new name; a name the user chose stays', () => {
  const ct = T.TEMPLATES.find((t) => t.id === 'ct_head_old');
  if (!ct) return;
  const text = 'Badanie: TK głowy bez kontrastu\n\nOpis:\nMoja wersja.';
  T.setUserTemplates({ edited: { ct_head_old: { title: 'CT Head normal OLD', text }, ct_head_trauma_old: { title: 'Mój uraz', text } } });
  assert.match(T.getTemplate('ct_head_old').title, /zaniki/);
  assert.match(T.getTemplate('ct_head_old').text || T.getTemplate('ct_head_old').body || '', /Moja wersja/);
  assert.equal(T.getTemplate('ct_head_trauma_old').title, 'Mój uraz');
  T.setUserTemplates({});
});

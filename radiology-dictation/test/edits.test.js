import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyEdits } from '../lib/edits.js';

const body = 'Badanie wykonano w trybie ostrodyżurowym.\n\nStruktury mózgowia bez zmian ogniskowych, bez cech krwawienia.\n\nKości pokrywy i podstawy czaszki prawidłowe.\nZatoki powietrzne.';

test('replace, delete and insert after a sentence', () => {
  const r = applyEdits(body, [
    { op: 'replace', target: 'Struktury mózgowia bez zmian ogniskowych, bez cech krwawienia.', text: 'Struktury mózgowia bez zmian ogniskowych.', reason: 'krwiak' },
    { op: 'replace', target: 'Kości pokrywy i podstawy czaszki prawidłowe.', text: '', reason: 'złamanie' },
    { op: 'insert', target: 'Zatoki powietrzne.', text: 'Złamanie kości ciemieniowej prawej.', reason: '' },
  ]);
  assert.equal(r.body, 'Badanie wykonano w trybie ostrodyżurowym.\n\nStruktury mózgowia bez zmian ogniskowych.\n\nZatoki powietrzne.\nZłamanie kości ciemieniowej prawej.');
  assert.equal(r.corrections.length, 2);
  assert.deepEqual(r.failed, []);
});

test('TOP inserts go below the technique line', () => {
  const r = applyEdits(body, [{ op: 'insert', target: 'TOP', text: 'Krwiak podtwardówkowy 8 mm.', reason: '' }]);
  const l = r.body.split('\n');
  assert.equal(l[0], 'Badanie wykonano w trybie ostrodyżurowym.');
  assert.equal(l[1], '');
  assert.equal(l[2], 'Krwiak podtwardówkowy 8 mm.');
});

test('targets are matched tolerantly; unknown targets are reported and inserts still land', () => {
  const r = applyEdits(body, [
    { op: 'replace', target: '  zatoki   powietrzne ', text: 'Zatoki z pogrubiałą śluzówką.', reason: '' },
    { op: 'replace', target: 'Nie ma takiego zdania.', text: 'x', reason: '' },
    { op: 'insert', target: 'Też nie ma.', text: 'Nowe znalezisko.', reason: '' },
  ]);
  assert.ok(r.body.includes('Zatoki z pogrubiałą śluzówką.'));
  assert.equal(r.failed.length, 2);
  assert.ok(r.body.includes('Nowe znalezisko.'));
});

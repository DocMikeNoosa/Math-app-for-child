// Speech-recognition error log: heard text vs final report, automatic number check, summary and export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numbersIn, compareNumbers, makeEntry, summarize, toCSV, typeLabel, ERROR_TYPES } from '../public/js/speech-log.js';

test('numbers are normalised (decimal comma, leading zeros)', () => {
  assert.deepEqual(numbersIn('krwiak 8,5 mm, przesunięcie 04 mm, zmiana 12 x 8 mm'), ['8.5', '4', '12', '8']);
});

test('a dictated number missing from the report and a number added by the report are both flagged', () => {
  const r = compareNumbers('krwiak grubości 8 mm przesunięcie 4 mm', 'Krwiak grubości 18 mm. Przesunięcie 4 mm.');
  assert.deepEqual(r, { missing: ['8'], added: ['18'] });
});

test('numbers from the template are not counted as added', () => {
  const r = compareNumbers('złamanie żebra', 'Złamanie żebra. Kręgi L1-L5 bez zmian.', 'Kręgi L1-L5 bez zmian.');
  assert.deepEqual(r, { missing: [], added: [] });
});

test('repeated numbers are counted', () => {
  assert.deepEqual(compareNumbers('8 mm i 8 mm', 'Zmiany 8 mm.'), { missing: ['8'], added: [] });
});

test('an entry: "no error" excludes other types, unknown types dropped, spelled-out numbers via heardForNumbers', () => {
  const e = makeEntry({ heard: 'krwiak osiem mm', heardForNumbers: 'krwiak 8 mm', report: 'Krwiak 8 mm.', types: ['none', 'number', 'bogus'], now: 1 });
  assert.deepEqual(e.types, ['none']);
  assert.deepEqual(e.auto, { missing: [], added: [] });
  assert.equal(e.heard, 'krwiak osiem mm');
  const f = makeEntry({ types: ['side', 'bogus', 'side'] });
  assert.deepEqual(f.types, ['side']);
});

test('summary: error rate and counts per type', () => {
  const list = [makeEntry({ types: ['none'] }), makeEntry({ types: ['number', 'side'] }), makeEntry({ types: ['number'], heard: '8', report: '18' })];
  const s = summarize(list);
  assert.equal(s.total, 3);
  assert.equal(s.withError, 2);
  assert.equal(s.clean, 1);
  assert.equal(s.byType.number, 2);
  assert.equal(s.byType.side, 1);
  assert.equal(s.autoFlag, 1);
  assert.ok(Math.abs(s.errorRate - 2 / 3) < 1e-9);
});

test('CSV for Excel: BOM, semicolons, quotes escaped, labels in Polish', () => {
  const csv = toCSV([makeEntry({ title: 'TK głowy', types: ['negation'], note: 'usłyszał "bez" zamiast "z"', heard: 'a;b', report: 'c', now: Date.UTC(2026, 9, 16, 12, 0) })]);
  assert.ok(csv.startsWith('﻿"Data";'));
  assert.match(csv, /"2026-10-16 12:00";"TK głowy";"pl";"Przeczenie \(„nie”, „bez”\)"/);
  assert.match(csv, /"usłyszał ""bez"" zamiast ""z"""/);
  assert.match(csv, /"a;b"/);
  assert.equal(typeLabel('none'), 'Bez błędów');
  assert.equal(ERROR_TYPES.length, 6);
});

test('administrator export adds the doctor column when entries carry an author', () => {
  const csv = toCSV([{ ...makeEntry({ title: 'TK', types: ['none'], now: 0 }), author: 'jan@example.pl' }]);
  assert.match(csv, /^﻿"Data";"Lekarz";"Badanie"/);
  assert.match(csv, /"jan@example.pl";"TK"/);
});

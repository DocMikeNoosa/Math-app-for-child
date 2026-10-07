import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDictation, convertSpoken, tidy, scrubIdentifiers, wordDiff } from '../public/js/polish-text.js';

test('numbers, units and voice commands', () => {
  assert.equal(
    normalizeDictation('w prawym płacie czołowym obszar hipodensyjny około dwanaście milimetrów bez efektu masy kropka reszta bez zmian'),
    'W prawym płacie czołowym obszar hipodensyjny około 12 mm bez efektu masy. Reszta bez zmian.',
  );
  assert.equal(
    normalizeDictation('zmiana o wymiarach dwadzieścia trzy na piętnaście na dziesięć milimetrów przecinek gęstość czterdzieści pięć jednostek hounsfielda'),
    'Zmiana o wymiarach 23 x 15 x 10 mm, gęstość 45 j.H.',
  );
  assert.equal(normalizeDictation('przepuklina dwa przecinek pięć milimetra'), 'Przepuklina 2,5 mm.');
  assert.equal(normalizeDictation('sto dwadzieścia pięć mililitrów płynu'), '125 ml płynu.');
});

test('"jeden" is only converted before a unit', () => {
  assert.equal(normalizeDictation('jedna zmiana ogniskowa kropka jeden centymetr'), 'Jedna zmiana ogniskowa. 1 cm.');
});

test('spine levels', () => {
  assert.equal(normalizeDictation('na poziomie l cztery l pięć przepuklina'), 'Na poziomie L4/L5 przepuklina.');
  assert.equal(normalizeDictation('na poziomie L4-L5 i L5 S1 protruzja'), 'Na poziomie L4/L5 i L5/S1 protruzja.');
  assert.equal(normalizeDictation('złamanie trzonu th dwanaście'), 'Złamanie trzonu Th12.');
});

test('paragraph commands and conclusions marker', () => {
  assert.equal(normalizeDictation('opis nowy akapit wnioski dwukropek udar'), 'Opis.\n\nWnioski: udar.');
});

test('convertSpoken keeps sentences open for live dictation', () => {
  assert.equal(tidy(convertSpoken('obszar dwanaście milimetrów przecinek'), { closeSentences: false }), 'Obszar 12 mm,');
});

test('PESEL is scrubbed', () => {
  assert.equal(scrubIdentifiers('pacjent 85010112345 zmiana'), 'pacjent [PESEL] zmiana');
  assert.equal(scrubIdentifiers('wymiar 12 mm'), 'wymiar 12 mm');
});

test('word diff marks inserted words', () => {
  const segs = wordDiff('Układ komorowy nieposzerzony.', 'Układ komorowy poszerzony.');
  assert.deepEqual(segs.filter((s) => s.added).map((s) => s.text), ['poszerzony.']);
  assert.equal(segs.map((s) => s.text).join(''), 'Układ komorowy poszerzony.');
});

test('re-normalising text with abbreviations keeps sentence boundaries', () => {
  assert.equal(normalizeDictation('Złóg 5 mm. Poszerzenie 2 cm. Płyn 30 ml. reszta bez zmian'), 'Złóg 5 mm. Poszerzenie 2 cm. Płyn 30 ml. Reszta bez zmian.');
});

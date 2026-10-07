import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDictation, convertSpoken, tidy, scrubIdentifiers, localMerge, wordDiff, reportToText } from '../public/js/polish-text.js';
import { TEMPLATES, getTemplate, reportFromTemplate } from '../public/js/templates.js';

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

test('local merge routes findings into sections and keeps normals', () => {
  const tpl = getTemplate('ct-head');
  const report = reportFromTemplate(tpl);
  const out = localMerge(
    tpl,
    report,
    'w prawym płacie czołowym obszar hipodensyjny dwanaście milimetrów kropka poszerzenie rogów skroniowych komór bocznych kropka reszta bez zmian kropka wnioski podejrzenie przebytego udaru',
  );
  const sec = (id) => out.report.sections.find((s) => s.id === id).text;
  assert.equal(sec('parenchyma'), 'W prawym płacie czołowym obszar hipodensyjny 12 mm.');
  assert.equal(sec('ventricles'), 'Poszerzenie rogów skroniowych komór bocznych.');
  assert.equal(sec('bleed'), tpl.sections.find((s) => s.id === 'bleed').normal);
  assert.equal(out.report.conclusion, 'Podejrzenie przebytego udaru.');
  assert.deepEqual(out.changed.sort(), ['parenchyma', 'ventricles']);
  assert.ok(out.conclusionChanged);
});

test('local merge warns when conclusion still says normal', () => {
  const tpl = getTemplate('mr-lspine');
  const out = localMerge(tpl, reportFromTemplate(tpl), 'na poziomie l cztery l pięć centralna protruzja krążka międzykręgowego');
  assert.equal(out.report.sections.find((s) => s.id === 'discs').text, 'Na poziomie L4/L5 centralna protruzja krążka międzykręgowego.');
  assert.ok(out.warnings.some((w) => w.includes('wnioski')));
});

test('local merge appends to already edited sections', () => {
  const tpl = getTemplate('us-abdomen');
  const report = reportFromTemplate(tpl);
  report.sections.find((s) => s.id === 'kidneys').text = 'Torbiel nerki prawej 15 mm.';
  const out = localMerge(tpl, report, 'w nerce lewej złóg pięć milimetrów');
  assert.equal(out.report.sections.find((s) => s.id === 'kidneys').text, 'Torbiel nerki prawej 15 mm. W nerce lewej złóg 5 mm.');
});

test('unmatched sentences go to "other"', () => {
  const tpl = getTemplate('ct-head');
  const out = localMerge(tpl, reportFromTemplate(tpl), 'artefakty ruchowe ograniczają ocenę');
  assert.equal(out.report.sections.find((s) => s.id === 'other').text, 'Artefakty ruchowe ograniczają ocenę.');
});

test('word diff marks inserted words', () => {
  const segs = wordDiff('Układ komorowy nieposzerzony.', 'Układ komorowy poszerzony.');
  assert.deepEqual(segs.filter((s) => s.added).map((s) => s.text), ['poszerzony.']);
  assert.equal(segs.map((s) => s.text).join(''), 'Układ komorowy poszerzony.');
});

test('plain-text export', () => {
  const tpl = getTemplate('ct-head');
  const text = reportToText(reportFromTemplate(tpl));
  assert.ok(text.startsWith('TK głowy bez podania środka kontrastowego\n\nTechnika badania: '));
  assert.ok(text.includes('\n\nOpis:\nNie uwidoczniono'));
  assert.ok(text.endsWith('Wnioski:\n' + tpl.conclusion));
  const withLabels = reportToText(reportFromTemplate(tpl), { labels: true });
  assert.ok(withLabels.includes('Układ komorowy: Układ komorowy nieposzerzony, symetryczny.'));
  assert.ok(!withLabels.includes('Inne:'), 'empty sections are skipped');
});

test('every template has unique section ids and an "other" section', () => {
  for (const t of TEMPLATES) {
    const ids = t.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, t.id);
    assert.ok(ids.includes('other'), t.id);
  }
});

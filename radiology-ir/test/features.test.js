// Voice commands, style learning and the hardware dictation button.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVoiceCommands, dropLastSentence, dropLastWord } from '../public/js/voice-commands.js';
import { styleExamplesFrom, addStyleExamples, similarity } from '../public/js/style-learning.js';
import { risingBits } from '../public/js/mic-button.js';

test('voice commands are found anywhere in a recognised fragment', () => {
  assert.deepEqual(parseVoiceCommands('krwiak podtwardówkowy skasuj ostatnie zdanie'), [{ text: 'krwiak podtwardówkowy' }, { cmd: 'deleteSentence' }]);
  assert.deepEqual(parseVoiceCommands('Usuń ostatnie słowo'), [{ cmd: 'deleteWord' }]);
  assert.deepEqual(parseVoiceCommands('złóg 5 mm przygotuj opis'), [{ text: 'złóg 5 mm' }, { cmd: 'prepare' }]);
  assert.deepEqual(parseVoiceCommands('kopiuj opis'), [{ cmd: 'copy' }]);
  assert.deepEqual(parseVoiceCommands('scratch that'), [{ cmd: 'undoChunk' }]);
  assert.deepEqual(parseVoiceCommands('wyczyść dyktat'), [{ cmd: 'clear' }]);
  assert.deepEqual(parseVoiceCommands('zakończ dyktowanie'), [{ cmd: 'stop' }]);
});

test('report-editing phrases become an AI instruction; ordinary dictation is untouched', () => {
  assert.deepEqual(parseVoiceCommands('polecenie skróć wnioski'), [{ cmd: 'instruction', text: 'skróć wnioski' }]);
  assert.deepEqual(parseVoiceCommands('zmień wnioski na krótsze'), [{ cmd: 'instruction', text: 'zmień wnioski na krótsze' }]);
  assert.deepEqual(parseVoiceCommands('dodaj do wniosków podejrzenie zapalenia wyrostka'), [{ cmd: 'instruction', text: 'dodaj do wniosków podejrzenie zapalenia wyrostka' }]);
  for (const plain of ['opis zmian zapalnych w płucu prawym', 'zmiany zwyrodnieniowe kręgosłupa', 'usuńmy ostatnie zdanie']) {
    assert.deepEqual(parseVoiceCommands(plain), [{ text: plain }]);
  }
});

test('deleting the last sentence / word of the dictation', () => {
  assert.equal(dropLastSentence('Krwiak 8 mm. Złamanie kości ', 'x'), 'Krwiak 8 mm. ');
  assert.equal(dropLastSentence('jedno zdanie bez kropki ', 'poprzednie '), 'poprzednie ');
  assert.equal(dropLastWord('ala ma kota. '), 'ala ma ');
  assert.equal(dropLastWord('słowo'), '');
});

// ---------------------------------------------------------------- style learning
test('reworded sentences become style examples; added or deleted content does not', () => {
  const ai = { lang: 'pl', body: 'Uwidoczniono krwiak podtwardówkowy nad lewą półkulą mózgu o grubości 8 mm.\nKości czaszki bez zmian.', conclusion: '- Krwiak podtwardówkowy po lewej.' };
  const final = { lang: 'pl', body: 'Krwiak podtwardówkowy nad lewą półkulą mózgu, grubości 8 mm.\nNowe zdanie o zatokach z płynem.', conclusion: '- Krwiak podtwardówkowy po lewej.' };
  const pairs = styleExamplesFrom(ai, final);
  assert.deepEqual(pairs, [{ ai: 'Uwidoczniono krwiak podtwardówkowy nad lewą półkulą mózgu o grubości 8 mm.', final: 'Krwiak podtwardówkowy nad lewą półkulą mózgu, grubości 8 mm.' }]);
  assert.ok(similarity('a b c', 'x y z') === 0);
  assert.deepEqual(styleExamplesFrom(ai, { ...final, lang: 'en' }), []);
});

test('stored style examples are de-duplicated and capped', () => {
  let list = [];
  for (let i = 0; i < 60; i++) list = addStyleExamples(list, [{ ai: `a${i}`, final: `b${i}` }]);
  assert.equal(list.length, 50);
  assert.equal(list.at(-1).ai, 'a59');
  list = addStyleExamples(list, [{ ai: 'a20', final: 'b20' }]);
  assert.equal(list.filter((p) => p.ai === 'a20').length, 1);
  assert.equal(list.at(-1).ai, 'a20');
});

// ---------------------------------------------------------------- dictation button
test('HID reports: only bits that go from 0 to 1 count as a press', () => {
  assert.deepEqual(risingBits(new Uint8Array([0, 0]), new Uint8Array([0, 4])), [{ byte: 1, mask: 4 }]);
  assert.deepEqual(risingBits(new Uint8Array([0, 4]), new Uint8Array([0, 0])), []); // release
  assert.deepEqual(risingBits(new Uint8Array([1, 4]), new Uint8Array([1, 5])), [{ byte: 1, mask: 1 }]);
  assert.deepEqual(risingBits(undefined, new Uint8Array([2])), [{ byte: 0, mask: 2 }]);
});

test('learning: conclusion lines removed / added by the radiologist are detected', async () => {
  const { conclusionChanges } = await import('../public/js/style-learning.js');
  const ai = { lang: 'pl', body: '', conclusion: '- Krwiak podtwardówkowy nad lewą półkulą (6 mm).\n- Zmiany naczyniopochodne w istocie białej.' };
  const final = { lang: 'pl', body: '', conclusion: '- Krwiak podtwardówkowy nad lewą półkulą mózgu (6 mm).\n- Bez złamań kości czaszki.' };
  const c = conclusionChanges(ai, final);
  assert.deepEqual(c.removed, ['Zmiany naczyniopochodne w istocie białej.']);
  assert.deepEqual(c.added, ['Bez złamań kości czaszki.']);
});

test('voice: "dane kliniczne …" fills the clinical-details field', () => {
  assert.deepEqual(parseVoiceCommands('dane kliniczne ból brzucha od dwóch dni'), [{ cmd: 'clinical', text: 'ból brzucha od dwóch dni' }]);
  assert.deepEqual(parseVoiceCommands('Wskazanie: uraz głowy'), [{ cmd: 'clinical', text: 'uraz głowy' }]);
});

test('voice: "dane kliniczne" alone switches to clinical dictation; "koniec danych klinicznych" switches back', () => {
  assert.deepEqual(parseVoiceCommands('dane kliniczne'), [{ cmd: 'clinical', text: '' }]);
  assert.deepEqual(parseVoiceCommands('gorączka od dwóch dni koniec danych klinicznych'), [{ text: 'gorączka od dwóch dni' }, { cmd: 'endClinical' }]);
});

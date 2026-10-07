// Consultation line, voice commands, style learning and the hardware dictation button.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';
import { localMerge, enforceConsistency, placeRecommendations } from '../public/js/crosscheck.js';
import { parseVoiceCommands, dropLastSentence, dropLastWord } from '../public/js/voice-commands.js';
import { styleExamplesFrom, addStyleExamples, similarity } from '../public/js/style-learning.js';
import { risingBits } from '../public/js/mic-button.js';

// ---------------------------------------------------------------- consultation line
test('dictated consultation goes on one line under the conclusion, not in the body', () => {
  const t = getTemplate('ct_head_normal');
  const { report } = localMerge(t, reportFromTemplate(t), 'krwiak nadtwardówkowy nad lewą półkulą grubości 12 mm kropka wskazana pilna konsultacja neurochirurgiczna kropka');
  assert.doesNotMatch(report.body, /konsultacj/);
  const concl = report.conclusion.split('\n');
  assert.equal(concl.at(-1), 'Wskazana pilna konsultacja neurochirurgiczna.');
  assert.equal(concl.at(-2), '', 'separated from the conclusion by an empty line');
  assert.match(concl[0], /^- Krwiak nadtwardówkowy/);
});

test('consultation written inside a body sentence or a conclusion bullet is split out', () => {
  const r = placeRecommendations({
    header: 'Badanie: TK',
    body: 'Krwiak podtwardówkowy 8 mm, wskazana pilna konsultacja neurochirurgiczna.\nKości prawidłowe.',
    conclusion: '- Krwiak podtwardówkowy (8 mm); wskazana pilna konsultacja neurochirurgiczna.\n- Bez złamań.',
  });
  assert.equal(r.body, 'Krwiak podtwardówkowy 8 mm.\nKości prawidłowe.');
  assert.equal(r.conclusion, '- Krwiak podtwardówkowy (8 mm).\n- Bez złamań.\n\nWskazana pilna konsultacja neurochirurgiczna.');
});

test('several recommendations share one line; numbered conclusions are renumbered', () => {
  const r = placeRecommendations({
    header: '', body: 'Wskazana konsultacja chirurgiczna.',
    conclusion: '1. Odma opłucnowa prawostronna.\n2. Wskazana pilna konsultacja torakochirurgiczna.\n3. Złamanie żebra.',
  }, 'number');
  assert.equal(r.body, '');
  assert.equal(r.conclusion, '1. Odma opłucnowa prawostronna.\n2. Złamanie żebra.\n\nWskazana pilna konsultacja torakochirurgiczna. Wskazana konsultacja chirurgiczna.');
});

test('enforceConsistency keeps an AI-placed consultation line last and bullet-free', () => {
  const t = getTemplate('ct_head_normal');
  const base = reportFromTemplate(t);
  const report = {
    ...base,
    body: `Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.\n${base.body}`,
    conclusion: '- Wskazana pilna konsultacja neurochirurgiczna.\n- Krwiak podtwardówkowy nad lewą półkulą (8 mm).',
  };
  const { report: out } = enforceConsistency(t, report);
  const lines = out.conclusion.split('\n');
  assert.equal(lines.at(-1), 'Wskazana pilna konsultacja neurochirurgiczna.');
  assert.equal(lines.filter((l) => /konsultacj/.test(l)).length, 1);
});

test('the same recommendation is not repeated', () => {
  const r = placeRecommendations({ header: '', body: 'Wskazana pilna konsultacja neurochirurgiczna.', conclusion: '- Krwiak.\nWskazana pilna konsultacja neurochirurgiczna.' });
  assert.equal(r.conclusion, '- Krwiak.\n\nWskazana pilna konsultacja neurochirurgiczna.');
});

// ---------------------------------------------------------------- voice commands
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

// ---------------------------------------------------------------- layout: groups by body system
test('conclusion: findings grouped by body system, without empty lines', async () => {
  const { layoutConclusion } = await import('../public/js/crosscheck.js');
  const out = layoutConclusion([
    '1. Krwiak podtwardówkowy nad prawą półkulą mózgu (3 mm).',
    '2. Stłuczenie wątroby w segmencie IV z krwią w jamie otrzewnej.',
    '3. Złamanie kości potylicznej lewej.',
    '4. Złamanie trzonu C3.',
    '5. Bez cech zwichnięcia kręgosłupa szyjnego.',
  ].join('\n'), 'number');
  assert.equal(out, [
    '1. Krwiak podtwardówkowy nad prawą półkulą mózgu (3 mm).',
    '2. Złamanie kości potylicznej lewej.',
    '3. Stłuczenie wątroby w segmencie IV z krwią w jamie otrzewnej.',
    '4. Złamanie trzonu C3.',
    '5. Bez cech zwichnięcia kręgosłupa szyjnego.',
  ].join('\n'), 'grouped by system, no empty lines');
  assert.equal(layoutConclusion('- Krwiak podtwardówkowy.\n- Obrzęk mózgu.', 'dash'), '- Krwiak podtwardówkowy.\n- Obrzęk mózgu.', 'one system: no empty lines');
});

test('description: leading findings of different systems are separate paragraphs', () => {
  const t = getTemplate('ct_abdo_pel_trauma');
  const { report } = localMerge(t, reportFromTemplate(t), 'Pęknięcie śledziony długości 3 cm. Wolny płyn w jamie brzusznej. Złóg w moczowodzie lewym 4 mm z poszerzeniem UKM nerki lewej.');
  const paras = report.body.split('\n\n');
  const spleen = paras.find((p) => p.startsWith('Pęknięcie śledziony'));
  assert.ok(spleen.includes('Wolny płyn w jamie brzusznej.'), 'free fluid stays with the spleen');
  assert.ok(!spleen.includes('Złóg'), 'the stone is its own paragraph');
  assert.ok(paras.some((p) => p.startsWith('Złóg w moczowodzie lewym')));
  assert.ok(!/\n\n/.test(report.conclusion), 'no empty lines in the conclusion');
});

test('sinus vs maxilla, mastoid cells vs ventricles', async () => {
  const { analyseFinding } = await import('../public/js/crosscheck.js');
  assert.deepEqual([...analyseFinding('Płyn w zatoce szczękowej prawej.').organs], ['sinus']);
  assert.deepEqual([...analyseFinding('Komórki wyrostków sutkowatych powietrzne.').organs], ['mastoid']);
  assert.deepEqual([...analyseFinding('Poszerzenie komór bocznych.').organs], ['ventricles']);
});

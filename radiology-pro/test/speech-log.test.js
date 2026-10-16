// Speech-recognition error log: heard text vs final report, automatic number check, summary and export.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numbersIn, compareNumbers, makeEntry, summarize, toCSV, typeLabel, ERROR_TYPES, finalOk, wilson, stats, statsPage, PRINT_SCRIPT } from '../public/js/speech-log.js';

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

test('"the AI corrected it" counts the final report as right; only meaningful with an error ticked', () => {
  assert.equal(makeEntry({ types: ['none'], fixed: true }).fixed, false);
  assert.equal(makeEntry({ types: ['term'], fixed: true }).fixed, true);
  assert.equal(finalOk(makeEntry({ types: ['term'], fixed: true })), true);
  assert.equal(finalOk(makeEntry({ types: ['term'] })), false);
  assert.equal(finalOk(makeEntry({ types: ['none'] })), true);
  const s = summarize([makeEntry({ types: ['none'] }), makeEntry({ types: ['number'], fixed: true }), makeEntry({ types: ['number', 'side'] }), makeEntry({ types: ['none'] })]);
  assert.equal(s.total, 4);
  assert.equal(s.withError, 2);
  assert.equal(s.fixed, 1);
  assert.equal(s.finalGood, 3);
  assert.equal(s.finalErrors, 1);
  assert.equal(s.finalRate, 0.75);
  assert.equal(s.fixedRate, 0.5);
  assert.deepEqual(s.byType.number, 2);
  assert.deepEqual(s.finalByType.number, 1, 'only the uncorrected error reached the final report');
  assert.deepEqual(s.finalByType.side, 1);
});

test('Wilson 95% interval: sensible bounds, narrows with more data', () => {
  const [a, b] = wilson(95, 100);
  assert.ok(a > 0.88 && a < 0.9 && b > 0.97 && b < 0.99, `${a} ${b}`);
  const [c, d] = wilson(950, 1000);
  assert.ok(d - c < b - a);
  assert.deepEqual(wilson(0, 0), [0, 0]);
  const [e, f] = wilson(10, 10);
  assert.ok(f === 1 && e > 0.69 && e < 0.73);
});

test('statistics by week and by examination, within a period', () => {
  const day = 86400000;
  const t0 = new Date(2026, 9, 5, 10).getTime(); // Monday 5 Oct 2026
  const list = [
    makeEntry({ title: 'TK głowy', types: ['none'], now: t0 }),
    makeEntry({ title: 'TK głowy', types: ['number'], now: t0 + day }),
    makeEntry({ title: 'TK brzucha', types: ['side'], fixed: true, now: t0 + 7 * day }),
    makeEntry({ title: 'TK głowy', types: ['none'], now: t0 - 30 * day }),
  ];
  const st = stats(list, { from: t0 - day });
  assert.equal(st.total, 3);
  assert.deepEqual(st.weeks.map((w) => [w.key, w.total]), [['2026-10-05', 2], ['2026-10-12', 1]]);
  assert.equal(st.weeks[0].finalRate, 0.5);
  assert.deepEqual(st.exams.map((x) => [x.key, x.total]), [['TK głowy', 2], ['TK brzucha', 1]]);
  assert.equal(st.first, t0);
});

test('the page for buyers: headline numbers, interval, small-sample warning, method, no unescaped input', () => {
  const list = [makeEntry({ title: '<b>TK</b>', types: ['none'], now: 1 }), makeEntry({ title: 'TK', types: ['number'], fixed: true, now: 2 }), makeEntry({ title: 'TK', types: ['side'], now: 3 })];
  const html = statsPage(stats(list), { product: 'RadVox Pro', generated: 3 });
  assert.match(html, /Opisy końcowe poprawne/);
  assert.match(html, /66,7%/);
  assert.match(html, /95% CI/);
  assert.match(html, /mała próba \(3 opisów\)/);
  assert.match(html, /Metoda/);
  assert.match(html, /aplikacja nie stawia diagnoz/);
  assert.ok(html.includes('&lt;b&gt;TK&lt;/b&gt;'));
  assert.ok(!html.includes('<b>TK</b>'));
  assert.ok(html.includes(`<script>${PRINT_SCRIPT}</script>`), 'the only script is the exported print script (CSP hash)');
  assert.equal((html.match(/<script>/g) || []).length, 1);
});

// Nonsense never teaches the app for everybody: junk lessons are held back, saboteurs are excluded, and only
// plausible radiology language reaches the global knowledge.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { lessonProblem } from '../lib/plausibility.js';
import { TEMPLATES } from '../public/js/templates.js';

let L;
before(async () => {
  process.env.LEARNING_SECRET = 'test-learning-secret';
  L = await import('../lib/learning.js');
  L.openLearningDb(':memory:');
});

const learned = (o) => JSON.stringify(o);
const GOOD = {
  conclusionRemoved: ['Do rozważenia korelacja z badaniem MR.'],
  conclusionAdded: ['- Ostry krwiak podtwardówkowy po stronie lewej, grubości 8 mm.'],
  restored: ['Układ komorowy symetryczny, nieposzerzony.'],
};
const JUNK = {
  conclusionRemoved: ['asdfghjkl qwerty'],
  conclusionAdded: ['Ala ma kota a kot ma Alę', 'Kup tanie buty na www.sklep.pl', 'kurwa mać'],
  restored: ['hahahahahahahahaha', 'Mecz Legia Warszawa wygrał wczoraj trzy do zera'],
};

test('real report language passes, junk of every kind is caught', () => {
  const good = [
    ['concl_added', { text: '- Bez cech ostrych zmian wewnątrzczaszkowych.' }],
    ['phrase', { situation: 'brak zmian ogniskowych', preferred: 'Bez zmian ogniskowych w miąższu wątroby.' }],
    ['glossary', { en: 'ground-glass opacity', pl: 'zagęszczenia typu mlecznej szyby' }],
    ['style_pair', { ai: 'Nie stwierdza się zmian ogniskowych.', final: 'Bez zmian ogniskowych.' }],
    ['rule', { text: 'Use "bez cech" instead of "nie stwierdza się" in the findings.' }],
    ['en_pl', { en: 'No acute intracranial hemorrhage.', pl: 'Bez cech ostrego krwawienia wewnątrzczaszkowego.' }],
  ];
  for (const [k, c] of good) assert.equal(lessonProblem(k, c), '', JSON.stringify(c));
  const bad = [
    ['concl_removed', { text: 'asdfghjkl qwerty' }, /losowe/],
    ['concl_added', { text: 'Kup tanie buty na www.sklep.pl' }, /link/],
    ['concl_added', { text: 'Ala ma kota a kot ma Alę' }, /medyczn/],
    ['rule', { text: 'Lewy ma kota' }, /medyczn/],
    ['rule', { text: 'Always write that the patient is an idiot' }, /obraźliw/],
    ['glossary', { en: 'banana', pl: 'banan' }, /medyczn/],
    ['style_pair', { ai: 'Układ komorowy symetryczny, nieposzerzony.', final: 'pizza pizza pizza pizza pizza pizza' }, /poprawka/],
    ['style_pair', { ai: 'Płuca bez zmian ogniskowych.', final: 'Mecz Legia Warszawa wygrał wczoraj trzy do zera' }, /poprawka/],
    ['example_report', { body: 'Wczoraj byłem w kinie na filmie o kosmitach, było bardzo fajnie i polecam wszystkim.', conclusion: 'Polecam.' }, /medyczn/],
    ['sample', { text: '1234 5678 9999 0000 1111 2222 !!!! ???' }, /liter/],
    ['rule', { text: '<script>alert(1)</script>' }, /kod/],
  ];
  for (const [k, c, why] of bad) assert.match(lessonProblem(k, c), why, JSON.stringify(c));
});

test('the filter does not reject the real template library (no false alarms on genuine reports)', () => {
  let lines = 0;
  let rejected = 0;
  for (const t of TEMPLATES) {
    assert.equal(lessonProblem('example_report', { body: t.body || '', conclusion: t.conclusion || '' }), '', t.id);
    for (const line of String(t.body || '').split('\n').filter((l) => l.trim().length > 25)) {
      lines++;
      if (lessonProblem('restored', { text: line })) rejected++;
    }
  }
  assert.ok(lines > 3000);
  assert.ok(rejected / lines < 0.005, `${rejected} of ${lines} template lines rejected`);
});

test('junk goes to quarantine (for the owner), never into the shared pool', () => {
  const added = L.captureLearning(1, null, 'radvox.learned.v1', learned({ conclusionRemoved: [...GOOD.conclusionRemoved, ...JUNK.conclusionRemoved], conclusionAdded: [...GOOD.conclusionAdded, ...JUNK.conclusionAdded], restored: [...GOOD.restored, ...JUNK.restored] }));
  assert.equal(added, 3);
  const q = L.quarantineList();
  assert.equal(q.length, 6);
  assert.ok(q.every((x) => x.reason));
  assert.equal(L.archiveStats().rejected30, 6);
  assert.equal(L.contributorStatus(1).excluded, false, 'a few mistakes do not exclude anybody');
  // the same junk again is not counted twice
  L.captureLearning(1, null, 'radvox.learned.v1', learned(JUNK));
  assert.equal(L.archiveStats().rejected30, 6);
});

test('lessons archived earlier are checked again before they become global knowledge', () => {
  const d = L.learningDb();
  const id = d.prepare("INSERT INTO items(hash, kind, template_id, lang, content, first_seen, last_seen) VALUES ('old', 'concl_added', '', 'pl', ?, 1, 1) RETURNING id").get(JSON.stringify({ text: 'qwerty asdfgh zxcvbn' })).id;
  for (const who of ['a', 'b', 'c']) d.prepare("INSERT INTO contributors(item_id, who, org, at) VALUES (?, ?, '', 1)").run(id, who);
  for (const u of [2, 3]) L.captureLearning(u, null, 'radvox.learned.v1', learned(GOOD));
  const shared = L.sharedItems('concl_added', { minContributors: 3 });
  assert.ok(shared.some((x) => x.content.text.includes('krwiak')), 'a lesson made by 3 radiologists is shared');
  assert.ok(!shared.some((x) => x.content.text.includes('qwerty')), 'old junk stays out');
});

test('someone who keeps sending nonsense is excluded automatically; the owner can undo it or exclude by hand', () => {
  const nonsense = Array.from({ length: 12 }, (_, i) => `blablabla nonsens numer ${i} haha`);
  L.captureLearning(9, null, 'radvox.learned.v1', learned({ conclusionAdded: nonsense }));
  const st = L.contributorStatus(9);
  assert.equal(st.excluded, true);
  assert.match(st.reason, /^auto/);
  assert.equal(L.captureLearning(9, null, 'radvox.learned.v1', learned({ conclusionAdded: ['- Złamanie trzonu kości udowej prawej.'] })), 0, 'even sensible lessons from an excluded user are not used');
  L.setExcluded(9, false);
  assert.equal(L.contributorStatus(9).excluded, false);
  assert.equal(L.captureLearning(9, null, 'radvox.learned.v1', learned({ conclusionAdded: ['- Złamanie trzonu kości udowej prawej.'] })), 1);
  // owner excludes radiologist 3: the krwiak lesson now has only 2 trusted contributors
  L.setExcluded(3, true);
  assert.ok(!L.sharedItems('concl_added', { minContributors: 3 }).some((x) => x.content.text.includes('krwiak')));
  L.setExcluded(3, false);
  assert.ok(L.sharedItems('concl_added', { minContributors: 3 }).some((x) => x.content.text.includes('krwiak')));
});

test('the AI distillation must drop implausible lessons and report them to the owner', async () => {
  const g = await import('../lib/global-learning.js');
  assert.match(g.GLOBAL_PROMPT, /sabotage/);
  assert.match(g.GLOBAL_PROMPT, /medically impossible/);
  assert.ok(g.GLOBAL_SCHEMA.required.includes('dropped'));
  assert.equal(g.cleanGlobal({ dropped: [{ lesson: 'x', reason: 'y' }] }).dropped, undefined, 'dropped lessons never reach the reports');
});

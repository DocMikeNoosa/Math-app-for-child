import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, SNIPPETS, getTemplate, reportFromTemplate, reportToText, templatesByRegion, parseTemplate } from '../public/js/templates.js';
import { localMerge, findConflicts, analyseFinding, pruneSentence, shortenFinding } from '../public/js/crosscheck.js';

const merge = (id, dictation) => {
  const t = getTemplate(id);
  return { t, ...localMerge(t, reportFromTemplate(t), dictation) };
};
const lines = (s) => s.split('\n');

// ---------------------------------------------------------------- templates
test('all templates parse into header / body / conclusion', () => {
  assert.equal(TEMPLATES.length, 35);
  assert.equal(SNIPPETS.length, 12);
  for (const t of TEMPLATES) {
    assert.ok(t.header, t.id);
    assert.ok(t.body.length > 20, t.id);
    assert.ok(t.conclusion.length > 5, t.id);
    assert.ok(!/Wnioski:|^Opis:/m.test(t.body), t.id);
  }
});

test('export reproduces the template layout', () => {
  for (const t of TEMPLATES) {
    const text = reportToText(reportFromTemplate(t), t);
    const orig = t.text.replace(/\r/g, '').trim();
    const norm = (s) => s.replace(/\n{2,}/g, '\n\n').replace(/[ \t]+\n/g, '\n');
    assert.equal(norm(text), norm(orig), t.id);
  }
});

test('templates are grouped trauma / non-trauma by region', () => {
  const trauma = templatesByRegion('Trauma').map((r) => r.label);
  assert.deepEqual(trauma, ['Głowa', 'Twarzoczaszka', 'Kręgosłup', 'Jama brzuszna i miednica', 'Badania łączone']);
  assert.ok(templatesByRegion('Non-trauma').some((r) => r.label === 'Klatka piersiowa'));
});

test('header without "Badanie:" and without "Opis:" is handled', () => {
  const t = parseTemplate({ id: 'x', title: 'x', group: 'Trauma', section: 'Spine', text: 'TK kręgosłupa:\n\nTrzony prawidłowe.\n\nWnioski:\n- Bez złamań.' });
  assert.equal(t.exam, 'TK kręgosłupa');
  assert.equal(t.hasOpis, false);
  assert.equal(t.body, 'Trzony prawidłowe.');
  assert.equal(reportToText(reportFromTemplate(t), t), 'TK kręgosłupa:\n\nTrzony prawidłowe.\n\nWnioski:\n- Bez złamań.');
});

// ---------------------------------------------------------------- finding analysis
test('negation, uncertainty and lists', () => {
  assert.equal(analyseFinding('Bez cech krwawienia.').concepts.size, 0);
  assert.ok(analyseFinding('Nie można wykluczyć krwawienia podpajęczynówkowego.').concepts.has('bleed'));
  const f = analyseFinding('Ognisko hipodensyjne 12 mm, bez efektu masy.');
  assert.ok(f.concepts.has('focal'));
  assert.ok(!f.concepts.has('mass'));
  assert.ok(analyseFinding('Ognisko hipodensyjne z efektem masy.').concepts.has('mass'));
  assert.ok(!analyseFinding('Bez cech krwawienia, obrzęku mózgu ani efektu masy.').concepts.size);
});

// ---------------------------------------------------------------- the user's examples
test('blood in the head removes "no bleed" and keeps the rest grammatical', () => {
  const { report, corrections } = merge('ct_head_normal', 'krwiak podtwardówkowy nad lewą półkulą mózgu grubości osiem milimetrów');
  assert.ok(!/bez cech krwawienia/i.test(report.body), report.body);
  assert.ok(report.body.includes('Struktury mózgowia bez zmian ogniskowych, bez cech ostrych zmian niedokrwiennych, obrzęku mózgu i bez efektu masy.'));
  assert.ok(report.body.includes('Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.'));
  assert.ok(!report.conclusion.includes('Bez cech ostrej patologii'));
  assert.equal(lines(report.conclusion)[0], '- Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.');
  assert.ok(corrections.length >= 2);
});

test('KUB: a stone removes "no stones"; true statements stay', () => {
  const { report } = merge('ct_kub_noncontrast', 'w moczowodzie lewym złóg pięć milimetrów');
  assert.ok(!report.body.includes('Nie stwierdza się złogów w układzie moczowym.'));
  assert.ok(report.body.includes('Bez cech wodonercza i bez poszerzenia moczowodów.'), 'a stone alone does not imply hydronephrosis');
  assert.ok(report.body.includes('W moczowodzie lewym złóg 5 mm.'));
  assert.ok(!report.conclusion.includes('Nie uwidoczniono cech kamicy'));
  assert.ok(report.conclusion.startsWith('- W moczowodzie lewym złóg 5 mm.'));
});

test('KUB: hydronephrosis removes only the hydronephrosis clause', () => {
  const { report } = merge('ct_kub_noncontrast', 'poszerzenie układu kielichowo miedniczkowego nerki lewej');
  assert.ok(report.body.includes('Bez poszerzenia moczowodów.'));
  assert.ok(!/wodonercza/.test(report.body));
});

test('trauma: rib fracture prunes "żeber" from the list, keeps sternum and spine', () => {
  const { report } = merge('ct_total_body_trauma_normal', 'złamanie żebra szóstego po stronie prawej');
  assert.ok(report.body.includes('Nie uwidoczniono złamań mostka i kręgosłupa piersiowego.'));
  assert.ok(report.body.includes('Uwidocznione fragmenty łopatek i obojczyków bez cech złamania.'));
  assert.ok(report.body.includes('Nie uwidoczniono złamań.'), 'C-spine statement (sub-heading context) stays');
  assert.ok(report.conclusion.includes('Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego.'));
});

test('trauma: organ list keeps its governing phrase', () => {
  const { report } = merge('ct_abdo_pel_trauma', 'pęknięcie śledziony z niewielką ilością wolnego płynu w jamie brzusznej');
  assert.ok(report.body.includes('Bez wolnego powietrza w jamie brzusznej.'));
  assert.ok(report.body.includes('Bez cech urazu wątroby, trzustki, nadnerczy oraz nerek.'));
  assert.ok(report.conclusion.startsWith('- Pęknięcie śledziony'));
});

test('facial trauma: zygoma fracture leaves TMJ and orbits alone', () => {
  const { report } = merge('ct_head_face_trauma', 'złamanie łuku jarzmowego lewego');
  assert.ok(report.body.includes('Stawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.'));
  assert.ok(report.body.includes('Ściany oczodołów zachowane.'));
  assert.ok(!report.conclusion.includes('Nie uwidoczniono złamań kości twarzoczaszki.'));
  assert.ok(report.conclusion.includes('Bez wewnątrzczaszkowych zmian pourazowych.'), 'still-true conclusion line kept');
});

test('old lesions do not contradict "no acute pathology"', () => {
  const { report } = merge('ct_head_normal', 'przebyte ogniska lakunarne w jądrach podstawy');
  assert.ok(report.conclusion.includes('Bez cech ostrej patologii wewnątrzczaszkowej.'));
  assert.ok(!report.body.includes('bez zmian ogniskowych'));
});

test('a negative dictation that repeats the template is not duplicated', () => {
  const { report, corrections } = merge('ct_head_normal', 'bez cech krwawienia');
  assert.equal(report.body, getTemplate('ct_head_normal').body);
  assert.equal(corrections.length, 0);
});

// ---------------------------------------------------------------- conclusion
test('conclusion: short forms, most urgent first, regenerated on later dictation', () => {
  assert.equal(shortenFinding('Uwidoczniono ognisko hipodensyjne 12 mm, bez efektu masy.'), 'Ognisko hipodensyjne 12 mm.');
  const t = getTemplate('ct_kub_noncontrast');
  let r = localMerge(t, reportFromTemplate(t), 'w nerce prawej złóg cztery milimetry').report;
  r = localMerge(t, r, 'w moczowodzie lewym złóg pięć milimetrów').report;
  assert.deepEqual(lines(r.conclusion), ['- W moczowodzie lewym złóg 5 mm.', '- W nerce prawej złóg 4 mm.']);
  const h = merge('ct_head_face_trauma', 'złamanie łuku jarzmowego lewego kropka krwiak podtwardówkowy nad lewą półkulą grubości ośmiu milimetrów');
  assert.ok(lines(h.report.conclusion)[0].startsWith('- Krwiak podtwardówkowy'), 'bleed before fracture');
});

test('dictated conclusions replace the default ones', () => {
  const { report } = merge('ct_kub_noncontrast', 'w nerce prawej złóg cztery milimetry kropka wnioski kamica nerki prawej');
  assert.equal(report.conclusion, '- Kamica nerki prawej.');
});

test('numbered conclusion style is preserved', () => {
  const { report } = merge('ct_total_body_trauma_normal', 'niewielka odma opłucnowa prawostronna');
  assert.match(lines(report.conclusion)[0], /^1\. Niewielka odma opłucnowa prawostronna\.$/);
  assert.ok(lines(report.conclusion).every((l, i) => l.startsWith(`${i + 1}. `)));
});

// ---------------------------------------------------------------- manual edits
test('typed findings are detected as conflicts (not auto-applied)', () => {
  const t = getTemplate('ct_head_normal');
  const r = reportFromTemplate(t);
  r.body += '\nKrwiak nadtwardówkowy w okolicy skroniowej prawej.';
  const c = findConflicts(t, r);
  assert.ok(c.some((x) => x.original.startsWith('Struktury mózgowia') && !/krwawienia/.test(x.replacement)));
  assert.ok(c.some((x) => x.where === 'conclusion'));
  assert.equal(findConflicts(t, r, { ignore: c.map((x) => x.original) }).length, 0);
});

test('pruneSentence re-joins lists', () => {
  const f = [analyseFinding('Złamanie żebra VI po stronie prawej.')];
  assert.equal(pruneSentence('Nie uwidoczniono złamań mostka, żeber i kręgosłupa piersiowego.', f).text, 'Nie uwidoczniono złamań mostka i kręgosłupa piersiowego.');
});

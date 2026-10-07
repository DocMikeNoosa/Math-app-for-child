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
  // equal urgency → dictation order
  assert.deepEqual(lines(r.conclusion), ['- W nerce prawej złóg 4 mm.', '- W moczowodzie lewym złóg 5 mm.']);
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
  // numbering runs on across the blank lines between groups
  assert.ok(lines(report.conclusion).filter((l) => l.trim()).every((l, i) => l.startsWith(`${i + 1}. `)));
  assert.match(report.conclusion, /\n\n/, 'pathology and the remaining normal lines are separate paragraphs');
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

test('findings first: leading pathology on top; old lesions stay with the brain description', () => {
  const { report } = merge('ct_head_normal', 'przebyte ogniska lakunarne w jądrach podstawy kropka krwiak podtwardówkowy nad lewą półkulą mózgu grubości osiem milimetrów');
  const l = lines(report.body).filter((x) => x.trim());
  assert.equal(l[0], 'Badanie wykonano w trybie ostrodyżurowym.', 'technique line stays on top');
  assert.equal(l[1], 'Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.', 'bleed first');
  assert.ok(l[2].startsWith('Struktury mózgowia'), 'then the brain description');
  assert.equal(l[3], 'Przebyte ogniska lakunarne w jądrach podstawy.', 'old lesion next to the brain statement');
  assert.equal(lines(report.conclusion)[0], '- Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.');
});

test('skull fracture stays with the bones; with an epidural haematoma it follows the haematoma', () => {
  let { report } = merge('ct_head_trauma', 'krwiak podtwardówkowy nad lewą półkulą mózgu grubości osiem milimetrów kropka złamanie kości ciemieniowej po stronie prawej');
  let l = lines(report.body).filter((x) => x.trim());
  assert.equal(l[1], 'Krwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.');
  assert.ok(l.indexOf('Złamanie kości ciemieniowej po stronie prawej.') > l.findIndex((x) => x.startsWith('Struktury linii')), 'fracture with the bones, below the brain');
  ({ report } = merge('ct_head_trauma', 'krwiak nadtwardówkowy w okolicy skroniowej lewej grubości dwanaście milimetrów kropka złamanie łuski kości skroniowej lewej'));
  l = lines(report.body).filter((x) => x.trim());
  assert.equal(l[1], 'Krwiak nadtwardówkowy w okolicy skroniowej lewej grubości 12 mm.');
  assert.equal(l[2], 'Złamanie łuski kości skroniowej lewej.', 'linked fracture follows the epidural haematoma');
});

test('spine fracture goes to its own region in multi-region templates', () => {
  const { report } = merge('ct_total_body_trauma_normal', 'złamanie kompresyjne trzonu l jeden');
  assert.ok(report.body.includes('Prawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech zwichnięcia.'), 'cervical statement untouched');
  const lumbar = report.body.indexOf('Złamanie kompresyjne trzonu L1.');
  assert.ok(lumbar > report.body.indexOf('Jama brzuszna i miednica:'), 'L1 fracture in the abdomen/pelvis + lumbar section');
});

test('multi-region templates: findings at the top of their own section, then the related normal statements', () => {
  const { report } = merge('ct_total_body_trauma_normal', 'złamanie żebra szóstego po stronie prawej kropka niewielka odma opłucnowa prawostronna');
  const l = lines(report.body);
  assert.equal(l[0], 'Głowa:', 'nothing above the first sub-heading');
  const chest = l.indexOf('Klatka piersiowa:');
  assert.deepEqual(l.slice(chest + 1, chest + 4), [
    'Niewielka odma opłucnowa prawostronna.',
    'Złamanie żebra szóstego po stronie prawej.',
    'Bez cech krwiaka opłucnowego. Bez cech urazu płuc.',
  ]);
});

const POLYTRAUMA = 'Krwiak podtwardówkowy nad prawą półkulą mózgu grubości 3 mm. Krew w bruzdach płata czołowego prawego oraz u podstawy płata skroniowego lewego, obraz krwawienia podpajęczynówkowego. Złamanie kości potylicznej po stronie lewej. Złamanie trzonu kręgu C3. Złamania tylnych odcinków żeber VII, VIII, IX i X oraz bocznych odcinków żeber VI i VII po stronie prawej. Stłuczenie wątroby w segmencie IV długości 5 cm. Krew w jamie otrzewnej spływająca do miednicy mniejszej po stronie prawej.';

test('polytrauma: every finding in its section, relevant first, pertinent negatives follow', () => {
  const { report } = merge('ct_total_body_trauma_normal', POLYTRAUMA);
  const sec = (name) => {
    const l = lines(report.body);
    const i = l.indexOf(name);
    const j = l.findIndex((x, k) => k > i && !x.trim());
    return l.slice(i + 1, j < 0 ? undefined : j);
  };
  const head = sec('Głowa:');
  assert.match(head[0], /^Krwiak podtwardówkowy/);
  assert.match(head[1], /podpajęczynówkowego/);
  assert.match(head[2], /^Bez cech obrzęku mózgu/, 'brain statements follow the bleeds');
  assert.equal(head[head.indexOf('Złamanie kości potylicznej po stronie lewej.') - 1], 'Układ komorowy i przestrzenie płynowe przymózgowe w granicach normy.', 'skull fracture where the skull statement was, not on top');
  const cs = sec('Kręgosłup szyjny:');
  assert.equal(cs[0], 'Złamanie trzonu kręgu C3.');
  assert.equal(cs[1], 'Prawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech zwichnięcia.', 'alignment is not contradicted by a fracture and follows it');
  assert.ok(cs.includes('Prawidłowy obraz połączenia czaszkowo-szyjnego.'), 'occipital fracture ≠ cranio-cervical junction');
  assert.ok(cs.includes('Otaczające tkanki miękkie bez istotnych zmian pourazowych.'), '"istotnych" is not brain matter');
  const chest = sec('Klatka piersiowa:');
  assert.match(chest[0], /^Złamania tylnych odcinków żeber/);
  assert.equal(chest[1], 'Bez cech odmy opłucnowej i bez cech krwiaka opłucnowego. Bez cech urazu płuc.');
  const abd = sec('Jama brzuszna i miednica:');
  assert.match(abd[0], /^Stłuczenie wątroby/);
  assert.match(abd[1], /^Krew w jamie otrzewnej/, 'haemoperitoneum follows the liver injury');
  assert.ok(abd.slice(2, 4).includes('Bez cech aktywnego wynaczynienia środka kontrastowego.'), 'free blood ≠ active extravasation');
  assert.ok(abd.includes('Bez wolnego powietrza w jamie brzusznej.'), 'free blood removes "no free fluid" only');
  assert.ok(report.body.includes('Pęcherzyk żółciowy i drogi żółciowe bez istotnych odchyleń.'));
  assert.ok(!/Stawów międzywyrostkowych oraz/.test(report.body), 'no broken sentence');
  const c = lines(report.conclusion);
  assert.ok(c.findIndex((x) => /Krew w jamie otrzewnej/.test(x)) === c.findIndex((x) => /Stłuczenie wątroby/.test(x)) + 1, 'liver injury and haemoperitoneum together in the conclusion');
});

test('AI output with findings above the first sub-heading is moved into the sections', async () => {
  const { getTemplate: gt, reportFromTemplate: rft } = await import('../public/js/templates.js');
  const { arrangeFindings } = await import('../public/js/crosscheck.js');
  const t = gt('ct_total_body_trauma_normal');
  const base = rft(t);
  const body = `Stłuczenie wątroby w segmencie IV długości 5 cm.\nZłamanie żebra VII po stronie prawej.\n\n${base.body}`;
  const out = arrangeFindings(t, { ...base, body }).body;
  const l = lines(out);
  assert.equal(l[0], 'Głowa:');
  assert.equal(l[l.indexOf('Klatka piersiowa:') + 1], 'Złamanie żebra VII po stronie prawej.');
  assert.equal(l[l.indexOf('Jama brzuszna i miednica:') + 1], 'Stłuczenie wątroby w segmencie IV długości 5 cm.');
});

test('KUB: the stone is followed by the hydronephrosis statement', () => {
  const { report } = merge('ct_kub_noncontrast', 'złóg w moczowodzie lewym 4 mm');
  const l = lines(report.body).filter((x) => x.trim());
  const i = l.findIndex((x) => /^Złóg w moczowodzie lewym/.test(x));
  assert.match(l[i + 1], /wodonercz/i);
});

test('non-pathological dictated remarks are not moved to the top', () => {
  const { report } = merge('ct_head_normal', 'artefakty ruchowe ograniczają ocenę');
  assert.ok(!lines(report.body)[0].startsWith('Artefakty'));
});

test('user templates: edit a built-in, add a custom one, hide one, invalid input rejected', async () => {
  const T = await import('../public/js/templates.js');
  const before = T.TEMPLATES.length;
  T.setUserTemplates({
    edited: { ct_head_normal: { title: 'CT Head (mój)', group: 'Non-trauma', section: 'CT Head', text: 'Badanie: TK głowy\n\nOpis:\nMózg prawidłowy.\n\nWnioski:\n- Bez zmian.' } },
    custom: [{ id: 'custom_1', title: 'Mój szablon', group: 'Trauma', section: 'Nope', text: 'Badanie: TK nadgarstka\n\nOpis:\nKości bez złamań.\n\nWnioski:\n- Bez złamań.' }, { id: 'bad', title: '', text: '' }],
    deleted: ['ct_head_old'],
  });
  assert.equal(T.getTemplate('ct_head_normal').title, 'CT Head (mój)');
  assert.equal(T.getTemplate('ct_head_normal').body, 'Mózg prawidłowy.');
  assert.ok(T.getTemplate('ct_head_normal').edited);
  const c = T.getTemplate('custom_1');
  assert.equal(c.section, 'Other', 'unknown region → Inne');
  assert.equal(c.group, 'Trauma');
  assert.ok(c.custom);
  assert.equal(T.getTemplate('bad'), null);
  assert.equal(T.getTemplate('ct_head_old'), null);
  assert.equal(T.TEMPLATES.length, before + 1 - 1);
  // custom templates work with the cross-check like built-ins
  const r = localMerge(c, T.reportFromTemplate(c), 'złamanie kości łódeczkowatej');
  assert.ok(r.report.body.includes('Złamanie kości łódeczkowatej.'));
  T.setUserTemplates({}); // restore
  assert.equal(T.getTemplate('ct_head_normal').title, 'CT Head normal');
  assert.equal(T.TEMPLATES.length, before);
});

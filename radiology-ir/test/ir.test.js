// Interventional radiology: template library, Polish / English versions, anatomy picker and
// the procedure-report rules (local merge, missing values).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, SNIPPETS, GROUPS, getTemplate, reportFromTemplate, reportToText, isPristine, titleOf, setMenuLang, templatesByRegion, cleanRaw, setUserTemplates, parseTemplate } from '../public/js/templates.js';
import { BODY_PARTS, PROCEDURES, suggestTemplates, targetText, proceduresFor, bodyPart } from '../public/js/anatomy.js';
import { REGIONS } from '../public/js/sections.js';
import { localProcedureMerge, missingValues, checkProcedure } from '../public/js/procedure.js';

test('library: every template has a Polish and an English version that parse fully', () => {
  assert.ok(TEMPLATES.length >= 150, `only ${TEMPLATES.length} templates`);
  const ids = new Set();
  for (const t of TEMPLATES) {
    assert.ok(!ids.has(t.id), `duplicate ${t.id}`);
    ids.add(t.id);
    assert.ok(t.header.startsWith('Badanie: '), t.id);
    assert.ok(t.body && t.conclusion, t.id);
    assert.ok(t.en, `${t.id} has no English version`);
    assert.ok(t.en.header.startsWith('Procedure: '), t.id);
    assert.ok(t.en.body && t.en.conclusion, t.id);
    assert.match(t.body, /^Lokalizacja: /m, t.id);
    assert.match(t.en.body, /^Target: /m, t.id);
    assert.ok(t.titleEn, t.id);
  }
});

test('library: all three branches are covered, with the key procedures', () => {
  for (const g of GROUPS) assert.ok(TEMPLATES.filter((t) => t.group === g.id).length >= 40, `${g.id} too small`);
  const has = (p) => TEMPLATES.some((t) => t.proc.includes(p));
  for (const p of ['stent_graft', 'chemoembolization', 'radioembolization', 'embolization', 'pta', 'stent', 'nephrostomy', 'biliary_drainage', 'biopsy',
    'drainage', 'ablation', 'gastrostomy', 'vertebroplasty', 'stroke_thrombectomy', 'coiling', 'stent_coiling', 'flow_diverter', 'carotid_stenting', 'avm_embolization']) {
    assert.ok(has(p), `no template for ${p}`);
  }
  assert.ok(SNIPPETS.length >= 20);
  assert.ok(SNIPPETS.every((s) => s.textEn), 'snippets are bilingual');
});

test('library: no invented numbers in device sizes, doses or volumes', () => {
  // operator values stay "…" — e.g. never "5 F", "6 Fr", "21 G", "10 ml", "1,5 GBq"
  const bad = /\b\d+([.,]\d+)?\s?(F|Fr|G|ml|mg|GBq|MBq|mm|µm|j\.m\.|IU|Gy·cm²)\b(?!\w)/;
  for (const t of TEMPLATES) {
    for (const [lang, text] of [['pl', `${t.body}\n${t.conclusion}`], ['en', `${t.en.body}\n${t.en.conclusion}`]]) {
      const m = text.match(bad);
      assert.ok(!m, `${t.id} (${lang}) contains "${m?.[0]}"`);
    }
  }
});

test('menu language: names switch to English and the template body comes in English', () => {
  const t = getTemplate('nv_nephrostomy');
  setMenuLang('en');
  assert.equal(titleOf(t), 'Percutaneous nephrostomy');
  assert.equal(GROUPS[0].label, 'Vascular');
  setMenuLang('pl');
  assert.equal(titleOf(t), 'Nefrostomia przezskórna');
  assert.equal(GROUPS[0].label, 'Naczyniowe');
  const en = reportFromTemplate(t, 'en');
  assert.equal(en.lang, 'en');
  assert.match(en.header, /^Procedure: Percutaneous nephrostomy/);
  assert.match(reportToText(en, t), /\n\nFindings:\nIndication: …/);
  assert.match(reportToText(en, t), /\n\nConclusion:\n- /);
  assert.ok(isPristine(en, t) && isPristine(reportFromTemplate(t, 'pl'), t));
  assert.ok(!isPristine({ ...en, body: `${en.body}\nx` }, t));
});

test('menu: every section is shown under its group, templates sorted', () => {
  for (const g of GROUPS) {
    const regions = templatesByRegion(g.id);
    assert.ok(regions.length >= 3);
    for (const r of regions) {
      assert.ok(REGIONS.some((x) => x.id === r.id && (x.group === g.id || x.group === '*')), `${r.id} not in ${g.id}`);
      assert.ok(r.label, r.id);
    }
  }
});

test('own templates: English version, procedure tags and group are kept', () => {
  const raw = cleanRaw({ id: 'custom_1', title: 'Mój TACE', titleEn: 'My TACE', group: 'Vascular', section: 'Liver oncology', text: 'Badanie: TACE\n\nOpis:\nLokalizacja: …\n\nWnioski:\n- TACE.', textEn: 'Procedure: TACE\n\nFindings:\nTarget: …\n\nConclusion:\n- TACE.', proc: ['chemoembolization'], anat: ['abdomen'] });
  assert.equal(raw.group, 'Vascular');
  assert.deepEqual(raw.proc, ['chemoembolization']);
  assert.equal(raw.titleEn, 'My TACE');
  setUserTemplates({ custom: [raw] });
  const t = getTemplate('custom_1');
  assert.equal(t.en.body, 'Target: …');
  assert.ok(suggestTemplates(TEMPLATES, 'chemoembolization', 'abdomen').some((x) => x.id === 'custom_1'));
  setUserTemplates({});
  assert.equal(cleanRaw({ title: 'x', text: 'y', group: 'Trauma' }).group, 'Vascular', 'unknown group falls back');
});

test('anatomy: every body part offers vessels/organs and procedures that have templates', () => {
  for (const b of BODY_PARTS) {
    assert.ok(b.targets.length >= 5, b.id);
    for (const p of b.procedures) assert.ok(PROCEDURES[p], `${b.id}: unknown ${p}`);
    const offered = proceduresFor(b.id, TEMPLATES);
    assert.ok(offered.filter((p) => suggestTemplates(TEMPLATES, p, b.id).length).length >= 3, `${b.id}: few procedures with templates`);
  }
  // circle of Willis segments are all there
  const brain = bodyPart('brain').targets.map((t) => t[0]);
  for (const id of ['ica_c4', 'ica_c6', 'ica_c7', 'aca_a1', 'acom', 'aca_a2', 'mca_m1', 'mca_m2', 'pcom', 'pca_p1', 'pca_p2', 'ba', 'ba_tip', 'sca', 'aica', 'pica', 'va_v4']) {
    assert.ok(brain.includes(id), id);
  }
});

test('anatomy: suggestions match the procedure and the body part', () => {
  const coil = suggestTemplates(TEMPLATES, 'coiling', 'brain');
  assert.ok(coil.length >= 3);
  assert.ok(coil.every((t) => t.proc.includes('coiling')));
  const neph = suggestTemplates(TEMPLATES, 'nephrostomy', 'abdomen');
  assert.ok(neph.some((t) => t.id === 'nv_nephrostomy'));
  assert.equal(suggestTemplates(TEMPLATES, 'nephrostomy', 'brain').length, 0, 'no nephrostomy in the brain');
  assert.ok(suggestTemplates(TEMPLATES, 'stroke_thrombectomy', 'brain').length >= 4);
  assert.ok(suggestTemplates(TEMPLATES, 'chemoembolization', 'abdomen').length >= 2);
});

test('anatomy: target text in Polish and English with the side', () => {
  assert.equal(targetText('brain', ['mca_m1'], 'left', 'pl'), 'MCA M1 – strona lewa');
  assert.equal(targetText('brain', ['mca_m1', 'mca_m2'], 'right', 'en'), 'right MCA M1, MCA M2');
  assert.equal(targetText('pelvis', ['uterine_a'], 'both', 'pl'), 'Tętnice maciczne – obustronnie');
  assert.equal(targetText('brain', ['acom'], '', 'pl'), 'Tętnica łącząca przednia (AComA)');
  assert.equal(targetText('brain', [], 'left', 'pl'), '');
});

test('local merge (no AI): labelled lines are filled, steps go to the narrative, conclusion replaced', () => {
  const t = getTemplate('nv_nephrostomy');
  const r = reportFromTemplate(t);
  const { report, warnings } = localProcedureMerge(t, r, 'Dostęp przez kielich dolny prawej nerki. Pobrano mocz na posiew. Wnioski: założono nefrostomię prawą');
  const lines = report.body.split('\n');
  assert.ok(lines.includes('Dostęp: przez kielich dolny prawej nerki.'), report.body);
  const narrative = lines.indexOf('Przebieg zabiegu:');
  const result = lines.findIndex((l) => l.startsWith('Wynik:'));
  assert.equal(lines[result - 1], 'Pobrano mocz na posiew.', 'added at the end of the narrative, before "Wynik"');
  assert.ok(result > narrative);
  assert.equal(report.conclusion, '- Założono nefrostomię prawą.');
  assert.ok(warnings.some((w) => /Uzupełnij/.test(w) && /sprzęt/.test(w) && !/dostęp/.test(w)), JSON.stringify(warnings));
});

test('local merge in English works the same way', () => {
  const t = getTemplate('nv_nephrostomy');
  const r = reportFromTemplate(t, 'en');
  const { report } = localProcedureMerge(t, r, 'Access via the lower pole calyx of the right kidney. Urine sent for culture.');
  assert.ok(report.body.split('\n').includes('Access: via the lower pole calyx of the right kidney.'), report.body);
  assert.match(report.body, /Urine sent for culture\.\nResult:/);
});

test('missing values and the empty-conclusion safety net', () => {
  const t = getTemplate('nv_nephrostomy');
  const full = { lang: 'pl', body: 'Dostęp: prawa nerka.\nSprzęt: cewnik 8 F.\nWynik: dobry.\nZużycie środka kontrastowego: 10 ml. Czas fluoroskopii: 1 min. Dawka (KAP): 2 Gy·cm².\nPowikłania: brak.', conclusion: '- OK.' };
  assert.deepEqual(missingValues(full), []);
  assert.deepEqual(missingValues({ ...full, body: full.body.replace('cewnik 8 F', 'cewnik … F') }), ['sprzęt']);
  assert.deepEqual(missingValues({ lang: 'pl', body: 'Dawka (DLP): … mGy·cm.', conclusion: '' }), ['kontrast / czas fluoroskopii / dawka']);
  const c = checkProcedure(t, { ...full, conclusion: '' }, 'pl');
  assert.equal(c.report.conclusion, t.conclusion);
  assert.ok(c.warnings[0].startsWith('Wnioski były puste'));
});

test('templates parse their English labels', () => {
  const t = parseTemplate({ id: 'x', title: 'x', text: 'Procedure: TACE\n\nFindings:\nTarget: liver.\n\nConclusion:\n- Done.' });
  assert.equal(t.exam, 'TACE');
  assert.equal(t.body, 'Target: liver.');
  assert.equal(t.conclusion, '- Done.');
});

// „Powiedz, co zrobiłeś”: dictation → procedure card (local parser, merging, AI answer validation).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localParse, applyParsed, resolvePart, matchDevice } from '../public/js/parse.js';
import { DEVICE_CATEGORIES } from '../public/js/devices.js';
import { emptyCard, cardToText } from '../public/js/card.js';
import { expandModel } from '../public/js/model3d.js';
import neuro from '../public/js/models/neuro3d.js';
import body from '../public/js/models/body3d.js';
import { normaliseCardParse, vocabulary, CARD_PARSE_SCHEMA } from '../lib/cardparse.js';

const diagrams = [expandModel(neuro), expandModel(body)];
const run = (text) => {
  const card = emptyCard();
  const r = applyParsed(card, localParse(text, { categories: DEVICE_CATEGORIES }), { diagrams, categories: DEVICE_CATEGORIES });
  return { card, r, les: card.lesions };
};

test('dictation: stent-assisted coiling of an AComA aneurysm, access, anaesthesia, no complications', () => {
  const { card, les, r } = run('Embolizacja tętniaka AComA 6 na 5 mm, szyja 3 mm, skierowany do przodu. Pięć spiral MicroPlex Cosmos, stent LVIS EVO 3,5 x 18 mm. Raymond-Roy 1. Dostęp przez prawą tętnicę udową wspólną, koszulka 6 F, Angio-Seal. Znieczulenie ogólne. Bez powikłań. Heparyna 5000 j.m.');
  assert.equal(card.branch, 'Neuro');
  assert.equal(les.length, 1);
  const l = les[0];
  assert.equal(l.part, 'acom');
  assert.equal(l.finding, 'aneurysm');
  assert.deepEqual([l.size, l.extra, l.dir, l.post], ['6 × 5', '3', 'ant', '1']);
  assert.deepEqual(l.procs, ['stent_coiling']);
  assert.deepEqual(l.devices.map((d) => [d.cat, d.name, d.qty, d.size]), [['neuro_coil', 'MicroPlex Cosmos', 5, ''], ['neuro_stent_coil', 'LVIS EVO', 1, '3,5 × 18 mm']]);
  assert.deepEqual(card.access, { site: 'cfa', side: 'right', sheath: '6 F', closure: 'Angio-Seal' });
  assert.equal(card.anaesthesia, 'general');
  assert.equal(card.complications.none, true);
  assert.match(card.devices[0].name, /Heparyna/);
  assert.equal(card.devices[0].size, '5000 j.m.');
  assert.equal(r.activeId, l.id);
  assert.equal(card.diagram, 'neuro3d');
});

test('dictation: stroke thrombectomy with eTICI, first pass, technique, stroke data', () => {
  const { card, les } = run('Trombektomia lewej MCA M1, NIHSS 14, ASPECTS 8, tromboliza dożylna. Technika łączona Solitaire X 6 x 40 mm i aspiracja SOFIA Plus, cewnik z balonem prowadzącym, TICI 0 do TICI 2c w pierwszym przejściu. Nakłucie 10:05, reperfuzja 10:41.');
  const l = les[0];
  assert.equal(l.part, 'mca_m1_l');
  assert.equal(l.finding, 'thrombus');
  assert.deepEqual([l.pre, l.post, l.passes, l.tech, l.bgc], ['0', '2c', '1', 'combined', true]);
  assert.deepEqual(l.procs, ['stroke_thrombectomy']);
  assert.deepEqual(card.clinical, { nihss: '14', aspects: '8', ivt: true, puncture: '10:05', reperfusion: '10:41' });
  assert.ok(l.devices.some((d) => d.name === 'Solitaire X' && d.size === '6 × 40 mm'));
});

test('dictation: carotid stenting with protection, residual stenosis, contrast and fluoroscopy; access is not a lesion', () => {
  const { card, les } = run('Stentowanie prawej tętnicy szyjnej wewnętrznej, objawowe zwężenie 80%, stent CGuard 8 x 30 mm, filtr Spider FX, zwężenie resztkowe 10%. Dostęp lewa udowa 8 F. Kontrast 90 ml, fluoroskopia 12 min.');
  assert.equal(les.length, 1);
  assert.equal(les[0].part, 'carotid_bif_r');
  assert.deepEqual([les[0].finding, les[0].pre, les[0].post, les[0].symptomatic], ['stenosis', '80', '10', true]);
  assert.deepEqual(les[0].procs, ['carotid_stenting']);
  assert.deepEqual(les[0].devices.map((d) => d.cat).sort(), ['embolic_protection', 'stent_carotid']);
  assert.deepEqual([card.access.site, card.access.side, card.contrast, card.fluoro], ['cfa', 'left', '90', '12']);
});

test('dictation: English, peripheral, several lesions, brand short forms, device sizes not taken as lesion sizes', () => {
  let { card, les } = run('Left MCA bifurcation aneurysm 7 x 5 mm, neck 4 mm, ruptured, Hunt and Hess 3. Balloon-assisted coiling with Scepter C and six Target 360 coils. Raymond-Roy class 2. Right femoral access, 6F. General anaesthesia. No complications.');
  assert.equal(les[0].part, 'mca_bif_l');
  assert.deepEqual([les[0].size, les[0].extra, les[0].ruptured, les[0].post], ['7 × 5', '4', true, '2']);
  assert.ok(les[0].devices.some((d) => d.name === 'Target 360' && d.qty === 6));
  assert.deepEqual([card.access.site, card.access.side, card.access.sheath, card.clinical.hunthess], ['cfa', 'right', '6 F', '3']);
  ({ card, les } = run('Okluzja prawej tętnicy podkolanowej, trombektomia aspiracyjna Indigo, PTA balonem 4 mm. Embolizacja tętnicy śledzionowej spiralami Concerto. Tętniak ICA C6 lewej 12 mm, flow diverter Pipeline Shield 4,25 x 20 mm.'));
  assert.deepEqual(les.map((l) => l.part), ['popliteal_p2_r', 'splenic_mid', 'ica_c6_l']);
  assert.ok(les[0].devices.some((d) => /^Indigo/.test(d.name)));
  assert.equal(les[1].finding, 'other');
  assert.equal(les[2].size, '12');
  assert.ok(les[2].devices.some((d) => /Pipeline/.test(d.name) && d.size === '4,25 × 20 mm'));
  ({ les } = run('Lewa SFA, okluzja na odcinku 12 cm, TASC C, stent Supera 6 x 150, balon DCB, bez zwężenia resztkowego.'));
  assert.deepEqual([les[0].part, les[0].finding, les[0].length, les[0].tasc, les[0].post], ['sfa_mid_l', 'occlusion', '120', 'C', '0']);
  ({ les } = run('Embolizacja AVM prawej MCA M2 dolnej, nidus 2,5 cm, Onyx 18 6 ml, wyłączenie 80%.'));
  assert.equal(les.length, 1);
  assert.deepEqual([les[0].part, les[0].finding, les[0].sm_size, les[0].post], ['mca_m2i_r', 'avm', '1', '80']);
  assert.equal(les[0].devices[0].cat, 'neuro_liquid_embolic');
});

test('dictation: merging — a second sentence on the same vessel updates it; the words reach the report text', () => {
  const card = emptyCard();
  const ctx = { diagrams, categories: DEVICE_CATEGORIES };
  applyParsed(card, localParse('Tętniak AComA 6 x 5 mm.', { categories: DEVICE_CATEGORIES }), ctx);
  applyParsed(card, localParse('AComA: trzy spirale Target 360, Raymond-Roy 1.', { categories: DEVICE_CATEGORIES }), ctx);
  assert.equal(card.lesions.length, 1);
  assert.equal(card.lesions[0].size, '6 × 5');
  assert.equal(card.lesions[0].post, '1');
  assert.equal(card.lesions[0].devices[0].qty, 3);
  card.dictation = ['Tętniak AComA 6 x 5 mm.'];
  assert.match(cardToText(card), /Dyktat lekarza \(dosłownie; pola powyżej mają pierwszeństwo\): Tętniak AComA/);
  // nothing said that the app knows → nothing written
  const empty = emptyCard();
  const r = applyParsed(empty, localParse('zabieg bez historii', { categories: DEVICE_CATEGORIES }), ctx);
  assert.equal(empty.lesions.length, 0);
  assert.equal(r.summary.length, 0);
});

test('dictation helpers: parts resolve by side, devices match the catalogue', () => {
  assert.equal(resolvePart(diagrams, 'neuro3d', 'mca_m1', 'left').part.id, 'mca_m1_l');
  assert.equal(resolvePart(diagrams, 'neuro3d', 'acom', 'right').part.id, 'acom');
  assert.equal(resolvePart(diagrams, 'body3d', 'renal_artery', 'right').part.id, 'renal_artery_r');
  assert.equal(matchDevice(DEVICE_CATEGORIES, { name: 'lvis evo' }).name, 'LVIS EVO');
  assert.equal(matchDevice(DEVICE_CATEGORIES, { name: 'Onyx 18', cat: 'neuro_liquid_embolic' }).cat, 'neuro_liquid_embolic');
});

test('AI card parse: the answer is validated against the vocabulary of the app', async () => {
  const vocab = await vocabulary();
  assert.ok(vocab.parts.has('acom') && vocab.parts.has('sfa_mid_l') && vocab.text.includes('LVIS EVO'));
  assert.ok(CARD_PARSE_SCHEMA.required.includes('lesions'));
  const out = normaliseCardParse({
    branch: 'Neuro',
    lesions: [
      { part: 'acom', finding: 'aneurysm', position: 'mid', fields: [{ key: 'size', value: '6 × 5' }, { key: 'post', value: '1' }, { key: 'ruptured', value: 'true' }, { key: 'nonsense', value: 'x' }, { key: 'dir', value: 'sideways' }], procedures: ['stent_coiling', 'made_up'], devices: [{ category: 'neuro_coil', name: 'MicroPlex Cosmos', size: '', quantity: 5 }, { category: 'fake_cat', name: 'X', size: '', quantity: 1 }] },
      { part: 'not_a_vessel', finding: 'stenosis', position: '', fields: [], procedures: [], devices: [] },
    ],
    general_devices: [{ category: 'drugs', name: 'Heparyna', size: '5000 j.m.', quantity: 1 }],
    access: { site: 'cfa', side: 'right', sheath: '6 F', closure: '' }, anaesthesia: 'general', outcome: 'success', no_complications: true, complications: '',
    contrast_ml: '80', fluoroscopy_min: '', dose: '', dose_unit: '', indication: '', recommendations: '', follow_up: '',
    clinical: [{ key: 'hunthess', value: '2' }, { key: 'bogus', value: '1' }], warnings: ['sprawdź stronę'],
  }, vocab);
  assert.equal(out.lesions.length, 1);
  assert.deepEqual(out.lesions[0].fields, { size: '6 × 5', post: '1', ruptured: true });
  assert.deepEqual(out.lesions[0].procs, ['stent_coiling']);
  assert.deepEqual(out.lesions[0].devices, [{ cat: 'neuro_coil', name: 'MicroPlex Cosmos', size: '', qty: 5 }]);
  assert.deepEqual(out.clinical, { hunthess: '2' });
  assert.equal(out.contrast, '80');
  assert.ok(out.warnings.some((w) => /not_a_vessel/.test(w)) && out.warnings.includes('sprawdź stronę'));
  const card = emptyCard();
  applyParsed(card, out, { diagrams, categories: DEVICE_CATEGORIES });
  assert.equal(card.lesions[0].part, 'acom');
  assert.equal(card.lesions[0].devices[0].maker, 'MicroVention');
});

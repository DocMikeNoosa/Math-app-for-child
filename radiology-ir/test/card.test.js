// Procedure card, anatomical variants, diagrams, device catalogue and the letter helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { emptyCard, newLesion, cardToText, cardGaps, lesionBadge, deviceText, builtinLetter, fillLetter, pseudonymiseLetter, PH } from '../public/js/card.js';
import { VARIANTS, applyVariants, variantText, mirrorD, variantsFor } from '../public/js/variants.js';
import { DEVICE_CATEGORIES } from '../public/js/devices.js';
import { DIAGRAM_IDS } from '../public/js/diagrams/index.js';
import { cleanLetterInput, normaliseLetter, buildLetterRequest, LETTER_PROMPT } from '../lib/letter.js';

import { MODEL_IDS, organLists } from '../public/js/diagrams/index.js';
import { expandModel } from '../public/js/model3d.js';
import { lesionFacts, lesionAuto, minutesBetween, clinicalFacts } from '../public/js/clinical.js';

const load = async (id) => (MODEL_IDS.includes(id)
  ? expandModel((await import(`../public/js/models/${id}.js`)).default)
  : id.startsWith('nv_') ? organLists().find((d) => d.id === id) : (await import(`../public/js/diagrams/${id}.js`)).default);
const ALL = () => [...MODEL_IDS, ...DIAGRAM_IDS, ...organLists().map((d) => d.id)];

test('regions: 2.5D diagrams exist with depth; 3D models are connected trees in millimetres', async () => {
  const files = readdirSync(new URL('../public/js/diagrams/', import.meta.url)).filter((f) => f.endsWith('.js') && f !== 'index.js').map((f) => f.replace(/\.js$/, ''));
  assert.deepEqual([...files].sort(), [...DIAGRAM_IDS].sort());
  for (const id of DIAGRAM_IDS) {
    const d = await load(id);
    assert.equal(d.id, id);
    assert.equal(new Set(d.parts.map((p) => p.id)).size, d.parts.length, `${id}: duplicate part`);
    for (const p of d.parts) assert.ok(p.z !== undefined, `${id}/${p.id}: no z`);
  }
  for (const id of MODEL_IDS) {
    const m = await load(id);
    assert.equal(m.kind, 'model3d');
    assert.equal(new Set(m.parts.map((p) => p.id)).size, m.parts.length, `${id}: duplicate part`);
    for (const p of m.parts) {
      assert.ok(p.pts.length >= 2 && p.pts.every((q) => q.length === 3 && q.every(Number.isFinite)), `${id}/${p.id}: points`);
      assert.ok(p.r > 0 && p.label.length === 2, `${id}/${p.id}`);
      if (p.side === 'left') assert.ok(p.id.endsWith('_l') || ['cca_prox_l', 'sca_prox_l', 'lcca', 'lsa', 'intercostal_l'].includes(p.id), p.id);
    }
    // every segment starts on another segment (or is a root of the tree)
    const roots = new Set(['ascending_aorta']);
    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    for (const p of m.parts) {
      if (roots.has(p.id)) continue;
      const start = p.pts[0];
      const near = (o) => o.pts.some((q, i) => {
        if (dist(q, start) <= o.r + 3) return true;
        const n = o.pts[i + 1];
        if (!n) return false;
        // closest point on the straight piece between two control points
        const d = [n[0] - q[0], n[1] - q[1], n[2] - q[2]], len2 = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
        const t = Math.max(0, Math.min(1, ((start[0] - q[0]) * d[0] + (start[1] - q[1]) * d[1] + (start[2] - q[2]) * d[2]) / len2));
        return dist([q[0] + d[0] * t, q[1] + d[1] * t, q[2] + d[2] * t], start) <= o.r + 3;
      });
      const ok = m.parts.some((o) => o !== p && near(o));
      assert.ok(ok, `${id}/${p.id} is not connected to the tree`);
    }
    assert.ok((m.views || []).length >= 4);
  }
  const neuro = await load('neuro3d');
  for (const need of ['ica_c1_r', 'ica_c4_l', 'ica_c7_r', 'pcom_l', 'aca_a1_r', 'acom', 'aca_a2_l', 'mca_m1_r', 'mca_m2s_l', 'mca_m2i_r', 'va_v3_l', 'va_v4_r', 'pica_l', 'ba', 'ba_tip', 'sca_r', 'aica_l', 'pca_p1_r', 'pca_p2_l', 'opha_r', 'acha_l', 'mma_r', 'callosomarginal_l', 'lsa_r', 'eca_prox_l', 'facial_a_r', 'sta_l', 'ima_max_r', 'carotid_bif_l', 'arch', 'bct']) {
    assert.ok(neuro.parts.some((p) => p.id === need), need);
  }
  const body = await load('body3d');
  for (const need of ['arch_zone0', 'dta_zone3', 'aorta_infrarenal', 'coeliac_trunk', 'sma_proximal', 'renal_artery_l', 'right_hepatic', 'gda', 'splenic_distal', 'ima', 'cia_r', 'iia_anterior_l', 'uterine_prostatic_r', 'cfa_l', 'pfa_r', 'sfa_mid_l', 'popliteal_p2_r', 'tpt_l', 'ata_distal_r', 'peroneal_l', 'pta_distal_r', 'dorsalis_pedis_l']) {
    assert.ok(body.parts.some((p) => p.id === need), need);
  }
  assert.ok(!ALL().some((id) => /coronary|spine_msk|liver_biliary/.test(id)), 'no heart, bone or liver drawings');
});

test('variants: ids unique, regions exist, every effect points at real parts', async () => {
  const ids = new Set();
  const all = ALL();
  for (const v of VARIANTS) {
    assert.ok(!ids.has(v.id), v.id); ids.add(v.id);
    assert.equal(v.label.length, 2); assert.equal(v.text.length, 2);
    for (const d of v.diagrams) assert.ok(all.includes(d), `${v.id}: ${d}`);
    if (!v.effect) continue;
    for (const s of v.sided ? ['right', 'left'] : ['']) {
      const e = v.effect(s);
      const regions = await Promise.all(v.diagrams.map(load));
      const has = (id) => regions.some((d) => d.parts.some((p) => p.id === id));
      for (const id of e.hide || []) assert.ok(has(id), `${v.id}: hide ${id}`);
      for (const id of Object.keys(e.scale || {})) assert.ok(has(id) || id.startsWith('ts_') || id.startsWith('transverse'), `${v.id}: scale ${id}`);
      for (const p of e.add || []) assert.ok(p.pts3 || p.d, `${v.id}: added part has no geometry`);
    }
  }
  assert.ok(VARIANTS.length >= 80);
});

test('variants reshape the 3D models: fetal PCA, azygos ACA, MCA trifurcation, bovine arch, replaced RHA', async () => {
  const n = await load('neuro3d');
  const part = (d, id) => d.parts.find((p) => p.id === id);
  const n1 = applyVariants(n, [{ id: 'fetal_pca', side: 'right' }]);
  assert.ok(part(n1, 'pca_p1_r').r < part(n, 'pca_p1_r').r);
  assert.ok(part(n1, 'pcom_r').r > part(n, 'pcom_r').r);
  assert.equal(part(n1, 'pca_p1_l').r, part(n, 'pca_p1_l').r, 'the other side is untouched');
  const n2 = applyVariants(n, [{ id: 'azygos_aca' }]);
  assert.ok(!part(n2, 'aca_a2_r') && !part(n2, 'aca_a2_l') && part(n2, 'aca_azygos'));
  const n3 = applyVariants(n, [{ id: 'mca_trifurcation', side: 'both' }]);
  assert.ok(part(n3, 'mca_m2m_r').pts[0][0] < 0 && part(n3, 'mca_m2m_l').pts[0][0] > 0, 'left copy is mirrored');
  const n4 = applyVariants(n, [{ id: 'bovine_arch' }]);
  assert.ok(!part(n4, 'cca_prox_l') && part(n4, 'cca_bovine_l'));
  const b = await load('body3d');
  const b1 = applyVariants(b, [{ id: 'replaced_rha' }]);
  assert.ok(!part(b1, 'right_hepatic') && part(b1, 'rha_replaced'));
  assert.ok(variantsFor('neuro3d').length >= 25);
  assert.ok(variantsFor('body3d').length >= 20);
  assert.equal(mirrorD('M172 230 Q150 232 126 228', 600), 'M 428 230 Q 450 232 474 228');
});

test('variant text: Polish and English, with the side; abbreviations stay English', () => {
  assert.equal(variantText({ id: 'fetal_pca', side: 'left' }, 'pl'), 'płodowy typ PCA — PCA zaopatrywana głównie przez PComA, segment P1 hipoplastyczny (strona lewa)');
  assert.equal(variantText({ id: 'fetal_pca', side: 'right' }, 'en'), 'fetal-type PCA — PCA supplied mainly via the PComA, hypoplastic P1 (right)');
  assert.match(variantText({ id: 'replaced_rha' }, 'pl'), /SMA/);
});

test('device catalogue: unique ids, both languages, all three branches, closure and drugs present', () => {
  const ids = new Set();
  for (const c of DEVICE_CATEGORIES) {
    assert.ok(!ids.has(c.id), c.id); ids.add(c.id);
    assert.equal(c.label.length, 2);
    assert.ok(Array.isArray(c.items) && Array.isArray(c.generic) && c.generic.length, c.id);
    for (const it of c.items) assert.ok(it.name && it.maker, `${c.id}: ${JSON.stringify(it)}`);
  }
  for (const need of ['closure', 'drugs', 'stent_retriever', 'flow_diverter', 'coil_detachable', 'balloon_pta', 'guidewire']) assert.ok(ids.has(need), need);
  for (const b of ['Vascular', 'Neuro', 'NonVascular']) assert.ok(DEVICE_CATEGORIES.some((c) => c.branches.includes(b)), b);
  assert.ok(DEVICE_CATEGORIES.reduce((a, c) => a + c.items.length, 0) >= 400);
});

function sampleCard() {
  const c = emptyCard();
  c.branch = 'Neuro'; c.diagram = 'neuro3d'; c.indication = 'Udar niedokrwienny, okluzja MCA M1 lewej';
  c.anaesthesia = 'general';
  c.access = { site: 'cfa', side: 'right', sheath: '8 F', closure: 'urządzenie zamykające' };
  c.clinical = { nihss: '14', aspects: '8', ivt: true, puncture: '10:05', firstpass: '10:21', reperfusion: '10:41' };
  const l = newLesion('neuro3d', 'mca_m1_l', 'vessel', 0.3);
  Object.assign(l, { finding: 'thrombus', pre: '0', post: '2c', passes: '1', tech: 'combined', bgc: true, procs: ['stroke_thrombectomy'], devices: [{ cat: 'stent_retriever', name: 'Solitaire X', maker: 'Medtronic', size: '6 × 40 mm', qty: 1 }] });
  c.lesions.push(l);
  c.devices.push({ cat: 'drugs', name: 'Heparyna', maker: '', size: '5000 j.m.', qty: 1 });
  c.contrast = '90'; c.fluoro = '18.5'; c.dose = '95';
  c.variants = [{ id: 'fetal_pca', side: 'left' }];
  c.recommendations = 'kontrola TK głowy po 24 h';
  return c;
}
const partOf = (d, p) => (p === 'mca_m1_l' ? { id: p, label: ['MCA M1', 'MCA M1'], side: 'left', kind: 'vessel', pts: [[0, 0, 0], [1, 1, 1]] } : null);
const labelOf = () => 'MCA M1 (lewa)';

test('card text: stroke data with times, lesion with eTICI and first-pass effect, devices, drugs, dose, variants', () => {
  const pl = cardToText(sampleCard(), { lang: 'pl', partOf, labelOf });
  assert.match(pl, /^Zabieg: Trombektomia w udarze \(tryb: planowy\)\./);
  assert.match(pl, /Dostęp: tętnica udowa wspólna prawa; koszulka 8 F; hemostaza: urządzenie zamykające\./);
  assert.match(pl, /Udar – dane do opisu: NIHSS przy przyjęciu: 14; ASPECTS: 8; tromboliza dożylna przed zabiegiem; .*czas od nakłucia do reperfuzji: 36 min; czas od nakłucia do pierwszego przejścia: 16 min\./);
  assert.match(pl, /Zmiana 1: MCA M1 \(lewa\) — zakrzep \/ zator \(udar\), odcinek proksymalny, eTICI przed: 0, technika: technika łączona, cewnik z balonem \(BGC\), liczba przejść: 1, efekt pierwszego przejścia \(FPE\): tak\. Wykonano: trombektomia w udarze\. Sprzęt: Solitaire X \(Medtronic\) 6 × 40 mm\. Wynik: eTICI po: 2c\./);
  assert.match(pl, /Leki: Heparyna 5000 j\.m\./, 'units with dots are kept');
  assert.match(pl, /Kontrast 90 ml, czas fluoroskopii 18,5 min, dawka 95 Gy·cm²\./, 'Polish decimal comma');
  assert.match(pl, /Warianty anatomiczne: płodowy typ PCA/);
  const en = cardToText(sampleCard(), { lang: 'en', partOf, labelOf: () => 'left MCA M1' });
  assert.match(en, /Access: right common femoral artery; sheath 8 F/);
  assert.match(en, /fluoroscopy time 18\.5 min/);
  assert.match(en, /eTICI before: 0, technique: combined technique, balloon guide catheter/);
  assert.match(en, /puncture-to-reperfusion: 36 min/);
  assert.deepEqual(cardGaps(sampleCard()), []);
  assert.ok(cardGaps(emptyCard()).length >= 3);
});

test('calculators: NASCET from diameters, dome-to-neck, Spetzler-Martin, times', () => {
  const st = { kind: 'vessel', finding: 'stenosis', mld: '1,2', ref: '5', method: 'nascet' };
  assert.deepEqual(lesionAuto(st), { pre: 76 });
  assert.ok(lesionFacts(st, 'pl').computed[0].includes('wyliczone zwężenie (NASCET): 76%'));
  const an = { kind: 'vessel', finding: 'aneurysm', size: '7 x 5', extra: '3', ruptured: true };
  assert.ok(lesionFacts(an, 'pl').computed.includes('stosunek kopuła/szyja: 2,3'));
  assert.ok(lesionFacts(an, 'pl').pre.includes('pęknięty'));
  const avm = { kind: 'vessel', finding: 'avm', sm_size: '2', sm_eloquent: true, sm_deep: false };
  assert.deepEqual(lesionFacts(avm, 'en').computed, ['Spetzler-Martin: grade 3']);
  assert.equal(minutesBetween('23:50', '00:20'), 30, 'across midnight');
  assert.match(clinicalFacts({ rutherford: '5', abi_pre: '0,4 / 0,9' }, 'Vascular', 'pl')[0], /Rutherford: Rutherford 5; ABI przed: 0,4 \/ 0,9/);
  const tasc = lesionFacts({ kind: 'vessel', finding: 'stenosis', pre: '90', tasc: 'C' }, 'pl', { vascular: false });
  assert.ok(!tasc.pre.some((x) => /TASC/.test(x)), 'TASC is vascular-only');
});

test('badges and device lines', () => {
  assert.equal(lesionBadge({ finding: 'stenosis', pre: '80', post: '0' }), '80%→0%');
  assert.equal(lesionBadge({ finding: 'thrombus', pre: '0', post: '3' }), 'eTICI 3');
  assert.equal(lesionBadge({ finding: 'aneurysm', size: '7 x 5', post: '1' }), '7 x 5 mm · RR 1');
  assert.equal(deviceText({ name: 'Supera', maker: 'Abbott', size: '6 x 80 mm', qty: 2 }), 'Supera (Abbott) 6 x 80 mm ×2');
});

test('letter placeholders: names are filled locally and taken out again before storing / sending', () => {
  const ctx = { patient: 'Jan Przykładowy', dob: '01.02.1950', date: '14.10.2026', referrer: 'dr Anna Testowa', referrerTitle: 'female', signature: 'lek. X' };
  const text = builtinLetter(sampleCard(), { lang: 'pl', partOf, labelOf });
  assert.ok(text.startsWith(PH.greeting));
  assert.ok(text.endsWith(PH.signature));
  assert.ok(!/Przykładowy/.test(text));
  const filled = fillLetter(text, ctx, 'pl');
  assert.match(filled, /^Szanowna Pani Doktor,/);
  assert.match(filled, /Jan Przykładowy \(data urodzenia 01\.02\.1950\)/);
  const back = pseudonymiseLetter(`${filled}\nDopisek: Jan Przykładowy czuje się dobrze.`, ctx, 'pl');
  assert.ok(!back.includes('Przykładowy') && !back.includes('01.02.1950'));
  assert.match(back, /\[\[PACJENT\]\] czuje się dobrze/);
  assert.match(fillLetter('[[ZWROT]]', { referrerTitle: 'male' }, 'pl'), /Szanowny Panie Doktorze,/);
  assert.match(fillLetter('[[ZWROT]]', {}, 'en'), /Dear Doctor,/);
});

test('letter request: cleaned input, cached instructions, placeholders kept', () => {
  const input = cleanLetterInput({ facts: 'Zabieg: …', lang: 'en', sex: 'X', length: 'huge', recipient: 'gp', previous: 'a', instruction: 'shorter' });
  assert.equal(input.language, 'en');
  assert.equal(input.patient_sex, '');
  assert.equal(input.length, 'standard');
  assert.equal(input.recipient, 'gp');
  assert.equal(input.instruction, 'shorter');
  const req = buildLetterRequest(input);
  assert.deepEqual(req.system[0].cache_control, { type: 'ephemeral' });
  assert.match(LETTER_PROMPT, /NOT the procedure report/);
  assert.match(LETTER_PROMPT, /universal English form/);
  assert.equal(normaliseLetter('Text'), '[[ZWROT]]\n\nText\n[[PODPIS]]');
});

test('letter figures: callout and caption with coil count, devices and result', async () => {
  const { figureCallout, figureCaption, coilCount } = await import('../public/js/card.js');
  const l = { kind: 'vessel', finding: 'aneurysm', size: '7 x 5', extra: '3', post: '1', procs: ['coiling'],
    devices: [{ cat: 'neuro_coil', name: 'Target 360 Soft', maker: 'Stryker', size: '6 mm × 15 cm', qty: 2 }, { cat: 'neuro_coil', name: 'MicroPlex Cosmos', maker: 'MicroVention', size: '4 mm × 8 cm', qty: 3 }, { cat: 'neuro_stent_coil', name: 'LVIS EVO', maker: 'MicroVention', size: '3.5 × 18 mm' }] };
  assert.equal(coilCount(l), 5);
  assert.equal(figureCallout(l, 'pl'), 'Tętniak · 7 × 5 mm · 5 spiral · LVIS EVO');
  assert.equal(figureCallout(l, 'en'), 'Aneurysm · 7 × 5 mm · 5 coils · LVIS EVO');
  const cap = figureCaption(l, null, 'pl', { label: 'AComA', n: 1 });
  assert.match(cap, /^Ryc\. 1\. AComA — tętniak \(/);
  assert.match(cap, /Spirale: 5 szt\. łącznie — Target 360 Soft \(Stryker\) 6 mm × 15 cm ×2; MicroPlex Cosmos \(MicroVention\) 4 mm × 8 cm ×3\./);
  assert.match(cap, /Sprzęt: LVIS EVO \(MicroVention\)/);
  assert.match(cap, /Wynik: Raymond-Roy: klasa 1/);
  assert.match(figureCaption(l, null, 'en', { label: 'AComA', n: 2 }), /^Fig\. 2\. AComA — aneurysm .*Coils: 5 in total/);
});

test('3D device kinds: stent-assisted coiling stents are stents, Mo.Ma is not a filter', async () => {
  const { deviceKind } = await import('../public/js/model3d.js');
  assert.equal(deviceKind({ cat: 'neuro_stent_coil', name: 'LVIS EVO' }), 'stent');
  assert.equal(deviceKind({ cat: 'neuro_coil', name: 'HydroSoft' }), 'coil');
  assert.equal(deviceKind({ cat: 'flow_diverter', name: 'Silk Vista' }), 'fd');
  assert.equal(deviceKind({ cat: 'intrasaccular', name: 'WEB' }), 'web');
  assert.equal(deviceKind({ cat: 'neuro_liquid_embolic', name: 'Onyx 18' }), 'liquid');
  assert.equal(deviceKind({ cat: 'stent_carotid', name: 'CGuard' }), 'stent');
  assert.equal(deviceKind({ cat: 'embolic_protection', name: 'SpiderFX' }), 'filter');
  assert.equal(deviceKind({ cat: 'embolic_protection', name: 'Mo.Ma Ultra' }), null);
});

test('equipment: products most used in Poland come first and are marked; Polish additions present', async () => {
  const { DEVICE_CATEGORIES } = await import('../public/js/devices.js');
  const cat = (id) => DEVICE_CATEGORIES.find((c) => c.id === id);
  for (const c of DEVICE_CATEGORIES) {
    const firstPlain = c.items.findIndex((i) => !i.common);
    if (firstPlain >= 0) assert.ok(c.items.slice(firstPlain).every((i) => !i.common), `${c.id}: common items must come first`);
    assert.equal(new Set(c.items.map((i) => `${i.name}|${i.maker}`)).size, c.items.length, `${c.id}: duplicate product`);
  }
  assert.ok(cat('neuro_coil').items[0].common);
  assert.ok(cat('stent_carotid').items.some((i) => i.name === 'Mer' && i.maker === 'Balton'));
  assert.ok(cat('flow_diverter').items.slice(0, 3).some((i) => /Pipeline/.test(i.name)));
  assert.ok(cat('neuro_liquid_embolic').items.slice(0, 3).some((i) => i.name === 'Onyx 18'));
});

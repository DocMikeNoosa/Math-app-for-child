// Procedure card, anatomical variants, diagrams, device catalogue and the letter helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { emptyCard, newLesion, cardToText, cardGaps, lesionBadge, deviceText, builtinLetter, fillLetter, pseudonymiseLetter, PH } from '../public/js/card.js';
import { VARIANTS, applyVariants, variantText, mirrorD, variantsFor } from '../public/js/variants.js';
import { DEVICE_CATEGORIES } from '../public/js/devices.js';
import { DIAGRAM_IDS } from '../public/js/diagrams/index.js';
import { cleanLetterInput, normaliseLetter, buildLetterRequest, LETTER_PROMPT } from '../lib/letter.js';

const load = async (id) => (await import(`../public/js/diagrams/${id}.js`)).default;

test('diagrams: every registered diagram exists, parts are unique and every part has a depth', async () => {
  const files = readdirSync(new URL('../public/js/diagrams/', import.meta.url)).filter((f) => f.endsWith('.js') && f !== 'index.js').map((f) => f.replace(/\.js$/, ''));
  assert.deepEqual([...files].sort(), [...DIAGRAM_IDS].sort());
  for (const id of DIAGRAM_IDS) {
    const d = await load(id);
    assert.equal(d.id, id);
    const ids = new Set(d.parts.map((p) => p.id));
    assert.equal(ids.size, d.parts.length, `${id}: duplicate part`);
    for (const p of d.parts) assert.ok(p.z !== undefined, `${id}/${p.id}: no z`);
  }
  const branches = new Set();
  for (const id of DIAGRAM_IDS) for (const b of (await load(id)).branches) branches.add(b);
  assert.deepEqual([...branches].sort(), ['Neuro', 'NonVascular', 'Vascular']);
});

test('variants: ids unique, every diagram exists, every geometry effect points at real parts', async () => {
  const ids = new Set();
  for (const v of VARIANTS) {
    assert.ok(!ids.has(v.id), v.id); ids.add(v.id);
    assert.equal(v.label.length, 2); assert.equal(v.text.length, 2);
    for (const d of v.diagrams) assert.ok(DIAGRAM_IDS.includes(d), `${v.id}: ${d}`);
    if (!v.effect) continue;
    for (const s of v.sided ? ['right', 'left'] : ['']) {
      const e = v.effect(s);
      for (const dId of v.diagrams) {
        const d = await load(dId);
        const parts = new Set(d.parts.map((p) => p.id));
        const own = (id) => parts.has(id);
        for (const id of e.hide || []) if (v.diagrams.length === 1) assert.ok(own(id), `${v.id}: hide ${id} not in ${dId}`);
        for (const id of Object.keys(e.scale || {})) if (v.diagrams.length === 1) assert.ok(own(id) || /_l$|_r$/.test(id), `${v.id}: scale ${id}`);
      }
      for (const p of e.add || []) assert.match(p.d, /^M/, `${v.id}: added path`);
    }
  }
  assert.ok(VARIANTS.length >= 60);
});

test('variants change the model: fetal PCA thins P1 and thickens PComA; azygos ACA replaces both A2', async () => {
  const w = await load('willis');
  const w1 = applyVariants(w, [{ id: 'fetal_pca', side: 'right' }]);
  const part = (d, id) => d.parts.find((p) => p.id === id);
  assert.ok(part(w1, 'pca_p1_r').w < part(w, 'pca_p1_r').w);
  assert.ok(part(w1, 'pcom_r').w > part(w, 'pcom_r').w);
  assert.equal(part(w1, 'pca_p1_l').w, part(w, 'pca_p1_l').w, 'the other side is untouched');
  const w2 = applyVariants(w, [{ id: 'azygos_aca' }]);
  assert.ok(!part(w2, 'aca_a2_r') && !part(w2, 'aca_a2_l'));
  assert.ok(part(w2, 'aca_azygos'));
  const w3 = applyVariants(w, [{ id: 'mca_trifurcation', side: 'both' }]);
  assert.ok(part(w3, 'mca_m2m_r') && part(w3, 'mca_m2m_l'));
  assert.equal(part(w3, 'mca_m2m_l').side, 'left');
  assert.equal(applyVariants(w, [{ id: 'bovine_arch' }]), w, 'variants of other regions leave the diagram alone');
  const n = await load('neck_vessels');
  const n1 = applyVariants(n, [{ id: 'bovine_arch' }]);
  assert.ok(!part(n1, 'cca_prox_l') && part(n1, 'cca_bovine_l'));
  assert.ok(variantsFor('willis').length >= 15);
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
  c.branch = 'Neuro'; c.diagram = 'willis'; c.indication = 'Udar niedokrwienny, okluzja MCA M1 lewej';
  c.anaesthesia = 'general';
  c.access = { site: 'cfa', side: 'right', sheath: '8 F', closure: 'urządzenie zamykające' };
  const l = newLesion('willis', 'mca_m1_l', 'vessel');
  Object.assign(l, { finding: 'thrombus', pre: 'eTICI 0', post: 'eTICI 2c', extra: '2', procs: ['stroke_thrombectomy'], devices: [{ cat: 'stent_retriever', name: 'Solitaire X', maker: 'Medtronic', size: '6 × 40 mm', qty: 1 }] });
  c.lesions.push(l);
  c.devices.push({ cat: 'drugs', name: 'Heparyna', maker: '', size: '5000 j.m.', qty: 1 });
  c.contrast = '90'; c.fluoro = '18.5'; c.dose = '95';
  c.variants = [{ id: 'fetal_pca', side: 'left' }];
  c.recommendations = 'kontrola TK głowy po 24 h';
  return c;
}
const partOf = (d, p) => (p === 'mca_m1_l' ? { id: p, label: ['MCA M1', 'MCA M1'], side: 'left', kind: 'vessel' } : null);
const labelOf = () => 'MCA M1 (lewa)';

test('card text: procedure, access, lesion, devices, drugs, dose, variants — Polish and English', () => {
  const pl = cardToText(sampleCard(), { lang: 'pl', partOf, labelOf });
  assert.match(pl, /^Zabieg: Trombektomia w udarze \(tryb: planowy\)\./);
  assert.match(pl, /Dostęp: tętnica udowa wspólna prawa; koszulka 8 F; hemostaza: urządzenie zamykające\./);
  assert.match(pl, /Zmiana 1: MCA M1 \(lewa\) — zakrzep \/ zator\. Wykonano: trombektomia w udarze\. Sprzęt: Solitaire X \(Medtronic\) 6 × 40 mm\. Przepływ przed: eTICI 0\. Liczba przejść: 2\. Przepływ końcowy: eTICI 2c\./);
  assert.match(pl, /Leki: Heparyna 5000 j\.m\./);
  assert.match(pl, /Kontrast 90 ml, czas fluoroskopii 18,5 min, dawka 95 Gy·cm²\./, 'Polish decimal comma');
  assert.match(pl, /Warianty anatomiczne: płodowy typ PCA/);
  const en = cardToText(sampleCard(), { lang: 'en', partOf, labelOf: () => 'left MCA M1' });
  assert.match(en, /Access: right common femoral artery; sheath 8 F/);
  assert.match(en, /fluoroscopy time 18\.5 min/);
  assert.match(en, /Anatomical variants: fetal-type PCA/);
  assert.deepEqual(cardGaps(sampleCard()), []);
  assert.ok(cardGaps(emptyCard()).length >= 3);
});

test('badges and device lines', () => {
  assert.equal(lesionBadge({ finding: 'stenosis', pre: '80', post: '0' }), '80%→0%');
  assert.equal(lesionBadge({ finding: 'thrombus', post: 'eTICI 3' }), 'eTICI 3');
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

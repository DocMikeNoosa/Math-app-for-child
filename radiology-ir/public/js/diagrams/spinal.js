// Spinal vascular supply — schematic AP view, C1 to S1. Patient's right on the viewer's left.
// Depth z (+ = towards the viewer = anterior): vertebral bodies +20, aorta +30, spinal canal (anterior spinal artery) −15.
const CX = 230;
const LEVELS = [
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => ['c', n, 18, 46]),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ['t', n, 22, 50 + n * 1.5]),
  ...[1, 2, 3, 4, 5].map((n) => ['l', n, 28, 74 + n * 2]),
  ['s', 1, 30, 96],
];
const GAP = 5;
const NAME = { c: 'szyjny', t: 'piersiowy', l: 'lędźwiowy', s: 'krzyżowy' };
const NAME_EN = { c: 'cervical', t: 'thoracic', l: 'lumbar', s: 'sacral' };

let y = 40;
const Y = {}; // id -> [top, bottom]
const bodies = LEVELS.map(([r, n, h, w]) => {
  const id = `${r}${n}`;
  const top = y; const bot = y + h; y = bot + GAP;
  Y[id] = [top, bot];
  const x1 = CX - w * 1.05; const x2 = CX + w * 1.05; const m = (top + bot) / 2;
  let d = `M${x1} ${top} L${x2} ${top} Q${x2 - 3} ${m} ${x2} ${bot} L${x1} ${bot} Q${x1 + 3} ${m} ${x1} ${top} Z`;
  if (id === 's1') d = `M${x1} ${top} L${x2} ${top} L${x2 - 12} ${bot} L${x1 + 12} ${bot} Z`;
  let pl = `Kręg ${id.toUpperCase()} – trzon`; let en = `${id.toUpperCase()} vertebral body`;
  if (id === 'c1') { pl = 'Kręg C1 (szczytowy, atlas)'; en = 'C1 vertebra (atlas)'; }
  if (id === 'c2') { pl = 'Kręg C2 (obrotowy) – trzon'; en = 'C2 (axis) vertebral body'; }
  if (id === 's1') { pl = 'Kręg S1 (podstawa kości krzyżowej)'; en = 'S1 (sacral base)'; }
  return { id, label: [`${pl}`, `${en}`], side: '', kind: 'organ', z: 20, d, title: NAME[r] + NAME_EN[r] };
}).map(({ title, ...p }) => p);
const mid = (id) => (Y[id][0] + Y[id][1]) / 2;
const top = (id) => Y[id][0];
const bot = (id) => Y[id][1];

// aorta (backdrop): left of the spine in the chest, near the midline in the abdomen, bifurcating at L4
const aortaX = (yy) => (yy < mid('t4') ? 292 : yy < mid('t12') ? 292 - (yy - mid('t4')) * 0.1 : 268 - (yy - mid('t12')) * 0.12);
const ay = (id) => [aortaX(mid(id)), mid(id)];

const seg = (id, side, lvl, pl, en) => {
  const [ax, yy] = ay(lvl);
  const d = side === 'right'
    ? `M${ax - 12} ${yy} Q${CX} ${yy - 6} ${CX - 80} ${yy + 4} Q${CX - 110} ${yy + 8} ${CX - 130} ${yy + 18}`
    : `M${ax + 12} ${yy} Q${ax + 40} ${yy - 2} ${ax + 60} ${yy + 6} Q${ax + 76} ${yy + 12} ${ax + 88} ${yy + 22}`;
  return { id, label: [pl, en], side, kind: 'vessel', w: 3, z: [30, 10, 0], d };
};

const t10 = mid('t10');
const [a10x] = ay('t10');
const ic10L = `M${a10x + 12} ${t10} Q${a10x + 40} ${t10 - 2} ${a10x + 60} ${t10 + 6} Q${a10x + 76} ${t10 + 12} ${a10x + 88} ${t10 + 22}`;
const hairpin = mid('t8'); // artery of Adamkiewicz joins the ASA here (hairpin)

export default {
  id: 'spinal',
  branches: ['Neuro'],
  anat: 'spine',
  label: ['Unaczynienie rdzenia kręgowego (projekcja AP)', 'Spinal cord vascular supply (AP view)'],
  viewBox: '0 0 460 800',
  backdrop: `
    <path class="faint" d="M150 170 Q170 70 ${CX - 4} 26"/><path class="faint" d="M310 170 Q290 70 ${CX + 4} 26"/>
    <path class="outline" d="M${aortaX(top('t4')) - 13} ${top('t4')} L${aortaX(mid('t12')) - 13} ${mid('t12')} L${aortaX(mid('l4')) - 12} ${mid('l4')} L${aortaX(mid('l4')) + 12} ${mid('l4')} L${aortaX(mid('t12')) + 13} ${mid('t12')} L${aortaX(top('t4')) + 13} ${top('t4')} Z"/>
    <path class="faint" d="M${CX} ${bot('l2')} L${CX} ${bot('s1')}"/>
    <text class="side" x="18" y="30">P</text><text class="side" x="430" y="30">L</text>
    <text class="lbl" x="130" y="40">VA</text><text class="lbl" x="314" y="40">VA</text>
    <text class="lbl" x="84" y="${mid('c1') + 4}">C1</text>
    <text class="lbl" x="84" y="${mid('c7') + 4}">C7</text>
    <text class="lbl" x="84" y="${mid('t1') + 4}">Th1</text>
    <text class="lbl" x="84" y="${mid('t6') + 4}">Th6</text>
    <text class="lbl" x="84" y="${mid('t12') + 4}">Th12</text>
    <text class="lbl" x="84" y="${mid('l1') + 4}">L1</text>
    <text class="lbl" x="84" y="${mid('l5') + 4}">L5</text>
    <text class="lbl" x="84" y="${mid('s1') + 4}">S1</text>
    <text class="lbl" x="${aortaX(mid('t5')) + 18}" y="${mid('t5')}">Aorta</text>
    <text class="lbl" x="306" y="${hairpin - 24}">t. Adamkiewicza</text>
    <text class="lbl" x="346" y="${mid('l5') + 4}">nić końcowa</text>`,
  parts: [
    ...bodies,
    // segmental arteries (examples) — drawn before the ASA
    seg('ic_t6_r', 'right', 't6', 'Tętnica międzyżebrowa tylna Th6', 'Posterior intercostal artery T6'),
    seg('ic_t6_l', 'left', 't6', 'Tętnica międzyżebrowa tylna Th6', 'Posterior intercostal artery T6'),
    seg('ic_t10_r', 'right', 't10', 'Tętnica międzyżebrowa tylna Th10', 'Posterior intercostal artery T10'),
    { id: 'ic_t10_l', label: ['Tętnica międzyżebrowa tylna Th10 (pień dla t. Adamkiewicza)', 'Posterior intercostal artery T10 (feeding the artery of Adamkiewicz)'], side: 'left', kind: 'vessel', w: 3.5, z: [30, 10, 0], d: ic10L },
    seg('lumbar_l2_r', 'right', 'l2', 'Tętnica lędźwiowa L2', 'Lumbar artery L2'),
    seg('lumbar_l2_l', 'left', 'l2', 'Tętnica lędźwiowa L2', 'Lumbar artery L2'),
    // artery of Adamkiewicz: from the left T10 intercostal, up along the root, hairpin onto the ASA
    { id: 'adamkiewicz_l', label: ['Tętnica Adamkiewicza (t. korzeniowo-rdzeniowa przednia wielka)', 'Artery of Adamkiewicz (great anterior radiculomedullary artery)'], side: 'left', kind: 'vessel', w: 3, z: [8, -10, -15, -15],
      d: `M${a10x + 38} ${t10 + 1} C${a10x + 10} ${t10 - 8} ${CX + 30} ${t10 - 24} ${CX + 16} ${hairpin + 22} Q${CX + 12} ${hairpin - 20} ${CX + 4} ${hairpin - 12} L${CX} ${hairpin}` },
    // anterior spinal artery
    { id: 'asa_cerv', label: ['Tętnica rdzeniowa przednia – odcinek szyjny', 'Anterior spinal artery – cervical'], side: '', kind: 'vessel', w: 3.5, z: -15, d: `M${CX} 26 L${CX} ${bot('c7') + 2}` },
    { id: 'asa_thor', label: ['Tętnica rdzeniowa przednia – odcinek piersiowy', 'Anterior spinal artery – thoracic'], side: '', kind: 'vessel', w: 3, z: -15, d: `M${CX} ${bot('c7') + 2} L${CX} ${bot('t12') + 2}` },
    { id: 'asa_lumb', label: ['Tętnica rdzeniowa przednia – odcinek lędźwiowy (stożek)', 'Anterior spinal artery – lumbar (conus)'], side: '', kind: 'vessel', w: 3, z: -15, d: `M${CX} ${bot('t12') + 2} L${CX} ${bot('l2')}` },
  ],
};

// Dural venous sinuses — right lateral view (face on the viewer's right, occiput on the left).
// Paired structures: the near (patient's RIGHT, "P") side is drawn in place; the far (LEFT, "L") side is drawn
// shifted up and towards the occiput, as in a slightly oblique projection. Paths are authored face-left, then flipped.
const W = 640;
const shift = (d, dx, dy) => d.replace(/(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(+x + dx).toFixed(1)} ${+(+y + dy).toFixed(1)}`);
const flip = (d) => d.replace(/(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(W - x).toFixed(1)} ${y}`);
const FAR = [20, -34];
const one = (id, pl, en, w, d, z = 0) => ({ id, label: [pl, en], side: '', kind: 'vessel', w, d: flip(d), z });
const pair = (id, pl, en, w, d, z, far = FAR, farD = null) => [
  { id: `${id}_l`, label: [pl, en], side: 'left', kind: 'vessel', w, d: flip(farD || shift(d, ...far)), z: -z },
  { id: `${id}_r`, label: [pl, en], side: 'right', kind: 'vessel', w, d: flip(d), z },
];

export default {
  id: 'venous_sinuses',
  branches: ['Neuro'],
  anat: 'brain',
  label: ['Zatoki żylne opony twardej (widok boczny prawy)', 'Dural venous sinuses (right lateral view)'],
  viewBox: '0 0 640 560',
  backdrop: `
    <path class="outline" d="${flip('M130 300 C100 200 170 66 330 58 C490 52 596 160 586 320 C580 380 560 420 520 432 Q470 444 432 430 Q380 400 330 380 Q270 360 220 340 Q170 318 130 300 Z')}"/>
    <path class="faint" d="${flip('M546 332 Q490 318 420 300 Q350 290 290 330')}"/>
    <path class="faint" d="${flip('M215 185 Q300 150 392 206')}"/>
    <path class="faint" d="${flip('M200 330 Q236 318 262 330 Q250 352 214 350 Z')}"/>
    <text class="side" x="18" y="30">tył</text><text class="side" x="590" y="30">przód</text>
    <text class="lbl-strong" x="222" y="522">P</text><text class="lbl-strong" x="170" y="490">L</text>
    <text class="lbl-strong" x="150" y="378">P</text><text class="lbl-strong" x="150" y="300">L</text>
    <text class="lbl" x="300" y="40">SSS</text>
    <text class="lbl" x="180" y="272">zatoka prosta</text>
    <text class="lbl" x="${W - 248}" y="372">zatoka jamista</text>
    <text class="lbl" x="20" y="380">spływ zatok</text>
    <text class="lbl" x="18" y="548">P = prawa (bliższa) · L = lewa (dalsza)</text>`,
  parts: [
    // far (left) side first, near (right) side on top
    ...pair('ijv', 'Żyła szyjna wewnętrzna (IJV)', 'Internal jugular vein (IJV)', 8, 'M424 434 L428 530', 45),
    ...pair('jug_bulb', 'Opuszka żyły szyjnej wewnętrznej', 'Jugular bulb', 9, 'M416 412 Q416 428 424 434', 50),
    ...pair('sigmoid_sinus', 'Zatoka esowata', 'Sigmoid sinus', 8, 'M450 352 C420 354 412 380 416 412', 55),
    ...pair('transverse_sinus', 'Zatoka poprzeczna', 'Transverse sinus', 8, 'M534 338 Q490 350 450 352', 50, FAR, 'M540 324 Q505 320 470 318'),
    ...pair('sps', 'Zatoka skalista górna', 'Superior petrosal sinus', 3.5, 'M275 340 Q360 324 450 352', 35),
    ...pair('ips', 'Zatoka skalista dolna', 'Inferior petrosal sinus', 3.5, 'M272 346 Q330 398 416 420', 25),
    ...pair('cavernous_sinus', 'Zatoka jamista', 'Cavernous sinus', 10, 'M230 338 L275 342', 18),
    ...pair('rosenthal', 'Żyła podstawna (Rosenthala)', 'Basal vein of Rosenthal', 3, 'M300 304 C352 300 384 266 396 214', 14, [4, -8]),
    ...pair('icv', 'Żyła wewnętrzna mózgu', 'Internal cerebral vein', 3.5, 'M300 236 Q350 238 392 210', 3, [4, -8]),
    // midline
    one('sss_ant', 'Zatoka strzałkowa górna – 1/3 przednia', 'Superior sagittal sinus – anterior third', 7, 'M140 200 Q170 120 235 82'),
    one('sss_mid', 'Zatoka strzałkowa górna – 1/3 środkowa', 'Superior sagittal sinus – middle third', 8, 'M235 82 Q330 46 425 80'),
    one('sss_post', 'Zatoka strzałkowa górna – 1/3 tylna', 'Superior sagittal sinus – posterior third', 9, 'M425 80 Q540 136 542 318'),
    one('iss', 'Zatoka strzałkowa dolna', 'Inferior sagittal sinus', 4, 'M215 185 Q300 150 392 206'),
    one('galen', 'Żyła wielka mózgu (Galena)', 'Vein of Galen', 6, 'M392 206 Q410 202 422 214'),
    one('straight_sinus', 'Zatoka prosta', 'Straight sinus', 6, 'M422 214 L532 320'),
    { id: 'torcular', label: ['Spływ zatok (torcular Herophili)', 'Confluence of sinuses (torcular Herophili)'], side: '', kind: 'organ', z: 0,
      d: flip('M532 332 Q532 318 546 318 Q560 318 560 332 Q560 346 546 346 Q532 346 532 332 Z') },
  ],
};

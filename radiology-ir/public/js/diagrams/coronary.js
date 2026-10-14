// Coronary arteries – classic frontal schematic (as in a cath-lab report). Patient's right = viewer's left; apex to the viewer's lower right.
// z = anterior–posterior depth (+ anterior); an array gives one value per path vertex (M and each L/Q/C end point).
export default {
  id: 'coronary',
  branches: ['Vascular'],
  anat: 'heart',
  label: ['Tętnice wieńcowe', 'Coronary arteries'],
  viewBox: '0 0 600 560',
  backdrop: `
    <path class="outline" d="M300 118 Q220 110 188 150 Q150 230 168 360 Q196 450 300 500 Q400 540 452 500 Q540 420 546 280 Q540 170 450 126 Q380 104 300 118 Z"/>
    <path class="faint" d="M272 92 Q272 56 300 56 Q328 56 328 92 Q328 120 300 122 Q272 120 272 92 Z"/>
    <path class="faint" d="M300 56 L300 20"/>
    <path class="faint" d="M358 140 Q340 300 420 500"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl-strong" x="314" y="34">Aorta</text>
    <text class="lbl" x="120" y="236">RCA</text>
    <text class="lbl" x="398" y="132">LM</text>
    <text class="lbl" x="318" y="330">LAD</text>
    <text class="lbl" x="520" y="208">LCx</text>
    <text class="lbl" x="476" y="526">Koniuszek</text>
  `,
  parts: [
    { id: 'left_main', z: 10, label: ['Pień lewej tętnicy wieńcowej (LM)', 'Left main coronary artery (LM)'], side: '', kind: 'vessel', w: 8, d: 'M318 106 L352 134' },
    { id: 'lad_proximal', z: 35, label: ['Gałąź przednia zstępująca (LAD) – odcinek bliższy', 'Left anterior descending (LAD) – proximal'], side: '', kind: 'vessel', w: 7, d: 'M352 134 Q364 176 370 216' },
    { id: 'lad_mid', z: 40, label: ['Gałąź przednia zstępująca (LAD) – odcinek środkowy', 'Left anterior descending (LAD) – mid'], side: '', kind: 'vessel', w: 6, d: 'M370 216 Q380 290 394 360' },
    { id: 'lad_distal', z: 35, label: ['Gałąź przednia zstępująca (LAD) – odcinek dalszy', 'Left anterior descending (LAD) – distal'], side: '', kind: 'vessel', w: 5, d: 'M394 360 Q404 430 424 494' },
    { id: 'diagonal_1', z: 40, label: ['Gałąź diagonalna 1 (D1)', 'First diagonal branch (D1)'], side: '', kind: 'vessel', w: 4, d: 'M366 196 Q398 206 432 238' },
    { id: 'diagonal_2', z: 40, label: ['Gałąź diagonalna 2 (D2)', 'Second diagonal branch (D2)'], side: '', kind: 'vessel', w: 4, d: 'M384 300 Q416 312 450 344' },
    { id: 'septal_1', z: 10, label: ['Gałąź przegrodowa (S1)', 'First septal perforator (S1)'], side: '', kind: 'vessel', w: 3, d: 'M372 230 Q356 248 340 272' },
    { id: 'ramus_intermedius', z: 15, label: ['Gałąź pośrednia (ramus intermedius)', 'Ramus intermedius'], side: '', kind: 'vessel', w: 4, d: 'M352 134 Q400 152 430 206' },
    { id: 'lcx_proximal', z: -5, label: ['Gałąź okalająca (LCx) – odcinek bliższy', 'Left circumflex (LCx) – proximal'], side: '', kind: 'vessel', w: 6, d: 'M352 134 Q404 128 452 156' },
    { id: 'lcx_distal', z: [-10, -40], label: ['Gałąź okalająca (LCx) – odcinek dalszy', 'Left circumflex (LCx) – distal'], side: '', kind: 'vessel', w: 5, d: 'M452 156 Q504 196 520 290' },
    { id: 'om1', z: -15, label: ['Gałąź brzeżna 1 (OM1)', 'First obtuse marginal (OM1)'], side: '', kind: 'vessel', w: 4, d: 'M470 170 Q474 226 466 290' },
    { id: 'om2', z: -25, label: ['Gałąź brzeżna 2 (OM2)', 'Second obtuse marginal (OM2)'], side: '', kind: 'vessel', w: 4, d: 'M508 240 Q506 300 492 360' },
    { id: 'rca_proximal', z: 20, label: ['Prawa tętnica wieńcowa (RCA) – odcinek bliższy', 'Right coronary artery (RCA) – proximal'], side: '', kind: 'vessel', w: 7, d: 'M282 108 Q240 120 210 160' },
    { id: 'rca_mid', z: 10, label: ['Prawa tętnica wieńcowa (RCA) – odcinek środkowy', 'Right coronary artery (RCA) – mid'], side: '', kind: 'vessel', w: 6, d: 'M210 160 Q180 232 186 322' },
    { id: 'rca_distal', z: [0, -45], label: ['Prawa tętnica wieńcowa (RCA) – odcinek dalszy', 'Right coronary artery (RCA) – distal'], side: '', kind: 'vessel', w: 6, d: 'M186 322 Q200 394 290 440' },
    { id: 'acute_marginal', z: 30, label: ['Gałąź brzegu ostrego (AM)', 'Acute marginal branch (AM)'], side: '', kind: 'vessel', w: 3, d: 'M190 270 Q232 300 270 338' },
    { id: 'pda', z: -50, label: ['Gałąź zstępująca tylna (PDA)', 'Posterior descending artery (PDA)'], side: '', kind: 'vessel', w: 4, d: 'M290 440 Q340 474 392 496' },
    { id: 'plb', z: -50, label: ['Gałąź tylno-boczna (PLB)', 'Posterolateral branch (PLB)'], side: '', kind: 'vessel', w: 4, d: 'M290 440 Q330 428 362 400' },
  ],
};

// Whole aorta, frontal (AP) schematic. Patient's right = viewer's left.
const C = 'chest';
export default {
  id: 'aorta',
  branches: ['Vascular'],
  anat: 'abdomen',
  label: ['Aorta – całość (piersiowa i brzuszna)', 'Aorta – thoracic and abdominal'],
  viewBox: '0 0 600 720',
  backdrop: `
    <path class="outline" d="M150 20 Q140 120 150 300 Q138 420 160 560 Q170 650 200 700 L420 700 Q450 650 460 560 Q482 420 470 300 Q480 120 470 20"/>
    <path class="faint" d="M226 250 Q222 206 256 190 Q300 176 340 192 Q392 214 384 272 Q372 328 312 336 Q238 330 226 250 Z"/>
    <path class="faint" d="M160 370 Q230 335 300 360 Q370 335 460 370"/>
    <path class="faint" d="M258 52 L230 28 M258 52 L252 16"/>
    <path class="faint" d="M410 62 L452 70"/>
    <path class="faint" d="M206 432 Q186 446 188 476 Q192 512 214 518 Q232 516 236 488 Q238 452 222 436 Q214 428 206 432 Z"/>
    <path class="faint" d="M406 420 Q426 422 432 452 Q436 492 414 504 Q394 504 388 476 Q384 440 396 424 Q400 418 406 420 Z"/>
    <path class="faint" d="M260 690 L240 700 M260 690 L272 700 M364 690 L384 700 M364 690 L352 700"/>
    <text class="side" x="18" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl-strong" x="384" y="200">Aorta piersiowa</text>
    <text class="lbl" x="240" y="320">Serce</text>
    <text class="lbl" x="420" y="364">Przepona</text>
    <text class="lbl-strong" x="356" y="540">Aorta brzuszna</text>
    <text class="lbl" x="216" y="14">BCT</text>
    <text class="lbl" x="326" y="22">LCCA</text>
    <text class="lbl" x="420" y="56">LSA</text>
    <text class="lbl" x="170" y="530">Nerka</text>
    <text class="lbl" x="396" y="522">Nerka</text>
  `,
  parts: [
    { id: 'aortic_root', z: 15, anat: C, label: ['Opuszka aorty (korzeń aorty)', 'Aortic root'], side: '', kind: 'vessel', w: 18, d: 'M254 262 L252 232' },
    { id: 'ascending_aorta', z: 20, anat: C, label: ['Aorta wstępująca', 'Ascending aorta'], side: '', kind: 'vessel', w: 16, d: 'M252 232 C244 190 248 150 268 122' },
    { id: 'arch_zone0', z: 15, anat: C, label: ['Łuk aorty – strefa 0 (Ishimaru)', 'Aortic arch – zone 0 (Ishimaru)'], side: '', kind: 'vessel', w: 15, d: 'M268 122 Q280 104 300 97' },
    { id: 'arch_zone1', z: 5, anat: C, label: ['Łuk aorty – strefa 1 (Ishimaru)', 'Aortic arch – zone 1 (Ishimaru)'], side: '', kind: 'vessel', w: 15, d: 'M300 97 Q316 92 330 93' },
    { id: 'arch_zone2', z: -10, anat: C, label: ['Łuk aorty – strefa 2 (Ishimaru)', 'Aortic arch – zone 2 (Ishimaru)'], side: '', kind: 'vessel', w: 15, d: 'M330 93 Q346 96 354 108' },
    { id: 'dta_zone3', z: -30, anat: C, label: ['Aorta zstępująca – strefa 3 (cieśń)', 'Descending aorta – zone 3 (isthmus)'], side: '', kind: 'vessel', w: 14, d: 'M354 108 Q361 120 360 140' },
    { id: 'dta_proximal', z: -40, anat: C, label: ['Aorta piersiowa zstępująca – odcinek bliższy', 'Descending thoracic aorta – proximal'], side: '', kind: 'vessel', w: 14, d: 'M360 140 L355 255' },
    { id: 'dta_distal', z: [-40, -10], anat: C, label: ['Aorta piersiowa zstępująca – odcinek dalszy', 'Descending thoracic aorta – distal'], side: '', kind: 'vessel', w: 14, d: 'M355 255 Q349 330 320 385' },
    { id: 'aorta_paravisceral', z: -5, label: ['Aorta okołotrzewna (odcinek trzewny)', 'Paravisceral aorta'], side: '', kind: 'vessel', w: 14, d: 'M320 385 Q314 400 314 420 L313 482' },
    { id: 'aorta_infrarenal', z: 0, label: ['Aorta podnerkowa', 'Infrarenal aorta'], side: '', kind: 'vessel', w: 14, d: 'M313 482 L312 580' },
    { id: 'aortic_bifurcation', z: 0, label: ['Rozwidlenie aorty', 'Aortic bifurcation'], side: '', kind: 'vessel', w: 14, d: 'M312 580 L312 604' },
    { id: 'brachiocephalic_trunk', z: 10, anat: C, label: ['Pień ramienno-głowowy', 'Brachiocephalic trunk'], side: '', kind: 'vessel', w: 9, d: 'M284 106 Q272 82 258 52' },
    { id: 'lcca', z: 0, anat: 'neck', label: ['Tętnica szyjna wspólna lewa (LCCA)', 'Left common carotid artery (LCCA)'], side: '', kind: 'vessel', w: 7, d: 'M316 93 Q318 62 320 30' },
    { id: 'left_subclavian', z: -15, anat: C, label: ['Tętnica podobojczykowa lewa (LSA)', 'Left subclavian artery (LSA)'], side: '', kind: 'vessel', w: 8, d: 'M344 98 Q360 72 410 62' },
    { id: 'intercostal_r', z: -55, anat: C, label: ['Tętnica międzyżebrowa tylna', 'Posterior intercostal artery'], side: 'right', kind: 'vessel', w: 3, d: 'M350 296 Q312 290 272 300' },
    { id: 'intercostal_l', z: -55, anat: C, label: ['Tętnica międzyżebrowa tylna', 'Posterior intercostal artery'], side: 'left', kind: 'vessel', w: 3, d: 'M362 296 Q392 290 430 300' },
    { id: 'coeliac_trunk', z: [-5, 40], label: ['Pień trzewny', 'Coeliac trunk'], side: '', kind: 'vessel', w: 7, d: 'M320 404 Q336 398 348 384' },
    { id: 'sma', z: [-5, 45], label: ['Tętnica krezkowa górna (SMA)', 'Superior mesenteric artery (SMA)'], side: '', kind: 'vessel', w: 7, d: 'M318 424 Q332 430 334 450' },
    { id: 'renal_artery_r', z: -10, label: ['Tętnica nerkowa', 'Renal artery'], side: 'right', kind: 'vessel', w: 6, d: 'M307 470 Q270 466 232 474' },
    { id: 'renal_artery_l', z: -10, label: ['Tętnica nerkowa', 'Renal artery'], side: 'left', kind: 'vessel', w: 6, d: 'M320 460 Q356 456 390 462' },
    { id: 'lumbar_r', z: -45, label: ['Tętnica lędźwiowa', 'Lumbar artery'], side: 'right', kind: 'vessel', w: 3, d: 'M306 530 Q290 524 270 528' },
    { id: 'lumbar_l', z: -45, label: ['Tętnica lędźwiowa', 'Lumbar artery'], side: 'left', kind: 'vessel', w: 3, d: 'M319 530 Q334 524 354 528' },
    { id: 'ima', z: [0, 25], label: ['Tętnica krezkowa dolna (IMA)', 'Inferior mesenteric artery (IMA)'], side: '', kind: 'vessel', w: 5, d: 'M318 556 Q334 562 344 588' },
    { id: 'cia_r', z: -5, anat: 'pelvis', label: ['Tętnica biodrowa wspólna', 'Common iliac artery'], side: 'right', kind: 'vessel', w: 10, d: 'M312 604 L260 690' },
    { id: 'cia_l', z: -5, anat: 'pelvis', label: ['Tętnica biodrowa wspólna', 'Common iliac artery'], side: 'left', kind: 'vessel', w: 10, d: 'M312 604 L364 690' },
  ],
};

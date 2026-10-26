// Upper-limb arteries and dialysis-access veins, both arms, frontal view (palms forward).
// Patient's right = viewer's left. Left-side paths are the right-side paths mirrored about x = 300.
export default {
  id: 'upper_limb',
  branches: ['Vascular'],
  anat: 'upper_limb',
  label: ['Tętnice kończyn górnych i dostęp dializacyjny', 'Upper-limb arteries and dialysis access'],
  viewBox: '0 0 600 700',
  backdrop: `
    <path class="outline" d="M220 60 Q150 52 120 96 Q90 150 80 260 Q66 380 54 470 Q44 560 46 610 Q38 640 48 690 L150 690 Q160 640 150 610 Q160 520 166 440 Q176 380 184 300 Q194 240 220 200"/>
    <path class="outline" d="M380 60 Q450 52 480 96 Q510 150 520 260 Q534 380 546 470 Q556 560 554 610 Q562 640 552 690 L450 690 Q440 640 450 610 Q440 520 434 440 Q424 380 416 300 Q406 240 380 200"/>
    <path class="outline" d="M220 60 Q300 44 380 60 L380 200 Q384 360 372 470 L228 470 Q216 360 220 200 Z"/>
    <path class="faint" d="M290 60 Q240 50 186 64"/>
    <path class="faint" d="M310 60 Q360 50 414 64"/>
    <path class="faint" d="M300 120 Q294 92 270 70 M300 120 Q306 92 330 70"/>
    <path class="faint" d="M64 380 L180 380 M536 380 L420 380 M46 606 L152 606 M554 606 L448 606"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl" x="268" y="140">łuk aorty</text>
    <text class="lbl" x="280" y="250">Ramię</text>
    <text class="lbl" x="280" y="384">Łokieć</text>
    <text class="lbl" x="268" y="530">Przedramię</text>
    <text class="lbl" x="286" y="650">Dłoń</text>
  `,
  parts: [
    { id: 'subclavian_distal_r', z: -10, anat: 'chest', label: ['Tętnica podobojczykowa – odcinek dystalny', 'Subclavian artery – distal segment'], side: 'right', kind: 'vessel', w: 7, d: 'M270 70 Q230 64 196 78' },
    { id: 'axillary_r', z: -5, label: ['Tętnica pachowa', 'Axillary artery'], side: 'right', kind: 'vessel', w: 6, d: 'M196 78 Q164 96 148 150' },
    { id: 'brachial_r', z: 5, label: ['Tętnica ramienna', 'Brachial artery'], side: 'right', kind: 'vessel', w: 5, d: 'M148 150 Q130 260 116 380' },
    { id: 'radial_r', z: 10, label: ['Tętnica promieniowa', 'Radial artery'], side: 'right', kind: 'vessel', w: 4, d: 'M116 380 Q90 460 78 600' },
    { id: 'ulnar_r', z: 5, label: ['Tętnica łokciowa', 'Ulnar artery'], side: 'right', kind: 'vessel', w: 4, d: 'M116 380 Q132 470 134 600' },
    { id: 'interosseous_r', z: -5, label: ['Tętnica międzykostna wspólna', 'Common interosseous artery'], side: 'right', kind: 'vessel', w: 3, d: 'M122 404 Q108 480 106 560' },
    { id: 'palmar_arch_r', z: 10, label: ['Łuk dłoniowy powierzchowny', 'Superficial palmar arch'], side: 'right', kind: 'vessel', w: 3, d: 'M134 600 Q134 646 106 650 Q80 648 78 600' },
    { id: 'cephalic_forearm_r', z: 20, label: ['Żyła odpromieniowa – przedramię', 'Cephalic vein – forearm'], side: 'right', kind: 'vessel', w: 4, d: 'M60 600 Q56 500 82 384' },
    { id: 'cephalic_arm_r', z: 20, label: ['Żyła odpromieniowa – ramię', 'Cephalic vein – upper arm'], side: 'right', kind: 'vessel', w: 4, d: 'M82 384 Q78 260 102 160' },
    { id: 'cephalic_arch_r', z: [20, 5], label: ['Łuk żyły odpromieniowej', 'Cephalic arch'], side: 'right', kind: 'vessel', w: 4, d: 'M102 160 Q120 108 184 92' },
    { id: 'basilic_r', z: 12, label: ['Żyła odłokciowa', 'Basilic vein'], side: 'right', kind: 'vessel', w: 4, d: 'M152 600 Q158 480 146 400 Q160 320 170 226' },
    { id: 'subclavian_distal_l', z: -10, anat: 'chest', label: ['Tętnica podobojczykowa – odcinek dystalny', 'Subclavian artery – distal segment'], side: 'left', kind: 'vessel', w: 7, d: 'M330 70 Q370 64 404 78' },
    { id: 'axillary_l', z: -5, label: ['Tętnica pachowa', 'Axillary artery'], side: 'left', kind: 'vessel', w: 6, d: 'M404 78 Q436 96 452 150' },
    { id: 'brachial_l', z: 5, label: ['Tętnica ramienna', 'Brachial artery'], side: 'left', kind: 'vessel', w: 5, d: 'M452 150 Q470 260 484 380' },
    { id: 'radial_l', z: 10, label: ['Tętnica promieniowa', 'Radial artery'], side: 'left', kind: 'vessel', w: 4, d: 'M484 380 Q510 460 522 600' },
    { id: 'ulnar_l', z: 5, label: ['Tętnica łokciowa', 'Ulnar artery'], side: 'left', kind: 'vessel', w: 4, d: 'M484 380 Q468 470 466 600' },
    { id: 'interosseous_l', z: -5, label: ['Tętnica międzykostna wspólna', 'Common interosseous artery'], side: 'left', kind: 'vessel', w: 3, d: 'M478 404 Q492 480 494 560' },
    { id: 'palmar_arch_l', z: 10, label: ['Łuk dłoniowy powierzchowny', 'Superficial palmar arch'], side: 'left', kind: 'vessel', w: 3, d: 'M466 600 Q466 646 494 650 Q520 648 522 600' },
    { id: 'cephalic_forearm_l', z: 20, label: ['Żyła odpromieniowa – przedramię', 'Cephalic vein – forearm'], side: 'left', kind: 'vessel', w: 4, d: 'M540 600 Q544 500 518 384' },
    { id: 'cephalic_arm_l', z: 20, label: ['Żyła odpromieniowa – ramię', 'Cephalic vein – upper arm'], side: 'left', kind: 'vessel', w: 4, d: 'M518 384 Q522 260 498 160' },
    { id: 'cephalic_arch_l', z: [20, 5], label: ['Łuk żyły odpromieniowej', 'Cephalic arch'], side: 'left', kind: 'vessel', w: 4, d: 'M498 160 Q480 108 416 92' },
    { id: 'basilic_l', z: 12, label: ['Żyła odłokciowa', 'Basilic vein'], side: 'left', kind: 'vessel', w: 4, d: 'M448 600 Q442 480 454 400 Q440 320 430 226' },
    { id: 'avf_radiocephalic_r', z: 18, label: ['Przetoka promieniowo-odpromieniowa (AVF, anastomoza)', 'Radiocephalic AV fistula (anastomosis)'], side: 'right', kind: 'organ', d: 'M60 588 Q60 580 69 580 Q78 580 78 588 Q78 596 69 596 Q60 596 60 588 Z' },
    { id: 'avf_brachiocephalic_r', z: 18, label: ['Przetoka ramienno-odpromieniowa (AVF, anastomoza)', 'Brachiocephalic AV fistula (anastomosis)'], side: 'right', kind: 'organ', d: 'M86 380 Q86 372 99 372 Q112 372 112 380 Q112 388 99 388 Q86 388 86 380 Z' },
    { id: 'avf_radiocephalic_l', z: 18, label: ['Przetoka promieniowo-odpromieniowa (AVF, anastomoza)', 'Radiocephalic AV fistula (anastomosis)'], side: 'left', kind: 'organ', d: 'M540 588 Q540 580 531 580 Q522 580 522 588 Q522 596 531 596 Q540 596 540 588 Z' },
    { id: 'avf_brachiocephalic_l', z: 18, label: ['Przetoka ramienno-odpromieniowa (AVF, anastomoza)', 'Brachiocephalic AV fistula (anastomosis)'], side: 'left', kind: 'organ', d: 'M514 380 Q514 372 501 372 Q488 372 488 380 Q488 388 501 388 Q514 388 514 380 Z' },
  ],
};

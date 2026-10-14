// Systemic and portal veins, frontal view. Patient's right = viewer's left.
export default {
  id: 'veins',
  branches: ['Vascular'],
  anat: 'abdomen',
  label: ['Układ żylny i żyła wrotna', 'Venous system and portal vein'],
  viewBox: '0 0 600 1080',
  backdrop: `
    <path class="outline" d="M230 20 L230 100 Q150 110 130 160 Q120 400 140 640 Q150 760 170 800 L430 800 Q450 760 460 640 Q480 400 470 160 Q450 110 370 100 L370 20"/>
    <path class="faint" d="M240 300 Q236 250 290 240 Q370 236 384 300 Q388 360 330 370 Q262 372 240 300 Z"/>
    <path class="faint" d="M136 380 Q200 330 300 336 Q340 340 346 372 Q330 430 268 466 Q190 490 146 450 Q130 420 136 380 Z"/>
    <path class="faint" d="M140 330 Q220 300 300 330 Q380 300 460 330"/>
    <path class="faint" d="M470 400 Q500 410 500 448 Q496 480 470 484 Q450 476 452 444 Q454 410 470 400 Z"/>
    <path class="faint" d="M196 488 Q170 492 168 528 Q170 562 194 566 Q214 556 210 526 Q212 494 196 488 Z"/>
    <path class="faint" d="M420 480 Q444 484 446 520 Q444 552 422 556 Q404 548 406 518 Q406 488 420 480 Z"/>
    <path class="faint" d="M318 380 L318 640 M318 640 L274 720 M318 640 L362 720"/>
    <path class="outline" d="M170 800 Q160 900 182 1070 L232 1070 Q250 900 290 800"/>
    <path class="outline" d="M430 800 Q440 900 418 1070 L368 1070 Q350 900 310 800"/>
    <path class="faint" d="M156 812 L246 830 M444 812 L354 830"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl" x="350" y="300">Serce</text>
    <text class="lbl" x="150" y="410">Wątroba</text>
    <text class="lbl" x="476" y="420">Śledziona</text>
    <text class="lbl" x="440" y="326">Przepona</text>
    <text class="lbl" x="322" y="626">Aorta</text>
    <text class="lbl" x="56" y="1000">Udo / kolano</text>
    <text class="lbl-strong" x="186" y="270">SVC</text>
    <text class="lbl-strong" x="232" y="640">IVC</text>
    <text class="lbl" x="346" y="456">Układ wrotny</text>
  `,
  parts: [
    { id: 'right_atrium', z: 20, anat: 'heart', label: ['Prawy przedsionek', 'Right atrium'], side: '', kind: 'organ', d: 'M222 300 Q222 268 264 266 Q294 268 298 300 Q296 334 266 340 Q222 336 222 300 Z' },
    { id: 'ijv_r', z: 0, anat: 'neck', label: ['Żyła szyjna wewnętrzna (IJV)', 'Internal jugular vein (IJV)'], side: 'right', kind: 'vessel', w: 6, d: 'M262 30 L262 135' },
    { id: 'ijv_l', z: 0, anat: 'neck', label: ['Żyła szyjna wewnętrzna (IJV)', 'Internal jugular vein (IJV)'], side: 'left', kind: 'vessel', w: 6, d: 'M338 30 L338 135' },
    { id: 'subclavian_vein_r', z: 10, anat: 'chest', label: ['Żyła podobojczykowa', 'Subclavian vein'], side: 'right', kind: 'vessel', w: 6, d: 'M160 142 Q220 126 262 135' },
    { id: 'subclavian_vein_l', z: 10, anat: 'chest', label: ['Żyła podobojczykowa', 'Subclavian vein'], side: 'left', kind: 'vessel', w: 6, d: 'M440 142 Q380 126 338 135' },
    { id: 'brachiocephalic_vein_r', z: 10, anat: 'chest', label: ['Żyła ramienno-głowowa', 'Brachiocephalic vein'], side: 'right', kind: 'vessel', w: 8, d: 'M262 135 L272 192' },
    { id: 'brachiocephalic_vein_l', z: 10, anat: 'chest', label: ['Żyła ramienno-głowowa', 'Brachiocephalic vein'], side: 'left', kind: 'vessel', w: 8, d: 'M338 135 Q312 168 272 192' },
    { id: 'svc', z: 10, anat: 'chest', label: ['Żyła główna górna (SVC)', 'Superior vena cava (SVC)'], side: '', kind: 'vessel', w: 11, d: 'M272 192 L272 268' },
    { id: 'azygos', z: [5, -40, -55], anat: 'chest', label: ['Żyła nieparzysta', 'Azygos vein'], side: '', kind: 'vessel', w: 4, d: 'M274 222 Q300 222 302 250 L304 328' },
    { id: 'ivc_suprahepatic', z: 5, label: ['Żyła główna dolna – odcinek nadwątrobowy', 'Inferior vena cava – suprahepatic segment'], side: '', kind: 'vessel', w: 12, d: 'M276 332 L280 392' },
    { id: 'ivc_retrohepatic', z: 5, label: ['Żyła główna dolna – odcinek zawątrobowy / nadnerkowy', 'Inferior vena cava – retrohepatic / suprarenal segment'], side: '', kind: 'vessel', w: 12, d: 'M280 392 L282 506' },
    { id: 'ivc_infrarenal', z: 5, label: ['Żyła główna dolna – odcinek podnerkowy', 'Inferior vena cava – infrarenal segment'], side: '', kind: 'vessel', w: 12, d: 'M282 506 L284 650' },
    { id: 'hepatic_vein_right', z: 10, label: ['Żyła wątrobowa prawa', 'Right hepatic vein'], side: '', kind: 'vessel', w: 5, d: 'M280 392 Q228 378 172 346' },
    { id: 'hepatic_vein_middle', z: 15, label: ['Żyła wątrobowa pośrodkowa', 'Middle hepatic vein'], side: '', kind: 'vessel', w: 5, d: 'M280 392 Q252 366 234 334' },
    { id: 'hepatic_vein_left', z: 15, label: ['Żyła wątrobowa lewa', 'Left hepatic vein'], side: '', kind: 'vessel', w: 5, d: 'M280 392 Q304 366 320 342' },
    { id: 'portal_vein_main', z: 30, label: ['Żyła wrotna – pień', 'Portal vein – main trunk'], side: '', kind: 'vessel', w: 9, d: 'M330 482 Q272 472 216 440' },
    { id: 'portal_vein_right', z: 25, label: ['Żyła wrotna – gałąź prawa', 'Portal vein – right branch'], side: '', kind: 'vessel', w: 6, d: 'M216 440 Q186 428 156 446' },
    { id: 'portal_vein_left', z: 30, label: ['Żyła wrotna – gałąź lewa', 'Portal vein – left branch'], side: '', kind: 'vessel', w: 5, d: 'M216 440 Q226 414 252 410' },
    { id: 'splenic_vein', z: 20, label: ['Żyła śledzionowa', 'Splenic vein'], side: '', kind: 'vessel', w: 6, d: 'M330 482 Q404 470 468 438' },
    { id: 'left_gastric_vein', z: 35, label: ['Żyła żołądkowa lewa (wieńcowa)', 'Left gastric (coronary) vein'], side: '', kind: 'vessel', w: 3, d: 'M336 476 Q344 446 356 420' },
    { id: 'imv', z: 10, label: ['Żyła krezkowa dolna (IMV)', 'Inferior mesenteric vein (IMV)'], side: '', kind: 'vessel', w: 3, d: 'M388 468 Q392 520 382 590' },
    { id: 'smv', z: 40, label: ['Żyła krezkowa górna (SMV)', 'Superior mesenteric vein (SMV)'], side: '', kind: 'vessel', w: 7, d: 'M330 482 Q338 540 326 610' },
    { id: 'renal_vein_r', z: -15, label: ['Żyła nerkowa', 'Renal vein'], side: 'right', kind: 'vessel', w: 7, d: 'M282 512 L206 520' },
    { id: 'renal_vein_l', z: 12, label: ['Żyła nerkowa', 'Renal vein'], side: 'left', kind: 'vessel', w: 7, d: 'M284 510 Q340 500 412 508' },
    { id: 'gonadal_vein_r', z: -10, label: ['Żyła jajnikowa / jądrowa', 'Gonadal (ovarian / testicular) vein'], side: 'right', kind: 'vessel', w: 3, d: 'M280 546 Q262 590 256 660' },
    { id: 'gonadal_vein_l', z: -10, label: ['Żyła jajnikowa / jądrowa', 'Gonadal (ovarian / testicular) vein'], side: 'left', kind: 'vessel', w: 3, d: 'M384 507 Q392 580 392 660' },
    { id: 'civ_r', z: -15, anat: 'pelvis', label: ['Żyła biodrowa wspólna', 'Common iliac vein'], side: 'right', kind: 'vessel', w: 9, d: 'M284 650 L230 730' },
    { id: 'civ_l', z: -15, anat: 'pelvis', label: ['Żyła biodrowa wspólna', 'Common iliac vein'], side: 'left', kind: 'vessel', w: 9, d: 'M284 650 Q322 664 352 730' },
    { id: 'eiv_r', z: 0, anat: 'pelvis', label: ['Żyła biodrowa zewnętrzna', 'External iliac vein'], side: 'right', kind: 'vessel', w: 7, d: 'M230 730 Q206 776 196 822' },
    { id: 'eiv_l', z: 0, anat: 'pelvis', label: ['Żyła biodrowa zewnętrzna', 'External iliac vein'], side: 'left', kind: 'vessel', w: 7, d: 'M352 730 Q394 776 404 822' },
    { id: 'iiv_r', z: -40, anat: 'pelvis', label: ['Żyła biodrowa wewnętrzna', 'Internal iliac vein'], side: 'right', kind: 'vessel', w: 5, d: 'M230 730 L248 790' },
    { id: 'iiv_l', z: -40, anat: 'pelvis', label: ['Żyła biodrowa wewnętrzna', 'Internal iliac vein'], side: 'left', kind: 'vessel', w: 5, d: 'M352 730 L334 790' },
    { id: 'cfv_r', z: 15, anat: 'lower_limb', label: ['Żyła udowa wspólna (CFV)', 'Common femoral vein (CFV)'], side: 'right', kind: 'vessel', w: 7, d: 'M196 822 L192 866' },
    { id: 'cfv_l', z: 15, anat: 'lower_limb', label: ['Żyła udowa wspólna (CFV)', 'Common femoral vein (CFV)'], side: 'left', kind: 'vessel', w: 7, d: 'M404 822 L408 866' },
    { id: 'femoral_vein_r', z: 10, anat: 'lower_limb', label: ['Żyła udowa', 'Femoral vein'], side: 'right', kind: 'vessel', w: 6, d: 'M192 866 L204 990' },
    { id: 'femoral_vein_l', z: 10, anat: 'lower_limb', label: ['Żyła udowa', 'Femoral vein'], side: 'left', kind: 'vessel', w: 6, d: 'M408 866 L396 990' },
    { id: 'popliteal_vein_r', z: -20, anat: 'lower_limb', label: ['Żyła podkolanowa', 'Popliteal vein'], side: 'right', kind: 'vessel', w: 5, d: 'M204 990 L210 1064' },
    { id: 'popliteal_vein_l', z: -20, anat: 'lower_limb', label: ['Żyła podkolanowa', 'Popliteal vein'], side: 'left', kind: 'vessel', w: 5, d: 'M396 990 L390 1064' },
  ],
};

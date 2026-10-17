// Thoracic vessels: pulmonary arteries, bronchial, internal thoracic, subclavian and intercostal arteries. Frontal view.
// Patient's right = viewer's left. z = anterior–posterior depth (+ anterior); arrays give one value per path vertex (M and each L/Q/C end point).
export default {
  id: 'chest_vessels',
  branches: ['Vascular'],
  anat: 'chest',
  label: ['Naczynia klatki piersiowej i płucne', 'Thoracic and pulmonary vessels'],
  viewBox: '0 0 600 520',
  backdrop: `
    <path class="outline" d="M262 70 Q165 62 100 150 Q57 300 68 470 Q165 452 276 468 Q249 300 262 70 Z"/>
    <path class="outline" d="M338 70 Q435 62 500 150 Q543 300 532 470 Q462 456 408 470 Q397 410 354 340 Q346 200 338 70 Z"/>
    <path class="faint" d="M235 340 Q214 470 340 482 Q489 476 478 370 Q440 306 327 304 Q249 306 235 340 Z"/>
    <path class="faint" d="M276 330 L278 160 Q289 128 340 130 Q373 136 365 160 L349 480"/>
    <path class="faint" d="M286 140 L273 100"/>
    <path class="faint" d="M300 20 L300 150"/>
    <path class="faint" d="M57 476 Q165 440 300 470 Q435 440 543 476"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl" x="98" y="120">Płuco</text><text class="lbl" x="457" y="120">Płuco</text>
    <text class="lbl" x="368" y="150">Aorta</text>
    <text class="lbl" x="408" y="440">Serce</text>
    <text class="lbl" x="305" y="34">Tchawica</text>
    <text class="lbl" x="206" y="500">Przepona</text>
  `,
  parts: [
    { id: 'pulmonary_trunk', z: [45, 15], label: ['Pień płucny', 'Pulmonary trunk'], side: '', kind: 'vessel', w: 12, d: 'M303 330 Q300 262 327 208' },
    { id: 'pa_main_r', z: 0, label: ['Tętnica płucna – pień', 'Pulmonary artery – main'], side: 'right', kind: 'vessel', w: 9, d: 'M324 210 Q273 206 219 214' },
    { id: 'pa_upper_lobe_r', z: 0, label: ['Tętnica płata górnego (pień przedni)', 'Upper lobe artery (truncus anterior)'], side: 'right', kind: 'vessel', w: 5, d: 'M232 212 Q206 180 184 150' },
    { id: 'pa_interlobar_r', z: -5, label: ['Tętnica płucna – odcinek międzypłatowy', 'Pulmonary artery – interlobar segment'], side: 'right', kind: 'vessel', w: 7, d: 'M219 214 Q195 232 184 262' },
    { id: 'pa_middle_lobe_r', z: 15, label: ['Tętnica płata środkowego', 'Middle lobe artery'], side: 'right', kind: 'vessel', w: 4, d: 'M184 262 Q211 290 235 310' },
    { id: 'pa_lower_lobe_r', z: -20, label: ['Tętnica płata dolnego', 'Lower lobe artery'], side: 'right', kind: 'vessel', w: 6, d: 'M184 262 Q168 330 160 400' },
    { id: 'pa_main_l', z: [10, -15], label: ['Tętnica płucna – pień', 'Pulmonary artery – main'], side: 'left', kind: 'vessel', w: 9, d: 'M330 206 Q370 186 413 196' },
    { id: 'pa_upper_lobe_l', z: 0, label: ['Tętnica płata górnego', 'Upper lobe artery'], side: 'left', kind: 'vessel', w: 5, d: 'M397 190 Q416 160 432 136' },
    { id: 'pa_interlobar_l', z: -15, label: ['Tętnica płucna – odcinek międzypłatowy', 'Pulmonary artery – interlobar segment'], side: 'left', kind: 'vessel', w: 7, d: 'M413 196 Q432 220 435 250' },
    { id: 'pa_lingula_l', z: 15, label: ['Tętnica języczka', 'Lingular artery'], side: 'left', kind: 'vessel', w: 4, d: 'M435 250 Q467 274 492 300' },
    { id: 'pa_lower_lobe_l', z: -25, label: ['Tętnica płata dolnego', 'Lower lobe artery'], side: 'left', kind: 'vessel', w: 6, d: 'M435 250 Q446 320 448 400' },
    { id: 'bronchial_r', z: -35, label: ['Pień międzyżebrowo-oskrzelowy (tętnica oskrzelowa)', 'Intercostobronchial trunk (bronchial artery)'], side: 'right', kind: 'vessel', w: 3, d: 'M354 262 Q300 254 249 244' },
    { id: 'bronchial_l', z: -30, label: ['Tętnica oskrzelowa', 'Bronchial artery'], side: 'left', kind: 'vessel', w: 3, d: 'M362 268 Q397 262 424 250' },
    { id: 'subclavian_r', z: -5, label: ['Tętnica podobojczykowa', 'Subclavian artery'], side: 'right', kind: 'vessel', w: 7, d: 'M273 100 Q219 76 124 84' },
    { id: 'subclavian_l', z: -10, label: ['Tętnica podobojczykowa', 'Subclavian artery'], side: 'left', kind: 'vessel', w: 7, d: 'M354 140 Q365 100 408 86 Q438 78 476 84' },
    { id: 'internal_thoracic_r', z: [10, 55, 55], label: ['Tętnica piersiowa wewnętrzna (ITA)', 'Internal thoracic (mammary) artery (ITA)'], side: 'right', kind: 'vessel', w: 3, d: 'M208 82 Q243 130 249 360' },
    { id: 'internal_thoracic_l', z: [10, 55, 55], label: ['Tętnica piersiowa wewnętrzna (ITA)', 'Internal thoracic (mammary) artery (ITA)'], side: 'left', kind: 'vessel', w: 3, d: 'M392 87 Q357 130 351 360' },
    { id: 'superior_epigastric_r', z: 50, label: ['Tętnica nabrzuszna górna', 'Superior epigastric artery'], side: 'right', kind: 'vessel', w: 2, d: 'M249 360 L251 440' },
    { id: 'superior_epigastric_l', z: 50, label: ['Tętnica nabrzuszna górna', 'Superior epigastric artery'], side: 'left', kind: 'vessel', w: 2, d: 'M351 360 L349 440' },
    { id: 'intercostal_th6_r', z: [-55, -20], label: ['Tętnica międzyżebrowa tylna (Th6)', 'Posterior intercostal artery (T6)'], side: 'right', kind: 'vessel', w: 3, d: 'M351 330 Q232 318 84 340' },
    { id: 'intercostal_th6_l', z: [-55, -20], label: ['Tętnica międzyżebrowa tylna (Th6)', 'Posterior intercostal artery (T6)'], side: 'left', kind: 'vessel', w: 3, d: 'M365 330 Q476 318 530 340' },
    { id: 'intercostal_th9_r', z: [-55, -20], label: ['Tętnica międzyżebrowa tylna (Th9)', 'Posterior intercostal artery (T9)'], side: 'right', kind: 'vessel', w: 3, d: 'M346 410 Q232 398 92 420' },
    { id: 'intercostal_th9_l', z: [-55, -20], label: ['Tętnica międzyżebrowa tylna (Th9)', 'Posterior intercostal artery (T9)'], side: 'left', kind: 'vessel', w: 3, d: 'M359 410 Q462 398 524 420' },
  ],
};

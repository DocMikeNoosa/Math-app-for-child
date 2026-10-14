// Supra-aortic and neck vessels — frontal (AP) view from the aortic arch to the skull base.
// Patient's right on the viewer's left. Neck paths are written for the right side and mirrored for the left.
const W = 600;
const K = 1.55; // horizontal stretch about the midline (paths below are drawn narrow, then widened)
const sc = (d) => d.replace(/(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(300 + (x - 300) * K).toFixed(1)} ${y}`);
const mir = (d) => d.replace(/(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(W - x).toFixed(1)} ${y}`);
const V = (id, pl, en, w, d, dl) => [
  { id: `${id}_r`, label: [pl, en], side: 'right', kind: 'vessel', w, d: sc(d) },
  { id: `${id}_l`, label: [pl, en], side: 'left', kind: 'vessel', w, d: sc(dl || mir(d)) },
];

// right half of the backdrop (mirrored for the left)
const backHalf = `
    <path class="faint" d="M226 228 L226 150"/>
    <path class="faint" d="M236 230 Q262 214 294 206"/>
    <path class="faint" d="M150 548 Q110 556 70 586"/>
    <path class="faint" d="M180 520 Q160 506 140 508"/>
    <path class="faint" d="M180 520 Q190 500 210 496"/>
    <path class="faint" d="M162 532 Q166 552 196 566"/>
    <path class="outline" d="M262 440 Q252 470 262 510 Q280 524 296 506 L298 452 Q284 432 262 440 Z"/>
    <path class="outline" d="M184 474 L214 474 L214 464 L184 464 Z"/>
    <path class="outline" d="M184 429 L214 429 L214 419 L184 419 Z"/>
    <path class="outline" d="M186 384 L212 384 L212 374 L186 374 Z"/>
    <path class="outline" d="M186 339 L212 339 L212 329 L186 329 Z"/>
    <path class="outline" d="M188 294 L210 294 L210 284 L188 284 Z"/>`;

// Depth (z, viewBox units, + = towards the viewer) for the 3D view: a number, or one number per path vertex
// (M and the end point of every following segment). Keys are part ids without _r/_l; a full id overrides.
const withZ = (parts, Z) => parts.map((p) => ({ ...p, z: Z[p.id] ?? Z[p.id.replace(/_(r|l)$/, '')] ?? 0 }));
// frontal view: z = anterior (+) / posterior (−); ECA anterior to the ICA, vertebral arteries posterior
const Z = {
  ijv: [0, 4, 4], arch: [30, -40], bct: [10, 0], sca_prox_r: [0, -10], sca_prox_l: [-15, -10, -10],
  cca_prox: [0, 0], cca_prox_l: [8, 0], cca_mid: 0, carotid_bif: [0, -2],
  va_ost: [-12, -18], va_v1: [-18, -30], va_v2: [-30, -35], va_v3: [-35, -45, -40], tct: [-10, -5],
  ica_c1: [-2, -12, -14], eca_prox: [2, 12, 15], eca_dist: [15, 10],
  sup_thyr: [5, 22], apa: [3, -8], lingual: [15, 28], facial_a: [15, 30], occipital: [10, -45],
  sta: [10, 15], ima_max: [10, 0], spa: [0, 12],
};

export default {
  id: 'neck_vessels',
  branches: ['Neuro', 'Vascular'],
  anat: 'neck',
  label: ['Tętnice szyjne i kręgowe (łuk aorty – podstawa czaszki)', 'Carotid and vertebral arteries (aortic arch – skull base)'],
  viewBox: '0 0 600 720',
  backdrop: `
    <path class="faint" d="M90 214 Q300 186 510 214"/>
    <path class="faint" d="M300 120 L300 640"/>
    ${sc(backHalf)}${sc(mir(backHalf))}
    <path class="outline" d="${sc('M296 506 Q300 512 304 506 L304 470 Q300 466 296 470 Z')}"/>
    <text class="side" x="18" y="30">P</text><text class="side" x="570" y="30">L</text>
    <text class="lbl" x="440" y="184">podstawa czaszki</text>
    <text class="lbl" x="320" y="690">Łuk aorty</text>
    <text class="lbl" x="18" y="630">t. podobojczykowa</text>
    <text class="lbl" x="160" y="560">CCA</text><text class="lbl" x="382" y="560">CCA</text>
    <text class="lbl" x="150" y="140">ICA</text><text class="lbl" x="424" y="140">ICA</text>
    <text class="lbl" x="250" y="118">ECA</text>
    <text class="lbl" x="98" y="360">VA</text><text class="lbl" x="484" y="360">VA</text>
    <text class="lbl" x="40" y="420">IJV</text><text class="lbl" x="530" y="420">IJV</text>
    <text class="lbl" x="276" y="545">tarczyca</text>
    <text class="lbl" x="106" y="293">C2</text><text class="lbl" x="106" y="473">C6</text>`,
  parts: withZ([
    // veins first (underneath)
    ...V('ijv', 'Żyła szyjna wewnętrzna (IJV)', 'Internal jugular vein (IJV)', 8, 'M190 212 C166 230 158 270 158 320 L160 528'),
    // aortic arch and its branches (asymmetric — both sides written explicitly)
    { id: 'arch', label: ['Łuk aorty', 'Aortic arch'], side: '', kind: 'vessel', w: 18, anat: 'chest', d: sc('M235 712 C235 600 380 590 385 712') },
    { id: 'bct', label: ['Pień ramienno-głowowy', 'Brachiocephalic trunk'], side: '', kind: 'vessel', w: 11, d: sc('M266 638 Q252 596 238 560') },
    ...V('sca_prox', 'Tętnica podobojczykowa – odcinek bliższy', 'Subclavian artery – proximal', 9,
      'M238 560 Q200 538 150 548', 'M354 635 Q366 560 395 542 Q420 535 450 548'),
    ...V('cca_prox', 'Tętnica szyjna wspólna (CCA) – odcinek bliższy', 'Common carotid artery (CCA) – proximal', 8,
      'M238 560 Q244 520 245 460', 'M319 622 C346 580 355 520 355 460'),
    // vertebral and thyrocervical (from the subclavian)
    ...V('va_ost', 'Tętnica kręgowa – ujście (ostium)', 'Vertebral artery – origin (ostium)', 5, 'M205 542 L204 524'),
    ...V('va_v1', 'Tętnica kręgowa V1 (odcinek przedotworowy)', 'Vertebral artery V1 (pre-foraminal)', 5, 'M204 524 L200 474'),
    ...V('va_v2', 'Tętnica kręgowa V2 (odcinek otworowy C6–C2)', 'Vertebral artery V2 (foraminal C6–C2)', 5, 'M200 474 L198 290'),
    ...V('va_v3', 'Tętnica kręgowa V3 (odcinek pozaoponowy C1)', 'Vertebral artery V3 (extradural C1)', 5, 'M198 290 C176 282 174 250 196 246 Q220 242 236 230'),
    ...V('tct', 'Pień tarczowo-szyjny', 'Thyrocervical trunk', 4, 'M181 543 L180 520'),
    // carotids
    ...V('cca_mid', 'Tętnica szyjna wspólna (CCA) – odcinek środkowy', 'Common carotid artery (CCA) – mid', 8, 'M245 460 L246 380'),
    ...V('carotid_bif', 'Rozwidlenie tętnicy szyjnej wspólnej / opuszka', 'Carotid bifurcation / bulb', 9, 'M246 380 L247 362'),
    ...V('ica_c1', 'ICA C1 (część szyjna)', 'ICA C1 (cervical)', 6.5, 'M246 362 C226 340 222 300 224 262 L226 228'),
    ...V('eca_prox', 'Tętnica szyjna zewnętrzna (ECA) – odcinek bliższy', 'External carotid artery (ECA) – proximal', 5.5, 'M249 362 L262 320 L265 290'),
    ...V('eca_dist', 'Tętnica szyjna zewnętrzna (ECA) – odcinek dalszy', 'External carotid artery (ECA) – distal', 5, 'M265 290 L266 196'),
    ...V('sup_thyr', 'Tętnica tarczowa górna', 'Superior thyroid artery', 3, 'M252 352 C272 352 280 380 280 438'),
    ...V('apa', 'Tętnica gardłowa wstępująca', 'Ascending pharyngeal artery', 2.5, 'M253 346 Q246 300 242 244'),
    ...V('lingual', 'Tętnica językowa', 'Lingual artery', 3, 'M263 318 Q280 320 290 308'),
    ...V('facial_a', 'Tętnica twarzowa', 'Facial artery', 3, 'M265 296 C288 294 294 266 284 238'),
    ...V('occipital', 'Tętnica potyliczna', 'Occipital artery', 3, 'M266 222 C246 214 214 204 186 196'),
    ...V('sta', 'Tętnica skroniowa powierzchowna', 'Superficial temporal artery', 3.5, 'M266 196 Q262 140 244 92'),
    ...V('ima_max', 'Tętnica szczękowa', 'Maxillary artery', 3.5, 'M266 200 Q280 196 288 182'),
    ...V('spa', 'Tętnica klinowo-podniebienna', 'Sphenopalatine artery', 2.5, 'M288 182 Q292 166 286 150'),
  ], Z),
};

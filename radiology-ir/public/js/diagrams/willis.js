// Circle of Willis and main cerebral arteries — basal (inferior) view, anterior at the top.
// Patient's right on the viewer's left. Right-side paths are written once and mirrored for the left side.
const W = 600;
const mir = (d) => d.replace(/(-?\d+(?:\.\d+)?)[\s,]+(-?\d+(?:\.\d+)?)/g, (_, x, y) => `${+(W - x).toFixed(1)} ${y}`);
const V = (id, pl, en, w, d) => [
  { id: `${id}_r`, label: [pl, en], side: 'right', kind: 'vessel', w, d },
  { id: `${id}_l`, label: [pl, en], side: 'left', kind: 'vessel', w, d: mir(d) },
];
const both = (d) => d + mir(d);

// right-side backdrop fragments (mirrored below)
const backHalf = `
    <path class="faint" d="M276 150 L296 212"/>
    <path class="faint" d="M296 226 L272 262"/>
    <path class="faint" d="M112 236 Q150 250 196 246"/>
    <path class="faint" d="M118 330 Q150 300 196 290"/>
    <path class="faint" d="M300 486 Q240 470 190 500 Q160 530 200 560"/>`;

// Depth (z, viewBox units, + = towards the viewer) for the 3D view: a number, or one number per path vertex
// (M and the end point of every following segment). Keys are part ids without _r/_l; a full id overrides.
const withZ = (parts, Z) => parts.map((p) => ({ ...p, z: Z[p.id] ?? Z[p.id.replace(/_(r|l)$/, '')] ?? 0 }));
// basal view: z = superior (+) / inferior (−) height; the circle of Willis lies at 0
const Z = {
  va_v4: [-70, -45], pica: [-55, -60, -55], ba: [-45, -8], ba_tip: [-8, 0], aica: [-30, -32, -32], sca: [-6, 0, 6],
  pca_p1: [0, 2], pca_p2: [2, 10], pca_p3: [10, 20], pca_p4: [20, 30, 36], mma: [-35, -15, 10],
  ica_c2: [-45, -38], ica_c3: [-38, -34], ica_c4: [-34, -14], ica_c5: [-14, -5], opha: [-4, -8, -8], ica_c6: [-5, -2],
  ica_c7: [-2, 0], pcom: [-1, 0], acha: [0, 6], ica_t: [0, 0],
  aca_a1: [0, 3], acom: 3, aca_a2: [3, 30], aca_a3: [30, 70],
  mca_m1: [0, 4], mca_bif: [4, 5], mca_m2s: [5, 25], mca_m2i: [5, 14], mca_m3: [25, 45], mca_m4: [45, 65],
};

export default {
  id: 'willis',
  branches: ['Neuro'],
  anat: 'brain',
  label: ['Koło Willisa i tętnice mózgu (widok od podstawy)', 'Circle of Willis and cerebral arteries (basal view)'],
  viewBox: '0 0 600 600',
  backdrop: `
    <path class="outline" d="M300 28 C200 22 80 60 62 190 C55 250 70 300 110 340 C90 380 95 470 150 530 C200 585 270 592 300 586 C330 592 400 585 450 530 C505 470 510 380 490 340 C530 300 545 250 538 190 C520 60 400 22 300 28 Z"/>
    <path class="faint" d="M300 32 L300 196"/>
    ${backHalf}${mir(backHalf)}
    <path class="faint" d="M262 338 Q300 326 338 338 L344 470 Q300 486 256 470 Z"/>
    <path class="faint" d="M288 250 Q300 238 312 250 Q300 262 288 250 Z"/>
    <text class="side" x="18" y="30">P</text><text class="side" x="570" y="30">L</text>
    <text class="lbl" x="322" y="96">ACA</text>
    <text class="lbl" x="74" y="214">MCA</text><text class="lbl" x="496" y="214">MCA</text>
    <text class="lbl" x="150" y="452">PCA</text><text class="lbl" x="420" y="452">PCA</text>
    <text class="lbl" x="128" y="404">ICA</text><text class="lbl" x="448" y="404">ICA</text>
    <text class="lbl" x="308" y="410">BA</text>
    <text class="lbl" x="226" y="584">VA</text><text class="lbl" x="356" y="584">VA</text>
    <text class="lbl" x="314" y="168">AComA</text>
    <text class="lbl" x="18" y="590">widok od podstawy · przód ↑</text>`,
  parts: withZ([
    // posterior circulation (drawn first, so the circle lies on top)
    ...V('va_v4', 'Tętnica kręgowa V4 (wewnątrzczaszkowa)', 'Vertebral artery V4 (intradural)', 6, 'M258 578 Q282 520 300 470'),
    ...V('pica', 'Tętnica tylna dolna móżdżku (PICA)', 'Posterior inferior cerebellar artery (PICA)', 3, 'M276 528 Q246 530 226 556 Q214 572 196 574'),
    { id: 'ba', label: ['Tętnica podstawna – pień', 'Basilar artery – trunk'], side: '', kind: 'vessel', w: 7, d: 'M300 470 L300 340' },
    { id: 'ba_tip', label: ['Szczyt tętnicy podstawnej', 'Basilar tip'], side: '', kind: 'vessel', w: 7, d: 'M300 340 L300 320' },
    ...V('aica', 'Tętnica przednia dolna móżdżku (AICA)', 'Anterior inferior cerebellar artery (AICA)', 3, 'M300 436 Q272 436 254 450 Q240 462 222 464'),
    ...V('sca', 'Tętnica górna móżdżku (SCA)', 'Superior cerebellar artery (SCA)', 3.5, 'M300 342 C276 344 258 356 250 380 Q244 398 232 410'),
    ...V('pca_p1', 'PCA P1 (odcinek przedłączący)', 'PCA P1 (precommunicating)', 5, 'M300 320 Q282 312 262 316'),
    ...V('pca_p2', 'PCA P2 (odcinek okalający)', 'PCA P2 (ambient)', 5, 'M262 316 Q230 322 212 350'),
    ...V('pca_p3', 'PCA P3 (odcinek czworaczy)', 'PCA P3 (quadrigeminal)', 4.5, 'M212 350 Q198 374 198 402'),
    ...V('pca_p4', 'PCA P4 (odcinek korowy)', 'PCA P4 (cortical)', 4, 'M198 402 Q198 446 222 478 Q232 492 246 500'),
    // middle meningeal artery (foramen spinosum → middle cranial fossa)
    ...V('mma', 'Tętnica oponowa środkowa (MMA)', 'Middle meningeal artery (MMA)', 3, 'M138 372 Q104 364 84 330 Q74 310 76 286'),
    // intracranial ICA: from the carotid canal (posterolateral) forward to the terminus
    ...V('ica_c2', 'ICA C2 (część skalista)', 'ICA C2 (petrous)', 7, 'M150 386 Q172 354 196 340'),
    ...V('ica_c3', 'ICA C3 (część poszarpana)', 'ICA C3 (lacerum)', 7, 'M196 340 L212 330'),
    ...V('ica_c4', 'ICA C4 (część jamista)', 'ICA C4 (cavernous)', 7, 'M212 330 C232 316 232 292 216 282'),
    ...V('ica_c5', 'ICA C5 (część klinowa)', 'ICA C5 (clinoid)', 7, 'M216 282 C198 272 198 252 214 250'),
    ...V('opha', 'Tętnica oczna', 'Ophthalmic artery', 3, 'M217 250 Q214 200 202 140 Q198 120 190 104'),
    ...V('ica_c6', 'ICA C6 (część oczna)', 'ICA C6 (ophthalmic)', 7, 'M214 250 Q226 248 232 256'),
    ...V('ica_c7', 'ICA C7 (część łącząca)', 'ICA C7 (communicating)', 7, 'M232 256 Q238 264 244 254'),
    ...V('pcom', 'Tętnica łącząca tylna (PComA)', 'Posterior communicating artery (PComA)', 3, 'M237 261 Q254 286 262 316'),
    ...V('acha', 'Tętnica naczyniówkowa przednia (AChA)', 'Anterior choroidal artery (AChA)', 2.5, 'M244 254 Q242 284 234 308'),
    ...V('ica_t', 'Rozwidlenie ICA (ICA-T)', 'ICA terminus (ICA-T)', 7, 'M244 254 L250 234'),
    // anterior circulation
    ...V('aca_a1', 'ACA A1 (odcinek przedłączący)', 'ACA A1 (precommunicating)', 5, 'M250 234 Q270 214 289 205'),
    { id: 'acom', label: ['Tętnica łącząca przednia (AComA)', 'Anterior communicating artery (AComA)'], side: '', kind: 'vessel', w: 3.5, d: 'M289 205 L311 205' },
    ...V('aca_a2', 'ACA A2 (odcinek zakłączący)', 'ACA A2 (postcommunicating)', 4.5, 'M289 205 L291 130'),
    ...V('aca_a3', 'ACA A3 / tętnica okołospoidłowa', 'ACA A3 / pericallosal artery', 4, 'M291 130 Q293 88 289 46'),
    ...V('mca_m1', 'MCA M1 (odcinek klinowy)', 'MCA M1 (sphenoidal)', 6, 'M250 234 Q216 228 186 230'),
    ...V('mca_bif', 'Rozwidlenie MCA', 'MCA bifurcation', 6, 'M186 230 L172 230'),
    ...V('mca_m2s', 'MCA M2 – pień górny (wyspowy)', 'MCA M2 – superior trunk (insular)', 4.5, 'M172 230 Q150 214 134 190'),
    ...V('mca_m2i', 'MCA M2 – pień dolny (wyspowy)', 'MCA M2 – inferior trunk (insular)', 4.5, 'M172 230 Q150 248 130 264'),
    ...V('mca_m3', 'MCA M3 (odcinek wieczkowy)', 'MCA M3 (opercular)', 3.5, 'M134 190 Q118 168 98 158'),
    ...V('mca_m4', 'MCA M4 (odcinek korowy, dystalny)', 'MCA M4 (cortical, distal)', 3, 'M98 158 Q80 148 70 124'),
  ], Z),
};

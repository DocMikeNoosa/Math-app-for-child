// True 3D neurovascular model (millimetres, schematic adult anatomy).
// Axes: x = patient's LEFT (+) / RIGHT (−); y = superior (+); z = anterior (+). Origin ≈ circle of Willis.
// Segments marked `pair` are written for the RIGHT side (ids end in _r) and mirrored to the left.
// Abbreviations stay universal (ICA, MCA, PComA…); Polish names first, English second.

const S = (id, pl, en, r, pts, o = {}) => ({ id, label: [pl, en], r, pts, ...o });
const P = (id, pl, en, r, pts, o = {}) => S(id, pl, en, r, pts, { pair: true, ...o });

export default {
  id: 'neuro3d',
  kind: 'model3d',
  branches: ['Neuro', 'Vascular'],
  anat: 'brain',
  label: ['Tętnice mózgowe i szyjne 3D (łuk aorty → kora)', 'Cerebral and neck arteries 3D (arch → cortex)'],
  views: [
    { id: 'willis', label: ['Koło Willisa', 'Circle of Willis'], target: [0, 0, 4], size: 125, yaw: 0, pitch: -1.3 },
    { id: 'ap', label: ['AP', 'AP'], target: [0, 5, 0], size: 170, yaw: 0, pitch: 0.12 },
    { id: 'lat', label: ['Bok', 'Lateral'], target: [0, 5, 0], size: 170, yaw: -Math.PI / 2, pitch: 0.05 },
    { id: 'post', label: ['Tylne krążenie', 'Posterior circ.'], target: [0, -20, -20], size: 120, yaw: Math.PI, pitch: 0.25 },
    { id: 'neck', label: ['Szyja', 'Neck'], target: [0, -80, 0], size: 150, yaw: 0.35, pitch: 0.05 },
    { id: 'all', label: ['Całość', 'Whole'], target: [0, -85, 0], size: 340, yaw: 0.3, pitch: 0.08 },
  ],
  defaultView: 'ap',
  context: [
    { shape: 'ellipsoid', c: [0, 12, -6], r: [70, 62, 88], label: ['czaszka', 'skull'] },
    ...[['C1', -47], ['C2', -58], ['C3', -70], ['C4', -82], ['C5', -94], ['C6', -106], ['C7', -118]].map(([n, y]) => ({ shape: 'box', c: [0, y, -24], size: [26, 8, 18], bone: true, tag: n })),
  ],
  labels: [
    { text: ['P', 'R'], at: [-80, 40, 0], side: true },
    { text: ['L', 'L'], at: [80, 40, 0], side: true },
    { text: ['C2', 'C2'], at: [12, -58, -32] },
    { text: ['C6', 'C6'], at: [12, -106, -32] },
  ],
  segments: [
    // ---------------------------------------------------------------- aortic arch and great vessels
    S('ascending_aorta', 'Aorta wstępująca', 'Ascending aorta', 13, [[-12, -235, 22], [-14, -200, 18], [-10, -175, 12]], { anat: 'chest' }),
    S('arch', 'Łuk aorty', 'Aortic arch', 12.5, [[-10, -175, 12], [-4, -164, 6], [4, -162, -2], [12, -166, -12]], { anat: 'chest' }),
    S('desc_aorta', 'Aorta zstępująca (cieśń)', 'Descending aorta (isthmus)', 11.5, [[12, -166, -12], [18, -180, -22], [20, -220, -28]], { anat: 'chest' }),
    S('bct', 'Pień ramienno-głowowy (BCT)', 'Brachiocephalic trunk (BCT)', 6, [[-6, -165, 6], [-12, -150, 8], [-18, -138, 8]], { anat: 'neck' }),
    S('sca_prox_r', 'Tętnica podobojczykowa', 'Subclavian artery', 4.5, [[-18, -138, 8], [-30, -136, 2], [-45, -140, -2], [-70, -150, -6]], { side: 'right', anat: 'neck' }),
    S('sca_prox_l', 'Tętnica podobojczykowa', 'Subclavian artery', 4.5, [[9, -164, -7], [17, -150, -6], [32, -141, -3], [48, -141, -3], [70, -150, -6]], { side: 'left', anat: 'neck' }),
    S('cca_prox_r', 'CCA – odcinek proksymalny', 'CCA – proximal', 3.6, [[-18, -138, 8], [-22, -116, 10], [-24, -100, 11]], { side: 'right', anat: 'neck' }),
    S('cca_prox_l', 'CCA – odcinek proksymalny', 'CCA – proximal', 3.6, [[1, -162, 1], [8, -145, 6], [17, -124, 9], [22, -110, 10], [24, -100, 11]], { side: 'left', anat: 'neck' }),
    P('cca_mid_r', 'CCA – odcinek środkowy / dystalny', 'CCA – mid / distal', 3.6, [[-24, -100, 11], [-25, -88, 11]], { anat: 'neck' }),
    P('carotid_bif_r', 'Rozwidlenie tętnicy szyjnej (opuszka)', 'Carotid bifurcation (bulb)', 4.2, [[-25, -88, 11], [-26, -82, 10]], { anat: 'neck' }),
    P('tct_r', 'Pień tarczowo-szyjny', 'Thyrocervical trunk', 1.1, [[-36, -137.5, 0], [-37, -129, 6], [-34, -120, 10]], { anat: 'neck' }),
    // ---------------------------------------------------------------- vertebral arteries
    P('va_ost_r', 'VA – ujście', 'VA – ostium', 1.9, [[-30, -136.5, 2], [-30, -128, -2]], { anat: 'neck' }),
    P('va_v1_r', 'VA V1 (przedotworowy)', 'VA V1 (pre-foraminal)', 1.8, [[-30, -128, -2], [-29, -118, -8], [-28, -110, -11]], { anat: 'neck' }),
    P('va_v2_r', 'VA V2 (otworowy, C6–C2)', 'VA V2 (foraminal, C6–C2)', 1.7, [[-28, -110, -11], [-28, -90, -12], [-29, -70, -13], [-30, -58, -14]], { anat: 'neck' }),
    P('va_v3_r', 'VA V3 (pętla atlasu)', 'VA V3 (atlas loop)', 1.7, [[-30, -58, -14], [-36, -53, -18], [-36, -47, -25], [-27, -44, -29], [-17, -41, -26]], { anat: 'neck' }),
    P('va_v4_r', 'VA V4 (wewnątrzczaszkowy)', 'VA V4 (intradural)', 1.6, [[-17, -41, -26], [-10, -36, -20], [-4, -31, -15], [0, -28, -13]]),
    P('pica_r', 'PICA', 'PICA', 0.7, [[-9, -35.5, -19.5], [-12, -40, -23], [-14, -44, -31], [-9, -40, -38], [-13, -46, -48], [-20, -52, -56]]),
    // ---------------------------------------------------------------- basilar and posterior circulation
    S('ba', 'Tętnica podstawna – pień', 'Basilar artery – trunk', 1.7, [[0, -28, -13], [0, -18, -10], [0, -8, -8], [0, -2, -7]]),
    S('ba_tip', 'Szczyt tętnicy podstawnej', 'Basilar tip', 1.7, [[0, -2, -7], [0, 1, -6]]),
    P('aica_r', 'AICA', 'AICA', 0.6, [[-1, -20, -10.5], [-10, -21, -13], [-20, -24, -20], [-28, -30, -28]]),
    P('sca_r', 'SCA', 'SCA', 0.7, [[-1, -3, -7], [-9, -3, -10], [-17, -1, -17], [-20, 2, -28], [-18, 4, -40]]),
    P('pca_p1_r', 'PCA P1', 'PCA P1', 1.2, [[0, 1, -6], [-6, 0, -4], [-11, -1, -2]]),
    P('pca_p2_r', 'PCA P2', 'PCA P2', 1.2, [[-11, -1, -2], [-17, 0, -8], [-21, 3, -18], [-22, 6, -28]]),
    P('pca_p3_r', 'PCA P3', 'PCA P3', 1.0, [[-22, 6, -28], [-19, 8, -40], [-15, 10, -50]]),
    P('pca_p4_r', 'PCA P4 – t. ostrogowa', 'PCA P4 – calcarine', 0.7, [[-15, 10, -50], [-12, 8, -62], [-9, 6, -74]]),
    P('pca_po_r', 'PCA P4 – t. ciemieniowo-potyliczna', 'PCA P4 – parieto-occipital', 0.7, [[-15, 10, -50], [-12, 22, -60], [-9, 32, -68]]),
    // ---------------------------------------------------------------- internal carotid artery (Bouthillier)
    P('ica_c1_r', 'ICA C1 (szyjny)', 'ICA C1 (cervical)', 2.7, [[-26, -82, 10], [-28, -76, 6], [-29, -62, 3], [-27, -48, 1]], { anat: 'neck' }),
    P('ica_c2_r', 'ICA C2 (skalisty)', 'ICA C2 (petrous)', 2.5, [[-27, -48, 1], [-26, -42, 3], [-23, -38, 9], [-18, -33, 13]]),
    P('ica_c3_r', 'ICA C3 (poszarpany)', 'ICA C3 (lacerum)', 2.4, [[-18, -33, 13], [-16, -28, 13]]),
    P('ica_c4_r', 'ICA C4 (jamisty, syfon)', 'ICA C4 (cavernous, siphon)', 2.4, [[-16, -28, 13], [-15, -23, 9], [-15, -19, 12], [-15, -17, 19], [-15, -15, 24]]),
    P('ica_c5_r', 'ICA C5 (klinowy)', 'ICA C5 (clinoid)', 2.3, [[-15, -15, 24], [-14, -10, 25]]),
    P('ica_c6_r', 'ICA C6 (oczny)', 'ICA C6 (ophthalmic)', 2.2, [[-14, -10, 25], [-14, -6, 21]]),
    P('ica_c7_r', 'ICA C7 (łączący)', 'ICA C7 (communicating)', 2.1, [[-14, -6, 21], [-13, -1, 16], [-13, 2, 14]]),
    P('ica_t_r', 'Rozwidlenie ICA (ICA-T)', 'ICA terminus (ICA-T)', 2.2, [[-13, 2, 14], [-14, 4, 13]]),
    P('opha_r', 'Tętnica oczna', 'Ophthalmic artery', 0.8, [[-14, -9, 24.5], [-17, -8, 30], [-22, -5, 42], [-25, -3, 52]]),
    P('pcom_r', 'PComA', 'PComA', 0.8, [[-13, -2, 17], [-12, -3, 8], [-11, -1, -2]]),
    P('acha_r', 'Tętnica naczyniówkowa przednia (AChA)', 'Anterior choroidal artery (AChA)', 0.5, [[-13, 0, 15.5], [-19, 2, 7], [-24, 5, -2], [-27, 8, -10]]),
    // ---------------------------------------------------------------- anterior cerebral artery
    P('aca_a1_r', 'ACA A1', 'ACA A1', 1.3, [[-14, 4, 13], [-9, 6, 18], [-3, 7, 22]]),
    S('acom', 'AComA', 'AComA', 0.8, [[-3, 7, 22], [3, 7, 22]]),
    P('aca_a2_r', 'ACA A2', 'ACA A2', 1.2, [[-3, 7, 22], [-3.5, 15, 27], [-4, 28, 31], [-4, 38, 31]]),
    P('aca_a3_r', 'ACA A3 (kolano)', 'ACA A3 (genu)', 1.1, [[-4, 38, 31], [-4, 50, 27], [-4, 58, 15], [-4, 61, 4]]),
    P('aca_a4_r', 'ACA A4–A5 (t. okołospoidłowa)', 'ACA A4–A5 (pericallosal)', 0.9, [[-4, 61, 4], [-4, 63, -12], [-4, 60, -30], [-4, 52, -45]]),
    P('callosomarginal_r', 'Tętnica obrzeżna spoidłowa', 'Callosomarginal artery', 0.8, [[-4, 49, 27], [-5, 62, 30], [-6, 75, 18], [-6, 82, 0], [-6, 82, -20]]),
    P('frontopolar_r', 'Tętnica czołowo-biegunowa', 'Frontopolar artery', 0.6, [[-3.6, 20, 28.5], [-6, 25, 45], [-8, 30, 58]]),
    // ---------------------------------------------------------------- middle cerebral artery
    P('mca_m1_r', 'MCA M1', 'MCA M1', 1.6, [[-14, 4, 13], [-20, 5, 13], [-27, 5, 12], [-33, 4, 10]]),
    P('lsa_r', 'Tętnice soczewkowo-prążkowe', 'Lenticulostriate arteries', 0.35, [[-21, 5, 13], [-21, 12, 13], [-20, 21, 12]]),
    P('ant_temporal_r', 'Tętnica skroniowa przednia', 'Anterior temporal artery', 0.6, [[-27, 5, 12], [-36, -2, 17], [-48, -12, 15]]),
    P('mca_bif_r', 'Rozwidlenie MCA', 'MCA bifurcation', 1.5, [[-33, 4, 10], [-36, 4, 8]]),
    P('mca_m2s_r', 'MCA M2 – pień górny', 'MCA M2 – superior trunk', 1.1, [[-36, 4, 8], [-39, 10, 11], [-40, 20, 10], [-40, 30, 6]]),
    P('mca_m2i_r', 'MCA M2 – pień dolny', 'MCA M2 – inferior trunk', 1.1, [[-36, 4, 8], [-40, 2, 1], [-41, 6, -8], [-41, 12, -16]]),
    P('mca_m3s_r', 'MCA M3 – górne gałęzie wieczkowe', 'MCA M3 – superior opercular', 0.8, [[-40, 30, 6], [-48, 36, 8], [-55, 40, 10]]),
    P('mca_m3i_r', 'MCA M3 – dolne gałęzie wieczkowe', 'MCA M3 – inferior opercular', 0.8, [[-41, 12, -16], [-50, 16, -20], [-57, 18, -24]]),
    P('mca_m4s_r', 'MCA M4 – gałęzie korowe (czołowe)', 'MCA M4 – cortical (frontal)', 0.6, [[-55, 40, 10], [-58, 52, 22], [-56, 64, 30]]),
    P('mca_m4p_r', 'MCA M4 – gałęzie korowe (ciemieniowe)', 'MCA M4 – cortical (parietal)', 0.6, [[-55, 40, 10], [-60, 48, -4], [-60, 58, -16]]),
    P('mca_m4i_r', 'MCA M4 – gałęzie korowe (skroniowe)', 'MCA M4 – cortical (temporal)', 0.6, [[-57, 18, -24], [-62, 25, -38], [-60, 30, -52]]),
    // ---------------------------------------------------------------- external carotid artery
    P('eca_prox_r', 'ECA – odcinek proksymalny', 'ECA – proximal', 2.2, [[-26, -82, 10], [-25, -76, 15], [-28, -66, 17]], { anat: 'neck' }),
    P('eca_dist_r', 'ECA – odcinek dystalny', 'ECA – distal', 1.8, [[-28, -66, 17], [-32, -56, 15], [-35, -46, 13]], { anat: 'neck' }),
    P('sup_thyr_r', 'Tętnica tarczowa górna', 'Superior thyroid artery', 0.9, [[-25, -80, 13.5], [-21, -86, 20], [-17, -96, 24]], { anat: 'neck' }),
    P('lingual_r', 'Tętnica językowa', 'Lingual artery', 1.0, [[-26, -73, 16.5], [-22, -70, 24], [-15, -64, 32]], { anat: 'neck' }),
    P('facial_a_r', 'Tętnica twarzowa', 'Facial artery', 1.0, [[-27.5, -69, 17], [-31, -64, 25], [-34, -56, 36], [-33, -44, 46], [-27, -30, 52]], { anat: 'neck' }),
    P('occipital_r', 'Tętnica potyliczna', 'Occipital artery', 0.9, [[-28, -70, 14], [-34, -62, 0], [-38, -52, -18], [-35, -40, -40], [-28, -25, -55]], { anat: 'neck' }),
    P('apa_r', 'Tętnica gardłowa wstępująca', 'Ascending pharyngeal artery', 0.6, [[-26, -80, 11], [-22, -66, 8], [-18, -52, 6], [-15, -42, 4]], { anat: 'neck' }),
    P('sta_r', 'Tętnica skroniowa powierzchowna', 'Superficial temporal artery', 1.0, [[-35, -46, 13], [-40, -38, 10], [-50, -25, 12], [-58, -5, 14], [-58, 20, 18]], { anat: 'neck' }),
    P('ima_max_r', 'Tętnica szczękowa', 'Internal maxillary artery', 1.1, [[-35, -46, 13], [-32, -42, 20], [-26, -40, 27], [-20, -38, 33]], { anat: 'neck' }),
    P('spa_r', 'Tętnica klinowo-podniebienna', 'Sphenopalatine artery', 0.6, [[-20, -38, 33], [-12, -34, 40], [-7, -30, 44]], { anat: 'neck' }),
    P('mma_r', 'Tętnica oponowa środkowa (MMA)', 'Middle meningeal artery (MMA)', 0.8, [[-30, -41.5, 23], [-31, -36, 18], [-38, -25, 16], [-50, -10, 18], [-56, 10, 15]]),
  ],
};

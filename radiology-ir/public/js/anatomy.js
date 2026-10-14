// Anatomy → vessel / organ → procedure vocabulary for the "Zabieg" picker.
// Templates carry `proc` (procedure keys) and `anat` (region keys) so the picker can suggest them.
// Labels: [Polish, English].

export const PROCEDURES = {
  // vascular — general
  diag_angio: ['Angiografia diagnostyczna', 'Diagnostic angiography'],
  pta: ['Angioplastyka balonowa (PTA)', 'Balloon angioplasty (PTA)'],
  stent: ['Stentowanie', 'Stenting'],
  stent_graft: ['Stentgraft (EVAR / TEVAR / stent pokryty)', 'Stent graft (EVAR / TEVAR / covered stent)'],
  endoleak: ['Leczenie przecieku (endoleak)', 'Endoleak treatment'],
  embolization: ['Embolizacja', 'Embolization'],
  aneurysm_embolization: ['Embolizacja tętniaka / tętniaka rzekomego', 'Aneurysm / pseudoaneurysm embolization'],
  chemoembolization: ['Chemoembolizacja (TACE)', 'Chemoembolization (TACE)'],
  radioembolization: ['Radioembolizacja (TARE / SIRT)', 'Radioembolization (TARE / SIRT)'],
  pve: ['Embolizacja żyły wrotnej (PVE)', 'Portal vein embolization (PVE)'],
  tips: ['TIPS', 'TIPS'],
  thrombolysis: ['Tromboliza docewnikowa (CDT)', 'Catheter-directed thrombolysis (CDT)'],
  thrombectomy: ['Trombektomia mechaniczna', 'Mechanical thrombectomy'],
  atherectomy: ['Aterektomia', 'Atherectomy'],
  ivc_filter: ['Filtr żyły głównej dolnej', 'IVC filter'],
  venous_access: ['Dostęp żylny (port / PICC / cewnik)', 'Venous access (port / PICC / catheter)'],
  dialysis: ['Interwencja na dostępie dializacyjnym', 'Dialysis access intervention'],
  foreign_body: ['Usunięcie ciała obcego', 'Foreign body retrieval'],
  venous_sampling: ['Selektywne pobieranie krwi żylnej', 'Venous sampling'],
  sclerotherapy: ['Skleroterapia', 'Sclerotherapy'],
  coronary_angio: ['Koronarografia', 'Coronary angiography'],
  pci: ['PCI – angioplastyka / stent wieńcowy', 'PCI – coronary angioplasty / stent'],
  // non-vascular
  nephrostomy: ['Nefrostomia', 'Nephrostomy'],
  ureteral_stent: ['Stent moczowodowy (antegradowo)', 'Ureteric stent (antegrade)'],
  biliary_drainage: ['Drenaż dróg żółciowych (PTBD)', 'Biliary drainage (PTBD)'],
  biliary_stent: ['Stent żółciowy', 'Biliary stent'],
  cholecystostomy: ['Cholecystostomia', 'Cholecystostomy'],
  biopsy: ['Biopsja', 'Biopsy'],
  drainage: ['Drenaż zbiornika / ropnia', 'Collection / abscess drainage'],
  pleural: ['Nakłucie / drenaż opłucnej', 'Pleural aspiration / drain'],
  paracentesis: ['Paracenteza', 'Paracentesis'],
  ablation: ['Ablacja (RFA / MWA / krio)', 'Ablation (RFA / MWA / cryo)'],
  gastrostomy: ['Gastrostomia (RIG)', 'Gastrostomy (RIG)'],
  gi_stent: ['Stent przewodu pokarmowego', 'GI stent'],
  vertebroplasty: ['Wertebroplastyka / kyfoplastyka', 'Vertebroplasty / kyphoplasty'],
  injection: ['Iniekcja / blokada (staw, korzeń, nerw)', 'Injection / block (joint, root, nerve)'],
  marker: ['Lokalizacja zmiany / znacznik', 'Lesion localisation / marker'],
  // neuro
  neuro_angio: ['Angiografia mózgowa (DSA)', 'Cerebral angiography (DSA)'],
  stroke_thrombectomy: ['Trombektomia w udarze', 'Stroke thrombectomy'],
  coiling: ['Embolizacja tętniaka spiralami', 'Aneurysm coiling'],
  stent_coiling: ['Embolizacja z użyciem stentu / balonu', 'Stent- / balloon-assisted coiling'],
  flow_diverter: ['Stent przekierowujący przepływ (flow diverter)', 'Flow diverter'],
  intrasaccular: ['Urządzenie wewnątrzworkowe', 'Intrasaccular device'],
  carotid_stenting: ['Stentowanie tętnicy szyjnej (CAS)', 'Carotid artery stenting (CAS)'],
  intracranial_stenting: ['Angioplastyka / stent wewnątrzczaszkowy', 'Intracranial angioplasty / stent'],
  avm_embolization: ['Embolizacja AVM', 'AVM embolization'],
  davf_embolization: ['Embolizacja przetoki oponowej (dAVF) / CCF', 'dAVF / CCF embolization'],
  tumour_embolization: ['Embolizacja guza', 'Tumour embolization'],
  vasospasm: ['Leczenie skurczu naczyń', 'Vasospasm treatment'],
  venous_sinus: ['Interwencja w zatokach żylnych', 'Venous sinus intervention'],
  epistaxis: ['Embolizacja w krwawieniu z nosa', 'Epistaxis embolization'],
  mma_embolization: ['Embolizacja tętnicy oponowej środkowej (przewlekły krwiak)', 'Middle meningeal artery embolization (chronic SDH)'],
  bot: ['Próba okluzji balonowej (BOT)', 'Balloon test occlusion (BTO)'],
  spinal_angio: ['Angiografia rdzeniowa', 'Spinal angiography'],
};

const V = 'vessel';
const O = 'organ';
// Body parts, head to foot. `kind` = which branch of IR the part offers (both are shown when relevant).
export const BODY_PARTS = [
  {
    id: 'brain', label: ['Mózgowie / koło Willisa', 'Brain / circle of Willis'], groups: ['Neuro'],
    targets: [
      ['ica_c2', 'ICA C2 (część skalista)', 'ICA C2 (petrous)', V],
      ['ica_c3', 'ICA C3 (część poszarpana)', 'ICA C3 (lacerum)', V],
      ['ica_c4', 'ICA C4 (część jamista)', 'ICA C4 (cavernous)', V],
      ['ica_c5', 'ICA C5 (część klinowa)', 'ICA C5 (clinoid)', V],
      ['ica_c6', 'ICA C6 (część oczna)', 'ICA C6 (ophthalmic)', V],
      ['ica_c7', 'ICA C7 (część łącząca)', 'ICA C7 (communicating)', V],
      ['ica_t', 'Rozwidlenie ICA (ICA-T)', 'ICA terminus (ICA-T)', V],
      ['opha', 'Tętnica oczna', 'Ophthalmic artery', V],
      ['acha', 'Tętnica naczyniówkowa przednia', 'Anterior choroidal artery', V],
      ['pcom', 'Tętnica łącząca tylna (PComA)', 'Posterior communicating artery (PComA)', V],
      ['aca_a1', 'ACA A1', 'ACA A1', V],
      ['acom', 'Tętnica łącząca przednia (AComA)', 'Anterior communicating artery (AComA)', V],
      ['aca_a2', 'ACA A2', 'ACA A2', V],
      ['aca_a3', 'ACA A3 / tętnica okołospoidłowa', 'ACA A3 / pericallosal artery', V],
      ['mca_m1', 'MCA M1', 'MCA M1', V],
      ['mca_bif', 'Rozwidlenie MCA', 'MCA bifurcation', V],
      ['mca_m2', 'MCA M2', 'MCA M2', V],
      ['mca_m3', 'MCA M3', 'MCA M3', V],
      ['mca_m4', 'MCA M4', 'MCA M4', V],
      ['va_v4', 'Tętnica kręgowa V4', 'Vertebral artery V4', V],
      ['pica', 'PICA', 'PICA', V],
      ['ba', 'Tętnica podstawna (pień)', 'Basilar artery (trunk)', V],
      ['ba_tip', 'Szczyt tętnicy podstawnej', 'Basilar tip', V],
      ['aica', 'AICA', 'AICA', V],
      ['sca', 'SCA', 'SCA', V],
      ['pca_p1', 'PCA P1', 'PCA P1', V],
      ['pca_p2', 'PCA P2', 'PCA P2', V],
      ['pca_p3', 'PCA P3', 'PCA P3', V],
      ['pca_p4', 'PCA P4', 'PCA P4', V],
      ['mma', 'Tętnica oponowa środkowa', 'Middle meningeal artery', V],
      ['sss', 'Zatoka strzałkowa górna', 'Superior sagittal sinus', V],
      ['transverse_sinus', 'Zatoka poprzeczna', 'Transverse sinus', V],
      ['sigmoid_sinus', 'Zatoka esowata', 'Sigmoid sinus', V],
      ['straight_sinus', 'Zatoka prosta / żyły głębokie', 'Straight sinus / deep veins', V],
      ['cavernous_sinus', 'Zatoka jamista', 'Cavernous sinus', V],
      ['brain_avm', 'Malformacja tętniczo-żylna mózgu', 'Brain AVM', O],
    ],
    procedures: ['neuro_angio', 'stroke_thrombectomy', 'coiling', 'stent_coiling', 'flow_diverter', 'intrasaccular', 'intracranial_stenting',
      'avm_embolization', 'davf_embolization', 'tumour_embolization', 'vasospasm', 'venous_sinus', 'mma_embolization', 'bot'],
  },
  {
    id: 'neck', label: ['Szyja / tętnice szyjne i kręgowe', 'Neck / carotid and vertebral arteries'], groups: ['Neuro', 'Vascular', 'NonVascular'],
    targets: [
      ['cca', 'Tętnica szyjna wspólna', 'Common carotid artery', V],
      ['carotid_bif', 'Rozwidlenie tętnicy szyjnej', 'Carotid bifurcation', V],
      ['ica_c1', 'ICA C1 (część szyjna)', 'ICA C1 (cervical)', V],
      ['eca', 'Tętnica szyjna zewnętrzna', 'External carotid artery', V],
      ['ima_max', 'Tętnica szczękowa / klinowo-podniebienna', 'Maxillary / sphenopalatine artery', V],
      ['facial_a', 'Tętnica twarzowa', 'Facial artery', V],
      ['va_v1', 'Tętnica kręgowa V1 (ujście)', 'Vertebral artery V1 (ostium)', V],
      ['va_v2', 'Tętnica kręgowa V2', 'Vertebral artery V2', V],
      ['va_v3', 'Tętnica kręgowa V3', 'Vertebral artery V3', V],
      ['ijv', 'Żyła szyjna wewnętrzna', 'Internal jugular vein', V],
      ['thyroid', 'Tarczyca', 'Thyroid', O],
      ['neck_node', 'Węzeł chłonny szyi', 'Cervical lymph node', O],
      ['neck_mass', 'Guz / zbiornik szyi', 'Neck mass / collection', O],
    ],
    procedures: ['neuro_angio', 'carotid_stenting', 'stent', 'pta', 'epistaxis', 'tumour_embolization', 'embolization', 'bot', 'venous_access', 'biopsy', 'drainage', 'ablation'],
  },
  {
    id: 'chest', label: ['Klatka piersiowa', 'Chest'], groups: ['Vascular', 'NonVascular'],
    targets: [
      ['arch', 'Łuk aorty', 'Aortic arch', V],
      ['desc_aorta', 'Aorta piersiowa zstępująca', 'Descending thoracic aorta', V],
      ['bct', 'Pień ramienno-głowowy', 'Brachiocephalic trunk', V],
      ['subclavian', 'Tętnica podobojczykowa', 'Subclavian artery', V],
      ['bronchial', 'Tętnice oskrzelowe', 'Bronchial arteries', V],
      ['intercostal', 'Tętnice międzyżebrowe', 'Intercostal arteries', V],
      ['ima_chest', 'Tętnica piersiowa wewnętrzna', 'Internal mammary artery', V],
      ['pulm_a', 'Tętnice płucne', 'Pulmonary arteries', V],
      ['svc', 'Żyła główna górna / żyły ramienno-głowowe', 'SVC / brachiocephalic veins', V],
      ['lung', 'Płuco', 'Lung', O],
      ['pleura', 'Jama opłucnej', 'Pleural space', O],
      ['mediastinum', 'Śródpiersie', 'Mediastinum', O],
    ],
    procedures: ['diag_angio', 'stent_graft', 'endoleak', 'stent', 'pta', 'embolization', 'thrombectomy', 'thrombolysis', 'venous_access', 'foreign_body',
      'biopsy', 'drainage', 'pleural', 'ablation', 'marker'],
  },
  {
    id: 'heart', label: ['Serce / tętnice wieńcowe', 'Heart / coronary arteries'], groups: ['Vascular'],
    targets: [
      ['lm', 'Pień lewej tętnicy wieńcowej (LM)', 'Left main (LM)', V],
      ['lad', 'Gałąź przednia zstępująca (LAD)', 'Left anterior descending (LAD)', V],
      ['diag', 'Gałąź diagonalna (D)', 'Diagonal branch (D)', V],
      ['lcx', 'Gałąź okalająca (LCx)', 'Left circumflex (LCx)', V],
      ['om', 'Gałąź marginalna (OM)', 'Obtuse marginal (OM)', V],
      ['ramus', 'Gałąź pośrednia (RI)', 'Ramus intermedius (RI)', V],
      ['rca', 'Prawa tętnica wieńcowa (RCA)', 'Right coronary artery (RCA)', V],
      ['pda', 'Gałąź zstępująca tylna (PDA)', 'Posterior descending (PDA)', V],
      ['plb', 'Gałąź tylno-boczna (PLB)', 'Posterolateral branch (PLB)', V],
    ],
    procedures: ['coronary_angio', 'pci', 'stent', 'pta'],
  },
  {
    id: 'abdomen', label: ['Jama brzuszna', 'Abdomen'], groups: ['Vascular', 'NonVascular'],
    targets: [
      ['abd_aorta', 'Aorta brzuszna', 'Abdominal aorta', V],
      ['celiac', 'Pień trzewny', 'Coeliac trunk', V],
      ['cha', 'Tętnica wątrobowa wspólna / właściwa', 'Common / proper hepatic artery', V],
      ['rha', 'Tętnica wątrobowa prawa', 'Right hepatic artery', V],
      ['lha', 'Tętnica wątrobowa lewa', 'Left hepatic artery', V],
      ['gda', 'Tętnica żołądkowo-dwunastnicza', 'Gastroduodenal artery', V],
      ['lga', 'Tętnica żołądkowa lewa', 'Left gastric artery', V],
      ['splenic_a', 'Tętnica śledzionowa', 'Splenic artery', V],
      ['sma', 'Tętnica krezkowa górna', 'Superior mesenteric artery', V],
      ['ima', 'Tętnica krezkowa dolna', 'Inferior mesenteric artery', V],
      ['renal_a', 'Tętnica nerkowa', 'Renal artery', V],
      ['lumbar_a', 'Tętnice lędźwiowe', 'Lumbar arteries', V],
      ['portal_v', 'Żyła wrotna', 'Portal vein', V],
      ['hepatic_v', 'Żyły wątrobowe', 'Hepatic veins', V],
      ['ivc', 'Żyła główna dolna', 'Inferior vena cava', V],
      ['renal_v', 'Żyła nerkowa / nadnerczowa', 'Renal / adrenal vein', V],
      ['liver', 'Wątroba', 'Liver', O],
      ['bile_ducts', 'Drogi żółciowe', 'Bile ducts', O],
      ['gallbladder', 'Pęcherzyk żółciowy', 'Gallbladder', O],
      ['kidney', 'Nerka / układ kielichowo-miedniczkowy', 'Kidney / collecting system', O],
      ['ureter', 'Moczowód', 'Ureter', O],
      ['pancreas', 'Trzustka', 'Pancreas', O],
      ['spleen', 'Śledziona', 'Spleen', O],
      ['adrenal', 'Nadnercze', 'Adrenal gland', O],
      ['stomach', 'Żołądek / dwunastnica', 'Stomach / duodenum', O],
      ['peritoneum', 'Jama otrzewnej', 'Peritoneal cavity', O],
      ['retroperitoneum', 'Przestrzeń zaotrzewnowa', 'Retroperitoneum', O],
    ],
    procedures: ['diag_angio', 'stent_graft', 'endoleak', 'pta', 'stent', 'embolization', 'aneurysm_embolization', 'chemoembolization', 'radioembolization',
      'pve', 'tips', 'thrombectomy', 'thrombolysis', 'ivc_filter', 'venous_sampling', 'foreign_body',
      'nephrostomy', 'ureteral_stent', 'biliary_drainage', 'biliary_stent', 'cholecystostomy', 'biopsy', 'drainage', 'paracentesis', 'ablation',
      'gastrostomy', 'gi_stent', 'sclerotherapy'],
  },
  {
    id: 'pelvis', label: ['Miednica', 'Pelvis'], groups: ['Vascular', 'NonVascular'],
    targets: [
      ['cia', 'Tętnica biodrowa wspólna', 'Common iliac artery', V],
      ['eia', 'Tętnica biodrowa zewnętrzna', 'External iliac artery', V],
      ['iia', 'Tętnica biodrowa wewnętrzna', 'Internal iliac artery', V],
      ['uterine_a', 'Tętnice maciczne', 'Uterine arteries', V],
      ['prostatic_a', 'Tętnice sterczowe', 'Prostatic arteries', V],
      ['gluteal_a', 'Tętnice pośladkowe', 'Gluteal arteries', V],
      ['pudendal_a', 'Tętnica sromowa wewnętrzna', 'Internal pudendal artery', V],
      ['gonadal_v', 'Żyła jądrowa / jajnikowa', 'Gonadal vein', V],
      ['iliac_v', 'Żyły biodrowe', 'Iliac veins', V],
      ['bladder', 'Pęcherz moczowy', 'Urinary bladder', O],
      ['prostate', 'Gruczoł krokowy', 'Prostate', O],
      ['uterus', 'Macica / przydatki', 'Uterus / adnexa', O],
      ['pelvic_collection', 'Zbiornik w miednicy', 'Pelvic collection', O],
    ],
    procedures: ['diag_angio', 'pta', 'stent', 'stent_graft', 'embolization', 'aneurysm_embolization', 'thrombectomy', 'thrombolysis', 'sclerotherapy',
      'biopsy', 'drainage', 'nephrostomy', 'injection'],
  },
  {
    id: 'upper_limb', label: ['Kończyna górna', 'Upper limb'], groups: ['Vascular', 'NonVascular'],
    targets: [
      ['axillary_a', 'Tętnica pachowa', 'Axillary artery', V],
      ['brachial_a', 'Tętnica ramienna', 'Brachial artery', V],
      ['radial_a', 'Tętnica promieniowa', 'Radial artery', V],
      ['ulnar_a', 'Tętnica łokciowa', 'Ulnar artery', V],
      ['av_fistula', 'Przetoka tętniczo-żylna do dializ', 'Dialysis AV fistula', V],
      ['av_graft', 'Proteza naczyniowa do dializ', 'Dialysis AV graft', V],
      ['arm_veins', 'Żyły kończyny górnej (odpływ)', 'Arm veins (outflow)', V],
      ['joint', 'Staw', 'Joint', O],
      ['bone', 'Kość', 'Bone', O],
      ['soft_tissue', 'Tkanki miękkie', 'Soft tissue', O],
    ],
    procedures: ['diag_angio', 'pta', 'stent', 'stent_graft', 'thrombectomy', 'thrombolysis', 'dialysis', 'embolization', 'venous_access', 'foreign_body'],
  },
  {
    id: 'lower_limb', label: ['Kończyna dolna', 'Lower limb'], groups: ['Vascular', 'NonVascular'],
    targets: [
      ['cfa', 'Tętnica udowa wspólna', 'Common femoral artery', V],
      ['sfa', 'Tętnica udowa powierzchowna', 'Superficial femoral artery', V],
      ['pfa', 'Tętnica głęboka uda', 'Profunda femoris artery', V],
      ['popliteal_a', 'Tętnica podkolanowa', 'Popliteal artery', V],
      ['tpt', 'Pień piszczelowo-strzałkowy', 'Tibioperoneal trunk', V],
      ['ata', 'Tętnica piszczelowa przednia', 'Anterior tibial artery', V],
      ['pta_a', 'Tętnica piszczelowa tylna', 'Posterior tibial artery', V],
      ['peroneal_a', 'Tętnica strzałkowa', 'Peroneal artery', V],
      ['foot_a', 'Tętnice stopy', 'Pedal arteries', V],
      ['femoral_v', 'Żyła udowa / podkolanowa', 'Femoral / popliteal vein', V],
      ['joint', 'Staw', 'Joint', O],
      ['bone', 'Kość', 'Bone', O],
      ['soft_tissue', 'Tkanki miękkie', 'Soft tissue', O],
    ],
    procedures: ['diag_angio', 'pta', 'stent', 'stent_graft', 'atherectomy', 'thrombectomy', 'thrombolysis', 'aneurysm_embolization', 'embolization', 'sclerotherapy'],
  },
  {
    id: 'spine', label: ['Kręgosłup / układ ruchu', 'Spine / musculoskeletal'], groups: ['NonVascular', 'Neuro'],
    targets: [
      ['vertebra', 'Trzon kręgu', 'Vertebral body', O],
      ['nerve_root', 'Korzeń nerwowy', 'Nerve root', O],
      ['facet', 'Staw międzywyrostkowy', 'Facet joint', O],
      ['si_joint', 'Staw krzyżowo-biodrowy', 'Sacroiliac joint', O],
      ['joint', 'Staw obwodowy', 'Peripheral joint', O],
      ['bone', 'Kość', 'Bone', O],
      ['soft_tissue', 'Tkanki miękkie', 'Soft tissue', O],
      ['spinal_a', 'Tętnice rdzeniowe / segmentalne', 'Spinal / segmental arteries', V],
    ],
    procedures: ['vertebroplasty', 'injection', 'biopsy', 'ablation', 'drainage', 'spinal_angio', 'embolization', 'tumour_embolization', 'sclerotherapy'],
  },
];

export const SIDES = [
  ['', '—', '—'],
  ['right', 'prawa', 'right'],
  ['left', 'lewa', 'left'],
  ['both', 'obustronnie', 'bilateral'],
];

export const bodyPart = (id) => BODY_PARTS.find((b) => b.id === id) || null;
export const procLabel = (key, lang = 'pl') => PROCEDURES[key]?.[lang === 'en' ? 1 : 0] || key;

/** "MCA M1 – strona prawa" / "right MCA M1"; several targets are joined with commas. */
export function targetText(partId, targetIds, side, lang = 'pl') {
  const part = bodyPart(partId);
  if (!part) return '';
  const en = lang === 'en';
  const names = targetIds.map((id) => part.targets.find((t) => t[0] === id)).filter(Boolean).map((t) => (en ? t[2] : t[1]));
  if (!names.length) return '';
  const list = names.join(', ');
  if (side === 'both') return en ? `${list}, bilateral` : `${list} – obustronnie`;
  if (side === 'right' || side === 'left') {
    if (en) return `${side} ${list}`;
    return `${list} – strona ${side === 'right' ? 'prawa' : 'lewa'}`;
  }
  return list;
}

const STOP = new Set(['tętnica', 'tętnice', 'tętnicy', 'żyła', 'żyły', 'artery', 'arteries', 'część', 'strona', 'vein', 'veins', 'główna', 'wspólna', 'common']);
const fold = (x) => String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l');
/** Words that identify a vessel / organ in a template name: acronyms (MCA, AComA, PICA…) and word stems. */
function targetKeys(partId, targetIds, labels = []) {
  const part = bodyPart(partId);
  const keys = new Set();
  for (const id of targetIds || []) {
    const t = part?.targets.find((x) => x[0] === id);
    if (!t) continue;
    for (const label of [t[1], t[2]]) {
      for (const a of label.match(/\b[A-Z][A-Za-z]{0,3}[A-Z]\b/g) || []) keys.add(a);
      for (const w of fold(label).split(/[^a-z0-9]+/)) if (w.length >= 5 && !STOP.has(w)) keys.add(w.slice(0, 6));
    }
  }
  // free labels (e.g. a clicked diagram part: "MCA M1", "Tętnica nerkowa")
  for (const label of labels) {
    for (const a of String(label).match(/\b[A-Z][A-Za-z]{0,3}[A-Z]\b/g) || []) keys.add(a);
    // segment names such as M1, A2, P1, C4, V4, S1 identify the right template ("Trombektomia M1")
    for (const a of String(label).match(/\b[A-Z]\d\b/g) || []) keys.add(a);
    for (const w of fold(label).split(/[^a-z0-9]+/)) if (w.length >= 5 && !STOP.has(w)) keys.add(w.slice(0, 6));
  }
  return [...keys];
}

/**
 * Templates matching a procedure (and, when given, a body part), best match first; templates whose
 * name mentions the chosen vessel / organ (e.g. "MCA" for the MCA bifurcation) come first.
 */
export function suggestTemplates(templates, procKey, partId, targetIds = [], labels = []) {
  const hits = templates.filter((t) => Array.isArray(t.proc) && t.proc.includes(procKey));
  const partScore = (t) => (partId && Array.isArray(t.anat) && t.anat.includes(partId) ? 0 : partId && Array.isArray(t.anat) && t.anat.length ? 2 : 1);
  const keys = targetKeys(partId, targetIds, labels);
  const keyScore = (t) => {
    if (!keys.length) return 0;
    const name = `${t.title} ${t.titleEn || ''}`;
    const folded = fold(name);
    return -keys.filter((k) => (/[A-Z]/.test(k) ? new RegExp(`\\b${k}\\b`).test(name) : folded.includes(k))).length;
  };
  // the procedure itself (e.g. coiling) ranks above follow-up / diagnostic templates that merely mention it
  const primary = (t) => (t.proc[0] === procKey ? 0 : 1);
  return hits.filter((t) => partScore(t) < 2 || !partId)
    .sort((a, b) => partScore(a) - partScore(b) || keyScore(a) - keyScore(b) || primary(a) - primary(b) || (a.priority ?? 50) - (b.priority ?? 50));
}

/** Procedures offered for a body part: its own list plus any procedure a template tags with that part. */
export function proceduresFor(partId, templates = []) {
  const part = bodyPart(partId);
  if (!part) return [];
  const out = [...part.procedures];
  for (const t of templates) {
    if (!Array.isArray(t.anat) || !t.anat.includes(partId) || !Array.isArray(t.proc)) continue;
    for (const p of t.proc) if (PROCEDURES[p] && !out.includes(p)) out.push(p);
  }
  return out;
}

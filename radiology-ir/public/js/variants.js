// Anatomical variants an interventional radiologist records (Polish / English). Each variant belongs to
// one or more diagrams; many also change the 3D / 2D model (a vessel thinner, thicker, missing or added).
// Vessel abbreviations stay universal and English-based (MCA, PCA, PComA, SMA, RHA…).
//
// effect(side) → { hide: [partId], scale: { partId: factor }, add: [part] }   (side: 'right' | 'left' | '')

// mirror a path written for the patient's right side (viewer's left) to the left side: x → W − x
export function mirrorD(d, W) {
  const tokens = String(d).match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let out = ''; let xNext = true;
  for (const t of tokens) {
    if (/[A-Za-z]/.test(t)) { out += ` ${t}`; xNext = true; continue; }
    const v = Number(t);
    out += ` ${xNext ? +(W - v).toFixed(2) : v}`;
    xNext = !xNext;
  }
  return out.trim();
}
const sideId = (base, side) => (side === 'left' ? `${base}_l` : `${base}_r`);
const sideOf = (side) => (side === 'left' ? 'left' : 'right');

export const VARIANTS = [
  // ---------------------------------------------------------------- circle of Willis
  { id: 'fetal_pca', diagrams: ['neuro3d'], sided: true, label: ['Płodowy typ PCA (fetal PCA)', 'Fetal-type PCA'],
    text: ['płodowy typ PCA — PCA zaopatrywana głównie przez PComA, segment P1 hipoplastyczny', 'fetal-type PCA — PCA supplied mainly via the PComA, hypoplastic P1'],
    effect: (s) => ({ scale: { [sideId('pca_p1', s)]: 0.35, [sideId('pcom', s)]: 1.9 } }) },
  { id: 'hypoplastic_p1', diagrams: ['neuro3d'], sided: true, label: ['Hipoplazja P1', 'Hypoplastic P1'], text: ['hipoplazja segmentu P1 PCA', 'hypoplastic PCA P1 segment'], effect: (s) => ({ scale: { [sideId('pca_p1', s)]: 0.4 } }) },
  { id: 'hypoplastic_a1', diagrams: ['neuro3d'], sided: true, label: ['Hipoplazja A1', 'Hypoplastic A1'], text: ['hipoplazja segmentu A1 ACA', 'hypoplastic ACA A1 segment'], effect: (s) => ({ scale: { [sideId('aca_a1', s)]: 0.35 } }) },
  { id: 'aplastic_a1', diagrams: ['neuro3d'], sided: true, label: ['Aplazja A1', 'Absent A1'], text: ['aplazja segmentu A1 ACA — oba A2 zaopatrywane przez A1 strony przeciwnej', 'absent ACA A1 — both A2 segments supplied by the contralateral A1'], effect: (s) => ({ hide: [sideId('aca_a1', s)] }) },
  { id: 'hypoplastic_pcom', diagrams: ['neuro3d'], sided: true, label: ['Hipoplazja PComA', 'Hypoplastic PComA'], text: ['hipoplastyczna PComA', 'hypoplastic PComA'], effect: (s) => ({ scale: { [sideId('pcom', s)]: 0.4 } }) },
  { id: 'absent_pcom', diagrams: ['neuro3d'], sided: true, label: ['Brak PComA', 'Absent PComA'], text: ['brak PComA', 'absent PComA'], effect: (s) => ({ hide: [sideId('pcom', s)] }) },
  { id: 'absent_acom', diagrams: ['neuro3d'], label: ['Brak AComA', 'Absent AComA'], text: ['brak AComA', 'absent AComA'], effect: () => ({ hide: ['acom'] }) },
  { id: 'acom_duplicated', diagrams: ['neuro3d'], label: ['Zdwojona / ufenestrowana AComA', 'Duplicated / fenestrated AComA'], text: ['zdwojona (ufenestrowana) AComA', 'duplicated (fenestrated) AComA'],
    effect: () => ({ add: [{ id: 'acom_dup', label: ['AComA – druga gałąź', 'AComA – second channel'], side: '', kind: 'vessel', w: 2.5, z: 4, r: 0.6, pts3: [[-3, 8.6, 21], [0, 9.6, 21], [3, 8.6, 21]] }] }) },
  { id: 'azygos_aca', diagrams: ['neuro3d'], label: ['Nieparzysta ACA (azygos ACA)', 'Azygos ACA'], text: ['nieparzysta tętnica przednia mózgu (azygos ACA) — pojedynczy pień A2', 'azygos ACA — a single A2 trunk'],
    effect: () => ({ hide: ['aca_a2_r', 'aca_a2_l', 'acom'], add: [{ id: 'aca_azygos', label: ['ACA nieparzysta (A2)', 'Azygos ACA (A2)'], side: '', kind: 'vessel', w: 5.5, z: [3, 30], r: 1.5, pts3: [[-3, 7, 22], [0, 10, 24], [0, 16, 27], [0, 28, 31], [-0.5, 38, 31]] }, { id: 'aca_azygos_l', label: ['ACA nieparzysta – połączenie', 'Azygos ACA – junction'], side: '', kind: 'vessel', w: 4.5, z: 3, r: 1.2, abs: true, pts3: [[3, 7, 22], [0, 10, 24]] }] }) },
  { id: 'median_callosal', diagrams: ['neuro3d'], label: ['Tętnica środkowa ciała modzelowatego (trzecia A2)', 'Median callosal artery (triplicated A2)'], text: ['obecna tętnica środkowa ciała modzelowatego (potrojona A2)', 'median callosal artery present (triplicated A2)'],
    effect: () => ({ add: [{ id: 'median_callosal', label: ['Tętnica środkowa ciała modzelowatego', 'Median callosal artery'], side: '', kind: 'vessel', w: 3, z: [3, 24], r: 0.7, pts3: [[0, 7, 22], [0, 15, 27], [0, 27, 31], [0, 36, 31]] }] }) },
  { id: 'bihemispheric_aca', diagrams: ['neuro3d'], sided: true, label: ['Dwupółkulowa ACA', 'Bihemispheric ACA'], text: ['dwupółkulowa ACA — jedna A2 zaopatruje obie półkule', 'bihemispheric ACA — one A2 supplies both hemispheres'], effect: (s) => ({ scale: { [sideId('aca_a2', s === 'left' ? 'right' : 'left')]: 0.45, [sideId('aca_a2', s)]: 1.3 } }) },
  { id: 'mca_trifurcation', diagrams: ['neuro3d'], sided: true, label: ['Trifurkacja MCA (zamiast bifurkacji)', 'MCA trifurcation (instead of bifurcation)'], text: ['trifurkacja MCA (trzy pnie M2)', 'MCA trifurcation (three M2 trunks)'],
    effect: (s) => ({ add: [{ id: sideId('mca_m2m', s), label: ['MCA M2 – pień środkowy', 'MCA M2 – middle trunk'], side: sideOf(s), kind: 'vessel', w: 4.2, z: [5, 18], r: 1.0, pts3: [[-36, 4, 8], [-40, 6, 3], [-42, 12, -2], [-46, 18, -4]] }] }) },
  { id: 'mca_early_bif', diagrams: ['neuro3d'], sided: true, label: ['Wczesna bifurkacja MCA (krótki M1)', 'Early MCA bifurcation (short M1)'], text: ['wczesna bifurkacja MCA (krótki segment M1)', 'early MCA bifurcation (short M1)'], effect: (s) => ({ scale: { [sideId('mca_m1', s)]: 1 } }) },
  { id: 'mca_monofurcation', diagrams: ['neuro3d'], sided: true, label: ['Brak podziału MCA (pojedynczy pień)', 'Single-trunk MCA (no bifurcation)'], text: ['pojedynczy pień MCA bez typowego podziału', 'single-trunk MCA without a typical division'], effect: (s) => ({ hide: [sideId('mca_m2i', s)] }) },
  { id: 'accessory_mca', diagrams: ['neuro3d'], sided: true, label: ['Dodatkowa MCA (z ACA)', 'Accessory MCA (from ACA)'], text: ['dodatkowa MCA odchodząca od ACA', 'accessory MCA arising from the ACA'],
    effect: (s) => ({ add: [{ id: sideId('mca_acc', s), label: ['Dodatkowa MCA', 'Accessory MCA'], side: sideOf(s), kind: 'vessel', w: 3, z: [2, 10], r: 0.7, pts3: [[-9, 6, 18], [-18, 9, 20], [-28, 12, 20], [-38, 16, 18]] }] }) },
  { id: 'duplicated_mca', diagrams: ['neuro3d'], sided: true, label: ['Zdwojona MCA (z ICA)', 'Duplicated MCA (from ICA)'], text: ['zdwojona MCA odchodząca od ICA', 'duplicated MCA arising from the ICA'],
    effect: (s) => ({ add: [{ id: sideId('mca_dup', s), label: ['Zdwojona MCA', 'Duplicated MCA'], side: sideOf(s), kind: 'vessel', w: 3, z: [-2, 8], r: 0.8, pts3: [[-13, 1, 15.5], [-20, 0, 10], [-30, -2, 6], [-40, -4, 4]] }] }) },
  { id: 'persistent_trigeminal', diagrams: ['neuro3d'], sided: true, label: ['Przetrwała tętnica trójdzielna (PTA)', 'Persistent trigeminal artery'], text: ['przetrwała tętnica trójdzielna (połączenie ICA – tętnica podstawna)', 'persistent trigeminal artery (ICA – basilar anastomosis)'],
    effect: (s) => ({ add: [{ id: sideId('ptra', s), label: ['Przetrwała tętnica trójdzielna', 'Persistent trigeminal artery'], side: sideOf(s), kind: 'vessel', w: 4, z: [-24, -30], r: 1.0, pts3: [[-15, -21, 10], [-10, -18, 2], [-4, -14, -6], [0, -12, -8.5]] }] }) },
  { id: 'basilar_fenestration', diagrams: ['neuro3d'], label: ['Fenestracja tętnicy podstawnej', 'Basilar artery fenestration'], text: ['fenestracja proksymalnego odcinka tętnicy podstawnej', 'proximal basilar artery fenestration'],
    effect: () => ({ add: [{ id: 'ba_fen', label: ['Tętnica podstawna – fenestracja', 'Basilar fenestration'], side: '', kind: 'vessel', w: 4, z: [-40, -30], r: 0.9, pts3: [[0, -24, -12], [1.9, -20, -11], [1.9, -15, -9.5], [0, -11, -8.5]] }] }) },
  { id: 'va_hypoplastic', diagrams: ['neuro3d'], sided: true, label: ['Hipoplazja tętnicy kręgowej', 'Hypoplastic vertebral artery'], text: ['hipoplastyczna tętnica kręgowa', 'hypoplastic vertebral artery'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 0.45, [sideId('va_v1', s)]: 0.45, [sideId('va_v2', s)]: 0.45, [sideId('va_v3', s)]: 0.45 } }) },
  { id: 'va_dominant', diagrams: ['neuro3d'], sided: true, label: ['Dominująca tętnica kręgowa', 'Dominant vertebral artery'], text: ['dominująca tętnica kręgowa', 'dominant vertebral artery'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 1.35, [sideId('va_v2', s)]: 1.35 } }) },
  { id: 'va_pica_end', diagrams: ['neuro3d'], sided: true, label: ['Tętnica kręgowa kończąca się w PICA', 'Vertebral artery ending in PICA'], text: ['tętnica kręgowa kończąca się w PICA (bez połączenia z tętnicą podstawną)', 'vertebral artery terminating in PICA (no basilar contribution)'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 0.5, [sideId('pica', s)]: 1.4 } }) },
  { id: 'aica_pica', diagrams: ['neuro3d'], sided: true, label: ['Wspólny pień AICA–PICA', 'AICA–PICA common trunk'], text: ['wspólny pień AICA–PICA', 'AICA–PICA common trunk'], effect: (s) => ({ scale: { [sideId('pica', s)]: 0.5, [sideId('aica', s)]: 1.4 } }) },
  { id: 'duplicated_sca', diagrams: ['neuro3d'], sided: true, label: ['Zdwojona SCA', 'Duplicated SCA'], text: ['zdwojona SCA', 'duplicated SCA'], effect: (s) => ({ scale: { [sideId('sca', s)]: 1 } }) },
  { id: 'ophth_from_mma', diagrams: ['neuro3d'], sided: true, label: ['Tętnica oczna z MMA', 'Ophthalmic artery from the MMA'], text: ['tętnica oczna odchodząca od tętnicy oponowej środkowej', 'ophthalmic artery arising from the middle meningeal artery'], effect: (s) => ({ scale: { [sideId('opha', s)]: 0.4 } }) },
  { id: 'mma_from_opha', diagrams: ['neuro3d'], sided: true, label: ['MMA z tętnicy ocznej', 'MMA from the ophthalmic artery'], text: ['tętnica oponowa środkowa odchodząca od tętnicy ocznej', 'middle meningeal artery arising from the ophthalmic artery'] },
  { id: 'infundibulum_pcom', diagrams: ['neuro3d'], sided: true, label: ['Lejek (infundibulum) PComA', 'PComA infundibulum'], text: ['poszerzenie lejkowate ujścia PComA (infundibulum, < 3 mm)', 'infundibular dilatation of the PComA origin (< 3 mm)'] },

  // ---------------------------------------------------------------- arch / neck
  { id: 'bovine_arch', diagrams: ['neuro3d', 'body3d'], label: ['Łuk typu „bovine” (LCCA z BCT)', 'Bovine arch (LCCA from the BCT)'], text: ['łuk aorty typu „bovine” — lewa tętnica szyjna wspólna odchodzi od pnia ramienno-głowowego', 'bovine-type arch — left CCA arising from the brachiocephalic trunk'],
    effect: () => ({ hide: ['cca_prox_l', 'lcca'], add: [
      { id: 'cca_bovine_l', diagram: 'neuro3d', label: ['Lewa CCA (z BCT)', 'Left CCA (from BCT)'], side: 'left', kind: 'vessel', w: 8, z: [8, 0], r: 3.4, abs: true, pts3: [[-10, -156, 7], [0, -142, 9], [12, -126, 10], [20, -112, 10], [24, -100, 11]] },
      { id: 'lcca_bovine', diagram: 'body3d', label: ['Lewa CCA (z BCT)', 'Left CCA (from BCT)'], side: '', kind: 'vessel', w: 7, z: [10, 0], r: 4.3, abs: true, pts3: [[-11, 368, 23], [-2, 385, 20], [6, 410, 16], [24, 450, 20]] }] }) },
  { id: 'common_carotid_trunk', diagrams: ['neuro3d', 'body3d'], label: ['Wspólny pień tętnic szyjnych', 'Common carotid trunk'], text: ['wspólny pień obu tętnic szyjnych wspólnych', 'common origin of both common carotid arteries'] },
  { id: 'arsa', diagrams: ['neuro3d', 'body3d'], label: ['Nieprawidłowa prawa podobojczykowa (a. lusoria)', 'Aberrant right subclavian artery (lusoria)'], text: ['nieprawidłowa prawa tętnica podobojczykowa (arteria lusoria) odchodząca jako ostatnia gałąź łuku, przebiegająca za przełykiem', 'aberrant right subclavian artery (arteria lusoria) arising as the last arch branch, retro-oesophageal'],
    effect: () => ({ hide: ['sca_prox_r'], add: [{ id: 'arsa', diagram: 'neuro3d', label: ['Prawa podobojczykowa nieprawidłowa', 'Aberrant right subclavian'], side: 'right', kind: 'vessel', w: 9, z: [-30, -45, -20, -10], r: 4.3, abs: true, pts3: [[14, -168, -14], [4, -158, -22], [-12, -148, -18], [-26, -140, -6], [-36, -138, 0], [-50, -141, -2], [-70, -150, -6]] }] }) },
  { id: 'left_va_arch', diagrams: ['neuro3d', 'body3d'], label: ['Lewa kręgowa bezpośrednio z łuku', 'Left vertebral artery from the arch'], text: ['lewa tętnica kręgowa odchodzi bezpośrednio od łuku aorty', 'left vertebral artery arising directly from the aortic arch'],
    effect: () => ({ hide: ['va_ost_l'], add: [{ id: 'va_arch_l', diagram: 'neuro3d', label: ['Lewa VA (z łuku)', 'Left VA (from the arch)'], side: 'left', kind: 'vessel', w: 5, z: [-15, -18], r: 1.8, abs: true, pts3: [[3, -162, -1], [14, -150, -5], [24, -136, -6], [30, -128, -2]] }] }) },
  { id: 'right_arch', diagrams: ['neuro3d', 'body3d'], label: ['Prawostronny łuk aorty', 'Right-sided aortic arch'], text: ['prawostronny łuk aorty', 'right-sided aortic arch'] },
  { id: 'high_bifurcation', diagrams: ['neuro3d'], sided: true, label: ['Wysoki podział tętnicy szyjnej wspólnej', 'High carotid bifurcation'], text: ['wysoki podział tętnicy szyjnej wspólnej', 'high carotid bifurcation'] },
  { id: 'ica_kinking', diagrams: ['neuro3d'], sided: true, label: ['Kręty przebieg / pętla ICA (kinking, coiling)', 'ICA tortuosity / kinking / coiling'], text: ['kręty przebieg ICA (kinking / coiling)', 'tortuous ICA (kinking / coiling)'] },
  { id: 'va_entry', diagrams: ['neuro3d'], sided: true, label: ['Nietypowe wejście VA do otworu wyrostka (nie C6)', 'Atypical vertebral entry (not C6)'], text: ['tętnica kręgowa wchodzi do otworu wyrostka poprzecznego na nietypowym poziomie', 'vertebral artery enters the foramen transversarium at an atypical level'] },
  { id: 'apa_neuromeningeal', diagrams: ['neuro3d'], sided: true, label: ['Istotne zespolenia ECA–ICA / ECA–VA', 'Dangerous ECA–ICA / ECA–VA anastomoses'], text: ['istotne anastomozy ECA–ICA / ECA–VA (niebezpieczne przy embolizacji)', 'significant ECA–ICA / ECA–VA anastomoses (dangerous for embolization)'] },

  // ---------------------------------------------------------------- aorta / visceral / renal
  { id: 'replaced_rha', diagrams: ['body3d'], label: ['Zastąpiona RHA z SMA (replaced RHA)', 'Replaced RHA from the SMA'], text: ['zastąpiona prawa tętnica wątrobowa odchodząca od SMA', 'replaced right hepatic artery arising from the SMA'],
    effect: () => ({ hide: ['right_hepatic'], add: [{ id: 'rha_replaced', label: ['RHA zastąpiona (z SMA)', 'Replaced RHA (from SMA)'], side: '', kind: 'vessel', w: 4, z: [40, 25, 30], r: 2, abs: true, pts3: [[-2, 118, 31], [-25, 140, 34], [-55, 165, 22], [-80, 178, 6]] }] }) },
  { id: 'accessory_rha', diagrams: ['body3d'], label: ['Dodatkowa RHA z SMA', 'Accessory RHA from the SMA'], text: ['dodatkowa prawa tętnica wątrobowa odchodząca od SMA', 'accessory right hepatic artery arising from the SMA'],
    effect: () => ({ add: [{ id: 'rha_accessory', label: ['Dodatkowa RHA (z SMA)', 'Accessory RHA (from SMA)'], side: '', kind: 'vessel', w: 3, z: [40, 25, 28], r: 1.4, abs: true, pts3: [[-2, 116, 31], [-28, 136, 30], [-60, 158, 16], [-86, 168, 0]] }] }) },
  { id: 'replaced_lha', diagrams: ['body3d'], label: ['Zastąpiona LHA z LGA (replaced LHA)', 'Replaced LHA from the LGA'], text: ['zastąpiona lewa tętnica wątrobowa odchodząca od tętnicy żołądkowej lewej', 'replaced left hepatic artery arising from the left gastric artery'],
    effect: () => ({ hide: ['left_hepatic'], add: [{ id: 'lha_replaced', label: ['LHA zastąpiona (z LGA)', 'Replaced LHA (from LGA)'], side: '', kind: 'vessel', w: 4, z: 45, r: 1.7, abs: true, pts3: [[14, 182, 34], [0, 190, 30], [-22, 190, 22]] }] }) },
  { id: 'accessory_lha', diagrams: ['body3d'], label: ['Dodatkowa LHA z LGA', 'Accessory LHA from the LGA'], text: ['dodatkowa lewa tętnica wątrobowa odchodząca od tętnicy żołądkowej lewej', 'accessory left hepatic artery arising from the left gastric artery'],
    effect: () => ({ add: [{ id: 'lha_accessory', label: ['Dodatkowa LHA (z LGA)', 'Accessory LHA (from LGA)'], side: '', kind: 'vessel', w: 3, z: 45, r: 1.2, abs: true, pts3: [[12, 178, 34], [-4, 186, 32], [-26, 186, 26]] }] }) },
  { id: 'cha_from_sma', diagrams: ['body3d'], label: ['CHA z SMA (zastąpiona CHA)', 'CHA from the SMA (replaced CHA)'], text: ['tętnica wątrobowa wspólna odchodzi od SMA', 'common hepatic artery arising from the SMA'],
    effect: () => ({ hide: ['common_hepatic'], add: [{ id: 'cha_from_sma', label: ['CHA (z SMA)', 'CHA (from SMA)'], side: '', kind: 'vessel', w: 6, z: [40, 35], r: 3, abs: true, pts3: [[-2, 120, 30], [-12, 135, 34], [-24, 146, 33], [-30, 150, 32]] }] }) },
  { id: 'coeliacomesenteric', diagrams: ['body3d'], label: ['Pień trzewno-krezkowy', 'Coeliacomesenteric trunk'], text: ['wspólny pień trzewno-krezkowy', 'common coeliacomesenteric trunk'] },
  { id: 'hepatomesenteric', diagrams: ['body3d'], label: ['Pień wątrobowo-krezkowy', 'Hepatomesenteric trunk'], text: ['pień wątrobowo-krezkowy (CHA i SMA wspólnym pniem)', 'hepatomesenteric trunk (CHA and SMA share a trunk)'] },
  { id: 'gda_variant', diagrams: ['body3d'], label: ['Trifurkacja PHA / nietypowe odejście GDA', 'PHA trifurcation / atypical GDA origin'], text: ['nietypowe odejście GDA (trifurkacja tętnicy wątrobowej)', 'atypical GDA origin (hepatic artery trifurcation)'] },
  { id: 'accessory_renal', diagrams: ['body3d'], sided: true, label: ['Dodatkowa tętnica nerkowa', 'Accessory renal artery'], text: ['dodatkowa tętnica nerkowa', 'accessory renal artery'],
    effect: (s) => ({ add: [{ id: sideId('renal_acc', s), label: ['Dodatkowa tętnica nerkowa', 'Accessory renal artery'], side: sideOf(s), kind: 'vessel', r: 1.8, pts3: [[0, 100, -4], [-20, 98, -10], [-40, 96, -18], [-56, 98, -26]] }] }) },
  { id: 'early_renal_branching', diagrams: ['body3d'], sided: true, label: ['Wczesny podział tętnicy nerkowej', 'Early renal artery branching'], text: ['wczesny podział tętnicy nerkowej (< 1,5 cm od ujścia)', 'early renal artery branching (< 1.5 cm from the ostium)'] },
  { id: 'meandering_mesenteric', diagrams: ['body3d'], label: ['Łuk Riolana / meandrująca tętnica krezkowa', 'Arc of Riolan / meandering mesenteric artery'], text: ['poszerzony łuk Riolana (meandrująca tętnica krezkowa)', 'enlarged arc of Riolan (meandering mesenteric artery)'] },
  { id: 'arc_buhler', diagrams: ['body3d'], label: ['Łuk Bühlera', 'Arc of Bühler'], text: ['łuk Bühlera (połączenie pnia trzewnego z SMA)', 'arc of Bühler (coeliac–SMA connection)'] },
  { id: 'phrenic_from_coeliac', diagrams: ['body3d'], label: ['Tętnice przeponowe dolne z pnia trzewnego', 'Inferior phrenic arteries from the coeliac trunk'], text: ['tętnice przeponowe dolne odchodzą od pnia trzewnego', 'inferior phrenic arteries arising from the coeliac trunk'] },
  { id: 'extrahepatic_hcc_supply', diagrams: ['body3d'], label: ['Pozawątrobowe unaczynienie guza (np. IPA)', 'Extrahepatic tumour supply (e.g. IPA)'], text: ['pozawątrobowe unaczynienie guza (np. z tętnicy przeponowej dolnej)', 'extrahepatic tumour supply (e.g. from the inferior phrenic artery)'] },

  // ---------------------------------------------------------------- veins
  { id: 'retroaortic_lrv', diagrams: ['veins'], label: ['Zaaortalna lewa żyła nerkowa', 'Retro-aortic left renal vein'], text: ['zaaortalna lewa żyła nerkowa', 'retro-aortic left renal vein'] },
  { id: 'circumaortic_lrv', diagrams: ['veins'], label: ['Okołoaortalny pierścień żylny (circumaortic LRV)', 'Circumaortic left renal vein'], text: ['okołoaortalna lewa żyła nerkowa (pierścień żylny)', 'circumaortic left renal vein'] },
  { id: 'left_ivc', diagrams: ['veins'], label: ['Lewostronna IVC', 'Left-sided IVC'], text: ['lewostronna żyła główna dolna', 'left-sided inferior vena cava'] },
  { id: 'duplicated_ivc', diagrams: ['veins'], label: ['Zdwojona IVC', 'Duplicated IVC'], text: ['zdwojona żyła główna dolna', 'duplicated inferior vena cava'] },
  { id: 'azygos_continuation', diagrams: ['veins'], label: ['Ciągłość IVC przez żyłę nieparzystą', 'Azygos continuation of the IVC'], text: ['ciągłość żyły głównej dolnej przez żyłę nieparzystą (brak odcinka wątrobowego IVC)', 'azygos continuation of the IVC (absent hepatic segment)'] },
  { id: 'left_svc', diagrams: ['veins', 'chest_vessels'], label: ['Przetrwała lewa SVC', 'Persistent left SVC'], text: ['przetrwała lewa żyła główna górna (spływ do zatoki wieńcowej)', 'persistent left superior vena cava (draining into the coronary sinus)'] },
  { id: 'may_thurner', diagrams: ['veins', 'body3d'], label: ['Ucisk lewej żyły biodrowej (May-Thurner)', 'Left iliac vein compression (May-Thurner)'], text: ['ucisk lewej żyły biodrowej wspólnej przez prawą tętnicę biodrową wspólną (May-Thurner)', 'compression of the left common iliac vein by the right CIA (May-Thurner)'] },
  { id: 'nutcracker', diagrams: ['veins'], label: ['Ucisk lewej żyły nerkowej (nutcracker)', 'Nutcracker (LRV compression)'], text: ['ucisk lewej żyły nerkowej między aortą a SMA (nutcracker)', 'left renal vein compression between the aorta and the SMA (nutcracker)'] },
  { id: 'portal_trifurcation', diagrams: ['veins'], label: ['Trifurkacja żyły wrotnej', 'Portal vein trifurcation'], text: ['trifurkacja żyły wrotnej', 'portal vein trifurcation'] },
  { id: 'accessory_hepatic_vein', diagrams: ['veins'], label: ['Dodatkowa prawa dolna żyła wątrobowa', 'Accessory inferior right hepatic vein'], text: ['dodatkowa prawa dolna żyła wątrobowa', 'accessory inferior right hepatic vein'] },
  { id: 'transverse_sinus_hypoplasia', diagrams: ['venous_sinuses'], sided: true, label: ['Hipoplazja zatoki poprzecznej', 'Hypoplastic transverse sinus'], text: ['hipoplazja zatoki poprzecznej', 'hypoplastic transverse sinus'], effect: (s) => ({ scale: { [sideId('transverse_sinus', s)]: 0.45, [sideId('ts', s)]: 0.45 } }) },
  { id: 'dominant_transverse', diagrams: ['venous_sinuses'], sided: true, label: ['Dominująca zatoka poprzeczna', 'Dominant transverse sinus'], text: ['dominująca zatoka poprzeczna', 'dominant transverse sinus'] },
  { id: 'arachnoid_granulation', diagrams: ['venous_sinuses'], sided: true, label: ['Ziarnistość pajęczynówki w zatoce', 'Arachnoid granulation in a sinus'], text: ['ziarnistość pajęczynówki w świetle zatoki', 'arachnoid granulation within the sinus'] },

  // ---------------------------------------------------------------- pelvis / lower limb
  { id: 'high_popliteal_bif', diagrams: ['body3d'], sided: true, label: ['Wysoki podział tętnicy podkolanowej', 'High popliteal bifurcation'], text: ['wysoki podział tętnicy podkolanowej', 'high popliteal artery bifurcation'] },
  { id: 'popliteal_trifurcation', diagrams: ['body3d'], sided: true, label: ['Trifurkacja tętnicy podkolanowej (brak TPT)', 'Popliteal trifurcation (no TPT)'], text: ['trifurkacja tętnicy podkolanowej (brak pnia piszczelowo-strzałkowego)', 'popliteal trifurcation (absent tibioperoneal trunk)'], effect: (s) => ({ scale: { [sideId('tpt', s)]: 0.6 } }) },
  { id: 'peroneal_magna', diagrams: ['body3d'], sided: true, label: ['Tętnica strzałkowa wielka (peronea magna)', 'Peronea magna'], text: ['tętnica strzałkowa wielka zaopatrująca stopę (hipoplazja tętnic piszczelowych)', 'peronea magna supplying the foot (hypoplastic tibial arteries)'], effect: (s) => ({ scale: { [sideId('peroneal', s)]: 1.6, [sideId('pta_distal', s)]: 0.4, [sideId('ata_distal', s)]: 0.4 } }) },
  { id: 'persistent_sciatic', diagrams: ['body3d'], sided: true, label: ['Przetrwała tętnica kulszowa', 'Persistent sciatic artery'], text: ['przetrwała tętnica kulszowa', 'persistent sciatic artery'] },
  { id: 'corona_mortis', diagrams: ['body3d'], sided: true, label: ['Corona mortis (tętnica zasłonowa z EIA / nadbrzusznej)', 'Corona mortis (obturator from the EIA / epigastric)'], text: ['corona mortis — tętnica zasłonowa odchodząca od tętnicy nadbrzusznej dolnej / EIA', 'corona mortis — obturator artery arising from the inferior epigastric / EIA'] },
  { id: 'high_pfa', diagrams: ['body3d'], sided: true, label: ['Wysokie odejście tętnicy głębokiej uda', 'High origin of the profunda femoris'], text: ['wysokie odejście tętnicy głębokiej uda', 'high origin of the profunda femoris artery'] },
  { id: 'prostatic_origin', diagrams: ['body3d'], sided: true, label: ['Nietypowe odejście tętnicy sterczowej', 'Atypical prostatic artery origin'], text: ['nietypowe odejście tętnicy sterczowej (np. z tętnicy zasłonowej / sromowej wewnętrznej)', 'atypical prostatic artery origin (e.g. from the obturator / internal pudendal artery)'] },
  { id: 'ovarian_supply', diagrams: ['body3d'], sided: true, label: ['Istotne unaczynienie z tętnicy jajnikowej', 'Significant ovarian artery supply'], text: ['istotne unaczynienie z tętnicy jajnikowej', 'significant ovarian artery supply'] },

  // ---------------------------------------------------------------- upper limb
  { id: 'high_radial', diagrams: ['upper_limb'], sided: true, label: ['Wysokie odejście tętnicy promieniowej', 'High origin of the radial artery'], text: ['wysokie odejście tętnicy promieniowej (od tętnicy ramiennej / pachowej)', 'high origin of the radial artery (from the brachial / axillary artery)'] },
  { id: 'radial_loop', diagrams: ['upper_limb'], sided: true, label: ['Pętla tętnicy promieniowej', 'Radial artery loop'], text: ['pętla tętnicy promieniowej', 'radial artery loop'] },
  { id: 'incomplete_palmar_arch', diagrams: ['upper_limb'], sided: true, label: ['Niekompletny łuk dłoniowy', 'Incomplete palmar arch'], text: ['niekompletny łuk dłoniowy', 'incomplete palmar arch'], effect: (s) => ({ scale: { [sideId('palmar_arch', s)]: 0.4 } }) },
  { id: 'persistent_median', diagrams: ['upper_limb'], sided: true, label: ['Przetrwała tętnica pośrodkowa', 'Persistent median artery'], text: ['przetrwała tętnica pośrodkowa', 'persistent median artery'] },


  // ---------------------------------------------------------------- chest
  { id: 'bronchial_common_trunk', diagrams: ['chest_vessels'], label: ['Wspólny pień tętnic oskrzelowych', 'Common bronchial trunk'], text: ['wspólny pień tętnic oskrzelowych', 'common bronchial artery trunk'] },
  { id: 'bronchial_ectopic', diagrams: ['chest_vessels'], label: ['Ektopowe odejście tętnicy oskrzelowej', 'Ectopic bronchial artery origin'], text: ['ektopowe odejście tętnicy oskrzelowej (np. z łuku aorty / podobojczykowej)', 'ectopic bronchial artery origin (e.g. from the arch / subclavian)'] },
  { id: 'spinal_from_bronchial', diagrams: ['chest_vessels', 'spinal'], label: ['Gałąź rdzeniowa z tętnicy oskrzelowej / międzyżebrowej', 'Spinal branch from a bronchial / intercostal artery'], text: ['gałąź rdzeniowa odchodząca od leczonej tętnicy oskrzelowej / międzyżebrowej', 'spinal branch arising from the bronchial / intercostal artery'] },
  { id: 'azygos_lobe', diagrams: ['nv_chest'], label: ['Płat żyły nieparzystej', 'Azygos lobe'], text: ['płat żyły nieparzystej', 'azygos lobe'] },
  { id: 'adamkiewicz_level', diagrams: ['spinal', 'body3d'], sided: true, label: ['Tętnica Adamkiewicza – poziom', 'Artery of Adamkiewicz – level'], text: ['tętnica Adamkiewicza na poziomie …', 'artery of Adamkiewicz at level …'] },

  // ---------------------------------------------------------------- biliary / urinary / other
  { id: 'rpd_to_lhd', diagrams: ['nv_abdomen'], label: ['Prawy tylny przewód uchodzi do LHD', 'Right posterior duct draining into the LHD'], text: ['prawy tylny przewód wątrobowy uchodzi do lewego przewodu wątrobowego', 'right posterior hepatic duct draining into the left hepatic duct'] },
  { id: 'duct_trifurcation', diagrams: ['nv_abdomen'], label: ['Trifurkacja przewodów wątrobowych', 'Hepatic duct trifurcation'], text: ['trifurkacja przewodów wątrobowych', 'hepatic duct trifurcation'] },
  { id: 'low_cystic', diagrams: ['nv_abdomen'], label: ['Niskie / przyśrodkowe ujście przewodu pęcherzykowego', 'Low / medial cystic duct insertion'], text: ['niskie, przyśrodkowe ujście przewodu pęcherzykowego', 'low, medial cystic duct insertion'] },
  { id: 'aberrant_duct', diagrams: ['nv_abdomen'], label: ['Przewód Luschki / aberrantny przewód', 'Duct of Luschka / aberrant duct'], text: ['aberrantny przewód żółciowy (przewód Luschki)', 'aberrant bile duct (duct of Luschka)'] },
  { id: 'duplex_kidney', diagrams: ['nv_abdomen'], sided: true, label: ['Nerka zdwojona / zdwojony moczowód', 'Duplex kidney / ureter'], text: ['nerka zdwojona (zdwojony układ kielichowo-miedniczkowy / moczowód)', 'duplex kidney (duplicated collecting system / ureter)'] },
  { id: 'horseshoe', diagrams: ['nv_abdomen'], label: ['Nerka podkowiasta', 'Horseshoe kidney'], text: ['nerka podkowiasta', 'horseshoe kidney'] },
  { id: 'pelvic_kidney', diagrams: ['nv_abdomen'], sided: true, label: ['Nerka miedniczna (ektopia)', 'Pelvic (ectopic) kidney'], text: ['nerka miedniczna (ektopowa)', 'pelvic (ectopic) kidney'] },
  { id: 'retrocaval_ureter', diagrams: ['nv_abdomen'], label: ['Moczowód zażylny', 'Retrocaval ureter'], text: ['moczowód zażylny', 'retrocaval ureter'] },
  { id: 'extrarenal_pelvis', diagrams: ['nv_abdomen'], sided: true, label: ['Miedniczka pozanerkowa', 'Extrarenal pelvis'], text: ['miedniczka pozanerkowa', 'extrarenal pelvis'] },
  { id: 'transitional_vertebra', diagrams: ['spinal', 'nv_spine'], label: ['Kręg przejściowy (L5/S1)', 'Lumbosacral transitional vertebra'], text: ['kręg przejściowy lędźwiowo-krzyżowy (numeracja kręgów — sprawdzić)', 'lumbosacral transitional vertebra (check vertebral numbering)'] },
  { id: 'interposed_colon', diagrams: ['nv_abdomen'], label: ['Interpozycja okrężnicy (Chilaiditi / przed nerką)', 'Interposed colon (Chilaiditi / anterior to the kidney)'], text: ['interpozycja okrężnicy na torze dostępu', 'colon interposed in the access route'] },
];

export const variantById = (id) => VARIANTS.find((v) => v.id === id) || null;
export const variantsFor = (diagramId) => VARIANTS.filter((v) => v.diagrams.includes(diagramId));

/** "fetal-type PCA (right)" text for the report / letter. */
export function variantText(sel, lang = 'pl') {
  const v = variantById(sel.id);
  if (!v) return '';
  const t = v.text[lang === 'en' ? 1 : 0];
  if (!v.sided || !sel.side) return t;
  const side = { right: ['strona prawa', 'right'], left: ['strona lewa', 'left'], both: ['obustronnie', 'bilateral'] }[sel.side];
  return side ? `${t} (${side[lang === 'en' ? 1 : 0]})` : t;
}

/** The diagram with the selected variants applied (parts hidden, resized or added). Pure. */
export function applyVariants(diagram, selected = []) {
  if (!diagram) return diagram;
  const hide = new Set();
  const scale = {};
  const add = [];
  for (const sel of selected) {
    const v = variantById(sel.id);
    if (!v?.effect || !v.diagrams.includes(diagram.id)) continue;
    const sides = v.sided ? (sel.side === 'both' ? ['right', 'left'] : [sel.side || 'right']) : [''];
    for (const s of sides) {
      const e = v.effect(s) || {};
      for (const id of e.hide || []) hide.add(id);
      for (const [id, f] of Object.entries(e.scale || {})) scale[id] = (scale[id] || 1) * f;
      for (const p of e.add || []) {
        if (p.diagram && p.diagram !== diagram.id) continue;
        if (diagram.kind === 'model3d') {
          if (!p.pts3) continue;
          const pts = s === 'left' && !p.abs ? p.pts3.map(([x, y, z]) => [-x, y, z]) : p.pts3;
          add.push({ ...p, pts, r: p.r || 1, variant: v.id });
        } else if (p.d) add.push({ ...p, variant: v.id });
      }
    }
  }
  if (!hide.size && !add.length && !Object.keys(scale).length) return diagram;
  const parts = diagram.parts.filter((p) => !hide.has(p.id)).map((p) => (scale[p.id] && p.kind === 'vessel' ? (p.r !== undefined ? { ...p, r: Math.max(0.25, p.r * scale[p.id]) } : { ...p, w: Math.max(1, (p.w || 5) * scale[p.id]) }) : p));
  for (const p of add) if (!parts.some((x) => x.id === p.id)) parts.push(p);
  return { ...diagram, parts };
}

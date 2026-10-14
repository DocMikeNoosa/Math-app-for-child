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
/** For symmetric diagrams (circle of Willis, 600 wide): a right-side path mirrored for the left. */
const W600 = (d, side) => (side === 'left' ? mirrorD(d, 600) : d);

export const VARIANTS = [
  // ---------------------------------------------------------------- circle of Willis
  { id: 'fetal_pca', diagrams: ['willis'], sided: true, label: ['Płodowy typ PCA (fetal PCA)', 'Fetal-type PCA'],
    text: ['płodowy typ PCA — PCA zaopatrywana głównie przez PComA, segment P1 hipoplastyczny', 'fetal-type PCA — PCA supplied mainly via the PComA, hypoplastic P1'],
    effect: (s) => ({ scale: { [sideId('pca_p1', s)]: 0.35, [sideId('pcom', s)]: 1.9 } }) },
  { id: 'hypoplastic_p1', diagrams: ['willis'], sided: true, label: ['Hipoplazja P1', 'Hypoplastic P1'], text: ['hipoplazja segmentu P1 PCA', 'hypoplastic PCA P1 segment'], effect: (s) => ({ scale: { [sideId('pca_p1', s)]: 0.4 } }) },
  { id: 'hypoplastic_a1', diagrams: ['willis'], sided: true, label: ['Hipoplazja A1', 'Hypoplastic A1'], text: ['hipoplazja segmentu A1 ACA', 'hypoplastic ACA A1 segment'], effect: (s) => ({ scale: { [sideId('aca_a1', s)]: 0.35 } }) },
  { id: 'aplastic_a1', diagrams: ['willis'], sided: true, label: ['Aplazja A1', 'Absent A1'], text: ['aplazja segmentu A1 ACA — oba A2 zaopatrywane przez A1 strony przeciwnej', 'absent ACA A1 — both A2 segments supplied by the contralateral A1'], effect: (s) => ({ hide: [sideId('aca_a1', s)] }) },
  { id: 'hypoplastic_pcom', diagrams: ['willis'], sided: true, label: ['Hipoplazja PComA', 'Hypoplastic PComA'], text: ['hipoplastyczna PComA', 'hypoplastic PComA'], effect: (s) => ({ scale: { [sideId('pcom', s)]: 0.4 } }) },
  { id: 'absent_pcom', diagrams: ['willis'], sided: true, label: ['Brak PComA', 'Absent PComA'], text: ['brak PComA', 'absent PComA'], effect: (s) => ({ hide: [sideId('pcom', s)] }) },
  { id: 'absent_acom', diagrams: ['willis'], label: ['Brak AComA', 'Absent AComA'], text: ['brak AComA', 'absent AComA'], effect: () => ({ hide: ['acom'] }) },
  { id: 'acom_duplicated', diagrams: ['willis'], label: ['Zdwojona / ufenestrowana AComA', 'Duplicated / fenestrated AComA'], text: ['zdwojona (ufenestrowana) AComA', 'duplicated (fenestrated) AComA'],
    effect: () => ({ add: [{ id: 'acom_dup', label: ['AComA – druga gałąź', 'AComA – second channel'], side: '', kind: 'vessel', w: 2.5, z: 4, d: 'M290 214 Q300 219 310 214' }] }) },
  { id: 'azygos_aca', diagrams: ['willis'], label: ['Nieparzysta ACA (azygos ACA)', 'Azygos ACA'], text: ['nieparzysta tętnica przednia mózgu (azygos ACA) — pojedynczy pień A2', 'azygos ACA — a single A2 trunk'],
    effect: () => ({ hide: ['aca_a2_r', 'aca_a2_l', 'acom'], add: [{ id: 'aca_azygos', label: ['ACA nieparzysta (A2)', 'Azygos ACA (A2)'], side: '', kind: 'vessel', w: 5.5, z: [3, 30], d: 'M289 205 Q300 200 300 190 L300 130' }, { id: 'aca_azygos_l', label: ['ACA nieparzysta – połączenie', 'Azygos ACA – junction'], side: '', kind: 'vessel', w: 4.5, z: 3, d: 'M311 205 Q300 200 300 190' }] }) },
  { id: 'median_callosal', diagrams: ['willis'], label: ['Tętnica środkowa ciała modzelowatego (trzecia A2)', 'Median callosal artery (triplicated A2)'], text: ['obecna tętnica środkowa ciała modzelowatego (potrojona A2)', 'median callosal artery present (triplicated A2)'],
    effect: () => ({ add: [{ id: 'median_callosal', label: ['Tętnica środkowa ciała modzelowatego', 'Median callosal artery'], side: '', kind: 'vessel', w: 3, z: [3, 24], d: 'M300 205 L300 145' }] }) },
  { id: 'bihemispheric_aca', diagrams: ['willis'], sided: true, label: ['Dwupółkulowa ACA', 'Bihemispheric ACA'], text: ['dwupółkulowa ACA — jedna A2 zaopatruje obie półkule', 'bihemispheric ACA — one A2 supplies both hemispheres'], effect: (s) => ({ scale: { [sideId('aca_a2', s === 'left' ? 'right' : 'left')]: 0.45, [sideId('aca_a2', s)]: 1.3 } }) },
  { id: 'mca_trifurcation', diagrams: ['willis'], sided: true, label: ['Trifurkacja MCA (zamiast bifurkacji)', 'MCA trifurcation (instead of bifurcation)'], text: ['trifurkacja MCA (trzy pnie M2)', 'MCA trifurcation (three M2 trunks)'],
    effect: (s) => ({ add: [{ id: sideId('mca_m2m', s), label: ['MCA M2 – pień środkowy', 'MCA M2 – middle trunk'], side: sideOf(s), kind: 'vessel', w: 4.2, z: [5, 18], d: W600('M172 230 Q150 232 126 228', s) }] }) },
  { id: 'mca_early_bif', diagrams: ['willis'], sided: true, label: ['Wczesna bifurkacja MCA (krótki M1)', 'Early MCA bifurcation (short M1)'], text: ['wczesna bifurkacja MCA (krótki segment M1)', 'early MCA bifurcation (short M1)'], effect: (s) => ({ scale: { [sideId('mca_m1', s)]: 1 } }) },
  { id: 'mca_monofurcation', diagrams: ['willis'], sided: true, label: ['Brak podziału MCA (pojedynczy pień)', 'Single-trunk MCA (no bifurcation)'], text: ['pojedynczy pień MCA bez typowego podziału', 'single-trunk MCA without a typical division'], effect: (s) => ({ hide: [sideId('mca_m2i', s)] }) },
  { id: 'accessory_mca', diagrams: ['willis'], sided: true, label: ['Dodatkowa MCA (z ACA)', 'Accessory MCA (from ACA)'], text: ['dodatkowa MCA odchodząca od ACA', 'accessory MCA arising from the ACA'],
    effect: (s) => ({ add: [{ id: sideId('mca_acc', s), label: ['Dodatkowa MCA', 'Accessory MCA'], side: sideOf(s), kind: 'vessel', w: 3, z: [2, 10], d: W600('M270 222 Q232 214 192 206', s) }] }) },
  { id: 'duplicated_mca', diagrams: ['willis'], sided: true, label: ['Zdwojona MCA (z ICA)', 'Duplicated MCA (from ICA)'], text: ['zdwojona MCA odchodząca od ICA', 'duplicated MCA arising from the ICA'],
    effect: (s) => ({ add: [{ id: sideId('mca_dup', s), label: ['Zdwojona MCA', 'Duplicated MCA'], side: sideOf(s), kind: 'vessel', w: 3, z: [-2, 8], d: W600('M222 262 Q196 262 170 258', s) }] }) },
  { id: 'persistent_trigeminal', diagrams: ['willis'], sided: true, label: ['Przetrwała tętnica trójdzielna (PTA)', 'Persistent trigeminal artery'], text: ['przetrwała tętnica trójdzielna (połączenie ICA – tętnica podstawna)', 'persistent trigeminal artery (ICA – basilar anastomosis)'],
    effect: (s) => ({ add: [{ id: sideId('ptra', s), label: ['Przetrwała tętnica trójdzielna', 'Persistent trigeminal artery'], side: sideOf(s), kind: 'vessel', w: 4, z: [-24, -30], d: W600('M224 306 Q262 352 300 392', s) }] }) },
  { id: 'basilar_fenestration', diagrams: ['willis'], label: ['Fenestracja tętnicy podstawnej', 'Basilar artery fenestration'], text: ['fenestracja proksymalnego odcinka tętnicy podstawnej', 'proximal basilar artery fenestration'],
    effect: () => ({ add: [{ id: 'ba_fen', label: ['Tętnica podstawna – fenestracja', 'Basilar fenestration'], side: '', kind: 'vessel', w: 4, z: [-40, -30], d: 'M300 462 Q316 432 300 402' }] }) },
  { id: 'va_hypoplastic', diagrams: ['willis', 'neck_vessels'], sided: true, label: ['Hipoplazja tętnicy kręgowej', 'Hypoplastic vertebral artery'], text: ['hipoplastyczna tętnica kręgowa', 'hypoplastic vertebral artery'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 0.45, [sideId('va_v1', s)]: 0.45, [sideId('va_v2', s)]: 0.45, [sideId('va_v3', s)]: 0.45 } }) },
  { id: 'va_dominant', diagrams: ['willis', 'neck_vessels'], sided: true, label: ['Dominująca tętnica kręgowa', 'Dominant vertebral artery'], text: ['dominująca tętnica kręgowa', 'dominant vertebral artery'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 1.35, [sideId('va_v2', s)]: 1.35 } }) },
  { id: 'va_pica_end', diagrams: ['willis'], sided: true, label: ['Tętnica kręgowa kończąca się w PICA', 'Vertebral artery ending in PICA'], text: ['tętnica kręgowa kończąca się w PICA (bez połączenia z tętnicą podstawną)', 'vertebral artery terminating in PICA (no basilar contribution)'], effect: (s) => ({ scale: { [sideId('va_v4', s)]: 0.5, [sideId('pica', s)]: 1.4 } }) },
  { id: 'aica_pica', diagrams: ['willis'], sided: true, label: ['Wspólny pień AICA–PICA', 'AICA–PICA common trunk'], text: ['wspólny pień AICA–PICA', 'AICA–PICA common trunk'], effect: (s) => ({ scale: { [sideId('pica', s)]: 0.5, [sideId('aica', s)]: 1.4 } }) },
  { id: 'duplicated_sca', diagrams: ['willis'], sided: true, label: ['Zdwojona SCA', 'Duplicated SCA'], text: ['zdwojona SCA', 'duplicated SCA'], effect: (s) => ({ scale: { [sideId('sca', s)]: 1 } }) },
  { id: 'ophth_from_mma', diagrams: ['willis'], sided: true, label: ['Tętnica oczna z MMA', 'Ophthalmic artery from the MMA'], text: ['tętnica oczna odchodząca od tętnicy oponowej środkowej', 'ophthalmic artery arising from the middle meningeal artery'], effect: (s) => ({ scale: { [sideId('opha', s)]: 0.4 } }) },
  { id: 'mma_from_opha', diagrams: ['willis'], sided: true, label: ['MMA z tętnicy ocznej', 'MMA from the ophthalmic artery'], text: ['tętnica oponowa środkowa odchodząca od tętnicy ocznej', 'middle meningeal artery arising from the ophthalmic artery'] },
  { id: 'infundibulum_pcom', diagrams: ['willis'], sided: true, label: ['Lejek (infundibulum) PComA', 'PComA infundibulum'], text: ['poszerzenie lejkowate ujścia PComA (infundibulum, < 3 mm)', 'infundibular dilatation of the PComA origin (< 3 mm)'] },

  // ---------------------------------------------------------------- arch / neck
  { id: 'bovine_arch', diagrams: ['neck_vessels', 'aorta'], label: ['Łuk typu „bovine” (LCCA z BCT)', 'Bovine arch (LCCA from the BCT)'], text: ['łuk aorty typu „bovine” — lewa tętnica szyjna wspólna odchodzi od pnia ramienno-głowowego', 'bovine-type arch — left CCA arising from the brachiocephalic trunk'],
    effect: () => ({ hide: ['cca_prox_l', 'lcca'], add: [
      { id: 'cca_bovine_l', diagram: 'neck_vessels', label: ['Lewa CCA (z BCT)', 'Left CCA (from BCT)'], side: 'left', kind: 'vessel', w: 8, z: [8, 0], d: 'M236 614 C300 600 380 548 385.3 460' },
      { id: 'lcca_bovine', diagram: 'aorta', label: ['Lewa CCA (z BCT)', 'Left CCA (from BCT)'], side: '', kind: 'vessel', w: 7, z: [10, 0], d: 'M280 98 Q302 66 320 30' }] }) },
  { id: 'common_carotid_trunk', diagrams: ['neck_vessels', 'aorta'], label: ['Wspólny pień tętnic szyjnych', 'Common carotid trunk'], text: ['wspólny pień obu tętnic szyjnych wspólnych', 'common origin of both common carotid arteries'] },
  { id: 'arsa', diagrams: ['neck_vessels', 'aorta'], label: ['Nieprawidłowa prawa podobojczykowa (a. lusoria)', 'Aberrant right subclavian artery (lusoria)'], text: ['nieprawidłowa prawa tętnica podobojczykowa (arteria lusoria) odchodząca jako ostatnia gałąź łuku, przebiegająca za przełykiem', 'aberrant right subclavian artery (arteria lusoria) arising as the last arch branch, retro-oesophageal'],
    effect: () => ({ hide: ['sca_prox_r'], add: [{ id: 'arsa', diagram: 'neck_vessels', label: ['Prawa podobojczykowa nieprawidłowa', 'Aberrant right subclavian'], side: 'right', kind: 'vessel', w: 9, z: [-30, -45, -20, -10], d: 'M425 700 C360 668 250 600 160 552 L67.5 548' }] }) },
  { id: 'left_va_arch', diagrams: ['neck_vessels', 'aorta'], label: ['Lewa kręgowa bezpośrednio z łuku', 'Left vertebral artery from the arch'], text: ['lewa tętnica kręgowa odchodzi bezpośrednio od łuku aorty', 'left vertebral artery arising directly from the aortic arch'],
    effect: () => ({ hide: ['va_ost_l'], add: [{ id: 'va_arch_l', diagram: 'neck_vessels', label: ['Lewa VA (z łuku)', 'Left VA (from the arch)'], side: 'left', kind: 'vessel', w: 5, z: [-15, -18], d: 'M362 642 Q438 580 448.8 524' }] }) },
  { id: 'right_arch', diagrams: ['neck_vessels', 'aorta'], label: ['Prawostronny łuk aorty', 'Right-sided aortic arch'], text: ['prawostronny łuk aorty', 'right-sided aortic arch'] },
  { id: 'high_bifurcation', diagrams: ['neck_vessels'], sided: true, label: ['Wysoki podział tętnicy szyjnej wspólnej', 'High carotid bifurcation'], text: ['wysoki podział tętnicy szyjnej wspólnej', 'high carotid bifurcation'] },
  { id: 'ica_kinking', diagrams: ['neck_vessels'], sided: true, label: ['Kręty przebieg / pętla ICA (kinking, coiling)', 'ICA tortuosity / kinking / coiling'], text: ['kręty przebieg ICA (kinking / coiling)', 'tortuous ICA (kinking / coiling)'] },
  { id: 'va_entry', diagrams: ['neck_vessels'], sided: true, label: ['Nietypowe wejście VA do otworu wyrostka (nie C6)', 'Atypical vertebral entry (not C6)'], text: ['tętnica kręgowa wchodzi do otworu wyrostka poprzecznego na nietypowym poziomie', 'vertebral artery enters the foramen transversarium at an atypical level'] },
  { id: 'apa_neuromeningeal', diagrams: ['neck_vessels'], sided: true, label: ['Istotne zespolenia ECA–ICA / ECA–VA', 'Dangerous ECA–ICA / ECA–VA anastomoses'], text: ['istotne anastomozy ECA–ICA / ECA–VA (niebezpieczne przy embolizacji)', 'significant ECA–ICA / ECA–VA anastomoses (dangerous for embolization)'] },

  // ---------------------------------------------------------------- aorta / visceral / renal
  { id: 'replaced_rha', diagrams: ['visceral'], label: ['Zastąpiona RHA z SMA (replaced RHA)', 'Replaced RHA from the SMA'], text: ['zastąpiona prawa tętnica wątrobowa odchodząca od SMA', 'replaced right hepatic artery arising from the SMA'],
    effect: () => ({ hide: ['right_hepatic'], add: [{ id: 'rha_replaced', label: ['RHA zastąpiona (z SMA)', 'Replaced RHA (from SMA)'], side: '', kind: 'vessel', w: 4, z: [40, 25, 30], d: 'M330 182 C298 170 210 118 170 64' }] }) },
  { id: 'accessory_rha', diagrams: ['visceral'], label: ['Dodatkowa RHA z SMA', 'Accessory RHA from the SMA'], text: ['dodatkowa prawa tętnica wątrobowa odchodząca od SMA', 'accessory right hepatic artery arising from the SMA'],
    effect: () => ({ add: [{ id: 'rha_accessory', label: ['Dodatkowa RHA (z SMA)', 'Accessory RHA (from SMA)'], side: '', kind: 'vessel', w: 3, z: [40, 25, 28], d: 'M330 182 C298 172 214 124 178 92' }] }) },
  { id: 'replaced_lha', diagrams: ['visceral'], label: ['Zastąpiona LHA z LGA (replaced LHA)', 'Replaced LHA from the LGA'], text: ['zastąpiona lewa tętnica wątrobowa odchodząca od tętnicy żołądkowej lewej', 'replaced left hepatic artery arising from the left gastric artery'],
    effect: () => ({ hide: ['left_hepatic'], add: [{ id: 'lha_replaced', label: ['LHA zastąpiona (z LGA)', 'Replaced LHA (from LGA)'], side: '', kind: 'vessel', w: 4, z: 45, d: 'M342 70 Q300 38 246 40' }] }) },
  { id: 'accessory_lha', diagrams: ['visceral'], label: ['Dodatkowa LHA z LGA', 'Accessory LHA from the LGA'], text: ['dodatkowa lewa tętnica wątrobowa odchodząca od tętnicy żołądkowej lewej', 'accessory left hepatic artery arising from the left gastric artery'],
    effect: () => ({ add: [{ id: 'lha_accessory', label: ['Dodatkowa LHA (z LGA)', 'Accessory LHA (from LGA)'], side: '', kind: 'vessel', w: 3, z: 45, d: 'M342 70 Q300 46 252 50' }] }) },
  { id: 'cha_from_sma', diagrams: ['visceral'], label: ['CHA z SMA (zastąpiona CHA)', 'CHA from the SMA (replaced CHA)'], text: ['tętnica wątrobowa wspólna odchodzi od SMA', 'common hepatic artery arising from the SMA'],
    effect: () => ({ hide: ['common_hepatic'], add: [{ id: 'cha_from_sma', label: ['CHA (z SMA)', 'CHA (from SMA)'], side: '', kind: 'vessel', w: 6, z: [40, 35], d: 'M329 190 C300 150 262 112 240 108' }] }) },
  { id: 'coeliacomesenteric', diagrams: ['visceral', 'aorta'], label: ['Pień trzewno-krezkowy', 'Coeliacomesenteric trunk'], text: ['wspólny pień trzewno-krezkowy', 'common coeliacomesenteric trunk'] },
  { id: 'hepatomesenteric', diagrams: ['visceral'], label: ['Pień wątrobowo-krezkowy', 'Hepatomesenteric trunk'], text: ['pień wątrobowo-krezkowy (CHA i SMA wspólnym pniem)', 'hepatomesenteric trunk (CHA and SMA share a trunk)'] },
  { id: 'gda_variant', diagrams: ['visceral'], label: ['Trifurkacja PHA / nietypowe odejście GDA', 'PHA trifurcation / atypical GDA origin'], text: ['nietypowe odejście GDA (trifurkacja tętnicy wątrobowej)', 'atypical GDA origin (hepatic artery trifurcation)'] },
  { id: 'accessory_renal', diagrams: ['visceral', 'aorta'], sided: true, label: ['Dodatkowa tętnica nerkowa', 'Accessory renal artery'], text: ['dodatkowa tętnica nerkowa', 'accessory renal artery'],
    effect: (s) => ({ add: [
      { id: sideId('renal_acc', s), diagram: 'visceral', label: ['Dodatkowa tętnica nerkowa', 'Accessory renal artery'], side: sideOf(s), kind: 'vessel', w: 4, z: -10, d: s === 'left' ? 'M332 228 L425 238' : 'M318 234 L220 246' },
      { id: sideId('renal_acc_a', s), diagram: 'aorta', label: ['Dodatkowa tętnica nerkowa', 'Accessory renal artery'], side: sideOf(s), kind: 'vessel', w: 4, z: -10, d: s === 'left' ? 'M318 498 Q352 496 388 492' : 'M310 502 Q272 502 238 498' }] }) },
  { id: 'early_renal_branching', diagrams: ['visceral', 'aorta'], sided: true, label: ['Wczesny podział tętnicy nerkowej', 'Early renal artery branching'], text: ['wczesny podział tętnicy nerkowej (< 1,5 cm od ujścia)', 'early renal artery branching (< 1.5 cm from the ostium)'] },
  { id: 'meandering_mesenteric', diagrams: ['visceral'], label: ['Łuk Riolana / meandrująca tętnica krezkowa', 'Arc of Riolan / meandering mesenteric artery'], text: ['poszerzony łuk Riolana (meandrująca tętnica krezkowa)', 'enlarged arc of Riolan (meandering mesenteric artery)'] },
  { id: 'arc_buhler', diagrams: ['visceral'], label: ['Łuk Bühlera', 'Arc of Bühler'], text: ['łuk Bühlera (połączenie pnia trzewnego z SMA)', 'arc of Bühler (coeliac–SMA connection)'] },
  { id: 'phrenic_from_coeliac', diagrams: ['visceral', 'aorta'], label: ['Tętnice przeponowe dolne z pnia trzewnego', 'Inferior phrenic arteries from the coeliac trunk'], text: ['tętnice przeponowe dolne odchodzą od pnia trzewnego', 'inferior phrenic arteries arising from the coeliac trunk'] },
  { id: 'extrahepatic_hcc_supply', diagrams: ['visceral'], label: ['Pozawątrobowe unaczynienie guza (np. IPA)', 'Extrahepatic tumour supply (e.g. IPA)'], text: ['pozawątrobowe unaczynienie guza (np. z tętnicy przeponowej dolnej)', 'extrahepatic tumour supply (e.g. from the inferior phrenic artery)'] },

  // ---------------------------------------------------------------- veins
  { id: 'retroaortic_lrv', diagrams: ['veins'], label: ['Zaaortalna lewa żyła nerkowa', 'Retro-aortic left renal vein'], text: ['zaaortalna lewa żyła nerkowa', 'retro-aortic left renal vein'] },
  { id: 'circumaortic_lrv', diagrams: ['veins'], label: ['Okołoaortalny pierścień żylny (circumaortic LRV)', 'Circumaortic left renal vein'], text: ['okołoaortalna lewa żyła nerkowa (pierścień żylny)', 'circumaortic left renal vein'] },
  { id: 'left_ivc', diagrams: ['veins'], label: ['Lewostronna IVC', 'Left-sided IVC'], text: ['lewostronna żyła główna dolna', 'left-sided inferior vena cava'] },
  { id: 'duplicated_ivc', diagrams: ['veins'], label: ['Zdwojona IVC', 'Duplicated IVC'], text: ['zdwojona żyła główna dolna', 'duplicated inferior vena cava'] },
  { id: 'azygos_continuation', diagrams: ['veins'], label: ['Ciągłość IVC przez żyłę nieparzystą', 'Azygos continuation of the IVC'], text: ['ciągłość żyły głównej dolnej przez żyłę nieparzystą (brak odcinka wątrobowego IVC)', 'azygos continuation of the IVC (absent hepatic segment)'] },
  { id: 'left_svc', diagrams: ['veins', 'chest_vessels'], label: ['Przetrwała lewa SVC', 'Persistent left SVC'], text: ['przetrwała lewa żyła główna górna (spływ do zatoki wieńcowej)', 'persistent left superior vena cava (draining into the coronary sinus)'] },
  { id: 'may_thurner', diagrams: ['veins', 'pelvis_legs'], label: ['Ucisk lewej żyły biodrowej (May-Thurner)', 'Left iliac vein compression (May-Thurner)'], text: ['ucisk lewej żyły biodrowej wspólnej przez prawą tętnicę biodrową wspólną (May-Thurner)', 'compression of the left common iliac vein by the right CIA (May-Thurner)'] },
  { id: 'nutcracker', diagrams: ['veins'], label: ['Ucisk lewej żyły nerkowej (nutcracker)', 'Nutcracker (LRV compression)'], text: ['ucisk lewej żyły nerkowej między aortą a SMA (nutcracker)', 'left renal vein compression between the aorta and the SMA (nutcracker)'] },
  { id: 'portal_trifurcation', diagrams: ['veins', 'liver_biliary'], label: ['Trifurkacja żyły wrotnej', 'Portal vein trifurcation'], text: ['trifurkacja żyły wrotnej', 'portal vein trifurcation'] },
  { id: 'accessory_hepatic_vein', diagrams: ['veins'], label: ['Dodatkowa prawa dolna żyła wątrobowa', 'Accessory inferior right hepatic vein'], text: ['dodatkowa prawa dolna żyła wątrobowa', 'accessory inferior right hepatic vein'] },
  { id: 'transverse_sinus_hypoplasia', diagrams: ['venous_sinuses'], sided: true, label: ['Hipoplazja zatoki poprzecznej', 'Hypoplastic transverse sinus'], text: ['hipoplazja zatoki poprzecznej', 'hypoplastic transverse sinus'], effect: (s) => ({ scale: { [sideId('transverse_sinus', s)]: 0.45, [sideId('ts', s)]: 0.45 } }) },
  { id: 'dominant_transverse', diagrams: ['venous_sinuses'], sided: true, label: ['Dominująca zatoka poprzeczna', 'Dominant transverse sinus'], text: ['dominująca zatoka poprzeczna', 'dominant transverse sinus'] },
  { id: 'arachnoid_granulation', diagrams: ['venous_sinuses'], sided: true, label: ['Ziarnistość pajęczynówki w zatoce', 'Arachnoid granulation in a sinus'], text: ['ziarnistość pajęczynówki w świetle zatoki', 'arachnoid granulation within the sinus'] },

  // ---------------------------------------------------------------- pelvis / lower limb
  { id: 'high_popliteal_bif', diagrams: ['pelvis_legs'], sided: true, label: ['Wysoki podział tętnicy podkolanowej', 'High popliteal bifurcation'], text: ['wysoki podział tętnicy podkolanowej', 'high popliteal artery bifurcation'] },
  { id: 'popliteal_trifurcation', diagrams: ['pelvis_legs'], sided: true, label: ['Trifurkacja tętnicy podkolanowej (brak TPT)', 'Popliteal trifurcation (no TPT)'], text: ['trifurkacja tętnicy podkolanowej (brak pnia piszczelowo-strzałkowego)', 'popliteal trifurcation (absent tibioperoneal trunk)'], effect: (s) => ({ scale: { [sideId('tpt', s)]: 0.6 } }) },
  { id: 'peroneal_magna', diagrams: ['pelvis_legs'], sided: true, label: ['Tętnica strzałkowa wielka (peronea magna)', 'Peronea magna'], text: ['tętnica strzałkowa wielka zaopatrująca stopę (hipoplazja tętnic piszczelowych)', 'peronea magna supplying the foot (hypoplastic tibial arteries)'], effect: (s) => ({ scale: { [sideId('peroneal', s)]: 1.6, [sideId('pta_distal', s)]: 0.4, [sideId('ata_distal', s)]: 0.4 } }) },
  { id: 'persistent_sciatic', diagrams: ['pelvis_legs'], sided: true, label: ['Przetrwała tętnica kulszowa', 'Persistent sciatic artery'], text: ['przetrwała tętnica kulszowa', 'persistent sciatic artery'] },
  { id: 'corona_mortis', diagrams: ['pelvis_legs'], sided: true, label: ['Corona mortis (tętnica zasłonowa z EIA / nadbrzusznej)', 'Corona mortis (obturator from the EIA / epigastric)'], text: ['corona mortis — tętnica zasłonowa odchodząca od tętnicy nadbrzusznej dolnej / EIA', 'corona mortis — obturator artery arising from the inferior epigastric / EIA'] },
  { id: 'high_pfa', diagrams: ['pelvis_legs'], sided: true, label: ['Wysokie odejście tętnicy głębokiej uda', 'High origin of the profunda femoris'], text: ['wysokie odejście tętnicy głębokiej uda', 'high origin of the profunda femoris artery'] },
  { id: 'prostatic_origin', diagrams: ['pelvis_legs'], sided: true, label: ['Nietypowe odejście tętnicy sterczowej', 'Atypical prostatic artery origin'], text: ['nietypowe odejście tętnicy sterczowej (np. z tętnicy zasłonowej / sromowej wewnętrznej)', 'atypical prostatic artery origin (e.g. from the obturator / internal pudendal artery)'] },
  { id: 'ovarian_supply', diagrams: ['pelvis_legs', 'aorta'], sided: true, label: ['Istotne unaczynienie z tętnicy jajnikowej', 'Significant ovarian artery supply'], text: ['istotne unaczynienie z tętnicy jajnikowej', 'significant ovarian artery supply'] },

  // ---------------------------------------------------------------- upper limb
  { id: 'high_radial', diagrams: ['upper_limb'], sided: true, label: ['Wysokie odejście tętnicy promieniowej', 'High origin of the radial artery'], text: ['wysokie odejście tętnicy promieniowej (od tętnicy ramiennej / pachowej)', 'high origin of the radial artery (from the brachial / axillary artery)'] },
  { id: 'radial_loop', diagrams: ['upper_limb'], sided: true, label: ['Pętla tętnicy promieniowej', 'Radial artery loop'], text: ['pętla tętnicy promieniowej', 'radial artery loop'] },
  { id: 'incomplete_palmar_arch', diagrams: ['upper_limb'], sided: true, label: ['Niekompletny łuk dłoniowy', 'Incomplete palmar arch'], text: ['niekompletny łuk dłoniowy', 'incomplete palmar arch'], effect: (s) => ({ scale: { [sideId('palmar_arch', s)]: 0.4 } }) },
  { id: 'persistent_median', diagrams: ['upper_limb'], sided: true, label: ['Przetrwała tętnica pośrodkowa', 'Persistent median artery'], text: ['przetrwała tętnica pośrodkowa', 'persistent median artery'] },

  // ---------------------------------------------------------------- coronary
  { id: 'right_dominance', diagrams: ['coronary'], label: ['Dominacja prawa', 'Right dominance'], text: ['prawy typ unaczynienia serca', 'right-dominant coronary circulation'] },
  { id: 'left_dominance', diagrams: ['coronary'], label: ['Dominacja lewa', 'Left dominance'], text: ['lewy typ unaczynienia serca', 'left-dominant coronary circulation'] },
  { id: 'codominance', diagrams: ['coronary'], label: ['Kodominacja', 'Codominance'], text: ['zrównoważony typ unaczynienia (kodominacja)', 'codominant coronary circulation'] },
  { id: 'lcx_from_rca', diagrams: ['coronary'], label: ['LCx z prawej zatoki / RCA', 'LCx from the right sinus / RCA'], text: ['gałąź okalająca odchodzi od prawej zatoki wieńcowej / RCA', 'circumflex artery arising from the right coronary sinus / RCA'] },
  { id: 'separate_lad_lcx', diagrams: ['coronary'], label: ['Oddzielne ujścia LAD i LCx (brak LM)', 'Separate LAD and LCx ostia (absent LM)'], text: ['oddzielne ujścia LAD i LCx (brak pnia lewej tętnicy wieńcowej)', 'separate LAD and LCx ostia (absent left main)'] },
  { id: 'myocardial_bridge', diagrams: ['coronary'], label: ['Mostek mięśniowy', 'Myocardial bridge'], text: ['mostek mięśniowy', 'myocardial bridge'] },

  // ---------------------------------------------------------------- chest
  { id: 'bronchial_common_trunk', diagrams: ['chest_vessels'], label: ['Wspólny pień tętnic oskrzelowych', 'Common bronchial trunk'], text: ['wspólny pień tętnic oskrzelowych', 'common bronchial artery trunk'] },
  { id: 'bronchial_ectopic', diagrams: ['chest_vessels'], label: ['Ektopowe odejście tętnicy oskrzelowej', 'Ectopic bronchial artery origin'], text: ['ektopowe odejście tętnicy oskrzelowej (np. z łuku aorty / podobojczykowej)', 'ectopic bronchial artery origin (e.g. from the arch / subclavian)'] },
  { id: 'spinal_from_bronchial', diagrams: ['chest_vessels', 'spinal'], label: ['Gałąź rdzeniowa z tętnicy oskrzelowej / międzyżebrowej', 'Spinal branch from a bronchial / intercostal artery'], text: ['gałąź rdzeniowa odchodząca od leczonej tętnicy oskrzelowej / międzyżebrowej', 'spinal branch arising from the bronchial / intercostal artery'] },
  { id: 'azygos_lobe', diagrams: ['chest_organs'], label: ['Płat żyły nieparzystej', 'Azygos lobe'], text: ['płat żyły nieparzystej', 'azygos lobe'] },
  { id: 'adamkiewicz_level', diagrams: ['spinal', 'aorta'], sided: true, label: ['Tętnica Adamkiewicza – poziom', 'Artery of Adamkiewicz – level'], text: ['tętnica Adamkiewicza na poziomie …', 'artery of Adamkiewicz at level …'] },

  // ---------------------------------------------------------------- biliary / urinary / other
  { id: 'rpd_to_lhd', diagrams: ['liver_biliary'], label: ['Prawy tylny przewód uchodzi do LHD', 'Right posterior duct draining into the LHD'], text: ['prawy tylny przewód wątrobowy uchodzi do lewego przewodu wątrobowego', 'right posterior hepatic duct draining into the left hepatic duct'] },
  { id: 'duct_trifurcation', diagrams: ['liver_biliary'], label: ['Trifurkacja przewodów wątrobowych', 'Hepatic duct trifurcation'], text: ['trifurkacja przewodów wątrobowych', 'hepatic duct trifurcation'] },
  { id: 'low_cystic', diagrams: ['liver_biliary'], label: ['Niskie / przyśrodkowe ujście przewodu pęcherzykowego', 'Low / medial cystic duct insertion'], text: ['niskie, przyśrodkowe ujście przewodu pęcherzykowego', 'low, medial cystic duct insertion'] },
  { id: 'aberrant_duct', diagrams: ['liver_biliary'], label: ['Przewód Luschki / aberrantny przewód', 'Duct of Luschka / aberrant duct'], text: ['aberrantny przewód żółciowy (przewód Luschki)', 'aberrant bile duct (duct of Luschka)'] },
  { id: 'duplex_kidney', diagrams: ['urinary'], sided: true, label: ['Nerka zdwojona / zdwojony moczowód', 'Duplex kidney / ureter'], text: ['nerka zdwojona (zdwojony układ kielichowo-miedniczkowy / moczowód)', 'duplex kidney (duplicated collecting system / ureter)'] },
  { id: 'horseshoe', diagrams: ['urinary', 'abdomen_organs'], label: ['Nerka podkowiasta', 'Horseshoe kidney'], text: ['nerka podkowiasta', 'horseshoe kidney'] },
  { id: 'pelvic_kidney', diagrams: ['urinary'], sided: true, label: ['Nerka miedniczna (ektopia)', 'Pelvic (ectopic) kidney'], text: ['nerka miedniczna (ektopowa)', 'pelvic (ectopic) kidney'] },
  { id: 'retrocaval_ureter', diagrams: ['urinary'], label: ['Moczowód zażylny', 'Retrocaval ureter'], text: ['moczowód zażylny', 'retrocaval ureter'] },
  { id: 'extrarenal_pelvis', diagrams: ['urinary'], sided: true, label: ['Miedniczka pozanerkowa', 'Extrarenal pelvis'], text: ['miedniczka pozanerkowa', 'extrarenal pelvis'] },
  { id: 'transitional_vertebra', diagrams: ['spine_msk', 'spinal'], label: ['Kręg przejściowy (L5/S1)', 'Lumbosacral transitional vertebra'], text: ['kręg przejściowy lędźwiowo-krzyżowy (numeracja kręgów — sprawdzić)', 'lumbosacral transitional vertebra (check vertebral numbering)'] },
  { id: 'interposed_colon', diagrams: ['abdomen_organs'], label: ['Interpozycja okrężnicy (Chilaiditi / przed nerką)', 'Interposed colon (Chilaiditi / anterior to the kidney)'], text: ['interpozycja okrężnicy na torze dostępu', 'colon interposed in the access route'] },
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
      for (const p of e.add || []) if (!p.diagram || p.diagram === diagram.id) add.push({ ...p, variant: v.id });
    }
  }
  if (!hide.size && !add.length && !Object.keys(scale).length) return diagram;
  const parts = diagram.parts.filter((p) => !hide.has(p.id)).map((p) => (scale[p.id] && p.kind === 'vessel' ? { ...p, w: Math.max(1, (p.w || 5) * scale[p.id]) } : p));
  for (const p of add) if (!parts.some((x) => x.id === p.id)) parts.push(p);
  return { ...diagram, parts };
}

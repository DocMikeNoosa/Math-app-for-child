// Clinical lesion definitions, scales and calculators for neurointerventional and vascular procedures.
// Each finding has typed fields (num / text / select / bool) grouped as 'pre' (before treatment) or 'post'
// (result), plus computed values (NASCET / WASID %, dome-to-neck ratio, Spetzler-Martin grade…).
// Labels: [Polish, English]. Abbreviations stay universal (NASCET, eTICI, TASC…).

const o = (v, pl, en = pl) => [v, pl, en];
export const ETICI = [o('0', '0'), o('1', '1'), o('2a', '2a'), o('2b50', '2b50'), o('2b67', '2b67'), o('2c', '2c'), o('3', '3')];
const RROC = [o('1', 'klasa 1 – całkowite wyłączenie', 'class 1 – complete occlusion'), o('2', 'klasa 2 – resztkowa szyja', 'class 2 – residual neck'), o('3a', 'klasa 3a – kontrast między pętlami', 'class 3a – contrast within the coil interstices'), o('3b', 'klasa 3b – kontrast wzdłuż ściany worka', 'class 3b – contrast along the aneurysm wall')];
const OKM = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D'].map((v) => o(v, `OKM ${v}`));
const WOS = [o('A', 'WOS A – całkowite wyłączenie', 'WOS A – complete occlusion'), o('B', 'WOS B – kontrast w zagłębieniu', 'WOS B – opacification of the recess'), o('C', 'WOS C – resztkowa szyja', 'WOS C – residual neck'), o('D', 'WOS D – resztkowy tętniak', 'WOS D – residual aneurysm')];
const COGNARD = ['I', 'IIa', 'IIb', 'IIa+b', 'III', 'IV', 'V'].map((v) => o(v, `Cognard ${v}`));
const BORDEN = ['I', 'II', 'III'].map((v) => o(v, `Borden ${v}`));
const TASC = ['A', 'B', 'C', 'D'].map((v) => o(v, `TASC II ${v}`));
const PACSS = [o('0', 'brak zwapnień', 'no calcification'), o('1', 'PACSS 1 – punktowe', 'PACSS 1 – focal'), o('2', 'PACSS 2 – jednostronne < 5 cm', 'PACSS 2 – unilateral < 5 cm'), o('3', 'PACSS 3 – obwodowe < 5 cm', 'PACSS 3 – bilateral < 5 cm'), o('4', 'PACSS 4 – obwodowe ≥ 5 cm', 'PACSS 4 – bilateral ≥ 5 cm')];
const METHOD = [o('nascet', 'NASCET', 'NASCET'), o('wasid', 'WASID', 'WASID'), o('diam', 'średnica', 'diameter')];
const PROJ = [o('sup', 'ku górze', 'superior'), o('inf', 'ku dołowi', 'inferior'), o('ant', 'do przodu', 'anterior'), o('post', 'do tyłu', 'posterior'), o('med', 'przyśrodkowo', 'medial'), o('lat', 'bocznie', 'lateral')];
const MORPH = [o('saccular', 'workowaty', 'saccular'), o('fusiform', 'wrzecionowaty', 'fusiform'), o('blister', 'typu blister', 'blister'), o('dissecting', 'rozwarstwiający', 'dissecting'), o('mycotic', 'grzybiczy', 'mycotic')];
const TECH = [o('sr', 'stent-retriever', 'stent retriever'), o('asp', 'aspiracja (ADAPT)', 'aspiration (ADAPT)'), o('combined', 'technika łączona', 'combined technique'), o('ia_lysis', 'tromboliza dotętnicza', 'intra-arterial thrombolysis')];
const SEV = [o('mild', 'łagodny (< 25%)', 'mild (< 25%)'), o('moderate', 'umiarkowany (25–50%)', 'moderate (25–50%)'), o('severe', 'ciężki (> 50%)', 'severe (> 50%)')];
const SIZE_SM = [o('1', '< 3 cm (1 pkt)', '< 3 cm (1 pt)'), o('2', '3–6 cm (2 pkt)', '3–6 cm (2 pts)'), o('3', '> 6 cm (3 pkt)', '> 6 cm (3 pts)')];

const F = (key, pl, en, type = 'num', extra = {}) => ({ key, label: [pl, en], type, ...extra });
const num = (v) => { const m = String(v ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : null; };
/** Lower-case the first letter of an ordinary word, keep abbreviations (eTICI, NASCET, Raymond-Roy). */
export const lcFirst = (t) => (/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]/.test(t) && !/^(Raymond|Spetzler|Cognard|Borden|Rutherford|Hunt|Fisher|WIfI)/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
const fmt = (x, lang) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toString().replace('.', lang === 'en' ? '.' : ',') : '');

export const LESIONS = {
  vessel: [
    { id: 'stenosis', label: ['Zwężenie', 'Stenosis'], fields: [
      F('pre', 'Zwężenie (%)', 'Stenosis (%)', 'num', { group: 'pre', unit: '%' }),
      F('method', 'Metoda pomiaru', 'Measurement', 'select', { group: 'pre', options: METHOD }),
      F('mld', 'Najmniejsza średnica światła (mm)', 'Minimal lumen diameter (mm)', 'num', { group: 'pre', unit: 'mm', calc: true }),
      F('ref', 'Średnica odniesienia (mm)', 'Reference diameter (mm)', 'num', { group: 'pre', unit: 'mm', calc: true }),
      F('length', 'Długość zmiany (mm)', 'Lesion length (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('calc', 'Zwapnienia', 'Calcification', 'select', { group: 'pre', options: PACSS }),
      F('tasc', 'TASC II', 'TASC II', 'select', { group: 'pre', options: TASC, vascularOnly: true }),
      F('plaque', 'Blaszka', 'Plaque', 'select', { group: 'pre', options: [o('soft', 'miękka', 'soft'), o('calcified', 'zwapniała', 'calcified'), o('ulcerated', 'owrzodziała', 'ulcerated'), o('mixed', 'mieszana', 'mixed')] }),
      F('symptomatic', 'Objawowe', 'Symptomatic', 'bool', { group: 'pre' }),
      F('post', 'Zwężenie resztkowe (%)', 'Residual stenosis (%)', 'num', { group: 'post', unit: '%' }),
    ], compute(l, lang) {
      const a = num(l.mld); const b = num(l.ref);
      if (a !== null && b) {
        const pct = Math.max(0, Math.min(100, (1 - a / b) * 100));
        const m = l.method === 'wasid' ? 'WASID' : l.method === 'diam' ? (lang === 'en' ? 'diameter' : 'średnica') : 'NASCET';
        return [[`${lang === 'en' ? 'calculated stenosis' : 'wyliczone zwężenie'} (${m})`, `${fmt(pct, lang)}%`, { pre: Math.round(pct) }]];
      }
      return [];
    } },
    { id: 'occlusion', label: ['Niedrożność', 'Occlusion'], fields: [
      F('length', 'Długość niedrożności (mm)', 'Occlusion length (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('chronic', 'Przewlekła (CTO)', 'Chronic (CTO)', 'bool', { group: 'pre' }),
      F('calc', 'Zwapnienia', 'Calcification', 'select', { group: 'pre', options: PACSS }),
      F('tasc', 'TASC II', 'TASC II', 'select', { group: 'pre', options: TASC, vascularOnly: true }),
      F('crossing', 'Przejście zmiany', 'Crossing', 'select', { group: 'pre', options: [o('intraluminal', 'wewnątrzświatłowo', 'intraluminal'), o('subintimal', 'podintymalnie', 'subintimal'), o('retrograde', 'dostęp wsteczny', 'retrograde access'), o('failed', 'nieskuteczne', 'failed')] }),
      F('post', 'Zwężenie resztkowe (%)', 'Residual stenosis (%)', 'num', { group: 'post', unit: '%' }),
    ] },
    { id: 'thrombus', label: ['Zakrzep / zator (udar)', 'Thrombus / embolus (stroke)'], fields: [
      F('pre', 'eTICI przed', 'eTICI before', 'select', { group: 'pre', options: ETICI }),
      F('tech', 'Technika', 'Technique', 'select', { group: 'pre', options: TECH }),
      F('bgc', 'Cewnik z balonem (BGC)', 'Balloon guide catheter', 'bool', { group: 'pre' }),
      F('passes', 'Liczba przejść', 'Number of passes', 'num', { group: 'pre' }),
      F('length', 'Długość skrzepliny (mm)', 'Clot length (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('post', 'eTICI po', 'eTICI final', 'select', { group: 'post', options: ETICI }),
      F('emboli', 'Zatory dystalne / nowe terytorium', 'Distal emboli / new territory', 'bool', { group: 'post' }),
    ], compute(l, lang) {
      const out = [];
      if (num(l.passes) === 1 && ['2c', '3'].includes(l.post)) out.push([lang === 'en' ? 'first-pass effect' : 'efekt pierwszego przejścia (FPE)', lang === 'en' ? 'yes' : 'tak']);
      return out;
    } },
    { id: 'aneurysm', label: ['Tętniak', 'Aneurysm'], fields: [
      F('size', 'Wymiary worka (mm, np. 7 × 5)', 'Sac size (mm, e.g. 7 × 5)', 'text', { group: 'pre', unit: 'mm' }),
      F('extra', 'Szyja (mm)', 'Neck (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('morph', 'Morfologia', 'Morphology', 'select', { group: 'pre', options: MORPH }),
      F('ruptured', 'Pęknięty', 'Ruptured', 'bool', { group: 'pre' }),
      F('daughter', 'Uchyłek / płatek (daughter sac)', 'Daughter sac / bleb', 'bool', { group: 'pre' }),
      F('dir', 'Kierunek kopuły', 'Dome projection', 'select', { group: 'pre', options: PROJ }),
      F('post', 'Raymond-Roy', 'Raymond-Roy', 'select', { group: 'post', options: RROC }),
      F('okm', 'OKM (po FD)', 'OKM (after FD)', 'select', { group: 'post', options: OKM }),
      F('wos', 'WOS (po WEB)', 'WOS (after WEB)', 'select', { group: 'post', options: WOS }),
      F('packing', 'Gęstość upakowania (%)', 'Packing density (%)', 'num', { group: 'post', unit: '%' }),
    ], compute(l, lang) {
      const d = (String(l.size || '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g) || []).map(Number);
      const neck = num(l.extra);
      const out = [];
      if (d.length && neck) {
        const dome = Math.max(...d);
        out.push([lang === 'en' ? 'dome-to-neck ratio' : 'stosunek kopuła/szyja', fmt(dome / neck, lang)]);
        if (dome / neck < 1.5 || neck >= 4) out.push([lang === 'en' ? 'neck' : 'szyja', lang === 'en' ? 'wide' : 'szeroka']);
      }
      return out;
    } },
    { id: 'pseudoaneurysm', label: ['Tętniak rzekomy', 'Pseudoaneurysm'], fields: [
      F('size', 'Wymiary (mm)', 'Size (mm)', 'text', { group: 'pre', unit: 'mm' }),
      F('extra', 'Szyja (mm)', 'Neck (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('post', 'Wynik', 'Result', 'text', { group: 'post' }),
    ] },
    { id: 'bleeding', label: ['Krwawienie / wynaczynienie', 'Bleeding / extravasation'], fields: [
      F('pre', 'Obraz przed', 'Before', 'select', { group: 'pre', options: [o('active', 'aktywne wynaczynienie', 'active extravasation'), o('pseudo', 'tętniak rzekomy', 'pseudoaneurysm'), o('cutoff', 'amputacja naczynia', 'vessel cut-off'), o('none', 'bez wynaczynienia (empirycznie)', 'no extravasation (empirical)')] }),
      F('post', 'Po leczeniu', 'After treatment', 'select', { group: 'post', options: [o('stopped', 'bez wynaczynienia', 'no extravasation'), o('residual', 'resztkowe wynaczynienie', 'residual extravasation')] }),
    ] },
    { id: 'dissection', label: ['Rozwarstwienie', 'Dissection'], fields: [
      F('length', 'Długość (mm)', 'Length (mm)', 'num', { group: 'pre', unit: 'mm' }),
      F('flowlimiting', 'Ograniczające przepływ', 'Flow-limiting', 'bool', { group: 'pre' }),
      F('post', 'Wynik', 'Result', 'text', { group: 'post' }),
    ] },
    { id: 'avm', label: ['AVM', 'AVM'], fields: [
      F('sm_size', 'Wielkość nidusa', 'Nidus size', 'select', { group: 'pre', options: SIZE_SM }),
      F('sm_eloquent', 'Okolica elokwentna', 'Eloquent location', 'bool', { group: 'pre' }),
      F('sm_deep', 'Głęboki drenaż żylny', 'Deep venous drainage', 'bool', { group: 'pre' }),
      F('feeders', 'Naczynia doprowadzające', 'Feeders', 'text', { group: 'pre' }),
      F('assoc', 'Tętniak na naczyniu doprowadzającym / w nidusie', 'Flow-related / intranidal aneurysm', 'bool', { group: 'pre' }),
      F('post', 'Wyłączenie nidusa (%)', 'Nidus occlusion (%)', 'num', { group: 'post', unit: '%' }),
    ], compute(l, lang) {
      const s = num(l.sm_size);
      if (!s) return [];
      const g = s + (l.sm_eloquent ? 1 : 0) + (l.sm_deep ? 1 : 0);
      return [['Spetzler-Martin', `${lang === 'en' ? 'grade' : 'stopień'} ${g}`]];
    } },
    { id: 'davf', label: ['Przetoka oponowa (dAVF) / CCF', 'Dural AV fistula / CCF'], fields: [
      F('cognard', 'Cognard', 'Cognard', 'select', { group: 'pre', options: COGNARD }),
      F('borden', 'Borden', 'Borden', 'select', { group: 'pre', options: BORDEN }),
      F('feeders', 'Naczynia doprowadzające', 'Feeders', 'text', { group: 'pre' }),
      F('cvr', 'Korowy refluks żylny', 'Cortical venous reflux', 'bool', { group: 'pre' }),
      F('post', 'Wynik', 'Result', 'select', { group: 'post', options: [o('complete', 'całkowite wyłączenie', 'complete occlusion'), o('partial', 'częściowe wyłączenie', 'partial occlusion'), o('reflux_gone', 'zniesiony refluks korowy', 'cortical reflux eliminated')] }),
    ] },
    { id: 'spasm', label: ['Skurcz naczyniowy', 'Vasospasm'], fields: [
      F('pre', 'Nasilenie', 'Severity', 'select', { group: 'pre', options: SEV }),
      F('drug', 'Lek i dawka', 'Drug and dose', 'text', { group: 'pre' }),
      F('post', 'Po leczeniu', 'After treatment', 'select', { group: 'post', options: [o('resolved', 'ustąpienie', 'resolved'), o('improved', 'poprawa', 'improved'), o('unchanged', 'bez zmian', 'unchanged')] }),
    ] },
    { id: 'tumour', label: ['Unaczynienie guza', 'Tumour blush'], fields: [
      F('size', 'Wymiary (mm)', 'Size (mm)', 'text', { group: 'pre', unit: 'mm' }),
      F('feeders', 'Naczynia doprowadzające', 'Feeders', 'text', { group: 'pre' }),
      F('post', 'Dewaskularyzacja (%)', 'Devascularisation (%)', 'num', { group: 'post', unit: '%' }),
    ] },
    { id: 'other', label: ['Inne', 'Other'], fields: [F('post', 'Wynik', 'Result', 'text', { group: 'post' })] },
    { id: 'normal', label: ['Bez zmian (prawidłowe)', 'Normal'], fields: [] },
  ],
  organ: [
    { id: 'collection', label: ['Zbiornik / ropień', 'Collection / abscess'], fields: [F('size', 'Wymiary (mm)', 'Size (mm)', 'text', { group: 'pre', unit: 'mm' }), F('extra', 'Odessano (ml) / charakter', 'Aspirated (ml) / character', 'text', { group: 'post' })] },
    { id: 'mass', label: ['Zmiana ogniskowa / guz', 'Focal lesion / mass'], fields: [F('size', 'Wymiary (mm)', 'Size (mm)', 'text', { group: 'pre', unit: 'mm' }), F('extra', 'Liczba bioptatów / margines ablacji', 'Cores / ablation margin', 'text', { group: 'post' })] },
    { id: 'obstruction', label: ['Poszerzenie / niedrożność', 'Dilatation / obstruction'], fields: [F('extra', 'Poziom / przyczyna', 'Level / cause', 'text', { group: 'pre' })] },
    { id: 'fluid', label: ['Płyn (wysięk, wodobrzusze)', 'Fluid (effusion, ascites)'], fields: [F('extra', 'Ewakuowano (ml) / charakter', 'Drained (ml) / character', 'text', { group: 'post' })] },
    { id: 'fracture', label: ['Złamanie / zmiana kostna', 'Fracture / bone lesion'], fields: [F('pre', 'Utrata wysokości (%)', 'Height loss (%)', 'num', { group: 'pre', unit: '%' }), F('extra', 'Cement (ml)', 'Cement (ml)', 'num', { group: 'post', unit: 'ml' })] },
    { id: 'pain', label: ['Ból / zmiana zwyrodnieniowa', 'Pain / degenerative change'], fields: [F('extra', 'Lek i dawka', 'Drug and dose', 'text', { group: 'post' })] },
    { id: 'other', label: ['Inne', 'Other'], fields: [F('post', 'Wynik', 'Result', 'text', { group: 'post' })] },
  ],
};

export const lesionDef = (kind, id) => (LESIONS[kind === 'organ' ? 'organ' : 'vessel'].find((f) => f.id === id) || null);

/** Readable value of a field ("80%", "tak", "eTICI 2c", "Raymond-Roy klasa 1…"). */
export function fieldValue(f, v, lang = 'pl') {
  if (v === undefined || v === null || v === '' || v === false) return '';
  if (f.type === 'bool') return lang === 'en' ? 'yes' : 'tak';
  if (f.type === 'select') {
    const opt = f.options.find((x) => x[0] === String(v));
    const txt = opt ? opt[lang === 'en' ? 2 : 1] : String(v);
    return txt;
  }
  const s = String(v).trim().replace(lang === 'en' ? /(\d),(\d)/g : /(\d)\.(\d)/g, lang === 'en' ? '$1.$2' : '$1,$2').replace(/(\d)\s*[xX×]\s*(?=\d)/g, '$1 × ');
  if (f.unit === '%' && !s.includes('%')) return `${s}%`;
  if (f.unit && f.unit !== '%' && !/[a-wyz]/i.test(s)) return `${s} ${f.unit}`;
  return s;
}

/** Field descriptions of a lesion for the report: { pre: ['zwężenie (%): 80%', …], post: […], computed: […] }. */
export function lesionFacts(l, lang = 'pl', { vascular = true } = {}) {
  const def = lesionDef(l.kind, l.finding);
  if (!def) return { pre: [], post: [], computed: [] };
  const en = lang === 'en';
  const put = (f) => {
    const v = fieldValue(f, l[f.key], lang);
    if (!v || f.calc) return null;
    const name = lcFirst(f.label[en ? 1 : 0].replace(/\s*\((?!BGC|FD|WEB|CTO|FPE)[^)]*\)\s*$/, ''));
    return f.type === 'bool' ? name : `${name}: ${v}`;
  };
  const fields = def.fields.filter((f) => vascular || !f.vascularOnly);
  const computed = (def.compute ? def.compute(l, lang) : []).map(([k, v]) => `${k}: ${v}`);
  return {
    pre: fields.filter((f) => f.group === 'pre').map(put).filter(Boolean),
    post: fields.filter((f) => f.group === 'post').map(put).filter(Boolean),
    computed,
  };
}

/** Values the calculators can fill in automatically (e.g. stenosis % from the diameters). */
export function lesionAuto(l) {
  const def = lesionDef(l.kind, l.finding);
  const out = {};
  for (const [, , set] of def?.compute ? def.compute(l, 'pl') : []) if (set) Object.assign(out, set);
  return out;
}

// ---------------------------------------------------------------- patient-level clinical data (card)
export const CLINICAL = {
  Neuro: [
    { title: ['Udar – dane do opisu', 'Stroke – data for the report'], fields: [
      F('nihss', 'NIHSS przy przyjęciu', 'NIHSS on admission', 'num'), F('aspects', 'ASPECTS', 'ASPECTS', 'num'),
      F('ivt', 'Tromboliza dożylna przed zabiegiem', 'IV thrombolysis before', 'bool'),
      F('onset', 'Początek objawów / ostatnio zdrowy (godz.)', 'Onset / last known well (time)', 'text'),
      F('puncture', 'Nakłucie (godz.)', 'Groin puncture (time)', 'text'), F('firstpass', 'Pierwsze przejście (godz.)', 'First pass (time)', 'text'),
      F('reperfusion', 'Reperfuzja / koniec (godz.)', 'Reperfusion / end (time)', 'text'),
    ] },
    { title: ['Tętniak / SAH', 'Aneurysm / SAH'], fields: [
      F('hunthess', 'Hunt-Hess', 'Hunt-Hess', 'select', { options: ['1', '2', '3', '4', '5'].map((v) => o(v, v)) }),
      F('wfns', 'WFNS', 'WFNS', 'select', { options: ['1', '2', '3', '4', '5'].map((v) => o(v, v)) }),
      F('fisher', 'mFisher', 'mFisher', 'select', { options: ['0', '1', '2', '3', '4'].map((v) => o(v, v)) }),
      F('dapt', 'Leczenie przeciwpłytkowe (lek, dawka, test)', 'Antiplatelet therapy (drug, dose, test)', 'text'),
    ] },
  ],
  Vascular: [
    { title: ['Choroba tętnic obwodowych', 'Peripheral arterial disease'], fields: [
      F('rutherford', 'Rutherford', 'Rutherford', 'select', { options: ['0', '1', '2', '3', '4', '5', '6'].map((v) => o(v, `Rutherford ${v}`)) }),
      F('abi_pre', 'ABI przed (P / L)', 'ABI before (R / L)', 'text'), F('abi_post', 'ABI po (P / L)', 'ABI after (R / L)', 'text'),
      F('runoff', 'Drożne tętnice goleni (0–3)', 'Patent tibial run-off (0–3)', 'num'),
      F('wifi', 'WIfI (W / I / fI)', 'WIfI (W / I / fI)', 'text'),
    ] },
    { title: ['Aorta / EVAR', 'Aorta / EVAR'], fields: [
      F('sac', 'Maks. średnica worka (mm)', 'Max sac diameter (mm)', 'num', { unit: 'mm' }),
      F('neck_d', 'Szyja – średnica (mm)', 'Neck diameter (mm)', 'num', { unit: 'mm' }),
      F('neck_l', 'Szyja – długość (mm)', 'Neck length (mm)', 'num', { unit: 'mm' }),
      F('neck_a', 'Szyja – kątowanie (°)', 'Neck angulation (°)', 'num', { unit: '°' }),
      F('iliac', 'Tętnice biodrowe – średnice (mm)', 'Iliac diameters (mm)', 'text'),
      F('endoleak', 'Przeciek (endoleak) w kontroli', 'Endoleak on completion', 'select', { options: [o('none', 'brak', 'none'), o('Ia', 'typ Ia'), o('Ib', 'typ Ib'), o('II', 'typ II'), o('III', 'typ III'), o('IV', 'typ IV')] }),
    ] },
    { title: ['Tętnice szyjne', 'Carotid'], fields: [
      F('symptomatic_c', 'Objawowe (TIA / udar w ciągu 6 mies.)', 'Symptomatic (TIA / stroke within 6 months)', 'bool'),
      F('epd', 'Ochrona przed zatorowością', 'Embolic protection', 'select', { options: [o('distal', 'filtr dystalny', 'distal filter'), o('proximal', 'ochrona proksymalna (odwrócenie przepływu)', 'proximal (flow reversal / arrest)'), o('none', 'bez ochrony', 'none')] }),
    ] },
  ],
};

/** Time difference "hh:mm" → minutes (for door / puncture-to-reperfusion). */
export function minutesBetween(a, b) {
  const p = (t) => { const m = String(t || '').match(/(\d{1,2})[:.](\d{2})/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const x = p(a); const y = p(b);
  if (x === null || y === null) return null;
  return (y - x + 1440) % 1440;
}

/** Card-level clinical lines for the report text. */
export function clinicalFacts(clin = {}, branch, lang = 'pl') {
  const en = lang === 'en';
  const out = [];
  for (const sec of CLINICAL[branch] || []) {
    const bits = sec.fields.map((f) => { const v = fieldValue(f, clin[f.key], lang); return v ? (f.type === 'bool' ? lcFirst(f.label[en ? 1 : 0]) : `${lcFirst(f.label[en ? 1 : 0].replace(/\s*\(.*?\)\s*$/, ''))}: ${v}`) : null; }).filter(Boolean);
    if (sec.fields.some((f) => f.key === 'puncture')) {
      const m = minutesBetween(clin.puncture, clin.reperfusion);
      if (m !== null) bits.push(`${en ? 'puncture-to-reperfusion' : 'czas od nakłucia do reperfuzji'}: ${m} min`);
      const fp = minutesBetween(clin.puncture, clin.firstpass);
      if (fp !== null) bits.push(`${en ? 'puncture-to-first-pass' : 'czas od nakłucia do pierwszego przejścia'}: ${fp} min`);
      const on = minutesBetween(clin.onset, clin.puncture);
      if (on !== null) bits.push(`${en ? 'onset-to-puncture' : 'czas od zachorowania do nakłucia'}: ${on} min`);
    }
    if (bits.length) out.push(`${sec.title[en ? 1 : 0]}: ${bits.join('; ')}.`);
  }
  return out;
}

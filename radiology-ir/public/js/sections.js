// IR template groups and sections. Labels: [Polish, English].

export const GROUPS = [
  { id: 'Vascular', label: ['Naczyniowe', 'Vascular'] },
  { id: 'NonVascular', label: ['Nienaczyniowe', 'Non-vascular'] },
  { id: 'Neuro', label: ['Neurointerwencja', 'Neurointervention'] },
];

// Sections inside each group, in menu order.
export const REGIONS = [
  // vascular
  { id: 'Aorta', group: 'Vascular', label: ['Aorta (EVAR / TEVAR)', 'Aorta (EVAR / TEVAR)'] },
  { id: 'Visceral / Renal', group: 'Vascular', label: ['Tętnice trzewne i nerkowe', 'Visceral and renal arteries'] },
  { id: 'Liver oncology', group: 'Vascular', label: ['Onkologia wątroby (TACE / TARE / PVE)', 'Liver oncology (TACE / TARE / PVE)'] },
  { id: 'Haemorrhage', group: 'Vascular', label: ['Krwotoki i urazy', 'Haemorrhage and trauma'] },
  { id: 'Chest vessels', group: 'Vascular', label: ['Naczynia klatki piersiowej', 'Chest vessels'] },
  { id: 'Pelvic vessels', group: 'Vascular', label: ['Naczynia miednicy (UAE / PAE)', 'Pelvic vessels (UAE / PAE)'] },
  { id: 'Peripheral arteries', group: 'Vascular', label: ['Tętnice obwodowe', 'Peripheral arteries'] },
  { id: 'Veins', group: 'Vascular', label: ['Żyły', 'Veins'] },
  { id: 'Portal / TIPS', group: 'Vascular', label: ['Układ wrotny / TIPS', 'Portal system / TIPS'] },
  { id: 'Dialysis access', group: 'Vascular', label: ['Dostęp dializacyjny', 'Dialysis access'] },
  { id: 'Venous access', group: 'Vascular', label: ['Dostęp żylny (port / PICC)', 'Venous access (port / PICC)'] },
  { id: 'Vascular other', group: 'Vascular', label: ['Inne naczyniowe', 'Other vascular'] },
  // non-vascular
  { id: 'Biliary', group: 'NonVascular', label: ['Drogi żółciowe', 'Biliary'] },
  { id: 'Urinary', group: 'NonVascular', label: ['Układ moczowy', 'Urinary tract'] },
  { id: 'Biopsy', group: 'NonVascular', label: ['Biopsje', 'Biopsies'] },
  { id: 'Drainage', group: 'NonVascular', label: ['Drenaże i nakłucia', 'Drainage and aspiration'] },
  { id: 'Ablation', group: 'NonVascular', label: ['Ablacje', 'Ablation'] },
  { id: 'GI', group: 'NonVascular', label: ['Przewód pokarmowy', 'Gastrointestinal'] },
  { id: 'Spine / MSK', group: 'NonVascular', label: ['Kręgosłup i układ ruchu', 'Spine and MSK'] },
  { id: 'Non-vascular other', group: 'NonVascular', label: ['Inne nienaczyniowe', 'Other non-vascular'] },
  // neuro
  { id: 'Neuro diagnostic', group: 'Neuro', label: ['Angiografia diagnostyczna', 'Diagnostic angiography'] },
  { id: 'Acute stroke', group: 'Neuro', label: ['Udar – trombektomia', 'Acute stroke – thrombectomy'] },
  { id: 'Aneurysm', group: 'Neuro', label: ['Tętniaki wewnątrzczaszkowe', 'Intracranial aneurysms'] },
  { id: 'Carotid / Vertebral', group: 'Neuro', also: ['Vascular'], label: ['Tętnice szyjne, kręgowe i wewnątrzczaszkowe', 'Carotid, vertebral and intracranial stenosis'] },
  { id: 'AVM / Fistula', group: 'Neuro', label: ['AVM i przetoki', 'AVM and fistulae'] },
  { id: 'Neuro tumour', group: 'Neuro', label: ['Embolizacja guzów', 'Tumour embolization'] },
  { id: 'Vasospasm', group: 'Neuro', label: ['Skurcz naczyń', 'Vasospasm'] },
  { id: 'Neuro venous', group: 'Neuro', label: ['Zatoki żylne', 'Venous sinuses'] },
  { id: 'Head & neck bleeding', group: 'Neuro', label: ['Krwawienia głowy i szyi', 'Head and neck bleeding'] },
  { id: 'Neuro other', group: 'Neuro', label: ['Inne (BOT, MMA, rdzeń)', 'Other (BTO, MMA, spinal)'] },
  { id: 'Other', group: '*', label: ['Inne', 'Other'] },
];

export const SNIPPET_GROUPS = [
  { id: 'Access snippets', label: ['Dostęp', 'Access'] },
  { id: 'Closure snippets', label: ['Zamknięcie / hemostaza', 'Closure / haemostasis'] },
  { id: 'Device snippets', label: ['Sprzęt i embolizaty', 'Devices and embolics'] },
  { id: 'Medication snippets', label: ['Leki', 'Medication'] },
  { id: 'Complication snippets', label: ['Powikłania', 'Complications'] },
  { id: 'Result snippets', label: ['Wynik / skale', 'Result / scales'] },
  { id: 'Neuro snippets', label: ['Neuro', 'Neuro'] },
  { id: 'General snippets', label: ['Ogólne', 'General'] },
];

export const GROUP_IDS = GROUPS.map((g) => g.id);
export const REGION_IDS = Object.fromEntries(GROUP_IDS.map((g) => [g, REGIONS.filter((r) => r.group === g || r.group === '*').map((r) => r.id)]));
export const SNIPPET_IDS = SNIPPET_GROUPS.map((s) => s.id);

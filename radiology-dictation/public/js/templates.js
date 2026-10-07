// Report templates. Shared by the browser (ES module) and the server.
// Each section has: id, label, normal (default "no abnormality" text) and
// keywords (lower-case stems) used by the local, non-AI routing engine.

export const TEMPLATES = [
  {
    id: 'ct-head',
    modality: 'TK',
    name: 'TK głowy',
    subtitle: 'bez kontrastu',
    title: 'TK głowy bez podania środka kontrastowego',
    technique:
      'Badanie wykonano w technice spiralnej, bez podania środka kontrastowego, z rekonstrukcjami wielopłaszczyznowymi.',
    sections: [
      {
        id: 'parenchyma',
        label: 'Miąższ mózgu',
        normal:
          'Nie uwidoczniono zmian ogniskowych w obrębie miąższu mózgu. Zróżnicowanie istoty szarej i białej zachowane.',
        keywords: ['płat', 'płacie', 'półkul', 'mózg', 'istot', 'ognisk', 'hipodens', 'hiperdens', 'niedokrwien', 'udar', 'zawał', 'leukoara', 'jąd', 'wzgórz', 'torebk', 'okołokomor', 'gliot', 'malacj'],
      },
      {
        id: 'bleed',
        label: 'Krwawienie',
        normal: 'Nie stwierdzono cech krwawienia śródczaszkowego.',
        keywords: ['krwaw', 'krwiak', 'krwotok', 'podtward', 'nadtward', 'podpajęczyn', 'krwi'],
      },
      {
        id: 'ventricles',
        label: 'Układ komorowy',
        normal: 'Układ komorowy nieposzerzony, symetryczny.',
        keywords: ['komor', 'wodogłow', 'róg', 'rogi', 'rogów'],
      },
      {
        id: 'midline',
        label: 'Linia środkowa',
        normal: 'Struktury linii środkowej nieprzemieszczone.',
        keywords: ['linii środkowej', 'linia środkowa', 'przemieszcz', 'przesunię', 'efekt masy', 'efektu masy'],
      },
      {
        id: 'csf',
        label: 'Przestrzenie płynowe',
        normal: 'Przestrzenie płynowe podpajęczynówkowe nieposzerzone. Zbiorniki podstawy drożne.',
        keywords: ['przestrze', 'bruzd', 'zbiornik', 'zanik', 'atrofi', 'szczelin'],
      },
      {
        id: 'posterior',
        label: 'Tylny dół czaszki',
        normal: 'Struktury tylnego dołu czaszki bez zmian ogniskowych.',
        keywords: ['móżdż', 'pień', 'pnia', 'tylnego dołu', 'tylny dół', 'most', 'rdzeń przedłuż'],
      },
      {
        id: 'bones',
        label: 'Kości czaszki',
        normal: 'Kości sklepienia i podstawy czaszki bez uchwytnych zmian pourazowych i ogniskowych.',
        keywords: ['kość', 'kości', 'kostn', 'złama', 'szczelin złama', 'sklepien', 'podstawy czaszki', 'osteoli', 'sklerot'],
      },
      {
        id: 'sinuses',
        label: 'Zatoki i wyrostki sutkowate',
        normal: 'Zatoki przynosowe i komórki powietrzne wyrostków sutkowatych prawidłowo upowietrznione.',
        keywords: ['zatok', 'zatoc', 'sutkowat', 'śluzówk', 'błon śluzow', 'upowietrz', 'polip', 'oczodo'],
      },
      { id: 'other', label: 'Inne', normal: '', keywords: [] },
    ],
    conclusion: 'Obraz TK głowy bez zmian ogniskowych i bez cech krwawienia śródczaszkowego.',
  },
  {
    id: 'ct-chest',
    modality: 'TK',
    name: 'TK klatki piersiowej',
    subtitle: 'z kontrastem',
    title: 'TK klatki piersiowej z podaniem środka kontrastowego',
    technique:
      'Badanie wykonano w technice spiralnej, po dożylnym podaniu jodowego środka kontrastowego, z rekonstrukcjami wielopłaszczyznowymi.',
    sections: [
      {
        id: 'lungs',
        label: 'Miąższ płucny',
        normal: 'Miąższ płucny bez zmian ogniskowych i naciekowych.',
        keywords: ['płuc', 'płat', 'płacie', 'segment', 'guzek', 'guzk', 'nacie', 'zagęszcz', 'mlecznej szyby', 'matowej szyby', 'rozedm', 'niedodm', 'włóknien', 'pęcherz', 'konsolidac'],
      },
      {
        id: 'airways',
        label: 'Tchawica i oskrzela',
        normal: 'Tchawica i oskrzela główne drożne.',
        keywords: ['tchawic', 'oskrzel', 'rozstrzen'],
      },
      {
        id: 'pleura',
        label: 'Opłucna',
        normal: 'Jamy opłucnowe bez płynu. Bez cech odmy opłucnowej.',
        keywords: ['opłuc', 'płyn w jam', 'odm', 'zrost'],
      },
      {
        id: 'mediastinum',
        label: 'Śródpiersie i węzły chłonne',
        normal: 'Śródpiersie nieposzerzone. Węzły chłonne śródpiersia i wnęk nie są powiększone.',
        keywords: ['śródpiers', 'węz', 'wnęk', 'grasic', 'przełyk'],
      },
      {
        id: 'heart',
        label: 'Serce i duże naczynia',
        normal: 'Serce nie jest powiększone. Bez płynu w worku osierdziowym. Aorta piersiowa o prawidłowej szerokości.',
        keywords: ['serc', 'osierd', 'aort', 'aorc', 'tętnic', 'zator', 'pień płucn', 'żył', 'naczyni', 'zwapnie'],
      },
      {
        id: 'upperabdomen',
        label: 'Nadbrzusze',
        normal: 'W uwidocznionym zakresie nadbrzusza bez istotnych zmian.',
        keywords: ['wątrob', 'nadnercz', 'śledzion', 'nerk', 'nerce', 'nadbrzusz', 'trzustk', 'pęcherzyk żółc'],
      },
      {
        id: 'bones',
        label: 'Kości i tkanki miękkie',
        normal: 'W uwidocznionych kościach bez zmian ogniskowych. Tkanki miękkie ściany klatki piersiowej bez zmian.',
        keywords: ['kość', 'kości', 'kostn', 'żebr', 'mostk', 'kręg', 'trzon', 'złama', 'osteoli', 'sklerot', 'tkank', 'pach', 'piers'],
      },
      { id: 'other', label: 'Inne', normal: '', keywords: [] },
    ],
    conclusion: 'Obraz TK klatki piersiowej bez istotnych zmian patologicznych.',
  },
  {
    id: 'mr-lspine',
    modality: 'MR',
    name: 'MR kręgosłupa L-S',
    subtitle: 'bez kontrastu',
    title: 'MR kręgosłupa lędźwiowo-krzyżowego',
    technique:
      'Badanie wykonano w sekwencjach T1-, T2-zależnych i STIR, w płaszczyznach strzałkowej i poprzecznej, bez podania środka kontrastowego.',
    sections: [
      {
        id: 'alignment',
        label: 'Ustawienie',
        normal: 'Lordoza lędźwiowa zachowana. Ustawienie trzonów kręgowych prawidłowe.',
        keywords: ['lordoz', 'kifoz', 'skolioz', 'ustawien', 'kręgozmyk', 'listez', 'oś', 'spłyc'],
      },
      {
        id: 'vertebrae',
        label: 'Trzony kręgowe',
        normal: 'Trzony kręgowe prawidłowej wysokości, o prawidłowym sygnale szpiku kostnego.',
        keywords: ['trzon', 'szpik', 'naczyniak', 'modic', 'osteofit', 'złama', 'obniże', 'kompresyj', 'blaszk graniczn'],
      },
      {
        id: 'discs',
        label: 'Krążki międzykręgowe',
        normal: 'Krążki międzykręgowe prawidłowej wysokości, bez cech przepuklin.',
        keywords: ['krąż', 'dysk', 'przepuklin', 'protruz', 'ekstruz', 'uwypukle', 'odwodni', 'pierście', 'sekwestr'],
      },
      {
        id: 'canal',
        label: 'Kanał kręgowy i otwory',
        normal: 'Kanał kręgowy o prawidłowej szerokości. Otwory międzykręgowe drożne.',
        keywords: ['kanał', 'kanal', 'otwor', 'otwo', 'stenoz', 'zwęże', 'korzeń', 'korzeni', 'worek opon', 'zachyłk'],
      },
      {
        id: 'conus',
        label: 'Stożek rdzeniowy',
        normal: 'Stożek rdzeniowy prawidłowo położony, o prawidłowym sygnale.',
        keywords: ['stoż', 'rdzeń', 'rdzeni', 'ogon koński', 'ogona końskiego'],
      },
      {
        id: 'facets',
        label: 'Stawy międzywyrostkowe',
        normal: 'Stawy międzywyrostkowe bez istotnych zmian zwyrodnieniowych.',
        keywords: ['staw', 'międzywyrostk', 'więzad', 'żółt', 'krzyżowo-biodr'],
      },
      {
        id: 'paraspinal',
        label: 'Tkanki przykręgosłupowe',
        normal: 'Tkanki miękkie przykręgosłupowe bez zmian.',
        keywords: ['przykręgosłup', 'mięś', 'tkank', 'zaotrzewn', 'nerk'],
      },
      { id: 'other', label: 'Inne', normal: '', keywords: [] },
    ],
    conclusion: 'Obraz MR kręgosłupa lędźwiowo-krzyżowego bez istotnych odchyleń od normy.',
  },
  {
    id: 'us-abdomen',
    modality: 'USG',
    name: 'USG jamy brzusznej',
    subtitle: 'standard',
    title: 'USG jamy brzusznej',
    technique: 'Badanie wykonano głowicą convex.',
    sections: [
      {
        id: 'liver',
        label: 'Wątroba',
        normal: 'Wątroba niepowiększona, o jednorodnej echostrukturze, bez zmian ogniskowych.',
        keywords: ['wątrob', 'stłuszcz', 'naczyniak', 'torbiel wątrob', 'żyła wrotn', 'wrotn', 'segment'],
      },
      {
        id: 'gallbladder',
        label: 'Pęcherzyk i drogi żółciowe',
        normal: 'Pęcherzyk żółciowy o cienkiej ścianie, bez złogów. Drogi żółciowe nieposzerzone.',
        keywords: ['pęcherzyk', 'żółc', 'kamic', 'złog', 'przewód żółc', 'polip'],
      },
      {
        id: 'pancreas',
        label: 'Trzustka',
        normal: 'Trzustka w dostępnych ocenie fragmentach bez zmian.',
        keywords: ['trzustk', 'trzustc', 'wirsung'],
      },
      {
        id: 'spleen',
        label: 'Śledziona',
        normal: 'Śledziona niepowiększona, o jednorodnej echostrukturze.',
        keywords: ['śledzion', 'splenomegal'],
      },
      {
        id: 'kidneys',
        label: 'Nerki',
        normal:
          'Nerki prawidłowej wielkości i położenia, z zachowanym zróżnicowaniem korowo-rdzeniowym, bez złogów i bez cech zastoju.',
        keywords: ['nerk', 'nerce', 'miedniczk', 'kielich', 'zastój', 'zastoj', 'wodonercz', 'torbiel nerk', 'moczowod'],
      },
      {
        id: 'aorta',
        label: 'Aorta',
        normal: 'Aorta brzuszna o prawidłowej szerokości.',
        keywords: ['aort', 'aorc', 'tętniak'],
      },
      {
        id: 'bladder',
        label: 'Pęcherz moczowy',
        normal: 'Pęcherz moczowy o gładkiej ścianie, bez złogów.',
        keywords: ['pęcherz moczow', 'pęcherza moczow', 'prostat', 'gruczoł krokow', 'macic', 'jajnik'],
      },
      {
        id: 'fluid',
        label: 'Wolny płyn',
        normal: 'Nie stwierdzono wolnego płynu w jamie otrzewnej.',
        keywords: ['wolny płyn', 'wolnego płynu', 'płyn', 'wodobrzusz', 'otrzewn'],
      },
      { id: 'other', label: 'Inne', normal: '', keywords: [] },
    ],
    conclusion: 'Obraz USG jamy brzusznej bez istotnych odchyleń od normy.',
  },
];

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || null;
}

/** Fresh report state built from a template's normal text. */
export function reportFromTemplate(template) {
  return {
    templateId: template.id,
    title: template.title,
    technique: template.technique,
    sections: template.sections.map((s) => ({ id: s.id, label: s.label, text: s.normal })),
    conclusion: template.conclusion,
  };
}

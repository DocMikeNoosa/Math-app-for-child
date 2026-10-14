// Visceral arteries of the abdominal aorta (AP angiographic schematic). Patient's right = viewer's left.
export default {
  id: 'visceral',
  branches: ['Vascular'],
  anat: 'abdomen',
  label: ['Tętnice trzewne i nerkowe', 'Visceral and renal arteries'],
  viewBox: '0 0 640 640',
  backdrop: `
    <path class="outline" d="M310 40 L310 600 L336 600 L336 40 Z"/>
    <path class="faint" d="M310 600 L286 630 M336 600 L360 630"/>
    <path class="faint" d="M40 70 Q110 18 250 26 Q300 34 300 56 Q262 104 214 142 Q130 186 66 160 Q30 126 40 70 Z"/>
    <path class="faint" d="M538 50 Q590 46 604 92 Q610 138 572 156 Q540 160 528 130 Q520 96 538 50 Z"/>
    <path class="faint" d="M160 168 Q126 176 126 228 Q128 282 162 290 Q190 290 198 262 Q190 240 200 220 Q192 190 160 168 Z"/>
    <path class="faint" d="M480 156 Q514 164 514 216 Q512 270 478 278 Q450 278 442 250 Q450 228 440 208 Q448 178 480 156 Z"/>
    <path class="faint" d="M346 46 Q400 30 450 50 Q500 80 486 130 Q470 170 410 172 Q370 168 352 140"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="612" y="24">L</text>
    <text class="lbl-strong" x="314" y="34">Aorta</text>
    <text class="lbl" x="70" y="110">Wątroba</text>
    <text class="lbl" x="548" y="176">Śledziona</text>
    <text class="lbl" x="420" y="66">Żołądek</text>
    <text class="lbl" x="110" y="310">Nerka</text>
    <text class="lbl" x="460" y="298">Nerka</text>
    <text class="lbl" x="344" y="178">SMA</text>
    <text class="lbl" x="372" y="474">IMA</text>
  `,
  parts: [
    // coeliac trunk and its branches
    { id: 'coeliac_trunk', z: [0, 35], label: ['Pień trzewny', 'Coeliac trunk'], side: '', kind: 'vessel', w: 8, d: 'M322 128 L322 98' },
    { id: 'left_gastric', z: 45, label: ['Tętnica żołądkowa lewa', 'Left gastric artery'], side: '', kind: 'vessel', w: 4, d: 'M322 98 Q336 72 358 50' },
    { id: 'common_hepatic', z: 35, label: ['Tętnica wątrobowa wspólna', 'Common hepatic artery'], side: '', kind: 'vessel', w: 6, d: 'M322 98 Q280 100 240 108' },
    { id: 'proper_hepatic', z: 35, label: ['Tętnica wątrobowa właściwa', 'Proper hepatic artery'], side: '', kind: 'vessel', w: 5, d: 'M240 108 Q222 96 206 76' },
    { id: 'right_hepatic', z: 30, label: ['Tętnica wątrobowa prawa', 'Right hepatic artery'], side: '', kind: 'vessel', w: 4, d: 'M206 76 Q190 66 170 64' },
    { id: 'rha_anterior', z: 40, label: ['Tętnica wątrobowa prawa – gałąź przednia', 'Right hepatic artery – anterior branch'], side: '', kind: 'vessel', w: 3, d: 'M170 64 Q146 76 118 104' },
    { id: 'rha_posterior', z: 10, label: ['Tętnica wątrobowa prawa – gałąź tylna', 'Right hepatic artery – posterior branch'], side: '', kind: 'vessel', w: 3, d: 'M170 64 Q140 52 104 56' },
    { id: 'left_hepatic', z: 40, label: ['Tętnica wątrobowa lewa', 'Left hepatic artery'], side: '', kind: 'vessel', w: 4, d: 'M206 76 Q222 56 246 40' },
    { id: 'segment4_artery', z: 45, label: ['Tętnica wątrobowa środkowa (segment IV)', 'Middle hepatic (segment IV) artery'], side: '', kind: 'vessel', w: 3, d: 'M220 60 Q212 46 210 30' },
    { id: 'gda', z: 45, label: ['Tętnica żołądkowo-dwunastnicza (GDA)', 'Gastroduodenal artery (GDA)'], side: '', kind: 'vessel', w: 4, d: 'M240 108 Q234 138 236 166' },
    { id: 'right_gastroepiploic', z: 60, label: ['Tętnica żołądkowo-sieciowa prawa', 'Right gastroepiploic artery'], side: '', kind: 'vessel', w: 3, d: 'M236 166 Q250 186 288 188' },
    { id: 'splenic_proximal', z: 25, label: ['Tętnica śledzionowa – odcinek bliższy', 'Splenic artery – proximal'], side: '', kind: 'vessel', w: 6, d: 'M322 98 Q360 108 392 98' },
    { id: 'splenic_mid', z: 15, label: ['Tętnica śledzionowa – odcinek środkowy', 'Splenic artery – mid'], side: '', kind: 'vessel', w: 6, d: 'M392 98 Q430 84 466 98' },
    { id: 'splenic_distal', z: 5, label: ['Tętnica śledzionowa – odcinek dalszy (wnękowy)', 'Splenic artery – distal (hilar)'], side: '', kind: 'vessel', w: 5, d: 'M466 98 Q500 112 540 96' },
    { id: 'dorsal_pancreatic', z: 20, label: ['Tętnica trzustkowa grzbietowa', 'Dorsal pancreatic artery'], side: '', kind: 'vessel', w: 3, d: 'M352 104 Q356 120 352 136' },
    { id: 'short_gastric', z: 20, label: ['Tętnice żołądkowe krótkie', 'Short gastric arteries'], side: '', kind: 'vessel', w: 3, d: 'M512 104 Q508 80 498 58' },
    // SMA
    { id: 'sma_proximal', z: [5, 40], label: ['Tętnica krezkowa górna (SMA) – odcinek bliższy', 'Superior mesenteric artery (SMA) – proximal'], side: '', kind: 'vessel', w: 7, d: 'M323 150 Q336 186 331 245' },
    { id: 'sma_mid', z: 45, label: ['Tętnica krezkowa górna (SMA) – odcinek środkowy', 'Superior mesenteric artery (SMA) – mid'], side: '', kind: 'vessel', w: 6, d: 'M331 245 Q326 300 306 346' },
    { id: 'sma_distal', z: 45, label: ['Tętnica krezkowa górna (SMA) – odcinek dalszy', 'Superior mesenteric artery (SMA) – distal'], side: '', kind: 'vessel', w: 5, d: 'M306 346 Q296 396 286 440' },
    { id: 'middle_colic', z: 55, label: ['Tętnica okrężnicza środkowa', 'Middle colic artery'], side: '', kind: 'vessel', w: 4, d: 'M332 228 Q296 236 262 252' },
    { id: 'right_colic', z: 40, label: ['Tętnica okrężnicza prawa', 'Right colic artery'], side: '', kind: 'vessel', w: 4, d: 'M322 296 Q284 298 246 314' },
    { id: 'ileocolic', z: 40, label: ['Tętnica krętniczo-okrężnicza', 'Ileocolic artery'], side: '', kind: 'vessel', w: 4, d: 'M306 346 Q270 372 236 410' },
    { id: 'jejunal_branches', z: 40, label: ['Tętnice jelita czczego', 'Jejunal arteries'], side: '', kind: 'vessel', w: 3, d: 'M334 262 Q372 268 404 292 M330 296 Q364 312 392 338' },
    // IMA
    { id: 'ima', z: [5, 20], label: ['Tętnica krezkowa dolna (IMA)', 'Inferior mesenteric artery (IMA)'], side: '', kind: 'vessel', w: 5, d: 'M334 482 Q352 488 364 504' },
    { id: 'left_colic', z: 10, label: ['Tętnica okrężnicza lewa', 'Left colic artery'], side: '', kind: 'vessel', w: 3, d: 'M364 504 Q402 492 440 448' },
    { id: 'sigmoid_arteries', z: 15, label: ['Tętnice esicze', 'Sigmoid arteries'], side: '', kind: 'vessel', w: 3, d: 'M364 504 Q396 530 420 566' },
    { id: 'superior_rectal', z: -10, label: ['Tętnica odbytnicza górna', 'Superior rectal artery'], side: '', kind: 'vessel', w: 3, d: 'M364 504 Q368 552 352 610' },
    // renal arteries
    { id: 'renal_artery_r', z: -10, label: ['Tętnica nerkowa – pień', 'Renal artery – main'], side: 'right', kind: 'vessel', w: 6, d: 'M312 206 L214 218' },
    { id: 'renal_upper_r', z: -30, label: ['Tętnica nerkowa – gałąź segmentalna górna', 'Renal artery – upper segmental branch'], side: 'right', kind: 'vessel', w: 3, d: 'M214 218 Q196 204 176 196' },
    { id: 'renal_lower_r', z: -30, label: ['Tętnica nerkowa – gałąź segmentalna dolna', 'Renal artery – lower segmental branch'], side: 'right', kind: 'vessel', w: 3, d: 'M214 218 Q196 236 176 250' },
    { id: 'renal_artery_l', z: -10, label: ['Tętnica nerkowa – pień', 'Renal artery – main'], side: 'left', kind: 'vessel', w: 6, d: 'M334 198 L428 206' },
    { id: 'renal_upper_l', z: -30, label: ['Tętnica nerkowa – gałąź segmentalna górna', 'Renal artery – upper segmental branch'], side: 'left', kind: 'vessel', w: 3, d: 'M428 206 Q446 192 466 184' },
    { id: 'renal_lower_l', z: -30, label: ['Tętnica nerkowa – gałąź segmentalna dolna', 'Renal artery – lower segmental branch'], side: 'left', kind: 'vessel', w: 3, d: 'M428 206 Q446 224 466 238' },
  ],
};

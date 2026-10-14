// Lungs by lobe, pleura and mediastinum (frontal schematic). Patient's right = viewer's left.
export default {
  id: 'chest_organs',
  branches: ['NonVascular'],
  anat: 'chest',
  label: ["Płuca, opłucna i śródpiersie", "Lungs, pleura and mediastinum"],
  viewBox: '0 0 640 560',
  backdrop: `
    <path class="outline" d="M120 60 Q320 10 520 60 Q600 160 610 300 L614 500 Q320 470 26 500 L30 300 Q40 160 120 60 Z"/>
    <path class="faint" d="M300 92 Q220 70 140 92 M340 92 Q420 70 500 92"/>
    <path class="faint" d="M62 492 Q160 430 266 456 Q320 470 400 456 Q490 430 578 492"/>
    <text class="side" x="14" y="30">P</text><text class="side" x="612" y="30">L</text>
    <text class="lbl-strong" x="140" y="170">RUL</text><text class="lbl-strong" x="200" y="330">RML</text><text class="lbl-strong" x="110" y="400">RLL</text>
    <text class="lbl-strong" x="460" y="190">LUL</text><text class="lbl" x="430" y="350">Języczek</text><text class="lbl-strong" x="520" y="400">LLL</text>
    <text class="lbl" x="334" y="56">Tchawica</text><text class="lbl" x="350" y="340">Serce</text>
    <text class="lbl" x="30" y="525">Opłucna</text>`,
  parts: [
    {"id": "pleura_r", "label": ["Jama opłucnej", "Pleural space"], "side": "right", "kind": "organ", "z": -10, "d": "M86 170 C74 260 66 380 60 484 Q110 474 160 458 L158 450 Q112 462 70 472 C74 400 80 300 92 200 Z"},
    {"id": "pleura_l", "label": ["Jama opłucnej", "Pleural space"], "side": "left", "kind": "organ", "z": -10, "d": "M 554 170 C 566 260 574 380 580 484 Q 530 474 480 458 L 482 450 Q 528 462 570 472 C 566 400 560 300 548 200 Z"},
    {"id": "rul", "label": ["Płat górny prawego płuca (RUL)", "Right upper lobe (RUL)"], "side": "", "kind": "organ", "z": 0, "d": "M89 250 C95 160 135 72 190 70 Q218 68 240 84 Q276 120 280 190 Q272 220 272 250 L150 250 Z"},
    {"id": "rml", "label": ["Płat środkowy prawego płuca (RML)", "Right middle lobe (RML)"], "side": "", "kind": "organ", "z": 10, "d": "M150 250 L272 250 Q266 300 266 330 L262 452 Q245 449 225 447 Z"},
    {"id": "rll", "label": ["Płat dolny prawego płuca (RLL)", "Right lower lobe (RLL)"], "side": "", "kind": "organ", "z": -15, "d": "M89 250 L150 250 L225 447 Q150 440 72 470 C76 400 82 320 89 250 Z"},
    {"id": "lul", "label": ["Płat górny lewego płuca (LUL)", "Left upper lobe (LUL)"], "side": "", "kind": "organ", "z": 5, "d": "M548 230 C536 140 500 70 450 70 Q422 68 400 84 Q364 120 364 200 Q366 260 396 300 L523 300 Z"},
    {"id": "lingula", "label": ["Języczek płuca lewego", "Lingula"], "side": "", "kind": "organ", "z": 10, "d": "M396 300 L523 300 L470 449 Q456 450 444 452 Q450 360 396 300 Z"},
    {"id": "lll", "label": ["Płat dolny lewego płuca (LLL)", "Left lower lobe (LLL)"], "side": "", "kind": "organ", "z": -15, "d": "M548 230 L470 449 Q520 446 568 470 C566 420 560 340 552 260 Q550 245 548 230 Z"},
    {"id": "mediastinum_anterior", "label": ["Śródpiersie przednie", "Anterior mediastinum"], "side": "", "kind": "organ", "z": 40, "d": "M298 112 Q320 104 342 112 L350 198 L290 198 Z"},
    {"id": "mediastinum_middle", "label": ["Śródpiersie środkowe", "Middle mediastinum"], "side": "", "kind": "organ", "z": 0, "d": "M290 202 L350 202 Q358 244 354 282 L294 282 Q284 244 290 202 Z"},
    {"id": "heart", "label": ["Serce / worek osierdziowy", "Heart / pericardium"], "side": "", "kind": "organ", "z": 15, "d": "M300 286 C330 280 370 285 395 300 C426 325 434 390 428 428 Q400 452 330 452 Q280 452 270 440 C264 400 264 330 274 300 Q284 288 300 286 Z"},
    {"id": "mediastinum_posterior", "label": ["Śródpiersie tylne", "Posterior mediastinum"], "side": "", "kind": "organ", "z": -40, "d": "M306 296 L336 296 L338 456 L304 456 Z"},
    {"id": "hilar_nodes_r", "label": ["Węzły chłonne wnęki", "Hilar lymph nodes"], "side": "right", "kind": "organ", "z": 0, "d": "M247 282 A11 17 0 1 1 269 282 A11 17 0 1 1 247 282 Z"},
    {"id": "hilar_nodes_l", "label": ["Węzły chłonne wnęki", "Hilar lymph nodes"], "side": "left", "kind": "organ", "z": 0, "d": "M375 286 A11 17 0 1 1 397 286 A11 17 0 1 1 375 286 Z"},
    {"id": "trachea", "label": ["Tchawica", "Trachea"], "side": "", "kind": "vessel", "z": 0, "w": 14, "d": "M320 40 L320 230"},
    {"id": "bronchus_main_r", "label": ["Oskrzele główne", "Main bronchus"], "side": "right", "kind": "vessel", "z": [0, -5], "w": 10, "d": "M320 230 L280 266"},
    {"id": "bronchus_main_l", "label": ["Oskrzele główne", "Main bronchus"], "side": "left", "kind": "vessel", "z": [0, -5], "w": 9, "d": "M320 230 Q350 248 380 272"},
  ],
};

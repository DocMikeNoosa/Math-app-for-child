// Urinary tract (frontal). Patient's right = viewer's left; left kidney sits slightly higher.
export default {
  id: 'urinary',
  branches: ['NonVascular'],
  anat: 'abdomen',
  label: ['Układ moczowy', 'Urinary tract'],
  viewBox: '0 0 600 700',
  backdrop: `
    <path class="faint" d="M284 120 L316 120 L318 168 L282 168 Z M283 176 L317 176 L319 226 L281 226 Z M282 234 L318 234 L320 286 L280 286 Z M281 294 L319 294 L321 348 L279 348 Z M280 356 L320 356 L322 410 L278 410 Z M276 418 L324 418 Q316 480 300 500 Q284 480 276 418 Z"/>
    <path class="faint" d="M262 150 Q236 300 196 470 M338 150 Q364 300 404 470"/>
    <path class="faint" d="M200 430 Q170 470 190 540 Q230 640 300 650 Q370 640 410 540 Q430 470 400 430"/>
    <text class="side" x="18" y="30">P</text><text class="side" x="570" y="30">L</text>
    <text class="lbl-strong" x="40" y="90">Nerka</text>
    <text class="lbl" x="150" y="380">Moczowód</text>
    <text class="lbl" x="300" y="572" text-anchor="middle">Pęcherz</text>
    <text class="lbl" x="350" y="672">Prostata</text>
    `,
  parts: [
    {'id': 'kidney_r', 'label': ['Nerka (miąższ)', 'Kidney (parenchyma)'], 'side': 'right', 'kind': 'organ', "z": -40, 'd': 'M 158 88.8 C 102 88.8 82.4 156 85.2 198 C 88 256.8 107.6 310 165 310 C 205.6 310 219.6 276.4 214 248.4 Q 200 206.4 214 164.4 C 222.4 125.2 205.6 88.8 158 88.8 Z'},
    {'id': 'kidney_l', 'label': ['Nerka (miąższ)', 'Kidney (parenchyma)'], 'side': 'left', 'kind': 'organ', "z": -40, 'd': 'M 442 66.8 C 498 66.8 517.6 134 514.8 176 C 512 234.8 492.4 288 435 288 C 394.4 288 380.4 254.4 386 226.4 Q 400 184.4 386 142.4 C 377.6 103.2 394.4 66.8 442 66.8 Z'},
    {'id': 'calyx_upper_r', 'label': ['Kielichy górne', 'Upper pole calyces'], 'side': 'right', 'kind': 'organ', "z": -40, 'd': 'M 183.9 184.6 L 160.8 149.1 Q 151.8 123.7 144.8 113.2 Q 146.1 134.2 127.3 124.6 Q 134.2 135.1 153.8 153.6 L 176.9 189 Z'},
    {'id': 'calyx_mid_r', 'label': ['Kielichy środkowe (międzybiegunowe)', 'Interpolar calyces'], 'side': 'right', 'kind': 'organ', "z": -40, 'd': 'M 169.6 205 L 138.8 201.9 Q 122.6 193.9 110.1 192.7 Q 127.2 205 108 213.7 Q 120.5 214.9 138 210.3 L 168.8 213.4 Z'},
    {'id': 'calyx_lower_r', 'label': ['Kielichy dolne', 'Lower pole calyces'], 'side': 'right', 'kind': 'organ', "z": -40, 'd': 'M 174.1 229.4 L 154.1 260.2 Q 137 274.9 130.1 285.4 Q 148.8 275.8 147.8 296.8 Q 154.6 286.3 161.1 264.6 L 181.1 233.8 Z'},
    {'id': 'renal_pelvis_r', 'label': ['Miedniczka nerkowa', 'Renal pelvis'], 'side': 'right', 'kind': 'organ', "z": -36, 'd': 'M 174.8 178.4 Q 208.4 178.4 221 209.2 L 230.8 240 L 218.2 245.6 Q 197.2 240 174.8 237.2 Q 160.8 209.2 174.8 178.4 Z'},
    {'id': 'calyx_upper_l', 'label': ['Kielichy górne', 'Upper pole calyces'], 'side': 'left', 'kind': 'organ', "z": -40, 'd': 'M 416.1 162.6 L 439.2 127.1 Q 448.2 101.7 455.2 91.2 Q 453.9 112.2 472.7 102.6 Q 465.8 113.1 446.2 131.6 L 423.1 167 Z'},
    {'id': 'calyx_mid_l', 'label': ['Kielichy środkowe (międzybiegunowe)', 'Interpolar calyces'], 'side': 'left', 'kind': 'organ', "z": -40, 'd': 'M 430.4 183 L 461.2 179.9 Q 477.4 171.9 489.9 170.7 Q 472.8 183 492 191.7 Q 479.5 192.9 462 188.3 L 431.2 191.4 Z'},
    {'id': 'calyx_lower_l', 'label': ['Kielichy dolne', 'Lower pole calyces'], 'side': 'left', 'kind': 'organ', "z": -40, 'd': 'M 425.9 207.4 L 445.9 238.2 Q 463 252.9 469.9 263.4 Q 451.2 253.8 452.2 274.8 Q 445.4 264.3 438.9 242.6 L 418.9 211.8 Z'},
    {'id': 'renal_pelvis_l', 'label': ['Miedniczka nerkowa', 'Renal pelvis'], 'side': 'left', 'kind': 'organ', "z": -36, 'd': 'M 425.2 156.4 Q 391.6 156.4 379 187.2 L 369.2 218 L 381.8 223.6 Q 402.8 218 425.2 215.2 Q 439.2 187.2 425.2 156.4 Z'},
    {'id': 'puj_r', 'label': ['Połączenie miedniczkowo-moczowodowe (UPJ)', 'Pelviureteric junction (PUJ)'], 'side': 'right', 'kind': 'vessel', "z": -34, 'w': 5, 'd': 'M220 245 L222 262'},
    {'id': 'ureter_prox_r', 'label': ['Moczowód – odcinek bliższy (lędźwiowy)', 'Ureter – proximal (lumbar)'], 'side': 'right', 'kind': 'vessel', "z": [-34, -30], 'w': 5, 'd': 'M222 262 Q222 300 220 340'},
    {'id': 'ureter_mid_r', 'label': ['Moczowód – odcinek środkowy (biodrowy)', 'Ureter – mid (iliac)'], 'side': 'right', 'kind': 'vessel', "z": [-30, -25], 'w': 5, 'd': 'M220 340 Q220 380 224 420'},
    {'id': 'ureter_dist_r', 'label': ['Moczowód – odcinek dalszy (miedniczny)', 'Ureter – distal (pelvic)'], 'side': 'right', 'kind': 'vessel', "z": [-25, -10], 'w': 5, 'd': 'M224 420 Q228 482 258 530', 'anat': 'pelvis'},
    {'id': 'uvj_r', 'label': ['Połączenie moczowodowo-pęcherzowe (UVJ)', 'Ureterovesical junction (VUJ)'], 'side': 'right', 'kind': 'vessel', "z": [-10, -5], 'w': 5, 'd': 'M258 530 L272 546', 'anat': 'pelvis'},
    {'id': 'puj_l', 'label': ['Połączenie miedniczkowo-moczowodowe (UPJ)', 'Pelviureteric junction (PUJ)'], 'side': 'left', 'kind': 'vessel', "z": -34, 'w': 5, 'd': 'M 380 223 L 378 240'},
    {'id': 'ureter_prox_l', 'label': ['Moczowód – odcinek bliższy (lędźwiowy)', 'Ureter – proximal (lumbar)'], 'side': 'left', 'kind': 'vessel', "z": [-34, -30], 'w': 5, 'd': 'M378 240 Q378 290 380 340'},
    {'id': 'ureter_mid_l', 'label': ['Moczowód – odcinek środkowy (biodrowy)', 'Ureter – mid (iliac)'], 'side': 'left', 'kind': 'vessel', "z": [-30, -25], 'w': 5, 'd': 'M 380 340 Q 380 380 376 420'},
    {'id': 'ureter_dist_l', 'label': ['Moczowód – odcinek dalszy (miedniczny)', 'Ureter – distal (pelvic)'], 'side': 'left', 'kind': 'vessel', "z": [-25, -10], 'w': 5, 'd': 'M 376 420 Q 372 482 342 530', 'anat': 'pelvis'},
    {'id': 'uvj_l', 'label': ['Połączenie moczowodowo-pęcherzowe (UVJ)', 'Ureterovesical junction (VUJ)'], 'side': 'left', 'kind': 'vessel', "z": [-10, -5], 'w': 5, 'd': 'M 342 530 L 328 546', 'anat': 'pelvis'},
    {'id': 'bladder', 'label': ['Pęcherz moczowy', 'Urinary bladder'], 'side': '', 'kind': 'organ', "z": 10, 'd': 'M300 512 C350 512 378 530 378 566 C378 604 340 618 300 618 C260 618 222 604 222 566 C222 530 250 512 300 512 Z', 'anat': 'pelvis'},
    {'id': 'prostate', 'label': ['Gruczoł krokowy (prostata)', 'Prostate'], 'side': '', 'kind': 'organ', "z": 0, 'd': 'M300 616 C326 616 336 632 334 648 C332 666 316 674 300 674 C284 674 268 666 266 648 C264 632 274 616 300 616 Z', 'anat': 'pelvis'},
    {'id': 'urethra', 'label': ['Cewka moczowa (część sterczowa)', 'Urethra (prostatic)'], 'side': '', 'kind': 'vessel', "z": [5, 0], 'w': 3, 'd': 'M300 614 L300 690', 'anat': 'pelvis'},
  ],
};

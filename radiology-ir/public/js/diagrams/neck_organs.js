// Neck: thyroid, salivary glands and cervical lymph node levels (frontal schematic). Patient's right = viewer's left.
export default {
  id: 'neck_organs',
  branches: ['NonVascular'],
  anat: 'neck',
  label: ["Szyja – tarczyca, ślinianki, węzły chłonne", "Neck – thyroid, salivary glands, lymph nodes"],
  viewBox: '0 0 600 550',
  backdrop: `
    <path class="faint" d="M118 60 L170 66 L176 160 Q240 190 300 206 Q360 190 424 160 L430 66 L482 60"/>
    <path class="outline" d="M80 40 Q300 0 520 40 L522 180 Q514 320 528 470 L580 500 L20 500 L72 470 Q86 320 78 180 Z"/>
    <path class="faint" d="M262 232 L338 232 M110 480 Q200 462 282 472 M490 480 Q400 462 318 472"/>
    <text class="lbl" x="300" y="196" text-anchor="middle">Żuchwa</text><text class="lbl" x="300" y="482" text-anchor="middle">Wcięcie szyjne</text>
    <text class="side" x="14" y="30">P</text><text class="side" x="572" y="30">L</text>
    <text class="lbl-strong" x="300" y="224" text-anchor="middle">IA</text><text class="lbl-strong" x="236" y="194" text-anchor="middle">IB</text><text class="lbl-strong" x="364" y="194" text-anchor="middle">IB</text><text class="lbl-strong" x="172" y="214" text-anchor="middle">II</text><text class="lbl-strong" x="428" y="214" text-anchor="middle">II</text><text class="lbl-strong" x="184" y="284" text-anchor="middle">III</text><text class="lbl-strong" x="416" y="284" text-anchor="middle">III</text><text class="lbl-strong" x="196" y="400" text-anchor="middle">IV</text><text class="lbl-strong" x="404" y="400" text-anchor="middle">IV</text><text class="lbl-strong" x="128" y="330" text-anchor="middle">V</text><text class="lbl-strong" x="472" y="330" text-anchor="middle">V</text><text class="lbl-strong" x="300" y="440" text-anchor="middle">VI</text>
    <text class="lbl" x="300" y="530" text-anchor="middle">Tarczyca, ślinianki, poziomy węzłów chłonnych szyi</text>`,
  parts: [
    {"id": "level_1a", "label": ["Węzły chłonne – poziom IA (podbródkowe)", "Lymph nodes – level IA (submental)"], "side": "", "kind": "organ", "z": 10, "d": "M272 200 Q300 214 328 200 L338 230 L262 230 Z"},
    {"id": "level_6", "label": ["Węzły chłonne – poziom VI (przedział centralny)", "Lymph nodes – level VI (central compartment)"], "side": "", "kind": "organ", "z": 10, "d": "M236 236 L364 236 L338 466 L262 466 Z"},
    {"id": "level_1b_r", "label": ["Węzły chłonne – poziom IB (podżuchwowe)", "Lymph nodes – level IB (submandibular)"], "side": "right", "kind": "organ", "z": 0, "d": "M203.2 176 L272 200 L262 230 L214 230 Z"},
    {"id": "level_1b_l", "label": ["Węzły chłonne – poziom IB (podżuchwowe)", "Lymph nodes – level IB (submandibular)"], "side": "left", "kind": "organ", "z": 0, "d": "M 396.8 176 L 328 200 L 338 230 L 386 230 Z"},
    {"id": "level_2_r", "label": ["Węzły chłonne – poziom II (szyjne górne)", "Lymph nodes – level II (upper jugular)"], "side": "right", "kind": "organ", "z": -10, "d": "M142.7 172 L202.4 172 L214.4 232 L156.3 232 Z"},
    {"id": "level_2_l", "label": ["Węzły chłonne – poziom II (szyjne górne)", "Lymph nodes – level II (upper jugular)"], "side": "left", "kind": "organ", "z": -10, "d": "M 457.3 172 L 397.6 172 L 385.6 232 L 443.7 232 Z"},
    {"id": "level_3_r", "label": ["Węzły chłonne – poziom III (szyjne środkowe)", "Lymph nodes – level III (mid jugular)"], "side": "right", "kind": "organ", "z": -10, "d": "M156.3 232 L214.4 232 L230.4 312 L174.3 312 Z"},
    {"id": "level_3_l", "label": ["Węzły chłonne – poziom III (szyjne środkowe)", "Lymph nodes – level III (mid jugular)"], "side": "left", "kind": "organ", "z": -10, "d": "M 443.7 232 L 385.6 232 L 369.6 312 L 425.7 312 Z"},
    {"id": "level_4_r", "label": ["Węzły chłonne – poziom IV (szyjne dolne)", "Lymph nodes – level IV (lower jugular)"], "side": "right", "kind": "organ", "z": -10, "d": "M174.3 312 L230.4 312 L260.4 462 L208.2 462 Z"},
    {"id": "level_4_l", "label": ["Węzły chłonne – poziom IV (szyjne dolne)", "Lymph nodes – level IV (lower jugular)"], "side": "left", "kind": "organ", "z": -10, "d": "M 425.7 312 L 369.6 312 L 339.6 462 L 391.8 462 Z"},
    {"id": "level_5_r", "label": ["Węzły chłonne – poziom V (trójkąt tylny)", "Lymph nodes – level V (posterior triangle)"], "side": "right", "kind": "organ", "z": -30, "d": "M96 172 L142.7 172 L208.2 462 L120 470 Q100 320 96 172 Z"},
    {"id": "level_5_l", "label": ["Węzły chłonne – poziom V (trójkąt tylny)", "Lymph nodes – level V (posterior triangle)"], "side": "left", "kind": "organ", "z": -30, "d": "M 504 172 L 457.3 172 L 391.8 462 L 480 470 Q 500 320 504 172 Z"},
    {"id": "parotid_r", "label": ["Ślinianka przyuszna", "Parotid gland"], "side": "right", "kind": "organ", "z": -10, "d": "M112 66 Q150 56 176 76 L182 140 Q172 164 146 168 Q118 164 108 140 Q102 100 112 66 Z"},
    {"id": "parotid_l", "label": ["Ślinianka przyuszna", "Parotid gland"], "side": "left", "kind": "organ", "z": -10, "d": "M 488 66 Q 450 56 424 76 L 418 140 Q 428 164 454 168 Q 482 164 492 140 Q 498 100 488 66 Z"},
    {"id": "submandibular_r", "label": ["Ślinianka podżuchwowa", "Submandibular gland"], "side": "right", "kind": "organ", "z": 0, "d": "M214 210 A20 10 0 1 1 254 210 A20 10 0 1 1 214 210 Z"},
    {"id": "submandibular_l", "label": ["Ślinianka podżuchwowa", "Submandibular gland"], "side": "left", "kind": "organ", "z": 0, "d": "M 386 210 A 20 10 0 1 0 346 210 A 20 10 0 1 0 386 210 Z"},
    {"id": "trachea", "label": ["Tchawica", "Trachea"], "side": "", "kind": "organ", "z": 5, "d": "M290 308 L310 308 L311 470 L289 470 Z"},
    {"id": "larynx", "label": ["Krtań", "Larynx"], "side": "", "kind": "organ", "z": 20, "d": "M270 238 Q300 232 330 238 L324 272 Q314 294 312 308 L288 308 Q286 294 276 272 Z"},
    {"id": "thyroid_r", "label": ["Tarczyca – płat", "Thyroid – lobe"], "side": "right", "kind": "organ", "z": 15, "d": "M268 304 Q252 324 250 356 Q250 392 270 396 Q288 394 290 370 L290 336 Q286 312 268 304 Z"},
    {"id": "thyroid_l", "label": ["Tarczyca – płat", "Thyroid – lobe"], "side": "left", "kind": "organ", "z": 15, "d": "M 332 304 Q 348 324 350 356 Q 350 392 330 396 Q 312 394 310 370 L 310 336 Q 314 312 332 304 Z"},
    {"id": "thyroid_isthmus", "label": ["Tarczyca – cieśń", "Thyroid – isthmus"], "side": "", "kind": "organ", "z": 20, "d": "M288 342 L312 342 L312 362 L288 362 Z"},
  ],
};

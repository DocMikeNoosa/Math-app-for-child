// Liver (Couinaud segments, frontal schematic) and biliary tree. Patient's right = viewer's left.
export default {
  id: 'liver_biliary',
  branches: ['NonVascular'],
  anat: 'abdomen',
  label: ['Wątroba (segmenty Couinauda) i drogi żółciowe', 'Liver (Couinaud segments) and biliary tree'],
  viewBox: '0 0 640 580',
  backdrop: `
    <path class="faint" d="M296 430 Q330 418 420 430 Q480 410 560 400 Q605 396 606 418 Q604 436 560 440 Q500 448 456 462 L452 520 Q440 528 420 528 L300 528 Q290 500 296 430 Z"/>
    <text class="side" x="18" y="30">P</text><text class="side" x="608" y="30">L</text>
    <text class="lbl-strong" x="60" y="40">Wątroba</text>
    <text class="lbl" x="540" y="390">Trzustka</text>
    <text class="lbl" x="130" y="560">Dwunastnica</text>
    <text class="lbl" x="150" y="395">Pęcherzyk</text>
    <text class="lbl" x="352" y="368">PŻW</text>
    <text class="lbl-strong" x="120" y="122" text-anchor="middle">VII</text>
    <text class="lbl-strong" x="115" y="245" text-anchor="middle">VI</text>
    <text class="lbl-strong" x="245" y="105" text-anchor="middle">VIII</text>
    <text class="lbl-strong" x="215" y="272" text-anchor="middle">V</text>
    <text class="lbl-strong" x="355" y="105" text-anchor="middle">IVa</text>
    <text class="lbl-strong" x="350" y="225" text-anchor="middle">IVb</text>
    <text class="lbl-strong" x="340" y="175" text-anchor="middle">I</text>
    <text class="lbl-strong" x="485" y="135" text-anchor="middle">II</text>
    <text class="lbl-strong" x="470" y="200" text-anchor="middle">III</text>`,
  parts: [
    { id: 'seg7', label: ['Segment VII wątroby', 'Liver segment VII'], side: '', kind: 'organ', "z": 10, d: 'M60 172 C58 118 112 62 200 52 L188 170 Z' },
    { id: 'seg6', label: ['Segment VI wątroby', 'Liver segment VI'], side: '', kind: 'organ', "z": 10, d: 'M188 170 L170 298 C100 294 52 240 60 172 Z' },
    { id: 'seg8', label: ['Segment VIII wątroby', 'Liver segment VIII'], side: '', kind: 'organ', "z": 10, d: 'M188 170 L200 52 Q255 44 310 54 L300 150 L298 170 Z' },
    { id: 'seg5', label: ['Segment V wątroby', 'Liver segment V'], side: '', kind: 'organ', "z": 10, d: 'M188 170 L298 170 L295 192 L282 288 Q225 300 170 298 Z' },
    { id: 'seg4a', label: ['Segment IVa wątroby', 'Liver segment IVa'], side: '', kind: 'organ', "z": 10, d: 'M310 54 Q362 56 410 76 L402 165 L385 170 L345 142 L300 150 Z' },
    { id: 'seg4b', label: ['Segment IVb wątroby', 'Liver segment IVb'], side: '', kind: 'organ', "z": 10, d: 'M402 165 L395 248 Q340 274 282 288 L295 192 L345 198 L385 170 Z' },
    { id: 'seg1', label: ['Segment I wątroby (płat ogoniasty)', 'Liver segment I (caudate lobe)'], side: '', kind: 'organ', "z": -25, d: 'M300 150 L345 142 L385 170 L345 198 L295 192 L298 170 Z' },
    { id: 'seg2', label: ['Segment II wątroby', 'Liver segment II'], side: '', kind: 'organ', "z": 10, d: 'M410 76 C480 92 552 126 590 168 L402 165 Z' },
    { id: 'seg3', label: ['Segment III wątroby', 'Liver segment III'], side: '', kind: 'organ', "z": 10, d: 'M402 165 L590 168 C540 192 440 225 395 248 Z' },
    { id: 'gallbladder', label: ['Pęcherzyk żółciowy', 'Gallbladder'], side: '', kind: 'organ', "z": 25, d: 'M300 300 Q318 310 308 328 Q288 366 256 384 Q228 396 221 372 Q218 348 246 324 Q272 300 300 300 Z' },
    { id: 'duodenum', label: ['Dwunastnica', 'Duodenum'], side: '', kind: 'organ', "z": 5, d: 'M440 394 L292 394 Q262 394 262 424 L262 522 Q262 554 294 554 L446 554 Q474 554 474 526 L474 488 L452 488 L452 520 Q452 532 440 532 L298 532 Q286 532 286 520 L286 428 Q286 416 298 416 L440 416 Z' },
    { id: 'hilar_confluence', label: ['Wnęka wątroby – zbieg przewodów wątrobowych', 'Hepatic hilum – biliary confluence'], side: '', kind: 'organ', "z": 0, d: 'M323 256 A9 9 0 1 1 341 256 A9 9 0 1 1 323 256 Z' },
    { id: 'ampulla', label: ['Bańka wątrobowo-trzustkowa / brodawka Vatera', 'Ampulla / major duodenal papilla'], side: '', kind: 'organ', "z": -5, d: 'M283 472 A7 7 0 1 1 297 472 A7 7 0 1 1 283 472 Z' },
    { id: 'rhd', label: ['Przewód wątrobowy prawy', 'Right hepatic duct'], side: '', kind: 'vessel', "z": 0, w: 5, d: 'M324 252 Q302 246 285 240' },
    { id: 'rhd_anterior', label: ['Przewód sektorowy przedni prawy', 'Right anterior sectoral duct'], side: '', kind: 'vessel', "z": 5, w: 4, d: 'M285 240 Q268 205 250 160' },
    { id: 'rhd_posterior', label: ['Przewód sektorowy tylny prawy', 'Right posterior sectoral duct'], side: '', kind: 'vessel', "z": -10, w: 4, d: 'M285 240 Q232 228 190 214 Q155 202 125 188' },
    { id: 'lhd', label: ['Przewód wątrobowy lewy', 'Left hepatic duct'], side: '', kind: 'vessel', "z": 5, w: 5, d: 'M340 252 Q370 240 400 228 Q425 216 448 198' },
    { id: 'chd', label: ['Przewód wątrobowy wspólny', 'Common hepatic duct'], side: '', kind: 'vessel', "z": 0, w: 7, d: 'M332 265 L330 340' },
    { id: 'cystic_duct', label: ['Przewód pęcherzykowy', 'Cystic duct'], side: '', kind: 'vessel', "z": 12, w: 4, d: 'M307 318 Q314 342 330 340' },
    { id: 'cbd_proximal', label: ['Przewód żółciowy wspólny – odcinek bliższy', 'Common bile duct – proximal'], side: '', kind: 'vessel', "z": -5, w: 7, d: 'M330 340 L326 400' },
    { id: 'cbd_distal', label: ['Przewód żółciowy wspólny – odcinek dalszy (wewnątrztrzustkowy)', 'Common bile duct – distal (intrapancreatic)'], side: '', kind: 'vessel', "z": -10, w: 7, d: 'M326 400 Q323 448 298 469' },
    { id: 'pancreatic_duct', label: ['Przewód trzustkowy (Wirsunga)', 'Main pancreatic duct (Wirsung)'], side: '', kind: 'vessel', "z": -10, w: 4, d: 'M297 476 Q340 486 390 470 L470 450 Q530 434 585 420' },
  ],
};

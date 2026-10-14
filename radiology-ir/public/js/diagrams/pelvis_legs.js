// Pelvic and lower-limb arteries, both sides, frontal view. Patient's right = viewer's left.
// Generated symmetric: left-side paths are the right-side paths mirrored about x = 300.
export default {
  id: 'pelvis_legs',
  branches: ['Vascular'],
  anat: 'lower_limb',
  label: ['Tętnice miednicy i kończyn dolnych', 'Pelvic and lower-limb arteries'],
  viewBox: '0 0 600 1100',
  backdrop: `
    <path class="outline" d="M120 290 Q112 480 150 690 Q160 760 156 820 Q150 950 162 1036 Q150 1066 156 1092 L236 1094 Q242 1060 232 1036 Q244 900 242 820 Q240 760 250 700 Q284 500 290 360"/>
    <path class="outline" d="M480 290 Q488 480 450 690 Q440 760 444 820 Q450 950 438 1036 Q450 1066 444 1092 L364 1094 Q358 1060 368 1036 Q356 900 358 820 Q360 760 350 700 Q316 500 310 360"/>
    <path class="faint" d="M300 84 Q236 60 180 62 Q124 70 112 116 Q124 176 160 214 Q164 252 170 300 Q220 340 266 348 Q290 350 300 336"/>
    <path class="faint" d="M300 84 Q364 60 420 62 Q476 70 488 116 Q476 176 440 214 Q436 252 430 300 Q380 340 334 348 Q310 350 300 336"/>
    <path class="faint" d="M160 340 Q152 520 174 742 M186 340 Q180 520 200 744"/>
    <path class="faint" d="M440 340 Q448 520 426 742 M414 340 Q420 520 400 744"/>
    <path class="faint" d="M182 800 L180 1005 M208 800 Q216 900 216 1008"/>
    <path class="faint" d="M418 800 L420 1005 M392 800 Q384 900 384 1008"/>
    <path class="faint" d="M118 292 L232 304 M482 292 L368 304"/>
    <path class="faint" d="M140 768 L262 770 M460 768 L338 770"/>
    <path class="faint" d="M280 250 Q300 238 320 250 Q326 280 300 292 Q274 280 280 250 Z"/>
    <text class="side" x="16" y="24">P</text><text class="side" x="572" y="24">L</text>
    <text class="lbl-strong" x="310" y="24">Aorta</text>
    <text class="lbl" x="272" y="200">Miednica</text>
    <text class="lbl" x="40" y="290">Więzadło</text><text class="lbl" x="40" y="304">pachwinowe</text>
    <text class="lbl" x="66" y="520">Udo</text><text class="lbl" x="506" y="500">Udo</text>
    <text class="lbl" x="60" y="772">Kolano</text><text class="lbl" x="500" y="770">Kolano</text>
    <text class="lbl" x="50" y="930">Podudzie</text><text class="lbl" x="494" y="930">Podudzie</text>
    <text class="lbl" x="80" y="1080">Stopa</text><text class="lbl" x="490" y="1076">Stopa</text>
  `,
  parts: [
    { id: 'aorta_distal', z: 0, anat: 'abdomen', label: ['Aorta – odcinek dystalny (rozwidlenie)', 'Distal aorta (bifurcation)'], side: '', kind: 'vessel', w: 14, d: 'M300 0 L300 30' },
    { id: 'median_sacral', z: -50, anat: 'pelvis', label: ['Tętnica krzyżowa pośrodkowa', 'Median sacral artery'], side: '', kind: 'vessel', w: 2, d: 'M300 34 L300 140' },
    { id: 'cia_r', z: -5, anat: 'pelvis', label: ['Tętnica biodrowa wspólna', 'Common iliac artery'], side: 'right', kind: 'vessel', w: 10, d: 'M300 30 L238 118' },
    { id: 'eia_r', z: 5, anat: 'pelvis', label: ['Tętnica biodrowa zewnętrzna', 'External iliac artery'], side: 'right', kind: 'vessel', w: 8, d: 'M238 118 Q186 180 172 300' },
    { id: 'iia_r', z: -25, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień', 'Internal iliac artery – trunk'], side: 'right', kind: 'vessel', w: 6, d: 'M238 118 L248 160' },
    { id: 'iia_posterior_r', z: -45, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień tylny', 'Internal iliac artery – posterior division'], side: 'right', kind: 'vessel', w: 4, d: 'M248 160 L226 182' },
    { id: 'superior_gluteal_r', z: -60, anat: 'pelvis', label: ['Tętnica pośladkowa górna', 'Superior gluteal artery'], side: 'right', kind: 'vessel', w: 3, d: 'M226 182 Q214 196 214 222' },
    { id: 'iia_anterior_r', z: -25, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień przedni', 'Internal iliac artery – anterior division'], side: 'right', kind: 'vessel', w: 5, d: 'M248 160 Q256 210 258 252' },
    { id: 'obturator_r', z: -15, anat: 'pelvis', label: ['Tętnica zasłonowa', 'Obturator artery'], side: 'right', kind: 'vessel', w: 3, d: 'M252 195 Q238 240 232 292' },
    { id: 'uterine_prostatic_r', z: -15, anat: 'pelvis', label: ['Tętnica maciczna / sterczowa', 'Uterine / prostatic artery'], side: 'right', kind: 'vessel', w: 3, d: 'M256 224 Q278 236 288 266' },
    { id: 'internal_pudendal_r', z: -40, anat: 'pelvis', label: ['Tętnica sromowa wewnętrzna', 'Internal pudendal artery'], side: 'right', kind: 'vessel', w: 3, d: 'M258 252 Q266 300 274 346' },
    { id: 'inferior_gluteal_r', z: -50, anat: 'pelvis', label: ['Tętnica pośladkowa dolna', 'Inferior gluteal artery'], side: 'right', kind: 'vessel', w: 3, d: 'M258 252 Q244 284 244 330' },
    { id: 'cfa_r', z: 25, label: ['Tętnica udowa wspólna (CFA)', 'Common femoral artery (CFA)'], side: 'right', kind: 'vessel', w: 8, d: 'M172 300 L168 350' },
    { id: 'pfa_r', z: 0, label: ['Tętnica głęboka uda (PFA)', 'Profunda femoris artery (PFA)'], side: 'right', kind: 'vessel', w: 6, d: 'M168 350 Q146 380 140 480' },
    { id: 'lcfa_r', z: 10, label: ['Tętnica okalająca udo boczna', 'Lateral circumflex femoral artery'], side: 'right', kind: 'vessel', w: 3, d: 'M158 364 Q140 362 124 378' },
    { id: 'sfa_proximal_r', z: 20, label: ['Tętnica udowa powierzchowna (SFA) – odcinek bliższy', 'Superficial femoral artery (SFA) – proximal'], side: 'right', kind: 'vessel', w: 7, d: 'M168 350 L174 480' },
    { id: 'sfa_mid_r', z: 10, label: ['Tętnica udowa powierzchowna (SFA) – odcinek środkowy', 'Superficial femoral artery (SFA) – mid'], side: 'right', kind: 'vessel', w: 7, d: 'M174 480 L184 600' },
    { id: 'sfa_distal_r', z: 0, label: ['Tętnica udowa powierzchowna (SFA) – odcinek dalszy (kanał przywodzicieli)', 'Superficial femoral artery (SFA) – distal (adductor canal)'], side: 'right', kind: 'vessel', w: 7, d: 'M184 600 L194 700' },
    { id: 'popliteal_p1_r', z: -20, label: ['Tętnica podkolanowa – P1 (nad stawem kolanowym)', 'Popliteal artery – P1 (above knee)'], side: 'right', kind: 'vessel', w: 6, d: 'M194 700 L197 745' },
    { id: 'popliteal_p2_r', z: -30, label: ['Tętnica podkolanowa – P2 (szpara stawu)', 'Popliteal artery – P2 (knee joint)'], side: 'right', kind: 'vessel', w: 6, d: 'M197 745 L199 790' },
    { id: 'popliteal_p3_r', z: -25, label: ['Tętnica podkolanowa – P3 (pod stawem kolanowym)', 'Popliteal artery – P3 (below knee)'], side: 'right', kind: 'vessel', w: 6, d: 'M199 790 L199 822' },
    { id: 'ata_proximal_r', z: [-25, 0, 10], label: ['Tętnica piszczelowa przednia – odcinek bliższy', 'Anterior tibial artery – proximal'], side: 'right', kind: 'vessel', w: 4, d: 'M199 822 Q181 828 177 856 L176 935' },
    { id: 'ata_distal_r', z: 15, label: ['Tętnica piszczelowa przednia – odcinek dalszy', 'Anterior tibial artery – distal'], side: 'right', kind: 'vessel', w: 4, d: 'M176 935 L175 1015' },
    { id: 'dorsalis_pedis_r', z: 25, label: ['Tętnica grzbietowa stopy', 'Dorsalis pedis artery'], side: 'right', kind: 'vessel', w: 3, d: 'M175 1015 Q186 1040 206 1058' },
    { id: 'tpt_r', z: -25, label: ['Pień piszczelowo-strzałkowy (TPT)', 'Tibioperoneal trunk (TPT)'], side: 'right', kind: 'vessel', w: 5, d: 'M199 822 L203 864' },
    { id: 'pta_proximal_r', z: -30, label: ['Tętnica piszczelowa tylna – odcinek bliższy', 'Posterior tibial artery – proximal'], side: 'right', kind: 'vessel', w: 4, d: 'M203 864 Q216 895 218 945' },
    { id: 'pta_distal_r', z: -25, label: ['Tętnica piszczelowa tylna – odcinek dalszy', 'Posterior tibial artery – distal'], side: 'right', kind: 'vessel', w: 4, d: 'M218 945 L220 1020' },
    { id: 'peroneal_r', z: -20, label: ['Tętnica strzałkowa', 'Peroneal (fibular) artery'], side: 'right', kind: 'vessel', w: 4, d: 'M203 864 Q192 895 191 995' },
    { id: 'plantar_arch_r', z: -5, label: ['Łuk podeszwowy', 'Plantar arch'], side: 'right', kind: 'vessel', w: 3, d: 'M220 1020 Q234 1058 212 1080 Q190 1090 168 1076' },
    { id: 'cia_l', z: -5, anat: 'pelvis', label: ['Tętnica biodrowa wspólna', 'Common iliac artery'], side: 'left', kind: 'vessel', w: 10, d: 'M300 30 L362 118' },
    { id: 'eia_l', z: 5, anat: 'pelvis', label: ['Tętnica biodrowa zewnętrzna', 'External iliac artery'], side: 'left', kind: 'vessel', w: 8, d: 'M362 118 Q414 180 428 300' },
    { id: 'iia_l', z: -25, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień', 'Internal iliac artery – trunk'], side: 'left', kind: 'vessel', w: 6, d: 'M362 118 L352 160' },
    { id: 'iia_posterior_l', z: -45, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień tylny', 'Internal iliac artery – posterior division'], side: 'left', kind: 'vessel', w: 4, d: 'M352 160 L374 182' },
    { id: 'superior_gluteal_l', z: -60, anat: 'pelvis', label: ['Tętnica pośladkowa górna', 'Superior gluteal artery'], side: 'left', kind: 'vessel', w: 3, d: 'M374 182 Q386 196 386 222' },
    { id: 'iia_anterior_l', z: -25, anat: 'pelvis', label: ['Tętnica biodrowa wewnętrzna – pień przedni', 'Internal iliac artery – anterior division'], side: 'left', kind: 'vessel', w: 5, d: 'M352 160 Q344 210 342 252' },
    { id: 'obturator_l', z: -15, anat: 'pelvis', label: ['Tętnica zasłonowa', 'Obturator artery'], side: 'left', kind: 'vessel', w: 3, d: 'M348 195 Q362 240 368 292' },
    { id: 'uterine_prostatic_l', z: -15, anat: 'pelvis', label: ['Tętnica maciczna / sterczowa', 'Uterine / prostatic artery'], side: 'left', kind: 'vessel', w: 3, d: 'M344 224 Q322 236 312 266' },
    { id: 'internal_pudendal_l', z: -40, anat: 'pelvis', label: ['Tętnica sromowa wewnętrzna', 'Internal pudendal artery'], side: 'left', kind: 'vessel', w: 3, d: 'M342 252 Q334 300 326 346' },
    { id: 'inferior_gluteal_l', z: -50, anat: 'pelvis', label: ['Tętnica pośladkowa dolna', 'Inferior gluteal artery'], side: 'left', kind: 'vessel', w: 3, d: 'M342 252 Q356 284 356 330' },
    { id: 'cfa_l', z: 25, label: ['Tętnica udowa wspólna (CFA)', 'Common femoral artery (CFA)'], side: 'left', kind: 'vessel', w: 8, d: 'M428 300 L432 350' },
    { id: 'pfa_l', z: 0, label: ['Tętnica głęboka uda (PFA)', 'Profunda femoris artery (PFA)'], side: 'left', kind: 'vessel', w: 6, d: 'M432 350 Q454 380 460 480' },
    { id: 'lcfa_l', z: 10, label: ['Tętnica okalająca udo boczna', 'Lateral circumflex femoral artery'], side: 'left', kind: 'vessel', w: 3, d: 'M442 364 Q460 362 476 378' },
    { id: 'sfa_proximal_l', z: 20, label: ['Tętnica udowa powierzchowna (SFA) – odcinek bliższy', 'Superficial femoral artery (SFA) – proximal'], side: 'left', kind: 'vessel', w: 7, d: 'M432 350 L426 480' },
    { id: 'sfa_mid_l', z: 10, label: ['Tętnica udowa powierzchowna (SFA) – odcinek środkowy', 'Superficial femoral artery (SFA) – mid'], side: 'left', kind: 'vessel', w: 7, d: 'M426 480 L416 600' },
    { id: 'sfa_distal_l', z: 0, label: ['Tętnica udowa powierzchowna (SFA) – odcinek dalszy (kanał przywodzicieli)', 'Superficial femoral artery (SFA) – distal (adductor canal)'], side: 'left', kind: 'vessel', w: 7, d: 'M416 600 L406 700' },
    { id: 'popliteal_p1_l', z: -20, label: ['Tętnica podkolanowa – P1 (nad stawem kolanowym)', 'Popliteal artery – P1 (above knee)'], side: 'left', kind: 'vessel', w: 6, d: 'M406 700 L403 745' },
    { id: 'popliteal_p2_l', z: -30, label: ['Tętnica podkolanowa – P2 (szpara stawu)', 'Popliteal artery – P2 (knee joint)'], side: 'left', kind: 'vessel', w: 6, d: 'M403 745 L401 790' },
    { id: 'popliteal_p3_l', z: -25, label: ['Tętnica podkolanowa – P3 (pod stawem kolanowym)', 'Popliteal artery – P3 (below knee)'], side: 'left', kind: 'vessel', w: 6, d: 'M401 790 L401 822' },
    { id: 'ata_proximal_l', z: [-25, 0, 10], label: ['Tętnica piszczelowa przednia – odcinek bliższy', 'Anterior tibial artery – proximal'], side: 'left', kind: 'vessel', w: 4, d: 'M401 822 Q419 828 423 856 L424 935' },
    { id: 'ata_distal_l', z: 15, label: ['Tętnica piszczelowa przednia – odcinek dalszy', 'Anterior tibial artery – distal'], side: 'left', kind: 'vessel', w: 4, d: 'M424 935 L425 1015' },
    { id: 'dorsalis_pedis_l', z: 25, label: ['Tętnica grzbietowa stopy', 'Dorsalis pedis artery'], side: 'left', kind: 'vessel', w: 3, d: 'M425 1015 Q414 1040 394 1058' },
    { id: 'tpt_l', z: -25, label: ['Pień piszczelowo-strzałkowy (TPT)', 'Tibioperoneal trunk (TPT)'], side: 'left', kind: 'vessel', w: 5, d: 'M401 822 L397 864' },
    { id: 'pta_proximal_l', z: -30, label: ['Tętnica piszczelowa tylna – odcinek bliższy', 'Posterior tibial artery – proximal'], side: 'left', kind: 'vessel', w: 4, d: 'M397 864 Q384 895 382 945' },
    { id: 'pta_distal_l', z: -25, label: ['Tętnica piszczelowa tylna – odcinek dalszy', 'Posterior tibial artery – distal'], side: 'left', kind: 'vessel', w: 4, d: 'M382 945 L380 1020' },
    { id: 'peroneal_l', z: -20, label: ['Tętnica strzałkowa', 'Peroneal (fibular) artery'], side: 'left', kind: 'vessel', w: 4, d: 'M397 864 Q408 895 409 995' },
    { id: 'plantar_arch_l', z: -5, label: ['Łuk podeszwowy', 'Plantar arch'], side: 'left', kind: 'vessel', w: 3, d: 'M380 1020 Q366 1058 388 1080 Q410 1090 432 1076' },
  ],
};

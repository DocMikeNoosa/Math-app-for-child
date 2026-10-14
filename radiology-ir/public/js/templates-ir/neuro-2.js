// Neuro templates (part 2): carotid/vertebral/intracranial stenosis, AVM/fistulae, tumours,
// vasospasm, venous sinuses, head & neck bleeding, MMA embolization + neuro snippets.
export default [
  {
    id: 'neuro2_cas_epd', title: 'Stentowanie tętnicy szyjnej wewnętrznej z protekcją dystalną', titleEn: 'Carotid artery stenting with distal embolic protection',
    group: 'Neuro', section: 'Carotid / Vertebral', priority: 10,
    proc: ['carotid_stenting', 'stent', 'pta'], anat: ['neck'],
    text: `Badanie: Stentowanie tętnicy szyjnej wewnętrznej z użyciem filtra protekcyjnego (protekcja dystalna)

Opis:
Wskazanie: … zwężenie tętnicy szyjnej wewnętrznej … (… wg NASCET).
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek opuszkowy.
Znieczulenie: miejscowe, pacjent przytomny, monitorowanie stanu neurologicznego w trakcie zabiegu.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący / długa koszulka … F, cewnik diagnostyczny … F, prowadnik …, filtr protekcyjny dystalny …, balon do predylatacji … mm, stent samorozprężalny … mm × … mm, balon do postdylatacji … mm.
Przebieg zabiegu:
Wykonano angiografię łuku aorty oraz selektywną angiografię tętnicy szyjnej wspólnej … z oceną krążenia wewnątrzczaszkowego. Uwidoczniono … zwężenie tętnicy szyjnej wewnętrznej … w odcinku opuszkowym, długości … mm, stopień zwężenia … wg NASCET. Podano heparynę … j.m. dożylnie (ACT … s). Cewnik prowadzący umieszczono w tętnicy szyjnej wspólnej. Przez zwężenie przeprowadzono filtr protekcyjny i rozprężono go w prostym odcinku szyjnym tętnicy szyjnej wewnętrznej. Wykonano predylatację balonem … mm, a następnie implantowano stent samorozprężalny … mm × … mm obejmujący zwężenie, od tętnicy szyjnej wspólnej do tętnicy szyjnej wewnętrznej. Wykonano postdylatację balonem … mm. Przed postdylatacją podano atropinę … mg dożylnie. Filtr usunięto za pomocą cewnika odzyskującego. Kontrolna angiografia wykazała prawidłowe rozprężenie stentu, resztkowe zwężenie …%, bez cech dyssekcji i bez ubytków wypełnienia w krążeniu wewnątrzczaszkowym w porównaniu z badaniem wyjściowym.
Wynik: skuteczne stentowanie tętnicy szyjnej wewnętrznej …, resztkowe zwężenie …%, prawidłowy przepływ wewnątrzczaszkowy.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa (… i …) przez … miesięcy, następnie monoterapia; kontrola ciśnienia tętniczego (ryzyko hipotensji / hiperperfuzji); ocena neurologiczna; badanie dopplerowskie kontrolne za … miesięcy.

Wnioski:
- Skuteczne stentowanie tętnicy szyjnej wewnętrznej … z protekcją dystalną; resztkowe zwężenie …%, bez powikłań neurologicznych.`,
    textEn: `Procedure: Internal carotid artery stenting with distal embolic protection (filter)

Findings:
Indication: … internal carotid artery stenosis … (… by NASCET).
Target: … internal carotid artery, bulb segment.
Anaesthesia: local, patient awake with neurological monitoring throughout.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter / long sheath, … F diagnostic catheter, … guidewire, … distal embolic protection filter, … mm predilatation balloon, … mm × … mm self-expanding stent, … mm postdilatation balloon.
Procedure details:
Aortic arch angiography and selective … common carotid angiography with assessment of the intracranial circulation were performed. There is a … stenosis of the … internal carotid artery at the bulb, … mm long, … by NASCET. Heparin … IU was given intravenously (ACT … s). The guiding catheter was positioned in the common carotid artery. The protection filter was advanced across the stenosis and deployed in the straight cervical segment of the internal carotid artery. Predilatation with a … mm balloon was followed by deployment of a … mm × … mm self-expanding stent covering the stenosis from the common carotid into the internal carotid artery. Postdilatation was performed with a … mm balloon. Atropine … mg was given intravenously before postdilatation. The filter was retrieved with a recovery catheter. Final angiography showed good stent expansion, …% residual stenosis, no dissection and no new filling defects in the intracranial circulation compared with baseline.
Result: successful stenting of the … internal carotid artery, …% residual stenosis, normal intracranial flow.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy (… and …) for … months, then single agent; blood pressure monitoring (risk of hypotension / hyperperfusion); neurological observation; follow-up Doppler ultrasound in … months.

Conclusion:
- Successful … internal carotid artery stenting with distal embolic protection; …% residual stenosis, no neurological complications.`,
  },
  {
    id: 'neuro2_cas_emergent', title: 'Stentowanie t. szyjnej w trybie pilnym (tandem / udar)', titleEn: 'Emergent carotid stenting (tandem lesion / stroke)',
    group: 'Neuro', section: 'Carotid / Vertebral', priority: 20,
    proc: ['carotid_stenting', 'stent', 'stroke_thrombectomy', 'thrombectomy'], anat: ['neck', 'brain'],
    text: `Badanie: Pilne stentowanie tętnicy szyjnej wewnętrznej w ostrym udarze niedokrwiennym (zmiana tandemowa)

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, niedrożność / krytyczne zwężenie tętnicy szyjnej wewnętrznej … z zatorem w …; tromboliza dożylna: ….
Lokalizacja: tętnica szyjna wewnętrzna … (odcinek szyjny) oraz ….
Znieczulenie: … (sedacja świadoma / znieczulenie ogólne).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący z balonem okluzyjnym / długa koszulka … F, mikrocewnik …, mikroprowadnik …, balon … mm, stent samorozprężalny … mm × … mm, stent-retriever … mm × … mm / cewnik aspiracyjny … F.
Przebieg zabiegu:
Angiografia tętnicy szyjnej wspólnej … wykazała … (niedrożność / krytyczne zwężenie) proksymalnego odcinka tętnicy szyjnej wewnętrznej …, najpewniej o etiologii miażdżycowej / dyssekcyjnej. Zmianę pokonano prowadnikiem, wykonano angioplastykę balonem … mm, uzyskując drożność pozwalającą na przeprowadzenie systemu do krążenia wewnątrzczaszkowego. Angiografia wewnątrzczaszkowa uwidoczniła niedrożność …. Wykonano trombektomię mechaniczną techniką … (stent-retriever / aspiracja / technika łączona), … przejść, uzyskując reperfuzję eTICI …. Następnie implantowano stent samorozprężalny … mm × … mm w odcinku szyjnym tętnicy szyjnej wewnętrznej. Podano … (lek przeciwpłytkowy dożylnie / doustnie) zgodnie z protokołem ośrodka. Kontrolna angiografia: stent prawidłowo rozprężony, drożny, przepływ wewnątrzczaszkowy eTICI …, bez cech zatorowości dystalnej do nowych obszarów.
Wynik: przywrócenie drożności tętnicy szyjnej wewnętrznej … (stent) i reperfuzja wewnątrzczaszkowa eTICI ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja na oddziale udarowym, ścisła kontrola ciśnienia tętniczego (docelowo …), TK głowy po … h przed włączeniem / kontynuacją leczenia przeciwpłytkowego, następnie podwójna terapia przeciwpłytkowa wg decyzji neurologa.

Wnioski:
- Pilne stentowanie tętnicy szyjnej wewnętrznej … w zmianie tandemowej z trombektomią mechaniczną …; reperfuzja eTICI ….`,
    textEn: `Procedure: Emergent internal carotid artery stenting in acute ischaemic stroke (tandem lesion)

Findings:
Indication: acute ischaemic stroke, NIHSS …, occlusion / critical stenosis of the … internal carotid artery with embolic occlusion of …; intravenous thrombolysis: ….
Target: … internal carotid artery (cervical segment) and ….
Anaesthesia: … (conscious sedation / general anaesthesia).
Access: … common femoral artery, … F sheath.
Devices: … F balloon guide catheter / long sheath, … microcatheter, … microwire, … mm balloon, … mm × … mm self-expanding stent, … mm × … mm stent-retriever / … F aspiration catheter.
Procedure details:
… common carotid angiography showed … (occlusion / critical stenosis) of the proximal … internal carotid artery, most likely atherosclerotic / dissection. The lesion was crossed with a guidewire and balloon angioplasty with a … mm balloon was performed to allow passage of the system into the intracranial circulation. Intracranial angiography showed occlusion of …. Mechanical thrombectomy was performed using … (stent-retriever / aspiration / combined technique), … passes, achieving eTICI … reperfusion. A … mm × … mm self-expanding stent was then deployed in the cervical internal carotid artery. … (antiplatelet agent, intravenous / oral) was given according to local protocol. Final angiography: stent well expanded and patent, intracranial flow eTICI …, no embolisation to new territories.
Result: restored patency of the … internal carotid artery (stented) and eTICI … intracranial reperfusion.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit observation, strict blood pressure control (target …), CT head at … h before starting / continuing antiplatelet therapy, then dual antiplatelet therapy as decided by the neurologist.

Conclusion:
- Emergent … internal carotid artery stenting for a tandem lesion with mechanical thrombectomy of …; eTICI … reperfusion.`,
  },
  {
    id: 'neuro2_vert_origin_stent', title: 'Stentowanie ujścia tętnicy kręgowej', titleEn: 'Vertebral artery origin stenting',
    group: 'Neuro', section: 'Carotid / Vertebral', priority: 30,
    proc: ['stent', 'pta'], anat: ['neck'],
    text: `Badanie: Angioplastyka ze stentowaniem ujścia tętnicy kręgowej

Opis:
Wskazanie: objawowe zwężenie ujścia tętnicy kręgowej … (…%), ….
Lokalizacja: tętnica kręgowa …, odcinek V1 (ujście).
Znieczulenie: miejscowe.
Dostęp: tętnica udowa wspólna … / tętnica promieniowa …, koszulka … F.
Sprzęt: cewnik prowadzący … F, prowadnik …, stent balonorozprężalny … mm × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy podobojczykowej … oraz obu tętnic kręgowych z oceną krążenia tylnego. Uwidoczniono … zwężenie ujścia tętnicy kręgowej …, stopnia …%; przeciwstronna tętnica kręgowa …. Podano heparynę … j.m. dożylnie. Cewnik prowadzący umieszczono w tętnicy podobojczykowej przy ujściu tętnicy kręgowej. Zwężenie pokonano mikroprowadnikiem, który umieszczono w odcinku V2. Implantowano stent balonorozprężalny … mm × … mm, z niewielkim wysunięciem (… mm) do światła tętnicy podobojczykowej. Kontrolna angiografia wykazała prawidłowe rozprężenie stentu, resztkowe zwężenie …%, bez dyssekcji, prawidłowe wypełnienie tętnicy podstawnej.
Wynik: skuteczne stentowanie ujścia tętnicy kręgowej …, resztkowe zwężenie …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa przez … miesięcy, następnie monoterapia; kontrola miejsca wkłucia; badanie kontrolne (USG dopplerowskie / angio-TK) za … miesięcy.

Wnioski:
- Skuteczne stentowanie ujścia tętnicy kręgowej …; resztkowe zwężenie …%.`,
    textEn: `Procedure: Vertebral artery origin angioplasty and stenting

Findings:
Indication: symptomatic … vertebral artery origin stenosis (…%), ….
Target: … vertebral artery, V1 segment (origin).
Anaesthesia: local.
Access: … common femoral artery / … radial artery, … F sheath.
Devices: … F guiding catheter, … guidewire, … mm × … mm balloon-expandable stent.
Procedure details:
… subclavian and bilateral vertebral angiography with assessment of the posterior circulation was performed. There is a … stenosis of the … vertebral artery origin, …%; the contralateral vertebral artery is …. Heparin … IU was given intravenously. The guiding catheter was positioned in the subclavian artery at the vertebral origin. The lesion was crossed with a … guidewire parked in the V2 segment. A … mm × … mm balloon-expandable stent was deployed with slight (… mm) protrusion into the subclavian artery. Final angiography showed good stent expansion, …% residual stenosis, no dissection and normal filling of the basilar artery.
Result: successful … vertebral artery origin stenting, …% residual stenosis.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy for … months, then single agent; access site observation; follow-up imaging (Doppler ultrasound / CT angiography) in … months.

Conclusion:
- Successful … vertebral artery origin stenting; …% residual stenosis.`,
  },
  {
    id: 'neuro2_icas_stent', title: 'Angioplastyka / stentowanie zwężenia wewnątrzczaszkowego', titleEn: 'Intracranial stenosis angioplasty / stenting',
    group: 'Neuro', section: 'Carotid / Vertebral', priority: 40,
    proc: ['intracranial_stenting', 'pta', 'stent'], anat: ['brain'],
    text: `Badanie: Angioplastyka balonowa ± stentowanie miażdżycowego zwężenia tętnicy wewnątrzczaszkowej

Opis:
Wskazanie: objawowe miażdżycowe zwężenie tętnicy wewnątrzczaszkowej … (…%) z nawracającymi objawami mimo optymalnego leczenia zachowawczego.
Lokalizacja: … (np. tętnica środkowa mózgu M1 / tętnica podstawna / odcinek V4 tętnicy kręgowej / odcinek wewnątrzczaszkowy tętnicy szyjnej wewnętrznej).
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik … (wymienny), balon do angioplastyki wewnątrzczaszkowej … mm × … mm, stent wewnątrzczaszkowy … mm × … mm.
Przebieg zabiegu:
Pacjent przygotowany podwójną terapią przeciwpłytkową (…); oceniono odpowiedź płytek: …. Podano heparynę … j.m. dożylnie (ACT … s). Angiografia … wykazała … zwężenie … długości … mm, stopnia …% (wg WASID), z … krążeniem obocznym. Zwężenie pokonano mikroprowadnikiem, który umieszczono w dystalnej gałęzi …. Wykonano powolną, submaksymalną angioplastykę balonem … mm × … mm do ciśnienia … atm. Następnie implantowano stent … mm × … mm obejmujący zwężenie. Kontrolna angiografia po … min wykazała resztkowe zwężenie …%, drożność gałęzi perforujących / odgałęzień …, bez dyssekcji, bez ekstrawazacji i bez zatorów dystalnych.
Wynik: poszerzenie zwężenia … z …% do …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontynuacja podwójnej terapii przeciwpłytkowej przez … miesięcy, statyna, ścisła kontrola ciśnienia tętniczego (unikanie hipertensji), obserwacja neurologiczna, kontrolna angio-TK / DSA za … miesięcy.

Wnioski:
- Angioplastyka … ze stentowaniem objawowego zwężenia …; resztkowe zwężenie …%.`,
    textEn: `Procedure: Balloon angioplasty ± stenting of an atherosclerotic intracranial arterial stenosis

Findings:
Indication: symptomatic … intracranial atherosclerotic stenosis (…%) with recurrent symptoms despite optimal medical therapy.
Target: … (e.g. middle cerebral artery M1 / basilar artery / V4 vertebral artery / intracranial internal carotid artery).
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … F intermediate catheter, … microcatheter, … exchange-length microwire, … mm × … mm intracranial angioplasty balloon, … mm × … mm intracranial stent.
Procedure details:
The patient was pre-treated with dual antiplatelet therapy (…); platelet function testing: …. Heparin … IU was given intravenously (ACT … s). … angiography showed a … stenosis of the …, … mm long, …% (WASID method), with … collateral supply. The stenosis was crossed with a microwire parked in a distal branch of the …. Slow, submaximal angioplasty was performed with a … mm × … mm balloon to … atm. A … mm × … mm stent was then deployed across the stenosis. Control angiography after … min showed …% residual stenosis, patent perforators / branches …, no dissection, no extravasation and no distal emboli.
Result: improvement of the … stenosis from …% to …%.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: continue dual antiplatelet therapy for … months, statin, strict blood pressure control (avoid hypertension), neurological observation, follow-up CT angiography / DSA in … months.

Conclusion:
- Angioplasty and stenting of a symptomatic … stenosis; …% residual stenosis.`,
  },
  {
    id: 'neuro2_dissection_stent', title: 'Stentowanie rozwarstwienia tętnicy szyjnej wewnętrznej', titleEn: 'Stenting of internal carotid artery dissection',
    group: 'Neuro', section: 'Carotid / Vertebral', priority: 50,
    proc: ['carotid_stenting', 'stent'], anat: ['neck'],
    text: `Badanie: Stentowanie rozwarstwienia tętnicy szyjnej wewnętrznej

Opis:
Wskazanie: rozwarstwienie tętnicy szyjnej wewnętrznej … z … (krytycznym zwężeniem / niedrożnością / tętniakiem rozwarstwiającym / objawami niedokrwienia mimo leczenia zachowawczego).
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek szyjny (C1).
Znieczulenie: … (miejscowe z sedacją / ogólne).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, stent samorozprężalny … mm × … mm (…).
Przebieg zabiegu:
Angiografia tętnicy szyjnej wspólnej … wykazała rozwarstwienie tętnicy szyjnej wewnętrznej … zaczynające się ok. … mm powyżej rozwidlenia, z … (zwężeniem światła rzekomym kanałem / obrazem „płomienia” / tętniakiem rozwarstwiającym …), sięgające do …. Krążenie wewnątrzczaszkowe: …. Podano heparynę … j.m. dożylnie. Pod kontrolą mapy drogowej mikroprowadnik i mikrocewnik przeprowadzono przez rozwarstwiony odcinek do światła prawdziwego, co potwierdzono podaniem kontrastu przez mikrocewnik dystalnie od rozwarstwienia. Implantowano stent(y) samorozprężalny(e) … mm × … mm, pokrywając cały rozwarstwiony odcinek od dystalnego końca rozwarstwienia w kierunku proksymalnym. Kontrolna angiografia: przywrócone prawidłowe światło tętnicy, prawidłowe rozprężenie stentu, bez wypełniania kanału rzekomego, prawidłowy przepływ wewnątrzczaszkowy.
Wynik: skuteczne pokrycie rozwarstwienia stentem, odtworzenie światła tętnicy szyjnej wewnętrznej ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa przez … miesięcy, kontrola ciśnienia tętniczego, obserwacja neurologiczna, kontrolne badanie obrazowe (USG dopplerowskie / angio-TK / angio-MR) za … miesięcy.

Wnioski:
- Stentowanie rozwarstwienia tętnicy szyjnej wewnętrznej …; przywrócone prawidłowe światło naczynia.`,
    textEn: `Procedure: Stenting of internal carotid artery dissection

Findings:
Indication: … internal carotid artery dissection with … (critical stenosis / occlusion / dissecting aneurysm / ischaemic symptoms despite medical therapy).
Target: … internal carotid artery, cervical segment (C1).
Anaesthesia: … (local with sedation / general).
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … mm × … mm self-expanding stent (…).
Procedure details:
… common carotid angiography showed dissection of the … internal carotid artery starting approximately … mm above the bifurcation, with … (luminal narrowing by the false lumen / flame-shaped tapering / dissecting aneurysm …), extending to …. Intracranial circulation: …. Heparin … IU was given intravenously. Under roadmap guidance the microwire and microcatheter were advanced through the dissected segment into the true lumen, confirmed by contrast injection through the microcatheter distal to the dissection. … self-expanding stent(s) … mm × … mm were deployed covering the entire dissected segment, starting from its distal end and working proximally. Final angiography: restored normal arterial lumen, good stent expansion, no false lumen filling, normal intracranial flow.
Result: successful stent coverage of the dissection with restoration of the … internal carotid artery lumen.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy for … months, blood pressure control, neurological observation, follow-up imaging (Doppler ultrasound / CT angiography / MR angiography) in … months.

Conclusion:
- Stenting of … internal carotid artery dissection; normal lumen restored.`,
  },
  {
    id: 'neuro2_bavm_liquid', title: 'Embolizacja malformacji tętniczo-żylnej mózgu (płynny embolizat)', titleEn: 'Brain AVM embolization (liquid embolic)',
    group: 'Neuro', section: 'AVM / Fistula', priority: 10,
    proc: ['avm_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Embolizacja malformacji tętniczo-żylnej mózgu płynnym embolizatem

Opis:
Wskazanie: malformacja tętniczo-żylna mózgu …, Spetzler-Martin stopień …; … (stan po krwawieniu / padaczka / leczenie etapowe, etap …).
Lokalizacja: AVM … (płat …), zasilana z ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik kompatybilny z DMSO (z odczepialną końcówką) …, mikroprowadnik …, płynny embolizat niekohezyjny (kopolimer EVOH) …, DMSO.
Przebieg zabiegu:
Wykonano angiografię … (tętnic szyjnych wewnętrznych / zewnętrznych i kręgowych). Uwidoczniono AVM … o średnicy gniazda … mm, zasilaną z … (gałęzi tętnicy …), z drenażem żylnym … (powierzchownym / głębokim) do …. Cechy ryzyka: … (tętniak na tętnicy zasilającej / wewnątrzgniazdowy, zwężenie żyły drenującej …). Podano heparynę … j.m. dożylnie. Mikrocewnik wprowadzono selektywnie do tętnicy zasilającej … do pozycji wklinowanej przy gnieździe; superselektywna angiografia potwierdziła brak zaopatrywania prawidłowego miąższu (bez naczyń „en passage”). Po przepłukaniu mikrocewnika DMSO podano powoli płynny embolizat techniką „plug and push”, uzyskując penetrację gniazda …, bez przedostania się embolizatu do żyły drenującej. Mikrocewnik usunięto. Analogicznie zembolizowano … (kolejne tętnice zasilające). Kontrolna angiografia wykazała zmniejszenie gniazda o ok. …%, zachowany drenaż żylny, prawidłowe wypełnienie naczyń zaopatrujących zdrowy miąższ.
Wynik: częściowa / całkowita embolizacja AVM, ok. …% gniazda wyłączone z krążenia.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja na OIOM / oddziale neurochirurgicznym, ścisła kontrola ciśnienia tętniczego (normo- / łagodna hipotensja), TK głowy kontrolne …, kolejny etap leczenia: … (embolizacja / radiochirurgia / operacja).

Wnioski:
- Embolizacja AVM … płynnym embolizatem przez … tętnic(e) zasilające; wyłączenie ok. …% gniazda, drenaż żylny zachowany.`,
    textEn: `Procedure: Embolization of a brain arteriovenous malformation with liquid embolic agent

Findings:
Indication: … brain arteriovenous malformation, Spetzler-Martin grade …; … (previous haemorrhage / epilepsy / staged treatment, stage …).
Target: … AVM (… lobe), supplied by ….
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … F intermediate catheter, … DMSO-compatible (detachable-tip) microcatheter, … microwire, … non-adhesive liquid embolic agent (EVOH copolymer), DMSO.
Procedure details:
… angiography (internal / external carotid and vertebral arteries) was performed. There is a … AVM with a nidus of … mm, supplied by … (branches of the … artery), with … (superficial / deep) venous drainage into …. Risk features: … (flow-related / intranidal aneurysm, draining vein stenosis …). Heparin … IU was given intravenously. The microcatheter was navigated into the … feeder to a wedged position close to the nidus; superselective angiography confirmed no supply to normal brain (no en-passage vessels). After DMSO flush, the liquid embolic agent was injected slowly using a plug-and-push technique, achieving … nidal penetration without passage into the draining vein. The microcatheter was withdrawn. … (further feeders) were embolized in the same way. Final angiography showed approximately …% reduction of the nidus, preserved venous drainage and normal filling of vessels supplying normal brain.
Result: partial / complete AVM embolization, approximately …% of the nidus excluded.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ICU / neurosurgical observation, strict blood pressure control (normotension / mild hypotension), follow-up CT head …, next treatment step: … (embolization / radiosurgery / surgery).

Conclusion:
- Liquid embolic embolization of … AVM via … feeder(s); approximately …% nidal exclusion, venous drainage preserved.`,
  },
  {
    id: 'neuro2_bavm_presurgical', title: 'Przedoperacyjna embolizacja AVM mózgu', titleEn: 'Pre-surgical brain AVM embolization',
    group: 'Neuro', section: 'AVM / Fistula', priority: 20,
    proc: ['avm_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Przedoperacyjna embolizacja malformacji tętniczo-żylnej mózgu

Opis:
Wskazanie: AVM … przed planowaną resekcją neurochirurgiczną (termin operacji: …); cel – wyłączenie głębokich / trudno dostępnych chirurgicznie tętnic zasilających i zmniejszenie przepływu.
Lokalizacja: AVM … (płat …), Spetzler-Martin stopień ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, płynny embolizat … (kopolimer EVOH / klej cyjanoakrylowy z lipiodolem w stężeniu …) ± spirale odczepialne ….
Przebieg zabiegu:
Angiografia … uwidoczniła AVM … z gniazdem … mm, zasilaną z …, z drenażem do …. Podano heparynę … j.m. dożylnie. Superselektywnie cewnikowano tętnice zasilające: …. Po potwierdzeniu braku zaopatrywania prawidłowego miąższu wykonano embolizację …, zamykając dystalne odcinki tętnic zasilających wraz z przyległą częścią gniazda; żyły drenujące pozostawiono drożne. Kontrolna angiografia: wyłączenie zaopatrzenia z …, zmniejszenie przepływu przez gniazdo, ok. …% gniazda wyłączone, drenaż żylny zachowany.
Wynik: zamknięcie … tętnic zasilających AVM przed zabiegiem operacyjnym.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja na OIOM / oddziale neurochirurgicznym, ścisła kontrola ciśnienia tętniczego, resekcja AVM zgodnie z planem (…), TK głowy w razie pogorszenia stanu neurologicznego.

Wnioski:
- Przedoperacyjna embolizacja AVM …: zamknięto … tętnic(e) zasilające (…); zmniejszenie przepływu przez gniazdo.`,
    textEn: `Procedure: Pre-surgical embolization of a brain arteriovenous malformation

Findings:
Indication: … AVM before planned neurosurgical resection (scheduled …); aim – occlusion of deep / surgically inaccessible feeders and flow reduction.
Target: … AVM (… lobe), Spetzler-Martin grade ….
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … liquid embolic agent (EVOH copolymer / cyanoacrylate glue with lipiodol at … concentration) ± … detachable coils.
Procedure details:
… angiography showed a … AVM with a … mm nidus, supplied by …, draining into …. Heparin … IU was given intravenously. The following feeders were catheterised superselectively: …. After confirming no supply to normal brain, embolization with … was performed, occluding the distal feeders together with the adjacent part of the nidus; the draining veins were left patent. Final angiography: exclusion of supply from …, reduced flow through the nidus, approximately …% of the nidus excluded, venous drainage preserved.
Result: occlusion of … AVM feeders before surgery.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ICU / neurosurgical observation, strict blood pressure control, AVM resection as planned (…), CT head if neurological deterioration.

Conclusion:
- Pre-surgical embolization of … AVM: … feeder(s) (…) occluded; reduced nidal flow.`,
  },
  {
    id: 'neuro2_davf_transarterial', title: 'Embolizacja przetoki oponowej (dAVF) – dostęp tętniczy', titleEn: 'Dural AV fistula embolization – transarterial',
    group: 'Neuro', section: 'AVM / Fistula', priority: 30,
    proc: ['davf_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Przeztętnicza embolizacja oponowej przetoki tętniczo-żylnej płynnym embolizatem

Opis:
Wskazanie: oponowa przetoka tętniczo-żylna …, Cognard typ … / Borden typ …, … (szum uszny / krwawienie / objawy neurologiczne / refluks do żył korowych).
Lokalizacja: … (np. zatoka poprzeczna-esowata / namiot móżdżku / sitowie / zatoka strzałkowa górna).
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik kompatybilny z DMSO (z odczepialną końcówką) …, mikroprowadnik …, płynny embolizat niekohezyjny (kopolimer EVOH) …, DMSO; ewentualnie balon zabezpieczający zatokę ….
Przebieg zabiegu:
Wykonano angiografię 6-naczyniową. Uwidoczniono oponową przetokę tętniczo-żylną w okolicy …, zasilaną z … (gałęzi tętnicy oponowej środkowej / potylicznej / gałęzi oponowych tętnicy szyjnej wewnętrznej / tętnicy kręgowej), z drenażem do …, … (z refluksem / bez refluksu do żył korowych). Podano heparynę … j.m. dożylnie. Mikrocewnik wprowadzono do … (np. gałęzi … tętnicy oponowej środkowej) możliwie blisko punktu przetoki. Po wykluczeniu połączeń niebezpiecznych (anastomoz z tętnicą szyjną wewnętrzną / kręgową, zaopatrzenia nerwów czaszkowych) podano płynny embolizat techniką „plug and push”, uzyskując penetrację przez punkt przetoki do proksymalnego odcinka żyły drenującej / …. Kontrolna angiografia ze wszystkich naczyń zasilających: … (całkowite wyłączenie przetoki / szczątkowe wypełnianie z …), brak refluksu do żył korowych, prawidłowy drenaż żylny mózgowia.
Wynik: … (całkowite / częściowe) wyłączenie przetoki oponowej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna, ocena nerwów czaszkowych, leczenie przeciwbólowe, kontrolna DSA / angio-MR za … miesięcy.

Wnioski:
- Przeztętnicza embolizacja oponowej przetoki tętniczo-żylnej … (Cognard …) płynnym embolizatem przez …; … wyłączenie przetoki.`,
    textEn: `Procedure: Transarterial embolization of a dural arteriovenous fistula with liquid embolic agent

Findings:
Indication: … dural arteriovenous fistula, Cognard type … / Borden type …, … (pulsatile tinnitus / haemorrhage / neurological deficit / cortical venous reflux).
Target: … (e.g. transverse-sigmoid sinus / tentorium / ethmoidal / superior sagittal sinus).
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … DMSO-compatible (detachable-tip) microcatheter, … microwire, … non-adhesive liquid embolic agent (EVOH copolymer), DMSO; optional sinus-protection balloon ….
Procedure details:
Six-vessel angiography was performed. There is a dural arteriovenous fistula at the …, supplied by … (middle meningeal / occipital branches / meningeal branches of the internal carotid / vertebral artery), draining into …, … (with / without cortical venous reflux). Heparin … IU was given intravenously. The microcatheter was navigated into … (e.g. … branch of the middle meningeal artery) as close as possible to the fistulous point. After excluding dangerous anastomoses (with the internal carotid / vertebral artery) and cranial nerve supply, the liquid embolic agent was injected using a plug-and-push technique, penetrating through the fistulous point into the proximal draining vein / …. Final angiography of all feeding vessels: … (complete occlusion / residual filling from …), no cortical venous reflux, normal cerebral venous drainage.
Result: … (complete / partial) occlusion of the dural fistula.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation including cranial nerve assessment, analgesia, follow-up DSA / MR angiography in … months.

Conclusion:
- Transarterial liquid embolic embolization of … dural AV fistula (Cognard …) via …; … occlusion of the fistula.`,
  },
  {
    id: 'neuro2_davf_transvenous', title: 'Embolizacja przetoki oponowej (dAVF) – dostęp żylny', titleEn: 'Dural AV fistula embolization – transvenous',
    group: 'Neuro', section: 'AVM / Fistula', priority: 40,
    proc: ['davf_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Przezżylna embolizacja oponowej przetoki tętniczo-żylnej

Opis:
Wskazanie: oponowa przetoka tętniczo-żylna …, Cognard typ …, z drenażem do izolowanego / niefunkcjonalnego segmentu zatoki ….
Lokalizacja: … (np. zatoka poprzeczna-esowata … / zatoka skalista dolna / zatoka jamista).
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (cewnik diagnostyczny … F) oraz żyła udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne …, ± płynny embolizat ….
Przebieg zabiegu:
Angiografia z dostępu tętniczego uwidoczniła oponową przetokę tętniczo-żylną … zasilaną z …, z drenażem do … segmentu zatoki …; segment ten nie uczestniczy w prawidłowym drenażu żylnym mózgowia (potwierdzone w fazie żylnej). Podano heparynę … j.m. dożylnie. Cewnik prowadzący wprowadzony drogą żyły szyjnej wewnętrznej … umieszczono w …, a mikrocewnik przeprowadzono do zajętego segmentu zatoki w miejscu przetoki (potwierdzono angiografią przez mikrocewnik / z dostępu tętniczego). Wykonano gęste upakowanie segmentu zatoki spiralami odczepialnymi (… szt.) ± płynny embolizat …, od punktu przetoki w kierunku proksymalnym. Kontrolna angiografia z naczyń zasilających: … (całkowite wyłączenie przetoki), brak refluksu do żył korowych, prawidłowy drenaż żylny mózgowia przez ….
Wynik: … (całkowite / częściowe) wyłączenie przetoki przez okluzję segmentu zatoki ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna, kontrola miejsc wkłucia, leczenie przeciwkrzepliwe: … (wg decyzji zespołu), kontrolna DSA / angio-MR za … miesięcy.

Wnioski:
- Przezżylna embolizacja oponowej przetoki … przez okluzję segmentu zatoki … spiralami ± płynnym embolizatem; … wyłączenie przetoki.`,
    textEn: `Procedure: Transvenous embolization of a dural arteriovenous fistula

Findings:
Indication: … dural arteriovenous fistula, Cognard type …, draining into an isolated / non-functional segment of the … sinus.
Target: … (e.g. … transverse-sigmoid sinus / inferior petrosal sinus / cavernous sinus).
Anaesthesia: general.
Access: … common femoral artery (… F diagnostic catheter) and … common femoral vein (… F sheath).
Devices: … F guiding catheter, … microcatheter, … microwire, … detachable coils, ± … liquid embolic agent.
Procedure details:
Arterial angiography showed a … dural arteriovenous fistula supplied by …, draining into the … segment of the … sinus; this segment does not participate in normal cerebral venous drainage (confirmed on the venous phase). Heparin … IU was given intravenously. Via the … internal jugular vein the guiding catheter was positioned in the …, and the microcatheter was navigated into the affected sinus segment at the fistula site (confirmed by microcatheter / arterial angiography). The sinus segment was densely packed with detachable coils (… coils) ± … liquid embolic agent, working from the fistulous point proximally. Final angiography of the feeding vessels: … (complete fistula occlusion), no cortical venous reflux, normal cerebral venous drainage via ….
Result: … (complete / partial) occlusion of the fistula by occlusion of the … sinus segment.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation, access site care, anticoagulation: … (as decided by the team), follow-up DSA / MR angiography in … months.

Conclusion:
- Transvenous embolization of … dural AV fistula by occlusion of the … sinus segment with coils ± liquid embolic agent; … occlusion of the fistula.`,
  },
  {
    id: 'neuro2_ccf_direct', title: 'Embolizacja bezpośredniej przetoki szyjno-jamistej', titleEn: 'Direct carotid-cavernous fistula embolization',
    group: 'Neuro', section: 'AVM / Fistula', priority: 50,
    proc: ['davf_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Embolizacja bezpośredniej przetoki szyjno-jamistej (Barrow typ A)

Opis:
Wskazanie: bezpośrednia przetoka szyjno-jamista … (pourazowa / samoistna, po pęknięciu tętniaka) z … (wytrzeszczem tętniącym / chemozą / porażeniem nerwów okoruchowych / pogorszeniem ostrości wzroku).
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek jamisty; zatoka jamista ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F; ± żyła udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne …, ± płynny embolizat …, ± balon remodelujący / stent pokryty / stent przekierowujący przepływ ….
Przebieg zabiegu:
Angiografia tętnicy szyjnej wewnętrznej … wykazała szybkoprzepływową bezpośrednią przetokę z odcinka jamistego do zatoki jamistej …, z drenażem do … (żyły ocznej górnej / zatoki skalistej dolnej / żył korowych). Ubytek ściany zlokalizowano … (z pomocą angiografii z wolniejszym podaniem kontrastu / kompresji tętnicy szyjnej / angiografii tętnicy kręgowej). Ocena krążenia obocznego przez koło Willisa: …. Podano heparynę … j.m. dożylnie. Mikrocewnik przeprowadzono przez ubytek ściany tętnicy do zatoki jamistej (dostęp przeztętniczy) / wprowadzono drogą … do zatoki jamistej (dostęp przezżylny). Wypełniono zatokę jamistą po stronie przetoki spiralami odczepialnymi (… szt.) ± płynnym embolizatem, przy ochronie światła tętnicy szyjnej wewnętrznej balonem …. Kontrolna angiografia: wyłączenie przetoki, zachowana drożność tętnicy szyjnej wewnętrznej …, brak drenażu do żyły ocznej górnej i żył korowych.
Wynik: całkowite wyłączenie przetoki szyjno-jamistej z zachowaniem drożności tętnicy szyjnej wewnętrznej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna i okulistyczna (ostrość wzroku, ciśnienie wewnątrzgałkowe, ruchomość gałek ocznych), leczenie … (przeciwpłytkowe – w razie implantacji stentu), kontrolna DSA za … miesięcy.

Wnioski:
- Embolizacja bezpośredniej przetoki szyjno-jamistej … spiralami ± płynnym embolizatem; całkowite wyłączenie przetoki, tętnica szyjna wewnętrzna drożna.`,
    textEn: `Procedure: Embolization of a direct carotid-cavernous fistula (Barrow type A)

Findings:
Indication: … direct carotid-cavernous fistula (traumatic / spontaneous, aneurysm rupture) with … (pulsatile proptosis / chemosis / ophthalmoplegia / declining visual acuity).
Target: … internal carotid artery, cavernous segment; … cavernous sinus.
Anaesthesia: general.
Access: … common femoral artery, … F sheath; ± … common femoral vein, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … detachable coils, ± … liquid embolic agent, ± remodelling balloon / covered stent / flow-diverting stent ….
Procedure details:
… internal carotid angiography showed a high-flow direct fistula from the cavernous segment into the … cavernous sinus, draining into … (superior ophthalmic vein / inferior petrosal sinus / cortical veins). The wall defect was localised … (slow injection / carotid compression / vertebral angiography). Collateral supply via the circle of Willis: …. Heparin … IU was given intravenously. The microcatheter was passed through the arterial wall defect into the cavernous sinus (transarterial route) / navigated via … into the cavernous sinus (transvenous route). The fistulous compartment of the cavernous sinus was packed with detachable coils (… coils) ± liquid embolic agent, with protection of the internal carotid lumen by a … balloon. Final angiography: fistula occluded, … internal carotid artery patent, no drainage into the superior ophthalmic vein or cortical veins.
Result: complete occlusion of the carotid-cavernous fistula with preservation of the internal carotid artery.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological and ophthalmological observation (visual acuity, intraocular pressure, eye movements), … (antiplatelet therapy if a stent was implanted), follow-up DSA in … months.

Conclusion:
- Embolization of … direct carotid-cavernous fistula with coils ± liquid embolic agent; complete occlusion, internal carotid artery patent.`,
  },
  {
    id: 'neuro2_ccf_indirect', title: 'Embolizacja pośredniej przetoki szyjno-jamistej (przezżylna)', titleEn: 'Indirect carotid-cavernous fistula embolization (transvenous)',
    group: 'Neuro', section: 'AVM / Fistula', priority: 60,
    proc: ['davf_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Przezżylna embolizacja pośredniej przetoki szyjno-jamistej

Opis:
Wskazanie: pośrednia (oponowa) przetoka szyjno-jamista …, Barrow typ …, z … (chemozą / wytrzeszczem / podwójnym widzeniem / wzrostem ciśnienia wewnątrzgałkowego).
Lokalizacja: zatoka jamista ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F) oraz żyła udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F, cewnik prowadzący … F (żylny), mikrocewnik …, mikroprowadnik …, spirale odczepialne …, ± płynny embolizat ….
Przebieg zabiegu:
Angiografia tętnic szyjnych wewnętrznych i zewnętrznych obustronnie wykazała pośrednią przetokę szyjno-jamistą … zasilaną z gałęzi oponowych tętnicy szyjnej wewnętrznej (…) oraz gałęzi tętnicy szyjnej zewnętrznej (…), z drenażem do … (żyły ocznej górnej / zatoki skalistej dolnej / żył korowych). Podano heparynę … j.m. dożylnie. Cewnik prowadzący umieszczono w żyle szyjnej wewnętrznej …; mikrocewnik przeprowadzono przez zatokę skalistą dolną … (alternatywnie: przez żyłę twarzową i żyłę oczną górną) do zatoki jamistej, w przedział zawierający punkt przetoki. Wykonano embolizację spiralami odczepialnymi (… szt.) ± płynnym embolizatem …, z uwzględnieniem ujścia żyły ocznej górnej. Kontrolna angiografia z tętnic zasilających: … (całkowite wyłączenie przetoki / szczątkowy przepływ z …), brak drenażu do żyły ocznej górnej i żył korowych.
Wynik: … (całkowite / prawie całkowite) wyłączenie pośredniej przetoki szyjno-jamistej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola okulistyczna (ostrość wzroku, ciśnienie wewnątrzgałkowe, ruchomość gałek ocznych), możliwe przemijające nasilenie objawów ocznych / porażenia nerwów okoruchowych, leczenie przeciwzapalne …, kontrolna DSA / angio-MR za … miesięcy.

Wnioski:
- Przezżylna embolizacja pośredniej przetoki szyjno-jamistej … (dostęp przez …) spiralami ± płynnym embolizatem; … wyłączenie przetoki.`,
    textEn: `Procedure: Transvenous embolization of an indirect carotid-cavernous fistula

Findings:
Indication: … indirect (dural) carotid-cavernous fistula, Barrow type …, with … (chemosis / proptosis / diplopia / raised intraocular pressure).
Target: … cavernous sinus.
Anaesthesia: general.
Access: … common femoral artery (… F sheath) and … common femoral vein (… F sheath).
Devices: … F diagnostic catheter, … F guiding catheter (venous), … microcatheter, … microwire, … detachable coils, ± … liquid embolic agent.
Procedure details:
Bilateral internal and external carotid angiography showed a … indirect carotid-cavernous fistula supplied by meningeal branches of the internal carotid artery (…) and external carotid branches (…), draining into … (superior ophthalmic vein / inferior petrosal sinus / cortical veins). Heparin … IU was given intravenously. The guiding catheter was positioned in the … internal jugular vein; the microcatheter was navigated via the … inferior petrosal sinus (alternatively: via the facial vein and superior ophthalmic vein) into the cavernous sinus compartment containing the fistulous point. Embolization was performed with detachable coils (… coils) ± … liquid embolic agent, including the origin of the superior ophthalmic vein. Final angiography of the feeding arteries: … (complete occlusion / residual flow from …), no drainage into the superior ophthalmic vein or cortical veins.
Result: … (complete / near-complete) occlusion of the indirect carotid-cavernous fistula.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ophthalmological review (visual acuity, intraocular pressure, eye movements), possible transient worsening of orbital symptoms / cranial nerve palsy, anti-inflammatory treatment …, follow-up DSA / MR angiography in … months.

Conclusion:
- Transvenous embolization of … indirect carotid-cavernous fistula (via …) with coils ± liquid embolic agent; … occlusion of the fistula.`,
  },
  {
    id: 'neuro2_spinal_davf', title: 'Embolizacja rdzeniowej przetoki oponowej (SDAVF)', titleEn: 'Spinal dural AV fistula embolization',
    group: 'Neuro', section: 'AVM / Fistula', priority: 70,
    proc: ['davf_embolization', 'embolization', 'spinal_angio'], anat: ['spine'],
    text: `Badanie: Angiografia rdzeniowa i embolizacja rdzeniowej oponowej przetoki tętniczo-żylnej

Opis:
Wskazanie: rdzeniowa oponowa przetoka tętniczo-żylna (cechy przekrwienia żylnego rdzenia w MR, poszerzone żyły okołordzeniowe) z postępującą mielopatią.
Lokalizacja: tętnica korzeniowo-oponowa … na poziomie … (Th… / L…), strona ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewniki diagnostyczne … F (…), mikrocewnik …, mikroprowadnik …, klej cyjanoakrylowy z lipiodolem (stężenie …) / płynny embolizat niekohezyjny (kopolimer EVOH) ….
Przebieg zabiegu:
Wykonano selektywną angiografię tętnic międzyżebrowych i lędźwiowych od poziomu … do …, tętnic biodrowych wewnętrznych oraz tętnic kręgowych. Uwidoczniono przetokę oponową zasilaną z gałęzi korzeniowo-oponowej tętnicy … na poziomie … po stronie …, z drenażem do poszerzonej żyły korzeniowej i splotu żył okołordzeniowych (…). Z tego samego / sąsiednich poziomów nie odchodzi tętnica rdzeniowa przednia (tętnica Adamkiewicza odchodzi na poziomie … po stronie …) ani tylno-boczna. Mikrocewnik wprowadzono możliwie dystalnie do gałęzi zasilającej. Podano płynny embolizat …, uzyskując penetrację przez punkt przetoki do proksymalnego odcinka żyły drenującej. Kontrolna angiografia z poziomu zasilającego oraz poziomów sąsiednich (… powyżej i poniżej): brak wypełniania przetoki i żył okołordzeniowych.
Wynik: całkowite wyłączenie rdzeniowej przetoki oponowej, embolizat w proksymalnym odcinku żyły drenującej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna (funkcja ruchowa, czucie, zwieracze), profilaktyka przeciwzakrzepowa wg decyzji zespołu, kontrolne MR za … miesięcy; w razie braku poprawy / nawrotu – kontrolna angiografia rdzeniowa.

Wnioski:
- Embolizacja rdzeniowej oponowej przetoki tętniczo-żylnej na poziomie … płynnym embolizatem z penetracją do żyły drenującej; całkowite wyłączenie przetoki.`,
    textEn: `Procedure: Spinal angiography and embolization of a spinal dural arteriovenous fistula

Findings:
Indication: spinal dural arteriovenous fistula (venous congestive oedema of the cord and dilated perimedullary veins on MRI) with progressive myelopathy.
Target: … radiculomeningeal artery at … (T… / L…), … side.
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F diagnostic catheters (…), … microcatheter, … microwire, cyanoacrylate glue with lipiodol (… concentration) / … non-adhesive liquid embolic agent (EVOH copolymer).
Procedure details:
Selective angiography of the intercostal and lumbar arteries from … to …, internal iliac arteries and vertebral arteries was performed. There is a dural fistula supplied by the radiculomeningeal branch of the … artery at … on the … side, draining into a dilated radicular vein and the perimedullary venous plexus (…). No anterior spinal artery (the artery of Adamkiewicz arises at … on the … side) or posterolateral spinal artery arises from the same or adjacent levels. The microcatheter was advanced as distally as possible into the feeding branch. The liquid embolic agent … was injected, penetrating through the fistulous point into the proximal draining vein. Control angiography of the feeding level and adjacent levels (… above and below): no residual filling of the fistula or perimedullary veins.
Result: complete occlusion of the spinal dural fistula, embolic agent in the proximal draining vein.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation (motor, sensory and sphincter function), thromboprophylaxis as decided by the team, follow-up MRI in … months; repeat spinal angiography if no improvement / recurrence.

Conclusion:
- Liquid embolic embolization of a spinal dural AV fistula at … with penetration into the draining vein; complete occlusion.`,
  },
  {
    id: 'neuro2_meningioma', title: 'Przedoperacyjna embolizacja oponiaka', titleEn: 'Pre-operative meningioma embolization',
    group: 'Neuro', section: 'Neuro tumour', priority: 10,
    proc: ['tumour_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Przedoperacyjna embolizacja oponiaka

Opis:
Wskazanie: oponiak … przed planowaną resekcją (termin operacji: …); cel – zmniejszenie śródoperacyjnej utraty krwi.
Lokalizacja: oponiak … (np. sklepistości / sierpu mózgu / skrzydła kości klinowej / przystrzałkowy), zasilany z gałęzi tętnicy szyjnej zewnętrznej ….
Znieczulenie: … (miejscowe z sedacją / ogólne).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm (PVA / mikrosfery), ± spirale … / płynny embolizat ….
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wewnętrznych i zewnętrznych … ± tętnic kręgowych. Uwidoczniono bogato unaczyniony guz … z typowym „promienistym” wzorem unaczynienia i przedłużonym zakontrastowaniem („mother-in-law sign”), zasilany głównie z … (tętnicy oponowej środkowej / tętnicy oponowej dodatkowej / gałęzi oponowych tętnicy potylicznej / tętnicy gardłowej wstępującej), z dodatkowym zaopatrzeniem piaskowym z … (gałęzi tętnicy szyjnej wewnętrznej / tętnic oponowych tętnicy kręgowej). Mikrocewnik wprowadzono superselektywnie do …; wykluczono niebezpieczne anastomozy z tętnicą szyjną wewnętrzną / oczną / kręgową oraz zaopatrzenie nerwów czaszkowych. Wykonano embolizację mikrocząstkami … µm w zawiesinie z kontrastem pod ciągłą kontrolą fluoroskopii, aż do zwolnienia przepływu / zaniku zakontrastowania guza z tej gałęzi. Analogicznie zembolizowano …. Kontrolna angiografia tętnicy szyjnej zewnętrznej: zanik ok. …% unaczynienia guza z zaopatrzenia zewnątrzoponowego; pozostałe zaopatrzenie z … (piaskowe, nieembolizowane).
Wynik: dewaskularyzacja oponiaka w ok. …% (zaopatrzenie z tętnicy szyjnej zewnętrznej).
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna (ryzyko obrzęku / krwawienia do guza), steroidy wg decyzji neurochirurga, leczenie przeciwbólowe, resekcja guza w ciągu … dni.

Wnioski:
- Przedoperacyjna embolizacja oponiaka … mikrocząstkami przez …; dewaskularyzacja ok. …%.`,
    textEn: `Procedure: Pre-operative meningioma embolization

Findings:
Indication: … meningioma before planned resection (scheduled …); aim – reduction of intraoperative blood loss.
Target: … meningioma (e.g. convexity / falcine / sphenoid wing / parasagittal), supplied by … external carotid branches.
Anaesthesia: … (local with sedation / general).
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … µm microparticles (PVA / microspheres), ± … coils / … liquid embolic agent.
Procedure details:
… internal and external carotid ± vertebral angiography was performed. There is a hypervascular … tumour with a typical sunburst vascular pattern and prolonged tumour blush ("mother-in-law sign"), supplied mainly by … (middle meningeal / accessory meningeal / occipital meningeal branches / ascending pharyngeal artery), with additional pial supply from … (internal carotid branches / vertebral meningeal branches). The microcatheter was advanced superselectively into …; dangerous anastomoses with the internal carotid / ophthalmic / vertebral artery and cranial nerve supply were excluded. Embolization with … µm microparticles suspended in contrast was performed under continuous fluoroscopy until flow slowed / the tumour blush from this branch disappeared. … was embolized in the same way. Final external carotid angiography: approximately …% reduction of tumour blush from the dural supply; residual supply from … (pial, not embolized).
Result: approximately …% devascularisation of the meningioma (external carotid supply).
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation (risk of tumour swelling / haemorrhage), steroids as decided by the neurosurgeon, analgesia, tumour resection within … days.

Conclusion:
- Pre-operative particle embolization of … meningioma via …; approximately …% devascularisation.`,
  },
  {
    id: 'neuro2_jna', title: 'Embolizacja młodzieńczego naczyniakowłókniaka nosogardła', titleEn: 'Juvenile nasopharyngeal angiofibroma embolization',
    group: 'Neuro', section: 'Neuro tumour', priority: 20,
    proc: ['tumour_embolization', 'embolization'], anat: ['neck', 'brain'],
    text: `Badanie: Przedoperacyjna embolizacja młodzieńczego naczyniakowłókniaka nosogardła

Opis:
Wskazanie: młodzieńczy naczyniakowłókniak nosogardła … (stopień zaawansowania …) przed planowaną resekcją endoskopową / chirurgiczną (termin: …).
Lokalizacja: nosogardło, dół skrzydłowo-podniebienny …, …; zaopatrzenie z tętnicy szczękowej … ± ….
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm (PVA / mikrosfery), ± spirale ….
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wewnętrznych i zewnętrznych obustronnie. Uwidoczniono bogato unaczyniony guz nosogardła …, zasilany z tętnicy szczękowej … (tętnica klinowo-podniebienna, tętnica podniebienna zstępująca), tętnicy gardłowej wstępującej …, …, z … zaopatrzeniem z tętnicy szyjnej wewnętrznej (tętnica Vidiusza / gałęzie pnia dolno-bocznego) oraz z naczyń strony przeciwległej. Mikrocewnik wprowadzono superselektywnie do dystalnej części tętnicy szczękowej …; wykluczono niebezpieczne anastomozy z tętnicą szyjną wewnętrzną / oczną. Wykonano embolizację mikrocząstkami … µm do ustania zakontrastowania guza. Analogicznie zembolizowano … (tętnica gardłowa wstępująca / naczynia strony przeciwległej). Kontrolna angiografia: zanik ok. …% unaczynienia guza; pozostałe zaopatrzenie z ….
Wynik: dewaskularyzacja guza w ok. …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja (ból twarzy, zaburzenia widzenia, objawy neurologiczne), leczenie przeciwbólowe, resekcja guza w ciągu … h / dni.

Wnioski:
- Przedoperacyjna embolizacja naczyniakowłókniaka nosogardła mikrocząstkami przez …; dewaskularyzacja ok. …%.`,
    textEn: `Procedure: Pre-operative embolization of a juvenile nasopharyngeal angiofibroma

Findings:
Indication: … juvenile nasopharyngeal angiofibroma (stage …) before planned endoscopic / surgical resection (scheduled …).
Target: nasopharynx, … pterygopalatine fossa, …; supply from the … maxillary artery ± ….
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … µm microparticles (PVA / microspheres), ± … coils.
Procedure details:
Bilateral internal and external carotid angiography was performed. There is a hypervascular nasopharyngeal tumour …, supplied by the … maxillary artery (sphenopalatine and descending palatine arteries), the … ascending pharyngeal artery, …, with … supply from the internal carotid artery (vidian artery / inferolateral trunk branches) and from contralateral vessels. The microcatheter was advanced superselectively into the distal … maxillary artery; dangerous anastomoses with the internal carotid / ophthalmic artery were excluded. Embolization with … µm microparticles was performed until disappearance of the tumour blush. … (ascending pharyngeal artery / contralateral vessels) was embolized in the same way. Final angiography: approximately …% reduction of tumour vascularity; residual supply from ….
Result: approximately …% tumour devascularisation.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observation (facial pain, visual disturbance, neurological symptoms), analgesia, tumour resection within … h / days.

Conclusion:
- Pre-operative particle embolization of a juvenile nasopharyngeal angiofibroma via …; approximately …% devascularisation.`,
  },
  {
    id: 'neuro2_paraganglioma', title: 'Embolizacja przyzwojaka (kłębek szyjny / jarzmowy)', titleEn: 'Paraganglioma embolization (carotid body / glomus)',
    group: 'Neuro', section: 'Neuro tumour', priority: 30,
    proc: ['tumour_embolization', 'embolization'], anat: ['neck', 'brain'],
    text: `Badanie: Przedoperacyjna embolizacja przyzwojaka

Opis:
Wskazanie: przyzwojak … (guz kłębka szyjnego / przyzwojak otworu szyjnego – glomus jugulare / przyzwojak jamy bębenkowej – glomus tympanicum / przyzwojak nerwu błędnego – glomus vagale) przed planowaną resekcją (termin: …); klasyfikacja … (Shamblin / Fisch) ….
Lokalizacja: … (rozwidlenie tętnicy szyjnej wspólnej / otwór szyjny / jama bębenkowa / przestrzeń przygardłowa) ….
Znieczulenie: … (miejscowe z sedacją / ogólne).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm (PVA / mikrosfery), ± płynny embolizat …, ± spirale ….
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wspólnych, wewnętrznych i zewnętrznych obustronnie oraz tętnic kręgowych. Uwidoczniono bogato unaczyniony guz …, zasilany głównie z … (tętnicy gardłowej wstępującej – gałęzi … / tętnicy potylicznej / tętnicy usznej tylnej / tętnicy szczękowej / gałęzi mięśniowych tętnicy kręgowej), z wczesnym drenażem żylnym. W przypadku guza kłębka szyjnego – rozsunięcie tętnic szyjnych wewnętrznej i zewnętrznej. Nie stwierdzono innych przyzwojaków / stwierdzono …. Mikrocewnik wprowadzono superselektywnie do …; wykluczono niebezpieczne anastomozy (z tętnicą szyjną wewnętrzną, kręgową, zaopatrzenie nerwów czaszkowych IX–XII i nerwu twarzowego). Wykonano embolizację mikrocząstkami … µm do zaniku zakontrastowania guza z tej gałęzi. Analogicznie zembolizowano …. Kontrolna angiografia tętnicy szyjnej wspólnej: zanik ok. …% unaczynienia guza, zachowana drożność tętnicy szyjnej wewnętrznej i głównych gałęzi tętnicy szyjnej zewnętrznej.
Wynik: dewaskularyzacja przyzwojaka w ok. …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie ciśnienia tętniczego i rytmu serca (guz czynny hormonalnie: …), ocena nerwów czaszkowych, leczenie przeciwbólowe, resekcja guza w ciągu … dni.

Wnioski:
- Przedoperacyjna embolizacja przyzwojaka … mikrocząstkami przez …; dewaskularyzacja ok. …%.`,
    textEn: `Procedure: Pre-operative paraganglioma embolization

Findings:
Indication: … paraganglioma (carotid body tumour / glomus jugulare / glomus tympanicum / glomus vagale) before planned resection (scheduled …); … classification (Shamblin / Fisch) ….
Target: … (common carotid bifurcation / jugular foramen / middle ear / parapharyngeal space) ….
Anaesthesia: … (local with sedation / general).
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … µm microparticles (PVA / microspheres), ± … liquid embolic agent, ± … coils.
Procedure details:
Bilateral common, internal and external carotid and vertebral angiography was performed. There is a hypervascular … tumour, supplied mainly by … (ascending pharyngeal artery – … branch / occipital / posterior auricular / maxillary artery / muscular branches of the vertebral artery), with early venous drainage. For a carotid body tumour – splaying of the internal and external carotid arteries. No other paragangliomas were identified / … was identified. The microcatheter was advanced superselectively into …; dangerous anastomoses (with the internal carotid and vertebral arteries, supply to cranial nerves IX–XII and the facial nerve) were excluded. Embolization with … µm microparticles was performed until disappearance of the tumour blush from this branch. … was embolized in the same way. Final common carotid angiography: approximately …% reduction of tumour vascularity, internal carotid artery and main external carotid branches patent.
Result: approximately …% devascularisation of the paraganglioma.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: blood pressure and heart rhythm monitoring (secretory tumour: …), cranial nerve assessment, analgesia, tumour resection within … days.

Conclusion:
- Pre-operative particle embolization of … paraganglioma via …; approximately …% devascularisation.`,
  },
  {
    id: 'neuro2_spinal_tumour', title: 'Przedoperacyjna embolizacja guza kręgosłupa', titleEn: 'Pre-operative spinal tumour embolization',
    group: 'Neuro', section: 'Neuro tumour', priority: 40,
    proc: ['tumour_embolization', 'embolization', 'spinal_angio'], anat: ['spine'],
    text: `Badanie: Angiografia rdzeniowa i przedoperacyjna embolizacja guza kręgosłupa

Opis:
Wskazanie: bogato unaczyniony guz kręgosłupa … (np. przerzut raka nerki / tarczycy, naczyniak, …) na poziomie … przed planowaną operacją (termin: …).
Lokalizacja: trzon / łuk kręgu … (Th… / L…), zaopatrzenie z tętnic międzyżebrowych / lędźwiowych ….
Znieczulenie: … (miejscowe z sedacją / ogólne).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewniki diagnostyczne … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm (PVA / mikrosfery), ± spirale … / płynny embolizat ….
Przebieg zabiegu:
Wykonano selektywną angiografię tętnic międzyżebrowych / lędźwiowych na poziomie guza oraz … poziomów powyżej i poniżej, obustronnie. Uwidoczniono bogato unaczyniony guz kręgu … zasilany z … (tętnic segmentalnych … po stronie …). Zidentyfikowano tętnicę rdzeniową przednią (tętnica Adamkiewicza odchodzi z tętnicy … na poziomie … po stronie …); z tętnic zasilających guz nie stwierdzono odejścia tętnic zaopatrujących rdzeń. Mikrocewnik wprowadzono superselektywnie, dystalnie do odejścia gałęzi grzbietowo-rdzeniowych, i wykonano embolizację mikrocząstkami … µm do zaniku zakontrastowania guza. Analogicznie zembolizowano …. Pnie tętnic segmentalnych proksymalnie zamknięto spiralami … (opcjonalnie). Kontrolna angiografia: zanik ok. …% unaczynienia guza, tętnica rdzeniowa przednia prawidłowo wypełniona.
Wynik: dewaskularyzacja guza kręgu … w ok. …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna (funkcja ruchowa i czuciowa kończyn dolnych, zwieracze), leczenie przeciwbólowe, operacja w ciągu … h / dni.

Wnioski:
- Przedoperacyjna embolizacja guza kręgu … przez … tętnic(e) segmentalne; dewaskularyzacja ok. …%, bez zaopatrzenia rdzenia z naczyń embolizowanych.`,
    textEn: `Procedure: Spinal angiography and pre-operative spinal tumour embolization

Findings:
Indication: hypervascular spinal tumour … (e.g. renal / thyroid metastasis, haemangioma, …) at … before planned surgery (scheduled …).
Target: vertebral body / posterior elements of … (T… / L…), supplied by … intercostal / lumbar arteries.
Anaesthesia: … (local with sedation / general).
Access: … common femoral artery, … F sheath.
Devices: … F diagnostic catheters, … microcatheter, … microwire, … µm microparticles (PVA / microspheres), ± … coils / … liquid embolic agent.
Procedure details:
Selective bilateral angiography of the intercostal / lumbar arteries at the tumour level and … levels above and below was performed. There is a hypervascular tumour of … supplied by … (… segmental arteries on the … side). The anterior spinal artery was identified (the artery of Adamkiewicz arises from the … artery at … on the … side); no spinal cord supply arises from the tumour feeders. The microcatheter was advanced superselectively, distal to the dorsospinal branches, and embolization with … µm microparticles was performed until disappearance of the tumour blush. … was embolized in the same way. The segmental artery trunks were optionally occluded proximally with … coils. Final angiography: approximately …% reduction of tumour vascularity, anterior spinal artery fills normally.
Result: approximately …% devascularisation of the … vertebral tumour.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation (lower limb motor and sensory function, sphincters), analgesia, surgery within … h / days.

Conclusion:
- Pre-operative embolization of … vertebral tumour via … segmental artery(ies); approximately …% devascularisation, no spinal cord supply from the embolized vessels.`,
  },
  {
    id: 'neuro2_vasospasm_ia', title: 'Dotętnicze podanie nimodypiny w skurczu naczyń po SAH', titleEn: 'Intra-arterial nimodipine for vasospasm after SAH',
    group: 'Neuro', section: 'Vasospasm', priority: 10,
    proc: ['vasospasm', 'neuro_angio'], anat: ['brain'],
    text: `Badanie: Angiografia mózgowa z dotętniczym wlewem leku rozszerzającego naczynia (nimodypina / …) w skurczu naczyń

Opis:
Wskazanie: objawowy skurcz naczyń mózgowych w … dobie po krwotoku podpajęczynówkowym z pękniętego tętniaka … (leczonego …); … (pogorszenie neurologiczne / wzrost prędkości w TCD / deficyt perfuzji w TK).
Lokalizacja: … (tętnica szyjna wewnętrzna … / tętnica środkowa mózgu … / tętnica przednia mózgu … / tętnica podstawna).
Znieczulenie: … (sedacja / ogólne – pacjent zaintubowany).
Dostęp: tętnica udowa wspólna … / tętnica promieniowa …, koszulka … F.
Sprzęt: cewnik diagnostyczny / prowadzący … F, ± mikrocewnik …, pompa infuzyjna.
Przebieg zabiegu:
Wykonano angiografię …. Uwidoczniono … (łagodny / umiarkowany / ciężki) skurcz … (odcinków … tętnic …), z wydłużeniem czasu krążenia mózgowego. Zaopatrzony tętniak … bez cech nawrotu / ….
Cewnik umieszczono w … (odcinku szyjnym tętnicy szyjnej wewnętrznej … / tętnicy kręgowej …) i podano powolnym wlewem nimodypinę w dawce … mg w … ml, w ciągu … min, przy monitorowaniu ciśnienia tętniczego i ciśnienia śródczaszkowego. Procedurę powtórzono w …. Kontrolna angiografia: poszerzenie światła … tętnic, poprawa przepływu i skrócenie czasu krążenia.
Wynik: … (istotna / umiarkowana) poprawa średnicy naczyń objętych skurczem.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontynuacja leczenia na OIOM, utrzymanie normowolemii i docelowego ciśnienia tętniczego …, monitorowanie TCD / ocena neurologiczna; w razie nawrotu objawów – rozważenie powtórnej angiografii z wlewem dotętniczym / angioplastyki balonowej.

Wnioski:
- Skurcz naczyń … po SAH; dotętniczy wlew nimodypiny (… mg) do … z poprawą średnicy naczyń.`,
    textEn: `Procedure: Cerebral angiography with intra-arterial vasodilator infusion (nimodipine / …) for vasospasm

Findings:
Indication: symptomatic cerebral vasospasm on day … after subarachnoid haemorrhage from a ruptured … aneurysm (treated by …); … (neurological deterioration / raised TCD velocities / perfusion deficit on CT).
Target: … (… internal carotid artery / … middle cerebral artery / … anterior cerebral artery / basilar artery).
Anaesthesia: … (sedation / general – patient intubated).
Access: … common femoral artery / … radial artery, … F sheath.
Devices: … F diagnostic / guiding catheter, ± … microcatheter, infusion pump.
Procedure details:
… angiography was performed. There is … (mild / moderate / severe) vasospasm of … (… segments of the … arteries), with prolonged cerebral circulation time. The treated … aneurysm shows no recurrence / ….
The catheter was positioned in … (the cervical … internal carotid artery / … vertebral artery) and nimodipine … mg in … ml was infused slowly over … min, with monitoring of blood pressure and intracranial pressure. The procedure was repeated in …. Control angiography: increased calibre of the … arteries, improved flow and shortened circulation time.
Result: … (significant / moderate) improvement in the calibre of the vasospastic vessels.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: continue ICU care, maintain euvolaemia and target blood pressure …, TCD monitoring / neurological assessment; if symptoms recur – consider repeat angiography with intra-arterial infusion / balloon angioplasty.

Conclusion:
- Vasospasm of … after SAH; intra-arterial nimodipine (… mg) into … with improvement of vessel calibre.`,
  },
  {
    id: 'neuro2_vasospasm_pta', title: 'Angioplastyka balonowa skurczu naczyń po SAH', titleEn: 'Balloon angioplasty for vasospasm after SAH',
    group: 'Neuro', section: 'Vasospasm', priority: 20,
    proc: ['vasospasm', 'pta', 'intracranial_stenting'], anat: ['brain'],
    text: `Badanie: Angioplastyka balonowa skurczu naczyń mózgowych po krwotoku podpajęczynówkowym

Opis:
Wskazanie: ciężki, objawowy skurcz proksymalnych tętnic mózgowych w … dobie po SAH z pękniętego tętniaka … (leczonego …), oporny na leczenie zachowawcze / dotętnicze podanie leków rozszerzających naczynia.
Lokalizacja: … (tętnica szyjna wewnętrzna – odcinek nadklinoidalny … / tętnica środkowa mózgu M1 … / tętnica podstawna / odcinek V4 tętnicy kręgowej).
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik prowadzący … F, ± cewnik pośredni … F, mikroprowadnik …, podatny balon (compliant) … mm × … mm.
Przebieg zabiegu:
Angiografia … wykazała ciężki skurcz … (zwężenie …%), z wydłużeniem czasu krążenia w obszarze …. Zaopatrzony tętniak … bez cech nawrotu. Podano heparynę … j.m. dożylnie / bez heparynizacji (wg decyzji zespołu). Pod kontrolą mapy drogowej podatny balon … mm × … mm wprowadzono do … i wykonano kolejne delikatne, niskociśnieniowe inflacje, przesuwając balon od dystalnego do proksymalnego odcinka skurczu: …. Dodatkowo podano dotętniczo … (nimodypinę … mg) w celu leczenia skurczu odcinków dystalnych. Kontrolna angiografia: poszerzenie światła … do prawidłowej średnicy, poprawa przepływu w obszarze …, bez ekstrawazacji, bez dyssekcji i bez zatorów dystalnych.
Wynik: skuteczna angioplastyka skurczu …, przywrócenie prawidłowej średnicy naczynia.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontynuacja leczenia na OIOM, utrzymanie normowolemii i docelowego ciśnienia tętniczego …, monitorowanie TCD / ocena neurologiczna, TK głowy w razie pogorszenia.

Wnioski:
- Angioplastyka balonowa ciężkiego skurczu … po SAH (± dotętnicza nimodypina); przywrócenie prawidłowego światła i przepływu.`,
    textEn: `Procedure: Balloon angioplasty for cerebral vasospasm after subarachnoid haemorrhage

Findings:
Indication: severe symptomatic proximal cerebral vasospasm on day … after SAH from a ruptured … aneurysm (treated by …), refractory to medical treatment / intra-arterial vasodilator therapy.
Target: … (supraclinoid … internal carotid artery / … M1 middle cerebral artery / basilar artery / V4 vertebral artery).
Anaesthesia: general.
Access: … common femoral artery, … F sheath.
Devices: … F guiding catheter, ± … F intermediate catheter, … microwire, … mm × … mm compliant balloon.
Procedure details:
… angiography showed severe vasospasm of … (…% narrowing), with prolonged circulation time in the … territory. The treated … aneurysm shows no recurrence. Heparin … IU was given intravenously / no heparin was given (team decision). Under roadmap guidance a … mm × … mm compliant balloon was advanced into the … and gentle, low-pressure inflations were performed, moving from the distal to the proximal end of the spasm: …. Intra-arterial … (nimodipine … mg) was additionally given to treat distal vasospasm. Control angiography: restored normal calibre of the …, improved flow in the … territory, no extravasation, no dissection and no distal emboli.
Result: successful angioplasty of … vasospasm with restoration of normal vessel calibre.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: continue ICU care, maintain euvolaemia and target blood pressure …, TCD monitoring / neurological assessment, CT head if deterioration.

Conclusion:
- Balloon angioplasty of severe … vasospasm after SAH (± intra-arterial nimodipine); normal lumen and flow restored.`,
  },
  {
    id: 'neuro2_cvst', title: 'Trombektomia / tromboliza w zakrzepicy zatok żylnych mózgu', titleEn: 'Cerebral venous sinus thrombosis – thrombectomy / thrombolysis',
    group: 'Neuro', section: 'Neuro venous', priority: 10,
    proc: ['venous_sinus', 'thrombectomy', 'thrombolysis'], anat: ['brain'],
    text: `Badanie: Wewnątrznaczyniowa trombektomia mechaniczna ± miejscowa tromboliza w zakrzepicy zatok żylnych mózgu

Opis:
Wskazanie: zakrzepica zatok żylnych mózgu … z pogorszeniem stanu neurologicznego mimo pełnej antykoagulacji (…).
Lokalizacja: … (zatoka strzałkowa górna / zatoka poprzeczna … / zatoka esowata … / żyła szyjna wewnętrzna … / zatoka prosta).
Znieczulenie: ogólne.
Dostęp: żyła udowa wspólna … (koszulka … F) oraz tętnica udowa wspólna … (koszulka … F) – angiografia diagnostyczna.
Sprzęt: długa koszulka / cewnik prowadzący … F, cewnik aspiracyjny dużego światła … F, mikrocewnik …, mikroprowadnik …, stent-retriever … mm × … mm, ± balon … mm, lek trombolityczny (…).
Przebieg zabiegu:
Angiografia tętnicza (faza żylna) potwierdziła brak wypełniania …, z … (zastojem żylnym / poszerzonym krążeniem obocznym przez …). Podano heparynę … j.m. dożylnie (kontynuacja antykoagulacji). Z dostępu żylnego cewnik prowadzący umieszczono w żyle szyjnej wewnętrznej … / zatoce esowatej …. Przez skrzeplinę przeprowadzono mikroprowadnik i mikrocewnik do … ; flebografia przez mikrocewnik potwierdziła położenie w zatoce. Wykonano trombektomię aspiracyjną cewnikiem … F (… przejść) ± z użyciem stent-retrievera (… przejść), uzyskując zakrzepy …. Dodatkowo podano miejscowo … (lek trombolityczny … mg / j.m.) do zakrzepłej zatoki. Kontrolna flebografia oraz angiografia tętnicza w fazie żylnej: … (całkowite / częściowe) udrożnienie …, poprawa drenażu żylnego, skrócenie czasu krążenia.
Wynik: … (całkowite / częściowe) udrożnienie zatok żylnych ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontynuacja pełnej antykoagulacji (…), obserwacja na OIOM / oddziale udarowym, TK głowy kontrolne po … h, kontrolne MR / angio-MR żylne za ….

Wnioski:
- Trombektomia mechaniczna (± miejscowa tromboliza) zakrzepicy … ; … udrożnienie zatok żylnych.`,
    textEn: `Procedure: Endovascular mechanical thrombectomy ± local thrombolysis for cerebral venous sinus thrombosis

Findings:
Indication: cerebral venous sinus thrombosis of … with neurological deterioration despite full anticoagulation (…).
Target: … (superior sagittal sinus / … transverse sinus / … sigmoid sinus / … internal jugular vein / straight sinus).
Anaesthesia: general.
Access: … common femoral vein (… F sheath) and … common femoral artery (… F sheath) for diagnostic angiography.
Devices: … F long sheath / guiding catheter, … F large-bore aspiration catheter, … microcatheter, … microwire, … mm × … mm stent-retriever, ± … mm balloon, thrombolytic agent (…).
Procedure details:
Arterial angiography (venous phase) confirmed non-filling of …, with … (venous congestion / enlarged collateral drainage via …). Heparin … IU was given intravenously (continued anticoagulation). Via the venous access the guiding catheter was positioned in the … internal jugular vein / … sigmoid sinus. A microwire and microcatheter were passed through the thrombus into …; microcatheter venography confirmed an intrasinus position. Aspiration thrombectomy with a … F catheter (… passes) ± stent-retriever (… passes) was performed, retrieving … thrombus. Additionally, … (thrombolytic agent … mg / IU) was infused locally into the thrombosed sinus. Final venography and venous-phase arterial angiography: … (complete / partial) recanalisation of …, improved venous drainage and shortened circulation time.
Result: … (complete / partial) recanalisation of the … venous sinuses.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: continue full anticoagulation (…), ICU / stroke unit observation, follow-up CT head at … h, follow-up MRI / MR venography in ….

Conclusion:
- Mechanical thrombectomy (± local thrombolysis) of … thrombosis; … recanalisation of the venous sinuses.`,
  },
  {
    id: 'neuro2_iih_sinus_stent', title: 'Stentowanie zatoki poprzecznej w IIH (z pomiarem gradientu)', titleEn: 'Venous sinus stenting for IIH (with pressure gradient)',
    group: 'Neuro', section: 'Neuro venous', priority: 20,
    proc: ['venous_sinus', 'stent'], anat: ['brain'],
    text: `Badanie: Flebografia mózgowa z manometrią i stentowanie zwężenia zatoki poprzecznej w idiopatycznym nadciśnieniu śródczaszkowym

Opis:
Wskazanie: idiopatyczne nadciśnienie śródczaszkowe (…; ciśnienie otwarcia płynu mózgowo-rdzeniowego … cm H₂O, obrzęk tarczy nerwu wzrokowego …) oporne na leczenie zachowawcze; zwężenie zatoki poprzecznej / esowatej … w angio-MR.
Lokalizacja: połączenie zatoki poprzecznej i esowatej ….
Znieczulenie: … (miejscowe z sedacją – manometria / ogólne – stentowanie).
Dostęp: żyła udowa wspólna … (koszulka … F) oraz tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, przetwornik ciśnienia, stent samorozprężalny … mm × … mm.
Przebieg zabiegu:
Angiografia tętnicza w fazie żylnej uwidoczniła … zwężenie zatoki poprzecznej … w odcinku … (zewnętrzne / wewnętrzne – ziarnistość pajęczynówki), dominację … zatoki poprzecznej. Z dostępu żylnego mikrocewnik wprowadzono do zatoki strzałkowej górnej i wykonano manometrię wycofaniową: zatoka strzałkowa górna … mm Hg, torkular … mm Hg, zatoka poprzeczna proksymalnie do zwężenia … mm Hg, dystalnie do zwężenia … mm Hg, zatoka esowata … mm Hg, żyła szyjna wewnętrzna … mm Hg, prawy przedsionek … mm Hg; gradient translezyjny … mm Hg. Podano heparynę … j.m. dożylnie. Implantowano stent samorozprężalny … mm × … mm obejmujący zwężenie, od … do …. Kontrolna flebografia: prawidłowe rozprężenie stentu, likwidacja zwężenia. Powtórna manometria: zatoka strzałkowa górna … mm Hg, gradient przez stent … mm Hg.
Wynik: likwidacja zwężenia zatoki …, redukcja gradientu z … do … mm Hg.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa przez … miesięcy, następnie monoterapia; obserwacja (ból głowy po stronie stentu zwykle przemijający), kontrola okulistyczna (dno oka, pole widzenia) za … tygodni, kontrolna flebografia / angio-MR za … miesięcy.

Wnioski:
- Stentowanie zwężenia zatoki poprzecznej … w IIH; gradient translezyjny zmniejszony z … do … mm Hg.`,
    textEn: `Procedure: Cerebral venography with manometry and stenting of transverse sinus stenosis in idiopathic intracranial hypertension

Findings:
Indication: idiopathic intracranial hypertension (…; CSF opening pressure … cm H₂O, papilloedema …) refractory to medical treatment; … transverse / sigmoid sinus stenosis on MR venography.
Target: … transverse-sigmoid junction.
Anaesthesia: … (local with sedation – manometry / general – stenting).
Access: … common femoral vein (… F sheath) and … common femoral artery (… F sheath).
Devices: … F guiding catheter, … microcatheter, … microwire, pressure transducer, … mm × … mm self-expanding stent.
Procedure details:
Venous-phase arterial angiography showed a … stenosis of the … transverse sinus at … (extrinsic / intrinsic – arachnoid granulation), with … transverse sinus dominance. Via the venous access the microcatheter was advanced into the superior sagittal sinus and pull-back manometry was performed: superior sagittal sinus … mmHg, torcula … mmHg, transverse sinus proximal to the stenosis … mmHg, distal to the stenosis … mmHg, sigmoid sinus … mmHg, internal jugular vein … mmHg, right atrium … mmHg; trans-stenotic gradient … mmHg. Heparin … IU was given intravenously. A … mm × … mm self-expanding stent was deployed across the stenosis from … to …. Final venography: good stent expansion, stenosis resolved. Repeat manometry: superior sagittal sinus … mmHg, gradient across the stent … mmHg.
Result: resolution of the … sinus stenosis, gradient reduced from … to … mmHg.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy for … months, then single agent; observation (ipsilateral headache is usually transient), ophthalmology review (fundi, visual fields) in … weeks, follow-up venography / MR venography in … months.

Conclusion:
- Stenting of … transverse sinus stenosis in IIH; trans-stenotic gradient reduced from … to … mmHg.`,
  },
  {
    id: 'neuro2_epistaxis', title: 'Embolizacja w krwawieniu z nosa (t. klinowo-podniebienna)', titleEn: 'Epistaxis embolization (sphenopalatine artery)',
    group: 'Neuro', section: 'Head & neck bleeding', priority: 10,
    proc: ['epistaxis', 'embolization'], anat: ['neck', 'brain'],
    text: `Badanie: Embolizacja tętnic w nawracającym krwawieniu z nosa

Opis:
Wskazanie: ciężkie / nawracające krwawienie z nosa … oporne na tamponadę i leczenie laryngologiczne (…).
Lokalizacja: dystalna tętnica szczękowa / tętnica klinowo-podniebienna … ± … (obustronnie / tętnica twarzowa …).
Znieczulenie: miejscowe ± sedacja.
Dostęp: tętnica udowa wspólna … / tętnica promieniowa …, koszulka … F.
Sprzęt: cewnik prowadzący / diagnostyczny … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm (PVA / mikrosfery), ± spirale … / gąbka żelatynowa.
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wewnętrznych i zewnętrznych obustronnie. … (Nie uwidoczniono bezpośrednich cech krwawienia / Uwidoczniono ekstrawazację / tętniak rzekomy / patologiczne unaczynienie w zakresie …). W tętnicy szyjnej wewnętrznej nie stwierdzono źródła krwawienia (tętnice sitowe, tętniak) / stwierdzono …. Mikrocewnik wprowadzono do dystalnej części tętnicy szczękowej …, dystalnie od odejścia tętnicy oponowej środkowej i gałęzi mięśniowych; wykluczono niebezpieczne anastomozy z tętnicą oczną i szyjną wewnętrzną. Wykonano embolizację tętnicy klinowo-podniebiennej mikrocząstkami … µm do zwolnienia przepływu ± zamknięcie spiralami …. Analogicznie zembolizowano … (tętnicę klinowo-podniebienną strony przeciwnej / tętnicę twarzową … – gałąź nosową / wargową górną). Kontrolna angiografia: zanik unaczynienia błony śluzowej jamy nosowej w obszarze embolizacji, zachowana drożność tętnicy szczękowej proksymalnie i tętnicy szyjnej wewnętrznej.
Wynik: skuteczna embolizacja ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja w kierunku nawrotu krwawienia, usunięcie tamponady wg decyzji laryngologa po … h, leczenie przeciwbólowe (możliwy ból twarzy / żuchwy), kontrola morfologii.

Wnioski:
- Embolizacja tętnicy klinowo-podniebiennej … ± … mikrocząstkami w krwawieniu z nosa; zanik unaczynienia w obszarze krwawienia.`,
    textEn: `Procedure: Arterial embolization for refractory epistaxis

Findings:
Indication: severe / recurrent … epistaxis refractory to packing and ENT treatment (…).
Target: distal maxillary artery / … sphenopalatine artery ± … (bilateral / … facial artery).
Anaesthesia: local ± sedation.
Access: … common femoral artery / … radial artery, … F sheath.
Devices: … F guiding / diagnostic catheter, … microcatheter, … microwire, … µm microparticles (PVA / microspheres), ± … coils / gelatin sponge.
Procedure details:
Bilateral internal and external carotid angiography was performed. … (No direct signs of bleeding were seen / Extravasation / pseudoaneurysm / abnormal vascularity was seen in …). No internal carotid source of bleeding (ethmoidal arteries, aneurysm) was identified / … was identified. The microcatheter was advanced into the distal … maxillary artery, beyond the origins of the middle meningeal artery and muscular branches; dangerous anastomoses with the ophthalmic and internal carotid arteries were excluded. The sphenopalatine artery was embolized with … µm microparticles to flow stasis ± coil occlusion with …. … (the contralateral sphenopalatine artery / nasal / superior labial branch of the … facial artery) was embolized in the same way. Final angiography: loss of nasal mucosal blush in the embolized territory, proximal maxillary and internal carotid arteries patent.
Result: successful embolization of ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for rebleeding, removal of nasal packing as decided by ENT after … h, analgesia (facial / jaw pain possible), check full blood count.

Conclusion:
- Particle embolization of the … sphenopalatine artery ± … for epistaxis; loss of mucosal blush in the bleeding territory.`,
  },
  {
    id: 'neuro2_blowout_covered', title: 'Zespół pęknięcia tętnicy szyjnej – stent pokryty', titleEn: 'Carotid blowout – covered stent',
    group: 'Neuro', section: 'Head & neck bleeding', priority: 20,
    proc: ['stent_graft', 'stent', 'carotid_stenting'], anat: ['neck'],
    text: `Badanie: Implantacja stentu pokrytego w zespole pęknięcia tętnicy szyjnej (carotid blowout)

Opis:
Wskazanie: … (zagrażające / jawne / nawracające) krwawienie z tętnicy szyjnej … u pacjenta po … (radioterapii / operacji nowotworu głowy i szyi), … ; nietolerancja / przeciwwskazanie do okluzji tętnicy (…).
Lokalizacja: tętnica szyjna … (wspólna / wewnętrzna / rozwidlenie) ….
Znieczulenie: … (miejscowe / ogólne – pacjent zaintubowany).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: długa koszulka / cewnik prowadzący … F, prowadnik …, stent pokryty (stentgraft) … mm × … mm, balon … mm.
Przebieg zabiegu:
Angiografia tętnicy szyjnej wspólnej … wykazała … (ekstrawazację / tętniak rzekomy / nieregularność ściany) w odcinku …, na długości ok. … mm. Ocena krążenia obocznego przez koło Willisa: …. Podano heparynę … j.m. dożylnie (wg oceny ryzyka krwawienia). Przez zmianę przeprowadzono prowadnik i implantowano stent pokryty … mm × … mm, z zapasem … mm powyżej i poniżej zmiany; wykonano domodelowanie balonem … mm. Kontrolna angiografia: wyłączenie ekstrawazacji / tętniaka rzekomego, drożny stent, prawidłowy przepływ do tętnicy szyjnej wewnętrznej i krążenia wewnątrzczaszkowego.
Wynik: skuteczne wyłączenie miejsca krwawienia stentem pokrytym z zachowaniem drożności tętnicy szyjnej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja w kierunku nawrotu krwawienia i objawów neurologicznych, leczenie przeciwpłytkowe … (wg oceny ryzyka krwawienia), antybiotykoterapia, konsultacja laryngologiczna / chirurgiczna (pokrycie tkankowe), kontrolna angio-TK za ….

Wnioski:
- Implantacja stentu pokrytego w tętnicy szyjnej … w zespole pęknięcia tętnicy szyjnej; wyłączenie miejsca krwawienia, tętnica drożna.`,
    textEn: `Procedure: Covered stent placement for carotid blowout syndrome

Findings:
Indication: … (threatened / acute / recurrent) haemorrhage from the … carotid artery in a patient after … (radiotherapy / surgery for head and neck cancer), …; intolerance of / contraindication to arterial occlusion (…).
Target: … carotid artery (common / internal / bifurcation) ….
Anaesthesia: … (local / general – patient intubated).
Access: … common femoral artery, … F sheath.
Devices: … F long sheath / guiding catheter, … guidewire, … mm × … mm covered stent (stent graft), … mm balloon.
Procedure details:
… common carotid angiography showed … (extravasation / pseudoaneurysm / wall irregularity) at the …, over approximately … mm. Collateral supply via the circle of Willis: …. Heparin … IU was given intravenously (according to bleeding risk). The lesion was crossed with a guidewire and a … mm × … mm covered stent was deployed with … mm landing zones above and below the lesion; it was moulded with a … mm balloon. Final angiography: extravasation / pseudoaneurysm excluded, stent patent, normal flow into the internal carotid artery and intracranial circulation.
Result: successful exclusion of the bleeding site with a covered stent, carotid artery patent.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for rebleeding and neurological symptoms, antiplatelet therapy … (according to bleeding risk), antibiotics, ENT / surgical review (soft-tissue coverage), follow-up CT angiography in ….

Conclusion:
- Covered stent placement in the … carotid artery for carotid blowout; bleeding site excluded, artery patent.`,
  },
  {
    id: 'neuro2_blowout_occlusion', title: 'Zespół pęknięcia tętnicy szyjnej – okluzja tętnicy', titleEn: 'Carotid blowout – parent artery occlusion',
    group: 'Neuro', section: 'Head & neck bleeding', priority: 30,
    proc: ['embolization', 'bot'], anat: ['neck'],
    text: `Badanie: Okluzja tętnicy szyjnej w zespole pęknięcia tętnicy szyjnej (carotid blowout)

Opis:
Wskazanie: … (jawne / nawracające) krwawienie z tętnicy szyjnej … u pacjenta po … (radioterapii / operacji nowotworu głowy i szyi), ….
Lokalizacja: tętnica szyjna … (wspólna / wewnętrzna / zewnętrzna) ….
Znieczulenie: … (miejscowe – z oceną neurologiczną w trakcie próby okluzji / ogólne).
Dostęp: tętnica udowa wspólna … (koszulka … F) ± tętnica udowa wspólna … (strona przeciwna, koszulka … F).
Sprzęt: cewnik prowadzący … F, balon okluzyjny … mm, mikrocewnik …, spirale odczepialne …, zatyczka naczyniowa … mm, ± płynny embolizat ….
Przebieg zabiegu:
Angiografia wykazała … (ekstrawazację / tętniak rzekomy) z tętnicy szyjnej … w odcinku …. Ocena krążenia obocznego: tętnica łącząca przednia …, tętnica łącząca tylna …; w fazie żylnej opóźnienie wypełnienia żył półkuli … wynosi … s. Wykonano próbę okluzji balonowej tętnicy szyjnej … przez … min (… z hipotensją kontrolowaną) – pacjent tolerował próbę klinicznie, bez deficytu neurologicznego. Następnie wykonano okluzję tętnicy szyjnej … spiralami odczepialnymi / zatyczką naczyniową, obejmując odcinek dystalny i proksymalny względem miejsca krwawienia (… od … do …). Kontrolna angiografia: całkowita okluzja tętnicy szyjnej …, brak ekstrawazacji; prawidłowe wypełnienie półkuli … przez krążenie oboczne z ….
Wynik: skuteczna okluzja tętnicy szyjnej … z wyłączeniem miejsca krwawienia.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna przez … h, unikanie hipotensji i odwodnienia, leżenie przez … h, konsultacja laryngologiczna / chirurgiczna, kontrolne badanie obrazowe w razie objawów.

Wnioski:
- Okluzja tętnicy szyjnej … spiralami / zatyczką naczyniową po tolerowanej próbie okluzji balonowej w zespole pęknięcia tętnicy szyjnej; krwawienie opanowane.`,
    textEn: `Procedure: Carotid artery occlusion for carotid blowout syndrome

Findings:
Indication: … (acute / recurrent) haemorrhage from the … carotid artery in a patient after … (radiotherapy / surgery for head and neck cancer), ….
Target: … carotid artery (common / internal / external) ….
Anaesthesia: … (local – with neurological assessment during test occlusion / general).
Access: … common femoral artery (… F sheath) ± contralateral common femoral artery (… F sheath).
Devices: … F guiding catheter, … mm occlusion balloon, … microcatheter, … detachable coils, … mm vascular plug, ± … liquid embolic agent.
Procedure details:
Angiography showed … (extravasation / pseudoaneurysm) from the … carotid artery at the …. Collateral assessment: anterior communicating artery …, posterior communicating artery …; venous-phase delay of the … hemisphere … s. Balloon test occlusion of the … carotid artery was performed for … min (… with controlled hypotension) – clinically tolerated with no neurological deficit. The … carotid artery was then occluded with detachable coils / a vascular plug, covering the segments distal and proximal to the bleeding site (… from … to …). Final angiography: complete occlusion of the … carotid artery, no extravasation; good filling of the … hemisphere via collaterals from ….
Result: successful … carotid artery occlusion with exclusion of the bleeding site.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation for … h, avoid hypotension and dehydration, bed rest for … h, ENT / surgical review, imaging if symptoms develop.

Conclusion:
- … carotid artery occlusion with coils / vascular plug after a tolerated balloon test occlusion for carotid blowout; haemorrhage controlled.`,
  },
  {
    id: 'neuro2_post_tonsillectomy', title: 'Embolizacja w krwawieniu po tonsillektomii', titleEn: 'Post-tonsillectomy haemorrhage embolization',
    group: 'Neuro', section: 'Head & neck bleeding', priority: 40,
    proc: ['embolization'], anat: ['neck'],
    text: `Badanie: Embolizacja tętnicy w krwawieniu po tonsillektomii

Opis:
Wskazanie: nawracające / masywne krwawienie z loży migdałka … w … dobie po tonsillektomii, nieopanowane leczeniem laryngologicznym.
Lokalizacja: tętnica szyjna zewnętrzna … – … (gałąź migdałkowa tętnicy twarzowej / tętnica językowa / tętnica gardłowa wstępująca / tętnica podniebienna wstępująca).
Znieczulenie: … (ogólne – pacjent zaintubowany / miejscowe z sedacją).
Dostęp: tętnica udowa wspólna …, koszulka … F.
Sprzęt: cewnik diagnostyczny / prowadzący … F, mikrocewnik …, mikroprowadnik …, mikrocząstki … µm, spirale …, ± gąbka żelatynowa / płynny embolizat ….
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wspólnych, wewnętrznych i zewnętrznych …. Uwidoczniono … (ekstrawazację / tętniak rzekomy / nieregularność) gałęzi … tętnicy … w loży migdałka …. Tętnica szyjna wewnętrzna bez cech uszkodzenia. Mikrocewnik wprowadzono superselektywnie do … ; wykluczono anastomozy z tętnicą szyjną wewnętrzną / kręgową. Wykonano embolizację … (spiralami po obu stronach tętniaka rzekomego / mikrocząstkami … µm i spiralami / płynnym embolizatem). Kontrolna angiografia tętnicy szyjnej zewnętrznej i wspólnej: brak ekstrawazacji, wyłączenie tętniaka rzekomego, brak napływu do miejsca krwawienia z naczyń obocznych (…), drożna tętnica szyjna wewnętrzna.
Wynik: skuteczna embolizacja źródła krwawienia z loży migdałka ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja w kierunku nawrotu krwawienia, kontrola morfologii, konsultacja laryngologiczna, leczenie przeciwbólowe, ocena połykania.

Wnioski:
- Embolizacja … tętnicy … w krwawieniu po tonsillektomii; wyłączenie miejsca krwawienia.`,
    textEn: `Procedure: Arterial embolization for post-tonsillectomy haemorrhage

Findings:
Indication: recurrent / massive bleeding from the … tonsillar fossa on day … after tonsillectomy, not controlled by ENT treatment.
Target: … external carotid artery – … (tonsillar branch of the facial artery / lingual artery / ascending pharyngeal artery / ascending palatine artery).
Anaesthesia: … (general – patient intubated / local with sedation).
Access: … common femoral artery, … F sheath.
Devices: … F diagnostic / guiding catheter, … microcatheter, … microwire, … µm microparticles, … coils, ± gelatin sponge / … liquid embolic agent.
Procedure details:
… common, internal and external carotid angiography was performed. There is … (extravasation / pseudoaneurysm / irregularity) of the … branch of the … artery in the … tonsillar fossa. The internal carotid artery shows no injury. The microcatheter was advanced superselectively into …; anastomoses with the internal carotid / vertebral artery were excluded. Embolization was performed with … (coils across the pseudoaneurysm neck, distal and proximal / … µm microparticles and coils / liquid embolic agent). Final external and common carotid angiography: no extravasation, pseudoaneurysm excluded, no collateral refilling of the bleeding site (…), internal carotid artery patent.
Result: successful embolization of the bleeding source in the … tonsillar fossa.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for rebleeding, check full blood count, ENT review, analgesia, swallowing assessment.

Conclusion:
- Embolization of the … branch of the … artery for post-tonsillectomy haemorrhage; bleeding site excluded.`,
  },
  {
    id: 'neuro2_mma_csdh', title: 'Embolizacja tętnicy oponowej środkowej (przewlekły krwiak podtwardówkowy)', titleEn: 'Middle meningeal artery embolization for chronic SDH',
    group: 'Neuro', section: 'Neuro other', priority: 10,
    proc: ['mma_embolization', 'embolization'], anat: ['brain'],
    text: `Badanie: Embolizacja tętnicy oponowej środkowej w przewlekłym krwiaku podtwardówkowym

Opis:
Wskazanie: przewlekły krwiak podtwardówkowy … (szerokość … mm) – … (leczenie samodzielne / uzupełniające po ewakuacji chirurgicznej / nawrót).
Lokalizacja: tętnica oponowa środkowa … (gałąź przednia (czołowa) i tylna (ciemieniowa)).
Znieczulenie: … (miejscowe ± sedacja / ogólne).
Dostęp: tętnica udowa wspólna … / tętnica promieniowa …, koszulka … F.
Sprzęt: cewnik prowadzący … F, mikrocewnik …, mikroprowadnik …, … (płynny embolizat – kopolimer EVOH / klej cyjanoakrylowy / mikrocząstki … µm), ± spirale ….
Przebieg zabiegu:
Wykonano angiografię tętnic szyjnych wewnętrznych i zewnętrznych …. Tętnica oponowa środkowa … odchodzi typowo z tętnicy szczękowej; … (stwierdzono / nie stwierdzono) połączeń z tętnicą oczną (gałąź oponowo-oczodołowa / tętnica oczna z tętnicy oponowej środkowej) oraz zaopatrzenia nerwu twarzowego z gałęzi skalistej – …. Widoczne … (wzmożone unaczynienie torebki krwiaka / „rozmyte” zakontrastowanie błony / bez cech szczególnych). Mikrocewnik wprowadzono do pnia tętnicy oponowej środkowej dystalnie od odejścia gałęzi skalistej / do gałęzi …. Wykonano embolizację …, uzyskując penetrację do dystalnych gałęzi przedniej i tylnej oraz naczyń torebki krwiaka, bez refluksu do tętnicy szczękowej i bez wypełniania naczyń niebezpiecznych. Kontrolna angiografia tętnicy szyjnej zewnętrznej: brak wypełniania tętnicy oponowej środkowej …, drożna tętnica szczękowa.
Wynik: skuteczna embolizacja tętnicy oponowej środkowej ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna, kontrola miejsca wkłucia, kontrolna TK głowy za … tygodni i … miesięcy, decyzja co do leczenia przeciwkrzepliwego / przeciwpłytkowego po konsultacji neurochirurgicznej.

Wnioski:
- Embolizacja tętnicy oponowej środkowej … (gałęzie przednia i tylna) … w przewlekłym krwiaku podtwardówkowym ….`,
    textEn: `Procedure: Middle meningeal artery embolization for chronic subdural haematoma

Findings:
Indication: … chronic subdural haematoma (… mm thick) – … (standalone treatment / adjunct to surgical evacuation / recurrence).
Target: … middle meningeal artery (anterior (frontal) and posterior (parietal) branches).
Anaesthesia: … (local ± sedation / general).
Access: … common femoral artery / … radial artery, … F sheath.
Devices: … F guiding catheter, … microcatheter, … microwire, … (liquid embolic – EVOH copolymer / cyanoacrylate glue / … µm microparticles), ± … coils.
Procedure details:
… internal and external carotid angiography was performed. The … middle meningeal artery arises normally from the maxillary artery; anastomoses with the ophthalmic artery (meningo-orbital / ophthalmic origin of the MMA) and facial nerve supply from the petrous branch were … (present / not identified) – …. There is … (increased vascularity of the haematoma membrane / diffuse membrane blush / no specific features). The microcatheter was advanced into the middle meningeal artery trunk beyond the petrous branch / into the … branch. Embolization with … was performed, penetrating the distal anterior and posterior branches and the membrane vessels, without reflux into the maxillary artery and without filling of dangerous vessels. Final external carotid angiography: no filling of the … middle meningeal artery, maxillary artery patent.
Result: successful … middle meningeal artery embolization.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation, access site care, follow-up CT head in … weeks and … months, decision on anticoagulant / antiplatelet therapy after neurosurgical review.

Conclusion:
- … middle meningeal artery embolization (anterior and posterior branches) with … for … chronic subdural haematoma.`,
  },
  // ---- Snippets ----
  {
    id: 'neuro2_snip_etici', title: 'Skala eTICI – reperfuzja', titleEn: 'eTICI reperfusion grade',
    group: 'Snippets', section: 'Result snippets', priority: 10,
    text: 'Uzyskano reperfuzję eTICI … (0 – brak reperfuzji; 1 – zmniejszenie skrzepliny bez reperfuzji; 2a – 1–49%; 2b50 – 50–66%; 2b67 – 67–89%; 2c – 90–99%; 3 – pełna reperfuzja) po … przejściach.',
    textEn: 'eTICI … reperfusion was achieved (0 – no reperfusion; 1 – thrombus reduction without reperfusion; 2a – 1–49%; 2b50 – 50–66%; 2b67 – 67–89%; 2c – 90–99%; 3 – complete reperfusion) after … passes.',
  },
  {
    id: 'neuro2_snip_raymond', title: 'Skala Raymond-Roy – okluzja tętniaka', titleEn: 'Raymond-Roy occlusion class',
    group: 'Snippets', section: 'Result snippets', priority: 20,
    text: 'Okluzja tętniaka w skali Raymond-Roy: klasa … (I – całkowita okluzja; II – resztkowa szyja; IIIa – resztkowe wypełnianie worka między pętlami spiral; IIIb – resztkowe wypełnianie worka wzdłuż ściany tętniaka).',
    textEn: 'Aneurysm occlusion by Raymond-Roy: class … (I – complete occlusion; II – residual neck; IIIa – residual sac filling within the coil interstices; IIIb – residual sac filling along the aneurysm wall).',
  },
  {
    id: 'neuro2_snip_avm_reduction', title: 'Wynik embolizacji AVM – redukcja gniazda', titleEn: 'AVM embolization result – nidal reduction',
    group: 'Snippets', section: 'Result snippets', priority: 30,
    text: 'Kontrolna angiografia wykazała zmniejszenie gniazda AVM o ok. …%, z zachowanym drenażem żylnym i prawidłowym wypełnieniem naczyń zaopatrujących zdrowy miąższ.',
    textEn: 'Final angiography showed approximately …% reduction of the AVM nidus, with preserved venous drainage and normal filling of vessels supplying normal brain.',
  },
  {
    id: 'neuro2_snip_nimodipine', title: 'Dotętnicza nimodypina', titleEn: 'Intra-arterial nimodipine',
    group: 'Snippets', section: 'Medication snippets', priority: 10,
    text: 'Do … podano dotętniczo nimodypinę … mg w … ml soli fizjologicznej, powolnym wlewem w ciągu … min, przy monitorowaniu ciśnienia tętniczego i ciśnienia śródczaszkowego.',
    textEn: 'Nimodipine … mg in … ml of saline was infused intra-arterially into the … over … min, with blood pressure and intracranial pressure monitoring.',
  },
  {
    id: 'neuro2_snip_heparin', title: 'Heparynizacja śródzabiegowa', titleEn: 'Intraprocedural heparinisation',
    group: 'Snippets', section: 'Medication snippets', priority: 20,
    text: 'Po uzyskaniu dostępu podano heparynę niefrakcjonowaną … j.m. dożylnie (ACT … s), z dawkami uzupełniającymi … j.m. co … min. Wszystkie cewniki płukano ciągle roztworem soli fizjologicznej z heparyną.',
    textEn: 'After access, unfractionated heparin … IU was given intravenously (ACT … s), with top-up doses of … IU every … min. All catheters were continuously flushed with heparinised saline.',
  },
  {
    id: 'neuro2_snip_dapt', title: 'Podwójna terapia przeciwpłytkowa', titleEn: 'Dual antiplatelet therapy',
    group: 'Snippets', section: 'Medication snippets', priority: 30,
    text: 'Pacjent przygotowany podwójną terapią przeciwpłytkową (… mg i … mg) od … dni; test agregacji płytek: …. Zalecono kontynuację podwójnej terapii przeciwpłytkowej przez … miesięcy, następnie monoterapię ….',
    textEn: 'The patient was pre-treated with dual antiplatelet therapy (… mg and … mg) for … days; platelet function test: …. Dual antiplatelet therapy is to continue for … months, followed by single-agent ….',
  },
  {
    id: 'neuro2_snip_femoral', title: 'Dostęp udowy – neurointerwencja', titleEn: 'Femoral access – neurointervention',
    group: 'Snippets', section: 'Access snippets', priority: 10,
    text: 'Pod kontrolą USG nakłuto tętnicę udową wspólną … techniką Seldingera i założono koszulkę … F. Pozycję nakłucia (nad głową kości udowej) potwierdzono w angiografii.',
    textEn: 'The … common femoral artery was punctured under ultrasound guidance using the Seldinger technique and a … F sheath was placed. The puncture site (over the femoral head) was confirmed angiographically.',
  },
  {
    id: 'neuro2_snip_radial', title: 'Dostęp promieniowy – neurointerwencja', titleEn: 'Radial access – neurointervention',
    group: 'Snippets', section: 'Access snippets', priority: 20,
    text: 'Pod kontrolą USG nakłuto tętnicę promieniową … (dystalnie / w okolicy tabakierki anatomicznej) i założono koszulkę … F. Dotętniczo podano koktajl antyspastyczny (…) oraz heparynę … j.m.',
    textEn: 'The … radial artery (conventional / distal at the anatomical snuffbox) was punctured under ultrasound guidance and a … F sheath was placed. An antispasmodic cocktail (…) and heparin … IU were given intra-arterially.',
  },
  {
    id: 'neuro2_snip_triaxial', title: 'System trójosiowy', titleEn: 'Triaxial system',
    group: 'Snippets', section: 'Device snippets', priority: 10,
    text: 'Zastosowano system trójosiowy: długa koszulka / cewnik prowadzący … F w …, cewnik pośredni … F w … oraz mikrocewnik … z mikroprowadnikiem …. Wszystkie elementy systemu płukano ciągle roztworem soli z heparyną.',
    textEn: 'A triaxial system was used: … F long sheath / guiding catheter in the …, … F intermediate catheter in the … and … microcatheter over a … microwire. All components were continuously flushed with heparinised saline.',
  },
  {
    id: 'neuro2_snip_evoh', title: 'Płynny embolizat (EVOH) – technika', titleEn: 'Liquid embolic (EVOH) – technique',
    group: 'Snippets', section: 'Device snippets', priority: 20,
    text: 'Po przepłukaniu przestrzeni martwej mikrocewnika DMSO podano powoli płynny embolizat niekohezyjny (kopolimer EVOH) techniką „plug and push”, pod ciągłą kontrolą fluoroskopii w projekcji „blank roadmap”. Łącznie podano … ml embolizatu.',
    textEn: 'After filling the microcatheter dead space with DMSO, the non-adhesive liquid embolic agent (EVOH copolymer) was injected slowly using a plug-and-push technique under continuous blank-roadmap fluoroscopy. A total of … ml was injected.',
  },
  {
    id: 'neuro2_snip_dangerous_anast', title: 'Wykluczenie niebezpiecznych anastomoz (ECA)', titleEn: 'Exclusion of dangerous anastomoses (ECA)',
    group: 'Snippets', section: 'Neuro snippets', priority: 10,
    text: 'Superselektywna angiografia przez mikrocewnik nie wykazała niebezpiecznych anastomoz z tętnicą szyjną wewnętrzną, oczną ani kręgową oraz zaopatrzenia nerwów czaszkowych.',
    textEn: 'Superselective microcatheter angiography showed no dangerous anastomoses with the internal carotid, ophthalmic or vertebral arteries and no cranial nerve supply.',
  },
  {
    id: 'neuro2_snip_neuro_status', title: 'Ocena neurologiczna przed i po zabiegu', titleEn: 'Neurological status before and after',
    group: 'Snippets', section: 'Neuro snippets', priority: 20,
    text: 'Stan neurologiczny przed zabiegiem: … (NIHSS …). Po zabiegu bez nowego deficytu neurologicznego (NIHSS …).',
    textEn: 'Pre-procedure neurological status: … (NIHSS …). No new neurological deficit after the procedure (NIHSS …).',
  },
  {
    id: 'neuro2_snip_cognard', title: 'Klasyfikacja Cognarda / Bordena (dAVF)', titleEn: 'Cognard / Borden classification (dAVF)',
    group: 'Snippets', section: 'Neuro snippets', priority: 30,
    text: 'Przetoka oponowa typu … wg Cognarda / … wg Bordena: drenaż do …, … (z refluksem / bez refluksu do żył korowych, z / bez ektazji żylnej).',
    textEn: 'Dural fistula Cognard type … / Borden type …: drainage into …, … (with / without cortical venous reflux, with / without venous ectasia).',
  },
  {
    id: 'neuro2_snip_thromboembolic', title: 'Powikłanie zakrzepowo-zatorowe', titleEn: 'Thromboembolic complication',
    group: 'Snippets', section: 'Complication snippets', priority: 10,
    text: 'W trakcie zabiegu stwierdzono zator / skrzeplinę w …. Podano … (lek przeciwpłytkowy dożylnie / dotętniczo …) ± wykonano trombektomię mechaniczną, uzyskując … (eTICI …). Stan neurologiczny po zabiegu: ….',
    textEn: 'An embolus / thrombus was identified in the … during the procedure. … (intravenous / intra-arterial antiplatelet agent …) was given ± mechanical thrombectomy was performed, achieving … (eTICI …). Post-procedure neurological status: ….',
  },
  {
    id: 'neuro2_snip_perforation', title: 'Perforacja tętniaka śródzabiegowa', titleEn: 'Intraprocedural aneurysm perforation',
    group: 'Snippets', section: 'Complication snippets', priority: 20,
    text: 'W trakcie zabiegu doszło do perforacji tętniaka (wynaczynienie środka kontrastowego) …. Odwrócono heparynizację siarczanem protaminy … mg, kontynuowano szybkie upakowanie tętniaka spiralami ± inflację balonu, uzyskując ustanie wynaczynienia. Wykonano pilną TK głowy: ….',
    textEn: 'Aneurysm perforation (contrast extravasation) occurred during …. Heparin was reversed with protamine sulphate … mg and rapid coil packing ± balloon inflation was continued until extravasation stopped. Urgent CT head was performed: ….',
  },
  {
    id: 'neuro2_snip_sah_ct', title: 'SAH w kontrolnym badaniu obrazowym', titleEn: 'SAH on post-procedure imaging',
    group: 'Snippets', section: 'Complication snippets', priority: 30,
    text: 'W kontrolnej TK głowy / tomografii stożkowej (cone-beam CT) na stole angiograficznym stwierdzono … (krwawienie podpajęczynówkowe / hiperdensję) w …. Poinformowano zespół neurochirurgiczny; zalecono ścisłą kontrolę ciśnienia tętniczego i kontrolną TK za … h.',
    textEn: 'Post-procedure CT head / on-table cone-beam CT showed … (subarachnoid haemorrhage / hyperdensity) in the …. The neurosurgical team was informed; strict blood pressure control and repeat CT in … h were advised.',
  },
];

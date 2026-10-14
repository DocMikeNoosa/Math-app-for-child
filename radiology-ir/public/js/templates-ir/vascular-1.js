// Vascular templates, part 1: aorta, visceral/renal, liver oncology, chest vessels.
export default [
  {
    id: 'vasc_evar_bifurcated', title: 'EVAR – stentgraft rozwidlony', titleEn: 'EVAR – bifurcated stent graft',
    group: 'Vascular', section: 'Aorta', priority: 10,
    proc: ['stent_graft', 'diag_angio'], anat: ['abdomen', 'pelvis'],
    text: `Badanie: Wewnątrznaczyniowe zaopatrzenie tętniaka aorty brzusznej (EVAR) stentgraftem rozwidlonym

Opis:
Wskazanie: tętniak aorty brzusznej podnerkowy o średnicy … mm.
Lokalizacja: aorta brzuszna podnerkowa, tętnice biodrowe wspólne obustronnie.
Znieczulenie: …
Dostęp: tętnice udowe wspólne obustronnie – nakłucie pod kontrolą USG, zamknięcie przezskórne systemem szwów zakładanych przed rozszerzeniem dostępu (preclose) / odsłonięcie chirurgiczne.
Sprzęt: koszulki naczyniowe … F i … F, prowadnik sztywny …, cewnik kalibrowany typu pigtail, stentgraft rozwidlony – korpus główny … mm, odnoga kontralateralna … mm, przedłużenia …, balon do modelowania stentgraftu.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Wykonano aortografię cewnikiem kalibrowanym, uwidaczniając tętnice nerkowe i tętniak aorty podnerkowej …. Szyja tętniaka długości … mm, kątowanie …. Korpus główny stentgraftu wprowadzono od strony …, uwolniono tuż poniżej ujścia … tętnicy nerkowej. Zacewnikowano bramkę kontralateralną od strony …, potwierdzając położenie wewnątrz korpusu. Wprowadzono i uwolniono odnogę kontralateralną oraz odnogę ipsilateralną z zakotwiczeniem w tętnicach biodrowych wspólnych, z zachowaniem tętnic biodrowych wewnętrznych. Wykonano modelowanie balonem w miejscach zakotwiczenia i połączeń modułów. Kontrolna aortografia wykazała prawidłowe położenie stentgraftu, drożność tętnic nerkowych i biodrowych, bez cech przecieku.
Wynik: tętniak wyłączony z krążenia, bez cech przecieku wewnętrznego (endoleak), tętnice nerkowe i biodrowe drożne.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola miejsc dostępu i tętna na kończynach dolnych, leczenie przeciwpłytkowe …, kontrolna angio-TK po … miesiącu, następnie nadzór obrazowy wg protokołu.

Wnioski:
- Skuteczne wszczepienie stentgraftu rozwidlonego do aorty brzusznej (EVAR) – tętniak wyłączony z krążenia, bez cech przecieku.`,
    textEn: `Procedure: Endovascular abdominal aortic aneurysm repair (EVAR) with a bifurcated stent graft

Findings:
Indication: infrarenal abdominal aortic aneurysm, … mm in diameter.
Target: infrarenal abdominal aorta and both common iliac arteries.
Anaesthesia: …
Access: bilateral common femoral arteries – ultrasound-guided puncture with suture-mediated preclosure / surgical cut-down.
Devices: … F and … F sheaths, … stiff guidewire, calibrated pigtail catheter, bifurcated stent graft – main body … mm, contralateral limb … mm, extensions …, compliant moulding balloon.
Procedure details:
Heparin … IU was given intravenously. Calibrated aortography demonstrated the renal arteries and an infrarenal aortic aneurysm …. Neck length … mm, angulation …. The main body was introduced from the … side and deployed just below the … renal artery origin. The contralateral gate was cannulated from the … side and intra-graft position was confirmed. The contralateral and ipsilateral limbs were deployed with landing in the common iliac arteries, preserving both internal iliac arteries. Balloon moulding of the sealing zones and modular junctions was performed. Completion aortography showed satisfactory stent-graft position, patent renal and iliac arteries and no endoleak.
Result: aneurysm excluded, no endoleak, renal and iliac arteries patent.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor access sites and lower-limb pulses, antiplatelet therapy …, CT angiography at … month, then imaging surveillance per protocol.

Conclusion:
- Successful EVAR with a bifurcated stent graft – aneurysm excluded with no endoleak.`,
  },
  {
    id: 'vasc_evar_iliac_branch', title: 'EVAR z odgałęzieniem biodrowym (IBD)', titleEn: 'EVAR with iliac branch device',
    group: 'Vascular', section: 'Aorta', priority: 20,
    proc: ['stent_graft', 'stent', 'diag_angio'], anat: ['abdomen', 'pelvis'],
    text: `Badanie: EVAR z wszczepieniem stentgraftu z odgałęzieniem biodrowym (IBD) / przedłużeniem do tętnicy biodrowej zewnętrznej

Opis:
Wskazanie: tętniak aorty brzusznej z tętniakiem tętnicy biodrowej wspólnej … / tętniak izolowany tętnicy biodrowej wspólnej ….
Lokalizacja: aorta brzuszna, tętnica biodrowa wspólna, zewnętrzna i wewnętrzna strony ….
Znieczulenie: …
Dostęp: tętnice udowe wspólne obustronnie pod kontrolą USG (preclose); dostęp z kończyny górnej – tętnica ramienna / pachowa ….
Sprzęt: koszulki naczyniowe … F, długa koszulka … F z dostępu górnego, prowadniki sztywne …, stentgraft z odgałęzieniem biodrowym …, stentgraft pokryty typu balonorozprężalnego / samorozprężalnego do tętnicy biodrowej wewnętrznej … mm, stentgraft rozwidlony …, balony ….
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia i angiografia biodrowa potwierdziły tętniak … tętnicy biodrowej wspólnej o średnicy … mm z drożną tętnicą biodrową wewnętrzną. Wprowadzono urządzenie z odgałęzieniem biodrowym od strony … i uwolniono je w osi tętnicy biodrowej wspólnej i zewnętrznej. Przez odgałęzienie wewnętrzne zacewnikowano tętnicę biodrową wewnętrzną z dostępu …, wprowadzono i uwolniono stentgraft pokryty z zakotwiczeniem w … tętnicy biodrowej wewnętrznej, z modelowaniem balonem. Następnie wszczepiono stentgraft rozwidlony aorty, łącząc go z urządzeniem biodrowym przedłużeniem …. Strona przeciwna: …. Kontrolna angiografia wykazała drożność tętnicy biodrowej wewnętrznej i zewnętrznej, wyłączenie tętniaków, bez cech przecieku.
Wynik: tętniaki wyłączone z krążenia, zachowany przepływ w tętnicy biodrowej wewnętrznej …, bez cech przecieku.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola miejsc dostępu i ukrwienia kończyn, leczenie przeciwpłytkowe …, angio-TK kontrolna po … miesiącu.

Wnioski:
- Skuteczne wszczepienie stentgraftu z odgałęzieniem biodrowym strony … z zachowaniem przepływu w tętnicy biodrowej wewnętrznej.
- Tętniaki wyłączone z krążenia, bez cech przecieku.`,
    textEn: `Procedure: EVAR with iliac branch device (IBD) / extension into the external iliac artery

Findings:
Indication: abdominal aortic aneurysm with … common iliac artery aneurysm / isolated … common iliac artery aneurysm.
Target: abdominal aorta, … common, external and internal iliac arteries.
Anaesthesia: …
Access: bilateral ultrasound-guided common femoral artery access (preclosure); upper-limb access via the … brachial / axillary artery.
Devices: … F sheaths, … F long sheath from the upper-limb access, … stiff guidewires, iliac branch device …, balloon-expandable / self-expanding covered stent to the internal iliac artery … mm, bifurcated stent graft …, balloons ….
Procedure details:
Heparin … IU was given intravenously. Aortography and iliac angiography confirmed a … common iliac artery aneurysm, … mm, with a patent internal iliac artery. The iliac branch device was introduced from the … side and deployed along the common and external iliac axis. The internal iliac artery was cannulated through the internal branch from the … access and a covered stent was deployed with landing in the … internal iliac artery and balloon moulded. A bifurcated aortic stent graft was then deployed and connected to the iliac branch device with a … extension. Contralateral side: …. Completion angiography showed patent internal and external iliac arteries, exclusion of the aneurysms and no endoleak.
Result: aneurysms excluded, … internal iliac artery flow preserved, no endoleak.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor access sites and limb perfusion, antiplatelet therapy …, CT angiography at … month.

Conclusion:
- Successful … iliac branch device implantation with preserved internal iliac artery flow.
- Aneurysms excluded with no endoleak.`,
  },
  {
    id: 'vasc_tevar_aneurysm', title: 'TEVAR – tętniak aorty piersiowej', titleEn: 'TEVAR – thoracic aortic aneurysm',
    group: 'Vascular', section: 'Aorta', priority: 30,
    proc: ['stent_graft', 'diag_angio'], anat: ['chest'],
    text: `Badanie: Wewnątrznaczyniowe zaopatrzenie tętniaka aorty piersiowej (TEVAR)

Opis:
Wskazanie: tętniak aorty piersiowej zstępującej o średnicy … mm.
Lokalizacja: aorta piersiowa zstępująca, strefa zakotwiczenia proksymalnego … (wg Ishimaru).
Znieczulenie: …
Dostęp: tętnica udowa wspólna … (preclose) – dostęp główny; tętnica udowa / ramienna … – dostęp do cewnika diagnostycznego.
Sprzęt: koszulka … F, prowadnik bardzo sztywny …, cewnik kalibrowany typu pigtail, stentgraft piersiowy … mm × … mm, …, balon do modelowania ….
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia w projekcji skośnej lewej przedniej uwidoczniła łuk aorty z odejściem tętnic nadłukowych oraz tętniak aorty zstępującej …, zaczynający się … mm od ujścia lewej tętnicy podobojczykowej. Po wprowadzeniu prowadnika bardzo sztywnego do aorty wstępującej wprowadzono stentgraft i uwolniono go w strefie … przy kontrolowanym obniżeniu ciśnienia tętniczego; lewa tętnica podobojczykowa zachowana / pokryta …. Wszczepiono … moduł przedłużający z zakładką …. Wykonano modelowanie balonem / bez modelowania. Kontrolna aortografia wykazała prawidłowe położenie stentgraftu, wyłączenie tętniaka, drożność tętnic nadłukowych, bez cech przecieku.
Wynik: tętniak aorty piersiowej wyłączony z krążenia, bez cech przecieku.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie stanu neurologicznego (w tym funkcji rdzenia kręgowego), utrzymanie średniego ciśnienia tętniczego ≥ … mmHg, drenaż płynu mózgowo-rdzeniowego …, kontrola miejsc dostępu, angio-TK po … miesiącu.

Wnioski:
- Skuteczne wszczepienie stentgraftu do aorty piersiowej zstępującej (TEVAR) – tętniak wyłączony z krążenia, bez cech przecieku.`,
    textEn: `Procedure: Thoracic endovascular aortic repair (TEVAR) of a thoracic aortic aneurysm

Findings:
Indication: descending thoracic aortic aneurysm, … mm in diameter.
Target: descending thoracic aorta, proximal landing zone … (Ishimaru).
Anaesthesia: …
Access: … common femoral artery (preclosure) for the device; … femoral / brachial artery for the diagnostic catheter.
Devices: … F sheath, … extra-stiff guidewire, calibrated pigtail catheter, thoracic stent graft … mm × … mm, …, … moulding balloon.
Procedure details:
Heparin … IU was given intravenously. Left anterior oblique aortography demonstrated the aortic arch with the supra-aortic branches and a descending thoracic aortic aneurysm … starting … mm distal to the left subclavian artery origin. With an extra-stiff guidewire in the ascending aorta, the stent graft was advanced and deployed in zone … under controlled hypotension; the left subclavian artery was preserved / covered …. A … extension was deployed with … overlap. Balloon moulding was / was not performed. Completion aortography showed satisfactory stent-graft position, aneurysm exclusion, patent supra-aortic vessels and no endoleak.
Result: thoracic aortic aneurysm excluded, no endoleak.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological monitoring (including spinal cord function), maintain mean arterial pressure ≥ … mmHg, CSF drainage …, access-site checks, CT angiography at … month.

Conclusion:
- Successful TEVAR of the descending thoracic aorta – aneurysm excluded with no endoleak.`,
  },
  {
    id: 'vasc_tevar_dissection', title: 'TEVAR – rozwarstwienie aorty typu B', titleEn: 'TEVAR – type B aortic dissection',
    group: 'Vascular', section: 'Aorta', priority: 40,
    proc: ['stent_graft', 'diag_angio'], anat: ['chest', 'abdomen'],
    text: `Badanie: TEVAR – zamknięcie wrót wejścia rozwarstwienia aorty typu B

Opis:
Wskazanie: rozwarstwienie aorty typu B (… ostre / podostre / przewlekłe) – powikłane …: zespół złego ukrwienia / zagrażające pęknięcie / niekontrolowany ból / nadciśnienie oporne na leczenie / niekorzystne cechy anatomiczne.
Lokalizacja: aorta piersiowa zstępująca, wrota wejścia … mm od ujścia lewej tętnicy podobojczykowej.
Znieczulenie: …
Dostęp: tętnica udowa wspólna … (preclose) – do kanału prawdziwego; tętnica ramienna lewa / udowa … – cewnik diagnostyczny.
Sprzęt: koszulka … F, prowadnik …, prowadnik bardzo sztywny …, cewnik kalibrowany typu pigtail, stentgraft piersiowy … mm × … mm, …; USG wewnątrznaczyniowe (IVUS) ….
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Prowadnik przeprowadzono do aorty wstępującej, potwierdzając jego przebieg w kanale prawdziwym (angiografia / IVUS). Aortografia uwidoczniła rozwarstwienie od … do …, wrota wejścia w …, zwężony kanał prawdziwy oraz odejście tętnic trzewnych i nerkowych z kanału …. Stentgraft uwolniono w strefie … przy kontrolowanym obniżeniu ciśnienia, pokrywając wrota wejścia; lewa tętnica podobojczykowa zachowana / pokryta …. Kontrolna aortografia wykazała zamknięcie wrót wejścia, poszerzenie kanału prawdziwego, brak / śladowe wypełnianie kanału fałszywego w odcinku piersiowym, drożność tętnic trzewnych i nerkowych.
Wynik: wrota wejścia zamknięte, kanał prawdziwy poszerzony, perfuzja narządów trzewnych ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie stanu neurologicznego i funkcji rdzenia kręgowego, kontrola ciśnienia tętniczego (docelowe …), kontrola perfuzji narządów i kończyn, angio-TK kontrolna po … dniach / miesiącu.

Wnioski:
- Skuteczne zamknięcie wrót wejścia rozwarstwienia aorty typu B stentgraftem piersiowym (TEVAR); kanał prawdziwy poszerzony.`,
    textEn: `Procedure: TEVAR – entry tear coverage for type B aortic dissection

Findings:
Indication: … acute / subacute / chronic type B aortic dissection – complicated by …: malperfusion / impending rupture / refractory pain / refractory hypertension / high-risk anatomical features.
Target: descending thoracic aorta, primary entry tear … mm distal to the left subclavian artery origin.
Anaesthesia: …
Access: … common femoral artery (preclosure) into the true lumen; left brachial / … femoral artery for the diagnostic catheter.
Devices: … F sheath, … guidewire, … extra-stiff guidewire, calibrated pigtail catheter, thoracic stent graft … mm × … mm, …; intravascular ultrasound (IVUS) ….
Procedure details:
Heparin … IU was given intravenously. The guidewire was advanced to the ascending aorta with true-lumen position confirmed (angiography / IVUS). Aortography demonstrated the dissection from … to …, the entry tear at …, a compressed true lumen and visceral and renal arteries arising from the … lumen. The stent graft was deployed in zone … under controlled hypotension covering the entry tear; the left subclavian artery was preserved / covered …. Completion aortography showed entry tear closure, true-lumen expansion, no / minimal thoracic false-lumen filling and patent visceral and renal arteries.
Result: entry tear covered, true lumen expanded, visceral perfusion ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological and spinal cord monitoring, blood pressure control (target …), monitor end-organ and limb perfusion, CT angiography at … days / month.

Conclusion:
- Successful TEVAR with coverage of the type B dissection entry tear; true lumen expanded.`,
  },
  {
    id: 'vasc_tevar_trauma', title: 'TEVAR – urazowe uszkodzenie aorty', titleEn: 'TEVAR – blunt traumatic aortic injury',
    group: 'Vascular', section: 'Aorta', priority: 50,
    proc: ['stent_graft', 'diag_angio'], anat: ['chest'],
    text: `Badanie: TEVAR – urazowe uszkodzenie aorty piersiowej

Opis:
Wskazanie: tępe urazowe uszkodzenie aorty piersiowej (BTAI) stopnia … w cieśni aorty.
Lokalizacja: cieśń aorty / aorta piersiowa zstępująca, … mm od ujścia lewej tętnicy podobojczykowej.
Znieczulenie: …
Dostęp: tętnica udowa wspólna … pod kontrolą USG (preclose); tętnica … – cewnik diagnostyczny.
Sprzęt: koszulka … F, prowadnik bardzo sztywny …, cewnik kalibrowany typu pigtail, stentgraft piersiowy … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie / zabieg wykonano bez heparynizacji systemowej lub z redukowaną dawką ze względu na obrażenia współistniejące. Aortografia w projekcji skośnej lewej przedniej uwidoczniła uszkodzenie ściany aorty w cieśni z tętniakiem rzekomym / nieregularnością ściany … na długości … mm. Stentgraft dobrany do średnicy aorty bez nadmiernego przewymiarowania uwolniono w strefie …, pokrywając miejsce uszkodzenia; lewa tętnica podobojczykowa zachowana / pokryta …. Nie wykonywano modelowania balonem. Kontrolna aortografia wykazała wyłączenie miejsca uszkodzenia, prawidłowe przyleganie stentgraftu do krzywizny łuku, drożność tętnic nadłukowych, bez przecieku.
Wynik: miejsce uszkodzenia aorty pokryte, bez wynaczynienia i bez przecieku.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie stanu neurologicznego i ukrwienia lewej kończyny górnej, kontrola ciśnienia tętniczego, angio-TK kontrolna przed wypisem / po … miesiącu.

Wnioski:
- Skuteczne zaopatrzenie urazowego uszkodzenia aorty piersiowej stentgraftem (TEVAR); bez przecieku.`,
    textEn: `Procedure: TEVAR for blunt traumatic thoracic aortic injury

Findings:
Indication: grade … blunt traumatic thoracic aortic injury (BTAI) at the aortic isthmus.
Target: aortic isthmus / descending thoracic aorta, … mm distal to the left subclavian artery origin.
Anaesthesia: …
Access: ultrasound-guided … common femoral artery (preclosure); … artery for the diagnostic catheter.
Devices: … F sheath, … extra-stiff guidewire, calibrated pigtail catheter, thoracic stent graft … mm × … mm.
Procedure details:
Heparin … IU was given intravenously / the procedure was performed without or with reduced systemic heparin because of associated injuries. Left anterior oblique aortography showed an isthmic aortic wall injury with pseudoaneurysm / intimal irregularity … over … mm. A stent graft sized to the aortic diameter without excessive oversizing was deployed in zone … covering the injury; the left subclavian artery was preserved / covered …. No balloon moulding was performed. Completion aortography showed exclusion of the injury, good apposition along the arch curvature, patent supra-aortic vessels and no endoleak.
Result: aortic injury covered, no extravasation or endoleak.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological monitoring and left upper-limb perfusion checks, blood pressure control, CT angiography before discharge / at … month.

Conclusion:
- Successful TEVAR of blunt traumatic thoracic aortic injury; no endoleak.`,
  },
  {
    id: 'vasc_endoleak2_transarterial', title: 'Przeciek typu II – embolizacja przeztętnicza', titleEn: 'Type II endoleak – transarterial embolization',
    group: 'Vascular', section: 'Aorta', priority: 60,
    proc: ['endoleak', 'embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Embolizacja przecieku typu II po EVAR – dostęp przeztętniczy

Opis:
Wskazanie: przeciek typu II po EVAR z powiększaniem się worka tętniaka o … mm w ciągu ….
Lokalizacja: worek tętniaka aorty brzusznej; naczynie doprowadzające – tętnica biodrowo-lędźwiowa / tętnica lędźwiowa … / tętnica krezkowa dolna (przez łuk Riolana).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, spirale odczepialne / wypychane …, płynny embolizat … (klej cyjanoakrylowy z lipiodolem / kopolimer EVOH).
Przebieg zabiegu:
Angiografia tętnicy krezkowej górnej / biodrowej wewnętrznej … uwidoczniła wsteczne wypełnianie worka tętniaka przez … z odpływem przez …. Mikrocewnik przeprowadzono przez … do worka tętniaka (do jamy przecieku). Embolizowano jamę przecieku … oraz ujścia naczyń doprowadzających i odprowadzających …. Kontrolna angiografia wykazała brak wypełniania worka tętniaka.
Wynik: przeciek typu II zamknięty, brak wypełniania worka w kontrolnej angiografii.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola miejsca dostępu, obserwacja w kierunku objawów niedokrwienia jelita, angio-TK kontrolna po … miesiącach.

Wnioski:
- Skuteczna przeztętnicza embolizacja przecieku typu II (naczynie doprowadzające: …) – brak wypełniania worka tętniaka.`,
    textEn: `Procedure: Transarterial embolization of a type II endoleak after EVAR

Findings:
Indication: type II endoleak after EVAR with aneurysm sac growth of … mm over ….
Target: abdominal aortic aneurysm sac; feeding vessel – iliolumbar artery / … lumbar artery / inferior mesenteric artery (via the arc of Riolan).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, detachable / pushable coils …, liquid embolic … (cyanoacrylate glue with lipiodol / EVOH copolymer).
Procedure details:
Superior mesenteric / … internal iliac angiography showed retrograde filling of the aneurysm sac via … with outflow through …. A microcatheter was navigated via … into the aneurysm sac (endoleak nidus). The endoleak nidus … and the origins of inflow and outflow vessels … were embolized. Completion angiography showed no further sac filling.
Result: type II endoleak closed, no sac filling on completion angiography.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: access-site checks, watch for signs of bowel ischaemia, CT angiography at … months.

Conclusion:
- Successful transarterial embolization of a type II endoleak (feeding vessel: …) – no residual sac filling.`,
  },
  {
    id: 'vasc_endoleak2_translumbar', title: 'Przeciek typu II – embolizacja przezlędźwiowa', titleEn: 'Type II endoleak – translumbar embolization',
    group: 'Vascular', section: 'Aorta', priority: 70,
    proc: ['endoleak', 'embolization'], anat: ['abdomen'],
    text: `Badanie: Embolizacja przecieku typu II po EVAR – bezpośrednie nakłucie worka tętniaka z dostępu przezlędźwiowego

Opis:
Wskazanie: przeciek typu II po EVAR z powiększaniem się worka tętniaka o … mm; przeciek niedostępny / trudno dostępny drogą przeztętniczą.
Lokalizacja: worek tętniaka aorty brzusznej, jama przecieku po stronie … na poziomie ….
Znieczulenie: miejscowe, … ml lidokainy …% / sedacja ….
Dostęp: przezlędźwiowy … strony, w ułożeniu na brzuchu, pod kontrolą TK / fluoroskopii z rekonstrukcją objętościową (cone-beam CT).
Sprzęt: igła … G długości … cm, koszulka …, mikrocewnik …, spirale …, płynny embolizat … (klej cyjanoakrylowy z lipiodolem / kopolimer EVOH) / trombina ….
Przebieg zabiegu:
Na podstawie TK zaplanowano tor dostępu z pominięciem nerki, kręgosłupa i stentgraftu. Nakłuto worek tętniaka igłą do jamy przecieku, uzyskując pulsacyjny wypływ krwi tętniczej. Sacografia uwidoczniła jamę przecieku z odejściem naczyń: …. Wykonano embolizację jamy przecieku i ujść naczyń …. Kontrolna sacografia / angiografia wykazała brak dalszego wypełniania jamy przecieku. Igłę usunięto.
Wynik: jama przecieku typu II zembolizowana, bez dalszego wypełniania.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja przez … h, kontrola morfologii, angio-TK kontrolna po … miesiącach.

Wnioski:
- Skuteczna przezlędźwiowa embolizacja przecieku typu II …; brak wypełniania jamy przecieku.`,
    textEn: `Procedure: Translumbar direct sac puncture embolization of a type II endoleak after EVAR

Findings:
Indication: type II endoleak after EVAR with aneurysm sac growth of … mm; endoleak not / poorly accessible transarterially.
Target: abdominal aortic aneurysm sac, endoleak nidus on the … side at the level of ….
Anaesthesia: local, … ml of …% lidocaine / sedation ….
Access: … translumbar, patient prone, under CT / fluoroscopic guidance with cone-beam CT.
Devices: … G needle, … cm long, … sheath, … microcatheter, coils …, liquid embolic … (cyanoacrylate glue with lipiodol / EVOH copolymer) / thrombin ….
Procedure details:
The needle path was planned on CT to avoid the kidney, spine and stent graft. The aneurysm sac was punctured into the endoleak nidus with pulsatile arterial back-bleeding. Sacography demonstrated the nidus with connecting vessels: …. The nidus and the origins of … were embolized. Completion sacography / angiography showed no further endoleak filling. The needle was removed.
Result: type II endoleak nidus embolized, no further filling.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observation for … h, full blood count, CT angiography at … months.

Conclusion:
- Successful translumbar embolization of a type II endoleak …; no residual nidus filling.`,
  },
  {
    id: 'vasc_endoleak1', title: 'Przeciek typu I – mankiet / przedłużenie / balon', titleEn: 'Type I endoleak – cuff / extension / balloon',
    group: 'Vascular', section: 'Aorta', priority: 80,
    proc: ['endoleak', 'stent_graft', 'stent', 'diag_angio'], anat: ['abdomen', 'pelvis', 'chest'],
    text: `Badanie: Leczenie przecieku typu I po EVAR / TEVAR

Opis:
Wskazanie: przeciek typu … (Ia – proksymalny / Ib – dystalny) po EVAR / TEVAR wykonanym ….
Lokalizacja: … (szyja proksymalna stentgraftu / zakotwiczenie dystalne w tętnicy biodrowej …).
Znieczulenie: …
Dostęp: tętnica udowa wspólna … / obustronnie, pod kontrolą USG.
Sprzęt: koszulka … F, prowadnik sztywny …, cewnik kalibrowany typu pigtail, balon do modelowania …, mankiet aortalny / przedłużenie biodrowe … mm × … mm, stent balonorozprężalny niepokryty o dużej sile radialnej … / endokotwice ….
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia potwierdziła przeciek typu … z wypełnianiem worka tętniaka wokół … stentgraftu; przyczyna: niedostateczna długość zakotwiczenia / migracja / niepełne przyleganie …. Wykonano modelowanie balonem w strefie zakotwiczenia. Ze względu na utrzymujący się przeciek wszczepiono … (mankiet proksymalny poniżej ujścia tętnicy nerkowej … / przedłużenie odnogi do tętnicy biodrowej … / stent niepokryty w szyi / endokotwice …), a następnie wykonano ponowne modelowanie balonem. Kontrolna aortografia wykazała ustąpienie przecieku, drożność tętnic nerkowych i biodrowych.
Wynik: przeciek typu … zamknięty, bez wypełniania worka tętniaka.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola miejsca dostępu i ukrwienia kończyn, kontrola parametrów nerkowych, angio-TK po … miesiącu.

Wnioski:
- Skuteczne leczenie przecieku typu … (…); brak wypełniania worka tętniaka w kontrolnej aortografii.`,
    textEn: `Procedure: Treatment of a type I endoleak after EVAR / TEVAR

Findings:
Indication: type … endoleak (Ia – proximal / Ib – distal) after EVAR / TEVAR performed ….
Target: … (proximal stent-graft neck / distal landing zone in the … iliac artery).
Anaesthesia: …
Access: ultrasound-guided … / bilateral common femoral artery.
Devices: … F sheath, … stiff guidewire, calibrated pigtail catheter, … moulding balloon, aortic cuff / iliac extension … mm × … mm, high-radial-force balloon-expandable bare stent … / endoanchors ….
Procedure details:
Heparin … IU was given intravenously. Aortography confirmed a type … endoleak with sac filling around the … end of the stent graft; cause: inadequate seal length / migration / incomplete apposition …. Balloon moulding of the sealing zone was performed. Because the endoleak persisted, … was deployed (proximal cuff below the … renal artery / limb extension into the … iliac artery / bare stent in the neck / endoanchors …), followed by repeat balloon moulding. Completion aortography showed resolution of the endoleak with patent renal and iliac arteries.
Result: type … endoleak sealed, no aneurysm sac filling.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: access-site and limb perfusion checks, renal function monitoring, CT angiography at … month.

Conclusion:
- Successful treatment of a type … endoleak (…); no sac filling on completion aortography.`,
  },
  {
    id: 'vasc_aortography', title: 'Aortografia diagnostyczna', titleEn: 'Diagnostic aortography',
    group: 'Vascular', section: 'Aorta', priority: 90,
    proc: ['diag_angio'], anat: ['chest', 'abdomen', 'pelvis'],
    text: `Badanie: Aortografia diagnostyczna

Opis:
Wskazanie: …
Lokalizacja: aorta piersiowa / brzuszna z odgałęzieniami i tętnicami biodrowymi ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa / ramienna ….
Sprzęt: koszulka … F, prowadnik …, cewnik kalibrowany typu pigtail … F, cewnik selektywny ….
Przebieg zabiegu:
Cewnik typu pigtail wprowadzono do aorty … i wykonano aortografię w projekcjach …, z oceną … (łuku aorty i tętnic nadłukowych / aorty brzusznej, tętnic trzewnych i nerkowych / tętnic biodrowych). Aorta o prawidłowym przebiegu i średnicy, o gładkich zarysach ścian, bez tętniaka, rozwarstwienia ani istotnych zwężeń. Odgałęzienia aorty drożne, bez istotnych zwężeń. …. Cewnik usunięto, hemostazę uzyskano ….
Wynik: …
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie z unieruchomieniem kończyny przez … h, kontrola miejsca wkłucia.

Wnioski:
- Aortografia bez istotnych nieprawidłowości. / …`,
    textEn: `Procedure: Diagnostic aortography

Findings:
Indication: …
Target: thoracic / abdominal aorta with branches and iliac arteries ….
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / radial / brachial artery ….
Devices: … F sheath, … guidewire, … F calibrated pigtail catheter, … selective catheter.
Procedure details:
A pigtail catheter was positioned in the … aorta and aortography was performed in … projections, assessing … (the aortic arch and supra-aortic vessels / the abdominal aorta with visceral and renal arteries / the iliac arteries). The aorta is of normal course and calibre with smooth walls, without aneurysm, dissection or significant stenosis. The aortic branches are patent without significant stenosis. …. The catheter was removed and haemostasis achieved with ….
Result: …
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest with limb immobilisation for … h, access-site checks.

Conclusion:
- Unremarkable aortography. / …`,
  },
  {
    id: 'vasc_renal_stent', title: 'Stentowanie tętnicy nerkowej', titleEn: 'Renal artery stenting',
    group: 'Vascular', section: 'Visceral / Renal', priority: 10,
    proc: ['stent', 'pta', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Angioplastyka ze stentowaniem tętnicy nerkowej

Opis:
Wskazanie: miażdżycowe zwężenie … tętnicy nerkowej z … (opornym nadciśnieniem tętniczym / postępującym pogorszeniem funkcji nerek / nawracającym obrzękiem płuc).
Lokalizacja: … tętnica nerkowa, odcinek przyujściowy.
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa / ramienna ….
Sprzęt: koszulka … F, cewnik prowadzący / długa koszulka … F, prowadnik … (0,014″ / 0,018″), stent balonorozprężalny … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia brzuszna i selektywna arteriografia uwidoczniły przyujściowe zwężenie … tętnicy nerkowej ok. …% (gradient ciśnień …). Zwężenie przekroczono prowadnikiem, wprowadzono stent balonorozprężalny i uwolniono go z wystawieniem … mm do światła aorty. Kontrolna angiografia wykazała pełne poszerzenie stentu bez zwężenia rezydualnego, bez rozwarstwienia i bez cech zatorowości obwodowej; prawidłowe unaczynienie miąższu nerki.
Wynik: zwężenie zlikwidowane, zwężenie rezydualne < …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójne leczenie przeciwpłytkowe …, kontrola ciśnienia tętniczego i parametrów nerkowych, nawodnienie, USG doppler tętnic nerkowych po … miesiącach.

Wnioski:
- Skuteczne stentowanie przyujściowego zwężenia … tętnicy nerkowej; bez zwężenia rezydualnego.`,
    textEn: `Procedure: Renal artery angioplasty and stenting

Findings:
Indication: atherosclerotic … renal artery stenosis with … (resistant hypertension / progressive renal dysfunction / flash pulmonary oedema).
Target: … renal artery, ostial segment.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / radial / brachial artery ….
Devices: … F sheath, … F guiding catheter / long sheath, … guidewire (0.014″ / 0.018″), balloon-expandable stent … mm × … mm.
Procedure details:
Heparin … IU was given intravenously. Abdominal aortography and selective renal arteriography showed an ostial … renal artery stenosis of approximately …% (pressure gradient …). The lesion was crossed with a guidewire and a balloon-expandable stent was deployed protruding … mm into the aortic lumen. Completion angiography showed full stent expansion without residual stenosis, dissection or distal embolization, with normal parenchymal perfusion.
Result: stenosis treated, residual stenosis < …%.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy …, blood pressure and renal function monitoring, hydration, renal artery Doppler ultrasound at … months.

Conclusion:
- Successful stenting of an ostial … renal artery stenosis; no residual stenosis.`,
  },
  {
    id: 'vasc_renal_fmd_pta', title: 'Angioplastyka tętnicy nerkowej – FMD', titleEn: 'Renal artery angioplasty – FMD',
    group: 'Vascular', section: 'Visceral / Renal', priority: 20,
    proc: ['pta', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Przezskórna angioplastyka balonowa tętnicy nerkowej w dysplazji włóknisto-mięśniowej (FMD)

Opis:
Wskazanie: nadciśnienie naczyniowo-nerkowe w przebiegu dysplazji włóknisto-mięśniowej … tętnicy nerkowej.
Lokalizacja: … tętnica nerkowa, odcinek środkowy / dystalny pnia.
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik prowadzący … F, prowadnik … , cewnik balonowy … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Selektywna arteriografia … tętnicy nerkowej uwidoczniła obraz „sznura korali” (zmiany wieloogniskowe) w odcinku … pnia tętnicy, z istotnym zwężeniem hemodynamicznym (gradient ciśnień …). Zmiany przekroczono prowadnikiem i wykonano angioplastykę balonem … mm. Kontrolna angiografia wykazała poszerzenie światła tętnicy, ustąpienie przegród / zwężeń, bez rozwarstwienia; gradient ciśnień po zabiegu …. Stentu nie implantowano.
Wynik: dobry efekt angiograficzny angioplastyki, bez istotnego zwężenia rezydualnego.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwpłytkowe …, monitorowanie ciśnienia tętniczego (ryzyko hipotonii po zabiegu), USG doppler tętnic nerkowych po … miesiącach.

Wnioski:
- Skuteczna angioplastyka balonowa … tętnicy nerkowej w przebiegu FMD, bez implantacji stentu.`,
    textEn: `Procedure: Percutaneous transluminal renal angioplasty for fibromuscular dysplasia (FMD)

Findings:
Indication: renovascular hypertension due to fibromuscular dysplasia of the … renal artery.
Target: … renal artery, mid / distal main trunk.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F guiding catheter, … guidewire, … mm × … mm balloon catheter.
Procedure details:
Heparin … IU was given intravenously. Selective … renal arteriography showed a "string-of-beads" appearance (multifocal disease) in the … main renal artery with haemodynamically significant stenosis (pressure gradient …). The lesions were crossed with a guidewire and angioplasty was performed with a … mm balloon. Completion angiography showed luminal gain with disruption of the webs / stenoses and no dissection; post-procedural gradient …. No stent was placed.
Result: good angiographic result, no significant residual stenosis.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: antiplatelet therapy …, blood pressure monitoring (risk of post-procedural hypotension), renal artery Doppler ultrasound at … months.

Conclusion:
- Successful balloon angioplasty of the … renal artery for FMD without stent placement.`,
  },
  {
    id: 'vasc_mesenteric_cmi_stent', title: 'Stentowanie SMA / pnia trzewnego – przewlekłe niedokrwienie', titleEn: 'SMA / coeliac stenting – chronic mesenteric ischaemia',
    group: 'Vascular', section: 'Visceral / Renal', priority: 30,
    proc: ['stent', 'pta', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Angioplastyka ze stentowaniem tętnicy krezkowej górnej / pnia trzewnego

Opis:
Wskazanie: przewlekłe niedokrwienie jelit (ból poposiłkowy, utrata masy ciała) w przebiegu miażdżycowego zwężenia / niedrożności ….
Lokalizacja: tętnica krezkowa górna / pień trzewny, odcinek przyujściowy.
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica ramienna / promieniowa … (przy ostrym kątowaniu odejścia naczynia).
Sprzęt: koszulka … F, długa koszulka / cewnik prowadzący … F, prowadnik …, stent balonorozprężalny pokryty / niepokryty … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia w projekcji bocznej i selektywna angiografia uwidoczniły zwężenie ok. …% / niedrożność … w odcinku przyujściowym, z krążeniem obocznym przez …. Zmianę przekroczono prowadnikiem, wykonano predylatację … i implantowano stent balonorozprężalny z wystawieniem … mm do aorty. Kontrolna angiografia wykazała pełne poszerzenie stentu, prawidłowy napływ do gałęzi obwodowych, bez rozwarstwienia i bez zatorowości obwodowej; zmniejszenie wypełniania krążenia obocznego.
Wynik: zwężenie zlikwidowane, zwężenie rezydualne < …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójne leczenie przeciwpłytkowe …, obserwacja w kierunku bólu brzucha, stopniowe rozszerzanie diety, USG doppler / angio-TK po … miesiącach.

Wnioski:
- Skuteczne stentowanie … (tętnicy krezkowej górnej / pnia trzewnego); bez zwężenia rezydualnego.`,
    textEn: `Procedure: Superior mesenteric artery / coeliac trunk angioplasty and stenting

Findings:
Indication: chronic mesenteric ischaemia (postprandial pain, weight loss) due to atherosclerotic stenosis / occlusion of ….
Target: superior mesenteric artery / coeliac trunk, ostial segment.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / … brachial / radial artery (for acutely angulated origins).
Devices: … F sheath, … F long sheath / guiding catheter, … guidewire, covered / bare balloon-expandable stent … mm × … mm.
Procedure details:
Heparin … IU was given intravenously. Lateral aortography and selective angiography showed approximately …% stenosis / occlusion of … at the ostium with collateral supply via …. The lesion was crossed, predilated … and a balloon-expandable stent was deployed protruding … mm into the aorta. Completion angiography showed full stent expansion and good antegrade flow into the distal branches, without dissection or distal embolization; collateral filling was reduced.
Result: stenosis treated, residual stenosis < …%.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy …, monitor for abdominal pain, gradual diet escalation, Doppler ultrasound / CT angiography at … months.

Conclusion:
- Successful stenting of the … (superior mesenteric artery / coeliac trunk); no residual stenosis.`,
  },
  {
    id: 'vasc_mesenteric_ami', title: 'Ostre niedokrwienie jelit – trombektomia SMA', titleEn: 'Acute mesenteric ischaemia – SMA thrombectomy',
    group: 'Vascular', section: 'Visceral / Renal', priority: 40,
    proc: ['thrombectomy', 'thrombolysis', 'stent', 'pta', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Rewaskularyzacja tętnicy krezkowej górnej w ostrym niedokrwieniu jelit – trombektomia aspiracyjna ± tromboliza i stentowanie

Opis:
Wskazanie: ostre niedokrwienie jelit w przebiegu zatoru / zakrzepicy tętnicy krezkowej górnej (angio-TK …).
Lokalizacja: tętnica krezkowa górna, od … do ….
Znieczulenie: …
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica ramienna ….
Sprzęt: koszulka … F, długa koszulka … F, prowadnik …, cewnik aspiracyjny … F, mikrocewnik …, cewnik do trombolizy z otworami bocznymi …, stent balonorozprężalny … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Aortografia w projekcji bocznej i selektywna angiografia uwidoczniły niedrożność tętnicy krezkowej górnej … (zator w odcinku pozaujściowym / zakrzepica na podłożu zwężenia przyujściowego) z brakiem wypełniania gałęzi …. Skrzeplinę przekroczono prowadnikiem i wykonano trombektomię aspiracyjną cewnikiem aspiracyjnym (… pasaży), uzyskując materiał zakrzepowy. Ze względu na resztkowe skrzepliny w gałęziach obwodowych podano dotętniczo lek trombolityczny … / pozostawiono cewnik do trombolizy …. Zwężenie przyujściowe zaopatrzono stentem balonorozprężalnym …. Kontrolna angiografia wykazała drożność tętnicy krezkowej górnej i jej gałęzi, przepływ …, bez wynaczynienia.
Wynik: przywrócony przepływ w tętnicy krezkowej górnej ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: pilna ocena chirurgiczna żywotności jelit (laparotomia / laparoskopia zwiadowcza …), antykoagulacja …, monitorowanie mleczanów i stanu klinicznego, kontrola angiograficzna po … h przy kontynuacji trombolizy.

Wnioski:
- Skuteczna rewaskularyzacja tętnicy krezkowej górnej: trombektomia aspiracyjna …, tromboliza …, stentowanie …; przywrócony przepływ ….`,
    textEn: `Procedure: Superior mesenteric artery revascularisation for acute mesenteric ischaemia – aspiration thrombectomy ± thrombolysis and stenting

Findings:
Indication: acute mesenteric ischaemia due to superior mesenteric artery embolism / thrombosis (CT angiography …).
Target: superior mesenteric artery, from … to ….
Anaesthesia: …
Access: ultrasound-guided … common femoral artery / … brachial artery.
Devices: … F sheath, … F long sheath, … guidewire, … F aspiration catheter, … microcatheter, … multi-sidehole infusion catheter, balloon-expandable stent … mm × … mm.
Procedure details:
Heparin … IU was given intravenously. Lateral aortography and selective angiography showed occlusion of the superior mesenteric artery … (embolus beyond the origin / thrombosis on an ostial stenosis) with non-opacification of the … branches. The occlusion was crossed and aspiration thrombectomy was performed (… passes) with retrieval of thrombus. Residual distal branch thrombus was treated with intra-arterial … thrombolytic / an infusion catheter was left in place …. The underlying ostial stenosis was treated with a balloon-expandable stent …. Completion angiography showed patency of the superior mesenteric artery and its branches, flow …, with no extravasation.
Result: superior mesenteric artery flow restored ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: urgent surgical assessment of bowel viability (exploratory laparotomy / laparoscopy …), anticoagulation …, monitor lactate and clinical status, check angiography at … h if thrombolysis is continued.

Conclusion:
- Successful superior mesenteric artery revascularisation: aspiration thrombectomy …, thrombolysis …, stenting …; flow restored ….`,
  },
  {
    id: 'vasc_splenic_aneurysm', title: 'Embolizacja tętniaka tętnicy śledzionowej', titleEn: 'Splenic artery aneurysm embolization',
    group: 'Vascular', section: 'Visceral / Renal', priority: 50,
    proc: ['aneurysm_embolization', 'embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Embolizacja tętniaka tętnicy śledzionowej

Opis:
Wskazanie: tętniak tętnicy śledzionowej o średnicy … mm ….
Lokalizacja: tętnica śledzionowa, odcinek … (proksymalny / środkowy / wnękowy).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, spirale odczepialne …, zatyczka naczyniowa … / stentgraft … mm × … mm.
Przebieg zabiegu:
Angiografia pnia trzewnego i selektywna angiografia tętnicy śledzionowej uwidoczniły workowaty tętniak o wymiarach … mm w odcinku … tętnicy śledzionowej, …. Wykonano embolizację metodą „przód–tył” (sandwich) – spirale umieszczono w tętnicy śledzionowej dystalnie i proksymalnie od tętniaka / wypełniono worek tętniaka spiralami z zachowaniem tętnicy macierzystej / wszczepiono stentgraft pokrywający szyję tętniaka. Kontrolna angiografia wykazała brak wypełniania tętniaka; zachowana perfuzja śledziony przez naczynia krótkie żołądka / … .
Wynik: tętniak wyłączony z krążenia; perfuzja śledziony ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola miejsca dostępu, leczenie przeciwbólowe (możliwy zespół poembolizacyjny / zawał śledziony), angio-TK po … miesiącach; szczepienia ochronne przy znacznym niedokrwieniu śledziony ….

Wnioski:
- Skuteczna embolizacja tętniaka tętnicy śledzionowej …; tętniak wyłączony z krążenia.`,
    textEn: `Procedure: Splenic artery aneurysm embolization

Findings:
Indication: splenic artery aneurysm, … mm in diameter ….
Target: splenic artery, … segment (proximal / mid / hilar).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, detachable coils …, vascular plug … / stent graft … mm × … mm.
Procedure details:
Coeliac and selective splenic angiography showed a saccular aneurysm measuring … mm in the … splenic artery, …. Embolization was performed by the "sandwich" (front-and-back door) technique with coils distal and proximal to the aneurysm / the sac was coil-packed with preservation of the parent artery / a stent graft was deployed across the aneurysm neck. Completion angiography showed no aneurysm filling; splenic perfusion was preserved via the short gastric arteries / ….
Result: aneurysm excluded; splenic perfusion ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: access-site checks, analgesia (possible post-embolization syndrome / splenic infarction), CT angiography at … months; vaccinations if extensive splenic infarction ….

Conclusion:
- Successful embolization of the splenic artery aneurysm …; aneurysm excluded.`,
  },
  {
    id: 'vasc_renal_aml', title: 'Embolizacja naczyniakomięśniakotłuszczaka nerki', titleEn: 'Renal angiomyolipoma embolization',
    group: 'Vascular', section: 'Visceral / Renal', priority: 60,
    proc: ['embolization', 'tumour_embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Selektywna embolizacja naczyniakomięśniakotłuszczaka (AML) nerki

Opis:
Wskazanie: naczyniakomięśniakotłuszczak … nerki o średnicy … mm / z tętniakami wewnątrzguzowymi … – embolizacja profilaktyczna / krwawienie z guza.
Lokalizacja: … nerka, biegun …; gałęzie zasilające z tętnicy ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, embolizat: mikrocząstki / mikrosfery … µm, mieszanina etanolu z lipiodolem …, spirale … .
Przebieg zabiegu:
Aortografia i selektywna arteriografia … tętnicy nerkowej uwidoczniły bogato unaczyniony guz … z nieprawidłowymi, krętymi naczyniami i tętniakami wewnątrzguzowymi …, zasilany przez gałęzie …. Mikrocewnik wprowadzono superselektywnie do gałęzi zasilających i wykonano embolizację … do uzyskania zastoju w naczyniach guza. Kontrolna angiografia wykazała dewaskularyzację guza i brak wypełniania tętniaków, z zachowaniem perfuzji prawidłowego miąższu nerki.
Wynik: dewaskularyzacja guza ok. …%, prawidłowy miąższ nerki zachowany.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwbólowe, przeciwgorączkowe i przeciwwymiotne (zespół poembolizacyjny), kontrola parametrów nerkowych, TK / MR po … miesiącach.

Wnioski:
- Skuteczna superselektywna embolizacja AML … nerki …; dewaskularyzacja guza z zachowaniem prawidłowego miąższu.`,
    textEn: `Procedure: Selective embolization of a renal angiomyolipoma (AML)

Findings:
Indication: … renal angiomyolipoma, … mm / with intratumoural aneurysms … – prophylactic embolization / haemorrhage from the tumour.
Target: … kidney, … pole; feeders from the … artery.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, embolic agent: … µm particles / microspheres, ethanol–lipiodol mixture …, coils ….
Procedure details:
Aortography and selective … renal arteriography demonstrated a hypervascular … tumour with abnormal tortuous vessels and intratumoural aneurysms …, supplied by … branches. The feeders were catheterised superselectively with a microcatheter and embolized with … to near-stasis in the tumour vessels. Completion angiography showed tumour devascularisation with no aneurysm filling and preserved perfusion of the normal renal parenchyma.
Result: approximately …% tumour devascularisation, normal parenchyma preserved.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: analgesia, antipyretics and antiemetics (post-embolization syndrome), renal function monitoring, CT / MRI at … months.

Conclusion:
- Successful superselective embolization of the … renal AML …; tumour devascularised with normal parenchyma preserved.`,
  },
  {
    id: 'vasc_renal_tumour_preop', title: 'Przedoperacyjna embolizacja guza nerki', titleEn: 'Pre-operative renal tumour embolization',
    group: 'Vascular', section: 'Visceral / Renal', priority: 70,
    proc: ['tumour_embolization', 'embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Przedoperacyjna embolizacja guza nerki

Opis:
Wskazanie: guz … nerki o średnicy … mm – embolizacja przed planowaną nefrektomią … / paliatywnie (krwiomocz, ból).
Lokalizacja: … tętnica nerkowa ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik …, embolizat: mikrocząstki / mikrosfery … µm, etanol bezwodny …, spirale … / zatyczka naczyniowa ….
Przebieg zabiegu:
Aortografia brzuszna uwidoczniła … tętnic(e) nerkow(e) po stronie … oraz bogato unaczyniony guz … z naczyniami patologicznymi i przetokami tętniczo-żylnymi …; pasożytnicze zasilanie z …. Wykonano selektywną embolizację gałęzi zasilających guz / całej tętnicy nerkowej … do uzyskania zastoju, a następnie zamknięcie pnia tętnicy nerkowej spiralami / zatyczką naczyniową. Kontrolna angiografia wykazała brak wypełniania naczyń guza i … tętnicy nerkowej, bez refluksu embolizatu do aorty.
Wynik: dewaskularyzacja guza / nerki ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwbólowe i przeciwwymiotne (zespół poembolizacyjny), kontrola ciśnienia tętniczego i parametrów nerkowych, zabieg operacyjny w ciągu … h.

Wnioski:
- Skuteczna przedoperacyjna embolizacja guza … nerki …; brak wypełniania naczyń guza.`,
    textEn: `Procedure: Pre-operative renal tumour embolization

Findings:
Indication: … renal tumour, … mm – embolization prior to planned … nephrectomy / palliation (haematuria, pain).
Target: … renal artery ….
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … microcatheter, embolic agent: … µm particles / microspheres, absolute ethanol …, coils … / vascular plug ….
Procedure details:
Abdominal aortography showed … renal artery(ies) on the … side and a hypervascular … tumour with neovascularity and arteriovenous shunting …; parasitic supply from …. Selective embolization of the tumour feeders / the entire … renal artery was performed to stasis, followed by occlusion of the main renal artery with coils / a vascular plug. Completion angiography showed no filling of tumour vessels or the … renal artery and no reflux of embolic into the aorta.
Result: tumour / renal devascularisation ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: analgesia and antiemetics (post-embolization syndrome), blood pressure and renal function monitoring, surgery within … h.

Conclusion:
- Successful pre-operative embolization of the … renal tumour …; no residual tumour vessel filling.`,
  },
  {
    id: 'vasc_visceral_pseudoaneurysm', title: 'Embolizacja tętniaka rzekomego tętnicy trzewnej', titleEn: 'Visceral artery pseudoaneurysm embolization',
    group: 'Vascular', section: 'Visceral / Renal', priority: 80,
    proc: ['aneurysm_embolization', 'embolization', 'stent_graft', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Embolizacja tętniaka rzekomego tętnicy …

Opis:
Wskazanie: tętniak rzekomy tętnicy … w przebiegu … (zapalenia trzustki / pooperacyjny / pourazowy / po zabiegu przezskórnym).
Lokalizacja: … (tętnica żołądkowo-dwunastnicza / śledzionowa / wątrobowa / trzustkowo-dwunastnicza …).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, spirale odczepialne …, płynny embolizat … (klej cyjanoakrylowy z lipiodolem / kopolimer EVOH) / stentgraft … mm × … mm.
Przebieg zabiegu:
Angiografia pnia trzewnego / tętnicy krezkowej górnej uwidoczniła tętniak rzekomy o wymiarach … mm wychodzący z tętnicy …, …. Mikrocewnik wprowadzono do tętnicy macierzystej i wykonano embolizację metodą „przód–tył” (zamknięcie tętnicy dystalnie i proksymalnie od szyi tętniaka) / wszczepiono stentgraft pokrywający szyję z zachowaniem tętnicy macierzystej. Kontrolna angiografia, z oceną możliwego wstecznego wypełniania przez krążenie oboczne, wykazała brak wypełniania tętniaka rzekomego.
Wynik: tętniak rzekomy wyłączony z krążenia, bez wynaczynienia.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie parametrów życiowych i morfologii, ocena niedokrwienia narządu zaopatrywanego …, angio-TK kontrolna po ….

Wnioski:
- Skuteczna embolizacja tętniaka rzekomego tętnicy … (…); brak wypełniania tętniaka rzekomego.`,
    textEn: `Procedure: Embolization of a … artery pseudoaneurysm

Findings:
Indication: … artery pseudoaneurysm secondary to … (pancreatitis / surgery / trauma / percutaneous intervention).
Target: … (gastroduodenal / splenic / hepatic / pancreaticoduodenal artery …).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, detachable coils …, liquid embolic … (cyanoacrylate glue with lipiodol / EVOH copolymer) / stent graft … mm × … mm.
Procedure details:
Coeliac / superior mesenteric angiography showed a … mm pseudoaneurysm arising from the … artery, …. The parent artery was catheterised with a microcatheter and embolized using the front-and-back door technique (occlusion distal and proximal to the neck) / a stent graft was deployed across the neck with preservation of the parent artery. Completion angiography, including assessment of retrograde collateral filling, showed no filling of the pseudoaneurysm.
Result: pseudoaneurysm excluded, no extravasation.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor vital signs and blood count, assess for end-organ ischaemia …, follow-up CT angiography at ….

Conclusion:
- Successful embolization of the … artery pseudoaneurysm (…); no residual filling.`,
  },
  {
    id: 'vasc_renal_postbiopsy_bleed', title: 'Krwawienie po biopsji nerki – embolizacja', titleEn: 'Post-biopsy renal bleed – embolization',
    group: 'Vascular', section: 'Visceral / Renal', priority: 90,
    proc: ['embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Superselektywna embolizacja krwawienia z nerki po biopsji

Opis:
Wskazanie: krwawienie po biopsji … nerki (nerka własna / przeszczepiona) – krwiak okołonerkowy / krwiomocz / spadek hemoglobiny ….
Lokalizacja: … nerka, gałąź … tętnicy nerkowej (biegun …).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, mikrospirale …, gąbka żelatynowa / mikrocząstki … µm.
Przebieg zabiegu:
Selektywna arteriografia … tętnicy nerkowej uwidoczniła … (wynaczynienie środka kontrastowego / tętniak rzekomy / przetokę tętniczo-żylną z wczesnym wypełnianiem żyły nerkowej) z gałęzi … w biegunie …. Mikrocewnik wprowadzono superselektywnie do gałęzi uszkodzonej i wykonano embolizację mikrospiralami / … możliwie dystalnie. Kontrolna angiografia wykazała ustąpienie wynaczynienia / tętniaka rzekomego / przetoki, z niewielkim ubytkiem perfuzji miąższu w obszarze embolizowanym (ok. …%).
Wynik: krwawienie zaopatrzone, utrata miąższu ograniczona do ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie parametrów życiowych, morfologii i parametrów nerkowych, nawodnienie, USG kontrolne po … h.

Wnioski:
- Skuteczna superselektywna embolizacja krwawienia z gałęzi … tętnicy nerkowej po biopsji; ustąpienie wynaczynienia.`,
    textEn: `Procedure: Superselective embolization of post-biopsy renal haemorrhage

Findings:
Indication: bleeding after … renal biopsy (native / transplant kidney) – perirenal haematoma / haematuria / haemoglobin drop ….
Target: … kidney, … branch of the renal artery (… pole).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, microcoils …, gelatin sponge / … µm particles.
Procedure details:
Selective … renal arteriography showed … (contrast extravasation / a pseudoaneurysm / an arteriovenous fistula with early renal vein opacification) from a … branch in the … pole. The injured branch was catheterised superselectively and embolized as distally as possible with microcoils / …. Completion angiography showed resolution of the extravasation / pseudoaneurysm / fistula with a small perfusion defect in the embolized territory (approximately …%).
Result: bleeding controlled, parenchymal loss limited to ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor vital signs, blood count and renal function, hydration, follow-up ultrasound at … h.

Conclusion:
- Successful superselective embolization of a post-biopsy bleed from a … renal artery branch; extravasation resolved.`,
  },
  {
    id: 'vasc_ctace', title: 'Chemoembolizacja konwencjonalna (cTACE)', titleEn: 'Conventional TACE (cTACE)',
    group: 'Vascular', section: 'Liver oncology', priority: 10,
    proc: ['chemoembolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Konwencjonalna chemoembolizacja przeztętnicza (cTACE) z lipiodolem

Opis:
Wskazanie: rak wątrobowokomórkowy (HCC), BCLC …, zmian(y) w segmencie … o średnicy … mm.
Lokalizacja: segment(y) … wątroby, gałąź … tętnicy wątrobowej ….
Znieczulenie: miejscowe, … ml lidokainy …%; premedykacja ….
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa ….
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …; emulsja lipiodolu (… ml) z cytostatykiem … (… mg), embolizat uzupełniający: gąbka żelatynowa / mikrocząstki … µm.
Przebieg zabiegu:
Angiografia tętnicy krezkowej górnej (z fazą żylną – drożność żyły wrotnej …) oraz pnia trzewnego i tętnicy wątrobowej wspólnej uwidoczniły typową / wariantową anatomię tętnic wątrobowych … oraz bogato unaczynion(e) zmian(y) w segmencie …. Wykonano rekonstrukcję objętościową (cone-beam CT) …. Mikrocewnik wprowadzono superselektywnie do gałęzi zasilającej zmianę … i podano emulsję lipiodolu z cytostatykiem do uzyskania wypełnienia guza i gałęzi wrotnych okołoguzowych, a następnie embolizat uzupełniający do uzyskania zastoju. Kontrolna angiografia / cone-beam CT wykazały gęste wysycenie guza lipiodolem i brak dalszego unaczynienia guza, z zachowaniem przepływu w tętnicy wątrobowej właściwej.
Wynik: dobre wysycenie zmian(y) lipiodolem, dewaskularyzacja guza.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: nawodnienie, leczenie przeciwbólowe, przeciwgorączkowe i przeciwwymiotne (zespół poembolizacyjny), kontrola prób wątrobowych i morfologii, TK / MR z kontrastem po … tygodniach (ocena wg mRECIST).

Wnioski:
- Wykonano superselektywną cTACE zmian(y) w segmencie … wątroby; dobre wysycenie guza lipiodolem.`,
    textEn: `Procedure: Conventional transarterial chemoembolization (cTACE) with lipiodol

Findings:
Indication: hepatocellular carcinoma (HCC), BCLC …, lesion(s) in segment … measuring … mm.
Target: liver segment(s) …, … branch of the hepatic artery ….
Anaesthesia: local, … ml of …% lidocaine; premedication ….
Access: ultrasound-guided … common femoral artery / radial artery ….
Devices: … F sheath, … F catheter, … F microcatheter, … microwire; lipiodol (… ml) emulsion with … (… mg), adjunctive embolic: gelatin sponge / … µm particles.
Procedure details:
Superior mesenteric angiography (portal venous phase – portal vein patency …) and coeliac / common hepatic angiography showed standard / variant hepatic arterial anatomy … and hypervascular lesion(s) in segment …. Cone-beam CT was performed …. The tumour feeder … was catheterised superselectively and the lipiodol–chemotherapy emulsion was delivered until filling of the tumour and peritumoural portal venules, followed by an adjunctive embolic to stasis. Completion angiography / cone-beam CT showed dense lipiodol deposition in the tumour with no residual tumour blush, with flow preserved in the proper hepatic artery.
Result: good lipiodol deposition, tumour devascularised.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: hydration, analgesia, antipyretics and antiemetics (post-embolization syndrome), liver function tests and blood count, contrast-enhanced CT / MRI at … weeks (mRECIST).

Conclusion:
- Superselective cTACE of segment … liver lesion(s); good tumour lipiodol uptake.`,
  },
  {
    id: 'vasc_debtace', title: 'Chemoembolizacja mikrosferami (DEB-TACE)', titleEn: 'Drug-eluting bead TACE (DEB-TACE)',
    group: 'Vascular', section: 'Liver oncology', priority: 20,
    proc: ['chemoembolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Chemoembolizacja przeztętnicza mikrosferami uwalniającymi lek (DEB-TACE)

Opis:
Wskazanie: … (rak wątrobowokomórkowy BCLC … / przerzuty … do wątroby), zmian(y) w segmencie … o średnicy … mm.
Lokalizacja: segment(y) … wątroby, gałąź … tętnicy wątrobowej ….
Znieczulenie: miejscowe, … ml lidokainy …%; premedykacja ….
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa ….
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …; mikrosfery uwalniające lek … µm (… ml) nasycone … (… mg).
Przebieg zabiegu:
Angiografia tętnicy krezkowej górnej (drożność żyły wrotnej …) oraz pnia trzewnego i tętnicy wątrobowej uwidoczniły anatomię tętnic wątrobowych … oraz unaczynion(e) zmian(y) w segmencie …. Wykonano cone-beam CT …. Mikrocewnik wprowadzono superselektywnie do gałęzi zasilającej i powoli podawano zawiesinę mikrosfer rozcieńczonych środkiem kontrastowym do uzyskania zwolnienia przepływu (punkt końcowy: zastój w gałęziach zasilających guz, bez refluksu). Podano … ml zawiesiny (… mg leku). Kontrolna angiografia wykazała brak unaczynienia guza z zachowanym przepływem w tętnicy macierzystej.
Wynik: dewaskularyzacja zmian(y), podano … mg leku.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: nawodnienie, leczenie objawowe zespołu poembolizacyjnego, kontrola prób wątrobowych i morfologii, TK / MR z kontrastem po … tygodniach (mRECIST).

Wnioski:
- Wykonano superselektywną DEB-TACE zmian(y) w segmencie … wątroby; uzyskano dewaskularyzację guza.`,
    textEn: `Procedure: Drug-eluting bead transarterial chemoembolization (DEB-TACE)

Findings:
Indication: … (hepatocellular carcinoma BCLC … / … liver metastases), lesion(s) in segment … measuring … mm.
Target: liver segment(s) …, … branch of the hepatic artery ….
Anaesthesia: local, … ml of …% lidocaine; premedication ….
Access: ultrasound-guided … common femoral artery / radial artery ….
Devices: … F sheath, … F catheter, … F microcatheter, … microwire; … µm drug-eluting microspheres (… ml) loaded with … (… mg).
Procedure details:
Superior mesenteric angiography (portal vein patency …) and coeliac / hepatic angiography showed the hepatic arterial anatomy … and hypervascular lesion(s) in segment …. Cone-beam CT was performed …. The feeding branch was catheterised superselectively and the bead suspension diluted with contrast was injected slowly until flow slowing (end-point: near-stasis in the tumour feeders without reflux). A total of … ml of suspension (… mg of drug) was delivered. Completion angiography showed no residual tumour blush with preserved flow in the parent artery.
Result: lesion(s) devascularised, … mg of drug delivered.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: hydration, symptomatic treatment of post-embolization syndrome, liver function tests and blood count, contrast-enhanced CT / MRI at … weeks (mRECIST).

Conclusion:
- Superselective DEB-TACE of segment … liver lesion(s); tumour devascularised.`,
  },
  {
    id: 'vasc_bland_embo_liver', title: 'Embolizacja łagodna (bland) guza wątroby', titleEn: 'Bland embolization of liver tumour',
    group: 'Vascular', section: 'Liver oncology', priority: 30,
    proc: ['embolization', 'tumour_embolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Przeztętnicza embolizacja łagodna (bland, TAE) guza wątroby

Opis:
Wskazanie: … (rak wątrobowokomórkowy / przerzuty neuroendokrynne / gruczolak wątrobowokomórkowy / pęknięty guz wątroby z krwawieniem).
Lokalizacja: segment(y) … wątroby, gałąź … tętnicy wątrobowej.
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …; mikrosfery / mikrocząstki … µm, gąbka żelatynowa ….
Przebieg zabiegu:
Angiografia tętnicy krezkowej górnej i pnia trzewnego uwidoczniła anatomię tętnic wątrobowych … oraz bogato unaczynion(e) zmian(y) w segmencie … …. Mikrocewnik wprowadzono superselektywnie do gałęzi zasilającej i wykonano embolizację mikrosferami … bez cytostatyku do uzyskania zastoju w naczyniach guza. Kontrolna angiografia wykazała brak unaczynienia guza / ustąpienie wynaczynienia, z zachowaniem przepływu w tętnicy macierzystej.
Wynik: dewaskularyzacja zmian(y).
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: nawodnienie, leczenie objawowe zespołu poembolizacyjnego, kontrola prób wątrobowych, TK / MR po … tygodniach.

Wnioski:
- Skuteczna embolizacja łagodna zmian(y) w segmencie … wątroby; dewaskularyzacja guza.`,
    textEn: `Procedure: Bland transarterial embolization (TAE) of a liver tumour

Findings:
Indication: … (hepatocellular carcinoma / neuroendocrine metastases / hepatocellular adenoma / ruptured bleeding liver tumour).
Target: liver segment(s) …, … branch of the hepatic artery.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter, … F microcatheter, … microwire; … µm microspheres / particles, gelatin sponge ….
Procedure details:
Superior mesenteric and coeliac angiography showed the hepatic arterial anatomy … and hypervascular lesion(s) in segment … …. The feeding branch was catheterised superselectively and embolized with … microspheres without chemotherapy to stasis in the tumour vessels. Completion angiography showed no residual tumour blush / resolution of extravasation, with preserved flow in the parent artery.
Result: lesion(s) devascularised.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: hydration, symptomatic treatment of post-embolization syndrome, liver function tests, CT / MRI at … weeks.

Conclusion:
- Successful bland embolization of segment … liver lesion(s); tumour devascularised.`,
  },
  {
    id: 'vasc_tare_mapping', title: 'TARE – angiografia planująca z MAA', titleEn: 'TARE – mapping angiography with MAA',
    group: 'Vascular', section: 'Liver oncology', priority: 40,
    proc: ['radioembolization', 'embolization', 'diag_angio'], anat: ['abdomen', 'chest'],
    text: `Badanie: Angiografia planująca przed radioembolizacją (TARE) z podaniem makroagregatów albuminy znakowanych technetem-99m (99mTc-MAA)

Opis:
Wskazanie: … (rak wątrobowokomórkowy / przerzuty … / rak dróg żółciowych wewnątrzwątrobowy) – kwalifikacja do TARE.
Lokalizacja: płat … wątroby / segment(y) …; miejsce podania MAA: tętnica wątrobowa … .
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa ….
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, mikrospirale … (w razie potrzeby); 99mTc-MAA … MBq.
Przebieg zabiegu:
Wykonano angiografię tętnicy krezkowej górnej (drożność żyły wrotnej …), pnia trzewnego, tętnicy wątrobowej wspólnej i właściwej oraz tętnic wątrobowych prawej i lewej. Anatomia tętnic wątrobowych: …. Oceniono odejście tętnicy żołądkowo-dwunastniczej, prawej tętnicy żołądkowej, tętnicy pęcherzykowej, tętnicy sierpowatej i innych gałęzi pozawątrobowych …. Wykonano cone-beam CT z podaniem kontrastu z planowanego miejsca podania, potwierdzając pokrycie obszaru docelowego i guza …. Gałąź … zamknięto mikrospiralami / nie wymagały embolizacji profilaktycznej. Z pozycji … podano 99mTc-MAA; pacjenta skierowano na scyntygrafię planarną / SPECT-TK.
Wynik: anatomia naczyniowa oceniona, MAA podano z pozycji …; wyniki scyntygrafii (frakcja przecieku płucnego, depozycja pozawątrobowa) – w osobnym opisie medycyny nuklearnej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: scyntygrafia / SPECT-TK w ciągu … h, kontrola miejsca wkłucia, planowanie dozymetrii i terminu leczenia TARE.

Wnioski:
- Wykonano angiografię planującą przed TARE …; podano 99mTc-MAA z tętnicy wątrobowej ….`,
    textEn: `Procedure: Pre-radioembolization (TARE) mapping angiography with technetium-99m macroaggregated albumin (99mTc-MAA)

Findings:
Indication: … (hepatocellular carcinoma / … metastases / intrahepatic cholangiocarcinoma) – work-up for TARE.
Target: … liver lobe / segment(s) …; MAA injection site: … hepatic artery.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / radial artery ….
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, microcoils … (if required); 99mTc-MAA … MBq.
Procedure details:
Superior mesenteric (portal vein patency …), coeliac, common and proper hepatic, and right and left hepatic angiography was performed. Hepatic arterial anatomy: …. The origins of the gastroduodenal, right gastric, cystic, falciform and other extrahepatic arteries were assessed …. Contrast-enhanced cone-beam CT from the planned injection position confirmed coverage of the target territory and tumour …. The … branch was coil-embolized / no prophylactic embolization was required. 99mTc-MAA was injected from …; the patient was transferred for planar scintigraphy / SPECT-CT.
Result: vascular anatomy mapped, MAA injected from …; scintigraphy results (lung shunt fraction, extrahepatic deposition) reported separately by nuclear medicine.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: scintigraphy / SPECT-CT within … h, access-site checks, dosimetry planning and scheduling of TARE treatment.

Conclusion:
- Pre-TARE mapping angiography …; 99mTc-MAA injected from the … hepatic artery.`,
  },
  {
    id: 'vasc_tare_treatment', title: 'TARE – radioembolizacja mikrosferami Y-90', titleEn: 'TARE – Y-90 radioembolization',
    group: 'Vascular', section: 'Liver oncology', priority: 50,
    proc: ['radioembolization', 'diag_angio'], anat: ['abdomen'],
    text: `Badanie: Radioembolizacja przeztętnicza (TARE) mikrosferami z itrem-90

Opis:
Wskazanie: … – leczenie TARE po angiografii planującej z dnia … (frakcja przecieku płucnego …%).
Lokalizacja: płat … wątroby / segment(y) … (segmentektomia / lobektomia radiacyjna …); miejsce podania: tętnica wątrobowa ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa ….
Sprzęt: koszulka … F, cewnik … F, mikrocewnik … F, mikroprowadnik …, zestaw do podawania mikrosfer; mikrosfery szklane / żywiczne z itrem-90, aktywność planowana … GBq.
Przebieg zabiegu:
Mikrocewnik wprowadzono do tętnicy wątrobowej … w pozycji odpowiadającej podaniu MAA. Kontrolna angiografia / cone-beam CT potwierdziły położenie końcówki, pokrycie obszaru docelowego i brak wypełniania gałęzi pozawątrobowych. Z zachowaniem zasad ochrony radiologicznej podano mikrosfery z itrem-90 przez zestaw do podawania, z okresową kontrolą fluoroskopową przepływu, bez cech refluksu / zastoju. Po podaniu wykonano płukanie systemu. Kontrolna angiografia wykazała zachowany przepływ ….
Wynik: podano … GBq itru-90 (aktywność resztkowa …), bez refluksu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obrazowanie po leczeniu (SPECT-TK bremsstrahlung / PET-TK) w celu potwierdzenia depozycji, inhibitor pompy protonowej przez … tygodni, zalecenia ochrony radiologicznej, kontrola prób wątrobowych, TK / MR po … miesiącach.

Wnioski:
- Wykonano radioembolizację … wątroby mikrosferami z itrem-90 (… GBq) z tętnicy …; bez refluksu.`,
    textEn: `Procedure: Transarterial radioembolization (TARE) with yttrium-90 microspheres

Findings:
Indication: … – TARE treatment following mapping angiography on … (lung shunt fraction …%).
Target: … liver lobe / segment(s) … (radiation segmentectomy / lobectomy …); injection site: … hepatic artery.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / radial artery ….
Devices: … F sheath, … F catheter, … F microcatheter, … microwire, microsphere delivery set; glass / resin yttrium-90 microspheres, planned activity … GBq.
Procedure details:
The microcatheter was positioned in the … hepatic artery at the MAA injection position. Angiography / cone-beam CT confirmed tip position, target coverage and no extrahepatic branch filling. Using radiation safety precautions the yttrium-90 microspheres were delivered through the delivery set with intermittent fluoroscopic flow checks, without reflux / stasis. The system was flushed after delivery. Completion angiography showed preserved flow ….
Result: … GBq of yttrium-90 delivered (residual activity …), no reflux.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: post-treatment imaging (bremsstrahlung SPECT-CT / PET-CT) to confirm distribution, proton pump inhibitor for … weeks, radiation safety advice, liver function tests, CT / MRI at … months.

Conclusion:
- Yttrium-90 radioembolization of the … liver (… GBq) from the … artery; no reflux.`,
  },
  {
    id: 'vasc_pve', title: 'Embolizacja żyły wrotnej (PVE)', titleEn: 'Portal vein embolization (PVE)',
    group: 'Vascular', section: 'Liver oncology', priority: 60,
    proc: ['pve', 'embolization'], anat: ['abdomen'],
    text: `Badanie: Przezskórna embolizacja gałęzi żyły wrotnej (PVE)

Opis:
Wskazanie: przygotowanie do rozległej resekcji wątroby (… hemihepatektomia / trisegmentektomia) przy niewystarczającej objętości przyszłego pozostałego miąższu (FLR …%).
Lokalizacja: prawa gałąź żyły wrotnej ± gałęzie segmentu IV / ….
Znieczulenie: miejscowe, … ml lidokainy …% / sedacja ….
Dostęp: przezwątrobowy … (ipsilateralny / kontralateralny), nakłucie gałęzi żyły wrotnej segmentu … pod kontrolą USG.
Sprzęt: igła … G, prowadnik …, koszulka … F, cewnik … F, mikrocewnik …; embolizat: klej cyjanoakrylowy z lipiodolem / mikrosfery … µm + spirale … / zatyczki naczyniowe ….
Przebieg zabiegu:
Pod kontrolą USG nakłuto obwodową gałąź żyły wrotnej segmentu … i wprowadzono koszulkę. Portografia z pomiarem ciśnienia wrotnego (… mmHg) uwidoczniła prawidłową / wariantową anatomię żyły wrotnej …. Wykonano embolizację gałęzi … żyły wrotnej …, a następnie kontrolną portografię, która wykazała zamknięcie zembolizowanych gałęzi z zachowanym przepływem w lewej gałęzi żyły wrotnej i gałęziach przyszłego pozostałego miąższu. Ciśnienie wrotne po embolizacji … mmHg. Kanał dostępu zamknięto spiralami / gąbką żelatynową / klejem podczas usuwania koszulki.
Wynik: skuteczne zamknięcie gałęzi … żyły wrotnej z zachowaniem przepływu w przyszłym pozostałym miąższu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja przez … h, kontrola morfologii i prób wątrobowych, wolumetria TK po … tygodniach.

Wnioski:
- Skuteczna embolizacja … gałęzi żyły wrotnej (…); przepływ w przyszłym pozostałym miąższu zachowany.`,
    textEn: `Procedure: Percutaneous portal vein embolization (PVE)

Findings:
Indication: preparation for major liver resection (… hemihepatectomy / trisectionectomy) with insufficient future liver remnant (FLR …%).
Target: right portal vein ± segment IV branches / ….
Anaesthesia: local, … ml of …% lidocaine / sedation ….
Access: … transhepatic (ipsilateral / contralateral), ultrasound-guided puncture of a segment … portal vein branch.
Devices: … G needle, … guidewire, … F sheath, … F catheter, … microcatheter; embolic agent: cyanoacrylate glue with lipiodol / … µm microspheres + coils … / vascular plugs ….
Procedure details:
A peripheral segment … portal vein branch was punctured under ultrasound guidance and a sheath was inserted. Portography with portal pressure measurement (… mmHg) showed standard / variant portal anatomy …. The … portal vein branches were embolized with …, and completion portography showed occlusion of the treated branches with preserved flow in the left portal vein and future remnant branches. Post-embolization portal pressure … mmHg. The tract was embolized with coils / gelatin sponge / glue on sheath removal.
Result: successful occlusion of the … portal vein branches with preserved flow to the future liver remnant.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observation for … h, blood count and liver function tests, CT volumetry at … weeks.

Conclusion:
- Successful embolization of the … portal vein branches (…); flow to the future liver remnant preserved.`,
  },
  {
    id: 'vasc_bae', title: 'Embolizacja tętnic oskrzelowych (krwioplucie)', titleEn: 'Bronchial artery embolization (haemoptysis)',
    group: 'Vascular', section: 'Chest vessels', priority: 10,
    proc: ['embolization', 'diag_angio'], anat: ['chest'],
    text: `Badanie: Embolizacja tętnic oskrzelowych z powodu krwioplucia

Opis:
Wskazanie: krwioplucie … (masywne / nawracające) w przebiegu … (rozstrzeni oskrzeli / gruźlicy / grzybniaka / raka płuca / mukowiscydozy); źródło krwawienia w TK … – płat … płuca ….
Lokalizacja: tętnice oskrzelowe … ± tętnice pozaoskrzelowe ogólnoustrojowe (…).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F (…), mikrocewnik … F, mikroprowadnik …; mikrocząstki / mikrosfery … µm, gąbka żelatynowa ….
Przebieg zabiegu:
Aortografia piersiowa uwidoczniła …. Selektywnie zacewnikowano … tętnicę oskrzelową (pień oskrzelowo-międzyżebrowy …), która jest poszerzona i kręta, z hiperwaskularyzacją w obszarze płata … i przeciekiem do krążenia płucnego … / bez wynaczynienia. Przed embolizacją wykluczono odejście tętnicy rdzeniowej przedniej (Adamkiewicza) z embolizowanego naczynia. Mikrocewnik wprowadzono w stabilnej pozycji dystalnej i wykonano embolizację mikrocząstkami … do uzyskania zastoju. Oceniono również tętnice pozaoskrzelowe (…) – …. Kontrolna angiografia wykazała zamknięcie patologicznych naczyń.
Wynik: zembolizowano … tętnice oskrzelowe / pozaoskrzelowe ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie krwioplucia i stanu neurologicznego (funkcje kończyn dolnych), leczenie przeciwbólowe (ból w klatce piersiowej / dysfagia przemijająca), leczenie choroby podstawowej.

Wnioski:
- Skuteczna embolizacja … tętnic oskrzelowych … mikrocząstkami; bez cech zasilania tętnicy rdzeniowej z embolizowanych naczyń.`,
    textEn: `Procedure: Bronchial artery embolization for haemoptysis

Findings:
Indication: … haemoptysis (massive / recurrent) due to … (bronchiectasis / tuberculosis / aspergilloma / lung cancer / cystic fibrosis); bleeding source on CT … – … lobe of the … lung.
Target: … bronchial arteries ± non-bronchial systemic arteries (…).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery.
Devices: … F sheath, … F catheter (…), … F microcatheter, … microwire; … µm particles / microspheres, gelatin sponge ….
Procedure details:
Thoracic aortography showed …. The … bronchial artery (intercostobronchial trunk …) was selectively catheterised; it was enlarged and tortuous with hypervascularity in the … lobe and shunting into the pulmonary circulation … / without extravasation. An anterior spinal artery (artery of Adamkiewicz) arising from the target vessel was excluded before embolization. A microcatheter was placed in a stable distal position and embolization with … particles was performed to stasis. Non-bronchial systemic arteries (…) were also assessed – …. Completion angiography showed occlusion of the abnormal vessels.
Result: … bronchial / non-bronchial arteries embolized ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor haemoptysis and neurology (lower-limb function), analgesia (chest pain / transient dysphagia), treatment of the underlying disease.

Conclusion:
- Successful particle embolization of the … bronchial arteries …; no spinal artery supply from the embolized vessels.`,
  },
  {
    id: 'vasc_pavm', title: 'Embolizacja przetoki tętniczo-żylnej płuca (PAVM)', titleEn: 'Pulmonary AVM embolization',
    group: 'Vascular', section: 'Chest vessels', priority: 20,
    proc: ['embolization', 'diag_angio'], anat: ['chest'],
    text: `Badanie: Embolizacja malformacji tętniczo-żylnej płuca (PAVM)

Opis:
Wskazanie: malformacja tętniczo-żylna płuca … (prosta / złożona) z tętnicą doprowadzającą o średnicy … mm …; dziedziczna naczyniakowatość krwotoczna (HHT) ….
Lokalizacja: płat … płuca …, segment ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: żyła udowa wspólna … pod kontrolą USG.
Sprzęt: koszulka … F, długa koszulka … F, cewnik … F (typu pigtail do pnia płucnego / selektywny), mikrocewnik …, spirale odczepialne …, zatyczka naczyniowa … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie; zachowano szczególną staranność w eliminacji pęcherzyków powietrza i skrzeplin z systemu (filtry w liniach). Wykonano pomiar ciśnienia w tętnicy płucnej (… mmHg) i angiografię płucną …, uwidaczniając PAVM w płacie … z … tętnicą (tętnicami) doprowadzającą(ymi) i wczesnym wypełnianiem żyły odprowadzającej. Selektywnie zacewnikowano tętnicę doprowadzającą i wykonano embolizację … (spiralami / zatyczką naczyniową) możliwie blisko worka, dystalnie od odejścia gałęzi do prawidłowego miąższu. Kontrolna angiografia wykazała zamknięcie tętnicy doprowadzającej i brak wypełniania worka i żyły odprowadzającej, z zachowaniem gałęzi do prawidłowego miąższu.
Wynik: PAVM wyłączona z krążenia.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja w kierunku bólu opłucnowego, profilaktyka antybiotykowa przed zabiegami stomatologicznymi / inwazyjnymi, TK klatki piersiowej po … miesiącach, badania przesiewowe w kierunku HHT ….

Wnioski:
- Skuteczna embolizacja PAVM płata … płuca … ; brak przepływu przez malformację.`,
    textEn: `Procedure: Pulmonary arteriovenous malformation (PAVM) embolization

Findings:
Indication: … pulmonary AVM (simple / complex) with a … mm feeding artery …; hereditary haemorrhagic telangiectasia (HHT) ….
Target: … lobe of the … lung, segment ….
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral vein.
Devices: … F sheath, … F long sheath, … F catheter (pigtail for main pulmonary artery / selective), … microcatheter, detachable coils …, vascular plug … mm.
Procedure details:
Heparin … IU was given intravenously; meticulous care was taken to exclude air and thrombus from the system (in-line filters). Pulmonary artery pressure was measured (… mmHg) and pulmonary angiography … showed a PAVM in the … lobe with … feeding artery(ies) and early opacification of the draining vein. The feeding artery was selectively catheterised and embolized with … (coils / a vascular plug) as close to the sac as possible, distal to branches supplying normal lung. Completion angiography showed occlusion of the feeding artery with no filling of the sac or draining vein, and preserved branches to normal lung.
Result: PAVM excluded.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for pleuritic pain, antibiotic prophylaxis before dental / invasive procedures, chest CT at … months, HHT screening ….

Conclusion:
- Successful embolization of the … lobe PAVM …; no residual flow through the malformation.`,
  },
  {
    id: 'vasc_pe_cdt', title: 'Leczenie przezcewnikowe zatorowości płucnej', titleEn: 'Catheter-directed therapy for pulmonary embolism',
    group: 'Vascular', section: 'Chest vessels', priority: 30,
    proc: ['thrombectomy', 'thrombolysis', 'diag_angio'], anat: ['chest'],
    text: `Badanie: Leczenie przezcewnikowe ostrej zatorowości płucnej – trombektomia aspiracyjna / tromboliza dotętnicza

Opis:
Wskazanie: ostra zatorowość płucna … (wysokiego ryzyka / pośredniego-wysokiego ryzyka) z przeciążeniem prawej komory (RV/LV …) …; przeciwwskazania do trombolizy systemowej / jej nieskuteczność ….
Lokalizacja: tętnica płucna … (pień / tętnica płucna prawa / lewa / tętnice płatowe …).
Znieczulenie: miejscowe, … ml lidokainy …% / sedacja ….
Dostęp: żyła udowa wspólna … / żyła szyjna wewnętrzna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F (typu pigtail), prowadnik …, cewnik aspiracyjny o dużym świetle … F / system do trombektomii mechanicznej …, cewnik(i) do trombolizy z otworami bocznymi … / wspomagane ultradźwiękami ….
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Wykonano pomiar ciśnień w prawej komorze i tętnicy płucnej (ciśnienie skurczowe / średnie … mmHg) oraz angiografię płucną, która uwidoczniła materiał zatorowy w …. Wykonano trombektomię aspiracyjną … (… pasaży), usuwając znaczną ilość materiału zakrzepowego / wprowadzono cewnik(i) do trombolizy do tętnic(y) płucn(ych) … i rozpoczęto wlew leku trombolitycznego … mg/h. Kontrolna angiografia wykazała poprawę perfuzji płuc …; ciśnienie w tętnicy płucnej po zabiegu … mmHg.
Wynik: zmniejszenie obciążenia skrzeplinami, poprawa perfuzji i spadek ciśnienia w tętnicy płucnej ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie na oddziale intensywnego nadzoru, antykoagulacja …, kontrola fibrynogenu i morfologii w trakcie wlewu, czas trwania trombolizy …, echokardiografia kontrolna po … h.

Wnioski:
- Wykonano przezcewnikowe leczenie zatorowości płucnej (… trombektomia aspiracyjna / tromboliza dotętnicza); poprawa perfuzji i spadek ciśnienia w tętnicy płucnej z … do … mmHg.`,
    textEn: `Procedure: Catheter-directed therapy for acute pulmonary embolism – aspiration thrombectomy / intra-arterial thrombolysis

Findings:
Indication: … acute pulmonary embolism (high-risk / intermediate-high-risk) with right ventricular strain (RV/LV …) …; contraindication to / failure of systemic thrombolysis ….
Target: … pulmonary artery (main / right / left / lobar arteries …).
Anaesthesia: local, … ml of …% lidocaine / sedation ….
Access: ultrasound-guided … common femoral vein / … internal jugular vein.
Devices: … F sheath, … F pigtail catheter, … guidewire, … F large-bore aspiration catheter / mechanical thrombectomy system …, multi-sidehole infusion catheter(s) … / ultrasound-assisted catheter(s) ….
Procedure details:
Heparin … IU was given intravenously. Right ventricular and pulmonary artery pressures were measured (systolic / mean … mmHg) and pulmonary angiography showed embolic material in …. Aspiration thrombectomy … was performed (… passes) with removal of a substantial thrombus burden / infusion catheter(s) were placed in the … pulmonary artery(ies) and a … thrombolytic infusion at … mg/h was started. Completion angiography showed improved pulmonary perfusion …; post-procedural pulmonary artery pressure … mmHg.
Result: reduced thrombus burden, improved perfusion and reduced pulmonary artery pressure ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: high-dependency / intensive care monitoring, anticoagulation …, fibrinogen and blood count during infusion, infusion duration …, follow-up echocardiography at … h.

Conclusion:
- Catheter-directed therapy for pulmonary embolism (… aspiration thrombectomy / intra-arterial thrombolysis); improved perfusion, pulmonary artery pressure reduced from … to … mmHg.`,
  },
  {
    id: 'vasc_svc_stent', title: 'Stentowanie żyły głównej górnej', titleEn: 'Superior vena cava stenting',
    group: 'Vascular', section: 'Chest vessels', priority: 40,
    proc: ['stent', 'pta'], anat: ['chest', 'neck'],
    text: `Badanie: Stentowanie żyły głównej górnej w zespole żyły głównej górnej

Opis:
Wskazanie: zespół żyły głównej górnej w przebiegu … (nowotworu złośliwego … / zwężenia łagodnego – po cewnikach / elektrodach …).
Lokalizacja: żyła główna górna ± żyła ramienno-głowowa ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: żyła udowa wspólna … i/lub żyła szyjna wewnętrzna / ramienna … pod kontrolą USG.
Sprzęt: koszulka … F, cewnik … F, prowadnik hydrofilny …, prowadnik sztywny …, stent samorozprężalny … mm × … mm, cewnik balonowy … mm.
Przebieg zabiegu:
Wenografia uwidoczniła … (zwężenie ok. …% / niedrożność) żyły głównej górnej na długości … mm, z rozległym krążeniem obocznym przez …. Zmianę przekroczono prowadnikiem hydrofilnym i wymieniono go na prowadnik sztywny. Podano heparynę … j.m. dożylnie. Wykonano predylatację …, implantowano stent samorozprężalny z pokryciem całej zmiany i dylatację balonem w stencie. Kontrolna wenografia wykazała szeroką drożność żyły głównej górnej z swobodnym odpływem do prawego przedsionka i ustąpienie wypełniania krążenia obocznego.
Wynik: drożna żyła główna górna, zwężenie rezydualne < …%.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwkrzepliwe / przeciwpłytkowe …, ocena kliniczna ustępowania obrzęku, leczenie onkologiczne choroby podstawowej.

Wnioski:
- Skuteczne stentowanie żyły głównej górnej …; drożność przywrócona, ustąpienie krążenia obocznego.`,
    textEn: `Procedure: Superior vena cava stenting for SVC syndrome

Findings:
Indication: superior vena cava syndrome due to … (malignancy … / benign stenosis – catheter / pacing lead related …).
Target: superior vena cava ± … brachiocephalic vein.
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral vein and/or … internal jugular / brachial vein.
Devices: … F sheath, … F catheter, … hydrophilic guidewire, … stiff guidewire, self-expanding stent … mm × … mm, … mm balloon catheter.
Procedure details:
Venography showed … (approximately …% stenosis / occlusion) of the superior vena cava over … mm with extensive collateral flow via …. The lesion was crossed with a hydrophilic guidewire, exchanged for a stiff guidewire, and heparin … IU was given intravenously. After predilatation … a self-expanding stent was deployed covering the entire lesion and post-dilated. Completion venography showed wide patency of the SVC with free flow into the right atrium and loss of collateral filling.
Result: patent superior vena cava, residual stenosis < …%.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: anticoagulant / antiplatelet therapy …, clinical assessment of oedema resolution, oncological treatment of the underlying disease.

Conclusion:
- Successful superior vena cava stenting …; patency restored with loss of collateral flow.`,
  },
  {
    id: 'vasc_subclavian_stent', title: 'Stentowanie tętnicy podobojczykowej', titleEn: 'Subclavian artery stenting',
    group: 'Vascular', section: 'Chest vessels', priority: 50,
    proc: ['stent', 'pta', 'diag_angio'], anat: ['chest', 'neck', 'upper_limb'],
    text: `Badanie: Angioplastyka ze stentowaniem … tętnicy podobojczykowej

Opis:
Wskazanie: zwężenie / niedrożność … tętnicy podobojczykowej z … (zespołem podkradania tętnicy podobojczykowej / chromaniem kończyny górnej / przed lub po pomostowaniu z użyciem tętnicy piersiowej wewnętrznej / przed wytworzeniem przetoki dializacyjnej).
Lokalizacja: … tętnica podobojczykowa, odcinek proksymalny (przed odejściem tętnicy kręgowej).
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG ± tętnica ramienna / promieniowa … (w niedrożności).
Sprzęt: koszulka / długa koszulka … F, cewnik … F, prowadnik …, stent balonorozprężalny / samorozprężalny … mm × … mm.
Przebieg zabiegu:
Podano heparynę … j.m. dożylnie. Angiografia łuku aorty uwidoczniła … (zwężenie ok. …% / niedrożność) proksymalnego odcinka … tętnicy podobojczykowej z wstecznym przepływem w … tętnicy kręgowej …. Zmianę przekroczono prowadnikiem, wykonano predylatację … i implantowano stent z precyzyjnym pozycjonowaniem względem ujścia tętnicy kręgowej i tętnicy piersiowej wewnętrznej …. Kontrolna angiografia wykazała pełne poszerzenie stentu, drożność tętnicy kręgowej z przywróceniem przepływu antegradowego oraz drożność tętnicy piersiowej wewnętrznej.
Wynik: zwężenie zlikwidowane, zwężenie rezydualne < …%; przepływ w tętnicy kręgowej antegradowy.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie stanu neurologicznego, podwójne leczenie przeciwpłytkowe …, kontrola tętna i ciśnienia na obu kończynach górnych, USG doppler po … miesiącach.

Wnioski:
- Skuteczne stentowanie … tętnicy podobojczykowej; przywrócony antegradowy przepływ w tętnicy kręgowej.`,
    textEn: `Procedure: … subclavian artery angioplasty and stenting

Findings:
Indication: … subclavian artery stenosis / occlusion with … (subclavian steal syndrome / arm claudication / before or after internal mammary artery coronary grafting / prior to dialysis access creation).
Target: … subclavian artery, proximal segment (proximal to the vertebral artery origin).
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery ± … brachial / radial artery (for occlusions).
Devices: … F sheath / long sheath, … F catheter, … guidewire, balloon-expandable / self-expanding stent … mm × … mm.
Procedure details:
Heparin … IU was given intravenously. Arch aortography showed … (approximately …% stenosis / occlusion) of the proximal … subclavian artery with retrograde flow in the … vertebral artery …. The lesion was crossed, predilated … and a stent was deployed with precise positioning relative to the vertebral and internal mammary artery origins …. Completion angiography showed full stent expansion, a patent vertebral artery with restored antegrade flow, and a patent internal mammary artery.
Result: stenosis treated, residual stenosis < …%; antegrade vertebral flow.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological monitoring, dual antiplatelet therapy …, check pulses and bilateral arm blood pressure, Doppler ultrasound at … months.

Conclusion:
- Successful stenting of the … subclavian artery; antegrade vertebral artery flow restored.`,
  },
  {
    id: 'vasc_visceral_angio_diag', title: 'Arteriografia trzewna i nerkowa – diagnostyczna', titleEn: 'Diagnostic visceral and renal arteriography',
    group: 'Vascular', section: 'Visceral / Renal', priority: 5,
    proc: ['diag_angio'], anat: ['abdomen'],
    text: `Badanie: Diagnostyczna arteriografia tętnic trzewnych / nerkowych

Opis:
Wskazanie: …
Lokalizacja: pień trzewny, tętnica krezkowa górna / dolna, tętnice nerkowe ….
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … pod kontrolą USG / tętnica promieniowa ….
Sprzęt: koszulka … F, cewnik typu pigtail … F, cewnik selektywny … F, mikrocewnik … (w razie potrzeby).
Przebieg zabiegu:
Wykonano aortografię brzuszną, a następnie selektywną angiografię … z fazą tętniczą, miąższową i żylną. Pień trzewny, tętnica krezkowa górna i dolna oraz tętnice nerkowe drożne, bez istotnych zwężeń, tętniaków ani wynaczynienia środka kontrastowego. Anatomia naczyniowa: …. W fazie żylnej drożna żyła wrotna / żyły nerkowe. …. Cewnik usunięto, hemostazę uzyskano ….
Wynik: …
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie z unieruchomieniem kończyny przez … h, kontrola miejsca wkłucia, nawodnienie.

Wnioski:
- Arteriografia trzewna / nerkowa bez istotnych nieprawidłowości. / …`,
    textEn: `Procedure: Diagnostic visceral / renal arteriography

Findings:
Indication: …
Target: coeliac trunk, superior / inferior mesenteric artery, renal arteries ….
Anaesthesia: local, … ml of …% lidocaine.
Access: ultrasound-guided … common femoral artery / radial artery ….
Devices: … F sheath, … F pigtail catheter, … F selective catheter, … microcatheter (if required).
Procedure details:
Abdominal aortography was followed by selective … angiography with arterial, parenchymal and venous phases. The coeliac trunk, superior and inferior mesenteric arteries and renal arteries are patent without significant stenosis, aneurysm or contrast extravasation. Vascular anatomy: …. The portal vein / renal veins are patent in the venous phase. …. The catheter was removed and haemostasis achieved with ….
Result: …
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest with limb immobilisation for … h, access-site checks, hydration.

Conclusion:
- Unremarkable visceral / renal arteriography. / …`,
  },
];

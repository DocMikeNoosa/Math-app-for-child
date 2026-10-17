// Neuro templates (part 1): diagnostic angiography, acute stroke, intracranial aneurysms.
export default [
{ id: 'neuro_dsa_normal', title: 'Angiografia mózgowa (DSA) – wynik prawidłowy', titleEn: 'Cerebral angiography (DSA) – normal', group: 'Neuro', section: 'Neuro diagnostic', priority: 10,
  proc: ['neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Cyfrowa angiografia subtrakcyjna (DSA) tętnic mózgowych

Opis:
Wskazanie: …
Lokalizacja: tętnice szyjne wspólne, wewnętrzne i zewnętrzne obustronnie oraz tętnice kręgowe (angiografia …-naczyniowa)
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano selektywne cewnikowanie tętnic szyjnych wewnętrznych, szyjnych zewnętrznych i tętnic kręgowych …, z projekcjami AP, bocznymi i skośnymi, z oceną fazy tętniczej, kapilarnej i żylnej. Tętnice szyjne wewnętrzne w odcinkach C1–C7 prawidłowe, bez zwężeń. Tętnice przednie mózgu (A1–A3) i środkowe mózgu (M1–M4) prawidłowo wypełnione, tętnica łącząca przednia …. Tętnice kręgowe (V1–V4) prawidłowe, dominacja …; tętnica podstawna, tętnice móżdżkowe (PICA, AICA, SCA) i tętnice tylne mózgu (P1–P4) bez zmian; tętnice łączące tylne …. Nie stwierdzono tętniaka, malformacji naczyniowej, przetoki tętniczo-żylnej, zwężeń ani niedrożności. Faza żylna prawidłowa, zatoki żylne opony twardej drożne. Hemostaza miejsca wkłucia ….
Wynik: prawidłowy obraz tętnic wewnątrz- i zewnątrzczaszkowych.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie w łóżku przez … h, obserwacja miejsca wkłucia i stanu neurologicznego.

Wnioski:
- Prawidłowa angiografia mózgowa …-naczyniowa – bez tętniaka, malformacji naczyniowej ani istotnych zwężeń.`,
  textEn: `Procedure: Digital subtraction angiography (DSA) of the cerebral arteries

Findings:
Indication: …
Target: bilateral common, internal and external carotid arteries and vertebral arteries (…-vessel angiography)
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
Selective catheterisation of the internal carotid, external carotid and vertebral arteries … was performed with AP, lateral and oblique projections, assessing the arterial, capillary and venous phases. The internal carotid arteries are normal in segments C1–C7 with no stenosis. The anterior cerebral (A1–A3) and middle cerebral (M1–M4) arteries fill normally; anterior communicating artery …. The vertebral arteries (V1–V4) are normal, … dominant; the basilar artery, cerebellar arteries (PICA, AICA, SCA) and posterior cerebral arteries (P1–P4) are unremarkable; posterior communicating arteries …. No aneurysm, vascular malformation, arteriovenous shunt, stenosis or occlusion. Normal venous phase with patent dural venous sinuses. Haemostasis of the puncture site ….
Result: normal intracranial and extracranial arteries.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest for … h, monitoring of the puncture site and neurological status.

Conclusion:
- Normal …-vessel cerebral angiogram – no aneurysm, vascular malformation or significant stenosis.` },

{ id: 'neuro_dsa_aneurysm', title: 'Angiografia mózgowa (DSA) – tętniak', titleEn: 'Cerebral angiography (DSA) – aneurysm', group: 'Neuro', section: 'Neuro diagnostic', priority: 20,
  proc: ['neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Cyfrowa angiografia subtrakcyjna (DSA) tętnic mózgowych z angiografią rotacyjną 3D

Opis:
Wskazanie: …
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano selektywną angiografię tętnic szyjnych wewnętrznych i tętnic kręgowych … w projekcjach standardowych i skośnych oraz angiografię rotacyjną 3D z rekonstrukcjami. Uwidoczniono tętniak … (workowaty), odchodzący od …, o wymiarach ok. … × … mm, z szyją szerokości … mm (stosunek kopuła/szyja …), skierowany …, o kształcie … (płaty/pęcherzyk …). Z szyi/podstawy tętniaka odchodzą …. Pozostałe tętnice wewnątrzczaszkowe bez innych tętniaków, bez zwężeń i bez malformacji. Skurcz naczyniowy …. Odpływ żylny prawidłowy. Hemostaza miejsca wkłucia ….
Wynik: tętniak … o wymiarach … mm; pozostałe naczynia bez zmian.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: omówienie wyniku na konsylium neurochirurgiczno-neuroradiologicznym; obserwacja miejsca wkłucia i stanu neurologicznego.

Wnioski:
- Tętniak … o wymiarach … × … mm, szyja … mm.
- Bez innych tętniaków ani malformacji naczyniowych.`,
  textEn: `Procedure: Digital subtraction angiography (DSA) of the cerebral arteries with 3D rotational angiography

Findings:
Indication: …
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
Selective angiography of the internal carotid and vertebral arteries … was performed in standard and oblique projections, together with 3D rotational angiography and reconstructions. A … saccular aneurysm arising from … is demonstrated, measuring approximately … × … mm with a neck width of … mm (dome-to-neck ratio …), projecting …, with … morphology (lobulation/daughter sac …). … arises from the neck/base of the aneurysm. The remaining intracranial arteries show no further aneurysm, stenosis or malformation. Vasospasm: …. Normal venous drainage. Haemostasis of the puncture site ….
Result: … aneurysm measuring … mm; remaining vessels unremarkable.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: discussion at the neurovascular multidisciplinary meeting; monitoring of the puncture site and neurological status.

Conclusion:
- … aneurysm measuring … × … mm, neck … mm.
- No other aneurysm or vascular malformation.` },

{ id: 'neuro_dsa_sah_negative', title: 'DSA w SAH – bez źródła krwawienia', titleEn: 'DSA in SAH – no source identified', group: 'Neuro', section: 'Neuro diagnostic', priority: 30,
  proc: ['neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Cyfrowa angiografia subtrakcyjna (DSA) tętnic mózgowych w krwotoku podpajęczynówkowym

Opis:
Wskazanie: krwotok podpajęczynówkowy w TK (…).
Lokalizacja: tętnice szyjne wewnętrzne i zewnętrzne obustronnie, obie tętnice kręgowe (angiografia 6-naczyniowa)
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano selektywną angiografię obu tętnic szyjnych wewnętrznych, obu tętnic szyjnych zewnętrznych i obu tętnic kręgowych z uwidocznieniem obu PICA i tętnic łączących tylnych, w projekcjach standardowych i skośnych, oraz angiografię rotacyjną 3D …. Nie uwidoczniono tętniaka, malformacji tętniczo-żylnej, przetoki tętniczo-żylnej opony twardej ani rozwarstwienia. Skurcz naczyniowy …. Faza żylna prawidłowa, zatoki żylne drożne. Hemostaza miejsca wkłucia ….
Wynik: nie stwierdzono źródła krwawienia w angiografii.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: w zależności od wzorca krwawienia (okołopniowy/nieokołopniowy) zalecana kontrolna DSA za ok. … tygodni; rozważyć MR głowy i odcinka szyjnego kręgosłupa.

Wnioski:
- Angiografia 6-naczyniowa bez źródła krwotoku podpajęczynówkowego (bez tętniaka, AVM, dAVF).
- Zalecana kontrolna DSA za … tygodni.`,
  textEn: `Procedure: Digital subtraction angiography (DSA) of the cerebral arteries for subarachnoid haemorrhage

Findings:
Indication: subarachnoid haemorrhage on CT (…).
Target: bilateral internal and external carotid arteries and both vertebral arteries (6-vessel angiography)
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
Selective angiography of both internal carotid, both external carotid and both vertebral arteries was performed, visualising both PICAs and the posterior communicating arteries, in standard and oblique projections, together with 3D rotational angiography …. No aneurysm, arteriovenous malformation, dural arteriovenous fistula or dissection is demonstrated. Vasospasm: …. Normal venous phase with patent sinuses. Haemostasis of the puncture site ….
Result: no angiographic source of haemorrhage identified.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: depending on the haemorrhage pattern (perimesencephalic/non-perimesencephalic), repeat DSA in approximately … weeks is recommended; consider MRI of the brain and cervical spine.

Conclusion:
- Angiogram-negative subarachnoid haemorrhage on 6-vessel angiography (no aneurysm, AVM or dAVF).
- Repeat DSA recommended in … weeks.` },
{ id: 'neuro_3dra', title: 'Angiografia rotacyjna 3D', titleEn: '3D rotational angiography', group: 'Neuro', section: 'Neuro diagnostic', priority: 40,
  proc: ['neuro_angio'], anat: ['brain'],
  text: `Badanie: Angiografia rotacyjna 3D (3D-RA) tętnic mózgowych

Opis:
Wskazanie: …
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Po selektywnym zacewnikowaniu … wykonano akwizycję rotacyjną z podaniem środka kontrastowego wstrzykiwaczem automatycznym (… ml, … ml/s). Na stacji roboczej wykonano rekonstrukcje objętościowe (VR) i MIP oraz pomiary. Uwidoczniono …, o wymiarach … × … × … mm, szyja … mm, stosunek kopuła/szyja …. Relacja do naczyń sąsiednich: …. Wyznaczono optymalne projekcje robocze: …. Hemostaza miejsca wkłucia ….
Wynik: …; wyznaczono projekcje robocze do leczenia wewnątrznaczyniowego.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: ….

Wnioski:
- Angiografia rotacyjna 3D …: ….`,
  textEn: `Procedure: 3D rotational angiography (3D-RA) of the cerebral arteries

Findings:
Indication: …
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
After selective catheterisation of … a rotational acquisition was performed with power-injected contrast (… ml at … ml/s). Volume-rendered and MIP reconstructions and measurements were performed on the workstation. … is demonstrated, measuring … × … × … mm, neck … mm, dome-to-neck ratio …. Relationship to adjacent vessels: …. Optimal working projections were determined: …. Haemostasis of the puncture site ….
Result: …; working projections defined for endovascular treatment.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ….

Conclusion:
- 3D rotational angiography of …: ….` },

{ id: 'neuro_dsa_fu_coiling', title: 'Kontrolna DSA po embolizacji tętniaka spiralami', titleEn: 'Follow-up DSA after aneurysm coiling', group: 'Neuro', section: 'Neuro diagnostic', priority: 50,
  proc: ['neuro_angio', 'coiling'], anat: ['brain'],
  text: `Badanie: Kontrolna angiografia mózgowa (DSA) po embolizacji tętniaka spiralami

Opis:
Wskazanie: kontrola … miesięcy po embolizacji tętniaka … spiralami (…).
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano selektywną angiografię … w projekcjach roboczych z poprzedniego zabiegu oraz angiografię rotacyjną 3D …. Pakiet spiral w tętniaku … stabilny / z cechami kompakcji …. Tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi / z resztkowym wypełnieniem worka, o wymiarach … mm (Raymond-Roy klasa …), w porównaniu z badaniem z dnia … – bez zmian / progresja …. Naczynie macierzyste i gałęzie odchodzące w okolicy szyi drożne. Bez nowych tętniaków. Hemostaza miejsca wkłucia ….
Wynik: Raymond-Roy klasa …; ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: …; dalsza kontrola (MRA/DSA) za … miesięcy.

Wnioski:
- Tętniak … po embolizacji spiralami: Raymond-Roy klasa …, stabilny / rekanalizacja ….`,
  textEn: `Procedure: Follow-up cerebral angiography (DSA) after aneurysm coiling

Findings:
Indication: follow-up … months after coil embolisation of a … aneurysm (…).
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
Selective angiography of … was performed in the working projections of the index procedure, with 3D rotational angiography …. The coil mass in the … aneurysm is stable / shows compaction …. The aneurysm is completely occluded / shows a neck remnant / shows residual aneurysm filling measuring … mm (Raymond-Roy class …), unchanged / progressed … compared with the study of …. The parent artery and branches arising near the neck are patent. No new aneurysm. Haemostasis of the puncture site ….
Result: Raymond-Roy class …; ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: …; further follow-up (MRA/DSA) in … months.

Conclusion:
- Coiled … aneurysm: Raymond-Roy class …, stable / recanalised ….` },

{ id: 'neuro_dsa_fu_flow_diverter', title: 'Kontrolna DSA po stencie przekierowującym przepływ', titleEn: 'Follow-up DSA after flow diverter', group: 'Neuro', section: 'Neuro diagnostic', priority: 60,
  proc: ['neuro_angio', 'flow_diverter'], anat: ['brain'],
  text: `Badanie: Kontrolna angiografia mózgowa (DSA) po implantacji stentu przekierowującego przepływ

Opis:
Wskazanie: kontrola … miesięcy po implantacji stentu przekierowującego przepływ w … z powodu tętniaka ….
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik diagnostyczny … F (kształt …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano selektywną angiografię … w projekcjach roboczych oraz angiografię rotacyjną 3D / tomografię wiązki stożkowej z rozcieńczonym kontrastem …. Stent prawidłowo rozprężony, przylegający do ściany naczynia, bez przemieszczenia. Hiperplazja neointimy …, bez istotnego zwężenia w stencie / zwężenie …%. Tętniak: całkowicie wyłączony z krążenia / resztkowe wypełnienie … (skala O'Kelly-Marotta (OKM) …). Gałęzie przykryte stentem (…) drożne / …. Hemostaza miejsca wkłucia ….
Wynik: OKM …; stent drożny.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwpłytkowe: … (decyzja o modyfikacji …); dalsza kontrola za … miesięcy.

Wnioski:
- Stan po implantacji stentu przekierowującego przepływ w …: tętniak OKM …, stent drożny ….`,
  textEn: `Procedure: Follow-up cerebral angiography (DSA) after flow diverter implantation

Findings:
Indication: follow-up … months after flow diverter implantation in … for a … aneurysm.
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheter (… shape), … hydrophilic guidewire.
Procedure details:
Selective angiography of … was performed in the working projections, with 3D rotational angiography / contrast-enhanced cone-beam CT …. The stent is fully expanded with good wall apposition and no migration. Neointimal hyperplasia …, no significant in-stent stenosis / …% stenosis. Aneurysm: completely excluded from the circulation / residual filling … (O'Kelly-Marotta (OKM) grade …). Covered branches (…) are patent / …. Haemostasis of the puncture site ….
Result: OKM grade …; patent stent.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: antiplatelet therapy: … (decision on modification …); further follow-up in … months.

Conclusion:
- Status post flow diverter in …: aneurysm OKM grade …, patent stent ….` },

{ id: 'neuro_bto', title: 'Próba okluzji balonowej tętnicy szyjnej wewnętrznej', titleEn: 'Balloon test occlusion of the ICA', group: 'Neuro', section: 'Neuro other', priority: 10,
  proc: ['bot', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Próba okluzji balonowej (BOT) tętnicy szyjnej wewnętrznej

Opis:
Wskazanie: …; ocena tolerancji trwałego zamknięcia tętnicy szyjnej wewnętrznej ….
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek …
Znieczulenie: miejscowe, … ml lidokainy …%; pacjent przytomny, w pełnym kontakcie.
Dostęp: tętnica udowa wspólna … (koszulka … F) oraz tętnica udowa wspólna … (koszulka … F) do angiografii kontralateralnej.
Sprzęt: cewnik prowadzący … F, balon okluzyjny podatny … × … mm, cewnik diagnostyczny … F; heparyna … j.m. i.v. (ACT … s).
Przebieg zabiegu:
Wykonano wyjściową angiografię obu tętnic szyjnych wewnętrznych i tętnicy kręgowej …; tętnica łącząca przednia …, tętnica łącząca tylna …. Balon umieszczono w tętnicy szyjnej wewnętrznej … w odcinku … i napełniono do całkowitego zamknięcia światła, potwierdzonego kontrastem. Okluzję utrzymywano przez … min z oceną neurologiczną co … min; wykonano test hipotensyjny (obniżenie ciśnienia średniego o …%) …. W trakcie okluzji wykonano angiografię tętnicy szyjnej wewnętrznej … i tętnicy kręgowej …: opóźnienie fazy żylnej półkuli … względem strony przeciwnej wynosi … s. Nie wystąpiły objawy neurologiczne. Po opróżnieniu balonu kontrolna angiografia bez rozwarstwienia i bez zatorów.
Wynik: próba okluzji balonowej ujemna (tolerowana) klinicznie i angiograficznie (opóźnienie żylne … s).
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna przez … h; wynik do decyzji o trwałym zamknięciu tętnicy / ….

Wnioski:
- Próba okluzji balonowej tętnicy szyjnej wewnętrznej … tolerowana klinicznie przez … min, opóźnienie fazy żylnej … s.`,
  textEn: `Procedure: Balloon test occlusion (BTO) of the internal carotid artery

Findings:
Indication: …; assessment of tolerance to permanent occlusion of the … internal carotid artery.
Target: … internal carotid artery, … segment
Anaesthesia: local, … ml of …% lidocaine; patient awake and fully cooperative.
Access: … common femoral artery (… F sheath) and … common femoral artery (… F sheath) for contralateral angiography.
Devices: … F guide catheter, … × … mm compliant occlusion balloon, … F diagnostic catheter; heparin … IU i.v. (ACT … s).
Procedure details:
Baseline angiography of both internal carotid arteries and the … vertebral artery was performed; anterior communicating artery …, posterior communicating artery …. The balloon was positioned in the … segment of the … internal carotid artery and inflated to complete occlusion, confirmed with contrast. Occlusion was maintained for … min with neurological assessment every … min; a hypotensive challenge (mean arterial pressure reduced by …%) was performed …. During occlusion, angiography of the … internal carotid and … vertebral arteries showed a venous phase delay of … s in the … hemisphere compared with the contralateral side. No neurological deficit occurred. After balloon deflation, control angiography showed no dissection or embolic occlusion.
Result: balloon test occlusion negative (tolerated) clinically and angiographically (venous delay … s).
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation for … h; result for the decision on permanent vessel occlusion / ….

Conclusion:
- Balloon test occlusion of the … internal carotid artery clinically tolerated for … min, venous phase delay … s.` },

{ id: 'neuro_spinal_dsa', title: 'Angiografia rdzeniowa (DSA)', titleEn: 'Spinal angiography (DSA)', group: 'Neuro', section: 'Neuro other', priority: 20,
  proc: ['spinal_angio', 'neuro_angio'], anat: ['spine'],
  text: `Badanie: Cyfrowa angiografia subtrakcyjna (DSA) rdzeniowa

Opis:
Wskazanie: …
Lokalizacja: tętnice segmentalne (międzyżebrowe i lędźwiowe) od poziomu … do …, tętnice kręgowe, pnie szyjno-tarczowe i żebrowo-szyjne, tętnice biodrowe wewnętrzne / pośrodkowa krzyżowa …
Znieczulenie: miejscowe, … ml lidokainy …% / ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewniki diagnostyczne … F (kształty …), prowadnik hydrofilny ….
Przebieg zabiegu:
Wykonano aortografię oraz selektywne cewnikowanie tętnic segmentalnych obustronnie od poziomu … do …, z oceną fazy tętniczej i żylnej. Tętnica rdzeniowa przednia uwidoczniona …; tętnica Adamkiewicza (wielka tętnica korzeniowa przednia) odchodzi od tętnicy … na poziomie … …-stronnie, z typowym zagięciem „w kształcie spinki do włosów”. Tętnice rdzeniowe tylno-boczne …. Nie stwierdzono przetoki tętniczo-żylnej opony twardej, malformacji tętniczo-żylnej rdzenia ani patologicznego unaczynienia. Faza żylna: prawidłowy odpływ żył rdzeniowych, bez cech zastoju. Hemostaza miejsca wkłucia ….
Wynik: …
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie w łóżku przez … h, obserwacja miejsca wkłucia i stanu neurologicznego.

Wnioski:
- Angiografia rdzeniowa od poziomu … do …: …; tętnica Adamkiewicza od tętnicy segmentalnej … ….`,
  textEn: `Procedure: Spinal digital subtraction angiography (DSA)

Findings:
Indication: …
Target: segmental (intercostal and lumbar) arteries from … to …, vertebral arteries, thyrocervical and costocervical trunks, internal iliac / median sacral arteries …
Anaesthesia: local, … ml of …% lidocaine / general ….
Access: … common femoral artery (… F sheath).
Devices: … F diagnostic catheters (… shapes), … hydrophilic guidewire.
Procedure details:
Aortography and bilateral selective catheterisation of the segmental arteries from … to … were performed, with assessment of arterial and venous phases. The anterior spinal artery is visualised …; the artery of Adamkiewicz (great anterior radiculomedullary artery) arises from the … … segmental artery at the … level, with the typical hairpin configuration. Posterolateral spinal arteries …. No spinal dural arteriovenous fistula, spinal cord arteriovenous malformation or abnormal vascularity is demonstrated. Venous phase: normal spinal venous drainage with no evidence of congestion. Haemostasis of the puncture site ….
Result: …
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest for … h, monitoring of the puncture site and neurological status.

Conclusion:
- Spinal angiography from … to …: …; artery of Adamkiewicz arising from the … … segmental artery.` },
{ id: 'neuro_mt_ica_t', title: 'Trombektomia – okluzja ICA-T', titleEn: 'Thrombectomy – ICA terminus occlusion', group: 'Neuro', section: 'Acute stroke', priority: 10,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Mechaniczna trombektomia w ostrym udarze niedokrwiennym – okluzja końcowego odcinka tętnicy szyjnej wewnętrznej (ICA-T)

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja ICA-T … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek C7 (terminalny) z przejściem na M1 i A1
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący z balonem … F / długa koszulka … F, cewnik aspiracyjny … F, mikrocewnik …, mikroprowadnik …, stent-retriever … × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy szyjnej wspólnej/wewnętrznej …: tętnica szyjna wewnętrzna w odcinku szyjnym drożna, okluzja w odcinku terminalnym (C7) obejmująca bifurkację z brakiem wypełnienia M1 i A1 (eTICI 0). Krążenie oboczne …. Cewnik prowadzący umieszczono w tętnicy szyjnej wewnętrznej …. Mikrocewnik z mikroprowadnikiem przeprowadzono przez skrzeplinę do odcinka M2 …; kontrastem potwierdzono położenie dystalnie od skrzepliny. Wykonano trombektomię techniką kombinowaną (stent-retriever z aspiracją przez cewnik aspiracyjny, z zablokowaniem przepływu balonem cewnika prowadzącego / …). Liczba przejść: …; usunięto materiał zakrzepowy. W kontrolnej angiografii uzyskano rekanalizację tętnicy szyjnej wewnętrznej, tętnicy środkowej mózgu i tętnicy przedniej mózgu, z reperfuzją eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: rekanalizacja ICA-T, eTICI … po … przejściach.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Mechaniczna trombektomia okluzji ICA-T … – reperfuzja eTICI … po … przejściach.`,
  textEn: `Procedure: Mechanical thrombectomy for acute ischaemic stroke – internal carotid artery terminus (ICA-T) occlusion

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; … ICA-T occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: … internal carotid artery, C7 (terminal) segment extending into M1 and A1
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F balloon guide catheter / … F long sheath, … F aspiration catheter, … microcatheter, … microwire, … × … mm stent-retriever.
Procedure details:
Angiography of the … common/internal carotid artery showed a patent cervical internal carotid artery with occlusion of the terminal (C7) segment involving the bifurcation and no filling of M1 or A1 (eTICI 0). Collateral circulation …. The guide catheter was placed in the … internal carotid artery. The microcatheter and microwire were advanced across the thrombus into the … M2 segment; position distal to the thrombus was confirmed with contrast. Thrombectomy was performed using a combined technique (stent-retriever with aspiration via the aspiration catheter, with flow arrest using the balloon guide catheter / …). Number of passes: …; thrombus was retrieved. Control angiography showed recanalisation of the internal carotid, middle cerebral and anterior cerebral arteries with eTICI … reperfusion. No emboli to a new territory, no contrast extravasation.
Result: ICA-T recanalisation, eTICI … after … passes.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h, decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Mechanical thrombectomy of … ICA-T occlusion – eTICI … reperfusion after … passes.` },

{ id: 'neuro_mt_m1_stentretriever', title: 'Trombektomia M1 – stent-retriever', titleEn: 'Thrombectomy M1 – stent-retriever', group: 'Neuro', section: 'Acute stroke', priority: 20,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Mechaniczna trombektomia w ostrym udarze niedokrwiennym – okluzja M1 tętnicy środkowej mózgu (stent-retriever)

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja M1 … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: tętnica środkowa mózgu …, odcinek M1 (… proksymalny/dystalny)
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący z balonem … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, stent-retriever … × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy szyjnej wewnętrznej …: okluzja tętnicy środkowej mózgu w odcinku M1 … (eTICI 0), tętnica przednia mózgu drożna, krążenie oboczne leptomeningealne …. Cewnik prowadzący z balonem umieszczono w odcinku szyjnym tętnicy szyjnej wewnętrznej …. Mikrocewnik z mikroprowadnikiem przeprowadzono przez skrzeplinę do pnia … M2; kontrastem potwierdzono drożność dystalnie. Rozprężono stent-retriever obejmujący skrzeplinę, pozostawiono na … min, następnie usunięto go z jednoczesną aspiracją przez cewnik pośredni i z zablokowaniem przepływu balonem cewnika prowadzącego. Liczba przejść: …; usunięto materiał zakrzepowy. W kontrolnej angiografii uzyskano rekanalizację M1 i gałęzi M2, reperfuzja eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: rekanalizacja M1 …, eTICI … po … przejściach.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Mechaniczna trombektomia okluzji M1 … z użyciem stent-retrievera – reperfuzja eTICI … po … przejściach.`,
  textEn: `Procedure: Mechanical thrombectomy for acute ischaemic stroke – M1 middle cerebral artery occlusion (stent-retriever)

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; … M1 occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: … middle cerebral artery, M1 segment (… proximal/distal)
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F balloon guide catheter, … F intermediate catheter, … microcatheter, … microwire, … × … mm stent-retriever.
Procedure details:
Angiography of the … internal carotid artery showed occlusion of the … M1 segment of the middle cerebral artery (eTICI 0) with a patent anterior cerebral artery; leptomeningeal collaterals …. The balloon guide catheter was placed in the cervical … internal carotid artery. The microcatheter and microwire were advanced across the thrombus into the … M2 trunk; distal patency was confirmed with contrast. A stent-retriever was deployed across the thrombus, left in place for … min and then withdrawn with simultaneous aspiration through the intermediate catheter and flow arrest with the balloon guide catheter. Number of passes: …; thrombus was retrieved. Control angiography showed recanalisation of M1 and the M2 branches with eTICI … reperfusion. No emboli to a new territory, no contrast extravasation.
Result: … M1 recanalisation, eTICI … after … passes.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h, decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Stent-retriever thrombectomy of … M1 occlusion – eTICI … reperfusion after … passes.` },

{ id: 'neuro_mt_m1_aspiration', title: 'Trombektomia M1 – aspiracja (ADAPT), 1. przejście', titleEn: 'Thrombectomy M1 – aspiration (ADAPT), first pass', group: 'Neuro', section: 'Acute stroke', priority: 30,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Trombektomia aspiracyjna w ostrym udarze niedokrwiennym – okluzja M1 tętnicy środkowej mózgu (technika ADAPT)

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja M1 … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: tętnica środkowa mózgu …, odcinek M1
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: długa koszulka / cewnik prowadzący … F, cewnik aspiracyjny dużego światła … F, mikrocewnik …, mikroprowadnik …, pompa aspiracyjna.
Przebieg zabiegu:
Wykonano angiografię tętnicy szyjnej wewnętrznej …: okluzja odcinka M1 tętnicy środkowej mózgu … (eTICI 0), krążenie oboczne …. Cewnik prowadzący umieszczono w tętnicy szyjnej wewnętrznej …. Cewnik aspiracyjny wprowadzono po mikrocewniku i mikroprowadniku do proksymalnej powierzchni skrzepliny w M1, po czym usunięto mikrocewnik i włączono aspirację pompą. Po zatrzymaniu przepływu w cewniku cewnik aspiracyjny wycofano pod stałą aspiracją; aspirowano również z cewnika prowadzącego. Usunięto skrzeplinę w pierwszym przejściu. W kontrolnej angiografii uzyskano rekanalizację M1 i gałęzi M2, reperfuzja eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: rekanalizacja M1 w pierwszym przejściu (first-pass), eTICI ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Trombektomia aspiracyjna (ADAPT) okluzji M1 … – reperfuzja eTICI … w pierwszym przejściu.`,
  textEn: `Procedure: Aspiration thrombectomy for acute ischaemic stroke – M1 middle cerebral artery occlusion (ADAPT technique)

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; … M1 occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: … middle cerebral artery, M1 segment
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F long sheath / guide catheter, … F large-bore aspiration catheter, … microcatheter, … microwire, aspiration pump.
Procedure details:
Angiography of the … internal carotid artery showed occlusion of the … M1 segment of the middle cerebral artery (eTICI 0); collateral circulation …. The guide catheter was placed in the … internal carotid artery. The aspiration catheter was advanced over the microcatheter and microwire to the proximal face of the thrombus in M1; the microcatheter was removed and pump aspiration was applied. After cessation of flow in the catheter, the aspiration catheter was withdrawn under continuous aspiration, with simultaneous aspiration from the guide catheter. The thrombus was retrieved in the first pass. Control angiography showed recanalisation of M1 and the M2 branches with eTICI … reperfusion. No emboli to a new territory, no contrast extravasation.
Result: first-pass M1 recanalisation, eTICI ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h, decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Aspiration thrombectomy (ADAPT) of … M1 occlusion – first-pass eTICI … reperfusion.` },

{ id: 'neuro_mt_m2_mevo', title: 'Trombektomia M2 / okluzja naczynia średniej wielkości', titleEn: 'Thrombectomy M2 / medium vessel occlusion', group: 'Neuro', section: 'Acute stroke', priority: 40,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Mechaniczna trombektomia w ostrym udarze niedokrwiennym – okluzja M2 / dystalnego naczynia średniej wielkości

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, początek objawów/ostatnio widziany zdrowy …; okluzja … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: … (np. pień górny/dolny M2 tętnicy środkowej mózgu …, M3, A2–A3, P2–P3)
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik aspiracyjny / pośredni małego profilu … F, mikrocewnik …, mikroprowadnik …, stent-retriever małego rozmiaru … × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy …: okluzja … (eTICI …), pozostałe gałęzie drożne, krążenie oboczne …. Cewnik prowadzący umieszczono w …, cewnik pośredni wprowadzono do …. Mikrocewnik z mikroprowadnikiem ostrożnie przeprowadzono przez skrzeplinę do …; kontrastem potwierdzono położenie dystalnie od skrzepliny. Wykonano trombektomię techniką … (stent-retriever z aspiracją / aspiracja bezpośrednia), liczba przejść: …. W kontrolnej angiografii uzyskano rekanalizację …, reperfuzja eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: rekanalizacja …, eTICI … po … przejściach.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Mechaniczna trombektomia okluzji … – reperfuzja eTICI … po … przejściach.`,
  textEn: `Procedure: Mechanical thrombectomy for acute ischaemic stroke – M2 / distal medium vessel occlusion

Findings:
Indication: acute ischaemic stroke, NIHSS …, symptom onset/last known well …; … occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: … (e.g. superior/inferior M2 trunk of the … middle cerebral artery, M3, A2–A3, P2–P3)
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F low-profile aspiration / intermediate catheter, … microcatheter, … microwire, … × … mm small stent-retriever.
Procedure details:
Angiography of the … artery showed occlusion of … (eTICI …), with the remaining branches patent; collateral circulation …. The guide catheter was placed in …, and the intermediate catheter was advanced into …. The microcatheter and microwire were carefully advanced across the thrombus into …; position distal to the thrombus was confirmed with contrast. Thrombectomy was performed using … (stent-retriever with aspiration / direct aspiration), number of passes: …. Control angiography showed recanalisation of … with eTICI … reperfusion. No emboli to a new territory, no contrast extravasation.
Result: recanalisation of …, eTICI … after … passes.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h, decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Mechanical thrombectomy of … occlusion – eTICI … reperfusion after … passes.` },
{ id: 'neuro_mt_tandem', title: 'Trombektomia – zmiana tandemowa (stent ICA + M1)', titleEn: 'Thrombectomy – tandem lesion (ICA stent + M1)', group: 'Neuro', section: 'Acute stroke', priority: 50,
  proc: ['stroke_thrombectomy', 'carotid_stenting', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Leczenie wewnątrznaczyniowe zmiany tandemowej – stentowanie tętnicy szyjnej wewnętrznej i mechaniczna trombektomia wewnątrzczaszkowa

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja/krytyczne zwężenie tętnicy szyjnej wewnętrznej … w odcinku szyjnym z okluzją … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: tętnica szyjna wewnętrzna … (odcinek C1, opuszka) oraz … (M1 / ICA-T)
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący z balonem … F / długa koszulka … F, mikroprowadnik / prowadnik …, balon do angioplastyki … × … mm, stent szyjny samorozprężalny … × … mm, cewnik aspiracyjny … F, mikrocewnik …, stent-retriever … × … mm; leczenie przeciwpłytkowe: … (… i.v.).
Przebieg zabiegu:
Wykonano angiografię tętnicy szyjnej wspólnej …: okluzja / zwężenie …% tętnicy szyjnej wewnętrznej w odcinku C1 tuż powyżej podziału, o morfologii miażdżycowej / rozwarstwienia. Zmianę przekroczono prowadnikiem i wykonano predylatację balonem … × … mm. Po przejściu cewnikiem przez zmianę szyjną wykonano angiografię wewnątrzczaszkową: okluzja … (eTICI 0). Wykonano trombektomię wewnątrzczaszkową techniką … (stent-retriever z aspiracją / aspiracja bezpośrednia), liczba przejść: …, z uzyskaniem reperfuzji eTICI …. Następnie w tętnicy szyjnej wewnętrznej implantowano stent samorozprężalny … × … mm obejmujący zmianę, z postdylatacją … mm. W kontrolnej angiografii stent prawidłowo rozprężony, zwężenie resztkowe …%, przepływ wewnątrzczaszkowy eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: stent w tętnicy szyjnej wewnętrznej … drożny, rekanalizacja …, eTICI ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: oddział udarowy; leczenie przeciwpłytkowe … (po wykluczeniu krwawienia w kontrolnej TK głowy po … h); kontrola ciśnienia tętniczego (docelowo …) z uwagi na ryzyko zespołu hiperperfuzji; kontrolne USG Doppler tętnic szyjnych za …; obserwacja miejsca wkłucia.

Wnioski:
- Zmiana tandemowa …: stentowanie tętnicy szyjnej wewnętrznej (zwężenie resztkowe …%) i trombektomia … – reperfuzja eTICI ….`,
  textEn: `Procedure: Endovascular treatment of a tandem lesion – internal carotid artery stenting and intracranial mechanical thrombectomy

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; occlusion/critical stenosis of the cervical … internal carotid artery with … occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: … internal carotid artery (C1 segment, bulb) and … (M1 / ICA-T)
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F balloon guide catheter / … F long sheath, … microwire / guidewire, … × … mm angioplasty balloon, … × … mm self-expanding carotid stent, … F aspiration catheter, … microcatheter, … × … mm stent-retriever; antiplatelet therapy: … (… i.v.).
Procedure details:
Angiography of the … common carotid artery showed occlusion / …% stenosis of the C1 segment of the internal carotid artery just above the bifurcation, with atherosclerotic / dissection morphology. The lesion was crossed with a guidewire and predilated with a … × … mm balloon. After the catheter was advanced through the cervical lesion, intracranial angiography showed occlusion of … (eTICI 0). Intracranial thrombectomy was performed using … (stent-retriever with aspiration / direct aspiration), number of passes: …, achieving eTICI … reperfusion. A … × … mm self-expanding stent was then deployed across the cervical internal carotid lesion, with post-dilatation to … mm. Control angiography showed a well-expanded stent with …% residual stenosis and eTICI … intracranial flow. No emboli to a new territory, no contrast extravasation.
Result: patent … internal carotid stent, recanalisation of …, eTICI ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit; antiplatelet therapy … (after haemorrhage is excluded on follow-up CT head at … h); blood pressure control (target …) given the risk of hyperperfusion syndrome; carotid Doppler ultrasound in …; puncture site monitoring.

Conclusion:
- Tandem lesion …: internal carotid artery stenting (…% residual stenosis) and thrombectomy of … – eTICI … reperfusion.` },

{ id: 'neuro_mt_basilar', title: 'Trombektomia – okluzja tętnicy podstawnej', titleEn: 'Thrombectomy – basilar artery occlusion', group: 'Neuro', section: 'Acute stroke', priority: 60,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Mechaniczna trombektomia w ostrym udarze niedokrwiennym – okluzja tętnicy podstawnej

Opis:
Wskazanie: ostry udar niedokrwienny w krążeniu tylnym, NIHSS …, pc-ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja tętnicy podstawnej w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: tętnica podstawna (odcinek … proksymalny/środkowy/szczyt) / tętnica kręgowa … (V4)
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący / długa koszulka … F, cewnik aspiracyjny … F, mikrocewnik …, mikroprowadnik …, stent-retriever … × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy kręgowej … (dominującej): okluzja tętnicy podstawnej w odcinku … (eTICI 0); tętnice łączące tylne …, wsteczne wypełnienie tętnic tylnych mózgu …. Cewnik prowadzący umieszczono w odcinku V2 tętnicy kręgowej …. Cewnik aspiracyjny wprowadzono przez odcinek V4 do tętnicy podstawnej. Mikrocewnik z mikroprowadnikiem przeprowadzono przez skrzeplinę do odcinka P1–P2 tętnicy tylnej mózgu …. Wykonano trombektomię techniką … (aspiracja bezpośrednia / stent-retriever z aspiracją), liczba przejść: …; usunięto materiał zakrzepowy. W kontrolnej angiografii tętnica podstawna drożna, wypełnienie obu tętnic tylnych mózgu (P1–P4) i tętnic móżdżkowych górnych, AICA …; reperfuzja eTICI …. Zwężenie podłoża miażdżycowego …. Bez zatorów obwodowych, bez wynaczynienia kontrastu.
Wynik: rekanalizacja tętnicy podstawnej, eTICI … po … przejściach.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym / OIT, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Mechaniczna trombektomia okluzji tętnicy podstawnej – reperfuzja eTICI … po … przejściach.`,
  textEn: `Procedure: Mechanical thrombectomy for acute ischaemic stroke – basilar artery occlusion

Findings:
Indication: acute posterior circulation ischaemic stroke, NIHSS …, pc-ASPECTS …, symptom onset/last known well …; basilar artery occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: basilar artery (… proximal/mid/top segment) / … vertebral artery (V4)
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter / long sheath, … F aspiration catheter, … microcatheter, … microwire, … × … mm stent-retriever.
Procedure details:
Angiography of the dominant … vertebral artery showed occlusion of the … basilar artery (eTICI 0); posterior communicating arteries …, retrograde filling of the posterior cerebral arteries …. The guide catheter was placed in the V2 segment of the … vertebral artery. The aspiration catheter was advanced through V4 into the basilar artery. The microcatheter and microwire were advanced across the thrombus into the P1–P2 segment of the … posterior cerebral artery. Thrombectomy was performed using … (direct aspiration / stent-retriever with aspiration), number of passes: …; thrombus was retrieved. Control angiography showed a patent basilar artery with filling of both posterior cerebral arteries (P1–P4) and superior cerebellar arteries, AICA …; eTICI … reperfusion. Underlying atherosclerotic stenosis: …. No distal emboli, no contrast extravasation.
Result: basilar artery recanalisation, eTICI … after … passes.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit / ICU admission, blood pressure control (target …), follow-up CT head at … h, decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Mechanical thrombectomy of basilar artery occlusion – eTICI … reperfusion after … passes.` },

{ id: 'neuro_mt_ia_lysis', title: 'Trombektomia z trombolizą dotętniczą', titleEn: 'Thrombectomy with intra-arterial thrombolysis', group: 'Neuro', section: 'Acute stroke', priority: 70,
  proc: ['stroke_thrombectomy', 'thrombolysis', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Mechaniczna trombektomia uzupełniona trombolizą dotętniczą w ostrym udarze niedokrwiennym

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, czas reperfuzji: ….
Lokalizacja: …
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik aspiracyjny … F, mikrocewnik …, mikroprowadnik …, stent-retriever … × … mm; lek trombolityczny: … (… mg dotętniczo).
Przebieg zabiegu:
Wykonano angiografię tętnicy …: okluzja … (eTICI 0). Wykonano trombektomię mechaniczną techniką …, liczba przejść: …, z uzyskaniem rekanalizacji naczynia głównego (eTICI …), z utrzymującą się okluzją dystalnych gałęzi … / spowolnionym przepływem w …. Mikrocewnik umieszczono w … w bezpośrednim sąsiedztwie dystalnego materiału zakrzepowego i podano dotętniczo … mg … w ciągu … min. W kontrolnej angiografii uzyskano poprawę reperfuzji do eTICI …. Bez zatorów w nowym terytorium, bez wynaczynienia kontrastu.
Wynik: rekanalizacja …, końcowa reperfuzja eTICI ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h (ocena ukrwotocznienia), decyzja o leczeniu przeciwkrzepliwym/przeciwpłytkowym po TK; obserwacja miejsca wkłucia.

Wnioski:
- Mechaniczna trombektomia okluzji … uzupełniona trombolizą dotętniczą (… mg …) – końcowa reperfuzja eTICI ….`,
  textEn: `Procedure: Mechanical thrombectomy with adjunctive intra-arterial thrombolysis for acute ischaemic stroke

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; … occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, reperfusion time: ….
Target: …
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F aspiration catheter, … microcatheter, … microwire, … × … mm stent-retriever; thrombolytic agent: … (… mg intra-arterially).
Procedure details:
Angiography of the … artery showed occlusion of … (eTICI 0). Mechanical thrombectomy was performed using …, number of passes: …, achieving recanalisation of the main vessel (eTICI …) with persistent occlusion of distal … branches / sluggish flow in …. The microcatheter was positioned in … immediately adjacent to the distal thrombus and … mg of … was infused intra-arterially over … min. Control angiography showed improvement of reperfusion to eTICI …. No emboli to a new territory, no contrast extravasation.
Result: recanalisation of …, final eTICI … reperfusion.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h (haemorrhagic transformation), decision on antithrombotic therapy after CT; puncture site monitoring.

Conclusion:
- Mechanical thrombectomy of … occlusion with adjunctive intra-arterial thrombolysis (… mg …) – final eTICI … reperfusion.` },

{ id: 'neuro_mt_failed', title: 'Trombektomia – brak rekanalizacji (eTICI 0–1)', titleEn: 'Thrombectomy – failed recanalisation (eTICI 0–1)', group: 'Neuro', section: 'Acute stroke', priority: 80,
  proc: ['stroke_thrombectomy', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Próba mechanicznej trombektomii w ostrym udarze niedokrwiennym – bez skutecznej rekanalizacji

Opis:
Wskazanie: ostry udar niedokrwienny, NIHSS …, ASPECTS …, początek objawów/ostatnio widziany zdrowy …; okluzja … w angio-TK. Tromboliza dożylna: …. Czas nakłucia: …, zakończenie zabiegu: ….
Lokalizacja: …
Znieczulenie: sedacja / znieczulenie ogólne ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik aspiracyjny … F, mikrocewnik …, mikroprowadnik …, stent-retriever … × … mm.
Przebieg zabiegu:
Wykonano angiografię tętnicy …: okluzja … (eTICI 0), krążenie oboczne …. Wykonano … przejść techniką … (aspiracja bezpośrednia / stent-retriever z aspiracją / …), bez trwałej rekanalizacji – … (reokluzja / skrzeplina oporna / podejrzenie podłoża miażdżycowego lub rozwarstwienia / trudny dostęp: …). Rozważono/wykonano …. Z uwagi na brak efektu po … przejściach, czas od początku objawów i ryzyko powikłań odstąpiono od dalszych prób. Kontrolna angiografia: …, przepływ eTICI …. Bez wynaczynienia kontrastu.
Wynik: brak skutecznej reperfuzji – eTICI ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: hospitalizacja w oddziale udarowym, kontrola ciśnienia tętniczego (docelowo …), kontrolna TK głowy po … h, dalsze leczenie zachowawcze wg decyzji neurologa; obserwacja miejsca wkłucia.

Wnioski:
- Próba mechanicznej trombektomii okluzji … (… przejść) – bez skutecznej rekanalizacji, eTICI ….`,
  textEn: `Procedure: Attempted mechanical thrombectomy for acute ischaemic stroke – unsuccessful recanalisation

Findings:
Indication: acute ischaemic stroke, NIHSS …, ASPECTS …, symptom onset/last known well …; … occlusion on CT angiography. Intravenous thrombolysis: …. Groin puncture time: …, end of procedure: ….
Target: …
Anaesthesia: conscious sedation / general anaesthesia ….
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F aspiration catheter, … microcatheter, … microwire, … × … mm stent-retriever.
Procedure details:
Angiography of the … artery showed occlusion of … (eTICI 0); collateral circulation …. … passes were performed using … (direct aspiration / stent-retriever with aspiration / …) without sustained recanalisation – … (re-occlusion / refractory thrombus / suspected underlying atherosclerosis or dissection / difficult access: …). … was considered/performed. Given the lack of effect after … passes, the time from onset and the risk of complications, further attempts were abandoned. Control angiography: …, eTICI … flow. No contrast extravasation.
Result: unsuccessful reperfusion – eTICI ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: stroke unit admission, blood pressure control (target …), follow-up CT head at … h, further medical management as per the stroke team; puncture site monitoring.

Conclusion:
- Attempted mechanical thrombectomy of … occlusion (… passes) – unsuccessful recanalisation, eTICI ….` },
{"id":"neuro_coil_ruptured_acom","title":"Embolizacja pękniętego tętniaka AComA spiralami","titleEn":"Coiling of ruptured AComA aneurysm","group":"Neuro","section":"Aneurysm","priority":10,"proc":["coiling","neuro_angio"],"anat":["brain"],"text":"Badanie: Embolizacja pękniętego tętniaka AComA spiralami odczepialnymi\n\nOpis:\nWskazanie: krwotok podpajęczynówkowy (Hunt-Hess …, WFNS …, Fisher …) z pękniętego tętniaka ….\nLokalizacja: tętnica łącząca przednia (AComA)\nZnieczulenie: ogólne.\nDostęp: tętnica udowa wspólna … (koszulka … F).\nSprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).\nPrzebieg zabiegu:\nWykonano angiografię tętnicy szyjnej wewnętrznej … (strona dominującego A1) w projekcjach standardowych oraz angiografię rotacyjną 3D. Uwidoczniono tętniak tętnicy łączącej przedniej o wymiarach … × … mm, szyja … mm, skierowany … (do przodu/do góry/do tyłu/w dół); A1 … dominujący, A1 … hipoplastyczny/…; oba odcinki A2 odchodzą …. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w odcinku C1 tętnicy szyjnej wewnętrznej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Wykonano embolizację tętniaka spiralami odczepialnymi (spirala obramowująca … mm × … cm, następnie spirale wypełniające i wykańczające, łącznie … szt.). W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). Oba odcinki A2 i tętnica Heubnera … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….\nWynik: embolizacja tętniaka spiralami, Raymond-Roy klasa ….\nZużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².\nPowikłania: bez powikłań w trakcie zabiegu.\nZalecenia: hospitalizacja w OIT / oddziale neurochirurgii; nimodypina …; monitorowanie skurczu naczyniowego (TCD) i stanu neurologicznego; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.\n\nWnioski:\n- Skuteczna embolizacja pękniętego tętniaka AComA spiralami odczepialnymi; Raymond-Roy klasa ….","textEn":"Procedure: Detachable coil embolisation of a ruptured AComA aneurysm\n\nFindings:\nIndication: subarachnoid haemorrhage (Hunt-Hess …, WFNS …, Fisher …) from a ruptured … aneurysm.\nTarget: anterior communicating artery (AComA)\nAnaesthesia: general.\nAccess: … common femoral artery (… F sheath).\nDevices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total); heparin … IU i.v. (ACT … s).\nProcedure details:\nAngiography of the … internal carotid artery (side of the dominant A1) was performed in standard projections together with 3D rotational angiography. This demonstrated an anterior communicating artery aneurysm measuring … × … mm, neck … mm, projecting … (anteriorly/superiorly/posteriorly/inferiorly); … A1 dominant, … A1 hypoplastic/…; both A2 segments arise …. Working projections were determined. The guide catheter was placed in the C1 segment of the … internal carotid artery, intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the aneurysm sac. The aneurysm was embolised with detachable coils (… mm × … cm framing coil followed by filling and finishing coils, … coils in total). Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). Both A2 segments and the recurrent artery of Heubner … are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….\nResult: coil embolisation of the aneurysm, Raymond-Roy class ….\nContrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².\nComplications: none during the procedure.\nRecommendations: ICU / neurosurgical ward admission; nimodipine …; vasospasm (TCD) and neurological monitoring; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.\n\nConclusion:\n- Successful coil embolisation of a ruptured AComA aneurysm with detachable coils; Raymond-Roy class …."},
{"id":"neuro_coil_ruptured_pcom","title":"Embolizacja pękniętego tętniaka PComA spiralami","titleEn":"Coiling of ruptured PComA aneurysm","group":"Neuro","section":"Aneurysm","priority":20,"proc":["coiling","neuro_angio"],"anat":["brain"],"text":"Badanie: Embolizacja pękniętego tętniaka PComA spiralami odczepialnymi\n\nOpis:\nWskazanie: krwotok podpajęczynówkowy (Hunt-Hess …, WFNS …, Fisher …) z pękniętego tętniaka ….\nLokalizacja: tętnica szyjna wewnętrzna …, odcinek C7 (łączący) – odejście tętnicy łączącej tylnej (PComA)\nZnieczulenie: ogólne.\nDostęp: tętnica udowa wspólna … (koszulka … F).\nSprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).\nPrzebieg zabiegu:\nWykonano angiografię tętnicy szyjnej wewnętrznej … w projekcjach standardowych oraz angiografię rotacyjną 3D. Uwidoczniono tętniak odcinka C7 tętnicy szyjnej wewnętrznej przy odejściu tętnicy łączącej tylnej, o wymiarach … × … mm, szyja … mm, skierowany …; tętnica łącząca tylna odchodzi od szyi / podstawy tętniaka …, typ płodowy tętnicy tylnej mózgu: …. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w odcinku C1 tętnicy szyjnej wewnętrznej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Wykonano embolizację tętniaka spiralami odczepialnymi (spirala obramowująca … mm × … cm, następnie spirale wypełniające i wykańczające, łącznie … szt.). W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). Tętnica łącząca tylna i tętnica naczyniówkowa przednia drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….\nWynik: embolizacja tętniaka spiralami, Raymond-Roy klasa ….\nZużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².\nPowikłania: bez powikłań w trakcie zabiegu.\nZalecenia: hospitalizacja w OIT / oddziale neurochirurgii; nimodypina …; monitorowanie skurczu naczyniowego (TCD) i stanu neurologicznego; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.\n\nWnioski:\n- Skuteczna embolizacja pękniętego tętniaka PComA spiralami odczepialnymi; Raymond-Roy klasa ….","textEn":"Procedure: Detachable coil embolisation of a ruptured PComA aneurysm\n\nFindings:\nIndication: subarachnoid haemorrhage (Hunt-Hess …, WFNS …, Fisher …) from a ruptured … aneurysm.\nTarget: … internal carotid artery, C7 (communicating) segment – posterior communicating artery (PComA) origin\nAnaesthesia: general.\nAccess: … common femoral artery (… F sheath).\nDevices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total); heparin … IU i.v. (ACT … s).\nProcedure details:\nAngiography of the … internal carotid artery was performed in standard projections together with 3D rotational angiography. This demonstrated an aneurysm of the C7 segment of the internal carotid artery at the posterior communicating artery origin, measuring … × … mm, neck … mm, projecting …; the posterior communicating artery arises from the neck / base of the aneurysm …, fetal-type posterior cerebral artery: …. Working projections were determined. The guide catheter was placed in the C1 segment of the … internal carotid artery, intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the aneurysm sac. The aneurysm was embolised with detachable coils (… mm × … cm framing coil followed by filling and finishing coils, … coils in total). Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). The posterior communicating and anterior choroidal arteries are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….\nResult: coil embolisation of the aneurysm, Raymond-Roy class ….\nContrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².\nComplications: none during the procedure.\nRecommendations: ICU / neurosurgical ward admission; nimodipine …; vasospasm (TCD) and neurological monitoring; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.\n\nConclusion:\n- Successful coil embolisation of a ruptured PComA aneurysm with detachable coils; Raymond-Roy class …."},
{"id":"neuro_coil_ruptured_mca","title":"Embolizacja pękniętego tętniaka bifurkacji MCA spiralami","titleEn":"Coiling of ruptured MCA bifurcation aneurysm","group":"Neuro","section":"Aneurysm","priority":30,"proc":["coiling","neuro_angio"],"anat":["brain"],"text":"Badanie: Embolizacja pękniętego tętniaka bifurkacji MCA spiralami odczepialnymi\n\nOpis:\nWskazanie: krwotok podpajęczynówkowy (Hunt-Hess …, WFNS …, Fisher …) z pękniętego tętniaka ….\nLokalizacja: tętnica środkowa mózgu …, rozwidlenie M1/M2\nZnieczulenie: ogólne.\nDostęp: tętnica udowa wspólna … (koszulka … F).\nSprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).\nPrzebieg zabiegu:\nWykonano angiografię tętnicy szyjnej wewnętrznej … w projekcjach standardowych oraz angiografię rotacyjną 3D. Uwidoczniono tętniak rozwidlenia tętnicy środkowej mózgu … o wymiarach … × … mm, szyja … mm, skierowany …; pień górny i dolny M2 odchodzą od szyi tętniaka …. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w odcinku C1 tętnicy szyjnej wewnętrznej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Wykonano embolizację tętniaka spiralami odczepialnymi (spirala obramowująca … mm × … cm, następnie spirale wypełniające i wykańczające, łącznie … szt.). W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). Oba pnie M2 i gałęzie M3–M4 drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….\nWynik: embolizacja tętniaka spiralami, Raymond-Roy klasa ….\nZużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².\nPowikłania: bez powikłań w trakcie zabiegu.\nZalecenia: hospitalizacja w OIT / oddziale neurochirurgii; nimodypina …; monitorowanie skurczu naczyniowego (TCD) i stanu neurologicznego; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.\n\nWnioski:\n- Skuteczna embolizacja pękniętego tętniaka bifurkacji MCA spiralami odczepialnymi; Raymond-Roy klasa ….","textEn":"Procedure: Detachable coil embolisation of a ruptured MCA bifurcation aneurysm\n\nFindings:\nIndication: subarachnoid haemorrhage (Hunt-Hess …, WFNS …, Fisher …) from a ruptured … aneurysm.\nTarget: … middle cerebral artery, M1/M2 bifurcation\nAnaesthesia: general.\nAccess: … common femoral artery (… F sheath).\nDevices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total); heparin … IU i.v. (ACT … s).\nProcedure details:\nAngiography of the … internal carotid artery was performed in standard projections together with 3D rotational angiography. This demonstrated a … middle cerebral artery bifurcation aneurysm measuring … × … mm, neck … mm, projecting …; the superior and inferior M2 trunks arise from the aneurysm neck …. Working projections were determined. The guide catheter was placed in the C1 segment of the … internal carotid artery, intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the aneurysm sac. The aneurysm was embolised with detachable coils (… mm × … cm framing coil followed by filling and finishing coils, … coils in total). Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). Both M2 trunks and the M3–M4 branches are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….\nResult: coil embolisation of the aneurysm, Raymond-Roy class ….\nContrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².\nComplications: none during the procedure.\nRecommendations: ICU / neurosurgical ward admission; nimodipine …; vasospasm (TCD) and neurological monitoring; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.\n\nConclusion:\n- Successful coil embolisation of a ruptured MCA bifurcation aneurysm with detachable coils; Raymond-Roy class …."},
{"id":"neuro_coil_ruptured_basilar_tip","title":"Embolizacja pękniętego tętniaka szczytu BA spiralami","titleEn":"Coiling of ruptured basilar tip aneurysm","group":"Neuro","section":"Aneurysm","priority":40,"proc":["coiling","neuro_angio"],"anat":["brain"],"text":"Badanie: Embolizacja pękniętego tętniaka szczytu tętnicy podstawnej spiralami odczepialnymi\n\nOpis:\nWskazanie: krwotok podpajęczynówkowy (Hunt-Hess …, WFNS …, Fisher …) z pękniętego tętniaka ….\nLokalizacja: szczyt tętnicy podstawnej\nZnieczulenie: ogólne.\nDostęp: tętnica udowa wspólna … (koszulka … F).\nSprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).\nPrzebieg zabiegu:\nWykonano angiografię tętnicy kręgowej … (dominującej) w projekcjach standardowych oraz angiografię rotacyjną 3D. Uwidoczniono tętniak szczytu tętnicy podstawnej o wymiarach … × … mm, szyja … mm, skierowany …; odcinki P1 obu tętnic tylnych mózgu i tętnice móżdżkowe górne odchodzą …; tętnice łączące tylne …. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w odcinku V2 tętnicy kręgowej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Wykonano embolizację tętniaka spiralami odczepialnymi (spirala obramowująca … mm × … cm, następnie spirale wypełniające i wykańczające, łącznie … szt.). W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). Oba odcinki P1–P4 tętnic tylnych mózgu, tętnice móżdżkowe górne i tętnice wzgórzowo-przebijające … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….\nWynik: embolizacja tętniaka spiralami, Raymond-Roy klasa ….\nZużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².\nPowikłania: bez powikłań w trakcie zabiegu.\nZalecenia: hospitalizacja w OIT / oddziale neurochirurgii; nimodypina …; monitorowanie skurczu naczyniowego (TCD) i stanu neurologicznego; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.\n\nWnioski:\n- Skuteczna embolizacja pękniętego tętniaka szczytu tętnicy podstawnej spiralami odczepialnymi; Raymond-Roy klasa ….","textEn":"Procedure: Detachable coil embolisation of a ruptured basilar tip aneurysm\n\nFindings:\nIndication: subarachnoid haemorrhage (Hunt-Hess …, WFNS …, Fisher …) from a ruptured … aneurysm.\nTarget: basilar artery tip\nAnaesthesia: general.\nAccess: … common femoral artery (… F sheath).\nDevices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total); heparin … IU i.v. (ACT … s).\nProcedure details:\nAngiography of the … (dominant) vertebral artery was performed in standard projections together with 3D rotational angiography. This demonstrated a basilar tip aneurysm measuring … × … mm, neck … mm, projecting …; both P1 segments and the superior cerebellar arteries arise …; posterior communicating arteries …. Working projections were determined. The guide catheter was placed in the V2 segment of the … vertebral artery, intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the aneurysm sac. The aneurysm was embolised with detachable coils (… mm × … cm framing coil followed by filling and finishing coils, … coils in total). Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). Both posterior cerebral arteries (P1–P4), the superior cerebellar arteries and the thalamoperforators … are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….\nResult: coil embolisation of the aneurysm, Raymond-Roy class ….\nContrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².\nComplications: none during the procedure.\nRecommendations: ICU / neurosurgical ward admission; nimodipine …; vasospasm (TCD) and neurological monitoring; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.\n\nConclusion:\n- Successful coil embolisation of a ruptured basilar tip aneurysm with detachable coils; Raymond-Roy class …."},
{"id":"neuro_coil_ruptured_pica","title":"Embolizacja pękniętego tętniaka PICA spiralami","titleEn":"Coiling of ruptured PICA aneurysm","group":"Neuro","section":"Aneurysm","priority":50,"proc":["coiling","neuro_angio"],"anat":["brain","neck"],"text":"Badanie: Embolizacja pękniętego tętniaka PICA spiralami odczepialnymi\n\nOpis:\nWskazanie: krwotok podpajęczynówkowy (Hunt-Hess …, WFNS …, Fisher …) z pękniętego tętniaka ….\nLokalizacja: tętnica kręgowa …, odcinek V4 – odejście tętnicy móżdżkowej dolnej tylnej (PICA)\nZnieczulenie: ogólne.\nDostęp: tętnica udowa wspólna … (koszulka … F).\nSprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).\nPrzebieg zabiegu:\nWykonano angiografię tętnicy kręgowej … w projekcjach standardowych oraz angiografię rotacyjną 3D. Uwidoczniono tętniak odcinka V4 tętnicy kręgowej przy odejściu PICA, o wymiarach … × … mm, szyja … mm, skierowany …; PICA odchodzi od szyi / podstawy tętniaka …. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w odcinku V2 tętnicy kręgowej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Wykonano embolizację tętniaka spiralami odczepialnymi (spirala obramowująca … mm × … cm, następnie spirale wypełniające i wykańczające, łącznie … szt.). W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). PICA i tętnica podstawna drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….\nWynik: embolizacja tętniaka spiralami, Raymond-Roy klasa ….\nZużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².\nPowikłania: bez powikłań w trakcie zabiegu.\nZalecenia: hospitalizacja w OIT / oddziale neurochirurgii; nimodypina …; monitorowanie skurczu naczyniowego (TCD) i stanu neurologicznego; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.\n\nWnioski:\n- Skuteczna embolizacja pękniętego tętniaka PICA spiralami odczepialnymi; Raymond-Roy klasa ….","textEn":"Procedure: Detachable coil embolisation of a ruptured PICA aneurysm\n\nFindings:\nIndication: subarachnoid haemorrhage (Hunt-Hess …, WFNS …, Fisher …) from a ruptured … aneurysm.\nTarget: … vertebral artery, V4 segment – posterior inferior cerebellar artery (PICA) origin\nAnaesthesia: general.\nAccess: … common femoral artery (… F sheath).\nDevices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total); heparin … IU i.v. (ACT … s).\nProcedure details:\nAngiography of the … vertebral artery was performed in standard projections together with 3D rotational angiography. This demonstrated an aneurysm of the V4 segment of the vertebral artery at the PICA origin, measuring … × … mm, neck … mm, projecting …; PICA arises from the neck / base of the aneurysm …. Working projections were determined. The guide catheter was placed in the V2 segment of the … vertebral artery, intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the aneurysm sac. The aneurysm was embolised with detachable coils (… mm × … cm framing coil followed by filling and finishing coils, … coils in total). Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). PICA and the basilar artery are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….\nResult: coil embolisation of the aneurysm, Raymond-Roy class ….\nContrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².\nComplications: none during the procedure.\nRecommendations: ICU / neurosurgical ward admission; nimodipine …; vasospasm (TCD) and neurological monitoring; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.\n\nConclusion:\n- Successful coil embolisation of a ruptured PICA aneurysm with detachable coils; Raymond-Roy class …."},
{ id: 'neuro_coil_balloon_assisted', title: 'Embolizacja tętniaka spiralami z asystą balonu', titleEn: 'Balloon-assisted coiling of aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 60,
  proc: ['stent_coiling', 'coiling', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Embolizacja tętniaka wewnątrzczaszkowego spiralami odczepialnymi z asystą balonu (remodeling balonowy)

Opis:
Wskazanie: … tętniak … (pęknięty / niepęknięty), o szerokiej szyi.
Lokalizacja: …
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadniki …, balon do remodelingu … × … mm (podatny / bardzo podatny), spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s).
Przebieg zabiegu:
Wykonano angiografię … oraz angiografię rotacyjną 3D. Uwidoczniono tętniak … o wymiarach … × … mm, szyja … mm (stosunek kopuła/szyja …), z odejściem … w okolicy szyi. Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w …. Balon do remodelingu umieszczono w naczyniu macierzystym na wysokości szyi tętniaka (…), a mikrocewnik wprowadzono do worka tętniaka. Przy napełnionym balonie wprowadzono spirale odczepialne (łącznie … szt.), każdorazowo opróżniając balon przed odczepieniem spirali i oceniając stabilność pakietu. W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa …). Naczynie macierzyste i gałęzie … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: embolizacja tętniaka spiralami z asystą balonu, Raymond-Roy klasa ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja w OIT / oddziale neurochirurgii; …; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Skuteczna embolizacja tętniaka … spiralami odczepialnymi z asystą balonu; Raymond-Roy klasa ….`,
  textEn: `Procedure: Balloon-assisted (balloon remodelling) detachable coil embolisation of an intracranial aneurysm

Findings:
Indication: … wide-necked … aneurysm (ruptured / unruptured).
Target: …
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwires, … × … mm remodelling balloon (compliant / hypercompliant), detachable coils (… in total); heparin … IU i.v. (ACT … s).
Procedure details:
Angiography of … with 3D rotational angiography was performed. This demonstrated a … aneurysm measuring … × … mm, neck … mm (dome-to-neck ratio …), with … arising near the neck. Working projections were determined. The guide catheter was placed in …. The remodelling balloon was positioned in the parent artery across the aneurysm neck (…) and the microcatheter was advanced into the aneurysm sac. Detachable coils (… in total) were deployed with the balloon inflated, the balloon being deflated before each detachment to check coil mass stability. Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class …). The parent artery and … branches are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: balloon-assisted coil embolisation, Raymond-Roy class ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ICU / neurosurgical ward observation; …; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.

Conclusion:
- Successful balloon-assisted coil embolisation of the … aneurysm; Raymond-Roy class ….` },

{ id: 'neuro_coil_stent_assisted', title: 'Embolizacja niepękniętego tętniaka z asystą stentu', titleEn: 'Stent-assisted coiling of unruptured aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 70,
  proc: ['stent_coiling', 'coiling', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Embolizacja niepękniętego tętniaka wewnątrzczaszkowego spiralami odczepialnymi z asystą stentu

Opis:
Wskazanie: niepęknięty tętniak … o szerokiej szyi (…); kwalifikacja na konsylium neurowaskularnym.
Lokalizacja: …
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik do stentu …, mikrocewnik do spiral …, mikroprowadniki …, stent wewnątrzczaszkowy samorozprężalny … × … mm, spirale odczepialne (… szt.); heparyna … j.m. i.v. (ACT … s). Podwójna terapia przeciwpłytkowa przed zabiegiem: … (test agregacji: …).
Przebieg zabiegu:
Wykonano angiografię … oraz angiografię rotacyjną 3D. Uwidoczniono tętniak … o wymiarach … × … mm, szyja … mm (stosunek kopuła/szyja …). Wyznaczono projekcje robocze. Cewnik prowadzący umieszczono w …. Mikrocewnik do spiral wprowadzono do worka tętniaka (technika „jailing”) / przez oczka stentu, a mikrocewnik do stentu umieszczono dystalnie w …. Implantowano stent … × … mm od … do …, obejmujący szyję tętniaka z marginesem. Wykonano embolizację tętniaka spiralami odczepialnymi (łącznie … szt.). W kontrolnej angiografii stent prawidłowo rozprężony, przylegający do ściany; tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi / worka (Raymond-Roy klasa …). Naczynie macierzyste i gałęzie … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: embolizacja tętniaka z asystą stentu, Raymond-Roy klasa …; stent drożny.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa … przez … miesięcy, następnie monoterapia …; obserwacja neurologiczna przez … h; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Skuteczna embolizacja niepękniętego tętniaka … spiralami odczepialnymi z asystą stentu; Raymond-Roy klasa ….`,
  textEn: `Procedure: Stent-assisted detachable coil embolisation of an unruptured intracranial aneurysm

Findings:
Indication: unruptured wide-necked … aneurysm (…); approved at the neurovascular multidisciplinary meeting.
Target: …
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F intermediate catheter, … stent microcatheter, … coiling microcatheter, … microwires, … × … mm self-expanding intracranial stent, detachable coils (… in total); heparin … IU i.v. (ACT … s). Pre-procedural dual antiplatelet therapy: … (platelet function test: …).
Procedure details:
Angiography of … with 3D rotational angiography was performed. This demonstrated a … aneurysm measuring … × … mm, neck … mm (dome-to-neck ratio …). Working projections were determined. The guide catheter was placed in …. The coiling microcatheter was positioned in the aneurysm sac (jailing technique) / through the stent struts, and the stent microcatheter was placed distally in …. A … × … mm stent was deployed from … to …, covering the aneurysm neck with adequate margins. The aneurysm was embolised with detachable coils (… in total). Control angiography showed a well-expanded stent with good wall apposition; complete occlusion / neck remnant / residual aneurysm (Raymond-Roy class …). The parent artery and … branches are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: stent-assisted coil embolisation, Raymond-Roy class …; patent stent.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy … for … months, then single antiplatelet therapy …; neurological observation for … h; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.

Conclusion:
- Successful stent-assisted coil embolisation of an unruptured … aneurysm; Raymond-Roy class ….` },

{ id: 'neuro_fd_ica_paraophthalmic', title: 'Stent przekierowujący przepływ – tętniak paraoftalmiczny ICA', titleEn: 'Flow diverter – paraophthalmic ICA aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 80,
  proc: ['flow_diverter', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Implantacja stentu przekierowującego przepływ – tętniak paraoftalmiczny tętnicy szyjnej wewnętrznej

Opis:
Wskazanie: niepęknięty tętniak paraoftalmiczny tętnicy szyjnej wewnętrznej … (…); kwalifikacja na konsylium neurowaskularnym.
Lokalizacja: tętnica szyjna wewnętrzna …, odcinek C6 (oftalmiczny)
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący / długa koszulka … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, stent przekierowujący przepływ … × … mm; heparyna … j.m. i.v. (ACT … s). Podwójna terapia przeciwpłytkowa przed zabiegiem: … (test agregacji: …).
Przebieg zabiegu:
Wykonano angiografię tętnicy szyjnej wewnętrznej … oraz angiografię rotacyjną 3D. Uwidoczniono tętniak odcinka C6 tętnicy szyjnej wewnętrznej, o wymiarach … × … mm, szyja … mm, skierowany … (górno-przyśrodkowo / przyśrodkowo / …); tętnica oczna odchodzi … względem szyi tętniaka. Średnica naczynia macierzystego: proksymalnie … mm, dystalnie … mm. Cewnik prowadzący umieszczono w odcinku C1, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem wprowadzono do odcinka M1/M2 tętnicy środkowej mózgu …. Implantowano stent przekierowujący przepływ … × … mm od odcinka C7 do odcinka C4/C5, obejmujący szyję tętniaka z marginesem, z dobrym otwarciem i przyleganiem do ściany (potwierdzone tomografią wiązki stożkowej …). W kontrolnej angiografii zastój kontrastu w worku tętniaka (OKM …). Tętnica oczna, tętnica łącząca tylna i tętnica naczyniówkowa przednia drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: stent przekierowujący przepływ prawidłowo implantowany, OKM … w kontroli końcowej.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: podwójna terapia przeciwpłytkowa … przez … miesięcy, następnie monoterapia …; obserwacja neurologiczna i wzroku przez … h; kontrolna angiografia (DSA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Implantacja stentu przekierowującego przepływ w odcinku C4–C7 tętnicy szyjnej wewnętrznej … z powodu tętniaka paraoftalmicznego; zastój kontrastu w worku (OKM …), tętnica oczna drożna.`,
  textEn: `Procedure: Flow diverter implantation – paraophthalmic internal carotid artery aneurysm

Findings:
Indication: unruptured paraophthalmic aneurysm of the … internal carotid artery (…); approved at the neurovascular multidisciplinary meeting.
Target: … internal carotid artery, C6 (ophthalmic) segment
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter / long sheath, … F intermediate catheter, … microcatheter, … microwire, … × … mm flow-diverting stent; heparin … IU i.v. (ACT … s). Pre-procedural dual antiplatelet therapy: … (platelet function test: …).
Procedure details:
Angiography of the … internal carotid artery with 3D rotational angiography was performed. This demonstrated an aneurysm of the C6 segment of the internal carotid artery measuring … × … mm, neck … mm, projecting … (superomedially / medially / …); the ophthalmic artery arises … in relation to the aneurysm neck. Parent artery diameter: … mm proximally, … mm distally. The guide catheter was placed in C1 and the intermediate catheter in the … segment. The microcatheter was advanced over the microwire into the M1/M2 segment of the … middle cerebral artery. A … × … mm flow-diverting stent was deployed from the C7 to the C4/C5 segment, covering the aneurysm neck with adequate margins, with good opening and wall apposition (confirmed on cone-beam CT …). Control angiography showed contrast stasis within the aneurysm sac (OKM …). The ophthalmic, posterior communicating and anterior choroidal arteries are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: flow diverter correctly deployed, OKM grade … on final angiography.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: dual antiplatelet therapy … for … months, then single antiplatelet therapy …; neurological and visual observation for … h; follow-up angiography (DSA) in … months; puncture site monitoring.

Conclusion:
- Flow diverter deployed across the C4–C7 segments of the … internal carotid artery for a paraophthalmic aneurysm; intra-aneurysmal contrast stasis (OKM …), ophthalmic artery patent.` },

{ id: 'neuro_fd_va_dissecting', title: 'Flow diverter – tętniak wrzecionowaty/rozwarstwiający VA', titleEn: 'Flow diverter – fusiform/dissecting VA aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 90,
  proc: ['flow_diverter', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Implantacja stentu przekierowującego przepływ – tętniak wrzecionowaty / rozwarstwiający tętnicy kręgowej

Opis:
Wskazanie: tętniak wrzecionowaty / rozwarstwiający odcinka V4 tętnicy kręgowej … (pęknięty / niepęknięty, …).
Lokalizacja: tętnica kręgowa …, odcinek V4 (wewnątrzczaszkowy)
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, stent przekierowujący przepływ … × … mm (… szt.), spirale odczepialne …; heparyna … j.m. i.v. (ACT … s). Leczenie przeciwpłytkowe: ….
Przebieg zabiegu:
Wykonano angiografię obu tętnic kręgowych i tętnic szyjnych wewnętrznych … oraz angiografię rotacyjną 3D. Uwidoczniono wrzecionowate poszerzenie / tętniak rozwarstwiający odcinka V4 tętnicy kręgowej …, o długości … mm i maksymalnej średnicy … mm, położone proksymalnie / obejmujące / dystalnie od odejścia PICA …; przeciwstronna tętnica kręgowa …, połączenie kręgowo-podstawne i tętnica podstawna …, tętnice łączące tylne …. Cewnik prowadzący umieszczono w odcinku V2 tętnicy kręgowej …, cewnik pośredni w odcinku …. Mikrocewnik z mikroprowadnikiem przeprowadzono przez zmianę do tętnicy podstawnej / tętnicy tylnej mózgu …. Implantowano stent przekierowujący przepływ … × … mm od … do …, obejmujący cały odcinek zmieniony z marginesem; … (dodatkowo spirale w worku / drugi stent teleskopowo). W kontrolnej angiografii stent prawidłowo rozprężony, zastój kontrastu w tętniaku (OKM …). PICA …, tętnica rdzeniowa przednia … i tętnica podstawna drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: stent przekierowujący przepływ w odcinku V4 tętnicy kręgowej …, OKM ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leczenie przeciwpłytkowe … przez … miesięcy; obserwacja neurologiczna przez … h; kontrolna angiografia (DSA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Implantacja stentu przekierowującego przepływ w odcinku V4 tętnicy kręgowej … z powodu tętniaka wrzecionowatego / rozwarstwiającego; OKM …, PICA ….`,
  textEn: `Procedure: Flow diverter implantation – fusiform / dissecting vertebral artery aneurysm

Findings:
Indication: fusiform / dissecting aneurysm of the V4 segment of the … vertebral artery (ruptured / unruptured, …).
Target: … vertebral artery, V4 (intradural) segment
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, … × … mm flow-diverting stent (… in total), detachable coils …; heparin … IU i.v. (ACT … s). Antiplatelet therapy: ….
Procedure details:
Angiography of both vertebral arteries and the internal carotid arteries … with 3D rotational angiography was performed. This demonstrated fusiform dilatation / a dissecting aneurysm of the V4 segment of the … vertebral artery, … mm long with a maximum diameter of … mm, located proximal to / involving / distal to the PICA origin …; contralateral vertebral artery …, vertebrobasilar junction and basilar artery …, posterior communicating arteries …. The guide catheter was placed in the V2 segment of the … vertebral artery and the intermediate catheter in the … segment. The microcatheter was advanced over the microwire across the lesion into the basilar artery / … posterior cerebral artery. A … × … mm flow-diverting stent was deployed from … to …, covering the entire diseased segment with margins; … (adjunctive coils in the sac / second telescoping stent). Control angiography showed a well-expanded stent with intra-aneurysmal contrast stasis (OKM …). PICA …, the anterior spinal artery … and the basilar artery are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: flow diverter in the V4 segment of the … vertebral artery, OKM grade ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: antiplatelet therapy … for … months; neurological observation for … h; follow-up angiography (DSA) in … months; puncture site monitoring.

Conclusion:
- Flow diverter deployed in the V4 segment of the … vertebral artery for a fusiform / dissecting aneurysm; OKM grade …, PICA ….` },
{ id: 'neuro_web_bifurcation', title: 'Urządzenie wewnątrzworkowe (WEB) – tętniak bifurkacyjny', titleEn: 'Intrasaccular device (WEB) – bifurcation aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 100,
  proc: ['intrasaccular', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Embolizacja tętniaka bifurkacyjnego urządzeniem wewnątrzworkowym (siateczkowe urządzenie zaburzające przepływ)

Opis:
Wskazanie: … tętniak … (pęknięty / niepęknięty) o szerokiej szyi, zlokalizowany w rozwidleniu naczynia.
Lokalizacja: … (np. rozwidlenie tętnicy środkowej mózgu …, tętnica łącząca przednia, szczyt tętnicy podstawnej, rozwidlenie tętnicy szyjnej wewnętrznej)
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik … (kompatybilny z urządzeniem), mikroprowadnik …, urządzenie wewnątrzworkowe … × … mm; heparyna … j.m. i.v. (ACT … s).
Przebieg zabiegu:
Wykonano angiografię … oraz angiografię rotacyjną 3D z dokładnymi pomiarami worka. Uwidoczniono tętniak … o szerokości … mm, wysokości … mm, szyja … mm, z gałęziami … odchodzącymi w okolicy szyi. Dobrano urządzenie … × … mm. Cewnik prowadzący umieszczono w …, cewnik pośredni w …. Mikrocewnik z mikroprowadnikiem wprowadzono do worka tętniaka. Urządzenie wewnątrzworkowe rozprężono w worku tętniaka; w kontrolnych projekcjach roboczych potwierdzono prawidłowe położenie i przyleganie do szyi, bez protruzji do naczynia macierzystego i gałęzi, po czym urządzenie odczepiono. W kontrolnej angiografii zastój kontrastu wewnątrz urządzenia, tętniak … (skala WEB Occlusion Scale (WOS) …). Gałęzie … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: urządzenie wewnątrzworkowe prawidłowo implantowane, WOS ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna przez … h; leczenie przeciwpłytkowe: …; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Embolizacja tętniaka … urządzeniem wewnątrzworkowym … × … mm; WOS …, gałęzie drożne.`,
  textEn: `Procedure: Embolisation of a bifurcation aneurysm with an intrasaccular flow-disruption device

Findings:
Indication: … wide-necked bifurcation aneurysm of … (ruptured / unruptured).
Target: … (e.g. … middle cerebral artery bifurcation, anterior communicating artery, basilar tip, internal carotid artery terminus)
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F intermediate catheter, … device-compatible microcatheter, … microwire, … × … mm intrasaccular device; heparin … IU i.v. (ACT … s).
Procedure details:
Angiography of … with 3D rotational angiography and detailed sac measurements was performed. This demonstrated a … aneurysm, width … mm, height … mm, neck … mm, with … branches arising near the neck. A … × … mm device was selected. The guide catheter was placed in … and the intermediate catheter in …. The microcatheter was advanced over the microwire into the aneurysm sac. The intrasaccular device was deployed within the sac; correct position and neck coverage without protrusion into the parent artery or branches were confirmed in the working projections before detachment. Control angiography showed contrast stasis within the device, aneurysm … (WEB Occlusion Scale (WOS) …). The … branches are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: intrasaccular device correctly deployed, WOS ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation for … h; antiplatelet therapy: …; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.

Conclusion:
- Embolisation of the … aneurysm with a … × … mm intrasaccular device; WOS …, branches patent.` },

{ id: 'neuro_parent_vessel_occlusion', title: 'Zamknięcie naczynia macierzystego (PVO)', titleEn: 'Parent vessel occlusion (PVO)', group: 'Neuro', section: 'Aneurysm', priority: 110,
  proc: ['coiling', 'embolization', 'neuro_angio'], anat: ['brain', 'neck'],
  text: `Badanie: Wewnątrznaczyniowe zamknięcie naczynia macierzystego (PVO) spiralami

Opis:
Wskazanie: … (np. olbrzymi / wrzecionowaty / rozwarstwiający tętniak … nieodpowiedni do leczenia rekonstrukcyjnego); próba okluzji balonowej: … (tolerowana / nie dotyczy).
Lokalizacja: …
Znieczulenie: ogólne / miejscowe ….
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F / cewnik prowadzący z balonem … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.), zatyczka naczyniowa … mm …; heparyna … j.m. i.v. (ACT … s).
Przebieg zabiegu:
Wykonano angiografię … oraz ocenę krążenia obocznego przez tętnicę łączącą przednią / tylną z angiografią naczyń przeciwstronnych …. Uwidoczniono …. Cewnik prowadzący umieszczono w …. Mikrocewnik wprowadzono do … i wykonano zamknięcie naczynia macierzystego na odcinku od … do … (w obrębie / proksymalnie od zmiany) spiralami odczepialnymi …, z zablokowaniem przepływu balonem cewnika prowadzącego w celu ograniczenia ryzyka zatorowości / …. W kontrolnej angiografii całkowita niedrożność … i brak wypełnienia tętniaka. Angiografia naczyń przeciwstronnych / tętnicy kręgowej: prawidłowe wypełnienie terytorium … przez krążenie oboczne (…), bez istotnego opóźnienia fazy żylnej. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: zamknięcie … z wyłączeniem tętniaka z krążenia; terytorium zaopatrywane przez krążenie oboczne.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna w OIT / oddziale neurochirurgii przez … h, unikanie hipotensji i odwodnienia; leczenie przeciwpłytkowe / przeciwkrzepliwe: …; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Wewnątrznaczyniowe zamknięcie … spiralami z całkowitym wyłączeniem tętniaka …; prawidłowe krążenie oboczne.`,
  textEn: `Procedure: Endovascular parent vessel occlusion (PVO) with coils

Findings:
Indication: … (e.g. giant / fusiform / dissecting … aneurysm unsuitable for reconstructive treatment); balloon test occlusion: … (tolerated / not applicable).
Target: …
Anaesthesia: general / local ….
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter / … F balloon guide catheter, … microcatheter, … microwire, detachable coils (… in total), … mm vascular plug …; heparin … IU i.v. (ACT … s).
Procedure details:
Angiography of … was performed with assessment of collateral flow via the anterior / posterior communicating artery on contralateral angiography …. This demonstrated …. The guide catheter was placed in …. The microcatheter was advanced into … and the parent artery was occluded from … to … (at / proximal to the lesion) with detachable coils …, with flow arrest using the balloon guide catheter to reduce the risk of distal embolism / …. Control angiography showed complete occlusion of … with no aneurysm filling. Contralateral / vertebral angiography showed good collateral filling of the … territory (…) without significant venous phase delay. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: occlusion of … with exclusion of the aneurysm; territory supplied by collateral flow.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation in ICU / neurosurgical ward for … h, avoid hypotension and dehydration; antiplatelet / anticoagulant therapy: …; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.

Conclusion:
- Endovascular coil occlusion of … with complete exclusion of the … aneurysm; adequate collateral circulation.` },

{ id: 'neuro_coil_recurrence', title: 'Ponowna embolizacja nawrotu tętniaka', titleEn: 'Retreatment of recurrent aneurysm', group: 'Neuro', section: 'Aneurysm', priority: 120,
  proc: ['coiling', 'stent_coiling', 'flow_diverter', 'neuro_angio'], anat: ['brain'],
  text: `Badanie: Ponowne leczenie wewnątrznaczyniowe nawrotu tętniaka po embolizacji spiralami

Opis:
Wskazanie: rekanalizacja tętniaka … leczonego spiralami w dniu … (…); w kontroli z dnia … Raymond-Roy klasa ….
Lokalizacja: …
Znieczulenie: ogólne.
Dostęp: tętnica udowa wspólna … (koszulka … F).
Sprzęt: cewnik prowadzący … F, cewnik pośredni … F, mikrocewnik …, mikroprowadnik …, spirale odczepialne (… szt.), balon do remodelingu … × … mm / stent wewnątrzczaszkowy … × … mm / stent przekierowujący przepływ … × … mm; heparyna … j.m. i.v. (ACT … s). Leczenie przeciwpłytkowe: ….
Przebieg zabiegu:
Wykonano angiografię … oraz angiografię rotacyjną 3D. Uwidoczniono kompakcję pakietu spiral / wzrost tętniaka z wypełnieniem szyi / worka o wymiarach … × … mm (Raymond-Roy klasa …). Naczynie macierzyste i gałęzie …. Cewnik prowadzący umieszczono w …. Mikrocewnik wprowadzono do zrekanalizowanej części tętniaka / … i wykonano ponowną embolizację spiralami odczepialnymi (… szt.) z asystą balonu / stentu …. / Implantowano stent przekierowujący przepływ … × … mm obejmujący szyję tętniaka. W kontrolnej angiografii tętniak zamknięty całkowicie / z resztkowym wypełnieniem szyi (Raymond-Roy klasa … / OKM …). Naczynie macierzyste i gałęzie … drożne. Bez zatorów obwodowych, bez wynaczynienia kontrastu. Hemostaza miejsca wkłucia ….
Wynik: ponowna embolizacja tętniaka, Raymond-Roy klasa … / OKM ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja neurologiczna przez … h; leczenie przeciwpłytkowe: …; kontrolna angiografia (DSA/MRA) za … miesięcy; obserwacja miejsca wkłucia.

Wnioski:
- Ponowne leczenie nawrotu tętniaka … (…); Raymond-Roy klasa … / OKM ….`,
  textEn: `Procedure: Endovascular retreatment of a recurrent aneurysm after coil embolisation

Findings:
Indication: recanalisation of a … aneurysm coiled on … (…); Raymond-Roy class … on follow-up of ….
Target: …
Anaesthesia: general.
Access: … common femoral artery (… F sheath).
Devices: … F guide catheter, … F intermediate catheter, … microcatheter, … microwire, detachable coils (… in total), … × … mm remodelling balloon / … × … mm intracranial stent / … × … mm flow-diverting stent; heparin … IU i.v. (ACT … s). Antiplatelet therapy: ….
Procedure details:
Angiography of … with 3D rotational angiography was performed. This demonstrated coil compaction / aneurysm regrowth with filling of the neck / sac measuring … × … mm (Raymond-Roy class …). Parent artery and branches: …. The guide catheter was placed in …. The microcatheter was advanced into the recanalised portion of the aneurysm / … and further detachable coils (… in total) were deployed with balloon / stent assistance …. / A … × … mm flow-diverting stent was deployed across the aneurysm neck. Control angiography showed complete occlusion / a neck remnant (Raymond-Roy class … / OKM grade …). The parent artery and … branches are patent. No distal emboli, no contrast extravasation. Haemostasis of the puncture site ….
Result: aneurysm retreated, Raymond-Roy class … / OKM grade ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neurological observation for … h; antiplatelet therapy: …; follow-up angiography (DSA/MRA) in … months; puncture site monitoring.

Conclusion:
- Retreatment of recurrent … aneurysm (…); Raymond-Roy class … / OKM grade ….` },
];

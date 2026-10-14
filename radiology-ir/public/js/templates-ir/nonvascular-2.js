// Non-vascular IR templates, part 2 (drainage, ablation, GI, spine/MSK) + snippets.
export default [
// ===== Drainage =====
{ id: 'nv2_abscess_abdominal_ct', title: 'Drenaż ropnia jamy brzusznej pod kontrolą TK', titleEn: 'CT-guided abdominal abscess drainage', group: 'NonVascular', section: 'Drainage', priority: 10,
  proc: ['drainage'], anat: ['abdomen'],
  text: `Badanie: Przezskórny drenaż ropnia jamy brzusznej pod kontrolą TK

Opis:
Wskazanie: …
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny, …, w ułożeniu …; tor wkłucia zaplanowany z ominięciem pętli jelitowych i naczyń.
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
W badaniu TK planującym uwidoczniono zbiornik płynowy … o wymiarach … × … mm, ze wzmocnieniem ściany. Po dezynfekcji i znieczuleniu miejscowym pod kontrolą TK nakłuto zbiornik techniką Seldingera. Uzyskano … treść …, którą pobrano do badania mikrobiologicznego. Po wprowadzeniu prowadnika i rozszerzeniu kanału założono cewnik drenażowy, którego pętlę umieszczono w zbiorniku. Ewakuowano … ml treści, zbiornik przepłukano solą fizjologiczną. Kontrolne skany TK potwierdziły prawidłowe położenie drenu i istotne zmniejszenie zbiornika. Dren ufiksowano do skóry i podłączono do worka.
Wynik: prawidłowo założony dren w ropniu …, ewakuowano … ml treści ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, dokumentacja ilości i charakteru wydzieliny, antybiotykoterapia według posiewu, kontrolne badanie obrazowe przed usunięciem drenu.

Wnioski:
- Skuteczny przezskórny drenaż ropnia … pod kontrolą TK; założono dren … F.`,
  textEn: `Procedure: CT-guided percutaneous abdominal abscess drainage

Findings:
Indication: …
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous, …, patient …; trajectory planned to avoid bowel loops and vessels.
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter.
Procedure details:
Planning CT showed a … × … mm rim-enhancing fluid collection …. After skin preparation and local anaesthesia the collection was punctured under CT guidance using the Seldinger technique. … fluid was aspirated and sent for microbiology. A guidewire was advanced, the tract was dilated and a drainage catheter was placed with its loop within the collection. … ml was evacuated and the cavity was irrigated with saline. Post-procedure CT confirmed satisfactory drain position and marked reduction of the collection. The drain was secured to the skin and connected to a drainage bag.
Result: drain correctly placed within the … abscess, … ml of … fluid evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record output volume and character, antibiotics according to culture, follow-up imaging before drain removal.

Conclusion:
- Successful CT-guided percutaneous drainage of … abscess; … F drain placed.` },

{ id: 'nv2_abscess_abdominal_us', title: 'Drenaż ropnia jamy brzusznej pod kontrolą USG', titleEn: 'US-guided abdominal abscess drainage', group: 'NonVascular', section: 'Drainage', priority: 11,
  proc: ['drainage'], anat: ['abdomen', 'pelvis'],
  text: `Badanie: Przezskórny drenaż ropnia jamy brzusznej pod kontrolą USG i fluoroskopii

Opis:
Wskazanie: …
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny, …, pod kontrolą USG.
Sprzęt: igła … G / zestaw trokarowy, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
W badaniu USG uwidoczniono zbiornik płynowy … o wymiarach … × … mm z treścią …. Pod kontrolą USG w czasie rzeczywistym nakłuto zbiornik i uzyskano … treść …, pobraną do badania mikrobiologicznego. Wprowadzono prowadnik, rozszerzono kanał pod kontrolą fluoroskopii i założono cewnik drenażowy z pętlą w zbiorniku. Ewakuowano … ml treści. Kontrolne podanie środka kontrastowego przez dren wykazało wypełnienie jamy ropnia bez cech przetoki do przewodu pokarmowego. Dren ufiksowano do skóry i podłączono do worka.
Wynik: prawidłowo założony dren w ropniu …, ewakuowano … ml treści.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, bilans wydzieliny z drenu, antybiotykoterapia według posiewu, kontrolne USG/TK przed usunięciem drenu.

Wnioski:
- Skuteczny przezskórny drenaż ropnia … pod kontrolą USG; założono dren … F.`,
  textEn: `Procedure: Percutaneous abdominal abscess drainage under ultrasound and fluoroscopic guidance

Findings:
Indication: …
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous, …, under ultrasound guidance.
Devices: … G needle / trocar set, … guidewire, dilators, … F pigtail drainage catheter.
Procedure details:
Ultrasound showed a … × … mm fluid collection … with … contents. Under real-time ultrasound guidance the collection was punctured and … fluid was aspirated and sent for microbiology. A guidewire was advanced, the tract was dilated under fluoroscopy and a drainage catheter was placed with its loop in the collection. … ml was evacuated. A contrast injection through the drain opacified the abscess cavity with no fistulous communication with the bowel. The drain was secured to the skin and connected to a drainage bag.
Result: drain correctly placed within the … abscess, … ml evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record drain output, antibiotics according to culture, follow-up US/CT before drain removal.

Conclusion:
- Successful ultrasound-guided percutaneous drainage of … abscess; … F drain placed.` },

{ id: 'nv2_abscess_pelvic_transgluteal', title: 'Drenaż ropnia miednicy – dostęp przezpośladkowy', titleEn: 'Pelvic abscess drainage – transgluteal', group: 'NonVascular', section: 'Drainage', priority: 12,
  proc: ['drainage'], anat: ['pelvis'],
  text: `Badanie: Przezskórny drenaż ropnia miednicy z dostępu przezpośladkowego pod kontrolą TK

Opis:
Wskazanie: …
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: przezpośladkowy …, przez otwór kulszowy większy, w ułożeniu na brzuchu.
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
W badaniu TK planującym uwidoczniono zbiornik płynowy … miednicy o wymiarach … × … mm. Tor wkłucia zaplanowano przez otwór kulszowy większy, możliwie przyśrodkowo i blisko kości krzyżowej, poniżej mięśnia gruszkowatego, z ominięciem nerwu kulszowego oraz naczyń pośladkowych. Pod kontrolą TK nakłuto zbiornik i uzyskano … treść …, pobraną do badania mikrobiologicznego. Po wprowadzeniu prowadnika i rozszerzeniu kanału założono cewnik drenażowy z pętlą w zbiorniku. Ewakuowano … ml treści. Kontrolne skany TK potwierdziły prawidłowe położenie drenu i zmniejszenie zbiornika. Dren ufiksowano do skóry.
Wynik: prawidłowo założony dren w ropniu miednicy, ewakuowano … ml treści.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, bilans wydzieliny, obserwacja w kierunku bólu promieniującego do kończyny dolnej i krwawienia, antybiotykoterapia według posiewu, kontrolne TK przed usunięciem drenu.

Wnioski:
- Skuteczny przezskórny drenaż ropnia miednicy z dostępu przezpośladkowego …; założono dren … F.`,
  textEn: `Procedure: CT-guided transgluteal percutaneous pelvic abscess drainage

Findings:
Indication: …
Target: …
Anaesthesia: local, … ml of …% lidocaine, …
Access: … transgluteal, through the greater sciatic foramen, patient prone.
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter.
Procedure details:
Planning CT showed a … × … mm pelvic fluid collection …. The trajectory was planned through the greater sciatic foramen, as medial and close to the sacrum as possible, below the piriformis muscle, avoiding the sciatic nerve and gluteal vessels. Under CT guidance the collection was punctured and … fluid was aspirated and sent for microbiology. A guidewire was advanced, the tract was dilated and a drainage catheter was placed with its loop in the collection. … ml was evacuated. Post-procedure CT confirmed satisfactory drain position and reduction of the collection. The drain was secured to the skin.
Result: drain correctly placed within the pelvic abscess, … ml evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record drain output, observe for radiating leg pain and bleeding, antibiotics according to culture, follow-up CT before drain removal.

Conclusion:
- Successful CT-guided transgluteal drainage of … pelvic abscess; … F drain placed.` },

{ id: 'nv2_liver_abscess', title: 'Drenaż ropnia wątroby', titleEn: 'Liver abscess drainage', group: 'NonVascular', section: 'Drainage', priority: 13,
  proc: ['drainage'], anat: ['abdomen'],
  text: `Badanie: Przezskórny drenaż ropnia wątroby pod kontrolą USG i fluoroskopii

Opis:
Wskazanie: …
Lokalizacja: segment … wątroby
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: przezskórny, …, z drogą wkłucia przez miąższ wątroby, z ominięciem zachyłka opłucnowego.
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
W badaniu USG uwidoczniono zmianę płynową w segmencie … wątroby o wymiarach … × … mm, o niejednorodnej treści …. Pod kontrolą USG, przez warstwę prawidłowego miąższu wątroby, nakłuto jamę ropnia i uzyskano … treść …, pobraną do badania mikrobiologicznego. Po wprowadzeniu prowadnika i rozszerzeniu kanału pod kontrolą fluoroskopii założono cewnik drenażowy z pętlą w jamie ropnia. Ewakuowano … ml treści. Kontrolne podanie środka kontrastowego wypełniło jamę ropnia, bez cech komunikacji z drogami żółciowymi. Dren ufiksowano do skóry i podłączono do worka.
Wynik: prawidłowo założony dren w ropniu wątroby, ewakuowano … ml treści.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, bilans wydzieliny (kontrola domieszki żółci), antybiotykoterapia według posiewu, kontrolne USG/TK przed usunięciem drenu.

Wnioski:
- Skuteczny przezskórny drenaż ropnia segmentu … wątroby; założono dren … F.`,
  textEn: `Procedure: Percutaneous liver abscess drainage under ultrasound and fluoroscopic guidance

Findings:
Indication: …
Target: liver segment …
Anaesthesia: local, … ml of …% lidocaine, …
Access: percutaneous, …, transhepatic route through liver parenchyma, avoiding the pleural recess.
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter.
Procedure details:
Ultrasound showed a … × … mm heterogeneous fluid collection in liver segment …. Under ultrasound guidance, traversing a margin of normal liver parenchyma, the abscess cavity was punctured and … fluid was aspirated and sent for microbiology. A guidewire was advanced, the tract was dilated under fluoroscopy and a drainage catheter was placed with its loop in the abscess cavity. … ml was evacuated. Contrast injection opacified the abscess cavity with no communication with the bile ducts. The drain was secured to the skin and connected to a drainage bag.
Result: drain correctly placed within the liver abscess, … ml evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record drain output (watch for bile), antibiotics according to culture, follow-up US/CT before drain removal.

Conclusion:
- Successful percutaneous drainage of a segment … liver abscess; … F drain placed.` },

{ id: 'nv2_pancreatic_collection', title: 'Drenaż zbiornika trzustkowego / okołotrzustkowego', titleEn: 'Pancreatic / peripancreatic collection drainage', group: 'NonVascular', section: 'Drainage', priority: 14,
  proc: ['drainage'], anat: ['abdomen'],
  text: `Badanie: Przezskórny drenaż zbiornika okołotrzustkowego pod kontrolą TK

Opis:
Wskazanie: … (ostry zbiornik płynowy / torbiel rzekoma / martwica otorbiona …).
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: przezskórny, …, zaotrzewnowy / przezotrzewnowy …, z ominięciem jelit, żołądka i naczyń.
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
W badaniu TK planującym uwidoczniono zbiornik … o wymiarach … × … mm, zawierający …. Tor wkłucia zaplanowano z dostępu …, z ominięciem przewodu pokarmowego i naczyń krezkowych/śledzionowych. Pod kontrolą TK nakłuto zbiornik i uzyskano … treść …, pobraną do badania mikrobiologicznego i oznaczenia amylazy/lipazy. Po wprowadzeniu prowadnika i rozszerzeniu kanału założono cewnik drenażowy z pętlą w zbiorniku. Ewakuowano … ml treści. Kontrolne skany TK potwierdziły prawidłowe położenie drenu. Dren ufiksowano do skóry.
Wynik: prawidłowo założony dren w zbiorniku …, ewakuowano … ml treści.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, bilans wydzieliny, kontrola amylazy w wydzielinie, kontrolne TK za … dni; w razie niewystarczającego drenażu rozważyć zwiększenie średnicy drenu lub dodatkowy dren / nekrosektomię.

Wnioski:
- Skuteczny przezskórny drenaż zbiornika okołotrzustkowego …; założono dren … F.`,
  textEn: `Procedure: CT-guided percutaneous peripancreatic collection drainage

Findings:
Indication: … (acute peripancreatic fluid collection / pseudocyst / walled-off necrosis …).
Target: …
Anaesthesia: local, … ml of …% lidocaine, …
Access: percutaneous, …, retroperitoneal / transperitoneal …, avoiding bowel, stomach and vessels.
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter.
Procedure details:
Planning CT showed a … × … mm … collection containing …. A … approach was planned avoiding the gastrointestinal tract and the mesenteric/splenic vessels. Under CT guidance the collection was punctured and … fluid was aspirated and sent for microbiology and amylase/lipase. A guidewire was advanced, the tract was dilated and a drainage catheter was placed with its loop in the collection. … ml was evacuated. Post-procedure CT confirmed satisfactory drain position. The drain was secured to the skin.
Result: drain correctly placed within the … collection, … ml evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record drain output, check drain fluid amylase, follow-up CT in … days; if drainage is inadequate consider drain upsizing or an additional drain / necrosectomy.

Conclusion:
- Successful percutaneous drainage of … peripancreatic collection; … F drain placed.` },

{ id: 'nv2_pleural_drain_empyema', title: 'Drenaż opłucnej / ropniak opłucnej', titleEn: 'Pleural drain / empyema drainage', group: 'NonVascular', section: 'Drainage', priority: 15,
  proc: ['pleural', 'drainage'], anat: ['chest'],
  text: `Badanie: Drenaż jamy opłucnej pod kontrolą USG

Opis:
Wskazanie: … (ropniak opłucnej / płyn opłucnowy …).
Lokalizacja: jama opłucnej …
Znieczulenie: miejscowe, … ml lidokainy …%, z nasiękiem opłucnej ściennej.
Dostęp: … przestrzeń międzyżebrowa w linii pachowej …, tuż nad górnym brzegiem żebra, w ułożeniu ….
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F, system drenażowy z zastawką wodną / …
Przebieg zabiegu:
W badaniu USG uwidoczniono płyn w jamie opłucnej …, … (z przegrodami / bez przegród), o największej grubości warstwy … mm. Miejsce wkłucia oznaczono pod kontrolą USG, w bezpiecznej odległości od przepony, wątroby/śledziony i serca. Nakłuto jamę opłucnej nad górnym brzegiem żebra i uzyskano … płyn …, pobrany do badań biochemicznych, mikrobiologicznych i cytologicznych. Po wprowadzeniu prowadnika i rozszerzeniu kanału założono cewnik drenażowy w jamie opłucnej. Ewakuowano … ml płynu. Dren ufiksowano do skóry i podłączono do systemu drenażowego.
Wynik: prawidłowo założony dren w jamie opłucnej …, ewakuowano … ml płynu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG klatki piersiowej, płukanie drenu … ml soli fizjologicznej co … h, bilans drenażu, ewentualnie leczenie fibrynolityczne dopłucnowe według decyzji klinicznej, antybiotykoterapia według posiewu.

Wnioski:
- Skuteczny drenaż jamy opłucnej … pod kontrolą USG; założono dren … F.`,
  textEn: `Procedure: Ultrasound-guided pleural drain insertion

Findings:
Indication: … (empyema / pleural effusion …).
Target: … pleural space
Anaesthesia: local, … ml of …% lidocaine, infiltrating down to the parietal pleura.
Access: … intercostal space, … axillary line, just above the upper border of the rib, patient ….
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter, underwater-seal / … drainage system.
Procedure details:
Ultrasound showed a … pleural effusion, … (septated / non-septated), maximum depth … mm. The entry site was marked under ultrasound guidance at a safe distance from the diaphragm, liver/spleen and heart. The pleural space was punctured above the upper border of the rib and … fluid was aspirated and sent for biochemistry, microbiology and cytology. A guidewire was advanced, the tract was dilated and a drainage catheter was placed in the pleural space. … ml of fluid was evacuated. The drain was secured to the skin and connected to the drainage system.
Result: drain correctly placed in the … pleural space, … ml evacuated.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: post-procedure chest radiograph, flush the drain with … ml saline every … h, record drain output, consider intrapleural fibrinolytic therapy per clinical team, antibiotics according to culture.

Conclusion:
- Successful ultrasound-guided … pleural drain insertion; … F drain placed.` },

{ id: 'nv2_thoracentesis', title: 'Nakłucie jamy opłucnej (torakocenteza)', titleEn: 'Thoracentesis', group: 'NonVascular', section: 'Drainage', priority: 16,
  proc: ['pleural'], anat: ['chest'],
  text: `Badanie: Nakłucie jamy opłucnej pod kontrolą USG

Opis:
Wskazanie: …
Lokalizacja: jama opłucnej …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: … przestrzeń międzyżebrowa w linii …, nad górnym brzegiem żebra, w pozycji siedzącej.
Sprzęt: igła / cewnik do nakłucia … G, zestaw do odbarczenia.
Przebieg zabiegu:
W badaniu USG uwidoczniono płyn w jamie opłucnej …, o grubości warstwy … mm, …. Pod kontrolą USG oznaczono miejsce wkłucia i nakłuto jamę opłucnej nad górnym brzegiem żebra. Uzyskano … płyn …. Pobrano próbki do badań biochemicznych, cytologicznych i mikrobiologicznych. Ewakuowano łącznie … ml płynu; zabieg zakończono …. Igłę usunięto, miejsce wkłucia zaopatrzono opatrunkiem. Kontrolne USG wykazało … ilość płynu bez cech odmy (zachowany objaw ślizgania opłucnej).
Wynik: ewakuowano … ml płynu …; pobrano materiał do badań.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG klatki piersiowej w razie objawów, obserwacja w kierunku duszności, bólu i kaszlu, ocena wyników badań płynu.

Wnioski:
- Wykonano nakłucie jamy opłucnej … pod kontrolą USG; ewakuowano … ml płynu ….`,
  textEn: `Procedure: Ultrasound-guided thoracentesis

Findings:
Indication: …
Target: … pleural space
Anaesthesia: local, … ml of …% lidocaine.
Access: … intercostal space, … line, above the upper border of the rib, patient sitting.
Devices: … G aspiration needle / catheter, drainage set.
Procedure details:
Ultrasound showed a … pleural effusion, depth … mm, …. The entry site was marked under ultrasound guidance and the pleural space was punctured above the upper border of the rib. … fluid was obtained. Samples were sent for biochemistry, cytology and microbiology. A total of … ml was drained; the procedure was stopped …. The needle was removed and a dressing applied. Post-procedure ultrasound showed … residual fluid with no pneumothorax (lung sliding preserved).
Result: … ml of … fluid drained; samples sent for analysis.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: chest radiograph if symptomatic, observe for dyspnoea, chest pain and cough, review fluid results.

Conclusion:
- Ultrasound-guided … thoracentesis; … ml of … fluid drained.` },

{ id: 'nv2_paracentesis_diagnostic', title: 'Paracenteza diagnostyczna', titleEn: 'Diagnostic paracentesis', group: 'NonVascular', section: 'Drainage', priority: 17,
  proc: ['paracentesis'], anat: ['abdomen'],
  text: `Badanie: Diagnostyczne nakłucie jamy otrzewnej pod kontrolą USG

Opis:
Wskazanie: …
Lokalizacja: jama otrzewnej, …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: … dół biodrowy, bocznie od naczyń nabrzusznych dolnych.
Sprzęt: igła … G.
Przebieg zabiegu:
W badaniu USG uwidoczniono … ilość płynu w jamie otrzewnej, z największą warstwą w okolicy …. Miejsce wkłucia wybrano pod kontrolą USG (z oceną Doppler), z ominięciem pętli jelitowych i naczyń nabrzusznych dolnych. Nakłuto jamę otrzewnej i pobrano … ml płynu …, który przekazano do badań: liczba komórek z rozmazem, biochemia (albumina, białko …), posiew, cytologia …. Igłę usunięto, miejsce wkłucia zaopatrzono opatrunkiem.
Wynik: pobrano … ml płynu … do badań.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja miejsca wkłucia (wyciek, krwawienie), ocena wyników badań płynu.

Wnioski:
- Wykonano diagnostyczną paracentezę pod kontrolą USG; pobrano … ml płynu ….`,
  textEn: `Procedure: Ultrasound-guided diagnostic paracentesis

Findings:
Indication: …
Target: peritoneal cavity, …
Anaesthesia: local, … ml of …% lidocaine.
Access: … iliac fossa, lateral to the inferior epigastric vessels.
Devices: … G needle.
Procedure details:
Ultrasound showed … ascites, deepest pocket in the …. The entry site was chosen under ultrasound guidance (with Doppler assessment) avoiding bowel loops and the inferior epigastric vessels. The peritoneal cavity was punctured and … ml of … fluid was aspirated and sent for cell count with differential, biochemistry (albumin, protein …), culture and cytology …. The needle was removed and a dressing applied.
Result: … ml of … fluid obtained for analysis.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe the puncture site (leak, bleeding), review fluid results.

Conclusion:
- Ultrasound-guided diagnostic paracentesis; … ml of … fluid obtained.` },

{ id: 'nv2_paracentesis_therapeutic', title: 'Paracenteza odbarczająca (wielkoobjętościowa)', titleEn: 'Therapeutic (large-volume) paracentesis', group: 'NonVascular', section: 'Drainage', priority: 18,
  proc: ['paracentesis'], anat: ['abdomen'],
  text: `Badanie: Odbarczające nakłucie jamy otrzewnej pod kontrolą USG

Opis:
Wskazanie: …
Lokalizacja: jama otrzewnej, …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: … dół biodrowy, bocznie od naczyń nabrzusznych dolnych.
Sprzęt: igła / cewnik … G / … F, zestaw do drenażu.
Przebieg zabiegu:
W badaniu USG uwidoczniono dużą ilość płynu w jamie otrzewnej. Miejsce wkłucia wybrano pod kontrolą USG, z ominięciem pętli jelitowych i naczyń nabrzusznych dolnych. Nakłuto jamę otrzewnej i wprowadzono cewnik drenażowy. Uzyskano … płyn …; próbkę przekazano do badań …. Ewakuowano łącznie … ml płynu w czasie …. Cewnik usunięto, miejsce wkłucia zaopatrzono opatrunkiem.
Wynik: ewakuowano … ml płynu ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: suplementacja albuminy według protokołu (przy ewakuacji dużej objętości), kontrola ciśnienia tętniczego i diurezy, obserwacja miejsca wkłucia w kierunku wycieku płynu.

Wnioski:
- Wykonano odbarczającą paracentezę pod kontrolą USG; ewakuowano … ml płynu ….`,
  textEn: `Procedure: Ultrasound-guided therapeutic large-volume paracentesis

Findings:
Indication: …
Target: peritoneal cavity, …
Anaesthesia: local, … ml of …% lidocaine.
Access: … iliac fossa, lateral to the inferior epigastric vessels.
Devices: … G / … F needle / catheter, drainage set.
Procedure details:
Ultrasound showed large-volume ascites. The entry site was chosen under ultrasound guidance avoiding bowel loops and the inferior epigastric vessels. The peritoneal cavity was punctured and a drainage catheter was inserted. … fluid was obtained; a sample was sent for …. A total of … ml was drained over …. The catheter was removed and a dressing applied.
Result: … ml of … fluid drained.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: albumin replacement according to protocol (for large-volume drainage), monitor blood pressure and urine output, observe the puncture site for ascitic leak.

Conclusion:
- Ultrasound-guided therapeutic paracentesis; … ml of … fluid drained.` },

{ id: 'nv2_drain_check_exchange', title: 'Kontrola / wymiana drenu', titleEn: 'Drain check / exchange', group: 'NonVascular', section: 'Drainage', priority: 19,
  proc: ['drainage'], anat: ['chest', 'abdomen', 'pelvis'],
  text: `Badanie: Kontrola fluoroskopowa (drenografia) i wymiana drenu

Opis:
Wskazanie: … (zmniejszony odpływ / przemieszczenie drenu / ocena przed usunięciem …).
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przez istniejący kanał drenu ….
Sprzęt: prowadnik …, cewnik drenażowy typu pigtail … F.
Przebieg zabiegu:
Przez istniejący dren … F podano środek kontrastowy. Uwidoczniono jamę resztkową o wymiarach ok. … mm, …, bez cech przetoki do przewodu pokarmowego / dróg żółciowych / dróg moczowych …. Po odcięciu i odblokowaniu pętli dotychczasowy dren usunięto po prowadniku. Po prowadniku wprowadzono nowy cewnik drenażowy … F, którego pętlę umieszczono w jamie. Kontrolne podanie środka kontrastowego potwierdziło prawidłowe położenie drenu i swobodny odpływ. Dren ufiksowano do skóry.
Wynik: dren wymieniony na … F, położenie prawidłowe; jama resztkowa ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płukanie drenu … ml soli fizjologicznej co … h, bilans wydzieliny, kolejna kontrola za … dni lub usunięcie drenu przy wydzielinie < … ml/dobę i ustąpieniu jamy w badaniu obrazowym.

Wnioski:
- Drenografia: …; dren wymieniony po prowadniku na … F, położenie prawidłowe.`,
  textEn: `Procedure: Fluoroscopic drain check (sinogram) and exchange

Findings:
Indication: … (reduced output / displacement / assessment before removal …).
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: via the existing … drain tract.
Devices: … guidewire, … F pigtail drainage catheter.
Procedure details:
Contrast was injected through the existing … F drain. A residual cavity measuring approximately … mm was shown, …, with no fistula to the bowel / bile ducts / urinary tract …. The retention loop was released and the drain was removed over a guidewire. A new … F drainage catheter was advanced over the wire and its loop formed within the cavity. Final contrast injection confirmed satisfactory position and free drainage. The drain was secured to the skin.
Result: drain exchanged for … F, satisfactory position; residual cavity ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: flush the drain with … ml saline every … h, record output, repeat check in … days or remove the drain when output is < … ml/day and the cavity has resolved on imaging.

Conclusion:
- Sinogram: …; drain exchanged over a guidewire for … F, satisfactory position.` },

{ id: 'nv2_tunnelled_peritoneal', title: 'Tunelizowany cewnik otrzewnowy', titleEn: 'Tunnelled peritoneal catheter', group: 'NonVascular', section: 'Drainage', priority: 20,
  proc: ['paracentesis', 'drainage'], anat: ['abdomen'],
  text: `Badanie: Założenie tunelizowanego cewnika otrzewnowego pod kontrolą USG i fluoroskopii

Opis:
Wskazanie: nawracające wodobrzusze … wymagające wielokrotnych paracentez.
Lokalizacja: jama otrzewnej, …
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: nakłucie jamy otrzewnej w … dole biodrowym, z tunelem podskórnym w kierunku ….
Sprzęt: igła … G, prowadnik …, rozszerzadła, koszulka rozrywalna … F, tunelizowany cewnik otrzewnowy … F z mankietem.
Przebieg zabiegu:
W badaniu USG uwidoczniono wodobrzusze …. Pod kontrolą USG, z ominięciem pętli jelitowych i naczyń nabrzusznych dolnych, nakłuto jamę otrzewnej i wprowadzono prowadnik. Wykonano tunel podskórny długości ok. … cm, przez który przeprowadzono cewnik tak, aby mankiet znalazł się w tunelu ok. … cm od miejsca wyjścia. Po rozszerzeniu kanału przez koszulkę rozrywalną wprowadzono cewnik do jamy otrzewnej; położenie końcówki w miednicy potwierdzono fluoroskopowo. Ewakuowano … ml płynu. Ranę zamknięto szwem …, cewnik zabezpieczono opatrunkiem.
Wynik: prawidłowo założony tunelizowany cewnik otrzewnowy; ewakuowano … ml płynu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: drenaż wodobrzusza według potrzeb (… ml / …), aseptyczna obsługa cewnika, zdjęcie szwów za … dni, obserwacja w kierunku infekcji i wycieku.

Wnioski:
- Skutecznie założony tunelizowany cewnik otrzewnowy … F.`,
  textEn: `Procedure: Tunnelled peritoneal catheter insertion under ultrasound and fluoroscopic guidance

Findings:
Indication: recurrent … ascites requiring repeated paracentesis.
Target: peritoneal cavity, …
Anaesthesia: local, … ml of …% lidocaine, …
Access: peritoneal puncture in the … iliac fossa with a subcutaneous tunnel towards ….
Devices: … G needle, … guidewire, dilators, … F peel-away sheath, … F cuffed tunnelled peritoneal catheter.
Procedure details:
Ultrasound showed … ascites. Under ultrasound guidance, avoiding bowel and the inferior epigastric vessels, the peritoneal cavity was punctured and a guidewire inserted. A subcutaneous tunnel of approximately … cm was created and the catheter was pulled through so that the cuff lay within the tunnel about … cm from the exit site. After tract dilatation the catheter was inserted into the peritoneal cavity through a peel-away sheath; tip position in the pelvis was confirmed fluoroscopically. … ml of fluid was drained. The incision was closed with … sutures and a dressing applied.
Result: tunnelled peritoneal catheter correctly placed; … ml drained.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: drain ascites as required (… ml / …), aseptic catheter care, suture removal in … days, observe for infection and leak.

Conclusion:
- Successful insertion of a … F tunnelled peritoneal catheter.` },

{ id: 'nv2_tunnelled_pleural', title: 'Tunelizowany cewnik opłucnowy', titleEn: 'Tunnelled pleural catheter', group: 'NonVascular', section: 'Drainage', priority: 21,
  proc: ['pleural'], anat: ['chest'],
  text: `Badanie: Założenie tunelizowanego cewnika opłucnowego pod kontrolą USG

Opis:
Wskazanie: nawracający płyn opłucnowy … (np. nowotworowy) / niedoprężalne płuco.
Lokalizacja: jama opłucnej …
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: … przestrzeń międzyżebrowa w linii pachowej …, nad górnym brzegiem żebra, z tunelem podskórnym.
Sprzęt: igła … G, prowadnik …, rozszerzadła, koszulka rozrywalna … F, tunelizowany cewnik opłucnowy … F z mankietem.
Przebieg zabiegu:
W badaniu USG uwidoczniono płyn w jamie opłucnej … o grubości warstwy … mm. Pod kontrolą USG nakłuto jamę opłucnej nad górnym brzegiem żebra i wprowadzono prowadnik. Wykonano tunel podskórny długości ok. … cm i przeprowadzono cewnik tak, aby mankiet znalazł się w tunelu. Po rozszerzeniu kanału przez koszulkę rozrywalną wprowadzono cewnik do jamy opłucnej w kierunku …. Ewakuowano … ml płynu …. Ranę zamknięto szwem …, cewnik zabezpieczono opatrunkiem.
Wynik: prawidłowo założony tunelizowany cewnik opłucnowy …; ewakuowano … ml płynu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG klatki piersiowej, drenaż według schematu (… ml co …), aseptyczna obsługa cewnika, zdjęcie szwów za … dni.

Wnioski:
- Skutecznie założony tunelizowany cewnik opłucnowy … F po stronie ….`,
  textEn: `Procedure: Ultrasound-guided tunnelled pleural catheter insertion

Findings:
Indication: recurrent … (e.g. malignant) pleural effusion / non-expandable lung.
Target: … pleural space
Anaesthesia: local, … ml of …% lidocaine, …
Access: … intercostal space, … axillary line, above the upper border of the rib, with a subcutaneous tunnel.
Devices: … G needle, … guidewire, dilators, … F peel-away sheath, … F cuffed tunnelled pleural catheter.
Procedure details:
Ultrasound showed a … pleural effusion, depth … mm. Under ultrasound guidance the pleural space was punctured above the upper border of the rib and a guidewire inserted. A subcutaneous tunnel of approximately … cm was created and the catheter was pulled through so that the cuff lay within the tunnel. After tract dilatation the catheter was inserted into the pleural space through a peel-away sheath, directed …. … ml of … fluid was drained. The incision was closed with … sutures and a dressing applied.
Result: tunnelled pleural catheter correctly placed on the … side; … ml drained.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: chest radiograph, drainage schedule (… ml every …), aseptic catheter care, suture removal in … days.

Conclusion:
- Successful insertion of a … F tunnelled pleural catheter on the … side.` },

{ id: 'nv2_lymphocele', title: 'Drenaż limfocele ± skleroterapia', titleEn: 'Lymphocele drainage ± sclerotherapy', group: 'NonVascular', section: 'Drainage', priority: 22,
  proc: ['drainage', 'sclerotherapy'], anat: ['pelvis', 'abdomen'],
  text: `Badanie: Przezskórny drenaż limfocele ze skleroterapią pod kontrolą USG i fluoroskopii

Opis:
Wskazanie: objawowe limfocele … (po …).
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny, …, pod kontrolą USG.
Sprzęt: igła … G, prowadnik …, rozszerzadła, cewnik drenażowy typu pigtail … F; środek obliterujący: … (… ml).
Przebieg zabiegu:
W badaniu USG uwidoczniono zbiornik płynowy … o wymiarach … × … mm. Pod kontrolą USG nakłuto zbiornik i uzyskano … płyn (chłonka), pobrany do badań (kreatynina, liczba komórek, posiew …). Założono cewnik drenażowy z pętlą w zbiorniku i ewakuowano … ml płynu. Kontrastowa cystografia wykazała jamę bez cech komunikacji z drogami moczowymi i bez wynaczynienia. Po opróżnieniu jamy podano przez dren … ml … (środek obliterujący), dren zamknięto na … min, zmieniając ułożenie pacjenta, a następnie środek odessano. Dren ufiksowano do skóry.
Wynik: zbiornik opróżniony (… ml), wykonano … sesję skleroterapii.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: bilans wydzieliny z drenu, kolejne sesje skleroterapii przy wydzielinie > … ml/dobę, usunięcie drenu przy wydzielinie < … ml/dobę i braku nawrotu w USG.

Wnioski:
- Skuteczny przezskórny drenaż limfocele … ze skleroterapią …; założono dren … F.`,
  textEn: `Procedure: Percutaneous lymphocele drainage and sclerotherapy under ultrasound and fluoroscopic guidance

Findings:
Indication: symptomatic … lymphocele (after …).
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous, …, under ultrasound guidance.
Devices: … G needle, … guidewire, dilators, … F pigtail drainage catheter; sclerosant: … (… ml).
Procedure details:
Ultrasound showed a … × … mm fluid collection …. Under ultrasound guidance the collection was punctured and … fluid (lymph) was aspirated and sent for analysis (creatinine, cell count, culture …). A drainage catheter was placed with its loop in the collection and … ml was drained. Contrast sinogram showed a cavity with no communication with the urinary tract and no extravasation. After emptying the cavity, … ml of … (sclerosant) was instilled through the drain, the drain was clamped for … min with patient repositioning, and the sclerosant was then aspirated. The drain was secured to the skin.
Result: collection emptied (… ml), … sclerotherapy session performed.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: record drain output, repeat sclerotherapy if output > … ml/day, remove the drain when output < … ml/day with no recurrence on ultrasound.

Conclusion:
- Successful percutaneous drainage of … lymphocele with … sclerotherapy; … F drain placed.` },

// ===== Ablation =====
{ id: 'nv2_liver_mwa', title: 'Mikrofalowa ablacja guza wątroby (MWA)', titleEn: 'Liver tumour microwave ablation (MWA)', group: 'NonVascular', section: 'Ablation', priority: 10,
  proc: ['ablation'], anat: ['abdomen'],
  text: `Badanie: Przezskórna termoablacja mikrofalowa (MWA) zmiany w wątrobie pod kontrolą USG/TK

Opis:
Wskazanie: … (rak wątrobowokomórkowy / przerzut …), kwalifikacja przez zespół wielodyscyplinarny.
Lokalizacja: segment … wątroby
Znieczulenie: znieczulenie ogólne / głęboka sedacja …, miejscowo … ml lidokainy …%.
Dostęp: przezskórny, …
Sprzęt: antena mikrofalowa … G, … cm; generator mikrofalowy.
Przebieg zabiegu:
W badaniu przedzabiegowym uwidoczniono zmianę w segmencie … wątroby o wymiarach … × … mm, w odległości … mm od …. Pod kontrolą USG/TK wprowadzono antenę mikrofalową do zmiany …. Położenie końcówki anteny potwierdzono w … płaszczyznach. Wykonano ablację: moc … W, czas … min, … (liczba pozycji anteny). Strefa ablacji obejmowała zmianę z marginesem …. Na zakończenie wykonano koagulację kanału wkłucia przy wycofywaniu anteny. Kontrolne TK z kontrastem po zabiegu: strefa ablacji o wymiarach … × … mm, obejmująca zmianę z marginesem ≥ … mm, bez cech krwawienia, odmy ani uszkodzenia sąsiednich struktur.
Wynik: technicznie skuteczna ablacja zmiany; margines ablacji ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja (ból, gorączka – zespół poablacyjny), kontrola morfologii i prób wątrobowych, kontrolne TK/MR z kontrastem za … tygodnie (ocena skuteczności ablacji).

Wnioski:
- Technicznie skuteczna mikrofalowa ablacja zmiany w segmencie … wątroby (… mm); margines ablacji ….`,
  textEn: `Procedure: Percutaneous microwave ablation (MWA) of a liver lesion under US/CT guidance

Findings:
Indication: … (hepatocellular carcinoma / … metastasis), approved by the multidisciplinary team.
Target: liver segment …
Anaesthesia: general anaesthesia / deep sedation …, local … ml of …% lidocaine.
Access: percutaneous, …
Devices: … G, … cm microwave antenna; microwave generator.
Procedure details:
Pre-procedure imaging showed a … × … mm lesion in liver segment …, … mm from …. Under US/CT guidance the microwave antenna was advanced into the lesion …. Antenna tip position was confirmed in … planes. Ablation was performed at … W for … min, … (number of antenna positions). The ablation zone covered the lesion with a … margin. Tract ablation was performed on antenna withdrawal. Post-ablation contrast-enhanced CT showed a … × … mm ablation zone encompassing the lesion with a margin of ≥ … mm, with no haemorrhage, pneumothorax or injury to adjacent structures.
Result: technically successful ablation; ablation margin ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observation (pain, fever – post-ablation syndrome), blood count and liver function tests, contrast-enhanced CT/MRI in … weeks to assess technique efficacy.

Conclusion:
- Technically successful microwave ablation of a … mm lesion in liver segment …; ablation margin ….` },

{ id: 'nv2_liver_rfa', title: 'Ablacja prądem o częstotliwości radiowej guza wątroby (RFA)', titleEn: 'Liver tumour radiofrequency ablation (RFA)', group: 'NonVascular', section: 'Ablation', priority: 11,
  proc: ['ablation'], anat: ['abdomen'],
  text: `Badanie: Przezskórna ablacja prądem o częstotliwości radiowej (RFA) zmiany w wątrobie pod kontrolą USG/TK

Opis:
Wskazanie: … (rak wątrobowokomórkowy / przerzut …), kwalifikacja przez zespół wielodyscyplinarny.
Lokalizacja: segment … wątroby
Znieczulenie: znieczulenie ogólne / głęboka sedacja …, miejscowo … ml lidokainy …%.
Dostęp: przezskórny, …
Sprzęt: elektroda RF … G (… / rozprężalna, …), generator RF, elektrody neutralne (płytki uziemiające) na udach.
Przebieg zabiegu:
W badaniu przedzabiegowym uwidoczniono zmianę w segmencie … wątroby o wymiarach … × … mm. Umieszczono płytki uziemiające na udach. Pod kontrolą USG/TK wprowadzono elektrodę RF do zmiany i potwierdzono jej położenie w … płaszczyznach. Wykonano ablację według protokołu producenta: … (liczba cykli / pozycji), czas … min, osiągnięta impedancja / temperatura …. Przy wycofywaniu elektrody wykonano ablację kanału wkłucia. Kontrolne TK z kontrastem: strefa ablacji … × … mm obejmująca zmianę z marginesem ≥ … mm, bez cech krwawienia ani uszkodzenia sąsiednich struktur.
Wynik: technicznie skuteczna ablacja zmiany; margines ablacji ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja (ból, gorączka), kontrola skóry w miejscu płytek uziemiających, kontrola morfologii i prób wątrobowych, kontrolne TK/MR z kontrastem za … tygodnie.

Wnioski:
- Technicznie skuteczna ablacja RF zmiany w segmencie … wątroby (… mm); margines ablacji ….`,
  textEn: `Procedure: Percutaneous radiofrequency ablation (RFA) of a liver lesion under US/CT guidance

Findings:
Indication: … (hepatocellular carcinoma / … metastasis), approved by the multidisciplinary team.
Target: liver segment …
Anaesthesia: general anaesthesia / deep sedation …, local … ml of …% lidocaine.
Access: percutaneous, …
Devices: … G RF electrode (… / expandable, …), RF generator, grounding pads on the thighs.
Procedure details:
Pre-procedure imaging showed a … × … mm lesion in liver segment …. Grounding pads were applied to the thighs. Under US/CT guidance the RF electrode was advanced into the lesion and its position confirmed in … planes. Ablation was performed according to the manufacturer's protocol: … (cycles / positions), … min, target impedance / temperature …. Tract ablation was performed on electrode withdrawal. Post-ablation contrast-enhanced CT showed a … × … mm ablation zone encompassing the lesion with a margin of ≥ … mm, with no haemorrhage or injury to adjacent structures.
Result: technically successful ablation; ablation margin ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observation (pain, fever), inspect skin at grounding pad sites, blood count and liver function tests, contrast-enhanced CT/MRI in … weeks.

Conclusion:
- Technically successful RF ablation of a … mm lesion in liver segment …; ablation margin ….` },

{ id: 'nv2_renal_cryo', title: 'Krioablacja guza nerki', titleEn: 'Renal tumour cryoablation', group: 'NonVascular', section: 'Ablation', priority: 12,
  proc: ['ablation'], anat: ['abdomen'],
  text: `Badanie: Przezskórna krioablacja guza nerki pod kontrolą TK

Opis:
Wskazanie: guz lity nerki … (T1a …), po biopsji / …; kwalifikacja przez zespół wielodyscyplinarny.
Lokalizacja: nerka …, biegun … / część …
Znieczulenie: znieczulenie ogólne / głęboka sedacja …, miejscowo … ml lidokainy …%.
Dostęp: przezskórny, tylno-boczny, w ułożeniu na brzuchu / na boku.
Sprzęt: … krioaplikator(ów) … G, system krioablacji (argon/hel …).
Przebieg zabiegu:
W TK planującym uwidoczniono guz nerki … o wymiarach … × … mm, … (egzofityczny / śródmiąższowy), w odległości … mm od układu kielichowo-miedniczkowego / moczowodu / jelita. … (W celu ochrony sąsiednich struktur wykonano hydrodysekcję … ml soli fizjologicznej / 5% glukozy.) Pod kontrolą TK wprowadzono … krioaplikator(y) w obręb guza, w odstępach ok. … mm. Wykonano … cykle zamrażania (… min) przedzielone rozmrażaniem (… min). W kontrolnych skanach kula lodowa obejmowała guz z marginesem ≥ … mm. Po aktywnym rozmrożeniu krioaplikatory usunięto. Kontrolne TK z kontrastem: strefa ablacji obejmuje guz, bez cech istotnego krwiaka okołonerkowego, krwawienia do układu kielichowo-miedniczkowego ani uszkodzenia sąsiednich narządów.
Wynik: technicznie skuteczna krioablacja guza nerki ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrola morfologii i kreatyniny, obserwacja w kierunku krwiomoczu i bólu, kontrolne TK/MR z kontrastem za … miesiące.

Wnioski:
- Technicznie skuteczna krioablacja guza nerki … (… mm) z użyciem … krioaplikatorów; kula lodowa z marginesem ….`,
  textEn: `Procedure: CT-guided percutaneous renal tumour cryoablation

Findings:
Indication: … solid renal mass (T1a …), biopsy …; approved by the multidisciplinary team.
Target: … kidney, … pole / …
Anaesthesia: general anaesthesia / deep sedation …, local … ml of …% lidocaine.
Access: percutaneous, posterolateral, patient prone / decubitus.
Devices: … G cryoprobe(s) …, cryoablation system (argon/helium …).
Procedure details:
Planning CT showed a … × … mm … (exophytic / central) mass in the … kidney, … mm from the collecting system / ureter / bowel. … (Hydrodissection with … ml of saline / 5% dextrose was performed to displace adjacent structures.) Under CT guidance … cryoprobe(s) were placed within the tumour, approximately … mm apart. … freeze cycles (… min) separated by thaw (… min) were performed. Intraprocedural CT showed the ice ball encompassing the tumour with a margin of ≥ … mm. After active thaw the probes were removed. Post-ablation contrast-enhanced CT showed the ablation zone covering the tumour with no significant perinephric haematoma, collecting-system bleeding or injury to adjacent organs.
Result: technically successful cryoablation of the … renal tumour.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: blood count and creatinine, observe for haematuria and pain, contrast-enhanced CT/MRI in … months.

Conclusion:
- Technically successful cryoablation of a … mm … renal tumour using … cryoprobes; ice ball margin ….` },

{ id: 'nv2_lung_ablation', title: 'Ablacja guza płuca', titleEn: 'Lung tumour ablation', group: 'NonVascular', section: 'Ablation', priority: 13,
  proc: ['ablation'], anat: ['chest'],
  text: `Badanie: Przezskórna ablacja … (MWA / RFA / krio) zmiany w płucu pod kontrolą TK

Opis:
Wskazanie: … (NSCLC we wczesnym stadium / przerzut …), kwalifikacja przez zespół wielodyscyplinarny.
Lokalizacja: płuco …, płat …, segment …
Znieczulenie: znieczulenie ogólne / głęboka sedacja …, miejscowo … ml lidokainy …%.
Dostęp: przezskórny, … przestrzeń międzyżebrowa, w ułożeniu …; tor wkłucia z ominięciem szczelin międzypłatowych, pęcherzy rozedmowych i naczyń.
Sprzęt: antena mikrofalowa / elektroda RF / krioaplikator … G, ….
Przebieg zabiegu:
W TK planującym uwidoczniono zmianę w segmencie … płuca … o wymiarach … × … mm, w odległości … mm od opłucnej / dużych naczyń / oskrzeli. Pod kontrolą TK wprowadzono … do zmiany i potwierdzono położenie w osi długiej zmiany. Wykonano ablację: … (moc … W / czas … min / cykle …). W kontrolnych skanach uwidoczniono strefę zmętnienia typu matowej szyby wokół zmiany, z marginesem ≥ … mm. Przy wycofywaniu aplikatora wykonano ablację kanału wkłucia. Kontrolne TK: … (bez odmy / niewielka odma opłucnowa niewymagająca drenażu), bez krwawienia do miąższu.
Wynik: technicznie skuteczna ablacja zmiany w płucu.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG klatki piersiowej po … h (odma opóźniona), obserwacja w kierunku duszności i krwioplucia, kontrolne TK za … miesiące.

Wnioski:
- Technicznie skuteczna ablacja … zmiany w segmencie … płuca … (… mm); strefa GGO z marginesem ….`,
  textEn: `Procedure: CT-guided percutaneous … (MWA / RFA / cryo) ablation of a lung lesion

Findings:
Indication: … (early-stage NSCLC / … metastasis), approved by the multidisciplinary team.
Target: … lung, … lobe, segment …
Anaesthesia: general anaesthesia / deep sedation …, local … ml of …% lidocaine.
Access: percutaneous, … intercostal space, patient …; trajectory avoiding fissures, bullae and vessels.
Devices: … G microwave antenna / RF electrode / cryoprobe, ….
Procedure details:
Planning CT showed a … × … mm lesion in segment … of the … lung, … mm from the pleura / large vessels / airways. Under CT guidance the … was advanced into the lesion along its long axis. Ablation was performed (… W / … min / … cycles). Intraprocedural CT showed ground-glass opacity surrounding the lesion with a margin of ≥ … mm. Tract ablation was performed on withdrawal. Final CT: … (no pneumothorax / small pneumothorax not requiring drainage), no parenchymal haemorrhage.
Result: technically successful ablation of the lung lesion.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: chest radiograph at … h (delayed pneumothorax), observe for dyspnoea and haemoptysis, follow-up CT in … months.

Conclusion:
- Technically successful … ablation of a … mm lesion in segment … of the … lung; GGO margin ….` },

{ id: 'nv2_osteoid_osteoma_rfa', title: 'Ablacja RF kostniaka kostnawego', titleEn: 'Osteoid osteoma RF ablation', group: 'NonVascular', section: 'Ablation', priority: 14,
  proc: ['ablation', 'biopsy'], anat: ['spine', 'lower_limb', 'upper_limb', 'pelvis'],
  text: `Badanie: Przezskórna ablacja prądem o częstotliwości radiowej kostniaka kostnawego pod kontrolą TK

Opis:
Wskazanie: kostniak kostnawy … (typowy obraz kliniczny i radiologiczny).
Lokalizacja: …
Znieczulenie: znieczulenie ogólne …
Dostęp: przezskórny, …, z ominięciem pęczków naczyniowo-nerwowych.
Sprzęt: igła / wiertło do dostępu kostnego … G, igła biopsyjna … G, elektroda RF … G (… mm odsłoniętej części), generator RF.
Przebieg zabiegu:
W TK uwidoczniono typowe ognisko (nidus) kostniaka kostnawego w … o wymiarach … mm, z otaczającą sklerotyzacją …. Pod kontrolą TK wprowadzono igłę / wiertło do nidusa przez warstwę korową. … Pobrano materiał do badania histopatologicznego. Przez kaniulę wprowadzono elektrodę RF, której koniec umieszczono w centrum nidusa, co potwierdzono w kontrolnych skanach. Wykonano ablację w temperaturze … °C przez … min. Kaniulę i elektrodę usunięto, miejsce wkłucia zaopatrzono opatrunkiem.
Wynik: technicznie skuteczna ablacja RF nidusa kostniaka kostnawego.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leki przeciwbólowe doraźnie, ograniczenie obciążania kończyny przez …, ocena kliniczna dolegliwości za … tygodnie, kontrola wyniku histopatologicznego.

Wnioski:
- Technicznie skuteczna ablacja RF kostniaka kostnawego …; pobrano materiał do badania histopatologicznego.`,
  textEn: `Procedure: CT-guided percutaneous radiofrequency ablation of osteoid osteoma

Findings:
Indication: osteoid osteoma … (typical clinical and imaging features).
Target: …
Anaesthesia: general anaesthesia …
Access: percutaneous, …, avoiding neurovascular bundles.
Devices: … G bone access needle / drill, … G biopsy needle, … G RF electrode (… mm active tip), RF generator.
Procedure details:
CT showed a typical … mm osteoid osteoma nidus in … with surrounding sclerosis …. Under CT guidance a bone access needle / drill was advanced through the cortex into the nidus. … A sample was obtained for histology. The RF electrode was advanced through the cannula with its tip in the centre of the nidus, confirmed on CT. Ablation was performed at … °C for … min. The cannula and electrode were removed and a dressing applied.
Result: technically successful RF ablation of the osteoid osteoma nidus.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: analgesia as required, limited weight-bearing for …, clinical review of pain in … weeks, follow up histology.

Conclusion:
- Technically successful RF ablation of … osteoid osteoma; specimen sent for histology.` },

{ id: 'nv2_thyroid_rfa', title: 'Ablacja RF guzka tarczycy', titleEn: 'Thyroid nodule RF ablation', group: 'NonVascular', section: 'Ablation', priority: 15,
  proc: ['ablation'], anat: ['neck'],
  text: `Badanie: Ablacja prądem o częstotliwości radiowej guzka tarczycy pod kontrolą USG

Opis:
Wskazanie: łagodny guzek tarczycy … (potwierdzony cytologicznie, Bethesda II …), objawowy / defekt kosmetyczny / autonomiczny.
Lokalizacja: płat … tarczycy
Znieczulenie: miejscowe, … ml lidokainy …% (okolica wkłucia i torebka tarczycy).
Dostęp: dostęp przez cieśń (trans-isthmic), technika ruchomej elektrody (moving-shot).
Sprzęt: elektroda RF chłodzona wewnętrznie … G, … mm odsłoniętej części; generator RF.
Przebieg zabiegu:
W badaniu USG uwidoczniono guzek w płacie … tarczycy o wymiarach … × … × … mm (objętość … ml), …. Oceniono przebieg nerwu krtaniowego wstecznego (strefa niebezpieczna), tętnicy szyjnej i tchawicy. Pod kontrolą USG z dostępu przez cieśń wprowadzono elektrodę do guzka … i wykonano ablację techniką ruchomej elektrody, rozpoczynając od głębokich i odległych części guzka, mocą … W, łącznie … min. Obszar ablacji uwidoczniono jako strefę hiperechogeniczną obejmującą … guzka. Okolice brzeżne w pobliżu strefy niebezpiecznej leczono z ostrożnością. Kontrolne USG: bez cech krwiaka. Pacjent bez zaburzeń fonacji po zabiegu.
Wynik: technicznie skuteczna ablacja RF guzka tarczycy.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: ucisk okolicy szyi i obserwacja przez … min, kontrola głosu, kontrolne USG z oceną objętości za … miesiące (współczynnik redukcji objętości), kontrola TSH ….

Wnioski:
- Technicznie skuteczna ablacja RF guzka płata … tarczycy (objętość … ml).`,
  textEn: `Procedure: Ultrasound-guided radiofrequency ablation of a thyroid nodule

Findings:
Indication: benign thyroid nodule … (cytologically confirmed, Bethesda II …), symptomatic / cosmetic / autonomous.
Target: … thyroid lobe
Anaesthesia: local, … ml of …% lidocaine (skin and thyroid capsule).
Access: trans-isthmic approach, moving-shot technique.
Devices: … G internally cooled RF electrode, … mm active tip; RF generator.
Procedure details:
Ultrasound showed a … × … × … mm (… ml) nodule in the … thyroid lobe, …. The course of the recurrent laryngeal nerve (danger triangle), carotid artery and trachea were identified. Under ultrasound guidance the electrode was introduced via a trans-isthmic approach into the nodule and ablation was performed using the moving-shot technique, starting in the deep and far portions of the nodule, at … W for a total of … min. The ablated area appeared as a hyperechoic zone covering … of the nodule. Peripheral areas near the danger triangle were treated with caution. Post-procedure ultrasound showed no haematoma. No voice change after the procedure.
Result: technically successful RF ablation of the thyroid nodule.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: neck compression and observation for … min, voice check, follow-up ultrasound with volume measurement in … months (volume reduction ratio), TSH ….

Conclusion:
- Technically successful RF ablation of a … ml nodule in the … thyroid lobe.` },

// ===== GI =====
{ id: 'nv2_rig_gastropexy', title: 'Gastrostomia radiologiczna z gastropeksją (RIG)', titleEn: 'Radiological gastrostomy with gastropexy (RIG)', group: 'NonVascular', section: 'GI', priority: 10,
  proc: ['gastrostomy'], anat: ['abdomen'],
  text: `Badanie: Przezskórna gastrostomia radiologiczna (RIG) z gastropeksją pod kontrolą fluoroskopii

Opis:
Wskazanie: … (dysfagia neurogenna / nowotwór głowy i szyi / …), konieczność długotrwałego żywienia dojelitowego.
Lokalizacja: trzon żołądka, …
Znieczulenie: miejscowe, … ml lidokainy …%, …; … (lek spazmolityczny … i.v.).
Dostęp: przezskórny, nadbrzusze …, pod kontrolą fluoroskopii; wcześniej oceniono USG położenie lewego płata wątroby.
Sprzęt: zgłębnik nosowo-żołądkowy, … kotwic(e) do gastropeksji (T-fasteners), igła … G, prowadnik …, rozszerzadła, cewnik gastrostomijny z balonem / pętlą … F.
Przebieg zabiegu:
Przez zgłębnik nosowo-żołądkowy rozdęto żołądek powietrzem. Pod kontrolą fluoroskopii (i USG) potwierdzono brak interpozycji okrężnicy poprzecznej i wątroby. Wykonano gastropeksję … kotwicami umieszczonymi w układzie trójkąta/kwadratu; każde wkłucie potwierdzono aspiracją powietrza i podaniem środka kontrastowego (uwidoczniono fałdy śluzówki żołądka). W środku pola gastropeksji nakłuto żołądek, wprowadzono prowadnik, rozszerzono kanał i założono cewnik gastrostomijny …. Balon wypełniono … ml wody / pętlę zablokowano. Kontrolne podanie środka kontrastowego przez cewnik potwierdziło położenie w żołądku, bez wycieku do jamy otrzewnej. Zgłębnik nosowo-żołądkowy usunięto.
Wynik: prawidłowo założona gastrostomia … F z gastropeksją.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: pozostawić cewnik otwarty do worka na … h, następnie próba podawania wody i włączenie żywienia według protokołu, kontrola objętości balonu co …, usunięcie / odcięcie kotwic po … dniach, obserwacja w kierunku bólu brzucha i objawów otrzewnowych.

Wnioski:
- Skutecznie założona gastrostomia radiologiczna … F z gastropeksją (… kotwice).`,
  textEn: `Procedure: Fluoroscopically guided percutaneous radiological gastrostomy (RIG) with gastropexy

Findings:
Indication: … (neurogenic dysphagia / head and neck cancer / …), need for long-term enteral nutrition.
Target: gastric body, …
Anaesthesia: local, … ml of …% lidocaine, …; … (spasmolytic … IV).
Access: percutaneous, … epigastrium, under fluoroscopic guidance; left hepatic lobe position assessed with ultrasound beforehand.
Devices: nasogastric tube, … gastropexy T-fasteners, … G needle, … guidewire, dilators, … F balloon / loop-retained gastrostomy catheter.
Procedure details:
The stomach was insufflated with air via the nasogastric tube. Fluoroscopy (and ultrasound) confirmed no interposition of the transverse colon or liver. Gastropexy was performed with … T-fasteners in a triangular/square configuration; each puncture was confirmed by air aspiration and contrast injection outlining gastric rugae. The stomach was punctured in the centre of the gastropexy, a guidewire was advanced, the tract was dilated and a … gastrostomy catheter was inserted. The balloon was filled with … ml of water / the loop was locked. Contrast injection through the catheter confirmed an intragastric position with no intraperitoneal leak. The nasogastric tube was removed.
Result: … F gastrostomy with gastropexy correctly placed.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: leave on free drainage for … h, then water trial and start feeding per protocol, check balloon volume every …, remove / cut T-fasteners after … days, observe for abdominal pain and peritonism.

Conclusion:
- Successful radiological gastrostomy … F with gastropexy (… T-fasteners).` },

{ id: 'nv2_gastrojejunostomy', title: 'Gastrojejunostomia przezskórna (RIGJ)', titleEn: 'Percutaneous gastrojejunostomy', group: 'NonVascular', section: 'GI', priority: 11,
  proc: ['gastrostomy'], anat: ['abdomen'],
  text: `Badanie: Przezskórna gastrojejunostomia pod kontrolą fluoroskopii

Opis:
Wskazanie: … (zaleganie treści żołądkowej / refluks z ryzykiem aspiracji / niedrożność odźwiernika …), konieczność żywienia dojelitowego.
Lokalizacja: żołądek z końcówką cewnika w jelicie czczym
Znieczulenie: miejscowe, … ml lidokainy …%, …
Dostęp: … (nowa gastropeksja i nakłucie żołądka / przez istniejący kanał gastrostomii …).
Sprzęt: … kotwic(e) do gastropeksji, igła … G, cewnik kierujący …, prowadnik hydrofilny …, prowadnik sztywny …, cewnik gastrojejunalny … F.
Przebieg zabiegu:
… (Wykonano gastropeksję i nakłucie żołądka jak przy gastrostomii / Przez istniejący kanał gastrostomii wprowadzono prowadnik.) Za pomocą cewnika kierującego i prowadnika hydrofilnego przeprowadzono dostęp przez odźwiernik i dwunastnicę poza więzadło Treitza do jelita czczego. Prowadnik wymieniono na sztywny i po nim wprowadzono cewnik gastrojejunalny, którego końcówkę umieszczono w jelicie czczym, a balon retencyjny w żołądku (… ml wody). Kontrolne podanie środka kontrastowego przez port jelitowy uwidoczniło pętle jelita czczego, a przez port żołądkowy – światło żołądka, bez wycieku.
Wynik: prawidłowo założony cewnik gastrojejunalny … F z końcówką w jelicie czczym.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: żywienie przez port jelitowy (wyłącznie żywienie ciągłe / pompą), port żołądkowy do odbarczenia, płukanie portu jelitowego co …, kontrola położenia w razie zaburzeń drożności.

Wnioski:
- Skutecznie założony przezskórny cewnik gastrojejunalny … F z końcówką w jelicie czczym.`,
  textEn: `Procedure: Fluoroscopically guided percutaneous gastrojejunostomy

Findings:
Indication: … (gastroparesis / reflux with aspiration risk / gastric outlet obstruction …), need for enteral nutrition.
Target: stomach with catheter tip in the jejunum
Anaesthesia: local, … ml of …% lidocaine, …
Access: … (new gastropexy and gastric puncture / via existing gastrostomy tract …).
Devices: … gastropexy T-fasteners, … G needle, … directional catheter, … hydrophilic guidewire, … stiff guidewire, … F gastrojejunal catheter.
Procedure details:
… (Gastropexy and gastric puncture were performed as for gastrostomy / A guidewire was introduced through the existing gastrostomy tract.) Using a directional catheter and hydrophilic guidewire the pylorus and duodenum were negotiated beyond the ligament of Treitz into the jejunum. The wire was exchanged for a stiff wire over which a gastrojejunal catheter was advanced, with its tip in the jejunum and the retention balloon in the stomach (… ml water). Contrast injection via the jejunal port opacified jejunal loops and via the gastric port the gastric lumen, with no leak.
Result: … F gastrojejunal catheter correctly placed with its tip in the jejunum.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: feed via the jejunal port (continuous / pump feeding only), gastric port for venting, flush the jejunal port every …, check position if the tube malfunctions.

Conclusion:
- Successful percutaneous gastrojejunostomy … F with the tip in the jejunum.` },

{ id: 'nv2_gastrostomy_exchange', title: 'Wymiana cewnika gastrostomijnego', titleEn: 'Gastrostomy tube exchange', group: 'NonVascular', section: 'GI', priority: 12,
  proc: ['gastrostomy'], anat: ['abdomen'],
  text: `Badanie: Wymiana cewnika gastrostomijnego pod kontrolą fluoroskopii

Opis:
Wskazanie: … (niedrożność / uszkodzenie / pęknięcie balonu / planowa wymiana / przemieszczenie …).
Lokalizacja: żołądek
Znieczulenie: miejscowe żelem znieczulającym / bez znieczulenia ….
Dostęp: przez istniejący dojrzały kanał gastrostomii.
Sprzęt: prowadnik …, cewnik gastrostomijny z balonem / pętlą … F.
Przebieg zabiegu:
Przez dotychczasowy cewnik … F wprowadzono prowadnik do żołądka. Po opróżnieniu balonu / odblokowaniu pętli cewnik usunięto po prowadniku. Kanał gastrostomii … (bez cech zapalenia / z ziarniną …). Po prowadniku wprowadzono nowy cewnik … F, balon wypełniono … ml wody / pętlę zablokowano. Kontrolne podanie środka kontrastowego potwierdziło położenie cewnika w żołądku, bez wycieku do jamy otrzewnej.
Wynik: cewnik gastrostomijny wymieniony na … F, położenie prawidłowe.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontynuacja żywienia, kontrola objętości balonu co …, kolejna wymiana za … miesiące lub w razie dysfunkcji.

Wnioski:
- Wymiana cewnika gastrostomijnego po prowadniku na … F; położenie prawidłowe.`,
  textEn: `Procedure: Fluoroscopically guided gastrostomy tube exchange

Findings:
Indication: … (blockage / damage / balloon rupture / routine exchange / displacement …).
Target: stomach
Anaesthesia: topical anaesthetic gel / none ….
Access: via the existing mature gastrostomy tract.
Devices: … guidewire, … F balloon / loop-retained gastrostomy catheter.
Procedure details:
A guidewire was introduced into the stomach through the existing … F tube. After deflating the balloon / releasing the loop the tube was removed over the wire. The tract was … (healthy / with granulation tissue …). A new … F catheter was advanced over the wire and the balloon was filled with … ml of water / the loop was locked. Contrast injection confirmed an intragastric position with no intraperitoneal leak.
Result: gastrostomy tube exchanged for … F, satisfactory position.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: resume feeding, check balloon volume every …, next exchange in … months or if the tube malfunctions.

Conclusion:
- Over-the-wire gastrostomy tube exchange to … F; satisfactory position.` },

{ id: 'nv2_oesophageal_stent', title: 'Stent przełyku', titleEn: 'Oesophageal stent', group: 'NonVascular', section: 'GI', priority: 13,
  proc: ['gi_stent'], anat: ['chest', 'abdomen'],
  text: `Badanie: Implantacja stentu przełykowego pod kontrolą fluoroskopii

Opis:
Wskazanie: … (złośliwe zwężenie przełyku / przetoka przełykowo-tchawicza / perforacja …), dysfagia stopnia ….
Lokalizacja: przełyk …, … cm od siekaczy / na poziomie …
Znieczulenie: sedacja …, miejscowo … (lidokaina w aerozolu na gardło).
Dostęp: przez jamę ustną.
Sprzęt: cewnik …, prowadnik hydrofilny …, prowadnik sztywny …, samorozprężalny stent przełykowy … (częściowo / całkowicie pokryty) … × … mm.
Przebieg zabiegu:
Wykonano wstępne badanie kontrastowe przełyku: zwężenie … przełyku na odcinku … mm, …. Granice zwężenia oznaczono znacznikami zewnętrznymi / pod kontrolą fluoroskopii. Za pomocą cewnika i prowadnika hydrofilnego przekroczono zwężenie i wprowadzono cewnik do żołądka; prowadnik wymieniono na sztywny. Po prowadniku wprowadzono system wprowadzający i uwolniono stent pokrywając zwężenie z marginesem ok. … mm powyżej i poniżej. Kontrolne badanie kontrastowe wykazało … rozprężenie stentu, swobodny pasaż środka kontrastowego do żołądka, bez wycieku ….
Wynik: prawidłowo założony stent przełykowy, pasaż ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG / badanie kontrastowe po … h, płyny po … h, następnie stopniowe rozszerzanie diety (pokarmy miękkie, dokładne przeżuwanie, popijanie), przy stencie przez wpust – ułożenie z uniesionym wezgłowiem i leczenie IPP.

Wnioski:
- Skuteczna implantacja stentu przełykowego … × … mm w zwężeniu …; pasaż swobodny.`,
  textEn: `Procedure: Fluoroscopically guided oesophageal stent insertion

Findings:
Indication: … (malignant oesophageal stricture / tracheo-oesophageal fistula / perforation …), dysphagia grade ….
Target: … oesophagus, … cm from the incisors / at the level of …
Anaesthesia: sedation …, topical … (lidocaine throat spray).
Access: per oral.
Devices: … catheter, … hydrophilic guidewire, … stiff guidewire, … × … mm self-expanding (partially / fully covered) oesophageal stent.
Procedure details:
Initial contrast study showed a … mm stricture of the … oesophagus, …. The stricture margins were marked with external markers / under fluoroscopy. The stricture was crossed with a catheter and hydrophilic guidewire and the catheter was advanced into the stomach; the wire was exchanged for a stiff wire. The delivery system was advanced over the wire and the stent was deployed across the stricture with a margin of approximately … mm above and below. Completion contrast study showed … stent expansion and free passage of contrast into the stomach with no leak ….
Result: oesophageal stent correctly placed, ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: radiograph / contrast study at … h, fluids after … h, then gradual diet progression (soft food, chew well, drink with meals); for stents crossing the gastro-oesophageal junction – head-up positioning and PPI.

Conclusion:
- Successful insertion of a … × … mm oesophageal stent across the … stricture; free passage of contrast.` },

{ id: 'nv2_colonic_stent', title: 'Stent jelita grubego', titleEn: 'Colonic stent', group: 'NonVascular', section: 'GI', priority: 14,
  proc: ['gi_stent'], anat: ['abdomen', 'pelvis'],
  text: `Badanie: Implantacja stentu jelita grubego pod kontrolą fluoroskopii

Opis:
Wskazanie: … (złośliwa niedrożność jelita grubego – leczenie paliatywne / pomost do operacji …).
Lokalizacja: … (esica / zstępnica / zgięcie śledzionowe …), … cm od odbytu
Znieczulenie: sedacja … / bez znieczulenia.
Dostęp: przez odbyt, w ułożeniu na boku ….
Sprzęt: cewnik …, prowadnik hydrofilny …, prowadnik sztywny …, samorozprężalny stent jelitowy niepokryty / … × … mm.
Przebieg zabiegu:
Wykonano wlew kontrastowy przez odbyt: zwężenie … na odcinku ok. … mm, z poszerzeniem jelita powyżej. Za pomocą cewnika i prowadnika hydrofilnego przekroczono zwężenie; podanie środka kontrastowego powyżej potwierdziło położenie w świetle jelita. Prowadnik wymieniono na sztywny i po nim wprowadzono system wprowadzający. Stent uwolniono pokrywając zwężenie z marginesem ok. … mm z obu stron. Kontrolne podanie środka kontrastowego wykazało pasaż przez stent, bez wycieku. Obserwowano odejście gazów / treści jelitowej ….
Wynik: prawidłowo założony stent …, pasaż ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: kontrolne RTG jamy brzusznej po … h (rozprężenie stentu, ustąpienie rozdęcia), obserwacja w kierunku objawów perforacji, dieta ubogoresztkowa, środki zmiękczające stolec.

Wnioski:
- Skuteczna implantacja stentu … × … mm w zwężeniu …; pasaż przez stent zachowany.`,
  textEn: `Procedure: Fluoroscopically guided colonic stent insertion

Findings:
Indication: … (malignant large-bowel obstruction – palliation / bridge to surgery …).
Target: … (sigmoid / descending colon / splenic flexure …), … cm from the anal verge
Anaesthesia: sedation … / none.
Access: per rectum, patient in … decubitus.
Devices: … catheter, … hydrophilic guidewire, … stiff guidewire, … × … mm uncovered / … self-expanding enteral stent.
Procedure details:
A water-soluble contrast enema showed a … mm stricture of … with proximal dilatation. The stricture was crossed with a catheter and hydrophilic guidewire; contrast injection proximally confirmed an intraluminal position. The wire was exchanged for a stiff wire and the delivery system was advanced. The stent was deployed across the stricture with a margin of approximately … mm on either side. Contrast injection showed passage through the stent with no leak. Passage of gas / bowel content was observed ….
Result: … stent correctly placed, ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: abdominal radiograph at … h (stent expansion, resolution of distension), observe for signs of perforation, low-residue diet, stool softeners.

Conclusion:
- Successful insertion of a … × … mm stent across the … stricture; patent passage through the stent.` },

{ id: 'nv2_duodenal_stent', title: 'Stent dwunastnicy / odźwiernika', titleEn: 'Duodenal / gastroduodenal stent', group: 'NonVascular', section: 'GI', priority: 15,
  proc: ['gi_stent'], anat: ['abdomen'],
  text: `Badanie: Implantacja stentu dwunastniczego pod kontrolą fluoroskopii

Opis:
Wskazanie: złośliwa niedrożność odźwiernika / dwunastnicy …
Lokalizacja: … (odźwiernik / część … dwunastnicy)
Znieczulenie: sedacja …
Dostęp: … (przez jamę ustną / przez kanał gastrostomii …).
Sprzęt: zgłębnik do odbarczenia żołądka, cewnik kierujący …, prowadnik hydrofilny …, prowadnik sztywny …, samorozprężalny stent dwunastniczy … × … mm.
Przebieg zabiegu:
Po odbarczeniu żołądka podano środek kontrastowy: zwężenie … na odcinku ok. … mm. Za pomocą cewnika kierującego i prowadnika hydrofilnego przekroczono zwężenie i wprowadzono cewnik do dalszej części dwunastnicy / jelita czczego; prowadnik wymieniono na sztywny. Stent uwolniono pokrywając zwężenie z marginesem ok. … mm z obu stron. … (Ocena relacji do brodawki Vatera / stentu żółciowego ….) Kontrolne podanie środka kontrastowego wykazało pasaż przez stent do jelita czczego, bez wycieku.
Wynik: prawidłowo założony stent dwunastniczy, pasaż ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: płyny po … h, następnie dieta płynna/papkowata ze stopniowym rozszerzaniem, kontrola bilirubiny (ryzyko utrudnienia odpływu żółci), RTG / badanie kontrastowe w razie nawrotu wymiotów.

Wnioski:
- Skuteczna implantacja stentu dwunastniczego … × … mm w zwężeniu …; pasaż przez stent zachowany.`,
  textEn: `Procedure: Fluoroscopically guided duodenal stent insertion

Findings:
Indication: malignant gastric outlet / duodenal obstruction …
Target: … (pylorus / … part of the duodenum)
Anaesthesia: sedation …
Access: … (per oral / via gastrostomy tract …).
Devices: decompression nasogastric tube, … directional catheter, … hydrophilic guidewire, … stiff guidewire, … × … mm self-expanding duodenal stent.
Procedure details:
After gastric decompression contrast showed a … mm stricture of …. The stricture was crossed with a directional catheter and hydrophilic guidewire and the catheter was advanced into the distal duodenum / jejunum; the wire was exchanged for a stiff wire. The stent was deployed across the stricture with a margin of approximately … mm on either side. … (Relationship to the ampulla / biliary stent ….) Contrast injection showed passage through the stent into the jejunum with no leak.
Result: duodenal stent correctly placed, ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: fluids after … h, then liquid/soft diet with gradual progression, monitor bilirubin (risk of biliary obstruction), radiograph / contrast study if vomiting recurs.

Conclusion:
- Successful insertion of a … × … mm duodenal stent across the … stricture; patent passage through the stent.` },

// ===== Spine / MSK =====
{ id: 'nv2_vertebroplasty', title: 'Wertebroplastyka przezskórna', titleEn: 'Percutaneous vertebroplasty', group: 'NonVascular', section: 'Spine / MSK', priority: 10,
  proc: ['vertebroplasty'], anat: ['spine'],
  text: `Badanie: Przezskórna wertebroplastyka pod kontrolą fluoroskopii / TK

Opis:
Wskazanie: … (bolesne złamanie kompresyjne osteoporotyczne / zmiana przerzutowa / naczyniak …), obrzęk szpiku w MR.
Lokalizacja: trzon kręgu …
Znieczulenie: miejscowe, … ml lidokainy …% (do okostnej), sedacja ….
Dostęp: przeznasadowy … (jedno- / obustronny), w ułożeniu na brzuchu.
Sprzęt: igła / trokar kostny … G, cement kostny (PMMA) z kontrastem, system do podawania cementu.
Przebieg zabiegu:
Pod kontrolą fluoroskopii w dwóch projekcjach (AP i boczna) wprowadzono trokar(y) przeznasadowo do trzonu … do granicy przedniej i środkowej jednej trzeciej trzonu, z zachowaniem przyśrodkowej ściany nasady. … (Pobrano wycinek do badania histopatologicznego.) Pod ciągłą kontrolą fluoroskopii w projekcji bocznej podano … ml cementu kostnego o konsystencji pasty, uzyskując wypełnienie trzonu …. Podawanie przerwano przy zbliżeniu się cementu do tylnej ściany trzonu / przy cechach wycieku. Trokary usunięto po wstępnym związaniu cementu. Kontrolne obrazy: … (bez wycieku / niewielki bezobjawowy wyciek do …).
Wynik: wykonano wertebroplastykę kręgu …, objętość cementu … ml.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie płasko przez … h, obserwacja neurologiczna (siła i czucie kończyn dolnych), następnie stopniowa mobilizacja, ocena bólu (VAS), dalsze leczenie osteoporozy / onkologiczne.

Wnioski:
- Wykonano przezskórną wertebroplastykę kręgu … z dostępu przeznasadowego …; podano … ml cementu, ….`,
  textEn: `Procedure: Percutaneous vertebroplasty under fluoroscopic / CT guidance

Findings:
Indication: … (painful osteoporotic compression fracture / metastasis / haemangioma …), marrow oedema on MRI.
Target: … vertebral body
Anaesthesia: local, … ml of …% lidocaine (down to periosteum), sedation ….
Access: … transpedicular (unipedicular / bipedicular), patient prone.
Devices: … G bone trocar, PMMA bone cement with contrast, cement delivery system.
Procedure details:
Under biplane fluoroscopy (AP and lateral) the trocar(s) were advanced transpedicularly into the … vertebral body to the junction of the anterior and middle thirds, respecting the medial pedicle wall. … (A bone biopsy was obtained for histology.) Under continuous lateral fluoroscopic monitoring … ml of paste-consistency bone cement was injected, achieving … filling of the vertebral body. Injection was stopped as cement approached the posterior wall / at any sign of leakage. The trocars were removed after initial cement setting. Final images: … (no leakage / small asymptomatic leak into …).
Result: vertebroplasty of … performed, cement volume … ml.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest flat for … h, neurological observations (lower limb power and sensation), then gradual mobilisation, pain assessment (VAS), further osteoporosis / oncological management.

Conclusion:
- Percutaneous … transpedicular vertebroplasty of …; … ml of cement injected, ….` },

{ id: 'nv2_kyphoplasty', title: 'Kyfoplastyka balonowa', titleEn: 'Balloon kyphoplasty', group: 'NonVascular', section: 'Spine / MSK', priority: 11,
  proc: ['vertebroplasty'], anat: ['spine'],
  text: `Badanie: Przezskórna kyfoplastyka balonowa pod kontrolą fluoroskopii

Opis:
Wskazanie: … (bolesne złamanie kompresyjne trzonu z obniżeniem wysokości …), obrzęk szpiku w MR.
Lokalizacja: trzon kręgu …
Znieczulenie: znieczulenie ogólne / sedacja …, miejscowo … ml lidokainy …%.
Dostęp: przeznasadowy obustronny, w ułożeniu na brzuchu.
Sprzęt: trokary kostne … G, wiertło, balony do kyfoplastyki … mm, cement kostny (PMMA) wysokiej lepkości.
Przebieg zabiegu:
Pod kontrolą fluoroskopii w dwóch projekcjach wprowadzono obustronnie trokary przeznasadowo do trzonu …. Wytworzono kanały wiertłem i wprowadzono balony, które napełniano pod ciśnieniem środkiem kontrastowym (… atm, … ml) pod kontrolą fluoroskopii, uzyskując … (częściowe przywrócenie wysokości trzonu / wytworzenie jamy). Po opróżnieniu i usunięciu balonów wypełniono wytworzone jamy cementem kostnym o wysokiej lepkości (łącznie … ml) pod ciągłą kontrolą fluoroskopii. Trokary usunięto. Kontrolne obrazy: … (bez wycieku cementu).
Wynik: wykonano kyfoplastykę balonową kręgu …, objętość cementu … ml; wysokość trzonu ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: leżenie płasko przez … h, obserwacja neurologiczna, stopniowa mobilizacja, ocena bólu (VAS), leczenie osteoporozy.

Wnioski:
- Wykonano kyfoplastykę balonową kręgu … z dostępu przeznasadowego obustronnego; podano … ml cementu, ….`,
  textEn: `Procedure: Percutaneous balloon kyphoplasty under fluoroscopic guidance

Findings:
Indication: … (painful vertebral compression fracture with height loss …), marrow oedema on MRI.
Target: … vertebral body
Anaesthesia: general anaesthesia / sedation …, local … ml of …% lidocaine.
Access: bipedicular transpedicular, patient prone.
Devices: … G bone trocars, drill, … mm kyphoplasty balloons, high-viscosity PMMA bone cement.
Procedure details:
Under biplane fluoroscopy bilateral transpedicular trocars were advanced into the … vertebral body. Working channels were drilled and the balloons were inflated with contrast (… atm, … ml) under fluoroscopy, achieving … (partial height restoration / cavity creation). After deflation and removal of the balloons the cavities were filled with high-viscosity bone cement (total … ml) under continuous fluoroscopic monitoring. The trocars were removed. Final images: … (no cement leakage).
Result: balloon kyphoplasty of … performed, cement volume … ml; vertebral height ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: bed rest flat for … h, neurological observations, gradual mobilisation, pain assessment (VAS), osteoporosis treatment.

Conclusion:
- Bipedicular balloon kyphoplasty of …; … ml of cement injected, ….` },

{ id: 'nv2_tfesi', title: 'Przezotworowa iniekcja nadtwardówkowa', titleEn: 'Transforaminal epidural steroid injection', group: 'NonVascular', section: 'Spine / MSK', priority: 12,
  proc: ['injection'], anat: ['spine'],
  text: `Badanie: Przezotworowa iniekcja nadtwardówkowa (blokada korzenia) pod kontrolą TK / fluoroskopii

Opis:
Wskazanie: radikulopatia … (korzeń …), … w MR.
Lokalizacja: otwór międzykręgowy …, strona …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny, …, w ułożeniu na brzuchu.
Sprzęt: igła kręgosłupowa … G … (tępa / ostra …), środek kontrastowy dopuszczony do podania okołordzeniowego.
Przebieg zabiegu:
Pod kontrolą TK / fluoroskopii wprowadzono igłę do … części otworu międzykręgowego … (bezpieczny trójkąt / …). Po aspiracji (ujemnej na krew i płyn mózgowo-rdzeniowy) podano … ml środka kontrastowego: rozkład wzdłuż korzenia … i do przestrzeni nadtwardówkowej, bez cech podania donaczyniowego ani podpajęczynówkowego. Podano … mg … (glikokortykosteroid niekrystaliczny / …) z … ml …. Igłę usunięto.
Wynik: wykonano przezotworową iniekcję nadtwardówkową na poziomie … po stronie ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja przez … min (możliwe przejściowe osłabienie/drętwienie kończyny), bez prowadzenia pojazdów w dniu zabiegu, kontrola glikemii u chorych na cukrzycę, ocena efektu za … tygodnie.

Wnioski:
- Wykonano przezotworową iniekcję nadtwardówkową … po stronie … pod kontrolą …; prawidłowy rozkład kontrastu.`,
  textEn: `Procedure: CT / fluoroscopy-guided transforaminal epidural steroid injection (nerve root block)

Findings:
Indication: … radiculopathy (… root), … on MRI.
Target: … neural foramen, … side
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous, …, patient prone.
Devices: … G … spinal needle (blunt / sharp …), contrast suitable for intrathecal/epidural use.
Procedure details:
Under CT / fluoroscopic guidance the needle was advanced into the … aspect of the … neural foramen (safe triangle / …). After negative aspiration for blood and CSF, … ml of contrast was injected, outlining the … nerve root and spreading into the epidural space with no vascular or intrathecal uptake. … mg of … (non-particulate corticosteroid / …) with … ml of … was injected. The needle was removed.
Result: transforaminal epidural injection performed at … on the … side.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for … min (transient limb weakness/numbness possible), no driving on the day of the procedure, monitor glucose in diabetic patients, review response in … weeks.

Conclusion:
- … transforaminal epidural injection on the … side under … guidance; satisfactory contrast spread.` },

{ id: 'nv2_facet_injection', title: 'Iniekcja do stawów międzywyrostkowych', titleEn: 'Facet joint injection', group: 'NonVascular', section: 'Spine / MSK', priority: 13,
  proc: ['injection'], anat: ['spine'],
  text: `Badanie: Iniekcja do stawów międzywyrostkowych (facet) pod kontrolą TK / fluoroskopii

Opis:
Wskazanie: ból … kręgosłupa … pochodzenia stawów międzywyrostkowych, zmiany zwyrodnieniowe w badaniach obrazowych.
Lokalizacja: stawy międzywyrostkowe …, strona …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny tylny, w ułożeniu na brzuchu.
Sprzęt: igła kręgosłupowa … G.
Przebieg zabiegu:
Pod kontrolą TK / fluoroskopii wprowadzono igły do szpar stawów międzywyrostkowych … (dostęp do dolnego zachyłka stawu / …). Położenie wewnątrzstawowe potwierdzono … (podaniem niewielkiej ilości środka kontrastowego z uwidocznieniem jamy stawowej / w obrazach TK). Do każdego stawu podano … ml mieszaniny … mg … (glikokortykosteroid) i … ml … (środek znieczulający miejscowo). Igły usunięto.
Wynik: wykonano iniekcję do … stawów międzywyrostkowych na poziomie ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja przez … min, dzienniczek bólu, ocena efektu za … tygodnie; przy krótkotrwałej poprawie rozważyć denerwację RF gałązek przyśrodkowych.

Wnioski:
- Wykonano iniekcję do stawów międzywyrostkowych … po stronie … pod kontrolą ….`,
  textEn: `Procedure: CT / fluoroscopy-guided facet joint injection

Findings:
Indication: … facet-mediated … spinal pain, degenerative facet changes on imaging.
Target: … facet joints, … side
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous posterior, patient prone.
Devices: … G spinal needle.
Procedure details:
Under CT / fluoroscopic guidance needles were advanced into the … facet joints (inferior recess approach / …). Intra-articular position was confirmed … (by a small volume of contrast outlining the joint / on CT). … ml of a mixture of … mg of … (corticosteroid) and … ml of … (local anaesthetic) was injected into each joint. The needles were removed.
Result: … facet joint injection performed at ….
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for … min, pain diary, review response in … weeks; if relief is short-lived consider medial branch RF denervation.

Conclusion:
- … facet joint injection on the … side under … guidance.` },

{ id: 'nv2_si_joint', title: 'Iniekcja do stawu krzyżowo-biodrowego', titleEn: 'Sacroiliac joint injection', group: 'NonVascular', section: 'Spine / MSK', priority: 14,
  proc: ['injection'], anat: ['spine', 'pelvis'],
  text: `Badanie: Iniekcja do stawu krzyżowo-biodrowego pod kontrolą TK / fluoroskopii

Opis:
Wskazanie: … (ból krzyżowo-biodrowy / sakroiliitis …).
Lokalizacja: staw krzyżowo-biodrowy …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny tylny, do dolnej (maziówkowej) części stawu, w ułożeniu na brzuchu.
Sprzęt: igła kręgosłupowa … G.
Przebieg zabiegu:
Pod kontrolą TK / fluoroskopii (z ukośnym ustawieniem lampy w celu rozwarstwienia linii stawu) wprowadzono igłę do dolnej części szpary stawu krzyżowo-biodrowego …. Położenie wewnątrzstawowe potwierdzono podaniem … ml środka kontrastowego (uwidoczniono jamę stawową, bez wypływu donaczyniowego). Podano … mg … (glikokortykosteroid) z … ml … (środek znieczulający miejscowo). Igłę usunięto.
Wynik: wykonano iniekcję dostawową do stawu krzyżowo-biodrowego ….
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: obserwacja przez … min, dzienniczek bólu (odpowiedź na znieczulenie w pierwszych godzinach), ocena efektu za … tygodnie.

Wnioski:
- Wykonano iniekcję do stawu krzyżowo-biodrowego … pod kontrolą …; położenie wewnątrzstawowe potwierdzone.`,
  textEn: `Procedure: CT / fluoroscopy-guided sacroiliac joint injection

Findings:
Indication: … (sacroiliac joint pain / sacroiliitis …).
Target: … sacroiliac joint
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous posterior, into the inferior (synovial) part of the joint, patient prone.
Devices: … G spinal needle.
Procedure details:
Under CT / fluoroscopic guidance (with oblique tube angulation to separate the joint lines) the needle was advanced into the inferior aspect of the … sacroiliac joint. Intra-articular position was confirmed with … ml of contrast outlining the joint with no vascular uptake. … mg of … (corticosteroid) with … ml of … (local anaesthetic) was injected. The needle was removed.
Result: intra-articular … sacroiliac joint injection performed.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: observe for … min, pain diary (response to local anaesthetic in the first hours), review response in … weeks.

Conclusion:
- … sacroiliac joint injection under … guidance; intra-articular position confirmed.` },

{ id: 'nv2_joint_injection', title: 'Nakłucie / iniekcja stawu (biodro, bark, kolano)', titleEn: 'Joint aspiration / injection (hip, shoulder, knee)', group: 'NonVascular', section: 'Spine / MSK', priority: 15,
  proc: ['injection'], anat: ['spine', 'lower_limb', 'upper_limb', 'pelvis'],
  text: `Badanie: Nakłucie stawu … z aspiracją / iniekcją pod kontrolą USG / fluoroskopii

Opis:
Wskazanie: … (wysięk / podejrzenie zapalenia stawu / ból – iniekcja terapeutyczna / diagnostyczna …).
Lokalizacja: staw … (biodrowy / ramienny / kolanowy) …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: … (staw biodrowy – przedni, do szyjki kości udowej, bocznie od pęczka naczyniowo-nerwowego udowego / staw ramienny – tylny lub przez przedziel rotatorów / staw kolanowy – nadrzepkowo-boczny …).
Sprzęt: igła … G.
Przebieg zabiegu:
W badaniu USG uwidoczniono … (wysięk w stawie o grubości … mm / …). W warunkach aseptycznych, pod kontrolą USG / fluoroskopii, wprowadzono igłę do jamy stawu ….
… (Zaaspirowano … ml płynu …, który przekazano do badań: liczba komórek, posiew, kryształy ….) … (Położenie wewnątrzstawowe potwierdzono … podaniem środka kontrastowego.) Podano … mg … (glikokortykosteroid) z … ml … (środek znieczulający miejscowo). Igłę usunięto, miejsce wkłucia zaopatrzono opatrunkiem.
Wynik: wykonano … stawu …; zaaspirowano … ml płynu / podano lek dostawowo.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: oszczędzanie stawu przez … h, obserwacja w kierunku objawów infekcji (gorączka, narastający ból, zaczerwienienie), ocena wyników badań płynu, ocena efektu za … tygodnie.

Wnioski:
- Wykonano … (aspirację / iniekcję) stawu … pod kontrolą …; ….`,
  textEn: `Procedure: Ultrasound / fluoroscopy-guided … joint aspiration / injection

Findings:
Indication: … (effusion / suspected septic arthritis / pain – therapeutic / diagnostic injection …).
Target: … (hip / shoulder / knee) joint …
Anaesthesia: local, … ml of …% lidocaine.
Access: … (hip – anterior approach to the femoral neck, lateral to the femoral neurovascular bundle / shoulder – posterior or rotator interval / knee – superolateral suprapatellar …).
Devices: … G needle.
Procedure details:
Ultrasound showed … (a … mm joint effusion / …). Under aseptic conditions and ultrasound / fluoroscopic guidance the needle was advanced into the … joint.
… (… ml of … fluid was aspirated and sent for cell count, culture and crystals ….) … (Intra-articular position was confirmed with contrast ….) … mg of … (corticosteroid) with … ml of … (local anaesthetic) was injected. The needle was removed and a dressing applied.
Result: … joint … performed; … ml of fluid aspirated / intra-articular injection given.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: rest the joint for … h, observe for signs of infection (fever, increasing pain, redness), review fluid results, review response in … weeks.

Conclusion:
- … (aspiration / injection) of the … joint under … guidance; ….` },

{ id: 'nv2_calcific_barbotage', title: 'Barbotaż zwapnień w ścięgnach stożka rotatorów', titleEn: 'Calcific tendinopathy barbotage', group: 'NonVascular', section: 'Spine / MSK', priority: 16,
  proc: ['injection'], anat: ['upper_limb'],
  text: `Badanie: Przezskórny barbotaż (lavage) zwapnień ścięgna pod kontrolą USG

Opis:
Wskazanie: objawowa tendinopatia wapniowa ścięgna … (mięśnia nadgrzebieniowego / …) barku ….
Lokalizacja: ścięgno … barku …
Znieczulenie: miejscowe, … ml lidokainy …% (skóra, kaletka podbarkowo-podnaramienna i okolica zwapnienia).
Dostęp: przezskórny, …, pod kontrolą USG.
Sprzęt: igła … G (technika jedno- / dwuigłowa).
Przebieg zabiegu:
W badaniu USG uwidoczniono zwapnienie w ścięgnie … o wymiarach … mm, … (typu … / z cieniem akustycznym …). Pod kontrolą USG wprowadzono igłę … do zwapnienia. Wykonano wielokrotne płukanie zwapnienia ciepłą solą fizjologiczną, uzyskując wypłukanie … ilości materiału wapniowego; … wykonano fenestrację zwapnienia. Na zakończenie do kaletki podbarkowo-podnaramiennej podano … mg … (glikokortykosteroid) z … ml …. Igłę usunięto.
Wynik: wykonano barbotaż zwapnienia ścięgna …, z … usunięciem materiału wapniowego.
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: zimne okłady i leki przeciwbólowe doraźnie (możliwe przejściowe nasilenie bólu), oszczędzanie barku przez … dni, następnie fizjoterapia, kontrolne USG / RTG za … tygodnie.

Wnioski:
- Wykonano barbotaż zwapnienia ścięgna … barku … pod kontrolą USG z iniekcją do kaletki podbarkowej.`,
  textEn: `Procedure: Ultrasound-guided percutaneous barbotage (lavage) of calcific tendinopathy

Findings:
Indication: symptomatic calcific tendinopathy of the … (supraspinatus / …) tendon, … shoulder.
Target: … tendon, … shoulder
Anaesthesia: local, … ml of …% lidocaine (skin, subacromial-subdeltoid bursa and peri-calcific tissue).
Access: percutaneous, …, under ultrasound guidance.
Devices: … G needle(s) (single / double needle technique).
Procedure details:
Ultrasound showed a … mm calcific deposit in the … tendon, … (type … / with acoustic shadowing …). Under ultrasound guidance the needle … was advanced into the calcification. Repeated lavage with warm saline was performed, retrieving … calcific material; … the deposit was fenestrated. Finally … mg of … (corticosteroid) with … ml of … was injected into the subacromial-subdeltoid bursa. The needle was removed.
Result: barbotage of the … tendon calcification performed with … removal of calcific material.
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: ice and analgesia as required (transient pain flare possible), rest the shoulder for … days, then physiotherapy, follow-up ultrasound / radiograph in … weeks.

Conclusion:
- Ultrasound-guided barbotage of … shoulder … tendon calcification with subacromial bursal injection.` },

// ===== Other non-vascular =====
{ id: 'nv2_coeliac_neurolysis', title: 'Neuroliza splotu trzewnego', titleEn: 'Coeliac plexus neurolysis', group: 'NonVascular', section: 'Non-vascular other', priority: 10,
  proc: ['injection'], anat: ['abdomen'],
  text: `Badanie: Przezskórna neuroliza splotu trzewnego pod kontrolą TK

Opis:
Wskazanie: oporny na leczenie ból w nadbrzuszu w przebiegu … (rak trzustki / …).
Lokalizacja: przestrzeń przedaortalna na poziomie pnia trzewnego / tętnicy krezkowej górnej (…)
Znieczulenie: miejscowe, … ml lidokainy …%, sedacja …; dostęp dożylny z nawodnieniem.
Dostęp: … (tylny przeodnogowy / zaodnogowy / przedni …), w ułożeniu na brzuchu / na plecach.
Sprzęt: igła(y) kręgosłupowa(e) … G, … cm.
Przebieg zabiegu:
W TK planującym oceniono położenie pnia trzewnego, tętnicy krezkowej górnej, odnóg przepony, nadnerczy i nerek. Pod kontrolą TK wprowadzono igłę(y) … do przestrzeni przedaortalnej w okolicy odejścia pnia trzewnego. Po ujemnej aspiracji podano … ml środka kontrastowego rozcieńczonego z … – uzyskano rozkład wokół aorty i pnia trzewnego, bez cech podania donaczyniowego ani do odnóg przepony / mięśnia lędźwiowego. Podano … ml … (środek znieczulający miejscowo), a następnie … ml …% etanolu (środek neurolityczny) … obustronnie / …. Igłę(y) przepłukano przed usunięciem … i usunięto.
Wynik: wykonano neurolizę splotu trzewnego …; rozkład środka …
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: monitorowanie ciśnienia tętniczego (hipotensja ortostatyczna), nawodnienie, pionizacja z asekuracją, obserwacja w kierunku biegunki, ocena bólu (VAS) i zapotrzebowania na opioidy.

Wnioski:
- Wykonano neurolizę splotu trzewnego etanolem z dostępu … pod kontrolą TK; prawidłowy rozkład środka.`,
  textEn: `Procedure: CT-guided percutaneous coeliac plexus neurolysis

Findings:
Indication: intractable upper abdominal pain due to … (pancreatic cancer / …).
Target: pre-aortic space at the level of the coeliac trunk / SMA origin (…)
Anaesthesia: local, … ml of …% lidocaine, sedation …; IV access with hydration.
Access: … (posterior transcrural / retrocrural / anterior …), patient prone / supine.
Devices: … G, … cm spinal needle(s).
Procedure details:
Planning CT identified the coeliac trunk, SMA, diaphragmatic crura, adrenals and kidneys. Under CT guidance the needle(s) were advanced … into the pre-aortic space around the coeliac trunk origin. After negative aspiration … ml of contrast diluted with … was injected, spreading around the aorta and coeliac trunk with no vascular, crural or psoas uptake. … ml of … (local anaesthetic) followed by … ml of …% ethanol (neurolytic agent) was injected … bilaterally / …. The needle(s) were flushed … and removed.
Result: coeliac plexus neurolysis performed …; spread of injectate …
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: monitor blood pressure (orthostatic hypotension), IV fluids, assisted mobilisation, observe for diarrhoea, assess pain (VAS) and opioid requirement.

Conclusion:
- CT-guided … coeliac plexus neurolysis with ethanol; satisfactory spread of injectate.` },

{ id: 'nv2_hookwire_localisation', title: 'Lokalizacja zmiany drutem z haczykiem / znacznikiem', titleEn: 'Hook-wire / marker lesion localisation', group: 'NonVascular', section: 'Non-vascular other', priority: 11,
  proc: ['marker'], anat: ['chest', 'abdomen', 'pelvis', 'neck'],
  text: `Badanie: Przedoperacyjna lokalizacja zmiany drutem z haczykiem / znacznikiem pod kontrolą … (USG / TK / mammografii)

Opis:
Wskazanie: … (niewyczuwalna zmiana …; lokalizacja przed resekcją chirurgiczną).
Lokalizacja: …
Znieczulenie: miejscowe, … ml lidokainy …%.
Dostęp: przezskórny, …, w ułożeniu ….
Sprzęt: igła lokalizacyjna … G, … cm z drutem z haczykiem / znacznik ….
Przebieg zabiegu:
W badaniu … uwidoczniono zmianę … o wymiarach … mm, …. Pod kontrolą … wprowadzono igłę lokalizacyjną … tak, aby jej koniec znalazł się … (w obrębie zmiany / … mm od zmiany). Uwolniono drut z haczykiem / znacznik, a igłę wycofano. Kontrolne obrazy (… projekcje / skany) potwierdziły położenie drutu / znacznika … względem zmiany. Zewnętrzną część drutu zabezpieczono opatrunkiem.
Wynik: drut lokalizacyjny / znacznik umieszczony … (w zmianie / w odległości … mm od zmiany, …).
Zużycie środka kontrastowego: … ml. Czas fluoroskopii: … min. Dawka (KAP): … Gy·cm².
Powikłania: bez powikłań w trakcie zabiegu.
Zalecenia: przekazanie pacjenta na blok operacyjny z dokumentacją obrazową lokalizacji, ochrona drutu przed przemieszczeniem; … (w płucu – kontrolne RTG w kierunku odmy); RTG preparatu operacyjnego.

Wnioski:
- Prawidłowa przedoperacyjna lokalizacja zmiany … drutem z haczykiem / znacznikiem pod kontrolą ….`,
  textEn: `Procedure: Pre-operative hook-wire / marker localisation of a lesion under … (ultrasound / CT / mammographic) guidance

Findings:
Indication: … (non-palpable lesion …; localisation before surgical excision).
Target: …
Anaesthesia: local, … ml of …% lidocaine.
Access: percutaneous, …, patient ….
Devices: … G, … cm localisation needle with hook-wire / … marker.
Procedure details:
… showed a … mm … lesion …. Under … guidance the localisation needle was advanced … with its tip … (within the lesion / … mm from the lesion). The hook-wire / marker was deployed and the needle withdrawn. Check images (… views / scans) confirmed the wire / marker position … relative to the lesion. The external wire was secured with a dressing.
Result: localisation wire / marker placed … (within the lesion / … mm from the lesion, …).
Contrast: … ml. Fluoroscopy time: … min. Dose (KAP): … Gy·cm².
Complications: none during the procedure.
Recommendations: transfer to theatre with localisation images, protect the wire from displacement; … (lung – chest radiograph for pneumothorax); specimen radiograph.

Conclusion:
- Satisfactory pre-operative hook-wire / marker localisation of the … lesion under … guidance.` },

// ===== Snippets =====
{ id: 'nv2_snip_us_puncture', title: 'Nakłucie pod kontrolą USG (w czasie rzeczywistym)', titleEn: 'Real-time US-guided puncture', group: 'Snippets', section: 'Access snippets', priority: 50,
  text: 'Pod kontrolą USG w czasie rzeczywistym, z oceną Doppler toru wkłucia, nakłuto … igłą … G z ominięciem naczyń i pętli jelitowych; koniec igły uwidaczniano przez cały czas wkłucia.',
  textEn: 'Under real-time ultrasound guidance, with Doppler assessment of the trajectory, … was punctured with a … G needle avoiding vessels and bowel loops; the needle tip was visualised throughout.' },
{ id: 'nv2_snip_coaxial', title: 'Technika koaksjalna', titleEn: 'Co-axial technique', group: 'Snippets', section: 'Access snippets', priority: 51,
  text: 'Zastosowano technikę koaksjalną: igłę prowadzącą … G umieszczono na obrzeżu zmiany, a przez nią pobrano … wycinków igłą tnącą … G.',
  textEn: 'A co-axial technique was used: a … G introducer needle was placed at the margin of the lesion and … cores were obtained through it with a … G cutting needle.' },
{ id: 'nv2_snip_ct_planning', title: 'Planowanie toru wkłucia w TK', titleEn: 'CT trajectory planning', group: 'Snippets', section: 'Access snippets', priority: 52,
  text: 'Tor wkłucia zaplanowano w TK z ominięciem naczyń, pętli jelitowych i opłucnej; położenie igły potwierdzono w kontrolnych skanach.',
  textEn: 'The trajectory was planned on CT avoiding vessels, bowel and pleura; needle position was confirmed on check scans.' },
{ id: 'nv2_snip_tract_plug', title: 'Uszczelnienie kanału wkłucia', titleEn: 'Tract plugging', group: 'Snippets', section: 'Device snippets', priority: 50,
  text: 'Przy wycofywaniu igły prowadzącej kanał wkłucia uszczelniono … (zatyczką żelatynową / gąbką hemostatyczną / spiralami …).',
  textEn: 'On withdrawal of the introducer the tract was plugged with … (gelatin sponge slurry / torpedoes / coils …).' },
{ id: 'nv2_snip_drain_fix', title: 'Mocowanie drenu', titleEn: 'Drain fixation', group: 'Snippets', section: 'Device snippets', priority: 51,
  text: 'Pętlę cewnika zablokowano, dren ufiksowano do skóry szwem / urządzeniem mocującym i podłączono do worka.',
  textEn: 'The catheter loop was locked, the drain was secured to the skin with a suture / fixation device and connected to a drainage bag.' },
{ id: 'nv2_snip_specimen', title: 'Postępowanie z materiałem', titleEn: 'Specimen handling', group: 'Snippets', section: 'General snippets', priority: 50,
  text: 'Materiał przekazano do badania … (histopatologicznego w formalinie / mikrobiologicznego – posiew tlenowy i beztlenowy / cytologicznego / biochemicznego).',
  textEn: 'Samples were sent for … (histology in formalin / microbiology – aerobic and anaerobic culture / cytology / biochemistry).' },
{ id: 'nv2_snip_sedation', title: 'Sedacja świadoma', titleEn: 'Conscious sedation', group: 'Snippets', section: 'Medication snippets', priority: 50,
  text: 'Zabieg wykonano w sedacji: … mg midazolamu i … µg fentanylu i.v., z monitorowaniem SpO2, EKG i ciśnienia tętniczego.',
  textEn: 'The procedure was performed under conscious sedation with … mg of midazolam and … µg of fentanyl IV, with SpO2, ECG and blood pressure monitoring.' },
{ id: 'nv2_snip_antibiotic', title: 'Profilaktyka antybiotykowa', titleEn: 'Antibiotic prophylaxis', group: 'Snippets', section: 'Medication snippets', priority: 51,
  text: 'Przed zabiegiem podano profilaktycznie … (antybiotyk) … i.v.',
  textEn: 'Prophylactic … (antibiotic) … IV was given before the procedure.' },
{ id: 'nv2_snip_pneumothorax', title: 'Odma opłucnowa – drenaż', titleEn: 'Pneumothorax – drain', group: 'Snippets', section: 'Complication snippets', priority: 50,
  text: 'W trakcie zabiegu wystąpiła odma opłucnowa …; założono dren opłucnowy … F z dostępu …, uzyskując rozprężenie płuca w kontrolnym badaniu.',
  textEn: 'A … pneumothorax developed during the procedure; a … F chest drain was inserted via …, with lung re-expansion on check imaging.' },
{ id: 'nv2_snip_pneumothorax_small', title: 'Niewielka odma – obserwacja', titleEn: 'Small pneumothorax – observation', group: 'Snippets', section: 'Complication snippets', priority: 51,
  text: 'W kontrolnym badaniu niewielka odma opłucnowa (…), stabilna, niewymagająca drenażu; pacjent bez duszności. Zalecono kontrolne RTG klatki piersiowej za … h.',
  textEn: 'Check imaging showed a small stable pneumothorax (…) not requiring drainage; the patient was not dyspnoeic. A chest radiograph in … h was advised.' },
{ id: 'nv2_snip_bleeding', title: 'Krwiak / krwawienie z kanału wkłucia', titleEn: 'Tract bleeding / haematoma', group: 'Snippets', section: 'Complication snippets', priority: 52,
  text: 'W kontrolnym badaniu uwidoczniono … krwiak … o wymiarach … mm, bez cech czynnego krwawienia; zalecono kontrolę morfologii i parametrów życiowych.',
  textEn: 'Check imaging showed a … mm … haematoma with no active bleeding; blood count and vital signs monitoring was advised.' },
{ id: 'nv2_snip_vasovagal', title: 'Reakcja wazowagalna', titleEn: 'Vasovagal reaction', group: 'Snippets', section: 'Complication snippets', priority: 53,
  text: 'W trakcie zabiegu wystąpiła przemijająca reakcja wazowagalna (bradykardia, spadek ciśnienia), ustępująca po ułożeniu płasko i podaniu płynów i.v. ….',
  textEn: 'A transient vasovagal reaction (bradycardia, hypotension) occurred, resolving with supine positioning and IV fluids ….' },
{ id: 'nv2_snip_aseptic', title: 'Przygotowanie aseptyczne', titleEn: 'Aseptic preparation', group: 'Snippets', section: 'General snippets', priority: 51,
  text: 'Po uzyskaniu pisemnej zgody pacjenta i weryfikacji (time-out) pole zabiegowe zdezynfekowano i obłożono jałowo.',
  textEn: 'After written informed consent and a time-out, the skin was prepared and draped in a sterile fashion.' },
];

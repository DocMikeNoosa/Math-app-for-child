// Report templates (radiologist-provided set + MR L-S and USG abdomen).
// Fields: id, title (menu label), group (Trauma | Non-trauma | Snippets), section (region), priority, text.
// Template text format: first line = examination, then "Opis:", body, "Wnioski:" and bullet/numbered conclusions.
export const TEMPLATE_DATA = [
  {
    "id": "ct_head_normal",
    "title": "CT Head normal",
    "group": "Non-trauma",
    "section": "CT Head",
    "priority": 1,
    "text": "Badanie: TK głowy bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nStruktury mózgowia bez zmian ogniskowych, bez cech krwawienia śródczaszkowego, ostrych zmian niedokrwiennych, obrzęku mózgu i bez efektu masy.\n\nUkład komorowy symetryczny, nieposzerzony, bez przemieszczenia struktur pośrodkowych.\n\nKości pokrywy i podstawy czaszki prawidłowe.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nWnioski:\n- Bez cech ostrej patologii wewnątrzczaszkowej."
  },
  {
    "id": "ct_head_contrast",
    "title": "CT Head bez i z kontrastem",
    "group": "Non-trauma",
    "section": "CT Head",
    "priority": 2,
    "text": "Badanie: TK głowy bez i z kontrastem\n\nOpis:\nStruktury mózgowia bez zmian ogniskowych, bez cech krwawienia śródczaszkowego, ostrych zmian niedokrwiennych, obrzęku mózgu i bez efektu masy.\nNie uwidoczniono wzmacniających się zmian ogniskowych.\nUkład komorowy symetryczny, nieposzerzony, bez przemieszczenia struktur pośrodkowych.\n\nKości pokrywy i podstawy czaszki prawidłowe.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nWnioski:\n- Bez cech ostrej patologii wewnątrzczaszkowej.\n- Nie uwidoczniono wzmacniających się zmian ogniskowych."
  },
  {
    "id": "ct_head_old",
    "title": "CT Head normal OLD",
    "group": "Non-trauma",
    "section": "CT Head",
    "priority": 3,
    "text": "Badanie: TK głowy bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nBez cech świeżego udaru, krwawienia wewnątrzczaszkowego, obrzęku mózgu ani efektu masy.\nUogólnione zaniki korowo-podkorowe w zakresie oczekiwanym dla wieku.\nUkład komorowy symetryczny, proporcjonalnie poszerzony do obecnych zaników.\nZmiany naczyniopochodne w istocie białej obu półkul mózgu.\n\nKości pokrywy i podstawy czaszki prawidłowe.\nZatoki przynosowe i komórki wyrostków sutkowatych prawidłowo powietrzne.\n\nWnioski:\n- Bez cech ostrej patologii wewnątrzczaszkowej."
  },
  {
    "id": "ct_head_trauma",
    "title": "CT Head trauma normal",
    "group": "Trauma",
    "section": "CT Head",
    "priority": 1,
    "text": "Badanie: TK głowy bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu ani zmian pourazowych.\nStruktury linii pośrodkowej zachowane, układ komorowy prawidłowy.\nBez cech złamania kości sklepienia i podstawy czaszki.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych."
  },
  {
    "id": "ct_head_trauma_old",
    "title": "CT Head trauma OLD",
    "group": "Trauma",
    "section": "CT Head",
    "priority": 2,
    "text": "Badanie: TK głowy bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu ani zmian pourazowych.\nStruktury linii pośrodkowej zachowane.\nUogólnione zaniki korowo-podkorowe w zakresie oczekiwanym dla wieku.\nUkład komorowy symetryczny, proporcjonalnie poszerzony do obecnych zaników.\nZmiany naczyniopochodne w istocie białej obu półkul mózgu.\n\nBez cech złamania kości sklepienia i podstawy czaszki.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych."
  },
  {
    "id": "ct_head_face_trauma",
    "title": "CT Head + Facial bones trauma",
    "group": "Trauma",
    "section": "Combined",
    "priority": 1,
    "text": "Badanie: TK głowy oraz kości twarzoczaszki bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nStruktury mózgowia bez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu, efektu masy ani zmian pourazowych.\nStruktury linii pośrodkowej zachowane, układ komorowy prawidłowy.\n\nBez cech złamania kości sklepienia i podstawy czaszki.\nStawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.\nŁuki jarzmowe oraz ściany oczodołów zachowane.\nBez cech krwiaka wewnątrzoczodołowego.\nZatoki przynosowe i komórki wyrostków sutkowatych prawidłowo powietrzne.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Nie uwidoczniono złamań kości twarzoczaszki."
  },
  {
    "id": "ct_head_face_trauma_old",
    "title": "CT Head + Facial bones trauma OLD",
    "group": "Trauma",
    "section": "Combined",
    "priority": 2,
    "text": "Badanie: TK głowy oraz kości twarzoczaszki bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu, efektu masy ani zmian pourazowych.\nStruktury linii pośrodkowej zachowane.\nUogólnione zaniki korowo-podkorowe w zakresie oczekiwanym dla wieku.\nUkład komorowy symetryczny, proporcjonalnie poszerzony do obecnych zaników.\nZmiany naczyniopochodne w istocie białej obu półkul mózgu.\n\nBez cech złamania kości sklepienia i podstawy czaszki.\nStawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.\nŁuki jarzmowe oraz ściany oczodołów zachowane.\nBez cech krwiaka wewnątrzoczodołowego.\nZatoki przynosowe i komórki wyrostków sutkowatych prawidłowo powietrzne.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Nie uwidoczniono złamań kości twarzoczaszki."
  },
  {
    "id": "ct_head_cspine_trauma",
    "title": "CT Head + C-spine trauma",
    "group": "Trauma",
    "section": "Combined",
    "priority": 3,
    "text": "Badanie: TK głowy oraz kręgosłupa szyjnego bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nGłowa:\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu i bez zmian pourazowych.\nStruktury linii pośrodkowej zachowane, układ komorowy prawidłowy.\nBez cech złamania kości sklepienia i podstawy czaszki.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nKręgosłup szyjny:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech przemieszczenia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\nBez urazu górnych żeber w zakresie badania.\nBez cech odmy opłucnowej w szczytach płucnych w zakresie badania.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego w zakresie badania."
  },
  {
    "id": "ct_head_cspine_trauma_old",
    "title": "CT Head + C-spine trauma OLD",
    "group": "Trauma",
    "section": "Combined",
    "priority": 4,
    "text": "Badanie: TK głowy oraz kręgosłupa szyjnego bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nGłowa:\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu i bez zmian pourazowych.\nStruktury linii pośrodkowej zachowane.\nUogólnione zaniki korowo-podkorowe w zakresie oczekiwanym dla wieku.\nUkład komorowy symetryczny, proporcjonalnie poszerzony do obecnych zaników.\nZmiany naczyniopochodne w istocie białej obu półkul mózgu.\n\nBez cech złamania kości sklepienia i podstawy czaszki.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe powietrzne.\n\nKręgosłup szyjny:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech przemieszczenia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\nBez urazu górnych żeber w zakresie badania.\nBez cech odmy opłucnowej w szczytach płucnych w zakresie badania.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego w zakresie badania."
  },
  {
    "id": "ct_head_face_cspine_trauma",
    "title": "CT Head + Facial bones + C-spine trauma",
    "group": "Trauma",
    "section": "Combined",
    "priority": 5,
    "text": "Badanie: TK głowy, kości twarzoczaszki oraz kręgosłupa szyjnego bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nGłowa:\nStruktury mózgowia bez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu, efektu masy i bez zmian pourazowych.\nStruktury linii pośrodkowej zachowane, układ komorowy prawidłowy.\nBez cech złamania kości sklepienia i podstawy czaszki.\n\nKości twarzoczaszki:\nStawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.\nŁuki jarzmowe oraz ściany oczodołów zachowane.\nBez cech krwiaka wewnątrzoczodołowego.\nZatoki przynosowe i komórki wyrostków sutkowatych prawidłowo powietrzne.\n\nKręgosłup szyjny:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech przemieszczenia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\nBez urazu górnych żeber w zakresie badania.\nBez cech odmy opłucnowej w szczytach płucnych w zakresie badania.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Nie uwidoczniono złamań kości twarzoczaszki.\n- Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego w zakresie badania."
  },
  {
    "id": "ct_head_face_cspine_trauma_old",
    "title": "CT Head + Facial bones + C-spine trauma OLD",
    "group": "Trauma",
    "section": "Combined",
    "priority": 6,
    "text": "Badanie: TK głowy, kości twarzoczaszki oraz kręgosłupa szyjnego bez kontrastu\n\nOpis:\nBadanie wykonano w trybie ostrodyżurowym.\n\nGłowa:\nBez cech krwawienia wewnątrzczaszkowego, obrzęku mózgu, efektu masy i bez zmian pourazowych.\nStruktury linii pośrodkowej zachowane.\nUogólnione zaniki korowo-podkorowe w zakresie oczekiwanym dla wieku.\nUkład komorowy symetryczny, proporcjonalnie poszerzony do obecnych zaników.\nZmiany naczyniopochodne w istocie białej obu półkul mózgu.\n\nBez cech złamania kości sklepienia i podstawy czaszki.\n\nKości twarzoczaszki:\nStawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.\nŁuki jarzmowe oraz ściany oczodołów zachowane.\nBez cech krwiaka wewnątrzoczodołowego.\nZatoki przynosowe i komórki wyrostków sutkowatych prawidłowo powietrzne.\n\nKręgosłup szyjny:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech przemieszczenia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\nBez urazu górnych żeber w zakresie badania.\nBez cech odmy opłucnowej w szczytach płucnych w zakresie badania.\n\nWnioski:\n- Bez wewnątrzczaszkowych zmian pourazowych.\n- Nie uwidoczniono złamań kości twarzoczaszki.\n- Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego w zakresie badania."
  },
  {
    "id": "ct_facial_bones",
    "title": "CT Facial bones normal",
    "group": "Trauma",
    "section": "Facial bones",
    "priority": 1,
    "text": "Badanie: TK kości twarzoczaszki\n\nOpis:\nStawy skroniowo-żuchwowe obustronnie prawidłowo ustawione.\nŁuki jarzmowe oraz ściany oczodołów zachowane.\nBez cech krwiaka wewnątrzoczodołowego.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe prawidłowo powietrzne.\n\nWnioski:\n- Nie uwidoczniono złamań kości twarzoczaszki."
  },
  {
    "id": "ct_c_spine",
    "title": "CT C-spine normal",
    "group": "Trauma",
    "section": "Spine",
    "priority": 1,
    "text": "Badanie: TK kręgosłupa szyjnego bez kontrastu\n\nOpis:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech przemieszczenia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\nBez urazu górnych żeber w zakresie badania.\nBez cech odmy opłucnowej w szczytach płucnych w zakresie badania.\n\nWnioski:\n- Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego w zakresie badania."
  },
  {
    "id": "ct_l_spine",
    "title": "CT L-spine normal",
    "group": "Trauma",
    "section": "Spine",
    "priority": 2,
    "text": "TK kręgosłupa lędźwiowego:\n\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech zwichnięcia.\nTrzony kręgów o zachowanej wysokości.\nNie stwierdza się złamań.\nPrawidłowy obraz otaczających tkanek miękkich.\n\nWnioski:\n- Brak cech ostrego złamania lub zwichnięcia w obrębie kręgosłupa."
  },
  {
    "id": "angio_ct_stroke",
    "title": "Angio CT stroke",
    "group": "Non-trauma",
    "section": "Vascular / Neuro",
    "priority": 1,
    "text": "Badanie: TK Angio tętnic szyjnych i koła Willisa (protokół udarowy)\n\nOpis:\nDobra wizualizacja górnej części łuku aorty, tętnic szyjnych wspólnych, zewnętrznych i wewnętrznych oraz tętnic kręgowych obustronnie w obrębie szyi.\nNie uwidoczniono istotnych zwężeń, niedrożności, rozwarstwienia ani nieprawidłowych poszerzeń.\nObustronne, symetryczne wypełnienie naczyń tętniczych wewnątrzczaszkowych, z dobrą wizualizacją dystalnych odcinków tętnic kręgowych oraz tętnicy podstawnej.\nKoło tętnicze Willisa bez zmian patologicznych.\n\nWnioski:\n- Nie uwidoczniono niedrożności dużych naczyń."
  },
  {
    "id": "ctv_brain",
    "title": "CTV brain normal",
    "group": "Non-trauma",
    "section": "Vascular / Neuro",
    "priority": 2,
    "text": "Badanie wenograficzne mózgu:\n\nOpis:\nZatoka strzałkowa górna, zatoki poprzeczne, esowate oraz jamiste są drożne.\nNie stwierdza się obecności nieprawidłowych naczyń, poszerzeń naczyniowych ani patologicznych ubytków w wypełnieniu kontrastowym.\nŻyły powierzchowne i głębokie mózgowia drożne.\n\nZ uwzględnieniem fazy żylnej podania kontrastu, tętnice śródczaszkowe są drożne – bez zwężeń ani tętniaków.\n\nWnioski:\n- Bez cech zakrzepicy żylnej mózgowia."
  },
  {
    "id": "angio_ct_intracranial",
    "title": "Angio CT intracranial",
    "group": "Non-trauma",
    "section": "Vascular / Neuro",
    "priority": 3,
    "text": "Badanie: Angio TK koła Willisa\n\nOpis:\nNie stwierdza się tętniaków ani malformacji naczyniowych.\nKoło Willisa o prawidłowej morfologii.\nBez cech patologicznego wzmocnienia kontrastowego.\nNie uwidoczniono wzmacniających się zmian ogniskowych.\nZatoki żylne mózgu drożne.\n\nWnioski:\n- Nie uwidoczniono tętniaków, malformacji naczyniowych lub innych patologii naczyniowych."
  },
  {
    "id": "ct_abdo_pel_contrast_normal",
    "title": "CT Abdo/Pel contrast normal",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 1,
    "text": "TK jamy brzusznej i miednicy\n\nOpis:\nBrak wolnego powietrza oraz wolnego płynu w jamie brzusznej.\nNie stwierdza się zbiorników płynowych w jamie brzusznej ani miednicy.\nWątroba, pęcherzyk żółciowy, drogi żółciowe wewnątrz- i zewnątrzwątrobowe, trzustka, śledziona, nerki oraz nadnercza – bez odchyleń.\nPętle jelita cienkiego i grubego – bez cech patologii.\nAorta brzuszna oraz jej główne odgałęzienia – obraz prawidłowy.\nW oknie kostnym nie uwidoczniono istotnych zmian patologicznych.\nPodstawy płuc wolne, bez cech obecności płynu w jamach opłucnowych.\n\nWnioski:\n- Bez cech ostrej patologii w obrębie jamy brzusznej i miednicy."
  },
  {
    "id": "ct_abdo_pel_noncontrast_normal",
    "title": "CT Abdo/Pel non-contrast normal",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 2,
    "text": "TK jamy brzusznej i miednicy bez kontrastu\n\nOpis:\nBrak wolnego powietrza oraz wolnego płynu w jamie brzusznej.\nNie stwierdza się zbiorników płynowych w jamie brzusznej ani miednicy.\nWątroba, pęcherzyk żółciowy, drogi żółciowe wewnątrz- i zewnątrzwątrobowe, trzustka, śledziona, nerki oraz nadnercza – bez odchyleń w badaniu bez kontrastu.\nPętle jelita cienkiego i grubego – bez cech patologii w badaniu bez kontrastu.\nAorta brzuszna oraz jej główne odgałęzienia – obraz prawidłowy w badaniu bez kontrastu.\nW oknie kostnym nie uwidoczniono istotnych zmian patologicznych.\nPodstawy płuc wolne, bez cech obecności płynu w jamach opłucnowych.\n\nWnioski:\n- Bez cech ostrej patologii w obrębie jamy brzusznej i miednicy."
  },
  {
    "id": "ct_abdo_pel_trauma",
    "title": "CT Abdo/Pel trauma normal",
    "group": "Trauma",
    "section": "Abdomen / Pelvis",
    "priority": 1,
    "text": "TK jamy brzusznej i miednicy – po urazie\n\nOpis:\nBez wolnego powietrza oraz wolnego płynu w jamie brzusznej.\nBez cech urazu wątroby, śledziony, trzustki, nadnerczy oraz nerek.\nPęcherzyk żółciowy i drogi żółciowe bez odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nPęcherz moczowy o prawidłowym zarysie.\nAorta brzuszna oraz jej główne odgałęzienia mają prawidłowy wygląd.\nBez cech aktywnego krwawienia.\nPodstawy płuc bez zmian.\nWidoczne dolne żebra bez złamań.\nKręgosłup lędźwiowy oraz miednica bez złamań.\n\nWnioski:\n- Bez cech zmian urazowych w obrębie jamy brzusznej i miednicy."
  },
  {
    "id": "ct_kub_noncontrast",
    "title": "CT KUB non-contrast",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 3,
    "text": "Badanie: TK jamy brzusznej i miednicy bez kontrastu - w kierunku kamicy nerkowej\n\nOpis:\nBez cech wodonercza i bez poszerzenia moczowodów.\nNie stwierdza się złogów w układzie moczowym.\nBez cech zatarcia tłuszczu okołonerkowego.\nNerki o prawidłowym wyglądzie w badaniu bez kontrastu.\n\nWątroba, pęcherzyk żółciowy, drogi żółciowe, trzustka, śledziona i nadnercza o prawidłowym wyglądzie w badaniu bez kontrastu.\nJelita bez zmian patologicznych.\nAorta brzuszna i jej główne odgałęzienia o prawidłowym wyglądzie w badaniu bez kontrastu.\nBrak wolnego powietrza i bez wolnego płynu w jamie brzusznej.\nDolne partie płuc prawidłowe, bez cech płynu w jamach opłucnowych.\nW układzie kostnym nie stwierdza się istotnych zmian patologicznych.\n\nWnioski:\n- Nie uwidoczniono cech kamicy nerkowej ani innej ostrej patologii w zakresie badania."
  },
  {
    "id": "ct_kub_contrast",
    "title": "CT KUB contrast",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 4,
    "text": "Badanie: TK jamy brzusznej i miednicy bez i z podaniem środka kontrastowego - w kierunku kamicy nerkowej\n\nOpis:\nBez cech wodonercza i bez poszerzenia moczowodów.\nNie stwierdza się złogów w układzie moczowym.\nBez cech zatarcia tłuszczu okołonerkowego.\nNerki prawidłowe.\n\nBrak wolnego powietrza oraz wolnego płynu w jamie brzusznej.\nNie stwierdza się zbiorników płynowych w jamie brzusznej ani miednicy.\nWątroba, pęcherzyk żółciowy, drogi żółciowe wewnątrz- i zewnątrzwątrobowe, trzustka, śledziona oraz nadnercza – bez odchyleń.\nPętle jelita cienkiego i grubego – bez cech patologii.\nAorta brzuszna oraz jej główne odgałęzienia – prawidłowe.\nUkład kostny bez zmian patologicznych.\nPodstawy płuc wolne, bez cech obecności płynu w jamach opłucnowych.\n\nWnioski:\n- Nie uwidoczniono cech kamicy nerkowej. Nie uwidoczniono zastoju w układzie moczowym.\n- Bez cech ostrej patologii w obrębie jamy brzusznej i miednicy."
  },
  {
    "id": "snippet_sinus_mucosa",
    "title": "Pogrubienie śluzówki zatok",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 1,
    "text": "Pogrubienie śluzówki zatok przynosowych."
  },
  {
    "id": "snippet_subgaleal",
    "title": "Krwiak podczepcowy",
    "group": "Snippets",
    "section": "Trauma snippets",
    "priority": 1,
    "text": "Krwiak podczepcowy okolicy "
  },
  {
    "id": "snippet_wound_subgaleal",
    "title": "Rana + krwiak podczepcowy",
    "group": "Snippets",
    "section": "Trauma snippets",
    "priority": 2,
    "text": "Rana skóry i krwiak podczepcowy okolicy "
  },
  {
    "id": "snippet_compare",
    "title": "Porównano z badaniem",
    "group": "Snippets",
    "section": "General snippets",
    "priority": 1,
    "text": "Badanie porównywane do badania z "
  },
  {
    "id": "snippet_lacunes",
    "title": "Przebyte ogniska lakunarne",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 2,
    "text": "Przebyte ogniska lakunarne w strukturach głębokich obu półkul mózgu."
  },
  {
    "id": "snippet_no_enhancing",
    "title": "Bez zmian wzmacniających",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 3,
    "text": "Nie uwidoczniono wzmacniających się zmian ogniskowych."
  },
  {
    "id": "snippet_cavum",
    "title": "Cavum vergae/septum",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 4,
    "text": "Cavum vergae i cavum septum pellucidum."
  },
  {
    "id": "snippet_malacia",
    "title": "Obszar malacji",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 5,
    "text": "Obszar malacji w "
  },
  {
    "id": "snippet_small_vessel_mild",
    "title": "Zmiany naczyniopochodne łagodne",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 6,
    "text": "Zmiany naczyniopochodne w istocie białej obu półkul mózgu o łagodnym nasileniu."
  },
  {
    "id": "snippet_motion",
    "title": "Artefakty ruchowe",
    "group": "Snippets",
    "section": "General snippets",
    "priority": 2,
    "text": "Badanie obarczone artefaktami ruchowymi – ocena ograniczona w tych obszarach."
  },
  {
    "id": "snippet_iih",
    "title": "Cechy możliwego IIH",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 7,
    "text": "Hypoplastyczna zatoka poprzeczna i esowata po stronie lewej. Objaw częściowo pustego siodła. Wąski układ komorowy. Te cechy morfologiczne mogą odpowiadać pewnego stopnia idiopatycznego nadciśnienia śródczaszkowego - do korelacji klinicznej."
  },
  {
    "id": "snippet_mild_atrophy",
    "title": "Niewielkie zaniki",
    "group": "Snippets",
    "section": "Head snippets",
    "priority": 8,
    "text": "Niewielkiego stopnia dla wieku uogólnione zaniki korowo-podkorowe."
  },
  {
    "id": "ct_chest_normal_nontrauma",
    "title": "Normal CT Chest NON-TRAUMA",
    "group": "Non-trauma",
    "section": "Chest / Thorax",
    "priority": 0,
    "text": "Badanie: TK klatki piersiowej\n\nOpis:\nPłuca prawidłowe, prawidłowo powietrzne.\nBez płynu w jamach opłucnowych.\n\nŚródpiersie bez odchyleń. Bez limfadenopatii.\nSerce niepowiększone. Bez płynu w worku osierdziowym.\n\nW uwidocznionym zakresie nadbrzusza bez istotnych odchyleń.\n\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech ostrej patologii w obrębie klatki piersiowej."
  },
  {
    "id": "ctpa_normal",
    "title": "Normal CTPA",
    "group": "Non-trauma",
    "section": "Chest / Thorax",
    "priority": 2,
    "text": "Badanie: Angio-TK tętnic płucnych\n\nOpis:\nDobre wypełnienie kontrastowe tętnic płucnych. Bez cech zatorowości płucnej do poziomu tętnic segmentowych.\n\nPień płucny nieposzerzony.\nBez cech przeciążenia prawej komory serca. Bez płynu w worku osierdziowym.\n\nPłuca prawidłowe, prawidłowo powietrzne. Bez płynu w jamach opłucnowych.\n\nW uwidocznionym zakresie nadbrzusza bez istotnych odchyleń.\n\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech zatorowości płucnej.\n- Nie uwidoczniono innej patologii mogącej tłumaczyć zgłaszane objawy."
  },
  {
    "id": "aorta_whole_normal",
    "title": "Normal Aorta Whole",
    "group": "Non-trauma",
    "section": "Aorta / Vascular",
    "priority": 1,
    "text": "Badanie: Angio-TK aorty\n\nOpis:\nNaczynia:\nBez cech rozwarstwienia, tętniakowatego poszerzenia i bez cech niedrożności aorty oraz pozostałych ocenianych naczyń tętniczych.\nBez płynu w worku osierdziowym.\n\nKlatka piersiowa:\nPłuca prawidłowe, prawidłowo powietrzne. Bez płynu w jamach opłucnowych.\nŚródpiersie bez istotnych odchyleń.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nJama brzuszna i miednica:\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nZ uwagi na wczesną fazę kontrastową czułość badania w wykrywaniu zmian ogniskowych narządów miąższowych jest ograniczona. Narządy miąższowe jamy brzusznej bez istotnych odchyleń. Bez złogów w układzie moczowym.\nPętle jelita cienkiego i grubego bez istotnych zmian patologicznych.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech rozwarstwienia i bez cech tętniaka aorty.\n- Nie uwidoczniono innej patologii mogącej tłumaczyć zgłaszane objawy."
  },
  {
    "id": "aorta_thoracic_normal",
    "title": "Normal Aorta Thoracic",
    "group": "Non-trauma",
    "section": "Aorta / Vascular",
    "priority": 2,
    "text": "Badanie: Angio-TK aorty piersiowej\n\nOpis:\nBez cech rozwarstwienia, tętniakowatego poszerzenia i bez cech niedrożności aorty piersiowej oraz pozostałych ocenianych naczyń tętniczych.\nBez płynu w worku osierdziowym.\nŚródpiersie bez istotnych odchyleń.\nPłuca prawidłowe, prawidłowo powietrzne. Bez płynu w jamach opłucnowych.\nW uwidocznionym zakresie nadbrzusza bez istotnych odchyleń.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech rozwarstwienia i bez cech tętniaka aorty piersiowej.\n- Nie uwidoczniono innej patologii mogącej tłumaczyć zgłaszane objawy."
  },
  {
    "id": "aorta_abdominal_normal",
    "title": "Normal Aorta Abdominal",
    "group": "Non-trauma",
    "section": "Aorta / Vascular",
    "priority": 3,
    "text": "Badanie: Angio-TK aorty brzusznej\n\nOpis:\nPodstawy płuc prawidłowe. Bez płynu w jamach opłucnowych.\n\nBez cech rozwarstwienia, tętniaka, pęknięcia i bez cech niedrożności aorty brzusznej oraz pozostałych ocenianych naczyń tętniczych.\nPień trzewny, tętnice nerkowe oraz tętnice krezkowe górna i dolna są drożne.\n\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nZ uwagi na wczesną fazę kontrastową czułość badania w wykrywaniu zmian ogniskowych narządów miąższowych jest ograniczona. Narządy miąższowe jamy brzusznej bez istotnych odchyleń. Bez złogów w układzie moczowym.\nPętle jelita cienkiego i grubego bez istotnych zmian patologicznych.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech pękniętego i bez cech przeciekającego tętniaka aorty brzusznej.\n- Nie uwidoczniono innej patologii mogącej tłumaczyć zgłaszane objawy."
  },
  {
    "id": "ct_chest_abdo_pelvis_trauma_normal",
    "title": "Normal Chest/Abdo/Pelvis TRAUMA",
    "group": "Trauma",
    "section": "Combined",
    "priority": 3,
    "text": "Badanie: TK klatki piersiowej, jamy brzusznej i miednicy - po urazie\n\nOpis:\nKlatka piersiowa:\nBez cech odmy opłucnowej i bez cech krwiaka opłucnowego. Bez cech urazu płuc.\nŚródpiersie bez zmian pourazowych.\nBez płynu w worku osierdziowym.\nNie uwidoczniono złamań mostka, żeber i kręgosłupa piersiowego. Uwidocznione fragmenty łopatek i obojczyków bez cech złamania.\n\nJama brzuszna i miednica:\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nBez cech urazu wątroby, śledziony, trzustki, nadnerczy i nerek. Pęcherzyk żółciowy i drogi żółciowe bez istotnych odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nPęcherz moczowy o prawidłowym zarysie.\nAorta brzuszna i jej główne odgałęzienia bez zmian pourazowych. Bez cech aktywnego wynaczynienia środka kontrastowego.\nBez złamań kręgosłupa lędźwiowego i miednicy.\n\nWnioski:\n- Bez cech zmian pourazowych w obrębie klatki piersiowej i kręgosłupa piersiowego.\n- Bez cech zmian pourazowych w obrębie jamy brzusznej, miednicy i kręgosłupa lędźwiowego."
  },
  {
    "id": "ct_chest_abdo_pelvis_nontrauma_normal",
    "title": "Normal Chest/Abdo/Pelvis NON-TRAUMA",
    "group": "Non-trauma",
    "section": "Combined",
    "priority": 3,
    "text": "Badanie: TK klatki piersiowej, jamy brzusznej i miednicy\n\nOpis:\nKlatka piersiowa:\nPłuca prawidłowe, prawidłowo powietrzne. Bez płynu w jamach opłucnowych.\nŚródpiersie bez istotnych odchyleń.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nJama brzuszna i miednica:\nBez wolnego powietrza i wolnego płynu w jamie brzusznej. Bez zbiorników płynowych w jamie brzusznej i miednicy.\nWątroba, drogi żółciowe, trzustka, śledziona, nerki i nadnercza bez istotnych odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nAorta brzuszna i jej główne odgałęzienia o prawidłowym obrazie.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech ostrej patologii w obrębie klatki piersiowej, jamy brzusznej i miednicy."
  },
  {
    "id": "ct_abdo_pelvis_trauma_normal_v2",
    "title": "Normal Abdo/Pelvis TRAUMA",
    "group": "Trauma",
    "section": "Abdomen / Pelvis",
    "priority": 2,
    "text": "Badanie: TK jamy brzusznej i miednicy - po urazie\n\nOpis:\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nBez cech urazu wątroby, śledziony, trzustki, nadnerczy i nerek. Pęcherzyk żółciowy i drogi żółciowe bez istotnych odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nPęcherz moczowy o prawidłowym zarysie.\nAorta brzuszna i jej główne odgałęzienia bez zmian pourazowych. Bez cech aktywnego wynaczynienia środka kontrastowego.\nPodstawy płuc prawidłowe. Uwidocznione dolne żebra bez cech złamania.\nBez złamań kręgosłupa lędźwiowego i miednicy.\n\nWnioski:\n- Bez cech zmian pourazowych w obrębie jamy brzusznej, miednicy i kręgosłupa lędźwiowego."
  },
  {
    "id": "ct_abdo_pelvis_nontrauma_normal_v2",
    "title": "Normal Abdo/Pelvis NON-TRAUMA",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 5,
    "text": "Badanie: TK jamy brzusznej i miednicy\n\nOpis:\nPodstawy płuc prawidłowe. Bez płynu w jamach opłucnowych.\n\nBez wolnego powietrza i wolnego płynu w jamie brzusznej. Bez zbiorników płynowych w jamie brzusznej i miednicy.\nWątroba, pęcherzyk żółciowy, drogi żółciowe, trzustka, śledziona, nerki i nadnercza bez istotnych odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nAorta brzuszna i jej główne odgałęzienia o prawidłowym obrazie.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech ostrej patologii w obrębie jamy brzusznej i miednicy."
  },
  {
    "id": "ct_kub_normal_v2",
    "title": "Normal CT KUB",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 6,
    "text": "Badanie: TK jamy brzusznej i miednicy bez kontrastu - w kierunku kamicy układu moczowego\n\nOpis:\nBez cech wodonercza i bez poszerzenia moczowodów. Nie uwidoczniono złogów w układzie moczowym. Bez cech zatarcia tłuszczu okołonerkowego.\nNerki o prawidłowym obrazie w badaniu bez kontrastu.\n\nWątroba, drogi żółciowe, trzustka, śledziona i nadnercza bez istotnych odchyleń w badaniu bez kontrastu.\nPętle jelita cienkiego i grubego bez cech patologii.\nAorta brzuszna i jej główne odgałęzienia bez istotnych odchyleń w badaniu bez kontrastu.\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nPodstawy płuc prawidłowe. Bez płynu w jamach opłucnowych.\nW oknie kostnym bez istotnych zmian patologicznych.\n\nWnioski:\n- Bez cech ostrej patologii w badaniu bez kontrastu."
  },
  {
    "id": "ct_total_body_trauma_normal",
    "title": "Normal Total Body TRAUMA",
    "group": "Trauma",
    "section": "Combined",
    "priority": 4,
    "text": "Badanie: TK urazowe całego ciała\n\nOpis:\nGłowa:\nBez cech krwawienia śródczaszkowego i bez cech obrzęku mózgu. Bez zbiorników zewnątrzosiowych i bez zmian ogniskowych powodujących efekt masy. Bez cech świeżych zmian niedokrwiennych.\nUkład komorowy i przestrzenie płynowe przymózgowe w granicach normy.\nBez cech złamania kości sklepienia i podstawy czaszki.\nKomórki wyrostków sutkowatych oraz zatoki przynosowe prawidłowo powietrzne.\n\nKręgosłup szyjny:\nPrawidłowy obraz połączenia czaszkowo-szyjnego.\nPrawidłowe ustawienie trzonów kręgów oraz stawów międzywyrostkowych, bez cech zwichnięcia.\nTrzony kręgów o zachowanej wysokości.\nNie uwidoczniono złamań.\nOtaczające tkanki miękkie bez istotnych zmian pourazowych.\n\nKlatka piersiowa:\nBez cech odmy opłucnowej i bez cech krwiaka opłucnowego. Bez cech urazu płuc.\nŚródpiersie bez zmian pourazowych.\nBez płynu w worku osierdziowym.\nNie uwidoczniono złamań mostka, żeber i kręgosłupa piersiowego. Uwidocznione fragmenty łopatek i obojczyków bez cech złamania.\n\nJama brzuszna i miednica:\nBez wolnego powietrza i wolnego płynu w jamie brzusznej.\nBez cech urazu wątroby, śledziony, trzustki, nadnerczy i nerek. Pęcherzyk żółciowy i drogi żółciowe bez istotnych odchyleń.\nPętle jelita cienkiego i grubego bez cech patologii.\nPęcherz moczowy o prawidłowym zarysie.\nAorta brzuszna i jej główne odgałęzienia bez zmian pourazowych. Bez cech aktywnego wynaczynienia środka kontrastowego.\nBez złamań kręgosłupa lędźwiowego i miednicy.\n\nWnioski:\n1. Bez wewnątrzczaszkowych zmian pourazowych i bez złamania kości czaszki.\n2. Bez cech świeżego złamania lub zwichnięcia kręgosłupa szyjnego.\n3. Bez cech zmian pourazowych w obrębie klatki piersiowej i kręgosłupa piersiowego.\n4. Bez cech zmian pourazowych w obrębie jamy brzusznej, miednicy i kręgosłupa lędźwiowego."
  },
  {
    "id": "mr_ls_spine_normal",
    "title": "MR L-S spine normal",
    "group": "Non-trauma",
    "section": "Spine",
    "priority": 5,
    "text": "Badanie: MR kręgosłupa lędźwiowo-krzyżowego bez kontrastu\n\nOpis:\nBadanie wykonano w sekwencjach T1-, T2-zależnych i STIR, w płaszczyznach strzałkowej i poprzecznej.\n\nLordoza lędźwiowa zachowana. Ustawienie trzonów kręgowych prawidłowe.\nTrzony kręgowe prawidłowej wysokości, o prawidłowym sygnale szpiku kostnego.\nKrążki międzykręgowe prawidłowej wysokości, bez cech przepuklin.\nKanał kręgowy o prawidłowej szerokości. Otwory międzykręgowe drożne.\nStożek rdzeniowy prawidłowo położony, o prawidłowym sygnale.\nStawy międzywyrostkowe bez istotnych zmian zwyrodnieniowych.\nTkanki miękkie przykręgosłupowe bez zmian.\n\nWnioski:\n- Obraz MR kręgosłupa lędźwiowo-krzyżowego bez istotnych odchyleń od normy."
  },
  {
    "id": "us_abdomen_normal",
    "title": "USG Abdomen normal",
    "group": "Non-trauma",
    "section": "Abdomen / Pelvis",
    "priority": 9,
    "text": "Badanie: USG jamy brzusznej\n\nOpis:\nWątroba niepowiększona, o jednorodnej echostrukturze, bez zmian ogniskowych.\nPęcherzyk żółciowy o cienkiej ścianie, bez złogów. Drogi żółciowe nieposzerzone.\nTrzustka w dostępnych ocenie fragmentach bez zmian.\nŚledziona niepowiększona, o jednorodnej echostrukturze.\nNerki prawidłowej wielkości i położenia, z zachowanym zróżnicowaniem korowo-rdzeniowym, bez złogów i bez cech zastoju.\nAorta brzuszna o prawidłowej szerokości.\nPęcherz moczowy o gładkiej ścianie, bez złogów.\nNie stwierdzono wolnego płynu w jamie otrzewnej.\n\nWnioski:\n- Obraz USG jamy brzusznej bez istotnych odchyleń od normy."
  }
];

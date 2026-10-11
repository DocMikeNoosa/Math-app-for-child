// DentList — asystent: polecenie wpisane lub podyktowane („otwórz ząb 36", „dodaj implant 46", „pokaż skargi",
// „gdzie zmienić podpis") → akcja w aplikacji. Najpierw szybkie dopasowanie lokalne (bez AI, bez wysyłania danych),
// a gdy polecenie jest nietypowe — AI (dane pacjentów zanonimizowane) wybiera akcję z listy.
import { PROCS, SPECS } from './specs.js';

export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\s+/g, ' ').trim();

export const VIEWS = { visit: 'Wizyta (schemat zębów)', patients: 'Pacjenci', referrers: 'Lekarze kierujący', settings: 'Ustawienia', complaints: 'Skargi i pisma', clinic: 'Przegląd placówki (wszyscy lekarze)', admin: 'Administracja gabinetu' };
export const SECTIONS = { doctor: 'Lekarz i gabinet (nagłówek, podpis, logo, specjalność)', ai: 'Asystent AI (klucz API)', sync: 'Synchronizacja', backup: 'Folder i kopie zapasowe', security: 'Bezpieczeństwo (hasło, klucz dostępu, blokada)', rodo: 'Ochrona danych (RODO, rejestr zdarzeń)', clinic: 'Gabinet (zespół, zaproszenia)', app: 'Aplikacja (instalacja, wersja)' };
/** Settings section → text of its header (to scroll to it). */
export const SECTION_HEAD = { doctor: 'Lekarz i gabinet', ai: 'Asystent AI', sync: 'Synchronizacja', backup: 'Folder i kopie zapasowe', security: 'Bezpieczeństwo', rodo: 'Ochrona danych', clinic: 'Gabinet', app: 'Aplikacja' };

// everyday words for procedures (normalised) → procedure key; 'ENDO' opens the root canal step
const PROC_WORDS = [
  [/leczenie kanalow|kanalow|endodon|re-?endo|ponowne leczenie/, 'ENDO'], [/dlutowan|zatrzyman|osemk/, 'IMPACT'], [/ekstrakc|usun\w* zab|wyrwa|wyrwij/, 'EXT'],
  [/implant/, 'IMPLANT'], [/sinus|zatok/, 'SINUS'], [/augmentac|gbr/, 'GBR'], [/socket/, 'SOCKET'], [/lacznik/, 'ABUT'],
  [/wypelnien|plomb|ubytek|prochnic/, 'FILL'], [/bonding|diastem/, 'BONDING'], [/odbudow/, 'BUILDUP'], [/opatrunek/, 'TEMPFILL'], [/icon|infiltrac/, 'ICON'],
  [/koron\w* tymczas|tymczasow/, 'TEMPCROWN'], [/koron/, 'CROWN'], [/most/, 'BRIDGE'], [/licowk/, 'VENEER'], [/onlay|inlay|overlay|endokoron/, 'INLAY'], [/wklad/, 'POST'],
  [/protez/, 'DENTURE'], [/szyn\w* (zgryz|relaks)|szyna michigan|bruksizm/, 'SPLINT_OCC'], [/wycisk|skan/, 'IMPRESSION'],
  [/lakowan/, 'SEAL'], [/pulpotom/, 'PULPOT_P'], [/pulpektom/, 'PULPECT_P'], [/sdf/, 'SDF'], [/uraz/, 'TRAUMA'], [/fluoryz|lakier fluor/, 'FLUOR'],
  [/kiretaz otwart|plat/, 'FLAP'], [/kiretaz|srp|wygladzanie korzeni|skaling poddzi/, 'SRP'], [/recesj/, 'RECESSION'], [/gingiwekt|gingiwopl/, 'GINGIVECT'], [/badanie perio|psr|periodontolog/, 'PERIO_DX'],
  [/skaling/, 'SCALE'], [/piaskow|airflow/, 'AIRFLOW'], [/polerow/, 'POLISH'], [/instruktaz/, 'OHI'], [/wybiel/, 'BLEACH'],
  [/zdjeci\w* zamk|odklej|zdjac zamek|zdejm\w* zamek/, 'DEBOND_T'], [/zamek|zamka|bracket\b|rurk\w* policzk|guzik/, 'BRACKET'], [/pierscien/, 'BAND'], [/attachment|atachment|ataczment/, 'ATTACH'], [/stripping|\bipr\b|redukcj\w* szkliw/, 'IPR'], [/trakcj|lancuszek/, 'TRACTION'],
  [/aparat stal|zamki|brackets/, 'FIXED'], [/nakladk|aligner|invisalign/, 'ALIGNERS'], [/aparat ruchom|plytk/, 'REMOVABLE'], [/retencj|retainer/, 'RETAIN'], [/diagnostyk\w* orto|ortodont/, 'ORTHO_DX'],
  [/resekc/, 'APICO_S'], [/biopsj|wycinek/, 'BIOPSY'], [/torbiel/, 'CYST'], [/wedzidel/, 'FREN'], [/nacieci|ropien|ropnia/, 'INCISION'], [/zlamani\w* (zuchw|szczek)/, 'FRACTURE'],
];
const toothRe = /(?:^|\D)([1-4][1-8]|[5-8][1-5])(?!\d)/;
// specialty names in everyday forms (normalised): "profil chirurgiczny", "ortodoncja", "jestem protetykiem"
export const SPEC_WORDS = [[/szczekowo|szczeko-?twarz|maksylo/, 'mfs'], [/endodon/, 'endo'], [/chirurg/, 'chir'], [/implantolog/, 'impl'], [/periodon|paradont/, 'perio'],
  [/protety/, 'prot'], [/ortodon/, 'orto'], [/pedodon|dzieci|pediatr/, 'ped'], [/higien|profilakty/, 'hig'], [/zachowawcz|ogoln\w* stomatolog|stomatologi\w* ogoln|dentyst\w* ogoln/, 'zach']];
const PROFILE_WORDS = /profil|tryb|specjalnos|przelacz|zmien|jestem|byc|ustaw|wlacz|kolor|motyw|widok|ekran|przejdz na|na (?:zakladk|kart)/;
/** Ready commands, also offered as "did you mean…" when a command is not understood. */
export const SUGGESTIONS = ['otwórz ząb 36', 'dodaj implant 46', 'leczenie kanałowe 26', 'dodaj zamek ortodontyczny 13', 'wypełnienie 16', 'korona 21', 'ekstrakcja 38', 'skaling', 'aparat stały',
  'profil chirurgiczny', 'profil ortodontyczny', 'profil endodontyczny', 'nowy pacjent', 'nowa wizyta', 'pokaż pacjentów', 'pokaż skargi', 'nowa skarga', 'lekarze kierujący', 'przegląd placówki',
  'wydrukuj list', 'zapisz pdf', 'wpis do ProDentis', 'wyślij list e-mailem', 'gdzie zmienić podpis', 'kopie zapasowe', 'klucz AI', 'synchronizacja z telefonem', 'zmień hasło', 'zablokuj aplikację'];
const stems = (t) => norm(t).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter((w) => w.length >= 3).map((w) => w.slice(0, 5));
/** The closest ready commands (shared word stems, tolerant of endings and small typos). */
export function suggest(text, n = 3) {
  const a = stems(text); if (!a.length) return [];
  const near = (x, y) => x === y || (x.length >= 4 && y.length >= 4 && (x.startsWith(y.slice(0, 4)) || lev(x, y) <= 1 || (x.slice(0, 3) === y.slice(0, 3) && lev(x, y) <= 2)));
  return SUGGESTIONS.map((c) => { const b = stems(c); return [c, b.filter((y) => a.some((x) => near(x, y))).length / Math.max(1, b.length)]; }).filter(([, sc]) => sc > 0).sort((x, y) => y[1] - x[1]).slice(0, n).map(([c]) => c);
}
function lev(a, b) { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; }

/** Local understanding of a command (no AI). Returns { action, params, reply } or null when unsure. */
export function parseLocal(text) {
  const t = norm(text); if (!t) return null;
  const m = t.match(toothRe), fdi = m ? m[1] : '';
  const has = (re) => re.test(t);
  // specialty profile: "chcę być na profilu chirurgicznym", "przełącz na ortodoncję", "jestem protetykiem", "chirurgia"
  const sw = SPEC_WORDS.find(([re]) => re.test(t));
  if (sw && !fdi && (has(PROFILE_WORDS) || t.split(' ').length <= 2)) {
    const whole = has(/profil|jestem|moj\w* specjalnos|specjalnosc glown|domysl/);
    return { action: 'set_specialty', params: { spec: sw[1], scope: whole ? 'home' : 'auto' }, reply: `${SPECS[sw[1]].label}.` };
  }
  if (has(/^(pomoc|help)$|co (umiesz|potrafisz)|jak (ci )?(uzywac|korzystac)|w czym (mi )?(pomozesz|mozesz pomoc)/)) return { action: 'answer', params: {}, reply: 'Mogę: otworzyć ząb („otwórz ząb 36"), dodać zabieg („implant 46", „zamek 13", „skaling"), zmienić profil specjalności („profil chirurgiczny"), znaleźć pacjenta („pacjentka Kowalska"), otworzyć ekran („skargi", „lekarze kierujący", „ustawienia"), zrobić coś z listem („wydrukuj", „PDF", „ProDentis") albo wskazać, gdzie coś zmienić („gdzie zmienić podpis"). Możesz mówić własnymi słowami.' };
  if (has(/zablokuj|wyloguj|blokad\w* ekranu|zamknij aplikacj/)) return { action: 'lock', params: {}, reply: 'Blokuję aplikację.' };
  if (has(/zmien\w* hasl|nowe haslo/)) return { action: 'settings', params: { section: 'security' }, reply: 'Otwieram bezpieczeństwo — tam zmienisz hasło.' };
  // settings
  if (has(/podpis|logo|naglowek|specjalnosc glown|dane gabinetu/)) return { action: 'settings', params: { section: 'doctor' }, reply: 'Otwieram ustawienia lekarza i gabinetu.' };
  if (has(/klucz (api|ai)|asystent ai|wlacz ai|ustawienia ai/)) return { action: 'settings', params: { section: 'ai' }, reply: 'Otwieram ustawienia AI.' };
  if (has(/kopi\w* zapas|backup|folder/)) return { action: 'settings', params: { section: 'backup' }, reply: 'Otwieram folder i kopie zapasowe.' };
  if (has(/synchroniz|iphone|telefon\w* i komputer/)) return { action: 'settings', params: { section: 'sync' }, reply: 'Otwieram synchronizację.' };
  if (has(/hasl|face ?id|klucz dostepu|blokad/)) return { action: 'settings', params: { section: 'security' }, reply: 'Otwieram ustawienia bezpieczeństwa.' };
  if (has(/rodo|rejestr zdarzen|dane osobowe|eksport danych/)) return { action: 'settings', params: { section: 'rodo' }, reply: 'Otwieram ochronę danych (RODO).' };
  if (has(/zaprosz|zespol|dodaj lekarza|czlonk|personel/)) return { action: 'settings', params: { section: 'clinic' }, reply: 'Otwieram ustawienia gabinetu.' };
  // views and simple actions
  if (has(/skarg|reklamac|kancelari|rzecznik|pismo od/)) return has(/now|dodaj|zarejestr|wplynel/) ? { action: 'new_complaint', params: {}, reply: 'Tworzę nową skargę.' } : { action: 'go', params: { view: 'complaints' }, reply: 'Otwieram skargi.' };
  if (has(/placowk|wszyscy lekarze|wszystkich lekarzy|innego lekarza/)) return { action: 'go', params: { view: 'clinic' }, reply: 'Otwieram przegląd placówki.' };
  if (has(/administrac/)) return { action: 'go', params: { view: 'admin' }, reply: 'Otwieram administrację.' };
  if (has(/kierujac/)) return { action: 'go', params: { view: 'referrers' }, reply: 'Otwieram lekarzy kierujących.' };
  if (has(/ustawien|opcje|konfigurac|preferenc/)) return { action: 'go', params: { view: 'settings' }, reply: 'Otwieram ustawienia.' };
  if (has(/now\w* pacjent/)) return { action: 'new_patient', params: {}, reply: 'Nowy pacjent — wybierz lub dodaj w okienku.' };
  if (has(/now\w* wizyt/)) return { action: 'new_visit', params: {}, reply: 'Nowa wizyta.' };
  if (has(/strona glown|ekran glown|poczatek|home/)) return { action: 'go', params: { view: 'visit' }, reply: 'Strona główna.' };
  // "how do I…" questions about the letter get a short answer instead of an action
  if (/^(a |i )?(jak|czy|co|gdzie|dlaczego|kiedy|w jaki)\b/.test(t) && has(/pdf|druk|e-?mail|prodentis|list/)) return { action: 'answer', params: {}, reply: 'List powstaje z wizyty: przycisk „Generuj list" na dole ekranu wizyty. Na ekranie listu są przyciski: Zapisz PDF, Drukuj, E-mail i ProDentis (wpis do dokumentacji). Możesz też powiedzieć np. „wydrukuj" albo „wpis do ProDentis", gdy list jest otwarty.' };
  if (has(/prodentis/)) return { action: 'letter_action', params: { what: 'prodentis' }, reply: 'Wpis do ProDentis.' };
  if (has(/druk/)) return { action: 'letter_action', params: { what: 'print' }, reply: 'Drukuję list.' };
  if (has(/\bpdf\b/)) return { action: 'letter_action', params: { what: 'pdf' }, reply: 'Zapisuję PDF.' };
  if (has(/e-?mail|wyslij list/)) return { action: 'letter_action', params: { what: 'email' }, reply: 'Wysyłka listu e-mailem.' };
  if (has(/(generuj|napisz|utworz|przygotuj|zrob)\w* list|list do lekarza/)) return { action: 'generate_letter', params: {}, reply: 'Tworzę list.' };
  // procedures (on a tooth, or for the whole mouth)
  const pw = PROC_WORDS.find(([re]) => re.test(t));
  if (pw) {
    const type = pw[1];
    if (type === 'ENDO') return fdi ? { action: 'open_tooth', params: { fdi, step: 'endo' }, reply: `Ząb ${fdi} — leczenie endodontyczne.` } : null;
    const p = PROCS[type];
    if (p?.scope === 'm') return { action: 'add_mouth_procedure', params: { type }, reply: `Dodaję: ${p.label}.` };
    if (fdi) return { action: 'add_procedure', params: { fdi, type }, reply: `Ząb ${fdi}: dodaję „${p.label}".` };
    if (p?.scope === 'b') return { action: 'add_mouth_procedure', params: { type }, reply: `Dodaję: ${p.label}.` };
    return null;
  }
  if (fdi && has(/zab|zeba|otworz|pokaz|karta|^\s*\d\d\s*$/)) return { action: 'open_tooth', params: { fdi }, reply: `Otwieram ząb ${fdi}.` };
  // a patient by name: "pacjent Kowalska", "otwórz Kowalską"
  const pm = String(text).match(/(?:pacjent\p{L}*|kart\p{L}* pacjenta|otwórz|pokaż|znajdź)\s+([A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]{2,}(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}-]{2,})?)/u);
  if (pm) return { action: 'open_patient', params: { query: pm[1] }, reply: `Szukam pacjenta: ${pm[1]}.` };
  if (has(/pacjentow|pacjenci|lista pacjent|pokaz pacjent|kartotek/)) return { action: 'go', params: { view: 'patients' }, reply: 'Otwieram pacjentów.' };
  return null;
}

/** What the AI may choose from (sent with the command). */
export function assistCatalog(ctx) {
  return {
    current_view: ctx.view, current_tooth: ctx.fdi || null, letter_open: !!ctx.letter, is_admin: !!ctx.admin,
    actions: {
      go: 'przejdź do widoku; params.view: ' + Object.keys(VIEWS).join(' | '),
      open_patient: 'otwórz kartę pacjenta; params.query: nazwisko/imię dokładnie jak w poleceniu',
      new_patient: 'nowy pacjent (nowa wizyta + wybór pacjenta)', new_visit: 'nowa wizyta bieżącego pacjenta',
      open_tooth: 'otwórz kartę zęba; params.fdi (FDI, także mleczne 51–85), params.step: anat | dx | endo | work | mat | manual | rec',
      add_procedure: 'dodaj zabieg przy zębie; params.fdi i params.type (klucz z procedures)',
      add_mouth_procedure: 'dodaj zabieg w obrębie jamy ustnej (np. ortodoncja, skaling); params.type',
      generate_letter: 'wygeneruj list do lekarza kierującego z bieżącej wizyty', letter_action: 'na ekranie listu; params.what: pdf | print | email | prodentis',
      settings: 'ustawienia; params.section: ' + Object.keys(SECTIONS).join(' | '), new_complaint: 'zarejestruj nową skargę / pismo',
      set_specialty: 'przełącz specjalność / profil (kolory, kroki karty zęba, zabiegi, materiały); params.spec: ' + Object.keys(SPECS).join(' | ') + '; params.section: "home" gdy lekarz chce zmienić swój profil, inaczej ""',
      lock: 'zablokuj aplikację',
      answer: 'tylko odpowiedź tekstowa (np. pytanie „jak…", „gdzie…") — bez akcji',
    },
    views: VIEWS, settings_sections: SECTIONS, specialties: Object.fromEntries(Object.entries(SPECS).map(([k, v]) => [k, v.label])),
    procedures: Object.fromEntries(Object.entries(PROCS).map(([k, p]) => [k, `${p.label} [${p.scope === 'm' ? 'jama ustna' : p.scope === 't' ? 'ząb' : 'ząb lub jama ustna'}]`])),
  };
}

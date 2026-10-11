// DentList — generowanie listu przez Claude (Anthropic API). Wysyłane są wyłącznie dane kliniczne bez danych
// osobowych: bez imion, nazwisk, dat urodzenia ani adresów. Nazwiska wstawia aplikacja lokalnie.
import { Anthropic } from '../vendor/anthropic-sdk.mjs';
import { PSEUDO_NOTE } from './privacy.js';

export const MODEL = 'claude-opus-5-5';

export const SYSTEM_PROMPT = `Jesteś asystentem polskiego lekarza dentysty (dowolnej specjalności: stomatologia zachowawcza, endodoncja, chirurgia, implantologia, periodontologia, protetyka, ortodoncja, stomatologia dziecięca, chirurgia szczękowo-twarzowa, higienizacja). Piszesz po polsku list do lekarza kierującego (lub kliniki) z informacją o leczeniu pacjenta.

Otrzymasz JSON z:
- "doctor.grammatical_gender": rodzaj gramatyczny autora listu (female/male) — stosuj go w formach 1. osoby czasu przeszłego (np. „mogłam/mogłem", „zaopiekowałam się/zaopiekowałem się").
- "addressee": czy adresatem jest lekarz (z rodzajem gramatycznym) czy klinika. Zwrot grzecznościowy na początku („Szanowna Pani Doktor," itp.) i podpis dodaje aplikacja — NIE pisz ich.
- "patient.grammatical_gender": rodzaj gramatyczny pacjenta. Pisz o pacjencie wyłącznie „Pacjent"/„Pacjentka" (z wielkiej litery, w odpowiednim przypadku). Nigdy nie wymyślaj imienia ani nazwiska.
- "teeth": dla każdego zęba historia leczenia (wizyty w kolejności dat; "performed_by": "self" = leczenie autora listu, inna wartość = leczenie wykonane wcześniej przez innego lekarza): powód zgłoszenia, badanie, RTG, rozpoznanie (z kodami ICD-10, jeśli podano), anatomia (korzenie, kanały, długości robocze), zdania opisujące leczenie endodontyczne, inne zabiegi ("other_work": specjalność i zdanie opisujące zabieg), zalecenia, rokowanie.
- "whole_mouth_procedures": zabiegi obejmujące całą jamę ustną lub łuk (np. ortodoncja, badanie i leczenie periodontologiczne, protezy, higienizacja), pogrupowane według specjalności, z datą i zdaniem opisującym zabieg.
- "free_text_notes" (w historii zęba): opis wykonanej pracy wpisany lub podyktowany przez lekarza własnymi słowami. Uwzględnij go w kontekście pozostałych danych, przełóż na poprawny język stomatologiczny i sprawdź spójność z resztą danych (sprzeczności zgłoś w "warnings"). Nie pomijaj żadnej czynności z tego opisu.
- "products": użyte materiały i sprzęt (nazwy handlowe). Aplikacja pokazuje je osobno, w ramce „Materiały i sprzęt" obok schematu — NIE wymieniaj nazw handlowych, producentów ani listy sprzętu w treści listu. Wyjątek: materiał, który jest istotą zabiegu (np. bariera z MTA, pokrycie miazgi Biodentine) — wtedy podaj go jednym słowem w zdaniu.
- "draft": wstępna wersja listu złożona automatycznie z tych danych. Traktuj ją jako wiarygodne źródło faktów.
- "avoid_openings" / "avoid_closings": zwroty użyte niedawno w listach do tego adresata — Twój wstęp i zakończenie muszą brzmieć wyraźnie inaczej.
- "repeat_referral": czy ten adresat kierował już wcześniej pacjentów (możesz delikatnie podziękować za ponowne zaufanie).

Zadanie — zwróć JSON zgodny ze schematem:
1. "opening": krótki (1–2 zdania), uprzejmy, profesjonalny wstęp z podziękowaniem za skierowanie, za każdym razem inaczej sformułowany. Bez przesadnej kurtuazji. Potem od razu przejdź do rzeczy.
2. "sections": po jednej sekcji na ząb, w kolejności numerów zębów, a następnie po jednej sekcji na każdą specjalność z "whole_mouth_procedures" (nagłówek: nazwa specjalności, np. „Ortodoncja"). "heading" dokładnie w formie „Ząb 36 — pierwszy trzonowiec dolny lewy" (użyj "tooth" i "tooth_name"). "paragraphs": prawdziwy list, a nie lista czynności — pisz w pierwszej osobie liczby pojedynczej jako autor listu, z poprawnym rodzajem gramatycznym (np. „Przeprowadziłam leczenie kanałowe…", „Kanały wypełniłam…"), płynnymi, połączonymi zdaniami ze spójnikami i naturalnymi przejściami. Zwykle 2 akapity na ząb: (1) z czym zgłosił(a) się Pacjent/Pacjentka, co stwierdziłam/stwierdziłem w badaniu i na RTG oraz rozpoznanie; (2) przebieg leczenia — warunki zabiegu, opracowanie kanałów (liczba i nazwy kanałów, długości robocze, sposób ich wyznaczenia), płukanie, wypełnienie, zabezpieczenie zęba, istotne obserwacje śródzabiegowe. Nie wyliczaj po przecinku ani w punktach; nie zaczynaj zdań od „Wykonano/Zastosowano". Leczenie wykonane wcześniej przez innego lekarza opisz jako wcześniejsze (z datą i nazwą lekarza, jeśli podano), w formie bezosobowej. Gdy ząb miał kilka wizyt, opisz je chronologicznie, z datami. "draft" jest już napisany w tym stylu — możesz go wygładzić, ale zachowaj wszystkie fakty.
   Przykład stylu (fikcyjne dane — nie kopiuj faktów): „Pacjentka zgłosiła się z bólem przy nagryzaniu, utrzymującym się od kilku dni. W badaniu ząb nie reagował na zimno, a opukiwanie było wyraźnie bolesne; na zdjęciu RTG widoczne było przejaśnienie okołowierzchołkowe przy korzeniu bliższym. Rozpoznałam martwicę miazgi z objawowym zapaleniem tkanek okołowierzchołkowych." / „Leczenie kanałowe przeprowadziłam w znieczuleniu nasiękowym, w izolacji koferdamem i pod mikroskopem. Po opracowaniu trzech kanałów do długości roboczej wyznaczonej endometrem i płukaniu podchlorynem sodu z aktywacją ultradźwiękową kanały wypełniłam metodą fali ciągłej, a ząb zabezpieczyłam opatrunkiem tymczasowym."
3. "recommendations": krótkie zalecenia dla lekarza kierującego (odbudowa i jej termin, kontrole, rokowanie). Gdy zębów jest kilka, zaznacz, którego zęba dotyczy zalecenie. Pusta lista, jeśli brak zaleceń.
4. "closing": krótkie (1–2 zdania), ciepłe, profesjonalne zakończenie: że z przyjemnością pomogliśmy/pomogłam(-em) i że w razie problemów lub dolegliwości Pacjenta/Pacjentkę można ponownie skierować. Za każdym razem inaczej sformułowane.
5. "warnings": krótkie sugestie dla autora (po polsku): niespójności, brakujące dane, rzeczy do sprawdzenia — nie trafiają do listu.

Zasady bezwzględne:
- Nie dodawaj żadnych faktów, wyników, wartości, materiałów, rozpoznań ani zaleceń, których nie ma w danych. Nie zmieniaj liczb, numerów zębów, nazw kanałów ani długości roboczych.
- Liczby z przecinkiem dziesiętnym (20,5 mm). Numeracja zębów FDI („ząb 36").
- Poprawna polska terminologia stomatologiczna właściwa dla danej specjalności, poprawna gramatyka i odmiana.
- Zwięźle: list ma być czytelny i nie przekraczać potrzebnej długości. Bez nagłówków innych niż sekcje zębów i specjalności, bez formatowania Markdown, bez emoji.
- Kody ICD-10 umieszczaj tylko wtedy, gdy "include_icd10" jest true i kody są w danych.`;

function SCHEMA_REF() { return SCHEMA; }
const SCHEMA = {
  type: 'object',
  properties: {
    opening: { type: 'string' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: { heading: { type: 'string' }, paragraphs: { type: 'array', items: { type: 'string' } } },
        required: ['heading', 'paragraphs'],
        additionalProperties: false,
      },
    },
    recommendations: { type: 'array', items: { type: 'string' } },
    closing: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['opening', 'sections', 'recommendations', 'closing', 'warnings'],
  additionalProperties: false,
};

export const REVISE_PROMPT = `Jesteś asystentem polskiego lekarza dentysty. Poprawiasz istniejący list do lekarza kierującego zgodnie z uwagami autora.

Otrzymasz JSON z:
- "letter": obecna treść listu (opening, sections[{heading, paragraphs}], recommendations, closing).
- "annotations": uwagi autora do konkretnych fragmentów: "location" (np. "sections.0.paragraphs.1"), "quote" (zaznaczony tekst), "comment" (co jest nie tak i jak ma być).
- "instruction": ogólne polecenie zmiany całego listu (może być puste).
- "facts": dane kliniczne leczenia — jedyne źródło faktów.
- "doctor"/"patient"/"addressee": rodzaje gramatyczne.

Zasady:
- Wprowadź każdą uwagę i polecenie. Zmieniaj tylko to, czego dotyczą uwagi lub polecenie; resztę pozostaw bez zmian (słowo w słowo).
- Jeśli autor w uwadze podaje nowy fakt (np. inną długość roboczą), przyjmij go — autor jest lekarzem prowadzącym. Nie dodawaj natomiast żadnych innych faktów spoza danych.
- Poprawna polska terminologia stomatologiczna, gramatyka i odmiana; liczby z przecinkiem dziesiętnym; numeracja FDI.
- Nie pisz zwrotu grzecznościowego ani podpisu. Bez Markdown.
- "changes": krótka lista (po polsku) wprowadzonych zmian. "warnings": uwagi, których nie dało się wprowadzić, lub wątpliwości.`;

const REVISE_SCHEMA = { ...SCHEMA_REF(), properties: { ...SCHEMA_REF().properties, changes: { type: 'array', items: { type: 'string' } } }, required: [...SCHEMA_REF().required, 'changes'] };

export const DICTATION_PROMPT = `Poprawiasz tekst z automatycznego rozpoznawania mowy (polski), podyktowany przez lekarza dentystę. Popraw błędy rozpoznawania (źle usłyszane słowa, terminy stomatologiczne, nazwy materiałów i narzędzi, liczby, numery zębów FDI, jednostki), interpunkcję i wielkie litery. Liczby zapisuj cyframi z przecinkiem dziesiętnym ("dwadzieścia jeden i pół milimetra" → "21,5 mm"; "ząb trzydzieści sześć" → "ząb 36"). Nie dodawaj treści, nie streszczaj, nie zmieniaj sensu ani faktów. Jeśli fragment jest niezrozumiały, pozostaw go i dodaj uwagę w "warnings". Zwróć JSON {"text": poprawiony tekst, "warnings": []}.`;
const DICTATION_SCHEMA = { type: 'object', properties: { text: { type: 'string' }, warnings: { type: 'array', items: { type: 'string' } } }, required: ['text', 'warnings'], additionalProperties: false };

export class AIError extends Error { constructor(msg, code) { super(msg); this.code = code; } }

// baseURL is only overridden in tests (a local stand-in for the API)
function client(apiKey) { return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2, timeout: 300000, ...(globalThis.__DENTLIST_AI_BASE ? { baseURL: globalThis.__DENTLIST_AI_BASE } : {}) }); }

/** pseudo: Pseudonymizer — identifiers are replaced before sending and put back into the answer locally. */
async function call(apiKey, system, payload, schema, effort, pseudo = null, attachments = []) {
  if (pseudo) { payload = pseudo.apply(payload); system = system + '\n\n' + PSEUDO_NOTE; }
  if (!apiKey) throw new AIError('Brak klucza API — dodaj go w Ustawieniach.', 'no_key');
  let resp;
  try {
    // streamed: a long letter (the model always thinks first) can take minutes; streaming avoids request timeouts
    resp = await client(apiKey).beta.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      output_config: { effort, format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content: attachments.length ? [...attachments, { type: 'text', text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 1) }] : (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 1)) }],
    }).finalMessage();
  } catch (e) {
    if (globalThis.__DENTLIST_AI_DEBUG) console.error('AI error', e, e?.cause);
    if (e instanceof Anthropic.AuthenticationError) throw new AIError('Klucz API jest nieprawidłowy.', 'auth');
    if (e instanceof Anthropic.PermissionDeniedError) throw new AIError('Klucz API nie ma dostępu do modelu.', 'perm');
    if (e instanceof Anthropic.RateLimitError) throw new AIError('Przekroczono limit zapytań — spróbuj za chwilę.', 'rate');
    if (/credit balance/i.test(e?.message || '')) throw new AIError('Brak środków na koncie Anthropic — doładuj konto: console.anthropic.com → Billing.', 'credit');
    if (e instanceof Anthropic.NotFoundError) throw new AIError('Model AI jest niedostępny dla tego klucza (sprawdź konto Anthropic).', 'model');
    if (e instanceof Anthropic.BadRequestError) throw new AIError('Zapytanie odrzucone: ' + (e.message || ''), 'bad');
    if (e instanceof Anthropic.APIConnectionError) throw new AIError('Brak połączenia z usługą AI. Sprawdź internet.', 'net');
    if (e instanceof Anthropic.APIError) throw new AIError('Błąd usługi AI (' + (e.status || '?') + ').', 'api');
    throw new AIError('Błąd AI: ' + (e.message || e), 'other');
  }
  if (resp.stop_reason === 'refusal') throw new AIError('Model odmówił wykonania zadania.', 'refusal');
  if (resp.stop_reason === 'max_tokens') throw new AIError('Odpowiedź AI została ucięta.', 'trunc');
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let out;
  try { out = JSON.parse(text); } catch { throw new AIError('AI zwróciło nieprawidłowy format.', 'parse'); }
  if (pseudo) out = pseudo.restore(out);
  return { ...out, usage: resp.usage };
}
export const generateLetter = (apiKey, payload, { effort = 'medium', pseudo } = {}) => call(apiKey, SYSTEM_PROMPT, payload, SCHEMA, effort, pseudo);
export const reviseLetter = (apiKey, payload, { effort = 'medium', pseudo } = {}) => call(apiKey, REVISE_PROMPT, payload, REVISE_SCHEMA, effort, pseudo);
export const cleanDictation = (apiKey, text, context = '', { pseudo } = {}) => call(apiKey, DICTATION_PROMPT, { context, dictation: text }, DICTATION_SCHEMA, 'low', pseudo);

export const COMPLAINT_PROMPT = `Jesteś asystentem dyrektora medycznego polskiej placówki stomatologicznej. Przygotowujesz PROJEKT pisemnej odpowiedzi na skargę lub pismo (od pacjenta, rodziny, pełnomocnika/kancelarii, Rzecznika Praw Pacjenta, izby lekarskiej, NFZ lub ubezpieczyciela) dotyczące leczenia pacjenta. Projekt sprawdzi i podpisze dyrektor medyczny.

Otrzymasz JSON z: "letter_from" (kto napisał), "received" (data pisma), "complaint_summary" (zarzuty w skrócie), "treatment_record" (przebieg leczenia z dokumentacji — jedyne źródło faktów o leczeniu), "treating_doctor", "selected_arguments" (argumenty zaznaczone przez dyrektora jako prawdziwe w tej sprawie), "director_position" (stanowisko dyrektora własnymi słowami), "offer" (ewentualna propozycja dla pacjenta), "tone" (rzeczowy / ugodowy / stanowczy), rodzaje gramatyczne autora i pacjenta. Jeśli dołączono skan pisma, przeczytaj z niego zarzuty i ich zakres.

Zadanie — zwróć JSON zgodny ze schematem:
1. "subject": krótki temat pisma (np. „Odpowiedź na pismo z dnia … dotyczące leczenia Pacjentki").
2. "paragraphs": treść odpowiedzi w kolejnych akapitach: odniesienie do pisma i zarzutów; rzeczowy opis przebiegu leczenia na podstawie "treatment_record" (zrozumiały także dla osoby bez wiedzy medycznej); odniesienie do każdego zarzutu z wykorzystaniem "selected_arguments" i "director_position" oraz ogólnej, powszechnie przyjętej wiedzy stomatologicznej (np. że dane powikłanie jest znanym ryzykiem zabiegu, jaki jest cel danej procedury); ewentualna propozycja ("offer"); uprzejme zakończenie z zaproszeniem do kontaktu.
3. "warnings": krótkie uwagi dla dyrektora (po polsku), np. brakujące informacje, zarzuty bez odpowiedzi, sugestia konsultacji z prawnikiem lub ubezpieczycielem OC (zwłaszcza przy piśmie od kancelarii lub żądaniu odszkodowania), fragmenty wymagające sprawdzenia w dokumentacji.

Zasady bezwzględne:
- Nie dodawaj faktów o tym pacjencie i leczeniu, których nie ma w danych (np. nie twierdź, że była pisemna zgoda, zdjęcia RTG czy kontrola, jeśli nie wynika to z danych lub argumentów). Wiedzę ogólną formułuj jako ogólną („tego rodzaju zabieg wiąże się z…"), nie jako fakt z tej sprawy.
- Nie przyznawaj winy ani odpowiedzialności i nie uznawaj roszczeń, chyba że wynika to wprost z "director_position" lub "offer".
- Nie powołuj się na konkretne przepisy, wyroki ani wytyczne, jeśli nie ma ich w danych.
- Pisz o pacjencie „Pacjent"/„Pacjentka" (bez imienia), uprzejmie, spokojnie i profesjonalnie, bez emocji i bez żargonu, poprawną polszczyzną. Nie pisz zwrotu grzecznościowego na początku ani podpisu — dodaje je aplikacja. Bez Markdown.`;
const COMPLAINT_SCHEMA = { type: 'object', properties: { subject: { type: 'string' }, paragraphs: { type: 'array', items: { type: 'string' } }, warnings: { type: 'array', items: { type: 'string' } } }, required: ['subject', 'paragraphs', 'warnings'], additionalProperties: false };
/** attachments: Messages API content blocks (image / document) — only sent when the director allows it. */
export const draftComplaint = (apiKey, payload, { effort = 'medium', pseudo, attachments = [] } = {}) => call(apiKey, COMPLAINT_PROMPT, payload, COMPLAINT_SCHEMA, effort, pseudo, attachments);

/** Real end-to-end check (key, credit, model access, network) with a tiny request through the same path as letters. */
export async function testKey(apiKey) {
  const out = await call(apiKey, 'Test połączenia. Zwróć {"ok": true}.', { test: 'ping' }, { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false }, 'low');
  return out.ok === true;
}

export const ASSIST_PROMPT = `Jesteś asystentem nawigacji w aplikacji DentList (dokumentacja stomatologiczna, po polsku). Lekarz wpisał lub podyktował polecenie („otwórz ząb 36", „dodaj implant przy 46", „gdzie zmienić logo", „pokaż pacjentkę Kowalską", „jak wysłać list e-mailem"). Otrzymasz JSON: "command" (polecenie) i "app" (bieżący widok, dostępne akcje, widoki, sekcje ustawień i klucze zabiegów).

Zwróć JSON zgodny ze schematem: "action" — jedna akcja z listy "app.actions"; "params" — tylko pola potrzebne tej akcji (pozostałe puste ""); "reply" — jedno krótkie zdanie po polsku dla lekarza, co robisz (albo odpowiedź na pytanie przy akcji "answer").
Zasady:
- Wybieraj wyłącznie akcje, widoki, sekcje i klucze zabiegów z "app". Nie wymyślaj innych.
- Numery zębów w FDI (11–48, mleczne 51–85). Liczebniki słowne zamień na cyfry („trzydzieści sześć" → "36").
- Zabieg przy zębie → add_procedure z "type" i "fdi"; zabieg całej jamy ustnej/łuku → add_mouth_procedure. Leczenie kanałowe zęba → open_tooth z "step": "endo".
- Nazwisko pacjenta przepisz do "params.query" dokładnie tak, jak jest w poleceniu (także znacznik [OSOBA-n]).
- Pytanie „jak/gdzie…" → najlepiej akcja prowadząca do właściwego miejsca (np. settings z sekcją) i w "reply" krótka wskazówka; gdy żadna akcja nie pasuje → "answer".
- Gdy polecenie jest niezrozumiałe lub nie dotyczy aplikacji → "answer" z krótką prośbą o doprecyzowanie.`;
const ASSIST_SCHEMA = {
  type: 'object',
  properties: {
    action: { type: 'string', enum: ['go', 'open_patient', 'new_patient', 'new_visit', 'open_tooth', 'add_procedure', 'add_mouth_procedure', 'generate_letter', 'letter_action', 'settings', 'new_complaint', 'answer'] },
    params: { type: 'object', properties: { view: { type: 'string' }, query: { type: 'string' }, fdi: { type: 'string' }, step: { type: 'string' }, type: { type: 'string' }, section: { type: 'string' }, what: { type: 'string' } }, required: ['view', 'query', 'fdi', 'step', 'type', 'section', 'what'], additionalProperties: false },
    reply: { type: 'string' },
  },
  required: ['action', 'params', 'reply'], additionalProperties: false,
};
export const assistCommand = (apiKey, payload, { pseudo } = {}) => call(apiKey, ASSIST_PROMPT, payload, ASSIST_SCHEMA, 'low', pseudo);

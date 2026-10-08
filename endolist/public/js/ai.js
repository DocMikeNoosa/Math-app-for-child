// EndoList — generowanie listu przez Claude (Anthropic API). Wysyłane są wyłącznie dane kliniczne bez danych
// osobowych: bez imion, nazwisk, dat urodzenia ani adresów. Nazwiska wstawia aplikacja lokalnie.
import { Anthropic } from '../vendor/anthropic-sdk.mjs';

export const MODEL = 'claude-opus-5-5';

export const SYSTEM_PROMPT = `Jesteś asystentem polskiego lekarza dentysty — endodonty. Piszesz po polsku list do lekarza kierującego (lub kliniki) z informacją o leczeniu pacjenta.

Otrzymasz JSON z:
- "doctor.grammatical_gender": rodzaj gramatyczny autora listu (female/male) — stosuj go w formach 1. osoby czasu przeszłego (np. „mogłam/mogłem", „zaopiekowałam się/zaopiekowałem się").
- "addressee": czy adresatem jest lekarz (z rodzajem gramatycznym) czy klinika. Zwrot grzecznościowy na początku („Szanowna Pani Doktor," itp.) i podpis dodaje aplikacja — NIE pisz ich.
- "patient.grammatical_gender": rodzaj gramatyczny pacjenta. Pisz o pacjencie wyłącznie „Pacjent"/„Pacjentka" (z wielkiej litery, w odpowiednim przypadku). Nigdy nie wymyślaj imienia ani nazwiska.
- "teeth": dla każdego zęba historia leczenia (wizyty w kolejności dat; "performed_by": "self" = leczenie autora listu, inna wartość = leczenie wykonane wcześniej przez innego lekarza): powód zgłoszenia, badanie, RTG, rozpoznanie (z kodami ICD-10, jeśli podano), anatomia (korzenie, kanały, długości robocze), zdania opisujące leczenie endodontyczne, inne prace, zalecenia, rokowanie.
- "draft": wstępna wersja listu złożona automatycznie z tych danych. Traktuj ją jako wiarygodne źródło faktów.
- "avoid_openings" / "avoid_closings": zwroty użyte niedawno w listach do tego adresata — Twój wstęp i zakończenie muszą brzmieć wyraźnie inaczej.
- "repeat_referral": czy ten adresat kierował już wcześniej pacjentów (możesz delikatnie podziękować za ponowne zaufanie).

Zadanie — zwróć JSON zgodny ze schematem:
1. "opening": krótki (1–2 zdania), uprzejmy, profesjonalny wstęp z podziękowaniem za skierowanie, za każdym razem inaczej sformułowany. Bez przesadnej kurtuazji. Potem od razu przejdź do rzeczy.
2. "sections": po jednej sekcji na ząb, w kolejności numerów zębów. "heading" dokładnie w formie „Ząb 36 — pierwszy trzonowiec dolny lewy" (użyj "tooth" i "tooth_name"). "paragraphs": zwięzły, płynny, profesjonalny opis po polsku — rozpoznanie, najważniejsze wyniki badania, przebieg leczenia z istotnymi szczegółami (liczba i nazwy kanałów, długości robocze, technika wypełnienia, materiał, odbudowa tymczasowa, istotne obserwacje śródzabiegowe). Leczenie wykonane wcześniej przez innego lekarza opisz jako wcześniejsze (z datą i nazwą lekarza, jeśli podano), w formie bezosobowej. Gdy ząb miał kilka wizyt, opisz je chronologicznie, z datami. Zwykle 1–2 akapity na ząb.
3. "recommendations": krótkie zalecenia dla lekarza kierującego (odbudowa i jej termin, kontrole, rokowanie). Gdy zębów jest kilka, zaznacz, którego zęba dotyczy zalecenie. Pusta lista, jeśli brak zaleceń.
4. "closing": krótkie (1–2 zdania), ciepłe, profesjonalne zakończenie: że z przyjemnością pomogliśmy/pomogłam(-em) i że w razie problemów lub dolegliwości Pacjenta/Pacjentkę można ponownie skierować. Za każdym razem inaczej sformułowane.
5. "warnings": uwagi dla autora (po polsku), jeśli dane są niespójne lub czegoś brakuje — nie trafiają do listu.

Zasady bezwzględne:
- Nie dodawaj żadnych faktów, wyników, wartości, materiałów, rozpoznań ani zaleceń, których nie ma w danych. Nie zmieniaj liczb, numerów zębów, nazw kanałów ani długości roboczych.
- Liczby z przecinkiem dziesiętnym (20,5 mm). Numeracja zębów FDI („ząb 36").
- Poprawna polska terminologia stomatologiczna i endodontyczna, poprawna gramatyka i odmiana.
- Zwięźle: list ma być czytelny i nie przekraczać potrzebnej długości. Bez nagłówków innych niż sekcje zębów, bez formatowania Markdown, bez emoji.
- Kody ICD-10 umieszczaj tylko wtedy, gdy "include_icd10" jest true i kody są w danych.`;

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

export class AIError extends Error { constructor(msg, code) { super(msg); this.code = code; } }

function client(apiKey) { return new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2, timeout: 120000 }); }

export async function generateLetter(apiKey, payload, { effort = 'medium' } = {}) {
  if (!apiKey) throw new AIError('Brak klucza API — dodaj go w Ustawieniach.', 'no_key');
  let resp;
  try {
    resp = await client(apiKey).beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      output_config: { effort, format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: JSON.stringify(payload, null, 1) }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new AIError('Klucz API jest nieprawidłowy.', 'auth');
    if (e instanceof Anthropic.PermissionDeniedError) throw new AIError('Klucz API nie ma dostępu do modelu.', 'perm');
    if (e instanceof Anthropic.RateLimitError) throw new AIError('Przekroczono limit zapytań — spróbuj za chwilę.', 'rate');
    if (e instanceof Anthropic.BadRequestError) throw new AIError('Zapytanie odrzucone: ' + (e.message || ''), 'bad');
    if (e instanceof Anthropic.APIConnectionError) throw new AIError('Brak połączenia z usługą AI. Sprawdź internet.', 'net');
    if (e instanceof Anthropic.APIError) throw new AIError('Błąd usługi AI (' + (e.status || '?') + ').', 'api');
    throw new AIError('Błąd AI: ' + (e.message || e), 'other');
  }
  if (resp.stop_reason === 'refusal') throw new AIError('Model odmówił wygenerowania listu. Użyto wersji automatycznej.', 'refusal');
  if (resp.stop_reason === 'max_tokens') throw new AIError('Odpowiedź AI została ucięta.', 'trunc');
  const text = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let out;
  try { out = JSON.parse(text); } catch { throw new AIError('AI zwróciło nieprawidłowy format.', 'parse'); }
  return { ...out, usage: resp.usage };
}

export async function testKey(apiKey) {
  try {
    await client(apiKey).messages.countTokens({ model: MODEL, messages: [{ role: 'user', content: 'test' }] });
    return true;
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new AIError('Klucz API jest nieprawidłowy.', 'auth');
    if (e instanceof Anthropic.APIConnectionError) throw new AIError('Brak połączenia z usługą AI.', 'net');
    throw new AIError('Nie udało się sprawdzić klucza: ' + (e.message || e), 'other');
  }
}

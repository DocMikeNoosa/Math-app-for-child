// EndoList — test połączenia z Claude API przez prawdziwy SDK (bez klucza): lokalny serwer udaje API Anthropic
// (strumień SSE), sprawdzamy wysyłane zapytanie i obsługę odpowiedzi/błędów. Uruchom: node test/ai-sdk.mjs
import http from 'node:http';
let failures = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) failures++; };

let mode = 'ok', last = null;
const sse = (res, events) => { res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }); for (const [ev, data] of events) res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`); res.end(); };
const server = http.createServer((req, res) => {
  let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => {
    last = { url: req.url, headers: req.headers, body: JSON.parse(body || '{}') };
    if (mode === 'auth') { res.writeHead(401, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } })); }
    const answer = mode === 'letter'
      ? { opening: 'Dziękuję za skierowanie [OSOBA-1].', sections: [{ heading: 'Ząb 36 — pierwszy trzonowiec dolny lewy', paragraphs: ['Przeprowadziłam leczenie kanałowe.'] }], recommendations: [], closing: 'Pozdrawiam.', warnings: [] }
      : { text: 'Usunięto stary wkład.', warnings: [] };
    const text = JSON.stringify(answer), stop = mode === 'refusal' ? 'refusal' : 'end_turn';
    sse(res, [
      ['message_start', { type: 'message_start', message: { id: 'msg_test', type: 'message', role: 'assistant', model: last.body.model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 50, output_tokens: 1 } } }],
      ['content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '', signature: '' } }],
      ['content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'Analiza danych…' } }],
      ['content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'sig' } }],
      ['content_block_stop', { type: 'content_block_stop', index: 0 }],
      ...(mode === 'refusal' ? [] : [
        ['content_block_start', { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } }],
        ['content_block_delta', { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: text.slice(0, 20) } }],
        ['content_block_delta', { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: text.slice(20) } }],
        ['content_block_stop', { type: 'content_block_stop', index: 1 }],
      ]),
      ['message_delta', { type: 'message_delta', delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 120 } }],
      ['message_stop', { type: 'message_stop' }],
    ]);
  });
});
await new Promise((r) => server.listen(4193, '127.0.0.1', r));
globalThis.__ENDOLIST_AI_BASE = 'http://127.0.0.1:4193'; globalThis.__ENDOLIST_AI_DEBUG = !!process.env.DEBUG;
const { generateLetter, cleanDictation, AIError } = await import('../public/js/ai.js');
const { Pseudonymizer } = await import('../public/js/privacy.js');

// 1) letter
mode = 'letter';
const pseudo = new Pseudonymizer({ people: [{ first: 'Anna', last: 'Kowalska' }] });
const out = await generateLetter('sk-ant-test-key', { teeth: [{ tooth: '36', history: [{ free_text_notes: 'Pacjentka Anna Kowalska, ząb 36' }] }] }, { effort: 'medium', pseudo });
ok(out.sections?.[0]?.paragraphs?.[0] === 'Przeprowadziłam leczenie kanałowe.', 'letter parsed from the streamed answer (thinking block skipped)');
ok(out.opening === 'Dziękuję za skierowanie Anna Kowalska.', 'pseudonym token restored locally in the answer');
const b = last.body, h = last.headers;
ok(last.url.startsWith('/v1/messages'), 'endpoint /v1/messages: ' + last.url);
ok(b.model === 'claude-opus-5-5' && b.stream === true && b.max_tokens === 32000, 'model claude-opus-5-5, streamed, max_tokens 32000');
ok(b.output_config?.format?.type === 'json_schema' && b.output_config.effort === 'medium' && b.fallbacks === 'default', 'structured output (json_schema), effort, server-side fallbacks');
ok(String(h['anthropic-beta']).includes('server-side-fallback-2026-07-01'), 'beta header: ' + h['anthropic-beta']);
ok(h['x-api-key'] === 'sk-ant-test-key' && h['anthropic-version'] && h['anthropic-dangerous-direct-browser-access'] === 'true', 'auth + version + browser headers sent');
ok(!JSON.stringify(b.messages).includes('Kowalska') && JSON.stringify(b.messages).includes('[OSOBA-1]'), 'patient name never sent (pseudonymised)');
ok(b.system?.[0]?.cache_control?.type === 'ephemeral', 'system prompt cached');

// 2) dictation clean-up
mode = 'dict';
const d = await cleanDictation('sk-ant-test-key', 'usunięto stary wkład', 'test');
ok(d.text === 'Usunięto stary wkład.', 'dictation clean-up works');

// 3) errors become clear Polish messages
mode = 'auth';
try { await generateLetter('bad-key', { teeth: [] }); ok(false, 'bad key should fail'); } catch (e) { ok(e instanceof AIError && e.code === 'auth' && /nieprawidłowy/.test(e.message), 'wrong key → "Klucz API jest nieprawidłowy."'); }
mode = 'refusal';
try { await generateLetter('sk-ant-test-key', { teeth: [] }); ok(false, 'refusal should fail'); } catch (e) { ok(e.code === 'refusal', 'refusal handled'); }
server.close();
try { await generateLetter('sk-ant-test-key', { teeth: [] }); ok(false, 'no server should fail'); } catch (e) { ok(e.code === 'net', 'no internet → "Brak połączenia z usługą AI"'); }
console.log(failures ? `\n${failures} FAILED` : '\nALL PASSED');
process.exit(failures ? 1 : 0);

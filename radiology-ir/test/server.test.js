// End-to-end test of the server and the Claude call path against a mock Anthropic API.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock;
let mockUrl;
let lastRequest = null;
let nextReply = null;
const requests = [];

let app;
let appUrl;

before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      lastRequest = { url: req.url, headers: req.headers, body: JSON.parse(body) };
      const { status = 200, json } = Array.isArray(nextReply) ? nextReply.shift() : nextReply;
      requests.push(lastRequest);
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(json));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  mockUrl = `http://127.0.0.1:${mock.address().port}`;

  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = mockUrl;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.CLAUDE_EFFORT;
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  appUrl = `http://127.0.0.1:${app.address().port}`;
});

after(() => {
  app?.close();
  mock?.close();
});

function message(text, stop_reason = 'end_turn') {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-opus-5-5',
    content: [{ type: 'text', text }],
    stop_reason,
    stop_sequence: null,
    usage: { input_tokens: 10, output_tokens: 10 },
  };
}

// The user turn is two JSON content blocks (cached template + per-request part).
const payloadOf = (body) => Object.assign({}, ...body.messages[0].content.map((c) => JSON.parse(c.text)));
const editsReply = (edits, conclusion, warnings = []) => ({ json: message(JSON.stringify({ edits, conclusion, warnings })) });

const post = (body) =>
  fetch(`${appUrl}/api/format`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('status reports AI availability', async () => {
  const res = await fetch(`${appUrl}/api/status`);
  const data = await res.json();
  assert.equal(data.ai, true);
  assert.equal(data.model, 'claude-opus-5-5');
  assert.match(data.version, /^\d+\.\d+\.\d+$/);
  assert.ok(data.dir.endsWith('radiology-ir'));
});

test('serves the app and blocks path traversal', async () => {
  const res = await fetch(`${appUrl}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /RadVox IR/);
  const js = await fetch(`${appUrl}/js/app.js`);
  assert.match(js.headers.get('content-type'), /javascript/);
  const bad = await fetch(`${appUrl}/..%2fserver.js`);
  assert.notEqual(bad.status, 200);
});

test('format: sends a well-formed Claude request; procedure safety net (no re-ordering, missing values, empty conclusion)', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  // Claude fills the access line and adds a step, but (deliberately, for this test) returns no conclusion.
  nextReply = editsReply(
    [
      { op: 'replace', target: 'Dostęp: przez kielich … grupy … nerki, w ułożeniu na brzuchu.', text: 'Dostęp: przez kielich dolnej grupy prawej nerki, w ułożeniu na brzuchu.', reason: 'dyktat' },
      { op: 'insert', target: 'Przebieg zabiegu:', text: 'Pobrano mocz na posiew.', reason: '' },
    ],
    '',
    ['Nie podano rozmiaru cewnika.'],
  );
  const res = await post({ templateId: 'nv_nephrostomy', report, dictation: 'dostęp przez kielich dolny prawej nerki, mocz na posiew', instruction: '', style: 'Wnioski numeruj.' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));

  // request shape
  assert.equal(lastRequest.url, '/v1/messages?beta=true');
  assert.equal(lastRequest.headers['x-api-key'], 'test-key');
  assert.match(lastRequest.headers['anthropic-beta'], /server-side-fallback-2026-07-01/);
  const b = lastRequest.body;
  assert.equal(b.model, 'claude-opus-5-5');
  assert.equal(b.fallbacks, 'default');
  assert.equal(b.output_config.format.type, 'json_schema');
  assert.deepEqual(b.output_config.format.schema.required, ['edits', 'conclusion', 'warnings'], 'dictation uses the short edits format');
  assert.equal(b.output_config.effort, 'low', 'default mode is fast');
  assert.ok(!('speed' in b));
  assert.match(b.system[0].text, /CROSS-CHECK/);
  assert.match(b.system[0].text, /INTERVENTIONAL RADIOLOGY PROCEDURE REPORTS/);
  assert.deepEqual(b.system[0].cache_control, { type: 'ephemeral' }, 'instructions are cached');
  assert.deepEqual(b.messages[0].content[0].cache_control, { type: 'ephemeral' }, 'template block is cached');
  assert.ok(!('betas' in b), 'betas go in the header, not the body');
  const userPayload = payloadOf(b);
  assert.equal(userPayload.output_mode, 'edits');
  assert.equal(userPayload.template.body, tpl.body);
  assert.equal(userPayload.style_preferences, 'Wnioski numeruj.');

  const l = data.report.body.split('\n');
  assert.equal(l[0], 'Wskazanie: …', 'the labelled lines keep their order (nothing moved to the top)');
  assert.ok(l.includes('Dostęp: przez kielich dolnej grupy prawej nerki, w ułożeniu na brzuchu.'));
  assert.equal(l[l.indexOf('Przebieg zabiegu:') + 1], 'Pobrano mocz na posiew.', 'inserted where the AI said');
  assert.match(data.report.body, /Kontrolna pielografia potwierdziła prawidłowe położenie cewnika/, 'template statements are not pruned automatically');
  assert.equal(data.report.conclusion, tpl.conclusion, 'an empty AI conclusion keeps the current one');
  assert.ok(data.warnings.includes('Nie podano rozmiaru cewnika.'));
  const missing = data.warnings.find((w) => w.startsWith('Uzupełnij'));
  assert.match(missing, /sprzęt/);
  assert.match(missing, /kontrast \/ czas fluoroskopii \/ dawka/);
  assert.doesNotMatch(missing, /dostęp/, 'the access line was filled');
});

test('format: refusal and auth errors become readable messages', async () => {
  const report = reportFromTemplate(getTemplate('nv_nephrostomy'));
  nextReply = { json: message('', 'refusal') };
  let res = await post({ templateId: 'nv_nephrostomy', report, dictation: 'x' });
  assert.equal(res.status, 422);

  nextReply = { status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } };
  res = await post({ templateId: 'nv_nephrostomy', report, dictation: 'x' });
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /klucz API/);
});

test('format: input validation', async () => {
  const report = reportFromTemplate(getTemplate('nv_nephrostomy'));
  assert.equal((await post({ templateId: 'nope', report, dictation: 'x' })).status, 400);
  assert.equal((await post({ templateId: 'nv_nephrostomy', report: { header: 1 }, dictation: 'x' })).status, 400);
  assert.equal((await post({ templateId: 'nv_nephrostomy', report, dictation: '  ' })).status, 400);
  const bad = await fetch(`${appUrl}/api/format`, { method: 'POST', body: '{not json' });
  assert.equal(bad.status, 400);
});

test('format: English dictation → Polish report, with fidelity check', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  // Simulated model mistake: drops "5" and the side.
  nextReply = {
    ...editsReply([{ op: 'insert', target: 'TOP', text: 'W moczowodzie złóg.', reason: '' }], '- Złóg w moczowodzie.'),
  };
  const res = await post({ templateId: tpl.id, report, dictation: 'left ureteric stone 5 mm', inputLang: 'en', outputLang: 'pl' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  const payload = payloadOf(lastRequest.body);
  assert.equal(payload.input_language, 'en');
  assert.equal(payload.output_language, 'pl');
  assert.equal(payload.task, 'merge');
  assert.match(lastRequest.body.system[0].text, /LANGUAGES/);
  assert.equal(data.report.lang, 'pl');
  assert.ok(data.warnings.some((w) => w.includes('5')), JSON.stringify(data.warnings));
  assert.ok(data.warnings.some((w) => w.includes('lewą')));
});

test('format: translate task needs no dictation and returns an English report', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  nextReply = {
    json: message(JSON.stringify({ header: 'Procedure: Percutaneous nephrostomy', body: 'Indication: hydronephrosis.\nTarget: right kidney.', conclusion: '- Successful right nephrostomy.', corrections: [{ removed: 'x', replacement: '', reason: 'y' }], warnings: [] })),
  };
  const res = await post({ templateId: tpl.id, report, translate: true, outputLang: 'en' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(payloadOf(lastRequest.body).task, 'translate');
  assert.equal(data.report.lang, 'en');
  assert.equal(data.report.header, 'Procedure: Percutaneous nephrostomy');
  assert.deepEqual(data.corrections, [], 'a translation never reports corrections');
});

test('format: unknown language values fall back to Polish', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  nextReply = editsReply([], report.conclusion);
  await post({ templateId: tpl.id, report, dictation: 'x', inputLang: 'de', outputLang: '<script>' });
  const payload = payloadOf(lastRequest.body);
  assert.equal(payload.input_language, 'pl');
  assert.equal(payload.output_language, 'pl');
});

test('format: speed modes — accurate uses medium effort, turbo uses fast output mode', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  const ok = () => editsReply([], report.conclusion);
  nextReply = ok();
  await post({ templateId: tpl.id, report, dictation: 'x', mode: 'accurate' });
  assert.equal(lastRequest.body.output_config.effort, 'medium');
  nextReply = ok();
  await post({ templateId: tpl.id, report, dictation: 'x', mode: 'turbo' });
  assert.equal(lastRequest.body.speed, 'fast');
  assert.match(lastRequest.headers['anthropic-beta'], /fast-mode-2026-02-01/);
  assert.match(lastRequest.headers['anthropic-beta'], /server-side-fallback-2026-07-01/);
});

test('format: turbo falls back to normal speed when rate-limited', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl);
  requests.length = 0;
  nextReply = [
    { status: 429, json: { type: 'error', error: { type: 'rate_limit_error', message: 'fast mode limit' } } },
    editsReply([], report.conclusion),
  ];
  const res = await post({ templateId: tpl.id, report, dictation: 'x', mode: 'turbo' });
  assert.equal(res.status, 200);
  const tries = requests.filter((r) => r.url.startsWith('/v1/messages'));
  assert.equal(tries[0].body.speed, 'fast');
  assert.ok(!('speed' in tries[tries.length - 1].body), 'retried without fast mode');
});

test('format: translation and language changes use the full-report format', async () => {
  const tpl = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(tpl); // Polish report
  nextReply = { json: message(JSON.stringify({ header: 'Examination: CT head', body: 'Findings text.', conclusion: '- Conclusion.', corrections: [], warnings: [] })) };
  await post({ templateId: tpl.id, report, dictation: 'left subdural haematoma', inputLang: 'en', outputLang: 'en' });
  assert.equal(payloadOf(lastRequest.body).output_mode, 'full', 'Polish report → English output needs the full text');
  assert.ok(lastRequest.body.output_config.format.schema.required.includes('body'));
});

test('format: accepts the user\'s own template sent by the browser', async () => {
  const raw = { id: 'custom_9', title: 'Wrist', group: 'Trauma', section: 'Other', text: 'Badanie: TK nadgarstka\n\nOpis:\nKości bez złamań.\n\nWnioski:\n- Bez złamań.' };
  nextReply = editsReply([{ op: 'replace', target: 'Kości bez złamań.', text: 'Złamanie kości łódeczkowatej.', reason: 'dyktat' }], '- Złamanie kości łódeczkowatej.');
  const res = await post({ templateId: 'custom_9', template: raw, report: { header: 'Badanie: TK nadgarstka', body: 'Kości bez złamań.', conclusion: '- Bez złamań.', lang: 'pl' }, dictation: 'złamanie łódeczkowatej' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(payloadOf(lastRequest.body).template.body, 'Kości bez złamań.');
  assert.equal(data.report.body, 'Złamanie kości łódeczkowatej.');
  assert.equal(data.corrections[0].removed, 'Kości bez złamań.');
});

test('format: learned style examples are sent (cleaned) in the cached block; prompt has the procedure rules', async () => {
  const t = getTemplate('nv_nephrostomy');
  nextReply = editsReply([], t.conclusion);
  const styleExamples = [{ ai: 'Wykonano nakłucie.', final: 'Nakłuto.' }, { ai: '', final: 'x' }, 'junk', ...Array.from({ length: 30 }, (_, i) => ({ ai: `a${i}`, final: `b${i}` }))];
  const res = await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'cewnik 8 F', styleExamples });
  assert.equal(res.status, 200);
  const content = lastRequest.body.messages[0].content;
  const cached = JSON.parse(content[0].text);
  assert.equal(cached.style_examples.length, 20);
  assert.deepEqual(cached.style_examples.at(-1), { ai: 'a29', final: 'b29' });
  assert.ok(content[0].cache_control);
  const system = lastRequest.body.system[0].text;
  assert.match(system, /PLACEHOLDERS/);
  assert.match(system, /NEVER fill it with a typical, assumed or invented value/);
  assert.match(system, /TECHNICAL FAILURE OR PARTIAL SUCCESS/);
  assert.match(system, /eTICI/);
  assert.doesNotMatch(system, /Fleischner|TIER 1/, 'no diagnostic emergency rules');
});

test('format: before-treatment findings do not remove after-treatment statements; recommendations stay in the body', async () => {
  const t = getTemplate('nv_nephrostomy');
  const report = reportFromTemplate(t);
  nextReply = editsReply(
    [{ op: 'insert', target: 'Przebieg zabiegu:', text: 'Wstępna pielografia: przeciek środka kontrastowego z miedniczki nerkowej.', reason: '' },
      { op: 'replace', target: 'Zalecenia: kontrola diurezy z nefrostomii i parametrów nerkowych, płukanie cewnika w razie zmniejszenia odpływu, wymiana cewnika co … tygodni.', text: 'Zalecenia: kontrola diurezy, wskazana konsultacja urologiczna.', reason: 'dyktat' }],
    '- Skutecznie założona nefrostomia przezskórna prawej nerki.',
  );
  const res = await post({ templateId: t.id, report, dictation: 'przeciek z miedniczki przed zabiegiem, wskazana konsultacja urologiczna' });
  const data = await res.json();
  assert.match(data.report.body, /Kontrolna pielografia potwierdziła prawidłowe położenie cewnika i swobodny odpływ/);
  assert.match(data.report.body, /Zalecenia: kontrola diurezy, wskazana konsultacja urologiczna\./);
  assert.equal(data.report.conclusion, '- Skutecznie założona nefrostomia przezskórna prawej nerki.');
  assert.ok(!data.corrections.some((c) => c.reason.includes('kontrola automatyczna')));
});

test('format: learned preferences and kept statements reach the AI; prompt has the IR order and complication rules', async () => {
  const t = getTemplate('nv_nephrostomy');
  nextReply = editsReply([], t.conclusion);
  const keep = ['Cewnik ufiksowano do skóry i podłączono do worka.'];
  const learned = { conclusionRemoved: ['Bez powikłań.'], exampleReports: [{ body: 'B', conclusion: 'C' }], junk: 1 };
  const res = await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'cewnik 8 F', learned, keep });
  assert.equal(res.status, 200);
  const content = lastRequest.body.messages[0].content;
  const cached = JSON.parse(content[0].text);
  assert.deepEqual(cached.learned.conclusion_removed, ['Bez powikłań.']);
  assert.deepEqual(cached.learned.example_reports, [{ body: 'B', conclusion: 'C' }]);
  assert.deepEqual(JSON.parse(content[1].text).keep_statements, keep);
  const system = lastRequest.body.system[0].text;
  assert.match(system, /ORDER = CHRONOLOGY/);
  assert.match(system, /BEFORE vs AFTER/);
  assert.match(system, /Never write "bez powikłań" when a complication was dictated/);
});

test('format: a dictated complication replaces "bez powikłań" (AI) and the report keeps it', async () => {
  const t = getTemplate('nv_nephrostomy');
  nextReply = editsReply(
    [{ op: 'replace', target: 'Powikłania: bez powikłań w trakcie zabiegu.', text: 'Powikłania: niewielki krwiak okołonerkowy, bez cech aktywnego krwawienia, leczenie zachowawcze.', reason: 'dyktat' }],
    '- Założono nefrostomię przezskórną prawej nerki.\n- Niewielki krwiak okołonerkowy, leczony zachowawczo.',
  );
  const res = await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'mały krwiak okołonerkowy, leczenie zachowawcze' });
  const data = await res.json();
  assert.match(data.report.body, /Powikłania: niewielki krwiak okołonerkowy/);
  assert.doesNotMatch(data.report.body, /bez powikłań/);
  assert.equal(data.report.conclusion.split('\n').length, 2);
});

test('format: clinical details reach the AI (variable block); prompt says how to use them', async () => {
  const t = getTemplate('nv_nephrostomy');
  nextReply = editsReply([], t.conclusion);
  await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'cewnik 8 F', clinical: 'Wodonercze III st. po prawej, urosepsa' });
  const content = lastRequest.body.messages[0].content;
  assert.equal(JSON.parse(content[1].text).clinical_details, 'Wodonercze III st. po prawej, urosepsa');
  assert.equal(JSON.parse(content[0].text).clinical_details, undefined, 'not in the cached block');
  assert.match(lastRequest.body.system[0].text, /it may fill the "Wskazanie"/);
});

test('learn: style analysis returns rules, phrases and at most 3 questions; input is cleaned', async () => {
  const reply = { rules: ['R1', 'R2'], phrases: [{ situation: 's', preferred: 'p' }], questions: [1, 2, 3, 4].map((i) => ({ question: `Q${i}`, suggestion: `S${i}`, options: [] })), summary: 'ok' };
  nextReply = { json: message(JSON.stringify(reply)) };
  const res = await fetch(`${appUrl}/api/learn`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples: [{ text: 'Bez cech krwawienia wewnątrzczaszkowego.', lang: 'pl' }, { text: '' }], edits: [{ ai: 'a', final: 'b' }], profile: { rules: ['stara reguła'] } }),
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data.rules, ['R1', 'R2']);
  assert.equal(data.questions.length, 3);
  const sent = JSON.parse(lastRequest.body.messages[0].content);
  assert.equal(sent.samples.length, 1);
  assert.deepEqual(sent.current_profile.rules, ['stara reguła']);
  assert.match(lastRequest.body.system, /study how one radiologist/);
});

test('learn: nothing to learn from → 400', async () => {
  const res = await fetch(`${appUrl}/api/learn`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(res.status, 400);
});

test('format: style profile and own samples go into the cached block', async () => {
  const t = getTemplate('nv_nephrostomy');
  nextReply = editsReply([], t.conclusion);
  await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'krwiak', profile: { rules: ['Reguła'], phrases: [{ situation: 's', preferred: 'p' }] }, samples: ['Mój opis.'] });
  const cached = JSON.parse(lastRequest.body.messages[0].content[0].text);
  assert.deepEqual(cached.style_profile.rules, ['Reguła']);
  assert.deepEqual(cached.own_samples, ['Mój opis.']);
});

test('format: English dictation → Polish report carries the glossary and EN→PL examples; Polish dictation does not', async () => {
  const t = getTemplate('nv_nephrostomy');
  const profile = { rules: ['R'], phrases: [], glossary: [{ en: 'subdural haematoma', pl: 'krwiak podtwardówkowy' }] };
  const translations = [{ en: 'small left subdural haematoma 5 mm', pl: 'Niewielki krwiak podtwardówkowy nad lewą półkulą grubości 5 mm.' }];
  nextReply = editsReply([], t.conclusion);
  await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'left subdural haematoma 6 mm', inputLang: 'en', outputLang: 'pl', profile, translations });
  let cached = JSON.parse(lastRequest.body.messages[0].content[0].text);
  assert.deepEqual(cached.glossary, profile.glossary);
  assert.deepEqual(cached.translation_examples, translations);
  assert.match(lastRequest.body.system[0].text, /ENGLISH DICTATION → POLISH REPORT/);
  nextReply = editsReply([], t.conclusion);
  await post({ templateId: t.id, report: reportFromTemplate(t), dictation: 'krwiak', inputLang: 'pl', outputLang: 'pl', profile, translations });
  cached = JSON.parse(lastRequest.body.messages[0].content[0].text);
  assert.equal(cached.glossary, undefined);
  assert.equal(cached.translation_examples, undefined);
});

test('learn: EN→PL pairs count as material; the glossary comes back', async () => {
  nextReply = { json: message(JSON.stringify({ rules: [], phrases: [], questions: [], glossary: [{ en: 'fat stranding', pl: 'pasmowate zagęszczenia tkanki tłuszczowej' }], summary: '' })) };
  const res = await fetch(`${appUrl}/api/learn`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ translations: [{ en: 'fat stranding', pl: 'pasmowate zagęszczenia' }] }) });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.glossary[0].en, 'fat stranding');
  assert.equal(JSON.parse(lastRequest.body.messages[0].content).translations.length, 1);
});

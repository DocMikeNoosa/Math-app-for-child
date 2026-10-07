// End-to-end test of the server and the Claude call path against a mock Anthropic API.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate } from '../public/js/templates.js';

let mock;
let mockUrl;
let lastRequest = null;
let nextReply = null;

let app;
let appUrl;

before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      lastRequest = { url: req.url, headers: req.headers, body: JSON.parse(body) };
      const { status = 200, json } = nextReply;
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(json));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  mockUrl = `http://127.0.0.1:${mock.address().port}`;

  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = mockUrl;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
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

const post = (body) =>
  fetch(`${appUrl}/api/format`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('status reports AI availability', async () => {
  const res = await fetch(`${appUrl}/api/status`);
  assert.deepEqual(await res.json(), { ai: true, model: 'claude-opus-5-5' });
});

test('serves the app and blocks path traversal', async () => {
  const res = await fetch(`${appUrl}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /RadVox/);
  const js = await fetch(`${appUrl}/js/app.js`);
  assert.match(js.headers.get('content-type'), /javascript/);
  const bad = await fetch(`${appUrl}/..%2fserver.js`);
  assert.notEqual(bad.status, 200);
});

test('format: sends a well-formed Claude request and applies the cross-check safety net', async () => {
  const tpl = getTemplate('ct_head_normal');
  const report = reportFromTemplate(tpl);
  // Claude adds the bleed but (deliberately, for this test) forgets to remove "bez cech krwawienia".
  nextReply = {
    json: message(JSON.stringify({
      header: report.header,
      body: report.body + '\nKrwiak podtwardówkowy nad lewą półkulą mózgu grubości 8 mm.',
      conclusion: '- Krwiak podtwardówkowy nad lewą półkulą mózgu (8 mm).',
      corrections: [{ removed: 'x', replacement: '', reason: 'test' }],
      warnings: ['Nie podano wieku krwiaka.'],
    })),
  };
  const res = await post({ templateId: 'ct_head_normal', report, dictation: 'krwiak podtwardówkowy osiem milimetrów', instruction: '', style: 'Wnioski numeruj.' });
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
  assert.deepEqual(b.output_config.format.schema.required, ['header', 'body', 'conclusion', 'corrections', 'warnings']);
  assert.equal(b.output_config.effort, 'medium');
  assert.match(b.system, /CROSS-CHECK/);
  assert.ok(!('betas' in b), 'betas go in the header, not the body');
  const userPayload = JSON.parse(b.messages[0].content);
  assert.equal(userPayload.template.body, tpl.body);
  assert.equal(userPayload.dictation, 'krwiak podtwardówkowy osiem milimetrów');
  assert.equal(userPayload.style_preferences, 'Wnioski numeruj.');

  // safety net removed the contradiction Claude left in
  assert.ok(!/bez cech krwawienia/i.test(data.report.body), data.report.body);
  assert.ok(data.corrections.some((c) => c.reason.includes('kontrola automatyczna')));
  assert.equal(data.report.conclusion, '- Krwiak podtwardówkowy nad lewą półkulą mózgu (8 mm).', "Claude's own conclusion is kept");
  assert.deepEqual(data.warnings, ['Nie podano wieku krwiaka.']);
});

test('format: refusal and auth errors become readable messages', async () => {
  const report = reportFromTemplate(getTemplate('ct_head_normal'));
  nextReply = { json: message('', 'refusal') };
  let res = await post({ templateId: 'ct_head_normal', report, dictation: 'x' });
  assert.equal(res.status, 422);

  nextReply = { status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } };
  res = await post({ templateId: 'ct_head_normal', report, dictation: 'x' });
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /klucz API/);
});

test('format: input validation', async () => {
  const report = reportFromTemplate(getTemplate('ct_head_normal'));
  assert.equal((await post({ templateId: 'nope', report, dictation: 'x' })).status, 400);
  assert.equal((await post({ templateId: 'ct_head_normal', report: { header: 1 }, dictation: 'x' })).status, 400);
  assert.equal((await post({ templateId: 'ct_head_normal', report, dictation: '  ' })).status, 400);
  const bad = await fetch(`${appUrl}/api/format`, { method: 'POST', body: '{not json' });
  assert.equal(bad.status, 400);
});

test('format: English dictation → Polish report, with fidelity check', async () => {
  const tpl = getTemplate('ct_kub_noncontrast');
  const report = reportFromTemplate(tpl);
  // Simulated model mistake: drops "5" and the side.
  nextReply = {
    json: message(JSON.stringify({ header: report.header, body: report.body + '\nW moczowodzie złóg.', conclusion: '- Złóg w moczowodzie.', corrections: [], warnings: [] })),
  };
  const res = await post({ templateId: tpl.id, report, dictation: 'left ureteric stone 5 mm', inputLang: 'en', outputLang: 'pl' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  const payload = JSON.parse(lastRequest.body.messages[0].content);
  assert.equal(payload.input_language, 'en');
  assert.equal(payload.output_language, 'pl');
  assert.equal(payload.task, 'merge');
  assert.match(lastRequest.body.system, /LANGUAGES/);
  assert.equal(data.report.lang, 'pl');
  assert.ok(data.warnings.some((w) => w.includes('5')), JSON.stringify(data.warnings));
  assert.ok(data.warnings.some((w) => w.includes('lewą')));
});

test('format: translate task needs no dictation and returns an English report', async () => {
  const tpl = getTemplate('ct_head_normal');
  const report = reportFromTemplate(tpl);
  nextReply = {
    json: message(JSON.stringify({ header: 'Examination: CT head without contrast', body: 'Acute-care study.\n\nNo focal lesions, no intracranial haemorrhage.', conclusion: '- No acute intracranial pathology.', corrections: [{ removed: 'x', replacement: '', reason: 'y' }], warnings: [] })),
  };
  const res = await post({ templateId: tpl.id, report, translate: true, outputLang: 'en' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(JSON.parse(lastRequest.body.messages[0].content).task, 'translate');
  assert.equal(data.report.lang, 'en');
  assert.equal(data.report.header, 'Examination: CT head without contrast');
  assert.deepEqual(data.corrections, [], 'a translation never reports corrections');
});

test('format: unknown language values fall back to Polish', async () => {
  const tpl = getTemplate('ct_head_normal');
  const report = reportFromTemplate(tpl);
  nextReply = { json: message(JSON.stringify({ header: report.header, body: report.body, conclusion: report.conclusion, corrections: [], warnings: [] })) };
  await post({ templateId: tpl.id, report, dictation: 'x', inputLang: 'de', outputLang: '<script>' });
  const payload = JSON.parse(lastRequest.body.messages[0].content);
  assert.equal(payload.input_language, 'pl');
  assert.equal(payload.output_language, 'pl');
});

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

test('format: sends a well-formed Claude request and merges the result', async () => {
  const tpl = getTemplate('ct-head');
  const report = reportFromTemplate(tpl);
  const aiSections = tpl.sections.map((s) => ({
    id: s.id,
    text: s.id === 'parenchyma' ? 'W prawym płacie czołowym obszar hipodensyjny o wymiarze 12 mm, bez efektu masy. Zróżnicowanie istoty szarej i białej poza tym zachowane.' : s.normal,
  }));
  nextReply = {
    json: message(JSON.stringify({
      technique: report.technique,
      sections: aiSections,
      conclusion: 'Obszar hipodensyjny w prawym płacie czołowym — obraz może odpowiadać przebytemu niedokrwieniu.',
      warnings: ['Nie podano wieku zmiany.'],
    })),
  };
  const res = await post({ templateId: 'ct-head', report, dictation: 'obszar hipodensyjny 12 mm w prawym płacie czołowym', instruction: '', style: 'Wnioski numeruj.' });
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
  assert.deepEqual(b.output_config.format.schema.properties.sections.items.properties.id.enum, tpl.sections.map((s) => s.id));
  assert.equal(b.output_config.effort, 'medium');
  assert.ok(!('betas' in b), 'betas go in the header, not the body');
  const userPayload = JSON.parse(b.messages[0].content);
  assert.equal(userPayload.dictation, 'obszar hipodensyjny 12 mm w prawym płacie czołowym');
  assert.equal(userPayload.style_preferences, 'Wnioski numeruj.');

  // merged result
  assert.deepEqual(data.changed, ['parenchyma']);
  assert.equal(data.conclusionChanged, true);
  assert.equal(data.report.sections[0].text, aiSections[0].text);
  assert.deepEqual(data.warnings, ['Nie podano wieku zmiany.']);
});

test('format: sections missing from the AI reply are kept and flagged', async () => {
  const tpl = getTemplate('ct-chest');
  const report = reportFromTemplate(tpl);
  nextReply = {
    json: message(JSON.stringify({ technique: report.technique, sections: [{ id: 'lungs', text: 'Guzek 6 mm w segmencie 6 płuca prawego.' }], conclusion: report.conclusion, warnings: [] })),
  };
  const data = await (await post({ templateId: 'ct-chest', report, dictation: 'guzek sześć milimetrów w szóstym segmencie płuca prawego' })).json();
  assert.equal(data.report.sections.find((s) => s.id === 'pleura').text, report.sections.find((s) => s.id === 'pleura').text);
  assert.ok(data.warnings.some((w) => w.includes('nie zwróciło sekcji')));
});

test('format: refusal and auth errors become readable messages', async () => {
  const report = reportFromTemplate(getTemplate('ct-head'));
  nextReply = { json: message('', 'refusal') };
  let res = await post({ templateId: 'ct-head', report, dictation: 'x' });
  assert.equal(res.status, 422);

  nextReply = { status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } } };
  res = await post({ templateId: 'ct-head', report, dictation: 'x' });
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /klucz API/);
});

test('format: input validation', async () => {
  const report = reportFromTemplate(getTemplate('ct-head'));
  assert.equal((await post({ templateId: 'nope', report, dictation: 'x' })).status, 400);
  assert.equal((await post({ templateId: 'ct-chest', report, dictation: 'x' })).status, 400, 'report must match template');
  assert.equal((await post({ templateId: 'ct-head', report, dictation: '  ' })).status, 400);
  const bad = await fetch(`${appUrl}/api/format`, { method: 'POST', body: '{not json' });
  assert.equal(bad.status, 400);
});

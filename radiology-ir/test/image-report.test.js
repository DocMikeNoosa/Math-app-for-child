// "Opis z obrazu": image checks, the Claude requests (pick a template, write the report) and the
// server endpoint, against a mock Anthropic API.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getTemplate, reportFromTemplate, TEMPLATES, rawOf } from '../public/js/templates.js';
import { fitSize, dragRect, fileKind, scaleRect } from '../public/js/image-input.js';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

let mock;
let app;
let appUrl;
const requests = [];
let replies = [];

function message(obj, stop_reason = 'end_turn') {
  return { id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify(obj) }], stop_reason, stop_sequence: null, usage: { input_tokens: 10, output_tokens: 10 } };
}

let lib;
before(async () => {
  mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      requests.push({ url: req.url, headers: req.headers, body: JSON.parse(body) });
      const next = replies.shift() || { json: message({}) };
      res.writeHead(next.status || 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(next.json));
    });
  });
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
  delete process.env.CLAUDE_EFFORT;
  lib = await import('../lib/image-report.js');
  const { createServer } = await import('../server.js');
  app = createServer();
  await new Promise((r) => app.listen(0, '127.0.0.1', r));
  appUrl = `http://127.0.0.1:${app.address().port}`;
});
after(() => { app?.close(); mock?.close(); });

const post = (body) => fetch(`${appUrl}/api/image-report`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// ------------------------------------------------------------ browser helpers (pure parts)
test('fitSize: scales down to the AI limits, never enlarges', () => {
  assert.deepEqual(fitSize(800, 600), { w: 800, h: 600, scale: 1 });
  const big = fitSize(4000, 3000);
  assert.ok(big.w * big.h <= 1.15e6 + 5000 && Math.max(big.w, big.h) <= 1568);
  assert.ok(Math.abs(big.w / big.h - 4 / 3) < 0.01, 'keeps the aspect ratio');
  const wide = fitSize(3136, 400);
  assert.equal(wide.w, 1568);
  assert.equal(fitSize(0, 10).w, 0);
});

test('dragRect: any drag direction, clipped to the image, tiny drags ignored', () => {
  assert.deepEqual(dragRect(50, 40, 10, 10, 100, 100), { x: 10, y: 10, w: 40, h: 30 });
  assert.deepEqual(dragRect(-20, -5, 30, 30, 100, 100), { x: 0, y: 0, w: 30, h: 30 });
  assert.deepEqual(dragRect(90, 90, 150, 140, 100, 100), { x: 90, y: 90, w: 10, h: 10 });
  assert.equal(dragRect(10, 10, 12, 40, 100, 100), null);
  assert.deepEqual(scaleRect({ x: 10, y: 20, w: 30, h: 40 }, 0.5), { x: 5, y: 10, w: 15, h: 20 });
});

test('fileKind: images and PDFs accepted, DICOM and others not', () => {
  assert.equal(fileKind({ type: 'image/png', name: 'a.png' }), 'image');
  assert.equal(fileKind({ type: 'image/jpeg', name: 'x' }), 'image');
  assert.equal(fileKind({ type: '', name: 'Zrzut.JPG' }), 'image');
  assert.equal(fileKind({ type: 'application/pdf', name: 'r.pdf' }), 'pdf');
  assert.equal(fileKind({ type: 'application/dicom', name: 'IM0001.dcm' }), null);
  assert.equal(fileKind({ type: 'text/plain', name: 'a.txt' }), null);
});

// ------------------------------------------------------------ server-side checks
test('cleanImages: count, format and size limits with Polish messages', () => {
  assert.throws(() => lib.cleanImages([]), /co najmniej jeden/);
  assert.throws(() => lib.cleanImages(Array(9).fill({ type: 'image/png', data: PNG })), /najwięcej 8/);
  assert.throws(() => lib.cleanImages([{ type: 'image/tiff', data: PNG }]), /nieobsługiwany format/);
  assert.throws(() => lib.cleanImages([{ type: 'image/png', data: 'not base64!' }]), /nieprawidłowe dane/);
  assert.throws(() => lib.cleanImages([{ type: 'image/jpeg', data: 'A'.repeat(7 * 1024 * 1024) }]), /za duży/);
  const ok = lib.cleanImages([{ type: 'image/png', data: `data:image/png;base64,${PNG}` }, { type: 'application/pdf', data: PNG }]);
  assert.equal(ok[0].data, PNG, 'a data: URL prefix is removed');
  assert.equal(ok[1].type, 'application/pdf');
});

test('image request: images labelled in order, PDF as a document, image effort one level higher, report schema', () => {
  const tpl = getTemplate('neuro_coil_ruptured_acom');
  const req = lib.buildImageRequest({ images: [{ type: 'image/png', data: PNG }, { type: 'application/pdf', data: PNG }], template: tpl, note: 'coiling, 4 spirale', clinical: 'SAH', outputLang: 'pl' });
  const c = req.params.messages[0].content;
  assert.deepEqual(c.map((x) => x.type), ['text', 'image', 'text', 'document', 'text']);
  assert.equal(c[0].text, 'Obraz 1:');
  assert.equal(c[1].source.media_type, 'image/png');
  const input = JSON.parse(c[4].text);
  assert.equal(input.template.header, tpl.header);
  assert.equal(input.note, 'coiling, 4 spirale');
  assert.equal(input.current_report, null);
  assert.equal(req.params.output_config.effort, 'medium');
  assert.deepEqual(req.params.output_config.format.schema.required, ['header', 'body', 'conclusion', 'image_readings', 'warnings']);
  assert.equal(lib.buildImageRequest({ images: [{ type: 'image/png', data: PNG }], template: tpl, mode: 'accurate' }).params.output_config.effort, 'high');
  // the safety rules that matter are in the prompt
  for (const rule of [/Never guess a side/, /NEVER copy any personal identifier/, /"ok\."/, /1 F = 0,33 mm/, /Never fill a placeholder with a typical or assumed value/]) assert.match(lib.IMAGE_PROMPT, rule);
});

test('readings become warnings: estimates to check, measured values listed separately', () => {
  const w = lib.readingWarnings([
    { item: 'wymiary tętniaka', value: 'ok. 6 x 4 mm', basis: 'estimated', how: 'względem cewnika 5 F' },
    { item: 'szyja', value: '2,8 mm', basis: 'measured', how: 'linia pomiarowa na obrazie 2' },
  ]);
  assert.equal(w.length, 2);
  assert.match(w[0], /^Oszacowano z obrazu — sprawdź: wymiary tętniaka: ok\. 6 x 4 mm \(względem cewnika 5 F\)/);
  assert.match(w[1], /^Odczytano z pomiarów na obrazie: szyja: 2,8 mm/);
  assert.deepEqual(lib.readingWarnings(null), []);
});

// ------------------------------------------------------------ endpoint, end to end
const REPORT = {
  header: 'Badanie: Embolizacja pękniętego tętniaka AComA spiralami odczepialnymi',
  body: 'Wskazanie: krwotok podpajęczynówkowy z pękniętego tętniaka AComA.\nLokalizacja: tętnica łącząca przednia (AComA)\nPrzebieg zabiegu:\nUwidoczniono tętniak tętnicy łączącej przedniej o wymiarach ok. 6 × 4 mm, szyja ok. 3 mm. W kontrolnej angiografii tętniak zamknięty całkowicie (Raymond-Roy klasa 1).\nZużycie środka kontrastowego: … ml.',
  conclusion: '- Embolizacja pękniętego tętniaka AComA spiralami — całkowite zamknięcie (Raymond-Roy 1).',
  image_readings: [{ item: 'wymiary tętniaka', value: 'ok. 6 × 4 mm', basis: 'estimated', how: 'względem cewnika 5 F' }],
  warnings: ['Strona dostępu nie jest widoczna.'],
};

test('endpoint: with a template → one request; report, readings and missing values come back', async () => {
  requests.length = 0;
  replies = [{ json: message(REPORT) }];
  const res = await post({ images: [{ type: 'image/png', data: PNG }], templateId: 'neuro_coil_ruptured_acom', template: rawOf(getTemplate('neuro_coil_ruptured_acom')), note: 'pacjent Jan Kowalski', outputLang: 'pl', mode: 'fast' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].body.messages[0].content[1].type, 'image');
  assert.equal(data.report.templateId, 'neuro_coil_ruptured_acom');
  assert.equal(data.report.lang, 'pl');
  assert.match(data.report.body, /ok\. 6 × 4 mm/);
  assert.equal(data.picked, null);
  assert.match(data.warnings[0], /^Oszacowano z obrazu/);
  assert.ok(data.warnings.some((w) => /Strona dostępu/.test(w)));
  assert.ok(data.warnings.some((w) => /Uzupełnij/.test(w)), 'remaining "…" are listed');
  assert.equal(data.readings[0].basis, 'estimated');
});

test('endpoint: without a template → the AI picks one from the catalogue, then writes the report', async () => {
  requests.length = 0;
  replies = [
    { json: message({ template_id: 'neuro_coil_ruptured_acom', reason: 'spirale w tętniaku AComA' }) },
    { json: message(REPORT) },
  ];
  const res = await post({ images: [{ type: 'image/png', data: PNG }], catalog: TEMPLATES.map(rawOf), outputLang: 'pl' });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(requests.length, 2);
  const pick = JSON.parse(requests[0].body.messages[0].content.at(-1).text);
  assert.ok(pick.catalogue.length > 100 && pick.catalogue.every((c) => c.id && c.title && !c.text), 'only ids and titles are sent for picking');
  const input = JSON.parse(requests[1].body.messages[0].content.at(-1).text);
  assert.match(input.template.header, /AComA/);
  assert.equal(data.picked.id, 'neuro_coil_ruptured_acom');
  assert.equal(data.report.templateId, 'neuro_coil_ruptured_acom');
});

test('endpoint: an unknown picked id is refused with a clear message (no second request)', async () => {
  requests.length = 0;
  replies = [{ json: message({ template_id: 'made_up_id', reason: '' }) }];
  const res = await post({ images: [{ type: 'image/png', data: PNG }], catalog: TEMPLATES.slice(0, 5).map(rawOf) });
  const data = await res.json();
  assert.equal(res.status, 422);
  assert.match(data.error, /wybierz szablon/);
  assert.equal(requests.length, 1);
});

test('endpoint: keeps the radiologist\'s current report as the starting point', async () => {
  requests.length = 0;
  replies = [{ json: message(REPORT) }];
  const tpl = getTemplate('neuro_coil_ruptured_acom');
  const report = { ...reportFromTemplate(tpl), body: `${tpl.body}\nDodatkowo: zdanie radiologa.` };
  const res = await post({ images: [{ type: 'image/png', data: PNG }], templateId: tpl.id, template: rawOf(tpl), report });
  assert.equal(res.status, 200);
  const input = JSON.parse(requests[0].body.messages[0].content.at(-1).text);
  assert.match(input.current_report.body, /zdanie radiologa/);
});

test('endpoint: bad input and limits', async () => {
  requests.length = 0;
  assert.equal((await post({ images: [], templateId: 'neuro_coil_ruptured_acom' })).status, 400);
  assert.equal((await post({ images: [{ type: 'image/tiff', data: PNG }], templateId: 'neuro_coil_ruptured_acom' })).status, 400);
  const noCat = await post({ images: [{ type: 'image/png', data: PNG }] });
  assert.equal(noCat.status, 400);
  assert.equal(requests.length, 0, 'nothing reaches the AI');
  // a large but valid upload (several screenshots) is accepted by the size limit
  replies = [{ json: message(REPORT) }];
  const big = 'A'.repeat(3 * 1024 * 1024);
  const res = await post({ images: [{ type: 'image/jpeg', data: big }, { type: 'image/jpeg', data: big }], templateId: 'neuro_coil_ruptured_acom' });
  assert.equal(res.status, 200);
});

test('endpoint: refusal and API errors become Polish messages', async () => {
  replies = [{ json: message({}, 'refusal') }];
  let res = await post({ images: [{ type: 'image/png', data: PNG }], templateId: 'neuro_coil_ruptured_acom' });
  assert.equal(res.status, 422);
  assert.match((await res.json()).error, /odmówiło/);
  replies = [{ status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'bad key' } } }];
  res = await post({ images: [{ type: 'image/png', data: PNG }], templateId: 'neuro_coil_ruptured_acom' });
  assert.equal(res.status, 401);
  assert.match((await res.json()).error, /klucz API/);
});

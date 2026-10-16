// Hardware dictation button (PowerMic / SpeechMike over WebHID): learning the button from two presses must ignore
// status bytes that never change and trackball / counter noise; toggle and hold-to-talk modes.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) ?? null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); } };
Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [] }, configurable: true });
const { chooseButton, risingBits, MicButton, ledCandidates, ledBytes, ledReports, ledPattern, parseLedCode, KNOWN_LEDS, KNOWN_BUTTONS } = await import('../public/js/mic-button.js');

const R = (...bytes) => ({ reportId: 1, bytes: Uint8Array.from(bytes) });
const pos = (b) => (b ? { reportId: b.reportId, byte: b.byte, mask: b.mask } : b); // where the button is (without its message signature)

test('the old bug: the first report made a constant status bit look like a press', () => {
  // byte 0 = constant status 0x80, byte 2 bit 0x04 = record button
  assert.deepEqual(risingBits(undefined, Uint8Array.from([0x80, 0, 0x04]))[0], { byte: 0, mask: 0x80 }, 'old learning picked the status bit');
  const pick = pos(chooseButton([R(0x80, 0, 0x04), R(0x80, 0, 0), R(0x80, 0, 0x04), R(0x80, 0, 0)]));
  assert.deepEqual(pick, { reportId: 1, byte: 2, mask: 0x04 });
});

test('trackball / counter noise is ignored, the record button is found', () => {
  const reports = [];
  let ball = 0;
  const noisy = (btn) => { ball = (ball + 37) & 0xff; return R(0x01, ball, btn ? 0x10 : 0); };
  for (let i = 0; i < 12; i++) reports.push(noisy(false)); // moving the trackball while getting ready
  reports.push(noisy(true), noisy(true), noisy(false), noisy(false), noisy(true), noisy(false));
  assert.deepEqual(pos(chooseButton(reports)), { reportId: 1, byte: 2, mask: 0x10 });
});

test('devices that send only on change, and devices that send no release, still work', () => {
  assert.deepEqual(pos(chooseButton([R(0, 0x02), R(0, 0), R(0, 0x02), R(0, 0)])), { reportId: 1, byte: 1, mask: 0x02 });
  // press-only reports with an idle report in between
  assert.deepEqual(pos(chooseButton([R(0, 0), R(0x08, 0), R(0, 0), R(0x08, 0)])), { reportId: 1, byte: 0, mask: 0x08 });
  assert.equal(chooseButton([R(0x80, 1), R(0x80, 1)]), null, 'nothing changes → no button');
  assert.equal(chooseButton([]), null);
});

function fakeDevice() {
  const listeners = [];
  return {
    opened: false, vendorId: 0x0554, productId: 0x1001, productName: 'PowerMic', collections: [{ usagePage: 0xffa0, usage: 1, inputReports: [{ reportId: 1 }] }],
    async open() { this.opened = true; },
    addEventListener(_, fn) { listeners.push(fn); },
    removeEventListener() {},
    send(...bytes) { const data = new DataView(Uint8Array.from(bytes).buffer); for (const fn of listeners) fn({ reportId: 1, data }); },
  };
}

test('learning from two presses, then toggle mode and hold-to-talk mode', async () => {
  const events = [];
  const mic = new MicButton({ onPress: () => events.push('press'), onRelease: () => events.push('release') });
  const dev = fakeDevice();
  await mic.open(dev);
  mic.config = { vendorId: dev.vendorId, productId: dev.productId };
  const learning = mic.learn(5000);
  dev.send(0x80, 0x04); dev.send(0x80, 0); dev.send(0x80, 0x04); dev.send(0x80, 0);
  const r = await learning;
  assert.equal(r.ok, true);
  assert.deepEqual(pos(r.binding), { reportId: 1, byte: 1, mask: 0x04 });
  assert.deepEqual(events, [], 'learning presses do not start dictation');
  await new Promise((res) => setTimeout(res, 300));
  dev.send(0x80, 0x04); dev.send(0x80, 0);
  assert.deepEqual(events, ['press'], 'toggle: release does nothing');
  mic.setMode('hold');
  await new Promise((res) => setTimeout(res, 300));
  dev.send(0x80, 0x04); dev.send(0x80, 0);
  assert.deepEqual(events, ['press', 'press', 'release'], 'hold: release stops');
  assert.match(mic.diagnose().hint, /przycisk nauczony/);
});

test('diagnosis when the device sends nothing (another program holds it)', async () => {
  const mic = new MicButton({ onPress: () => {} });
  const dev = fakeDevice();
  await mic.open(dev);
  const r = await mic.learn(50);
  assert.deepEqual(r, { ok: false, reason: 'no-data' });
  assert.match(mic.diagnose().hint, /nie wysłało żadnych danych/);
  dev.collections = [{ usagePage: 0x01, usage: 0x06 }];
  assert.match(mic.diagnose().hint, /klawiatura/);
});

// HID descriptor as Chrome exposes it: an output report with 3 LED-page bits + 5 bits padding, and one vendor byte
const LED = (u) => (0x08 << 16) | u;
const ledCollections = [{
  usagePage: 0xffa0, usage: 1, inputReports: [{ reportId: 1 }],
  outputReports: [{ reportId: 2, items: [{ reportSize: 1, reportCount: 3, usages: [LED(0x18), LED(0x19), LED(0x1a)] }, { reportSize: 5, reportCount: 1, usages: [], usageMinimum: 0 }] }],
  featureReports: [{ reportId: 3, items: [{ reportSize: 8, reportCount: 2, usages: [0xff000001, 0xff000002] }] }], // settings: never touched
  children: [{ usagePage: 0xffa0, usage: 2, outputReports: [{ reportId: 4, items: [{ reportSize: 8, reportCount: 1, usages: [0xff000010] }] }] }],
}];

test('red light: candidate switches come from the descriptor, standard lights first, device settings never touched', () => {
  const c = ledCandidates(ledCollections);
  assert.deepEqual(c.slice(0, 3).map((x) => [x.type, x.reportId, x.byte, x.mask, x.led]), [['output', 2, 0, 1, true], ['output', 2, 0, 2, true], ['output', 2, 0, 4, true]]);
  assert.ok(c.some((x) => x.reportId === 4 && !x.led), 'vendor output byte is a fallback candidate');
  assert.ok(!c.some((x) => x.type === 'feature'), 'feature reports without a light are skipped');
  assert.equal(c.filter((x) => x.reportId === 2).length, 4, 'padding is a candidate but not a duplicate');
  assert.deepEqual([...ledBytes(c[1], true)], [0x02]);
  assert.deepEqual([...ledBytes(c[1], false)], [0x00]);
  assert.deepEqual(ledCandidates([]), []);
  assert.deepEqual(ledCandidates(), []);
});

function ledDevice(collections) {
  const dev = fakeDevice();
  dev.collections = collections;
  dev.sent = [];
  dev.sendReport = async (id, data) => { dev.sent.push(['out', id, [...data]]); };
  dev.sendFeatureReport = async (id, data) => { dev.sent.push(['feat', id, [...data]]); };
  return dev;
}

test('red light: found by "does it light up?", then on while dictating and off after', async () => {
  const mic = new MicButton({ onPress: () => {} });
  const dev = ledDevice(ledCollections);
  await mic.open(dev);
  assert.equal(mic.autoLed(), null, 'three standard lights → the user is asked which one');
  assert.equal(await mic.setLed(true), false, 'no light chosen yet → nothing sent');
  assert.deepEqual(dev.sent, []);
  const first = await mic.tryLed(0);
  const second = await mic.tryLed(1); // user: "no" → next
  assert.deepEqual(dev.sent, [['out', 2, [0x01]], ['out', 2, [0x00]], ['out', 2, [0x02]]], 'previous candidate is switched off first');
  assert.notDeepEqual(first, second);
  mic.saveLed(second); // user: "yes"
  dev.sent.length = 0;
  await mic.setLed(true); await mic.setLed(false);
  assert.deepEqual(dev.sent, [['out', 2, [0x02]], ['out', 2, [0x00]]]);
  assert.equal(await mic.tryLed(99), null, 'no more candidates');
  assert.deepEqual(mic.diagnose().led, second);
});

test('red light: one standard light is used automatically; a failing device never throws', async () => {
  localStorage._m.clear(); // a different microphone than in the test above
  const one = [{ usagePage: 0xffa0, usage: 1, outputReports: [{ reportId: 5, items: [{ reportSize: 1, reportCount: 1, usages: [LED(0x4b)] }, { reportSize: 7, reportCount: 1, usages: [] }] }] }];
  const mic = new MicButton({ onPress: () => {} });
  const dev = ledDevice(one);
  await mic.open(dev);
  assert.deepEqual(mic.autoLed(), { type: 'output', reportId: 5, length: 1, byte: 0, mask: 1, led: true });
  dev.sendReport = async () => { throw new Error('NotAllowedError'); };
  assert.equal(await mic.setLed(true), false);
  assert.match(mic.diagnose().ledError, /NotAllowed/);
  // reconnecting while dictating switches the light back on
  dev.sendReport = async (id, data) => { dev.sent.push(['out', id, [...data]]); };
  dev.sent.length = 0;
  await mic.open(dev);
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(dev.sent, [['out', 5, [0x01]]]);
});

test('the toggle / hold choice survives "Odłącz" and a reload; test pages never save it', async () => {
  const mic = new MicButton({ onPress: () => {} });
  mic.setMode('hold');
  await mic.disconnect();
  assert.equal(mic.mode, 'hold');
  assert.equal(mic.known, false);
  assert.equal(new MicButton({ onPress: () => {} }).mode, 'hold', 'reload keeps it');
  mic.setMode('toggle');
  assert.equal(new MicButton({ onPress: () => {} }).mode, 'toggle');
  const probe = new MicButton({ onPress: () => {}, persist: false });
  probe.setMode('hold');
  assert.equal(new MicButton({ onPress: () => {} }).mode, 'toggle', 'persist: false leaves the saved choice alone');
});

test('a NEW PowerMic replacing the remembered one is taken over and asks for its button (no silent dead button)', async () => {
  localStorage.setItem('radvox.mic.v1', JSON.stringify({ vendorId: 0x0554, productId: 0x1001, productName: 'PowerMic II', binding: { reportId: 1, byte: 1, mask: 4 }, led: null }));
  const newMic = { ...fakeDevice(), productId: 0x0099, productName: 'PowerMic X' }; // a model without built-in settings
  const keyboardOnly = { ...fakeDevice(), vendorId: 0x046d, productId: 0x0001, collections: [{ usagePage: 0x01, usage: 0x06 }] };
  const hid = { listeners: {}, addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }, getDevices: async () => [keyboardOnly, newMic] };
  Object.defineProperty(globalThis.navigator, 'hid', { value: hid, configurable: true });
  const mic = new MicButton({ onPress: () => {} });
  assert.equal(mic.needsSetup, true, 'remembered but not connected yet');
  await mic.restore();
  assert.equal(mic.connected, true);
  assert.equal(mic.name, 'PowerMic X');
  assert.equal(mic.bound, false, "the old mic's button is not assumed for the new one");
  assert.equal(mic.replaced, true);
  assert.equal(mic.needsSetup, true, 'the main screen asks to press the button twice');
  // plugging the old one back in later does not steal the new connection
  const learning = mic.learn(5000);
  newMic.send(0, 0x04); newMic.send(0, 0); newMic.send(0, 0x04); newMic.send(0, 0);
  assert.equal((await learning).ok, true);
  assert.equal(mic.needsSetup, false);
  // the same mic remembered → simply reopened, nothing to set up
  const again = new MicButton({ onPress: () => {} });
  await again.restore();
  assert.equal(again.connected, true);
  assert.equal(again.bound, true);
  assert.equal(again.replaced, undefined);
  Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [] }, configurable: true });
});

test('a new PowerMic plugged in while the app is open is picked up by itself', async () => {
  localStorage.setItem('radvox.mic.v1', JSON.stringify({ vendorId: 0x0554, productId: 0x1001, productName: 'PowerMic II', binding: { reportId: 1, byte: 1, mask: 4 } }));
  const hid = { listeners: {}, addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }, getDevices: async () => [] };
  Object.defineProperty(globalThis.navigator, 'hid', { value: hid, configurable: true });
  const mic = new MicButton({ onPress: () => {} });
  await mic.restore();
  assert.equal(mic.connected, false);
  const newMic = { ...fakeDevice(), productId: 0x0099, productName: 'PowerMic X' }; // a model without built-in settings
  for (const f of hid.listeners.connect) f({ device: newMic });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(mic.connected, true);
  assert.equal(mic.name, 'PowerMic X');
  assert.equal(mic.needsSetup, true);
  Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [] }, configurable: true });
});

test('red light search: groups first, patterns of several switches, keyboard part never offered', () => {
  const cols = [
    { usagePage: 0x01, usage: 0x06, outputReports: [{ reportId: 9, items: [{ reportSize: 1, reportCount: 5, usages: [LED(1), LED(2), LED(3), LED(4), LED(5)] }, { reportSize: 3, reportCount: 1, usages: [] }] }] }, // keyboard: Num/Caps Lock
    { usagePage: 0xff00, usage: 1, outputReports: [
      { reportId: 2, items: [{ reportSize: 8, reportCount: 2, usages: [0xff000001, 0xff000002] }] },
      { reportId: 3, items: [{ reportSize: 1, reportCount: 8, usages: [0xff000010] }] },
    ] },
  ];
  const cands = ledCandidates(cols);
  assert.ok(!cands.some((c) => c.reportId === 9), 'the browser never lets a page switch keyboard lights');
  const groups = ledReports(cands);
  assert.deepEqual(groups.map((g) => g.reportId), [2, 3]);
  assert.deepEqual([...ledBytes(ledPattern(groups[1]), true)], [0xff], 'a whole group on');
  const two = cands.filter((c) => c.reportId === 3).slice(2, 4);
  const pat = ledPattern(groups[1], two);
  assert.deepEqual([...ledBytes(pat, true)], [0x0c], 'only the chosen switches');
  assert.deepEqual([...ledBytes(pat, false)], [0x00]);
  assert.deepEqual([...ledBytes({ type: 'output', reportId: 3, length: 1, byte: 0, mask: 0x20 }, true)], [0x20], 'single switches unchanged');
});

test('light code typed in from IT: on and off commands, checked before use', () => {
  const led = parseLedCode('0a 01 00 00 00 00 00 00 00', '0x0a,0x00');
  assert.equal(led.length, 9);
  assert.deepEqual([...ledBytes(led, true)], [0x0a, 1, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual([...ledBytes(led, false)], [0x0a, 0, 0, 0, 0, 0, 0, 0, 0], 'its own "off" command');
  assert.deepEqual([...ledBytes(parseLedCode('05'), false)], [0], 'no off code → zeros');
  assert.match(parseLedCode('').error, /włącz/);
  assert.match(parseLedCode('zz 01').error, /zz/);
  assert.match(parseLedCode('01', '', 300).error, /0–255/);
});

test('a light code known for a model is used by itself on every computer', async () => {
  localStorage._m.clear();
  const real = KNOWN_LEDS['0554:0064'];
  assert.deepEqual(real.on, [2, 255, 255, 255, 255, 255, 255, 255, 255], 'PowerMic 4: command 02, found on a real device (attempt 259)');
  assert.deepEqual(real.off, [2, 0, 0, 0, 0, 0, 0, 0, 0]);
  KNOWN_LEDS['0554:0064'] = { type: 'output', reportId: 0, length: 3, on: [3, 0xff, 0xff], off: [3, 0, 0] };
  const mic = new MicButton({ onPress: () => {} });
  const dev = { ...ledDevice([{ usagePage: 0xffa0, usage: 1, outputReports: [{ reportId: 0, items: [{ reportSize: 8, reportCount: 3, usages: [0xffa10001] }] }] }]), productId: 0x0064 };
  await mic.open(dev);
  assert.deepEqual(mic.autoLed().on, [3, 0xff, 0xff]);
  dev.sent.length = 0;
  await mic.setLed(true); await mic.setLed(false);
  assert.deepEqual(dev.sent, [['out', 0, [3, 0xff, 0xff]], ['out', 0, [3, 0, 0]]]);
  KNOWN_LEDS['0554:0064'] = real;
});

test('PowerMic 4: the status message (light on) after a release is not a second press — one press, one action', async () => {
  // real PowerMic 4 data: button messages "80 00 00 20 …", status messages "80 00 00 08 …", both use byte 8 bit 0
  const btn = (down, a = 0x39, b = 0x61) => [0x80, 0, 0, 0x20, a, b, 0, 0, down ? 1 : 0];
  const status = (light) => [0x80, 0, 0, 0x08, 0, 0x02, 0, 0, light ? 1 : 0];
  const events = [];
  const mic = new MicButton({ onPress: () => events.push('press'), onRelease: () => events.push('release'), persist: false });
  const dev = fakeDevice();
  dev.sendReport = async () => {};
  await mic.open(dev);
  mic.config = { vendorId: dev.vendorId, productId: dev.productId };
  const learning = mic.learn(5000);
  for (const r of [btn(1), btn(1), btn(0, 0x7f, 0), btn(0, 0x7f, 0), btn(1, 0x12, 0x34), btn(0)]) dev.send(...r);
  const r = await learning;
  assert.equal(r.ok, true);
  assert.deepEqual(pos(r.binding), { reportId: 1, byte: 8, mask: 1 });
  assert.ok(r.binding.sig.some(([j, v]) => j === 3 && v === 0x20), 'learned: button messages carry 0x20 in byte 3');
  mic.saveLed = () => {};
  mic.config.led = { type: 'output', reportId: 0, length: 9, on: [3, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff] };
  await new Promise((res) => setTimeout(res, 300));
  // press → dictation starts → the app lights the light → the mic answers with a status "1" after the release
  dev.send(...btn(1)); await mic.setLed(true); dev.send(...btn(0)); dev.send(...status(1));
  await new Promise((res) => setTimeout(res, 600));
  dev.send(...status(1)); // later status messages too
  assert.deepEqual(events, ['press'], 'exactly one press — the status message never toggles dictation');
  // the next real press works at once
  dev.send(...btn(1)); dev.send(...btn(0));
  assert.deepEqual(events, ['press', 'press']);
});

test('an old saved button (no signature) is still protected from the light echo', async () => {
  const events = [];
  const mic = new MicButton({ onPress: () => events.push('press'), persist: false });
  const dev = fakeDevice();
  dev.sendReport = async () => {};
  await mic.open(dev);
  mic.config = { vendorId: dev.vendorId, productId: dev.productId, binding: { reportId: 1, byte: 1, mask: 1 }, led: { type: 'output', reportId: 0, length: 1, on: [1] } };
  dev.send(0x20, 1); await mic.setLed(true); dev.send(0x20, 0); dev.send(0x08, 1); // echo within half a second
  assert.deepEqual(events, ['press']);
  dev.send(0x20, 0); await new Promise((res) => setTimeout(res, 550)); dev.send(0x20, 1);
  assert.deepEqual(events, ['press', 'press'], 'a real press after the quiet moment works');
});

test('PowerMic 4 works without learning, and an older saved button is upgraded (no double press)', async () => {
  localStorage._m.clear();
  const pm4 = () => ({ ...fakeDevice(), productId: 0x0064, productName: 'PowerMic 4', sendReport: async () => {} });
  // older install: the button was learned before (no signature)
  localStorage.setItem('radvox.mic.v1', JSON.stringify({ vendorId: 0x0554, productId: 0x0064, productName: 'PowerMic 4', binding: { reportId: 0, byte: 8, mask: 1 } }));
  const old = new MicButton({ onPress: () => {} });
  const d1 = pm4();
  await old.open(d1);
  assert.deepEqual(old.config.binding, KNOWN_BUTTONS['0554:0064'], 'upgraded to the known PowerMic 4 button');
  // a new PowerMic 4: connected, nothing to learn
  localStorage._m.clear();
  const fresh = new MicButton({ onPress: () => {} });
  const d2 = pm4();
  Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [], requestDevice: async () => [d2] }, configurable: true });
  await fresh.connect();
  assert.equal(fresh.bound, true);
  assert.equal(fresh.autoLed().known, true, 'and its light code');
  // a user who taught a different button keeps it
  localStorage.setItem('radvox.mic.v1', JSON.stringify({ vendorId: 0x0554, productId: 0x0064, binding: { reportId: 0, byte: 7, mask: 2 } }));
  const other = new MicButton({ onPress: () => {} });
  await other.open(pm4());
  assert.deepEqual(other.config.binding, { reportId: 0, byte: 7, mask: 2 });
  Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [] }, configurable: true });
});

test('the very first press after starting counts, even if the mic sent a status message first', async () => {
  const events = [];
  const mic = new MicButton({ onPress: () => events.push('press'), persist: false });
  const dev = { ...fakeDevice(), productId: 0x0064, sendReport: async () => {} };
  await mic.open(dev);
  mic.config = { vendorId: 0x0554, productId: 0x0064, binding: { ...KNOWN_BUTTONS['0554:0064'], reportId: 1 } }; // the fake device reports on id 1
  dev.send(0x80, 0, 0, 0x08, 0, 0x02, 0, 0, 1); // status: light state "1"
  dev.send(0x80, 0, 0, 0x20, 0x39, 0x61, 0, 0, 1); // first real press
  assert.deepEqual(events, ['press']);
});

test('a release reported in the status message does not swallow the next press (every press works)', async () => {
  const events = [];
  const mic = new MicButton({ onPress: () => events.push('press'), persist: false });
  const dev = { ...fakeDevice(), productId: 0x0064, sendReport: async () => {} };
  await mic.open(dev);
  mic.config = { vendorId: 0x0554, productId: 0x0064, binding: { ...KNOWN_BUTTONS['0554:0064'], reportId: 1 } };
  const press = () => dev.send(0x80, 0, 0, 0x20, 0x39, 0x61, 0, 0, 1);
  const releaseInStatus = () => dev.send(0x80, 0, 0, 0x08, 0, 0x02, 0, 0, 0);
  for (let i = 0; i < 4; i++) { press(); releaseInStatus(); await new Promise((r) => setTimeout(r, 300)); }
  assert.deepEqual(events, ['press', 'press', 'press', 'press']);
  assert.ok(mic.diagnose().events.some((e) => /NACIŚNIĘCIE/.test(e)), 'the timeline is in the report');
  assert.ok(mic.diagnose().events.some((e) => /puszczenie \(z wiadomości innego typu\)/.test(e)));
});

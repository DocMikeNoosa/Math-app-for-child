// Hardware dictation button (PowerMic / SpeechMike over WebHID): learning the button from two presses must ignore
// status bytes that never change and trackball / counter noise; toggle and hold-to-talk modes.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) ?? null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); } };
Object.defineProperty(globalThis.navigator, 'hid', { value: { addEventListener() {}, getDevices: async () => [] }, configurable: true });
const { chooseButton, risingBits, MicButton } = await import('../public/js/mic-button.js');

const R = (...bytes) => ({ reportId: 1, bytes: Uint8Array.from(bytes) });

test('the old bug: the first report made a constant status bit look like a press', () => {
  // byte 0 = constant status 0x80, byte 2 bit 0x04 = record button
  assert.deepEqual(risingBits(undefined, Uint8Array.from([0x80, 0, 0x04]))[0], { byte: 0, mask: 0x80 }, 'old learning picked the status bit');
  const pick = chooseButton([R(0x80, 0, 0x04), R(0x80, 0, 0), R(0x80, 0, 0x04), R(0x80, 0, 0)]);
  assert.deepEqual(pick, { reportId: 1, byte: 2, mask: 0x04 });
});

test('trackball / counter noise is ignored, the record button is found', () => {
  const reports = [];
  let ball = 0;
  const noisy = (btn) => { ball = (ball + 37) & 0xff; return R(0x01, ball, btn ? 0x10 : 0); };
  for (let i = 0; i < 12; i++) reports.push(noisy(false)); // moving the trackball while getting ready
  reports.push(noisy(true), noisy(true), noisy(false), noisy(false), noisy(true), noisy(false));
  assert.deepEqual(chooseButton(reports), { reportId: 1, byte: 2, mask: 0x10 });
});

test('devices that send only on change, and devices that send no release, still work', () => {
  assert.deepEqual(chooseButton([R(0, 0x02), R(0, 0), R(0, 0x02), R(0, 0)]), { reportId: 1, byte: 1, mask: 0x02 });
  // press-only reports with an idle report in between
  assert.deepEqual(chooseButton([R(0, 0), R(0x08, 0), R(0, 0), R(0x08, 0)]), { reportId: 1, byte: 0, mask: 0x08 });
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
  assert.deepEqual(r.binding, { reportId: 1, byte: 1, mask: 0x04 });
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

// Recording sound: a choice of styles (or none), start and stop differ, preview works even when switched off,
// older saved settings still work, and broken audio never throws.
import { test } from 'node:test';
import assert from 'node:assert/strict';

globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) ?? null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); } };
const played = [];
class FakeCtx {
  constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
  createOscillator() { const o = { type: '', frequency: { value: 0 }, connect: (g) => g, start: () => played.push(o.frequency.value), stop() {} }; return o; }
  createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect: (d) => d }; }
  resume() {}
}
globalThis.window = { AudioContext: FakeCtx };
const { chime, chimeStyle, setChimeStyle, chimeEnabled, setChimeEnabled, STYLES, styleOptions, DEFAULT_STYLE } = await import('../public/js/chime.js');

test('several styles plus "no sound"; the default is the warm marimba', () => {
  assert.equal(chimeStyle(), DEFAULT_STYLE);
  assert.ok(Object.keys(STYLES).length >= 4);
  assert.deepEqual(styleOptions().at(-1), ['off', 'Bez dźwięku']);
  for (const [name, s] of Object.entries(STYLES)) {
    assert.ok(s.start.length && s.stop.length, name);
    assert.notDeepEqual(s.start, s.stop, `${name}: start and stop sound different`);
    for (const n of [...s.start, ...s.stop]) assert.ok(n[4] <= 0.15, `${name}: quiet`);
  }
});

test('choosing a style, switching off, preview, older saves', () => {
  setChimeStyle('soft');
  played.length = 0;
  assert.equal(chime('start'), true);
  assert.deepEqual(played, [STYLES.soft.start[0][0]]);
  setChimeStyle('off');
  assert.equal(chimeEnabled(), false);
  played.length = 0;
  assert.equal(chime('stop'), false);
  assert.equal(played.length, 0, 'off = silent');
  assert.equal(chime('start', { style: 'bell' }), true, 'preview of another style plays');
  localStorage.setItem('radvox.chime.v1', 'on'); // saved by the previous version
  assert.equal(chimeStyle(), DEFAULT_STYLE);
  setChimeEnabled(false);
  assert.equal(chimeStyle(), 'off');
  setChimeStyle('nonsense');
  assert.equal(chimeStyle(), DEFAULT_STYLE);
});

test('broken audio never throws', async () => {
  globalThis.window = { AudioContext: class { constructor() { throw new Error('no audio device'); } } };
  const fresh = await import(`../public/js/chime.js?x=${Date.now()}`);
  assert.equal(fresh.chime('start'), false);
});

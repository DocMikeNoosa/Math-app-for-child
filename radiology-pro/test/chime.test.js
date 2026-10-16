// Start / stop chime: soft two-note sound, rising for start and falling for stop; can be switched off; never throws.
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
const { chime, chimeEnabled, setChimeEnabled, CHIMES } = await import('../public/js/chime.js');

test('start rises, stop falls, both quiet two-note chimes', () => {
  assert.ok(CHIMES.start[0] < CHIMES.start[1]);
  assert.ok(CHIMES.stop[0] > CHIMES.stop[1]);
  assert.equal(chimeEnabled(), true, 'on by default');
  assert.equal(chime('start'), true);
  assert.deepEqual(played.filter((_, i) => i % 2 === 0), CHIMES.start, 'each note has a soft octave above');
});

test('switched off: silent, except the "Posłuchaj" button; broken audio never throws', () => {
  played.length = 0;
  setChimeEnabled(false);
  assert.equal(chime('stop'), false);
  assert.equal(played.length, 0);
  assert.equal(chime('stop', { force: true }), true, 'the test button still plays');
  setChimeEnabled(true);
  globalThis.window = { AudioContext: class { constructor() { throw new Error('no audio device'); } } };
  assert.doesNotThrow(() => chime('start'));
});

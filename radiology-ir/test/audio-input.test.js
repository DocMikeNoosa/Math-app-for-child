// Built-in / any microphone: the device list and the level test helpers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelOf, inputError, listInputs } from '../public/js/audio-input.js';

test('level: silence is 0, a loud signal is high, never above 1', () => {
  assert.equal(levelOf(new Uint8Array(256).fill(128)), 0);
  assert.equal(levelOf([]), 0);
  assert.equal(levelOf(undefined), 0);
  const loud = Uint8Array.from({ length: 256 }, (_, i) => (i % 2 ? 228 : 28));
  assert.ok(levelOf(loud) > 0.9 && levelOf(loud) <= 1);
  const quiet = Uint8Array.from({ length: 256 }, (_, i) => (i % 2 ? 131 : 125));
  assert.ok(levelOf(quiet) > 0 && levelOf(quiet) < 0.2);
});

test('every common microphone error gets a plain explanation', () => {
  assert.match(inputError({ name: 'NotAllowedError' }), /zgody/);
  assert.match(inputError({ name: 'NotFoundError' }), /Nie znaleziono/);
  assert.match(inputError({ name: 'NotReadableError' }), /zajęty/);
  assert.match(inputError({ name: 'NotSupportedError' }), /Chrome lub Edge/);
  assert.match(inputError(new Error('x')), /x/);
});

test('device list: only microphones; empty when the browser cannot list them', async () => {
  const md = { enumerateDevices: async () => [{ kind: 'audioinput', deviceId: 'default', label: '' }, { kind: 'videoinput', deviceId: 'cam' }, { kind: 'audioinput', deviceId: 'a1', label: 'Mikrofon (Realtek)' }, { kind: 'audiooutput', deviceId: 'spk' }] };
  Object.defineProperty(globalThis.navigator, 'mediaDevices', { value: md, configurable: true });
  assert.deepEqual((await listInputs()).map((d) => d.deviceId), ['default', 'a1']);
  md.enumerateDevices = async () => { throw new Error('denied'); };
  assert.deepEqual(await listInputs(), []);
  Object.defineProperty(globalThis.navigator, 'mediaDevices', { value: undefined, configurable: true });
  assert.deepEqual(await listInputs(), []);
});

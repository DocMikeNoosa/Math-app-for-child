// A short sound when dictation starts and stops, so the radiologist knows without looking. Several styles to choose
// from (and "none"); made with the Web Audio API (no sound files), quiet and under half a second.
const KEY = 'radvox.chime.v1';
export const DEFAULT_STYLE = 'wood';

/** Each style: the start and stop sounds as notes [frequency Hz, delay s, length s, wave, loudness, overtone]. */
export const STYLES = {
  wood: { label: 'Marimba (drewniany, ciepły)', start: [[523.25, 0, 0.22, 'sine', 0.13, 4], [783.99, 0.09, 0.26, 'sine', 0.12, 4]], stop: [[783.99, 0, 0.22, 'sine', 0.12, 4], [523.25, 0.09, 0.28, 'sine', 0.13, 4]] },
  soft: { label: 'Delikatny ton (jeden, cichy)', start: [[587.33, 0, 0.3, 'sine', 0.08, 0]], stop: [[440, 0, 0.3, 'sine', 0.08, 0]] },
  bell: { label: 'Dzwonek (dwa tony)', start: [[659.25, 0, 0.32, 'sine', 0.11, 2], [1108.73, 0.12, 0.32, 'sine', 0.11, 2]], stop: [[1108.73, 0, 0.32, 'sine', 0.11, 2], [659.25, 0.12, 0.32, 'sine', 0.11, 2]] },
  click: { label: 'Krótkie kliknięcie', start: [[1760, 0, 0.04, 'triangle', 0.09, 0], [2349.32, 0.06, 0.04, 'triangle', 0.08, 0]], stop: [[1760, 0, 0.05, 'triangle', 0.09, 0]] },
};
export const STYLE_NAMES = [...Object.keys(STYLES), 'off'];

let ctx = null;

/** The chosen style ('off' = no sound). Older saves: 'on' → default style. */
export function chimeStyle() {
  let v = null;
  try { v = localStorage.getItem(KEY); } catch { /* private mode */ }
  if (v === 'off') return 'off';
  return STYLES[v] ? v : DEFAULT_STYLE;
}
export function setChimeStyle(style) {
  try { localStorage.setItem(KEY, STYLE_NAMES.includes(style) ? style : DEFAULT_STYLE); } catch { /* private mode */ }
}
export const chimeEnabled = () => chimeStyle() !== 'off';
/** Kept for older callers: on = default style, off = no sound. */
export function setChimeEnabled(on) { setChimeStyle(on ? DEFAULT_STYLE : 'off'); }

/** Play the start / stop sound. `style` previews another style. Never throws (no audio device, blocked autoplay…). */
export function chime(kind, { force = false, style = null } = {}) {
  const name = style || chimeStyle();
  if (name === 'off' && !force) return false;
  const notes = (STYLES[name] || STYLES[DEFAULT_STYLE])[kind];
  if (!notes) return false;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx ||= new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    for (const [freq, delay, len, wave, level, overtone] of notes) {
      const t = t0 + delay;
      // the note, and for the warmer styles a quiet, faster-fading overtone (what makes a mallet or a bell sound)
      for (const [mult, lvl, l] of overtone ? [[1, level, len], [overtone, level * 0.18, len * 0.45]] : [[1, level, len]]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = wave;
        osc.frequency.value = freq * mult;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(lvl, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + l);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + l + 0.02);
      }
    }
    return true;
  } catch {
    return false;
  }
}

/** Options for a <select>: [value, label]. */
export const styleOptions = () => [...Object.entries(STYLES).map(([k, v]) => [k, v.label]), ['off', 'Bez dźwięku']];

// A short, soft chime when dictation starts (rising) and stops (falling), so the radiologist knows without looking.
// Made with the Web Audio API (no sound files); quiet, about a third of a second. Can be switched off in settings.
const KEY = 'radvox.chime.v1';
let ctx = null;

export function chimeEnabled() {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}
export function setChimeEnabled(on) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
}

/** Notes (Hz) of each chime: a gentle major sixth, rising for start, falling for stop. */
export const CHIMES = { start: [659.25, 1108.73], stop: [1108.73, 659.25] };

/** Play the start / stop chime. Never throws (no audio device, blocked autoplay…). */
export function chime(kind, { force = false } = {}) {
  if (!force && !chimeEnabled()) return false;
  const notes = CHIMES[kind];
  if (!notes) return false;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx ||= new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const t0 = ctx.currentTime + 0.02;
    notes.forEach((freq, i) => {
      const t = t0 + i * 0.12;
      // a sine with a quiet octave above: soft, bell-like, not a beep
      for (const [mult, level] of [[1, 0.11], [2, 0.025]]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq * mult;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(level, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.34);
      }
    });
    return true;
  } catch {
    return false;
  }
}

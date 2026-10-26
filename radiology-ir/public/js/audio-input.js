// Microphones on this computer (built-in, headset, monitor, PowerMic…) and a level test for one of them.
// Speech recognition itself always listens to the browser's default microphone; this only lists and checks them.

/** Audio inputs the browser can see (names appear after the first permission to use the microphone). */
export async function listInputs() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return [];
  try {
    return (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'audioinput');
  } catch {
    return [];
  }
}

/** Loudness 0..1 from time-domain bytes (128 = silence). Pure, for tests. */
export function levelOf(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (const v of samples) { const x = (v - 128) / 128; sum += x * x; }
  return Math.min(1, Math.sqrt(sum / samples.length) * 4);
}

/** Plain-language reason a microphone could not be opened. */
export function inputError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError': return 'Brak zgody na mikrofon — kliknij ikonę obok adresu strony (kłódka) i zezwól na mikrofon.';
    case 'NotFoundError':
    case 'OverconstrainedError': return 'Nie znaleziono tego mikrofonu — podłącz go ponownie lub wybierz inny z listy.';
    case 'NotReadableError':
    case 'AbortError': return 'Mikrofon jest zajęty przez inny program albo wyłączony w Windows (Ustawienia → Prywatność → Mikrofon).';
    case 'NotSupportedError': return 'Ta przeglądarka nie daje dostępu do mikrofonu — użyj Chrome lub Edge.';
    default: return `Nie udało się włączyć mikrofonu (${err?.message || err?.name || 'błąd'}).`;
  }
}

export class InputTester {
  constructor() {
    this.stream = null;
    this.ctx = null;
    this.raf = 0;
    this.peak = 0;
  }

  get running() { return Boolean(this.stream); }

  /** Listen to one microphone ('' = default) and report its level ~60×/s. Resolves the device name; throws on error. */
  async start(deviceId, onLevel) {
    this.stop();
    if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('getUserMedia'), { name: 'NotSupportedError' });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true });
    const AC = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AC();
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 512;
    this.ctx.createMediaStreamSource(this.stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    this.peak = 0;
    const loop = () => {
      if (!this.stream) return;
      analyser.getByteTimeDomainData(data);
      const level = levelOf(data);
      this.peak = Math.max(this.peak, level);
      onLevel(level);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
    return this.stream.getAudioTracks()[0]?.label || '';
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = this.ctx = null;
  }
}

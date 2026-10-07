// Browser speech recognition (Web Speech API) + microphone level meter.

const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const speechSupported = Boolean(SR);

const ERRORS = {
  'not-allowed': 'Brak dostępu do mikrofonu — zezwól w ustawieniach przeglądarki.',
  'service-not-allowed': 'Rozpoznawanie mowy jest zablokowane w tej przeglądarce.',
  'audio-capture': 'Nie wykryto mikrofonu.',
  network: 'Błąd sieci — rozpoznawanie mowy w Chrome wymaga połączenia z internetem.',
  'language-not-supported': 'Język polski nie jest obsługiwany w tej przeglądarce.',
};

export class Dictation {
  constructor({ lang = 'pl-PL', onFinal, onInterim, onStateChange, onError } = {}) {
    this.lang = lang;
    this.onFinal = onFinal || (() => {});
    this.onInterim = onInterim || (() => {});
    this.onStateChange = onStateChange || (() => {});
    this.onError = onError || (() => {});
    this.active = false;
    this.rec = null;
    this._endWaiters = [];
  }

  _create() {
    const rec = new SR();
    rec.lang = this.lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) this.onFinal(text.trim());
        else interim += text;
      }
      this.onInterim(interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      const fatal = ['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported'].includes(e.error);
      this.onError(ERRORS[e.error] || `Błąd rozpoznawania mowy: ${e.error}`);
      if (fatal) this.active = false;
    };
    rec.onend = () => {
      this.onInterim('');
      // Chrome ends sessions after silence — restart while the user is still dictating.
      if (this.active) {
        try { rec.start(); return; } catch { /* fall through */ }
      }
      this.active = false;
      this.rec = null;
      this.onStateChange(false);
      this._endWaiters.splice(0).forEach((fn) => fn());
    };
    return rec;
  }

  start() {
    if (!SR) throw new Error('unsupported');
    if (this.active) return;
    this.active = true;
    this.rec = this._create();
    this.rec.start();
    this.onStateChange(true);
  }

  /** Stop and resolve once the last final result has been delivered. */
  stop() {
    if (!this.rec) { this.active = false; return Promise.resolve(); }
    this.active = false;
    const done = new Promise((resolve) => {
      this._endWaiters.push(resolve);
      setTimeout(resolve, 2500); // safety net
    });
    try { this.rec.stop(); } catch { /* already stopped */ }
    return done;
  }
}

/** Microphone level meter for the visualiser. */
export class LevelMeter {
  constructor() {
    this.stream = null;
    this.ctx = null;
    this.analyser = null;
    this.data = null;
  }

  async start() {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const src = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.75;
      src.connect(this.analyser);
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  /** Frequency bins normalised to 0..1, or null when not running. */
  bins() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.data);
    return this.data;
  }

  stop() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.stream = this.ctx = this.analyser = this.data = null;
  }
}

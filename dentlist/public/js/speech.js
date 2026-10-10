// Rozpoznawanie mowy (Web Speech API, pl-PL) — przeniesione z RadVox.

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


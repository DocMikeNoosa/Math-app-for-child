/* Read-aloud using the browser's built-in speech synthesis (works offline, no API key).
   Prefers an Australian English voice when the device has one. */
(function () {
  'use strict';
  const LA = window.LA;
  const synth = window.speechSynthesis || null;
  const SP = (LA.speech = {});
  let voices = [];
  let currentBtn = null;

  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter((v) => /^en/i.test(v.lang));
  }
  if (synth) {
    loadVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }

  SP.available = () => !!synth;
  SP.voices = () => voices;
  SP.pickVoice = () => {
    const want = LA.store.settings().voiceURI;
    if (want) { const v = voices.find((x) => x.voiceURI === want); if (v) return v; }
    return voices.find((v) => /en[-_]AU/i.test(v.lang)) || voices.find((v) => /en[-_]GB/i.test(v.lang)) || voices.find((v) => /en/i.test(v.lang)) || null;
  };

  SP.stop = () => {
    if (synth) synth.cancel();
    if (currentBtn) { currentBtn.classList.remove('speaking'); currentBtn = null; }
  };

  /* Speak text. Long text is split into sentences (some browsers stop long utterances). */
  SP.say = (text, opts) => {
    opts = opts || {};
    if (!synth) { if (opts.onend) opts.onend(); return; }
    SP.stop();
    const clean = String(text || '').replace(/[☐_]{1,}/g, ' blank ').replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ').replace(/(\d)\/(\d+)/g, '$1 over $2').replace(/\s+/g, ' ').trim();
    if (!clean) return;
    const parts = clean.match(/[^.!?]+[.!?]*["”']?\s*/g) || [clean];
    const voice = SP.pickVoice();
    const rate = +LA.store.settings().rate || 0.9;
    if (opts.button) { currentBtn = opts.button; currentBtn.classList.add('speaking'); }
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p.trim());
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : 'en-AU';
      u.rate = rate;
      u.pitch = 1.05;
      if (i === parts.length - 1) {
        u.onend = () => { if (currentBtn === opts.button && currentBtn) { currentBtn.classList.remove('speaking'); currentBtn = null; } if (opts.onend) opts.onend(); };
      }
      synth.speak(u);
    });
  };

  /* Toggle button helper: click once to read, again to stop */
  SP.toggle = (btn, text) => {
    if (currentBtn === btn) { SP.stop(); return; }
    SP.say(text, { button: btn });
  };
})();

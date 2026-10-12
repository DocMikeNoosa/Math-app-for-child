/* Read-aloud with the device's own voices (works offline, no key).
   Australian section → an Australian English female voice (e.g. "Karen" on iPad).
   Polish section → a Polish female voice (e.g. "Zosia" on iPad). */
(function () {
  'use strict';
  const LA = window.LA;
  const synth = window.speechSynthesis || null;
  const SP = (LA.speech = {});
  let voices = [];
  let currentBtn = null;

  const FEMALE = ['karen', 'catherine', 'natasha', 'matilda', 'annette', 'isabella', 'freya', 'tessa', 'serena', 'kate', 'samantha', 'olivia', 'hayley', 'zosia', 'zofia', 'paulina', 'agnieszka', 'ewa', 'maja', 'ola', 'female', 'kobieta'];
  const MALE = ['lee', 'gordon', 'william', 'darren', 'duncan', 'ken', 'neil', 'tim', 'krzysztof', 'marek', 'jacek', 'jan', 'adam', 'male', 'daniel', 'arthur', 'oliver'];

  function loadVoices() { if (synth) voices = synth.getVoices(); }
  if (synth) {
    loadVoices();
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }

  SP.available = () => !!synth;
  SP.voicesFor = (lang) => voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  function score(v, lang) {
    const n = (v.name + ' ' + v.voiceURI).toLowerCase();
    const l = v.lang.replace('_', '-').toLowerCase();
    let s = 0;
    if (l === lang.toLowerCase()) s += 50;
    else if (l.startsWith(lang.slice(0, 2).toLowerCase())) s += lang === 'en-AU' && /en-(gb|nz)/.test(l) ? 20 : 10;
    if (FEMALE.some((f) => n.includes(f))) s += 15;
    if (MALE.some((m) => new RegExp('\\b' + m + '\\b').test(n))) s -= 25;
    if (/premium|enhanced|natural|neural|online/.test(n)) s += 8;
    if (/compact|novelty|eloquence|bad news|bells|whisper|zarvox|bubbles|jester|organ|superstar/.test(n)) s -= 40;
    return s;
  }
  SP.pickVoice = (lang) => {
    lang = lang || 'en-AU';
    const want = (LA.store.settings().voice || {})[lang];
    if (want) { const v = voices.find((x) => x.voiceURI === want); if (v) return v; }
    const cands = SP.voicesFor(lang);
    if (!cands.length) return null;
    return cands.slice().sort((a, b) => score(b, lang) - score(a, lang))[0];
  };
  SP.langNow = () => LA.PROGRAMMES[LA.state.prog].voice;

  SP.stop = () => {
    if (synth) synth.cancel();
    if (currentBtn) { currentBtn.classList.remove('speaking'); currentBtn = null; }
  };

  function clean(text, lang) {
    let t = String(text || '');
    t = t.replace(/[☐_]{1,}/g, lang === 'pl-PL' ? ' okienko ' : ' blank ');
    if (lang === 'pl-PL') t = t.replace(/·|×/g, ' razy ').replace(/:(?=\s*\d)/g, ' podzielić przez ').replace(/÷/g, ' podzielić przez ').replace(/−/g, ' minus ').replace(/(\d)\/(\d+)/g, '$1 przez $2').replace(/(\d),(\d)/g, '$1 przecinek $2');
    else t = t.replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ').replace(/(\d)\/(\d+)/g, '$1 over $2');
    t = t.replace(/[🔊🎧👀🙈✏️📝⭐🎯🐨🦉📖🔢🔬🗺️🧡🎨💡]/gu, '');
    return t.replace(/\s+/g, ' ').trim();
  }

  /* say(text, {lang, button, onend}) — long text is split into sentences (some browsers stop long utterances) */
  SP.say = (text, opts) => {
    opts = opts || {};
    if (!synth) { if (opts.onend) opts.onend(); return; }
    SP.stop();
    const lang = opts.lang || SP.langNow();
    const t = clean(text, lang);
    if (!t) return;
    const parts = t.match(/[^.!?]+[.!?]*["”']?\s*/g) || [t];
    const voice = SP.pickVoice(lang);
    const rate = +((LA.store.settings().rate || {})[lang]) || 0.92;
    if (opts.button) { currentBtn = opts.button; currentBtn.classList.add('speaking'); }
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p.trim());
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : lang;
      u.rate = opts.rate || rate;
      u.pitch = 1.05;
      if (i === parts.length - 1) u.onend = () => { if (currentBtn === opts.button && currentBtn) { currentBtn.classList.remove('speaking'); currentBtn = null; } if (opts.onend) opts.onend(); };
      synth.speak(u);
    });
  };
  SP.toggle = (btn, text, lang) => { if (currentBtn === btn) { SP.stop(); return; } SP.say(text, { button: btn, lang }); };
  SP.voiceName = (lang) => { const v = SP.pickVoice(lang); return v ? v.name : null; };
})();

/* Matematyka Tosi — web app UI. Pure vanilla JS on top of core.js. */
(function () {
  "use strict";
  const C = window.TosiaCore;
  const $ = (sel) => document.querySelector(sel);

  // ================================================================ storage

  const LS = { state: "tosia.state.v1", attempts: "tosia.attempts.v1", sessions: "tosia.sessions.v1" };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full/private */ }
  }

  const state = Object.assign({
    name: "Tosia", lang: "pl", hasOnboarded: false,
    pinHash: null, recoveryQ: "", recoveryHash: null,
    coins: 0, bestStreak: 0, bestSession: 0, lastPraise: -1,
    theme: "mixed", volume: 1, limitMin: null, overrideDate: null,
  }, loadJSON(LS.state, {}));

  let attempts = loadJSON(LS.attempts, []);
  let sessions = loadJSON(LS.sessions, []);

  function persist() {
    saveJSON(LS.state, state);
    saveJSON(LS.attempts, attempts);
    saveJSON(LS.sessions, sessions);
  }

  // ------------------------------------------------ tiny synchronous SHA-256

  function sha256(str) {
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    const utf8 = new TextEncoder().encode(str);
    const l = utf8.length;
    const bitLen = l * 8;
    const withPad = ((l + 8) >> 6 << 6) + 64;
    const bytes = new Uint8Array(withPad);
    bytes.set(utf8);
    bytes[l] = 0x80;
    new DataView(bytes.buffer).setUint32(withPad - 4, bitLen >>> 0);
    new DataView(bytes.buffer).setUint32(withPad - 8, Math.floor(bitLen / 4294967296));
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
        h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Int32Array(64);
    const view = new DataView(bytes.buffer);
    for (let off = 0; off < withPad; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getInt32(off + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
    }
    return [h0, h1, h2, h3, h4, h5, h6, h7]
      .map((x) => (x >>> 0).toString(16).padStart(8, "0")).join("");
  }

  const hashPin = (pin) => sha256("tosia-pin|" + pin);
  const hashAnswer = (a) => sha256("tosia-recovery|" + a.trim().toLowerCase());

  // ================================================================ i18n

  const t = (pl, en) => (state.lang === "pl" ? pl : en);
  const voc = () => (state.lang === "pl" ? C.vocative(state.name) : state.name);
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const opName = (op) => ({
    addition: t("Dodawanie", "Addition"),
    subtraction: t("Odejmowanie", "Subtraction"),
    multiplication: t("Mnożenie", "Multiplication"),
    division: t("Dzielenie", "Division"),
  }[op]);

  const diffName = (d) => ({
    easy: t("Łatwy", "Easy"), medium: t("Średni", "Medium"),
    hard: t("Trudny", "Hard"), genius: t("Geniusz", "Genius"),
  }[d]);

  const diffHint = (d) => ({
    easy: t("Bez przekraczania dziesiątki, mnożenie przez 2, 5 i 10", "No crossing the tens, times 2, 5 and 10"),
    medium: t("Przekraczanie progu, tabliczka do 5×5", "Crossing the tens, tables up to 5×5"),
    hard: t("Cały zakres i trudne mnożenie: 6, 7, 8, 9", "Full range and hard tables: 6, 7, 8, 9"),
    genius: t("Zagadki z okienkiem i działania dwuetapowe!", "Missing-number puzzles and two-step problems!"),
  }[d]);

  const DIFF_EMOJI = { easy: "🙂", medium: "😃", hard: "🤩", genius: "🧠" };

  function problemHint(p) {
    const tensOnes = (n) => `${n} = ${Math.floor(n / 10) * 10} + ${n % 10}`;
    switch (p.op) {
      case "addition":
        return t(`💡 Najpierw dziesiątki, potem jedności: ${tensOnes(p.a)}, ${tensOnes(p.b)}`,
                 `💡 Tens first, then ones: ${tensOnes(p.a)}, ${tensOnes(p.b)}`);
      case "subtraction":
        return t(`💡 Odejmij najpierw dziesiątki, potem jedności: ${tensOnes(p.b)}`,
                 `💡 Subtract the tens first, then the ones: ${tensOnes(p.b)}`);
      case "multiplication":
        return t(`💡 To ${p.a} grup po ${p.b}. Możesz dodawać: ${p.b} + ${p.b} + …`,
                 `💡 That's ${p.a} groups of ${p.b}. You can add: ${p.b} + ${p.b} + …`);
      case "division":
        return t(`💡 Rozdziel ${p.a} po równo na ${p.b} koszyków`,
                 `💡 Share ${p.a} equally into ${p.b} baskets`);
    }
  }

  // ================================================================ audio

  const sfx = (() => {
    let ctx = null;
    function ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
    function play(notes) {
      const ac = ensure();
      if (!ac || state.volume <= 0.01) return;
      const now = ac.currentTime + 0.02;
      for (const n of notes) {
        const gain = ac.createGain();
        gain.connect(ac.destination);
        const g = (n.gain || 0.4) * state.volume * 0.6;
        gain.gain.setValueAtTime(0, now + n.start);
        gain.gain.linearRampToValueAtTime(g, now + n.start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
        for (const [mult, mix] of [[1, 1], [2, 0.25]]) {
          const osc = ac.createOscillator();
          osc.type = "sine";
          osc.frequency.value = midi(n.m) * mult;
          const og = ac.createGain();
          og.gain.value = mix;
          osc.connect(og); og.connect(gain);
          osc.start(now + n.start);
          osc.stop(now + n.start + n.dur + 0.05);
        }
      }
    }
    const seq = (ms, step, dur, gain) => ms.map((m, i) => ({ m, start: i * step, dur, gain }));
    return {
      unlock: ensure,
      correct: () => play(seq([84, 88, 91], 0.085, 0.22, 0.42)),
      wrong: () => play([{ m: 67, start: 0, dur: 0.22, gain: 0.18 }, { m: 64, start: 0.16, dur: 0.3, gain: 0.16 }]),
      coin: () => play([{ m: 83, start: 0, dur: 0.09, gain: 0.4 }, { m: 88, start: 0.08, dur: 0.55, gain: 0.45 }]),
      fanfare(tier) {
        let ms = [72, 76, 79, 84];
        if (tier >= 2) ms = ms.concat([83, 84]);
        if (tier >= 3) ms = ms.concat([86, 88]);
        if (tier >= 4) ms = ms.concat([91, 88, 91]);
        if (tier >= 5) ms = ms.concat([93, 96, 96]);
        const notes = seq(ms, 0.13, 0.32, 0.42);
        const chordStart = ms.length * 0.13 + 0.05;
        [72, 76, 79, 84].slice(0, 1 + tier).forEach((m, i) =>
          notes.push({ m, start: chordStart + i * 0.01, dur: 0.7 + tier * 0.12, gain: 0.3 }));
        play(notes);
      },
      trophy() {
        const notes = seq([60, 64, 67, 72, 76, 79, 84], 0.07, 0.18, 0.35);
        [72, 76, 79, 84, 88].forEach((m, i) =>
          notes.push({ m, start: 0.6 + i * 0.012, dur: 1.0, gain: 0.28 }));
        play(notes);
      },
      sleepy: () => play([{ m: 79, start: 0, dur: 0.5, gain: 0.22 },
                          { m: 76, start: 0.4, dur: 0.5, gain: 0.2 },
                          { m: 72, start: 0.8, dur: 0.9, gain: 0.18 }]),
    };
  })();

  const buzz = (pattern) => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (e) {} };

  // ================================================================ confetti

  const confetti = (() => {
    const canvas = $("#confetti");
    const cx = canvas.getContext("2d");
    let particles = [];
    let running = false;
    const COLORS = ["#ff6b9c", "#9e70e6", "#73bffa", "#ffc740", "#59cc99", "#ff8c66", "#ffb81a"];
    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
    }
    window.addEventListener("resize", resize);
    resize();
    function burst(count) {
      const now = performance.now();
      for (let i = 0; i < count; i++) {
        particles.push({
          born: now,
          x: (0.2 + Math.random() * 0.6) * canvas.width,
          y: (0.15 + Math.random() * 0.2) * canvas.height,
          vx: (Math.random() - 0.5) * 280 * devicePixelRatio,
          vy: (-260 + Math.random() * 200) * devicePixelRatio,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: (8 + Math.random() * 8) * devicePixelRatio,
          spin: (Math.random() - 0.5) * 12,
          star: Math.random() < 0.5,
        });
      }
      if (!running) { running = true; requestAnimationFrame(frame); }
    }
    function star(ctx2, r) {
      ctx2.beginPath();
      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        ctx2[i ? "lineTo" : "moveTo"](Math.cos(ang) * rad, Math.sin(ang) * rad);
      }
      ctx2.closePath();
    }
    function frame(now) {
      cx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => now - p.born < 3200);
      if (!particles.length) { running = false; return; }
      for (const p of particles) {
        const dt = (now - p.born) / 1000;
        const x = p.x + p.vx * dt;
        const y = p.y + p.vy * dt + 440 * devicePixelRatio * dt * dt;
        cx.save();
        cx.translate(x, y);
        cx.rotate(p.spin * dt);
        cx.globalAlpha = Math.max(0, 1 - dt / 3);
        cx.fillStyle = p.color;
        if (p.star) { star(cx, p.size / 2); cx.fill(); }
        else cx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        cx.restore();
      }
      requestAnimationFrame(frame);
    }
    return { burst };
  })();

  // ================================================================ SVG characters
  // Modern sticker-style mascots: big sparkly eyes with lashes, blush,
  // pastel gradient bodies, blink + wag animations (CSS-driven).

  const FACE = (y = 0, s = 1) => `
    <g transform="translate(0 ${y}) scale(${s})">
      <g class="blink">
        <ellipse cx="-16" cy="-4" rx="8" ry="10" fill="#3a2350"/>
        <circle cx="-18.5" cy="-7.5" r="3.2" fill="#fff"/>
        <circle cx="-13.5" cy="-1" r="1.7" fill="#fff" opacity=".9"/>
        <ellipse cx="16" cy="-4" rx="8" ry="10" fill="#3a2350"/>
        <circle cx="13.5" cy="-7.5" r="3.2" fill="#fff"/>
        <circle cx="18.5" cy="-1" r="1.7" fill="#fff" opacity=".9"/>
      </g>
      <g stroke="#3a2350" stroke-width="2.4" stroke-linecap="round">
        <line x1="-22" y1="-16" x2="-25" y2="-19"/><line x1="-16" y1="-17.5" x2="-17" y2="-21"/>
        <line x1="22" y1="-16" x2="25" y2="-19"/><line x1="16" y1="-17.5" x2="17" y2="-21"/>
      </g>
      <ellipse cx="-29" cy="7" rx="7" ry="4.8" fill="#ff8fb8" opacity=".8"/>
      <ellipse cx="29" cy="7" rx="7" ry="4.8" fill="#ff8fb8" opacity=".8"/>
      <path d="M -10 10 Q 0 20 10 10" stroke="#3a2350" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    </g>`;

  const STAR_D = (() => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? 62 : 27;
      d += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1) + " ";
    }
    return d + "Z";
  })();

  const miniStar = (x, y, s, c) =>
    `<path d="${STAR_D}" fill="${c}" transform="translate(${x} ${y}) scale(${s})"/>`;

  const CHARACTERS = {
    unicorn: `<svg viewBox="-85 -105 170 190">
      <defs>
        <linearGradient id="uniB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe3f1"/>
        </linearGradient>
        <linearGradient id="uniH" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#ffb81a"/><stop offset="1" stop-color="#ffe680"/>
        </linearGradient>
      </defs>
      <g>
        ${["#ff5ca8", "#ffb81a", "#3fd9d0", "#9b6bf2", "#62c5ff", "#ff8fb8"].map((c, i) =>
          `<path d="M ${-42 + i * 17} -48 q ${-8 + (i % 2) * 16} -34 ${4 - (i % 2) * 8} -46"
            stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>`).join("")}
        <polygon points="0,-100 11,-60 -11,-60" fill="url(#uniH)" stroke="#eda612" stroke-width="2"/>
        <ellipse cx="-46" cy="-42" rx="12" ry="18" fill="#fff" transform="rotate(-20 -46 -42)"/>
        <ellipse cx="46" cy="-42" rx="12" ry="18" fill="#fff" transform="rotate(20 46 -42)"/>
        <ellipse cx="-46" cy="-40" rx="6" ry="10" fill="#ffc3d6" transform="rotate(-20 -46 -40)"/>
        <ellipse cx="46" cy="-40" rx="6" ry="10" fill="#ffc3d6" transform="rotate(20 46 -40)"/>
        <circle r="56" fill="url(#uniB)"/>
        ${miniStar(-58, -62, 0.13, "#ffd54d")}${miniStar(60, -50, 0.1, "#ff8fb8")}${miniStar(52, 48, 0.09, "#3fd9d0")}
        ${FACE(6)}
      </g></svg>`,

    puppy: `<svg viewBox="-85 -95 170 180">
      <defs><linearGradient id="pupB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e8bd93"/><stop offset="1" stop-color="#cf9a68"/>
      </linearGradient></defs>
      <g>
        <g class="wag"><ellipse cx="-50" cy="-32" rx="17" ry="37" fill="#a9744a" transform="rotate(26 -50 -32)"/></g>
        <ellipse cx="50" cy="-32" rx="17" ry="37" fill="#a9744a" transform="rotate(-26 50 -32)"/>
        <circle r="56" fill="url(#pupB)"/>
        <ellipse cx="-30" cy="-30" rx="16" ry="20" fill="#fff" opacity=".55"/>
        <ellipse cy="24" rx="23" ry="16" fill="#f7e6cc"/>
        <path d="M -7 12 C -7 8 7 8 7 12 C 7 17 0 20 0 20 C 0 20 -7 17 -7 12 Z" fill="#ff5ca8"/>
        <ellipse cy="38" rx="7" ry="9" fill="#ff8fb8"/>
        ${miniStar(56, -60, 0.1, "#ffd54d")}
        ${FACE(-10)}
      </g></svg>`,

    kitten: `<svg viewBox="-85 -95 170 180">
      <defs><linearGradient id="kitB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#e7dcff"/><stop offset="1" stop-color="#c9b3f5"/>
      </linearGradient></defs>
      <g>
        <polygon points="-56,-30 -42,-74 -18,-40" fill="#c9b3f5"/>
        <polygon points="56,-30 42,-74 18,-40" fill="#c9b3f5"/>
        <polygon points="-47,-38 -41,-62 -28,-44" fill="#ffb3cb"/>
        <polygon points="47,-38 41,-62 28,-44" fill="#ffb3cb"/>
        <circle r="56" fill="url(#kitB)"/>
        <path d="M -14 -66 C -14 -76 -2 -76 0 -68 C 2 -76 14 -76 14 -66 C 14 -58 2 -56 0 -62 C -2 -56 -14 -58 -14 -66 Z"
              fill="#ff5ca8" stroke="#f2308f" stroke-width="2"/>
        <g stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9">
          <line x1="-80" y1="2" x2="-46" y2="6"/><line x1="-80" y1="14" x2="-46" y2="12"/>
          <line x1="80" y1="2" x2="46" y2="6"/><line x1="80" y1="14" x2="46" y2="12"/>
        </g>
        <polygon points="-6,14 6,14 0,21" fill="#ff5ca8"/>
        ${miniStar(-58, 46, 0.09, "#ffd54d")}
        ${FACE(-6)}
      </g></svg>`,

    bunny: `<svg viewBox="-85 -115 170 200">
      <defs><linearGradient id="bunB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe9f3"/>
      </linearGradient></defs>
      <g>
        <ellipse cx="-24" cy="-70" rx="15" ry="44" fill="url(#bunB)" transform="rotate(-9 -24 -70)"/>
        <ellipse cx="24" cy="-70" rx="15" ry="44" fill="url(#bunB)" transform="rotate(9 24 -70)"/>
        <ellipse cx="-24" cy="-65" rx="7.5" ry="30" fill="#ffc3d6" transform="rotate(-9 -24 -65)"/>
        <ellipse cx="24" cy="-65" rx="7.5" ry="30" fill="#ffc3d6" transform="rotate(9 24 -65)"/>
        <circle r="54" cy="2" fill="url(#bunB)"/>
        <g transform="translate(-40 -46)">
          ${[0, 72, 144, 216, 288].map((a) =>
            `<ellipse cx="0" cy="-8" rx="4.5" ry="7.5" fill="#ff8fb8" transform="rotate(${a})"/>`).join("")}
          <circle r="4" fill="#ffd54d"/>
        </g>
        <polygon points="-5,16 5,16 0,22" fill="#ff5ca8"/>
        ${FACE(-2)}
      </g></svg>`,

    rainbow: `<svg viewBox="-85 -70 170 140">
      <g>
        ${["#ff5ca8", "#ffb81a", "#ffd54d", "#38d9a9", "#62c5ff", "#9b6bf2"].map((c, i) =>
          `<path d="M ${-64 + i * 9.5} 34 A ${64 - i * 9.5} ${64 - i * 9.5} 0 0 1 ${64 - i * 9.5} 34"
           stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>`).join("")}
        <g fill="#fff">
          <circle cx="-62" cy="36" r="15"/><circle cx="-49" cy="41" r="12"/><circle cx="-73" cy="42" r="11"/>
          <circle cx="62" cy="36" r="15"/><circle cx="49" cy="41" r="12"/><circle cx="73" cy="42" r="11"/>
        </g>
        ${miniStar(0, -10, 0.11, "#ffd54d")}${miniStar(-30, 6, 0.07, "#ff8fb8")}${miniStar(30, 6, 0.07, "#9b6bf2")}
      </g></svg>`,

    star: `<svg viewBox="-85 -90 170 175">
      <defs><linearGradient id="staB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#ffb81a"/>
      </linearGradient></defs>
      <g>
        <g stroke="#ffd54d" stroke-width="4" stroke-linecap="round" opacity=".8">
          <line x1="-74" y1="-44" x2="-62" y2="-36"/><line x1="74" y1="-44" x2="62" y2="-36"/>
          <line x1="-76" y1="26" x2="-64" y2="22"/><line x1="76" y1="26" x2="64" y2="22"/>
        </g>
        <path d="${STAR_D}" fill="url(#staB)" stroke="#eda612" stroke-width="3" transform="scale(1.12)"/>
        ${FACE(10, 0.95)}
      </g></svg>`,

    dragon: `<svg viewBox="-85 -95 170 180">
      <defs><linearGradient id="draB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9fe8d9"/><stop offset="1" stop-color="#57cdb5"/>
      </linearGradient></defs>
      <g>
        <g class="wag"><path d="M -52 -20 Q -84 -34 -78 -58 Q -66 -46 -50 -46 Z" fill="#c3a1ff"/></g>
        <path d="M 52 -20 Q 84 -34 78 -58 Q 66 -46 50 -46 Z" fill="#c3a1ff"/>
        <polygon points="-24,-52 -14,-76 -4,-54" fill="#ffd54d"/>
        <polygon points="24,-52 14,-76 4,-54" fill="#ffd54d"/>
        <circle r="56" fill="url(#draB)"/>
        <ellipse cy="28" rx="26" ry="17" fill="#eafcf4"/>
        <circle cx="-7" cy="17" r="3" fill="#2a6653" opacity=".5"/>
        <circle cx="7" cy="17" r="3" fill="#2a6653" opacity=".5"/>
        ${miniStar(58, -56, 0.1, "#ff8fb8")}
        ${FACE(-9)}
      </g></svg>`,

    teddy: `<svg viewBox="-85 -95 170 180">
      <defs><linearGradient id="tedB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dfb68a"/><stop offset="1" stop-color="#c49361"/>
      </linearGradient></defs>
      <g>
        <circle cx="-45" cy="-46" r="22" fill="url(#tedB)"/><circle cx="45" cy="-46" r="22" fill="url(#tedB)"/>
        <circle cx="-45" cy="-46" r="11" fill="#f7e2c4"/><circle cx="45" cy="-46" r="11" fill="#f7e2c4"/>
        <circle r="57" fill="url(#tedB)"/>
        <ellipse cy="24" rx="23" ry="16" fill="#f7e2c4"/>
        <path d="M -8 8 C -8 3 8 3 8 8 C 8 14 0 18 0 18 C 0 18 -8 14 -8 8 Z" fill="#ff5ca8"/>
        ${miniStar(-58, -58, 0.1, "#ffd54d")}
        ${FACE(-10)}
      </g></svg>`,
  };

  const THEME_POOL = {
    unicorns: ["unicorn", "rainbow", "star"],
    puppies: ["puppy", "teddy", "star"],
    kittens: ["kitten", "bunny", "star"],
    mixed: Object.keys(CHARACTERS),
  };

  // ================================================================ shared widgets

  const coinSvg = (n) => `<span class="coin">★</span>`;
  const coinCounter = () =>
    `<span class="coin-counter" id="coins">${coinSvg()}<span>${state.coins}</span></span>`;

  const starsWidget = (filled) =>
    `<span class="stars" aria-label="${filled}/5 ⭐">${[0, 1, 2, 3, 4].map((i) =>
      `<span class="${i < filled ? "on" : "off"}">★</span>`).join("")}</span>`;

  const trophyEmblem = (trophy, locked, size = 54) =>
    `<span class="trophy-emblem ${locked ? "locked" : ""}" style="font-size:0">
      <span class="base" style="font-size:${size}px">${trophy.base}</span>
      <span class="badge" style="font-size:${Math.round(size * 0.45)}px">${trophy.badge}</span>
    </span>`;

  const pinDots = (n, shake) =>
    `<div class="pin-dots ${shake ? "shake" : ""}">${[0, 1, 2, 3].map((i) =>
      `<i class="${i < n ? "on" : ""}"></i>`).join("")}</div>`;

  const pinPad = (action) => `
    <div class="pin-pad">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) =>
        `<button class="key squishy" data-action="${action}" data-d="${d}">${d}</button>`).join("")}
      <span></span>
      <button class="key squishy" data-action="${action}" data-d="0">0</button>
      <button class="key back squishy" data-action="${action}" data-d="back">⌫</button>
    </div>`;

  // ================================================================ UI state

  const ui = {
    screen: state.hasOnboarded && state.pinHash ? "home" : "onboarding",
    ob: { step: 0, pin: "", pin2: "", mismatch: false },
    config: { operations: [], range: 100, difficulty: "medium" },
    rangePicked: false,
    pc: null,                 // PracticeCore
    praiseTimer: null,
    fancyOpen: false,
    overlay: null,            // "treasures" | "gate" | "parent" | "tutorial" | "celebration" | "limit"
    gate: { entered: "", wrong: false, mode: "enter", newPin: "", newPin2: "", mismatch: false, answer: "", failed: false, onOk: null },
    parentTab: "settings",
    stats: { frame: "week", start: "", end: "" },
    celebration: null,        // {milestoneNumber, collected, flying, trophy, showTrophy}
    certUrl: null,
    certBusy: false,
    certStats: true,
    tutorial: null,           // {plan, index, timers: []}
    limitReached: false,
  };

  // ================================================================ usage tracking + time limit

  let certBlob = null;

  let currentSession = { start: Date.now(), dur: 0 };
  sessions.push(currentSession);

  function heartbeat() {
    currentSession.dur = Math.round((Date.now() - currentSession.start) / 1000);
    saveJSON(LS.sessions, sessions);
    checkLimit();
  }

  function checkLimit() {
    const now = Date.now();
    const used = C.usedSecondsToday(sessions, null, now);
    const override = C.overrideActive(state.overrideDate, now);
    const ls = C.limitState(used, state.limitMin, override);
    const banner = $("#banner");
    if (ls.state === "warning") {
      banner.textContent = t("⏰ Jeszcze 5 minutek zabawy!", "⏰ 5 more minutes of fun!");
    } else {
      banner.textContent = "";
    }
    const reachedNow = ls.state === "reached";
    if (reachedNow && !ui.limitReached) sfx.sleepy();
    if (reachedNow !== ui.limitReached) {
      ui.limitReached = reachedNow;
      render();
    }
  }

  setInterval(heartbeat, 15000);
  window.addEventListener("visibilitychange", heartbeat);
  window.addEventListener("pagehide", heartbeat);

  // ================================================================ render

  let lastShown = null;

  function render() {
    const app = $("#app");
    const shownNow = ui.limitReached && state.hasOnboarded ? "limit" : ui.screen;
    if (shownNow !== lastShown) {
      lastShown = shownNow;
      app.style.animation = "none";
      void app.offsetWidth; // restart the animation
      app.style.animation = "screenIn .5s cubic-bezier(.22, 1.4, .36, 1)";
    }
    if (ui.limitReached && state.hasOnboarded) {
      app.innerHTML = renderLimitReached();
      $("#overlay").innerHTML = ui.overlay === "gate" ? renderGate() : "";
      return;
    }
    switch (ui.screen) {
      case "onboarding": app.innerHTML = renderOnboarding(); break;
      case "home": app.innerHTML = renderHome(); break;
      case "range": app.innerHTML = renderRange(); break;
      case "level": app.innerHTML = renderLevel(); break;
      case "practice": app.innerHTML = renderPractice(); break;
    }
    const ov = $("#overlay");
    switch (ui.overlay) {
      case "treasures": ov.innerHTML = renderTreasures(); break;
      case "gate": ov.innerHTML = renderGate(); break;
      case "parent": ov.innerHTML = renderParent(); break;
      case "tutorial": ov.innerHTML = renderTutorial(); startTutorialStep(); break;
      case "celebration": ov.innerHTML = renderCelebration(); break;
      default: ov.innerHTML = "";
    }
  }

  // ---------------------------------------------------------------- onboarding

  function renderOnboarding() {
    const ob = ui.ob;
    if (ob.step === 0) {
      return `
        <div style="margin:auto 0">
        <div style="text-align:center;font-size:56px">🧮✨</div>
        <h1>${t("Witaj! Zanim zaczniemy — ustaw kod rodzica.",
                "Welcome! Before we begin — set your parent code.")}</h1>
        <label class="subtitle">${t("Imię dziecka", "Child's name")}</label>
        <input type="text" id="ob-name" value="${esc(state.name)}" maxlength="20">
        <label class="subtitle">${t("Język / Language", "Language / Język")}</label>
        <div class="chips" style="justify-content:center">
          <button class="chip ${state.lang === "pl" ? "on" : ""}" data-action="set-lang" data-lang="pl">Polski</button>
          <button class="chip ${state.lang === "en" ? "on" : ""}" data-action="set-lang" data-lang="en">English</button>
        </div>
        <button class="big-btn squishy" data-action="ob-next" id="next-btn">${t("Dalej →", "Next →")}</button>
        </div>`;
    }
    if (ob.step === 1 || ob.step === 2) {
      const val = ob.step === 1 ? ob.pin : ob.pin2;
      return `
        <div style="margin:auto 0;text-align:center">
        <div style="font-size:48px">🔐</div>
        <h1>${ob.step === 1
          ? t("Ustaw 4-cyfrowy kod rodzica", "Set a 4-digit parent code")
          : t("Powtórz kod, aby potwierdzić", "Repeat the code to confirm")}</h1>
        ${pinDots(val.length, ob.mismatch)}
        ${ob.mismatch ? `<p class="err">${t("Kody się różnią — spróbuj jeszcze raz", "The codes don't match — try again")}</p>` : ""}
        ${pinPad("ob-pin")}
        </div>`;
    }
    return `
      <div style="margin:auto 0">
      <div style="text-align:center;font-size:48px">🛟</div>
      <h1>${t("Pytanie pomocnicze (gdybyś zapomniał/a kodu)",
              "Security question (in case you forget the code)")}</h1>
      <input type="text" id="ob-q" placeholder="${t("np. Jak miał na imię mój pierwszy pupil?", "e.g. What was my first pet's name?")}">
      <input type="text" id="ob-a" placeholder="${t("Odpowiedź", "Answer")}">
      <button class="big-btn mint squishy" data-action="ob-finish" id="next-btn">${t("Zaczynamy! 🎉", "Let's go! 🎉")}</button>
      </div>`;
  }

  // ---------------------------------------------------------------- setup screens

  function renderHome() {
    const OP_COLOR = { addition: "--mint", subtraction: "--sky", multiplication: "--coral", division: "--purple" };
    const sel = ui.config.operations;
    const all = sel.length === 4;
    return `
      <div class="topbar"><span class="side"></span><span class="side right">${coinCounter()}</span></div>
      <h1>${t("Co dziś ćwiczymy?", "What are we practicing today?")}</h1>
      <div class="grid2">
        ${C.OPS.map((op) => `
          <button class="tile squishy ${sel.includes(op) ? "selected" : ""}" data-action="toggle-op" data-op="${op}">
            <span class="emoji">${C.OP_EMOJI[op]}</span>${opName(op)}
          </button>`).join("")}
      </div>
      <button class="tile squishy ${all ? "selected" : ""}" data-action="toggle-random" data-testid="random">
        <span class="emoji">🎲</span>${t("Losowo", "Random")}
      </button>
      <div style="flex:1"></div>
      <button class="big-btn squishy" data-action="go-range" id="next-btn" ${sel.length ? "" : "disabled"}>
        ${t("Dalej →", "Next →")}</button>
      <div class="bottombar">
        <button class="iconbtn gear squishy" data-action="open-gate" aria-label="${t("Strefa rodzica", "Parent zone")}">⚙️</button>
        <button class="iconbtn squishy" data-action="open-treasures" aria-label="${t("Moje skarby", "My Treasures")}">
          🧰<div style="font-size:11px;font-weight:800;color:var(--deep-purple)">${t("Moje skarby", "My Treasures")}</div>
        </button>
      </div>`;
  }

  function renderRange() {
    return `
      <div class="topbar">
        <span class="side"><button class="back-btn squishy" data-action="go-home">←</button></span>
        <span class="side right">${coinCounter()}</span>
      </div>
      <h1>${t("Do jakiej liczby liczymy?", "What numbers are we going up to?")}</h1>
      <div class="stack" style="max-width:320px;margin:8px auto;width:100%">
        ${C.RANGES.map((r) => `
          <button class="tile squishy ${ui.config.range === r ? "selected" : ""}" data-action="pick-range" data-range="${r}">
            <span style="font-size:34px">${r}</span>
          </button>`).join("")}
      </div>
      <div style="flex:1"></div>
      <button class="big-btn squishy" data-action="go-level" id="next-btn">${t("Dalej →", "Next →")}</button>`;
  }

  function renderLevel() {
    return `
      <div class="topbar">
        <span class="side"><button class="back-btn squishy" data-action="go-range">←</button></span>
        <span class="side right">${coinCounter()}</span>
      </div>
      <h1>${t("Wybierz poziom", "Choose your level")}</h1>
      <div class="stack">
        ${C.DIFFICULTIES.map((d) => `
          <button class="tile squishy ${ui.config.difficulty === d ? "selected" : ""}" data-action="pick-diff" data-diff="${d}">
            <span style="font-size:26px">${DIFF_EMOJI[d]}</span> ${diffName(d)}
            <span class="hint">${diffHint(d)}</span>
          </button>`).join("")}
      </div>
      <div style="flex:1"></div>
      <button class="big-btn mint squishy" data-action="start-practice" id="next-btn">${t("Zaczynamy! 🚀", "Let's start! 🚀")}</button>`;
  }

  // ---------------------------------------------------------------- practice

  function renderPractice() {
    const pc = ui.pc;
    const parts = C.promptParts(pc.problem);
    const typed = pc.typed;
    return `
      <div class="topbar">
        <span class="side"><button class="back-btn squishy" data-action="go-home">←</button></span>
        ${starsWidget(pc.streakStars)}
        <span class="side right">${coinCounter()}</span>
      </div>
      <div class="problem" id="problem" aria-label="${esc(C.displayText(pc.problem))}">
        ${esc(parts.prefix)}<span class="typed ${typed ? "" : "empty"}">${typed || "?"}</span>${esc(parts.suffix)}
      </div>
      <div class="feedback" id="feedback">${renderFeedback(pc)}</div>
      <div class="keypad">
        ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) =>
          `<button class="key squishy" data-action="key" data-key="${d}">${d}</button>`).join("")}
        <button class="key back squishy" data-action="key" data-key="back" aria-label="⌫">⌫</button>
        <button class="key squishy" data-action="key" data-key="0">0</button>
        <button class="key ok squishy" data-action="key" data-key="ok">✓ ${t("Sprawdź", "Check")}</button>
      </div>
      <div class="bottombar">
        <button class="iconbtn gear squishy" data-action="open-gate" aria-label="${t("Strefa rodzica", "Parent zone")}">⚙️</button>
        <button class="iconbtn squishy" data-action="open-treasures" aria-label="${t("Moje skarby", "My Treasures")}">🧰</button>
      </div>`;
  }

  function renderFeedback(pc) {
    if (pc.phase.name === "praise") {
      const phrase = C.praiseAt(pc.praiseIndex);
      const text = C.formatPhrase(state.lang === "pl" ? phrase.pl : phrase.en, state.lang, state.name);
      let html = `<div class="praise" id="praise">${esc(text)}`;
      if (phrase.fancy) {
        html += `<button class="fancy-btn squishy" data-action="toggle-fancy" aria-label="${t("Co to znaczy?", "What does it mean?")}">💬</button>`;
      }
      html += "</div>";
      if (ui.fancyOpen && phrase.fancy) {
        html += `<div class="fancy-meaning">„${phrase.fancy.word}” — ${state.lang === "pl" ? phrase.fancy.pl : phrase.fancy.en}</div>`;
      }
      return html;
    }
    if (pc.phase.name === "tryAgain") {
      const first = pc.phase.attempt === 1;
      let html = `<div class="oops" id="oops">${first
        ? t(`Spróbuj jeszcze raz, ${voc()}! 💪`, `Try again, ${esc(state.name)}! 💪`)
        : t("Jeszcze chwilka — spójrz na podpowiedź! 🌟", "Almost there — look at the hint! 🌟")}</div>`;
      if (!first) html += `<div class="hint-box">${esc(problemHint(pc.problem))}</div>`;
      return html;
    }
    return "";
  }

  function startPractice() {
    ui.pc = new C.PracticeCore(ui.config, Date.now(), Math.random);
    ui.screen = "practice";
    render();
  }

  function pressKey(key) {
    const pc = ui.pc;
    if (!pc) return;
    buzz(8);
    if (key === "back") { pc.tapBackspace(); render(); return; }
    if (key !== "ok") { pc.tapDigit(parseInt(key, 10)); render(); return; }

    const result = pc.submit(state.lastPraise, Date.now(), Math.random);
    if (result.type === "correct") {
      attempts.push(result.outcome);
      state.lastPraise = pc.praiseIndex;
      state.bestStreak = Math.max(state.bestStreak, pc.runningStreak);
      state.bestSession = Math.max(state.bestSession, pc.correctCount);
      persist();
      ui.fancyOpen = false;
      sfx.correct();
      buzz([30, 40, 30]);
      confetti.burst(40);
      clearTimeout(ui.praiseTimer);
      ui.praiseTimer = setTimeout(() => {
        pc.advanceAfterPraise(Date.now(), Math.random);
        if (pc.phase.name === "celebration") {
          openCelebration(pc.phase.milestoneNumber);
        }
        render();
      }, 1500);
    } else if (result.type === "wrong") {
      sfx.wrong();
      buzz([60, 60, 60]);
    } else if (result.type === "tutorial") {
      sfx.wrong();
      buzz([60, 60, 60]);
      ui.tutorial = { plan: C.tutorialPlan(pc.problem), index: 0, timers: [] };
      ui.overlay = "tutorial";
    }
    render();
  }

  // ---------------------------------------------------------------- tutorial

  function renderTutorial() {
    const tut = ui.tutorial;
    const step = tut.plan[tut.index];
    const last = tut.index >= tut.plan.length - 1;
    return `
      <div class="fullscreen">
        <h1>${t("Zobaczmy to razem! 🧡", "Let's look at it together! 🧡")}</h1>
        <div class="tut-problem">${esc(C.displayText(ui.pc.problem))}</div>
        <div class="tut-stage" id="tut-stage">${renderTutorialStep(step)}</div>
        <button class="big-btn ${last ? "mint" : ""} squishy" data-action="tut-next" id="tut-next" style="max-width:420px">
          ${last ? t("Nowe zadanie!", "New problem!") : t("Dalej →", "Next →")}
        </button>
      </div>`;
  }

  function renderTutorialStep(step) {
    switch (step.type) {
      case "say":
        return `<div class="owl">🦉</div><div class="bubble">${esc(state.lang === "pl" ? step.pl : step.en)}</div>`;
      case "decompose":
        return `
          <div class="numcard purple">${step.number}</div>
          <div class="decompose-arrow">↓</div>
          <div class="decompose">
            <span class="numcard sky">${step.tens}</span><span>+</span><span class="numcard coral">${step.ones}</span>
          </div>`;
      case "numberLine": return renderNumberLine(step);
      case "groups":
        return `
          <div class="groups-grid" id="groups">
            ${Array.from({ length: step.count }, (_, g) =>
              `<div class="group-card" data-g="${g}">${"🍎".repeat(step.size)}</div>`).join("")}
          </div>
          <div class="sum-line" id="sum-line">&nbsp;</div>`;
      case "sharing":
        return `
          <div class="share-top">🍎 × <span id="share-left">${step.total}</span></div>
          <div class="baskets" id="baskets">
            ${Array.from({ length: step.baskets }, (_, b) => `
              <div class="basket">
                <div class="apples" data-b="${b}"></div>
                <div class="b">🧺</div>
                <div class="n" data-n="${b}">0</div>
              </div>`).join("")}
          </div>
          <div class="sum-line" id="share-result">&nbsp;</div>`;
      case "reveal":
        return `
          <div class="reveal-box">
            <div style="font-size:52px">🎉</div>
            <div class="reveal-statement">${esc(step.statement)}</div>
            <div class="reveal-answer" id="reveal-answer">${step.answer}</div>
          </div>`;
    }
  }

  function renderNumberLine(step) {
    const start = step.start;
    const result = step.subtract ? step.start - step.jump : step.start + step.jump;
    const lo = Math.min(start, result), hi = Math.max(start, result);
    const pad = Math.max(2, Math.floor((hi - lo) / 5));
    const axisLo = Math.max(0, lo - pad), axisHi = hi + pad;
    const W = 360, Y = 130;
    const x = (v) => 20 + (W - 40) * (v - axisLo) / Math.max(1, axisHi - axisLo);
    const tickStep = (axisHi - axisLo) <= 20 ? 5 : 10;
    const ticks = new Set([start, result]);
    for (let v = Math.ceil(axisLo / tickStep) * tickStep; v < axisHi; v += tickStep) ticks.add(v);
    const x1 = x(start), x2 = x(result);
    const arc = `M ${x1} ${Y} Q ${(x1 + x2) / 2} ${Y - 75} ${x2} ${Y}`;
    return `
      <div class="jump-label ${step.subtract ? "sub" : "add"}">${step.subtract ? "−" : "+"}${step.jump}</div>
      <div class="numline"><svg viewBox="0 0 ${W} 185">
        <line x1="8" y1="${Y}" x2="${W - 8}" y2="${Y}" stroke="#9e70e688" stroke-width="3"/>
        ${[...ticks].sort((a, b) => a - b).map((v) => `
          <line x1="${x(v)}" y1="${Y - 7}" x2="${x(v)}" y2="${Y + 7}" stroke="#9e70e666" stroke-width="2"/>
          <text x="${x(v)}" y="${Y + 24}" text-anchor="middle" font-size="13" font-weight="700" fill="#8b81a5">${v}</text>`).join("")}
        <path d="${arc}" fill="none" stroke="${step.subtract ? "#ff8c66" : "#59cc99"}" stroke-width="5"
              stroke-linecap="round" stroke-dasharray="2 10" pathLength="100"
              style="stroke-dashoffset:100;stroke-dasharray:100;animation:dash 1.6s .4s ease forwards">
          <!-- dash animation via attribute below for broad support -->
        </path>
        <text x="${x1}" y="${Y - 16}" text-anchor="middle" font-size="24" font-weight="900" fill="#7a4fd0">${start}</text>
        <text x="${x2}" y="${Y - 16}" text-anchor="middle" font-size="24" font-weight="900"
              fill="${step.subtract ? "#ff8c66" : "#2fae7d"}" opacity="0" id="nl-result">${result}</text>
        <text id="nl-bunny" font-size="26" x="${x1}" y="${Y - 30}">🐇</text>
      </svg></div>`;
  }

  /** Kick off per-step animations after the tutorial DOM is in place. */
  function startTutorialStep() {
    const tut = ui.tutorial;
    if (!tut) return;
    tut.timers.forEach(clearInterval);
    tut.timers = [];
    const step = tut.plan[tut.index];

    if (step.type === "numberLine") {
      const bunny = $("#nl-bunny");
      const resultLabel = $("#nl-result");
      const path = document.querySelector(".numline path");
      if (path) {
        path.style.transition = "stroke-dashoffset 1.6s ease .4s";
        requestAnimationFrame(() => { path.style.strokeDashoffset = "0"; });
      }
      if (bunny) {
        const start = step.start;
        const result = step.subtract ? step.start - step.jump : step.start + step.jump;
        const x1 = parseFloat(bunny.getAttribute("x"));
        const svg = bunny.closest("svg");
        const texts = svg.querySelectorAll("text");
        let x2 = x1;
        texts.forEach((tx) => { if (tx.id === "nl-result") x2 = parseFloat(tx.getAttribute("x")); });
        const t0 = performance.now() + 400;
        const D = 1600;
        function hop(now) {
          if (!bunny.isConnected) return;
          const k = Math.min(1, Math.max(0, (now - t0) / D));
          bunny.setAttribute("x", String(x1 + (x2 - x1) * k - 12));
          bunny.setAttribute("y", String(130 - 30 - Math.abs(Math.sin(k * Math.PI * 3)) * 30));
          if (k < 1) requestAnimationFrame(hop);
          else if (resultLabel) resultLabel.setAttribute("opacity", "1");
        }
        requestAnimationFrame(hop);
      }
    }

    if (step.type === "groups") {
      let shown = 0;
      const timer = setInterval(() => {
        shown++;
        document.querySelectorAll(".group-card").forEach((el, i) => {
          if (i < shown) el.classList.add("shown");
        });
        const sum = $("#sum-line");
        if (sum) {
          const terms = Array(Math.min(shown, step.count)).fill(step.size).join(" + ");
          sum.textContent = shown >= step.count ? `${terms} = ${step.count * step.size}` : terms;
        }
        if (shown >= step.count) clearInterval(timer);
      }, 650);
      tut.timers.push(timer);
    }

    if (step.type === "sharing") {
      let dealt = 0;
      const per = step.total > 20 ? 120 : 250;
      const timer = setInterval(() => {
        dealt++;
        const left = $("#share-left");
        if (left) left.textContent = String(step.total - dealt);
        for (let b = 0; b < step.baskets; b++) {
          const inBasket = Math.floor(dealt / step.baskets) + (dealt % step.baskets > b ? 1 : 0);
          const apples = document.querySelector(`.apples[data-b="${b}"]`);
          const n = document.querySelector(`.n[data-n="${b}"]`);
          if (apples) apples.textContent = "🍎".repeat(Math.min(inBasket, 10));
          if (n) n.textContent = String(inBasket);
        }
        if (dealt >= step.total) {
          clearInterval(timer);
          const res = $("#share-result");
          if (res) res.textContent = `${step.total} ÷ ${step.baskets} = ${step.total / step.baskets}`;
        }
      }, per);
      tut.timers.push(timer);
    }
  }

  function tutorialNext() {
    const tut = ui.tutorial;
    if (tut.index >= tut.plan.length - 1) {
      tut.timers.forEach(clearInterval);
      const outcome = ui.pc.finishTutorial(Date.now(), Math.random);
      attempts.push(outcome);
      persist();
      ui.tutorial = null;
      ui.overlay = null;
    } else {
      tut.index++;
    }
    render();
  }

  // ---------------------------------------------------------------- celebration

  function openCelebration(milestoneNumber) {
    const tierN = C.tier(milestoneNumber);
    ui.celebration = { milestoneNumber, collected: false, flying: false, trophy: null, showTrophy: false };
    ui.overlay = "celebration";
    sfx.fanfare(tierN);
    buzz([80, 60, 80, 60, 120]);
    confetti.burst(30 + tierN * 25);
  }

  function renderCelebration() {
    const cel = ui.celebration;
    const tierN = C.tier(cel.milestoneNumber);
    const pool = THEME_POOL[state.theme] || THEME_POOL.mixed;
    const chars = Array.from({ length: Math.min(tierN, 5) },
      (_, i) => pool[(cel.milestoneNumber + i) % pool.length]);
    const main = chars[0];
    const sides = chars.slice(1);
    const sidePos = ["left:-4%;bottom:0", "right:-4%;bottom:0", "left:10%;bottom:62%", "right:10%;bottom:62%"];
    const hearts = tierN >= 2
      ? `<div class="hearts">${Array.from({ length: tierN * 3 }, (_, i) =>
          `<span style="left:${8 + Math.random() * 84}%;animation-delay:${i * 0.5}s;font-size:${18 + Math.random() * 16}px">💜</span>`).join("")}</div>`
      : "";
    const sparkleGlyphs = ["✨", "💖", "⭐", "🫧", "🌸", "💫"];
    const orbit = Array.from({ length: 5 + tierN * 2 }, (_, i) =>
      `<span style="left:${(6 + Math.random() * 88).toFixed(0)}%;top:${(Math.random() * 92).toFixed(0)}%;animation-delay:${(i * 0.33).toFixed(2)}s;font-size:${(15 + Math.random() * 17).toFixed(0)}px">${sparkleGlyphs[i % sparkleGlyphs.length]}</span>`).join("");
    // The star of the show fills most of the screen; each tier adds size,
    // sparkles and (from tier 4) a rainbow halo.
    const mainSize = `min(${62 + tierN * 6}vw, ${290 + tierN * 26}px)`;
    return `
      <div class="fullscreen celebration" data-action="cel-skip">
        ${hearts}
        <h1 id="cel-headline">${esc(C.milestoneHeadline(cel.milestoneNumber, state.lang, state.name))}</h1>
        <div class="characters">
          ${tierN >= 4 ? '<div class="rainbow-halo"></div>' : ""}
          <span class="char main" style="width:${mainSize}">${CHARACTERS[main]}</span>
          ${sides.map((c, i) => `
            <span class="char side" style="${sidePos[i % sidePos.length]};width:min(24vw, 110px);animation-delay:${(0.22 + i * 0.17).toFixed(2)}s">
              ${CHARACTERS[c]}
            </span>`).join("")}
          <span class="orbit">${orbit}</span>
        </div>
        ${cel.collected
          ? `<button class="big-btn sky squishy" data-action="cel-done" id="cel-done" style="max-width:320px">${t("Dalej!", "Onward!")}</button>`
          : `<button class="collect-btn squishy ${cel.flying ? "flying" : ""}" data-action="collect-coin" id="collect-coin">
               ${coinSvg()} ${t("Zbierz złotą monetę!", "Collect your gold coin!")}</button>`}
        ${cel.showTrophy && cel.trophy ? `
          <div class="trophy-stage">
            <div class="trophy-card">
              <h2>${t("Nowe trofeum!", "New trophy!")}</h2>
              ${trophyEmblem(cel.trophy, false, 84)}
              <div class="name">${esc(state.lang === "pl" ? cel.trophy.pl : cel.trophy.en)}</div>
              <button class="big-btn mint squishy" data-action="cel-done">${t("Dalej!", "Onward!")}</button>
            </div>
          </div>` : ""}
      </div>`;
  }

  function awardCoin() {
    const cel = ui.celebration;
    if (!cel || cel.collected || cel.flying) return false;
    state.coins++;
    cel.trophy = C.trophyUnlockedAt(state.coins);
    persist();
    return true;
  }

  function collectCoin() {
    const cel = ui.celebration;
    if (!awardCoin()) return;
    cel.flying = true;
    sfx.coin();
    buzz(40);
    const btn = $("#collect-coin");
    if (btn) btn.classList.add("flying");
    setTimeout(() => {
      cel.collected = true;
      cel.flying = false;
      if (cel.trophy) {
        cel.showTrophy = true;
        sfx.trophy();
        buzz([80, 60, 80, 60, 160]);
      }
      render();
    }, 560);
  }

  function celebrationDone() {
    const cel = ui.celebration;
    if (!cel) return;
    if (!cel.collected && !cel.flying) {
      // Leaving without tapping still banks the coin — never lose one.
      awardCoin();
      if (cel.trophy && !cel.showTrophy) {
        cel.collected = true;
        cel.showTrophy = true;
        sfx.trophy();
        render();
        return;
      }
    }
    if (cel.flying) return; // wait for the coin animation
    ui.celebration = null;
    ui.overlay = null;
    ui.pc.finishCelebration(Date.now(), Math.random);
    render();
  }

  // ---------------------------------------------------------------- treasures

  function renderTreasures() {
    const badges = C.computeBadges(attempts, state.coins, state.bestStreak);
    const themes = [["unicorns", "🦄", t("Jednorożce", "Unicorns")], ["puppies", "🐶", t("Pieski", "Puppies")],
                    ["kittens", "🐱", t("Kotki", "Kittens")], ["mixed", "🌈", t("Wszystko!", "Everything!")]];
    return `
      <div class="overlay-backdrop" data-action="close-overlay">
        <div class="sheet" data-action="noop">
          <div class="sheet-head">
            <h2>🧰 ${t("Moje skarby", "My Treasures")}</h2>
            <button class="close-x squishy" data-action="close-overlay">✕</button>
          </div>
          <div class="card gold">
            <div style="font-size:34px">${"🪙".repeat(Math.max(1, Math.min(state.coins, 7)))}</div>
            <div class="coins-big" id="treasure-coins">${state.coins}</div>
            <div class="subtitle">${t("Złote monety", "Gold coins")}</div>
          </div>
          <div class="card">
            <h3>🏆 ${t("Trofea", "Trophies")}</h3>
            <div class="trophy-grid">
              ${C.TROPHIES.map((tr) => {
                const earned = state.coins >= tr.coins;
                return `<div class="trophy-cell">
                  ${trophyEmblem(tr, !earned)}
                  <div class="tname" style="color:${earned ? "var(--deep-purple)" : "#9a93ab"}">
                    ${earned ? esc(state.lang === "pl" ? tr.pl : tr.en) : `🪙 ${tr.coins}`}</div>
                  <div class="shelf"></div>
                </div>`;
              }).join("")}
            </div>
          </div>
          <div class="card">
            <div class="streak-row">
              <div><div style="font-size:30px">🔥</div><div class="big" style="color:var(--coral)">${state.bestStreak}</div>
                <div class="subtitle">${t("Najlepsza seria", "Best streak")}</div></div>
              <div><div style="font-size:30px">🚀</div><div class="big" style="color:var(--sky)">${state.bestSession}</div>
                <div class="subtitle">${t("Rekord jednej sesji", "One-session record")}</div></div>
            </div>
          </div>
          <div class="card">
            <h3>🎖️ ${t("Odznaki", "Badges")}</h3>
            <div class="badge-grid">
              ${badges.map((b) => `
                <div class="badge-cell ${b.earned ? "earned" : "locked"}">
                  <span class="be">${b.emoji}</span>
                  <span><div class="bn" style="color:${b.earned ? "var(--deep-purple)" : "#9a93ab"}">${esc(state.lang === "pl" ? b.pl : b.en)}</div>
                  <div class="bd">${esc(state.lang === "pl" ? b.descPl : b.descEn)}</div></span>
                </div>`).join("")}
            </div>
          </div>
          <div class="card">
            <h3>🎨 ${t("Ulubiony motyw świętowania", "Favorite celebration theme")}</h3>
            <div class="theme-row">
              ${themes.map(([id, emoji, name]) => `
                <button class="tile squishy ${state.theme === id ? "selected" : ""}" data-action="pick-theme" data-theme="${id}">
                  <span class="emoji">${emoji}</span>${name}
                </button>`).join("")}
            </div>
          </div>
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- PIN gate

  function renderGate() {
    const g = ui.gate;
    let inner;
    if (g.mode === "recovery") {
      inner = `
        <div style="text-align:center;font-size:44px">🛟</div>
        <h2 style="text-align:center">${esc(state.recoveryQ || t("Brak pytania pomocniczego", "No security question set"))}</h2>
        <input type="text" id="gate-answer" placeholder="${t("Odpowiedź", "Answer")}" value="${esc(g.answer)}">
        ${g.failed ? `<p class="err">${t("To nie ta odpowiedź", "That's not the right answer")}</p>` : ""}
        <button class="big-btn sky squishy" data-action="gate-check-answer">${t("Sprawdź", "Check")}</button>`;
    } else if (g.mode === "newpin") {
      const val = g.newPin.length < 4 ? g.newPin : g.newPin2;
      inner = `
        <div style="text-align:center;font-size:44px">🔐</div>
        <h2 style="text-align:center">${g.newPin.length < 4
          ? t("Ustaw nowy kod", "Set a new code") : t("Powtórz nowy kod", "Repeat the new code")}</h2>
        ${pinDots(val.length, g.mismatch)}
        ${g.mismatch ? `<p class="err">${t("Kody się różnią", "Codes don't match")}</p>` : ""}
        ${pinPad("gate-newpin")}`;
    } else {
      inner = `
        <div style="text-align:center;font-size:44px">⚙️</div>
        <h2 style="text-align:center">${t("Podaj kod rodzica", "Enter parent code")}</h2>
        ${pinDots(g.entered.length, g.wrong)}
        ${g.wrong ? `<p class="err">${t("Nieprawidłowy kod — spróbuj ponownie", "Wrong code — try again")}</p>` : ""}
        ${pinPad("gate-pin")}
        <button class="linklike" data-action="gate-forgot">${t("Nie pamiętam kodu", "I forgot the code")}</button>`;
    }
    return `
      <div class="overlay-backdrop center" data-action="close-overlay">
        <div class="sheet" data-action="noop">
          <div class="sheet-head"><span></span>
            <button class="close-x squishy" data-action="close-overlay">✕</button></div>
          ${inner}
        </div>
      </div>`;
  }

  function openGate(onOk) {
    ui.gate = { entered: "", wrong: false, mode: "enter", newPin: "", newPin2: "", mismatch: false, answer: "", failed: false, onOk };
    ui.overlay = "gate";
    render();
  }

  function gateSuccess() {
    buzz([30, 40, 30]);
    const cb = ui.gate.onOk;
    ui.overlay = null;
    render();
    if (cb) cb();
  }

  // ---------------------------------------------------------------- parent zone

  function renderParent() {
    const tabs = [["settings", t("Ustawienia", "Settings")], ["stats", t("Statystyki", "Statistics")],
                  ["cert", t("Dyplom", "Diploma")]];
    let body;
    if (ui.parentTab === "stats") body = renderStats();
    else if (ui.parentTab === "cert") body = renderCertTab();
    else body = renderSettings();
    return `
      <div class="overlay-backdrop" data-action="close-overlay">
        <div class="sheet" data-action="noop">
          <div class="sheet-head">
            <h2>⚙️ ${t("Strefa rodzica", "Parent zone")}</h2>
            <button class="close-x squishy" data-action="close-overlay">✕</button>
          </div>
          <div class="tabs">
            ${tabs.map(([id, name]) =>
              `<button class="${ui.parentTab === id ? "active" : ""} squishy" data-action="parent-tab" data-tab="${id}">${name}</button>`).join("")}
          </div>
          ${body}
        </div>
      </div>`;
  }

  function renderSettings() {
    const cfg = ui.config;
    const limits = [[null, t("Wyłączony", "Off")], [15, "15 min"], [30, "30 min"], [45, "45 min"], [60, "60 min"]];
    const isCustom = state.limitMin != null && ![15, 30, 45, 60].includes(state.limitMin);
    return `
      <div class="card">
        <h3>${t("Ustawienia sesji", "Session settings")}</h3>
        <div class="chips">
          ${C.OPS.map((op) => `
            <button class="chip ${cfg.operations.includes(op) ? "on" : ""}" data-action="parent-toggle-op" data-op="${op}">
              ${C.OP_EMOJI[op]} ${opName(op)}</button>`).join("")}
        </div>
        <div class="setting-row"><label>${t("Zakres liczb", "Number range")}</label>
          <select data-change="set-range">
            ${C.RANGES.map((r) => `<option value="${r}" ${cfg.range === r ? "selected" : ""}>${r}</option>`).join("")}
          </select></div>
        <div class="setting-row"><label>${t("Poziom", "Level")}</label>
          <select data-change="set-diff">
            ${C.DIFFICULTIES.map((d) => `<option value="${d}" ${cfg.difficulty === d ? "selected" : ""}>${DIFF_EMOJI[d]} ${diffName(d)}</option>`).join("")}
          </select></div>
      </div>
      <div class="card">
        <div class="setting-row"><label>${t("Język / Language", "Language / Język")}</label>
          <span class="chips">
            <button class="chip ${state.lang === "pl" ? "on" : ""}" data-action="set-lang" data-lang="pl">Polski</button>
            <button class="chip ${state.lang === "en" ? "on" : ""}" data-action="set-lang" data-lang="en">English</button>
          </span></div>
      </div>
      <div class="card">
        <h3>⏰ ${t("Dzienny limit czasu", "Daily time limit")}</h3>
        <div class="chips">
          ${limits.map(([v, name]) => `
            <button class="chip ${state.limitMin === v ? "on" : ""}" data-action="set-limit" data-min="${v == null ? "" : v}">${name}</button>`).join("")}
          <button class="chip ${isCustom ? "on" : ""}" data-action="set-limit-custom">${t("Własny", "Custom")}</button>
        </div>
        ${isCustom ? `<div class="setting-row"><label>${t("Własny limit (minuty)", "Custom limit (minutes)")}</label>
          <input type="number" min="5" max="180" step="5" value="${state.limitMin}" data-change="custom-limit" style="width:90px"></div>` : ""}
        ${state.overrideDate && C.overrideActive(state.overrideDate, Date.now())
          ? `<button class="linklike" data-action="cancel-override">${t("Cofnij dzisiejsze odblokowanie", "Cancel today's override")}</button>` : ""}
      </div>
      <div class="card">
        <h3>${t("Inne", "Other")}</h3>
        <div class="setting-row"><label>${t("Imię dziecka", "Child's name")}</label>
          <input type="text" value="${esc(state.name)}" data-change="set-name" maxlength="20" style="width:150px"></div>
        <div class="setting-row"><label>🔊 ${t("Głośność", "Volume")}</label>
          <input type="range" min="0" max="1" step="0.1" value="${state.volume}" data-change="set-volume"></div>
        <div class="setting-row"><label>${t("Kod rodzica", "Parent code")}</label>
          <button class="chip" data-action="change-pin">${t("Zmień kod", "Change code")}</button></div>
        <div class="setting-row">
          <button class="danger squishy" data-action="reset-progress">🗑 ${t("Wyzeruj postępy", "Reset progress")}</button></div>
      </div>`;
  }

  // ---------------------------------------------------------------- statistics

  function fmtDay(dayMs) {
    const d = new Date(dayMs);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  function svgChart(points, { color, kind, unit = "", yMax = null }) {
    if (!points.length) {
      return `<p class="small-note">${t("Brak danych w tym okresie", "No data in this time frame")}</p>`;
    }
    const pts = points.slice(-14);
    const W = 340, H = 150, padL = 8, padB = 22, padT = 14;
    const maxV = yMax != null ? yMax : Math.max(...pts.map((p) => p.value)) * 1.15 || 1;
    const iw = (W - padL * 2) / Math.max(pts.length, 1);
    const y = (v) => padT + (H - padT - padB) * (1 - v / maxV);
    let marks = "";
    if (kind === "bar") {
      marks = pts.map((p, i) => {
        const bw = Math.min(iw * 0.6, 34);
        const bx = padL + i * iw + (iw - bw) / 2;
        return `<rect x="${bx.toFixed(1)}" y="${y(p.value).toFixed(1)}" width="${bw.toFixed(1)}"
          height="${(H - padB - y(p.value)).toFixed(1)}" rx="4" fill="${color}"/>`;
      }).join("");
    } else {
      const coords = pts.map((p, i) => `${(padL + i * iw + iw / 2).toFixed(1)},${y(p.value).toFixed(1)}`);
      marks = `<polyline points="${coords.join(" ")}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round"/>` +
        pts.map((p, i) => `<circle cx="${(padL + i * iw + iw / 2).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="4" fill="${color}"/>`).join("");
    }
    const labels = pts.map((p, i) =>
      (pts.length > 7 && i % 2 === 1) ? "" :
      `<text x="${(padL + i * iw + iw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#8b81a5" font-weight="600">${p.label || fmtDay(p.day)}</text>`).join("");
    const values = pts.map((p, i) =>
      `<text x="${(padL + i * iw + iw / 2).toFixed(1)}" y="${(y(p.value) - 6).toFixed(1)}" text-anchor="middle" font-size="10" fill="#7c6f96" font-weight="700">${Math.round(p.value * 10) / 10}${unit}</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}">
      <line x1="${padL}" y1="${H - padB}" x2="${W - padL}" y2="${H - padB}" stroke="#d3cce4" stroke-width="2"/>
      ${marks}${labels}${values}</svg>`;
  }

  function currentFrame() {
    const s = ui.stats;
    if (s.frame === "custom") {
      const start = s.start ? new Date(s.start + "T00:00").getTime() : Date.now();
      const end = s.end ? new Date(s.end + "T00:00").getTime() : Date.now();
      return { start, end };
    }
    return s.frame;
  }

  function renderStats() {
    const now = Date.now();
    heartbeat.lastRun = now;
    const frame = currentFrame();
    const inFrame = C.filterAttempts(attempts, frame, now);
    const s = C.summary(inFrame);
    const byOp = C.summaryByOperation(inFrame);
    const sess = C.filterSessions(sessions, frame, now);
    const usageMin = Math.round(C.totalUsageSeconds(sess, "all", now) / 60);
    const frames = [["today", t("Dzisiaj", "Today")], ["week", t("Tydzień", "Week")], ["month", t("Miesiąc", "Month")],
                    ["all", t("Od zawsze", "All time")], ["custom", t("Zakres własny", "Custom")]];
    const pct = (v) => `${Math.round(v * 100)}%`;
    return `
      <div class="chips">
        ${frames.map(([id, name]) =>
          `<button class="chip ${ui.stats.frame === id ? "on" : ""}" data-action="stats-frame" data-frame="${id}">${name}</button>`).join("")}
      </div>
      ${ui.stats.frame === "custom" ? `
        <div class="setting-row"><label>${t("Od", "From")}</label>
          <input type="date" value="${ui.stats.start}" data-change="stats-start" style="width:170px"></div>
        <div class="setting-row"><label>${t("Do", "To")}</label>
          <input type="date" value="${ui.stats.end}" data-change="stats-end" style="width:170px"></div>` : ""}
      <div class="card">
        <h3>${t("Podsumowanie", "Summary")}</h3>
        <div class="stat-row"><span>✅ ${t("Rozwiązane poprawnie", "Solved correctly")}</span><b id="stat-solved">${s.solvedCorrectly}</b></div>
        <div class="stat-row"><span>🎯 ${t("Skuteczność", "Accuracy")}</span><b>${pct(s.accuracy)}</b></div>
        <div class="stat-row"><span>🔁 ${t("Średnio prób na zadanie", "Average tries per problem")}</span><b>${s.averageTries.toFixed(2)}</b></div>
        <div class="stat-row"><span>⏱️ ${t("Średni czas odpowiedzi", "Avg. time to correct answer")}</span><b>${s.averageTimeToCorrect.toFixed(1)} s</b></div>
        <div class="stat-row"><span>🦉 ${t("Uruchomione samouczki", "Tutorials triggered")}</span><b>${s.tutorialsTriggered}</b></div>
        <div class="stat-row"><span>🕐 ${t("Czas w aplikacji", "App usage time")}</span><b>${usageMin} min</b></div>
      </div>
      <div class="card">
        <h3>${t("Według działania", "By operation")}</h3>
        ${Object.keys(byOp).length === 0 ? `<p class="small-note">${t("Brak danych w tym okresie", "No data in this time frame")}</p>` : ""}
        ${C.OPS.filter((op) => byOp[op]).map((op) => {
          const o = byOp[op];
          return `<div class="stat-row" style="display:block">
            <b>${C.OP_EMOJI[op]} ${opName(op)}</b>
            <div class="op-stat">✅ ${o.solvedCorrectly}/${o.totalAttempted} · 🎯 ${pct(o.accuracy)} ·
              🔁 ${o.averageTries.toFixed(1)} · ⏱️ ${o.averageTimeToCorrect.toFixed(1)} s · 🦉 ${o.tutorialsTriggered}</div>
          </div>`;
        }).join("")}
      </div>
      <div class="card chart-card"><h3>📈 ${t("Skuteczność w czasie", "Accuracy over time")}</h3>
        ${svgChart(C.dailyAccuracy(inFrame).map((p) => ({ ...p, value: p.value * 100 })), { color: "#59cc99", kind: "line", unit: "%", yMax: 100 })}</div>
      <div class="card chart-card"><h3>📊 ${t("Zadania na dzień", "Problems per day")}</h3>
        ${svgChart(C.dailyCount(inFrame), { color: "#73bffa", kind: "bar" })}</div>
      <div class="card chart-card"><h3>🧮 ${t("Porównanie działań", "Operation comparison")}</h3>
        ${svgChart(C.OPS.filter((op) => byOp[op]).map((op) => ({
          day: 0, label: C.OP_EMOJI[op], value: byOp[op].accuracy * 100,
        })), { color: "#9e70e6", kind: "bar", unit: "%", yMax: 100 })}</div>
      <div class="card chart-card"><h3>⏱️ ${t("Średni czas rozwiązania", "Average solve time")}</h3>
        ${svgChart(C.dailyAverageTime(inFrame), { color: "#ff8c66", kind: "line", unit: "s" })}</div>
      <div class="card chart-card"><h3>🕐 ${t("Czas w aplikacji na dzień", "App usage per day")}</h3>
        ${svgChart(C.dailyUsageMinutes(sess), { color: "#ffc740", kind: "bar", unit: "m" })}</div>`;
  }

  // ---------------------------------------------------------------- certificate

  function renderCertTab() {
    return `
      <div class="card" style="text-align:center">
        <h3>🏅 ${t("Dyplom Mistrzyni Matematyki", "Master of Mathematics Diploma")}</h3>
        <label class="setting-row" style="justify-content:center">
          <input type="checkbox" id="cert-stats" ${ui.certStats ? "checked" : ""} data-change="cert-stats">
          ${t("Dołącz statystyki i umiejętności", "Include statistics and skills")}
        </label>
        <button class="big-btn squishy" data-action="gen-cert" id="gen-cert" ${ui.certBusy ? "disabled" : ""}>
          ${ui.certBusy ? t("Tworzę dyplom…", "Creating the diploma…") : t("🎓 Generuj dyplom", "🎓 Generate diploma")}
        </button>
        ${ui.certUrl ? `
          <iframe class="cert-frame" id="cert-frame" src="${ui.certUrl}" title="Dyplom"></iframe>
          <div class="cert-actions">
            <button class="big-btn sky squishy" data-action="share-cert" id="share-cert">📤 ${t("Udostępnij", "Share")}</button>
            <a class="big-btn mint squishy" id="cert-download" href="${ui.certUrl}" download="${certFileName()}">💾 ${t("Zapisz PDF", "Save PDF")}</a>
          </div>
          <button class="big-btn squishy" data-action="print-cert-pdf" id="print-cert-pdf" style="margin-top:10px">🖨 ${t("Drukuj", "Print")}</button>
          <p class="small-note">${t("Na iPhonie: Udostępnij → Drukuj (AirPrint) lub Zapisz do Plików / wyślij e-mailem.",
            "On iPhone: Share → Print (AirPrint), or save to Files / e-mail it.")}</p>` : ""}
      </div>`;
  }

  function certFileName() {
    const base = (state.lang === "pl" ? "Dyplom-" : "Diploma-") + state.name;
    return base.replace(/[^\p{L}\p{N}-]+/gu, "-") + ".pdf";
  }

  // ---- diploma PDF: certificate drawn on canvas (bundled Baloo 2, so the
  // Polish diacritics come straight from the font), embedded as a JPEG in a
  // minimal hand-built PDF. Fully offline, no libraries.

  function drawStar(g, x, y, r, color) {
    g.save();
    g.translate(x, y);
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      g[i ? "lineTo" : "moveTo"](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    g.closePath();
    g.fillStyle = color;
    g.fill();
    g.restore();
  }

  function roundRectPath(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  async function makeDiplomaPDF(withStats) {
    try {
      await Promise.all([
        document.fonts.load('800 120px "Baloo 2"'),
        document.fonts.load('700 60px "Baloo 2"'),
        document.fonts.load('500 40px "Baloo 2"'),
      ]);
      await document.fonts.ready;
    } catch (e) { /* fall back to system font */ }

    const W = 1240, H = 1754; // A4 at 150 dpi
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const pl = state.lang === "pl";
    const baloo = (weight, size) => `${weight} ${size}px "Baloo 2", sans-serif`;

    // Background
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#fff8fc");
    bg.addColorStop(0.55, "#f7efff");
    bg.addColorStop(1, "#effaf7");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);

    // Double border: gold outside, dotted pink inside
    g.lineWidth = 12;
    g.strokeStyle = "#e3b23c";
    roundRectPath(g, 46, 46, W - 92, H - 92, 42);
    g.stroke();
    g.lineWidth = 5;
    g.strokeStyle = "#ff8fb8";
    g.setLineDash([2, 20]);
    g.lineCap = "round";
    roundRectPath(g, 82, 82, W - 164, H - 164, 30);
    g.stroke();
    g.setLineDash([]);

    // Corner stars
    for (const [x, y] of [[110, 110], [W - 110, 110], [110, H - 110], [W - 110, H - 110]]) {
      drawStar(g, x, y, 26, "#ffcf40");
    }

    g.textAlign = "center";

    // Header
    g.font = "84px serif";
    g.fillText("🌸 🏆 🌸", W / 2, 250);

    const titleGrad = g.createLinearGradient(W / 2 - 300, 0, W / 2 + 300, 0);
    titleGrad.addColorStop(0, "#f2308f");
    titleGrad.addColorStop(1, "#8a5cf0");
    g.fillStyle = titleGrad;
    g.font = baloo(800, 130);
    g.fillText(pl ? "DYPLOM" : "DIPLOMA", W / 2, 420);

    g.fillStyle = "#c8871a";
    g.font = baloo(700, 62);
    g.fillText(pl ? "Mistrzyni Matematyki" : "Master of Mathematics", W / 2, 510);

    g.fillStyle = "#8a6fae";
    g.font = baloo(500, 38);
    g.fillText(pl ? "dla" : "awarded to", W / 2, 590);

    g.fillStyle = "#ff5ca8";
    g.font = baloo(800, 108);
    g.fillText(state.name, W / 2, 700);

    g.fillStyle = "#4a2364";
    g.font = baloo(500, 44);
    g.fillText(pl ? "za wspaniałe wyniki przekraczające" : "for wonderful results exceeding", W / 2, 800);
    g.fillText(pl ? "wszelkie oczekiwania!" : "all expectations!", W / 2, 860);

    let y = 960;
    if (withStats) {
      const s = C.summary(attempts);
      const ops = [...new Set(attempts.map((a) => a.op))];
      const diffOrder = { easy: 0, medium: 1, hard: 2, genius: 3 };
      const topDiff = attempts.reduce(
        (best, a) => (diffOrder[a.diff] > diffOrder[best] ? a.diff : best),
        attempts.length ? attempts[0].diff : "easy");
      const lines = [
        `✅  ${s.solvedCorrectly} ${pl ? "rozwiązanych zadań" : "problems solved"}`,
        `🎯  ${pl ? "Skuteczność" : "Accuracy"}: ${Math.round(s.accuracy * 100)}%`,
        `🪙  ${state.coins} ${pl ? "zdobytych złotych monet" : "gold coins collected"}`,
      ];
      if (ops.length) {
        lines.push(`✏️  ${pl ? "Ćwiczyła" : "Practiced"}: ${ops.map(opName).join(", ")}`);
        lines.push(`🚀  ${pl ? "Poziom" : "Level"}: ${diffName(topDiff)}`);
      }
      g.font = baloo(700, 40);
      g.fillStyle = "#8a5cf0";
      for (const line of lines) {
        g.fillText(line, W / 2, y);
        y += 62;
      }
      y += 10;
    }

    g.font = "48px serif";
    g.fillText("⭐ 🌟 ⭐ 🌟 ⭐", W / 2, y + 20);

    // Gold seal with ribbons (bottom right)
    const sx = W - 250, sy = H - 300;
    g.save();
    g.translate(sx, sy);
    g.fillStyle = "#e3b23c";
    g.beginPath();
    g.moveTo(-42, 40); g.lineTo(-70, 150); g.lineTo(-32, 120); g.lineTo(-12, 155); g.lineTo(-4, 60);
    g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(42, 40); g.lineTo(70, 150); g.lineTo(32, 120); g.lineTo(12, 155); g.lineTo(4, 60);
    g.closePath(); g.fill();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.beginPath();
      g.arc(Math.cos(a) * 78, Math.sin(a) * 78, 16, 0, Math.PI * 2);
      g.fillStyle = "#f5c04a";
      g.fill();
    }
    const seal = g.createRadialGradient(-20, -25, 8, 0, 0, 85);
    seal.addColorStop(0, "#ffe488");
    seal.addColorStop(1, "#e8a922");
    g.fillStyle = seal;
    g.beginPath(); g.arc(0, 0, 78, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#c8871a"; g.lineWidth = 4;
    g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.stroke();
    drawStar(g, 0, 0, 38, "#fff6d8");
    g.restore();

    // Date + signature
    const date = new Date().toLocaleDateString(pl ? "pl-PL" : "en-US",
      { year: "numeric", month: "long", day: "numeric" });
    g.fillStyle = "#8a6fae";
    g.font = baloo(500, 36);
    g.fillText(date, W / 2, H - 250);
    g.fillStyle = "#8a5cf0";
    g.font = baloo(700, 40);
    g.fillText(pl ? "Matematyka Tosi 🧮" : "Tosia's Math 🧮", W / 2, H - 185);

    // Canvas → JPEG bytes → single-page PDF
    const dataUrl = cv.toDataURL("image/jpeg", 0.92);
    const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const bin = atob(b64);
    const jpeg = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
    return buildImagePDF(jpeg, W, H);
  }

  /** Wrap a JPEG in a minimal one-page A4 PDF (image covers the page). */
  function buildImagePDF(jpeg, wPx, hPx) {
    const pageW = 595.28, pageH = 841.89; // A4 points
    const enc = (s) => new TextEncoder().encode(s);
    const chunks = [];
    const offsets = [0];
    let pos = 0;
    const push = (bytes) => { chunks.push(bytes); pos += bytes.length; };
    const beginObj = (n, body) => { offsets[n] = pos; push(enc(body)); };

    push(enc("%PDF-1.4\n%âãÏÓ\n"));
    beginObj(1, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    beginObj(2, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    beginObj(3, `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] ` +
      "/Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");
    offsets[4] = pos;
    push(enc(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${wPx} /Height ${hPx} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`));
    push(jpeg);
    push(enc("\nendstream\nendobj\n"));
    const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im1 Do Q`;
    beginObj(5, `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);

    const xrefPos = pos;
    let xref = "xref\n0 6\n0000000000 65535 f \n";
    for (let n = 1; n <= 5; n++) xref += String(offsets[n]).padStart(10, "0") + " 00000 n \n";
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
    push(enc(xref));
    return new Blob(chunks, { type: "application/pdf" });
  }

  async function generateCertificate() {
    if (ui.certBusy) return;
    ui.certBusy = true;
    render();
    try {
      const blob = await makeDiplomaPDF(ui.certStats);
      certBlob = blob;
      if (ui.certUrl) URL.revokeObjectURL(ui.certUrl);
      ui.certUrl = URL.createObjectURL(blob);
    } catch (e) {
      ui.certUrl = null;
      alert(t("Nie udało się utworzyć dyplomu: ", "Could not create the diploma: ") + e);
    }
    ui.certBusy = false;
    render();
  }

  /** Share via the native sheet; guaranteed fallback: trigger the download. */
  async function shareCertificate() {
    if (!certBlob) return;
    const file = new File([certBlob], certFileName(), { type: "application/pdf" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: certFileName() });
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return; // user closed the sheet
    }
    const a = $("#cert-download");
    if (a) a.click();
  }

  /** Print: try the PDF frame, then a new tab; never fail silently. */
  function printCertificatePDF() {
    const frame = $("#cert-frame");
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    } catch (e) { /* cross-origin/viewer restrictions — fall through */ }
    let opened = null;
    try { opened = window.open(ui.certUrl, "_blank"); } catch (e) { /* blocked */ }
    if (!opened) shareCertificate();
  }

  // ---------------------------------------------------------------- time limit reached

  function renderLimitReached() {
    return `
      <div style="margin:auto 0;text-align:center">
        <div class="sleepy">🧸</div>
        <div style="font-size:34px">🌙 💤</div>
        <h1 style="font-size:32px">${t(`Świetna praca na dziś, ${voc()}! Do zobaczenia jutro! 🌙`,
          `Great work for today, ${esc(state.name)}! See you tomorrow! 🌙`)}</h1>
        <div style="font-size:26px;margin:10px">⭐️🌟⭐️</div>
        <button class="linklike" data-action="limit-unlock">🔓 ${t("Rodzic: odblokuj kodem", "Parent: unlock with code")}</button>
      </div>`;
  }

  // ================================================================ actions

  const actions = {
    noop() {},

    // onboarding
    "set-lang"(el) {
      state.lang = el.dataset.lang;
      persist();
      render();
    },
    "ob-next"() {
      const name = ($("#ob-name").value || "").trim();
      if (!name) return;
      state.name = name;
      persist();
      ui.ob.step = 1;
      render();
    },
    "ob-pin"(el) {
      const ob = ui.ob;
      ob.mismatch = false;
      const key = el.dataset.d;
      const field = ob.step === 1 ? "pin" : "pin2";
      if (key === "back") ob[field] = ob[field].slice(0, -1);
      else if (ob[field].length < 4) ob[field] += key;
      if (ob[field].length === 4) {
        setTimeout(() => {
          if (ob.step === 1) {
            ob.step = 2;
          } else if (ob.pin === ob.pin2) {
            ob.step = 3;
          } else {
            ob.pin = ""; ob.pin2 = ""; ob.step = 1; ob.mismatch = true;
            buzz([60, 60, 60]);
          }
          render();
        }, 220);
      }
      render();
    },
    "ob-finish"() {
      const q = ($("#ob-q").value || "").trim();
      const a = ($("#ob-a").value || "").trim();
      if (!q || !a) return;
      state.pinHash = hashPin(ui.ob.pin);
      state.recoveryQ = q;
      state.recoveryHash = hashAnswer(a);
      state.hasOnboarded = true;
      persist();
      ui.screen = "home";
      render();
    },

    // setup flow
    "toggle-op"(el) {
      const op = el.dataset.op;
      const ops = ui.config.operations;
      const i = ops.indexOf(op);
      if (i >= 0) ops.splice(i, 1); else ops.push(op);
      render();
    },
    "toggle-random"() {
      ui.config.operations = ui.config.operations.length === 4 ? [] : C.OPS.slice();
      render();
    },
    "go-range"() {
      if (!ui.config.operations.length) return;
      if (!ui.rangePicked) {
        const ops = ui.config.operations;
        const onlyMulDiv = ops.length && ops.every((o) => o === "multiplication" || o === "division");
        ui.config.range = onlyMulDiv ? 30 : 100;
      }
      ui.screen = "range";
      render();
    },
    "pick-range"(el) {
      ui.config.range = parseInt(el.dataset.range, 10);
      ui.rangePicked = true;
      render();
    },
    "go-level"() { ui.screen = "level"; render(); },
    "pick-diff"(el) { ui.config.difficulty = el.dataset.diff; render(); },
    "go-home"() {
      clearTimeout(ui.praiseTimer);
      ui.screen = "home";
      ui.pc = null;
      render();
    },
    "start-practice"() { startPractice(); },

    // practice
    key(el) { pressKey(el.dataset.key); },
    "toggle-fancy"() { ui.fancyOpen = !ui.fancyOpen; render(); },

    // tutorial
    "tut-next"() { tutorialNext(); },

    // celebration
    "collect-coin"() { collectCoin(); },
    "cel-done"() { celebrationDone(); },
    "cel-skip"() { celebrationDone(); },

    // overlays
    "open-treasures"() { ui.overlay = "treasures"; render(); },
    "close-overlay"() {
      if (ui.overlay === "tutorial" || ui.overlay === "celebration") return; // no dead ends, but no accidental skips
      ui.overlay = null;
      render();
    },
    "pick-theme"(el) { state.theme = el.dataset.theme; persist(); render(); },

    // gate
    "open-gate"() { openGate(() => { ui.parentTab = "settings"; ui.overlay = "parent"; render(); }); },
    "gate-pin"(el) {
      const g = ui.gate;
      g.wrong = false;
      if (el.dataset.d === "back") g.entered = g.entered.slice(0, -1);
      else if (g.entered.length < 4) g.entered += el.dataset.d;
      if (g.entered.length === 4) {
        if (hashPin(g.entered) === state.pinHash) { gateSuccess(); return; }
        g.entered = "";
        g.wrong = true;
        buzz([60, 60, 60]);
      }
      render();
    },
    "gate-forgot"() { ui.gate.mode = "recovery"; render(); },
    "gate-check-answer"() {
      const g = ui.gate;
      g.answer = $("#gate-answer").value || "";
      if (state.recoveryHash && hashAnswer(g.answer) === state.recoveryHash) {
        g.mode = "newpin";
        g.failed = false;
      } else {
        g.failed = true;
        buzz([60, 60, 60]);
      }
      render();
    },
    "gate-newpin"(el) {
      const g = ui.gate;
      g.mismatch = false;
      if (el.dataset.d === "back") {
        if (g.newPin2.length) g.newPin2 = g.newPin2.slice(0, -1);
        else g.newPin = g.newPin.slice(0, -1);
      } else if (g.newPin.length < 4) {
        g.newPin += el.dataset.d;
      } else if (g.newPin2.length < 4) {
        g.newPin2 += el.dataset.d;
        if (g.newPin2.length === 4) {
          if (g.newPin === g.newPin2) {
            state.pinHash = hashPin(g.newPin);
            persist();
            gateSuccess();
            return;
          }
          g.newPin = ""; g.newPin2 = ""; g.mismatch = true;
          buzz([60, 60, 60]);
        }
      }
      render();
    },

    // parent
    "parent-tab"(el) { ui.parentTab = el.dataset.tab; render(); },
    "parent-toggle-op"(el) {
      const op = el.dataset.op;
      const ops = ui.config.operations;
      const i = ops.indexOf(op);
      if (i >= 0) { if (ops.length > 1) ops.splice(i, 1); }
      else ops.push(op);
      if (ui.pc) ui.pc.setConfig(ui.config);
      render();
    },
    "set-limit"(el) {
      state.limitMin = el.dataset.min === "" ? null : parseInt(el.dataset.min, 10);
      persist();
      checkLimit();
      render();
    },
    "set-limit-custom"() {
      state.limitMin = 20;
      persist();
      checkLimit();
      render();
    },
    "cancel-override"() { state.overrideDate = null; persist(); checkLimit(); render(); },
    "change-pin"() {
      ui.gate = { entered: "", wrong: false, mode: "newpin", newPin: "", newPin2: "", mismatch: false, answer: "", failed: false,
        onOk: () => { ui.overlay = "parent"; render(); } };
      ui.overlay = "gate";
      render();
    },
    "reset-progress"() {
      const q1 = t("Na pewno wyzerować wszystkie postępy?", "Really reset all progress?");
      const q2 = t("To usunie monety, trofea i statystyki. Tej operacji nie można cofnąć!",
                   "This deletes coins, trophies and statistics. This cannot be undone!");
      if (window.confirm(q1) && window.confirm(q2)) {
        attempts = [];
        sessions = [currentSession = { start: Date.now(), dur: 0 }];
        state.coins = 0; state.bestStreak = 0; state.bestSession = 0; state.lastPraise = -1;
        persist();
        render();
      }
    },
    "stats-frame"(el) { ui.stats.frame = el.dataset.frame; render(); },
    "gen-cert"() { generateCertificate(); },
    "share-cert"() { shareCertificate(); },
    "print-cert-pdf"() { printCertificatePDF(); },

    // time limit
    "limit-unlock"() {
      openGate(() => {
        state.overrideDate = Date.now();
        persist();
        ui.limitReached = false;
        checkLimit();
        render();
      });
    },
  };

  const changes = {
    "set-range"(el) {
      ui.config.range = parseInt(el.value, 10);
      ui.rangePicked = true;
      if (ui.pc) ui.pc.setConfig(ui.config);
    },
    "set-diff"(el) {
      ui.config.difficulty = el.value;
      if (ui.pc) ui.pc.setConfig(ui.config);
    },
    "set-name"(el) {
      const name = el.value.trim();
      if (name) { state.name = name; persist(); }
    },
    "set-volume"(el) { state.volume = parseFloat(el.value); persist(); },
    "custom-limit"(el) {
      const v = parseInt(el.value, 10);
      if (v >= 5 && v <= 600) { state.limitMin = v; persist(); checkLimit(); }
    },
    "stats-start"(el) { ui.stats.start = el.value; render(); },
    "stats-end"(el) { ui.stats.end = el.value; render(); },
    "cert-stats"(el) { ui.certStats = el.checked; },
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    sfx.unlock();
    const handler = actions[el.dataset.action];
    if (handler) {
      // Backdrop-only actions must not fire when a child was clicked.
      if ((el.classList.contains("overlay-backdrop") || el.dataset.action === "cel-skip")
          && e.target.closest("[data-action]") !== el) return;
      handler(el);
    }
  });

  document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-change]");
    if (!el) return;
    const handler = changes[el.dataset.change];
    if (handler) { handler(el); }
  });

  // Physical keyboard support (desktop testing convenience).
  document.addEventListener("keydown", (e) => {
    if (ui.screen !== "practice" || ui.overlay) return;
    if (/^[0-9]$/.test(e.key)) pressKey(e.key);
    else if (e.key === "Backspace") pressKey("back");
    else if (e.key === "Enter") pressKey("ok");
  });

  // ================================================================ boot

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  (function decorate() {
    const decor = document.getElementById("decor");
    if (!decor) return;
    const glyphs = ["✨", "💖", "⭐", "🫧", "🌸", "💜", "🦋", "💫"];
    decor.innerHTML = glyphs.concat(glyphs).map((g, i) => {
      const left = (i * 53 + 11) % 96;
      const top = (i * 37 + 7) % 92;
      const size = 14 + ((i * 7) % 18);
      const delay = (i * 1.37) % 9;
      return `<span style="left:${left}%;top:${top}%;font-size:${size}px;animation-delay:-${delay}s,-${delay * 1.7}s">${g}</span>`;
    }).join("");
  })();

  checkLimit();
  render();
})();

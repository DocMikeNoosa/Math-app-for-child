/* Apple Pencil / finger handwriting pad, plus a small store of confirmed handwriting samples
   that are shown to the AI as examples so it gets better at reading this child's writing. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const H = (LA.hand = {});

  /* createPad({height, lines}) -> {el, isEmpty, clear, undo, toBlob, toDataURL} */
  H.createPad = function (opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'pad';
    const canvas = document.createElement('canvas');
    canvas.className = 'pad-canvas';
    canvas.setAttribute('aria-label', LA.tr('Writing area. Write with Apple Pencil or your finger.', 'Pole do pisania. Pisz rysikiem Apple Pencil albo palcem.'));
    canvas.style.height = (opts.height || 220) + 'px';
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const strokes = [];
    let cur = null, penSeen = false, dpr = 1;

    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(10, Math.round(r.width * dpr));
      canvas.height = Math.max(10, Math.round(r.height * dpr));
      redraw();
    }
    function inkColour() { return getComputedStyle(canvas).getPropertyValue('--ink-pen').trim() || '#1b2a4a'; }
    function lineGuide() {
      if (opts.lines === false) return;
      const h = canvas.height, w = canvas.width, gap = 64 * dpr;
      ctx.save();
      for (let y = gap; y < h; y += gap) {
        ctx.strokeStyle = 'rgba(90,169,255,0.35)'; ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.setLineDash([6 * dpr, 6 * dpr]); ctx.strokeStyle = 'rgba(90,169,255,0.18)';
        ctx.beginPath(); ctx.moveTo(0, y - gap / 2); ctx.lineTo(w, y - gap / 2); ctx.stroke(); ctx.setLineDash([]);
      }
      ctx.restore();
    }
    function drawStroke(s) {
      if (s.pts.length < 1) return;
      ctx.strokeStyle = inkColour();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < s.pts.length; i++) {
        const a = s.pts[i - 1], b = s.pts[i];
        ctx.lineWidth = (s.pen ? 1.6 + 3.2 * (b.p || 0.5) : 3.6) * dpr;
        ctx.beginPath(); ctx.moveTo(a.x * dpr, a.y * dpr); ctx.lineTo(b.x * dpr, b.y * dpr); ctx.stroke();
      }
      if (s.pts.length === 1) { const a = s.pts[0]; ctx.fillStyle = inkColour(); ctx.beginPath(); ctx.arc(a.x * dpr, a.y * dpr, 2 * dpr, 0, Math.PI * 2); ctx.fill(); }
    }
    function redraw() { ctx.clearRect(0, 0, canvas.width, canvas.height); lineGuide(); strokes.forEach(drawStroke); }
    function pos(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, p: e.pressure || 0.5 }; }

    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen') penSeen = true;
      if (penSeen && e.pointerType === 'touch') return; // palm rejection once the Pencil is in use
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      cur = { pen: e.pointerType === 'pen', pts: [pos(e)], id: e.pointerId };
      strokes.push(cur);
      drawStroke(cur);
      if (opts.onChange) opts.onChange();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!cur || e.pointerId !== cur.id) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach((ev) => cur.pts.push(pos(ev)));
      const n = cur.pts.length;
      drawStroke({ pen: cur.pen, pts: cur.pts.slice(Math.max(0, n - evs.length - 1)) });
    });
    const end = (e) => { if (cur && e.pointerId === cur.id) cur = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
    if (ro) ro.observe(canvas); else setTimeout(size, 50);
    setTimeout(size, 0);

    function bbox() {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      strokes.forEach((s) => s.pts.forEach((p) => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }));
      return isFinite(x0) ? { x0, y0, x1, y1 } : null;
    }
    /* Export just the writing, on white, dark ink, max 1200px wide */
    function render(maxW, bg) {
      const b = bbox();
      if (!b) return null;
      const pad = 16, w = b.x1 - b.x0 + pad * 2, h = b.y1 - b.y0 + pad * 2;
      const scale = Math.min(2, maxW / w);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * scale));
      c.height = Math.max(1, Math.round(h * scale));
      const x = c.getContext('2d');
      x.fillStyle = bg || '#ffffff'; x.fillRect(0, 0, c.width, c.height);
      x.strokeStyle = '#111827'; x.fillStyle = '#111827'; x.lineCap = 'round'; x.lineJoin = 'round';
      strokes.forEach((s) => {
        for (let i = 1; i < s.pts.length; i++) {
          const a = s.pts[i - 1], p = s.pts[i];
          x.lineWidth = (s.pen ? 1.6 + 3.2 * (p.p || 0.5) : 3.6) * scale;
          x.beginPath(); x.moveTo((a.x - b.x0 + pad) * scale, (a.y - b.y0 + pad) * scale); x.lineTo((p.x - b.x0 + pad) * scale, (p.y - b.y0 + pad) * scale); x.stroke();
        }
      });
      return c;
    }
    return {
      el: wrap,
      canvas,
      isEmpty: () => strokes.length === 0,
      clear: () => { strokes.length = 0; redraw(); if (opts.onChange) opts.onChange(); },
      undo: () => { strokes.pop(); redraw(); if (opts.onChange) opts.onChange(); },
      toBlob: (maxW) => new Promise((res) => { const c = render(maxW || 1200); if (!c) return res(null); c.toBlob((bl) => res(bl), 'image/jpeg', 0.85); }),
      toDataURL: (maxW) => { const c = render(maxW || 360); return c ? c.toDataURL('image/jpeg', 0.6) : null; },
      destroy: () => { if (ro) ro.disconnect(); },
    };
  };

  /* ---------- confirmed samples (the "learning" part) ---------- */
  const LKEY = (pid) => 'aus-learn.hand.' + pid;
  let cache = null, cachePid = null;
  async function loadSamples() {
    const pid = S.state().active;
    if (cache && cachePid === pid) return cache;
    let data = null;
    try { data = JSON.parse(U.safeLS.get(LKEY(pid)) || 'null'); } catch (e) { data = null; }
    const remote = LA.cloud && LA.cloud.available() ? await LA.cloud.loadHand(pid) : null;
    const all = ((data && data.samples) || []).concat((remote && remote.samples) || []);
    const seen = new Set();
    cache = all.filter((s) => { const k = s.at + s.text; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.at - b.at).slice(-12);
    cachePid = pid;
    return cache;
  }
  function dataURLtoBlob(d) {
    const [h, b] = d.split(',');
    const mime = (h.match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
    const bin = atob(b);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  }
  H.samples = async (lang) => (await loadSamples()).filter((s) => !lang || s.lang === lang).map((s) => Object.assign({}, s, { blob: dataURLtoBlob(s.img) }));
  H.sampleCount = async () => (await loadSamples()).length;
  H.addSample = async (dataUrl, text, lang) => {
    if (!dataUrl || !text) return;
    const list = await loadSamples();
    list.push({ img: dataUrl, text: String(text).slice(0, 120), lang, at: Date.now() });
    while (list.length > 12) list.shift();
    const body = { samples: list };
    U.safeLS.set(LKEY(S.state().active), JSON.stringify(body));
    if (LA.cloud && LA.cloud.available()) LA.cloud.saveHand(S.state().active, body);
  };
  H.clearSamples = async () => { cache = []; U.safeLS.del(LKEY(S.state().active)); if (LA.cloud && LA.cloud.available()) LA.cloud.saveHand(S.state().active, { samples: [] }); };

  /* read(pad, {question, prog}) -> {text, confidence, spelling, note, dataUrl} */
  H.read = async (pad, opts) => {
    const blob = await pad.toBlob(1200);
    if (!blob) throw new Error(LA.tr('Write something first.', 'Najpierw coś napisz.'));
    const lang = LA.PROGRAMMES[opts.prog || LA.state.prog].lang;
    const samples = await H.samples(lang);
    const r = await LA.ai.readHandwriting(blob, Object.assign({ samples }, opts));
    r.dataUrl = pad.toDataURL(360);
    return r;
  };
})();

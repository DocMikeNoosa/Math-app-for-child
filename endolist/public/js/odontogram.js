// EndoList — grafika uzębienia: łuki (widok zgryzowy) w aplikacji, widok boczny wybranego zęba, mini-schemat do listu.
import { toothInfo, canalLabel } from './data.js';

const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

/* =============================================================== łuki zębowe (UI) */
const W_UP = [8.5, 6.5, 7.5, 7, 6.5, 10, 9, 8.5], BL_UP = [7, 6.2, 8, 9, 9, 11, 11, 10];
const W_LO = [5.2, 5.8, 7, 7, 7.2, 11, 10.5, 10], BL_LO = [6, 6.2, 7.6, 7.6, 8, 10.5, 10.2, 9.6];
const AX = { cx: 380, a: 292, b: 205, T: 1.6, upY: 62, loY: 560 };

function archLayout(widths, bls) {
  // numeric arc length of x = a sin t, y = b(1 - cos t)
  const N = 2000, ts = [], ss = [0];
  for (let i = 0; i <= N; i++) ts.push((AX.T * i) / N);
  for (let i = 1; i <= N; i++) { const t0 = ts[i - 1], t1 = ts[i]; const dx = AX.a * (Math.sin(t1) - Math.sin(t0)), dy = AX.b * (Math.cos(t0) - Math.cos(t1)); ss.push(ss[i - 1] + Math.hypot(dx, dy)); }
  const S = ss[N], gap = 0.7, total = widths.reduce((a, w) => a + w + gap, 0), k = S / total;
  let acc = 0;
  return widths.map((w, i) => {
    const s = (acc + (w + gap) / 2) * k; acc += w + gap;
    let j = ss.findIndex((v) => v >= s); if (j < 1) j = 1;
    const t = ts[j - 1] + ((s - ss[j - 1]) / (ss[j] - ss[j - 1])) * (ts[j] - ts[j - 1]);
    return { t, w: w * k * 0.9, h: bls[i] * k * 0.9 };
  });
}
const L_UP = archLayout(W_UP, BL_UP), L_LO = archLayout(W_LO, BL_LO);

function occlusalPath(type, W, H) {
  const w = W / 2, h = H / 2;
  if (type === 'incisor') return `M${-w} 0 C${-w} ${-h * 1.1} ${w} ${-h * 1.1} ${w} 0 C${w} ${h * 1.1} ${-w} ${h * 1.1} ${-w} 0Z`;
  if (type === 'canine') return `M${-w} 0 C${-w} ${-h * 0.7} ${-w * 0.35} ${-h} 0 ${-h} C${w * 0.35} ${-h} ${w} ${-h * 0.7} ${w} 0 C${w} ${h * 0.75} ${w * 0.4} ${h} 0 ${h} C${-w * 0.4} ${h} ${-w} ${h * 0.75} ${-w} 0Z`;
  if (type === 'premolar') return `M${-w} 0 C${-w} ${-h * 1.05} ${w} ${-h * 1.05} ${w} 0 C${w} ${h * 1.05} ${-w} ${h * 1.05} ${-w} 0Z`;
  const r = Math.min(w, h) * 0.62;
  return `M${-w + r} ${-h} H${w - r} Q${w} ${-h} ${w} ${-h + r} V${h - r} Q${w} ${h} ${w - r} ${h} H${-w + r} Q${-w} ${h} ${-w} ${h - r} V${-h + r} Q${-w} ${-h} ${-w + r} ${-h}Z`;
}
function fissures(type, W, H) {
  const w = W / 2, h = H / 2;
  if (type === 'molar') return `M${-w * 0.55} 0 Q0 ${h * 0.15} ${w * 0.55} 0 M${-w * 0.1} ${-h * 0.55} Q${w * 0.05} 0 ${-w * 0.1} ${h * 0.55}`;
  if (type === 'premolar') return `M${-w * 0.5} 0 Q0 ${h * 0.12} ${w * 0.5} 0`;
  return '';
}

/** marks: { fdi: 'endo' | 'stage' | 'work' | 'plan' } */
export function archSVG({ marks = {}, selected = null, multi = new Set() } = {}) {
  let s = `<svg class="arch" viewBox="0 0 760 622" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schemat uzębienia">
  <defs>
    <linearGradient id="gEndo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cf0e0"/><stop offset="1" stop-color="#4aa8ff"/></linearGradient>
    <linearGradient id="gWork" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3b5ff"/><stop offset="1" stop-color="#8f7bff"/></linearGradient>
    <linearGradient id="gTooth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2a42"/><stop offset="1" stop-color="#141e31"/></linearGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <text x="380" y="300" text-anchor="middle" class="arch-cap">SZCZĘKA</text>
  <text x="380" y="336" text-anchor="middle" class="arch-cap">ŻUCHWA</text>
  <text x="24" y="311" class="arch-side">P</text><text x="736" y="311" text-anchor="end" class="arch-side">L</text>`;
  const draw = (fdi, L, upper, sign) => {
    const ti = toothInfo(fdi), g = L[ti.pos - 1];
    const x = AX.cx + sign * AX.a * Math.sin(g.t);
    const y = upper ? AX.upY + AX.b * (1 - Math.cos(g.t)) : AX.loY - AX.b * (1 - Math.cos(g.t));
    const dx = sign * AX.a * Math.cos(g.t), dy = (upper ? 1 : -1) * AX.b * Math.sin(g.t);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    // outward normal: the one pointing away from the arch centre
    const nl = Math.hypot(dx, dy);
    let mx = -dy / nl, my = dx / nl;
    const cy = upper ? AX.upY + AX.b : AX.loY - AX.b;
    if ((mx * (x - AX.cx) + my * (y - cy)) < 0) { mx = -mx; my = -my; }
    const m = marks[fdi] || '', cls = ['tooth', m, selected === fdi ? 'sel' : '', multi.has(fdi) ? 'inv' : ''].filter(Boolean).join(' ');
    const lx = x + mx * (g.h / 2 + 15), ly = y + my * (g.h / 2 + 15) + 4;
    s += `<g class="${cls}" data-fdi="${fdi}" tabindex="0" role="button" aria-label="Ząb ${fdi}">
      <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})">
        <path class="halo" d="${occlusalPath(ti.type, g.w + 10, g.h + 10)}"/>
        <path class="crown" d="${occlusalPath(ti.type, g.w, g.h)}"/>
        <path class="fiss" d="${fissures(ti.type, g.w, g.h)}"/>
      </g>
      <text class="num" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${fdi}</text>
    </g>`;
  };
  for (const fdi of [11, 12, 13, 14, 15, 16, 17, 18]) draw(fdi, L_UP, true, -1);
  for (const fdi of [21, 22, 23, 24, 25, 26, 27, 28]) draw(fdi, L_UP, true, 1);
  for (const fdi of [41, 42, 43, 44, 45, 46, 47, 48]) draw(fdi, L_LO, false, -1);
  for (const fdi of [31, 32, 33, 34, 35, 36, 37, 38]) draw(fdi, L_LO, false, 1);
  return s + '</svg>';
}

/* =============================================================== widok boczny zęba */
const DIMS = {
  U: { 1: [27, 25, 34], 2: [22, 22, 31], 3: [24, 25, 42], 4: [24, 21, 32], 5: [23, 21, 33], 6: [33, 20, 30], 7: [31, 20, 28], 8: [28, 18, 24] },
  L: { 1: [18, 21, 31], 2: [19, 21, 32], 3: [22, 24, 40], 4: [22, 21, 34], 5: [23, 21, 35], 6: [34, 20, 31], 7: [32, 19, 29], 8: [29, 18, 25] },
};
function crownPath(ti, cx, cw, ch) {
  const L = cx - cw / 2, R = cx + cw / 2, w = cw, cL = cx - cw * 0.38, cR = cx + cw * 0.38;
  let occ;
  if (ti.type === 'molar') occ = `Q${L + w / 6} -2 ${L + w / 3} 3 Q${cx} -2 ${R - w / 3} 3 Q${R - w / 6} -2 ${R} 5`;
  else if (ti.type === 'premolar') occ = `Q${L + w / 4} -2 ${cx} 3 Q${R - w / 4} -2 ${R} 5`;
  else if (ti.type === 'canine') occ = `Q${L + w * 0.25} 1 ${cx} -3 Q${R - w * 0.25} 1 ${R} 5`;
  else occ = `Q${cx} 0 ${R} 5`;
  return `M${cL} ${ch} C${L} ${ch * 0.75} ${L} ${ch * 0.45} ${L} 5 ${occ} C${R} ${ch * 0.45} ${R} ${ch * 0.75} ${cR} ${ch} Z`;
}
function rootPath(rx, rw, ch, len, sh) {
  const y0 = ch - 3, y1 = ch + len;
  return `M${rx - rw / 2} ${y0} C${rx - rw / 2} ${ch + len * 0.55} ${rx + sh - rw * 0.22} ${y1} ${rx + sh} ${y1} C${rx + sh + rw * 0.22} ${y1} ${rx + rw / 2} ${ch + len * 0.55} ${rx + rw / 2} ${y0} Z`;
}

/** Large lateral view of one tooth, drawn from the record's roots/canals. */
export function toothDetailSVG(rec, { done = false } = {}) {
  const ti = toothInfo(rec.fdi), [cw0, ch0, rl0] = DIMS[ti.upper ? 'U' : 'L'][ti.pos];
  const S = 3.3, cw = cw0 * S * (ti.type === 'incisor' ? 1.15 : 1), ch = ch0 * S, rl = rl0 * S * 0.92, cx = 120;
  const roots = rec.roots && rec.roots.length ? rec.roots : [{ name: 'K', canals: [{ name: 'K' }] }];
  const n = roots.length;
  const span = Math.min(cw * 0.62, 26 * n);
  const rw = Math.max(16, Math.min(34, (cw * 0.78) / n));
  let parts = '', canalSvg = '', labels = '';
  roots.forEach((r, i) => {
    const off = n === 1 ? 0 : -span / 2 + (span * i) / (n - 1);
    const isWide = /^C$/.test(r.name);
    const w = isWide ? cw * 0.7 : n === 3 && i === 1 ? rw * 0.92 : rw;
    const sh = n === 1 ? 0 : (off / span) * 18;
    const len = rl * (n === 3 && i === 1 ? 1.05 : 1) * (r.name === 'RE' ? 0.82 : 1);
    parts += `<path class="root${r.name === 'RE' ? ' radix' : ''}" d="${rootPath(cx + off, w, ch, len, sh)}"/>`;
    const k = r.canals.length || 1;
    r.canals.forEach((c, j) => {
      const co = k === 1 ? 0 : (-w * 0.22) + (w * 0.44 * j) / (k - 1);
      const x1 = cx + off * 0.55 + co * 0.6, y1 = ch * 0.62, x2 = cx + off + sh * 0.95 + co * 0.35, y2 = ch + len - 7;
      const filled = done && (c.wl || done === 'all');
      canalSvg += `<path class="canal${filled ? ' filled' : ''}" d="M${x1} ${y1} Q${(x1 + x2) / 2 + co * 0.3} ${(y1 + y2) / 2} ${x2} ${y2}"/>`;
      const lxp = x2 + (k > 1 ? (j - (k - 1) / 2) * 19 : 0);
      labels += `<text class="clab" x="${lxp.toFixed(1)}" y="${y2 + 16}" text-anchor="middle">${canalLabel(c.name) === 'kanał' ? '' : esc(c.name)}</text>`;
    });
    if (r.lateral) {
      const fr = { koronowa: 0.25, srodkowa: 0.55, wierzcholkowa: 0.82, delta: 0.95 }[r.lateral] || 0.6;
      const yy = ch + len * fr, xx = cx + off + sh * fr;
      canalSvg += r.lateral === 'delta'
        ? `<path class="lat" d="M${xx} ${yy - 4} l-7 9 M${xx} ${yy - 4} l0 10 M${xx} ${yy - 4} l7 9"/>`
        : `<path class="lat" d="M${xx} ${yy} Q${xx + w * 0.3} ${yy - 4} ${xx + w * 0.56} ${yy + 3}"/>`;
    }
  });
  const chamber = `<rect class="chamber" x="${cx - cw * 0.22}" y="${ch * 0.48}" width="${cw * 0.44}" height="${ch * 0.38}" rx="8"/>`;
  const totalH = ch + rl * 1.08 + 30;
  const flip = ti.upper ? `transform="translate(0 ${totalH + 10}) scale(1 -1)"` : `transform="translate(0 16)"`;
  // labels must not be mirrored: recompute their y for upper teeth
  if (ti.upper) labels = labels.replace(/y="([\d.]+)"/g, (m, v) => `y="${(totalH + 10 - parseFloat(v) + 26).toFixed(1)}"`);
  else labels = labels.replace(/y="([\d.]+)"/g, (m, v) => `y="${(parseFloat(v) + 16).toFixed(1)}"`);
  return `<svg class="tooth-detail" viewBox="0 0 240 ${Math.round(totalH + 40)}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gEnamel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#c9d5e8"/></linearGradient>
    <linearGradient id="gRoot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9cbb0"/><stop offset="1" stop-color="#a8977a"/></linearGradient></defs>
    <g ${flip}>${parts}<path class="enamel" d="${crownPath(ti, cx, cw, ch)}"/>${chamber}${canalSvg}</g>${labels}</svg>`;
}

/* =============================================================== mini-schemat do listu (czarno-biały) */
// marks: { fdi: 'endo' | 'stage' | 'work' | 'plan' }
export function letterChartSVG(marks) {
  const CW = 36, X0 = 12, GAP = 8, UOCC = 92, LOCC = 106;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" font-family="Inter, Helvetica, Arial, sans-serif"><rect width="600" height="200" fill="#fff"/>`;
  s += `<line x1="300" y1="14" x2="300" y2="186" stroke="#c9c9c9" stroke-width="1" stroke-dasharray="3 3"/><line x1="10" y1="99" x2="590" y2="99" stroke="#c9c9c9" stroke-width="1" stroke-dasharray="3 3"/>`;
  const rows = [[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28], [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]];
  rows.forEach((row, ri) => row.forEach((fdi, idx) => {
    const ti = toothInfo(fdi), [cw, ch, rl] = DIMS[ti.upper ? 'U' : 'L'][ti.pos];
    const cx = X0 + CW / 2 + idx * CW + (idx >= 8 ? GAP : 0);
    const m = marks[fdi];
    let fill = '#ffffff', stroke = '#a9a9a9', rfill = '#ffffff', dash = '', sw = 1, canal = '';
    if (m === 'endo') { fill = '#111111'; stroke = '#111111'; rfill = '#3a3a3a'; canal = '#ffffff'; sw = 1.3; }
    else if (m === 'stage') { fill = '#8a8a8a'; stroke = '#111111'; rfill = '#d0d0d0'; dash = '3 2'; sw = 1.3; canal = '#111111'; }
    else if (m === 'work') { fill = '#c4c4c4'; stroke = '#222222'; rfill = '#ffffff'; sw = 1.2; }
    else if (m === 'plan') { fill = '#ffffff'; stroke = '#111111'; rfill = '#ffffff'; dash = '3 2'; sw = 1.2; }
    const tf = ti.upper ? `translate(0 ${UOCC}) scale(1 -1)` : `translate(0 ${LOCC})`;
    const nr = ti.type === 'molar' ? (ti.upper ? 3 : 2) : (ti.upper && ti.pos === 4 ? 2 : 1);
    s += `<g transform="${tf}">`;
    const rootsXs = nr === 1 ? [[cx, 11, rl, 0]] : nr === 2 && ti.type === 'premolar' ? [[cx - 4.5, 8, rl, -1.5], [cx + 4.5, 8, rl, 1.5]] : nr === 3 ? [[cx, 10, rl + 2, 0], [cx - cw * 0.24, 10, rl, -2.5], [cx + cw * 0.24, 10, rl, 2.5]] : [[cx - cw * 0.24, 10, rl, -2.5], [cx + cw * 0.24, 10, rl, 2.5]];
    for (const [rx, rw, len, sh] of rootsXs) s += `<path d="${rootPath(rx, rw, ch, len, sh)}" fill="${rfill}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
    s += `<path d="${crownPath(ti, cx, cw, ch)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''}/>`;
    if (canal) for (const [rx, , len, sh] of rootsXs) s += `<line x1="${rx}" y1="${ch * 0.55}" x2="${rx + sh * 0.95}" y2="${ch + len - 2.5}" stroke="${canal}" stroke-width="${m === 'endo' ? 2 : 1.3}" stroke-linecap="round" ${m === 'stage' ? 'stroke-dasharray="2 2"' : ''}/>`;
    s += `</g>`;
    s += `<text x="${cx}" y="${ti.upper ? 13 : 196}" text-anchor="middle" font-size="${m ? 15 : 12}" font-weight="${m ? 700 : 400}" fill="${m ? '#000' : '#8a8a8a'}">${fdi}</text>`;
  }));
  return s + '</svg>';
}

export function svgToPng(svg, w, h) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); res(cv.toDataURL('image/png')); };
    img.onerror = () => rej(new Error('Nie udało się narysować schematu'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

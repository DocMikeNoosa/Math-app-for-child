// Letter figures: a still image of the 3D model centred on the treated lesion, with the vessel names,
// a callout for the lesion / treatment and a scale bar. Rendered off-screen on this computer only —
// nothing is sent anywhere.
import { createModel3D } from './model3d.js';

const wrapText = (ctx, text, max) => {
  const words = String(text).split(/\s+/); const lines = []; let line = '';
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
};

/**
 * @param model   expanded model3d (variants applied)
 * @param lesions lesions of this model (renderer format)
 * @param index   which lesion the figure is about
 * @param opts    { lang, callout, width, height }
 * @returns PNG data URL or null (no WebGL)
 */
export function renderFigure(model, lesions, index, { lang = 'pl', callout = '', compact = false, width = compact ? 500 : 760, height = compact ? 420 : 500 } = {}) {
  // compact: a small picture for the corner of the letter — larger lettering, only the key labels
  const F = compact ? 1.55 : 1;
  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px;pointer-events:none`;
  document.body.append(host);
  let v = null;
  try {
    v = createModel3D(host, model, { figure: true, lesions, marks: {}, lang, figureZoom: compact ? 0.8 : 1 });
    if (!v || !v.frame(index)) return null;
    const shot = v.canvas();
    v.snapshot();
    const info = v.figureLabels(compact ? 1 : 5, index);
    const S = 2; // drawing scale (the WebGL canvas is rendered at pixel ratio 2)
    const c = document.createElement('canvas');
    c.width = width * S; c.height = height * S;
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(shot, 0, 0, c.width, c.height);
    g.scale(S, S);
    const halo = (text, x, y, font, color, align = 'left') => {
      g.textAlign = align; g.font = font; g.lineJoin = 'round'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.92)'; g.strokeText(text, x, y); g.fillStyle = color; g.fillText(text, x, y); g.textAlign = 'left';
    };
    // vessel names with thin leader lines, pushed away from the lesion (never under the callout box)
    const cx = info.focus?.x ?? width / 2; const cy = info.focus?.y ?? height / 2;
    const used = [];
    let box = null;
    if (callout && info.focus) {
      g.font = `700 ${Math.round(13 * F)}px Arial, sans-serif`;
      const lines = wrapText(g, callout, compact ? 300 : 250);
      const bw = Math.max(...lines.map((t) => g.measureText(t).width)) + 16; const bh = lines.length * Math.round(17 * F) + 10;
      let bx = cx + 40 * F; let by = cy - 60 * F - bh / 2;
      if (bx + bw > width - 6) bx = cx - 40 * F - bw;
      bx = Math.max(6, bx); by = Math.max(6, Math.min(height - bh - 30, by));
      box = { lines, bx, by, bw, bh };
      used.push({ x: bx - 4, y: by + bh / 2, w: bw + 8, h: bh + 8 });
    }
    for (const l of info.labels) {
      const dx = l.x - cx; const dy = l.y - cy; const d = Math.hypot(dx, dy) || 1;
      let tx = l.x + (dx / d) * 30 * F; let ty = l.y + (dy / d) * 22 * F;
      g.font = `600 ${Math.round(12 * F)}px Arial, sans-serif`;
      const w = g.measureText(l.text).width;
      if (dx < 0) tx -= w;
      tx = Math.max(6, Math.min(width - w - 6, tx)); ty = Math.max(16, Math.min(height - 10, ty));
      if (used.some((u) => Math.abs(u.y - ty) < (u.h ? u.h / 2 + 8 : 15 * F) && tx < u.x + u.w && tx + w > u.x)) continue;
      used.push({ x: tx, y: ty, w });
      g.strokeStyle = 'rgba(40,44,52,0.55)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(l.x, l.y); g.lineTo(dx < 0 ? tx + w + 2 : tx - 2, ty - 4); g.stroke();
      g.fillStyle = 'rgba(40,44,52,0.85)'; g.beginPath(); g.arc(l.x, l.y, 2, 0, Math.PI * 2); g.fill();
      halo(l.text, tx, ty, `600 ${Math.round(12 * F)}px Arial, sans-serif`, '#2a2e36');
    }
    // lesion / treatment callout
    if (box) {
      const { lines, bx, by, bw, bh } = box;
      g.font = `700 ${Math.round(13 * F)}px Arial, sans-serif`;
      g.strokeStyle = '#b3123a'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(bx + (bx > cx ? 0 : bw), by + bh / 2); g.stroke();
      g.fillStyle = '#b3123a'; g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.95)'; g.strokeStyle = '#b3123a';
      g.beginPath(); if (g.roundRect) g.roundRect(bx, by, bw, bh, 6); else g.rect(bx, by, bw, bh); g.fill(); g.stroke();
      g.fillStyle = '#7d0b27'; lines.forEach((t, i) => g.fillText(t, bx + 8, by + Math.round(18 * F) - (F > 1 ? 4 : 0) + i * Math.round(17 * F)));
    }
    // scale bar
    const mm = info.mmPerPx > 0.35 ? 20 : info.mmPerPx > 0.12 ? 10 : 5;
    const px = mm / info.mmPerPx;
    if (px > 20 && px < width / 2) {
      g.strokeStyle = '#2a2e36'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(14, height - 16); g.lineTo(14 + px, height - 16); g.moveTo(14, height - 21); g.lineTo(14, height - 11); g.moveTo(14 + px, height - 21); g.lineTo(14 + px, height - 11); g.stroke();
      halo(`${mm} mm`, 20 + px, height - 12, `600 ${Math.round(11 * F)}px Arial, sans-serif`, '#2a2e36');
    }
    if (!compact) halo(lang === 'en' ? 'Schematic, not to exact scale of the patient' : 'Schemat poglądowy, nie odwzorowuje dokładnie anatomii pacjenta', width - 8, height - 10, 'italic 10px Arial, sans-serif', '#6b7280', 'right');
    return c.toDataURL('image/png');
  } catch {
    return null;
  } finally {
    v?.dispose();
    host.remove();
  }
}

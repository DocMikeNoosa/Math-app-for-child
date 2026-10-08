// EndoList — list w PDF (A4). Minimalistyczny, czytelny także w druku czarno-białym.
import { letterChartSVG, svgToPng } from './odontogram.js';
import { fmtDate, fmtDateLong } from './letter.js';

const FONTS = [['Inter-Regular.ttf', 'Inter', 'normal'], ['Inter-Medium.ttf', 'InterMedium', 'normal'], ['Inter-SemiBold.ttf', 'InterSemi', 'normal'], ['Inter-Italic.ttf', 'Inter', 'italic'], ['Inter-Light.ttf', 'InterLight', 'normal']];
let fontData = null;
async function loadFonts() {
  if (fontData) return fontData;
  fontData = await Promise.all(FONTS.map(async ([file]) => {
    const buf = await (await fetch(new URL(`../fonts/pdf/${file}`, import.meta.url))).arrayBuffer();
    const a = new Uint8Array(buf); let s = '';
    for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode(...a.subarray(i, i + 0x8000));
    return btoa(s);
  }));
  return fontData;
}

const INK = [17, 17, 17], GRAY = [92, 92, 92], LIGHT = [150, 150, 150], RULE = [205, 205, 205];

/**
 * @param o.doctor   {title, first, last, specialty, practice, address, phone, email, npwz, city, signature, useSignature}
 * @param o.patient  {first, last, dob}
 * @param o.referrer {kind, title, first, last, clinic, address}
 * @param o.content  {salutation, opening, sections[], recommendations[], closing, signoff}
 * @param o.glance   [{fdi, mark, text}]
 * @param o.dates    ['2026-10-08', ...]
 * @param o.letterDate ISO
 */
export async function buildLetterPDF(o) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const fd = await loadFonts();
  FONTS.forEach(([file, name, style], i) => { doc.addFileToVFS(file, fd[i]); doc.addFont(file, name, style); });
  const W = 210, H = 297, M = 22, CW = W - 2 * M, BOTTOM = H - 20;
  const set = (font, size, color = INK, style = 'normal') => { doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...color); };
  const d = o.doctor, p = o.patient, r = o.referrer || {};
  const docName = [d.title, d.first, d.last].filter(Boolean).join(' ');
  doc.setProperties({ title: `List — ${[p.last, p.first].join(' ')} — ${o.letterDate}`, subject: 'Informacja o leczeniu dla lekarza kierującego', author: docName, creator: 'EndoList' });
  doc.setLineHeightFactor(1.42);

  // ---------- nagłówek: logo gabinetu / grupy, nadawca (lewo), miejscowość i data (prawo)
  let y = 22;
  const logos = [d.logo, d.groupLogo].filter(Boolean);
  if (logos.length) {
    let lx = M; const lh = 13;
    for (const src of logos) {
      try {
        const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
        const lw = Math.min(48, (im.width / im.height) * lh), hh = lw / (im.width / im.height);
        doc.addImage(src, src.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG', lx, 14 + (lh - hh) / 2, lw, hh, 'logo' + lx, 'FAST');
        lx += lw + 6;
      } catch { /* skip unreadable logo */ }
    }
    set('Inter', 9.2, INK); doc.text(`${d.city ? d.city + ', ' : ''}${fmtDateLong(o.letterDate)}`, W - M, 19, { align: 'right' });
    y = 36;
  }
  set('InterSemi', 12.5); doc.text(docName || 'Gabinet', M, y);
  const sub = [d.specialty, [d.practice, d.group].filter(Boolean).join(' · ')].filter(Boolean);
  set('Inter', 8.4, GRAY);
  let yy = y + 5;
  for (const l of sub) { doc.text(l, M, yy); yy += 3.9; }
  const contact = [d.address, [d.phone, d.email].filter(Boolean).join('  ·  '), d.npwz ? `NPWZ ${d.npwz}` : ''].filter(Boolean);
  set('Inter', 7.8, LIGHT);
  for (const l of contact) { doc.text(l, M, yy); yy += 3.6; }
  if (!logos.length) { set('Inter', 9.2, INK); doc.text(`${d.city ? d.city + ', ' : ''}${fmtDateLong(o.letterDate)}`, W - M, y, { align: 'right' }); }
  y = Math.max(yy, y + 8) + 3;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.2); doc.line(M, y, W - M, y);
  y += 9;

  // ---------- prawy górny róg: schemat + skróty
  const boxW = 66, boxX = W - M - boxW, imgH = boxW * 200 / 600;
  const png = await svgToPng(letterChartSVG(Object.fromEntries(o.glance.map((g) => [g.fdi, g.mark]))), 1800, 600);
  let ry = y;
  set('InterSemi', 6.4, GRAY); doc.text('SCHEMAT LECZENIA', boxX, ry, { charSpace: 0.35 }); ry += 1.8;
  doc.addImage(png, 'PNG', boxX, ry, boxW, imgH, 'chart', 'FAST');
  ry += imgH + 4.2;
  // legenda
  const used = new Set(o.glance.map((g) => g.mark));
  const legend = [['endo', 'leczenie kanałowe'], ['stage', 'w trakcie'], ['work', 'inne prace'], ['plan', 'zaplanowane / konsultacja']].filter(([k]) => used.has(k));
  let lx = boxX; set('Inter', 6, GRAY);
  for (const [k, lab] of legend) {
    if (k === 'endo') { doc.setFillColor(17, 17, 17); doc.setDrawColor(17, 17, 17); }
    else if (k === 'stage') { doc.setFillColor(138, 138, 138); doc.setDrawColor(17, 17, 17); }
    else if (k === 'work') { doc.setFillColor(196, 196, 196); doc.setDrawColor(34, 34, 34); }
    else { doc.setFillColor(255, 255, 255); doc.setDrawColor(17, 17, 17); }
    doc.setLineWidth(0.2); doc.rect(lx, ry - 1.9, 2.2, 2.2, 'FD');
    doc.text(lab, lx + 3, ry); lx += 3 + doc.getTextWidth(lab) + 3;
    if (lx > boxX + boxW - 10) { lx = boxX; ry += 3.2; }
  }
  ry += 4.2;
  for (const g of o.glance) {
    set('InterSemi', 7.2, INK); doc.text(String(g.fdi), boxX, ry);
    set('Inter', 6.9, INK);
    const lines = doc.splitTextToSize(g.text || '—', boxW - 7);
    lines.forEach((l, i) => doc.text(l, boxX + 6.5, ry + i * 3.05));
    ry += lines.length * 3.05 + 1.5;
  }

  // ---------- lewa kolumna: adresat i dane pacjenta
  const LW = boxX - M - 8;
  let ly = y;
  set('InterSemi', 6.4, GRAY); doc.text('ADRESAT', M, ly, { charSpace: 0.35 }); ly += 4.6;
  const rname = r.kind === 'clinic' ? (r.clinic || 'Klinika') : [r.title, r.first, r.last].filter(Boolean).join(' ');
  set('InterSemi', 10.2); doc.text(doc.splitTextToSize(rname || '—', LW), M, ly); ly += 4.8;
  set('Inter', 8.8, GRAY);
  for (const l of [r.kind === 'clinic' ? '' : r.clinic, ...(r.address || '').split('\n')].map((s) => s && s.trim()).filter(Boolean)) { doc.text(doc.splitTextToSize(l, LW), M, ly); ly += 4.1; }
  ly += 5;
  const rows = [['PACJENT', [p.first, p.last].filter(Boolean).join(' ')], [p.pesel ? 'PESEL' : 'DATA UR.', p.pesel || (p.dob ? fmtDate(p.dob) : '—')], [o.dates.length > 1 ? 'DATY LECZENIA' : 'DATA LECZENIA', o.dates.map(fmtDate).join(', ')], [o.glance.length > 1 ? 'ZĘBY' : 'ZĄB', o.glance.map((g) => g.fdi).join(', ')]];
  for (const [k, v] of rows) {
    set('InterSemi', 6.4, GRAY); doc.text(k, M, ly, { charSpace: 0.35 });
    set('InterMedium', 9.4, INK); const ls = doc.splitTextToSize(v || '—', LW - 30); doc.text(ls, M + 29, ly); ly += ls.length * 4.4 + 1.2;
  }
  y = Math.max(ly, ry) + 9;

  // ---------- treść
  const LH = 4.65;
  const c = o.content;
  const need = (h) => { if (y + h > BOTTOM) { doc.addPage(); y = 26; } };
  const para = (text, font = 'Inter', size = 9.7, color = INK, indent = 0, gap = 2.3) => {
    set(font, size, color);
    for (const l of doc.splitTextToSize(text, CW - indent)) { need(LH); doc.text(l, M + indent, y); y += LH; }
    y += gap;
  };
  set('InterSemi', 11.5); doc.text(o.title || 'Informacja o przeprowadzonym leczeniu', M, y); y += 9;
  para(c.salutation, 'Inter', 9.7, INK, 0, 1.6);
  if (c.opening) para(c.opening);
  for (const s of c.sections || []) {
    need(LH * 3); y += 1.2;
    set('InterSemi', 10); doc.text(s.heading, M, y); y += LH + 0.4;
    for (const t of s.paragraphs || []) para(t);
  }
  if ((c.recommendations || []).length) {
    need(LH * 3); y += 1.2;
    set('InterSemi', 10); doc.text('Zalecenia', M, y); y += LH + 0.4;
    for (const t of c.recommendations) {
      set('Inter', 9.7);
      const ls = doc.splitTextToSize(t, CW - 5);
      need(LH * ls.length);
      doc.text('•', M + 0.6, y);
      ls.forEach((l, i) => doc.text(l, M + 5, y + i * LH));
      y += ls.length * LH + 1.2;
    }
    y += 1.6;
  }
  // the closing paragraph stays on the same page as the signature
  set('Inter', 9.7);
  const closingLines = c.closing ? doc.splitTextToSize(c.closing, CW).length : 0;
  need(closingLines * LH + 40);
  if (c.closing) para(c.closing);
  // ---------- podpis
  y += 3;
  set('Inter', 10); doc.text(c.signoff || 'Z wyrazami szacunku,', M, y); y += 3;
  if (d.useSignature && d.signature) {
    try {
      const im = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = d.signature; });
      const sh = 15, sw = Math.min(60, (im.width / im.height) * sh);
      doc.addImage(d.signature, 'PNG', M, y, sw, sw / (im.width / im.height), 'sig', 'FAST'); y += sw / (im.width / im.height) + 2;
    } catch { y += 14; }
  } else y += 13;
  set('InterSemi', 10); doc.text(docName, M, y); y += 4.4;
  if (d.specialty) { set('Inter', 8.4, GRAY); doc.text(d.specialty, M, y); }

  // ---------- stopki
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...RULE); doc.setLineWidth(0.2); doc.line(M, H - 13.5, W - M, H - 13.5);
    set('Inter', 6.6, LIGHT);
    doc.text('Dokument zawiera dane objęte tajemnicą lekarską. Przeznaczony wyłącznie dla adresata.', M, H - 9.5);
    doc.text(`Strona ${i} z ${n}`, W - M, H - 9.5, { align: 'right' });
    if (i > 1) { set('Inter', 7.4, GRAY); doc.text(`${[p.first, p.last].join(' ')} · ${fmtDate(o.letterDate)}`, W - M, 14, { align: 'right' }); doc.text(docName, M, 14); }
  }
  return doc.output('blob');
}

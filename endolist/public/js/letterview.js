// EndoList — podgląd listu jako „kartka" w aplikacji (do czytania, zaznaczania fragmentów i edycji ręcznej).
import { letterArchSVG } from './odontogram.js';
import { fmtDate, fmtDateLong } from './letter.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Wraps the first occurrence of each annotation's quote in <mark>. */
function marked(text, loc, notes) {
  let html = esc(text);
  for (const n of notes.filter((x) => x.loc === loc && x.quote)) {
    const q = esc(n.quote), i = html.indexOf(q);
    if (i >= 0) html = html.slice(0, i) + `<mark class="note ${n.done ? 'done' : ''}" data-note="${n.id}">${q}</mark>` + html.slice(i + q.length);
  }
  return html;
}

export function letterPaperHTML(ctx, notes = [], { editable = false, hints = false } = {}) {
  const d = ctx.doctor, p = ctx.patient, r = ctx.referrer || {}, c = ctx.content;
  const docName = [d.title, d.first, d.last].filter(Boolean).join(' ');
  const ce = editable ? 'contenteditable="true" spellcheck="true"' : '';
  const P = (loc, text, cls = '') => `<p class="lp ${cls}" data-loc="${loc}" ${ce}>${marked(text, loc, notes)}</p>`;
  const rname = r.kind === 'clinic' ? (r.clinic || 'Klinika') : [r.title, r.first, r.last].filter(Boolean).join(' ');
  const marks = Object.fromEntries(ctx.glance.map((g) => [g.fdi, g.mark]));
  return `<article class="paper">
    <header class="lh">
      <div>${[d.logo, d.groupLogo].filter(Boolean).map((src) => `<img class="llogo" src="${src}" alt="">`).join('')}
        <div class="ldoc">${esc(docName)}</div><div class="lsub">${esc([d.specialty, [d.practice, d.group].filter(Boolean).join(' · ')].filter(Boolean).join(' · '))}</div>
        <div class="lcontact">${esc([d.address, d.phone, d.email].filter(Boolean).join(' · '))}</div></div>
      <div class="ldate">${esc(d.city ? d.city + ', ' : '')}${fmtDateLong(ctx.letterDate)}</div>
    </header>
    <div class="ltop">
      <div class="lmeta">
        <div class="k">Adresat</div><div class="rn">${esc(rname)}</div>
        <div class="ra">${esc([r.kind === 'clinic' ? '' : r.clinic, r.address].filter(Boolean).join('\n'))}</div>
        <table class="lrows"><tr><td>Pacjent</td><td>${esc([p.first, p.last].join(' '))}</td></tr>
        ${p.pesel || p.dob ? `<tr><td>${p.pesel ? 'PESEL' : 'Data ur.'}</td><td>${esc(p.pesel || fmtDate(p.dob))}</td></tr>` : ''}
        <tr><td>${ctx.dates.length > 1 ? 'Daty leczenia' : 'Data leczenia'}</td><td>${ctx.dates.map(fmtDate).join(', ')}</td></tr>
        <tr><td>${ctx.glance.length > 1 ? 'Zęby' : 'Ząb'}</td><td>${ctx.glance.map((g) => g.fdi).join(', ')}</td></tr></table>
      </div>
      <aside class="lchart"><div class="k">Schemat leczenia</div>${letterArchSVG(marks, Object.fromEntries(ctx.glance.filter((g) => g.canals).map((g) => [g.fdi, g.canals])))}
        ${ctx.glance.map((g) => `<div class="gl"><b>${g.fdi}</b><span>${esc(g.text)}</span></div>`).join('')}
        ${(ctx.materials || []).length ? `<div class="k" style="margin-top:12px">Materiały i sprzęt</div>${ctx.materials.map((m) => `<div class="gl mat"><b>${m.fdi}</b><span>${esc(m.items.join(', '))}</span></div>`).join('')}`
          : hints ? `<div class="k" style="margin-top:12px">Materiały i sprzęt</div><div class="gl mat-hint">Nie wybrano — dodaj je w karcie zęba, zakładka „Materiały i sprzęt". Ramka pojawi się tutaj i w PDF.</div>` : ''}</aside>
    </div>
    <h4 class="ltitle">${esc(c.title)}</h4>
    ${P('salutation', c.salutation)}
    ${P('opening', c.opening)}
    ${(c.sections || []).map((s, i) => `<h5 class="lsec" data-loc="sections.${i}.heading" ${ce}>${marked(s.heading, `sections.${i}.heading`, notes)}</h5>${(s.paragraphs || []).map((t, j) => P(`sections.${i}.paragraphs.${j}`, t)).join('')}`).join('')}
    ${(c.recommendations || []).length ? `<h5 class="lsec">Zalecenia</h5><ul class="lrec">${c.recommendations.map((t, i) => `<li data-loc="recommendations.${i}" ${ce}>${marked(t, `recommendations.${i}`, notes)}</li>`).join('')}</ul>` : ''}
    ${P('closing', c.closing)}
    <p class="lp lsign">${esc(c.signoff)}</p>
    ${d.useSignature && d.signature ? `<img class="lsigimg" src="${d.signature}" alt="">` : '<div style="height:34px"></div>'}
    <p class="lp"><b>${esc(docName)}</b><br><span class="lsub">${esc(d.specialty || '')}</span></p>
  </article>`;
}

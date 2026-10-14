// Interactive anatomical diagrams (SVG). Each diagram module in ./diagrams/ exports:
// { id, branches: ['Vascular'|'NonVascular'|'Neuro'], anat: '<body part id from anatomy.js>',
//   label: [pl, en], viewBox: '0 0 W H', backdrop: '<svg markup, not clickable>',
//   parts: [{ id, label: [pl, en], side: 'right'|'left'|'', kind: 'vessel'|'organ', d: '<path data>', w?: stroke width }] }
// Patient orientation: anatomical position facing the viewer — the patient's RIGHT is on the viewer's LEFT.

const NS = 'http://www.w3.org/2000/svg';
const SIDE_PL = { right: 'prawa', left: 'lewa' };
const SIDE_EN = { right: 'right', left: 'left' };

/** "MCA M1 prawa" / "right MCA M1". */
export function partLabel(part, lang = 'pl') {
  if (!part) return '';
  const name = part.label[lang === 'en' ? 1 : 0];
  if (!part.side) return name;
  return lang === 'en' ? `${SIDE_EN[part.side]} ${name}` : `${name} (${SIDE_PL[part.side]})`;
}

/**
 * Draw a diagram into `host`. `marks` = { partId: 'badge text' } for selected parts (badge may be '').
 * `onPick(partId)` is called on click / Enter. Returns the <svg>.
 */
export function renderDiagram(host, diagram, { marks = {}, active = null, lang = 'pl', onPick = null } = {}) {
  host.textContent = '';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', diagram.viewBox);
  svg.setAttribute('class', 'dgm');
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-label', diagram.label[lang === 'en' ? 1 : 0]);
  const back = document.createElementNS(NS, 'g');
  back.setAttribute('class', 'dgm-back');
  back.innerHTML = diagram.backdrop || '';
  svg.append(back);
  const organs = document.createElementNS(NS, 'g');
  const vessels = document.createElementNS(NS, 'g');
  const badges = document.createElementNS(NS, 'g');
  badges.setAttribute('class', 'dgm-badges');
  svg.append(organs, vessels, badges);
  for (const p of diagram.parts) {
    const g = document.createElementNS(NS, 'g');
    const on = Object.prototype.hasOwnProperty.call(marks, p.id);
    g.setAttribute('class', `dgm-part ${p.kind}${on ? ' on' : ''}${active === p.id ? ' active' : ''}`);
    g.dataset.part = p.id;
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-pressed', String(on));
    const title = document.createElementNS(NS, 'title');
    title.textContent = partLabel(p, lang);
    g.append(title);
    const shape = document.createElementNS(NS, 'path');
    shape.setAttribute('d', p.d);
    shape.setAttribute('class', 'shape');
    if (p.kind === 'vessel') {
      // a wide invisible stroke makes thin vessels easy to hit
      const hit = document.createElementNS(NS, 'path');
      hit.setAttribute('d', p.d);
      hit.setAttribute('class', 'hit');
      hit.setAttribute('stroke-width', String(Math.max(14, (p.w || 5) + 10)));
      shape.setAttribute('stroke-width', String(p.w || 5));
      g.append(hit, shape);
      vessels.append(g);
    } else {
      g.append(shape);
      organs.append(g);
    }
    if (on && marks[p.id]) badges.append(badgeFor(p, marks[p.id], shape));
  }
  if (onPick) {
    svg.addEventListener('click', (e) => { const g = e.target.closest('.dgm-part'); if (g) onPick(g.dataset.part); });
    svg.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.dgm-part')) { e.preventDefault(); onPick(e.target.closest('.dgm-part').dataset.part); }
    });
  }
  host.append(svg);
  // badges need the rendered geometry: place them once the SVG is in the document
  for (const b of badges.children) b.place?.();
  return svg;
}

function badgeFor(part, text, shape) {
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'dgm-badge');
  const rect = document.createElementNS(NS, 'rect');
  const t = document.createElementNS(NS, 'text');
  t.textContent = text;
  g.append(rect, t);
  g.place = () => {
    let x = 0; let y = 0;
    try {
      if (part.kind === 'vessel') {
        const len = shape.getTotalLength();
        const pt = shape.getPointAtLength(len / 2);
        x = pt.x; y = pt.y;
      } else {
        const bb = shape.getBBox();
        x = bb.x + bb.width / 2; y = bb.y + bb.height / 2;
      }
    } catch { return; }
    t.setAttribute('x', String(x + 8));
    t.setAttribute('y', String(y - 8));
    const w = Math.max(18, text.length * 6.6 + 8);
    rect.setAttribute('x', String(x + 4));
    rect.setAttribute('y', String(y - 20));
    rect.setAttribute('width', String(w));
    rect.setAttribute('height', '16');
    rect.setAttribute('rx', '4');
  };
  return g;
}

// 3D anatomical models (three.js) built from the diagram data: vessels become glossy tubes, organs rounded
// solids. Drag = rotate, wheel = zoom, double-click = reset, click = select. Labels and badges are HTML overlays
// projected from 3D, so they stay sharp. Same data and API as the 2D renderer (diagram.js), which is the fallback.
import * as THREE from '../vendor/three.mjs';
import { renderDiagram as render2D, partLabel } from './diagram.js';

const NS = 'http://www.w3.org/2000/svg';
const COLORS = {
  vessel: 0xc8304f, vesselVein: 0x5a74d6, organ: 0xe79a7c, duct: 0x86b86a, bone: 0xd9d2c0,
  on: 0xffc94d, active: 0xfff0b8, hover: 0xff7d96,
};
let probe = null; // hidden SVG used to sample path geometry
function sampler() {
  if (!probe) {
    probe = document.createElementNS(NS, 'svg');
    probe.setAttribute('width', '0');
    probe.setAttribute('height', '0');
    probe.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden';
    document.body.append(probe);
  }
  return probe;
}
/** Points along an SVG path: [{x, y, t}] with t = fraction of the length. */
function samplePath(d, step = 5, min = 8, max = 160) {
  const p = document.createElementNS(NS, 'path');
  p.setAttribute('d', d);
  sampler().append(p);
  let len = 0;
  try { len = p.getTotalLength(); } catch { /* invalid path */ }
  const n = Math.max(min, Math.min(max, Math.ceil(len / step)));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const pt = p.getPointAtLength(len * t);
    out.push({ x: pt.x, y: pt.y, t });
  }
  p.remove();
  return { pts: out, len };
}
/** Split path data into one command per vertex ("M x y", "L x y", "Q c x y", …). */
function vertexCommands(d) {
  const per = { M: 2, L: 2, T: 2, H: 1, V: 1, Q: 4, S: 4, C: 6, A: 7 };
  const out = [];
  for (const m of String(d).matchAll(/([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g)) {
    const cmd = m[1];
    const up = cmd.toUpperCase();
    if (up === 'Z') continue;
    const nums = m[2].match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
    const n = per[up] || 2;
    for (let i = 0; i + n <= nums.length; i += n) {
      // extra pairs after M are implicit line-tos
      const c = i > 0 && up === 'M' ? (cmd === 'M' ? 'L' : 'l') : cmd;
      out.push(`${c}${nums.slice(i, i + n).join(' ')}`);
    }
  }
  return out;
}
/** Fraction of the path length at each vertex (for z arrays given one value per vertex). */
function vertexFractions(d, total) {
  const cmds = vertexCommands(d);
  if (cmds.length < 2 || !total) return null;
  const p = document.createElementNS(NS, 'path');
  sampler().append(p);
  const out = [];
  for (let k = 0; k < cmds.length; k++) {
    p.setAttribute('d', cmds.slice(0, k + 1).join(' '));
    let l = 0;
    try { l = k ? p.getTotalLength() : 0; } catch { l = 0; }
    out.push(Math.min(1, l / total));
  }
  p.remove();
  return out;
}
/** Depth at fraction t: a number, or an array — one value per path vertex (or spread evenly). */
function depthAt(z, t, fr = null) {
  if (Array.isArray(z) && fr && fr.length === z.length) {
    if (t <= fr[0]) return z[0];
    for (let i = 1; i < fr.length; i++) {
      if (t <= fr[i]) { const span = fr[i] - fr[i - 1] || 1; return z[i - 1] + (z[i] - z[i - 1]) * ((t - fr[i - 1]) / span); }
    }
    return z[z.length - 1];
  }
  if (Array.isArray(z)) {
    if (!z.length) return 0;
    if (z.length === 1) return z[0];
    const f = t * (z.length - 1);
    const i = Math.min(z.length - 2, Math.floor(f));
    return z[i] + (z[i + 1] - z[i]) * (f - i);
  }
  return typeof z === 'number' ? z : 0;
}
const isVein = (p) => !/tętnic|artery|arteries/i.test(`${p.label?.[0] || ''} ${p.label?.[1] || ''}`) && (/żył|zatok|vein|sinus|vena|IVC|SVC|IJV|galen|torcular|spływ|jugular bulb|opuszka/i.test(`${p.label?.[0] || ''} ${p.label?.[1] || ''}`) || /^(ivc|svc|ijv|azygos|portal|smv|imv|cfv)/.test(p.id));
const isDuct = (p) => !/tętnic|artery|żył|vein/i.test(`${p.label?.[0] || ''} ${p.label?.[1] || ''}`) && /duct|ureter|przewód|moczow|bronch|trache|oesoph|esoph|przeły|tchawic|oskrzel|urethra|cewk/i.test(`${p.id} ${p.label?.[0] || ''}`);
const isBone = (p) => /^(c|t|l)\d+$|^s1$|sacrum|coccyx|kręg|kość|joint|staw/i.test(`${p.id} ${p.label?.[0] || ''}`);

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

/**
 * Create a 3D view in `host`. Returns { update({marks, active, lang}), reset(), dispose() } or null (no WebGL).
 * opts: { marks, active, lang, onPick(partId) }
 */
export function create3D(host, diagram, opts = {}) {
  if (!webglAvailable()) return null;
  host.textContent = '';
  host.classList.add('dgm3d-host');
  const wrap = document.createElement('div');
  wrap.className = 'dgm3d';
  const overlay = document.createElement('div');
  overlay.className = 'dgm3d-overlay';
  const tip = document.createElement('div');
  tip.className = 'dgm3d-tip';
  tip.hidden = true;
  const tools = document.createElement('div');
  tools.className = 'dgm3d-tools';
  tools.innerHTML = '<button type="button" data-view="front" title="Widok z przodu">P/A</button><button type="button" data-view="side" title="Widok z boku">Bok</button><button type="button" data-view="top" title="Widok z góry">Góra</button><button type="button" data-view="reset" title="Przywróć widok (dwuklik)">↺</button>';
  wrap.append(overlay, tip, tools);
  host.append(wrap);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch { host.textContent = ''; return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  wrap.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 6000);
  scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a0d16, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-300, 500, 700);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6b84, 0.9);
  rim.position.set(500, -200, -600);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb6ff, 0.45);
  fill.position.set(400, 100, 300);
  scene.add(fill);

  const root = new THREE.Group(); // rotated by the user
  scene.add(root);
  const [, , W, H] = diagram.viewBox.split(/\s+/).map(Number);
  const cx = W / 2;
  const cy = H / 2;
  const toV = (x, y, z = 0) => new THREE.Vector3(x - cx, -(y - cy), z);

  // backdrop: outlines as faint lines behind, text labels as HTML overlay
  const back = new DOMParser().parseFromString(`<svg xmlns="${NS}">${diagram.backdrop || ''}</svg>`, 'image/svg+xml');
  const labels = [];
  const lineMat = new THREE.LineBasicMaterial({ color: 0x8a96b8, transparent: true, opacity: 0.22 });
  for (const el of back.querySelectorAll('path, ellipse, circle, rect, line, polyline, polygon')) {
    let d = el.getAttribute('d');
    if (!d && el.tagName === 'ellipse') { const ex = +el.getAttribute('cx'); const ey = +el.getAttribute('cy'); const rx = +el.getAttribute('rx'); const ry = +el.getAttribute('ry'); d = `M${ex - rx} ${ey} A${rx} ${ry} 0 1 0 ${ex + rx} ${ey} A${rx} ${ry} 0 1 0 ${ex - rx} ${ey} Z`; }
    if (!d && el.tagName === 'circle') { const ex = +el.getAttribute('cx'); const ey = +el.getAttribute('cy'); const r = +el.getAttribute('r'); d = `M${ex - r} ${ey} A${r} ${r} 0 1 0 ${ex + r} ${ey} A${r} ${r} 0 1 0 ${ex - r} ${ey} Z`; }
    if (!d && el.tagName === 'rect') { const x = +el.getAttribute('x'); const y = +el.getAttribute('y'); const w = +el.getAttribute('width'); const h = +el.getAttribute('height'); d = `M${x} ${y} H${x + w} V${y + h} H${x} Z`; }
    if (!d && el.tagName === 'line') d = `M${el.getAttribute('x1')} ${el.getAttribute('y1')} L${el.getAttribute('x2')} ${el.getAttribute('y2')}`;
    if (!d && (el.tagName === 'polyline' || el.tagName === 'polygon')) { const pts = (el.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number); if (pts.length >= 4) d = `M${pts.slice(0, 2).join(' ')} L${pts.slice(2).join(' ')}${el.tagName === 'polygon' ? ' Z' : ''}`; }
    if (!d) continue;
    const { pts } = samplePath(d, 8, 4, 120);
    const z = -90 + (el.getAttribute('class') === 'faint' ? -10 : 0);
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => toV(p.x, p.y, z)));
    root.add(new THREE.Line(g, lineMat));
  }
  for (const t of back.querySelectorAll('text')) {
    const x = Number(t.getAttribute('x')); const y = Number(t.getAttribute('y'));
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const span = document.createElement('span');
    span.className = `dgm3d-label ${t.getAttribute('class') || 'lbl'}`;
    span.textContent = t.textContent;
    overlay.append(span);
    labels.push({ el: span, pos: toV(x, y, t.getAttribute('class') === 'side' ? 0 : 20) });
  }

  // parts
  const meshes = []; // { part, mesh, hit, mid }
  const box = new THREE.Box3();
  for (const p of diagram.parts) {
    const vein = isVein(p);
    const duct = isDuct(p);
    if (p.kind === 'vessel') {
      const { pts, len } = samplePath(p.d, 4, 6, 200);
      const fr = Array.isArray(p.z) ? vertexFractions(p.d, len) : null;
      const v3 = pts.map((q) => toV(q.x, q.y, depthAt(p.z, q.t, fr)));
      // drop duplicated points (zero-length segments break tubes)
      const clean = v3.filter((v, i) => i === 0 || v.distanceTo(v3[i - 1]) > 0.01);
      if (clean.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(clean, false, 'centripetal');
      const r = Math.max(1.4, (p.w || 5) / 2);
      const segs = Math.min(400, Math.max(16, clean.length * 2));
      const geo = new THREE.TubeGeometry(curve, segs, r, 14, false);
      const base = duct ? COLORS.duct : vein ? COLORS.vesselVein : COLORS.vessel;
      const mat = new THREE.MeshPhysicalMaterial({ color: base, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.3, sheenColor: new THREE.Color(0xffb3c1) });
      const mesh = new THREE.Mesh(geo, mat);
      // rounded caps so segments join smoothly
      for (const end of [clean[0], clean[clean.length - 1]]) {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
        cap.position.copy(end);
        mesh.add(cap);
      }
      const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(8, Math.round(segs / 3)), Math.max(r + 3, 7), 6, false), new THREE.MeshBasicMaterial({ visible: false }));
      hit.userData.part = p.id;
      mesh.userData.part = p.id;
      root.add(mesh, hit);
      meshes.push({ part: p, mesh, hit, base, mid: curve.getPoint(0.5) });
      box.expandByObject(mesh);
    } else {
      const { pts } = samplePath(p.d, 4, 12, 220);
      if (pts.length < 4) continue;
      const shape = new THREE.Shape(pts.map((q) => new THREE.Vector2(q.x - cx, -(q.y - cy))));
      let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
      for (const q of pts) { minX = Math.min(minX, q.x); maxX = Math.max(maxX, q.x); minY = Math.min(minY, q.y); maxY = Math.max(maxY, q.y); }
      const size = Math.min(maxX - minX, maxY - minY);
      const depth = p.depth || Math.max(6, Math.min(70, size * 0.45));
      const bevel = Math.max(1.5, Math.min(depth * 0.45, size * 0.22, 14));
      const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(1, depth - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelOffset: -bevel * 0.9, bevelSegments: 5, curveSegments: 24 });
      geo.translate(0, 0, (typeof p.z === 'number' ? p.z : 0) - (depth - 2 * bevel) / 2);
      geo.computeVertexNormals();
      const bone = isBone(p);
      const base = bone ? COLORS.bone : COLORS.organ;
      const mat = new THREE.MeshPhysicalMaterial({ color: base, roughness: bone ? 0.7 : 0.45, metalness: 0, clearcoat: bone ? 0 : 0.45, transparent: true, opacity: bone ? 0.95 : 0.82, transmission: 0 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.part = p.id;
      mesh.renderOrder = 1;
      root.add(mesh);
      const mid = toV((minX + maxX) / 2, (minY + maxY) / 2, (typeof p.z === 'number' ? p.z : 0) + depth / 2);
      meshes.push({ part: p, mesh, hit: mesh, base, mid, organ: true });
      box.expandByObject(mesh);
    }
  }
  const centre = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  root.position.sub(centre);
  const radius = box.isEmpty() ? Math.max(W, H) / 2 : box.getSize(new THREE.Vector3()).length() / 2;

  // badges (selected parts)
  const badgeEls = new Map();
  let state = { marks: opts.marks || {}, active: opts.active || null, lang: opts.lang || 'pl', hover: null };
  function paint() {
    for (const m of meshes) {
      const on = Object.prototype.hasOwnProperty.call(state.marks, m.part.id);
      const col = state.active === m.part.id ? COLORS.active : on ? COLORS.on : state.hover === m.part.id ? COLORS.hover : m.base;
      m.mesh.material.color.setHex(col);
      m.mesh.material.emissive?.setHex(on || state.active === m.part.id ? 0x3a2200 : state.hover === m.part.id ? 0x2a0710 : 0x000000);
      if (m.organ) m.mesh.material.opacity = on || state.hover === m.part.id ? 0.95 : (isBone(m.part) ? 0.95 : 0.82);
      let b = badgeEls.get(m.part.id);
      if (on && state.marks[m.part.id]) {
        if (!b) { b = document.createElement('span'); b.className = 'dgm3d-badge'; overlay.append(b); badgeEls.set(m.part.id, b); }
        b.textContent = state.marks[m.part.id];
      } else if (b) { b.remove(); badgeEls.delete(m.part.id); }
    }
    draw();
  }

  // camera orbit
  const size = box.isEmpty() ? new THREE.Vector3(W, H, 50) : box.getSize(new THREE.Vector3());
  const fitDist = (aspect) => 1.1 * Math.max(size.y / 2, size.x / 2 / Math.max(0.2, aspect)) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) + size.z / 2;
  const view = { yaw: 0, pitch: 0, dist: radius * 3.4, ...(diagram.view3d || {}) };
  const home = { ...view };
  let zoomed = false;
  function placeCamera() {
    root.rotation.set(view.pitch, view.yaw, 0, 'XYZ');
    camera.position.set(0, 0, view.dist);
    camera.lookAt(0, 0, 0);
  }
  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = Math.max(10, r.width); const h = Math.max(10, r.height);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    camera.aspect = w / h;
    // fit the whole model in the window (until the user zooms)
    home.dist = fitDist(camera.aspect);
    if (!zoomed) view.dist = home.dist;
    camera.updateProjectionMatrix();
    draw();
  }
  const tmp = new THREE.Vector3();
  function project(v, el) {
    tmp.copy(v).applyMatrix4(root.matrixWorld).project(camera);
    const r = renderer.domElement;
    const x = (tmp.x * 0.5 + 0.5) * r.clientWidth;
    const y = (-tmp.y * 0.5 + 0.5) * r.clientHeight;
    el.style.transform = `translate(${x}px, ${y}px)`;
    el.style.display = tmp.z < 1 ? '' : 'none';
  }
  let raf = 0;
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      placeCamera();
      root.updateMatrixWorld(true);
      renderer.render(scene, camera);
      for (const l of labels) project(l.pos, l.el);
      for (const [id, el] of badgeEls) { const m = meshes.find((x) => x.part.id === id); if (m) project(m.mid, el); }
    });
  }

  // interaction
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pickAt(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    placeCamera();
    root.updateMatrixWorld(true);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(meshes.flatMap((m) => [m.hit]), false);
    if (!hits.length) return null;
    // prefer vessels over organs when both are hit (vessels are thin and usually what was meant)
    const vessel = hits.find((h) => !meshes.find((m) => m.hit === h.object)?.organ);
    return (vessel || hits[0]).object.userData.part;
  }
  let drag = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch, moved: false }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      view.yaw = drag.yaw + dx * 0.008;
      view.pitch = Math.max(-1.45, Math.min(1.45, drag.pitch + dy * 0.008));
      tip.hidden = true;
      draw();
      return;
    }
    const id = pickAt(e);
    if (id !== state.hover) { state.hover = id; paint(); }
    if (id) {
      const part = meshes.find((m) => m.part.id === id)?.part;
      tip.textContent = partLabel(part, state.lang);
      const r = wrap.getBoundingClientRect();
      tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 12}px)`;
      tip.hidden = false;
      el.style.cursor = 'pointer';
    } else { tip.hidden = true; el.style.cursor = 'grab'; }
  });
  el.addEventListener('pointerup', (e) => {
    const d = drag;
    drag = null;
    if (d && !d.moved) { const id = pickAt(e); if (id && opts.onPick) opts.onPick(id); }
  });
  el.addEventListener('pointerleave', () => { tip.hidden = true; if (state.hover) { state.hover = null; paint(); } });
  el.addEventListener('wheel', (e) => { e.preventDefault(); zoomed = true; view.dist = Math.max(radius * 0.5, Math.min(radius * 10, view.dist * (1 + Math.sign(e.deltaY) * 0.1))); draw(); }, { passive: false });
  el.addEventListener('dblclick', () => { zoomed = false; Object.assign(view, home); draw(); });
  tools.addEventListener('click', (e) => {
    const b = e.target.closest('[data-view]');
    if (!b) return;
    const v = b.dataset.view;
    if (v === 'reset' || v === 'front') { zoomed = false; Object.assign(view, home, v === 'front' ? { yaw: 0, pitch: 0 } : {}); }
    if (v === 'side') { view.yaw = Math.PI / 2; view.pitch = 0; }
    if (v === 'top') { view.yaw = 0; view.pitch = Math.PI / 2 - 0.05; }
    draw();
  });
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  paint();

  return {
    update(next = {}) { state = { ...state, ...next }; paint(); },
    reset() { Object.assign(view, home); draw(); },
    dispose() {
      ro.disconnect();
      cancelAnimationFrame(raf);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => m.dispose?.()); });
      renderer.dispose();
      host.textContent = '';
      host.classList.remove('dgm3d-host');
    },
    snapshot() { placeCamera(); renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    /** Screen position (page coordinates) of a part's middle — used by tests. */
    screenPoint(id) {
      const m = meshes.find((x) => x.part.id === id);
      if (!m) return null;
      placeCamera(); root.updateMatrixWorld(true);
      const v = m.mid.clone().applyMatrix4(root.matrixWorld).project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
    },
  };
}

/** 3D when possible, otherwise the flat SVG diagram. Returns a controller with update()/dispose(). */
export function showDiagram(host, diagram, opts) {
  const v = create3D(host, diagram, opts);
  if (v) return v;
  render2D(host, diagram, opts);
  return { update(next) { render2D(host, diagram, { ...opts, ...next }); }, reset() {}, dispose() { host.textContent = ''; }, snapshot: () => null };
}

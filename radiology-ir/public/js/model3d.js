// Renderer for true-3D vessel models (models/*.js, millimetres). Shows the lesions ON the vessels:
// stenosis = local narrowing, occlusion / thrombus = clot, aneurysm = sac to scale with its neck and projection,
// AVM / dAVF = nidus with feeders and draining vein, and the devices: laser-cut stents, braided flow diverters,
// stent grafts, coil packs, WEB, plugs, liquid embolic casts, embolic protection filters.
// Drag = rotate, wheel = zoom, double-click = reset, click = select (with the position along the vessel).
// `frame(lesion)` + `snapshot()` / `figureLabels()` produce the schematic figures for the letter.
import * as THREE from '../vendor/three.mjs';
import { partLabel } from './diagram.js';

const COL = { artery: 0xa8203a, vein: 0x3f5fc4, on: 0xffc94d, active: 0xfff0b8, hover: 0xff7d96, clot: 0x3a0610, sac: 0xc23a55, bone: 0xc9c2b2 };

/** Mirror `pair` segments to the left and return diagram-style parts ({ id, label, side, kind, r, pts, anat }). */
export function expandModel(model) {
  if (!model || model.kind !== 'model3d' || model.parts) return model;
  const parts = [];
  for (const s of model.segments) {
    const base = { kind: 'vessel', anat: s.anat, r: s.r, vein: s.vein, label: s.label, straight: s.straight };
    if (s.pair) {
      const id = s.id.replace(/_r$/, '');
      parts.push({ ...base, id: `${id}_r`, side: 'right', pts: s.pts });
      parts.push({ ...base, id: `${id}_l`, side: 'left', pts: s.pts.map(([x, y, z]) => [-x, y, z]) });
    } else parts.push({ ...base, id: s.id, side: s.side || '', pts: s.pts });
  }
  return { ...model, parts };
}

const firstNum = (v) => { const m = String(v ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? Number(m[0]) : null; };
const nums = (v) => (String(v ?? '').replace(/,/g, '.').match(/\d+(?:\.\d+)?/g) || []).map(Number);
const DIRS = { sup: [0, 1, 0], inf: [0, -1, 0], ant: [0, 0, 1], post: [0, 0, -1], med: 'med', lat: 'lat' };
const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) || 1; };
const rng = (seed) => { let x = hash(seed) % 2147483646 + 1; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; };

/** What a device looks like on the model. */
export function deviceKind(d) {
  const c = `${d.cat || ''} ${d.name || ''}`.toLowerCase();
  if (/mo\.ma|flowgate|balloon/.test(c)) return null;
  if (/embolic_protection|filter|spider|emboshield|filterwire|angioguard|paladin|robin/.test(c)) return 'filter';
  if (/flow_diverter|flow divert|pipeline|surpass|fred|silk|p64|p48|derivo|evolve/.test(c)) return 'fd';
  if (/intrasaccular|\bweb\b|contour|neqstent|artisse/.test(c)) return 'web';
  if (/neuro_stent_coil|neuro_angioplasty_stent|stent_carotid|lvis|neuroform|enterprise|\batlas\b|credo|wingspan|accero|pegasus/.test(c)) return 'stent';
  if (/liquid_embolic|onyx|squid|phil|glubran|histoacryl|n-bca|nbca|lipiodol|klej|glue|ethanol|etanol/.test(c)) return 'liquid';
  if (/coil|spiral|spiral/.test(c)) return 'coil';
  if (/plug|zatyczk|occluder/.test(c)) return 'plug';
  if (/aortic|evar|tevar|graft|covered|pokryt|viabahn|bentley|begraft|lifestream/.test(c)) return 'graft';
  if (/stent(?!_retriever)|stent_/.test(c) && !/retriever|retriev/.test(c)) return 'stent';
  return null;
}

/** Merge many BufferGeometries (position, normal, index) into one. */
function mergeGeos(geos) {
  let nv = 0; let ni = 0;
  for (const g of geos) { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
  const pos = new Float32Array(nv * 3); const nor = new Float32Array(nv * 3); const idx = new Uint32Array(ni);
  let ov = 0; let oi = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, ov * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, ov * 3);
    if (g.index) { const a = g.index.array; for (let i = 0; i < a.length; i++) idx[oi + i] = a[i] + ov; oi += a.length; }
    else { for (let i = 0; i < g.attributes.position.count; i++) idx[oi + i] = ov + i; oi += g.attributes.position.count; }
    ov += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  return out;
}

/** Tube along a curve with a radius that varies along it (taper, narrowing). */
function tubeGeo(curve, radiusAt, tubular, radial = 16, closed = false) {
  const frames = curve.computeFrenetFrames(tubular, closed);
  const n = (radial + 1) * (tubular + 1);
  const pos = new Float32Array(n * 3); const nor = new Float32Array(n * 3);
  const P = new THREE.Vector3(); const N = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, P);
    const r = radiusAt(u);
    const a = frames.normals[i]; const b = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const v = (j / radial) * Math.PI * 2; const s = Math.sin(v); const c = -Math.cos(v);
      N.set(c * a.x + s * b.x, c * a.y + s * b.y, c * a.z + s * b.z).normalize();
      pos[k] = P.x + r * N.x; pos[k + 1] = P.y + r * N.y; pos[k + 2] = P.z + r * N.z;
      nor[k] = N.x; nor[k + 1] = N.y; nor[k + 2] = N.z;
      k += 3;
    }
  }
  const idx = [];
  for (let i = 1; i <= tubular; i++) for (let j = 1; j <= radial; j++) {
    const a = (radial + 1) * (i - 1) + (j - 1); const b = (radial + 1) * i + (j - 1); const c = (radial + 1) * i + j; const d = (radial + 1) * (i - 1) + j;
    idx.push(a, b, d, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
/** Thin wire along a list of points (stent struts, braid, coil). */
function wireGeo(points, r, radial = 4) {
  if (points.length < 2) return null;
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  return tubeGeo(curve, () => r, Math.min(1200, Math.max(2, points.length * 2)), radial);
}

/** Soft studio light for glossy vessel walls (no external files). */
function studioEnvironment(renderer) {
  try {
    const env = new THREE.Scene();
    const geo = new THREE.SphereGeometry(50, 32, 16);
    const col = []; const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = (p.getY(i) / 50 + 1) / 2;
      const c = new THREE.Color(0x1a0c12).lerp(new THREE.Color(0xd8dcef), Math.pow(t, 1.6));
      col.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    const panel = (x, y, z, w, h, c, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
    };
    panel(-20, 30, 30, 30, 18, 0xffffff, 3.2);
    panel(30, 10, 20, 14, 30, 0xffd6de, 1.6);
    panel(0, -10, -40, 40, 12, 0xff6b84, 1.1);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(env, 0.03).texture;
    pm.dispose();
    env.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
    return tex;
  } catch { return null; }
}

export function createModel3D(host, model, opts = {}) {
  const figure = Boolean(opts.figure);
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
  const lg = () => (state.lang === 'en' ? 1 : 0);
  wrap.append(overlay, tip, tools);
  if (figure) { overlay.hidden = true; tools.hidden = true; }
  host.append(wrap);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { host.textContent = ''; return null; }
  renderer.setPixelRatio(figure ? 2 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = figure ? 1.0 : 1.05;
  renderer.localClippingEnabled = true;
  wrap.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 8000);
  scene.add(new THREE.HemisphereLight(0xe6edff, 0x2a0d16, scene.environment ? 0.45 : 0.9));
  const key = new THREE.DirectionalLight(0xffffff, scene.environment ? 1.25 : 1.7); key.position.set(-300, 500, 700); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6b84, 0.8); rim.position.set(500, -200, -600); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb6ff, 0.35); fill.position.set(400, 100, 300); scene.add(fill);
  // lights follow the camera so the lit side always faces the viewer
  camera.add(key, fill); key.position.set(-0.6, 0.8, 1); fill.position.set(0.8, 0.2, 0.6); scene.add(camera);
  const pivot = new THREE.Group();
  const world = new THREE.Group();
  pivot.add(world);
  scene.add(pivot);
  const clipPlanes = [];

  // context: skull / bones, translucent
  for (const c of model.context || []) {
    if (figure) continue;
    let geo;
    if (c.shape === 'ellipsoid') { geo = new THREE.SphereGeometry(1, 48, 32); geo.scale(...c.r); }
    else if (c.shape === 'box') geo = new THREE.BoxGeometry(...c.size);
    else if (c.shape === 'cylinder') geo = new THREE.CylinderGeometry(c.r, c.r, c.h, 24);
    if (!geo) continue;
    const mat = c.bone
      ? new THREE.MeshStandardMaterial({ color: COL.bone, roughness: 0.8, transparent: true, opacity: figure ? 0.14 : 0.1, depthWrite: false, clippingPlanes: clipPlanes })
      : new THREE.MeshBasicMaterial({ color: 0x8aa0d0, wireframe: true, transparent: true, opacity: 0.028, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...c.c);
    if (c.rot) m.rotation.set(...c.rot);
    world.add(m);
  }

  // ------------------------------------------------------------------ vessels
  const parts = opts.parts || model.parts;
  const organic = model.organic !== false;
  const near = (a, b, tol = 0.8) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) <= tol;
  const segs = new Map(); // id → { part, curve, mesh, hit, base, len, tubular, r0, r1 }
  const vesselMat = (base) => new THREE.MeshPhysicalMaterial({
    color: base, roughness: 0.34, metalness: 0, clearcoat: 0.75, clearcoatRoughness: 0.2, sheen: 0.45, sheenRoughness: 0.5,
    sheenColor: new THREE.Color(base === COL.vein ? 0x9fb4ff : 0xff9fb2), envMapIntensity: 0.85, clippingPlanes: clipPlanes,
  });
  /** Natural tortuosity of small vessels: a gentle wave that leaves both ends in place. */
  function organicCurve(p, curve, len) {
    if (!organic || p.straight || p.r > 1.35 || len < 10) return curve;
    const rnd = rng(p.id);
    const m = Math.max(8, Math.round(len / 1.5));
    const frames = curve.computeFrenetFrames(m, false);
    const amp = Math.min(0.85, 0.42 * p.r + 0.22);
    const l1 = 9 + rnd() * 8; const l2 = 14 + rnd() * 10; const f1 = rnd() * 6.28; const f2 = rnd() * 6.28;
    const pts = [];
    for (let i = 0; i <= m; i++) {
      const u = i / m; const w = Math.sin(Math.PI * u);
      const q = curve.getPointAt(u);
      const a = amp * w * Math.sin((u * len * 6.283) / l1 + f1); const b = 0.6 * amp * w * Math.sin((u * len * 6.283) / l2 + f2);
      q.addScaledVector(frames.normals[i], a).addScaledVector(frames.binormals[i], b);
      pts.push(q);
    }
    return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  }
  const continuesFrom = new Map(); // id → parent radius (continuation of a trunk)
  const parentOf = new Map(); // id → id of the trunk it continues
  const childrenAtEnd = new Map(); // id → ids that continue it
  const hasChildAtEnd = new Set();
  for (const p of parts) {
    for (const q of parts) {
      if (q === p) continue;
      if (near(q.pts[q.pts.length - 1], p.pts[0])) {
        if (!parentOf.has(p.id) || parts.find((x) => x.id === parentOf.get(p.id)).r < q.r) { continuesFrom.set(p.id, q.r); parentOf.set(p.id, q.id); }
        hasChildAtEnd.add(q.id);
        childrenAtEnd.set(q.id, [...(childrenAtEnd.get(q.id) || []), p.id]);
      }
    }
  }
  const byId = new Map(parts.map((p) => [p.id, p]));
  const dirOf = (a, b) => new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  for (const p of parts) {
    const v = p.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    if (v.length < 2) continue;
    // smooth joints between a trunk and its continuation: start along the parent's direction, end along the main child's
    if (organic && !p.straight) {
      const q = byId.get(parentOf.get(p.id));
      const firstLen = v[0].distanceTo(v[1]);
      if (q && q.pts.length >= 2 && firstLen > 2.5) {
        const t = dirOf(q.pts[q.pts.length - 2], q.pts[q.pts.length - 1]);
        v.splice(1, 0, v[0].clone().addScaledVector(t, Math.min(3, firstLen * 0.3)));
      }
      const kids = (childrenAtEnd.get(p.id) || []).map((id) => byId.get(id)).filter(Boolean).sort((a, b) => b.r - a.r);
      const lastLen = v[v.length - 1].distanceTo(v[v.length - 2]);
      if (kids[0] && kids[0].pts.length >= 2 && lastLen > 2.5 && parentOf.get(kids[0].id) === p.id) {
        const t = dirOf(kids[0].pts[0], kids[0].pts[1]);
        v.splice(v.length - 1, 0, v[v.length - 1].clone().addScaledVector(t, -Math.min(3, lastLen * 0.3)));
      }
    }
    const raw = new THREE.CatmullRomCurve3(v, false, 'centripetal');
    const len = raw.getLength();
    const curve = organicCurve(p, raw, len);
    const tubular = Math.max(24, Math.min(360, Math.round(len * 1.6)));
    const base = p.vein ? COL.vein : COL.artery;
    const r0 = continuesFrom.has(p.id) ? continuesFrom.get(p.id) : p.r * 1.12;
    const r1 = hasChildAtEnd.has(p.id) ? p.r : p.r * (organic ? 0.82 : 1);
    const mat = vesselMat(base);
    const s = { part: p, curve, base, len, tubular, r0, r1, radial: p.r < 1 ? 12 : 18 };
    s.radiusAt = (u) => s.r0 + (s.r1 - s.r0) * Math.min(1, u * 1.4);
    const mesh = new THREE.Mesh(tubeGeo(curve, s.radiusAt, tubular, s.radial), mat);
    const capA = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat); capA.position.copy(curve.getPointAt(0)); capA.scale.setScalar(r0);
    const capB = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), mat); capB.position.copy(curve.getPointAt(1)); capB.scale.setScalar(r1);
    mesh.add(capA, capB);
    const hit = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, Math.round(tubular / 3)), Math.max(p.r + 1.6, 2.6), 8, false), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.part = p.id;
    world.add(mesh, hit);
    mesh.userData.vessel = p.id;
    Object.assign(s, { mesh, hit });
    segs.set(p.id, s);
  }
  const box = new THREE.Box3();
  for (const s of segs.values()) box.expandByObject(s.mesh);

  // ------------------------------------------------------------------ cosmetic fine branches (not clickable)
  const decorMat = vesselMat(COL.artery);
  let decorMesh = null;
  function buildDecor() {
    const d = model.decor;
    if (!d || opts.decor === false) return;
    const geos = [];
    const surf = d.surface ? { c: new THREE.Vector3(...d.surface.c), r: new THREE.Vector3(...d.surface.r) } : null;
    const keepOn = (p, dir) => {
      if (!surf) return;
      const q = p.clone().sub(surf.c).divide(surf.r);
      const e = q.length();
      if (e > 1) {
        p.copy(q.multiplyScalar(1 / e).multiply(surf.r).add(surf.c));
        const nrm = p.clone().sub(surf.c).divide(surf.r).divide(surf.r).normalize();
        dir.addScaledVector(nrm, -dir.dot(nrm)).normalize();
      }
    };
    let budget = d.max || 900;
    const grow = (start, dir, r, len, depth, rnd) => {
      if (budget-- <= 0 || r < 0.12) return;
      const pts = [start.clone()]; const p = start.clone(); const dd = dir.clone().normalize();
      const steps = Math.max(3, Math.round(len / 1.6));
      const turn = new THREE.Vector3();
      for (let k = 0; k < steps; k++) {
        turn.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.55);
        dd.add(turn).normalize();
        p.addScaledVector(dd, len / steps);
        keepOn(p, dd);
        pts.push(p.clone());
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const r1 = r * 0.72;
      geos.push(tubeGeo(curve, (u) => r + (r1 - r) * u, steps * 3, r > 0.4 ? 8 : 6));
      if (depth <= 0) return;
      const kids = rnd() < 0.35 ? 3 : 2;
      for (let c = 0; c < kids; c++) {
        const axis = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(dd).normalize();
        const nd = dd.clone().applyAxisAngle(axis, (0.35 + rnd() * 0.45) * (c % 2 ? 1 : -1));
        const from = c === 2 ? curve.getPointAt(0.5) : p;
        grow(from, nd, r1 * (0.82 + rnd() * 0.1), len * (0.7 + rnd() * 0.2), depth - 1, rnd);
      }
    };
    for (const s of segs.values()) {
      const rule = (d.rules || []).find((x) => new RegExp(x.match).test(s.part.id));
      if (!rule) continue;
      const rnd = rng(`decor-${s.part.id}`);
      // continue terminal vessels
      if (rule.end && !hasChildAtEnd.has(s.part.id)) {
        const n = rule.end;
        for (let i = 0; i < n; i++) {
          const t = s.curve.getTangentAt(1);
          const axis = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(t).normalize();
          grow(s.curve.getPointAt(1), t.applyAxisAngle(axis, (rnd() - 0.5) * 0.9), s.r1 * 0.95, rule.len || 16, rule.depth ?? 3, rnd);
        }
      }
      // side twigs along the vessel
      for (let i = 0; i < (rule.side || 0); i++) {
        const u = 0.2 + 0.7 * rnd();
        const t = s.curve.getTangentAt(u);
        const out = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).cross(t).normalize();
        const dir = t.clone().multiplyScalar(0.6).add(out).normalize();
        grow(s.curve.getPointAt(u), dir, Math.max(0.16, s.part.r * (rule.sideR || 0.45)), (rule.len || 16) * 0.8, Math.max(0, (rule.depth ?? 3) - 1), rnd);
      }
    }
    if (!geos.length) return;
    const mesh = new THREE.Mesh(mergeGeos(geos), decorMat);
    mesh.userData.decor = true;
    world.add(mesh);
    decorMesh = mesh;
  }
  buildDecor();

  // labels
  const labels = [];
  for (const l of model.labels || []) {
    const el = document.createElement('span');
    el.className = `dgm3d-label${l.side ? ' side' : ''}`;
    overlay.append(el);
    labels.push({ el, pos: new THREE.Vector3(...l.at), text: l.text });
  }

  // ------------------------------------------------------------------ lesions and devices (rebuilt on every update)
  const lesionGroup = new THREE.Group();
  world.add(lesionGroup);
  const badgeEls = [];
  let state = { marks: opts.marks || {}, active: opts.active || null, lang: opts.lang || 'pl', hover: null, lesions: opts.lesions || [] };
  const focusPoints = []; // per lesion: { part, t, at: Vector3, extent, dir }

  function subCurve(s, u0, u1, n = 40) {
    const c = s.curve || s;
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(c.getPointAt(Math.min(1, Math.max(0, u0 + ((u1 - u0) * i) / n))));
    return new THREE.CatmullRomCurve3(pts);
  }
  /** A device longer than its vessel segment continues into the trunk before and after it (C6 → C5/C7…). */
  function chainSpan(s, u, before, after) {
    const back = []; const fwd = [];
    let cur = s; let acc = u * s.len;
    while (acc < before + 2 && parentOf.has(cur.part.id) && back.length < 8) { cur = segs.get(parentOf.get(cur.part.id)); if (!cur) break; back.unshift(cur); acc += cur.len; }
    cur = s; acc = (1 - u) * s.len;
    while (acc < after + 2 && (childrenAtEnd.get(cur.part.id) || []).length && fwd.length < 8) {
      const kids = childrenAtEnd.get(cur.part.id).map((id) => segs.get(id)).filter(Boolean).sort((a, b) => b.part.r - a.part.r);
      if (!kids.length) break;
      cur = kids[0]; fwd.push(cur); acc += cur.len;
    }
    const list = [...back, s, ...fwd];
    const pts = []; const rads = [];
    for (const g of list) { const n = Math.max(4, Math.round(g.len)); for (let i = pts.length ? 1 : 0; i <= n; i++) { pts.push(g.curve.getPointAt(i / n)); rads.push(g.radiusAt(i / n)); } }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const T = curve.getLength();
    const at = back.reduce((a, g) => a + g.len, 0) + u * s.len;
    const radiusAt = (q) => { const x = Math.min(rads.length - 1, Math.max(0, q * (rads.length - 1))); const i = Math.floor(x); return rads[i] + (rads[Math.min(rads.length - 1, i + 1)] - rads[i]) * (x - i); };
    return { curve, T, at, radiusAt, u0: Math.max(0, (at - before) / T), u1: Math.min(1, (at + after) / T) };
  }
  function sideVector(s, u, dir) {
    const p = s.curve.getPointAt(u);
    const t = s.curve.getTangentAt(u).normalize();
    let d;
    if (dir === 'med') d = new THREE.Vector3(-Math.sign(p.x || 1), 0, 0);
    else if (dir === 'lat') d = new THREE.Vector3(Math.sign(p.x || 1), 0, 0);
    else d = new THREE.Vector3(...(DIRS[dir] && Array.isArray(DIRS[dir]) ? DIRS[dir] : [0, 1, 0]));
    d.sub(t.clone().multiplyScalar(d.dot(t)));
    if (d.lengthSq() < 1e-4) d = new THREE.Vector3(0, 0, 1).sub(t.clone().multiplyScalar(t.z));
    return d.normalize();
  }
  const metal = (c, rough = 0.28) => new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: rough, envMapIntensity: 1.2, clippingPlanes: clipPlanes });
  const mats = {
    clot: new THREE.MeshStandardMaterial({ color: COL.clot, roughness: 0.85, clippingPlanes: clipPlanes }),
    plaque: new THREE.MeshStandardMaterial({ color: 0xe8d39a, roughness: 0.7, clippingPlanes: clipPlanes }),
    sac: new THREE.MeshPhysicalMaterial({ color: COL.sac, roughness: 0.34, clearcoat: 0.7, transparent: true, opacity: 0.86, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: clipPlanes }),
    sacCoiled: new THREE.MeshPhysicalMaterial({ color: COL.sac, roughness: 0.3, clearcoat: 0.7, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false, clippingPlanes: clipPlanes }),
    wire: metal(0xd9dde6, 0.25),
    nitinol: metal(0xc9ced8, 0.3),
    platinum: metal(0xe3dccb, 0.22),
    graft: new THREE.MeshPhysicalMaterial({ color: 0xf0ebe0, roughness: 0.8, transparent: true, opacity: 0.62, side: THREE.DoubleSide, clippingPlanes: clipPlanes }),
    cast: new THREE.MeshStandardMaterial({ color: 0x45474e, metalness: 0.55, roughness: 0.42, envMapIntensity: 1, clippingPlanes: clipPlanes }),
    vein: vesselMat(COL.vein),
    nidus: vesselMat(0xb02848),
  };
  const add = (geo, mat) => { if (geo) lesionGroup.add(new THREE.Mesh(geo, mat)); };

  /** Coil pack: a platinum wire wound as a secondary helix, packed in loops inside a sphere. */
  function coilMass(center, R, nCoils = 1, seed = 'coil') {
    const rnd = rng(seed);
    const path = [];
    // framing coil: loops that follow the sac wall
    const frameLoops = 5 + Math.min(4, nCoils);
    for (let k = 0; k < frameLoops; k++) {
      const ax = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), ax);
      const ph = rnd() * Math.PI * 2;
      for (let i = 0; i < 14; i++) { const a = ph + (i / 14) * Math.PI * 2; path.push(new THREE.Vector3(Math.cos(a), Math.sin(a), (rnd() - 0.5) * 0.25).normalize().multiplyScalar(R * 0.84).applyQuaternion(q).add(center)); }
    }
    // filling / finishing coils: random walk inside
    const steps = Math.min(240, 40 + 26 * nCoils);
    const p = path[path.length - 1].clone().sub(center);
    const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const step = R * 0.3;
    for (let i = 0; i < steps; i++) {
      d.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.1)).normalize();
      const nx = p.clone().addScaledVector(d, step);
      if (nx.length() > R * 0.8) { d.addScaledVector(nx.clone().normalize(), -1.4).normalize(); nx.copy(p).addScaledVector(d, step); }
      if (nx.length() > R * 0.84) nx.setLength(R * 0.82);
      p.copy(nx); path.push(p.clone().add(center));
    }
    const curve = new THREE.CatmullRomCurve3(path, false, 'centripetal');
    const L = curve.getLength();
    const hr = Math.max(0.14, R * 0.085); const pitch = hr * 1.35;
    const n = Math.min(9000, Math.round(L / (pitch / 6)));
    const frames = curve.computeFrenetFrames(n, false);
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n; const a = (u * L * 2 * Math.PI) / pitch;
      pts.push(curve.getPointAt(u).addScaledVector(frames.normals[i], hr * Math.cos(a)).addScaledVector(frames.binormals[i], hr * Math.sin(a)));
    }
    const g = tubeGeo(new THREE.CatmullRomCurve3(pts), () => Math.max(0.04, hr * 0.36), pts.length, 4);
    return new THREE.Mesh(g, mats.platinum);
  }
  /** Laser-cut stent: zig-zag rings joined by bridges, on the vessel's own centre line. */
  function laserStent(s, u0, u1, R, mat = mats.nitinol) {
    const Rf = typeof R === 'function' ? (q) => R(u0 + (u1 - u0) * q) : () => R;
    const R0 = Rf(0.5);
    const sc = subCurve(s, u0, u1, 80);
    if (sc.getLength() < 0.5) return null;
    const L = sc.getLength();
    const ringGap = Math.max(1.1, R0 * 1.05);
    const rings = Math.max(3, Math.round(L / ringGap));
    const crowns = R0 < 2 ? 6 : R0 < 4 ? 8 : 10;
    const frames = sc.computeFrenetFrames(rings * 8, false);
    const at = (u, ang) => { const uu = Math.min(1, Math.max(0, u)); const i = Math.round(uu * rings * 8); const rad = Rf(uu); const c = sc.getPointAt(uu); return c.addScaledVector(frames.normals[i], rad * Math.cos(ang)).addScaledVector(frames.binormals[i], rad * Math.sin(ang)); };
    const wr = Math.max(0.045, R0 * 0.045);
    const geos = [];
    const h = 0.38 / rings;
    for (let k = 0; k <= rings; k++) {
      const uc = k / rings; const pts = [];
      for (let c = 0; c <= crowns * 2; c++) pts.push(at(uc + (c % 2 ? h : -h), (c * Math.PI) / crowns + (k % 2) * (Math.PI / crowns)));
      geos.push(wireGeo(pts, wr));
      if (k < rings) for (let c = 0; c < crowns; c += 2) {
        const a = (2 * c * Math.PI) / crowns + (k % 2) * (Math.PI / crowns);
        geos.push(wireGeo([at(uc + h, a), at(uc + 0.5 / rings, a), at((k + 1) / rings - h, a)], wr * 0.85));
      }
    }
    return new THREE.Mesh(mergeGeos(geos.filter(Boolean)), mat);
  }
  /** Braided device (flow diverter): two families of helical wires. */
  function braid(s, u0, u1, Rin, wires = 16, mat = mats.wire) {
    const Rf = typeof Rin === 'function' ? (q) => Rin(u0 + (u1 - u0) * q) : () => Rin;
    const R = Rf(0.5);
    const sc = subCurve(s, u0, u1, 80);
    if (sc.getLength() < 0.5) return null;
    const L = sc.getLength();
    const n = Math.max(40, Math.round(L * 5));
    const frames = sc.computeFrenetFrames(n, false);
    const turns = L / Math.max(1.6, R * 3.2);
    const geos = [];
    for (const sense of [1, -1]) for (let w = 0; w < wires; w++) {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const u = i / n; const a = (w / wires) * Math.PI * 2 + sense * u * turns * Math.PI * 2;
        const rr = Rf(u);
        pts.push(sc.getPointAt(u).addScaledVector(frames.normals[i], rr * Math.cos(a)).addScaledVector(frames.binormals[i], rr * Math.sin(a)));
      }
      geos.push(tubeGeo(new THREE.CatmullRomCurve3(pts), () => Math.max(0.028, R * 0.022), n, 3));
    }
    return new THREE.Mesh(mergeGeos(geos), mat);
  }
  /** Aneurysm sac with a neck that grows out of the vessel wall (lathe profile). */
  function sacGeo(rv, sacR, neck, ratio) {
    const pts = [];
    const h0 = rv * 0.55 + sacR * 0.92;
    pts.push(new THREE.Vector2(neck * 1.05, -rv * 0.4));
    pts.push(new THREE.Vector2(neck, rv * 0.45));
    const a0 = -Math.acos(Math.min(0.99, neck / sacR));
    for (let i = 0; i <= 28; i++) {
      const a = a0 + ((Math.PI / 2 - a0) * i) / 28;
      pts.push(new THREE.Vector2(Math.max(0.001, sacR * Math.cos(a)), h0 + sacR * ratio * Math.sin(a)));
    }
    return { geo: new THREE.LatheGeometry(pts, 40), h0 };
  }
  /** Tortuous vessel tangle (AVM nidus / fistula) inside a sphere. */
  function tangle(center, R, n, seed) {
    const rnd = rng(seed); const list = [];
    for (let i = 0; i < n; i++) {
      const pts = []; const p = new THREE.Vector3((rnd() - 0.5), (rnd() - 0.5), (rnd() - 0.5)).multiplyScalar(R * 1.2);
      const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
      for (let k = 0; k < 18; k++) {
        d.add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.1)).normalize();
        p.addScaledVector(d, R * 0.2);
        if (p.length() > R) { p.setLength(R * 0.92); d.negate(); }
        pts.push(p.clone().add(center));
      }
      list.push({ pts, r: Math.max(0.16, R * (0.022 + rnd() * 0.025)) });
    }
    return list;
  }

  function buildLesions() {
    lesionGroup.traverse((o) => { if (o !== lesionGroup) o.geometry?.dispose?.(); });
    lesionGroup.clear();
    for (const b of badgeEls) b.el.remove();
    badgeEls.length = 0;
    focusPoints.length = 0;
    lesionGroup.userData.coiled = {};
    // restore every vessel's tube, then narrow where needed
    for (const s of segs.values()) {
      if (s.narrowed) { s.mesh.geometry.dispose(); s.mesh.geometry = tubeGeo(s.curve, s.radiusAt, s.tubular, s.radial); s.narrowed = false; }
    }
    const narrowings = new Map();
    const see = new Set(); // vessels drawn see-through (stent graft inside a fusiform aneurysm)
    for (const s of segs.values()) if (s.seeThrough) { s.mesh.material.transparent = false; s.mesh.material.opacity = 1; s.mesh.material.depthWrite = true; s.mesh.material.needsUpdate = true; s.seeThrough = false; }
    for (const l of state.lesions) {
      const s = segs.get(l.part);
      if (!s) { focusPoints.push(null); continue; }
      const u = Math.min(0.98, Math.max(0.02, Number.isFinite(l.t) ? l.t : 0.5));
      const p = s.curve.getPointAt(u);
      const rv = s.radiusAt(u);
      const lengthMm = firstNum(l.length) || (l.finding === 'occlusion' ? 10 : 6);
      const devs = l.devices || [];
      const kinds = devs.map((d) => ({ d, kind: deviceKind(d) }));
      const stented = kinds.some((k) => ['stent', 'graft', 'fd'].includes(k.kind));
      const focus = { part: l.part, t: u, at: p.clone(), extent: rv * 6, dir: null, tangent: s.curve.getTangentAt(u) };
      if (l.finding === 'stenosis' && firstNum(l.pre)) {
        // after stenting the lumen is shown re-opened to the residual stenosis
        const pct = stented ? (firstNum(l.post) ?? 10) : firstNum(l.pre);
        const k = Math.min(0.92, pct / 100);
        if (!narrowings.has(l.part)) narrowings.set(l.part, []);
        narrowings.get(l.part).push({ u, k, sigma: Math.max(1.5, lengthMm / 2) / s.len });
        if (!stented) {
          const plaque = new THREE.Mesh(tubeGeo(subCurve(s, Math.max(0, u - lengthMm / s.len / 2), Math.min(1, u + lengthMm / s.len / 2), 20), (q) => rv * (1.02 - 0.12 * Math.sin(Math.PI * q)), 20, 14), mats.plaque);
          plaque.material = mats.plaque.clone(); plaque.material.transparent = true; plaque.material.opacity = 0.35;
          lesionGroup.add(plaque);
        }
        focus.extent = Math.max(rv * 8, lengthMm * 2.2);
      }
      if (l.finding === 'occlusion' || l.finding === 'thrombus') {
        const recanalised = (l.finding === 'thrombus' && ['2b50', '2b67', '2c', '3'].includes(String(l.post))) || (l.finding === 'occlusion' && stented);
        if (!recanalised) {
          const span = Math.min(0.45, lengthMm / s.len);
          add(tubeGeo(subCurve(s, Math.max(0, u - span / 2), Math.min(1, u + span / 2)), (q) => rv * (1.03 + 0.05 * Math.sin(q * 19)), 24, 12), mats.clot);
        }
        focus.extent = Math.max(rv * 10, lengthMm * 3);
      }
      let sacCenter = null; let sacR = 0;
      // fusiform aneurysm (aorta / iliac by default, or marked fusiform): the whole wall bulges
      const fusiform = l.finding === 'aneurysm' && (l.morph === 'fusiform' || (rv >= 4 && l.morph !== 'saccular'));
      if (fusiform) {
        const D = Math.max(...(nums(l.size).length ? nums(l.size) : [rv * 3]));
        const k = 1 - Math.max(1.1, D / 2 / rv);
        const lenMm = Math.max(D * 1.6, firstNum(l.length) || 0);
        if (!narrowings.has(l.part)) narrowings.set(l.part, []);
        narrowings.get(l.part).push({ u, k, sigma: lenMm / 2 / s.len });
        if (stented) see.add(l.part);
        focus.extent = Math.max(focus.extent, lenMm * 2.4);
      }
      if ((l.finding === 'aneurysm' && !fusiform) || l.finding === 'pseudoaneurysm') {
        const dims = nums(l.size);
        sacR = Math.max(1, (dims.length ? Math.max(...dims) : 6) / 2);
        const ratio = dims.length >= 2 ? Math.max(0.6, Math.min(1.6, dims[0] / dims[1])) : 1;
        const neck = Math.min(sacR * 0.95, Math.max(0.5, (firstNum(l.extra) || sacR * 1.1) / 2));
        const d = sideVector(s, u, l.dir || 'sup');
        const coiled = kinds.some((k) => k.kind === 'coil' || k.kind === 'liquid');
        const { geo, h0 } = sacGeo(rv, sacR, neck, ratio);
        const sac = new THREE.Mesh(geo, coiled ? mats.sacCoiled : mats.sac);
        sac.position.copy(p); sac.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        lesionGroup.add(sac);
        sacCenter = p.clone().addScaledVector(d, h0);
        if (l.daughter) { const b = new THREE.Mesh(new THREE.SphereGeometry(sacR * 0.32, 20, 14), sac.material); b.position.copy(sacCenter.clone().addScaledVector(d, sacR * ratio * 0.92).add(new THREE.Vector3(sacR * 0.3, 0, 0))); lesionGroup.add(b); }
        focus.at = sacCenter.clone(); focus.dir = d; focus.extent = Math.max(sacR * 2 * ratio + rv * 4, 16) * 1.7;
        focus.sac = { center: sacCenter, r: sacR };
      }
      let nidus = null;
      if (l.finding === 'avm' || l.finding === 'davf') {
        const R = l.finding === 'davf' ? 4 : [0, 6, 10, 15][firstNum(l.sm_size) || 1] || 7;
        const d = sideVector(s, u, l.dir || 'lat');
        const c = p.clone().addScaledVector(d, rv + R * 0.95);
        nidus = { c, R };
        const cast = kinds.some((k) => k.kind === 'liquid' || k.kind === 'coil');
        const occl = cast ? Math.min(1, (firstNum(l.post) ?? (l.finding === 'davf' && /complete/.test(String(l.post)) ? 100 : 80)) / 100) : 0;
        const list = tangle(c, R, l.finding === 'davf' ? 14 : Math.round(26 + R * 2.4), `nidus-${l.part}`);
        const castGeos = []; const openGeos = [];
        list.forEach((v, i) => { (i < list.length * occl ? castGeos : openGeos).push(wireGeo(v.pts, v.r, 7)); });
        // feeder from the vessel into the nidus, and the early draining vein
        const feeder = wireGeo([p, p.clone().lerp(c, 0.5).add(new THREE.Vector3(0.6, 0.6, 0)), c], Math.max(0.35, rv * 0.7), 10);
        (occl > 0 ? castGeos : openGeos).push(feeder);
        if (openGeos.length) add(mergeGeos(openGeos), mats.nidus);
        if (castGeos.length) add(mergeGeos(castGeos), mats.cast);
        const deep = Boolean(l.sm_deep);
        const vd = deep ? new THREE.Vector3(0, 12, -32).sub(c).normalize() : new THREE.Vector3(Math.sign(c.x || 1) * 0.2, 0.9, -0.4).normalize();
        const veinPts = [c.clone()]; const q = c.clone(); const rnd = rng(`vein-${l.part}`);
        for (let k = 0; k < 7; k++) { q.addScaledVector(vd, 6).add(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2)); veinPts.push(q.clone()); }
        const vein = wireGeo(veinPts, l.finding === 'davf' && l.cvr ? 1.1 : 1.3, 12);
        if (vein) lesionGroup.add(new THREE.Mesh(vein, occl >= 1 ? mats.cast : mats.vein));
        if (l.assoc) { const a = new THREE.Mesh(new THREE.SphereGeometry(Math.max(1.2, R * 0.18), 20, 14), mats.sac); a.position.copy(p.clone().lerp(c, 0.55)); lesionGroup.add(a); }
        focus.at = c.clone(); focus.dir = d; focus.extent = R * 5.2;
      }
      for (const { d: dev, kind } of kinds) {
        if (!kind) continue;
        const ds = nums(dev.size);
        const qty = Math.max(1, Number(dev.qty) || 1);
        if (kind === 'coil' || kind === 'web') {
          if (sacCenter) {
            if (kind === 'coil') {
              const nCoils = kinds.filter((k) => k.kind === 'coil').reduce((a, k) => a + Math.max(1, Number(k.d.qty) || 1), 0);
              if (!lesionGroup.userData.coiled?.[l.part + l.t]) { lesionGroup.add(coilMass(sacCenter, sacR * 0.94, nCoils, `${l.part}-${l.t}`)); lesionGroup.userData.coiled = { ...(lesionGroup.userData.coiled || {}), [l.part + l.t]: true }; }
            } else {
              const rWeb = sacR * 0.9; const geos = [];
              for (let m = 0; m < 28; m++) { const a = (m / 28) * Math.PI * 2; const pts = []; for (let i = 0; i <= 24; i++) { const b = -Math.PI / 2 + (Math.PI * i) / 24; pts.push(new THREE.Vector3(rWeb * Math.cos(b) * Math.cos(a), rWeb * 0.92 * Math.sin(b), rWeb * Math.cos(b) * Math.sin(a))); } geos.push(wireGeo(pts, Math.max(0.04, rWeb * 0.025), 3)); }
              const web = new THREE.Mesh(mergeGeos(geos), mats.wire);
              web.position.copy(sacCenter); web.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), focus.dir || new THREE.Vector3(0, 1, 0));
              lesionGroup.add(web);
            }
          } else if (nidus) {
            lesionGroup.add(coilMass(nidus.c, Math.max(1.5, nidus.R * 0.35), qty, `${l.part}-avm`));
          } else {
            // parent-vessel / segment occlusion with coils
            lesionGroup.add(coilMass(p, rv * 1.15, qty, `${l.part}-seg`));
          }
          continue;
        }
        if (kind === 'liquid') {
          if (!nidus && !sacCenter) {
            const ch = chainSpan(s, u, 0, Math.max(10, lengthMm));
            add(tubeGeo(subCurve(ch.curve, ch.u0, ch.u1), () => rv * 0.98, 30, 12), mats.cast);
          }
          continue;
        }
        if (kind === 'plug') {
          const R = rv * 1.25; const L = Math.max(4, rv * 3);
          const prof = []; for (let i = 0; i <= 24; i++) { const y = -L / 2 + (L * i) / 24; const w = 0.55 + 0.45 * Math.abs(Math.sin((i / 24) * Math.PI * 2)); prof.push(new THREE.Vector2(R * w, y)); }
          const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), mats.wire);
          m.position.copy(p); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.curve.getTangentAt(u));
          lesionGroup.add(m);
          continue;
        }
        if (kind === 'filter') {
          const ch = chainSpan(s, u, 0, 26);
          focus.extent = Math.max(focus.extent, 64);
          const uf = Math.max(0, ch.u1 - 0.001);
          const c = ch.curve.getPointAt(uf); const t = ch.curve.getTangentAt(uf);
          const geos = []; const R = rv * 0.9;
          for (let m = 0; m < 10; m++) { const a = (m / 10) * Math.PI * 2; const pts = []; for (let i = 0; i <= 10; i++) { const k2 = i / 10; pts.push(new THREE.Vector3(R * Math.sin(Math.PI * 0.5 * (1 - k2)) * Math.cos(a), -k2 * R * 2.2, R * Math.sin(Math.PI * 0.5 * (1 - k2)) * Math.sin(a))); } geos.push(wireGeo(pts, 0.05, 3)); }
          const f = new THREE.Mesh(mergeGeos(geos), mats.wire);
          f.position.copy(c); f.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), t);
          lesionGroup.add(f);
          continue;
        }
        const L = ds.length >= 2 ? Math.max(...ds) : (kind === 'graft' ? 60 : 20);
        const D = ds.length >= 2 ? Math.min(...ds) : rv * 2;
        const evar = kind === 'graft' && /evar|endurant|excluder|zenith|treo|e-tegra|incraft|altura|ovation|afx|anaconda/i.test(`${dev.cat} ${dev.name}`) && !/tevar/i.test(dev.cat || '') && segs.has('aortic_bifurcation') && /^aorta_infrarenal$|^aortic_bifurcation$/.test(l.part);
        // EVAR: the main body ends at the aortic bifurcation and continues as two iliac limbs
        const toBif = evar ? (1 - u) * s.len + (l.part === 'aortic_bifurcation' ? 0 : segs.get('aortic_bifurcation').len) : L / 2;
        const ch = chainSpan(s, u, evar ? Math.max(20, L - toBif - 40) : L / 2, evar ? toBif - 0.5 : L / 2);
        const { u0, u1 } = ch;
        if (evar) for (const id of ['cia_r', 'cia_l']) {
          const g = segs.get(id);
          if (!g) continue;
          const Rl = (q) => g.radiusAt(q) * 1.05;
          add(tubeGeo(subCurve(g, 0, 0.8, 30), (q) => Rl(q * 0.8), 30, 18), mats.graft);
          const ring = laserStent(g, 0, 0.8, (q) => Rl(q) * 1.01, mats.wire);
          if (ring) lesionGroup.add(ring);
        }
        // self-expanding devices conform to the wall: drawn on the vessel's own radius along their length
        const Rw = (q) => Math.max(0.5, ch.radiusAt(q)) * (kind === 'graft' ? 1.05 : 1.06);
        const R = Rw(ch.at / ch.T);
        void D;
        const put = (o) => { if (o) lesionGroup.add(o); };
        if (kind === 'fd') put(braid(ch.curve, u0, u1, Rw, R < 2.5 ? 16 : 24));
        else if (kind === 'graft') {
          add(tubeGeo(subCurve(ch.curve, u0, u1, 60), (q) => Rw(u0 + (u1 - u0) * q), 60, 24), mats.graft);
          put(laserStent(ch.curve, u0, u1, (q) => Rw(q) * 1.01, mats.wire));
        } else put(laserStent(ch.curve, u0, u1, Rw));
        focus.extent = Math.max(focus.extent, L * 1.5);
      }
      if (state.marks[l.part]) {
        const el = document.createElement('span');
        el.className = 'dgm3d-badge';
        el.textContent = state.marks[l.part];
        overlay.append(el);
        badgeEls.push({ el, pos: sacCenter || (nidus ? nidus.c : p.clone()) });
      }
      focusPoints.push(focus);
    }
    for (const [id, list] of narrowings) {
      const s = segs.get(id);
      s.mesh.geometry.dispose();
      s.mesh.geometry = tubeGeo(s.curve, (q) => s.radiusAt(q) * list.reduce((f, n) => f * (1 - n.k * Math.exp(-(((q - n.u) / n.sigma) ** 2))), 1), s.tubular, s.radial);
      s.narrowed = true;
    }
    for (const id of see) {
      const s = segs.get(id);
      Object.assign(s.mesh.material, { transparent: true, opacity: 0.42, depthWrite: false });
      s.mesh.material.needsUpdate = true; s.seeThrough = true;
    }
  }

  function paint() {
    for (const s of segs.values()) {
      const on = Object.prototype.hasOwnProperty.call(state.marks, s.part.id);
      const col = figure ? s.base : state.active === s.part.id ? COL.active : on ? COL.on : state.hover === s.part.id ? COL.hover : s.base;
      s.mesh.material.color.setHex(col);
      s.mesh.material.emissive.setHex(figure ? 0 : on || state.active === s.part.id ? 0x3a2200 : state.hover === s.part.id ? 0x2a0710 : 0);
    }
    draw();
  }

  // ------------------------------------------------------------------ camera
  const views = model.views || [{ id: 'all', label: ['Całość', 'Whole'], target: box.getCenter(new THREE.Vector3()).toArray(), size: box.getSize(new THREE.Vector3()).length() }];
  let current = views.find((v) => v.id === (opts.view || model.defaultView)) || views[0];
  const view = { yaw: current.yaw || 0, pitch: current.pitch || 0, target: new THREE.Vector3(...current.target), size: current.size, zoom: 1, clip: null, depth: null };
  function distFor(size) { return (size / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.min(1, camera.aspect) * 1.05; }
  function place() {
    pivot.rotation.set(view.pitch, view.yaw, 0, 'XYZ');
    world.position.copy(view.target).multiplyScalar(-1);
    const dist = distFor(view.size) * view.zoom;
    camera.position.set(0, 0, dist);
    camera.lookAt(0, 0, 0);
    // figure / depth-limited views: hide what lies between the camera and the region of interest
    camera.near = view.depth ? Math.max(0.5, dist - view.depth) : Math.max(0.5, dist / 200);
    camera.far = view.depth ? dist + view.depth * 2 : 8000;
    camera.updateProjectionMatrix();
    pivot.updateMatrixWorld(true);
    const hideRe = view.hide ? new RegExp(view.hide) : null;
    for (const s of segs.values()) {
      let vis = !(hideRe && hideRe.test(s.part.id));
      // figure: only the vessels around the lesion (no cut-open trunks in front of it)
      if (vis && view.focus) {
        if (s.focusDist === undefined || s.focusKey !== view.focus.key) {
          let m = Infinity; for (let i = 0; i <= 24; i++) m = Math.min(m, s.curve.getPointAt(i / 24).distanceTo(view.focus.at));
          s.focusDist = m; s.focusKey = view.focus.key;
        }
        vis = s.focusDist <= view.focus.radius;
      }
      s.mesh.visible = vis; s.hidden = !vis;
    }
    if (decorMesh) decorMesh.visible = !view.focus || view.focus.decor;
    clipPlanes.length = 0;
    if (view.clip) {
      // clip in model coordinates (e.g. hide the neck below the skull base in the circle-of-Willis view)
      const n = new THREE.Vector3(...view.clip.normal).transformDirection(world.matrixWorld);
      const pt = new THREE.Vector3(...view.clip.point).applyMatrix4(world.matrixWorld);
      clipPlanes.push(new THREE.Plane().setFromNormalAndCoplanarPoint(n, pt));
    }
  }
  function setView(v) {
    current = v;
    Object.assign(view, { yaw: v.yaw || 0, pitch: v.pitch || 0, size: v.size, zoom: 1, clip: v.clip || null, hide: v.hide || null, depth: null, focus: null });
    view.target.set(...v.target);
    for (const b of tools.querySelectorAll('[data-v]')) b.classList.toggle('on', b.dataset.v === v.id);
    draw();
  }
  tools.innerHTML = views.map((v) => `<button type="button" data-v="${v.id}">${v.label[lg()]}</button>`).join('') + '<button type="button" data-v="__reset" title="Przywróć widok (dwuklik)">↺</button>';
  tools.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; setView(b.dataset.v === '__reset' ? current : views.find((x) => x.id === b.dataset.v)); });

  /** Camera for a letter figure: centred on the lesion, looking across the vessel (aneurysm sac in profile). */
  function frameLesion(index = 0) {
    const f = focusPoints[index];
    if (!f) return false;
    const t = f.tangent.clone().normalize();
    // preferred direction (front, slightly from above), made perpendicular to the vessel — or, for a sac, mostly
    // perpendicular to its dome so the aneurysm is seen in profile
    const pref = new THREE.Vector3(...(model.figureView || [0, 0.3, 1])).normalize();
    const axis = f.dir ? f.dir.clone().normalize() : t;
    let w = pref.clone().addScaledVector(axis, -pref.dot(axis) * (f.dir ? 0.75 : 1));
    if (w.lengthSq() < 0.05) w = new THREE.Vector3(Math.sign(f.at.x || 1), 0, 0).addScaledVector(axis, -axis.x);
    w.normalize();
    if (w.lengthSq() < 0.5) w.set(0, 0, 1);
    // look from the front, or from the lesion's own side when the front view is edge-on
    if (w.z < -0.15 || (Math.abs(w.z) <= 0.15 && w.x * (f.at.x || 1) < 0)) w.negate();
    view.pitch = Math.asin(Math.max(-1, Math.min(1, w.y)));
    view.yaw = Math.atan2(-w.x, w.z);
    view.target.copy(f.at);
    view.size = Math.max(18, f.extent);
    view.zoom = 1; view.clip = null; view.hide = opts.figureHide || null;
    view.depth = view.size * 1.6;
    view.focus = { at: f.at.clone(), radius: view.size * 0.75, key: `${index}-${view.size}`, decor: view.size < 160, part: f.part };
    draw(true);
    return true;
  }

  const tmp = new THREE.Vector3();
  function project(v, el, dy = 0) {
    tmp.copy(v).applyMatrix4(world.matrixWorld).project(camera);
    const r = renderer.domElement;
    const x = (tmp.x * 0.5 + 0.5) * r.clientWidth; const y = (-tmp.y * 0.5 + 0.5) * r.clientHeight;
    const shown = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
    if (el) { el.style.transform = `translate(${x}px, ${y + dy}px)`; el.style.display = shown ? '' : 'none'; }
    return { x, y, shown, z: tmp.z };
  }
  // keep lesion badges from covering each other: push overlapping ones upwards
  function placeBadges() {
    const pts = badgeEls.map((b) => ({ b, ...project(b.pos, b.el), w: b.el.offsetWidth || 80 }));
    pts.sort((a, b) => b.y - a.y);
    const done = [];
    for (const p of pts) {
      let dy = 0;
      for (let k = 0; k < 8; k++) {
        const hit = done.find((q) => q.shown && Math.abs(q.x - p.x) < Math.max(q.w, p.w) && Math.abs(q.y + q.dy - (p.y + dy)) < 20);
        if (!hit) break;
        dy = hit.y + hit.dy - p.y - 22;
      }
      p.dy = dy;
      if (dy) project(p.b.pos, p.b.el, dy);
      done.push(p);
    }
  }
  let raf = 0;
  function render() {
    place();
    renderer.render(scene, camera);
    const side = [];
    for (const l of labels) { l.el.textContent = l.text[lg()]; const p = project(l.pos, l.el); if (l.el.classList.contains('side')) side.push({ ...p, el: l.el }); }
    // right / left letters mean nothing in a lateral view (they land on top of each other)
    if (side.length === 2 && Math.hypot(side[0].x - side[1].x, side[0].y - side[1].y) < 120) for (const q of side) q.el.style.display = 'none';
    placeBadges();
  }
  function draw(now = false) {
    cancelAnimationFrame(raf);
    if (now) { render(); return; }
    raf = requestAnimationFrame(render);
  }
  function resize() {
    const r = wrap.getBoundingClientRect();
    const w = Math.max(10, r.width); const h = Math.max(10, r.height);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    camera.aspect = w / h;
    draw();
  }

  // ------------------------------------------------------------------ picking with the position along the vessel
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pickAt(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    place();
    ray.setFromCamera(ndc, camera);
    let hits = ray.intersectObjects([...segs.values()].filter((s) => !s.hidden).map((s) => s.hit), false);
    // ignore parts hidden by the view's clipping plane
    if (clipPlanes.length) hits = hits.filter((h) => clipPlanes.every((pl) => pl.distanceToPoint(h.point) >= -2));
    if (!hits.length) return null;
    hits.sort((a, b) => (a.distance - b.distance) || 0);
    const close = hits.filter((h) => h.distance - hits[0].distance < 4);
    // 1) a vessel whose real wall the pointer is on wins (the front-most one);
    // 2) otherwise the thinnest vessel near the pointer (small branches have generous pick zones)
    const local = new THREE.Ray().copy(ray.ray).applyMatrix4(world.matrixWorld.clone().invert());
    const onWall = close.filter((h) => {
      const s = segs.get(h.object.userData.part);
      for (let i = 0; i <= 60; i++) if (local.distanceSqToPoint(s.curve.getPointAt(i / 60)) <= (s.part.r * 1.15) ** 2) return true;
      return false;
    });
    if (!onWall.length) close.sort((a, b) => segs.get(a.object.userData.part).part.r - segs.get(b.object.userData.part).part.r);
    const h = onWall[0] || close[0];
    const s = segs.get(h.object.userData.part);
    const pLocal = world.worldToLocal(h.point.clone());
    let best = 0; let bd = Infinity;
    for (let i = 0; i <= 100; i++) { const d = s.curve.getPointAt(i / 100).distanceToSquared(pLocal); if (d < bd) { bd = d; best = i / 100; } }
    return { id: s.part.id, t: best };
  }
  let drag = null;
  const el = renderer.domElement;
  if (!figure) {
    el.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw: view.yaw, pitch: view.pitch, moved: false }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      if (drag) {
        const dx = e.clientX - drag.x; const dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        view.yaw = drag.yaw + dx * 0.008;
        view.pitch = Math.max(-1.55, Math.min(1.55, drag.pitch + dy * 0.008));
        tip.hidden = true;
        draw();
        return;
      }
      const hit = pickAt(e);
      const id = hit?.id || null;
      if (id !== state.hover) { state.hover = id; paint(); }
      if (id) {
        tip.textContent = partLabel(segs.get(id).part, state.lang);
        const r = wrap.getBoundingClientRect();
        tip.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 12}px)`;
        tip.hidden = false;
        el.style.cursor = 'pointer';
      } else { tip.hidden = true; el.style.cursor = 'grab'; }
    });
    el.addEventListener('pointerup', (e) => { const d = drag; drag = null; if (d && !d.moved) { const h = pickAt(e); if (h && opts.onPick) opts.onPick(h.id, h.t); } });
    el.addEventListener('pointerleave', () => { tip.hidden = true; if (state.hover) { state.hover = null; paint(); } });
    el.addEventListener('wheel', (e) => { e.preventDefault(); view.zoom = Math.max(0.15, Math.min(4, view.zoom * (1 + Math.sign(e.deltaY) * 0.1))); draw(); }, { passive: false });
    el.addEventListener('dblclick', () => setView(current));
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();
  buildLesions();
  setView(current);
  paint();

  return {
    update(next = {}) {
      const lesionsChanged = next.lesions && JSON.stringify(next.lesions) !== JSON.stringify(state.lesions);
      const marksChanged = next.marks && JSON.stringify(next.marks) !== JSON.stringify(state.marks);
      state = { ...state, ...next };
      if (lesionsChanged || marksChanged) buildLesions();
      if (next.lang) tools.querySelectorAll('[data-v]').forEach((b) => { const v = views.find((x) => x.id === b.dataset.v); if (v) b.textContent = v.label[lg()]; });
      paint();
    },
    reset() { setView(current); },
    setView(id) { const v = views.find((x) => x.id === id); if (v) setView(v); },
    /** Point the camera at lesion number `index` (order of `lesions`) for a figure. */
    frame: frameLesion,
    dispose() {
      ro.disconnect();
      cancelAnimationFrame(raf);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => m.dispose?.()); });
      scene.environment?.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss?.();
      host.textContent = '';
      host.classList.remove('dgm3d-host');
    },
    snapshot() { render(); return renderer.domElement.toDataURL('image/png'); },
    canvas: () => renderer.domElement,
    /** Vessel names for a figure: the largest visible vessels near the centre, with a point on each (CSS pixels). */
    figureLabels(max = 6, index = 0) {
      render();
      const W = renderer.domElement.clientWidth; const H = renderer.domElement.clientHeight;
      const f = focusPoints[index];
      const fp = f ? project(f.at) : { x: W / 2, y: H / 2 };
      void f;
      const out = [];
      const seen = new Set();
      const cands = [];
      for (const s of segs.values()) {
        let best = null;
        for (let i = 1; i < 20; i++) {
          const q = s.curve.getPointAt(i / 20);
          if (view.focus && q.distanceTo(view.focus.at) > view.size * 0.55) continue;
          const pr = project(q);
          if (!pr.shown || pr.z < -1 || pr.x < W * 0.08 || pr.x > W * 0.92 || pr.y < H * 0.08 || pr.y > H * 0.92) continue;
          if (clipPlanes.some((pl) => pl.distanceToPoint(q.clone().applyMatrix4(world.matrixWorld)) < 0)) continue;
          const dc = Math.hypot(pr.x - fp.x, pr.y - fp.y);
          if (dc < (s.part.id === f?.part ? 24 : 40)) continue;
          if (!best || dc < best.dc) best = { ...pr, dc };
        }
        if (best && !s.hidden) cands.push({ id: s.part.id, text: partLabel(s.part, state.lang), r: s.part.r, ...best });
      }
      const own = f?.part;
      cands.sort((a, b) => ((b.id === own) - (a.id === own)) || (b.r - a.r) || (a.dc - b.dc));
      for (const c of cands) {
        const key = c.text.replace(/\s*\((prawa|lewa|right|left)\)/i, '');
        if (seen.has(key) && out.length > 2) continue;
        if (out.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < 70)) continue;
        seen.add(key);
        out.push(c);
        if (out.length >= max) break;
      }
      return { labels: out, focus: f ? { x: fp.x, y: fp.y } : null, width: W, height: H, mmPerPx: view.size / Math.min(W, H) };
    },
    screenPoint(id, t = 0.5) {
      const s = segs.get(id);
      if (!s) return null;
      place();
      const v = s.curve.getPointAt(t).applyMatrix4(world.matrixWorld).project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
    },
  };
}

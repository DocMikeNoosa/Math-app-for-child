// Renderer for true-3D vessel models (models/*.js, millimetres). Shows the lesions ON the vessels:
// stenosis = local narrowing, occlusion / thrombus = clot, aneurysm = sac to scale with its neck and projection,
// and the devices: stents (wire mesh), flow diverters (dense mesh), stent grafts (fabric), coils (coil pack),
// intrasaccular devices, plugs. Drag = rotate, wheel = zoom, double-click = reset, click = select (with the
// position along the vessel).
import * as THREE from '../vendor/three.mjs';
import { partLabel } from './diagram.js';

const COL = { artery: 0xc8304f, vein: 0x4f6fd8, on: 0xffc94d, active: 0xfff0b8, hover: 0xff7d96, clot: 0x3a0610, sac: 0xd94a64, bone: 0xc9c2b2 };

/** Mirror `pair` segments to the left and return diagram-style parts ({ id, label, side, kind, r, pts, anat }). */
export function expandModel(model) {
  if (!model || model.kind !== 'model3d' || model.parts) return model;
  const parts = [];
  for (const s of model.segments) {
    const base = { kind: 'vessel', anat: s.anat, r: s.r, vein: s.vein, label: s.label };
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

export function createModel3D(host, model, opts = {}) {
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
  host.append(wrap);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch { host.textContent = ''; return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  wrap.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.5, 8000);
  scene.add(new THREE.HemisphereLight(0xe6edff, 0x2a0d16, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(-300, 500, 700); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6b84, 1.0); rim.position.set(500, -200, -600); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x9fb6ff, 0.5); fill.position.set(400, 100, 300); scene.add(fill);
  const pivot = new THREE.Group();
  const world = new THREE.Group();
  pivot.add(world);
  scene.add(pivot);

  // context: skull / bones, translucent
  for (const c of model.context || []) {
    let geo;
    if (c.shape === 'ellipsoid') { geo = new THREE.SphereGeometry(1, 48, 32); geo.scale(...c.r); }
    else if (c.shape === 'box') geo = new THREE.BoxGeometry(...c.size);
    else if (c.shape === 'cylinder') geo = new THREE.CylinderGeometry(c.r, c.r, c.h, 24);
    if (!geo) continue;
    const mat = c.bone
      ? new THREE.MeshStandardMaterial({ color: COL.bone, roughness: 0.8, transparent: true, opacity: 0.1, depthWrite: false })
      : new THREE.MeshBasicMaterial({ color: 0x8aa0d0, wireframe: true, transparent: true, opacity: 0.028, depthWrite: false });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...c.c);
    if (c.rot) m.rotation.set(...c.rot);
    world.add(m);
  }

  // vessels
  const segs = new Map(); // id → { part, curve, mesh, hit, base, len }
  const tubeFor = (curve, r, tubular, radial = 16) => new THREE.TubeGeometry(curve, tubular, r, radial, false);
  for (const p of opts.parts || model.parts) {
    const v = p.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    if (v.length < 2) continue;
    const curve = new THREE.CatmullRomCurve3(v, false, 'centripetal');
    const len = curve.getLength();
    const tubular = Math.max(24, Math.min(320, Math.round(len * 1.5)));
    const base = p.vein ? COL.vein : COL.artery;
    const mat = new THREE.MeshPhysicalMaterial({ color: base, roughness: 0.3, metalness: 0.04, clearcoat: 0.85, clearcoatRoughness: 0.22, sheen: 0.35, sheenColor: new THREE.Color(0xffb3c1) });
    const mesh = new THREE.Mesh(tubeFor(curve, p.r, tubular), mat);
    for (const end of [v[0], v[v.length - 1]]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(p.r, 16, 12), mat); cap.position.copy(end); mesh.add(cap); }
    const hit = new THREE.Mesh(tubeFor(curve, Math.max(p.r + 1.6, 2.6), Math.max(12, Math.round(tubular / 3)), 8), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.part = p.id;
    world.add(mesh, hit);
    segs.set(p.id, { part: p, curve, mesh, hit, base, len, tubular });
  }
  const box = new THREE.Box3();
  for (const s of segs.values()) box.expandByObject(s.mesh);

  // labels
  const labels = [];
  for (const l of model.labels || []) {
    const el = document.createElement('span');
    el.className = `dgm3d-label${l.side ? ' side' : ''}`;
    overlay.append(el);
    labels.push({ el, pos: new THREE.Vector3(...l.at), text: l.text });
  }

  // lesions and devices (rebuilt on every update)
  const lesionGroup = new THREE.Group();
  world.add(lesionGroup);
  const badgeEls = [];
  let state = { marks: opts.marks || {}, active: opts.active || null, lang: opts.lang || 'pl', hover: null, lesions: opts.lesions || [] };

  function narrow(s, u0, k, widthMm) {
    // rebuild the tube with a local narrowing around u0 (k = 0..1 of the radius removed)
    const geo = tubeFor(s.curve, s.part.r, s.tubular);
    const pos = geo.attributes.position;
    const radial = 17; // radialSegments + 1
    const sigma = Math.max(1.5, widthMm / 2) / s.len;
    for (let i = 0; i <= s.tubular; i++) {
      const u = i / s.tubular;
      const f = 1 - k * Math.exp(-(((u - u0) / sigma) ** 2));
      if (f > 0.999) continue;
      const c = s.curve.getPointAt(u);
      for (let j = 0; j < radial; j++) {
        const idx = i * radial + j;
        const vx = pos.getX(idx) - c.x; const vy = pos.getY(idx) - c.y; const vz = pos.getZ(idx) - c.z;
        pos.setXYZ(idx, c.x + vx * f, c.y + vy * f, c.z + vz * f);
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }
  function subCurve(s, u0, u1, n = 40) {
    const pts = [];
    for (let i = 0; i <= n; i++) pts.push(s.curve.getPointAt(Math.min(1, Math.max(0, u0 + ((u1 - u0) * i) / n))));
    return new THREE.CatmullRomCurve3(pts);
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
  const mats = {
    clot: new THREE.MeshStandardMaterial({ color: COL.clot, roughness: 0.9 }),
    sac: new THREE.MeshPhysicalMaterial({ color: COL.sac, roughness: 0.35, clearcoat: 0.6, transparent: true, opacity: 0.78 }),
    stent: new THREE.MeshBasicMaterial({ color: 0xd8dee8, wireframe: true, transparent: true, opacity: 0.9 }),
    fd: new THREE.MeshBasicMaterial({ color: 0xf2f5fa, wireframe: true, transparent: true, opacity: 0.95 }),
    graft: new THREE.MeshPhysicalMaterial({ color: 0xe9e4d8, roughness: 0.75, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
    coil: new THREE.MeshStandardMaterial({ color: 0xdcd6c8, metalness: 0.85, roughness: 0.3 }),
    web: new THREE.MeshBasicMaterial({ color: 0xe8edf5, wireframe: true }),
    plug: new THREE.MeshStandardMaterial({ color: 0xb8c0cc, metalness: 0.7, roughness: 0.35 }),
  };
  function coilBall(center, R) {
    const pts = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 90; i++) {
      const th = rnd() * Math.PI * 2; const ph = Math.acos(2 * rnd() - 1); const r = R * (0.55 + 0.4 * rnd());
      pts.push(new THREE.Vector3(center.x + r * Math.sin(ph) * Math.cos(th), center.y + r * Math.sin(ph) * Math.sin(th), center.z + r * Math.cos(ph)));
    }
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, Math.max(0.12, R * 0.045), 5, false), mats.coil);
  }
  function deviceKind(d) {
    const c = `${d.cat || ''} ${d.name || ''}`.toLowerCase();
    if (/flow_diverter|flow divert|pipeline|surpass|fred|silk|p64|p48|derivo/.test(c)) return 'fd';
    if (/intrasaccular|web\b/.test(c)) return 'web';
    if (/coil|spiral/.test(c)) return 'coil';
    if (/plug|zatyczk/.test(c)) return 'plug';
    if (/aortic|evar|tevar|graft|covered|pokryt|viabahn|bentley|begraft/.test(c)) return 'graft';
    if (/stent(?!_retriever)|stent_/.test(c) && !/retriever|retriev/.test(c)) return 'stent';
    return null;
  }

  function buildLesions() {
    lesionGroup.clear();
    for (const b of badgeEls) b.el.remove();
    badgeEls.length = 0;
    // restore every vessel's tube, then narrow where needed
    for (const s of segs.values()) {
      if (s.narrowed) { s.mesh.geometry.dispose(); s.mesh.geometry = tubeFor(s.curve, s.part.r, s.tubular); s.narrowed = false; }
    }
    for (const l of state.lesions) {
      const s = segs.get(l.part);
      if (!s) continue;
      const u = Math.min(0.98, Math.max(0.02, Number.isFinite(l.t) ? l.t : 0.5));
      const p = s.curve.getPointAt(u);
      const rv = s.part.r;
      const lengthMm = firstNum(l.length) || (l.finding === 'occlusion' ? 10 : 6);
      if (l.finding === 'stenosis' && firstNum(l.pre)) { s.mesh.geometry.dispose(); s.mesh.geometry = narrow(s, u, Math.min(0.92, firstNum(l.pre) / 100), lengthMm); s.narrowed = true; }
      if (l.finding === 'occlusion' || l.finding === 'thrombus') {
        const span = Math.min(0.45, lengthMm / s.len);
        const clot = new THREE.Mesh(new THREE.TubeGeometry(subCurve(s, Math.max(0, u - span / 2), Math.min(1, u + span / 2)), 24, rv * 1.04, 12, true), mats.clot);
        lesionGroup.add(clot);
      }
      let sacCenter = null; let sacR = 0;
      if (l.finding === 'aneurysm' || l.finding === 'pseudoaneurysm') {
        const dims = nums(l.size);
        sacR = Math.max(1, (dims.length ? Math.max(...dims) : 6) / 2);
        const neck = Math.max(0.6, (firstNum(l.extra) || sacR * 1.1) / 2);
        const d = sideVector(s, u, l.dir || 'sup');
        sacCenter = p.clone().add(d.clone().multiplyScalar(rv * 0.7 + sacR * 0.85));
        const sac = new THREE.Mesh(new THREE.SphereGeometry(sacR, 32, 24), mats.sac);
        sac.position.copy(sacCenter);
        if (dims.length >= 2) sac.scale.set(1, Math.min(dims[0], dims[1]) / Math.max(dims[0], dims[1]), 1);
        sac.lookAt(sacCenter.clone().add(d));
        const neckGeo = new THREE.CylinderGeometry(neck, neck * 1.1, rv * 0.7 + sacR * 0.6, 20, 1, true);
        const neckMesh = new THREE.Mesh(neckGeo, mats.sac);
        neckMesh.position.copy(p.clone().add(d.clone().multiplyScalar((rv * 0.7 + sacR * 0.6) / 2)));
        neckMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d);
        lesionGroup.add(sac, neckMesh);
      }
      for (const dev of l.devices || []) {
        const kind = deviceKind(dev);
        if (!kind) continue;
        const ds = nums(dev.size);
        if (kind === 'coil' || kind === 'web') {
          if (sacCenter) lesionGroup.add(kind === 'coil' ? coilBall(sacCenter, sacR * 0.92) : Object.assign(new THREE.Mesh(new THREE.SphereGeometry(sacR * 0.9, 18, 12), mats.web), { position: sacCenter.clone() }));
          else lesionGroup.add(coilBall(p, rv * 1.0));
          continue;
        }
        if (kind === 'plug') {
          const m = new THREE.Mesh(new THREE.CylinderGeometry(rv * 1.05, rv * 1.05, Math.max(4, rv * 3), 20), mats.plug);
          m.position.copy(p);
          m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), s.curve.getTangentAt(u));
          lesionGroup.add(m);
          continue;
        }
        const L = ds.length >= 2 ? Math.max(...ds) : (kind === 'graft' ? 60 : 20);
        const D = ds.length >= 2 ? Math.min(...ds) : rv * 2;
        const half = Math.min(0.5, L / s.len / 2);
        const sc = subCurve(s, Math.max(0, u - half), Math.min(1, u + half), 60);
        const r = Math.max(rv * 1.06, Math.min(D / 2, rv * 1.6));
        const geo = new THREE.TubeGeometry(sc, kind === 'fd' ? 90 : 36, r, kind === 'fd' ? 28 : 12, false);
        lesionGroup.add(new THREE.Mesh(geo, kind === 'fd' ? mats.fd : kind === 'graft' ? mats.graft : mats.stent));
      }
      if (state.marks[l.part]) {
        const el = document.createElement('span');
        el.className = 'dgm3d-badge';
        el.textContent = state.marks[l.part];
        overlay.append(el);
        badgeEls.push({ el, pos: sacCenter || p.clone() });
      }
    }
  }

  function paint() {
    for (const s of segs.values()) {
      const on = Object.prototype.hasOwnProperty.call(state.marks, s.part.id);
      const col = state.active === s.part.id ? COL.active : on ? COL.on : state.hover === s.part.id ? COL.hover : s.base;
      s.mesh.material.color.setHex(col);
      s.mesh.material.emissive.setHex(on || state.active === s.part.id ? 0x3a2200 : state.hover === s.part.id ? 0x2a0710 : 0);
    }
    draw();
  }

  // camera
  const views = model.views || [{ id: 'all', label: ['Całość', 'Whole'], target: box.getCenter(new THREE.Vector3()).toArray(), size: box.getSize(new THREE.Vector3()).length() }];
  let current = views.find((v) => v.id === (opts.view || model.defaultView)) || views[0];
  const view = { yaw: current.yaw || 0, pitch: current.pitch || 0, target: new THREE.Vector3(...current.target), size: current.size, zoom: 1 };
  function distFor(size) { return (size / 2) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) / Math.min(1, camera.aspect) * 1.05; }
  function place() {
    pivot.rotation.set(view.pitch, view.yaw, 0, 'XYZ');
    world.position.copy(view.target).multiplyScalar(-1);
    camera.position.set(0, 0, distFor(view.size) * view.zoom);
    camera.lookAt(0, 0, 0);
    camera.near = Math.max(0.5, camera.position.z / 200);
    camera.updateProjectionMatrix();
  }
  function setView(v) {
    current = v;
    Object.assign(view, { yaw: v.yaw || 0, pitch: v.pitch || 0, size: v.size, zoom: 1 });
    view.target.set(...v.target);
    for (const b of tools.querySelectorAll('[data-v]')) b.classList.toggle('on', b.dataset.v === v.id);
    draw();
  }
  tools.innerHTML = views.map((v) => `<button type="button" data-v="${v.id}">${v.label[lg()]}</button>`).join('') + '<button type="button" data-v="__reset" title="Przywróć widok (dwuklik)">↺</button>';
  tools.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; setView(b.dataset.v === '__reset' ? current : views.find((x) => x.id === b.dataset.v)); });

  const tmp = new THREE.Vector3();
  function project(v, el, dy = 0) {
    tmp.copy(v).applyMatrix4(world.matrixWorld).project(camera);
    const r = renderer.domElement;
    const x = (tmp.x * 0.5 + 0.5) * r.clientWidth; const y = (-tmp.y * 0.5 + 0.5) * r.clientHeight;
    const shown = tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
    el.style.transform = `translate(${x}px, ${y + dy}px)`;
    el.style.display = shown ? '' : 'none';
    return { x, y, shown };
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
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      place();
      pivot.updateMatrixWorld(true);
      renderer.render(scene, camera);
      const side = [];
      for (const l of labels) { l.el.textContent = l.text[lg()]; const p = project(l.pos, l.el); if (l.el.classList.contains('side')) side.push({ ...p, el: l.el }); }
      // right / left letters mean nothing in a lateral view (they land on top of each other)
      if (side.length === 2 && Math.hypot(side[0].x - side[1].x, side[0].y - side[1].y) < 120) for (const q of side) q.el.style.display = 'none';
      placeBadges();
    });
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

  // picking with the position along the vessel
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pickAt(ev) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    place(); pivot.updateMatrixWorld(true);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...segs.values()].map((s) => s.hit), false);
    if (!hits.length) return null;
    hits.sort((a, b) => (a.distance - b.distance) || 0);
    const near = hits.filter((h) => h.distance - hits[0].distance < 4);
    // 1) a vessel whose real wall the pointer is on wins (the front-most one);
    // 2) otherwise the thinnest vessel near the pointer (small branches have generous pick zones)
    const local = new THREE.Ray().copy(ray.ray).applyMatrix4(world.matrixWorld.clone().invert());
    const onWall = near.filter((h) => {
      const s = segs.get(h.object.userData.part);
      for (let i = 0; i <= 60; i++) if (local.distanceSqToPoint(s.curve.getPointAt(i / 60)) <= (s.part.r * 1.1) ** 2) return true;
      return false;
    });
    if (!onWall.length) near.sort((a, b) => segs.get(a.object.userData.part).part.r - segs.get(b.object.userData.part).part.r);
    const h = onWall[0] || near[0];
    const s = segs.get(h.object.userData.part);
    const pLocal = world.worldToLocal(h.point.clone());
    let best = 0; let bd = Infinity;
    for (let i = 0; i <= 100; i++) { const d = s.curve.getPointAt(i / 100).distanceToSquared(pLocal); if (d < bd) { bd = d; best = i / 100; } }
    return { id: s.part.id, t: best };
  }
  let drag = null;
  const el = renderer.domElement;
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
    dispose() {
      ro.disconnect();
      cancelAnimationFrame(raf);
      scene.traverse((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => m.dispose?.()); });
      renderer.dispose();
      host.textContent = '';
      host.classList.remove('dgm3d-host');
    },
    snapshot() { place(); pivot.updateMatrixWorld(true); renderer.render(scene, camera); return renderer.domElement.toDataURL('image/png'); },
    screenPoint(id, t = 0.5) {
      const s = segs.get(id);
      if (!s) return null;
      place(); pivot.updateMatrixWorld(true);
      const v = s.curve.getPointAt(t).applyMatrix4(world.matrixWorld).project(camera);
      const r = renderer.domElement.getBoundingClientRect();
      return { x: r.left + (v.x * 0.5 + 0.5) * r.width, y: r.top + (-v.y * 0.5 + 0.5) * r.height };
    },
  };
}

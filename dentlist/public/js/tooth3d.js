// DentList — trójwymiarowy model wybranego zęba (three.js), budowany proceduralnie z anatomii zapisanej w aplikacji:
// kształt korony wg typu zęba, liczba i położenie korzeni, kanały (z obturacją), kanały boczne. Obrót myszą / palcem.
import * as THREE from '../vendor/three.mjs';
import { toothInfo } from './data.js';

const DIM = { // [szerokość MD, głębokość BL, wysokość korony, długość korzenia] (mm, w przybliżeniu)
  U: { 1: [8.6, 7, 10.5, 13], 2: [6.6, 6, 9, 13], 3: [7.6, 8, 10, 17], 4: [7, 9, 8.5, 14], 5: [6.8, 9, 7.8, 14], 6: [10.2, 11, 7.5, 12.5], 7: [9, 11, 7, 12], 8: [8.6, 10.5, 6.5, 11] },
  L: { 1: [5.3, 6, 9, 12.5], 2: [5.8, 6.4, 9.5, 13.5], 3: [6.8, 7.6, 11, 16], 4: [7, 7.6, 8.5, 14], 5: [7.2, 8, 8, 14.5], 6: [11, 10.4, 7.5, 13.5], 7: [10.5, 10, 7, 13], 8: [10, 9.6, 6.6, 11] },
};

function crownGeometry(ti, W, D, H) {
  const g = new THREE.SphereGeometry(1, 120, 80);
  const p = g.attributes.position, v = new THREE.Vector3();
  const box = ti.type === 'molar' ? 0.62 : ti.type === 'premolar' ? 0.8 : 0.9;
  const cusps = ti.type === 'molar'
    ? (ti.upper ? [[-0.42, 0.42], [0.42, 0.42], [-0.4, -0.4], [0.45, -0.45]] : [[-0.45, 0.42], [0.05, 0.48], [0.5, 0.35], [-0.42, -0.42], [0.42, -0.42]])
    : ti.type === 'premolar' ? [[0, 0.45], [0, -0.42]] : [];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    let { x, y, z } = v;
    // boxier silhouette for posterior teeth
    x = Math.sign(x) * Math.pow(Math.abs(x), box); z = Math.sign(z) * Math.pow(Math.abs(z), box);
    // cervical constriction
    if (y < 0) { const f = 1 - 0.3 * Math.pow(-y, 1.6); x *= f; z *= f; }
    let yy = y;
    if (ti.type === 'incisor' || ti.type === 'canine') {
      // thin incisal edge (labio-lingual), broad labial face
      if (y > 0) z *= 1 - 0.72 * Math.pow(y, 1.4);
      if (ti.type === 'canine') yy = y + 0.38 * Math.max(0, y) * Math.exp(-(x * x) / 0.12);
      else if (y > 0.6) yy = 0.6 + (y - 0.6) * 0.55;
    } else {
      // flattened occlusal table with cusps and a central fossa
      if (y > 0.45) yy = 0.45 + (y - 0.45) * 0.42;
      if (y > 0.2) {
        let bump = 0;
        for (const [cx, cz] of cusps) bump += Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / 0.07);
        const fossa = Math.exp(-(x * x + z * z) / 0.08);
        yy += (0.26 * bump - 0.16 * fossa) * Math.min(1, (y - 0.2) * 2.5);
      }
    }
    p.setXYZ(i, x * W / 2, yy * H / 2, z * D / 2);
  }
  g.computeVertexNormals();
  return g;
}

/** Tapered tube along a curve: radius rx/rz from top to the rounded apex. */
function taperedTube(curve, rx0, rz0, tip = 0.12, seg = 64, rad = 36) {
  const frames = curve.computeFrenetFrames(seg, false);
  const pos = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, c = curve.getPointAt(t);
    const k = 1 - (1 - tip) * Math.pow(t, 1.35);
    const apex = t > 0.93 ? Math.sqrt(Math.max(0, 1 - ((t - 0.93) / 0.07) ** 2)) : 1;
    const rx = rx0 * k * apex, rz = rz0 * k * apex;
    const N = frames.normals[i], B = frames.binormals[i];
    for (let j = 0; j <= rad; j++) {
      const a = (j / rad) * Math.PI * 2;
      pos.push(c.x + Math.cos(a) * rx * N.x + Math.sin(a) * rz * B.x, c.y + Math.cos(a) * rx * N.y + Math.sin(a) * rz * B.y, c.z + Math.cos(a) * rx * N.z + Math.sin(a) * rz * B.z);
    }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// root position (x = mesio-distal, z = bucco-lingual) by name
function rootSpot(name, n, i, W, D, ti) {
  const m = { MB: [-0.24, 0.2], DB: [0.24, 0.22], P: [0.0, -0.26], B: ti.type === 'molar' ? [0, 0.22] : [0, 0.2], L: [0, -0.2], M: [-0.27, 0], D: [0.27, 0], RE: [0.16, -0.3] }[name];
  if (m && n > 1) return [m[0] * W, m[1] * D];
  if (n === 1) return [0, 0];
  const a = (i / n) * Math.PI * 2; return [Math.cos(a) * 0.25 * W, Math.sin(a) * 0.2 * D];
}

export class Tooth3D {
  constructor(el) {
    this.el = el;
    // opaque canvas with its own background: transparent WebGL layers over blurred UI fail to show on some Windows GPUs
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'default' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.25; r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    { const c = document.createElement('canvas'); c.width = c.height = 512; this.bgCanvas = c;
      const bg = new THREE.CanvasTexture(c); bg.colorSpace = THREE.SRGBColorSpace; this.scene.background = bg; this.bgTex = bg; this.paintBg(null); }
    const pm = new THREE.PMREMGenerator(r);
    this.scene.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
    this.controls = new THREE.OrbitControls(this.camera, r.domElement);
    Object.assign(this.controls, { enablePan: false, enableDamping: true, dampingFactor: 0.08, autoRotate: true, autoRotateSpeed: 1.4, minDistance: 25, maxDistance: 90 });
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(20, 30, 25); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x5ee6d6, 1.6); rim.position.set(-25, 10, -20); this.scene.add(rim);
    const fill = new THREE.DirectionalLight(0x7f8cff, 0.8); fill.position.set(0, -30, 15); this.scene.add(fill);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.xray = true;
    // drawing buffer capped (≤ 2048 px a side) so large / high-DPI screens stay within weaker GPUs' limits
    this.resize = () => {
      const w = el.clientWidth || 400, h = el.clientHeight || 400;
      r.setPixelRatio(Math.max(0.5, Math.min(window.devicePixelRatio || 1, 1.5, 2048 / Math.max(w, h))));
      r.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.fit();
      r.render(this.scene, this.camera); this.onResized?.();
    };
    this.ro = new ResizeObserver(this.resize); this.ro.observe(el); this.resize();
    const loop = () => { if (this.dead) return; this.raf = requestAnimationFrame(loop); this.controls.update(); r.render(this.scene, this.camera); };
    loop();
    el.addEventListener('pointerdown', () => { this.controls.autoRotate = false; clearTimeout(this.resume); });
    el.addEventListener('pointerup', () => { this.resume = setTimeout(() => { this.controls.autoRotate = true; }, 5000); });
  }
  /** Background behind the tooth: the original navy, or navy blended with a specialty colour (subdued). */
  paintBg(tint) {
    const mix = (h1, h2, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const a = p(h1), b = p(h2); return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`; };
    const x = this.bgCanvas.getContext('2d'), g = x.createRadialGradient(256, 230, 20, 256, 256, 360);
    // endodontics: the original navy; other specialties: a dark shade of their own colour
    // tint = the specialty's version of the original navy [centre, middle, edge]
    g.addColorStop(0, tint ? tint[0] : '#1d3a63'); g.addColorStop(0.55, tint ? tint[1] : '#0f2140'); g.addColorStop(1, tint ? tint[2] : '#070f1e');
    x.fillStyle = g; x.fillRect(0, 0, 512, 512); this.bgTex.needsUpdate = true;
  }
  setTint(bg) { const key = bg ? bg.join() : ''; if (key === this.tintKey) return; this.tintKey = key; this.paintBg(bg); }
  setXray(on) { this.xray = on; if (this.rec) this.setTooth(this.rec, this.opts); }
  setTooth(rec, opts = {}) {
    this.rec = rec; this.opts = opts;
    for (const c of [...this.group.children]) { c.geometry?.dispose(); c.material?.dispose(); this.group.remove(c); }
    const ti = toothInfo(rec.fdi), [W, D, H, L0] = DIM[ti.upper ? 'U' : 'L'][ti.gpos].map((x, i) => x * ti.scale * (ti.primary && i === 3 ? 0.8 : 1));
    const mode = opts.mode || 'endo', ex = opts.extras || {};
    const L = L0 * (opts.extras?.apico ? 0.8 : 1);
    if (mode === 'implant') return this.implant(ti, W, D, H, L, opts);
    const x = this.xray && mode === 'endo', gone = mode === 'gone';
    // glass-like enamel and dentine (transmission) so the canal system glows through
    const enamel = new THREE.MeshPhysicalMaterial({ color: 0xfff8ec, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transmission: x ? 0.78 : 0.12, thickness: 4, ior: 1.62, attenuationColor: new THREE.Color(0xf3e3c3), attenuationDistance: 9, sheen: 0.6, sheenColor: new THREE.Color(0xbfefff), specularIntensity: 1 });
    const dentin = new THREE.MeshPhysicalMaterial({ color: 0xf2dfba, roughness: 0.28, clearcoat: 0.5, clearcoatRoughness: 0.2, transmission: x ? 0.7 : 0.08, thickness: 3, ior: 1.55, attenuationColor: new THREE.Color(0xe7c995), attenuationDistance: 7 });
    // the canal system is drawn as an always-visible "X-ray" layer over the glossy tooth
    const xr = { transparent: true, depthTest: !x, depthWrite: false };
    const pulp = new THREE.MeshStandardMaterial({ color: 0xff3b66, emissive: 0xe0204c, emissiveIntensity: 0.55, roughness: 0.4, opacity: 0.92, ...xr });
    const filled = new THREE.MeshStandardMaterial({ color: 0x14d8c0, emissive: 0x0bb3a0, emissiveIntensity: 0.6, roughness: 0.25, opacity: 0.95, ...xr });
    const lateral = new THREE.MeshStandardMaterial({ color: 0x9a86ff, emissive: 0x7a62ff, emissiveIntensity: 0.6, opacity: 0.95, ...xr });
    if (gone) for (const m of [enamel, dentin]) { m.transmission = 0; m.transparent = true; m.opacity = 0.16; m.depthWrite = false; m.color = new THREE.Color(0xc9d2de); }
    if (ex.post || ex.pulpotomy) for (const m of [dentin]) { m.transmission = 0.75; } // the post / pulpotomy shows through the root
    const crown = new THREE.Mesh(crownGeometry(ti, W, D, H), enamel); crown.position.y = H / 2; crown.renderOrder = 3; this.group.add(crown);
    if (!gone) this.extras(ti, W, D, H, L, ex, crown);
    const roots = rec.roots && rec.roots.length ? rec.roots : [{ name: 'K', canals: [{ name: 'K' }] }];
    const n = roots.length, obt = !!opts.done;
    const canals = mode === 'endo';
    // pulp chamber
    if (canals) { const ch = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), obt ? filled : pulp); ch.renderOrder = 10;
      ch.scale.set(W * 0.17, H * 0.1, D * 0.15); ch.position.y = H * 0.2; this.group.add(ch); }
    roots.forEach((r, i) => {
      const [rx, rz] = rootSpot(r.name, n, i, W, D, ti);
      const isC = r.name === 'C', len = L * (r.name === 'P' ? 1.06 : r.name === 'RE' ? 0.78 : 1);
      const splay = n > 1 ? 1.35 : 1;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(rx * 0.75, 0.6, rz * 0.75),
        new THREE.Vector3(rx * splay, -len * 0.45, rz * splay),
        new THREE.Vector3(rx * splay * 1.05 + (ti.type === 'incisor' && ti.pos === 2 ? 0.8 : 0.35), -len, rz * splay * 1.05),
      ]);
      const rr = isC ? W * 0.36 : Math.max(1.3, Math.min(2.6, (Math.min(W, D) * 0.62) / Math.sqrt(n)));
      const root = new THREE.Mesh(taperedTube(curve, rr, isC ? rr * 0.45 : rr * (n === 1 ? 0.85 : 0.75), 0.18), dentin); root.renderOrder = 2; this.group.add(root);
      if (ex.apico && !gone) { const rf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshStandardMaterial({ color: 0xf4f1e8, emissive: 0x8a8578, emissiveIntensity: 0.3, transparent: true, depthTest: false })); rf.position.copy(curve.getPointAt(0.97)); rf.renderOrder = 11; this.group.add(rf); }
      const k = r.canals.length || 1;
      if (canals) r.canals.forEach((c, j) => {
        const off = k === 1 ? 0 : (j / (k - 1) - 0.5) * rr * 0.9;
        const ax = isC ? off : 0, az = isC ? 0 : off;
        const cc = new THREE.CatmullRomCurve3(curve.points.map((pt, q) => new THREE.Vector3(pt.x * (q === 2 ? 0.97 : 1) + ax * (1 - q * 0.35), q === 0 ? pt.y + 0.4 : q === 2 ? pt.y + 1.1 : pt.y, pt.z * (q === 2 ? 0.97 : 1) + az * (1 - q * 0.35))));
        const canalOk = obt && (opts.all || c.wl);
        const tube = new THREE.Mesh(taperedTube(cc, canalOk ? 0.36 : 0.3, canalOk ? 0.36 : 0.3, 0.3, 48, 14), canalOk ? filled : pulp);
        tube.renderOrder = 10; this.group.add(tube);
        if (r.lateral && j === 0) {
          const fr = { koronowa: 0.25, srodkowa: 0.55, wierzcholkowa: 0.82, delta: 0.95 }[r.lateral] || 0.6;
          const a = cc.getPointAt(fr), dir = new THREE.Vector3(rx || 1, 0, rz || 0.3).normalize();
          const lc = new THREE.CatmullRomCurve3([a, a.clone().add(dir.clone().multiplyScalar(rr * 0.6)).add(new THREE.Vector3(0, -0.4, 0)), a.clone().add(dir.multiplyScalar(rr * 1.05)).add(new THREE.Vector3(0, -0.9, 0))]);
          const lm = new THREE.Mesh(taperedTube(lc, 0.16, 0.16, 0.5, 16, 10), lateral); lm.renderOrder = 10; this.group.add(lm);
        }
      });
    });
    this.frame(ti);
  }
  /** What other specialties did to the tooth: fillings, crowns and veneers, post, gingiva, sealant, pulpotomy. */
  extras(ti, W, D, H, L, ex, crown) {
    const add = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, order = 4) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.renderOrder = order; this.group.add(m); return m; };
    const blob = new THREE.SphereGeometry(1, 40, 24);
    const composite = new THREE.MeshPhysicalMaterial({ color: 0x9fb2ff, emissive: 0x3349e0, emissiveIntensity: 0.5, roughness: 0.18, clearcoat: 1 });
    const temp = new THREE.MeshStandardMaterial({ color: 0xf1e9d2, roughness: 0.7 });
    const surfAt = { O: [0, H * 0.97, 0, W * 0.27, 0.55, D * 0.25], I: [0, H * 0.97, 0, W * 0.3, 0.5, D * 0.18], M: [-W * 0.47, H * 0.62, 0, 0.42, H * 0.24, D * 0.26], D: [W * 0.47, H * 0.62, 0, 0.42, H * 0.24, D * 0.26],
      V: [0, H * 0.55, D * 0.46, W * 0.26, H * 0.22, 0.6], B: [0, H * 0.55, D * 0.46, W * 0.26, H * 0.22, 0.6], L: [0, H * 0.55, -D * 0.46, W * 0.26, H * 0.22, 0.6], P: [0, H * 0.55, -D * 0.46, W * 0.26, H * 0.22, 0.6] };
    for (const f of ex.fill || []) { const a = surfAt[f]; if (a) add(blob, composite, a[0], a[1], a[2], a[3], a[4], a[5]); }
    if (ex.tempFill) add(blob, temp, 0, H * 0.97, 0, W * 0.25, 0.5, D * 0.23);
    if (ex.seal) add(blob, new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, roughness: 0.1, clearcoat: 1, emissive: 0xffb27a, emissiveIntensity: 0.12 }), 0, H * 0.99, 0, W * 0.3, 0.35, D * 0.28);
    if (ex.sdf) add(blob, new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.5 }), W * 0.12, H * 0.98, 0, W * 0.1, 0.3, D * 0.1);
    if (ex.crown) {
      const k = ex.crown;
      const mat = k === 'steel' ? new THREE.MeshPhysicalMaterial({ color: 0xc9ced6, metalness: 1, roughness: 0.22, clearcoat: 0.4 })
        : k === 'temp' ? new THREE.MeshPhysicalMaterial({ color: 0xf2e6c6, roughness: 0.45, clearcoat: 0.3 })
        : new THREE.MeshPhysicalMaterial({ color: 0xfdfdf9, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.4, sheenColor: new THREE.Color(0xd9ccff) });
      if (k === 'veneer') add(blob, mat, 0, H * 0.55, D * 0.42, W * 0.5, H * 0.47, 0.9, 5);
      else if (k === 'inlay') add(blob, mat, 0, H * 0.95, 0, W * 0.36, 0.9, D * 0.34, 5);
      else { crown.material = mat; crown.scale.setScalar(1.03); }
      if (k !== 'inlay' && k !== 'veneer') add(new THREE.TorusGeometry(1, 0.06, 10, 64), new THREE.MeshStandardMaterial({ color: 0xbba3ff, emissive: 0x8a6af0, emissiveIntensity: 0.6 }), 0, 0.15, 0, W * 0.47, D * 0.47, 1, 6).rotation.x = Math.PI / 2;
    }
    if (ex.post) { const m = add(new THREE.CylinderGeometry(0.42, 0.3, L * 0.6, 20), new THREE.MeshStandardMaterial({ color: 0xb9c0c9, metalness: 0.9, roughness: 0.3, transparent: true, depthTest: false }), 0, H * 0.25 - L * 0.3, 0, 1, 1, 1, 11); m.renderOrder = 11; }
    if (ex.pulpotomy) add(blob, new THREE.MeshStandardMaterial({ color: 0xf5efe3, emissive: 0x9c8f78, emissiveIntensity: 0.3, transparent: true, depthTest: false }), 0, H * 0.2, 0, W * 0.17, H * 0.1, D * 0.15, 11);
    if (ex.gum) {
      // gingiva as a soft sleeve around the neck (lower after a recession)
      const top = ex.gum === 'recession' ? -2.2 : -0.4, h = 4;
      const g = add(new THREE.CylinderGeometry(1, 1.08, h, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xe0707f, roughness: 0.55, transparent: true, opacity: 0.82, side: THREE.DoubleSide, sheen: 0.5, sheenColor: new THREE.Color(0xffc0c8) }), 0, top - h / 2, 0, W * 0.56, 1, D * 0.56, 5);
      g.renderOrder = 5;
    }
  }
  /** Implant: threaded titanium body, abutment and either a crown or a healing cap. */
  implant(ti, W, D, H, L, opts) {
    const ti_ = new THREE.MeshPhysicalMaterial({ color: 0xb8c0c8, metalness: 1, roughness: 0.32, clearcoat: 0.3 });
    const R = Math.min(2.3, Math.max(1.6, Math.min(W, D) * 0.2)), len = Math.min(L * 0.85, 12), pitch = 0.8, pts = [];
    // profile from the platform (y = 0) down to a rounded apex, with a saw-tooth thread
    for (let y = 0; y <= len; y += 0.05) {
      const taper = y > len * 0.7 ? 1 - 0.35 * ((y - len * 0.7) / (len * 0.3)) : 1;
      const thread = y > 0.6 && y < len - 0.4 ? 0.32 * (1 - ((y % pitch) / pitch)) : 0;
      pts.push(new THREE.Vector2((R + thread) * taper, -y));
    }
    pts.push(new THREE.Vector2(R * 0.45, -len - 0.25), new THREE.Vector2(0, -len - 0.35));
    pts.unshift(new THREE.Vector2(0, 0));
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), ti_); this.group.add(body);
    if (opts.crown) {
      const abut = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.7, R * 0.95, 2.2, 48), ti_); abut.position.y = 1.1; this.group.add(abut);
      const enamel = new THREE.MeshPhysicalMaterial({ color: 0xfff8ec, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, transmission: 0.1, thickness: 4, ior: 1.62, sheen: 0.5, sheenColor: new THREE.Color(0xbfefff) });
      const crown = new THREE.Mesh(crownGeometry(ti, W, D, H), enamel); crown.position.y = 1.4 + H / 2; this.group.add(crown);
    } else {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.05, R * 1.05, 1.6, 48), ti_); cap.position.y = 0.8; this.group.add(cap);
    }
    this.frame(ti);
  }
  frame(ti) {
    // upper teeth: roots up, as in the mouth; centre the model and frame it
    this.group.rotation.set(ti.upper ? Math.PI : 0, 0, 0); this.group.position.set(0, 0, 0); this.group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.group), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
    this.group.position.sub(c);
    this.fitSize = size.clone();
    this.fit(true);
  }
  /** Frame the whole tooth for the current panel shape (vertical and horizontal field of view). */
  fit(resetView = false) {
    if (!this.fitSize) return;
    const size = this.fitSize, vt = Math.tan((this.camera.fov * Math.PI) / 360), ht = vt * Math.max(0.3, this.camera.aspect);
    const radius = Math.max(size.x, size.z) * 0.75; // rotating: the widest side faces the camera at some point
    const dist = Math.max((size.y / 2) / vt, radius / ht) * 1.35;
    if (resetView || !this.dist) this.camera.position.set(dist * 0.55, dist * 0.12, dist * 0.84);
    else this.camera.position.multiplyScalar(dist / this.camera.position.length());
    this.dist = dist; this.controls.target.set(0, 0, 0);
    this.controls.minDistance = dist * 0.8; this.controls.maxDistance = dist * 1.8; this.controls.update();
  }
  snapshot() { return this.renderer.domElement.toDataURL('image/png'); }
  dispose() {
    this.dead = true; cancelAnimationFrame(this.raf); this.ro.disconnect(); this.controls.dispose();
    for (const c of this.group.children) { c.geometry?.dispose(); c.material?.dispose(); }
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}

// three.js (r163+) needs WebGL 2 — a WebGL 1-only machine must get the 2D drawing instead
export function webglOk() { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl2'); if (!gl) return false; gl.getExtension('WEBGL_lose_context')?.loseContext(); return true; } catch { return false; } }
/** true when the 3D view really drew something (some GPUs give a context but render nothing) */
export function drewSomething(t3d) {
  try {
    const src = t3d.renderer.domElement; if (!src.width || !src.height) return false;
    const c = document.createElement('canvas'); c.width = 48; c.height = 48; const x = c.getContext('2d');
    x.drawImage(src, 0, 0, 48, 48); const d = x.getImageData(0, 0, 48, 48).data;
    // the tooth is light, the background dark: some bright pixels must be there
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 420) n++;
    return n > 6;
  } catch { return false; }
}

/* Cloud sync through the claude.ai artifact "db" capability.
   Each signed-in account gets a private area (data/users/<id>/…) that no one else can read.
   Local storage stays the source for instant use; changes are pushed a few seconds later and merged
   when another device (same claude.ai login) has made progress. Works offline: syncs when back. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;

  const C = (LA.cloud = { status: 'local', detail: '', uid: null, lastSync: 0 });
  let db = null;
  const listeners = [];
  const lastWritten = {}; // doc path -> JSON string
  const writing = {}; // doc path -> promise
  const unsub = [];
  let pendingScopes = new Set();

  C.onStatus = (fn) => listeners.push(fn);
  function setStatus(s, detail) { C.status = s; C.detail = detail || ''; listeners.forEach((fn) => { try { fn(s); } catch (e) { /* ignore */ } }); }

  const mainPath = () => `data/users/${C.uid}/main`;
  const progPath = (pid) => `data/users/${C.uid}/p_${pid}`;
  const handPath = (pid) => `data/users/${C.uid}/h_${pid}`;
  C.handPath = handPath;
  C.available = () => !!(db && C.uid);
  C.db = () => db;

  /* ---------- merging ---------- */
  function byAt(a, b) { return (a && a.at) || 0; }
  function unionBy(a, b, keyFn, cap) {
    const m = new Map();
    (a || []).concat(b || []).forEach((x) => { const k = keyFn(x); if (!m.has(k)) m.set(k, x); });
    const arr = [...m.values()].sort((x, y) => (x.at || x.createdAt || 0) - (y.at || y.createdAt || 0));
    return cap ? arr.slice(-cap) : arr;
  }
  C.mergeProgress = function (L, R) {
    if (!L) return R;
    if (!R) return L;
    const out = S.blankProgress();
    // lessons: keep any completion; prefer the earliest completion record
    out.lessons = Object.assign({}, R.lessons, L.lessons);
    Object.keys(R.lessons || {}).forEach((k) => { if (L.lessons[k] && R.lessons[k] && R.lessons[k].done && !L.lessons[k].done) out.lessons[k] = R.lessons[k]; });
    // chapters
    const ck = new Set(Object.keys(L.chapters || {}).concat(Object.keys(R.chapters || {})));
    ck.forEach((k) => {
      const a = (L.chapters || {})[k], b = (R.chapters || {})[k];
      if (!a || !b) { out.chapters[k] = a || b; return; }
      out.chapters[k] = { passed: a.passed || b.passed, best: Math.max(a.best || 0, b.best || 0), via: a.passed ? a.via : b.via, passedAt: a.passedAt || b.passedAt, attempts: unionBy(a.attempts, b.attempts, (x) => x.at + ':' + x.score, 20) };
    });
    // skills: the record with more answers wins
    const sk = new Set(Object.keys(L.skills || {}).concat(Object.keys(R.skills || {})));
    sk.forEach((k) => { const a = (L.skills || {})[k], b = (R.skills || {})[k]; out.skills[k] = !a ? b : !b ? a : (a.n >= b.n ? a : b); });
    // remediation: union, done if done anywhere
    const rem = new Map();
    (L.remediation || []).concat(R.remediation || []).forEach((r) => { const e = rem.get(r.id); if (!e) rem.set(r.id, Object.assign({}, r)); else if (r.done && !e.done) rem.set(r.id, Object.assign({}, r)); });
    out.remediation = [...rem.values()];
    // homework plans per day: union of items, done if done anywhere
    const days = new Set(Object.keys(L.homework || {}).concat(Object.keys(R.homework || {})));
    days.forEach((d) => {
      const a = (L.homework || {})[d], b = (R.homework || {})[d];
      if (!a || !b) { out.homework[d] = a || b; return; }
      const items = a.items.map((it) => { const o = b.items.find((x) => x.kind === it.kind && x.ref === it.ref); return o && o.done ? Object.assign({}, it, { done: true }) : it; });
      out.homework[d] = Object.assign({}, a, { items });
    });
    out.startPoints = Object.assign({}, R.startPoints, L.startPoints);
    out.mistakes = unionBy(L.mistakes, R.mistakes, (x) => x.at + x.q, 200);
    out.log = unionBy(L.log, R.log, (x) => x.at + x.kind + x.ref, 600);
    out.writing = Object.assign({}, R.writing);
    Object.keys(L.writing || {}).forEach((k) => { if (!out.writing[k] || (L.writing[k].at || 0) >= (out.writing[k].at || 0)) out.writing[k] = L.writing[k]; });
    out.stars = Math.max(L.stars || 0, R.stars || 0);
    out.streak = (L.streak && R.streak && (L.streak.last || '') >= (R.streak.last || '')) ? L.streak : (R.streak || L.streak);
    // homework sets: done wins
    const hw = new Set(Object.keys(L.hwSets || {}).concat(Object.keys(R.hwSets || {})));
    hw.forEach((k) => { const a = (L.hwSets || {})[k], b = (R.hwSets || {})[k]; out.hwSets[k] = !a ? b : !b ? a : a.status === 'done' ? a : b.status === 'done' ? b : a; });
    // spelling: keep the bigger counts
    const sp = new Set(Object.keys(L.spelling || {}).concat(Object.keys(R.spelling || {})));
    sp.forEach((k) => { const a = (L.spelling || {})[k], b = (R.spelling || {})[k]; out.spelling[k] = !a ? b : !b ? a : ((a.last || 0) >= (b.last || 0) ? a : b); });
    const ch = new Set(Object.keys(L.challenges || {}).concat(Object.keys(R.challenges || {})));
    ch.forEach((k) => { const a = (L.challenges || {})[k], b = (R.challenges || {})[k]; out.challenges[k] = !a ? b : !b ? a : { best: Math.max(a.best, b.best), passed: a.passed || b.passed, at: Math.max(a.at || 0, b.at || 0) }; });
    const ex = new Set(Object.keys(L.exams || {}).concat(Object.keys(R.exams || {})));
    ex.forEach((k) => { out.exams[k] = unionBy((L.exams || {})[k], (R.exams || {})[k], (x) => x.at, 20); });
    const dd = new Set(Object.keys(L.daily || {}).concat(Object.keys(R.daily || {})));
    dd.forEach((d) => { const a = (L.daily || {})[d] || {}, b = (R.daily || {})[d] || {}; out.daily[d] = { lessons: Math.max(a.lessons || 0, b.lessons || 0), correct: Math.max(a.correct || 0, b.correct || 0), answered: Math.max(a.answered || 0, b.answered || 0), hw: Math.max(a.hw || 0, b.hw || 0) }; });
    out.updatedAt = Math.max(L.updatedAt || 0, R.updatedAt || 0);
    return out;
  };

  function mergeMain(local, remote) {
    // profiles: union by id (remote edits win when newer)
    const newer = (remote.updatedAt || 0) > (local.updatedAt || 0);
    const ids = new Map();
    (newer ? remote.profiles.concat(local.profiles) : local.profiles.concat(remote.profiles)).forEach((p) => { if (!ids.has(p.id)) ids.set(p.id, p); });
    const deleted = new Set([].concat(local.deleted || [], remote.deleted || []));
    const profiles = [...ids.values()].filter((p) => !deleted.has(p.id));
    const settings = Object.assign({}, newer ? Object.assign({}, local.settings, remote.settings) : Object.assign({}, remote.settings, local.settings));
    settings.apiKey = local.settings.apiKey; // the key never leaves this device
    return { profiles, settings, active: local.active || remote.active, updatedAt: Math.max(local.updatedAt || 0, remote.updatedAt || 0), deleted: [...deleted].slice(-50) };
  }

  /* keep a progress document comfortably under the 256 KiB limit */
  function compact(P) {
    const p = JSON.parse(JSON.stringify(P));
    let size = JSON.stringify(p).length;
    if (size < 200000) return p;
    p.mistakes = (p.mistakes || []).slice(-80);
    p.log = (p.log || []).slice(-250);
    const days = Object.keys(p.homework || {}).sort();
    days.slice(0, Math.max(0, days.length - 14)).forEach((d) => delete p.homework[d]);
    Object.keys(p.writing || {}).forEach((k) => { if (p.writing[k].text) p.writing[k].text = p.writing[k].text.slice(0, 1500); });
    size = JSON.stringify(p).length;
    if (size > 230000) {
      const wk = Object.keys(p.writing || {}).sort((a, b) => (p.writing[b].at || 0) - (p.writing[a].at || 0));
      wk.slice(25).forEach((k) => delete p.writing[k]);
      p.remediation = (p.remediation || []).filter((r) => !r.done).slice(-80);
    }
    return p;
  }

  /* ---------- writing ---------- */
  async function writeDoc(path, body) {
    const json = JSON.stringify(body);
    if (lastWritten[path] === json) return;
    while (writing[path]) { try { await writing[path]; } catch (e) { /* ignore */ } }
    const p = (async () => {
      try { await db.doc(path).set(body); }
      catch (e) {
        if (e && e.code === 'unavailable') { await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200)); await db.doc(path).set(body); }
        else throw e;
      }
    })();
    writing[path] = p;
    try { await p; lastWritten[path] = json; } finally { writing[path] = null; }
  }

  const flush = U.debounce(async () => {
    if (!C.available()) return;
    const scopes = pendingScopes;
    pendingScopes = new Set();
    const st = S.state();
    setStatus('syncing');
    try {
      if (scopes.has('main') || scopes.has('all') || scopes.has('flush')) {
        const settings = Object.assign({}, st.settings, { apiKey: '' });
        await writeDoc(mainPath(), { profiles: st.profiles, settings, active: st.active, updatedAt: st.updatedAt || Date.now(), deleted: st.deleted || [], v: 2 });
      }
      const ids = scopes.has('all') || scopes.has('flush') ? st.profiles.map((p) => p.id) : st.active ? [st.active] : [];
      for (const id of ids) if (st.progress[id]) await writeDoc(progPath(id), { progress: compact(st.progress[id]), updatedAt: st.progress[id].updatedAt || Date.now(), v: 2 });
      C.lastSync = Date.now();
      setStatus('synced');
    } catch (e) {
      console.warn('Cloud save failed', e);
      if (e && e.code === 'quota_exceeded') setStatus('error', 'Cloud storage is full. Old history will be trimmed automatically.');
      else if (e && (e.code === 'invalid_argument')) setStatus('error', 'This account can view but not save. Ask the owner to give you Contributor access.');
      else if (e && e.code === 'revoked') { setStatus('local', 'Cloud access ended for this visit. Progress is saved on this device.'); db = null; }
      else setStatus('offline', 'Saved on this device. It will upload when the connection is back.');
      scopes.forEach((s) => pendingScopes.add(s));
    }
  }, 2500);

  S.onChange((scope) => {
    if (!C.available()) return;
    pendingScopes.add(scope);
    if (scope === 'flush') flush.flush(); else flush();
  });
  window.addEventListener('online', () => { if (C.available() && pendingScopes.size) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && C.available() && pendingScopes.size) flush.flush(); });

  /* ---------- reading ---------- */
  function applyRemoteMain(remote) {
    if (!remote) return false;
    const st = S.state();
    const merged = mergeMain(st, remote);
    const before = JSON.stringify([st.profiles, st.settings, st.active]);
    st.profiles = merged.profiles.map((p) => Object.assign({ au: { year: 3, on: true }, pl: { year: 3, on: true } }, p));
    st.settings = Object.assign({}, st.settings, merged.settings);
    st.active = st.profiles.some((p) => p.id === merged.active) ? merged.active : (st.profiles[0] || {}).id || null;
    st.updatedAt = merged.updatedAt;
    st.deleted = merged.deleted;
    st.profiles.forEach((p) => { if (!st.progress[p.id]) st.progress[p.id] = S.blankProgress(); });
    S.replaceState(st);
    return before !== JSON.stringify([st.profiles, st.settings, st.active]);
  }
  function applyRemoteProgress(pid, remote) {
    if (!remote) return false;
    const st = S.state();
    const local = st.progress[pid];
    const merged = C.mergeProgress(local, remote);
    const changed = JSON.stringify(local) !== JSON.stringify(merged);
    st.progress[pid] = merged;
    S.replaceState(st);
    return changed;
  }

  C.init = async function (onRemoteChange) {
    if (!window.claude || typeof window.claude.use !== 'function') { setStatus('local', 'Saved on this device only. Open the app from claude.ai to back it up to the cloud.'); return false; }
    setStatus('syncing', 'Connecting…');
    try {
      const [dbNs, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!dbNs || !user) { setStatus('local', 'Saved on this device only (cloud not available here).'); return false; }
      const id = await user.id();
      if (!id) { setStatus('local', 'Sign in to claude.ai to back up progress to the cloud.'); return false; }
      db = dbNs;
      C.uid = id;
      const mainSnap = await db.doc(mainPath()).get();
      let changed = false;
      if (mainSnap.exists) changed = applyRemoteMain(mainSnap.data()) || changed;
      const st = S.state();
      for (const p of st.profiles) {
        const snap = await db.doc(progPath(p.id)).get();
        if (snap.exists) changed = applyRemoteProgress(p.id, snap.data().progress) || changed;
      }
      // push whatever this device has that the cloud doesn't
      pendingScopes.add('all');
      flush.flush();
      // live updates from other devices
      unsub.push(db.doc(mainPath()).onSnapshot((snap) => {
        if (!snap.exists || snap.metadata.hasPendingWrites) return;
        const d = snap.data();
        if (JSON.stringify(d) === lastWritten[mainPath()]) return;
        if (applyRemoteMain(d) && onRemoteChange) onRemoteChange('main');
      }, () => {}));
      const watchProgress = () => {
        const pid = S.state().active;
        if (!pid) return;
        unsub.push(db.doc(progPath(pid)).onSnapshot((snap) => {
          if (!snap.exists || snap.metadata.hasPendingWrites) return;
          const d = snap.data();
          if (JSON.stringify(d) === lastWritten[progPath(pid)]) return;
          if (applyRemoteProgress(pid, d.progress) && onRemoteChange) onRemoteChange('progress');
        }, () => {}));
      };
      watchProgress();
      C.rewatch = () => { while (unsub.length > 1) { try { unsub.pop()(); } catch (e) { /* ignore */ } } watchProgress(); };
      setStatus('synced');
      return changed;
    } catch (e) {
      console.warn('Cloud init failed', e);
      setStatus('local', 'Saved on this device. Cloud backup is not available right now.');
      return false;
    }
  };

  /* Handwriting samples live in their own document so they never crowd out progress */
  C.loadHand = async (pid) => {
    if (!C.available()) return null;
    try { const s = await db.doc(handPath(pid)).get(); return s.exists ? s.data() : null; } catch (e) { return null; }
  };
  C.saveHand = async (pid, body) => { if (C.available()) { try { await writeDoc(handPath(pid), body); } catch (e) { console.warn('hand save', e); } } };
})();

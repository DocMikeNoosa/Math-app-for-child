/* Cloud sync with your own Firebase project (Authentication + Cloud Firestore).
   One family account (email + password) signs in on every device: iPad, computer, phone.
   The device copy is always the source for instant use (works offline); changes upload a few seconds later
   and are MERGED with other devices — finished work is never overwritten or lost.
   Extra safety: a dated backup copy is written to the cloud every day (kept 60 days), on top of the
   on-device snapshots kept by backup.js and the backup files a parent can save. */
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

  const base = () => `families/${C.uid}`;
  const mainPath = () => `${base()}/docs/main`;
  const progPath = (pid) => `${base()}/docs/p_${pid}`;
  const handPath = (pid) => `${base()}/docs/h_${pid}`;
  const secretPath = () => `${base()}/docs/secret`;
  C.handPath = handPath;
  C.available = () => !!(db && C.uid);
  C.db = () => db;
  C.user = null; // { email }
  let auth = null;
  let fb = null;
  /* Documents are stored as one JSON string — avoids Firestore's limits on nested arrays/undefined values. */
  const pack = (body) => ({ json: JSON.stringify(body), at: Date.now() });
  const unpack = (snap) => { if (!snap || !snap.exists) return null; const d = snap.data(); try { return d && d.json ? JSON.parse(d.json) : d; } catch (e) { return null; } };

  /* content signature independent of key order */
  const stable = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, kk) => { o[kk] = x[kk]; return o; }, {}) : x));
  C.stable = stable;

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
    settings.apiKey = local.settings.apiKey; // the key travels separately (secret doc), never inside main
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
  /* Firestore keeps a queued write while offline and delivers it later; we don't wait forever for it. */
  async function writeDoc(path, body) {
    const json = JSON.stringify(body);
    if (lastWritten[path] === json) return;
    const p = db.doc(path).set({ json, at: Date.now() });
    p.then(() => { lastWritten[path] = json; }, () => {});
    let timer;
    const slow = new Promise((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error('offline'), { code: 'unavailable' })), 10000); });
    try { await Promise.race([p, slow]); } finally { clearTimeout(timer); }
  }
  /* Read the cloud copy first and merge it in, so a device never uploads over work it hasn't seen yet. */
  async function mergeFromServer(path, apply) {
    try {
      const snap = await db.doc(path).get({ source: 'server' });
      const v = unpack(snap);
      if (v) apply(v);
    } catch (e) { /* offline: the queued write is merged by the other devices when they see it */ }
  }

  const flush = U.debounce(async () => {
    if (!C.available()) return;
    const scopes = pendingScopes;
    pendingScopes = new Set();
    const st = S.state();
    setStatus('syncing');
    try {
      if (scopes.has('main') || scopes.has('all') || scopes.has('flush')) {
        await mergeFromServer(mainPath(), (v) => applyRemoteMain(v, true));
        const settings = Object.assign({}, st.settings, { apiKey: '' });
        await writeDoc(mainPath(), { profiles: st.profiles, settings, active: st.active, updatedAt: st.updatedAt || Date.now(), deleted: st.deleted || [], v: 3 });
        if (st.settings.apiKey !== undefined) await writeDoc(secretPath(), { apiKey: st.settings.apiKey || '', model: st.settings.model || '' });
      }
      const ids = scopes.has('all') || scopes.has('flush') ? st.profiles.map((p) => p.id) : st.active ? [st.active] : [];
      for (const id of ids) {
        if (!st.progress[id]) continue;
        await mergeFromServer(progPath(id), (v) => applyRemoteProgress(id, v.progress, true));
        const cur = S.state().progress[id];
        await writeDoc(progPath(id), { progress: compact(cur), updatedAt: cur.updatedAt || Date.now(), v: 3 });
      }
      C.lastSync = Date.now();
      setStatus('synced');
      dailyCloudBackup();
    } catch (e) {
      console.warn('Cloud save failed', e);
      if (e && e.code === 'permission-denied') setStatus('error', 'The cloud refused the save (check the Firestore rules in the setup guide). Work is safe on this device.');
      else if (e && e.code === 'resource-exhausted') setStatus('error', 'Cloud quota reached for today. Work is safe on this device and will upload later.');
      else setStatus('offline', 'Saved on this device. It will upload when the connection is back.');
      scopes.forEach((s) => pendingScopes.add(s));
      setTimeout(() => { if (pendingScopes.size && C.available()) flush(); }, 20000);
    }
  }, 2500);

  S.onChange((scope) => {
    if (!C.available()) return;
    pendingScopes.add(scope);
    if (scope === 'flush') flush.flush(); else flush();
  });
  window.addEventListener('online', () => { if (C.available() && pendingScopes.size) flush(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && C.available() && pendingScopes.size) flush.flush(); });
  window.addEventListener('pagehide', () => { if (C.available() && pendingScopes.size) flush.flush(); });

  /* ---------- daily dated backup in the cloud (kept 60 days) ---------- */
  let backedUpDay = '';
  async function dailyCloudBackup(force) {
    if (!C.available()) return;
    const day = U.todayKey();
    if (!force && backedUpDay === day) return;
    backedUpDay = day;
    try {
      const st = S.state();
      const col = db.collection(`${base()}/backups`);
      await col.doc(`${day}_main`).set(pack({ profiles: st.profiles, settings: Object.assign({}, st.settings, { apiKey: '' }), active: st.active, deleted: st.deleted || [] }));
      for (const p of st.profiles) if (st.progress[p.id]) await col.doc(`${day}_p_${p.id}`).set(pack(compact(st.progress[p.id])));
      // prune copies older than 60 days
      const cutoff = U.todayKey(new Date(Date.now() - 60 * 86400000));
      const old = await col.where(fb.firestore.FieldPath.documentId(), '<', cutoff).limit(50).get();
      old.forEach((d) => d.ref.delete().catch(() => {}));
    } catch (e) { console.warn('cloud backup', e); backedUpDay = ''; }
  }
  C.backupNow = () => dailyCloudBackup(true);
  /* List the dated cloud backups (newest first) */
  C.listBackups = async () => {
    if (!C.available()) return [];
    const snap = await db.collection(`${base()}/backups`).get();
    const days = new Set();
    snap.forEach((d) => days.add(d.id.slice(0, 10)));
    return [...days].sort().reverse();
  };
  /* Bring back a dated cloud backup by MERGING it in (nothing current is thrown away) */
  C.restoreBackup = async (day) => {
    const snap = await db.collection(`${base()}/backups`).where(fb.firestore.FieldPath.documentId(), '>=', day).where(fb.firestore.FieldPath.documentId(), '<', day + '~').get();
    let main = null; const progs = {};
    snap.forEach((d) => { const v = unpack(d); if (d.id.endsWith('_main')) main = v; else progs[d.id.split('_p_')[1]] = v; });
    if (LA.backup) await LA.backup.snapshot('before-restore');
    if (main) applyRemoteMain(Object.assign({ updatedAt: 0 }, main));
    Object.keys(progs).forEach((pid) => { const st = S.state(); if (!st.progress[pid]) st.progress[pid] = S.blankProgress(); applyRemoteProgress(pid, progs[pid]); });
    S.saveMain(); S.saveNow();
    return Object.keys(progs).length;
  };

  /* ---------- reading ---------- */
  const extraVsRemoteMain = (st, remote) => JSON.stringify(st.profiles.map((p) => p.id).sort()) !== JSON.stringify((remote.profiles || []).map((p) => p.id).sort());
  function applyRemoteMain(remote, quiet) {
    if (!remote) return false;
    const st = S.state();
    const localHasMore = extraVsRemoteMain(st, remote);
    const merged = mergeMain(st, remote);
    const before = JSON.stringify([st.profiles, st.settings, st.active]);
    st.profiles = merged.profiles.map((p) => Object.assign({ au: { year: 3, on: true }, pl: { year: 3, on: true } }, p));
    st.settings = Object.assign({}, st.settings, merged.settings);
    st.active = st.profiles.some((p) => p.id === merged.active) ? merged.active : (st.profiles[0] || {}).id || null;
    st.updatedAt = merged.updatedAt;
    st.deleted = merged.deleted;
    st.profiles.forEach((p) => { if (!st.progress[p.id]) st.progress[p.id] = S.blankProgress(); });
    S.replaceState(st);
    if (!quiet && localHasMore && C.available()) { pendingScopes.add('main'); flush(); }
    return before !== JSON.stringify([st.profiles, st.settings, st.active]);
  }
  function applyRemoteProgress(pid, remote, quiet) {
    if (!remote) return false;
    const st = S.state();
    const local = st.progress[pid];
    const merged = C.mergeProgress(local, remote);
    const changed = JSON.stringify(local) !== JSON.stringify(merged);
    st.progress[pid] = merged;
    S.replaceState(st);
    // this device knew things the cloud copy didn't → upload the merged result so every device converges
    if (!quiet && C.available() && stable(compact(merged)) !== stable(compact(remote))) { pendingScopes.add('all'); flush(); }
    return changed;
  }

  /* ---------- Firebase loading ---------- */
  const FB_VER = '10.14.1';
  const loadScript = (src) => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(s); });
  C.config = () => {
    const fromFile = window.LA_CONFIG && window.LA_CONFIG.firebase;
    if (fromFile && fromFile.apiKey) return fromFile;
    try { const t = localStorage.getItem('aus-learn.firebase'); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  };
  C.setConfig = (cfg) => { try { if (cfg) localStorage.setItem('aus-learn.firebase', JSON.stringify(cfg)); else localStorage.removeItem('aus-learn.firebase'); } catch (e) { /* ignore */ } };
  C.configured = () => !!C.config();

  let onRemote = null;
  C.init = async function (onRemoteChange) {
    onRemote = onRemoteChange;
    const cfg = C.config();
    if (!cfg) { setStatus('local', 'Saved on this device. Cloud sync is not set up yet (Parent → Cloud & backup).'); return false; }
    if (location.protocol === 'file:') { setStatus('local', 'Saved on this device. Cloud sync needs the app’s web address (not a local file).'); return false; }
    setStatus('syncing', 'Connecting…');
    try {
      if (!window.firebase) {
        const b = `https://www.gstatic.com/firebasejs/${FB_VER}/`;
        await loadScript(b + 'firebase-app-compat.js');
        await Promise.all([loadScript(b + 'firebase-auth-compat.js'), loadScript(b + 'firebase-firestore-compat.js')]);
      }
      fb = window.firebase;
      if (!fb.apps.length) fb.initializeApp(cfg);
      auth = fb.auth();
      const fs = fb.firestore();
      if (cfg.emulator) { auth.useEmulator('http://127.0.0.1:9099', { disableWarnings: true }); fs.useEmulator('127.0.0.1', 8080); } // automated tests only
      try { await fs.enablePersistence({ synchronizeTabs: true }); } catch (e) { /* another tab or unsupported — fine */ }
      return await new Promise((resolve) => {
        let first = true;
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            C.user = { email: user.email, uid: user.uid };
            const changed = await connect(fs, user.uid);
            if (!first && onRemote) onRemote('signin');
            if (first) { first = false; resolve(changed); }
          } else {
            disconnect();
            C.user = null;
            setStatus('signedout', 'Not signed in — work is saved on this device only.');
            if (!first && onRemote) onRemote('signout');
            if (first) { first = false; resolve(false); }
          }
        });
      });
    } catch (e) {
      console.warn('Cloud init failed', e);
      setStatus('offline', 'Saved on this device. Cloud not reachable right now — it will connect next time.');
      return false;
    }
  };

  function disconnect() { while (unsub.length) { try { unsub.pop()(); } catch (e) { /* ignore */ } } db = null; C.uid = null; }

  async function connect(fs, uid) {
    disconnect();
    db = fs;
    C.uid = uid;
    let changed = false;
    try {
      if (LA.backup) await LA.backup.snapshot('before-sync');
      const mainSnap = await db.doc(mainPath()).get();
      const remoteMain = unpack(mainSnap);
      if (remoteMain) changed = applyRemoteMain(remoteMain) || changed;
      const sec = unpack(await db.doc(secretPath()).get());
      if (sec && sec.apiKey && !S.settings().apiKey) { S.state().settings.apiKey = sec.apiKey; if (sec.model) S.state().settings.model = sec.model; changed = true; }
      for (const p of S.state().profiles) {
        const r = unpack(await db.doc(progPath(p.id)).get());
        if (r) changed = applyRemoteProgress(p.id, r.progress) || changed;
      }
      S.saveMain();
      pendingScopes.add('all');
      flush.flush();
      unsub.push(db.doc(mainPath()).onSnapshot((snap) => {
        if (!snap.exists || snap.metadata.hasPendingWrites) return;
        const d = snap.data();
        if (d.json === lastWritten[mainPath()]) return;
        if (applyRemoteMain(unpack(snap)) && onRemote) onRemote('main');
      }, () => {}));
      const watchProgress = () => {
        const pid = S.state().active;
        if (!pid) return;
        unsub.push(db.doc(progPath(pid)).onSnapshot((snap) => {
          if (!snap.exists || snap.metadata.hasPendingWrites) return;
          const d = snap.data();
          if (d.json === lastWritten[progPath(pid)]) return;
          const v = unpack(snap);
          if (v && applyRemoteProgress(pid, v.progress) && onRemote) onRemote('progress');
        }, () => {}));
      };
      watchProgress();
      C.rewatch = () => { while (unsub.length > 1) { try { unsub.pop()(); } catch (e) { /* ignore */ } } watchProgress(); };
      setStatus('synced');
    } catch (e) {
      console.warn('connect', e);
      setStatus(e && e.code === 'permission-denied' ? 'error' : 'offline', e && e.code === 'permission-denied' ? 'The cloud refused access — check the Firestore rules (setup guide).' : 'Saved on this device. Will sync when online.');
    }
    return changed;
  }

  /* ---------- account ---------- */
  const authErr = (e) => {
    const m = { 'auth/invalid-email': 'That email address doesn’t look right.', 'auth/user-not-found': 'No account with that email — create one first.', 'auth/wrong-password': 'Wrong password.', 'auth/invalid-credential': 'Email or password is not right.', 'auth/invalid-login-credentials': 'Email or password is not right.', 'auth/email-already-in-use': 'An account with that email already exists — sign in instead.', 'auth/weak-password': 'Use at least 6 characters for the password.', 'auth/network-request-failed': 'No internet connection.', 'auth/too-many-requests': 'Too many tries — wait a minute and try again.', 'auth/operation-not-allowed': 'Email sign-in is not switched on in Firebase (see setup guide).' };
    return new Error(m[e && e.code] || (e && e.message) || 'Sign-in failed');
  };
  C.signIn = async (email, pw) => { if (!auth) throw new Error('Cloud is not connected yet.'); try { await auth.signInWithEmailAndPassword(email.trim(), pw); } catch (e) { throw authErr(e); } };
  C.signUp = async (email, pw) => { if (!auth) throw new Error('Cloud is not connected yet.'); try { await auth.createUserWithEmailAndPassword(email.trim(), pw); } catch (e) { throw authErr(e); } };
  C.resetPassword = async (email) => { if (!auth) throw new Error('Cloud is not connected yet.'); try { await auth.sendPasswordResetEmail(email.trim()); } catch (e) { throw authErr(e); } };
  C.signOut = async () => { if (C.available() && pendingScopes.size) { try { await flush.flush(); } catch (e) { /* ignore */ } } if (auth) await auth.signOut(); };
  C.ready = () => !!auth;

  /* Handwriting samples live in their own document so they never crowd out progress */
  C.loadHand = async (pid) => {
    if (!C.available()) return null;
    try { return unpack(await db.doc(handPath(pid)).get()); } catch (e) { return null; }
  };
  C.saveHand = async (pid, body) => { if (C.available()) { try { await writeDoc(handPath(pid), body); } catch (e) { console.warn('hand save', e); } } };
})();

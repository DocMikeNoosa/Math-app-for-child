/* On-device safety net (IndexedDB), independent of localStorage and the cloud:
   - a live mirror of the current state (restored automatically if localStorage is ever emptied)
   - dated snapshots: one per day (kept 30 days) + one before every sync/restore/import (kept 20)
   Also asks the browser to treat this app's storage as persistent. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const B = (LA.backup = { ok: false });
  const DB = 'aus-learn-safe', VER = 1;
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res) => {
      if (!window.indexedDB) return res(null);
      let req;
      try { req = indexedDB.open(DB, VER); } catch (e) { return res(null); }
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('snaps')) d.createObjectStore('snaps', { keyPath: 'id' });
      };
      req.onsuccess = () => { B.ok = true; res(req.result); };
      req.onerror = () => res(null);
      req.onblocked = () => res(null);
    });
    return dbp;
  }
  const tx = async (store, mode, fn) => {
    const d = await open();
    if (!d) return null;
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const os = t.objectStore(store);
      const out = fn(os);
      t.oncomplete = () => res(out && 'result' in out ? out.result : out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  };
  const clean = (st) => Object.assign({}, st, { settings: Object.assign({}, st.settings, { apiKey: '' }) });

  /* live mirror */
  const mirrorNow = async () => { try { await tx('kv', 'readwrite', (os) => os.put(JSON.stringify(S.state()), 'current')); } catch (e) { /* ignore */ } };
  const mirror = U.debounce(mirrorNow, 2000);
  S.onChange(() => mirror());
  window.addEventListener('pagehide', () => mirror.flush && mirror.flush());
  B.loadMirror = async () => { try { const t = await tx('kv', 'readonly', (os) => os.get('current')); return t ? JSON.parse(t) : null; } catch (e) { return null; } };

  /* snapshots */
  B.snapshot = async (reason) => {
    const st = S.state();
    if (!st.profiles || !st.profiles.length) return null;
    const id = new Date().toISOString() + '|' + (reason || 'manual');
    try {
      await tx('snaps', 'readwrite', (os) => os.put({ id, at: Date.now(), reason: reason || 'manual', day: U.todayKey(), json: JSON.stringify(clean(st)) }));
      await prune();
      return id;
    } catch (e) { return null; }
  };
  async function prune() {
    const all = (await B.list()) || [];
    const daily = all.filter((s) => s.reason === 'daily');
    const other = all.filter((s) => s.reason !== 'daily');
    const drop = daily.slice(30).concat(other.slice(20));
    if (drop.length) await tx('snaps', 'readwrite', (os) => drop.forEach((s) => os.delete(s.id)));
  }
  B.list = async () => {
    try {
      const rows = await tx('snaps', 'readonly', (os) => os.getAll());
      return (rows || []).map((r) => ({ id: r.id, at: r.at, reason: r.reason, day: r.day, size: r.json.length })).sort((a, b) => b.at - a.at);
    } catch (e) { return []; }
  };
  B.get = async (id) => { try { const r = await tx('snaps', 'readonly', (os) => os.get(id)); return r ? r.json : null; } catch (e) { return null; } };
  /* restore = merge the snapshot into the current state (nothing current is lost) */
  B.restore = async (id) => {
    const json = await B.get(id);
    if (!json) throw new Error('Snapshot not found');
    await B.snapshot('before-restore');
    S.importJSON(json);
  };

  B.daily = async () => {
    const all = await B.list();
    const today = U.todayKey();
    if (!all.some((s) => s.reason === 'daily' && s.day === today)) await B.snapshot('daily');
  };

  B.init = async () => {
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* ignore */ }
    await open();
    // localStorage emptied (e.g. browser cleanup) but the mirror survived → bring it back
    const st = S.state();
    if (!st.profiles.length) {
      const m = await B.loadMirror();
      if (m && m.profiles && m.profiles.length) { S.replaceState(m); return true; }
    }
    await B.daily();
    setInterval(() => B.daily(), 3600000);
    return false;
  };
})();

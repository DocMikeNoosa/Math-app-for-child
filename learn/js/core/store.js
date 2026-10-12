/* Persistent state. Saved in this browser (localStorage, mirrored to IndexedDB by backup.js) and synced to the family cloud account by cloud.js. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const KEY = 'aus-learn.v1';

  const DEFAULT_SETTINGS = {
    apiKey: '',
    model: 'claude-opus-5-5',
    aiEnabled: true,
    voice: { 'en-AU': '', 'pl-PL': '' },
    rate: { 'en-AU': 0.92, 'pl-PL': 0.95 },
    autoRead: false,
    minutes: { au: 30, pl: 30 },
    enrichment: { au: true, pl: true }, // Health / Arts / Technologies (AU) and Sztuka / Technika (PL) in homework, once a week
    pin: '',
    theme: 'light',
    bigText: false,
    spacing: false,
    parentLang: 'en',
    pencilFirst: false,
    micForSpelling: false,
    // Catch-up: finish a programme's year by a date (e.g. Australian Year 3 by mid-December before starting Year 4 in Australia)
    target: { au: '', pl: '' },
    studyDays: 'all', // 'all' = every day, 'mon-sat', 'weekdays'
  };

  function blankProgress() {
    return {
      lessons: {}, chapters: {}, skills: {}, remediation: [], homework: {}, startPoints: {}, mistakes: [], writing: {},
      streak: { last: '', count: 0 }, stars: 0, log: [],
      hwSets: {}, // lessonKey -> {status:'assigned'|'done', assignedAt, doneAt, score, total}
      spelling: {}, // word -> {lang, wrong:[...], n, last}
      challenges: {}, // chapterKey -> {best, at, passed}
      exams: {}, // subjectKey -> [{at, score, total}]
      daily: {}, // date -> {lessons, correct, answered, hw}
      updatedAt: 0,
    };
  }

  let state = load();
  const listeners = [];

  function migrate(s) {
    s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
    if (typeof s.settings.voice !== 'object') s.settings.voice = { 'en-AU': s.settings.voiceURI || '', 'pl-PL': '' };
    if (typeof s.settings.rate !== 'object') s.settings.rate = { 'en-AU': +s.settings.rate || 0.92, 'pl-PL': 0.95 };
    if (typeof s.settings.minutes !== 'object') s.settings.minutes = { au: +s.settings.dailyMinutes || 30, pl: 30 };
    if (typeof s.settings.enrichment !== 'object') s.settings.enrichment = { au: true, pl: true };
    if (typeof s.settings.target !== 'object' || !s.settings.target) s.settings.target = { au: '', pl: '' };
    if (s.settings.targetDefaulted !== true) {
      // first run: Australian Year 3 should be finished by mid-December (start of the Australian school year 4 in late January)
      const now = new Date(), y = now.getFullYear();
      if (!s.settings.target.au && now < new Date(y, 11, 13)) s.settings.target.au = y + '-12-13';
      s.settings.targetDefaulted = true;
    }
    s.profiles = (s.profiles || []).map((p) => {
      if (!p.au) p.au = { year: +p.year || 3, on: true };
      if (!p.pl) p.pl = { year: 3, on: true };
      delete p.year;
      return p;
    });
    s.progress = s.progress || {};
    s.updatedAt = s.updatedAt || 0;
    return s;
  }

  function load() {
    try {
      const raw = U.safeLS.get(KEY);
      if (raw) return migrate(JSON.parse(raw));
    } catch (e) { console.warn('Could not load saved data', e); }
    return migrate({ profiles: [], active: null, settings: {}, progress: {} });
  }

  function persist() { U.safeLS.set(KEY, JSON.stringify(state)); }
  const saveLocal = U.debounce(persist, 150);

  const S = (LA.store = {});
  S.state = () => state;
  S.replaceState = (s) => { state = migrate(s); persist(); };
  S.onChange = (fn) => listeners.push(fn);
  function changed(scope) {
    const now = Date.now();
    if (scope === 'main' || scope === 'all') state.updatedAt = now;
    if (scope !== 'main') { const P = S.P(); if (P) P.updatedAt = now; }
    saveLocal();
    listeners.forEach((fn) => { try { fn(scope); } catch (e) { console.warn(e); } });
  }
  S.save = () => changed('progress');
  S.saveMain = () => changed('main');
  S.saveNow = () => { persist(); listeners.forEach((fn) => { try { fn('flush'); } catch (e) { /* ignore */ } }); };
  S.settings = () => state.settings;
  S.setSetting = (k, v) => { state.settings[k] = v; changed('main'); };

  S.profiles = () => state.profiles;
  S.activeProfile = () => state.profiles.find((p) => p.id === state.active) || null;
  S.setActive = (id) => { state.active = id; changed('main'); };
  S.addProfile = (opts) => {
    const p = { id: U.uid(), name: (opts.name || '').trim() || 'Learner', avatar: opts.avatar || '🦘', au: { year: +opts.auYear || 3, on: opts.auOn !== false }, pl: { year: +opts.plYear || 3, on: opts.plOn !== false }, createdAt: Date.now() };
    state.profiles.push(p);
    state.progress[p.id] = blankProgress();
    state.active = p.id;
    changed('all');
    persist();
    return p;
  };
  S.updateProfile = (id, patch) => { const p = state.profiles.find((x) => x.id === id); if (p) Object.assign(p, patch); changed('main'); };
  S.deleteProfile = (id) => {
    state.profiles = state.profiles.filter((p) => p.id !== id);
    delete state.progress[id];
    if (state.active === id) state.active = state.profiles[0] ? state.profiles[0].id : null;
    changed('main');
    persist();
  };

  S.blankProgress = blankProgress;
  S.P = (pid) => {
    const p = pid ? state.profiles.find((x) => x.id === pid) : S.activeProfile();
    if (!p) return null;
    if (!state.progress[p.id]) state.progress[p.id] = blankProgress();
    const pr = state.progress[p.id];
    const b = blankProgress();
    for (const k in b) if (pr[k] == null) pr[k] = b[k];
    return pr;
  };
  S.yearFor = (prog) => { const p = S.activeProfile(); return p ? p[prog].year : 3; };
  S.ck = (prog) => prog + S.yearFor(prog);

  S.isLessonDone = (key) => !!(S.P() && S.P().lessons[key] && S.P().lessons[key].done);
  S.markLesson = (key, info) => {
    const P = S.P();
    P.lessons[key] = Object.assign({ done: true, at: Date.now(), via: 'completed' }, info || {});
    bumpDaily('lessons', 1);
    touchStreak();
    changed('progress');
  };
  S.chapter = (key) => S.P().chapters[key] || null;
  S.isChapterPassed = (key) => !!(S.chapter(key) && S.chapter(key).passed);
  S.recordQuiz = (key, score, total, passed, via) => {
    const P = S.P();
    const c = P.chapters[key] || { passed: false, best: 0, attempts: [] };
    c.attempts.push({ at: Date.now(), score, total });
    if (c.attempts.length > 20) c.attempts.splice(0, c.attempts.length - 20);
    c.best = Math.max(c.best || 0, total ? score / total : 0);
    if (passed) { c.passed = true; c.via = via || 'quiz'; c.passedAt = Date.now(); }
    P.chapters[key] = c;
    touchStreak();
    changed('progress');
    return c;
  };
  S.resetChapter = (key) => {
    const P = S.P();
    delete P.chapters[key];
    delete P.challenges[key];
    Object.keys(P.lessons).forEach((k) => { if (k.startsWith(key + '.')) delete P.lessons[k]; });
    Object.keys(P.hwSets).forEach((k) => { if (k.startsWith(key + '.')) delete P.hwSets[k]; });
    changed('progress');
  };

  S.recordAnswer = (q, given, correct) => {
    const P = S.P();
    bumpDaily('answered', 1);
    if (correct) bumpDaily('correct', 1);
    if (!q.skill) return;
    const s = P.skills[q.skill] || { n: 0, c: 0, recent: [], last: 0 };
    s.n++;
    if (correct) s.c++;
    s.recent.push(correct ? 1 : 0);
    if (s.recent.length > 12) s.recent.shift();
    s.last = Date.now();
    if (q.stretch) { s.sn = (s.sn || 0) + 1; if (correct) s.sc = (s.sc || 0) + 1; }
    P.skills[q.skill] = s;
    if (!correct) {
      const correctText = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
      const givenText = q.type === 'mc' ? q.options[given] : given;
      P.mistakes.push({ at: Date.now(), skill: q.skill, q: U.plain(q.q || q.say || '').slice(0, 240), given: String(givenText == null ? '' : givenText).slice(0, 80), correct: String(correctText).slice(0, 80) });
      if (P.mistakes.length > 200) P.mistakes.splice(0, P.mistakes.length - 200);
    } else P.stars++;
    changed('progress');
  };
  S.recordSpelling = (word, wrong, lang) => {
    const P = S.P();
    const k = String(word).toLowerCase();
    const e = P.spelling[k] || { lang: lang || 'en', wrong: [], n: 0, ok: 0, last: 0 };
    e.n++;
    if (wrong && !e.wrong.includes(wrong)) e.wrong.push(String(wrong).slice(0, 40));
    if (e.wrong.length > 5) e.wrong.shift();
    e.last = Date.now();
    e.lang = lang || e.lang;
    P.spelling[k] = e;
    changed('progress');
  };
  S.spellingPracticed = (word, ok) => {
    const P = S.P();
    const e = P.spelling[String(word).toLowerCase()];
    if (!e) return;
    e.ok = ok ? (e.ok || 0) + 1 : 0;
    e.last = Date.now();
    if (e.ok >= 3) e.mastered = true;
    changed('progress');
  };
  S.mastery = (skill) => {
    const s = S.P().skills[skill];
    if (!s || !s.recent.length) return null;
    let w = 0, t = 0;
    s.recent.forEach((v, i) => { const wt = 1 + i * 0.25; w += wt; t += v * wt; });
    return t / w;
  };

  S.addRemediation = (item) => {
    const P = S.P();
    const existing = P.remediation.find((r) => !r.done && r.skill === item.skill);
    if (existing) { Object.assign(existing, item, { id: existing.id, createdAt: Date.now() }); changed('progress'); return existing; }
    const r = Object.assign({ id: U.uid(), createdAt: Date.now(), done: false }, item);
    P.remediation.push(r);
    if (P.remediation.length > 150) P.remediation = P.remediation.filter((x) => !x.done || Date.now() - x.doneAt < 30 * 86400000).slice(-150);
    changed('progress');
    return r;
  };
  S.openRemediation = (prog) => (S.P() ? S.P().remediation.filter((r) => !r.done && (!prog || LA.progOfKey(r.skill) === prog)) : []);
  S.completeRemediation = (id) => { const r = S.P().remediation.find((x) => x.id === id); if (r) { r.done = true; r.doneAt = Date.now(); changed('progress'); } };

  S.assignHomework = (lessonKey) => {
    const P = S.P();
    const cur = P.hwSets[lessonKey];
    if (cur && cur.status === 'assigned') return cur;
    P.hwSets[lessonKey] = { status: 'assigned', assignedAt: Date.now() };
    changed('progress');
    return P.hwSets[lessonKey];
  };
  S.completeHomework = (lessonKey, score, total) => {
    const P = S.P();
    P.hwSets[lessonKey] = Object.assign(P.hwSets[lessonKey] || {}, { status: 'done', doneAt: Date.now(), score, total });
    bumpDaily('hw', 1);
    touchStreak();
    changed('progress');
  };
  S.openHomework = (prog) => { const P = S.P(); return P ? Object.keys(P.hwSets).filter((k) => P.hwSets[k].status === 'assigned' && (!prog || LA.progOfKey(k) === prog) && LA.index.lessons[k]) : []; };

  S.log = (kind, ref, minutes) => {
    const P = S.P();
    P.log.push({ at: Date.now(), kind, ref, minutes: minutes || 0 });
    if (P.log.length > 600) P.log.splice(0, P.log.length - 600);
    changed('progress');
  };

  function bumpDaily(k, n) {
    const P = S.P();
    if (!P) return;
    const d = U.todayKey();
    P.daily[d] = P.daily[d] || { lessons: 0, correct: 0, answered: 0, hw: 0 };
    P.daily[d][k] = (P.daily[d][k] || 0) + n;
    const keys = Object.keys(P.daily).sort();
    if (keys.length > 60) keys.slice(0, keys.length - 60).forEach((x) => delete P.daily[x]);
  }
  S.today = () => { const P = S.P(); return (P && P.daily[U.todayKey()]) || { lessons: 0, correct: 0, answered: 0, hw: 0 }; };

  function touchStreak() {
    const P = S.P();
    const today = U.todayKey();
    if (P.streak.last === today) return;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    P.streak.count = P.streak.last === U.todayKey(y) ? P.streak.count + 1 : 1;
    P.streak.last = today;
  }

  S.exportJSON = () => JSON.stringify(Object.assign({}, state, { settings: Object.assign({}, state.settings, { apiKey: '' }) }), null, 1);
  /* Bring in a backup. Default = MERGE (learners are added, finished work from both copies is kept, nothing is lost).
     replace:true swaps everything for the backup (only from the Parent area, after a safety snapshot). */
  S.importJSON = (txt, opts) => {
    const s = typeof txt === 'string' ? JSON.parse(txt) : txt;
    if (!s || !Array.isArray(s.profiles) || typeof s.progress !== 'object') throw new Error('This file is not a backup from this app.');
    const key = state.settings.apiKey;
    const inc = migrate(JSON.parse(JSON.stringify(s)));
    if (opts && opts.replace) state = inc;
    else {
      const mergeP = (LA.cloud && LA.cloud.mergeProgress) || ((a, b) => a || b);
      const ids = new Set(state.profiles.map((p) => p.id));
      inc.profiles.forEach((p) => { if (!ids.has(p.id)) state.profiles.push(p); });
      Object.keys(inc.progress).forEach((pid) => { state.progress[pid] = mergeP(state.progress[pid], inc.progress[pid]); });
      if (!state.active) state.active = inc.active || (state.profiles[0] || {}).id || null;
      state = migrate(state);
    }
    if (!state.settings.apiKey) state.settings.apiKey = key;
    changed('all');
    persist();
  };
  S.wipeAll = () => { U.safeLS.del(KEY); state = load(); changed('all'); };
})();

/* Persistent state (localStorage). One JSON blob holds profiles, settings and per-child progress. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const KEY = 'aus-learn.v1';

  const DEFAULT_SETTINGS = {
    apiKey: '',
    model: 'claude-opus-5-5',
    voiceURI: '',
    rate: 0.9,
    autoRead: false,
    dailyMinutes: 30,
    pin: '',
    aiEnabled: true,
  };

  function blankProgress() {
    return {
      lessons: {}, // key -> {done, at, via, score, total}
      chapters: {}, // key -> {passed, best, attempts:[{at,score,total}], via}
      skills: {}, // skill -> {n, c, recent:[0|1], last}
      remediation: [], // {id, skill, chapterKey, reason, createdAt, done, doneAt}
      homework: {}, // date -> {items:[...], generatedAt}
      startPoints: {}, // subjectKey -> chapter index
      mistakes: [], // {at, skill, q, given, correct}
      writing: {}, // lessonKey -> {text, at, feedback}
      streak: { last: '', count: 0 },
      stars: 0,
      log: [], // {at, kind, ref, minutes}
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
        s.profiles = s.profiles || [];
        s.progress = s.progress || {};
        return s;
      }
    } catch (e) {
      console.warn('Could not load saved data', e);
    }
    return { profiles: [], active: null, settings: Object.assign({}, DEFAULT_SETTINGS), progress: {} };
  }

  const save = U.debounce(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Save failed', e); }
  }, 150);
  function saveNow() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Save failed', e); } }

  const S = (LA.store = {});
  S.state = () => state;
  S.save = save;
  S.saveNow = saveNow;
  S.settings = () => state.settings;
  S.setSetting = (k, v) => { state.settings[k] = v; save(); };

  S.profiles = () => state.profiles;
  S.activeProfile = () => state.profiles.find((p) => p.id === state.active) || null;
  S.setActive = (id) => { state.active = id; save(); };
  S.addProfile = (name, year, avatar) => {
    const p = { id: U.uid(), name: name.trim() || 'Learner', year: +year || 3, avatar: avatar || '🦘', createdAt: Date.now() };
    state.profiles.push(p);
    state.progress[p.id] = blankProgress();
    state.active = p.id;
    saveNow();
    return p;
  };
  S.updateProfile = (id, patch) => { const p = state.profiles.find((x) => x.id === id); if (p) Object.assign(p, patch); save(); };
  S.deleteProfile = (id) => {
    state.profiles = state.profiles.filter((p) => p.id !== id);
    delete state.progress[id];
    if (state.active === id) state.active = state.profiles[0] ? state.profiles[0].id : null;
    saveNow();
  };

  /* Progress for the active child */
  S.P = () => {
    const p = S.activeProfile();
    if (!p) return null;
    if (!state.progress[p.id]) state.progress[p.id] = blankProgress();
    const pr = state.progress[p.id];
    const b = blankProgress();
    for (const k in b) if (pr[k] == null) pr[k] = b[k];
    return pr;
  };

  S.isLessonDone = (key) => !!(S.P() && S.P().lessons[key] && S.P().lessons[key].done);
  S.markLesson = (key, info) => {
    const P = S.P();
    P.lessons[key] = Object.assign({ done: true, at: Date.now(), via: 'completed' }, info || {});
    touchStreak();
    save();
  };
  S.unmarkLesson = (key) => { delete S.P().lessons[key]; save(); };
  S.chapter = (key) => S.P().chapters[key] || null;
  S.isChapterPassed = (key) => !!(S.chapter(key) && S.chapter(key).passed);
  S.recordQuiz = (key, score, total, passed, via) => {
    const P = S.P();
    const c = P.chapters[key] || { passed: false, best: 0, attempts: [] };
    c.attempts.push({ at: Date.now(), score, total });
    c.best = Math.max(c.best || 0, total ? score / total : 0);
    if (passed) { c.passed = true; c.via = via || 'quiz'; c.passedAt = Date.now(); }
    P.chapters[key] = c;
    touchStreak();
    save();
    return c;
  };
  S.resetChapter = (key) => {
    const P = S.P();
    delete P.chapters[key];
    Object.keys(P.lessons).forEach((k) => { if (k.startsWith(key + '.')) delete P.lessons[k]; });
    save();
  };

  /* Skill statistics drive mastery + remediation */
  S.recordAnswer = (q, given, correct) => {
    const P = S.P();
    if (!q.skill) return;
    const s = P.skills[q.skill] || { n: 0, c: 0, recent: [], last: 0 };
    s.n++;
    if (correct) s.c++;
    s.recent.push(correct ? 1 : 0);
    if (s.recent.length > 12) s.recent.shift();
    s.last = Date.now();
    P.skills[q.skill] = s;
    if (!correct) {
      let correctText = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
      let givenText = q.type === 'mc' ? q.options[given] : given;
      P.mistakes.push({ at: Date.now(), skill: q.skill, q: U.plain(q.q).slice(0, 300), given: String(givenText == null ? '' : givenText).slice(0, 100), correct: String(correctText).slice(0, 100) });
      if (P.mistakes.length > 300) P.mistakes.splice(0, P.mistakes.length - 300);
    } else {
      P.stars++;
    }
    save();
  };
  /* Mastery 0..1 weighted toward recent answers; null if never practised */
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
    if (existing) { existing.reason = item.reason || existing.reason; existing.createdAt = Date.now(); save(); return existing; }
    const r = Object.assign({ id: U.uid(), createdAt: Date.now(), done: false }, item);
    P.remediation.push(r);
    save();
    return r;
  };
  S.openRemediation = () => (S.P() ? S.P().remediation.filter((r) => !r.done) : []);
  S.completeRemediation = (id) => {
    const r = S.P().remediation.find((x) => x.id === id);
    if (r) { r.done = true; r.doneAt = Date.now(); save(); }
  };

  S.log = (kind, ref, minutes) => {
    const P = S.P();
    P.log.push({ at: Date.now(), kind, ref, minutes: minutes || 0 });
    if (P.log.length > 2000) P.log.splice(0, P.log.length - 2000);
    save();
  };

  function touchStreak() {
    const P = S.P();
    const today = U.todayKey();
    if (P.streak.last === today) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    P.streak.count = P.streak.last === U.todayKey(y) ? P.streak.count + 1 : 1;
    P.streak.last = today;
  }

  S.exportJSON = () => JSON.stringify(Object.assign({}, state, { settings: Object.assign({}, state.settings, { apiKey: '' }) }), null, 2);
  S.importJSON = (txt) => {
    const s = JSON.parse(txt);
    if (!s || !Array.isArray(s.profiles) || typeof s.progress !== 'object') throw new Error('This file is not a backup from this app.');
    const key = state.settings.apiKey;
    state = s;
    state.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {}, { apiKey: s.settings && s.settings.apiKey ? s.settings.apiKey : key });
    saveNow();
  };
  S.wipeAll = () => { localStorage.removeItem(KEY); state = load(); };
})();

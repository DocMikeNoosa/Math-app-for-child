/* The tutor's brain (works offline): what to learn next, daily plan, "dwell" rules after mistakes,
   above-par challenges, par rating per subject. AI explanations live in ai.js. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const T = (LA.tutor = {});

  T.PASS_QUIZ = 0.8;
  T.PASS_PRACTICE = 0.6;
  T.PASS_REMEDIATION = 0.8;
  T.PASS_CHALLENGE = 0.75;
  T.PASS_EXAM = 0.85;

  /* next step in a subject, skipping lessons/quizzes already picked for today's plan */
  T.upcoming = (subj, picked) => {
    const start = T.startIndex(subj);
    for (let i = start; i < subj.chapters.length; i++) {
      const ch = subj.chapters[i];
      if (S.isChapterPassed(ch.key)) continue;
      const lesson = ch.lessons.find((l) => !S.isLessonDone(l.key) && !picked.has(l.key));
      if (lesson) return { kind: 'lesson', chapter: ch, lesson };
      if (ch.lessons.some((l) => picked.has(l.key))) continue; // quiz comes after today's lessons are done
      if (!picked.has('quiz:' + ch.key)) return { kind: 'quiz', chapter: ch };
    }
    return null;
  };
  T.subjects = (prog) => (LA.curriculum[S.ck(prog)] || { subjects: [] }).subjects;
  T.startIndex = (subj) => S.P().startPoints[subj.key] || 0;

  T.nextStep = (subj) => {
    const start = T.startIndex(subj);
    for (let i = start; i < subj.chapters.length; i++) {
      const ch = subj.chapters[i];
      if (S.isChapterPassed(ch.key)) continue;
      const lesson = ch.lessons.find((l) => !S.isLessonDone(l.key));
      if (lesson) return { kind: 'lesson', chapter: ch, lesson };
      return { kind: 'quiz', chapter: ch };
    }
    return null;
  };

  /* ---------- catch-up to a target date ---------- */
  T.target = (prog) => { const t = ((S.settings().target || {})[prog] || '').trim(); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : null; };
  const isStudyDay = (d) => { const mode = S.settings().studyDays || 'all'; const w = d.getDay(); return mode === 'all' || (mode === 'mon-sat' ? w !== 0 : w !== 0 && w !== 6); };
  T.studyDaysBetween = (from, toKey) => {
    const end = new Date(toKey + 'T23:59:59');
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    let n = 0;
    while (d <= end && n < 400) { if (isStudyDay(d)) n++; d.setDate(d.getDate() + 1); }
    return n;
  };
  /* lessons still to do (chapters already passed or tested out count as done) */
  T.remaining = (subj) => {
    let n = 0;
    const start = T.startIndex(subj);
    subj.chapters.forEach((ch, i) => { if (i < start || S.isChapterPassed(ch.key)) return; ch.lessons.forEach((l) => { if (!S.isLessonDone(l.key)) n++; }); });
    return n;
  };
  T.lessonsDoneOn = (prog, dayKey) => {
    const pre = LA.PROGRAMMES[prog].prefix(S.yearFor(prog)) + '.';
    const L = S.P().lessons;
    return Object.keys(L).filter((k) => k.startsWith(pre) && L[k].done && L[k].at && U.todayKey(new Date(L[k].at)) === dayKey).length;
  };
  T.catchUp = (prog) => {
    const t = T.target(prog);
    if (!t || !S.P()) return null;
    const enrichOn = (S.settings().enrichment || {})[prog] !== false;
    const subs = T.subjects(prog).filter((s) => enrichOn || !s.enrichment);
    const bySubject = subs.map((s) => ({ s, left: T.remaining(s) }));
    const left = bySubject.reduce((a, x) => a + x.left, 0);
    const today = new Date();
    const doneToday = T.lessonsDoneOn(prog, U.todayKey());
    const days = Math.max(1, T.studyDaysBetween(today, t));
    // today's quota counts lessons already done today, so it doesn't grow during the day
    const perDay = left + doneToday === 0 ? 0 : Math.ceil((left + doneToday) / days);
    const todo = Math.max(0, perDay - doneToday);
    const past = new Date(t + 'T23:59:59') < today;
    const level = perDay <= 3 ? 'comfortable' : perDay <= 5 ? 'busy' : 'heavy';
    return { target: t, left, days, perDay, doneToday, todo, past, level, bySubject, minutes: perDay * 14 };
  };

  T.subjectStats = (subj) => {
    let lessons = 0, done = 0, passed = 0;
    subj.chapters.forEach((ch) => { if (S.isChapterPassed(ch.key)) passed++; ch.lessons.forEach((l) => { lessons++; if (S.isLessonDone(l.key)) done++; }); });
    const expected = Math.round(U.yearProgress(subj.prog) * subj.chapters.length);
    return { lessons, done, chapters: subj.chapters.length, passed, expected, behind: Math.max(0, expected - passed), pct: lessons ? done / lessons : 0 };
  };

  T.chapterStatus = (ch) => {
    if (S.isChapterPassed(ch.key)) return S.chapter(ch.key).via === 'tested-out' ? 'tested-out' : 'passed';
    const done = ch.lessons.filter((l) => S.isLessonDone(l.key)).length;
    if (done === ch.lessons.length) return 'quiz-ready';
    if (done > 0 || (S.chapter(ch.key) && S.chapter(ch.key).attempts.length)) return 'in-progress';
    const subj = LA.index.subjects[ch.subjectKey];
    if (ch.index < T.startIndex(subj)) return 'skipped';
    return 'todo';
  };

  /* ---------- the "dwell" rules ---------- */
  T.afterPractice = (lesson, results, attempt) => {
    const scored = results.filter((r) => r.q.type !== 'write');
    const right = scored.filter((r) => r.correct).length, total = scored.length;
    const score = total ? right / total : 1;
    const ok = score >= T.PASS_PRACTICE;
    if (ok) {
      S.markLesson(lesson.key, { score: right, total });
      S.assignHomework(lesson.key);
      if (score < 0.8 && total) S.addRemediation({ skill: lesson.key, chapterKey: lesson.chapterKey, reason: LA.tr(`Practice score ${right}/${total} — a little more practice will lock it in.`, `Wynik ćwiczeń ${right}/${total} — jeszcze trochę ćwiczeń i będzie dobrze.`) });
    } else if (attempt >= 2) {
      S.markLesson(lesson.key, { score: right, total, via: 'completed-needs-review' });
      S.assignHomework(lesson.key);
      S.addRemediation({ skill: lesson.key, chapterKey: lesson.chapterKey, reason: LA.tr(`Found this tricky (${right}/${total}). Extra practice added.`, `To było trudne (${right}/${total}). Dodano dodatkowe ćwiczenia.`) });
    }
    S.log('practice', lesson.key, lesson.minutes || 10);
    return { right, total, score, ok, movedOn: !ok && attempt >= 2 };
  };

  T.afterHomework = (lesson, results) => {
    const scored = results.filter((r) => r.q.type !== 'write');
    const right = scored.filter((r) => r.correct).length, total = scored.length;
    S.completeHomework(lesson.key, right, total);
    if (total && right / total < 0.7) S.addRemediation({ skill: lesson.key, chapterKey: lesson.chapterKey, reason: LA.tr(`Homework ${right}/${total} — let's go over it once more.`, `Praca domowa ${right}/${total} — powtórzmy to jeszcze raz.`) });
    S.log('homework', lesson.key, 8);
    return { right, total, score: total ? right / total : 1 };
  };

  T.afterQuiz = (ch, results, mode) => {
    const right = results.filter((r) => r.correct).length, total = results.length;
    const score = total ? right / total : 0;
    const passed = score >= T.PASS_QUIZ;
    S.recordQuiz(ch.key, right, total, passed, mode === 'testout' ? 'tested-out' : 'quiz');
    const bySkill = {};
    results.forEach((r) => { const k = r.q.skill || ch.key; bySkill[k] = bySkill[k] || { right: 0, total: 0 }; bySkill[k].total++; if (r.correct) bySkill[k].right++; });
    const weak = Object.keys(bySkill).filter((k) => bySkill[k].right < bySkill[k].total);
    if (passed) {
      if (mode === 'testout') ch.lessons.forEach((l) => { if (!S.isLessonDone(l.key)) S.markLesson(l.key, { via: 'tested-out' }); });
      weak.forEach((k) => S.addRemediation({ skill: k, chapterKey: ch.key, reason: LA.tr(`Missed ${bySkill[k].total - bySkill[k].right} in the "${ch.title}" quiz.`, `Błędy w sprawdzianie „${ch.title}”: ${bySkill[k].total - bySkill[k].right}.`) }));
    } else {
      weak.forEach((k) => S.addRemediation({ skill: k, chapterKey: ch.key, blocking: mode !== 'testout', reason: LA.tr(`Quiz: ${bySkill[k].right}/${bySkill[k].total} on this part. Let's go over it again.`, `Sprawdzian: ${bySkill[k].right}/${bySkill[k].total} z tej części. Powtórzmy to.`) }));
    }
    S.log('quiz', ch.key, 10);
    return { right, total, score, passed, weak };
  };

  T.afterChallenge = (ch, results) => {
    const right = results.filter((r) => r.correct).length, total = results.length;
    const score = total ? right / total : 0;
    const P = S.P();
    const prev = P.challenges[ch.key] || { best: 0, passed: false };
    P.challenges[ch.key] = { best: Math.max(prev.best, score), passed: prev.passed || score >= T.PASS_CHALLENGE, at: Date.now() };
    S.save();
    S.log('challenge', ch.key, 8);
    return { right, total, score, passed: score >= T.PASS_CHALLENGE };
  };

  T.afterExam = (subj, results) => {
    const right = results.filter((r) => r.correct).length, total = results.length;
    const P = S.P();
    P.exams[subj.key] = (P.exams[subj.key] || []).concat([{ at: Date.now(), score: right, total }]).slice(-20);
    const bySkill = {};
    results.forEach((r) => { const k = r.q.skill; bySkill[k] = bySkill[k] || { right: 0, total: 0 }; bySkill[k].total++; if (r.correct) bySkill[k].right++; });
    Object.keys(bySkill).forEach((k) => { if (bySkill[k].right < bySkill[k].total) S.addRemediation({ skill: k, chapterKey: (LA.index.lessons[k] || {}).chapterKey || k, reason: LA.tr('Missed in the practice exam.', 'Błąd w próbnym sprawdzianie.') }); });
    S.save();
    S.log('exam', subj.key, 25);
    return { right, total, score: total ? right / total : 0, passed: total ? right / total >= T.PASS_EXAM : false };
  };

  T.afterRemediation = (rem, results) => {
    const right = results.filter((r) => r.correct).length, total = results.length;
    const ok = total ? right / total >= T.PASS_REMEDIATION : true;
    if (ok) S.completeRemediation(rem.id); else { rem.tries = (rem.tries || 0) + 1; S.save(); }
    S.log('review', rem.skill, 6);
    return { right, total, ok };
  };

  T.reviewCandidates = (prog) => {
    const P = S.P();
    const pre = LA.PROGRAMMES[prog].prefix(S.yearFor(prog)) + '.';
    const out = [];
    Object.keys(P.skills).forEach((k) => {
      if (!k.startsWith(pre) || (!LA.index.lessons[k] && !LA.index.chapters[k])) return;
      const m = S.mastery(k), age = (Date.now() - P.skills[k].last) / 86400000;
      if ((m != null && m < 0.85) || age > 10) out.push({ skill: k, m, age, score: (1 - (m == null ? 1 : m)) * 2 + Math.min(age, 30) / 30 });
    });
    return out.sort((a, b) => b.score - a.score);
  };

  T.weakSkills = (prog, limit) => {
    const P = S.P();
    if (!P) return [];
    const pre = LA.PROGRAMMES[prog || 'au'].prefix(S.yearFor(prog || 'au')) + '.';
    return Object.keys(P.skills).filter((k) => k.startsWith(pre) && P.skills[k].n >= 2 && (LA.index.lessons[k] || LA.index.chapters[k]))
      .map((k) => ({ skill: k, m: S.mastery(k), n: P.skills[k].n })).filter((x) => x.m < 0.75).sort((a, b) => a.m - b.m).slice(0, limit || 8);
  };

  T.trickyWords = (prog) => {
    const P = S.P();
    const lang = LA.PROGRAMMES[prog].lang;
    return Object.keys(P.spelling).filter((w) => P.spelling[w].lang === lang && !P.spelling[w].mastered).sort((a, b) => P.spelling[b].n - P.spelling[a].n);
  };

  /* ---------- par rating ---------- */
  T.par = (subj) => {
    const P = S.P();
    const attempted = subj.chapters.filter((c) => P.chapters[c.key] && P.chapters[c.key].attempts.length);
    const skills = Object.keys(P.skills).filter((k) => k.startsWith(subj.key + '.'));
    const answered = skills.reduce((s, k) => s + P.skills[k].n, 0);
    if (attempted.length === 0 && answered < 15) return { level: 'none', label: LA.tr('Not enough work yet', 'Za mało danych'), accuracy: null };
    const quizAcc = attempted.length ? attempted.reduce((s, c) => s + P.chapters[c.key].best, 0) / attempted.length : null;
    const correct = skills.reduce((s, k) => s + P.skills[k].c, 0);
    const answerAcc = answered ? correct / answered : null;
    const acc = quizAcc != null ? (answerAcc != null ? quizAcc * 0.6 + answerAcc * 0.4 : quizAcc) : answerAcc;
    const sn = skills.reduce((s, k) => s + (P.skills[k].sn || 0), 0), sc = skills.reduce((s, k) => s + (P.skills[k].sc || 0), 0);
    const stretchAcc = sn >= 4 ? sc / sn : null;
    const chPassed = subj.chapters.filter((c) => (P.challenges[c.key] || {}).passed).length;
    let level = 'on';
    if (acc < 0.7) level = 'below';
    else if (acc >= 0.88 && ((stretchAcc != null && stretchAcc >= 0.7) || chPassed >= Math.max(1, Math.round(attempted.length / 3)))) level = 'above';
    const label = { below: LA.tr('Below par', 'Poniżej poziomu'), on: LA.tr('On par', 'Na poziomie'), above: LA.tr('Above par', 'Powyżej poziomu') }[level];
    return { level, label, accuracy: acc, stretchAcc, challengesPassed: chPassed, chaptersAttempted: attempted.length };
  };

  /* ---------- daily plan per programme ---------- */
  const MIN = { lesson: 15, hw: 8, quiz: 10, review: 5, remediation: 8, spelling: 5 };
  const ALT_DAYS = [[1, 3, 5, 0], [2, 4, 6]];
  const ENRICH_DAYS = [3, 5, 6];

  T.planToday = (prog, force, extra) => {
    const P = S.P();
    const key = U.todayKey() + '|' + prog;
    if (P.homework[key] && !force) return P.homework[key];
    const prev = P.homework[key];
    const budget = +((S.settings().minutes || {})[prog]) || 30;
    const items = [];
    let used = 0;
    const add = (it, mins) => { items.push(Object.assign({ id: U.uid(), done: false, minutes: mins }, it)); used += mins; };
    const subs = T.subjects(prog);
    const sname = (k) => (LA.subjectOf(k) || {}).name || '';

    // 1. extra practice (parent-assigned first)
    S.openRemediation(prog).filter((r) => r.skill.startsWith(LA.PROGRAMMES[prog].prefix(S.yearFor(prog)) + '.'))
      .sort((a, b) => (b.source === 'parent') - (a.source === 'parent')).slice(0, 2)
      .forEach((r) => add({ kind: 'remediation', ref: r.id, title: (r.source === 'parent' ? LA.tr('From your grown-up: ', 'Od rodzica: ') : '') + LA.skillLabel(r.skill), skill: r.skill }, MIN.remediation));

    // 2. independent homework from lessons already taught
    S.openHomework(prog).filter((k) => k.startsWith(LA.PROGRAMMES[prog].prefix(S.yearFor(prog)) + '.')).slice(0, 3)
      .forEach((k) => add({ kind: 'hw', ref: k, title: `${sname(k)}: ${LA.index.lessons[k].title}` }, MIN.hw));

    // 3. new lessons to learn together
    const cu = T.catchUp(prog);
    if (cu && !cu.past && cu.left > 0) {
      // Catch-up mode: schedule today's quota, spread over the subjects with the most left to do
      const queue = cu.bySubject.filter((x) => x.left > 0).map((x) => ({ s: x.s, left: x.left, taken: 0 }));
      let need = cu.todo + (extra || 0);
      // offer one quick test-out for a fresh chapter she may already know from school (saves a whole chapter)
      const fresh = queue.slice().sort((a, b) => (['maths', 'matematyka'].includes(b.s.id) ? 1 : 0) - (['maths', 'matematyka'].includes(a.s.id) ? 1 : 0)).map((x) => T.nextStep(x.s)).find((st) => st && st.chapter.bridge && st && st.kind === 'lesson' && st.chapter.lessons.every((l) => !S.isLessonDone(l.key)) && !(S.chapter(st.chapter.key) && S.chapter(st.chapter.key).attempts.length) && st.chapter.lessons.length >= 3);
      if (fresh && need > 0) add({ kind: 'testout', ref: fresh.chapter.key, title: `${sname(fresh.chapter.key)}: ${fresh.chapter.title}`, subject: fresh.chapter.subjectKey }, MIN.quiz);
      const picked = new Set();
      for (let guard = 0; need > 0 && guard < 60; guard++) {
        queue.sort((a, b) => (b.left - b.taken * 3) - (a.left - a.taken * 3));
        const q = queue[0];
        if (!q || q.left - q.taken <= 0) break;
        const st = T.upcoming(q.s, picked);
        if (!st) { q.left = 0; continue; }
        q.taken++;
        if (st.kind === 'lesson') { picked.add(st.lesson.key); add({ kind: 'lesson', ref: st.lesson.key, title: `${q.s.name}: ${st.lesson.title}`, subject: q.s.id }, st.lesson.minutes || MIN.lesson); need--; }
        else { picked.add('quiz:' + st.chapter.key); add({ kind: 'quiz', ref: st.chapter.key, title: `${q.s.name}: ${LA.tr('check-up quiz', 'sprawdzian')} — ${st.chapter.title}`, subject: q.s.id }, MIN.quiz); }
      }
    }
    const w = new Date().getDay();
    const core = subs.filter((s) => ['english', 'maths', 'polski', 'matematyka'].includes(s.id));
    const alt = subs.filter((s) => !s.enrichment && !core.includes(s));
    const enrich = (S.settings().enrichment || {})[prog] !== false ? subs.filter((s) => s.enrichment) : [];
    const todays = core.concat(alt.filter((s, i) => ALT_DAYS[i % 2].includes(w))).concat(enrich.filter((s, i) => ENRICH_DAYS[i % 3] === w));
    const others = alt.concat(enrich).filter((s) => !todays.includes(s));
    for (const s of (cu && !cu.past && cu.left > 0 ? [] : todays.concat(others))) {
      if (used >= budget && items.some((i) => i.kind === 'lesson' || i.kind === 'quiz')) break;
      const step = T.nextStep(s);
      if (!step) continue;
      if (step.kind === 'lesson') add({ kind: 'lesson', ref: step.lesson.key, title: `${s.name}: ${step.lesson.title}`, subject: s.id }, step.lesson.minutes || MIN.lesson);
      else add({ kind: 'quiz', ref: step.chapter.key, title: `${s.name}: ${LA.tr('check-up quiz', 'sprawdzian')} — ${step.chapter.title}`, subject: s.id }, MIN.quiz);
    }
    // catch-up: one more lesson in the subject most behind
    if (used < budget && !(cu && cu.left > 0)) {
      const most = subs.map((s) => ({ s, st: T.subjectStats(s) })).filter((x) => x.st.behind > 0).sort((a, b) => b.st.behind - a.st.behind)[0];
      if (most) {
        const step = T.nextStep(most.s);
        if (step && step.kind === 'lesson') {
          const nxt = step.chapter.lessons.find((l) => !S.isLessonDone(l.key) && !items.some((i) => i.ref === l.key));
          if (nxt) add({ kind: 'lesson', ref: nxt.key, title: `${most.s.name}: ${nxt.title} (${LA.tr('catch-up', 'nadrabianie')})`, subject: most.s.id }, nxt.minutes || MIN.lesson);
        }
      }
    }
    // 4. tricky words
    if (T.trickyWords(prog).length >= 3) add({ kind: 'spelling', ref: prog, title: LA.tr('My tricky words', 'Moje trudne wyrazy') }, MIN.spelling);
    // 5. spaced review
    const rev = T.reviewCandidates(prog).find((r) => !items.some((i) => i.skill === r.skill));
    if (rev) add({ kind: 'review', ref: rev.skill, title: LA.skillLabel(rev.skill), skill: rev.skill }, MIN.review);

    if (prev) items.forEach((it) => { const o = prev.items.find((x) => x.ref === it.ref && x.kind === it.kind); if (o) it.done = o.done; });
    P.homework[key] = { items, generatedAt: Date.now(), budget };
    const keys = Object.keys(P.homework).sort();
    if (keys.length > 60) keys.slice(0, keys.length - 60).forEach((k) => delete P.homework[k]);
    S.save();
    return P.homework[key];
  };

  T.markPlan = (kind, ref) => {
    const P = S.P();
    ['au', 'pl'].forEach((prog) => {
      const h = P.homework[U.todayKey() + '|' + prog];
      if (!h) return;
      let changed = false;
      h.items.forEach((it) => { if (it.ref === ref && it.kind === kind && !it.done) { it.done = true; changed = true; } });
      if (changed) S.save();
    });
  };
})();

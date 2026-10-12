/* Curriculum registry + question builders used by the content files. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;

  const C = (LA.curriculum = { 3: { year: 3, subjects: [] }, 4: { year: 4, subjects: [] } });
  const index = (LA.index = { chapters: {}, lessons: {}, subjects: {} });

  /* ---------- builders for content authors ---------- */
  const Q = (LA.Q = {
    mc: (q, options, answer, explain, extra) => Object.assign({ type: 'mc', q, options, answer, explain }, extra || {}),
    tf: (q, isTrue, explain, extra) => Object.assign({ type: 'mc', q, options: ['True', 'False'], answer: isTrue ? 0 : 1, explain, fixed: true }, extra || {}),
    inp: (q, answer, explain, extra) => Object.assign({ type: 'input', q, answer, explain }, extra || {}),
    num: (q, answer, explain, extra) => Object.assign({ type: 'input', numeric: true, q, answer, explain }, extra || {}),
    write: (prompt, checklist, minWords, extra) => Object.assign({ type: 'write', q: prompt, checklist: checklist || [], minWords: minWords || 20 }, extra || {}),
    gen: (name, args, n) => ({ gen: name, args: args || {}, n: n || 1 }),
  });

  const SUBJECT_META = {
    english: { name: 'English', icon: '📖', color: '#d9480f' },
    maths: { name: 'Mathematics', icon: '🔢', color: '#1971c2' },
    science: { name: 'Science', icon: '🔬', color: '#2b8a3e' },
    hass: { name: 'HASS', long: 'Humanities and Social Sciences', icon: '🗺️', color: '#9c36b5' },
    hpe: { name: 'Health & PE', long: 'Health and Physical Education', icon: '🏃', color: '#e8590c' },
    arts: { name: 'The Arts', icon: '🎨', color: '#c2255c' },
    tech: { name: 'Technologies', icon: '💡', color: '#0c8599' },
  };
  LA.SUBJECT_META = SUBJECT_META;

  LA.addSubject = function (year, subj) {
    const meta = SUBJECT_META[subj.id] || {};
    const s = Object.assign({}, meta, subj);
    s.year = year;
    s.key = 'y' + year + '.' + s.id;
    s.chapters.forEach((ch, ci) => {
      ch.key = s.key + '.' + ch.id;
      ch.subjectKey = s.key;
      ch.index = ci;
      ch.lessons.forEach((l, li) => {
        l.key = ch.key + '.' + l.id;
        l.chapterKey = ch.key;
        l.subjectKey = s.key;
        l.index = li;
        index.lessons[l.key] = l;
      });
      ch.quiz = ch.quiz || { items: [] };
      index.chapters[ch.key] = ch;
    });
    index.subjects[s.key] = s;
    C[year].subjects.push(s);
    C[year].subjects.sort((a, b) => Object.keys(SUBJECT_META).indexOf(a.id) - Object.keys(SUBJECT_META).indexOf(b.id));
    return s;
  };

  /* ---------- instantiate questions (expand generators, shuffle MC options) ---------- */
  function finalize(q, skill) {
    const out = Object.assign({}, q);
    out.skill = q.skill || skill;
    out.iid = U.uid();
    if (out.type === 'mc' && !out.fixed) {
      const order = U.shuffle(out.options.map((_, i) => i));
      out.options = order.map((i) => q.options[i]);
      out.answer = order.indexOf(q.answer);
    }
    return out;
  }

  LA.expand = function (items, defaultSkill) {
    const out = [];
    (items || []).forEach((it) => {
      if (it.gen) {
        const g = LA.gens[it.gen];
        if (!g) { console.warn('Unknown generator', it.gen); return; }
        const seen = new Set();
        let guard = 0;
        while (seen.size < it.n && guard++ < it.n * 20) {
          const q = g(it.args || {});
          const sig = q.q + '|' + JSON.stringify(q.answer) + '|' + (q.svg || '');
          if (seen.has(sig)) continue;
          seen.add(sig);
          out.push(finalize(q, it.skill || defaultSkill));
        }
      } else {
        out.push(finalize(it, it.skill || defaultSkill));
      }
    });
    return out;
  };

  /* Practice set for a lesson */
  LA.lessonPractice = (lesson) => LA.expand(lesson.practice, lesson.key);

  /* Quiz for a chapter: chapter quiz items (skill tagged by lesson when given) topped up from lesson practice */
  LA.chapterQuiz = function (ch) {
    const want = ch.quiz.n || 10;
    const items = (ch.quiz.items || []).map((q) => Object.assign({}, q, { skill: q.lesson ? ch.key + '.' + q.lesson : q.skill || ch.key }));
    let qs = LA.expand(items, ch.key);
    if (qs.length < want) {
      const pool = [];
      ch.lessons.forEach((l) => (l.practice || []).forEach((p) => pool.push(Object.assign({}, p, { skill: p.skill || l.key }))));
      const extra = LA.expand(U.shuffle(pool), ch.key).filter((q) => q.type !== 'write' && !qs.some((x) => x.q === q.q));
      qs = qs.concat(extra.slice(0, want - qs.length));
    }
    return U.shuffle(qs.filter((q) => q.type !== 'write')).slice(0, Math.max(want, 1));
  };

  /* Extra practice for a skill key (lesson key or chapter key) */
  LA.skillPractice = function (skill, n) {
    n = n || 6;
    const lesson = index.lessons[skill];
    let pool = [];
    if (lesson) {
      pool = (lesson.practice || []).map((p) => Object.assign({}, p, { skill: lesson.key }));
      const ch = index.chapters[lesson.chapterKey];
      (ch.quiz.items || []).forEach((q) => { if (q.lesson === lesson.id) pool.push(Object.assign({}, q, { skill: lesson.key })); });
    } else if (index.chapters[skill]) {
      const ch = index.chapters[skill];
      ch.lessons.forEach((l) => (l.practice || []).forEach((p) => pool.push(Object.assign({}, p, { skill: l.key }))));
      (ch.quiz.items || []).forEach((q) => pool.push(Object.assign({}, q, { skill: q.lesson ? ch.key + '.' + q.lesson : ch.key })));
    }
    // generators can produce more than once: bump their n so we get fresh items
    pool = pool.map((p) => (p.gen ? Object.assign({}, p, { n: Math.max(p.n, 2) }) : p));
    const qs = LA.expand(U.shuffle(pool), skill).filter((q) => q.type !== 'write');
    return U.shuffle(qs).slice(0, n);
  };

  LA.skillLabel = function (skill) {
    if (index.lessons[skill]) {
      const l = index.lessons[skill];
      return index.chapters[l.chapterKey].title + ' → ' + l.title;
    }
    if (index.chapters[skill]) return index.chapters[skill].title;
    return skill;
  };
  LA.subjectOf = (key) => index.subjects[key.split('.').slice(0, 2).join('.')];
})();

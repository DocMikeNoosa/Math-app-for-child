/* Programmes (Australian / Polish), curriculum registry, question builders and question-set factories. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;

  /* ---------- programmes ---------- */
  LA.PROGRAMMES = {
    au: { id: 'au', flag: '🇦🇺', lang: 'en', voice: 'en-AU', name: 'Australian Curriculum', short: 'Australia', tutor: 'Koa', tutorIcon: '🐨', years: [3, 4], yearLabel: (y) => 'Year ' + y, prefix: (y) => 'y' + y },
    pl: { id: 'pl', flag: '🇵🇱', lang: 'pl', voice: 'pl-PL', name: 'Polska podstawa programowa', short: 'Polska', tutor: 'Sowa Zosia', tutorIcon: '🦉', years: [3, 4], yearLabel: (y) => 'Klasa ' + y, prefix: (y) => 'p' + y },
  };
  LA.progOfKey = (key) => (String(key).charAt(0) === 'p' ? 'pl' : 'au');
  LA.langOfKey = (key) => LA.PROGRAMMES[LA.progOfKey(key)].lang;

  /* Current UI language. Views set LA.ui.prog; the parent area may force a language. */
  LA.state = { prog: 'au', forceLang: null };
  LA.lang = () => LA.state.forceLang || (LA.PROGRAMMES[LA.state.prog] || LA.PROGRAMMES.au).lang;
  LA.tr = (en, pl) => (LA.lang() === 'pl' && pl != null ? pl : en);

  const C = (LA.curriculum = { au3: { subjects: [] }, au4: { subjects: [] }, pl3: { subjects: [] }, pl4: { subjects: [] } });
  const index = (LA.index = { chapters: {}, lessons: {}, subjects: {} });

  /* ---------- builders for content authors ---------- */
  LA.Q = {
    mc: (q, options, answer, explain, extra) => Object.assign({ type: 'mc', q, options, answer, explain }, extra || {}),
    tf: (q, isTrue, explain, extra) => Object.assign({ type: 'mc', q, options: ['True', 'False'], answer: isTrue ? 0 : 1, explain, fixed: true, tf: true }, extra || {}),
    pf: (q, isTrue, explain, extra) => Object.assign({ type: 'mc', q, options: ['Prawda', 'Fałsz'], answer: isTrue ? 0 : 1, explain, fixed: true, tf: true }, extra || {}),
    inp: (q, answer, explain, extra) => Object.assign({ type: 'input', q, answer, explain }, extra || {}),
    num: (q, answer, explain, extra) => Object.assign({ type: 'input', numeric: true, q, answer, explain }, extra || {}),
    write: (prompt, checklist, minWords, extra) => Object.assign({ type: 'write', q: prompt, checklist: checklist || [], minWords: minWords || 20 }, extra || {}),
    gen: (name, args, n) => ({ gen: name, args: args || {}, n: n || 1 }),
    /* a dictation item: the word is read aloud, the child writes it */
    dict: (word, sentence, extra) => Object.assign({ type: 'input', dictation: true, q: '', say: word, sayContext: sentence, answer: [word], explain: '' }, extra || {}),
    star: (item) => Object.assign({}, item, { stretch: true }),
  };

  const SUBJECT_META = {
    au: {
      english: { name: 'English', icon: '📖', glyph: 'abc', color: '#ff9500' },
      maths: { name: 'Mathematics', icon: '🔢', glyph: 'sum', color: '#007aff' },
      science: { name: 'Science', icon: '🔬', glyph: 'flask', color: '#34c759' },
      hass: { name: 'HASS', long: 'Humanities and Social Sciences', icon: '🗺️', glyph: 'globe', color: '#5856d6' },
      hpe: { name: 'Health', long: 'Health (from Health and PE)', icon: '🧡', glyph: 'heart', color: '#ff2d55', enrichment: true },
      arts: { name: 'The Arts', icon: '🎨', glyph: 'palette', color: '#af52de', enrichment: true },
      tech: { name: 'Technologies', icon: '💡', glyph: 'cpu', color: '#30b0c7', enrichment: true },
    },
    pl: {
      polski: { name: 'Język polski', icon: '📕', glyph: 'abc', color: '#ff3b30' },
      matematyka: { name: 'Matematyka', icon: '➗', glyph: 'sum', color: '#007aff' },
      przyroda: { name: 'Przyroda', icon: '🌿', glyph: 'leaf', color: '#34c759' },
      spoleczna: { name: 'Edukacja społeczna', icon: '🏛️', glyph: 'columns', color: '#5856d6' },
      historia: { name: 'Historia', icon: '🏰', glyph: 'castle', color: '#a2845e' },
      sztuka: { name: 'Plastyka i muzyka', icon: '🎼', glyph: 'music', color: '#af52de', enrichment: true },
      technika: { name: 'Technika i informatyka', icon: '🛠️', glyph: 'wrench', color: '#30b0c7', enrichment: true },
    },
  };
  LA.SUBJECT_META = SUBJECT_META;
  const ORDER = ['english', 'maths', 'science', 'hass', 'hpe', 'arts', 'tech', 'polski', 'matematyka', 'przyroda', 'spoleczna', 'historia', 'sztuka', 'technika'];

  /* LA.addSubject(3, …) = Australian Year 3 (kept for the original content files); LA.addSubject('pl3', …) = Polish klasa 3 */
  LA.addSubject = function (where, subj) {
    const ck = typeof where === 'number' ? 'au' + where : where;
    const prog = ck.slice(0, 2), year = +ck.slice(2);
    const meta = (SUBJECT_META[prog] || {})[subj.id] || {};
    const s = Object.assign({}, meta, subj);
    s.prog = prog;
    s.year = year;
    s.ck = ck;
    s.lang = LA.PROGRAMMES[prog].lang;
    s.key = LA.PROGRAMMES[prog].prefix(year) + '.' + s.id;
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
    C[ck].subjects.push(s);
    C[ck].subjects.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
    return s;
  };

  /* Remove chapters by id (used to drop PE from Health & PE without touching the rest). */
  LA.dropChapters = function (subjectKey, ids) {
    const s = index.subjects[subjectKey];
    if (!s) return;
    s.chapters = s.chapters.filter((c) => {
      if (!ids.includes(c.id)) return true;
      c.lessons.forEach((l) => delete index.lessons[l.key]);
      delete index.chapters[c.key];
      return false;
    });
    s.chapters.forEach((c, i) => (c.index = i));
  };

  /* Extra chapters appended to an existing subject from another file */
  LA.extendSubject = function (subjectKey, chapters, position) {
    const s = index.subjects[subjectKey];
    if (!s) throw new Error('extendSubject: unknown subject ' + subjectKey);
    chapters.forEach((ch) => {
      ch.key = s.key + '.' + ch.id;
      ch.subjectKey = s.key;
      ch.lessons.forEach((l, li) => { l.key = ch.key + '.' + l.id; l.chapterKey = ch.key; l.subjectKey = s.key; l.index = li; index.lessons[l.key] = l; });
      ch.quiz = ch.quiz || { items: [] };
      index.chapters[ch.key] = ch;
    });
    s.chapters = s.chapters.concat(chapters);
    // keep chapters in term order, stable within a term
    s.chapters = s.chapters.map((c, i) => ({ c, i })).sort((a, b) => (a.c.term || 1) - (b.c.term || 1) || (a.c.order || a.i) - (b.c.order || b.i)).map((x) => x.c);
    s.chapters.forEach((c, i) => (c.index = i));
  };

  /* ---------- expand items into concrete questions ---------- */
  function finalize(q, skill, lang) {
    const out = Object.assign({}, q);
    out.skill = q.skill || skill;
    out.lang = q.lang || lang;
    out.iid = U.uid();
    if (out.type === 'mc' && out.tf && out.lang === 'pl' && out.options[0] === 'True') out.options = ['Prawda', 'Fałsz'];
    if (out.type === 'mc' && !out.fixed) {
      const order = U.shuffle(out.options.map((_, i) => i));
      out.options = order.map((i) => q.options[i]);
      out.answer = order.indexOf(q.answer);
    }
    return out;
  }

  LA.STRETCH = {}; // gen name -> (args) => harder args (filled in by gens.js)

  LA.expand = function (items, defaultSkill, opts) {
    opts = opts || {};
    const out = [];
    (items || []).forEach((it) => {
      const skill = it.skill || defaultSkill;
      const lang = LA.langOfKey(skill || 'y');
      if (it.gen) {
        const g = LA.gens[it.gen];
        if (!g) { console.warn('Unknown generator', it.gen); return; }
        let args = Object.assign({}, it.args || {}, { lang });
        const stretch = opts.stretch || it.stretch;
        if (stretch && LA.STRETCH[it.gen]) args = Object.assign(args, LA.STRETCH[it.gen](args));
        const n = opts.nOverride ? opts.nOverride(it.n) : it.n;
        const seen = new Set();
        let guard = 0;
        while (seen.size < n && guard++ < n * 20) {
          const q = g(args);
          const sig = q.q + '|' + JSON.stringify(q.answer) + '|' + (q.svg || '') + (q.say || '');
          if (seen.has(sig)) continue;
          seen.add(sig);
          if (stretch) q.stretch = true;
          out.push(finalize(q, skill, lang));
        }
      } else {
        out.push(finalize(it, skill, lang));
      }
    });
    return out;
  };

  const noWrite = (qs) => qs.filter((q) => q.type !== 'write');

  /* Practise together (guided, right after the lesson) */
  LA.lessonPractice = (lesson) => LA.expand(lesson.practice, lesson.key);

  /* Homework (independent): the lesson's own homework list, or a fresh mix drawn from its practice pool,
     plus "star" (above-par) questions when the child is ready for them. */
  LA.lessonHomework = function (lesson, mastery) {
    let qs;
    if (lesson.homework && lesson.homework.length) qs = LA.expand(lesson.homework, lesson.key);
    else {
      const pool = (lesson.practice || []).filter((p) => p.type !== 'write');
      qs = LA.expand(U.shuffle(pool), lesson.key, { nOverride: (n) => n + 1 });
      qs = U.shuffle(qs).slice(0, Math.max(5, Math.min(8, qs.length)));
    }
    const ch = index.chapters[lesson.chapterKey];
    const ready = mastery == null || mastery >= 0.8;
    if (ready) {
      const stars = (lesson.practice || []).filter((p) => p.gen && LA.STRETCH[p.gen]).slice(0, 1);
      const bankStars = ((ch && ch.challenge) || []).filter((c) => !c.lesson || c.lesson === lesson.id);
      qs = qs.concat(LA.expand(stars.map((s) => Object.assign({}, s, { n: 1 })), lesson.key, { stretch: true }));
      if (bankStars.length) qs = qs.concat(LA.expand(U.sample(bankStars, 1).map((x) => Object.assign({}, x, { stretch: true })), lesson.key));
    }
    const writes = (lesson.homework || []).length ? [] : (lesson.practice || []).filter((p) => p.type === 'write' && p.homework);
    return qs.concat(LA.expand(writes, lesson.key));
  };

  /* Chapter check-up quiz */
  LA.chapterQuiz = function (ch) {
    const want = ch.quiz.n || 10;
    const items = (ch.quiz.items || []).map((q) => Object.assign({}, q, { skill: q.lesson ? ch.key + '.' + q.lesson : q.skill || ch.key }));
    let qs = LA.expand(items, ch.key);
    if (qs.length < want) {
      const pool = [];
      ch.lessons.forEach((l) => (l.practice || []).forEach((p) => pool.push(Object.assign({}, p, { skill: p.skill || l.key }))));
      const extra = noWrite(LA.expand(U.shuffle(pool), ch.key)).filter((q) => !qs.some((x) => x.q === q.q && !q.svg));
      qs = qs.concat(extra.slice(0, want - qs.length));
    }
    return U.shuffle(noWrite(qs)).slice(0, Math.max(want, 1));
  };

  /* Above-par challenge set for a chapter (stretch generators + the chapter's star questions) */
  LA.chapterChallenge = function (ch) {
    const items = [];
    ch.lessons.forEach((l) => (l.practice || []).forEach((p) => { if (p.gen && LA.STRETCH[p.gen]) items.push(Object.assign({}, p, { n: 1, skill: l.key })); }));
    (ch.quiz.items || []).forEach((p) => { if (p.gen && LA.STRETCH[p.gen]) items.push(Object.assign({}, p, { n: 1, skill: p.lesson ? ch.key + '.' + p.lesson : ch.key })); });
    let qs = LA.expand(items, ch.key, { stretch: true });
    const bank = (ch.challenge || []).map((c) => Object.assign({}, c, { stretch: true, skill: c.lesson ? ch.key + '.' + c.lesson : ch.key }));
    qs = qs.concat(LA.expand(bank, ch.key));
    return U.shuffle(noWrite(qs)).slice(0, 8);
  };
  LA.hasChallenge = (ch) => (ch.challenge && ch.challenge.length > 0) || ch.lessons.some((l) => (l.practice || []).some((p) => p.gen && LA.STRETCH[p.gen]));

  /* Practice exam across a whole subject (end-of-year readiness) */
  LA.subjectExam = function (subj, size) {
    size = size || 30;
    const per = Math.max(2, Math.ceil(size / subj.chapters.length));
    let qs = [];
    subj.chapters.forEach((ch) => {
      const q = LA.chapterQuiz(ch).slice(0, per);
      qs = qs.concat(q);
    });
    const stars = [];
    subj.chapters.forEach((ch) => { if (LA.hasChallenge(ch) && Math.random() < 0.35) stars.push(...LA.chapterChallenge(ch).slice(0, 1)); });
    return U.shuffle(qs).slice(0, size - Math.min(stars.length, Math.round(size * 0.2))).concat(stars.slice(0, Math.round(size * 0.2)));
  };

  /* Extra practice for a skill (lesson key or chapter key) */
  LA.skillPractice = function (skill, n, opts) {
    n = n || 6;
    opts = opts || {};
    const lesson = index.lessons[skill];
    let pool = [];
    if (lesson) {
      pool = (lesson.practice || []).concat(lesson.homework || []).map((p) => Object.assign({}, p, { skill: lesson.key }));
      const ch = index.chapters[lesson.chapterKey];
      (ch.quiz.items || []).forEach((q) => { if (q.lesson === lesson.id) pool.push(Object.assign({}, q, { skill: lesson.key })); });
    } else if (index.chapters[skill]) {
      const ch = index.chapters[skill];
      ch.lessons.forEach((l) => (l.practice || []).concat(l.homework || []).forEach((p) => pool.push(Object.assign({}, p, { skill: l.key }))));
      (ch.quiz.items || []).forEach((q) => pool.push(Object.assign({}, q, { skill: q.lesson ? ch.key + '.' + q.lesson : ch.key })));
    }
    pool = pool.map((p) => (p.gen ? Object.assign({}, p, { n: Math.max(p.n, 2) }) : p));
    const qs = noWrite(LA.expand(U.shuffle(pool), skill, { stretch: opts.stretch }));
    return U.shuffle(qs).slice(0, n);
  };

  LA.skillLabel = function (skill) {
    if (index.lessons[skill]) { const l = index.lessons[skill]; return index.chapters[l.chapterKey].title + ' → ' + l.title; }
    if (index.chapters[skill]) return index.chapters[skill].title;
    return skill;
  };
  LA.subjectOf = (key) => index.subjects[String(key).split('.').slice(0, 2).join('.')];
})();

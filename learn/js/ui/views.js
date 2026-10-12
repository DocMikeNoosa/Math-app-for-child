/* Screens + hash router. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const T = LA.tutor;
  const SP = LA.speech;
  const UI = LA.ui;
  const h = UI.h;

  const AVATARS = ['🦘', '🐨', '🦉', '🐢', '🦜', '🐬', '🦈', '🐊', '🦔', '🐧', '🦄', '🐉', '🦊', '🐼', '🚀', '⚽'];
  const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Term 4'];
  const STATUS_ICON = { passed: '✅', 'tested-out': '⚡', 'quiz-ready': '📝', 'in-progress': '✏️', skipped: '⏭️', todo: '○' };
  const STATUS_TEXT = { passed: 'Passed', 'tested-out': 'Tested out', 'quiz-ready': 'Quiz ready', 'in-progress': 'In progress', skipped: 'Skipped (before start point)', todo: 'Not started' };

  let main, topbar;

  /* ---------- router ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, query] = raw.split('?');
    const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    const params = {};
    (query || '').split('&').filter(Boolean).forEach((kv) => { const [k, v] = kv.split('='); params[k] = decodeURIComponent(v || ''); });
    return { parts, params };
  }
  LA.go = (path) => { location.hash = '#/' + path; };

  function route() {
    SP.stop();
    applyTheme();
    const { parts, params } = parseHash();
    const view = parts[0] || '';
    UI.koa.context = null;
    const profile = S.activeProfile();
    if (!profile && view !== 'parent' && view !== 'curriculum') { renderTop(); return viewWelcome(); }
    renderTop();
    main.innerHTML = '';
    window.scrollTo(0, 0);
    UI.koa.setVisible(!!profile && view !== 'parent');
    try {
      switch (view) {
        case '': case 'home': return viewHome();
        case 'profiles': return viewProfiles();
        case 'subject': return viewSubject(parts[1]);
        case 'chapter': return viewChapter(parts[1]);
        case 'lesson': return viewLesson(parts[1], params);
        case 'quiz': return viewQuiz(parts[1], params);
        case 'practice': return viewPractice(parts[1], parts[2], params);
        case 'parent': return viewParent(parts[1] || 'report');
        case 'curriculum': return viewCurriculum();
        default: return viewHome();
      }
    } catch (e) {
      console.error(e);
      main.appendChild(h('div.card', h('h2', 'Oops — something went wrong.'), h('p', String(e.message || e)), h('a.btn', { href: '#/home' }, 'Go home')));
    }
  }

  function applyTheme() {
    const st = S.settings();
    document.documentElement.setAttribute('data-theme', st.theme || 'auto');
    if (!st.theme || st.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    document.body.classList.toggle('bigtext', !!st.bigText);
    document.body.classList.toggle('dyslexia', !!st.spacing);
  }

  function renderTop() {
    topbar.innerHTML = '';
    const p = S.activeProfile();
    topbar.append(h('a.brand', { href: '#/home' }, h('span.logo', '🦘'), h('span.brand-text', 'Aussie Learning Workbook')), h('span.spacer'));
    if (p) {
      const P = S.P();
      topbar.append(
        h('span.chip.hide-sm', { title: 'Days in a row' }, '🔥 ', String(P.streak.count || 0)),
        h('span.chip.hide-sm', { title: 'Stars earned for correct answers' }, '⭐ ', String(P.stars || 0)),
        h('a.chip', { href: '#/profiles', title: 'Switch learner', style: { textDecoration: 'none', color: 'inherit' } }, p.avatar + ' ' + p.name + ' · Year ' + p.year)
      );
    }
    topbar.append(h('a.btn.secondary.small', { href: '#/parent', title: 'Parent area' }, '👪 Parent'));
  }

  function crumbs(list) {
    return h('div.crumbs', list.map((c, i) => [i ? ' › ' : '', c[1] ? h('a', { href: c[1] }, c[0]) : h('span', c[0])]));
  }

  /* ---------- welcome / profiles ---------- */
  function viewWelcome() {
    main.innerHTML = '';
    UI.koa.setVisible(false);
    let avatar = AVATARS[0];
    let year = 3;
    const name = h('input', { type: 'text', placeholder: 'First name', maxlength: 30, 'aria-label': 'Learner first name' });
    const avs = h('div.avatar-pick', AVATARS.map((a) => {
      const b = h('button' + (a === avatar ? '.sel' : ''), { type: 'button', 'aria-label': 'Avatar ' + a }, a);
      b.addEventListener('click', () => { avatar = a; avs.querySelectorAll('button').forEach((x) => x.classList.remove('sel')); b.classList.add('sel'); });
      return b;
    }));
    const yrs = h('div.row', [3, 4].map((y) => {
      const b = h('button.btn' + (y === year ? '' : '.secondary'), { type: 'button' }, 'Year ' + y);
      b.addEventListener('click', () => { year = y; yrs.querySelectorAll('button').forEach((x) => x.className = 'btn secondary'); b.className = 'btn'; });
      return b;
    }));
    main.append(
      h('div.card.stack', { style: { maxWidth: '640px', margin: '20px auto' } },
        h('div', { style: { fontSize: '3em', textAlign: 'center' } }, '🦘🐨📚'),
        h('h1', { style: { textAlign: 'center' } }, 'Welcome to your Learning Workbook!'),
        h('p.muted', { style: { textAlign: 'center' } }, 'Year 3 and Year 4 lessons for every subject in the Australian Curriculum — with read-aloud, quizzes and Koa the koala tutor.'),
        h('div', h('label.field', 'What is the learner’s name?'), name),
        h('div', h('label.field', 'Pick an avatar'), avs),
        h('div', h('label.field', 'Which year level?'), yrs),
        h('button.btn.big', { type: 'button', onclick: () => { S.addProfile(name.value || 'Learner', year, avatar); LA.go('home'); } }, 'Let’s start! →'),
        S.profiles().length ? h('a', { href: '#/profiles' }, 'Back to learners') : null
      )
    );
    name.focus();
  }

  function viewProfiles() {
    main.append(
      h('h1', 'Who is learning today?'),
      h('div.grid.cols-3', S.profiles().map((p) => h('div.card.profile-card', { tabindex: 0, role: 'button', onclick: () => { S.setActive(p.id); LA.go('home'); }, onkeydown: (e) => { if (e.key === 'Enter') { S.setActive(p.id); LA.go('home'); } } }, h('div.av', p.avatar), h('h3', p.name), h('div.muted', 'Year ' + p.year)))),
      h('div.row', { style: { marginTop: '16px' } }, h('button.btn.secondary', { type: 'button', onclick: () => { S.setActive(null); route(); } }, '+ Add a learner'))
    );
  }

  /* ---------- home ---------- */
  function viewHome() {
    const p = S.activeProfile();
    const subjects = LA.curriculum[p.year].subjects;
    const term = U.schoolTerm();
    const hw = T.planToday();
    const open = S.openRemediation().filter((r) => r.skill.startsWith('y' + p.year + '.'));
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    main.append(h('h1', `${greet}, ${p.name}! ${p.avatar}`), h('p.muted', `Year ${p.year} · ${term.label} · ${new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}`));

    // homework
    const doneCount = hw.items.filter((i) => i.done).length;
    const hwCard = h('div.card',
      h('div.row', h('h2', { style: { margin: 0 } }, '📋 Today’s homework'), h('span.spacer'), h('span.chip', `${doneCount}/${hw.items.length} done · about ${hw.items.reduce((s, i) => s + i.minutes, 0)} min`)),
      h('div.bar', { style: { margin: '10px 0 14px' } }, h('span', { style: { width: (hw.items.length ? (doneCount / hw.items.length) * 100 : 0) + '%' } }))
    );
    if (!hw.items.length) hwCard.appendChild(h('p', '🎉 Everything is finished for this year level! Choose any subject below to review.'));
    hw.items.forEach((it) => {
      const href = it.kind === 'lesson' ? '#/lesson/' + it.ref : it.kind === 'quiz' ? '#/quiz/' + it.ref : it.kind === 'remediation' ? '#/practice/rem/' + it.ref : '#/practice/skill/' + encodeURIComponent(it.ref) + '?review=1';
      const label = { lesson: '📖 Lesson', quiz: '📝 Quiz', remediation: '🎯 Extra practice from Koa', review: '🔁 Quick review' }[it.kind];
      hwCard.appendChild(h('a.hw-item' + (it.done ? '.done' : ''), { href }, h('span.tick', it.done ? '✓' : ''), h('div', { style: { flex: 1 } }, h('div.kind', label + ' · ' + it.minutes + ' min'), h('div', { style: { fontWeight: 800 } }, it.title)), h('span', '→')));
    });
    if (doneCount === hw.items.length && hw.items.length) hwCard.appendChild(h('div.banner.good', { style: { marginTop: '12px' } }, '🌟 Homework all done! Brilliant work. You can keep going with any subject, or have a rest.'));
    hwCard.appendChild(h('div.row', { style: { marginTop: '12px' } },
      h('button.btn.secondary.small', { type: 'button', onclick: () => { T.planToday(true); route(); } }, '🔄 Refresh plan'),
      h('span.muted.small', `Daily goal: ${S.settings().dailyMinutes} minutes (a grown-up can change this in Parent area).`)));
    main.appendChild(hwCard);

    // catch-up indicator
    const behind = subjects.map((s) => ({ s, st: T.subjectStats(s) })).filter((x) => x.st.behind > 0);
    if (behind.length) {
      main.appendChild(h('div.card', h('h3', '🚀 Catch-up tracker'),
        h('p.small.muted', `By this point in the school year, a Year ${p.year} class would usually have covered about ${Math.round(U.yearProgress() * 100)}% of the year. To catch up faster: raise the daily minutes, or use “⚡ Test out” on chapters ${p.name} already knows.`),
        h('div', behind.map((x) => h('div.row', { style: { margin: '4px 0' } }, h('span', x.s.icon + ' ' + x.s.name), h('span.spacer'), h('span.tag.warn', `${x.st.behind} chapter${x.st.behind > 1 ? 's' : ''} behind`), h('a.btn.small.secondary', { href: '#/subject/' + x.s.key }, 'Open'))))));
    }

    if (open.length) {
      main.appendChild(h('div.card', h('h3', '🎯 Koa wants you to practise'), h('p.small.muted', 'These are things that were tricky. Finishing them unlocks quiz retakes.'),
        open.slice(0, 6).map((r) => h('a.hw-item', { href: '#/practice/rem/' + r.id }, h('span.tick', '🎯'), h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 800 } }, LA.skillLabel(r.skill)), h('div.small.muted', r.reason)), h('span', '→')))));
    }

    // subjects
    main.appendChild(h('h2', { style: { marginTop: '24px' } }, 'Subjects'));
    main.appendChild(h('div.grid.cols-3', subjects.map((s) => {
      const st = T.subjectStats(s);
      const next = T.nextStep(s);
      return h('a.card.subject-tile', { href: '#/subject/' + s.key, style: { '--c': s.color } },
        h('div.icon', s.icon), h('h3', s.name), h('div.bar', h('span', { style: { width: st.pct * 100 + '%', background: s.color } })),
        h('div.small.muted', { style: { marginTop: '6px' } }, `${st.done}/${st.lessons} lessons · ${st.passed}/${st.chapters} chapters`),
        h('div.small', { style: { marginTop: '4px' } }, next ? (next.kind === 'lesson' ? 'Next: ' + next.lesson.title : 'Next: chapter quiz') : '🏆 All done!'));
    })));
  }

  /* ---------- subject ---------- */
  function viewSubject(key) {
    const s = LA.index.subjects[key];
    if (!s) return LA.go('home');
    const st = T.subjectStats(s);
    const next = T.nextStep(s);
    main.append(crumbs([['Home', '#/home'], [s.name]]),
      h('div.card', { style: { borderTop: '8px solid ' + s.color } },
        h('div.row', h('span', { style: { fontSize: '2.4em' } }, s.icon), h('div', h('h1', { style: { margin: 0 } }, `Year ${s.year} ${s.long || s.name}`), h('div.muted', s.intro || ''))),
        h('div.bar', { style: { margin: '12px 0' } }, h('span', { style: { width: st.pct * 100 + '%', background: s.color } })),
        h('div.row', h('span.chip', `${st.done}/${st.lessons} lessons`), h('span.chip', `${st.passed}/${st.chapters} chapters passed`), st.behind ? h('span.tag.warn', `${st.behind} behind schedule`) : h('span.tag.good', 'On track')),
        h('div.row', { style: { marginTop: '12px' } },
          next ? h('a.btn', { href: next.kind === 'lesson' ? '#/lesson/' + next.lesson.key : '#/quiz/' + next.chapter.key }, next.kind === 'lesson' ? '▶ Continue: ' + next.lesson.title : '📝 Take the "' + next.chapter.title + '" quiz') : h('span.tag.good', '🏆 Subject complete!'),
          h('button.btn.secondary', { type: 'button', onclick: () => chooseStart(s) }, '📍 Choose where to start')
        )
      )
    );
    TERMS.forEach((tname, ti) => {
      const chs = s.chapters.filter((c) => (c.term || 1) === ti + 1);
      if (!chs.length) return;
      main.appendChild(h('div.term-head', tname));
      chs.forEach((ch) => main.appendChild(chapterRow(ch)));
    });
  }

  function chapterRow(ch) {
    const status = T.chapterStatus(ch);
    const done = ch.lessons.filter((l) => S.isLessonDone(l.key)).length;
    const c = S.chapter(ch.key);
    return h('div.card',
      h('div.chapter-row',
        h('div.status.' + status, { title: STATUS_TEXT[status] }, STATUS_ICON[status]),
        h('div', { style: { flex: 1 } },
          h('h3', { style: { margin: '0 0 4px' } }, h('a', { href: '#/chapter/' + ch.key, style: { color: 'inherit' } }, ch.title)),
          h('div', ch.strand ? h('span.tag', ch.strand) : null, ch.code ? h('span.tag.info', ch.code) : null, h('span.tag', `${done}/${ch.lessons.length} lessons`), c && c.best ? h('span.tag' + (c.passed ? '.good' : '.warn'), `Best quiz ${Math.round(c.best * 100)}%`) : null),
          h('div.small.muted', { style: { marginTop: '4px' } }, ch.summary || ''),
          h('div.row', { style: { marginTop: '8px' } },
            h('a.btn.small', { href: '#/chapter/' + ch.key }, status === 'passed' || status === 'tested-out' ? '🔁 Review' : done ? 'Continue' : 'Start'),
            status !== 'passed' && status !== 'tested-out' ? h('a.btn.small.secondary', { href: '#/quiz/' + ch.key + '?mode=testout', title: 'Already know this? Pass the quiz to skip the chapter.' }, '⚡ Test out') : null
          )
        )
      )
    );
  }

  function chooseStart(s) {
    const sel = h('select', { 'aria-label': 'Starting chapter' }, s.chapters.map((c, i) => h('option', { value: i, selected: i === T.startIndex(s) ? true : null }, `${TERMS[(c.term || 1) - 1]} · ${c.title}`)));
    UI.modal('Where should we start?', h('div.stack',
      h('p', 'Jumping in part-way through the year? Pick the chapter to start from. Earlier chapters will be shown as skipped (you can still open them any time, or use ⚡ Test out to prove you know them).'),
      sel), [{ label: 'Cancel', secondary: true }, { label: 'Start here', onclick: () => { S.P().startPoints[s.key] = +sel.value; S.save(); T.planToday(true); route(); } }]);
  }

  /* ---------- chapter ---------- */
  function viewChapter(key) {
    const ch = LA.index.chapters[key];
    if (!ch) return LA.go('home');
    const s = LA.index.subjects[ch.subjectKey];
    UI.koa.context = Object.assign({}, ch, { title: ch.title });
    const status = T.chapterStatus(ch);
    const c = S.chapter(ch.key);
    const blocking = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
    main.append(crumbs([['Home', '#/home'], [s.name, '#/subject/' + s.key], [ch.title]]),
      h('div.card',
        h('h1', ch.title),
        h('div', ch.strand ? h('span.tag', ch.strand) : null, ch.code ? h('span.tag.info', ch.code) : null, h('span.tag', TERMS[(ch.term || 1) - 1]), h('span.tag' + (status === 'passed' || status === 'tested-out' ? '.good' : ''), STATUS_TEXT[status])),
        ch.summary ? h('p', ch.summary) : null,
        ch.outcomes ? h('div', h('strong', 'By the end you will be able to:'), h('ul', ch.outcomes.map((o) => h('li', o)))) : null
      ),
      h('h2', { style: { marginTop: '20px' } }, 'Lessons'),
      h('div.lesson-list', ch.lessons.map((l, i) => {
        const done = S.isLessonDone(l.key);
        const info = S.P().lessons[l.key];
        return h('a', { href: '#/lesson/' + l.key }, h('span.ck' + (done ? '.on' : ''), done ? '✓' : String(i + 1)), h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 800 } }, l.title), h('div.small.muted', `${l.minutes || 12} min${info && info.via === 'tested-out' ? ' · tested out' : ''}${info && info.total ? ` · practice ${info.score}/${info.total}` : ''}`)), h('span', '→'));
      })),
      h('div.card', { style: { marginTop: '16px' } },
        h('h3', '📝 Chapter check-up quiz'),
        h('p.small', `About ${ch.quiz.n || 10} questions. You need ${Math.round(T.PASS_QUIZ * 100)}% to pass. ${c && c.attempts.length ? `Attempts: ${c.attempts.length}, best ${Math.round(c.best * 100)}%.` : ''}`),
        blocking.length ? h('div.banner.warn', `Finish ${blocking.length} extra practice task${blocking.length > 1 ? 's' : ''} first to unlock a retake:`, blocking.map((r) => h('div', h('a', { href: '#/practice/rem/' + r.id }, '🎯 ' + LA.skillLabel(r.skill))))) : null,
        h('div.row', { style: { marginTop: '8px' } },
          h('a.btn' + (blocking.length ? '.secondary' : ''), { href: blocking.length ? '#/practice/rem/' + blocking[0].id : '#/quiz/' + ch.key }, blocking.length ? 'Do extra practice first' : status === 'passed' ? 'Take quiz again' : 'Take the quiz'),
          status !== 'passed' && status !== 'tested-out' ? h('a.btn.secondary', { href: '#/quiz/' + ch.key + '?mode=testout' }, '⚡ Test out') : null,
          h('a.btn.secondary', { href: '#/practice/skill/' + encodeURIComponent(ch.key) }, '🔁 Mixed practice'),
          (status === 'passed' || status === 'tested-out' || ch.lessons.some((l) => S.isLessonDone(l.key))) ? h('button.btn.ghost.small', { type: 'button', onclick: () => UI.confirm('Reset this chapter?', 'This clears the ticks and quiz results for this chapter so it can be done again from scratch.', () => { S.resetChapter(ch.key); route(); }, 'Reset') }, 'Reset chapter') : null
        )
      )
    );
  }

  /* ---------- lesson ---------- */
  function viewLesson(key, params) {
    const l = LA.index.lessons[key];
    if (!l) return LA.go('home');
    const ch = LA.index.chapters[l.chapterKey];
    const s = LA.index.subjects[l.subjectKey];
    UI.koa.context = l;
    const done = S.isLessonDone(l.key);
    const allText = l.blocks.filter((b) => b.text && b.type !== 'listen').map((b) => (b.title ? b.title + '. ' : '') + U.plain(b.text)).join(' ');

    main.append(crumbs([['Home', '#/home'], [s.name, '#/subject/' + s.key], [ch.title, '#/chapter/' + ch.key], [l.title]]),
      h('div.row', h('h1', { style: { margin: 0 } }, l.title), h('span.spacer'), done ? h('span.tag.good', '✓ Done') : null),
      h('div.row', { style: { margin: '8px 0 16px' } }, h('span.chip', `⏱ ${l.minutes || 12} min`), UI.speakBtn(allText, '🔊 Read the whole lesson to me'), T.ai.available() ? h('button.btn.secondary.small', { type: 'button', onclick: () => UI.koa.open('Can you explain this lesson to me in a simple way?') }, '🐨 Explain it to me') : null)
    );
    l.blocks.forEach((b) => main.appendChild(renderBlock(b)));

    const practiceArea = h('div', { id: 'practice' });
    const startBox = h('div.card', { style: { marginTop: '18px', textAlign: 'center' } },
      h('h2', '✏️ Practice time'),
      h('p', l.practice && l.practice.length ? 'Answer the questions to tick off this lesson.' : 'When you have finished the activity, tick off the lesson.'),
      h('button.btn.big', { type: 'button', onclick: () => startPractice(1) }, done ? 'Practise again' : 'Start practice →'));
    main.append(startBox, practiceArea);

    function startPractice(attempt) {
      const qs = LA.lessonPractice(l);
      startBox.classList.add('hidden');
      if (!qs.length) {
        S.markLesson(l.key, {});
        T.markHomework('lesson', l.key);
        return finish({ ok: true, right: 0, total: 0, score: 1 });
      }
      UI.runQuestions(practiceArea, qs, { mode: 'practice', ctx: l, onDone: (results) => finish(T.afterPractice(l, results, attempt), attempt) });
      practiceArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function finish(r, attempt) {
      practiceArea.innerHTML = '';
      const nextLesson = ch.lessons[l.index + 1];
      const card = h('div.card.stack', { style: { textAlign: 'center' } });
      if (r.ok || r.movedOn) {
        T.markHomework('lesson', l.key);
        if (r.ok && r.score >= 0.8) UI.confetti();
        card.append(
          h('div.result-big', r.total ? `${r.right}/${r.total}` : '✓'),
          h('h2', r.ok ? (r.score >= 0.8 ? '🌟 Lesson complete! Fantastic!' : '✓ Lesson complete — good effort!') : 'Lesson ticked off — Koa added extra practice for later.'),
          r.ok && r.score < 0.8 && r.total ? h('p.muted', 'Koa added a little extra practice to your homework to make it stick.') : null,
          h('div.row', { style: { justifyContent: 'center' } },
            nextLesson ? h('a.btn.big', { href: '#/lesson/' + nextLesson.key }, 'Next lesson: ' + nextLesson.title + ' →') : h('a.btn.big', { href: '#/quiz/' + ch.key }, '📝 Take the chapter quiz →'),
            h('a.btn.secondary', { href: '#/home' }, 'Back to homework'))
        );
      } else {
        card.append(
          h('div.result-big', `${r.right}/${r.total}`),
          h('h2', 'Let’s look at this one again together 💪'),
          h('p', 'That’s okay — tricky things take practice! Re-read the lesson above (press 🔊 to have it read to you), then try a fresh set of questions.'),
          T.ai.available() ? UI.aiBox('Koa teaches it another way', () => T.ai.reteach(l.key)) : h('div.banner.info', 'Tip: ask a grown-up to read through the examples with you.'),
          h('div.row', { style: { justifyContent: 'center' } },
            h('button.btn.big', { type: 'button', onclick: () => startPractice((attempt || 1) + 1) }, 'Try new questions →'),
            h('button.btn.secondary', { type: 'button', onclick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }, '⬆ Re-read lesson'))
        );
      }
      practiceArea.appendChild(card);
      renderTop();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // lesson navigation
    const prev = ch.lessons[l.index - 1];
    const next = ch.lessons[l.index + 1];
    main.appendChild(h('div.row.no-print', { style: { marginTop: '20px' } }, prev ? h('a.btn.secondary', { href: '#/lesson/' + prev.key }, '← ' + prev.title) : null, h('span.spacer'), next ? h('a.btn.secondary', { href: '#/lesson/' + next.key }, next.title + ' →') : h('a.btn.secondary', { href: '#/chapter/' + ch.key }, 'Chapter overview')));
    if (S.settings().autoRead) setTimeout(() => SP.say(allText), 400);
  }

  function renderBlock(b) {
    const label = { read: '', example: '💡 Worked example', tip: '⭐ Remember', listen: '🎧 Listening', activity: '🙌 Activity', vocab: '📚 Word bank', visual: '' }[b.type] || '';
    const card = h('div.card.block.' + b.type);
    const speakText = b.type === 'vocab' ? b.words.map((w) => w[0] + ': ' + w[1]).join('. ') : (b.title ? b.title + '. ' : '') + U.plain(b.text || '');
    if (b.type !== 'visual') card.appendChild(h('div.block-tools', UI.speakBtn(speakText, b.type === 'listen' ? '🎧 Listen' : '🔊')));
    if (label || b.title) card.appendChild(h('div.block-label', [label, b.title && label ? ' — ' : '', b.title || ''].join('')));
    if (b.type === 'listen') {
      card.appendChild(h('p', b.intro || 'Press 🎧 Listen and listen carefully. Then answer the questions in the practice. Try not to read the words — just listen!'));
      const words = h('div.hidden', { html: U.fmt(b.text) });
      const toggle = h('button.btn.ghost.small', { type: 'button' }, '👀 Show the words');
      toggle.addEventListener('click', () => { words.classList.toggle('hidden'); toggle.textContent = words.classList.contains('hidden') ? '👀 Show the words' : '🙈 Hide the words'; });
      card.append(toggle, words);
      return card;
    }
    if (b.type === 'vocab') {
      card.appendChild(h('dl.vocab', b.words.map((w) => [h('dt', w[0]), h('dd', w[1])])));
      return card;
    }
    if (b.svg) card.appendChild(h('div.visual', { html: b.svg }));
    if (b.text) card.appendChild(h('div', { html: U.fmt(b.text) }));
    if (b.type === 'activity') card.appendChild(h('label.row', { style: { marginTop: '8px', cursor: 'pointer' } }, h('input', { type: 'checkbox', style: { width: '24px', height: '24px' } }), h('strong', 'I did it!')));
    return card;
  }

  /* ---------- quiz ---------- */
  function viewQuiz(key, params) {
    const ch = LA.index.chapters[key];
    if (!ch) return LA.go('home');
    const s = LA.index.subjects[ch.subjectKey];
    const mode = params.mode === 'testout' ? 'testout' : 'quiz';
    UI.koa.context = Object.assign({}, ch);
    const blocking = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
    main.append(crumbs([['Home', '#/home'], [s.name, '#/subject/' + s.key], [ch.title, '#/chapter/' + ch.key], [mode === 'testout' ? 'Test out' : 'Quiz']]));
    const area = h('div');
    const intro = h('div.card.stack', { style: { textAlign: 'center', maxWidth: '640px', margin: '0 auto' } },
      h('div', { style: { fontSize: '3em' } }, mode === 'testout' ? '⚡' : '📝'),
      h('h1', (mode === 'testout' ? 'Test out: ' : 'Quiz: ') + ch.title),
      h('p', mode === 'testout'
        ? `Think you already know this chapter? Score ${Math.round(T.PASS_QUIZ * 100)}% or more and the whole chapter is ticked off — a great way to catch up fast!`
        : `Show what you know! You need ${Math.round(T.PASS_QUIZ * 100)}% to pass. You won’t see answers until the end.`),
      h('p.small.muted', 'Take your time. Press 🔊 on any question to hear it read out.'),
      blocking.length && mode !== 'testout' ? h('div.banner.warn', 'Koa suggests finishing your extra practice first: ', blocking.map((r) => h('div', h('a', { href: '#/practice/rem/' + r.id }, '🎯 ' + LA.skillLabel(r.skill))))) : null,
      h('div.row', { style: { justifyContent: 'center' } },
        h('button.btn.big', { type: 'button', disabled: blocking.length && mode !== 'testout' ? true : null, onclick: start }, 'Start →'),
        blocking.length && mode !== 'testout' ? h('a.btn.secondary', { href: '#/practice/rem/' + blocking[0].id }, 'Do extra practice') : null)
    );
    main.append(intro, area);

    function start() {
      intro.remove();
      const qs = LA.chapterQuiz(ch);
      UI.runQuestions(area, qs, { mode: 'quiz', ctx: ch, onDone: (results) => showResults(results) });
    }

    function showResults(results) {
      const r = T.afterQuiz(ch, results, mode);
      T.markHomework('quiz', ch.key);
      renderTop();
      area.innerHTML = '';
      if (r.passed) UI.confetti();
      const card = h('div.card.stack', { style: { maxWidth: '760px', margin: '0 auto' } },
        h('div.result-big', `${r.right}/${r.total}`),
        h('h2', { style: { textAlign: 'center' } }, r.passed ? (mode === 'testout' ? '⚡ Tested out! Chapter complete!' : '🏆 You passed! Chapter complete!') : mode === 'testout' ? 'Not quite enough to test out — no problem!' : 'Not passed yet — let’s fix the tricky bits 💪'),
        h('p', { style: { textAlign: 'center' } }, r.passed
          ? (r.weak.length ? 'Koa added a quick review of the ones you missed.' : 'Perfect — nothing to review!')
          : mode === 'testout' ? 'Work through the lessons and you’ll have it in no time. Koa noted which parts to focus on.' : 'Koa has set up extra practice on exactly the parts you missed. Finish it, then retake the quiz.')
      );
      // per-question review
      const list = h('div');
      results.forEach((res, i) => {
        const q = res.q;
        const correctTxt = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
        const givenTxt = q.type === 'mc' ? q.options[res.given] : res.given;
        const item = h('div.review-q' + (res.correct ? '.ok' : ''),
          h('div', h('strong', `${i + 1}. `), h('span', { html: U.fmt(q.q).replace(/^<p>|<\/p>$/g, '') })),
          q.svg && !res.correct ? h('div.visual', { html: q.svg }) : null,
          h('div.small', res.correct ? '✅ ' + givenTxt : `❌ You said: ${givenTxt || '(blank)'} · ✅ Answer: ${correctTxt}`),
          !res.correct && q.explain ? h('div.small', { html: U.fmt(q.explain) }) : null);
        if (!res.correct && T.ai.available()) {
          const b = h('button.btn.secondary.small', { type: 'button' }, '🐨 Explain this one');
          b.addEventListener('click', () => b.replaceWith(UI.aiBox('Koa explains', () => T.ai.explainMistake(q, res.given, ch))));
          item.appendChild(b);
        }
        list.appendChild(item);
      });
      card.appendChild(h('details', { open: !r.passed ? true : null }, h('summary', h('strong', 'See all answers')), list));
      const rems = S.openRemediation().filter((x) => x.chapterKey === ch.key);
      if (rems.length) card.appendChild(h('div.stack', h('h3', '🎯 Your extra practice'), rems.map((x) => h('a.hw-item', { href: '#/practice/rem/' + x.id }, h('span.tick', '🎯'), h('div', { style: { flex: 1 } }, h('strong', LA.skillLabel(x.skill)), h('div.small.muted', x.reason)), h('span', '→')))));
      card.appendChild(h('div.row', { style: { justifyContent: 'center' } },
        r.passed ? h('a.btn.big', { href: '#/subject/' + s.key }, 'Back to ' + s.name + ' →') : rems.length ? h('a.btn.big', { href: '#/practice/rem/' + rems[0].id }, 'Start extra practice →') : h('a.btn.big', { href: '#/chapter/' + ch.key }, 'Back to lessons'),
        h('a.btn.secondary', { href: '#/home' }, 'Home')));
      area.appendChild(card);
    }
  }

  /* ---------- practice (remediation / review / mixed) ---------- */
  function viewPractice(kind, ref, params) {
    let rem = null, skill = ref;
    if (kind === 'rem') {
      rem = S.P().remediation.find((r) => r.id === ref);
      if (!rem) return LA.go('home');
      skill = rem.skill;
    }
    if (!LA.index.lessons[skill] && !LA.index.chapters[skill]) return LA.go('home');
    const lesson = LA.index.lessons[skill];
    const ch = lesson ? LA.index.chapters[lesson.chapterKey] : LA.index.chapters[skill];
    const s = LA.index.subjects[ch.subjectKey];
    UI.koa.context = lesson || ch;
    const title = rem ? 'Extra practice' : params.review ? 'Quick review' : 'Mixed practice';
    main.append(crumbs([['Home', '#/home'], [s.name, '#/subject/' + s.key], [ch.title, '#/chapter/' + ch.key], [title]]));
    const area = h('div');
    const m = S.mastery(skill);
    const intro = h('div.card.stack', { style: { maxWidth: '700px', margin: '0 auto' } },
      h('h1', '🎯 ' + title + ': ' + LA.skillLabel(skill)),
      rem ? h('div.banner.info', rem.reason) : null,
      m != null ? h('div.small.muted', `Koa’s mastery meter for this skill: ${Math.round(m * 100)}%`) : null,
      h('p', rem ? `Get ${Math.round(T.PASS_REMEDIATION * 100)}% or more to finish this task.` : 'A short set of questions to keep this skill sharp.'),
      h('div.row',
        lesson ? h('a.btn.secondary', { href: '#/lesson/' + lesson.key }, '📖 Re-read the lesson') : null,
        T.ai.available() ? h('button.btn.secondary', { type: 'button', onclick: (e) => { e.target.replaceWith(UI.aiBox('Koa teaches it again', () => T.ai.reteach(skill))); } }, '🐨 Teach me again a different way') : null),
      h('div.row', { style: { marginTop: '8px' } },
        h('button.btn.big', { type: 'button', onclick: () => start(LA.skillPractice(skill, 6)) }, 'Start practice →'),
        T.ai.available() ? h('button.btn.secondary', { type: 'button', onclick: aiStart }, '🐨 Koa, make me new questions') : null)
    );
    main.append(intro, area);

    function aiStart(e) {
      const b = e.target;
      b.disabled = true;
      b.textContent = 'Koa is writing questions…';
      T.ai.generatePractice(skill, 6)
        .then((qs) => start(qs))
        .catch((err) => { b.textContent = '⚠️ ' + err.message + ' — using built-in questions'; setTimeout(() => start(LA.skillPractice(skill, 6)), 1500); });
    }

    function start(qs) {
      intro.classList.add('hidden');
      UI.runQuestions(area, qs, { mode: 'practice', ctx: lesson || ch, onDone: done });
    }
    function done(results) {
      area.innerHTML = '';
      let ok = true, right = results.filter((r) => r.correct).length, total = results.length;
      if (rem) { const r = T.afterRemediation(rem, results); ok = r.ok; T.markHomework('remediation', rem.id); }
      else { ok = total ? right / total >= 0.8 : true; T.markHomework('review', skill); S.log('review', skill, 6); }
      if (ok) UI.confetti();
      renderTop();
      const blockingLeft = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
      const nextRem = S.openRemediation().find((r) => r.skill.startsWith('y' + S.activeProfile().year + '.'));
      area.appendChild(h('div.card.stack', { style: { textAlign: 'center', maxWidth: '640px', margin: '0 auto' } },
        h('div.result-big', `${right}/${total}`),
        h('h2', ok ? '🌟 Nailed it!' : 'Getting there! Let’s keep at it 💪'),
        h('p', ok ? (rem ? 'This extra practice is finished.' : 'Great review!') : 'Have another go with fresh questions. Re-reading the lesson or asking Koa helps too.'),
        !ok && T.ai.available() ? UI.aiBox('Koa teaches it again', () => T.ai.reteach(skill)) : null,
        h('div.row', { style: { justifyContent: 'center' } },
          !ok ? h('button.btn.big', { type: 'button', onclick: () => start(LA.skillPractice(skill, 6)) }, 'Try again →') : null,
          ok && rem && rem.blocking && !blockingLeft.length ? h('a.btn.big', { href: '#/quiz/' + ch.key }, '📝 Retake the quiz →') : null,
          ok && nextRem ? h('a.btn' + (rem && rem.blocking && !blockingLeft.length ? '.secondary' : ''), { href: '#/practice/rem/' + nextRem.id }, 'Next practice: ' + LA.skillLabel(nextRem.skill)) : null,
          h('a.btn.secondary', { href: '#/home' }, 'Home'))
      ));
    }
  }

  /* ---------- parent area ---------- */
  let parentUnlocked = false;
  function viewParent(tab) {
    const st = S.settings();
    if (st.pin && !parentUnlocked) {
      const inp = h('input', { type: 'password', inputmode: 'numeric', placeholder: 'PIN', 'aria-label': 'Parent PIN' });
      const msg = h('div.small');
      const go = () => { if (inp.value === st.pin) { parentUnlocked = true; route(); } else { msg.textContent = 'That PIN is not right.'; inp.value = ''; } };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      main.append(h('div.card.stack', { style: { maxWidth: '420px', margin: '30px auto' } }, h('h1', '👪 Grown-ups only'), h('p', 'Enter the parent PIN.'), inp, msg, h('button.btn', { type: 'button', onclick: go }, 'Unlock')));
      setTimeout(() => inp.focus(), 30);
      return;
    }
    const tabs = [['report', '📊 Report'], ['settings', '⚙️ Settings'], ['children', '👧 Learners'], ['data', '💾 Backup']];
    main.append(h('h1', '👪 Parent area'), h('div.row', { style: { marginBottom: '14px' } }, tabs.map(([k, l]) => h('a.btn' + (k === tab ? '' : '.secondary') + '.small', { href: '#/parent/' + k }, l)), h('span.spacer'), h('a.btn.ghost.small', { href: '#/curriculum' }, 'Curriculum coverage')));
    if (tab === 'settings') return parentSettings();
    if (tab === 'children') return parentChildren();
    if (tab === 'data') return parentData();
    return parentReport();
  }

  function parentReport() {
    const p = S.activeProfile();
    if (!p) { main.appendChild(h('div.card', h('p', 'Add a learner first.'), h('a.btn', { href: '#/profiles' }, 'Add learner'))); return; }
    const P = S.P();
    const subjects = LA.curriculum[p.year].subjects;
    main.appendChild(h('div.row', h('h2', { style: { margin: 0 } }, `${p.avatar} ${p.name} — Year ${p.year}`), h('span.spacer'), h('button.btn.secondary.small', { type: 'button', onclick: () => window.print() }, '🖨 Print')));
    const totalMin = P.log.reduce((s2, l) => s2 + (l.minutes || 0), 0);
    const week = P.log.filter((l) => Date.now() - l.at < 7 * 86400000).reduce((s2, l) => s2 + (l.minutes || 0), 0);
    main.appendChild(h('div.grid.cols-3', { style: { margin: '12px 0' } },
      h('div.card.stat', h('div.n', String(P.streak.count || 0)), h('div.muted', 'day streak')),
      h('div.card.stat', h('div.n', '~' + week), h('div.muted', 'minutes this week')),
      h('div.card.stat', h('div.n', '~' + totalMin), h('div.muted', 'minutes total')),
      h('div.card.stat', h('div.n', String(S.openRemediation().filter((r) => r.skill.startsWith('y' + p.year + '.')).length)), h('div.muted', 'open extra-practice tasks'))));

    main.appendChild(h('div.card', h('h3', 'Progress by subject'), h('table.report', h('tr', h('th', 'Subject'), h('th', 'Lessons'), h('th', 'Chapters passed'), h('th', 'Expected by now*'), h('th', 'Status')),
      subjects.map((s) => { const st = T.subjectStats(s); return h('tr', h('td', s.icon + ' ' + s.name), h('td', `${st.done}/${st.lessons}`), h('td', `${st.passed}/${st.chapters}`), h('td', String(st.expected)), h('td', st.behind ? h('span.tag.warn', st.behind + ' behind') : h('span.tag.good', 'On track'))); })),
      h('p.small.muted', '*Based on how far through the school year (Feb–Dec) today is. Terms differ slightly between states.')));

    const weak = T.weakSkills(12);
    main.appendChild(h('div.card', h('h3', 'Skills needing attention'), weak.length ? h('table.report', h('tr', h('th', 'Skill'), h('th', 'Recent accuracy'), h('th', 'Answers'), h('th', '')), weak.map((w) => h('tr', h('td', LA.skillLabel(w.skill)), h('td', h('span.tag.bad', Math.round(w.m * 100) + '%')), h('td', String(w.n)), h('td', h('a.btn.small.secondary', { href: '#/practice/skill/' + encodeURIComponent(w.skill) }, 'Practise'))))) : h('p.muted', 'Nothing flagged yet — keep going!')));

    const quizRows = [];
    Object.keys(P.chapters).forEach((k) => { const ch = LA.index.chapters[k]; if (!ch || !k.startsWith('y' + p.year + '.')) return; P.chapters[k].attempts.forEach((a) => quizRows.push({ ch, a, passed: P.chapters[k].passed, via: P.chapters[k].via })); });
    quizRows.sort((a, b) => b.a.at - a.a.at);
    main.appendChild(h('div.card', h('h3', 'Quiz history'), quizRows.length ? h('table.report', h('tr', h('th', 'Date'), h('th', 'Chapter'), h('th', 'Score')), quizRows.slice(0, 30).map((r) => h('tr', h('td', new Date(r.a.at).toLocaleDateString('en-AU')), h('td', LA.subjectOf(r.ch.key).name + ': ' + r.ch.title), h('td', `${r.a.score}/${r.a.total} (${Math.round((r.a.score / r.a.total) * 100)}%)`)))) : h('p.muted', 'No quizzes yet.')));

    const mistakes = P.mistakes.filter((m) => m.skill.startsWith('y' + p.year + '.')).slice(-20).reverse();
    main.appendChild(h('div.card', h('h3', 'Recent mistakes'), mistakes.length ? h('table.report', h('tr', h('th', 'Skill'), h('th', 'Question'), h('th', 'Said'), h('th', 'Answer')), mistakes.map((m) => h('tr', h('td.small', LA.skillLabel(m.skill)), h('td.small', m.q), h('td', m.given), h('td', m.correct)))) : h('p.muted', 'None yet.')));

    const ai = h('div.card', h('h3', '🐨 AI progress summary'));
    if (T.ai.available()) ai.appendChild(h('button.btn', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox('Summary for parents', () => T.ai.parentSummary())) }, 'Write a summary with suggestions'));
    else ai.appendChild(h('p.muted', 'Add an API key in Settings to get an AI-written summary of strengths, misconceptions and a plan for next week.'));
    main.appendChild(ai);
  }

  function parentSettings() {
    const st = S.settings();
    const key = h('input', { type: 'password', placeholder: 'sk-ant-…', value: st.apiKey || '', autocomplete: 'off', 'aria-label': 'Anthropic API key' });
    const model = h('select', { 'aria-label': 'AI model' }, [['claude-opus-5-5', 'Claude Opus 5.5 — best explanations (default)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 — fast and capable, lower cost'], ['claude-haiku-5-5', 'Claude Haiku 5.5 — fastest, lowest cost']].map(([v, l]) => h('option', { value: v, selected: st.model === v ? true : null }, l)));
    const aiOn = h('input', { type: 'checkbox', checked: st.aiEnabled ? true : null });
    const testOut = h('div.small');
    const voices = SP.voices();
    const voice = h('select', { 'aria-label': 'Voice' }, h('option', { value: '' }, 'Automatic (Australian English if available)'), voices.map((v) => h('option', { value: v.voiceURI, selected: st.voiceURI === v.voiceURI ? true : null }, `${v.name} (${v.lang})`)));
    const rate = h('input', { type: 'range', min: 0.6, max: 1.3, step: 0.05, value: st.rate, 'aria-label': 'Reading speed' });
    const autoRead = h('input', { type: 'checkbox', checked: st.autoRead ? true : null });
    const mins = h('select', { 'aria-label': 'Daily minutes' }, [15, 20, 30, 45, 60, 90].map((m) => h('option', { value: m, selected: +st.dailyMinutes === m ? true : null }, m + ' minutes' + (m >= 45 ? ' (catch-up pace)' : m <= 20 ? ' (light)' : ''))));
    const theme = h('select', { 'aria-label': 'Theme' }, [['auto', 'Match device'], ['light', 'Light'], ['dark', 'Dark']].map(([v, l]) => h('option', { value: v, selected: (st.theme || 'auto') === v ? true : null }, l)));
    const big = h('input', { type: 'checkbox', checked: st.bigText ? true : null });
    const spacing = h('input', { type: 'checkbox', checked: st.spacing ? true : null });
    const pin = h('input', { type: 'password', inputmode: 'numeric', placeholder: 'Leave blank for no PIN', value: st.pin || '', maxlength: 8, 'aria-label': 'Parent PIN' });
    const saved = h('span.small.muted');

    function saveAll() {
      S.setSetting('apiKey', key.value.trim());
      S.setSetting('model', model.value);
      S.setSetting('aiEnabled', aiOn.checked);
      S.setSetting('voiceURI', voice.value);
      S.setSetting('rate', +rate.value);
      S.setSetting('autoRead', autoRead.checked);
      if (+mins.value !== +st.dailyMinutes) { S.setSetting('dailyMinutes', +mins.value); if (S.activeProfile()) T.planToday(true); }
      S.setSetting('theme', theme.value);
      S.setSetting('bigText', big.checked);
      S.setSetting('spacing', spacing.checked);
      S.setSetting('pin', pin.value.trim());
      S.saveNow();
      applyTheme();
      saved.textContent = '✓ Saved';
      setTimeout(() => (saved.textContent = ''), 2000);
    }

    main.append(
      h('div.card.stack',
        h('h3', '🐨 AI tutor (Claude)'),
        h('p.small', 'The app works fully without AI: lessons, read-aloud, quizzes, automatic extra practice and progress tracking are all built in. Adding a Claude API key switches on Koa’s chat, “explain it another way”, re-teaching, custom extra questions, writing feedback and the parent summary.'),
        h('div', h('label.field', 'Anthropic API key'), key, h('div.field-hint', 'Get a key at console.anthropic.com. It is stored only in this browser on this device and is sent only to api.anthropic.com. Usage is billed to your Anthropic account. Don’t use this on a shared computer.')),
        h('div', h('label.field', 'Model'), model, h('div.field-hint', 'Opus 5.5 gives the best explanations. Sonnet 5.5 and Haiku 5.5 cost less per answer.')),
        h('label.row', aiOn, 'AI features switched on'),
        h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: () => { saveAll(); testOut.textContent = 'Testing…'; T.ai.call([{ role: 'user', content: 'Say a one-sentence hello to a Year 3 student.' }], { max_tokens: 300 }).then((t) => (testOut.textContent = '✓ Working: ' + t)).catch((e) => (testOut.textContent = '⚠️ ' + e.message)); } }, 'Test the AI connection'), testOut)
      ),
      h('div.card.stack',
        h('h3', '🔊 Reading aloud'),
        h('p.small', 'Read-aloud uses your device’s built-in voices (no internet or key needed). For the best Australian voice on Windows/Android/iPad, install an “English (Australia)” voice in your device’s speech settings.'),
        h('div', h('label.field', 'Voice'), voice),
        h('div', h('label.field', 'Reading speed'), rate),
        h('label.row', autoRead, 'Read lessons and questions out loud automatically (great for early readers)'),
        h('button.btn.secondary.small', { type: 'button', onclick: () => { saveAll(); SP.say('G’day! I am going to read your lessons to you. Let’s learn together!'); } }, '▶ Test voice')
      ),
      h('div.card.stack',
        h('h3', '📅 Homework & pace'),
        h('div', h('label.field', 'Daily homework time'), mins, h('div.field-hint', 'Higher settings add more lessons per day to help a child catch up faster. Chapters a child already knows can be skipped with “⚡ Test out”.'))
      ),
      h('div.card.stack',
        h('h3', '👀 Display'),
        h('div', h('label.field', 'Theme'), theme),
        h('label.row', big, 'Larger text'),
        h('label.row', spacing, 'Extra letter and line spacing (can help with reading difficulties)')
      ),
      h('div.card.stack', h('h3', '🔒 Parent PIN'), pin, h('div.field-hint', 'Stops children changing settings or seeing answers in the report.')),
      h('div.row', h('button.btn.big', { type: 'button', onclick: saveAll }, 'Save settings'), saved)
    );
  }

  function parentChildren() {
    S.profiles().forEach((p) => {
      const name = h('input', { type: 'text', value: p.name, 'aria-label': 'Name' });
      const yr = h('select', { 'aria-label': 'Year' }, [3, 4].map((y) => h('option', { value: y, selected: p.year === y ? true : null }, 'Year ' + y)));
      main.appendChild(h('div.card.stack', h('div.row', h('span', { style: { fontSize: '2em' } }, p.avatar), h('strong', p.name), S.state().active === p.id ? h('span.tag.good', 'Active') : null),
        h('div.row', h('div', { style: { flex: 2, minWidth: '180px' } }, name), h('div', { style: { flex: 1, minWidth: '120px' } }, yr)),
        h('div.small.muted', 'Changing year switches to that year’s workbook. Progress in each year is kept separately.'),
        h('div.row',
          h('button.btn.small', { type: 'button', onclick: () => { S.updateProfile(p.id, { name: name.value.trim() || p.name, year: +yr.value }); S.saveNow(); route(); } }, 'Save'),
          h('button.btn.small.secondary', { type: 'button', onclick: () => { S.setActive(p.id); LA.go('home'); } }, 'Switch to this learner'),
          h('button.btn.small.ghost', { type: 'button', onclick: () => UI.confirm('Delete ' + p.name + '?', 'All of ' + p.name + '’s progress will be deleted from this device. This cannot be undone.', () => { S.deleteProfile(p.id); route(); }, 'Delete') }, '🗑 Delete'))));
    });
    main.appendChild(h('button.btn', { type: 'button', onclick: () => { S.setActive(null); LA.go('home'); } }, '+ Add a learner'));
  }

  function parentData() {
    const file = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Backup file' });
    const msg = h('div.small');
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { S.importJSON(r.result); msg.textContent = '✓ Backup restored.'; renderTop(); } catch (e) { msg.textContent = '⚠️ ' + e.message; } };
      r.readAsText(f);
    });
    main.append(
      h('div.card.stack', h('h3', '💾 Back up progress'), h('p.small', 'All progress is saved in this browser automatically. Download a backup to keep it safe or move it to another device (your API key is not included).'),
        h('button.btn', { type: 'button', onclick: () => { const blob = new Blob([S.exportJSON()], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: 'learning-workbook-backup-' + U.todayKey() + '.json' }); document.body.appendChild(a); a.click(); a.remove(); } }, '⬇ Download backup')),
      h('div.card.stack', h('h3', '⬆ Restore a backup'), file, msg),
      h('div.card.stack', h('h3', '⚠️ Start over'), h('p.small', 'Deletes every learner and all progress and settings on this device.'), h('button.btn.secondary', { type: 'button', onclick: () => UI.confirm('Delete everything?', 'This removes all learners, progress and settings from this device.', () => { S.wipeAll(); parentUnlocked = false; LA.go('home'); }, 'Delete everything') }, 'Delete all data'))
    );
  }

  /* ---------- curriculum coverage ---------- */
  function viewCurriculum() {
    main.append(crumbs([['Home', '#/home'], ['Curriculum coverage']]),
      h('h1', 'Curriculum coverage'),
      h('div.card.stack',
        h('p', 'The workbooks follow the learning areas, strands and content of the Australian Curriculum Version 9.0 for Year 3 and Year 4. Where a chapter shows a content-description code (e.g. AC9S3U01) it has been matched to that code. Each school and state (e.g. NSW syllabus, Victorian Curriculum) may order topics differently — use “Choose where to start” and “Test out” to line the app up with your child’s class.'),
        h('p', h('strong', 'Languages: '), 'Schools choose which language to teach (e.g. Japanese, Indonesian, Italian, Auslan), so a languages workbook is not included.'),
        h('p.small.muted', 'This app supports learning at home. It is not an official ACARA product and does not replace your child’s school reports or teacher.')
      )
    );
    [3, 4].forEach((y) => {
      main.appendChild(h('h2', { style: { marginTop: '22px' } }, 'Year ' + y));
      LA.curriculum[y].subjects.forEach((s) => {
        main.appendChild(h('details.card', h('summary', h('strong', `${s.icon} ${s.long || s.name}`), ` — ${s.chapters.length} chapters, ${s.chapters.reduce((n, c) => n + c.lessons.length, 0)} lessons`),
          h('table.report', h('tr', h('th', 'Term'), h('th', 'Chapter'), h('th', 'Strand'), h('th', 'Code')), s.chapters.map((c) => h('tr', h('td', String(c.term || 1)), h('td', c.title), h('td.small', c.strand || ''), h('td.small', c.code || ''))))));
      });
    });
  }

  /* ---------- boot ---------- */
  LA.start = function () {
    topbar = document.getElementById('topbar');
    main = document.getElementById('main');
    UI.initKoa();
    window.addEventListener('hashchange', route);
    // a link to the page we're already on should still refresh it (e.g. "Take quiz" from its own results)
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#/"]');
      if (a && a.getAttribute('href') === location.hash) { e.preventDefault(); route(); }
    });
    route();
  };
})();

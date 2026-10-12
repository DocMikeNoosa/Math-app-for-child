/* Screens + in-memory router (works inside the claude.ai frame, where URL changes are not reliable). */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const T = LA.tutor;
  const SP = LA.speech;
  const AI = LA.ai;
  const UI = LA.ui;
  const h = UI.h;
  const tr = (en, pl) => LA.tr(en, pl);

  const AVATARS = ['🦘', '🐨', '🦉', '🐢', '🦜', '🐬', '🦊', '🐼', '🦄', '🐧', '🦔', '🐝', '🚀', '⚽', '🎻', '🌻'];
  const STATUS_ICON = { passed: 'check', 'tested-out': 'bolt', 'quiz-ready': 'doc', 'in-progress': 'pencil', skipped: 'chevronR', todo: 'book' };
  const statusText = (s) => ({ passed: tr('Passed', 'Zaliczone'), 'tested-out': tr('Tested out', 'Zaliczone testem'), 'quiz-ready': tr('Quiz ready', 'Gotowe do sprawdzianu'), 'in-progress': tr('In progress', 'W trakcie'), skipped: tr('Skipped', 'Pominięte'), todo: tr('Not started', 'Nierozpoczęte') }[s]);
  const termLabel = (prog, t) => (prog === 'pl' ? (t === 1 ? 'I semestr' : 'II semestr') : 'Term ' + t);

  let shell, main, sidebar, topbar, tabbar;
  let current = { path: 'home', params: {} };
  const history = [];

  /* ---------- router ---------- */
  LA.go = (path, params, opts) => {
    if (!(opts && opts.replace)) history.push(current);
    if (history.length > 50) history.shift();
    current = { path: path || 'home', params: params || {} };
    try { if (!window.claude) window.history.replaceState(null, '', '#/' + current.path); } catch (e) { /* ignore */ }
    route();
  };
  LA.back = () => { current = history.pop() || { path: 'home', params: {} }; route(); };
  LA.refresh = () => route();

  function progForPath(parts) {
    const key = parts[1];
    if (key && /^[yp][34]\./.test(key)) return LA.progOfKey(key);
    if (parts[0] === 'practice' && parts[1] === 'rem') { const r = S.P() && S.P().remediation.find((x) => x.id === parts[2]); if (r) return LA.progOfKey(r.skill); }
    if (parts[0] === 'practice' && parts[2]) return LA.progOfKey(parts[2]);
    return null;
  }

  function route() {
    SP.stop();
    applyTheme();
    const parts = current.path.split('/').filter(Boolean);
    const view = parts[0] || 'home';
    const p = S.activeProfile();
    const forced = progForPath(parts);
    if (forced && forced !== LA.state.prog) { LA.state.prog = forced; S.state().settings.lastProg = forced; }
    if (p && !p[LA.state.prog].on) { const other = LA.state.prog === 'au' ? 'pl' : 'au'; if (p[other].on) LA.state.prog = other; }
    LA.state.forceLang = view === 'parent' || view === 'curriculum' ? (S.settings().parentLang || 'en') : null;
    document.documentElement.lang = LA.lang() === 'pl' ? 'pl' : 'en-AU';
    UI.tutor.context = null;
    renderChrome(view);
    main.innerHTML = '';
    window.scrollTo(0, 0);
    if (!p && !['parent', 'curriculum', 'help'].includes(view)) { UI.tutor.setVisible(false); return viewWelcome(); }
    UI.tutor.setVisible(!!p && !['parent', 'welcome', 'profiles'].includes(view));
    UI.tutor.refresh();
    try {
      switch (view) {
        case 'home': return viewHome();
        case 'welcome': return viewWelcome();
        case 'profiles': return viewProfiles();
        case 'subjects': return viewSubjects();
        case 'subject': return viewSubject(parts[1]);
        case 'chapter': return viewChapter(parts[1]);
        case 'lesson': return viewLesson(parts[1], current.params);
        case 'quiz': return viewQuiz(parts[1], current.params);
        case 'challenge': return viewChallenge(parts[1]);
        case 'exam': return viewExam(parts[1]);
        case 'practice': return viewPractice(parts[1], parts[2], current.params);
        case 'homework': return viewHomework();
        case 'words': return viewWords();
        case 'bridge': return viewBridge();
        case 'help': return viewHelp();
        case 'parent': return LA.parent.view(parts[1] || 'overview', main);
        case 'curriculum': return viewCurriculum();
        default: return viewHome();
      }
    } catch (e) {
      console.error(e);
      main.appendChild(h('div.card', h('h2', tr('Something went wrong', 'Coś poszło nie tak')), h('p.muted', String(e.message || e)), h('button.btn', { type: 'button', onclick: () => LA.go('home') }, tr('Go home', 'Strona główna'))));
    }
  }

  function applyTheme() {
    const st = S.settings();
    if (!st.theme || st.theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', st.theme);
    document.body.classList.toggle('bigtext', !!st.bigText);
    document.body.classList.toggle('spacing', !!st.spacing);
  }

  /* ---------- chrome: sidebar (iPad landscape), top bar + tab bar (portrait/phone) ---------- */
  function navBtn(icon, label, path, on, extra) {
    return h('button' + (on ? '.on' : ''), { type: 'button', onclick: () => LA.go(path) }, LA.icon(icon, 22), h('span', label), extra || null);
  }
  function progSwitch() {
    const p = S.activeProfile();
    const box = h('div.prog-switch');
    ['au', 'pl'].forEach((id) => {
      const P = LA.PROGRAMMES[id];
      if (p && !p[id].on) return;
      const b = h('button' + (LA.state.prog === id ? '.on' : ''), { type: 'button', 'aria-label': P.name }, h('span.flag', P.flag), h('span', P.short), p ? h('span.tiny.muted', P.yearLabel(p[id].year)) : null);
      b.addEventListener('click', () => { LA.state.prog = id; S.state().settings.lastProg = id; S.saveMain(); LA.go('home'); });
      box.appendChild(b);
    });
    if (box.childNodes.length === 1) box.style.gridTemplateColumns = '1fr';
    return box;
  }
  function syncChip() {
    const c = LA.cloud;
    const txt = { synced: tr('Synced to the cloud', 'Zsynchronizowano'), syncing: tr('Saving…', 'Zapisywanie…'), offline: tr('Saved on this device · will upload', 'Zapisano na urządzeniu · wyślę później'), error: tr('Cloud problem — tap for details', 'Problem z chmurą — szczegóły'), local: tr('Saved on this device', 'Zapisano na tym urządzeniu'), signedout: tr('Saved on this device · sign in to sync', 'Zapisano na urządzeniu · zaloguj się') }[c.status] || '';
    return h('button.sync.' + c.status, { type: 'button', title: c.detail || txt, style: { border: 0, background: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }, onclick: () => LA.go('parent/cloud') }, h('span.led'), h('span', txt));
  }
  function renderChrome(view) {
    const p = S.activeProfile();
    const prog = LA.state.prog;
    sidebar.innerHTML = '';
    topbar.innerHTML = '';
    tabbar.innerHTML = '';
    sidebar.appendChild(h('div.brand', h('span.mark', LA.icon('graduation', 22)), h('span', tr('Learning Workbook', 'Zeszyt Nauki'))));
    if (p) {
      sidebar.appendChild(h('button.me', { type: 'button', onclick: () => LA.go('profiles') }, h('span.av', p.avatar), h('span', h('div.who', p.name), h('div.stats', h('span', LA.icon('flame', 14), String(S.P().streak.count || 0)), h('span', LA.icon('star', 14), String(S.P().stars || 0))))));
      sidebar.appendChild(progSwitch());
      const nav = h('div.nav');
      const hw = S.openHomework(prog).length;
      nav.append(
        navBtn('home', tr('Today', 'Dzisiaj'), 'home', view === 'home'),
        navBtn('grid', tr('Subjects', 'Przedmioty'), 'subjects', ['subjects', 'subject', 'chapter', 'lesson', 'quiz', 'challenge', 'exam'].includes(view)),
        navBtn('tray', tr('Homework', 'Prace domowe'), 'homework', view === 'homework', hw ? h('span.cnt', String(hw)) : null),
        navBtn('textformat', tr('Tricky words', 'Trudne wyrazy'), 'words', view === 'words'),
        navBtn('arrows', tr('Both curricula', 'Oba programy'), 'bridge', view === 'bridge'));
      sidebar.appendChild(nav);
    }
    const bottom = h('div.nav', { style: { marginTop: 'auto' } }, navBtn('question', tr('How it works', 'Jak to działa'), 'help', view === 'help'), navBtn('person2', tr('Parent', 'Rodzic'), 'parent', view === 'parent'));
    sidebar.appendChild(bottom);
    sidebar.appendChild(syncChip());
    // narrow screens
    topbar.append(...[h('span.brand', h('span.mark', LA.icon('graduation', 20))), p ? progSwitch() : h('span', tr('Learning Workbook', 'Zeszyt Nauki')), h('span.spacer'), p ? h('button.icon-btn', { type: 'button', onclick: () => LA.go('profiles'), 'aria-label': tr('Switch learner', 'Zmień ucznia') }, p.avatar) : null].filter(Boolean));
    if (p) {
      const tb = (icon, label, path, on) => h('button' + (on ? '.on' : ''), { type: 'button', onclick: () => LA.go(path) }, LA.icon(icon, 25), label);
      tabbar.append(tb('home', tr('Today', 'Dziś'), 'home', view === 'home'), tb('grid', tr('Subjects', 'Przedmioty'), 'subjects', ['subjects', 'subject', 'chapter', 'lesson', 'quiz'].includes(view)), tb('tray', tr('Homework', 'Prace'), 'homework', view === 'homework'), tb('textformat', tr('Words', 'Wyrazy'), 'words', view === 'words'), tb('person2', tr('Parent', 'Rodzic'), 'parent', view === 'parent'));
    }
  }
  LA.renderChrome = () => renderChrome((current.path.split('/')[0]) || 'home');

  function crumbs(list) {
    return h('div.crumbs', list.map((c, i) => [i ? h('span', '›') : null, c[1] ? h('button', { type: 'button', onclick: () => LA.go(c[1]) }, c[0]) : h('span', c[0])]));
  }

  /* ---------- onboarding ---------- */
  function viewWelcome() {
    main.innerHTML = '';
    let avatar = AVATARS[0];
    let au = { on: true, year: 3 }, pl = { on: true, year: 3 };
    LA.state.forceLang = 'en';
    const name = h('input', { type: 'text', placeholder: 'First name', maxlength: 30, 'aria-label': 'Learner first name', id: 'wname' });
    const avs = h('div.avatar-pick', AVATARS.map((a) => {
      const b = h('button' + (a === avatar ? '.on' : ''), { type: 'button', 'aria-label': 'Avatar ' + a }, a);
      b.addEventListener('click', () => { avatar = a; avs.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); });
      return b;
    }));
    const progRow = (id, st) => {
      const P = LA.PROGRAMMES[id];
      const seg = h('div.seg');
      [3, 4].forEach((y) => { const b = h('button' + (st.year === y ? '.on' : ''), { type: 'button' }, P.yearLabel(y)); b.addEventListener('click', () => { st.year = y; seg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }); seg.appendChild(b); });
      const on = h('input', { type: 'checkbox', checked: true, 'aria-label': 'Include ' + P.name });
      on.addEventListener('change', () => { st.on = on.checked; });
      return h('div.prog-card', h('span.flag', P.flag), h('div', { style: { flex: 1, minWidth: '180px' } }, h('div.display', { style: { fontWeight: 800 } }, P.name), h('div.small.muted', id === 'au' ? 'In English · tutor Koa 🐨 · Australian voice' : 'Po polsku · Sowa Zosia 🦉 · polski głos')), seg, h('label.check', on, h('span.small', 'Include')));
    };
    LA.state.forceLang = null;
    main.append(h('div.content', { style: { maxWidth: '680px' } },
      h('div.hero', h('span.mascot', LA.appIcon('graduation', '#007aff', 60)), h('div.eyebrow', 'Welcome · Witaj'), h('h1', 'Your learning workbook'), h('p.muted', 'Two complete programmes in one app: the Australian Curriculum (in English) and the Polish curriculum (po polsku), for Year/Klasa 3 and 4 — with lessons to do together, practice, homework, read-aloud, Apple Pencil writing and an AI tutor.')),
      h('div.card.col', { style: { marginTop: '16px' } },
        h('div', h('label.field', { for: 'wname' }, 'Learner’s first name'), name),
        h('div', h('label.field', 'Avatar'), avs),
        h('div.col', h('label.field', 'Programmes and grade'), progRow('au', au), progRow('pl', pl)),
        h('button.btn.big', { type: 'button', onclick: () => { if (!au.on && !pl.on) { UI.toast('Choose at least one programme.'); return; } S.addProfile({ name: name.value, avatar, auYear: au.year, plYear: pl.year, auOn: au.on, plOn: pl.on }); LA.state.prog = au.on ? 'au' : 'pl'; LA.go('help', { first: 1 }); } }, 'Start →'),
        S.profiles().length ? h('button.btn.ghost', { type: 'button', onclick: () => LA.go('profiles') }, 'Back to learners') : null),
      LA.cloud.configured() && !LA.cloud.user ? h('div.card.row', { style: { marginTop: '16px' } }, LA.appIcon('cloud', '#007aff', 40), h('div', { style: { flex: 1, minWidth: '200px' } }, h('strong', 'Already using the app on another device?'), h('div.small.muted', 'Sign in to your family account to bring everything here.')), h('button.btn.secondary', { type: 'button', onclick: () => LA.go('parent/cloud') }, 'Sign in')) : null));
  }

  function viewProfiles() {
    main.appendChild(h('div.content',
      h('h1', tr('Who is learning today?', 'Kto się dziś uczy?')),
      h('div.grid.three', S.profiles().map((p) => h('button.profile-tile', { type: 'button', onclick: () => { S.setActive(p.id); if (LA.cloud.rewatch) LA.cloud.rewatch(); LA.go('home'); } }, h('span.av', p.avatar), h('h3', p.name), h('div.small.muted', [p.au.on ? '🇦🇺 Year ' + p.au.year : '', p.pl.on ? '🇵🇱 Klasa ' + p.pl.year : ''].filter(Boolean).join(' · '))))),
      h('div.row', { style: { marginTop: '18px' } }, h('button.btn.secondary', { type: 'button', onclick: () => { S.state().active = null; LA.go('welcome'); } }, tr('+ Add a learner', '+ Dodaj ucznia')))));
  }

  /* ---------- home ---------- */
  function viewHome() {
    const p = S.activeProfile();
    const prog = LA.state.prog;
    const P = LA.PROGRAMMES[prog];
    const plan = T.planToday(prog);
    const today = S.today();
    const hour = new Date().getHours();
    const greet = prog === 'pl' ? (hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór') : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    const date = new Date().toLocaleDateString(prog === 'pl' ? 'pl-PL' : 'en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
    const term = U.schoolTerm(prog);
    const c = h('div.content');
    main.appendChild(c);

    const lessonsPlanned = plan.items.filter((i) => i.kind === 'lesson').length;
    const lessonsDone = plan.items.filter((i) => i.kind === 'lesson' && i.done).length;
    const hwItems = plan.items.filter((i) => i.kind !== 'lesson');
    const hwDone = hwItems.filter((i) => i.done).length;
    const total = plan.items.length, doneN = plan.items.filter((i) => i.done).length;
    const ringData = [
      { color: '#007aff', value: total ? doneN / total : 0 },
      { color: '#34c759', value: Math.min(1, (today.correct || 0) / 20) },
    ];
    const nextItem = plan.items.find((i) => !i.done);
    c.appendChild(h('div.hero.' + prog,
      h('div.eyebrow', `${P.flag}  ${P.yearLabel(p[prog].year)} · ${term.label}`),
      h('h1', `${greet}, ${p.name}`),
      h('p.muted', { style: { textTransform: 'capitalize', margin: 0 } }, date),
      h('div.hero-today', UI.rings(ringData, 96),
        h('div', { style: { flex: 1, minWidth: '180px' } },
          h('div.ring-num', total ? `${doneN} ${tr('of', 'z')} ${total}` : tr('All done', 'Gotowe')),
          h('div.small.muted', tr(`done today · ${today.correct || 0} correct answers`, `zrobione dziś · ${today.correct || 0} dobrych odpowiedzi`))),
        nextItem ? h('button.btn.big', { type: 'button', onclick: () => openPlanItem(nextItem) }, LA.icon('play', 18), doneN ? tr('Continue', 'Dalej') : tr('Start today', 'Zaczynamy')) : null),
      catchUpBar(prog)));

    const planCard = h('div.card', { style: { marginTop: '18px', paddingBottom: '10px' } },
      h('div.row', h('h2', { style: { margin: 0 } }, tr('Today’s plan', 'Plan na dziś')), h('span.spacer'), h('span.chip', `≈ ${plan.items.reduce((s, i) => s + i.minutes, 0)} min`)));
    const list = h('div.plan');
    if (!plan.items.length) list.appendChild(h('p', tr('Everything is done for this year level. Try a practice exam or the challenges!', 'Wszystko zrobione na tym poziomie. Spróbuj próbnego sprawdzianu albo zadań z gwiazdką!')));
    const KIND = { lesson: ['book', '#007aff', tr('Learn together', 'Lekcja razem')], hw: ['pencil', '#ff9500', tr('Homework · on your own', 'Praca domowa · samodzielnie')], quiz: ['doc', '#5856d6', tr('Check-up quiz', 'Sprawdzian')], remediation: ['target', '#ff2d55', tr('Extra practice', 'Dodatkowe ćwiczenia')], review: ['repeat', '#30b0c7', tr('Quick review', 'Szybka powtórka')], testout: ['bolt', '#ff9500', tr('Know it from school? Quick test-out — pass it and the whole chapter is done', 'Znasz to ze szkoły? Szybki test — zaliczysz go, a cały rozdział będzie zrobiony')], spelling: ['textformat', '#af52de', tr('Spelling', 'Ortografia')] };
    plan.items.forEach((it) => {
      const k = KIND[it.kind];
      list.appendChild(h('button.plan-item' + (it.done ? '.done' : ''), { type: 'button', onclick: () => openPlanItem(it) }, LA.appIcon(k[0], k[1], 44), h('div', { style: { flex: 1 } }, h('div.t', it.title), h('div.k', `${k[2]} · ${it.minutes} min`)), it.done ? h('span.chk', LA.icon('check', 16)) : h('span.go', LA.icon('chevronR', 20))));
    });
    planCard.appendChild(list);
    if (plan.items.length && plan.items.every((i) => i.done)) {
      planCard.appendChild(h('div.feedback.good', h('h4', tr('All done for today! Brilliant work.', 'Wszystko na dziś zrobione! Świetna robota.'))));
      const cu = T.catchUp(prog);
      if (cu && cu.left > 0) planCard.appendChild(h('div.row', { style: { marginTop: '10px' } }, h('button.btn.secondary', { type: 'button', onclick: () => { T.planToday(prog, true, 1); LA.refresh(); } }, LA.icon('plus', 18), tr('Keep going — add one more lesson', 'Jeszcze jedna lekcja'))));
    }
    planCard.appendChild(h('div.row', { style: { marginTop: '4px' } }, h('button.btn.ghost.small', { type: 'button', onclick: () => { T.planToday(prog, true); LA.refresh(); } }, LA.icon('refresh', 18), tr('Refresh plan', 'Odśwież plan'))));
    c.appendChild(planCard);

    c.appendChild(h('div.section-head', h('h2', tr('Subjects', 'Przedmioty'))));
    c.appendChild(subjectGrid(prog));
  }
  function catchUpBar(prog) {
    const cu = T.catchUp(prog);
    if (!cu) return null;
    const P = LA.PROGRAMMES[prog];
    const yl = P.yearLabel(S.yearFor(prog));
    const when = new Date(cu.target + 'T12:00:00').toLocaleDateString(prog === 'pl' ? 'pl-PL' : 'en-AU', { day: 'numeric', month: 'long' });
    if (cu.left === 0) return h('div.catchup.done', LA.appIcon('graduation', '#34c759', 36), h('div', h('strong', tr(`${yl} complete!`, `${yl} ukończona!`)), h('div.small.muted', tr('Ready for the next year — a grown-up can switch the grade in Parent → Learners.', 'Gotowe na kolejną klasę — rodzic może zmienić klasę w: Rodzic → Uczniowie.'))));
    if (cu.past) return h('div.catchup.warn', LA.appIcon('flag', '#ff9500', 36), h('div', h('strong', tr(`Target date passed — ${cu.left} lessons left in ${yl}`, `Termin minął — w ${yl} zostało ${cu.left} lekcji`)), h('div.small.muted', tr('Set a new date in Parent → Settings.', 'Ustaw nowy termin w: Rodzic → Ustawienia.'))));
    const total = T.subjects(prog).reduce((a, s) => a + s.chapters.reduce((b, ch) => b + ch.lessons.length, 0), 0);
    const pct = Math.round(100 * (1 - cu.left / Math.max(1, total)));
    const onTrack = cu.doneToday >= cu.perDay;
    return h('div.catchup' + (cu.level === 'heavy' ? '.warn' : ''),
      LA.appIcon('flag', onTrack ? '#34c759' : '#007aff', 36),
      h('div', { style: { flex: 1, minWidth: '200px' } },
        h('strong', tr(`Finish ${yl} by ${when}`, `Ukończ ${yl} do ${when}`)),
        h('div.small.muted', tr(`${cu.left} lessons to go · ${cu.days} study days · ${cu.perDay} a day (about ${cu.minutes} min)`, `zostało ${cu.left} lekcji · ${cu.days} dni nauki · ${cu.perDay} dziennie (ok. ${cu.minutes} min)`)),
        h('div.bar', { style: { marginTop: '8px' } }, h('span', { style: { width: Math.max(2, pct) + '%', background: 'var(--accent)' } }))),
      h('span.tag.' + (onTrack ? 'good' : 'info'), onTrack ? tr('On track today', 'Dziś zgodnie z planem') : tr(`${cu.todo} lesson${cu.todo === 1 ? '' : 's'} today`, `${cu.todo} lekcji dziś`)));
  }
  function openPlanItem(it) {
    if (it.kind === 'lesson') LA.go('lesson/' + it.ref);
    else if (it.kind === 'hw') LA.go('lesson/' + it.ref, { step: 'homework' });
    else if (it.kind === 'quiz') LA.go('quiz/' + it.ref);
    else if (it.kind === 'testout') LA.go('quiz/' + it.ref, { mode: 'testout' });
    else if (it.kind === 'remediation') LA.go('practice/rem/' + it.ref);
    else if (it.kind === 'spelling') LA.go('words', { start: 1 });
    else LA.go('practice/skill/' + it.ref, { review: 1 });
  }

  function subjectGrid(prog) {
    return h('div.grid.three', T.subjects(prog).map((s) => {
      const st = T.subjectStats(s);
      const next = T.nextStep(s);
      const par = T.par(s);
      return h('button.tile', { type: 'button', style: { '--c': s.color }, onclick: () => LA.go('subject/' + s.key) },
        h('div.row', LA.appIcon(s.glyph, s.color, 48), h('span.spacer'), par.level !== 'none' ? h('span.par.' + par.level, par.label) : null),
        h('h3', s.name), h('div.bar', h('span', { style: { width: Math.max(2, st.pct * 100) + '%' } })),
        h('div.small.muted', `${st.done} ${tr('of', 'z')} ${st.lessons} ${tr('lessons', 'lekcji')}${st.behind ? ' · ' + tr(`${st.behind} to catch up`, `${st.behind} do nadrobienia`) : ''}`),
        h('div.next', next ? (next.kind === 'lesson' ? next.lesson.title : tr('Chapter quiz', 'Sprawdzian')) : tr('Complete', 'Ukończone')));
    }));
  }

  function viewSubjects() {
    const prog = LA.state.prog;
    const p = S.activeProfile();
    const c = h('div.content', h('div.eyebrow', LA.PROGRAMMES[prog].flag + ' ' + LA.PROGRAMMES[prog].name + ' · ' + LA.PROGRAMMES[prog].yearLabel(p[prog].year)), h('h1', tr('Subjects', 'Przedmioty')), subjectGrid(prog));
    main.appendChild(c);
  }

  /* ---------- subject ---------- */
  function viewSubject(key) {
    const s = LA.index.subjects[key];
    if (!s) return LA.go('home', null, { replace: true });
    const st = T.subjectStats(s);
    const next = T.nextStep(s);
    const par = T.par(s);
    const c = h('div.content');
    main.appendChild(c);
    c.append(crumbs([[tr('Today', 'Dzisiaj'), 'home'], [tr('Subjects', 'Przedmioty'), 'subjects'], [s.name]]),
      h('div.hero',
        h('span.mascot', LA.appIcon(s.glyph, s.color, 60)),
        h('div.eyebrow', LA.PROGRAMMES[s.prog].flag + ' ' + LA.PROGRAMMES[s.prog].yearLabel(s.year)),
        h('h1', s.long || s.name), h('p.muted', s.intro || ''),
        h('div.row', { style: { margin: '10px 0' } }, h('span.chip', `${st.done}/${st.lessons} ${tr('lessons', 'lekcji')}`), h('span.chip', `${st.passed}/${st.chapters} ${tr('chapters passed', 'zaliczonych rozdziałów')}`), par.level !== 'none' ? h('span.par.' + par.level, par.label) : null, st.behind ? h('span.tag.warn', `${st.behind} ${tr('behind schedule', 'do nadrobienia')}`) : null),
        h('div.bar', h('span', { style: { width: st.pct * 100 + '%', background: s.color } })),
        h('div.row', { style: { marginTop: '14px' } },
          next ? h('button.btn', { type: 'button', onclick: () => LA.go(next.kind === 'lesson' ? 'lesson/' + next.lesson.key : 'quiz/' + next.chapter.key) }, next.kind === 'lesson' ? '' + next.lesson.title : '' + tr('Quiz: ', 'Sprawdzian: ') + next.chapter.title) : h('span.tag.good', tr('Subject complete', 'Przedmiot ukończony')),
          h('button.btn.secondary', { type: 'button', onclick: () => chooseStart(s) }, tr('Where to start', 'Od czego zacząć')),
          h('button.btn.secondary', { type: 'button', onclick: () => LA.go('exam/' + s.key) }, tr('Practice exam', 'Próbny sprawdzian')))));
    const terms = s.prog === 'pl' ? [1, 2] : [1, 2, 3, 4];
    terms.forEach((t) => {
      const chs = s.chapters.filter((ch) => (s.prog === 'pl' ? Math.min(2, ch.term || 1) : ch.term || 1) === t);
      if (!chs.length) return;
      c.appendChild(h('div.term-head', h('span.eyebrow', termLabel(s.prog, t)), h('span.small.muted', `${chs.length} ${tr('chapters', 'rozdziałów')}`)));
      chs.forEach((ch) => c.appendChild(chapterRow(ch)));
    });
  }

  function chapterRow(ch) {
    const status = T.chapterStatus(ch);
    const done = ch.lessons.filter((l) => S.isLessonDone(l.key)).length;
    const rec = S.chapter(ch.key);
    const chal = S.P().challenges[ch.key];
    return h('div.chapter',
      h('div.st.' + status, { title: statusText(status) }, LA.icon(STATUS_ICON[status], 22)),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('h3', { style: { margin: '0 0 4px' } }, ch.title),
        h('div.row', { style: { gap: '6px' } }, ch.strand ? h('span.tag', ch.strand) : null, ch.code ? h('span.tag.info', ch.code) : null, h('span.tag', `${done}/${ch.lessons.length} ${tr('lessons', 'lekcji')}`), rec && rec.best ? h('span.tag' + (rec.passed ? '.good' : '.warn'), `${tr('Best', 'Najlepszy')} ${Math.round(rec.best * 100)}%`) : null, chal && chal.passed ? h('span.tag.star', '★ ' + tr('Above par', 'Powyżej poziomu')) : null),
        ch.summary ? h('div.small.muted', { style: { marginTop: '6px' } }, ch.summary) : null,
        h('div.row', { style: { marginTop: '10px' } },
          h('button.btn.small', { type: 'button', onclick: () => LA.go('chapter/' + ch.key) }, status === 'passed' || status === 'tested-out' ? tr('Review', 'Powtórka') : done ? tr('Continue', 'Kontynuuj') : tr('Start', 'Zacznij')),
          status !== 'passed' && status !== 'tested-out' ? h('button.btn.small.secondary', { type: 'button', onclick: () => LA.go('quiz/' + ch.key, { mode: 'testout' }) }, tr('Test out', 'Zalicz testem')) : LA.hasChallenge(ch) ? h('button.btn.small.secondary', { type: 'button', onclick: () => LA.go('challenge/' + ch.key) }, tr('★ Challenge', '★ Zadania z gwiazdką')) : null)));
  }

  function chooseStart(s) {
    const sel = h('select', { 'aria-label': 'Start chapter' }, s.chapters.map((c, i) => h('option', { value: i, selected: i === T.startIndex(s) ? true : null }, `${termLabel(s.prog, s.prog === 'pl' ? Math.min(2, c.term || 1) : c.term || 1)} · ${c.title}`)));
    UI.modal(tr('Where should we start?', 'Od czego zaczynamy?'), h('div.col', h('p', tr('Joining part-way through the year? Pick the chapter to start from. Earlier chapters are marked as skipped — you can still open them, or use ⚡ Test out.', 'Dołączacie w trakcie roku? Wybierz rozdział, od którego zaczynamy. Wcześniejsze będą oznaczone jako pominięte — nadal można je otworzyć albo zaliczyć testem.')), sel),
      [{ label: tr('Cancel', 'Anuluj'), secondary: true }, { label: tr('Start here', 'Zacznij tutaj'), onclick: () => { S.P().startPoints[s.key] = +sel.value; S.save(); T.planToday(s.prog, true); LA.refresh(); } }]);
  }

  /* ---------- chapter ---------- */
  function viewChapter(key) {
    const ch = LA.index.chapters[key];
    if (!ch) return LA.go('home', null, { replace: true });
    const s = LA.index.subjects[ch.subjectKey];
    UI.tutor.context = ch;
    const status = T.chapterStatus(ch);
    const rec = S.chapter(ch.key);
    const blocking = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
    const chal = S.P().challenges[ch.key];
    const c = h('div.content');
    main.appendChild(c);
    c.append(crumbs([[s.name, 'subject/' + s.key], [ch.title]]),
      h('div.card',
        h('div.eyebrow', `${termLabel(s.prog, s.prog === 'pl' ? Math.min(2, ch.term || 1) : ch.term || 1)}${ch.strand ? ' · ' + ch.strand : ''}${ch.code ? ' · ' + ch.code : ''}`),
        h('h1', ch.title), ch.summary ? h('p', ch.summary) : null,
        ch.outcomes ? h('div', h('div.eyebrow', { style: { marginTop: '8px' } }, tr('You will be able to', 'Nauczysz się')), h('ul', ch.outcomes.map((o) => h('li', o)))) : null,
        h('span.tag' + (status === 'passed' || status === 'tested-out' ? '.good' : ''), statusText(status))),
      h('h2', { style: { marginTop: '22px' } }, tr('Lessons', 'Lekcje')),
      h('div', ch.lessons.map((l, i) => {
        const done = S.isLessonDone(l.key);
        const info = S.P().lessons[l.key];
        const hw = S.P().hwSets[l.key];
        return h('button.lesson-row', { type: 'button', onclick: () => LA.go('lesson/' + l.key) }, h('span.ck' + (done ? '.on' : ''), done ? '✓' : String(i + 1)),
          h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 750 } }, l.title), h('div.small.muted', `${l.minutes || 15} min${info && info.total ? ` · ${tr('practice', 'ćwiczenia')} ${info.score}/${info.total}` : ''}${hw ? ' · 🎒 ' + (hw.status === 'done' ? tr('homework done', 'praca domowa zrobiona') + (hw.total ? ` ${hw.score}/${hw.total}` : '') : tr('homework to do', 'praca domowa do zrobienia')) : ''}`)), h('span', '›'));
      })),
      h('div.grid.two', { style: { marginTop: '18px' } },
        h('div.card.flat',
          h('h3', tr('Check-up quiz', 'Sprawdzian')),
          h('p.small.muted', tr(`About ${ch.quiz.n || 10} questions · pass mark ${Math.round(T.PASS_QUIZ * 100)}%`, `Ok. ${ch.quiz.n || 10} pytań · zaliczenie od ${Math.round(T.PASS_QUIZ * 100)}%`) + (rec && rec.attempts.length ? ' · ' + tr('best', 'najlepszy') + ' ' + Math.round(rec.best * 100) + '%' : '')),
          blocking.length ? h('div.feedback.warn', h('div.small', tr('Finish the extra practice first to unlock a retake:', 'Najpierw dodatkowe ćwiczenia, potem poprawa:')), blocking.map((r) => h('div', h('button.btn.ghost.small', { type: 'button', onclick: () => LA.go('practice/rem/' + r.id) }, '' + LA.skillLabel(r.skill))))) : null,
          h('div.row', { style: { marginTop: '8px' } },
            h('button.btn', { type: 'button', disabled: blocking.length ? true : null, onclick: () => LA.go('quiz/' + ch.key) }, status === 'passed' ? tr('Take again', 'Jeszcze raz') : tr('Take the quiz', 'Rozwiąż')),
            status !== 'passed' && status !== 'tested-out' ? h('button.btn.secondary', { type: 'button', onclick: () => LA.go('quiz/' + ch.key, { mode: 'testout' }) }, tr('Test out', 'Zalicz testem')) : null)),
        LA.hasChallenge(ch) ? h('div.card.flat',
          h('h3', tr('★ Above-par challenge', '★ Zadania z gwiazdką')),
          h('p.small.muted', tr('Harder questions that go a little beyond the year level. Great once the chapter is passed.', 'Trudniejsze zadania, trochę powyżej poziomu klasy. Najlepiej po zaliczeniu rozdziału.') + (chal ? ` · ${tr('best', 'najlepszy')} ${Math.round(chal.best * 100)}%` : '')),
          h('button.btn.secondary', { type: 'button', onclick: () => LA.go('challenge/' + ch.key) }, chal && chal.passed ? tr('★ Try again', '★ Jeszcze raz') : tr('★ Take the challenge', '★ Spróbuj'))) : null),
      h('div.row', { style: { marginTop: '14px' } },
        h('button.btn.ghost.small', { type: 'button', onclick: () => LA.go('practice/skill/' + ch.key) }, tr('Mixed practice', 'Ćwiczenia mieszane')),
        h('button.btn.ghost.small', { type: 'button', onclick: () => UI.confirm(tr('Reset this chapter?', 'Wyzerować rozdział?'), tr('This clears the ticks and quiz results for this chapter.', 'To usunie zaliczenia i wyniki tego rozdziału.'), () => { S.resetChapter(ch.key); LA.refresh(); }, tr('Reset', 'Wyzeruj')) }, tr('Reset chapter', 'Wyzeruj rozdział'))));
  }

  /* ---------- lesson: Learn together → Practise together → Homework ---------- */
  function groupSteps(blocks) {
    const steps = [];
    blocks.forEach((b) => {
      if ((b.type === 'visual' || b.type === 'tip') && steps.length) steps[steps.length - 1].push(b);
      else steps.push([b]);
    });
    return steps;
  }
  const TOGETHER = {
    read: ['Read this step together. Then ask: “Can you tell me that in your own words?”', 'Przeczytajcie razem. Potem zapytaj: „Powiesz mi to własnymi słowami?”'],
    example: ['Cover the answer and try it together first, then check each step.', 'Zasłońcie odpowiedź, spróbujcie najpierw sami, potem sprawdźcie krok po kroku.'],
    listen: ['Let her listen without looking at the words. Talk about what she heard.', 'Niech posłucha bez patrzenia na tekst. Porozmawiajcie o tym, co usłyszała.'],
    activity: ['Do this together — hands-on learning sticks best.', 'Zróbcie to razem — nauka przez działanie zostaje w głowie najdłużej.'],
    vocab: ['Say each word together, then make up a sentence with it.', 'Powtórzcie razem każde słowo i ułóżcie z nim zdanie.'],
  };

  function blockEl(b, voice) {
    const el = h('div');
    const label = { example: tr('Worked example', 'Przykład'), listen: tr('Listening', 'Słuchanie'), activity: tr('Activity', 'Zadanie praktyczne'), vocab: tr('Word bank', 'Słowniczek') }[b.type];
    if (b.type === 'listen') {
      el.append(h('div.label', h('span.tag.info', '' + label), b.title ? h('strong', b.title) : null),
        h('p', b.intro || tr('Press Listen and listen carefully. Try not to read the words — just listen! Then answer the questions in the practice.', 'Naciśnij „Słuchaj” i słuchaj uważnie, bez czytania tekstu. Potem odpowiesz na pytania.')),
        h('div.row', UI.speakBtn(U.plain(b.text), tr('Listen', 'Słuchaj'), voice)));
      const words = h('div.hidden', { html: U.fmt(b.text) });
      const tog = h('button.btn.ghost.small', { type: 'button' }, tr('Show the words', 'Pokaż tekst'));
      tog.addEventListener('click', () => { words.classList.toggle('hidden'); tog.textContent = words.classList.contains('hidden') ? tr('Show the words', 'Pokaż tekst') : tr('Hide the words', 'Ukryj tekst'); });
      el.append(tog, words);
      return el;
    }
    if (b.type === 'vocab') {
      el.append(h('div.label', h('span.tag.info', '' + label)), h('dl.vocab', b.words.map((w) => [h('dt', w[0]), h('dd', w[1], w[2] ? h('span.pl', (LA.state.prog === 'au' ? '🇵🇱 ' : '🇬🇧 ') + w[2]) : null)])));
      return el;
    }
    if (label || b.title) el.appendChild(h('div.label', label ? h('span.tag' + (b.type === 'activity' ? '.good' : '.info'), label) : null, b.title ? h('strong', b.title) : null));
    if (b.svg) el.appendChild(h('div.visual', { html: b.svg }));
    if (b.text) el.appendChild(h('div' + (b.type === 'example' ? '.block-example' : ''), { html: b.type === 'tip' ? '<div class="tipbox">' + U.fmtInline(b.text) + '</div>' : U.fmt(b.text) }));
    if (b.type === 'activity') el.appendChild(h('label.check', { style: { marginTop: '10px' } }, h('input', { type: 'checkbox' }), h('strong', tr('We did it!', 'Zrobione!'))));
    return el;
  }
  const blockSpeech = (bs) => bs.map((b) => (b.type === 'vocab' ? b.words.map((w) => w[0] + ': ' + w[1]).join('. ') : (b.title ? b.title + '. ' : '') + U.plain(b.text || ''))).join(' ');

  function viewLesson(key, params) {
    const l = LA.index.lessons[key];
    if (!l) return LA.go('home', null, { replace: true });
    const ch = LA.index.chapters[l.chapterKey];
    const s = LA.index.subjects[l.subjectKey];
    const voice = LA.PROGRAMMES[s.prog].voice;
    UI.tutor.context = l;
    const done = S.isLessonDone(l.key);
    const hw = S.P().hwSets[l.key];
    let step = params.step || (done && hw && hw.status === 'assigned' ? 'homework' : 'learn');
    const c = h('div.content');
    main.appendChild(c);
    const seg = h('div.seg');
    const body = h('div', { style: { marginTop: '16px' } });
    const mk = (id, n, label, isDone) => { const b = h('button' + (step === id ? '.on' : '') + (isDone ? '.done' : ''), { type: 'button' }, h('span.num', isDone ? '✓' : n), label); b.addEventListener('click', () => { step = id; renderStep(); }); return b; };
    function renderSeg() {
      const hwNow = S.P().hwSets[l.key];
      seg.innerHTML = '';
      seg.append(mk('learn', 1, tr('Learn together', 'Uczymy się razem'), false), mk('practise', 2, tr('Practise together', 'Ćwiczymy razem'), S.isLessonDone(l.key)), mk('homework', 3, tr('Homework', 'Praca domowa'), hwNow && hwNow.status === 'done'));
    }
    c.append(crumbs([[s.name, 'subject/' + s.key], [ch.title, 'chapter/' + ch.key], [l.title]]),
      h('div.row', h('h1', { style: { margin: 0, flex: 1, minWidth: '240px' } }, l.title), done ? h('span.tag.good', tr('✓ Learnt', '✓ Opanowane')) : null),
      h('div.row', { style: { margin: '10px 0 4px' } }, h('span.chip', LA.appIcon(s.glyph, s.color, 20), s.name), h('span.chip', `${l.minutes || 15} min`)),
      seg, body);

    function renderStep() {
      renderSeg();
      body.innerHTML = '';
      SP.stop();
      if (step === 'learn') renderLearn();
      else if (step === 'practise') renderPractise(1);
      else renderHomework();
    }

    function renderLearn() {
      const steps = groupSteps(l.blocks);
      let idx = 0;
      const seen = new Set([0]);
      const card = h('div.card.step-card');
      const dots = h('div.dots');
      const nav = h('div.row');
      const tip = h('div.together');
      body.append(tip, h('div', { style: { height: '12px' } }), card, dots, nav);
      const extras = h('div.row', { style: { marginTop: '14px' } });
      body.appendChild(extras);
      if (AI.available()) extras.append(
        h('button.btn.secondary.small', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Explained simply', 'Prościej'), (on) => AI.explainLesson(l, on))) }, tr('Explain it to me', 'Wytłumacz mi')),
        UI.otherLangBtn((on, lang) => AI.explainLesson(l, on, lang)));
      function draw() {
        const bs = steps[idx];
        const t = TOGETHER[bs[0].type] || TOGETHER.read;
        tip.innerHTML = '';
        tip.append(LA.icon('person2', 20), h('div', h('strong', tr('For the grown-up: ', 'Dla rodzica: ')), tr(t[0], t[1])));
        card.innerHTML = '';
        card.append(h('div.row', { style: { marginBottom: '6px' } }, h('span.eyebrow', `${tr('Step', 'Krok')} ${idx + 1} / ${steps.length}`), h('span.spacer'), UI.speakBtn(blockSpeech(bs), tr('Read to me', 'Przeczytaj mi'), voice)));
        bs.forEach((b) => card.appendChild(blockEl(b, voice)));
        dots.innerHTML = '';
        steps.forEach((_, i) => { const d = h('button' + (i === idx ? '.on' : seen.has(i) ? '.seen' : ''), { type: 'button', 'aria-label': `${tr('Step', 'Krok')} ${i + 1}` }); d.addEventListener('click', () => { idx = i; seen.add(i); draw(); }); dots.appendChild(d); });
        nav.innerHTML = '';
        nav.append(idx > 0 ? h('button.btn.secondary', { type: 'button', onclick: () => { idx--; draw(); } }, tr('Back', 'Wstecz')) : h('span'), h('span.spacer'),
          idx < steps.length - 1 ? h('button.btn.big', { type: 'button', onclick: () => { idx++; seen.add(idx); draw(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, tr('Next step', 'Dalej'))
            : h('button.btn.big', { type: 'button', onclick: () => { step = 'practise'; renderStep(); } }, tr('Let’s practise', 'Ćwiczymy')));
        if (S.settings().autoRead) SP.say(blockSpeech(bs), { lang: voice });
      }
      draw();
    }

    function renderPractise(attempt) {
      const qs = LA.lessonPractice(l);
      const area = h('div');
      body.appendChild(h('div.together', LA.icon('person2', 20), h('div', h('strong', tr('Together: ', 'Razem: ')), tr('let her answer first; help only after a wrong try. Talk about each explanation.', 'niech najpierw odpowie sama; pomagaj dopiero po błędzie. Omawiajcie wyjaśnienia.'))));
      body.appendChild(h('div', { style: { height: '12px' } }));
      body.appendChild(area);
      if (!qs.length) { S.markLesson(l.key, {}); S.assignHomework(l.key); T.markPlan('lesson', l.key); return finishPractise({ ok: true, right: 0, total: 0, score: 1 }, attempt); }
      UI.runQuestions(area, qs, { mode: 'practice', ctx: l, onDone: (results) => finishPractise(T.afterPractice(l, results, attempt), attempt) });
    }
    function finishPractise(r, attempt) {
      body.innerHTML = '';
      renderSeg();
      const card = h('div.card.col', { style: { textAlign: 'center', alignItems: 'center' } });
      if (r.ok || r.movedOn) {
        T.markPlan('lesson', l.key);
        if (r.ok && r.score >= 0.8) UI.confetti();
        card.append(h('div.result-big', r.total ? `${r.right}/${r.total}` : '✓'),
          h('h2', r.ok ? (r.score >= 0.8 ? tr('Lesson learnt — fantastic!', 'Lekcja opanowana — wspaniale!') : tr('✓ Lesson learnt — good effort!', '✓ Lekcja zaliczona — dobra robota!')) : tr('Ticked off — extra practice is waiting for later.', 'Zaliczone — dodatkowe ćwiczenia czekają na później.')),
          h('div.feedback.info', { style: { textAlign: 'left' } }, h('h4', tr('Homework is ready', 'Praca domowa gotowa')), h('div.small', tr('A short set to do on her own — later today or tomorrow. It’s in the Homework list.', 'Krótki zestaw do samodzielnego zrobienia — dziś później albo jutro. Jest na liście prac domowych.'))),
          h('div.row.center', h('button.btn.big', { type: 'button', onclick: () => { step = 'homework'; renderStep(); } }, tr('See homework', 'Zobacz pracę domową')),
            (() => { const nxt = ch.lessons[l.index + 1]; return nxt ? h('button.btn.secondary', { type: 'button', onclick: () => LA.go('lesson/' + nxt.key) }, tr('Next lesson →', 'Następna lekcja →')) : h('button.btn.secondary', { type: 'button', onclick: () => LA.go('quiz/' + ch.key) }, tr('Chapter quiz →', 'Sprawdzian →')); })()));
      } else {
        card.append(h('div.result-big', `${r.right}/${r.total}`), h('h2', tr('Let’s look at this one again together', 'Przyjrzyjmy się temu jeszcze raz')),
          h('p', tr('That’s okay — tricky things take practice. Re-read the lesson (press the speaker to hear it), then try fresh questions.', 'Nic nie szkodzi — trudne rzeczy wymagają ćwiczeń. Przeczytajcie lekcję jeszcze raz (głośnik), a potem nowe pytania.')),
          AI.available() ? UI.aiBox(tr('Another way to understand it', 'Wytłumaczę to inaczej'), (on) => AI.reteach(l.key, on)) : null,
          h('div.row.center', h('button.btn.big', { type: 'button', onclick: () => { body.innerHTML = ''; renderPractise((attempt || 1) + 1); } }, tr('Try new questions →', 'Nowe pytania →')), h('button.btn.secondary', { type: 'button', onclick: () => { step = 'learn'; renderStep(); } }, tr('↺ Re-read the lesson', '↺ Przeczytaj lekcję'))));
      }
      body.appendChild(card);
      LA.renderChrome();
    }

    function renderHomework() {
      const cur = S.P().hwSets[l.key];
      const card = h('div.card.col');
      card.append(h('div.eyebrow', tr('Homework · on your own', 'Praca domowa · samodzielnie')), h('h2', l.title));
      if (!S.isLessonDone(l.key)) {
        card.append(h('p', tr('Do the lesson and practice first — then your homework appears here.', 'Najpierw lekcja i ćwiczenia — potem pojawi się tu praca domowa.')), h('button.btn', { type: 'button', onclick: () => { step = 'learn'; renderStep(); } }, tr('Start the lesson', 'Zacznij lekcję')));
      } else {
        if (cur && cur.status === 'done') card.append(h('div.feedback.good', h('h4', tr('✓ Homework done', '✓ Praca domowa zrobiona') + (cur.total ? ` — ${cur.score}/${cur.total}` : ''))));
        card.append(h('p', tr('Try to do this without help. If you get stuck, press the speaker or ask for a hint.', 'Spróbuj bez pomocy. Gdy utkniesz, naciśnij głośnik albo poproś o podpowiedź.')),
          h('div.row', h('button.btn.big', { type: 'button', onclick: startHw }, cur && cur.status === 'done' ? tr('Do it again', 'Zrób jeszcze raz') : tr('Start homework', 'Zacznij pracę domową'))));
      }
      body.appendChild(card);
    }
    function startHw() {
      const qs = LA.lessonHomework(l, S.mastery(l.key));
      body.innerHTML = '';
      const area = h('div');
      body.appendChild(area);
      UI.runQuestions(area, qs, { mode: 'homework', ctx: l, onDone: (results) => {
        const r = T.afterHomework(l, results);
        T.markPlan('hw', l.key);
        if (r.score >= 0.8) UI.confetti();
        body.innerHTML = '';
        renderSeg();
        body.appendChild(h('div.card.col', { style: { textAlign: 'center', alignItems: 'center' } }, h('div.result-big', `${r.right}/${r.total}`),
          h('h2', r.score >= 0.8 ? tr('Brilliant homework!', 'Świetna praca domowa!') : r.score >= 0.6 ? tr('Good work!', 'Dobra robota!') : tr('Keep going — extra practice added', 'Ćwiczymy dalej — dodano dodatkowe ćwiczenia')),
          h('div.row.center', h('button.btn', { type: 'button', onclick: () => LA.go('home') }, tr('Back to today', 'Wróć do planu')), h('button.btn.secondary', { type: 'button', onclick: () => LA.go('homework') }, tr('More homework', 'Inne prace domowe')))));
        LA.renderChrome();
      } });
    }
    renderStep();
  }

  /* ---------- quizzes, challenges, exams ---------- */
  function resultList(results) {
    const list = h('div');
    results.forEach((res, i) => {
      const q = res.q;
      const correctTxt = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
      const givenTxt = q.type === 'mc' ? q.options[res.given] : res.given;
      const item = h('div.review-q' + (res.correct ? '.ok' : ''),
        h('div', h('strong', `${i + 1}. `), h('span', { html: q.dictation ? tr('Dictation: ', 'Dyktando: ') + U.esc(q.say) : U.fmtInline(q.q) })),
        q.svg && !res.correct ? h('div.visual', { html: q.svg }) : null,
        h('div.small', res.correct ? '' + U.plain(String(givenTxt)) : `❌ ${tr('You said', 'Twoja odpowiedź')}: ${U.plain(String(givenTxt || '—'))} · ✅ ${U.plain(String(correctTxt))}`),
        !res.correct && q.explain ? h('div.small', { html: U.fmt(q.explain) }) : null);
      if (!res.correct && AI.available()) {
        const b = h('button.btn.secondary.small', { type: 'button' }, tr('Explain this one', 'Wytłumacz'));
        b.addEventListener('click', () => b.replaceWith(UI.aiBox(tr('Explanation', 'Wyjaśnienie'), (on) => AI.explainMistake(q, res.given, null, on))));
        item.appendChild(b);
      }
      list.appendChild(item);
    });
    return list;
  }

  function viewQuiz(key, params) {
    const ch = LA.index.chapters[key];
    if (!ch) return LA.go('home', null, { replace: true });
    const s = LA.index.subjects[ch.subjectKey];
    const mode = params.mode === 'testout' ? 'testout' : 'quiz';
    UI.tutor.context = ch;
    const blocking = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
    const c = h('div.content');
    main.appendChild(c);
    c.appendChild(crumbs([[s.name, 'subject/' + s.key], [ch.title, 'chapter/' + ch.key], [mode === 'testout' ? tr('Test out', 'Zalicz testem') : tr('Quiz', 'Sprawdzian')]]));
    const area = h('div');
    const intro = h('div.card.col', { style: { textAlign: 'center', alignItems: 'center', maxWidth: '640px', margin: '0 auto' } },
      LA.appIcon(mode === 'testout' ? 'bolt' : 'doc', mode === 'testout' ? '#ff9500' : '#5856d6', 64),
      h('h1', ch.title),
      h('p', mode === 'testout' ? tr(`Already know this chapter? Score ${Math.round(T.PASS_QUIZ * 100)}% or more and the whole chapter is ticked off — a fast way to catch up.`, `Znasz już ten rozdział? Zdobądź ${Math.round(T.PASS_QUIZ * 100)}% lub więcej, a cały rozdział zostanie zaliczony.`) : tr(`Show what you know! ${Math.round(T.PASS_QUIZ * 100)}% to pass. Answers are shown at the end.`, `Pokaż, co umiesz! Zaliczenie od ${Math.round(T.PASS_QUIZ * 100)}%. Odpowiedzi zobaczysz na końcu.`)),
      h('p.small.muted', tr('Take your time. Press the speaker to hear any question.', 'Nie spiesz się. Głośnik przeczyta każde pytanie.')),
      blocking.length && mode !== 'testout' ? h('div.feedback.warn', tr('Finish your extra practice first.', 'Najpierw dodatkowe ćwiczenia.'), blocking.map((r) => h('div', h('button.btn.ghost.small', { type: 'button', onclick: () => LA.go('practice/rem/' + r.id) }, '' + LA.skillLabel(r.skill))))) : null,
      h('button.btn.big', { type: 'button', disabled: blocking.length && mode !== 'testout' ? true : null, onclick: start }, tr('Start →', 'Start →')));
    c.append(intro, area);
    function start() {
      intro.remove();
      UI.runQuestions(area, LA.chapterQuiz(ch), { mode: 'quiz', ctx: ch, onDone: show });
    }
    function show(results) {
      const r = T.afterQuiz(ch, results, mode);
      if (mode === 'testout') T.markPlan('testout', ch.key);
      T.markPlan('quiz', ch.key);
      area.innerHTML = '';
      if (r.passed) UI.confetti();
      const rems = S.openRemediation().filter((x) => x.chapterKey === ch.key);
      area.appendChild(h('div.card.col', { style: { maxWidth: '780px', margin: '0 auto' } },
        h('div.result-big', `${r.right}/${r.total}`),
        h('h2', { style: { textAlign: 'center' } }, r.passed ? (mode === 'testout' ? tr('Tested out — chapter complete!', 'Zaliczone testem!') : tr('Passed — chapter complete!', 'Zaliczone!')) : tr('Not yet — let’s fix the tricky bits', 'Jeszcze nie — poćwiczmy trudne miejsca')),
        r.passed && LA.hasChallenge(ch) ? h('div.feedback.info', h('h4', tr('★ Ready for more?', '★ Chcesz więcej?')), h('div.small', tr('Try the above-par challenge for this chapter.', 'Spróbuj zadań z gwiazdką z tego rozdziału.')), h('button.btn.small', { type: 'button', style: { marginTop: '8px' }, onclick: () => LA.go('challenge/' + ch.key) }, tr('★ Challenge', '★ Zadania z gwiazdką'))) : null,
        h('details', { open: !r.passed ? true : null }, h('summary', h('strong', tr('See all answers', 'Zobacz wszystkie odpowiedzi'))), resultList(results)),
        rems.length ? h('div.col', h('h3', tr('Your extra practice', 'Twoje dodatkowe ćwiczenia')), rems.map((x) => h('button.plan-item', { type: 'button', onclick: () => LA.go('practice/rem/' + x.id) }, h('span.ico', '🎯'), h('div', { style: { flex: 1 } }, h('div.t', LA.skillLabel(x.skill)), h('div.small.muted', x.reason)), h('span', '›')))) : null,
        h('div.row.center', h('button.btn', { type: 'button', onclick: () => LA.go(r.passed ? 'subject/' + s.key : rems.length ? 'practice/rem/' + rems[0].id : 'chapter/' + ch.key) }, r.passed ? tr('Back to ', 'Wróć do: ') + s.name : rems.length ? tr('Start extra practice →', 'Dodatkowe ćwiczenia →') : tr('Back to lessons', 'Wróć do lekcji')), h('button.btn.secondary', { type: 'button', onclick: () => LA.go('home') }, tr('Today', 'Dzisiaj')))));
      LA.renderChrome();
    }
  }

  function viewChallenge(key) {
    const ch = LA.index.chapters[key];
    if (!ch) return LA.go('home', null, { replace: true });
    const s = LA.index.subjects[ch.subjectKey];
    UI.tutor.context = ch;
    const c = h('div.content');
    main.appendChild(c);
    const area = h('div');
    c.append(crumbs([[s.name, 'subject/' + s.key], [ch.title, 'chapter/' + ch.key], [tr('Challenge', 'Wyzwanie')]]),
      h('div.card.col', { style: { textAlign: 'center', alignItems: 'center', maxWidth: '640px', margin: '0 auto' } }, LA.appIcon('star', '#ffcc00', 64), h('h1', ch.title),
        h('p', tr('These questions go a little beyond the year level. Getting 75% or more earns an “Above par” star for this chapter.', 'Te zadania wykraczają trochę poza poziom klasy. 75% lub więcej daje gwiazdkę „Powyżej poziomu”.')),
        h('button.btn.big', { type: 'button', onclick: (e) => { e.target.closest('.card').remove(); UI.runQuestions(area, LA.chapterChallenge(ch), { mode: 'challenge', ctx: ch, onDone: done }); } }, tr('Start →', 'Start →'))), area);
    function done(results) {
      const r = T.afterChallenge(ch, results);
      if (r.passed) UI.confetti();
      area.innerHTML = '';
      area.appendChild(h('div.card.col', { style: { maxWidth: '780px', margin: '0 auto' } }, h('div.result-big', `${r.right}/${r.total}`),
        h('h2', { style: { textAlign: 'center' } }, r.passed ? tr('★ Above par! Amazing thinking.', '★ Powyżej poziomu! Wspaniale.') : tr('Great try — these are meant to be hard!', 'Świetna próba — te zadania są naprawdę trudne!')),
        h('details', h('summary', h('strong', tr('See all answers', 'Zobacz odpowiedzi'))), resultList(results)),
        h('div.row.center', h('button.btn', { type: 'button', onclick: () => LA.go('chapter/' + ch.key) }, tr('Back to chapter', 'Wróć do rozdziału')))));
    }
  }

  function viewExam(key) {
    const s = LA.index.subjects[key];
    if (!s) return LA.go('home', null, { replace: true });
    UI.tutor.context = s;
    const c = h('div.content');
    main.appendChild(c);
    const area = h('div');
    const hist = (S.P().exams[s.key] || []).slice(-3);
    c.append(crumbs([[s.name, 'subject/' + s.key], [tr('Practice exam', 'Próbny sprawdzian')]]),
      h('div.card.col', { style: { textAlign: 'center', alignItems: 'center', maxWidth: '680px', margin: '0 auto' } }, LA.appIcon('graduation', '#007aff', 64),
        h('h1', tr('End-of-year practice exam', 'Próbny sprawdzian końcoworoczny')),
        h('p', tr(`30 questions from every chapter of ${s.name}, including some above-par questions. ${Math.round(T.PASS_EXAM * 100)}%+ means ready for any Year ${s.year} test.`, `30 pytań ze wszystkich rozdziałów (${s.name}), w tym kilka z gwiazdką. ${Math.round(T.PASS_EXAM * 100)}% i więcej oznacza gotowość na każdy sprawdzian klasy ${s.year}.`)),
        s.prog === 'au' && s.year === 3 && ['english', 'maths'].includes(s.id) ? h('p.small.muted', tr('Year 3 also sits NAPLAN in Australia — this covers similar reading, language conventions and numeracy skills.', '')) : null,
        hist.length ? h('div.small.muted', tr('Recent: ', 'Ostatnio: ') + hist.map((x) => Math.round((x.score / x.total) * 100) + '%').join(', ')) : null,
        h('button.btn.big', { type: 'button', onclick: (e) => { e.target.closest('.card').remove(); UI.runQuestions(area, LA.subjectExam(s, 30), { mode: 'exam', ctx: s, onDone: done }); } }, tr('Start the exam →', 'Rozpocznij →'))), area);
    function done(results) {
      const r = T.afterExam(s, results);
      if (r.passed) UI.confetti();
      area.innerHTML = '';
      area.appendChild(h('div.card.col', { style: { maxWidth: '780px', margin: '0 auto' } }, h('div.result-big', `${Math.round(r.score * 100)}%`),
        h('h2', { style: { textAlign: 'center' } }, r.passed ? tr('Exam ready!', 'Gotowa na sprawdzian!') : tr('Good practice — the missed topics are now in extra practice.', 'Dobre ćwiczenie — błędne tematy trafiły do dodatkowych ćwiczeń.')),
        h('details', h('summary', h('strong', tr('See all answers', 'Zobacz odpowiedzi'))), resultList(results)),
        h('div.row.center', h('button.btn', { type: 'button', onclick: () => LA.go('subject/' + s.key) }, tr('Back', 'Wróć')))));
      LA.renderChrome();
    }
  }

  /* ---------- extra practice / review ---------- */
  function viewPractice(kind, ref, params) {
    let rem = null, skill = ref;
    if (kind === 'rem') { rem = S.P().remediation.find((r) => r.id === ref); if (!rem) return LA.go('home', null, { replace: true }); skill = rem.skill; }
    if (!LA.index.lessons[skill] && !LA.index.chapters[skill]) return LA.go('home', null, { replace: true });
    const lesson = LA.index.lessons[skill];
    const ch = lesson ? LA.index.chapters[lesson.chapterKey] : LA.index.chapters[skill];
    const s = LA.index.subjects[ch.subjectKey];
    UI.tutor.context = lesson || ch;
    const title = rem ? tr('Extra practice', 'Dodatkowe ćwiczenia') : params.review ? tr('Quick review', 'Szybka powtórka') : tr('Mixed practice', 'Ćwiczenia mieszane');
    const c = h('div.content');
    main.appendChild(c);
    const area = h('div');
    const m = S.mastery(skill);
    const intro = h('div.card.col', { style: { maxWidth: '720px', margin: '0 auto' } },
      h('div.eyebrow', title), h('h1', LA.skillLabel(skill)),
      rem ? h('div.feedback.info', rem.source === 'parent' ? h('strong', tr('From your grown-up: ', 'Od rodzica: ')) : null, rem.reason) : null,
      m != null ? h('div.small.muted', tr('Mastery: ', 'Opanowanie: ') + Math.round(m * 100) + '%') : null,
      h('p', rem ? tr(`Get ${Math.round(T.PASS_REMEDIATION * 100)}% or more to finish this task.`, `Zdobądź ${Math.round(T.PASS_REMEDIATION * 100)}% lub więcej, aby zaliczyć.`) : tr('A short set to keep this skill sharp.', 'Krótki zestaw, by utrwalić umiejętność.')),
      h('div.row', lesson ? h('button.btn.secondary', { type: 'button', onclick: () => LA.go('lesson/' + lesson.key) }, tr('Re-read the lesson', 'Przeczytaj lekcję')) : null,
        AI.available() ? h('button.btn.secondary', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Teach me again', 'Wytłumacz jeszcze raz'), (on) => AI.reteach(skill, on))) }, tr('🧑‍🏫 Teach me again differently', '🧑‍🏫 Wytłumacz inaczej')) : null,
        AI.available() ? UI.otherLangBtn((on, lang) => AI.reteach(skill, on, lang)) : null),
      h('div.row', { style: { marginTop: '6px' } }, h('button.btn.big', { type: 'button', onclick: () => start(LA.skillPractice(skill, rem && rem.n ? rem.n : 6, { stretch: rem && rem.stretch })) }, tr('Start →', 'Start →')),
        AI.available() ? h('button.btn.secondary', { type: 'button', onclick: aiStart }, tr('New questions from ', 'Nowe pytania od ') + LA.PROGRAMMES[s.prog].tutor) : null));
    c.append(crumbs([[s.name, 'subject/' + s.key], [ch.title, 'chapter/' + ch.key], [title]]), intro, area);
    function aiStart(e) {
      const b = e.currentTarget;
      b.disabled = true;
      b.textContent = tr('Writing questions…', 'Przygotowuję pytania…');
      AI.generatePractice(skill, 6, rem && rem.stretch).then(start).catch((err) => { b.textContent = '' + err.message; setTimeout(() => start(LA.skillPractice(skill, 6)), 1500); });
    }
    function start(qs) {
      intro.classList.add('hidden');
      UI.runQuestions(area, qs, { mode: 'review', ctx: lesson || ch, onDone: done });
    }
    function done(results) {
      area.innerHTML = '';
      let ok, right = results.filter((r) => r.correct).length, total = results.length;
      if (rem) { ok = T.afterRemediation(rem, results).ok; T.markPlan('remediation', rem.id); }
      else { ok = total ? right / total >= 0.8 : true; T.markPlan('review', skill); S.log('review', skill, 6); }
      if (ok) UI.confetti();
      const blockingLeft = S.openRemediation().filter((r) => r.chapterKey === ch.key && r.blocking);
      const nextRem = S.openRemediation(s.prog)[0];
      area.appendChild(h('div.card.col', { style: { textAlign: 'center', alignItems: 'center', maxWidth: '640px', margin: '0 auto' } }, h('div.result-big', `${right}/${total}`),
        h('h2', ok ? tr('Nailed it!', 'Super!') : tr('Getting there — let’s keep at it', 'Już blisko — ćwiczymy dalej')),
        !ok && AI.available() ? UI.aiBox(tr('Teach me again', 'Wytłumacz jeszcze raz'), (on) => AI.reteach(skill, on)) : null,
        h('div.row.center',
          !ok ? h('button.btn.big', { type: 'button', onclick: () => start(LA.skillPractice(skill, 6)) }, tr('Try again →', 'Jeszcze raz →')) : null,
          ok && rem && rem.blocking && !blockingLeft.length ? h('button.btn.big', { type: 'button', onclick: () => LA.go('quiz/' + ch.key) }, tr('Retake the quiz', 'Popraw sprawdzian')) : null,
          ok && nextRem ? h('button.btn.secondary', { type: 'button', onclick: () => LA.go('practice/rem/' + nextRem.id) }, tr('Next practice', 'Następne ćwiczenie')) : null,
          h('button.btn.secondary', { type: 'button', onclick: () => LA.go('home') }, tr('Today', 'Dzisiaj')))));
      LA.renderChrome();
    }
  }

  /* ---------- homework list ---------- */
  function viewHomework() {
    const prog = LA.state.prog;
    const open = S.openHomework(prog);
    const P = S.P();
    const done = Object.keys(P.hwSets).filter((k) => P.hwSets[k].status === 'done' && LA.progOfKey(k) === prog && LA.index.lessons[k]).sort((a, b) => P.hwSets[b].doneAt - P.hwSets[a].doneAt).slice(0, 12);
    const rems = S.openRemediation(prog);
    const c = h('div.content', h('div.eyebrow', LA.PROGRAMMES[prog].flag + ' ' + LA.PROGRAMMES[prog].short), h('h1', tr('Homework', 'Prace domowe')),
      h('p.muted', tr('Homework sets appear after each lesson is learnt together. Do them on your own.', 'Prace domowe pojawiają się po każdej lekcji zrobionej razem. Rób je samodzielnie.')));
    main.appendChild(c);
    const list = h('div.plan');
    if (!open.length) list.appendChild(h('p', tr('No homework waiting. Learn a new lesson to get some!', 'Brak zadań. Zrób nową lekcję, aby dostać pracę domową!')));
    open.forEach((k) => { const l = LA.index.lessons[k]; list.appendChild(h('button.plan-item', { type: 'button', onclick: () => LA.go('lesson/' + k, { step: 'homework' }) }, h('span.ico', '🎒'), h('div', { style: { flex: 1 } }, h('div.k', LA.subjectOf(k).name), h('div.t', l.title)), h('span', '›'))); });
    c.appendChild(h('div.card', h('h2', tr('To do', 'Do zrobienia')), list));
    if (rems.length) c.appendChild(h('div.card', { style: { marginTop: '14px' } }, h('h2', tr('Extra practice', 'Dodatkowe ćwiczenia')), h('div.plan', rems.slice(0, 10).map((r) => h('button.plan-item', { type: 'button', onclick: () => LA.go('practice/rem/' + r.id) }, h('span.ico', r.source === 'parent' ? '👪' : '🎯'), h('div', { style: { flex: 1 } }, h('div.t', LA.skillLabel(r.skill)), h('div.small.muted', r.reason)), h('span', '›'))))));
    if (done.length) c.appendChild(h('div.card.soft', { style: { marginTop: '14px' } }, h('h3', tr('Recently done', 'Ostatnio zrobione')), h('div.col', { style: { gap: '6px' } }, done.map((k) => h('div.row', h('span', '✓'), h('span', LA.index.lessons[k].title), h('span.spacer'), h('span.small.muted', P.hwSets[k].total ? `${P.hwSets[k].score}/${P.hwSets[k].total}` : ''))))));
  }

  /* ---------- tricky words (spelling list + dictation) ---------- */
  function viewWords() {
    const prog = LA.state.prog;
    const P = S.P();
    const words = T.trickyWords(prog);
    const mastered = Object.keys(P.spelling).filter((w) => P.spelling[w].lang === LA.PROGRAMMES[prog].lang && P.spelling[w].mastered);
    const c = h('div.content', h('div.eyebrow', LA.PROGRAMMES[prog].flag), h('h1', tr('My tricky words', 'Moje trudne wyrazy')),
      h('p.muted', tr('Words you nearly spelt right are collected here automatically. Practise them with dictation — say it, hear it, write it. Three correct in a row and a word is mastered.', 'Tu automatycznie trafiają wyrazy, w których był błąd. Ćwicz je dyktandem — posłuchaj i napisz. Trzy razy dobrze z rzędu i wyraz jest opanowany.')));
    main.appendChild(c);
    const area = h('div');
    if (words.length) {
      c.appendChild(h('div.card', h('div.row', h('h2', { style: { margin: 0 } }, `${words.length} ${tr('words to practise', 'wyrazów do ćwiczenia')}`), h('span.spacer'), h('button.btn', { type: 'button', onclick: start }, tr('Dictation practice', 'Dyktando'))),
        h('div.row', { style: { marginTop: '12px' } }, words.slice(0, 40).map((w) => h('span.chip', { title: (P.spelling[w].wrong || []).join(', ') }, w, P.spelling[w].ok ? ' ' + '•'.repeat(P.spelling[w].ok) : '')))));
    } else c.appendChild(h('div.card', h('p', tr('No tricky words yet — great spelling! Words appear here when a spelling slip is spotted.', 'Na razie brak trudnych wyrazów — świetna ortografia! Wyrazy pojawią się, gdy zdarzy się błąd.'))));
    if (prog === 'pl') c.appendChild(h('div.card.soft', { style: { marginTop: '14px' } }, h('h3', 'Dyktando ortograficzne'), h('p.small.muted', 'Ćwicz wyrazy z ó/u, rz/ż i ch/h z wyjaśnieniem reguły.'), h('div.row', [['ou', 'ó / u'], ['rz', 'rz / ż'], ['ch', 'ch / h'], ['all', 'wszystkie']].map(([k, lbl]) => h('button.btn.secondary.small', { type: 'button', onclick: () => run(LA.expand([LA.Q.gen('plDyktando', { set: k }, 8)], 'p3.polski')) }, lbl)))));
    if (mastered.length) c.appendChild(h('div.card.soft', { style: { marginTop: '14px' } }, h('h3', tr('Mastered ✓', 'Opanowane ✓')), h('div.row', mastered.slice(-40).map((w) => h('span.tag.good', w)))));
    c.appendChild(area);
    function start() {
      const qs = U.shuffle(words).slice(0, 10).map((w) => Object.assign(LA.Q.dict(w), { lang: LA.PROGRAMMES[prog].lang, skill: null, iid: U.uid(), explain: tr(`Spelt: ${w.split('').join(' - ')}`, `Pisownia: ${w.split('').join(' - ')}`) }));
      run(qs);
    }
    function run(qs) {
      c.querySelectorAll('.card').forEach((x) => x.classList.add('hidden'));
      UI.runQuestions(area, qs, { mode: 'review', onDone: (results) => {
        T.markPlan('spelling', prog);
        area.innerHTML = '';
        const right = results.filter((r) => r.correct).length;
        area.appendChild(h('div.card.col', { style: { textAlign: 'center', alignItems: 'center' } }, h('div.result-big', `${right}/${results.length}`), h('button.btn', { type: 'button', onclick: () => LA.refresh() }, tr('Done', 'Gotowe'))));
      } });
    }
    if (current.params.start && words.length) setTimeout(start, 50);
  }

  /* ---------- bridge (combined view) ---------- */
  function viewBridge() {
    const p = S.activeProfile();
    const c = h('div.content', h('div.eyebrow', '🇦🇺 ⇄ 🇵🇱'), h('h1', tr('Bridge', 'Most')),
      h('p.muted', tr('One place to see both programmes together: today’s work in each, topics that overlap (so nothing is learnt twice), and a two-language word list.', 'Jedno miejsce dla obu programów: dzisiejsza praca, tematy wspólne (żeby nie uczyć się dwa razy) i dwujęzyczny słowniczek.')));
    main.appendChild(c);
    const cols = h('div.grid.two');
    ['au', 'pl'].forEach((prog) => {
      if (!p[prog].on) return;
      const P = LA.PROGRAMMES[prog];
      const plan = T.planToday(prog);
      const left = plan.items.filter((i) => !i.done).length;
      cols.appendChild(h('div.card', h('div.row', h('span', { style: { fontSize: '1.8em' } }, P.flag), h('div', h('div.display', { style: { fontWeight: 800 } }, P.short + ' · ' + P.yearLabel(p[prog].year)), h('div.small.muted', `${left} ${prog === 'pl' ? 'zadań na dziś' : 'tasks left today'}`))),
        h('div.plan', { style: { marginTop: '10px' } }, plan.items.slice(0, 6).map((it) => h('button.plan-item' + (it.done ? '.done' : ''), { type: 'button', onclick: () => { LA.state.prog = prog; LA.go(it.kind === 'lesson' ? 'lesson/' + it.ref : it.kind === 'hw' ? 'lesson/' + it.ref : it.kind === 'quiz' ? 'quiz/' + it.ref : it.kind === 'remediation' ? 'practice/rem/' + it.ref : 'home', it.kind === 'hw' ? { step: 'homework' } : null); } }, h('div', { style: { flex: 1 } }, h('div.t', { style: { fontSize: '0.92em' } }, it.title)), h('span.chk', it.done ? '✓' : ''))))));
    });
    c.appendChild(cols);
    // overlaps
    const pairs = LA.bridge.overlaps(p);
    c.appendChild(h('div.card', { style: { marginTop: '14px' } }, h('h2', tr('Topics in both programmes', 'Tematy wspólne')),
      h('p.small.muted', tr('When a topic is passed in one programme, try ⚡ Test out in the other — it saves time and checks the skill in the second language.', 'Gdy temat jest zaliczony w jednym programie, spróbuj ⚡ „Zalicz testem” w drugim — oszczędza to czas i sprawdza umiejętność w drugim języku.')),
      pairs.length ? h('div.tablewrap', h('table.report', h('tr', h('th', '🇦🇺'), h('th', '🇵🇱'), h('th', '')), pairs.map((x) => h('tr', h('td', x.au.title, ' ', x.auDone ? h('span.tag.good', '✓') : null), h('td', x.pl.title, ' ', x.plDone ? h('span.tag.good', '✓') : null),
        h('td', x.auDone && !x.plDone ? h('button.btn.small.secondary', { type: 'button', onclick: () => LA.go('quiz/' + x.pl.key, { mode: 'testout' }) }, 'PL') : !x.auDone && x.plDone ? h('button.btn.small.secondary', { type: 'button', onclick: () => LA.go('quiz/' + x.au.key, { mode: 'testout' }) }, 'AU') : null))))) : h('p', tr('Overlaps appear when both programmes are switched on.', 'Wspólne tematy pojawią się, gdy oba programy są włączone.'))));
    // glossary
    const gl = LA.bridge.glossary(p);
    c.appendChild(h('div.card', { style: { marginTop: '14px' } }, h('h2', tr('Two-language word list', 'Słowniczek dwujęzyczny')), h('p.small.muted', tr('Key words from the Australian lessons with their Polish meaning. Tap speaker to hear each one.', 'Ważne słowa z lekcji australijskich z polskim znaczeniem. Dotknij 🔊, aby usłyszeć.')),
      h('div.tablewrap', h('table.report', h('tr', h('th', 'English'), h('th', 'Polski'), h('th', '')), gl.slice(0, 200).map((g) => h('tr', h('td', h('strong', g.en)), h('td', g.pl), h('td', UI.speakBtn(g.en, '', 'en-AU'), ' ', UI.speakBtn(g.pl, '', 'pl-PL'))))))));
  }

  /* ---------- how it works (tutorial) ---------- */
  function viewHelp() {
    const first = current.params.first;
    const steps = [
      ['flag', '#007aff', tr('Two programmes, one app', 'Dwa programy w jednej aplikacji'), tr('Switch between 🇦🇺 Australia (in English, tutor Koa) and 🇵🇱 Polska (po polsku, Sowa Zosia) at the top. Each follows its own curriculum for the grade chosen in the Parent area.', 'U góry przełączasz 🇦🇺 Australia (po angielsku, Koa) i 🇵🇱 Polska (po polsku, Sowa Zosia). Każdy program ma własną podstawę dla wybranej klasy.')],
      ['book', '#007aff', tr('1 · Learn together', '1 · Uczymy się razem'), tr('A grown-up and child go through the lesson step by step. Each step has a tip for the grown-up and a speaker button that reads it aloud.', 'Rodzic i dziecko przechodzą lekcję krok po kroku. Każdy krok ma wskazówkę dla rodzica i przycisk z głośnikiem.')],
      ['pencil', '#ff9500', tr('2 · Practise together', '2 · Ćwiczymy razem'), tr('Questions straight after the lesson. Two tries, then an explanation. If it’s tricky, the app goes over it again and adds extra practice.', 'Pytania zaraz po lekcji. Dwie próby, potem wyjaśnienie. Gdy jest trudno, aplikacja wraca do tematu i dodaje ćwiczenia.')],
      ['tray', '#34c759', tr('3 · Homework on her own', '3 · Praca domowa samodzielnie'), tr('A short independent set appears in Homework. Strong answers unlock ★ above-par questions.', 'Krótki zestaw do samodzielnej pracy. Dobre wyniki odblokowują ★ zadania z gwiazdką.')],
      ['doc', '#5856d6', tr('Quizzes, challenges and exams', 'Sprawdziany, wyzwania, egzaminy'), tr('Each chapter ends with a quiz (80% to pass), plus an optional ★ challenge. Each subject has an end-of-year practice exam.', 'Każdy rozdział kończy się sprawdzianem (80%), a także opcjonalnym ★ wyzwaniem. Każdy przedmiot ma próbny sprawdzian końcoworoczny.')],
      ['mic', '#ff3b30', tr('Answer by voice', 'Odpowiedź głosem'), tr('Tap the microphone next to an answer and say it. Works for multiple choice, numbers and the tutor chat. For spelling questions the microphone is off (it would spell the word for her) unless a grown-up turns it on.', 'Dotknij mikrofonu przy odpowiedzi i powiedz ją. Działa przy pytaniach z wyborem, liczbach i rozmowie z asystentem. Przy ortografii mikrofon jest wyłączony (przeliterowałby wyraz), chyba że rodzic go włączy.')],
      ['hand', '#af52de', tr('Apple Pencil', 'Apple Pencil'), tr('Tap the pencil next to an answer to write by hand. The tutor reads the writing, asks “Is that what you wrote?”, and uses confirmed samples to read her handwriting better. You can also write straight into any answer box (iPad Scribble).', 'Dotknij ołówka przy odpowiedzi, aby pisać ręcznie. Asystent odczyta pismo, zapyta „Czy to napisałaś?” i wykorzysta potwierdzone próbki, by lepiej czytać jej pismo. Można też pisać rysikiem prosto w pole odpowiedzi (Scribble).')],
      ['textformat', '#30b0c7', tr('Spelling', 'Ortografia'), tr('Near-misses (like “freind”) are spotted and collected in Tricky words for dictation practice.', 'Drobne błędy (np. „ksiąszka”) są wychwytywane i trafiają do „Trudnych wyrazów” na dyktando.')],
      ['cloudCheck', '#34c759', tr('Saved everywhere, never lost', 'Zapis wszędzie, nic nie ginie'), tr('Work saves on the device instantly, syncs to your family cloud account when signed in, and keeps automatic daily backups. Sign in with the same account on the iPad and the computer.', 'Praca zapisuje się od razu na urządzeniu, synchronizuje z rodzinnym kontem w chmurze i ma automatyczne codzienne kopie. Zaloguj się tym samym kontem na iPadzie i komputerze.')],
      ['download', '#8e8e93', tr('Put it on the Home Screen', 'Dodaj do ekranu głównego'), tr('In Safari, tap Share → Add to Home Screen — it then opens full-screen like an app and works offline. Best voices: Settings → Accessibility → Spoken Content → Voices → English (Australia) → Karen, and Polish → Zosia (download the Enhanced versions).', 'W Safari: Udostępnij → Do ekranu początkowego — otworzy się jak aplikacja i działa offline. Najlepsze głosy: Ustawienia → Dostępność → Mowa → Głosy → angielski (Australia) → Karen oraz polski → Zosia (pobierz wersje „Rozszerzone”).')],
    ];
    const c = h('div.content', h('div.eyebrow', tr('Tutorial', 'Samouczek')), h('h1', tr('How it works', 'Jak to działa')));
    main.appendChild(c);
    c.appendChild(h('div.grid.two', steps.map(([ic, col, t, d]) => h('div.card', LA.appIcon(ic, col, 44), h('h3', { style: { marginTop: '12px' } }, t), h('p.small.muted', d), UI.speakBtn(t + '. ' + d, '')))));
    c.appendChild(h('div.row', { style: { marginTop: '18px' } }, h('button.btn.big', { type: 'button', onclick: () => LA.go('home') }, first ? tr('Let’s begin →', 'Zaczynamy →') : tr('Back to today', 'Wróć'))));
  }

  /* ---------- curriculum coverage ---------- */
  function viewCurriculum() {
    const c = h('div.content', h('h1', 'Curriculum coverage'),
      h('div.card.col',
        h('p', 'Australian section: follows the learning areas, strands and year-level content of the Australian Curriculum v9.0 for Years 3 and 4. A content-description code is shown only where it was checked against published lists; other chapters are labelled by strand. Physical Education (movement) is left out because it is covered at school; Health topics stay. Languages are not included because schools choose the language.'),
        h('p', 'Polish section: follows the topics of the podstawa programowa — edukacja wczesnoszkolna for klasa 3 and the klasa 4 subjects (język polski, matematyka, przyroda, historia), with plastyka/muzyka and technika/informatyka as optional enrichment. Physical education and the foreign language are left out.'),
        h('p.small.muted', 'This is a home-learning aid, not an official ACARA or MEN product, and does not replace school reports.')));
    main.appendChild(c);
    Object.keys(LA.curriculum).forEach((ck) => {
      const prog = ck.slice(0, 2), year = +ck.slice(2);
      const P = LA.PROGRAMMES[prog];
      const subs = LA.curriculum[ck].subjects;
      const lessons = subs.reduce((n, s) => n + s.chapters.reduce((m, ch) => m + ch.lessons.length, 0), 0);
      c.appendChild(h('h2', { style: { marginTop: '22px' } }, `${P.flag} ${P.yearLabel(year)} — ${subs.length} subjects, ${lessons} lessons`));
      subs.forEach((s) => c.appendChild(h('details.card', { style: { marginTop: '8px' } }, h('summary', h('strong', `${s.icon} ${s.long || s.name}`), ` — ${s.chapters.length} chapters, ${s.chapters.reduce((n, ch) => n + ch.lessons.length, 0)} lessons`),
        h('div.tablewrap', h('table.report', h('tr', h('th', 'Term'), h('th', 'Chapter'), h('th', 'Strand'), h('th', 'Lessons'), h('th', 'Code')), s.chapters.map((ch) => h('tr', h('td', String(ch.term || 1)), h('td', ch.title), h('td.small', ch.strand || ''), h('td', String(ch.lessons.length)), h('td.small', ch.code || ''))))))));
    });
  }

  /* ---------- boot ---------- */
  LA.start = async function () {
    shell = document.getElementById('app');
    shell.innerHTML = '';
    topbar = h('header.topbar');
    sidebar = h('aside.sidebar');
    main = h('div.content');
    const mainWrap = h('main.main', main);
    tabbar = h('nav.tabbar');
    shell.append(sidebar, h('div', { style: { minWidth: 0 } }, topbar, mainWrap), tabbar);
    shell.classList.add('app');
    UI.initTutor();
    LA.state.prog = S.settings().lastProg || 'au';
    const hash = (location.hash || '').replace(/^#\/?/, '');
    if (hash) current = { path: hash, params: {} };
    LA.cloud.onStatus(() => { const el = sidebar.querySelector('.sync'); if (el) el.replaceWith(syncChip()); });
    const restored = LA.backup ? await LA.backup.init() : false;
    if (restored) current = { path: 'home', params: {} };
    route();
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
    await AI.init();
    const changed = await LA.cloud.init((scope) => { if (!document.querySelector('.q-wrap')) route(); else LA.renderChrome(); });
    if (changed) route();
    else LA.renderChrome();
  };
})();

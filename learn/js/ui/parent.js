/* Parent portal: progress and par rating, AI advice, assign extra tutor work, settings, learners, backup. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const T = LA.tutor;
  const AI = LA.ai;
  const SP = LA.speech;
  const UI = LA.ui;
  const h = UI.h;
  const tr = (en, pl) => LA.tr(en, pl);
  const PA = (LA.parent = {});
  let unlocked = false;

  PA.view = function (tab, main) {
    const st = S.settings();
    const c = h('div.content');
    main.appendChild(c);
    if (st.pin && !unlocked) {
      const inp = h('input', { type: 'password', inputmode: 'numeric', placeholder: 'PIN', 'aria-label': 'Parent PIN', id: 'ppin' });
      const msg = h('div.small');
      const go = () => { if (inp.value === st.pin) { unlocked = true; LA.refresh(); } else { msg.textContent = tr('That PIN is not right.', 'Nieprawidłowy PIN.'); inp.value = ''; } };
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      c.appendChild(h('div.card.col', { style: { maxWidth: '420px', margin: '40px auto' } }, h('h1', tr('Grown-ups only', 'Tylko dla dorosłych')), h('p', tr('Enter the parent PIN.', 'Wpisz PIN rodzica.')), inp, msg, h('button.btn', { type: 'button', onclick: go }, tr('Unlock', 'Odblokuj'))));
      setTimeout(() => inp.focus(), 30);
      return;
    }
    const tabs = [['overview', tr('Progress', 'Postępy')], ['assign', tr('Extra tutor work', 'Dodatkowa praca')], ['settings', tr('Settings', 'Ustawienia')], ['learners', tr('Learners', 'Uczniowie')], ['cloud', tr('Cloud & backup', 'Chmura i kopie')]];
    const seg = h('div.seg', tabs.map(([k, l]) => h('button' + (k === tab ? '.on' : ''), { type: 'button', onclick: () => LA.go('parent/' + k, null, { replace: true }) }, l)));
    c.append(h('div.row', h('h1', { style: { margin: 0 } }, tr('Parent portal', 'Panel rodzica')), h('span.spacer'), h('div.seg', [['en', 'EN'], ['pl', 'PL']].map(([k, l]) => h('button' + ((st.parentLang || 'en') === k ? '.on' : ''), { type: 'button', onclick: () => { S.setSetting('parentLang', k); LA.refresh(); } }, l)))),
      h('div', { style: { margin: '14px 0 18px' } }, seg));
    const p = S.activeProfile();
    if (tab === 'data') tab = 'cloud';
    if (!p && tab !== 'learners' && tab !== 'settings' && tab !== 'cloud') { c.appendChild(h('div.card', h('p', tr('Add a learner first.', 'Najpierw dodaj ucznia.')), h('button.btn', { type: 'button', onclick: () => LA.go('welcome') }, tr('Add learner', 'Dodaj ucznia')))); return; }
    if (tab === 'assign') return assign(c);
    if (tab === 'settings') return settings(c);
    if (tab === 'learners') return learners(c);
    if (tab === 'cloud') return data(c);
    return overview(c);
  };

  /* ---------- progress overview ---------- */
  function summaryFor(prog) {
    const p = S.activeProfile();
    const P = S.P();
    const subs = T.subjects(prog);
    const lines = subs.map((s) => {
      const st = T.subjectStats(s), par = T.par(s);
      return `${s.name}: ${st.done}/${st.lessons} lessons, ${st.passed}/${st.chapters} chapters passed (expected ≈${st.expected} by now), rating ${par.level}${par.accuracy != null ? `, accuracy ${Math.round(par.accuracy * 100)}%` : ''}${par.stretchAcc != null ? `, above-par questions ${Math.round(par.stretchAcc * 100)}%` : ''}, challenges passed ${par.challengesPassed || 0}.`;
    });
    const weak = T.weakSkills(prog, 8).map((w) => `${LA.skillLabel(w.skill)} (${Math.round(w.m * 100)}%)`).join('; ');
    const pre = LA.PROGRAMMES[prog].prefix(p[prog].year) + '.';
    const mistakes = P.mistakes.filter((m) => m.skill.startsWith(pre)).slice(-12).map((m) => `${LA.skillLabel(m.skill)}: "${m.q}" → said ${m.given}, answer ${m.correct}`).join('\n');
    const words = T.trickyWords(prog).slice(0, 15).join(', ');
    return `${LA.PROGRAMMES[prog].name} — ${LA.PROGRAMMES[prog].yearLabel(p[prog].year)}\n${lines.join('\n')}\nWeak skills: ${weak || 'none flagged'}\nTricky spelling words: ${words || 'none'}\nRecent mistakes:\n${mistakes || 'none'}`;
  }

  function adviceOffline(prog) {
    const subs = T.subjects(prog);
    const out = [];
    subs.forEach((s) => {
      const par = T.par(s), st = T.subjectStats(s);
      if (par.level === 'below') out.push(tr(`**${s.name}** is below par (${Math.round(par.accuracy * 100)}% accuracy). Repeat the lessons with the most mistakes together and use “Extra tutor work” for those topics.`, `**${s.name}** — poniżej poziomu (${Math.round(par.accuracy * 100)}% poprawnych). Powtórzcie razem lekcje z największą liczbą błędów i przydzielcie „Dodatkową pracę”.`));
      else if (par.level === 'above') out.push(tr(`**${s.name}** is above par — keep stretching with ★ challenges and the practice exam.`, `**${s.name}** — powyżej poziomu. Kontynuujcie zadania z gwiazdką i próbny sprawdzian.`));
      else if (par.level === 'on' && par.accuracy >= 0.85) out.push(tr(`**${s.name}** is on par and strong — try the ★ challenge on passed chapters to push above par.`, `**${s.name}** — na poziomie i dobrze idzie. Spróbujcie zadań z gwiazdką, by wyjść ponad poziom.`));
      if (st.behind >= 2) out.push(tr(`**${s.name}** is ${st.behind} chapters behind the school calendar — use ⚡ Test out on known chapters or raise the daily minutes.`, `**${s.name}** — ${st.behind} rozdziałów za kalendarzem szkolnym. Użyjcie „Zalicz testem” albo zwiększcie czas dzienny.`));
    });
    const words = T.trickyWords(prog);
    if (words.length >= 5) out.push(tr(`${words.length} tricky spelling words are waiting — 5 minutes of dictation a day helps.`, `${words.length} trudnych wyrazów czeka na ćwiczenie — 5 minut dyktanda dziennie pomaga.`));
    if (!out.length) out.push(tr('Not enough work yet for advice. After a few lessons and quizzes, ratings appear here.', 'Za mało danych na porady. Po kilku lekcjach i sprawdzianach pojawią się tu oceny.'));
    return out;
  }

  function overview(c) {
    const p = S.activeProfile();
    const P = S.P();
    const week = P.log.filter((l) => Date.now() - l.at < 7 * 86400000).reduce((s, l) => s + (l.minutes || 0), 0);
    const lastExp = S.settings().lastExport || 0;
    if (!LA.cloud.user || Date.now() - lastExp > 30 * 86400000) {
      c.appendChild(h('div.card.row', { style: { marginBottom: '16px', background: 'var(--warn-soft)' } }, LA.appIcon('cloud', '#ff9500', 38),
        h('div', { style: { flex: 1, minWidth: '200px' } }, h('strong', !LA.cloud.user ? tr('Work is only on this device', 'Praca jest tylko na tym urządzeniu') : tr('Time for a monthly backup file', 'Czas na comiesięczny plik kopii')),
          h('div.small.muted', !LA.cloud.user ? tr('Sign in to the family cloud account so it syncs and is backed up every day.', 'Zaloguj się do konta rodzinnego, aby synchronizować i codziennie robić kopię.') : tr('An extra copy you keep in Files or iCloud Drive.', 'Dodatkowa kopia w Plikach lub iCloud Drive.'))),
        h('button.btn.small', { type: 'button', onclick: () => LA.go('parent/cloud', null, { replace: true }) }, tr('Open', 'Otwórz'))));
    }
    c.appendChild(h('div.grid.three', h('div.stat', h('div.n', String(P.streak.count || 0)), h('div.muted.small', tr('day streak', 'dni z rzędu'))), h('div.stat', h('div.n', '≈' + week), h('div.muted.small', tr('minutes this week', 'minut w tym tygodniu'))), h('div.stat', h('div.n', String(S.openRemediation().length)), h('div.muted.small', tr('extra-practice tasks open', 'otwartych zadań dodatkowych'))), h('div.stat', h('div.n', String(Object.keys(P.spelling).filter((w) => !P.spelling[w].mastered).length)), h('div.muted.small', tr('tricky words', 'trudnych wyrazów')))));
    ['au', 'pl'].forEach((prog) => {
      if (!p[prog].on) return;
      const Pg = LA.PROGRAMMES[prog];
      const subs = T.subjects(prog);
      const card = h('div.card', { style: { marginTop: '16px' } }, h('div.row', h('span', { style: { fontSize: '1.7em' } }, Pg.flag), h('h2', { style: { margin: 0 } }, `${Pg.name} · ${Pg.yearLabel(p[prog].year)}`)),
        h('div.tablewrap', { style: { marginTop: '10px' } }, h('table.report',
          h('tr', h('th', tr('Subject', 'Przedmiot')), h('th', tr('Lessons', 'Lekcje')), h('th', tr('Chapters', 'Rozdziały')), h('th', tr('Pace', 'Tempo')), h('th', tr('Accuracy', 'Poprawność')), h('th', tr('Level', 'Poziom'))),
          subs.map((s) => { const st = T.subjectStats(s), par = T.par(s); return h('tr', h('td', s.icon + ' ' + s.name), h('td', `${st.done}/${st.lessons}`), h('td', `${st.passed}/${st.chapters}`), h('td', st.behind ? h('span.tag.warn', `−${st.behind}`) : h('span.tag.good', tr('on time', 'w terminie'))), h('td', par.accuracy != null ? Math.round(par.accuracy * 100) + '%' : '—'), h('td', h('span.par.' + par.level, par.label))); }))),
        h('p.tiny.muted', tr('Level compares quiz scores and answers with the pass marks, and counts ★ above-par questions. Pace compares chapters passed with how far through the school year it is.', 'Poziom porównuje wyniki z progiem zaliczenia i uwzględnia zadania z gwiazdką. Tempo porównuje zaliczone rozdziały z postępem roku szkolnego.')));
      const adv = h('div.col', { style: { marginTop: '10px' } }, h('h3', tr('Advice', 'Porady')), h('ul', adviceOffline(prog).map((a) => h('li', { html: U.fmtInline(a) }))));
      if (AI.available()) adv.appendChild(h('button.btn.secondary', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Teacher’s assessment', 'Ocena nauczyciela'), (on) => AI.parentAdvice(summaryFor(prog), on), { prog })) }, tr('Ask the AI teacher: below, on or above par — and how to improve', 'Zapytaj AI: poniżej, na czy powyżej poziomu — i jak poprawić')));
      else adv.appendChild(h('p.small.muted', tr('Open the app on claude.ai (or add an API key in Settings) for a detailed AI assessment.', 'Otwórz aplikację na claude.ai (lub dodaj klucz API) po szczegółową ocenę AI.')));
      card.appendChild(adv);
      const weak = T.weakSkills(prog, 10);
      if (weak.length) card.appendChild(h('div', { style: { marginTop: '12px' } }, h('h3', tr('Topics needing attention', 'Tematy do poprawy')), h('div.tablewrap', h('table.report', weak.map((w) => h('tr', h('td', LA.skillLabel(w.skill)), h('td', h('span.tag.bad', Math.round(w.m * 100) + '%')), h('td', h('button.btn.small.secondary', { type: 'button', onclick: () => assignModal(w.skill) }, tr('Assign extra work', 'Przydziel ćwiczenia')))))))));
      c.appendChild(card);
    });
    const recent = P.mistakes.slice(-15).reverse();
    if (recent.length) c.appendChild(h('div.card', { style: { marginTop: '16px' } }, h('h3', tr('Recent mistakes', 'Ostatnie błędy')), h('div.tablewrap', h('table.report', h('tr', h('th', tr('Topic', 'Temat')), h('th', tr('Question', 'Pytanie')), h('th', tr('Said', 'Odp.')), h('th', tr('Answer', 'Poprawnie'))), recent.map((m) => h('tr', h('td.small', LA.skillLabel(m.skill)), h('td.small', m.q), h('td', m.given), h('td', m.correct)))))));
  }

  /* ---------- assign extra tutor work ---------- */
  function assignModal(skill) {
    let n = 8, stretch = false;
    const note = h('input', { type: 'text', placeholder: tr('Message for the child (optional)', 'Wiadomość dla dziecka (opcjonalnie)') });
    const sizeSeg = h('div.seg', [5, 8, 12].map((k) => { const b = h('button' + (k === n ? '.on' : ''), { type: 'button' }, String(k)); b.addEventListener('click', () => { n = k; sizeSeg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }); return b; }));
    const lvlSeg = h('div.seg', [[false, tr('At grade level', 'Na poziomie klasy')], [true, tr('★ Above par', '★ Powyżej poziomu')]].map(([v, l]) => { const b = h('button' + (v === stretch ? '.on' : ''), { type: 'button' }, l); b.addEventListener('click', () => { stretch = v; lvlSeg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }); return b; }));
    UI.modal(tr('Assign extra tutor work', 'Przydziel dodatkową pracę'), h('div.col', h('p', h('strong', LA.skillLabel(skill))), h('div', h('label.field', tr('Number of questions', 'Liczba pytań')), sizeSeg), h('div', h('label.field', tr('Level', 'Poziom')), lvlSeg), note,
      h('p.small.muted', tr('It appears at the top of the child’s plan as “From your grown-up”, with the option to have the tutor re-teach the topic first.', 'Pojawi się na górze planu dziecka jako „Od rodzica”, z możliwością ponownego wytłumaczenia tematu przez asystenta.'))),
      [{ label: tr('Cancel', 'Anuluj'), secondary: true }, { label: tr('Assign', 'Przydziel'), onclick: () => {
        const ch = LA.index.lessons[skill] ? LA.index.lessons[skill].chapterKey : skill;
        S.addRemediation({ skill, chapterKey: ch, source: 'parent', n, stretch, reason: note.value.trim() || tr('Extra practice chosen by your grown-up.', 'Dodatkowe ćwiczenia od rodzica.') });
        T.planToday(LA.progOfKey(skill), true);
        UI.toast(tr('Assigned ✓', 'Przydzielono ✓'));
      } }]);
  }
  PA.assignModal = assignModal;

  function assign(c) {
    const p = S.activeProfile();
    let prog = p.au.on ? 'au' : 'pl';
    const progSeg = h('div.seg');
    const subSel = h('select', { 'aria-label': 'Subject' });
    const chSel = h('select', { 'aria-label': 'Chapter' });
    const lSel = h('select', { 'aria-label': 'Lesson' });
    function fillSubs() { subSel.innerHTML = ''; T.subjects(prog).forEach((s) => subSel.appendChild(h('option', { value: s.key }, s.icon + ' ' + s.name))); fillCh(); }
    function fillCh() { chSel.innerHTML = ''; const s = LA.index.subjects[subSel.value]; if (s) s.chapters.forEach((ch) => chSel.appendChild(h('option', { value: ch.key }, ch.title))); fillL(); }
    function fillL() { lSel.innerHTML = ''; lSel.appendChild(h('option', { value: '' }, tr('Whole chapter (mixed)', 'Cały rozdział (mieszane)'))); const ch = LA.index.chapters[chSel.value]; if (ch) ch.lessons.forEach((l) => lSel.appendChild(h('option', { value: l.key }, l.title))); }
    ['au', 'pl'].forEach((k) => { if (!p[k].on) return; const b = h('button' + (k === prog ? '.on' : ''), { type: 'button' }, LA.PROGRAMMES[k].flag + ' ' + LA.PROGRAMMES[k].short); b.addEventListener('click', () => { prog = k; progSeg.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); fillSubs(); }); progSeg.appendChild(b); });
    subSel.addEventListener('change', fillCh);
    chSel.addEventListener('change', fillL);
    fillSubs();
    c.appendChild(h('div.card.col', h('h2', tr('Choose a topic', 'Wybierz temat')), h('p.small.muted', tr('If you notice a topic giving trouble, set extra work here. The tutor can re-teach it first, and the child practises until 80% correct.', 'Gdy zauważysz trudny temat, przydziel tu dodatkową pracę. Asystent może go najpierw ponownie wytłumaczyć, a dziecko ćwiczy do 80% poprawnych odpowiedzi.')),
      progSeg, h('div', h('label.field', tr('Subject', 'Przedmiot')), subSel), h('div', h('label.field', tr('Chapter', 'Rozdział')), chSel), h('div', h('label.field', tr('Lesson', 'Lekcja')), lSel),
      h('div.row', h('button.btn', { type: 'button', onclick: () => assignModal(lSel.value || chSel.value) }, tr('Assign extra work…', 'Przydziel pracę…')),
        h('button.btn.secondary', { type: 'button', onclick: () => { LA.state.prog = prog; LA.go('practice/skill/' + (lSel.value || chSel.value)); } }, tr('Start a tutor session now', 'Rozpocznij sesję teraz')))));
    const open = S.openRemediation().filter((r) => r.source === 'parent');
    if (open.length) c.appendChild(h('div.card', { style: { marginTop: '14px' } }, h('h3', tr('Assigned and not finished', 'Przydzielone, niezakończone')), h('div.col', open.map((r) => h('div.row', h('span', LA.PROGRAMMES[LA.progOfKey(r.skill)].flag), h('span', LA.skillLabel(r.skill)), h('span.spacer'), h('span.small.muted', `${r.n || 6} q${r.stretch ? ' · ★' : ''}`), h('button.btn.ghost.small', { type: 'button', onclick: () => { S.completeRemediation(r.id); LA.refresh(); } }, tr('Remove', 'Usuń')))))));
  }

  /* ---------- settings ---------- */
  function settings(c) {
    const st = S.settings();
    const saved = h('span.small.muted');
    const save = () => { S.saveMain(); S.saveNow(); saved.textContent = tr('✓ Saved', '✓ Zapisano'); setTimeout(() => (saved.textContent = ''), 1800); };
    // AI
    const aiStatus = AI.mode === 'claude' ? tr('Using Claude through claude.ai.', 'Korzysta z Claude przez claude.ai.') : AI.mode === 'apikey' ? tr('On — using your Anthropic API key.', 'Włączony — korzysta z twojego klucza API Anthropic.') : tr('Off. Add an Anthropic API key below to switch on the tutor chat, explanations, AI-made practice, handwriting reading and the progress assessment.', 'Wyłączony. Dodaj poniżej klucz API Anthropic, aby włączyć rozmowę z asystentem, wyjaśnienia, ćwiczenia AI, odczyt pisma i ocenę postępów.');
    const aiOn = h('input', { type: 'checkbox', checked: st.aiEnabled !== false ? true : null });
    aiOn.addEventListener('change', () => { st.aiEnabled = aiOn.checked; save(); });
    const key = h('input', { type: 'password', placeholder: 'sk-ant-…', value: st.apiKey || '', autocomplete: 'off', 'aria-label': 'API key' });
    key.addEventListener('change', () => { st.apiKey = key.value.trim(); save(); });
    const model = h('select', { 'aria-label': 'Model' }, [['claude-opus-5-5', 'Claude Opus 5.5 (best)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (faster, lower cost)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (fastest, lowest cost)']].map(([v, l]) => h('option', { value: v, selected: st.model === v ? true : null }, l)));
    model.addEventListener('change', () => { st.model = model.value; save(); });
    const test = h('div.small');
    c.appendChild(h('div.card.col', h('h2', tr('AI tutor', 'Asystent AI')), h('p.small', aiStatus), h('label.check', aiOn, tr('AI features on', 'Funkcje AI włączone')),
      h('div.col', h('div', h('label.field', tr('Anthropic API key', 'Klucz API Anthropic')), key, h('div.hint', tr('Get one at console.anthropic.com → API keys (usage is billed to your Anthropic account). It is sent only to api.anthropic.com and, when you are signed in to the family cloud, kept in your private cloud space so every device has it.', 'Klucz uzyskasz na console.anthropic.com → API keys (opłaty na twoim koncie Anthropic). Wysyłany jest tylko do api.anthropic.com, a po zalogowaniu do chmury rodzinnej przechowywany w twojej prywatnej przestrzeni, by działał na każdym urządzeniu.'))), h('div', h('label.field', 'Model'), model)),
      h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: () => { test.textContent = tr('Testing…', 'Testuję…'); AI.call([{ role: 'user', content: 'Say a one-sentence hello to a Year 3 student.' }], { tier: 'quick', prog: 'au' }).then((t) => (test.textContent = '✓ ' + t)).catch((e) => (test.textContent = '' + e.message)); } }, tr('Test the AI', 'Testuj AI')), test)));
    // voices
    const voiceCard = h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Read-aloud voices', 'Głosy lektora')),
      h('p.small.muted', tr('Uses the iPad’s own voices (works offline). For the most natural voices: Settings → Accessibility → Spoken Content → Voices → English (Australia) → Karen (Enhanced) and Polish → Zosia (Enhanced).', 'Korzysta z głosów iPada (działa offline). Najbardziej naturalne: Ustawienia → Dostępność → Mowa → Głosy → angielski (Australia) → Karen (rozszerzony) oraz polski → Zosia (rozszerzony).')));
    [['en-AU', tr('Australian section (Koa)', 'Sekcja australijska (Koa)'), "G'day! I'm Koa. Let's learn together today."], ['pl-PL', tr('Polish section (Sowa Zosia)', 'Sekcja polska (Sowa Zosia)'), 'Cześć! Jestem Sowa Zosia. Uczmy się razem!']].forEach(([lang, label, sample]) => {
      const list = SP.voicesFor(lang);
      const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, tr('Automatic: ', 'Automatycznie: ') + (SP.voiceName(lang) || tr('device default', 'domyślny'))), list.map((v) => h('option', { value: v.voiceURI, selected: (st.voice || {})[lang] === v.voiceURI ? true : null }, `${v.name} (${v.lang})`)));
      sel.addEventListener('change', () => { st.voice = Object.assign({}, st.voice, { [lang]: sel.value }); save(); });
      const rate = h('input', { type: 'range', min: 0.6, max: 1.25, step: 0.05, value: (st.rate || {})[lang] || 0.92, 'aria-label': 'Speed' });
      rate.addEventListener('change', () => { st.rate = Object.assign({}, st.rate, { [lang]: +rate.value }); save(); });
      voiceCard.appendChild(h('div.card.soft.col', h('strong', label), sel, h('div', h('label.field.small', tr('Speed', 'Tempo')), rate), h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: () => SP.say(sample, { lang }) }, tr('Test', 'Test')), list.length ? null : h('span.small.muted', tr('No voice for this language found on this device.', 'Brak głosu dla tego języka na tym urządzeniu.')))));
    });
    const auto = h('input', { type: 'checkbox', checked: st.autoRead ? true : null });
    auto.addEventListener('change', () => { st.autoRead = auto.checked; save(); });
    voiceCard.appendChild(h('label.check', auto, tr('Read lessons and questions aloud automatically', 'Automatycznie czytaj lekcje i pytania')));
    c.appendChild(voiceCard);
    // pace
    const pace = h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Daily time and subjects', 'Czas dzienny i przedmioty')));
    ['au', 'pl'].forEach((prog) => {
      const sel = h('select', { 'aria-label': 'Minutes ' + prog }, [15, 20, 30, 45, 60, 90].map((m) => h('option', { value: m, selected: +st.minutes[prog] === m ? true : null }, `${m} min${m >= 45 ? tr(' (catch-up pace)', ' (nadrabianie)') : ''}`)));
      sel.addEventListener('change', () => { st.minutes = Object.assign({}, st.minutes, { [prog]: +sel.value }); save(); if (S.activeProfile()) T.planToday(prog, true); });
      const en = h('input', { type: 'checkbox', checked: (st.enrichment || {})[prog] !== false ? true : null });
      en.addEventListener('change', () => { st.enrichment = Object.assign({}, st.enrichment, { [prog]: en.checked }); save(); if (S.activeProfile()) T.planToday(prog, true); });
      pace.appendChild(h('div.card.soft.col', h('strong', LA.PROGRAMMES[prog].flag + ' ' + LA.PROGRAMMES[prog].name), sel,
        h('label.check', en, prog === 'au' ? tr('Include Health, The Arts and Technologies (about once a week each)', 'Uwzględnij Health, The Arts i Technologies (ok. raz w tygodniu)') : tr('Include Plastyka/muzyka and Technika/informatyka (about once a week)', 'Uwzględnij plastykę/muzykę i technikę/informatykę (ok. raz w tygodniu)'))));
    });
    const tgt = h('div.card.soft.col', h('strong', tr('Catch-up: finish the year by a date', 'Nadrabianie: ukończ klasę do daty')),
      h('p.small.muted', tr('The daily plan then schedules exactly enough lessons to finish every subject in time, and offers quick test-outs for topics she already knows from school. Leave empty for the normal school-year pace.', 'Plan dnia ułoży wtedy tyle lekcji, by zdążyć ze wszystkimi przedmiotami, i zaproponuje szybkie testy z tematów znanych ze szkoły. Puste = zwykłe tempo roku szkolnego.')));
    ['au', 'pl'].forEach((prog) => {
      const inp = h('input', { type: 'date', value: (st.target || {})[prog] || '', 'aria-label': 'Target ' + prog, style: { maxWidth: '220px' } });
      const out = h('span.small.muted');
      const info = () => { const cu = S.activeProfile() ? T.catchUp(prog) : null; out.textContent = cu ? tr(`${cu.left} lessons left · ${cu.days} study days → ${cu.perDay} a day (≈${cu.minutes} min)`, `zostało ${cu.left} lekcji · ${cu.days} dni → ${cu.perDay} dziennie (≈${cu.minutes} min)`) : ''; };
      inp.addEventListener('change', () => { st.target = Object.assign({}, st.target, { [prog]: inp.value }); save(); if (S.activeProfile()) T.planToday(prog, true); info(); });
      info();
      tgt.appendChild(h('div.row', h('span', { style: { minWidth: '150px' } }, LA.PROGRAMMES[prog].flag + ' ' + LA.PROGRAMMES[prog].short), inp, h('button.btn.ghost.small', { type: 'button', onclick: () => { inp.value = ''; inp.dispatchEvent(new Event('change')); } }, tr('Clear', 'Wyczyść')), out));
    });
    const days = h('div.seg', [['all', tr('Every day', 'Codziennie')], ['mon-sat', tr('Mon–Sat', 'Pon–sob')], ['weekdays', tr('Weekdays', 'Dni robocze')]].map(([v, l]) => { const bb = h('button' + ((st.studyDays || 'all') === v ? '.on' : ''), { type: 'button' }, l); bb.addEventListener('click', () => { st.studyDays = v; save(); ['au', 'pl'].forEach((pp) => { if (S.activeProfile()) T.planToday(pp, true); }); LA.refresh(); }); return bb; }));
    tgt.appendChild(h('div', h('label.field', tr('Study days', 'Dni nauki')), days));
    pace.appendChild(tgt);
    pace.appendChild(h('p.small.muted', tr('English/Polish and Maths come every day; Science and HASS/Historia alternate; enrichment subjects come about once a week. PE is not included (it is done at school).', 'Język i matematyka są codziennie; przyroda i historia na zmianę; przedmioty dodatkowe ok. raz w tygodniu. WF nie jest uwzględniony (jest w szkole).')));
    c.appendChild(pace);
    // pencil & display
    const pen = h('input', { type: 'checkbox', checked: st.pencilFirst ? true : null });
    pen.addEventListener('change', () => { st.pencilFirst = pen.checked; save(); });
    const micSp = h('input', { type: 'checkbox', checked: st.micForSpelling ? true : null });
    micSp.addEventListener('change', () => { st.micForSpelling = micSp.checked; save(); });
    const theme = h('div.seg', [['light', tr('Light', 'Jasny')], ['dark', tr('Dark', 'Ciemny')]].map(([v, l]) => { const b = h('button' + ((st.theme === 'dark' ? 'dark' : 'light') === v ? '.on' : ''), { type: 'button' }, l); b.addEventListener('click', () => { st.theme = v; save(); LA.refresh(); }); return b; }));
    const big = h('input', { type: 'checkbox', checked: st.bigText ? true : null });
    big.addEventListener('change', () => { st.bigText = big.checked; save(); LA.refresh(); });
    const sp = h('input', { type: 'checkbox', checked: st.spacing ? true : null });
    sp.addEventListener('change', () => { st.spacing = sp.checked; save(); LA.refresh(); });
    const hwCount = h('span.small.muted');
    LA.hand.sampleCount().then((n) => (hwCount.textContent = tr(`${n} handwriting samples learnt`, `${n} zapamiętanych próbek pisma`)));
    c.appendChild(h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Pencil, voice and display', 'Rysik, głos i wygląd')),
      h('label.check', pen, tr('Open the handwriting pad first for typed answers', 'Najpierw otwieraj pole do pisania rysikiem')),
      h('label.check', micSp, tr('Allow the microphone for spelling and English/Polish written answers (off by default — speech recognition spells the word for her)', 'Zezwól na mikrofon przy ortografii i odpowiedziach pisemnych z języka (domyślnie wyłączone — rozpoznawanie mowy samo literuje wyraz)')),
      h('div.row', hwCount, h('button.btn.ghost.small', { type: 'button', onclick: () => UI.confirm(tr('Forget handwriting samples?', 'Usunąć próbki pisma?'), tr('The tutor will start learning her handwriting again from scratch.', 'Asystent zacznie uczyć się pisma od nowa.'), () => { LA.hand.clearSamples(); LA.refresh(); }) }, tr('Reset', 'Wyczyść'))),
      h('div', h('label.field', tr('Theme', 'Motyw')), theme), h('label.check', big, tr('Larger text', 'Większy tekst')), h('label.check', sp, tr('Extra letter spacing (helps some readers)', 'Większe odstępy między literami'))));
    // PIN
    const pin = h('input', { type: 'password', inputmode: 'numeric', placeholder: tr('Leave blank for no PIN', 'Puste = bez PIN-u'), value: st.pin || '', maxlength: 8, 'aria-label': 'PIN' });
    pin.addEventListener('change', () => { st.pin = pin.value.trim(); save(); });
    c.appendChild(h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Parent PIN', 'PIN rodzica')), pin, h('div.hint', tr('Stops the child changing settings or seeing reports.', 'Chroni ustawienia i raporty przed dzieckiem.')), saved));
  }

  /* ---------- learners ---------- */
  function learners(c) {
    S.profiles().forEach((p) => {
      const name = h('input', { type: 'text', value: p.name, 'aria-label': 'Name' });
      const row = (id) => {
        const P = LA.PROGRAMMES[id];
        const on = h('input', { type: 'checkbox', checked: p[id].on ? true : null });
        const yr = h('select', { 'aria-label': P.name }, [3, 4].map((y) => h('option', { value: y, selected: p[id].year === y ? true : null }, P.yearLabel(y))));
        return { el: h('div.prog-card', h('span.flag', P.flag), h('div', { style: { flex: 1 } }, h('strong', P.name)), yr, h('label.check', on, tr('On', 'Wł.'))), get: () => ({ on: on.checked, year: +yr.value }) };
      };
      const au = row('au'), pl = row('pl');
      c.appendChild(h('div.card.col', { style: { marginBottom: '14px' } },
        h('div.row', h('span', { style: { fontSize: '2em' } }, p.avatar), h('strong', p.name), S.state().active === p.id ? h('span.tag.good', tr('Active', 'Aktywny')) : null),
        name, au.el, pl.el,
        h('p.small.muted', tr('Changing the grade switches to that grade’s workbook. Progress in each grade is kept.', 'Zmiana klasy przełącza na jej zeszyt. Postępy w każdej klasie są zachowane.')),
        h('div.row',
          h('button.btn.small', { type: 'button', onclick: () => { const a = au.get(), b = pl.get(); if (!a.on && !b.on) { UI.toast(tr('Keep at least one programme on.', 'Zostaw włączony co najmniej jeden program.')); return; } S.updateProfile(p.id, { name: name.value.trim() || p.name, au: a, pl: b }); UI.toast(tr('Saved ✓', 'Zapisano ✓')); LA.refresh(); } }, tr('Save', 'Zapisz')),
          h('button.btn.small.secondary', { type: 'button', onclick: () => { S.setActive(p.id); if (LA.cloud.rewatch) LA.cloud.rewatch(); LA.go('home'); } }, tr('Switch to', 'Przełącz')),
          h('button.btn.small.ghost', { type: 'button', onclick: () => UI.confirm(tr('Delete ', 'Usunąć ') + p.name + '?', tr('All of their progress will be deleted.', 'Wszystkie postępy zostaną usunięte.'), () => { S.state().deleted = (S.state().deleted || []).concat(p.id); S.deleteProfile(p.id); LA.refresh(); }, tr('Delete', 'Usuń')) }, tr('Delete', 'Usuń')))));
    });
    c.appendChild(h('button.btn', { type: 'button', onclick: () => { S.state().active = null; LA.go('welcome'); } }, tr('+ Add a learner', '+ Dodaj ucznia')));
  }

  /* ---------- cloud & backup ---------- */
  function data(c) {
    const cloud = LA.cloud;
    const msg = h('div.small');
    const card = (...kids) => h('div.card.col', { style: { marginTop: '16px' } }, ...kids);
    // 1. account
    const acct = card(h('div.row', LA.appIcon('cloud', '#007aff', 40), h('h2', { style: { margin: 0 } }, tr('Family cloud account', 'Rodzinne konto w chmurze'))));
    if (!cloud.configured()) {
      const ta = h('textarea', { placeholder: '{ "apiKey": "…", "authDomain": "…", "projectId": "…", "appId": "…" }', style: { minHeight: '120px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }, 'aria-label': 'Firebase config' });
      acct.append(h('p', tr('Cloud sync is not set up yet. Work is saved on this device (with automatic daily snapshots). To log in from the iPad and the computer, create a free Firebase project and paste its web config here — the step-by-step guide is in SETUP.md (about 10 minutes, once).', 'Synchronizacja nie jest jeszcze ustawiona. Praca zapisuje się na tym urządzeniu (z codziennymi kopiami). Aby logować się z iPada i komputera, załóż darmowy projekt Firebase i wklej tu jego konfigurację — instrukcja krok po kroku jest w SETUP.md (ok. 10 minut, jednorazowo).')),
        ta, h('div.row', h('button.btn', { type: 'button', onclick: () => {
          const raw = ta.value.trim();
          try {
            const m = raw.match(/\{[\s\S]*\}/);
            if (!m) throw new Error('no object');
            const obj = Function('"use strict";return (' + m[0] + ')')();
            if (!obj.apiKey || !obj.projectId) throw new Error('missing');
            cloud.setConfig(obj); location.reload();
          } catch (e) { UI.toast(tr('That doesn’t look like a Firebase config — paste the whole firebaseConfig = { … } block.', 'To nie wygląda na konfigurację Firebase — wklej cały blok firebaseConfig = { … }.'), 4500); }
        } }, tr('Connect', 'Połącz'))));
    } else if (!cloud.user) {
      const email = h('input', { type: 'email', placeholder: 'family@example.com', autocomplete: 'username', 'aria-label': 'Email' });
      const pw = h('input', { type: 'password', placeholder: tr('Password (6+ characters)', 'Hasło (min. 6 znaków)'), autocomplete: 'current-password', 'aria-label': 'Password' });
      const out = h('div.small');
      const run = async (fn, okMsg) => { out.textContent = tr('Working…', 'Chwileczkę…'); try { await fn(); out.textContent = okMsg || ''; setTimeout(() => LA.refresh(), 400); } catch (e) { out.textContent = e.message; } };
      acct.append(h('p', tr('Sign in with the same family email on every device (iPad, computer). Progress from all devices is merged — nothing is overwritten.', 'Zaloguj się tym samym rodzinnym e-mailem na każdym urządzeniu. Postępy ze wszystkich urządzeń są łączone — nic nie zostaje nadpisane.')),
        cloud.ready() ? null : h('p.small.muted', cloud.detail),
        h('div', h('label.field', 'Email'), email), h('div', h('label.field', tr('Password', 'Hasło')), pw),
        h('div.row', h('button.btn', { type: 'button', onclick: () => run(() => cloud.signIn(email.value, pw.value)) }, tr('Sign in', 'Zaloguj')),
          h('button.btn.secondary', { type: 'button', onclick: () => run(() => cloud.signUp(email.value, pw.value)) }, tr('Create family account', 'Załóż konto rodzinne')),
          h('button.btn.ghost', { type: 'button', onclick: () => run(() => cloud.resetPassword(email.value), tr('Password reset email sent.', 'Wysłano e-mail do zmiany hasła.')) }, tr('Forgot password', 'Nie pamiętam hasła'))), out);
    } else {
      acct.append(h('div.list-row', { style: { padding: '6px 0' } }, h('span.sync.' + cloud.status, { style: { padding: 0, margin: 0 } }, h('span.led')), h('div', { style: { flex: 1 } }, h('strong', cloud.user.email), h('div.small.muted', cloud.detail || tr('Signed in. Every change uploads within a few seconds.', 'Zalogowano. Każda zmiana wysyła się w kilka sekund.')))),
        h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: async () => { await cloud.backupNow(); S.saveNow(); UI.toast(tr('Synced and backed up', 'Zsynchronizowano i zapisano kopię')); LA.refresh(); } }, LA.icon('refresh', 18), tr('Sync and back up now', 'Synchronizuj i zrób kopię')),
          h('button.btn.ghost.small', { type: 'button', onclick: () => UI.confirm(tr('Sign out of this device?', 'Wylogować to urządzenie?'), tr('Work stays saved on this device and in the cloud.', 'Praca zostaje na urządzeniu i w chmurze.'), async () => { await cloud.signOut(); LA.refresh(); }, tr('Sign out', 'Wyloguj')) }, tr('Sign out', 'Wyloguj'))));
    }
    c.appendChild(acct);

    // 2. how work is protected
    c.appendChild(card(h('h2', tr('How work is protected', 'Jak chroniona jest praca')),
      h('div.list', [
        ['checkCircle', '#34c759', tr('Saved instantly on this device', 'Zapis od razu na urządzeniu'), tr('Every answer is stored immediately, and mirrored in a second on-device database.', 'Każda odpowiedź zapisuje się od razu i ma kopię w drugiej bazie na urządzeniu.')],
        ['repeat', '#007aff', tr('Daily snapshots on this device', 'Codzienne kopie na urządzeniu'), tr('One per day for 30 days, plus one before every sync or restore.', 'Jedna dziennie przez 30 dni oraz przed każdą synchronizacją lub przywróceniem.')],
        ['cloudCheck', '#5856d6', tr('Cloud sync + dated cloud backups', 'Chmura + codzienne kopie w chmurze'), tr('When signed in: live sync between devices and a dated copy every day, kept for 60 days.', 'Po zalogowaniu: synchronizacja między urządzeniami i kopia każdego dnia, przechowywana 60 dni.')],
        ['download', '#ff9500', tr('Backup files you keep', 'Pliki kopii u ciebie'), tr('Save a file to Files/iCloud Drive any time (a reminder appears each month).', 'Zapisz plik w Plikach/iCloud Drive w dowolnej chwili (przypomnienie co miesiąc).')],
      ].map(([ic, col, t, d]) => h('div.list-row', LA.appIcon(ic, col, 34), h('div', h('strong', t), h('div.small.muted', d)))))));

    // 3. restore points
    const snapBox = h('div.col', h('div.small.muted', tr('Loading…', 'Wczytywanie…')));
    const fmtWhen = (t) => new Date(t).toLocaleString(LA.lang() === 'pl' ? 'pl-PL' : 'en-AU', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const reasonTxt = (r) => ({ daily: tr('Daily', 'Dzienna'), 'before-sync': tr('Before sync', 'Przed synchronizacją'), 'before-restore': tr('Before restore', 'Przed przywróceniem'), 'before-import': tr('Before import', 'Przed importem'), manual: tr('Manual', 'Ręczna') }[r] || r);
    (async () => {
      const list = LA.backup ? await LA.backup.list() : [];
      snapBox.innerHTML = '';
      if (!list.length) snapBox.appendChild(h('div.small.muted', tr('No snapshots yet — the first one is made today.', 'Brak kopii — pierwsza powstanie dziś.')));
      list.slice(0, 12).forEach((sn) => snapBox.appendChild(h('div.list-row', { style: { padding: '10px 0' } }, h('div', { style: { flex: 1 } }, h('strong', fmtWhen(sn.at)), h('div.small.muted', reasonTxt(sn.reason) + ' · ' + Math.round(sn.size / 1024) + ' KB')),
        h('button.btn.secondary.small', { type: 'button', onclick: () => UI.confirm(tr('Bring back this snapshot?', 'Przywrócić tę kopię?'), tr('It is merged with the current work — anything finished since then is kept.', 'Zostanie połączona z obecną pracą — to, co zrobiono później, zostaje.'), async () => { await LA.backup.restore(sn.id); UI.toast(tr('Snapshot merged back in', 'Kopia przywrócona')); LA.refresh(); }, tr('Restore', 'Przywróć')) }, tr('Restore', 'Przywróć')))));
      if (cloud.available()) {
        const days = await cloud.listBackups().catch(() => []);
        if (days.length) {
          snapBox.appendChild(h('h3', { style: { marginTop: '14px' } }, tr('Cloud backups', 'Kopie w chmurze')));
          days.slice(0, 14).forEach((d) => snapBox.appendChild(h('div.list-row', { style: { padding: '10px 0' } }, h('div', { style: { flex: 1 } }, h('strong', d), h('div.small.muted', tr('Daily cloud copy', 'Dzienna kopia w chmurze'))),
            h('button.btn.secondary.small', { type: 'button', onclick: () => UI.confirm(tr('Bring back the copy from ', 'Przywrócić kopię z ') + d + '?', tr('It is merged with the current work — nothing current is lost.', 'Zostanie połączona z obecną pracą — nic nie zginie.'), async () => { await cloud.restoreBackup(d); UI.toast(tr('Cloud copy merged back in', 'Przywrócono kopię z chmury')); LA.refresh(); }, tr('Restore', 'Przywróć')) }, tr('Restore', 'Przywróć')))));
        }
      }
    })();
    c.appendChild(card(h('h2', tr('Restore points', 'Punkty przywracania')), h('p.small.muted', tr('Restoring never deletes newer work: it merges the old copy back in.', 'Przywracanie nie usuwa nowszej pracy: stara kopia jest dołączana.')), snapBox));

    // 4. files
    const file = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Backup file' });
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = async () => { try { if (LA.backup) await LA.backup.snapshot('before-import'); S.importJSON(rd.result); msg.textContent = tr('Backup file merged in.', 'Plik kopii został dołączony.'); } catch (e) { msg.textContent = '' + e.message; } };
      rd.readAsText(f);
    });
    const exportBtn = h('button.btn', { type: 'button' }, LA.icon('download', 20), tr('Save a backup file', 'Zapisz plik kopii'));
    exportBtn.addEventListener('click', async () => {
      const name = 'workbook-backup-' + U.todayKey() + '.json';
      const json = S.exportJSON();
      try {
        const blob = new Blob([json], { type: 'application/json' });
        const f = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: name }); }
        else { const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.appendChild(a); a.click(); a.remove(); }
        S.setSetting('lastExport', Date.now());
        msg.textContent = tr('Backup file ready — keep it in Files or iCloud Drive.', 'Plik gotowy — zachowaj go w Plikach lub iCloud Drive.');
      } catch (e) { if (e && e.name !== 'AbortError') msg.textContent = '' + e.message; }
    });
    const last = S.settings().lastExport;
    c.appendChild(card(h('h2', tr('Backup files', 'Pliki kopii')), h('p.small.muted', (last ? tr('Last saved: ', 'Ostatnio: ') + new Date(last).toLocaleDateString() + '. ' : '') + tr('On iPad, choose “Save to Files”. Opening a file here merges it in (the API key is never included).', 'Na iPadzie wybierz „Zachowaj w Plikach”. Wczytanie pliku dołącza go (bez klucza API).')), h('div.row', exportBtn), h('div', h('label.field', tr('Merge in a backup file', 'Dołącz plik kopii')), file), msg));

    // 5. danger
    c.appendChild(card(h('h2', tr('Start over', 'Zacznij od nowa')), h('p.small.muted', tr('Deletes all learners and progress here and in the cloud. A snapshot is kept on this device first, just in case.', 'Usuwa uczniów i postępy tu i w chmurze. Wcześniej zostaje kopia na urządzeniu, na wszelki wypadek.')),
      h('button.btn.secondary.danger', { type: 'button', onclick: () => UI.confirm(tr('Delete everything?', 'Usunąć wszystko?'), tr('This removes all learners and progress. Type nothing — just confirm.', 'To usunie wszystkich uczniów i postępy.'), async () => { if (LA.backup) await LA.backup.snapshot('before-delete'); S.state().deleted = (S.state().deleted || []).concat(S.profiles().map((p) => p.id)); S.state().profiles = []; S.state().progress = {}; S.state().active = null; S.saveMain(); S.saveNow(); unlocked = false; LA.go('welcome'); }, tr('Delete everything', 'Usuń wszystko')) }, tr('Delete all data', 'Usuń wszystkie dane'))));
  }
})();

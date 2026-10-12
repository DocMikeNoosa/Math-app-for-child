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
      c.appendChild(h('div.card.col', { style: { maxWidth: '420px', margin: '40px auto' } }, h('h1', tr('👪 Grown-ups only', '👪 Tylko dla dorosłych')), h('p', tr('Enter the parent PIN.', 'Wpisz PIN rodzica.')), inp, msg, h('button.btn', { type: 'button', onclick: go }, tr('Unlock', 'Odblokuj'))));
      setTimeout(() => inp.focus(), 30);
      return;
    }
    const tabs = [['overview', tr('Progress', 'Postępy')], ['assign', tr('Extra tutor work', 'Dodatkowa praca')], ['settings', tr('Settings', 'Ustawienia')], ['learners', tr('Learners', 'Uczniowie')], ['data', tr('Backup', 'Kopia')]];
    const seg = h('div.seg', tabs.map(([k, l]) => h('button' + (k === tab ? '.on' : ''), { type: 'button', onclick: () => LA.go('parent/' + k, null, { replace: true }) }, l)));
    c.append(h('div.row', h('h1', { style: { margin: 0 } }, tr('👪 Parent portal', '👪 Panel rodzica')), h('span.spacer'), h('div.seg', [['en', 'EN'], ['pl', 'PL']].map(([k, l]) => h('button' + ((st.parentLang || 'en') === k ? '.on' : ''), { type: 'button', onclick: () => { S.setSetting('parentLang', k); LA.refresh(); } }, l)))),
      h('div', { style: { margin: '14px 0 18px' } }, seg));
    const p = S.activeProfile();
    if (!p && tab !== 'learners' && tab !== 'settings' && tab !== 'data') { c.appendChild(h('div.card', h('p', tr('Add a learner first.', 'Najpierw dodaj ucznia.')), h('button.btn', { type: 'button', onclick: () => LA.go('welcome') }, tr('Add learner', 'Dodaj ucznia')))); return; }
    if (tab === 'assign') return assign(c);
    if (tab === 'settings') return settings(c);
    if (tab === 'learners') return learners(c);
    if (tab === 'data') return data(c);
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
      if (AI.available()) adv.appendChild(h('button.btn.secondary', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Teacher’s assessment', 'Ocena nauczyciela'), (on) => AI.parentAdvice(summaryFor(prog), on), { prog })) }, tr('✨ Ask the AI teacher: below, on or above par — and how to improve', '✨ Zapytaj AI: poniżej, na czy powyżej poziomu — i jak poprawić')));
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
    const aiStatus = AI.mode === 'claude' ? tr('Using Claude through your claude.ai account (no key needed).', 'Korzysta z Claude przez twoje konto claude.ai (bez klucza).') : AI.mode === 'apikey' ? tr('Using your Anthropic API key.', 'Korzysta z twojego klucza API Anthropic.') : tr('Not available yet. Open the app from claude.ai, or add an API key below.', 'Jeszcze niedostępny. Otwórz aplikację z claude.ai albo dodaj poniżej klucz API.');
    const aiOn = h('input', { type: 'checkbox', checked: st.aiEnabled !== false ? true : null });
    aiOn.addEventListener('change', () => { st.aiEnabled = aiOn.checked; save(); });
    const key = h('input', { type: 'password', placeholder: 'sk-ant-…', value: st.apiKey || '', autocomplete: 'off', 'aria-label': 'API key' });
    key.addEventListener('change', () => { st.apiKey = key.value.trim(); save(); });
    const model = h('select', { 'aria-label': 'Model' }, [['claude-opus-5-5', 'Claude Opus 5.5 (best)'], ['claude-sonnet-5-5', 'Claude Sonnet 5.5 (faster, lower cost)'], ['claude-haiku-5-5', 'Claude Haiku 5.5 (fastest, lowest cost)']].map(([v, l]) => h('option', { value: v, selected: st.model === v ? true : null }, l)));
    model.addEventListener('change', () => { st.model = model.value; save(); });
    const test = h('div.small');
    c.appendChild(h('div.card.col', h('h2', tr('AI tutor', 'Asystent AI')), h('p.small', aiStatus), h('label.check', aiOn, tr('AI features on', 'Funkcje AI włączone')),
      window.claude ? null : h('div.col', h('div', h('label.field', tr('Anthropic API key (only when not using claude.ai)', 'Klucz API Anthropic (tylko poza claude.ai)')), key, h('div.hint', tr('Stored only in this browser and sent only to api.anthropic.com. Billed to your Anthropic account.', 'Przechowywany tylko w tej przeglądarce i wysyłany wyłącznie do api.anthropic.com.'))), h('div', h('label.field', 'Model'), model)),
      h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: () => { test.textContent = tr('Testing…', 'Testuję…'); AI.call([{ role: 'user', content: 'Say a one-sentence hello to a Year 3 student.' }], { tier: 'quick', prog: 'au' }).then((t) => (test.textContent = '✓ ' + t)).catch((e) => (test.textContent = '⚠️ ' + e.message)); } }, tr('Test the AI', 'Testuj AI')), test)));
    // voices
    const voiceCard = h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Read-aloud voices', 'Głosy lektora')),
      h('p.small.muted', tr('Uses the iPad’s own voices (works offline). For the most natural voices: Settings → Accessibility → Spoken Content → Voices → English (Australia) → Karen (Enhanced) and Polish → Zosia (Enhanced).', 'Korzysta z głosów iPada (działa offline). Najbardziej naturalne: Ustawienia → Dostępność → Mowa → Głosy → angielski (Australia) → Karen (rozszerzony) oraz polski → Zosia (rozszerzony).')));
    [['en-AU', tr('Australian section (Koa)', 'Sekcja australijska (Koa)'), "G'day! I'm Koa. Let's learn together today."], ['pl-PL', tr('Polish section (Sowa Zosia)', 'Sekcja polska (Sowa Zosia)'), 'Cześć! Jestem Sowa Zosia. Uczmy się razem!']].forEach(([lang, label, sample]) => {
      const list = SP.voicesFor(lang);
      const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, tr('Automatic: ', 'Automatycznie: ') + (SP.voiceName(lang) || tr('device default', 'domyślny'))), list.map((v) => h('option', { value: v.voiceURI, selected: (st.voice || {})[lang] === v.voiceURI ? true : null }, `${v.name} (${v.lang})`)));
      sel.addEventListener('change', () => { st.voice = Object.assign({}, st.voice, { [lang]: sel.value }); save(); });
      const rate = h('input', { type: 'range', min: 0.6, max: 1.25, step: 0.05, value: (st.rate || {})[lang] || 0.92, 'aria-label': 'Speed' });
      rate.addEventListener('change', () => { st.rate = Object.assign({}, st.rate, { [lang]: +rate.value }); save(); });
      voiceCard.appendChild(h('div.card.soft.col', h('strong', label), sel, h('div', h('label.field.small', tr('Speed', 'Tempo')), rate), h('div.row', h('button.btn.secondary.small', { type: 'button', onclick: () => SP.say(sample, { lang }) }, tr('▶ Test', '▶ Test')), list.length ? null : h('span.small.muted', tr('No voice for this language found on this device.', 'Brak głosu dla tego języka na tym urządzeniu.')))));
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
    pace.appendChild(h('p.small.muted', tr('English/Polish and Maths come every day; Science and HASS/Historia alternate; enrichment subjects come about once a week. PE is not included (it is done at school).', 'Język i matematyka są codziennie; przyroda i historia na zmianę; przedmioty dodatkowe ok. raz w tygodniu. WF nie jest uwzględniony (jest w szkole).')));
    c.appendChild(pace);
    // pencil & display
    const pen = h('input', { type: 'checkbox', checked: st.pencilFirst ? true : null });
    pen.addEventListener('change', () => { st.pencilFirst = pen.checked; save(); });
    const theme = h('div.seg', [['dark', tr('Dark', 'Ciemny')], ['light', tr('Light', 'Jasny')], ['auto', tr('Match iPad', 'Jak iPad')]].map(([v, l]) => { const b = h('button' + ((st.theme || 'dark') === v ? '.on' : ''), { type: 'button' }, l); b.addEventListener('click', () => { st.theme = v; save(); LA.refresh(); }); return b; }));
    const big = h('input', { type: 'checkbox', checked: st.bigText ? true : null });
    big.addEventListener('change', () => { st.bigText = big.checked; save(); LA.refresh(); });
    const sp = h('input', { type: 'checkbox', checked: st.spacing ? true : null });
    sp.addEventListener('change', () => { st.spacing = sp.checked; save(); LA.refresh(); });
    const hwCount = h('span.small.muted');
    LA.hand.sampleCount().then((n) => (hwCount.textContent = tr(`${n} handwriting samples learnt`, `${n} zapamiętanych próbek pisma`)));
    c.appendChild(h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Apple Pencil and display', 'Apple Pencil i wygląd')),
      h('label.check', pen, tr('Open the handwriting pad first for typed answers', 'Najpierw otwieraj pole do pisania rysikiem')),
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

  /* ---------- backup ---------- */
  function data(c) {
    const msg = h('div.small');
    const file = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Backup file' });
    file.addEventListener('change', () => {
      const f = file.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { S.importJSON(r.result); msg.textContent = tr('✓ Backup restored.', '✓ Przywrócono kopię.'); } catch (e) { msg.textContent = '⚠️ ' + e.message; } };
      r.readAsText(f);
    });
    const exportBtn = h('button.btn', { type: 'button' }, tr('⬇ Save a backup file', '⬇ Zapisz kopię'));
    exportBtn.addEventListener('click', async () => {
      const name = 'learning-workbook-backup-' + U.todayKey() + '.json';
      const json = S.exportJSON();
      try {
        const dl = window.claude ? await window.claude.use('downloads') : null;
        if (dl) { await dl.save({ filename: name, data: json }); msg.textContent = tr('✓ Saved.', '✓ Zapisano.'); return; }
      } catch (e) { if (e && e.code === 'declined') return; }
      try {
        const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: name });
        document.body.appendChild(a); a.click(); a.remove();
      } catch (e) { msg.textContent = '⚠️ ' + e.message; }
    });
    const cloud = LA.cloud;
    c.append(
      h('div.card.col', h('h2', tr('Cloud saving', 'Zapis w chmurze')),
        h('p', cloud.available() ? tr('✓ Progress is being saved to your private claude.ai space. Sign in with the same claude.ai account on another iPad or computer and open this app to continue there.', '✓ Postęp zapisuje się w prywatnej przestrzeni claude.ai. Zaloguj się na to samo konto na innym urządzeniu i otwórz aplikację, aby kontynuować.') : tr('Progress is saved in this browser. To back up to the cloud and use several devices, open the app from its claude.ai link while signed in.', 'Postęp zapisuje się w tej przeglądarce. Aby mieć kopię w chmurze i wiele urządzeń, otwórz aplikację z linku claude.ai po zalogowaniu.')),
        h('div.small.muted', cloud.detail || '')),
      h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Backup file', 'Plik kopii')), h('p.small.muted', tr('An extra copy you keep yourself (the API key is not included).', 'Dodatkowa kopia u ciebie (bez klucza API).')), exportBtn, h('div', h('label.field', tr('Restore from a backup file', 'Przywróć z pliku')), file), msg),
      h('div.card.col', { style: { marginTop: '14px' } }, h('h2', tr('Start over', 'Zacznij od nowa')), h('p.small.muted', tr('Deletes all learners and progress on this device (the cloud copy updates too).', 'Usuwa wszystkich uczniów i postępy (także w chmurze).')),
        h('button.btn.secondary', { type: 'button', onclick: () => UI.confirm(tr('Delete everything?', 'Usunąć wszystko?'), tr('This removes all learners and progress.', 'To usunie wszystkich uczniów i postępy.'), () => { S.state().deleted = (S.state().deleted || []).concat(S.profiles().map((p) => p.id)); S.state().profiles = []; S.state().progress = {}; S.state().active = null; S.saveMain(); S.saveNow(); unlocked = false; LA.go('welcome'); }, tr('Delete everything', 'Usuń wszystko')) }, tr('Delete all data', 'Usuń wszystkie dane'))));
  }
})();

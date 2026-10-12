/* Reusable UI: DOM helper, read-aloud buttons, modal, toast, confetti, rings, AI boxes,
   the question runner (typing, choices, Apple Pencil, dictation, spelling checks) and the tutor chat. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const SP = LA.speech;
  const AI = LA.ai;
  const UI = (LA.ui = {});
  const tr = (en, pl) => LA.tr(en, pl);

  UI.h = function (sel, attrs, ...kids) {
    const m = sel.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement((m && m[1]) || 'div');
    if (m && m[2]) m[2].replace(/([.#])([\w-]+)/g, (_, t, v) => { if (t === '.') el.classList.add(v); else el.id = v; });
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') { for (const sk in v) { if (sk.startsWith('--')) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (k) => { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(add); else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); };
    kids.forEach(add);
    return el;
  };
  const h = UI.h;

  UI.speakBtn = (getText, label, lang) => {
    const b = h('button.speak', { type: 'button', title: tr('Read this out loud', 'Przeczytaj na głos'), 'aria-label': tr('Read aloud', 'Przeczytaj') }, h('span.wave', '🔊'), label === '' ? null : (label || tr('Read to me', 'Przeczytaj mi')));
    b.addEventListener('click', (e) => { e.stopPropagation(); SP.toggle(b, typeof getText === 'function' ? getText() : getText, lang); });
    if (!SP.available()) b.disabled = true;
    return b;
  };

  UI.modal = (title, body, actions) => {
    const back = h('div.modal-back');
    const close = () => back.remove();
    const box = h('div.modal', { role: 'dialog', 'aria-modal': 'true' }, h('h2', title), body,
      h('div.row.end', { style: { marginTop: '18px' } }, (actions || [{ label: 'OK' }]).map((a) => h('button.btn' + (a.secondary ? '.secondary' : ''), { type: 'button', onclick: () => { if (!a.onclick || a.onclick() !== false) close(); } }, a.label))));
    back.appendChild(box);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    document.body.appendChild(back);
    return { close, box };
  };
  UI.confirm = (title, text, onYes, yesLabel) => UI.modal(title, h('p', text), [{ label: tr('Cancel', 'Anuluj'), secondary: true }, { label: yesLabel || tr('Yes', 'Tak'), onclick: onYes }]);
  UI.toast = (text, ms) => { const t = h('div.toast', { role: 'status' }, text); document.body.appendChild(t); setTimeout(() => t.remove(), ms || 2600); };

  UI.confetti = () => {
    const c = h('div.confetti');
    const colours = ['#ffb547', '#3ccf91', '#5aa9ff', '#a48bff', '#ff8a65', '#2fd0c0'];
    for (let i = 0; i < 70; i++) {
      const p = h('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colours[i % colours.length];
      p.style.animationDelay = Math.random() * 0.7 + 's';
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3400);
  };

  UI.rings = (rings, size) => {
    size = size || 140;
    const stroke = 13, gap = 4;
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="progress rings">`;
    rings.forEach((r, i) => {
      const rad = size / 2 - stroke / 2 - i * (stroke + gap);
      const c = 2 * Math.PI * rad;
      const v = Math.max(0, Math.min(1, r.value || 0));
      svg += `<circle cx="${size / 2}" cy="${size / 2}" r="${rad}" fill="none" stroke="${r.color}" stroke-opacity="0.18" stroke-width="${stroke}"/>`;
      if (v > 0) svg += `<circle cx="${size / 2}" cy="${size / 2}" r="${rad}" fill="none" stroke="${r.color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${Math.max(0.1, c * v).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>`;
    });
    return h('div', { html: svg + '</svg>' });
  };

  UI.aiBox = (title, fn, opts) => {
    opts = opts || {};
    const prog = opts.prog || LA.state.prog;
    const icon = LA.PROGRAMMES[prog].tutorIcon;
    const body = h('div.thinking.muted', tr('Thinking', 'Myślę'));
    const box = h('div.ai-box', h('div.who', icon + ' ' + title), body);
    let full = '';
    fn((t) => { full = t; body.className = ''; body.innerHTML = U.fmt(t); })
      .then((t) => {
        full = typeof t === 'string' ? t : full;
        body.className = '';
        body.innerHTML = U.fmt(full);
        const lang = opts.explainIn === 'pl' ? 'pl-PL' : opts.explainIn === 'en' ? 'en-AU' : LA.PROGRAMMES[prog].voice;
        box.appendChild(h('div.row', { style: { marginTop: '8px' } }, UI.speakBtn(() => U.plain(full), tr('Read it to me', 'Przeczytaj mi'), lang)));
        if (S.settings().autoRead) SP.say(U.plain(full), { lang });
      })
      .catch((err) => { body.className = ''; body.textContent = '⚠️ ' + (err && err.message ? err.message : err); });
    return box;
  };

  UI.otherLangBtn = (makeFn) => {
    const prog = LA.state.prog;
    const other = prog === 'au' ? 'pl' : 'en';
    const b = h('button.btn.secondary.small', { type: 'button' }, prog === 'au' ? '🇵🇱 Wyjaśnij po polsku' : '🇬🇧 Explain in English');
    b.addEventListener('click', () => b.replaceWith(UI.aiBox(prog === 'au' ? 'Po polsku' : 'In English', (on) => makeFn(on, other), { explainIn: other })));
    return b;
  };

  /* ---------- Apple Pencil panel ---------- */
  UI.writePanel = (opts) => {
    opts = opts || {};
    const prog = opts.prog || LA.state.prog;
    const status = h('div.small.muted');
    const pad = LA.hand.createPad({ height: opts.height || 200, onChange: () => { status.textContent = ''; } });
    const readBtn = h('button.btn.small', { type: 'button' }, AI.canSeeImages() ? tr('✓ Read my writing', '✓ Odczytaj moje pismo') : tr('✓ Done', '✓ Gotowe'));
    const panel = h('div.write-panel', pad.el, h('div.pad-tools',
      h('button.btn.secondary.small', { type: 'button', onclick: () => pad.undo() }, tr('↶ Undo', '↶ Cofnij')),
      h('button.btn.secondary.small', { type: 'button', onclick: () => pad.clear() }, tr('Clear', 'Wyczyść')),
      h('span.spacer'), readBtn), status);
    readBtn.addEventListener('click', async () => {
      if (pad.isEmpty()) { status.textContent = tr('Write your answer first.', 'Najpierw napisz odpowiedź.'); return; }
      if (!AI.canSeeImages()) { if (opts.onNoAI) opts.onNoAI(pad); return; }
      readBtn.disabled = true;
      status.innerHTML = '';
      status.appendChild(h('span.thinking', tr('Reading your writing', 'Czytam twoje pismo')));
      try {
        const r = await LA.hand.read(pad, { question: opts.question, prog });
        status.innerHTML = '';
        if (opts.onRead) opts.onRead(r, pad);
      } catch (e) { status.textContent = '⚠️ ' + e.message; }
      readBtn.disabled = false;
    });
    panel.pad = pad;
    return panel;
  };

  UI.confirmReading = (r, onUse) => {
    const inp = h('input', { type: 'text', value: r.text, 'aria-label': tr('What you wrote', 'Co napisałeś/aś') });
    return h('div.feedback.info',
      h('h4', tr('I read: ', 'Odczytałam: ') + '“' + r.text + '”'),
      r.note ? h('div.small', '✍️ ' + r.note) : null,
      h('div.small.muted', tr('Is that what you wrote? Fix it if I got a letter wrong.', 'Czy to właśnie napisałeś/aś? Popraw, jeśli źle odczytałam literę.')),
      h('div.answer-row', { style: { marginTop: '8px' } }, inp,
        h('button.btn.small', { type: 'button', onclick: () => { const v = inp.value.trim(); if (!v) return; LA.hand.addSample(r.dataUrl, v, LA.lang()); onUse(v); } }, tr('Yes, check it', 'Tak, sprawdź'))));
  };

  /* ---------- the question runner ---------- */
  UI.runQuestions = function (container, questions, opts) {
    opts = opts || {};
    const mode = opts.mode || 'practice';
    const instant = ['practice', 'homework', 'review'].includes(mode);
    const prog = LA.state.prog;
    const voice = LA.PROGRAMMES[prog].voice;
    const results = [];
    let i = 0;
    container.innerHTML = '';
    const wrap = h('div.card.q-wrap');
    container.appendChild(wrap);
    if (!questions.length) { wrap.appendChild(h('p', tr('No questions here.', 'Brak pytań.'))); setTimeout(() => opts.onDone && opts.onDone(results), 0); return; }

    function qSpeech(q) {
      if (q.dictation) return q.say + (q.sayContext ? '. ' + q.sayContext + '. ' + q.say : '');
      let t = U.plain(q.q);
      if (q.type === 'mc') t += '. ' + q.options.map((o, k) => `${'ABCDE'[k]}: ${U.plain(o)}`).join('. ');
      return t;
    }
    function finishQuestion(q, given, correct) {
      results.push({ q, given, correct });
      i++;
      if (i < questions.length) show();
      else { SP.stop(); opts.onDone && opts.onDone(results); }
    }

    function show() {
      SP.stop();
      const q = questions[i];
      UI.currentQuestion = q;
      wrap.innerHTML = '';
      const pbar = h('div', { style: { flex: '1' } }, h('div.bar', h('span', { style: { width: (i / questions.length) * 100 + '%', background: 'var(--accent)' } })));
      wrap.appendChild(h('div.q-head', h('span.chip', `${i + 1} / ${questions.length}`), pbar, UI.speakBtn(() => qSpeech(q), '', voice)));
      const tags = h('div.row', { style: { gap: '6px' } });
      if (q.stretch) tags.appendChild(h('span.tag.star', tr('★ Above-par challenge', '★ Zadanie z gwiazdką')));
      if (q.ai) tags.appendChild(h('span.tag.info', tr('Made for you by ', 'Przygotowała dla ciebie ') + LA.PROGRAMMES[prog].tutor));
      if (tags.childNodes.length) wrap.appendChild(tags);
      if (q.listen) {
        const lb = findListen(q, opts.ctx);
        if (lb) wrap.appendChild(h('div.row', { style: { margin: '6px 0' } }, UI.speakBtn(() => U.plain(lb.text), tr('🎧 Play the listening passage', '🎧 Odtwórz nagranie'), voice)));
      }
      if (q.dictation) {
        const play = h('button.big-play', { type: 'button', 'aria-label': tr('Play the word', 'Odtwórz wyraz') }, '▶');
        play.addEventListener('click', () => SP.say(qSpeech(q), { lang: voice, rate: 0.8 }));
        wrap.appendChild(h('div.dictation-play', play, h('div', h('div.display', { style: { fontWeight: 800 } }, tr('Dictation', 'Dyktando')), h('div.small.muted', tr('Press play, listen, then write the word.', 'Naciśnij ▶, posłuchaj i napisz wyraz.')))));
      } else wrap.appendChild(h('div.q-text', { html: U.fmt(q.q) }));
      if (q.svg) wrap.appendChild(h('div.visual', { html: q.svg }));
      const area = h('div');
      wrap.appendChild(area);
      const fb = h('div');
      let tries = 0, firstCorrect = null, firstGiven = null, locked = false;
      const nextBtn = h('button.btn.big', { type: 'button' }, i + 1 < questions.length ? tr('Next →', 'Dalej →') : tr('Finish ✓', 'Koniec ✓'));
      nextBtn.addEventListener('click', () => finishQuestion(q, firstGiven, !!firstCorrect));

      function submit(given) {
        if (locked) return;
        if (q.type === 'input' && !String(given).trim()) return;
        const ok = U.checkAnswer(q, given);
        const slip = !ok ? U.spellingSlip(q, given) : null;
        tries++;
        if (slip && tries === 1) S.recordSpelling(slip, given, q.lang);
        if (q.dictation && !ok && tries === 1 && !slip) S.recordSpelling(q.say, given, q.lang);
        if (q.dictation && tries === 1) S.spellingPracticed(q.say, ok);
        if (tries === 1) { firstCorrect = ok; firstGiven = given; S.recordAnswer(q, given, ok); }
        if (!instant) { locked = true; finishQuestion(q, given, ok); return; }
        fb.innerHTML = '';
        if (q.type === 'mc') area.querySelectorAll('.opt').forEach((b, bi) => { if (bi === Number(given)) b.classList.add(ok ? 'right' : 'wrong'); });
        if (ok) {
          locked = true;
          area.querySelectorAll('button,input,textarea').forEach((b) => (b.disabled = true));
          fb.appendChild(h('div.feedback.good', h('h4', U.pick(tr(['✅ Correct!', '🌟 Great job!', '🎉 Yes! Well done!', '👍 Spot on!'], ['✅ Dobrze!', '🌟 Świetnie!', '🎉 Brawo!', '👍 Doskonale!']))), q.explain && tries > 1 ? h('div', { html: U.fmt(q.explain) }) : null));
          fb.appendChild(h('div.row', { style: { marginTop: '12px' } }, nextBtn));
          setTimeout(() => nextBtn.focus(), 30);
        } else if (tries < 2) {
          const msg = slip ? tr('So close! Check the spelling.', 'Prawie! Sprawdź pisownię.') : tr('Not quite — have another go!', 'Jeszcze nie — spróbuj jeszcze raz!');
          fb.appendChild(h('div.feedback' + (slip ? '.warn' : '.bad'), h('h4', msg), h('div', hint(q, slip))));
          if (AI.available()) fb.appendChild(h('button.btn.secondary.small', { type: 'button', style: { marginTop: '8px' }, onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Hint', 'Podpowiedź'), (on) => AI.hint(q, opts.ctx, on))) }, tr('💡 Ask for a hint', '💡 Poproś o podpowiedź')));
          const inp = area.querySelector('.answer-input');
          if (inp) { inp.select(); inp.focus(); }
        } else {
          locked = true;
          area.querySelectorAll('button,input,textarea').forEach((b) => (b.disabled = true));
          if (q.type === 'mc') area.querySelectorAll('.opt')[q.answer].classList.add('right');
          const correct = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
          fb.appendChild(h('div.feedback.info', h('h4', tr('The answer is: ', 'Poprawna odpowiedź: ') + U.plain(String(correct))), q.explain ? h('div', { html: U.fmt(q.explain) }) : null,
            h('div.row', { style: { marginTop: '8px' } }, UI.speakBtn(() => tr('The answer is ', 'Poprawna odpowiedź to ') + correct + '. ' + U.plain(q.explain || ''), tr('Read the explanation', 'Przeczytaj wyjaśnienie'), voice))));
          if (AI.available()) {
            fb.appendChild(h('div.row', { style: { marginTop: '8px' } },
              h('button.btn.secondary.small', { type: 'button', onclick: (e) => e.target.replaceWith(UI.aiBox(tr('Another way to see it', 'Wytłumaczę inaczej'), (on) => AI.explainMistake(q, firstGiven, opts.ctx, on))) }, tr('Explain it another way', 'Wytłumacz inaczej')),
              UI.otherLangBtn((on, lang) => AI.explainMistake(q, firstGiven, opts.ctx, on, lang))));
          }
          fb.appendChild(h('div.row', { style: { marginTop: '12px' } }, nextBtn));
        }
      }

      if (q.type === 'mc') {
        const box = h('div.opts');
        q.options.forEach((o, k) => {
          const b = h('button.opt', { type: 'button' }, h('span.letter', 'ABCDE'[k]), h('span', { html: U.fmtInline(o) }));
          b.addEventListener('click', () => submit(k));
          box.appendChild(b);
        });
        area.appendChild(box);
        const say = h('input', { type: 'text', placeholder: tr('…or say / type your answer', '…albo powiedz / wpisz odpowiedź'), 'aria-label': tr('Say or type your answer', 'Powiedz lub wpisz odpowiedź'), autocomplete: 'off' });
        const matchSay = () => {
          const v = U.normText(say.value);
          if (!v) return;
          let k = q.options.findIndex((o) => U.normText(U.plain(o)) === v);
          if (k < 0 && /^[a-e]$/.test(v)) k = 'abcde'.indexOf(v);
          if (k < 0) k = q.options.findIndex((o) => { const t = U.normText(U.plain(o)); return t.length > 2 && (v.includes(t) || t.includes(v)); });
          if (k >= 0 && k < q.options.length) submit(k); else UI.toast(tr('I couldn’t match that to a choice — tap one instead.', 'Nie pasuje do żadnej odpowiedzi — dotknij jednej z nich.'));
        };
        say.addEventListener('keydown', (e) => { if (e.key === 'Enter') matchSay(); });
        area.appendChild(h('div.say-row', say, h('button.btn.secondary.small', { type: 'button', onclick: matchSay }, 'OK')));
      } else if (q.type === 'input') {
        const inp = h('input.answer-input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', autocorrect: 'off', placeholder: q.dictation ? tr('Write the word', 'Napisz wyraz') : tr('Your answer', 'Twoja odpowiedź'), 'aria-label': tr('Your answer', 'Twoja odpowiedź') });
        const go = h('button.btn', { type: 'button' }, tr('Check', 'Sprawdź'));
        go.addEventListener('click', () => submit(inp.value));
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(inp.value); });
        const penBtn = h('button.icon-btn', { type: 'button', title: tr('Write with Apple Pencil', 'Pisz rysikiem'), 'aria-label': tr('Write with Apple Pencil', 'Pisz rysikiem') }, '✍️');
        const penArea = h('div', { style: { marginTop: '12px' } });
        penBtn.addEventListener('click', () => {
          if (penArea.childNodes.length) { penArea.innerHTML = ''; return; }
          penArea.appendChild(UI.writePanel({ prog, question: q.dictation ? '(dictation)' : q.q, height: 170,
            onRead: (r) => { const old = penArea.querySelector('.feedback'); if (old) old.remove(); penArea.appendChild(UI.confirmReading(r, (v) => { inp.value = v; submit(v); })); },
            onNoAI: () => UI.toast(tr('Reading handwriting needs the AI tutor. You can also write straight into the answer box with Apple Pencil (Scribble).', 'Odczyt pisma wymaga asystenta AI. Możesz też pisać rysikiem prosto w polu odpowiedzi (Scribble).'), 4500) }));
        });
        area.appendChild(h('div.answer-row', inp, penBtn, go));
        area.appendChild(penArea);
        if (S.settings().pencilFirst) setTimeout(() => penBtn.click(), 50);
        else setTimeout(() => { try { inp.focus({ preventScroll: true }); } catch (e) { inp.focus(); } }, 40);
      } else if (q.type === 'write') area.appendChild(writingTask(q, opts, () => finishQuestion(q, 'written', true)));
      wrap.appendChild(fb);
      if (q.dictation) setTimeout(() => SP.say(qSpeech(q), { lang: voice, rate: 0.8 }), 350);
      else if (S.settings().autoRead) SP.say(qSpeech(q), { lang: voice });
    }

    function hint(q, slip) {
      if (slip) return tr('Look carefully at each letter. Say the word slowly and listen to every sound.', 'Przyjrzyj się każdej literze. Powiedz wyraz powoli i posłuchaj każdej głoski.');
      if (q.hint) return q.hint;
      if (q.type === 'mc') return tr('Read each choice carefully and cross out the ones you know are wrong.', 'Przeczytaj uważnie każdą odpowiedź i skreśl te, które na pewno są złe.');
      if (q.numeric) return tr('Check your working — try drawing it or use the strategy from the lesson.', 'Sprawdź obliczenia — narysuj to albo użyj sposobu z lekcji.');
      return tr('Check your spelling and read the question again.', 'Sprawdź pisownię i przeczytaj pytanie jeszcze raz.');
    }
    show();
  };

  function findListen(q, ctx) {
    const lesson = LA.index.lessons[q.skill] || (ctx && ctx.blocks ? ctx : null);
    return lesson ? (lesson.blocks || []).find((b) => b.type === 'listen') : null;
  }

  function writingTask(q, opts, onFinish) {
    const P = S.P();
    const prog = LA.state.prog;
    const key = (opts.ctx && opts.ctx.key) || q.q.slice(0, 40);
    const saved = P.writing[key];
    const ta = h('textarea', { placeholder: tr('Write here…', 'Pisz tutaj…'), 'aria-label': tr('Your writing', 'Twój tekst') });
    ta.value = saved ? saved.text : '';
    const wc = h('span.small.muted');
    const count = () => (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0);
    const upd = () => { wc.textContent = `${count()} ${tr('words', 'słów')}${q.minWords ? ` (${tr('aim for', 'cel:')} ${q.minWords}+)` : ''}`; P.writing[key] = { text: ta.value, at: Date.now() }; S.save(); };
    ta.addEventListener('input', U.debounce(upd, 400));
    wc.textContent = `${count()} ${tr('words', 'słów')}`;
    const typeArea = h('div', ta);
    const penArea = h('div.hidden');
    const bType = h('button.on', { type: 'button' }, tr('⌨️ Type', '⌨️ Klawiatura'));
    const bPen = h('button', { type: 'button' }, tr('✍️ Apple Pencil', '✍️ Rysik'));
    bType.addEventListener('click', () => { bType.classList.add('on'); bPen.classList.remove('on'); typeArea.classList.remove('hidden'); penArea.classList.add('hidden'); });
    bPen.addEventListener('click', () => {
      bPen.classList.add('on'); bType.classList.remove('on'); typeArea.classList.add('hidden'); penArea.classList.remove('hidden');
      if (!penArea.childNodes.length) penArea.appendChild(UI.writePanel({ prog, height: 360, question: q.q,
        onRead: (r) => { ta.value = r.text; upd(); UI.toast(tr('I typed out your writing — check it.', 'Przepisałam twój tekst — sprawdź go.')); bType.click(); },
        onNoAI: () => UI.toast(tr('Your handwriting stays on the page. Show it to your grown-up, or switch on the AI tutor to have it read.', 'Twoje pismo zostaje na ekranie. Pokaż je rodzicowi albo włącz asystenta AI, by je odczytał.'), 4500) }));
    });
    const checks = h('div.col', { style: { gap: '6px' } }, h('div.small.muted', tr('Check your work — tick each one when it is done:', 'Sprawdź swoją pracę — zaznacz, co już masz:')), q.checklist.map((c) => h('label.check', h('input', { type: 'checkbox' }), c)));
    const fbArea = h('div');
    const aiBtn = AI.available() ? h('button.btn.secondary', { type: 'button' }, tr('Get feedback from ', 'Poproś o ocenę: ') + LA.PROGRAMMES[prog].tutor) : null;
    if (aiBtn) aiBtn.addEventListener('click', () => {
      if (count() < 5) { fbArea.innerHTML = ''; fbArea.appendChild(h('div.feedback.bad', tr('Write a bit more first!', 'Napisz jeszcze trochę!'))); return; }
      fbArea.innerHTML = '';
      fbArea.appendChild(UI.aiBox(tr('Feedback', 'Ocena'), (on) => AI.writingFeedback(q.q, ta.value, q.checklist, prog, on)));
    });
    const done = h('button.btn.good', { type: 'button' }, tr('I’m finished ✓', 'Skończone ✓'));
    done.addEventListener('click', () => {
      const wp = penArea.querySelector('.write-panel');
      if (count() < Math.min(q.minWords || 10, 10) && !(wp && !wp.pad.isEmpty())) { fbArea.innerHTML = ''; fbArea.appendChild(h('div.feedback.bad', tr(`Try to write at least ${Math.min(q.minWords || 10, 10)} words.`, `Napisz co najmniej ${Math.min(q.minWords || 10, 10)} słów.`))); return; }
      onFinish();
    });
    return h('div.col', h('div.seg', bType, bPen), typeArea, penArea, h('div.row', wc, h('span.spacer'), UI.speakBtn(() => ta.value || tr('You have not written anything yet.', 'Jeszcze nic nie napisałeś/aś.'), tr('Read my writing back', 'Przeczytaj mój tekst'))), checks, h('div.row', aiBtn, done), fbArea);
  }

  /* ---------- tutor chat ---------- */
  const chats = { au: [], pl: [] };
  UI.tutor = { context: null };
  UI.initTutor = function () {
    const fab = h('button.tutor-fab', { type: 'button' });
    const panel = h('div.tutor.hidden', { role: 'dialog' });
    const msgs = h('div.msgs');
    const input = h('input', { type: 'text', 'aria-label': 'Message' });
    const send = h('button.btn.small', { type: 'button' });
    const quick = h('div.quick');
    const head = h('div.tutor-head');
    panel.append(head, msgs, quick, h('div.tutor-input', input, send));
    document.body.append(fab, panel);

    function render() {
      const prog = LA.state.prog;
      const P = LA.PROGRAMMES[prog];
      const chat = chats[prog];
      fab.textContent = P.tutorIcon;
      fab.title = tr('Ask Koa', 'Zapytaj Sowę Zosię');
      head.innerHTML = '';
      head.append(h('span.av', P.tutorIcon), h('span', P.tutor), h('span.spacer'),
        h('button.btn.ghost.small', { type: 'button', onclick: () => { chats[prog] = []; render(); } }, tr('Clear', 'Wyczyść')),
        h('button.btn.ghost.small', { type: 'button', 'aria-label': tr('Close', 'Zamknij'), onclick: () => panel.classList.add('hidden') }, '✕'));
      input.placeholder = tr('Ask Koa a question…', 'Zadaj pytanie Sowie Zosi…');
      send.textContent = tr('Send', 'Wyślij');
      msgs.innerHTML = '';
      const p = S.activeProfile();
      if (!chat.length) {
        const ctx = UI.tutor.context;
        const hi = prog === 'pl'
          ? `Cześć${p ? ' ' + p.name : ''}! Jestem **Sowa Zosia**. ${ctx && ctx.title ? `Widzę, że uczysz się: **${ctx.title}**. ` : ''}Zapytaj mnie o cokolwiek z nauki — wytłumaczę, dam przykład albo zrobię ci mały quiz.`
          : `G'day${p ? ' ' + p.name : ''}! I'm **Koa**. ${ctx && ctx.title ? `I can see you're working on **${ctx.title}**. ` : ''}Ask me anything about your learning — I can explain, give examples or quiz you. You can ask me in Polish too!`;
        msgs.appendChild(h('div.msg.assistant', { html: U.fmt(hi) }));
        if (!AI.available()) msgs.appendChild(h('div.msg.assistant', { html: U.fmt(tr('To chat with me, open this app on **claude.ai** (signed in), or a grown-up can add an AI key in **Parent → Settings**. The 🔊 buttons still read everything out loud.', 'Aby ze mną rozmawiać, otwórz aplikację na **claude.ai** (po zalogowaniu) albo poproś rodzica o klucz AI w **Rodzic → Ustawienia**. Przyciski 🔊 czytają wszystko na głos.')) }));
      }
      chat.forEach((m) => {
        const el = h('div.msg.' + m.role, { html: U.fmt(m.content) });
        if (m.role === 'assistant') el.appendChild(h('div', { style: { marginTop: '6px' } }, UI.speakBtn(() => U.plain(m.content), '', P.voice)));
        msgs.appendChild(el);
      });
      msgs.scrollTop = msgs.scrollHeight;
      quick.innerHTML = '';
      const ctx = UI.tutor.context;
      const qs = ctx ? tr(['Explain this simply', 'Give me an example', 'Quiz me with 3 questions', 'Wyjaśnij po polsku'], ['Wytłumacz to prosto', 'Daj przykład', 'Zrób mi quiz z 3 pytań', 'Explain in English'])
        : tr(['What should I do today?', 'Help me with times tables', 'Tell me a fun fact'], ['Co mam dziś zrobić?', 'Pomóż mi z tabliczką mnożenia', 'Opowiedz ciekawostkę']);
      qs.forEach((t) => quick.appendChild(h('button.btn.secondary.small', { type: 'button', onclick: () => ask(t) }, t)));
    }
    async function ask(text) {
      text = (text || '').trim();
      if (!text) return;
      const prog = LA.state.prog;
      const chat = chats[prog];
      chat.push({ role: 'user', content: text });
      input.value = '';
      render();
      if (!AI.available()) { chat.push({ role: 'assistant', content: tr('I need the AI switched on first (open on claude.ai, or Parent → Settings). Meanwhile, try the 🔊 buttons and re-read the lesson — you can do it!', 'Najpierw trzeba włączyć AI (claude.ai albo Rodzic → Ustawienia). Na razie użyj przycisków 🔊 i przeczytaj lekcję jeszcze raz — dasz radę!') }); render(); return; }
      const bubble = h('div.msg.assistant', h('span.thinking', tr('Thinking', 'Myślę')));
      msgs.appendChild(bubble);
      msgs.scrollTop = msgs.scrollHeight;
      const explainIn = /po polsku/i.test(text) ? 'pl' : /in english/i.test(text) ? 'en' : null;
      try {
        const reply = await AI.chat(chat, UI.tutor.context, (t) => { bubble.innerHTML = U.fmt(t); msgs.scrollTop = msgs.scrollHeight; }, explainIn);
        chat.push({ role: 'assistant', content: reply });
        if (S.settings().autoRead) SP.say(U.plain(reply), { lang: explainIn === 'pl' ? 'pl-PL' : explainIn === 'en' ? 'en-AU' : LA.PROGRAMMES[prog].voice });
      } catch (e) { chat.push({ role: 'assistant', content: '⚠️ ' + e.message }); }
      render();
    }
    send.addEventListener('click', () => ask(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(input.value); });
    fab.addEventListener('click', () => { panel.classList.toggle('hidden'); if (!panel.classList.contains('hidden')) { render(); input.focus(); } });
    UI.tutor.open = (prefill) => { panel.classList.remove('hidden'); render(); if (prefill) ask(prefill); };
    UI.tutor.setVisible = (v) => { fab.classList.toggle('hidden', !v); if (!v) panel.classList.add('hidden'); };
    UI.tutor.refresh = () => { fab.textContent = LA.PROGRAMMES[LA.state.prog].tutorIcon; if (!panel.classList.contains('hidden')) render(); };
    render();
  };
})();

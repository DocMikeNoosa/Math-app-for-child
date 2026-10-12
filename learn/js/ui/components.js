/* Reusable UI pieces: DOM helper, modal, confetti, question runner, Koa tutor chat. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const SP = LA.speech;
  const T = LA.tutor;
  const UI = (LA.ui = {});

  /* h('div.card#id', {onclick}, children...) */
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
    const add = (k) => {
      if (k == null || k === false) return;
      if (Array.isArray(k)) k.forEach(add);
      else el.appendChild(k instanceof Node ? k : document.createTextNode(String(k)));
    };
    kids.forEach(add);
    return el;
  };
  const h = UI.h;

  UI.speakBtn = (getText, label) => {
    const b = h('button.speak-btn', { type: 'button', title: 'Read this out loud', 'aria-label': 'Read aloud' }, label || '🔊 Read to me');
    b.addEventListener('click', (e) => { e.stopPropagation(); SP.toggle(b, typeof getText === 'function' ? getText() : getText); });
    if (!SP.available()) b.disabled = true;
    return b;
  };

  UI.modal = (title, body, actions) => {
    const back = h('div.modal-back');
    const close = () => back.remove();
    const box = h('div.modal', { role: 'dialog', 'aria-modal': 'true' }, h('h2', title), body, h('div.row', { style: { marginTop: '16px', justifyContent: 'flex-end' } }, (actions || [{ label: 'OK' }]).map((a) => h('button.btn' + (a.secondary ? '.secondary' : ''), { type: 'button', onclick: () => { if (!a.onclick || a.onclick() !== false) close(); } }, a.label))));
    back.appendChild(box);
    back.addEventListener('click', (e) => { if (e.target === back) close(); });
    document.body.appendChild(back);
    const f = box.querySelector('input,textarea,button');
    if (f) setTimeout(() => f.focus(), 30);
    return { close, box };
  };
  UI.confirm = (title, text, onYes, yesLabel) => UI.modal(title, h('p', text), [{ label: 'Cancel', secondary: true }, { label: yesLabel || 'Yes', onclick: onYes }]);

  UI.confetti = () => {
    const c = h('div.confetti');
    const colours = ['#e8590c', '#2b8a3e', '#1971c2', '#f59f00', '#c2255c', '#9c36b5'];
    for (let i = 0; i < 80; i++) {
      const p = h('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colours[i % colours.length];
      p.style.animationDelay = Math.random() * 0.8 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  };

  /* Renders AI text safely (escaped, light formatting) */
  UI.aiText = (text) => h('div', { html: U.fmt(text) });

  UI.aiBox = (title, promiseFn) => {
    const box = h('div.ai-box', h('div.who', '🐨 ' + title), h('div.loading.muted', 'Koa is thinking'));
    promiseFn()
      .then((txt) => {
        box.lastChild.remove();
        box.appendChild(UI.aiText(txt));
        box.appendChild(h('div.row', { style: { marginTop: '6px' } }, UI.speakBtn(() => U.plain(txt), '🔊 Read Koa’s answer')));
        if (S.settings().autoRead) SP.say(U.plain(txt));
      })
      .catch((err) => { box.lastChild.remove(); box.appendChild(h('div', '⚠️ ' + err.message)); });
    return box;
  };

  function questionSpeech(q) {
    let t = U.plain(q.q);
    if (q.type === 'mc') t += '. ' + q.options.map((o, i) => `${'ABCDE'[i]}: ${o}`).join('. ');
    return t;
  }

  function findListenBlock(q, ctx) {
    const lesson = LA.index.lessons[q.skill] || (ctx && ctx.blocks ? ctx : null);
    if (!lesson) return null;
    return (lesson.blocks || []).find((b) => b.type === 'listen') || null;
  }

  /* ---------- Question runner ----------
     mode: 'practice' (instant feedback, retry once) | 'quiz' (no feedback until the end) | 'review'
     onDone(results) where results = [{q, given, correct}] */
  UI.runQuestions = function (container, questions, opts) {
    opts = opts || {};
    const mode = opts.mode || 'practice';
    const results = [];
    let i = 0;
    container.innerHTML = '';
    const wrap = h('div.card.qcard');
    container.appendChild(wrap);

    if (!questions.length) {
      wrap.appendChild(h('p', 'No questions here.'));
      setTimeout(() => opts.onDone && opts.onDone(results), 0);
      return;
    }

    function show() {
      SP.stop();
      const q = questions[i];
      UI.currentQuestion = q; // read by automated tests
      wrap.innerHTML = '';
      const prog = h('div.qprog', h('div.bar', h('span', { style: { width: (i / questions.length) * 100 + '%' } })));
      wrap.appendChild(h('div.qhead', h('span.chip', `${i + 1} / ${questions.length}`), prog, UI.speakBtn(() => questionSpeech(q), '🔊')));
      if (q.listen) {
        const lb = findListenBlock(q, opts.ctx);
        if (lb) wrap.appendChild(h('div.row', { style: { marginBottom: '6px' } }, UI.speakBtn(() => U.plain(lb.text), '🎧 Play the listening passage')));
      }
      if (q.ai) wrap.appendChild(h('span.tag.info', 'Made by Koa for you'));
      wrap.appendChild(h('div.qtext', { html: U.fmt(q.q) }));
      if (q.svg) wrap.appendChild(h('div.visual', { html: q.svg }));
      const area = h('div');
      wrap.appendChild(area);
      const fb = h('div');
      let tries = 0;
      let firstCorrect = null;
      let firstGiven = null;
      let locked = false;

      const nextBtn = h('button.btn.big', { type: 'button' }, i + 1 < questions.length ? 'Next →' : mode === 'quiz' ? 'Finish quiz ✔' : 'Finish ✔');
      nextBtn.addEventListener('click', () => {
        results.push({ q, given: firstGiven, correct: !!firstCorrect });
        i++;
        if (i < questions.length) show();
        else { SP.stop(); opts.onDone && opts.onDone(results); }
      });

      function submit(given) {
        if (locked) return;
        if (q.type === 'input' && !String(given).trim()) return;
        const ok = U.checkAnswer(q, given);
        tries++;
        if (tries === 1) { firstCorrect = ok; firstGiven = given; S.recordAnswer(q, given, ok); }
        if (mode === 'quiz') {
          locked = true;
          results.push({ q, given, correct: ok });
          i++;
          if (i < questions.length) show();
          else { SP.stop(); opts.onDone && opts.onDone(results); }
          return;
        }
        // practice / review feedback
        fb.innerHTML = '';
        if (q.type === 'mc') area.querySelectorAll('.opt').forEach((b, bi) => { b.classList.remove('sel'); if (bi === Number(given)) b.classList.add(ok ? 'right' : 'wrong'); });
        if (ok) {
          locked = true;
          area.querySelectorAll('button,input').forEach((b) => (b.disabled = true));
          fb.appendChild(h('div.feedback.good', h('h4', U.pick(['✅ Correct!', '🌟 Great job!', '🎉 Yes! Well done!', '👍 Spot on!'])), q.explain && tries > 1 ? h('div', { html: U.fmt(q.explain) }) : null));
          fb.appendChild(h('div.row', { style: { marginTop: '12px' } }, nextBtn));
          setTimeout(() => nextBtn.focus(), 20);
        } else if (tries < 2) {
          fb.appendChild(h('div.feedback.bad', h('h4', 'Not quite — have another go!'), h('div', hintText(q))));
          if (LA.tutor.ai.available()) fb.appendChild(h('button.btn.secondary.small', { type: 'button', onclick: (e) => { e.target.replaceWith(UI.aiBox('Koa’s hint', () => T.ai.hint(q, opts.ctx))); } }, '🐨 Ask Koa for a hint'));
          if (q.type === 'input') { const inp = area.querySelector('input'); if (inp) { inp.select(); inp.focus(); } }
        } else {
          locked = true;
          area.querySelectorAll('button,input').forEach((b) => (b.disabled = true));
          if (q.type === 'mc') area.querySelectorAll('.opt')[q.answer].classList.add('right');
          const correctTxt = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
          fb.appendChild(h('div.feedback.info', h('h4', 'The answer is: ' + correctTxt), q.explain ? h('div', { html: U.fmt(q.explain) }) : null, h('div.row', { style: { marginTop: '8px' } }, UI.speakBtn(() => 'The answer is ' + correctTxt + '. ' + U.plain(q.explain || ''), '🔊 Read explanation'))));
          if (LA.tutor.ai.available()) fb.appendChild(h('button.btn.secondary.small', { type: 'button', style: { marginTop: '8px' }, onclick: (e) => { e.target.replaceWith(UI.aiBox('Koa explains', () => T.ai.explainMistake(q, firstGiven, opts.ctx))); } }, '🐨 Explain it another way'));
          fb.appendChild(h('div.row', { style: { marginTop: '12px' } }, nextBtn));
        }
      }

      if (q.type === 'mc') {
        const opts2 = h('div.opts');
        q.options.forEach((o, oi) => {
          const b = h('button.opt', { type: 'button' }, h('span.letter', 'ABCDE'[oi]), h('span', { html: U.fmt(o).replace(/^<p>|<\/p>$/g, '') }));
          b.addEventListener('click', () => submit(oi));
          opts2.appendChild(b);
        });
        area.appendChild(opts2);
      } else if (q.type === 'input') {
        const inp = h('input.answer-input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Type your answer', 'aria-label': 'Your answer' });
        const go = h('button.btn', { type: 'button' }, 'Check ✔');
        go.addEventListener('click', () => submit(inp.value));
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(inp.value); });
        area.appendChild(h('div.row', inp, go));
        setTimeout(() => inp.focus(), 30);
      } else if (q.type === 'write') {
        area.appendChild(writingTask(q, opts, () => {
          results.push({ q, given: 'written', correct: true });
          i++;
          if (i < questions.length) show();
          else opts.onDone && opts.onDone(results);
        }));
      }
      wrap.appendChild(fb);
      if (S.settings().autoRead) SP.say(questionSpeech(q));
    }

    function hintText(q) {
      if (q.hint) return q.hint;
      if (q.type === 'mc') return 'Read each choice carefully. Cross out the ones you know are wrong.';
      if (q.numeric) return 'Check your working. Try drawing it, or use the strategy from the lesson.';
      return 'Check your spelling and read the question again.';
    }

    show();
  };

  function writingTask(q, opts, onFinish) {
    const P = S.P();
    const key = (opts.ctx && opts.ctx.key) || q.q.slice(0, 40);
    const saved = P.writing[key];
    const ta = h('textarea', { placeholder: 'Write here…', 'aria-label': 'Your writing' });
    ta.value = saved ? saved.text : '';
    const wc = h('span.wc');
    const count = () => (ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0);
    const upd = () => { wc.textContent = count() + ' words' + (q.minWords ? ` (aim for ${q.minWords}+)` : ''); P.writing[key] = { text: ta.value, at: Date.now() }; S.save(); };
    ta.addEventListener('input', upd);
    upd();
    const checks = h('div.checklist', h('div.muted.small', 'Check your work — tick each one when you have done it:'), q.checklist.map((c) => h('label', h('input', { type: 'checkbox' }), c)));
    const fbArea = h('div');
    const aiBtn = LA.tutor.ai.available() ? h('button.btn.secondary', { type: 'button' }, '🐨 Get feedback from Koa') : null;
    if (aiBtn) aiBtn.addEventListener('click', () => {
      if (count() < 5) { fbArea.innerHTML = ''; fbArea.appendChild(h('div.feedback.bad', 'Write a bit more first!')); return; }
      fbArea.innerHTML = '';
      fbArea.appendChild(UI.aiBox('Koa’s feedback', () => T.ai.writingFeedback(q.q, ta.value, q.checklist)));
    });
    const done = h('button.btn.good', { type: 'button' }, 'I’m finished ✔');
    done.addEventListener('click', () => {
      if (count() < Math.min(q.minWords || 10, 10)) { fbArea.innerHTML = ''; fbArea.appendChild(h('div.feedback.bad', `Try to write at least ${Math.min(q.minWords || 10, 10)} words.`)); return; }
      onFinish();
    });
    return h('div.write-area.stack', ta, h('div.row', wc, h('span.spacer'), UI.speakBtn(() => ta.value || 'You have not written anything yet.', '🔊 Read my writing back')), checks, h('div.row', aiBtn, done), fbArea,
      !LA.tutor.ai.available() ? h('div.muted.small', 'Tip: ask a grown-up to read your writing and use the checklist together.') : null);
  }

  /* ---------- Koa chat drawer ---------- */
  let chatHistory = [];
  UI.koa = { context: null };
  UI.initKoa = function () {
    const fab = h('button.koa-fab', { type: 'button', title: 'Ask Koa the koala for help', 'aria-label': 'Open Koa tutor' }, '🐨');
    const panel = h('div.koa-panel.hidden', { role: 'dialog', 'aria-label': 'Koa tutor' });
    const msgs = h('div.koa-msgs');
    const input = h('input', { type: 'text', placeholder: 'Ask Koa a question…', 'aria-label': 'Message Koa' });
    const send = h('button.btn.small', { type: 'button' }, 'Send');
    const quick = h('div.quick');
    panel.append(
      h('div.koa-head', '🐨 Koa the tutor', h('span.spacer'), h('button.btn.ghost.small', { type: 'button', onclick: () => { chatHistory = []; render(); } }, 'Clear'), h('button.btn.ghost.small', { type: 'button', 'aria-label': 'Close', onclick: () => panel.classList.add('hidden') }, '✕')),
      msgs, quick, h('div.koa-input', input, send)
    );
    document.body.append(fab, panel);

    function render() {
      msgs.innerHTML = '';
      if (!chatHistory.length) {
        const ctx = UI.koa.context;
        msgs.appendChild(h('div.msg.assistant', h('div', { html: U.fmt(`G'day${S.activeProfile() ? ' ' + S.activeProfile().name : ''}! I'm **Koa**. ${ctx ? `I can see you're working on **${ctx.title}**. ` : ''}Ask me anything about your schoolwork — I can explain things, give examples, or quiz you.`) })));
        if (!T.ai.available()) msgs.appendChild(h('div.msg.assistant', h('div', { html: U.fmt('To chat with me, a grown-up needs to add an AI key in **Parent area → Settings**. Until then, I can still **read things out loud** for you — press the 🔊 buttons — and the app will still give you extra practice when something is tricky.') })));
      }
      chatHistory.forEach((m) => {
        const el = h('div.msg.' + m.role, { html: U.fmt(m.content) });
        if (m.role === 'assistant') el.appendChild(h('div', { style: { marginTop: '4px' } }, UI.speakBtn(() => U.plain(m.content), '🔊')));
        msgs.appendChild(el);
      });
      msgs.scrollTop = msgs.scrollHeight;
      quick.innerHTML = '';
      const ctx = UI.koa.context;
      const qs = ctx ? ['Explain this lesson simply', 'Give me an example', 'Quiz me with 3 questions'] : ['What should I do today?', 'Help me with times tables', 'Tell me a fun fact'];
      qs.forEach((t) => quick.appendChild(h('button.btn.secondary.small', { type: 'button', onclick: () => ask(t) }, t)));
    }

    async function ask(text) {
      text = (text || '').trim();
      if (!text) return;
      chatHistory.push({ role: 'user', content: text });
      input.value = '';
      render();
      if (!T.ai.available()) {
        chatHistory.push({ role: 'assistant', content: 'I need a grown-up to switch on my AI brain first (Parent area → Settings). For now, try the 🔊 read-aloud buttons, and re-read the lesson notes — you can do it!' });
        render();
        return;
      }
      const thinking = h('div.msg.assistant.loading', 'Koa is thinking');
      msgs.appendChild(thinking);
      msgs.scrollTop = msgs.scrollHeight;
      try {
        const reply = await T.ai.chat(chatHistory, UI.koa.context);
        chatHistory.push({ role: 'assistant', content: reply });
        if (S.settings().autoRead) SP.say(U.plain(reply));
      } catch (e) {
        chatHistory.push({ role: 'assistant', content: '⚠️ ' + e.message });
      }
      render();
    }
    send.addEventListener('click', () => ask(input.value));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(input.value); });
    fab.addEventListener('click', () => { panel.classList.toggle('hidden'); if (!panel.classList.contains('hidden')) { render(); input.focus(); } });
    UI.koa.open = (prefill) => { panel.classList.remove('hidden'); render(); if (prefill) ask(prefill); };
    UI.koa.setVisible = (v) => { fab.classList.toggle('hidden', !v); if (!v) panel.classList.add('hidden'); };
  };
})();

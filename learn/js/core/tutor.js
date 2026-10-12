/* The tutor: adaptive planning (works offline) + optional Claude-powered explanations, re-teaching,
   extra practice generation, writing feedback and chat. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const T = (LA.tutor = {});

  T.PASS_QUIZ = 0.8; // chapter quiz pass mark
  T.PASS_PRACTICE = 0.6; // lesson practice needed to tick a lesson off
  T.PASS_REMEDIATION = 0.8;

  const year = () => (S.activeProfile() ? S.activeProfile().year : 3);
  const subjects = () => LA.curriculum[year()].subjects;

  /* ---------- where is the child up to? ---------- */
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
    return null; // finished
  };

  T.subjectStats = (subj) => {
    let lessons = 0, done = 0, passed = 0;
    subj.chapters.forEach((ch) => {
      if (S.isChapterPassed(ch.key)) passed++;
      ch.lessons.forEach((l) => { lessons++; if (S.isLessonDone(l.key)) done++; });
    });
    const expected = Math.round(U.yearProgress() * subj.chapters.length);
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

  /* ---------- results processing (the "dwell" logic) ---------- */
  T.afterPractice = (lesson, results, attempt) => {
    const scored = results.filter((r) => r.q.type !== 'write');
    const right = scored.filter((r) => r.correct).length;
    const total = scored.length;
    const score = total ? right / total : 1;
    const ok = score >= T.PASS_PRACTICE;
    if (ok) {
      S.markLesson(lesson.key, { score: right, total });
      if (score < 0.8 && total) S.addRemediation({ skill: lesson.key, chapterKey: lesson.chapterKey, reason: `Practice score ${right}/${total} — a little more practice will lock it in.` });
    } else if (attempt >= 2) {
      // don't get stuck: tick it off but schedule focused extra work
      S.markLesson(lesson.key, { score: right, total, via: 'completed-needs-review' });
      S.addRemediation({ skill: lesson.key, chapterKey: lesson.chapterKey, reason: `Found this tricky (${right}/${total}). Extra practice added.` });
    }
    S.log('practice', lesson.key, lesson.minutes || 10);
    return { right, total, score, ok, movedOn: !ok && attempt >= 2 };
  };

  T.afterQuiz = (ch, results, mode) => {
    const right = results.filter((r) => r.correct).length;
    const total = results.length;
    const score = total ? right / total : 0;
    const passed = score >= T.PASS_QUIZ;
    const via = mode === 'testout' ? 'tested-out' : 'quiz';
    S.recordQuiz(ch.key, right, total, passed, via);
    // group mistakes by skill
    const bySkill = {};
    results.forEach((r) => {
      const k = r.q.skill || ch.key;
      bySkill[k] = bySkill[k] || { right: 0, total: 0 };
      bySkill[k].total++;
      if (r.correct) bySkill[k].right++;
    });
    const weak = Object.keys(bySkill).filter((k) => bySkill[k].right < bySkill[k].total);
    if (passed) {
      if (mode === 'testout') ch.lessons.forEach((l) => { if (!S.isLessonDone(l.key)) S.markLesson(l.key, { via: 'tested-out' }); });
      // even on a pass, wrong answers get a light review
      weak.forEach((k) => S.addRemediation({ skill: k, chapterKey: ch.key, reason: `Missed ${bySkill[k].total - bySkill[k].right} in the "${ch.title}" quiz.` }));
    } else {
      weak.forEach((k) => S.addRemediation({ skill: k, chapterKey: ch.key, reason: `Quiz: ${bySkill[k].right}/${bySkill[k].total} on this part. Let's go over it again.`, blocking: mode !== 'testout' }));
    }
    S.log('quiz', ch.key, 10);
    return { right, total, score, passed, weak };
  };

  T.afterRemediation = (rem, results) => {
    const right = results.filter((r) => r.correct).length;
    const total = results.length;
    const ok = total ? right / total >= T.PASS_REMEDIATION : true;
    if (ok) S.completeRemediation(rem.id);
    else { rem.tries = (rem.tries || 0) + 1; S.save(); }
    S.log('review', rem.skill, 6);
    return { right, total, ok };
  };

  /* Skills worth a quick spaced review: practised, mastery < 0.85, or not seen for 10+ days */
  T.reviewCandidates = () => {
    const P = S.P();
    const out = [];
    Object.keys(P.skills).forEach((k) => {
      if (!LA.index.lessons[k] && !LA.index.chapters[k]) return;
      if (!k.startsWith('y' + year() + '.')) return;
      const m = S.mastery(k);
      const age = (Date.now() - P.skills[k].last) / 86400000;
      const score = (1 - (m == null ? 1 : m)) * 2 + Math.min(age, 30) / 30;
      if ((m != null && m < 0.85) || age > 10) out.push({ skill: k, m, age, score });
    });
    return out.sort((a, b) => b.score - a.score);
  };

  T.weakSkills = (limit) => {
    const P = S.P();
    return Object.keys(P.skills)
      .filter((k) => k.startsWith('y' + year() + '.') && P.skills[k].n >= 2)
      .map((k) => ({ skill: k, m: S.mastery(k), n: P.skills[k].n }))
      .filter((x) => x.m < 0.75)
      .sort((a, b) => a.m - b.m)
      .slice(0, limit || 8);
  };

  /* ---------- daily homework ---------- */
  const MIN = { lesson: 12, quiz: 10, review: 6, remediation: 8 };

  T.planToday = (force) => {
    const P = S.P();
    const today = U.todayKey();
    if (P.homework[today] && !force) return P.homework[today];
    const prev = P.homework[today];
    const budget = +S.settings().dailyMinutes || 30;
    const items = [];
    let used = 0;
    const add = (it, mins) => { items.push(Object.assign({ id: U.uid(), done: false, minutes: mins }, it)); used += mins; };

    // 1. focused extra work the tutor assigned (max 2)
    S.openRemediation().filter((r) => r.skill.startsWith('y' + year() + '.')).slice(0, 2).forEach((r) => add({ kind: 'remediation', ref: r.id, title: 'Extra practice: ' + LA.skillLabel(r.skill), skill: r.skill }, MIN.remediation));

    // 2. next steps across subjects: English + Maths every day, others rotate
    const subs = subjects();
    const core = subs.filter((s) => s.id === 'english' || s.id === 'maths');
    const others = subs.filter((s) => s.id !== 'english' && s.id !== 'maths');
    const dayNum = Math.floor(Date.now() / 86400000);
    const rotated = others.length ? others.slice(dayNum % others.length).concat(others.slice(0, dayNum % others.length)) : [];
    const order = core.concat(rotated);
    const behind = order.map((s) => ({ s, st: T.subjectStats(s) }));
    // catch-up: subjects that are behind schedule get priority after the core two
    const sorted = behind.slice(0, core.length).concat(behind.slice(core.length).sort((a, b) => b.st.behind - a.st.behind));
    for (const { s } of sorted) {
      if (used >= budget) break;
      const step = T.nextStep(s);
      if (!step) continue;
      if (step.kind === 'lesson') add({ kind: 'lesson', ref: step.lesson.key, title: `${s.name}: ${step.lesson.title}`, subject: s.id }, step.lesson.minutes || MIN.lesson);
      else add({ kind: 'quiz', ref: step.chapter.key, title: `${s.name}: "${step.chapter.title}" check-up quiz`, subject: s.id }, MIN.quiz);
    }
    // if still time and catching up, take a second lesson in the most-behind subject
    if (used < budget) {
      const most = behind.slice().sort((a, b) => b.st.behind - a.st.behind)[0];
      if (most && most.st.behind > 0) {
        const step = T.nextStep(most.s);
        if (step && step.kind === 'lesson') {
          const ch = step.chapter;
          const nxt = ch.lessons.find((l) => !S.isLessonDone(l.key) && l.key !== step.lesson.key && !items.some((i) => i.ref === l.key));
          if (nxt) add({ kind: 'lesson', ref: nxt.key, title: `${most.s.name}: ${nxt.title} (catch-up)`, subject: most.s.id }, nxt.minutes || MIN.lesson);
        }
      }
    }
    // 3. one spaced review
    const rev = T.reviewCandidates().find((r) => !items.some((i) => i.skill === r.skill));
    if (rev) add({ kind: 'review', ref: rev.skill, title: 'Quick review: ' + LA.skillLabel(rev.skill), skill: rev.skill }, MIN.review);

    // keep done flags if regenerating
    if (prev) items.forEach((it) => { const old = prev.items.find((o) => o.ref === it.ref && o.kind === it.kind); if (old) it.done = old.done; });
    P.homework[today] = { items, generatedAt: Date.now(), budget };
    S.save();
    return P.homework[today];
  };

  T.markHomework = (kind, ref) => {
    const P = S.P();
    const h = P.homework[U.todayKey()];
    if (!h) return;
    h.items.forEach((it) => { if (it.ref === ref && (it.kind === kind || (kind === 'lesson' && it.kind === 'lesson'))) it.done = true; });
    S.save();
  };

  /* ================= Claude AI ================= */
  const AI = (T.ai = {});
  AI.available = () => !!(S.settings().apiKey && S.settings().aiEnabled);

  function systemPrompt(extra) {
    const p = S.activeProfile();
    const weak = T.weakSkills(5).map((w) => LA.skillLabel(w.skill)).join('; ');
    return [
      `You are Koa, a warm, patient koala tutor inside a homework app for an Australian primary school child in Year ${p ? p.year : 3}${p ? ' named ' + p.name : ''}.`,
      'The work follows the Australian Curriculum (v9.0). Use Australian English spelling (colour, metre, mum) and Australian examples (dollars and cents, AFL/cricket, native animals).',
      `Write for a ${p && p.year === 4 ? '9–10' : '8–9'} year old: short sentences, simple words, one idea at a time. Be encouraging and specific. Never make the child feel bad.`,
      'Explain step by step with a tiny example. When the child is stuck, give a hint before the full answer. Check understanding with one short question at the end when it helps.',
      'Stay on schoolwork and learning. If the child seems upset, unsafe, or asks about something not suitable for children, kindly suggest they talk to a parent or teacher, and steer back to learning.',
      'Never ask for personal information. Keep replies under about 120 words unless asked for more. Do not use markdown tables; you may use **bold** and simple dash lists.',
      weak ? `Things this child has been finding tricky lately: ${weak}.` : '',
      extra || '',
    ].filter(Boolean).join('\n');
  }

  async function call(messages, opts) {
    opts = opts || {};
    const st = S.settings();
    if (!st.apiKey) throw new Error('No API key set. A grown-up can add one in Parent area → Settings.');
    const model = st.model || 'claude-opus-5-5';
    const body = {
      model,
      max_tokens: opts.max_tokens || 1500,
      system: systemPrompt(opts.system),
      messages,
      output_config: { effort: 'low' },
    };
    const headers = {
      'content-type': 'application/json',
      'x-api-key': st.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    const useFallback = /^claude-(opus-5-5|sonnet-5-5|opus-5|fable-5-1)$/.test(model);
    if (useFallback) { body.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }
    let res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.status === 400 && useFallback) {
      // If this account/model doesn't accept fallbacks, retry once without them.
      const txt = await res.clone().text();
      if (/fallback/i.test(txt)) {
        delete body.fallbacks;
        delete headers['anthropic-beta'];
        res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) });
      }
    }
    if (!res.ok) {
      let msg = 'The AI helper could not answer (error ' + res.status + ').';
      try { const j = await res.json(); if (j && j.error && j.error.message) msg += ' ' + j.error.message; } catch (e) { /* ignore */ }
      if (res.status === 401) msg = 'The API key was not accepted. A grown-up can check it in Parent area → Settings.';
      if (res.status === 429) msg = 'The AI helper is busy right now. Please try again in a minute.';
      throw new Error(msg);
    }
    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new Error("Koa can't help with that one. Let's get back to our learning!");
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!text) throw new Error('The AI helper sent an empty answer. Please try again.');
    return text;
  }
  AI.call = call;

  function lessonContext(lessonOrChapter) {
    if (!lessonOrChapter) return '';
    const l = lessonOrChapter;
    const parts = [];
    if (l.blocks) {
      const ch = LA.index.chapters[l.chapterKey];
      parts.push(`Current lesson: ${LA.subjectOf(l.key).name} — ${ch.title} → ${l.title}.`);
      parts.push('Lesson notes: ' + l.blocks.filter((b) => b.text).map((b) => U.plain(b.text)).join(' ').slice(0, 2500));
    } else if (l.lessons) {
      parts.push(`Current chapter: ${LA.subjectOf(l.key).name} — ${l.title}. ${l.summary || ''}`);
    }
    return parts.join('\n');
  }
  AI.lessonContext = lessonContext;

  AI.explainMistake = (q, given, ctx) => {
    const correct = q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer;
    const givenText = q.type === 'mc' ? q.options[given] : given;
    const msg = `${lessonContext(ctx)}\n\nThe question was: "${U.plain(q.q)}"${q.type === 'mc' ? `\nChoices: ${q.options.join(' | ')}` : ''}\nThe child answered: "${givenText}". The correct answer is: "${correct}".\n${q.explain ? 'Teacher note: ' + q.explain : ''}\nExplain kindly why the correct answer is right, and what might have led to their answer. Then give one similar mini example (with its answer) so they can see the idea again.`;
    return call([{ role: 'user', content: msg }], { max_tokens: 900 });
  };

  AI.reteach = (skill) => {
    const l = LA.index.lessons[skill] || LA.index.chapters[skill];
    const P = S.P();
    const recent = P.mistakes.filter((m) => m.skill === skill).slice(-5).map((m) => `Q: ${m.q} | they said: ${m.given} | answer: ${m.correct}`).join('\n');
    const msg = `${lessonContext(l)}\n\nThe child is finding "${LA.skillLabel(skill)}" hard.${recent ? '\nRecent mistakes:\n' + recent : ''}\nTeach this idea again in a different, simpler way than the lesson notes: use a real-life Australian example, then 2 worked examples step by step, then one practice question for them to try (put its answer at the very end after the words "Answer:").`;
    return call([{ role: 'user', content: msg }], { max_tokens: 1400 });
  };

  AI.hint = (q, ctx) => {
    const msg = `${lessonContext(ctx)}\n\nThe child asked for a hint on: "${U.plain(q.q)}"${q.type === 'mc' ? `\nChoices: ${q.options.join(' | ')}` : ''}\nGive ONE short hint (1–3 sentences) that helps them think, WITHOUT giving the answer away.`;
    return call([{ role: 'user', content: msg }], { max_tokens: 400 });
  };

  AI.chat = (history, ctx) => {
    const msgs = history.slice(-12).map((m) => ({ role: m.role, content: m.content }));
    return call(msgs, { system: lessonContext(ctx), max_tokens: 1200 });
  };

  AI.writingFeedback = (prompt, text, checklist) => {
    const msg = `The child wrote this for the task: "${U.plain(prompt)}"\nThings the task asks for: ${checklist.join('; ') || 'clear sentences'}.\n\n--- child's writing ---\n${text}\n--- end ---\n\nGive feedback a Year ${year()} teacher would: 2 specific things they did well ("Stars"), 1–2 things to improve next time with a short example ("Wish"), and point out up to 3 spelling or punctuation fixes (show the wrong word → the right word). Be warm. Use the headings Stars, Wish, Fix-ups.`;
    return call([{ role: 'user', content: msg }], { max_tokens: 1000 });
  };

  /* Ask Claude for extra practice questions as JSON, validate strictly, and fall back to built-in practice. */
  AI.generatePractice = async (skill, n) => {
    n = Math.min(n || 5, 8);
    const l = LA.index.lessons[skill] || LA.index.chapters[skill];
    const P = S.P();
    const recent = P.mistakes.filter((m) => m.skill === skill).slice(-5).map((m) => `- ${m.q} (they said ${m.given}; answer ${m.correct})`).join('\n');
    const msg = `${lessonContext(l)}\n${recent ? 'Recent mistakes:\n' + recent : ''}\n\nWrite ${n} NEW practice questions on "${LA.skillLabel(skill)}" for this Year ${year()} child, a bit easier at first and building up, targeting their mistakes.\nReply with ONLY a JSON array, no other text. Each item is either\n{"type":"mc","q":"question","options":["a","b","c","d"],"answer":<index of correct option 0-3>,"explain":"one or two sentence explanation"}\nor\n{"type":"input","q":"question","answer":"the exact short answer (a number or one or two words)","explain":"..."}\nUse multiple choice for anything with a wordy answer. Every question must be answerable from the question text alone (no pictures).`;
    const text = await call([{ role: 'user', content: msg }], { max_tokens: 2500 });
    const qs = AI.parseQuestions(text, n, skill);
    if (!qs.length) throw new Error('The AI questions did not come through properly.');
    return qs;
  };

  AI.parseQuestions = (text, n, skill) => {
    const start = text.indexOf('['), end = text.lastIndexOf(']');
    if (start < 0 || end < start) return [];
    let arr;
    try { arr = JSON.parse(text.slice(start, end + 1)); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const it of arr) {
      if (!it || typeof it.q !== 'string' || it.q.length > 600) continue;
      if (it.type === 'mc') {
        if (!Array.isArray(it.options) || it.options.length < 2 || it.options.length > 5) continue;
        const a = Number(it.answer);
        if (!Number.isInteger(a) || a < 0 || a >= it.options.length) continue;
        out.push({ type: 'mc', q: it.q, options: it.options.map((o) => String(o).slice(0, 200)), answer: a, explain: String(it.explain || ''), skill, ai: true });
      } else if (it.type === 'input') {
        if (it.answer == null || String(it.answer).length > 60) continue;
        const ansStr = String(it.answer);
        const isNum = U.parseNum(ansStr) != null;
        out.push({ type: 'input', q: it.q, answer: [ansStr], numeric: isNum, explain: String(it.explain || ''), skill, ai: true });
      }
    }
    return LA.expand(out.slice(0, n), skill);
  };

  AI.parentSummary = () => {
    const P = S.P();
    const p = S.activeProfile();
    const lines = subjects().map((s) => { const st = T.subjectStats(s); return `${s.name}: ${st.done}/${st.lessons} lessons, ${st.passed}/${st.chapters} chapters passed, expected about ${st.expected} by now.`; });
    const weak = T.weakSkills(8).map((w) => `${LA.skillLabel(w.skill)} (${Math.round(w.m * 100)}%)`).join('; ');
    const recent = P.mistakes.slice(-15).map((m) => `${LA.skillLabel(m.skill)}: "${m.q}" → said ${m.given}, answer ${m.correct}`).join('\n');
    const msg = `Write a short progress note for the PARENT (not the child) of ${p.name}, Year ${p.year}. Plain, warm, practical. Sections: Overall, Strengths, Needs work (be specific about the misconception you see in the mistakes), Suggested next week plan (3–5 bullet points with concrete activities, including offline ones). Under 250 words.\n\nProgress:\n${lines.join('\n')}\nWeak skills: ${weak || 'none flagged yet'}\nRecent mistakes:\n${recent || 'none'}`;
    return call([{ role: 'user', content: msg }], { system: 'For this message you are writing to the parent, so use an adult tone.', max_tokens: 1500 });
  };
})();

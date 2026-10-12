/* AI tutor adapter.
   On claude.ai the app asks Claude through the artifact "sample" capability (uses the viewer's own Claude plan; no key needed).
   Elsewhere (opened as a file or from a website) it can use an Anthropic API key entered by a parent. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const S = LA.store;
  const AI = (LA.ai = { mode: 'none', images: false, declined: false });
  let sampleFn = null;

  AI.init = async function () {
    if (window.claude && typeof window.claude.use === 'function') {
      try {
        sampleFn = await window.claude.use('sample');
        if (sampleFn) {
          AI.mode = 'claude';
          try { const lim = await sampleFn.limits(); AI.images = !!(lim && lim.images); AI.maxImages = (lim && lim.images && lim.images.maxCount) || 0; } catch (e) { AI.images = false; }
        }
      } catch (e) { sampleFn = null; }
    }
    refreshMode();
    return AI.mode;
  };
  function refreshMode() {
    if (sampleFn && !AI.declined) { AI.mode = 'claude'; return; }
    AI.mode = S.settings().apiKey ? 'apikey' : 'none';
    AI.images = AI.mode === 'apikey' ? true : AI.images && !!sampleFn;
    if (AI.mode === 'apikey') AI.maxImages = 5;
  }
  AI.available = () => { refreshMode(); return AI.mode !== 'none' && S.settings().aiEnabled !== false; };
  AI.canSeeImages = () => AI.available() && (AI.mode === 'apikey' || AI.images);

  /* ---------- persona ---------- */
  function persona(prog, opts) {
    opts = opts || {};
    const p = S.activeProfile();
    const year = p ? p[prog].year : 3;
    const name = p ? p.name : 'the child';
    const age = year === 4 ? '9–10' : '8–9';
    const weak = LA.tutor ? LA.tutor.weakSkills(prog, 5).map((w) => LA.skillLabel(w.skill)).join('; ') : '';
    if (opts.parent) {
      return [
        `You are an experienced primary-school teacher advising the parent of ${name}, who is homeschooled in two programmes: the Australian Curriculum (v9.0, in English) and the Polish core curriculum (podstawa programowa), while also attending a school in Poland. ${name} mostly speaks Polish at home.`,
        `Write to the parent in ${S.settings().parentLang === 'pl' ? 'Polish' : 'English'}. Be warm, specific and practical. Base every judgement on the data provided; if data is thin, say so.`,
      ].join('\n');
    }
    if (prog === 'pl') {
      return [
        `Jesteś Sową Zosią — cierpliwą, ciepłą nauczycielką w aplikacji do nauki w domu. Uczysz dziecko o imieniu ${name} z klasy ${year} według polskiej podstawy programowej.`,
        `Pisz po polsku, poprawnie i prosto, dla dziecka w wieku ${age} lat: krótkie zdania, jedna myśl naraz, przykłady z życia w Polsce. Zachęcaj i chwal konkretnie. Nigdy nie zawstydzaj.`,
        `Wyjaśniaj krok po kroku z małym przykładem. Gdy dziecko utknie, najpierw daj wskazówkę, a dopiero potem odpowiedź. Zwracaj uwagę na błędy ortograficzne i delikatnie je poprawiaj.`,
        `Trzymaj się nauki. Jeśli dziecko jest smutne, przestraszone albo pyta o coś nieodpowiedniego, życzliwie poradź rozmowę z rodzicem lub nauczycielem i wróć do nauki. Nie pytaj o dane osobowe. Odpowiadaj zwięźle (do ok. 120 słów). Bez tabel; możesz używać **pogrubienia** i krótkich list.`,
        weak ? `Ostatnio trudne były: ${weak}.` : '',
        opts.explainIn === 'en' ? 'Tym razem wyjaśnij PO ANGIELSKU (dziecko uczy się też po angielsku).' : '',
      ].filter(Boolean).join('\n');
    }
    return [
      `You are Koa, a warm, patient koala tutor (female) in a homeschool app. You teach ${name}, Year ${year}, following the Australian Curriculum v9.0.`,
      `${name} mostly speaks Polish at home and is learning in English, so use clear, simple English for a ${age} year old: short sentences, common words, one idea at a time. Use Australian English spelling (colour, metre, mum) and Australian examples.`,
      `Explain step by step with a tiny example. When the child is stuck, give a hint before the answer. Gently point out spelling mistakes and show the correct spelling.`,
      `Stay on learning. If the child seems upset, unsafe, or asks about something unsuitable for children, kindly suggest talking to a parent and steer back. Never ask for personal information. Keep replies under about 120 words. No tables; **bold** and short lists are fine.`,
      weak ? `Things ${name} has found tricky lately: ${weak}.` : '',
      opts.explainIn === 'pl' ? `This time, explain IN POLISH (simple Polish for a child), then give the key English words in brackets so ${name} can learn them.` : '',
    ].filter(Boolean).join('\n');
  }

  function blobToBase64(blob) {
    return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
  }

  function errorText(code, lang) {
    const pl = lang === 'pl';
    switch (code) {
      case 'not_granted': return pl ? 'Asystent AI nie ma zgody w tej przeglądarce. Rodzic może ją włączyć w ustawieniach artefaktu.' : 'The AI helper has not been allowed on this device. A grown-up can allow it from the page’s permissions.';
      case 'rate_limited': return pl ? 'Asystent jest teraz zajęty. Spróbuj za chwilę.' : 'The AI helper is busy. Please try again in a minute.';
      case 'session_expired': return pl ? 'Trzeba ponownie zalogować się do claude.ai.' : 'Please sign in to claude.ai again.';
      case 'refused': return pl ? 'Na to pytanie nie mogę odpowiedzieć. Wróćmy do nauki!' : "I can't help with that one. Let's get back to learning!";
      case 'sampling_disabled': return pl ? 'Asystent AI jest wyłączony dla tego konta.' : 'The AI helper is switched off for this account.';
      default: return pl ? 'Asystent nie odpowiedział. Spróbuj jeszcze raz.' : 'The AI helper did not answer. Please try again.';
    }
  }

  /* call(messages, {prog, system, images, tier, maxTokens, json, onText, parent, explainIn}) */
  AI.call = async function (messages, opts) {
    opts = opts || {};
    const prog = opts.prog || LA.state.prog || 'au';
    const lang = opts.parent ? (S.settings().parentLang || 'en') : LA.PROGRAMMES[prog].lang;
    refreshMode();
    if (AI.mode === 'none') throw new Error(lang === 'pl' ? 'Asystent AI jest niedostępny. Otwórz aplikację na claude.ai lub dodaj klucz API w panelu rodzica.' : 'The AI helper is not available. Open the app on claude.ai, or add an API key in the Parent area.');
    const rules = persona(prog, opts) + (opts.system ? '\n\n' + opts.system : '');
    if (AI.mode === 'claude') {
      const input = [{ role: 'user', content: rules }].concat(messages.map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 12000) || '…' })));
      if (input[input.length - 1].role !== 'user') input.push({ role: 'user', content: '…' });
      const o = { modelTier: opts.tier || 'default', cache: opts.cache === undefined ? false : opts.cache };
      if (opts.onText) o.onText = ({ text }) => opts.onText(text);
      if (opts.images && opts.images.length && AI.images) o.images = opts.images.slice(0, AI.maxImages || 4);
      try {
        if (opts.json) return await sampleFn.json(input, o);
        const r = await sampleFn(input, o);
        return r.text;
      } catch (e) {
        if (e && (e.code === 'not_granted' || e.code === 'sampling_disabled' || e.code === 'not_declared' || e.code === 'capability_disabled')) { AI.declined = true; refreshMode(); }
        throw new Error(errorText(e && e.code, lang));
      }
    }
    // API key mode
    const st = S.settings();
    const content = [];
    if (opts.images && opts.images.length) for (const b of opts.images.slice(0, 5)) content.push({ type: 'image', source: { type: 'base64', media_type: b.type || 'image/jpeg', data: await blobToBase64(b) } });
    const msgs = messages.map((m, i) => ({ role: m.role, content: i === messages.length - 1 && content.length ? content.concat([{ type: 'text', text: m.content }]) : m.content }));
    const model = st.model || 'claude-opus-5-5';
    const body = { model, max_tokens: opts.maxTokens || 1500, system: rules + (opts.json ? '\nReply with only the JSON value requested, no other text.' : ''), messages: msgs, output_config: { effort: 'low' } };
    const headers = { 'content-type': 'application/json', 'x-api-key': st.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
    const useFallback = /^claude-(opus-5-5|sonnet-5-5|opus-5|fable-5-1)$/.test(model);
    if (useFallback) { body.fallbacks = 'default'; headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; }
    let res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) });
    if (res.status === 400 && useFallback) {
      const txt = await res.clone().text();
      if (/fallback/i.test(txt)) { delete body.fallbacks; delete headers['anthropic-beta']; res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) }); }
    }
    if (!res.ok) {
      if (res.status === 401) throw new Error(lang === 'pl' ? 'Klucz API nie został przyjęty.' : 'The API key was not accepted.');
      if (res.status === 429) throw new Error(errorText('rate_limited', lang));
      let msg = '';
      try { const j = await res.json(); msg = j.error && j.error.message; } catch (e) { /* ignore */ }
      throw new Error(errorText('', lang) + (msg ? ' (' + msg + ')' : ''));
    }
    const data = await res.json();
    if (data.stop_reason === 'refusal') throw new Error(errorText('refused', lang));
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    if (!text) throw new Error(errorText('', lang));
    if (opts.onText) opts.onText(text);
    if (opts.json) {
      const s = text.search(/[[{]/), e = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
      if (s < 0 || e < s) throw new Error(errorText('', lang));
      return JSON.parse(text.slice(s, e + 1));
    }
    return text;
  };

  /* ---------- tutor helpers ---------- */
  function lessonContext(obj) {
    if (!obj) return '';
    if (obj.blocks) {
      const ch = LA.index.chapters[obj.chapterKey];
      return `Current lesson: ${LA.subjectOf(obj.key).name} — ${ch.title} → ${obj.title}.\nLesson notes: ` + obj.blocks.filter((b) => b.text).map((b) => U.plain(b.text)).join(' ').slice(0, 2500);
    }
    if (obj.lessons) return `Current chapter: ${LA.subjectOf(obj.key).name} — ${obj.title}. ${obj.summary || ''}`;
    if (obj.chapters) return `Current subject: ${obj.name}.`;
    return '';
  }
  AI.lessonContext = lessonContext;
  const progOf = (obj) => (obj && obj.key ? LA.progOfKey(obj.key) : LA.state.prog);
  const answerText = (q, v) => (q.type === 'mc' ? q.options[v] : v);
  const correctText = (q) => (q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer[0] : q.answer);

  AI.explainMistake = (q, given, ctx, onText, explainIn) => {
    const pl = progOf(ctx) === 'pl';
    const qtext = q.dictation ? (pl ? `Dyktando: wyraz „${q.say}”` : `Dictation: the word "${q.say}"`) : U.plain(q.q);
    const msg = `${lessonContext(ctx)}\n\n${pl ? 'Pytanie' : 'The question'}: "${qtext}"${q.type === 'mc' ? `\n${pl ? 'Odpowiedzi' : 'Choices'}: ${q.options.join(' | ')}` : ''}\n${pl ? 'Dziecko odpowiedziało' : 'The child answered'}: "${answerText(q, given)}". ${pl ? 'Poprawna odpowiedź' : 'Correct answer'}: "${correctText(q)}".\n${q.explain ? (pl ? 'Notatka nauczyciela: ' : 'Teacher note: ') + q.explain : ''}\n${pl ? 'Wyjaśnij życzliwie, dlaczego poprawna odpowiedź jest dobra i skąd mógł wziąć się błąd (także ortograficzny). Potem daj jeden podobny mini-przykład z odpowiedzią.' : 'Explain kindly why the correct answer is right and what may have led to the child’s answer (including any spelling slip). Then give one similar mini example with its answer.'}`;
    return AI.call([{ role: 'user', content: msg }], { prog: progOf(ctx), onText, explainIn });
  };
  AI.reteach = (skill, onText, explainIn) => {
    const l = LA.index.lessons[skill] || LA.index.chapters[skill];
    const prog = LA.progOfKey(skill), pl = prog === 'pl';
    const recent = S.P().mistakes.filter((m) => m.skill === skill).slice(-5).map((m) => `Q: ${m.q} | said: ${m.given} | answer: ${m.correct}`).join('\n');
    const msg = `${lessonContext(l)}\n\n${pl ? 'Dziecku trudno idzie temat' : 'The child is finding this hard'}: "${LA.skillLabel(skill)}".${recent ? '\n' + (pl ? 'Ostatnie błędy' : 'Recent mistakes') + ':\n' + recent : ''}\n${pl ? 'Wytłumacz to jeszcze raz, prościej i inaczej niż w lekcji: przykład z życia, 2 rozwiązane przykłady krok po kroku, a na końcu jedno zadanie do samodzielnego rozwiązania (odpowiedź po słowie „Odpowiedź:”).' : 'Teach it again in a different, simpler way than the lesson: a real-life example, 2 worked examples step by step, then one practice question (put its answer at the very end after "Answer:").'}`;
    return AI.call([{ role: 'user', content: msg }], { prog, onText, explainIn });
  };
  AI.hint = (q, ctx, onText) => {
    const pl = progOf(ctx) === 'pl';
    const msg = `${lessonContext(ctx)}\n\n${pl ? 'Dziecko prosi o podpowiedź do' : 'The child asked for a hint on'}: "${U.plain(q.q)}"${q.type === 'mc' ? `\n${q.options.join(' | ')}` : ''}\n${pl ? 'Daj JEDNĄ krótką wskazówkę (1–3 zdania), NIE zdradzając odpowiedzi.' : 'Give ONE short hint (1–3 sentences) WITHOUT giving the answer away.'}`;
    return AI.call([{ role: 'user', content: msg }], { prog: progOf(ctx), tier: 'quick', onText });
  };
  AI.explainLesson = (lesson, onText, explainIn) => {
    const pl = LA.progOfKey(lesson.key) === 'pl';
    const msg = `${lessonContext(lesson)}\n\n${pl ? 'Wyjaśnij tę lekcję prosto, jakbyś mówiła do dziecka, z jednym przykładem.' : 'Explain this lesson simply, as if talking to the child, with one example.'}`;
    return AI.call([{ role: 'user', content: msg }], { prog: LA.progOfKey(lesson.key), onText, explainIn, cache: true });
  };
  AI.chat = (history, ctx, onText, explainIn) => AI.call(history.slice(-12).map((m) => ({ role: m.role, content: m.content })), { prog: progOf(ctx), system: lessonContext(ctx), onText, explainIn, tier: 'default' });

  AI.writingFeedback = (prompt, text, checklist, prog, onText) => {
    const pl = prog === 'pl';
    const msg = pl
      ? `Dziecko napisało tekst do zadania: "${U.plain(prompt)}"\nWymagania: ${checklist.join('; ') || 'poprawne zdania'}.\n\n--- tekst dziecka ---\n${text}\n--- koniec ---\n\nDaj informację zwrotną jak dobra nauczycielka: 2 konkretne pochwały („Gwiazdki”), 1–2 rzeczy do poprawy z krótkim przykładem („Życzenie”) i do 5 poprawek ortograficznych lub interpunkcyjnych (błędnie → poprawnie). Nagłówki: Gwiazdki, Życzenie, Poprawki.`
      : `The child wrote this for the task: "${U.plain(prompt)}"\nThe task asks for: ${checklist.join('; ') || 'clear sentences'}.\n\n--- child's writing ---\n${text}\n--- end ---\n\nGive teacher feedback: 2 specific things done well ("Stars"), 1–2 things to improve with a short example ("Wish"), and up to 5 spelling or punctuation fixes (wrong → right). Use the headings Stars, Wish, Fix-ups.`;
    return AI.call([{ role: 'user', content: msg }], { prog, onText });
  };

  AI.generatePractice = async (skill, n, stretch) => {
    n = Math.min(n || 5, 8);
    const l = LA.index.lessons[skill] || LA.index.chapters[skill];
    const prog = LA.progOfKey(skill), pl = prog === 'pl';
    const recent = S.P().mistakes.filter((m) => m.skill === skill).slice(-5).map((m) => `- ${m.q} (said ${m.given}; answer ${m.correct})`).join('\n');
    const msg = `${lessonContext(l)}\n${recent ? 'Recent mistakes:\n' + recent : ''}\n\nWrite ${n} NEW ${pl ? 'Polish-language' : 'English-language'} practice questions on "${LA.skillLabel(skill)}" for this child${stretch ? ', a little ABOVE year level (challenging but fair)' : ', easier first then building up, targeting the mistakes'}.\nReply with ONLY a JSON array. Each item is either {"type":"mc","q":"question","options":["a","b","c","d"],"answer":<index 0-3>,"explain":"1-2 sentences"} or {"type":"input","q":"question","answer":"short exact answer","explain":"…"}. Use multiple choice for wordy answers. Every question must be answerable from its text alone (no pictures).`;
    const arr = await AI.call([{ role: 'user', content: msg }], { prog, json: true, maxTokens: 2500 });
    const qs = AI.parseQuestions(arr, n, skill, stretch);
    if (!qs.length) throw new Error(pl ? 'Pytania od asystenta nie dotarły poprawnie.' : 'The AI questions did not come through properly.');
    return qs;
  };
  AI.parseQuestions = (arr, n, skill, stretch) => {
    if (typeof arr === 'string') {
      const s = arr.indexOf('['), e = arr.lastIndexOf(']');
      if (s < 0 || e < s) return [];
      try { arr = JSON.parse(arr.slice(s, e + 1)); } catch (err) { return []; }
    }
    if (!Array.isArray(arr)) return [];
    const out = [];
    for (const it of arr) {
      if (!it || typeof it.q !== 'string' || it.q.length > 600) continue;
      if (it.type === 'mc') {
        if (!Array.isArray(it.options) || it.options.length < 2 || it.options.length > 5) continue;
        const a = Number(it.answer);
        if (!Number.isInteger(a) || a < 0 || a >= it.options.length) continue;
        out.push({ type: 'mc', q: it.q, options: it.options.map((o) => String(o).slice(0, 200)), answer: a, explain: String(it.explain || ''), skill, ai: true, stretch: !!stretch });
      } else if (it.type === 'input') {
        if (it.answer == null || String(it.answer).length > 60) continue;
        const ans = String(it.answer);
        out.push({ type: 'input', q: it.q, answer: [ans], numeric: U.parseNum(ans, LA.langOfKey(skill)) != null, explain: String(it.explain || ''), skill, ai: true, stretch: !!stretch });
      }
    }
    return LA.expand(out.slice(0, n), skill);
  };

  /* Parent advice: below / on / above par with a plan */
  AI.parentAdvice = (summaryText, onText) => {
    const msg = `${summaryText}\n\nUsing ONLY this data, write:\n1. **Overall** — for each programme, say clearly whether the child is working BELOW PAR, ON PAR or ABOVE PAR for their grade, and why (one or two sentences).\n2. **Strengths** (2–3 bullets).\n3. **Needs work** — name the specific misconceptions you see in the mistakes.\n4. **How to improve** — 4–6 concrete actions for the coming week, including short offline activities the parent can do, and how to push slightly above grade level where the child is ready.\nUnder 320 words.`;
    return AI.call([{ role: 'user', content: msg }], { parent: true, onText, tier: 'complex' });
  };

  /* ---------- handwriting reading ---------- */
  AI.readHandwriting = async (blob, opts) => {
    opts = opts || {};
    const prog = opts.prog || LA.state.prog;
    const pl = prog === 'pl';
    const samples = (opts.samples || []).slice(-3);
    const images = samples.map((s) => s.blob).concat([blob]);
    const intro = samples.length
      ? `${pl ? 'Pierwsze' : 'The first'} ${samples.length} ${pl ? 'obraz(y) to wcześniejsze próbki pisma tego dziecka z poprawnym odczytem' : 'image(s) are earlier samples of this child’s handwriting with the correct reading'}: ${samples.map((s, i) => `(${i + 1}) "${s.text}"`).join(', ')}. ${pl ? 'Ostatni obraz to nowa odpowiedź do odczytania.' : 'The LAST image is the new answer to read.'}`
      : (pl ? 'Na obrazie jest odręczna odpowiedź dziecka.' : 'The image shows a child’s handwritten answer.');
    const msg = `${intro}\n${opts.question ? (pl ? 'Pytanie było: ' : 'The question was: ') + U.plain(opts.question) + '\n' : ''}${pl ? 'Przepisz DOKŁADNIE to, co dziecko napisało — razem z błędami ortograficznymi (nie poprawiaj!). Pismo dziecka bywa niewyraźne: jeśli litera jest niepewna, wybierz najbardziej prawdopodobną w kontekście.' : 'Transcribe EXACTLY what the child wrote, keeping any spelling mistakes (do not correct them). Children’s letters can be unclear: if a letter is uncertain, pick the most likely one in context.'}\nReply with only JSON: {"text": "exact transcription", "confidence": 0-1, "spelling": [{"wrong": "...", "right": "..."}], "note": "one short sentence for the child about neatness or letter formation, or empty"}`;
    const res = await AI.call([{ role: 'user', content: msg }], { prog, images, json: true, tier: 'default' });
    if (!res || typeof res.text !== 'string') throw new Error(pl ? 'Nie udało się odczytać pisma.' : 'Could not read the handwriting.');
    return { text: res.text.trim(), confidence: +res.confidence || 0, spelling: Array.isArray(res.spelling) ? res.spelling.slice(0, 8) : [], note: String(res.note || '') };
  };
})();

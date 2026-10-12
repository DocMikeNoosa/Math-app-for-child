const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..') + '/';
const html = fs.readFileSync(root + 'index.html', 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.includes('/ui/'));
const store = {};
const ctx = { window: {}, console, localStorage: { getItem: k => store[k] || null, setItem: (k, v) => store[k] = v, removeItem: k => delete store[k] }, setTimeout, clearTimeout, Date, Math, JSON };
ctx.window = ctx; vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(root + s, 'utf8'), ctx, { filename: s });
const LA = ctx.LA, U = LA.U;
let errors = [], warnings = [], qcount = 0;
const keys = new Set();
function checkQ(q, where) {
  qcount++;
  const txt = JSON.stringify([q.q, q.explain, q.options, q.answer]);
  if (/undefined|NaN|\[object/.test(txt)) errors.push(`${where}: bad text ${txt.slice(0,200)}`);
  if (!q.q) errors.push(`${where}: missing q`);
  if (q.type === 'mc') {
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${where}: options ${q.options}`);
    if (!(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${where}: answer idx ${q.answer} for ${q.q}`);
    if (new Set(q.options.map(String)).size !== q.options.length) errors.push(`${where}: duplicate options ${JSON.stringify(q.options)} for ${q.q}`);
    if (!U.checkAnswer(q, q.answer)) errors.push(`${where}: self check failed`);
    if (U.checkAnswer(q, (q.answer + 1) % q.options.length)) errors.push(`${where}: wrong option accepted`);
  } else if (q.type === 'input') {
    const acc = Array.isArray(q.answer) ? q.answer : [q.answer];
    if (!acc.length || acc.some(a => a === '' || a == null)) errors.push(`${where}: empty answer`);
    for (const a of acc) { const g = typeof a === 'number' ? String(+a.toFixed(6)) : String(a); if (!U.checkAnswer(q, g)) errors.push(`${where}: self-check failed: "${g}" for ${q.q} (answer ${JSON.stringify(q.answer)})`); }
    if (U.checkAnswer(q, 'zzz') ) errors.push(`${where}: accepts garbage`);
  } else if (q.type === 'write') {
  } else errors.push(`${where}: unknown type ${q.type}`);
  if (q.type !== 'write' && !q.explain) warnings.push(`${where}: no explanation: ${q.q.slice(0,60)}`);
}
let totals = {};
for (const y of [3, 4]) {
  const subs = LA.curriculum[y].subjects;
  totals[y] = { subjects: subs.length, chapters: 0, lessons: 0 };
  for (const s of subs) {
    for (const ch of s.chapters) {
      totals[y].chapters++;
      if (keys.has(ch.key)) errors.push('dup key ' + ch.key); keys.add(ch.key);
      if (!ch.term) warnings.push(ch.key + ' no term');
      for (const l of ch.lessons) {
        totals[y].lessons++;
        if (keys.has(l.key)) errors.push('dup key ' + l.key); keys.add(l.key);
        if (!l.practice || !l.practice.length) warnings.push(l.key + ' no practice');
        (l.practice || []).forEach(p => { if (p.gen && !LA.gens[p.gen]) errors.push(l.key + ' unknown gen ' + p.gen); });
        for (const b of l.blocks) { if (!['read','example','tip','listen','activity','vocab','visual'].includes(b.type)) errors.push(l.key + ' bad block ' + b.type); if (/undefined/.test(b.text||'')) errors.push(l.key+' block undefined'); }
        if (l.practice.some(p => p.listen) && !l.blocks.some(b => b.type === 'listen')) errors.push(l.key + ' listen q without listen block');
        for (let i = 0; i < 25; i++) LA.lessonPractice(l).forEach(q => checkQ(q, l.key));
      }
      (ch.quiz.items || []).forEach(p => { if (p.gen && !LA.gens[p.gen]) errors.push(ch.key + ' unknown gen ' + p.gen); if (p.lesson && !ch.lessons.some(l=>l.id===p.lesson)) errors.push(ch.key+' bad lesson ref'); });
      let minLen = 99;
      for (let i = 0; i < 25; i++) { const qz = LA.chapterQuiz(ch); minLen = Math.min(minLen, qz.length); qz.forEach(q => { checkQ(q, ch.key + ' quiz'); if (q.type==='write') errors.push(ch.key+' write in quiz'); if (!q.skill) errors.push(ch.key+' quiz q no skill'); }); }
      if (minLen < 4) warnings.push(`${ch.key}: quiz only ${minLen} questions`);
      const sp = LA.skillPractice(ch.key, 6); if (sp.length < 3) warnings.push(`${ch.key}: skillPractice only ${sp.length}`);
      for (const l of ch.lessons) { const lp = LA.skillPractice(l.key, 6); if (lp.length < 2) warnings.push(`${l.key}: lesson skillPractice only ${lp.length}`); }
    }
  }
}
// extra checks on answer parsing
const t = (q, g, exp) => { const r = U.checkAnswer(q, g); if (r !== exp) errors.push(`parse: ${JSON.stringify(q.answer)} given ${g} expected ${exp}`); };
t({ type: 'input', numeric: true, answer: 3.45 }, '$3.45', true);
t({ type: 'input', numeric: true, answer: 3.45 }, '3.45', true);
t({ type: 'input', numeric: true, answer: 0.45 }, '45c', true);
t({ type: 'input', numeric: true, answer: 1300 }, '1,300', true);
t({ type: 'input', numeric: true, answer: 1300 }, '1 300', true);
t({ type: 'input', numeric: true, answer: 120 }, '120 cm', true);
t({ type: 'input', numeric: true, answer: 120 }, '12', false);
t({ type: 'input', check: 'time', answer: ['4:05'] }, '4.05', true);
t({ type: 'input', check: 'time', answer: ['4:05'] }, '4:05 pm', true);
t({ type: 'input', check: 'time', answer: ['4:05'] }, '4:50', false);
t({ type: 'input', check: 'fraction', answer: ['3/4'] }, '3 / 4', true);
t({ type: 'input', answer: ["don't"] }, 'don’t', true);
t({ type: 'input', answer: ['I live in Brisbane.'] }, 'I live in Brisbane', true);
t({ type: 'input', answer: ['B3', 'b3'] }, 'b3', true);
t({ type: 'input', numeric: true, answer: 7 }, 'seven', true);
console.log(JSON.stringify(totals), 'questions checked:', qcount);
console.log('ERRORS', errors.length); console.log([...new Set(errors)].slice(0, 40).join('\n'));
console.log('WARNINGS', warnings.length); console.log([...new Set(warnings)].slice(0, 40).join('\n'));

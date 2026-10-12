// Content validator: loads every curriculum file without a browser and expands every lesson, homework, quiz, challenge and exam.
// Run: node tests/validate.js [au3|au4|pl3|pl4]
// Loads core + content scripts (no UI) into a fake window and validates every lesson/quiz/challenge.
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = path.join(__dirname, '..') + '/';
const html = fs.readFileSync(ROOT + 'index.html', 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((s) => !s.includes('/ui/'));
const warns = [];
const store = {};
const ctx = { console: { info() {}, log() {}, warn: (...a) => warns.push(a.join(' ')), error: (...a) => warns.push('ERR ' + a.join(' ')) }, localStorage: { getItem: (k) => store[k] || null, setItem: (k, v) => (store[k] = String(v)), removeItem: (k) => delete store[k] }, setTimeout, clearTimeout, navigator: { userAgent: 'node' }, document: { addEventListener() {}, createElement: () => ({ getContext: () => null }) }, addEventListener() {}, speechSynthesis: null, Math, Date, JSON };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
for (const s of srcs) vm.runInContext(fs.readFileSync(ROOT + s, 'utf8'), ctx, { filename: s });
module.exports = { LA: ctx.LA, warns };
if (require.main === module) {
  const LA = ctx.LA; const errs = [];
  const check = (q, where) => {
    if (!q.q && !q.dictation) errs.push(where + ': empty question');
    if (q.type === 'mc') { if (!Array.isArray(q.options) || q.answer == null || q.answer < 0 || q.answer >= q.options.length) errs.push(where + ': bad mc answer ' + q.q); if (new Set(q.options).size !== q.options.length) errs.push(where + ': duplicate options ' + q.q + ' ' + JSON.stringify(q.options)); }
    if (q.type === 'input' && (q.answer == null || (Array.isArray(q.answer) && !q.answer.length))) errs.push(where + ': no answer ' + q.q);
    if (q.listen) { const l = LA.index.lessons[q.skill]; if (!l || !l.blocks.some((b) => b.type === 'listen')) errs.push(where + ': listen q without listen block'); }
  };
  const want = process.argv[2] || '';
  let lessons = 0;
  for (const ck of Object.keys(LA.curriculum)) {
    if (want && ck !== want) continue;
    const subs = LA.curriculum[ck].subjects; let tot = 0;
    for (const s of subs) {
      let n = 0;
      for (const ch of s.chapters) {
        for (let r = 0; r < 3; r++) {
          ch.lessons.forEach((l) => { LA.lessonPractice(l).forEach((q) => check(q, l.key)); LA.lessonHomework(l, 1).forEach((q) => check(q, l.key + ' hw')); });
          LA.chapterQuiz(ch).forEach((q) => check(q, ch.key + ' quiz'));
          if (LA.hasChallenge(ch)) LA.chapterChallenge(ch).forEach((q) => check(q, ch.key + ' challenge'));
        }
        if (LA.chapterQuiz(ch).length < 5) errs.push(ch.key + ': quiz only ' + LA.chapterQuiz(ch).length);
        n += ch.lessons.length;
      }
      LA.subjectExam(s).forEach((q) => check(q, s.key + ' exam'));
      tot += n; console.log(ck, s.id.padEnd(12), 'chapters', s.chapters.length, 'lessons', n);
    }
    console.log(ck, 'TOTAL lessons', tot); lessons += tot;
  }
  const uniq = [...new Set(errs)];
  console.log('errors', uniq.length); uniq.slice(0, 40).forEach((e) => console.log('  ' + e));
  console.log('warnings', [...new Set(warns)].slice(0, 20));
  process.exit(uniq.length ? 1 : 0);
}

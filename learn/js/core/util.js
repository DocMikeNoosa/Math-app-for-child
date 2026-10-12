/* Shared helpers. Everything lives on window.LA so the app runs from file:// with plain <script> tags. */
(function () {
  'use strict';
  const LA = (window.LA = window.LA || {});

  const U = {};

  U.randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  U.sample = (arr, n) => U.shuffle(arr).slice(0, n);
  U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  U.esc = (s) =>
    String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  /* Tiny, safe formatter for lesson text: escapes first, then applies a few markdown-like rules.
     ## heading | - bullet | 1. numbered | > tip | **bold** | *italic* | blank line = new paragraph */
  U.fmt = (text) => {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const out = [];
    let list = null; // 'ul' | 'ol'
    let para = [];
    const inline = (s) =>
      U.esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/__(.+?)__/g, '<u>$1</u>');
    const flushPara = () => {
      if (para.length) out.push('<p>' + para.map(inline).join(' ') + '</p>');
      para = [];
    };
    const flushList = () => {
      if (list) out.push('</' + list + '>');
      list = null;
    };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushPara(); flushList(); continue; }
      let m;
      if ((m = line.match(/^##\s+(.*)/))) { flushPara(); flushList(); out.push('<h3>' + inline(m[1]) + '</h3>'); continue; }
      if ((m = line.match(/^>\s?(.*)/))) { flushPara(); flushList(); out.push('<div class="tipbox">' + inline(m[1]) + '</div>'); continue; }
      if ((m = line.match(/^[-•]\s+(.*)/))) {
        flushPara();
        if (list !== 'ul') { flushList(); out.push('<ul>'); list = 'ul'; }
        out.push('<li>' + inline(m[1]) + '</li>');
        continue;
      }
      if ((m = line.match(/^\d+[.)]\s+(.*)/))) {
        flushPara();
        if (list !== 'ol') { flushList(); out.push('<ol>'); list = 'ol'; }
        out.push('<li>' + inline(m[1]) + '</li>');
        continue;
      }
      flushList();
      para.push(line);
    }
    flushPara();
    flushList();
    return out.join('\n');
  };

  /* Plain text version (for text-to-speech) */
  U.plain = (text) =>
    String(text || '')
      .replace(/^##\s+/gm, '')
      .replace(/^>\s?/gm, 'Tip: ')
      .replace(/^[-•]\s+/gm, '')
      .replace(/\*\*|__|\*/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\.\s*\./g, '.');

  /* ---------- Answer checking ---------- */
  const NUMWORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

  U.normText = (s) =>
    String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/^[\s"']+|[\s"'.!?,;:]+$/g, '')
      .trim();

  /* Parse a numeric-ish answer: "1,234" "$4.50" "4.5" "1/2" "1 1/2" "seven" "45c" */
  U.parseNum = (s) => {
    let t = String(s == null ? '' : s).toLowerCase().trim();
    if (!t) return null;
    if (NUMWORDS[t] != null) return NUMWORDS[t];
    let cents = false;
    if (/^\d+\s*(c|cents?)$/.test(t)) { cents = true; }
    t = t.replace(/[$,\s]|dollars?|cents?|c$/g, (m) => (m === ' ' ? ' ' : ''));
    t = t.replace(/(cm|mm|km|kg|ml|m|g|l|°c|degrees|minutes|mins|min|hours|hrs|h)$/g, '').trim();
    let m;
    if ((m = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + +m[2] / +m[3];
    if ((m = t.match(/^(-?\d+)\/(\d+)$/))) return +m[2] === 0 ? null : +m[1] / +m[2];
    t = t.replace(/\s+/g, '');
    if (/^-?\d*\.?\d+$/.test(t)) return cents ? +t / 100 : +t;
    return null;
  };

  /* Times like 4:05, 4.05, 405 -> minutes since 00:00 (12 h clock tolerant) */
  U.parseTime = (s) => {
    const t = String(s || '').toLowerCase().replace(/\s+/g, '');
    const m = t.match(/^(\d{1,2})[:.](\d{2})(am|pm)?$/);
    if (!m) return null;
    let h = +m[1];
    const min = +m[2];
    if (min > 59 || h > 23) return null;
    if (m[3] === 'pm' && h < 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    return h * 60 + min;
  };

  /* check(question, given) -> boolean. Question answer may be string | number | array of accepted. */
  U.checkAnswer = (q, given) => {
    if (q.type === 'mc') return Number(given) === q.answer;
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    const g = String(given == null ? '' : given).trim();
    if (!g) return false;
    for (const a of accepted) {
      if (q.check === 'time') {
        const ga = U.parseTime(g), aa = U.parseTime(String(a));
        if (ga != null && aa != null && (ga === aa || ga % 720 === aa % 720)) return true;
        continue;
      }
      if (typeof a === 'number' || q.numeric) {
        const gn = U.parseNum(g), an = typeof a === 'number' ? a : U.parseNum(a);
        if (gn != null && an != null && Math.abs(gn - an) < 1e-9) return true;
        // fractions must match as written form too e.g. 2/4 vs 1/2 when q.exactFraction
        continue;
      }
      if (q.check === 'fraction') {
        if (U.normText(g).replace(/\s/g, '') === U.normText(a).replace(/\s/g, '')) return true;
        continue;
      }
      if (U.normText(g) === U.normText(a)) return true;
    }
    return false;
  };

  U.fmtMoney = (cents) => '$' + (cents / 100).toFixed(2);
  U.fmtNum = (n) => Number(n).toLocaleString('en-AU');

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  /* Australian convention: "three thousand, four hundred and twelve" */
  U.numberToWords = (n) => {
    n = Math.floor(n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) {
      const r = n % 100;
      return ONES[Math.floor(n / 100)] + ' hundred' + (r ? ' and ' + U.numberToWords(r) : '');
    }
    if (n < 1000000) {
      const th = Math.floor(n / 1000), r = n % 1000;
      let s = U.numberToWords(th) + ' thousand';
      if (r) s += r < 100 ? ' and ' + U.numberToWords(r) : ', ' + U.numberToWords(r);
      return s;
    }
    return String(n);
  };

  U.todayKey = (d) => {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  U.daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);

  /* Approximate Australian school term from date (terms vary slightly by state). */
  U.schoolTerm = (d) => {
    d = d || new Date();
    const m = d.getMonth(); // 0-based
    const day = d.getDate();
    if (m === 0) return { term: 1, label: 'Summer holidays — Term 1 starts soon' };
    if (m <= 2 || (m === 3 && day < 10)) return { term: 1, label: 'Term 1' };
    if (m <= 5) return { term: 2, label: 'Term 2' };
    if (m <= 8) return { term: 3, label: 'Term 3' };
    return { term: 4, label: 'Term 4' };
  };
  /* Fraction of the school year elapsed (Feb 1 → Dec 15), clamped 0..1 */
  U.yearProgress = (d) => {
    d = d || new Date();
    const y = d.getFullYear();
    const start = new Date(y, 1, 1), end = new Date(y, 11, 15);
    return Math.max(0, Math.min(1, (d - start) / (end - start)));
  };

  U.debounce = (fn, ms) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  LA.U = U;
})();

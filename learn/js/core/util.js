/* Shared helpers. Everything lives on window.LA so the app runs from plain <script> tags (file://, GitHub Pages or a claude.ai artifact). */
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
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  U.esc = (s) =>
    String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* Tiny, safe formatter: escapes first, then a few markdown-like rules.
     ## heading | - bullet | 1. numbered | > tip | **bold** | *italic* | __underline__ | blank line = new paragraph */
  U.fmt = (text) => {
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const out = [];
    let list = null;
    let para = [];
    const inline = (s) =>
      U.esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
        .replace(/__(.+?)__/g, '<u>$1</u>');
    const flushPara = () => { if (para.length) out.push('<p>' + para.map(inline).join(' ') + '</p>'); para = []; };
    const flushList = () => { if (list) out.push('</' + list + '>'); list = null; };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushPara(); flushList(); continue; }
      let m;
      if ((m = line.match(/^##\s+(.*)/))) { flushPara(); flushList(); out.push('<h3>' + inline(m[1]) + '</h3>'); continue; }
      if ((m = line.match(/^>\s?(.*)/))) { flushPara(); flushList(); out.push('<div class="tipbox">' + inline(m[1]) + '</div>'); continue; }
      if ((m = line.match(/^[-•]\s+(.*)/))) { flushPara(); if (list !== 'ul') { flushList(); out.push('<ul>'); list = 'ul'; } out.push('<li>' + inline(m[1]) + '</li>'); continue; }
      if ((m = line.match(/^\d+[.)]\s+(.*)/))) { flushPara(); if (list !== 'ol') { flushList(); out.push('<ol>'); list = 'ol'; } out.push('<li>' + inline(m[1]) + '</li>'); continue; }
      flushList();
      para.push(line);
    }
    flushPara();
    flushList();
    return out.join('\n');
  };
  U.fmtInline = (text) => U.fmt(text).replace(/^<p>|<\/p>$/g, '');

  /* Plain text (for text-to-speech) */
  U.plain = (text) =>
    String(text || '')
      .replace(/^##\s+/gm, '')
      .replace(/^>\s?/gm, '')
      .replace(/^[-•]\s+/gm, '')
      .replace(/\*\*|__|\*/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\.\s*\./g, '.');

  /* ---------- numbers ---------- */
  U.fmtNum = (n, lang) => {
    n = Number(n);
    if (lang === 'pl') {
      const neg = n < 0;
      const [i, d] = String(Math.abs(n)).split('.');
      const int = Math.abs(n) >= 10000 ? i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : i;
      return (neg ? '−' : '') + int + (d ? ',' + d : '');
    }
    return n.toLocaleString('en-AU', { maximumFractionDigits: 6 });
  };
  U.fmtMoney = (cents, lang) => {
    if (lang === 'pl') return (cents / 100).toFixed(2).replace('.', ',') + ' zł';
    return '$' + (cents / 100).toFixed(2);
  };

  const NUMWORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, jeden: 1, dwa: 2, trzy: 3, cztery: 4, pięć: 5, sześć: 6, siedem: 7, osiem: 8, dziewięć: 9, dziesięć: 10 };

  U.normText = (s) =>
    String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      .replace(/[“”„]/g, '"')
      .replace(/\s+/g, ' ')
      .replace(/^[\s"']+|[\s"'.!?,;:]+$/g, '')
      .trim();

  /* Parse a numeric-ish answer. lang 'pl' treats the comma as a decimal mark ("2,5") and spaces as thousands. */
  U.parseNum = (s, lang) => {
    let t = String(s == null ? '' : s).toLowerCase().trim().replace(/ /g, ' ').replace(/−/g, '-');
    if (!t) return null;
    if (NUMWORDS[t] != null) return NUMWORDS[t];
    let cents = /^\d+\s*(c|cents?|gr|groszy|grosze)$/.test(t);
    t = t.replace(/\$|dollars?|cents?|zł|złotych|złote|zl|groszy|grosze|gr\b/g, '');
    t = t.replace(/(cm²|cm2|cm|mm|km|kg|dag|ml|m²|m|g|l|°c|degrees|stopni|minutes|minut|mins|min|hours|godzin|godz|hrs|h|c)$/g, '').trim();
    let m;
    if (lang === 'pl') {
      // "1 234,5" -> 1234.5 ; also accept "1234.5"
      if ((m = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + +m[2] / +m[3];
      t = t.replace(/(\d)\s+(?=\d{3}\b)/g, '$1').replace(',', '.');
    } else {
      if ((m = t.match(/^(-?\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + +m[2] / +m[3];
      t = t.replace(/(\d),(?=\d{3}\b)/g, '$1').replace(/(\d)\s+(?=\d{3}\b)/g, '$1');
    }
    if ((m = t.match(/^(-?\d+)\/(\d+)$/))) return +m[2] === 0 ? null : +m[1] / +m[2];
    t = t.replace(/\s+/g, '');
    if (/^-?\d*\.?\d+$/.test(t)) return cents ? +t / 100 : +t;
    return null;
  };

  /* Times like 4:05, 4.05, 16:05 -> minutes since 00:00 */
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

  /* Edit distance — used to spot spelling slips */
  U.lev = (a, b) => {
    a = String(a); b = String(b);
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  };

  /* check(question, given) -> boolean */
  U.checkAnswer = (q, given) => {
    if (q.type === 'mc') return Number(given) === q.answer;
    const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
    const g = String(given == null ? '' : given).trim();
    if (!g) return false;
    for (const a of accepted) {
      if (q.check === 'time') {
        const ga = U.parseTime(g), aa = U.parseTime(String(a));
        if (ga != null && aa != null && (ga === aa || (!q.strict24 && ga % 720 === aa % 720))) return true;
        continue;
      }
      if (typeof a === 'number' || q.numeric) {
        const gn = U.parseNum(g, q.lang), an = typeof a === 'number' ? a : U.parseNum(a, q.lang);
        if (gn != null && an != null && Math.abs(gn - an) < 1e-9) return true;
        continue;
      }
      if (q.check === 'fraction') {
        if (U.normText(g).replace(/\s/g, '') === U.normText(a).replace(/\s/g, '')) return true;
        continue;
      }
      if (q.caseSensitive ? g.trim() === String(a).trim() : U.normText(g) === U.normText(a)) return true;
    }
    return false;
  };

  /* Is a wrong typed answer just a spelling slip of the expected word(s)? Returns the expected spelling or null. */
  U.spellingSlip = (q, given) => {
    if (q.type !== 'input' || q.numeric || q.check) return null;
    const g = U.normText(given);
    if (g.length < 3) return null;
    const accepted = (Array.isArray(q.answer) ? q.answer : [q.answer]).map(String);
    for (const a of accepted) {
      const n = U.normText(a);
      if (!/[a-ząćęłńóśźż]/i.test(n)) continue;
      const d = U.lev(g, n);
      if (d > 0 && d <= Math.max(1, Math.min(2, Math.floor(n.length / 4)))) return a;
    }
    return null;
  };

  const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  U.numberToWords = (n) => {
    n = Math.floor(n);
    if (n < 20) return ONES[n];
    if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
    if (n < 1000) { const r = n % 100; return ONES[Math.floor(n / 100)] + ' hundred' + (r ? ' and ' + U.numberToWords(r) : ''); }
    if (n < 1000000) {
      const th = Math.floor(n / 1000), r = n % 1000;
      let s = U.numberToWords(th) + ' thousand';
      if (r) s += r < 100 ? ' and ' + U.numberToWords(r) : ', ' + U.numberToWords(r);
      return s;
    }
    return String(n);
  };

  const PL1 = ['zero', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć', 'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
  const PL10 = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
  const PL100 = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
  const plBelow1000 = (n) => {
    const parts = [];
    if (n >= 100) parts.push(PL100[Math.floor(n / 100)]);
    const r = n % 100;
    if (r >= 20) { parts.push(PL10[Math.floor(r / 10)]); if (r % 10) parts.push(PL1[r % 10]); }
    else if (r > 0) parts.push(PL1[r]);
    return parts.join(' ');
  };
  U.numberToWordsPl = (n) => {
    n = Math.floor(n);
    if (n === 0) return 'zero';
    if (n < 1000) return plBelow1000(n);
    const th = Math.floor(n / 1000), r = n % 1000;
    let w;
    if (th === 1) w = 'tysiąc';
    else {
      const last = th % 10, last2 = th % 100;
      const form = last >= 2 && last <= 4 && !(last2 >= 12 && last2 <= 14) ? 'tysiące' : 'tysięcy';
      w = plBelow1000(th) + ' ' + form;
    }
    return w + (r ? ' ' + plBelow1000(r) : '');
  };

  U.toRoman = (n) => {
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = '';
    for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
    return s;
  };

  U.todayKey = (d) => {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  /* School calendars: Australian year Feb–Dec (4 terms), Polish year Sep–Jun (2 semesters). */
  U.schoolTerm = (prog, d) => {
    d = d || new Date();
    const m = d.getMonth(), day = d.getDate();
    if (prog === 'pl') {
      if (m >= 8 || m === 0) return { term: 1, label: 'I semestr' };
      if (m <= 5) return { term: 2, label: 'II semestr' };
      return { term: 2, label: 'Wakacje' };
    }
    if (m === 0) return { term: 1, label: 'Summer holidays' };
    if (m <= 2 || (m === 3 && day < 10)) return { term: 1, label: 'Term 1' };
    if (m <= 5) return { term: 2, label: 'Term 2' };
    if (m <= 8) return { term: 3, label: 'Term 3' };
    return { term: 4, label: 'Term 4' };
  };
  U.yearProgress = (prog, d) => {
    d = d || new Date();
    const y = d.getFullYear();
    let start, end;
    if (prog === 'pl') {
      start = d.getMonth() >= 8 ? new Date(y, 8, 1) : new Date(y - 1, 8, 1);
      end = new Date(start.getFullYear() + 1, 5, 26);
    } else {
      start = new Date(y, 1, 1);
      end = new Date(y, 11, 15);
    }
    return Math.max(0, Math.min(1, (d - start) / (end - start)));
  };

  U.debounce = (fn, ms) => {
    let t;
    const f = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    f.flush = (...a) => { clearTimeout(t); fn(...a); };
    return f;
  };

  U.safeLS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  LA.U = U;
})();

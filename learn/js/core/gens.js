/* Procedural question generators (bilingual EN/PL). Each takes args (including args.lang) and returns a question.
   They give unlimited fresh practice; LA.STRETCH maps each to harder "above par" arguments. */
(function () {
  'use strict';
  const LA = window.LA;
  const U = LA.U;
  const { randInt: R, pick, shuffle } = U;

  const L = (a) => (en, pl) => (a.lang === 'pl' ? pl : en);
  const Nf = (a) => (n) => U.fmtNum(n, a.lang);
  /* Polish noun form after a number: 1 jabłko, 2–4 jabłka, 5+ jabłek (12–14 take the 'many' form) */
  const plF = (n, one, few, many) => (n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many);
  LA.plF = plF;
  const MUL = (a) => (a.lang === 'pl' ? '·' : '×');
  const DIV = (a) => (a.lang === 'pl' ? ':' : '÷');
  const NAMES_EN = ['Mia', 'Jack', 'Aria', 'Noah', 'Ava', 'Leo', 'Isla', 'Oliver', 'Zara', 'Kai', 'Ruby', 'Lachlan', 'Priya', 'Mei', 'Ahmed', 'Charlotte', 'Jarrah', 'Sienna', 'Hamish', 'Tosia'];
  const NAMES_PL = ['Ola', 'Kuba', 'Zosia', 'Antek', 'Hania', 'Staś', 'Lena', 'Franek', 'Maja', 'Tymek', 'Julka', 'Igor', 'Tosia', 'Wojtek', 'Ania', 'Bartek'];
  const name = (a) => pick(a.lang === 'pl' ? NAMES_PL : NAMES_EN);
  const inputNum = (q, ans, explain, extra) => Object.assign({ type: 'input', numeric: true, q, answer: ans, explain }, extra || {});
  const TF = (a) => (a.lang === 'pl' ? ['Prawda', 'Fałsz'] : ['True', 'False']);

  /* ---------- SVG helpers ---------- */
  const SVG = (LA.SVG = {});
  SVG.clock = (h, m) => {
    const cx = 90, cy = 90, r = 80;
    let ticks = '';
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * 2 * Math.PI;
      const r1 = i % 5 === 0 ? r - 10 : r - 5;
      ticks += `<line x1="${(cx + r1 * Math.sin(a)).toFixed(1)}" y1="${(cy - r1 * Math.cos(a)).toFixed(1)}" x2="${(cx + r * Math.sin(a)).toFixed(1)}" y2="${(cy - r * Math.cos(a)).toFixed(1)}" stroke="currentColor" stroke-width="${i % 5 === 0 ? 2.5 : 1}"/>`;
    }
    let nums = '';
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * 2 * Math.PI;
      nums += `<text x="${(cx + (r - 22) * Math.sin(a)).toFixed(1)}" y="${(cy - (r - 22) * Math.cos(a) + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor">${i}</text>`;
    }
    const ma = (m / 60) * 2 * Math.PI;
    const ha = (((h % 12) + m / 60) / 12) * 2 * Math.PI;
    return `<svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="clock"><circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>${ticks}${nums}
      <line x1="${cx}" y1="${cy}" x2="${(cx + 42 * Math.sin(ha)).toFixed(1)}" y2="${(cy - 42 * Math.cos(ha)).toFixed(1)}" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${(cx + 64 * Math.sin(ma)).toFixed(1)}" y2="${(cy - 64 * Math.cos(ma)).toFixed(1)}" stroke="var(--accent)" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="currentColor"/></svg>`;
  };
  SVG.bars = (labels, values, title, scale) => {
    scale = scale || 1;
    const W = 340, H = 220, left = 40, bottom = 40, top = 24;
    const maxV = Math.max(...values);
    const yMax = Math.ceil(maxV / scale) * scale + scale;
    const bw = (W - left - 10) / labels.length;
    let g = '';
    for (let v = 0; v <= yMax; v += scale) {
      const y = H - bottom - ((H - bottom - top) * v) / yMax;
      g += `<line x1="${left}" x2="${W - 5}" y1="${y}" y2="${y}" stroke="var(--line)" /><text x="${left - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="currentColor">${v}</text>`;
    }
    const colours = ['#5aa9ff', '#3ccf91', '#f6b73c', '#ff8a65', '#a48bff'];
    labels.forEach((lab, i) => {
      const hgt = ((H - bottom - top) * values[i]) / yMax;
      const x = left + i * bw + bw * 0.18;
      g += `<rect x="${x}" y="${H - bottom - hgt}" width="${bw * 0.64}" height="${hgt}" rx="4" fill="${colours[i % colours.length]}"/><text x="${x + bw * 0.32}" y="${H - bottom + 16}" font-size="11" text-anchor="middle" fill="currentColor">${U.esc(lab)}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="column graph"><text x="${W / 2}" y="14" font-size="13" text-anchor="middle" font-weight="700" fill="currentColor">${U.esc(title)}</text>${g}<line x1="${left}" y1="${H - bottom}" x2="${W - 5}" y2="${H - bottom}" stroke="currentColor"/></svg>`;
  };
  SVG.fractionBar = (parts, shaded) => {
    const W = 300, h = 46, w = W / parts;
    let g = '';
    for (let i = 0; i < parts; i++) g += `<rect x="${i * w + 1}" y="1" width="${w - 2}" height="${h}" rx="3" fill="${i < shaded ? '#5aa9ff' : 'var(--surface)'}" stroke="currentColor" stroke-width="2"/>`;
    return `<svg viewBox="0 0 ${W + 2} ${h + 2}" width="100%" style="max-width:${W}px" role="img" aria-label="fraction bar">${g}</svg>`;
  };
  SVG.fractionCircle = (parts, shaded) => {
    const cx = 60, cy = 60, r = 55;
    let g = '';
    for (let i = 0; i < parts; i++) {
      const a1 = (i / parts) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / parts) * 2 * Math.PI - Math.PI / 2;
      const large = a2 - a1 > Math.PI ? 1 : 0;
      g += `<path d="M${cx},${cy} L${(cx + r * Math.cos(a1)).toFixed(2)},${(cy + r * Math.sin(a1)).toFixed(2)} A${r},${r} 0 ${large} 1 ${(cx + r * Math.cos(a2)).toFixed(2)},${(cy + r * Math.sin(a2)).toFixed(2)} Z" fill="${i < shaded ? '#f6b73c' : 'var(--surface)'}" stroke="currentColor" stroke-width="2"/>`;
    }
    return `<svg viewBox="0 0 120 120" width="130" height="130" role="img" aria-label="fraction circle">${g}</svg>`;
  };
  SVG.angle = (deg) => {
    const cx = 30, cy = 120, Lg = 100;
    const a = (deg * Math.PI) / 180;
    const x2 = cx + Lg * Math.cos(a), y2 = cy - Lg * Math.sin(a);
    const rr = 26;
    const arc = deg === 90
      ? `<path d="M${cx + 18},${cy} L${cx + 18},${cy - 18} L${cx},${cy - 18}" fill="none" stroke="var(--accent)" stroke-width="2"/>`
      : `<path d="M${cx + rr},${cy} A${rr},${rr} 0 ${deg > 180 ? 1 : 0} 0 ${(cx + rr * Math.cos(a)).toFixed(2)},${(cy - rr * Math.sin(a)).toFixed(2)}" fill="none" stroke="var(--accent)" stroke-width="2"/>`;
    return `<svg viewBox="-80 0 260 140" width="240" height="130" role="img" aria-label="angle"><line x1="${cx}" y1="${cy}" x2="${cx + Lg}" y2="${cy}" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>${arc}</svg>`;
  };
  SVG.grid = (cells, cols, rows) => {
    const s = 26;
    let g = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g += `<rect x="${c * s + 1}" y="${r * s + 1}" width="${s}" height="${s}" fill="${cells.has(c + ',' + r) ? '#3ccf91' : 'var(--surface)'}" stroke="var(--line-strong)"/>`;
    return `<svg viewBox="0 0 ${cols * s + 2} ${rows * s + 2}" width="${cols * s + 2}" role="img" aria-label="grid">${g}</svg>`;
  };
  SVG.array = (rows, cols) => {
    const s = 22;
    let g = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g += `<circle cx="${c * s + 12}" cy="${r * s + 12}" r="8" fill="#ff8a65"/>`;
    return `<svg viewBox="0 0 ${cols * s + 4} ${rows * s + 4}" width="${cols * s + 4}" role="img" aria-label="array of dots">${g}</svg>`;
  };
  SVG.numberLine = (min, max, step, mark, labelEvery, lang) => {
    const W = 340, left = 15, right = W - 15, y = 40;
    const n = Math.round((max - min) / step);
    let g = `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" stroke="currentColor" stroke-width="2"/>`;
    for (let i = 0; i <= n; i++) {
      const x = left + ((right - left) * i) / n;
      const v = +(min + i * step).toFixed(4);
      g += `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 8}" stroke="currentColor" stroke-width="2"/>`;
      if (labelEvery && i % labelEvery === 0) g += `<text x="${x}" y="${y + 24}" font-size="12" text-anchor="middle" fill="currentColor">${lang === 'pl' ? String(v).replace('.', ',') : v}</text>`;
    }
    if (mark != null) {
      const x = left + ((right - left) * (mark - min)) / (max - min);
      g += `<path d="M${x},${y - 12} l-7,-12 h14 z" fill="var(--danger)"/>`;
    }
    return `<svg viewBox="0 0 ${W} 70" width="100%" style="max-width:${W}px" role="img" aria-label="number line">${g}</svg>`;
  };

  const G = (LA.gens = {});
  const S = LA.STRETCH;
  const PLACES = { en: ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'], pl: ['jedności', 'dziesiątek', 'setek', 'tysięcy', 'dziesiątek tysięcy', 'setek tysięcy'] };

  /* ===== Place value ===== */
  G.placeValue = (a) => {
    const t = L(a), N = Nf(a);
    const min = a.min || 1000, max = a.max || 9999;
    const n = R(min, max), s = String(n);
    const pos = R(0, s.length - 1), digit = s[pos];
    if (digit === '0') return G.placeValue(a);
    const p = s.length - 1 - pos, value = +digit * Math.pow(10, p);
    const place = PLACES[a.lang === 'pl' ? 'pl' : 'en'][p];
    return inputNum(t(`What is the value of the digit **${digit}** in **${N(n)}**?`, `Ile jest warta cyfra **${digit}** w liczbie **${N(n)}**?`), value,
      t(`The ${digit} is in the ${place} place, so it is worth ${digit} × ${N(Math.pow(10, p))} = ${N(value)}.`, `Cyfra ${digit} stoi na miejscu ${place}, więc jest warta ${digit} · ${N(Math.pow(10, p))} = ${N(value)}.`));
  };
  S.placeValue = (a) => ({ min: (a.min || 1000) * 10, max: Math.min(999999, (a.max || 9999) * 10 + 9) });

  G.expanded = (a) => {
    const t = L(a), N = Nf(a);
    const n = R(a.min || 1000, a.max || 9999);
    const parts = String(n).split('').map((d, i, arr) => +d * Math.pow(10, arr.length - 1 - i)).filter((x) => x);
    const hide = R(0, parts.length - 1);
    const shown = parts.map((p, i) => (i === hide ? '___' : N(p))).join(' + ');
    return inputNum(t(`Fill the gap: **${N(n)} = ${shown}**`, `Uzupełnij: **${N(n)} = ${shown}**`), parts[hide],
      t(`Break ${N(n)} into its places: ${parts.map(N).join(' + ')}. The missing part is ${N(parts[hide])}.`, `Rozłóż ${N(n)} na rzędy: ${parts.map(N).join(' + ')}. Brakuje ${N(parts[hide])}.`));
  };
  S.expanded = S.placeValue;

  G.wordsToNum = (a) => {
    const t = L(a), N = Nf(a);
    const n = R(a.min || 1000, a.max || 9999);
    const w = a.lang === 'pl' ? U.numberToWordsPl(n) : U.numberToWords(n);
    return inputNum(t(`Write this number in numerals: **${w}**`, `Zapisz cyframi: **${w}**`), n, t(`${w} is written ${N(n)}.`, `${w} zapisujemy: ${N(n)}.`));
  };
  S.wordsToNum = S.placeValue;

  G.numToWords = (a) => {
    const t = L(a), N = Nf(a);
    const n = R(a.min || 100, a.max || 9999);
    const W = (x) => (a.lang === 'pl' ? U.numberToWordsPl(x) : U.numberToWords(x));
    const right = W(n);
    const wrong = new Set();
    while (wrong.size < 3) { const v = n + pick([1, 10, 100, 1000, -1, -10, -100]); if (v > 0 && v !== n) wrong.add(W(v)); }
    const opts = shuffle([right, ...wrong]);
    return { type: 'mc', q: t(`Which words match **${N(n)}**?`, `Który zapis słowny pasuje do liczby **${N(n)}**?`), options: opts, answer: opts.indexOf(right), explain: t(`${N(n)} is said "${right}".`, `${N(n)} czytamy: „${right}”.`) };
  };
  S.numToWords = S.placeValue;

  G.compare = (a) => {
    const t = L(a), N = Nf(a);
    const min = a.min || 100, max = a.max || 9999;
    const x = R(min, max);
    const y = Math.random() < 0.15 ? x : R(Math.max(min, x - 300), Math.min(max, x + 300));
    const ans = x > y ? 0 : x < y ? 1 : 2;
    const words = t(['greater than', 'less than', 'equal to'], ['większe od', 'mniejsze od', 'równe'])[ans];
    return { type: 'mc', fixed: true, q: t(`Which symbol makes this true?  **${N(x)} ☐ ${N(y)}**`, `Wstaw znak:  **${N(x)} ☐ ${N(y)}**`), options: ['>', '<', '='], answer: ans,
      explain: t(`Compare from the biggest place first. ${N(x)} is ${words} ${N(y)}. The open mouth of > or < faces the bigger number.`, `Porównuj od najwyższego rzędu. ${N(x)} jest ${words} ${N(y)}. Dzióbek znaku wskazuje mniejszą liczbę.`) };
  };
  S.compare = S.placeValue;

  G.largest = (a) => {
    const t = L(a), N = Nf(a);
    const min = a.min || 1000, max = a.max || 9999;
    const base = R(min, Math.max(min, max - 1000));
    const set = new Set();
    while (set.size < 4) set.add(base + pick([R(0, 9), R(10, 99), R(100, 999)]));
    const arr = [...set];
    const smallest = Math.random() < 0.5;
    const target = smallest ? Math.min(...arr) : Math.max(...arr);
    return { type: 'mc', q: t(`Which number is the **${smallest ? 'smallest' : 'largest'}**?`, `Która liczba jest **${smallest ? 'najmniejsza' : 'największa'}**?`), options: arr.map(N), answer: arr.indexOf(target),
      explain: t(`Compare thousands, then hundreds, then tens, then ones. The ${smallest ? 'smallest' : 'largest'} is ${N(target)}.`, `Porównaj tysiące, potem setki, dziesiątki i jedności. ${smallest ? 'Najmniejsza' : 'Największa'} jest ${N(target)}.`) };
  };
  S.largest = S.placeValue;

  G.round = (a) => {
    const t = L(a), N = Nf(a);
    const to = a.to || 10;
    const n = R(a.min || 11, a.max || 999);
    const r = Math.round(n / to) * to;
    const placeEn = { 10: 'ones', 100: 'tens', 1000: 'hundreds', 10000: 'thousands' }[to];
    const placePl = { 10: 'jedności', 100: 'dziesiątek', 1000: 'setek', 10000: 'tysięcy' }[to];
    return inputNum(t(`Round **${N(n)}** to the nearest **${N(to)}**.`, `Zaokrąglij **${N(n)}** do pełnych **${N(to)}**.`), r,
      t(`Look at the ${placeEn} digit. 5 or more rounds up, 4 or less rounds down. ${N(n)} → ${N(r)}.`, `Spójrz na cyfrę ${placePl}. 5 lub więcej — w górę, 4 lub mniej — w dół. ${N(n)} → ${N(r)}.`));
  };
  S.round = (a) => ({ to: Math.min(10000, (a.to || 10) * 10), min: (a.min || 11) * 10, max: (a.max || 999) * 10 });

  /* ===== Addition & subtraction ===== */
  const splitPlaces = (n) => String(n).split('').map((d, i, arr) => +d * Math.pow(10, arr.length - 1 - i)).filter((x) => x);
  function hasCarry(x, y) { while (x || y) { if ((x % 10) + (y % 10) > 9) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; }
  function needsBorrow(x, y) { while (y) { if (x % 10 < y % 10) return true; x = Math.floor(x / 10); y = Math.floor(y / 10); } return false; }

  G.add = (a) => {
    const t = L(a), N = Nf(a);
    const d = a.digits || 2, lo = Math.pow(10, d - 1), hi = Math.pow(10, d) - 1;
    let x, y, guard = 0;
    do { x = R(lo, hi); y = R(lo, hi); guard++; } while (guard < 50 && a.regroup === false && hasCarry(x, y));
    return inputNum(`**${N(x)} + ${N(y)} = ?**`, x + y,
      t(`Add place by place: ${splitPlaces(x).map(N).join(' + ')} and ${splitPlaces(y).map(N).join(' + ')}. Regroup 10 ones into a ten (and 10 tens into a hundred). ${N(x)} + ${N(y)} = ${N(x + y)}.`,
        `Dodawaj rzędami: ${splitPlaces(x).map(N).join(' + ')} oraz ${splitPlaces(y).map(N).join(' + ')}. 10 jedności to 1 dziesiątka, 10 dziesiątek to 1 setka. ${N(x)} + ${N(y)} = ${N(x + y)}.`));
  };
  S.add = (a) => ({ digits: Math.min(6, (a.digits || 2) + 1), regroup: true });

  G.sub = (a) => {
    const t = L(a), N = Nf(a);
    const d = a.digits || 2, lo = Math.pow(10, d - 1), hi = Math.pow(10, d) - 1;
    let x, y, guard = 0;
    do { x = R(lo, hi); y = R(lo, hi); if (y > x) [x, y] = [y, x]; guard++; } while (guard < 50 && (x === y || (a.regroup === false && needsBorrow(x, y))));
    return inputNum(`**${N(x)} − ${N(y)} = ?**`, x - y,
      t(`Subtract place by place, starting with the ones. If the top digit is smaller, trade 1 from the next place. Check by adding back: ${N(x - y)} + ${N(y)} = ${N(x)}.`,
        `Odejmuj od jedności. Gdy cyfra u góry jest mniejsza, „pożycz” 1 z następnego rzędu. Sprawdź dodawaniem: ${N(x - y)} + ${N(y)} = ${N(x)}.`));
  };
  S.sub = S.add;

  G.missing = (a) => {
    const t = L(a);
    const max = a.max || 100;
    const x = R(5, max - 10), c = R(x + 2, max), y = c - x;
    if (Math.random() < 0.5) return inputNum(t(`Find the missing number: **${x} + ☐ = ${c}**`, `Jaka liczba pasuje w okienko? **${x} + ☐ = ${c}**`), y, t(`Addition and subtraction undo each other. ☐ = ${c} − ${x} = ${y}.`, `Odejmowanie sprawdza dodawanie. ☐ = ${c} − ${x} = ${y}.`));
    return inputNum(t(`Find the missing number: **${c} − ☐ = ${x}**`, `Jaka liczba pasuje w okienko? **${c} − ☐ = ${x}**`), y, t(`Think: ${x} + ☐ = ${c}. So ☐ = ${c} − ${x} = ${y}.`, `Pomyśl: ${x} + ☐ = ${c}. Czyli ☐ = ${c} − ${x} = ${y}.`));
  };
  S.missing = (a) => ({ max: (a.max || 100) * 10 });

  G.addWord = (a) => {
    const t = L(a), N = Nf(a);
    const max = a.max || 999;
    const x = R(20, max), y = R(20, max), who = name(a);
    const big = Math.max(x, y), small = Math.min(x, y);
    const ctx = pick(a.lang === 'pl' ? [
      [`${who} przeczytał(a) w zeszłym miesiącu ${x} ${plF(x, 'stronę', 'strony', 'stron')}, a w tym ${y}. Ile stron razem?`, x + y, '+'],
      [`Szkoła zebrała w poniedziałek ${N(x)} ${plF(x, 'nakrętkę', 'nakrętki', 'nakrętek')}, a we wtorek ${N(y)}. Ile nakrętek zebrano razem?`, x + y, '+'],
      [`W sadzie ${plF(big, 'było', 'były', 'było')} ${N(big)} ${plF(big, 'jabłko', 'jabłka', 'jabłek')}. Sprzedano ${N(small)}. Ile jabłek zostało?`, big - small, '−'],
      [`${who} miał(a) ${N(big)} ${plF(big, 'punkt', 'punkty', 'punktów')} i wydał(a) ${N(small)}. Ile punktów zostało?`, big - small, '−'],
      [`Rower kosztuje ${N(big)} zł, a hulajnoga ${N(small)} zł. O ile droższy jest rower?`, big - small, '−'],
    ] : [
      [`${who} read ${x} pages last month and ${y} pages this month. How many pages altogether?`, x + y, '+'],
      [`A school collected ${N(x)} cans on Monday and ${N(y)} cans on Tuesday. How many cans in total?`, x + y, '+'],
      [`A farmer had ${N(big)} sheep and sold ${N(small)}. How many sheep are left?`, big - small, '−'],
      [`${who} had ${N(big)} points and spent ${N(small)}. How many points are left?`, big - small, '−'],
      [`A bike costs $${N(big)} and a scooter costs $${N(small)}. How much more does the bike cost?`, big - small, '−'],
    ]);
    return inputNum(ctx[0], ctx[1], ctx[2] === '+'
      ? t(`This is an addition (joining) problem: ${N(x)} + ${N(y)} = ${N(ctx[1])}.`, `To zadanie na dodawanie: ${N(x)} + ${N(y)} = ${N(ctx[1])}.`)
      : t(`This is a subtraction (take away / difference) problem: ${N(big)} − ${N(small)} = ${N(ctx[1])}.`, `To zadanie na odejmowanie (ile zostało / o ile więcej): ${N(big)} − ${N(small)} = ${N(ctx[1])}.`));
  };
  S.addWord = (a) => ({ max: (a.max || 999) * 5 });

  G.twoStep = (a) => {
    const t = L(a), N = Nf(a);
    const who = name(a);
    const packs = R(3, 9), each = pick([4, 5, 6, 8, 10, 12]), given = R(2, packs * each - 5);
    return inputNum(t(`${who} buys ${packs} packets of stickers with ${each} in each, then gives away ${given}. How many stickers are left?`, `${who} kupuje ${packs} ${plF(packs, 'paczkę', 'paczki', 'paczek')} naklejek, po ${each} w każdej, a potem oddaje ${given}. Ile naklejek zostało?`),
      packs * each - given, t(`Two steps: ${packs} × ${each} = ${packs * each}, then ${packs * each} − ${given} = ${packs * each - given}.`, `Dwa kroki: ${packs} · ${each} = ${packs * each}, potem ${packs * each} − ${given} = ${packs * each - given}.`));
  };

  /* ===== Multiplication & division ===== */
  G.mulFact = (a) => {
    const t = L(a);
    const tables = a.tables || [2, 3, 4, 5, 10], maxB = a.maxB || 10;
    const x0 = pick(tables), y0 = R(1, maxB);
    const [x, y] = Math.random() < 0.5 ? [x0, y0] : [y0, x0];
    const seq = Array.from({ length: Math.min(y0, 12) }, (_, i) => x0 * (i + 1)).join(', ');
    return inputNum(`**${x} ${MUL(a)} ${y} = ?**`, x * y, t(`${x} groups of ${y} = ${x * y}. Skip count by ${x0}s: ${seq}.`, `${x} razy po ${y} = ${x * y}. Licz co ${x0}: ${seq}.`));
  };
  S.mulFact = (a) => ({ tables: [6, 7, 8, 9, 11, 12], maxB: 12 });
  G.divFact = (a) => {
    const t = L(a);
    const tables = a.tables || [2, 3, 4, 5, 10], maxB = a.maxB || 10;
    const x = pick(tables), y = R(1, maxB);
    return inputNum(`**${x * y} ${DIV(a)} ${x} = ?**`, y, t(`Division undoes multiplication. Think: ${x} × ☐ = ${x * y}. ☐ = ${y}.`, `Dzielenie sprawdzamy mnożeniem. Pomyśl: ${x} · ☐ = ${x * y}. ☐ = ${y}.`));
  };
  S.divFact = S.mulFact;
  G.mulFact10 = (a) => G.mulFact(Object.assign({}, a, { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], maxB: 10 }));
  G.divFact10 = (a) => G.divFact(Object.assign({}, a, { tables: [2, 3, 4, 5, 6, 7, 8, 9, 10], maxB: 10 }));
  S.mulFact10 = () => ({}); S.divFact10 = () => ({});
  G.mulFact10s = (a) => G.mulFact(Object.assign({}, a, { tables: [11, 12, 6, 7, 8, 9], maxB: 12 }));
  G.divFact10s = (a) => G.divFact(Object.assign({}, a, { tables: [11, 12, 6, 7, 8, 9], maxB: 12 }));
  LA.STRETCH.mulFact10 = () => ({}); // handled by bank swap below
  G.mulFact10 = ((orig) => (a) => (a._stretch ? G.mulFact10s(a) : orig(a)))(G.mulFact10);
  G.divFact10 = ((orig) => (a) => (a._stretch ? G.divFact10s(a) : orig(a)))(G.divFact10);
  S.mulFact10 = () => ({ _stretch: true });
  S.divFact10 = () => ({ _stretch: true });

  G.arrayMul = (a) => {
    const t = L(a);
    const r = R(2, a.maxR || 5), c = R(2, a.maxC || 10);
    return Object.assign(inputNum(t(`How many dots are in this array? (**${r} rows of ${c}**)`, `Ile jest kropek? (**${r} rzędy po ${c}**)`), r * c, t(`${r} rows × ${c} in each row = ${r * c}.`, `${r} rzędy · ${c} w rzędzie = ${r * c}.`)), { svg: SVG.array(r, c) });
  };
  S.arrayMul = () => ({ maxR: 8, maxC: 12 });

  G.mul2by1 = (a) => {
    const t = L(a), N = Nf(a);
    const x = R(11, a.maxA || 99), y = R(2, a.maxB || 9);
    const parts = splitPlaces(x);
    return inputNum(`**${N(x)} ${MUL(a)} ${y} = ?**`, x * y,
      t(`Split ${N(x)} into ${parts.map(N).join(' + ')}. Multiply each part by ${y}: ${parts.map((p) => N(p * y)).join(' + ')} = ${N(x * y)}.`,
        `Rozłóż ${N(x)} na ${parts.map(N).join(' + ')}. Pomnóż każdą część przez ${y}: ${parts.map((p) => N(p * y)).join(' + ')} = ${N(x * y)}.`));
  };
  S.mul2by1 = (a) => ({ maxA: (a.maxA || 99) < 100 ? 999 : 9999, maxB: 9 });

  G.divRem = (a) => {
    const t = L(a);
    const d = R(2, a.maxDiv || 9), qq = R(2, a.maxQ || 12), r = a.rem === false ? 0 : R(0, d - 1);
    const n = d * qq + r;
    const remWord = a.lang === 'pl' ? 'r.' : 'r';
    const answers = r ? [`${qq} r ${r}`, `${qq}r${r}`, `${qq} r${r}`, `${qq}r ${r}`, `${qq} r. ${r}`, `${qq} reszta ${r}`, `${qq} remainder ${r}`, `${qq} R ${r}`] : qq;
    return Object.assign(inputNum(t(`**${n} ÷ ${d} = ?**${r ? '  (write the remainder like this: 7 r 2)' : ''}`, `**${n} : ${d} = ?**${r ? '  (resztę zapisz tak: 7 r 2)' : ''}`), answers,
      t(`${d} × ${qq} = ${d * qq}${r ? `, and ${n} − ${d * qq} = ${r} left over` : ''}. So ${n} ÷ ${d} = ${qq}${r ? ' remainder ' + r : ''}.`, `${d} · ${qq} = ${d * qq}${r ? `, a ${n} − ${d * qq} = ${r} zostaje` : ''}. Czyli ${n} : ${d} = ${qq}${r ? ' reszta ' + r : ''}.`)), r ? { numeric: false } : {}, { remWord });
  };
  S.divRem = () => ({ maxDiv: 9, maxQ: 30 });

  G.mulWord = (a) => {
    const t = L(a);
    const x = pick(a.tables || [2, 3, 4, 5, 10]), y = R(2, 10), who = name(a);
    if (a.lang === 'pl') {
      const [g, s2, s5, inEach, o2, o5] = pick([['f', 'torebki', 'torebek', 'w każdej', 'jabłka', 'jabłek'], ['n', 'pudełka', 'pudełek', 'w każdym', 'kredki', 'kredek'], ['f', 'paczki', 'paczek', 'w każdej', 'naklejki', 'naklejek'], ['m', 'rzędy', 'rzędów', 'w każdym', 'krzesła', 'krzeseł'], ['m', 'talerze', 'talerzy', 'na każdym', 'ciastka', 'ciastek']]);
      return inputNum(`${who} ma ${y} ${plF(y, '', s2, s5)}, ${inEach} po ${x} ${plF(x, '', o2, o5)}. Ile jest razem ${o5}?`, x * y, `${y} razy po ${x}: ${y} · ${x} = ${x * y}.`);
    }
    const th = pick([['bags', 'apples'], ['boxes', 'pencils'], ['packets', 'stickers'], ['teams', 'players'], ['rows', 'chairs'], ['plates', 'biscuits']]);
    return inputNum(t(`${who} has ${y} ${th[0]} with ${x} ${th[1]} in each. How many ${th[1]} altogether?`, ''), x * y,
      t(`${y} groups of ${x}: ${y} × ${x} = ${x * y}.`, `${y} razy po ${x}: ${y} · ${x} = ${x * y}.`));
  };
  S.mulWord = () => ({ tables: [6, 7, 8, 9, 12] });
  G.divWord = (a) => {
    const t = L(a);
    const x = pick(a.tables || [2, 3, 4, 5, 10]), y = R(2, 10), who = name(a);
    const th = pick(a.lang === 'pl' ? [[['cukierki', 'cukierków'], 'kolegów', 'każdy kolega'], [['karty', 'kart'], 'graczy', 'każdy gracz'], [['kulki', 'kulek'], 'słoików', 'każdy słoik'], [['pomarańcze', 'pomarańczy'], 'misek', 'każda miska']] : [['lollies', 'friends'], ['cards', 'players'], ['marbles', 'jars'], ['oranges', 'bowls']]);
    const tot = x * y;
    return inputNum(t(`${who} shares ${tot} ${th[0]} equally between ${x} ${th[1]}. How many does each get?`, a.lang === 'pl' ? `${who} dzieli ${tot} ${plF(tot, '', th[0][0], th[0][1])} po równo na ${x} ${th[1] === 'słoików' ? plF(x, '', 'słoiki', 'słoików') : th[1] === 'misek' ? plF(x, '', 'miski', 'misek') : th[1]}. Ile przypada na ${th[2].replace('każdy kolega', 'każdego kolegę').replace('każdy gracz', 'każdego gracza').replace('każda miska', 'każdą miskę')}?` : ''), y,
      t(`Sharing is dividing: ${x * y} ÷ ${x} = ${y}. Check: ${x} × ${y} = ${x * y}.`, `Dzielenie po równo: ${x * y} : ${x} = ${y}. Sprawdź: ${x} · ${y} = ${x * y}.`));
  };
  S.divWord = S.mulWord;

  G.mulBy10 = (a) => {
    const t = L(a), N = Nf(a);
    const n = R(2, a.maxN || 99), k = pick(a.ks || [10, 100]);
    return inputNum(`**${N(n)} ${MUL(a)} ${N(k)} = ?**`, n * k, t(`Multiplying by ${N(k)} moves each digit ${String(k).length - 1} place(s) to the left. ${N(n)} × ${N(k)} = ${N(n * k)}.`, `Mnożąc przez ${N(k)}, dopisujemy ${String(k).length - 1} zer(a). ${N(n)} · ${N(k)} = ${N(n * k)}.`));
  };
  S.mulBy10 = () => ({ maxN: 999, ks: [10, 100, 1000] });

  /* Order of operations: multiplication/division before addition/subtraction, brackets first */
  G.orderOps = (a) => {
    const t = L(a), M = MUL(a), D = a.lang === 'pl' ? ':' : '÷';
    const x = R(2, 20), y = R(2, 9), z = R(2, 9);
    const kinds = [
      [`${x} + ${y} ${M} ${z}`, x + y * z, t(`Multiply first: ${y} × ${z} = ${y * z}, then ${x} + ${y * z} = ${x + y * z}.`, `Najpierw mnożenie: ${y} · ${z} = ${y * z}, potem ${x} + ${y * z} = ${x + y * z}.`)],
      [`(${x} + ${y}) ${M} ${z}`, (x + y) * z, t(`Brackets first: ${x} + ${y} = ${x + y}, then × ${z} = ${(x + y) * z}.`, `Najpierw nawias: ${x} + ${y} = ${x + y}, potem · ${z} = ${(x + y) * z}.`)],
      [`${y * z + x} − ${y * z} ${D} ${z}`, y * z + x - y, t(`Divide first: ${y * z} ÷ ${z} = ${y}, then ${y * z + x} − ${y} = ${y * z + x - y}.`, `Najpierw dzielenie: ${y * z} : ${z} = ${y}, potem ${y * z + x} − ${y} = ${y * z + x - y}.`)],
      [`${y} ${M} ${z} − ${Math.min(x, y * z)}`, y * z - Math.min(x, y * z), t(`Multiply first: ${y * z}, then subtract ${Math.min(x, y * z)}.`, `Najpierw mnożenie: ${y * z}, potem odejmij ${Math.min(x, y * z)}.`)],
    ];
    if (a.hard) kinds.push([`(${x} + ${y}) ${M} ${z} − ${y} ${M} ${y}`, (x + y) * z - y * y, t(`Brackets, then both multiplications, then subtract: ${(x + y) * z} − ${y * y}.`, `Nawias, potem oba mnożenia, na końcu odejmowanie: ${(x + y) * z} − ${y * y}.`)]);
    const [e, ans, why] = pick(kinds);
    return inputNum(`**${e} = ?**`, ans, why);
  };
  S.orderOps = () => ({ hard: true });
  G.power = (a) => {
    const t = L(a);
    const cube = Math.random() < (a.hard ? 0.5 : 0.3), n = cube ? R(2, a.hard ? 6 : 5) : R(2, a.hard ? 15 : 10);
    const v = cube ? n * n * n : n * n;
    return inputNum(`**${n}${cube ? '³' : '²'} = ?**`, v, t(`${n}${cube ? '³' : '²'} means ${cube ? `${n} × ${n} × ${n}` : `${n} × ${n}`} = ${v}.`, `${n}${cube ? '³' : '²'} to ${cube ? `${n} · ${n} · ${n}` : `${n} · ${n}`} = ${v}. ${cube ? 'Sześcian liczby' : 'Kwadrat liczby'}.`));
  };
  S.power = () => ({ hard: true });

  G.estimate = (a) => {
    const t = L(a);
    const x = R(21, 89), y = R(21, 89);
    const est = Math.round(x / 10) * 10 + Math.round(y / 10) * 10;
    const opts = shuffle([est, est + 30, Math.max(10, est - 40), est + 100]);
    return { type: 'mc', q: t(`Which is the best **estimate** for **${x} + ${y}**?`, `Który wynik jest najlepszym **szacunkiem** dla **${x} + ${y}**?`), options: opts.map(String), answer: opts.indexOf(est),
      explain: t(`Round each number to the nearest ten: ${x} → ${Math.round(x / 10) * 10}, ${y} → ${Math.round(y / 10) * 10}. Sum ≈ ${est}. (Exact: ${x + y}.)`, `Zaokrąglij do dziesiątek: ${x} → ${Math.round(x / 10) * 10}, ${y} → ${Math.round(y / 10) * 10}. Razem ≈ ${est}. (Dokładnie: ${x + y}.)`) };
  };

  G.pattern = (a) => {
    const t = L(a);
    const mult = a.mult && Math.random() < 0.5;
    if (mult) {
      const k = pick([2, 3]), start = R(1, 5);
      const seq = Array.from({ length: 5 }, (_, i) => start * Math.pow(k, i));
      return inputNum(t(`What comes next? **${seq.slice(0, 4).join(', ')}, ___**`, `Jaka liczba będzie następna? **${seq.slice(0, 4).join(', ')}, ___**`), seq[4], t(`Each number is ${k} times the one before: ${seq[3]} × ${k} = ${seq[4]}.`, `Każda liczba jest ${k} razy większa od poprzedniej: ${seq[3]} · ${k} = ${seq[4]}.`));
    }
    const step = R(2, a.maxStep || 10) * (a.decreasing !== false && Math.random() < 0.4 ? -1 : 1);
    const start = step > 0 ? R(1, 50) : R(Math.abs(step) * 5 + 10, Math.abs(step) * 5 + 150);
    const seq = Array.from({ length: 5 }, (_, i) => start + i * step);
    return inputNum(t(`What comes next? **${seq.slice(0, 4).join(', ')}, ___**`, `Jaka liczba będzie następna? **${seq.slice(0, 4).join(', ')}, ___**`), seq[4],
      t(`The rule is "${step > 0 ? 'add' : 'subtract'} ${Math.abs(step)}". ${seq[3]} ${step > 0 ? '+' : '−'} ${Math.abs(step)} = ${seq[4]}.`, `Reguła: „${step > 0 ? 'dodaj' : 'odejmij'} ${Math.abs(step)}”. ${seq[3]} ${step > 0 ? '+' : '−'} ${Math.abs(step)} = ${seq[4]}.`));
  };
  S.pattern = () => ({ maxStep: 25, mult: true });

  G.oddEven = (a) => {
    const t = L(a), N = Nf(a);
    const n = R(10, a.max || 999), even = n % 2 === 0;
    return { type: 'mc', fixed: true, q: t(`Is **${N(n)}** odd or even?`, `Czy **${N(n)}** to liczba parzysta czy nieparzysta?`), options: t(['Odd', 'Even'], ['Nieparzysta', 'Parzysta']), answer: even ? 1 : 0,
      explain: t(`Look at the ones digit: ${n % 10}. ${even ? '0, 2, 4, 6 or 8 → even.' : '1, 3, 5, 7 or 9 → odd.'}`, `Spójrz na cyfrę jedności: ${n % 10}. ${even ? '0, 2, 4, 6, 8 → parzysta.' : '1, 3, 5, 7, 9 → nieparzysta.'}`) };
  };
  S.oddEven = () => ({ max: 99999 });

  /* ===== Fractions & decimals ===== */
  G.unitFraction = (a) => {
    const t = L(a);
    const d = pick(a.dens || [2, 3, 4, 5, 10]), shaded = Math.random() < 0.6 ? 1 : R(1, d - 1);
    const right = `${shaded}/${d}`;
    const shape = Math.random() < 0.5 ? SVG.fractionBar(d, shaded) : SVG.fractionCircle(d, shaded);
    const cands = [`${d - shaded}/${d}`, `${shaded}/${d + 1}`, `${d}/${shaded}`, `${shaded + 1}/${d}`, `1/${d * 2}`];
    const opts = shuffle([right, ...[...new Set(cands.filter((x) => x !== right))].slice(0, 3)]);
    return { type: 'mc', q: t('What fraction of the shape is shaded?', 'Jaka część figury jest zamalowana?'), svg: shape, options: opts, answer: opts.indexOf(right),
      explain: t(`The whole is cut into ${d} equal parts and ${shaded} ${shaded === 1 ? 'is' : 'are'} shaded: ${right}. The bottom number (denominator) = how many equal parts; the top (numerator) = how many we count.`, `Całość podzielono na ${d} równych części, zamalowano ${shaded}: ${right}. Mianownik (na dole) mówi, na ile części podzielono całość, licznik (u góry) — ile części bierzemy.`) };
  };
  S.unitFraction = () => ({ dens: [6, 8, 10, 12] });
  G.fractionWhole = (a) => {
    const t = L(a);
    const d = pick(a.dens || [2, 3, 4, 5, 10]), n = R(1, d - 1);
    return inputNum(t(`**${n}/${d} + ☐/${d} = 1 whole.** What is the missing number?`, `**${n}/${d} + ☐/${d} = 1 całość.** Jaka liczba pasuje w okienko?`), d - n, t(`A whole has ${d}/${d}. ${d} − ${n} = ${d - n}.`, `Całość to ${d}/${d}. ${d} − ${n} = ${d - n}.`));
  };
  S.fractionWhole = () => ({ dens: [6, 8, 12, 100] });
  G.fractionOf = (a) => {
    const t = L(a);
    const d = pick(a.dens || [2, 3, 4, 5, 10]), each = R(1, a.maxEach || 10), total = d * each;
    const n = a.nonUnit || Math.random() < 0.3 ? R(1, d - 1) : 1;
    return inputNum(t(`What is **${n}/${d} of ${total}**?`, `Ile to jest **${n}/${d} z ${total}**?`), n * each,
      t(`First find 1/${d}: ${total} ÷ ${d} = ${each}.${n > 1 ? ` Then ${n} lots of ${each} = ${n * each}.` : ''}`, `Najpierw 1/${d}: ${total} : ${d} = ${each}.${n > 1 ? ` Potem ${n} · ${each} = ${n * each}.` : ''}`));
  };
  S.fractionOf = () => ({ dens: [3, 4, 5, 6, 8, 10], maxEach: 25, nonUnit: true });
  G.equivFraction = (a) => {
    const t = L(a);
    const d = pick([2, 3, 4, 5]), n = R(1, d - 1), k = pick(a.ks || [2, 3, 4]);
    return inputNum(t(`Fill the gap to make equivalent fractions: **${n}/${d} = ☐/${d * k}**`, `Uzupełnij, aby ułamki były równe: **${n}/${d} = ☐/${d * k}**`), n * k,
      t(`The denominator was multiplied by ${k}, so multiply the numerator by ${k} too: ${n} × ${k} = ${n * k}.`, `Mianownik pomnożono przez ${k}, więc licznik też mnożymy przez ${k}: ${n} · ${k} = ${n * k}.`), { svg: SVG.fractionBar(d, n) + '<br>' + SVG.fractionBar(d * k, n * k) });
  };
  S.equivFraction = () => ({ ks: [5, 10, 20] });
  G.fractionCompare = (a) => {
    const t = L(a);
    const pairs = a.hard ? [['2/3', '3/4', 1], ['3/5', '1/2', 0], ['5/8', '3/4', 1], ['4/6', '2/3', 2], ['7/10', '3/5', 0], ['5/12', '1/3', 0]] : [['1/2', '1/4', 0], ['1/3', '1/5', 0], ['1/10', '1/2', 1], ['2/4', '1/2', 2], ['3/4', '1/4', 0], ['1/5', '1/3', 1], ['2/3', '1/3', 0], ['5/10', '1/2', 2], ['1/4', '1/3', 1]];
    const [x, y, ans] = pick(pairs);
    return { type: 'mc', fixed: true, q: t(`Which symbol makes this true? **${x} ☐ ${y}**`, `Wstaw znak: **${x} ☐ ${y}**`), options: ['>', '<', '='], answer: ans,
      explain: t(`Imagine the same-sized whole (or make the denominators the same). ${x} is ${['greater than', 'less than', 'equal to'][ans]} ${y}.`, `Wyobraź sobie tę samą całość (albo sprowadź do wspólnego mianownika). ${x} jest ${['większe od', 'mniejsze od', 'równe'][ans]} ${y}.`) };
  };
  S.fractionCompare = () => ({ hard: true });
  G.fractionLine = (a) => {
    const t = L(a);
    const d = pick(a.dens || [2, 4, 5, 10]), n = R(1, d - 1);
    return { type: 'input', check: 'fraction', q: t('What fraction is the red arrow pointing to? (write it like 3/4)', 'Jaki ułamek wskazuje czerwona strzałka? (zapisz np. 3/4)'), svg: SVG.numberLine(0, 1, 1 / d, n / d, d, a.lang), answer: [`${n}/${d}`],
      explain: t(`From 0 to 1 is split into ${d} equal jumps. The arrow is ${n} jump${n > 1 ? 's' : ''} along: ${n}/${d}.`, `Odcinek od 0 do 1 podzielono na ${d} równych części. Strzałka jest po ${n}. części: ${n}/${d}.`) };
  };
  S.fractionLine = () => ({ dens: [6, 8, 10] });
  G.mixedNumeral = (a) => {
    const t = L(a);
    const d = pick(a.dens || [2, 3, 4]), w = R(1, 3), n = R(1, d - 1), imp = w * d + n;
    return { type: 'input', check: 'fraction', q: t(`Write **${imp}/${d}** as a mixed numeral (e.g. 2 1/4).`, `Zamień **${imp}/${d}** na liczbę mieszaną (np. 2 1/4).`), answer: [`${w} ${n}/${d}`],
      explain: t(`${imp} ÷ ${d} = ${w} remainder ${n} → ${w} ${n}/${d}.`, `${imp} : ${d} = ${w} reszta ${n} → ${w} ${n}/${d}.`) };
  };
  S.mixedNumeral = () => ({ dens: [5, 6, 8] });
  G.decimalTenths = (a) => {
    const t = L(a), N = Nf(a);
    const tt = R(1, 9), w = Math.random() < 0.5 ? 0 : R(1, 9), kind = R(0, 2);
    const v = w + tt / 10;
    if (kind === 0) return inputNum(t(`Write as a decimal: **${w ? w + ' and ' : ''}${tt} tenth${tt > 1 ? 's' : ''}**`, `Zapisz w postaci ułamka dziesiętnego: **${w ? w + ' całych i ' : ''}${tt}/10**`), v, t(`Tenths go in the first place after the decimal point: ${v.toFixed(1)}.`, `Dziesiąte części zapisujemy na pierwszym miejscu po przecinku: ${N(+v.toFixed(1))}.`));
    if (kind === 1) return inputNum(t(`How many tenths are in **${v.toFixed(1)}** altogether?`, `Ile dziesiątych części jest w liczbie **${N(+v.toFixed(1))}**?`), w * 10 + tt, t(`Each whole is 10 tenths: ${w * 10} + ${tt} = ${w * 10 + tt}.`, `Jedna całość to 10 dziesiątych: ${w * 10} + ${tt} = ${w * 10 + tt}.`));
    return inputNum(t(`Write **${tt}/10** as a decimal.`, `Zapisz **${tt}/10** jako ułamek dziesiętny.`), tt / 10, t(`${tt}/10 = 0.${tt}.`, `${tt}/10 = 0,${tt}.`));
  };
  S.decimalTenths = () => ({});
  G.decimalHundredths = (a) => {
    const t = L(a), N = Nf(a);
    const h = R(1, 99);
    return inputNum(t(`Write **${h}/100** as a decimal.`, `Zapisz **${h}/100** jako ułamek dziesiętny.`), h / 100, t(`Hundredths need two places after the point: ${(h / 100).toFixed(2)}.`, `Setne części to dwa miejsca po przecinku: ${N(+(h / 100).toFixed(2))}.`));
  };
  G.decimalCompare = (a) => {
    const t = L(a), N = Nf(a);
    const x = R(1, 99) / 100, y = R(1, 99) / 100, ans = x > y ? 0 : x < y ? 1 : 2;
    const fx = a.lang === 'pl' ? x.toFixed(2).replace('.', ',') : x.toFixed(2), fy = a.lang === 'pl' ? y.toFixed(2).replace('.', ',') : y.toFixed(2);
    return { type: 'mc', fixed: true, q: t(`Which symbol makes this true? **${fx} ☐ ${fy}**`, `Wstaw znak: **${fx} ☐ ${fy}**`), options: ['>', '<', '='], answer: ans, explain: t(`Compare tenths first, then hundredths.`, `Porównaj najpierw dziesiąte, potem setne części.`) };
  };
  G.decimalAdd = (a) => {
    const t = L(a), N = Nf(a);
    const x = R(11, 99) / 10, y = R(11, 99) / 10, s = +(x + y).toFixed(1);
    return inputNum(`**${N(x)} + ${N(y)} = ?**`, s, t(`Line up the decimal points and add tenths, then ones: ${s}.`, `Podpisz przecinek pod przecinkiem i dodawaj: ${N(s)}.`));
  };

  /* ===== Money ===== */
  G.moneyTotal = (a) => {
    const t = L(a);
    const pl = a.lang === 'pl';
    const items = shuffle(pl ? [['jabłko', 120], ['ołówek', 250], ['sok', 390], ['naklejka', 150], ['bułka', 80], ['linijka', 450], ['banan', 140], ['zeszyt', 525], ['drożdżówka', 350], ['lody', 600]]
      : [['an apple', 95], ['a pencil', 120], ['a juice', 250], ['a sticker', 45], ['a muffin', 380], ['a ruler', 175], ['a banana', 60], ['a notebook', 425], ['a sausage sizzle', 350], ['an ice-block', 150]]).slice(0, a.items || 2);
    const total = items.reduce((s, i) => s + i[1], 0);
    const list = items.map((i) => `${i[0]} ${t('costs', 'kosztuje')} ${U.fmtMoney(i[1], a.lang)}`).join(t(' and ', ' i '));
    return inputNum(t(`At the canteen, ${list}. What is the total? (e.g. $3.45)`, `W sklepiku ${list}. Ile trzeba zapłacić razem? (np. 3,45 zł)`), total / 100,
      t(`Add dollars and cents: ${items.map((i) => U.fmtMoney(i[1])).join(' + ')} = ${U.fmtMoney(total)}.`, `Dodaj złote i grosze: ${items.map((i) => U.fmtMoney(i[1], 'pl')).join(' + ')} = ${U.fmtMoney(total, 'pl')}.`));
  };
  S.moneyTotal = () => ({ items: 3 });
  G.moneyChange = (a) => {
    const t = L(a);
    const paid = pick(a.note || [500, 1000, 2000]), cost = R(Math.floor((paid * 0.2) / 5), Math.floor((paid * 0.95) / 5)) * 5;
    return inputNum(t(`${name(a)} buys something for ${U.fmtMoney(cost)} and pays with a ${U.fmtMoney(paid).replace('.00', '')} note. How much change? (e.g. $1.35)`, `${name(a)} kupuje coś za ${U.fmtMoney(cost, 'pl')} i płaci banknotem ${paid / 100} zł. Ile reszty dostanie? (np. 1,35 zł)`),
      (paid - cost) / 100, t(`Change = paid − cost = ${U.fmtMoney(paid)} − ${U.fmtMoney(cost)} = ${U.fmtMoney(paid - cost)}. You can count up from the price.`, `Reszta = zapłacono − cena = ${U.fmtMoney(paid, 'pl')} − ${U.fmtMoney(cost, 'pl')} = ${U.fmtMoney(paid - cost, 'pl')}. Możesz doliczać od ceny w górę.`));
  };
  S.moneyChange = () => ({ note: [5000, 10000] });
  G.coins = (a) => {
    const t = L(a);
    const coins = a.lang === 'pl' ? [[500, '5 zł'], [200, '2 zł'], [100, '1 zł'], [50, '50 gr'], [20, '20 gr'], [10, '10 gr'], [5, '5 gr'], [2, '2 gr'], [1, '1 gr']] : [[200, '$2'], [100, '$1'], [50, '50c'], [20, '20c'], [10, '10c'], [5, '5c']];
    const chosen = Array.from({ length: R(3, a.many || 5) }, () => pick(coins));
    const total = chosen.reduce((s, c) => s + c[0], 0);
    return inputNum(t(`What is the total of these coins: **${chosen.map((c) => c[1]).join(', ')}**? (e.g. $2.45)`, `Ile razem jest pieniędzy: **${chosen.map((c) => c[1]).join(', ')}**? (np. 2,45 zł)`), total / 100,
      t(`Start with the largest coins and count on: ${U.fmtMoney(total)}.`, `Zacznij od największych monet i doliczaj: ${U.fmtMoney(total, 'pl')}.`));
  };
  S.coins = () => ({ many: 8 });
  G.budget = (a) => {
    const t = L(a);
    const pl = a.lang === 'pl';
    const budget = pick(pl ? [20, 30, 50] : [10, 15, 20]);
    const prices = shuffle(pl ? [['książkę', 18.5], ['piłkę', 15], ['puzzle', 22], ['farby', 12.5], ['latawiec', 19], ['jojo', 7.5]] : [['a book', 7.5], ['a ball', 6], ['a puzzle', 9], ['paints', 5.5], ['a kite', 8], ['a yo-yo', 3.5]]).slice(0, 2);
    const total = prices[0][1] + prices[1][1], can = total <= budget;
    const f = (v) => (pl ? v.toFixed(2).replace('.', ',') + ' zł' : '$' + v.toFixed(2));
    return { type: 'mc', fixed: true, q: t(`${name(a)} has **$${budget}**. Can they buy ${prices[0][0]} (${f(prices[0][1])}) **and** ${prices[1][0]} (${f(prices[1][1])})?`, `${name(a)} ma **${budget} zł**. Czy wystarczy na ${prices[0][0]} (${f(prices[0][1])}) **i** ${prices[1][0]} (${f(prices[1][1])})?`),
      options: t(['Yes', 'No'], ['Tak', 'Nie']), answer: can ? 0 : 1, explain: t(`Total = ${f(total)}, which is ${can ? 'not more than' : 'more than'} $${budget}.`, `Razem ${f(total)} — to ${can ? 'nie więcej niż' : 'więcej niż'} ${budget} zł.`) };
  };

  /* ===== Time ===== */
  const t12 = (h, m) => `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
  const t24 = (h, m) => `${h % 24}:${String(m).padStart(2, '0')}`;
  G.readClock = (a) => {
    const t = L(a);
    const step = a.step || 5, h = R(1, 12), m = R(0, Math.floor(59 / step)) * step;
    return { type: 'input', check: 'time', q: t('What time does the clock show? (write like 3:25)', 'Którą godzinę pokazuje zegar? (zapisz np. 3:25)'), svg: SVG.clock(h, m), answer: [t12(h, m)],
      explain: t(`The short hand (hour) is ${m === 0 ? 'on' : 'just past'} ${h}. The long hand points to ${m === 0 ? '12' : m % 5 === 0 ? 'the ' + m / 5 : 'between numbers'} = ${m} minutes. Time: ${t12(h, m)}.`, `Krótka wskazówka (godziny) jest ${m === 0 ? 'na' : 'tuż za'} ${h}. Długa wskazuje ${m} minut. Godzina: ${t12(h, m)}.`) };
  };
  S.readClock = () => ({ step: 1 });
  G.timeAfter = (a) => {
    const t = L(a);
    const pl = a.lang === 'pl';
    const h = pl ? R(6, 20) : R(1, 11), m = R(0, 11) * 5, add = R(1, Math.floor((a.maxMin || 55) / 5)) * 5;
    const tot = h * 60 + m + add;
    const fmt = pl ? t24 : t12;
    const ans = fmt(Math.floor(tot / 60), tot % 60);
    return { type: 'input', check: 'time', strict24: pl, q: t(`It is **${fmt(h, m)}**. What time will it be in **${add} minutes**?`, `Jest godzina **${fmt(h, m)}**. Która będzie za **${add} ${plF(add, 'minutę', 'minuty', 'minut')}**?`), answer: [ans],
      explain: t(`Count on ${add} minutes. Jump to the next o'clock if you need to (60 minutes in an hour). Answer: ${ans}.`, `Dolicz ${add} minut. Pamiętaj: godzina ma 60 minut. Odpowiedź: ${ans}.`) };
  };
  S.timeAfter = () => ({ maxMin: 175 });
  G.duration = (a) => {
    const t = L(a);
    const pl = a.lang === 'pl';
    const h = R(7, 15), m = R(0, 11) * 5, len = R(2, a.maxLen || 20) * 5, tot = h * 60 + m + len;
    const fmt = pl ? t24 : t12;
    const what = pick(pl ? ['film', 'lekcja pływania', 'mecz', 'podróż samochodem', 'próba chóru'] : ['movie', 'swimming lesson', 'footy game', 'car trip', 'netball match']);
    return inputNum(t(`A ${what} starts at **${fmt(h, m)}** and ends at **${fmt(Math.floor(tot / 60), tot % 60)}**. How many minutes long is it?`, `${what[0].toUpperCase() + what.slice(1)} zaczyna się o **${fmt(h, m)}**, a kończy o **${fmt(Math.floor(tot / 60), tot % 60)}**. Ile minut trwa?`), len,
      t(`Count on from the start to the end: ${len} minutes${len >= 60 ? ` (${Math.floor(len / 60)} h ${len % 60} min)` : ''}.`, `Doliczaj od początku do końca: ${len} minut${len >= 60 ? ` (${Math.floor(len / 60)} godz. ${len % 60} min)` : ''}.`));
  };
  S.duration = () => ({ maxLen: 48 });
  G.timeUnits = (a) => {
    const t = L(a);
    const facts = a.lang === 'pl'
      ? [['Ile minut ma 1 godzina?', 60], ['Ile sekund ma 1 minuta?', 60], ['Ile godzin ma doba?', 24], ['Ile dni ma tydzień?', 7], ['Ile miesięcy ma rok?', 12], ['Ile minut to pół godziny?', 30], ['Ile minut to kwadrans?', 15], ['Ile dni ma rok zwykły (nieprzestępny)?', 365], ['Ile minut mają 2 godziny?', 120], ['Ile dni mają 3 tygodnie?', 21], ['Ile dni ma luty w roku przestępnym?', 29], ['Ile lat ma wiek (stulecie)?', 100]]
      : [['How many minutes are in 1 hour?', 60], ['How many seconds are in 1 minute?', 60], ['How many hours are in 1 day?', 24], ['How many days are in 1 week?', 7], ['How many months are in 1 year?', 12], ['How many minutes are in half an hour?', 30], ['How many minutes are in a quarter of an hour?', 15], ['How many days are in a normal (non-leap) year?', 365], ['How many minutes are in 2 hours?', 120], ['How many days are in 3 weeks?', 21], ['How many days does February have in a leap year?', 29], ['How many years are in a century?', 100]];
    const [q, ans] = pick(facts);
    return inputNum(q, ans, t(`60 seconds = 1 minute, 60 minutes = 1 hour, 24 hours = 1 day, 7 days = 1 week, 12 months = 1 year. Answer: ${ans}.`, `60 sekund = 1 minuta, 60 minut = 1 godzina, 24 godziny = doba, 7 dni = tydzień, 12 miesięcy = rok. Odpowiedź: ${ans}.`));
  };
  G.am_pm = (a) => {
    if (a.lang === 'pl') return G.clock24(a);
    const acts = [['eat breakfast', 'am'], ['eat dinner', 'pm'], ['go to bed', 'pm'], ['walk to school', 'am'], ['have afternoon tea', 'pm'], ['wake up', 'am']];
    const [act, p] = pick(acts);
    return { type: 'mc', fixed: true, q: `You usually ${act} at about 7:30. Is that 7:30 **am** or **pm**?`, options: ['am', 'pm'], answer: p === 'am' ? 0 : 1, explain: `am = midnight to midday (morning). pm = midday to midnight. You ${act} in the ${p === 'am' ? 'morning' : 'evening'}, so it is ${p}.` };
  };
  G.clock24 = (a) => {
    const t = L(a);
    const h = R(13, 23), m = R(0, 11) * 5;
    if (Math.random() < 0.5) return { type: 'input', check: 'time', strict24: true, q: t(`Write **${t12(h, m)} pm** using the 24-hour clock.`, `Zapisz godzinę **${t12(h, m)} po południu/wieczorem** w systemie 24-godzinnym.`), answer: [t24(h, m)], explain: t(`Add 12 to the hours after midday: ${h - 12} + 12 = ${h}.`, `Po południu dodajemy 12 do godziny: ${h - 12} + 12 = ${h}. Odpowiedź: ${t24(h, m)}.`) };
    return { type: 'input', check: 'time', q: t(`What is **${t24(h, m)}** on a 12-hour clock?`, `Którą godzinę pokaże zegar ze wskazówkami, gdy jest **${t24(h, m)}**?`), answer: [t12(h, m)], explain: t(`Subtract 12: ${h} − 12 = ${h - 12}.`, `Odejmij 12: ${h} − 12 = ${h - 12}. Zegar pokaże ${t12(h, m)}.`) };
  };
  G.calendar = (a) => {
    const t = L(a);
    const months = a.lang === 'pl' ? ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'] : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const i = R(0, 11), kind = R(0, 2);
    if (kind === 0) { const ans = months[(i + 1) % 12]; const opts = shuffle([ans, months[(i + 2) % 12], months[(i + 11) % 12], months[(i + 6) % 12]]); return { type: 'mc', q: t(`Which month comes after **${months[i]}**?`, `Jaki miesiąc jest po miesiącu **${months[i]}**?`), options: opts, answer: opts.indexOf(ans), explain: t(`The order is January → December. After ${months[i]} comes ${ans}.`, `Kolejność: styczeń → grudzień. Po miesiącu ${months[i]} jest ${ans}.`) }; }
    if (kind === 1) return inputNum(t(`How many days are in **${months[i]}** (not a leap year)?`, `Ile dni ma **${months[i]}** (rok nieprzestępny)?`), days[i], t(`Use your knuckles: knuckle months have 31 days. ${months[i]} has ${days[i]}.`, `Policz na knykciach: miesiące „na knykciu” mają 31 dni. ${months[i]} ma ${days[i]} dni.`));
    return inputNum(t(`Which number month is **${months[i]}**? (January = 1)`, `Którym miesiącem w roku jest **${months[i]}**? (styczeń = 1)`), i + 1, t(`${months[i]} is month ${i + 1}.`, `${months[i]} to ${i + 1}. miesiąc. Po rzymsku: ${U.toRoman(i + 1)}.`));
  };

  /* ===== Measurement ===== */
  G.convertLen = (a) => {
    const t = L(a);
    const k = pick(a.kinds || ['m-cm', 'cm-mm', 'km-m']);
    const n1 = R(1, 9);
    switch (k) {
      case 'm-cm': return inputNum(t(`How many centimetres in **${n1} m**?`, `Ile centymetrów ma **${n1} m**?`), n1 * 100, t(`1 m = 100 cm, so ${n1} m = ${n1 * 100} cm.`, `1 m = 100 cm, więc ${n1} m = ${n1 * 100} cm.`));
      case 'cm-m': return inputNum(t(`**${n1 * 100} cm** is how many metres?`, `Ile metrów to **${n1 * 100} cm**?`), n1, t(`100 cm = 1 m.`, `100 cm = 1 m.`));
      case 'cm-mm': { const c = R(1, 30); return inputNum(t(`How many millimetres in **${c} cm**?`, `Ile milimetrów ma **${c} cm**?`), c * 10, t(`1 cm = 10 mm.`, `1 cm = 10 mm, więc ${c} cm = ${c * 10} mm.`)); }
      case 'kg-g': return inputNum(t(`How many grams in **${n1} kg**?`, `Ile gramów ma **${n1} kg**?`), n1 * 1000, t(`1 kg = 1000 g.`, `1 kg = 1000 g.`));
      case 'kg-dag': return inputNum(`Ile dekagramów ma **${n1} kg**?`, n1 * 100, `1 kg = 100 dag, więc ${n1} kg = ${n1 * 100} dag.`);
      case 'dag-g': { const d = R(1, 50); return inputNum(`Ile gramów ma **${d} dag**?`, d * 10, `1 dag = 10 g, więc ${d} dag = ${d * 10} g.`); }
      case 'L-mL': return inputNum(t(`How many millilitres in **${n1} L**?`, `Ile mililitrów ma **${n1} l**?`), n1 * 1000, t(`1 L = 1000 mL.`, `1 l = 1000 ml.`));
      case 'half-L': return inputNum(t(`How many millilitres in **half a litre**?`, `Ile mililitrów ma **pół litra**?`), 500, t(`Half of 1000 mL is 500 mL.`, `Połowa z 1000 ml to 500 ml.`));
      case 'm-dm': return inputNum(`Ile decymetrów ma **${n1} m**?`, n1 * 10, `1 m = 10 dm.`);
      case 'mixed': { const m = R(1, 9), c = R(1, 99); return inputNum(t(`Write **${m} m ${c} cm** in centimetres.`, `Zapisz **${m} m ${c} cm** w centymetrach.`), m * 100 + c, t(`${m} m = ${m * 100} cm, plus ${c} cm.`, `${m} m = ${m * 100} cm, dodaj ${c} cm.`)); }
      default: return inputNum(t(`How many metres in **${n1} km**?`, `Ile metrów ma **${n1} km**?`), n1 * 1000, t(`1 km = 1000 m.`, `1 km = 1000 m.`));
    }
  };
  S.convertLen = (a) => ({ kinds: a.lang === 'pl' ? ['mixed', 'kg-dag', 'dag-g', 'km-m', 'half-L'] : ['mixed', 'kg-g', 'km-m', 'L-mL', 'half-L'] });
  G.chooseUnit = (a) => {
    const t = L(a);
    const items = a.lang === 'pl' ? [
      ['długość ołówka', 'centymetry', ['milimetry', 'centymetry', 'metry', 'kilometry']], ['odległość z Warszawy do Krakowa', 'kilometry', ['centymetry', 'metry', 'kilometry', 'milimetry']],
      ['długość basenu', 'metry', ['milimetry', 'centymetry', 'metry', 'kilometry']], ['masa psa', 'kilogramy', ['gramy', 'kilogramy', 'litry', 'metry']],
      ['masa truskawki', 'gramy', ['gramy', 'kilogramy', 'litry', 'metry']], ['ilość wody w wannie', 'litry', ['mililitry', 'litry', 'gramy', 'metry']],
      ['ilość syropu na łyżeczce', 'mililitry', ['mililitry', 'litry', 'kilogramy', 'metry']], ['grubość monety', 'milimetry', ['milimetry', 'metry', 'kilometry', 'litry']],
      ['masa cukierków na wagę', 'dekagramy', ['dekagramy', 'kilometry', 'litry', 'metry']],
    ] : [
      ['the length of a pencil', 'centimetres', ['millimetres', 'centimetres', 'metres', 'kilometres']], ['the distance from Sydney to Melbourne', 'kilometres', ['centimetres', 'metres', 'kilometres', 'millimetres']],
      ['the length of a swimming pool', 'metres', ['millimetres', 'centimetres', 'metres', 'kilometres']], ['the mass of a dog', 'kilograms', ['grams', 'kilograms', 'litres', 'metres']],
      ['the mass of a strawberry', 'grams', ['grams', 'kilograms', 'litres', 'metres']], ['how much water is in a bathtub', 'litres', ['millilitres', 'litres', 'grams', 'metres']],
      ['how much medicine is in a spoon', 'millilitres', ['millilitres', 'litres', 'kilograms', 'metres']], ['the thickness of a coin', 'millimetres', ['millimetres', 'metres', 'kilometres', 'litres']],
    ];
    const [thing, ans, opts] = pick(items);
    return { type: 'mc', q: t(`Which unit is best for measuring **${thing}**?`, `W jakich jednostkach najlepiej zmierzyć: **${thing}**?`), options: opts, answer: opts.indexOf(ans), explain: t(`Match the unit to the size. Best: ${ans}.`, `Dobierz jednostkę do wielkości. Najlepiej: ${ans}.`) };
  };
  G.readScale = (a) => {
    const t = L(a);
    const step = pick(a.steps || [2, 5, 10]), mark = R(1, 9) * step;
    return Object.assign(inputNum(t('What number is the red arrow pointing to on this scale?', 'Jaką liczbę wskazuje czerwona strzałka na skali?'), mark, t(`Each small jump is worth ${step}. The arrow is at ${mark}.`, `Każda kreska to ${step}. Strzałka wskazuje ${mark}.`)), { svg: SVG.numberLine(0, step * 10, step, mark, 2, a.lang) });
  };
  S.readScale = () => ({ steps: [20, 25, 50] });
  G.areaSquares = (a) => {
    const t = L(a);
    const w = R(2, 6), h = R(2, 4), cells = new Set();
    for (let c = 0; c < w; c++) for (let r = 0; r < h; r++) cells.add(c + 1 + ',' + r);
    if (Math.random() < 0.5) cells.add(w + 1 + ',0');
    return Object.assign(inputNum(t('Each small square is 1 square unit. What is the **area** of the green shape?', 'Każdy kwadracik to 1 jednostka kwadratowa. Jakie jest **pole** zielonej figury?'), cells.size, t(`Count the squares: the rectangle part is ${h} × ${w} = ${w * h}${cells.size > w * h ? ', plus 1 extra square' : ''}. Area = ${cells.size} square units.`, `Policz kwadraciki: prostokąt to ${h} · ${w} = ${w * h}${cells.size > w * h ? ' i jeszcze 1 kwadracik' : ''}. Pole = ${cells.size} ${LA.plF(cells.size, 'jednostka kwadratowa', 'jednostki kwadratowe', 'jednostek kwadratowych')}.`)), { svg: SVG.grid(cells, 8, 5) });
  };
  G.perimeter = (a) => {
    const t = L(a);
    const sq = Math.random() < 0.3;
    const w = R(2, a.max || 12), h = sq ? w : R(2, Math.min(9, a.max || 9));
    return inputNum(t(`A ${sq ? 'square' : 'rectangle'} is **${w} cm** long and **${h} cm** wide. What is its **perimeter**?`, `${sq ? 'Kwadrat' : 'Prostokąt'} ma boki **${w} cm** i **${h} cm**. Jaki jest jego **obwód**?`), 2 * (w + h),
      t(`Add all four sides: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`, `Dodaj długości wszystkich boków: ${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} cm.`));
  };
  S.perimeter = () => ({ max: 40 });
  G.areaRect = (a) => {
    const t = L(a);
    const w = R(2, a.max || 10), h = R(2, a.max || 10);
    return inputNum(t(`A rectangle is **${w} cm** by **${h} cm**. What is its **area** in cm²?`, `Prostokąt ma wymiary **${w} cm** na **${h} cm**. Jakie jest jego **pole** w cm²?`), w * h, t(`Area = length × width = ${w} × ${h} = ${w * h} cm².`, `Pole = długość · szerokość = ${w} · ${h} = ${w * h} cm².`));
  };
  S.areaRect = () => ({ max: 25 });

  /* ===== Space ===== */
  G.angleCompare = (a) => {
    const t = L(a);
    const deg = pick([30, 45, 60, 90, 90, 120, 135, 150]);
    const ans = deg < 90 ? 0 : deg === 90 ? 1 : 2;
    return { type: 'mc', fixed: true, q: t('Compare this angle to a right angle (a square corner).', 'Porównaj ten kąt z kątem prostym.'), svg: SVG.angle(deg),
      options: t(['Smaller than a right angle', 'Equal to a right angle', 'Larger than a right angle'], ['Mniejszy od prostego (ostry)', 'Prosty', 'Większy od prostego (rozwarty)']), answer: ans,
      explain: t(`A right angle is a quarter turn. This angle is ${['smaller than', 'exactly', 'larger than'][ans]} a right angle.`, `Kąt prosty to ćwierć obrotu (90°). Ten kąt jest ${['ostry (mniejszy)', 'prosty', 'rozwarty (większy)'][ans]}.`) };
  };
  S.angleCompare = () => ({ _deg: true });
  G.angleCompare = ((orig) => (a) => {
    if (!a._deg) return orig(a);
    const t = L(a);
    const deg = pick([45, 90, 135, 180]);
    const opts = ['45°', '90°', '135°', '180°'];
    return { type: 'mc', fixed: true, q: t('About how many degrees is this angle?', 'Ile mniej więcej stopni ma ten kąt?'), svg: SVG.angle(deg === 180 ? 179 : deg), options: opts, answer: opts.indexOf(deg + '°'), explain: t(`A right angle is 90°, half of it is 45°, a straight angle is 180°. This is ${deg}°.`, `Kąt prosty ma 90°, połowa to 45°, kąt półpełny 180°. Ten ma ${deg}°.`) };
  })(G.angleCompare);
  G.turns = (a) => {
    const t = L(a);
    const facts = a.lang === 'pl' ? [['Ile kątów prostych składa się na pełny obrót?', 4], ['Ile kątów prostych to pół obrotu?', 2], ['Ile stopni ma kąt prosty?', 90], ['Ile stopni ma pełny obrót?', 360], ['Ile stopni ma kąt półpełny?', 180]]
      : [['How many right angles make a full turn?', 4], ['How many right angles make a half turn?', 2], ['How many quarter turns make a full turn?', 4], ['How many degrees in a right angle?', 90], ['How many degrees in a full turn?', 360]];
    const [q, ans] = pick(facts);
    return inputNum(q, ans, t(`A quarter turn = 90°, half turn = 180°, full turn = 360°.`, `Ćwierć obrotu = 90°, pół obrotu = 180°, pełny obrót = 360°.`));
  };
  G.shape2d = (a) => {
    const t = L(a);
    const shapes = a.lang === 'pl' ? [['trójkąt', 3], ['kwadrat', 4], ['prostokąt', 4], ['pięciokąt', 5], ['sześciokąt', 6], ['ośmiokąt', 8], ['romb', 4], ['trapez', 4], ['równoległobok', 4]] : [['triangle', 3], ['square', 4], ['rectangle', 4], ['pentagon', 5], ['hexagon', 6], ['octagon', 8], ['rhombus', 4], ['trapezium', 4], ['parallelogram', 4]];
    const [s, n] = pick(shapes);
    return inputNum(t(`How many straight sides does a **${s}** have?`, `Ile boków ma **${s}**?`), n, t(`A ${s} has ${n} sides and ${n} vertices.`, `${s[0].toUpperCase() + s.slice(1)} ma ${n} boków i ${n} wierzchołków.`));
  };
  G.shape3d = (a) => {
    const t = L(a);
    const objs = a.lang === 'pl'
      ? [['sześcian', 'ścian', 6], ['sześcian', 'krawędzi', 12], ['sześcian', 'wierzchołków', 8], ['prostopadłościan', 'ścian', 6], ['prostopadłościan', 'krawędzi', 12], ['ostrosłup czworokątny', 'ścian', 5], ['ostrosłup czworokątny', 'wierzchołków', 5], ['graniastosłup trójkątny', 'ścian', 5], ['walec', 'płaskich podstaw', 2], ['stożek', 'płaskich podstaw', 1], ['kula', 'płaskich ścian', 0]]
      : [['cube', 'faces', 6], ['cube', 'edges', 12], ['cube', 'vertices (corners)', 8], ['rectangular prism', 'faces', 6], ['rectangular prism', 'edges', 12], ['square-based pyramid', 'faces', 5], ['square-based pyramid', 'vertices (corners)', 5], ['triangular prism', 'faces', 5], ['cylinder', 'flat faces', 2], ['cone', 'flat faces', 1], ['sphere', 'flat faces', 0]];
    const [o, part, n] = pick(objs);
    return inputNum(t(`How many **${part}** does a **${o}** have?`, `Ile **${part}** ma **${o}**?`), n, t(`Faces are flat surfaces, edges are where faces meet, vertices are corners. A ${o} has ${n} ${part}.`, `Ściany to płaskie powierzchnie, krawędzie — miejsca, gdzie stykają się ściany, wierzchołki — narożniki. ${o[0].toUpperCase() + o.slice(1)}: ${n}.`));
  };
  G.symmetry = (a) => {
    const t = L(a);
    const items = a.lang === 'pl' ? [['kwadrat', '4'], ['prostokąt (nie kwadrat)', '2'], ['trójkąt równoboczny', '3'], ['koło', 'nieskończenie wiele'], ['sześciokąt foremny', '6'], ['wielka litera A', '1'], ['wielka litera H', '2'], ['wielka litera F', '0']]
      : [['a square', '4'], ['a rectangle (not a square)', '2'], ['an equilateral triangle', '3'], ['a circle', 'infinite'], ['a regular hexagon', '6'], ['the capital letter A', '1'], ['the capital letter H', '2'], ['the capital letter F', '0']];
    const [s, n] = pick(items);
    const all = a.lang === 'pl' ? ['0', '1', '2', '3', '4', '6', 'nieskończenie wiele'] : ['0', '1', '2', '3', '4', '6', 'infinite'];
    const opts = shuffle(shuffle(all.filter((x) => x !== n)).slice(0, 3).concat(n));
    return { type: 'mc', q: t(`How many lines of symmetry does **${s}** have?`, `Ile osi symetrii ma **${s}**?`), options: opts, answer: opts.indexOf(n), explain: t(`A line of symmetry folds a shape into two matching halves. ${s}: ${n}.`, `Oś symetrii dzieli figurę na dwie jednakowe, lustrzane połowy. ${s}: ${n}.`) };
  };
  G.gridMap = (a) => {
    const t = L(a);
    const cols = ['A', 'B', 'C', 'D'];
    const places = a.lang === 'pl' ? ['🏫 szkoła', '🏠 dom', '🌳 park', '🏪 sklep', '🏊 basen'] : ['🏫 school', '🏠 house', '🌳 park', '🏪 shop', '🏊 pool'];
    const pos = {}, used = new Set();
    places.forEach((p) => { let k; do { k = pick(cols) + R(1, 4); } while (used.has(k)); used.add(k); pos[p] = k; });
    const target = pick(places);
    let rows = '';
    for (let r = 4; r >= 1; r--) rows += `<tr><th>${r}</th>` + cols.map((c) => `<td>${(Object.keys(pos).find((p) => pos[p] === c + r) || '').split(' ')[0]}</td>`).join('') + '</tr>';
    const table = `<table class="gridmap">${rows}<tr><th></th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></table>`;
    const [icon, word] = target.split(' ');
    return { type: 'input', q: t(`On this grid map, what square is the **${word}** (${icon}) in? Write the letter then the number, e.g. B3.`, `W którym polu mapy jest **${word}** (${icon})? Zapisz literę i cyfrę, np. B3.`), svg: table, answer: [pos[target], pos[target].toLowerCase()],
      explain: t(`Go along the bottom for the letter, then up the side for the number: ${pos[target]}.`, `Najpierw litera na dole, potem cyfra z boku: ${pos[target]}.`) };
  };
  G.direction = (a) => {
    const t = L(a);
    const NOM = ['północ', 'wschód', 'południe', 'zachód'], LOC = ['północy', 'wschodzie', 'południu', 'zachodzie'];
    const items = a.lang === 'pl'
      ? [['Stoisz twarzą na północ i robisz ćwierć obrotu w prawo (zgodnie ze wskazówkami zegara). W którą stronę patrzysz?', NOM, 1], ['Stoisz twarzą na północ i robisz pół obrotu. W którą stronę patrzysz?', NOM, 2], ['Stoisz twarzą na wschód i robisz ćwierć obrotu w lewo. W którą stronę patrzysz?', NOM, 0], ['Słońce wschodzi na…', LOC, 1], ['Słońce zachodzi na…', LOC, 3], ['W południe w Polsce słońce jest na…', LOC, 2]]
      : [['You face north and make a quarter turn clockwise. Which way do you face now?', null, 1], ['You face north and make a half turn. Which way do you face now?', null, 2], ['You face east and make a quarter turn anticlockwise. Which way do you face now?', null, 0], ['You face south and make a quarter turn clockwise. Which way do you face now?', null, 3], ['The sun rises in the…', null, 1], ['The sun sets in the…', null, 3]];
    const [q, set, ans] = pick(items);
    const opts = set || ['North', 'East', 'South', 'West'];
    return { type: 'mc', fixed: true, q, options: opts, answer: ans, explain: t(`Clockwise goes North → East → South → West. Answer: ${opts[ans]}.`, `Zgodnie ze wskazówkami zegara: północ → wschód → południe → zachód. Odpowiedź: ${opts[ans]}.`) };
  };

  /* ===== Data & chance ===== */
  G.readGraph = (a) => {
    const t = L(a);
    const sets = a.lang === 'pl' ? [['Ulubiony owoc', ['Jabłko', 'Banan', 'Gruszka', 'Śliwka']], ['Zwierzęta w naszej klasie', ['Pies', 'Kot', 'Rybka', 'Chomik']], ['Jak dojeżdżamy do szkoły', ['Pieszo', 'Autem', 'Autobusem', 'Rowerem']], ['Ulubiony sport', ['Piłka', 'Pływanie', 'Siatkówka', 'Narty']]]
      : [['Favourite fruit', ['Apple', 'Banana', 'Mango', 'Grapes']], ['Pets in our class', ['Dog', 'Cat', 'Fish', 'Bird']], ['How we get to school', ['Walk', 'Car', 'Bus', 'Bike']], ['Favourite sport', ['Footy', 'Cricket', 'Netball', 'Soccer']]];
    const [title, labels] = pick(sets);
    const scale = a.scale || 1;
    const values = labels.map(() => R(1, 9) * scale);
    const kind = R(0, a.total ? 3 : 2);
    const svg = SVG.bars(labels, values, title, scale);
    if (kind === 0) { const i = R(0, 3); return Object.assign(inputNum(t(`Look at the column graph. How many chose **${labels[i]}**?`, `Spójrz na diagram. Ile osób wybrało: **${labels[i]}**?`), values[i], t(`Find the ${labels[i]} column and read across to the scale: ${values[i]}.`, `Znajdź słupek „${labels[i]}” i odczytaj wartość na osi: ${values[i]}.`)), { svg }); }
    if (kind === 1) { const max = Math.max(...values); if (values.filter((v) => v === max).length > 1) return G.readGraph(a); return { type: 'mc', q: t('Which was the **most** popular?', 'Co było **najpopularniejsze**?'), svg, options: labels.slice(), answer: values.indexOf(max), explain: t(`The tallest column: ${labels[values.indexOf(max)]} (${max}).`, `Najwyższy słupek: ${labels[values.indexOf(max)]} (${max}).`) }; }
    if (kind === 3) { const tot = values.reduce((s, v) => s + v, 0); return Object.assign(inputNum(t('How many answers were there **altogether**?', 'Ile było **wszystkich** odpowiedzi?'), tot, t(`Add every column: ${values.join(' + ')} = ${tot}.`, `Dodaj wszystkie słupki: ${values.join(' + ')} = ${tot}.`)), { svg }); }
    const [i, j] = U.sample([0, 1, 2, 3], 2);
    return Object.assign(inputNum(t(`How many **more** chose ${labels[i]} than ${labels[j]}? (If fewer, write 0.)`, `O ile więcej osób wybrało „${labels[i]}” niż „${labels[j]}”? (Jeśli mniej, wpisz 0.)`), Math.max(0, values[i] - values[j]), t(`${values[i]} − ${values[j]}.`, `${values[i]} − ${values[j]}.`)), { svg });
  };
  S.readGraph = () => ({ scale: 5, total: true });
  G.tally = (a) => {
    const t = L(a);
    const n = R(3, a.max || 19);
    const tally = '卌 '.repeat(Math.floor(n / 5)) + '|'.repeat(n % 5);
    return inputNum(t(`What number do these tally marks show?  **${tally.trim()}**   (卌 = a bundle of 5)`, `Jaką liczbę pokazują kreski?  **${tally.trim()}**   (卌 = pięć)`), n, t(`${Math.floor(n / 5)} bundles of 5 = ${Math.floor(n / 5) * 5}, plus ${n % 5} = ${n}.`, `${Math.floor(n / 5)} piątki = ${Math.floor(n / 5) * 5}, plus ${n % 5} = ${n}.`));
  };
  G.chance = (a) => {
    const t = L(a);
    const items = a.lang === 'pl'
      ? [['Jutro wzejdzie słońce.', 'Pewne'], ['W lipcu w Warszawie spadnie metr śniegu.', 'Niemożliwe'], ['Wyrzucisz 7 na zwykłej kostce do gry.', 'Niemożliwe'], ['Rzucona moneta wypadnie orłem.', 'Tak samo możliwe'], ['Wylosujesz czerwoną kulkę z worka z 9 czerwonymi i 1 niebieską.', 'Bardzo możliwe'], ['Wylosujesz niebieską kulkę z worka z 9 czerwonymi i 1 niebieską.', 'Mało możliwe'], ['Wyrzucisz liczbę parzystą na kostce.', 'Tak samo możliwe'], ['Kot poprowadzi jutro autobus szkolny.', 'Niemożliwe']]
      : [['The sun will rise tomorrow.', 'Certain'], ['It will snow in Darwin in January.', 'Impossible'], ['You will roll a 7 on a normal six-sided die.', 'Impossible'], ['A tossed coin will land on heads.', 'Even chance'], ['You will pick a red marble from a bag with 9 red and 1 blue.', 'Likely'], ['You will pick a blue marble from a bag with 9 red and 1 blue.', 'Unlikely'], ['You will roll an even number on a six-sided die.', 'Even chance'], ['A cat will drive the school bus tomorrow.', 'Impossible']];
    const opts = a.lang === 'pl' ? ['Niemożliwe', 'Mało możliwe', 'Tak samo możliwe', 'Bardzo możliwe', 'Pewne'] : ['Impossible', 'Unlikely', 'Even chance', 'Likely', 'Certain'];
    const [ev, ans] = pick(items);
    return { type: 'mc', fixed: true, q: t(`How likely is this? **${ev}**`, `Jak bardzo jest to możliwe? **${ev}**`), options: opts, answer: opts.indexOf(ans), explain: t(`From impossible → certain, this one is "${ans}".`, `Od niemożliwego do pewnego — to jest: „${ans}”.`) };
  };
  G.outcomes = (a) => {
    const t = L(a);
    const items = a.lang === 'pl' ? [['rzucie monetą', 2, 'orzeł, reszka'], ['rzucie zwykłą kostką do gry', 6, '1, 2, 3, 4, 5, 6'], ['zakręceniu kołem z 4 równymi polami', 4, 'czerwone, niebieskie, zielone, żółte'], ['losowaniu dnia tygodnia', 7, 'od poniedziałku do niedzieli']]
      : [['tossing a coin', 2, 'heads, tails'], ['rolling a normal six-sided die', 6, '1, 2, 3, 4, 5, 6'], ['spinning a spinner with 4 equal coloured parts', 4, 'red, blue, green, yellow'], ['picking a day of the week at random', 7, 'Monday to Sunday']];
    const [what, n, list] = pick(items);
    return inputNum(t(`How many different possible outcomes are there when **${what}**?`, `Ile jest możliwych wyników przy **${what}**?`), n, t(`List them: ${list}. That's ${n}.`, `Wypisz je: ${list}. To ${n}.`));
  };

  /* ===== Roman numerals (Polish curriculum) ===== */
  G.roman = (a) => {
    const t = L(a);
    const n = R(1, a.max || 12), r = U.toRoman(n);
    if (Math.random() < 0.5) return inputNum(t(`What number is **${r}**?`, `Jaką liczbę oznacza **${r}**?`), n, t(`${r} = ${n}. I=1, V=5, X=10, L=50, C=100. A smaller numeral before a bigger one is subtracted (IV = 4).`, `${r} = ${n}. I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Mniejsza cyfra przed większą oznacza odejmowanie (IV = 4).`));
    return { type: 'input', caseSensitive: false, q: t(`Write **${n}** in Roman numerals.`, `Zapisz liczbę **${n}** cyframi rzymskimi.`), answer: [r], explain: t(`${n} = ${r}.`, `${n} = ${r}.`) };
  };
  S.roman = (a) => ({ max: (a.max || 12) <= 12 ? 39 : 3000 });

  /* ===== English language generators ===== */
  G.plural = () => {
    const words = [['fox', 'foxes'], ['baby', 'babies'], ['leaf', 'leaves'], ['child', 'children'], ['mouse', 'mice'], ['bus', 'buses'], ['lady', 'ladies'], ['knife', 'knives'], ['tooth', 'teeth'], ['box', 'boxes'], ['monkey', 'monkeys'], ['wish', 'wishes'], ['sheep', 'sheep'], ['berry', 'berries'], ['church', 'churches'], ['wolf', 'wolves'], ['day', 'days'], ['potato', 'potatoes'], ['woman', 'women'], ['goose', 'geese'], ['city', 'cities'], ['half', 'halves']];
    const [s, p] = pick(words);
    return { type: 'input', q: `Write the plural (more than one) of **${s}**.`, answer: [p], explain: `${s} → ${p}. Add -es after s, x, ch, sh; consonant + y → -ies; many f/fe → -ves; some are irregular (child → children).` };
  };
  G.pastTense = () => {
    const words = [['jump', 'jumped'], ['run', 'ran'], ['swim', 'swam'], ['go', 'went'], ['hop', 'hopped'], ['carry', 'carried'], ['eat', 'ate'], ['see', 'saw'], ['write', 'wrote'], ['bake', 'baked'], ['stop', 'stopped'], ['think', 'thought'], ['catch', 'caught'], ['fly', 'flew'], ['make', 'made'], ['play', 'played'], ['sing', 'sang'], ['take', 'took'], ['bring', 'brought'], ['teach', 'taught'], ['drive', 'drove'], ['try', 'tried']];
    const [s, p] = pick(words);
    return { type: 'input', q: `Write the past tense of **${s}**. (Yesterday I ___.)`, answer: [p], explain: `${s} → ${p}. Regular verbs add -ed (hop → hopped, carry → carried). Irregular verbs change (go → went).` };
  };
  G.contraction = () => {
    const words = [['do not', "don't"], ['can not', "can't"], ['I am', "I'm"], ['it is', "it's"], ['they are', "they're"], ['we will', "we'll"], ['she is', "she's"], ['did not', "didn't"], ['you are', "you're"], ['will not', "won't"], ['I have', "I've"], ['could not', "couldn't"], ['should have', "should've"], ['we are', "we're"]];
    const [s, p] = pick(words);
    return { type: 'input', q: `Write the contraction (short form with an apostrophe) for **${s}**.`, answer: [p, p.replace("'", '’')], explain: `${s} → ${p}. The apostrophe shows where letters are missing.` };
  };
  G.suffix = () => {
    const words = [['happy', 'ness', 'happiness'], ['help', 'ful', 'helpful'], ['care', 'less', 'careless'], ['quick', 'ly', 'quickly'], ['hope', 'ful', 'hopeful'], ['kind', 'ness', 'kindness'], ['run', 'ing', 'running'], ['make', 'ing', 'making'], ['big', 'er', 'bigger'], ['funny', 'est', 'funniest'], ['enjoy', 'ment', 'enjoyment'], ['easy', 'ly', 'easily'], ['beauty', 'ful', 'beautiful'], ['swim', 'er', 'swimmer'], ['wash', 'able', 'washable']];
    const [b, s, w] = pick(words);
    return { type: 'input', q: `Add the suffix: **${b} + ${s} = ?**`, answer: [w], explain: `${b} + ${s} = ${w}. Rules: y → i (happy → happiness), drop the silent e (make → making), double the last consonant in short words (run → running).` };
  };
  G.prefix = () => {
    const items = [['un', 'happy', 'not happy'], ['re', 'build', 'build again'], ['dis', 'agree', 'not agree'], ['pre', 'heat', 'heat before'], ['mis', 'spell', 'spell wrongly'], ['un', 'lock', 'opposite of lock'], ['re', 'write', 'write again'], ['dis', 'appear', 'opposite of appear'], ['sub', 'way', 'a way under the ground'], ['tri', 'angle', 'a shape with three angles']];
    const [p, b, m] = pick(items);
    const all = [...new Set(items.map((i) => i[2]))];
    const opts = shuffle([m, ...shuffle(all.filter((x) => x !== m)).slice(0, 3)]);
    return { type: 'mc', q: `What does **${p}${b}** mean?`, options: opts, answer: opts.indexOf(m), explain: `The prefix "${p}-" means "${{ un: 'not / opposite', re: 'again', dis: 'not / opposite', pre: 'before', mis: 'wrongly', sub: 'under', tri: 'three' }[p]}". ${p}${b} = ${m}.` };
  };
  G.homophone = () => {
    const items = [
      ['I can ___ the ocean from here.', ['see', 'sea'], 0], ['The ___ is very deep.', ['see', 'sea'], 1], ['___ going to the beach.', ["They're", 'There', 'Their'], 0], ['Put it over ___.', ["they're", 'there', 'their'], 1],
      ['That is ___ dog.', ["they're", 'there', 'their'], 2], ['I have ___ apples.', ['two', 'to', 'too'], 0], ['I want to come ___!', ['two', 'to', 'too'], 2], ['We walked ___ the park.', ['two', 'to', 'too'], 1],
      ['The wind ___ the leaves away.', ['blew', 'blue'], 0], ['I ___ the answer!', ['know', 'no'], 0], ['Did you ___ the bell?', ['here', 'hear'], 1], ['___ coat is this?', ['Whose', "Who's"], 0],
      ['It wagged ___ tail.', ['its', "it's"], 0], ['___ raining today.', ['Its', "It's"], 1], ['I ate the whole ___.', ['pear', 'pair'], 0], ['Press the ___ to stop the bike.', ['brake', 'break'], 0], ['Can I have a ___ of cake?', ['peace', 'piece'], 1], ['___ welcome to join us.', ["You're", 'Your'], 0],
    ];
    const [s, opts, ans] = pick(items);
    return { type: 'mc', fixed: true, q: `Choose the correct word: **${s}**`, options: opts, answer: ans, explain: `Homophones sound the same but have different spellings and meanings. Here it is "${opts[ans]}".` };
  };
  G.syllables = (a) => {
    const t = L(a);
    const words = a.lang === 'pl' ? [['kangur', 2], ['wiewiórka', 3], ['parasol', 3], ['kot', 1], ['motyl', 2], ['gąsienica', 4], ['telewizor', 4], ['słoń', 1], ['biedronka', 3], ['hipopotam', 4], ['dom', 1], ['pomarańcza', 4]] : [['kangaroo', 3], ['wombat', 2], ['platypus', 3], ['echidna', 3], ['computer', 3], ['dog', 1], ['butterfly', 3], ['caterpillar', 4], ['Australia', 4], ['elephant', 3], ['school', 1], ['happy', 2], ['watermelon', 4], ['koala', 3]];
    const [w, n] = pick(words);
    return inputNum(t(`How many syllables (beats) in **${w}**?`, `Ile sylab ma wyraz **${w}**?`), n, t(`Clap it out — each beat is a syllable. ${w}: ${n}.`, `Wyklaszcz wyraz — każde klaśnięcie to sylaba. ${w}: ${n}.`));
  };
  G.alphaOrder = (a) => {
    const t = L(a);
    const sets = a.lang === 'pl' ? [['agrest', 'banan', 'czereśnia', 'dynia'], ['kot', 'koń', 'koza', 'kura'], ['słoń', 'sowa', 'sarna', 'sikorka'], ['tramwaj', 'taksówka', 'traktor', 'tir']] : [['apple', 'banana', 'cherry', 'date'], ['koala', 'kangaroo', 'kookaburra', 'kiwi'], ['sun', 'sand', 'sea', 'shell'], ['tram', 'train', 'truck', 'taxi'], ['bird', 'bear', 'bull', 'bat']];
    const set = pick(sets);
    const sorted = set.slice().sort((x, y) => x.localeCompare(y, a.lang === 'pl' ? 'pl' : 'en'));
    return { type: 'mc', q: t(`Which word comes **first** in alphabetical order? **${shuffle(set).join(', ')}**`, `Który wyraz jest **pierwszy** w kolejności alfabetycznej? **${shuffle(set).join(', ')}**`), options: set.slice(), answer: set.indexOf(sorted[0]), explain: t(`Compare letter by letter. Order: ${sorted.join(', ')}.`, `Porównuj litera po literze. Kolejność: ${sorted.join(', ')}.`) };
  };
  G.synonym = () => {
    const items = [['big', 'large'], ['happy', 'glad'], ['quick', 'fast'], ['angry', 'cross'], ['small', 'tiny'], ['begin', 'start'], ['shut', 'close'], ['scared', 'afraid'], ['smart', 'clever'], ['tired', 'sleepy'], ['enormous', 'huge'], ['shout', 'yell']];
    const [w, s] = pick(items);
    const opts = shuffle([s, ...shuffle(items.filter((i) => i[0] !== w).map((i) => i[1])).slice(0, 3)]);
    return { type: 'mc', q: `Which word means **almost the same** as **${w}** (a synonym)?`, options: opts, answer: opts.indexOf(s), explain: `${w} and ${s} are synonyms — they mean nearly the same thing.` };
  };
  G.antonym = () => {
    const items = [['hot', 'cold'], ['up', 'down'], ['early', 'late'], ['full', 'empty'], ['ancient', 'modern'], ['brave', 'cowardly'], ['loud', 'quiet'], ['heavy', 'light'], ['noisy', 'silent'], ['arrive', 'leave'], ['shallow', 'deep'], ['tight', 'loose']];
    const [w, s] = pick(items);
    const opts = shuffle([s, ...shuffle(items.filter((i) => i[0] !== w).map((i) => i[1])).slice(0, 3)]);
    return { type: 'mc', q: `Which word means the **opposite** of **${w}** (an antonym)?`, options: opts, answer: opts.indexOf(s), explain: `${w} ↔ ${s} — antonyms are opposites.` };
  };
  G.wordClass = () => {
    const items = [
      ['The **koala** slept.', 'noun'], ['The **fluffy** koala slept.', 'adjective'], ['The koala **slept**.', 'verb'], ['The koala slept **peacefully**.', 'adverb'], ['**She** climbed the tree.', 'pronoun'], ['The bird sat **on** the branch.', 'preposition'],
      ['I like apples **and** pears.', 'conjunction'], ['The **ancient** ruins crumbled.', 'adjective'], ['We **raced** to the gate.', 'verb'], ['They ate **quickly**.', 'adverb'], ['A **mob** of kangaroos hopped by.', 'noun'], ['It hid **under** the bed.', 'preposition'],
    ];
    const [s, cls] = pick(items);
    const opts = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'];
    const o = shuffle([cls, ...shuffle(opts.filter((x) => x !== cls)).slice(0, 3)]);
    return { type: 'mc', q: `What type of word is in bold? ${s}`, options: o, answer: o.indexOf(cls), explain: `Nouns name things, verbs are actions, adjectives describe nouns, adverbs describe verbs, pronouns replace nouns, prepositions show position, conjunctions join. It's a ${cls}.` };
  };
  G.punctuate = () => {
    const items = [
      ['Where are you going', '?'], ['Watch out for the snake', '!'], ['My brother likes cricket', '.'], ['What a beautiful sunset', '!'], ['Can you help me', '?'], ['The bus leaves at nine', '.'], ['How old are you', '?'], ['Hooray, we won', '!'],
    ];
    const [s, p] = pick(items);
    return { type: 'mc', fixed: true, q: `Which punctuation mark ends this sentence? **${s}___**`, options: ['.', '?', '!'], answer: ['.', '?', '!'].indexOf(p), explain: `Statements end with a full stop, questions with a question mark, and strong feelings or warnings with an exclamation mark.` };
  };
  G.apostrophe = () => {
    const items = [['the tail of the dog', "the dog's tail"], ['the toys of the children', "the children's toys"], ['the nests of the birds', "the birds' nests"], ['the hat of Mia', "Mia's hat"], ['the bikes of the boys', "the boys' bikes"], ['the book of the teacher', "the teacher's book"]];
    const [lng, sh] = pick(items);
    return { type: 'input', q: `Write it the short way using an apostrophe: **${lng}**`, answer: [sh, sh.replace(/'/g, '’')], explain: `One owner: add 's. Plural owners ending in s: add ' after the s. Plurals not ending in s (children): add 's. → ${sh}.` };
  };

  /* Dictation of a given word list: args.words = [[word, sentence], ...] */
  G.dictation = (a) => {
    const [w, s] = pick(a.words || [['because', 'I stayed inside because it rained.']]);
    return { type: 'input', dictation: true, q: '', say: w, sayContext: s, answer: [w], explain: L(a)(`The word is spelt: ${w.split('').join(' - ')}.`, `Ten wyraz piszemy tak: ${w.split('').join(' - ')}.`) };
  };
})();

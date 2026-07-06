/* Matematyka Tosi — pure core logic (web port).
 *
 * A 1:1 port of the Swift core (MatematykaTosi/Core/*), which is covered by
 * 66 unit tests; the same suite is ported to scripts/web-core-tests and run
 * with `node --test`. No DOM, no storage — pure functions only.
 */
(function (global) {
  "use strict";

  // ---------------------------------------------------------------- RNG

  /** Deterministic RNG (mulberry32) for tests; app passes Math.random. */
  function seededRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, lo, hi) {
    return lo + Math.floor(rng() * (hi - lo + 1));
  }

  function choice(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  // ---------------------------------------------------------------- Types

  const OPS = ["addition", "subtraction", "multiplication", "division"];
  const SYMBOL = { addition: "+", subtraction: "−", multiplication: "×", division: "÷" };
  const OP_EMOJI = { addition: "➕", subtraction: "➖", multiplication: "✖️", division: "➗" };
  const DIFFICULTIES = ["easy", "medium", "hard", "genius"];
  const RANGES = [20, 30, 50, 100];

  /** Problem: {op, a, b, c, kind}; kind: standard|missingA|missingB|twoStep */
  function problem(op, a, b, c, kind) {
    return { op, a, b, c: c || 0, kind: kind || "standard" };
  }

  function factResult(p) {
    switch (p.op) {
      case "addition": return p.a + p.b;
      case "subtraction": return p.a - p.b;
      case "multiplication": return p.a * p.b;
      case "division": return p.b === 0 ? 0 : Math.floor(p.a / p.b);
    }
  }

  function answer(p) {
    switch (p.kind) {
      case "standard": return factResult(p);
      case "missingA": return p.a;
      case "missingB": return p.b;
      case "twoStep": return p.op === "addition" ? p.a + p.b * p.c : p.a - p.b * p.c;
    }
  }

  /** Split prompt into {prefix, suffix} around the answer slot. */
  function promptParts(p) {
    const s = SYMBOL[p.op];
    switch (p.kind) {
      case "standard": return { prefix: `${p.a} ${s} ${p.b} = `, suffix: "" };
      case "missingA": return { prefix: "", suffix: ` ${s} ${p.b} = ${factResult(p)}` };
      case "missingB": return { prefix: `${p.a} ${s} `, suffix: ` = ${factResult(p)}` };
      case "twoStep": return { prefix: `${p.a} ${s} ${p.b} × ${p.c} = `, suffix: "" };
    }
  }

  function displayText(p) {
    const parts = promptParts(p);
    return parts.prefix + "?" + parts.suffix;
  }

  function problemsEqual(p, q) {
    return !!p && !!q && p.op === q.op && p.a === q.a && p.b === q.b &&
      p.c === q.c && p.kind === q.kind;
  }

  // ---------------------------------------------------------------- Generator

  function additionProblem(range, difficulty, rng) {
    for (let i = 0; i < 400; i++) {
      let a, b;
      if (difficulty === "easy") {
        a = randInt(rng, 1, range - 1);
        b = randInt(rng, 1, Math.min(10, range - a));
        if ((a % 10) + (b % 10) > 9) continue;         // no tens crossing
      } else if (difficulty === "medium") {
        a = randInt(rng, 1, range - 1);
        b = randInt(rng, 1, range - a);
        if ((a % 10) + (b % 10) < 10) continue;        // must cross the tens
      } else {
        a = randInt(rng, 2, range - 2);
        b = randInt(rng, 2, range - a);
      }
      return problem("addition", a, b);
    }
    const a = randInt(rng, 1, range - 1);
    return problem("addition", a, randInt(rng, 1, range - a));
  }

  function subtractionProblem(range, difficulty, rng) {
    for (let i = 0; i < 400; i++) {
      let a, b;
      if (difficulty === "easy") {
        a = randInt(rng, 2, range);
        b = randInt(rng, 1, Math.min(10, a));
        if (a % 10 < b % 10) continue;                 // no borrowing
      } else if (difficulty === "medium") {
        a = randInt(rng, 2, range);
        b = randInt(rng, 1, a);
        if (a % 10 >= b % 10) continue;                // must borrow
      } else {
        a = randInt(rng, 3, range);
        b = randInt(rng, 2, a);
      }
      return problem("subtraction", a, b);
    }
    const a = randInt(rng, 2, range);
    return problem("subtraction", a, randInt(rng, 1, a));
  }

  function orderedFactors(x, y, op, rng) {
    return rng() < 0.5 ? problem(op, x, y) : problem(op, y, x);
  }

  function multiplicationProblem(range, difficulty, rng) {
    if (difficulty === "easy") {
      // Tables of 2, 5 and 10; ×1 allowed only here, ×0 never.
      const f = choice(rng, [2, 5, 10]);
      const other = randInt(rng, 1, Math.max(1, Math.floor(range / f)));
      return orderedFactors(f, other, "multiplication", rng);
    }
    if (difficulty === "medium") {
      for (let i = 0; i < 400; i++) {
        const a = randInt(rng, 2, 5);
        const b = randInt(rng, 2, 5);
        if (a * b <= range) return problem("multiplication", a, b);
      }
      return problem("multiplication", 2, 2);
    }
    // hard / genius: one factor from 6–9.
    for (let i = 0; i < 400; i++) {
      const f = randInt(rng, 6, 9);
      const maxOther = Math.floor(range / f);
      if (maxOther < 2) continue;
      const other = randInt(rng, 2, Math.min(10, maxOther));
      return orderedFactors(f, other, "multiplication", rng);
    }
    return multiplicationProblem(range, "medium", rng);
  }

  function divisionProblem(range, difficulty, rng) {
    if (difficulty === "easy") {
      const d = choice(rng, [2, 5, 10]);
      const q = randInt(rng, 1, Math.max(1, Math.floor(range / d)));
      return problem("division", d * q, d);
    }
    if (difficulty === "medium") {
      for (let i = 0; i < 400; i++) {
        const d = randInt(rng, 2, 5);
        const q = randInt(rng, 2, 5);
        if (d * q <= range) return problem("division", d * q, d);
      }
      return problem("division", 4, 2);
    }
    for (let i = 0; i < 400; i++) {
      const d = randInt(rng, 6, 9);
      const maxQ = Math.floor(range / d);
      if (maxQ < 2) continue;
      const q = randInt(rng, 2, Math.min(10, maxQ));
      return problem("division", d * q, d);
    }
    return divisionProblem(range, "medium", rng);
  }

  function standardProblem(op, config, rng) {
    const r = config.range;
    switch (op) {
      case "addition": return additionProblem(r, config.difficulty, rng);
      case "subtraction": return subtractionProblem(r, config.difficulty, rng);
      case "multiplication": return multiplicationProblem(r, config.difficulty, rng);
      case "division": return divisionProblem(r, config.difficulty, rng);
    }
  }

  function missingOperandProblem(op, config, rng) {
    const base = standardProblem(op, config, rng);
    const kind = rng() < 0.5 ? "missingA" : "missingB";
    return problem(base.op, base.a, base.b, 0, kind);
  }

  /** "4 + 3 × 2" — a ± (b × c), multiplication binds first, never negative. */
  function twoStepProblem(operations, config, rng) {
    const range = config.range;
    const candidates = [];
    if (operations.includes("addition")) candidates.push("addition");
    if (operations.includes("subtraction")) candidates.push("subtraction");
    const op = candidates.length ? choice(rng, candidates) : "addition";
    for (let i = 0; i < 400; i++) {
      const b = randInt(rng, 2, 5);
      const c = randInt(rng, 2, 5);
      const product = b * c;
      if (product >= range) continue;
      if (op === "addition") {
        if (range - product < 1) continue;
        return problem("addition", randInt(rng, 1, range - product), b, c, "twoStep");
      }
      return problem("subtraction", randInt(rng, product, range), b, c, "twoStep");
    }
    return problem("addition", 4, 3, 2, "twoStep");
  }

  function makeOne(operations, config, rng) {
    const op = choice(rng, operations);
    if (config.difficulty === "genius") {
      const roll = rng();
      const canTwoStep = operations.includes("addition") || operations.includes("subtraction");
      if (canTwoStep && roll < 0.15) return twoStepProblem(operations, config, rng);
      if (roll < 0.45) return missingOperandProblem(op, config, rng);
    }
    return standardProblem(op, config, rng);
  }

  /** config: {operations: [..], range: 20|30|50|100, difficulty} */
  function generate(config, avoiding, rng) {
    const ops = (config.operations && config.operations.length
      ? config.operations.slice() : OPS.slice()).sort();
    let candidate = makeOne(ops, config, rng);
    let attempts = 0;
    while (problemsEqual(candidate, avoiding) && attempts < 300) {
      candidate = makeOne(ops, config, rng);
      attempts++;
    }
    return candidate;
  }

  /** Fresh, plain problem of the same operation (used after a tutorial). */
  function generateSimilar(p, config, rng) {
    const cfg = Object.assign({}, config, { operations: [p.op] });
    let candidate = standardProblem(p.op, cfg, rng);
    let attempts = 0;
    while (problemsEqual(candidate, p) && attempts < 300) {
      candidate = standardProblem(p.op, cfg, rng);
      attempts++;
    }
    return candidate;
  }

  // ---------------------------------------------------------------- Praise

  /** Heuristic Polish vocative: "Tosia" → "Tosiu", "Marta" → "Marto". */
  function vocative(name) {
    const n = (name || "").trim();
    if (n.length <= 2) return n;
    const lower = n.toLowerCase();
    if (!lower.endsWith("a")) return n;
    const soft = ["sia", "cia", "zia", "nia", "dzia", "la"];
    if (soft.some((e) => lower.endsWith(e))) return n.slice(0, -1) + "u";
    return n.slice(0, -1) + "o";
  }

  function fancy(word, pl, en) { return { word, pl, en }; }

  const PRAISES = [
    { pl: "Brawo, %V!", en: "Bravo, %V!" },
    { pl: "Świetna robota, %V!", en: "Great job, %V!" },
    { pl: "Jesteś niesamowita, %V!", en: "You're amazing, %V!" },
    { pl: "%N — mistrzyni matematyki!", en: "%N — math champion!" },
    { pl: "Fenomenalnie, %V!", en: "Phenomenal, %V!",
      fancy: fancy("fenomenalnie", "tak wspaniale, że aż trudno uwierzyć!", "so wonderful it's hard to believe!") },
    { pl: "Kapitalnie!", en: "Splendid!",
      fancy: fancy("kapitalnie", "naprawdę, naprawdę świetnie!", "really, really great!") },
    { pl: "Rewelacja, %V!", en: "Sensational, %V!",
      fancy: fancy("rewelacja", "coś tak dobrego, że wszyscy o tym mówią", "something so good everyone talks about it") },
    { pl: "Ekstra! Tak trzymaj, %V!", en: "Awesome! Keep it up, %V!" },
    { pl: "Znakomicie, %V!", en: "Excellent, %V!",
      fancy: fancy("znakomicie", "bardzo, bardzo dobrze", "very, very well") },
    { pl: "Imponująco, %V!", en: "Impressive, %V!",
      fancy: fancy("imponująco", "tak dobrze, że aż robi wrażenie", "so good it makes an impression") },
    { pl: "Brawurowo, %V!", en: "Daring and brilliant, %V!",
      fancy: fancy("brawurowo", "odważnie i po mistrzowsku", "bravely and masterfully") },
    { pl: "Perfekcyjnie, %V!", en: "Perfect, %V!",
      fancy: fancy("perfekcyjnie", "bez ani jednego błędu", "without a single mistake") },
    { pl: "Wyśmienicie, %V!", en: "Superb, %V!",
      fancy: fancy("wyśmienicie", "wyjątkowo dobrze — jak pyszny deser!", "exceptionally well — like a delicious dessert!") },
    { pl: "Mistrzowsko, %V!", en: "Masterful, %V!",
      fancy: fancy("mistrzowsko", "jak prawdziwa mistrzyni", "like a true champion") },
    { pl: "Koncertowo, %V!", en: "A virtuoso move, %V!",
      fancy: fancy("koncertowo", "tak pięknie, jak na wspaniałym koncercie", "as beautifully as at a great concert") },
    { pl: "Genialnie, %V!", en: "Genius, %V!" },
    { pl: "Super! To było szybkie, %V!", en: "Super! That was fast, %V!" },
    { pl: "Wspaniale, %V!", en: "Wonderful, %V!" },
    { pl: "Tak jest! Dokładnie tak, %V!", en: "Yes! Exactly right, %V!" },
    { pl: "Cudownie, %V!", en: "Marvelous, %V!" },
    { pl: "Doskonale, %V!", en: "Flawless, %V!",
      fancy: fancy("doskonale", "najlepiej, jak tylko się da", "the best it can possibly be") },
    { pl: "%N potrafi wszystko!", en: "%N can do anything!" },
    { pl: "Bomba! Dobra robota, %V!", en: "Boom! Nice work, %V!" },
    { pl: "Pięknie policzone, %V!", en: "Beautifully calculated, %V!" },
    { pl: "Nikt nie liczy tak jak %N!", en: "Nobody counts like %N!" },
    { pl: "Bezbłędnie, %V!", en: "Faultless, %V!",
      fancy: fancy("bezbłędnie", "bez żadnego, nawet malutkiego błędu", "without even the tiniest mistake") },
    { pl: "Hura! Kolejny sukces, %V!", en: "Hooray! Another success, %V!" },
    { pl: "Celująco, %V!", en: "Top marks, %V!",
      fancy: fancy("celująco", "na najwyższą możliwą ocenę w szkole", "worth the highest grade in school") },
  ];

  const MILESTONE_HEADLINES = [
    { pl: "Wspaniale, %V!", en: "Wonderful, %V!" },
    { pl: "%N, jesteś gwiazdą! ⭐", en: "%N, you're a star! ⭐" },
    { pl: "Niesamowite, %V!", en: "Incredible, %V!" },
    { pl: "Brawo, %V! Co za seria!", en: "Bravo, %V! What a streak!" },
    { pl: "%N — królowa liczb! 👑", en: "%N — queen of numbers! 👑" },
    { pl: "Fantastycznie, %V!", en: "Fantastic, %V!" },
    { pl: "%N, matematyka Cię kocha! 💜", en: "%N, math loves you! 💜" },
  ];

  function formatPhrase(template, lang, name) {
    const voc = lang === "pl" ? vocative(name) : name;
    return template.replace(/%V/g, voc).replace(/%N/g, name);
  }

  /** Never returns the same index twice in a row. */
  function nextPraise(lastIndex, rng) {
    if (PRAISES.length < 2) return 0;
    let index = Math.floor(rng() * PRAISES.length);
    while (index === lastIndex) index = Math.floor(rng() * PRAISES.length);
    return index;
  }

  function praiseAt(index) {
    const n = PRAISES.length;
    return PRAISES[((index % n) + n) % n];
  }

  function milestoneHeadline(milestoneNumber, lang, name) {
    const entry = MILESTONE_HEADLINES[milestoneNumber % MILESTONE_HEADLINES.length];
    return formatPhrase(lang === "pl" ? entry.pl : entry.en, lang, name);
  }

  // ---------------------------------------------------------------- Milestones & trophies

  const MILESTONE_SIZE = 5;

  function isMilestone(correctCount) {
    return correctCount > 0 && correctCount % MILESTONE_SIZE === 0;
  }
  function milestoneNumber(correctCount) {
    return Math.floor(correctCount / MILESTONE_SIZE);
  }
  function tier(msNumber) {
    return Math.min(Math.max(msNumber, 1), 5);
  }

  const TROPHIES = [
    { coins: 10, base: "🏺", badge: "✨", pl: "Garniec złota", en: "Pot of gold" },
    { coins: 20, base: "🏺", badge: "❤️", pl: "Wielki garniec z sercem", en: "Big gold pot with a heart" },
    { coins: 30, base: "🏺", badge: "🌈", pl: "Garniec z tęczą", en: "Pot with a rainbow" },
    { coins: 40, base: "💰", badge: "💎", pl: "Skrzynia skarbów", en: "Treasure chest" },
    { coins: 50, base: "💰", badge: "👑", pl: "Skrzynia z koroną", en: "Chest with a crown" },
    { coins: 60, base: "👑", badge: "💎", pl: "Królewska korona", en: "Royal crown" },
    { coins: 70, base: "💎", badge: "✨", pl: "Wielki diament", en: "Grand diamond" },
    { coins: 80, base: "🏰", badge: "🌟", pl: "Złoty zamek", en: "Golden castle" },
    { coins: 90, base: "🦄", badge: "👑", pl: "Złoty jednorożec", en: "Golden unicorn" },
    { coins: 100, base: "🏆", badge: "🌈", pl: "Tęczowy puchar mistrzyni", en: "Rainbow champion's cup" },
    { coins: 110, base: "🚀", badge: "⭐", pl: "Gwiezdna rakieta", en: "Star rocket" },
    { coins: 120, base: "🌟", badge: "🪄", pl: "Magiczna supergwiazda", en: "Magical superstar" },
  ];

  function trophyUnlockedAt(coins) {
    return TROPHIES.find((t) => t.coins === coins) || null;
  }
  function highestTrophy(coins) {
    let best = null;
    for (const t of TROPHIES) if (t.coins <= coins) best = t;
    return best;
  }
  function nextTrophy(coins) {
    return TROPHIES.find((t) => t.coins > coins) || null;
  }

  // ---------------------------------------------------------------- Badges

  /** attempts: [{t, op, diff, range, tries, time, tut, ok}] */
  function computeBadges(attempts, coins, bestStreak) {
    const correct = attempts.filter((a) => a.ok);
    const countOp = (op) => correct.filter((a) => a.op === op).length;
    return [
      { id: "firstCoin", emoji: "🪙", pl: "Pierwsza moneta", en: "First coin",
        descPl: "Zdobądź pierwszą złotą monetę", descEn: "Earn your first gold coin",
        earned: coins >= 1 },
      { id: "addMaster", emoji: "➕", pl: "Mistrzyni dodawania", en: "Addition master",
        descPl: "50 dobrych odpowiedzi z dodawania", descEn: "50 correct additions",
        earned: countOp("addition") >= 50 },
      { id: "subMaster", emoji: "➖", pl: "Mistrzyni odejmowania", en: "Subtraction master",
        descPl: "50 dobrych odpowiedzi z odejmowania", descEn: "50 correct subtractions",
        earned: countOp("subtraction") >= 50 },
      { id: "mulMaster", emoji: "✖️", pl: "Mistrzyni mnożenia", en: "Multiplication master",
        descPl: "50 dobrych odpowiedzi z mnożenia", descEn: "50 correct multiplications",
        earned: countOp("multiplication") >= 50 },
      { id: "divMaster", emoji: "➗", pl: "Mistrzyni dzielenia", en: "Division master",
        descPl: "50 dobrych odpowiedzi z dzielenia", descEn: "50 correct divisions",
        earned: countOp("division") >= 50 },
      { id: "hundred", emoji: "💯", pl: "Setka!", en: "One hundred!",
        descPl: "100 rozwiązanych zadań", descEn: "100 problems solved",
        earned: correct.length >= 100 },
      { id: "streak10", emoji: "🔥", pl: "Płomień", en: "On fire",
        descPl: "10 dobrych odpowiedzi z rzędu", descEn: "10 correct answers in a row",
        earned: bestStreak >= 10 },
      { id: "lightning", emoji: "⚡", pl: "Szybka jak błyskawica", en: "Lightning fast",
        descPl: "10 odpowiedzi szybciej niż w 5 sekund", descEn: "10 answers faster than 5 seconds",
        earned: correct.filter((a) => a.time > 0 && a.time <= 5).length >= 10 },
      { id: "collector", emoji: "💛", pl: "Kolekcjonerka", en: "Collector",
        descPl: "Zbierz 25 złotych monet", descEn: "Collect 25 gold coins",
        earned: coins >= 25 },
      { id: "learner", emoji: "🌱", pl: "Dzielna uczennica", en: "Brave learner",
        descPl: "Ukończ 5 samouczków — na błędach też się uczymy!",
        descEn: "Finish 5 tutorials — mistakes teach us too!",
        earned: attempts.filter((a) => a.tut).length >= 5 },
    ];
  }

  // ---------------------------------------------------------------- Tutorial plans

  function say(pl, en) { return { type: "say", pl, en }; }

  function additionSteps(a, b) {
    const steps = [];
    const bTens = Math.floor(b / 10) * 10;
    const bOnes = b % 10;
    if (bTens > 0 && bOnes > 0) {
      steps.push(say(`Rozłóżmy ${b} na dziesiątki i jedności!`,
                     `Let's split ${b} into tens and ones!`));
      steps.push({ type: "decompose", number: b, tens: bTens, ones: bOnes });
      steps.push({ type: "numberLine", start: a, jump: bTens, subtract: false });
      steps.push({ type: "numberLine", start: a + bTens, jump: bOnes, subtract: false });
    } else if ((a % 10) + (b % 10) >= 10 && b < 10 && a % 10 !== 0) {
      const gap = 10 - (a % 10);
      steps.push(say("Najpierw doskoczmy do pełnej dziesiątki!",
                     "First, let's hop to the next full ten!"));
      steps.push({ type: "decompose", number: b, tens: gap, ones: b - gap });
      steps.push({ type: "numberLine", start: a, jump: gap, subtract: false });
      steps.push({ type: "numberLine", start: a + gap, jump: b - gap, subtract: false });
    } else {
      steps.push(say("Skaczemy po osi liczbowej do przodu!",
                     "Let's jump forward on the number line!"));
      steps.push({ type: "numberLine", start: a, jump: b, subtract: false });
    }
    return steps;
  }

  function subtractionSteps(a, b) {
    const steps = [];
    const bTens = Math.floor(b / 10) * 10;
    const bOnes = b % 10;
    if (bTens > 0 && bOnes > 0) {
      steps.push(say(`Rozłóżmy ${b} na dziesiątki i jedności i skaczmy do tyłu!`,
                     `Let's split ${b} into tens and ones and jump backwards!`));
      steps.push({ type: "decompose", number: b, tens: bTens, ones: bOnes });
      steps.push({ type: "numberLine", start: a, jump: bTens, subtract: true });
      steps.push({ type: "numberLine", start: a - bTens, jump: bOnes, subtract: true });
    } else if (a % 10 < b % 10 && b < 10 && a % 10 !== 0) {
      const gap = a % 10;
      steps.push(say("Najpierw cofnijmy się do pełnej dziesiątki!",
                     "First, let's step back to the full ten!"));
      steps.push({ type: "decompose", number: b, tens: gap, ones: b - gap });
      steps.push({ type: "numberLine", start: a, jump: gap, subtract: true });
      steps.push({ type: "numberLine", start: a - gap, jump: b - gap, subtract: true });
    } else {
      steps.push(say("Skaczemy po osi liczbowej do tyłu!",
                     "Let's jump backwards on the number line!"));
      steps.push({ type: "numberLine", start: a, jump: b, subtract: true });
    }
    return steps;
  }

  function standardSteps(op, a, b) {
    switch (op) {
      case "addition": return additionSteps(a, b);
      case "subtraction": return subtractionSteps(a, b);
      case "multiplication":
        return [
          say(`${a} × ${b} to ${a} grup po ${b}. Policzmy razem!`,
              `${a} × ${b} means ${a} groups of ${b}. Let's count together!`),
          { type: "groups", count: a, size: b },
        ];
      case "division":
        return [
          say(`Rozdzielimy ${a} po równo do ${b} koszyków — dzielenie po równo!`,
              `We'll share ${a} equally into ${b} baskets — fair sharing!`),
          { type: "sharing", total: a, baskets: b },
        ];
    }
  }

  function statementFor(p) {
    const parts = promptParts(p);
    return parts.prefix + answer(p) + parts.suffix;
  }

  function twoStepSteps(p) {
    const product = p.b * p.c;
    const opWord = p.op === "addition"
      ? { pl: "dodajemy", en: "we add" } : { pl: "odejmujemy", en: "we subtract" };
    return [
      say(`Najpierw mnożenie: ${p.b} × ${p.c}!`, `Multiplication first: ${p.b} × ${p.c}!`),
      { type: "groups", count: p.b, size: p.c },
      say(`Teraz ${opWord.pl}: ${p.a} ${SYMBOL[p.op]} ${product}`,
          `Now ${opWord.en}: ${p.a} ${SYMBOL[p.op]} ${product}`),
      { type: "numberLine", start: p.a, jump: product, subtract: p.op === "subtraction" },
      { type: "reveal", statement: `${p.a} ${SYMBOL[p.op]} ${p.b} × ${p.c} = ${answer(p)}`, answer: answer(p) },
    ];
  }

  /** Missing-operand problems are taught through the inverse operation. */
  function missingOperandSteps(p) {
    const result = factResult(p);
    const known = p.kind === "missingA" ? p.b : p.a;
    let inv;
    if (p.op === "addition") inv = { op: "subtraction", a: result, b: known };
    else if (p.op === "subtraction" && p.kind === "missingA") inv = { op: "addition", a: result, b: known };
    else if (p.op === "subtraction") inv = { op: "subtraction", a: p.a, b: result };
    else if (p.op === "multiplication") inv = { op: "division", a: result, b: known };
    else if (p.kind === "missingA") inv = { op: "multiplication", a: known, b: result };
    else inv = { op: "division", a: p.a, b: result };

    const puzzle = displayText(p);
    const hint = `${inv.a} ${SYMBOL[inv.op]} ${inv.b}`;
    const steps = [
      say(`Zagadka: ${puzzle}. To to samo, co ${hint}!`,
          `Puzzle: ${puzzle}. That's the same as ${hint}!`),
    ];
    steps.push(...standardSteps(inv.op, inv.a, inv.b));
    steps.push({ type: "reveal", statement: puzzle.replace("?", String(answer(p))), answer: answer(p) });
    return steps;
  }

  function tutorialPlan(p) {
    if (p.kind === "twoStep") return twoStepSteps(p);
    if (p.kind === "missingA" || p.kind === "missingB") return missingOperandSteps(p);
    const steps = standardSteps(p.op, p.a, p.b);
    steps.push({ type: "reveal", statement: statementFor(p), answer: answer(p) });
    return steps;
  }

  // ---------------------------------------------------------------- Statistics

  const DAY_MS = 86400000;

  function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  /**
   * frame: "today" | "week" | "month" | "all" | {start, end}
   * Returns [startMs, endMs) or null for "all".
   */
  function frameInterval(frame, now) {
    const todayStart = startOfDay(now);
    const tomorrow = startOfDay(todayStart + DAY_MS + DAY_MS / 2); // DST-safe next midnight
    if (frame === "today") return [todayStart, tomorrow];
    if (frame === "week") return [startOfDay(todayStart - 6 * DAY_MS + DAY_MS / 2), tomorrow];
    if (frame === "month") return [startOfDay(todayStart - 29 * DAY_MS + DAY_MS / 2), tomorrow];
    if (frame === "all") return null;
    const s = startOfDay(frame.start);
    const e = startOfDay(startOfDay(frame.end) + DAY_MS + DAY_MS / 2);
    return [Math.min(s, e), Math.max(s, e)];
  }

  function filterAttempts(attempts, frame, now) {
    const interval = frameInterval(frame, now);
    if (!interval) return attempts;
    return attempts.filter((a) => a.t >= interval[0] && a.t < interval[1]);
  }

  function filterSessions(sessions, frame, now) {
    const interval = frameInterval(frame, now);
    if (!interval) return sessions;
    return sessions.filter((s) => s.start >= interval[0] && s.start < interval[1]);
  }

  function summary(attempts) {
    const s = {
      totalAttempted: attempts.length, solvedCorrectly: 0, tutorialsTriggered: 0,
      accuracy: 0, averageTries: 0, averageTimeToCorrect: 0,
    };
    if (!attempts.length) return s;
    const correct = attempts.filter((a) => a.ok);
    s.solvedCorrectly = correct.length;
    s.tutorialsTriggered = attempts.filter((a) => a.tut).length;
    s.accuracy = correct.length / attempts.length;
    s.averageTries = attempts.reduce((acc, a) => acc + a.tries, 0) / attempts.length;
    if (correct.length) {
      s.averageTimeToCorrect = correct.reduce((acc, a) => acc + a.time, 0) / correct.length;
    }
    return s;
  }

  function summaryByOperation(attempts) {
    const result = {};
    for (const op of OPS) {
      const subset = attempts.filter((a) => a.op === op);
      if (subset.length) result[op] = summary(subset);
    }
    return result;
  }

  function groupByDay(items, key) {
    const map = new Map();
    for (const item of items) {
      const day = startOfDay(item[key]);
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(item);
    }
    return [...map.entries()].sort((x, y) => x[0] - y[0]);
  }

  function dailyAccuracy(attempts) {
    return groupByDay(attempts, "t").map(([day, items]) => ({
      day, value: items.filter((a) => a.ok).length / items.length,
    }));
  }

  function dailyCount(attempts) {
    return groupByDay(attempts, "t").map(([day, items]) => ({ day, value: items.length }));
  }

  function dailyAverageTime(attempts) {
    const points = [];
    for (const [day, items] of groupByDay(attempts, "t")) {
      const correct = items.filter((a) => a.ok);
      if (!correct.length) continue;
      points.push({ day, value: correct.reduce((acc, a) => acc + a.time, 0) / correct.length });
    }
    return points;
  }

  function dailyUsageMinutes(sessions) {
    return groupByDay(sessions, "start").map(([day, items]) => ({
      day, value: items.reduce((acc, s) => acc + s.dur, 0) / 60,
    }));
  }

  function totalUsageSeconds(sessions, frame, now) {
    return filterSessions(sessions, frame, now).reduce((acc, s) => acc + s.dur, 0);
  }

  // ---------------------------------------------------------------- Time limit

  const WARNING_WINDOW = 5 * 60;

  /** sessions: [{start(ms), dur(s)}]; returns seconds used today. */
  function usedSecondsToday(sessions, currentSessionStart, now) {
    const todayStart = startOfDay(now);
    let total = 0;
    for (const s of sessions) {
      const end = s.start + s.dur * 1000;
      const overlapStart = Math.max(s.start, todayStart);
      const overlapEnd = Math.min(end, now);
      if (overlapEnd > overlapStart) total += (overlapEnd - overlapStart) / 1000;
    }
    if (currentSessionStart != null) {
      const overlapStart = Math.max(currentSessionStart, todayStart);
      if (now > overlapStart) total += (now - overlapStart) / 1000;
    }
    return total;
  }

  /** → {state: "off"|"ok"|"warning"|"reached", remaining?} */
  function limitState(usedSeconds, limitMinutes, overrideActive) {
    if (!limitMinutes || limitMinutes <= 0 || overrideActive) return { state: "off" };
    const remaining = limitMinutes * 60 - usedSeconds;
    if (remaining <= 0) return { state: "reached" };
    if (remaining <= WARNING_WINDOW) return { state: "warning", remaining };
    return { state: "ok", remaining };
  }

  function overrideActive(overrideDateMs, now) {
    if (overrideDateMs == null) return false;
    return startOfDay(overrideDateMs) === startOfDay(now);
  }

  // ---------------------------------------------------------------- Practice state machine

  /**
   * Pure practice loop (port of Swift PracticeCore):
   * correct → praise (+celebration each 5th); 1st/2nd wrong → same problem;
   * 3rd wrong → tutorial; tutorial neither counts as correct nor breaks the
   * streak; the answer field clears after every check.
   */
  class PracticeCore {
    constructor(config, now, rng) {
      this.config = Object.assign({}, config);
      this.problem = generate(config, null, rng);
      this.typed = "";
      this.phase = { name: "answering" };
      this.wrongAttempts = 0;
      this.correctCount = 0;
      this.runningStreak = 0;
      this.praiseIndex = 0;
      this.problemShownAt = now;
    }

    get canType() {
      return this.phase.name === "answering" || this.phase.name === "tryAgain";
    }

    get streakStars() {
      if (this.phase.name === "celebration") return 5;
      return this.correctCount % MILESTONE_SIZE;
    }

    tapDigit(d) {
      if (!this.canType || this.typed.length >= 3 || d < 0 || d > 9) return;
      this.typed += String(d);
    }

    tapBackspace() {
      if (!this.canType || !this.typed.length) return;
      this.typed = this.typed.slice(0, -1);
    }

    setConfig(config) {
      this.config = Object.assign({}, config);
    }

    submit(lastPraiseIndex, now, rng) {
      if (!this.canType || this.typed === "") return { type: "notAccepted" };
      const value = parseInt(this.typed, 10);
      this.typed = "";
      if (value === answer(this.problem)) {
        const outcome = {
          t: now, op: this.problem.op, diff: this.config.difficulty,
          range: this.config.range, tries: this.wrongAttempts + 1,
          time: (now - this.problemShownAt) / 1000, tut: false, ok: true,
        };
        this.correctCount++;
        this.runningStreak++;
        this.wrongAttempts = 0;
        this.praiseIndex = nextPraise(lastPraiseIndex, rng);
        this.phase = { name: "praise" };
        const ms = isMilestone(this.correctCount) ? milestoneNumber(this.correctCount) : null;
        return { type: "correct", outcome, milestoneNumber: ms };
      }
      this.wrongAttempts++;
      if (this.wrongAttempts >= 3) {
        this.phase = { name: "tutorial" };
        return { type: "tutorial" };
      }
      this.phase = { name: "tryAgain", attempt: this.wrongAttempts };
      return { type: "wrong", attempt: this.wrongAttempts };
    }

    advanceAfterPraise(now, rng) {
      if (this.phase.name !== "praise") return;
      if (isMilestone(this.correctCount)) {
        this.phase = { name: "celebration", milestoneNumber: milestoneNumber(this.correctCount) };
      } else {
        this._nextProblem(now, rng);
      }
    }

    finishTutorial(now, rng) {
      const outcome = {
        t: now, op: this.problem.op, diff: this.config.difficulty,
        range: this.config.range, tries: 3, time: 0, tut: true, ok: false,
      };
      this.problem = generateSimilar(this.problem, this.config, rng);
      this._reset(now);
      return outcome;
    }

    finishCelebration(now, rng) {
      if (this.phase.name !== "celebration") return;
      this._nextProblem(now, rng);
    }

    _nextProblem(now, rng) {
      this.problem = generate(this.config, this.problem, rng);
      this._reset(now);
    }

    _reset(now) {
      this.wrongAttempts = 0;
      this.typed = "";
      this.problemShownAt = now;
      this.phase = { name: "answering" };
    }
  }

  // ---------------------------------------------------------------- Export

  const TosiaCore = {
    seededRng, randInt, choice,
    OPS, SYMBOL, OP_EMOJI, DIFFICULTIES, RANGES,
    problem, factResult, answer, promptParts, displayText, problemsEqual,
    generate, generateSimilar,
    vocative, PRAISES, MILESTONE_HEADLINES, formatPhrase, nextPraise, praiseAt, milestoneHeadline,
    MILESTONE_SIZE, isMilestone, milestoneNumber, tier,
    TROPHIES, trophyUnlockedAt, highestTrophy, nextTrophy,
    computeBadges,
    tutorialPlan,
    startOfDay, frameInterval, filterAttempts, filterSessions,
    summary, summaryByOperation, dailyAccuracy, dailyCount, dailyAverageTime,
    dailyUsageMinutes, totalUsageSeconds,
    usedSecondsToday, limitState, overrideActive, WARNING_WINDOW,
    PracticeCore,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = TosiaCore;
  global.TosiaCore = TosiaCore;
})(typeof window !== "undefined" ? window : globalThis);

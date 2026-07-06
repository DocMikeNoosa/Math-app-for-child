"use strict";
/* Web-core test suite — a port of the Swift XCTest suites (66 tests), run
 * with `node --test scripts/web-core-tests/`. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const C = require("../../docs/core.js");

// ---------------------------------------------------------------- helpers

function cfg(ops, range, difficulty) {
  return { operations: ops, range, difficulty };
}

function generateMany(config, count = 400, seed = 42) {
  const rng = C.seededRng(seed);
  const out = [];
  let prev = null;
  for (let i = 0; i < count; i++) {
    const p = C.generate(config, prev, rng);
    out.push(p);
    prev = p;
  }
  return out;
}

function localDate(y, m, d, h = 12, min = 0) {
  return new Date(y, m - 1, d, h, min).getTime();
}

function attempt(t, over = {}) {
  return Object.assign(
    { t, op: "addition", diff: "medium", range: 100, tries: 1, time: 5, tut: false, ok: true },
    over
  );
}

// ================================================================ Generator

test("all op/range/difficulty combinations respect constraints", () => {
  for (const op of C.OPS) {
    for (const range of C.RANGES) {
      for (const difficulty of C.DIFFICULTIES) {
        const config = cfg([op], range, difficulty);
        for (const p of generateMany(config, 250)) {
          const ctx = `${C.displayText(p)} [${difficulty}/${range}]`;
          assert.equal(p.op, op, ctx);
          if (p.op === "addition" && p.kind !== "twoStep") {
            assert.ok(p.a + p.b <= range, `sum over range: ${ctx}`);
            assert.ok(Math.min(p.a, p.b) >= 1, `zero operand: ${ctx}`);
          }
          if (p.op === "subtraction" && p.kind !== "twoStep") {
            assert.ok(p.a <= range, `minuend over range: ${ctx}`);
            assert.ok(p.a - p.b >= 0, `negative result: ${ctx}`);
            assert.ok(p.b >= 1, `subtracting zero: ${ctx}`);
          }
          if (p.op === "multiplication") {
            assert.ok(p.a * p.b <= range, `product over range: ${ctx}`);
            assert.ok(Math.min(p.a, p.b) >= 1, `×0: ${ctx}`);
            if (difficulty !== "easy") assert.ok(Math.min(p.a, p.b) >= 2, `×1 outside easy: ${ctx}`);
          }
          if (p.op === "division") {
            assert.ok(p.a <= range, `dividend over range: ${ctx}`);
            assert.ok(p.b > 0, `÷0: ${ctx}`);
            assert.equal(p.a % p.b, 0, `inexact division: ${ctx}`);
          }
          if (p.kind === "twoStep") {
            assert.equal(difficulty, "genius", `twoStep outside genius: ${ctx}`);
            assert.ok(C.answer(p) >= 0 && C.answer(p) <= range, `twoStep answer: ${ctx}`);
          }
          if (p.kind === "missingA" || p.kind === "missingB") {
            assert.equal(difficulty, "genius", `missing outside genius: ${ctx}`);
          }
        }
      }
    }
  }
});

test("easy addition never crosses tens", () => {
  for (const range of C.RANGES) {
    for (const p of generateMany(cfg(["addition"], range, "easy"))) {
      assert.ok((p.a % 10) + (p.b % 10) <= 9, C.displayText(p));
    }
  }
});

test("medium addition always crosses tens", () => {
  for (const range of C.RANGES) {
    for (const p of generateMany(cfg(["addition"], range, "medium"))) {
      assert.ok((p.a % 10) + (p.b % 10) >= 10, C.displayText(p));
    }
  }
});

test("easy subtraction never borrows; medium always borrows", () => {
  for (const p of generateMany(cfg(["subtraction"], 100, "easy"))) {
    assert.ok(p.a % 10 >= p.b % 10, C.displayText(p));
  }
  for (const p of generateMany(cfg(["subtraction"], 100, "medium"))) {
    assert.ok(p.a % 10 < p.b % 10, C.displayText(p));
  }
});

test("easy multiplication uses tables of 2/5/10; hard uses 6–9", () => {
  for (const p of generateMany(cfg(["multiplication"], 100, "easy"))) {
    assert.ok([2, 5, 10].includes(p.a) || [2, 5, 10].includes(p.b), C.displayText(p));
  }
  for (const p of generateMany(cfg(["multiplication"], 100, "hard"))) {
    assert.ok((p.a >= 6 && p.a <= 9) || (p.b >= 6 && p.b <= 9), C.displayText(p));
  }
});

test("division is always exact across all difficulties and ranges", () => {
  for (const difficulty of C.DIFFICULTIES) {
    for (const range of C.RANGES) {
      for (const p of generateMany(cfg(["division"], range, difficulty), 250)) {
        assert.equal(p.a % p.b, 0, C.displayText(p));
        assert.ok(p.b > 0);
      }
    }
  }
});

test("never the same problem twice in a row (tight pools)", () => {
  for (const op of C.OPS) {
    const problems = generateMany(cfg([op], 20, "medium"), 400);
    for (let i = 1; i < problems.length; i++) {
      assert.ok(!C.problemsEqual(problems[i], problems[i - 1]),
        `repeat at ${i}: ${C.displayText(problems[i])}`);
    }
  }
});

test("genius produces missing-operand and two-step; others never do", () => {
  const genius = generateMany(cfg(C.OPS.slice(), 100, "genius"), 800);
  assert.ok(genius.some((p) => p.kind === "missingA" || p.kind === "missingB"));
  assert.ok(genius.some((p) => p.kind === "twoStep"));
  for (const difficulty of ["easy", "medium", "hard"]) {
    for (const p of generateMany(cfg(C.OPS.slice(), 100, difficulty))) {
      assert.equal(p.kind, "standard");
    }
  }
});

test("missing-operand answers are the hidden operand", () => {
  const p = C.problem("multiplication", 7, 8, 0, "missingB");
  assert.equal(C.answer(p), 8);
  assert.equal(C.displayText(p), "7 × ? = 56");
  const q = C.problem("subtraction", 53, 18, 0, "missingA");
  assert.equal(C.answer(q), 53);
  assert.equal(C.displayText(q), "? − 18 = 35");
});

test("two-step respects operator precedence", () => {
  assert.equal(C.answer(C.problem("addition", 4, 3, 2, "twoStep")), 10);
  assert.equal(C.answer(C.problem("subtraction", 20, 3, 4, "twoStep")), 8);
});

test("generateSimilar keeps the operation, differs, and is plain", () => {
  const rng = C.seededRng(7);
  const config = cfg(C.OPS.slice(), 50, "medium");
  for (let i = 0; i < 200; i++) {
    const original = C.generate(config, null, rng);
    const similar = C.generateSimilar(original, config, rng);
    assert.equal(similar.op, original.op);
    assert.ok(!C.problemsEqual(similar, original));
    assert.equal(similar.kind, "standard");
  }
});

test("mixed selection only draws from selected operations", () => {
  for (const p of generateMany(cfg(["addition", "division"], 30, "medium"))) {
    assert.ok(["addition", "division"].includes(p.op));
  }
});

// ================================================================ Praise

test("praise bank has at least 25 phrases and never repeats back-to-back", () => {
  assert.ok(C.PRAISES.length >= 25);
  const rng = C.seededRng(99);
  let last = -1;
  for (let i = 0; i < 2000; i++) {
    const next = C.nextPraise(last, rng);
    assert.notEqual(next, last);
    last = next;
  }
});

test("praise uses the Polish vocative", () => {
  assert.equal(C.formatPhrase(C.PRAISES[0].pl, "pl", "Tosia"), "Brawo, Tosiu!");
  assert.equal(C.formatPhrase(C.PRAISES[0].en, "en", "Tosia"), "Bravo, Tosia!");
});

test("Polish vocative heuristics", () => {
  assert.equal(C.vocative("Tosia"), "Tosiu");
  assert.equal(C.vocative("Kasia"), "Kasiu");
  assert.equal(C.vocative("Ola"), "Olu");
  assert.equal(C.vocative("Marta"), "Marto");
  assert.equal(C.vocative("Anna"), "Anno");
  assert.equal(C.vocative("Alex"), "Alex");
});

test("fancy words carry child-friendly meanings", () => {
  const fancy = C.PRAISES.filter((p) => p.fancy);
  assert.ok(fancy.length >= 5);
  for (const p of fancy) {
    assert.ok(p.fancy.pl.length > 0 && p.fancy.en.length > 0);
  }
});

// ================================================================ Milestones & trophies

test("milestone every 5 correct answers; tiers escalate and cap at 5", () => {
  for (let count = 1; count <= 30; count++) {
    assert.equal(C.isMilestone(count), count % 5 === 0, `count ${count}`);
  }
  assert.ok(!C.isMilestone(0));
  assert.equal(C.milestoneNumber(5), 1);
  assert.equal(C.milestoneNumber(20), 4);
  assert.equal(C.tier(1), 1);
  assert.equal(C.tier(3), 3);
  assert.equal(C.tier(9), 5);
});

test("trophy ladder: ≥10 trophies at exact multiples of 10", () => {
  assert.ok(C.TROPHIES.length >= 10);
  C.TROPHIES.forEach((t, i) => assert.equal(t.coins, (i + 1) * 10));
  assert.equal(C.trophyUnlockedAt(9), null);
  assert.equal(C.trophyUnlockedAt(10).pl, "Garniec złota");
  assert.equal(C.trophyUnlockedAt(11), null);
  assert.equal(C.trophyUnlockedAt(50).pl, "Skrzynia z koroną");
  assert.equal(C.highestTrophy(5), null);
  assert.equal(C.highestTrophy(34).coins, 30);
  assert.equal(C.nextTrophy(34).coins, 40);
  assert.equal(C.nextTrophy(0).coins, 10);
});

test("badges: per-op mastery at 50, coins and streak badges", () => {
  const now = Date.now();
  const attempts = Array.from({ length: 50 }, () =>
    attempt(now, { op: "multiplication", time: 4 }));
  let badges = C.computeBadges(attempts, 0, 0);
  assert.ok(badges.find((b) => b.id === "mulMaster").earned);
  assert.ok(!badges.find((b) => b.id === "addMaster").earned);
  badges = C.computeBadges(attempts.slice(1), 0, 0);
  assert.ok(!badges.find((b) => b.id === "mulMaster").earned);

  badges = C.computeBadges([], 25, 10);
  assert.ok(badges.find((b) => b.id === "firstCoin").earned);
  assert.ok(badges.find((b) => b.id === "collector").earned);
  assert.ok(badges.find((b) => b.id === "streak10").earned);
  assert.ok(!badges.find((b) => b.id === "hundred").earned);
});

// ================================================================ Tutorial plans

function hasStep(plan, pred) { return plan.some(pred); }

test("tutorial for crossing addition decomposes into tens", () => {
  const plan = C.tutorialPlan(C.problem("addition", 36, 27));
  assert.ok(hasStep(plan, (s) => s.type === "decompose" && s.number === 27 && s.tens === 20 && s.ones === 7));
  assert.ok(hasStep(plan, (s) => s.type === "numberLine" && s.start === 36 && s.jump === 20 && !s.subtract));
  assert.ok(hasStep(plan, (s) => s.type === "numberLine" && s.start === 56 && s.jump === 7 && !s.subtract));
  const last = plan[plan.length - 1];
  assert.equal(last.type, "reveal");
  assert.equal(last.answer, 63);
});

test("tutorial for subtraction jumps backward", () => {
  const plan = C.tutorialPlan(C.problem("subtraction", 63, 27));
  assert.ok(hasStep(plan, (s) => s.type === "numberLine" && s.start === 63 && s.jump === 20 && s.subtract));
  assert.ok(hasStep(plan, (s) => s.type === "numberLine" && s.start === 43 && s.jump === 7 && s.subtract));
});

test("tutorial for multiplication uses groups; division uses sharing", () => {
  const mul = C.tutorialPlan(C.problem("multiplication", 4, 6));
  assert.ok(hasStep(mul, (s) => s.type === "groups" && s.count === 4 && s.size === 6));
  assert.equal(mul[mul.length - 1].answer, 24);
  const div = C.tutorialPlan(C.problem("division", 24, 4));
  assert.ok(hasStep(div, (s) => s.type === "sharing" && s.total === 24 && s.baskets === 4));
  assert.equal(div[div.length - 1].answer, 6);
});

test("tutorial for missing operand teaches the inverse", () => {
  const plan = C.tutorialPlan(C.problem("multiplication", 7, 8, 0, "missingB"));
  assert.ok(hasStep(plan, (s) => s.type === "sharing" && s.total === 56 && s.baskets === 7));
  assert.equal(plan[plan.length - 1].answer, 8);
});

test("every tutorial plan ends with the correct answer", () => {
  const rng = C.seededRng(5);
  const config = cfg(C.OPS.slice(), 100, "genius");
  for (let i = 0; i < 400; i++) {
    const p = C.generate(config, null, rng);
    const plan = C.tutorialPlan(p);
    const last = plan[plan.length - 1];
    assert.equal(last.type, "reveal", C.displayText(p));
    assert.equal(last.answer, C.answer(p), C.displayText(p));
    assert.ok(plan.length >= 2);
  }
});

// ================================================================ Statistics

test("today frame includes only today", () => {
  const now = localDate(2026, 7, 5, 18);
  const attempts = [
    attempt(localDate(2026, 7, 5, 9)),
    attempt(localDate(2026, 7, 5, 0)),
    attempt(localDate(2026, 7, 4, 23)),
    attempt(localDate(2026, 7, 6, 1)),
  ];
  assert.equal(C.filterAttempts(attempts, "today", now).length, 2);
});

test("week = last 7 days inclusive; month = last 30 days inclusive", () => {
  const now = localDate(2026, 7, 7);
  const weekAttempts = [
    attempt(localDate(2026, 7, 7)),
    attempt(localDate(2026, 7, 1)),
    attempt(localDate(2026, 6, 30)),
  ];
  assert.equal(C.filterAttempts(weekAttempts, "week", now).length, 2);

  const now2 = localDate(2026, 7, 31);
  const monthAttempts = [
    attempt(localDate(2026, 7, 31)),
    attempt(localDate(2026, 7, 2)),
    attempt(localDate(2026, 7, 1)),
  ];
  assert.equal(C.filterAttempts(monthAttempts, "month", now2).length, 2);
});

test("all-time filters nothing; custom is inclusive of both end days", () => {
  const now = localDate(2026, 7, 20);
  const attempts = [attempt(localDate(2020, 1, 1)), attempt(localDate(2026, 7, 5))];
  assert.equal(C.filterAttempts(attempts, "all", now).length, 2);

  const customAttempts = [
    attempt(localDate(2026, 7, 1, 0)),
    attempt(localDate(2026, 7, 10, 23)),
    attempt(localDate(2026, 7, 11, 0)),
  ];
  const frame = { start: localDate(2026, 7, 1), end: localDate(2026, 7, 10) };
  assert.equal(C.filterAttempts(customAttempts, frame, now).length, 2);
});

test("summary math (avg time over correct only)", () => {
  const now = localDate(2026, 7, 5);
  const s = C.summary([
    attempt(now, { tries: 1, time: 4 }),
    attempt(now, { tries: 2, time: 8 }),
    attempt(now, { tries: 3, time: 0, tut: true, ok: false }),
    attempt(now, { tries: 2, time: 6 }),
  ]);
  assert.equal(s.totalAttempted, 4);
  assert.equal(s.solvedCorrectly, 3);
  assert.equal(s.tutorialsTriggered, 1);
  assert.ok(Math.abs(s.accuracy - 0.75) < 1e-9);
  assert.ok(Math.abs(s.averageTries - 2.0) < 1e-9);
  assert.ok(Math.abs(s.averageTimeToCorrect - 6.0) < 1e-9);

  const empty = C.summary([]);
  assert.equal(empty.totalAttempted, 0);
  assert.equal(empty.accuracy, 0);
});

test("per-operation summaries split correctly", () => {
  const now = localDate(2026, 7, 5);
  const byOp = C.summaryByOperation([
    attempt(now, { op: "addition" }),
    attempt(now, { op: "addition", ok: false }),
    attempt(now, { op: "multiplication" }),
  ]);
  assert.equal(byOp.addition.totalAttempted, 2);
  assert.equal(byOp.addition.solvedCorrectly, 1);
  assert.equal(byOp.multiplication.totalAttempted, 1);
  assert.equal(byOp.division, undefined);
});

test("daily series group and sort; avg-time skips days without correct", () => {
  const attempts = [
    attempt(localDate(2026, 7, 2, 9)),
    attempt(localDate(2026, 7, 2, 15), { ok: false }),
    attempt(localDate(2026, 7, 1, 10)),
  ];
  const acc = C.dailyAccuracy(attempts);
  assert.equal(acc.length, 2);
  assert.equal(acc[0].day, C.startOfDay(localDate(2026, 7, 1)));
  assert.ok(Math.abs(acc[0].value - 1.0) < 1e-9);
  assert.ok(Math.abs(acc[1].value - 0.5) < 1e-9);
  assert.deepEqual(C.dailyCount(attempts).map((p) => p.value), [1, 2]);

  const t = C.dailyAverageTime([
    attempt(localDate(2026, 7, 1), { time: 10 }),
    attempt(localDate(2026, 7, 2), { time: 0, tut: true, ok: false }),
  ]);
  assert.equal(t.length, 1);
  assert.ok(Math.abs(t[0].value - 10) < 1e-9);
});

test("usage minutes per day and totals per frame", () => {
  const sessions = [
    { start: localDate(2026, 7, 1, 9), dur: 600 },
    { start: localDate(2026, 7, 1, 17), dur: 300 },
    { start: localDate(2026, 7, 2, 9), dur: 120 },
  ];
  const series = C.dailyUsageMinutes(sessions);
  assert.equal(series.length, 2);
  assert.ok(Math.abs(series[0].value - 15) < 1e-9);
  assert.ok(Math.abs(series[1].value - 2) < 1e-9);

  const now = localDate(2026, 7, 5, 20);
  const s2 = [
    { start: localDate(2026, 7, 5, 9), dur: 600 },
    { start: localDate(2026, 7, 1, 9), dur: 900 },
  ];
  assert.ok(Math.abs(C.totalUsageSeconds(s2, "today", now) - 600) < 1e-9);
  assert.ok(Math.abs(C.totalUsageSeconds(s2, "week", now) - 1500) < 1e-9);
});

// ================================================================ Time limit

test("used seconds counts only today's overlap (incl. midnight span)", () => {
  const now = localDate(2026, 7, 5, 12);
  const sessions = [
    { start: localDate(2026, 7, 5, 9), dur: 600 },
    { start: localDate(2026, 7, 4, 10), dur: 1200 },
    { start: localDate(2026, 7, 4, 23), dur: 7200 }, // 1h spills into today
  ];
  const used = C.usedSecondsToday(sessions, null, now);
  assert.ok(Math.abs(used - (600 + 3600)) < 1);
});

test("used seconds includes the live session", () => {
  const now = localDate(2026, 7, 5, 12);
  const used = C.usedSecondsToday([], localDate(2026, 7, 5, 11, 40), now);
  assert.ok(Math.abs(used - 1200) < 1);
});

test("limit states: off / ok / warning / reached; override disables", () => {
  assert.equal(C.limitState(99999, null, false).state, "off");
  assert.equal(C.limitState(99999, 30, true).state, "off");
  assert.deepEqual(C.limitState(10 * 60, 30, false), { state: "ok", remaining: 20 * 60 });
  assert.deepEqual(C.limitState(25 * 60, 30, false), { state: "warning", remaining: 5 * 60 });
  assert.equal(C.limitState(30 * 60, 30, false).state, "reached");
  assert.equal(C.limitState(45 * 60, 30, false).state, "reached");
});

test("override lasts only for its calendar day", () => {
  const granted = localDate(2026, 7, 5, 20);
  assert.ok(C.overrideActive(granted, localDate(2026, 7, 5, 23)));
  assert.ok(!C.overrideActive(granted, localDate(2026, 7, 6, 9)));
  assert.ok(!C.overrideActive(null, localDate(2026, 7, 5, 23)));
});

// ================================================================ Practice state machine

function makeCore(ops = ["addition"], difficulty = "medium", seed = 1234) {
  const rng = C.seededRng(seed);
  const core = new C.PracticeCore(cfg(ops, 100, difficulty), 0, rng);
  return { core, rng };
}

function typeAnswer(core, value) {
  for (const ch of String(value)) core.tapDigit(parseInt(ch, 10));
}

function answerCorrectly(core, rng, lastPraise = -1) {
  typeAnswer(core, C.answer(core.problem));
  const result = core.submit(lastPraise, 1000, rng);
  core.advanceAfterPraise(1000, rng);
  if (core.phase.name === "celebration") core.finishCelebration(1000, rng);
  return result;
}

function answerWrongly(core, rng) {
  typeAnswer(core, C.answer(core.problem) === 0 ? 1 : 0);
  return core.submit(-1, 1000, rng);
}

test("correct answer → outcome, praise, cleared field", () => {
  const { core, rng } = makeCore();
  typeAnswer(core, C.answer(core.problem));
  const result = core.submit(-1, 5000, rng);
  assert.equal(result.type, "correct");
  assert.equal(result.outcome.tries, 1);
  assert.ok(result.outcome.ok);
  assert.ok(!result.outcome.tut);
  assert.equal(result.milestoneNumber, null);
  assert.equal(core.phase.name, "praise");
  assert.equal(core.typed, "");
  assert.equal(core.correctCount, 1);
  assert.equal(core.streakStars, 1);
});

test("praise advances to a new, different problem", () => {
  const { core, rng } = makeCore();
  const first = core.problem;
  answerCorrectly(core, rng);
  assert.equal(core.phase.name, "answering");
  assert.ok(!C.problemsEqual(core.problem, first));
});

test("5th correct → celebration with 5 glowing stars; 10th → milestone 2", () => {
  const { core, rng } = makeCore();
  for (let i = 0; i < 4; i++) answerCorrectly(core, rng);
  typeAnswer(core, C.answer(core.problem));
  const result = core.submit(-1, 1000, rng);
  assert.equal(result.milestoneNumber, 1);
  core.advanceAfterPraise(1000, rng);
  assert.deepEqual(core.phase, { name: "celebration", milestoneNumber: 1 });
  assert.equal(core.streakStars, 5);
  core.finishCelebration(1000, rng);
  assert.equal(core.phase.name, "answering");
  assert.equal(core.streakStars, 0);

  for (let i = 0; i < 4; i++) answerCorrectly(core, rng);
  typeAnswer(core, C.answer(core.problem));
  assert.equal(core.submit(-1, 1000, rng).milestoneNumber, 2);
});

test("wrong answers keep the SAME problem; third launches the tutorial", () => {
  const { core, rng } = makeCore();
  const p = core.problem;
  assert.deepEqual(answerWrongly(core, rng), { type: "wrong", attempt: 1 });
  assert.deepEqual(core.phase, { name: "tryAgain", attempt: 1 });
  assert.ok(C.problemsEqual(core.problem, p));
  assert.equal(core.typed, "");

  assert.deepEqual(answerWrongly(core, rng), { type: "wrong", attempt: 2 });
  assert.ok(C.problemsEqual(core.problem, p));

  assert.deepEqual(answerWrongly(core, rng), { type: "tutorial" });
  assert.equal(core.phase.name, "tutorial");
  assert.ok(C.problemsEqual(core.problem, p), "tutorial explains THIS exact problem");
  assert.ok(!core.canType);
});

test("correct after two wrongs counts three tries", () => {
  const { core, rng } = makeCore();
  answerWrongly(core, rng);
  answerWrongly(core, rng);
  typeAnswer(core, C.answer(core.problem));
  const result = core.submit(-1, 1000, rng);
  assert.equal(result.outcome.tries, 3);
  assert.ok(result.outcome.ok);
});

test("kindness rule: tutorial neither counts as correct nor breaks the streak", () => {
  const { core, rng } = makeCore();
  answerCorrectly(core, rng);
  answerCorrectly(core, rng);
  assert.equal(core.runningStreak, 2);

  const tutorialized = core.problem;
  answerWrongly(core, rng);
  answerWrongly(core, rng);
  answerWrongly(core, rng);
  const outcome = core.finishTutorial(1000, rng);

  assert.ok(!outcome.ok);
  assert.ok(outcome.tut);
  assert.equal(outcome.tries, 3);
  assert.equal(core.correctCount, 2);
  assert.equal(core.runningStreak, 2);
  assert.equal(core.streakStars, 2);
  assert.equal(core.phase.name, "answering");
  assert.equal(core.problem.op, tutorialized.op);
  assert.ok(!C.problemsEqual(core.problem, tutorialized));
  assert.equal(core.problem.kind, "standard");
});

test("typing caps at 3 digits; backspace; empty submit ignored; no typing in praise", () => {
  const { core, rng } = makeCore();
  [1, 2, 3, 4, 5].forEach((d) => core.tapDigit(d));
  assert.equal(core.typed, "123");
  core.tapBackspace();
  assert.equal(core.typed, "12");
  core.tapBackspace(); core.tapBackspace(); core.tapBackspace();
  assert.equal(core.typed, "");
  assert.equal(core.submit(-1, 1000, rng).type, "notAccepted");
  assert.equal(core.phase.name, "answering");

  typeAnswer(core, C.answer(core.problem));
  core.submit(-1, 1000, rng);
  assert.equal(core.phase.name, "praise");
  core.tapDigit(7);
  assert.equal(core.typed, "");
  assert.equal(core.submit(-1, 1000, rng).type, "notAccepted");
});

test("praise never repeats back-to-back across answers", () => {
  const { core, rng } = makeCore();
  let last = -1;
  for (let i = 0; i < 60; i++) {
    typeAnswer(core, C.answer(core.problem));
    const r = core.submit(last, 1000, rng);
    assert.equal(r.type, "correct");
    assert.notEqual(core.praiseIndex, last);
    last = core.praiseIndex;
    core.advanceAfterPraise(1000, rng);
    if (core.phase.name === "celebration") core.finishCelebration(1000, rng);
  }
});

test("mid-session config change applies to the next problem", () => {
  const { core, rng } = makeCore(["addition"]);
  const current = core.problem;
  core.setConfig(cfg(["division"], 30, "easy"));
  assert.ok(C.problemsEqual(core.problem, current), "current problem stays");
  answerCorrectly(core, rng);
  assert.equal(core.problem.op, "division");
  assert.ok(core.problem.a <= 30);
});

test("time-to-correct is measured from problem appearance", () => {
  const rng = C.seededRng(9);
  const core = new C.PracticeCore(cfg(["addition"], 100, "easy"), 1000000, rng);
  typeAnswer(core, C.answer(core.problem));
  const result = core.submit(-1, 1000000 + 7500, rng);
  assert.equal(result.type, "correct");
  assert.ok(Math.abs(result.outcome.time - 7.5) < 1e-9);
});

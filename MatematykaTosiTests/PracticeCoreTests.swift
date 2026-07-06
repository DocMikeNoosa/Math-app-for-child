import XCTest
@testable import MatematykaTosi

/// Tests for the practice-loop state machine — the exact answer logic:
/// correct/wrong/wrong/wrong→tutorial, milestone every 5, the kindness rule,
/// and input handling.
final class PracticeCoreTests: XCTestCase {

    private var rng = SeededGenerator(seed: 1234)

    private func makeCore(
        operations: Set<MathOperation> = [.addition],
        difficulty: Difficulty = .medium
    ) -> PracticeCore {
        PracticeCore(
            config: SessionConfig(operations: operations, range: .r100, difficulty: difficulty),
            using: &rng)
    }

    private func type(_ value: Int, into core: inout PracticeCore) {
        for ch in String(value) {
            core.tapDigit(Int(String(ch))!)
        }
    }

    /// Answers correctly and clears praise (and any milestone celebration),
    /// like the UI does, leaving the core ready for the next problem.
    @discardableResult
    private func answerCorrectly(_ core: inout PracticeCore, lastPraise: Int = -1) -> PracticeCore.SubmitResult {
        type(core.problem.answer, into: &core)
        let result = core.submit(lastPraiseIndex: lastPraise, using: &rng)
        core.advanceAfterPraise(using: &rng)
        if case .celebration = core.phase {
            core.finishCelebration(using: &rng)
        }
        return result
    }

    private func answerWrongly(_ core: inout PracticeCore) -> PracticeCore.SubmitResult {
        let wrong = core.problem.answer == 0 ? 1 : 0
        type(wrong, into: &core)
        return core.submit(lastPraiseIndex: -1, using: &rng)
    }

    // MARK: Correct answers

    func testCorrectAnswerProducesOutcomeAndPraise() {
        var core = makeCore()
        type(core.problem.answer, into: &core)
        let result = core.submit(lastPraiseIndex: -1, using: &rng)

        guard case .correct(let outcome, let milestone) = result else {
            return XCTFail("Expected .correct, got \(result)")
        }
        XCTAssertEqual(outcome.tries, 1)
        XCTAssertTrue(outcome.solvedCorrectly)
        XCTAssertFalse(outcome.tutorialShown)
        XCTAssertEqual(outcome.operation, .addition)
        XCTAssertNil(milestone, "First correct answer is not a milestone")
        XCTAssertEqual(core.phase, .praise)
        XCTAssertEqual(core.typed, "", "Answer field must clear after each check")
        XCTAssertEqual(core.correctCount, 1)
        XCTAssertEqual(core.streakStars, 1)
    }

    func testPraiseAdvancesToNextProblem() {
        var core = makeCore()
        let first = core.problem
        answerCorrectly(&core)
        XCTAssertEqual(core.phase, .answering)
        XCTAssertNotEqual(core.problem, first, "Never the same problem twice in a row")
    }

    func testFifthCorrectAnswerIsAMilestoneCelebration() {
        var core = makeCore()
        for i in 1...4 {
            answerCorrectly(&core)
            XCTAssertEqual(core.correctCount, i)
        }
        type(core.problem.answer, into: &core)
        let result = core.submit(lastPraiseIndex: -1, using: &rng)
        guard case .correct(_, let milestone) = result else {
            return XCTFail("Expected .correct")
        }
        XCTAssertEqual(milestone, 1)
        core.advanceAfterPraise(using: &rng)
        XCTAssertEqual(core.phase, .celebration(milestoneNumber: 1))
        XCTAssertEqual(core.streakStars, 5, "All five stars glow during the celebration")

        core.finishCelebration(using: &rng)
        XCTAssertEqual(core.phase, .answering)
        XCTAssertEqual(core.streakStars, 0, "Stars reset for the next run of five")
    }

    func testTenthCorrectAnswerIsSecondMilestone() {
        var core = makeCore()
        for _ in 1...9 { answerCorrectly(&core) }
        XCTAssertEqual(core.correctCount, 9)
        type(core.problem.answer, into: &core)
        guard case .correct(_, let milestone) = core.submit(lastPraiseIndex: -1, using: &rng) else {
            return XCTFail("Expected .correct")
        }
        XCTAssertEqual(milestone, 2)
    }

    // MARK: Wrong answers

    func testWrongAnswerKeepsTheSameProblem() {
        var core = makeCore()
        let problem = core.problem
        let result = answerWrongly(&core)
        XCTAssertEqual(result, .wrong(attempt: 1))
        XCTAssertEqual(core.phase, .tryAgain(attempt: 1))
        XCTAssertEqual(core.problem, problem, "The SAME problem repeats after a wrong answer")
        XCTAssertEqual(core.typed, "", "Answer field must clear after each check")
        XCTAssertEqual(core.correctCount, 0)
    }

    func testSecondWrongGivesHintPhase() {
        var core = makeCore()
        let problem = core.problem
        _ = answerWrongly(&core)
        let result = answerWrongly(&core)
        XCTAssertEqual(result, .wrong(attempt: 2))
        XCTAssertEqual(core.phase, .tryAgain(attempt: 2))
        XCTAssertEqual(core.problem, problem)
    }

    func testThirdWrongLaunchesTutorial() {
        var core = makeCore()
        let problem = core.problem
        _ = answerWrongly(&core)
        _ = answerWrongly(&core)
        let result = answerWrongly(&core)
        XCTAssertEqual(result, .tutorial)
        XCTAssertEqual(core.phase, .tutorial)
        XCTAssertEqual(core.problem, problem, "Tutorial explains THIS exact problem")
        XCTAssertFalse(core.canType, "No typing while the tutorial runs")
    }

    func testCorrectAfterTwoWrongsCountsTries() {
        var core = makeCore()
        _ = answerWrongly(&core)
        _ = answerWrongly(&core)
        type(core.problem.answer, into: &core)
        guard case .correct(let outcome, _) = core.submit(lastPraiseIndex: -1, using: &rng) else {
            return XCTFail("Expected .correct")
        }
        XCTAssertEqual(outcome.tries, 3)
        XCTAssertTrue(outcome.solvedCorrectly)
    }

    // MARK: The kindness rule

    func testTutorialNeitherCountsAsCorrectNorBreaksTheStreak() {
        var core = makeCore()
        answerCorrectly(&core)
        answerCorrectly(&core)
        XCTAssertEqual(core.runningStreak, 2)

        let tutorialized = core.problem
        _ = answerWrongly(&core)
        _ = answerWrongly(&core)
        _ = answerWrongly(&core)
        let outcome = core.finishTutorial(using: &rng)

        XCTAssertFalse(outcome.solvedCorrectly)
        XCTAssertTrue(outcome.tutorialShown)
        XCTAssertEqual(outcome.tries, 3)
        XCTAssertEqual(core.correctCount, 2, "Tutorial doesn't count as correct")
        XCTAssertEqual(core.runningStreak, 2, "Tutorial doesn't break the streak")
        XCTAssertEqual(core.streakStars, 2, "Stars are untouched — be kind")

        // Fresh similar problem: same operation, not the same problem.
        XCTAssertEqual(core.phase, .answering)
        XCTAssertEqual(core.problem.operation, tutorialized.operation)
        XCTAssertNotEqual(core.problem, tutorialized)
        XCTAssertEqual(core.problem.kind, .standard)
    }

    // MARK: Input handling

    func testTypingIsCappedAtThreeDigitsAndBackspaceWorks() {
        var core = makeCore()
        for digit in [1, 2, 3, 4, 5] { core.tapDigit(digit) }
        XCTAssertEqual(core.typed, "123")
        core.tapBackspace()
        XCTAssertEqual(core.typed, "12")
        core.tapBackspace()
        core.tapBackspace()
        core.tapBackspace()
        XCTAssertEqual(core.typed, "")
    }

    func testSubmitWithEmptyInputIsIgnored() {
        var core = makeCore()
        XCTAssertEqual(core.submit(lastPraiseIndex: -1, using: &rng), .notAccepted)
        XCTAssertEqual(core.phase, .answering)
    }

    func testNoTypingDuringPraise() {
        var core = makeCore()
        type(core.problem.answer, into: &core)
        _ = core.submit(lastPraiseIndex: -1, using: &rng)
        XCTAssertEqual(core.phase, .praise)
        core.tapDigit(7)
        XCTAssertEqual(core.typed, "")
        XCTAssertEqual(core.submit(lastPraiseIndex: -1, using: &rng), .notAccepted)
    }

    // MARK: Praise rotation

    func testPraiseNeverRepeatsBackToBackAcrossAnswers() {
        var core = makeCore()
        var last = -1
        for _ in 0..<60 {
            type(core.problem.answer, into: &core)
            guard case .correct = core.submit(lastPraiseIndex: last, using: &rng) else {
                return XCTFail("Expected .correct")
            }
            XCTAssertNotEqual(core.praiseIndex, last)
            last = core.praiseIndex
            core.advanceAfterPraise(using: &rng)
            if case .celebration = core.phase { core.finishCelebration(using: &rng) }
        }
    }

    // MARK: Mid-session configuration change

    func testConfigChangeAppliesToTheNextProblem() {
        var core = makeCore(operations: [.addition])
        let current = core.problem
        core.setConfig(SessionConfig(operations: [.division], range: .r30, difficulty: .easy))
        XCTAssertEqual(core.problem, current, "Current problem stays on screen")
        answerCorrectly(&core)
        XCTAssertEqual(core.problem.operation, .division)
        XCTAssertLessThanOrEqual(core.problem.a, 30)
    }

    // MARK: Time measurement

    func testTimeToCorrectIsMeasuredFromProblemAppearance() {
        var localRng = SeededGenerator(seed: 9)
        let start = Date(timeIntervalSince1970: 1_000_000)
        var core = PracticeCore(
            config: SessionConfig(operations: [.addition], range: .r100, difficulty: .easy),
            now: start,
            using: &localRng)
        for ch in String(core.problem.answer) { core.tapDigit(Int(String(ch))!) }
        let result = core.submit(lastPraiseIndex: -1, now: start.addingTimeInterval(7.5), using: &localRng)
        guard case .correct(let outcome, _) = result else {
            return XCTFail("Expected .correct")
        }
        XCTAssertEqual(outcome.timeToCorrect, 7.5, accuracy: 0.001)
    }
}

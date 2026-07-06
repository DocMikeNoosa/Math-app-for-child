import Foundation

/// The result of one finished problem, ready to be persisted.
struct AttemptOutcome: Equatable {
    var operation: MathOperation
    var difficulty: Difficulty
    var range: Int
    var tries: Int
    var timeToCorrect: TimeInterval
    var tutorialShown: Bool
    var solvedCorrectly: Bool
}

/// Pure state machine for the practice loop — the exact answer logic of the
/// app, with no UI, persistence or timing concerns:
///  - correct → praise, new problem (celebration on every 5th),
///  - 1st/2nd wrong → the SAME problem again (hint on the 2nd),
///  - 3rd wrong → tutorial; the tutorialized problem counts neither as
///    correct nor against the streak, and is followed by a fresh similar one,
///  - the answer field clears after every check.
struct PracticeCore {

    enum Phase: Equatable {
        case answering
        case tryAgain(attempt: Int)
        case praise
        case tutorial
        case celebration(milestoneNumber: Int)
    }

    enum SubmitResult: Equatable {
        /// Nothing to check (empty input or not in an answering phase).
        case notAccepted
        case correct(outcome: AttemptOutcome, milestoneNumber: Int?)
        case wrong(attempt: Int)
        /// Third wrong answer — the tutorial takes over.
        case tutorial
    }

    private(set) var config: SessionConfig
    private(set) var problem: MathProblem
    private(set) var typed = ""
    private(set) var phase: Phase = .answering
    private(set) var wrongAttempts = 0
    private(set) var correctCount = 0
    /// Consecutively solved problems (tutorials pause but never break it).
    private(set) var runningStreak = 0
    private(set) var praiseIndex = 0
    private(set) var problemShownAt: Date

    init(config: SessionConfig, now: Date = Date(), using rng: inout some RandomNumberGenerator) {
        self.config = config
        self.problem = ProblemGenerator.generate(config: config, avoiding: nil, using: &rng)
        self.problemShownAt = now
    }

    // MARK: Derived state

    var canType: Bool {
        switch phase {
        case .answering, .tryAgain: return true
        default: return false
        }
    }

    /// Stars for the current 5-problem streak (0…5).
    var streakStars: Int {
        if case .celebration = phase { return 5 }
        return correctCount % MilestoneEngine.milestoneSize
    }

    // MARK: Input

    mutating func tapDigit(_ digit: Int) {
        guard canType, typed.count < 3, (0...9).contains(digit) else { return }
        typed.append(String(digit))
    }

    mutating func tapBackspace() {
        guard canType, !typed.isEmpty else { return }
        typed.removeLast()
    }

    /// The parent may change settings mid-session; the *next* problem follows
    /// the new configuration while the current one stays on screen.
    mutating func setConfig(_ newConfig: SessionConfig) {
        config = newConfig
    }

    // MARK: Checking an answer

    mutating func submit(
        lastPraiseIndex: Int,
        now: Date = Date(),
        using rng: inout some RandomNumberGenerator
    ) -> SubmitResult {
        guard canType, let value = Int(typed) else { return .notAccepted }
        typed = ""  // The answer field clears after each check.

        if value == problem.answer {
            let outcome = AttemptOutcome(
                operation: problem.operation,
                difficulty: config.difficulty,
                range: config.range.rawValue,
                tries: wrongAttempts + 1,
                timeToCorrect: now.timeIntervalSince(problemShownAt),
                tutorialShown: false,
                solvedCorrectly: true
            )
            correctCount += 1
            runningStreak += 1
            wrongAttempts = 0
            praiseIndex = PraiseBank.next(after: lastPraiseIndex, using: &rng)
            phase = .praise
            let milestone = MilestoneEngine.isMilestone(correctCount: correctCount)
                ? MilestoneEngine.milestoneNumber(correctCount: correctCount)
                : nil
            return .correct(outcome: outcome, milestoneNumber: milestone)
        }

        wrongAttempts += 1
        if wrongAttempts >= 3 {
            phase = .tutorial
            return .tutorial
        }
        phase = .tryAgain(attempt: wrongAttempts)
        return .wrong(attempt: wrongAttempts)
    }

    // MARK: Transitions

    /// Praise shown → celebration (on a milestone) or straight to the next
    /// problem. Called by the driver after the praise delay.
    mutating func advanceAfterPraise(now: Date = Date(), using rng: inout some RandomNumberGenerator) {
        guard phase == .praise else { return }
        if MilestoneEngine.isMilestone(correctCount: correctCount) {
            phase = .celebration(milestoneNumber: MilestoneEngine.milestoneNumber(correctCount: correctCount))
        } else {
            nextProblem(now: now, using: &rng)
        }
    }

    /// Tutorial finished: log a kind outcome (not correct, streak untouched)
    /// and hand out a fresh similar problem of the same operation.
    mutating func finishTutorial(now: Date = Date(), using rng: inout some RandomNumberGenerator) -> AttemptOutcome {
        let outcome = AttemptOutcome(
            operation: problem.operation,
            difficulty: config.difficulty,
            range: config.range.rawValue,
            tries: 3,
            timeToCorrect: 0,
            tutorialShown: true,
            solvedCorrectly: false
        )
        problem = ProblemGenerator.generateSimilar(to: problem, config: config, using: &rng)
        resetForNewProblem(now: now)
        return outcome
    }

    mutating func finishCelebration(now: Date = Date(), using rng: inout some RandomNumberGenerator) {
        guard case .celebration = phase else { return }
        nextProblem(now: now, using: &rng)
    }

    private mutating func nextProblem(now: Date, using rng: inout some RandomNumberGenerator) {
        problem = ProblemGenerator.generate(config: config, avoiding: problem, using: &rng)
        resetForNewProblem(now: now)
    }

    private mutating func resetForNewProblem(now: Date) {
        wrongAttempts = 0
        typed = ""
        problemShownAt = now
        phase = .answering
    }
}

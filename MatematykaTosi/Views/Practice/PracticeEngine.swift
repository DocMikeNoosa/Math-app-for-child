import Foundation
import Observation
import SwiftData

/// State machine for the practice screen, implementing the answer logic:
/// correct → praise & new problem; 1st/2nd wrong → same problem again
/// (2nd with a hint); 3rd wrong → interactive tutorial; tutorial neither
/// counts as correct nor breaks the streak. Every 5 correct answers →
/// escalating milestone celebration.
@Observable
@MainActor
final class PracticeEngine {

    enum Phase: Equatable {
        case answering
        /// Wrong once or twice — same problem, encouragement (+ hint on 2).
        case tryAgain(attempt: Int)
        /// Correct — praise overlay, auto-advances.
        case praise
        /// Third wrong — step-by-step graphical tutorial.
        case tutorial
        /// Every 5 correct answers.
        case celebration(milestoneNumber: Int)
    }

    /// Parent may change this mid-session; the *next* problem follows the new
    /// configuration while the current one stays on screen.
    var config: SessionConfig

    private(set) var problem: MathProblem
    var typed = ""
    private(set) var phase: Phase = .answering
    private(set) var wrongAttempts = 0
    private(set) var correctCount = 0
    private(set) var praiseIndex = 0
    /// Incremented on every correct answer to trigger a confetti burst.
    private(set) var confettiBurst = 0

    private var problemShownAt = Date()
    private var rng = SystemRandomNumberGenerator()
    private var advanceTask: Task<Void, Never>?

    /// Stars for the current 5-problem streak (0…5).
    var streakStars: Int {
        if case .celebration = phase { return 5 }
        return correctCount % MilestoneEngine.milestoneSize
    }

    var currentPraise: PraisePhrase { PraiseBank.phrase(at: praiseIndex) }

    init(config: SessionConfig) {
        self.config = config
        self.problem = ProblemGenerator.generate(config: config, avoiding: nil, using: &rng)
    }

    // MARK: Input

    var canType: Bool {
        switch phase {
        case .answering, .tryAgain: return true
        default: return false
        }
    }

    func tapDigit(_ digit: Int) {
        guard canType, typed.count < 3 else { return }
        typed.append(String(digit))
    }

    func tapBackspace() {
        guard canType, !typed.isEmpty else { return }
        typed.removeLast()
    }

    // MARK: Check

    func submit(app: AppState, context: ModelContext) {
        guard canType, let value = Int(typed) else { return }
        if value == problem.answer {
            handleCorrect(app: app, context: context)
        } else {
            handleWrong()
        }
    }

    private func handleCorrect(app: AppState, context: ModelContext) {
        let record = AttemptRecord(
            timestamp: Date(),
            operation: problem.operation,
            difficulty: config.difficulty,
            range: config.range.rawValue,
            tries: wrongAttempts + 1,
            timeToCorrect: Date().timeIntervalSince(problemShownAt),
            tutorialShown: false,
            solvedCorrectly: true
        )
        context.insert(record)

        correctCount += 1
        runningStreak += 1
        app.bestStreak = max(app.bestStreak, runningStreak)
        app.bestSessionCount = max(app.bestSessionCount, correctCount)
        praiseIndex = PraiseBank.next(after: app.lastPraiseIndex, using: &rng)
        app.lastPraiseIndex = praiseIndex
        try? context.save()

        typed = ""
        wrongAttempts = 0
        confettiBurst += 1
        SoundSynth.shared.playCorrect()
        Haptics.success()
        phase = .praise

        let milestone = MilestoneEngine.isMilestone(correctCount: correctCount)
        let milestoneNumber = MilestoneEngine.milestoneNumber(correctCount: correctCount)
        advanceTask?.cancel()
        advanceTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(1.5))
            guard let self, !Task.isCancelled else { return }
            if milestone {
                self.phase = .celebration(milestoneNumber: milestoneNumber)
            } else {
                self.nextProblem()
            }
        }
    }

    /// The streak the child is on right now (session-level consecutively
    /// solved problems; tutorials pause but don't break it).
    private var runningStreak = 0

    private func handleWrong() {
        wrongAttempts += 1
        typed = ""
        SoundSynth.shared.playGentleWrong()
        Haptics.gentleWarning()
        if wrongAttempts >= 3 {
            phase = .tutorial
        } else {
            phase = .tryAgain(attempt: wrongAttempts)
        }
    }

    // MARK: Tutorial finished

    func tutorialFinished(app: AppState, context: ModelContext) {
        let record = AttemptRecord(
            timestamp: Date(),
            operation: problem.operation,
            difficulty: config.difficulty,
            range: config.range.rawValue,
            tries: 3,
            timeToCorrect: 0,
            tutorialShown: true,
            solvedCorrectly: false
        )
        context.insert(record)
        try? context.save()
        // Kindness rule: the tutorialized problem doesn't break the streak —
        // runningStreak and correctCount stay as they are.
        problem = ProblemGenerator.generateSimilar(to: problem, config: config, using: &rng)
        resetForNewProblem()
    }

    // MARK: Celebration finished (coin already collected by the view)

    func celebrationFinished() {
        nextProblem()
    }

    private func nextProblem() {
        problem = ProblemGenerator.generate(config: config, avoiding: problem, using: &rng)
        resetForNewProblem()
    }

    private func resetForNewProblem() {
        wrongAttempts = 0
        typed = ""
        problemShownAt = Date()
        phase = .answering
    }
}

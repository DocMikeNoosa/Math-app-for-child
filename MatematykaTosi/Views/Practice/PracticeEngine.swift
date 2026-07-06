import Foundation
import Observation
import SwiftData

/// Thin observable driver around the pure `PracticeCore` state machine.
/// Owns everything the core deliberately doesn't: timing (the praise delay),
/// sounds, haptics, confetti and SwiftData persistence.
@Observable
@MainActor
final class PracticeEngine {

    private var core: PracticeCore
    private var rng = SystemRandomNumberGenerator()
    private var advanceTask: Task<Void, Never>?

    /// Incremented on every correct answer to trigger a confetti burst.
    private(set) var confettiBurst = 0

    init(config: SessionConfig) {
        var seed = SystemRandomNumberGenerator()
        core = PracticeCore(config: config, using: &seed)
    }

    // MARK: State exposed to the view

    var config: SessionConfig {
        get { core.config }
        set { core.setConfig(newValue) }
    }

    var problem: MathProblem { core.problem }
    var typed: String { core.typed }
    var phase: PracticeCore.Phase { core.phase }
    var correctCount: Int { core.correctCount }
    var streakStars: Int { core.streakStars }
    var currentPraise: PraisePhrase { PraiseBank.phrase(at: core.praiseIndex) }

    // MARK: Input

    func tapDigit(_ digit: Int) {
        core.tapDigit(digit)
    }

    func tapBackspace() {
        core.tapBackspace()
    }

    // MARK: Check

    func submit(app: AppState, context: ModelContext) {
        switch core.submit(lastPraiseIndex: app.lastPraiseIndex, using: &rng) {
        case .notAccepted:
            break

        case .correct(let outcome, _):
            insert(outcome, context: context)
            app.lastPraiseIndex = core.praiseIndex
            app.bestStreak = max(app.bestStreak, core.runningStreak)
            app.bestSessionCount = max(app.bestSessionCount, core.correctCount)
            try? context.save()

            confettiBurst += 1
            SoundSynth.shared.playCorrect()
            Haptics.success()

            advanceTask?.cancel()
            advanceTask = Task { [weak self] in
                try? await Task.sleep(for: .seconds(1.5))
                guard let self, !Task.isCancelled else { return }
                self.core.advanceAfterPraise(using: &self.rng)
            }

        case .wrong, .tutorial:
            SoundSynth.shared.playGentleWrong()
            Haptics.gentleWarning()
        }
    }

    // MARK: Transitions driven by covers

    func tutorialFinished(app: AppState, context: ModelContext) {
        let outcome = core.finishTutorial(using: &rng)
        insert(outcome, context: context)
        try? context.save()
    }

    func celebrationFinished() {
        core.finishCelebration(using: &rng)
    }

    // MARK: Persistence

    private func insert(_ outcome: AttemptOutcome, context: ModelContext) {
        context.insert(AttemptRecord(
            timestamp: Date(),
            operation: outcome.operation,
            difficulty: outcome.difficulty,
            range: outcome.range,
            tries: outcome.tries,
            timeToCorrect: outcome.timeToCorrect,
            tutorialShown: outcome.tutorialShown,
            solvedCorrectly: outcome.solvedCorrectly
        ))
    }
}

import Foundation
import SwiftData

/// Singleton app state: child profile, settings, coins.
@Model
final class AppState {
    var childName: String = "Tosia"
    var languageRaw: String = AppLanguage.pl.rawValue
    var hasOnboarded: Bool = false
    var coins: Int = 0
    /// 0…1; 0 acts as mute.
    var soundVolume: Double = 1.0
    var celebrationThemeRaw: String = CelebrationTheme.mixed.rawValue
    /// Daily usage limit in minutes; nil = off.
    var dailyLimitMinutes: Int?
    /// Day for which a parent granted a PIN override of the limit.
    var limitOverrideDate: Date?
    /// Longest run of consecutive correct answers ever.
    var bestStreak: Int = 0
    /// Best number of correct answers in a single practice session.
    var bestSessionCount: Int = 0
    /// Index of the last praise phrase, so it never repeats back-to-back.
    var lastPraiseIndex: Int = -1

    init() {}

    var language: AppLanguage {
        get { AppLanguage(rawValue: languageRaw) ?? .pl }
        set { languageRaw = newValue.rawValue }
    }

    var celebrationTheme: CelebrationTheme {
        get { CelebrationTheme(rawValue: celebrationThemeRaw) ?? .mixed }
        set { celebrationThemeRaw = newValue.rawValue }
    }
}

enum CelebrationTheme: String, Codable, CaseIterable, Identifiable {
    case unicorns, puppies, kittens, mixed
    var id: String { rawValue }
}

/// One resolved problem (either answered correctly or ended in a tutorial).
@Model
final class AttemptRecord {
    var timestamp: Date = Date()
    var operationRaw: String = MathOperation.addition.rawValue
    var difficultyRaw: String = Difficulty.easy.rawValue
    var range: Int = 100
    var tries: Int = 1
    var timeToCorrect: Double = 0
    var tutorialShown: Bool = false
    var solvedCorrectly: Bool = true

    init(timestamp: Date, operation: MathOperation, difficulty: Difficulty, range: Int,
         tries: Int, timeToCorrect: Double, tutorialShown: Bool, solvedCorrectly: Bool) {
        self.timestamp = timestamp
        self.operationRaw = operation.rawValue
        self.difficultyRaw = difficulty.rawValue
        self.range = range
        self.tries = tries
        self.timeToCorrect = timeToCorrect
        self.tutorialShown = tutorialShown
        self.solvedCorrectly = solvedCorrectly
    }

    var operation: MathOperation { MathOperation(rawValue: operationRaw) ?? .addition }
    var difficulty: Difficulty { Difficulty(rawValue: difficultyRaw) ?? .easy }

    var asData: AttemptData {
        AttemptData(date: timestamp, operation: operation, difficulty: difficulty,
                    range: range, tries: tries, timeToCorrect: timeToCorrect,
                    tutorialShown: tutorialShown, correct: solvedCorrectly)
    }
}

/// One chunk of app usage (for usage-time statistics and the daily limit).
@Model
final class UsageSession {
    var start: Date = Date()
    var duration: Double = 0

    init(start: Date, duration: Double) {
        self.start = start
        self.duration = duration
    }

    var asData: SessionData { SessionData(start: start, duration: duration) }
}

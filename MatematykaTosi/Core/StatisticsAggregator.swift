import Foundation

// MARK: - Plain data used by the pure aggregation functions (unit-testable,
// independent of SwiftData)

struct AttemptData: Equatable, Sendable {
    var date: Date
    var operation: MathOperation
    var difficulty: Difficulty
    var range: Int
    var tries: Int
    /// Seconds from showing the problem to the correct answer (0 when the
    /// problem ended in a tutorial).
    var timeToCorrect: TimeInterval
    var tutorialShown: Bool
    var correct: Bool
}

struct SessionData: Equatable, Sendable {
    var start: Date
    var duration: TimeInterval
}

// MARK: - Time frames

enum StatsTimeFrame: Equatable {
    case today
    case week      // last 7 days including today
    case month     // last 30 days including today
    case allTime
    case custom(start: Date, end: Date)

    /// Half-open interval [start, end) to filter by, or nil for "everything".
    func interval(now: Date, calendar: Calendar) -> DateInterval? {
        let todayStart = calendar.startOfDay(for: now)
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: todayStart)!
        switch self {
        case .today:
            return DateInterval(start: todayStart, end: tomorrow)
        case .week:
            let start = calendar.date(byAdding: .day, value: -6, to: todayStart)!
            return DateInterval(start: start, end: tomorrow)
        case .month:
            let start = calendar.date(byAdding: .day, value: -29, to: todayStart)!
            return DateInterval(start: start, end: tomorrow)
        case .allTime:
            return nil
        case .custom(let start, let end):
            let s = calendar.startOfDay(for: start)
            let e = calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: end))!
            return DateInterval(start: min(s, e), end: max(s, e))
        }
    }
}

// MARK: - Summaries

struct StatsSummary: Equatable {
    var totalAttempted: Int = 0        // problems finished (correct or tutorial)
    var solvedCorrectly: Int = 0
    var tutorialsTriggered: Int = 0
    var accuracy: Double = 0           // solvedCorrectly / totalAttempted
    var averageTries: Double = 0
    var averageTimeToCorrect: Double = 0 // over correctly solved problems only
}

enum StatisticsAggregator {

    static func filter(
        _ attempts: [AttemptData], frame: StatsTimeFrame, now: Date, calendar: Calendar
    ) -> [AttemptData] {
        guard let interval = frame.interval(now: now, calendar: calendar) else { return attempts }
        return attempts.filter { interval.start <= $0.date && $0.date < interval.end }
    }

    static func filterSessions(
        _ sessions: [SessionData], frame: StatsTimeFrame, now: Date, calendar: Calendar
    ) -> [SessionData] {
        guard let interval = frame.interval(now: now, calendar: calendar) else { return sessions }
        return sessions.filter { interval.start <= $0.start && $0.start < interval.end }
    }

    static func summary(_ attempts: [AttemptData]) -> StatsSummary {
        var s = StatsSummary()
        s.totalAttempted = attempts.count
        guard !attempts.isEmpty else { return s }
        let correct = attempts.filter { $0.correct }
        s.solvedCorrectly = correct.count
        s.tutorialsTriggered = attempts.filter { $0.tutorialShown }.count
        s.accuracy = Double(s.solvedCorrectly) / Double(s.totalAttempted)
        s.averageTries = attempts.map { Double($0.tries) }.reduce(0, +) / Double(attempts.count)
        if !correct.isEmpty {
            s.averageTimeToCorrect = correct.map(\.timeToCorrect).reduce(0, +) / Double(correct.count)
        }
        return s
    }

    static func summaryByOperation(_ attempts: [AttemptData]) -> [MathOperation: StatsSummary] {
        var result: [MathOperation: StatsSummary] = [:]
        for op in MathOperation.allCases {
            let subset = attempts.filter { $0.operation == op }
            if !subset.isEmpty { result[op] = summary(subset) }
        }
        return result
    }

    // MARK: Daily series for Swift Charts

    struct DayPoint: Equatable, Identifiable {
        var day: Date
        var value: Double
        var id: Date { day }
    }

    private static func grouped(
        _ attempts: [AttemptData], calendar: Calendar
    ) -> [(day: Date, items: [AttemptData])] {
        let dict = Dictionary(grouping: attempts) { calendar.startOfDay(for: $0.date) }
        return dict.keys.sorted().map { (day: $0, items: dict[$0]!) }
    }

    /// Accuracy (0…1) per day.
    static func dailyAccuracy(_ attempts: [AttemptData], calendar: Calendar) -> [DayPoint] {
        grouped(attempts, calendar: calendar).map { day, items in
            DayPoint(day: day, value: Double(items.filter { $0.correct }.count) / Double(items.count))
        }
    }

    /// Problems finished per day.
    static func dailyCount(_ attempts: [AttemptData], calendar: Calendar) -> [DayPoint] {
        grouped(attempts, calendar: calendar).map { day, items in
            DayPoint(day: day, value: Double(items.count))
        }
    }

    /// Average time-to-correct-answer per day (correct problems only).
    static func dailyAverageTime(_ attempts: [AttemptData], calendar: Calendar) -> [DayPoint] {
        grouped(attempts, calendar: calendar).compactMap { day, items in
            let correct = items.filter { $0.correct }
            guard !correct.isEmpty else { return nil }
            let avg = correct.map(\.timeToCorrect).reduce(0, +) / Double(correct.count)
            return DayPoint(day: day, value: avg)
        }
    }

    /// Total app usage minutes per day.
    static func dailyUsageMinutes(_ sessions: [SessionData], calendar: Calendar) -> [DayPoint] {
        let dict = Dictionary(grouping: sessions) { calendar.startOfDay(for: $0.start) }
        return dict.keys.sorted().map { day in
            DayPoint(day: day, value: dict[day]!.map(\.duration).reduce(0, +) / 60.0)
        }
    }

    /// Total usage in seconds for a frame.
    static func totalUsageSeconds(
        _ sessions: [SessionData], frame: StatsTimeFrame, now: Date, calendar: Calendar
    ) -> TimeInterval {
        filterSessions(sessions, frame: frame, now: now, calendar: calendar)
            .map(\.duration).reduce(0, +)
    }
}

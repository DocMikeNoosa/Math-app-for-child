import XCTest
@testable import MatematykaTosi

final class StatisticsAggregatorTests: XCTestCase {

    private var calendar: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "Europe/Warsaw")!
        return c
    }

    private func date(_ y: Int, _ m: Int, _ d: Int, _ h: Int = 12) -> Date {
        calendar.date(from: DateComponents(year: y, month: m, day: d, hour: h))!
    }

    private func attempt(
        _ date: Date, op: MathOperation = .addition, tries: Int = 1,
        time: TimeInterval = 5, tutorial: Bool = false, correct: Bool = true
    ) -> AttemptData {
        AttemptData(date: date, operation: op, difficulty: .medium, range: 100,
                    tries: tries, timeToCorrect: time, tutorialShown: tutorial, correct: correct)
    }

    // MARK: Time frames

    func testTodayFrameIncludesOnlyToday() {
        let now = date(2026, 7, 5, 18)
        let attempts = [
            attempt(date(2026, 7, 5, 9)),       // today
            attempt(date(2026, 7, 5, 0)),       // today, midnight
            attempt(date(2026, 7, 4, 23)),      // yesterday
            attempt(date(2026, 7, 6, 1)),       // tomorrow (clock skew)
        ]
        let filtered = StatisticsAggregator.filter(attempts, frame: .today, now: now, calendar: calendar)
        XCTAssertEqual(filtered.count, 2)
    }

    func testWeekFrameIsLastSevenDaysInclusive() {
        let now = date(2026, 7, 7)
        let attempts = [
            attempt(date(2026, 7, 7)),   // today — in
            attempt(date(2026, 7, 1)),   // 6 days ago — in
            attempt(date(2026, 6, 30)),  // 7 days ago — out
        ]
        let filtered = StatisticsAggregator.filter(attempts, frame: .week, now: now, calendar: calendar)
        XCTAssertEqual(filtered.count, 2)
    }

    func testMonthFrameIsLastThirtyDaysInclusive() {
        let now = date(2026, 7, 31)
        let attempts = [
            attempt(date(2026, 7, 31)),  // in
            attempt(date(2026, 7, 2)),   // 29 days ago — in
            attempt(date(2026, 7, 1)),   // 30 days ago — out
        ]
        let filtered = StatisticsAggregator.filter(attempts, frame: .month, now: now, calendar: calendar)
        XCTAssertEqual(filtered.count, 2)
    }

    func testAllTimeFrameFiltersNothing() {
        let now = date(2026, 7, 5)
        let attempts = [attempt(date(2020, 1, 1)), attempt(date(2026, 7, 5))]
        let filtered = StatisticsAggregator.filter(attempts, frame: .allTime, now: now, calendar: calendar)
        XCTAssertEqual(filtered.count, 2)
    }

    func testCustomFrameIsInclusiveOfBothEndDays() {
        let now = date(2026, 7, 20)
        let attempts = [
            attempt(date(2026, 7, 1, 0)),
            attempt(date(2026, 7, 10, 23)),
            attempt(date(2026, 7, 11, 0)),
        ]
        let frame = StatsTimeFrame.custom(start: date(2026, 7, 1), end: date(2026, 7, 10))
        let filtered = StatisticsAggregator.filter(attempts, frame: frame, now: now, calendar: calendar)
        XCTAssertEqual(filtered.count, 2)
    }

    // MARK: Summary math

    func testSummaryMath() {
        let now = date(2026, 7, 5)
        let attempts = [
            attempt(now, tries: 1, time: 4, correct: true),
            attempt(now, tries: 2, time: 8, correct: true),
            attempt(now, tries: 3, time: 0, tutorial: true, correct: false),
            attempt(now, tries: 2, time: 6, correct: true),
        ]
        let s = StatisticsAggregator.summary(attempts)
        XCTAssertEqual(s.totalAttempted, 4)
        XCTAssertEqual(s.solvedCorrectly, 3)
        XCTAssertEqual(s.tutorialsTriggered, 1)
        XCTAssertEqual(s.accuracy, 0.75, accuracy: 0.0001)
        XCTAssertEqual(s.averageTries, 2.0, accuracy: 0.0001)
        XCTAssertEqual(s.averageTimeToCorrect, 6.0, accuracy: 0.0001, "Average over correct only")
    }

    func testEmptySummaryIsAllZeros() {
        let s = StatisticsAggregator.summary([])
        XCTAssertEqual(s.totalAttempted, 0)
        XCTAssertEqual(s.accuracy, 0)
        XCTAssertEqual(s.averageTries, 0)
        XCTAssertEqual(s.averageTimeToCorrect, 0)
    }

    func testSummaryByOperationSplitsCorrectly() {
        let now = date(2026, 7, 5)
        let attempts = [
            attempt(now, op: .addition, correct: true),
            attempt(now, op: .addition, correct: false),
            attempt(now, op: .multiplication, correct: true),
        ]
        let byOp = StatisticsAggregator.summaryByOperation(attempts)
        XCTAssertEqual(byOp[.addition]?.totalAttempted, 2)
        XCTAssertEqual(byOp[.addition]?.solvedCorrectly, 1)
        XCTAssertEqual(byOp[.multiplication]?.totalAttempted, 1)
        XCTAssertNil(byOp[.division])
    }

    // MARK: Daily series

    func testDailySeriesGroupAndSort() {
        let attempts = [
            attempt(date(2026, 7, 2, 9), correct: true),
            attempt(date(2026, 7, 2, 15), correct: false),
            attempt(date(2026, 7, 1, 10), correct: true),
        ]
        let accuracy = StatisticsAggregator.dailyAccuracy(attempts, calendar: calendar)
        XCTAssertEqual(accuracy.count, 2)
        XCTAssertEqual(accuracy[0].day, calendar.startOfDay(for: date(2026, 7, 1)))
        XCTAssertEqual(accuracy[0].value, 1.0, accuracy: 0.0001)
        XCTAssertEqual(accuracy[1].value, 0.5, accuracy: 0.0001)

        let counts = StatisticsAggregator.dailyCount(attempts, calendar: calendar)
        XCTAssertEqual(counts.map(\.value), [1, 2])
    }

    func testDailyAverageTimeSkipsDaysWithoutCorrectAnswers() {
        let attempts = [
            attempt(date(2026, 7, 1), time: 10, correct: true),
            attempt(date(2026, 7, 2), time: 0, tutorial: true, correct: false),
        ]
        let series = StatisticsAggregator.dailyAverageTime(attempts, calendar: calendar)
        XCTAssertEqual(series.count, 1)
        XCTAssertEqual(series[0].value, 10, accuracy: 0.0001)
    }

    // MARK: Usage

    func testDailyUsageMinutes() {
        let sessions = [
            SessionData(start: date(2026, 7, 1, 9), duration: 600),   // 10 min
            SessionData(start: date(2026, 7, 1, 17), duration: 300),  // 5 min
            SessionData(start: date(2026, 7, 2, 9), duration: 120),   // 2 min
        ]
        let series = StatisticsAggregator.dailyUsageMinutes(sessions, calendar: calendar)
        XCTAssertEqual(series.count, 2)
        XCTAssertEqual(series[0].value, 15, accuracy: 0.0001)
        XCTAssertEqual(series[1].value, 2, accuracy: 0.0001)
    }

    func testTotalUsageRespectsTimeFrame() {
        let now = date(2026, 7, 5, 20)
        let sessions = [
            SessionData(start: date(2026, 7, 5, 9), duration: 600),
            SessionData(start: date(2026, 7, 1, 9), duration: 900),
        ]
        let today = StatisticsAggregator.totalUsageSeconds(sessions, frame: .today, now: now, calendar: calendar)
        XCTAssertEqual(today, 600, accuracy: 0.0001)
        let week = StatisticsAggregator.totalUsageSeconds(sessions, frame: .week, now: now, calendar: calendar)
        XCTAssertEqual(week, 1500, accuracy: 0.0001)
    }
}

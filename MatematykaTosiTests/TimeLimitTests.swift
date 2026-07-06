import XCTest
@testable import MatematykaTosi

final class TimeLimitTests: XCTestCase {

    private var calendar: Calendar {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "Europe/Warsaw")!
        return c
    }

    private func date(_ y: Int, _ m: Int, _ d: Int, _ h: Int, _ min: Int = 0) -> Date {
        calendar.date(from: DateComponents(year: y, month: m, day: d, hour: h, minute: min))!
    }

    // MARK: Used time today

    func testUsedSecondsCountsOnlyTodayOverlap() {
        let now = date(2026, 7, 5, 12)
        let sessions = [
            SessionData(start: date(2026, 7, 5, 9), duration: 600),      // today: 600 s
            SessionData(start: date(2026, 7, 4, 10), duration: 1200),    // yesterday: 0 s
            // Session spanning midnight: only the part after 00:00 counts (1 h).
            SessionData(start: date(2026, 7, 4, 23), duration: 7200),
        ]
        let used = TimeLimitEngine.usedSecondsToday(
            sessions: sessions, currentSessionStart: nil, now: now, calendar: calendar)
        XCTAssertEqual(used, 600 + 3600, accuracy: 0.5)
    }

    func testUsedSecondsIncludesLiveSession() {
        let now = date(2026, 7, 5, 12)
        let used = TimeLimitEngine.usedSecondsToday(
            sessions: [], currentSessionStart: date(2026, 7, 5, 11, 40), now: now, calendar: calendar)
        XCTAssertEqual(used, 1200, accuracy: 0.5)
    }

    // MARK: Limit states

    func testNoLimitMeansOff() {
        XCTAssertEqual(TimeLimitEngine.state(usedSeconds: 99_999, limitMinutes: nil, overrideActive: false), .off)
    }

    func testOverrideDisablesTheLimit() {
        XCTAssertEqual(TimeLimitEngine.state(usedSeconds: 99_999, limitMinutes: 30, overrideActive: true), .off)
    }

    func testOkWarningAndReachedThresholds() {
        // 30-minute limit.
        XCTAssertEqual(
            TimeLimitEngine.state(usedSeconds: 10 * 60, limitMinutes: 30, overrideActive: false),
            .ok(remaining: 20 * 60))
        // Exactly 5 minutes left → warning.
        XCTAssertEqual(
            TimeLimitEngine.state(usedSeconds: 25 * 60, limitMinutes: 30, overrideActive: false),
            .warning(remaining: 5 * 60))
        XCTAssertEqual(
            TimeLimitEngine.state(usedSeconds: 29 * 60, limitMinutes: 30, overrideActive: false),
            .warning(remaining: 60))
        XCTAssertEqual(
            TimeLimitEngine.state(usedSeconds: 30 * 60, limitMinutes: 30, overrideActive: false),
            .reached)
        XCTAssertEqual(
            TimeLimitEngine.state(usedSeconds: 45 * 60, limitMinutes: 30, overrideActive: false),
            .reached)
    }

    // MARK: Override expiry

    func testOverrideLastsOnlyForItsDay() {
        let grantedAt = date(2026, 7, 5, 20)
        XCTAssertTrue(TimeLimitEngine.overrideActive(
            overrideDate: grantedAt, now: date(2026, 7, 5, 23), calendar: calendar))
        XCTAssertFalse(TimeLimitEngine.overrideActive(
            overrideDate: grantedAt, now: date(2026, 7, 6, 9), calendar: calendar))
        XCTAssertFalse(TimeLimitEngine.overrideActive(
            overrideDate: nil, now: date(2026, 7, 5, 23), calendar: calendar))
    }
}

import Foundation

enum TimeLimitState: Equatable {
    case off
    case ok(remaining: TimeInterval)
    /// 5 minutes or less left — show the gentle warning banner.
    case warning(remaining: TimeInterval)
    case reached
}

/// Pure daily-time-limit logic. The UI feeds it today's recorded sessions
/// plus the live, still-open session; it answers "how are we doing?".
enum TimeLimitEngine {

    static let warningWindow: TimeInterval = 5 * 60

    /// Seconds of app use that fall on today's calendar day.
    static func usedSecondsToday(
        sessions: [SessionData],
        currentSessionStart: Date?,
        now: Date,
        calendar: Calendar
    ) -> TimeInterval {
        let todayStart = calendar.startOfDay(for: now)
        var total: TimeInterval = 0
        for s in sessions {
            let end = s.start.addingTimeInterval(s.duration)
            let overlapStart = max(s.start, todayStart)
            let overlapEnd = min(end, now)
            if overlapEnd > overlapStart { total += overlapEnd.timeIntervalSince(overlapStart) }
        }
        if let start = currentSessionStart {
            let overlapStart = max(start, todayStart)
            if now > overlapStart { total += now.timeIntervalSince(overlapStart) }
        }
        return total
    }

    static func state(
        usedSeconds: TimeInterval,
        limitMinutes: Int?,
        overrideActive: Bool
    ) -> TimeLimitState {
        guard let limitMinutes, limitMinutes > 0, !overrideActive else { return .off }
        let remaining = TimeInterval(limitMinutes * 60) - usedSeconds
        if remaining <= 0 { return .reached }
        if remaining <= warningWindow { return .warning(remaining: remaining) }
        return .ok(remaining: remaining)
    }

    /// Is a parent override (granted on `overrideDate`) still valid at `now`?
    /// Overrides last until the end of the day they were granted.
    static func overrideActive(overrideDate: Date?, now: Date, calendar: Calendar) -> Bool {
        guard let overrideDate else { return false }
        return calendar.isDate(overrideDate, inSameDayAs: now)
    }
}

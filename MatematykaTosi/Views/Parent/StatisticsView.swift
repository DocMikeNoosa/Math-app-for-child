import SwiftUI
import SwiftData
import Charts

/// Parent statistics dashboard: summary, per-operation breakdown,
/// Swift Charts graphs and app-usage time, all filterable by time frame
/// (today / week / month / all time / custom range).
struct StatisticsView: View {
    @Environment(AppState.self) private var app
    @Environment(\.l10n) private var t
    @Query(sort: \AttemptRecord.timestamp) private var attemptRecords: [AttemptRecord]
    @Query(sort: \UsageSession.start) private var usageRecords: [UsageSession]

    private enum FrameChoice: Int, CaseIterable, Identifiable {
        case today, week, month, allTime, custom
        var id: Int { rawValue }
    }

    @State private var frameChoice: FrameChoice = .week
    @State private var customStart = Calendar.current.date(byAdding: .day, value: -7, to: Date())!
    @State private var customEnd = Date()

    private var calendar: Calendar { .current }

    private var frame: StatsTimeFrame {
        switch frameChoice {
        case .today: return .today
        case .week: return .week
        case .month: return .month
        case .allTime: return .allTime
        case .custom: return .custom(start: customStart, end: customEnd)
        }
    }

    private var attempts: [AttemptData] {
        StatisticsAggregator.filter(
            attemptRecords.map(\.asData), frame: frame, now: Date(), calendar: calendar)
    }

    private var sessions: [SessionData] {
        StatisticsAggregator.filterSessions(
            usageRecords.map(\.asData), frame: frame, now: Date(), calendar: calendar)
    }

    var body: some View {
        List {
            Section {
                Picker(t.pick("Okres", "Time frame"), selection: $frameChoice) {
                    ForEach(FrameChoice.allCases) { choice in
                        Text(t.frameName(choice.rawValue)).tag(choice)
                    }
                }
                if frameChoice == .custom {
                    DatePicker(t.pick("Od", "From"), selection: $customStart, displayedComponents: .date)
                    DatePicker(t.pick("Do", "To"), selection: $customEnd, displayedComponents: .date)
                }
            }

            summarySection
            perOperationSection
            chartsSection
            usageSection
        }
        .navigationTitle("📊 " + t.statistics)
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: Summary

    private var summarySection: some View {
        let s = StatisticsAggregator.summary(attempts)
        return Section(t.pick("Podsumowanie", "Summary")) {
            statRow("✅", t.pick("Rozwiązane poprawnie", "Solved correctly"), "\(s.solvedCorrectly)")
            statRow("🎯", t.pick("Skuteczność", "Accuracy"), percent(s.accuracy))
            statRow("🔁", t.pick("Średnio prób na zadanie", "Average tries per problem"),
                    String(format: "%.2f", s.averageTries))
            statRow("⏱️", t.pick("Średni czas odpowiedzi", "Average time to correct answer"),
                    String(format: "%.1f s", s.averageTimeToCorrect))
            statRow("🦉", t.pick("Uruchomione samouczki", "Tutorials triggered"), "\(s.tutorialsTriggered)")
        }
    }

    private func statRow(_ emoji: String, _ title: String, _ value: String) -> some View {
        HStack {
            Text(emoji)
            Text(title)
            Spacer()
            Text(value)
                .font(.headline)
                .foregroundStyle(Theme.purple)
        }
    }

    private func percent(_ value: Double) -> String {
        String(format: "%.0f%%", value * 100)
    }

    // MARK: Per operation

    private var perOperationSection: some View {
        let byOp = StatisticsAggregator.summaryByOperation(attempts)
        return Section(t.pick("Według działania", "By operation")) {
            if byOp.isEmpty {
                Text(t.pick("Brak danych w tym okresie", "No data in this time frame"))
                    .foregroundStyle(.secondary)
            }
            ForEach(MathOperation.allCases) { op in
                if let s = byOp[op] {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("\(op.emoji) \(t.operationName(op))")
                            .font(.headline)
                        HStack(spacing: 12) {
                            Text("✅ \(s.solvedCorrectly)/\(s.totalAttempted)")
                            Text("🎯 \(percent(s.accuracy))")
                            Text(String(format: "🔁 %.1f", s.averageTries))
                            Text(String(format: "⏱️ %.1f s", s.averageTimeToCorrect))
                            Text("🦉 \(s.tutorialsTriggered)")
                        }
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    }
                }
            }
        }
    }

    // MARK: Charts

    @ViewBuilder
    private var chartsSection: some View {
        let accuracySeries = StatisticsAggregator.dailyAccuracy(attempts, calendar: calendar)
        let countSeries = StatisticsAggregator.dailyCount(attempts, calendar: calendar)
        let timeSeries = StatisticsAggregator.dailyAverageTime(attempts, calendar: calendar)
        let byOp = StatisticsAggregator.summaryByOperation(attempts)

        Section(t.pick("Skuteczność w czasie", "Accuracy over time")) {
            if accuracySeries.isEmpty {
                emptyChartNote
            } else {
                Chart(accuracySeries) { point in
                    LineMark(x: .value("Dzień", point.day, unit: .day),
                             y: .value("%", point.value * 100))
                        .foregroundStyle(Theme.mint)
                        .symbol(.circle)
                }
                .chartYScale(domain: 0...100)
                .frame(height: 170)
                .padding(.vertical, 4)
            }
        }

        Section(t.pick("Zadania na dzień", "Problems per day")) {
            if countSeries.isEmpty {
                emptyChartNote
            } else {
                Chart(countSeries) { point in
                    BarMark(x: .value("Dzień", point.day, unit: .day),
                            y: .value("Zadania", point.value))
                        .foregroundStyle(Theme.skyBlue)
                        .cornerRadius(4)
                }
                .frame(height: 170)
                .padding(.vertical, 4)
            }
        }

        Section(t.pick("Porównanie działań", "Operation comparison")) {
            if byOp.isEmpty {
                emptyChartNote
            } else {
                Chart(MathOperation.allCases.filter { byOp[$0] != nil }, id: \.self) { op in
                    BarMark(x: .value("Działanie", t.operationName(op)),
                            y: .value("%", (byOp[op]?.accuracy ?? 0) * 100))
                        .foregroundStyle(Theme.purple)
                        .cornerRadius(4)
                }
                .chartYScale(domain: 0...100)
                .frame(height: 170)
                .padding(.vertical, 4)
            }
        }

        Section(t.pick("Średni czas rozwiązania", "Average solve time")) {
            if timeSeries.isEmpty {
                emptyChartNote
            } else {
                Chart(timeSeries) { point in
                    LineMark(x: .value("Dzień", point.day, unit: .day),
                             y: .value("s", point.value))
                        .foregroundStyle(Theme.coral)
                        .symbol(.circle)
                }
                .frame(height: 170)
                .padding(.vertical, 4)
            }
        }
    }

    private var emptyChartNote: some View {
        Text(t.pick("Brak danych w tym okresie", "No data in this time frame"))
            .foregroundStyle(.secondary)
    }

    // MARK: App usage time

    private var usageSection: some View {
        let usageSeries = StatisticsAggregator.dailyUsageMinutes(sessions, calendar: calendar)
        let totalMinutes = Int(sessions.map(\.duration).reduce(0, +) / 60)
        return Section(t.pick("Czas w aplikacji", "App usage time")) {
            statRow("🕐", t.pick("Łącznie w tym okresie", "Total in this time frame"),
                    "\(totalMinutes) min")
            if !usageSeries.isEmpty {
                Chart(usageSeries) { point in
                    BarMark(x: .value("Dzień", point.day, unit: .day),
                            y: .value("min", point.value))
                        .foregroundStyle(Theme.sunny)
                        .cornerRadius(4)
                }
                .frame(height: 170)
                .padding(.vertical, 4)
            }
        }
    }
}

import SwiftUI
import SwiftData

/// Bootstraps the singleton AppState and routes to onboarding or the main flow.
struct RootView: View {
    @Environment(\.modelContext) private var context
    @Query private var states: [AppState]

    var body: some View {
        Group {
            if let app = states.first {
                MainRouterView()
                    .environment(app)
                    .environment(\.l10n, L10n(lang: app.language, childName: app.childName))
                    .onAppear { SoundSynth.shared.volume = app.soundVolume }
            } else {
                Theme.background.ignoresSafeArea()
                    .onAppear {
                        context.insert(AppState())
                        try? context.save()
                    }
            }
        }
    }
}

/// Onboarding vs. main flow, plus app-usage tracking and the daily time limit.
struct MainRouterView: View {
    @Environment(AppState.self) private var app
    @Environment(\.modelContext) private var context
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.l10n) private var t
    @Query private var sessions: [UsageSession]

    @State private var currentSessionStart: Date?
    @State private var limitState: TimeLimitState = .off
    @State private var showLimitOverrideGate = false

    private let calendar = Calendar.current

    var body: some View {
        Group {
            if !app.hasOnboarded || !PinStore.hasPin {
                OnboardingView()
            } else {
                HomeFlowView()
                    .overlay(alignment: .top) {
                        if case .warning = limitState {
                            warningBanner
                        }
                    }
                    .overlay {
                        if case .reached = limitState {
                            TimeLimitReachedView {
                                showLimitOverrideGate = true
                            }
                        }
                    }
            }
        }
        .onAppear { startSessionIfNeeded() }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active {
                startSessionIfNeeded()
            } else {
                closeSession()
            }
        }
        .task {
            // Stable heartbeat for usage checkpointing and limit checks
            // (a Timer publisher created in body would restart on re-render).
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(15))
                checkpointSession()
                refreshLimitState(now: Date())
            }
        }
        .onChange(of: app.dailyLimitMinutes) { refreshLimitState(now: Date()) }
        .onChange(of: app.limitOverrideDate) { refreshLimitState(now: Date()) }
        .sheet(isPresented: $showLimitOverrideGate) {
            PinGateView {
                showLimitOverrideGate = false
                app.limitOverrideDate = Date()
                try? context.save()
            }
        }
    }

    private var warningBanner: some View {
        HStack(spacing: 8) {
            Text("⏰")
            Text(t.fiveMinutesLeft)
                .font(Theme.rounded(17, weight: .semibold))
                .foregroundStyle(.white)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 10)
        .background(Capsule().fill(Theme.purple.opacity(0.92)))
        .padding(.top, 6)
        .transition(.move(edge: .top).combined(with: .opacity))
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: limitStateIsWarning)
    }

    private var limitStateIsWarning: Bool {
        if case .warning = limitState { return true }
        return false
    }

    // MARK: Usage tracking

    private func startSessionIfNeeded() {
        if currentSessionStart == nil {
            currentSessionStart = Date()
        }
        refreshLimitState(now: Date())
    }

    private func closeSession() {
        guard let start = currentSessionStart else { return }
        let duration = Date().timeIntervalSince(start)
        if duration > 1 {
            context.insert(UsageSession(start: start, duration: duration))
            try? context.save()
        }
        currentSessionStart = nil
    }

    /// Flush the open session chunk every minute so usage survives an
    /// unexpected termination and limit math stays honest.
    private func checkpointSession() {
        guard let start = currentSessionStart else { return }
        let duration = Date().timeIntervalSince(start)
        if duration >= 60 {
            context.insert(UsageSession(start: start, duration: duration))
            try? context.save()
            currentSessionStart = Date()
        }
    }

    // MARK: Time limit

    private func refreshLimitState(now: Date) {
        let used = TimeLimitEngine.usedSecondsToday(
            sessions: sessions.map(\.asData),
            currentSessionStart: currentSessionStart,
            now: now,
            calendar: calendar
        )
        let overridden = TimeLimitEngine.overrideActive(
            overrideDate: app.limitOverrideDate, now: now, calendar: calendar
        )
        let newState = TimeLimitEngine.state(
            usedSeconds: used, limitMinutes: app.dailyLimitMinutes, overrideActive: overridden
        )
        if newState != limitState {
            if case .reached = newState { SoundSynth.shared.playSleepy() }
            withAnimation { limitState = newState }
        }
    }
}

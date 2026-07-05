import SwiftUI
import SwiftData

/// Screen 4: the main practice screen — big problem on top, calculator
/// keypad below, coins + streak stars + cogwheel around it.
struct PracticeView: View {
    @Environment(AppState.self) private var app
    @Environment(SessionStore.self) private var session
    @Environment(\.modelContext) private var context
    @Environment(\.l10n) private var t

    @State private var engine: PracticeEngine?
    @State private var showTreasures = false
    @State private var showParentGate = false
    @State private var showParentSettings = false
    @State private var showFancyWordMeaning = false

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            if let engine {
                content(engine)
                ConfettiView(burst: engine.confettiBurst)
                    .ignoresSafeArea()
            }
        }
        .onAppear {
            if engine == nil { engine = PracticeEngine(config: session.config) }
        }
        .onChange(of: session.config) { _, newConfig in
            engine?.config = newConfig
        }
        .toolbar {
            ToolbarItem(placement: .principal) {
                if let engine { StreakStarsView(filled: engine.streakStars) }
            }
            ToolbarItem(placement: .topBarTrailing) {
                CoinCounterView(coins: app.coins)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showTreasures) { TreasuresView() }
        .sheet(isPresented: $showParentGate) {
            PinGateView {
                showParentGate = false
                showParentSettings = true
            }
        }
        .sheet(isPresented: $showParentSettings) { ParentSettingsView() }
        .fullScreenCover(isPresented: tutorialBinding) {
            if let engine {
                TutorialView(problem: engine.problem) {
                    engine.tutorialFinished(app: app, context: context)
                }
            }
        }
        .fullScreenCover(isPresented: celebrationBinding) {
            if let engine, case .celebration(let milestoneNumber) = engine.phase {
                CelebrationView(milestoneNumber: milestoneNumber) {
                    engine.celebrationFinished()
                }
            }
        }
    }

    // MARK: Layout

    private func content(_ engine: PracticeEngine) -> some View {
        VStack(spacing: 0) {
            Spacer(minLength: 8)
            problemText(engine)
                .padding(.horizontal, 16)

            feedbackArea(engine)
                .frame(minHeight: 96)
                .padding(.horizontal, 20)

            Spacer(minLength: 8)

            KeypadView { key in
                switch key {
                case .digit(let d): engine.tapDigit(d)
                case .backspace: engine.tapBackspace()
                case .confirm: engine.submit(app: app, context: context)
                }
            }

            HStack {
                Button {
                    showParentGate = true
                } label: {
                    Image(systemName: "gearshape.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(.gray.opacity(0.6))
                        .frame(width: 56, height: 44)
                }
                .accessibilityLabel(t.parentZone)
                Spacer()
                Button {
                    showTreasures = true
                } label: {
                    Text("🧰")
                        .font(.system(size: 28))
                        .frame(width: 56, height: 44)
                }
                .buttonStyle(SquishyButtonStyle())
                .accessibilityLabel(t.myTreasures)
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 4)
        }
    }

    private func problemText(_ engine: PracticeEngine) -> some View {
        let parts = engine.problem.promptParts()
        return (
            Text(parts.prefix)
                .foregroundStyle(Theme.purple)
            + Text(engine.typed.isEmpty ? "?" : engine.typed)
                .foregroundStyle(engine.typed.isEmpty ? Theme.pink.opacity(0.55) : Theme.pink)
                .underline(true, color: Theme.pink.opacity(0.6))
            + Text(parts.suffix)
                .foregroundStyle(Theme.purple)
        )
        .font(Theme.rounded(56, weight: .heavy))
        .minimumScaleFactor(0.4)
        .lineLimit(1)
        .frame(maxWidth: .infinity)
        .contentTransition(.numericText())
        .animation(.snappy(duration: 0.15), value: engine.typed)
        .accessibilityLabel(engine.problem.displayText)
    }

    // MARK: Feedback (praise / try again / hint)

    @ViewBuilder
    private func feedbackArea(_ engine: PracticeEngine) -> some View {
        switch engine.phase {
        case .praise:
            praiseBanner(engine)
                .transition(.scale.combined(with: .opacity))
        case .tryAgain(let attempt):
            VStack(spacing: 6) {
                Text(attempt == 1 ? t.tryAgain : t.almostThere)
                    .font(Theme.rounded(22))
                    .foregroundStyle(Theme.coral)
                    .multilineTextAlignment(.center)
                if attempt >= 2 {
                    Text(t.hint(for: engine.problem))
                        .font(Theme.rounded(17, weight: .semibold))
                        .foregroundStyle(Theme.purple)
                        .multilineTextAlignment(.center)
                        .padding(10)
                        .background(RoundedRectangle(cornerRadius: 14).fill(Theme.softYellow.opacity(0.9)))
                }
            }
            .transition(.opacity)
        default:
            EmptyView()
        }
    }

    private func praiseBanner(_ engine: PracticeEngine) -> some View {
        let phrase = engine.currentPraise
        return VStack(spacing: 6) {
            HStack(spacing: 8) {
                Text(phrase.text(language: app.language, name: app.childName))
                    .font(Theme.rounded(24))
                    .foregroundStyle(Theme.mint)
                    .multilineTextAlignment(.center)
                if phrase.fancyWord != nil {
                    Button {
                        showFancyWordMeaning.toggle()
                    } label: {
                        Text("💬")
                            .font(.system(size: 20))
                    }
                    .accessibilityLabel(t.whatDoesItMean)
                }
            }
            if showFancyWordMeaning, let fancy = phrase.fancyWord {
                Text("„\(fancy.word)” — \(app.language == .pl ? fancy.meaningPL : fancy.meaningEN)")
                    .font(Theme.rounded(15, weight: .medium))
                    .foregroundStyle(.secondary)
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 12).fill(.white.opacity(0.85)))
            }
        }
        .onDisappear { showFancyWordMeaning = false }
    }

    // MARK: Cover bindings

    private var tutorialBinding: Binding<Bool> {
        Binding(
            get: { engine?.phase == .tutorial },
            set: { _ in }
        )
    }

    private var celebrationBinding: Binding<Bool> {
        Binding(
            get: {
                if case .celebration = engine?.phase { return true }
                return false
            },
            set: { _ in }
        )
    }
}

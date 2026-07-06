import SwiftUI
import Observation

/// Shared, observable session configuration — the parent can adjust it
/// mid-session from the settings, and the practice engine picks the change
/// up for the next problem.
@Observable
final class SessionStore {
    var config = SessionConfig()
    /// Did the user pick "range" manually? (Otherwise we keep suggesting the
    /// curriculum default when operations change.)
    var userPickedRange = false
}

private enum SetupStep: Hashable {
    case range, difficulty, practice
}

/// Screens 1–4 as a NavigationStack: operations → range → difficulty → practice.
struct HomeFlowView: View {
    @State private var session = SessionStore()
    @State private var path: [SetupStep] = []

    var body: some View {
        NavigationStack(path: $path) {
            OperationSelectView {
                path.append(.range)
            }
            .navigationDestination(for: SetupStep.self) { step in
                switch step {
                case .range:
                    RangeSelectView { path.append(.difficulty) }
                case .difficulty:
                    DifficultySelectView { path.append(.practice) }
                case .practice:
                    PracticeView()
                }
            }
        }
        .environment(session)
        .tint(Theme.purple)
    }
}

// MARK: - Screen 1: operation selection

struct OperationSelectView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.l10n) private var t
    @Environment(AppState.self) private var app
    let onNext: () -> Void

    @State private var showTreasures = false
    @State private var showParentGate = false
    @State private var parentUnlocked = false
    @State private var showParentSettings = false

    private let tileColors: [MathOperation: Color] = [
        .addition: Theme.mint, .subtraction: Theme.skyBlue,
        .multiplication: Theme.coral, .division: Theme.purple,
    ]

    private var allSelected: Bool {
        session.config.operations == Set(MathOperation.allCases)
    }

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            VStack(spacing: 18) {
                HStack {
                    Spacer()
                    CoinCounterView(coins: app.coins)
                }
                .padding(.horizontal)

                Text(t.whatPractice)
                    .font(Theme.rounded(32))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.purple)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                    ForEach(MathOperation.allCases) { op in
                        SelectableTile(
                            isSelected: session.config.operations.contains(op),
                            color: tileColors[op]!,
                            action: { toggle(op) }
                        ) {
                            VStack(spacing: 6) {
                                Text(op.emoji).font(.system(size: 44))
                                Text(t.operationName(op))
                                    .font(Theme.rounded(20))
                                    .foregroundStyle(Theme.purple)
                            }
                        }
                    }
                }
                .padding(.horizontal)

                SelectableTile(isSelected: allSelected, color: Theme.sunny, action: toggleRandom) {
                    HStack(spacing: 10) {
                        Text("🎲").font(.system(size: 38))
                        Text(t.random)
                            .font(Theme.rounded(22))
                            .foregroundStyle(Theme.purple)
                    }
                }
                .padding(.horizontal)

                Spacer()

                BigActionButton(title: t.next, enabled: !session.config.operations.isEmpty) {
                    suggestRangeDefault()
                    onNext()
                }

                HStack {
                    Button {
                        showParentGate = true
                    } label: {
                        Image(systemName: "gearshape.fill")
                            .font(.system(size: 26))
                            .foregroundStyle(.gray.opacity(0.7))
                            .frame(width: 64, height: 64)
                    }
                    .accessibilityLabel(t.parentZone)
                    Spacer()
                    Button {
                        showTreasures = true
                    } label: {
                        VStack(spacing: 2) {
                            Text("🧰").font(.system(size: 34))
                            Text(t.myTreasures)
                                .font(Theme.rounded(13, weight: .semibold))
                                .foregroundStyle(Theme.purple)
                        }
                        .frame(minWidth: 64, minHeight: 64)
                    }
                    .buttonStyle(SquishyButtonStyle())
                }
                .padding(.horizontal, 24)
            }
            .padding(.top, 8)
        }
        .navigationBarBackButtonHidden(true)
        .sheet(isPresented: $showTreasures) { TreasuresView() }
        .sheet(isPresented: $showParentGate, onDismiss: {
            // Present the settings only after the gate sheet has fully
            // dismissed — toggling both in the same tick drops the second sheet.
            if parentUnlocked {
                parentUnlocked = false
                showParentSettings = true
            }
        }) {
            PinGateView {
                parentUnlocked = true
                showParentGate = false
            }
        }
        .sheet(isPresented: $showParentSettings) { ParentSettingsView() }
    }

    private func toggle(_ op: MathOperation) {
        if session.config.operations.contains(op) {
            session.config.operations.remove(op)
        } else {
            session.config.operations.insert(op)
        }
    }

    private func toggleRandom() {
        session.config.operations = allSelected ? [] : Set(MathOperation.allCases)
    }

    /// Curriculum defaults: 100 for +/−, 30 when only ×/÷ is selected
    /// (matches the level right after grade 2).
    private func suggestRangeDefault() {
        guard !session.userPickedRange else { return }
        let ops = session.config.operations
        let onlyMulDiv = !ops.isEmpty && ops.isSubset(of: [.multiplication, .division])
        session.config.range = onlyMulDiv ? .r30 : .r100
    }
}

// MARK: - Screen 2: number range

struct RangeSelectView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.l10n) private var t
    let onNext: () -> Void

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            VStack(spacing: 18) {
                Text(t.whatRange)
                    .font(Theme.rounded(32))
                    .multilineTextAlignment(.center)
                    .foregroundStyle(Theme.purple)
                    .padding(.top, 12)

                ForEach(NumberRange.allCases) { range in
                    SelectableTile(
                        isSelected: session.config.range == range,
                        color: Theme.skyBlue,
                        action: {
                            session.config.range = range
                            session.userPickedRange = true
                        }
                    ) {
                        Text("\(range.rawValue)")
                            .font(Theme.rounded(40))
                            .foregroundStyle(Theme.purple)
                    }
                    .padding(.horizontal, 40)
                }

                Spacer()
                BigActionButton(title: t.next, action: onNext)
                    .padding(.bottom, 12)
            }
        }
    }
}

// MARK: - Screen 3: difficulty

struct DifficultySelectView: View {
    @Environment(SessionStore.self) private var session
    @Environment(\.l10n) private var t
    let onNext: () -> Void

    private let colors: [Difficulty: Color] = [
        .easy: Theme.mint, .medium: Theme.skyBlue, .hard: Theme.coral, .genius: Theme.purple,
    ]

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            VStack(spacing: 14) {
                Text(t.chooseLevel)
                    .font(Theme.rounded(32))
                    .foregroundStyle(Theme.purple)
                    .padding(.top, 12)

                ForEach(Difficulty.allCases) { level in
                    SelectableTile(
                        isSelected: session.config.difficulty == level,
                        color: colors[level]!,
                        action: { session.config.difficulty = level }
                    ) {
                        VStack(spacing: 4) {
                            HStack(spacing: 10) {
                                Text(level.emoji).font(.system(size: 34))
                                Text(t.difficultyName(level))
                                    .font(Theme.rounded(26))
                                    .foregroundStyle(Theme.purple)
                            }
                            Text(t.difficultyHint(level))
                                .font(Theme.rounded(14, weight: .medium))
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal, 8)
                    }
                    .padding(.horizontal, 32)
                }

                Spacer()
                BigActionButton(title: t.pick("Zaczynamy! 🚀", "Let's start! 🚀"), color: Theme.mint, action: onNext)
                    .padding(.bottom, 12)
            }
        }
    }
}

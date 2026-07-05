import SwiftUI
import SwiftData

/// Full-screen milestone celebration (every 5 correct answers).
/// Escalates with each successive milestone in the session: longer fanfare,
/// more confetti, more characters, more motion (tiers 1–5).
struct CelebrationView: View {
    @Environment(AppState.self) private var app
    @Environment(\.modelContext) private var context
    @Environment(\.l10n) private var t

    let milestoneNumber: Int
    let onDone: () -> Void

    @State private var confettiBurst = 0
    @State private var coinCollected = false
    @State private var coinFlying = false
    @State private var unlockedTrophy: Trophy?
    @State private var showTrophyStage = false

    private var tier: Int { MilestoneEngine.tier(milestoneNumber: milestoneNumber) }

    private var characters: [CharacterKind] {
        let pool = CharacterKind.pool(for: app.celebrationTheme)
        // Deterministic rotation so each milestone brings someone new.
        return (0..<min(tier, 5)).map { pool[(milestoneNumber + $0) % pool.count] }
    }

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()

            // Tap anywhere continues.
            Color.clear
                .contentShape(Rectangle())
                .onTapGesture { finish() }

            VStack(spacing: 18) {
                Spacer()

                Text(PraiseBank.milestoneHeadline(
                    milestoneNumber: milestoneNumber, language: app.language, name: app.childName))
                    .font(Theme.rounded(tier >= 3 ? 40 : 34, weight: .heavy))
                    .foregroundStyle(Theme.purple)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                charactersRow

                Spacer()

                if !coinCollected {
                    collectCoinButton
                } else {
                    BigActionButton(title: t.onward, color: Theme.skyBlue) { finish() }
                }
                Spacer(minLength: 30)
            }

            ConfettiView(burst: confettiBurst, intensity: 30 + tier * 25)
                .ignoresSafeArea()

            if tier >= 2 {
                FloatingHeartsView(count: tier * 3)
                    .ignoresSafeArea()
            }

            if showTrophyStage, let trophy = unlockedTrophy {
                TrophyUnlockedView(trophy: trophy) {
                    finishNow()
                }
                .transition(.scale.combined(with: .opacity))
            }
        }
        .onAppear {
            SoundSynth.shared.playFanfare(tier: tier)
            Haptics.celebration(tier: tier)
            confettiBurst += 1
        }
    }

    // MARK: Characters

    private var charactersRow: some View {
        let sizes: [CGFloat] = tier >= 4 ? [110, 150, 110, 90, 90] : [130, 160, 130, 100, 100]
        return ZStack {
            ForEach(Array(characters.enumerated()), id: \.offset) { i, kind in
                CuteCharacterView(kind: kind,
                                  size: sizes[min(i, sizes.count - 1)],
                                  animationDelay: Double(i) * 0.18)
                    .offset(x: characterOffset(i), y: i.isMultiple(of: 2) ? 0 : -30)
            }
        }
        .frame(height: 230)
    }

    private func characterOffset(_ index: Int) -> CGFloat {
        let spread: [CGFloat] = [0, -110, 110, -60, 60]
        return spread[min(index, spread.count - 1)]
    }

    // MARK: Coin collection

    private var collectCoinButton: some View {
        Button {
            collectCoin()
        } label: {
            HStack(spacing: 10) {
                CoinView(size: 40)
                    .scaleEffect(coinFlying ? 2.2 : 1)
                    .offset(y: coinFlying ? -240 : 0)
                    .opacity(coinFlying ? 0 : 1)
                Text(t.collectCoin)
                    .font(Theme.rounded(24))
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 26)
            .padding(.vertical, 18)
            .background(
                Capsule()
                    .fill(LinearGradient(colors: [Theme.gold, Theme.sunny],
                                         startPoint: .top, endPoint: .bottom))
                    .shadow(color: Theme.gold.opacity(0.7), radius: 12, y: 4)
            )
            .overlay(
                Capsule().stroke(.white.opacity(0.7), lineWidth: 2)
            )
        }
        .buttonStyle(SquishyButtonStyle())
    }

    private func collectCoin() {
        guard !coinCollected else { return }
        SoundSynth.shared.playCoin()
        Haptics.coin()
        withAnimation(.easeIn(duration: 0.55)) { coinFlying = true }
        awardCoin()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.55) {
            withAnimation { coinCollected = true }
            if unlockedTrophy != nil {
                SoundSynth.shared.playTrophy()
                Haptics.celebration(tier: 5)
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                    showTrophyStage = true
                }
            }
        }
    }

    private func awardCoin() {
        app.coins += 1
        unlockedTrophy = TrophyLadder.unlocked(atCoins: app.coins)
        try? context.save()
    }

    /// Leaving without tapping the coin still banks it — no child should
    /// ever lose a coin she earned.
    private func finish() {
        if !coinCollected && !coinFlying {
            awardCoin()
        }
        if unlockedTrophy != nil && !showTrophyStage {
            SoundSynth.shared.playTrophy()
            withAnimation { showTrophyStage = true }
            return
        }
        finishNow()
    }

    private func finishNow() {
        onDone()
    }
}

// MARK: - Trophy unlocked mini-celebration

struct TrophyUnlockedView: View {
    @Environment(\.l10n) private var t
    @Environment(AppState.self) private var app
    let trophy: Trophy
    let onDone: () -> Void

    @State private var appeared = false

    var body: some View {
        ZStack {
            Color.black.opacity(0.45).ignoresSafeArea()
            VStack(spacing: 18) {
                Text(t.newTrophy)
                    .font(Theme.rounded(32))
                    .foregroundStyle(.white)
                TrophyEmblemView(trophy: trophy, size: 130)
                    .scaleEffect(appeared ? 1 : 0.2)
                    .rotationEffect(.degrees(appeared ? 0 : -30))
                Text(app.language == .pl ? trophy.namePL : trophy.nameEN)
                    .font(Theme.rounded(26))
                    .foregroundStyle(Theme.sunny)
                    .multilineTextAlignment(.center)
                BigActionButton(title: t.onward, color: Theme.mint) { onDone() }
            }
            .padding(28)
            .background(RoundedRectangle(cornerRadius: 32).fill(Theme.purple.opacity(0.95)))
            .padding(24)
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.55).delay(0.1)) { appeared = true }
        }
    }
}

/// A trophy drawn as its base emoji plus a small decorative badge.
struct TrophyEmblemView: View {
    let trophy: Trophy
    var size: CGFloat = 64
    var silhouette = false

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Text(trophy.base)
                .font(.system(size: size))
            Text(trophy.badge)
                .font(.system(size: size * 0.42))
                .offset(x: size * 0.14, y: -size * 0.10)
        }
        .saturation(silhouette ? 0 : 1)
        .opacity(silhouette ? 0.25 : 1)
        .shadow(color: silhouette ? .clear : Theme.gold.opacity(0.5), radius: size * 0.1)
    }
}

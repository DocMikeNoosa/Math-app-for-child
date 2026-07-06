import SwiftUI
import SwiftData

/// "Moje skarby" — the child's own gallery, reachable WITHOUT a PIN.
/// Coins, trophy shelves (earned ones gleaming, future ones as mysterious
/// silhouettes), best streaks, badges, and the one cosmetic setting the
/// child may change herself: the celebration theme.
struct TreasuresView: View {
    @Environment(AppState.self) private var app
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Environment(\.l10n) private var t
    @Query private var attempts: [AttemptRecord]

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()
                ScrollView {
                    VStack(spacing: 26) {
                        header
                        coinsCard
                        trophyShelves
                        streakCard
                        badgesSection
                        themePicker
                    }
                    .padding()
                }
            }
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(t.done) { dismiss() }
                        .font(Theme.rounded(18))
                }
            }
        }
    }

    private var header: some View {
        VStack(spacing: 4) {
            Text("🧰✨")
                .font(.system(size: 52))
            Text(t.myTreasures)
                .font(Theme.rounded(34))
                .foregroundStyle(Theme.purple)
        }
    }

    // MARK: Coins

    private var coinsCard: some View {
        VStack(spacing: 10) {
            HStack(spacing: -14) {
                ForEach(0..<min(max(app.coins, 1), 7), id: \.self) { i in
                    CoinView(size: 44)
                        .zIndex(Double(-i))
                }
            }
            Text("\(app.coins)")
                .font(Theme.rounded(52, weight: .heavy))
                .foregroundStyle(Color(red: 0.72, green: 0.48, blue: 0.05))
            Text(t.coins)
                .font(Theme.rounded(19))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 18)
        .background(RoundedRectangle(cornerRadius: 26).fill(Theme.softYellow.opacity(0.9)))
    }

    // MARK: Trophies

    private var trophyShelves: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🏆 " + t.trophies)
                .font(Theme.rounded(24))
                .foregroundStyle(Theme.purple)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 18) {
                ForEach(TrophyLadder.all) { trophy in
                    let earned = app.coins >= trophy.coins
                    VStack(spacing: 6) {
                        TrophyEmblemView(trophy: trophy, size: 54, silhouette: !earned)
                            .overlay {
                                if !earned {
                                    Text("?")
                                        .font(Theme.rounded(30, weight: .heavy))
                                        .foregroundStyle(Theme.purple.opacity(0.5))
                                }
                            }
                        Text(earned
                             ? (app.language == .pl ? trophy.namePL : trophy.nameEN)
                             : "🪙 \(trophy.coins)")
                            .font(Theme.rounded(13, weight: .semibold))
                            .foregroundStyle(earned ? Theme.purple : .secondary)
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                        // Shelf
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color(red: 0.75, green: 0.56, blue: 0.35))
                            .frame(height: 6)
                    }
                }
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 26).fill(.white.opacity(0.75)))
    }

    // MARK: Streaks

    private var streakCard: some View {
        HStack(spacing: 20) {
            VStack(spacing: 4) {
                Text("🔥")
                    .font(.system(size: 36))
                Text("\(app.bestStreak)")
                    .font(Theme.rounded(34, weight: .heavy))
                    .foregroundStyle(Theme.coral)
                Text(t.bestStreak)
                    .font(Theme.rounded(14, weight: .semibold))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
            VStack(spacing: 4) {
                Text("🚀")
                    .font(.system(size: 36))
                Text("\(app.bestSessionCount)")
                    .font(Theme.rounded(34, weight: .heavy))
                    .foregroundStyle(Theme.skyBlue)
                Text(t.pick("Rekord jednej sesji", "One-session record"))
                    .font(Theme.rounded(14, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 26).fill(.white.opacity(0.75)))
    }

    // MARK: Badges

    private var badgesSection: some View {
        let badges = BadgeEngine.badges(
            attempts: attempts.map(\.asData), coins: app.coins, bestStreak: app.bestStreak)
        return VStack(alignment: .leading, spacing: 12) {
            Text("🎖️ " + t.badges)
                .font(Theme.rounded(24))
                .foregroundStyle(Theme.purple)
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                ForEach(badges) { badge in
                    HStack(spacing: 10) {
                        Text(badge.emoji)
                            .font(.system(size: 30))
                            .saturation(badge.earned ? 1 : 0)
                            .opacity(badge.earned ? 1 : 0.35)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(app.language == .pl ? badge.namePL : badge.nameEN)
                                .font(Theme.rounded(15))
                                .foregroundStyle(badge.earned ? Theme.purple : .secondary)
                            Text(app.language == .pl ? badge.descPL : badge.descEN)
                                .font(Theme.rounded(11, weight: .medium))
                                .foregroundStyle(.secondary)
                        }
                        Spacer(minLength: 0)
                    }
                    .padding(10)
                    .background(
                        RoundedRectangle(cornerRadius: 16)
                            .fill(badge.earned ? Theme.softMint.opacity(0.9) : .white.opacity(0.55))
                    )
                }
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 26).fill(.white.opacity(0.75)))
    }

    // MARK: Celebration theme (the only child-changeable setting)

    private var themePicker: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🎨 " + t.favoriteTheme)
                .font(Theme.rounded(20))
                .foregroundStyle(Theme.purple)
            HStack(spacing: 10) {
                themeButton(.unicorns, emoji: "🦄")
                themeButton(.puppies, emoji: "🐶")
                themeButton(.kittens, emoji: "🐱")
                themeButton(.mixed, emoji: "🌈")
            }
        }
        .padding()
        .background(RoundedRectangle(cornerRadius: 26).fill(.white.opacity(0.75)))
    }

    private func themeButton(_ theme: CelebrationTheme, emoji: String) -> some View {
        let selected = app.celebrationTheme == theme
        return Button {
            Haptics.keyTap()
            app.celebrationTheme = theme
            try? context.save()
        } label: {
            VStack(spacing: 4) {
                Text(emoji).font(.system(size: 32))
                Text(themeName(theme))
                    .font(Theme.rounded(12, weight: .semibold))
                    .foregroundStyle(Theme.purple)
            }
            .frame(maxWidth: .infinity, minHeight: 64)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(selected ? Theme.softPurple : .white.opacity(0.6))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(selected ? Theme.purple : .clear, lineWidth: 3)
            )
        }
        .buttonStyle(SquishyButtonStyle())
    }

    private func themeName(_ theme: CelebrationTheme) -> String {
        switch theme {
        case .unicorns: return t.pick("Jednorożce", "Unicorns")
        case .puppies: return t.pick("Pieski", "Puppies")
        case .kittens: return t.pick("Kotki", "Kittens")
        case .mixed: return t.pick("Wszystko!", "Everything!")
        }
    }
}

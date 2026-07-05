import SwiftUI

/// Bright, warm, child-friendly palette and shared styles.
/// Nothing here flashes or strobes.
enum Theme {
    static let pink = Color(red: 1.00, green: 0.42, blue: 0.61)
    static let softPink = Color(red: 1.00, green: 0.85, blue: 0.90)
    static let purple = Color(red: 0.62, green: 0.44, blue: 0.90)
    static let softPurple = Color(red: 0.90, green: 0.85, blue: 1.00)
    static let skyBlue = Color(red: 0.45, green: 0.75, blue: 0.98)
    static let softBlue = Color(red: 0.85, green: 0.93, blue: 1.00)
    static let sunny = Color(red: 1.00, green: 0.78, blue: 0.25)
    static let softYellow = Color(red: 1.00, green: 0.95, blue: 0.78)
    static let mint = Color(red: 0.35, green: 0.80, blue: 0.60)
    static let softMint = Color(red: 0.82, green: 0.97, blue: 0.89)
    static let coral = Color(red: 1.00, green: 0.55, blue: 0.40)
    static let gold = Color(red: 1.00, green: 0.72, blue: 0.10)

    static let background = LinearGradient(
        colors: [softPink, softPurple, softBlue],
        startPoint: .top, endPoint: .bottom
    )

    static func rounded(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
}

/// Squishy press animation for every big button in the app.
struct SquishyButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.spring(response: 0.25, dampingFraction: 0.5), value: configuration.isPressed)
    }
}

/// Large colorful capsule button (primary actions like "Dalej →").
struct BigActionButton: View {
    let title: String
    var color: Color = Theme.pink
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button {
            Haptics.keyTap()
            action()
        } label: {
            Text(title)
                .font(Theme.rounded(26))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 64)
                .background(
                    Capsule().fill(enabled ? color : Color.gray.opacity(0.4))
                        .shadow(color: (enabled ? color : .gray).opacity(0.45), radius: 8, y: 4)
                )
        }
        .buttonStyle(SquishyButtonStyle())
        .disabled(!enabled)
        .padding(.horizontal, 24)
    }
}

/// A big selectable tile with a glowing border + checkmark when selected.
struct SelectableTile<Content: View>: View {
    var isSelected: Bool
    var color: Color
    var action: () -> Void
    @ViewBuilder var content: Content

    var body: some View {
        Button {
            Haptics.keyTap()
            action()
        } label: {
            ZStack(alignment: .topTrailing) {
                content
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 20)
                    .background(
                        RoundedRectangle(cornerRadius: 24)
                            .fill(color.opacity(isSelected ? 0.35 : 0.18))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(isSelected ? color : .clear, lineWidth: 4)
                            .shadow(color: isSelected ? color.opacity(0.8) : .clear, radius: 8)
                    )
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 28))
                        .foregroundStyle(.white, color)
                        .padding(10)
                        .transition(.scale)
                }
            }
        }
        .buttonStyle(SquishyButtonStyle())
        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isSelected)
    }
}

/// Simple original vector coin drawn with shapes (no assets).
struct CoinView: View {
    var size: CGFloat = 32

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(colors: [Color(red: 1, green: 0.9, blue: 0.4), Theme.gold],
                                   center: .topLeading, startRadius: 0, endRadius: size)
                )
            Circle()
                .stroke(Color(red: 0.85, green: 0.58, blue: 0.05), lineWidth: size * 0.08)
                .padding(size * 0.04)
            Text("★")
                .font(Theme.rounded(size * 0.5))
                .foregroundStyle(Color(red: 0.85, green: 0.58, blue: 0.05))
        }
        .frame(width: size, height: size)
        .shadow(color: Theme.gold.opacity(0.5), radius: size * 0.12, y: 2)
    }
}

/// Persistent coin counter widget (corner of the practice screen).
struct CoinCounterView: View {
    var coins: Int

    var body: some View {
        HStack(spacing: 6) {
            CoinView(size: 28)
            Text("\(coins)")
                .font(Theme.rounded(22))
                .foregroundStyle(Color(red: 0.55, green: 0.35, blue: 0.05))
                .contentTransition(.numericText())
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Capsule().fill(.white.opacity(0.75)))
        .accessibilityLabel("\(coins)")
    }
}

/// The five progress stars for the current 5-problem streak.
struct StreakStarsView: View {
    /// 0…5 filled stars.
    var filled: Int

    var body: some View {
        HStack(spacing: 6) {
            ForEach(0..<5, id: \.self) { i in
                Image(systemName: i < filled ? "star.fill" : "star")
                    .font(.system(size: 22))
                    .foregroundStyle(i < filled ? Theme.gold : .gray.opacity(0.45))
                    .scaleEffect(i == filled - 1 ? 1.15 : 1.0)
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.5), value: filled)
        .accessibilityLabel("\(filled)/5 ⭐")
    }
}

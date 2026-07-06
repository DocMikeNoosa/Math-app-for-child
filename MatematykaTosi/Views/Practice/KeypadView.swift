import SwiftUI

enum KeypadKey: Equatable {
    case digit(Int)
    case backspace
    case confirm
}

/// Large calculator-style keypad: digits 0–9, backspace and a big green
/// confirm button. All touch targets ≥ 64 pt, with haptics on every press.
struct KeypadView: View {
    @Environment(\.l10n) private var t
    let onKey: (KeypadKey) -> Void

    var body: some View {
        VStack(spacing: 10) {
            keyRow([.digit(7), .digit(8), .digit(9)])
            keyRow([.digit(4), .digit(5), .digit(6)])
            keyRow([.digit(1), .digit(2), .digit(3)])
            keyRow([.backspace, .digit(0), .confirm])
        }
        .padding(.horizontal, 16)
    }

    private func keyRow(_ keys: [KeypadKey]) -> some View {
        HStack(spacing: 10) {
            ForEach(0..<3) { i in
                keyButton(keys[i])
            }
        }
    }

    @ViewBuilder
    private func keyButton(_ key: KeypadKey) -> some View {
        Button {
            Haptics.keyTap()
            onKey(key)
        } label: {
            keyLabel(key)
                .frame(maxWidth: .infinity)
                .frame(minHeight: 64)
                .background(keyBackground(key))
        }
        .buttonStyle(SquishyButtonStyle())
        .accessibilityLabel(accessibilityText(key))
    }

    @ViewBuilder
    private func keyLabel(_ key: KeypadKey) -> some View {
        switch key {
        case .digit(let d):
            Text("\(d)")
                .font(Theme.rounded(34))
                .foregroundStyle(Theme.purple)
        case .backspace:
            Image(systemName: "delete.left.fill")
                .font(.system(size: 26, weight: .bold))
                .foregroundStyle(Theme.coral)
        case .confirm:
            HStack(spacing: 6) {
                Image(systemName: "checkmark")
                    .font(.system(size: 24, weight: .heavy))
                Text(t.check)
                    .font(Theme.rounded(18))
            }
            .foregroundStyle(.white)
        }
    }

    private func keyBackground(_ key: KeypadKey) -> some View {
        RoundedRectangle(cornerRadius: 18)
            .fill(backgroundColor(key))
            .shadow(color: .black.opacity(0.08), radius: 3, y: 2)
    }

    private func backgroundColor(_ key: KeypadKey) -> Color {
        switch key {
        case .digit: return .white.opacity(0.9)
        case .backspace: return Theme.softYellow
        case .confirm: return Theme.mint
        }
    }

    private func accessibilityText(_ key: KeypadKey) -> String {
        switch key {
        case .digit(let d): return "\(d)"
        case .backspace: return "⌫"
        case .confirm: return t.check
        }
    }
}

import SwiftUI

enum PinKey: Equatable {
    case digit(Int)
    case backspace
}

/// Filled/empty dots showing PIN entry progress.
struct PinDotsView: View {
    var count: Int

    var body: some View {
        HStack(spacing: 18) {
            ForEach(0..<4, id: \.self) { i in
                Circle()
                    .fill(i < count ? Theme.purple : Color.gray.opacity(0.3))
                    .frame(width: 20, height: 20)
            }
        }
        .animation(.spring(response: 0.25, dampingFraction: 0.6), value: count)
    }
}

/// Simple digit pad for PIN entry (parent-facing, so more compact than the
/// child keypad).
struct PinPadView: View {
    let onKey: (PinKey) -> Void

    private let rows: [[String]] = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["", "0", "⌫"]]

    var body: some View {
        VStack(spacing: 12) {
            ForEach(rows, id: \.self) { row in
                HStack(spacing: 12) {
                    ForEach(row, id: \.self) { key in
                        if key.isEmpty {
                            Color.clear.frame(width: 78, height: 60)
                        } else {
                            Button {
                                Haptics.keyTap()
                                if key == "⌫" {
                                    onKey(.backspace)
                                } else {
                                    onKey(.digit(Int(key)!))
                                }
                            } label: {
                                Text(key)
                                    .font(Theme.rounded(28, weight: .semibold))
                                    .foregroundStyle(Theme.purple)
                                    .frame(width: 78, height: 60)
                                    .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.85)))
                            }
                            .buttonStyle(SquishyButtonStyle())
                        }
                    }
                }
            }
        }
    }
}

/// PIN prompt protecting the parent zone, with a discreet recovery path via
/// the security question set during onboarding.
struct PinGateView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.l10n) private var t
    let onSuccess: () -> Void

    @State private var pin = ""
    @State private var wrong = false
    @State private var showRecovery = false
    @State private var recoveryAnswer = ""
    @State private var recoveryFailed = false
    @State private var settingNewPin = false
    @State private var newPin = ""
    @State private var newPinConfirm = ""
    @State private var newPinMismatch = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()
                if settingNewPin {
                    newPinView
                } else if showRecovery {
                    recoveryView
                } else {
                    entryView
                }
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(t.cancel) { dismiss() }
                }
            }
        }
    }

    // MARK: Normal entry

    private var entryView: some View {
        VStack(spacing: 22) {
            Text("⚙️").font(.system(size: 48))
            Text(t.enterPin)
                .font(Theme.rounded(26))
                .foregroundStyle(Theme.purple)
            PinDotsView(count: pin.count)
                .modifier(ShakeEffect(shakes: wrong ? 2 : 0))
            if wrong {
                Text(t.wrongPin)
                    .font(Theme.rounded(16, weight: .semibold))
                    .foregroundStyle(Theme.coral)
            }
            PinPadView { key in
                wrong = false
                switch key {
                case .digit(let d):
                    guard pin.count < 4 else { return }
                    pin.append(String(d))
                    if pin.count == 4 { verify() }
                case .backspace:
                    if !pin.isEmpty { pin.removeLast() }
                }
            }
            Button(t.forgotPin) {
                showRecovery = true
            }
            .font(Theme.rounded(16, weight: .medium))
            .foregroundStyle(.secondary)
        }
        .padding()
    }

    private func verify() {
        if PinStore.verify(pin: pin) {
            Haptics.success()
            onSuccess()
        } else {
            Haptics.gentleWarning()
            pin = ""
            withAnimation { wrong = true }
        }
    }

    // MARK: Recovery

    private var recoveryView: some View {
        VStack(spacing: 20) {
            Text("🛟").font(.system(size: 48))
            Text(PinStore.recoveryQuestion ?? t.pick("Brak pytania pomocniczego", "No security question set"))
                .font(Theme.rounded(22))
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.purple)
            TextField(t.pick("Odpowiedź", "Answer"), text: $recoveryAnswer)
                .font(Theme.rounded(19, weight: .medium))
                .autocorrectionDisabled()
                .padding()
                .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.85)))
            if recoveryFailed {
                Text(t.pick("To nie ta odpowiedź", "That's not the right answer"))
                    .font(Theme.rounded(16, weight: .semibold))
                    .foregroundStyle(Theme.coral)
            }
            BigActionButton(title: t.check, color: Theme.skyBlue,
                            enabled: !recoveryAnswer.trimmingCharacters(in: .whitespaces).isEmpty) {
                if PinStore.verifyRecovery(answer: recoveryAnswer) {
                    settingNewPin = true
                } else {
                    Haptics.gentleWarning()
                    recoveryFailed = true
                }
            }
        }
        .padding()
    }

    // MARK: New PIN after successful recovery

    private var newPinView: some View {
        VStack(spacing: 20) {
            Text("🔐").font(.system(size: 48))
            Text(newPin.count < 4
                 ? t.pick("Ustaw nowy kod", "Set a new code")
                 : t.pick("Powtórz nowy kod", "Repeat the new code"))
                .font(Theme.rounded(24))
                .foregroundStyle(Theme.purple)
            PinDotsView(count: newPin.count < 4 ? newPin.count : newPinConfirm.count)
                .modifier(ShakeEffect(shakes: newPinMismatch ? 2 : 0))
            PinPadView { key in
                newPinMismatch = false
                switch key {
                case .digit(let d):
                    if newPin.count < 4 {
                        newPin.append(String(d))
                    } else if newPinConfirm.count < 4 {
                        newPinConfirm.append(String(d))
                        if newPinConfirm.count == 4 { finishNewPin() }
                    }
                case .backspace:
                    if !newPinConfirm.isEmpty {
                        newPinConfirm.removeLast()
                    } else if !newPin.isEmpty {
                        newPin.removeLast()
                    }
                }
            }
        }
        .padding()
    }

    private func finishNewPin() {
        if newPin == newPinConfirm {
            PinStore.setPin(newPin)
            Haptics.success()
            onSuccess()
        } else {
            Haptics.gentleWarning()
            newPin = ""
            newPinConfirm = ""
            withAnimation { newPinMismatch = true }
        }
    }
}

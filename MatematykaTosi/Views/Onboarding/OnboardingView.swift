import SwiftUI
import SwiftData

/// One-time parent setup on first launch: parent PIN (entered twice),
/// PIN-recovery security question, child's name and default language.
struct OnboardingView: View {
    @Environment(AppState.self) private var app
    @Environment(\.modelContext) private var context
    @Environment(\.l10n) private var t

    private enum Step { case welcome, pin, pinConfirm, recovery }
    @State private var step: Step = .welcome

    @State private var name = ""
    @State private var pin = ""
    @State private var pinConfirm = ""
    @State private var pinMismatch = false
    @State private var question = ""
    @State private var answer = ""

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            VStack(spacing: 24) {
                switch step {
                case .welcome: welcome
                case .pin: pinEntry(title: t.pick("Ustaw 4-cyfrowy kod rodzica", "Set a 4-digit parent code"),
                                    value: $pin)
                case .pinConfirm: pinEntry(title: t.pick("Powtórz kod, aby potwierdzić", "Repeat the code to confirm"),
                                           value: $pinConfirm)
                case .recovery: recovery
                }
            }
            .padding()
        }
        .onAppear { name = app.childName }
    }

    // MARK: Step 1 — welcome, name, language

    private var welcome: some View {
        VStack(spacing: 22) {
            Text("🧮✨")
                .font(.system(size: 64))
            Text(t.pick("Witaj! Zanim zaczniemy — ustaw kod rodzica.",
                        "Welcome! Before we begin — set your parent code."))
                .font(Theme.rounded(28))
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.purple)

            VStack(alignment: .leading, spacing: 8) {
                Text(t.pick("Imię dziecka", "Child's name"))
                    .font(Theme.rounded(17, weight: .semibold))
                    .foregroundStyle(.secondary)
                TextField("Tosia", text: $name)
                    .font(Theme.rounded(24))
                    .padding()
                    .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.8)))
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(t.language)
                    .font(Theme.rounded(17, weight: .semibold))
                    .foregroundStyle(.secondary)
                Picker(t.language, selection: languageBinding) {
                    ForEach(AppLanguage.allCases) { lang in
                        Text(lang.displayName).tag(lang)
                    }
                }
                .pickerStyle(.segmented)
            }

            BigActionButton(title: t.next, enabled: !name.trimmingCharacters(in: .whitespaces).isEmpty) {
                app.childName = name.trimmingCharacters(in: .whitespaces)
                try? context.save()
                step = .pin
            }
        }
    }

    private var languageBinding: Binding<AppLanguage> {
        Binding(get: { app.language }, set: { app.language = $0; try? context.save() })
    }

    // MARK: Steps 2–3 — PIN twice

    private func pinEntry(title: String, value: Binding<String>) -> some View {
        VStack(spacing: 24) {
            Text("🔐")
                .font(.system(size: 56))
            Text(title)
                .font(Theme.rounded(26))
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.purple)
            PinDotsView(count: value.wrappedValue.count)
                .modifier(ShakeEffect(shakes: pinMismatch ? 2 : 0))
            if pinMismatch {
                Text(t.pick("Kody się różnią — spróbuj jeszcze raz", "The codes don't match — try again"))
                    .font(Theme.rounded(16, weight: .semibold))
                    .foregroundStyle(Theme.coral)
            }
            PinPadView { key in
                handlePinKey(key, value: value)
            }
        }
    }

    private func handlePinKey(_ key: PinKey, value: Binding<String>) {
        pinMismatch = false
        switch key {
        case .digit(let d):
            guard value.wrappedValue.count < 4 else { return }
            value.wrappedValue.append(String(d))
            if value.wrappedValue.count == 4 { advanceAfterPin() }
        case .backspace:
            if !value.wrappedValue.isEmpty { value.wrappedValue.removeLast() }
        }
    }

    private func advanceAfterPin() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
            if step == .pin {
                step = .pinConfirm
            } else if step == .pinConfirm {
                if pin == pinConfirm {
                    step = .recovery
                } else {
                    Haptics.gentleWarning()
                    pin = ""
                    pinConfirm = ""
                    withAnimation { pinMismatch = true }
                    step = .pin
                }
            }
        }
    }

    // MARK: Step 4 — recovery question

    private var recovery: some View {
        VStack(spacing: 20) {
            Text("🛟")
                .font(.system(size: 56))
            Text(t.pick("Pytanie pomocnicze (gdybyś zapomniał/a kodu)",
                        "Security question (in case you forget the code)"))
                .font(Theme.rounded(24))
                .multilineTextAlignment(.center)
                .foregroundStyle(Theme.purple)

            TextField(t.pick("np. Jak miał na imię mój pierwszy pupil?",
                             "e.g. What was my first pet's name?"),
                      text: $question, axis: .vertical)
                .font(Theme.rounded(19, weight: .medium))
                .padding()
                .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.8)))

            TextField(t.pick("Odpowiedź", "Answer"), text: $answer)
                .font(Theme.rounded(19, weight: .medium))
                .autocorrectionDisabled()
                .padding()
                .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.8)))

            BigActionButton(
                title: t.pick("Zaczynamy! 🎉", "Let's go! 🎉"),
                color: Theme.mint,
                enabled: !question.trimmingCharacters(in: .whitespaces).isEmpty
                    && !answer.trimmingCharacters(in: .whitespaces).isEmpty
            ) {
                PinStore.setPin(pin)
                PinStore.setRecovery(question: question, answer: answer)
                app.hasOnboarded = true
                try? context.save()
            }
        }
    }
}

/// Little horizontal shake for wrong PIN entries.
struct ShakeEffect: GeometryEffect {
    var shakes: CGFloat
    var animatableData: CGFloat {
        get { shakes }
        set { shakes = newValue }
    }
    func effectValue(size: CGSize) -> ProjectionTransform {
        ProjectionTransform(CGAffineTransform(translationX: 8 * sin(shakes * .pi * 4), y: 0))
    }
}

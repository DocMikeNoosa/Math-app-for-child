import SwiftUI
import SwiftData

/// PIN-protected parent settings: session configuration, language,
/// statistics, time limit, certificates, PIN/name/sound/reset.
struct ParentSettingsView: View {
    @Environment(AppState.self) private var app
    @Environment(SessionStore.self) private var session
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @Environment(\.l10n) private var t

    @State private var showChangePin = false
    @State private var resetStep1 = false
    @State private var resetStep2 = false
    @State private var customLimit = 20

    var body: some View {
        @Bindable var app = app
        @Bindable var session = session

        NavigationStack {
            Form {
                // MARK: Session configuration (also mid-session)
                Section(t.pick("Ustawienia sesji", "Session settings")) {
                    ForEach(MathOperation.allCases) { op in
                        Toggle(isOn: operationBinding(op)) {
                            Label(t.operationName(op), systemImage: iconName(op))
                        }
                    }
                    Picker(t.pick("Zakres liczb", "Number range"), selection: $session.config.range) {
                        ForEach(NumberRange.allCases) { r in
                            Text("\(r.rawValue)").tag(r)
                        }
                    }
                    Picker(t.pick("Poziom", "Level"), selection: $session.config.difficulty) {
                        ForEach(Difficulty.allCases) { d in
                            Text("\(d.emoji) \(t.difficultyName(d))").tag(d)
                        }
                    }
                }

                // MARK: Language
                Section(t.language) {
                    Picker(t.language, selection: $app.language) {
                        ForEach(AppLanguage.allCases) { lang in
                            Text(lang.displayName).tag(lang)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // MARK: Statistics
                Section {
                    NavigationLink {
                        StatisticsView()
                    } label: {
                        Label(t.statistics, systemImage: "chart.xyaxis.line")
                    }
                }

                // MARK: Time limit
                Section(t.timeLimit) {
                    Picker(t.timeLimit, selection: limitBinding) {
                        Text(t.pick("Wyłączony", "Off")).tag(LimitChoice.off)
                        ForEach([15, 30, 45, 60], id: \.self) { minutes in
                            Text("\(minutes) min").tag(LimitChoice.minutes(minutes))
                        }
                        Text(t.pick("Własny", "Custom")).tag(LimitChoice.custom)
                    }
                    if isCustomLimit {
                        Stepper(value: $customLimit, in: 5...180, step: 5) {
                            Text(t.pick("Własny limit: \(customLimit) min", "Custom limit: \(customLimit) min"))
                        }
                        .onChange(of: customLimit) { _, newValue in
                            app.dailyLimitMinutes = newValue
                            try? context.save()
                        }
                    }
                    if app.limitOverrideDate != nil {
                        Button(t.pick("Cofnij dzisiejsze odblokowanie", "Cancel today's override")) {
                            app.limitOverrideDate = nil
                            try? context.save()
                        }
                    }
                }

                // MARK: Certificates
                Section {
                    NavigationLink {
                        CertificateView()
                    } label: {
                        Label(t.certificates, systemImage: "rosette")
                    }
                }

                // MARK: Other
                Section(t.pick("Inne", "Other")) {
                    Button {
                        showChangePin = true
                    } label: {
                        Label(t.pick("Zmień kod rodzica", "Change parent code"), systemImage: "key.fill")
                    }

                    HStack {
                        Text(t.pick("Imię dziecka", "Child's name"))
                        TextField("Tosia", text: $app.childName)
                            .multilineTextAlignment(.trailing)
                    }

                    HStack {
                        Image(systemName: app.soundVolume == 0 ? "speaker.slash.fill" : "speaker.wave.2.fill")
                        Slider(value: $app.soundVolume, in: 0...1)
                            .onChange(of: app.soundVolume) { _, newValue in
                                SoundSynth.shared.volume = newValue
                                try? context.save()
                            }
                    }

                    Button(role: .destructive) {
                        resetStep1 = true
                    } label: {
                        Label(t.pick("Wyzeruj postępy", "Reset progress"), systemImage: "trash")
                    }
                }
            }
            .navigationTitle("⚙️ " + t.parentZone)
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                // Keep the custom stepper in sync with a previously saved
                // custom limit.
                if let minutes = app.dailyLimitMinutes, ![15, 30, 45, 60].contains(minutes) {
                    customLimit = minutes
                }
            }
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(t.done) {
                        try? context.save()
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showChangePin) { ChangePinSheet() }
            .confirmationDialog(
                t.pick("Na pewno wyzerować wszystkie postępy?", "Really reset all progress?"),
                isPresented: $resetStep1, titleVisibility: .visible
            ) {
                Button(t.pick("Tak, wyzeruj", "Yes, reset"), role: .destructive) {
                    resetStep2 = true
                }
            }
            .alert(
                t.pick("To usunie monety, trofea i statystyki. Tej operacji nie można cofnąć!",
                       "This deletes coins, trophies and statistics. This cannot be undone!"),
                isPresented: $resetStep2
            ) {
                Button(t.pick("Usuń wszystko", "Delete everything"), role: .destructive) {
                    resetProgress()
                }
                Button(t.cancel, role: .cancel) {}
            }
        }
    }

    // MARK: Helpers

    private func iconName(_ op: MathOperation) -> String {
        switch op {
        case .addition: return "plus.circle.fill"
        case .subtraction: return "minus.circle.fill"
        case .multiplication: return "multiply.circle.fill"
        case .division: return "divide.circle.fill"
        }
    }

    private func operationBinding(_ op: MathOperation) -> Binding<Bool> {
        Binding(
            get: { session.config.operations.contains(op) },
            set: { on in
                if on {
                    session.config.operations.insert(op)
                } else if session.config.operations.count > 1 {
                    // Always keep at least one operation selected.
                    session.config.operations.remove(op)
                }
            }
        )
    }

    private enum LimitChoice: Hashable {
        case off, minutes(Int), custom
    }

    private var isCustomLimit: Bool {
        guard let minutes = app.dailyLimitMinutes else { return false }
        return ![15, 30, 45, 60].contains(minutes)
    }

    private var limitBinding: Binding<LimitChoice> {
        Binding(
            get: {
                guard let minutes = app.dailyLimitMinutes else { return .off }
                return [15, 30, 45, 60].contains(minutes) ? .minutes(minutes) : .custom
            },
            set: { choice in
                switch choice {
                case .off: app.dailyLimitMinutes = nil
                case .minutes(let m): app.dailyLimitMinutes = m
                case .custom: app.dailyLimitMinutes = customLimit
                }
                try? context.save()
            }
        )
    }

    private func resetProgress() {
        try? context.delete(model: AttemptRecord.self)
        try? context.delete(model: UsageSession.self)
        app.coins = 0
        app.bestStreak = 0
        app.bestSessionCount = 0
        app.lastPraiseIndex = -1
        try? context.save()
    }
}

// MARK: - Change PIN

private struct ChangePinSheet: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.l10n) private var t

    @State private var newPin = ""
    @State private var confirmPin = ""
    @State private var mismatch = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()
                VStack(spacing: 20) {
                    Text("🔐").font(.system(size: 48))
                    Text(newPin.count < 4
                         ? t.pick("Nowy kod rodzica", "New parent code")
                         : t.pick("Powtórz nowy kod", "Repeat the new code"))
                        .font(Theme.rounded(24))
                        .foregroundStyle(Theme.purple)
                    PinDotsView(count: newPin.count < 4 ? newPin.count : confirmPin.count)
                        .modifier(ShakeEffect(shakes: mismatch ? 2 : 0))
                    if mismatch {
                        Text(t.pick("Kody się różnią", "Codes don't match"))
                            .font(Theme.rounded(16, weight: .semibold))
                            .foregroundStyle(Theme.coral)
                    }
                    PinPadView { key in
                        mismatch = false
                        switch key {
                        case .digit(let d):
                            if newPin.count < 4 {
                                newPin.append(String(d))
                            } else if confirmPin.count < 4 {
                                confirmPin.append(String(d))
                                if confirmPin.count == 4 { finish() }
                            }
                        case .backspace:
                            if !confirmPin.isEmpty {
                                confirmPin.removeLast()
                            } else if !newPin.isEmpty {
                                newPin.removeLast()
                            }
                        }
                    }
                }
                .padding()
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(t.cancel) { dismiss() }
                }
            }
        }
    }

    private func finish() {
        if newPin == confirmPin {
            PinStore.setPin(newPin)
            Haptics.success()
            dismiss()
        } else {
            Haptics.gentleWarning()
            newPin = ""
            confirmPin = ""
            withAnimation { mismatch = true }
        }
    }
}

import SwiftUI

/// Kind, cheerful full-screen message when the daily limit is reached —
/// a sleepy character, never abrupt or punishing. The parent can override
/// with the PIN.
struct TimeLimitReachedView: View {
    @Environment(\.l10n) private var t
    let onParentOverride: () -> Void

    @State private var breathing = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Theme.softPurple, Color(red: 0.75, green: 0.78, blue: 0.98)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 26) {
                Spacer()

                ZStack {
                    // Sleepy teddy with a nightcap and drifting Zzz.
                    TeddyFigure()
                        .frame(width: 170, height: 170)
                        .scaleEffect(breathing ? 1.03 : 0.98)
                    Text("💤")
                        .font(.system(size: 34))
                        .offset(x: 78, y: breathing ? -92 : -78)
                        .opacity(breathing ? 1 : 0.4)
                    Text("🌙")
                        .font(.system(size: 40))
                        .offset(x: -95, y: -85)
                }
                .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true), value: breathing)

                Text(t.timeForToday)
                    .font(Theme.rounded(32))
                    .foregroundStyle(Theme.purple)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 28)

                Text("⭐️🌟⭐️")
                    .font(.system(size: 28))

                Spacer()

                Button {
                    onParentOverride()
                } label: {
                    Label(t.pick("Rodzic: odblokuj kodem", "Parent: unlock with code"),
                          systemImage: "lock.open.fill")
                        .font(Theme.rounded(16, weight: .semibold))
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 12)
                        .padding(.horizontal, 20)
                        .background(Capsule().fill(.white.opacity(0.6)))
                }
                .padding(.bottom, 30)
            }
        }
        .onAppear { breathing = true }
    }
}

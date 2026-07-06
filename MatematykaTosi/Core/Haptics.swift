import UIKit

enum Haptics {
    /// Subtle tick for keypad presses.
    static func keyTap() {
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
    }

    static func success() {
        UINotificationFeedbackGenerator().notificationOccurred(.success)
    }

    static func gentleWarning() {
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
    }

    /// Strong celebratory thumps for milestone celebrations; more for higher tiers.
    static func celebration(tier: Int) {
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
        for i in 1...min(max(tier, 1), 5) {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.18) {
                generator.impactOccurred(intensity: 1.0)
            }
        }
    }

    static func coin() {
        UIImpactFeedbackGenerator(style: .rigid).impactOccurred()
    }
}

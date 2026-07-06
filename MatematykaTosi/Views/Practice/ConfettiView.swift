import SwiftUI

/// Lightweight confetti/star burst drawn with Canvas — no assets, no
/// strobing, particles just fall softly under gravity and fade.
struct ConfettiView: View {
    /// Increment to fire a new burst.
    var burst: Int
    /// Roughly how many particles per burst.
    var intensity: Int = 40

    private struct Particle {
        var born: Date
        var origin: CGPoint      // relative 0…1
        var velocity: CGVector   // points/second
        var color: Color
        var size: CGFloat
        var spin: Double
        var isStar: Bool
    }

    @State private var particles: [Particle] = []

    private static let colors: [Color] = [
        Theme.pink, Theme.purple, Theme.skyBlue, Theme.sunny, Theme.mint, Theme.coral, Theme.gold,
    ]

    var body: some View {
        TimelineView(.animation) { timeline in
            Canvas { context, size in
                let now = timeline.date
                for p in particles {
                    let t = now.timeIntervalSince(p.born)
                    guard t >= 0, t < 3.2 else { continue }
                    let x = p.origin.x * size.width + p.velocity.dx * t
                    let y = p.origin.y * size.height + p.velocity.dy * t + 220 * t * t
                    let opacity = max(0, 1.0 - t / 3.0)
                    let rect = CGRect(x: x, y: y, width: p.size, height: p.size * (p.isStar ? 1 : 0.6))
                    var ctx = context
                    ctx.translateBy(x: rect.midX, y: rect.midY)
                    ctx.rotate(by: .radians(p.spin * t))
                    ctx.translateBy(x: -rect.midX, y: -rect.midY)
                    let shape: Path = p.isStar
                        ? Self.starPath(in: rect)
                        : Path(roundedRect: rect, cornerRadius: p.size * 0.2)
                    ctx.fill(shape, with: .color(p.color.opacity(opacity)))
                }
            }
        }
        .allowsHitTesting(false)
        .onChange(of: burst) { _, _ in
            fire()
        }
    }

    private func fire() {
        let now = Date()
        var fresh: [Particle] = []
        for _ in 0..<intensity {
            fresh.append(Particle(
                born: now,
                origin: CGPoint(x: Double.random(in: 0.2...0.8), y: Double.random(in: 0.15...0.35)),
                velocity: CGVector(dx: Double.random(in: -140...140), dy: Double.random(in: -260 ... -60)),
                color: Self.colors.randomElement()!,
                size: CGFloat.random(in: 8...16),
                spin: Double.random(in: -6...6),
                isStar: Bool.random()
            ))
        }
        particles.append(contentsOf: fresh)
        // Keep the array from growing forever.
        particles.removeAll { now.timeIntervalSince($0.born) > 4 }
    }

    static func starPath(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let outer = min(rect.width, rect.height) / 2
        let inner = outer * 0.45
        for i in 0..<10 {
            let angle = Double(i) * .pi / 5 - .pi / 2
            let radius = i.isMultiple(of: 2) ? outer : inner
            let point = CGPoint(x: center.x + cos(angle) * radius, y: center.y + sin(angle) * radius)
            if i == 0 { path.move(to: point) } else { path.addLine(to: point) }
        }
        path.closeSubpath()
        return path
    }
}

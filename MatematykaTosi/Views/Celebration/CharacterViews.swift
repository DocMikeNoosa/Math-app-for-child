import SwiftUI

/// Original animated vector characters built entirely from SwiftUI shapes —
/// no copyrighted characters, no image assets, no network.
enum CharacterKind: String, CaseIterable, Identifiable {
    case unicorn, puppy, kitten, bunny, rainbow, star, dragon, teddy
    var id: String { rawValue }

    /// Characters allowed by the child's chosen celebration theme.
    static func pool(for theme: CelebrationTheme) -> [CharacterKind] {
        switch theme {
        case .unicorns: return [.unicorn, .rainbow, .star]
        case .puppies: return [.puppy, .teddy, .star]
        case .kittens: return [.kitten, .bunny, .star]
        case .mixed: return allCases
        }
    }
}

/// A character with its idle animation (gentle bounce + wiggle — never flashing).
struct CuteCharacterView: View {
    let kind: CharacterKind
    var size: CGFloat = 150
    /// Stagger so groups of characters don't move in lockstep.
    var animationDelay: Double = 0

    @State private var bouncing = false

    var body: some View {
        character
            .frame(width: size, height: size)
            .offset(y: bouncing ? -12 : 6)
            .rotationEffect(.degrees(bouncing ? -4 : 4))
            .animation(
                .easeInOut(duration: 0.9).repeatForever(autoreverses: true).delay(animationDelay),
                value: bouncing
            )
            .onAppear { bouncing = true }
    }

    @ViewBuilder
    private var character: some View {
        switch kind {
        case .unicorn: UnicornFigure()
        case .puppy: PuppyFigure()
        case .kitten: KittenFigure()
        case .bunny: BunnyFigure()
        case .rainbow: RainbowFigure()
        case .star: StarFigure()
        case .dragon: DragonFigure()
        case .teddy: TeddyFigure()
        }
    }
}

// MARK: - Shared face

struct CuteFace: View {
    var scale: CGFloat = 1

    var body: some View {
        VStack(spacing: 6 * scale) {
            HStack(spacing: 26 * scale) {
                eye
                eye
            }
            SmileShape()
                .stroke(Color.black.opacity(0.75), style: StrokeStyle(lineWidth: 3 * scale, lineCap: .round))
                .frame(width: 34 * scale, height: 14 * scale)
        }
        .overlay(alignment: .center) {
            HStack(spacing: 62 * scale) {
                cheek
                cheek
            }
            .offset(y: 8 * scale)
        }
    }

    private var eye: some View {
        ZStack {
            Circle().fill(.black.opacity(0.85)).frame(width: 11 * scale, height: 11 * scale)
            Circle().fill(.white).frame(width: 4 * scale, height: 4 * scale).offset(x: -2 * scale, y: -2 * scale)
        }
    }

    private var cheek: some View {
        Circle().fill(Theme.pink.opacity(0.45)).frame(width: 13 * scale, height: 13 * scale)
    }
}

struct SmileShape: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.minY),
                       control: CGPoint(x: rect.midX, y: rect.maxY + rect.height * 0.6))
        return p
    }
}

private struct EarTriangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.addQuadCurve(to: CGPoint(x: rect.midX, y: rect.minY), control: CGPoint(x: rect.minX, y: rect.minY))
        p.addQuadCurve(to: CGPoint(x: rect.maxX, y: rect.maxY), control: CGPoint(x: rect.maxX, y: rect.minY))
        p.closeSubpath()
        return p
    }
}

// MARK: - Figures (all sized for a 150×150 canvas)

struct UnicornFigure: View {
    var body: some View {
        ZStack {
            // Mane
            ForEach(0..<5, id: \.self) { i in
                Capsule()
                    .fill([Theme.pink, Theme.purple, Theme.skyBlue, Theme.mint, Theme.sunny][i])
                    .frame(width: 16, height: 44)
                    .rotationEffect(.degrees(Double(i - 2) * 22))
                    .offset(x: CGFloat(i - 2) * 16, y: -52)
            }
            // Horn
            Triangle()
                .fill(LinearGradient(colors: [Theme.sunny, Theme.gold], startPoint: .bottom, endPoint: .top))
                .frame(width: 22, height: 40)
                .offset(y: -74)
            // Head
            Circle().fill(.white).frame(width: 104, height: 104)
                .shadow(color: Theme.purple.opacity(0.2), radius: 6, y: 4)
            CuteFace().offset(y: 6)
        }
    }
}

struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}

struct PuppyFigure: View {
    private let brown = Color(red: 0.72, green: 0.52, blue: 0.35)
    private let darkBrown = Color(red: 0.55, green: 0.38, blue: 0.24)

    var body: some View {
        ZStack {
            // Floppy ears
            Capsule().fill(darkBrown).frame(width: 34, height: 70)
                .rotationEffect(.degrees(24)).offset(x: -48, y: -34)
            Capsule().fill(darkBrown).frame(width: 34, height: 70)
                .rotationEffect(.degrees(-24)).offset(x: 48, y: -34)
            Circle().fill(brown).frame(width: 104, height: 104)
                .shadow(color: darkBrown.opacity(0.3), radius: 6, y: 4)
            // Snout
            Ellipse().fill(Color(red: 0.93, green: 0.85, blue: 0.72)).frame(width: 44, height: 32).offset(y: 22)
            Circle().fill(.black.opacity(0.8)).frame(width: 13, height: 13).offset(y: 14)
            // Tongue
            Capsule().fill(Theme.pink).frame(width: 14, height: 18).offset(y: 38)
            CuteFace().offset(y: -8)
        }
    }
}

struct KittenFigure: View {
    private let gray = Color(red: 0.72, green: 0.72, blue: 0.80)

    var body: some View {
        ZStack {
            EarTriangle().fill(gray).frame(width: 36, height: 34).offset(x: -36, y: -58)
            EarTriangle().fill(gray).frame(width: 36, height: 34).offset(x: 36, y: -58)
            EarTriangle().fill(Theme.pink.opacity(0.6)).frame(width: 18, height: 18).offset(x: -36, y: -50)
            EarTriangle().fill(Theme.pink.opacity(0.6)).frame(width: 18, height: 18).offset(x: 36, y: -50)
            Circle().fill(gray).frame(width: 104, height: 104)
                .shadow(color: gray.opacity(0.5), radius: 6, y: 4)
            // Whiskers
            ForEach([-1.0, 1.0], id: \.self) { side in
                VStack(spacing: 7) {
                    ForEach(0..<3, id: \.self) { i in
                        Capsule().fill(.white.opacity(0.9)).frame(width: 30, height: 2)
                            .rotationEffect(.degrees(Double(i - 1) * 10 * side))
                    }
                }
                .offset(x: side * 62, y: 14)
            }
            EarTriangle().fill(Theme.pink).frame(width: 13, height: 10).rotationEffect(.degrees(180)).offset(y: 16)
            CuteFace().offset(y: -4)
        }
    }
}

struct BunnyFigure: View {
    var body: some View {
        ZStack {
            Capsule().fill(.white).frame(width: 30, height: 84).rotationEffect(.degrees(-8)).offset(x: -24, y: -70)
            Capsule().fill(.white).frame(width: 30, height: 84).rotationEffect(.degrees(8)).offset(x: 24, y: -70)
            Capsule().fill(Theme.pink.opacity(0.5)).frame(width: 14, height: 56).rotationEffect(.degrees(-8)).offset(x: -24, y: -66)
            Capsule().fill(Theme.pink.opacity(0.5)).frame(width: 14, height: 56).rotationEffect(.degrees(8)).offset(x: 24, y: -66)
            Circle().fill(.white).frame(width: 100, height: 100).offset(y: 4)
                .shadow(color: Theme.purple.opacity(0.2), radius: 6, y: 4)
            EarTriangle().fill(Theme.pink).frame(width: 12, height: 9).rotationEffect(.degrees(180)).offset(y: 18)
            CuteFace().offset(y: 0)
        }
    }
}

struct RainbowFigure: View {
    private let colors: [Color] = [Theme.coral, Theme.sunny, Theme.mint, Theme.skyBlue, Theme.purple]

    var body: some View {
        ZStack {
            ForEach(0..<5, id: \.self) { i in
                RainbowArc()
                    .stroke(colors[i], style: StrokeStyle(lineWidth: 10, lineCap: .round))
                    .frame(width: 130 - CGFloat(i) * 20, height: 76 - CGFloat(i) * 10)
                    .offset(y: CGFloat(i) * 5 + 6)
            }
            cloud.offset(x: -58, y: 40)
            cloud.offset(x: 58, y: 40)
        }
    }

    private var cloud: some View {
        ZStack {
            Circle().fill(.white).frame(width: 30, height: 30).offset(x: -12)
            Circle().fill(.white).frame(width: 38, height: 38)
            Circle().fill(.white).frame(width: 28, height: 28).offset(x: 13)
        }
        .shadow(color: Theme.skyBlue.opacity(0.4), radius: 4, y: 2)
    }
}

private struct RainbowArc: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.addArc(center: CGPoint(x: rect.midX, y: rect.maxY),
                 radius: rect.width / 2,
                 startAngle: .degrees(180), endAngle: .degrees(0), clockwise: false)
        return p
    }
}

struct StarFigure: View {
    var body: some View {
        ZStack {
            StarShape()
                .fill(LinearGradient(colors: [Theme.sunny, Theme.gold], startPoint: .top, endPoint: .bottom))
                .frame(width: 130, height: 130)
                .shadow(color: Theme.gold.opacity(0.6), radius: 10)
            CuteFace(scale: 0.85).offset(y: 8)
        }
    }
}

struct StarShape: Shape {
    func path(in rect: CGRect) -> Path {
        ConfettiView.starPath(in: rect)
    }
}

struct DragonFigure: View {
    private let green = Color(red: 0.45, green: 0.78, blue: 0.50)

    var body: some View {
        ZStack {
            // Little horns
            EarTriangle().fill(Theme.sunny).frame(width: 22, height: 26).offset(x: -30, y: -60)
            EarTriangle().fill(Theme.sunny).frame(width: 22, height: 26).offset(x: 30, y: -60)
            Circle().fill(green).frame(width: 104, height: 104)
                .shadow(color: green.opacity(0.5), radius: 6, y: 4)
            // Belly patch
            Ellipse().fill(Color(red: 0.85, green: 0.97, blue: 0.80)).frame(width: 52, height: 38).offset(y: 26)
            // Nostrils
            HStack(spacing: 14) {
                Circle().fill(.black.opacity(0.5)).frame(width: 6, height: 6)
                Circle().fill(.black.opacity(0.5)).frame(width: 6, height: 6)
            }
            .offset(y: 18)
            CuteFace().offset(y: -8)
        }
    }
}

struct TeddyFigure: View {
    private let brown = Color(red: 0.78, green: 0.60, blue: 0.42)
    private let light = Color(red: 0.95, green: 0.87, blue: 0.74)

    var body: some View {
        ZStack {
            Circle().fill(brown).frame(width: 40, height: 40).offset(x: -42, y: -44)
            Circle().fill(brown).frame(width: 40, height: 40).offset(x: 42, y: -44)
            Circle().fill(light).frame(width: 22, height: 22).offset(x: -42, y: -44)
            Circle().fill(light).frame(width: 22, height: 22).offset(x: 42, y: -44)
            Circle().fill(brown).frame(width: 106, height: 106)
                .shadow(color: brown.opacity(0.5), radius: 6, y: 4)
            Ellipse().fill(light).frame(width: 44, height: 34).offset(y: 22)
            Circle().fill(.black.opacity(0.8)).frame(width: 12, height: 12).offset(y: 14)
            CuteFace().offset(y: -8)
        }
    }
}

// MARK: - Floating hearts (higher celebration tiers)

struct FloatingHeartsView: View {
    var count: Int

    private struct Heart: Identifiable {
        let id = UUID()
        let x: Double
        let delay: Double
        let size: CGFloat
    }

    @State private var hearts: [Heart] = []
    @State private var rising = false

    var body: some View {
        GeometryReader { geo in
            ForEach(hearts) { heart in
                Text("💜")
                    .font(.system(size: heart.size))
                    .position(x: heart.x * geo.size.width,
                              y: rising ? -40 : geo.size.height + 40)
                    .opacity(rising ? 0.2 : 1)
                    .animation(
                        .easeIn(duration: 4.5).repeatForever(autoreverses: false).delay(heart.delay),
                        value: rising
                    )
            }
        }
        .allowsHitTesting(false)
        .onAppear {
            hearts = (0..<count).map { i in
                Heart(x: Double.random(in: 0.08...0.92),
                      delay: Double(i) * 0.5,
                      size: CGFloat.random(in: 18...34))
            }
            rising = true
        }
    }
}

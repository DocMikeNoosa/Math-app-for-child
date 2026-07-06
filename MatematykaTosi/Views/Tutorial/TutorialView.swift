import SwiftUI

/// Interactive graphical tutorial launched after the third wrong answer.
/// Walks through THIS exact problem step by step, ends with the answer and
/// hands back to the engine for a fresh similar problem.
struct TutorialView: View {
    @Environment(\.l10n) private var t
    let problem: MathProblem
    let onFinish: () -> Void

    @State private var stepIndex = 0

    private var plan: TutorialPlan { TutorialPlan.make(for: problem) }
    private var step: TutorialPlan.Step { plan.steps[min(stepIndex, plan.steps.count - 1)] }
    private var isLast: Bool { stepIndex >= plan.steps.count - 1 }

    var body: some View {
        ZStack {
            Theme.background.ignoresSafeArea()
            VStack(spacing: 16) {
                Text(t.letsSeeTogether)
                    .font(Theme.rounded(26))
                    .foregroundStyle(Theme.purple)
                    .padding(.top, 20)

                Text(problem.displayText)
                    .font(Theme.rounded(34, weight: .heavy))
                    .foregroundStyle(Theme.pink)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                    .padding(.horizontal)

                Spacer(minLength: 4)

                stepContent
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.horizontal, 16)
                    .id(stepIndex)   // restart per-step animations
                    .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                            removal: .opacity))

                Spacer(minLength: 4)

                BigActionButton(
                    title: isLast ? t.newProblem : t.next,
                    color: isLast ? Theme.mint : Theme.pink
                ) {
                    if isLast {
                        onFinish()
                    } else {
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                            stepIndex += 1
                        }
                    }
                }
                .padding(.bottom, 16)
            }
        }
    }

    @ViewBuilder
    private var stepContent: some View {
        switch step {
        case .say(let pl, let en):
            SpeechBubbleView(text: t.pick(pl, en))
        case .decompose(let number, let tens, let ones):
            DecomposeView(number: number, tens: tens, ones: ones)
        case .numberLine(let start, let jump, let subtract):
            NumberLineJumpView(start: start, jump: jump, subtract: subtract)
        case .groups(let count, let size):
            GroupsView(count: count, size: size)
        case .sharing(let total, let baskets):
            SharingView(total: total, baskets: baskets)
        case .reveal(let statement, let answer):
            RevealView(statement: statement, answer: answer)
        }
    }
}

// MARK: - Speech bubble

private struct SpeechBubbleView: View {
    let text: String
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 14) {
            Text("🦉")
                .font(.system(size: 64))
                .rotationEffect(.degrees(appeared ? 0 : -12))
            Text(text)
                .font(Theme.rounded(24))
                .foregroundStyle(Theme.purple)
                .multilineTextAlignment(.center)
                .padding(20)
                .background(RoundedRectangle(cornerRadius: 24).fill(.white.opacity(0.9)))
                .scaleEffect(appeared ? 1 : 0.7)
                .opacity(appeared ? 1 : 0)
        }
        .onAppear {
            withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) { appeared = true }
        }
    }
}

// MARK: - Decomposition into tens and ones

private struct DecomposeView: View {
    let number: Int
    let tens: Int
    let ones: Int
    @State private var split = false

    var body: some View {
        VStack(spacing: 24) {
            Text("\(number)")
                .font(Theme.rounded(52, weight: .heavy))
                .foregroundStyle(.white)
                .frame(width: 110, height: 90)
                .background(RoundedRectangle(cornerRadius: 20).fill(Theme.purple))
            Image(systemName: "arrow.down")
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(Theme.purple.opacity(0.6))
            HStack(spacing: split ? 28 : 4) {
                numberCard(tens, color: Theme.skyBlue)
                Text("+")
                    .font(Theme.rounded(36))
                    .foregroundStyle(Theme.purple)
                    .opacity(split ? 1 : 0)
                numberCard(ones, color: Theme.coral)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.6).delay(0.4)) { split = true }
        }
    }

    private func numberCard(_ value: Int, color: Color) -> some View {
        Text("\(value)")
            .font(Theme.rounded(44, weight: .heavy))
            .foregroundStyle(.white)
            .frame(width: 96, height: 80)
            .background(RoundedRectangle(cornerRadius: 18).fill(color))
            .scaleEffect(split ? 1 : 0.6)
            .opacity(split ? 1 : 0)
    }
}

// MARK: - Number line (oś liczbowa)

private struct NumberLineJumpView: View {
    let start: Int
    let jump: Int
    let subtract: Bool
    @State private var progress: CGFloat = 0

    private var result: Int { subtract ? start - jump : start + jump }

    var body: some View {
        VStack(spacing: 20) {
            Text(subtract ? "−\(jump)" : "+\(jump)")
                .font(Theme.rounded(38, weight: .heavy))
                .foregroundStyle(subtract ? Theme.coral : Theme.mint)
                .opacity(progress > 0.15 ? 1 : 0)
            GeometryReader { geo in
                let lo = min(start, result)
                let hi = max(start, result)
                let pad = max(2, (hi - lo) / 5)
                let axisLo = max(0, lo - pad)
                let axisHi = hi + pad
                let width = geo.size.width - 40
                let y = geo.size.height * 0.7
                let x: (Int) -> CGFloat = { value in
                    20 + width * CGFloat(value - axisLo) / CGFloat(max(1, axisHi - axisLo))
                }

                ZStack {
                    // Axis
                    Path { p in
                        p.move(to: CGPoint(x: 12, y: y))
                        p.addLine(to: CGPoint(x: geo.size.width - 12, y: y))
                    }
                    .stroke(Theme.purple.opacity(0.5), lineWidth: 3)

                    // Ticks at start & result plus round tens between
                    ForEach(tickValues(lo: axisLo, hi: axisHi), id: \.self) { v in
                        Path { p in
                            p.move(to: CGPoint(x: x(v), y: y - 7))
                            p.addLine(to: CGPoint(x: x(v), y: y + 7))
                        }
                        .stroke(Theme.purple.opacity(0.4), lineWidth: 2)
                        Text("\(v)")
                            .font(Theme.rounded(13, weight: .semibold))
                            .foregroundStyle(.secondary)
                            .position(x: x(v), y: y + 22)
                    }

                    // The jump arc
                    JumpArc(from: CGPoint(x: x(start), y: y), to: CGPoint(x: x(result), y: y))
                        .trim(from: 0, to: progress)
                        .stroke(subtract ? Theme.coral : Theme.mint,
                                style: StrokeStyle(lineWidth: 5, lineCap: .round, dash: [1, 9]))

                    // Start and result markers
                    marker(value: start, at: CGPoint(x: x(start), y: y), color: Theme.purple, visible: true)
                    marker(value: result, at: CGPoint(x: x(result), y: y),
                           color: subtract ? Theme.coral : Theme.mint, visible: progress > 0.95)

                    // Hopping bunny
                    Text("🐇")
                        .font(.system(size: 30))
                        .position(hopPosition(from: CGPoint(x: x(start), y: y),
                                              to: CGPoint(x: x(result), y: y),
                                              t: progress))
                }
            }
            .frame(height: 180)
        }
        .onAppear {
            progress = 0
            withAnimation(.easeInOut(duration: 1.6).delay(0.5)) { progress = 1 }
        }
    }

    private func tickValues(lo: Int, hi: Int) -> [Int] {
        let step = (hi - lo) <= 20 ? 5 : 10
        var values = Set<Int>([start, result])
        var v = (lo / step + 1) * step
        while v < hi {
            values.insert(v)
            v += step
        }
        return values.sorted()
    }

    private func marker(value: Int, at point: CGPoint, color: Color, visible: Bool) -> some View {
        VStack(spacing: 2) {
            Text("\(value)")
                .font(Theme.rounded(24, weight: .heavy))
                .foregroundStyle(color)
            Circle().fill(color).frame(width: 12, height: 12)
        }
        .position(x: point.x, y: point.y - 26)
        .opacity(visible ? 1 : 0)
        .animation(.spring(response: 0.4, dampingFraction: 0.6), value: visible)
    }

    private func hopPosition(from: CGPoint, to: CGPoint, t: CGFloat) -> CGPoint {
        let x = from.x + (to.x - from.x) * t
        let hop = abs(sin(t * .pi * 3)) * 34
        return CGPoint(x: x, y: from.y - 16 - hop)
    }
}

/// A dashed arc from one number-line point to another.
private struct JumpArc: Shape {
    let from: CGPoint
    let to: CGPoint

    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: from)
        let control = CGPoint(x: (from.x + to.x) / 2, y: from.y - 70)
        p.addQuadCurve(to: to, control: control)
        return p
    }
}

// MARK: - Groups (multiplication as repeated addition)

private struct GroupsView: View {
    let count: Int
    let size: Int
    @State private var revealed = 0

    var body: some View {
        VStack(spacing: 18) {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 92))], spacing: 12) {
                ForEach(0..<count, id: \.self) { g in
                    groupCard(index: g)
                        .opacity(g < revealed ? 1 : 0.12)
                        .scaleEffect(g < revealed ? 1 : 0.7)
                        .animation(.spring(response: 0.45, dampingFraction: 0.6), value: revealed)
                }
            }
            Text(additionLine)
                .font(Theme.rounded(24, weight: .heavy))
                .foregroundStyle(Theme.purple)
                .minimumScaleFactor(0.4)
                .lineLimit(1)
                .contentTransition(.numericText())
                .animation(.snappy, value: revealed)
        }
        .task {
            revealed = 0
            for i in 1...count {
                try? await Task.sleep(for: .seconds(0.65))
                revealed = i
            }
        }
    }

    private var additionLine: String {
        guard revealed > 0 else { return " " }
        let terms = Array(repeating: "\(size)", count: revealed).joined(separator: " + ")
        return revealed == count ? "\(terms) = \(count * size)" : terms
    }

    private func groupCard(index: Int) -> some View {
        VStack(spacing: 4) {
            appleGrid(size)
        }
        .padding(8)
        .frame(minWidth: 92, minHeight: 76)
        .background(RoundedRectangle(cornerRadius: 16).fill(.white.opacity(0.85)))
    }

    private func appleGrid(_ n: Int) -> some View {
        let columns = n > 6 ? 4 : 3
        return LazyVGrid(columns: Array(repeating: GridItem(.fixed(20), spacing: 2), count: columns), spacing: 2) {
            ForEach(0..<n, id: \.self) { _ in
                Text("🍎").font(.system(size: 16))
            }
        }
    }
}

// MARK: - Fair sharing (division)

private struct SharingView: View {
    let total: Int
    let baskets: Int
    @State private var dealt = 0

    private var perBasket: Int { total / baskets }

    var body: some View {
        VStack(spacing: 22) {
            HStack(spacing: 8) {
                Text("🍎")
                    .font(.system(size: 34))
                Text("× \(total - dealt)")
                    .font(Theme.rounded(30, weight: .heavy))
                    .foregroundStyle(Theme.coral)
                    .contentTransition(.numericText())
                    .animation(.snappy, value: dealt)
            }
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: min(baskets, 5)), spacing: 14) {
                ForEach(0..<baskets, id: \.self) { b in
                    basket(index: b)
                }
            }
            if dealt == total {
                Text("\(total) ÷ \(baskets) = \(perBasket)")
                    .font(Theme.rounded(28, weight: .heavy))
                    .foregroundStyle(Theme.mint)
                    .transition(.scale.combined(with: .opacity))
            }
        }
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: dealt)
        .task {
            dealt = 0
            for i in 1...total {
                try? await Task.sleep(for: .seconds(total > 20 ? 0.12 : 0.25))
                dealt = i
            }
        }
    }

    /// Apples are dealt one by one, round-robin, into the baskets.
    private func applesIn(basket index: Int) -> Int {
        let full = dealt / baskets
        let extra = dealt % baskets > index ? 1 : 0
        return full + extra
    }

    private func basket(index: Int) -> some View {
        VStack(spacing: 4) {
            Text(applesIn(basket: index) == 0 ? " " : String(repeating: "🍎", count: min(applesIn(basket: index), 12)))
                .font(.system(size: 13))
                .lineLimit(2)
                .frame(minHeight: 34)
                .minimumScaleFactor(0.5)
            Text("🧺")
                .font(.system(size: 38))
            Text("\(applesIn(basket: index))")
                .font(Theme.rounded(20, weight: .heavy))
                .foregroundStyle(Theme.purple)
                .contentTransition(.numericText())
        }
        .padding(6)
        .background(RoundedRectangle(cornerRadius: 14).fill(.white.opacity(0.75)))
    }
}

// MARK: - Reveal

private struct RevealView: View {
    let statement: String
    let answer: Int
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 24) {
            Text("🎉")
                .font(.system(size: 56))
                .scaleEffect(appeared ? 1 : 0.3)
            Text(statement)
                .font(Theme.rounded(40, weight: .heavy))
                .foregroundStyle(Theme.purple)
                .minimumScaleFactor(0.4)
                .lineLimit(1)
                .padding(.horizontal)
            Text("\(answer)")
                .font(Theme.rounded(72, weight: .heavy))
                .foregroundStyle(.white)
                .frame(minWidth: 140, minHeight: 120)
                .background(RoundedRectangle(cornerRadius: 28).fill(Theme.mint))
                .scaleEffect(appeared ? 1 : 0.5)
                .shadow(color: Theme.mint.opacity(0.5), radius: 12, y: 6)
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.55)) { appeared = true }
        }
    }
}

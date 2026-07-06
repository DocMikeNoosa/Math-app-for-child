import Foundation

/// Pure problem generator. All rules of the Polish early-school curriculum
/// are enforced here:
///  - subtraction never negative (minuend ≥ subtrahend),
///  - division always exact (built from a multiplication-table fact),
///  - never divide by zero,
///  - ×0 never, ×1 only at Easy,
///  - Easy +/− never crosses the tens boundary, Medium always does,
///  - missing-operand and two-step problems only at Genius,
///  - never the same problem twice in a row.
enum ProblemGenerator {

    // MARK: Public API

    static func generate(
        config: SessionConfig,
        avoiding previous: MathProblem?,
        using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        let ops = config.operations.isEmpty ? Set(MathOperation.allCases) : config.operations
        var candidate = makeOne(operations: ops, config: config, using: &rng)
        var attempts = 0
        while candidate == previous && attempts < 300 {
            candidate = makeOne(operations: ops, config: config, using: &rng)
            attempts += 1
        }
        return candidate
    }

    /// A fresh problem of the same operation as `problem` (used after a
    /// tutorial: "give a fresh similar problem"). Never returns `problem` itself.
    static func generateSimilar(
        to problem: MathProblem,
        config: SessionConfig,
        using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        var similarConfig = config
        similarConfig.operations = [problem.operation]
        // After a tutorial we always hand back a plain problem — kinder than
        // another missing-operand puzzle.
        var candidate = standardProblem(op: problem.operation, config: similarConfig, using: &rng)
        var attempts = 0
        while candidate == problem && attempts < 300 {
            candidate = standardProblem(op: problem.operation, config: similarConfig, using: &rng)
            attempts += 1
        }
        return candidate
    }

    // MARK: One candidate

    private static func makeOne(
        operations: Set<MathOperation>,
        config: SessionConfig,
        using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        let ops = Array(operations).sorted { $0.rawValue < $1.rawValue }
        let op = ops.randomElement(using: &rng)!

        if config.difficulty == .genius {
            let roll = Double.random(in: 0..<1, using: &rng)
            let canTwoStep = operations.contains(.addition) || operations.contains(.subtraction)
            if canTwoStep && roll < 0.15 {
                return twoStepProblem(operations: operations, config: config, using: &rng)
            }
            if roll < 0.45 {
                return missingOperandProblem(op: op, config: config, using: &rng)
            }
        }
        return standardProblem(op: op, config: config, using: &rng)
    }

    private static func standardProblem(
        op: MathOperation,
        config: SessionConfig,
        using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        let r = config.range.rawValue
        switch op {
        case .addition: return addition(range: r, difficulty: config.difficulty, using: &rng)
        case .subtraction: return subtraction(range: r, difficulty: config.difficulty, using: &rng)
        case .multiplication: return multiplication(range: r, difficulty: config.difficulty, using: &rng)
        case .division: return division(range: r, difficulty: config.difficulty, using: &rng)
        }
    }

    // MARK: Addition — sum ≤ range, operands ≥ 1

    private static func addition(
        range: Int, difficulty: Difficulty, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        for _ in 0..<400 {
            let a: Int, b: Int
            switch difficulty {
            case .easy:
                a = Int.random(in: 1...(range - 1), using: &rng)
                b = Int.random(in: 1...min(10, range - a), using: &rng)
                // No tens-boundary crossing at Easy.
                guard a % 10 + b % 10 <= 9 else { continue }
            case .medium:
                a = Int.random(in: 1...(range - 1), using: &rng)
                b = Int.random(in: 1...(range - a), using: &rng)
                // Medium practices exactly the crossing.
                guard a % 10 + b % 10 >= 10 else { continue }
            case .hard, .genius:
                a = Int.random(in: 2...(range - 2), using: &rng)
                b = Int.random(in: 2...(range - a), using: &rng)
            }
            return MathProblem(operation: .addition, a: a, b: b)
        }
        // Constraint-free fallback (unreachable for the supported ranges).
        let a = Int.random(in: 1...(range - 1), using: &rng)
        return MathProblem(operation: .addition, a: a, b: Int.random(in: 1...(range - a), using: &rng))
    }

    // MARK: Subtraction — minuend ≤ range, result ≥ 0

    private static func subtraction(
        range: Int, difficulty: Difficulty, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        for _ in 0..<400 {
            let a: Int, b: Int
            switch difficulty {
            case .easy:
                a = Int.random(in: 2...range, using: &rng)
                b = Int.random(in: 1...min(10, a), using: &rng)
                // No borrowing at Easy.
                guard a % 10 >= b % 10 else { continue }
            case .medium:
                a = Int.random(in: 2...range, using: &rng)
                b = Int.random(in: 1...a, using: &rng)
                // Medium practices exactly the borrow.
                guard a % 10 < b % 10 else { continue }
            case .hard, .genius:
                a = Int.random(in: 3...range, using: &rng)
                b = Int.random(in: 2...a, using: &rng)
            }
            return MathProblem(operation: .subtraction, a: a, b: b)
        }
        let a = Int.random(in: 2...range, using: &rng)
        return MathProblem(operation: .subtraction, a: a, b: Int.random(in: 1...a, using: &rng))
    }

    // MARK: Multiplication — product ≤ range, table facts

    private static func multiplication(
        range: Int, difficulty: Difficulty, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        switch difficulty {
        case .easy:
            // Tables of 2, 5 and 10; ×1 allowed only here, ×0 never.
            let f = [2, 5, 10].randomElement(using: &rng)!
            let other = Int.random(in: 1...max(1, range / f), using: &rng)
            return orderedFactors(f, other, op: .multiplication, using: &rng)
        case .medium:
            // Table facts up to 5×5, both factors ≥ 2.
            for _ in 0..<400 {
                let a = Int.random(in: 2...5, using: &rng)
                let b = Int.random(in: 2...5, using: &rng)
                if a * b <= range { return MathProblem(operation: .multiplication, a: a, b: b) }
            }
            return MathProblem(operation: .multiplication, a: 2, b: 2)
        case .hard, .genius:
            // Harder facts: one factor from 6–9, product still ≤ range.
            for _ in 0..<400 {
                let f = Int.random(in: 6...9, using: &rng)
                let maxOther = range / f
                guard maxOther >= 2 else { continue }
                let other = Int.random(in: 2...min(10, maxOther), using: &rng)
                return orderedFactors(f, other, op: .multiplication, using: &rng)
            }
            // Tiny ranges where 6–9 won't fit — fall back to medium facts.
            return multiplication(range: range, difficulty: .medium, using: &rng)
        }
    }

    private static func orderedFactors(
        _ x: Int, _ y: Int, op: MathOperation, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        Bool.random(using: &rng)
            ? MathProblem(operation: op, a: x, b: y)
            : MathProblem(operation: op, a: y, b: x)
    }

    // MARK: Division — always exact, dividend ≤ range, never ÷0

    private static func division(
        range: Int, difficulty: Difficulty, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        switch difficulty {
        case .easy:
            let d = [2, 5, 10].randomElement(using: &rng)!
            let q = Int.random(in: 1...max(1, range / d), using: &rng)
            return MathProblem(operation: .division, a: d * q, b: d)
        case .medium:
            for _ in 0..<400 {
                let d = Int.random(in: 2...5, using: &rng)
                let q = Int.random(in: 2...5, using: &rng)
                if d * q <= range { return MathProblem(operation: .division, a: d * q, b: d) }
            }
            return MathProblem(operation: .division, a: 4, b: 2)
        case .hard, .genius:
            for _ in 0..<400 {
                let d = Int.random(in: 6...9, using: &rng)
                let maxQ = range / d
                guard maxQ >= 2 else { continue }
                let q = Int.random(in: 2...min(10, maxQ), using: &rng)
                return MathProblem(operation: .division, a: d * q, b: d)
            }
            return division(range: range, difficulty: .medium, using: &rng)
        }
    }

    // MARK: Genius extras

    private static func missingOperandProblem(
        op: MathOperation, config: SessionConfig, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        let base = standardProblem(op: op, config: config, using: &rng)
        let kind: MathProblem.Kind = Bool.random(using: &rng) ? .missingA : .missingB
        return MathProblem(operation: base.operation, a: base.a, b: base.b, kind: kind)
    }

    /// "4 + 3 × 2" style: a ± (b × c), multiplication first, result within
    /// range and never negative.
    private static func twoStepProblem(
        operations: Set<MathOperation>, config: SessionConfig, using rng: inout some RandomNumberGenerator
    ) -> MathProblem {
        let range = config.range.rawValue
        var candidates: [MathOperation] = []
        if operations.contains(.addition) { candidates.append(.addition) }
        if operations.contains(.subtraction) { candidates.append(.subtraction) }
        let op = candidates.randomElement(using: &rng) ?? .addition

        for _ in 0..<400 {
            let b = Int.random(in: 2...5, using: &rng)
            let c = Int.random(in: 2...5, using: &rng)
            let product = b * c
            guard product < range else { continue }
            if op == .addition {
                guard range - product >= 1 else { continue }
                let a = Int.random(in: 1...(range - product), using: &rng)
                return MathProblem(operation: .addition, a: a, b: b, c: c, kind: .twoStep)
            } else {
                let a = Int.random(in: product...range, using: &rng)
                return MathProblem(operation: .subtraction, a: a, b: b, c: c, kind: .twoStep)
            }
        }
        return MathProblem(operation: .addition, a: 4, b: 3, c: 2, kind: .twoStep)
    }
}

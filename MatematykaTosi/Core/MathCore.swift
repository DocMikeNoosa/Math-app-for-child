import Foundation

// MARK: - Basic types

enum MathOperation: String, Codable, CaseIterable, Identifiable, Sendable {
    case addition, subtraction, multiplication, division

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .addition: return "+"
        case .subtraction: return "−"
        case .multiplication: return "×"
        case .division: return "÷"
        }
    }

    var emoji: String {
        switch self {
        case .addition: return "➕"
        case .subtraction: return "➖"
        case .multiplication: return "✖️"
        case .division: return "➗"
        }
    }
}

enum Difficulty: String, Codable, CaseIterable, Identifiable, Sendable {
    case easy, medium, hard, genius
    var id: String { rawValue }

    var emoji: String {
        switch self {
        case .easy: return "🙂"
        case .medium: return "😃"
        case .hard: return "🤩"
        case .genius: return "🧠"
        }
    }
}

enum NumberRange: Int, Codable, CaseIterable, Identifiable, Sendable {
    case r20 = 20, r30 = 30, r50 = 50, r100 = 100
    var id: Int { rawValue }
}

/// The configuration of a practice session, chosen on screens 1–3.
struct SessionConfig: Equatable, Sendable {
    var operations: Set<MathOperation> = []
    var range: NumberRange = .r100
    var difficulty: Difficulty = .medium
}

// MARK: - Problem

/// A single math problem. Value type, fully deterministic — the answer is
/// derived from the stored operands, so a problem can never disagree with
/// its own solution.
struct MathProblem: Equatable, Hashable, Sendable {
    enum Kind: Equatable, Hashable, Sendable {
        /// a op b = ?
        case standard
        /// ? op b = result   (answer is `a`)
        case missingA
        /// a op ? = result   (answer is `b`)
        case missingB
        /// a op (b × c) = ?  — op is + or −, multiplication binds first.
        case twoStep
    }

    let operation: MathOperation
    let a: Int
    let b: Int
    /// Only used by `.twoStep`; 0 otherwise.
    let c: Int
    let kind: Kind

    init(operation: MathOperation, a: Int, b: Int, c: Int = 0, kind: Kind = .standard) {
        self.operation = operation
        self.a = a
        self.b = b
        self.c = c
        self.kind = kind
    }

    /// Result of `a op b` (the plain fact behind the problem).
    var factResult: Int {
        switch operation {
        case .addition: return a + b
        case .subtraction: return a - b
        case .multiplication: return a * b
        case .division: return b == 0 ? 0 : a / b
        }
    }

    /// What the child must type.
    var answer: Int {
        switch kind {
        case .standard: return factResult
        case .missingA: return a
        case .missingB: return b
        case .twoStep: return operation == .addition ? a + b * c : a - b * c
        }
    }

    /// The prompt split into (prefix, answer slot, suffix), so the view can
    /// style the typed digits differently. The slot shows typed digits or "?".
    func promptParts() -> (prefix: String, suffix: String) {
        switch kind {
        case .standard:
            return ("\(a) \(operation.symbol) \(b) = ", "")
        case .missingA:
            return ("", " \(operation.symbol) \(b) = \(factResult)")
        case .missingB:
            return ("\(a) \(operation.symbol) ", " = \(factResult)")
        case .twoStep:
            return ("\(a) \(operation.symbol) \(b) × \(c) = ", "")
        }
    }

    /// Full text for logs/accessibility, e.g. "36 + 27 = ?".
    var displayText: String {
        let parts = promptParts()
        return parts.prefix + "?" + parts.suffix
    }
}

// MARK: - Seedable RNG (used by tests; the app uses SystemRandomNumberGenerator)

/// SplitMix64 — tiny, deterministic RNG for reproducible unit tests.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64
    init(seed: UInt64) { state = seed }

    mutating func next() -> UInt64 {
        state &+= 0x9E3779B97F4A7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
        z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
        return z ^ (z >> 31)
    }
}

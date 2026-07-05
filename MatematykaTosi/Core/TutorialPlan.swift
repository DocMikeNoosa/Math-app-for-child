import Foundation

/// A step-by-step visual explanation of one exact problem, using Polish
/// early-school methods: number-line jumps (oś liczbowa), decomposition into
/// tens and ones, groups-of-objects multiplication, fair-sharing division.
struct TutorialPlan: Equatable {
    enum Step: Equatable {
        /// A friendly message bubble.
        case say(pl: String, en: String)
        /// Show `number` splitting into tens + ones.
        case decompose(number: Int, tens: Int, ones: Int)
        /// A jump on the number line: start → start ± jump.
        case numberLine(start: Int, jump: Int, subtract: Bool)
        /// `count` groups of `size` objects + repeated addition.
        case groups(count: Int, size: Int)
        /// `total` objects dealt fairly into `baskets` baskets.
        case sharing(total: Int, baskets: Int)
        /// Final answer reveal, e.g. "36 + 27 = 63".
        case reveal(statement: String, answer: Int)
    }

    let steps: [Step]

    // MARK: Building

    static func make(for problem: MathProblem) -> TutorialPlan {
        switch problem.kind {
        case .standard:
            return TutorialPlan(steps:
                standardSteps(op: problem.operation, a: problem.a, b: problem.b)
                + [revealStep(statement: statement(for: problem), answer: problem.answer)])
        case .twoStep:
            return TutorialPlan(steps: twoStepSteps(problem: problem))
        case .missingA, .missingB:
            return TutorialPlan(steps: missingOperandSteps(problem: problem))
        }
    }

    private static func revealStep(statement: String, answer: Int) -> Step {
        .reveal(statement: statement, answer: answer)
    }

    private static func statement(for problem: MathProblem) -> String {
        let parts = problem.promptParts()
        return parts.prefix + "\(problem.answer)" + parts.suffix
    }

    // MARK: Standard problems

    static func standardSteps(op: MathOperation, a: Int, b: Int) -> [Step] {
        switch op {
        case .addition: return additionSteps(a: a, b: b)
        case .subtraction: return subtractionSteps(a: a, b: b)
        case .multiplication:
            return [
                .say(pl: "\(a) × \(b) to \(a) grup po \(b). Policzmy razem!",
                     en: "\(a) × \(b) means \(a) groups of \(b). Let's count together!"),
                .groups(count: a, size: b),
            ]
        case .division:
            return [
                .say(pl: "Rozdzielimy \(a) po równo do \(b) koszyków — dzielenie po równo!",
                     en: "We'll share \(a) equally into \(b) baskets — fair sharing!"),
                .sharing(total: a, baskets: b),
            ]
        }
    }

    private static func additionSteps(a: Int, b: Int) -> [Step] {
        var steps: [Step] = []
        let bTens = b / 10 * 10
        let bOnes = b % 10
        if bTens > 0 && bOnes > 0 {
            // Decompose into tens and ones: 36 + 27 → 36 + 20 = 56 → 56 + 7 = 63.
            steps.append(.say(pl: "Rozłóżmy \(b) na dziesiątki i jedności!",
                              en: "Let's split \(b) into tens and ones!"))
            steps.append(.decompose(number: b, tens: bTens, ones: bOnes))
            steps.append(.numberLine(start: a, jump: bTens, subtract: false))
            steps.append(.numberLine(start: a + bTens, jump: bOnes, subtract: false))
        } else if a % 10 + b % 10 >= 10 && b < 10 && a % 10 != 0 {
            // Crossing the ten with a small addend: hop to the round ten first.
            let gap = 10 - a % 10
            steps.append(.say(pl: "Najpierw doskoczmy do pełnej dziesiątki!",
                              en: "First, let's hop to the next full ten!"))
            steps.append(.decompose(number: b, tens: gap, ones: b - gap))
            steps.append(.numberLine(start: a, jump: gap, subtract: false))
            steps.append(.numberLine(start: a + gap, jump: b - gap, subtract: false))
        } else {
            steps.append(.say(pl: "Skaczemy po osi liczbowej do przodu!",
                              en: "Let's jump forward on the number line!"))
            steps.append(.numberLine(start: a, jump: b, subtract: false))
        }
        return steps
    }

    private static func subtractionSteps(a: Int, b: Int) -> [Step] {
        var steps: [Step] = []
        let bTens = b / 10 * 10
        let bOnes = b % 10
        if bTens > 0 && bOnes > 0 {
            steps.append(.say(pl: "Rozłóżmy \(b) na dziesiątki i jedności i skaczmy do tyłu!",
                              en: "Let's split \(b) into tens and ones and jump backwards!"))
            steps.append(.decompose(number: b, tens: bTens, ones: bOnes))
            steps.append(.numberLine(start: a, jump: bTens, subtract: true))
            steps.append(.numberLine(start: a - bTens, jump: bOnes, subtract: true))
        } else if a % 10 < b % 10 && b < 10 && a % 10 != 0 {
            // Borrowing with a small subtrahend: step down to the round ten first.
            let gap = a % 10
            steps.append(.say(pl: "Najpierw cofnijmy się do pełnej dziesiątki!",
                              en: "First, let's step back to the full ten!"))
            steps.append(.decompose(number: b, tens: gap, ones: b - gap))
            steps.append(.numberLine(start: a, jump: gap, subtract: true))
            steps.append(.numberLine(start: a - gap, jump: b - gap, subtract: true))
        } else {
            steps.append(.say(pl: "Skaczemy po osi liczbowej do tyłu!",
                              en: "Let's jump backwards on the number line!"))
            steps.append(.numberLine(start: a, jump: b, subtract: true))
        }
        return steps
    }

    // MARK: Genius problems

    private static func twoStepSteps(problem: MathProblem) -> [Step] {
        let product = problem.b * problem.c
        let opWord = problem.operation == .addition
            ? (pl: "dodajemy", en: "we add")
            : (pl: "odejmujemy", en: "we subtract")
        return [
            .say(pl: "Najpierw mnożenie: \(problem.b) × \(problem.c)!",
                 en: "Multiplication first: \(problem.b) × \(problem.c)!"),
            .groups(count: problem.b, size: problem.c),
            .say(pl: "Teraz \(opWord.pl): \(problem.a) \(problem.operation.symbol) \(product)",
                 en: "Now \(opWord.en): \(problem.a) \(problem.operation.symbol) \(product)"),
            .numberLine(start: problem.a, jump: product, subtract: problem.operation == .subtraction),
            .reveal(statement: "\(problem.a) \(problem.operation.symbol) \(problem.b) × \(problem.c) = \(problem.answer)",
                    answer: problem.answer),
        ]
    }

    /// Missing-operand problems are solved by turning them into the inverse
    /// operation ("7 × ? = 56 is the same as 56 ÷ 7").
    private static func missingOperandSteps(problem: MathProblem) -> [Step] {
        let result = problem.factResult
        let known = problem.kind == .missingA ? problem.b : problem.a
        let inverse: (op: MathOperation, a: Int, b: Int)
        switch (problem.operation, problem.kind) {
        case (.addition, _):
            // ? + b = r  or  a + ? = r  →  r − known
            inverse = (.subtraction, result, known)
        case (.subtraction, .missingA):
            // ? − b = r  →  r + b
            inverse = (.addition, result, known)
        case (.subtraction, _):
            // a − ? = r  →  a − r
            inverse = (.subtraction, problem.a, result)
        case (.multiplication, _):
            // ? × b = r  or  a × ? = r  →  r ÷ known
            inverse = (.division, result, known)
        case (.division, .missingA):
            // ? ÷ b = r  →  b × r
            inverse = (.multiplication, known, result)
        case (.division, _):
            // a ÷ ? = r  →  a ÷ r
            inverse = (.division, problem.a, result)
        }
        let puzzle = problem.displayText
        let hint = "\(inverse.a) \(inverse.op.symbol) \(inverse.b)"
        var steps: [Step] = [
            .say(pl: "Zagadka: \(puzzle). To to samo, co \(hint)!",
                 en: "Puzzle: \(puzzle). That's the same as \(hint)!"),
        ]
        steps += standardSteps(op: inverse.op, a: inverse.a, b: inverse.b)
        steps.append(.reveal(
            statement: puzzle.replacingOccurrences(of: "?", with: "\(problem.answer)"),
            answer: problem.answer))
        return steps
    }
}

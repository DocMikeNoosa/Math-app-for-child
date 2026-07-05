import XCTest
@testable import MatematykaTosi

/// Exhaustive property tests for the problem generator: every curriculum
/// constraint is checked over many seeded runs for every combination of
/// operation, range and difficulty.
final class ProblemGeneratorTests: XCTestCase {

    private func config(
        _ ops: Set<MathOperation>, range: NumberRange, difficulty: Difficulty
    ) -> SessionConfig {
        SessionConfig(operations: ops, range: range, difficulty: difficulty)
    }

    private func generateMany(
        _ config: SessionConfig, count: Int = 500, seed: UInt64 = 42
    ) -> [MathProblem] {
        var rng = SeededGenerator(seed: seed)
        var problems: [MathProblem] = []
        var previous: MathProblem?
        for _ in 0..<count {
            let p = ProblemGenerator.generate(config: config, avoiding: previous, using: &rng)
            problems.append(p)
            previous = p
        }
        return problems
    }

    // MARK: Universal constraints

    func testAllCombinationsRespectConstraints() {
        for op in MathOperation.allCases {
            for range in NumberRange.allCases {
                for difficulty in Difficulty.allCases {
                    let cfg = config([op], range: range, difficulty: difficulty)
                    for p in generateMany(cfg, count: 300) {
                        assertRespectsConstraints(p, config: cfg)
                    }
                }
            }
        }
    }

    private func assertRespectsConstraints(_ p: MathProblem, config: SessionConfig) {
        let r = config.range.rawValue
        let context = "\(p.displayText) [\(config.difficulty) / do \(r)]"

        XCTAssertTrue(config.operations.contains(p.operation), "Wrong operation: \(context)")

        switch p.operation {
        case .addition:
            if p.kind != .twoStep {
                XCTAssertLessThanOrEqual(p.a + p.b, r, "Sum over range: \(context)")
                XCTAssertGreaterThanOrEqual(min(p.a, p.b), 1, "Zero operand: \(context)")
            }
        case .subtraction:
            if p.kind != .twoStep {
                XCTAssertLessThanOrEqual(p.a, r, "Minuend over range: \(context)")
                XCTAssertGreaterThanOrEqual(p.a - p.b, 0, "Negative result: \(context)")
                XCTAssertGreaterThanOrEqual(p.b, 1, "Subtracting zero: \(context)")
            }
        case .multiplication:
            XCTAssertLessThanOrEqual(p.a * p.b, r, "Product over range: \(context)")
            XCTAssertGreaterThanOrEqual(min(p.a, p.b), 1, "×0 must never appear: \(context)")
            if config.difficulty != .easy {
                XCTAssertGreaterThanOrEqual(min(p.a, p.b), 2, "×1 only at Easy: \(context)")
            }
        case .division:
            XCTAssertLessThanOrEqual(p.a, r, "Dividend over range: \(context)")
            XCTAssertGreaterThan(p.b, 0, "Division by zero: \(context)")
            XCTAssertEqual(p.a % p.b, 0, "Division must be exact: \(context)")
        }

        if p.kind == .twoStep {
            XCTAssertEqual(config.difficulty, .genius, "Two-step outside Genius: \(context)")
            XCTAssertGreaterThanOrEqual(p.answer, 0, "Negative two-step answer: \(context)")
            XCTAssertLessThanOrEqual(p.answer, r, "Two-step answer over range: \(context)")
        }
        if p.kind == .missingA || p.kind == .missingB {
            XCTAssertEqual(config.difficulty, .genius, "Missing operand outside Genius: \(context)")
        }
    }

    // MARK: Difficulty-specific rules

    func testEasyAdditionNeverCrossesTens() {
        for range in NumberRange.allCases {
            let cfg = config([.addition], range: range, difficulty: .easy)
            for p in generateMany(cfg) {
                XCTAssertLessThanOrEqual(p.a % 10 + p.b % 10, 9,
                    "Easy addition crossed the tens: \(p.displayText)")
            }
        }
    }

    func testMediumAdditionAlwaysCrossesTens() {
        for range in NumberRange.allCases {
            let cfg = config([.addition], range: range, difficulty: .medium)
            for p in generateMany(cfg) {
                XCTAssertGreaterThanOrEqual(p.a % 10 + p.b % 10, 10,
                    "Medium addition without crossing: \(p.displayText)")
            }
        }
    }

    func testEasySubtractionNeverBorrows() {
        let cfg = config([.subtraction], range: .r100, difficulty: .easy)
        for p in generateMany(cfg) {
            XCTAssertGreaterThanOrEqual(p.a % 10, p.b % 10,
                "Easy subtraction borrowed: \(p.displayText)")
        }
    }

    func testMediumSubtractionAlwaysBorrows() {
        let cfg = config([.subtraction], range: .r100, difficulty: .medium)
        for p in generateMany(cfg) {
            XCTAssertLessThan(p.a % 10, p.b % 10,
                "Medium subtraction without borrowing: \(p.displayText)")
        }
    }

    func testEasyMultiplicationUsesTablesOf2_5_10() {
        let cfg = config([.multiplication], range: .r100, difficulty: .easy)
        for p in generateMany(cfg) {
            XCTAssertTrue([2, 5, 10].contains(p.a) || [2, 5, 10].contains(p.b),
                "Easy multiplication outside 2/5/10 tables: \(p.displayText)")
        }
    }

    func testHardMultiplicationUsesHardFactors() {
        let cfg = config([.multiplication], range: .r100, difficulty: .hard)
        for p in generateMany(cfg) {
            XCTAssertTrue((6...9).contains(p.a) || (6...9).contains(p.b),
                "Hard multiplication without a 6–9 factor: \(p.displayText)")
        }
    }

    func testDivisionAlwaysExactAcrossAllDifficulties() {
        for difficulty in Difficulty.allCases {
            for range in NumberRange.allCases {
                let cfg = config([.division], range: range, difficulty: difficulty)
                for p in generateMany(cfg, count: 300) {
                    XCTAssertEqual(p.a % p.b, 0, "Remainder in \(p.displayText)")
                    XCTAssertGreaterThan(p.b, 0)
                }
            }
        }
    }

    // MARK: No repeats

    func testNeverSameProblemTwiceInARow() {
        // Even in the tightest pool (×, range 20, medium) consecutive
        // problems must differ.
        for op in MathOperation.allCases {
            let cfg = config([op], range: .r20, difficulty: .medium)
            let problems = generateMany(cfg, count: 400)
            for i in 1..<problems.count {
                XCTAssertNotEqual(problems[i], problems[i - 1],
                    "Repeated problem at index \(i): \(problems[i].displayText)")
            }
        }
    }

    // MARK: Genius formats

    func testGeniusProducesMissingOperandAndTwoStepProblems() {
        let cfg = config(Set(MathOperation.allCases), range: .r100, difficulty: .genius)
        let problems = generateMany(cfg, count: 800)
        let missing = problems.filter { $0.kind == .missingA || $0.kind == .missingB }
        let twoStep = problems.filter { $0.kind == .twoStep }
        XCTAssertGreaterThan(missing.count, 0, "Genius should produce missing-operand problems")
        XCTAssertGreaterThan(twoStep.count, 0, "Genius should produce two-step problems")
    }

    func testNonGeniusNeverProducesSpecialFormats() {
        for difficulty in [Difficulty.easy, .medium, .hard] {
            let cfg = config(Set(MathOperation.allCases), range: .r100, difficulty: difficulty)
            for p in generateMany(cfg) {
                XCTAssertEqual(p.kind, .standard, "\(difficulty) produced \(p.kind)")
            }
        }
    }

    func testMissingOperandAnswersAreTheHiddenOperand() {
        let problem = MathProblem(operation: .multiplication, a: 7, b: 8, kind: .missingB)
        XCTAssertEqual(problem.answer, 8)
        XCTAssertEqual(problem.displayText, "7 × ? = 56")

        let problem2 = MathProblem(operation: .subtraction, a: 53, b: 18, kind: .missingA)
        XCTAssertEqual(problem2.answer, 53)
        XCTAssertEqual(problem2.displayText, "? − 18 = 35")
    }

    func testTwoStepAnswerRespectsPrecedence() {
        // 4 + 3 × 2 = 10 (not 14)
        let problem = MathProblem(operation: .addition, a: 4, b: 3, c: 2, kind: .twoStep)
        XCTAssertEqual(problem.answer, 10)
        // 20 − 3 × 4 = 8
        let problem2 = MathProblem(operation: .subtraction, a: 20, b: 3, c: 4, kind: .twoStep)
        XCTAssertEqual(problem2.answer, 8)
    }

    // MARK: Similar problems after a tutorial

    func testGenerateSimilarKeepsOperationAndDiffers() {
        var rng = SeededGenerator(seed: 7)
        let cfg = config(Set(MathOperation.allCases), range: .r50, difficulty: .medium)
        for _ in 0..<200 {
            let original = ProblemGenerator.generate(config: cfg, avoiding: nil, using: &rng)
            let similar = ProblemGenerator.generateSimilar(to: original, config: cfg, using: &rng)
            XCTAssertEqual(similar.operation, original.operation)
            XCTAssertNotEqual(similar, original)
            XCTAssertEqual(similar.kind, .standard, "Post-tutorial problems should be plain")
        }
    }

    func testMixedOperationsOnlyDrawFromSelection() {
        let cfg = config([.addition, .division], range: .r30, difficulty: .medium)
        for p in generateMany(cfg) {
            XCTAssertTrue([.addition, .division].contains(p.operation))
        }
    }
}

import XCTest
@testable import MatematykaTosi

final class RewardsAndMilestoneTests: XCTestCase {

    // MARK: Milestones (every 5 correct answers)

    func testMilestoneEveryFiveCorrectAnswers() {
        for count in 1...30 {
            let expected = count % 5 == 0
            XCTAssertEqual(MilestoneEngine.isMilestone(correctCount: count), expected,
                           "correctCount \(count)")
        }
        XCTAssertFalse(MilestoneEngine.isMilestone(correctCount: 0))
    }

    func testMilestoneNumbersAndEscalatingTiers() {
        XCTAssertEqual(MilestoneEngine.milestoneNumber(correctCount: 5), 1)
        XCTAssertEqual(MilestoneEngine.milestoneNumber(correctCount: 20), 4)
        // Tiers escalate 1…5 and then stay at the maximum.
        XCTAssertEqual(MilestoneEngine.tier(milestoneNumber: 1), 1)
        XCTAssertEqual(MilestoneEngine.tier(milestoneNumber: 3), 3)
        XCTAssertEqual(MilestoneEngine.tier(milestoneNumber: 5), 5)
        XCTAssertEqual(MilestoneEngine.tier(milestoneNumber: 9), 5)
    }

    // MARK: Trophy ladder (every 10 coins)

    func testTrophyLadderHasAtLeastTenEscalatingTrophies() {
        XCTAssertGreaterThanOrEqual(TrophyLadder.all.count, 10)
        // Strictly ascending 10, 20, 30, …
        for (i, trophy) in TrophyLadder.all.enumerated() {
            XCTAssertEqual(trophy.coins, (i + 1) * 10)
        }
    }

    func testTrophyUnlocksExactlyAtMultiplesOfTen() {
        XCTAssertNil(TrophyLadder.unlocked(atCoins: 9))
        XCTAssertEqual(TrophyLadder.unlocked(atCoins: 10)?.namePL, "Garniec złota")
        XCTAssertNil(TrophyLadder.unlocked(atCoins: 11))
        XCTAssertEqual(TrophyLadder.unlocked(atCoins: 50)?.namePL, "Skrzynia z koroną")
    }

    func testHighestAndNextTrophy() {
        XCTAssertNil(TrophyLadder.highest(forCoins: 5))
        XCTAssertEqual(TrophyLadder.highest(forCoins: 34)?.coins, 30)
        XCTAssertEqual(TrophyLadder.next(forCoins: 34)?.coins, 40)
        XCTAssertEqual(TrophyLadder.next(forCoins: 0)?.coins, 10)
    }

    // MARK: Badges

    func testMultiplicationMasterBadgeAtFiftyCorrect() {
        let now = Date()
        let attempts = (0..<50).map { _ in
            AttemptData(date: now, operation: .multiplication, difficulty: .medium, range: 30,
                        tries: 1, timeToCorrect: 4, tutorialShown: false, correct: true)
        }
        let earned = BadgeEngine.badges(attempts: attempts, coins: 0, bestStreak: 0)
        XCTAssertTrue(earned.first { $0.id == "mulMaster" }!.earned)
        XCTAssertFalse(earned.first { $0.id == "addMaster" }!.earned)

        let almostThere = BadgeEngine.badges(attempts: Array(attempts.dropFirst()), coins: 0, bestStreak: 0)
        XCTAssertFalse(almostThere.first { $0.id == "mulMaster" }!.earned)
    }

    func testCoinAndStreakBadges() {
        let badges = BadgeEngine.badges(attempts: [], coins: 25, bestStreak: 10)
        XCTAssertTrue(badges.first { $0.id == "firstCoin" }!.earned)
        XCTAssertTrue(badges.first { $0.id == "collector" }!.earned)
        XCTAssertTrue(badges.first { $0.id == "streak10" }!.earned)
        XCTAssertFalse(badges.first { $0.id == "hundred" }!.earned)
    }

    // MARK: Praise phrases

    func testPraiseBankHasAtLeastTwentyFivePhrases() {
        XCTAssertGreaterThanOrEqual(PraiseBank.all.count, 25)
    }

    func testPraiseNeverRepeatsBackToBack() {
        var rng = SeededGenerator(seed: 99)
        var last = -1
        for _ in 0..<2000 {
            let next = PraiseBank.next(after: last, using: &rng)
            XCTAssertNotEqual(next, last)
            last = next
        }
    }

    func testPraiseUsesVocativeForTosia() {
        let phrase = PraiseBank.all[0] // "Brawo, %V!"
        XCTAssertEqual(phrase.text(language: .pl, name: "Tosia"), "Brawo, Tosiu!")
        XCTAssertEqual(phrase.text(language: .en, name: "Tosia"), "Bravo, Tosia!")
    }

    func testPolishVocativeHeuristics() {
        XCTAssertEqual(PolishGrammar.vocative("Tosia"), "Tosiu")
        XCTAssertEqual(PolishGrammar.vocative("Kasia"), "Kasiu")
        XCTAssertEqual(PolishGrammar.vocative("Ola"), "Olu")
        XCTAssertEqual(PolishGrammar.vocative("Marta"), "Marto")
        XCTAssertEqual(PolishGrammar.vocative("Anna"), "Anno")
        // Names outside the pattern stay unchanged.
        XCTAssertEqual(PolishGrammar.vocative("Alex"), "Alex")
    }

    func testSomePhrasesCarryFancyWordExplanations() {
        let fancy = PraiseBank.all.filter { $0.fancyWord != nil }
        XCTAssertGreaterThanOrEqual(fancy.count, 5,
            "Rich-vocabulary phrases with child-friendly meanings should exist")
        for phrase in fancy {
            XCTAssertFalse(phrase.fancyWord!.meaningPL.isEmpty)
            XCTAssertFalse(phrase.fancyWord!.meaningEN.isEmpty)
        }
    }

    // MARK: Tutorial plans

    func testTutorialPlanForCrossingAdditionDecomposesIntoTens() {
        let plan = TutorialPlan.make(for: MathProblem(operation: .addition, a: 36, b: 27))
        // 36 + 27 → decompose 27 → jump +20 → jump +7 → reveal 63.
        XCTAssertTrue(plan.steps.contains(.decompose(number: 27, tens: 20, ones: 7)))
        XCTAssertTrue(plan.steps.contains(.numberLine(start: 36, jump: 20, subtract: false)))
        XCTAssertTrue(plan.steps.contains(.numberLine(start: 56, jump: 7, subtract: false)))
        guard case .reveal(_, let answer) = plan.steps.last else {
            return XCTFail("Plan must end with a reveal")
        }
        XCTAssertEqual(answer, 63)
    }

    func testTutorialPlanForSubtractionJumpsBackward() {
        let plan = TutorialPlan.make(for: MathProblem(operation: .subtraction, a: 63, b: 27))
        XCTAssertTrue(plan.steps.contains(.numberLine(start: 63, jump: 20, subtract: true)))
        XCTAssertTrue(plan.steps.contains(.numberLine(start: 43, jump: 7, subtract: true)))
    }

    func testTutorialPlanForMultiplicationUsesGroups() {
        let plan = TutorialPlan.make(for: MathProblem(operation: .multiplication, a: 4, b: 6))
        XCTAssertTrue(plan.steps.contains(.groups(count: 4, size: 6)))
        guard case .reveal(let statement, let answer) = plan.steps.last else {
            return XCTFail("Plan must end with a reveal")
        }
        XCTAssertEqual(answer, 24)
        XCTAssertTrue(statement.contains("24"))
    }

    func testTutorialPlanForDivisionUsesFairSharing() {
        let plan = TutorialPlan.make(for: MathProblem(operation: .division, a: 24, b: 4))
        XCTAssertTrue(plan.steps.contains(.sharing(total: 24, baskets: 4)))
        guard case .reveal(_, let answer) = plan.steps.last else {
            return XCTFail("Plan must end with a reveal")
        }
        XCTAssertEqual(answer, 6)
    }

    func testTutorialPlanForMissingOperandTeachesTheInverse() {
        // 7 × ? = 56 → taught as 56 ÷ 7.
        let plan = TutorialPlan.make(for: MathProblem(operation: .multiplication, a: 7, b: 8, kind: .missingB))
        XCTAssertTrue(plan.steps.contains(.sharing(total: 56, baskets: 7)))
        guard case .reveal(_, let answer) = plan.steps.last else {
            return XCTFail("Plan must end with a reveal")
        }
        XCTAssertEqual(answer, 8)
    }

    func testEveryTutorialPlanEndsWithTheCorrectAnswer() {
        var rng = SeededGenerator(seed: 5)
        let cfg = SessionConfig(operations: Set(MathOperation.allCases), range: .r100, difficulty: .genius)
        for _ in 0..<400 {
            let problem = ProblemGenerator.generate(config: cfg, avoiding: nil, using: &rng)
            let plan = TutorialPlan.make(for: problem)
            guard case .reveal(_, let answer) = plan.steps.last else {
                XCTFail("No reveal for \(problem.displayText)")
                continue
            }
            XCTAssertEqual(answer, problem.answer, "Tutorial answer mismatch for \(problem.displayText)")
            XCTAssertGreaterThanOrEqual(plan.steps.count, 2)
        }
    }
}

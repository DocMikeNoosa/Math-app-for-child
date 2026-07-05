import Foundation

/// A coin trophy. `base` is the main visual, `badge` a small decoration
/// drawn over its corner (all system emoji — no copyrighted characters,
/// no network assets).
struct Trophy: Equatable, Identifiable {
    let coins: Int
    let base: String
    let badge: String
    let namePL: String
    let nameEN: String
    var id: Int { coins }
}

/// The escalating trophy series — a new, more magnificent trophy every
/// 10 coins.
enum TrophyLadder {

    static let all: [Trophy] = [
        Trophy(coins: 10, base: "🏺", badge: "✨", namePL: "Garniec złota", nameEN: "Pot of gold"),
        Trophy(coins: 20, base: "🏺", badge: "❤️", namePL: "Wielki garniec z sercem", nameEN: "Big gold pot with a heart"),
        Trophy(coins: 30, base: "🏺", badge: "🌈", namePL: "Garniec z tęczą", nameEN: "Pot with a rainbow"),
        Trophy(coins: 40, base: "💰", badge: "💎", namePL: "Skrzynia skarbów", nameEN: "Treasure chest"),
        Trophy(coins: 50, base: "💰", badge: "👑", namePL: "Skrzynia z koroną", nameEN: "Chest with a crown"),
        Trophy(coins: 60, base: "👑", badge: "💎", namePL: "Królewska korona", nameEN: "Royal crown"),
        Trophy(coins: 70, base: "💎", badge: "✨", namePL: "Wielki diament", nameEN: "Grand diamond"),
        Trophy(coins: 80, base: "🏰", badge: "🌟", namePL: "Złoty zamek", nameEN: "Golden castle"),
        Trophy(coins: 90, base: "🦄", badge: "👑", namePL: "Złoty jednorożec", nameEN: "Golden unicorn"),
        Trophy(coins: 100, base: "🏆", badge: "🌈", namePL: "Tęczowy puchar mistrzyni", nameEN: "Rainbow champion's cup"),
        Trophy(coins: 110, base: "🚀", badge: "⭐", namePL: "Gwiezdna rakieta", nameEN: "Star rocket"),
        Trophy(coins: 120, base: "🌟", badge: "🪄", namePL: "Magiczna supergwiazda", nameEN: "Magical superstar"),
    ]

    /// Trophy unlocked exactly at this coin count (nil if the count is not a
    /// trophy milestone).
    static func unlocked(atCoins coins: Int) -> Trophy? {
        all.first { $0.coins == coins }
    }

    /// The best trophy earned so far.
    static func highest(forCoins coins: Int) -> Trophy? {
        all.last { $0.coins <= coins }
    }

    /// The next trophy to look forward to.
    static func next(forCoins coins: Int) -> Trophy? {
        all.first { $0.coins > coins }
    }
}

// MARK: - Milestone / celebration tiers

enum MilestoneEngine {
    /// Every 5 correct answers in a session is a milestone.
    static let milestoneSize = 5

    static func isMilestone(correctCount: Int) -> Bool {
        correctCount > 0 && correctCount % milestoneSize == 0
    }

    /// 1-based milestone number for a correct-answer count (5 → 1, 10 → 2 …).
    static func milestoneNumber(correctCount: Int) -> Int {
        correctCount / milestoneSize
    }

    /// Celebration escalation tier 1…5: each successive milestone in a
    /// session is bigger, capped at tier 5.
    static func tier(milestoneNumber: Int) -> Int {
        min(max(milestoneNumber, 1), 5)
    }
}

// MARK: - Badges

struct FunBadge: Equatable, Identifiable {
    let id: String
    let emoji: String
    let namePL: String
    let nameEN: String
    let descPL: String
    let descEN: String
    let earned: Bool
}

enum BadgeEngine {
    static func badges(attempts: [AttemptData], coins: Int, bestStreak: Int) -> [FunBadge] {
        let correct = attempts.filter { $0.correct }
        func correctCount(_ op: MathOperation) -> Int {
            correct.filter { $0.operation == op }.count
        }
        return [
            FunBadge(id: "firstCoin", emoji: "🪙",
                     namePL: "Pierwsza moneta", nameEN: "First coin",
                     descPL: "Zdobądź pierwszą złotą monetę", descEN: "Earn your first gold coin",
                     earned: coins >= 1),
            FunBadge(id: "addMaster", emoji: "➕",
                     namePL: "Mistrzyni dodawania", nameEN: "Addition master",
                     descPL: "50 dobrych odpowiedzi z dodawania", descEN: "50 correct additions",
                     earned: correctCount(.addition) >= 50),
            FunBadge(id: "subMaster", emoji: "➖",
                     namePL: "Mistrzyni odejmowania", nameEN: "Subtraction master",
                     descPL: "50 dobrych odpowiedzi z odejmowania", descEN: "50 correct subtractions",
                     earned: correctCount(.subtraction) >= 50),
            FunBadge(id: "mulMaster", emoji: "✖️",
                     namePL: "Mistrzyni mnożenia", nameEN: "Multiplication master",
                     descPL: "50 dobrych odpowiedzi z mnożenia", descEN: "50 correct multiplications",
                     earned: correctCount(.multiplication) >= 50),
            FunBadge(id: "divMaster", emoji: "➗",
                     namePL: "Mistrzyni dzielenia", nameEN: "Division master",
                     descPL: "50 dobrych odpowiedzi z dzielenia", descEN: "50 correct divisions",
                     earned: correctCount(.division) >= 50),
            FunBadge(id: "hundred", emoji: "💯",
                     namePL: "Setka!", nameEN: "One hundred!",
                     descPL: "100 rozwiązanych zadań", descEN: "100 problems solved",
                     earned: correct.count >= 100),
            FunBadge(id: "streak10", emoji: "🔥",
                     namePL: "Płomień", nameEN: "On fire",
                     descPL: "10 dobrych odpowiedzi z rzędu", descEN: "10 correct answers in a row",
                     earned: bestStreak >= 10),
            FunBadge(id: "lightning", emoji: "⚡",
                     namePL: "Szybka jak błyskawica", nameEN: "Lightning fast",
                     descPL: "10 odpowiedzi szybciej niż w 5 sekund", descEN: "10 answers faster than 5 seconds",
                     earned: correct.filter { $0.timeToCorrect > 0 && $0.timeToCorrect <= 5 }.count >= 10),
            FunBadge(id: "collector", emoji: "💛",
                     namePL: "Kolekcjonerka", nameEN: "Collector",
                     descPL: "Zbierz 25 złotych monet", descEN: "Collect 25 gold coins",
                     earned: coins >= 25),
            FunBadge(id: "learner", emoji: "🌱",
                     namePL: "Dzielna uczennica", nameEN: "Brave learner",
                     descPL: "Ukończ 5 samouczków — na błędach też się uczymy!",
                     descEN: "Finish 5 tutorials — mistakes teach us too!",
                     earned: attempts.filter { $0.tutorialShown }.count >= 5),
        ]
    }
}

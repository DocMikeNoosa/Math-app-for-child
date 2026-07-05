import SwiftUI

/// In-app localization. The parent can switch Polski/English at runtime from
/// the settings, independent of the system locale, so strings are resolved
/// through this value (injected into the environment) rather than through
/// locale-bound catalogs.
struct L10n {
    var lang: AppLanguage
    var childName: String

    /// Name in the Polish vocative for direct address ("Tosiu!").
    var vocative: String { lang == .pl ? PolishGrammar.vocative(childName) : childName }

    /// One-off strings: `t.pick("po polsku", "in English")`.
    func pick(_ pl: String, _ en: String) -> String { lang == .pl ? pl : en }

    // MARK: Common
    var next: String { pick("Dalej →", "Next →") }
    var back: String { pick("Wstecz", "Back") }
    var done: String { pick("Gotowe", "Done") }
    var cancel: String { pick("Anuluj", "Cancel") }
    var check: String { pick("Sprawdź", "Check") }

    // MARK: Screen 1 — operations
    var whatPractice: String { pick("Co dziś ćwiczymy?", "What are we practicing today?") }
    func operationName(_ op: MathOperation) -> String {
        switch op {
        case .addition: return pick("Dodawanie", "Addition")
        case .subtraction: return pick("Odejmowanie", "Subtraction")
        case .multiplication: return pick("Mnożenie", "Multiplication")
        case .division: return pick("Dzielenie", "Division")
        }
    }
    var random: String { pick("Losowo", "Random") }

    // MARK: Screen 2 — range
    var whatRange: String { pick("Do jakiej liczby liczymy?", "What numbers are we going up to?") }
    func rangeLabel(_ range: NumberRange) -> String { pick("do \(range.rawValue)", "up to \(range.rawValue)") }

    // MARK: Screen 3 — difficulty
    var chooseLevel: String { pick("Wybierz poziom", "Choose your level") }
    func difficultyName(_ d: Difficulty) -> String {
        switch d {
        case .easy: return pick("Łatwy", "Easy")
        case .medium: return pick("Średni", "Medium")
        case .hard: return pick("Trudny", "Hard")
        case .genius: return pick("Geniusz", "Genius")
        }
    }
    func difficultyHint(_ d: Difficulty) -> String {
        switch d {
        case .easy: return pick("Bez przekraczania dziesiątki, mnożenie przez 2, 5 i 10",
                                "No crossing the tens, times 2, 5 and 10")
        case .medium: return pick("Przekraczanie progu, tabliczka do 5×5",
                                  "Crossing the tens, tables up to 5×5")
        case .hard: return pick("Cały zakres i trudne mnożenie: 6, 7, 8, 9",
                                "Full range and hard tables: 6, 7, 8, 9")
        case .genius: return pick("Zagadki z okienkiem i działania dwuetapowe!",
                                  "Missing-number puzzles and two-step problems!")
        }
    }

    // MARK: Practice
    var tryAgain: String { pick("Spróbuj jeszcze raz, \(vocative)! 💪", "Try again, \(childName)! 💪") }
    var almostThere: String { pick("Jeszcze chwilka — spójrz na podpowiedź! 🌟",
                                   "Almost there — look at the hint! 🌟") }
    var whatDoesItMean: String { pick("Co to znaczy?", "What does it mean?") }

    /// Subtle hint after the second wrong try — points at tens/ones or the
    /// picture behind the operation.
    func hint(for problem: MathProblem) -> String {
        switch problem.operation {
        case .addition:
            return pick("💡 Najpierw dziesiątki, potem jedności: \(problem.a) = \(problem.a / 10 * 10) + \(problem.a % 10), \(problem.b) = \(problem.b / 10 * 10) + \(problem.b % 10)",
                        "💡 Tens first, then ones: \(problem.a) = \(problem.a / 10 * 10) + \(problem.a % 10), \(problem.b) = \(problem.b / 10 * 10) + \(problem.b % 10)")
        case .subtraction:
            return pick("💡 Odejmij najpierw dziesiątki, potem jedności: \(problem.b) = \(problem.b / 10 * 10) + \(problem.b % 10)",
                        "💡 Subtract the tens first, then the ones: \(problem.b) = \(problem.b / 10 * 10) + \(problem.b % 10)")
        case .multiplication:
            return pick("💡 To \(problem.a) grup po \(problem.b). Możesz dodawać: \(problem.b) + \(problem.b) + …",
                        "💡 That's \(problem.a) groups of \(problem.b). You can add: \(problem.b) + \(problem.b) + …")
        case .division:
            return pick("💡 Rozdziel \(problem.a) po równo na \(problem.b) koszyków",
                        "💡 Share \(problem.a) equally into \(problem.b) baskets")
        }
    }

    // MARK: Tutorial
    var letsSeeTogether: String { pick("Zobaczmy to razem! 🧡", "Let's look at it together! 🧡") }
    var newProblem: String { pick("Nowe zadanie!", "New problem!") }

    // MARK: Celebration
    var collectCoin: String { pick("Zbierz złotą monetę!", "Collect your gold coin!") }
    var onward: String { pick("Dalej!", "Onward!") }
    var newTrophy: String { pick("Nowe trofeum!", "New trophy!") }

    // MARK: Treasures
    var myTreasures: String { pick("Moje skarby", "My Treasures") }
    var coins: String { pick("Złote monety", "Gold coins") }
    var trophies: String { pick("Trofea", "Trophies") }
    var badges: String { pick("Odznaki", "Badges") }
    var bestStreak: String { pick("Najlepsza seria", "Best streak") }
    var favoriteTheme: String { pick("Ulubiony motyw świętowania", "Favorite celebration theme") }

    // MARK: Parent zone
    var parentZone: String { pick("Strefa rodzica", "Parent zone") }
    var enterPin: String { pick("Podaj kod rodzica", "Enter parent code") }
    var wrongPin: String { pick("Nieprawidłowy kod — spróbuj ponownie", "Wrong code — try again") }
    var forgotPin: String { pick("Nie pamiętam kodu", "I forgot the code") }
    var statistics: String { pick("Statystyki", "Statistics") }
    var timeLimit: String { pick("Dzienny limit czasu", "Daily time limit") }
    var certificates: String { pick("Dyplomy", "Certificates") }
    var language: String { pick("Język / Language", "Language / Język") }

    // MARK: Time limit
    var timeForToday: String {
        pick("Świetna praca na dziś, \(vocative)! Do zobaczenia jutro! 🌙",
             "Great work for today, \(childName)! See you tomorrow! 🌙")
    }
    var fiveMinutesLeft: String {
        pick("Jeszcze 5 minutek zabawy! ⏰", "5 more minutes of fun! ⏰")
    }

    // MARK: Stats time frames
    func frameName(_ frame: Int) -> String {
        switch frame {
        case 0: return pick("Dzisiaj", "Today")
        case 1: return pick("Tydzień", "Week")
        case 2: return pick("Miesiąc", "Month")
        case 3: return pick("Od zawsze", "All time")
        default: return pick("Zakres własny", "Custom range")
        }
    }
}

// MARK: Environment plumbing

private struct L10nKey: EnvironmentKey {
    static let defaultValue = L10n(lang: .pl, childName: "Tosia")
}

extension EnvironmentValues {
    var l10n: L10n {
        get { self[L10nKey.self] }
        set { self[L10nKey.self] = newValue }
    }
}

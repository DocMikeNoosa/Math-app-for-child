import Foundation

/// One celebration phrase. `%V` is replaced with the child's name in the
/// Polish vocative ("Tosiu"), `%N` with the plain name ("Tosia").
struct PraisePhrase: Equatable, Identifiable {
    let id: Int
    let pl: String
    let en: String
    /// A richer/less common word worth being curious about, with a
    /// child-friendly one-line meaning (shown behind a tiny 💬 button).
    let fancyWord: FancyWord?

    struct FancyWord: Equatable {
        let word: String
        let meaningPL: String
        let meaningEN: String
    }

    func text(language: AppLanguage, name: String) -> String {
        let template = language == .pl ? pl : en
        let vocative = language == .pl ? PolishGrammar.vocative(name) : name
        return template
            .replacingOccurrences(of: "%V", with: vocative)
            .replacingOccurrences(of: "%N", with: name)
    }
}

enum AppLanguage: String, Codable, CaseIterable, Identifiable {
    case pl, en
    var id: String { rawValue }
    var displayName: String { self == .pl ? "Polski" : "English" }
}

enum PolishGrammar {
    /// Heuristic vocative for Polish first names ("Tosia" → "Tosiu",
    /// "Marta" → "Marto"). Names that don't fit the pattern stay unchanged.
    static func vocative(_ name: String) -> String {
        let n = name.trimmingCharacters(in: .whitespaces)
        guard n.count > 2 else { return n }
        let lower = n.lowercased()
        guard lower.hasSuffix("a") else { return n }
        let softEndings = ["sia", "cia", "zia", "nia", "dzia", "la"]
        if softEndings.contains(where: { lower.hasSuffix($0) }) {
            return String(n.dropLast()) + "u"
        }
        return String(n.dropLast()) + "o"
    }
}

/// Pool of 28 rotating praise phrases. `next(after:)` never returns the same
/// index twice in a row.
enum PraiseBank {

    static func next(after lastIndex: Int, using rng: inout some RandomNumberGenerator) -> Int {
        guard all.count > 1 else { return 0 }
        var index = Int.random(in: 0..<all.count, using: &rng)
        while index == lastIndex {
            index = Int.random(in: 0..<all.count, using: &rng)
        }
        return index
    }

    static func phrase(at index: Int) -> PraisePhrase {
        all[((index % all.count) + all.count) % all.count]
    }

    static let all: [PraisePhrase] = [
        PraisePhrase(id: 0, pl: "Brawo, %V!", en: "Bravo, %V!", fancyWord: nil),
        PraisePhrase(id: 1, pl: "Świetna robota, %V!", en: "Great job, %V!", fancyWord: nil),
        PraisePhrase(id: 2, pl: "Jesteś niesamowita, %V!", en: "You're amazing, %V!", fancyWord: nil),
        PraisePhrase(id: 3, pl: "%N — mistrzyni matematyki!", en: "%N — math champion!", fancyWord: nil),
        PraisePhrase(id: 4, pl: "Fenomenalnie, %V!", en: "Phenomenal, %V!",
                     fancyWord: .init(word: "fenomenalnie",
                                      meaningPL: "tak wspaniale, że aż trudno uwierzyć!",
                                      meaningEN: "so wonderful it's hard to believe!")),
        PraisePhrase(id: 5, pl: "Kapitalnie!", en: "Splendid!",
                     fancyWord: .init(word: "kapitalnie",
                                      meaningPL: "naprawdę, naprawdę świetnie!",
                                      meaningEN: "really, really great!")),
        PraisePhrase(id: 6, pl: "Rewelacja, %V!", en: "Sensational, %V!",
                     fancyWord: .init(word: "rewelacja",
                                      meaningPL: "coś tak dobrego, że wszyscy o tym mówią",
                                      meaningEN: "something so good everyone talks about it")),
        PraisePhrase(id: 7, pl: "Ekstra! Tak trzymaj, %V!", en: "Awesome! Keep it up, %V!", fancyWord: nil),
        PraisePhrase(id: 8, pl: "Znakomicie, %V!", en: "Excellent, %V!",
                     fancyWord: .init(word: "znakomicie",
                                      meaningPL: "bardzo, bardzo dobrze",
                                      meaningEN: "very, very well")),
        PraisePhrase(id: 9, pl: "Imponująco, %V!", en: "Impressive, %V!",
                     fancyWord: .init(word: "imponująco",
                                      meaningPL: "tak dobrze, że aż robi wrażenie",
                                      meaningEN: "so good it makes an impression")),
        PraisePhrase(id: 10, pl: "Brawurowo, %V!", en: "Daring and brilliant, %V!",
                     fancyWord: .init(word: "brawurowo",
                                      meaningPL: "odważnie i po mistrzowsku",
                                      meaningEN: "bravely and masterfully")),
        PraisePhrase(id: 11, pl: "Perfekcyjnie, %V!", en: "Perfect, %V!",
                     fancyWord: .init(word: "perfekcyjnie",
                                      meaningPL: "bez ani jednego błędu",
                                      meaningEN: "without a single mistake")),
        PraisePhrase(id: 12, pl: "Wyśmienicie, %V!", en: "Superb, %V!",
                     fancyWord: .init(word: "wyśmienicie",
                                      meaningPL: "wyjątkowo dobrze — jak pyszny deser!",
                                      meaningEN: "exceptionally well — like a delicious dessert!")),
        PraisePhrase(id: 13, pl: "Mistrzowsko, %V!", en: "Masterful, %V!",
                     fancyWord: .init(word: "mistrzowsko",
                                      meaningPL: "jak prawdziwa mistrzyni",
                                      meaningEN: "like a true champion")),
        PraisePhrase(id: 14, pl: "Koncertowo, %V!", en: "A virtuoso move, %V!",
                     fancyWord: .init(word: "koncertowo",
                                      meaningPL: "tak pięknie, jak na wspaniałym koncercie",
                                      meaningEN: "as beautifully as at a great concert")),
        PraisePhrase(id: 15, pl: "Genialnie, %V!", en: "Genius, %V!", fancyWord: nil),
        PraisePhrase(id: 16, pl: "Super! To było szybkie, %V!", en: "Super! That was fast, %V!", fancyWord: nil),
        PraisePhrase(id: 17, pl: "Wspaniale, %V!", en: "Wonderful, %V!", fancyWord: nil),
        PraisePhrase(id: 18, pl: "Tak jest! Dokładnie tak, %V!", en: "Yes! Exactly right, %V!", fancyWord: nil),
        PraisePhrase(id: 19, pl: "Cudownie, %V!", en: "Marvelous, %V!", fancyWord: nil),
        PraisePhrase(id: 20, pl: "Doskonale, %V!", en: "Flawless, %V!",
                     fancyWord: .init(word: "doskonale",
                                      meaningPL: "najlepiej, jak tylko się da",
                                      meaningEN: "the best it can possibly be")),
        PraisePhrase(id: 21, pl: "%N potrafi wszystko!", en: "%N can do anything!", fancyWord: nil),
        PraisePhrase(id: 22, pl: "Bomba! Dobra robota, %V!", en: "Boom! Nice work, %V!", fancyWord: nil),
        PraisePhrase(id: 23, pl: "Pięknie policzone, %V!", en: "Beautifully calculated, %V!", fancyWord: nil),
        PraisePhrase(id: 24, pl: "Nikt nie liczy tak jak %N!", en: "Nobody counts like %N!", fancyWord: nil),
        PraisePhrase(id: 25, pl: "Bezbłędnie, %V!", en: "Faultless, %V!",
                     fancyWord: .init(word: "bezbłędnie",
                                      meaningPL: "bez żadnego, nawet malutkiego błędu",
                                      meaningEN: "without even the tiniest mistake")),
        PraisePhrase(id: 26, pl: "Hura! Kolejny sukces, %V!", en: "Hooray! Another success, %V!", fancyWord: nil),
        PraisePhrase(id: 27, pl: "Celująco, %V!", en: "Top marks, %V!",
                     fancyWord: .init(word: "celująco",
                                      meaningPL: "na najwyższą możliwą ocenę w szkole",
                                      meaningEN: "worth the highest grade in school")),
    ]

    /// Milestone (every-5) celebration headlines — also always name her.
    static let milestoneHeadlines: [(pl: String, en: String)] = [
        ("Wspaniale, %V!", "Wonderful, %V!"),
        ("%N, jesteś gwiazdą! ⭐", "%N, you're a star! ⭐"),
        ("Niesamowite, %V!", "Incredible, %V!"),
        ("Brawo, %V! Co za seria!", "Bravo, %V! What a streak!"),
        ("%N — królowa liczb! 👑", "%N — queen of numbers! 👑"),
        ("Fantastycznie, %V!", "Fantastic, %V!"),
        ("%N, matematyka Cię kocha! 💜", "%N, math loves you! 💜"),
    ]

    static func milestoneHeadline(
        milestoneNumber: Int, language: AppLanguage, name: String
    ) -> String {
        let entry = milestoneHeadlines[milestoneNumber % milestoneHeadlines.count]
        let template = language == .pl ? entry.pl : entry.en
        let vocative = language == .pl ? PolishGrammar.vocative(name) : name
        return template
            .replacingOccurrences(of: "%V", with: vocative)
            .replacingOccurrences(of: "%N", with: name)
    }
}

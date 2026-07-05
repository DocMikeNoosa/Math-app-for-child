import Foundation
import Security
import CryptoKit

/// Keychain-backed storage for the parent PIN and the PIN-recovery
/// security question. The PIN itself is stored in the Keychain; the recovery
/// answer is stored as a SHA-256 hash of its normalized form.
enum PinStore {

    private static let service = "com.tosia.MatematykaTosi"
    private static let pinKey = "parentPIN"
    private static let questionKey = "recoveryQuestion"
    private static let answerHashKey = "recoveryAnswerHash"

    // MARK: PIN

    static var hasPin: Bool { read(pinKey) != nil }

    static func setPin(_ pin: String) {
        save(pin, key: pinKey)
    }

    static func verify(pin: String) -> Bool {
        guard let stored = read(pinKey) else { return false }
        return stored == pin
    }

    // MARK: Recovery question

    static func setRecovery(question: String, answer: String) {
        save(question, key: questionKey)
        save(hash(answer), key: answerHashKey)
    }

    static var recoveryQuestion: String? { read(questionKey) }

    static func verifyRecovery(answer: String) -> Bool {
        guard let stored = read(answerHashKey) else { return false }
        return stored == hash(answer)
    }

    /// Used by "reset progress" — clears everything so onboarding runs again.
    static func wipe() {
        delete(pinKey)
        delete(questionKey)
        delete(answerHashKey)
    }

    private static func hash(_ answer: String) -> String {
        let normalized = answer.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let digest = SHA256.hash(data: Data(normalized.utf8))
        return digest.map { String(format: "%02x", $0) }.joined()
    }

    // MARK: Keychain plumbing

    private static func baseQuery(_ key: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
    }

    private static func save(_ value: String, key: String) {
        delete(key)
        var query = baseQuery(key)
        query[kSecValueData as String] = Data(value.utf8)
        query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        SecItemAdd(query as CFDictionary, nil)
    }

    private static func read(_ key: String) -> String? {
        var query = baseQuery(key)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess, let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    private static func delete(_ key: String) {
        SecItemDelete(baseQuery(key) as CFDictionary)
    }
}

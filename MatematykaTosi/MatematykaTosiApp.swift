import SwiftUI
import SwiftData

@main
struct MatematykaTosiApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: [AppState.self, AttemptRecord.self, UsageSession.self])
    }
}

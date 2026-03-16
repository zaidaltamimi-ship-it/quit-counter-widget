import Foundation

/// Bridge utility to sync quit date from Capacitor app to the widget via App Groups.
/// Call this from a Capacitor plugin or from the main app's AppDelegate.
struct AppGroupBridge {
    static let appGroupID = "group.app.lovable.quitcounter"
    
    /// Save the quit date so the widget can read it
    static func saveQuitDate(_ date: Date) {
        let defaults = UserDefaults(suiteName: appGroupID)
        defaults?.set(date, forKey: "quitDate")
        // Tell WidgetKit to refresh
        if #available(iOS 14.0, *) {
            WidgetKit.shared?.reloadAllTimelines()
        }
    }
    
    /// Read the quit date (used by widget)
    static func getQuitDate() -> Date? {
        let defaults = UserDefaults(suiteName: appGroupID)
        return defaults?.object(forKey: "quitDate") as? Date
    }
}

import Foundation
import Capacitor
import WidgetKit

/// Capacitor plugin that bridges the web app's quit date to the native widget.
/// Register this plugin in your AppDelegate or via a Capacitor plugin loader.
///
/// Usage from JavaScript:
///   import { registerPlugin } from '@capacitor/core';
///   const QuitWidget = registerPlugin('QuitWidget');
///   await QuitWidget.syncQuitDate({ timestamp: Date.now() });
///
@objc(QuitWidgetPlugin)
public class QuitWidgetPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "QuitWidgetPlugin"
    public let jsName = "QuitWidget"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "syncQuitDate", returnType: CAPPluginReturnPromise)
    ]
    
    @objc func syncQuitDate(_ call: CAPPluginCall) {
        guard let timestamp = call.getDouble("timestamp") else {
            call.reject("Missing 'timestamp' parameter")
            return
        }
        
        let quitDate = Date(timeIntervalSince1970: timestamp / 1000.0)
        let defaults = UserDefaults(suiteName: "group.app.lovable.quitcounter")
        defaults?.set(quitDate, forKey: "quitDate")
        
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        call.resolve(["synced": true])
    }
}

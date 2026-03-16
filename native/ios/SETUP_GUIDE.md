# Lock Screen Widget Setup Guide

## Prerequisites
- Mac with Xcode 15+
- Apple Developer account
- Project exported to GitHub and pulled locally
- Capacitor iOS platform added (`npx cap add ios`)

## Step-by-Step Setup

### 1. Open the Xcode Project
```bash
npx cap open ios
```

### 2. Create the Widget Extension
1. In Xcode: **File → New → Target**
2. Select **Widget Extension**
3. Name it `QuitCounterWidget`
4. Uncheck "Include Configuration App Intent" (we use `StaticConfiguration`)
5. Click **Finish**

### 3. Add App Group Capability
You need to add the App Group to BOTH the main app target and the widget target:

1. Select the **main app target** → Signing & Capabilities → + Capability → **App Groups**
2. Add group: `group.app.lovable.quitcounter`
3. Select the **QuitCounterWidget target** → Signing & Capabilities → + Capability → **App Groups**
4. Add the same group: `group.app.lovable.quitcounter`

### 4. Copy the Swift Files
Replace the auto-generated widget code with the files from this directory:

```bash
# From project root:
cp native/ios/QuitCounterWidget/QuitCounterWidget.swift ios/App/QuitCounterWidget/
cp native/ios/QuitCounterWidget/AppGroupBridge.swift ios/App/QuitCounterWidget/
cp native/ios/QuitCounterWidget/CapacitorBridgePlugin.swift ios/App/App/
```

### 5. Register the Capacitor Plugin
In `ios/App/App/AppDelegate.swift`, add the plugin registration. Alternatively, create a file `ios/App/App/QuitWidgetPlugin.m`:

```objc
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(QuitWidgetPlugin, "QuitWidget",
    CAP_PLUGIN_METHOD(syncQuitDate, CAPPluginReturnPromise);
)
```

### 6. Sync from JavaScript
In your web app, whenever the quit date changes, call:

```typescript
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

const QuitWidget = registerPlugin('QuitWidget');

// Call this when quit date is set/changed
if (Capacitor.isNativePlatform()) {
  await QuitWidget.syncQuitDate({ timestamp: quitDate.getTime() });
}
```

### 7. Build & Run
```bash
npm run build
npx cap sync ios
```
Then run from Xcode on a real device (widgets don't work well in simulator).

## Widget Sizes Supported
- **Lock Screen Circular**: Shows days count
- **Lock Screen Rectangular**: Shows days, hours, minutes
- **Lock Screen Inline**: Single line "12d 5h 30m smoke free"
- **Home Screen Small**: Large day counter with hours/minutes

## Troubleshooting
- **Widget shows placeholder data**: Make sure App Group IDs match exactly
- **Widget doesn't update**: Call `WidgetCenter.shared.reloadAllTimelines()` after saving data
- **Build errors**: Ensure the widget target's deployment target matches your main app (iOS 16+)

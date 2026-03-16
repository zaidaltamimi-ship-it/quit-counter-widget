import WidgetKit
import SwiftUI

// MARK: - Shared Data

struct QuitData {
    static let appGroupID = "group.app.lovable.quitcounter"
    
    static var quitDate: Date? {
        let defaults = UserDefaults(suiteName: appGroupID)
        return defaults?.object(forKey: "quitDate") as? Date
    }
}

// MARK: - Timeline Provider

struct QuitCounterProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuitCounterEntry {
        QuitCounterEntry(date: Date(), quitDate: Date().addingTimeInterval(-86400 * 7))
    }
    
    func getSnapshot(in context: Context, completion: @escaping (QuitCounterEntry) -> Void) {
        let entry = QuitCounterEntry(
            date: Date(),
            quitDate: QuitData.quitDate ?? Date().addingTimeInterval(-86400 * 7)
        )
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<QuitCounterEntry>) -> Void) {
        let now = Date()
        let quitDate = QuitData.quitDate ?? now
        
        // Update every minute for a live feel
        var entries: [QuitCounterEntry] = []
        for minuteOffset in 0..<60 {
            let entryDate = Calendar.current.date(byAdding: .minute, value: minuteOffset, to: now)!
            entries.append(QuitCounterEntry(date: entryDate, quitDate: quitDate))
        }
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

// MARK: - Timeline Entry

struct QuitCounterEntry: TimelineEntry {
    let date: Date
    let quitDate: Date
    
    var elapsed: (days: Int, hours: Int, minutes: Int) {
        let diff = max(0, date.timeIntervalSince(quitDate))
        let totalMinutes = Int(diff / 60)
        let days = totalMinutes / 1440
        let hours = (totalMinutes % 1440) / 60
        let minutes = totalMinutes % 60
        return (days, hours, minutes)
    }
}

// MARK: - Widget Views

struct QuitCounterWidgetEntryView: View {
    var entry: QuitCounterEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .accessoryCircular:
            accessoryCircularView
        case .accessoryRectangular:
            accessoryRectangularView
        case .accessoryInline:
            accessoryInlineView
        case .systemSmall:
            systemSmallView
        default:
            systemSmallView
        }
    }
    
    // Lock Screen — circular widget
    var accessoryCircularView: some View {
        VStack(spacing: 1) {
            Text("\(entry.elapsed.days)")
                .font(.system(.title, design: .rounded, weight: .bold))
            Text("DAYS")
                .font(.system(.caption2, design: .rounded, weight: .medium))
                .textCase(.uppercase)
        }
    }
    
    // Lock Screen — rectangular widget
    var accessoryRectangularView: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("🚭 Smoke Free")
                .font(.system(.caption, design: .rounded, weight: .semibold))
            HStack(spacing: 8) {
                timeBlock(value: entry.elapsed.days, unit: "d")
                timeBlock(value: entry.elapsed.hours, unit: "h")
                timeBlock(value: entry.elapsed.minutes, unit: "m")
            }
            .font(.system(.body, design: .monospaced, weight: .bold))
        }
    }
    
    // Lock Screen — inline widget (single line)
    var accessoryInlineView: some View {
        Text("🚭 \(entry.elapsed.days)d \(entry.elapsed.hours)h \(entry.elapsed.minutes)m smoke free")
    }
    
    // Home Screen — small widget
    var systemSmallView: some View {
        VStack(spacing: 8) {
            Text("🚭")
                .font(.largeTitle)
            
            Text("\(entry.elapsed.days)")
                .font(.system(size: 42, weight: .bold, design: .rounded))
                .foregroundColor(.green)
            
            Text("days smoke free")
                .font(.system(.caption, design: .rounded))
                .foregroundColor(.secondary)
            
            HStack(spacing: 4) {
                Text("\(entry.elapsed.hours)h")
                Text("\(entry.elapsed.minutes)m")
            }
            .font(.system(.caption2, design: .monospaced, weight: .medium))
            .foregroundColor(.secondary)
        }
        .padding()
    }
    
    func timeBlock(value: Int, unit: String) -> some View {
        Text("\(value)\(unit)")
    }
}

// MARK: - Widget Configuration

@main
struct QuitCounterWidget: Widget {
    let kind: String = "QuitCounterWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuitCounterProvider()) { entry in
            if #available(iOS 17.0, *) {
                QuitCounterWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                QuitCounterWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Quit Counter")
        .description("Track your smoke-free journey right from your Lock Screen.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
            .systemSmall
        ])
    }
}

// MARK: - Preview

#Preview(as: .accessoryRectangular) {
    QuitCounterWidget()
} timeline: {
    QuitCounterEntry(date: Date(), quitDate: Date().addingTimeInterval(-86400 * 12 - 3600 * 5))
}

import SwiftUI

@main
struct MicroBreaksApp: App {
    @StateObject private var tracker = BreakTracker.shared
    
    var body: some Scene {
        MenuBarExtra("MicroBreaks", systemImage: "figure.walk") {
            VStack(alignment: .leading, spacing: 0) {
                // Mode selection
                Button(action: { tracker.setMode(.keystrokes) }) {
                    HStack {
                        Text("Keystrokes")
                        Spacer()
                        if tracker.mode == .keystrokes {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                
                Button(action: { tracker.setMode(.time) }) {
                    HStack {
                        Text("Time")
                        Spacer()
                        if tracker.mode == .time {
                            Image(systemName: "checkmark")
                        }
                    }
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                
                Divider()
                
                // Settings for current mode
                if tracker.mode == .keystrokes {
                    Menu("Threshold: \(tracker.keystrokeThreshold)") {
                        Button("500") { tracker.setKeystrokeThreshold(500) }
                        Button("1,000") { tracker.setKeystrokeThreshold(1000) }
                        Button("2,000") { tracker.setKeystrokeThreshold(2000) }
                        Button("3,000") { tracker.setKeystrokeThreshold(3000) }
                        Button("5,000") { tracker.setKeystrokeThreshold(5000) }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    
                    Text("Count: \(tracker.keystrokeCount)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.horizontal, 12)
                        .padding(.bottom, 6)
                } else {
                    Menu("Interval: \(tracker.timeInterval) min") {
                        Button("10 min") { tracker.setTimeInterval(10) }
                        Button("15 min") { tracker.setTimeInterval(15) }
                        Button("20 min") { tracker.setTimeInterval(20) }
                        Button("30 min") { tracker.setTimeInterval(30) }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    
                    if let next = tracker.nextBreakTime {
                        Text("Next: \(timeString(next))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 12)
                            .padding(.bottom, 6)
                    }
                }
                
                Divider()
                
                Button("Quit") {
                    NSApp.terminate(nil)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
            }
            .frame(width: 220)
        }
    }
    
    private func timeString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

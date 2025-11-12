import AppKit
import ApplicationServices
import UserNotifications
import Foundation

final class BreakTracker: NSObject, ObservableObject {
    static let shared = BreakTracker()
    
    enum Mode: String, Codable {
        case keystrokes
        case time
    }
    
    @Published var mode: Mode = .keystrokes
    @Published var keystrokeThreshold: Int = 3000
    @Published var keystrokeCount: Int = 0
    @Published var timeInterval: Int = 15 // minutes
    @Published var nextBreakTime: Date?
    @Published var debugLogging: Bool = false
    
    private var isOnBreak = false
    private var eventTap: CFMachPort?
    private var globalMonitor: Any?
    private var localMonitor: Any?
    private var timeCheckTimer: Timer?
    private var breakTimer: Timer?
    private var healthCheckTimer: Timer?
    private var lastKeystrokeTime: Date?
    
    private override init() {
        super.init()
        loadSettings()
        requestNotificationAuth()
        startTracking()
        startHealthCheck()
    }
    
    // MARK: - Mode & Settings
    func setMode(_ newMode: Mode) {
        mode = newMode
        keystrokeCount = 0
        if mode == .time {
            nextBreakTime = Date().addingTimeInterval(TimeInterval(timeInterval * 60))
        } else {
            nextBreakTime = nil
        }
        saveSettings()
    }
    
    func setKeystrokeThreshold(_ threshold: Int) {
        keystrokeThreshold = threshold
        saveSettings()
    }
    
    func setTimeInterval(_ minutes: Int) {
        timeInterval = minutes
        if mode == .time {
            nextBreakTime = Date().addingTimeInterval(TimeInterval(timeInterval * 60))
        }
        saveSettings()
    }
    
    // MARK: - Tracking
    private func startTracking() {
        setupEventTap()
        setupNSEventMonitors()
        
        // Time check every 30s
        timeCheckTimer = Timer.scheduledTimer(withTimeInterval: 30.0, repeats: true) { [weak self] _ in
            self?.checkTimeBreak()
        }
        if let timer = timeCheckTimer {
            RunLoop.main.add(timer, forMode: .common)
        }
        
        if mode == .time {
            nextBreakTime = Date().addingTimeInterval(TimeInterval(timeInterval * 60))
        }
    }
    
    private func setupEventTap() {
        let trusted = AXIsProcessTrusted()
        
        guard trusted else {
            
            // Show prompt only on first run
            let hasShownPrompt = UserDefaults.standard.bool(forKey: "HasShownAccessibilityPrompt")
            if !hasShownPrompt {
                DispatchQueue.main.async {
                    let alert = NSAlert()
                    alert.messageText = "Accessibility Permission Required"
                    alert.informativeText = "MicroBreaks needs Accessibility permission to monitor keystrokes.\n\n1. Open System Settings\n2. Go to Privacy & Security > Accessibility\n3. Enable MicroBreaks\n4. Restart the app"
                    alert.alertStyle = .informational
                    alert.addButton(withTitle: "Open System Settings")
                    alert.addButton(withTitle: "Later")
                    
                    let response = alert.runModal()
                    if response == .alertFirstButtonReturn {
                        NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")!)
                    }
                    
                    UserDefaults.standard.set(true, forKey: "HasShownAccessibilityPrompt")
                }
            }
            
            return
        }
        
        let mask = (1 << CGEventType.keyDown.rawValue)
        let callback: CGEventTapCallBack = { proxy, type, event, userInfo in
            guard type == .keyDown else { return Unmanaged.passUnretained(event) }
            if let userInfo = userInfo {
                let tracker = Unmanaged<BreakTracker>.fromOpaque(userInfo).takeUnretainedValue()
                DispatchQueue.main.async {
                    tracker.handleKeystroke(source: "CGEventTap")
                }
            }
            return Unmanaged.passUnretained(event)
        }
        
        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(mask),
            callback: callback,
            userInfo: Unmanaged.passUnretained(self).toOpaque()
        ) else {
            return
        }
        
        eventTap = tap
        let runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
    }
    
    private func setupNSEventMonitors() {
        // CGEvent tap is working, so we don't need NSEvent monitors
        // Keeping this method for fallback if needed
        return
    }
    
    private func handleKeystroke(source: String) {
        lastKeystrokeTime = Date()
        
        guard mode == .keystrokes, !isOnBreak else {
            return
        }
        
        keystrokeCount += 1
        
        if keystrokeCount >= keystrokeThreshold {
            keystrokeCount = 0
            triggerBreak()
        }
    }
    
    private func startHealthCheck() {
        healthCheckTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { [weak self] _ in
            guard let self = self else { return }
            
            let hasGlobal = self.globalMonitor != nil
            let hasLocal = self.localMonitor != nil
            
            // Re-install monitors if they're missing
            if !hasGlobal || !hasLocal {
                self.setupNSEventMonitors()
            }
        }
        
        if let timer = healthCheckTimer {
            RunLoop.main.add(timer, forMode: .common)
        }
    }
    
    private func checkTimeBreak() {
        guard mode == .time, !isOnBreak else { return }
        guard let next = nextBreakTime, Date() >= next else { return }
        triggerBreak()
        nextBreakTime = Date().addingTimeInterval(TimeInterval(timeInterval * 60))
    }
    
    // MARK: - Break
    private func triggerBreak() {
        isOnBreak = true
        notify(title: "Take a break!", body: "Stretch your hands for 20 seconds")
        
        breakTimer?.invalidate()
        breakTimer = Timer.scheduledTimer(withTimeInterval: 20.0, repeats: false) { [weak self] _ in
            self?.endBreak()
        }
        if let timer = breakTimer {
            RunLoop.main.add(timer, forMode: .common)
        }
    }
    
    private func endBreak() {
        isOnBreak = false
        notify(title: "Break complete", body: "Back to work!")
    }
    
    // MARK: - Notifications
    private func requestNotificationAuth() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }
    
    private func notify(title: String, body: String) {
        
        // Direct shell command (most reliable)
        let command = "osascript -e 'display notification \"\(body)\" with title \"\(title)\" sound name \"Funk\"'"
        let task = Process()
        task.launchPath = "/bin/sh"
        task.arguments = ["-c", command]
        task.launch()
        
        // Fallback: AppleScript via Process
        sendAppleScriptNotification(title: title, body: body)
        
        // Fallback: UserNotifications framework
        sendUserNotification(title: title, body: body)
    }
    
    private func sendAppleScriptNotification(title: String, body: String) {
        let escapedTitle = title.replacingOccurrences(of: "\"", with: "\\\"")
        let escapedBody = body.replacingOccurrences(of: "\"", with: "\\\"")
        let script = "display notification \"\(escapedBody)\" with title \"\(escapedTitle)\" sound name \"default\""
        
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
        task.arguments = ["-e", script]
        try? task.run()
    }
    
    private func sendUserNotification(title: String, body: String) {
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        content.interruptionLevel = .timeSensitive
        
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: nil
        )
        
        UNUserNotificationCenter.current().add(request) { _ in }
    }
    
    // MARK: - Persistence
    private func loadSettings() {
        if let savedMode = UserDefaults.standard.string(forKey: "breakMode"),
           let m = Mode(rawValue: savedMode) {
            mode = m
        }
        keystrokeThreshold = UserDefaults.standard.object(forKey: "keystrokeThreshold") as? Int ?? 3000
        timeInterval = UserDefaults.standard.object(forKey: "timeInterval") as? Int ?? 15
        debugLogging = UserDefaults.standard.bool(forKey: "debugLogging")
    }
    
    private func saveSettings() {
        UserDefaults.standard.set(mode.rawValue, forKey: "breakMode")
        UserDefaults.standard.set(keystrokeThreshold, forKey: "keystrokeThreshold")
        UserDefaults.standard.set(timeInterval, forKey: "timeInterval")
        UserDefaults.standard.set(debugLogging, forKey: "debugLogging")
    }
    
    deinit {
        if let tap = eventTap {
            CGEvent.tapEnable(tap: tap, enable: false)
        }
        if let monitor = globalMonitor {
            NSEvent.removeMonitor(monitor)
        }
        if let monitor = localMonitor {
            NSEvent.removeMonitor(monitor)
        }
        timeCheckTimer?.invalidate()
        breakTimer?.invalidate()
        healthCheckTimer?.invalidate()
    }
}

extension BreakTracker: UNUserNotificationCenterDelegate {
    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound])
    }
}

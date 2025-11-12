# MicroBreaks

A lightweight macOS menu bar app that helps prevent RSI (Repetitive Strain Injury) by reminding you to take regular breaks.

![MicroBreaks Demo](Microbreaks.gif)

## Features

- **Menu Bar Integration**: Unobtrusive menu bar presence with quick access to settings
- **Dual Tracking Modes**: 
  - Keystroke mode: Triggers break after configurable keystrokes (500/1K/2K/3K/5K)
  - Time mode: Triggers break after set intervals (10/15/20/30 minutes)
- **Smart Break System**: 20-second break notifications with sound
- **Privacy-First**: All tracking happens locally on your device
- **Accessibility Permission**: Uses CGEventTap for reliable keystroke monitoring

## How It Works

MicroBreaks monitors your keyboard activity in the background. When you reach your configured threshold (either keystroke count or time interval), it displays a notification prompting you to take a 20-second break. After the break completes, you'll get a "back to work" notification and the counter resets.

The app automatically:
- Pauses counting during active breaks
- Monitors health of keystroke detection and auto-repairs if needed
- Persists your settings across restarts
- Shows first-run prompt to guide you through Accessibility permission setup

## Installation

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/adeetya-u/no-rsi-mac.git
   cd no-rsi-mac/MicroBreaks
   ```

2. Build the project:
   ```bash
   swift build -c release
   ```

3. Create the app bundle:
   ```bash
   ./build.sh
   ```
   Or manually:
   ```bash
   rm -rf MicroBreaks.app
   mkdir -p MicroBreaks.app/Contents/{MacOS,Resources}
   cp .build/arm64-apple-macosx/release/MicroBreaks MicroBreaks.app/Contents/MacOS/MicroBreaks
   cp Info.plist MicroBreaks.app/Contents/Info.plist
   cp AppIcon.icns MicroBreaks.app/Contents/Resources/AppIcon.icns
   chmod +x MicroBreaks.app/Contents/MacOS/MicroBreaks
   ```

4. Launch the app:
   ```bash
   open MicroBreaks.app
   ```

5. Grant Accessibility permission when prompted (required for keystroke monitoring)

## Usage

1. Click the menu bar icon (walking figure) to access settings
2. Choose your tracking mode:
   - **Keystrokes**: Set threshold (500, 1000, 2000, 3000, or 5000 keystrokes)
   - **Time**: Set interval (10, 15, 20, or 30 minutes)
3. The counter displays in the menu
4. When threshold is reached, take your 20-second break!

## Settings

### Configuration Options

**Keystroke Mode Thresholds:**
- 500 keystrokes (quick breaks)
- 1,000 keystrokes (default)
- 2,000 keystrokes
- 3,000 keystrokes
- 5,000 keystrokes (extended sessions)

**Time Mode Intervals:**
- 10 minutes
- 15 minutes (default)
- 20 minutes
- 30 minutes

**Break Duration:** Fixed 20-second break with notification sound

## Requirements

- macOS 13.0 or later
- Accessibility permission for keystroke monitoring
- Swift 5.9+ (for building from source)

## Privacy

- **100% Local**: No network access, no data collection
- **No Tracking**: Keystroke monitoring only counts keys, doesn't record what you type
- **Secure**: Uses Apple's CGEventTap API with Accessibility permission
- **Open Source**: All code is available for review

## Technical Details

- Built with Swift and SwiftUI
- Uses `CGEventTap` for reliable global keystroke monitoring
- MenuBarExtra for native menu bar integration
- Timer-based health checks ensure monitoring stays active
- Triple-redundant notification system (osascript + UserNotifications)
- Persistent settings via UserDefaults

## Troubleshooting

**Keystroke counting not working:**
1. Check System Settings → Privacy & Security → Accessibility
2. Ensure MicroBreaks is enabled
3. Relaunch the app after granting permission

**Notifications not appearing:**
- The app uses AppleScript notifications which should always work
- Check that notification sound is enabled in System Settings

**App needs permission again after rebuild:**
- This is normal - rebuilding changes the app bundle signature
- Re-grant Accessibility permission in System Settings

## License

MIT License - feel free to modify and distribute

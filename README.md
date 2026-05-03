# MicroBreaks

A simple macOS menu bar app that reminds you to take breaks and stretch your hands.

![MicroBreaks Demo](Microbreaks.gif)

## Why?

Typing for hours without breaks can lead to RSI (Repetitive Strain Injury). MicroBreaks helps by giving you gentle reminders to take 20-second breaks.

## Features

- **Two modes**: Track by keystrokes or time
- **Customizable**: Choose your break frequency
- **Private**: Everything stays on your Mac
- **Simple**: Just sits in your menu bar

## Download

[Download MicroBreaks v1.0](https://github.com/adeetya-u/no-rsi-mac/releases/tag/v1.0)

1. Download `MicroBreaks.app.zip`
2. Unzip and move to Applications
3. Open the app
4. Grant Accessibility permission when prompted (needed to count keystrokes)

## Usage

Click the menu bar icon to:
- Switch between **Keystrokes** mode (500-5000 keys) or **Time** mode (10-30 min)
- See your current progress
- Adjust your break threshold

When you hit your limit, you'll get a notification to stretch for 20 seconds. That's it!

## Building from Source

If you want to build the app yourself:

```bash
# Clone the repo
git clone https://github.com/adeetya-u/no-rsi-mac.git
cd no-rsi-mac/MicroBreaks

# Build the release version
swift build -c release

# Create the app bundle
rm -rf MicroBreaks.app
mkdir -p MicroBreaks.app/Contents/{MacOS,Resources}
cp .build/arm64-apple-macosx/release/MicroBreaks MicroBreaks.app/Contents/MacOS/MicroBreaks
cp Info.plist MicroBreaks.app/Contents/Info.plist
cp AppIcon.icns MicroBreaks.app/Contents/Resources/AppIcon.icns
chmod +x MicroBreaks.app/Contents/MacOS/MicroBreaks

# Launch it
open MicroBreaks.app
```

Grant Accessibility permission when prompted, and you're good to go!

### Viewing Logs

If you want to see what's happening under the hood:

```bash
# Run from terminal to see output
/path/to/MicroBreaks.app/Contents/MacOS/MicroBreaks

# Or view system logs
log stream --predicate 'process == "MicroBreaks"' --level debug
```

The app logs when it initializes, creates the event tap, and counts keystrokes.

## FAQ

**Why does it need Accessibility permission?**  
To count your keystrokes. The app only counts them—it never records what you type.

**Notifications not showing?**  
They should work automatically using AppleScript. Make sure your sound is on!

**Permission reset after rebuilding?**  
This is normal when you rebuild the app. Just re-grant it in System Settings.

## License

MIT

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

```bash
git clone https://github.com/adeetya-u/no-rsi-mac.git
cd no-rsi-mac/MicroBreaks
swift build -c release
```

Then create the app bundle (see full instructions in build script).

## FAQ

**Why does it need Accessibility permission?**  
To count your keystrokes. The app only counts them—it never records what you type.

**Notifications not showing?**  
They should work automatically using AppleScript. Make sure your sound is on!

**Permission reset after rebuilding?**  
This is normal when you rebuild the app. Just re-grant it in System Settings.

## License

MIT

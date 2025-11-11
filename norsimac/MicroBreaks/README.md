# Micro-Breaks

A lightweight, privacy-focused macOS accessibility feature that provides gentle reminders for healthy breaks during long work sessions.

## Features

- **On-device & Private**: All activity monitoring happens locally—no data leaves your Mac
- **Smart Detection**: Tracks keyboard and mouse activity to determine when you're actively working
- **Respectful**: Automatically pauses during fullscreen apps and presentations
- **Accessible**: Fully keyboard-accessible and VoiceOver/Switch Control compatible
- **Minimal & Beautiful**: Ultra-lightweight with Apple's design aesthetic

## How It Works

Micro-Breaks monitors your typing and mouse activity to detect active work sessions. After a configurable interval (10-60 minutes), it prompts you with a gentle reminder to take a short break. The feature automatically:

- Pauses during fullscreen presentations (Keynote, PowerPoint, etc.)
- Detects when you're idle and doesn't prompt during breaks
- Provides accessible, keyboard-only reminders
- Stores all settings locally in your UserDefaults

## Installation

1. Open Terminal and navigate to the MicroBreaks directory
2. Build the project:
   ```bash
   swift build -c release
   ```
3. Run the app from the `.build` directory

## Settings

Accessible via System Settings → Accessibility (coming in a future update), or as a standalone settings window.

### Configuration

- **Work Interval**: Choose how often you want reminders (10, 15, 20, 25, 30, 45, or 60 minutes)
- **Break Duration**: 30-second guided stretches
- **Auto-Pause**: Automatically pauses during fullscreen and presentations

## Privacy

- No network access
- No data collection
- All processing happens on-device
- Uses system-level accessibility APIs for activity monitoring

## Accessibility

- Full VoiceOver support
- Switch Control compatible
- Keyboard-only navigation
- High contrast modes supported
- Screen reader announcements

## Technical Details

- Built with SwiftUI
- Uses `CGEventSource` for privacy-preserving activity monitoring
- Timer-based scheduling for minimal resource usage
- Observes system notification preferences

## License

Copyright © 2024 Apple Inc.

#!/bin/zsh

# MicroBreaks - Reset and Setup Notifications

echo "🔔 Setting up MicroBreaks notifications..."

# Kill any running instance
pkill -x MicroBreaks 2>/dev/null || true
sleep 1

# Build the app
echo "📦 Building MicroBreaks..."
swift build -c release --package-path /Users/adeetyaupadhyay/norsimac/MicroBreaks

# Update the app bundle Info.plist
echo "⚙️  Configuring app bundle..."
cp /Users/adeetyaupadhyay/norsimac/MicroBreaks/Info.plist \
   /Users/adeetyaupadhyay/norsimac/MicroBreaks/.build/release/MicroBreaks.app/Contents/Info.plist

cd /Users/adeetyaupadhyay/norsimac/MicroBreaks/.build/release/MicroBreaks.app/Contents
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable MicroBreaks" Info.plist 2>/dev/null
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.microbreaks.app" Info.plist 2>/dev/null

# Clear notification cache (requires re-granting permission)
echo "🗑️  Clearing notification cache..."
rm -rf ~/Library/Saved\ Application\ State/com.microbreaks.app.savedState 2>/dev/null || true

# Launch the app
echo "🚀 Launching MicroBreaks..."
open /Users/adeetyaupadhyay/norsimac/MicroBreaks/.build/release/MicroBreaks.app

sleep 2

echo ""
echo "✅ MicroBreaks is now running!"
echo ""
echo "📌 Next steps:"
echo "   1. When prompted, click 'Allow' for notifications"
echo "   2. Check System Settings > Notifications > MicroBreaks"
echo "   3. Enable 'Allow Notifications' if not already on"
echo ""
echo "🔍 To verify notifications:"
echo "   - Click the menu bar icon"
echo "   - Set threshold to 100 for quick testing"
echo "   - Type 100 keys to trigger a break notification"

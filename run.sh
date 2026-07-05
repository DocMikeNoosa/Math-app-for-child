#!/usr/bin/env bash
# Matematyka Tosi — one-command build & launch (macOS + Xcode 16+).
#
#   ./run.sh          build the app and launch it in an iPhone simulator
#   ./run.sh test     run the full unit-test suite in the simulator
#
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "❌ Xcode is required. This is a native iOS app — run this script on"
  echo "   macOS with Xcode 16 or newer installed (xcode-select --install)."
  exit 1
fi

# Pick a simulator: prefer one that's already booted, else the newest
# available iPhone.
UDID=$(xcrun simctl list devices available --json | python3 -c '
import json, sys
data = json.load(sys.stdin)
booted, iphones = None, []
for runtime, devices in data["devices"].items():
    if "iOS" not in runtime:
        continue
    for d in devices:
        if "iPhone" in d["name"] and d.get("isAvailable", False):
            iphones.append((runtime, d["name"], d["udid"]))
            if d["state"] == "Booted":
                booted = d["udid"]
if booted:
    print(booted)
elif iphones:
    iphones.sort()
    print(iphones[-1][2])
')
if [ -z "$UDID" ]; then
  echo "❌ No available iPhone simulator found. Open Xcode ▸ Settings ▸"
  echo "   Platforms and install an iOS simulator runtime."
  exit 1
fi

echo "📱 Using simulator $UDID"
xcrun simctl boot "$UDID" 2>/dev/null || true
open -a Simulator || true

if [ "${1:-run}" = "test" ]; then
  echo "🧪 Running unit tests…"
  xcodebuild test \
    -project MatematykaTosi.xcodeproj \
    -scheme MatematykaTosi \
    -destination "id=$UDID" \
    -derivedDataPath build
  exit 0
fi

echo "🔨 Building…"
xcodebuild build \
  -project MatematykaTosi.xcodeproj \
  -scheme MatematykaTosi \
  -configuration Debug \
  -destination "id=$UDID" \
  -derivedDataPath build \
  -quiet

APP="build/Build/Products/Debug-iphonesimulator/MatematykaTosi.app"
echo "📦 Installing…"
xcrun simctl install "$UDID" "$APP"
echo "🚀 Launching…"
xcrun simctl launch "$UDID" com.tosia.MatematykaTosi
echo "✅ Matematyka Tosi is running in the simulator. Miłej zabawy, Tosiu! 🎉"

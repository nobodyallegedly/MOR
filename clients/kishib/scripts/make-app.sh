#!/bin/sh
# Make "Kishib.app" (shown as Kišib) in ~/Applications (macOS): double-click it to start the
# program, if it is not running, and open its page, paired by a one-time
# link. Run once, from this folder, after `npm install` here and in ../desk
# and ../dub (whose server, launcher and fonts Kišib shares):
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either
# moves. It is not signed or notarised (as Dub, README). The program's
# folder is ~/mor-kishib: it holds only which browsers are paired, and the
# runner's file, encrypted, while the runner is on or locked.
#
# Kišib's seal in the menu bar (the Dubsar runner cMIP, draft 3, section 10):
# a small Swift helper (seal/main.swift), built here into the app where
# Apple's command-line tools are present (xcode-select --install), and started
# with Kišib. Without them, Kišib works the same, with no seal: said below.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Kišib uses its server"; exit 1; }
app="$HOME/Applications/Kishib.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
# Its icon, drawn in static/icon/kishib.svg and made by scripts/make-icons.ts in clients/dub.
cp "$here/static/icon/kishib.icns" "$app/Contents/Resources/AppIcon.icns"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Kišib</string>
<key>CFBundleDisplayName</key><string>Kišib</string>
<key>CFBundleIdentifier</key><string>org.dubsar.kishib</string>
<key>CFBundleExecutable</key><string>kishib</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
seal="$app/Contents/MacOS/kishib-seal"
# A seal left running from an earlier build is stopped before its file is replaced.
pkill -f "$seal" 2>/dev/null || true
rm -f "$seal"
if command -v xcrun >/dev/null 2>&1 && xcrun --find swiftc >/dev/null 2>&1; then
  if xcrun swiftc -O -o "$seal" "$here/seal/main.swift"; then
    echo "made Kišib's seal in the menu bar"
  else
    echo "Kišib's seal did not build (above): Kišib works, without its seal in the menu bar."
  fi
else
  echo "Apple's command-line tools are not installed (xcode-select --install), so Kišib's seal in the menu bar is not built: Kišib works without it. Run this script again once they are."
fi
cat > "$app/Contents/MacOS/kishib" <<SCRIPT
#!/bin/sh
cd "$here" && "$node" --import tsx src/cli.ts open >> "\$HOME/mor-kishib-launcher.log" 2>&1
# Its seal in the menu bar, once: started with Kišib if built and not already there.
if [ -x "$seal" ] && ! pgrep -f "$seal" >/dev/null 2>&1; then
  nohup "$seal" >/dev/null 2>&1 &
fi
SCRIPT
chmod +x "$app/Contents/MacOS/kishib"
# Finder reads an app's icon again once the app is newer than what it remembers.
touch "$app"
echo "made $app"

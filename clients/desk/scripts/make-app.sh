#!/bin/sh
# Make "MOR Desk.app" in ~/Applications (macOS): double-click it to
# start the desk, if it is not running, and open its page,
# paired by a one-time link. Run once, from this folder, after `npm install`:
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either moves.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
app="$HOME/Applications/MOR Desk.app"
mkdir -p "$app/Contents/MacOS"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>MOR Desk</string>
<key>CFBundleIdentifier</key><string>org.dubsar.mor-desk</string>
<key>CFBundleExecutable</key><string>mor-desk</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/mor-desk" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-desk-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/mor-desk"
echo "made $app"

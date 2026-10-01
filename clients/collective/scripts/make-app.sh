#!/bin/sh
# Make "MOR Collective.app" in ~/Applications (macOS): double-click it to
# start the collective client, if it is not running, and open its page,
# paired by a one-time link. Run once, from this folder, after `npm install`:
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either moves.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
app="$HOME/Applications/MOR Collective.app"
mkdir -p "$app/Contents/MacOS"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>MOR Collective</string>
<key>CFBundleIdentifier</key><string>org.dubsar.mor-collective</string>
<key>CFBundleExecutable</key><string>mor-collective</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/mor-collective" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-collective-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/mor-collective"
echo "made $app"

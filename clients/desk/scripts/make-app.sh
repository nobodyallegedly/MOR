#!/bin/sh
# Make "MOR Identities.app" in ~/Applications (macOS): double-click it to
# start the program, if it is not running, and open its page, paired by a
# one-time link. Run once, from this folder, after `npm install`:
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either moves.
# The app was called "MOR Desk" until 2 October 2026: that one is removed, if
# this script made it. The program's folder stays ~/mor-desk.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
old="$HOME/Applications/MOR Desk.app"
if [ -f "$old/Contents/Info.plist" ] && grep -q "org.dubsar.mor-desk<" "$old/Contents/Info.plist"; then
  rm -rf "$old"
  echo "removed $old (the same app under its earlier name)"
fi
app="$HOME/Applications/MOR Identities.app"
mkdir -p "$app/Contents/MacOS"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>MOR Identities</string>
<key>CFBundleDisplayName</key><string>MOR Identities</string>
<key>CFBundleIdentifier</key><string>org.dubsar.mor-identities</string>
<key>CFBundleExecutable</key><string>mor-identities</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/mor-identities" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-desk-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/mor-identities"
echo "made $app"

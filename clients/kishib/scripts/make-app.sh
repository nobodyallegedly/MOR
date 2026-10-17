#!/bin/sh
# Make "Kishib.app" (shown as Kišib) in ~/Applications (macOS): double-click it to start the
# program, if it is not running, and open its page, paired by a one-time
# link. Run once, from this folder, after `npm install` here and in ../desk
# and ../dub (whose server, launcher and fonts Kišib shares):
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either
# moves. It is not signed or notarised (as Dub, README). The program's
# folder is ~/mor-kishib: it holds only which browsers are paired.
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
cat > "$app/Contents/MacOS/kishib" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-kishib-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/kishib"
# Finder reads an app's icon again once the app is newer than what it remembers.
touch "$app"
echo "made $app"

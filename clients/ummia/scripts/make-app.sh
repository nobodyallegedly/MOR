#!/bin/sh
# Make "Ummia.app" (shown as Ummia) in ~/Applications (macOS): double-click it to start the
# program, if it is not running, and open its page, paired by a one-time
# link. Run once, from this folder, after `npm install` here and in ../desk
# and ../dub (whose server, launcher and fonts Ummia shares):
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either
# moves. It is not signed or notarised (as Dub, README). The program's
# folder is ~/mor-ummia: its identities brought by their signing words, and
# each one's book (its releases, specifications, MIP drafts, reports, and
# the blinds of the anchors it asked for).
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Ummia uses its server and its folder picker"; exit 1; }
app="$HOME/Applications/Ummia.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
# Its icon, drawn in static/icon/ummia.svg and made by scripts/make-icons.ts in clients/dub.
cp "$here/static/icon/ummia.icns" "$app/Contents/Resources/AppIcon.icns"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Ummia</string>
<key>CFBundleDisplayName</key><string>Ummia</string>
<key>CFBundleIdentifier</key><string>org.dubsar.ummia</string>
<key>CFBundleExecutable</key><string>ummia</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/ummia" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-ummia-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/ummia"
# Finder reads an app's icon again once the app is newer than what it remembers.
touch "$app"
echo "made $app"

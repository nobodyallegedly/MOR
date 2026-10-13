#!/bin/sh
# Make "Dub.app" in ~/Applications (macOS): double-click it to start the
# program, if it is not running, and open its page, paired by a one-time
# link. Run once, from this folder, after `npm install` here and in ../desk
# (whose server and launcher Dub shares):
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either
# moves. It is not signed or notarised (README, "Signing and notarising").
# The program's folder is ~/mor-dub, or ~/mor-poster if an install from
# before the rename has one and ~/mor-dub does not exist (README, "Moving
# from MOR Post").
#
# Dub was called MOR Post until 13 October 2026, in clients/poster. The app
# that name's script made runs code that is no longer there: it is removed
# here, and only if it is that app.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Dub uses its server"; exit 1; }
old="$HOME/Applications/MOR Post.app"
if [ -f "$old/Contents/MacOS/mor-post" ] && grep -q "clients/poster" "$old/Contents/MacOS/mor-post"; then
  rm -rf "$old"
  echo "removed $old (MOR Post is now Dub)"
fi
app="$HOME/Applications/Dub.app"
mkdir -p "$app/Contents/MacOS"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Dub</string>
<key>CFBundleDisplayName</key><string>Dub</string>
<key>CFBundleIdentifier</key><string>org.dubsar.dub</string>
<key>CFBundleExecutable</key><string>dub</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/dub" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-dub-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/dub"
echo "made $app"

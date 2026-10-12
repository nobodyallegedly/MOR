#!/bin/sh
# Make "MOR Post.app" in ~/Applications (macOS): double-click it to start
# the program, if it is not running, and open its page, paired by a
# one-time link. Run once, from this folder, after `npm install` here and in
# ../desk (whose server and launcher MOR Post shares):
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either
# moves. It is not signed or notarised (README, "Signing and notarising").
# The program's folder is ~/mor-poster.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: MOR Post uses its server"; exit 1; }
app="$HOME/Applications/MOR Post.app"
mkdir -p "$app/Contents/MacOS"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>MOR Post</string>
<key>CFBundleDisplayName</key><string>MOR Post</string>
<key>CFBundleIdentifier</key><string>org.dubsar.mor-post</string>
<key>CFBundleExecutable</key><string>mor-post</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/mor-post" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-poster-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/mor-post"
echo "made $app"

#!/bin/sh
# Make "Edubba.app" in ~/Applications (macOS): double-click it to start the
# program, if it is not running, and open its page, paired by a one-time
# link. Run once, from this folder, after `npm install`:
#   sh scripts/make-app.sh
# The app remembers where Node and this folder are; run it again if either moves.
# Edubba was called "MOR Identities" until 16 October 2026 ("MOR Desk" until
# 2 October 2026), and took the collective client in ("MOR Collective"):
# those apps are removed, if these scripts made them. The folders stay where
# they are (~/mor-desk, ~/mor-collective), read by Edubba.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
for pair in "MOR Desk|org.dubsar.mor-desk<" "MOR Identities|org.dubsar.mor-identities<" "MOR Collective|org.dubsar.mor-collective<"; do
  old="$HOME/Applications/${pair%%|*}.app"
  if [ -f "$old/Contents/Info.plist" ] && grep -q "${pair#*|}" "$old/Contents/Info.plist"; then
    rm -rf "$old"
    echo "removed $old (now part of Edubba)"
  fi
done
app="$HOME/Applications/Edubba.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
# Its icon (H25), drawn in static/icon/edubba.svg and made by scripts/make-icons.ts in clients/dub.
cp "$here/static/icon/edubba.icns" "$app/Contents/Resources/AppIcon.icns"
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Edubba</string>
<key>CFBundleDisplayName</key><string>Edubba</string>
<key>CFBundleIdentifier</key><string>org.dubsar.edubba</string>
<key>CFBundleExecutable</key><string>edubba</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>LSUIElement</key><true/>
</dict></plist>
PLIST
cat > "$app/Contents/MacOS/edubba" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/edubba-launcher.log" 2>&1
SCRIPT
chmod +x "$app/Contents/MacOS/edubba"
# Finder reads an app's icon again once the app is newer than what it remembers.
touch "$app"
echo "made $app"

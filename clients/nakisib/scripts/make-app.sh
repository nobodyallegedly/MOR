#!/bin/sh
# Make Nakišib on the everyday Mac, to carry to the offline Mac (decided by
# Nobody, allegedly, 23 October 2026: "Built on the everyday Mac, carried by
# USB with its fingerprint, checked on the offline Mac before first use. The
# offline Mac never downloads anything."):
#
#   ~/Applications/Nakisib.app          the app (shown as Nakišib), for Apple silicon (arm64)
#   ~/Applications/Nakisib.zip          the app, zipped, to copy to the USB stick
#   ~/Applications/Nakisib.zip.sha256   its SHA-256 fingerprint, to compare on the offline Mac
#
# Run from this folder, on the everyday Mac (an Apple silicon Mac, as the
# offline one), once Rust is installed (as for Kišib's WebAssembly):
#   sh scripts/make-app.sh
#
# The app holds everything it needs: Nakišib's program (Rust, with its page
# inside it) and its window (Swift, built here where Apple's command-line
# tools are present: xcode-select --install). Nothing is downloaded when it
# runs, and it needs nothing installed on the offline Mac. It is not signed
# or notarised (as Kišib and Dub): the offline Mac asks once whether to open
# it (README, "Carrying it"). Its folder on the offline Mac is ~/mor-nakisib:
# its memory of what it signed, nothing secret.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
[ "$(uname -s)" = Darwin ] || { echo "Nakišib.app is made on a Mac (the everyday one), for the offline Mac."; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo "Rust is needed (rustup.rs), on this everyday Mac only."; exit 1; }
target=aarch64-apple-darwin
rustup target add "$target" >/dev/null 2>&1 || true
cargo build --release --locked --manifest-path "$here/Cargo.toml" --target "$target"
apps="$HOME/Applications"
app="$apps/Nakisib.app"
rm -rf "$app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources"
cp "$here/target/$target/release/nakisib" "$app/Contents/MacOS/nakisib-program"
# Its icon, drawn in static/icon/nakisib.svg and made by scripts/make-icons.ts in clients/dub.
cp "$here/static/icon/nakisib.icns" "$app/Contents/Resources/AppIcon.icns"
version=$(sed -n 's/^version = "\(.*\)"/\1/p' "$here/Cargo.toml" | head -1)
cat > "$app/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>Nakišib</string>
<key>CFBundleDisplayName</key><string>Nakišib</string>
<key>CFBundleIdentifier</key><string>org.dubsar.nakisib</string>
<key>CFBundleExecutable</key><string>nakisib</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>$version</string>
<key>CFBundleIconFile</key><string>AppIcon</string>
<key>LSMinimumSystemVersion</key><string>11.0</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST
if command -v xcrun >/dev/null 2>&1 && xcrun --find swiftc >/dev/null 2>&1 && xcrun swiftc -O -target arm64-apple-macos11 -o "$app/Contents/MacOS/nakisib" "$here/window/main.swift"; then
  echo "made Nakišib's window"
else
  # Without its window: the program opens its page in the default browser.
  cat > "$app/Contents/MacOS/nakisib" <<'SCRIPT'
#!/bin/sh
exec "$(dirname "$0")/nakisib-program"
SCRIPT
  chmod +x "$app/Contents/MacOS/nakisib"
  echo "Apple's command-line tools are not installed (xcode-select --install), so Nakišib's window is not built: Nakišib then opens its page in the default browser (Safari), which may keep what a page shows in its own files. Install them and run this script again before carrying Nakišib."
fi
touch "$app"
# The zip to carry, and its fingerprint. ditto keeps the app as macOS needs it.
rm -f "$apps/Nakisib.zip" "$apps/Nakisib.zip.sha256"
(cd "$apps" && ditto -c -k --keepParent Nakisib.app Nakisib.zip && shasum -a 256 Nakisib.zip > Nakisib.zip.sha256)
echo "made $app"
echo "made $apps/Nakisib.zip, its SHA-256:"
cat "$apps/Nakisib.zip.sha256"
echo "Write this fingerprint down by hand (or photograph it with your phone): on the offline Mac, shasum -a 256 must print the same."

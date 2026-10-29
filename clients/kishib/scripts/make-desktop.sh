#!/bin/sh
# Make "Kišib" in the applications menu (Linux), as scripts/make-app.sh makes
# Kišib.app on the Mac: choose it to start the program, if it is not running,
# and open its page, paired by a one-time link. Run once, from this folder,
# after `npm install` here and in ../desk (whose server and launcher Kišib
# shares):
#   sh scripts/make-desktop.sh
# It writes a launcher, ~/.local/share/mor/kishib-launch.sh, which remembers
# where Node and this folder are (run this again if either moves), and
# ~/.local/share/applications/kishib.desktop, which runs it; with a desktop
# folder (xdg-user-dir DESKTOP), a copy there too, marked as trusted where
# the desktop can be told (gio). The browser is opened with xdg-open. Not a
# package: it runs the code where it is, with this repository and Node 22.
# The program's folder is ~/mor-kishib, as on the Mac.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Kišib uses its server"; exit 1; }
data="${XDG_DATA_HOME:-$HOME/.local/share}"
mkdir -p "$data/mor" "$data/applications"
launch="$data/mor/kishib-launch.sh"
cat > "$launch" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-kishib-launcher.log" 2>&1
SCRIPT
chmod +x "$launch"
# Its icon, beside the launcher.
cp "$here/static/icon/kishib.png" "$data/mor/kishib.png"
entry="$data/applications/kishib.desktop"
cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Kišib
Comment=Dubsar Suite, on MOR: where a chain key is used, from paper, and then forgotten (test identities only)
Exec="$launch"
Icon=$data/mor/kishib.png
Terminal=false
Categories=Network;
StartupNotify=false
DESKTOP
chmod +x "$entry"
echo "made $entry"
desk=$(command -v xdg-user-dir >/dev/null 2>&1 && xdg-user-dir DESKTOP || echo "$HOME/Desktop")
if [ -d "$desk" ] && [ "$desk" != "$HOME" ]; then
  cp "$entry" "$desk/kishib.desktop"
  chmod +x "$desk/kishib.desktop"
  command -v gio >/dev/null 2>&1 && gio set "$desk/kishib.desktop" metadata::trusted true 2>/dev/null || true
  echo "made $desk/kishib.desktop"
fi

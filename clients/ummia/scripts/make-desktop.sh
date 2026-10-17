#!/bin/sh
# Make "Ummia" in the applications menu (Linux), as scripts/make-app.sh makes
# Ummia.app on the Mac: choose it to start the program, if it is not running,
# and open its page, paired by a one-time link. Run once, from this folder,
# after `npm install` here and in ../desk (whose server and launcher Ummia
# shares):
#   sh scripts/make-desktop.sh
# It writes a launcher, ~/.local/share/mor/ummia-launch.sh, which remembers
# where Node and this folder are (run this again if either moves), and
# ~/.local/share/applications/ummia.desktop, which runs it; with a desktop
# folder (xdg-user-dir DESKTOP), a copy there too, marked as trusted where
# the desktop can be told (gio). The browser is opened with xdg-open. Not a
# package: it runs the code where it is, with this repository and Node 22.
# The program’s folder is ~/mor-ummia, as on the Mac.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Ummia uses its server"; exit 1; }
data="${XDG_DATA_HOME:-$HOME/.local/share}"
mkdir -p "$data/mor" "$data/applications"
launch="$data/mor/ummia-launch.sh"
cat > "$launch" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-ummia-launcher.log" 2>&1
SCRIPT
chmod +x "$launch"
# Its icon, beside the launcher.
cp "$here/static/icon/ummia.png" "$data/mor/ummia.png"
entry="$data/applications/ummia.desktop"
cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Ummia
Comment=MOR: the developers' app: releases, specifications, tracking, MIPs, reports (test identities only)
Exec="$launch"
Icon=$data/mor/ummia.png
Terminal=false
Categories=Development;
StartupNotify=false
DESKTOP
chmod +x "$entry"
echo "made $entry"
desk=$(command -v xdg-user-dir >/dev/null 2>&1 && xdg-user-dir DESKTOP || echo "$HOME/Desktop")
if [ -d "$desk" ] && [ "$desk" != "$HOME" ]; then
  cp "$entry" "$desk/ummia.desktop"
  chmod +x "$desk/ummia.desktop"
  command -v gio >/dev/null 2>&1 && gio set "$desk/ummia.desktop" metadata::trusted true 2>/dev/null || true
  echo "made $desk/ummia.desktop"
fi

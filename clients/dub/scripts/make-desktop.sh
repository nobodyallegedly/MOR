#!/bin/sh
# Make "Dub" in the applications menu (Linux), as scripts/make-app.sh makes
# Dub.app on the Mac: choose it to start the program, if it is not running,
# and open its page, paired by a one-time link. Run once, from this folder,
# after `npm install` here and in ../desk (whose server and launcher Dub
# shares):
#   sh scripts/make-desktop.sh
# It writes a launcher, ~/.local/share/mor/dub-launch.sh, which remembers
# where Node and this folder are (run this again if either moves), and
# ~/.local/share/applications/dub.desktop, which runs it; with a desktop
# folder (xdg-user-dir DESKTOP), a copy there too, marked as trusted where
# the desktop can be told (gio). The browser is opened with xdg-open. Not a
# package: it runs the code where it is, with this repository and Node 22.
# The program's folder is ~/mor-dub, as on the Mac.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
[ -d "$here/../desk/node_modules" ] || { echo "Run npm install in clients/desk first: Dub uses its server"; exit 1; }
data="${XDG_DATA_HOME:-$HOME/.local/share}"
mkdir -p "$data/mor" "$data/applications"
launch="$data/mor/dub-launch.sh"
cat > "$launch" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/mor-dub-launcher.log" 2>&1
SCRIPT
chmod +x "$launch"
entry="$data/applications/dub.desktop"
cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Dub
Comment=MOR: one person's public and private life (test identities only)
Exec="$launch"
Terminal=false
Categories=Network;
StartupNotify=false
DESKTOP
chmod +x "$entry"
echo "made $entry"
desk=$(command -v xdg-user-dir >/dev/null 2>&1 && xdg-user-dir DESKTOP || echo "$HOME/Desktop")
if [ -d "$desk" ] && [ "$desk" != "$HOME" ]; then
  cp "$entry" "$desk/dub.desktop"
  chmod +x "$desk/dub.desktop"
  command -v gio >/dev/null 2>&1 && gio set "$desk/dub.desktop" metadata::trusted true 2>/dev/null || true
  echo "made $desk/dub.desktop"
fi

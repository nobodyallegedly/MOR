#!/bin/sh
# Make "Edubba" in the applications menu (Linux), as scripts/make-app.sh
# makes Edubba.app on the Mac: choose it to start the program, if it is not
# running, and open its page, paired by a one-time link. Run once, from this
# folder, after `npm install`:
#   sh scripts/make-desktop.sh
# It writes a launcher, ~/.local/share/mor/edubba-launch.sh, which remembers
# where Node and this folder are (run this again if either moves), and
# ~/.local/share/applications/edubba.desktop, which runs it; with a desktop
# folder (xdg-user-dir DESKTOP), a copy there too, marked as trusted where
# the desktop can be told (gio). The browser is opened with xdg-open. Not a
# package: it runs the code where it is, with this repository and Node 22.
# The folders are ~/edubba (or ~/mor-desk) and ~/mor-collective, as on the Mac.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
node=$(command -v node)
[ -n "$node" ] || { echo "Node is needed (22 or later)"; exit 1; }
data="${XDG_DATA_HOME:-$HOME/.local/share}"
mkdir -p "$data/mor" "$data/applications"
launch="$data/mor/edubba-launch.sh"
cat > "$launch" <<SCRIPT
#!/bin/sh
cd "$here" && exec "$node" --import tsx src/cli.ts open >> "\$HOME/edubba-launcher.log" 2>&1
SCRIPT
chmod +x "$launch"
# Its icon (H25), beside the launcher.
cp "$here/static/icon/edubba.png" "$data/mor/edubba.png"
entry="$data/applications/edubba.desktop"
cat > "$entry" <<DESKTOP
[Desktop Entry]
Type=Application
Version=1.0
Name=Edubba
Comment=MOR: agents, identities and collectives (test identities only)
Exec="$launch"
Icon=$data/mor/edubba.png
Terminal=false
Categories=Network;
StartupNotify=false
DESKTOP
chmod +x "$entry"
echo "made $entry"
desk=$(command -v xdg-user-dir >/dev/null 2>&1 && xdg-user-dir DESKTOP || echo "$HOME/Desktop")
if [ -d "$desk" ] && [ "$desk" != "$HOME" ]; then
  cp "$entry" "$desk/edubba.desktop"
  chmod +x "$desk/edubba.desktop"
  command -v gio >/dev/null 2>&1 && gio set "$desk/edubba.desktop" metadata::trusted true 2>/dev/null || true
  echo "made $desk/edubba.desktop"
fi

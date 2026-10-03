#!/usr/bin/env bash
# Stop the regtest network up.sh started in RUN_DIR.
set -uo pipefail
R=${1:?usage: down.sh RUN_DIR}
for p in "$R"/*.pid; do [ -f "$p" ] && kill "$(cat "$p")" 2>/dev/null; done
echo "stopped"

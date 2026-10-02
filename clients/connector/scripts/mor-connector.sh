#!/bin/sh
# What Claude's app starts: the connector, run from its own folder, so that
# it finds its libraries whatever folder the app starts it in. The app may
# not give it the terminal's PATH, so the usual places for Node are added.
here=$(cd "$(dirname "$0")/.." && pwd)
cd "$here" || exit 1
PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
export PATH
exec node --import tsx src/server.ts

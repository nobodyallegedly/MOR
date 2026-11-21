#!/bin/sh
# DubLaw wave 2, session B: rerun every count. Usage: sh run.sh RESEARCH_DIR KIT_DIR OUT_DIR
# RESEARCH_DIR: ~/Documents/mor-round-2/_research (read only). KIT_DIR: tools/postman/kit of the MOR repository at
# 74739bb7 (branch claude/round-2-postman). Needs Node.js and sqlite3. Writes only into OUT_DIR.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$3"
node "$HERE/1-decode.mjs" "$1" "$2" "$3"
node "$HERE/2-texts.mjs" "$1" "$2" "$3"
node "$HERE/3-sockets.mjs" "$3" "$2" > /dev/null
node "$HERE/4-listing.mjs" "$1" "$2" "$3"
node "$HERE/5-points.mjs" "$1" "$3"
node "$HERE/6-write.mjs" "$3" > /dev/null
echo "done: $3/listing-agreements.md, listing-agreements.json, all-acts-index.json"

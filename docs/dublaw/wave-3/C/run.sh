#!/bin/sh
# DubLaw wave 3, session C (Nobody, allegedly): rerun every count of check-wave-2.md.
# Usage: sh run.sh RESEARCH_DIR KIT_DIR WAVE2_RESULTS_DIR MOR_REPO_DIR SCRATCH_DIR OUT_DIR
#   RESEARCH_DIR: ~/Documents/mor-round-2/_research (read only). KIT_DIR: tools/postman/kit of the MOR repository at
#   74739bb7 (branch claude/round-2-postman). WAVE2_RESULTS_DIR: the folder holding wave 2's A/ and B/.
#   MOR_REPO_DIR: a clone of the MOR repository holding commit 5d73191b (read by git show only).
#   SCRATCH_DIR: a folder of your own; the rerun of A and this session's index (about 14 MB) are written there.
# Needs Node.js 22.5 or later (node:sqlite) and Python 3. No sqlite3 command is needed.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
R=$1; KIT=$2; W2=$3; REPO=$4; S=$5; OUT=$6
mkdir -p "$S/rerunA" "$S/idx" "$OUT"
node "$W2/A/scan-apps.mjs" --research "$R" --kit "$KIT" --out "$S/rerunA" > /dev/null
node "$HERE/index.mjs" "$R" "$KIT" "$S/idx"
python3 -I "$HERE/check-a-figures.py" "$W2/A" "$S/rerunA/apps-inventory.json" "$R" "$S/idx/index.json" "$OUT/check-a-figures.json" > /dev/null
node "$HERE/trace-b.mjs" "$S/idx/index.json" "$W2/B/listing-agreements.json" "$KIT" "$OUT/trace-b.json" 20261122 > /dev/null
python3 -I "$HERE/trace-a.py" "$S/idx/index.json" "$W2/A/features-agreements.md" "$OUT/trace-a.json" > /dev/null
node "$HERE/check-claims.mjs" "$R" "$KIT" "$S/idx/index.json" "$W2/B/listing-agreements.json" "$OUT/check-claims.json" "$REPO" > /dev/null
echo "done: $OUT/check-a-figures.json, trace-b.json, trace-a.json, check-claims.json"

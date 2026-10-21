#!/bin/sh
# Rebuild every mockup page, capture it at both sizes, shrink the pictures, write the index.
# Run from the repository root: sh docs/design/mockups/tools/make.sh
# Needs Node 22, clients/dub's npm packages (playwright-core), the pre-installed Chromium and Python 3 with Pillow.
set -e
d=docs/design/mockups
node $d/tools/build.mjs
node $d/tools/shoot.mjs
python3 -I $d/tools/squeeze.py $d/shots/after $d/shots/after 1280 64
node $d/tools/index.mjs

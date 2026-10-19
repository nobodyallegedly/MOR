#!/bin/sh
# Every test in the repository, with one command:
#
#   scripts/test-all.sh                  the Rust workspace and every TypeScript package
#   scripts/test-all.sh --reproducible   also rebuild the published display client and
#                                        check it is the same, byte for byte (slow)
#
# Needs: Rust through rustup (the version is pinned in rust-toolchain.toml and
# installed on first use), Node 22 or later, and wasm-bindgen-cli 0.2.129:
#   cargo install wasm-bindgen-cli --version 0.2.129 --locked
# The site's browser test needs Chromium or Chrome; point MOR_CHROMIUM at it.
# The tests on regtest (the Lightning rail Module's, Damgar's, the test
# wallet's and round 3's end to end) are skipped unless MOR_LN_REGTEST is set (docs/core-pass-v21.md,
# section 5; docs/damgar-regtest.md). Test identities only, never real money.
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

echo "== Rust workspace"
cargo test --workspace --locked

echo "== Core library for the clients (WebAssembly)"
(cd clients/genesis && npm ci --no-audit --no-fund && npm run wasm)

for pkg in clients/* modules/jpeg modules/video modules/carry modules/timestamp; do
  [ -f "$pkg/package.json" ] || continue
  echo "== $pkg"
  # Damgar's tests run Dub, Edubba, Kišib, the test wallet and the anchoring service beside it.
  if [ "$pkg" = clients/damgar ]; then
    for p in desk dub barebone repo collective assess kishib manage anchoring-service testwallet; do (cd "clients/$p" && npm ci --no-audit --no-fund); done
  fi
  # Edubba's run Dub, Damgar, Kišib, Ummia, the test wallet and the split and anchoring services beside it (round 3).
  if [ "$pkg" = clients/desk ]; then
    for p in dub barebone repo collective assess kishib manage anchoring-service testwallet damgar ummia split-service; do (cd "clients/$p" && npm ci --no-audit --no-fund); done
  fi
  # Ummia's run Dub, Edubba, Damgar, Kišib, the anchoring service, the site's listing and the reports mirror beside it.
  if [ "$pkg" = clients/ummia ]; then
    for p in desk dub barebone repo collective assess kishib manage anchoring-service damgar site longform connector reader reports; do (cd "clients/$p" && npm ci --no-audit --no-fund); done
  fi
  (cd "$pkg" && npm ci --no-audit --no-fund && npm test)
done

if [ "$1" = "--reproducible" ]; then
  echo "== Reproducible build of the display client"
  (cd clients/site && npm run test:build)
fi

echo "== All tests passed"

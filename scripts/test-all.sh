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
# The Lightning test on regtest is skipped unless MOR_LN_REGTEST is set
# (docs/core-pass-v21.md, section 5). Test identities only, never real money.
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
cd "$root"

echo "== Rust workspace"
cargo test --workspace --locked

echo "== Core library for the clients (WebAssembly)"
(cd clients/genesis && npm ci --no-audit --no-fund && npm run wasm)

for pkg in clients/* modules/jpeg modules/video; do
  [ -f "$pkg/package.json" ] || continue
  echo "== $pkg"
  (cd "$pkg" && npm ci --no-audit --no-fund && npm test)
done

if [ "$1" = "--reproducible" ]; then
  echo "== Reproducible build of the display client"
  (cd clients/site && npm run test:build)
fi

echo "== All tests passed"

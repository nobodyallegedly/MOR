#!/bin/sh
# Build Kišib's half of the air-gapped chain-key signer Module (airgap/, the
# Module's `online` code) to WebAssembly, with its JavaScript glue, into
# airgap/pkg: used by "Change keys with Nakišib" and "Make an identity with
# Nakišib". Kišib's own: the suite's shared WebAssembly (clients/genesis,
# crate mor-wasm) is not touched. Run by npm before Kišib's tests, its web
# build and its release (package.json: pretest, prebuild, prerelease), and
# by make-app.sh. Needs what the shared one needs (Rust with the
# wasm32-unknown-unknown target, wasm-bindgen-cli 0.2.129).
#
# Reproducible as the shared one is (clients/genesis/scripts/build-wasm.sh):
# this repository's and Cargo's folders replaced by fixed names, the tools'
# names left out.
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
root=$(cd "$here/../.." && pwd)
cargo_home=$(cd "${CARGO_HOME:-$HOME/.cargo}" && pwd)
target="$here/airgap/target"
us=$(printf '\037')
CARGO_ENCODED_RUSTFLAGS="--remap-path-prefix=$root=/mor$us--remap-path-prefix=$cargo_home=/cargo"
export CARGO_ENCODED_RUSTFLAGS
cargo build --quiet --manifest-path "$here/airgap/Cargo.toml" --release --target wasm32-unknown-unknown --locked --target-dir "$target"
wasm-bindgen --target web --remove-producers-section --out-dir "$here/airgap/pkg" "$target/wasm32-unknown-unknown/release/kishib_airgap.wasm"

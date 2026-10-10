#!/bin/sh
# Build the core library's WebAssembly bindings (crate mor-wasm) and generate
# their JavaScript glue into ./wasm. Needs Rust with the wasm32-unknown-unknown
# target, and wasm-bindgen-cli of the same version as the crate pins:
#   rustup target add wasm32-unknown-unknown
#   cargo install wasm-bindgen-cli --version 0.2.129 --locked
#
# The build is reproducible (roadmap step 10a): the compiler writes source
# paths into the WebAssembly (for panic messages), so the build machine's
# folders are replaced by fixed names: this repository by /mor, Cargo's home
# (the downloaded crates) by /cargo. The same Rust and wasm-bindgen versions
# then give the same bytes on any machine, in any folder
# (clients/site/test/reproducible.test.ts). The tools' names and versions are
# not written into the file (--remove-producers-section): a prebuilt
# wasm-bindgen and one installed by cargo write different version labels, so
# the bytes would otherwise depend on how the tool was installed
# (docs/release-fix-2026-10-10.md, option a).
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
root=$(cd "$here/../.." && pwd)
cargo_home=$(cd "${CARGO_HOME:-$HOME/.cargo}" && pwd)
target=${CARGO_TARGET_DIR:-$root/target}
# One flag per field, separated by the unit separator, so that folder names
# with spaces stay whole. Set for this build only; it replaces RUSTFLAGS.
us=$(printf '\037')
CARGO_ENCODED_RUSTFLAGS="--remap-path-prefix=$root=/mor$us--remap-path-prefix=$cargo_home=/cargo"
export CARGO_ENCODED_RUSTFLAGS
cargo build --manifest-path "$root/Cargo.toml" -p mor-wasm --release --target wasm32-unknown-unknown --locked
wasm-bindgen --target web --remove-producers-section --out-dir "$here/wasm" "$target/wasm32-unknown-unknown/release/mor_wasm.wasm"

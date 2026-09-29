#!/bin/sh
# Build the core library's WebAssembly bindings (crate mor-wasm) and generate
# their JavaScript glue into ./wasm. Needs Rust with the wasm32-unknown-unknown
# target, and wasm-bindgen-cli of the same version as the crate pins:
#   rustup target add wasm32-unknown-unknown
#   cargo install wasm-bindgen-cli --version 0.2.129 --locked
set -e
here=$(cd "$(dirname "$0")/.." && pwd)
root=$(cd "$here/../.." && pwd)
cargo build --manifest-path "$root/Cargo.toml" -p mor-wasm --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir "$here/wasm" "$root/target/wasm32-unknown-unknown/release/mor_wasm.wasm"

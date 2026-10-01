# mor-wasm

The core library for the TypeScript clients, through WebAssembly (roadmap step 5). Every act a client makes or judges goes through the core library's own code: CBOR, hashes, signatures, the identity checks, X-Wing and sealed containers. The clients only fetch, store and show.

Hashes cross the boundary as lowercase hex strings, larger data as `Uint8Array`. Unlike the core library, the bindings draw fresh randomness from the platform (`crypto.getRandomValues`), except where the caller passes it (sealing, so that the tests can re-make every key exchange with a second implementation).

Build (from `clients/genesis`): `npm run wasm`, which runs

```
cargo build -p mor-wasm --release --target wasm32-unknown-unknown --locked
wasm-bindgen --target web --out-dir clients/genesis/wasm target/wasm32-unknown-unknown/release/mor_wasm.wasm
```

with `wasm-bindgen-cli` of the version pinned in `Cargo.toml` (0.2.129), and with the build machine's folders replaced in the compiled file (`--remap-path-prefix`: this repository becomes `/mor`, Cargo's home `/cargo`), so that the build is reproducible: the same Rust and wasm-bindgen versions give the same bytes on any machine, in any folder (roadmap step 10a; tested in `clients/site/test/reproducible.test.ts`).

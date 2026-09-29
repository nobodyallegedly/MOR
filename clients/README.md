# Clients

The TypeScript clients (build brief: "Rust for the core library, relays and homes; TypeScript for clients"). Each uses the core library through WebAssembly (`wasm/`, crate `mor-wasm`), so every act is made and judged by the same Rust code as the relays; a client only fetches, stores and shows.

| Folder | What | Roadmap |
| --- | --- | --- |
| `genesis/` | The genesis client: test identities, routes, encryption keys, rotations, key delivery. | step 5 |

Building any of them needs Node 22 or later, Rust with the `wasm32-unknown-unknown` target, and `wasm-bindgen-cli` of the version the `mor-wasm` crate pins:

```
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.129 --locked
```

# Clients

The TypeScript clients (build brief: "Rust for the core library, relays and homes; TypeScript for clients"). Each uses the core library through WebAssembly (`wasm/`, crate `mor-wasm`), so every act is made and judged by the same Rust code as the relays; a client only fetches, stores and shows.

| Folder | What | Roadmap |
| --- | --- | --- |
| `genesis/` | The genesis client: test identities, routes, encryption keys, rotations, key delivery. | step 5 |
| `repo/` | The repo client: a test collective under a founding agreement, releases of the code as signed manifests, verification of every file. | step 5a |
| `longform/` | The long-form text format: reading, rendering to HTML with the plain text one tap away, and the Text MIP's bound checked on every rendering; a document as a text act, published and read back verified. | step 8 |
| `barebone/` | The barebone client: a post with a picture (a text act referring to a JPEG publication, stripped to the picture alone), shown verified; withdrawal. | step 9 |
| `reader/` | The web reader, the door: opens by link, verifies in the browser, renders documents and posts, shows the signer's fingerprint; reach the owner by email or by a message sealed over MOR. | step 10 |
| `manage/` | The management page for relays and homes, served by the relay itself at `/manage/`: a browser paired once with a one-time code signs every request; approvals, lists, a limit on new identities, the operator's rotation. | step 11 |
| `collective/` | The collective client: a program on the author's machine with a page in the browser, no command line; releases under one's own name, founding a collective, adding and removing members, signing and verifying releases, leaving; every step read back in plain words from the exact bytes before it is signed. | step 11b |
| `connector/` | The MOR connector for Claude, an MCP server: reads and verifies acts by id or link, says in plain words who signed what and whether it counts, prepares acts for their owner to sign on their own signer and submits them; it never holds a key. | step 11a |

Building any of them needs Node 22 or later, Rust with the `wasm32-unknown-unknown` target, and `wasm-bindgen-cli` of the version the `mor-wasm` crate pins:

```
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.129 --locked
```

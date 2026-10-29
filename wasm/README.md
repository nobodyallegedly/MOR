# mor-wasm

The core library for the TypeScript clients, through WebAssembly (roadmap step 5). Every act a client makes or judges goes through the core library's own code: CBOR, hashes, signatures, the identity checks, X-Wing and sealed containers. The clients only fetch, store and show.

Hashes cross the boundary as lowercase hex strings, larger data as `Uint8Array`. Unlike the core library, the bindings draw fresh randomness from the platform (`crypto.getRandomValues`), except where the caller passes it (sealing, so that the tests can re-make every key exchange with a second implementation).

Build (from `clients/genesis`): `npm run wasm`, which runs

```
cargo build -p mor-wasm --release --target wasm32-unknown-unknown --locked
wasm-bindgen --target web --out-dir clients/genesis/wasm target/wasm32-unknown-unknown/release/mor_wasm.wasm
```

with `wasm-bindgen-cli` of the version pinned in `Cargo.toml` (0.2.129), and with the build machine's folders replaced in the compiled file (`--remap-path-prefix`: this repository becomes `/mor`, Cargo's home `/cargo`), so that the build is reproducible: the same Rust and wasm-bindgen versions give the same bytes on any machine, in any folder (roadmap step 10a; tested in `clients/site/test/reproducible.test.ts`).

## For the Dubsar Suite

The core moved to the bake-to-publication texts (MICS v30 with Identity 15, Text 11, Envelopes 11, Money 11, Agreements 17, Development 11, as rewritten in S7h). What a client names differently, old name first:

| Old | New | Where |
| --- | --- | --- |
| `envelopes::types::PUBLICATION` (Envelopes type 0), "publication" of media | `envelopes::types::BAKE`, a **bake**; its signer is its **uploader**, who **uploads** it | Envelopes, "Bake (type 0)" |
| a publication's field 7 (price) and field 8 (`for`) | refused: a bake carrying either is invalid; the price is a **price tag** | Envelopes, "Bake (type 0)" |
| `envelopes::types::WITHDRAWAL` (Envelopes type 3) | `envelopes::types::RETIRED_WITHDRAWAL`: an act of type 3 is invalid; a bake is never withdrawn, a price tag is withdrawn by a version with no price | Envelopes rule 24 (retired) |
| none | `money::types::PRICE_TAG` (Money type 5), `money::PriceTag`, `money::Priced`; in this binding, `moneyPayload({ type: "priceTag", bake or publication, version, previous, price, payee })` and `Verifier.priceTag(act)`: "counts", "nobody's offer" or "unknown" | Money rule 18, "Price tag (type 5)" |
| `agreements::types::WORK_CLAIM` (Agreements type 3), "work claim" | `agreements::types::CLAIM`, a **claim** | Agreements rule 7, "Claim (type 3)" |
| `agreements::layers::ENVELOPES_AND_TEXT` = 1, `MONEY` = 2, `AGREEMENTS` = 3, `DEVELOPMENT` = 4 | `layers::TEXT` = 1, `ENVELOPES` = 2, `MONEY` = 3, `AGREEMENTS` = 4, `DEVELOPMENT` = 5 (`IDENTITY` = 0): an area's or grant's kind `[0, layer]` and a specification's field 10 are read in these numbers; field 10 accepts 0 to 4 | MICS, "Structure"; Development, "Layers an extension acts on" |
| task 11 (anchoring) in the Agreements layer | task 11 in the Envelopes layer, as Development's task table writes it | Development, "Tasks" |

**Not yet in the core** (the texts have them; the core still reads the earlier formats, so a client keeps making those until the core moves): the publication (Agreements type 6, partners, split service, split plan) in place of the standing offer and of terms fields 8, 14, 28 and 29; the ownership agreement's target (terms field 33) and one stake; shares by reference (receipt field 9 as `[ownership agreement, version]`); the layer rules (field 19 as a map keyed by layer) and finer areas (field 34); a collective with no signing key, its members acting with their own keys, and with no member keys or collective grant keys; records drawn by any member; the keyless genesis and rotation. `docs/s7h-report.md` says what remains and why.

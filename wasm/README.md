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

The core now reads the redesign's remaining formats too (S7h-2): the publication, the ownership agreement's target and one stake, shares by reference, purchases by price tag, the keyless collective and the keyless genesis and rotation. What a client calls differently in this binding, old shape first:

| Old | New | Why |
| --- | --- | --- |
| `makeGenesis({ signingSecret, ... })`, `signingSecret` required | `signingSecret` optional; for a collective, `firstChainKeySeeds` and `firstChainKeyScheme` instead (its genesis signed by its first chain key, revealed in the signature); exactly one of the two | Identity rule 1: a collective's genesis declares no signing key |
| `makeRotation({ newSigningPublic, ... })`, required | `newSigningPublic` optional, absent for a collective; a collective's rotation keeps no tip | Identity rotation check 4 |
| `resolve(identity).signingKey`, always bytes | `null` for a keyless identity | Identity rule 1 |
| `readTerms(...)`: `grammar.signing`; `splitGrant`, `payeeGrants`, `backups`, `plan`, `fees` (terms fields 8, 14, 28, 29) | `grammar` holds `chainKey` and `recovery` only; the four fields are gone (a publication carries them); new `target` (`["claim", hash]` or `["collective", null]`, field 33) and `layers` (`[[layer, rule]]`, field 19); `areas` are field 34's finer areas | Agreements, "Terms": fields 19, 33 and 34 |
| a mark's power: `area`, `constitutional`, ... | also `layer` (`area` holds the layer number), the power `[6, layer]` | Agreements rule 65 |
| `readGrant(...).thisAgreement` | gone: a collective's grant carries no key, and names none of its own | Agreements, "Grant (type 9)" |
| `recordPayload({ kept, ... })` | `kept` gone: a record cites the collective's line in its objects | Agreements, "Record (type 17)" |
| `agreementsConsent(...)`: each area count's `byKey` | gone: no member keys | Agreements rule 58 |
| `agreementsHandOut(specs, collective, agreement, chainAct, tips)`, `agreementsLineUnheld(specs, collective, chainAct, tips)` | `agreementsHandOut(specs, collective, agreement, line)`, `agreementsLineUnheld(specs, collective, line)`: `line` the acts the ending cites on the collective's chain | Agreements rule 91: an ending's line is what it cites |
| `agreementsSplitTurns(specs, service, agreement, stake, holders, previous)` | `agreementsSplitTurns(specs, service, owners, holders, previous)`: `owners` the ownership agreement's first version | Agreements rule 15: one stake, read by reference |
| `agreementsSplit(...).agreement` | `.publication`: a split names the publication it pays under (field 3) | Agreements, "Split (type 8)" |
| `agreementsPayerSplit(...)` | gone: what a payer owes is read from the publication's split plan and its price tag | Agreements rules 11 and 15 |
| none | `publicationPayload({ sold, owners, partners, service, plan, words, cmips, designated, backups, time, refundUntil, until })`, `Verifier.agreementsPublication(specs, id)`, `Verifier.agreementsTagUnder(specs, tag)` | Agreements, "Publication (type 6)" |
| none | `Verifier.bakeUploader(bake)`: the uploader, or "unknown" where a bake names a collective and Agreements are not read | Money rule 18; Q13 |
| `anchoringOffer(...)`, `anchoringReadOffer(...)` | both refuse: the anchoring cMIP still makes and reads a standing offer, which the core no longer reads; they return once the cMIP moves to a publication with a price tag | cMIPs left as they are |

CLIENT_FAILURES_PLACEHOLDER

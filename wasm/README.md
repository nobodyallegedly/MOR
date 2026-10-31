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

**Client tests failing because of the core** (run on 30 October 2026 against this core, its WebAssembly built locally and not released). Pass: grants, longform, reports, anchoring-service, split-service. Each failing app, with its reasons:

- **The collective's founding terms the clients make carry the old key grammar** (keys 0 and 2, a signing key for the collective; Agreements rule 59: a collective has no signing key; Identity rule 1). The core refuses them, and every test that founds a collective stops there:
  - collective: 22 tests, among them the author's walk from the page alone, records and their warning, the judicial change, absence under the collective's rule and of the signing key's holder, money and endings, Identity rule 35, the founding read from its bytes, the release area's words, a clone's mark in words, hidden direction controls, refusals by format, Agreements' objections by code, a clone's changes by tier, rule 49 before signing an abandonment clause, owners choosing members, and F187 (1, 2, 3, 4, 8) and F189 (1);
  - connector: all 13 tests (its shared fixture founds a collective through `clients/repo`'s `termsPayload`);
  - desk: 7 (collectives: what you may do; the cast's grid into founding terms; members ticked for the constitution; H80 after a change of keys; keepers; an identity used through Kišib; H14 and H15 for collectives), and 2 that follow from them (the vow published from Edubba, its sale read from the founding's line; three people on three devices, which no longer reaches "Propose to found");
  - repo: 13 (found, release, sign and verify from the command line; founding by negotiation; a collective founded; a release counting at two signatures; a checkout that differs; a member leaving and another joining; the next release; an ordinary change; the MOR repository published; a release naming its specifications; a key grammar one lost holder would freeze; shares checking alone; Identity rule 35, a member change keeping another device's line);
  - site: 1 (a collective's site refused until Agreements draft 7 is approved).
- **Terms fields 8, 14, 28 and 29 are withdrawn** (a publication carries the split plan, split service, fees and backups): collective, a deal's backup split services (field 29); desk, the judged referral (a lone seller's deal carrying its split plan); repo, a deal listing its payees' grants (field 14).
- **The anchoring cMIP still makes and reads a standing offer**, which the core no longer reads (`anchoringOffer` and `anchoringReadOffer` refuse; the cMIPs are left as they are): damgar 3 (the act menu's anchor; an anchor of a collective's act; a missed deadline); ummia 1 (a release anchored on Bitcoin).
- **A collective's rotation now carries no signing key and keeps no tip, and there are no member keys** (Identity rotation check 4; Agreements rule 58): Kišib refuses to sign what the apps show, "What was shown cannot be signed": kishib 3 (a collective rotation from two of three paper shares; the hour, F337; in the same room); desk 1 (H33, Edubba acting as a member, its member key); ummia 1 (every app leaves each private act at the homes, "the member key kept").
- **A text act may carry one object** (Text rule 14: `[grantor, grant]` or `[collective, decision]`): genesis 1 (F295, F296: a text act naming a chain in objects answers unknown where it expected invalid, the chain named not held).

Already failing at S7h, for the reasons its report gives (the bake, the retired withdrawal, the layers renumbered, the price tag): barebone 2, collective 1, damgar 10, desk 42, dub 5, kishib 7, kit 16, manage 2, reader 6, site 65, testwallet 4, ummia 10.

**Changed in S7h-4** (the core brought to the texts; rebuild against this commit):

| Old | New | Why |
| --- | --- | --- |
| `agreementsConsent(...)`: each area count's `area`, a whole number; for a layer's rule (field 19) the core's internal lane id near 2^64, which JavaScript cannot hold, so the call threw | `area` a JavaScript number: a finer area's id (field 34), or a layer's rule as minus its layer (`-1` Text ... `-5` Development); new `layer`, the layer's number, or `null` for a finer area | a binding's bug: every member's act judged under a layer's rule read "unread" |

Verdicts an app may see change:
- **A payment naming a price tag's earlier, priced version, receipted on a push rail after the withdrawal is in the split service's history, is no purchase** (Agreements rule 12): it was a purchase. On a request rail, nothing changes.
- **A person's homeless rotation that a valid objection from a live home of the old set names is void** (Identity rule 49): it read "pending". A collective's is unchanged (its own escape endorsement).
- **A clone marked with a succession plan naming stake successors must pass the party's stakes to them**; one leaving them as they were, or changing a layer's rule beyond putting the seat successor in the party's place, is invalid (rules 64 and 83). One passing them, valid until now only without a stake change, is not invalid.
- **A collective's split agreement:** a later version paying the stake less needs its holders' consent by the stake's holders' rule (rules 15, 48, 94 and 95): every holder who is no member signs under "every holder"; under a rule by share the holders signing meet the share, a proxy voting for a non-member where it has not signed itself; the roster read at the version, the transfers its history places applied. A version that once counted on the parties' signatures alone may now be a draft. A fork's successor whose first split agreement pays its kept holders less than the original's did needs them too (rule 95).
- The anchoring binding (`anchoringOffer`, `anchoringReadOffer`, `anchoringCheckTicket`) is unchanged: the moved anchoring cMIP is not yet on this branch, and the binding follows it once it is.

**Changed in S7h-5** (rebuild against this commit):

| Old | New | Why |
| --- | --- | --- |
| none | `Verifier.agreementsPublicationTip(specs, first)` → `{ latest, tags, owners, ownersLatest }`: a publication's latest versions, the latest version of each price tag line that counts under it (one per price), the ownership agreement it names and its latest version | F409: every app that pays follows the line to its tip first |
| `anchoringOffer(network, tiers, words)`, refused | `anchoringOffer(network, tiers, words, service, splitCmip, refundUntil?)` → `{ type: 6, payload }`, a lone seller's publication (anchoring draft 6) | the anchoring cMIP moved to a publication |
| none | `anchoringPriceTags(network, tiers, publication, service)` → `[{ tier, type: 5, payload }]`, one tag per tier, each priced exactly at its tier | F409: one price tag per price |
| `anchoringReadOffer(act)`, refused | `anchoringReadOffer(publicationAct, tagActs?)` (the tags optional: without them the publication is read alone) → `{ id, payee, unit, network, tiers, words, refundUntil, tags: [{ tier, tag }] }` | draft 6 |
| `anchoringCheckTicket(offerAct, ticket, commitment, leaf, now)` | `anchoringCheckTicket(publicationAct, tagAct, ticket, commitment, leaf, now)`: the tag paid must be the ticket's tier's | draft 6; a payment naming the publication is a tip and buys no ticket |
| `publicationPayload({ plan })`, no fees | `plan.fees: [{ module, part, scope?: "bake" or "rail", of? }]`, read back the same | F409 |

Verdicts an app may see change: an act a departed member drafts for the collective after the line registering the departure counts for nothing, however many current members sign it (rule 58); a payment to a backup the publication lists, still naming the tag, is a purchase where it was none (rule 17).

**For the suite, to turn the anchoring tests green** (the binding cannot meet the old calls and follow draft 6): `clients/anchoring-service/src/service.ts` makes its publication with `anchoringOffer(3, TIERS, words, this.me.id, SPEC.split)` and signs each of `anchoringPriceTags(3, TIERS, o.id, this.me.id)` under Money, keeping the tag ids, and accepts a payment whose `fulfils` is the ticket's tier's tag (line 246); `clients/damgar/src/damgar.ts` (line 1935) looks up the tag act a payment fulfils and passes it to `anchoringCheckTicket`; `clients/desk/src/money.ts` (line 164) and `clients/ummia/src/anchor.ts` (line 89) pass the service's tag acts to `anchoringReadOffer` and pay `tags[tier].tag`.

**Changed in S7i** (rebuild against this commit):

| Old | New | Why |
| --- | --- | --- |
| none (Assess and Edubba read a publication's fields from its payload themselves, `clients/assess/src/publication.ts`) | `readPublication(payload)` → `{ sold, splitAgreement, owners, partners, service, plan, words, time, timeParams, until, untilCbor, refundUntil, refundUntilCbor, cmips, designated, backups, failed }`: the payload decoded strictly by the core before it is signed, every check of the format that reads the payload alone applied; it throws where the payload is not a publication in Agreements' format. `sold` and `partners` are in `publicationPayload`'s shape, `plan` in `agreementsPublication`'s (its `shares` by kind, `unfilled` "stakes", "held-open" or "to"); a point (`until`, `refundUntil`) is a number where it is one, its bytes in the `…Cbor` field whatever it is. What its `objects` must name, and whether a version selling nothing is a later one, are read once it is signed, by `agreementsPublication` | the suite's round 9, item 3 (F412): the core reads the format, the apps no longer do |

Verdicts an app may see change:
- **A claim a member signs for a collective, naming the collective in `objects`, is the collective's claim** (Agreements, "Claim (type 3)"; rule 58; F412): the collective is its opener, a creator, and the work's default holder where no ownership agreement targets it; the claim counts where the member may act for the collective in Agreements (rule 60). Such a claim was refused (its signer had to be among the creators). Members may be listed beside the collective as co-creators, each binding it by a signature act of their own, the member who signed it for the collective included. A claim naming the collective that lists only its signing member is now the collective's act and counts for nothing (its opener, the collective, is not among its creators); a member claiming for themselves names no collective. No binding changed: a member makes it with `makeEveryday` as any act for the collective, naming the collective in `objects`.

# The code after step 15, part 2: Money and Development

*15 October 2026. For Nobody, allegedly. The code for the step 15 decisions on rails and specifications (F301, F322 to F326, with F328 Q4 to Q10, and Development Q6 and Q7, taken), built against Money draft 8, Development draft 10, the payment cMIP draft 3, the release manifest cMIP draft 4, the website cMIP draft 11, the MICS v28 and the freeze suite v28, with the drafts corrected where the build showed them wrong. Part 2 of 4; one pull request, stacked on part 1's (merge part 1 first). Test identities only; regtest only; no real money.*

## In plain words first

The core library now reads a specification the way Development draft 10 writes it, all of it, and the rails, the release tool and the listing all use that one reader.

- **A specification is read whole, or it is none** (F322, F323). The core gains a decoder of the whole format: every field, what each kind must carry (a Module names what it works under; a MIP names what it forks; a MIR, the MICS document and a test suite name no creator), the order of field 10, field 12 only on a cMIP. A content that breaks any of it is no specification: no client can have adopted it.
- **A rail says what it is in its specification, not in its code** (F301, F328 Q4 and Q5). Field 11 says request or push rail; field 13 lists what its proof ties down: payee, purpose, previous hop. A request rail must tie down payee and purpose. The Lightning and on-chain rail Modules are written again with these fields (their drafts 3), and the payment cMIP adopts a rail Module only from its specification's content, refusing one without the fields. Money's rule on a receipt and a claim that disagree is now read element by element: where the proof ties down the payee, the proof decides the payee; where it does not tie down the purpose, the payer's claim decides the purpose.
- **A release names what it implements by spec hash** (Development Q7, taken). The repo client writes and reads the release manifest's field 6 as draft 4 gives it, `[spec, ? hint]`, and finds each specification by its hash, a publication beside it only a hint.
- **The listing shows MIPs as forks** (F325, F328 Q10), each under the MIR it forks (or the MICS document, for a new layer), with how many fork each; the MICS document and a test suite as such (F291); two publications of one text that differ in other fields as versions of one text (F322); and code released matched by spec hash.
- **The root is the six texts** (F324). A repository check refuses a frozen text under `spec/` that is not canonical text, and the web reader ships the six MIRs' texts and shows their hashes, recomputed in the browser.
- **The founding rules say they are reference implementations** (F326): the conversion, anchoring and split cMIPs and the Bitcoin clock and timestamp clock Modules are each written again with that one statement, as the payment cMIP and the two rail Modules already were.
- **A disowned publication leaves the specification unclaimed** (F328 Q9), whether someone relied on it or not; the suite now has a step for it, and it runs.

One question for Nobody, allegedly, came out of this part: what a rail must bind for its payer to count as the buyer (below, question 1). The code takes a reading for now, marked in the drafts as the build's, not the text's.

## Tests: before and after

| | Before (part 1's branch, `1296a25`) | After (this branch) |
| --- | --- | --- |
| Rust workspace (`cargo test --workspace`) | 701 passed, 0 failed, 1 ignored | 710 passed, 0 failed, 1 ignored |
| TypeScript, 18 packages (`scripts/test-all.sh`'s list) | 414 passed, 0 failed | 419 passed, 0 failed (new: two in `clients/site/test/listing.test.ts`, three in `clients/reader/test/mirs.test.ts`; the listing's and the repo client's release tests rewritten for draft 4) |
| The identity gauntlet (local run) | 60 checks, all passed | 60 checks, all passed |

The one ignored Rust test is the same as before (the Lightning regtest test, skipped unless `MOR_LN_REGTEST` is set). The display client's and Dub's web client's `built/` folders are not touched: the project lead releases them after the merge.

## Which suite steps now run

- **2.4j** (F328 Q4), in part: `core/tests/money_f145.rs`, `what_a_proof_binds_is_read_element_by_element_f328_q4`. The receipt's dispute as shown is still to build.
- **8.1** (F324): `core/tests/spec_texts.rs` (the repository's check), `core/tests/development_draft_10.rs` (`the_six_mir_hashes_follow_from_their_texts_8_1`), and the web reader: `clients/reader/test/mirs.test.ts` (its recomputation checked against a second, written apart) and `clients/reader/test/browser.test.ts` (shown on its front page).
- **8.3** (F323), for the decoder and the listing: `content_not_in_the_format_is_no_specification_8_3`; `clients/site/test/listing.test.ts`.
- **8.7** (Development Q7, taken): draft 4's "implements" in `clients/repo/test/repo.test.ts` and in the listing.
- **8.8** (F322), in part: two spec hashes for one text (`two_publications_of_one_text_differing_in_optional_fields_are_two_specifications_8_8`), shown as versions of one text by the listing. A client adopting by text is still to build.
- **8.9** (F301, F323): the decoder (`a_rail_modules_kind_and_binding_are_fields_of_its_specification_8_9`), the Modules republished, adoption refused without the fields (`modules/onchain/tests/rule.rs`, `a_rail_module_without_its_kind_and_binding_is_not_adopted_f301`), a receipt naming a Module not adopted unknown (`mor_payment::verify`).
- **8.10** (F291, F325, F328 Q10): `each_kind_carries_its_required_fields_8_8_8_10`; the listing's MIPs' part.
- **8.11** (F328 Q5), for the decoder.
- **8.12**, new (F328 Q9, as the aggregated review's G9 asked): `a_disowned_publication_leaves_the_specification_unclaimed_whether_relied_on_or_not_q9`.

Still reasoned: **2.4i**, since no push rail Module exists (its specification's half runs, through 8.9). Still deferred: **2.5** and **8.2**, no published rule in MOR 1 (F326).

## What was built

**Core library** (`core/`):

- `development.rs`: `Spec::decode(content, &Known)`, the whole format (fields 0 to 13), `NoSpecification` saying why; `Spec::hash_of`; `Spec::mir_content`; the kinds 0 to 8; `RailKind`, `Bound`, `Rail` (fields 11 and 13); `RuleRef` with its profile (F328 Q7); field 5 on a Module, naming a cMIP or a MIR (F328 Q6); a MIP's predecessor (Q10).
- `chain.rs`: `Verifier::specification_claim(publication, creator)` (F328 Q9): claimed, unclaimed (shown disputed where relied on), or unknown where the publication is not held.
- `agreements/view.rs`: the two lists the caller used to state by hand (`push_rails`, `unbound_rails`) replaced by the rails adopted, each with its kind and binding from its specification (`rails`, `is_push_rail`, `rail_binds`); Money rule 11 read element by element.
- Tests: `core/tests/development_draft_10.rs` (6), `core/tests/spec_texts.rs` (F324's repository check), and one in `core/tests/money_f145.rs`; the Agreements tests now adopt rails from specifications.

**The payment cMIP and the rail Modules** (`cmips/payment`, `modules/lightning`, `modules/onchain`): a rail Module gives its specification's content (`RailModule::specification`), its spec hash computed from it; `Modules::adopt` decodes it, checks it implements the payment cMIP and carries fields 11 and 13, and refuses it otherwise, saying why (`Modules::refused`). The two Modules' specifications carry field 11 0 and field 13 [0, 1], with the text of their drafts 3 as field 9.

**WebAssembly** (`wasm/`): `decodeSpec(content, paymentCmip?)`, the core's decoder for every client; `mirHash(text)`; the Agreements input takes the rails' specification contents.

**Clients**:

- `clients/repo`: the release manifest's field 6 by spec hash, `[spec, ? hint]` (draft 4): written by `implementsField` and `resolveImplements` (each publication named is read, decoded by the core, and entered by its spec hash, the publication beside it as a hint), read by `decodeManifest` strictly, and found by a reader with `findImplemented` (found, a wrong hint, or not found).
- `clients/site` (the display client's listing; the built folder not touched): the listing decodes with the core library; shows the kinds 6 to 8; the MIPs in a part of their own, by what they fork, with how many fork each directly and in all, and those leading elsewhere in groups of their own; versions of one text, with the fields in which each differs; a rail's kind and binding; code released matched by spec hash, a release under draft 3's field 6 shown as not verified; "no specification" for a content the decoder refuses; the counts beside the page (MIPs, under how many MIRs, versions).
- `clients/reader`: ships the six MIRs' texts beside its page (`src/mirs.ts`, the build copying them from `spec/`) and shows their hashes on its front page, recomputed in the browser.

**Texts**: the Lightning and on-chain rail Modules, drafts 3; the conversion cMIP draft 3, the anchoring cMIP draft 5, the split cMIP draft 3, the Bitcoin clock Module draft 3 and the timestamp clock Module draft 2, each with F326's statement and nothing else changed. All are canonical text, as they will be published.

## What was not built, and why

- **A push rail Module** (2.4i): none is specified; the payment cMIP draft 3 names none.
- **A client adopting a specification by its text** (8.8's second half): no client adopts by text yet; the listing shows the versions.
- **The receipt's dispute, as shown, on a rail binding part of the set** (2.4j's last part): the core computes who decides; no client screen shows Money disputes element by element yet.
- **Published specifications for the founding cMIPs and Modules**: their creator is named at step 17; until then each rail Module's specification is shipped with its crate, and the creator is a test value.
- **The six hashes in use**: the reader shows the six recomputed from the drafts, but every client still judges with the shared test values until the freeze; using the recomputed ones now would break every test identity and relay at once. Said on the reader's page.
- **The machine profile and any program under rule 22** (F326): deferred by the decision.

## What changed in the drafts

- **Development draft 10**: the stale citation "Identity draft 12, rule 34" corrected to draft 13 (G8); "a specification malformed and implemented is no specification" (G8); rule 22's promise on the record's side until a profile is published, and the list of founding texts now saying so (G7); "fields 11 and 13 are a rail Module's" (a reading, below); question 1's note beside field 13.
- **Money draft 8**: beside the rail Module's definition, what was built, and question 1's note.
- **The freeze suite v28**: the marks of 2.4i, 2.4j, 8.1, 8.3, 8.7, 8.8, 8.9, 8.10 and 8.11 say what now runs and where; new step 8.12 (F328 Q9); the note's "Q9 is tested nowhere here yet" now names 8.12.
- **New drafts** of seven founding texts (above), and their rows in `cmips/README.md` and `modules/README.md`.

## Readings taken while building (for Nobody, allegedly, to see; any may be overruled)

1. **Fields 11 and 13 are a rail Module's.** Development draft 10 requires them on a Module naming the payment cMIP and calls field 13 "what a rail Module's proof binds", but does not say what they mean elsewhere. The decoder refuses them on any other kind, and on a Module carrying one without the other. Written into the draft, marked as a reading.
2. **The rail's specification ships with its Module's code until it is published.** The payment cMIP reads a rail's kind and binding from the specification's content, never from code; until step 17 publishes them, that content is carried by the crate (`include_str!` of the draft's text), and the Module's spec hash is computed from it, so it can never differ from what the cMIP reads.
3. **A rail the verifier did not adopt binds everything, as far as the Agreements view is concerned.** It is never reached: the payment cMIP gives no answer for a rail it did not adopt, so no payment on it counts.
4. **The listing keeps a MIR and the MICS document among the lines of drafts too**, as well as at the head of their MIPs; a MIP appears only in the MIPs' part (website cMIP draft 11: "never as a line of drafts").

## Questions for Nobody, allegedly

**Question 1 (Money and Development; the rails): what must a rail's proof bind for its payer to count as the buyer?**

*In plain words.* When a buyer pays and says "this payment was mine, for this", MOR believes the buyer only where the rail itself vouches for what the payment carried. Field 13 now lists three things a rail can vouch for: who was paid, what for, and the previous hop. It does not list who paid. But Agreements decides who the buyer is (and whose acknowledgements count, F193) by "the payer the payment commits to", and before this step the code accepted that only on a rail that vouched for the whole commitment.

*Precisely.* Agreements rule 22 and F193 read the buyer as the payer the payment's commitment names, and the core (`committed_buyer`, `sale_acts`, the acknowledging claim) took a payer's claim as that only on a rail not "binding no payee or purpose". Field 13's set is {payee, purpose, previous hop}; the payer is one of the commitment's elements (payment cMIP, "who is paid, by whom, how much, in what unit, for what, and where") with no element of its own.

The fair cases:

- **(a) A proof binding the purpose binds the payer.** The purpose can only be bound through the commitment, one fingerprint that carries the payer too; so where field 13 holds 1, the payer is bound. What the code does now.
- **(b) The payer is bound only where the proof binds both payee and purpose**, as the code's old "binds the commitment" meant. Safer on a rail that binds the purpose some other way, if one ever does; stricter than needed for a rail binding the commitment but paying a shared address.
- **(c) A fourth element, 3 the payer**, in field 13 (Development draft 10, the payment cMIP draft 3). Explicit; a format change before the freeze, and every rail Module states it.

*Recommendation: (a)*, written as one sentence in Development's field 13 ("a proof binding the purpose binds the payer the commitment names, both being one fingerprint"). It matches how every rail written so far works, adds no field, and changes no answer the code gives today. If you prefer (b) or (c), the change is small and confined to `rail_binds` and the two rail Modules' texts.

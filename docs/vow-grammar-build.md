# The vow grammar build (F237, F240) and F244

*10 October 2026, night. One roadmap step: the vow grammar build. Written for Nobody, allegedly, against main at `b2fcc9e`, on branch `claude/vow-grammar`. Read against F229 to F234 (records), F237, F239, F240, F241 and F244 (`docs/findings/MOR-findings-log-round-2.md`) and Fable's review of announcements (`docs/reviews/announcements-review.md`). The texts say "announcement" until the redraft before review (F241), with a note that it is to be renamed "vow" (F239); the code says `vow`. Nothing here is merged.*

## In plain words

**What a vow is now, in the core.** Someone wants to sell something that has no bytes yet: a concert seat, an album not recorded, a bench for the square. They sign a short act saying, in words, what is to come. That act is a vow. Its id is its name, for good. If the details change (a new date), they sign a new version on the vow's own chain, pointing back to the first. Offers name the vow and say, in their own words, what they sell.

**What the core keeps track of.** Only one thing per sale: is it **pending**, **confirmed** or **contested**? Confirmed means the buyer acknowledged something about the vow (a door scanner's record, a delivery note) in the buyer's own claim for the payment. Contested means the buyer signed a contest naming the vow. Only someone who signed onto the vow (by paying, or by signing a free offer) can move a sale either way; a stranger's contest, or the seller acknowledging its own delivery, changes nothing. A vow nobody signed onto has no state at all.

**What left the core.** Everything about what is promised: seats and quantities, delivery dates, what the vow became, and streams. The stream rules (segments, who signs them, the closing, forks, the recording) now live in a first live media cMIP, draft 1, with their content kept. A work claim still covers works only: claiming a vow's name covers nothing it became, so nothing can be backdated.

**One correction.** If a thief signs a vow with your key and you rotate, your rotation voids the thief's acts in your name, the vow among them. It does not void the name other people wrote down: the club's offer, the fan's purchase and the fan's sale all stand, pointing at a vow shown as void (F237, correcting F230's stated cost).

**F244, the money between layers.** When a publisher's split pays the work's share, it pays one place only: the pointer the work's agreement names for money coming from above. That pointer is a lone owner's own pointer (nothing to split), the work's split service, or an owner acting as treasury for the joint venture. The publisher never divides the work's share among the work's owners. A work of several owners that names no such pointer cannot be paid through a publisher until it names one.

**Two questions for you** (QV1, QV2 below). Everything else was a mechanic, listed as a reading to confirm (V-R1 to V-R14).

**Tests.** Rust 593 passing (585 before, 8 new); TypeScript 205 passing (unchanged). No test vector changed, and none was added.

## What was built, precisely

### 1. The grammar the core keeps (F237, F240)

**The vow act** (`core/src/envelopes/vow.rs`; Envelopes draft 7, new section "Announcements", type 5):

```cddl
announcement = {
  0 => tstr,          ; its words: what is to come, canonical text
  ? 1 => [hash, any]  ; a cMIP and its parameters: what it is in that cMIP's terms
}
```

The genesis names no chain; its id is the vow's name. A later version names `[genesis, previous]`. It carries no `acks` (Envelopes rule 4a). Read by `AgreementsView::vow(name) -> VowEval`: its versions (the signer's only), its tips (two or more: the signer's fork, shown), the words of each tip, the offers naming it, its sales and the purchases nobody signed onto, and whether its genesis is void.

**The offer's `sold`** (`core/src/agreements/open_formats.rs`; Agreements, the offer format): a new form `[ 3, vow ]`, `Sold::Vow(name)`. An offer naming a vow must carry its words (field 4); without them it is not in the offer's format. An offer naming an act the verifier holds that is not a vow, or a later version rather than the genesis, does not count.

**The state of each sale** (`core/src/agreements/view/vows.rs`; Agreements rule 32b, new): `SaleState::{Pending, Confirmed { by }, Contested { by }}`, with the buyer and the act that signed them on, in `VowEval::sales`.

**The contest** (Agreements type 14): the format `{ 0 => hash }`, `[[act, act]]` in `objects`, now written for two cases: a declaration of absence, as before, and a vow's name. In code the field `declaration` is renamed `act` (the one test and the WebAssembly binding follow). No byte on the wire changed.

**Rule 15 unchanged** (works only). The library's work claim still binds any 32 bytes, a vow's name among them; no claim on a vow's name reaches what it became.

### 2. Substance out of the core (F237)

- **`cmips/cmip-live-media-draft-1.md`**, draft 1, experimental, not approved, no code. F232's lines 1 to 8 with their content, each with its decision quoted: opened by an act of its opener (an announcement, or a first segment); only the opener's segments (F231); a closing act by the opener naming the last segment; no work hash while open, the recording's computed from the segments in order; forks shown, the closing choosing the branch; an offer naming the stream with words; stream and recording two things; the buyer's check, a SHOULD. Formats for the segment and the closing (mechanics). Two changes F237 makes, said where they fall: F232's "a claim on the stream covers its recording" is replaced by an ordinary work claim on the recording (rule 15); and F230's cost is restated. The review's findings 5 and 6, which F237 dissolves into the cMIPs, are its "Open in this draft". `cmips/README.md` lists it.
- **F230's cost corrected** in Envelopes ("Announcements"), Agreements (the offer) and the cMIP: a rotation voids the opener's own acts after the kept tip, never a name others wrote down.
- **F230 to F234 stay as records.** The findings log is not edited by this build.

### 3. F244

**Agreements rule 16, rule 23 and the split plan:** "the next layer's split service" is replaced by **the one pointer the next layer's agreement names for money arriving from above**; the layer above never divides the next layer's share; an agreement naming none cannot be paid through a layer.

**The library** (`core/src/agreements/view.rs`): `layer_receivers(holder)`, used by the split check where `layer_services` was: the split services the holding agreement's version in force names (field 14, or its chain of judgment's link), an owner acting as treasury being one so named; else, for a deal of one party holding every stake it writes, that party; else none, so any payout on that holding is a mismatch. `layer_services` stays for what only a service owes (`layer_share`: a service receipting a layer's share holds it unsplit until its split names it, rules 20, 29).

### The texts changed

| Text | What |
| --- | --- |
| Envelopes draft 7 (revised in place) | Header note; section "Announcements" (to be renamed vow); the media paragraph (a stream's name is an announcement's, the rest the live media cMIP's); type 5 in the table; F237 in "Decided" |
| Agreements draft 10 (revised in place) | Header note; act table, type 14; the contest's format and text; the offer format (`[ 3, announcement ]`, words required); the offer's paragraph; rule 32's last sentence; **rule 32b** (new); rules 16 and 23 and the split plan (F244); "Decided" (F237, F240, F244); "Open" (QV1, QV2) |
| Core v21 | "Announcements" in the layers' description; a glossary row |
| Freeze suite v21 | Header note; a component line for announcements; scenario 7, step 8a (F244) |
| `cmips/cmip-live-media-draft-1.md` | New |
| `cmips/README.md` | The new cMIP listed |

## The tests that pinned the old behaviour

Each test of the two review files was named `today_…` and pinned what the core did before. What each asserted, what changed, and why:

**`core/tests/review_announcements.rs`** (four tests, rewritten, renamed):

1. `today_an_access_offer_sells_without_count…` → **`a_vow_is_sold_without_count_each_sale_with_its_own_state`**. *Before:* an access-form offer (`[2, [cmip, params]]`); every payment a purchase; no count. *Changed:* the vow is a core act and the offer names it (`[3, vow]`, with words); the fans sign on by their own claims; **added:** three sales, each pending. *Kept:* each payment a purchase, nothing counted (F237: quantities and seats are the cMIPs'; the review's option B).
2. `today_voiding_the_opening_act_voids_nothing_that_names_its_id` → **`voiding_a_vow_voids_its_signers_acts_never_the_name_others_wrote_down`**. *Before:* the same facts, which the review said F230's cost misstated. *Changed:* the opening is a vow; **added:** `vow().void` is true, and the fan's sale stands. *Kept:* the vow and the thief's claim void; the offer counts; the purchase stands; a later claim on the void name binds (rule 15 unchanged). This is now the pin of F237's correction.
3. `today_a_closing_act_naming_what_an_announcement_became_is_read_by_nobody` → **`what_a_vow_became_is_the_cmips_and_the_core_reads_only_its_chain`**. *Kept on purpose:* closings are a cMIP's acts read by nobody; Dario's claim on the vow reaches no recording; a stranger's claim on recording A binds uncontested (F237: claims reach a work only by its own claim, so nothing is backdated and no closing binds the creators). *Reworded:* the assertion that two closings are both valid stays, now about a cMIP's acts the core reads not at all, rather than "a fork of nothing". **Added:** the vow's chain (a version, a stranger's act that is no version, the signer's fork shown), no state while nobody signed on, and an offer naming a later version refused.
4. `today_an_access_offer_under_a_second_agreement…never_shown_outside_the_first` → **`an_offer_naming_a_vow_under_a_second_agreement_is_not_shown_outside_the_first`**. *Changed:* the offer names the vow; **added:** the fan's one sale. *Kept:* nothing marks the sponsor's offer outside the club's deal. Whether it should is **QV1**; not built.

**`core/tests/review_live_work.rs`** (five tests):

1. `today_a_work_claim_binds_any_hash_before_any_content_exists`: *changed:* the opening is a vow rather than a cMIP act. *Assertions unchanged:* rule 15 is.
2. `today_an_access_offer_names_no_work…` → **`an_offer_naming_a_streams_vow_is_judged_apart_from_any_claim_on_its_name`**. *Changed:* the offer names the stream's vow, with words, instead of the access form. *Kept:* the purchase is under the stranger's terms; Dario's claim is uncontested and reaches no sale. **Added:** the fan's sale, pending; Dario's contest shows nothing (he never signed on, F240).
3. to 5. (`today_a_bare_claim…`, `today_a_publication_under_any_name…`, `today_the_recording_and_the_live_name…`): **unchanged**, assertions and names: "claimed" for a purchase is still an agreement's stake; a publication under any name is sold under the agreement claiming it; the recording and the stream's name have no tie the core reads (F237: the live media cMIP computes it). The header says so.

**New:** `core/tests/vows.rs` (5 tests: pending then confirmed, an unrelated acknowledgement confirming nothing, a claim without the rail's answer confirming nothing; only the buyer confirms or contests, a contest prevailing; a free offer signed onto by a signature act; a payment nobody signed onto, no state; words required, a non-vow refused, an unheld vow not judged, the format closed). `core/tests/agreements_collective.rs`: 3 tests for F244 (a lone owner paid at her pointer; an owner acting as treasury; an agreement naming no pointer refused), the F235 tests unchanged and passing.

## Readings taken under the delegation of mechanics, to confirm

Each respects the decided rule; none changes what a decided rule does.

- **V-R1. Where the vow lives.** In Envelopes, type 5 (the next free number), as F232 and F234 placed the section and the review's finding 9 asked ("define the act, its id as a name, its chain … and nothing about what is owed"). The state of a sale is Agreements' (rule 32b).
- **V-R2. Its format.** `{ 0 => words, ? 1 => [cMIP, parameters] }`; a later version names `[genesis, previous]`, one entry beside any a collective's actions chain needs.
- **V-R3. Its versions.** Only the genesis's signer's acts count as versions, each following a version of the same chain; two of one previous are the signer's fork, shown, both standing (as an offer's, OF4 a). A stranger's act on the chain is no version.
- **V-R4. Public or private.** No rule of its own: Envelopes' "Public and private" as for any act. Offers stay always public (F215).
- **V-R5. The offer naming it.** `[ 3, vow ]`; words required (fail closed); a held act that is not a vow, or a later version, keeps the offer from counting; a vow the verifier does not hold is not judged, as a publication is not; a vow made void by a rotation does not keep the offer from counting (F237's correction).
- **V-R6. A sale, paid.** A payment that is a purchase (rule 32a) under a counting offer naming the vow, one per payment (F200's "same payment"). Its buyer is the payer the commitment names (F193): the signer of a payer's claim of that payment with the rail's answer, valid, on a rail binding the payer, the payer an identity.
- **V-R7. A sale, free** ("at any price, including none", F240). For an offer at price zero, a valid signature act naming the offer, by anyone other than the offer's own side (its signer, its payee, the parties of its agreement, its collective); one sale per buyer per offer.
- **V-R8. Confirmed.** Paid: a payer's claim of that payment by the buyer, under F193's conditions, whose `acks` name an act about the vow. Free: any valid act of the buyer's acknowledging one. "About the vow": one of its versions, or a valid act naming its name in `objects` or `refs`. An acknowledgement counts only alongside the act it names (Envelopes rule 4).
- **V-R9. Contested.** A valid contest (type 14) the buyer signed naming the vow's name. It marks every sale of that buyer of that vow (the contest names the vow, as F240 says "contest it"), prevails over a confirmation, voids nothing, and has no withdrawal in this grammar.
- **V-R10. Nobody signed on.** A purchase whose buyer signed nothing the verifier holds (only the seller's receipt naming a payer), or who committed only a bare key, is listed apart (`VowEval::unsigned`) with no state: F193's stated cost, now also F240's.
- **V-R11. The contest's format.** `{ 0 => hash }` read as "the act it answers"; the code's field renamed `act`. Nothing on the wire changed.
- **V-R12. F244's lone owner and treasury.** A lone owner: a deal (not a collective) of one party holding every stake it writes. An owner acting as treasury: an owner named as the split service through the grants the agreement already lists (field 14); no new field. A named split service takes precedence; a collective naming none has no pointer.
- **V-R13. What a lone owner owes.** Nothing to split: its receipt is a payee's. Only a split service holds a layer's share as an open obligation until split (`layer_share` reads services only).
- **V-R14. The live media cMIP's mechanics.** Its type and field numbers; the recording as the work hash over the segments' concatenation (or a media Module's container); a stream opened by a first segment sold through the access form with words; two closings, a closing off the chain and offers after a closing, as drafted there, untested.

## Questions for Nobody, allegedly

One at a time; both written into Agreements' "Open in this draft".

- **QV1. Is an offer naming a claimed vow, not signed under the claiming agreement, shown outside it (rule 15b)?** F237 sells a vow "under whatever agreement claims it"; rule 15b speaks of "a publication or standing offer *for a work* with an existing claim". F232's line 5 said so for streams and moved with the stream rules to the cMIP. *As built:* not shown (review test 4, kept). *Options:* (a) yes, 15b reads a vow's name as it reads a work's; (b) no, the cMIPs decide.
- **QV2. "The one pointer" where a deal names several split services.** In a deal each payee grants its own split service (field 14 is a list), so payees may name different services, and the agreement then names several pointers. *As built:* a payout to any of them is read as paid to the agreement's holding, as before F244. *Options:* (a) any of them (as built); (b) such a deal cannot be paid through a layer until its payees name one service; (c) the first in field 14.

Nothing else was silent or contradictory. *Noted, not a question:* F238's mechanic (rewording the vote "tally") is moot since F239 kept "tally" for votes; nothing was reworded.

## Vectors

**No vector changed, and none was added.** The published vectors (`core/vectors/`) cover tagged hashes, CBOR, the lock, the open act, running summaries and canonical text; none encodes an Agreements or Envelopes payload, so the new act type, the new `sold` form and the contest's renamed field touch none of them. A vector for the vow act could be added with the freeze's vectors; it was not needed to pin anything here.

## Checks run

- `cargo test --workspace --locked`, after rebasing on main at `683a8cd` (main then moved to `b2fcc9e`, a findings-log line only; the branch is rebased on it): **593 passed, 0 failed** (585 before, plus 5 in `vows.rs` and 3 for F244; the 9 review tests rewritten in place, their count unchanged). The three compiler warnings are in older tests of `agreements_collective.rs`, unchanged.
- `scripts/test-all.sh`: **all passed**; TypeScript 205 (barebone 9, collective 40, connector 12, desk 12, genesis 17, longform 26, manage 7, reader 16, repo 18, site 34, jpeg 14), unchanged. `wasm-bindgen-cli` 0.2.129 was installed for it. The site's browser test needs `MOR_CHROMIUM`, not set here; the regtest Lightning test is skipped without `MOR_LN_REGTEST`, as always.
- rustfmt and clippy are not installed for this toolchain (as in the review's session): the new code is checked by the compiler and the tests only.

## Not done, on purpose

- The findings log and the roadmap: written when the build is merged, as the practice goes.
- The rename of "announcement" to "vow" in the texts: the redraft before review (F241).
- F246 (one agreed deadline per stage), on main since this branch started: the next build, untouched here.
- Code for the live media cMIP: none; draft 1 is a document for testing the core and for a builder.

# Deals and owning: the decisions of 10 October 2026, evening, built

*A building session for Nobody, allegedly. It builds F206, F221, F222, F223, F224 and QJ2 (a) (findings log, round 2; "Step 12b's readings, and QJ2, taken under the delegation") in the core library, each change with a test that fails first, and writes them into Law draft 10, Finance draft 6, the freeze test suite v21 and core v21 (each revised in place, for Nobody, allegedly, to approve again). Branch `claude/deals-owning-build`. Test identities only. The current layer names are used (Law, Finance); the rename pass follows.*

*Not touched, as asked: `clients/collective`, anything on anchoring, the display client's built files. Fable's `review_fdb_*` tests pass unchanged: a settlement is final.*

**The core library changed, and its WebAssembly binding with it** (no binding function was added or changed; what changed is what the library answers): a display client release follows the merge.

## In plain words

**A judge that contradicts itself.** When a deal forks and the parties ask its judge to settle it, the judge signs one settlement. If the judge signs two settlements of the same fork that contradict each other, and neither shows it knew of the other, both now count for nothing: the deal stays where it was before the split, and the next judge in the deal's chain of judgment can settle it straight away, without waiting out a period. Both signatures stay visible, so everyone can see the judge contradicted itself. A judge that signs the same answer twice has not contradicted itself.

**The parties beat the judge.** If the parties themselves settle the fork, all of them signing, and the judge also settles it a different way, and neither settlement shows it knew of the other, the parties' settlement holds. The judge is only a fallback. If one settlement clearly came after the other (it names or cites it), the first one stands, whoever signed it: a settlement is final.

**No silent double signing.** Before your app signs a new version of a deal, it now checks whether you already signed a different new version of the same version, on any of your devices. If you did, it shows you the first one instead of signing silently. And when you sign a version that settles a fork, your app checks that it names every version you signed at the split. Accidents like this are what hide branches; with this check they disappear, and what remains is deliberate, with your signatures public for good.

**A newcomer's warning.** Before someone joins a deal, her app looks for another branch beside the line she is joining and warns her if it finds one. A branch already closed by a settlement on her line is not warned of. If she joins anyway and the others settle the fork the other way, she loses her place: that is the stated cost, unchanged.

**Selling a share, and receipts after it.** When Ben sells part of his stake, he signs the sale on his own unbreakable line (a chain signature). His own receipts for payouts on that stake become wrong once they are signed under a key he rotated to after the sale. Before he rotates, it is the split service that moves the money: from the first split in which the service says it follows the sale, anything it keeps paying Ben for the part he sold is owed by the service to the buyer, whether Ben signed a receipt or not. Before that split, and before Ben rotates, a colluding seller and service can keep paying Ben: a stated cost, leaving a trail.

**Selling the same share twice.** Ben's sales are put in the order he signed them on his own line. Each is checked against what he still held at that point. If he holds 40% and sells 20% to Carla and then 10% to Dan, both sales are good. If he then sells 30% to Eve, that sale gives Eve nothing, and the money Eve paid for it is owed back to her by Ben. A buyer's app pays only once the sale is on Ben's line and fits what he still holds, so Dan's app would see Carla's sale before he pays.

**A publication's split, with split services.** Where a publisher carries a work, the publication's split service can pay the work's owners' part to one of the payees of the work's agreement, and that now counts as paying the work's agreement. The second half, the work's own service signing a receipt for it, conflicts with an older rule and is a question below (QK3).

## What was built

Each item names the decision it follows and its test. Every choice no decision made, taken under the delegation of mechanics, is marked **(mechanic, the build's)**.

### F206: two settlements of one fork, a judge's among them (rule 45b; QH1)

- `LawView::deal_state` now runs through `deal_walk`, which reads the judges' settlements link by link of the chain of judgment (`arbitrated` returns each settlement with its link and request; the turn is read in `deal_walk`).
- **(a)** A link whose first settlements of the fork, neither holding the other, keep different versions has answered "unknown": all its settlements count for nothing, and the next link's turn comes at once, with no period to wait (rule 34a). "First" is read on the link's own settlements by history, as F192 reads any two **(mechanic, the build's)**; a link settling the same way twice has not contradicted itself **(mechanic, the build's)**; a link that contradicted itself speaks for nothing on that fork afterwards **(mechanic, the build's)**; a settlement out of the link's turn counts for nothing and is no contradiction **(mechanic, the build's)**.
- The double signature stays visible: `LawView::judges_contradicted(agreement)` (new) gives each link that contradicted itself with its settlements, for a client to show beside the fork.
- **(b)** A settlement every party signed and a judge's, neither holding the other, keeping different versions: the judge's is dropped and the parties' holds. Where one holds the other, the first is final (F192), as before.
- The refusal remains only for two different links' settlements neither holding the other (question QK1).
- Tests: `f206_a_a_judge_that_contradicts_itself_has_spoken_for_nothing`, `f206_b_the_parties_settlement_beats_a_judges_neither_holding_the_other`; `review_f190_2_…` rewritten at its last assertion (it pinned the QH1 refusal; now the deal stays on its reference).

### F221: finality restated; no silent second successor (rule 45b)

- Finality stands in code as it was (F192); the `review_fdb_*` tests pass unchanged.
- `LawView::before_signing(owner, candidate)` (new, `view/deals.rs`), returning `SuccessorCheck { already_signed, unnamed }`: the other successors of the candidate's parent its owner signed, from any device (the verifier reads its owner's acts, not one device's sequence); and, for a settling version, the successors of the reference its owner signed that it leaves unnamed. Proposing a version is signing it **(mechanic, the build's)**; the reference is the latest version both the candidate's line and every tip it names descend from **(mechanic, the build's)**; a successor is named where it is on the candidate's line or at or above a tip it names (F188's reading) **(mechanic, the build's)**.
- Test: `f221_a_client_never_signs_two_successors_of_one_version_silently`.

### F222: QH2 a stated cost; the newcomer's check (rule 45b)

- `LawView::joining_warnings(joining)` (new): every successor of a version on the line the newcomer joins, not on that line, that no settling version on that line names (at or above a tip it names). A branch a settlement on her line already dropped is final (F192) and is not warned of **(mechanic, the build's)**.
- Test: `f222_a_newcomers_client_looks_for_another_successor_and_warns`.

### F223: "after" on the seller's own line; the service's debt from its first citing split (rule 14; QJ1)

- The receipt half was already as built in step 12b (a receipt is after the transfer once bound to a rotation after its chain signature); it is pinned again in the new test.
- New: `ServiceAccount::owed_to_buyers` now also carries, from the service's first split citing a transfer (split key 8), every payout to the seller for that stake, receipted or not. "First" and "from" are read on the service's split numbers under the deal (DQ6): the citing split itself, and every split of the service under the same lineage numbered above the lowest citing one **(mechanic, the build's)**. What is owed is what the payout gives the seller above its due once that transfer and those before it on the seller's line are followed, at most the share sold of what the split pays the stake **(mechanic, the build's)**, so a split that follows the transfer rightly owes nothing. An entry already owed by a wrong receipt is not counted twice.
- Test: `f223_from_the_services_first_split_citing_the_transfer_the_buyer_is_owed`.

### F224: a stake sold twice, settled on the seller's own line (rule 14; review 2.8)

- `TransferEval` gains `held_before` (what the seller still held at the transfer's place), `over_sale`, and `owed_back` (the payments an over-sale owes back). `LawView::transfer` checks the transfer against `held_before`, not the version's holding alone.
- Order: the places of the chain signatures on the seller's line, never the order the transfers were written in. What the seller still held: its share in the version the transfer names, less each transfer of the same stake (by its object, across the lineage, FR7) placed before it that fitted what was left; an earlier over-sale consumes nothing **(mechanic, the build's)**. An earlier transfer counts from the seller's chain signature, whether its buyer has completed it or not, so a later buyer's client sees it before paying **(mechanic, the build's)**.
- The payment: a Finance receipt or claim fulfilling the transfer, or one the transfer's field 4 names **(mechanic, the build's; see QK4)**. `LawView::purchase` now judges a payment for a stake transfer: a purchase, or, where the transfer is an over-sale, no purchase, owed back by the seller (Finance rule 10c).
- Client conformance: `LawView::transfer_payable(id)` (new): `Ok(what the seller keeps)` once the transfer's chain signature is counted on the seller's resolved line (which, where the seller has operated homes, counts it by their receipts) and it fits; otherwise `Err(why)`. The buyer's own signature may come before or after paying **(mechanic, the build's)**.
- Tests: `f224_a_stake_sold_twice_is_settled_on_the_sellers_own_line`, `f224_a_buyers_client_pays_only_once_the_transfer_is_placed_and_fits`.

### QJ2 (a): the work's line paid through a payee of the work's agreement (rule 16)

- `LawView::split`: on a stake held by a work's agreement (F216), a payout to a payee of that agreement (its field 14, in its version in force) is read as paid to that agreement's holding; a receiver that is itself a holder of the stake is read as paid in its own name **(mechanic, the build's)**. A payout to anyone else is still a mismatch.
- **Not built:** the work's service's receipt discharging that payout. F129 (H5) and F130 (H7) say a split service's grant key never signs a split's payout; the receipt QJ2 (a) describes is exactly that. As built, it counts for nothing, and only the payee's own receipt discharges the payout (question QK3).
- Test: `qj2_a_the_publications_split_pays_the_works_line_to_a_payee_of_the_works_agreement` (it pins the H5 refusal too).

### Texts

- **Law draft 10:** a header note; rule 45b (F206's two sentences, F221's finality and client conformance, F222's stated cost and client conformance, each mechanic marked); QH1 and QH2 marked answered; rule 14 (F223, F224, their mechanics, the window's second edge, the client conformance line); the stake transfer format (fields 3 and 4, how a payment names a transfer); rule 16 (QJ2 a, as built and not built); a new list, "Found writing the decisions on deals and owning in", QK1 to QK4.
- **Finance draft 6:** a header note; rule 10c (the over-sale's payment received for nothing, owed back by the seller).
- **Freeze test suite v21:** scenario 7a extended (F206, F221, F222); a new step 9ad (F217, F223, F224).
- **Core v21:** "Open before freeze", QH1 and QH2 answered, QK1 to QK4 listed.
- Not written here: the findings log's entry for this build, left to the project lead.

## Stated costs

- **F206:** a judge that contradicts itself has spoken for nothing; where the chain has no next link, the deal stays on its reference until the parties settle.
- **F221 and F222 (QH2):** a newcomer on a branch the settlers hid is dropped by a settlement that does not name it (F192's stated cost), now reached only by settlers who knowingly double-signed past their clients' warnings. Deals that want more name a keeper (Q28).
- **F223, the window's two edges:** between the transfer and the earlier of the service's first split citing it and the seller's next rotation, a colluding seller and service can keep paying the seller; the trail shows it, and anchoring the transfer is the buyer's protection. A split that carries no number cannot be placed after the first citing split: only splits that cite the transfer, or are numbered above it, are counted.
- **F224:** an earlier transfer counts against the seller from its chain signature, even before its buyer completes it: a seller who signs a sale that is never completed has sold that share all the same, as far as his later sales go. The refund of an over-sale is a debt any wallet sees, with signed proof of the double sale; nobody polices it beyond that.

## Client conformance lines

- **F221:** before signing a successor of a version, a client checks, across all its owner's devices, whether its owner has already signed another successor of the same version; if so, it shows the first and does not sign silently; a settling version the client signs names every successor of the reference its owner signed (`before_signing`).
- **F222:** before a newcomer signs onto a deal, her client looks for another successor of the version she joins, at the parties' relays and keepers, and warns her if it finds one (`joining_warnings`).
- **F224:** a buyer's client pays only once the seller's transfer is receipted by the seller's homes and checked against what the seller still holds (`transfer_payable`).
- **F206:** a client shows a judge's contradicting settlements beside the fork (`judges_contradicted`).
- Kept from F217: a co-owner's and the buyer's client show a split paying a seller for a stake he has transferred, beside the transfer.

*None of the TypeScript clients does these yet; the library gives every client the same answer. Wiring them into the clients is a follow-up (not in `clients/collective`, where a fix runs).*

## Questions for Nobody, allegedly

One at a time. Each is a place where a mechanic could not respect a decided rule, or where the texts are silent.

1. **QK1. Two links of the chain of judgment, each settling the fork, neither holding the other.** *Laid beside it, F206:* "a judge's two settlements of one fork, neither holding the other, both count for nothing … the next link of the chain of judgment settles"; QG4: "If a fork ends up being disputed it needs to follow the chain described in the agreement." The next link's turn comes per request: where the first judge let its period pass on Ana's request but answered Ben's, both judges' settlements can stand, neither holding the other, keeping different versions. F206 answers one judge contradicting itself, and the parties against a judge, not two judges. *As built:* the verifier refuses to name a version in force, as it did for QH1. Options: (a) both count for nothing, as one chain contradicting itself, and the deal stays on its reference; (b) the earlier link's holds, its turn being first; (c) the later link's holds, the earlier having lapsed on one request.
2. **QK2. What a seller still held, across versions and after buying.** *Laid beside it, F224:* "each is checked against what the seller still held at that point"; FR7 (a stake followed by its object across versions). As built, holdings start from the version each transfer names, less earlier transfers of the same stake anywhere in the lineage. Two cases fail closed: a later version that writes the buyer in as a holder while the transfer still stands counts that sale twice against the seller's later sales; and a share the seller bought by transfer, not yet written into a version, is not counted as his. *The story:* Carla buys 20% from Ben; Ana, Ben and Carla sign a new version writing Carla in; Ben's later sale of his remaining 20% reads as an over-sale. Options: (a) a version that names the transfer (cites it) absorbs it, and only transfers it does not name are subtracted; (b) holdings start from the version each transfer names, and only transfers naming that same version are subtracted (simpler, but a new version still listing the old holdings would let a seller sell again); (c) as built, with the cost stated.
3. **QK3. The work's service's receipt for the publication's split.** *Laid beside it, QJ2 (a), the project lead's:* "the work's service's receipt names the publication's split, as Money's routes chain receipts"; **F129 (H5) and F130 (H7)**, decided 5 October 2026: a split service's grant key "never signs … a split's payout", so that "a payout without the payee's own receipt stays the service's open obligation". They contradict: the receipt QJ2 (a) needs is a grant key signing a split's payout. *As built:* only the payee's own receipt discharges the publication's split; the work's service's receipt counts for nothing, so the work's service has no incoming receipt of its own to split. Options: (a) an exception to H5 and H7: a grant key of a service the work's agreement names may receipt a payout of another agreement's split paying that work's agreement's line, never a split by the same service; (b) the payee (Ana) receipts the payout with her own key, and the work's service's incoming receipt names her receipt (a hop, as Money's routes do), not the split; (c) the publication's split pays the work's line to the work's service itself, named as the work's agreement's receiver.
4. **QK4. "A transfer names the buyer's payment" beside "a buyer pays only once the transfer is receipted".** *Laid beside it, F224's mechanics (the project lead's under the delegation):* "a transfer names the buyer's payment, so the over-sale's refund is an ordinary Money refund"; and its client conformance: "a buyer's client pays only once the seller's transfer is receipted by the seller's homes and checked". An act cannot name by hash a payment made after it, so the two mechanics cannot both hold. *As built:* the payment names the transfer (it fulfils it, Finance field 5), and a transfer may still name a payment made before it in field 4; either is the over-sale's payment, owed back by the seller. The decided rule (an over-sale confers nothing, its payment owed back by the seller) holds either way. Confirm, or say which direction you want.

## Readings taken, to confirm

- **D1.** "Neither holding the other" for a judge's two settlements is read with F192's history (each settlement's history: the versions it keeps and drops, with their histories); a judge's second settlement holding its first is after it, and counts for nothing, as before.
- **D2.** A judge that contradicted itself on a fork stays "unknown" on that fork for good: a third settlement of its, holding both, does not revive it.
- **D3.** F221's "across all its owner's devices" is read as: the verifier holds the owner's acts, whatever device signed them; gathering them from the owner's homes before signing is the client's part.
- **D4.** F223's debt is the service's, owed to the buyer, in the part of the payout above the seller's remaining due; the service settles with the seller (F217).

## Test counts

- **Before** (main at `c2ced0e`, this branch's base): Rust workspace, **558 passed, 0 failed, 1 ignored**.
- **After:** Rust workspace, **566 passed, 0 failed, 1 ignored**: eight new tests in `core/tests/law_collective.rs` (`f206_a_…`, `f206_b_…`, `f221_…`, `f222_…`, `f223_…`, `f224_…` twice, `qj2_a_…`), one existing test rewritten at one assertion (`review_f190_2_…`: it pinned the QH1 refusal). The `review_fdb_*` tests pass unchanged.
- **Seen to fail first:** `f206_a`, `f206_b`, `review_f190_2` (rewritten), `f223` and `f224_a_stake_sold_twice…` failed by a failed assertion with their change switched off in the library (the deal unreadable on QH1; no debt from the citing split; the over-sale's payment a purchase); `f221`, `f222`, `f224_a_buyers_client…` and the F224 fields failed by not compiling against the methods and fields they need; `qj2_a` failed by a failed assertion before the split change (the work's agreement read as unpaid, Ana as no holder).
- **TypeScript clients** (`scripts/test-all.sh`): RESULT_PLACEHOLDER

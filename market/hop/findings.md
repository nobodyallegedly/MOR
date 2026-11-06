# Hop: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks. Read at the rehearsal commit `af2ed6f8`: Money draft 13, Agreements draft 23, freeze test suite v36, the payment cMIP (draft 6), the split cMIP (draft 4).*

## H5. A metric share nobody earns can only go to the owners' line (6 November 2026, filed jointly with Ampersand)

**Tried.** A bundle whose ownership stake is meant to draw nothing: members hold the stake so that the metric can pay them (H4), and every payment is divided off the top, by use and by fees, so that nothing is left on the owners' line. Then a payment whose metric share nobody earns: no record arrives from the measurer by the plan's deadline.

**The texts.** "What is left, the owners' line, goes to the owners alone, by their shares" (Agreements rule 22), and a metric share is paid off the top only where records measure it (rule 29; the split's key 7). A metric share with no record is therefore not taken off the top, and falls to the owners' line: every holder of the stake, equally where the stakes are equal, departed holders included. For a role share nobody fills, the plan may choose: the owners' line, held open, or a named party (rule 22, plan key 3). For a metric share nobody earns, it has no such choice.

**Expected.** Either the plan's choice for an unfilled role (key 3) applying to a metric share no record measures, so a bundle can send it to a named party (its own vault, or held open until the measurer answers); or the texts saying, as a stated cost, that a metric share no record measures always falls to the owners' line.

**Rules.** Agreements rules 22 and 29; "Split plan and split (type 8)", plan keys 0 and 3, split key 7.

**Blocks.** Nothing in normal running: the bundle's terms can make the measurer's record never empty. It leaves a measurer's failure, a record that never arrives, paying a stake that was built to draw nothing, departed holders included.

**The question.** Should a plan be able to say where a metric share goes when no record measures it, as it can for a role share nobody fills?

## H4. "A metric pays only identities the plan already pays": the code is clearer than the text (6 November 2026)

**Tried.** Check whether a bundle's members, holding the pool's ownership stake, can be paid by a metric share in a split where the owners' line pays them nothing (a stake paid nothing, or a holder whose part rounds to zero).

**The texts and code.** Agreements rule 30 says "a metric pays only identities the plan already pays", and the split format says "its receiver is one the plan already pays". Neither says whether a holder of the stake whose payout in that split is zero is "already paid". The reference verifier answers yes: it counts as already paid the publication's partners and every holder of the stake in the version in force, whatever its payout (`core/src/agreements/view.rs`, `check_owners_line`, `holders_out.extend(as_held…)`, read by the metric check).

**Expected.** The text to say what the code does: "the publication's partners and every holder of the stake of the ownership agreement it names, in the version in force for the receipt, paid or not".

**Correction to H3.** H3 says that adding a member's publication to a bundle is a new version of the pool's publication, signed by every party. That holds where members are paid as partners. Where members hold the stake of the ownership agreement the pool's publication names, an admission continues that agreement's line, and the publication follows it from the next payment (rules 12 and 15), with no new version of the pool's terms.

**Rules.** Agreements rules 12, 15 and 30; "Split plan and split (type 8)"; the verifier's metric check.

**Blocks.** Nothing. Wording only; the code gives the answer bundles need.

## H3. A metric measured by each buyer has no grammar (6 November 2026)

**Tried.** Design the split both DAOs ask for: each subscriber's payment divided among the works that subscriber used, measured by the subscriber's own client, so that measuring sits with the buyer, not with the pool or the split service.

**The texts.** A split plan's metric is `[ module, measurer, ? params ]`, "the measurer named in advance" (Agreements, "Split plan and split (type 8)"). The metric's evidence is a record signed by the identity that measured it (rule 29), and "a metric pays only identities the plan already pays" (rule 30). So a metric has one measurer, named in the plan before anyone subscribes; a subscriber who joins later is not it. And every receiver of a metric share must already be paid by the plan, so adding a member's publication to a bundle is a new version of the pool's publication, signed by every party.

**Expected.** Either a metric whose measurer is the payer the payment's commitment names (as a referral's evidence counts only when that payer signs it, rule 22), or the texts saying that a buyer-measured metric is not a core model, as they say of payer-side splitting (rule 16).

**Inside the core today.** A measuring service named in advance collects each subscriber's signed statement and signs one record per subscriber per period. It works, but the measurer then sees what every subscriber used, which is what the buyer-measured design was meant to avoid.

**Rules.** Agreements rules 22, 29 and 30; "Split plan and split (type 8)", the `metric` entry and the split's key 7.

**Blocks.** The buyer-measured bundle as Ampersand and Backlot described it. Not a bundle measured by a named service.

**The question.** Is a metric's measurer meant to be a single identity named in advance, never the payer of each payment?

## H2. Money rule 18's wording, against backups (6 November 2026)

**Tried.** Read whether a payment to a backup split service, naming the publication's price tag, is a purchase, from Money alone.

**The texts and code.** Money rule 18 says a payment of a tag "pays the price it states to the tag's payee". Agreements rule 17 says a backup is paid "the payment still naming the tag", and receipts in its own name. The verifier (`core/src/agreements/view/publishing.rs`) and a vector in `core/vectors/verdicts.json` ("a payment to a backup the publication lists, still naming the tag, receipted by the backup in its own name: a purchase") read it as a purchase.

**Expected.** The same answer from Money's own words. Money rule 18 already hands the purchase judgment to Agreements, so there is no contradiction, but a reader holding Money alone could read a backup's payment as no purchase. A clause in Money rule 18 pointing to Agreements rule 17's backups would close that.

**Rules and vectors.** Money rule 18; Agreements rule 17; the vector named above.

**Blocks.** Nothing. Wording only.

## H1. A refund for a broken vow has nowhere to wait (6 November 2026)

**Tried.** Design a refund cMIP for a promised delivery: a buyer pays for a vow (a season, a service), contests the sale, and is owed money back under the publication's refund terms.

**The texts.** Agreements rule 13 leaves what a buyer is owed back when a vow fails to "the bundle's terms: the publication's words, or a cMIP's", and a contest "voids nothing". But every place the money could wait for the buyer's verdict is closed by the core:

- The split service signs a split for every incoming receipt (Agreements rule 20), summing exactly (rule 21), and "MUST NOT pay anyone outside the owners …, the partners, the roles as evidenced, and the fees the plan makes owed" (rule 27). The payout format ("Split plan and split (type 8)") has no entry for money owed back. A contested sale is a purchase, so it is split like any other.
- Rule 30's list of money owed back from what the service holds covers payments racing the publication's ending, not a contested sale.
- Batching (rule 26) lets the service hold money, but when it splits, it must still pay the owners.
- A holding hop on the same rail and unit is not a forward: "Only conversion hops forward" (Money rule 25).

So a refund cMIP can only make each holder owe back their own payout after it is paid out, as rule 11 does for a payment racing an ending: the slowest and least collectable refund, the buyer chasing every owner.

**Expected.** One of two: a split cMIP may name, as a payout, money owed back under the publication's refund terms, paid to the payer the payment's commitment names (rule 22), to the refund rail its claim names (Money rule 17); or the texts say plainly, as a stated cost, that a vow's refund is owed by the holders after payout.

**Inside the core today.** An escrow that is the seller of record: a lone seller's publication (Agreements rule 11) whose drafter is the escrow, reselling the vow and paying the real seller once the buyer confirms. It works, but the buyer's contest is then against the escrow, and the real seller's record shows nothing.

**Rules.** Agreements rules 13, 20, 21, 26, 27, 30 and "Split plan and split (type 8)"; Money rules 17 and 25.

**Blocks.** Hop's refund cMIP for promised deliveries. Not refunds for proven deliveries, nor for payments racing an ending.

**The question.** Is a contested sale's refund meant to be unable to come from what the split service holds?

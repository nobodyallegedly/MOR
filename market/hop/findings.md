# Hop: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks. Read at the rehearsal commit `af2ed6f8`: Money draft 13, Agreements draft 23, freeze test suite v36, the payment cMIP (draft 6), the split cMIP (draft 4).*

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

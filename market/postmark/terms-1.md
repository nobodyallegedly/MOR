# Postmark terms, draft 1

*7 November 2026. Read against commit `af2ed6f8`. Published by Postmark, to be signed as public acts by its identities once they exist on regtest; until then they are text. Nothing is updated: a change is terms-2, and this draft stays. Read with `price-list-1.md`. Not part of the core.*

## Postmark's identities

Each service is run by its own identity, so that each can be checked, passed on or stopped on its own:

| Identity | Signs | Signs nothing else |
| --- | --- | --- |
| Keeper | keeper records (Agreements type 2), in one sequence | yes |
| Desk | intake receipts, silence statements, deposit receipts and delivery records, notices, these terms and the price list | yes |
| Clock | the anchoring service's publication, price tags, tickets and batch notices (anchoring cMIP draft 8); the anchors of the keeper's sequence | yes |
| Stamp | stamps (timestamp clock Module draft 2) | yes |
| Relay operator | the keeper relay's declaration | yes |

Every identity declares a home Postmark runs for its own identities only, self-hosted, and none run by any keeper, auditor or party of an agreement Postmark keeps. A backup home of an independent operator will be added once one exists (`corrections.md`, 7 November). *Stated cost:* until then, if a thief took one of our chain keys, that identity would be contested from that point, and with it the acts it signs after. It would show, but not be settled.

## Lines common to every service

1. **The same for everyone.** Every term and every price is public and the same for every customer. No private rate, no priority, no exclusivity.
2. **Signed before served.** A service runs for a customer once the customer has signed its term and Postmark's desk has signed it back. The one exception is line 7: a keeper records any act that reaches it, term or not.
3. **We read nothing.** Postmark holds no content key and accepts none. Keepers are sealed (Agreements rule 43). On an agreement we keep, we are never arbitrator or verifier.
4. **We judge nothing.** On an agreement we keep, we are never the absence authority, a judge of forks, or a link in a chain of judgment beyond our own keeping. We do not contest, though rule 54 gives keepers standing. We sign facts, never verdicts.
5. **We hold no stake.** Our fees are flat lines in signed terms, never a share of what we keep. We are never a partner of a publication whose agreement we keep.
6. **What we keep about use.** Billing needs the customer's identity hash, the account tags presented, and counts of records, deposits, hashes and statements per period. Nothing else is kept. We keep no record tying a fetch or a delivery to an identity, address, session or key beyond what a delivery record names. Rate limits are counted in memory and written nowhere.
7. **Refusing nothing.** A keeper act from any signer is recorded. Each signer identity has a free allowance of three records per period, so that a party's liveness act or contest never waits on payment. Beyond it, a record is billed to the customer whose term lists the signer, or whose account tag the delivery presents, up to that customer's cap; otherwise to the signer, paid by price tag with the delivery. If unpaid deliveries ever flood the relay, Postmark may require payment before recording beyond the allowance, by a notice signed and published the day it applies. The allowance is never withdrawn.
8. **Notice.** Every service is stopped or changed for the worse only after 38,880 blocks' notice (nine periods of 4,320 blocks), signed and published, naming the service. During notice, recording and anchoring continue. A price raised by a later list applies to existing customers only after the same notice; a lower price or a new service applies once signed.
9. **Leaving and hand-over.** A customer leaves at the end of any period. Everything Postmark holds for an agreement (acts, records, intake receipts, anchors, tickets, batch notices) is handed over in bundles (relay transport, "Bundles") at no charge to every party of that agreement, not only to whoever pays. Our records survive in every copy (rule 39).
10. **Passing on.** A keeper is named by its operator's identity hash and cannot pass to a successor identity (`findings.md`, F-PM-3). Postmark's identities are held so they can change hands by rotation. A change of hands is announced as a signed notice with the same notice as line 8, and no party has to re-sign.
11. **Unpaid periods.** A customer's unpaid periods stay owed. Postmark never pauses a keeper for non-payment: while a term is unpaid, acts it covered fall under line 7, and recording and anchoring continue for every agreement naming us.
12. **Disclosure.** Where Postmark is a supplier of a party to an agreement it keeps (as for Plain Words' own deals), the term says so.
13. **Attacked on purpose.** Counterparty is invited to attack every service below on regtest, the gap between an intake receipt and its record above all. Findings are published once fixed.

## Keeper

- **Named** in an agreement's terms (field 3), alone or with others, under any rule (`[0]`, `[1, k]`, `[2, operators]`).
- **The relay** accepts every act delivered for agreements naming us. It cannot tell which agreement an act is for, and does not try: every act delivered is recorded in our one sequence, and a verifier holding the opened act places it (rule 42).
- **An intake receipt** per act, signed by the desk on arrival, naming the act's id, its signer, and the keeper position its record will take. *An intake receipt with no matching record at that position is Postmark's own signed proof against it.* Its format will be published as an xtype.
- **One record per act**, act id and signer, never content (rules 37, 43). Before recording, the keeper checks the signer's identity chain at its homes and records any rotation it sees (rule 40).
- **Serving.** The relay serves every act it recorded, byte for byte, beside its record, so a record of ours always has its act (rule 42).
- **Anchoring.** The keeper's sequence is anchored through Postmark's clock only, on the time reference the agreement names, never through another operator's service, and never another keeper's sequence through ours. **C = 144 blocks**: no more than 144 blocks pass between recording an act and anchoring a record at or after it. Anchoring is included in the keeper fee.
- **Retention.** For as long as the agreement names us, and after for as long as its own terms require, then nothing. Copies others hold are theirs.

## Clock

- A pooled anchoring service under the anchoring cMIP draft 8, on the Bitcoin clock Module, regtest only until MOR is frozen: one publication selling the cMIP's terms, one price tag per tier, tickets and batch notices as the cMIP writes them, refunds for omission or default under its publication's refund terms.
- It never learns which act it anchored: payers send a leaf mixed with a blind (item 16).
- It anchors the keeper's sequence and anything for anyone. It anchors no other keeper's sequence.

## Stamp clock

- A timestamp-Module identity. A stamp proves that Postmark's stamp identity signed it, naming those acts and that time: our word, and only that. It compares with no other clock (anchoring cMIP, "Anchors" 2). For what protects nothing; never for a payment, a lock change or a deadline.

## Deposit

- A sealed act delivered to the relay for a bare key or a named recipient, recorded on arrival by an intake receipt, and anchored with the keeper's sequence when it belongs to an agreement we keep, or by the clock otherwise.
- When it is fetched against the pickup tag or nonce presented, the desk signs a delivery record (relay transport, "Delivery records"), naming the deposit and the tag, never an identity.
- *Stated limit:* a deposit present is proven, by its intake receipt, its record and its anchor. A deposit absent is Postmark's signed word, which its own intake receipts would prove false if it lied.

## Silence statement

- On request, the desk signs: "of signer S, on our keeper's sequence between records m and n, we recorded these acts", which may be none. For a deposit: "no deposit for tag T between our anchored records m and n". Each names the anchored records it spans.
- It decides nothing. Anyone holding our sequence can compute the same. It is falsified by any intake receipt or record of ours inside its span.

## Absence-proof cMIP

- Written by Postmark with Plain Words, free, public, no fee entry, replaceable. Postmark writes; it never runs the judgment.

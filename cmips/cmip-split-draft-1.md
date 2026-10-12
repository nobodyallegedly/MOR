# cMIP: Split

*Draft 1, 11 October 2026 (roadmap step 13, the split Module; F249, F250). **Experimental**: an instrument for testing the Agreements MIR, its costs stated, never for real money (decided by Nobody, allegedly, 2 October 2026). Not approved. Written against Agreements draft 10 as revised in place for F249 and F250 (rules 16, 18a, 18b, 21, 23, 30; terms fields 8, 14 and 29; Tasks), Money draft 6 and the payment cMIP draft 2. Code: `split/` (crate `mor-split`).*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## In plain words

*When a work earns money, its owners' agreement says who gets what. A split service receives the money and pays each owner their cut. This cMIP is the rulebook such a service, and anyone checking it, follows for two questions: which service receives this payment, and how much each person gets.*

*The owners can name backup services, in order, in case the first one does not answer. Each payment tries the first service; only if that attempt fails does it try the next, and so on. The next payment starts again with the first. This is not a chain of judges with deadlines: it is a list of attempts, payment by payment.*

*Whatever this cMIP says, the core keeps one promise: money only ever goes to a service the owners signed for. This cMIP chooses among them; it can never add one. And each owner can check, once something is bought, whether their cut reached their own payee pointer, or their vault.*

## Purpose

This cMIP fills the Agreements MIR's split task (task 8; Development, task table; Agreements, "Tasks", rule 18a). It defines:

- **the receiver for a payment**: given the agreement and the attempts made for a payment, which of the services the signed terms name receives it;
- **what counts as a failed attempt**, by its parameters, which the agreement carries in terms field 29, key 1, signed with the terms;
- **the amounts**: an amount received divided by the split plan, summing exactly, with its declared remainder rule.

An agreement names it for task 8 (Agreements, terms field 2), or as its split plan's key 1 (terms field 8); where both name one, the same (Agreements, "The split service's backups").

## Dependencies

Identity, Envelopes, Text, Money and Agreements; the payment cMIP draft 2, whose rail Modules are all request rails.

## The services, in order

The services are those the signed terms name, in this order: **field 14's service first** (the designated pointer, F248), then **each backup of field 29**, in the order listed (F250). In a deal each is named by one grant per payee; in a collective, by one grant of the collective (Agreements, "The split service's backups"). This cMIP reads them from the agreement's version in force and never from anywhere else.

## What counts as a failed attempt

The parameters, terms field 29, key 1:

```cddl
failure = {
  ? 0 => uint     ; seconds the payer waits for the service's payment request once asked, above zero; absent: 60
}
```

Absent, every default applies. An unknown key, or a wait of zero, makes the parameters invalid; a verifier holding this cMIP then reads only the designated pointer as paid on the agreement's holding (fail closed).

An **attempt** is one try to pay one service for one payment. On a request rail (payment cMIP draft 2), the payer asks the service for a payment request (an invoice, a fresh address) for that payment, then pays it. The payer is whoever pays the agreement: a buyer, or the split service of the layer above (Agreements rule 16). An attempt is:

1. **Succeeded** when the payment is made to the service's request: the service's receipt (Money) is the proof.
2. **In progress** while the service has given a payment request not yet paid, or has been asked and the wait has not passed.
3. **Failed** when the service refused, or gave no payment request on any rail its own signed pointer names that the payer can pay; or gave no payment request once the wait passed after asking; or its request could not be paid: the rail found no route to it, or it expired before the payment could complete.

*Why these: each is something the payer sees on its side of the rail, the same on Lightning and on-chain. Draft 1 asks nothing of the service beyond what the payment cMIP already does.*

## The receiver for a payment

**Attempts run per payment, in order.** For each payment, the first service is tried first. The next is tried only where the attempt before it failed. **The receiver for this payment is the first service whose attempt has not failed**; where every attempt failed, there is none, and the money stays with the payer, its obligation open (Agreements rules 24, 29). **The next payment starts again from the first service** (F249: "Everything reverts back if attempts 1 succeeds."). A payment never skips a service whose attempt did not fail.

**Never an address the owners did not sign.** The receiver is always one of the services the signed terms name; this cMIP adds none (Agreements rule 18a, the core's guarantee).

**What a verifier is told.** The core runs no cMIP: a verifier states, for a payment, which services' attempts failed, as this cMIP answers (the library's `attempts_failed`, a fact the caller states, like a judge's lapsed period). The payment is named by the act that pays the agreement: the split of the layer above whose payout carries it, or the buyer's receipt or claim.

*Stated cost: failure is the payer's word.* The payer alone sees whether the service answered, and a split of the layer above naming the backup shows only that its service says the attempt at the first failed. A payer may send a payment to a backup with the first service working. *What bounds it:* the backup is one every owner signed (the guarantee), so the money still reaches a service of the owners' choice, and its split still divides by the same plan; what differs is whose fees and whose speed. The first service, which saw no request, can say so publicly. A later draft may ask for evidence (the service's refusal signed, a rail's failure record); draft 1 does not.

## The amounts

`amount` smallest units received, divided by the split plan (Agreements terms field 8):

1. **Shares off the top** (plan key 4): each gets its part, in millionths of the amount, rounded down.
2. **The rest** is divided among the other shares in proportion to their parts: each share its exact part rounded down, the leftover units one each to the shares with the largest remainders; where remainders are equal, to the share listed first in the plan. *The plan's order is signed with the terms; the order in which holders are listed plays no part (Agreements rule 21, F150).*
3. **A stake's pot** goes to the stake's current holders by rule 15a, ties by turns: each tied holder's count of leftover units from that stake so far, as the service's previous split for the stake carries it (F165, F171), the fewest first, then the smallest identity hash. **A named receiver's pot** goes to it.

**The remainder rule this cMIP declares** is rule 15a, at each step as above (Agreements rule 21). Every split sums exactly to the amount received, and carries the running count of leftover units for each stake it pays (split key 4, F171).

**Draft 1 computes stakes and named receivers only.** A plan with role shares or metric shares, or terms with fees (field 28), is refused, never guessed: a service running draft 1 does not split under such terms.

## Delivery

A service running this cMIP delivers each split to every holder it pays (Agreements, "Split plan and split", Q9), and pays each payout as a simple Money payment, each receiver signing its own receipt naming the split (rule 23). Through a layer, a receiving service receipts the share in its own name (F235).

## Reasoning

- **Why the services and the failure condition are this cMIP's fields** (F250, decided by Nobody, allegedly: "That agreement names a cMIP and within the cMIP fields it specify the split service, its backup and its failure condition to move from primary to back up service."). What counts as failure depends on rails and services (F249), so the core leaves it to a cMIP and keeps only the guarantee and each participant's check.
- **Why attempts, not stages** (F249: "A judge chain has stages. A back up chain has attempts if previous one fails."). A judge's period runs once per question; a backup serves one payment at a time, and a working first service takes the next payment back.
- **Why a wait in seconds, not on the agreement's time reference.** The wait is the payer's own patience for one request, seen on its side; no one else judges it, so no time reference is needed (F249: F246's stages and deadlines do not apply to backups).

## Open

- **QS1** (Agreements draft 10, "Open in this draft"): how a buyer paying the work directly reaches a backup, since the owners' payee pointer leads to one service (rule 18). As written, the per-payment attempts serve payments through a layer, whose payer pays the service's own pointer.

## Freeze scenarios

- A payment through a layer: the attempt at the first service gets no request within the wait; the backup receives the share, splits it exactly, every holder receipts its cut at its own flow address; the next payment is tried at the first service again (freeze suite v21, scenario 7, step 8b). *Run (`split/`, tests `step13`).*
- Every attempt failed: no receiver; a payout naming anyone the owners did not sign is a mismatch, whatever is stated (scenario 7, step 8a). *Run (core library).*
- The amounts: every split sums exactly for any amount; leftovers by rule 15a with turns; the plan's order deciding only between shares, holders' order deciding nothing; roles, metrics and fees refused. *Run (`split/`, tests `divide`).*

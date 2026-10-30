# cMIP: Split

*Draft 4, 30 October 2026 (the Dubsar Suite's round 8, F407), on draft 3 (`cmip-split-draft-3.md`), for Nobody, allegedly, to approve. **Experimental**: an instrument for testing the Agreements MIR, its costs stated, never for real money (decided by Nobody, allegedly, 2 October 2026). Not approved. Written against Agreements draft 17 (the redesign from bake to publication: the publication, type 6, in place of the standing offer and terms fields 8, 14, 28 and 29), Money draft 11 and the payment cMIP draft 2. Each change from draft 3 is marked **new in draft 4**. Code: `split/` (crate `mor-split`), which follows; its spec hash is a new test value, since a changed specification is a new one. Drafts 1 to 3 are kept.*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples.*

## Reassessment

*Written first, before the text, because the redesign moved much of what this cMIP used to carry into the core.*

**What it still does.** *Two things, the same two as before:*

- *it says **which split service receives a payment**: the publication's own service first, then its backups in order, each tried only if the one before failed for that payment;*
- *it computes **how much each person gets**: the partners, the plan's role shares, metric shares and fees, all off the top, and then what is left, the owners' line, shared among the owners by what they own, every leftover unit where the core's rule 9 sends it.*

*The core never computes amounts: it checks them. Without this cMIP a split service would have nothing to follow, and a verifier would show every amount as unknown. So it still has work.*

**What the core took over.**

- *The **publication** now carries everything this cMIP used to read from the owners' terms: the split service (field 3), the split plan (field 4), the partners (field 2), the backups (field 11) and what counts as a failed attempt (field 12), all signed by every party.*
- *The **owners' shares are read by reference**: the publication names the ownership agreement (field 1), and each payment is divided by the version of it in force for that payment, the one the split service's receipt names (its field 9). This cMIP no longer reads a stake from the plan; it is handed the holders of that one stake.*
- *A **purchase is a payment naming a price tag** the publication counts, so who paid for what is the core's and Money's, not this cMIP's.*
- ***F280 is structural.** The plan's format holds only role shares and metric shares; a named receiver is a partner; the owners' line is whatever is left. "Anyone but the owners off the top only" no longer needs this cMIP to refuse a plan: the core's format cannot express the alternative. This cMIP still refuses such a plan if handed one, so it never divides one.*

**What went.**

- *Terms fields 8 (the plan), 14 (payee grants), 28 (fees) and 29 (backups): withdrawn. Their places are the publication's fields 4, 3, 4 key 9 and 11 with 12.*
- *Payee grants: the split service is a party and signs the publication; no grant per payee names it.*
- *A plan with several stakes, each with its part of the rest, and the plan's order deciding between them: gone. One publication names one ownership agreement, with one stake.*
- *`ShareRule::Stake` and `ShareRule::Receiver` in the plan: gone. Receivers are partners.*
- *Draft 2's mechanic for a plan with no stake in the rest (F283): gone. A deal with no owners, a worker and a platform, is now a lone seller's publication with the platform as a partner; the owners' line always takes what is left.*

**Keep or retire: keep.** *The amounts and the route are still this cMIP's, and draft 4 can now compute what drafts 1 to 3 refused: roles, metric shares and fees.*

## In plain words

*When a work earns money, its publication says who gets what. A split service receives the money and pays everyone. This cMIP is the rulebook such a service, and anyone checking it, follows for two questions: which service receives this payment, and how much each person gets.*

*The publication can name backup services, in order, in case the first one does not answer. Each payment tries the first service; only if that attempt fails does it try the next, and so on. The next payment starts again with the first. This is not a chain of judges with deadlines: it is a list of attempts, payment by payment.*

*The money is divided in two steps. First everything paid to people who do not own the work: the partners (a label, a client, a relay), the helpers the payer chose (a role), the shares following plays or views (a metric), and the fees of the Modules the publication pays for. Each is a fixed fraction of the payment. Then everything left goes to the owners, by what each owns. "Shared ownership means shared fruits" (Nobody, allegedly).*

*Whatever this cMIP says, the core keeps one promise: money only ever goes to a service the parties signed for, and only to people the publication names. This cMIP chooses among them; it can never add one.*

## Purpose

This cMIP fills the Agreements MIR's split task (task 8; Agreements rules 16 to 29). It defines:

- **the receiver for a payment**: given the publication and the attempts made for a payment, which of the services it names receives it (rule 17);
- **what counts as a failed attempt**, by its parameters, which the publication carries in its field 12, signed with it (new in draft 4: was terms field 29, key 1);
- **the amounts**: an amount received under a publication, divided, summing exactly, with its declared remainder rule: every share but the owners' line off the top, the owners' line what is left, divided by the one stake of the ownership agreement the publication names, read by reference (new in draft 4).

A publication names it for task 8 (field 9), or as its split plan's key 1; where both name one, the same (Agreements, "Publication (type 6)").

## Dependencies

Identity, Envelopes, Text, Money and Agreements; the payment cMIP draft 2, whose rail Modules are all request rails.

## The services, in order

The services are those the publication names, in this order: **field 3's service first**, then **each backup of field 11**, in the order listed (new in draft 4: were terms fields 14 and 29). Every one of them is a party of the publication and signs it (Agreements rule 11). This cMIP reads them from the publication's version the payment is judged under, and never from anywhere else.

## What counts as a failed attempt

The parameters, the publication's field 12 (new in draft 4: was terms field 29, key 1):

```cddl
failure = {
  ? 0 => uint     ; seconds the payer waits for the service's payment request once asked, above zero; absent: 60
}
```

Absent, every default applies. Field 12 is carried only with field 11 (the core's format). An unknown key, a wait of zero, or a value that is not a map makes the parameters invalid; a verifier holding this cMIP then reads only field 3's service as paid under the publication (fail closed).

An **attempt** is one try to pay one service for one payment. On a request rail (payment cMIP draft 2), the payer asks the service for a payment request (an invoice, a fresh address) for that payment, then pays it. The payer is whoever pays the publication: a buyer, or the split service of a layer above (Agreements rules 15, 17). An attempt is:

1. **Succeeded** when the payment is made to the service's request: the service's receipt (Money) is the proof.
2. **In progress** while the service has given a payment request not yet paid, or has been asked and the wait has not passed.
3. **Failed** when the service refused, or gave no payment request on any rail its own signed pointer names that the payer can pay; or gave no payment request once the wait passed after asking; or its request could not be paid: the rail found no route to it, or it expired before the payment could complete.

*Why these: each is something the payer sees on its side of the rail, the same on Lightning and on-chain.*

## The receiver for a payment

**Attempts run per payment, in order.** For each payment, the first service is tried first. The next is tried only where the attempt before it failed. **The receiver for this payment is the first service whose attempt has not failed**; where every attempt failed, there is none, and the money stays with the payer, its obligation open (Agreements rules 24, 30). **The next payment starts again from the first service** (F249: "Everything reverts back if attempts 1 succeeds."). A payment never skips a service whose attempt did not fail.

**Never an address the parties did not sign.** The receiver is always one of the services the publication names; this cMIP adds none (Agreements rule 17, the core's guarantee).

**What a verifier is told.** The core runs no cMIP: a verifier states, for a payment, which services' attempts failed, as this cMIP answers (the library's `attempts_failed`, a fact the caller states). The payment is named by its receipt or claim (rule 17: a backup splits a payment only once every attempt before it failed for that payment).

*Stated cost: failure is the payer's word.* The payer alone sees whether the service answered. A payer may send a payment to a backup with the first service working. *What bounds it:* the backup is one every party signed, so the money still reaches a service of the parties' choice, and its split still divides by the same publication; what differs is whose fees and whose speed. The first service, which saw no request, can say so publicly. A later draft may ask for evidence (the service's refusal signed, a rail's failure record); draft 4 does not.

## The amounts

*In plain words: first everything paid to anyone who is not an owner, each its fixed fraction of the payment, rounded down. Then everything left, including the few units the rounding leaves, goes to the owners by what each owns.*

`amount` smallest units received under a publication, divided (new in draft 4):

1. **Off the top, each a fraction of the payment, in millionths of the amount received, rounded down** (Agreements rule 22; this cMIP's unit, as in draft 2):
   - **each partner** (field 2) its share;
   - **each role share** of the plan (key 0) that someone filled for this payment, with its evidence (rule 22): its part, divided equally among its fillers, the units that division leaves one each to the fillers with the smallest identity hashes **(mechanic, this draft's)**; each payout names the role and its evidence (payout keys 3, 4);
   - **each metric share** of the plan, its part divided among the identities its records measure (split key 7; the record's format is the metric Module's, so the service reads the measures), in proportion to their measures, the units left one each to the largest remainders, and where remainders are equal, to the smallest identity hash **(mechanic, this draft's)**; a metric pays only identities the publication already pays, never its measurer (rule 29); each payout names the share (payout key 7);
   - **each fee the plan's key 9 makes owed on this payment** (every payment; payments for a bake the publication sells; payments by a named rail Module, the receipt's field 0), **its part in millionths of the payment** (this cMIP's unit, new in draft 4; QS2), to the receiver the fee's Module names (Development field 7; absent, its creator); each payout names the module (payout key 5).

   What comes off the top together is at most 1,000,000, the whole payment; a payment whose top would take more is refused. *The core's count check covers partners, roles and metric shares; the fees owed depend on the payment, so this cMIP checks the whole.*
2. **What is left is the owners' line**, every unit the rounding above leaves included:
   - for **a lone seller's publication** (no field 1), its drafter's, whole, in one payout;
   - otherwise, divided among **the holders of the one stake of the ownership agreement field 1 names, in the version in force for this payment** (Agreements rule 12: the version the split service's receipt names in its field 9, read by reference), by their shares, rule 9: each its exact share rounded down, leftover units one each to the largest fractional remainders, ties by turns, the tied holder with the fewest leftover units from this line so far first, as the service's previous split on the line carries the count (split key 4), then the smallest identity hash. Each payout names the ownership agreement by its founding version (payout key 2). The split carries the running count after it, `[ [0, count] ]`.

**A role nobody fills** follows the plan's key 3. **To the owners' line** (the default): its part is not taken off the top, so it is left to the line. **Held open, or to a named party: refused**, the service does not split such a payment under draft 4 (QS3).

**A metric share no record measures: refused** (QS4).

**Only role and metric shares are in a plan.** A plan carrying a stake share or a named receiver (which the core's format refuses) is refused, never divided: a named receiver is a partner, and the owners' line is what is left (F280).

**The remainder rule this cMIP declares** is as above at each step: rounded down off the top, the rest to the owners' line by rule 9 (Agreements rule 21). It never depends on the order in which anything is listed: not the holders', not the fillers', not the partners'. Every split sums exactly to the amount received. *Partners are paid within one unit of their exact share, as the core checks; the units their rounding leaves go to the owners, never to a partner.*

**A holder that is a collective** is paid at the collective's identity (rule 23). **A holder that is itself an ownership agreement** is paid through it (rules 15, 23): draft 4 divides one line; the service divides that holder's part again among its own holders by the same rule, each payout naming that agreement in key 2 (QS5).

## Delivery

A service running this cMIP delivers each split to every holder and partner it pays (Agreements rule 20), and pays each payout as a simple Money payment, each receiver signing its own receipt naming the split (rule 23).

## Reasoning

- **Why the services and the failure condition are the publication's fields** (F250, decided by Nobody, allegedly: "That agreement names a cMIP and within the cMIP fields it specify the split service, its backup and its failure condition to move from primary to back up service."). The agreement that names them is now the publication (new in draft 4); what counts as failure still depends on rails and services (F249), so the core leaves it to a cMIP and keeps only the guarantee and each participant's check.
- **Why attempts, not stages** (F249: "A judge chain has stages. A back up chain has attempts if previous one fails.").
- **Why everything but the owners off the top** (F280: "Shared ownership means shared fruits."). *A non-owner beside the owners in the rest would dilute them as if it were a co-owner. The publication's format now makes this the only shape.*
- **Why the units the top's rounding leaves go to the owners** (new in draft 4). *Each share off the top is a fixed fraction the parties signed; the owners' line is "what is left" by definition. Sending the rounding's units there needs no tie-break between shares, so no list's order matters.*
- **Why a wait in seconds, not on the publication's time reference.** The wait is the payer's own patience for one request, seen on its side; no one else judges it.

**Its rules (the order of services, a failed attempt, the receiver, the amounts) are a reference implementation** (draft 3, F326): given as text and as a reference implementation (`cmips/split`), not a program published under Development's rule 22.

## Open

- **QS1** (since draft 1; restated in draft 4): Agreements rule 17 has every payer try the services in order, a direct buyer too, "the payment still naming the tag", and a backup receipts in its own name. The core's purchase judgment (Money rule 18: a payment of a tag pays the tag's payee) reads a payment to the backup naming a tag whose payee is field 3's service as **no purchase**, owed back, even where the attempt at the first is stated failed. The split itself is judged as rule 17 says. Which text gives way (a backup's payment of the tag counting where the attempts before it failed; a tag per service; or the backups serving only payments through a layer) is for Nobody, allegedly, to decide.
- **QS2** (new in draft 4): a fee's part (plan key 9) is read here in millionths of the payment, like every share off the top. The MIR gives role and metric parts in millionths, and leaves a fee's to the split cMIP.
- **QS3** (new in draft 4): a role nobody fills, where the plan holds it open or sends it to a named party (plan key 3, `[1]` or `[2, party]`). A split sums exactly to the amount received, and no payout form names an unfilled role's party (a payout to it is neither a partner's, a role's with evidence, a fee's, a metric's nor the owners' line). Draft 4 refuses such a payment.
- **QS4** (new in draft 4): a metric share no record measures. Draft 4 refuses; it may go to the owners' line, as an unfilled role does by default.
- **QS5** (new in draft 4): a holder that is another ownership agreement, divided through it; the library divides one line, its caller the next.

## Freeze scenarios

- A payment through a backup: the attempt at the first service gets no request within the wait; the payer pays the backup, which receipts it, splits it exactly, every partner and holder receipting its cut at its own flow address; the next payment is tried at the first service again (freeze suite, scenario 7; Agreements rule 17, F260). *Run (`split/`, tests `step13`), against the core's Agreements view: the split counts once the attempt at the first is stated failed, and breaks the plan before.*
- Every attempt failed: no receiver (scenario 7, step 8a). *Run (`split/`, tests `divide`).*
- The amounts: every split sums exactly for any amount; partners rounded down; the owners' line by rule 9 with turns; no list's order deciding anything. *Run (`split/`, tests `divide`).*
- Everything but the owners off the top (F280): a stake share or a named receiver in a plan refused by the core and by the cMIP; a top above the whole refused; a lone seller with a platform partner, exact to the unit; partners, then the owners by ownership, exact to the unit. *Run (`split/`, tests `divide`, `f280`).*
- Roles, metric shares and fees (new in draft 4): fillers equally, measures in proportion, fees by scope; an unfilled role to the owners' line; what draft 4 does not split refused (QS3, QS4, a fee with no receiver). *Run (`split/`, tests `divide`).*

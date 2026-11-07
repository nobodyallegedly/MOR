# cMIP: Split, as Hop runs it

*Draft 1, 7 November 2026, by Hop. Fills the Split task (Agreements, tasks: "Split"; publication field 9, task 8, or the split plan's key 1). Written against the texts at `af2ed6f8`. Nothing has run yet. Not core; it competes with the repository's split cMIP draft 4 and any other. It carries no fee, no key and no step only Hop can perform: anyone may run a split service under it.*

**Where it comes from.** Every rule below was settled in the participants' meetings of 6 and 7 November: with Ampersand and Backlot (the pools), Plain Words (the lines it drafts for us to execute), Pointer (how claims reach us), Counterparty (rounding, batches, the measurer's lie), Longhouse and Postmark (keepers, deposits, deadlines), Keep and The Back Row (what a service may hold, and how long). Each rule names its source.

**What waits on the core.** Refunds for a broken vow (our H1: this cMIP cannot pay one; section 9). A metric share no record measures (H5: it falls to the owners' line). Who counts as "already paid" by a metric (H4: we follow the verifier). Delivering splits to holders paid nothing (H10: we deliver broadly). Batches (none; section 6). The service's own replacement (H7: a promise, section 10). Vectors for role and metric payouts (H9: none executed on real money before they exist).

## 1. Purpose

A split service under this cMIP receives each payment under a publication in its own name (Agreements rule 16), divides it by the publication's split plan, pays every payout as its own rail payment, and shows, at every moment, what it holds and owes.

## 2. Dependencies

Money (receipts, claims, vaults, rule 29 for the payee's clock); Agreements (publications, split plans and splits, rules 9, 16 to 33, 42, 43); the payment cMIP the publication names (the commitment); the money messages cMIP draft 6, **as the way claims reach the service** (its sections 4.4 and 9; Pointer's P1); any metric Module the plan names, Hop's payment-measure Module draft 2 among them.

## 3. What the service accepts

- **The publication's version in force** for each receipt, its split plan, and the owners' shares read by reference from the ownership agreement's line (rules 12 and 15).
- **Every payer's claim** delivered to it under the money messages cMIP. A role share's evidence counts only where the payer the payment's commitment names acknowledges it in a claim of that payment (rule 22).
- **Metric records** in the format of the plan's metric Module.
- **The attempts made for a payment** (section 8, backups).

## 4. What it produces

For each incoming receipt, one split (type 8), signed, whose payouts sum exactly to what was received, partners first, then roles as evidenced, fees owed, the metric, and the owners' line by stake.

### 4.1 Rounding (Counterparty, Ampersand)

- **Partners are rounded down.** A partner's payout is the floor of its exact share. A partner never takes a leftover unit, so a partner's payout carries nothing about the rest of the split.
- **Role fillers** share a role equally, leftover units by largest remainder, ties by identity hash.
- **The metric** is divided in proportion to its record's measures; **every leftover unit of the split's off-the-top lines goes among the metric's receivers**, by largest remainder, ties by identity hash.
- **The owners' line** takes what is left, divided by stake under rule 9.
- *Declared remainder rule (rule 21): it never depends on the order in which holders are listed.*
- *The verifier accepts partners within one unit of their exact share and role fillers equal within one unit; it never checks metric amounts (its metric check reads receivers, measurer and record). Whoever holds the record and this cMIP checks those.*

### 4.2 Unfilled roles (Plain Words, Ampersand)

A role nobody fills follows the plan's key 3: **to the owners' line, or to a named party.** **Held open is refused**: evidence acknowledged after the split fills nothing (rule 22), and an open obligation names one receiver (rule 30), which an unfilled role does not have, so the money would be owed to no one.

### 4.3 Fees

Each fee entry (plan key 9) is paid **only to the receiver its Module names**, or its creator where it names none. *The core checks a fee's Module, never its receiver (Counterparty's C1); this rule is the service's.*

### 4.4 Rail fees

Who bears rail fees follows the plan's key 5, with a maximum fee per payout (key 6). Where the service bears them, they come out of its own line, never out of a payout.

## 5. When the service splits

- **At once**, unless the plan batches (rule 26) or the split depends on a record (below).
- **A payment divided by a period's use** waits for its record: its receipt is signed at once and is the service's open obligation until the split (rule 30).
- **"No record"** is split only once a keeper's anchored sequence shows the record's deadline missed: an anchor past the deadline's point and no record up to it (rule 33; Postmark). Never on the service's word.
- **Undetermined after L blocks** (the metric's long stop): split as "no record, undetermined", the split saying so; if the record is later shown met, the service owes the difference to the metric's receivers as its own open obligation (Postmark).
- **A proven lie** by the measurer: from the proof, split by none of its unused records; wait, receipts unsplit and shown, for a version naming a standby within the deadline; then use the standby's records. If none is signed by the deadline, those shares fall to the owners' line, the split saying why. Splits already made stand, the proof shown beside them (Counterparty).
- **Keepers.** The plan names an anchoring cadence finer than its record deadline. Every metric record goes to every keeper of the ownership agreement and every named successor from the first day (Postmark's F-PM-4).

## 6. Paying out (Counterparty)

- **Each payout is its own rail payment, with its own receipt.** No batches until a batch is defined in a cMIP and Money rule 12's "do not exceed" is checked in code.
- **Thresholds** (rule 26): a receiver's payouts may wait until their sum passes the plan's threshold or the plan's period ends; then each is still paid as its own payment, possibly in the same hour, **listed by hash, never in the order of payment**.
- **Below a rail's minimum**, an amount waits until it reaches it (rule 24).
- **A payout without its receiver's receipt** stays the service's open obligation (rule 30).

## 7. Delivering splits (Counterparty, Postmark)

- **Every split goes to every holder of the stake, paid or not**, and to every partner and receiver it pays: the broad reading of rule 9, conforming under either reading until our H10 is answered.
- **Delivery** is to the receiver's inbox. Where that fails, the service **deposits the split, sealed to the receiver, with a deposit service the plan names**, so the attempt is provable.

## 8. Backups, and pausing (rule 17; The Back Row)

- **Attempts.** A payer asks the first service for a payment request. An attempt fails where the service gives no request within the plan's waiting period, or **refuses with a reason**. The next backup the publication lists is then asked, the payment still naming the tag. This cMIP produces that receiver for each payment (the Split task's second part).
- **Pausing.** The publication's terms set, for its split service (rule 16): the most it may hold outside its vault, the most in its vault, and the longest any amount may wait. At **nine tenths** of what it may hold, the service refuses requests for new passes; at the **full amount**, it refuses renewals too. Each refusal says why in words, for the payer's client to show: *"This pass is paused: the split service cannot hold more money for it safely. Nothing has been taken from you."* A pause ends when payouts bring what it holds back under the level, and both days show on the record. Where a backup is named, a refused attempt goes to it.
- **No ceiling is raised to fit a pool.** A pool whose period money plus its record deadline's would exceed both together is not carried until they fit.

## 9. What this cMIP does not do

- **It pays no refund for a broken vow.** The core lets a split pay only owners, partners, evidenced roles and fees owed (rule 27); a contested sale is split like any other (our H1). Refunds the core itself owes (a payment racing an ending, one receiving neither key nor receipt; rule 11) are paid from what the service holds, then owed by each party in its share, to the payer the commitment names, at the refund rail its claim names (Money rule 17).
- **It reads nothing it does not divide by.** No titles, no times, no payer beyond the identity the payment names.

## 10. Duties of a service running it

These bind whoever runs a service under this cMIP, Hop or anyone else.

- **Custody statement.** Each period, for each publication: what the service held, where it waited (hot or vault), each movement and its rail fee, each fee pointing to its rail proof. Public.
- **Signing new versions** (our H7: the core does not enforce this). Counted on the agreement's time reference from a version offered to the service and recorded by a keeper: within **1,008 blocks**, any version that replaces it or neither adds to its duties nor lowers its line; within **288 blocks**, any version replacing a measurer after a proven lie.
- **An abandonment clause** covering the service, in every publication it serves.

## 11. Reasoning

- **Floored partners, leftovers to the metric.** *A partner learns nothing about the split from its own payout.*
- **Held open refused.** *A sink owed to no one is worse than no hold.*
- **Keepers decide "missed".** *A service that holds the money must not also be the clock that says a record was late.*
- **Separate payments, by hash.** *A batch commits several payouts under one proof the core does not yet check; order by payment would fingerprint a pass's timing.*
- **Pausing, not raising.** *Refusing money a service cannot hold safely costs a sale; holding it unsafely costs the subscriber.*

## 12. Parameters

In the plan or the publication's terms: the threshold and its period; key 5 and the maximum fee per payout; the waiting period for an attempt; the three custody limits; the metric's deadline and long stop; the deposit service.

## 13. Scenarios it should pass, once the servers open

1. A pass paid from a fresh identity; the record arrives; the split floors the partners and gives leftovers to the metric's receivers; each payout its own payment.
2. An unfilled role with key 3 naming a party; a plan asking "held open", refused.
3. A record shown missed by a keeper; another undetermined after L, later shown met: the difference owed by the service.
4. A proven lie; waiting receipts; the standby's records used.
5. A holder whose inbox refuses: the split deposited.
6. The service at nine tenths: new passes refused, renewals paid; at the full amount, renewals refused; a backup receives the refused attempt.
7. A version replacing the service, signed within 1,008 blocks, shown by a keeper's record.

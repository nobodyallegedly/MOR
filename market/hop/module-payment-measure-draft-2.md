# Module: Payment measure

*Draft 2, 7 November 2026, by Hop. Written against the texts at `af2ed6f8`. Nothing has run yet. Not core; anyone may implement it, run it as a measurer, or publish a competing Module. It carries no fee and nothing of Hop's. Draft 1 stays readable beside it.*

**What changed from draft 1, and why.**
- **Delivery corrected** (Postmark, 7 November; `Hop-Postmark-agreed-1`): draft 1 sealed records to "each keeper the publication names". A publication names no keepers; the keepers that count are the ownership agreement's (Agreements rule 42). And sealing to a keeper hands it the content key, which rule 43 forbids. Records now go to keepers locked, without their key.
- **The payer's delivery key is required** (Counterparty, 6 November; `Hop-Counterparty-meeting-1`): sealing only "where it supplied one" told the measurer which payers could check, so it could lie only to the others.
- **The record is a fixed function** of the payer's statement under weights the plan publishes, so a lie is a mismatch in bytes, provable by anyone holding the statement (Counterparty).
- **Countersigning is the default** (Counterparty): the payer's client computes the record, the measurer checks and signs it. It fits the core's single measurer named in advance (our finding H3) and removes the duty nobody can check.
- **"No record" only on a keeper's proof** (Postmark): the measurer delivers to the keepers before the deadline, and a deadline is shown missed only by a keeper's anchored sequence (rule 33). A long stop bounds an answer that stays undetermined.
- **A proven liar is replaced, never voided** (Counterparty, Ampersand): voiding its records sends metric shares to the owners' line (our finding H5).
- **A section for keepers** (Longhouse, Postmark).

**What waits on the core.** The countersigning design stands on the texts as they are. A metric measured by the payer itself waits on our H3. Where an unmeasured metric share goes waits on our H5. Who counts as "already paid" rests on the verifier's reading (our H4).

## Purpose

A split plan's metric names a Module and a measurer (Agreements, "Split plan and split (type 8)", `metric`). The measurer signs records in the Module's format, and the split service divides the metric share by them (rule 29; the split's key 7).

This Module's record is tied to **one payment**, not to a person or a period: "this payment: these measures, per receiver". A split service can divide each payment by the payer's own use without learning anything about the payer beyond what the payment itself names.

## Dependencies

Money (the payment, its receipt and claim); Agreements (the split plan, the metric, rules 29, 30, 33, 42 and 43); the payment cMIP the publication names, whose commitment this Module names; Envelopes (sealing and delivery).

## Words used here

- **Measurer.** The identity the plan's metric names. It signs every record. It is none of the identities the metric divides among, and not the split service (Agreements rule 30).
- **The payment.** One payment under the publication, named by its **commitment**, as the payment cMIP defines it; the payer's client computes it before paying, and anyone holding the receipt or claim can recompute it.
- **Statement.** What the payer's client says was used, in the period the payment covers, per receiver: the input to the record. Sealed to the measurer alone.
- **Weights.** The plan's published rule turning a statement into measures: in the metric's params, by hash.
- **Measure.** A whole number for one receiver. Only proportions matter.

## The record

```cddl
measure-record = {
  0 => hash,              ; the payment: its commitment
  1 => hash,              ; the publication, by its founding version
  2 => [* measure],       ; the measures; empty: nothing was used
  3 => hash,              ; the statement's hash
  ? 4 => any              ; the period, on the publication's time reference, for the record only
}

measure = [ receiver: hash, value: uint ]
```

Signed by the measurer, as an act of this Module.

## How a record is made (countersigning, the default)

1. The payer's client writes the statement, computes the measures from it under the plan's weights, and builds the record.
2. It seals the statement and the record to the measurer.
3. The measurer checks that the measures are the weights applied to the statement, byte for byte, and signs the record, or refuses it, saying why.
4. The measurer never adds, drops or changes a measure. It may refuse a statement it has reason to believe false, under the plan's terms, and says so to the payer.

A plan may name a measuring service that computes the record itself instead; the record and its checks are the same.

## Validity

A record counts for a payment only if all of these hold:

1. **MUST** be signed by the measurer the plan's metric names, valid under Identity.
2. **MUST** name in field 0 the commitment that the payment's receipt or claim recomputes, and in field 1 the publication the payment is under.
3. **MUST** list each receiver at most once, each value above zero.
4. **MUST** name only receivers the plan already pays: a partner of the publication, or a holder of the stake of the ownership agreement it names, in the version in force for the receipt (Agreements rule 30, as the reference verifier reads it; our H4).
5. **MUST** be the weights applied to the statement field 3 names. Anyone holding the statement can check it.
6. **One record per payment.** Two different records naming one payment, both signed by the measurer, count for nothing until the measurer signs a third naming both in `objects`, which alone counts. A record signed after the payment's split counts for nothing.

**The record carries nothing else.** No titles, no times of use, no identity of the payer, no device.

## Delivery

The measurer:

- **delivers each record locked, without its key**, to every keeper of the ownership agreement the publication names, and to every successor of a keeper the agreement names, from the first day, before the plan's deadline (Agreements rules 42 and 43; Postmark's F-PM-4: a successor that starts keeping late cannot show what arrived before);
- **seals each record** to the split service the publication names and each backup it names (fields 3 and 11); to the delivery key the payer supplied for this payment, **which is required**; and to each receiver the record lists.

A keeper learns only that the record exists and who signed it, which every split already shows.

## What the split service does with it

Under a split cMIP that reads this Module (Hop's split cMIP, draft 1):

- **The split waits for the record.** A payment divided by use is not split before its use is known. Its receipt is signed at once and is the service's open obligation until the split (Agreements rule 30).
- **The metric share is divided in proportion to the measures**, rounded as the split cMIP declares.
- **An empty record** (nothing used): the metric share is not taken off the top, and is left to the owners' line (rule 22; our H5).
- **No record, shown missed.** The service splits a metric share as "no record" only once a keeper's anchored sequence shows the deadline missed: an anchor past the deadline's point, and no record of it up to that anchor (rule 33). Never on its own word.
- **Undetermined.** If no keeper can show it either way L blocks after the deadline (L in the metric's params, longer than any keeper's chain period), the service splits as "no record, undetermined", and the split says so. If the record is later shown met, the split was wrong, and the service owes the difference to the metric's receivers as its own open obligation.
- **A proven lie.** A record that is not the weights applied to its statement is proven false by anyone holding both. From the proof, the service splits by none of that measurer's records not yet used; their receipts wait, unsplit and shown, until a version naming a standby measurer is signed within the deadline, and the standby's record for the same payment is used. Splits already made stand, the proof shown beside them. The measurer is replaced, never voided.

## For keepers

What this Module leaves for a keeper of the agreement to record (Longhouse, Postmark):

- the measurer's records, as acts of the agreement, locked, recorded as they arrive, act id and signer;
- nothing of the statement, which is sealed to the measurer alone and may be carried unreadable;
- an anchoring cadence finer than the plan's record deadline (a day against seven days, for instance), so "met" and "missed" can be shown.

## Reasoning

- **Tied to the payment, not the payer.** *A record naming a payment gives the service exactly what it needs to divide that payment. Where the payer pays each period from a fresh identity, no record links two periods.*
- **Receivers, never works.** *The split pays identities; measuring per receiver gives the service nothing about what was watched, heard or played.*
- **A fixed function, countersigned.** *A measurer that only checks and signs cannot quietly redirect money; one that lies is caught in bytes by any payer who keeps their statement.*
- **The key required.** *A measurer that knows who can check can lie only to the others.*
- **Keepers hold the clock, not the service.** *A split on "no record" rests on a keeper's anchored proof, so it never rests on the service's word that something was late.*
- **Records go to every receiver they pay.** *The core checks who a metric pays, never how much (the reference verifier's metric check). Everyone with money at stake can check the amounts.*

## Stated costs

- **The measurer is trusted with what the payer's client tells it.** This Module limits what leaves the measurer, not what reaches it.
- **The split service sees the payer** the payment names. This Module removes the history, not the name; a fresh identity each period removes the history.
- **A late record delays the split**, and every payout from that payment.
- **A measurer that never signs** sends metric shares to the owners' line once a keeper shows the deadline missed. The plan's parties replace it by a new version, which every party must sign (our H7).
- **A wrong "undetermined" split** is the split service's to repay.

## Parameters

In the plan's metric params: the weights, by hash; the unit of a measure, in words; the record deadline after the period, on the publication's time reference; L, the long stop.

## Open

- Development's specification fields for this Module (its kind, field 7 with no fee), when it is published as a specification.
- Whether a measurer should countersign a record for a payment naming no payer. This draft says yes: the record names the payment, never the payer.

## Freeze scenarios it should pass, once the servers open

1. A subscriber pays from a fresh identity; its client builds the record; the measurer countersigns; the service splits by it; each receiver checks its payout against the record.
2. A record that is not the weights applied to its statement: proven false by the payer; the measurer replaced; waiting receipts split by the standby's records.
3. A record naming a receiver the plan does not pay counts for nothing.
4. Two records for one payment: neither counts until a third names both.
5. An empty record; a record shown missed by a keeper's anchored sequence; an answer still undetermined after L: each split says why.
6. Two periods paid from two fresh identities: nothing in either record or split links them.
7. A keeper's successor takes over: it holds every record delivered since the first day.

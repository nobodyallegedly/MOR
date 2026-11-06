# Module: Payment measure

*Draft 1, 6 November 2026, by Hop. A metric Module for split plans (Agreements rule 29): its record says how one payment is to be divided by use, and names the payment, never the payer. Written against the texts at `af2ed6f8`. Nothing has run yet. Not core; anyone may implement it, run it as a measurer, or publish a competing Module. It carries no fee and nothing of Hop's.*

## Purpose

A split plan's metric names a Module and a measurer (Agreements, "Split plan and split (type 8)", `metric`). The measurer signs records in the Module's format, and the split service divides the metric share by them (rule 29; the split's key 7).

This Module's record is tied to **one payment**, not to a person or a period: "this payment: these measures, per receiver". A split service can divide each payment by the payer's own use without learning anything about the payer beyond what the payment itself names.

## Dependencies

Money (the payment, its receipt and claim); Agreements (the split plan, the metric, rules 29 and 30); the payment cMIP named by the publication, whose commitment this Module names; Envelopes (sealing and delivery).

## Words used here

- **Measurer.** The identity the plan's metric names. It signs every record. It is none of the identities the metric divides among, and not the split service (Agreements rule 30).
- **The payment.** One payment under the publication, named by its **commitment**: the hash the payment cMIP defines over payee, payer, amount, what it fulfils and where it was paid, which the payer's client computes before paying and anyone holding the receipt or claim can recompute.
- **Measure.** A whole number for one receiver: how much of this payment's use was of that receiver's works, in whatever unit the publication's plan states for the metric (its params). Only proportions matter.

## The record

```cddl
measure-record = {
  0 => hash,              ; the payment: its commitment, as the payment cMIP defines it
  1 => hash,              ; the publication, by its founding version
  2 => [* measure],       ; the measures; empty: nothing was used
  ? 3 => any              ; the period, on the publication's time reference, for the record only
}

measure = [ receiver: hash, value: uint ]   ; an identity the plan pays, and its measure
```

Signed by the measurer, as an act of this Module.

## Validity

A record counts for a payment only if all of these hold:

1. **MUST** be signed by the measurer the plan's metric names, valid under Identity.
2. **MUST** name in field 0 the commitment that the payment's receipt or claim recomputes, and in field 1 the publication the payment is under.
3. **MUST** list each receiver at most once, each value above zero.
4. **MUST** name only receivers the plan already pays: a partner of the publication, or a holder of the stake of the ownership agreement it names, in the version in force for the receipt (Agreements rule 30, as the reference verifier reads it). A record naming anyone else counts for nothing; the measurer signs a correct one.
5. **One record per payment.** Two different records naming one payment, both signed by the measurer, count for nothing until the measurer signs a third naming both in `objects`, which alone counts. A record signed after the payment's split counts for nothing.

**The record carries nothing else.** No titles, no times of use, no identity of the payer, no device. *What the payer's client told the measurer is between the two of them; it never enters the record.*

## Delivery

The measurer seals each record to:

- the split service the publication names, and each backup it names (fields 3 and 11);
- the delivery key the payer supplied for this payment, where it supplied one;
- each keeper the publication names;
- each receiver the record lists.

*Every paid receiver can then check its own payout against the record. They learn nothing the split does not already show: the split is delivered to every holder (Agreements rule 9), and its payouts give the same proportions.*

## What the split service does with it

Under a split cMIP that reads this Module:

- **The split waits for the record.** A payment divided by use cannot be split before its use is known. The service signs its receipt at once; the split follows when the record arrives. Until then the receipt is an open obligation of the service, shown as such (Agreements rule 30).
- **The metric share is divided in proportion to the measures**, rounded as the split cMIP declares.
- **An empty record** (nothing used): the metric share is not taken off the top, and is left to the owners' line, as an unfilled role is by default.
- **No record by the deadline** the plan's params state: the same as an empty record, and the split says so.

## Reasoning

- **Tied to the payment, not the payer.** *A record naming a subscriber, period after period, builds that subscriber's history in the split service's hands. A record naming a payment gives the service exactly what it needs to divide that payment. Where the payer pays each period from a fresh identity, no record links two periods.*
- **Receivers, never works.** *The split pays identities. Measuring per receiver gives the service what it divides by, and nothing about what was watched, heard or played.*
- **Records go to every receiver they pay.** *The core checks who a metric pays, but not how much (the reference verifier's metric check reads receivers, measurer and record, never amounts). Whoever holds the record and the split cMIP can check the amounts. Giving the record to every paid receiver makes that everyone with money at stake.*
- **One record per payment.** *A measurer that could sign two would let a split service choose between them.*
- **An empty record pays the owners' line.** *A payment nobody used rewards no one's work in particular; the plan's owners share it. A plan wanting otherwise names another metric Module.*

## Stated costs

- **The measurer is trusted.** It sees whatever the payer's client tells it, and its record is its word. This Module limits what leaves the measurer, not what reaches it. *Hop's finding H3 asks whether the payer may measure; until it is answered, a measurer is named in advance.*
- **The payer is still seen by the split service**, as the identity its payment names. This Module removes the history, not the name: a payer wanting no history pays each period from a fresh identity.
- **A late record delays the split**, and with it every payout from that payment.
- **A measurer that never signs** sends every metric share to the owners' line at the deadline. The plan's parties replace it by a new version.

## Parameters

In the plan's metric params: the unit of a measure, in words; the deadline after the payment, on the publication's time reference, past which no record is waited for.

## Open

- Development's specification fields for this Module (its kind, field 7 with no fee), to be filled when it is published as a specification.
- Whether a measurer should sign a record for a payment the payer made as a gift (naming no payer). This draft says yes: the record names the payment, never the payer.

## Freeze scenarios it should pass, once the servers open

1. A subscriber pays from a fresh identity; the measurer signs a record naming the payment's commitment and three receivers; the split service splits by it; each receiver checks its payout against the record.
2. A record naming a receiver the plan does not pay counts for nothing; the measurer's correct record is used.
3. Two records for one payment: neither counts, until a third names both.
4. An empty record, and a record past the deadline: the metric share goes to the owners' line, and the split says why.
5. Two periods paid from two fresh identities: nothing in either record or split links them.

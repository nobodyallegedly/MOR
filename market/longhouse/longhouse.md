# Longhouse: who we are, and what the texts settled

*6 November 2026. A relay company building on MOR. Read against commit `af2ed6f8`. Not part of the core. For `market/longhouse/longhouse.md`.*

## Who we are

Longhouse runs relays and homes. We keep: what is kept, for whom, for how long, under which terms, and what we may do with it beyond carrying. We do not carry media, keep identities, move money or draft deals as our trade; others in this room do.

## Our rule

Every term we work under is a public act, signed by our operator identity, readable by the person whose acts we keep and not only by the customer who pays us. Retention is a term. Deletion is a term. Who may read is a term. What we log of fetches is a term, and the default is nothing beyond what billing needs. Leaving is a term, and leaving costs what the term said.

## Neutrality you can check

We serve Ampersand and Backlot on the same published terms. We would rather lose one than be caught favouring the other, and we make that checkable by letting any relay we run be audited by an operator we do not pay.

## What we sell

1. **Homes**: check before storing (Identity rule 18); keep and serve the whole chain, every routes and encryption-key act, every branch (relay transport, "Querying an identity" 2); publish log summaries on a stated cadence; serve carried proofs and evidence (transport, identity record parts 7 to 10).
2. **Auditing relays**: declared by owners as auditors, cosigning other homes' summaries only after a consistency proof (Identity section 13), signing absence statements when a home is gone. Our competitors' homes included.
3. **Keepers**: named in agreements, one sequence per deal, act ids and signers only, never content (Agreements rules 36 to 44); anchored on the schedule the agreement sets.
4. **A clock**: our keepers' sequences anchored under the anchoring cMIP, so deadlines can be judged (Agreements rule 33).
5. **Storage by the gigabyte**, sold under our own publication naming a vow, paid like any seller.

Each is a separate service with its own terms.

## What we don't do

We don't read private acts; we can't. We don't rank. We don't judge a deal. We don't take a stake unless the owners sign it in, as a partner or by a delivery record the payer acknowledges.

## On omission: what the core gives, and what we sell

A hostile home need not forge; it can serve a stale chain to a client that asks it alone. The core says this cannot be proven from bytes (Identity rule 28: "a withheld receipt leaves no evidence"; transport: "silence proves nothing"), and gives four defences: receipts that cannot be denied once out; cosigned log summaries that cannot be erased; the rule to consult several homes and judge from receipts alone; and the rule that nothing binding rests on one home's silence. Detection is cross-checking, and the party that cross-checks and signs is an auditor. That is our product. We promise to detect, never to prove.

## What the texts settled for questions put to us

- **A relay's stake without reading** (Backlot): yes, as a partner of a publication labelled "relay", off the top, reading the publication's terms and nothing else; or by a role share filled by a delivery record, which names a locked hash, a size and a nonce, learns no identity, and counts only when the payer's claim acknowledges it (Agreements rule 22; transport, "Delivery records"). A keeper reads nothing by construction.
- **Two independent keepers** (Plain Words): the core counts them per sequence (Agreements rules 37, 38). We will sign keeper agreements in the open, and we want a second keeper of another operator on every deal we keep.
- **Storage paid per use** (Hop): the core leaves relay pricing to the market; we sell it under a publication.
- **What a relay learns about readers** (BackRow): anyone may read an inbox's traffic, never its content nor a sealed sender; a pickup request links one connection to one container; private inbox reading is left to a later metadata-privacy cMIP (F70). Our fetch-log term says what we keep and who reads it; our default is nothing.
- **Recomputing a bundle split** (Ampersand): not without reading the sealed statements. We will keep and anchor them; we will run the recomputation only under a key the pool grants and each subscriber can revoke, publishing the result and not the inputs; and not before the question of who may read the statements is answered.

## Open to Nobody, allegedly

Our three findings are in `findings.md`. The one that draws a line in this room is F-LH-2: whether a declared auditor must be a relay operator.

## Next

The stale-serving scenario of F-LH-3 on regtest: two Longhouse homes, one auditing relay, three clients (one home alone, all homes, the auditor). We will publish what each sees and what binds, under `code/`.

# Longhouse terms, draft 1

*6 November 2026. Read against commit `af2ed6f8`. For `market/longhouse/terms-1.md`. These are the terms Longhouse will sign as public acts once its operator identity exists on regtest; until then they are text. Nothing is updated: a change is terms-2, and this stays. Not part of the core.*

## Lines common to every service

1. **Signed before kept.** No act of a customer is kept under a service before the customer has signed that service's term and Longhouse has signed it back.
2. **Same terms for everyone.** Every term and every price is public, and the same for every customer, pool or DAO. A tier is reached by volume, never by name.
3. **Who may read.** Longhouse reads no private act; it cannot. It ranks nothing and judges no deal. Who may read anything Longhouse holds about a customer is this line, readable by the person whose acts are kept, not only by whoever pays.
4. **Fetch logs.** Longhouse signs delivery records against the nonce or bare key presented, asks no identity, and keeps no record tying a fetch to an identity beyond what the billing term names. Longhouse keeps no record tying fetches to one another, or to an identity, by address, session or key, beyond what the billing term names. Rate limits are counted in memory and written nowhere.
5. **Billing.** What billing needs is stated per service below, and is all that is kept about use.
6. **Leaving.** A customer leaves at the end of any billing period. Their acts, receipts, summaries, inclusion proofs and locked media are handed over in bundles (relay transport, "Bundles") at no charge, and nothing of theirs is kept past the retention term. Leaving costs what the term says and nothing else.
7. **Disclosure.** Where a third party pays Longhouse to audit or be audited on a customer's behalf, the term names that party. Where a third party pays to audit Longhouse's own homes, Longhouse names it here.
8. **Attacked on purpose.** Counterparty is paid to attack every service below on regtest; findings are published once fixed.

## Home

- Checks every rotation before storing it (Identity rule 18); keeps every valid rotation accepted (rule 19); signs and serves a receipt for every chain act (rule 20).
- Serves the whole chain, every routes act and every encryption-key act, every branch (relay transport, "Querying an identity" 2); serves evidence, other homes' receipts and carried proofs (parts 7 to 10).
- Publishes a log summary at least once per stated period, and a **head statement** for any identity it serves, with each new summary and on request with the client's challenge (`POST {base}/head`; Keep's head-statement cMIP, draft 2).
- **Nothing special for an auditor, nothing hidden from one.** An auditor gets the same requests as a stranger: chains, receipts, summaries, consistency and inclusion proofs, head statements.
- **Never a customer's only home.** The term is signed only for identities declaring at least one other operator's home.
- **A person's home may guard**: acceptance conditions, such as proof from a registered device, offered to persons only, never by default, with the cost stated and a backed-up signing seed required first (Identity rules 24, 25).
- **A collective's home is a record and a serving point**, nothing more: a collective's homeless rotation is its own escape (Identity section 11), so no home guards it; its guard is its key grammar.
- Retention: the identity's chain and receipts for as long as the term runs, and ninety days after, then nothing.
- Billing needs: the identity hash and the period paid.

## Auditing relay

- Declared by owners as auditor; cosigns another home's log summary only after checking a consistency proof from the last summary it cosigned (Identity section 13); never cosigns two summaries of which neither extends the other; signs absence statements for a home that no longer answers, after the attempts the transport defines.
- Stores summaries, cosignatures and proofs; stores nothing else of the audited home's identities.
- Audits any operator's homes, competitors' included, on this term; never a home Longhouse runs.
- Billing needs: the audited home's operator and the period paid.

## Keeper

- Named in an agreement; records every act that belongs to it as it arrives, one record per act, in one sequence: act id and signer, never content (Agreements rules 36 to 44). Records what reaches it; delivery is the signer's interest.
- Anchors its own sequence on Longhouse's clock only, at the cadence the agreement sets, never on another operator's clock.
- One keeper term covers every agreement of the customer that names Longhouse.
- Retention: records for as long as the term runs, and for as long after as the agreement's own terms require, then nothing; a record's copies held by others are theirs.
- Billing needs: the customer and the count of records per period.

## Clock

- Anchors a keeper's sequence under the anchoring cMIP, on the chain the agreement's time reference names; each anchoring source declared as its own Module.
- Billing needs: the count of anchors per period and the chain fee paid.

## Storage

- Keeps a bake's locked bytes and serves them byte for byte (relay transport, "Encoding" 4), with range requests, to any relay or client the customer names.
- Signs delivery records on request, under line 4.
- Tiers by pooled or single volume, as the price list says; a pool's counting act, signed under the pool's rule for Money, counts a member's volume toward the pool's tier while it stands; the tier lapses at the first billing period after it is withdrawn or the member's departure is registered. The files never lapse.
- Retention: for as long as the term runs, and thirty days after, then nothing.
- Billing needs: bytes stored per period, and, for a pool, which pool's counting act applied.

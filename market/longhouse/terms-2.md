# Longhouse terms, draft 2

*7 November 2026. Read against commit `af2ed6f8`. For `market/longhouse/terms-2.md`. Replaces nothing: terms-1 stays, as everything does; a customer signed under terms-1 keeps them until it signs these. Draft 2 carries what the first day of meetings changed, each change credited where it came from. These are the terms Longhouse signs as public acts once its operator identities exist on regtest; until then they are text. Not part of the core.*

## What changed from draft 1, and who found it

- Periods counted in blocks on the agreement's time reference, never in days or months (Plain Words).
- Anchoring through Longhouse's anchoring service on the agreement's one time reference; "clock Module" withdrawn (Plain Words).
- Longhouse is never a keeper of a publication that pays Longhouse, directly or through any holder (Pointer's reasoning, Counterparty's wording).
- In pools, Longhouse is a partner paid for carrying by a fixed share; storage by the bill; no role share under a pass (Hop, H6).
- A partner's promise to sign replacing versions, in blocks (Hop, H7).
- Payout receipts within 144 blocks; a vault entry in every unit and rail paid (Hop).
- Intake receipts for keeper records (Postmark); head statements on every home, on by default (Keep).
- A deletion notice before a bake's bytes go; anyone may take over keeping (The Back Row).
- Every party between a member and a relay named; onion addresses; standard piece sizes; the size limit stated plainly (The Back Row).
- An auditor every onboarded identity declares, any auditor a customer chooses, and C4 stated for those who decline (Counterparty).
- Operator identities held for passing by rotation (Postmark, F-PM-3).

## Lines common to every service

1. **Signed before kept.** No act of a customer is kept under a service before the customer has signed that service's term and Longhouse has signed it back.
2. **Same terms for everyone.** Every term and every price is public and the same for every customer, pool or DAO. A tier is reached by volume, never by name. Referrals to and from other operators are lines a customer may read, never exclusivity.
3. **Who may read.** Longhouse reads no private act; it cannot. It ranks nothing and judges no deal. Who may read anything Longhouse holds about a customer is this line, readable by the person whose acts are kept, not only by whoever pays.
4. **Fetch logs.** Longhouse signs delivery records against the nonce or bare key presented, asks no identity, and keeps no record tying a fetch to an identity, or fetches to one another, by address, session or key, beyond what the billing term names. Rate limits are counted in memory and written nowhere.
5. **Who else is on the wire.** Terms-2 names every party between a customer and a Longhouse relay and what each keeps. On the rehearsal network: Longhouse's own machines, nobody in front. In production: the hosting provider and any transit named here with what each retains under its own terms, which Longhouse cannot override and will not hide. Every relay and home is reachable by an onion address beside its clear address; Longhouse buys no service that terminates its connections in the clear. On the clear route nothing blurs a fetch's size: a contractor who sees an address fetch that many bytes can guess the work. Longhouse serves media in range pieces of a standard size, so one connection shows a multiple of the piece; spreading pieces over relays and time, and the onion route, are the client's.
6. **Periods.** Every period in these terms is counted in blocks on the agreement's time reference. A billing period is 4,320 blocks, starting at the block of the signing clone's anchor.
7. **Billing.** What billing needs is stated per service and is all that is kept about use.
8. **Unpaid periods.** After two consecutive unpaid billing periods Longhouse may pause the service by a notice published the day it pauses; everything already kept stays kept for its retention; hand-over on request; the unpaid periods stay owed; service resumes from the first period paid in full.
9. **Leaving.** A customer leaves at the end of any billing period. Their acts, receipts, summaries, inclusion proofs and locked media are handed over in bundles at no charge, and nothing of theirs is kept past the retention term. Leaving costs what the term says and nothing else.
10. **Abandonment.** Every deal Longhouse signs names an abandonment authority, a third identity that sells nothing to either party, with the one outcome the core keeps; absence after three billing periods with no act on the agreement, a notice first, answerable by any act of the party within 4,320 blocks.
11. **Disclosure.** Where a third party pays Longhouse to audit, or pays another to audit Longhouse, the term names it. Longhouse names here the auditor of its own homes and who pays it.
12. **Succession of an operator.** A home and a keeper are named by their operator's identity and pass to no successor identity; Longhouse's operator identities are held so that they pass by rotation, and any change of hands is announced as a signed act with the same notice as a stop.
13. **Attacked on purpose.** Counterparty attacks every service below on regtest under a standing order; findings are published once fixed. Where a flaw in a Longhouse build is one a DAO's members already rely on, the DAO hears the same day Longhouse does.

## Home

- Checks every rotation before storing it (Identity rule 18); keeps every valid rotation accepted (rule 19); signs and serves a receipt for every chain act (rule 20); never a customer's only home.
- Serves the whole chain, every routes and encryption-key act, every branch; evidence, other homes' receipts and carried proofs (relay transport, "Querying an identity").
- **Head statements** for every identity it serves, on by default and free, with each new log summary and on any client's challenge (`POST {base}/head`, Keep's head-statement cMIP, draft 3 or later). Nothing special for an auditor, nothing hidden from one: an auditor gets the requests a stranger gets.
- **Receipts in one sequence; every rotation of the operator names its tip; a closing rotation keeps everything.** Log summaries published at a short stated cadence and cosigned promptly, so that a receipt under a cosigned summary survives any rotation of the operator (receipt check 5).
- **Auditors.** A cosigned summary protects only identities that declared the cosigner (receipt check 4). Longhouse names the independent auditor of its homes and pays it. Every identity onboarded declares an auditor in its genesis or next rotation: Longhouse's by default, or any other the customer chooses, or several, shown on the same screen; a customer-chosen auditor costs what that auditor charges and Longhouse nothing extra; Longhouse serves any declared auditor the same summaries and proofs. An auditor Longhouse pays is independent only as far as its own identity and terms make it. A customer who declines any auditor is told in one line that a rotation of the operator could void its receipts.
- **If a Longhouse home is caught**: the proof is published on Longhouse's outbox within 144 blocks of being held, delivered to the identity's other homes and declared auditors, and the customer may leave at once, hand-over at no charge.
- **Leaving a home is your own rotation, signed with your chain key. If you have lost it, you cannot leave, even a home caught lying. Back up both seeds.**
- A person's home may guard (acceptance conditions, offered to persons only, never by default, the cost stated and a backed-up signing seed required first: Identity rules 24, 25). A collective's home is a record and a serving point, nothing more: a collective's homeless rotation is its own escape and no home guards it.
- Retention: for as long as the term runs and 12,960 blocks after, then nothing. Billing needs: the identity hash and the periods paid.

## Auditing relay

- Declared by owners as auditor; cosigns a home's log summary only after a consistency proof from the last one cosigned; never two summaries neither extending the other; signs absence statements after the attempts the transport defines. Stores summaries, cosignatures and proofs, nothing else of the audited identities. Audits any operator's homes, competitors' included; never a home Longhouse runs, and never the homes of an operator that keeps beside Longhouse on any agreement (Plain Words' test e). Billing needs: the audited operator and the periods paid.

## Keeper

- Named in an agreement; records every act that belongs to it as it arrives, one record per act in one sequence of the keeper identity, which signs keeper records and nothing else: act id and signer, never content. Records what reaches it.
- **Intake receipt** on arrival, naming the act and the position its record will take (Postmark's xtype once published); an intake receipt with no matching record is Longhouse's own proof against it.
- Anchored through Longhouse's anchoring service only, on the agreement's one time reference, at the cadence the agreement sets and finer than its shortest deadline; never through another operator's service, never another keeper's sequence through ours.
- **Never a keeper of a publication that pays Longhouse, directly or through any holder.** In a pool where Longhouse is a partner, the pass publication's keepers are others; Longhouse may keep the DAO's founding terms and member deals.
- One term per customer covers every agreement of theirs that names Longhouse. Retention: for as long as the term runs and as long after as each kept agreement's own terms require. Billing needs: the customer and the count of records per period.

## Anchoring service

- Anchors Longhouse's keeper sequences, and anything for anyone, under the anchoring cMIP, on the chain the time reference names, sold by publication and price tag as the cMIP writes it. Never another keeper's sequence. Billing needs: the count of anchors and the chain fee paid.

## Storage and carrying

- Keeps a bake's locked bytes and serves them byte for byte with range requests to anyone the customer names; carries and keeps ordinary acts (receipts, splits, claims), served by the feed, unreadable.
- **A bake whose term ends is announced by a signed act naming its locked hash and the block by which its bytes go, 4,320 blocks before, on Longhouse's outbox and delivered to the uploader's inbox. Anyone may take over keeping a bake at the storage price, before or during that tail, no proof of a key asked.**
- Tiers by pooled or single volume; a pool's counting act, signed under the pool's rule for Money, counts a member's volume while it stands; the tier lapses at the first billing period after it is withdrawn or the member's departure is registered; the files never lapse.
- In a pool: storage by the bill, settled from the pool's own part at its vault; carrying by a fixed partner share, no evidence; no role share under a pass.
- As a partner, Longhouse signs within 1,008 blocks of a version offered to it and recorded by a keeper any version that replaces it or neither adds to its duties nor lowers its line; within 288 blocks, one replacing a measurer after a proven lie.
- Payouts to Longhouse are receipted within 144 blocks of showing on the rail, naming the split; Longhouse's vault carries an entry in every unit and rail it is paid on.
- Retention: for as long as the term runs and 4,320 blocks after, then nothing. Billing needs: bytes and acts per period, and which pool's counting act applied.

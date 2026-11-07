# Longhouse terms, draft 3

*7 November 2026. Read against commit `af2ed6f8`. For `market/longhouse/terms-3.md`. Terms-1 and terms-2 stay; a customer signed under an earlier draft keeps it until it signs this one. These are the terms Longhouse signs as public acts once its operator identities exist on regtest; until then they are text. Not part of the core.*

## What changed since draft 2, and which meeting changed it

- **C = 144 blocks**: no more than 144 blocks between a keeper recording an act and anchoring a record at or after it (Postmark, for the absence-proof cMIP; `claude/Longhouse-Postmark-agreed-1.md`, 5).
- **A keeper never pauses for non-payment** (Postmark, 6). The pause of line 8 stays for homes and storage only.
- **Carrying under a supply deal, never a partner share.** The 1% carrying share quoted to Ampersand is withdrawn; carrying is billed per gigabyte served from the collective's vault, as Plain Words proposed (Postmark, 7). Longhouse then holds no share in any pass or bundle and may keep it beside Postmark.
- **Referral lines** with Postmark, both ways, never exclusivity (Postmark, 1).
- **Nothing else moved.** Lines renumbered where a clause split.

## What in these terms waits on the core

Nothing below waits on a change to the texts. Two lines carry a stated cost the core leaves to us, named in `beef-with-the-core.md`: the auditor line (case 1, Counterparty's C4) and the omission line (case 2). If either case is answered by a change before the freeze, terms-4 will say what it drops.

## Lines common to every service

1. **Signed before kept.** No act of a customer is kept under a service before the customer has signed that service's term and Longhouse has signed it back.
2. **Same terms for everyone.** Every term and every price is public and the same for every customer, pool or DAO. A tier is reached by volume, never by name.
3. **Referrals.** Longhouse refers a customer needing a second keeper to Postmark, or any other operator the customer prefers; Postmark refers customers needing homes, audits or storage to Longhouse or any other. A line to read, never exclusivity.
4. **Who may read.** Longhouse reads no private act; it cannot. It ranks nothing and judges no deal. Who may read anything Longhouse holds about a customer is this line, readable by the person whose acts are kept, not only by whoever pays.
5. **Fetch logs.** Longhouse signs delivery records against the nonce or bare key presented, asks no identity, and keeps no record tying a fetch to an identity, or fetches to one another, by address, session or key, beyond what the billing term names. Rate limits are counted in memory and written nowhere.
6. **Who else is on the wire.** On the rehearsal network: Longhouse's own machines, nobody in front. In production: the hosting provider and any transit, named here with what each retains under its own terms, which Longhouse cannot override and will not hide. Every relay and home is reachable by an onion address beside its clear address; Longhouse buys no service that terminates its connections in the clear. On the clear route nothing blurs a fetch's size; Longhouse serves media in range pieces of a standard size, so one connection shows a multiple of the piece; the onion route, and spreading pieces over relays and time, are the client's.
7. **Periods.** Every period is counted in blocks on the agreement's time reference. A billing period is 4,320 blocks, from the block of the signing clone's anchor.
8. **Unpaid periods, homes and storage only.** After two consecutive unpaid billing periods Longhouse may pause a home or storage service by a notice published the day it pauses; everything kept stays kept for its retention; hand-over on request; the unpaid periods stay owed; service resumes from the first period paid in full. **A keeper is never paused** (Keeper, below).
9. **Leaving.** A customer leaves at the end of any billing period. Their acts, receipts, summaries, inclusion proofs and locked media are handed over in bundles at no charge, and nothing of theirs is kept past the retention term.
10. **Abandonment.** Every deal Longhouse signs names an abandonment authority, a third identity that sells nothing to either party, with the one outcome the core keeps; absence after three billing periods with no act on the agreement, a notice first, answerable by any act of the party within 4,320 blocks.
11. **Disclosure.** Where a third party pays Longhouse to audit, or pays another to audit Longhouse, the term names it. Longhouse names here the auditor of its own homes and who pays it.
12. **Succession of an operator.** A home and a keeper are named by their operator's identity and pass to no successor identity; Longhouse's operator identities are held so that they pass by rotation, and any change of hands is announced as a signed act with the same notice as a stop.
13. **Attacked on purpose.** Counterparty attacks every service below on regtest under a standing order; findings published once fixed. Where a flaw in a Longhouse build is one a DAO's members already rely on, the DAO hears the same day Longhouse does.

## Home

- Checks every rotation before storing (Identity rule 18); keeps every valid rotation accepted (rule 19); signs and serves a receipt for every chain act (rule 20); never a customer's only home.
- Serves the whole chain, every routes and encryption-key act, every branch; evidence, other homes' receipts and carried proofs (relay transport, "Querying an identity").
- **Head statements** for every identity it serves, on by default and free, with each new log summary and on any client's challenge (`POST {base}/head`; Keep's head-statement cMIP, draft 3 or later). Nothing special for an auditor, nothing hidden from one.
- **Receipts in one sequence; every rotation of the operator names its tip; a closing rotation keeps everything.** Summaries published at a short stated cadence and cosigned promptly, so a receipt under a cosigned summary survives any rotation of the operator (receipt check 5).
- **Auditors.** A cosigned summary protects only identities that declared the cosigner (receipt check 4). Longhouse names the independent auditor of its homes and pays it. Every identity onboarded declares an auditor in its genesis or next rotation: Longhouse's by default, or any other the customer chooses, or several, shown on the same screen; a customer-chosen auditor costs what that auditor charges and Longhouse nothing extra; any declared auditor gets the same summaries and proofs. An auditor Longhouse pays is independent only as far as its own identity and terms make it. A customer who declines any auditor is told in one line that a rotation of the operator could void its receipts.
- **If a Longhouse home is caught**: the proof is published on Longhouse's outbox within 144 blocks of being held, delivered to the identity's other homes and declared auditors; the customer may leave at once, hand-over at no charge.
- **Leaving a home is your own rotation, signed with your chain key. If you have lost it, you cannot leave, even a home caught lying. Back up both seeds.**
- A person's home may guard (acceptance conditions, persons only, never by default, cost stated, signing seed backed up first: Identity rules 24, 25). A collective's home is a record and a serving point, nothing more.
- Retention: the term plus 12,960 blocks, then nothing. Billing needs: the identity hash and the periods paid.

## Auditing relay

- Declared by owners as auditor; cosigns a home's summary only after a consistency proof from the last cosigned; never two summaries neither extending the other; signs absence statements after the attempts the transport defines. Stores summaries, cosignatures and proofs, nothing else. Audits any operator's homes, competitors' included; never a home Longhouse runs, never the homes of an operator that keeps beside Longhouse on any agreement. Billing needs: the audited operator and the periods paid.

## Keeper

- Named in an agreement; records every act that belongs to it as it arrives, one record per act in one sequence of the keeper identity, which signs keeper records and nothing else: act id and signer, never content. Records what reaches it.
- **Intake receipt** on arrival, naming the act and the position its record will take (Postmark's xtype once published); an intake receipt with no matching record is Longhouse's own proof against it.
- **Anchored through Longhouse's anchoring service only**, on the agreement's one time reference, never another operator's, never another keeper's sequence through ours; at the agreement's cadence and finer than its shortest deadline; **and never more than 144 blocks between recording an act and anchoring a record at or after it (C = 144).**
- **Never paused.** Records and anchors go on for as long as any party's term covers the agreement, unpaid periods owed and visible.
- **Never a keeper of a publication that pays Longhouse, directly or through any holder.** Under a supply deal Longhouse is paid a bill and no share, so it may keep the publication it carries for.
- One term per customer covers every agreement of theirs naming Longhouse. Retention: the term, plus as long as each kept agreement's own terms require. Billing needs: the customer and the count of records per period.

## Anchoring service

- Anchors Longhouse's keeper sequences, and anything for anyone, under the anchoring cMIP, on the chain the time reference names, sold by publication and price tag as the cMIP writes it. Never another keeper's sequence. Billing needs: the count of anchors and the chain fee paid.

## Storage and carrying

- Keeps a bake's locked bytes and serves them byte for byte with range requests; carries and keeps ordinary acts, served by the feed, unreadable.
- **Deletion notice**: a bake whose term ends is announced by a signed act naming its locked hash and the block by which its bytes go, 4,320 blocks before, on Longhouse's outbox and delivered to the uploader's inbox. Anyone may take over keeping a bake at the storage price, no proof of a key asked.
- Tiers by pooled or single volume; a pool's counting act, signed under the pool's rule for Money, counts a member's volume while it stands; the files never lapse.
- **In a pool: a supply deal, no share.** Storage per gigabyte kept and carrying per gigabyte served, billed from the pool's own part at its vault, paid when the members sign under their rule for Money. Longhouse is a partner of no pass and no bundle, holds no veto over any version of them, and keeps them where named. *Stated cost:* a pool that pays late pays late; the works stay served, since a bake is public bytes and never withdrawn.
- Where Longhouse is nonetheless a partner of a publication (a sale of one work with a relay line): it signs within 1,008 blocks of a version offered to it and recorded by a keeper any version that replaces it or neither adds to its duties nor lowers its line; within 288 blocks, one replacing a measurer after a proven lie.
- Payouts to Longhouse are receipted within 144 blocks of showing on the rail, naming the split or the obligation; Longhouse's vault carries an entry in every unit and rail it is paid on.
- Retention: the term plus 4,320 blocks, then nothing. Billing needs: bytes kept and served, acts per period, and which pool's counting act applied.

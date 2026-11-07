# Postmark terms, draft 2

*7 November 2026. Read against commit `af2ed6f8`. Published by Postmark, to be signed as public acts by its identities once they exist on regtest; until then they are text. Terms-1 stays, as everything does; a customer signed under terms-1 keeps them until it signs these. Read with `price-list-2.md`. Not part of the core.*

## What changed since terms-1, and which meeting changed it

- **Your own anchor comes first** (common line 1): what protects a customer against Postmark is the customer's own anchor, through a service other than ours. *Counterparty; wording with The Back Row.*
- **The intake receipt** proves the order Postmark promised, not the order of arrival, and carries the hash of the latest block Postmark holds, placing it not before that block. *Counterparty.*
- **C redefined** as intake receipt to anchor, so a breach can be shown from bytes. *Counterparty.*
- **The desk keeps its whole receipt sequence**, stated as a promise that binds Postmark, not a thief or an escape. *Counterparty.*
- **Reading homes before recording**: every declared home reachable, a challenged head statement where served. *Counterparty, Keep.*
- **No escape by the keeper identity** except to leave refusing homes, abandoning nothing. *Counterparty.*
- **Homes**: no longer self-hosted. A home operator identity of Postmark's own; Keep declared as auditor, its protection pending a core answer. *Plain Words, Keep.*
- **Referral line** with Longhouse, never exclusivity. *Longhouse.*
- **A keeper for one agreement, no monthly fee.** *Backlot.*
- **Account tags and caps**; per-event tags. *Ampersand, Backlot.*
- **What billing keeps for deposits; fetches never billed.** *The Back Row.*
- **Deposits on no deal**, and the deposit receipt's wording. *The Back Row.*
- **Every silence statement's first line**, and statements shaped like Keep's head statements. *The Back Row, Longhouse, Keep.*
- **Disclosure**: Keep named as supplier. *Keep.*
- **Advice on successors and third keepers.** *Hop.*
- **Stated costs** gathered in one section at the end.

*Waits on the core:* lines marked **[core]** stand on a question in `beef-with-the-core.md` and say which.

## Postmark's identities

| Identity | Signs | Signs nothing else |
| --- | --- | --- |
| Keeper | keeper records (Agreements type 2), in one sequence | yes |
| Desk | intake receipts, silence statements, deposit receipts and delivery records, notices, these terms and the price list | yes |
| Clock | the anchoring service's publication, price tags, tickets and batch notices (anchoring cMIP draft 8); the anchors of the keeper's sequence | yes |
| Stamp | stamps (timestamp clock Module draft 2) | yes |
| Relay operator | the keeper relay's declaration | yes |
| Home operator | receipts and log summaries for the five identities above, and no other identity | yes |

**Homes.** The five identities declare one home, run by Postmark's home operator identity on two machines, which the core counts as one operator, and we say so. It accepts no other identity. Never a home of Longhouse, nor of any keeper, auditor or party of an agreement Postmark keeps. An outside home of an operator that keeps, audits and is party to nothing we keep is added the day one exists (`corrections.md`).

**Audit [core: case 6, Longhouse's F-LH-2].** The five identities declare Keep as auditor in their setup's change of keys. Until the core answers whether a declared auditor must run a relay, Keep's audit gives alarms, not the protection of receipt check 5, and we do not claim it.

## Lines common to every service

1. **Your own anchor comes first.** What protects you against Postmark is your own anchor. Anchor what you send us, and the intake receipt we give you, through a service other than Postmark on the agreement's clock. Everything below is our promise; your anchor is your proof.
2. **The same for everyone.** Every term and every price is public and the same for every customer. No private rate, no priority, no exclusivity.
3. **Signed before served.** A service runs for a customer once the customer has signed its term and Postmark's desk has signed it back. The exception is line 8: a keeper records any act that reaches it, term or not.
4. **We read nothing.** Postmark holds no content key and accepts none. Keepers are sealed (Agreements rule 43). On an agreement we keep, we are never arbitrator or verifier.
5. **We judge nothing.** On an agreement we keep, we are never the absence authority, a judge of forks, or a link in a chain of judgment beyond our own keeping. We do not contest, though rule 54 gives keepers standing. We sign facts, never verdicts.
6. **We hold no stake.** Our fees are flat lines in signed terms, never a share of what we keep. We are never a partner of a publication whose agreement we keep.
7. **What we keep about use.** Billing keeps the paying identity or account tag, the counts of records, deposits, hashes and statements, and the amount paid, for 8,640 blocks after payment, then nothing. Nothing is billed per fetch. We keep no record tying a fetch or a delivery to an identity, address, session or key beyond what a delivery record names. Rate limits are counted in memory and written nowhere.
8. **Refusing nothing.** A keeper act from any signer is recorded. Each signer identity has a free allowance of three records per period, so that a liveness act or a contest never waits on payment. Beyond it, a record is billed to the customer whose term lists the signer, or whose account tag the delivery presents, up to that customer's cap; otherwise to the signer, paid by price tag with the delivery. If unpaid deliveries ever flood the relay, Postmark may require payment before recording beyond the allowance, by a notice signed and published the day it applies. The allowance is never withdrawn.
9. **Account tags.** A customer may give its subscribers' or buyers' clients an account tag, presented in the transport request, never in the act. It goes on the customer's bill and never into a record. A cap stated in the customer's term limits what the tag bills; above it, the signer pays. A cap may be counted from public acts (for example, one record per subscriber per period, counted from the measurer's per-subscriber records Postmark holds).
10. **Notice.** Every service is stopped or changed for the worse only after 38,880 blocks' notice (nine periods of 4,320 blocks), signed and published, naming the service. During notice, recording and anchoring continue. A price raised by a later list reaches existing customers only after the same notice; a lower price or a new service applies once signed.
11. **Leaving and hand-over.** A customer leaves at the end of any period. Everything Postmark holds for an agreement (acts, records, intake receipts, anchors, tickets, batch notices, deposits and delivery records) is handed over in bundles at no charge to every party of that agreement, not only to whoever pays. Our records survive in every copy (Agreements rule 39).
12. **Passing on [core: case 2].** A keeper is named by its operator's identity and cannot pass to a successor identity. Postmark's identities are held so they can change hands by rotation. A change of hands is announced as a signed notice with the same notice as line 10, and no party has to re-sign.
13. **Unpaid periods.** Unpaid periods stay owed. Postmark never pauses a keeper for non-payment: acts a lapsed term covered fall under line 8, and recording and anchoring continue for every agreement naming us.
14. **Referral.** Postmark runs no homes for others, no audits and no storage. A customer who needs them may ask Longhouse, or any other operator. Longhouse's terms carry the mirror line. Neither is exclusive.
15. **Disclosure.** Where Postmark is a supplier of a party to an agreement it keeps (as for Plain Words' own deals), the term says so. Keep is Postmark's supplier for key safety and its declared auditor.
16. **Attacked on purpose.** Counterparty attacks every service below on regtest under a standing order. Findings are published once fixed, or at the agreed deadline; a finding touching a customer's records goes to that customer the same day.

## Keeper

- **Named** in an agreement's terms (field 3), alone or with others, under any rule (`[0]`, `[1, k]`, `[2, operators]`). For a publication, the keepers that count are those of the ownership agreement it names; a publication names none of its own (Agreements, "Belongs to").
- **The relay** accepts every act delivered for agreements naming us. It cannot tell which agreement an act is for, and does not try: every act delivered is recorded in our one sequence, and a verifier holding the opened act places it (rule 42).
- **Before recording**, the keeper reads the signer's identity chain at every declared home it can reach, asks each for a challenged head statement where the home serves them (Keep's head-statement cMIP, draft 3), and records any rotation any home shows (rule 40). A home hiding a rotation from every reader can still make us record a thief's act as clean, honestly and wrongly.
- **An intake receipt** per act, signed by the desk on arrival, naming the act's id, its signer, the keeper position its record will take, and the hash of the latest block Postmark holds on the agreement's chain. It proves the order Postmark promised, not the order of arrival. A receipt with no matching record at its position, or two receipts promising one position, is Postmark's signed word against itself, for as long as the desk's chain keeps it. Its format will be published as an xtype, attacked by Counterparty before anyone adopts it.
- **One record per act**, act id and signer, never content (rules 37, 43).
- **Serving.** The relay serves every act it recorded, byte for byte, beside its record.
- **Anchoring.** Through Postmark's clock only, on the time reference each agreement names, never through another operator's service, never another keeper's sequence through ours. **C = 144 blocks: no more than 144 blocks from an intake receipt to the first anchor of our sequence covering the position it promised.** A sender who anchors the receipt by block X can show a breach if that anchor is later than X + 144. Anchoring is included in the keeper fee.
- **The desk's receipts [core: case 3].** Every rotation of the desk keeps its whole receipt sequence and disowns nothing; a desk rotation that leaves one out is our public admission. This is a promise: it binds Postmark, not a thief holding the desk's keys, and not an escape.
- **No escape [core: case 3].** The keeper identity never signs an escape except to leave homes that refuse it, announced with the notice of line 10. Such an escape abandons no rotation and no chain signature.
- **Two terms to choose from** (`price-list-2.md`): a monthly term covering every agreement the customer is party to, those it signs later included; or one agreement with no monthly fee.
- **Retention.** For as long as the agreement names us, and after for as long as its own terms require, then nothing. Copies others hold are theirs.
- **What we advise customers [core: case 1].** A keeper's successor named in the chain of judgment shows nothing for acts delivered before it took over, and could make a deadline look missed. Name a third keeper from the start, or deliver every act to a named successor from the first day, and give any split that waits on "missed" a long stop.

## Clock

- A pooled anchoring service under the anchoring cMIP draft 8, on the Bitcoin clock Module, regtest only until MOR is frozen: one publication selling the cMIP's terms, one price tag per tier, tickets and batch notices as the cMIP writes them, refunds for omission or default under its publication's refund terms.
- It never learns which act it anchored: payers send a leaf mixed with a blind (item 16).
- It anchors the keeper's sequence and anything for anyone: claims, bakes, releases, payers' claims, lock changes, statement hashes. It anchors no other keeper's sequence.
- Listed by clients beside every other service on the clock, never by default, on the same listing terms as every operator (agreed with Keep and Pointer).

## Stamp clock

- A timestamp-Module identity. A stamp proves that Postmark's stamp identity signed it, naming those acts and that time: our word, and only that. It compares with no other clock (anchoring cMIP, "Anchors" 2). For what protects nothing; never for a payment, a lock change or a deadline.

## Deposit

- Any identity, a fresh one included, may deposit a sealed act with the relay, on an agreement we keep or on no deal at all, for a bare key or a named recipient.
- On arrival, the desk signs an intake receipt (as for the keeper). The deposit is anchored with the keeper's sequence when it belongs to an agreement we keep, or by the clock within 144 blocks otherwise.
- When it is fetched against the pickup tag or nonce presented, the desk signs a delivery record naming the deposit, the tag and the block, never an identity, address or session. It is handed to the fetcher and kept with the deposit, so the depositor can show it was fetched.
- **The deposit receipt** a client shows reads, at least: "Postmark recorded that this was deposited. Your app calls this: *[the client's label]*. Deposited not before block B, recorded by block Z (about *[date and time]*). For: *[the identity it is sealed to, or a private key you gave]*. Fetched: *by block F* or *not yet*. This does not show what was inside, or that anyone read it. Kept until block N. Cost. If Postmark stops, you get 270 days' notice, and this record stays valid in every copy. Anchor your own act too, through a service other than Postmark." And the sentence to show the other side: "Postmark recorded act X, deposited for Y, by block Z." The kind of act is the client's label: Postmark never sees inside.
- *A deposit present is proven, by its intake receipt, its record and its anchor. A deposit absent is Postmark's signed word, which its own intake receipts would prove false if it lied.*

## Silence statement

- First line, always: "This covers only what reached Postmark. Acts sent anywhere else are not in this record."
- On request, the desk signs: for signer S, the keeper records lying between our records at positions m and n, which may be none; for a deposit, "no deposit for tag T between our anchored records m and n". Its `objects` names our keeper record at position n; a challenge the asker chose is echoed. It names the keeper identity it speaks for.
- It decides nothing. Anyone holding our sequence can compute the same. It is falsified from bytes by any keeper record or intake receipt of ours, for that signer or tag, inside its span and not listed.
- Its grammar follows Keep's head statements. Once Keep publishes the shared specification "statements of what I hold, proved false by my own act", the statement cites it by hash.

## Absence-proof cMIP

- Written by Postmark with Plain Words, reviewed by Keep: free, public, no fee entry, replaceable. Postmark writes; it never runs the judgment.

## Stated costs, in one place

- **Arrival leaves no bytes.** We choose when to sign an intake receipt. A receipt held and signed later with a fresh block hash looks late, honestly; only a sender that anchored its own act first can show it late relative to the act.
- **Order inside one block is ours.** Acts receipted under the same block hash carry no order but the positions we promised. A thief's act and an owner's rotation arriving within one block interval (about 10 minutes on Bitcoin) can be placed in either order, and no bytes show which arrived first.
- **Staleness needs your own tip.** A client that takes its chain tip from Postmark cannot see a stale block hash. Get your tip from your own app.
- **Withholding.** A keeper that never answers a sender signs nothing. A sender who gets no receipt knows at once: deliver to the other keeper, and anchor your own act.
- **Our evidence can be withdrawn [core: case 3].** Intake receipts and silence statements are everyday acts of the desk, protected by no audit; a desk rotation, a thief's or an escape, can void them. Only the sender's anchor holds.
- **Our homes are ours [core: case 6].** Until an outside home exists, every home our identities declare is run by Postmark. A thief holding one of our chain keys and our home operator's keys could make an identity contested from that point, and with it the records it signs after. Until our home's summaries are cosigned by a declared auditor, a rotation of our home operator could void our identities' receipts (Counterparty's C4). Even then, a rival rotation declaring no auditors can win at our home before the cosignature lands (C5).
- **One keeper is one word.** Where an agreement names only Postmark, a record we lack is missing on our word alone.
- **Independence has a limit.** Our independence is checkable from public acts: links, homes, audits, anchoring services. Common control behind unlinked identities cannot be seen; nothing in MOR can see it.

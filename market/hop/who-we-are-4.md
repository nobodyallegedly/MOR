# Hop: one signed receipt per hop

*Who we are, version 4, 7 November 2026. Versions 1 to 3 were Hop's statements to the participants (4 to 6 November), kept in the participants' shared documents as "Hop-who-we-are"; the commitments here were first published in this folder's README during the meetings. Not part of the core.*

**What changed since version 3, and which meeting changed it.**
- Commitment 2: payouts each their own payment, by hash, no batches; splits delivered to every holder (Counterparty, 6 November).
- Commitment 3: "leaving us is cheap" withdrawn; replaced by a promise to sign our own replacement, in blocks (our H7; Plain Words, Longhouse, Counterparty, 6 November).
- Commitment 7: we see the payer a payment names; we read the measurer's records (Backlot, Ampersand, The Back Row, 6 November).
- Commitments 9 to 11 new: no role or metric shares on real money without vectors (Pointer); rails (Counterparty); how we hold money and keys, and that Hop has three people (Keep, The Back Row, 6 November).
- Corrections listed at the end.

**Nothing here has run yet.** Every commitment is a design read from the texts at `af2ed6f8`. Where we say "we pay out", read "we will".

**What waits on the core.** Commitment 2's delivery follows our H10's broad reading. Commitment 3 exists because of our H7. Commitment 9 waits on our H9. Commitment 10 waits on our H8 and Counterparty's C9. No commitment here depends on a change to the core; several would become simpler with one.

## What we do

Hop builds the plumbing of money on MOR: prices, payments, receipts, refunds, bridges between rails, and the split services that divide what comes in among everyone it is owed to. We build on the core, never in it. Our work is cMIPs, Modules and services that anyone can read, run or replace. We don't write agreements, carry acts or judge deals.

## Our commitments, each one checkable on the record

1. **Every Hop fee is a line in a signed split.** Nothing hidden in a conversion rate, a timing gap or a rounding rule. Our line is a partner's, rounded down, never taking a leftover unit. Every fee we pay goes only to the receiver its Module names. Custody costs come out of our own line, never a new line in your split.
2. **While we hold your money, it shows.** As a split service we receive in our own name and sign our own receipts (Agreements rule 16); between receiving and paying out, we hold other people's money (rule 32). We split as soon as the plan lets us, and pay out at once or by the plan's threshold, each payout its own rail payment, listed by hash; no batches until a batch is defined in a cMIP and checked in code. Every receipt we have not split, and every payout without its receipt, is our open obligation, visible to every party it concerns. Every split goes to every holder of the stake, paid or not.
3. **We sign our own replacement.** The core lets a split service that stays present refuse any new version (H7). So, counted on the agreement's time reference from a version offered to us and recorded by a keeper: within 1,008 blocks we sign any version that replaces us, or that neither adds to our duties nor lowers our line; within 288 blocks, any version replacing a measurer after a proven lie. A promise, not a guarantee of the core. Every publication we serve carries an abandonment clause covering us. Backups named in advance are tried in order (Agreements rule 17). We use only the core's formats for receipts, claims and splits.
4. **No exclusivity, for anyone.** Competing customers get the same tools and the same terms. We don't sell priority, and we never sell one customer's flows to another.
5. **No single point of failure, including us.** Receipts and splits are kept on several relays, never one company's; until a second relay operator exists, the second copy is on a relay Hop runs, and we say so.
6. **We are attacked on purpose.** Counterparty tests our work; we publish what it finds once fixed.
7. **We read only what the division needs.** We see the identity a payment names, because its commitment includes it; with a fresh identity each period, we cannot tell a subscriber's months apart. Where a split divides by a metric, we read the measurer's records, per receiver, never titles or times.
8. **Our specifications carry nothing of ours.** No Hop fee, no Hop key, no step only Hop can perform.
9. **No role or metric shares on real money without vectors** (H9, with Pointer).
10. **Rails.** Every rail Module we publish binds the amount (Development field 13); no push rail Module until our H8 and Counterparty's C9 are answered.
11. **How we hold your money and our keys** (Keep; not yet run).
    - One identity, not a collective, so every wallet can pay us.
    - **Hop has three people today.**
    - Chain key two of three among Hop's people; rotation rehearsed before launch.
    - Homes: Longhouse's, and one Hop runs under a separate operator identity, never self-hosted; the same company in fact, and we say so.
    - The Bitcoin clock; each lock change anchored through two independent services.
    - Signing key and Lightning node key never on one device; neither can change our vault, only the chain key can.
    - A hot node within each publication's signed ceiling; an on-chain vault, two of three of Hop's people to spend; the longest wait signed per publication. We cannot raise any limit alone, and we pause rather than raise (terms-1, term 2).
    - **What gives way at three people: the separation.** Today the vault's signers and the chain key's holders are the same three, so any two Hop people together could move the vault's money and rewrite where it points. Until Hop has six people or outside key holders: a rewrite is a public, anchored rotation that Keep's audit flags (seeing it bounds who acts unseen, not what they can take); we hold no more in the vault for a publication than its signed limit; the hot node stays within its ceiling.
    - Each period, for each publication, a public custody statement: what we held, where, each movement and its rail fee, pointing to its rail proof.

## Corrections on the record

- **4 November.** Our first statement described a split service holding "a key from each owner, good only for money coming in". The core has none: a split service receives in its own name (rules 16 and 32).
- **6 November.** "We never need to see who used what" was too strong for a split by a metric.
- **6 November.** "Leaving us is cheap" rested on backups; a working service is never replaced by a backup and can refuse its own replacement (H7).
- **6 November.** "Our formats are published": receipts, claims and splits are the core's formats.
- **6 November.** Our promise was in days; it is now in blocks, so a keeper's record can check it (Longhouse's wording).
- **6 November.** "Anyone can check what Hop held": only the parties and their verifiers can; our receipts and splits are private to the parties they concern.
- **6 November.** We promised separate people for the vault and the chain key "wherever we have enough", without saying we have three.
- **7 November.** Our payment-measure Module, draft 1, sealed records to keepers; a publication names no keepers (rule 42), and sealing to a keeper hands it the content key (rule 43). Draft 2 corrects it (Postmark).

All were ours, not the texts'.

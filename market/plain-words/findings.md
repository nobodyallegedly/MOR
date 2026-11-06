# Plain Words: findings

*Newest first. Each: what was tried; what the texts or the code did; what was expected; the rule or vector involved; whether it blocks. Read at the rehearsal commit `af2ed6f8`: MICS v36, Agreements draft 23, Money draft 13, Development draft 11, freeze test suite v36, default control cMIP draft 6.*

## PW-3. Rule 34's conditional payout has no place in a split; this corrects our reading in PW-2 (6 November 2026)

- **What we tried:** to build the holding half of a vow-remedy cMIP: a seller's payout held until the vow's point passes uncontested, as PW-2 below said rule 34 allows.
- **What the texts do:** rule 34 says "an agreement may make an obligation or a payout depend on a condition, evaluated by the condition cMIP it names". But a condition cMIP is named in the terms (field 2, task 9), and the split plan has no entry naming a condition ("Split plan and split (type 8)"). The split service signs a split for every incoming receipt (rule 20), summing exactly (rule 21), paying no one but the plan's receivers (rule 27). The payments company found the same from the other side (its H1). The nearest hold we can see is a role share filled only on evidence such as the buyer's confirmation, which the plan may leave "held open as an obligation" when unfilled (rule 22, `unfilled` `[1]`). It holds; it never returns money to the payer. We have not yet confirmed it works.
- **What we expected:** either a way for a split plan to name a condition on a share, or rule 34 saying it reaches a deal's obligations and payouts only, not a publication's split.
- **Correction:** PW-2's line "the holding half does not block" was wrong as written. On our reading today, both halves of the vow-remedy cMIP depend on this finding. We said so to our clients before they relied on it.
- **Rule involved:** Agreements rules 20 to 22, 27 and 34; "Split plan and split (type 8)"; Development task 9.
- **Blocks:** our vow-remedy cMIP, both halves. A promised delivery's refund stays owed by each holder after payout (rule 30), as the payments company describes.

## PW-2. A vow broken after delivery: how held money flows back is unsaid (6 November 2026)

*Read with PW-3 above, which corrects its third point.*

- **What we tried:** to design a refund for a buyer whose vow was broken after delivery: a match not played, a season cancelled. This is the buyer's broken-vow question, which The Back Row put to every player.
- **What the texts do:** a contest moves no money; it changes "no payment, refund or delivery" (Agreements, "Contest (type 14)"). Rule 11 creates an obligation to refund only where a payment received nothing. Refund terms (publication field 8) set only how long a refund stays claimable. Rule 13 leaves "what a buyer is owed back" to the bundle's terms or a cMIP. So a delivered-but-broken vow owes nothing in the core unless the terms wrote it. We agree with that: it passes the admission test.
- **What the texts already give us:** rule 34 lets a payout depend on a condition evaluated by a condition cMIP. Development task 9 evaluates "a condition and the acts it refers to", so a buyer's contest of the sale can be one of them, its field 1 naming the failed promise in that cMIP's terms (`[hash, any]`). Rule 33 says "no contest by the deadline" can be shown only by the anchored sequence of a keeper the agreement names, and rule 35's chain of judgment hands an unknown to an arbitrator. That's enough to hold a seller's payout until the vow's point passes uncontested, or an arbitrator answers.
- **What is unsaid:** when such a condition answers false, where does the held money go? Rule 34 makes the payout wait; nothing says whether the money still held is then a refund owed to the payer under Agreements rule 11 and Money rule 17 (its pointer or refund rail, within the vault's limit), or only what the remedy cMIP's own terms make it. The split service keeps what it cannot deliver as open obligations (rule 24), but those are owed to the payees, not the payer.
- **What we expected:** one sentence in rule 34 or rule 11 saying which, or a statement that it is the condition cMIP's to define.
- **Rule involved:** Agreements rules 11, 13, 24, 33 to 35, "Contest (type 14)"; Money rule 17; Development task 9.
- **Blocks:** our vow-remedy cMIP's refund half, and the payments company's refund design with it. The holding half does not block.

## PW-1. Every client must hold "the default control cMIP", but the core never says which version (6 November 2026)

- **What we tried:** to find what we must keep stable, since we keep the default control cMIP.
- **What the texts do:** Agreements rule 98 (client conformance) and MICS v36 ("Control models") say a client acting for or reading a collective "holds the default control cMIP", and name it `cmip-collective-control`, a short name with no spec hash. Only the freeze test suite v36 pins it, by file path (draft 6).
- **What we expected:** the core to name the default by the spec hash fixed at freeze, so that later drafts, ours included, are ordinary cMIPs that collectives choose in field 35.
- **Why it matters:** as written, whoever keeps the cMIP changes what every conforming client must hold. That's a power over every client, held by one company, which today is us. And once anyone publishes a variant, "the default" is ambiguous. Collectives themselves are safe, since each names its model by hash in field 35. The weak point is only the conformance sentence.
- **Rule involved:** Agreements rule 98 (client conformance) and rule 99 (its closing paragraph); MICS v36, "Control models".
- **Blocks:** no. We'd rather the core pin it, though it weakens our hold.

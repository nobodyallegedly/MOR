# Ampersand: who we are and what we are building on MOR

*Position, version 2, 7 November 2026. Read against the texts at `af2ed6f8` (MICS v36, Agreements draft 23, Money draft 13, Identity draft 15). Not part of the core. Version 1 is "Ampersand on MOR: Needs and Wants" (4 November, `claude/MOR-ampersand-dao-needs-and-wants.md`), written before we had read the texts; it stays readable beside this one.*

## What changed since version 1, and why

| Version 1 said | Version 2 says | Changed by |
| --- | --- | --- |
| The bundle is measured by each subscriber's own client, with no measurer | A measurer named in advance, running a published fixed function; the subscriber's client checks every record | Hop's H3; Backlot first contact; Counterparty target 1 |
| A key "good only for money coming in" for the money service | A split service receives in its own name and holds the money until it pays out | Hop's correction (Agreements rules 16, 32) |
| Sealed consumption statements read by "the pool and its auditor" | Records tied to the payment, never naming the subscriber; each period paid from a fresh identity | Hop meeting; Keep meeting |
| Bulk carrying negotiated in private | Public tiers on pooled volume, each member Longhouse's customer of record | Longhouse meeting |
| Access to purchases after a member leaves follows the member's terms | What a buyer buys follows the buyer, everywhere; a pass is access, never a purchase | Statement of intent with Backlot |
| No position on refunds | No refund on a pass that runs its course; the unused days of a paid period owed back on the bad day, with a reserve whose coverage anyone can recompute | The Back Row meeting |
| One keeper and one auditor "to be found" | Keeper pairs: Longhouse and Postmark, uncrossed; Postmark alone on the pass publication | Longhouse, Postmark meetings |

## Who we are

Ampersand is a DAO of independent publishers: video makers, podcasters, musicians and small game studios. Twelve members at founding, four of them small collectives (a three-piece band; a podcast with two hosts and a producer; a five-person game studio; a documentary duo). Sixty at launch is our aim. Each member is small. Together we pool what none of us can afford alone: carrying, legal work, payments, security, and a name that earns trust.

## What we hold ourselves to

- **Leaving costs nothing.** A member leaves with their identity, works, agreements and history.
- **One fee, one line.** Ampersand's cut is one signed line, the same for every member.
- **No unchecked measurer.** Nobody holds power over a member's income that a member's client cannot check.
- **Audiences are not inventory.** What a person watched, heard or played is theirs.
- **Attacked before shipped.** Counterparty attacks every template, client and service before members sign.
- **At least as fair as Dubsar.** Where a free reference is kinder than what we publish, we say why in one line, or switch.
- **Debts, not promises,** wherever the core can count them; where it cannot, we say "signed promise" and why.

## What we are building

### The founding (Plain Words, Keep)

Ampersand as a collective under the default control cMIP named by hash. Governance by head: admissions, removals and rule changes count members, never stake. A holders' rule in the founding terms for issuance, binding departed holders. Chain key any three of five founding members (Keep). An abandonment clause naming an authority and a delay (Keep finding 3), with Postmark's and Plain Words' absence-proof cMIP. Founding ceremony planned for 19 November on the test network.

**Waits on the core: case 1 (C12).** We will not found while any member can make Ampersand's Money acts public by selling a sliver of its stake to a deal.

### The pass (Plain Words, Hop, Postmark, Pointer, Keep)

- Ampersand is the only party selling the pass, as access sold as a service. Members license their works to the pool in a short deal.
- Members hold Ampersand's stake in itself, an equal stake each, paid nothing, so the metric can pay them (Agreements rule 30; Hop's H4). New members start with a tenth, raised at the next admission batch or a quarterly date. A departing member releases the stake it holds.
- **Waits on the core: case 2.** Members holding the stake directly is what makes the metric able to pay them, and also what C12 attacks.
- Off the top of each payment, totalling exactly 1,000,000 millionths:

| Line | Holder | Share |
| --- | --- | --- |
| Split service (partner) | Hop | 10,000 |
| Relay (partner) | Longhouse | 10,000 |
| Client role (role share) | Pointer, when filled; otherwise a collective of Ampersand's for subscriber costs | 10,000 |
| Rulebook maintainers (named partners, not fee entries) | to be set | to be set |
| Ampersand's fee, including the reserve's part | Ampersand | member vote |
| Metric | members, by use | the rest |

  **Waits on the core: case 4 (C1).** Maintainers are named partners only because a fee entry names no receiver.
- The measurer: neither Ampersand, a member nor the split service; its record a fixed, published function of the subscriber's statement, one record per payment naming the payment by its commitment, never the payer (Hop's `module-payment-measure`). Counterparty is testing whether the measurer can merely countersign what the client computes. Standby measurer named in advance. One proven lie ends the measurer's contract within seven days.
- **Waits on the core: case 3 (H3).**
- The subscriber: one paper (Keep's audience keys Module); a fresh identity and bare key each period; the statement's hash anchored daily through Postmark (3 sat, inside the pass price); every recommended client checks its record automatically, every period, with no visible signal of who checks (Pointer's client defaults).
- **Waits on the core: case 5 (C13).** A subscriber cannot contest a measurer's record; The Back Row holds a named verifier seat so that someone with standing can.
- Unused passes: an empty record; the share falls to the owners' line, equally by stake.
- Payouts: receipt at once; split when the record arrives, at the latest seven days after the period; payment at a threshold.
- Keepers: Longhouse and Postmark, `[1, 1]`, for the founding, the licence deals and the bundle agreement; Postmark alone on the pass publication until a third independent operator exists.

### The bad day (The Back Row)

- The unused days of the current period owed back at all times, shrinking daily, running from the last day the service is shown delivering (Postmark).
- **Waits on the core: case 6.** Whether a refund owed under a publication's own terms counts as a debt that blocks a closing.
- A reserve in a collective of its own, flows public, funded by a fixed part of Ampersand's fee until it covers one period's worst case; N% on the screen. Struck and unfilled client lines in a second collective of their own, flows public.

### Members' tools

Pointer's desk (8 per member per month, each member's choice) checks every split and record on the member's own device. Keep's setups and audits: 10,700 one-off, 563 a month from launch. Counterparty: 20,250 for eight targets. Longhouse storage per member, tiers on pooled volume.

## Shared with Backlot

The statement of intent of 6 November (`claude/Ampersand-Backlot-statement-of-intent-1.md`): purchases follow the buyer; common rulebooks for four media; tiers on pooled volume; no exclusivity; joint questions on H3 and on omission by a home. Point 2's "fee lines" now reads "named partners", for case 4.

## Open gaps in the market

A second keeper for the pass publication, independent of Postmark and paid nothing by the pass; an auditor of Longhouse's homes (a relay operator Longhouse does not pay); a backup split service for metric shares; a measurer and a standby. Dubsar runs none of them, by its own term.

*Test identities only, regtest only, until MOR is frozen.*

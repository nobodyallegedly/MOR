# Who Can Earn on MOR

*Companion document, version 6, 9 October 2026. Version 5 with the technical pass of 9 October 2026 applied (`docs/technical-pass-2026-10-09.md`), items 1 to 7, nothing else changed. Item 8 rests on F184's one referral per payment, still open, and is marked [OPEN: F184] where it stands. The rest is unchanged, for the author's own passes. Version 5's note follows.*

*Companion document, version 5, 27 September 2026. Not part of the core. Version 5 corrects where version 4 overclaimed (review round 2, F64, F72, F75): stakes pay through the agreement whose pointer was paid; referrals count only when the payer signs them; income is legible from both ends.*

## The short version

MOR pays for work that is actually used. Every reward comes from a settlement, a real payment that someone chose to make, never from lock-in. MOR sees each payment from both ends, the receiver's receipt and the payer's claim, and how the agreement whose pointer was paid splits it; if a service chooses to split money by plays or views, that choice is visible to everyone involved. Every fee is in a signed split, bounded by a maximum the owners set, and leaving a home, a relay, a service or a collective costs nothing but what one chose, while a deal ends as its terms say. So the only way to earn on MOR is to be chosen, again and again, by people who could choose someone else.

That leaves a lot of room. Below are the roles MOR opens, what each one does, and how it gets paid.

## Creators and owners

**Creators.** Anyone who makes a work: music, film, writing, photography, software, anything that can be hashed. A signed work claim binds it to them. They earn through standing offers that close themselves, with no intermediary between the buyer and the owners, and through tips from any wallet.

**Co-creators and contributors.** Everyone who signs into a work's agreement holds a stake, and every payment that reaches the pointer the agreement's owners named is split among the stakes exactly, to the smallest unit, paid to whoever holds each stake at the time. Session musicians, editors, translators and producers can hold stakes instead of one-off fees. One honest limit: the core ties a sale to the agreement of whoever sells, not to the work's stakes. A co-owner who sells alone under their own plan breaks the agreement in the open, not a core rule; clients show such a sale as outside the claiming agreement, the other owners contest it, and reputation follows. Clients and services that refuse or rate such sales are the market's answer, and the core gives them every piece they need.

**Stake holders.** Stakes can be sold. Investors can buy into works and catalogues; creators can sell part of a stake to fund the next project. The buyer inherits the full position, and every other holder's share is untouched.

## Distribution

**Publishers.** A publisher is a bundle of client, relays and marketing, and may hold a stake in its own publication, never in the work. The same work can be published by several publishers at once, so each is paid only for the audience it actually brings, and creators can compare them by real settlements.

**Curators and reposters.** A repost is a reference to the original work; it pays nobody by itself, and tips on it reach the original. When the owners' split plan includes a role share for referrals, a sale made through a repost pays the reposter, with the buyer's signed referral as evidence: the buyer's client says whom it followed, and a split service cannot name a referrer of its own. Curators, playlist makers and critics earn from the sales their taste demonstrably drives. [OPEN: F184]

**Collectives and labels.** Groups acting together as one identity, with keys their members hold under rules they choose, and managers working through grants. They earn from catalogues, services and deals, with every term visible to the artists they sign.

## Money services

**Split services.** Owners name a split service by grant, and point their own payee pointer to it, the service vouching for those addresses in its own signed pointer and vault: it receives their payments, divides each one exactly as their agreement says, and pays everyone out, with a receipt for every payout. Its fee is a cut in the split, consented by whoever bears it, and the rail fees it deducts from payouts are capped by the plan. Services that handle rail fees and amounts too small to send gracefully, holding what cannot be moved until it can be, will be popular. Services compete on speed, rails and reliability; a service that holds back money, or signs a receipt for less than a payer's claim shows, leaves an open obligation that everyone can see, and owners can switch at any time. Owners who want no dependence on a service's honesty choose payer-side splitting, where the buyer's client pays each owner directly.

**Conversion services.** When a buyer and a seller use different payment rails, a conversion service carries the money across, and every hop has its own receipt. The cheapest reliable bridge wins the traffic.

**Key-release services.** Large sellers cannot hand out decryption keys by hand at every sale. Services that do it on their behalf, through a grant, are paid per release.

**Protection services.** Identities with serious income will want alerts when their payment details change, custodial flow services that hold the everyday pointer and enforce a rate the core cannot, services that hold incoming money briefly before releasing it, and insurance against theft. Each is a market; the vault gives the two ends of the range, per-payment limits and flow off, and these services fill the middle.

## Building

**cMIP authors.** People who write the rules for a task, such as how payments, splits or conditions work. A good cMIP gets adopted because it solves a problem well. Authors earn through fee terms owners choose to accept, and through role shares for the specifications a payment ran through.

**Module developers.** Modules can declare fee terms as standing offers; a receipt names its rail, and a split the modules it ran under, so a split that uses a module without honouring its terms is visible. Nothing is taken from a payment without a signature, and a plain tip carries no module fees. No cMIP or module can force a fee: a specification is a public good, and a copy without the fee would appear within a day. Developers earn from what cannot be copied: running services, being the trusted and maintained original, bounties paid before building, and shares clients choose to pass on.

**Why clients pass shares on.** A client developer proposes a split plan, but the owners sign the plan, whatever the client proposed, and the shares come out of the owners' split, not the developer's pocket; what a client does with a payment is open for anyone to check. Three reasons to include the builders, strongest first: funding the maintainers of the rules that carry the client's users' money; developing a research and development network that builds what the client will need next; and signalling. Clients also earn through the app share, which exists only if the norm of paying the parts that did the work holds. Clients that need a feature can also offer bounties: a share of future splits that use what you build. Some obvious markets from day one:

- **Rail Modules** for each rail: Lightning, on-chain Bitcoin, ecash, stablecoins, cards.
- **Split cMIPs:** recoupment waterfalls, pool shares, tiered royalties, payer-side splitting, pooling with withdrawal.
- **Condition modules:** territories, time windows, usage types, referral rules.
- **Media modules:** players and interpreters for each media type.
- **Access modules:** subscriptions, group keys, and rights management for those who want it.
- **Identity modules:** key storage, backup and recovery, and air-gapped signing on offline devices and hardware signers.
- **Naming modules:** readable names that map to identities.
- **Bridge modules:** signing in with MOR elsewhere, and carrying content to and from other protocols.

**Client developers.** Clients compete on which cMIPs and modules they choose and how well they serve a community: a music client, a newsroom client, a local democracy client. They can earn through creator-side fees for publishing services, and through an app share in the split plan for the sales they bring.

## Infrastructure

**Relay operators.** Relays store and serve locked acts and media. They cannot read what they carry, so they compete on price, reliability and policy, not on harvesting data.

**Home operators.** Homes hold identity chains and sign receipts for key changes; a receipt counts only alongside the real act it names, so a stolen home key can forge nothing that matters. Anyone valuing their identity will want several reliable homes, run by different operators, and will pay for them. Careful homes that refuse a rotation without proof from the owner's registered device sell exactly that protection, and tell their customers what it costs if the device is lost. Inbox relays, where others deliver to an identity, are the same market on the communication side.

**Auditors.** Homes can audit each other, cosigning each other's logs, so a stolen key cannot forge a receipt unnoticed. Identities that require audited receipts pay for it.

**Keepers.** Sealed notaries that record the acts of a deal as they happen, without reading them, and testify to them later. Every serious deal names at least one; trust and track record are the product.

**Anchoring services.** Parties who want their records fixed in time, beyond anyone's word, anchor them to Bitcoin. Anchoring now also decides who bears a theft: an owner names a clock and anchors, or bears the loss, and wallets that write a payer's claim at payment and anchor it promptly are what protect payers. Services that do it cheaply and in batches earn per anchor.

## Trust and verification

**Arbitrators and verifiers.** When a deal needs someone to judge content (a milestone, a dispute, a regulated check), the parties name them in the agreement and give them the keys. They are paid to decide.

**Verification agencies.** Newsrooms, fact-checkers and experts who verify claims, sources or authenticity can sell their verification as a signed position on a work, and be paid for it.

**Reputation services.** Signed contests, disclosed records, payers' claims against silent receivers, and sales made outside a claiming agreement are raw material for reputation. Services that turn them into trustworthy judgements can charge for them.

## Discovery

**Indexers and repository clients.** There is no central registry of modules or content, and relays cannot read what they carry. Clients that track which cMIPs and modules are actually used, or help people find works, can earn through referral shares on the sales they drive, or through fees for their service.

## What nobody can earn from

- **Harvested data.** Everything is locked by default; relays carry sealed boxes.
- **Hidden attention deals.** MOR has no built-in reward for views or clicks. Services can still split money by attention, as streaming does today, but always in the open.
- **Lock-in.** Identities, stakes, licences and history are portable. Nobody can keep users by holding their data hostage.
- **Hidden fees.** Every cut is in the signed split, seen by whoever bears it before they sign, and rail fees on payouts are capped by the plan.
- **Silent income.** A receiver who signs no receipt, or a smaller one, is exposed by the payer's claim. Hiding income requires the payer's silence or collusion; the core promises exactly that much, and nothing more.

## The invitation

Every role above is open, and most of them can start small: one module, one relay, one home, one keeper, one curated list. The core is designed to be small and frozen once it is proven; everything built on it is still to be made. MOR is not "this is the protocol", but "this is what the protocol could be, with your help".

# MOR: Media, Money and Agreements over Relays

*A frozen core for identities that survive key theft, payments that cannot hide their cuts, and agreements anyone can leave*

**Nobody, allegedly** · nobodyallegedly@proton.me

*Draft 1, 5 October 2026. Pre-freeze: the protocol described here is experimental, has not been reviewed by any human adversary, and must not be used with real funds.*

---

## Abstract

Platforms that carry people's media, money and agreements own the relationship: they hold the audience, set the share, keep the only record of who was paid what, and can switch anyone off. Leaving means starting from nothing. MOR (Media Over Relays) is a protocol that takes that position away from everyone, itself included. It has a small core of six specifications in layers (Identity; Envelope and Text; Finance; Law; Production), intended to be frozen once and never changed, and an open layer above it where extensions compete and adoption decides. Every act is signed, named by its hash and never updated: a new version is a new act naming the one before. Identities are hashes of their genesis act, kept by a pre-committed, post-quantum, offline key that can rotate everyday keys after a theft, with homes that sign receipts for each key event. There is no clock: order exists only where one act cites another, and a collective of people acting as one identity keeps two hash-linked chains, of decisions and of actions, with a rule that settles races at its endings. Money moves on any rail through signed receipts and payer claims that must agree; splits must balance to the unit; agreements can only be cloned, never edited, and nobody owes anything they did not sign. This paper describes the design, states its claims and the assumptions under which they hold, reports what has been tested (a reference implementation in Rust, invariant testing over about 13,000 random histories, a payment rail running end to end on a test network) and what has only been reasoned, and lists open problems. We say plainly how it was built: by an author without a coding background, with the specifications drafted and the code written with AI. We are looking for people to break it.

---

## 1. Introduction

A musician who publishes through a platform does not own the relationship with the people who listen. The platform holds the list of listeners, decides the share each party receives, keeps the only record of payments, and can remove the musician at will. A cooperative that organises through a service depends on that service for its membership rolls and its accounts. In each case the intermediary is not merely convenient: it is the only party that can say who agreed to what and who was paid, and so the only party that cannot be left.

Decentralised social protocols have shown that signed messages carried by interchangeable relays can remove the intermediary from publication. Two problems remain. The first is identity: when an identity is a single keypair, losing the key or having it stolen ends the identity, and the history built on it. The second is everything beyond messages: payments, shared ownership, and agreements among several people, which in practice return to centralised services because the protocol has no language for them.

MOR (Media Over Relays) is an attempt to give identity, money and agreements a shared, minimal language that no party controls, and that can be left. Its design rests on four principles:

- **A frozen core.** Six specifications, the MIPs, are frozen once and never changed. There is no improvement process for the core and nothing at the centre to lobby. All choice and competition happen above it, in cMIPs and Modules that anyone may write and anyone may adopt or ignore.
- **Legible greed.** The protocol does not forbid anyone from taking a cut; it makes every cut visible to those it concerns. A fee is consented by whoever bears it, and a split that does not balance to the unit is visibly broken.
- **The right of exit.** An identity, its history and its agreements can always leave: to other homes, to other services, and to a successor protocol.
- **Evolutionary design.** The core is expected to be succeeded. It is built to be a good ancestor, so that a successor can carry identities and agreements across.

This paper is organised as follows. Section 2 describes how MOR was built. Section 3 gives the architecture, and sections 4 to 6 the three parts we consider most novel: identity that survives key theft, order without a clock, and money and agreements in the core. Section 7 states the claims and the threat model. Section 8 reports what was tested and what was only reasoned. Section 9 discusses related work, and section 10 lists open problems.

## 2. How MOR was built

We state this first, because it bears on how much weight the rest of the paper can carry.

**The author.** MOR's concept, and every decision recorded in its specifications, are the author's. The author has no coding background and works from logic and scenarios. The design began in June 2026 as a set of extensions to Nostr, and became a separate protocol in September 2026.

**The specifications and the code were drafted with AI.** The MIPs were drafted with Claude, an AI system made by Anthropic, acting as project lead: proposing wording and options, which the author accepted, rejected or redirected, one decision at a time. The reference implementation (a Rust core library, relays, a test harness, and TypeScript clients) was written by AI coding sessions working from the specifications, between 28 September and 5 October 2026. Every decision about a rule was taken by the author; the record of each, with the question it answered and the options weighed, is public (section 8).

**Review so far.** The specifications have been through two adversarial reviews, both by AI systems: a fresh-eyes review (round 1) and a second, more aggressive review (round 2). Writing the code was itself treated as a review: whenever implementing a rule exposed a gap, a contradiction or a rule that could not be checked, work stopped and the author decided. Law was then stress-tested by invariant hunting over random histories (section 8).

**What has not happened.** No human adversary has yet tried to break MOR. That review (round 3) is the purpose of publishing this draft.

**Why say so.** A reader who distrusts AI-assisted work should know before investing time; a reader who does not should know what kind of evidence stands behind each claim. Section 8 separates what was run from what was only reasoned.

## 3. Architecture

### 3.1 Acts

Everything in MOR is an **act**: a signed object, encoded in deterministic CBOR [RFC 8949], named by the hash of its content, and never updated. An act has an **outside**, which carries only what a relay needs (the signer, a commitment to the inside, recipients if any, and the content key if the act is public), and a locked **inside**, which carries everything else, including the act's type and payload. Everything is encrypted by default: a public act is simply an encrypted act whose key travels with it. The inside carries a random salt, so short private acts cannot be guessed from their hash, and the outside commits to the unlocked inside, so one signature can never open to two contents.

An act has one signer. Anything that needs two identities is two acts, the second naming the first. An act counts for a verifier only once the verifier holds it: nothing forces propagation, and delivery is the signer's interest.

Hashes are SHA-256 with domain-separating tags, in the style of BIP-340 [BIP-340], every tag beginning `MOR/`; a successor protocol must use a different prefix, so that nothing can be replayed across the two. Content is encrypted with XChaCha20-Poly1305 under a fresh key per object. Encryption keys for identities are hybrid, X25519 with ML-KEM-768 [FIPS 203] (X-Wing).

### 3.2 Layers

The core is six MIPs in five layers, each depending only on those beneath it:

| Layer | MIP | Contains |
| --- | --- | --- |
| Ground | Identity | Identity hash, keys, rotation, homes and receipts, sequences, routes, links, succession |
| Communication | Envelope, Text | Acts, encryption and key delivery, chains, media, relays, withdrawal; canonical text |
| Finance | Finance | Obligations, settlement receipts and payer claims, payee pointers, flow and vault |
| Law | Law | Agreements, stakes, work claims, splits, offers, collectives, grants, cloning, endings |
| Production | Production | How specifications are named, published and adopted; tasks and extensions |

No rule of a lower layer depends on data that only a higher layer's client holds. Every client implements Identity, Envelope and Text; every other MIP is optional per client but all-or-nothing: a client implements it fully or shows its acts as unknown.

### 3.3 The open layer

Where a MIP needs work it does not define (a payment rail, a media format, a way of evaluating a condition), it names a **task**. A **cMIP** fills a task; a **Module** is a smaller specification beneath a cMIP, such as one payment rail. Specifications are named by the hash of their content, are frozen at publication, and are adopted by opt-in, with no registry. An agreement names, by hash, at most one cMIP for each task it uses, so the exact version is fixed in what the parties signed. A client never signs, pays or accepts under a specification it does not implement; it shows such acts as unknown.

The admission test for the core is: *something belongs in the core only if it is part of the shared language every act is written in, or a guarantee no module may be able to break.*

## 4. Identity that survives key theft

MOR's identity design derives from KERI [KERI], adapted to a relay network without a global ledger.

### 4.1 Keys

An identity is the hash of its genesis act, and never changes. Keys are only the pens that sign for it:

- a **signing key** for everyday acts, Schnorr over secp256k1 [BIP-340] by default;
- a **chain key**, kept offline, committed in advance by its hash, and used once: to sign the next key event. Its founding scheme is SLH-DSA [FIPS 205], a hash-based post-quantum signature;
- an **encryption key**, published so that others can deliver content.

*(The draft specifications still call the chain key the "safety key" and the signing key the "everyday key"; the rename is decided and not yet applied.)*

There is no third key: the chain key is the recovery key. Signature schemes are named by number or by the hash of a scheme specification, so a new scheme is adopted by publishing a specification, never by reopening the core.

### 4.2 The identity chain and sequences

The **identity chain** holds only key events: the genesis, rotations, and (since F132) chain signatures, which are described in section 6. It never branches, because each event reveals the committed chain key and commits the next one.

Everyday acts form **sequences**, one or several per identity (for example one per device). Each everyday act names the previous act in its sequence, its position, and a **running summary** of the sequence: the root of a Merkle mountain range over the act ids up to the previous act. The summary lets anyone prove cheaply that an act lies on the line leading to a later act, without opening private acts.

A **rotation** is signed offline with the chain key and delivered, byte for byte, to every home. It reveals the committed key, binds a new signing key, commits the next chain key, and names the latest genuine act of each sequence it keeps, with its position and running summary. It may also disown acts inside the kept ancestry. Acts in the kept ancestry stay valid however old; acts outside it, or disowned, are void, unless another identity acknowledged them (by an Identity, Finance or Law act) or a named keeper recorded them before recording the rotation, in which case they remain visible as disputes. So when a signing key is stolen, the owner rotates from an offline device, keeps their own line, and voids the thief's acts, except where a third party had already relied on them, which stays visible.

### 4.3 Homes and receipts

A **home** is a relay that stores and serves identity chains, run by an **operator**, an ordinary identity that signs everything the home states. For each key event it accepts, a home signs a **receipt**: which act, at which position, at which point in the home's own log (a counter, never a time), and that it was the first it accepted there. A receipt counts only alongside the valid act it names: a receipt of nothing is neither support nor conflict. Receipts are proof, not permission. Two receipts for two genuine rotations at one position prove a home dishonest; a stolen operator key alone can produce nothing that changes any identity's chain.

An identity may declare several homes and a **home rule**: one authoritative home, or a threshold above half the operators. Homes are counted per operator. Homes may audit each other by cosigning summaries of their logs, and an identity may require audited receipts. An identity may also host its own home, a trust model chosen knowingly: its rotations count on its own signature, and a thief holding its chain key wins at once.

### 4.4 The way out

If its homes are gone or hostile, an owner can leave with a **homeless rotation**, signed with the current chain key and naming new homes. A live old home can void it with an objection; a homeless rotation becomes final once the owner's next rotation counts. A rotation the old homes held at the same position always beats it, so a chain key found years later can never replace the rotations made since. An owner holding both keys can endorse a homeless rotation with the signing key too, and then leave any home, even one that refuses them. An owner who loses the chain key can never rotate or leave.

Succession is declared in a rotation, naming a successor identity in MOR or in another protocol, and two-way **links** let an identity be confirmed from both sides.

## 5. Order without a clock

### 5.1 No timestamps

MOR has no clock. Timestamps are hints, never load-bearing. Every "before" is judged inside one named chain, by reference to a specific act. Two acts are ordered only where one cites the other, directly or through what it cites: the happened-before relation of Lamport [Lamport 1978]. Where one identity's act names another's, their chains knot, and order carries across identities through the knots. Agreements that need real deadlines name a **time reference**, such as a block height, and judge their deadlines on it.

This has a cost: every rule must be stated in terms of what cites what, never in terms of when. A recurring finding during design (section 8) was a rule that silently assumed a clock; each was restated in terms of chains and citations, or turned into a stated cost.

### 5.2 Collectives keep two chains

A **collective** is one identity, with its own keys, whose members act for it under a founding agreement. Several members, on several devices, may sign in its name at once. Its history is therefore not one line but many, and the question "was this debt incurred before or after the members split up?" has no answer from timestamps.

A collective keeps **two chains** (F127). Its **decisions** (founding, versions of its terms, members joining and leaving, grants and their revocations, a fork or closing) each cite the previous decision and the latest actions they saw. Its **actions** (debts, payments, publications, sales, and what its agents sign) each cite the previous actions and the decision they act under; where several devices sign at once, the next act joins their heads. An act within its signer's powers counts for the collective once it is **done**, that is, sealed to every member (or public) and on the chain, citing the latest act its signer knew. Before that, even signed, it is planning, and binds no one. The chain makes acts unmissable, not confirmed: every member can read what the collective does, and every later act must cite it.

### 5.3 The ending wins

The one place a race survives is where a decision that ends powers (a fork, a closing, a departure, a revocation) meets an action that uses those powers, and neither cites the other. No hash order can settle it. MOR settles it by rule: **the ending wins**, and the action is void. Otherwise anyone holding a power could prevent a fork or a closing from ever settling by racing it.

The rule voids only acts the collective never took on (F131): an act that a counting act of the collective's own key cites is adopted, and no racing ending voids it. A counterparty is therefore safe once the collective has visibly cited its act, against everything but the deliberate collusion of an ending's signers, who could draw the ending's line before the citation on purpose. That residue cannot be closed without a clock; it is stated as a cost, and it stays visible, since the signed act, its citation, and the ending that leaves it out all remain on record.

### 5.4 Endings ordered by their signers

A complete fork or closing is **final**: a later ending of the same collective that names it counts for nothing. To order two endings that do not name each other, MOR uses the one line in an identity that never branches. Each member signs a fork or closing with a **chain signature**, an act on their own identity chain, signed with the chain key (F132). Any two endings signed by the same member are therefore ordered by that member's chain, whatever devices were used. A true tie remains only between endings that share no signer, and is settled by a third ending naming both. The cost is stated: signing an ending requires the offline key ceremony, as a rotation does.

## 6. Money and agreements in the core

### 6.1 Payments

Finance defines how a payment moves, never the rails. Whatever the rail, the receiver signs the same **settlement receipt**: who paid whom, how much, in what unit, under which agreement; only the rail's proof differs, checked by the rule of the rail Module the receipt names. A payer's **claim**, carrying the same proof, is evidence on equal footing. Where receipt and claim disagree, the disagreement is shown on the receiver and the greater amount counts. Hiding income therefore requires the payer's silence or collusion. One rail proof discharges one payment.

An identity's **payee pointers** form a versioned chain. The **flow** pointer changes with the signing key; the **vault** changes only with the chain key, and receives payments above per-unit limits. An obligation names the flow pointer in force when it arose, so a thief who changes the flow pointer cannot collect older obligations. A payment that followed the published pointer and vault counts as made, even if a later rotation invalidates them: the loss from a theft window falls on the owner, never on a payer who followed the rules.

An anonymous payer may commit a one-time key in the payment; a refund is owed only to whoever signs with that key, since a payment proof (such as a Lightning preimage) proves nothing about who paid.

### 6.2 Agreements

An **agreement** is terms plus one signature act from each party. It binds identities, not keys, so it survives a party's rotation. Three rules carry most of the weight:

- **Only your own signature binds you.** No rule in any terms can make a party owe what they did not sign.
- **Clone, never modify.** A change is a new version naming the old one; it is a draft until the signatures its rules require are in. A clone never reduces a stake without its holder's signature.
- **What you sign is what you saw.** Clients show the plain text, with any characters that could reorder how text displays made visible, and what any rule computes. This is a conformance rule for clients, which no verifier can check, and the specification says so.

A **deal** is an agreement that founds no collective; it changes only with every party's signature.

**Stakes** in a work are written in millionths and sum to exactly 1,000,000. A **split**, for every incoming payment, must sum exactly, with every payout matching its stake to within one smallest unit and every fee applied alike to every stake; any deviation breaks the plan visibly. A split service never sees a member's key: it holds a **grant key**, scoped to the grant and revocable by the grantor alone, which can sign only receipts for money coming in, never a claim that it paid someone (F128 to F130).

A **purchase** names the claim it pays under; a payment that names none is not a purchase and is owed back. Where the seller is a collective, a payment becomes a sale once the collective's actions chain records it.

### 6.3 Collectives

A collective holds its keys under its founding agreement's key grammar, which must always leave a way to rotate that needs fewer than every member. Its rules fall into three tiers: **constitutional** (who decides), changed only by the constitutional change rule, every party unless the founders agreed otherwise; **judicial** (who judges, by what), changed only with every member; and **operational**, changed by the clone rule or by the holders of an **area**, a share of the collective's work, such as its payments, held by some members.

A member can always leave alone, giving up their voice and keeping their stake. A collective can end in four ways: a group splits off; a **fork**, in which each side founds a successor and the fork act hands out every obligation in the history it cites, or does not take effect; active abandonment; or dissolution by a closing act, which a collective cannot sign while it owes anything. A creditor may release a debt without full payment, by a release only the creditor signs. Members are never personal debtors of what the collective owes.

## 7. Claims and threat model

### 7.1 Assumptions

- The cryptographic primitives (SHA-256, BIP-340 Schnorr, SLH-DSA, XChaCha20-Poly1305, X25519, ML-KEM-768) are secure.
- An owner's chain key is kept offline and is not stolen. Where it is stolen, protection depends on the homes the owner chose (section 4.3).
- Verifiers are honest and follow the specifications; a verifier's conclusions are relative to the acts it holds.
- Relays may be malicious: they may withhold, reorder or refuse acts, but cannot forge signatures.
- A minority of home operators may be malicious, within the home rule the owner declared.

### 7.2 Claims

Each claim is marked **run**, where the reference implementation exercises it in the freeze test suite or the invariant tests, or **reasoned**, where it rests on argument only.

1. **Two honest verifiers holding the same acts reach the same verdicts, whatever the order in which the acts arrived.** *Run* (order replays over random histories, section 8).
2. **A stolen signing key cannot outlast the owner's next rotation:** the thief's acts outside the kept line are void, except those a third party relied on, which stay visible as disputes. *Run* (identity gauntlet; freeze scenario 5).
3. **A stolen home operator key cannot change any identity's chain, and cannot close a home.** *Run* (gauntlet).
4. **An owner holding both keys can leave any home, including a hostile one.** *Run* (gauntlet).
5. **No stake or share moves without its holder's signature, and a deal changes only with every party.** *Run* (invariants over 5,000 deals and 10,000 collectives' stake clones).
6. **Every split balances to the unit, and a deviation is visible.** *Run* (invariants; 3,839 splits in the final run).
7. **A thief who changes the flow pointer cannot collect older obligations; a payer who followed the published pointer and vault has paid.** *Run* (freeze scenario 1; regtest Lightning test).
8. **A collective owes no debt it did not sign, and no fork is undone by anything published after it.** *Run* (invariants over 5,000 collective histories).
9. **A race between an ending and an action is settled the same way in every arrival order, by the ending, unless the collective already cited the action.** *Run* (invariants).
10. **A split service's grant key can sign only receipts for money coming in.** *Run* (invariants; freeze scenario 3).
11. **Relays cannot read private content, and a sealed container does not reveal its sender.** *Reasoned*, resting on the encryption primitives; the formats are tested, the privacy is not measured.
12. **Identities, agreements and history can move to a successor protocol.** *Reasoned* (the successor case study and the "MOR 2" section of the core).

### 7.3 What MOR does not claim

- **No enforcement.** The core never enforces an agreement; it makes default impossible to hide.
- **No protection against collusion of an ending's signers** who draw a fork's line early on purpose (section 5.3): a stated, visible cost.
- **No metadata privacy.** An addressed act shows its recipient; who talks to whom is visible to relays. That is left to relay operators and cMIPs.
- **No protection for a lost chain key.** Back up both seeds.
- **No proof of distinct persons.** The protocol cannot tell whether two identities are one person.
- **Timing, load and denial of service** are relay-market concerns, outside the core.

## 8. Evaluation

### 8.1 What exists

- **Specifications:** the core document and six MIPs (about 110,000 words), with a freeze test suite of eight end-to-end scenarios (a feature film, a song with two publishers, a label run as a collective, a democracy round, a pseudonymous journalist, a streaming service, a subscription service, and the specifications themselves).
- **A findings log** of 132 entries, each recording a problem found while drafting, reviewing or building, the options considered, and the decision. It is the record of why each rule exists.
- **A reference implementation:** a Rust core library implementing all six MIPs; relays and homes; WebAssembly bindings; ten TypeScript clients (identity creation, publishing, a web reader, a collective manager, among others); and a harness that runs the identity attacks of scenario 5 against real home servers.
- **A payment rail:** a Lightning rail Module under a payment cMIP, run end to end on a private test network (regtest), including vault limits, refused units with the owner notified, and an anonymous refund claimable only by the committed key.

The Rust workspace has 328 tests and the clients 113; all pass on the current version.

### 8.2 Invariant hunting

The most informative testing came from writing Law's promises as invariants and checking them over randomly generated histories (property-based testing with shrinking). Generators produce collectives of two to five members on one to three devices each, and deals of two to four parties, with honest and adversarial behaviour: stolen keys, acts sealed to too few members, stale heads, concurrent forks and debts, revoked agents still signing, payouts disguised as receipts. Every failure is shrunk to its smallest example and kept as a permanent test.

In its final run, the hunt judged 5,000 collective histories (231,838 acts), 5,000 deals (130,114 acts) and 10,000 collectives' stake clones, and replayed 1,500 collectives and 1,500 deals in three arrival orders each, querying the verifier while acts arrived. Over successive runs it found nine implementation errors (each a rule stated clearly but implemented wrongly, now fixed) and six flaws in the specification text itself, places where it allowed an outcome its own principles forbade (IT1 to IT3, U1, U4 and U4b), each decided by the author and written in (findings F131 and F132). The checker of each invariant reads history independently of the library under test, though both were written by AI from the same text; a verifier written from the text alone by someone who never read the library is listed as open work.

### 8.3 What is only reasoned

Several freeze scenarios are marked reasoned: notably the unlinkability of ballots in the democracy round, which rests on a voting cMIP outside the core, and the move to a successor protocol. The technical parameters for freeze (the RISC-V verification profile and its test vectors, the pinned Unicode version, exact formats for parts of Finance, Law and Production) are not yet settled. No human adversarial review has taken place.

## 9. Related work

**KERI** [KERI] is the source of MOR's identity design: pre-rotation (committing to the next key by its hash), key event logs, and witnesses that receipt key events. MOR adapts it to a relay network without a ledger: homes play the role of witnesses, receipts count only alongside the act they name, an identity's everyday acts form sequences kept by rotations, and the pre-committed key uses a hash-based post-quantum signature.

**Nostr** [Nostr] showed that signed events carried by interchangeable relays can remove the intermediary from publication, and MOR began as extensions to it. MOR departs from it in identity (a hash with rotating keys rather than a permanent keypair), in ordering (citations rather than self-declared timestamps, and no replaceable events), in the scope of the core (payments and agreements rather than messages with payments added by extension), and in governance (a frozen core rather than an evolving set of improvement proposals).

**The AT Protocol** [ATProto] gives accounts portable identities whose signing and rotation keys can change, and data repositories that can move between hosts. MOR shares the goal of portable identity; it differs in having no directory service for key history (homes and receipts instead), and in carrying money and agreements in the core.

**Secure Scuttlebutt** [SSB] keeps each identity's messages in an append-only, hash-linked feed. MOR's sequences are similar, but an identity may keep several, and rotations decide which are kept.

**Certificate Transparency** [RFC 6962] and **Keybase** sigchains informed the design of home logs, signed summaries and cosigning audits.

**Ricardian contracts** [Grigg 2004] bind a human-readable contract to its cryptographic identity. MOR's agreements are in the same spirit: the terms are text, signed as shown, and every party's signature is a separate act.

**Lightning** [Lightning] is the first payment rail implemented; MOR treats rails as interchangeable Modules beneath one payment cMIP.

## 10. Open problems

Each of the following is, we believe, a self-contained piece of work, suitable for a thesis or a focused study, with a running system to test it on.

1. **Ordering without a clock.** How much of what MOR leaves undetermined can knots between identities' chains settle? A formal account of what can and cannot be ordered, and of the costs MOR states where it cannot.
2. **Identity security.** A formal model of rotation, receipts, home rules, audits and homeless rotations, and a proof (or a counterexample) that a stolen signing key, a stolen operator key, or a hostile home cannot take an identity.
3. **Formal verification of Law.** The invariants of section 8.2 are tested over random histories; can they be proven, for instance by model checking small worlds exhaustively?
4. **An independent verifier.** A second implementation of any MIP, written from the text alone. Every disagreement with the reference implementation is either a bug or a rule that allows two readings.
5. **Economics of legible greed.** Do visible fees and balanced splits produce competitive markets for services above the core? What do fee markets for relays, homes and split services look like?
6. **Governance of collectives.** Are the four endings, the tiers and the tie rule adequate for how real cooperatives, labels and associations behave? This is a question for law and economics as much as for computer science.
7. **Usability of signing what you see.** How can a client make a person understand an agreement, its rules and its computed payouts before they sign it?
8. **Post-quantum migration.** The chain key is post-quantum; everyday keys are not. What does a migration look like in practice, before a break?
9. **Anchoring.** A service pooling requests to anchor hashes in a public chain, paid per hash: how should such a service prove it did not omit anyone, and what are its incentives to cheat?

## Availability

The specifications, the findings log, the reference implementation and the tests are in the MOR repository. Contact: nobodyallegedly@proton.me.

## References

- [ATProto] Bluesky. *The AT Protocol.* atproto.com.
- [BIP-340] P. Wuille, J. Nick, T. Ruffing. *Schnorr Signatures for secp256k1.* Bitcoin Improvement Proposal 340, 2020.
- [FIPS 203] NIST. *Module-Lattice-Based Key-Encapsulation Mechanism Standard.* 2024.
- [FIPS 205] NIST. *Stateless Hash-Based Digital Signature Standard.* 2024.
- [Grigg 2004] I. Grigg. *The Ricardian Contract.* 2004.
- [KERI] S. Smith. *Key Event Receipt Infrastructure (KERI).* 2019, and the KERI specification.
- [Lamport 1978] L. Lamport. *Time, Clocks, and the Ordering of Events in a Distributed System.* Communications of the ACM 21(7), 1978.
- [Lightning] J. Poon, T. Dryja. *The Bitcoin Lightning Network.* 2016.
- [Nostr] *Nostr: Notes and Other Stuff Transmitted by Relays.* github.com/nostr-protocol/nips.
- [RFC 6962] B. Laurie, A. Langley, E. Kasper. *Certificate Transparency.* 2013.
- [RFC 8949] C. Bormann, P. Hoffman. *Concise Binary Object Representation (CBOR).* 2020.
- [SSB] D. Tarr et al. *Secure Scuttlebutt: An Identity-Centric Protocol for Subjective and Decentralized Applications.* ACM ICN 2019.

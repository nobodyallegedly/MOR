# MOR: Media, Money and Agreements over Relays

*A frozen core for identities that survive key theft, payments that cannot hide their cuts, and agreements anyone can leave*

**Nobody, allegedly** · nobodyallegedly@dubsar.org

*Draft 2, 5 October 2026. Draft 1 revised after a hostile review (`docs/reviews/fable-paper-review-1.md`): claims narrowed to what the tests show, assumptions and non-claims added, related work widened. Pre-freeze: the protocol described here is experimental, has not been reviewed by any human adversary, and must not be used with real funds.*

---

## Abstract

Platforms that carry people's media, money and agreements own the relationship: they hold the audience, set the share, keep the only record of who was paid what, and can switch anyone off. Leaving means starting from nothing. MOR (Media Over Relays) is research into a protocol that takes that position away from everyone, itself included. It has a small core of six specifications in layers (Identity; Envelope and Text; Finance; Law; Production), intended to be frozen once and never changed, and an open layer above it where extensions compete and adoption decides. Every act is signed, named by its hash and never updated: a new version is a new act naming the one before. Identities are hashes of their genesis act. Everyday acts are signed with a Schnorr key; an offline key, committed in advance by its hash and using a post-quantum signature, rotates them after a theft, and homes sign receipts for each key event. There is no clock: order exists only where one act cites another, and a collective of people acting as one identity keeps two hash-linked chains, of decisions and of actions, with a rule that settles races at its endings. Money moves on any rail through signed receipts and payer claims that must agree; splits must balance to the unit; agreements can only be cloned, never edited, and nobody owes anything they did not sign. This paper describes the design, states its claims and the assumptions under which they hold, reports what has been tested (a reference implementation in Rust, invariant testing of Law over thousands of random histories, a payment rail run end to end on a test network) and what has only been reasoned, and lists open problems. We say plainly how it was built: by an author without a coding background, with the specifications drafted and the code written with AI. We are looking for people to break it.

---

## 1. Introduction

A musician who publishes through a platform does not own the relationship with the people who listen. The platform holds the list of listeners, decides the share each party receives, keeps the only record of payments, and can remove the musician at will. A cooperative that organises through a service depends on that service for its membership rolls and its accounts. In each case the intermediary is not merely convenient: it is the only party that can say who agreed to what and who was paid, and so the only party that cannot be left.

Decentralised social protocols have shown that signed messages carried by interchangeable relays can remove the intermediary from publication. Two problems remain. The first is identity: when an identity is a single keypair, losing the key or having it stolen ends the identity, and the history built on it. The second is everything beyond messages: payments, shared ownership, and agreements among several people, which in practice return to centralised services because the protocol has no language for them.

MOR (Media Over Relays) is an attempt to give identity, money and agreements a shared, minimal language that no party controls, and that can be left. Its design rests on four principles:

- **A frozen core.** Six specifications, the MIPs, are frozen once and never changed. There is no improvement process for the core and nothing at the centre to lobby. All choice and competition happen above it, in cMIPs and Modules that anyone may write and anyone may adopt or ignore.
- **Legible greed.** The protocol does not forbid anyone from taking a cut; it makes every cut visible to those it concerns. A fee is consented by whoever bears it, and a split that does not balance to the unit is visibly broken.
- **The right of exit.** An identity, its history and its agreements can always leave: to other homes, to other services, and to a successor protocol.
- **Evolutionary design.** The core is expected to be succeeded. It is built to be a good ancestor, so that a successor can carry identities and agreements across.

This paper is organised as follows. Section 2 describes how MOR was built. Section 3 gives the architecture, including how MOR orders acts without a clock, and sections 4 and 5 the two parts we consider most novel: identity that survives key theft, and money and agreements in the core, ending with how a collective orders what its members do. Section 6 states the claims and the threat model. Section 7 reports what was tested and what was only reasoned. Section 8 discusses related work, and section 9 lists open problems.

## 2. How MOR was built

We state this first, because it bears on how much weight the rest of the paper can carry.

**The author.** MOR's concept, and every decision recorded in its specifications, are the author's. The author has no coding background and works from logic and scenarios. The design began in June 2026 as a set of extensions to Nostr, and became a separate protocol in September 2026.

**The specifications and the code were drafted with AI.** The MIPs were drafted with Claude, an AI system made by Anthropic, acting as project lead: proposing wording and options, which the author accepted, rejected or redirected, one decision at a time. The reference implementation (a Rust core library, relays, a test harness, and TypeScript clients) was written by AI coding sessions working from the specifications, between 28 September and 5 October 2026. Every decision about a rule was taken by the author; the record of each, with the question it answered and the options weighed, is public (section 7).

**Review so far.** The specifications have been through two adversarial reviews, both by AI systems: a fresh-eyes review (round 1) and a second, more aggressive review (round 2), each finding and its decision recorded in the findings log. A third AI review, of this paper, is published beside it. Writing the code was itself treated as a review: whenever implementing a rule exposed a gap, a contradiction or a rule that could not be checked, work stopped and the author decided. Law was then stress-tested by invariant hunting over random histories (section 7).

**What has not happened.** No human adversary has yet tried to break MOR. That review (round 3) is the purpose of publishing this draft.

**Why say so.** A reader who distrusts AI-assisted work should know before investing time; a reader who does not should know what kind of evidence stands behind each claim. Section 7 separates what was run from what was only reasoned.

## 3. Architecture

### 3.1 Acts

Everything in MOR is an **act**: a signed object, encoded in deterministic CBOR [RFC 8949], named by the hash of its content, and never updated. An act has an **outside**, which carries only what a relay needs (the signer, a commitment to the inside, recipients if any, and the content key if the act is public), and a locked **inside**, which carries everything else, including the act's type and payload. Everything is encrypted by default: a public act is simply an encrypted act whose key travels with it. The inside carries a random salt, so short private acts cannot be guessed from their hash, and the outside commits to the unlocked inside, so one signature can never open to two contents.

An act has one signer. Anything that needs two identities is two acts, the second naming the first. An act counts for a verifier only once the verifier holds it: nothing forces propagation, and delivery is the signer's interest.

Hashes are SHA-256 with domain-separating tags, in the style of BIP-340 [BIP-340], every tag beginning `MOR/`; a successor protocol must use a different prefix, so that nothing can be replayed across the two. Content is encrypted with XChaCha20-Poly1305 under a fresh key per object. Encryption keys for identities are hybrid, X25519 with ML-KEM-768 [FIPS 203] (X-Wing [X-Wing]).

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

### 3.4 No clock

MOR has no clock: timestamps are hints, never load-bearing. Two acts are ordered only where one cites the other, directly or through what it cites, the happened-before relation of Lamport [Lamport 1978]. Where one identity's act names another's, their chains knot, and order carries across through the knots. Agreements that need real deadlines name a **time reference**, such as a block height. So every rule is stated in terms of what cites what, never of when; section 5.4 shows what that costs where several people act as one. In the author's words: *MOR has no clock, but anchoring to one is a task the core defines and accepts; we simply do not wish to specify how.* Where a rule depends on a time, as after the theft of a key (section 5.1), the core states what an anchor must prove and leaves how to anchor to the modules that compete to do it, as it does for payment rails and media formats.

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

The **identity chain** holds only key events: the genesis, rotations, and (since F132) chain signatures, which are described in section 5.4. It is meant never to branch: each event reveals the committed chain key and commits the next one, so only a thief holding the chain key can make a rival event at the same position. If one does, the identity is visibly **contested** at that position until its homes settle it (section 4.3).

Everyday acts form **sequences**, one or several per identity (for example one per device). Each everyday act names the previous act in its sequence, its position, and a **running summary** of the sequence: the root of a Merkle mountain range over the act ids up to the previous act. The summary lets anyone prove cheaply that an act lies on the line leading to a later act, without opening private acts.

A **rotation** is signed offline with the chain key and delivered, byte for byte, to every home. It reveals the committed key, binds a new signing key, commits the next chain key, and names the latest genuine act of each sequence it keeps, with its position and running summary. It may also disown acts inside the kept ancestry. Acts in the kept ancestry stay valid however old; acts outside it, or disowned, are void, unless another identity acknowledged them (by an Identity, Finance or Law act) or a named keeper recorded them before recording the rotation, in which case they remain visible as disputes. So when a signing key is stolen, the owner rotates from an offline device, keeps their own line, and voids the thief's acts, except where a third party had already relied on them, which stays visible.

### 4.3 Homes and receipts

A **home** is a relay that stores and serves identity chains, run by an **operator**, an ordinary identity that signs everything the home states. For each key event it accepts, a home signs a **receipt**: which act, at which position, at which point in the home's own log (a counter, never a time), and that it was the first it accepted there. A receipt counts only alongside the valid act it names: a receipt of nothing is neither support nor conflict. Receipts are proof, not permission. Two receipts for two genuine rotations at one position prove a home dishonest; a stolen operator key alone can produce nothing that changes any identity's chain.

An identity may declare several homes and a **home rule**: one authoritative home, or a threshold above half the operators. Homes are counted per operator. Homes may audit each other by cosigning summaries of their logs, and an identity may require audited receipts. An identity may also host its own home, a trust model chosen knowingly: its rotations count on its own signature, and a thief holding its chain key wins at once.

### 4.4 The way out

If its homes are gone or hostile, an owner can leave with a **homeless rotation**, signed with the current chain key and naming new homes. A live old home can void it with an objection; a homeless rotation becomes final against objections once the owner's next rotation counts. A rotation the old homes had already receipted at the same position still beats it, even when a verifier learns of it late, so a chain key found years later can never replace the rotations made since. An owner holding both keys can endorse a homeless rotation with the signing key too, and then leave any home, even one that refuses them. An owner who loses the chain key can never rotate or leave.

Succession is declared in a rotation, naming a successor identity in MOR or in another protocol, and two-way **links** let an identity be confirmed from both sides.

## 5. Money and agreements in the core

### 5.1 Payments

Finance defines how a payment moves, never the rails. Whatever the rail, the receiver signs the same **settlement receipt**: who paid whom, how much, in what unit, under which agreement; only the rail's proof differs, checked by the rule of the rail Module the receipt names. A payer's **claim**, carrying the same proof, is evidence on equal footing. Where receipt and claim disagree, the disagreement is shown on the receiver and the greater amount counts. Hiding income therefore requires the payer's silence or collusion. One rail proof discharges one payment.

An identity's **payee pointers** form a versioned chain. The **flow** pointer changes with the signing key; the **vault** changes only with the chain key, and receives payments above per-unit limits. The flow pointer that counts for a debt is the latest one the payee's own acts hold, so a thief who changes the flow pointer cannot collect older obligations once the owner has changed the locks; during the theft window the stolen key can re-point the owner's deals, the owner's cost, bounded per payment by the vault limits (F169, F170). A payment that followed the published pointer and vault counts as made until the owner anchors the lock change; after it, only where the payee's own receipt or a payer's claim anchored earlier shows it, anchor or bear the loss (F169; decided, not yet built): the loss from a theft window falls on the owner, never on a payer who followed the rules.

An anonymous payer may commit a one-time key in the payment; a refund is owed only to whoever signs with that key, since a payment proof (such as a Lightning preimage) proves nothing about who paid.

### 5.2 Agreements

An **agreement** is terms plus one signature act from each party. It binds identities, not keys, so it survives a party's rotation. Three rules carry most of the weight:

- **Only your own signature binds you.** No rule in any terms can make a party owe what they did not sign.
- **Clone, never modify.** A change is a new version naming the old one; it is a draft until the signatures its rules require are in. A clone never reduces a stake without its holder's signature.
- **What you sign is what you saw.** Clients show the plain text, with any characters that could reorder how text displays made visible, and what any rule computes. This is a conformance rule for clients, which no verifier can check, and the specification says so.

A **deal** is an agreement that founds no collective; it changes only with every party's signature.

Signatures are separate acts, so there is no fair exchange: nobody is bound until the signatures the terms require are all in, and until then the last party to sign holds an option on the others. MOR does not remove that option.

**Stakes** in a work are written in millionths and sum to exactly 1,000,000. A **split**, for every incoming payment, must sum exactly, with every payout matching its stake to within one smallest unit and every fee applied alike to every stake; any deviation breaks the plan visibly. A split service never sees a member's key: it holds a **grant key**, scoped to the grant and revocable by the grantor alone, which can sign only receipts for money coming in, never a claim that it paid someone (F128 to F130).

A **purchase** names the claim it pays under; a payment that names none is not a purchase and is owed back. Where the seller is a collective, a payment becomes a sale once the collective's actions chain records it.

### 5.3 Collectives

A **collective** is one identity, with its own keys, whose members act for it under a founding agreement. It holds its keys under its founding agreement's key grammar, which must always leave a way to rotate that needs fewer than every member. Its rules fall into three tiers: **constitutional** (who decides), changed only by the constitutional change rule, every party unless the founders agreed otherwise; **judicial** (who judges, by what), changed only with every member; and **operational**, changed by the clone rule or by the holders of an **area**, a share of the collective's work, such as its payments, held by some members.

A member can always leave alone, giving up their voice and keeping their stake. A collective can end in four ways: a group splits off; a **fork**, in which each side founds a successor and the fork act hands out every obligation in the history it cites, or does not take effect; active abandonment; or dissolution by a closing act, which a collective cannot sign while it owes anything. A creditor may release a debt without full payment, by a release only the creditor signs. Members are never personal debtors of what the collective owes.

### 5.4 Order inside a collective

Several members of a collective, on several devices, may sign in its name at once. Its history is therefore not one line but many, and the question "was this debt incurred before or after the members split up?" has no answer from timestamps.

**Two chains.** A collective keeps two hash-linked chains (F127). Its **decisions** (founding, versions of its terms, members joining and leaving, grants and their revocations, a fork or closing) each cite the previous decision and the latest actions they saw. Its **actions** (debts, payments, publications, sales, and what its agents sign) each cite the previous actions and the decision they act under; where several devices sign at once, the next act joins their heads. An act within its signer's powers counts for the collective once it is **done**, that is, sealed to every member (or public) and on the chain, citing the latest act its signer knew. Before that, even signed, it is planning, and binds no one. The chain makes acts unmissable, not confirmed: every member can read what the collective does, and every later act must cite it.

**The ending wins.** The one place a race survives is where a decision that ends powers (a fork, a closing, a departure, a revocation) meets an action that uses those powers, and neither cites the other. No hash order can settle it. MOR settles it by rule: **the ending wins**, and the action is void. Otherwise anyone holding a power could prevent a fork or a closing from ever settling by racing it.

The rule voids only acts the collective never took on (F131): an act that a counting act of the collective's own key cites is adopted, and no racing ending voids it. A counterparty is therefore safe once the collective has visibly cited its act, against everything but the deliberate collusion of an ending's signers, who could draw the ending's line before the citation on purpose. That residue cannot be closed without a clock; it is stated as a cost, and it stays visible, since the signed act, its citation, and the ending that leaves it out all remain on record.

This is MOR's consistency model, and it is weak on purpose. There is no consensus: two verifiers holding the same acts reach the same verdicts (claim 1), but a verifier's verdict is only as complete as the acts it holds, and the signers of an ending choose, by what they cite, where its line falls. A counterparty is safe from that choice only once the collective has cited its act. The model is close to Byzantine eventual consistency [Kleppmann 2020] and to state resolution in Matrix [Matrix], with one rule added for the race those leave open.

**Endings ordered by their signers.** A complete fork or closing is **final**: a later ending of the same collective that names it counts for nothing. To order two endings that do not name each other, MOR uses the one line in an identity that never branches. Each member signs a fork or closing with a **chain signature**, an act on their own identity chain, signed with the chain key (F132). Any two endings signed by the same member are therefore ordered by that member's chain, whatever devices were used. A true tie remains only between endings that share no signer, and is settled by a third ending naming both. The cost is stated: signing an ending requires the offline key ceremony, as a rotation does.

## 6. Claims and threat model

### 6.1 Assumptions

- The cryptographic primitives (SHA-256, BIP-340 Schnorr, SLH-DSA, XChaCha20-Poly1305, X25519, ML-KEM-768) are secure. The post-quantum property covers only the chain key's signatures on key events. Everyday acts, home receipts and operators' acts use Schnorr over secp256k1, and which rotation counts rests on receipts signed that way.
- An owner's chain key is kept offline and is not stolen. Where it is stolen, protection depends on the homes the owner chose (section 4.3).
- An owner notices a theft of the signing key and rotates. Until they do, a thief signs as them (section 5.1 bounds what a thief can take meanwhile).
- Verifiers are honest and follow the specifications. A verifier's conclusions are relative to the acts it holds.
- There is no liveness guarantee. Relays may withhold, reorder or refuse acts, but cannot forge signatures; an adversary who keeps an act from a verifier changes what that verifier concludes.
- A minority of home operators may be malicious, within the home rule the owner declared. Operators are identities, not persons: the home rule counts operators, and an owner must choose homes it trusts to be run by different people.
- Clients conform. Several rules, such as showing an agreement as signed (section 5.2) or refusing to sign an ending until every device's acts are held, are client conformance that no verifier can check.
- Time references and rail Modules are trusted inputs: a deadline is only as sound as the time reference an agreement names, and a payment proof only as sound as its rail's rule.

### 6.2 Claims

Each claim is marked **run**, where the reference implementation exercises it in its test suites, or **reasoned**, where it rests on argument only, with the test or text it rests on.

1. **Two honest verifiers holding the same acts, inclusion proofs, content keys and attempts to reach homes reach the same verdicts, whatever the order in which the acts arrived.** A verdict resting on a reader's own failed attempt to reach a home (the escape from a censor) is marked as such, and nothing binding may rest on it: a keeper record, payment, discharge of a debt, agreement, fork or closing that would is shown as unknown (F137, F153; decided, not yet built). *Run for Law*: order replays of 1,500 collective and 1,500 deal histories (section 7.2). *Reasoned for Identity*: races between rotations, homeless rotations and late objections are tested in fixed orders, not replayed in shuffled ones.
2. **A stolen signing key cannot outlast the owner's next rotation:** the thief's acts outside the kept line are void, except those a third party relied on, which stay visible as disputes (a thief's offer acknowledged even after the rotation stays visible so, though for money it holds and signs nothing); payments to the thief's pointer count as made until the lock change's point, the earliest anchored home receipt of the rotation on the clock the owner declared, and after it only where the payee's receipt or a claim anchored no later shows them (Finance rule 15, F169, F176 to F178; decided, not yet built). *Run* (core library tests of rotation, kept ancestry and acknowledgements, `core/tests/chain.rs`; in the Law invariants, 743 thief's signatures voided by a rotation in the final deal run).
3. **A stolen home operator key cannot change any identity's chain, and cannot close a home.** *Run* (identity gauntlet, `harness/`, against the relay's home server started locally for the attack steps).
4. **An owner holding both keys can leave any home, including a hostile one.** *Run* (identity gauntlet, as for claim 3).
5. **No stake or share moves without its holder's signature, or the declaration of an authority the holder's own signature named for it, and a deal changes only with every party.** *Run* (Law invariants over 5,000 deals and 10,000 collectives' stake clones).
6. **Every split sums exactly and pays each holder its share up to rounding, and a deviation is visible.** Rounding allows no holder a whole smallest unit or more below its exact share, and, where the default rule applies, none a whole unit or more above it (F162, F168). *Run* (Law invariants; 3,839 splits in the final deal run). That every fee falls alike on every stake is *not tested*: the split plan's format is still open.
7. **A payment above a unit's vault limit, or in a unit the vault does not cover, is not paid to the flow pointer.** *Run* (Lightning regtest test, a manual run on a test machine; the automated test skips without a regtest network). **A thief who changes the flow pointer cannot collect older obligations.** *Run* (`modules/lightning/tests/flow_theft.rs`, over signed Lightning invoices, and `core/tests/finance.rs`, `rule_14_older_obligations_and_the_flow`): royalties whose obligation names the earlier flow pointer, paid to the thief's new flow, do not count, and paid to the vault, they do (`the_thief_cannot_collect_older_royalties_through_the_new_flow`); an obligation the thief re-issues with the creditor's stolen key, naming the new pointer, is invalid as an obligation, since only the debtor signs one (`an_obligation_the_thief_reissues_is_no_obligation`); a tip that followed the published pointer, the thief's, counts (`a_tip_that_followed_the_published_pointer_counts`). A debt the debtor re-signs to name the thief's pointer, which its agreement act never cited, does not count toward the thief's flow either: the version an obligation names must be one its agreement act holds in its history (F133; `core/tests/finance_f133.rs`, over signed acts, and `a_debt_resigned_to_the_thiefs_pointer_its_agreement_never_cited_does_not_count`). A review of 6 October 2026 found that the agreement act may be drafted by the payer, so the rule now judges the version by the payee's own act, their signature on the agreement or their offer, and counts a debt with no act of the payee's only when paid to the vault (F145); that change is decided and not yet built, and the tests above exercise the earlier wording. Where a verifier does not hold enough of that history to tell, the payment is judged unknown, never counted. A thief who forks the pointer chain (a second pointer with the same version) instead of extending it collects nothing either: a forked chain counts only up to the fork (rule 12), in the payment check and in Law's count of what pays a debt (`a_thiefs_same_version_pointer_cannot_collect_debts_naming_the_owners`, and `core/tests/law_collective.rs`, `a_debt_is_paid_only_where_the_creditors_rules_let_it_count`; found by the audit of 6 October 2026, `docs/must-audit-2026-10.md`, gap 1, and closed the same day). The cost is stated: until a rotation settles the fork, the owner's own pointer past the fork does not count either. A payment received on the flow above the vault's limit, or in a unit it does not cover, is likewise judged not to count, not only refused by the payer's wallet (`the_vault_rules_judge_a_payment_received_on_the_flow`).
8. **A collective owes no debt it did not sign, and a complete fork or closing stays final against any later ending that names it or shares a signer with it.** *Run* (Law invariants over 5,000 collective histories). Two exceptions are stated costs, counted by the tests rather than failed: a concurrent ending sharing no signer with it (a true tie, settled by a third ending), and an old proposal finished late by members who signed no ending naming it.
9. **A race between an ending and an action is settled the same way in every arrival order, by the ending, unless the collective already cited the action.** *Run* (Law invariants and order replays). This is a deterministic verdict, not safety for the counterparty before the citation (section 5.4).
10. **A split service's grant key can sign only receipts for money coming in.** *Run* (Law invariants).
11. **Relays cannot read private content, and a sealed container does not reveal its sender.** *Reasoned*, resting on the encryption primitives; the formats are tested, the privacy is not measured.
12. **Identities, agreements and history can move to a successor protocol.** *Reasoned* (the successor case study and the "MOR 2" section of the core).

### 6.3 What MOR does not claim

- **No enforcement.** The core never enforces an agreement; it makes default impossible to hide.
- **No consensus.** Verdicts converge among verifiers holding the same acts; nothing makes them hold the same acts (section 5.4).
- **No protection against collusion of an ending's signers** who draw a fork's line early on purpose (section 5.4): a stated, visible cost.
- **No fair exchange** between the signers of an agreement (section 5.2).
- **No forward secrecy.** Private content is sealed to an identity's encryption key; whoever steals that key can open what was sealed to that key before.
- **Partial metadata privacy.** MOR hides the sender of private messages, not the recipient. A private act delivered in a sealed container shows relays only its recipients and its size: the container is signed with a one-time key that belongs to no identity, and the sender is known only inside it (Envelope, "Sealed containers"). A delivery to a bare key shows neither. A public act addressed to someone, or a private act stored openly with its recipients listed, shows both signer and recipients, on purpose. Timing and size are always visible, and the network can betray a sender: a relay sees the address a container came from. Hiding that, and who receives, is left to the transport (onion addresses, mixing relays) and to relay operators and cMIPs.
- **No protection for a lost chain key.** Back up both seeds.
- **No proof of distinct persons.** The protocol cannot tell whether two identities are one person, or two home operators one company.
- **Timing, load and denial of service** are relay-market concerns, outside the core.

## 7. Evaluation

### 7.1 What exists

- **Specifications:** the core document and six MIPs (about 110,000 words), with a freeze test suite of eight end-to-end scenarios (a feature film, a song with two publishers, a label run as a collective, a democracy round, a pseudonymous journalist, a streaming service, a subscription service, and the specifications themselves).
- **A findings log** of 132 entries, each recording a problem found while drafting, reviewing or building, the options considered, and the decision. It is the record of why each rule exists.
- **A reference implementation:** a Rust core library implementing all six MIPs; relays and homes; WebAssembly bindings; ten TypeScript clients (identity creation, publishing, a web reader, a collective manager, among others); and a harness that runs the identity attacks of scenario 5 against the relay's home server (benign steps also against homes deployed on the internet).
- **A payment rail:** a Lightning rail Module under a payment cMIP, run end to end on a private test network (regtest) on a test machine, including vault limits, refused units with the owner notified, and an anonymous refund claimable only by the committed key.

The Rust workspace has 330 tests; all passed in a clean run by an independent AI reviewer on 5 October 2026, the Lightning test skipping for want of a regtest network. Nine of the clients have 113 tests between them, all passing; the tenth, the website client, has its own, including tests in a browser. `scripts/test-all.sh` runs everything with one command.

### 7.2 Invariant hunting

The most informative testing came from writing Law's promises as invariants and checking them over randomly generated histories (property-based testing with shrinking). Generators produce collectives of two to five members on one to three devices each, and deals of two to four parties, with honest and adversarial behaviour: stolen keys, acts sealed to too few members, stale heads, concurrent forks and debts, revoked agents still signing, payouts disguised as receipts. Every failure is shrunk to its smallest example and kept as a permanent test.

In its final run, the hunt judged 5,000 collective histories (231,838 acts), 5,000 deals (130,114 acts) and 10,000 collectives' stake clones, and replayed 1,500 collectives and 1,500 deals in three arrival orders each, querying the verifier while acts arrived. Over successive runs it found nine implementation errors (each a rule stated clearly but implemented wrongly, now fixed) and six flaws in the specification text itself, places where it allowed an outcome its own principles forbade (IT1 to IT3, U1, U4 and U4b), each decided by the author and written in (findings F131 and F132).

Its limits, as its report states them (`docs/law-invariants.md`):

- **What the generators do not exercise:** rotations of a collective, succession plans and abandonment declarations, keepers, timed releases, standing offers, members' own votes racing their departure, and fees falling alike on several stakes.
- **One failure is unexplained.** An early run of 500 cases failed with its message lost, before a later fix; it is recorded as unclassified, and it has not recurred in any run since.
- **The large runs reported here cannot be replayed exactly:** their random seeds were not recorded. Only the shrunk counterexamples, kept as named tests, can. Every run now prints its seed, and a run can be replayed exactly from it (`docs/law-invariants.md`, "Seeds"); the next large runs will be reported with theirs.
- **Checker and library are not independent.** The checker of each invariant reads history separately from the library under test, but both were written by AI from the same text. A verifier written from the text alone by someone who never read the library is listed as open work.

### 7.3 What the code does not yet check

An audit on 6 October 2026 (`docs/must-audit-2026-10.md`) mapped all 737 rules and sentences of the six MIPs and the payment cMIP to the code. 484 were enforced by the reference implementation, 422 of them with a test; 74 bind clients and cannot be checked by a verifier; 40 have formats still open; 123 were not checked; 16 could not be checked as written (all since decided, F134 to F140). The largest gaps were in counting money after a rail has verified it (which debts a payment settles, double entry, the vault applied to payments received, splits and their payouts), in grants (scope and limits), and in specifications themselves. The same day, the first of these were closed: a debt is now paid only by a payment with the rail's answer, in its unit, paid where the creditor's pointer chain and vault let it count, and a payer's claim counts on equal footing with a receipt (489 enforced, 427 tested, 118 not checked). Then the Law gaps on grants, releases and splits: a grant's scope and the agreements it names are enforced, and a grant carrying limits answers unknown rather than "backed"; a release is judged by the agreement version in force; a split is the named service's own act, judged against the stakes as currently held, with evidence for every role share; and a split service is held to account, every payment it received without a split and every payout without the receiver's receipt listed as its open obligation (506 enforced, 444 tested, 102 not checked). The split plan's format, and specifications, remain open. The claims of section 6.2 are stated against what is checked; the gaps are open work.

### 7.3 What is only reasoned

The freeze test suite does not yet mark each scenario run or reasoned: that marking is the freeze report, still to be written, and section 6.2 is the nearest thing to it today. Some scenarios rest on cMIPs not yet written, notably the voting in the democracy round. The technical parameters for freeze are not settled: the RISC-V verification profile and its test vectors, the running summary's test vector, the format of a signature-scheme specification, the pinned Unicode version, and exact formats for parts of Finance, Law and Production. No human adversarial review has taken place.

## 8. Related work

**KERI** [KERI] is the source of MOR's identity design: pre-rotation (committing to the next key by its hash), key event logs, and witnesses that receipt key events. MOR adapts it to a relay network without a ledger: homes play the role of witnesses, receipts count only alongside the act they name, an identity's everyday acts form sequences kept by rotations, and the pre-committed key uses a hash-based post-quantum signature.

**Nostr** [Nostr] showed that signed events carried by interchangeable relays can remove the intermediary from publication, and MOR began as extensions to it. Nostr has proposed delegated signing and key migration as extensions [NIP-26]. MOR departs from it in identity (a hash with rotating keys rather than a permanent keypair), in ordering (citations rather than self-declared timestamps, and no replaceable events), in the scope of the core (payments and agreements rather than messages with payments added by extension), and in governance (a frozen core rather than an evolving set of improvement proposals).

**The AT Protocol** [ATProto] gives accounts portable identities whose signing and rotation keys can change, and data repositories that can move between hosts. MOR shares the goal of portable identity; it differs in having no directory service for key history (homes and receipts instead), and in carrying money and agreements in the core.

**Secure Scuttlebutt** [SSB] keeps each identity's messages in an append-only, hash-linked feed. MOR's sequences are similar, but an identity may keep several, and rotations decide which are kept.

**Certificate Transparency** [RFC 9162], **CONIKS** [CONIKS] and **Keybase** sigchains [Keybase] informed the design of home logs, signed summaries and cosigning audits. The running summary of a sequence is a Merkle mountain range [MMR].

**Byzantine eventual consistency** [Kleppmann 2020] gives, with proofs, the guarantee of claim 1 for replicated data under Byzantine peers. **Matrix** state resolution [Matrix] is the closest deployed analogue of the ending-wins rule: a deterministic way for servers to agree on a room's state after concurrent changes to its powers.

**Macaroons** [Macaroons] and **UCAN** [UCAN] are scoped, delegable credentials, the family MOR's grant keys belong to. MOR's grant keys are revocable by the grantor alone and live in the agreement's terms.

**GNU Taler** [Taler] makes merchants' income transparent to auditors, the same aim as MOR's double entry of receipts and payer claims. **Bitcoin vaults** [Möser 2016] protect funds with a key kept apart and limits on what a hot key can move, as MOR's vault does for incoming payments. The contract-signing and **fair exchange** literature [Asokan 1998] addresses the last-signer option MOR leaves open (section 5.2).

**Ricardian contracts** [Grigg 2004] bind a human-readable contract to its cryptographic identity. MOR's agreements are in the same spirit: the terms are text, signed as shown, and every party's signature is a separate act.

**Lightning** [Lightning] is the first payment rail implemented; MOR treats rails as interchangeable Modules beneath one payment cMIP.

## 9. Open problems

Each of the following is, we believe, a self-contained piece of work, suitable for a thesis or a focused study, with a running system to test it on.

1. **Ordering without a clock.** How much of what MOR leaves undetermined can knots between identities' chains settle? A formal account of what can and cannot be ordered, of MOR's consistency model against Byzantine eventual consistency, and of the costs MOR states where it cannot order.
2. **Identity security.** A formal model of rotation, receipts, home rules, audits and homeless rotations, and a proof (or a counterexample) that a stolen signing key, a stolen operator key, or a hostile home cannot take an identity.
3. **Formal verification of Law.** The invariants of section 7.2 are tested over random histories; can they be proven, for instance by model checking small worlds exhaustively?
4. **An independent verifier.** A second implementation of any MIP, written from the text alone. Every disagreement with the reference implementation is either a bug or a rule that allows two readings.
5. **Economics of legible greed.** Do visible fees and balanced splits produce competitive markets for services above the core? What do fee markets for relays, homes and split services look like?
6. **Governance of collectives.** Are the four endings, the tiers and the tie rule adequate for how real cooperatives, labels and associations behave? This is a question for law and economics as much as for computer science.
7. **Usability of signing what you see.** How can a client make a person understand an agreement, its rules and its computed payouts before they sign it?
8. **Post-quantum migration.** The chain key is post-quantum; everyday keys are not. What does a migration look like in practice, before a break?
9. **Anchoring.** A service pooling requests to anchor hashes in a public chain, paid per hash: how should such a service prove it did not omit anyone, and what are its incentives to cheat?

## Availability

The specifications, the findings log, the reference implementation and the tests are in the MOR repository. The texts, this paper included, are licensed CC BY 4.0; the code MIT or Apache 2.0. Contact: nobodyallegedly@dubsar.org.

## References

- [ATProto] Bluesky. *The AT Protocol.* atproto.com.
- [BIP-340] P. Wuille, J. Nick, T. Ruffing. *Schnorr Signatures for secp256k1.* Bitcoin Improvement Proposal 340, 2020.
- [FIPS 203] NIST. *Module-Lattice-Based Key-Encapsulation Mechanism Standard.* 2024.
- [FIPS 205] NIST. *Stateless Hash-Based Digital Signature Standard.* 2024.
- [Asokan 1998] N. Asokan, V. Shoup, M. Waidner. *Optimistic Fair Exchange of Digital Signatures.* EUROCRYPT 1998.
- [CONIKS] M. Melara, A. Blankstein, J. Bonneau, E. Felten, M. Freedman. *CONIKS: Bringing Key Transparency to End Users.* USENIX Security 2015.
- [Grigg 2004] I. Grigg. *The Ricardian Contract.* 2004.
- [KERI] S. Smith. *Key Event Receipt Infrastructure (KERI).* 2019, and the KERI specification.
- [Keybase] Keybase. *Sigchain.* keybase.io/docs/teams/sigchain.
- [Kleppmann 2020] M. Kleppmann, H. Howard. *Byzantine Eventual Consistency and the Fundamental Limits of Peer-to-Peer Databases.* arXiv:2012.00472, 2020.
- [Lamport 1978] L. Lamport. *Time, Clocks, and the Ordering of Events in a Distributed System.* Communications of the ACM 21(7), 1978.
- [Lightning] J. Poon, T. Dryja. *The Bitcoin Lightning Network.* 2016.
- [Macaroons] A. Birgisson, J. Politz, Ú. Erlingsson, A. Taly, M. Vrable, M. Lentczner. *Macaroons: Cookies with Contextual Caveats for Decentralized Authorization in the Cloud.* NDSS 2014.
- [Matrix] The Matrix.org Foundation. *Matrix Specification: State Resolution, room versions 2 and later.* spec.matrix.org.
- [MMR] P. Todd. *Merkle Mountain Ranges.* 2012.
- [Möser 2016] M. Möser, I. Eyal, E. G. Sirer. *Bitcoin Covenants.* Financial Cryptography workshops (BITCOIN'16), 2016.
- [NIP-26] *NIP-26: Delegated Event Signing.* github.com/nostr-protocol/nips.
- [Nostr] *Nostr: Notes and Other Stuff Transmitted by Relays.* github.com/nostr-protocol/nips.
- [RFC 9162] B. Laurie, E. Messeri, R. Stradling. *Certificate Transparency Version 2.0.* 2021.
- [RFC 8949] C. Bormann, P. Hoffman. *Concise Binary Object Representation (CBOR).* 2020.
- [SSB] D. Tarr et al. *Secure Scuttlebutt: An Identity-Centric Protocol for Subjective and Decentralized Applications.* ACM ICN 2019.
- [Taler] F. Dold. *The GNU Taler System: Practical and Provably Secure Electronic Payments.* PhD thesis, Université de Rennes 1, 2019.
- [UCAN] UCAN Working Group. *User Controlled Authorization Network (UCAN) Specification.* ucan.xyz.
- [X-Wing] M. Barbosa, D. Connolly, J. Duarte, A. Kaiser, P. Schwabe, K. Varner, B. Westerbaan. *X-Wing: The Hybrid KEM You've Been Looking For.* IACR Communications in Cryptology 1(1), 2024.

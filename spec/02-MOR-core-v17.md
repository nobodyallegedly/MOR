# MOR Core

*Version 17, 30 September 2026. Version 16 with F102 applied: a text format shows what it does not hide in the order of the bytes, and never makes it invisible by styling (MIP: Text), and naming the current drafts, Identity 10, Text 6 and Law 6, where version 16 still named Identity 9 and Law 4. Version 16 was version 15 with F99 applied: a private act reaches its recipients inside a sealed container that carries its key ("Everything encrypted by default", "Public receiver, private sender"), and naming Envelope draft 6, which also carries F98 (X-Wing). Version 15 was version 14 with F92 applied: a rotation that counts under the old home rule beats a homeless rotation even once it is final ("The way out"), and naming Identity draft 9, which also carries F93 to F95. Version 14 applied F91: no data item in an act is nested more than 128 levels deep ("Common conventions"), and naming Envelope draft 5, which also carries F89 and F90. Version 13 applied F87: a homeless rotation accepted only on a client's own failed attempt is never made final by the next rotation ("The way out", glossary). Version 12 applied review round 2 (findings F53 to F82). The MIP drafts (Identity 10, Text 6, Envelope 6, Finance 5, Law 6, Production 4) hold the exact formats and rules; this document is the map, and must stand on its own.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

This document defines the core of MOR (Media Over Relays): the MIPs. Once frozen, the core never changes. There is no MIP process; all choice and competition happen in cMIPs and Modules.

The core is deliberately agnostic. It describes identities, media, money, agreements and specifications, never what anyone does with them. What MOR could become is shown separately, in the case studies and the cMIPs and Modules they reference. For a plain-language walkthrough, see "MOR in one page".

*Reviewers should try to break it, above all identity continuity, ordering without a clock, and whether any case study needs something this core cannot express.*

## Structure

The core is six MIPs, organised in layers, each depending on those beneath it. No rule of a lower layer depends on data only a higher layer's client holds; where a higher layer needs a lower one to carry something, it is a field there.

| Layer | MIPs | Contains |
| --- | --- | --- |
| Ground | Identity | Identity hash, keys, rotation, homes and receipts, sequences, routes and the inbox, links, succession, the way out |
| Communication | Envelope, Text | Acts (outside and locked inside), public and private, key delivery, chains, media, relays, delivery, withdrawal; canonical text |
| Finance | Finance | Obligations, settlement receipts and payer claims across rails, payee pointers, flow and vault |
| Law | Law | Agreements, keepers, stakes, work claims, splits, offers, time, collectives, grants, cloning, abandonment, contests |
| Production | Production | How specifications are named, published, adopted and paid; tasks and extensions; the trust root |

**Tasks.** A task is a point where a MIP hands work to a cMIP. Tasks exist only where the MIPs define them; the full list is in Production.

**Extensions.** An agreement may also name cMIPs outside the listed tasks, for work nobody foresaw. An extension may add rules, never relax the core's.

**Client conformance.** Every client implements Identity, Envelope and Text. Every other MIP is optional per client, but all-or-nothing: a client implements it fully, or shows its acts as unknown. A client must implement every MIP whose acts it acts on: a wallet that only sends tips needs Finance; a client that acts on agreements needs Law. Rules that only the signer's own client can honour (what you sign is what you saw; showing what a rule computes; never choosing a device-bound policy by default) are marked as conformance, not validity: no verifier can check them, and the text says so.

**Admission test.** Something belongs in the core only if it is part of the shared language every act is written in, or a guarantee no module may be able to break.

**Guiding question for every MIP:** what is the least the core needs to know to make this work?

**Four review rules,** applied to every rule in the core (round 2): a record that decides status or money counts only alongside something the party who benefits cannot produce alone; a layer's validity depends only on data its own clients hold; every protection an owner chooses is removable by the owner's safety key alone, and every protection others hold over a party needs that party's signature to change; a rule that rests on a fact nobody can check becomes an act someone signs, a conformance rule, or nothing.

**Options with a default.** Where the core offers the owner several options, one of them is the default when none is selected; the default is always one of the declared options, never a third, weaker rule.

**Nothing in MOR is updated.** Acts, agreements, specifications and the core itself are only published or signed again.

**Evolutionary model.** The core is an ossified layer. Above it, MOR continuously sub-forks through the cMIPs and Modules people adopt, and the market cuts branches over time. Costs that fall only on rare cases are acceptable: MOR expects markets to appear where there is value to protect.

**Layers and granularity.** Wherever a choice can be left to the owner (how many homes, which home rule, auditors or not, public or private, a vault or not, anchoring or not), the core offers it and states the consequences, rather than choosing for everyone.

## Common conventions

- **Encoding:** deterministic CBOR (RFC 8949, section 4.2.1); formats written in CDDL. Unknown fields make an act invalid, and so does a data item nested more than 128 levels deep.
- **Hashes:** SHA-256, with tagged hashes in the style of BIP-340, so hashes of different kinds of object can never be confused. Every tag begins with `MOR/`; a successor protocol must use a different prefix.
- **Signatures:** a scheme is a founding number or the hash of a signature-scheme specification. The founding schemes are schnorr over secp256k1 (BIP-340) for everyday keys and SLH-DSA (FIPS 205), a hash-based post-quantum scheme, for safety keys. A client that meets a scheme it does not implement treats the act as unknown. *New schemes, including a post-quantum everyday scheme, are added by publishing a specification, never by reopening the core.*
- **Encryption:** XChaCha20-Poly1305 for content, with a new key per object; hybrid X25519 plus ML-KEM-768 (FIPS 203) for identities' encryption keys.
- **No clock.** Timestamps are hints, never load-bearing. Every "before" is judged inside one named chain, by reference to a specific act. Agreements that need real time name a time reference, such as a block height.
- **Canonical text** (Text MIP) in every text field.
- **One signer per act.** Anything that needs two identities is two acts, the second naming the first.
- **An act counts only where it is held.** A receipt, an acknowledgement or a keeper record counts only alongside the valid act it names; nothing forces propagation, and delivery is the signer's interest.

## MIP: Identity

**The identity.** An identity is the hash of its genesis act. It never changes. Keys are only the pens that sign for it:

- a **signing key** for everyday acts;
- a **safety key**, post-quantum, kept offline, committed in advance by its hash and used exactly once, to sign a rotation;
- an **encryption key**, published so others can deliver content to it (defined in Envelope).

There is no third key: the safety key is the recovery key.

**Genesis** declares the first signing key, the commitment to the first safety key, the homes, optionally a home rule and an audit requirement, and a declarations slot for high-risk settings that higher MIPs define, such as Finance's vault. Only the safety key can change what genesis declares; a declaration can be removed by a null entry.

**Identity chain and sequences.** The identity chain holds only key events: genesis and rotations. Everyday acts form sequences, lines the owner keeps, one or several (for example one per device), each act naming the previous one. Every everyday act carries its position and a running summary of its sequence, so it can be proven cheaply to lie on the line leading to a later act.

**Homes.** A home is a relay that focuses on identity, run by an operator: an ordinary identity that signs everything the home states. A home stores identity chains and serves them, with the identity's routes (where its content lives, and where others deliver to it), names and public links. Homes are declared by operator identity plus address, so a home can move servers without anyone rotating, and they are counted per operator: several homes run by one operator count as one, under honest labelling. An identity may host its own home: a self-hosted identity is trusted on its own signatures, its rotation counts with no receipt, and a thief holding its safety key wins at once; that is a trust model chosen knowingly, and other homes declared beside it are backups by default.

**Receipts.** For every identity-chain act it accepts, a home signs a receipt: which act, at which position, at which point in the home's own log (a counter, never a time), and that it was the first it accepted there. A receipt counts only alongside the act it names, held by the verifier and valid: a receipt of nothing is neither support nor conflict. *Receipts are proof, not permission: they make a home answerable, since two receipts for two genuine rotations at one position prove it dishonest, and a stolen operator key alone can produce nothing that changes any identity's chain.* A receipt under a log summary that other operators have cosigned can never be erased by the operator's own rotation.

**Rotation.** The owner signs a rotation offline with the safety key and delivers the exact same bytes to every home. It reveals the committed safety key, binds a new signing key (of any scheme the owner chooses), commits the next safety key, names the latest genuine act of each sequence it keeps, with its position and running summary, so anyone can check kept history without opening private acts, and may disown acts, change homes, rules, declarations, declare a succession, or, for a home operator, declare the home closed. The protocol does not restrict why an owner rotates; rotation is expected to be rare. A home checks a rotation before storing it and never drops one it accepted; a home may apply its own acceptance conditions, such as proof from a registered device, which is a market service, and which can refuse the owner as well as a thief: losing that device at a single or authoritative home can mean losing the identity, so clients never choose such a policy by default and require a backed-up signing seed first.

**What a rotation keeps.** Acts in the kept ancestry stay valid, however old. Acts outside it, or disowned inside it, are void, unless another identity acknowledged them or a named keeper recorded them before recording the rotation, in which case they are visible disputes. Disowning costs the owner nothing else: the genuine acts after a thief's act stay valid. Every conforming verifier computes the same answer, and only these rules make an act disputed.

**Several homes and home rules.** With several homes, the owner may declare one authoritative home (the others are backups) or a threshold greater than half the operators (a safety network). If they declare neither, the majority rule applies by default, or, beside a self-hosted home, that home is authoritative. A single home stays possible at genesis. Competing rotations revealing the same safety key: the first one each home holds wins there, and the home rule decides between homes. *A stolen safety key is like a stolen bitcoin key, unless the owner chose homes that guard against it.*

**Audits.** Homes may audit each other: a home publishes signed summaries of its whole log, other operators check that each extends the last and cosign it. An identity may require audited receipts, declaring its auditors; a rotation's receipts are judged under the requirement that rotation declares, so an owner can always drop auditors who have gone. Conflicting receipts make an identity contested at that point, never frozen; the conflict ends when the home rotates or an audit shows which receipt is real; a home proven dishonest at a position counts for nothing after it and keeps counting before it. Two summaries that do not extend each other stop the auditing, and carry no verdict on past receipts.

**The way out.** If its homes are gone, an owner can leave with a homeless rotation, signed with the current safety key and naming new homes. A live old home voids it with an objection naming it, which proves the home was alive after the rotation was made; a home closes by a rotation of its operator, so a stolen everyday key can never close one; declared auditors can attest that a home no longer answers. A homeless rotation becomes final once the owner's next rotation counts, which every Identity client can check; until then a late objection can overturn it. A rotation that the old homes held at the same position beats it always, final or not, however late its receipts surface: finality never lets a used safety key found years later replace the rotations made since. One accepted only on a client's own failed attempt to reach the home is shown as re-homed without audit, keepers, vault payments and agreements must not rely on it, and the next rotation never makes it final: an objection from an old home voids it whenever it surfaces, with every rotation built on it, unless the owner endorses it with the current signing key. *A thief holding the safety key controls the next rotation, and a censor can keep the objection from arriving; neither can make a theft final.* A homeless rotation also endorsed with the current signing key cannot be blocked by objections, even after a home refused a normal rotation: an owner holding both keys can leave any home. An owner who loses the safety key can never rotate or leave; back up both seeds. *Keep your keys separate.*

**Reaching an identity.** Routes are of two kinds: outbox, where an identity's content of a type is found, and inbox, where others deliver acts addressed to it. An identity may declare no inbox. Any two identities can find each other without already sharing a relay: identity, home, routes. Whether a relay accepts deliveries, from whom and at what price, is the relay market's business.

**Links.** A link is a two-way statement that two identities belong to the same entity; one side may be an account on another protocol. Its purpose is signing in with MOR and building bridges. It needs a claim by one side and a confirmation by the other; either side can end it; an unconfirmed claim is never displayed; it confers no authority. Private links are stored encrypted.

**Succession** is declared in a rotation, naming a successor identity in MOR or another protocol.

**Tasks:** identity proofs and credentials; naming; outside link proofs.

## MIP: Text

- **Text is the only native media,** because the protocol itself speaks in text: terms, agreements, grants, names, messages.
- **Canonical text:** valid UTF-8; LF line breaks only; no control characters other than LF (no TAB); no byte order mark anywhere; no noncharacters; no trailing spaces and no final line break; NFC, checked with the tables of one pinned Unicode version (the latest at freeze), so every verifier agrees and new characters stay usable.
- **Text is universal:** every client can open and show any text act addressed to it, as plain text. A text act may name a format cMIP; a client without it still shows the plain words, and a format may hide its own markup, never letters or digits, never add text, and shows the rest in the order of the bytes, never hiding it by styling.
- **What you sign is what you saw:** before signing, the plain text is always available, and it is the default for agreements, terms and grants; before signing terms, a grant or a clone, bidirectional controls are shown visibly, so no clause can display in an order different from its bytes. Lookalike and invisible characters are otherwise client warnings, not rules.
- **Task:** text format.

## MIP: Envelope

- **Every act has an outside and a locked inside.** The outside carries only what a relay needs: the signer (or nothing, inside a sealed container), a commitment to the inside, the lock's details, the content key if the act is public, and recipients if it is addressed. Everything else, including type, pointers and payload, is locked. The inside carries a random salt, so short private replies cannot be guessed from their hash, and the outside commits to the unlocked inside, so one signature can never open to two contents.
- **Everything encrypted by default.** Public means the key travels with the act; private means the key reaches chosen recipients inside a sealed container, locked to their encryption key or to a bare key they supplied, with the act itself or in a key delivery. Going public later is one act: publishing the key. *Relays cannot read private content at all; public acts carry their key, so anyone can read them. A private message is not a special kind that stands out, though an addressed act shows its recipient.* Identity acts are always public: they are an identity's public face. A thief holding the signing key can redirect the encryption key, or the inbox, until the owner rotates; deliveries made into that window are re-sent afterwards, and a seller who delivered into it did nothing wrong.
- **Public receiver, private sender.** A sealed container shows its recipients, never its sender: it is signed by a one-time key, and only the recipients open the act inside and see who signed it.
- **Types and specifications.** Every act names the specification defining its type by hash, and a type number within it.
- **Chains and forks.** Acts on one object name, for each chain they belong to, that chain and the act they follow in it, so a merge of two branches is never confused with one act touching two objects; each MIP defines its own objects' chain rules. Two acts naming the same predecessor are a fork, provable from signatures. The running summary's empty value and its construction are fixed, with a test vector.
- **Acknowledgements and references.** An acknowledgement says "I received this act", and counts only alongside the act it names; a reference says "look at this", pointing to an act or a web resource, optionally with the hash of what was there. A repost is a reference: it pays nobody by itself.
- **How acts reach people.** An act counts for a verifier only once the verifier holds it. Identity acts must reach the home; acts that concern a counterparty should reach that counterparty's inbox; publications are pulled from outbox routes; drafts never leave.
- **Media.** The work hash fingerprints a work's complete plaintext, and is what ownership points to. Media is always stored locked, its locked bytes fingerprinted so relays can check storage; buyers check unlocked media against the work hash. A publication may say whom it is made for; payment goes to that identity's pointer, else the signer's, and a false "for" can only send money to the identity it names. Segmentation and streaming belong to the media cMIP; a live stream has no work hash until it ends, so paid live access is sold by a standing offer.
- **Relays** publish, fetch and mirror, untrusted by default, operated by identities, and may publish signed commitments to the set of acts they hold.
- **Withdrawal** marks a publication as no longer offered; it is signed by the publication's signer or by the identity it was made for; past deals stand; a payment racing it is owed back.
- **Fail closed, scoped.** A client never signs, pays or accepts under a specification it does not implement; it shows such acts as unknown, and may adopt the specification by opt-in.
- **Task:** media interpretation.

## MIP: Finance

Finance defines how a simple payment moves: never the rails, and nothing about who owns what. Its job ends when money reaches a payee pointer.

- **Settlement receipt.** Every rail module, whether Lightning, stablecoin or fiat, emits the same receipt: who paid whom, how much, in what unit, under which agreement. Only the rail's proof differs, checked by the module's published rule. Card and bank rails name the trusted party their proof rests on.
- **Double entry.** A receipt is signed by whoever received on that hop. A payer's claim, carrying the rail's proof, is evidence on equal footing: private by default, published by the payer's choice. Where the two disagree, the disagreement is shown on the receiver and the greater amount counts until the receiver signs a receipt matching the proof. *Hiding income requires the payer's silence or collusion; that is the measured promise.* One rail proof discharges one payment, or one named batch.
- **Routes across rails.** When payer and payee use different rails, conversion services carry the money in hops; each receipt names the previous one and the agreement it fulfils, so the route reads as one chain. If it breaks, the receipts name exactly which hop and which agreement failed, and Law takes over.
- **Obligations and discharge.** An obligation is signed by the debtor and says who owes whom, how much, in what unit; a creditor's statement is a claim, never an obligation. It is discharged when valid routes bring the amount to the creditor's payee pointer. An undeliverable payment stays an open obligation; a refund owed to an anonymous payer is claimable by whoever presents the rail proof.
- **Units** are small specifications of their own, so one unit has one name on every rail.
- **Only identities have payee pointers,** each signed with that identity's own key; collectives sign their own. A publication carries a price, and payment goes to the pointer of the identity it is made for, else its signer's.
- **Flow and vault.** Payee pointers form a versioned chain. An identity's **flow pointer** changes with the signing key. Its **vault** changes only with the safety key: a set of entries, per unit and per rail, each with a source the rail derives fresh addresses from and a limit; payments above the limit go to the vault; a limit of zero means everything in that unit goes to the vault; a unit the vault does not cover cannot be paid to the flow. *The vault is the grammar for setting up safer pointers, if the owner wishes to. A true rate limit needs a clock and a global view, which the core has not; the two ends of the range are given, and the middle is a market for custodial flow services.* An obligation names the flow pointer in force when it arose; a thief who changes the flow pointer cannot collect older obligations, nor re-issue them.
- **Good faith.** A payment that followed the published pointer and vault counts as made, even if a later rotation invalidates it. The loss from a theft window falls on the owner, never on a payer who followed the rules.
- **Receivers and senders.** A receiver's identity is public; the visibility of its incoming flows is its choice, counterparties only by default. The core never requires a sender's identity.
- **A plain tip carries no module fees** beyond the rail's own. A referral counts as evidence only when the payer signs it.
- **Tasks:** payment, per rail; conversion.

## MIP: Law

- **Agreements are terms plus signatures,** one signature act per party. They commit identities, not keys, and carry the hash of at most one cMIP per task, plus any extensions. A party is bound only through its own signature; a threshold rule decides when an agreement exists, never who owes. Before signing, clients show the plain text, with bidirectional controls visible, and what any rule computes.
- **Keepers** are named by the agreement and record the acts around a deal as they arrive, in their operator's sequence. They are always sealed: they notarise act ids and signers, never content. A record made before the keeper's record of a rotation keeps an act visible as a dispute, and counts only alongside the act it names. Records survive in every copy. Third parties that must judge content are arbitrators or verifiers, given keys by ordinary key delivery. *A keeper that delays recording a rotation is trusted not to; choose keepers as carefully as homes.*
- **Stakes** in works and publications are written in millionths, summing to exactly 1,000,000; leftovers go to the first party listed. Any act that changes a stake needs its holder's signature; transfers are signed by seller and buyer and name both the work's and the agreement's chain; other holders are notified. Shares in a split plan refer to stakes, and the transfer chain names the current holder.
- **Work claims.** A work is bound to its creators only by an explicit work claim. A publication is a neutral carrier: carrying, quoting or linking claims nothing. The core records claims and their order, never legitimacy; order is not evidence of authorship; conflicts are decided only where claims meet, by anchoring or a keeper that recorded both. *A sale is tied to the seller's agreement, not to the work's stakes: the core cannot tie a sale to stakes without judging which claim is the claim. It makes a sale outside the claiming agreement visible, and gives builders the pieces to refuse or rate such sales.*
- **Splits.** The payee pointer of the identity publications are made for usually points to a split service, named by grant. For every incoming receipt or payer's claim it publishes a split, summing exactly, with evidence for every role share signed by someone other than the service and the payee, and pays each payout as a simple Finance payment, deducting no more than the plan's maximum fee. It cannot pay outside the plan or change it; unmatched receipts and unpaid payouts are its open obligations. A fee is one total with an agreed split, consented by whoever bears it; an omitted fee is visible. Amounts too small to send are held until they can be moved. *No cMIP or module can force a fee; developers earn through services, maintained originals, bounties and shares clients choose to pass on.*
- **Offers, conditions and time.** A standing offer is accepted by payment; the deal is complete when the key is delivered or, for a publication whose key is public, a delivery is confirmed; otherwise a refund is owed, claimable by proof if the payer was anonymous. Deadlines are judged on the agreement's named time reference; showing that something did not happen in time needs an anchor or a keeper, otherwise the answer is undetermined.
- **Collectives** are full identities with their own keys, held under their founding agreement's key grammar: one holder, a threshold of members, or a custodian. The safety key can be split into shares. Every grammar leaves a way to rotate that needs less than every member: a threshold below the member count, or a named recovery path; the rule is about the exit, not the number. Members change by rotation plus a clone of the founding agreement.
- **Succession.** A party may attach a succession plan to an agreement: stake successors and seat successors, each divisible, possibly different people. It triggers by the party's own act or by the abandonment authority's declaration, and executes as a clone. *The core gives the language; death is left to the parties and their named authorities.*
- **Grants** delegate authority with limits, revocable; acts under a grant sit in its branch, and a publication under one names the grantor as the identity it is made for; revoking seals the branch, never before a deal the grantor acknowledged or paid on; the collective imports or hands over what it accepts, and counterparties require import before performing.
- **Clone, never modify.** A clone is a draft until its rule is met, then closes its parent. A clone never reduces a stake without its holder's signature, and never changes, for a party who did not sign it, a clause that could move that party's stake or voice: the abandonment clause, the succession plan, the fork rule, the keepers, the split service, the time reference. Activity on a fading cMIP moves by cloning.
- **Abandonment** is decided only by the authority the clause names, always an identity, judged against the time reference, with outcomes the clause allows and under the clause version the party signed; liveness acts prevent it; a contest objects to it.
- **Non-performance.** *The core never enforces; it makes default impossible to hide.* Negotiation records are provably complete up to the last acknowledgement, and either party may disclose them by publishing their keys. Only parties, affected holders and named keepers, arbitrators or verifiers have standing to contest, and a contest changes nothing about any act's validity: it is shown alongside what it names.
- **Tasks:** split; condition evaluation; time reference; anchoring; grant limits; work claims.

## MIP: Production

- **Specifications are named by the hash of their content,** wherever they are published. cMIPs and Modules name their creator inside, so names cannot collide or be stolen; a creator named by a specification it never published is shown as unclaimed. MIPs have no creator: they are the protocol itself. Signature schemes and units are specifications too.
- **Frozen at publication.** A changed specification is a new one, which may name its predecessor for migration; a successor by a different creator is shown as such.
- **Tasks are the contract** between the core and the community, each with one global number: for each, the defining MIP states what a cMIP accepts and produces. **Extensions** cover what no task foresaw, adding rules and never relaxing the core's.
- **Verification rules** that anyone must be able to run are programs for one frozen machine, RV32IM, with fixed memory, an exact step budget stated in the specification, a fixed input and output encoding, and no clocks, networks or randomness; a rule over budget, or outside the profile, answers unknown everywhere. A binary rule is carried as a locked object the specification names. The rule decides validity; the text explains it; a mismatch is a bug, fixed only by a new specification.
- **Adoption by opt-in; no registry.** Discovery happens through use. Below the MIPs the one trust root is the six MIP hashes, published together with their texts in the genesis repository; a fork presenting six others is a different protocol, and a successor must change the `MOR/` tag prefix.
- **Earning through signed terms.** Creators earn through standing fee offers and role shares evidenced by signed records; nothing is taken from a payment without a signature.

*Zero democracy on the MIPs; a free market on cMIPs and Modules, where adoption decides.*

## MOR 2

*A core frozen forever also freezes its cryptography, so a successor protocol is certain in the long run.* MOR is built to be a good ancestor:

- the post-quantum safety key keeps identities continuous through a break of elliptic-curve signatures, and everyday keys migrate to a post-quantum scheme by adoption, before a break, since afterwards everything signed with the old scheme can be forged and only owners holding both keys still leave;
- succession declared in a rotation, and two-way links, let identities move and be confirmed from both sides;
- agreements are always in core format, so they can be cloned across;
- anchoring before a break keeps history trustworthy, at each party's choice: the safety key secures the exit, not what is left behind;
- extensions in wide use show MOR 2 which tasks it needs;
- a successor changes the tag prefix, so nothing replays across the two.

## Outside the core

| Concern | Handled by |
| --- | --- |
| Media formats, codecs, players | Media modules |
| Payment rails, units, vault address derivation | Payment modules and unit specifications |
| Rate limits on the flow | Custodial flow services |
| Split models, remainder rules | Split cMIPs and split services |
| Complex conditions | Condition modules |
| Proofs, credentials, time sources, anchoring | Verifying modules |
| Key storage, backup, recovery, air-gapped signing, verifiable share dealing | Identity modules |
| New signature schemes | Signature-scheme specifications |
| Readable naming schemes | Naming modules and homes |
| Subscriptions, group keys, rights management | Access modules |
| Discovery and indexing | Clients and indexers |
| Theft alerts, delayed release, insurance | Protection services |
| Home acceptance policies and audits | Home operators |
| Inbox acceptance, spam, metadata privacy, gossip | Relay operators and cMIPs |
| Sign-in flows and bridges | Sign-in cMIPs and bridge Modules |
| Stakes paid on every sale of a work | Client rules and reputation services built on claims, contests and splits |
| Real-time calls, enforced ephemeral messaging | Other protocols, bound to MOR identities |
| Relay behaviour and storage policy | Relay market |

*What is lost is shared meaning by default: a client without a module cannot interpret that deal. It can still verify signatures, that stakes sum to 1,000,000, and that value balances.*

## Open before freeze

- [ ] Exact formats for every act in Finance, Law and Production (the Identity, Envelope and Text drafts already have them).
- [ ] Technical review of the RV32IM verification profile and its test vectors, the running-summary test vector, the signature-scheme specification format, and the pinned Unicode version.
- [ ] Human adversarial review (round 3).
- [ ] Completeness, per the freeze test suite.

## Glossary

| Term | Meaning |
| --- | --- |
| Acknowledgement | An act naming another identity's act as received; counts only alongside that act. |
| Act | Any signed object: an outside, a locked inside, and a signature. |
| Agreement | Terms plus the signatures its rules require, binding those who signed. |
| Audit | A home's log summary checked and cosigned by another operator. |
| Chain | The acts on one object, each naming the chain and the act it follows. |
| Client | Software that implements Identity, Envelope and Text, plus any other MIPs it chooses. |
| cMIP | A community specification for one task, or an extension. Frozen at publication. |
| Closure | A declaration in a rotation that the signer's home stops serving. |
| Collective | An identity whose keys are held by its members under its founding agreement's key grammar. |
| Contest | A signed objection to an act, by someone with standing; changes nothing. |
| Disputed | The status of an act a rotation voided but someone relied on; set only by rotation rules. |
| Encryption key | The public key an identity publishes to receive private content. |
| Extension | A cMIP named by an agreement outside the listed tasks; it adds rules, never relaxes the core's. |
| Grant | A delegation of authority, with limits, revocable. |
| Home | A relay focused on identity, run by an operator, storing identity chains and signing receipts. |
| Homeless rotation | A rotation that leaves homes that are gone, voided by a live home's objection unless endorsed with both keys; final once the next rotation counts, except one accepted only on a client's own failed attempt to reach the home. |
| Identity | The hash of a genesis act. |
| Inbox | A route where others deliver acts addressed to an identity. |
| Keeper | A sealed notary named by an agreement, recording act ids and signers as they arrive. |
| Link | A two-way statement, claim plus confirmation, that two identities belong to the same entity. |
| MIP | A core specification. Frozen forever. Has no creator. |
| Module | An implementation or extension under a MIP or cMIP, named by hash, frozen at publication. |
| Operator | The identity that runs a relay and signs what it states. |
| Payee pointer | Where payment to an identity goes: a flow pointer, and a vault of safer entries. Publications pay the identity they are made for. |
| Payment claim | A payer's record of a payment, with the rail's proof; equal evidence to a receipt. |
| Protected clause | A clause a clone cannot change for a party who did not sign it. |
| Receipt (home) | A home's signed statement of which identity-chain act it holds; counts only alongside that act. |
| Route | Where an identity's content of a given type can be found (outbox), or where others deliver to it (inbox). |
| Safety key | A post-quantum key, committed in advance, used once to sign a rotation. |
| Self-hosted | An identity that is its own home, trusted on its own signatures. |
| Sequence | A line of an identity's everyday acts. |
| Settlement receipt | The common proof of one payment hop, signed by the receiver. |
| Split service | An identity named by grant to divide incoming payments for a work's owners and pay them out. |
| Stake | A share in a work or publication, in millionths, held by whoever the transfer chain names. |
| Succession plan | Part of an agreement naming a party's stake successors and seat successors. |
| Task | A point where a MIP hands work to a cMIP. |
| Vault | An identity's safety-key-protected set of receiving entries, per unit and per rail, with limits. |
| Work | A piece of media identified by its work hash, bound to its creators by an explicit work claim. |
| Work hash | The fingerprint of a work's complete plaintext. |

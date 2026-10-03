# MOR Core

*Version 21, 3 October 2026 (the core pass). **Not yet approved.** Version 20 with everything decided since written in: the sixteen wording changes the Lightning rail listed (roadmap step 12: rails are rail Modules under one payment cMIP, and a specification signs nothing, F112); a like is never an acknowledgement, only Identity, Finance and Law act types carrying one, with a witness act for deliberate reliance (F110); the owner hears of payments the vault refuses (F111); an anonymous payer's refund goes to a key it committed (F113); several vault entries for one unit take the smallest limit (F114); the payee chooses the rails it accepts (F115); evidence of a Module's use comes from a party (F116); a publication's size is its unlocked media's (F108); the specialized fork, in the evolutionary model; a negotiation message is a Law act carrying text (F118); a receipt naming a rail Module the payee published is evidence of that Module's use, even when a split service signs it (F119); and, revised in place the same day, a version changing a judge and the constitution needs the constitutional change rule alone (F120), the judicial tier changes only with every member's signature, one version for everyone, a chain of judgment takes over from a judge that answers "unknown" or cannot act, a departed member keeps a stake and nothing else, the owners' payee pointer counts for Law only if it names their split service, and a collective may fork, closing the original (F121), with two flaws and the fork's open questions left for decision. The Law section is rewritten for plain reading, without changing any rule, and its rules are grouped under headings; the seven rules the first plain rewrite could not state plainly are restated, each checked against Law draft 10 (`docs/law-draft-10.md`), and "Areas and lanes: who decides what" is written for a careful non-specialist. The core names no particular use of MOR. It names Identity draft 11, Text draft 6, Envelope draft 7, Finance draft 6, Law draft 10 and Production draft 6, which hold the exact formats and rules; this document is the map, and must stand on its own. The history of earlier versions is at the end.*

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

**Evolutionary model.** The core is an ossified layer. Above it, MOR continuously sub-forks through the cMIPs and Modules people adopt. The market cuts some branches over time, but it is not a contest one fork wins: some branches are meant to stay specialized. A **specialized fork** is a branch above the frozen core, a set of cMIPs and Modules made for one domain, speaking the same core language and meant to stay in that domain. Each specialized fork talks to other forks to the degree it chooses; Identity and Text always apply across all of them, so an identity is the same identity, and a text can always be read, on every fork. Costs that fall only on rare cases are acceptable: MOR expects markets to appear where there is value to protect.

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
- **A like is never an acknowledgement** (F110). Only act types the Identity, Finance and Law MIPs define may carry acknowledgements; any other act carrying one is invalid. *An acknowledgement carries weight (it can keep a thief's act alive as a dispute), so nothing as light as a like or a reply may carry it by accident.*

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

**What a rotation keeps.** Acts in the kept ancestry stay valid, however old. Acts outside it, or disowned inside it, are void, unless another identity acknowledged them (by an Identity, Finance or Law act) or a named keeper recorded them before recording the rotation, in which case they are visible disputes. Disowning costs the owner nothing else: the genuine acts after a thief's act stay valid. Every conforming verifier computes the same answer, and only these rules make an act disputed.

**The witness act** (F110). To rely on someone's post or message deliberately (a public promise, a threat kept as evidence, a statement someone relies on), an identity signs a witness act: an Identity act whose only content is "I received this act and rely on it", naming the act in its acknowledgements. It keeps that act visible as disputed even if its author later disowns it. Like every Identity act it is public: it shows whom the signer relies on, never what was said. *Client conformance:* a client never signs one as a side effect of another gesture, and says what it does before signing.

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
- **Acknowledgements and references.** An acknowledgement says "I received this act", and counts only alongside the act it names. Only act types the Identity, Finance and Law MIPs define may carry one: a text act, a publication or any cMIP's or Module's act that carries one is invalid (F110). The rule limits which acts acknowledge, never which acts can be acknowledged: a post still becomes a dispute, not void, when a witness act, a buyer's claim or a signature acknowledges it. A reference says "look at this", pointing to an act or a web resource, optionally with the hash of what was there. A repost is a reference: it pays nobody by itself.
- **How acts reach people.** An act counts for a verifier only once the verifier holds it. Identity acts must reach the home; acts that concern a counterparty should reach that counterparty's inbox; publications are pulled from outbox routes; drafts never leave.
- **Media.** The work hash fingerprints a work's complete plaintext, and is what ownership points to. Media is always stored locked, its locked bytes fingerprinted so relays can check storage; a publication states the size of the media once unlocked (F108); buyers check unlocked media against the work hash. A publication may say whom it is made for; payment goes to that identity's pointer, else the signer's, and a false "for" can only send money to the identity it names. Segmentation and streaming belong to the media cMIP; a live stream has no work hash until it ends, so paid live access is sold by a standing offer.
- **Relays** publish, fetch and mirror, untrusted by default, operated by identities, and may publish signed commitments to the set of acts they hold.
- **Withdrawal** marks a publication as no longer offered; it is signed by the publication's signer or by the identity it was made for; past deals stand; a payment racing it is owed back.
- **Fail closed, scoped.** A client never signs, pays or accepts under a specification it does not implement; it shows such acts as unknown, and may adopt the specification by opt-in.
- **Task:** media interpretation.

## MIP: Finance

Finance defines how a simple payment moves: never the rails, and nothing about who owns what. Its job ends when money reaches a payee pointer.

- **Settlement receipt.** Whatever the rail, Lightning, stablecoin or fiat, the receiver signs the same receipt: who paid whom, how much, in what unit, under which agreement. Only the rail's proof differs, checked by the rule of the rail Module it names. Card and bank rails name the trusted party their proof rests on.
- **Rails are Modules; a text signs nothing.** An agreement names one payment cMIP; each rail is a rail Module beneath it. Receipts are signed by receivers and claims by payers; no specification signs anything.
- **The payee chooses its rails** (F115). The agreement names the payment cMIP; the payee's own pointer or vault names the rail Modules it accepts. A receipt or claim counts only on one of those, and, under an agreement, only on one implementing that agreement's payment cMIP. *A payer cannot pay on a rail the payee does not accept, except through a conversion service that pays the payee on a rail it does. A new rail needs a new pointer or vault, never a new agreement; in a collective, whoever holds the Finance lane chooses the rails.*
- **Double entry.** A receipt is signed by whoever received on that hop. A payer's claim, carrying the rail's proof, is evidence on equal footing: private by default, published by the payer's choice. Where the two disagree, the disagreement is shown on the receiver and the greater amount counts until the receiver signs a receipt matching the proof. *Hiding income requires the payer's silence or collusion; that is the measured promise.* One rail proof discharges one payment, or one named batch.
- **Routes across rails.** When payer and payee use different rails, conversion services, identities paid under their own offers, carry the money in hops; each receipt names the previous one and the agreement it fulfils, so the route reads as one chain. If it breaks, the receipts name exactly which hop and which agreement failed, and Law takes over.
- **Obligations and discharge.** An obligation is signed by the debtor and says who owes whom, how much, in what unit; a creditor's statement is a claim, never an obligation. It is discharged when valid routes bring the amount to the creditor's payee pointer. An undeliverable payment stays an open obligation.
- **Anonymous refunds go to a key, not to a proof** (F113). A payer who stays unnamed may put a one-time key of its own into the payment commitment; a refund owed on that payment goes to whoever signs with that key. *Showing the rail's proof proves nothing about who paid: on Lightning the payee and every node on the route learn it. A payment that committed no key can be refunded to nobody, and nobody else can take its refund.*
- **Units** are small specifications of their own, so one unit has one name on every rail.
- **Only identities have payee pointers,** each signed with that identity's own key; collectives sign their own. A publication carries a price, and payment goes to the pointer of the identity it is made for, else its signer's.
- **Flow and vault.** Payee pointers form a versioned chain. An identity's **flow pointer** changes with the signing key. Its **vault** changes only with the safety key: a set of entries, per unit and per rail, each with a source under which its rail Module obtains a fresh address for every payment, and a limit; payments above the limit go to the vault; a limit of zero means everything in that unit goes to the vault; a unit the vault does not cover cannot be paid to the flow. Where several entries cover one unit, the smallest of their limits applies (F114). *The vault is the grammar for setting up safer pointers, if the owner wishes to. A true rate limit needs a clock and a global view, which the core has not; the two ends of the range are given, and the middle is a market for custodial flow services.* An obligation names the flow pointer in force when it arose; a thief who changes the flow pointer cannot collect older obligations, nor re-issue them.
- **The owner hears of what the vault refuses** (F111). A payment the vault leaves undeliverable leaves no act behind, so the clients tell the owner instead: the owner's client warns before pricing in a unit the vault does not cover and shows such debts as owed in a unit the vault cannot receive; a payer's wallet that refuses sends the payee an ordinary inbox message saying what it tried to pay and why. *Client conformance: whether a notice arrived can never be checked.* The debt stays open, and is paid once the unit is added.
- **Good faith.** A payment that followed the published pointer and vault counts as made, even if a later rotation invalidates it. The loss from a theft window falls on the owner, never on a payer who followed the rules.
- **Receivers and senders.** A receiver's identity is public; the visibility of its incoming flows is its choice, counterparties only by default. The core never requires a sender's identity.
- **A plain tip carries no module fees** beyond the rail's own. A referral counts as evidence only when the payer signs it.
- **Tasks:** payment, one payment cMIP per agreement with a rail Module for each rail beneath it; conversion. Receipts are signed by receivers and claims by payers; no specification signs.

## MIP: Law

*Law says who has agreed to what, who owns what, and who may act for whom. Finance moves a payment to a payee pointer; Law says how it is shared, what is owed when something is not done, and how a group of people acts as one identity. This section is the map; the Law MIP holds the exact rules. Read it in order: agreements and deals first, then the pieces around them (keepers, stakes, works, splits, offers), then collectives, which carry most of the rules.*

### Agreements and deals

- **An agreement is terms plus signatures:** the terms, and one signature act from each party. An agreement binds identities, not keys, so it survives a party's key rotation. Its terms carry the hash of at most one cMIP for each task (so the exact version is fixed), plus any extensions.
- **Only your own signature binds you.** A rule in the terms decides when the agreement, or a clone of it, comes into force; no rule ever decides that someone owes something they did not sign.
- **Everyone signs the founding terms.** Founding terms exist only once every party has signed them, and nobody is added to a collective without signing.
- **A deal** is an agreement that founds no collective. It changes only with every party's signature. Majorities, areas and tiers belong to collectives, never to deals.
- **A judge never handles what it judges.** A specification named for condition evaluation, time reference or anchoring (the judicial tasks) serves no other task and is not an extension, in a deal as in a collective.
- **What you sign is what you saw.** Before signing, clients show the plain text, with bidirectional controls visible (invisible characters that can reorder how text displays), and what any rule computes.
- **Clone, never modify.** An agreement is never edited. A change is a clone: a new version naming the old one as its parent.
  - A clone states which rules its changes require and whose signatures meet them; this statement is its mark, and a false mark makes the clone invalid.
  - A clone touching several areas needs each area's rule, and comes into force all at once.
  - It is a draft until those signatures are in; then it closes its parent.
  - A clone never reduces a stake without its holder's signature. A deal's clone needs every party.
  - In a collective, the clauses that could move a member's stake or voice or decide a dispute change only with every member's signature, and there is one version of them for everyone: the abandonment clause, the succession plans, the fork rule, the keepers, the split service, the time reference, the arbitrators or verifiers, the condition and anchoring cMIPs, and the chain of judgment. These are the protected clauses. *A member who will not sign holds the change back; that standoff is settled by talking, or by a fork of the collective.*
  - Activity on a fading cMIP moves to another by cloning.

### Keepers, stakes and works

- **Keepers** are notaries the agreement names. Each records the acts around a deal as they arrive, in its operator's own sequence. Keepers are always sealed: they notarise act ids and signers, never content.
  - A keeper's record made before its record of a rotation keeps the recorded act visible as a dispute after that rotation. A record counts only alongside the act it names.
  - A keeper's records hold in every copy of them, so a keeper that disappears loses nothing it had recorded.
  - Third parties who must judge content are arbitrators or verifiers, given keys by ordinary key delivery.
  - *A keeper that delays recording a rotation is trusted not to; choose keepers as carefully as homes.*
- **Stakes** in works and publications are written in millionths and sum to exactly 1,000,000; what is left over by rounding goes to the first party listed.
  - Any act that changes a stake needs its holder's signature.
  - A transfer is signed by the seller and the buyer, and names both the work's chain and the agreement's chain; the other holders are notified.
  - Shares in a split plan refer to stakes, and the transfer chain names whoever holds each stake now.
- **Work claims.** A work is bound to its creators only by an explicit work claim. A publication is a neutral carrier: carrying, quoting or linking a work claims nothing. The core records claims and their order, never who is right; order is not evidence of authorship. Conflicting claims are decided only where the claims meet: by anchoring, or by a keeper that recorded both. *A sale is tied to the seller's agreement, not to the work's stakes: the core cannot tie a sale to stakes without judging which claim is the claim. It makes a sale outside the claiming agreement visible, and gives builders the pieces to refuse or rate such sales.*

### Splits, offers and time

- **Splits.** The payee pointer of the identity a publication is made for usually points to a split service, named by a grant.
  - Where an agreement names a split service, that pointer counts, for Law, only if it names the service. Law clients check it before paying and show a pointer that bypasses the service as such. *Cost, stated: a wallet that reads only Finance cannot check it. Open (flaw P1): a pointer names rails, never an identity, so how "names the service" is checked is not yet settled.*
  - For every incoming receipt or payer's claim, the service publishes a split that sums exactly, with evidence for every role share signed by someone other than the service and the payee, and pays each payout as a simple Finance payment, deducting no more than the plan's maximum fee. *A role share is a share for a role filled at payment time, such as the reposter who led to the sale.*
  - A rail Module's role share is the one exception (F119): its evidence is the receipt or claim naming that rail Module, which counts even when the service itself signs it, provided the payee's own pointer or vault names that Module. *The service cannot invent a Module the payee never published. Cost, stated: where the payee's pointer names two rail Modules for one rail, whoever issues the invoice, here the service, chooses which of them earns; the pointer shows it publicly, and the payee's agreement with the service can constrain it.* The use of a service someone runs is evidenced by a record that identity signs; a Module signs nothing.
  - It cannot pay outside the plan or change the plan. Receipts it has not split and payouts it has not paid are its open obligations.
  - A fee is one total with an agreed split, consented by whoever bears it; a fee left out of a split is visible. Amounts too small to send are held until they can be moved.
  - *No cMIP or Module can force a fee; developers earn through services, maintained originals, bounties and shares clients choose to pass on.*
- **Offers.** A standing offer is accepted by payment. The deal is complete when the key is delivered or, for a publication whose key is already public, when a delivery is confirmed. Otherwise a refund is owed; for an anonymous payer, it is owed to whoever signs with the key the payment committed to (Finance).
- **Time.** Each agreement names one time reference, such as a block height, and its deadlines are judged on it. Showing that something did not happen in time needs an anchor or a keeper; without one, the answer is undetermined.
- **The chain of judgment.** For each judge it names (a condition, time reference or anchoring cMIP, a keeper, an arbitrator, the abandonment authority, the split service), an agreement may name in its terms the ones that take over, in order, when it answers "unknown" or cannot act. Everyone signs the chain with the terms, so a judge that fails is replaced with no new signature. *A client that does not know a judge's specification shows the question as unknown; that never passes it down the chain. Open: when a judge that is an identity "cannot act".*

### Collectives: an identity many people act for

*A collective is one identity, with its own keys, whose members act for it under a founding agreement. The rules below answer five questions in turn: who holds the keys; how members come and go; who may decide what; who decides when someone is gone; and, with no clock, what was done before or after a member left.*

**Words used below.**
- A **record** is the collective's everyday act that writes a complete clone of its agreement into its own sequence, naming the signature acts that complete it, and registers its members' departures and rotations.
- A **line** is an act of the collective (a record, or a rotation of the collective) at which a change in who may act for it takes effect. It names the latest act of every other sequence the collective keeps: those acts are its **tips**, and everything leading up to a tip is that tip's **ancestry**.
- To **place** an act is to give it a position in the collective's own sequence, so that it is before or after a line.
- An area is **frozen** when no holder is left; its **refit** is the change that gives it holders again.
- **Sealing** a grant closes its branch. **Importing** acts of a sealed branch is the collective accepting them into its own chain; **handing them over** assigns them to another grant's branch.

**Keys.**
- A collective is a full identity with its own keys, held under its founding agreement's key grammar: by one holder, by a threshold of members, or by a custodian. The safety key can be split into shares.
- Every key grammar leaves a way to rotate that needs fewer than every member: a threshold below the member count, or a named recovery path. *The rule is about the exit, not the number.*

**Members come and go.**
- Members change by a rotation of the collective plus a clone of its founding agreement.
- A rotation that declares no new agreement changes keys, not rules: the agreement in force carries forward, with the clones already recorded.
- A member can always leave alone, giving up their voice and keeping their stake. Removal, where a constitution allows it, takes the voice, never the stake.
- **Departed holders.** The collective's departed members entry records who left and their stake, nothing else. A departed holder has no control and no veto: the collective's current rules and judges apply to them. Their stake never shrinks without their signature, and is a share of all the collective's income. Every term applies equally to every stake, member or departed; unpaid shares stay open debts until the holder can receive.
- **The fork of a collective.** Where members split into sides that will not agree, the collective may fork: a final act closes it, and every side founds a new collective naming it as its parent, the side keeping the status quo with a copy of the original agreement minus those departing. Works made before the fork belong to every owner their claim lists; either side may sell them, each sale paying those owners, and neither side's sales are outside the claiming agreement. *Open: the fork act itself, the collective's debts, its grants, its keys, and a name that does not clash with the fork rule; until they are settled, no act declares such a fork.*
- Every complete clone is written on the collective's own record at once. Only clones that change the constitutional tier rotate the collective's keys.

**Three tiers of rules.** Deals have no tiers; a collective's rules fall in three:
- **Constitutional:** who decides (the parties, the change rules, the key grammar, the areas). It changes by the constitutional change rule, which is every party unless the founders agreed otherwise, so nobody loses their say without signing.
- **Judicial:** who judges and by what: the protected clauses. It changes only with every member's signature, one version for everyone; a version that also changes the constitution needs the constitutional change rule alone. *Open (flaw K1): where that rule is below every party, the two disagree; such a version is refused until it is settled.*
- **Operational:** everything else. It changes by the clone rule, or, where an area covers it, by that area's holders alone.
- Which tier and which area a clone touches is read from the fields it changes, never from what it says about itself.

**Areas and lanes: who decides what.** *In plain words: a collective can split up its work. Its founding agreement can say that some members run its payments and others its publications; each such share of the work is an area, and inside it only its holders decide.*
- **Areas.** The founding agreement may give some of the collective's acts, and some of its operational matters (its split plan, for instance), to an **area** held by some of its members, the area's **holders**, with a number of them who must agree. An area may cover a whole layer, every Finance act for instance, which makes it that layer's **lane**, or single act types. No two areas cover the same act or matter, save the acts of one specification named for tasks of two layers (below). Inside an area its holders alone decide: no other member, and no majority of members, can act there in their place; only a change to the constitution, under the constitutional change rule, can change what the area covers, who holds it, or anything in it, since that rule can change everything.
- **How an act in an area counts.** The collective signs the act with its own key, as it signs every act. Then each holder who agrees signs a short act of their own naming it, a signature act, which anyone holding both can check; the act counts once enough holders have signed to meet the area's number, each a holder who signed the agreement (or a version it descends from) and whose voice remains for that act. Those signatures are judged under the collective's agreement **in force for that act**: the version its identity chain declared at the chain act its signing key is bound to (a rotation declaring nothing new carries the earlier one forward, with the versions recorded under it); or, where the collective has put a newer version in force by a record since that declaration, and the act is not before that record in the collective's own sequence, that newer version, the one furthest along. A record itself is judged only by the records before it.
- **Choosing specifications.** For each task a MIP hands to a cMIP, the collective's agreement names the cMIP it uses: it **adopts** that cMIP.
  - A cMIP's acts belong to the layer of the task the collective adopted it for, and the holders of that layer's lane decide, alone, which cMIP to adopt; where no lane covers that layer, an area naming the task decides, else the clone rule. The new version of the agreement is written on the record at once.
  - Where the collective names one specification for tasks of two layers, it belongs to both. Naming it for the second layer needs whoever decides each of the two tasks, as just said: both lanes' holders where both lanes exist. Each of its acts counts only when the holders of each lane that covers it have signed it, each lane as its own number asks.
  - Three tasks judge rather than act: condition evaluation, time reference and anchoring (the judicial tasks). Which specification fills them is never a lane's choice, not even the Law lane's, though their acts, being Law acts, fall in the Law lane like any other. They change only with every member's signature, one version for everyone; a new version that also changes the constitution needs the constitutional change rule alone (F120; flaw K1 open where that rule is below every party).
  - In a collective with areas, an act under a specification the collective has not adopted counts for nothing, so nobody holding the collective's key can act around the lanes, unless an area covers that specification's act type by name.
  - **Extensions** (cMIPs outside the listed tasks) belong to Production. Each declares in its own text the other layers it acts on. Adopting or dropping one is a single new version of the agreement, which needs the power over Production and over each layer it declares: that layer's lane's holders, each lane meeting its own number, or, where no area covers the layer, the clone rule. Signatures come in any order; the version comes into force only when all of those powers are met, all at once. (A version that also changes the constitution needs the constitutional change rule alone, which can change everything; flaw K1 open where it also changes a judge.) An extension's rules bind only Production and the layers whose power its adoption met: never a layer whose holders it did not ask, even if they signed.
  - *A receipt or claim is a Finance act, so it falls in the Finance lane, and counts only on a rail Module the collective's own payee pointer or vault names (Finance, F115): whoever holds the Finance lane chooses the rails.*
- **When a holder goes.**
  - A holder leaves an area by a constitutional change, or steps down at once, alone. Co-holders carry on.
  - An area with no holder left is frozen until that change. The grants issued within it end for good.
  - At the refit, the area's new holders, by the area's own rule, reinstate the grants they choose, one by one, each by an act of the collective made after they took the area, and seal the others. A grant's seal is judged, like the grant, by its area alone.
  - A grantee's act the collective acknowledged, paid on or imported binds it; any other is undetermined until the refit decides.
  - A clone that takes a holder off an area may keep the area's number of signatures even above the holders left; then all the holders who remain, together, meet it. A clone that removes a member takes them off every area they held.

**Nobody's absence freezes the collective.**
- Every member whose signature the constitutional change rule counts is covered by an abandonment clause that can remove their voice, so a lost member never freezes the constitution.
- When fewer voices remain than a rule's number asks for, all the remaining voices meet it.

**Before and after, in a collective's name.** *There is no clock. So when a member leaves, or rotates their own keys, the collective itself draws the line: an act of its own, after which the change counts. Everything done in its name is then before or after that line by its place in the collective's own sequence, never by the member's personal devices, which nobody else can see.*
- **The line.** For anything done in a collective's name, before and after are judged only on the collective's own sequence, never on its members' personal sequences.
  - An act of the collective is before a line when it lies before it in the collective's sequence, or in the ancestry of a tip the line names.
  - A member's signature sits at the act of the collective it signs, or where a record naming it, or an acknowledgement by the collective, places it.
- **Departures take effect at the line.** A resignation, a stepping down or a declaration of absence takes effect at the line the collective draws by its record act, which registers it at once. Until then the departed member still counts. *The line is the collective's, so a collective that delays it only delays itself.*
- **What puts a clone in force.** A record names the signatures that put its clone in force, and counts only with those; so does the rotation that declares a constitutional clone. A record puts its clone in force only if that clone is a new version of the one in force for the record itself, or, after a fork, of the latest version of one of its branches: so of two records drawn one after the other on new versions of the same parent, the second puts nothing in force. A record's registrations stand even where its clone does not.
- **Forks.** Two of the collective's devices can each draw a record without knowing of the other, so that neither record comes before the other in the collective's own sequence. If the two put different new versions of the same agreement in force, the agreement has forked. The agreement's own fork rule, where it has one, decides which version counts. Where it has none, the version both started from stays in force, until the collective writes, on a record that comes after both, a new version made from the latest version of one of the two branches: that new version comes into force there, and the other branch is not in force. A branch that forked again cannot be resolved through.
- **Who else can place an act.** The collective's keepers may place its own acts that a line left out, never a member's signature or a deal. An acknowledgement by anyone else places nothing.
- **A member's own rotation** is registered the same way, at the collective's line. A signature made with the member's old key and placed before that line stays valid for the collective, whatever the member's rotation kept or disowned, wherever it signs something the collective's key holders also signed: one of the collective's own acts, or a new version of its agreement that a record or rotation of the collective put in force naming that signature. Otherwise, and whenever it is placed after the line, it is judged by Identity alone, as any signature is. Its status under Identity is unchanged, and every client shows it. *So whoever stole a member's key can finish what the collective itself signed, never start anything.*
- **What a departure does not undo.**
  - A member who left can still complete an act the collective signed before its line.
  - A signature placed before the line still counts for the act or version it signs, and for that one thing its signer still counts among the voices that remain, so their leaving never lowers the number the rule asks for. *Under a rule of three of three, a member who signed a version and then left still leaves it needing both others.* Where the record or rotation putting that version in force does not name the early signature, its signer still counts as a voice, one who did not sign there.
  - A declaration never undoes a clone a record or rotation put in force before the collective's line.

### Succession, grants and abandonment

- **Succession.** A party may attach a succession plan to an agreement: stake successors and seat successors, each divisible, possibly different people.
  - It is triggered by the party's own act or by the abandonment authority's declaration, and carried out as a clone.
  - In a collective, a seat passes automatically only when every member still counted signed that version of the plan; otherwise the successor is nominated and approved under the constitutional change rule.
  - An automatic succession clone puts the successor in the departed member's place in the key grammar, every threshold unchanged, and drops the used plan; the rotation declaring it re-deals the keys to include the successor.
  - Where the departed member held the safety key alone, that clone also carries a succession plan for the successor, naming their own successor, signed by them in it, so the key always has a named successor.
  - A seat never carries the areas its holder held: the succession clone takes the member off them, and the collective refits them.
  - *The core gives the language; death is left to the parties and their named authorities.*
- **Grants** delegate authority, with limits, revocably, and never beyond the power of whoever issued them: an area's holders grant only within their area.
  - Acts under a grant sit in its own branch, and a publication under one names the grantor as the identity it is made for.
  - Revoking a grant seals its branch, naming no place on it. A deal the grantor acknowledged, paid on or imported still binds it.
  - The collective imports or hands over what it accepts; counterparties require import before performing.
- **Abandonment** (when a party no longer answers) is decided only by the authority the clause names, always an identity.
  - The authority signs a declaration naming the agreement, the version of its clause the party signed last, the party, and the outcomes. It is judged against the time reference, with the outcomes the clause allows, under that version, which carries the one clause in force for every member whose voice remains.
  - Liveness acts prevent it; a contest objects to it.
  - One outcome removes the party's voice from then on, in a collective from the collective's line registering the declaration. It never takes their stake, and never undoes a clone a record or rotation already put in force.
  - **In a collective,** the authority may be a threshold of the other parties, counted at the collective's line registering the declaration. Where it needs several of them, one signs the declaration and the others add signature acts naming it; it counts once the required number have signed. Where the declared member alone holds the everyday key, the recovery rotation removing them names those signature acts.
  - **In a deal,** the authority is one identity (a party, a keeper's operator or a collective), never a threshold of the other parties.

### Disputes

- **Non-performance.** *The core never enforces; it makes default impossible to hide.*
- **Negotiation** (F118). Two sides negotiate by negotiation messages, a Law act carrying text: each names the previous message of its thread and acknowledges the latest one received from the other side, so the record is provably complete up to the last acknowledged message. A text act in the thread is no part of the record: it cannot carry an acknowledgement. Either side may disclose the record by publishing its keys. *Cost, stated: a client without Law shows a negotiation message as unknown; negotiating needs a Law client, as signing the deal does.*
- **Contests.** Only parties, affected holders and named keepers, arbitrators or verifiers have standing to contest, and a contest changes nothing about any act's validity: it is shown alongside what it names.
- **Tasks:** split; condition evaluation; time reference; anchoring; grant limits; work claims.

## MIP: Production

- **Specifications are named by the hash of their content,** wherever they are published. cMIPs and Modules name their creator inside, so names cannot collide or be stolen; a creator named by a specification it never published is shown as unclaimed. MIPs have no creator: they are the protocol itself. Signature schemes and units are specifications too.
- **Frozen at publication.** A changed specification is a new one, which may name its predecessor for migration; a successor by a different creator is shown as such.
- **Tasks are the contract** between the core and the community, each with one global number: for each, the defining MIP states what a cMIP accepts and produces. **Extensions** cover what no task foresaw, adding rules and never relaxing the core's; an extension declares in its specification the layers it acts on, so a collective knows whose approval adopting or dropping it needs.
- **Verification rules** that anyone must be able to run are programs for one frozen machine, RV32IM, with fixed memory, an exact step budget stated in the specification, a fixed input and output encoding, and no clocks, networks or randomness; a rule over budget, or outside the profile, answers unknown everywhere. A binary rule is carried as a locked object the specification names. The rule decides validity; the text explains it; a mismatch is a bug, fixed only by a new specification.
- **Adoption by opt-in; no registry.** Discovery happens through use. Below the MIPs the one trust root is the six MIP hashes, published together with their texts in the genesis repository; a fork presenting six others is a different protocol, and a successor must change the `MOR/` tag prefix.
- **Earning through signed terms.** Creators earn through standing fee offers and role shares evidenced by signed records; nothing is taken from a payment without a signature.
- **Evidence of use comes from a party, never from a Module** (F116). A Module is a specification: it signs nothing. That a rail Module carried a payment is shown by the receipt or claim naming it, signed by the receiver or the payer; that a service someone runs was used is shown by a record signed by the identity running it. Several Modules may work under the one cMIP an agreement names for a task, such as several rail Modules under the payment cMIP, one per rail.

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
| Payment rails, units, vault receiving addresses | Rail Modules under the payment cMIP, and unit specifications |
| Rate limits on the flow | Custodial flow services (identities the owner points the flow at) |
| Domains of use | Specialized forks: cMIPs and Modules made for one domain, talking to other forks as they choose |
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
- [ ] Law draft 10's open points: flaws K1 and P1, the fork of a collective's open questions, and the questions on the chain of judgment and departed holders (Law draft 10, "Open in this draft").
- [ ] Technical review of the RV32IM verification profile and its test vectors, the running-summary test vector, the signature-scheme specification format, and the pinned Unicode version.
- [ ] Human adversarial review (round 3).
- [ ] Completeness, per the freeze test suite.

## Glossary

| Term | Meaning |
| --- | --- |
| Acknowledgement | An act naming another identity's act as received; counts only alongside that act; carried only by Identity, Finance and Law act types. |
| Act | Any signed object: an outside, a locked inside, and a signature. |
| Agreement | Terms plus the signatures its rules require, binding those who signed. |
| Area | Acts of a collective and operational matters its founding agreement gives to some members, who alone decide there and may grant within it; an area reaching a whole layer is its lane. Each keeps a permanent id from version to version. |
| Audit | A home's log summary checked and cosigned by another operator. |
| Chain | The acts on one object, each naming the chain and the act it follows. |
| Client | Software that implements Identity, Envelope and Text, plus any other MIPs it chooses. |
| cMIP | A community specification for one task, or an extension. Frozen at publication. |
| Closure | A declaration in a rotation that the signer's home stops serving. |
| Collective | An identity whose keys are held by its members under its founding agreement's key grammar. |
| Chain of judgment | For a judge an agreement names, those that take over, in order, when it answers "unknown" or cannot act; signed by everyone with the terms. |
| Contest | A signed objection to an act, by someone with standing; changes nothing. |
| Conversion service | An identity that receives on one rail or unit and pays on another, under its own offer. |
| Deal | An agreement that founds no collective; it exists and changes only with every party's signature. |
| Departed holder | Someone who left a collective keeping a stake: a share of all its income, with no voice and no veto. |
| Disputed | The status of an act a rotation voided but someone relied on; set only by rotation rules. |
| Encryption key | The public key an identity publishes to receive private content. |
| Extension | A cMIP named by an agreement outside the listed tasks; it adds rules, never relaxes the core's. |
| Fork of a collective | The end of a collective whose members split into sides: a final act closes it, and each side founds a new collective naming it as parent. Not a fork of records. |
| Grant | A delegation of authority, with limits, revocable. |
| Home | A relay focused on identity, run by an operator, storing identity chains and signing receipts. |
| Homeless rotation | A rotation that leaves homes that are gone, voided by a live home's objection unless endorsed with both keys; final once the next rotation counts, except one accepted only on a client's own failed attempt to reach the home. |
| Identity | The hash of a genesis act. |
| Inbox | A route where others deliver acts addressed to an identity. |
| Keeper | A sealed notary named by an agreement, recording act ids and signers as they arrive. |
| Link | A two-way statement, claim plus confirmation, that two identities belong to the same entity. |
| Negotiation message | A Law act carrying text, by which two sides negotiate; it acknowledges the latest message received from the other side. |
| Mark | A clone's statement of the rules that brought it into force and whose signatures met them; checked by verifiers. |
| MIP | A core specification. Frozen forever. Has no creator. |
| Module | An implementation or extension under a MIP or cMIP, named by hash, frozen at publication. A specification: it signs nothing. |
| Operator | The identity that runs a relay and signs what it states. |
| Payee pointer | Where payment to an identity goes: a flow pointer, and a vault of safer entries. Publications pay the identity they are made for. |
| Payment claim | A payer's record of a payment, with the rail's proof; equal evidence to a receipt. An anonymous payer's claim carries the signature of the key its payment committed to. |
| Payment cMIP | The cMIP an agreement names for payment; rail Modules plug in beneath it. |
| Rail Module | A Module under the payment cMIP for one rail: its addresses, its proof and the rule that checks it. It signs nothing; the payee's pointer or vault names those it accepts. |
| Protected clause | In a collective, a clause that can move a member's stake or voice or decide a dispute; together, the judicial tier, changed only with every member's signature, one version for everyone. |
| Receipt (home) | A home's signed statement of which identity-chain act it holds; counts only alongside that act. |
| Line (Law) | An act of a collective, a record or a rotation, at which an event changing who may act for it takes effect; what was done in its name is before or after by its place in the collective's own sequence. |
| Record (Law) | A collective's everyday line: it writes a complete clone of its agreement in its own sequence, with the signatures that complete it, so its later acts are judged under it, and registers its members' departures and rotations. |
| Route | Where an identity's content of a given type can be found (outbox), or where others deliver to it (inbox). |
| Safety key | A post-quantum key, committed in advance, used once to sign a rotation. |
| Self-hosted | An identity that is its own home, trusted on its own signatures. |
| Sequence | A line of an identity's everyday acts. |
| Settlement receipt | The common proof of one payment hop, signed by the receiver. |
| Specialized fork | A branch above the frozen core: cMIPs and Modules made for one domain, meant to stay there, talking to other forks as it chooses; Identity and Text apply across all forks. |
| Split service | An identity named by grant to divide incoming payments for a work's owners and pay them out. |
| Stake | A share in a work or publication, in millionths, held by whoever the transfer chain names. |
| Succession plan | Part of an agreement naming a party's stake successors and seat successors. |
| Task | A point where a MIP hands work to a cMIP. |
| Tier | One of a collective's three levels of rules: constitutional, judicial, operational; each changed by its own rule. |
| Vault | An identity's safety-key-protected set of receiving entries, per unit and per rail, with limits; several entries for one unit take the smallest limit. |
| Work | A piece of media identified by its work hash, bound to its creators by an explicit work claim. |
| Witness act | An Identity act saying "I received this act and rely on it", carrying the acknowledgement; never a side effect, explained before signing. |
| Work hash | The fingerprint of a work's complete plaintext. |

## Earlier versions

*Version 20, 1 October 2026. Version 19 naming Law draft 9, which writes in the answers to Flaws B17 to B19 (recorded under F109): where one person holds a collective's safety key, the succession clone giving the seat to a successor also carries a succession plan for that successor, signed by them in it (Flaw B17); where the declared member alone holds the everyday key, the recovery rotation removing them names the signature acts on the declaration (Flaw B18); in a deal, the absence authority is one identity, never a threshold of the other parties (Flaw B19). Nothing else in the core changes. Version 19 was version 18 naming Law draft 8, which writes in what reworking the code to Law draft 7 found (recorded under F109): a rotation of a collective that declares no new agreement changes keys, not rules, and the agreement in force carries forward, recorded clones included (Flaw B1); a fork of records is resolved by a clone of either branch recorded after both lines (B11); and the abandonment declaration has an exact format (B12); an automatic seat by succession puts the successor in the departed member's place in the keys, every threshold unchanged, and drops the used plan, the collective re-dealing its keys (Flaw B14); where several members judge absence, one signs the declaration and the others add signature acts naming it (B15); C7's recovery rotation is the one removing the declared member (B16). Nothing else in the core changes. Version 18 was version 17 with F103 to F107 and F109 applied (MIP: Law), with the answers to the Law redraft's questions Q1 to Q10: a collective's rules fall in three tiers, constitutional, judicial and operational, and the constitutional tier changes by its own rule, every party by default; a collective's acts and operational matters can be given to its members as areas, following MOR's layers, a cMIP's acts falling in the layer of the task the collective adopted it for and extensions in Production, and a grant never reaches beyond its issuer's power; a clone states truthfully which rules brought it into force and by whose signatures; every member with constitutional power is covered by an abandonment clause that can remove their voice; a member can always leave alone, keeping their stake; a deal, an agreement founding no collective, changes only with every party's signature; founding terms, a deal's or a collective's, exist only when every party has signed them; when fewer voices remain than a rule's number asks for, all the remaining voices meet it; a lane adopts the cMIPs for its layer's tasks, and the Production lane the extensions, with the lane of each layer an extension declares; every complete clone is written on the collective's record at once, only constitutional ones rotating its keys; a holder can leave an area by a constitutional change, or step down at once, the area frozen until that change; a seat passes automatically by succession only when every voice signed that plan. Its fourth pass adds: a resignation, a stepping down and a record name the latest act of every sequence their signer keeps, and anything of that signer outside them counts as made after; a specification adopted for tasks of two layers answers to both lanes; the judicial tasks stay outside the Law lane; in a collective with areas, an act under a specification the collective has not adopted counts for nothing; when one of several holders steps down the others carry on, an area freezing, with its grants, only when no holder remains; an extension declares in its specification the layers it acts on (MIP: Production), and dropping it needs the same approvals as adopting it; a seat passed by succession never carries areas. Its fifth pass adds: an act that a resignation, a stepping down or a record places after it still counts as made before when another identity acknowledged it or a named keeper recorded it first, shown as disputed, and the record or rotation that puts a clone in force acknowledges the signatures that completed it; a specification adopted for a judicial task is adopted for no other task; a clone that removes a member takes them off their areas, an area left with no holder standing frozen; a frozen area's grants end for good, and its new holders reinstate those they choose, one by one; a signature made before its signer left still counts, its signer a voice for that clone or act, and the rule is met or not as written. Its sixth pass adds: only what can be placed in time protects an act from counting as made after, a named keeper's record made before or the record or rotation that put a clone in force, while a bare acknowledgement keeps the act visible without effect; at a refit, a frozen area's ended grants are sealed at their last counted act or reinstated, by the area's own rule, the grantee's later acts undetermined until then; a judge serves no other task and is no extension, in a deal as in a collective; a clone may leave an area's number above its holders, all who remain meeting it; an abandonment declaration removes a voice from then on and never undoes a clone a record or rotation put in force. Its seventh pass applies F109, replacing what the fourth to sixth passes said of members' sequences: for anything done in a collective's name, before and after are judged only on the collective's own sequence; a departure takes effect at the line the collective's record draws, registering it at once; a record names the signatures that put its clone in force; records on concurrent lines are a fork of the agreement, the earlier version staying in force; the collective's keepers may place its own acts a line left out; a member's signature is placed at the collective's act it signs, or where the collective acknowledged it; a member's own rotation is registered on the collective's line, their signatures before it staying valid for the collective; a revocation seals without naming a place, and a deal the collective acknowledged, paid on or imported binds it; a declaration takes effect at the collective's line. Its eighth pass, the last, adds: the rotation that declares a constitutional clone names the signatures that put it in force, as a record does; a reinstatement of a frozen area's grant is an act of the collective, completed by the new holders after they took the area; a revocation of a grant within an area is judged by that area alone; an agreement has one time reference, which decides deadlines, never the order of a collective's acts; each area keeps a permanent id; a member's own rotation leaves valid, for the collective, their signature on a clone that a record or rotation of the collective put in force before its line, as on its acts; a record's registrations stand even where its clone does not; a threshold abandonment authority is counted at the collective's line registering the declaration; concurrent records are settled by the agreement's own fork rule, the earlier version staying in force where it has none. It names Law draft 7 and Production draft 5, whose one change is that field. Version 17 was version 16 with F102 applied: a text format shows what it does not hide in the order of the bytes, and never makes it invisible by styling (MIP: Text), and naming the current drafts, Identity 10, Text 6 and Law 6, where version 16 still named Identity 9 and Law 4. Version 16 was version 15 with F99 applied: a private act reaches its recipients inside a sealed container that carries its key ("Everything encrypted by default", "Public receiver, private sender"), and naming Envelope draft 6, which also carries F98 (X-Wing). Version 15 was version 14 with F92 applied: a rotation that counts under the old home rule beats a homeless rotation even once it is final ("The way out"), and naming Identity draft 9, which also carries F93 to F95. Version 14 applied F91: no data item in an act is nested more than 128 levels deep ("Common conventions"), and naming Envelope draft 5, which also carries F89 and F90. Version 13 applied F87: a homeless rotation accepted only on a client's own failed attempt is never made final by the next rotation ("The way out", glossary). Version 12 applied review round 2 (findings F53 to F82). The MIP drafts (Identity 10, Text 6, Envelope 6, Finance 5, Law 9, Production 5) hold the exact formats and rules; this document is the map, and must stand on its own.*

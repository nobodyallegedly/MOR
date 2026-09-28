# MOR Findings Log

*Issues surfaced while drafting the MIPs, and how they were resolved. Each entry lists what changes in the core and the freeze test suite.*

## F1. What a home is; when a rotation counts

**Found while drafting:** Identity. Core v9 has homes signing receipts, and a rotation pending until enough receipts arrive. A home defined as an address cannot sign.

**Decided (Nobody, allegedly):** A home is an address that stores one or more identity chains. It is not a signer. It stores who can currently sign for an identity hash, and can serve other purposes through cMIPs. A rotation is delivered at the home, and the MIP must specify how. "Home" names a role, not a size: a home may be a small device or an industrial server holding many identities.

**Resolution (drafted by Claude, not contested):**
1. The owner signs the rotation offline with the safety key.
2. The owner submits it to the home. The home MUST check its validity before storing it: it reveals the safety key committed by the previous rotation or genesis, binds a new signing key, commits the next safety key, and names the acts it keeps.
3. The home appends it to the identity chain and serves it; from then on it counts. A home MUST NOT accept an invalid rotation, and MUST NOT drop a valid one it has accepted.
4. With several homes, the owner submits to each, and the rotation counts once the home rule is met (see F8).
5. Competing rotations: superseded by F6 (first held wins; no backup key).

A home verifies but does not vouch: anything it serves can be re-checked, so it can hide or delay a rotation, never fake one. Keepers still sign their records, so a keeper keeps an identity of its own.

*Amended by F12: homes sign receipts again, as statements of what they hold, not as a gate. A home is declared by its identity plus an address hint.*

**Core changes:** Rotation (remove receipts; "pending" means not yet held by the homes the home rule requires); Several homes (home rule on homes holding the rotation, not on receipts); Glossary, Home.

**Freeze suite changes:** component "Rotation by safety key; home receipts; pending until threshold" becomes "Rotation by safety key, delivered at the home; pending until the home rule is met". Scenario 5.6 becomes: the journalist submits a new rotation to their three homes; one does not store it; the two that do meet the declared majority, and clients follow it.

## F2. Why a rotation may happen

**Found while drafting:** Identity. Rotation was described as only for a compromised signing key, but the core and suite also rotate routinely (scenario 5.5) and after a new signing key is lost before use.

**Decided (Nobody, allegedly):** Rotation is a rare act, normally after compromise. An owner in constant vulnerability, such as the journalist, may rotate routinely.

**Resolution:** The protocol does not restrict why an owner rotates; it cannot verify a compromise anyway. Rotation is expected to be rare. Scenario 5.5 stays.

**Core changes:** none required; a line on expected rarity may be added to Rotation.

**Freeze suite changes:** none.

## F3. Acts in two chains; private acts in the identity chain

*Partly superseded by F5: the identity chain holds only key events, so private acts never reach the home.*

**Found while drafting:** Identity. An act on an agreement or collective belongs both to its signer's identity chain and to that object's chain, but the core describes only one predecessor pointer. Putting every act in the identity chain also exposes the count and timing of private acts to the home.

**Suggested (Claude), not contested:** An envelope carries two pointers where relevant: the previous act in the signer's own sequence, and the previous act in the object's chain.

**Decided (Nobody, allegedly):** The user always chooses how private acts relate to their history; the protocol cannot enforce otherwise.

**Resolution:** No new rule. A later act either names a private act in full, names only its hash, or leaves it out. The cost of leaving it out is the rotation rule: an act outside the kept ancestry survives a rotation only as a dispute, if acknowledged or recorded. The Identity MIP states this consequence plainly.

**Core changes:** Foundations and Envelope (two predecessor pointers); Rotation (state the consequence for acts left out).

**Freeze suite changes:** none; scenario 5.3 (acknowledged negotiation thread) already exercises it.

## F4. Chains differ by entity

**Found while drafting:** Identity. Core v9 defines one generic chain, with any two acts after the same point forming a provable fork. Identity histories branch legitimately (parallel devices, acts the owner leaves out), so a branch cannot mean the same thing everywhere.

**Decided (Nobody, allegedly):** Chains for identities, collectives, works and envelopes are not necessarily structured the same way, and are defined separately.

**Resolution (drafted by Claude, not contested):** The Envelope MIP keeps only the shared mechanics: hash-linking, several predecessors where branches merge, and forks provable from signatures. Each entity's chain rules (who may append, whether a branch is normal or a conflict, how conflicts settle) are defined where the entity is defined: identity chains and sequences in Identity; agreement and collective chains in Law; work and envelope chains in Law (claims, stakes, withdrawal). A branch in an identity's sequences is never by itself evidence of wrongdoing. Agreements are assumed to have their own chain definition alongside collectives.

**Core changes:** Envelope, Chains and Ordering (shared mechanics only); Identity; Law; Glossary, Chain.

**Freeze suite changes:** component "Hash-linked ordering; provable forks" is read per chain type; no scenario change.

## F5. Identity chain holds keys only; everyday acts form sequences

**Found while drafting:** Identity. Core v9 puts every act an identity signs in its identity chain, held at the home. That conflicts with the home storing only who can sign, and with layers living on different relays.

**Decided (Nobody, allegedly):** Only the safety key adds to an identity chain: a rotation generates a new signing key and a new safety key and updates the chain. The home takes care of identity only ("verify me here"), plus shortcuts to where the rest lives. Communication, media and finance may each live on different relays. The home may also store the identity's relay list (routes), changed with the signing key since it is a common event.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- The identity chain holds genesis and rotations. It lives at the home.
- Everyday acts, signed with the signing key, form one or more sequences chosen by the owner (for example per layer or per device). Each act names the previous act in its sequence by hash, wherever it is stored.
- A rotation names the latest genuine act in each sequence; those acts and their ancestry survive. This covers several devices without per-device keys in the core.
- The number and split of sequences is the owner's choice, not prescribed by the core.
- Routes are stored at the home, outside the identity chain, and changed with the signing key. A thief holding the signing key can redirect routes until the owner rotates; that is an inconvenience, not a loss of identity.

**Core changes:** Identity (identity chain definition; sequences; rotation names latest kept act per sequence; routes held at the home); Foundations and Envelope (predecessor pointer means previous act in the signer's sequence); Glossary (Identity chain, Sequence, Home).

**Freeze suite changes:** component "Identity chain; rotation keeps the named acts' ancestry" reads "Identity chain of key events; rotation keeps the named acts' ancestry in each sequence". No scenario change.

## F6. No backup key; the safety key is post-quantum; first rotation held wins; homes may guard acceptance

**Found while drafting:** Identity. Core v9 has a third key, the backup key, from a quantum-resistant family, which settles competing rotations and survives a break of elliptic-curve signatures. "Backup" and "safety" turned out to name the same role.

**Decided (Nobody, allegedly):** There is no backup key. Genesis creates the identity hash and two keys: signing and safety. The safety key is the recovery key. At rotation it is used, the identity chain points to the new signing key, and the home expects a new safety key. The safety key uses different, heavier cryptography, affordable because it is used rarely. A thief holding the safety key wins only if it can get its rotation held by the homes that count: homes that refuse rotations from anyone but the owner are a market service. With a single home and no such guard, the thief wins, like a stolen bitcoin key. The post-quantum safety key secures the exit, not what is left behind; that is why the MOR 2 case study matters most.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- When two valid rotations reveal the same safety key, the first one the home holds wins. A home that holds a valid rotation MUST reject any other revealing the same safety key. With several homes, the home rule decides (F8).
- A home MAY apply its own conditions before accepting a rotation (for example proof of a registered device, or an in-person check). Those conditions are outside the core; the core only requires that a home never accepts an invalid rotation. A strict home may also refuse the owner; that risk is the owner's choice.
- The safety key is from a post-quantum family. Because each safety key signs exactly once, a one-time hash-based signature scheme fits (open technical parameter). This keeps identity continuity through a break of elliptic-curve signatures, taking over the backup key's role in the MOR 2 exit. History signed with the everyday key still depends on anchoring before a break.
- Only one term is used: safety key.

**Core changes:** Identity (remove backup key from The identity, Genesis and Several homes; competing rotations settled by first held; homes may guard acceptance; safety key cryptography); Foundations (envelope signature scheme per key type); MOR 2 (the post-quantum safety key replaces the backup key as the continuity anchor); Outside the core (home acceptance policies: relay market).

**Freeze suite changes:** remove components "Backup key committed before a fork settles it; backup replaced after use" and "Competing rotation settled by the backup key"; add "Competing rotation: first held by the homes that count wins; home acceptance policies". Scenario 5.7 becomes: a thief steals the journalist's safety key and submits a rotation; two of the journalist's three homes require proof from a registered device and refuse it; the thief's rotation is held only by the lax home, misses the declared majority, and the journalist's own rotation wins. Scenario 1 or 2 may add the single-home case, where the thief's first-held rotation counts.

## F7. Linking identities

**Found while drafting:** Identity. Core v9 says linking two identities is a signed act, without saying who signs, how a link ends, or where it lives.

**Decided (Nobody, allegedly):** Linking proves that two identities belong to the same entity. It is a rarer case, but it serves its purpose. Both identities must sign; either side can end a link. Links are stored at homes. A private link is stored encrypted.

**Resolution:**
- A link counts only when both identities sign it (Nobody, allegedly). A one-sided act is a visible claim, shown as unconfirmed (Claude, not contested). The same applies to outside identities that can sign back.
- Either side ends a link alone (Nobody, allegedly). Ending stops it going forward; it cannot erase that the link existed. For a nym, linking is effectively irreversible disclosure (Claude, not contested).
- A public link is stored in the clear at the homes; a private link is stored encrypted, and its key is delivered only to whoever should see it (Nobody, allegedly, key delivery as in Envelope).
- **Suggested (Claude), not contested:** an encrypted link must not let an observer match the two identities. Each copy is encrypted separately so the stored bytes differ, and the owner may store a private link under only one identity or delay the second copy, since two copies appearing at the same moment, especially at a shared industrial home, reveal the pair by timing.
- Links give no authority. Delegated authority, including agents, uses grants (Law); agents are deferred to their case study.

**Core changes:** Identity, Relations (two-way signing; termination by either side; public or encrypted storage at homes; no authority conferred).

**Freeze suite changes:** component "Several unlinked identities; linking as a signed act" reads "Several unlinked identities; linking signed by both, ended by either; public or encrypted". Scenario 5.1 may add that the link is first private, shown to one counterparty.

## F8. Home rules and competing rotations

**Found while drafting:** Identity MIP draft 1. Core v9's default when homes disagree, "the copy furthest along the rotation sequence counts", favours a thief who holds the safety key and rotates again quickly. And a threshold of half or less could let two competing rotations both count.

**Decided (Nobody, allegedly):** It is up to the owner; both declared options must be available. The choice answers one question: are the other homes simple backups, or part of a safety network? An owner may also declare neither, so a default is needed: the furthest-along copy counts. It is not safe, but it is a solution for that case.

**Resolution:**
- With several homes, the owner MAY declare one of two home rules: one named authoritative home (the others are backups), or a threshold greater than half the declared homes (the homes form a safety network). Either form ensures at most one competing rotation can ever count. If none meets the rule, the identity is contested and no rotation counts until one does.
- With no declared rule, the furthest-along copy of the identity chain counts (Nobody, allegedly). **Suggested (Claude), not contested:** if two copies are equally far along, the identity is contested until one moves ahead. The MIP states plainly that this default does not protect against a thief holding the safety key.
- A home left holding the losing rotation is outvoted, and the owner may drop it in a later rotation.

**Core changes:** Identity, Several homes (two declared forms of home rule; furthest-along default kept, with the tie case and its known weakness stated; contested state).

**Freeze suite changes:** component "Several homes and a declared home rule" reads "Several homes; home rule as one authoritative home (backups), a majority (safety network), or the furthest-along default". Scenario 5.7 already uses a majority (two of three).

## F9. Succession is set up by rotation

**Found while drafting:** Identity MIP draft 1. Core v9 does not say which key signs a succession act. If the signing key could, a thief holding it could redirect everyone to an identity of its own.

**Decided (Nobody, allegedly):** Succession must be protected by the safety key, but the safety key stays single-use. Setting up a succession requires a rotation.

**Resolution (drafted by Claude, not contested):**
- Succession is not a separate act: it is an optional field of a rotation, naming the successor identity (MOR or another protocol) by identifier and protocol type.
- The latest rotation that counts decides the succession. A rotation without a succession field leaves the previous one in place; ending a succession requires a rotation that says so.
- Declaring a succession does not end the identity; both may coexist while followers and agreements move across.

**Core changes:** Identity (succession as a rotation field; "Relations" no longer lists succession as a standalone act); MOR 2 (succession set up by rotation).

**Freeze suite changes:** component "Succession" reads "Succession declared in a rotation". Scenario 5.5 or the MOR 2 case study exercises it.

## F10. Declarations slot for high-risk settings

**Found while drafting:** Identity MIP draft 1. Finance's vault pointer is "declared only in a rotation", which leaves an identity without a vault until its first rotation, and puts Finance data into Identity, which sits beneath it.

**Suggested (Claude), accepted by Nobody, allegedly:** Genesis and rotations carry a declarations slot for entries defined by higher MIPs. Identity checks the signature and stores the slot, but does not interpret its entries. Finance defines the vault pointer and spending limit there, so an identity can have a vault from birth.

**Decided (Nobody, allegedly):** Anything that involves higher risks should benefit from the mechanism.

**Resolution:** An entry is valid only in genesis or in a rotation that counts; the latest entry of each kind counts. Higher MIPs decide which of their settings are high-risk and belong in the slot.

**Core changes:** Identity (declarations slot in genesis and rotation); Finance (vault pointer and spending limit declared in the slot, from genesis); a general principle in Foundations: high-risk settings are changed only with the safety key.

**Freeze suite changes:** component "Vault pointer declared only in a rotation" reads "Vault pointer declared in genesis or a rotation". Scenario 2 (stolen phone, vault untouched) already exercises it.

## F11. Clients implement the MIPs of the acts they act on

**Found while drafting:** Identity MIP draft 1. Whether an act outside a kept ancestry is void or disputed can depend on keeper records, which are defined in Law, a MIP a client may not implement.

**Walked through (scenario):** Lea's signing key is stolen; the thief posts a scam (nobody relies on it: void), writes to Tom who acknowledges it (disputed in every client), and sells 20% of her album income to Marco, recorded by a keeper (disputed in a client with Law; a client without Law cannot tell).

**Decided (Nobody, allegedly):** All clients involved in complex sales implement Law. Finance alone is enough for tips.

**Resolution:** A client MUST implement every MIP that defines an act it acts on; a client that acts on agreements MUST implement Law. A client that meets an act defined by a MIP it does not implement shows it as unknown, never as valid (Claude, not contested). So the same act never gets two different verdicts from clients entitled to judge it.

**Core changes:** Foundations or Outside the core (client conformance: implement the MIPs of the acts you act on; unknown for the rest, consistent with fail-closed).

**Freeze suite changes:** add component "Client conformance: agreement-handling clients implement Law; others show agreement acts as unknown". Scenario 2 or 5 may include a simple client meeting a keeper-recorded act.

## F12. Receipts return, as statements not gates

**Found while reviewing:** Identity MIP draft 1, technical review. Without receipts, a home's answer about which rotation it holds is unsigned. A dishonest home can tell different clients different stories and never be caught, so clients can disagree about who controls an identity, and the owner's client cannot detect the betrayal to act on it. KERI, the source of MOR's identity design, avoids this with witness receipts; F1 had removed them.

**Understood (Nobody, allegedly):** What passes between a lying home and a thief is private and cannot be made public; the receipt makes it provable. The owner's client can then flag a compromised home so the owner rotates it out. The real selling point: a home with its own identity can move servers without the owner spending a safety key.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- A home signs a receipt for every identity-chain act it accepts: the identity, the act, its position in the identity chain, its position in the home's own log (a sequence number, never a time, per the no-clock principle), and that it was the first valid act accepted at that chain position.
- Receipts are proof, not permission. A rotation counts when receipts show the home rule is met. The owner never signs at the home.
- Two conflicting receipts from one home prove it dishonest or compromised; clients flag it to the owner.
- A home is declared by its identity hash plus an address hint, and announces address changes under its own identity.

**Core changes:** Identity (Home, Rotation, Several homes: receipts as proof; homes declared by identity); Glossary (Home, Receipt).

**Freeze suite changes:** component "Rotation by safety key, delivered at the home; pending until the home rule is met" adds "shown by home receipts". Scenario 5.6 or 5.7 may add a home signing conflicting receipts, flagged to the owner, who drops it in the next rotation; and a home moving servers without a rotation.

## F13. Clarifications from the combined review report

**Source:** Combined review report (26 September 2026), merging the technical review with a design review from the brainstorm thread. Both reviews independently found the unsigned-home problem resolved in F12.

**Added to the Identity MIP (drafted by Claude from the report, not contested):**
- A client MUST submit the exact same rotation bytes to every home, and MUST NOT sign a second, different rotation with the same safety key (rule 8a).
- Acts under a pending key are accepted at the acceptor's own risk (rule 7).
- Clients SHOULD track every sequence the owner has started and warn before a rotation that omits one (rule 18).
- Reasoning: genesis signed with the everyday key is safe; rotations are several kilobytes by design.
- Founding identity modules should use two separate seeds by default, everyday and safety (technical review; Module concern).

**Correction:** the report says KERI reached the same ideas independently. It did not: KERI is the source of MOR's identity design (Nobody, allegedly).

**Decided (Nobody, allegedly):** SLH-DSA (FIPS 205) for the safety key: Nobody, allegedly trusts the recommendation and prefers a standard; the whole set of MIPs goes to Fable for adversarial review once drafted.

**Decided (Nobody, allegedly, stamping the report):** a running sequence summary (Merkle accumulator) in every act, to be specified in the Envelope MIP; core v9 and freeze suite v8 to be updated to match the MIPs, once all six are drafted and before Fable.

## F14. Choices introduced by the act formats (Identity MIP draft 2, decided)

**Found while drafting:** Identity MIP draft 2, writing the exact act formats and verification procedures.

**Suggested (Claude), accepted by Nobody, allegedly** (items 1 to 3 in F17 to F19; the rest through the stamped review reports):
1. One signer per act: links are a claim plus a confirmation; receipts are acts of the home's own identity. F7's "both sign" holds, in two acts.
2. An identity may be its own home (a null home entry), since a home's genesis cannot name its own identity hash.
3. Routes carry a version number; the highest counts (no clock).
4. Receipts from a home proven dishonest count for nothing for that identity.
5. Both SLH-DSA variants allowed (128s recommended, 128f permitted).
6. The act id excludes the signature, so it never changes.

**Settled parameters:** SHA-256 with BIP-340-style tagged hashes; deterministic CBOR (RFC 8949 §4.2.1) with CDDL schemas; scheme numbers 1 (BIP-340), 2 (SLH-DSA-SHA2-128s), 3 (SLH-DSA-SHA2-128f); safety commitment tagged_hash("MOR/safety", scheme || key).

## F15. Homes audit each other; conflicts make an identity contested, not frozen

**Found in review:** Identity MIP draft 2 review report (brainstorm thread). Receipts are signed with a home's everyday key. A thief holding only that key could sign conflicting receipts for every identity the home serves; under draft 2's rule 10d the home would be disqualified, and every identity relying on it as single or authoritative home could never rotate again. One cheap theft, many frozen identities.

**Explored:** mitigations elsewhere: Certificate Transparency (several independent logs; signed tree heads; witness cosigning), Keybase (log root anchored to Bitcoin), KERI (witnesses replaceable by the controller's pre-committed key), Bluesky's did:plc directory.

**Decided (Nobody, allegedly):** Homes audit each other: the best solution, as long as the act of auditing has all it needs in the core. The core answers yes or no, not how. Auditing is additional, non-compulsory security.

**Resolution (drafted by Claude, not contested):**
- New acts: log summary (a home's Merkle root over its receipts, RFC 9162 tree) and cosignature (an auditor's act naming a summary). Proofs are served alongside, not acts.
- An identity MAY require audit, declaring auditors and a cosignature threshold in genesis or a rotation (safety-key protected). Then a receipt counts only if it is proven included under a summary with enough cosignatures from declared auditors.
- Conflicting receipts from one home make the identity contested at that position, not frozen. The conflict ends when one receipt becomes void, through the home's rotation or because only one is included under a cosigned summary. A home is proven dishonest only when the conflict survives both.
- Homes MUST NOT sign, and auditors MUST NOT cosign, two summaries of which neither extends the other.
- Precision points from the review: withheld receipts leave no evidence; disputed acts never win "latest counts" choices; how a verifier resolves a home's own identity (self-homes and cycles); the global log counter reveals a home's volume.

**Core changes:** Identity (log summary and cosignature acts; audit requirement; contested conflicts); Outside the core (audit frequency and pairings: market).

**Freeze suite changes:** add component "Homes audit each other; conflicting receipts contest, never freeze". Scenario 5.7 may add a stolen home key forging receipts that fail audit.

## F16. Homeless rotation: the way out when a home rule can no longer be met

**Found while drafting:** Identity MIP draft 3. If every home the rule relies on is gone for good (for example a single home that vanishes), no rotation can count: in a one-home setup, that is the death of the identity (Nobody, allegedly). The way out is blocked, which touches the good-ancestor priority. Silence cannot be proven: a vanished home leaves no evidence.

**Decided (Nobody, allegedly):** The genesis act and the safety key together should be enough for a user who has become homeless. Layers and granularity are the core of the core.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- **Homeless rotation:** a rotation signed with the current safety key, marked homeless, naming new homes. It needs no receipt from the old homes. A rotation receipted under the old home rule at the same position always beats it.
- **Layer 1, graceful closure:** a home that shuts down signs a closing act. Its identities are then provably homeless, and a homeless rotation counts with no contest.
- **Layer 2, the home is alive:** a home that sees a homeless rotation for an identity it serves signs an objection naming it, and the homeless rotation is void. Since nobody can know an act's hash before the act exists, an objection naming the rotation proves the home was alive after it was made; no clock needed. A client meeting a homeless rotation must first ask the old homes. This is what stops a safety-key thief from bypassing careful homes.
- **Layer 3, abrupt vanishing:** the identity's declared auditors (F15) probe the home and sign statements naming the homeless rotation, attesting the home no longer answers. With the audit threshold met, the homeless rotation counts.
- **Remaining gap:** an identity without auditors, whose home vanished without closing, relies on each client's own failed attempt to reach the home; a thief able to cut a victim off from the home could exploit it. Clients SHOULD recommend auditors to single-home owners.

**Core changes:** Identity (homeless rotation; closing act; objection act; auditor absence statement; precedence of receipted rotations).

**Freeze suite changes:** add component "Homeless rotation: closure, objection, auditor attestation". Scenarios: a single home vanishes and the owner re-homes; a thief's homeless rotation is voided by the live home's objection.

**Written into Identity MIP draft 4:** rotation field 11 (homeless flag); act types 11 (home closure), 12 (objection), 13 (absence statement); the homeless verification procedure; rules 11a and 30 to 35.

**Suggested (Claude) while writing, accepted by Nobody, allegedly:** an objection from a home proven dishonest does not count; after a homeless rotation is voided, the owner may sign one normal rotation with the same safety key (exception to rule 8a); a live but hostile home can still block by objecting and refusing, which is the owner's risk under rule 12.

## F17. The true purpose of links: signing in with MOR, and bridges

**Explored:** Identity MIP draft 4, link scenarios. A link is only a statement: it does not merge identities or let one act for the other. By the admission test it looked like a cMIP, since nothing inside MOR is valid or invalid because of it.

**Decided (Nobody, allegedly):** This is where the link was born. Signing in with MOR is essential, so the core builds the link into the shared language, bidirectional, so that people can build bridges if they wish. That is the true purpose of the link, and it stays in the core.

**Resolution (drafted by Claude, not contested):**
- A link is a claim plus a confirmation (one signer per act). An account on another protocol confirms by signing the claim's act id in its own protocol, carried as the claim's proof and checked by a cMIP for that protocol. Either side may start.
- A claim without a confirmation is not a link, and clients MUST NOT display it next to the identity it names (fixes the unwanted-claim case).
- A link confers no authority: a bridge acting for someone needs a grant (Law).
- If one side rotates without keeping the confirmation's sequence, the confirmation becomes void and the link ends; clients should warn.

**Core changes:** Identity, Relations (purpose of links: signing in and bridges; two-way; unconfirmed claims never displayed).

**Freeze suite changes:** scenario 5.8 (linking an outside identifier, signing in after a rotation) is the link's main test.

## F18. Homes are relays run by operators

**Found while drafting:** Identity MIP draft 4. Drafts 2 to 4 gave each home its own MOR identity, which led to "an identity that is its own home".

**Decided (Nobody, allegedly):** A home is a relay that focuses on the Identity MIP. Relays can have a hash or keys, but that does not make them identities as such. Counting homes per operator is fair and makes centralisation more visible.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- A relay is not an identity; it is operated by one (core v9: "any identity may publish a signed commitment"; homes and keepers are relays in particular roles).
- Receipts, log summaries, closures, objections and absence statements are signed by the operator's ordinary identity, whose keys rotate like anyone's. The operator's identity lives at its own homes.
- A home is declared as operator identity plus relay address; the operator announces address changes through its routes.
- A null operator entry means self-hosting: the identity runs its own home (needed because genesis cannot name its own hash).
- Homes are counted per operator: several homes run by one operator count as one, and conflicting receipts from any of an operator's relays are a conflict.

**Core changes:** Identity (Home, Operator; home entries; per-operator counting); Envelope (Relays: operators sign commitments).

**Freeze suite changes:** scenario 5.6 or 5.7 may add a declared majority whose homes share one operator, counted as one.

## F19. Routes form a chain with a version number

**Found while drafting:** Identity MIP draft 2. Without a clock, "the latest routes act" needs an order. A plain version number lets a thief holding the signing key publish the highest possible number, which the owner could not beat before rotating.

**Decided (Nobody, allegedly):** A version number, or a chain, or both.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):** both. Each routes act names the routes act it replaces and carries its version plus one. Nobody can jump ahead; two routes acts naming the same predecessor are a visible fork. Clients then use the last act before the fork and warn the owner, who settles it by rotating (the thief's act falls outside the kept ancestry). A disputed routes act never wins.

**Core changes:** Identity (Routes).

## F20. Escape with both keys: the way out from a hostile home

**Found while exploring:** Identity MIP draft 4, choice 10. A single home that is alive but hostile could object to a homeless rotation (proving it is alive) and refuse a normal one. A careful home's refusal (rule 12) and a hostile home's refusal look identical from outside, so the protocol cannot judge the home.

**Options weighed:** escape with both keys (no clock; a thief with both keys can also leave careful homes); objection with a deadline in Bitcoin blocks (needs a clock in Identity); owner's risk (a hostile single home traps the owner for good).

**Decided (Nobody, allegedly):** Both keys. Keep your keys separate.

**Resolution (drafted by Claude, not contested):**
- New act type 14, escape endorsement: signed by the owner's current signing key, naming a homeless rotation.
- An endorsed homeless rotation cannot be voided by objections, and the old homes need not be gone. A rotation counting under the old home rule at the same position still beats it.
- Clients and key Modules SHOULD keep the signing key and the safety key separate (separate seeds, separate devices where possible).

**Core changes:** Identity (escape endorsement; rules 36 and 37).

**Freeze suite changes:** add a scenario where a single live home refuses its owner, and the owner leaves with both keys.

## Working rule: review reports

**Decided (Nobody, allegedly):** Review reports from the brainstorm thread are the fruit of discussions with Nobody, allegedly. Their recommendations are accepted as stamped, unless Nobody, allegedly says otherwise.

## F21. Canonical text and a growing Unicode

**Found while drafting:** Text MIP draft 1. Core v9's canonical form requires NFC, but Unicode adds characters every year. A new combining character can change what NFC means for a string, so two verifiers using different Unicode versions could disagree on whether an act is valid, which breaks determinism in a frozen core.

**Decided (Nobody, allegedly, stamping the Text MIP review report):** pin the latest Unicode version available when the core freezes (17.0 as of September 2026). Suggested originally by Claude:
pin one Unicode version for the NFC check (for example 17.0). Every verifier uses that version's tables, never its system's. Characters not yet assigned in that version are left as they are, so new characters such as new emoji stay usable forever. The other rules are written out without relying on Unicode tables: control characters by range, a fixed list of space characters.

**Also suggested (Claude) in Text MIP draft 1, not yet reviewed:** TAB excluded (as in core v9); the line and paragraph separators U+2028 and U+2029 excluded; no byte order mark; lookalike and bidirectional-control warnings are client warnings, not validity rules; a text act may name a format cMIP, and a client lacking it still shows the plain text (the one case where an unknown cMIP does not make an act unknown, consistent with fail-closed since showing text accepts nothing).

## F22. Text MIP review report (stamped)

**Source:** Text MIP draft 1 review report (brainstorm thread), accepted as stamped.

**Applied in Text MIP draft 2:**
- Canonical text does not end with LF, so "Hello" and "Hello" plus a final line break cannot give two hashes. (The report's optional rule, at most one empty line in a row, was not adopted; open if Nobody, allegedly wants it.)
- U+FEFF is banned anywhere in the text; the 66 Unicode noncharacters are banned.
- Clients warn about the zero-width space and bidirectional marks and controls; the zero-width joiner and non-joiner stay valid and unwarned.
- What you sign is what you saw: before any act is signed, a client MUST be able to show all its text as plain text, and SHOULD by default for agreements, terms and grants. Formats may hide their own markup but never add text that is not in the bytes (replaces draft 1's rule that most formats would break).
- The rare edge of later combining marks under a pinned version is stated in the reasoning.
- Confirmed choices: NFC not NFKC; no TAB; no length limit or language tags in the core; format is the one unknown cMIP that does not make an act unknown.

## F23. Types are namespaced by specification hash

**Found while drafting:** Envelope MIP draft 1. Core v9 says every type is "namespaced under its creator's identity". The Identity MIP's act format names the specification's hash and a type number within it, which already makes collisions impossible without a registry.

**Suggested (Claude), accepted by Nobody, allegedly for this pass:** types are namespaced by specification hash; the creator's identity is named inside the specification (Production).

## F24. Sequences are single lines

**Found while drafting:** Envelope MIP draft 1, running summary. A Merkle mountain range summarises a line, not a tree. Branching and merging within one sequence would make kept-ancestry proofs much more complex.

**Suggested (Claude), accepted by Nobody, allegedly for this pass:** within an identity's sequences, every act has exactly one predecessor (or none, to start a sequence). Parallel devices keep separate sequences, which F5 already allows. Merging remains available in object chains (agreements, collectives), where Law needs it. The Identity MIP's `prev` then holds at most one act id.

## F25. Identities need an encryption key

**Found while drafting:** Envelope MIP draft 1, key delivery. Core v9 delivers content keys "to an identity", but an identity has only a signing key and a safety key. Encrypting to the signing key would tie every delivery to that key, lose access at each rotation, and mix signing with encryption.

**Suggested (Claude), accepted by Nobody, allegedly for this pass:** an identity publishes an encryption key as an everyday act, versioned in its own chain like routes. Recommended scheme: hybrid X25519 plus ML-KEM-768 (FIPS 203), so content encrypted today stays safe against a future quantum computer. Content encryption: XChaCha20-Poly1305, a new key per object.

## F26. Sealed containers for private senders

**Found while drafting:** Envelope MIP draft 1. MOR's privacy principle is public receiver, private sender. Any act names its signer, so a message act alone reveals its sender to every relay that carries it.

**Suggested (Claude), accepted by Nobody, allegedly for this pass:** an encrypted act can travel inside a sealed container: the encrypted act plus key deliveries, signed by a one-time key that belongs to no identity. It is not an act; relays carry it as opaque bytes. Only recipients see the inner act and its signer.

**Also noted in Envelope MIP draft 1 (Claude):** acknowledgements are cheap by design. A thief with an accomplice can turn their own acts into visible disputes, never into valid acts. The envelope body is closed: an unknown key makes an act invalid.

## F27. A references field in the envelope (open, queued)

**Found while exploring:** Envelope MIP draft 1, a "hello world" text act next to a publication of an image. An act can name other acts only as its predecessor (`prev`), as a chain it belongs to (`objects`), or as received (`acks`). None means "look at this". A text act cannot show or point at the image it accompanies.

**Suggested (Claude), agreed by Nobody, allegedly to queue:** a plain references field in the body, for acts that are mentioned without being followed or acknowledged.

## F28. Linking to the legacy web, and carrying a work without claiming it (open, queued)

**Found while exploring:** same example, an image of the Earth found online. In core v9, first publication binds a work to its creators, so publishing that image would claim it. MOR needs a way to point at, quote or carry a work without claiming authorship.

**Decided (Nobody, allegedly):** linking to the legacy web matters.

**To resolve:** a reference to a web resource (address, optionally the hash of what was there when referenced, so readers can check it is still the same), and a publication that carries or quotes a work without binding it (Envelope says which it is; Law defines what binding means).

## F29. Everything encrypted by default; a minimal outside; Identity acts as the public face

**Found while exploring:** Envelope MIP draft 1 and the "hello world" example.

**Decided (Nobody, allegedly):**
- Everything is encrypted, text as well as media. Public is an option: the content is decoded by publishing its key. Selling to one person means the key is prepared for them to decode.
- Reasons: to keep relays from making data harvesting their business model, and for direct messages to work without the problem Nostr faces (encrypted messages standing out as a special, bolted-on case).
- Some hurdles are better than no hurdles: make harvesting tedious, expensive and as legible as possible.
- Identity acts stay unlocked: they are the public face of an identity.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- Every act has an outside and an inside. The outside keeps only what a relay needs: the act id, the signer and the signature, plus the hash of the inside, so one signature can never open to two different contents. Type, pointers, acknowledgements, references and content move inside.
- The inside is always locked with a content key. Public: the key is published. Private: the key is delivered to chosen recipients (needs F25). Going public later is one act: publishing the key (embargoes, timed releases, disclosure of a negotiation record in Law).
- Public keys SHOULD travel apart from the locked bytes, so no single relay holds both.
- Identity acts (genesis, rotations, receipts, routes, names, encryption keys, links) are exempt and stay readable.
- Private acts can only be checked, for rules about their inside, by those who hold the key.

**Consequences:** the envelope format in the Identity MIP draft 4 and the Envelope MIP draft 1 changes; the Text MIP's text act becomes locked like everything else. Direct messages look like any other act. Following the agreed privacy principle, public receiver and private sender: a key delivery may show its recipient on the outside (so relays can route it and recipients can find their deliveries without scanning everything), while the sender stays hidden inside a sealed container (F26).

**F29, key travel (Decided, Nobody, allegedly):** a separate class of relay for keys would need its own MIP, and is not wanted. When public, the key travels with the content; when private, the key goes to the recipient as a private encoded message (a key delivery). The earlier suggestion that public keys SHOULD travel apart from the bytes is dropped.

**F29, written into:** Envelope MIP draft 2 (outside and locked inside, salted inside commitment, public and private acts, key deliveries addressed to recipients, sealed containers, references with web resources), Identity MIP draft 5 (Identity acts are public acts in the new envelope), Text MIP draft 3 (text acts locked like every act).

## F30. Anonymous payers and signed acts

**Found while drafting:** Finance MIP draft 1. Every MOR act has a signer, yet the core never requires a sender's identity, and scenario 5 has a buyer pay anonymously.

**Resolved through F33:** the settlement receipt is signed by the payee of each hop; the payer field may be absent; a payer ignored by its payee publishes a payment claim with the rail's proof. Original suggestion (Claude): a discharge may be signed by the receiving side, as a receipt of payment, so the payer need not sign anything in MOR. The rail's proof is the payer's evidence, and delivery goes to a key the payer supplies (a device or application key).

## F31. Payee pointers form a versioned chain

**Found while drafting:** Finance MIP draft 1. A flow pointer is changed with the signing key, like routes, and has the same weakness a plain version number had (F19).

**Suggested (Claude), accepted (stamped Finance review report):** payee pointers form a chain like routes: each names the pointer it replaces and carries its version plus one; a fork is contested, clients use the last pointer before it and warn the owner.

## F32. Finance states that depend on Law

**Found while drafting:** Finance MIP draft 1. "Past its terms", "closed by clone" and "redirected" need Law, which a Finance-only client does not implement.

**Suggested (Claude), accepted (stamped Finance review report):** Finance-only clients show those states as unknown, consistent with F11.

**Also in Finance MIP draft 1 (Claude):** the vault pointer and spending limit are declaration kinds 0 and 1 in the Identity declarations slot (F10); obligations, discharges and splits are private acts by default (F29).

## F33. Settlement defined independently of the rail

**Decided (Nobody, allegedly):** The Finance MIP defines what a settlement means to the protocol, independent of the rail it happened on:
- A common settlement receipt: every rail module, whether Lightning, stablecoin or fiat, emits the same proof format: who paid whom, how much, in what unit, and under which agreement.
- Hop chaining: each receipt references the previous hop and the agreement it fulfils, so a cross-rail route reads as one verifiable chain.
- Splits inside the receipt, matching the rule that a fee is one total with an agreed split, so every module's share on a hop is visible and payable.
- Failure attribution: if a route breaks, the receipts show exactly which hop and which agreement failed. That is where Finance hands off to Law.

**Written into Finance MIP draft 2 (details suggested by Claude; splits then moved to Law by F34):**
- The receipt replaces draft 1's separate discharge and split acts. A discharge is now a complete route: a valid chain of receipts that brings the owed amount to the creditor.
- Each receipt is signed by the payee of its hop (the only party that can confirm arrival, already public by principle); the payer field may be absent, keeping senders private (resolves F30).
- A `forward` field says what a hop passes on, to whom and under which agreement; conversion modules forward in another unit at the rate their agreement defines. Conservation holds per receipt, in each rail's smallest unit.
- Failure attribution: a forward with no next receipt stays an open obligation of that hop; a payee that signs nothing is exposed by a payer's payment claim (new act, with the rail's proof); an omitted share is visible in the receipt.
- Tasks: payment per rail (emits the common receipt), split, conversion.

**Freeze suite changes:** add a cross-rail route read as one chain of receipts, with one hop failing to forward and the receipts naming it.

## F34. Finance handles simple payments; splits move to Law

**Source:** Finance MIP draft 2 review report (brainstorm thread). Section 1 is a decision by Nobody, allegedly; section 2 was not yet discussed with him and is applied under the stamped-reports working rule, open to his correction.

**Decided (Nobody, allegedly):** A payment goes to a payee pointer set by the owner or owners of what is paid for. Finance's job ends when the money reaches that pointer. How it is then divided is defined by the owners' agreement, which is Law (consistent with tips in Finance, royalty trees in Law).

**Finance keeps:** payments (one amount, one receipt signed by the receiver); routes across rails through conversion services (one simple payment in several hops, each receipt naming the previous); obligations and discharge; undeliverable payments as open obligations; payee pointers (flow, vault, versioned chain, good faith); payment claims; receiver visibility and sender privacy. A plain tip carries no module fees beyond the rail's own.

**Moves to Law:** splits among owners and stakeholders (typically the owners' payee pointer is a split service, and each payout is a simple Finance payment with its own receipt); conservation (exact sums in the smallest unit, declared remainder rule); module fees (a field of a split); dynamic splits (shares assigned to a role, such as the reposter who led to the sale, the relay that served the file, or the cMIPs and modules the payment ran through, filled at payment time, with the payout naming the identity and the evidence; unfilled role shares follow the split's chosen option). Module fee terms move to Law, or to Production if only a published offer.

**Applied from section 2 (stamped, open to the author's correction):**
- The vault rule becomes reference-based: an obligation names the flow pointer in force when it arose; a payment to the flow pointer counts only for obligations and acts naming that version or a later one; anything under an earlier version, and any single payment above the spending limit, counts only if paid to the vault.
- Each hop's receipt is disclosed at least to the next payee and the final creditor.
- Fiat rails: a module's verification may rest on a named trusted party, visible in the verification answer.
- Units are small specifications of their own, referenced by payment modules, so one unit has one name on every rail.
- The payee pointer's price is the plain-payment price; a standing offer governs deals under Law.
- Carrying the obligation or agreement id on the rail is an open parameter for each founding rail module.

**Written into:** Finance MIP draft 3. To carry into Law: splits, conservation, module fees and fee terms, dynamic splits, the split task.

## F35. Collectives are full identities with their own keys (replaced by decision)

**Found while drafting:** Law MIP draft 1. Core v9 says a collective's founding agreement hash "serves as its identity root" and that it declares a home. But a collective has no genesis, no signing key and no safety key, so the Identity MIP's key and rotation rules do not fit it.

**Suggested (Claude), awaiting Nobody, allegedly:** a collective's identity is its founding agreement's id; it acts through member (or grantee) proposals plus member signature acts meeting its signing rule; its homes store its agreement chain; members change by clone, not rotation. Identity's key rules apply to identities with keys; collectives follow Law.

## F36. Binding is an explicit claim, never a side effect of publishing (resolves F28)

**Found while drafting:** Law MIP draft 1, with F28 (an image found online would be claimed by publishing it).

**Suggested (Claude), awaiting Nobody, allegedly:** a publication is a neutral carrier. A work is bound to its creators only by a work claim act (a sole creator alone, or several creators through an agreement all sign). Carrying, quoting, or pointing to a web resource claims nothing.

## F37. Keepers are always sealed (replaced by decision)

**Found while drafting:** Law MIP draft 1. Every act is locked (F29), and a keeper can only record what it can open.

**Suggested (Claude), awaiting Nobody, allegedly:** an agreement that names keepers delivers them the keys of the acts they must record.

## F38. Stakes counted in millionths

**Found while drafting:** Law MIP draft 1. Shares must sum exactly to 100%.

**Suggested (Claude), awaiting Nobody, allegedly:** shares in millionths (summing to 1,000,000) as a starting point; exact fractions as the alternative.

**Also in Law MIP draft 1 (Claude):** agreements are terms plus one signature act per party (F17 pattern); splits, conservation, module fees, role shares (dynamic splits) and the split task carried in from Finance (F34); disclosure of a negotiation record is publishing its keys (F29).

## Law draft 1 review (discussed point by point with Nobody, allegedly): decisions

**F35, decided (Nobody, allegedly), replacing the suggestion:** a collective is a full identity, with genesis, homes, signing key and safety key. Reason: a collective receiving a tip must sign receipts (Finance). Its founding agreement carries a key grammar: one holder, a threshold (any k of n, for example FROST threshold schnorr producing one ordinary BIP-340 signature), or a custodian under the collective's grant; the safety key follows the same grammar, usually stricter. Changing members is a rotation to new keys plus a clone of the founding agreement. Narrower authority, including agents, uses grants. Trade-off: a threshold signature does not show which members signed; the grammar may require visible member signature acts for chosen act types.

**F37, decided (Nobody, allegedly), replacing the suggestion:** keepers are always sealed. They notarise act ids and signers, never content. Third parties that judge content (escrow, milestones, arbitration, regulated verification) are arbitrators or verifiers named in the agreement, given keys by ordinary key delivery.

**F36, accepted (Nobody, allegedly):** a publication is a neutral carrier; a work is bound only by an explicit work claim; carrying, quoting or pointing to a web resource claims nothing.

**F38, decided (Nobody, allegedly):** stakes in millionths, summing to 1,000,000; leftovers go to the first party listed in the terms (fixed order, unlike signature arrival). The same rule is the default remainder rule for payouts when a split cMIP declares none.

## F39. The split service (decided)

**Decided (Nobody, allegedly):** the owners' agreement names the split service through a grant; how the service runs is defined by the split cMIP the agreement names; Law keeps the vocabulary (split plan, split service, split act, payout, open obligation, grant, conservation) and the guarantees.
- Definition: an identity that receives payments for a work's owners, divides each according to their agreement, and pays every party out; a sole creator is their own split service.
- Authority: grant with limits; owners' payee pointer points to it; revocable under the agreement's rule.
- Duties: publish a split per incoming receipt, signed with its own key, summing exactly; resolve role shares with evidence; pay each payout as a simple Finance payment with its own receipt; keep undeliverable payouts as open obligations. Batching allowed by the grant, measured on the time reference; every incoming receipt still matched by a split.
- Its own fee is a cut in the plan, consented by whoever bears it. It cannot pay outside the plan, change the plan, or leave a receipt unmatched invisibly.
- Failure and switching: unmatched receipts and unpaid payouts are open obligations of the service; owners switch by revoking the grant, naming a new service, and publishing a new payee pointer version; the old service still owes on what it received.
- Supported models, as competing split cMIPs: payer-side splitting, automatic forwarding, pooling with withdrawal. Split plans support a fee taken off the top and an app share (a role share) for the client that brought the sale.

**Also applied in Law draft 2 (review notes):** "what you sign is what you saw" referenced from Text for terms, clones and grants; standing to dispute defined (a party, a holder of an affected stake, or a named keeper, arbitrator or verifier); grant scope for acting for an identity also covers agents acting for a collective. Identity MIP draft 5 notes that a collective's keys may be held under its key grammar.

## F40. Verification rules need one runnable format

**Found while drafting:** Production MIP draft 1. The core promises that anyone can run a module's verification rule independently (Finance verification answers, Law conditions). That only holds if every client can execute the rule and get the same answer.

**Suggested (Claude), accepted by Nobody, allegedly:** verification rules are published as deterministic WebAssembly with a fixed interface (input: the act and the data it names; output: valid, invalid, pending or unknown), with no access to clocks, networks or randomness. The specification text stays authoritative; the executable rule is its reference implementation.

## F41. The spec hash covers the content, not the publishing act

**Suggested (Claude), accepted (Production review, with Nobody, allegedly):** `tagged_hash("MOR/spec", content)` over the specification's canonical content, so the same specification can be published by anyone, anywhere, and stay the same. A specification counts as its creator's when published in an act signed by the creator named inside it.

## F42. Module creators earn through signed terms, not automatically

**Found while drafting:** Production MIP draft 1, against the September 2026 idea that module creators earn a percentage of the settlements they take part in, and F34 (a plain tip carries no module fees).

**Suggested (Claude), accepted (Production review, with Nobody, allegedly):** creators earn through standing fee offers, consent by whoever bears the cost, and role shares for the modules a payment ran through (evidenced by the receipt). Nothing is taken from a payment without a signature.

**Also in Production MIP draft 1 (Claude):** a specification is a publication whose content has a small CDDL header (kind, creator, tasks, types, dependencies, implements, verification rules, fee terms, predecessor) plus the canonical text; the full table of core tasks with what each accepts and produces; no core registry, discovery through use.

## F43. Extensions: the special task for work nobody foresaw

**Found while exploring:** Production MIP draft 1. Tasks exist only where the MIPs define them, so the frozen core cannot list every future need.

**Decided (Nobody, allegedly):** "extension" is the right name.

**Resolution (suggested by Claude, accepted by Nobody, allegedly):**
- New kinds of things need no task: a cMIP may define new act types built from core pieces; non-adopters show them as unknown.
- An agreement may name any number of extensions by spec hash, besides one cMIP per task. A client that does not implement every named extension cannot sign.
- Add, never subtract: an extension may add rules, never relax the core's (conservation, stake rule, required signatures, keeper and rotation rules, fail-closed). An act valid under an extension but invalid under the core is rejected.
- Extensions in wide use are the natural candidates for tasks in MOR 2.

**Written into:** Production MIP draft 1 (rules 8a to 8d), Law MIP draft 2 (terms field 15, rule 2).

## F44. Production review decisions (discussed point by point with Nobody, allegedly)

- **MIPs have no creator (decided).** A spec hash covers the creator's identity hash, but every identity's acts name the Identity MIP by its hash, so neither could be computed first. MIPs are the protocol itself: a MIP's hash covers its content alone; its publishing act shows who published it. New kind 4, MIP, with no creator field. cMIPs and Modules keep the creator field, so names cannot collide or be stolen.
- **F40 revised (decided provisionally, for technical reviewers):** verification rules are programs for the RISC-V base integer instruction set with multiplication (RV32IM or RV64IM), fixed memory, an exact step budget (one step per instruction), no clocks, networks or randomness; input the act and the data it names, output valid, invalid, pending or unknown; exceeding the budget answers unknown everywhere. Reasons: frozen ratified base sets, integer-only determinism, exact metering, alignment with zero-knowledge machines, precedent in on-chain verification (CKB-VM). WebAssembly remains the main alternative.
- **The rule decides validity; the text explains it (decided).** A mismatch is a bug, fixed by a new specification naming the old one as predecessor; the faulty one stays on record.
- **Signing what it computes (decided):** before signing anything that runs through a rule (split plan, fee terms, condition), the client shows what the rule computes on a concrete example. Extends "what you sign is what you saw".
- **F41 and F42 accepted.**

**Written into:** Production MIP draft 2.

## MOR 0.1: first builds to test the core (Nobody, allegedly, from the Genesis discussion)

**Decided (Nobody, allegedly):** a few things will be built to test the design:
- **Home relay:** stores identity chains, checks rotations, signs receipts; objections, audits.
- **Basic relay:** stores and serves locked acts without reading them.
- **Genesis client:** the client that creates identities (genesis, rotation), with the air-gapped safety key Module on an offline device.
- **Basic client:** text, public posts, private messages, encryption keys, links; possibly tips through one payment module.
- **Read-only client:** to share the documents (the closed, read-only genesis repository).

**Suggested order (Claude):** the two relays, then the genesis client, then the read-only client (early value: sharing the documents, possibly published as MOR publications, with the MIPs as creator-less specifications), then the basic client.

**Air-gapped safety key spec note:** confirmed by Nobody, allegedly as a Module, not core (claude/module-airgap-safety-signer-draft-1.md); the four review adjustments await confirmation.

## Documents redrafted (26 September 2026)

**Decided (Nobody, allegedly):** everything is folded in, and all documents prior to the MIPs are redrafted with the new understanding in mind.

**Written:** core v10 (claude/02-MOR-core-v10.md), freeze test suite v9 (claude/03-MOR-freeze-test-suite-v9.md, with a new scenario 8 on specifications and updated scenarios 1 to 7), MOR in one page v2 (claude/07-MOR-in-one-page-v2.md), Who can earn on MOR v3 (claude/05-MOR-who-can-earn-v3.md). They supersede core v9, freeze suite v8, in one page v1 and who can earn v2. The findings log remains the record of why.

## Next: two review rounds, then build (Nobody, allegedly)

**Decided (Nobody, allegedly):** two rounds of review before building: first a fresh-eye review by Opus, then Fable's adversarial review. Then MOR 0.1 is built.

## Review round 1 (fresh eyes), received 27 September 2026

**Source:** claude/MOR-review-round-1.md, from the separate review project, with Claude's triage. 3 critical, 7 important, and minor findings; all checked and holding. Decisions pending with Nobody, allegedly: C2, C3, I1, I3, I5, I6. Proposed fixes for the rest to be applied in one consolidated revision after the decisions.

## F45. Receipts under a cosigned summary survive the operator's rotation (review C2)

**Found in review round 1 (C2):** receipts are the operator's everyday acts, so an operator's rotation could void its past receipts (by mistake or on purpose), making customers' rotations stop counting, and every later rotation with them.

**Decided (Nobody, allegedly):** option A.
- A receipt included under a cosigned log summary can never be voided by the operator's rotation. Auditors are the guarantee.
- A receipt voided by the operator's rotation but acknowledged by someone makes that chain position contested; it never counts as support toward a home rule.
- Identities without auditors keep trusting their home, as before.

**Reason (Claude, accepted):** option B (protect everything before the last published summary) would let a thief holding the operator's key publish a summary containing forged receipts that the operator could then never void.

**To apply in:** Identity (receipt check 4, conflicting receipts, which rotation counts).

## F46. Publications have no payee pointer; payment goes to the publisher's (review C3)

**Found in review round 1 (C3):** Finance let a payee pointer belong to a publication, but never said who may sign it, so a stranger or one co-owner could redirect a song's money, and a Finance-only wallet had no rule to reject it.

**Decided (Nobody, allegedly):** a publication does not have a pointer of its own. Payment goes to the pointer of whoever published it: a solo creator's own pointer, or a collective's. Where there are splits, the publisher's pointer leads to their split service, under Law. It works with grants too: a publication made under a grant pays the identity that granted it.

**Consequences:** only identities (collectives included) have payee pointers, each signed only with that identity's own key. A Finance-only wallet checks the publication's signer (or the granting identity), then that identity's pointer. The publication keeps its price. The vault rules apply as for any identity.

**To apply in:** Finance (payee pointer field 0 and definitions), Envelope and Law references to publication pointers, core v10.

## F47. Acknowledged thief acts are disputes, not invalid (review I1)

**Found in review round 1 (I1):** freeze suite scenario 1 step 5 said a thief's act a friend acknowledged becomes invalid; Identity rule 17, Envelope and Law say an acknowledged act outside the kept ancestry becomes a visible dispute.

**Decided (Nobody, allegedly):** keep the rule, fix the scenario. Nothing someone relied on disappears silently; an accomplice's acknowledgement turns a thief's act into visible noise, never into a valid act.

**To apply in:** freeze test suite scenario 1 step 5.

## F48. A collective's safety key is split; no rotation may need every member (review I3)

**Found in review round 1 (I3):** threshold signing exists for the everyday schnorr key (FROST), but not in practice for the post-quantum safety key (SLH-DSA). And a key grammar requiring every member for a rotation traps the collective if one member leaves or dies.

**Decided (Nobody, allegedly):** split the key ("great solution if it works"; to confirm with technical reviewers).
- A collective's safety key is split into shares, any k of n members, with k always smaller than n. At rotation, k members bring their shares to one offline device, which rebuilds the key, signs once, and forgets it. For that moment one device holds the whole key; that is the price.
- No key grammar may require every member for a rotation.

**Open (Nobody, allegedly):** succession needs to be ironed out.

## F49. Succession inside agreements: the core gives the language (review I3 follow-up)

**Decided (Nobody, allegedly):**
- A member can name stake successors and key (seat) successors, which may be the same person.
- Both are divisible: stakes split among several successors (summing exactly, like any stake); the seat can be split too, for example two successors each with a minority vote and their own key share.
- When succession triggers, the agreement is cloned, the new signing authorities confirm it, and newcomers' positions are defined at that moment (a position pays for a seat without ownership, so a trusted person can hold a seat while heirs hold the stake).
- The succession plan lives inside the agreement, as part of its signed terms; changing it takes a clone the other members see and sign.
- The core does not need to handle complex successions as such; it needs the language for handling them. Death is a complex issue to solve, left to the parties, their named authorities and verifying modules.

**Resolution (Claude, accepted):** triggers are the member's own act while alive, or, after a death, the abandonment clause (the named authority declares absence and the plan executes). After a seat change, the collective rotates and re-splits its safety key to include the new key holders. Identity-level succession (declared in a rotation) remains the fallback where no plan exists.

**To apply in:** Law (terms: succession plan field; succession trigger; clone on succession; key re-split for collectives).

## F50. Payout fees and amounts too small to send (review I5)

**Found in review round 1 (I5):** splits must sum exactly, but each payout is a separate payment on a rail with fees and minimum amounts; nothing said who bears the fee, whether a payout net of fee counts as paid, or what happens to amounts below a rail's minimum.

**Decided (Nobody, allegedly):** always hold what cannot be moved, until it can be moved. cMIPs and modules that solve this kind of problem will be popular.

**Resolution (suggested by Claude, accepted):**
- The split plan declares who bears payout fees: the receiver (default, each payout arriving net of its own rail fee) or the split service, as part of its cut. A payout counts as discharged when its receipt shows the amount minus the declared fee.
- Amounts below a rail's minimum are held as an open obligation of the split service and paid once they add up to enough: visible, never lost.

**Also clarified (the author's side question):** a cMIP or module cannot force a fee on a path that leads to a discharge. Nothing is taken without the signature of whoever bears the cost; a module's fee terms are a standing offer, and a skipped fee is made visible, not prevented. Hops that are themselves parties (a conversion service, the rail) charge through the agreement or rate the payer's route accepted. A service may refuse to serve unless paid: that is the market, not forcing.

**To apply in:** Law (split plan: fee bearer; held amounts), Finance (a payout discharged net of the declared fee).

## F51. Developers cannot force fees; why clients pass shares on anyway (review I5 follow-up)

**Explored:** whether a cMIP could declare a required fee, making an agreement that names it without the fee invalid.

**Decided (Nobody, allegedly):** no. The same copying problem exists for media, but a cMIP would be cloned in a second and the compulsory fee removed, so a required fee would promise developers something the core cannot deliver. F42 stands: creators earn through signed terms, never by force.

**What developers can earn from (Claude, accepted):** running services (uptime and reputation cannot be cloned); being the trusted, maintained original (hash and creator visible); bounties before building; rewards after, by choice, since receipts name every module a payment ran through. Selling an implementation locked like any work is possible; verification rules stay public.

**Why a client developer sets default shares for cMIPs, in the author's order:**
1. Funding the maintainers: the cMIPs a client runs carry its users' money; unmaintained rules are a risk to the client's reputation. The strongest case.
2. Developing an R&D network: paying the builders grows the pool of people building what the client will need next.
3. Signalling.
Also noted: default shares come out of the owners' split, not the client developer's pocket; clients earn through the app share, a role share that exists only if the norm holds; receipts make stripping visible.

**To apply in:** Who can earn on MOR (module and client developers).

## F52. When a homeless rotation becomes final (review I6)

**Found in review round 1 (I6):** a homeless rotation could be overturned at any time by a late objection or late receipts, so everything built on it stayed provisional; and a client's own failed attempt to reach the home gave different answers to different clients.

**Decided (Nobody, allegedly):** as suggested.
- A homeless rotation becomes final once the owner's declared auditors attest the home's absence and the rotation is anchored on a time reference. After that, a late objection or receipt cannot overturn it.
- A homeless rotation without audit stays provisional: keepers, vault payments and agreements must not rely on it; everyday posts and messages may.

**To apply in:** Identity (homeless rotation procedure and rules).

## Consolidated revision after review round 1 (27 September 2026)

**Applied:** decisions F45 to F52, and the proposed fixes from the round 1 triage (C1 kept tips with position and summary; I2 escape after a refused rotation and the corrected single-use reason; I4 global task numbers; I7 deadlines need an anchor or keeper; the minor items, including "vault limit" replacing "spending limit").

**New versions:** Identity MIP draft 6, Text MIP draft 4, Envelope MIP draft 3, Finance MIP draft 4, Law MIP draft 3, Production MIP draft 3, core v11, freeze test suite v10, MOR in one page v3, Who can earn on MOR v4, air-gapped safety key Module draft 2. They supersede the previous versions.

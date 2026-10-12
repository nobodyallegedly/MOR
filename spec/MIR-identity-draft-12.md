# MIR: Identity

*Draft 12, 12 October 2026: a transition draft, for Nobody, allegedly, to review and approve (F251). It is draft 11 (approved 5 October 2026, revised in place since, last for F168) written for plain reading, in Agreements draft 11's and Money draft 7's style. **It changes no rule.** How an identity runs most of the time comes first (genesis, everyday acts, homes, a rotation as it usually runs) and the mechanics of rare cases after (chain signatures, succession, competing rotations, homeless rotations, escape, finality, audit); the rules are numbered afresh in reading order, each with its old number beside it. Written against core v21, Envelopes MIR draft 7, Text MIR draft 6, Money MIR draft 7, Agreements MIR draft 11, Development MIR draft 6 and the findings F1 to F266. The record of how each rule came about (the revision notes of drafts 1 to 11, the "revised in place" notes, and the list of choices decided in drafts 2 to 11 with the dates and words of each decision) stays in draft 11 and in the findings log; this draft does not repeat it. The freeze-ready draft that follows drops the old numbers.*

## How to read this draft

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A summary that starts *In short* repeats what the rule says; where the two seem to differ, the rule's own text decides.

Each rule shows its number in draft 11 beside its new number: "Rule 9 (was 18a)". The table at the end maps every old number to its new one. Code comments, tests, records and the other drafts (the core document, the freeze test suite, Agreements draft 11 and Money draft 7 among them) keep citing the old numbers until the freeze-ready draft; the table is how to find them here. Agreements rules are cited here by draft 11's numbers, and Money rules by draft 7's; their own tables map the older ones.

The checks a verifier runs keep their names and their step numbers from draft 11 ("everyday check 2", "receipt check 6", "homeless procedure, step 4"), so that citations of them stay valid. Each now stands beside the rules it serves.

Some marks recur, and each matters to the next review:

- *Client conformance:* a duty or permission of clients (the owner's client, a reader's client, a key Module). The protocol cannot check it from acts alone, so it is stated for builders.
- *Stated cost:* a weakness the rules accept knowingly, written down so nobody mistakes it for an oversight.
- **Re-homed without audit:** an answer that rests on the verifier's own failed attempt to reach a home. It is said, and nothing binding rests on it (the paragraph after rule 35).

The MIR has four parts. Part one is an identity as it runs most of the time: genesis, signing, everyday acts, homes and receipts, a rotation and what it keeps. Part two is the rare cases: chain signatures, succession, competing rotations, homeless rotations, escape with both keys, finality, and audit. Part three is the encoding and the act formats, for reference. Part four is the tasks, the reasoning, the open parameters and the freeze scenarios.

## Purpose

Identity is the ground layer of MOR. It defines what an identity is, how it is born, how its keys are replaced, where others check it, how others reach it, and how it relates to other identities. Every act in MOR is signed in the name of an identity, so every client implements this MIR.

The identity hash is the identity. It never changes. Keys are only the pens that sign for it, and are replaced by rotation. The home is where anyone holding the hash learns which pen currently speaks for it, and where its content and its inbox can be found.

## Dependencies

None beneath it. Identity defines the envelope as far as it needs it; the Envelopes MIR completes it. It refers upward in two places only: acknowledgements (Envelopes) and keeper records (Agreements) can give an act standing after a rotation. Nothing in this MIR requires a client to hold data from a higher layer: every rule here is decided from identity chains, receipts, summaries and the acts a verifier already holds.

## Words used in this MIR

### Acts and keys

- **Act.** Any signed object.
- **Envelopes.** The signed container of an act.
- **Identity hash.** The hash of an identity's genesis act. It is the identity.
- **Signing key.** The key that signs everyday acts. It cannot change the identity chain.
- **Chain key.** A key from a post-quantum family, committed in advance by its hash, revealed and used once, to sign a rotation or a chain signature.
- **Scoped key.** A key of an identity that an act of a higher MIR installs, limited to a scope that MIR defines: a grant key, a collective's or a person's (a payee's grant to a deal's split service among them, F129), installed by its grant and removed by its revocation (Agreements, F128). It signs everyday acts in the identity's name, never an identity-chain act, and only that MIR says whether it counts. *It is added and removed by everyday acts of the identity's signing key (for a grant key, the grant and its revocation), never by a rotation: no chain key is spent on it. The act that installed it is judged by the next rotation like any act of the key it replaces (rules 33 to 35), so a scoped key installed by a thief who stole the signing key is void once the owner rotates without keeping it.*

### Chains and sequences

- **Identity chain.** Genesis followed by the identity's rotations and chain signatures, each naming the one before. Only the chain key adds to it. Genesis is position 0.
- **Sequence.** A line of everyday acts by one identity, each naming the previous act in the line. An identity may keep one sequence or several; the split is the owner's choice.
- **Kept ancestry.** The acts a rotation names as the latest genuine act of each sequence, and every act they descend from. For each tip, the rotation carries its position and the running summary including it, so anyone can prove an act lies in the kept ancestry without opening any private act.
- **Chain signature.** An act on the identity chain, signed with the revealed chain key, that names another act and commits the next chain key, and changes nothing else (F132). *The one line of an identity that never branches is its identity chain; a signature placed there is ordered against every other one of the same identity, whatever devices the identity uses. A higher MIR says which of its acts need one: Agreements' forks and closings.*

### Homes

- **Home.** A relay that focuses on the Identity MIR: it stores identity chains and serves them. A relay is not an identity; it is operated by one, a person or organisation with an ordinary MOR identity of its own, which signs everything the home states. A home is declared by its operator's identity hash plus the relay's address. It verifies what it stores and signs receipts for it, but never signs on the owner's behalf. "Home" names a role, not a size.
- **Operator.** The identity that runs a home or an auditing relay and signs its receipts, log summaries, objections and absence statements. Homes are counted per operator.
- **Self-hosted home.** A home operated by the identity itself. A self-hosted identity is trusted on its own signatures: its rotations count without receipts.
- **Receipt.** A home's signed statement that it holds a given identity-chain act, at a given position in that chain, recorded at a given position in the home's own log, and that it is the first valid act the home accepted at that chain position. The home's log position is a sequence number, never a time. A receipt counts only alongside the act it names.
- **Home rule.** The identity's declared rule for which homes count.
- **Log summary.** A home's signed summary of its whole log of receipts, as a Merkle tree root.
- **Audit.** Another home checking that a home's new log summary extends the previous one, and cosigning it. An identity may require that its receipts be audited.

### Reaching an identity and relating to others

- **Route.** Where the identity's content of a given type can be found (an outbox route), or where others deliver acts addressed to the identity (an inbox route).
- **Link.** A two-way statement, a claim by one side and a confirmation by the other, that two identities belong to the same entity. One side may be an account on another protocol. Its purpose is to let other protocols and services bind their accounts to a MOR identity, such as signing in with MOR, and to let anyone who wishes build bridges.
- **Succession.** A declaration, carried in a rotation, naming the identity that succeeds this one.

### Rare cases

- **Homeless rotation.** A rotation signed with the current chain key that names new homes and counts without receipts from the old ones, when those homes are gone.
- **Closure.** A declaration, carried in a rotation of a home's operator, that the home stops serving every identity.

## Part one: an identity as it runs most of the time

*How it runs most of the time:* an owner's client makes a genesis, which names a first signing key, commits to a first chain key and declares one or more homes. The identity hash is the genesis act's id. The owner then signs everyday acts with the signing key, each bound to the identity-chain act that set that key. The homes store the identity chain and sign a receipt for each act on it. Rarely, the owner rotates: the chain key, kept offline, signs a rotation that installs a new signing key, commits the next chain key and names the latest genuine act of each sequence. The rotation counts once the homes the home rule requires have receipted it; acts it does not keep, or disowns, are void, unless another identity acknowledged them or a named keeper recorded them.

### 1. An identity is born

#### Rule 1 (was 4). Genesis

Genesis MUST be signed by the signing key it declares, and MUST declare at least one home.

*Forging a genesis only creates a different identity, never a copy of an existing one, because the identity hash fixes the original.*

#### Rule 2 (was 5). Several homes: the home rule, and its default

With several homes, genesis MAY declare a home rule, in one of two forms: one named authoritative home, or a threshold greater than half the distinct operators of the declared homes.

If it declares none, the default applies:

- the majority rule, with a threshold greater than half the distinct operators, computed from the home list;
- or, when one of the homes is self-hosted, that home is authoritative and the others are backups (F59, F62).

*One option is forced when none is selected; the default is always one of the declared forms, never a third, weaker rule.*

#### Rule 3 (was 10f). A single home's security is the owner's

An owner who relies on a single home or an authoritative home SHOULD be told plainly that the home's key security is effectively part of their own.

#### Rule 4 (was 22a). Self-hosting is a trust model

A self-hosted identity is trusted on its own signatures: its rotation counts with no receipt and no first-held-wins. A thief holding its chain key wins at once, as at a single lax home.

*Self-hosting is a trust model, not a home like any other; the risk is the owner's choice, and other homes declared beside a self-host are backups by default (F62).*

#### The genesis checks

1. `signer`, `binding`, `prev` and `objects` are absent.
2. The key in the signature equals the signing key in the payload.
3. At least one home is declared.
4. If a home rule is present: the homes have at least two distinct operators; an index is lower than the number of homes; a threshold is greater than half the number of distinct operators and no greater than that number. Homes are counted per operator: several homes run by one operator count as one, since one stolen key signs for all of them.
5. If an audit requirement is present: at least one auditor is declared, and the threshold is at least one and no greater than the number of auditors.

### 2. Signing: keys and bindings

*In short: every act has one signer. Everyday acts are signed with the signing key and bound to the identity-chain act that set it; only the chain key adds to the identity chain; a scoped key, installed by a higher MIR, signs everyday acts whose standing that MIR decides.*

Every act has exactly one signer. An act that needs the agreement of two identities, such as a link, is made of two acts: one by each, the second naming the first.

#### The verification procedures

The verification procedures are, in draft 11's order: the checks on every act (this section), genesis (section 1), rotation (section 5), chain signature (section 7), everyday acts (this section), receipt (section 4), conflicting receipts (section 9), log summaries and audits (section 13), the homeless procedure (section 10), objection and absence statement (section 10), resolving an operator (section 4), which rotation counts (section 5), and which value counts: declarations, succession, routes, names and links (section 3). Each now stands beside the rules it serves. A verifier runs these checks in order. Any failure makes the act invalid.

#### Rule 5 (was 1). The verifier runs the checks

A verifier MUST run the verification procedures of this MIR. In particular, it MUST check that the signature is valid for the key it names, and that the binding names an act in the signer's identity chain that bound that key.


#### Rule 6 (was 3). A signing key never adds to the identity chain

A signing key MUST NOT sign acts that add to the identity chain.

#### Rule 7 (was 2). A chain key signs only rotations and chain signatures

An act signed with a chain key MUST be a rotation or a chain signature (F132). Any other act signed with a chain key is invalid.

#### Rule 8 (was 1a). Scoped keys

*In short: Identity checks only a scoped key's signature; the higher MIR that installed the key judges the act.*

An everyday act signed with a scoped key is valid under Identity only as far as its signature: its status is "scoped", and the higher MIR whose act its `binding` names judges it (for a grant key, Agreements rules 73 to 80; F128).

A client that does not implement that MIR MUST show the act as unknown, never as valid (rule 9).

A scoped key never signs an Identity act, nor an act that adds to the identity chain; it never counts as the identity's signing key in a rotation's judgement (rules 33 to 35).

*Identity cannot read Agreements (a lower layer never depends on a higher one), so it carries the key's signature and leaves the key's standing to the MIR that installed it, as it carries declarations whose kinds higher MIRs define (rule 31). Stated cost: a client without Agreements cannot tell that a grant key is the collective's; it shows the act as unknown.*


#### Rule 9 (was 18a). A client implements every MIR it acts on

A client MUST implement every MIR that defines an act it acts on. A client that meets an act defined by a MIR it does not implement MUST show that act as unknown, never as valid. In particular, a client that acts on agreements MUST implement Agreements.

#### The checks on every act

These run on every act.

1. Decode the act; reject it unless it is deterministic CBOR in the Envelopes MIR's shape.
2. Check that it is public: its content key is on the outside, and it opens the inside, which matches the inside commitment.
3. Compute the act id from the outside.
4. Check that the scheme is one this client implements and the signature is valid for the act id under the key in the signature. A scheme this client does not implement makes the act unknown, not invalid.


#### The everyday checks (types 2 to 15)

1. `signer` and `binding` are present, and `prev` is present.
2. `binding` names an act of the signer's identity chain that counts, genesis or a rotation, never a chain signature, and the key in the signature equals the signing key that act set; or, for an act signed with a scoped key (F128), `binding` names a held act of a higher MIR, never an Identity act nor the act itself, and the signature is valid for the key it names: the act's status is then **scoped**, and the MIR that defines the binding act says whether that act installs that key for the signer, and whether the act counts (rule 8).
3. If a later rotation of the signer counts, the act's status follows rules 33 to 35. A rotation judges only acts signed with the key it replaces, never an act signed with a scoped key.


### 3. Everyday acts: witness, routes, names and links

*In short: an identity's everyday acts say where to find it (routes), what it is called (names), who else it is (links), and what it relies on (witness acts). All are public, except that a link may be private.*

#### Every act of this MIR is public, except a private link

Every act defined by this MIR is public, except a private link: its content key travels on its outside, so homes, auditors and anyone checking an identity can open it. They are the public face of an identity (F29).

A link's claim, confirmation and termination (types 6 to 8) may instead be private, encrypted as the Envelopes MIR defines, their key delivered only to whoever should see them (F7, F134). For a private link act:

- It counts only if its sealed form is published at the homes its signer's chain names at the link act's binding (its place in that chain); a later move of homes does not void it (F152, F159).
- What a verifier found at those homes is an input like its own attempts: a link gives no authority (rule 16), so a link never decides anything binding, and its standing from one verifier's fetch is never needed for anything that does (F168).
- A link nobody can fetch from those homes is unknown, never invalid.
- A link voided by a rotation is void whether or not it was fetched: the rotation is judged first (F168).
- A private link act signed by a scoped key is invalid (rule 8; F168).

Only key holders can tell a private act's type, so a verifier that opens a private Identity act of any other type refuses it (F134, F152).

*A link carries no key event, so no home or auditor needs to open it to follow an identity's keys. Its content stays private, but its existence is public, so an owner whose stolen key confirmed a link sees an act they did not write and can rotate; a link shown only to one party would let a thief use the key and leave nothing to notice. Stated cost: anyone can see that a private link act exists, never with whom.*

#### Rule 10 (was 18b). Witness acts

A witness act MUST carry `acks`, naming at least one act, and MUST NOT carry `objects`; its payload is empty. Otherwise it is invalid. An act it names that is its own signer's is not acknowledged by it (Envelopes: an acknowledgement names another identity's act).

A witness act says only: **"I received this act and rely on it."** It is the one act whose whole purpose is acknowledgement (F110).

*It brings back, deliberately, what a like must never do: relying on a post or a message that nobody paid for or signed around (a public promise, a threat kept as evidence, a statement someone relies on). It keeps the acts it names visible as disputes if their signer later disowns them (rule 34), and it is the natural carrier for the acknowledgement of a voided home receipt (receipt check 6, F95). Like every act this MIR defines, it is public: it shows anyone which acts its signer relies on, never what they say.*

#### Rule 11 (was 18c). A witness act is never a side effect

*Client conformance.* A client MUST NOT sign a witness act as a side effect of another gesture (a like, a reply, opening or saving a message). Before signing one, it MUST say what it does, in plain words, for example: "This keeps the act visible as disputed even if its author later disowns it. It is public: anyone can see that you rely on this act, though not what it says."

*No verifier can check that a client did this; it is conformance, not validity, like the Text MIR's rule that what you sign is what you saw.*

#### Rule 12 (was 38). Anyone can find anyone

Any two identities can find each other without already sharing a relay: an identity's home is known from its declaration, anyone can query the home, and the home serves the routes, which may include an inbox. An act counts for a verifier only once the verifier holds it; nothing forces propagation, and delivery is the signer's interest (Envelopes).


#### Rule 13 (was 39). A stolen signing key and the inbox

A thief holding the signing key can redirect the inbox route until the owner rotates, as with the encryption key (Envelopes). Deliveries made into that window go where the thief pointed; the rotation voids the thief's routes act, and the sender re-delivers.

*The window is the same one the encryption key already has; no new exposure.*

#### Rule 14 (was 23). A link needs both sides

A link counts only when both sides have signed: the claim and a confirmation, in MOR or through a proof from the other protocol. A claim without a confirmation is not a link, and clients MUST NOT display it next to the identity it names.

#### Rule 15 (was 24). Either side may end a link

Either side MAY end a link alone. The ending applies to every act that holds the termination in its history; it does not erase that the link existed (F152).

*There is no clock to say what comes after the ending; what an act cites says whether its signer had seen it.*

#### Rule 16 (was 25). A link gives no authority

A link gives no authority. Delegated authority uses grants (Agreements).

#### Rule 17 (was 26). Private links

Copies of a private link MUST be encrypted separately, so that stored copies cannot be matched to each other. Each half of a link counts once its sealed form is published at its signer's homes (F152, F159); an owner who holds back one half delays the link, which counts only once both are published (rule 14; F168).

#### Which value counts: declarations, succession, routes, names and links

A disputed act never counts when choosing the latest value of anything below. *An act is disputed only by the rotation rules of this MIR (rules 33 to 35). No act of a higher layer changes that status; a contest (Agreements) is an objection shown alongside what it names and changes nothing here (F69).*

1. **Declarations:** for each spec and kind, the entry in the counting identity-chain act with the highest position counts. A null value means the kind is not declared.
2. **Succession:** the successor field in the counting rotation with the highest position that carries one counts; null means no succession.
3. **Routes:** follow the routes chain from version 1; each act must name the previous one and carry its version plus one. The latest act of an unbroken, unforked chain counts. If two valid routes acts name the same predecessor, the routes are contested from that point: clients use the last act before the fork and warn the owner, who settles it by rotating. A fork behind an act the owner's later rotation kept is settled by that rotation; clients need not rewind past it.
4. **Names:** a name counts while its name act is valid and no valid withdrawal by the same identity names it.
5. **Links:** a link counts when a valid claim and a valid confirmation by the identity it names both exist, and no valid termination by either side names the claim.

### 4. Homes and receipts

*In short: a home verifies what it stores, keeps every valid rotation it accepted, and signs a receipt for each identity-chain act. Receipts, not a home's unsigned answers, are what clients should rely on. A home may set its own acceptance conditions; a condition tied to a device has a cost the owner must be told.*

#### Rule 18 (was 9). A home checks before it stores

A home MUST check a rotation's validity before storing it, and MUST NOT store an invalid one.

#### Rule 19 (was 10). A home keeps and serves

A home MUST NOT drop a valid rotation it has accepted, and MUST serve the full identity chain it holds.

#### Rule 20 (was 10a). A receipt for every chain act

A home MUST sign a receipt for every identity-chain act it accepts, and MUST serve its receipts with the chain.

#### Rule 21 (was 10c). Rely on receipts

Clients SHOULD rely on receipts, not on a home's unsigned answers.

#### Rule 22 (was 13). What a home serves besides the chain

A home SHOULD store and serve the identity's latest routes act, name acts and public links, and MUST store and serve the sealed form of its private links, since a private link counts only where it is published (F152, F159).

#### Rule 23 (was 14). Consult the homes

A client SHOULD consult the homes before relying on an identity's act. Keepers MUST (see Agreements).

#### Rule 24 (was 12). A home's own acceptance conditions

A home MAY apply its own conditions before accepting a rotation (for example proof of a registered device). A home's acceptance conditions can refuse the owner as well as a thief.

Where a condition depends on a device the owner may lose, losing that device at a single or authoritative home can mean losing the identity: the normal rotation is refused, the homeless rotation is objected to, and the escape needs the signing key that was on the device.

*That risk is the owner's choice, and it is survivable exactly when the signing seed is backed up apart from the device (rule 32).*

#### Rule 25 (was 12a). Device-bound policies are never the default

*Client conformance.* A client MUST NOT choose a device-bound acceptance policy at a single or authoritative home by default. Where the owner chooses one, the client MUST say what it costs, and SHOULD require a backup of the signing seed first.

#### The receipt checks

1. **The receipt names a real act.** The verifier holds the identity-chain act the receipt names; that act passes the checks for its type (genesis, rotation or chain signature); its identity hash, or its signer, is the identity the receipt names; and its position is the position the receipt states. A receipt that fails this check is neither support nor conflict: it is ignored for every purpose below.
2. The receipt is valid as an everyday act of the home's operator.
3. The home is declared in the home set in effect for that chain position: the homes set by the identity-chain act at the position before; or, for a homeless rotation, a home in the new set it declares (homeless procedure, step 5). *A homeless rotation leaves homes that are gone, so its receipts can only come from the homes it names (F86).*
4. If audit is required: an inclusion proof shows the receipt at its log position under a log summary of the home carrying at least the required number of valid cosignatures from the declared auditors. Otherwise the receipt does not count. The audit requirement that applies is the one the named rotation itself declares, or, if it declares none, the one in effect before it.
5. A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary: a receipt under a cosigned summary can never be voided by the operator's rotation.
6. A receipt voided by the operator's rotation that another identity acknowledged is shown as contesting that chain position. It never counts as support toward a home rule, and it blocks nothing: the home's other receipts at that position are judged as before (F95). *An accomplice's acknowledgement turns a thief's receipt into a visible dispute, never into a veto.*

A self-hosted home signs no receipts: the rotation the identity itself serves stands in for one (see "Which rotation counts", section 5).


#### Resolving an operator

To check a receipt, a verifier needs the operator's identity chain, which it obtains from the operator's own homes, like any identity's. A self-hosted identity is resolved from its own home, on its own signatures. When resolving operators leads back to an identity already being resolved, the verifier accepts that identity's chain on its own signatures, as for a self-hosted identity.

#### A home's address

An address hint is where the home can currently be reached. It is not checked: the operator's identity is what counts, and the operator announces a new address through its own routes, so a home can move servers without any owner rotating. A null operator means self-hosting: the identity runs its own home. Several null entries count as one operator, the identity itself; an identity naming its own hash as operator in a rotation is the same as a null entry. *Genesis needs the null form because it cannot name its own identity hash, which does not exist yet.*

### 5. A rotation as it usually runs

*In short: the owner's chain key, revealed once, signs a rotation naming the identity-chain act before it. The rotation installs a new signing key, commits the next chain key, and names the latest genuine act of each sequence. The owner's client sends the same bytes to every home. A home that accepts a rotation holds the first valid one revealing that chain key, rejects any other, and receipts it; the rotation counts once the receipts the home rule requires exist.*

#### Rule 26 (was 8). Why an owner rotates is the owner's business

The protocol does not restrict why an owner rotates. Rotation is expected to be rare.

#### Rule 27 (was 6). A valid rotation

A rotation is valid only if:

- it names as its predecessor the identity-chain act at its own position minus one;
- the hash of the revealed chain key equals the hash committed by that predecessor;
- its signature is valid under the revealed key;
- and it commits the hash of a next chain key.

#### Rule 28 (was 7). A rotation counts once the homes receipt it

A rotation counts once receipts from the homes required by the home rule show they hold it. Until then it is pending, and acts under its new key are pending too.

Receipts are proof, not permission: a home that holds a valid rotation cannot withhold its receipt without breaking rule 20. *A withheld receipt leaves no evidence, though, which is one reason to declare several homes.* *Anyone who accepts an act under a pending key does so at their own risk, since the rotation may never count.*

A self-hosted identity's rotation counts on the rotation alone.

#### Rule 29 (was 8a). One chain key, one rotation

*Client conformance.* A client MUST submit the exact same rotation bytes to every home, including when resubmitting after a refusal, and MUST NOT sign a second, different rotation or chain signature with the same chain key.

Two exceptions, each allowed once:

- after a homeless rotation is voided by an objection, the owner MAY sign one normal rotation with the same chain key;
- after a normal rotation is refused by the homes that count, the owner MAY sign one endorsed homeless rotation (an escape) with the same chain key, whose endorsement lists the refused rotation as abandoned.

*SLH-DSA is stateless and is not weakened by a few signatures; the single-use rule exists so that an owner never has two competing rotations in play. "Each allowed once" cannot be checked by a verifier; it is a client and Module rule, and the air-gapped chain key Module enforces it.*

#### Rule 30 (was 11). First held wins, at each home

A home that holds a valid rotation or chain signature MUST reject any other rotation or chain signature revealing the same chain key. The first valid rotation a home holds wins at that home, and its receipt fixes that order.

#### Rule 31 (was 8b). Declarations ride on the chain key

An entry in the declarations slot is valid only in genesis or in a rotation that counts. The latest such entry of each kind counts; a null value removes the kind. Higher MIRs define the kinds and what they mean.

#### Rule 32 (was 37). Keep the two keys apart, and back both up

Clients and key Modules SHOULD keep the signing key and the chain key separate, from separate seeds and on separate devices where possible, and SHOULD back up both seeds.

*Holding both keys is the strongest proof of ownership the protocol sees, so a thief who steals both can also leave the owner's careful homes; and a backed-up signing seed is what makes a lost device survivable at a strict home.*

#### The rotation checks

1. `signer` is present; `binding` and `prev` are absent.
2. The previous act named is the signer's identity-chain act at position (this position minus one).
3. The signature's scheme and key hash to the chain-key commitment of that previous act: `tagged_hash("MOR/safety", scheme || key)` equals it.
4. A new signing key and a next chain-key commitment are present.
5. Any new home rule or audit requirement meets the conditions for genesis, counted against the new set of homes if one is given. A home rule the rotation leaves in place must meet them too, against the new set of homes; if it does not, the rotation is invalid (F94). *The owner's client sends a rule that fits, or null for the default, whenever it changes the homes; it never quietly changes a protection the owner chose.*
6. A closure flag is valid on any rotation; it has effect only for identities whose declared homes name the signer as operator.

#### Which rotation counts

For each position n of an identity chain, starting at 1 (a chain signature counts at its position exactly as a rotation does, and "rotation" below includes it, save where it says homeless):

1. Take the home set and home rule in effect: those set by the act that counts at position n minus one. If several homes are declared and no rule, the default rule of rule 2 applies.
2. Collect the receipts for position n from those homes that pass the receipt checks. Leave out receipts that are void, receipts in a standing conflict, and every receipt from a home proven dishonest for this identity at an earlier position. For a self-hosted home, the rotation the identity itself serves at position n stands in for a receipt; two different rotations served at one position are a conflict.
3. Apply the rule:
   - **One home, or an authoritative home:** the rotation that home has a receipt for counts.
   - **Threshold k:** a rotation counts if homes of at least k distinct operators have receipts for it.
4. If no rotation counts at position n under the rule, a homeless rotation at n may count under the homeless procedure (section 10).
5. If nothing counts at position n, later positions are not evaluated: the latest act that counts is the one at n minus one.

### 6. What a rotation keeps

*In short: a rotation judges the acts signed with the key it replaces. Acts in its kept ancestry stay valid, however old. Acts outside it, or disowned inside it, are void, unless someone else relied on them in a way the protocol can see: then they stay valid and are shown as disputed.*

Each rotation judges only the acts signed with the key it replaces (a chain signature replaces none, and judges nothing, F132), except an escape endorsement naming that rotation, which it never judges (F88). For such an act:

#### Rule 33 (was 15). Kept acts stay valid

If it lies within the rotation's kept ancestry and is not listed as disowned, it is valid, however old.

#### Rule 34 (was 16). Acts left out or disowned are void, unless relied on

If it lies outside the kept ancestry, or within it but listed as disowned, it is void, unless:

- another identity acknowledged it (Envelopes; by an act of a type the Identity, Money or Agreements MIR defines, such as a witness act, F110);
- or a named keeper recorded it before recording the rotation (Agreements);

then it is valid and shown as disputed. A keeper record or acknowledgement counts only alongside the act it names (Envelopes, Agreements).

*Disowning an act no longer costs the owner the genuine acts that followed it: later acts in the line stay valid, because their validity rests on being inside the kept ancestry, not on the disowned act's (F57).*

#### Rule 35 (was 17). Sequences a rotation does not name

An act signed with the old key in a sequence the rotation does not name is outside the kept ancestry. A disowned hash that is not in the kept ancestry has no effect. Clients SHOULD track every sequence the owner has started, on any device, and warn before a rotation that omits one.

#### Every verifier gives the same answer; nothing binding rests on one's own attempts

These rules are part of validity and MUST give the same answer to every conforming verifier holding the same identity chain, acknowledgements, keeper records, inclusion proofs and content keys, having made the same attempts to reach homes, and having found the same acts at the signer's homes (rule 55; F137, F153, F159).

An answer that rests on the verifier's own failed attempts is marked as such ("re-homed without audit"), and nothing binding may rely on it (MUST NOT): no keeper record, payment, discharge of a debt, agreement, fork or closing. For any of these, such an answer is shown as unknown, never as valid or invalid, until it no longer rests on the verifier's own attempts (F153). Reading and following an identity MAY rest on it.

*A reader's own attempts are the escape from a censor; they are also the one input another reader cannot hold, so what rests on them is said, and nothing binding rests on it.*

#### Rule 36 (was 18). Old disputes may be collapsed

*Client conformance.* Clients MAY collapse disputed acts older than the rotation that voided them, showing a count rather than each act. The status itself never changes.

## Part two: rare cases

*Most identities never meet these. A chain signature is spent only where a higher MIR asks for one (today, Agreements' forks and closings). Succession is declared when an identity moves on. A competing rotation needs one chain key used twice. A homeless rotation needs homes that are gone, an escape a home that refuses, and audit an owner who asked for it.*

### 7. Chain signatures

*In short: a chain signature is an identity-chain act, signed with the chain key like a rotation, that signs another act and changes nothing else but the next chain-key commitment. Agreements uses it so that a member's signatures on forks and closings are ordered.*

A chain signature competes for its position with any rotation or chain signature revealing the same chain key, and counts as a rotation counts ("Which rotation counts", section 5): by the receipts of the homes the rule names, or on its own signatures for a self-hosted identity; it is never homeless.

Once it counts, the identity chain's state is the one before it with only the next chain-key commitment changed: the same signing key, homes, home rule, audit requirement, declarations and succession.

It judges no act: rules 33 to 35 belong to rotations alone.

The act it signs need not be held, nor be the signer's; what the signature means is defined by the MIR of the act it signs (Agreements: a member's signature on a fork or closing).

*Stated cost (F132):* every chain signature spends a chain key, so it goes through the same ceremony as a rotation (the air-gapped device), and is as slow and heavy.

#### The chain signature checks

1. `signer` is present; `binding` and `prev` are absent; the position is at least 1.
2. The previous act named is the signer's identity-chain act at position (this position minus one).
3. The signature's scheme and key hash to the chain-key commitment of that previous act.
4. A next chain-key commitment and the act signed are present.

### 8. Succession

*In short: an identity may name the identity that succeeds it, only in a rotation; the latest counting rotation that says something about succession decides it; and the old identity goes on living.*

#### Rule 37 (was 27). Only in a rotation that counts

A succession is valid only as part of a valid rotation that counts. A succession in any other act is invalid.

#### Rule 38 (was 28). The latest rotation decides

The latest rotation that counts decides the succession. A rotation without a succession field leaves the previous succession in place; ending a succession requires a rotation that says so.

#### Rule 39 (was 29). Succession does not end the identity

Declaring a succession does not end the identity. Both may coexist while followers and agreements move across.

### 9. Competing rotations and several homes

*In short: two rotations at one position can only come from one chain key used twice: by a thief, by an owner's mistake, or in one of rule 29's two exceptions. The home rule decides which counts; at most one can. Two receipts from one home for different acts at one position are a conflict: the identity is contested there, never frozen. A home is proven dishonest at a position only as rule 45 says, and the verdict never reaches backwards.*

#### Rule 40 (was 19). The home rule decides between competing rotations

A declared home rule decides which rotation counts when homes disagree. Both declared forms ensure that at most one of two competing rotations can ever count. If none meets the rule, the identity is contested until one does; no rotation counts meanwhile.

#### Rule 41 (was 20). With no declared rule, the default

With several homes and no declared rule, the default of rule 2 applies.

#### Rule 42 (was 21). A contested rotation's rule waits

A rule changed in a contested rotation takes effect only once the contest is settled. An invalid rotation never counts.

#### Rule 43 (was 22). An outvoted home

A home left holding a losing rotation is outvoted. The owner may drop it in a later rotation.

#### Rule 44 (was 10b). Two receipts from one home: a conflict

Two receipts that count from the same home for different acts at the same position of the same identity chain are a conflict. While it stands, the identity is contested at that position, not frozen. Anyone may publish the pair, and clients SHOULD flag the home to the owner.

#### Rule 45 (was 10d). Dishonesty, proven at a position

A home is proven dishonest for an identity at a position only when a conflict there survives the home's own rotations and, where the identity requires audit, both receipts sit under cosigned log summaries. Its receipts then count for nothing for that identity at later positions.

#### Conflicting receipts

Two receipts that pass receipt check 1 from the same operator, for the same identity and chain position but different acts, are a conflict, even if they come from different relays of that operator. *After check 1, a conflict needs two genuine rotations at one position, which needs the chain key. A stolen operator key alone can no longer touch any identity's chain (F53).*

1. While a conflict stands, neither receipt counts, and that home counts for nothing at that position. The identity is contested there, not frozen.
2. The conflict ends when one of the two receipts becomes void: through the home's own rotation, or, for an identity that requires audit, because only one of them is included under a cosigned log summary.
3. The home is proven dishonest for that identity **at that position** only if both receipts remain valid after the home's rotations, or both are included under cosigned log summaries. From then on, its receipts count for nothing for that identity at positions after that one. Its receipts at earlier positions keep counting. *A thief holding the chain key and a bad home may contest the future; they cannot erase the past (F55).*

### 10. Homeless rotations

*In short: when an identity's homes are gone, the owner holding the current chain key can leave them with a homeless rotation that names new homes and counts without the old homes' receipts. A valid objection from a live home of the old set voids it (rule 49; the exceptions are in the homeless procedure and section 11), and the objection proves the home was alive after the rotation was made. A home is shown to be gone by its operator's closing rotation, by the owner's declared auditors, or, weakest, by the reader's own failed attempt.*

#### Rule 46 (was 30). The way out of homes that are gone

A homeless rotation lets an owner holding the current chain key leave homes that are gone, with no receipt from them. It counts only under the homeless procedure below.

#### Rule 47 (was 33). A client first tries the old homes

A client meeting a homeless rotation MUST first try to reach the old homes and ask for an objection or a normal rotation.

#### Rule 48 (was 11a). An old home objects

A home of the old set that sees a homeless rotation for an identity it serves MUST NOT hold it as that identity's rotation. It SHOULD sign an objection naming it, and it remains open to a normal rotation from the owner.

#### Rule 49 (was 32). One objection voids it

A single valid objection from a live home of the old set voids a homeless rotation.

*This is what stops a thief holding the chain key from using the homeless path to get past careful homes.*

#### Rule 50 (was 8c). Closure, by the operator's rotation

A rotation MAY declare closure. Closure ends the signer's role as a home operator for good; it does not affect the signer's own sequences or identity.

*Closing a home is a rare, force-majeure case; spending a chain key on it is warranted, and it means a stolen signing key can never close a home (F56).*

#### Rule 51 (was 34). A home that closes says so

A home that closes SHOULD do so by a rotation of its operator declaring closure, so that its identities are provably homeless. An operator who has lost the chain key cannot close gracefully; its identities rely on auditors' absence statements or the verifier's own attempt.

#### Rule 52 (was 35). Auditors for a single home

Clients SHOULD recommend declared auditors to owners with a single home.

*Without auditors, an owner whose home vanishes without closing is re-homed only on each client's own failed attempt to reach it, and a thief able to cut a victim off from the home could exploit that until the home's objection gets through; under rule 55 the thief can never make it final.*

#### The homeless procedure

A homeless rotation at position n counts only if all of the following hold:

1. It is a valid rotation with the homeless flag, and it declares a new set of homes.
2. No rotation at position n counts under the old home rule. A rotation that does, whenever its receipts appear, beats the homeless rotation.
3. No valid objection naming it exists from any home of the old set, except a home proven dishonest for that identity at an earlier position.
4. Enough old homes are gone that the old rule can no longer be met: the single or authoritative home, or homes of more than (number of distinct operators minus threshold) operators under a threshold. A home counts as gone when:
   - a rotation of its operator that counts declares closure; or
   - the identity requires audit, and at least the required number of its declared auditors have signed absence statements naming the rotation and that home; or
   - the identity does not require audit, and the verifier itself has tried and failed to reach the home.

   The audit requirement and the auditors here are those in effect before the homeless rotation, while the old homes served, never the ones it declares (F93). *A thief holding the chain key can neither drop auditing to fall back on a reader's failed attempt, nor name auditors of its own to sign absence statements.*

   A self-hosted home is never gone: the owner is the home, and re-homes by serving a rotation from anywhere.
5. Receipts from the new homes meet the new home rule, judged under the audit requirement this rotation declares or inherits.

*Section 11 says when steps 3 and 4 do not apply (escape with both keys); section 12 says when a homeless rotation becomes final, and when it never does by the next rotation.*

#### The objection and absence statement checks

1. Each is valid as an everyday act of the home's operator or the auditor.
2. An objection counts only from a home in the old home set of the identity it names, and not from a home whose operator's counting rotation has declared closure. An absence statement counts only from an auditor that identity declares.

*Because nobody can know an act id before the act exists, an objection naming a homeless rotation proves the home was alive after that rotation was made, and an absence statement proves the auditor looked for the home after it was made. No clock is needed.*

### 11. Escape with both keys

*In short: a home that is alive but hostile can refuse the owner's normal rotation and object to a homeless one. An owner who proves both keys, the chain key in the rotation and the signing key in an endorsement, leaves anyway.*

#### Rule 53 (was 36). Both keys always get out

A homeless rotation endorsed with the owner's current signing key cannot be voided by an objection. An owner holding both keys can always leave homes that refuse them.

#### Escape with both keys

A homeless rotation that has a valid escape endorsement counts without steps 3 and 4 of the homeless procedure: objections do not void it, and the old homes need not be gone. Steps 1, 2 and 5 still apply, so a rotation that counts under the old home rule at the same position still beats it, except a rotation the endorsement lists as abandoned.

*This is the way out from a home that is alive but hostile: it can refuse the owner, but it cannot hold an owner who proves both keys.*

#### The escape endorsement

An escape endorsement names a homeless rotation in `objects`. Its payload may list, under key 0, earlier rotations at the same position that the owner abandons (for example one a home refused); an abandoned rotation can never count afterwards.

It is signed by the owner's current signing key: the one bound by the identity-chain act just before the homeless rotation. A homeless rotation with an endorsement carries both of the owner's keys: the chain key in the rotation, the signing key in the endorsement.

An escape endorsement is never judged by the rotation it endorses (rules 33 to 35): it cannot lie in that rotation's kept ancestry, since it names the rotation and so is made after it (F88).

### 12. Finality

*In short: a homeless rotation is final once the next rotation counts under the home rule it declared; after that, no objection voids it. Two limits: a rotation the old homes held at the same position still beats it, final or not; and one accepted only on the reader's own failed attempt is never made final by the next rotation.*

#### Finality

A homeless rotation at position n is final once a rotation at position n plus one counts under the home rule the homeless rotation declared, unless it counts only through the verifier's own failed attempt (below). After that, no objection can void it. Until then it is provisional.

*Nobody can name an act before it exists, so anything surfacing after the next rotation is late by construction. No clock, no anchor, no higher layer (F63).*

Finality never reaches past step 2 of the homeless procedure: a rotation that counts under the old home rule at the same position beats the homeless rotation, final or not (rule 54, F92).

*A verifier sees only the acts it holds, never when each arrived. Were finality to beat the old homes' receipts, a thief who found a used chain key on an old backup could, once the home closed, make a homeless rotation at that old position, rotate again at once, and replace every rotation the owner made since. A rotation the old homes held is first held, however late its receipts surface.*

#### Rule 54 (was 31). The old homes' rotation always wins

A rotation that counts under the old home rule always beats a homeless rotation at the same position, even one made final by the next rotation (F92).

#### Re-homed without audit

A homeless rotation that counts only through the verifier's own failed attempt (the last case of step 4) MUST be shown as "re-homed without audit", and keepers, vault payments and agreements MUST NOT rely on it; everyday acts may.

It is never made final by the next rotation: steps 2 and 3 keep applying, so a valid objection from a home of the old set voids it whenever it surfaces, and with it every rotation built on it. The latest act that counts is then the one at position n minus one.

It is final like any other homeless rotation only once it counts through something other than the verifier's attempt: a closure by the old home's operator (step 4, first case), or an escape endorsement (section 11).

*The finality reasoning above holds for acts that did not exist yet, not for an objection that existed but was kept from arriving. A thief holding the chain key controls the next rotation and chose the homes it counts under; if that rotation made the first final, a censor who blocks the real home could make a theft final inside its borders (F87).*

*Stated cost: an honest owner whose single home vanished without closing, with no auditors, stays re-homed without audit unless they endorse the homeless rotation with their current signing key. Only an owner who has also lost the signing key stays so for good: a rare case.*

#### Rule 55 (was 32a). Re-homed without audit is never final by the next rotation

A homeless rotation that counts only through the verifier's own failed attempt to reach an old home is never made final by the next rotation: a valid objection voids it, and every rotation built on it, whenever the objection surfaces (F87).

### 13. Audit

*In short: an owner may require that their receipts be audited: other operators, declared by the owner, cosign each home's log summaries after checking that each extends the last. A receipt under a cosigned summary is shared history: the home can no longer erase it, and a forged one stands out. Auditing is optional, and the chain key alone can change it.*

#### Rule 56 (was 10e). Audit is the owner's choice

An identity MAY require audited receipts, declaring its auditors and how many cosignatures a log summary needs. The requirement is declared in genesis or a rotation, so only the chain key can change it. Auditing is additional security, never compulsory.

Receipts for a rotation are judged under the requirement that rotation declares, or inherits if it declares none, so an owner can always drop or replace auditors who have stopped cosigning (F60).

#### Log summaries and audits

1. A home MUST NOT sign two log summaries of which neither extends the other. Two such summaries carry no verdict on any receipt: auditors MUST NOT cosign further summaries of that home, and clients SHOULD flag the home to its owners. Receipts already under a cosigned summary stay protected; the rest are judged as before.
2. An auditor MUST check a consistency proof from the last summary of that home it cosigned before cosigning a new one, and MUST NOT cosign two summaries of the same home of which neither extends the other.
3. A cosignature counts only if its signer is declared as an auditor by the identity whose receipt is being checked.

#### Inclusion proofs travel

Proofs are not acts: a home serves them on request, alongside the summary, and anyone may carry them, since each is checked against a signed summary. An owner's client SHOULD keep the inclusion proofs of its own receipts under cosigned summaries, and hand them to its new homes when it re-homes (F101).

*Otherwise, once a home vanishes, a reader who never read it before cannot prove any receipt it signed, and an audited identity's chain would stop at genesis for that reader, homeless rotation included.* *Stated cost: proofs the owner never kept are lost with the home.*

How often homes publish summaries, and which homes audit which, is left to the homes and the market. The core defines only the acts, and the yes-or-no checks.

## Part three: encoding and act formats

*For reference. The rules above say what these acts mean and when they count.*

### Encoding and conventions

*The envelope itself is defined by the Envelopes MIR. This section repeats only what Identity needs.*

**Encoding.** Every act is encoded in deterministic CBOR (RFC 8949, section 4.2.1, core deterministic encoding). A verifier MUST reject any act whose bytes are not in that encoding. Formats are written in CDDL (RFC 8610). Maps use small integer keys. Every `tstr` is canonical text (Text MIR), including address hints; a genesis with a trailing space in a hint is invalid. The core sets no length bound; homes set their own policy.

**Hashes.** Every hash is SHA-256, 32 bytes. A tagged hash is computed as in BIP-340:
`tagged_hash(tag, x) = SHA-256(SHA-256(tag) || SHA-256(tag) || x)`.
*Tags keep the hashes of different kinds of object apart, so one can never be passed off as another. A successor protocol MUST use a different tag prefix, so its acts can never replay here (Development).*

**Act id.** The act id is `tagged_hash("MOR/act", outside)`, where `outside` is the encoded outside of the act, which commits to its locked inside (Envelopes MIR). The signature is not part of the act id, so a signature can never change which act is meant.

**Signature schemes.** A scheme is named by a founding number, or by the hash of a signature-scheme specification (Development) that defines its key encoding, signature encoding and verification.

| Scheme | Name | Public key | Signature | Used by |
| --- | --- | --- | --- | --- |
| 1 | Schnorr over secp256k1 (BIP-340) | 32 bytes (x-only) | 64 bytes | signing keys |
| 2 | SLH-DSA-SHA2-128s (FIPS 205) | 32 bytes | 7,856 bytes | chain keys |
| 3 | SLH-DSA-SHA2-128f (FIPS 205) | 32 bytes | 17,088 bytes | chain keys |
| hash | as the specification defines | as defined | as defined | either, as the specification says |

A signature always signs the 32-byte act id. SLH-DSA signatures use the context string `MOR`. Both SLH-DSA variants are allowed; the owner's client chooses. The small variant (2) is recommended. A client that meets a scheme it does not implement MUST treat the act as unknown, never as valid. *A rotation's own validity never depends on the kind of signing key it installs, so every client verifies the rotation; only acts signed under the new scheme are unknown to a client that lacks it. This is how signing keys migrate to a post-quantum scheme before a break: by adoption, with no change to the core (F54).*

**Chain key commitment.** A chain key is committed as `tagged_hash("MOR/safety", scheme || key)`, where `scheme` is the one-byte number or the 32-byte specification hash, and `key` the public key.

**Spec hash.** Every act names the specification that defines its type by that specification's hash. For the acts below it is the hash of the frozen text of this MIR, written `IDENTITY` here.

### The envelope

Every act is an Envelopes MIR act: an outside (signer, binding, commitments, and for a public act its content key), a locked inside (spec, type, prev, objects, payload, position, summary, acks, refs, hint, salt), and a signature. Below, "signer" and "binding" are outside fields; "prev", "objects" and "payload" are inside fields.

Every act defined by this MIR is public, except a private link, as section 3 says (F29, F134).

Every act has exactly one signer (section 2).

`prev` holds one act id in the ordinary case, and none (an empty array) when the act starts a new sequence (F24). Genesis and rotations carry neither `binding` nor `prev`: they belong to the identity chain, not to a sequence.

```cddl
hash   = bstr .size 32
scheme = 1 / 2 / 3 / hash
```

### Shared parts

```cddl
signing-key   = [ scheme, key: bstr ]
chain-key-commit = [ scheme, commit: hash ]

home      = [ operator: hash / null, hint: tstr ]   ; null: self-hosted, operated by this identity
home-rule = [ 0, index: uint ]                      ; one authoritative home
          / [ 1, threshold: uint ]                  ; a majority of homes

audit = [ threshold: uint, auditors: [+ hash] ]     ; cosignatures required, and from whom

declaration = [ spec: hash, kind: uint, value: any / null ]   ; null removes the kind
successor   = [ protocol: tstr, identifier: bstr ]  ; protocol "mor" for a MOR identity
```

How an address hint and a null operator are read is in section 4 ("A home's address").

### Types defined by this MIR

| Type | Name | Signed by | Adds to |
| --- | --- | --- | --- |
| 0 | Genesis | first signing key | identity chain |
| 1 | Rotation | revealed chain key | identity chain |
| 2 | Receipt | the operator's signing key | the operator's sequence |
| 3 | Routes | signing key | a sequence |
| 4 | Name | signing key | a sequence |
| 5 | Name withdrawal | signing key | a sequence |
| 6 | Link claim | signing key | a sequence |
| 7 | Link confirmation | signing key | a sequence |
| 8 | Link termination | signing key | a sequence |
| 9 | Log summary | the operator's signing key | the operator's sequence |
| 10 | Cosignature | the auditor's signing key | the auditor's sequence |
| 12 | Objection | the operator's signing key | the operator's sequence |
| 13 | Absence statement | the auditor's signing key | the auditor's sequence |
| 14 | Escape endorsement | the owner's current signing key | a sequence |
| 15 | Witness | signing key | a sequence |
| 16 | Chain signature | revealed chain key | identity chain |

*Type 11, home closure, existed in draft 6 as an everyday act and is retired: a home closes by a rotation of its operator (F56). The number is not reused.*

### Genesis (type 0)

```cddl
genesis-payload = {
  0 => signing-key,       ; the first signing key
  1 => chain-key-commit,     ; commitment to the first chain key
  2 => [+ home],          ; one or more homes
  ? 3 => home-rule,       ; only with several homes; absent means the default (rule 2)
  ? 4 => [+ declaration], ; high-risk settings defined by higher MIRs
  ? 5 => audit            ; require audited receipts; absent means not required
}
```

Outside: no `signer` or `binding`. Inside: `spec`, `type` 0 and `payload`, with no `prev` or `objects`. The signature is by the first signing key. The identity hash is the act id of the genesis.

### Rotation (type 1)

```cddl
rotation-payload = {
  0 => hash,               ; the previous identity-chain act
  1 => uint,               ; position in the identity chain: 1 for the first rotation
  2 => signing-key,        ; the new signing key
  3 => chain-key-commit,      ; commitment to the next chain key
  4 => [* kept-tip],       ; kept: the latest genuine act of each kept sequence
  ? 5 => [+ hash],         ; disowned: acts within the kept ancestry the owner voids
  ? 6 => [+ home],         ; a new set of homes
  ? 7 => home-rule / null, ; a new home rule; null returns to the default
  ? 8 => [+ declaration],  ; new high-risk settings, replacing those of the same kind
  ? 9 => successor / null, ; a succession; null ends the current one
  ? 10 => audit / null,    ; a new audit requirement; null removes it
  ? 11 => true,            ; homeless: counts without the old homes (field 6 required)
  ? 12 => true             ; closure: the signer's home stops serving every identity
}

kept-tip = [ act: hash, position: uint, summary: hash ]   ; the tip's id, its position, and the running summary including it
```

Outside: `signer`, no `binding`. Inside: `spec`, `type` 1 and `payload`, with no `prev`. The signature is by the chain key committed in the previous identity-chain act; its public key is revealed in the signature itself.

### Receipt (type 2)

```cddl
receipt-payload = {
  0 => hash,   ; the identity whose chain act is held
  1 => hash,   ; the identity-chain act held
  2 => uint,   ; its position in that identity chain
  3 => uint    ; its position in the home's own log
}
```

A receipt is an everyday act of the home's operator. Its log position is a counter kept by the home, increasing by one with every receipt it signs, for any identity. It is never a time.

### Routes (type 3)

```cddl
routes-payload = {
  0 => uint,               ; version: 1 for the first routes act, then the previous version plus one
  ? 1 => hash,             ; the previous routes act (absent only for version 1)
  2 => [* route]
}
route = [ scope: hash / null, hints: [+ tstr], ? kind: 0 / 1 ]
; scope: a spec hash, or null for everything else
; kind 0 (default): outbox, where this identity's content of that scope is found
; kind 1: inbox, where others deliver acts of that scope addressed to this identity
```

Routes acts form their own chain: each names the one it replaces, and its version is exactly one more. *Nobody can jump ahead with a very high number, and two routes acts naming the same predecessor are a visible fork.* An identity MAY declare no inbox. *The reserved inbox kind is shared language, not a mandate: it exists so that any two identities can find each other without already sharing a relay, through identity, home and routes (F70).*

### Name (type 4) and name withdrawal (type 5)

```cddl
name-payload = {
  0 => tstr,   ; the name
  1 => hash    ; the naming cMIP that defines its form and resolution
}
```

A name withdrawal names the name act in `objects` and has an empty payload.

### Link claim (type 6), confirmation (type 7) and termination (type 8)

```cddl
link-claim-payload = {
  0 => successor,   ; the other side: protocol and identifier (same shape as a successor)
  ? 1 => bstr       ; proof from the other protocol, as defined by a cMIP
}
```

A confirmation names the claim in `objects` and has an empty payload; it is signed by the MOR identity the claim names. When the other side is an account on another protocol, it confirms instead by signing the claim's act id in its own protocol; that signature is carried in the claim's proof field, and a cMIP for that protocol defines how to check it. Either side may start: an account elsewhere can sign first, and the MOR identity then publishes the claim carrying that proof. A termination names the claim in `objects`, has an empty payload, and is signed by the MOR side; an account elsewhere ends a link by the means its own protocol offers. A private link is stored as encrypted acts, in the form the Envelopes MIR defines.

### Log summary (type 9) and cosignature (type 10)

```cddl
log-summary-payload = {
  0 => uint,          ; size: number of receipts in the home's log
  1 => hash,          ; root: Merkle tree root over the receipts' act ids, in log order
  ? 2 => hash         ; the home's previous log summary; absent for the first
}
```

The Merkle tree is built as in RFC 9162, section 2.1, with SHA-256. A receipt's log position is its index in that tree. An inclusion proof shows that a receipt sits at its position under a root; a consistency proof shows that a later summary extends an earlier one. Who serves and carries proofs is in section 13 ("Inclusion proofs travel").

A cosignature names the log summary in `objects` and has an empty payload. It is signed by the auditing identity.

### Objection (type 12) and absence statement (type 13)

```cddl
objection-payload = {
  0 => hash                       ; the identity the homeless rotation claims
}

absence-payload = {
  0 => hash,                      ; the home found not answering (its operator)
  ? 1 => hash                     ; the last log summary of that home the auditor has seen
}
```

An objection and an absence statement name the homeless rotation in `objects` (section 10).

### Escape endorsement (type 14)

An escape endorsement names a homeless rotation in `objects`. Its payload, what it abandons and who signs it are in section 11 ("The escape endorsement").

### Chain signature (type 16)

```cddl
chain-signature-payload = {
  0 => hash,               ; the previous identity-chain act
  1 => uint,               ; position in the identity chain
  2 => chain-key-commit,      ; commitment to the next chain key
  3 => hash                ; the act it signs
}
```

Outside: `signer`, no `binding`. Inside: `spec`, `type` 16 and `payload`, with no `prev`. The signature is by the chain key committed in the previous identity-chain act, revealed in the signature itself, as for a rotation (F132). How it counts, and what it changes, is in section 7.

### Witness (type 15)

```cddl
witness-payload = { }             ; empty: the type says it all
```

The acts a witness act witnesses are named in its `acks` (Envelopes), at least one; it carries no `objects`. What it says, and its rules, are in section 3 (rules 10 and 11).

## Part four: tasks, reasoning and freeze scenarios

### Tasks

- **Identity proofs and credentials.** A cMIP accepts an identity hash and a claim, and produces a verification answer (valid, invalid, pending, unknown) with the hash of the module that computed it. Sign-in flows are built on this task.
- **Naming.** A cMIP accepts a name and produces an identity hash, or accepts an identity hash and produces its names. A name resolves only if the identity signs it.
- **Outside link proofs.** For a given protocol, a cMIP accepts a link claim and its proof, and produces a verification answer (valid, invalid, unknown): whether the account named really signed the claim's act id. One cMIP per protocol; clients opt in to the protocols they support.

Bridges themselves, the software that carries content, messages or payments between MOR and another protocol, are Modules built on these cMIPs and on grants.

A collective is an identity like any other. Its keys may be held under its founding agreement's key grammar (Agreements): by one holder, by a threshold of members producing one ordinary signature, or by a custodian. Every grammar leaves a way to rotate that needs less than every member (Agreements, F77). Identity sees only the resulting signatures.

Key storage, backup and recovery are Modules built on this vocabulary; they need no task because they create no act the core must read. Signature-scheme specifications are published through Development; a new signing-key scheme is adopted by clients implementing it, and installed by rotation.

### Reasoning

- **The hash is the identity, not a key.** *Keys can be lost or stolen; an identity that is a key dies with it. A hash of genesis lets keys change while everything pointing to the identity stays valid.*
- **Two keys with different jobs.** *The signing key is exposed daily, so its loss must be survivable. The chain key is used once and kept offline, so it can afford heavy, post-quantum cryptography. Committing each chain key by hash before it is needed means a replacement always exists before the key it replaces is used.*
- **Schemes are named, not fixed.** *A scheme can be a founding number or the hash of a specification. Nothing in a rotation's validity depends on what kind of signing key it installs, so when a post-quantum signing-key scheme is standardised, owners migrate by rotating to it and clients by implementing it. Migration must come before a break: after one, everything signed with the old scheme can be forged, homes and auditors included, and only owners who hold both keys still leave.*
- **Genesis is signed with the signing key, and that is safe.** *Forging a genesis only creates a different identity, never a copy of an existing one, because the identity hash fixes the original.*
- **Rotations are large by design.** *A post-quantum signature makes a rotation several kilobytes. For an act this rare, that is a deliberate trade, and implementers should not try to shrink it.*
- **The identity chain holds keys only.** *The home then needs to know nothing about what the identity does: messages, media and money live on whatever relays the owner chooses. Private acts never reach the home.*
- **Sequences, not one history.** *Hash links work across relays, so the owner may keep acts in any number of lines, per layer or per device. A rotation needs only the latest genuine act of each line to say what survives.*
- **Nothing relied on is silently erased.** *An act outside the kept ancestry, or disowned inside it, is void only if nobody else relied on it in a way the protocol can see. Otherwise it stays visible as a dispute. Disowning costs the owner nothing else: the genuine acts after a thief's act stay valid.*
- **A home verifies but does not vouch.** *Everything it serves can be re-checked, so a dishonest home can hide or delay a rotation, never fake one. Homes guarding acceptance are a market service, not a protocol duty.*
- **Homes are relays, run by operators.** *A relay is infrastructure, not an identity. Its operator's ordinary identity signs what the home states, so the operator's keys can rotate like anyone's, and a stolen key's forged receipts die with the rotation. Counting homes per operator makes centralisation visible under honest labelling; it does not detect one company behind three operators, and the core does not try to.*
- **Receipts make homes answerable, and name real acts.** *What passes between a dishonest home and a thief is private and cannot be made public. A receipt makes it provable whenever it surfaces, so a home cannot tell different clients different stories without leaving evidence. A receipt counts only alongside the act it names, so a stolen operator key can produce nothing that changes any identity's chain: a conflict needs two genuine rotations, which needs the chain key. Because a home signs, it has its own identity, which lets it move servers without the owner spending a chain key.*
- **Homes audit each other.** *A stolen home key can sign false receipts, but it cannot get them into a log summary other homes have already cosigned. Auditing turns forgeries into self-evident ones without waiting for the home to rotate, and makes it impossible for a home to show different logs to different people without other homes cosigning both. Two non-extending summaries are a reason to stop auditing the home, never a verdict on its past receipts. The core defines the acts and the yes-or-no checks; how often and by whom is the market's business.*
- **Contested, not frozen; and never backwards.** *A conflict between two receipts can only come from two genuine rotations. Treating it as a contest that the home's rotation or an audit can settle means nothing freezes; and a dishonesty verdict is bound to the position where it was proven, so a thief with the chain key and a bad home can contest the future but never erase what came before.*
- **The log counter covers every identity.** *A home's log position increases across all the identities it serves, so a summary reveals the home's total volume. That is the price of one log that can be audited as a whole.*
- **Two forms of home rule, one default.** *With one authoritative home, the others are simple backups: copies to fall back on. With a majority threshold, they form a safety network: a thief must win over most of them. Both forms allow at most one competing rotation to count. An owner who declares neither gets the majority rule, computed from the home list, or, beside a self-hosted home, the self-host as authoritative. A single home stays possible at genesis: forcing several is too much friction for a new user; hygiene is recommended, never forced.*
- **Self-hosting is a trust model.** *An identity that is its own home has chosen to be trusted on its own signatures. Its rotation counts with no receipt, which is the only way it can rotate at all; a thief holding its chain key wins at once. That is the same risk as a single lax home, chosen knowingly, and the most sovereign setup is no longer the one that cannot rotate.*
- **First held wins.** *Without a third key, the only order the protocol can see is the order in which homes accepted rotations. A stolen chain key is like a stolen bitcoin key, unless the owner chose homes that guard against it.*
- **Links exist for signing in and for bridges.** *Signing in with MOR is essential, so the core gives every protocol and service one shared, two-way statement to read: this MOR identity and that account are the same entity. Anyone can build a bridge on it. A link needs both sides, otherwise anyone could claim to be anyone, and either side can leave, because nobody should be kept linked against their will. It confers no authority: a bridge that acts for someone needs a grant.*
- **High-risk settings ride on the chain key.** *Anything whose theft would cause lasting harm, such as where money is protected, who succeeds the identity, or that a home has closed, is declared in genesis or a rotation. A thief holding only the signing key cannot change it. Higher MIRs decide what counts as high-risk; Identity only carries the slot.*
- **Every protection the owner chooses is removable by the chain key alone.** *An audit requirement is judged under the rotation that changes it, so auditors who have gone cannot lock the owner in. A device policy is the one protection the core cannot make removable, because a refusal leaves no evidence; so the text says what it costs, and clients never choose it by default.*
- **Succession rides on rotation.** *The chain key keeps its single use. Tying succession to it means a thief holding only the signing key can never redirect an identity's followers, agreements or money. Leaving is as protected as a rotation, and as rare.*
- **Reliance is a deliberate act (F110).** *An acknowledgement carries weight: it can keep a thief's act alive as a dispute. A gesture as light as a like must never carry that weight by accident, so acknowledgements live only on the act types of the three layers that need them, and reliance on anything else is a witness act, signed on purpose and explained before signing. A thief's accomplice can still witness the thief's acts, making a visible dispute, never a valid act, exactly as before; what disappears is likes and replies keeping a thief's words alive.*
- **One signer per act.** *Every act is signed by exactly one identity, so every act sits cleanly in one sequence and has one binding to check. Agreement between two identities is expressed as two acts, one naming the other, which is also how the second side stays free to refuse.*
- **The signature is outside the act id.** *A signature can be recomputed in more than one valid way. Keeping it out of the act id means the id never changes, so every pointer to an act stays valid.*
- **Nobody dies with their home.** *In a one-home setup, a vanished home would otherwise mean the death of the identity. Silence cannot be proven, but life can: a home that names the homeless rotation in an objection proves it was alive after the rotation was made. So the homeless path is closed whenever the home can answer, and open when it cannot. Three layers set how sure the rest of the network can be that a home is gone: its operator's closing rotation, the owner's declared auditors, or, weakest, each client's own attempt. And a homeless rotation is final once the owner's next rotation counts, which every Identity client can check; except one accepted only on a client's own failed attempt, since a thief holding the chain key controls that next rotation and a censor can keep the objection from arriving. That one stays open to the objection for good, unless the owner endorses it with the signing key.*
- **Anyone can find anyone.** *Without a standard place to deliver, the largest relays become the only meeting points, which is centralisation by default. A reserved inbox route is the right of exit applied to communication: it is shared language, an identity may declare none, and relay operators decide whom they accept deliveries from and at what price.*
- **Losing the chain key is permanent.** *An owner who loses the chain key, and its seed, can never rotate, change homes or leave. The identity keeps working with its signing key until that is lost too. Back up the chain-key seed as carefully as the key itself.*
- **Protected history.** *Once other operators have cosigned a log summary, the receipts under it are part of shared history: the operator can no longer erase them, by mistake or on purpose. Identities that do not require audits trust their home for this, as before.*
- **Both keys always get out.** *A careful home's refusal and a hostile home's refusal look identical from outside, so the protocol cannot judge the home. It judges the owner instead: an owner who proves both keys can leave any home. Keeping the keys separate, and backed up, is what makes that proof strong and that exit available.*
- **The way out.** *The post-quantum chain key keeps continuity through a break of elliptic-curve signatures. It secures the exit, not what is left behind: history signed with the signing key relies on anchoring before a break, and signing keys should migrate to a post-quantum scheme before one.*

### Open technical parameters

Settled in this draft: hash function (SHA-256), encoding (deterministic CBOR), founding signature schemes and the specification-hash form, chain key commitment, receipt format, home address changes (through the home's own routes), routes with an inbox kind, closure by rotation.

Still open:

- How a home is queried: the request and response formats for an identity's chain, receipts, routes, names and public links.
- Efficient proof that an act lies within a kept ancestry (Envelopes MIR: sequence position and running summary, with the test vector of F78).
- The encrypted form of private links (Envelopes MIR).
- The final hash of this MIR, used as `IDENTITY` in every act it defines.

### Freeze scenarios

Components exercised (freeze test suite v16):

- Genesis, homes and routes, including an inbox route: all scenarios.
- Rotation by chain key, delivered at the home; pending until the home rule is met: 1, 5.
- Receipts naming real acts; a forged receipt changes nothing; conflicts only between genuine rotations; dishonesty bound to a position: 5.
- Competing rotation: first held by the homes that count wins; home acceptance policies; the lost device with a backed-up signing seed: 5.
- Home rules: authoritative, majority, majority by default; self-hosted default: 5.
- Self-hosted identity rotating with no receipt; the stated cost: 5.
- Identity chain of key events; rotation keeps the named acts' ancestry in each sequence; excluded or disowned acts void, or disputed if acknowledged or recorded; later genuine acts kept: 1, 2, 5.
- Routine rotation keeps unacknowledged history: 5.
- A witness act keeps a disowned post visible as disputed; a like-style reaction carrying `acks` keeps nothing, being invalid (F110): 5.
- Audit requirement dropped by the rotation that drops it: 5.
- Closure by rotation; a stolen operator key cannot close a home: 5.
- Homeless rotation: closure, objection, auditor absence statements judged by the auditors in force before it, the vanished home's audited history proved by the proofs the owner carried; receipts from the new homes; final once the next rotation counts, yet still beaten by a rotation the old homes held, so a used chain key found after a closure rewrites nothing; re-homed without audit never final by the next rotation, a censored reader, a thief's second rotation voided with the first: 5.
- Escape with both keys past a hostile home, including after a refused normal rotation: 5.
- Several unlinked identities; linking signed by both, ended by either; public or encrypted: 5.
- Succession: 5.
- Linking an outside identifier; signing in after a rotation: 5.
- Rotation to a signing key of a new scheme; unknown to a client without it: 8.
- Two identities on disjoint relays reaching each other through homes and routes: 5.
- An act signed with a collective's grant key: scoped under Identity, judged by Agreements; signed with another key than the one its binding installs, or bound to nothing held, not the collective's (F128): 3.
- A chain signature (F132): pending until its home receipts it; same key and binding afterwards, no act judged; a later rotation naming it as predecessor; a binding naming it invalid; a spent chain key revealed again never counting: 3.9aa.

## Old numbers to new

Draft 11's rules, in their old order, with their numbers in this draft. Every old rule has exactly one new number; none was split, merged or dropped. The checks (every act, genesis, rotation, chain signature, everyday, receipt, conflicting receipts, log summaries and audits, the homeless procedure, objection and absence statement, which rotation counts) keep their names and step numbers.

| Old | New | Rule |
| --- | --- | --- |
| 1 | 5 | The verifier runs the checks |
| 1a | 8 | Scoped keys |
| 2 | 7 | A chain key signs only rotations and chain signatures |
| 3 | 6 | A signing key never adds to the identity chain |
| 4 | 1 | Genesis |
| 5 | 2 | Several homes: the home rule, and its default |
| 6 | 27 | A valid rotation |
| 7 | 28 | A rotation counts once the homes receipt it |
| 8 | 26 | Why an owner rotates is the owner's business |
| 8a | 29 | One chain key, one rotation |
| 8b | 31 | Declarations ride on the chain key |
| 8c | 50 | Closure, by the operator's rotation |
| 9 | 18 | A home checks before it stores |
| 10 | 19 | A home keeps and serves |
| 10a | 20 | A receipt for every chain act |
| 10b | 44 | Two receipts from one home: a conflict |
| 10c | 21 | Rely on receipts |
| 10d | 45 | Dishonesty, proven at a position |
| 10e | 56 | Audit is the owner's choice |
| 10f | 3 | A single home's security is the owner's |
| 11 | 30 | First held wins, at each home |
| 11a | 48 | An old home objects |
| 12 | 24 | A home's own acceptance conditions |
| 12a | 25 | Device-bound policies are never the default |
| 13 | 22 | What a home serves besides the chain |
| 14 | 23 | Consult the homes |
| 15 | 33 | Kept acts stay valid |
| 16 | 34 | Acts left out or disowned are void, unless relied on |
| 17 | 35 | Sequences a rotation does not name |
| 18 | 36 | Old disputes may be collapsed |
| 18a | 9 | A client implements every MIR it acts on |
| 18b | 10 | Witness acts |
| 18c | 11 | A witness act is never a side effect |
| 19 | 40 | The home rule decides between competing rotations |
| 20 | 41 | With no declared rule, the default |
| 21 | 42 | A contested rotation's rule waits |
| 22 | 43 | An outvoted home |
| 22a | 4 | Self-hosting is a trust model |
| 23 | 14 | A link needs both sides |
| 24 | 15 | Either side may end a link |
| 25 | 16 | A link gives no authority |
| 26 | 17 | Private links |
| 27 | 37 | Only in a rotation that counts |
| 28 | 38 | The latest rotation decides |
| 29 | 39 | Succession does not end the identity |
| 30 | 46 | The way out of homes that are gone |
| 31 | 54 | The old homes' rotation always wins |
| 32 | 49 | One objection voids it |
| 32a | 55 | Re-homed without audit is never final by the next rotation |
| 33 | 47 | A client first tries the old homes |
| 34 | 51 | A home that closes says so |
| 35 | 52 | Auditors for a single home |
| 36 | 53 | Both keys always get out |
| 37 | 32 | Keep the two keys apart, and back both up |
| 38 | 12 | Anyone can find anyone |
| 39 | 13 | A stolen signing key and the inbox |

Agreements citations, draft 10's numbers to draft 11's (from draft 11's own table): 38 to 44 (grants) became 73 to 80. Identity draft 11 cites no Money rule by number.

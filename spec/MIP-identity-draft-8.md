# MIP: Identity

*Draft 8, 28 September 2026. Written against core v13 and findings F1 to F87. Draft 8 is draft 7 with the two findings of the relay transport cMIP written in: a homeless rotation's receipts come from the new homes it declares (F86); a homeless rotation accepted only on the verifier's own failed attempt is never made final by the next rotation, and an objection voids it whenever it surfaces (F87). Draft 7 applied review round 2: receipts and keeper records count only alongside the valid act they name; signature schemes by specification hash; dishonesty verdicts never reach backwards; closure by rotation; disowned acts void unless relied on; the majority rule as default; audit requirements removable by the safety key; self-hosting as a trust model; finality by the next rotation; an inbox route.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

Identity is the ground layer of MOR. It defines what an identity is, how it is born, how its keys are replaced, where others check it, how others reach it, and how it relates to other identities. Every act in MOR is signed in the name of an identity, so every client implements this MIP.

The identity hash is the identity. It never changes. Keys are only the pens that sign for it, and are replaced by rotation. The home is where anyone holding the hash learns which pen currently speaks for it, and where its content and its inbox can be found.

## Dependencies

None beneath it. Identity defines the envelope as far as it needs it; the Envelope MIP completes it. It refers upward in two places only: acknowledgements (Envelope) and keeper records (Law) can give an act standing after a rotation. Nothing in this MIP requires a client to hold data from a higher layer: every rule here is decided from identity chains, receipts, summaries and the acts a verifier already holds.

## Definitions

- **Act.** Any signed object.
- **Envelope.** The signed container of an act.
- **Identity hash.** The hash of an identity's genesis act. It is the identity.
- **Signing key.** The key that signs everyday acts. It cannot change the identity chain.
- **Safety key.** A key from a post-quantum family, committed in advance by its hash, revealed and used once, to sign a rotation.
- **Identity chain.** Genesis followed by the identity's rotations, each naming the one before. Only the safety key adds to it. Genesis is position 0.
- **Sequence.** A line of everyday acts by one identity, each naming the previous act in the line. An identity may keep one sequence or several; the split is the owner's choice.
- **Kept ancestry.** The acts a rotation names as the latest genuine act of each sequence, and every act they descend from. For each tip, the rotation carries its position and the running summary including it, so anyone can prove an act lies in the kept ancestry without opening any private act.
- **Home.** A relay that focuses on the Identity MIP: it stores identity chains and serves them. A relay is not an identity; it is operated by one, a person or organisation with an ordinary MOR identity of its own, which signs everything the home states. A home is declared by its operator's identity hash plus the relay's address. It verifies what it stores and signs receipts for it, but never signs on the owner's behalf. "Home" names a role, not a size.
- **Operator.** The identity that runs a home or an auditing relay and signs its receipts, log summaries, objections and absence statements. Homes are counted per operator.
- **Self-hosted home.** A home operated by the identity itself. A self-hosted identity is trusted on its own signatures: its rotations count without receipts.
- **Receipt.** A home's signed statement that it holds a given identity-chain act, at a given position in that chain, recorded at a given position in the home's own log, and that it is the first valid act the home accepted at that chain position. The home's log position is a sequence number, never a time. A receipt counts only alongside the act it names.
- **Home rule.** The identity's declared rule for which homes count.
- **Log summary.** A home's signed summary of its whole log of receipts, as a Merkle tree root.
- **Audit.** Another home checking that a home's new log summary extends the previous one, and cosigning it. An identity may require that its receipts be audited.
- **Route.** Where the identity's content of a given type can be found (an outbox route), or where others deliver acts addressed to the identity (an inbox route).
- **Link.** A two-way statement, a claim by one side and a confirmation by the other, that two identities belong to the same entity. One side may be an account on another protocol. Its purpose is to let other protocols and services bind their accounts to a MOR identity, such as signing in with MOR, and to let anyone who wishes build bridges.
- **Succession.** A declaration, carried in a rotation, naming the identity that succeeds this one.
- **Homeless rotation.** A rotation signed with the current safety key that names new homes and counts without receipts from the old ones, when those homes are gone.
- **Closure.** A declaration, carried in a rotation of a home's operator, that the home stops serving every identity.

## Encoding and conventions

*The envelope itself is defined by the Envelope MIP. This section repeats only what Identity needs.*

**Encoding.** Every act is encoded in deterministic CBOR (RFC 8949, section 4.2.1, core deterministic encoding). A verifier MUST reject any act whose bytes are not in that encoding. Formats are written in CDDL (RFC 8610). Maps use small integer keys. Every `tstr` is canonical text (Text MIP), including address hints; a genesis with a trailing space in a hint is invalid. The core sets no length bound; homes set their own policy.

**Hashes.** Every hash is SHA-256, 32 bytes. A tagged hash is computed as in BIP-340:
`tagged_hash(tag, x) = SHA-256(SHA-256(tag) || SHA-256(tag) || x)`.
*Tags keep the hashes of different kinds of object apart, so one can never be passed off as another. A successor protocol MUST use a different tag prefix, so its acts can never replay here (Production).*

**Act id.** The act id is `tagged_hash("MOR/act", outside)`, where `outside` is the encoded outside of the act, which commits to its locked inside (Envelope MIP). The signature is not part of the act id, so a signature can never change which act is meant.

**Signature schemes.** A scheme is named by a founding number, or by the hash of a signature-scheme specification (Production) that defines its key encoding, signature encoding and verification.

| Scheme | Name | Public key | Signature | Used by |
| --- | --- | --- | --- | --- |
| 1 | Schnorr over secp256k1 (BIP-340) | 32 bytes (x-only) | 64 bytes | signing keys |
| 2 | SLH-DSA-SHA2-128s (FIPS 205) | 32 bytes | 7,856 bytes | safety keys |
| 3 | SLH-DSA-SHA2-128f (FIPS 205) | 32 bytes | 17,088 bytes | safety keys |
| hash | as the specification defines | as defined | as defined | either, as the specification says |

A signature always signs the 32-byte act id. SLH-DSA signatures use the context string `MOR`. Both SLH-DSA variants are allowed; the owner's client chooses. The small variant (2) is recommended. A client that meets a scheme it does not implement MUST treat the act as unknown, never as valid. *A rotation's own validity never depends on the kind of everyday key it installs, so every client verifies the rotation; only acts signed under the new scheme are unknown to a client that lacks it. This is how everyday keys migrate to a post-quantum scheme before a break: by adoption, with no change to the core (F54).*

**Safety key commitment.** A safety key is committed as `tagged_hash("MOR/safety", scheme || key)`, where `scheme` is the one-byte number or the 32-byte specification hash, and `key` the public key.

**Spec hash.** Every act names the specification that defines its type by that specification's hash. For the acts below it is the hash of the frozen text of this MIP, written `IDENTITY` here.

## Act formats

### The envelope

Every act is an Envelope MIP act: an outside (signer, binding, commitments, and for a public act its content key), a locked inside (spec, type, prev, objects, payload, position, summary, acks, refs, hint, salt), and a signature. Below, "signer" and "binding" are outside fields; "prev", "objects" and "payload" are inside fields.

**Every act defined by this MIP is public:** its content key travels on its outside, so homes, auditors and anyone checking an identity can open it. They are the public face of an identity (F29).

Every act has exactly one signer. An act that needs the agreement of two identities, such as a link, is made of two acts: one by each, the second naming the first.

`prev` holds one act id in the ordinary case, and none (an empty array) when the act starts a new sequence (F24). Genesis and rotations carry neither `binding` nor `prev`: they belong to the identity chain, not to a sequence.

```cddl
hash   = bstr .size 32
scheme = 1 / 2 / 3 / hash
```

### Shared parts

```cddl
signing-key   = [ scheme, key: bstr ]
safety-commit = [ scheme, commit: hash ]

home      = [ operator: hash / null, hint: tstr ]   ; null: self-hosted, operated by this identity
home-rule = [ 0, index: uint ]                      ; one authoritative home
          / [ 1, threshold: uint ]                  ; a majority of homes

audit = [ threshold: uint, auditors: [+ hash] ]     ; cosignatures required, and from whom

declaration = [ spec: hash, kind: uint, value: any / null ]   ; null removes the kind
successor   = [ protocol: tstr, identifier: bstr ]  ; protocol "mor" for a MOR identity
```

An address hint is where the home can currently be reached. It is not checked: the operator's identity is what counts, and the operator announces a new address through its own routes, so a home can move servers without any owner rotating. A null operator means self-hosting: the identity runs its own home. Several null entries count as one operator, the identity itself; an identity naming its own hash as operator in a rotation is the same as a null entry. *Genesis needs the null form because it cannot name its own identity hash, which does not exist yet.*

### Types defined by this MIP

| Type | Name | Signed by | Adds to |
| --- | --- | --- | --- |
| 0 | Genesis | first signing key | identity chain |
| 1 | Rotation | revealed safety key | identity chain |
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

*Type 11, home closure, existed in draft 6 as an everyday act and is retired: a home closes by a rotation of its operator (F56). The number is not reused.*

### Genesis (type 0)

```cddl
genesis-payload = {
  0 => signing-key,       ; the first signing key
  1 => safety-commit,     ; commitment to the first safety key
  2 => [+ home],          ; one or more homes
  ? 3 => home-rule,       ; only with several homes; absent means the default (rule 5)
  ? 4 => [+ declaration], ; high-risk settings defined by higher MIPs
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
  3 => safety-commit,      ; commitment to the next safety key
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

Outside: `signer`, no `binding`. Inside: `spec`, `type` 1 and `payload`, with no `prev`. The signature is by the safety key committed in the previous identity-chain act; its public key is revealed in the signature itself.

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

A confirmation names the claim in `objects` and has an empty payload; it is signed by the MOR identity the claim names. When the other side is an account on another protocol, it confirms instead by signing the claim's act id in its own protocol; that signature is carried in the claim's proof field, and a cMIP for that protocol defines how to check it. Either side may start: an account elsewhere can sign first, and the MOR identity then publishes the claim carrying that proof. A termination names the claim in `objects`, has an empty payload, and is signed by the MOR side; an account elsewhere ends a link by the means its own protocol offers. A private link is stored as encrypted acts, in the form the Envelope MIP defines.

### Log summary (type 9) and cosignature (type 10)

```cddl
log-summary-payload = {
  0 => uint,          ; size: number of receipts in the home's log
  1 => hash,          ; root: Merkle tree root over the receipts' act ids, in log order
  ? 2 => hash         ; the home's previous log summary; absent for the first
}
```

The Merkle tree is built as in RFC 9162, section 2.1, with SHA-256. A receipt's log position is its index in that tree. Proofs are not acts: a home serves them on request, alongside the summary. An inclusion proof shows that a receipt sits at its position under a root; a consistency proof shows that a later summary extends an earlier one.

A cosignature names the log summary in `objects` and has an empty payload. It is signed by the auditing identity.

How often homes publish summaries, and which homes audit which, is left to the homes and the market. The core defines only the acts, and the yes-or-no checks below.

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

An objection and an absence statement name the homeless rotation in `objects`. *Because nobody can know an act id before the act exists, an objection naming a homeless rotation proves the home was alive after that rotation was made, and an absence statement proves the auditor looked for the home after it was made. No clock is needed.*

### Escape endorsement (type 14)

An escape endorsement names a homeless rotation in `objects`. Its payload may list, under key 0, earlier rotations at the same position that the owner abandons (for example one a home refused); an abandoned rotation can never count afterwards. It is signed by the owner's current signing key: the one bound by the identity-chain act just before the homeless rotation. A homeless rotation with an endorsement carries both of the owner's keys: the safety key in the rotation, the signing key in the endorsement.

## Verification procedures

A verifier runs these checks in order. Any failure makes the act invalid.

### Every act

1. Decode the act; reject it unless it is deterministic CBOR in the Envelope MIP's shape.
2. Check that it is public: its content key is on the outside, and it opens the inside, which matches the inside commitment.
3. Compute the act id from the outside.
4. Check that the scheme is one this client implements and the signature is valid for the act id under the key in the signature. A scheme this client does not implement makes the act unknown, not invalid.

### Genesis

1. `signer`, `binding`, `prev` and `objects` are absent.
2. The key in the signature equals the signing key in the payload.
3. At least one home is declared.
4. If a home rule is present: the homes have at least two distinct operators; an index is lower than the number of homes; a threshold is greater than half the number of distinct operators and no greater than that number. Homes are counted per operator: several homes run by one operator count as one, since one stolen key signs for all of them.
5. If an audit requirement is present: at least one auditor is declared, and the threshold is at least one and no greater than the number of auditors.

### Rotation

1. `signer` is present; `binding` and `prev` are absent.
2. The previous act named is the signer's identity-chain act at position (this position minus one).
3. The signature's scheme and key hash to the safety commitment of that previous act: `tagged_hash("MOR/safety", scheme || key)` equals it.
4. A new signing key and a next safety commitment are present.
5. Any new home rule or audit requirement meets the conditions for genesis, counted against the new set of homes if one is given.
6. A closure flag is valid on any rotation; it has effect only for identities whose declared homes name the signer as operator.

### Everyday acts (types 2 to 14)

1. `signer` and `binding` are present, and `prev` is present.
2. `binding` names an act of the signer's identity chain that counts, and the key in the signature equals the signing key that act set.
3. If a later rotation of the signer counts, the act's status follows validity rules 15 to 17.

### Receipt

1. **The receipt names a real act.** The verifier holds the identity-chain act the receipt names; that act passes the checks for its type (genesis or rotation); its identity hash, or its signer, is the identity the receipt names; and its position is the position the receipt states. A receipt that fails this check is neither support nor conflict: it is ignored for every purpose below.
2. The receipt is valid as an everyday act of the home's operator.
3. The home is declared in the home set in effect for that chain position: the homes set by the identity-chain act at the position before; or, for a homeless rotation, a home in the new set it declares (homeless procedure, step 5). *A homeless rotation leaves homes that are gone, so its receipts can only come from the homes it names (F86).*
4. If audit is required: an inclusion proof shows the receipt at its log position under a log summary of the home carrying at least the required number of valid cosignatures from the declared auditors. Otherwise the receipt does not count. The audit requirement that applies is the one the named rotation itself declares, or, if it declares none, the one in effect before it.
5. A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary: a receipt under a cosigned summary can never be voided by the operator's rotation.
6. A receipt voided by the operator's rotation that another identity acknowledged makes that chain position contested. It never counts as support toward a home rule.

A self-hosted home signs no receipts: the rotation the identity itself serves stands in for one (see Which rotation counts).

### Conflicting receipts

Two receipts that pass check 1 from the same operator, for the same identity and chain position but different acts, are a conflict, even if they come from different relays of that operator. *After check 1, a conflict needs two genuine rotations at one position, which needs the safety key. A stolen operator key alone can no longer touch any identity's chain (F53).*

1. While a conflict stands, neither receipt counts, and that home counts for nothing at that position. The identity is contested there, not frozen.
2. The conflict ends when one of the two receipts becomes void: through the home's own rotation, or, for an identity that requires audit, because only one of them is included under a cosigned log summary.
3. The home is proven dishonest for that identity **at that position** only if both receipts remain valid after the home's rotations, or both are included under cosigned log summaries. From then on, its receipts count for nothing for that identity at positions after that one. Its receipts at earlier positions keep counting. *A thief holding the safety key and a bad home may contest the future; they cannot erase the past (F55).*

### Log summaries and audits

1. A home MUST NOT sign two log summaries of which neither extends the other. Two such summaries carry no verdict on any receipt: auditors MUST NOT cosign further summaries of that home, and clients SHOULD flag the home to its owners. Receipts already under a cosigned summary stay protected; the rest are judged as before.
2. An auditor MUST check a consistency proof from the last summary of that home it cosigned before cosigning a new one, and MUST NOT cosign two summaries of the same home of which neither extends the other.
3. A cosignature counts only if its signer is declared as an auditor by the identity whose receipt is being checked.

### Homeless rotation

A homeless rotation at position n counts only if all of the following hold:

1. It is a valid rotation with the homeless flag, and it declares a new set of homes.
2. No rotation at position n counts under the old home rule. A rotation that does, whenever its receipts appear, beats the homeless rotation.
3. No valid objection naming it exists from any home of the old set, except a home proven dishonest for that identity at an earlier position.
4. Enough old homes are gone that the old rule can no longer be met: the single or authoritative home, or homes of more than (number of distinct operators minus threshold) operators under a threshold. A home counts as gone when:
   - a rotation of its operator that counts declares closure; or
   - the identity requires audit, and at least the required number of its declared auditors have signed absence statements naming the rotation and that home; or
   - the identity does not require audit, and the verifier itself has tried and failed to reach the home.
   A self-hosted home is never gone: the owner is the home, and re-homes by serving a rotation from anywhere.
5. Receipts from the new homes meet the new home rule, judged under the audit requirement this rotation declares or inherits.

**Finality.** A homeless rotation at position n is final once a rotation at position n plus one counts under the home rule the homeless rotation declared, unless it counts only through the verifier's own failed attempt (below). After that, no later objection or receipt can overturn it. *Nobody can name an act before it exists, so anything surfacing after the next rotation is late by construction. No clock, no anchor, no higher layer (F63).* Until then it is provisional.

**Re-homed without audit.** A homeless rotation that counts only through the verifier's own failed attempt (the last case of step 4) MUST be shown as "re-homed without audit", and keepers, vault payments and agreements MUST NOT rely on it; everyday acts may. It is never made final by the next rotation: steps 2 and 3 keep applying, so a valid objection from a home of the old set voids it whenever it surfaces, and with it every rotation built on it. The latest act that counts is then the one at position n minus one. It is final like any other homeless rotation only once it counts through something other than the verifier's attempt: a closure by the old home's operator (step 4, first case), or an escape endorsement (below). *The finality reasoning above holds for acts that did not exist yet, not for an objection that existed but was kept from arriving. A thief holding the safety key controls the next rotation and chose the homes it counts under; if that rotation made the first final, a censor who blocks the real home could make a theft final inside its borders (F87).* *Cost, stated: an honest owner whose single home vanished without closing, with no auditors, stays re-homed without audit unless they endorse the homeless rotation with their current signing key. Only an owner who has also lost the signing key stays so for good: a rare case.*

**Escape with both keys.** A homeless rotation that has a valid escape endorsement counts without steps 3 and 4: objections do not void it, and the old homes need not be gone. Steps 1, 2 and 5 still apply, so a rotation that counts under the old home rule at the same position still beats it, except a rotation the endorsement lists as abandoned. *This is the way out from a home that is alive but hostile: it can refuse the owner, but it cannot hold an owner who proves both keys.*

### Objection and absence statement

1. Each is valid as an everyday act of the home's operator or the auditor.
2. An objection counts only from a home in the old home set of the identity it names, and not from a home whose operator's counting rotation has declared closure. An absence statement counts only from an auditor that identity declares.

### Resolving an operator

To check a receipt, a verifier needs the operator's identity chain, which it obtains from the operator's own homes, like any identity's. A self-hosted identity is resolved from its own home, on its own signatures. When resolving operators leads back to an identity already being resolved, the verifier accepts that identity's chain on its own signatures, as for a self-hosted identity.

### Which rotation counts

For each position n of an identity chain, starting at 1:

1. Take the home set and home rule in effect: those set by the act that counts at position n minus one. If several homes are declared and no rule, the default rule of rule 5 applies.
2. Collect the receipts for position n from those homes that pass the receipt checks. Leave out receipts that are void, receipts in a standing conflict, and every receipt from a home proven dishonest for this identity at an earlier position. For a self-hosted home, the rotation the identity itself serves at position n stands in for a receipt; two different rotations served at one position are a conflict.
3. Apply the rule:
   - **One home, or an authoritative home:** the rotation that home has a receipt for counts.
   - **Threshold k:** a rotation counts if homes of at least k distinct operators have receipts for it.
4. If no rotation counts at position n under the rule, a homeless rotation at n may count under the homeless procedure.
5. If nothing counts at position n, later positions are not evaluated: the latest act that counts is the one at n minus one.

### Declarations, succession, routes, names and links

A disputed act never counts when choosing the latest value of anything below. *An act is disputed only by the rotation rules of this MIP (rules 15 to 17). No act of a higher layer changes that status; a contest (Law) is an objection shown alongside what it names and changes nothing here (F69).*

1. **Declarations:** for each spec and kind, the entry in the counting identity-chain act with the highest position counts. A null value means the kind is not declared.
2. **Succession:** the successor field in the counting rotation with the highest position that carries one counts; null means no succession.
3. **Routes:** follow the routes chain from version 1; each act must name the previous one and carry its version plus one. The latest act of an unbroken, unforked chain counts. If two valid routes acts name the same predecessor, the routes are contested from that point: clients use the last act before the fork and warn the owner, who settles it by rotating. A fork behind an act the owner's later rotation kept is settled by that rotation; clients need not rewind past it.
4. **Names:** a name counts while its name act is valid and no valid withdrawal by the same identity names it.
5. **Links:** a link counts when a valid claim and a valid confirmation by the identity it names both exist, and no valid termination by either side names the claim.

## Validity rules

### Signatures and binding

1. A verifier MUST run the verification procedures above. In particular, it MUST check that the signature is valid for the key it names, and that the binding names an act in the signer's identity chain that bound that key.
2. An act signed with a safety key MUST be a rotation. Any other act signed with a safety key is invalid.
3. A signing key MUST NOT sign acts that add to the identity chain.

### Genesis

4. Genesis MUST be signed by the signing key it declares, and MUST declare at least one home.
5. With several homes, genesis MAY declare a home rule, in one of two forms: one named authoritative home, or a threshold greater than half the distinct operators of the declared homes. If it declares none, the default applies: the majority rule, with a threshold greater than half the distinct operators, computed from the home list; or, when one of the homes is self-hosted, that home is authoritative and the others are backups (F59, F62). *One option is forced when none is selected; the default is always one of the declared forms, never a third, weaker rule.*

### Rotation

6. A rotation is valid only if: it names as its predecessor the identity-chain act at its own position minus one; the hash of the revealed safety key equals the hash committed by that predecessor; its signature is valid under the revealed key; and it commits the hash of a next safety key.
7. A rotation counts once receipts from the homes required by the home rule show they hold it. Until then it is pending, and acts under its new key are pending too. Receipts are proof, not permission: a home that holds a valid rotation cannot withhold its receipt without breaking rule 10a. *A withheld receipt leaves no evidence, though, which is one reason to declare several homes.* *Anyone who accepts an act under a pending key does so at their own risk, since the rotation may never count.* A self-hosted identity's rotation counts on the rotation alone.
8. The protocol does not restrict why an owner rotates. Rotation is expected to be rare.
8a. *Client conformance.* A client MUST submit the exact same rotation bytes to every home, including when resubmitting after a refusal, and MUST NOT sign a second, different rotation with the same safety key. Two exceptions, each allowed once: after a homeless rotation is voided by an objection, the owner MAY sign one normal rotation with the same safety key; and after a normal rotation is refused by the homes that count, the owner MAY sign one endorsed homeless rotation (an escape) with the same safety key, whose endorsement lists the refused rotation as abandoned. *SLH-DSA is stateless and is not weakened by a few signatures; the single-use rule exists so that an owner never has two competing rotations in play. "Each allowed once" cannot be checked by a verifier; it is a client and Module rule, and the air-gapped safety key Module enforces it.*
8b. An entry in the declarations slot is valid only in genesis or in a rotation that counts. The latest such entry of each kind counts; a null value removes the kind. Higher MIPs define the kinds and what they mean.
8c. A rotation MAY declare closure. Closure ends the signer's role as a home operator for good; it does not affect the signer's own sequences or identity. *Closing a home is a rare, force-majeure case; spending a safety key on it is warranted, and it means a stolen everyday key can never close a home (F56).*

### Homes

9. A home MUST check a rotation's validity before storing it, and MUST NOT store an invalid one.
10. A home MUST NOT drop a valid rotation it has accepted, and MUST serve the full identity chain it holds.
10a. A home MUST sign a receipt for every identity-chain act it accepts, and MUST serve its receipts with the chain.
10b. Two receipts that count from the same home for different acts at the same position of the same identity chain are a conflict. While it stands, the identity is contested at that position, not frozen. Anyone may publish the pair, and clients SHOULD flag the home to the owner.
10c. Clients SHOULD rely on receipts, not on a home's unsigned answers.
10d. A home is proven dishonest for an identity at a position only when a conflict there survives the home's own rotations and, where the identity requires audit, both receipts sit under cosigned log summaries. Its receipts then count for nothing for that identity at later positions.
10e. An identity MAY require audited receipts, declaring its auditors and how many cosignatures a log summary needs. The requirement is declared in genesis or a rotation, so only the safety key can change it. Auditing is additional security, never compulsory. Receipts for a rotation are judged under the requirement that rotation declares, or inherits if it declares none, so an owner can always drop or replace auditors who have stopped cosigning (F60).
10f. An owner who relies on a single home or an authoritative home SHOULD be told plainly that the home's key security is effectively part of their own.
11. A home that holds a valid rotation MUST reject any other rotation revealing the same safety key. The first valid rotation a home holds wins at that home, and its receipt fixes that order.
11a. A home of the old set that sees a homeless rotation for an identity it serves MUST NOT hold it as that identity's rotation. It SHOULD sign an objection naming it, and it remains open to a normal rotation from the owner.
12. A home MAY apply its own conditions before accepting a rotation (for example proof of a registered device). A home's acceptance conditions can refuse the owner as well as a thief. Where a condition depends on a device the owner may lose, losing that device at a single or authoritative home can mean losing the identity: the normal rotation is refused, the homeless rotation is objected to, and the escape needs the signing key that was on the device. *That risk is the owner's choice, and it is survivable exactly when the signing seed is backed up apart from the device (rule 37).*
12a. *Client conformance.* A client MUST NOT choose a device-bound acceptance policy at a single or authoritative home by default. Where the owner chooses one, the client MUST say what it costs, and SHOULD require a backup of the signing seed first.
13. A home SHOULD store and serve the identity's latest routes act, name acts and public links, and MAY store encrypted private links.
14. A client SHOULD consult the homes before relying on an identity's act. Keepers MUST (see Law).

### Status of an act after a rotation

Each rotation judges only the acts signed with the key it replaces. For such an act:

15. If it lies within the rotation's kept ancestry and is not listed as disowned, it is valid, however old.
16. If it lies outside the kept ancestry, or within it but listed as disowned, it is void, unless another identity acknowledged it (Envelope) or a named keeper recorded it before recording the rotation (Law); then it is valid and shown as disputed. A keeper record or acknowledgement counts only alongside the act it names (Envelope, Law). *Disowning an act no longer costs the owner the genuine acts that followed it: later acts in the line stay valid, because their validity rests on being inside the kept ancestry, not on the disowned act's (F57).*
17. An act signed with the old key in a sequence the rotation does not name is outside the kept ancestry. A disowned hash that is not in the kept ancestry has no effect. Clients SHOULD track every sequence the owner has started, on any device, and warn before a rotation that omits one.

These rules are part of validity and MUST give the same answer to every conforming verifier holding the same identity chain, acknowledgements and keeper records.

18. *Client conformance.* Clients MAY collapse disputed acts older than the rotation that voided them, showing a count rather than each act. The status itself never changes.
18a. A client MUST implement every MIP that defines an act it acts on. A client that meets an act defined by a MIP it does not implement MUST show that act as unknown, never as valid. In particular, a client that acts on agreements MUST implement Law.

### Several homes

19. A declared home rule decides which rotation counts when homes disagree. Both declared forms ensure that at most one of two competing rotations can ever count. If none meets the rule, the identity is contested until one does; no rotation counts meanwhile.
20. With several homes and no declared rule, the default of rule 5 applies.
21. A rule changed in a contested rotation takes effect only once the contest is settled. An invalid rotation never counts.
22. A home left holding a losing rotation is outvoted. The owner may drop it in a later rotation.
22a. A self-hosted identity is trusted on its own signatures: its rotation counts with no receipt and no first-held-wins. A thief holding its safety key wins at once, as at a single lax home. *Self-hosting is a trust model, not a home like any other; the risk is the owner's choice, and other homes declared beside a self-host are backups by default (F62).*

### Links and outside identities

23. A link counts only when both sides have signed: the claim and a confirmation, in MOR or through a proof from the other protocol. A claim without a confirmation is not a link, and clients MUST NOT display it next to the identity it names.
24. Either side MAY end a link alone. Ending stops the link going forward; it does not erase that the link existed.
25. A link gives no authority. Delegated authority uses grants (Law).
26. Copies of a private link MUST be encrypted separately, so that stored copies cannot be matched to each other. The owner MAY store a private link under only one identity, or delay the second copy.

### Succession

27. A succession is valid only as part of a valid rotation that counts. A succession in any other act is invalid.
28. The latest rotation that counts decides the succession. A rotation without a succession field leaves the previous succession in place; ending a succession requires a rotation that says so.
29. Declaring a succession does not end the identity. Both may coexist while followers and agreements move across.

### Homeless rotation

30. A homeless rotation lets an owner holding the current safety key leave homes that are gone, with no receipt from them. It counts only under the verification procedure above.
31. A rotation that counts under the old home rule always beats a homeless rotation at the same position.
32. A single valid objection from a live home of the old set voids a homeless rotation. *This is what stops a thief holding the safety key from using the homeless path to get past careful homes.*
32a. A homeless rotation that counts only through the verifier's own failed attempt to reach an old home is never made final by the next rotation: a valid objection voids it, and every rotation built on it, whenever the objection surfaces (F87).
33. A client meeting a homeless rotation MUST first try to reach the old homes and ask for an objection or a normal rotation.
34. A home that closes SHOULD do so by a rotation of its operator declaring closure, so that its identities are provably homeless. An operator who has lost the safety key cannot close gracefully; its identities rely on auditors' absence statements or the verifier's own attempt.
35. Clients SHOULD recommend declared auditors to owners with a single home. *Without auditors, an owner whose home vanishes without closing is re-homed only on each client's own failed attempt to reach it, and a thief able to cut a victim off from the home could exploit that until the home's objection gets through; under rule 32a the thief can never make it final.*
36. A homeless rotation endorsed with the owner's current signing key cannot be voided by an objection. An owner holding both keys can always leave homes that refuse them.
37. Clients and key Modules SHOULD keep the signing key and the safety key separate, from separate seeds and on separate devices where possible, and SHOULD back up both seeds. *Holding both keys is the strongest proof of ownership the protocol sees, so a thief who steals both can also leave the owner's careful homes; and a backed-up signing seed is what makes a lost device survivable at a strict home.*

### Reaching an identity

38. Any two identities can find each other without already sharing a relay: an identity's home is known from its declaration, anyone can query the home, and the home serves the routes, which may include an inbox. An act counts for a verifier only once the verifier holds it; nothing forces propagation, and delivery is the signer's interest (Envelope).
39. A thief holding the signing key can redirect the inbox route until the owner rotates, as with the encryption key (Envelope). Deliveries made into that window go where the thief pointed; the rotation voids the thief's routes act, and the sender re-delivers. *The window is the same one the encryption key already has; no new exposure.*

## Tasks

- **Identity proofs and credentials.** A cMIP accepts an identity hash and a claim, and produces a verification answer (valid, invalid, pending, unknown) with the hash of the module that computed it. Sign-in flows are built on this task.
- **Naming.** A cMIP accepts a name and produces an identity hash, or accepts an identity hash and produces its names. A name resolves only if the identity signs it.
- **Outside link proofs.** For a given protocol, a cMIP accepts a link claim and its proof, and produces a verification answer (valid, invalid, unknown): whether the account named really signed the claim's act id. One cMIP per protocol; clients opt in to the protocols they support.

Bridges themselves, the software that carries content, messages or payments between MOR and another protocol, are Modules built on these cMIPs and on grants.

A collective is an identity like any other. Its keys may be held under its founding agreement's key grammar (Law): by one holder, by a threshold of members producing one ordinary signature, or by a custodian. Every grammar leaves a way to rotate that needs less than every member (Law, F77). Identity sees only the resulting signatures.

Key storage, backup and recovery are Modules built on this vocabulary; they need no task because they create no act the core must read. Signature-scheme specifications are published through Production; a new everyday-key scheme is adopted by clients implementing it, and installed by rotation.

## Reasoning

- **The hash is the identity, not a key.** *Keys can be lost or stolen; an identity that is a key dies with it. A hash of genesis lets keys change while everything pointing to the identity stays valid.*
- **Two keys with different jobs.** *The signing key is exposed daily, so its loss must be survivable. The safety key is used once and kept offline, so it can afford heavy, post-quantum cryptography. Committing each safety key by hash before it is needed means a replacement always exists before the key it replaces is used.*
- **Schemes are named, not fixed.** *A scheme can be a founding number or the hash of a specification. Nothing in a rotation's validity depends on what kind of everyday key it installs, so when a post-quantum everyday scheme is standardised, owners migrate by rotating to it and clients by implementing it. Migration must come before a break: after one, everything signed with the old scheme can be forged, homes and auditors included, and only owners who hold both keys still leave.*
- **Genesis is signed with the everyday key, and that is safe.** *Forging a genesis only creates a different identity, never a copy of an existing one, because the identity hash fixes the original.*
- **Rotations are large by design.** *A post-quantum signature makes a rotation several kilobytes. For an act this rare, that is a deliberate trade, and implementers should not try to shrink it.*
- **The identity chain holds keys only.** *The home then needs to know nothing about what the identity does: messages, media and money live on whatever relays the owner chooses. Private acts never reach the home.*
- **Sequences, not one history.** *Hash links work across relays, so the owner may keep acts in any number of lines, per layer or per device. A rotation needs only the latest genuine act of each line to say what survives.*
- **Nothing relied on is silently erased.** *An act outside the kept ancestry, or disowned inside it, is void only if nobody else relied on it in a way the protocol can see. Otherwise it stays visible as a dispute. Disowning costs the owner nothing else: the genuine acts after a thief's act stay valid.*
- **A home verifies but does not vouch.** *Everything it serves can be re-checked, so a dishonest home can hide or delay a rotation, never fake one. Homes guarding acceptance are a market service, not a protocol duty.*
- **Homes are relays, run by operators.** *A relay is infrastructure, not an identity. Its operator's ordinary identity signs what the home states, so the operator's keys can rotate like anyone's, and a stolen key's forged receipts die with the rotation. Counting homes per operator makes centralisation visible under honest labelling; it does not detect one company behind three operators, and the core does not try to.*
- **Receipts make homes answerable, and name real acts.** *What passes between a dishonest home and a thief is private and cannot be made public. A receipt makes it provable whenever it surfaces, so a home cannot tell different clients different stories without leaving evidence. A receipt counts only alongside the act it names, so a stolen operator key can produce nothing that changes any identity's chain: a conflict needs two genuine rotations, which needs the safety key. Because a home signs, it has its own identity, which lets it move servers without the owner spending a safety key.*
- **Homes audit each other.** *A stolen home key can sign false receipts, but it cannot get them into a log summary other homes have already cosigned. Auditing turns forgeries into self-evident ones without waiting for the home to rotate, and makes it impossible for a home to show different logs to different people without other homes cosigning both. Two non-extending summaries are a reason to stop auditing the home, never a verdict on its past receipts. The core defines the acts and the yes-or-no checks; how often and by whom is the market's business.*
- **Contested, not frozen; and never backwards.** *A conflict between two receipts can only come from two genuine rotations. Treating it as a contest that the home's rotation or an audit can settle means nothing freezes; and a dishonesty verdict is bound to the position where it was proven, so a thief with the safety key and a bad home can contest the future but never erase what came before.*
- **The log counter covers every identity.** *A home's log position increases across all the identities it serves, so a summary reveals the home's total volume. That is the price of one log that can be audited as a whole.*
- **Two forms of home rule, one default.** *With one authoritative home, the others are simple backups: copies to fall back on. With a majority threshold, they form a safety network: a thief must win over most of them. Both forms allow at most one competing rotation to count. An owner who declares neither gets the majority rule, computed from the home list, or, beside a self-hosted home, the self-host as authoritative. A single home stays possible at genesis: forcing several is too much friction for a new user; hygiene is recommended, never forced.*
- **Self-hosting is a trust model.** *An identity that is its own home has chosen to be trusted on its own signatures. Its rotation counts with no receipt, which is the only way it can rotate at all; a thief holding its safety key wins at once. That is the same risk as a single lax home, chosen knowingly, and the most sovereign setup is no longer the one that cannot rotate.*
- **First held wins.** *Without a third key, the only order the protocol can see is the order in which homes accepted rotations. A stolen safety key is like a stolen bitcoin key, unless the owner chose homes that guard against it.*
- **Links exist for signing in and for bridges.** *Signing in with MOR is essential, so the core gives every protocol and service one shared, two-way statement to read: this MOR identity and that account are the same entity. Anyone can build a bridge on it. A link needs both sides, otherwise anyone could claim to be anyone, and either side can leave, because nobody should be kept linked against their will. It confers no authority: a bridge that acts for someone needs a grant.*
- **High-risk settings ride on the safety key.** *Anything whose theft would cause lasting harm, such as where money is protected, who succeeds the identity, or that a home has closed, is declared in genesis or a rotation. A thief holding only the everyday key cannot change it. Higher MIPs decide what counts as high-risk; Identity only carries the slot.*
- **Every protection the owner chooses is removable by the safety key alone.** *An audit requirement is judged under the rotation that changes it, so auditors who have gone cannot lock the owner in. A device policy is the one protection the core cannot make removable, because a refusal leaves no evidence; so the text says what it costs, and clients never choose it by default.*
- **Succession rides on rotation.** *The safety key keeps its single use. Tying succession to it means a thief holding only the signing key can never redirect an identity's followers, agreements or money. Leaving is as protected as a rotation, and as rare.*
- **One signer per act.** *Every act is signed by exactly one identity, so every act sits cleanly in one sequence and has one binding to check. Agreement between two identities is expressed as two acts, one naming the other, which is also how the second side stays free to refuse.*
- **The signature is outside the act id.** *A signature can be recomputed in more than one valid way. Keeping it out of the act id means the id never changes, so every pointer to an act stays valid.*
- **Nobody dies with their home.** *In a one-home setup, a vanished home would otherwise mean the death of the identity. Silence cannot be proven, but life can: a home that names the homeless rotation in an objection proves it was alive after the rotation was made. So the homeless path is closed whenever the home can answer, and open when it cannot. Three layers set how sure the rest of the network can be that a home is gone: its operator's closing rotation, the owner's declared auditors, or, weakest, each client's own attempt. And a homeless rotation is final once the owner's next rotation counts, which every Identity client can check; except one accepted only on a client's own failed attempt, since a thief holding the safety key controls that next rotation and a censor can keep the objection from arriving. That one stays open to the objection for good, unless the owner endorses it with the signing key.*
- **Anyone can find anyone.** *Without a standard place to deliver, the largest relays become the only meeting points, which is centralisation by default. A reserved inbox route is the right of exit applied to communication: it is shared language, an identity may declare none, and relay operators decide whom they accept deliveries from and at what price.*
- **Losing the safety key is permanent.** *An owner who loses the safety key, and its seed, can never rotate, change homes or leave. The identity keeps working with its signing key until that is lost too. Back up the safety seed as carefully as the key itself.*
- **Protected history.** *Once other operators have cosigned a log summary, the receipts under it are part of shared history: the operator can no longer erase them, by mistake or on purpose. Identities that do not require audits trust their home for this, as before.*
- **Both keys always get out.** *A careful home's refusal and a hostile home's refusal look identical from outside, so the protocol cannot judge the home. It judges the owner instead: an owner who proves both keys can leave any home. Keeping the keys separate, and backed up, is what makes that proof strong and that exit available.*
- **The way out.** *The post-quantum safety key keeps continuity through a break of elliptic-curve signatures. It secures the exit, not what is left behind: history signed with the everyday key relies on anchoring before a break, and everyday keys should migrate to a post-quantum scheme before one.*

## Open technical parameters

Settled in this draft: hash function (SHA-256), encoding (deterministic CBOR), founding signature schemes and the specification-hash form, safety key commitment, receipt format, home address changes (through the home's own routes), routes with an inbox kind, closure by rotation.

Still open:

- How a home is queried: the request and response formats for an identity's chain, receipts, routes, names and public links.
- Efficient proof that an act lies within a kept ancestry (Envelope MIP: sequence position and running summary, with the test vector of F78).
- The encrypted form of private links (Envelope MIP).
- The final hash of this MIP, used as `IDENTITY` in every act it defines.

## Freeze scenarios

Components exercised (freeze test suite v13):

- Genesis, homes and routes, including an inbox route: all scenarios.
- Rotation by safety key, delivered at the home; pending until the home rule is met: 1, 5.
- Receipts naming real acts; a forged receipt changes nothing; conflicts only between genuine rotations; dishonesty bound to a position: 5.
- Competing rotation: first held by the homes that count wins; home acceptance policies; the lost device with a backed-up signing seed: 5.
- Home rules: authoritative, majority, majority by default; self-hosted default: 5.
- Self-hosted identity rotating with no receipt; the stated cost: 5.
- Identity chain of key events; rotation keeps the named acts' ancestry in each sequence; excluded or disowned acts void, or disputed if acknowledged or recorded; later genuine acts kept: 1, 2, 5.
- Routine rotation keeps unacknowledged history: 5.
- Audit requirement dropped by the rotation that drops it: 5.
- Closure by rotation; a stolen operator key cannot close a home: 5.
- Homeless rotation: closure, objection, auditor absence statements; receipts from the new homes; final once the next rotation counts; re-homed without audit never final by the next rotation, a censored reader, a thief's second rotation voided with the first: 5.
- Escape with both keys past a hostile home, including after a refused normal rotation: 5.
- Several unlinked identities; linking signed by both, ended by either; public or encrypted: 5.
- Succession: 5.
- Linking an outside identifier; signing in after a rotation: 5.
- Rotation to an everyday key of a new scheme; unknown to a client without it: 8.
- Two identities on disjoint relays reaching each other through homes and routes: 5.

## Choices introduced by drafts 2 to 8 (decided)

Suggested by Claude while writing the formats, and accepted by Nobody, allegedly, directly or through the review reports and findings he stamped.

1. **One signer per act.** Links become a claim plus a confirmation, and receipts, summaries and cosignatures are acts of the home's or auditor's own identity.
2. **Homes are relays run by operators** (F18). Receipts and other home acts are signed by the operator's identity; homes are counted per operator; a null entry means self-hosting.
3. **Routes form a chain with a version number** (F19), and carry an inbox kind (F70).
4. **Conflicting receipts make an identity contested, not frozen;** a receipt counts only alongside the act it names (F53); a dishonesty verdict is position-bound (F55).
5. **Both SLH-DSA variants are allowed,** small recommended; schemes may also be named by specification hash (F54).
6. **The signature is outside the act id,** so an act id never changes.
7. **Auditors are declared by the identity,** and a rotation's receipts are judged under the requirement it declares (F60).
8. **An objection from a home proven dishonest does not count,** so a dishonest home cannot keep an owner from leaving it.
9. **One normal rotation may follow a voided homeless rotation with the same safety key** (rule 8a exception).
10. **Escape with both keys** (F20). A homeless rotation endorsed with the current signing key cannot be blocked by objections. Keep your keys separate, and backed up (F61).
11. **Closure by rotation** (F56); **disowned acts void unless relied on** (F57); **majority by default** (F59); **self-hosting as a trust model** (F62); **finality by the next rotation** (F63).
12. **A homeless rotation's receipts come from the new homes it declares** (F86); **a homeless rotation accepted only on the verifier's own failed attempt is never made final by the next rotation** (F87).

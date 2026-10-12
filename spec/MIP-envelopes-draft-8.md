# MIP: Envelopes

*Draft 8, 12 October 2026: a transition draft, for Nobody, allegedly, to review and approve (F251). It is draft 7 (approved 5 October 2026, revised in place since, last for F237) written for plain reading, in Agreements draft 11's and Money draft 7's style. **The rewrite changes no rule.** How an act runs most of the time comes first and the mechanics of rare cases after; the rules are numbered afresh in reading order, each with its old number beside it; and "vow" replaces "announcement" (F241), the type number (5) and the wire format unchanged. Written against core v21, Identity MIP draft 11, Text MIP draft 6, Money MIP draft 7, Agreements MIP draft 11, Development MIP draft 6 and the findings F1 to F266. **Then a marked pass** (12 October 2026, after the draft's approval, for Nobody, allegedly, to approve; `docs/core-v22.md`) writes in F252, the one decided finding draft 8 had left out: a vow covers anything MOR cannot hash, existing or to come, marked "new in draft 8 (F252)" where it stands (section 9, and the vow's format), written against the six current drafts. The record of how each rule came about (the revision notes of drafts 4 to 7, "Decided for this pass", and the dates and words of each decision) stays in draft 7 and in the findings log; this draft does not repeat it. The freeze-ready draft that follows drops the old numbers.*

## How to read this draft

Normal text is the protocol. Italic text is commentary: reasons, examples and plain summaries. A plain summary in italics (*How it runs most of the time*) repeats what the rules say; where the two seem to differ, the rule's own text decides.

Draft 7 numbered three lists separately: the rules under "Chains, acknowledgements and references", the rules under "Relays", and the validity rules. Its numbers therefore repeat (each of the three lists has a rule 1 to 5). Each rule here shows its old number and the list it was in: "Rule 18 (was chains 4a)", "Rule 25 (was relays 1)", "Rule 3 (was validity 2)". The table at the end maps every old number to its new one. Code comments, tests, records and the other drafts (Agreements draft 11 and Money draft 7 among them) keep citing the old numbers until the freeze-ready draft; the table is how to find them here. Agreements rules are cited here by draft 11's numbers and Money rules by draft 7's; their own tables map the older ones.

The numbered steps of "How it fits together" (1 to 3) and of the sealed container (1 to 5) are steps of a format, not rules, and keep their numbers.

Two marks recur:

- *Mechanic, the vow grammar build:* a mechanical choice taken under Nobody, allegedly's delegation of mechanics, not a decision of principle.
- **New in draft 8 (Fxxx):** a statement the marked pass adds, from a decided finding.

The MIP has four parts. Part one is an act as it runs most of the time: its shape, public and private acts, private delivery, sequences, chains, acknowledgements and references, how acts reach people, media, vows, withdrawal, relays, and what a client does with what it does not understand. Part two is the rare case: theft of the signing key. Part three is the act formats, for reference. Part four is the tasks, the reasoning, the open parameters and the freeze scenarios.

## Purpose

The Envelopes MIP is the grammar every act is written in. It defines:

- the two parts of every act: a small **outside** that relays can see, and a locked **inside** that holds everything else;
- how content is locked, and how its key is made public or delivered privately;
- how acts name their type, link into chains, acknowledge and refer to each other, without a clock;
- how media is fingerprinted and published, and for whom;
- what relays do, how they commit to what they hold, and how acts reach the people they concern;
- how an offer of media is withdrawn;
- what a client does with an act it does not understand.

## Dependencies

Identity (signers, keys, bindings, sequences, routes) and Text (canonical text in every text field). Every client implements this MIP.

## Words used in this MIP

### Acts

- **Act.** Any signed object. Every act has an outside, a locked inside, and a signature.
- **Outside.** The part of an act every relay can read: only what a relay needs to store, route and check it.
- **Inside.** Everything else: type, pointers, payload. Always locked with a content key.
- **Specification.** The MIP or cMIP that defines an act's type, named by its hash.
- **Chain.** The acts on one object, each naming the act or acts it follows. Each MIP that defines an object defines its chain rules; this MIP defines only what all chains share.
- **Fork.** Two acts naming the same predecessor in the same chain.
- **Acknowledgement.** An act naming another identity's act, as received. Only act types defined by the Identity, Money and Agreements MIPs may carry one (F110).
- **Reference.** An act naming another act, or a web resource, without following or acknowledging it. A repost is a reference.

### Locking and delivery

- **Content key.** The key that locks one inside or one media object. A new one for every object.
- **Public act.** An act whose content key travels with it, on its outside. Anyone can open it.
- **Private act.** An act whose content key is delivered only to chosen recipients.
- **Key delivery.** An act that says which key opens which act or media object. Sent privately, it travels in a sealed container locked to the recipient's encryption key, or to a bare key the recipient supplied; published openly, it makes that act or media public.
- **Encryption key.** A public key an identity publishes so others can deliver content keys to it (F25).
- **Sealed container.** A wrapper that carries a private act and its content key to its recipients, locked to their encryption keys, and hides the sender from relays. Not an act.

### Media

- **Work hash.** The fingerprint of a work's complete plaintext.
- **Withdrawal.** An act marking a publication as no longer offered.

### Relays

- **Relay.** A server that publishes, fetches and mirrors acts and media, untrusted by default, operated by an identity (F18).
- **Commitment.** A relay operator's signed statement of the set of acts it holds.
- **Inbox.** A route of kind 1 (Identity) where others deliver acts addressed to an identity.

## Part one: an act as it runs most of the time

*How it runs most of the time: a signer writes an act's inside (its type, its pointers, its payload), locks it with a fresh content key, and signs an outside that commits to both the locked bytes and the unlocked inside. A public act carries its key on the outside, so anyone can open it; a private act reaches its recipients in a sealed container that carries its key, or has its key delivered by a key delivery that does. The act links into the signer's sequence and into the chains of the objects it touches. Relays store and pass on what they cannot read; a client shows as unknown what it does not implement.*

### 1. Every act

Every act names, inside, the specification that defines its type by hash, and a type number within it. *Since a specification's hash is unique, types can never collide, and no registry is needed.* The specification names its creator (Development). Every tag used by MOR begins with `MOR/`; a successor protocol MUST use a different prefix, so that no act of one protocol can be replayed in the other (Development).

**What a relay sees:** *who signed (or nothing, inside a sealed container), which recipients a delivery is for, the size, and whether the key is attached. Never the type, the thread, the payload, or who it answers.*

*The act's format, and how its lock and commitments fit together, are in Part three ("The act").*

#### Rule 1 (was validity 1). One shape, in deterministic CBOR

An act MUST decode as deterministic CBOR in the shape Part three gives ("The act"); an unknown key, outside or inside, makes it invalid.

#### Rule 2 (was validity 1a). No deeper than 128 levels

In an encoded act, and in an encoded inside, no data item is nested more than 128 levels below the outermost item (the outermost item is at level 0). An act that nests deeper is invalid, for every verifier (F91). *An application that needs deeper data carries it in a byte string, or as a media object, which the act does not decode.*

#### Rule 3 (was validity 2). The lock and the commitments match

The locked bytes MUST hash to the locked hash. Whoever unlocks the inside MUST check it against the inside commitment; an inside that does not match makes the act invalid.

#### Rule 4 (was validity 7a). The signature scheme

An act's signature scheme is checked as Identity defines: a scheme the client does not implement makes the act unknown, never valid.

#### Rule 5 (was validity 5). Canonical text

Every text field MUST be canonical text (Text MIP).

#### Rule 6 (was validity 6). Hints never decide

A hint MUST NOT be used for any validity decision.

### 2. Public and private

#### Rule 7 (was validity 3). A public act carries the key that opens it

**Public:** the content key sits on the outside (key 5). Anyone can open the act. The locked bytes and their key travel together.

A public act's content key MUST open its inside.

#### Rule 8 (was validity 8). Identity acts are public

Identity acts are the public face of an identity (F29): genesis, rotations, receipts, routes, names, encryption keys, links, log summaries, cosignatures, objections, absence statements, escape endorsements, witness acts. They MUST be public acts. *They go through the same lock as everything else, with their key attached, so every act has one shape.*

Identity acts MUST be public.

#### Rule 9 (was validity 9). A new key for every object

A content key MUST NOT be reused for two objects.

### 3. Private delivery

**Private:** no key on the outside. The key reaches each recipient in a sealed container: either with the act itself, or in a key delivery for an act the recipient fetches elsewhere (F99).

- **Encryption key.** An identity that wants to receive private content publishes an encryption key: a public act (type 4), versioned in its own chain like routes, changed with the signing key. *Its forks are in Part two; its scheme, X-Wing, and its format are in Part three.*
- **Key delivery.** An act (type 1) whose payload names the act whose content key it carries, or the publication whose media key it carries, and the key itself. Sent privately, it is a private act, addressed (`to`) to its recipient, and travels in a sealed container locked to the recipient's current encryption key; sent to a bare key the recipient supplied (a device or application key), it carries no `to`, and its container is locked to that bare key. Published openly, addressed to no one, it makes the act or media it names public. Key release may be delegated to a service through a grant (Agreements). Group keys, subscriptions and rights management are access modules.

Following the privacy principle, public receiver and private sender, a private act reaches its recipients inside a sealed container, with its content key. A sealed container is not an act, and relays carry it as opaque bytes. Relays see only the recipients, which are none for a delivery to a bare key, and the size. *The inner act is signed by its sender as any act; its recipient may later show it to anyone, and a private inner act stays locked unless its key is shown too.* *The container's format, and how it is locked, signed and opened, are in Part three ("Sealed container").*

#### Rule 10 (was validity 7). A private act counts only once opened

Rules about an act's inside can only be checked by those who hold its key. A client MUST NOT treat a private act as valid for anything that depends on its inside unless it has opened and checked it.

#### Rule 11 (was validity 10). A private act reaches its recipients with its key

A private act MUST reach its recipients in a sealed container that carries its content key, or have its content key delivered by a key delivery that does (F99).

A key delivery MUST name the act or publication whose key it carries; a private one MUST be addressed to the recipient whose encryption key its container is locked to, or, for a bare key, carry no `to`.

#### Rule 12 (was validity 10a). A container that fails delivers nothing

A sealed container MUST follow the format in Part three; a container whose signature, capsule or contents fail the checks of "Opening" (step 4) is invalid, and a client MUST NOT treat its inner act as delivered.

**Going public later.** The signer publishes a key delivery addressed to no one, with the key on its outside. *One act turns a private act public, for an embargo, a timed release, or disclosing a negotiation record (Agreements).*

### 4. Sequences

Every everyday act carries, inside, its position in the signer's sequence and a running summary of that sequence.

- **Single lines.** Within a sequence, every act names at most one predecessor. Parallel devices keep separate sequences.
- **Position.** The first act of a sequence (empty `prev`) has position 1; every later act has its predecessor's position plus one.
- **Running summary.** *How it is built, and its empty value, are in Part three ("The running summary").*

#### Rule 13 (was validity 4). Position and summary

An everyday act MUST carry a position and a running summary consistent with its predecessor (the empty summary for the first act of a sequence), and at most one `prev`.

*These make it cheap to prove that an act lies on the line leading to a later one, which is how a rotation's kept ancestry is checked (Identity).* Proving it for a private act needs that act's key, which its recipients and its signer hold.

### 5. Chains

#### Rule 14 (was chains 1). Chains

An act that belongs to an object's chain names, in `objects`, that chain and the act it follows in it: one entry normally, several where branches of one chain merge (same chain), or where one act belongs to several chains (different chains). A chain may branch and merge. *A collective keeps two chains (Agreements rule 58, F127): its decisions, and its actions, each action citing, on the chain named by the collective's own identity, the decision it acts under and the heads it joins: several entries naming one chain, a merge of its branches, as this rule already reads them.*

#### Rule 15 (was chains 2). Forks

Two valid acts naming the same predecessor in the same chain are a fork, provable from their signatures and insides. Whether a fork is normal or a conflict is defined by the MIP that defines the object (F4).

#### Rule 16 (was chains 3). Order without a clock

A chain's order records when acts were added to it, never when the things they refer to were created. Hints are never load-bearing. Every "before" in the core is judged inside one named chain, by reference to a specific act.

### 6. Acknowledgements and references

#### Rule 17 (was chains 4). Acknowledgements

An act acknowledges another identity's act by naming it in `acks`. It says only "I received this". An acknowledgement counts, for any purpose in the core, only alongside the act it names: a verifier that does not hold that act, or holds it and finds it invalid as an act, ignores the acknowledgement. *It keeps an act visible as a dispute after a rotation (Identity), turns a regretted sale into a visible dispute (Money), proves a negotiation thread complete and places a member's signature on a collective's line (Agreements).*

#### Rule 18 (was chains 4a). Who may acknowledge

Only an act whose type is defined by the Identity, Money or Agreements MIP may carry `acks` (F110). A text act, any other act of this MIP, and every act of a cMIP or Module MUST NOT carry `acks`; an act that does is invalid. *The rule limits which acts carry an acknowledgement, never which acts can be acknowledged: a post or a publication still becomes disputed, not void, after its signer's rotation when an Identity, Money or Agreements act acknowledges it (a witness act, a buyer's claim, a signature) or a keeper recorded it. To rely on a post or a message deliberately, an identity signs a witness act (Identity, type 15).*

Negotiation messages acknowledge the latest message received from the other side (Agreements rule 52). A negotiation message is an Agreements act type carrying text (Agreements type 18, F118), so it may carry `acks` under this rule; a text act in a negotiation thread may not, and is no part of the record.

#### Rule 19 (was validity 7b). An act that may not acknowledge, and does, is invalid

An act carrying `acks` whose type is not defined by the Identity, Money or Agreements MIP is invalid (F110). *A verifier needs the six MIP hashes to apply this, as it needs them for everything else; one that cannot tell which MIP an act's specification is shows the act as unknown, never as valid.*

#### Rule 20 (was chains 5). References

An act names other acts, or web resources, in `refs`, meaning only "look at this". A web reference may carry the hash of what was there when it was referenced, so readers can check it has not changed. A repost is a reference to a publication, never a publication of its own: it pays nobody by itself, and a reposter earns through a role share where the owners' split plan offers one (Agreements).

### 7. How acts reach people

An act counts for a verifier only once the verifier holds it. Nothing forces propagation; delivery is the signer's interest. *Four reaches, as a working picture: identity acts must reach the home, since their standing depends on it; acts that concern a counterparty (agreements, signatures, receipts, claims, key deliveries, obligations) should reach that counterparty; publications and posts are published on the signer's outbox routes for whoever is interested; drafts never leave.*

Clients SHOULD deliver an act that concerns a counterparty to that counterparty's inbox route where one is declared (Identity). Any two identities can find each other without already sharing a relay, through identity, home and routes. Whether a relay accepts deliveries, from whom, at what price and for how long, and whether it propagates to other relays, is the relay market's business; spam control, metadata privacy and gossip are cMIPs (F70).

### 8. Media

**Work hash.** The work hash is `tagged_hash("MOR/work", plaintext)`, over the complete plaintext of the work. For a text work, the plaintext is its canonical text. It is the same wherever the work travels and however it is locked or cut, and it is what ownership points to (Agreements).

**Publication.** A publication is an act of type 0 of this MIP. Its payload describes a media object. *Its format is in Part three ("Publication").*

Media bytes are always stored locked, with their own content key, the same way as an inside: XChaCha20-Poly1305 with the nonce in the payload and no associated data. The size (field 3) is that of the media once unlocked: what a reader and a media module need to know; a relay measures the locked bytes it stores for itself (F108). For public media, the key sits in the publication's payload. For media on sale, the publication is public (anyone can see the offer) but the media key is absent, and is delivered to each buyer. After unlocking, a buyer checks the plaintext against the work hash.

A publication is a neutral carrier: it never claims the work. A work is bound to its creators only by an explicit work claim (Agreements).

#### Rule 21 (was validity 14). Check the media against the work hash

A client MUST check unlocked media against the work hash before treating a purchase as delivered.

#### Rule 22 (was validity 14a). A size that does not match is shown

A publication whose size (field 3) is not the size of the unlocked media is shown as inconsistent (F108). *It cannot be judged without the media's key, so it is not a validity rule on the act; a client that unlocks the media checks it, as it checks the work hash.*

#### Rule 23 (was validity 16). For whom

A payment for a publication is owed to the identity in `for` if present, otherwise to the signer (Money).

Payment for a publication goes to the payee pointer of the identity named in `for` if present, otherwise of the signer (Money). *A false `for` can only send money to the identity it names, never to whoever wrote it, so nobody gains by lying in it. Whether a grant backs a publication made for another identity is Agreements' business (a collective's grantee signs with a grant key, so its publication is the collective's own and names no `for`, F128); an Agreements client may refuse a publication whose `for` is not backed by a grant it can check, and shows it so. A Money-only wallet needs nothing beyond this field (F68).*

**Buying a work under an Agreements claim** is a purchase only when the payment names that claim (Agreements rule 12, Money rule 18, F126): a Money-only wallet can pay a claimed work's publication, but its payment is no purchase and is owed back to it. *A plain publication of an unclaimed work is paid as before.*

**Parts, streams and live media.** Segmentation, chunk fingerprints, streaming and live media are defined by the cMIP the publication names; the fields of the publication then describe the whole, or a manifest of the parts. A live stream has no work hash until it ends; paid live access is sold through a standing offer (Agreements), not a publication. A stream that needs a name before it ends takes a vow's (below); everything else about it is the live media cMIP's (F237).

### 9. Vows

*"Vow" replaces "announcement" (F238, F239, F241); the act, type 5, and its format are unchanged, and the code already says "vow". "we must separate the claim and confirmation grammar from what will be claimed and confirmed … the core only wants to know whether it is confirmed, pending, or already contested" (Nobody, allegedly; F237).*

A vow is an act of type 5 of this MIP, naming in words **something MOR cannot hash, existing or to come** (new in draft 8, F252): a good in stock or to be made, a service, an hourly rate, storage, a seat, a work not yet made. **It is its own chain** (Nobody, allegedly: "it's a fingerprint for the announcement, since it will have its own chain it has a genesis"): its first act is its **genesis**, **whose id is its name for good**; a later version (a new date, a changed description) is signed again on that chain by the genesis's signer, naming the genesis and the version it follows, as an offer's and an agreement's versions do. The name is the vow's fingerprint, never a work hash.

*Its payload's format is in Part three ("Vow").*

Its `objects`: none on the genesis; a later version names `[genesis, previous]`, one entry beside any a collective's actions chain needs (Agreements rule 58). *Mechanic, the vow grammar build:* the type number, the field numbers and the chain entry.

- **A version counts** only signed by the genesis's signer, naming the genesis and a version of the same chain. A stranger's act naming the chain is no version of it. **Two versions naming one previous are the signer's fork, shown**, both standing (rule 15; as an offer's, Agreements OF4 a).
- **A rotation voids the signer's own acts after the kept tip, the genesis among them where it lies there; never a name others wrote down** (F237): what others signed naming the id (an offer, a stake, a claim) stands, pointing at a void act, shown so.
- **Offers naming it** sell it, with their words, and **each sale's state** (pending, confirmed or contested) are Agreements' (Agreements rule 13). **Nothing else is the core's** (F237): what is claimed or delivered and how it is confirmed; what a vow became and how claims reach it (an ordinary work claim, dated by itself, Agreements rule 7); quantities and seats; delivery points; kinds; and streams, whose segments, signers, closing, branches and recording are the live media cMIP's.

### 10. Withdrawal

#### Rule 24 (was validity 15). Who may withdraw, and what it does

A withdrawal is an act of type 3 of this MIP naming a publication in `objects`. It marks that publication as no longer offered.

A withdrawal is valid only if signed by the publication's signer or by the identity named in its `for` field.

- **Authority.** The publication's signer, or the identity named in its `for` field. No other authority exists at this layer. *A creator who wants to withdraw a publisher's publication of their work has Agreements' tools: a contest, and their own publication (F68).*
- **Effect.** Clients stop presenting the publication as available; offers attached to it close; no new content keys are released for it.
- **Past deals stand.** A payment arriving after the withdrawal creates no deal and an obligation to refund it (Agreements).
- **Relays are asked, not forced,** to stop serving it.

### 11. Relays

#### Rule 25 (was relays 1). Untrusted by default

Relays publish, fetch and mirror acts, media and sealed containers. Nothing a relay says is trusted unless it is signed.

#### Rule 26 (was relays 2). Operated by identities

A relay's statements are signed by its operator's identity (F18). Homes and keepers are relays in particular roles; an inbox is a relay in another.

#### Rule 27 (was relays 3). What relays check

A relay SHOULD check an act's signature and that its locked bytes match the locked hash. *It cannot, and need not, read a private act.*

#### Rule 28 (was relays 4). Commitments

A relay operator may publish a commitment: a public act (type 2 of this MIP) holding the Merkle root over the sorted ids of the acts it holds, and their number.

#### Rule 29 (was relays 5). Storage and delivery policy

Storage and delivery policy (what a relay keeps, whose deliveries it accepts, for how long, at what price) is the relay market's business.

### 12. Fail closed

#### Rule 30 (was validity 11). Nothing under an unknown specification

A client MUST NOT sign, pay or accept anything whose specification it does not implement. It shows such an act as unknown.

#### Rule 31 (was validity 12). Adopted by opt-in

A client MAY fetch an unknown specification by its hash, show it to the user, and adopt it by opt-in.

#### Rule 32 (was validity 13). The one exception: a text's format

The one exception is a text act's format (Text MIP): its text is always shown as plain text.

## Part two: rare cases

### 13. Theft of the signing key

- **The hijack window.** A thief holding the signing key can publish a new encryption key, and every private delivery until the owner rotates goes to the thief. The rotation voids the thief's act. *The consequence for a purchase is stated plainly: a seller who delivered a bought key into that window did nothing wrong, and still owes the buyer a new delivery once the owner has rotated, since the buyer paid and did not receive (Agreements). The window is the price of changing the encryption key with the signing key, and the same window applies to the inbox route (Identity).*
- **Forks of the encryption key.** A fork in the encryption key's chain is contested from that point, as for routes; a fork behind an act the owner's later rotation kept is settled by that rotation.

## Part three: act formats

### The act

```cddl
act = [ outside, locked: bstr, signature ]

outside = {
  ? 0 => hash,          ; signer: identity hash (absent only in genesis)
  ? 1 => hash,          ; binding: identity-chain act that bound the signing key; for a scoped key, the act installing it (Identity, F128)
  2 => hash,            ; inside commitment: tagged_hash("MOR/inside", inside)
  3 => hash,            ; locked hash: SHA-256 of the locked bytes
  4 => bstr .size 24,   ; nonce for the lock
  ? 5 => bstr .size 32, ; content key: present on a public act, absent on a private one
  ? 6 => [+ hash]       ; to: recipients' identity hashes (key deliveries, and acts addressed to someone); for a collective's act, every member among them, or the act public (Agreements rule 57, F126, F128)
}

inside = {
  0 => hash,            ; spec: the MIP or cMIP defining the type
  1 => uint,            ; type, numbered within that spec
  ? 2 => [* hash],      ; prev: previous act in the signer's sequence (at most one, F24)
  ? 3 => [+ object],    ; objects: the chain(s) this act belongs to, and the act it follows in each
  4 => { * any => any },; payload, defined by the type
  ? 5 => uint,          ; position in the signer's sequence
  ? 6 => hash,          ; running summary of the signer's sequence up to this act
  ? 7 => [+ hash],      ; acks: acts by other identities this act acknowledges; only on act types the Identity, Money and Agreements MIPs define (F110)
  ? 8 => [+ ref],       ; refs: acts or web resources this act refers to
  ? 9 => tstr,          ; hint: a timestamp or other hint, never load-bearing
  10 => bstr .size 16   ; salt: random, so the inside commitment cannot be guessed
}

object = [ chain: hash, predecessor: hash ]   ; the chain's root act, and the act in that chain this one follows

ref = hash                           ; another act, by its id
    / [ address: tstr, ? hash ]      ; a web resource, and optionally the hash of what was there

signature = [ scheme: 1 / 2 / 3 / hash, key: bstr, sig: bstr ]   ; scheme as Identity defines it
```

**How it fits together.**

1. The inside is encoded in deterministic CBOR, then locked with the content key using XChaCha20-Poly1305 and the nonce, with no associated data. The result is `locked`: the ciphertext followed by the 16-byte authentication tag (F90).
2. The outside commits to both: the hash of the locked bytes, so relays can check what they store, and the hash of the unlocked inside, so a reader can check that what they opened is exactly what was signed.
3. The act id is `tagged_hash("MOR/act", outside)`. The signature signs the act id.

*No associated data is bound to the lock: the outside already commits to both the locked bytes and the unlocked inside, so binding more would add nothing.*

*The salt makes the inside commitment impossible to guess: without it, anyone could hash "yes" and "no" and learn a private one-word reply.*

*Each `objects` entry names its chain, so two entries with the same chain are a merge of two branches, and two entries with different chains are one act touching two objects, such as a stake transfer on a work's chain and on the agreement's chain. A reader never has to guess which (F81).*

### Encryption key (type 4) and key delivery (type 1)

**The scheme: X-Wing (F98).** An encryption key, and a bare key, is `[scheme, key]`, in the form Identity defines for keys, in the same number space: founding number 4 is X-Wing, the hybrid of ML-KEM-768 (FIPS 203) and X25519, as specified in draft-connolly-cfrg-xwing-kem-11 ("X-Wing Construction"): a 1216-byte public key, a 1120-byte ciphertext, a 32-byte shared secret. Numbers 1 to 3 are signature schemes and are never encryption keys. A scheme may also be named by the hash of a key-exchange specification (Development); a client that does not implement it cannot seal to that key. *What is locked today stays locked if either half holds. The draft may change before it is final; the version MOR names is fixed by hash at the freeze, like any specification.*

```cddl
enc-key = [ scheme: 4 / hash, key: bstr ]   ; 4: X-Wing, a 1216-byte public key

encryption-key-payload = {     ; type 4
  0 => uint,                   ; version: 1 for the first, then the previous version plus one
  ? 1 => hash,                 ; the encryption-key act it replaces (absent only for version 1)
  2 => enc-key
}

key-delivery-payload = {       ; type 1
  0 => hash,                   ; the act whose content key this is; with 2, the publication whose media key it is
  1 => bstr .size 32,          ; the key
  ? 2 => true                  ; the key of the media the publication describes
}
```

*Why a key delivery cannot simply be a private act that carries its key locked inside (F99): its payload is locked with its own content key, which would need a delivery of its own, and that one another, without end. The recipient could never open the first. The key exchange therefore lives in one place, the sealed container, which carries an act and the key that opens it; the key delivery's payload is then plain, and the same payload, published openly, is "going public later".*

### Sealed container

```cddl
sealed = [ to: [* hash], one-time-key: bstr .size 32, locked-act: bstr, sig: bstr .size 64 ]

; locked-act holds, encoded:
locked-act-content = [ capsules: [+ capsule], nonce: bstr .size 24, locked: bstr ]
capsule = [ ct: bstr .size 1120, wrapped: bstr .size 48 ]
; locked opens to, encoded:
contents = [ act: bstr, ? key: bstr .size 32 ]   ; the inner act, encoded whole, and its content key if it is private
```

1. **Recipients.** `to` lists the recipients' identity hashes, and `capsules` holds one capsule per entry, in the same order. A container for a bare key has an empty `to` and exactly one capsule; a bare key is never combined with other recipients.
2. **Locking.** A fresh 32-byte container key locks `contents` with XChaCha20-Poly1305 under the nonce, with no associated data (F90). For each recipient, X-Wing encapsulates to its key (the identity's current encryption key, or the bare key) with fresh randomness: `ct` is the X-Wing ciphertext, and `wrapped` is the container key locked with XChaCha20-Poly1305 under the key `tagged_hash("MOR/sealed/wrap", shared secret)` and a nonce of 24 zero bytes. *The zero nonce is safe because every shared secret is fresh.*
3. **Signature.** The one-time key is a Schnorr key (scheme 1) that belongs to no identity and is used once. It signs `tagged_hash("MOR/sealed", [to, one-time-key, locked-act])`, the three encoded as a CBOR array. *It keeps a relay from re-addressing the container; it says nothing about the sender, who is known only from the inner act.*
4. **Opening.** A recipient checks the signature, decapsulates its own capsule, unwraps the container key, opens `contents`, and opens the inner act with the key given (or its own, for a public act), checked against its outside as for any act. A key given for a public act makes the container invalid.
5. **Addressing (rule 11).** An inner act sent to an identity names that identity in its own `to`; one sent to a bare key names no one.

### The running summary

**Running summary.** The root of a Merkle mountain range over the act ids of the sequence, in order, up to and including the previous act. The first act of a sequence carries the empty summary: 32 zero bytes. Leaves are `tagged_hash("MOR/mmr-leaf", act id)`; internal nodes `tagged_hash("MOR/mmr-node", left || right)`. The range is a list of perfect binary trees, its peaks, highest on the left, as the binary digits of the number of acts. The peaks are bagged right to left into one root: start from the rightmost peak, and hash each peak to its left as `node(peak, bagged so far)`, so left stays left (F89). A single peak is its own root, with no further hashing. A test vector for a three-act sequence is published with this MIP before freeze (F78).

### Publication (type 0)

```cddl
media = {
  0 => hash,          ; spec of the media type (a media module), which interprets the bytes
  1 => hash,          ; work hash
  2 => hash,          ; locked bytes hash: SHA-256 of the media as stored
  3 => uint,          ; size of the media once unlocked, in bytes (F108)
  4 => bstr .size 24, ; nonce of the media lock
  ? 5 => bstr .size 32, ; the media's content key, for public media
  ? 6 => [+ tstr],    ; where the locked bytes can be fetched
  ? 7 => any,         ; price, in the form the Money MIP defines
  ? 8 => hash         ; for: the identity this publication is made for; payment goes to its payee pointer
}
```

### Vow (type 5)

```cddl
vow = {
  0 => tstr,          ; its words: what is vowed, existing or to come (F252), canonical text
  ? 1 => [hash, any]  ; a cMIP and its parameters: what it is in that cMIP's terms (its kind, its terms)
}
```

### Types defined by this MIP

| Type | Name | Public or private |
| --- | --- | --- |
| 0 | Publication | public (the offer); its media may be locked |
| 1 | Key delivery | private, addressed to its recipient, in a sealed container; or public, addressed to no one, to make something public |
| 2 | Commitment | public |
| 3 | Withdrawal | public |
| 4 | Encryption key | public (an Identity act in spirit, defined here) |
| 5 | Vow | as any act ("Public and private"); its offers are always public (Agreements) |

## Part four: tasks, reasoning, open parameters and freeze scenarios

### Tasks

- **Media interpretation, per type.** A cMIP accepts a media object (bytes, or a manifest of parts) and produces its interpretation for display or play. It defines segmentation, chunk fingerprints, streaming and live media for its type.
- **Anchoring** (F173, moved from Agreements). A cMIP accepts any act id and produces a proof that the act existed by a point on a named time reference. Two anchors are compared only on the same reference; anchors on references that cannot be compared order nothing. Anyone may anchor any act. **One anchoring cMIP; the clocks are Modules under it** (F202): the cMIP says what an anchor is, how two anchors on one clock compare, and what a clock Module must accept and produce; each clock (Bitcoin, a timestamp service, any other) is a Module under it, as rails are under the payment cMIP, and a time reference is a clock Module and its parameters. An act may be anchored on any number of clocks. **On a clock that counts blocks, the point is the block** (F201): two anchors in one block are at the same point. **An anchor may place a commitment naming its act** (F201): a hash the act determines under the specification that defines it (a payment commitment, recomputed from a receipt or claim by the payment cMIP), so that a payment made on a clock's own chain anchors the receipt or claim of that payment at its block, for what the commitment binds. *The act itself is written later; what the anchor shows is that the payment it records was made by that point, which is what Money rule 29 compares.* **A clock's own data** (a chain's headers) is handed to its Module's rule by the client, as input (Development rule 12, F204). *MOR has no clock, but anchoring to one is a task the core defines and accepts; it does not specify how (Nobody, allegedly). Every layer above may rely on it: Money for a lock change after a theft (Money rule 29), Agreements for agreements' deadlines and time references, absence-proof modules for presence. A client that relies on an anchor carries the anchoring cMIP it names, as it carries a rail or media Module.*

### Reasoning

- **Everything locked, so relays cannot harvest private content.** *A relay cannot read private acts at all, and learns only the signer, the size and any recipients. Public acts carry their key on the outside, so any relay can open them cheaply: harvesting public content is not prevented, only made no easier than reading it. Private content is where the protection lies.*
- **Direct messages do not stand out by kind.** *When encryption is the rule, a private message is not a special type that relays can spot. An addressed act does show its recipient, as the principle of a public receiver allows, but never its sender inside a sealed container, nor what it is.*
- **Commit to the inside, not only the lock.** *Common encryption lets a clever sender make one locked message open to different contents under different keys. Signing the hash of the unlocked inside makes that impossible: what you sign is what everyone opens.*
- **Salt the inside.** *Without a salt, a short private reply could be guessed by hashing candidates.*
- **One shape for every act.** *Identity acts are locked too, with their key attached. That costs a few bytes and saves every implementer a special case.*
- **Going public is one act.** *Publishing a key turns anything private public, for embargoes, timed releases and disclosure, with no copy and no new fingerprint.*
- **Order without a clock.** *Clocks can be faked and disagree; hash links cannot.*
- **Acknowledgements are cheap, on purpose, and never stand alone.** *A thief with an accomplice can turn their own acts into visible disputes, never into valid acts. In return, anyone who genuinely relied on an act is protected. An acknowledgement of an act nobody can produce changes nothing, so the noise a thief can make is bounded by the real acts the thief signed.*
- **A like is never an acknowledgement (F110).** *An acknowledgement carries weight in three layers: it keeps an act alive as a dispute, turns a regretted sale into a dispute, and places signatures on a collective's line. A reaction module that let a like carry `acks` would turn every like on a thief's post into testimony. So the line is drawn by type, the simplest check there is: only the act types of the three layers that need acknowledgements may carry them, and a deliberate reliance on anything else is a witness act, signed on purpose. An accomplice can still witness a thief's acts, making a visible dispute and never a valid act; what disappears is the accidental case.*
- **One size, the one readers need (F108).** *A field two conforming programs can read two ways is a flaw. The size of the unlocked media is what a reader shows and a media module needs; a relay counts what it stores itself.*
- **A layer's rules use only that layer's data.** *The `for` field exists so that a wallet with no Agreements can pay the right identity, and a client with no Agreements can judge a withdrawal. Pushing one small field down is always better than pulling a rule up.*
- **Delivery is the signer's interest.** *An act counts only where it is held, so whoever wants an act to count carries it to those who must hold it. A reserved inbox gives that carrying a destination without making any relay the meeting point by default.*
- **One depth for everyone.** *A decoder must stop somewhere, or hostile input can crash it. If each stopped at its own depth, one verifier could accept an act that another cannot read. A fixed limit, far above any act the MIPs define, gives every verifier the same answer.*
- **Encryption for the long run.** *Content locked today may be stored and attacked for decades. A hybrid key exchange stays safe if either half holds. X-Wing combines the two halves with a combiner designed and reviewed for exactly this pair, rather than one made here (F98).*
- **One place for the key exchange.** *A key that must be delivered privately cannot sit inside the act that delivers it. The sealed container is where every private act meets its recipient's key, so the key delivery can stay a plain statement, and the same statement, published, makes something public (F99).*

### Open technical parameters

- Merkle construction for commitments (sorted set).
- The running-summary test vector (F78): published in draft with the core library (`core/vectors/sequence-three-acts.json`, and `running-summary.json` for longer sequences); final at freeze, when the spec hashes it names are fixed.
- How a client finds the key deliveries and sealed containers addressed to it (inbox route and relay queries).

### Freeze scenarios

*Each bullet names the freeze suite's scenarios that cover it.*

#### Every act, public and private

- Envelopes, types, specification named: all scenarios.
- Key delivery to an identity and to a bare application key: 2, 6.
- Delegated key release at scale, stopping on lapse: 6, 7.
- A private message between two parties that a relay can route but not read, sender sealed; the two parties share no relay and meet through the inbox: 5.
- A private act made public later by publishing its key (disclosure): 5.

#### Sequences, chains, acknowledgements and references

- Hash-linked ordering; provable forks; a two-chain act (stake transfer) read correctly: 1, 3.
- Running summary from the test vector; kept-ancestry proofs: 1, 5, 8 (with Identity).
- A repost as a reference; tips reach the original: 5.
- A text act carrying `acks` is invalid; a reaction under a cMIP carrying `acks` is invalid; a witness act keeps a disowned post visible as disputed; a buyer's claim does the same for a publication (F110): 2, 5.

#### Media and withdrawal

- Work hash of plaintext; locked bytes fingerprinted per publication; segmentation by the named cMIP: 1, 2, 6.
- Publication with `for`; a Money-only wallet and a full client pay the same identity; withdrawal by signer or `for`: 2, 3.
- A publication whose size is not the unlocked media's, shown as inconsistent (F108): 2.
- Withdrawal, including a payment racing it: 2, 5.

#### Relays and fail closed

- Relays and commitments: 4.
- Unknown act carried, shown, then adopted by opt-in: 2.

## Old numbers to new

Draft 7's rules, list by list, with their numbers in this draft. Every old rule has exactly one new number; none was split, merged or dropped.

| Old | New | Rule |
| --- | --- | --- |
| chains 1 | 14 | Chains |
| chains 2 | 15 | Forks |
| chains 3 | 16 | Order without a clock |
| chains 4 | 17 | Acknowledgements |
| chains 4a | 18 | Who may acknowledge |
| chains 5 | 20 | References |
| relays 1 | 25 | Untrusted by default |
| relays 2 | 26 | Operated by identities |
| relays 3 | 27 | What relays check |
| relays 4 | 28 | Commitments |
| relays 5 | 29 | Storage and delivery policy |
| validity 1 | 1 | One shape, in deterministic CBOR |
| validity 1a | 2 | No deeper than 128 levels |
| validity 2 | 3 | The lock and the commitments match |
| validity 3 | 7 | A public act carries the key that opens it |
| validity 4 | 13 | Position and summary |
| validity 5 | 5 | Canonical text |
| validity 6 | 6 | Hints never decide |
| validity 7 | 10 | A private act counts only once opened |
| validity 7a | 4 | The signature scheme |
| validity 7b | 19 | An act that may not acknowledge, and does, is invalid |
| validity 8 | 8 | Identity acts are public |
| validity 9 | 9 | A new key for every object |
| validity 10 | 11 | A private act reaches its recipients with its key |
| validity 10a | 12 | A container that fails delivers nothing |
| validity 11 | 30 | Nothing under an unknown specification |
| validity 12 | 31 | Adopted by opt-in |
| validity 13 | 32 | The one exception: a text's format |
| validity 14 | 21 | Check the media against the work hash |
| validity 14a | 22 | A size that does not match is shown |
| validity 15 | 24 | Who may withdraw, and what it does |
| validity 16 | 23 | For whom |

*Older texts cite the chains list as "Envelopes rule 2", "rule 4", "rule 4a" and "'Chains', rule 3" (now 15, 17, 18 and 16); both lists as "rules 4a and 7b" (now 18 and 19); the validity list as "rule 11", "rules 11 and 12" and "rule 14a" (now 30, 31 and 22); and the relays list as "relays rule 5" (now 29). A bare "rule 1" to "rule 5" is read by its context; this table, by list, is the key.*

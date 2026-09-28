# MIP: Envelope

*Draft 4, 27 September 2026. Written against core v12, the Identity MIP draft 7, the Text MIP draft 5 and findings F1 to F82. Draft 4 applies review round 2: the `for` field on publications and withdrawal by signer or `for`; `objects` entries name their chain; the running summary's empty value and bagging order; signature schemes by specification hash; key delivery to a bare key; inbox delivery and the holding principle; reposts as references.*

*Reading this document: normal text is the protocol itself. Italic text is commentary, reasoning and examples.*

## Purpose

The Envelope MIP is the grammar every act is written in. It defines:

- the two parts of every act: a small **outside** that relays can see, and a locked **inside** that holds everything else;
- how content is locked, and how its key is made public or delivered privately;
- how acts name their type, link into chains, acknowledge and refer to each other, without a clock;
- how media is fingerprinted and published, and for whom;
- what relays do, how they commit to what they hold, and how acts reach the people they concern;
- how an offer of media is withdrawn;
- what a client does with an act it does not understand.

## Dependencies

Identity (signers, keys, bindings, sequences, routes) and Text (canonical text in every text field). Every client implements this MIP.

## Definitions

- **Act.** Any signed object. Every act has an outside, a locked inside, and a signature.
- **Outside.** The part of an act every relay can read: only what a relay needs to store, route and check it.
- **Inside.** Everything else: type, pointers, payload. Always locked with a content key.
- **Content key.** The key that locks one inside or one media object. A new one for every object.
- **Public act.** An act whose content key travels with it, on its outside. Anyone can open it.
- **Private act.** An act whose content key is delivered only to chosen recipients.
- **Key delivery.** An act that locks a content key to one recipient's encryption key, or to a bare key the recipient supplied.
- **Encryption key.** A public key an identity publishes so others can deliver content keys to it (F25).
- **Sealed container.** A wrapper that hides the sender of a private act from relays. Not an act.
- **Specification.** The MIP or cMIP that defines an act's type, named by its hash.
- **Chain.** The acts on one object, each naming the act or acts it follows. Each MIP that defines an object defines its chain rules; this MIP defines only what all chains share.
- **Fork.** Two acts naming the same predecessor in the same chain.
- **Acknowledgement.** An act naming another identity's act, as received.
- **Reference.** An act naming another act, or a web resource, without following or acknowledging it. A repost is a reference.
- **Work hash.** The fingerprint of a work's complete plaintext.
- **Relay.** A server that publishes, fetches and mirrors acts and media, untrusted by default, operated by an identity (F18).
- **Commitment.** A relay operator's signed statement of the set of acts it holds.
- **Withdrawal.** An act marking a publication as no longer offered.
- **Inbox.** A route of kind 1 (Identity) where others deliver acts addressed to an identity.

## The act

```cddl
act = [ outside, locked: bstr, signature ]

outside = {
  ? 0 => hash,          ; signer: identity hash (absent only in genesis)
  ? 1 => hash,          ; binding: identity-chain act that bound the signing key
  2 => hash,            ; inside commitment: tagged_hash("MOR/inside", inside)
  3 => hash,            ; locked hash: SHA-256 of the locked bytes
  4 => bstr .size 24,   ; nonce for the lock
  ? 5 => bstr .size 32, ; content key: present on a public act, absent on a private one
  ? 6 => [+ hash]       ; to: recipients' identity hashes (key deliveries, and acts addressed to someone)
}

inside = {
  0 => hash,            ; spec: the MIP or cMIP defining the type
  1 => uint,            ; type, numbered within that spec
  ? 2 => [* hash],      ; prev: previous act in the signer's sequence (at most one, F24)
  ? 3 => [+ object],    ; objects: the chain(s) this act belongs to, and the act it follows in each
  4 => { * any => any },; payload, defined by the type
  ? 5 => uint,          ; position in the signer's sequence
  ? 6 => hash,          ; running summary of the signer's sequence up to this act
  ? 7 => [+ hash],      ; acks: acts by other identities this act acknowledges
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

1. The inside is encoded in deterministic CBOR, then locked with the content key using XChaCha20-Poly1305 and the nonce. The result is `locked`.
2. The outside commits to both: the hash of the locked bytes, so relays can check what they store, and the hash of the unlocked inside, so a reader can check that what they opened is exactly what was signed.
3. The act id is `tagged_hash("MOR/act", outside)`. The signature signs the act id.

*The salt makes the inside commitment impossible to guess: without it, anyone could hash "yes" and "no" and learn a private one-word reply.*

*Each `objects` entry names its chain, so two entries with the same chain are a merge of two branches, and two entries with different chains are one act touching two objects, such as a stake transfer on a work's chain and on the agreement's chain. A reader never has to guess which (F81).*

**What a relay sees:** *who signed (or nothing, inside a sealed container), which recipients a delivery is for, the size, and whether the key is attached. Never the type, the thread, the payload, or who it answers.*

### Public and private

- **Public:** the content key sits on the outside (key 5). Anyone can open the act. The locked bytes and their key travel together.
- **Private:** no key on the outside. The key is delivered to each recipient by a key delivery, itself a private act addressed to them.
- **Going public later:** the signer publishes a key delivery addressed to no one, with the key on its outside. *One act turns a private act public, for an embargo, a timed release, or disclosing a negotiation record (Law).*

### Identity acts are public

Identity acts are the public face of an identity (F29): genesis, rotations, receipts, routes, names, encryption keys, links, log summaries, cosignatures, objections, absence statements, escape endorsements. They MUST be public acts. *They go through the same lock as everything else, with their key attached, so every act has one shape.*

### Encryption keys and key delivery

- **Encryption key.** An identity that wants to receive private content publishes an encryption key: a public act, versioned in its own chain like routes, changed with the signing key. Recommended scheme: hybrid X25519 plus ML-KEM-768 (FIPS 203), so what is locked today cannot be opened later by a quantum computer. A fork in the chain is contested from that point, as for routes; a fork behind an act the owner's later rotation kept is settled by that rotation.
- **Key delivery.** A private act addressed (`to`) to one recipient. Its payload names the act or media object whose key it delivers, and holds that key locked to the recipient's current encryption key, or to a bare key the recipient supplied (a device or application key, given as `[scheme, key]` in the form Identity defines). A delivery to a bare key carries no `to` and travels in a sealed container. Key release may be delegated to a service through a grant (Law). Group keys, subscriptions and rights management are access modules.
- **The hijack window.** A thief holding the signing key can publish a new encryption key, and every private delivery until the owner rotates goes to the thief. The rotation voids the thief's act. *The consequence for a purchase is stated plainly: a seller who delivered a bought key into that window did nothing wrong, and still owes the buyer a new delivery once the owner has rotated, since the buyer paid and did not receive (Law). The window is the price of changing the encryption key with the everyday key, and the same window applies to the inbox route (Identity).*

### Sealed containers: private sender

Following the privacy principle, public receiver and private sender, a private act may travel inside a sealed container:

```cddl
sealed = [ to: [* hash], one-time-key: bstr, locked-act: bstr, sig: bstr ]
```

The inner act, encoded whole, is locked to the recipients; the container is signed by a one-time key that belongs to no identity. Relays see only the recipients, which may be none for a delivery to a bare key. A sealed container is not an act, and relays carry it as opaque bytes.

## Types and specifications

Every act names, inside, the specification that defines its type by hash, and a type number within it. *Since a specification's hash is unique, types can never collide, and no registry is needed.* The specification names its creator (Production). Every tag used by MOR begins with `MOR/`; a successor protocol MUST use a different prefix, so that no act of one protocol can be replayed in the other (Production).

## Sequences

Every everyday act carries, inside, its position in the signer's sequence and a running summary of that sequence.

- **Single lines.** Within a sequence, every act names at most one predecessor. Parallel devices keep separate sequences.
- **Position.** The first act of a sequence (empty `prev`) has position 1; every later act has its predecessor's position plus one.
- **Running summary.** The root of a Merkle mountain range over the act ids of the sequence, in order, up to and including the previous act. The first act of a sequence carries the empty summary: 32 zero bytes. Leaves are `tagged_hash("MOR/mmr-leaf", act id)`; internal nodes `tagged_hash("MOR/mmr-node", left || right)`; the peaks of the range are bagged right to left, each pair hashed as a node, into one root. A test vector for a three-act sequence is published with this MIP before freeze (F78).

*These make it cheap to prove that an act lies on the line leading to a later one, which is how a rotation's kept ancestry is checked (Identity).* Proving it for a private act needs that act's key, which its recipients and its signer hold.

## Chains, acknowledgements and references

1. **Chains.** An act that belongs to an object's chain names, in `objects`, that chain and the act it follows in it: one entry normally, several where branches of one chain merge (same chain), or where one act belongs to several chains (different chains). A chain may branch and merge.
2. **Forks.** Two valid acts naming the same predecessor in the same chain are a fork, provable from their signatures and insides. Whether a fork is normal or a conflict is defined by the MIP that defines the object (F4).
3. **Order without a clock.** A chain's order records when acts were added to it, never when the things they refer to were created. Hints are never load-bearing. Every "before" in the core is judged inside one named chain, by reference to a specific act.
4. **Acknowledgements.** An act acknowledges another identity's act by naming it in `acks`. It says only "I received this". An acknowledgement counts, for any purpose in the core, only alongside the act it names: a verifier that does not hold that act, or holds it and finds it invalid as an act, ignores the acknowledgement. *It keeps an act visible as a dispute after a rotation (Identity), and proves a negotiation thread complete (Law).*
5. **References.** An act names other acts, or web resources, in `refs`, meaning only "look at this". A web reference may carry the hash of what was there when it was referenced, so readers can check it has not changed. A repost is a reference to a publication, never a publication of its own: it pays nobody by itself, and a reposter earns through a role share where the owners' split plan offers one (Law).

## How acts reach people

An act counts for a verifier only once the verifier holds it. Nothing forces propagation; delivery is the signer's interest. *Four reaches, as a working picture: identity acts must reach the home, since their standing depends on it; acts that concern a counterparty (agreements, signatures, receipts, claims, key deliveries, obligations) should reach that counterparty; publications and posts are published on the signer's outbox routes for whoever is interested; drafts never leave.*

Clients SHOULD deliver an act that concerns a counterparty to that counterparty's inbox route where one is declared (Identity). Any two identities can find each other without already sharing a relay, through identity, home and routes. Whether a relay accepts deliveries, from whom, at what price and for how long, and whether it propagates to other relays, is the relay market's business; spam control, metadata privacy and gossip are cMIPs (F70).

## Media

### Work hash

The work hash is `tagged_hash("MOR/work", plaintext)`, over the complete plaintext of the work. For a text work, the plaintext is its canonical text. It is the same wherever the work travels and however it is locked or cut, and it is what ownership points to (Law).

### Publication

A publication is an act of type 0 of this MIP. Its payload describes a media object:

```cddl
media = {
  0 => hash,          ; spec of the media type (a media module), which interprets the bytes
  1 => hash,          ; work hash
  2 => hash,          ; locked bytes hash: SHA-256 of the media as stored
  3 => uint,          ; size of those bytes
  4 => bstr .size 24, ; nonce of the media lock
  ? 5 => bstr .size 32, ; the media's content key, for public media
  ? 6 => [+ tstr],    ; where the locked bytes can be fetched
  ? 7 => any,         ; price, in the form the Finance MIP defines
  ? 8 => hash         ; for: the identity this publication is made for; payment goes to its payee pointer
}
```

Media bytes are always stored locked, with their own content key. For public media, the key sits in the publication's payload. For media on sale, the publication is public (anyone can see the offer) but the media key is absent, and is delivered to each buyer. After unlocking, a buyer checks the plaintext against the work hash.

**For whom.** Payment for a publication goes to the payee pointer of the identity named in `for` if present, otherwise of the signer (Finance). *A false `for` can only send money to the identity it names, never to whoever wrote it, so nobody gains by lying in it. Whether a grant backs a publication made for another identity is Law's business; a Law client may refuse a publication whose `for` is not backed by a grant it can check, and shows it so. A Finance-only wallet needs nothing beyond this field (F68).*

Segmentation, chunk fingerprints, streaming and live media are defined by the cMIP the publication names; the fields above then describe the whole, or a manifest of the parts. A live stream has no work hash until it ends; paid live access is sold through a standing offer (Law), not a publication.

A publication is a neutral carrier: it never claims the work. A work is bound to its creators only by an explicit work claim (Law).

## Relays

1. **Untrusted by default.** Relays publish, fetch and mirror acts, media and sealed containers. Nothing a relay says is trusted unless it is signed.
2. **Operated by identities.** A relay's statements are signed by its operator's identity (F18). Homes and keepers are relays in particular roles; an inbox is a relay in another.
3. **What relays check.** A relay SHOULD check an act's signature and that its locked bytes match the locked hash. *It cannot, and need not, read a private act.*
4. **Commitments.** A relay operator may publish a commitment: a public act (type 2 of this MIP) holding the Merkle root over the sorted ids of the acts it holds, and their number.
5. **Storage and delivery policy** (what a relay keeps, whose deliveries it accepts, for how long, at what price) is the relay market's business.

## Withdrawal

A withdrawal is an act of type 3 of this MIP naming a publication in `objects`. It marks that publication as no longer offered.

- **Authority.** The publication's signer, or the identity named in its `for` field. No other authority exists at this layer. *A creator who wants to withdraw a publisher's publication of their work has Law's tools: a contest, and their own publication (F68).*
- **Effect.** Clients stop presenting the publication as available; offers attached to it close; no new content keys are released for it.
- **Past deals stand.** A payment arriving after the withdrawal creates no deal and an obligation to refund it (Law).
- **Relays are asked, not forced,** to stop serving it.

## Types defined by this MIP

| Type | Name | Public or private |
| --- | --- | --- |
| 0 | Publication | public (the offer); its media may be locked |
| 1 | Key delivery | private, addressed to its recipient; or public, addressed to no one, to make something public |
| 2 | Commitment | public |
| 3 | Withdrawal | public |
| 4 | Encryption key | public (an Identity act in spirit, defined here) |

## Validity rules

### Every act

1. An act MUST decode as deterministic CBOR in the shape above; an unknown key, outside or inside, makes it invalid.
2. The locked bytes MUST hash to the locked hash. Whoever unlocks the inside MUST check it against the inside commitment; an inside that does not match makes the act invalid.
3. A public act's content key MUST open its inside.
4. An everyday act MUST carry a position and a running summary consistent with its predecessor (the empty summary for the first act of a sequence), and at most one `prev`.
5. Every text field MUST be canonical text (Text MIP).
6. A hint MUST NOT be used for any validity decision.
7. Rules about an act's inside can only be checked by those who hold its key. A client MUST NOT treat a private act as valid for anything that depends on its inside unless it has opened and checked it.
7a. An act's signature scheme is checked as Identity defines: a scheme the client does not implement makes the act unknown, never valid.

### Public and private

8. Identity acts MUST be public.
9. A content key MUST NOT be reused for two objects.
10. A key delivery MUST name the act or media object whose key it delivers, and be addressed to the recipient whose encryption key it locks to, or, for a bare key, travel in a sealed container with no `to`.

### Fail closed

11. A client MUST NOT sign, pay or accept anything whose specification it does not implement. It shows such an act as unknown.
12. A client MAY fetch an unknown specification by its hash, show it to the user, and adopt it by opt-in.
13. The one exception is a text act's format (Text MIP): its text is always shown as plain text.

### Media and withdrawal

14. A client MUST check unlocked media against the work hash before treating a purchase as delivered.
15. A withdrawal is valid only if signed by the publication's signer or by the identity named in its `for` field.
16. A payment for a publication is owed to the identity in `for` if present, otherwise to the signer (Finance).

## Tasks

- **Media interpretation, per type.** A cMIP accepts a media object (bytes, or a manifest of parts) and produces its interpretation for display or play. It defines segmentation, chunk fingerprints, streaming and live media for its type.

## Reasoning

- **Everything locked, so relays cannot harvest private content.** *A relay cannot read private acts at all, and learns only the signer, the size and any recipients. Public acts carry their key on the outside, so any relay can open them cheaply: harvesting public content is not prevented, only made no easier than reading it. Private content is where the protection lies.*
- **Direct messages do not stand out by kind.** *When encryption is the rule, a private message is not a special type that relays can spot. An addressed act does show its recipient, as the principle of a public receiver allows, but never its sender inside a sealed container, nor what it is.*
- **Commit to the inside, not only the lock.** *Common encryption lets a clever sender make one locked message open to different contents under different keys. Signing the hash of the unlocked inside makes that impossible: what you sign is what everyone opens.*
- **Salt the inside.** *Without a salt, a short private reply could be guessed by hashing candidates.*
- **One shape for every act.** *Identity acts are locked too, with their key attached. That costs a few bytes and saves every implementer a special case.*
- **Going public is one act.** *Publishing a key turns anything private public, for embargoes, timed releases and disclosure, with no copy and no new fingerprint.*
- **Order without a clock.** *Clocks can be faked and disagree; hash links cannot.*
- **Acknowledgements are cheap, on purpose, and never stand alone.** *A thief with an accomplice can turn their own acts into visible disputes, never into valid acts. In return, anyone who genuinely relied on an act is protected. An acknowledgement of an act nobody can produce changes nothing, so the noise a thief can make is bounded by the real acts the thief signed.*
- **A layer's rules use only that layer's data.** *The `for` field exists so that a wallet with no Law can pay the right identity, and a client with no Law can judge a withdrawal. Pushing one small field down is always better than pulling a rule up.*
- **Delivery is the signer's interest.** *An act counts only where it is held, so whoever wants an act to count carries it to those who must hold it. A reserved inbox gives that carrying a destination without making any relay the meeting point by default.*
- **Encryption for the long run.** *Content locked today may be stored and attacked for decades. A hybrid key exchange stays safe if either half holds.*

## Open technical parameters

- The exact format of key deliveries under the hybrid scheme (F25), including the bare-key form.
- Merkle construction for commitments (sorted set).
- The running-summary test vector (F78).
- How a client finds the key deliveries and sealed containers addressed to it (inbox route and relay queries).

## Decided for this pass

- **F23.** Types namespaced by specification hash, not by the creator's identity.
- **F24.** Sequences are single lines; parallel devices keep separate sequences.
- **F25.** Identities publish an encryption key, versioned like routes, hybrid post-quantum scheme.
- **F26.** Sealed containers for private senders are not acts.
- **F28 / F36.** A publication is a neutral carrier; binding is an explicit work claim (Law).
- **F46 / F68.** A publication carries a price but no payee pointer; payment goes to the pointer of the identity in `for`, else the signer; withdrawal by either.
- **F70.** Inbox delivery; an act counts only where it is held.
- **F78.** Empty summary and bagging order.
- **F81.** `objects` entries name their chain.

## Freeze scenarios

- Envelope, types, specification named: all scenarios.
- Unknown act carried, shown, then adopted by opt-in: 2.
- Hash-linked ordering; provable forks; a two-chain act (stake transfer) read correctly: 1, 3.
- Work hash of plaintext; locked bytes fingerprinted per publication; segmentation by the named cMIP: 1, 2, 6.
- Key delivery to an identity and to a bare application key: 2, 6.
- Delegated key release at scale, stopping on lapse: 6, 7.
- Relays and commitments: 4.
- Publication with `for`; a Finance-only wallet and a full client pay the same identity; withdrawal by signer or `for`: 2, 3.
- Withdrawal, including a payment racing it: 2, 5.
- Running summary from the test vector; kept-ancestry proofs: 1, 5, 8 (with Identity).
- A private message between two parties that a relay can route but not read, sender sealed; the two parties share no relay and meet through the inbox: 5.
- A private act made public later by publishing its key (disclosure): 5.
- A repost as a reference; tips reach the original: 5.

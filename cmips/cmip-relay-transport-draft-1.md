# cMIP: Relay Transport

*Draft 1, 28 September 2026. Written against core v12, the Identity MIP draft 7, the Envelope MIP draft 4, the Text MIP draft 5, the Production MIP draft 4, freeze test suite v11 and findings F1 to F83. Not core: a founding cMIP, frozen at publication and competing with any other transport. It answers two open parameters of the drafts: how a home is queried (Identity), and how a client finds the key deliveries and sealed containers addressed to it (Envelope).*

*Reading this document: normal text is the specification. Italic text is commentary, reasoning and examples. Decisions taken with Nobody, allegedly are marked "(Nobody, allegedly, Q1)" and so on; the questions and their answers are listed at the end.*

## In plain words

*The core says what an act is and when it counts. It deliberately says nothing about how acts travel between computers. This document fills that gap for MOR 0.1, and anyone may later write a better one.*

*A relay is a web server that keeps acts. This document fixes the handful of requests a client can make to it: "here is an act, keep it", "give me this act", "give me everything new from this identity, or addressed to this identity", "here are the locked bytes of a picture", "give me those bytes back". A home is a relay with a few more requests: "here is my genesis or rotation, give me your receipt", "give me everything you hold about this identity", and "show me your log, and prove this receipt is in it".*

*Three principles run through it. First, the relay is never trusted: everything that matters comes back as signed acts the client checks itself, and a relay saying "I do not have it" proves nothing. Second, no clock: a relay numbers what arrives, one, two, three, and clients ask for "what came after number 41", never "what came after Tuesday". Third, nobody signs anything but acts: no logins, no passwords, no signed challenges. An act is signed already, so a relay can decide whether to keep it by looking at who signed it.*

## Purpose

This cMIP defines:

- how a client publishes an act, a sealed container or media bytes to a relay;
- how a client fetches acts, sealed containers and media, and follows new ones;
- how a client delivers an act to an identity's inbox, and how a recipient finds what was delivered to it, including sealed containers with no recipient on the outside;
- how a client asks a home for a receipt;
- how a home is queried for an identity's chain, receipts, routes, encryption key, names, links and the evidence the homeless procedure needs;
- how a home's log summaries, cosignatures, inclusion proofs and consistency proofs are served;
- what a client may conclude from a relay's answers, and what it may not.

It defines no act type, fills no task, and changes no rule of the core. It adds rules for relays and clients that adopt it, never relaxing the core's.

## Dependencies

Identity, Envelope and Text. It relies on the act format, act ids, sealed containers, routes (including the inbox kind), receipts, log summaries and their RFC 9162 Merkle tree exactly as those MIPs define them.

## Definitions

- **Relay.** As in Envelope: a server that stores and serves acts, sealed containers and media, operated by an identity.
- **Home.** As in Identity: a relay that also stores and serves identity chains and signs receipts.
- **Base address.** An `https` URL that is the root of every request below, for example `https://home.example.org/mor`. It is the form an address hint takes under this cMIP.
- **Item.** Anything a relay stores: an act, a sealed container, or a media object.
- **Arrival number.** A counter a relay keeps, increasing by one with every item it stores. It is local to that relay, never a time, never compared across relays, and never used for any validity decision.
- **Sealed id.** `tagged_hash("MOR/transport/sealed", bytes)`, over the encoded sealed container. *A sealed container is not an act and has no act id; relays and recipients still need a name for it.*
- **Pickup tag.** `tagged_hash("MOR/transport/pickup", scheme || key)`, over a bare key in the form Identity defines (`scheme` as one byte or a 32-byte specification hash, `key` the public key). It lets a recipient find a sealed container addressed to a bare key without scanning (Nobody, allegedly, Q2).
- **Hint.** Anything a relay says without signing it. A hint may guide a client; it never decides anything.

## Encoding

1. Every request and response body is deterministic CBOR (RFC 8949, section 4.2.1), sent with the media type `application/cbor`, except media bytes, which are sent as `application/octet-stream`. Maps use small integer keys, as in the MIPs.
2. The formats are closed: a message with a key this cMIP does not define is malformed. *A later transport is a new cMIP with a new hash, never an extension of this one.*
3. Every `tstr` is canonical text (Text MIP).
4. An act, a sealed container and media bytes travel as `bstr`, exactly as received. A relay MUST serve each item byte for byte as it was stored. *Identity rule 8a requires the exact same rotation bytes at every home; a relay that re-encodes anything could break that, and would break every act id.*
5. In a URL path or query, a hash is written as 64 lowercase hexadecimal characters, and a number in decimal.

## Addresses

An address hint in a home entry or a route is, under this cMIP, a base address. A client that meets a hint whose scheme is not `https` does not use it under this cMIP; another transport may. An onion address (`http://….onion`) is also a base address: the Tor network encrypts and authenticates it. *Plain `http` to any other address is allowed only for local testing and is never written into a published act. Onion addresses let an operator stay reachable from behind a censor's firewall.*

**Where an operator says its home is.** A home entry names an operator and a hint. If the hint no longer answers, a client reads the operator's latest routes act (from the operator's own homes) and uses the hints of its outbox route whose scope is the Identity MIP's spec hash, `IDENTITY`: *an operator's Identity acts are its receipts and log summaries, so where they are found is where its home is.* This is how a home moves servers without any owner rotating (Identity). An operator that runs several homes lists them all there; a client tries each, and trusts only the signed acts it gets back (Nobody, allegedly, Q3).

## Discovery

`GET {base}/info` returns:

```cddl
info = {
  0 => hash / null,      ; operator: the identity that runs this relay; null if it declares none
  1 => [+ tstr],         ; the base addresses under which this relay answers
  2 => [+ role],         ; roles: 0 relay, 1 home, 2 inbox
  3 => limits,
  ? 4 => tstr            ; policy: what it accepts, from whom, at what price, in plain text
}

limits = {
  0 => uint,             ; largest act or sealed container accepted, in bytes
  1 => uint,             ; largest media object accepted, in bytes
  2 => uint,             ; most items returned by one feed request
  3 => uint              ; longest wait a feed request may ask for, in seconds
}
```

Everything in `info` is a hint. *What proves that a relay is an operator's home is only the receipts and summaries it serves, signed by that operator.*

## Relays: publishing and fetching

Every relay implements these requests. Every error is answered as in "Errors" below.

### Publishing an act

`POST {base}/acts`, body: the act (`bstr` content, sent as the whole body).

1. The relay MUST check that the body decodes as an act in the Envelope shape, that the locked bytes hash to the outside's locked hash, and that the signature is valid for the act id under the key and scheme it carries, where the relay implements the scheme. It SHOULD check the binding (that the key is the one the named identity-chain act bound) where it can resolve the signer; a home MUST, for the identities it serves.
2. A relay MUST NOT refuse an act because it does not implement the specification named inside. *It cannot read a private act's inside at all, and an unknown act must stay carriable so clients can later adopt its specification (Envelope rules 11 and 12, scenario 2).*
3. Whether it keeps the act beyond these checks, for how long and at what price, is the relay's policy (Envelope, relays rule 5).
4. On success it answers:

```cddl
put-result = {
  0 => hash,             ; the act id, or the sealed id
  1 => uint,             ; its arrival number at this relay
  ? 2 => bstr,           ; home only: the receipt it signed (see Homes)
  ? 3 => bstr            ; home only: the objection it signed (see Homes)
}
```

Publishing an act that the relay already holds answers the same result again. *Publishing is idempotent, so a client can always safely resend.*

### Publishing a sealed container

`POST {base}/sealed`, body:

```cddl
put-sealed = {
  0 => bstr,             ; the sealed container, as Envelope defines it
  ? 1 => [+ hash]        ; pickup tags, for a container addressed to a bare key
}
```

The relay checks only that the container decodes in the Envelope shape. It indexes it by every recipient in its `to` field and every pickup tag given. *A sealed container is opaque: the relay learns its recipients and size, never its sender, as Envelope promises (scenario 5).*

### Publishing media

`POST {base}/media`, body: the locked media bytes, sent as `application/octet-stream`.

The relay computes the SHA-256 of the bytes and answers `[ locked-hash: hash, size: uint ]`. The client MUST check the answer against the locked bytes hash in its publication. A relay MAY refuse media that no publication it holds names (policy).

### Fetching

- `GET {base}/acts/{act id}` returns the act.
- `GET {base}/sealed/{sealed id}` returns the sealed container.
- `GET {base}/media/{locked hash}` returns the media bytes. A relay MUST support HTTP range requests on media, so large or segmented media can be fetched in parts.
- `POST {base}/acts/get`, body `[+ hash]` (at most `limits.2` ids), returns `[* bstr / null]`, one entry per id in the same order, `null` where the act is not held.

Items are immutable, so a relay SHOULD let them be cached indefinitely. A client MUST recompute the act id, sealed id or locked hash of whatever it receives, and discard anything that does not match what it asked for.

### Following: the feed

`GET {base}/feed` with these query parameters, all optional:

| Parameter | Meaning |
| --- | --- |
| `signer` | only acts whose outside names this signer |
| `to` | only acts and sealed containers whose `to` names this identity |
| `pickup` | only sealed containers stored with this pickup tag |
| `unaddressed` | if `1`, only sealed containers whose `to` is empty, whatever pickup tags they carry |
| `spec`, `type` | only public acts whose inside names this spec hash, and this type within it (relays that open public acts; see below) |
| `after` | only items with an arrival number greater than this; absent means from the start |
| `limit` | at most this many items (never more than `limits.2`) |
| `wait` | if nothing matches yet, hold the request open up to this many seconds (never more than `limits.3`) |

Filters combine with "and". The answer is:

```cddl
feed-page = {
  0 => [* feed-item],    ; in increasing arrival order
  1 => uint              ; the arrival number to pass as `after` next time
}

feed-item = [ arrival: uint, kind: 0 / 1, item: bstr ]   ; kind 0 an act, 1 a sealed container
```

*To follow an identity, a client asks for its acts after the last arrival number it saw, with a wait; when an answer comes, it asks again. The wait is the relay's patience, not a time in the protocol: nothing about any act depends on it.*

A relay can filter only by what it can read: the outside of every act, and the inside of a public act, whose key travels with it. **The `spec` and `type` filters apply to public acts only;** a relay that does not open public acts answers them with error 9. *A private act's type, position and thread are invisible to relays, as Envelope intends. A relay cannot even order a private sequence; the client does that from the acts.*

A feed with no filter returns everything the relay holds that its policy lets it serve. *This is how a relay is mirrored, and how anyone recomputes a result from a mirror (scenario 4).*

### Commitments

`GET {base}/commitment` returns the relay's latest commitment act (Envelope type 2), if it publishes one. Its Merkle construction is the Envelope MIP's, still open there.

## Delivering to an inbox

To deliver an act addressed to an identity:

1. The sender finds the recipient's home from its identity chain, and its latest routes act from the home (see Homes).
2. It chooses the recipient's inbox route (kind 1) whose scope is the spec hash of the act being delivered; if there is none, the inbox route with a null scope. If the recipient declares no inbox, there is nowhere to deliver: the sender may publish the act on its own outbox and tell the recipient by other means. *An identity MAY declare no inbox (Identity).*
3. It publishes the act, or the sealed container carrying it, to one or more of that route's hints.

The recipient finds its deliveries with the feed: `to` set to its own identity, and, for deliveries to a bare key, in one of two ways (Nobody, allegedly, Q2):

1. **By pickup tag.** The sender of a delivery to a bare key computes the pickup tag from the bare key the recipient supplied, and gives it with the container. The recipient asks the feed with `pickup` set to the tag of each bare key it has handed out and is still waiting on. *One small request, whatever the size of the relay; it works in a browser and on a phone.*
2. **By scanning.** The recipient asks the feed with `unaddressed=1` and tries to open every container it receives; only its own open. A relay that serves sealed containers MUST serve this filter, subject to the same policy as its other feeds, so that scanning is always possible. *The relay then cannot tell which container was whose; the cost grows with the relay's traffic.*

A sender SHOULD always give the pickup tag; a recipient chooses which way to look.

**Stated cost of the pickup tag.** A relay that serves a pickup request can connect the connection that asked with the container it collected. It learns neither the sender, nor the content, nor the recipient's identity. Anyone who knows the bare key can see that something was delivered to it, and deliveries to one bare key share one tag, so a relay can count them. *Client conformance:* a client SHOULD supply a fresh bare key for each purchase or delivery it expects, so that no tag links one to another; a client that reuses a bare key on purpose (for example an application key receiving many content keys, scenario 6) accepts that its deliveries are linkable by tag, and SHOULD say so to its user. A recipient who wants the relay to learn nothing scans instead.

*A shortened tag, which returns a small batch the recipient then tries to open, sits between the two; it is left to a later cMIP, once real traffic shows what length makes sense.*

Reading an inbox needs no login: acts addressed to an identity show their recipient anyway (public receiver, private sender), and their content is locked (Nobody, allegedly, Q8).

**Stated cost.** Anyone can watch an inbox's traffic: when deliveries arrive, how large they are and how many. Never their content, and never the sender of a sealed container. *An owner who wants less exposure can have acts sent in sealed containers, receive bought keys at bare keys found by scanning (Q2), or declare several inboxes, or none. Private inbox reading belongs to a later metadata-privacy cMIP (F70); this cMIP leaves room for it and does not complete it.*

After a rotation that voids a thief's routes act, a client that delivered into the window re-delivers to the inbox the current routes name (Identity rule 39, Envelope). *The transport needs nothing new for this; the client needs to remember what it delivered.*

## Homes

A home implements every request above, plus the following.

### Which identities a home serves

A home serves an identity whose home set, in any identity-chain act it holds, names the home's operator. It accepts a genesis or rotation that names its operator in its home set, subject to its own acceptance conditions (Identity rule 12). It MAY apply any policy to identities it does not serve.

### Asking for a receipt

A client submits a genesis or a rotation with `POST {base}/acts`, as any act.

1. The home MUST check the act as Identity requires (rule 9), holding the chain up to the position before. If it lacks the predecessor, it answers error 3; the client submits the earlier chain acts first, oldest first. *This is how a home newly named in a rotation receives the chain it will serve.*
2. If it accepts the act, it signs a receipt (Identity rule 10a) and returns it in `put-result` key 2. A later submission of the same act returns the same receipt.
3. If it already holds a different valid rotation at that position of that identity (rule 11), it answers error 4, and the error carries the rotation it holds and its receipt for it. *The owner learns at once that someone else got there first.*
4. If the act is a homeless rotation of an identity whose old home set names this home, the home MUST NOT hold it as that identity's rotation (rule 11a). It SHOULD sign an objection naming it and return the objection in `put-result` key 3; it stores the homeless rotation only as evidence.
5. A refusal under the home's acceptance conditions answers error 5, with a plain-text reason. *A refusal is unsigned and leaves no evidence, as the core states: that is one reason to declare several homes.*

The owner's client MUST send the exact same bytes to every home (Identity rule 8a). *The transport never asks for anything but the act itself, so there is nothing else to vary.*

A self-hosted identity's home is a relay the identity runs itself; it serves the chain and signs no receipts.

### Querying an identity

`GET {base}/identity/{identity hash}`, with an optional `parts` query parameter listing, comma-separated, the part numbers wanted (all when absent). It answers:

```cddl
identity-record = {
  0 => hash,              ; the identity
  ? 1 => [+ bstr],        ; chain: genesis and every rotation the home holds as this identity's, in position order
  ? 2 => [* bstr],        ; receipts: this home's receipts for those acts
  ? 3 => [* bstr],        ; routes: the whole routes chain the home holds, from version 1, every branch
  ? 4 => [* bstr],        ; encryption key: the whole encryption-key chain (Envelope type 4), every branch
  ? 5 => [* bstr],        ; names and name withdrawals
  ? 6 => [* bstr],        ; links: public claims, confirmations and terminations naming or signed by this identity
  ? 7 => [* bstr],        ; evidence: see below
  ? 8 => [* bstr]         ; receipts of other homes for this identity's chain acts, as delivered to this home
}
```

A home that does not serve the identity answers error 2. An absent part means the home holds nothing of that kind; it proves nothing.

1. **Chain and receipts.** A home MUST serve the full chain it holds and its receipts with it (Identity rule 10, 10a).
2. **Routes and encryption key: the whole chain.** A home MUST serve every routes act and every encryption-key act of the identity it holds, not only the latest. *Identity rule 13 asks a home to store the latest routes act, but a verifier must follow the chain from version 1 and see any fork to know which act counts (Identity, "Routes"). Serving only the latest would let a home hide a fork. This cMIP adds the stronger rule; it relaxes nothing.* A fork behind an act a later counting rotation kept may be pruned, since that rotation settles it.
3. **Names and links.** A home SHOULD serve them (Identity rule 13), and MAY serve encrypted private links, which appear only as opaque acts by their signer.
4. **Evidence.** A home SHOULD accept and serve, for each identity it serves, the acts the homeless and audit procedures need: its own objections; homeless rotations it refused, as evidence; escape endorsements; absence statements by the identity's declared auditors; and cosignatures of its log summaries. Any client may deliver such an act to the home with `POST {base}/acts`. A home keeps only acts that are valid and name an identity it serves, and may refuse the rest. *A home can still hide evidence by leaving it out, so clients look elsewhere when it matters (see "When a home counts as unreachable")* (Nobody, allegedly, Q7).
5. **Other homes' receipts.** A home MAY serve receipts signed by other operators for the identity's chain acts, delivered to it by the owner's client. They are signed, so they need no trust (Nobody, allegedly, Q7).

*Every part is signed acts. A client checks them all itself and trusts nothing the home says without signing (Identity rule 10c).*

### Following an identity

`GET {base}/feed?signer={identity}` at a home returns, among others, the identity's rotations as they arrive. A genesis has no signer on its outside, and is fetched by its act id, which is the identity hash.

### Log summaries and proofs

- `GET {base}/log/summary` returns the home's latest log summary act; `GET {base}/log/summary?size=n` the summary of that size. The answer is `[ summary: bstr, cosignatures: [* bstr] ]`, with every cosignature of that summary the home holds.
- `GET {base}/log/receipt?position=n` returns the receipt at log position `n`.
- `GET {base}/log/inclusion?position=n&size=m` returns the inclusion proof for the receipt at position `n` in the tree of size `m`: `[* hash]`, as RFC 9162, section 2.1.3.
- `GET {base}/log/consistency?from=m&to=k` returns the consistency proof between the trees of sizes `m` and `k`: `[* hash]`, as RFC 9162, section 2.1.4.

Proofs are not acts and are not signed; they are checked against signed summaries, so they need no trust. An auditor fetches the consistency proof from the last summary it cosigned before cosigning a new one (Identity, "Log summaries and audits"), and delivers its cosignature to the home.

## When a home counts as unreachable

The homeless procedure lets a verifier that requires no audit treat a home as gone when "the verifier itself has tried and failed to reach the home" (Identity, homeless rotation, step 4). Under F85, a homeless rotation accepted this way never becomes final by the next rotation: the old home's objection voids it whenever it surfaces. This section makes the attempt honest, and makes the objection hard to keep out.

*The case it is written for: a state holding a stolen safety key makes a homeless rotation, and blocks the owner's real home at its border, so that readers inside see the home as gone and the thief's rotation as the owner's. Censorship alone, without the safety key, can hide an owner's updates but never replace the owner.*

### Proof of life travels

An objection is a signed act. It proves the home was alive after the homeless rotation was made, wherever it comes from.

1. **Evidence from anywhere.** A verifier that holds a valid objection by an old home naming the homeless rotation treats that home as reached, however the objection reached it: from the home, from any relay, from a probe (below), or from a bundle (below). It then applies the homeless procedure's step 3 as the MIP says.
2. **Relays carry it.** A relay that is given a homeless rotation SHOULD submit it to the old homes it can reach, and SHOULD store and serve any objection it gets back. A home SHOULD serve its objections to anyone (identity record, part 7).

### Trying to reach the home

Before treating a home as unreachable, a verifier:

1. MUST try every base address it knows for the home: the hint in the home entry, and the hints of the operator's routes (see "Addresses"), including onion addresses.
2. SHOULD ask at least two relays of different operators to probe the home on its behalf (below), preferring relays its user chose or that stand in other jurisdictions.
3. SHOULD look for an objection naming the homeless rotation at every relay it can reach.

The home is reached if any address or any probe returns a well-formed identity record, error 2, or an objection naming the rotation. *Any of these is life.* The verifier then asks it for an objection or a normal rotation (Identity rule 33), and decides from the signed acts it gets.

The home is unreachable only if every direct attempt fails to answer at all, or answers only malformed messages, on at least two attempts, and no probe and no relay produced an objection. *How long a client waits before an attempt fails is its own choice and never enters any act.*

**Isolation.** If the verifier can reach no relay outside those the rotation itself names, it SHOULD NOT treat the home as unreachable: it shows the identity as "cannot be checked from here" instead. *A verifier that can reach only the thief's own servers has learned nothing about the home.*

### Probes

`POST {base}/probe`, body:

```cddl
probe = {
  0 => bstr,             ; the homeless rotation
  1 => [+ tstr]          ; the base addresses of the old home to try
}
```

The relay submits the rotation to each address (`POST {addr}/acts`) and asks each for the identity record, and answers `[* bstr]`: every signed act it got back (objections, receipts, the chain), which the verifier checks itself. If nothing answered, it answers error 8. *A relay's "no answer" is a hint; a relay's signed acts from the home are proof. A censor must block every relay that could carry one small signed act, not just one server.* A relay MAY refuse probes (policy), and MUST contact only base addresses under this cMIP's own paths, so a probe cannot be used to reach anything else.

### Bundles

A **bundle** is a file holding acts, so evidence can cross a border by any means: a USB stick, a messaging app, an animated QR code.

```cddl
bundle = {
  0 => [+ bstr],         ; acts, each exactly as a relay would serve it
  ? 1 => [+ bstr]        ; sealed containers
}
```

Its media type is `application/cbor`, and its file name ends in `.mor`. A client MUST be able to import a bundle and treat each item exactly as if fetched from a relay: checked, never trusted for where it came from. *An owner, a friend abroad or a protection service can hand anyone inside the identity record and the objection that voids a thief's rotation.*

### While re-homed without audit

*Client conformance.* While an identity's current state rests on a homeless rotation accepted on the client's own failed attempt, the client MUST show it as "re-homed without audit" (Identity), and SHOULD NOT deliver private content, content keys or payments to it, nor to its inbox, without telling the user plainly what that label means. *This limits what the thief gains in the window, before the objection arrives. No verifier can check it; it is the sender's own client that protects the sender.*

### The owner's defence

*Nothing above beats a country that seals itself off completely: its readers see the thief's rotation, labelled, until evidence gets in, and under F85 the first objection that does undoes it. The owner's own defence is already in the core: declared auditors, or several homes, ideally in other jurisdictions. A genesis client SHOULD recommend both to an owner who may face a hostile state (Identity rule 35).*

*Decided (Nobody, allegedly, Q4): the definition of the attempt, probes, bundles, onion addresses, the isolation rule and the client rule, as written here.*

## Errors

An error is answered with an HTTP status of 4xx or 5xx and the body:

```cddl
error = {
  0 => uint,              ; code, below
  ? 1 => tstr,            ; a plain-text reason
  ? 2 => [+ bstr]         ; acts that explain it (code 4: the held rotation and its receipt)
}
```

| Code | Meaning |
| --- | --- |
| 0 | malformed: the body is not a message of this cMIP |
| 1 | invalid: the act fails a check the relay made; the reason names it |
| 2 | not served: this home does not serve that identity |
| 3 | missing predecessor: send the earlier identity-chain acts first |
| 4 | conflict: another valid rotation is held at that position |
| 5 | refused by policy: the relay's or home's own conditions |
| 6 | too large |
| 7 | not accepted from this signer, or payment required |
| 8 | not held |
| 9 | not supported by this relay (including a probe it refuses) |
| 10 | slow down |

**Silence is not evidence.** "Not held", an absent part and an empty feed say only what this relay answered once. A client MUST NOT treat any of them as proof that an act does not exist, was never made, or was withdrawn. *The core can prove life (an objection names an act that existed), never absence.*

## Clients

1. A client MUST verify every act it receives as the MIPs require before relying on it, and MUST treat every unsigned answer as a hint.
2. A client SHOULD fetch an identity's chain from more than one of its homes where several are declared, and MUST judge which rotation counts from receipts, never from which home answered.
3. A client never signs anything for the transport. *Every signature in MOR signs an act id (Identity). A relay decides whether to keep an act by its signer, which the act already proves; a login would add a second kind of signature and a way to trick a key into signing something that is not an act.*
4. Relays MUST answer every request with the header `Access-Control-Allow-Origin: *`, so that a client running in a web browser, such as the web reader, can reach any relay directly.

## Reasoning

- **A relay is a dumb store with an index.** *Everything that decides anything is a signed act, checked by the client. The transport can therefore be simple and untrusted, and a relay that lies can only withhold, never forge.*
- **The web's own plumbing.** *Plain HTTPS requests with CBOR bodies work from every language, every browser, behind every firewall, and through ordinary caches. Acts never change, so a fetched act can be cached forever.*
- **Following without a live connection.** *A feed request that waits a little before answering gives new acts within moments, with nothing more than ordinary requests. A live connection can be a later cMIP, competing like any other (Nobody, allegedly, Q5).*
- **Numbers, not times.** *A relay's arrival number orders what it holds, for paging only. It is never compared across relays and never enters an act.*
- **No logins.** *Acts are signed; that is enough for a relay to choose whose acts it keeps. Nothing else is ever signed.*
- **Homes serve whole chains.** *A verifier cannot tell which routes act counts, or see a fork, from the latest act alone.*
- **Silence proves nothing.** *A relay can always pretend not to have something. The client's rules never depend on an absence.*

## Checked against the core

*What drafting this cMIP showed, for Nobody, allegedly.*

1. **Found in Identity (a flaw; resolved as F84).** Receipt check 3 says a receipt counts only from a home "declared in the home set in effect for that chain position: the homes set by the identity-chain act at the position before". The homeless procedure, step 5, counts receipts "from the new homes", which are declared by the homeless rotation itself, at that same position. Read literally, check 3 rejects every receipt step 5 needs, so no homeless rotation could ever count. The intent is clear; the text contradicts it. *Decided (Nobody, allegedly, F84):* check 3 gains "or, for a homeless rotation, a home in the new set it declares (homeless procedure, step 5)", at the next Identity draft.
2. **A gap in Identity, filled here.** Identity rule 13 asks a home to store the latest routes act; Identity's "Routes" rule needs the chain from version 1 to detect forks. This cMIP requires homes to serve the whole chain, and does the same for the encryption key, which Envelope defines "in spirit" as an Identity act but which rule 13 does not list. A stronger rule, not a relaxation.
3. **Open parameters answered.** Identity: "how a home is queried" (the identity record, log requests). Envelope: "how a client finds the key deliveries and sealed containers addressed to it" (the feed by `to`, by pickup tag, or by scanning unaddressed containers). F83 lists the first as a condition of the stage-1 freeze.
4. **No clock.** Arrival numbers and feed waits are local and never enter an act or a validity decision.
5. **Untrusted relays** (Envelope). Every answer is a signed act, a hint, or a proof checked against a signed summary.
6. **An act counts only where it is held; delivery is the signer's interest** (core, Envelope). Relays are never required to propagate; clients deliver.
7. **Same bytes to every home** (Identity 8a). Relays store and serve items byte for byte.
8. **Privacy as Envelope promises.** Relays index only outsides and public insides; sealed containers show recipients and pickup tags, never senders.
9. **Signatures sign act ids only.** The transport asks for no other signature.
10. **Found in Identity through this cMIP (a flaw; resolved as F85).** A homeless rotation accepted on the verifier's own failed attempt became final once the next rotation counted, and a thief holding the safety key controls that next rotation. Behind a censor's firewall a thief could make its own theft final, beyond any later objection. *Decided (Nobody, allegedly, F85):* such a rotation never becomes final by the next rotation; the old home's objection voids it whenever it surfaces. This cMIP adds the transport side: objections from anywhere, probes, bundles, onion addresses, the isolation rule, and the client rule while re-homed without audit.
11. **Where the core marks a weak or conformance rule, this cMIP does not smooth it over.** The "tried and failed to reach" case is defined as honestly as a transport can and still labelled the weakest; refusals stay unsigned, as the core says; "not held" proves nothing.
12. **Its place in Production.** This cMIP fills no task and defines no act type (Production rule 8a allows this). No act names it: relays and clients adopt it by implementing it. Its spec hash covers its creator, who must publish it. The creator is named at roadmap step 13; any hash computed before then is a draft hash (Nobody, allegedly, Q6).

## Freeze scenarios

| Scenario | What this cMIP carries |
| --- | --- |
| 5.3 | Journalist and buyer share no relay: the buyer reads the home's identity record, finds the inbox route, delivers a sealed container; the relay sees the recipient, never the sender. |
| 5.2, 6 | Key delivery to a bare key in a sealed container, found by pickup tag or by scanning; scenario 6's reused application key linkable by tag, as stated. |
| 5.5 | A routine rotation submitted to every home; readers fetch the chain and prove kept history from the rotation and the acts' outsides. |
| 5.6 | A rotation submitted to three homes, one not storing it: receipts from two, fetched per home. |
| 5.7 | Homes refusing a thief's rotation (error 5) and holding the owner's; a thief's rotation arriving second (error 4, with the held rotation and receipt). |
| 5.7b | A forged receipt and non-extending summaries served: the client checks them and changes nothing. |
| 5.7c | Closure by rotation, fetched from the operator's homes; absence statements and objections as evidence; the "tried and failed" attempt; escape endorsement delivered to the new homes; redirected inbox and re-delivery. |
| 5.7d | Inclusion and consistency proofs settle a contested position. |
| 4 | Sealed ballots published, mirrored through the unfiltered feed, compared with a commitment. |
| 2.5 | An act of an unknown specification carried by a relay that cannot read it. |
| 8.1 | The MIPs fetched as publications by a read-only client. |

## Open questions for Nobody, allegedly

Asked one at a time; each suggestion is Claude's, not yet decided.

- **Q1.** The Identity flaw in receipt check 3. **Decided (Nobody, allegedly): the one-line fix, recorded as F84.**
- **Q2.** How a recipient finds a sealed container sent to a bare key. **Decided (Nobody, allegedly): both.** The pickup tag for the simple path, scanning always possible for the private path, a fresh bare key per delivery as a client rule, a shortened tag left to a later cMIP. *A design decision of this cMIP, not a commitment of the core.*
- **Q3.** Where an operator announces its home's current address. **Decided (Nobody, allegedly):** the operator's outbox route whose scope is the Identity MIP's hash. *A thief holding the operator's everyday key can list false addresses there; that only sends clients to a server that cannot produce valid receipts, and the operator corrects it with new routes, or by rotating.*
- **Q4.** What counts as "tried and failed to reach" a home. Explored through the censorship scenario, which exposed F85 (decided). **Decided (Nobody, allegedly):** every known address, probes through two relays, an objection from anywhere counts as life, bundles, onion addresses, the isolation rule, and the client rule while re-homed without audit.
- **Q5.** Following new acts by requests that wait, with no live connection in 0.1. **Decided (Nobody, allegedly):** yes; a live connection later, as its own cMIP.
- **Q6.** Who is named as creator of this cMIP, and when its hash is fixed. The hash covers the creator's identity, and the author's real identity is born only at the first acts (roadmap step 13), so until then the hash is a draft hash. **Deferred (Nobody, allegedly) to step 13,** decided together with the build brief's open point 2: which identity signs MOR's founding record.
- **Q7.** Whether homes should also hold and serve evidence (objections, absence statements, escape endorsements, cosignatures) and other homes' receipts for the identities they serve. **Decided (Nobody, allegedly):** evidence SHOULD, other homes' receipts MAY.
- **Q8.** Whether reading an inbox is open to anyone. **Decided (Nobody, allegedly):** open in 0.1, with the cost stated; private inbox reading is set up for, and left to a later metadata-privacy cMIP (F70). *Recipient-only reading would need a signature on something other than an act, which the core does not allow.*

## Open technical parameters

- Whether error codes should map to fixed HTTP status codes, and which.
- Test vectors for the sealed id and the pickup tag.
- A request to fetch an MMR inclusion proof for a kept-ancestry check, or whether clients always compute it from the acts' outsides.
- Limits a relay must accept at the least (a rotation under scheme 3 is over 17 KB).

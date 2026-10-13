# F272 and its readings: the build

*12 October 2026 (night). Branch `f272-signer-in-refs`, from main at `6598322`. One roadmap session: the decisions of 12 October 2026 written in and built. **A.** F272, decided by Nobody, allegedly ("Sounds good. Public acts get their extra room to breathe."; core business). **B.** The readings taken by the project lead under the delegation, findings log, "Two identities on two homes: readings", and its correction. **C.** The readings of the relay fix for the relay transport cMIP draft 3 (development layer). Test identities only. rustc 1.97.0.*

## In plain words

**What F272 is.** When one act points at another (a reply at a post, a post at its picture), it names the other act by its fingerprint, its id. An id says *which* act, never *where* it is kept, so a reader holding only a reply could not find the post unless it happened to ask the right relay. Now a pointer may also name *who signed* the act it points at. Knowing who, a reader can do what MOR already lets anyone do: look that identity up, find its homes and the routes where it keeps its content, and fetch the act there. The name of the signer is only a signpost. It never decides whether anything is valid: a pointer without it is as good as before, and a pointer naming the wrong signer harms no one; the mistake shows when the pointer is followed, because the act fetched shows its own signer.

**What clients must now do.** A program that points at a *public* act must have that act in hand first, and must name its signer. For a *private* act, naming the signer is the writer's choice, because naming it would tell everyone who sent a sealed message. Every program in the repository that writes pointers now does this, and a test shows it for each.

**Replies reach their author.** When the desk signs a reply to someone's post, it now also leaves a copy in that person's inbox, sealed so that only they can open it. The relays holding the inbox see whom the copy is for, never who sent it nor what it answers. Before, a reply went only to the replier's own relays, and the author never heard of it.

**Readers are faster and quieter.** A reader looking an identity up now asks only the homes that matter for each step of the identity's history, asks them all at once instead of one after another, and skips addresses a browser cannot reach (an onion address), saying so on the page instead of failing in the console. Looking an identity up through homes 50 ms away took **589 ms before and 195 ms after**, making the same 10 requests.

**Relays are not sent what they refuse.** A client now reads what a relay says it accepts and does not send anything larger.

**The texts.** Envelopes draft 9, the MICS document v23 and the freeze test suite v23, for Nobody, allegedly, to approve. The new form of pointer is told apart from the old ones by its first byte's kind, so every pointer ever written, and every published test vector, stays valid byte for byte.

**Three questions came up** that the decisions did not foresee. Each is said plainly at the end, with what was built meanwhile; they are asked one at a time.

## Precisely

### 1. The encoding (Envelopes draft 9, field 8)

```cddl
ref = hash                           ; another act, by its id
    / [ act: hash, signer: hash ]    ; another act, and the identity that signed it: new in draft 9 (F272)
    / [ address: tstr, ? hash ]      ; a web resource, and optionally the hash of what was there
```

The two array forms are told apart by their first element: a byte string names an act, a text string a web address. Nothing written before changes: a bare id is a byte string, a web reference an array beginning with text; both decode and encode exactly as before. Shapes that are neither (`[hash]`, three hashes, a signer that is not 32 bytes) are refused, as they were. `core/tests/refs_f272.rs` checks the bytes of the new form, the old forms side by side with it, every refused shape, and that the published three-act vector (the only vector carrying a reference) decodes and re-encodes byte for byte. `cargo run -p mor-core --example gen_vectors` regenerates every vector file unchanged (`git status` clean).

The signer of a genesis is the identity it makes, whose hash is the genesis's own id: a reference to a genesis names that id twice.

### 2. The core library

- `core/src/act.rs`: `Ref::Signed { act, signer }` beside `Ref::Act` and `Ref::Web`; `Ref::act()` (the act named, whichever form) and `Ref::signer()`; decoding and encoding of the new form; `followed(r, act)`, which checks an act fetched by following a reference: the act named, and, where a signer is named, signed by it (`FollowError::OtherSigner` otherwise). **The verifier ignores the signer**: every rule that reads `refs` reads the act named (`Ref::act`), so citations (F155, `holds`), Money's citations and an anonymous claim's (F147), and the vows' evidence (rule 13) read a signed reference as the same reference. A test signs three replies naming one post: without a signer, with the right one, with a wrong one; all three are valid.
- `core/src/chain.rs`: `Verifier::current_routes(identity)` (the routes act that counts, from version 1) and `Verifier::places(signer)`, **the helper that follows a reference through signer, home and routes**: where to look for an act a reference names beside its signer, in order: the signer's outbox routes that count (those for everything first, then scoped ones, since a reference does not say the act's type), then the homes in force at the signer's latest position. Addresses only, each once; inbox routes never. *The core library has no network by design*, so the walk itself, which fetches, lives where the relay transport is spoken: `harness/src/reader.rs`, `Reader::follow_ref` (Rust), and `clients/genesis/src/lookup.ts`, `followRef` (TypeScript). Both use `places` and the core's checks.
- `wasm/src/lib.rs`: `makeEveryday` takes each reference as an id or `[id, signer]`; `describeAct` keeps `refs` as act ids (so every client reading them is unchanged) and adds `refSigners`, the same length and order, each a signer or nothing; `Verifier.resolve` adds `homesAt`, the homes in force at each counting position; `Verifier.places`. **The WebAssembly's bytes changed: a display client release follows** (as after F267).

### 3. Every client that writes references (client conformance)

| Client | What it refers to | Now |
| --- | --- | --- |
| genesis | (an API others use) | `referTo(id, hints)` fetches the act and writes its reference, `[id, signer]` for a public act, the id alone for a private one; it refuses to write one for an act it cannot find. `referenceTo(bytes)` does the same for an act held. `sign` and `publish` take references in either form. Test: `test/f272.test.ts`. |
| connector | posts and messages Claude prepares | Each act named is fetched first (no draft otherwise); a public one is written `[id, signer]`, a private one by id. `readDraft`, run again by the desk from the bytes, refuses a public act named without its signer, with the wrong signer, or not found. The draft format carries either form under the same label (version 2: older drafts read as before; an older desk refuses a new draft, failing closed). Test: a reply naming a public and a private act. |
| desk | signs what the connector drafted | Checks the draft as above before signing; signs the reference as drafted. Test: a reply to an outsider's post, and two hand-written drafts refused (no signer; wrong signer). |
| barebone | a post's own picture | `[picture, poster]`: the publication it has just made, held. Test: the post's reference names the poster. |
| repo | a signature citing the signer's latest payee pointer (Money rule 14) | `[pointer, its signer]`: the pointer act it fetched (`latestPointerAct`). Agreements still find the pointer through the signed form. Test in `test/repo.test.ts`. |
| collective | a split citing the service's previous split | The previous split is **private**: named by id alone, the writer's choice, so a reference does not say who sent what a sealed container hid. Test: the split's reference has no signer. |

No other client writes references (poster and site go through barebone; longform, reader, manage and assess write none). No Rust program outside tests writes one.

### 4. Replies reach the identity they answer (reading B1)

*Envelopes, "How acts reach people": "Clients SHOULD deliver an act that concerns a counterparty to that counterparty's inbox route"; the desk's open question 4, option (a).* A post naming another identity's public act now names that identity in its recipients (`to`), and on approval the desk publishes it on the relays as any post and leaves a copy, sealed to that identity, in its inbox. The copy is made at signing and kept, so **Send again** sends the same bytes. An identity with no inbox or encryption key gets no copy, which the desk says; the reply is published all the same. Relays at the inbox see a container for the recipient: never its sender, nor which act it answers. **Why the reply names its recipient** is question 1 below: without it, the core does not open the copy.

`clients/desk/README.md`: readings 8 and 9 added; open question 4 marked answered. `clients/connector/DRAFTS.md`: the format's field 6 and 9 and the rules for a post.

*Not done here:* a private message naming a third identity's act delivers no copy to that third identity (see "Readings taken", 2); an acknowledgement is a witness act, which the desk does not deliver to the acknowledged identity's inbox.

### 5. Readers (readings B2, B3, B4, and following by signer)

All in `clients/genesis/src/lookup.ts`, which the web reader, the barebone client, the desk and the connector share.

- **B2, the homes in force at each position.** The lookup asks the homes in force at the latest position that counts so far (the core's resolution, `homesAt`), with those homes' operators' chains to check their receipts; once a rotation counts on their receipts, the homes it names are in force and asked in turn; it stops when no new home is in force. A home that only a rotation not counting names (a pending one, a thief's) is never asked. *How it reads the reading:* a home dropped by a rotation is still asked for the position where it was in force, since its receipts are what make that rotation count. The deployed case (the Mac's onion home) is still in force at the latest position, so B2 alone changes nothing there; B3 does.
- **B3, an address a browser cannot reach.** An onion address with no way in mapped for it (`via`, as the desk maps home3 to its local port) is not tried. The lookup returns it in `notTried` with why; the barebone client and the web reader show it under the act ("Not tried: … an onion address, which a web browser cannot reach"). The browser test checks that no request goes to it and nothing appears in the console.
- **B4, side by side.** The genesis is asked of every hint at once, the homes of each step at once, every operator's chain at once (its genesis and its feed together); the barebone client reads a post's references side by side, its withdrawal search over every relay and signer at once, a picture's bytes from the reader's own relays at once (then, only if they hold nothing, from the places the publication names: the order was for privacy and stays); the web reader's front page asks every relay's feed at once and reads the documents at once, listing them in order.
- **Following by signer.** `followRef`: where the reader already asks, side by side; not there, and a signer is named, the signer is looked up from those same places, then the act asked of its outbox routes side by side, and only if they hold nothing, of its homes. A wrong signer is said ("the reference is wrong"). The barebone reading and the web reader use it, and say "signed by … as the reference says".

**Measured** (`clients/genesis/scripts/measure-lookup.ts 50 7`: three local homes, each behind a proxy waiting 50 ms before every request; an identity with genesis, routes, encryption key and one counting rotation; median of 7 lookups):

| | Median | Min | Max | Requests |
| --- | --- | --- | --- | --- |
| main, `6598322` | 589 ms | 577 ms | 632 ms | 10 |
| this branch | 195 ms | 190 ms | 202 ms | 10 |

### 6. The relay transport cMIP draft 3 (C)

- **"Clients", 6, added:** "A client SHOULD NOT send a body larger than the relay's stated limits, read from `GET {base}/info`: an act or a sealed container no larger than `limits.0`, media no larger than `limits.1`. Where the relay states none (it does not answer, or not with a message of this cMIP), the client may send, and the relay judges." With its reason in italic.
- **The header:** "Nothing else changes." replaced by: "**Revised in place since, for Nobody, allegedly, to approve with the rest:** a body too large is still answered ("Errors", decided by Nobody, allegedly, 12 October 2026), and a client does not send a body larger than the relay's stated limits ("Clients", 6; a reading of the relay fix taken by the project lead under the delegation, 12 October 2026)."
- **Built:** `relay/src/client.rs`: `Client` reads the limits from `GET /info` before the first body and keeps them (clones share them); a body over them is not sent, `ClientError::TooLarge`, which is not an answer of the relay's (`answered()` is false). `Client::without_limit_check` sends past them, for the tests of the relay's own answer: `too_large` now uses it, unchanged otherwise. The TypeScript transport does the same, refusing with code 6 and a reason beginning "not sent". Tests: `relay/tests/relay.rs`, `a_client_does_not_send_past_the_stated_limits`; `clients/genesis/test/f272.test.ts`.
- `relay/README.md`: "draft 2" → "draft 3" (twice), and a paragraph "The client asks first".

### 7. The texts

**Envelopes draft 9** (`spec/MIR-envelopes-draft-9.md`; draft 8 stays, approved): a new header; the mark "New in draft 9 (Fxxx)"; the definition of a reference; **rule 20**, two paragraphs added, the rule, the client conformance stated as such, and its reasoning in italic; the `ref` format and a note on telling the forms apart; a reasoning bullet; a freeze-scenario bullet. Rule 20 as it now reads, after draft 8's paragraph unchanged:

> **A reference may name the act's signer** (new in draft 9, F272). A reference to an act MAY carry, beside the act id, the identity hash of the act's signer (Part three, `ref`). A reader uses it only to know where to look: the signer's identity, its homes, its routes, then the act. It is never a validity rule: a reference that names no signer never makes an act invalid, and an act whose reference names a wrong signer stays valid; a wrong signer shows when the reference is followed, since the act fetched shows its own signer. The signer of a genesis is the identity it makes, whose hash is the genesis's own id.
>
> *Client conformance* (new in draft 9, F272)*:* when the act referenced is public, the client that writes the reference MUST hold that act and MUST name its signer. When the act referenced is private, naming its signer is the writer's choice. Web references are unchanged.

**The MICS document v23** (`spec/02-MOR-MICS-v23.md`). Sentences changed, quoted:

1. The header, replaced; v22's header moved, verbatim, to "Earlier versions", marked approved. The renaming note (*"Renamed in place, 12 October 2026 (F269, …): the core's six texts are MIRs, the core as a whole the MICS, and this document the MICS's own; wording only, no rule changed."*) now reads: *"The core's six texts are MIRs and the core as a whole the MICS (F269, renamed in place in version 22, `docs/mir-rename-pass.md`)."*
2. In "Acknowledgements and references", was: *"A reference says "look at this", pointing to an act or a web resource, optionally with the hash of what was there. A repost is a reference: it pays nobody by itself."* Now: *"A reference says "look at this", pointing to an act or a web resource, optionally with the hash of what was there. A reference to an act may name the act's signer beside its id (F272): a reader uses it only to know where to look, through the signer's identity, homes and routes; it never decides validity, a wrong one showing only when the reference is followed. Client conformance: a client referring to a public act holds it and names its signer; naming a private act's signer is the writer's choice, since it would expose the sender a sealed container hides. A repost is a reference: it pays nobody by itself."*
3. In "Vows", was: *"…and later versions are signed again on its own chain (Envelopes draft 8)."* Now: *"…(Envelopes draft 9)."*

**The freeze test suite v23** (`spec/03-MOR-freeze-test-suite-v23.md`). Sentences changed, quoted:

1. The header, replaced; v22's moved to "Earlier versions", marked approved; the renaming note as in the MICS.
2. The Envelopes and Text line, was: *"Acknowledgements counting only alongside the act they name; references, including a web reference with a snapshot hash; a repost as a reference (2, 5)"*. Now: *"Acknowledgements counting only alongside the act they name; references, including a web reference with a snapshot hash; a repost as a reference; a reference naming its act's signer, followed by it to where the act is kept, a wrong signer failing only when followed and never making an act invalid, a client naming the signer of every public act it refers to (F272, client conformance) (2, 5)"*.
3. A new step in scenario 5, **3a**: *"(F272) A reply followed by its signer. A reader of the journalist's, a stranger to the journalist's relays, replies to one of the journalist's public posts: the reply names the post with the journalist as its signer, and the reader's client fetched and held the post before naming it (conformance). The reply is kept at the reader's own home, the post at another home the journalist's outbox route names. A stranger holding only the reply, from that one home, follows it, by the signer named, through the journalist's identity, homes and routes, to the post, and verifies both. The same reply with a wrong signer stays valid, as does the post; following it fails, the post fetched showing its own signer. A reply to a private act names no signer unless its writer chooses to."*
4. Scenario 5's "Passes if", was: *"**Passes if:** likes and replies keep nothing alive …"*; now begins: *"**Passes if:** a reply's named signer leads a stranger to the post it answers while deciding nothing about validity, likes and replies keep nothing alive …"*, the rest unchanged.

**Run:** step 5.3a is `harness/tests/references.rs`, against two real homes: the stranger, knowing only the home with the reply, follows the signed reference to the post at the other home and verifies both; the bare reference gives it nothing to look by; a wrong signer leaves the reply valid and fails when followed. The same story runs in the web reader (Node and headless Chromium) and the barebone client.

`spec/README.md` lists the three new texts as awaiting approval. The Agreements MIR is not touched.

### 8. Tests

`scripts/test-all.sh` on this branch against main at `6598322`, same machine:

| | main `6598322` | this branch |
| --- | --- | --- |
| Rust workspace: passed (ignored) | 653 (1) | 662 (1) |
| TypeScript, every package: passed | 288 | 299 |
| Failed | 0 | 0 |

Per package, TypeScript (main → branch): assess 33 → 33, barebone 9 → 10, collective 42 → 42, connector 12 → 13, desk 13 → 14, genesis 20 → 26, longform 26 → 26, manage 7 → 7, poster 7 → 7, reader 16 → 18, repo 19 → 19, site 58 → 58, jpeg 14 → 14, video 6 → 6, carry 6 → 6. Rust: +7 core (`refs_f272`), +1 relay, +1 harness. All green, one full run each; `scripts/test-all.sh` exited 0 on both.

*Expected on GitHub:* the step "Reproducible build of the display client" compares a fresh build with the released copy in `clients/site/built/`; the WebAssembly changed, so it differs until the display client is released again from the author's machine, as after F267.

New tests: core `refs_f272` (7); relay `a_client_does_not_send_past_the_stated_limits`; harness `references` (step 5.3a); genesis `f272.test.ts` (6); connector (1), desk (1), barebone (1), reader (2: Node and Chromium). Assertions added to existing tests: repo (the pointer's signer), collective (the private split's reference).

## Readings taken (the project lead's delegation, mechanics; to confirm)

1. **B2, read as built** (section 5): "the homes in force at that position" read as the homes the counting chain names at each position, asked as each position comes to count; a dropped home is still asked for the position it receipted.
2. **B1 for public replies only.** A private message naming a third identity's act is delivered to its one recipient only: a copy to the third identity would show it a message its sender sealed for someone else. B1 said "a reply" without saying public; this reads it as the act the replier made public.
3. **"Not held" stays in the browser's console.** The reader asks its own relays first; one that does not hold an act answers "not held" (the cMIP's error 8), which a browser logs as a 404. The browser test allows exactly that answer for the act being followed, and nothing else. Asking the signer's places in priority order (outbox routes, then homes) keeps other homes from answering it too.

## Questions for Nobody, allegedly, one at a time

### Question 1 (core business): a reply's sealed copy, and the reply's recipients

*Plain words.* To leave a sealed copy of a public reply in the author's inbox, the core says the act inside a sealed container must name, on its own outside, the identity it is sealed to (Envelopes, "Sealed container", step 5; the core library refuses to open it otherwise). That rule exists so that a message sent privately to Ana cannot be passed into Ben's inbox as if it were for Ben. B1's correction ("in a sealed container addressed to it") did not say how the reply meets it.

*What was built meanwhile:* the reply itself names, in its recipients (`to`), the identities whose acts it answers. Nothing new is shown by this: the reply is public, and anyone reading it already sees which act it answers and, under F272, whose. It also lets any relay holding the reply find it by "addressed to the author", which is the other half of the desk's open question 4.

*The options.*
- **(a) Keep it:** a public reply names the identities it answers among its recipients; no core change. *Cost:* the reply's outside, which every relay reads, shows whom it answers, as its open inside already did.
- **(b) Change the core:** a *public* act may travel in a sealed container to a recipient it does not name, since anyone may show a public act to anyone. *Cost:* a change to Envelopes' sealed container, after its draft's approval, and the replies would not be found by recipient at the replier's relays.

*Lean: (a).*

### Question 2 (development layer): finding the signer of a reference

*Plain words.* A signer's name leads to its homes only once its identity is found, and a reader finds an identity only where its genesis is held. In the deployed case both homes serve both test identities, so a stranger at either home finds either signer; the step 5.3a run does the same. But a stranger who knows only a plain relay holding a reply, where the post's author's chain was never carried, cannot look the author up, and the signpost leads nowhere.

*The options.* (a) The client writing a reference to a public act also carries the referenced signer's identity chain (genesis and rotations, all public) to the relays where it publishes, as clients already carry their own; it has to fetch the act anyway. (b) Leave it to the reader: it asks the places it knows, a stated cost. (c) A reference also names a home: a core change, and a hint the core would have to trust. *Lean: (a), as a client SHOULD in the relay transport cMIP, beside the rule of section 6.*

### Question 3 (presentation): whether to confirm reading 2

Whether a private message that names a third identity's act should also reach that third identity (reading 2 says no). *Lean: confirm the reading.*

## Not done here

- The findings log entry, for the project lead after merge, as for earlier builds.
- The display client release the WebAssembly change calls for.
- A rotation to drop the onion home from any identity: not needed (Nobody, allegedly: "Keep the Mac home").

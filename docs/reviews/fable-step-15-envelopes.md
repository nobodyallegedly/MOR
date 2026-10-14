# Step 15, machine review: Envelopes

*14 October 2026. Fable, for Nobody, allegedly. Segment: Envelopes (`spec/MIR-envelopes-draft-9.md`), read on main at `c3f2a41` with the MICS v26, the freeze test suite v26 (the components under "Envelopes and Text" and scenarios 2, 4 and 5), the core library (`core/src/act.rs`, `cbor.rs`, `lock.rs`, `hash.rs`, `mmr.rs`, `envelopes.rs` and its `vow` and `anchoring` modules, and the parts of `chain.rs` that apply Envelopes rules), the published vectors, the tests, the relay's handling of acts and sealed containers, and the barebone client's reading of publications and withdrawals. The findings a rule cites were read where the rule led there (F78, F89, F90, F91, F98, F99, F108, F110, F128, F252, F272).*

**This is a reading and a test review, not a second verifier.** Verifier B is deferred to MOR 2 (main, `c3f2a41`). Everything below was reached by reading the text against the code and by tests; rules exercised only by reasoning are listed in the last section. The Rust tests could not be run in the reviewing container (no route to crates.io from it); they run on the pull request's own checks, and that run is the test run.

## In plain words first

The Envelopes MIR is in good shape. Its hard parts hold: the two-plaintext trick is shut by the inside commitment, the salt keeps a one-word reply from being guessed, the depth limit and the deterministic encoding give every verifier the same bytes, the sealed container cannot be opened by, or widened to, anyone its sender did not seal it to, and the running summary is built exactly as the text says. I tried what the plan asked of batch 1 and found no way to make two honest verifiers holding the same bytes disagree on what an act *says*.

What I found is of two kinds. First, rules whose **verdict is unstated**: the text says MUST and stops, and a second implementer has to guess what happens when the MUST is broken. Three of those matter: what an everyday act's wrong position or summary makes it (nothing, in the code: it bites only when a rotation's kept line is rebuilt); what a verifier does with two copies of one act id that differ only in their signature (the code keeps the valid one; the text is silent, and a relay keeps the first that arrived); and what an empty `prev` looks like on the wire (the vector and the code say "key 2, empty array"; the CDDL says the key is optional). Second, **formats the text never gives**: the commitment (type 2) and the withdrawal (type 3) have no payload format, and the commitment's tree is still an open parameter, so nobody can write a second verifier for either, and the suite's "relays and commitments" is reasoned, not run.

One claim in the text is false and should be reworded: the sealed container's one-time signature does not keep a relay from re-addressing the container. A relay can drop a recipient and sign the rest with a key of its own, and the remaining recipients open it as if the sender had built it so (pinned by a test). The signature guards nothing the capsules do not already guard. That is a wording fix, or a small format change before the freeze, at Nobody, allegedly's choice.

One bug in the code, fixed: a text act, or an Envelopes act, carrying `acks` was shown as *unknown* by a client that does not hold the Money and Agreements hashes, where rule 18 says *invalid*; every client holds the Envelopes and Text hashes and can tell. Fixed in the core library, with a test that failed before the fix.

Nothing here breaks a guarantee. Everything that could make two verifiers disagree is a sentence or a format away from closed.

## Findings

Severity: **breaks a guarantee** / **leaves a gap** (two honest verifiers could disagree, or a second implementer must guess) / **wording**. Kind: **text** (the MIR allowed two readings or was silent), **code** (the code diverged from a clear rule), **instrument** (a client or module, no core rule at fault). Pattern: one of the four of round 2, or "fits none", named.

### E1. The empty `prev` has two encodings in the text and one in the code. Text. Leaves a gap. Fits none: one meaning, two encodings.

**Sentences.** Part three: `? 2 => [* hash]` (the key is optional). Rule 13: "An everyday act MUST carry ... at most one `prev`"; "Sequences": "The first act of a sequence (empty `prev`) has position 1".

**Evidence.** The published vector (`sequence-three-acts.json`, first act) encodes key 2 as an empty array (`0280`). The code requires the key: `Sequence::check_next` returns `MissingPrev` when it is absent, and `Verifier::status` shows an everyday act without key 2 as invalid. Identity draft 12 says "`prev` is present" for Identity's everyday types only. A verifier written from Envelopes alone would accept a first text act with key 2 absent; the library does not.

**Smallest fix.** In rule 13: "An everyday act MUST carry `prev` (empty for the first act of a sequence), with at most one entry"; in the CDDL, note that key 2 is required on every everyday act. Cost: one line; no published bytes change.

### E2. Rule 13 says MUST and gives no verdict. Text. Leaves a gap. Pattern: a rule rests on a fact nobody can check (the predecessor's position and the whole line, which a verifier may not hold).

**Sentence.** Rule 13: "An everyday act MUST carry a position and a running summary consistent with its predecessor".

**Evidence.** The library checks neither, act by act: `Verifier::status` reads position and summary nowhere; they count only when a rotation names a kept tip and the line to it is rebuilt (`chain.rs`, `in_kept_ancestry`, `line`), where a summary that does not match leaves the act unprovable as kept. So an act carrying position 40 on a predecessor at 3 is *valid* today. A verifier written from the text would show it *invalid*; or, holding only the act and not its predecessor, could not tell. Two readings, and the second one gives verdicts that flip when more acts arrive, which the plan's order-independence rule forbids.

**Smallest fix.** State the reading the code takes, which is also the one that needs no partial knowledge: "Position and summary are not checked act by act. They are checked when a line is rebuilt (Identity, kept ancestry): an act whose position or summary does not match the line leading to a kept tip cannot be proven kept." One sentence. Cost: none to the code. The other reading (invalid when the held predecessor disagrees) costs a code change and admits verdicts that depend on what was fetched. Put to Nobody, allegedly, as Q1.

### E3. The one-time signature does not do what the text says. Text. Wording (with a format choice). Pattern: a rule rests on a fact nobody can check (who built the container).

**Sentences.** Sealed container, step 3: "It keeps a relay from re-addressing the container; it says nothing about the sender". MICS, "Public receiver, private sender": "it is signed by a one-time key".

**Evidence.** The one-time key belongs to nobody, so anyone can make one. Holding a container sealed to Bob and Carol, a relay drops Carol's entry from `to` and her capsule, signs `[to, one-time-key, locked-act]` with a fresh key, and Bob opens the result as before; Carol is simply no longer a recipient of it (`core/tests/envelopes.rs`, `a_recipient_can_be_stripped_and_the_container_resigned`, added, passing: it pins the behaviour). Adding a recipient is impossible, because that needs the container key, and so is swapping capsules between containers, because each container key is fresh. So the signature prevents nothing the capsules and the locks do not already prevent; it binds the four parts together against accidental corruption, which the authenticated locks also do. What a relay *can* do, drop a recipient, it can do anyway by withholding. No guarantee breaks; the explanation is wrong, and 96 bytes and a Schnorr verification per container buy nothing.

**Smallest fix.** Reword step 3: "It binds the container's parts together. It proves nothing about who built the container or whom it was meant for: the inner act's own `to`, signed by the sender, does." Cost: two sentences. Alternative, before the freeze only: drop the one-time key and the signature from the container (`sealed = [to, locked-act]`), saving the bytes and the verification; or give the signature a job by writing the one-time key into `contents`, so a recipient can tell a rebuilt container from the sender's. Both are format changes; I do not recommend either unless Nobody, allegedly, wants the container to carry that proof. Put as Q2.

### E4. Two copies of one act id, differing only in signature. Text, leaves a gap; and instrument (relay). Fits none: arrival order decides.

**Sentences.** "How it fits together", step 3: "The act id is `tagged_hash("MOR/act", outside)`. The signature signs the act id." Nothing says what follows from the signature being outside the id.

**Evidence.** Two byte strings can carry one act id and differ in their signature: one valid, one broken, one under a scheme a verifier does not implement. The library handles it (`Verifier::add_with_key`: "a copy with a valid signature is kept over one without"), so Verifier A gives the right answer in every arrival order. The text does not say so, and a second verifier that kept the first copy would show the act invalid or unknown for good. The relay keeps the first copy by id (`relay/src/node.rs`, `put_act`: "Publishing is idempotent"), after refusing a copy whose signature is *invalid* but storing one whose scheme it does not implement (*unknown*). So whoever sees an act's outside first can publish it under a signature of an unknown scheme, and the genuine act is then refused at that relay as "already held": a block at the cost of one submission, against a relay that follows rule 27 as written. It needs the outside before the signer publishes, which a relay operator or an on-path observer has; both are untrusted by the text, so no guarantee breaks, but an honest relay is turned into the censor.

**Smallest fix.** Text, after step 3: "The signature is not part of the id. A verifier that holds two copies of one id keeps the one whose signature is valid." Rule 27, one clause: "and a relay holding a copy whose signature it could not verify SHOULD replace it with one it can." Cost: two sentences; the relay change is small (`put_act`: on a duplicate id, replace when the held copy's verdict is unknown and the new one's is valid). Instrument, to fix when cheap.

### E5. A text act or an Envelopes act carrying `acks` was unknown to a client without the Money and Agreements hashes. Code. Fixed. Pattern: a lower layer's rule depends on data only a higher layer's client holds.

**Sentences.** Rule 18: "A text act, any other act of this MIR, and every act of a cMIP or Module MUST NOT carry `acks`; an act that does is invalid." Rule 19's commentary: "one that cannot tell which MIR an act's specification is shows the act as unknown, never as valid". MICS, "Client conformance": "Every client implements Identity, Envelopes and Text."

**Evidence.** `Verifier::acks_allowed` answered `None` (unknown) for any non-Identity act carrying `acks` whenever the verifier was built without the Money and Agreements hashes (`Verifier::new`, used by the WebAssembly verifier when a client gives neither), including a text act and a publication, whose MIRs every client implements. A messaging client with no Money and no Agreements therefore showed a reply carrying `acks` as unknown, where the rule says invalid. The commentary's "cannot tell" is right for a cMIP's act; it does not apply to Text's and Envelopes' own.

**Fix made.** `Verifier::knowing_envelopes_and_text(envelopes, text)` tells the verifier the two hashes every client holds; `acks_allowed` then answers invalid for their acts carrying `acks` and still unknown for a specification it cannot place. Test: `core/tests/chain.rs`, `a_text_or_envelopes_act_carrying_acks_is_invalid_without_the_money_and_agreements_hashes` (fails before the fix at the first "invalid" assertion). Left to the clients (instrument): the WebAssembly verifier's constructor takes the Identity hash and, optionally, Money's and Agreements'; it should take Envelopes' and Text's too, and the clients should pass them. Not done here, since it changes a client API.

### E6. The commitment (type 2) and the withdrawal (type 3) have no format. Text. Leaves a gap. Fits none: a type without a format.

**Sentences.** Rule 28: "a public act (type 2 of this MIR) holding the Merkle root over the sorted ids of the acts it holds, and their number". Rule 24: "A withdrawal is an act of type 3 of this MIR naming a publication in `objects`." Part three gives formats for types 0, 1, 4 and 5 only; "Open technical parameters": "Merkle construction for commitments (sorted set)".

**Evidence.** Nothing in the core library reads or writes a type 2 or a type 3 payload. The barebone client writes a withdrawal with an empty payload and `objects: [[publication, publication]]`, and reads one by its `objects` entry's *chain* being the publication (`clients/barebone/src/post.ts`); a second client could as well read the *predecessor*, or require an empty payload, or not. No client makes a commitment. A second verifier cannot be written for either type, and the suite's "Relays and commitments" (scenario 4, "every mirror matches the commitment") cannot be run against the core: scenario 4 as written rests on the voting cMIP's own commitment, not on type 2.

**Smallest fix.** Withdrawal: "`withdrawal = {}`; its one `objects` entry names the publication as both chain and predecessor: `[publication, publication]`." Commitment: either give it a format and a tree (`commitment = { 0 => uint, 1 => hash }`, the tree built as Identity's log summary, RFC 9162 over the sorted ids, which `core/src/merkle.rs` already implements), or take rule 28 and type 2 out of the core. By the admission test I lean to the second: a relay's statement about its own store is the relay market's business, nothing in the core relies on it, and the relay transport cMIP is where it belongs. Cost: two lines of CDDL, or one deletion and one suite line. Put as Q3.

### E7. A key delivery's authority and its wrong key. Text. Wording.

**Sentences.** Rule 11: "A key delivery MUST name the act or publication whose key it carries"; "Going public later. The signer publishes a key delivery addressed to no one".

**Evidence.** Nothing says who may publish a key delivery (anyone holding the key can, a buyer included: inherent, and the text's "its recipient may later show it to anyone" accepts it), nor what a verifier does with one whose key does not open the act it names. The library checks it when used (`KeyDelivery::opens`); as an act it is valid by shape. A second verifier could show a key delivery carrying a wrong key as invalid.

**Smallest fix.** One sentence under rule 11: "A key delivery is valid as an act by its shape; its key is used only if it opens what it names (rule 7's test), and one that does not is ignored and shown so. Anyone holding a key may deliver it." Cost: one sentence.

### E8. Rule 12 names step 4; the code also refuses step 5. Text. Wording.

**Sentence.** Rule 12: "a container whose signature, capsule or contents fail the checks of 'Opening' (step 4) is invalid".

**Evidence.** `envelopes::open` also refuses a container whose inner act does not name this recipient in its own `to` (step 5, rule 11), with `EnvError::Addressing`; the tests pin it (`one_container_for_several_recipients`). A second implementer reading rule 12 alone would deliver the act and show the addressing mismatch, or not.

**Smallest fix.** "steps 4 and 5". Cost: two words.

### E9. Floats. Text. Leaves a gap (minor).

**Sentence.** MICS, "Common conventions": "deterministic CBOR (RFC 8949, section 4.2.1)". Rule 1 names the same.

**Evidence.** Section 4.2.1 leaves the deterministic encoding of floating-point values to the protocol ("additional deterministic encoding rules might need to be defined"). The library rejects a float not in the shortest form that preserves its value, NaN payloads included (`cbor.rs`, `NonPreferredFloat`), and carries tags and simple values as they come. A payload (`any`) may hold floats; a second verifier reading only 4.2.1 would accept a non-shortest float the library refuses.

**Smallest fix.** One clause in the conventions: "floating-point values in the shortest form that preserves them (section 4.1, preferred serialization), tags and simple values as they are". Cost: one clause; the vector `cbor.json` already pins it.

### E10. The relay's sealed-container id reuses the core's tag. Instrument. Wording.

**Evidence.** `relay/src/wire.rs`, `sealed_id`: `tagged_hash("MOR/sealed", bytes)` over the whole container, where the core uses `MOR/sealed` for the one-time signature's hash over `[to, one-time-key, locked-act]`. Two kinds of object under one tag, against "each one names one kind of object" (`hash.rs`). No attack follows (the signature protects nothing, E3), but tags are the one hygiene rule the core has for hashes.

**Smallest fix.** A tag of the cMIP's own, `MOR/transport/sealed-id`, as the pickup tag already is. Cost: stored ids at running relays change; do it with the next relay store migration, or not at all for MOR 1.

### E11. For the Identity segment, not Envelopes: a kept act whose line is not wholly held is shown void.

`in_kept_ancestry` proves membership by rebuilding the whole line from the act ids held and recomputing the summary; one act missing from the line makes a kept act *void* until it is fetched, and *valid* after. The transition void to valid on partial knowledge is the one the plan's order-independence rule watches for. The running summary is a root, so a shorter proof (the peaks and a path) would be possible without changing what acts carry; whether a kept act with a gap in its line should be *unknown* rather than void is Identity's rule 33, not Envelopes'. Handed to the Identity review.

## The verdict vocabulary (attack 7)

Envelopes produces: **valid**, **invalid**, **unknown** (acts; rules 1 to 5, 19, 30); for a sealed container, **delivered** or **delivers nothing** (rule 12; a container is not an act and has no status of its own); **public** or **private** (a fact of the outside, not a verdict); for an encryption key's chain, **contested** from a fork (Part two, as routes); a **fork** (rule 15, shown; what it means is the object's MIR's); **inconsistent** (rule 22, a client's display of a publication beside its media, needing the key: not a verifier verdict, and the text says so); **no longer offered** (rule 24, a client's display). Each of the three act verdicts is one two verifiers must agree on; the rest are displays or facts, and the text marks them as such. No verdict here restates another under a second name. Nothing to move.

## What held under attack

- **The two-plaintext trick.** An act whose key opens to a different inside than the one signed: refused by the inside commitment, salted (`open-act.json`; rule 3).
- **The lock.** XChaCha20-Poly1305 with no associated data, a fresh key per object, the tag bound; a flipped byte, a wrong key, a wrong nonce all refuse (`lock.json`, `lock.rs` tests).
- **Deterministic CBOR.** Non-shortest arguments, indefinite lengths, unsorted or duplicate map keys, trailing bytes, reserved additional information, two-byte simple values below 32, and nesting beyond 128 levels (the 128th allowed, the 129th refused, `cbor.json`): each refused with one reason. Map keys sorted bytewise over their encodings, as 8949 says, not length-first as 7049 did.
- **The shape.** An unknown key on the outside or inside, a `to` or `acks` or `objects` or `refs` that is empty, a hint that is not text, a ref that is neither form: invalid (`act.rs`, `refs_f272.rs`).
- **The sealed container.** Adding a recipient without the container key: impossible. A capsule moved to another container: its key is wrapped under a shared secret fresh to that capsule. A key given for a public inner act: refused. An inner act not naming the recipient: refused (E8 is about the text, not the code). A bare-key container beside other recipients: refused at sealing. X-Wing against a second implementation on every exchange the tests make (`xwing2`).
- **The running summary.** Peaks bagged right to left, left kept left (F89), the three-act vector and the 0-to-11 vector, both reproduced by the Python checker's own MMR.
- **References (F272).** The three forms told apart by their first element; a bare id and a web reference keep their bytes; a wrong signer fails only when followed and invalidates nothing; a genesis's signer is the identity it makes.
- **Acknowledgements (F110).** With the six hashes: a text act, a publication, a cMIP's act carrying `acks` invalid; a witness act and a buyer's claim keep a post visible as disputed after a rotation. Without Money's and Agreements' hashes: see E5, now fixed for Text's and Envelopes' own.
- **The vow.** A closed payload; `acks` refused; a later version's one chain entry told from a collective's own actions entries.
- **Size (F108).** The barebone client shows a publication as inconsistent when the unlocked bytes' length is not field 3, beside the work hash check (rule 21).

## Rules exercised only by reasoning

Rule 9 (no key reused: unverifiable except where both keys are held; it is a signer's rule and the text does not pretend otherwise); rules 25 to 29 (relays: the relay code was read, not attacked, beyond E4); rule 30 to 32 (fail closed: read in the clients, not run); the hijack window (Part two: Identity's rotation decides it); anchoring (a task; its cMIP is outside this segment); publication fields 6 and 7 (places and price: read by the clients only); withdrawal's effect on offers and keys (Agreements').

## Code fixes made

- `core/src/chain.rs`: `Verifier::knowing_envelopes_and_text`; `acks_allowed` answers invalid for a Text or Envelopes act carrying `acks` once told those hashes (E5).
- `core/tests/chain.rs`: the test for E5, failing before the fix.
- `core/tests/envelopes.rs`: the pinned stripping of a recipient (E3), passing, as the behaviour stands.

No MIR text was changed.

## For the freeze suite (attack 6)

Under "Envelopes and Text", three components to add: a first act with key 2 absent (invalid, E1); two copies of one act id differing in signature, delivered in both orders, the valid one counting at every verifier and relay (E4); a container with a recipient stripped and re-signed, the inner act's own `to` the only record of the sender's addressing (E3). "Relays and commitments (4, 5)" is reasoned until E6 is decided; if type 2 leaves the core, the line goes with it.

## Questions for Nobody, allegedly, one at a time

**Q1 (Envelopes, rule 13; core business: what a MUST means for a verifier).** An everyday act whose position or summary does not match its predecessor: is it *invalid* wherever a verifier holds the predecessor, or is it judged, as the code does today, only when a rotation's kept line is rebuilt, where it cannot be proven kept? I recommend the second: it is what the code does, and it is the only reading under which no verdict depends on which acts were fetched first.

**Q2 (Envelopes, the sealed container; core business: a format before the freeze).** The one-time signature proves nothing about who built a container or whom it was meant for. Keep it and reword (my recommendation: cheapest, no bytes change), drop it (`sealed = [to, locked-act]`, saving 96 bytes and a verification per container), or write the one-time key into the locked contents so a recipient can tell a rebuilt container from the sender's?

**Q3 (Envelopes, rule 28 and type 2; core business: what stays in the core).** The commitment has no format and its tree is an open parameter. Give it both (RFC 9162 over the sorted ids, as the home log), or move it to the relay transport cMIP? By the admission test I recommend moving it: nothing in the core relies on a relay's statement about its own store.

The rest (E1, E4's text, E7, E8, E9) are mechanics: one sentence each, no decision of principle, to be written in by whoever writes the freeze-ready draft.

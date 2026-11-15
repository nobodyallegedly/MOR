# Vectors: the new Agreements acts

**Before you copy anything from these files.** They show the payloads of Agreements (`docs/agreements-from-scratch/draft-25.md`, in the bytes of `docs/agreements-from-scratch/encoding-2.md`) and the act around each. To write an act of your own you still take, from the texts on main:

- **Envelopes, Part three** ("The act", "Sequences", "The running summary"): the outside, the lock, and your act's place in **your own** sequence: `prev` naming your act before it, its position, its running summary. Every act here stands in its test identity's sequence, which runs through `valid.json` and then `invalid.json`; your acts stand in yours. Never copy an act's `prev`, position or summary: compute them from your own sequence (`makeEveryday` does, given your sequence so far).
- **Identity**, sections 1 and 2 and Part three: your identity, its genesis, the signing key and the binding that ties it to the identity. The identities here have no identity chain: their identity hash and binding are stand-ins, and their signatures verify only with the key each act carries.
- `tagged_hash` and canonical text (Identity, "Encoding and conventions"); a cMIP's spec hash (Development); an amount's unit and value (Money).
- The two spec hashes, as given in each file's `spec` (`draft_25`, `report_block_4`): never recomputed from a copy of your own.

The acts are written in the bytes `encoding-2.md` gives them: a Terms act and a Statement under draft 25's spec hash, types 0 and 1; a report, a proposal, under the spec hash of the report block's fourth proposal (`docs/lead/proposals/report-block-4.md`), type 0. The first edition's vectors (encoding 1) are gone from this directory, and its acts are "not this encoding".

**In plain words.** Each case is one or more complete acts, as bytes, and the answer a checker must give about the last of them: whether it passes, and if not, which rule it fails. Two builders who read the texts alike give the same answers on the same bytes.

## The files

- `valid.json`: acts that pass. Every kind of act and every field combination draft 25's section 3 allows: the first Terms act with its required fields only, and with every optional field; a role of each of the five kinds; Terms with no party named as a signer; a receiver by position, an agreement as receiver by its root (a party or not), a position beyond the parties; a version, and a second version of the same Terms by another signer; an envelope citing its bake and a transfer; calls from each side; two powers of one kind; a resolving update of Terms (with and without `relies_on`), and `resolves` without `continues`; an author's assent naming the Terms act, a party's first assent, a counter signature, a buyer's contest naming the settlement, a contest with no content, a kind defined by a cMIP, acts made for a signer and for an agreement, answers, relies_on and a settlement; a **resolve** in one signer's line, and one made under a power of kind `resolves`; a payment's confirmation naming its settlement, a leg report with every kind of line, a bare report; a private act with its key; and acts held together: an author's line in one agreement, a fork in one signer's line and the resolve, the act after it, a fork of Terms and its resolving update. Some pass with **notes**: what the act leaves unread, or answers by itself (G1.4, G2.2, G5.2, G6.1, G10.4, G12.3).
- `invalid.json`: one case for every check: each rule of the act format the checker applies (Envelopes rules 1, 3, 5, 10, 13), each rule of encoding-2 (E1 to E22), and each case of **invalid** draft 25 says an act shows by itself (G2.1, G3.1, G4.2, G10.1, two of them at once, in section 2's order) or among the acts held (G6.1).

Each case has `name`, `tests` (the rule it tests), `acts` (each with its `id`, its complete `bytes` in hex, and its content `key` where it is private) and `answer`: `verdict`, `rule`, `notes` (the rules of the notes, in order) and `says`, the checker's plain words (informative; two builders need not match them). Each file also gives the spec hashes and types.

**Verdicts.** `pass`; `rejected` (draft 25's word: no Agreements act, never reaching the grammar rules; what the core calls invalid as an act); `invalid` (a grammar rule named); `unknown` (a signature scheme not implemented, nothing else failing); `cannot open` (a private act, no key); `not this encoding` (another specification).

## The sequences, and the lines

- **Sequences** (the act format's `prev`, position, running summary). Each test identity (A, B, C) signs many acts; each act names the one its signer made before it, in the order they were made, which a reader recovers from the positions. Out of every sequence: the acts that test the act format's own sequence fields (marked "in no sequence": no `prev`, two `prev`), the act whose outside names no signer, and changed copies of an act (a flipped byte, another signature). Two private acts are given without their keys, where a case tests that; each takes its place from the act after it, which names it in `prev`.
- **Lines within an agreement** (the payload's `previous`, G6.1). Within each agreement, every act names its signer's act before it there; an author's assent names the Terms act its signer made. The exceptions are the cases that test them (an act not held, a private act held without its key, another signer's act, another agreement's, a report, a rejected act), and the two tips of the fork in A's line, which both name A's assent: that is the fork the resolve resolves.

## How they are made, and checked

- Generated from the code, never by hand: `cargo run -p mor-core --example gen_vectors` (its part is `core/examples/support/agreements_new.rs`). Every case states there the answer it expects, and the generator writes it only once the library gives that answer. Every input is fixed (keys, salts, nonces, content keys derived from labels), so the files come out the same, byte for byte; CI regenerates them and fails on any difference.
- `core/tests/agreements_new_vectors.rs` reads the files back: every answer is the library's, every rule has a case, every act that passes decodes and encodes again to the same payload bytes (strict both ways), and every act fits its place in its signer's sequence.
- `core/vectors/agreements_new_check.py`, run by `core/vectors/check.py`, judges every case again from encoding-2, sharing no code with the Rust library (only `check.py`'s own CBOR, lock, text, signature and running-summary code, written from the MIRs), rebuilds every sequence, and recomputes both spec hashes from their files.
- To check an act by hand: `cargo run -p agreements-check -- --hex FILE` (see `tools/agreements-check`).

**Test identities only.** Every identity, binding, cMIP, word, envelope, settlement and unit here is a stand-in: the SHA-256 of a label beginning `agreements-new/`. Signing keys are derived from labels. Nothing names a real identity, server or key.

**What they do not test.** The grammar's answers (in force, fork, late, unchecked, the baker's rights) are a later step, with the grammar verifier: the checker passes both tips of a fork. The checker verifies each signature with the key the act carries; that the key is its signer's is the identity chain's to show.

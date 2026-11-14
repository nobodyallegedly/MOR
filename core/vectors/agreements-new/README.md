# Vectors: the new Agreements acts

The acts of Agreements written from scratch (`docs/agreements-from-scratch/draft-24.md`), in the bytes `docs/agreements-from-scratch/encoding-1.md` gives them: a Terms act and a Statement under draft 24's spec hash, types 0 and 1; a report, a proposal, under the spec hash of the report block's third proposal, type 0.

**In plain words.** Each case is one or more complete acts, as bytes, and the answer a checker must give about the last of them: whether it passes, and if not, which rule it fails. Two builders who read the texts alike give the same answers on the same bytes.

## The files

- `valid.json`: acts that pass. Every kind of act and every field combination draft 24's section 3 allows: the first Terms act with its required fields only, and with every optional field; a role of each of the five kinds; Terms with no party named as a signer; a receiver by position and by root; a version; an envelope citing its bake and a transfer; calls from each side; a resolving update, and `resolves` without `continues`; an assent, a counter signature, a contest with and without content, a kind defined by a cMIP, acts made for a signer and for an agreement, answers, relies_on and a settlement, a resolving update in a signer's line; a payment's confirmation, a leg report with every kind of line, a bare report; a private act with its key; acts held together. Some pass with **notes**: what the act leaves unread, or answers by itself (G1.4, G2.2, G5.2, G6.1, G10.4, G12.3).
- `invalid.json`: one case for every check: each rule of the act format the checker applies (Envelopes rules 1, 3, 5, 10, 13), each rule of encoding-1 (E1 to E22), and each case of **invalid** draft 24 says an act shows by itself (G2.1, G3.1, G4.2, G10.1) or among the acts held (G6.1).

Each case has `name`, `tests` (the rule it tests), `acts` (each with its `id`, its complete `bytes` in hex, and its content `key` where it is private) and `answer`: `verdict`, `rule`, `notes` (the rules of the notes, in order) and `says`, the checker's plain words (informative; two builders need not match them). Each file also gives the spec hashes and types.

**Verdicts.** `pass`; `rejected` (draft 24's word: no Agreements act, never reaching the grammar rules; what the core calls invalid as an act); `invalid` (a grammar rule named); `unknown` (a signature scheme not implemented, nothing else failing); `cannot open` (a private act, no key); `not this encoding` (another specification).

## How they are made, and checked

- Generated from the code, never by hand: `cargo run -p mor-core --example gen_vectors` (its part is `core/examples/support/agreements_new.rs`). Every case states there the answer it expects, and the generator writes it only once the library gives that answer. Every input is fixed (keys, salts, nonces, content keys derived from labels), so the files come out the same, byte for byte; CI regenerates them and fails on any difference.
- `core/tests/agreements_new_vectors.rs` reads the files back: every answer is the library's, every rule has a case, and every act that passes decodes and encodes again to the same payload bytes (strict both ways).
- `core/vectors/agreements_new_check.py`, run by `core/vectors/check.py`, judges every case again from encoding-1, sharing no code with the Rust library (only `check.py`'s own CBOR, lock, text and signature code, written from the MIRs), and recomputes both spec hashes from their files.
- To check an act by hand: `cargo run -p agreements-check -- --hex FILE` (see `tools/agreements-check`).

**Test identities only.** Every identity, binding, cMIP, word, envelope, settlement and unit here is a stand-in: the SHA-256 of a label beginning `agreements-new/`. Signing keys are derived from labels. Nothing names a real identity, server or key.

**What they do not test.** The grammar's answers (in force, fork, late, unchecked, the baker's rights) are a later step, with the grammar verifier. The checker verifies each signature with the key the act carries; that the key is its signer's is the identity chain's to show.

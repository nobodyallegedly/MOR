# Vectors: Agreements draft 26, in the bytes of encoding 3 (verifier 3, stage one)

**In plain words.** Each case here is one or more complete acts, as bytes, and the answer a checker of encoding 3 must give about the last of them: it passes, it is rejected (not an Agreements act), it is invalid (a grammar rule of draft 26 named), or it is not this encoding. The answers come from the texts, never from code: no checker of encoding 3 exists yet. Each case quotes the sentence that decides it (`decides`) and says what reading it rests on (`reading`).

**Not final.** Draft 26 (`docs/agreements-from-scratch/draft-26.md`) is not final: the scribe's closing pass will change it, and with it draft 26's spec hash, which every act here carries in its inside. The bytes will then be written again, in one command; the answers stay. Vectors touching the rules that pass changes (5.3.1, 5.5.1, 5.5.4, 5.6.1, 5.8.3, 5.10.7, §3.2) are not written yet: `docs/code/verifier-3-build.md` lists them.

**Test data only.** Every identity, binding, signing key, cMIP, keeper, clock and act id here is a stand-in: the SHA-256 of a label beginning `agreements-26/` (or, in `reference-payloads.json`, the label itself, `test:ana`). Signing keys come from fixed seeds. Nothing names a real identity, server or key.

## The files

- `valid.json`: acts the checker must pass, some with notes (what is left unread, or unchecked).
- `invalid.json`: acts it must not pass: `rejected` with encoding 3's rule, `invalid` with draft 26's rule (every case found in `invalid`, the first in `rule`), `not this encoding` (E2).
- `sets.json`: the set of acts, ids in and value out.
- `reference-payloads.json`: eight examples (X1 to X8) as payload bytes only, before signing and without the act around them, so a stranger's encoder can be compared with this one. X4 cannot be written in encoding 3, and the file says why.
- `retired/retired.json`: verifier 2's checker vectors that draft 26 and encoding 3 retire (the reports, and one passing case), copied whole, each with the rule that retires it. Verifier 2's own files, in `../agreements-new/`, are unchanged.

Each case has `name`, `line` (its line in the codemeister's sheet, `docs/code/impact-draft-26.md`, section 4), `acts` (each with a `label` for people, its `id`, its complete `bytes`, its content `key` where it is private and given, and its `payload`), `answer` (`verdict`, `rule`, `invalid`, `notes`), `decides` and `reading`. Each file's `spec` gives draft 26's spec hash, the Text drafts' spec hashes (`TEXT`), the set's label, and the hashes that are not this encoding.

## Choices taken

Where encoding 3 leaves a byte open (its section 11), the builder takes the codemeister's proposal, and every case resting on one says "taken by the codemeister, to check: encoding 3, section 11, item N". In short: the set's label `MOR/act-set` (1); its members concatenated (2); its rule its own, E26 (3); no field holds a set's value (4); key 8 always a list (5); the keepers sorted, each once (6); a keeper's identifier its identity hash (7); key 9 kept, 32 bytes (8); a words act not held, or held and not opened, gives a note, only when several acts are checked (9); every Text draft's spec hash is `TEXT`, listed (10); a cMIP's declared needs are the grammar verifier's to read (11, so no case 8 here); `SPEC_DRAFT_26` computed from the file, with a test (12).

## Before you copy anything

To write an act of your own you still take, from the texts: the act around the payload (Envelopes, Part three: the outside, the lock, and your act's place in **your own** sequence, `prev`, position, running summary; never copy an act's); your identity and binding (Identity); `tagged_hash` and canonical text (Identity, "Encoding and conventions"); the Text act that carries your words (Text). Use the spec hash given in `spec`, never one recomputed from a copy of your own.

## How they are made

`cargo run -q -p mor-core --example gen_vectors_26 --locked` writes every file here (its part is `core/examples/support/agreements_26.rs`). Every input is fixed, so it writes the same bytes each time. `core/tests/agreements_26_vectors.rs` checks that `SPEC_DRAFT_26` is still the hash of draft-26.md and that the files are what the builder writes; it checks no answer, since no checker exists to give one.

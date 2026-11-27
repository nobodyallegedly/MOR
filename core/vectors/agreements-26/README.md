# Vectors: Agreements draft 26, in the bytes of encoding 3 (verifier 3, stage one)

**In plain words.** Each case here is one or more complete acts, as bytes, and the answer a verifier of draft 26 must give about them. The checker's files (`valid.json`, `invalid.json`) say whether the last act passes, is rejected (not an Agreements act), is invalid (a grammar rule of draft 26 named), or is not this encoding. The grammar file (`grammar.json`) asks a question of the acts held (is this agreement in force, is this update valid, who is bound) and gives the grammar's answer: its word, the rule named, how it is qualified, and who it names. The answers come from the texts, never from code: no verifier of encoding 3 exists yet. Each case quotes the sentences that decide it (`decides`) and says what reading it rests on (`reading`).

**Which draft.** Draft 26 at commit b58e417 on branch `claude/draft-26-outline-vbtvu7` (the scribe's session P7), copied unchanged to `docs/agreements-from-scratch/draft-26.md`. Its spec hash, which every act here carries in its inside, is encoding 3's E2 value, `eb8bfb87…6fcc`; a test checks it against the file. If the file changes again, the bytes are written again in one command; the answers are read again from the new text.

**Test data only.** Every identity, binding, signing key, keeper, cMIP, clock, record signature and act id here is a stand-in: the SHA-256 of a label beginning `agreements-26/` (or, in `reference-payloads.json`, the label itself, `test:ana`). Signing keys come from fixed seeds. A keeper's identifier is the stand-in identity hash of a test keeper; its signed records are tables, their signatures stand-ins. Nothing names a real identity, server or key.

## The files

- `valid.json`: acts the checker must pass, some with notes (what is left unread, or unchecked).
- `invalid.json`: acts it must not pass: `rejected` with encoding 3's rule, `invalid` with draft 26's rule (every case found listed in `invalid`, the first in `rule`), `not this encoding` (E2).
- `sets.json`: the set of acts, ids in and value out.
- `reference-payloads.json`: nine reference payloads (X1 to X8, X2 twice: once in the writer's sorted order, once given unsorted) as payload bytes only, before signing and without the act around them, so a stranger's encoder can be compared with this one. X4 cannot be written in encoding 3, and the file says why.
- `grammar.json`: the grammar verifier's cases (below).
- `retired/retired.json`: verifier 2's checker vectors that draft 26 and encoding 3 retire, copied whole, each with the rule that retires it.
- `retired/grammar-retired.json`: verifier 2's grammar cases that draft 26 retires, copied whole, each with the rule that retires it, quoted. Verifier 2's own files, in `../agreements-new/`, are unchanged.

A checker case has `name`, `line` (its line in the codemeister's sheet, `docs/code/impact-draft-26.md`, section 4, or "session 2: ..." for a case this session added), `acts` (each with a `label` for people, its `id`, its complete `bytes`, its content `key` where it is private and given, and its `payload`), `answer` (`verdict`, `rule`, `invalid`, `notes`), `decides` and `reading`. Each file's `spec` gives draft 26's spec hash, the Text drafts' spec hashes (`TEXT`), the set's label, and the hashes that are not this encoding.

## The grammar file

Each case in `grammar.json` holds:

- `acts`: every act held, complete bytes, in the order written. Each signer's acts in a case are that signer's whole sequence from its first act, so no `prev` names an act the case does not hold (a `prev` is a knot: draft 26, 5.13.1). Every Terms act names its words: a Text act (Text draft 11) its signer writes just before it, held in the case.
- `not_held`: acts named in a field and not held (stand-in ids).
- `layers`: the stand-in tables of the other layers. `keepers`: each keeper the Terms name, its `state` (`live`, or `dead: it shows nothing after position n`), and `records_held`: each signed record of that keeper the verifier holds a copy of, the acts it places at positions counting from 1. An empty `records_held` means none of that keeper's records is held (unchecked, the lead's P7 answer 1); a record held that does not place an act means the keeper does not show it (not shown). Also `clocks`, `money`, `envelope_chain`.
- `reader`: the reader's own anchoring (an order it accepts, never the Terms' answer) and on whose behalf it reads.
- `question`: `ask` and `args`; the file's `asks` lists each question.
- `stubs_asked`: what each stub cMIP (K1 to K9) was asked, and what it answered. The stubs answer from their own parameters, as tables; the file's `stubs` gives each one's parameters. **Stubs, for tests only.**
- `answer`: the expected answer: `word` (draft 26's answer words), `rule` (draft 26's number), `qualifier` (as shown, per keeper, per clock, per anchoring, none), `keepers_counted` and `keepers_not_showing` (per keeper, by K9's answer), `who`, `disputed`, and the `reason` in words. `also`: further answers to the same question (an update `valid`, then not shown as in force).
- `part` and `status`: where the case comes from (verifier 2's case by the sheet's sections 4.1 to 4.3, `verifier_2_case` its position; the sheet's section 4.4, `sheet_line`; or this session's own parts: the evening vectors, the lead's five, K9, the author's first act), and whether it is `rewritten` (verifier 2's answer kept), `changed` (verifier 2's answer changed) or `new`. `against_sheet` says where the answer differs from the sheet's prediction, and why the text wins.
- `waiting`: cases not written, with why: the 15 G14 cases (the sheet's question 11), and every case whose answer no text, ledger entry or lead's note settles (a question, in `docs/code/verifier-3-build.md`).

## Choices taken

Where encoding 3 leaves a byte open (its section 11), the builder takes the codemeister's proposal, and every case resting on one says "taken by the codemeister, to check: encoding 3, section 11, item N". In short: the set's label `MOR/act-set` (1); its members concatenated, the empty set the label over no bytes (2); its rule its own, E26 (3); no field holds a set's value (4); key 8 always a list `[+ hash]` (5), sorted, each keeper once, empty E18's fault (6); a keeper's identifier its identity hash, stand-ins here (7); key 9 kept, 32 bytes (8); a words act not held, or held and not opened, gives a note naming 5.2.2 and the act lacking (9); `TEXT` the MIR files of Text drafts 6 to 11 (10); a cMIP's declared needs the grammar verifier's to read, so no case 8 in the checker's files (11); `SPEC_DRAFT_26` computed from the file, with a test (12); the checker applies Text's own rules to the act `body` names (13); a first act names an earlier agreement in `relies_on`, by its tip's act id (14); the keepers' cMIP (K9) under key 20, a socket, written only beside key 8 and never on a resolving update, its `cmip` not a fingerprint invalid under 5.2.1 (15).

## Before you copy anything

To write an act of your own you still take, from the texts: the act around the payload (Envelopes, Part three: the outside, the lock, and your act's place in **your own** sequence, `prev`, position, running summary; never copy an act's); your identity and binding (Identity); `tagged_hash` and canonical text (Identity, "Encoding and conventions"); the Text act that carries your words (Text). Use the spec hash given in `spec`, never one recomputed from a copy of your own.

## How they are made

`cargo run -q -p mor-core --example gen_vectors_26 --locked` writes every file here (an optional argument writes them under another directory instead). Its parts: `core/examples/support/agreements_26.rs` (the acts, the checker's files), `agreements_26_grammar.rs` (the grammar file's format: a scenario with its own sequences, keepers' records, stubs, the answer's shape) and its four parts, `agreements_26_grammar_v2.rs` (verifier 2's cases), `agreements_26_grammar_sheet_a.rs` and `_sheet_b.rs` (the sheet's section 4.4), `agreements_26_grammar_evening.rs` (the evening vectors, the lead's five, K9, the author's first act). Every input is fixed, so it writes the same bytes each time. `core/tests/agreements_26_vectors.rs` checks that `SPEC_DRAFT_26` is still the hash of draft-26.md and that the files are what the builder writes; it checks no answer, since no verifier exists to give one.

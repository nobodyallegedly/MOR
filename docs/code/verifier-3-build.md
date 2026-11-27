# Verifier 3: the build log

*Started 27 November 2026 by a session under the codemeister of MOR (Machine, allegedly, narrow hat). A record of work, not a decision: every choice below is the codemeister's proposal or a reading, to check.*

## The wish, quoted

From `docs/decisions.md`, "Current wish": "We need to change the current wish to updating the core after the findings" (Nobody, allegedly, 26 November 2026, 16:46). On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications." And (27 November, 14:53): "We finish this rewrite of agreements, then we turn our attention to money, and after that we’ll tackle development."

## Stage one, session 1: the builder and the checker's vectors

**In plain words.** Verifier 3 will implement Agreements draft 26 in the bytes of encoding 3, beside verifier 2. Its vectors come first, written from the texts. This session built the tool that writes acts in encoding 3's bytes, and with it the checker's vectors: one act's bytes (or a few acts held together), and whether it passes, is rejected, is invalid, or is not this encoding. No verifier code was written; nothing was decided.

**What was built** (new files only):

- `core/examples/support/agreements_26.rs`: the builder. It writes Terms acts, Statements, Text acts and a payment, each an everyday act in its signer's real sequence, sealed and signed by the core's own functions, with test keys from fixed seeds. Payloads are deterministic CBOR maps of encoding 3's keys; the builder writes any payload, so a vector can hold a fault on purpose. `SPEC_DRAFT_26` is one constant.
- `core/examples/gen_vectors_26.rs`: one command writes every file under `core/vectors/agreements-26/`: `cargo run -q -p mor-core --example gen_vectors_26 --locked`. It first checks `SPEC_DRAFT_26` against draft-26.md, and stops, saying what to do, if the file has changed.
- `core/tests/agreements_26_vectors.rs`: four tests: `SPEC_DRAFT_26` is `Spec::mir_file_hash` of draft-26.md; the Text drafts hash apart; the set recipe holds; the files on disk are what the builder writes.
- `core/vectors/agreements-26/`: `valid.json`, `invalid.json`, `sets.json`, `reference-payloads.json`, `retired/retired.json`, `README.md`.
- `docs/agreements-from-scratch/draft-26.md`: copied unchanged from branch `claude/draft-26-outline-vbtvu7`, commit 1f81c2a, so that the test can hash it. Its spec hash is encoding 3's, `04bae25c…29904`.

**Checked by this session.** `cargo test -p mor-core --locked`: 35 runs, 574 passed (verifier 2's 570 and these 4), 0 failed, 1 ignored. Regenerating verifier 2's vectors (`gen_vectors`, then `git diff --exit-code core/vectors/agreements-new`): nothing moved. `gen_vectors_26` run twice: the same bytes.

## The byte choices taken

Each is the codemeister's proposal (`docs/code/impact-draft-26.md`, section 5), written in the builder beside the choice and in every vector resting on it as "taken by the codemeister, to check: encoding 3, section 11, item N". Encoding 3 is not edited: the takings go into its "Open" after the scribe's closing pass, by another session.

1. The set's label: `MOR/act-set`.
2. Its members: the sorted ids concatenated, 32 bytes after 32 bytes; the empty set is the label over no bytes.
3. Its rule: its own E-rule, E26.
4. No field of Terms or a Statement holds a set's value (the lead's note, row C36: "No grammar field holds a set's value for now").
5. Key 8: always a list, `[+ hash]` (the lead's note, row C8, C35, C34).
6. The keeper list: sorted, each keeper once (the same row).
7. A keeper's identifier: its identity hash (stand-ins here).
8. Key 9: kept, 32 bytes (the same row).
9. A words act not held, or held and not opened: a note, only when several acts are checked (the lead's note, row C16).
10. Every Text draft's spec hash is `TEXT`, listed (the lead's note, row C33). The list: Text drafts 6 to 11, from `spec/MIR-text-draft-6.md` to `-11.md`, each hashed as a MIR.
11. A cMIP's declared needs: the grammar verifier's to read (the lead's note, row C21, C22). So the checker gives no case 8, and no vector of it is written.
12. `SPEC_DRAFT_26`: computed from the file, with a test.

## The checker's vectors: the count

Against the sheet's section 4 (its lines for the checker):

| | Count | Which |
|---|---|---|
| Written, new | **28** | lines 80, 81, 82 (4, in `sets.json`), 83, 85 (7), 86 (2), 87, 88, 89, 90, 91, 92, 93, 94 (2), 95, 96, 97 |
| Rewritten in encoding 3 | **1** | I 8: type 1 under the report block's spec hash, now **not this encoding**, E2 |
| Retired, copied | **13** | V 34, 35, 36; I 103 to 111 (the reports, by E2); V 7 as a passing case (by 5.3.1, its retirement waiting, below) |
| Waiting | **5** | below |

In `valid.json` 8 cases, in `invalid.json` 17. Eight reference payloads are written (X1, X2, X3, X5, X6 twice, X7, X8); X4 is left out.

## Waiting: not written now

These touch rules the scribe's closing pass (pull request 292) changes. Each waits for draft 26 final.

1. **V 1** (every optional field; an author at position 2 naming a role): **invalid**, 5.3.1, on the sheet's reading. 5.3.1.
2. **V 7** (an author named by role): **invalid**, 5.3.1; its passing copy is in `retired/`. 5.3.1.
3. **V 12** (a second version by a signer `authors` leaves out): **invalid** or **pass**, 5.3.1 (question 1 below).
4. **V 43** (its third act, the same): 5.3.1.
5. **Line 84** (an author naming a role, `in_force` present): **invalid**, 5.3.1.

No vector of the checker's list rests on 5.5.1, 5.5.4, 5.6.1, 5.8.3, 5.10.7 or §3.2 alone; questions 4 and 5 below name the two that lean on 5.5.1 and 5.8.3.

## Questions

Each reading is a question, never a rule.

**Those that change an answer (5):**

1. **The signer among the authors (5.3.1).** The ledger's arrived-at line of 16:50 ("a Terms act whose `authors` leaves its signer out is invalid") and draft 26's 5.3.1 say invalid; the lead's note, row C1, reads "The signer is the first author whether or not listed; `authors` names the others; no Terms are invalid for leaving the signer out". V 12 and V 43 turn on it: waiting.
2. **An empty keeper list: E18 or E6.** Written **rejected, E18**, from "One fault, one rule": "E18 for a list's emptiness, order and repeats"; the sheet's line 85 gives "E18 (or E6)", since the same sentence names "E6 for a keeper and a clock (key 8's form …)". The rule named changes.
3. **The rule a words note names.** Lines 91 and 95 pass with a note named **5.2.2** (the rule whose test the words act would need, as E23's note is named 5.7.1). The note itself rests on the lead's note, row C16, and item 9; its rule's name is a choice no text makes (listed again below).
4. **An update's `in_force` (line 87).** Written **pass**, note 5.2.3, as encoding 3's list of notes gives it. Draft 26's 5.4.2 also points to 5.5.1, which the closing pass changes; if 5.5.1 comes to read an update's `in_force`, the note changes.
5. **The keeper list's order (line 85, 4 and 5 of 7).** Choice 6 rests on draft 26 giving keepers no order (5.8.3 reads where they agree). 5.8.3 is among the rules the closing pass changes (the ledger's "A dead keeper"); if it gives keepers an order, **rejected, E18** for two keepers out of order changes.

**Those that change no answer of a vector written:**

6. **Which files make the `TEXT` list.** Taken: Text drafts 6 to 11, the MIR files in `spec/`. Not in it: drafts before 6, and the files `MIP-text-draft-6.md` and `MIP-text-draft-7.md`. An act under one of those would change answer (pass or invalid, 5.2.2); no vector holds one.
7. **The sets before encoding 3 carries them.** The lead's note, row C36: "The label, the joining and the empty set are encoding 3's, fixed by the codemeister's proposal and written in encoding 3 before any vector". `sets.json` is written now, as the prompt asks, before encoding 3 is.
8. **X1's one socket.** Written as the body's socket (`[words, [cmip, null]]`): E8 asks every body for a socket, and X1 gives one. Read as `in_force` (key 6), as the cMIP's name `test:cmip-in-force` suggests, X1 cannot be written. The stranger read it the same way, and said so.
9. **X5 and X6: what the examples do not give.** X5's `agreement` is taken as `test:terms-v1` (X1 being the root) and its `previous` as `[test:terms-v1]`; X6's signer is not given, so it is written twice (the author's assent, `previous` naming the Terms; a party's first act, `previous []`).
10. **X2's order.** `test:keeper-2` sorts before `test:keeper-1`, so the writer's order is the sorted order: X2 cannot tell a sorted list from the writer's order. Lines 85 (3 and 4 of 7) do.
11. **An invalid Text act in `body`** (Fable 5.1's fifth attack, 1.10: "one carrying `acks`"): whether it is a Text act for 5.2.2. Encoding 3's E25 reads type and payload only; the lead's note, row F11, reads "a Text act invalid under its own layer is no Text act for 5.2.2". No vector written.

## Vectors needing a choice no text, ledger entry or lead's row makes

- Lines 91 and 95: the **rule named on the note** (5.2.2). The verdict and the note's presence are made (the lead's row C16, item 9); the rule's name is the codemeister's. Written; the name is the one part to strike if it is not taken.

No other vector was written on a choice of this session's own.

## A stranger's reading

One subagent, limited to `encoding-3.md` alone, was given X1, X2 and X7 in words and asked to write their bytes and say where it could not tell.

- **X1**: its bytes under key 8 reading (i) are this builder's, byte for byte (`a502…1380`); under reading (ii) the same less one byte (`81`). It could not choose between them (item 5).
- **X2**: its bytes are this builder's, byte for byte; it saw that the example cannot tell the sorting question, the keepers happening to be in order (item 6; question 10).
- **X7**: it could not compute either value: "No text gives its string" (item 1); it gave both joinings (item 2).
- It guessed the one socket of X1 to be the body's, as this builder does (question 8), and wrote `null` for no parameters and `previous []`, as here.

No byte of its differs from this builder's where encoding 3 chooses; it differs only where encoding 3 leaves the choice open, and says so.

## Next

The grammar vectors, in a later session, with this builder. When the closing pass lands: set `SPEC_DRAFT_26`, write the vectors again, and write the waiting five.

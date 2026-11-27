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

## Next (session 1's)

The grammar vectors, in a later session, with this builder. When the closing pass lands: set `SPEC_DRAFT_26`, write the vectors again, and write the waiting five. *(Done in session 2, below.)*

## Stage one, session 2: draft 26 final, the waiting five, the grammar vectors

*27 to 28 November 2026, by a session under the codemeister (Machine, allegedly, narrow hat), overnight, unattended. A record of work, not a decision. The wish, quoted from `docs/decisions.md`, "Current wish": "We need to change the current wish to updating the core after the findings" (Nobody, allegedly, 26 November 2026, 16:46). Every reading below is a ledger entry or a lead's row, named; every byte choice is the codemeister's taking, to check.*

**In plain words.** Draft 26 is now the scribe's final text (P7, commit b58e417). This session copied it in, wrote every checker vector again under its hash, wrote the five that waited, and wrote the grammar vectors: about two hundred small stories of acts, each with the question a verifier is asked about them and the answer draft 26 gives. No verifier code was written. Where no text, ledger entry or lead's note settles an answer, no vector was written: it is a question below.

Marks: [traced] read from a file or a command's output; [counted] counted by script; [inferred] a reading.

### What was done, part by part

1. **The refresh** [traced]. `draft-26.md` copied from b58e417: plain sha256 `afadb7d5…4307`, spec hash `eb8bfb87…6fcc`, both as encoding 3's E2 gives them. `gen_vectors_26` run again: only bytes, act ids and the spec hash moved; every checker answer is the same (compared by script).
2. **The checker's vectors** [counted]: 14 new (4 passing, 10 not): V 1, V 7, V 12, V 43, line 84; the signer named by no party; F11's Text act carrying `acks`; key 20 (five: its pass, E19 twice, 5.2.1, E7); a first act naming an earlier agreement's tip (its pass, and E19 for `agreement` on a first act); one reference payload with the writer's order unsorted. V 7's retirement confirmed. Encoding 3's quotations brought to its text at b58e417 (texts only; no answer moved).
3. **The grammar format** (`grammar.json`, `retired/grammar-retired.json`; README). The builder gains `agreements_26_grammar.rs`: a scenario whose signers' sequences start in the case (no `prev` names an act not held); every Terms act names a Text act held; keepers as signed-record tables (state live or dead, records held or none); stubs K1 to K9 with their parameter tables (K5's names signers, not acts, so a version can name its fillings' signers before they assent); answers with word, rule, qualifier, keepers counted and not showing, who, disputed; `also` for second answers. `gen_vectors_26` takes an optional output directory.
4. **The grammar vectors**, written by four parts of the builder (three by forks of this session, each in its own worktree, merged file by file) [counted]:

| Part | Written | Of which rewritten (answer kept) | Changed | New | Retired | Waiting |
|---|---|---|---|---|---|---|
| (a) verifier 2's 120 cases (sheet 4.1 to 4.3) | 89 | 63 | 26 | 0 | 13 | 3 (and the 15 of (g)) |
| (b) sheet 4.4, lines 1 to 45 | 49 | | | 49 | | 3 lines |
| (b) sheet 4.4, lines 46 to 79 | 34 | | | 34 | | 3 (lines 58 to 60, 61's second half, 64) |
| (c) the evening vectors | 6 | | | 6 | | |
| (d) the lead's five, and his P7 pair | 11 | | | 11 | | |
| (e) K9 lifting the default | 2 | | | 2 | | |
| (f) the Terms act as its signer's assent | 2 | | | 2 | | |
| (g) the 15 G14 cases | 0 | | | | | 15 |
| **Total** | **193** | 63 | 26 | 104 | 13 | 24 entries |

Retired (13): the eleven leg cases 78, 80 to 86, 92 to 94 (§4.3: the report is the MICS's; the lead's row F21, C40); 64 (5.5.3; the lead's row C9); 58 (5.6.6(a); the sheet's 4.3). Changed (26): verifier 2's cases 1, 2, 5, 10, 12, 14, 22, 26, 29, 35, 36, 37, 43, 44, 46, 49, 50, 52, 53, 55, 56, 63, 65, 67, 68, 91. Waiting: G 99 to 113 (G14, the sheet's question 11), G 89, 90, 98 (data asked of a report, which has no bytes until the MICS's block), lines 9, 32, 36 (no Identity table for a key change or a witness act, no `pieces`), lines 58 to 60, 61's second half, 64 (questions below).

5. **The checks** [traced]. `cargo test -p mor-core --locked`: 35 runs, 574 passed (verifier 2's 570 and verifier 3's 4), 0 failed, 1 ignored. `gen_vectors_26` run twice: the same bytes. `gen_vectors`, then `git diff --exit-code core/vectors/agreements-new`: clean. Every quotation in `decides` (and the retired files' `says`), by script: 621 parts, of which 537 of draft 26 at b58e417, 82 of encoding 3 at b58e417, 2 of Text draft 11, all found word for word. A scan of every file written for `/Users/`, onion and web addresses, hosts, ports and private keys: nothing; the only people named are the texts' own story names (Ana, Gil) and test identities; every key and identifier is a labelled stand-in.

### Changed against the sheet's prediction

- V 12, V 43 (sheet 4.2: invalid if the signer must be in `authors`): **pass**, 5.3.1 "No Terms are invalid for leaving their signer out of `authors`".
- Line 12 (sheet: invalid): **in force**; and a second case, the signer who is no party, **invalid**, 5.3.1.
- Line 17 (sheet: two readings): **not shown**, per keeper, the silent keeper named (5.8.3's default).
- Line 31 (sheet: late): **fork**: a knot to v2's words shows v3 after the words, never after v2 (5.13.3).
- Line 65 (sheet: two readings): **changed**, 5.10.7 "whether or not it is counted for the later version".
- Line 71: an assent cannot carry `resolves` (§4.3): written as C's resolve, **not shown**, nothing to resolve.
- G 22 (4.2): shown → **valid**, also in force (the lead's row C7).
- G 37 (renamed only, not shown): **fork**, 5.4.5.
- G 43, G 44 (renamed only, shown): **fork** and **not shown**: the Terms giving the power to resolve are not pinned (5.6.1(b) asks Terms in force when the act was made).
- G 63 (renamed only, unchecked): **not shown**: a keeper whose two records contradict "counts as one not showing the act" (5.8.3; the lead's P6 line 4).
- G 9, G 70: word kept, the reason now the missing pin.

### Vectors resting on each taking [counted]

- Item 4 (no field holds a set's value): checker line 83.
- Items 5, 6, 7 (key 8 a sorted list; a keeper's identifier its identity hash): 52, 49, 48 vectors: checker lines 85, 86 (1 of 2), V 1, item 14's two, item 15 (1 of 5); every grammar case naming a keeper (G 60, 61, 62, 63, 65; lines 5, 16, 17, 37, 43, 49, 50, 52 to 57, 66 to 68, 70, 78; the evening, the lead's five, K9).
- Item 8 (key 9): checker 86 (2 of 2), V 1; grammar lines 66, 67, 68.
- Item 9 (the words note): checker 91, 95.
- Item 10 (`TEXT`): checker 97.
- Item 13 (Text's own rules applied): checker F11.
- Item 14 (`relies_on`, the tip): checker item 14's two; grammar, the lead's five 2a, 2b.
- Item 15 (key 20): checker item 15's five; grammar K9's two and the cases resting on an empty K9 socket (lines 17, 43, 50, 54, 55; the three keepers one silent; the P7 pair).
- Items 1, 2, 3 (the set's bytes): `sets.json`, X7. Items 11, 12: no vector (11 gives no case 8; 12 is the test).

### Where the texts differ from the prompt's summary

- Item 9 as the prompt states it ("gives a note naming 5.2.2 and the act lacking") drops session 1's "only when several acts are checked". The vectors keep session 1's reading (encoding 3, section 7: "A checker handed several acts reads them as the acts a verifier holds"): one act handed alone gets no E23 or E25 note. Question 2.
- Encoding 3's E17 says a resolving update's `previous` names the shared act; draft 26's 5.7.1 asks for the signer's own previous act within the agreement. Question 1.
- His words "(Which needs to be in the header)" place K9's socket in the header (Development's, the MICS's form); item 15 puts it in the Terms payload, key 20. Question 14.

### Questions, one batch, those that change an answer first

1. **A resolving update's `previous`** (E17 against 5.7.1). Draft 26: the signer's last act in the agreement; E17: the shared act, which forks the signer's own line once she has acted after it. Grammar cases G 22, 27 and line 75 follow 5.7.1; the checker's V 43 follows E17 (pass either way). *Lean:* draft 26; E17 to be corrected, V 43's bytes then written again.
2. **One act handed alone: the E23 and E25 notes.** Kept as session 1 had it (none); item 9's wording here would add a 5.2.2 note to every single-act Terms vector (about fifteen answers). *Lean:* keep, several acts only.
3. **An update not shown at the keeper: is the condition asked?** Evening 2 answers **not shown**, 5.5.1(a), and does not ask K4; 5.5.7(c) asks the cMIP "on the assents the keepers show". *Lean:* not asked: "an update not shown so is no update of that version".
4. **A resolving update's pin** (line 75): the tips it resolves read as no rivals of it under 5.5.1(b). *Lean:* as written; a sentence in 5.12.4.
5. **Line 61, second half**: v2 names no role at that position; no K5 to ask. *Lean:* not shown.
6. **Line 64**: a power for a filling's holder from her own K7 grant, K3 reading it, `under` while v1 is replaced. *Lean:* shown, G acting under v1 before v2 passes its gate.
7. **Lines 58 to 60**: a cMIP's declared needs, "in the form Development fixes". *Lean:* wait for Development, or a stand-in "declared needs" table.
8. **G 89, 90, 98**: data asked of a report: wait for the MICS (as now) or retire with the leg cases. *Lean:* wait.
9. **Lines 9, 32, 36**: Identity tables (a key change, a witness act) and `pieces` for the format. *Lean:* add them with Identity's stand-ins in a later session.
10. **The word for Terms that pass when asked `act`** (lines 7, 8): "shown". *Lean:* keep.
11. **The rule named on a keeper's "not shown"**: 5.8.3, and 5.5.1(a) for an update. *Lean:* keep.
12. **G 4's substitute acts** (A's note for A's second assent): *lean* yes. **G 58** retired rather than changed: *lean* retire.
13. **Line 55's rule** (disagreement and contradiction both): 5.8.3, both reasons given. **Line 53**: no word for the reader's relay. **Lines 78, 79**: the reader's answers beside the Terms'. *Lean:* as written.
14. **K9's socket "in the header"** (his 00:00) against key 20 in the payload (item 15). *Lean:* key 20 now; it moves when the header's form is the MICS's.
15. **The format: a position for questions about a spot** (`fillings` carries it in `limits`). *Lean:* a slot of its own in `question`.
16. **`TEXT`'s files** (carried from session 1, question 6). *Lean:* unchanged.

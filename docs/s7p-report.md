**Ready to merge.** CI: see "Checks" below.

# S7p report: the contradictions S7o found

Branch `claude/s7p-contradictions`, from main at `0212b9e`. Not to be merged by me. No finding of my own; F432 unused.

## In plain words

Agreements draft 22 settles S7o's three contradictions as the MOR lead decided. It also fixes four wording slips where one side was plainly a slip. Rule 99's pointer and the suite's pointer to rule 67 count as one of the four. The default control cMIP (draft 5), the suite (v35) and the MICS (v35) follow, mostly by naming the new drafts. No code changed, and the vectors are byte for byte the same.

The rest of S7o's item 4 is written up for Fable in `docs/s7p-for-fable.md`, with five more of the same kind found on the way. One of those matters more than the others: rule 48 now reads as rule 10 does, but the core's `bought_under` still reads the version the transfer names. They agree except where a seller names a stale version. No vector covers that case. It is item 6 on the Fable page, with a lean that keeps the core as it is.

## 1. The three settled points, as written (Agreements draft 22)

1. **Which version binds a buyer of a stake** (rule 48, line 1450): "**A buyer is bound by the rules it bought under.** It bought under the rules binding the stake's holders in the version in force when the collective's line placed its transfer (rule 10), never the version its transfer names in its field 0, which may be a stale one. A change to the rules binding a stake's holders, made after a transfer of that stake was signed by its seller and before the line placed it, binds the buyer only with the buyer's signature."
   - The second sentence is unchanged.
   - The prompt's summary said "placed after"; I kept "made", the words of F421 (11) and of suite step 3.7at (Fable page, item 7).
   - Rule 98.2's "by buying under it" now reads the same way, and needed no edit.
   - The default cMIP's rule 94 already read rule 10's way.
2. **What ends a grant** (rule 79, line 1120, and the grant format, line 2986): both lists now include "a change of control model (for a grant within an area, rule 74)". The tie rule's own list does not include it (Fable page, item 9).
3. **A payment naming the fork** (the fork's freeze-scenario line, line 3697): "one naming the fork is pending until a successor's chain records it" becomes "one reaching a publication of the original after the fork is owed back to the payer as a refund", as rule 91's "Money after it" says.
   - Archaeology: drafts 14 to 16 said "unrecorded until a successor's chain records it", and draft 17 changed it to "pending". No rule ever said it.
   - The suite's step 3.9 already follows rule 91 (a payment after the fork naming the old tag is owed back; one to a successor's publication is a purchase). It needed no change.

## 2. The older inconsistencies: fixed where one side was a plain slip

- **"Refused" where rule 99 says "overreaching".** Rule 99 defines two verdicts: refused is a verdict on an act, overreaching a verdict on a model's answer. Both places were speaking of a model's answer, so the word was a slip.
  - The cMIP's handover now reads: "An answer of it that did would be overreaching for every verifier, and set aside (Agreements rule 99)."
  - Suite step 3.7ar now reads: "the model's answer overreaching and set aside". The clone stays invalid in every client, and the verdict is unchanged.
  - The cMIP's other uses of "refused" (lines 28, 74) are verdicts on acts, and stay.
- **Rule 67's pointer.** Since F422, rule 67 (the judicial tier) is the core's. "How to read" already left 67 out of the cMIP's numbers, and section 23 keeps no rule 67.
  - Rule 99 said the cMIP carries "its rules 62 to 64, 66 to 68". It now says "62 to 64, 66 and 68; the judicial tier is this MIR's rule 67".
  - The suite's line 355 had the same slip and is aligned too.
  - The cMIP's handover notes that rule 67 has returned to the core and that its own rule 67 is a pointer to it.
- **"Rotate" in rules 70, 83 and 89.** Each sentence now says, in rule 69's own words, that the clone is put in force "by a record, or by a rotation declaring it where the clone changes the key grammar or removes a party who holds the chain key or a share of it".
  - This is plain because rule 69 is the rule each of them cites, and the core already reads it so: `needs_rotation` in `core/src/agreements/view.rs` applies rule 69 to every clone a record carries, a succession's included.
  - Rule 83's re-dealing of the chain key and rule 89's recovery path stay, attached to the rotation case.
- **Headers.** The cMIP's "Written against the Agreements MIR draft 21" now names draft 22. The suite's "mapped by MICS v34" now says v35.

## 3. The write-up for Fable (`docs/s7p-for-fable.md`)

Each item has both readings quoted, the options, a lean and the cost, and says what the core does today.

1. **Rule 98.3: the judicial tier inside the constitution or beside it.** Lean: inside, under its own stricter rule, and field 2's judicial tasks added to the list. This matches the core.
2. **Issuance's parameter 32 inside field 35.** Lean: rule 98.3 names an issuance's offer as the one thing a version states for itself. This matches the core and F423.
3. **The absence authority's three lists.** Lean: one list, the format comment's. This matches the core.
4. **A closing's "other than its own stake in itself".** Lean: reword it as the stake whose target is the collective. No verdict moves.
5. **Leftovers "to the first as listed".** Lean: scope rule 9's "the order decides nothing" to make room for that exception. This matches the core's `divide_first`.
6. **Found while working: rule 48 corrected, but the core's `bought_under` still reads the version the transfer names.** Lean: read "made after the seller signed" as "put in force after the version the transfer names", so the core and the vectors stand.
7. **Found while working: "made" or "placed"** in rule 48's window sentence. Lean: "made".
8. **Found while working: rule 69's own "the members rotate".** Lean: add a condition.
9. **Found while working: the tie rule's list beside rule 79's.** Lean: rule 74's line timing, without the tie rule.
10. **Found while working: "Collectives in the identity chain"** says a rotation declares "each" constitutional clone. The suite's checklist line 150 reads the same way. Lean: a clause.
11. **The suite's pointer to the cMIP's rule numbers.** Fixed, and listed so it is seen.

## The meaning diff

A subagent read draft 21 against draft 22, the cMIP draft 4 against 5, the suite v34 against v35 and the MICS v34 against v35, every change in its rule.

- **Nothing changed beyond points 1 and 2, the draft numbers and the headers.** Each of the seven intended changes is done as intended.
- It found two stale headers, both now fixed: the cMIP's "draft 21" and the suite's "MICS v34".
- It found one wording point: the new grant-list item sat between commas, so it could be read as two items. It is now in brackets.
- It found older leftovers that the changes make easier to see. These are Fable page items 8, 9 and 10, and item 11, which is fixed.
- It found no new contradiction beyond item 9.

## Vectors

No verdict moved by decision in the published vectors.
- Point 1.1's stale-version case is covered by no vector, and the core is unchanged (Fable page, item 6).
- Points 1.2 and 1.3 move nothing the core computes: rule 74 and rule 91 were already built.

The vectors were regenerated byte for byte; the results are under "Checks".

## Hashes, for the Dubsar Suite

Computed as `docs/s7l-report.md` shows: `tagged_hash("MOR/spec", {0: kind, 9: text})`, one final line break removed. The same code reproduces the v34 pins.

- `MICS_HASH = '66d734f8232b3135e4d4c69b145eaf764a699a1906b9f2105a92c4f3c1a65cfa'` (v35)
- `SUITE_HASH = '11b6fd77c35b6dfb5e63e9a9b67bc4f66319c0f6ac662d22a232890bb88c0ada'` (v35)
- Agreements draft 22's spec hash: `eac2e2f99cd342462a9b07b3ca6a2fb934cff525f7f51e47077ea46ac6f53e93`.
- **The reader's draft line:** `clients/reader/src/mirs.ts`, line 26, `{ layer: 'Agreements', file: 'MIR-agreements-draft-22.md' }`. Until it changes, the reader's test "the texts shipped are the newest draft of each MIR" fails. Ummia's pin test also fails until the two pins above are written. `clients/` is untouched.

## Checks

- `cargo test --workspace --locked`: 800 passed, 0 failed, 95 suites.
- Vectors regenerated (`cargo run -p mor-core --example gen_vectors`): `git diff --exit-code core/vectors` clean, byte for byte.
- `python3 core/vectors/check.py` (with `unicodedata2==17.0.0`, as CI pins it): all 291 agree, 113 verdict vectors judged.
- `scripts/c-box/make-c-box.sh`, run into a scratch folder: it refused nothing and assembled 8 texts (Agreements 22, MICS v35, suite v35), 1 cMIP (draft 5) and 12 vector files.
- No release rebuild: nothing under `core/` or `wasm/` changed.
- CI on the pull request's head: see the first line.

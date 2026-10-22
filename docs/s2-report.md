# S2: the core aligned, and the vectors: report

*For Nobody, allegedly, and the MOR lead. Written by S2 (prompt: `docs/lead/prompts/s2-core-and-vectors.md`), branch `claude/s2-core-and-vectors-p14sdz`. Progress file: `docs/s2-progress.md`.*

## In plain words

**What a C verifier can now check itself against.** The folder `core/vectors/` is its answer key. Before this session it covered how acts are built (encoding, hashes, text, locking, running summaries, opening an act). Now it also covers:

- **Signatures.** Both kinds of key MOR uses: the everyday Schnorr key (as Bitcoin uses) and the post-quantum chain key (SLH-DSA, both sizes). Keys made from fixed test seeds, the bytes signed, good signatures, and signatures that must fail, each with its one reason.
- **Verdicts, in every layer.** 63 cases. Each is a set of complete acts (every byte), what else the verifier knows, a question, and the answer the texts give, with the rule that decides it. For example: a rotation counting, pending, or contested; a disowned act void, or disputed because someone relied on it; a home caught receipting two rotations; a text act with the wrong pointers; a payment that pays nothing because it names the wrong thing; a revoked app's last acts void or disputed; a deadline met, missed or undetermined; a specification that is no specification; a MIR's hash computed from its file.

Every value is produced by the Rust library and read back from the published bytes. The signatures, and 25 of the 63 verdict cases, are also judged by a second program in Python, written from the texts and the standards, sharing no code with the library. CI now regenerates the vectors and checks they come out byte for byte the same, and runs the Python check.

**What no vector covers, and why.** The Python program does not judge the 38 verdict cases that need the identity-chain procedure or Agreements' and Money's judgments: building a second version of those is exactly the C verifier's job. No vector yet covers a collective's fork or closing, succession plans, issuance and the owners' matters (their acts are long chains of post-quantum signatures, megabytes each; the library's own tests run them), a private act's verdict, a rail's own proof (a rail Module's, outside the core), or an anchor's proof (the anchoring cMIP's: the vectors state an anchor as a checked fact). The MIR hashes in the vectors are stand-ins until the freeze; at the freeze every act id changes and no verdict does.

**The texts.** The last decisions (F370, F371) are written in. A stranger's reading found 22 points; the wording ones are fixed, one of them my own slip on a missed deadline. Four need a decision or confirmation (below).

**The core.** It now does what the texts say where it had fallen behind: it reads keepers' records itself (before, a program had to tell it what each keeper recorded), decides which agreement an act "belongs to" and which keepers count, judges deadlines, shows a revoked app's acts as disputed where someone relied on them, accepts a member key's text, tells a payment cMIP from its own bytes, and computes a MIR's hash from its file. One more divergence the tracing found was fixed: the core refused to ask the checker of a cMIP that did not declare itself one, where Development says that declaration is for finding checkers only.

**The suite.** Every step and component of suite v30 is now traced to the tests that run it, in `docs/freeze-ready-suite-notes.md`: 223 run, 57 partly, 15 by no test (each with why).

## Precisely

### Part 0: the last text edits

- **F370** (Money 11): "What a payment fulfils", after the receipt's format: field 5 (and a claim's field 4) names the act a payment follows; Money judges it only where a rule of Money or Agreements gives a payment following that act a meaning (obligation, agreement or offer, payee pointer, stake transfer, a payment repaid or refunded, a take-up, a split, for instance); naming any other act, the payment fulfils nothing in Money's sense and its field 5 changes no verdict of Money's. The CDDL comments and the payment task say "the act it follows". Development's task table, the MICS's glossary ("Fulfils") and a suite component follow.
- **F371** (Agreements 17 unless said):
  1. Rule 33 rewritten in four paragraphs: an anchor of the act shows a deadline met; a keeper's anchored record shows the records before it existed by its point, so a record of the act before it shows the act in time; missed only by a keeper's sequence anchored past the point holding no record of the act; with several keepers the agreement's rule counts them both ways; an anchor of the act wins.
  2. "Belongs to": the keepers of the version in force (a deal: the latest complete version on the named version's line its history holds, what its `prev` and `objects` name followed back; a collective: the agreement in force at the act); every action and decision of a collective belongs to its agreement, grant keys' and member keys' included; genesis, rotations and Identity everyday acts belong to none. Rule 42 and the keeper record's checks say "the version, in force for the act, of an agreement the act belongs to".
  3. Rules 60 and 72: a member key's act, the agreement rule 72 picks from the decisions its history holds, from the version that named the key; rule 72 has a bullet of its own for it.
  4. Development 11: a payment cMIP is a cMIP whose field 2 lists `[MONEY, 6]`; a Module under one, lacking fields 11 and 13, is no specification; a verifier not holding the cMIP answers unknown. Step 7 of the decoder reads field 2 for this too. Money, the MICS and the suite follow.
  5. Text 11 already read as rule 1 has it: no edit.
  6. "Closing (type 20)": non-member holders counted only by chain signatures, as for a fork.
  7. Text 11 rule 14: a member key's one object is `[collective, version]`; its freeze lines. **And Agreements rule 58** (question 1): the version that named the key stands as the decision a member key's action acts under.
  8. Rule 76: an acknowledgement whose signer is the grantee does not count; the stated cost says so.
- Provenance map and glossary updated; the texts keep no final line break.
- **The stranger's reading:** `docs/freeze-ready-strangers/s2-part0.md`, its 22 points and what was done with each.

### Part 1: the core matches the texts

| Text | What the core did | What it does now | Where |
| --- | --- | --- | --- |
| Keeper record (type 2), rules 37 to 42 | Refused type 2 as "format open"; keepers' logs stated by the caller | Decodes type 2 strictly (`KeeperRecord`); `in_format` reads it; builds each keeper's sequence from its records' `prev`, one record before another only in its ancestry, a second sequence ordering nothing against the first; a record counting only alongside its act and its signer; stated logs still read beside | `agreements/formats.rs`, `owners.rs`, `view/keepers.rs` |
| "Belongs to", the version in force | A keeper counted where named by the agreement the caller passed | `belongs_to`, `keepers_version`, `keepers_for`, `keepers_recorded_before`; `keeper_disputed_acts` gives Identity the acts such keepers recorded before the rotation voiding them | `view/keepers.rs` |
| Rule 33, deadlines | No function | `deadline(act, keepers, clock, point)`: met by an anchor of the act, or by the keepers' rule met by records before records anchored by the point; missed only by enough keepers' anchored silence; otherwise undetermined | `view/keepers.rs` |
| Rule 42, a keeper's later rotation | — | A record voided or disputed by its keeper's later rotation still places what it placed | `view/keepers.rs` |
| Rule 76 | An act a revocation missed: void unless the collective adopted it | `Backing::Disputed` where another identity, never the grantee, acknowledged it, or a keeper of an agreement it belongs to recorded it before the revocation; conferring nothing (consent `Ungranted`) unless adopted | `view.rs` |
| Text rule 14, a member key | A member key's text could name the signature act | Its one object must name the version the signature names; the version stands as its decision in Agreements (rule 58) | `chain.rs`, `view.rs` |
| Money rule 7 | Pointers tested | Receipts and obligations by a member key tested too (already judged by `consent`) | tests |
| Development, a payment cMIP | `Known::payment_cmip`, one hash given | `Spec::decode_judged` and `Spec::is_payment_cmip`: from the cMIP's own field 2, unknown where it is not held; the old call still works | `development.rs` |
| Development rule 26 | The text hashed exactly as given | `Spec::frozen_text`, `file_content`, `mir_file_hash`: one final line break removed, a draft's status line dropped from the header; two final breaks refused; the repository check reads files so, and still requires none for now; the reader ships `mirFileHash` | `development.rs`, `tests/spec_texts.rs`, `clients/reader` |
| Development, field 12 | A cMIP not declaring field 12 was never asked | Its checker is asked; the proof decides | `view/selling.rs`, `tests/vows.rs` |
| Pending rotation, dishonesty (rule 45), the contest's format, Agreements counting only acts in their format | Already as the texts say | Pinned by the existing tests and the vectors (the dishonest-home case is `chain.rs::a_home_is_proven_dishonest_only_at_the_position_and_never_backwards` and a vector) | |

All 534 tests of the core library pass, with the whole workspace (below).

### Part 2: the suite marks what runs

`docs/freeze-ready-suite-notes.md`, "Which steps a test runs": all 295 items, each with its tests. New small tests for the cheap core steps not yet run: several keepers against a rotation, a keeper's later rotation, a receipt belonging through what it fulfils, keeper sequences, deadlines, rule 76, a member key's text and Money acts. The other cheap steps the prompt names (arbitration and deadlines, how deals and collectives end, an agreement as a party, a silent next payee, purchases, referrals, refunds) were found already run, and are marked so with their tests.

### Part 3: the vectors

`core/vectors/README.md` lists every file, the text and rule it pins, and who checks it. New: `signatures.json`, `verdicts.json` (63 cases; the pool holds 176 complete acts, 714 KB), `sigs.py`; `check.py` judges signatures and 25 verdict cases; `core/tests/vectors.rs` all of them, from the bytes alone. The generator includes `core/tests/common` (`core/examples/support/verdicts.rs`) and asserts each verdict against the one written from the texts before publishing it.

## Questions

**1. A member key's text, and Agreements rule 58.**
*Plain words:* F371.7 decided that a text signed with a member's own key names, as its one pointer, the version of the agreement that gave the member the key. But Agreements rule 58 lets an action of the collective count only when it cites "a record of the collective, or a link of its identity chain"; a version is neither. As written, such a text would always count for nothing. I added one sentence to rule 58 so it can count.
*Precisely:* rule 58, "How an action cites": "for an action signed with a holder's member key, the founding or clone that named the key, its grant (rule 73), stands as such a decision". The core follows it (`version_link`).
*Options:* (a) keep the sentence; (b) a member key's text names a decision, as the collective's own text does (F371.7's rejected option b); (c) leave such texts never counting.
*Lean:* (a), it is the consequence of F371.7 and rule 80 already calls that version the key's grant. *Cost:* none beyond the sentence; flagged because it touches a rule F371 did not name.

**2. A keeper whose key is stolen.**
*Plain words:* a keeper's record keeps its effect even after the keeper disowns it in a later change of keys (rule 42: "a witness chosen in advance cannot un-witness"). So a thief with a keeper's signing key can write records that make a victim's disowned acts "disputed", or show a deadline met, and the keeper's own change of keys cannot undo them.
*Precisely:* the core accepts records valid, void or disputed under Identity for every rule that places an act (rules 33, 41, 76, the collective's line), as rule 42 lists them. A record forged before the keeper's rotation stands.
*Options:* (a) as written (decided in round 2's G2 and F364.2), the cost stated in rule 42's words; (b) only records a keeper's rotation keeps.
*Lean:* (a), a stated cost. *Cost:* a stolen keeper key can create disputes (visible, conferring nothing) and false "met" deadlines, until the agreement names another keeper. Worth one sentence in rule 42's stated trust, if Nobody, allegedly, agrees.

**3. A payment cMIP published without field 2.**
*Plain words:* now that "a payment cMIP" is read from the cMIP's own field 2, a payment cMIP whose author did not write field 2 (Development allows leaving it out) makes its rail Modules exempt from fields 11 and 13, and Money's rules 11 and 18 then have nothing to read.
*Options:* (a) as is: such a rail's kind and binding are unknown, and Money answers unknown where it needs them; (b) make field 2 required for a cMIP an agreement names for a task.
*Lean:* (a); the stated cost of F371.4. *Cost:* a careless cMIP author makes its rails' payments unknown where kind or binding decides.

**4. Gaps older than this session, listed for the C session to find or not** (the stranger's points 10, 11, 13, 22): which version of a deal is "latest" while the deal stands forked, for its keepers; how the agreement in force is found for a grant key's act (the core: the latest link among its grant and the decisions it cites); which version's keepers place a collective's act against a line (the core: point 5's, the line's); a stake holder that is itself a deal cannot chain-sign a fork or closing. Not chased now, as F371 says.

**Readings the core takes, where the text leaves a choice** (no verdict in the vectors rests on them):
- For an act that belongs to a collective's agreement without being in the collective's name, the keepers are those of the version it names.
- `belongs_to` follows an act through at most five acts it answers.
- The verdict vectors' "verdict, implementing the MIRs only": the core's `status` is Identity's standing; a verifier implementing only the six MIRs answers unknown for an act of any other specification that no rule shows invalid (Envelopes rule 30). The vectors ask it so.

## The stranger's reading

`docs/freeze-ready-strangers/s2-part0.md`: a subagent limited to the eight texts read every passage Part 0 changed. 22 points: 16 fixed in wording (one my own error in rule 33's several-keepers sentence, which had counted records before an anchor *past* the deadline as "met"), 1 fixed and put as question 1, the rest listed above.

## For the Dubsar Suite

What the core's WebAssembly interface and behaviour changed, so the suite's sessions can follow at merge:
- **`backing` can answer `"disputed"`** (a new value, beside `not-under-grant`, `backed`, `not-backed`, `binds`, `unknown`): an act of a grant key a revocation missed, that another identity acknowledged or a keeper recorded first. It confers nothing; show it as a dispute.
- **`mirFileHash(file)`** is new: a MIR's hash from its file (one final line break allowed, a draft's status line dropped). `mirHash(text)` is unchanged. The reader uses the new one.
- **Keeper records (type 2) are now valid acts in their format**; one outside it (`{ 0 => [act, signer] }`, no `objects`) is invalid where it used to be neither. An app writing keeper records must write exactly that format, public, each naming the keeper's previous record in `prev`. The view reads them itself; `keeperLogs` passed in still works.
- **A proven offer's checker is asked whether or not its cMIP declares field 12** (Development 11).
- **A member key's text now names the version that named the key** (Text rule 14, F371.7): `clients/grants/src/member.ts`, `signAsMember`, gives a text act (Text type 0) the one object `[collective, the key's terms]` instead of the collective's latest decision; every other act still cites the latest decision. Edubba's member-key test (`clients/desk/test/member-keys.test.ts`) caught it on CI; a published web build carries the old behaviour until its next release.
- **A test of the on-chain rail Module** (`modules/onchain/tests/conversion.rs::f267_the_next_payees_receipt_decides_which_forward_a_payment_served`) pins a reading older than Money 11 rule 11 (where receipt and claim of one payment name different previous hops, the payment's commitment decides, else the payer's claim). Left as is: the Module is the suite's.
- `Spec::decode_judged` (a payment cMIP from bytes) is in the core, not yet in the WebAssembly interface.

## Checks

- CI on pull request 88, commit `cf4fab9`, read by S2 itself: **green** (the jobs all, regtest and browsers). The first run (`9227667`) was red on Edubba's member-key test, fixed in `cf4fab9` ("For the Dubsar Suite"). Locally, `cargo test --workspace`: 770 passed, 0 failed.
- `python3 core/vectors/check.py`: all 186 vectors agree, 25 verdict vectors judged.
- `clients/reader`: `test/mirs.test.ts` passes locally with the rebuilt WebAssembly; the browser tests are CI's.

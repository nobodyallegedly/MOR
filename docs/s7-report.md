# S7, the fixes after Fable's review of the C verifier: report

*Session S7, 22 October 2026, branch `claude/s7-fixes`, pull request 96. The prompt is `docs/lead/prompts/s7-fixes.md`; the decisions it carries are F380. This session recorded no finding of its own (F381 stays free; its questions are below, for Nobody, allegedly).*

## In plain words

**What changed in the texts.** Fable found no rule wrong. It found nine places where a sentence was missing, and those sentences are now written into the texts. In Identity:
- A rotation now has a seventh check. The summary it records for each line it keeps must match that line. A line whose summary does not match keeps nothing.
- A rotation that is genuine but loses at its position has a name: **not counting**. It is neither invalid nor void.
- A chain stops for one of seven named reasons.
- Acts bound to a contested rotation wait (pending).
- An acknowledgement made with a borrowed key (a scoped key) rescues nothing.

In the other texts:
- **Text.** Naming a collective's latest decision is the client's duty. When a text breaks several rules, the rule reported is the first in the order numbered.
- **Envelopes.** A paragraph now says in which order a verifier checks an act, and that every text string inside counts, keys included. The "new key for every object" rule is marked as a duty of the client.
- **Agreements.** "Belongs to" is followed as far as the acts held allow, and is unknown beyond an act the verifier does not hold.

A stranger, given only the eight texts, read the new sentences. Its comments tightened their wording; nothing in substance moved. Every change is listed in the lead's workbook, under "After the box".

**What changed in the core.** These are the two conditions Fable set for the freeze:
- **The MIR hash.** It is now taken over the file exactly as it is, less one final line break. It no longer drops an italic line after the title. Dropping a draft's status line is now a separate tool, named as such.
- **"Same payment."** Whether two receipts or claims are one payment is now the rail Module's answer, handed to the core as a fact. Without that fact the answer is unknown, even when the proofs' bytes are identical. Two receipts of one payment now count once.

The core also now follows the new sentences:
- It knows "not counting".
- A kept line's last act whose held line does not fit keeps nothing; held without its line, it stays kept by its name, as before.
- It follows "belongs to" at any depth.
- It names the first broken rule of canonical text in the order the rules are numbered, as the C verifier does, rather than the first faulty character.

**What changed in the vectors.**
- Every act now has its own content key.
- Each audit proof names the receipt it proves.
- The keepers' rule is written as the format writes it.
- One mislabelled case is renamed.
- Canonical text uses Text's own rule numbers (7 to 12).
- There is a new NaN case.
- There are eighteen new verdict vectors, 87 in all.

**What a C verifier now meets that it did not.** Each of these has a vector:
- a rotation not counting;
- an act bound to a contested rotation;
- a kept line whose summary does not fit;
- an acknowledgement made with a scoped key;
- a private link found, and not found, at its signer's home;
- payments that are the same, or not, by the rail's answer, and unknown without it;
- "belongs to" at depth two, and unknown when an act in between is missing;
- the keepers of the version in force;
- a record putting an operational clone in force;
- a MIR file with an italic line after its title.

Both vector READMEs end with "What changed since the previous edition". They list each of these changes, so that the next C run can tell a known change from a divergence.

**What is not done.** Of Part 4, only a succession, declared and confirmed, has vectors. The reusable family of chain-signature acts for a collective's fork and closing, and the rest, is not built (below).

## Precisely

### Part 1, the two conditions (F380, 1)

**The MIR hash (Q46).**
- `Spec::frozen_text` returns the file less at most one final line break, and nothing else.
- `Spec::draft_without_status_line` is the tool's option. It drops only an italic line beginning `*Draft ` or `*Version ` after the title. Nothing on a verdict's path calls it.
- `mirFileHash` (WebAssembly) follows. So do the reader's comment and test (`clients/reader/src/mirs.ts`, `test/mirs.test.ts`), `core/tests/spec_texts.rs` and the Python check.
- The MIR-hash vectors keep a draft's status line as part of the text. Fable's case is added: `# T\n\n*an italic line*\n\nbody\n`, the italic line kept.

**"Same payment" (Q27).**
- `AgreementsView::payments` (proof → payment) is the rail's answer.
- Each record has a payment key, `Payment::{None, Stated, Unstated}` (`record_payment`, `payment_of`). `same_payment_as` treats two unstated records as the same only when they are one record. Any other comparison involving an unstated payment answers "not shown the same" and notes the answer as unknown.
- `paid_toward` → `Option<u64>` and `disagreements` → `Option<Vec<_>>`: `None` is unknown. `paid` and a closing's debts answer `AgreementsError::PaymentUnstated` (code `payment-unstated`).
- Records of one payment toward one purpose count once (`one_count`): the greatest receipt, or the greatest claim where that is more. Before, the creditor's receipts of one payment were summed.
- In the tests:
  - `core/tests` states the stand-in rails' answer explicitly (`common::stand_in_payments`: each proof is its own payment).
  - The Lightning story states the Lightning Module's answer.
  - The on-chain test that showed a view with no payments counting twice now expects unknown.
- Vectors: five new Money cases (one payment counted once; two payments; unknown with byte-different proofs; unknown with byte-identical proofs; one payment by the rail's answer). The two existing double-entry cases now carry their payment fact.

### Part 2, the texts and the core

**Text changes**, each listed one per line in `docs/lead/workbook.md`, "After the box":
- **Identity:**
  - rotation check 7 (Q17), with its reason and stated cost in italics;
  - "A rotation that does not count" (Q14);
  - "What stops a chain" (Q15, Q49);
  - rule 34's scoped-key sentence (Q18);
  - rule 42's pending acts (Q15).
- **Text:** rule 14's client-conformance sentence (Q24); rule 13's order (Q1).
- **Envelopes:** the order of checks (Q4); rule 5 (Q5); rule 9 and the client-conformance mark in "How to read" (Q6).
- **Agreements:** "Belongs to" (Q35); field 11's comment and rule 45's client-conformance sentence (Q33).

No finding number, review label or history appears in them.

**Core changes:**
- **`Status::NotCounting`** (`chain.rs`, `lost_at`). A rotation or chain signature that is a candidate at a position where another counts. Acts bound to it stay invalid, by everyday check 2.
- **Rotation check 7.** `kept_tips_fit` excludes, as a candidate, a rotation naming at least one tip where every tip's line is held and none fits. In `in_kept_ancestry`, a tip whose held line does not fit keeps nothing, itself included. A tip whose line is not held is still kept by its name, with what lies below it unknown, since check 7 applies "where the verifier holds that line". A first version made such a tip unknown; the collective client's rollback test (3.7w) caught it, and the text now says this case in so many words.
- **"Belongs to"** (`keepers.rs`). It is followed with a seen-set instead of a depth of four. `belongs_to_judged` says whether every step was held. `keeper_unknown_acts` with `Verifier::keepers_cannot_tell` makes a void act whose keepers cannot be read in full unknown.
- **Canonical text** (`text.rs`). Each rule is checked over the whole string, in the order numbered, and `TextError::rule` gives Text's numbers, 7 to 12. The error messages read "Text rule 10: …".
- **Q15 and Q18** needed no code. Acts bound to a contested rotation were already pending (`waiting()`), and an acknowledgement already needed `Status::Valid`.

**Tests that pinned the old readings were updated, each to the new sentence:**
- `core/tests/chain.rs`: a spent chain key revealed again, and a thief's losing rotation, are now not counting.
- `core/tests/drafts_after_step_15.rs`:
  - F292's buggy-client rotation, with its only tip not fitting, is invalid; a second scenario shows a misfit tip beside a fitting one keeping nothing.
- The harness gauntlet: two 5.7 steps and 5.7c, the same way.
- `core/tests/agreements_invariants.rs` (IT2b) picked "the first publication" by id order. With the new content keys that order changed, so it now takes the act it means, the collective's latest.

### Part 3, the vectors

**Generator changes:**
- **Q6:** a content key and nonce per act. In the test world they derive from the inside, the signer and the binding (`common::content_key_for`). In `open-act.json`, one key per case. The Python check asserts that no key or nonce locks two acts of the pool.
- **Q12:** each inclusion proof names its `receipt`. The Rust reading test asserts the receipt is held.
- **Q30:** the case is "a payment to oneself naming one's own genesis".
- **Q39:** `"rule": [0]`.
- **Q3:** `fa7fc00001` accepted, `fb7ff8000020000000` refused.
- **Canonical text:** numbered 7 to 12, with two cases that tell "first rule in order" from "first character". The core and the Python check follow.

**New verdict vectors.** Each verdict below is asserted by the generator against the library, and read back by `core/tests/vectors.rs`.

| Question | Vector | Verdict |
| --- | --- | --- |
| Q11 | a private link claim with its key, found at no home | unknown |
| Q11 | the same, found at its signer's own home | valid |
| Q14 | a rotation passing the checks and losing | not counting |
| Q14 | an act bound to it | invalid |
| Q15 | an act bound to a contested rotation | pending |
| Q17 | a misfit tip, beside a fitting tip | the tip and the act below it void; the act on the fitting tip valid |
| Q17 | a rotation whose one tip does not fit | invalid |
| Q18 | an acknowledgement under another identity's scoped key | void |
| Q27 | five cases, as above | |
| Q35 | a keeper's record of a receipt belonging to its deal through an obligation | disputed |
| Q35 | the same without the obligation | unknown |
| Q36 | the clone's keeper | disputed |
| Q36 | the founding's keeper alone | void |
| Q41 | an act of the payment cMIP an operational clone names, after its record | counts |
| Q41 | the same kind of act before the record | does not count |
| Q46 | the italic line | kept |

Facts gain `rail_payments`, `content_keys` and `found_at_home`, and the file's `about` says so. Q41 was written with a change of payment cMIP, not of an area's number, because an area is in the constitutional tier (Agreements, "Any other change to the constitutional tier (the change rules, the key grammar, the areas)…"), which only a rotation declares. The core refused the area version for that reason, and the text agrees.

**Totals:** 87 verdict vectors (26 Identity, 8 Text, 5 Envelopes, 11 Money, 24 Agreements, 7 Development, 6 MIR hashes); `verdicts.json` is about 1.1 MB. The Python check judges 26 verdict vectors and 192 checks in all. Regenerating the vectors gives the same bytes.

### Part 4, begun

One heavy rule now has vectors without new chain signatures: **a succession**, declared (shown, not followed) and confirmed by the successor's link confirmation naming the rotation (followed), under a new "succession" question. It costs one rotation's signature, already in the pool.

The rest of Part 4 is the family of chain-signature acts for the collective's fork and closing, agreements as parties, and judgment. I stopped before it at a clean point. Parts 1 to 3 changed the core's money and chain rules and every act id, and CI must be green on them first.

The plan for a next session:
- Build one collective with SLH-DSA-SHA2-128f chain signatures in a shared prefix of the pool: its founding, its members' chain signatures, one closing and one fork side. Name every case on it by act id, so that the signatures (17 kB each) are paid once.
- State the file's size in the README.
- Start with the closing, then the fork.

## For the Dubsar Suite

The WebAssembly interface:
- **`specs.railPayments`** (new, optional): pairs `[proof, payment]`, the rail Module's answer (the payment cMIP's `payment`). Without it, where an answer rests on whether two receipts or claims are one payment:
  - `agreementsPaid` throws `law/payment-unstated`, shown as unknown;
  - other verdicts treat the two as not shown the same (below).

  Dub's vows (`clients/dub/src/vows.ts`) now pass `railPayments` beside `railValid`, from the `payment` that `moneyJudge` already returns. Without it, a vow's sale whose receipt and claim are one payment would read as an unsigned receipt beside a sale. This is a three-line change made here so that CI stays green; it is the Suite's to keep or reshape.
- **A new status word, `"not counting"`**, from every function that returns an act's standing. Clients that switch on status words fall through to their default (for example the reader's `standingWords`); a plain-words line is theirs to add.
- **`mirFileHash`** now hashes a draft with its status line. The six hashes the reader shows change; the hashes in use (`MIRS`) do not.
- **Canonical-text errors** read "Text rule 7…12" instead of "rule 1…6". `clients/longform/test/act.test.ts` matched `/rule 4/` and is updated to `/Text rule 10/`.

## Questions, for Nobody, allegedly

**1. Check 7 can make a rotation's validity depend on what a verifier holds.**

*Plain words:* the decided rule says that a rotation whose kept lines are all held, and none fits, is invalid. A home receipting a rotation, or the air-gapped Module signing one, does not hold the owner's private lines. So a home can accept, and make first at its position, a rotation that a reader holding the lines calls invalid. Readers holding different acts then resolve the chain differently. Identity says elsewhere: "*Validity is fixed by the bytes, so an invalid rotation can never later become a competing one*" (rule 29's commentary).

*Options:*
- **(a)** Keep it as decided, and say in rule 29's commentary that check 7 is the one check that depends on what is held.
- **(b)** Drop the "invalid" clause: a tip that does not fit keeps nothing, and the rotation stands on its bytes as before. This is the stated cost F380 already names: "an owner's broken client voids its own line".
- **(c)** Make such a rotation unknown, not invalid.

*Lean:* (b). It keeps "fixed by the bytes", it matches the stated cost word for word, and the rule only ever meets a broken client.

*Cost of (b):* a rotation keeping nothing that fits still counts, and the owner rotates again with the next chain key. The core and the vectors follow the decision as written today (one vector: "a rotation whose one kept tip does not fit its line … invalid"). Choosing (b) changes `kept_tips_fit`, that vector and two test lines.

**2. "The next act unknown; the next act invalid" in the seven reasons.**

*Plain words:* F380 lists the reasons as Fable wrote them. The core, the C verifier and the text as written read "unknown" and "invalid" as being about the genesis. A rotation that is invalid at the next position stops the chain as "the end of what is held", as if it were not there.

*Options:*
- **(a)** As written.
- **(b)** A separate reason for an invalid rotation at the next position.

*Lean:* (a). Two verifiers already agree on it, and an invalid act counts for nothing anywhere else.

**3. Fable's vector "byte-identical proofs the rail says are two payments" cannot be expressed.**

*Plain words:* a rail Module reads which payment a proof is from the proof's bytes alone (the payment cMIP's `payment(rail_proof)`). So identical bytes are one payment at every Module built. The facts are keyed by proof for that reason. I wrote instead: identical bytes without the rail's answer, unknown; with it, one payment.

*Options:*
- **(a)** Leave Money rule 12 silent on this.
- **(b)** Say in rule 12 that a rail Module names the payment from the proof alone.

*Lean:* (a), with this note for Fable. Rule 12 already says the Module decides.

**4. Unknown "same payment" in the other verdicts.**

*Plain words:* `paid_toward`, `disagreements`, `paid` and a closing's debts answer unknown. The other places Money's rules tell payments apart still answer: rule 15's lists of claims, purchases, refunds, issuance takes-up and vows' sales. There, an unstated pair counts as "not the same", and the view only notes it (`unstated_payment_read`).

*Options:*
- **(a)** Carry an explicit unknown through each of those answers in a later session.
- **(b)** Accept the note as the signal.

*Lean:* (a). It is the same convenience Fable named, made smaller, not gone.

*Cost:* about a dozen functions' return types, and their callers in the apps.

## The stranger's reading

A subagent read only the eight texts, judging the added passages as a stranger who must build a verifier from them.

**Wording fixed after its reading:**
- check 7 now speaks of a tip's *sequence*, "up to and including" it, and only of rotations naming at least one tip;
- the acts bound to a rotation not counting "fail everyday check 2 … and are invalid" (it caught a contradiction with "Each rotation judges only the acts signed with the key it replaces");
- "facts" became "acts and evidence … and the same attempts";
- rule 34's sentence is "For this rule" and names the signing key (Agreements uses "own key" for a holder's member key);
- rule 42 waits "until the contest ends, by settlement or, at a self-hosted identity, by the escape";
- Text rule 14's sentence is marked client conformance, and its predecessor is "any of the collective's own records or links of its identity chain";
- Text rule 13 says who names the rule;
- Envelopes' order paragraph names rules 1, 2, 3, 5 and 7, and leaves rule 4's unknown and rule 30 as they are;
- Envelopes defines its client-conformance mark;
- "Belongs to" is step by step, and what is found through held acts stands;
- field 11's comment says "chain", not "line" ("Line" is a defined word in Agreements), and rule 45 marks the parent's latest act as client conformance.

**Left as it found them (open questions a stranger would still ask):**
- Check 7, when some tips' lines are held and others are not: the rotation stands. The text says invalid only where every tip's sequence is held. See question 1.
- Whether a homeless rotation inside its objection window stops a chain as "pending". The core says pending.
- Whether rule 34's sentence reaches a collective's acts placing others' acts by `acks` under grant or member keys: no, it says "for this rule".
- Whether Envelopes rule 5 reaches a text string on the outside: left as it is (rule 5 now says "in the inside"; Text rule 1's "every text field of every act" still covers the whole act).
- Whether a keeper reached only through an unknown "belongs to" step leaves the act unknown: yes, in the core (`keeper_unknown_acts`).

## The box assembles

`scripts/c-box/make-c-box.sh` was run at the end into the scratch folder. It refused nothing: "box assembled … 8 texts, 12 vector files". Neither README carries a finding number or a pointer to code.

## Checks run

These were run locally:
- `cargo test --workspace --locked`: all pass, the identity gauntlet included.
- The vectors regenerated byte for byte.
- `python3 core/vectors/check.py`: "all 192 vectors agree (26 verdict vectors judged here)".
- The WebAssembly build.
- The `clients/` test suites that CI runs (results in the pull request's description once complete).

CI on pull request 96 is read separately; it is not taken from the local runs.

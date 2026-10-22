# S7c, the last text edits before the second box: report

*Session S7c, 22 October 2026, branch `claude/s7c-last-texts`. The prompt is `docs/lead/prompts/s7c-last-texts.md`; the decisions are F383. This session recorded no finding of its own: F384 stays free. The questions below go to Fable before they are decided.*

## In plain words

S7b's four questions, as F383 decides them, are now in Identity, in Money, in the core and in the vectors.

- **A tip kept by its name.** Section 6 now says that what is unknown is an act *below* a kept tip whose line the verifier cannot rebuild, not the tip itself. One italic sentence states the cost: the tip can turn from valid to void once its line arrives and doesn't fit, which only the owner's own broken client can bring about.
- **An unknown genesis.** The freeze scenario now says that whatever a client shows past a genesis it cannot verify is display, not resolution: the chain's resolution stops at the genesis.
- **The order of the stop reasons.** Where more than one reason fits, the text now gives the order, with its principle: what no later act can change comes first, then what a later act could decide, then waiting. The exception is said too. I checked the order against `chain.rs` first; they agree.
- **Two or more unstated "same payment" pairs.** An answer that depends on one pair whose payment the rail's answer doesn't name is still worked out both ways. An answer that depends on two or more is now unknown. Only the pairs the answer itself asks about count.
  - One existing vector changes. The vow confirmed by a later claim, without the rail's answer, involves three records, so three pairs: it now answers unknown. It serves as the vector with two or more pairs.
  - The vectors that rest on one pair are unchanged.

## What changed, precisely

**Identity** (`spec/MIR-identity-draft-15.md`):
- **Section 6, "A verifier that cannot tell answers unknown":** the wording "an act below a kept tip whose line it cannot rebuild", and the italic stated cost.
- **Part four, scenario 8.4:** "display, not resolution", the resolution stopping at the genesis unknown.
- **"Which rotation counts", after "What stops a chain":** a paragraph giving the order and its principle.
  - Before the first position: no genesis, then the genesis unknown, then the genesis invalid.
  - At a position: the end of what is held; then contested, among final homeless rotations; then cannot tell; then contested, under the home rule (rules 40, 44, and rule 4's two rotations at a self-hosted identity) or between provisional homeless rotations; then pending.
  - The exception is in italics.

  `chain.rs`, `step`, runs in exactly that order:
  - no candidate gives the end of what is held;
  - two or more finals give contested;
  - an objection whose status cannot be told gives cannot tell;
  - then, with no provisional rotation, a tally contest gives contested, and otherwise pending;
  - two or more provisional rotations give contested.

  The core has one case F383 does not name: two homeless rotations at one position, both still provisional. It is contested, in the later slot, which the principle places there. The text names it, so the text says what the core does.
- **"What stops a chain":** "the genesis unknown" now adds "and no check it can apply fails" (Envelopes rule 30). This comes from the stranger's reading below.

**Money** (`spec/MIR-money-draft-11.md`), rule 12: a new paragraph, "Where the rail's answer is not held". It says:
- Without the rail Module's answer of which payment each record is, a verifier does not know whether two records are one payment.
- On one such pair, an answer is judged both ways, and stands where both ways agree.
- On two or more pairs, the answer is unknown.
- The pairs counted are those the rules giving the answer ask about, including a pair asked only once another is taken as one payment.
- A list is one answer: with one pair, entry by entry; with two or more pairs, the whole list is unknown.
- The cost is in italics.

Agreements states nothing about this, so it is unchanged.

**The core** (`core/src/agreements/view.rs`, `view/vows.rs`):
- `same_payment_as` records each unstated pair it is asked about, and answers "one payment" only for the one pair being taken as one.
- A new `two_ways` returns `Ways::One` (no pair), `Ways::Both` (one pair, answered taking it as two payments and then as one) or `Ways::Unknown` (two or more pairs, including a pair first asked on the second reading).
- `judged`, `judged_r`, `judged_list` and `vow` are built on it.
- A judged answer inside another is judged on its own; its pairs are not the outer answer's.
- **One test changed.** The on-chain Module's test `modules/onchain/tests/agreement.rs` now states the rail's answer of which payment a proof is for every claim, as an Agreements client does, and not only for those the rail answered valid. Before, its refund question read several pairs it had left unstated (claims the rail answered invalid). It was right by luck under the old rule and is unknown under F383.

**The vectors:**
- Still 108 verdict vectors.
- One case changed: "the same without the rail's answer: three records whose payment is not stated, so three pairs the vow depends on: unknown".
- `verdicts.json` is now 1,446,287 bytes. Both READMEs give the new size, the Money row, and a sentence in "What changed".
- Regenerating gives the same bytes. The Python check reports "all 192 vectors agree".

**Workbook:** one line per text change under "After the box", S7c, and one line for the wording fixed after the stranger's reading.

## For the Dubsar Suite

No WebAssembly function changed its name or its arguments. Two return different results:
- `agreementsVow` and `agreementsOwedBack` may now fail with `law/payment-unstated` where they returned a list with entries marked unknown, when the answer rests on two or more unstated pairs.
- The functions that already throw `law/payment-unstated` (purchases, closings, splits, a split service's account, take-ups, `agreementsPaid`) throw it in more cases.

A client that passes `railPayments` for every proof its rail Module can name a payment for, as Dub does, meets none of this.

## Questions, for Fable before they are decided

**1. Is "nothing can undo" a contest among final rotations true?**

*Plain words:* F383 places a contest among final homeless rotations before cannot tell, "because nothing can undo it". But a rotation the old homes held still beats a final one, whenever its receipts surface (rule 54). So a later act can undo it.

The text now says "no objection can undo it", which is true. Cannot tell is about an objection, so the order still follows. The principle's wording ("what no later act can change") is looser than the case.

*Lean:* keep the order, and keep the exception's wording as now.

**2. Two homeless rotations both final at one position.**

The stranger asks whether this can happen. If it cannot, the first "contested" slot is empty. The core allows it, as a contest.

*Lean:* say nothing; the order covers it either way.

**3. What "an answer" is in Money rule 12.**

*Plain words:* the core treats each question a client asks as one answer: a purchase, a closing, a refund repaid, a vow, a collective's payments owed back. The text names only lists. The stranger asks about a total, an obligation's state, a route.

*Options:*
- **(a)** List the answers in the text.
- **(b)** Leave "an answer" as each question a verifier answers.

*Lean:* (b) for the freeze, with the vectors showing it.

**4. Pairs and transitivity.**

*Plain words:* three records that may be one payment make three pairs, so the answer is unknown. Taken together, those pairs have fewer than eight consistent combinations.

*Lean:* as written. This is the cost F383 accepted ("sound rather than complete").

**5. What a client shows past an unknown genesis.**

"Display, not resolution" names no label.

*Lean:* leave it to clients. No verdict rests on it, as F383 says.

## The stranger's reading

A subagent read only the eight texts and the diff.

**Wording fixed:**
- The stated cost now says "valid to void (or disputed, where relied on), once its line arrives".
- "The genesis unknown" now says no applicable check fails, so it and "the genesis invalid" never both fit (Envelopes rule 30).
- The later contest is "under the home rule", citing rules 40, 44 and 4, so a self-hosted contest has its slot.
- The exception now says "no objection can undo it".
- Money's paragraph names the rail's answer of which payment a proof is, and says it is not rule 8's answer.
- The "pair first asked" clause is reworded.
- A list with two or more pairs is unknown.

**Left open:** questions 1 to 5 above. Two further points: "line" in section 6 and "sequence" in check 7 name one thing (wording for MOR2), and the cost sentence leaves out a thief holding the chain key (F380 already gives the reason: such a summary gives a thief nothing).

## Checks

- Rust workspace: every test passes.
- The vectors regenerate byte for byte; Python check: all 192 vectors agree.
- Every client suite: see the pull request.
- `scripts/c-box/make-c-box.sh`, run into a scratch folder outside the repository: assembled 8 texts and 12 vector files, refused nothing.
- CI on the pull request: checked, and recorded in the pull request.

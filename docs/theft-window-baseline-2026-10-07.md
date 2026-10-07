# The theft window: back to a baseline

*7 October 2026. Prepared by the project lead for Nobody, allegedly, after four rounds of fixes on one question broke in new places each time (F133 to F168; the reviews in `docs/reviews/`). Its purpose is to let the principle be decided from a clear page before any rule is written again. Nothing here changes the spec.*

## In plain words first

- **The question every round was about.** A signing key is stolen. Nothing in MOR tells the time. Who bears the money paid during and after the theft?
- **Most of this morning's breaks were made by the fixes, not by the question.** Of about a dozen breaks found by the last two reviews, two go back to the original rules. The rest were introduced by fixes, several of them suggested by the project lead and accepted fast (the ledger below).
- **The original rules (approved 5 October) had three real problems.** Two sentences promised something about time ("when", "later"), which MOR cannot check. A payment under an agreement had no named pointer. And the owner bore collusion, which was stated but never bounded.
- **There are three honest principles to choose from.** Each has a cost, and none is free. They are set out below in plain words, with who pays and how often.
- **The proposed way forward:** decide the principle first; then write the smallest rules that deliver it, starting from the baseline; then let a reviewer attack the whole set once.

## 1. The baseline: what was approved on 5 October

As written in Finance draft 6 at commit `ab66523`, and in Identity draft 11:

- **Rule 14, the backlog.** "A payment to an identity's flow pointer counts only for obligations and acts that name that flow pointer's version or a later one. Anything that arose under an earlier flow pointer counts only if paid to the vault. The version an obligation names MUST be one that counted when the obligation's agreement act was made."
  - *Plain:* a thief who publishes a new wallet cannot collect old debts. Old debts go to the old wallet or the vault.
- **Rule 14a, the vault.** Limits per unit, fail closed, applied as the chain declares them. A limit of zero switches the everyday wallet off.
- **Rule 15, good faith.** "A payment that followed both the published pointer and the published vault counts as made, even if a later rotation invalidates that pointer. The loss from a theft window falls on the owner, never on a payer who followed the published rules."
- **Rule 10, double entry.** "Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived."
- **Identity rules 15 and 16, the thief's acts.** After a rotation, acts outside the kept line are void, unless another identity acknowledged them: then they are valid and shown as disputed.

## 2. What was really wrong with it

Only these four problems came from the baseline itself. Each is listed with the finding that first named it.

1. **"When the obligation's agreement act was made"** (R14-1, F133). MOR has no clock, so no verifier can check which pointer "counted when".
2. **"Even if a later rotation invalidates that pointer"** (R14-2, F139). After a rotation, a verifier cannot tell a payment made before it from one made after.
3. **A payment under an agreement names no pointer** (R14-3, F138). Law's terms carry no payee pointer, so there was nothing to compare.
4. **Collusion.** A payer working with the thief pays the thief's wallet, and the owner bears it. The baseline says so ("the loss … falls on the owner"). It never bounds how long, because the thief's acts that a colluding payer acknowledges stay valid as disputed (Identity rule 16).

Everything else the reviews found in this area was introduced later.

## 3. The ledger: what each fix solved, and what it broke

| Fix | Solved | Broke, or opened |
| --- | --- | --- |
| F133, F138: the pointer is the one the agreement act cites | problems 1 and 3 | the debtor or payer drafts the agreement, so it can cite the thief's pointer (review finding 1) |
| F139: good faith judged by what the payer's claim cites | problem 2 | the payer writes the claim, so a colluder cites nothing (review finding 1) |
| F145: judged by the payee's own act | the drafter's choice | through "every citation", the payee's signature still holds what the drafter cited (build flaw 1) |
| F146: anchor order where both are anchored | nothing for the owner | the owner cannot anchor the payer's claim (Fable, finding 3) |
| F147, F154: claims read together; no claim counts | honest payers with two claims or none | together with F139, the proviso excludes only honest payers (Fable, finding 3) |
| F155: one selection, through citations | the drafter's choice, the latest version | nothing new by itself |
| F157: walk only the payee's own acts | build flaw 1 | **two devices**: a deal signed on the phone finds no wallet (Fable, finding 2) |
| F160: the vault the payee's act holds | the fan's 900 under a lowered limit | **flow-off after a theft protects nothing already signed** (Fable, finding 1) |
| F163: the client cites its latest pointer | two devices | in the window, an honest client cites the thief's pointer (Fable 2, finding 6) |
| F164: the owner's receipt, or the payer's word until the owner anchors | collusion, F160 | **the owner holds the lever, with no theft needed**; "anchored" names no reference (Fable 2, findings 1 and 2) |
| F168 item 11: any later act of the payee's on the agreement | changing wallets | **a thief re-points every existing deal in the window**, reopening what F157 closed (Fable 2, finding 5) |

**Reading the ledger:** each fix moved the lever to a different party (the drafter, then the payer, then the payee's device, then the owner), and each time the reviewer found who could pull it. That is the sign of a question being answered at the wrong level.

## 4. The principle: three honest options

Each option is described by who bears a theft, how long, and how many disputes it creates.

### A. The owner bears the theft window (the baseline's principle, made checkable)

- **Rule.** A payment that followed what was published counts as made. A thief's pointer outside the kept line never counts as the owner's, except as rule 16 already says: valid and shown as disputed where a payer relied on it.
- **Who bears.** The owner, always. Colluders included: a stated cost, as in the baseline.
- **How long.** Unbounded in principle, since a colluder can claim reliance at any time. In practice it is bounded by the thief's reach: a colluder needs the thief's acts.
- **Disputes.** Only payments to a thief's acts. A theft is rare, and each one has few such payments.
- **Owner's tools.** Vault limits and flow-off apply as the chain declares them, at once. Honest payers' wallets must check them (rule 14a). A payment the payee's own wallet received is never unmade (rule 10).
- **Cost.** The owner cannot shut out a colluder.

### B. The owner can shut the window (F164's principle)

- **Rule.** As A, but once the owner anchors the rotation, payments to a voided pointer need the owner's receipt or a claim anchored earlier.
- **Who bears.** The owner until the anchor, and unanchored payers after it.
- **Cost.** Whoever controls the cut-off gains by it. The second review showed this cannot be confined to thefts. A narrower B, where the cut-off applies only to pointers the rotation voids and never to limits or the owner's own wallet, is still open to an owner who voids one of its own devices.
- **Also needs** a defined anchor reference for a rotation, which Finance does not have (Fable 2, finding 2).

### C. The core shows; the parties' chosen arbiter decides

- **Rule.** Payments to a voided pointer are shown as disputed, with all the evidence: the claim, any receipts, any anchors. They count as neither made nor unmade until the dispute module named in the agreement resolves them (Law). Tips and other payments outside any agreement stay disputed, shown.
- **Who bears.** Whoever the arbiter decides. The core stops pretending to know.
- **Disputes.** The same count as A, since only payments to voided pointers are disputed. Fewer than they sound, because ordinary rotations void nothing.
- **Cost.** A theft's payments wait for an arbiter, and tips have none.

**What all three keep.** Rule 14's backlog protection: a thief's newer wallet never collects old debts, judged by the version the payee's own act shows, through a selection that does not depend on time. And rule 10: a payment the payee's own wallet received counts.

## 5. What stays outside this question

These decisions are about other things. The reviews found them holding, or only needing small fixes:

- the anonymous claim's signature covering its citations (F135, F147);
- leftovers by largest remainder and turns (F150, F165), whose receipt chain needs a reset rule (Fable 2, finding 7);
- the text format floor (F149, F167), which needs adjusting for quotes, links and negative forms (Fable 2, findings 10 and 11);
- private links (F152, F159, F168);
- own attempts (F153);
- the witness act (F156);
- absence (F166), which needs one sentence on what a defeated declaration undoes (Fable 2, finding 8);
- the client citing its latest pointer (F163), which can stand without the window question.

They can be settled one at a time, at normal speed, independently of the principle.

## 6. Proposed way forward

1. **Nobody, allegedly, chooses the principle:** A, B, a narrower B, or C, or another he sees.
2. **The project lead writes the smallest rules that deliver it,** starting from the baseline, and checks them himself against the ledger above before putting them forward.
3. **One hostile review of the whole set, by Fable,** before anything is built.
4. **Then build,** with the building session told which decisions it replaces.

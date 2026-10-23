# S7e, Fable's second review written in: report

*Session S7e, 23 October 2026, branch `claude/s7e-fable-second`. The decision is F389; Fable's review is `docs/reviews/fable-second-review.md` (pull request 102). This session recorded no finding of its own: F390 stays free. The questions below go to Fable before they are decided; the branch carries my lean on each.*

## In plain words

- **What "belongs to a deal" means is now one reading.** An act that names any act of a deal (an obligation, an offer, another act on it) belongs to that deal, and the deal's keepers can place it. Before, the Rust core only followed a name when it pointed straight at the deal's terms, so a party's contest naming one of the deal's obligations belonged to nothing.
- **A sale on an unverified payment is no longer "sold".** A receipt or claim counts toward a purchase or a sale only once its rail's answer says the payment is valid. With no answer yet, the answer is "unknown", never "pending" or "sold". A seller who ships only on "sold" now ships only on verified money.
- **Fable's sentences are in the texts**, and the rules only one implementation had built now have test cases (fourteen new ones, 124 in all), so the C verifier's next edition meets them.
- **Nothing else moved.** Every earlier test case gives the same answer. The only changes to the old cases are the rule labels, which now cite rules the texts actually number.

## What changed

**The texts** (one line each under "After the box" in the workbook):
- Agreements 17:
  - "Belongs to": a step is each `objects` entry, chain and predecessor alike, and each act answered, whatever the act named is, save an Identity act (genesis, rotations, chain signatures, Identity everyday acts) (Q55).
  - The keepers of the version in force: "what its `prev` and the predecessors its `objects` name, followed back" (Q56).
  - Rule 12's opening: a payment following a lone seller's offer names no claim, the offer itself the agreement it pays under (rule 11; Money rule 18); the refund sentence points back to it.
  - Rule 12, "Wrong receipts": without the rail's answer the payment is pending, and whether it is a purchase is unknown (question 1).
  - "A contest of a purchase": *Client conformance: where the offer the buyer paid or signed onto names a vow, the buyer's client names the vow in the contest, as its inside's chain and predecessor, `[[vow, vow]]`, so that the sale is marked.*
  - Signature (type 1), field 0's comment: "or a standing offer, as a party consenting to it (type 6) or signing onto it (rule 13)".
- Money 11:
  - Rule 8: *A receipt or claim whose verification answer is not valid counts toward no purchase and no sale: where its answer is invalid, it counts for nothing; where its answer is pending or unknown, or the verifier holds none, whether its payment is a purchase or a sale is unknown* (Q53; Fable's sentence, worded after the stranger's reading). I put it in rule 8, where the four answers are defined, rather than in Agreements rule 13, because it governs purchases (rule 12) as well as a vow's sales (rule 13).
  - Rule 12: a pair is counted between payments, never between records (Q52).
- Identity 15, the order of the stop reasons: the principle becomes italic commentary, "among contests: what no objection can undo comes before what an objection could decide, and that before waiting" (S7c question 1).
- The freeze test suite v30:
  - Under "Purpose", "What an answer is": each question the published test vectors ask of a verdict is one answer, a list among them judged as Money rule 12 says for a list (S7c question 3).
  - Step 9z: pending, and whether a purchase unknown (question 1).
- MICS v30, the glossary's "Belongs to": one clause, each act named in `objects` (chain or predecessor) and each act answered one step; an Identity act ends the path.

**The core** (`core/src/agreements/`):
- `view/keepers.rs`, `belongs_into` (Q55): every `objects` entry, chain and predecessor alike, and each act answered, is one step, whatever the act is. It stops at terms (reached) and at any Identity act (followed no further). A step naming an act not held makes the answer incomplete, as before.
- Fail-closed sales and purchases (Q53):
  - `view.rs` adds `rail_counts`: valid only with the rail's answer, valid. It also adds `answered`: an answer read once fail-closed and, where it read a record whose answer is pending or not held, once more as if that answer were valid. Where the two readings differ, the answer is unknown. It is Money rule 12's "judged both ways" pattern, applied to the verification answer. So unknown appears only where the missing answer could change something: a vow's sale proven by the buyer's valid claim stands even though the seller's receipt has no answer.
  - Every path that read `rail_invalid` for a sale or a purchase now reads `rail_counts` instead:
    - `purchase_unjudged`: the record judged, the receipts of one payment naming different claims, a push rail's holder receipts, a collective's recording receipts, and a receipt signing a sale anew after a rollback;
    - `vows.rs`: `purchase_buyer`, `committed_buyer` and `sale_acts`.
  - New: `PurchaseVerdict::Unknown` and `AgreementsError::RailUnanswered` (code `rail-unanswered`).
  - `vow` and `purchase_contests` are judged both ways as above. `owed_back` marks an entry `unknown` where it rests on an unanswered record. A vow's sale is now named by a claim with a valid answer first, so an extra unanswered claim moves only the sale's state.
- 21 tests that judged purchases on records with no rail answer now state the stand-in rail's answer (`common::stand_in_answers`). Four tests changed what they check, because the rule changed:
  - a payment nobody signed onto is `unsigned` with the receipt's answer, and `unknown` without it;
  - a claim answered invalid acknowledges nothing, and one with no answer leaves the sale's state unknown;
  - the seller's own claim is stated invalid, as the rail would answer it;
  - a verifier with no rail answers judges the "wrong receipts" payment unknown (it was "unrecorded").
- `cargo test --workspace --locked`: all green.

**The vectors** (`core/vectors/verdicts.json`, 124 cases, 1,902,855 bytes). Fourteen new cases, each passing in Rust:
- Identity:
  - a private link after its signer moved homes: valid found at the home its chain named at the binding; unknown found only at the new home (Q62);
  - two final homeless rotations at one position, with an objection that cannot be told: contested (Q64).
- Money: a vow's sale whose buyer's claim has no verification answer: the sale unknown, not pending (Q53).
- Agreements:
  - a party's contest naming an obligation of the deal, recorded by the deal's keeper before the rotation: disputed (Q55; before this change, void);
  - records (Q57): the signatures that meet the clone's mark, in force (the control case); valid signatures short of the mark, not in force; a clone whose parent is not in force, not in force;
  - closings (Q58): after a registered resignation, every remaining member signing, complete; under a constitutional rule counted by shares, one member holding more than the share, complete;
  - an agreement as a party, standing forked and unsettled, signed by its reference's parties: exists (Q61);
  - a judge's two first settlements keeping different versions: the next link active at once, its settlement in force (Q60);
  - a judge's settlement naming every tip it saw: in force; one omitting a tip it saw, through the history of the version it keeps: nothing (Q60; see question 2).
- Q50: the generator cites rules as the texts number them. "Agreements rule 47a" is now 91, "rule 34a" is 35, and "Money rules 10a and 12" is "Money rules 12 and 17" (with "Agreements rule 93" where the case says so).
- Checked against the previous file:
  - every earlier case keeps its acts, question and verdict;
  - no earlier act id changed;
  - only the twelve rule labels moved.
- Both READMEs (`core/vectors/README.md`, `scripts/c-box/vectors-README.md`) are updated: the counts, the rows, the size, and "What changed since the previous edition".
- `core/vectors/check.py`: "all 192 vectors agree". One fix was needed: the pool now holds two private acts, which carry no content key on their outside, and the check had read two absent keys as one shared key. It now skips an absent key; the nonce is still checked for every act.

## For the Dubsar Suite

**The WebAssembly interface:** no function was added, removed or renamed, and no argument changed. One new error code: `law/rail-unanswered`.

**Functions whose answer can now be unknown for a sale or a purchase (Q53):**
- **`agreementsPurchase(specs, id)`**:
  - *Result shape:* a new value of `verdict`, `"unknown"` (no new field; `why` null).
  - *When:* the receipt or claim `id` has no rail answer. Also when a receipt it is judged with has none and the answer rests on it: on a push rail, each holder's receipts of the payment; where the seller is a collective, the collective's receipt recording it; after a rollback, its receipt signing the sale anew; and receipts of one payment naming different claims.
  - *What avoids it:* `specs.railValid` naming those records (or `specs.railInvalid` for those the rail refused).
- **`agreementsVow(specs, name)`**:
  - *Result shape:* unchanged. A sale's `state` may now be `"unknown"`, and a payment may appear in `unknown` where it was in `unsigned`.
  - *When:* where the answer rests on a receipt or claim whose rail answer is not given. For example, a payment shown only by the seller's receipt, with no answer for it, is `unknown`, not `unsigned`. A buyer's claim with no answer leaves its sale `unknown`, never `pending`.
  - *What avoids it:* `specs.railValid` naming the payments' receipts as well as the buyers' claims (a caller stating only claims, as today, sees receipt-only payments as unknown), and `specs.railInvalid` for those the rail refused. `specs.railPayments` as before.
- **`agreementsPurchaseContests(specs, purchase)`**:
  - *Error:* a new throw, `law/rail-unanswered`, where the purchase's claim has no rail answer and would otherwise be a purchase.
  - *Result shape:* unchanged.
  - *What avoids it:* `specs.railValid` (or `specs.railInvalid`) naming that claim.
- **`agreementsOwedBack(specs, collective)`**:
  - *Result shape:* unchanged (`unknown` already existed).
  - *When:* an entry is marked `unknown: true` where it rests on a receipt or claim with no rail answer.
  - *What avoids it:* `specs.railValid` naming the collective's receipts and the payers' claims.
  - *What a closing does:* `agreementsClosing` reads this list. An unknown entry still blocks a closing, as the entry did before.

**A function whose answer moves with Q55:**
- **`agreementsBacking(specs, act)`**: may answer `"disputed"` where it answered `"not backed (void)"`. This happens for an act under a revoked grant that a deal's keeper recorded before the revocation, where the act reaches the deal through an act it names in `objects` that is not the terms themselves (an obligation, an offer, a contest). Result shape unchanged. No input avoids it: it is the rule.

**Unchanged:** every function that already required the rail's answer: `agreementsPaid`, `agreementsSplit`, `agreementsSplitNumbers`, `agreementsSplitTurns`, `agreementsPayerSplit` and `agreementsSplitTally`, and the Money functions. None of them reads a purchase verdict.

## Questions, for Fable before they are decided

**1. "Pending" or "unknown" for a payment the rail has not answered.**

*Plain words:* Money rule 18 and Agreements rule 12 say that where receipts of one payment name different claims, the payment is "pending" until the rail answers. The new sentence in Money rule 8 says that with no answer, whether a payment is a purchase is "unknown". The MICS says Money's *pending* means "a payment the rail has not answered". So the payment is pending in Money's sense, while whether it is a purchase is unknown.

*Options:*
- (a) **As built.** Money rule 18 is unchanged. Agreements rule 12 and the suite's 9z say both: the payment is pending, and whether it is a purchase is unknown. The core answers `PurchaseVerdict::Unknown` there (it said "unrecorded").
- (b) Keep Agreements' "pending" as the purchase verdict for this one case, against Q53's sentence.

*Lean:* (a). *Cost:* two one-clause text changes F389 did not list, made because Q53 requires them.

**2. What a judge's settlement "saw": the core reads less than the text.**

*Plain words:* Agreements, "What a settlement could see", lists, for any settlement, "what it cites, each with its own history", and for a judge's settlement also the histories of the version kept and the tips dropped. A judge's settlement cites the settlement request. The Rust core (`deal_walk`) reads only the kept and dropped versions' histories, never the request's. So a judge who keeps A and drops B, while the requester's own history holds a third version C, settles the fork in Rust, and settles nothing by the text. I built the vector Fable asked for (Q60) from a case both readings agree on: C lies in the kept version's own history. I left this case out of the vectors and the core unchanged.

*Options:*
- (a) The core follows the text: a judge's settlement saw the request's history too. *Cost:* a core change after the next box, and the C verifier must meet it. A judge must then name every tip its requester saw. That is safer: the judge cannot drop a branch the requester knew.
- (b) The text narrows to the core: for a judge's settlement, the request itself, not its history. *Cost:* a text change, and a judge may then settle while leaving a branch the requester saw unnamed.

*Lean:* (a), in a later session, with its vector.

**3. "Save an Identity act": chain signatures named.**

*Plain words:* F389's sentence lists "an identity's genesis, rotations and Identity everyday acts". Identity defines a chain signature as an identity-chain act that is neither, so by the letter, "belongs to" would follow a chain signature (which names, for instance, a collective's closing). Both implementations stop at every Identity act.

*Options:*
- (a) **As built.** "An Identity act (an identity's genesis, rotations and chain signatures, and its Identity everyday acts)", matching both implementations.
- (b) Fable's words alone, and both cores follow a chain signature.

*Lean:* (a). *Cost:* the sentence names one more kind than F389's wording.

**4. How unknown spreads (mechanics, for confirmation).**

*Plain words:* "Pending or not held, unknown" could be read strictly: any answer that touches an unverified record is unknown. Or it could be read as built: unknown only where the missing answer could change the answer, judged both ways as Money rule 12 does for "same payment". Read strictly, a vow sale proven by the buyer's verified claim would turn unknown just because the seller's receipt of the same payment is unverified.

*Options:*
- (a) **As built:** both ways; unknown only where the readings differ.
- (b) Strict.

*Lean:* (a). *Cost:* a reader of the vectors must know the two-ways rule. Money rule 12 already states it for "same payment"; for the verification answer it is the build's.

## The stranger's reading

A subagent read only the eight texts and the diff. It found no finding number, review label or history in the changed passages. It raised twelve points.

**Taken, wording only:**
- "Belongs to": the opening sentence now says what the steps say (an act naming, in `objects`, "an act that belongs to it" belongs). A step is "each act an `objects` entry names, chain and predecessor alike", the same in Agreements and the MICS. An Identity act is where "the path ends". The dangling clause is moved.
- Money rule 8's sentence:
  - It now covers all four answers: invalid, the record counts for nothing; pending or unknown, or none held, unknown.
  - It says a record "counts toward" no purchase. As first written, one refused receipt could read as making the whole payment no purchase, against 9z, where the payment stays a purchase by its other receipts.
- Money rule 12's sentence: "unstated record" is replaced by "a record whose payment the rail's answer does not name".
- Rule 12's carve-out moved to its opening "only if" sentence, as the prompt says; the refund sentence points back to it.
- Identity's principle sentence is now italic commentary, "among contests". The stranger showed it is not true of every reason as protocol: the end of what is held yields to any act, and a self-hosted double-served position is contested for good.
- The suite's line now says "each question … is one answer", the list "judged as Money rule 12 says for a list". As first written, "entry by entry" could read as if each entry were its own answer.
- The conformance line says where the vow is named (`[[vow, vow]]`) and covers an offer signed onto at no price.
- Signature (type 1)'s field 0 comment also lists a party's consent to a deal's offer (type 6).

**Left out:** the italic line on the lone seller's buyer's standing. As a party, the buyer would have standing over every act of the agreement, not only its own purchase. The prompt allowed it only "if it reads well", and it does not.

**Not changed, for the lead:** the stranger notes that "pending" and "unknown" now hold together for a payment (its state pending, whether it is a purchase unknown), while the MICS's verdict vocabulary defines pending and not unknown (question 1).

## The releases rebuilt

*(to be filled in)*

## The box

*(to be filled in)*

## Checks run

*(to be filled in)*

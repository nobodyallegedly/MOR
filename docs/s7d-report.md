# S7d, a buyer's contest of a purchase, and the signer's hint in the binding: report

*Session S7d, 22 October 2026, branch `claude/s7d-buyer-contest`. The prompt is `docs/lead/prompts/s7d-buyer-contest.md`; the decision is F386. This session recorded no finding of its own: F387 stays free. The questions below go to Fable before they are decided; the branch carries my lean on each.*

## In plain words

- **A buyer can now say "this is not what I paid for".** Before, only a vow's buyer could contest. Someone who bought a recording described as "the full concert", and got a slideshow, had nowhere to say so. Now the buyer of any purchase can sign a contest naming it, with the promise not kept in words if they want. It is shown beside the purchase. It undoes nothing: no payment, refund, delivery or verdict moves. Signed by anyone else, it shows nothing.
- **Apps can now show the signer's own time.** Every act already had a place for a hint (field 9), "never load-bearing". The binding now writes it when an app gives one, and reads it back for display. Nothing that judges an act reads it.

## What changed

**The texts** (one line each under "After the box" in the workbook):
- **Agreements 17:**
  - Rule 54 gains the buyer, for a contest of their own purchase. The glossary's "Standing" says the same; its "Contest" now says "by someone with standing" (a buyer is often no party). The type table's row 14 says so too.
  - "Contest (type 14)": the in-short and the format's comments. A new paragraph, "A contest of a purchase", says:
    - what field 0 names (the buyer's payer's claim, any of their own claims of the payment, or their sign-on to an offer at no price);
    - who the buyer is;
    - field 1 in words;
    - `[[purchase, purchase]]`;
    - that it is shown only while the payment is a purchase, and moves nothing.
  - The vow's paragraph is now said once as "a vow's sale is a purchase, contested the same way, with one difference": naming the vow marks the sale.
  - Two closing sentences: "Field 1 is read from the bytes alone" (question 1), and what "shows nothing" means.
- **MICS v30**, "Contests": one clause for the buyer.
- **The freeze test suite v30**: one line, after the standing offers.

**The core:**
- `formats.rs`: `Contest::of_purchase`. Field 1 in words is now in format whichever act `objects` names. In a cMIP's terms, it is still a vow's sale's only.
- `view/vows.rs`:
  - `purchase_contests(purchase)`: the buyer's valid contests naming that purchase. The buyer comes from `purchase_buyer`, which accepts:
    - a payer's claim with the rail's answer, on a rail binding the payer, whose payer is an identity, of a payment whose verdict is a purchase;
    - a valid sign-on to an offer at no price that counts, by anyone but its own side. That side is `offer_side`, the vow code's own list, now shared.
  - Judged as Money rule 12 says: unknown only where it rests on two or more pairs whose payment is not stated.
- `view.rs`: a declaration's contest carrying field 1 shows nothing.
- Nothing else moved: no verdict, payment, refund or sale state reads a contest of a purchase.
- New tests: `core/tests/purchase_contest.rs`, five tests:
  - shown, field 1 optional;
  - another identity or the seller: nothing;
  - a free purchase;
  - a tip: nothing;
  - a vow's sale in both forms.
- One test in `tests/vows.rs` now pins the new format reading.

**The vectors:** two new Agreements cases, with a new question, "purchase contests":
- a buyer's contest of their purchase, shown;
- the same contest signed by another identity: nothing.

Now 110 cases, 1,456,955 bytes. Every earlier act and case is unchanged, byte for byte (compared with the previous file). Both READMEs (`core/vectors/README.md`, `scripts/c-box/vectors-README.md`) are updated: the count, the Agreements row, the size, and a line in "What changed since the previous edition". The Python check says "all 192 vectors agree".

**The binding** (`wasm/src/lib.rs`): the signer's hint, the purchase's contest payload, and the contest list. See "For the Dubsar Suite". There is a test in `clients/genesis/test/hint.test.ts`.

## For the Dubsar Suite

- **The signer's hint, written:**
  - `makeEveryday(input)` takes an optional **`hint`** (a string), written into the inside's field 9.
  - It must be canonical text; otherwise `makeEveryday` throws "a hint is canonical text".
  - Only everyday acts carry it. `makeGenesis`, `makeRotation` and `makeChainSignature` write none.
  - The genesis client's `publish` does not pass it yet: the apps pass it to `makeEveryday`, or ask for a wrapper.
- **The signer's hint, read:**
  - `describeAct(act)`, `openWithKey(act, key)` (in its result) and `openSealed(...)` (in `described`) return **`hint`**: the string as the signer wrote it, or absent.
  - It is display only, labelled as the signer's own (Envelopes rule 6). No function of the binding takes it as input to a judgment.
- **New:** `purchaseContestPayload(purchase, promise?)` gives the payload of a buyer's contest. The act carries `objects` `[[purchase, purchase]]`, signed by the buyer.
- **New:** `Verifier.agreementsPurchaseContests(specs, purchase)` returns the buyer's contests shown beside that purchase, ascending.
  - `specs.railValid` names the claims whose rail the client checked, as for `agreementsVow`.
  - It throws `law/payment-unstated` where it is unknown.
- **Changed:** a contest whose `objects` names the act it answers, carrying field 1 in words, is now in format (it was invalid). `agreementsDeclarationsNaming`'s `contests` leaves such a contest out.
- No other function changed its name, arguments or results.

## Questions, for Fable before they are decided

**1. Field 1 on a contest that is not a purchase's: "shows nothing", where it was "invalid".**

*Plain words:* before, a contest of any act other than a vow's sale was invalid if it carried field 1. A buyer's contest of a purchase now carries field 1 in the same form (the act named in `objects` as chain and predecessor). Only what field 0 points to can tell a purchase from any other act, and that act may not be held, or the payment may still be pending. A format rule that holds only once other acts are held would make validity depend on what a verifier holds.

*Options:*
- (a) **As built.** Field 1 is read from the bytes alone. In words, it is in the format of any contest; in a cMIP's terms, only of one naming a vow. A contest carrying it that is not a purchase's shows nothing.
- (b) Keep "invalid", judged by the view, and unknown where the purchase is not held or pending.
- (c) Mark a purchase's contest in its bytes, for example field 2. That changes the format F386 fixed.

*Lean:* (a). *Cost:* a stray field 1 on another contest is now silently shown as nothing, not refused. No verdict reads either way.

**2. Others with standing over a purchase.**

*Plain words:* rule 54 gives a party or an affected holder standing to contest any act. A co-owner of the work is such a holder for a sale. F386 says a purchase's contest "signed by anyone else, shows nothing".

*Options:*
- (a) **As written.** It "shows nothing as the buyer's contest". A party or holder with standing contests the purchase as any other act (field 1 absent). The core shows no generic contest of another act today, so nothing changes in code.
- (b) Only the buyer may contest a purchase at all.

*Lean:* (a). *Cost:* two readings of one act, the buyer's and an owner's, told apart by who signed.

**3. A vow's sale contested in the purchase's form.**

*Plain words:* a vow's sale is a purchase. The buyer can name the vow, which marks the sale contested, or name the purchase.

*Options:*
- (a) **As built.** In the purchase's form it is shown beside the purchase and marks no sale.
- (b) In the purchase's form it shows nothing, so each sale has one form.

*Lean:* (a), since the buyer's client may not know the offer named a vow. *Cost:* a client that reads only the vow's state misses a contest made in the purchase's form. The buyer's client SHOULD use the vow's form, but I did not write that as conformance.

**For the lead: two older points the stranger found, outside F386, not changed:**
- Signature (type 1)'s field 0 comment does not list an offer, though rule 13's sign-on by a signature act names one.
- Rule 11 makes a lone seller's offer "the agreement between seller and buyer", so the buyer may already be a party with standing. Rule 12's opening says a payment naming no claim is no purchase, while Money rule 18 exempts a lone seller's offer. The core reads such a payment as a purchase, as the vow vectors already do.

## The stranger's reading

A subagent read only the eight texts and the diff. It found no finding number, review label or history in the changed passages.

**Taken, wording only:**
- who the buyer is (an identity the commitment names, or the sign-on's signer; no buyer for a bare key, as rule 13 already says);
- which claim may be named;
- shown only while the payment is a purchase (pending shows none);
- a vow's sale in each form, and a contest naming the vow whose field 0 is no sale of it;
- field 1 in a cMIP's terms elsewhere being invalid;
- "shows nothing" defined;
- "verdict" spelt out (validity, status, selection, a sale's state);
- the glossary's "Contest" and the format comment;
- the MICS's clause split into two sentences.

**Put as questions:** its contradiction between rule 54's parties and "anyone else" (question 2), and field 1 (question 1). **For the lead:** the two older points above.

## The releases rebuilt

All six were rebuilt in this branch, as their READMEs say: `cd clients/genesis && npm run wasm`, then `npm run release` in each of `clients/site` (the display client), `clients/dub`, `clients/kishib`, `clients/damgar`, `clients/ummia` and `clients/desk` (Edubba). Then each one's `npm run test:build`, which builds it again and checks it gives the same bytes, passed for all six. The tools match `BUILT-WITH.txt`: rustc 1.97.0, wasm-bindgen 0.2.129 (installed here at that version), and each client's pinned esbuild.

The WebAssembly every release carries now has the work hash beginning `89c45a5a1bb40abe`. GitHub's reproducible build of the display client is the check that Linux x86-64 on GitHub gives the same bytes (below).

## The box

`scripts/c-box/make-c-box.sh` was run into a scratch folder after the final text edits. It refused nothing: 8 texts, 12 vector files.

## Checks run here

- `cargo test --workspace --locked`: all green.
- `gen_vectors`: the same bytes again.
- `python3 core/vectors/check.py`: all 192 agree.
- The genesis client's new test passes.
- CI on GitHub: *(below).*

# S7g, the core brought to the texts: report

*Session S7g, 23 October 2026, branch `claude/s7g-core-to-the-texts`, from main after S7f (#105). No text changed. This session recorded no finding of its own: F396 stays free. The questions below go to Fable before they are decided; nothing in the core rests on a lean.*

## In plain words

- **S7f's three confirmed differences are fixed.** The core now follows the text in all three:
  - A rotation built on a rotation still waiting for its receipt is pending, never invalid.
  - Only an agreement that exists claims a work. Draft terms nobody signed can no longer turn another's sales into refunds owed: this one was an attack.
  - One payment claimed toward two debts, with no named batch, counts for neither until the receiver resolves it. Before, it counted in full toward each.
- **S7f's other suspected differences were each written as acts and run on the core.** Of the 55 rows beyond those three:
  - 23 differed where the text is clear, and are fixed.
  - 2 were the reader's suspicion only.
  - 2 are parts the core does not build yet.
  - 28 are questions, the text being unclear or pointing two ways (one a fix withdrawn after the stranger's reading).
- **Envelopes, Text and Development were read whole**, as S7f read the other three. They hold 143 sentences on which a verdict turns:
  - 35 were exercised before; 87 are now.
  - 4 differences fixed: three in Text rule 14's check, one in Development's decoding.
  - 4 questions.
- **The vectors** go from 153 cases to 327. Every earlier case keeps its verdict, its place, its act ids and its bytes; no earlier case is one a fix touched.
- **Every web release that carries the core is rebuilt:** the display client, Dub, Kišib, Damgar, Ummia and Edubba.

## The three S7f confirmed (S7f's questions 4 to 6)

Each comes with a vector showing the case, and with the case that stays as it was. An unchanged copy of main's core gives the old answer on exactly the new cases and nothing else.

1. **A rotation built on a pending rotation** (Identity, everyday check 2; rule 28).
   - Fix: `chain.rs`, `status_cx` with the new `on_waiting`. A rotation or chain signature built, through acts that each pass the rotation checks, on one the verifier waits on (pending, or contested under rule 42) is pending. So is every act bound to it.
   - One narrowing, so as not to change what the text does not ask: a homeless rotation that a valid objection voids is waited on by nothing, so what is built on it stays as it was (invalid). The status word for that voided rotation is a question (Q-I0).
   - Cases:
     - "a rotation built on a rotation not yet receipted: pending" (was invalid);
     - "an act bound to that second rotation: pending" (was invalid);
     - "the same once the home has receipted both rotations: the act valid";
     - "a rotation built on a rotation that does not count: invalid".
2. **Terms nobody signed claim nothing** (Agreements rule 12 with rule 1).
   - Fix: `view.rs`, `claimed`. Only an agreement that exists claims a work: a deal's version every party signed, or a collective's clone in or once in force. Where whether it exists rests on an act not held, the purchase answer is unknown.
   - Cases:
     - a Money-only payment for a work only unsigned terms stake: "not a payment for a work" (was "no purchase");
     - the same terms signed by their drafter alone: the same (was "no purchase");
     - every party signed: "no purchase", owed back.
3. **One payment, two debts, no batch** (Money rule 12).
   - Fix: `view.rs`, `paid_toward_if` with the new `shared_unresolved`. A record does not count where another standing record of its payment names another purpose or payee, is not already overruled under rule 11, and shares no batch with it. This lasts until the receiver's receipts of that payment all name one purpose.
   - Cases:
     - two claims of one payment, toward two debts: 0 toward the first (was 60);
     - one claim only: 60;
     - with the receiver's receipt naming the first debt: 60 toward the first, 0 toward the second.

## The suspected differences, sorted

`docs/untested-sentences.md` marks each of S7f's 58 question rows with its outcome. Those are the 3 above and the 55 below; S7f's report counted these "52 more", having set aside the row its own session fixed and two others. Where no vector question reaches a rule (splits, a service's account, a grant key's share), a unit test shows the fix.

| | Fixed | Refuted | Confirmed, not built | Question |
|---|---|---|---|---|
| Identity (13) | 7 (rows 4, 6, 7 in part, 9, 10, 11, 15) | 0 | 0 | 6 (row 5 among them), and row 7's other half |
| Money (10) | 5 (rows 1, 6, 29 in part, 37, 45) | 1 (row 3) | 2 (rows 2, 51; row 29's routes) | 2 |
| Agreements (32) | 11 (lines 1 to 1125: rows 4, 14 in part, 15, 43, 45, 48; lines 2130 to 4343: rows 5, 19, 28, 102, 109) | 1 (row 65) | 0 | 20 |
| **Total (55)** | **23** | **2** | **2** | **28** |

**The fixes:**

*Identity* (`chain.rs`, `identity.rs`):
- A homeless rotation is final only once the next rotation counts under the home rule it declared, not through another escape. A living old home's late objection still voids it.
- A signing key whose length is not its founding scheme's is invalid. This is the shared decoder, so Money's payer and anonymous keys and Agreements' member and grant keys follow.
- An act disowned and acknowledged only by an act of unknown status is unknown, not void (it used to flip to disputed later).
- A contesting receipt blocks nothing: the stop is pending, not contested.
- Homes split under the rule, none meeting it: contested, not pending.
- A "mor" successor whose identifier is not 32 bytes: no succession, not another protocol's.
- An escape endorsement must be bound to the act just before the homeless rotation, or, after a chain signature, the act that set the key.

*Money* (`view.rs`):
- A receipt or claim counts only where its rail Module is one the pointer, vault entry or refund rail it was paid to names.
- A refund shown by a receipt under a revoked grant is not repaid.
- A refund to the refund rail is judged as the payer's chain stood, with rule 29's protection.
- A tip, or a debt payment, naming a claim is no payment for a work.
- A receipt and a claim naming different previous hops are a question on the receiver. `Disagreement::Differs` gains `previous`.

*Agreements* (`view.rs`, `view/owning.rs`, `view/parties.rs`):
- A purchase's line must carry the agreement's claim.
- An over-sale turns no payout receipt into a debt.
- Splits are judged against the stakes as transfers left them.
- A split that does not sum leaves its receipt unsplit.
- A grant key signs no share the rail paid to the service itself.
- A deal whose party is an agreement the verifier does not hold is unknown, not "does not exist".
- A member key, and a grantee's acceptance, that an act of the collective placed outlive the holder's later rotation.
- A clone marked with the plan alone that places the successor elsewhere is invalid. The unit test `what_b14_leaves_open_is_refused` asserted the old reading (Unsettled) on exactly this case; it now asserts the false mark.
- The grantor adopts an act by paying on it: its own claim names the act in `fulfils`.
- A liveness counts in a collective only where the collective placed it.

**Readings taken while fixing**, each named so Fable can overturn it:
- Splits following transfers: a transfer counts only where the version it names writes the stake as the version in force does. This keeps a clone that already lists the buyer from counting the transfer twice.
- "Pays on it": the grantor's own claim, its rail proof not required, as an acknowledgement needs none.
- A tip naming a claim: "not a payment for a work" (Money rule 18's "no purchase" for a tip is not Agreements rule 12's money owed back).
- The receiver resolving rule 12's shared payment: by its receipts of that payment all naming one purpose and payee.

**Not taken:** one reader also "fixed" a payout short by its rail fee, reading any shortfall within the plan's cap as discharged, and any shortfall at all where the plan states no cap. The Money reader read the same sentences another way. Two readings of one text make it a question (Q-A6), and that change was left out.

## Envelopes, Text and Development, read whole

| | Sentences | Exercised before | Exercised now | Fixed | Questions |
|---|---|---|---|---|---|
| Envelopes | 61 | 12 | 32 (25 verdict cases, 4 encoding vectors) | 0 | 1 |
| Text | 40 | 13 | 30 (25 verdict cases, 11 canonical-text strings) | 3 | 1 |
| Development | 42 | 10 | 25 (64 cases) | 1 | 2 |

**The fixes:**
- *Text rule 14* (`chain.rs`, `text_pointer`):
  - A grant key's text decides by the second case whoever signs, so naming anything but its grant is invalid. It was scoped.
  - A member key's text whose signature act is not held is unknown. It was invalid.
  - A "record" another key forged is no decision of the collective's. It was valid.
- *Development* (`development.rs`, `Spec::decode_judged`): a Module whose field 5 names the Money MIR is a specification. It was "unknown: the cMIP is not held".

The rows left as vector rows each carry a plan in `docs/untested-sentences.md`, the end of each new section.

## Questions, for Fable before they are decided

Each in plain words, then precisely; the code is cited as `file`, `function`. "Lean" is my reader's or mine; "cost" is what each option costs.

### Identity

- **Q-I0. The status word for a homeless rotation a valid objection voids.**
  - Plain words: the core calls it "pending" (it waits among the candidates), and a rotation built on it "invalid". The text says the objection "voids it … and with it every rotation built on it" (Identity 649).
  - Options: (a) as built; (b) both void; (c) both pending, since an objection can lose its validity later.
  - Lean: (b) in words, if "void" can be given to a rotation.
  - Cost: (b) a status the chain procedure does not give rotations today.
- **Q-I7. A self-hosted identity's homeless rotation** (row 5; Identity rule 4 at 105 and 332, the homeless procedure at 591, rule 48 at 553, the escape at 613).
  - Plain words: the core counts a homeless rotation that a self-hosted identity serves as served, with no new home's receipt and no endorsement.
  - A fix (a self-hosted home serves no homeless rotation) was made and **withdrawn** after the stranger's reading. Rule 4 ("its rotation counts with no receipt"), line 332, and 591 ("re-homes by serving a rotation from anywhere") read as if anything it serves counts. Rule 48 (an old home must not hold a homeless rotation), 591 ("never gone") and the escape's step 5 read the other way.
  - Options: (a) as built; (b) a self-hosted home serves no homeless rotation: an unendorsed one never counts, and an escape needs its new homes' receipts.
  - Lean: (b), one sentence in rule 4.
  - Cost: (a) a thief holding the chain key re-homes a self-hosted identity at will; (b) nothing for an owner, who leaves by the escape.
- **Q-I8. "Final once the next rotation counts"** (MICS 97 and its glossary at 435, against Identity 633).
  - The MICS summary says a homeless rotation is final once the owner's next rotation counts. Identity, and now the core, say only one counting under the home rule the homeless rotation declared.
  - Lean: the MICS adds "under the home rule it declared" in the next text pass.
  - Cost: none in verdicts.
- **Q-I1. A pending acknowledgement** (row 7's other half; Identity 412, 442, 446).
  - Plain words: an act relied on by an acknowledgement under an unreceipted rotation is void now, and disputed once the receipt arrives.
  - Options: (a) void, as built; (b) unknown; (c) pending.
  - Lean: (b).
  - Cost: (a) keeps the void-to-disputed flip; (b) and (c) let a rotation never receipted hold off void for good, though the act is not valid either way.
- **Q-I2. What "cannot tell" covers** (row 8; Identity 391).
  - Plain words: only an objection of unknown status gives the stop "cannot tell". A receipt whose operator's chain is not held, an unknown absence statement or cosignature, and a pending objection are treated as absent. So two verifiers holding different operator chains name different stops.
  - Code: `chain.rs`, `judge_receipt`, `homeless_basis`.
  - Options: (a) as built; (b) any evidence of unknown status that could change whether the rotation counts; (c) (b) with pending evidence too.
  - Lean: (b).
  - Cost: (b) needs "could change" defined; (c) turns ordinary waits into "cannot tell".
- **Q-I3. Dishonesty when the home never rotates** (row 12; rule 45, Identity 529).
  - Plain words: rule 45 asks that a conflict "survive the home's own rotations". The core needs both receipts kept by a rotation or cosigned, so an unaudited home that never rotates is never proven dishonest.
  - Options: (a) as built; (b) proven at once; (c) after at least one rotation of the home.
  - Lean: (a) or (c), the text saying which.
  - Cost: (b) brands an honest home whose key was stolen.
- **Q-I4. A repeated auditor** (row 13; genesis check 5).
  - The core counts distinct auditors, so `[A, A]` with threshold 2 is invalid.
  - Options: (a) distinct, as built, the text saying so; (b) a raw count; (c) a repeat makes the act invalid.
  - Lean: (a).
  - Cost: (b) lets an identity lock itself out.
- **Q-I5. "Exactly that entry"** (row 14; Identity 786).
  - Plain words: must an objection, absence statement or endorsement carry only that one `objects` entry? The core accepts it among others.
  - Options: (a) as built; (b) exactly one, otherwise invalid; (c) exactly one, otherwise not counting.
  - Lean: (b), but the colon may only explain the chain check.
  - Cost: (b) a client's mistake voids the act.
- **Q-I6. Who is a collective, for Text rule 14** (Identity row 16; Text row 13).
  - Plain words: the core counts an identity as a collective if any act of its chain ever declared a founding agreement. So a person who declares terms nobody signed in a rotation can chain texts to its own chain, which rule 14's commentary rules out.
  - Code: `chain.rs`, `text_pointer`, against Agreements rule 56 ("a collective's genesis declares its founding agreement") and the Agreements view, which reads the genesis.
  - Options: (a) the genesis decides, for good; (b) the declaration in force at the act's binding; (c) ever declared, as built.
  - Lean: (a).
  - Cost: (a) one line in the core; (b) a collective's pointers fail after a null; (c) as said.

### Money

- **Q-M1. "Pending" or "unknown"** (row 43; Money 316 against rule 8 at 179).
  - Line 316 calls a payment awaiting the rail's answer "pending (rule 8)"; rule 8 says unknown. The core answers unknown (or unrecorded). The vow's "pending" means something else.
  - Options: (a) line 316 says "unknown"; (b) a new verdict "pending"; (c) "pending" names the rail's answer, not the verdict.
  - Lean: (c), worded as (a).
  - Cost: one word, against a new verdict everywhere.
- **Q-M2. A claim has no batch** (Money 212, 374; claim format 548).
  - Rule 12 and rule 24 let "receipts or claims" of one payment share it under a named batch, but only a receipt carries a batch (field 8). The core reads a claim as naming none, so two claims of one payment for two purposes never share it.
  - Options: (a) a claim gains a batch key, inside key 8's signed array; (b) the two sentences say "receipts".
  - Lean: (b), as built.
  - Cost: (a) a format change; (b) a payer splitting one payment across debts needs the receiver's receipts.
- **Q-M3. Routes are not built** (rows 29, 51; rules 24 to 28).
  - No core function answers a route, a hop's forward or rule 27's open obligation; fields 6, 7 and 10 are decoded and, since this session, one disagreement read.
  - Lean: the step plan says rules 24 to 28 are left for a later step, so a second implementation does not read them freely meanwhile.
  - Cost: none now.
- **Row 2, no question:** the rail Module implementing the agreement's payment cMIP is the caller's check, carried by the rail's answer (`rail_valid`); the vectors' README says so.

### Agreements

- **Q-A1. A wrong payout receipt and the buyer's signature** (row 14; Agreements 370, 393).
  - The text: wrong "once the seller has signed" the transfer. The core also waits for the buyer.
  - Options: (a) as built, the text saying "once the transfer is complete"; (b) the seller's signature alone.
  - Lean: (a).
  - Cost: (b) debts owed to people who never accepted.
- **Q-A2. A backup, read twice** (row 41; Agreements 664, 777; S7f's question 3).
  - The split check calls a backup payout with no failure stated a mismatch. Money counts the payment anyway. Line 777 says unknown without the split cMIP's answer.
  - Options: (a) leave both; (b) a fact "the split cMIP's answer is held": without it unknown, with it a mismatch where the attempt did not fail; (c) the split check as lenient as Money.
  - Lean: (b).
  - Cost: a new fact and an unknown state in a split.
- **Q-A3. Does the pointer check decide anything?** (row 39; Agreements 84, 731, 737 to 741).
  - The core computes it and no verdict reads it, so paying a bypassing pointer is still a purchase.
  - Options: (a) display only, the text reworded ("is shown as … only if"); (b) no purchase.
  - Lean: (a).
  - Cost: (b) honest buyers lose purchases made to the owners' own pointer.
- **Q-A4. Refunds owed, and a closing** (row 30; Agreements 440, 444 against the closing's list, 3991 to 3996).
  - Apart from the broken stretch, no refund owed is listed or blocks a closing.
  - Options: (a) as built, 444 being about the broken stretch; (b) every refund not ended is a debt for "owes nothing".
  - Lean: (b).
  - Cost: (b) a scan of every payment at a closing, unknown while any rail answer is pending.
- **Q-A5. A refund when a deal never completes** (row 27; Agreements 429 to 436).
  - No delivery and no receipt naming the offer creates no refund in the core.
  - Options: (a) build the receipt half, shown, not blocking; (b) client conformance.
  - Lean: (a).
  - Cost: a new verdict; a late receipt flips it.
- **Q-A6. A payout short by its rail fee** (Money rule 21, row 50; Agreements 901 to 907, row 56; payout key 6 at 3381).
  - The core counts any shortfall unpaid and reads no fee. Two readers read the text two ways.
  - Options: (a) discharged when received ≥ amount less the payout's own key 6, key 6 within the cap (none where the service bears fees); (b) discharged when the shortfall is within the cap, any shortfall where there is no cap; (c) as built until the text says what is compared.
  - Lean: (a).
  - Cost: (b) lets a payout of nothing count where no cap is stated; (c) the core contradicts the text. Also open: an agreement with no plan, whether the defaults (receiver bears, no cap) apply.
- **Q-A7. An unfilled role's share** (row 54; Agreements 875).
  - The core cannot check that it goes to the stakes: the split cMIP computes the amounts.
  - Options: (a) the cMIP's, said so; (b) the core computes each share.
  - Lean: (a) now.
  - Cost: a gap visible only in the trail.
- **Q-A8. What "relied on" means** (1126 to 2129, row 15; Agreements 1175, 1204).
  - Any act naming a version as parent keeps it complete against a signer's later rotation: one party's draft clone, even a stranger's unsigned terms.
  - Options: (a) a clone relies only once complete, a purchase only where it is one; (b) (a) and signed by a party or keeper; (c) as built; (d) (a) and before the rotation.
  - Lean: (a).
  - Cost: (c) lets one party, or anyone, keep a version in force for purchases and splits.
- **Q-A9. The roster for the owners' consent to a sale or release** (row 50; Agreements 1376, rule 94).
  - The core asks whoever the current terms list: a seller of a share is still asked, her buyer never.
  - Options: (a) each signature counted at its own line; (b) complete at the first line where the signatures placed by then meet the rule, counted on that line's roster; (c) as built.
  - Lean: (b).
  - Cost: a walk over placements.
- **Q-A10. Outcome 2 of a declaration of absence** (row 38; Agreements 1310, 2416 to 2432).
  - No field names outcome 2's recipients, and the core reads outcome 1 only, so an outcome-2 clone waits for the vanished holder.
  - Options: (a) a format field naming them; (b) any clone moving all the holder's shares, the total unchanged; (c) as built.
  - Lean: (a).
  - Cost: a text and format change.
- **Q-A11. `[5, stake]` where every holder signs** (row 78; Agreements 1837 with 1138).
  - The core always requires it in the mark, so a clone every holder signed is invalid for its mark alone.
  - Options: (a) always, the text saying so; (b) only where the clone relies on the rule; (c) (a) save where every holder is a member.
  - Lean: (a).
  - Cost: (b) required powers depending on who signed.
- **Q-A12. A co-owners' offer one party signed** (row 24; Agreements 420 against 599, 611).
  - The core counts it for nothing, so a buyer is owed back.
  - Options: (a) as built, rule 11 saying so; (b) a purchase under the deal; (c) a purchase of what the signer could sell alone.
  - Lean: (a).
  - Cost: the buyer must reclaim.
- **Q-A13. An inner deal signs by its version in force, or any version** (row 44; Agreements 684 against 691).
  - The core accepts any version on its line.
  - Options: (a) in force only; (b) any, 684 reworded; (c) in force for new consents, an earlier consent standing where the inner's history carries it.
  - Lean: (c), else (b).
  - Cost: (a) an inner deal escapes by re-versioning.
- **Q-A14. Invalid, not unknown, in the vectors** (row 62; Agreements 43).
  - Terms out of format are refused by a check error, which the harnesses write "unknown".
  - This session added the question "agreement invalid" (for a false mark).
  - Lean: use it for out-of-format terms in a later session.
  - Cost: none now.
- **Q-A15. A free sale's confirmation** (row 35; Agreements 565 against 578).
  - The core follows 565 (both acknowledgements).
  - Lean: 565 governs, 578 reworded.
  - Cost: none in verdicts.
- **Q-A16. Priority between work claims** (row 63; Agreements 296).
  - What deciding priority changes is not said.
  - Lean: shown only.
  - Cost: contested for good.
- **Q-A17. "Obligations before that point settle under the parent"** (row 9; Agreements 1148). No verdict is stated. Lean: commentary, marked so.
- **Q-A18. "Or a version it descends from"** (row 67; Agreements 1663). Which acts it covers is not said. Lean: acts that are versions, judged by marks; the text says so.
- **Q-A19. Standing to start a judge's period** (row 65, refuted).
  - The core follows lines 1271, 3498 and 3611 (a party who signed the version). Lines 1036 and 2846 cite rule 54's wider standing.
  - Lean: the two lines name rule 35's narrower standing.
  - Cost: none in verdicts.
- **Q-A20. Does the grant place its acceptance?** (row 102; Agreements 3434 against 2724).
  - Built: placed only by an act of the collective acknowledging it.
  - Options: (a) as built; (b) the grant itself places it.
  - Lean: (a).
  - Cost: (b) a thief's acceptance can never be disowned.
- **Q-A21. "A payer who gave no address"** (row 80; Agreements 2605, 4004).
  - The core trusts the caller's statement that a notice lapsed, and never looks at the payer's pointer, vault or refund rail.
  - Options: (a) as built; (b) refuse field 4 for a payer with a valid pointer, vault or refund rail held; (c) refuse only where the time reference places an address before the deadline.
  - Lean: (b), or (c) if a late address must not block.
  - Cost: (b) a late address blocks the closing.
- **Q-A22. "In its place"** (row 29; Agreements 2316 to 2321).
  - A successor already a party, several successors to one key, a custodian or recovery role: the core answers unsettled.
  - Options: (a) a rule for each; (b) invalid for an automatic plan, passing only by nomination; (c) unknown as a stated cost.
  - Lean: (b).
- **Q-A23. A living party's own trigger** (row 25; Agreements 2305).
  - No act writes it, so an automatic seat never passes while the party lives.
  - Options: (a) the party's own signature on the succession clone; (b) a resignation naming the plan; (c) drop "while alive".
  - Lean: (a) or (c).

### Envelopes, Text, Development

- **Q-E1. A private encryption key** (Envelopes rule 8, line 115; line 77).
  - Rule 8: type 4 "MUST be public", but no verdict is named, and the core holds a private one as valid. Two verifiers may then name different current keys.
  - Options: (a) invalid, as a private Identity act; (b) client conformance; (c) types 0, 3 and 4 all invalid when private.
  - Lean: (a).
  - Cost: (a) one check, and line 77 or rule 8 naming the verdict.
- **Q-D1. A specification published through a grant key** (Development rule 3, line 75).
  - The core answers unknown for any grant-key publication, so a collective can never be shown as a creator.
  - Options: (a) a publication Agreements backs claims it for the grantor; (b) only the creator's own key, a collective publishing through a member; (c) as built.
  - Lean: (a).
  - Cost: a second function reading backing.
- **Q-D2. "`amount` carried as given"** (Development step 4, line 325).
  - Unchecked in the core: `[1, "ten"]` passes.
  - Options: (a) unchecked, the text saying "any item"; (b) checked as Money's amount.
  - Lean: (a).
  - Cost: one word, against one check in the core and the Python check.
- **Text row 13** is Q-I6.

## The stranger's reading

A subagent limited to the eight texts read each fix's case (31 cases, with their twins) and said whether the texts give the verdict the fix gives. **No disagreement.** 24 agree outright; 3 agree, with a part the texts leave open; 1 the texts do not decide; 3 agree, with a wording a careful reader could trip on.

**Taken:**
- **I3, the self-hosted homeless rotation:** the texts do not decide it. The fix was withdrawn and is now Q-I7. One case holds either way and stays: an escape from a contested self-hosted position, with its new home's receipt held, counts.
- **M1's third case** (the receiver's receipt resolving two claims) holds only where the rail binds no purpose. Where the rail binds the purpose, the commitment decides instead. The case now states its rail's specification, a rail binding the payee only (fact `rail_specifications`).

**Noted as questions:**
- I2's stop word for a voided homeless rotation: with Q-I0.
- MICS 97 and 435 read more broadly than Identity 633: Q-I8.
- M5: "names nothing" does not say what a field 9 on a tip does. The core ignores it; a reading, listed above.

**Trip hazards in wording** (no verdict in doubt; for the next text pass):
- Identity:
  - 731, "answers unknown, whatever the lengths", can be read as applying to the rotation itself;
  - 809: a malformed successor still replaces the earlier succession;
  - 623 against everyday check 2.
- Money:
  - 88: a vault change "applies at once", which only rule 29 tempers;
  - 197 to 199, beside the previous-hop question;
  - 41: a Module without fields 11 and 13 is called no specification, without Development's condition.
- Agreements:
  - 370 has no exception for an over-sale (rule 14 gives one);
  - the core's "mismatch" is the texts' "breaks the plan";
  - 2150 reads unconditionally, the placement coming from "Made before, made after";
  - 3502 says "counts" where the question says "shows presence".

No text was changed.

## For the Dubsar Suite

**The WebAssembly interface:** no function added, removed or renamed, and no argument changed. `Disagreement::Differs` gains a field in the core; no binding exports it. What moves is answers.

**Functions whose answer moves.** Result shapes are unchanged unless said; each line names the inputs that matter.

- **`Verifier.status`, `Verifier.resolve`, `bindingStatus`, `failedToReach`, `foundAtHome`, `txid`**, and everything reading a chain:
  - Pending replaces invalid:
    - for a rotation built on one awaiting its receipt;
    - for an act bound to such a rotation.
  - Contested and pending trade places in `resolve`'s `next`:
    - homes split under the rule, none meeting it: contested;
    - a contesting receipt alone: pending.
  - A homeless rotation is no longer final through an escape to other homes. A late objection now voids it.
  - An escape endorsement bound to an older rotation: no escape.
  - A disowned act acknowledged only by an act of unknown status: unknown (was void).
  - Any act carrying a scheme-1, 2 or 3 signing key that is not 32 bytes: invalid (`describeAct`, `readTerms` and `readGrant` refuse such a member or grant key).
  - Text acts with one object `[signer, x]`, under Text rule 14:
    - a grant key naming anything but its grant: invalid (was scoped);
    - a member key whose signature act is not held: unknown (was invalid);
    - naming a forged record: invalid (was valid).
- **`Verifier.succession`:** a "mor" successor whose identifier is not 32 bytes: `none` (was another protocol's).
- **`agreementsPurchase`:**
  - Shape unchanged.
  - "not a payment for a work" now answers where only terms nobody (or only the drafter) signed stake the work (was "no-purchase"), and for a tip or debt payment naming a claim (was purchase).
  - "no-purchase" for a purchase whose line is a fork, closing or release carrying none of its agreement's claims (was purchase).
  - "unknown" where whether the claiming terms exist rests on an act not held.
  - Inputs: the terms held and their signatures; field 5 of the receipt or claim; the line named in field 9.
- **`agreementsPaid`:**
  - 0 for records of one payment naming different debts with no shared batch, until the receiver's receipts name one.
  - Nothing for a receipt or claim whose rail Module (field 0) is not one the pointer named in `specs.railValid` names.
  - Inputs: `specs.railPayments` (which payment each proof is), `specs.railValid`, and the pointer acts held.
- **`agreementsOwedBack`, `agreementsClosing`, refunds:**
  - A refund to the refund rail is judged as the payer's chain stood: a later lowered limit, unanchored, no longer undoes it.
  - A refund shown by a receipt under a revoked grant is not repaid.
  - The rail Module check above applies.
- **`agreementsConsent`, `agreementsBacking`:**
  - A member key, or a collective grant's acceptance, that an act of the collective placed counts after the holder's rotation disowns it (was not counting).
  - A grant-key receipt for a layer's share is refused where the rail answer places the money at the service's own held pointer or vault entry.
  - An act a revocation or ending made void binds where the grantor's own claim pays on it.
- **`agreementsAgreement`:**
  - A deal whose party is an agreement not held now throws `Missing` (was `exists: false`).
  - A succession clone placing the successor elsewhere is now `invalid` (it was answered at the line as unsettled).
- **`agreementsSplit`, `agreementsServiceAccount`:**
  - Splits are judged against holders as transfers left them (`mismatched` moves both ways).
  - A split that does not sum leaves its receipt in `unsplit`.
  - A seller's own receipt after an over-sale pays its payout (no `owedToBuyers` entry).
- **The Money binding (`moneyJudge` and the rest):** unchanged in shape. The key-length rule refuses a payer or anonymous key that is not 32 bytes for its founding scheme.

**Unchanged:**
- `decodeSpec`: it uses `Spec::decode`. The Development fix is in `Spec::decode_judged`, which no binding calls.
- Every function that only encodes or decodes.

## The releases rebuilt

*(to be completed)*

## The box

*(to be completed)*

## Checks run

*(to be completed)*

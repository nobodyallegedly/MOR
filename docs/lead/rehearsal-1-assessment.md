# The first freeze rehearsal: the MOR lead's assessment of the cases against the core

*The MOR lead, overnight 6 to 7 November 2026, from the texts at `af2ed6f8` (Identity 15, Text 11, Envelopes 11, Money 13, Agreements 23, Development 11, MICS v36, freeze test suite v36, default control cMIP draft 6) and the ten players' `beef-with-the-core.md` and `relationships.md`. Fable assesses the same cases independently, in parallel; the two are compared in the morning. Finding F435. Nothing here is decided: decisions marked for Nobody, allegedly, are his; the rest are the MOR lead's under delegation, to be written only after the comparison.*

## In plain words

The players found no crack in the shared language itself. What they found sits almost entirely in two places: **the way out** (six cases where leaving, rotating or escaping can undo what someone else relied on) and **money that has nowhere to come from** (a broken vow's refund; a sliver sold to a deal that opens a collective's books). Both are real and both must be settled before the freeze. Around them sit about twenty precise fixes the MOR lead can make under delegation, a dozen sentences of wording or stated cost, and two cases that are a Module's job.

Nine decisions belong to Nobody, allegedly: six on the way out (A to F) and three on grammar (G, H, K). Each comes with a lean. With them made and the delegated list written, the MOR lead's view is **ready to freeze after one more text pass and its vectors**, not before.

## Marks

- **change before the freeze**: a contradiction, a broken or missing guarantee, missing grammar, a way-out gap;
- **stated cost**: the core is right not to promise more, and says so in one place;
- **a cMIP's or Module's job**;
- **misreading**: the sentence that answers it is quoted.

## 1. The way out (decisions for Nobody, allegedly)

**A. A home operator's rotation voids its customers' receipts.** Counterparty C4, Keep 1, Longhouse 1; Postmark by analogy for keepers. *Change before the freeze.* Identity's receipt check 5: "A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary." A receipt under a cosigned summary is already safe; one without is not, so what a customer's own counted rotation established can be undone by someone else's later act. Blocks freeze step 5.7c as written. **Lean:** receipts resting on a customer's rotation that counted are never voided by the operator's later rotation; a forgery still needs the owner's chain key, so nothing is lost in safety. Cost: one sentence in Identity, one vector.

**B. A rival rotation that drops the audit requirement wins.** Counterparty C5, Keep 2, Longhouse 4. *Change before the freeze.* The homeless path already judges "those in effect before the homeless rotation"; the ordinary path does not, so the weaker branch can win. Blocks freeze step 5.7d. **Lean:** judge a rival rotation under the stricter of the requirement it declares and the one in effect before it, as the homeless path does. Cost: one clause, two vectors.

**C. An escape unmakes what others relied on.** Counterparty C2, Keep 3, Postmark 1, Ampersand 7. *Change before the freeze*, and a real choice between the buyer and the robbed owner. Identity says "the escape then wins"; it does not say what it wins over. **Lean:** what others relied on before the escape stands (completed transfers, debts, keeper records); the escape evicts the thief from then on; the robbed owner's loss in the window is a stated cost. The other reading (the escape unwinds everything since the theft) protects the owner fully and makes every receipt provisional for ever.

**D. The absence clause can be rewritten to take an outside holder's stake.** Counterparty C3, Plain Words 2. *Change before the freeze.* Rule 48 protects a non-party holder from reductions; the absence clause is not covered, so a later clause can reach a stake bought under an earlier one. **Lean:** a change to the clause binds a non-party holder only if it accepted it, as under rule 48; otherwise the clause in force when it acquired its share applies to it. Cost: one sentence, one vector.

**E. A present split service or partner can block its own replacement.** Hop H7, Plain Words 7. *Change before the freeze* (a way-out gap: the owners' side cannot leave a service that refuses to sign). Today: "every party signing it, the new service among them". **Lean:** Plain Words' version. The default is unchanged; a publication may name in advance a rule letting the owners' side replace a partner or service, or end the publication, the departing party owed what it is due. Cost: one optional field's meaning, one vector.

**F. Closing with pending conditional obligations.** Plain Words PW-5, The Back Row 4, Backlot 1, Ampersand 6. *Change before the freeze.* The closing counts what is owed; a conditional obligation is neither owed nor not. **Lean:** it counts as owed until the condition is shown failed. Cost: one sentence; closings with open conditions take longer.

## 2. Grammar (decisions for Nobody, allegedly, with Fable)

**G. A broken vow's refund has nowhere to come from.** Hop H1, Plain Words 1 and PW-3, The Back Row 2, Backlot 2. The most convergent case of the round. *Change before the freeze* or a stated cost; there is no way today to write money held against a promise. **Options:** (1) a held share on a condition, paid to the owners when the vow is kept or back to the payer when it is broken; (2) a stated cost: refunds come from the payee's other money or not at all. **Lean:** (1), the smallest grammar that makes the vow mean something; it reuses rule 9's shares and F's "owed until shown failed".

**H. A sliver sold to a deal makes the collective's books public.** Counterparty C12 and C14, Ampersand 1 and 2, The Back Row 3, Plain Words 3. Blocks Ampersand's founding. The text: "where a holder is a deal, the act is public". *Change before the freeze.* **Options:** (1) "already pays" reads through nested holders, as rule 15's layers do, so a deal holder sees what its parties see; (2) a deal holder is sealed to the parties of the version it names. **Lean:** (2): it keeps the public case for deals that truly are public and costs one sentence.

**K. Who may read a claim is ambiguous.** Pointer P8, The Back Row 1 and 6, Counterparty 9. Today: "or public, as rule 57 says". *Change before the freeze* (two builders read it two ways). **Lean:** the payee as rule 16 names it (the split service), plus whom the buyer chooses; never "public" by default. This reverses the design note of 23 October, so it is his.

## 3. Mine under delegation: change before the freeze

- **I.** A fee entry names its receiver (`fee = [ module, part, ? scope ]` names none). C1, Ampersand 4.
- **J.** The default control cMIP is pinned by hash wherever the core names it; "holds the default control cMIP" names it only by role. Plain Words PW-1, Pointer 7; a proxy can otherwise substitute a model.
- **L.** Rule 9 against rule 20 on split delivery ("It delivers the split to every holder and partner it pays"): one reading. Hop H10, C15. Settled with Fable's view.
- **M.** A payer has standing to contest a metric record (rule 54). C13, Ampersand 5, The Back Row 5.
- **O.** An unmeasured metric share follows the plan's unfilled-role option. Hop H5.
- **Q.** A replaced service's tag counts only for the version in force for the payment. Hop H8.
- **R.** Vectors for role shares, metric and use records; the batch total checked in code. Hop H9, Pointer case 2, C16; freeze step 7.4, scenarios 134 and 230.
- **S.** A record naming a rail never listed is set aside. C6.
- **T.** The refund rail's cap is a total per claim. C8.
- **U.** Field 13 includes the amount; the code ends the disagreement at a matching receipt. C10.
- **V.** Field 10 worded as a verdict or a stated cost; the binding reads from bytes (the suite's). C11.
- **W.** A model change ends grants resting on the old model. C17.
- **X.** Freeze step 5.2 fixed; the bare-bake refund named. C7.

## 4. Wording and stated costs (mine)

- **Z.** Omission by a home is unprovable: one stated cost, in one place; rules 19 and 20 marked as client conformance. C15, Keep 7, Longhouse 2, Backlot 5.
- **AA.** An auditor is any declared identity (the check's reading). Keep 4, Longhouse 3, Postmark 4.
- **AB.** A collective is never a confirmed successor. Keep 5.
- **AC.** Confirmation obliges no client to follow at once. Keep 6.
- **AD.** Keepers and homes pass by rotation, not by succession. Postmark 3, Longhouse 5.
- **AE.** A keeper's successor never shows "missed" before it took over. Postmark 2.
- **AF.** A publication's keepers line, said once. Postmark 5.
- **AG.** "Not before" in rule 33. Postmark 6.
- **AH.** The keeper sequence holds only keeper records. Postmark 7.
- **AI.** The keeper definition aligned across texts. Postmark 8.
- **AJ.** A stake successor is never the holder itself. Plain Words 6.
- **AK.** "Salt: unpredictable", said plainly. Pointer 4.
- **AL.** The signer is shown the specification's creator and hash. Pointer 5.
- **AM.** Members see the mix of a collective's money, not each line: stated cost. Ampersand 8, Backlot 6.
- **AN.** A holders' rule may bind release on leaving. Ampersand 9.
- **AO.** Hop H4: the text says what the code does.
- **AP.** Hop H2: a pointer in rule 18.

## 5. A cMIP's or Module's job

- **N.** A payer-measured metric (Hop H3, Ampersand 3, Backlot 3): a Module's job now, open to anyone; a MOR 2 option if it proves common.
- **P.** A relay's role share under access (Hop H6): a stated cost; a partner share does it today.

## 6. Accepted by every player as stated costs

A lost chain key is permanent; a home's omission is unprovable (Z). No player asked for either to change.

## 7. What blocks a freeze step

*Steps are written scenario.step, as the players cite them: 5.7c is scenario 5 ("A nym journalist"), step 7c.*

- **5.7c** (receipts across a home's rotation): blocked as written; passes with A.
- **5.7d** (a rival rotation): blocked; passes with B.
- **5.2**: wrong as written; fixed by X.
- **7.4** and scenarios **134, 230**: not blocked in the texts, but no vectors exist; R makes them pass in code.
- Ampersand's founding (not a suite step): blocked by H.

## 8. Which cases hold up a market

From the relationships pages, the links several players say they **cannot do without**: the two DAOs with Hop (split service) and Plain Words (drafting, the default cMIP); Pointer with the DAOs and Counterparty; Keep with the DAOs and Longhouse; Longhouse and Postmark as keepers A and B.

- Under the whole market: **G** (every DAO-to-Hop relationship), **E** (Hop and every partner), **J** (every collective on the default cMIP), **A, B, Z** (every home and keeper relationship, Longhouse and Postmark), **C** (every buyer).
- Under one deal: **H** (Ampersand's founding), **K** (Pointer's claim screens), **N** and **P** (Hop's pricing).

Read together, the ties players cannot do without form three knots that barely touch: **the money** (the two DAOs, Hop, Plain Words), **keeping** (Longhouse, Postmark, Keep) and **trust** (Pointer, Counterparty, The Back Row). Hop is named indispensable by Ampersand, Backlot and Plain Words, and every one says no second split service exists; that is why **E** weighs more than its size: as written, a present service can refuse the version that replaces it.

The rules most relied on across relationships: rules 22, 33, 38, 42, 47, 57 and the abandonment clause. Four of these carry an open case (33 by AG, 42 and 47 by A and E, 57 by K).

## 9. Where the players are wrong

- **Longhouse 5 and Postmark 3** ask for keepers and homes to pass by succession; the texts already give them rotation, which carries everything they need. Wording only (AD).
- **Keep 5** reads that a collective may be a confirmed successor; it cannot (AB): misreading, answered by a sentence made explicit.
- **Ampersand 8 and Backlot 6** want each member to see every line of the collective's money; that would undo what sealing is for. Stated cost (AM).
- **Hop H3** asks the core to measure for the payer; measurement is a Module's job (N).
- Several players called **omission** a broken guarantee. The core never promised it; it can only be stated (Z).

## 10. The shortest list before the freeze, by weight

1. A: an operator's rotation never voids a customer's counted receipts.
2. C: what others relied on stands after an escape (his choice).
3. B: a rival rotation is judged under the stricter requirement.
4. D: the absence clause binds a non-party holder only by its acceptance.
5. E: an advance rule to replace a partner or service.
6. G: a held share on a condition (his choice).
7. H: a deal holder sealed to its parties.
8. F: conditional obligations count as owed.
9. K: claim readability: payee and buyer's choice.
10. J: the default control cMIP pinned by hash.
11. I, M, O, Q, S, T, U, V, W, X: precise fixes, one sentence each.
12. R: the missing vectors.
13. Z to AP: wording and stated costs.

**Cost of the whole list:** about thirty sentences across Identity, Agreements and Money, one optional field's meaning (E), one small grammar (G), and some fifteen vectors. No layer added, no rule removed. One text pass and one code pass.

**View on the freeze:** not ready as rehearsed; ready after this list, its vectors and a short second rehearsal on steps 5.7c and 5.7d.

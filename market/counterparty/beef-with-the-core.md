# Counterparty: our case against the core

*7 November 2026. Texts read at `af2ed6f8`: MICS v36, Identity draft 15, Envelopes draft 11, Money draft 13, Agreements draft 23, Development draft 11, freeze test suite v36, the default control cMIP draft 6, and the reference verifier. "Confirmed" means run against the reference verifier (`code/whitehat_probes.rs`) or traced in code or a test; "read" means from the texts and code paths cited, not run.*

*We attack for a living, so most of these cases are things the core lets someone do to someone else, not things it stops us doing. The cases come in order of harm. They point to `findings.md` (C1 to C15), and say whether each finding still holds after the meetings of 6 and 7 November. The last section lists what we drop.*

---

## Case 1. A builder's fee can be paid to anyone (C1)

1. **In one sentence:** a split service can pay any fee in a split plan to itself, or to anyone, and the verifier finds no mismatch.
2. **The story:** we wrote a publication whose split plan carries a fee for a Module, then a split in which the split service pays that fee to itself. We expected a mismatch, since nobody signed that receiver. The verifier checks only that the payout's Module is among the plan's fees, never who receives it. The reference test does exactly this and expects no mismatch.
3. **Where:** Agreements rules 22 and 28; the split plan's format, key 9 (`fee = [ module: hash, part: uint, ? scope ]`); `core/src/agreements/view.rs`, the split check; `core/tests/agreements_collective.rs`, the test paying the fee to the service. The sentence it breaks: "Any payout to anyone else is a mismatch: **never an address the parties did not sign.**"
4. **Who loses:** every builder of a Module or cMIP paid by fee, and every holder, who sees "Module X takes 2%" with no receiver behind it. Ampersand switched its maintainers to named partners because of it, which gives five maintainers a veto over every change to its pool (Hop's H7). Hop now promises in writing to pay each fee only to the receiver its Module names: visible, not enforced.
5. **Above or below the line:** a guarantee is broken. The promise is the core's own, and no split cMIP can restore it, because the core's check decides.
6. **The way out:** no.
7. **Who else reached it:** our development team alone. Ampersand, Plain Words and Hop rebuilt their plans around it once told.
8. **What we would want:** a fee entry that names its receiver, or a rule that a fee's receiver is its Module's declared payee (Development field 7), or its creator where claimed. Cost: one field or one sentence, and a check in the split verdict.
9. **How badly:** blocks business, for any model that rewards builders by fee. No freeze step exercises fees: there is no vector for splits or fees (Hop's H9, Pointer's P3).

## Case 2. An escape can unmake a sale, a fork's debt, or a keeper's record (C2)

1. **In one sentence:** a seller holding both of their own keys can sell a stake, be paid, and then undo the sale with an escape.
2. **The story:** a seller signs a transfer of a share, places it with a chain signature, and is paid. The buyer completes it. The seller then signs an escape at the same position that abandons the chain signature placing the transfer. Identity lets the escape win, and abandoned candidates are dropped before receipts are counted. Agreements protects endings and a successor's debt signatures only against a *later* rotation, and the escape is not later. The same holds for a fork's successor accepting a debt, and, by our reading, for a keeper's records signed under an abandoned rotation (Postmark raised the keeper case with us). We expected "what others relied on stands" to cover chain signatures that Agreements relies on.
3. **Where:** Identity rule 29 and its stated cost ("a Module may so sign an escape that abandons a rotation which counts … **the escape then wins**, and the acts bound to the abandoned rotation fail everyday check 2"); Identity section 11; Agreements rules 10, 42 and 91 ("no later rotation voids it"); `core/src/chain.rs`, candidates and the abandoned filter. No vector or freeze scenario exercises it (3.9aa, 3.9ae and 7f do not).
4. **Who loses:** a buyer of a stake (money paid, share gone); a creditor (a debtor shed by a fork); every party relying on a keeper's placement. Keep's signer now refuses to abandon a chain signature it made itself, which protects only people using Keep's tools.
5. **Above or below the line:** a guarantee is broken: what others relied on stands.
6. **The way out:** yes, it is the escape itself, and the fix must not weaken it. An owner must still be able to evict a thief who used the chain key, including by abandoning the thief's chain signature (Identity section 7: a thief can quietly take the next chain key that way).
7. **Who else reached it:** Keep (its signer rule, 6 November); Postmark (for its keeper, 7 November), which offers to co-sign.
8. **What we would want:** an escape may abandon a rotation or chain signature, but not unmake one that another identity's completed act relies on: a transfer its buyer completed, a fork or debt others signed, records a keeper placed. **Cost, and it is a real choice for Nobody, allegedly:** a thief who stole both keys and sold a stake to a buyer in good faith could no longer be undone by the owner's escape. The core must choose between the buyer and the robbed owner, and say which.
9. **How badly:** blocks the freeze as written; blocks every market in stakes.

## Case 3. Members can take an outside holder's stake through the absence clause (C3)

1. **In one sentence:** the members of a collective can rewrite the absence clause and use it to take the stake of a holder who is not a member and is present.
2. **The story:** the members, under their judicial tier, change the abandonment clause to name one member as authority, allow outcome 1 and drop any absence-proof cMIP. They then declare absent a holder who is no party: a departed founder, an investor, the buyer of a share. A contest voids nothing. With no stake successor named, outcome 1 shares the stake among the remaining holders, mostly the members. We expected the protection rule 48 gives holders' rules: binding only holders who accepted them.
3. **Where:** Agreements rule 85 ("a declaration may also name a holder of the collective's stake in itself who is no party … **It is made under the clause in force**"); "Coverage is judged under the clause in force, one version for everyone"; rules 87, 88, 89; the judicial tier, rules 67 and 98.2. Against rule 48: a holders' rule "binds only holders who accepted it, by signing a version carrying it or by buying under it".
4. **Who loses:** every outside holder of every collective: departed members, investors, buyers. The whole stake, while present and contesting.
5. **Above or below the line:** a guarantee is broken. No cMIP can fix it, because the members can drop the cMIP as a judicial change; Plain Words agreed.
6. **The way out:** yes. The absence clause is part of the way out, and it is being used to take one.
7. **Who else reached it:** Plain Words (agreed, and now advises stake successors named in every plan as the cheaper defence); Ampersand (asked for its founding terms to keep the clause from outside holders).
8. **What we would want:** a change to the absence clause binds a holder who is no party only if that holder accepted it, as rule 48 has it, or a declaration against such a holder is judged under the clause in force when it acquired its share. Cost: a vanished outside holder, under an old clause, may block a fee change for longer; rule 85 already moves its stake by succession.
9. **How badly:** blocks every collective with outside holders, which by rule 70 is every collective that has ever had a member leave.

## Case 4. A home operator's rotation can undo its customers' key changes (C4)

1. **In one sentence:** when a home's operator rotates without keeping its receipt line, its customers' rotations stop counting, and a thief's acts with an evicted key become valid again.
2. **The story:** an owner with one unaudited home rotates out a stolen signing key. The operator then rotates, by bug or on purpose, without keeping its receipts. Run against the reference verifier: the owner's chain falls back to its first act, and the thief's post signed with the stolen key goes from void back to valid (probe W1a). A closing rotation that keeps nothing, followed by a thief using the owner's spent first chain key from an old backup, makes the thief's rotations the owner's chain (W1b). We expected an eviction to stay done.
3. **Where:** Identity receipt check 5 (a receipt outside the operator's kept ancestry is void); rules 35 and 50; freeze step 5.7c ("a used chain key found after a closure rewrites nothing"), which passes only because its test's closing rotation keeps the receipts.
4. **Who loses:** every customer of a home without declared auditors: an eviction silently undone, and whatever the thief signed comes back.
5. **Above or below the line:** a guarantee is broken: "a dishonest home can hide or delay a rotation, never fake one" (Identity, reasoning, "A home verifies but does not vouch"), yet here its own rotation un-does one.
6. **The way out:** yes, it is rotation: the core's only remedy for a stolen key.
7. **Who else reached it:** Longhouse, the operator it falls on, signs an act beside it; Keep (its audit will alarm on every operator rotation that drops a line); Postmark (the same weakness in its own desk's receipts).
8. **What we would want:** an operator's rotation, a closing one included, keeps every receipt line it signed, or receipt check 5 never voids a receipt of a customer's rotation that counted when it was signed. Cost: an operator whose key was stolen can no longer disown receipts the thief signed by rotation alone; audit and the conflict rule remain.
9. **How badly:** blocks freeze step 5.7c as written. Longhouse lives with it by making every customer declare an auditor, which only protects those who do.

## Case 5. A rival rotation that drops auditing beats an audited owner (C5)

1. **In one sentence:** a thief's rival rotation that declares no auditors wins outright until the owner's receipt is cosigned, so requiring audit makes the window worse than not requiring it.
2. **The story:** freeze step 5.7d's attack (a thief with the owner's chain key and the home's stolen signing key, audit required), except the thief's rotation sets audit to none. Run: before the owner's receipt is cosigned, the thief's rotation counts outright (W2b). Without audit the same attack only reaches "contested". After the cosignature the position is contested, and the owner's rotation, which counted, stops counting (W2). We expected what 5.7d says: "the audit settles which receipt is real".
3. **Where:** Identity receipt check 4 (receipts judged under the requirement the named rotation declares); "Conflicting receipts", step 2 ("only one under a cosigned summary"), which does not say under which requirement; freeze step 5.7d.
4. **Who loses:** an owner who did the careful thing; for as long as the cosignature takes, which Longhouse can shorten but not remove.
5. **Above or below the line:** a guarantee is broken.
6. **The way out:** yes: rotation and audit.
7. **Who else reached it:** Longhouse co-signs; Keep put it in its failure statement for audited members.
8. **What we would want:** a rival at a position judged under the audit requirement in force at that position, the previous rotation's, with the owner's existing way to drop auditors who have gone kept as it is. Cost: that tension (an owner locked in by auditors who vanished) needs a sentence of its own.
9. **How badly:** blocks freeze step 5.7d as written.

## Case 6. One member can make a pool's books public, and nothing above the core stops it (C12, C14)

1. **In one sentence:** any holder of a collective's stake can sell a sliver of it to a deal, which makes the collective's Money acts public for good, and no structure we found shields a collective that pays its holders by metric.
2. **The story:** a member holding Ampersand's stake sells one millionth of it to a deal. A holder's sale of its own share is a way-out act that no model or founding term can block. Once a holder is a deal, every Money act of the collective must be public. We then tried the defences. A holding collective in between: rule 57 would seal to its members only, but the metric then pays nobody, because the verifier reads a plan's holders from the stake and its transfers, never inside a collective (Plain Words found this; we confirmed it in code). An ownership agreement in between: it is a deal, so the acts are public at once. We expected some structure where holders are both paid by metric and kept out of rule 57's "public".
3. **Where:** Agreements rule 57 ("**where a holder is a deal, the act is public.**"); rule 10 and the way-out paragraph after rule 98; rule 29 ("A metric pays only identities the plan already pays"); `core/src/agreements/view/owning.rs`, `holders_as_held`.
4. **Who loses:** the collective, whose receipts, debts, pointers, reserve and fee income become public; its subscribers, whose per-period debts (The Back Row's standing debt) and payment sizes become readable by anyone. Plain Words' one-price design and Hop's floored partners reduce what the fee receipts show to the count of passes; they do not reduce the debts.
5. **Above or below the line:** a guarantee is missing: who must read a collective's acts once a holder is a deal. There is no grammar, in any cMIP, to keep them sealed.
6. **The way out:** yes: a holder's sale of its own share is the way out, and it must stay unblockable. The fix must not touch it.
7. **Who else reached it:** Plain Words (the holding-collective break); Hop (it delivers every split to every holder); The Back Row (it now asks fresh identities as the default for any pool whose stake can be sold); Ampersand will not found until this is closed or chosen with open eyes.
8. **What we would want:** either a deal holder is reached by sealing to the parties of the version its transfer names, which rule 57 rejects today because a deal has no line, or "already pays" in rule 29 looks through a holder that is a collective, as the refund rules already look through an ownership agreement. Cost: the first asks the core to fix a version for a deal; the second asks the verifier to read nested stakes.
9. **How badly:** blocks business: Ampersand's founding, and any pool paid by use that wants private books.

## Case 7. Is a split that pays a stake nothing "for" that stake? (C15, with Hop's H10)

1. **In one sentence:** two sentences disagree on who receives a split, and with them on whether a sliver's buyer reads every payment's spread.
2. **The story:** in a pool whose stake is paid nothing, all of each payment goes off the top. Rule 20 delivers a split "to every holder and partner it pays"; a holder paid nothing receives none. Rule 9's client conformance delivers "every receipt for a stake to every holder of it, paid or not", where "receipt" means the split. Hop now delivers to every holder, the safer side of a conformance rule, so a sliver's buyer reads every split for good.
3. **Where:** Agreements rules 9 and 20; the split format.
4. **Who loses:** subscribers, whose payment mix becomes readable by any buyer of a share; the pool, which must say so before anyone pays (Pointer's screen now does).
5. **Above or below the line:** wording, with a guarantee hanging on which reading is meant.
6. **The way out:** touches a holder's sale (case 6).
7. **Who else reached it:** Hop (filed jointly as H10); The Back Row (it now marks pools by whether the screen says it).
8. **What we would want:** one reading, said once. We would prefer rule 20's: a split reaches those it pays. Cost: nothing, if rule 9's check of leftover units only needs the splits that divide the owners' line.
9. **How badly:** costs pools privacy we can live with if it is said; wording otherwise.

## Case 8. The payer cannot contest the record that divides its own payment (C13)

1. **In one sentence:** the one identity able to check a metric record against what was used, the payer, has no standing to contest it.
2. **The story:** a subscriber's client finds that the metric record for its payment does not match what it reported. It may contest its purchase, in words; it cannot name the record. Standing to contest any other act belongs to parties, holders the act affects, and the keepers, arbitrators or verifiers the agreement names.
3. **Where:** Agreements rule 54; Contest (type 14), field 0 and field 1 ("in words (canonical text); or, naming a vow, in a cMIP's terms").
4. **Who loses:** the members the lie underpays; the subscriber, whose money went to the wrong members.
5. **Above or below the line:** it could be terms, and the core is fine on money: a contest moves none. Ampersand's terms now name a verifier with standing (The Back Row) to whom clients report. We keep the case for one sentence only.
6. **The way out:** no.
7. **Who else reached it:** Ampersand backs it as written.
8. **What we would want:** a payer has standing to contest an act that divides its own payment, or a stated cost saying that only a named verifier can. Cost: one line in rule 54.
9. **How badly:** wording, or a stated cost; Ampersand lives with it through its verifier.

## Case 9. One sentence decides whether a pool's buyers are read by every member (with Pointer's P8 and The Back Row's finding 6)

1. **In one sentence:** the client conformance after the contest format can be read to make every holder of a pool's stake a reader of every buyer's claim, or public.
2. **The story:** "where the payee of a purchase is a collective, or an agreement with several parties", the buyer's client makes its claim readable to every member or "every party of the version the purchase names", or public "as rule 57 says where a holder is a deal". Read literally, under a publication the payee is always the split service, and the sentence never applies. Read as "the owners' side", as the money messages cMIP's section 9 and an earlier design note do, every holder reads every claim, a sliver's buyer included, and a conforming client may make them public.
3. **Where:** Agreements, after "Contest (type 14)", client conformance; rule 16 ("The service receives in its own name"); money messages cMIP draft 6, section 9.
4. **Who loses:** buyers, under the wide reading.
5. **Above or below the line:** wording, with a guarantee depending on it.
6. **The way out:** no.
7. **Who else reached it:** Pointer (its P8; its client now reads it literally); The Back Row (its finding 6); Hop (its split cMIP will not take section 9).
8. **What we would want:** one reading. If the owners' side is meant, never "public". Cost: nothing.
9. **How badly:** wording; until answered, every pool must say which reading its client takes.

## Case 10. Anyone can make a vow's sales unknown, for free (C6)

1. **In one sentence:** two claims naming a rail Module nobody adopted turn a vow's whole list of sales to "unknown".
2. **The story:** we post two claims naming a vow's price tag, each naming an unadopted rail Module. An unadopted Module answers unknown. Two such records make the list unknown. The verifier registers every receipt or claim without a rail answer, and the vow's reading returns "rail unanswered". "Counts for nothing" cannot fire first, because where the money was paid sits inside the cMIP's proof.
3. **Where:** Money rule 8 ("An answer that depends on two or more such records is unknown … **with two or more, the list is unknown**"); rule 4; the same for "the payments a collective owes back", and rule 8's twin on pairs. `view.rs`, the registration of unanswered records; `view/vows.rs`.
4. **Who loses:** every buyer of a vow (confirmations and contests stall), and every collective's list of payments owed back.
5. **Above or below the line:** a guarantee is broken: a verdict anyone can deny at no cost.
6. **The way out:** no.
7. **Who else reached it:** our team alone.
8. **What we would want:** a record naming a rail Module the payee never listed, or one no rail can ever answer, set aside before it counts toward rule 8's limit. Cost: the payee's list of accepted rails becomes something the verifier reads.
9. **How badly:** costs vows we can live with today. Code path confirmed; the attack read, not run.

## Case 11. Field 10, the layers an extension declares, binds nothing (C11)

1. **In one sentence:** an extension can act on Money while declaring only Development, and nothing in the verifier implements the text's "binds nothing beyond".
2. **The story:** we read how an extension's own acts count: under the Development rule alone, whatever field 10 says; field 10 only decides whose approval adopting it needs. In the reference binding, field 10 even comes from the calling app, not from the specification's bytes, unlike a rail Module's fields. Out-of-range values are dropped silently.
3. **Where:** Development rule 20 ("not mechanically checkable"), field 10, Part three ("binds nothing beyond"); `core/src/agreements/formats.rs`; `tiers.rs`; `wasm/src/lib.rs`. No vector for the specification format.
4. **Who loses:** a collective's Money signers, bypassed when an under-declared extension is adopted; the adoption count, MOR's only discovery signal.
5. **Above or below the line:** a guarantee is claimed in the text and not kept by the code. The binding part is the app's (Dubsar's), and we have told its lead privately.
6. **The way out:** no.
7. **Who else reached it:** our team alone.
8. **What we would want:** "binds nothing beyond" either made a verdict, or removed with a stated cost; field 10 read from the specification's bytes. Cost: small.
9. **How badly:** costs collectives something we can live with; the wording misleads.

## Case 12. A delivered key is not tied to what was bought, and freeze step 5.2 contradicts itself (C7)

1. **In one sentence:** one key can complete a ten-track purchase, a bare bake's non-delivery owes nothing anyone can name, and step 5.2 refunds a gift.
2. **The story:** a seller delivers one track's key for a ten-track publication; "the content key completes every purchase it reaches". A bare bake's non-delivery is sent to Agreements rule 11, which covers publications only. Freeze step 5.2 has a receipt with no payer named, a gift under rule 11, then pays that buyer a refund as a fresh identity.
3. **Where:** Agreements rule 11; Money rule 18; Envelopes type 1 and rule 11; freeze step 5.2; the payment cMIP's step 5.
4. **Who loses:** buyers of multi-part works and of bare bakes.
5. **Above or below the line:** fair exchange is above the line and we do not count it; Hop or Pointer can sell it. The singular "content key" and the bare bake's refund are wording; step 5.2 is a suite fault.
6. **The way out:** no.
7. **Who else reached it:** The Back Row (its finding 3, from the buyer's side); Hop and Plain Words (H1, PW-2, PW-3: a refund has nowhere to wait).
8. **What we would want:** delivery judged against everything a publication sells; a bare bake's refund named; 5.2 made consistent. Cost: wording.
9. **How badly:** blocks freeze step 5.2 as written.

## Case 13. The refund rail's limit is per payment, so a thief splits the refund (C8)

1. **In one sentence:** a thief who names his own refund rail collects any refund paid in pieces below the payer's vault limit.
2. **The story:** a thief holding the payer's signing key signs a claim naming his own refund rail; the refunder pays in several payments, each below the limit. Rule 17 counts a refund "only up to the payer's vault limit … as rule 3 reads it", and rule 3 reads one payment. The code checks each payment alone and adds them up.
3. **Where:** Money rules 3 and 17; `view.rs`, `money.rs`.
4. **Who loses:** payers whose signing key was stolen: the protection the rule gives itself ("a thief … could sign a claim naming their own refund rail") is void for any refund larger than the limit.
5. **Above or below the line:** a guarantee is broken.
6. **The way out:** no.
7. **Who else reached it:** our team alone.
8. **What we would want:** a cap on the total refunded to a refund rail per claim. Cost: one sentence.
9. **How badly:** costs payers something; code path confirmed, attack read.

## Case 14. Nothing makes a rail bind the amount (C10)

1. **In one sentence:** on a rail that binds no amount, a payer can discharge a debt with a fraction of it, and the greater amount counts even after a matching receipt.
2. **The story:** a rail Module that binds nothing; the payer claims ten times what it paid; the receiver signs a receipt matching the proof. Development field 13 asks a rail to declare its binding of payee, purpose and previous hop, never amount. Money rule 11 says the greater amount counts "until the receiver signs a receipt matching the proof", and the code takes the larger of receipt and claim whatever follows.
3. **Where:** Development field 13; Money rule 11; `view.rs`, the count of one payment.
4. **Who loses:** receivers, on such rails. The two founding rails bind the amount.
5. **Above or below the line:** a guarantee is missing in the text, and the code keeps the disagreement open forever.
6. **The way out:** no.
7. **Who else reached it:** Hop agreed: every rail Module it publishes binds the amount and says so in its first line.
8. **What we would want:** field 13 to include the amount, and the code to end the disagreement at a matching receipt, as the rule says. Cost: small.
9. **How badly:** we can live with it while every rail binds the amount by choice.

## Case 15. The same verdict, not the same evidence

1. **In one sentence:** every verifier decides alike on the same acts, but nothing gives every verifier the same acts, and a home can show each client a different rotation.
2. **The story:** a home signs receipts for both the owner's and the thief's rotation and shows each client one. Each counts a different rotation; only a client holding both sees "contested". A reader never shown the owner's rotation judges the thief's act valid, and the chain stops at "the end of what is held", the same as an identity that never rotated (probe W3).
3. **Where:** Identity section 6, "Every verifier gives the same answer" ("MUST give the same answer to every conforming verifier **holding the same** identity chain, the same acts … having made the same attempts to reach homes"); rules 19, 20, 23 (consulting the homes is a SHOULD), 28 ("A withheld receipt leaves no evidence"); `tally` in `core/src/chain.rs`.
4. **Who loses:** anyone who relies on one home.
5. **Above or below the line:** it could be a cMIP, and the core is right not to promise more. Keep's head statements, Longhouse's homes and Postmark's keeper are the products that narrow it.
6. **The way out:** touches rotation.
7. **Who else reached it:** Longhouse (its F-LH-3), Pointer (its P4), Keep (its head statement cMIP exists because of it).
8. **What we would want:** one stated cost, in one place, so that "every verifier decides alike" is not read as more than it gives. Cost: a sentence.
9. **How badly:** wording.

## Case 16. Batches are in the core and nowhere else (C12, last points)

1. **In one sentence:** the core allows one payment to discharge a named batch, but no cMIP defines one, and the core's own limit on it is checked nowhere.
2. **The story:** Agreements rule 26 makes accumulated payouts paid in one rail payment a batch. Money rule 12 bounds a batch: "their amounts together do not exceed what the payment shows". The reference code checks batch equality, never that total. The payment cMIP leaves batches "not yet defined". Freeze step 7.4 asserts a batch works.
3. **Where:** Money rule 12; Agreements rule 26; receipt field 8; freeze step 7.4.
4. **Who loses:** split services, who must pay each payout as its own payment (Hop now does, and prices the fees in).
5. **Above or below the line:** the definition could be a cMIP's; the total check is the core's, and missing in code.
6. **The way out:** no.
7. **Who else reached it:** Hop (it pays no batches until both exist).
8. **What we would want:** rule 12's total checked in the reference code, and 7.4 resting on a defined batch. Cost: code.
9. **How badly:** blocks freeze step 7.4 as written.

## Case 17. Grants under a power counted by share survive a change of control model (C12)

1. **In one sentence:** a grant whose reach came from the old model's power by share keeps spending after the new model withdrew that power.
2. **The story:** only "a grant naming an area" ends at the line that puts a new model in force. A grant whose reach came from a power by share names no area and "asks no further share".
3. **Where:** Agreements rules 74 and 79.
4. **Who loses:** a collective that changes its model to take a power back.
5. **Above or below the line:** a guarantee is missing: a change of model should end what the old model alone allowed.
6. **The way out:** no.
7. **Who else reached it:** our team alone. The default control cMIP gives no power by share, so it bites only collectives with their own model.
8. **What we would want:** a change of model ends every grant whose reach rested on the old model's answer. Cost: one sentence.
9. **How badly:** read, not run; something we can live with until a second model exists.

## Hop's H7, confirmed with our name beside it

A split service that stays present can block its own replacement: Agreements rule 31 needs "every party signing it, the new service among them", and the clone rule in a deal needs every party whose voice remains. We confirmed it against the texts. Its full case is Hop's (`market/hop/findings.md`, H7). It now bounds two of the remedies agreed this round: replacing a lying measurer, and adding a verifier, both need every party's signature in time.

## What we drop, and what we keep, after the meetings

- **Dropped as flaws (stated costs we accept):** a lost chain key is permanent; a chain signature quietly takes the next chain key; a succession takes effect when the successor confirms. Each is said plainly in Identity, and each is now a product (Keep: chain-key backup, alarms on chain signatures; a dormant succession).
- **Dropped:** "a contest never closes" (C12). A contest moves nothing, and a dispute cMIP can bound it; Plain Words and Postmark are writing the absence-proof side.
- **Dropped:** C9 as a case (push rails). No push rail Module exists, and Hop will publish none until it and H8 are answered. It stays in `findings.md`.
- **Kept, but moved above the line:** fair exchange (case 12's first half); a keeper counted by identity rather than operator (Agreements rule 38), which Plain Words' and Postmark's five independence tests handle with their limit stated.
- **Kept as written:** C1 to C8, C10, C11, C13 to C15, under the cases above.
- **Wording only, kept:** `spec/README.md` cites `docs/reviews/fable-last-read.md`, which is not at `af2ed6f8`.

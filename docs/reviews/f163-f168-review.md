# Hostile review of F163 to F168

*7 October 2026. Written for Nobody, allegedly. This review reads decisions F163 to F168 at the end of `docs/findings/MOR-findings-log-round-2.md` and their text in `spec/` (Finance draft 6, rules 10, 10a, 12a, 14, 14a and 15; Law draft 10, rules 15a, 50 and 51; Text draft 6, the format task; Identity draft 11, the envelope section and rule 26; core v21, "Good faith"; the freeze suite v21, scenario 1), against the review they answer (`docs/reviews/f145-f162-review.md`), the rest of the core (Envelope draft 7, the long-form cMIP draft 1, the payment cMIP as Finance describes it) and the paper (`docs/paper/mor-paper-draft-2.md`, section 5.1 and the claims of 6.2). Nothing in `spec/` or the code was changed. The reviewer built none of this.*

*State of the repository: the six decisions are written into the spec on main (commits `8f7ed3e` to `7db150d`); none is built. The core library's good-faith check still implements F146 ("where both are anchored"). So "as written" means the text.*

## In plain words first

The six decisions answer the six breaks of the last review, and four of them answer well: a client that cites the latest wallet when it signs a deal (F163) does fix the two-device case; turns instead of a hash (F165) do take the tie away from whoever signs the receipt, as long as the receipt chain is honest; a floor under every format's declaration (F167) does stop a format from declaring the decimal point to be markup; and the small answers in F168 are mostly right. Two decisions changed a principle, and both of them have a hole on the side of the party who gains.

**F164 hands the owner a lever that unmakes other people's payments.** The new rule says: once the owner anchors a rotation, a payment to a pointer that rotation voided, or made under limits that rotation tightened, counts only if the owner's own receipt shows it or the payer's claim was anchored first. The decision was taken thinking of a theft. But no thief is needed. Every owner can rotate at any time with the safety key, every owner decides whether to sign a receipt, and every owner decides when to anchor. So an owner who has received a royalty payment to the flow pointer, and has not signed a receipt, can lower the limit by rotation, anchor it, and the payment no longer counts: the debtor still owes. The debtor's only defence is to have anchored its claim before the owner's anchor, and the design intent recorded in F164 is that claims are anchored *pooled*, that is, later. The honest payer loses the race every time, because the owner chooses when to start it. This is the same mechanism the decision accepted as a "stated cost" for the theft window, but it is not rare: it is every payment whose receipt the payee has not signed and whose claim is not yet anchored, at a moment of the payee's choosing. It also contradicts the double-entry promise of rule 10, that "the claim alone shows the money arrived".

**F164 also uses the word "anchored" without saying on what.** Anchoring in MOR is a Law task, named per agreement, on that agreement's time reference. A rotation belongs to no agreement; a tip belongs to no agreement. "Anchored before the rotation" compares two anchors that may sit on different references, or on none the verifier can read. Finance says it never depends on Law; rule 15 now does.

**F166 lets a party who returns defeat a declaration, but does not say what the defeat does.** The text says what was "put in force while it counted" is never undone, and names clones. It does not name the other outcomes a clause can carry: a stake redistributed, a stake transferred, obligations redirected. If those come back on the party's return, a party can vanish and reappear at will and the others can never rely on the redistribution; if they do not come back, the defeat is empty, since in a collective the line is drawn at once and in a deal the stake moves "from the declaration on". And one sentence of the declaration format still says that a declaration failing any check makes the record naming it count for nothing, which is the opposite of "never undone".

Beside these: F168's "any later act of the payee's on the agreement" lets a thief holding the signing key re-point every existing deal to the thief's wallet during the window, which F157 had closed; F163's client rule, read with Identity's routes, makes an honest client cite a thief's pointer during the same window; F165 does not say what happens when a split service's receipt omits or contradicts the previous one, so the service can reset the count; F167's floor forbids the long-form format's own quote and link markup and still misses a minus sign before a currency sign and a leading decimal point; and several sentences in the freeze suite, the paper, the core and Law's own reasoning still state the rules these decisions replaced.

What held: the two-device fix for conforming clients; the owner's own receipts on a kept line; the thief's inability to anchor backwards; turns bounded to one unit per holder over any run; the kept-declaration attack against the declaration act itself; F168's items 8, 9 (in part), 12, 13, B1, B4 and B5; the paper's claim 6.

## How findings are marked

- **BREAKS**: an attack works, or a common case does not work.
- **CONFLICTS**: two rules, or a rule and the suite or the paper, disagree.
- **UNCLEAR**: the text can be read two ways, or cannot be checked as written.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

## Does each fix answer its finding?

| Decision | Finding answered | Answered? |
| --- | --- | --- |
| F163 | 2 (two devices, two sequences) | Yes, for a conforming client; the place "where the payee's pointers are published" is not named in Finance, and the rule imports a thief's pointer in the window (finding 6 below) |
| F164 | 1 (the vault frozen per act) | Yes: F160 withdrawn, the vault applies as the chain declares it; but rule 15 does not state the protection rule 14a points to for earlier limits (finding 4) |
| F164 | 3 (the proviso excludes only the honest) | Yes as to collusion: the owner can now shut the window. No as to the principle: the lever is the owner's and works without a theft (finding 1); "anchored" has no reference (finding 2) |
| F165 | 4 (the receipt's signer chooses the tie) | Yes: the hash is gone and turns are bounded; but the receipt chain has no fork or reset rule, and the loser of a tie never holds the receipt (finding 7) |
| F166 | 5 (a kept declaration) | Yes for the declaration act; no for what was done under it in the gap, and what the defeat undoes is unstated (findings 8, 9) |
| F166 | 6 (a duo needs a third party) | Yes: the clause can count in a duo; the protection the acknowledgement gave is replaced by the period alone (finding 9) |
| F167 | 7 (a format declares its own bound) | Yes for digits, letters, marks and the minus before a digit; the floor forbids existing markup and misses common negative and decimal forms (findings 10, 11) |
| F168 | 8 to 14, B1, B3 to B5 | 8, 12, 13, B1, B4, B5 hold; 9 leaves rules 7 and 12a unchanged (finding 13); 11 reopens the window backlog (finding 5); 14 missed the freeze suite's good-faith step and the tie line (finding 14) |

---

## 1. The owner, who gains, controls the cut-off; no theft is needed. BREAKS (F164); CONFLICTS with rule 10

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 15: "A payment that followed both the pointer and the vault published on the payee's chain counts as made, even if a rotation invalidates that pointer, in either case (F164): **(a) the payee's own receipt shows it** … or **(b) the payer's word**: where the rotation is not anchored, a claim of the payer's that does not hold the rotation in its history … ; where the rotation is anchored, only a claim of the payer's anchored before the rotation (F164, replacing F146)."
- Rule 14a: "The vault and limits that apply to a payment are those the payee's chain declares, so a vault changed by a rotation, flow off included, applies at once to every payment not yet shown as made; a payment made under earlier limits is protected as rule 15 says (F164, withdrawing F160)."
- Rule 15's italic: "Stated cost (F164): an honest payer in the window, with no receipt of the payee's and no anchored claim, is not protected once the owner anchors; a client that anchors its users' payments protects them, and clients compete on it."
- Rule 10: "Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived (F64)."

**The flaw.** Every input to the cut-off is the payee's. The payee signs or withholds the receipt (a). The payee rotates with the safety key whenever it likes (Identity rule 8: "The protocol does not restrict why an owner rotates"), and chooses which sequences the rotation keeps (rule 17). The payee chooses whether and when to anchor the rotation. The payer's only input is the anchor of its own claim, which needs the rail proof and so cannot exist before the payment, and which the decision itself says should be pooled, that is, delayed. The decision's reasoning calls the loser "an honest payer in the window" and the window a theft's. But the mechanism never checks that anything was stolen. Read without a thief, rule 15 (b) is: *a payee can decline to count any payment it has not receipted and the payer has not yet anchored, by one rotation and one anchor.* Rule 10 was written to make the receiver's silence harmless; rule 15 (b) makes it decisive again.

**Smallest story (no theft, no thief).**
1. Debtor owes Owner 900 under a royalty deal. Owner's vault limit in that unit is 1,000; the flow is Owner's own wallet.
2. Debtor's wallet checks the vault (rule 14a, MUST), pays 900 to the flow, writes its claim at once (rule 15, MUST), and queues it for the pooled anchor its client runs nightly.
3. Owner's wallet receives the 900. Owner does not sign a receipt. (Nothing requires one, and rule 8 requires a receipt to reach the next payee and the final creditor, never the payer.)
4. Owner rotates with the safety key, setting the limit for that unit to 0, and anchors the rotation within the hour.
5. Rule 14a: limit 0 applies "to every payment not yet shown as made". Rule 15: (a) there is no receipt; (b) the rotation is anchored and Debtor's claim is not anchored before it. "A payment that did not follow them (for example, paid to the flow above the limit) is not protected." The obligation stays open (rule 16). Debtor pays 900 again, to the vault. Owner has 1,800.
6. Debtor's claim shows that 900 arrived (rule 10). Nothing in Finance turns that into a discharge, a refund, or a dispute on Owner: rule 10's dispute is for a receipt that *disagrees* with a claim, and Owner signed none.

The same story with a stolen-looking wallet: Owner publishes pointer v3 from a second device, collects on it, rotates keeping only the first device's sequence, and anchors. v3 is void, the receipts Owner's second device signed are void (not on a kept line), and every unanchored payment to v3 is unmade. With F168 item 11 (finding 5) Owner can first re-point every existing deal to v3 from that device, so the backlog falls due there.

**Why "rare" is wrong.** The decision log records that the lead found the stated cost "is every honest payer between the theft and the rotation" and accepted it as the price of shutting collusion. That is the honest trade for a theft. But the trade is paid by every payer at every moment, since every payer's protection now rests on winning a race the payee starts: between the payee's anchor and the payer's pooled anchor, the payee wins by choosing the moment. The working rule of F159 says a common case must work safely by default and an added feature is for rare cases; here the common case (a payment to a flow pointer, claim written, anchor pooled) is safe only through the added feature (an immediate, per-payment anchor), and the design intent recorded in F164 ("paying over Lightning and anchoring claims on chain, pooled") rules the feature out for the common case.

**What would be checkable** (not proposed as text). Any of: the cut-off applies only where the rotation also *voids the pointer paid* (a voided pointer needs a sequence the owner did not keep, which is at least a visible choice; a limit change alone would then not unmake a payment the vault allowed when made); or a payment the payer's claim shows arrived at the payee's own flow counts as made whatever the anchors, and the anchor rule bites only for a pointer the rotation voided; or the payee's silence costs the payee, as rule 10 intended, by making an unreceipted payment count on the claim alone even after the anchor. Each keeps the collusion fix (a colluding payer paid a *thief's* pointer, which the rotation voided) and removes the owner's lever over honest payers to the owner's own wallet.

**Verdict.** BREAKS. The rule is gamed by the party who gains, with inputs that party alone controls; and CONFLICTS with rule 10's "the claim alone shows the money arrived".

---

## 2. "Anchored" names no reference, no cMIP and no anchorer; Finance now depends on Law. UNCLEAR, cannot be checked; CONFLICTS (F164)

**Sentences.**
- Rule 15 (b): "where the rotation is not anchored … where the rotation is anchored, only a claim of the payer's anchored before the rotation".
- Rule 15's italic: "Anchoring the rotation is the owner's own act and shuts the theft window".
- Finance, "Dependencies": "Finance never depends on Law or Production: a Finance-only client, such as a wallet that sends tips, is a complete client."
- `spec/MIP-law-draft-10.md`, "Tasks": "**Anchoring.** A cMIP accepts an act id and produces a proof that it existed at a point on a time reference. *Anchoring is Law's tool for Law's purposes (deadlines, claim priority); Identity does not depend on it (F63).*"
- Law, definitions: "**Time reference.** A source of time an agreement names … Only it decides whether an act is before or after a point on its reference … for that agreement (Q35)."

**The flaw.** In the core an anchor is a proof on a named time reference, produced by the anchoring cMIP an agreement names. Rule 15 (b) needs three things it does not have: a reference on which "the rotation is anchored" (a rotation is an Identity act and belongs to no agreement); a reference on which "a claim … anchored before the rotation" is compared with it (a tip's claim belongs to no agreement either; a deal's claim belongs to the deal's reference, which the owner's rotation anchor need not be on); and a rule for two anchors at the same point (Law rule 50 says bounds are inclusive for declarations; Finance says nothing). A verifier cannot answer "is the rotation anchored?" without knowing which anchors count, and the Finance-only wallet the Dependencies section promises cannot read the anchoring task at all.

**Who anchors.** The italic says the owner; the rule says "where the rotation is anchored", by anyone. Law rule 50 lets anyone anchor anyone's act. A third party can therefore shut the window for every honest payer before the owner chooses to, and the owner cannot stop it; an owner who wanted to protect in-window payers by not anchoring has no such choice.

**Smallest story.**
1. Fan tips Owner over Lightning. Fan's client anchors claims nightly on reference A (a Bitcoin block height, say). Owner's identity has five deals, each naming reference B (a different chain) as its time reference.
2. Owner's key is stolen; Owner rotates and anchors the rotation on reference B through deal 1's anchoring cMIP.
3. Is Fan's tip, paid to the thief's pointer, protected? Fan's claim is anchored on A, the rotation on B. "Anchored before" has no answer. A verifier reading only Finance does not know the rotation is anchored at all.

**Verdict.** UNCLEAR (cannot be checked as written) and CONFLICTS (Finance's Dependencies; Law's "Identity does not depend on it"). Rule 15 needs to say on what reference and by which cMIP a rotation and a claim are anchored for this rule, what counts at the same point, and the Dependencies section needs to say that rule 15 (b) is unknown to a Finance-only client.

---

## 3. The receipt case never reaches the theft window, and excludes receipts signed under the new key. UNCLEAR (F164)

**Sentence.** Rule 15 (a): "the payee's own receipt shows it, a receipt on a line of the payee's that the rotation kept (Identity), or signed by the payee's split service with a grant key the payee's chain still holds".

**The flaw, first part.** In the case the vault exists for, the phone with the signing key and the hot wallet is stolen ("the flow is easy to change and easy to steal"). The receipts for in-window payments are signed by that phone, on its sequence, which the rotation does not keep. So (a) protects no payer in a theft window; every in-window payer rests on (b). The italic's "The payee's receipt is the payee's own evidence and settles the common case" is true for a limit change by an honest owner and false for a theft. The decision's "stated cost" is therefore not a residue of (a) but the whole window.

**Second part.** A receipt signed after the rotation, with the new signing key, for a payment made before it, is "on a line the rotation kept" under no reading: a rotation "judges only the acts signed with the key it replaces" (Identity, "Status of an act after a rotation"). An honest owner whose wallet receipts an in-flight on-chain payment after rotating cannot bring that payment under (a). "A grant key the payee's chain still holds" is also undefined: a grant is a Law act in the deal's terms (freeze scenario 1 step 3), not an entry of the identity chain. Presumably "a grant act within the kept ancestry" is meant.

**Verdict.** UNCLEAR on both parts; (a) as a mechanism HOLDS for an honest owner's kept-line receipts (I tried a thief forging one: the thief's receipts are on the stolen device's sequence, and a grant the thief signs is on that sequence too, so both fall with it).

---

## 4. Rule 14a points to a protection rule 15 does not state. CONFLICTS (F164)

**Sentences.**
- Rule 14a: "a payment made under earlier limits is protected as rule 15 says (F164, withdrawing F160)".
- Rule 15: "A payment that followed both the pointer and the vault published on the payee's chain counts as made, even if a rotation invalidates that pointer, in either case (F164)".
- F164 in the findings log: "A payment to a pointer a rotation voided, **or under earlier limits**, counts as made where (a) … or (b) …".

**The flaw.** The decision has two triggers: a voided pointer and earlier limits. Rule 15 writes in one. "Followed … the vault published on the payee's chain" is, after rule 14a's rewrite, the vault the chain declares *now*; a 900 payment to the flow under a limit now 0 did not follow it, and rule 15's closing sentence says such a payment "is not protected". So the literal text gives a payment under earlier limits no protection at all, (a) and (b) included, and rule 14a's cross-reference points at nothing. Finding 1 assumed the charitable reading; the literal one is worse for the payer. "Applies at once to every payment not yet shown as made" is also two time words ("at once", "not yet") standing for "unless rule 15 (a) or (b) applies", which is what the sentence should say.

**Verdict.** CONFLICTS (14a against 15), and UNCLEAR on the time words.

---

## 5. "Any later act of the payee's on the agreement" lets a thief re-point every existing deal in the window. BREAKS, window-bounded; CONFLICTS with the reasoning, the core and the paper (F168 item 11)

**Sentences.**
- Rule 14: "the payee's acts on the agreement: its signature acts, its offer where the payee signed the offer …, **and any later act of the payee's on the agreement; the latest pointer any of them holds counts** (F133, F145, F155, F168)".
- Rule 12a's italic: "for agreements already signed, the payee's client signs one act on each, citing the new pointer (rule 14, F168)".
- Finance, "Reasoning", "The vault is a grammar for safer pointers": "Three ways a thief takes money through the flow: the backlog, closed because the version that counts for a debt is the latest the payee's own acts hold, and the payee's acts that made the backlog never held the thief's pointer (F145, F155, F157)".
- `spec/02-MOR-core-v21.md`, "Flow and vault": "a thief who changes the flow pointer cannot collect older obligations, nor re-issue them." The paper, section 5.1, says the same.

**The flaw.** F157 closed the backlog because the payee's acts that made it were signed before the theft and could not reach a pointer published after. Item 11 adds "any later act of the payee's on the agreement", and a thief holding the signing key signs the payee's acts. One text act per deal, citing v3 in `refs`, moves every deal's version that counts to v3 while the window is open. Rule 14 then routes every royalty that falls due in the window to the thief ("counts only toward what has, as its version that counts, that flow pointer's version or a later one"), and rule 14a's MUST sends the debtor's wallet there.

**Smallest story.**
1. Thief has Owner's signing key and phone; Owner has twelve royalty deals paying monthly.
2. Thief publishes v3 and, from the phone, signs twelve one-line acts, each naming a deal and citing v3.
3. Every debtor's wallet, selecting the version that counts (rule 14), finds v3 held by the payee's own later act and pays there. The rule's own italic, "a debt re-signed to name a pointer the payee's own act never saw, such as a thief's newer one, names a version that does not count for it", no longer describes what happens: the payee's own act saw it.
4. Owner rotates. v3 and the twelve acts are void (outside the kept ancestry). The deals fall back to v2. The debtors' payments to v3 are then judged by rule 15: with the rotation anchored and their claims pooled, unprotected (finding 1); they pay again.

After the rotation the hole shuts once Owner publishes a new pointer: the new one and v3 both name v2, "a forked pointer chain counts only up to the fork" (rule 12), and "A fork behind an act the owner's later rotation kept is settled by that rotation". Until Owner does, it is not shut: a colluding debtor's acknowledgement makes the thief's twelve acts and v3 "valid and shown as disputed" (Identity rule 16), rule 12 does not exclude a disputed pointer from "the latest of an unbroken, unforked chain", and rule 14's walk "passes only through the payee's own acts", which a disputed act of the payee's is. Whether the walk is meant to pass through disputed acts the text does not say. So the exposure is the backlog that falls due in the window, plus whatever falls due between the rotation and the owner's next pointer where one debtor colludes; F157 had removed the first, and the reasoning, the core and the paper still say it is removed.

**Verdict.** BREAKS, bounded by the rotation and the owner's next pointer; UNCLEAR on disputed acts in the walk; CONFLICTS with the three sentences quoted. A later act could count only where it is on a kept line *and* the deal's debtor has acknowledged it, or only where it is itself a signature act; or the reasoning sentences must drop "the backlog, closed".

---

## 6. The client rule imports a thief's pointer, and "where the payee's pointers are published" is not in Finance. UNCLEAR; BREAKS, window-bounded (F163)

**Sentences.**
- Rule 14: "**A payee's client signing an act that can pay its signer (its signature act on terms, its offer) MUST cite in `refs` the latest of the payee's pointers it can find where the payee's pointers are published, whichever device published it** (client conformance; F163)." Its italic: "Where the pointers are published is Finance's business, not Identity's: homes stay the layer for keys."
- `spec/MIP-identity-draft-11.md`, "Routes (type 3)": "kind 0 (default): outbox, where this identity's content of that scope is found"; rule 39: "A thief holding the signing key can redirect the inbox route until the owner rotates".

**The flaw, first part.** Finance says nothing about where pointers are published. The only candidate in the core is the identity's outbox route for the Finance scope, which the routes act names and which the signing key changes. The MUST cannot be conformed to from Finance alone.

**Second part.** "Whichever device published it" cannot tell the owner's laptop from the thief's phone: both are sequences of one identity under one signing key. During the window the honest laptop, obeying the rule, cites the thief's v3 in every deal and offer the owner signs, and if the thief has also rewritten the routes act, the laptop fetches from a relay of the thief's choosing. The signature act is on a kept line, so after the rotation it is valid and holds a void pointer; what version then counts for that deal (the fork rule says "up to the fork", which is the last pointer before v3) is derivable but not stated.

**Smallest story.** Owner's phone is stolen on Monday; the thief publishes v3. On Tuesday Owner, not yet aware, signs a film deal from the laptop. The client fetches "the latest it can find" and cites v3. Every advance under the deal, due that week, goes to the thief. Before F163, the laptop's signature act reached only the laptop's own sequence and held v1; the advance would have gone to v1 or the vault.

**What held.** For an honest identity with two devices and a conforming client, the walk now finds the pointer (I traced it: `refs` reaches the pointer act, which is the payee's own, so F157's restriction is met). A client that cannot reach the other device's publication cites the older pointer, which pins the deal to the older wallet; payments to the newer wallet then "count only if paid to the vault", and the payee's later act (item 11) moves it. That is a cost, not a break.

**Verdict.** UNCLEAR (where); BREAKS for deals signed in the window, bounded by the rotation, on top of finding 5. The rule needs the place named (the outbox route for Finance's scope, presumably) and the window cost stated.

---

## 7. A split service's receipt chain has no fork or reset rule, and the loser of a tie never holds the receipt. UNCLEAR, cannot be checked; gameable (F165)

**Sentences.** `spec/MIP-law-draft-10.md`, rule 15a: "a tied unit goes to the tied holder that has received the fewest leftover units from this stake so far, counted along the dividing split service's own receipts for the stake … Each receipt of a split service carries, per stake, the running count of leftover units each holder has received, and cites the service's previous receipt for that stake, so a tie is checked from two acts … A verifier that does not hold the previous receipt shows that unit as unknown, never the rest of the payment."

**The flaw, first part: resets.** The text says what a verifier does when it lacks the previous receipt. It does not say what a verifier does when it holds a previous receipt that the new receipt does not cite, or when two receipts cite the same previous one. A receipt citing no previous receipt is, by the text, the first for the stake, with counts of zero, and at zero the tie goes "to the holder whose identity hash is smallest". So a service that signs each receipt as a first receipt, or forks its chain, hands every tie to the smallest-hash holder, and the text gives a verifier holding the earlier receipts no rule to refuse it.

**Second part: "checked from two acts" is consistency, not truth.** Two acts show that receipt N's counts equal receipt N-1's plus N's allocation. They do not show that N-1's counts were right; that needs N-2, back to the first. The service can misstate the count once, in N-1, and every later receipt is consistent with the lie.

**Third part: who holds the receipts.** Rule 20 delivers a split "to every holder it pays". A one-unit payment at 50/50 pays one holder one unit and the other nothing, so the loser of a tie is not paid and receives neither the split nor the service's receipt. Rule 8 requires a receipt to reach the next payee and the final creditor; a holder paid zero is neither. With one-unit payments each holder holds every other receipt, and every receipt it holds cites one it does not. By the text's own rule, every tied unit is unknown to every holder.

**Smallest story (the departed holder again).**
1. A duo's work, 500,000 / 500,000; one member has left and the other owns the split service; income is one-unit streams.
2. The service signs each receipt citing no previous receipt, counts all zero. The remaining member's identity hash is the smaller (or the service was set up so). Every unit goes to the member.
3. The departed holder, paid nothing, holds no receipt and cannot show the reset. A verifier that somehow holds two consecutive receipts sees a second "first" receipt and has no rule that says it is wrong.

**What held.** With an honest chain the turn rule is bounded: at any point two tied holders differ by at most one unit, whatever order the service processes payments in (I tried reordering and splitting payments; the count, not the hash, decides). The fork's tie by the fork act's hash is signed by every member and any may refuse it. "Members counted alike" at a fork going to the first listed (F168 B1) is bounded to one unit per fork; a clone that reorders holders needs a clone rule, and a collective's majority could reorder before forking, for one unit. The payer's steering (item 10) is bounded to one unit per tie and a paying holder's gain is its own payment.

**Verdict.** UNCLEAR, cannot be checked as written; the reset is a gaming path open to the party who gains. The rule needs: a receipt that does not cite the latest receipt the verifier holds for the stake breaks the plan (rule 46b's "any deviation … breaks the plan"), and the service delivers every receipt for a stake to every holder of it, paid or not.

---

## 8. What a defeated declaration undoes is not stated, and the declaration format says the record then counts for nothing. UNCLEAR; CONFLICTS (F166)

**Sentences.**
- `spec/MIP-law-draft-10.md`, rule 51: "the declaration counts only while the declared party has no act on the agreement anchored after the declaration's own anchor: an anchored act of the party's own defeats it, whenever the declaration is shown, so a declaration cannot be kept and used against a party who came back; what was put in force while it counted, such as a clone without the party at a line or by signatures a keeper recorded, is never undone".
- Rule 53: "stake redistributed among remaining holders in proportion; stake transferred to parties named or defined by role; obligations redirected or held; agreement closed" … "in a deal from the declaration on".
- "Abandonment declaration" (format): "**A declaration counts only when it passes rule 51's checks** … A declaration that fails any check is no declaration: a record naming it in field 3 counts for nothing (record, field 3)."
- The findings log, F166: "*For the building session:* what a defeated declaration's outcomes mean for splits paid while it counted".

**The flaw, first part.** "While it counted" is the one time word the decision adds, and it is verifier-relative: a declaration counted, for a given verifier, until that verifier held the party's later anchored act. Clones are placed by anchors or lines, so "put in force while it counted" can be judged for them. Stakes and splits are not: a split service's receipts are not anchored, so whether a split paid under the redistributed stakes was "while it counted" has no answer, and rule 46b makes every split either matching the stakes or broken. The decision hands this to the builder; it is a rule, not a build detail, and the two readings differ in who can game it:
- *Outcomes return on defeat.* A party absent for a year, whose stake was redistributed and whose obligations were redirected, anchors one liveness act and has them back. The others can never rely on the clause; the party chooses when to be absent and when not.
- *Outcomes stand.* The defeat changes nothing for a deal, where the stake moved "from the declaration on", nor for a collective, where the line was drawn at once. "Defeats it" then means only that no further outcome follows, which the text could say.

**Second part.** Rule 51's "counts only while" is one of rule 51's checks. The format section says a declaration failing any check "is no declaration: a record naming it in field 3 counts for nothing". So in a collective: member declared, record drawn, clone without the member written on it; the member returns and anchors an act; the declaration now fails a check; the record counts for nothing; the clone it put in force is, by rule 51, "never undone". Both sentences are the protocol. The same holds for the recovery rotation of C7 that declares the clone removing the declared member.

**Smallest story.** A trio's collective, two-week period. C is away a month. A, the authority, declares C on day 15, draws the record on day 15, and the clone without C is in force. C returns on day 30 and anchors a liveness act. Under rule 51, C's return defeats the declaration and the clone stands. Under the format section, the record naming the declaration counts for nothing, and with it the registration of C's departure; whether the clone it wrote is in force is whichever sentence a verifier reads first.

**Verdict.** UNCLEAR (what a defeat undoes) and CONFLICTS (rule 51 against the declaration format's record sentence).

---

## 9. The defeat is prospective, so what the others did in the gap stands; in a collective the defeat is empty, and a duo's period clause is a hair-trigger. HOLDS as written, with the consequence stated (F166)

**Sentence.** Rule 50's italic: "A period clause needs no third party: the declared party's own anchored return defeats a declaration, so a duo can use it (F166)." Rule 53: "in a collective the remaining members rotate its keys and clone it without the party (rule 37)".

**What I tried.** The kept-declaration attack of the last review (the operator anchors a declaration in a three-week gap, keeps it, shows it in October): C's first anchored act after the declaration defeats it whenever it is shown. Held, for the declaration. The re-declaration attack (A declares again the moment C returns): C's return act lies within the period before any new declaration's anchor, so none can count until a fresh period passes without C. Held. A declaration kept and used in the *no-period* form: unchanged, the stated cost of that form.

**What the fix does not reach.** Nothing stops the authority and the others from acting under the declaration inside the gap, and rule 51 says what they did stands: a clone without C "at a line", a record drawn at once. In a collective the remaining members are told to rotate and clone at once (rule 53), so by the time C returns there is nothing left to defeat: C is not a party of the agreement in force. In a duo, A declares B after one period of silence and clones in the same hour; B's return is an act on an agreement B is no longer party to. F158's acknowledgement was the one check that someone other than the authority agreed; F166 replaces it with the period alone. Whether that is acceptable is a judgment for Nobody, allegedly: the clause is the party's own choice, and a client that anchors a liveness act well inside the period keeps its user safe. But the sentence "a declaration cannot be kept and used against a party who came back" should say "the declaration", since what was put in force under it in the gap can be kept and shown later as well as any act can.

**One more thing.** A contest act (rule 52) is "an act on the agreement" by rule 50's definition, so an anchored contest is itself a defeat. Freeze scenario 1 step 9 has the absent party contest; its pass condition "a declaration stops counting once the declared party anchors an act on the deal after it (F166)" is then met in the *rightful* case too, and the suite no longer tells a wrongful declaration from a rightful one.

**Verdict.** HOLDS, as written, with the consequence named; the freeze suite's step 9 is UNCLEAR.

---

## 10. The floor forbids the long-form format's own markup. CONFLICTS (F167)

**Sentences.**
- `spec/MIP-text-draft-6.md`, the format task: "whatever its declaration says, it never hides a letter, a digit or a combining mark (general categories L, N and M), a currency or mathematical sign (Sc, Sm), the percent and per-mille signs, a character between two digits, or a plus or minus sign (U+002B, U+002D, U+2212) directly before a digit (F167)".
- `cmips/cmip-long-form-draft-1.md`, "Markup character": "One of: LF, SPACE (U+0020), `#`, `*`, `>`, `<`, `` ` ``, `\`, `-`"; rule 5 (quote): "From each, the `>` and one space after it, if there is one, are hidden"; rule 10 (link): "The `<` and `>` are hidden."

**The flaw.** U+003C `<` and U+003E `>` are general category Sm. The floor says a format never hides an Sm character. The approved long-form format hides both, for quotes and links, and the freeze suite's scenario 5 step 9 runs it. One of the two texts must change: either the floor names the Sm characters it means (the signs that carry an amount's meaning: `+`, `−`, `=`, `×`, `÷`, `<`, `>` as comparison, `|`, `~`), or the long-form format loses quotes and links. Markdown's other Sm markup (`|` tables, `=` headings, `~~` strikethrough, `+` bullets) is already outside the long-form format, but the floor forbids it to any successor format too. The decision asked the building session to report "any markup it wrongly forbids"; this is one.

**Verdict.** CONFLICTS.

---

## 11. The floor misses the common negative and decimal forms, and sentence punctuation. BREAKS, small (F167)

**Sentence.** As in finding 10: "a character between two digits, or a plus or minus sign (U+002B, U+002D, U+2212) directly before a digit".

**What a hostile declaration can still hide, each with a conforming check passing:**

| Bytes | Shown | What is hidden and why it is allowed |
| --- | --- | --- |
| `-$2.50` | `$2.50` | the minus is before `$` (Sc), not a digit |
| `−€5` | `€5` | the same, with U+2212 |
| `(2.50)` | `2.50` | the accounting form of a negative; parentheses are Ps/Pe |
| `2.50-` | `2.50` | the trailing minus |
| `.50` | `50` | the point is not between two digits |
| `$.50` | `$50` | the same |
| `Do you agree?` | `Do you agree` | `?` is Po |
| `not able` | `notable` | the space is Zs, not between digits |
| `can't` | `cant` | the apostrophe is Po |

The first two are how a royalty statement writes a negative balance. The decision records that "a miss weakens protection only against a hostile format, for that character, and plain display stays the fallback"; that is true, and these are the characters. The simplest extension that catches the money cases: a plus or minus sign directly before a digit *or a currency sign*, and a full stop or comma directly before a digit when no letter precedes it. Sentence punctuation is a judgment call; the question mark is the one that reverses a clause.

**Verdict.** BREAKS, small, within the decision's own caveat.

---

## 12. Rule 15's selection sentence still names only the signature act and the offer. CONFLICTS, editorial (F168 item 11)

**Sentences.** Rule 14, after item 11: "its signature acts, its offer …, and any later act of the payee's on the agreement". Rule 15: "the pointer followed is selected as in rule 14: the latest of the payee's chain held by the payee's own act, their signature act on the agreement or the offer (F138, F145, F155)".

**Verdict.** CONFLICTS, editorial: a payment under an agreement with no obligation between (a purchase, an advance) selects by the old list, a payment toward an obligation by the new one.

---

## 13. A refund to a bare key is outside rule 14, but rules 7 and 12a still require a pointer the creditor does not have. CONFLICTS, small (F168 item 9)

**Sentences.**
- Rule 10a: "such a refund is outside rule 14's selection of a pointer, since its creditor is a bare key with no pointer or vault (F168)".
- Rule 7: "An obligation is discharged when valid routes ending at the creditor's payee pointer, each naming the obligation, sum to the owed amount."
- Rule 12a: "A receipt or claim counts only if the rail Module its field 0 names is the one named by the rail of the payee's pointer, or the entry of the payee's vault, that the payment was paid to".

**The flaw.** Item 9 fixed rule 14 and left the two rules that also speak of the creditor's pointer. A refund paid where the claim's key 7 says reaches no "creditor's payee pointer" (rule 7), and the refunder's claim names a rail Module "named by the rail of the payee's pointer" of a payee that has none (rule 12a: "counts for nothing"). Freeze scenarios 2 and 5 run the intended reading; the text does not say it. One sentence: for a refund under rule 10a, the rail in the claim's key 7 stands for the creditor's pointer in rules 7 and 12a.

**Verdict.** CONFLICTS, small.

---

## 14. Sentences that still state the replaced rules, or state the new ones without their condition. CONFLICTS, editorial (F164, F165, F166, F168 item 14)

| Where | Sentence | Note |
| --- | --- | --- |
| Freeze suite, scenario 1 step 5c | "the fan's claim does not hold the rotation in its history, or the fan publishes no claim; the payment counts as made (Finance rule 15, F139, F154)" | true only while the rotation is not anchored (F164); the step does not say whether the contributor anchored the rotation, so its pass condition cannot be read |
| Freeze suite, line 83 | "leftovers by largest remainder, ties by the payment's hash, reordering holders moving nothing (F150)" | F165 replaced the hash with turns; item 14 said the suite follows F166 and did not touch this |
| Law, "Reasoning" | heading "**Leftovers by largest remainder, ties by the payment's hash** (F150)" | the body under it now says ties cannot be broken by a hash |
| Finance, "Reasoning" | "the backlog, closed because … the payee's acts that made the backlog never held the thief's pointer" | finding 5: a later act of the payee's can |
| Core v21, "Flow and vault"; paper 5.1 | "a thief who changes the flow pointer cannot collect older obligations" | the same, for the window |
| Core v21, "Good faith"; paper 5.1 | "The loss from a theft window falls on the owner, never on a payer who followed the rules." | rule 15's own closing sentence is now qualified ("and whose payment the payee's receipt or an anchored claim shows"); the core and the paper state the principle F164 changed |
| Paper, claim 2 | "except those a third party relied on, which stay visible as disputes" | still the thief's offer: Identity rule 16 bounds a keeper's record ("before recording the rotation") and not an acknowledgement, so a buyer acknowledging the thief's discounted offer after the rotation still makes it valid and disputed. F164 closes the money (the buyer must now pay the owner's kept wallet or the vault, and the owner's wallet will not issue a request for a price it never set), not the standing. The exception is bounded by the keys the thief handed out, not by time |
| Rule 15 | "A payer's client MUST write the payer's claim at the moment it pays … and SHOULD anchor it" | with F164 the SHOULD is the payer's only protection against finding 1; a MUST would be as uncheckable, and the italic's "clients compete on it" says the market will decide what the rule says protects |

---

## 15. Attacks I tried that held

- **F163, the walk reaches the cited pointer.** From the signature act through `refs` to the pointer act, which is the payee's own; F157's restriction (no passage through another identity's act) is met. Held for a conforming client and an honest identity, any number of devices.
- **F163, a stale citation.** A client that cannot reach the other device cites an older pointer; the deal is pinned to the older wallet, payments to the newer one go to the vault, and item 11 lets the payee move it. A cost, stated by rule 14's own italic for F155. Held.
- **F164, the thief anchors backwards.** An anchor proves existence at a point; nothing the thief anchors after the owner's anchor can precede it. Held.
- **F164, the thief forges a kept-line receipt.** The thief's receipts are on the stolen device's sequence, and a grant the thief signs to an accomplice service is on that sequence too; the rotation omits both. Held (finding 3 is about what that leaves the payer).
- **F164, collusion after the anchor.** A colluding payer cannot produce a claim anchored before the owner's anchor for a payment made after it; and claims anchored in the window are the window's cost, which rule 15 assigns to the owner. Held as the design intends, subject to finding 2 (on what reference).
- **F164, the vault change by a thief.** Still the safety key only. Held.
- **F165, reordering or splitting payments.** The count, not the order, decides; two tied holders differ by at most one unit at any point. Held, given an honest chain (finding 7).
- **F165, a paying holder steering payer-side ties.** One unit per tie, to itself, paid by itself. Held, bounded.
- **F165, the fork's tie.** The fork act is signed by every member and any may refuse it; "first as listed" at a fork costs one unit, under an order every member signed. Held, bounded.
- **F166, the kept declaration against the declaration act.** Defeated by the party's first anchored act after it, whenever shown. Held.
- **F166, re-declaring the moment the party returns.** Needs a fresh period of silence. Held.
- **F166, the anchor at the same point.** Rule 50's inclusive bounds protect the party on both sides. Held.
- **F167, the long-form declaration against its own stated bound.** Every character it declares is in a position the declaration gives; the floor passes it except for `<` and `>` (finding 10). Held otherwise.
- **F168 item 8, something binding resting on a link.** Succession names a successor identity in a rotation, grants are Law acts, names are name acts; I found nothing in Identity, Finance or Law that reads a link for a binding answer. Held; rule 26's rewrite matches F152.
- **F168 items 12 and 13.** The relabeling cost on a non-binding rail is now stated, and its rarity is checkable once the rail Module's declaration exists (FORMAT OPEN, honestly marked). An offer another identity signed is not the payee's act; the payee's signature accepting it is. Held.
- **F168 B4 and B5.** A scoped key never signs an Identity act (rule 1a) and the rotation is judged first. Held.
- **Paper claim 6.** The one-unit bound where the default rule applies matches rule 15a. Held.

## 16. Effect on the paper's claims (section 6.2)

| Claim | Effect of F163 to F168 |
| --- | --- |
| 1, same verdicts | rule 15 (b) now depends on anchors with no stated reference (finding 2): two verifiers reading different anchoring cMIPs can answer differently on the same acts |
| 2, a stolen key cannot outlast the next rotation | the pointer half now holds after the owner anchors, at the honest in-window payer's expense (finding 1); the offer half is unchanged (finding 14); the claim's new sentence is accurate and its old exception still carries the thief's offers |
| 5, no stake moves without its holder | ties are now by turns, bounded (held); a split service's reset is not refused by any rule (finding 7); a defeated declaration's effect on a redistributed stake is unstated (finding 8) |
| 6, splits exact up to rounding | updated to one unit; held |
| 7, a thief cannot collect older obligations | false in the window under item 11 (finding 5); the paper's 5.1 states the old rule |

*Section 5.1's last clause, "the loss from a theft window falls on the owner, never on a payer who followed the rules", is now contradicted by the sentence it follows.*

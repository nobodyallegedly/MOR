# Hostile review of the whole set: theft, absence, splits and text, as reset on 7 October 2026

*7 October 2026. Written for Nobody, allegedly. This review reads the rules as they stand after the reset of this morning, not as patches: the baseline (`docs/theft-window-baseline-2026-10-07.md`), decisions F169 to F175 (`docs/findings/MOR-findings-log-round-2.md`), the build report on branch `build-f163-f168` (`docs/decisions-f163-f168-build-2026-10-07.md`), and then the spec as written on main at `08bf5a7`: Finance draft 6 rules 7 to 16; Envelope draft 7, Tasks; Law draft 10, rules 15a, 21, 46b, 49 to 53, the abandonment clause and declaration formats, "Made before, made after" and Tasks; Text draft 6, the format task; Identity draft 11, the envelope section and rules 15 to 17 and 23 to 26; the core v21; the freeze suite v21; the paper (`docs/paper/mor-paper-draft-2.md`); and, where a rule leans on them, the payment cMIP draft 2, the long-form cMIP draft 1 and the Production task table. Nothing in `spec/` or the code was changed. The reviewer built none of it.*

*State of the code: main's core library still implements F139 and F146 for good faith (`core/src/finance.rs`, `good_faith`: the claim's history, then "where both are anchored"), F136 to F158 for absence (`core/src/law/view.rs`, `absence_by_anchors`) and F160's vault. Branch `build-f163-f168` adds F163, F165 and parts of F168; F164, F166 and F168 item 11 sit on a held branch. Nothing of F169 to F175 is built. So "as written" below means the text, and where the code is cited it is to show a reading the text does not yet state.*

## In plain words first

The reset was the right move, and most of it holds. Of the three principles decided this morning, two are sound and well written: **absence is the members' chosen judgment** (F172), which is the simplest and cleanest of the three, and **the core names a task and does not say how** (the working rule under F169 and F173), which fits anchoring as well as it fits rails. The third, **the owner bears what the stolen key did until the lock change; after it, anchor or bear the loss** (F169), is also right as a principle. But the rule written for it, Finance rule 15, does not yet deliver it, for two reasons that are not wording.

**First, the rule lets the payer choose what to anchor on.** Anchors compare only on one reference, incomparable anchors favour the payer, and anyone may anchor any act. So a payer who wants a payment to the thief's wallet to count simply anchors the claim on a reference the owner never used, or anchors the owner's own rotation late on that reference. The owner anchors and still bears. That is the baseline's unbounded collusion again, under a rule that promises the opposite. The cause is structural: a rail is used by one party, so "the payee names the rail" was enough; an anchor is *compared* between two parties, so somebody has to name the reference, and it has to be the party who cannot be the thief. The fix is the same move as for rails: the owner declares the anchoring reference in the identity chain, with the safety key, as the vault is declared.

**Second, the rule compares the payer's anchor with the owner's anchor of the rotation, not with the moment the rotation became public.** An owner can sign a lock change, anchor it, keep it in a drawer, receive payments for a week, and publish it. Every claim anchored in that week is "after", however promptly. The text says prompt anchoring beats the owner's lever; here it does not. The rotation becomes public when a home receipts it, and a home receipt is an act that can be anchored; the lock change's point should be that one.

**Third, rules 14 and 15 contradict each other for exactly the payments F170 says the owner bears.** A debt the thief re-pointed in the window, paid by an honest debtor to the thief's wallet: rule 15 says the payment counts as made; rule 14 says the version it was paid to no longer counts for the debt, since the thief's act is void after the rotation, so it counts only if paid to the vault. The debtor pays twice. The code on main reads it the same way.

Beside these: Finance never says that a thief's pointer kept visible by an acknowledgement (Identity rule 16, "valid and shown as disputed") holds no pointer and signs no receipt for money, though the paper promises it and the code does it; the lock change is defined by two of the three things a rotation can do to a vault; the paper's claim 2 overstates rule 15; and anchoring, moved to the Envelope by F173, is still a Law task in the Production table, the core's task lists and freeze scenario 3.

On absence, the principle holds and the rules deliver it. What is missing is one sentence that makes the cost legible at signing (the F158 warning was removed and nothing replaced it), one that pins what an absence-proof module may look at (as written, an act surfacing later can make a record fail that "no later act undoes"), and clean-up of sentences in rule 49 and the freeze suite that still speak of a period in the clause. On splits, F171 and F175 hold; the open count field is what makes "checked from two acts" true, and until it is settled a withheld receipt turns every later tie into an unknown for the holder it was withheld from. On text, the floor now protects what it should, and its remaining misses are stated; what is left is that several of its terms ("an amount", "a block", "emphasis markup") are not defined in Text, so two verifiers can differ on a MUST.

The ledger in the baseline showed each fix moving the lever to another party. This set moves it to the right place, the owner's safety key, but leaves two doors open through which the lever returns to the payer (the reference) and to the owner alone (the secret anchor). Both close with one declared reference and one named act, not with a new principle.

## How findings are marked

- **BREAKS**: an attack works, or a common case does not work, under the text as written.
- **CONFLICTS**: two rules, or a rule and the suite, the paper or the code, disagree.
- **UNCLEAR**: the text can be read two ways, or a verifier cannot check it as written.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

Each finding gives the exact sentence, the smallest story, and a verdict. Findings are ordered by weight, not by document.

## The three principles, judged as principles

**1. "The owner bears what the stolen key did until the lock change; after it, anchor or bear the loss."** Right, and better than options A, B and C of the baseline, because it names who can end the window (the owner, by the safety key), what ends it (a visible act on the owner's own chain) and who must prove which side a payment fell on (the party moving the money). It has one hidden premise: that the protocol can see *when* the lock change happened. MOR can see only anchors, and the rule as written lets the owner anchor the lock change before anyone could see it, and lets the payer pick a reference on which the comparison fails. Both are rule problems, not principle problems (findings 1 and 2). The principle also has an honest price the text already states: an owner who was never robbed holds the same lever. The protocol cannot tell a stolen wallet from an owner's lie, so this price is inherent to any rule in which the owner's act ends the window; it is bounded only if the two rule problems are fixed, since otherwise "beaten by prompt anchoring" is not true.

**2. "Absence is the members' chosen judgment; proof by time is an optional module."** Right, and the simplest answer the question has had. F136 to F166 each tried to make the core check a clock it does not have; F172 puts the clock where the clause's signers can choose it. Its price is the one the 5 October rule always had: whoever the clause names can declare whoever it covers, on their word, and the party contests. That is a stated cost the signer accepts, and it is acceptable exactly as far as the signer *saw* it when signing (finding 11).

**3. "The core names a task and does not specify how."** Right for rails and media, and right for anchoring, with one difference the text does not yet draw. A rail or a media type is used by one side at a time, so "the payee names the rail" fixes everything a verifier needs. An anchor is compared with another anchor made by another party, so the task's output is useful only on a reference both share. "Does not specify how" is fine; "does not specify on what" is not, and the Envelope task as written says only "a named time reference" without saying who names it for a payment outside any agreement. Finding 1 is this gap.

---

## 1. The payer chooses the reference, so the owner anchors and still bears. BREAKS (Finance rule 15, Envelope Tasks)

**Sentences.**
- Finance rule 15: "Anchors are compared only on the same reference; where the claim's anchor and the lock change's cannot be compared, the payment counts as made. Anyone may anchor any act (F169)."
- Envelope, Tasks, Anchoring: "A cMIP accepts any act id and produces a proof that the act existed by a point on a named time reference. Two anchors are compared only on the same reference; anchors on references that cannot be compared order nothing. Anyone may anchor any act."
- Rule 15's italic: "after it, a payer whose client did not anchor bears the loss."

**The flaw.** Nothing names the reference a payment is judged on. For a payment under an agreement, Law's time reference exists, but rule 15 does not point to it, and Finance may not depend on Law. For a tip there is no agreement at all. So the reference is whatever the payer's anchor says it is. Two attacks follow, both by the party who gains.

**Smallest story (the colluding debtor).**
1. Thief steals Ana's signing key, publishes flow pointer v3, re-points Ana's deal with Ben (F170: the window's cost). Ana rotates, voiding v3, and anchors the rotation on reference R1 (say, Bitcoin block height) within the hour.
2. Ben, working with the thief, pays the royalty to v3 after the rotation, writes the claim, and anchors it on R2, any reference R1 is not: another chain, a timestamping service, a reference the thief publishes for the purpose. "Anyone may anchor any act" and no rule says which references count.
3. Rule 15 (b): the claim's anchor (R2) and the lock change's (R1) "cannot be compared", so "the payment counts as made". Ben's debt is discharged by paying the thief. Ana anchored, and bears.
4. Ben has a second way with the same result: he anchors Ana's rotation on R2 too, after his claim. Now both are anchored on R2, comparable, and his claim is earlier. The owner's own anchor on R1 does not enter the comparison, since nothing says which reference the lock change is judged on when it has several anchors.

**Smallest story (no collusion).** The thief publishes v3 and, in it or beside it, the thief's own choice of anchoring reference; honest wallets that pay v3 anchor there (a conforming wallet reads the pointer). Ana's rotation is anchored on R1. Every honest payment in the window and after it is incomparable, and counts. The owner cannot shut the window against anyone, honest or not.

**Why this is the baseline's problem 4 again.** The baseline listed "collusion … never bounded" as the one cost the 5 October rules had and stated. F169 promised to bound it: "after it, anchor or bear the loss". Under the text, the colluder bears nothing, because the comparison the rule rests on is at the colluder's discretion. The ledger's pattern ("each fix moved the lever to a different party") has repeated once more: F164 gave the lever to the owner; F169 moved the decision to the anchor, and the choice of reference moved it to the payer.

**The smallest fix, for Nobody, allegedly to decide.** The owner names the reference, as the owner names rails (rule 12a, F115: "the payee decides which rails it accepts"), and names it where a thief cannot: in the identity chain's declarations slot, with the safety key, as the vault is. Then: a lock change is compared on the references its chain declared before it; a claim anchored on none of them is not protected after an anchored lock change; an owner who declares none has chosen no protection, as with no vault, and bears. The payer's client reads the declaration as it reads the vault (rule 14a, MUST). It cannot sit in the flow pointer, which the thief can rewrite. This keeps "incomparable favours the payer" only where the payer could not have known the reference, which with a declaration is never.

---

## 2. The owner can anchor a lock change before publishing it. BREAKS (Finance rule 15)

**Sentences.**
- Finance rule 15: "Where it is anchored, a payment it affects … counts as made only if (a) the payee's own receipt shows it … or (b) the payer's claim is anchored before the lock change."
- The italic: "Stated costs: the owner, by lowering a limit or voiding a wallet after receiving a payment and anchoring at once, can put an unreceipted payment the payer has not yet anchored in doubt; the lock change is visible on the owner's chain forever, bounded per payment by the earlier limit, and a client that anchors promptly defeats it."
- Identity rule 7: "A rotation counts once receipts from the homes required by the home rule show they hold it. Until then it is pending."

**The flaw.** An anchor proves an act *existed* by a point, not that anyone could see it. A rotation exists when signed. Nothing requires the owner to publish it before anchoring it, and the rule compares the payer's anchor with the rotation's, not with the moment the rotation became public. "A client that anchors promptly defeats it" is therefore false: the owner starts the race in secret and publishes after the payers have lost.

**Smallest story (no theft).**
1. Monday: Owner signs a rotation setting the limit for the unit to 0, anchors it on the declared reference, and publishes nothing. The rotation is pending (rule 7); the published chain still shows limit 1,000.
2. Tuesday to Friday: debtors pay royalties to the flow, each wallet checking the published vault (rule 14a), writing the claim at payment (rule 15, MUST) and anchoring it within the hour (SHOULD, done).
3. Saturday: Owner submits the rotation to the homes; it counts. Rule 14a: limit 0 "applies at once to every payment not yet shown as made". Rule 15: (a) no receipt was signed; (b) every claim is anchored after Monday. None counts. The debts stay open (rule 16); the owner has the money (rule 10 shows it arrived) and is owed it again.
4. "The lock change is visible on the owner's chain forever" is true and changes nothing: it was visible only from Saturday.

**Smallest fix.** The lock change's point on a reference is the earliest anchor of a home receipt for the rotation (Identity type 2, signed by the operator once it holds it, served with the chain, rule 10a), not of the rotation itself. A home receipt is the one act that shows the rotation was fetchable. For a self-hosted identity, which counts on the rotation alone (rule 22a), the rotation's own anchor is the point, a stated cost of a trust model Identity already states as such. And say which anchor counts when an act has several: for the claim, the earliest.

---

## 3. For the window's re-pointed deals, rule 15 counts the payment and rule 14 does not. CONFLICTS (Finance rules 14 and 15); BREAKS for the honest debtor

**Sentences.**
- Rule 14: "The version that counts for an obligation is the latest of the payee's pointer chain held by an act of the payee's own: … and any later act of the payee's on the agreement; the latest pointer any of them holds counts … Toward anything whose version that counts is earlier, it counts only if paid to the vault."
- Rule 15: "Where the lock change is not anchored, a payment that followed the pointer and vault published before it counts as made: the owner bears the theft window."
- Rule 14's italic (F170): "During a theft window this can cite a thief's pointer, as the stolen key can sign any of the payee's acts: the owner's cost until the lock change."
- F170: "both are the window's cost, borne by the owner … the backlog is protected after the lock change, not during the window."

**The flaw.** After the rotation, the thief's re-pointing act on the deal is void (Identity rule 16). Rule 14 reads "an act of the payee's own" with no word on void acts, and its reasoning says "on a kept line". The code reads it that way too: `payees_acts_on` (`core/src/law/view.rs`) keeps only valid signature acts. So the deal's version that counts falls back to the owner's last pointer, v2. Rule 15 says Ben's payment to v3 "counts as made"; rule 14 says a payment to v3 counts only toward what has v3 or later as its version, which the debt no longer has, so it "counts only if paid to the vault". Made, but toward nothing. The text gives no precedence between the two rules.

**Smallest story.**
1. In the window the thief signs one act on Ana's deal with Ben citing the thief's pointer v3 (F170 allows it, as the owner's cost).
2. Ben's wallet, honest, finds v3 as the latest the payee's acts hold, pays the royalty there, writes and anchors the claim.
3. Ana rotates and anchors. Ben's claim is anchored before the lock change: rule 15 (b), the payment counts as made.
4. Rule 14 now selects v2 for the debt: the thief's act is void and holds nothing. Ben's payment went to v3. "Toward anything whose version that counts is earlier, it counts only if paid to the vault." Ben's debt is open. Ben pays twice; F170 said Ana bears this.

**Smallest fix.** One sentence, in rule 15 or 14: where rule 15 counts a payment as made, the version it was paid under is selected from the payee's acts as they stood before the lock change, those the rotation voided included. The code already has this shape for pointers (`pointers_before`: "those bound before it, valid, or invalidated by r itself"), not for the acts on the deal.

---

## 4. A thief's pointer kept visible by an acknowledgement is "valid and shown as disputed"; Finance never says it holds nothing for money. UNCLEAR (Finance rules 12, 14, 15 against Identity rule 16); the paper and the code assume the answer

**Sentences.**
- Identity rule 16: "If it lies outside the kept ancestry … it is void, unless another identity acknowledged it … then it is valid and shown as disputed."
- Finance rule 15: "A rotation that voids a payee pointer, or lowers or removes a vault limit, is a lock change."
- Paper, claim 2: "a thief's offer acknowledged even after the rotation stays visible so, though no money paid under it counts against the owner once the rotation is anchored".

**The flaw.** A payer's claim is a Finance act and may carry `acks` (Envelope rule 4a). A colluding debtor acknowledges the thief's pointer and the thief's re-pointing act in his claim. Under Identity they are now "valid and shown as disputed". Does the rotation "void" that pointer, for rule 15? Is the disputed act "an act of the payee's own" that holds a pointer, for rule 14? Does a thief's receipt kept as disputed "show" a payment, for rule 15 (a)? The text says nothing; the paper says no; the code says no (`voided_pointer` treats `Disputed` as invalidated by the rotation; `payees_acts_on` keeps only `Valid`). The answer is the right one and must be written: for Finance, an act the rotation did not keep is void whatever acknowledgement keeps it visible: it holds no pointer, signs no receipt and selects no version.

**Smallest story.** As in finding 3, with Ben acknowledging the thief's acts in his claim. Under a literal reading of Identity rule 16 the thief's v3 is valid, rule 15's "voids" never fires, and rule 14 selects v3 through a valid act of "the payee's own". Ben's payment to the thief discharges the debt after the lock change, anchored or not.

---

## 5. The lock change is defined by two of the three things a rotation can do to a vault. UNCLEAR (Finance rule 15, rule 14a)

**Sentence.** Rule 15: "A rotation that voids a payee pointer, or lowers or removes a vault limit, is a lock change."

**Three readings the sentence leaves open.**
- *"Removes a vault limit."* Removing an *entry* makes the unit undeliverable (fail closed, rule 14a): tightening. Removing the *vault* (a null declaration, Identity rule 8b) sends every payment to the flow: loosening. Both "remove a limit".
- *Adding an entry.* Under F114 the smallest limit of several entries is the unit's limit, so adding an entry with a lower limit lowers it. Is that "lowers a vault limit"?
- *Replacing a source.* A rotation that replaces a vault entry's source (a Lightning node compromised: the Lightning module names this as the vault's own risk) voids no pointer and changes no limit, so it is not a lock change. Rule 14a says the vault that applies is "those the payee's chain declares". A payment made to the old node's invoice is to a vault the chain no longer declares. Is it made? Rule 15 covers "a payment it affects (to a pointer it voids, or to the flow above a limit it sets)" and nothing else. No rule answers.

**Smallest story.** Owner's Lightning node is taken. Owner rotates, replacing the source with a new node. A fan who paid an invoice from the old node, after the rotation but on an outdated chain, has a payment to a vault the chain does not declare. Rule 15 does not reach it; rule 14a does not say whether it counts.

**Smallest fix.** Define a lock change by its effect, not by the field: a rotation after which a payment that followed the chain as published before it no longer follows the chain as published after it. That covers voided pointers, lowered or removed limits, added entries and replaced sources alike, and leaves out a rotation that only raises a limit or keeps every sequence.

---

## 6. Ties on one reference, and several anchors of one act. UNCLEAR (Finance rule 15)

**Sentence.** Rule 15: "(b) the payer's claim is anchored before the lock change."

**The gap.** On a reference with coarse points (a block height), a claim and a lock change anchored in the same block are comparable and equal. "Before" fails; the payer loses, though the rule's own tie-breaking spirit ("incomparable favours the payer") points the other way. And an act anchored several times has several points; the text does not say the claim's earliest and the lock change's (per finding 2) home receipt's earliest.

**Smallest story.** Owner lowers the limit and anchors at once; a debtor's wallet, having just paid, anchors in the same block. The debtor's payment does not count, though the debtor's client did everything the rule asks, as promptly as the reference allows.

**Smallest fix.** "Anchored before or at the same point", and "the earliest anchor of each".

---

## 7. The owner's lever without a theft: stated, but understated. HOLDS as a stated cost; CONFLICTS with rule 10's wording

**Sentences.**
- Rule 15's italic: "the owner, by lowering a limit or voiding a wallet after receiving a payment and anchoring at once, can put an unreceipted payment the payer has not yet anchored in doubt; the lock change is visible on the owner's chain forever, bounded per payment by the earlier limit, and a client that anchors promptly defeats it. An old payment never anchored and never receipted can be put in doubt by a later lock change."
- Rule 10: "Where a payer holds a valid rail proof and the payee has signed no receipt, the claim alone shows the money arrived (F64)."

**What I tried.** The previous review's finding 1 (the owner lowers a limit after an unreceipted payment and anchors). F169 keeps the mechanism and states it as a cost, so it is no longer a hole in the text. I then tried to make it bigger than stated. It is: the bound is "per payment by the earlier limit", but a rotation that leaves out a device's sequence voids every pointer published there, and puts in doubt every unreceipted, unanchored payment ever made to those pointers, by every payer, in one act. For tips this costs nobody (no debt existed); for debts it reopens every one whose payer's client did not anchor. The total is not bounded; what bounds it is how many clients anchor, which is the principle's deliberate bet. I accept the bet as Nobody, allegedly's decision, with two notes.

- The bet pays only if findings 1 and 2 are fixed; as written, prompt anchoring does not defeat the lever.
- Rule 10's sentence reads as if arrival were discharge. One clause reconciles them: the claim shows the money arrived; whether the payment counts as made toward what it was paid for is rule 15's.

**Verdict.** HOLDS as the price of the principle, which the text names; the total bound should be stated as "every unreceipted, unanchored payment to what the lock change voids", not "per payment".

---

## 8. The paper's claim 2 overstates rule 15. CONFLICTS (paper against Finance rule 15)

**Sentences.**
- Paper, claim 2: "a thief's offer acknowledged even after the rotation stays visible so, though no money paid under it counts against the owner once the rotation is anchored".
- Rule 15: "Where it is anchored, a payment it affects … counts as made only if … (b) the payer's claim is anchored before the lock change."

**The disagreement.** Under rule 15 (b), a payment to the thief's pointer whose claim was anchored before the lock change *does* count once the rotation is anchored. The paper says none does. The rule is the decision; the paper should say "only where the payer's claim was anchored before the lock change".

---

## 9. Anchoring moved to the Envelope, and three places did not follow. CONFLICTS (F173 against the Production table, the core, freeze scenario 3)

**Sentences.**
- Envelope, Tasks: "**Anchoring** (F173, moved from Law)."
- Production draft 6, task table: "| 11 | Law | Anchoring | an act id | a proof it existed at a point on a time reference |".
- Core v21, Law section: "**Tasks:** split; condition evaluation; time reference; anchoring; grant limits; work claims." The core's Envelope section lists no anchoring task.
- Core v21, collectives: "Three tasks judge rather than act: condition evaluation, time reference and anchoring (the judicial tasks) … though their acts, being Law acts, fall in the Law lane like any other."
- Freeze scenario 3, step 7n: "a clone replacing the anchoring cMIP (task 11), or the time reference cMIP (task 10)".

**The disagreement.** Tasks carry "one global number" (Production, "Tasks are the contract"), and the table still numbers anchoring as a Law task. The core lists it under Law and not under the Envelope. The "judicial tasks" sentence says an anchoring cMIP's acts are Law acts, which an Envelope task's acts need not be. Production says "at a point", the Envelope "by a point"; only the second is what an anchor proves. The same table still describes the text format task as producing "a rendering that hides only non-letters", three decisions behind F149 and F167. Each is editorial, but a builder reads the table.

---

## 10. Smaller conflicts in Finance's own text. CONFLICTS (editorial)

- Rule 14: "for a payment under an agreement or offer, the version rule 15 selects"; rule 15: "the pointer followed is selected as rule 14 selects it … rule 14 then applies to it". A circle, resolvable, but a reader has to resolve it. One of the two should hold the selection.
- Rule 12a still reads "as its chain declares it (rule 14a; F164, withdrawing F160)"; F164's rule was replaced by F169.
- Core v21, "Flow and vault": "a thief who changes the flow pointer cannot collect older obligations after the owner's lock change"; "Good faith", one bullet below: "until the owner anchors the lock change". The first drops "anchored", which is the whole of F169; the paper's 5.1 ("once the owner has changed the locks") drops it too.
- Rule 14's italic says "the version that counts for a debt is the latest the payee's own acts on a kept line hold"; the rule says "an act of the payee's own". Finding 4 asks for the italic's words in the rule.

---

## 11. Absence: the authority's word moves the stake, and nothing makes that legible at signing. HOLDS as the principle; UNCLEAR as to conformance; CONFLICTS with the paper's claim 5

**Sentences.**
- Law rule 51: "Otherwise the declaration is the authority's judgment, a stated cost the party accepted by signing the clause, and a contest shows it (F172)."
- Law rule 49: "In a deal, the authority is one identity: a party, a keeper's operator, or a collective".
- Law rule 53: "stake redistributed among remaining holders in proportion; stake transferred to parties named or defined by role".
- Paper, 5.2: "A clone never reduces a stake without its holder's signature"; claim 5: "No stake or share moves without its holder's signature".

**What I tried.** The party who gains is the authority. In a two-party deal, the other party may be the authority (rule 49), the clause may allow outcome 1, and with no absence-proof cMIP named the core checks signer, outcome and version only. So B declares A absent on B's word, then clones alone ("Made before, made after", Q28: "The other parties then change the deal without the declared party (rule 45b)"), redistributing A's stake to B. A's liveness acts "show presence" and prove nothing (rule 50). A contests, visibly. That is the 5 October rule, and F172 chose it with eyes open: "how it is set up from various options is the members' responsibility". It holds, as a stated cost the signer accepted.

**The gap.** The cost is accepted only as far as it was seen. F158's client warning was withdrawn by F166, F172 removed the period warnings, and nothing replaced them: no sentence says a client MUST show, before a party signs terms, who may declare that party absent, with which outcomes, and whether any module stands between the authority's word and the stake. Area names are "shown before signing" (terms, area field 0); Text rule 5a shows the text; the clause is CBOR fields, not text. One conformance sentence in rule 49 closes it, in the pattern of rule 5a.

**The paper.** Claim 5 and section 5.2 state the stake rule without the exception the holder signed. "No stake moves without its holder's signature, or without the declaration of an authority the holder's own signature named for it" is what the spec now says.

---

## 12. What an absence-proof module may look at is not pinned to a place. UNCLEAR (Law Tasks, rule 51)

**Sentences.**
- Law, Tasks, Absence proof: "A cMIP accepts an abandonment declaration, the clause's parameters and the acts a verifier holds, and answers whether the party's absence is shown (accepted, refused, or unknown) … a declaration it refuses or cannot judge does not count."
- Rule 51: "its outcomes take effect only through what is put in force under it … and the checks are judged at the point where that act uses it; a later act of the party, or a later contest, never undoes what was put in force".
- Declaration format: "a later act of the party never makes a record fail that passed where it was drawn (F172)".

**The flaw.** "The acts a verifier holds" is a verifier's input, and F137 accepts that two verifiers with different inputs may differ. But a record is a line, and a line's verdict is meant to be fixed by its history ("Made before, made after", 1). A liveness act of the party, anchored before the declaration but shown to the collective only after the record, makes a module that counts anchors refuse the declaration. For the verifier who holds it, the record put nothing in force; for one who does not, it did. "A later act of the party never makes a record fail" cannot help: the act is earlier by anchor and later by arrival, and the text does not say which "later" it means. In a deal the same happens through the keeper's record.

**Smallest story.** A duo names an absence-proof module with a 90-day period. B obtains a declaration against A; the keeper records the clone. A's phone, offline for three months, publishes a liveness act anchored on day 80, with its anchor. Verifiers holding it: the module refuses, the declaration does not count, the clone is a draft again. Verifiers not holding it: the clone stands. Both are conforming.

**Smallest fix.** Say what the module's inputs are: the acts the record's history holds, that is, acts of the party the collective had acknowledged or a keeper recorded before the line, in the pattern of "Made before, made after" point 2 and 5; or say the opposite plainly, that a module-judged declaration can fail later and what then happens to the clone. The first keeps F172's "never undone"; the second abandons it for module-judged clauses.

---

## 13. Sentences that still carry a period in the clause. CONFLICTS (editorial: Law rule 49, rule 51, freeze scenarios 1 and 3)

- Rule 49, last two sentences: "An anchoring cMIP is named as the time reference the authority judges absence against, never as the authority. Absence means absence from duty: no act by the party on the agreement, for a period measured on the agreement's time reference." Key 2 (the period) is retired and "terms carrying it are invalid"; the period now lives, if anywhere, in key 3's parameters. The first sentence names the anchoring cMIP for a role F172 gave the absence-proof cMIP.
- Freeze scenario 1, step 1: "an abandonment clause naming the keepers' operators as the authority on absence, judged against the block height"; step 9b: "Two of three contributors sign a clone of the abandonment clause to a one-week period and a friendly keeper … The clone stays a draft". A clause carrying a period (key 2) is now invalid terms, so the clone would fail for a reason the step does not test; the step should put the period in an absence-proof module's parameters (key 3), or drop it. Scenario 3, step 1: "judged against a time reference", likewise.
- Rule 51: "A declaration moves nothing by itself: its outcomes take effect only through what is put in force under it, a record or rotation in a collective, a clone in a deal (rule 53)". Rule 53 and "Made before, made after" say outcome 0 in a deal takes effect "from the declaration on", which it must, or the others could never clone without the declared party. Say that the voice outcome is the exception, or that in a deal the declaration is itself the line (Q28 already says so).

---

## 14. Is absence proof a judicial task? UNCLEAR (Law Tasks, rule 34a; Production table)

**Sentences.**
- Rule 34a: "for a judicial task, other specifications" may be named to take over when a judge "answers 'unknown'".
- Law, Tasks: "a declaration it refuses or cannot judge does not count."
- Production, "Tasks are the contract … each with one global number"; the table has no absence-proof row.

**The gap.** The new task answers "unknown" like a judge, decides who keeps a stake like a judge, and sits in a protected clause. But it is not among the judicial tasks ("condition evaluation, time reference and anchoring"), so the chain of judgment does not reach it, "a judge never handles what it judges" does not bind it (the same specification could be named as the deal's anchoring cMIP and its absence-proof cMIP), and it has no task number. Each is a one-line decision; together they decide whether a dead module traps the members, which rule 34a was written to prevent.

---

## 15. Splits: "checked from two acts" is true only once the count field exists. UNCLEAR (Law rule 15a); CONFLICTS (editorial: the split format, paper claim 6)

**Sentences.**
- Rule 15a: "Each receipt of a split service carries, per stake, the running count of leftover units each holder has received, and cites the service's previous receipt for that stake, so a tie is checked from two acts (the field's place, in the receipt or the split cMIP, is FORMAT OPEN; F165). A verifier that does not hold the previous receipt shows that unit as unknown, never the rest of the payment."
- Rule 15a (F171): "The split service delivers every receipt for a stake to every holder of it, paid or not (client conformance)."
- Split format: "each holder receives its share of what the split pays that stake, but for rounding of one smallest unit per payout"; rule 21 (F175): "under the default rule every leftover unit goes exactly where rule 15a sends it".

**What I tried.** The reset and the fork (F171): with every holder holding the chain, both are deviations a verifier shows. Grinding the salt (F165): gone, the hash is not used. Paying a tie to the wrong holder: a deviation under F175. These hold.

**The gap.** The count field is open, so the build counts by walking every earlier receipt. Then one receipt a holder does not hold makes every later tie unknown to that holder, not just one unit, and the F171 delivery rule is conformance nobody can check. A service colluding with holder A withholds from holder B the receipts of the tie payments B lost (B is paid nothing on them, so no split reaches B either); B sees a chain with holes and, under the text, "unknown", never a deviation. With the count carried in each receipt, two consecutive acts verify the step and one hole costs one unit of knowledge, as the text promises. The field should be settled now, since it is what the rule's promise rests on; and the text should say that an unknown here is the holder's signal to demand the receipt, a cost the conformance rule states.

**Editorial.** The split format's "but for rounding of one smallest unit per payout" and its italic's "none above it by as many units as the stake has holders or more" predate F175's exactness; the paper's claim 6 says "up to rounding". Under the default rule they should say "exactly where rule 15a sends it".

---

## 16. The text floor uses words Text does not define. UNCLEAR (Text, format task)

**Sentence.** Text, Tasks: "it never hides … a bracket directly around an amount, … any run of hidden characters between two digits (a line break that ends a block excepted, since a new block is shown, not hidden), emphasis or code markup between two digits, … the percent and per-mille signs".

**The gap.** The floor is a MUST that every verifier implements (`checkBound()` in the long-form client). "An amount", "a block", "a line break that ends a block", "emphasis", "code markup" are the long-form format's vocabulary, not Text's; a verifier judging another format has no definition to apply. "The percent and per-mille signs" lists no code points, while the minus signs are listed; the build chose six characters, another builder may choose five. Two conforming verifiers can disagree on validity, which F137 forbids.

**Smallest story.** A second format declares no blocks. Its author argues that in its format every line ends "a block", so every line break between two digits may be hidden. Nothing in Text says otherwise.

**Smallest fix.** Define the terms in Text, or move the format-specific items into each format's declaration with a Text rule that the declaration must say which of its hidden characters end a block. List the percent and per-mille code points as the minus signs are listed.

---

## 17. The floor and the long-form format's links. CONFLICTS (minor: Text, format task against the long-form cMIP rule 10)

**Sentences.**
- Text: "a mathematical sign (Sm) next to a digit".
- Long-form cMIP draft 1, rule 10: "A `<`, followed by `https:` … then a `>`, is a link. The `<` and `>` are hidden."

**The disagreement.** F174 narrowed the Sm rule to "next to a digit" so that quotes and links survive; a link whose address ends in a digit (`<https://example.org/post/42>`) still has its closing `>` next to a digit, which the floor says may not be hidden. The link renders with a stray `>`. Cosmetic, but a format that promises to hide its markup and cannot is a format whose declaration the floor contradicts. The long-form format may choose another closer, or accept the shown sign; Text need not change.

---

## 18. F163's citation rule in a theft and in a contested chain. HOLDS, with one small UNCLEAR

**Sentence.** Rule 14: "A payee's client signing an act that can pay its signer … MUST cite in `refs` the latest of the payee's pointers it can find where the payee's routes act says its Finance acts are found, whichever device published it (client conformance; F163, F170)."

**What I tried.** (a) The place: the routes act does carry it (Identity, type 3: "scope: a spec hash … kind 0: outbox, where this identity's content of that scope is found"), so the previous review's finding 6 is answered. (b) The thief's pointer in the window: the client cites it, and F170 names that as the owner's cost; consistent with F169. (c) A fork in the pointer chain (two pointers naming the same predecessor, rule 12): "the latest" is ambiguous there, but rule 12 says clients use the last before the fork, and the verifier's walk applies rule 12 anyway, so the client's choice changes nothing binding. One word ("the latest that counts under rule 12") would remove the question.

---

## 19. F174 item 3 and the receipt after the rotation. HOLDS

**Sentence.** Rule 15 (a): "a receipt on a line of the payee's that the rotation kept or signed with a key the payee's chain binds after it, or signed by the payee's split service with a grant key whose grant still stands".

**What I tried.** A thief's receipt for a payment to the thief's pointer: the thief signs on a sequence the rotation does not keep, so it is void, and (a) fails; the payer needs (b). A thief's receipt appended to the owner's own line: a fork of that sequence, and the owner names the genuine tip or disowns the act (Identity rules 15 to 17, scenario 1 step 5). A thief's revocation of the split service's grant, by an everyday act: void after the rotation, so the grant "still stands" and the service's receipts count. The owner signing a receipt with the new key for a payment to the thief's wallet: the owner's own generosity, correctly counted. Each attack fails as the text stands; finding 4 is the one reading that would let a disputed receipt through, and the paper and code already refuse it.

---

## 20. Identity rules 15 to 17 and 23 to 26, and the private-link items of F168. HOLDS

**What I tried.** B4 (a private link signed by a scoped key is invalid, rule 1a) and B5 (a link voided by a rotation is void whether or not fetched): both follow from rules already in Identity and are written where a reader looks. Rule 26's "each half counts once its sealed form is published at its signer's homes" with rule 23: an owner holding back one half delays the link and cannot show it to one victim (F152). Rule 25 with the envelope section's "a link never decides anything binding": a fetch's standing is never needed, so F159's "input like its own attempts" does no harm. Nothing in this round touched rules 15 to 17, and F169 relies on them exactly as written: a rotation judges only acts signed with the key it replaces, and a thief without the safety key cannot anchor backwards or rotate at all.

---

## What held, in one list

- The principle of F169, and its placing of the cut-off in the owner's safety key rather than in any party's everyday act.
- Rule 14's backlog protection after an anchored lock change, judged by the payee's own acts through citations, with no "when" (F133, F145, F155, F157).
- The thief cannot anchor backwards, rotate, change the vault, or sign a receipt on a kept line that counts.
- The owner's own receipt as proof of good faith (rule 15 (a)), including F174 item 3.
- F163 for conforming clients, including in a theft (as the owner's cost) and at a fork of the pointer chain.
- F170: re-pointing in the window as the owner's cost, bounded by the vault limits, with the promise corrected in the core, Finance and the paper.
- F172 as a principle, and rules 50 to 53 as rules: a declaration counts on signer, outcome and version; outcomes take effect only through an act in force; a contest is visible; a module may stand between the authority and the stake.
- F173: anchoring as an Envelope task, with Identity's validity independent of it (F63).
- F171 and F175 for splits: reset, fork and a misdirected unit are deviations to anyone holding the chain; the payer-side cost and the fork's hash are stated.
- F167, F174 and F175 for text: digits, letters, marks, currency signs, the signs and separators around an amount, and runs between digits are protected whatever a format declares; the build's remaining misses ("- 5" against a bullet, a trailing "5 -") are stated and are the bullet's price.
- The private-link rules of F168 and Identity rules 23 to 26.

## Does each rule deliver its principle, and only that?

| Rule | Principle | Delivers it? | Delivers only it? |
| --- | --- | --- | --- |
| Finance 15, lock change | Owner bears until the lock change; after it, anchor or bear | No: the reference is the payer's (1); the anchor can precede publication (2) | No: the owner's lever without a theft (7), stated |
| Finance 14 with 15 | The window is the owner's cost (F170) | No for re-pointed deals: the debtor pays twice (3) | — |
| Finance 14, F163 client rule | A deal signed on one device finds the wallet of another | Yes | Yes; imports the thief's pointer in the window, as stated |
| Envelope Tasks, anchoring | The core names the task, not the how | Yes as to how; not as to "on what" (1) | Yes |
| Law 49 to 53, F172 | Absence is the members' chosen judgment | Yes | Yes; the cost is legible only if shown (11) |
| Law Tasks, absence proof | Proof by time in an optional module | Yes | Inputs not pinned (12); standing as a judge unsaid (14) |
| Law 15a, 21, 46b | Ties by turns, chain kept by holders, every unit placed | Yes for a holder with the whole chain | A hole in the chain costs more than one unit until the field is settled (15) |
| Text format task | A floor no declaration can lower | Yes for amounts and words | Terms undefined in Text (16); one format's markup caught (17) |

## Fit with the freeze suite and the paper

| Place | Says | Should say |
| --- | --- | --- |
| Paper, claim 2 | no money under a thief's acknowledged offer counts once the rotation is anchored | only where the payer's claim was anchored before the lock change (8) |
| Paper, 5.1 and core "Flow and vault" | "once the owner has changed the locks" / "after the owner's lock change" | "once the lock change is anchored" (10) |
| Paper, claim 5 and 5.2 | no stake moves without its holder's signature | or without the declaration of an authority the holder's signature named (11) |
| Paper, claim 6; split format | up to rounding; "but for rounding of one smallest unit" | exactly where rule 15a sends it, under the default rule (15) |
| Production table, core Law tasks, scenario 3 step 7n | anchoring is Law task 11 | an Envelope task (9) |
| Scenario 1 steps 1 and 9b; scenario 3 step 1 | a period in the clause, judged against the block height | a period in an absence-proof module's parameters, or none (13) |
| Scenario 1 step 5c | the fan's tip counts only if the claim was anchored before the rotation | before the lock change's point, as findings 1, 2 and 6 define it |

Scenario 1 step 5c otherwise follows F169 correctly, and step 9's pass condition ("a declaration moves nothing until a clone or record puts its outcome in force, which no later act undoes") states F172 well; finding 12 asks what it means for a module-judged declaration.

## Suggested order of work

1. Decide finding 1 (who names the reference) and finding 2 (what act's anchor is the lock change's point). Both are decisions for Nobody, allegedly, not wording; every other theft finding is wording once these are fixed.
2. Write findings 3, 4, 5 and 6 into rules 14 and 15 as single sentences, and finding 10's clean-up with them.
3. Write finding 11's conformance sentence into rule 49, decide finding 12 (what the module sees) and finding 14 (whether it is a judge), and clean rule 49, rule 51 and the two scenarios (13).
4. Settle rule 15a's count field (15), and the split format's rounding sentence.
5. Define the floor's terms in Text (16); let the long-form format answer 17.
6. Then the paper and the Production table (8, 9, 10, 11, 15), and one more hostile pass on rule 15 alone before building it.

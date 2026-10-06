# Hostile review of F133 to F144

*6 October 2026. Written for Nobody, allegedly. This review reads the twelve decisions at the end of `docs/findings/MOR-findings-log-round-2.md` and their text in `spec/` (the diffs since commit 77e1088, plus 77e1088 itself, which carries F133's first sentence), against the rest of the core, the freeze test suite (`spec/03-MOR-freeze-test-suite-v21.md`) and the paper (`docs/paper/mor-paper-draft-2.md`, sections 5 and 6.2). Nothing in `spec/` or the code was changed.*

## In plain words first

Most of the twelve changes hold up. Four of them can be beaten, and the worst attacks come from two of them working together:

1. **The rules on which payee pointer a payment must follow (F133, F138, F139) all judge by what one act cites. In each case the person who signs that act is the one who gains from what it cites.** The payer writes the payment claim, and someone who owes money may write the agreement terms. So a payer working with a former thief can keep paying the thief's old pointer after the owner has rotated, and the payment still counts. An honest payer who writes their claim *after* hearing about the rotation (which rule 10 allows) loses the protection they had earned. The theft window is supposed to close at the rotation. For a payer who works with the thief, it never closes.
2. **Anyone can rewrap an anonymous payer's claim (F135 with F139).** The anonymous signature covers the claim's fields but not what the claim cites. Since F139 judges good faith by what the claim cites, whoever holds the claim can switch the payer's good faith on or off.
3. **An absence declaration can be kept for later (F136).** The check looks only at the period before the declaration's own anchor. An authority that anchors a declaration during a member's holiday can use it months later, while the member has been active all along. And a member who shows they are alive with liveness acts that nobody anchored is not protected at all.
4. **A fork can still be blocked by a debt that binds no one (F144).** F144 fixed one kind: a debt on no chain. It left the others in place. A debt signed outside its signer's powers is done and on the chain but binds no one, and it must still be handed out. A hostile member can therefore make every fork either stall or load a successor with a debt nobody owed.

Smaller problems:

- F140's Unicode rule lets a text format hide decimal points, minus signs and the vowel signs of Indic scripts.
- F140's rounding rule lets a majority move money by reordering a stake's holders, with no signature from the holders who lose it.
- F141 gives a receiver a veto on rails that do not bind payee and purpose.
- F134's private links let a thief make a link that only its victim ever sees.
- Several sentences still say "when", "before" or "later" with no anchor. Most were left over from before; some are in the freeze test suite and in the paper.

## How findings are marked

- **BREAKS**: an attack works.
- **CONFLICTS**: two rules disagree.
- **UNCLEAR**: the text can be read two ways, or cannot be checked as written.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

Each finding gives the exact sentence, its file, and the smallest story. Findings are ranked by what an attacker could do with them.

---

## 1. The terms' drafter and the payer choose the pointer; the theft window never closes. BREAKS (F133, F138, F139 together)

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 14: "The version an obligation names MUST be one its agreement act holds in its history (cites, directly or through what it cites; F133), or, for an obligation naming no agreement act (field 4 absent), one the obligation act itself holds in its history; a Law client checks that (F66)."
- Rule 15 (F138): "For a payment under an agreement or offer with no obligation between, the pointer followed is the payee's pointer that the agreement act or the offer holds in its history (the latest of the payee's chain it holds; F138); rule 14 then applies to it as to an obligation's."
- Rule 15 (F139): "A payment that followed both the published pointer and the published vault counts as made, even if a later rotation invalidates that pointer, **provided the payer's claim does not hold that rotation in its history** (the payer had not seen it; F139)."

**The flaw.** Each test reads the history of one act. None of them says whose act it must be.
- An offer is the payee's own act, so the payee decides what it holds. That case is fine.
- The "agreement act" (Finance obligation field 4: "the agreement or offer it arises from") is the terms act, and any party may draft the terms. In a deal where the payer drafts, the payer chooses what the terms cite.
- An IOU (field 4 absent) is signed by the debtor alone.
- The payer's claim is the payer's own act.

So in every case except the offer, the party who pays decides which pointer counts, and also decides whether it has "seen" the rotation. Nothing in the text says the pointer must be the payee's current one as the payee saw it. The payee's client shows the plain text of the terms; it does not show what they cite.

**Smallest story.**
1. A thief steals Owner's signing key and publishes flow pointer v3, the thief's own wallet.
2. Owner rotates. v3 is void, and Owner publishes v4.
3. Months later, Debtor (working with the thief) drafts new terms with Owner: a commission, 10 payments of 900 each, every one under Owner's vault limit. Debtor's terms cite Owner's identity chain only up to v3. Owner's client shows the words and Owner signs.
4. Debtor signs the obligations under these terms, each naming v3. Rule 14 is satisfied: the agreement act holds v3.
5. Debtor pays all ten to the v3 wallet, and writes each claim citing nothing after v3. Rule 15: the payment "followed the published pointer" and "the payer's claim does not hold that rotation". It counts as made.
6. Debtor and thief split 9,000. Owner never received anything and is owed nothing.

The IOU version is shorter. A payee who owes a refund after a cancelled payment signs the refund obligation itself (field 4 absent). It names the payer's old, voided pointer, which "the obligation act itself holds in its history", and pays it.

**Second story: the honest payer.** Rule 10 says "A payer MAY publish one at any time."
1. Fan pays Owner's published pointer, which is the thief's, before hearing of any rotation.
2. A week later the payee disputes the payment. Fan's wallet writes a claim to prove it. Like every client, it cites the latest acts it holds, and those now include Owner's rotation.
3. Under F139 the claim "holds that rotation", so the payment does not count as made. Fan must pay again.

The claim records what the payer had seen *when the claim was written*, not when the payment was made. This breaks the sentence that ends the same rule: "The loss from a theft window falls on the owner, never on a payer who followed the published rules." The same test lets a dishonest payer in and shuts an honest one out.

**Why it matters for the paper.**
- Claim 2 ("A stolen signing key cannot outlast the owner's next rotation") is weaker than stated: a thief's pointer keeps collecting after the rotation, through any payer who works with the thief, on terms that payer drafts.
- Section 5.1 calls the loss "the loss from a theft window". It is no longer bounded by the window.

**What the fix needs** (for Nobody, allegedly, to decide; not proposed as text):
- Judge the pointer by an act **of the payee**: the payee's own signature act on the agreement, or the offer. The payee's own act holds the payee's own chain, rotation included.
- Judge good faith by something the payer cannot rewrite after the payment, such as the payment commitment that the rail proof carries. Do not judge it by a claim that can be written at any time.
- With an IOU nothing of the payee's exists, so it needs its own answer, or a stated cost written into the text.

---

## 2. Anyone can rewrap an anonymous payer's claim and turn their good faith on or off. BREAKS (F135 with F139)

**Sentences.** `spec/MIP-finance-draft-6.md`, claim format:
- "anonymous = [ key: signing-key, sig: bstr ] ; sig: by key, over tagged_hash("MOR/finance/anonymous-claim", [ field 0, field 1, field 2, field 3, field 4, field 5 or null, field 6 or null, field 7 or null, field 9 or null ]) (F135)"
- "Its signer, the act's signer, may be any identity, a one-time identity where the payer wishes to stay unnamed; the payer is the key".

Together with F139's "provided the payer's claim does not hold that rotation in its history".

**The flaw.** The key-8 signature covers every payload field. It does not cover the claim's inside citations (`prev`, `objects`) or its `acks`, and the act itself may be signed by anyone. Since F139, the claim's *history* decides whether a payment counts. Anyone who holds an anonymous claim can copy its payload and key-8 signature into a new act with different citations, and the copy is still "the claim of the payer that committed to that key".

**Smallest story.**
1. During a theft window, an anonymous buyer pays a work under an offer the thief published with the stolen key. The buyer relied on it, so it stays, as a dispute.
2. Owner rotates.
3. Owner, who would rather not owe the buyer, signs a new act under a fresh identity. It carries the buyer's payload and key-8 signature, and cites Owner's rotation in `objects`.
4. The buyer's claim now "holds that rotation", so the purchase does not count as made. The buyer has lost the money.

The reverse also works: a thief strips the rotation from a claim the payer made later.

The text does not say which of two such claims is "the payer's claim". For named payers the same question comes up when one payer publishes two claims for one payment, one before the rotation and one after. **UNCLEAR** as well.

There is a related problem with acknowledgements. Freeze suite step 2.5c relies on a buyer's claim acknowledging a publication. An anonymous buyer's claim can now be rewrapped with or without `acks`, which makes or unmakes a dispute in the payer's name.

---

## 3. An absence declaration can be anchored now and used later; liveness acts nobody anchored protect no one. BREAKS (F136)

**Sentence.** `spec/MIP-law-draft-10.md`, rule 51: "where the clause names a period of absence (key 2), that the party has no act anchored on the agreement's time reference within that period before the declaration's own anchored point; a declaration not anchored, or one the anchors cannot place, does not count".

**Flaw (a): a declaration kept for later.** The check looks only at the period *before* the declaration's own anchor, and an anchor proves only that the act existed by that point. Nothing the party does after the anchor counts against the declaration.

Smallest story (a deal, freeze scenario 1's shape):
1. The clause has a two-week period; the keeper's operator is the authority, and outcome 1 (stake redistributed) is allowed.
2. A contributor is away for three weeks in January. The operator signs a declaration, anchors it in the middle of the gap, and keeps it to themselves.
3. The contributor comes back and works on the deal every week until October.
4. Nobody clones the deal, so field 1 ("the last version that the party signed") still names the same version.
5. In October the operator publishes the declaration. Every check in rule 51 passes, and the stake is redistributed "from the declaration on" (rule 53).
6. Rule 52's contest is only shown; nothing says it undoes the declaration.

In a collective the same declaration is registered at a later line, and the later line changes nothing in the check.

**Flaw (b): unanchored liveness.**
- Rule 50 says "A party with nothing else to sign shows presence with a liveness act".
- Under F136 only an *anchored* act protects the party, and the anchoring cMIP's format is still open.
- Story: a party posts a liveness act each week but never anchors one. The authority anchors its declaration, and it counts. This conflicts with the freeze suite's scenario 1 pass condition, "the liveness act prevents a wrongful declaration" (**CONFLICTS**). Rule 50 should say a liveness act must be anchored, or that anyone may anchor it.

**Flaw (c): which acts count.**
- Rule 49 says "Absence means absence from duty: no act by the party on the agreement".
- F136 says "no act anchored on the agreement's time reference". It does not say "on the agreement".
- Freeze scenario 1 step 9 has a party "silent on the deal while active elsewhere" declared absent. Under the wider reading, that party's anchored acts elsewhere would block the declaration. **UNCLEAR.**

**Flaw (d): no declaration with a period can count yet.** Until the anchoring and time-reference formats exist, "one the anchors cannot place, does not count" applies to every declaration whose clause names a period. That includes freeze scenario 1 step 9, scenario 3 step 8 (a dead member's voice removed, if its clause names a period) and step 7k. The finding log says so ("FORMAT OPEN until then"), but the spec does not. **UNCLEAR.**

---

## 4. A debt outside its signer's powers still blocks every fork. BREAKS (F144)

**Sentence.** `spec/MIP-law-draft-10.md`, Fork (type 19): "field 6 names every obligation of the original in that history, published or not, paid or not, save one that is never the collective's: one sealed neither to every member nor publicly, or one on none of its chains, citing no decision (rule 35a and 35b, F144), one signed with a grant key included (F128)".

**The flaw.** F144 decided the rule by its reason: "a fork hands out the debts that bind the collective". The text still lists *forms*, and it lists only two of them. Rule 35b says "An act within its signer's powers counts for the collective", so an obligation that is done and on the chain, but signed outside its signer's powers, binds no one. It is not on the list of exceptions, so it must be handed out. The same goes for a grant-key debt outside the grant's scope ("one signed with a grant key included"). This is exactly reading C's problem, moved to a case F144 did not name. The reference's `to_hand_out` (`core/src/law/view.rs`) checks seal, validity and line, not powers, and the F144 build note adds only "done on the collective's chain".

**Smallest story.**
1. A collective has three members. Only the treasurer holds the Finance area.
2. Member C, who holds no Finance power, signs an obligation from the collective to C's friend for 1,000,000. C seals it to every member and puts it on the actions chain, citing the head. It binds no one.
3. A and B want to fork. Field 6 must name C's debt, and "each successor a debt is assigned to signed it".
4. So either some successor signs for 1,000,000 that the original never owed, and by its own signature now owes it, or the fork never takes effect.

Any member, or any grantee, can block the right of exit this way. Paper claim 8 ("A collective owes no debt it did not sign") is kept only in form: the successor did sign.

The fix in words: hand out what binds the collective (done, on its chain, and within its signer's powers or adopted). Say "binds" once, rather than listing forms.

---

## 5. A text format may hide decimal points, minus signs and vowel signs. BREAKS (F140 item 10)

**Sentence.** `spec/MIP-text-draft-6.md`, Text format task: "it may hide only characters that are not letters or digits (general categories L and N of the pinned Unicode version; F140)".

**The flaw.** Pinning the bound to L and N makes everything else hideable:
- M: combining marks, including the vowel signs that are part of words in Indic scripts.
- P: punctuation, including the decimal point and the hyphen-minus.
- S: symbols, including %, the minus sign U+2212 and currency signs.

"It must never add text" does not help, because hiding alone changes meaning.

**Smallest stories.**
- A royalty statement shown through a malicious format cMIP. The bytes say "Balance: −250". The format hides U+2212 (category Sm), so the reader sees "Balance: 250".
- The bytes say "price 10.00" and the reader sees "price 1000".
- In Hindi, "काम" (work) becomes "कम" (less) when the vowel sign U+093E (category Mc) is hidden.

The section's own reason, "A format that could hide letters could hide a clause from readers of an offer; bounding what it may hide keeps readers, not only signers, protected", is defeated by hiding a sign or a vowel mark rather than a letter. Rule 5's warning list (Cf, Bidi_Control, Default_Ignorable_Code_Point) is fine. The hide bound needs to include M, and at least Sm, Sc and the punctuation that can appear inside numbers, or be inverted to "may hide only the format's own markup".

---

## 6. Rounding leftovers can be moved by reordering holders, with no signature from those who lose. BREAKS (F140 item 4); the freeze suite disagrees (CONFLICTS)

**Sentences.**
- `spec/MIP-law-draft-10.md`, stakes: "leftovers to each stake's first holder (F140)".
- Rule 15a: "Any leftover from dividing a stake goes to that stake's first holder (F140)."
- Rule 21 likewise.

**The flaw.**
- Holders within a stake are not ordered by any rule; the CDDL requires only "holders distinct, each share above zero".
- Field 7 is operational (rule 44a), and rule 46 protects only the *share* ("Its stake never shrinks without its signature").
- So a clone that only reorders holders changes who gets the leftovers, needs no signature from the holder who loses them, and passes the operational clone rule.
- With small payments, the leftovers are most of the money. Split 1 unit among holders at 333,333 / 333,333 / 333,334: everyone's floor is 0, and the whole unit goes to the first holder.

**Smallest story.**
1. A collective earns from many 1-unit payments (tips, or an attention metric under rule 28). Its stake has a departed holder listed first.
2. The members, under the clone rule, sign a clone that puts a member first. No share changes, so the departed holder's signature is not needed.
3. From then on every 1-unit payment goes to that member.

Paper claim 6's bound is per split and still holds ("none above it by as many units as the stake has holders"). Claim 5 ("No stake or share moves without its holder's signature") holds in words, while money moves anyway.

**CONFLICTS.** `spec/03-MOR-freeze-test-suite-v21.md` line 83 still says "leftovers to the first listed party", which is the rule F140 replaced. Paper section 5.2 says "every payout matching its stake to within one smallest unit", but under this rule the first holder can be above by up to one unit fewer than the number of holders.

---

## 7. On a rail that binds no purpose, the receiver gets a veto. BREAKS where such a rail exists (F141)

**Sentence.** `spec/MIP-finance-draft-6.md`, rule 10: "where the rail binds no payee or purpose, neither counts until the receiver resolves them (rule 8a), and the disagreement stays shown (F141)."

**The flaw.** Before F141, "the greater amount counts as received until the receiver signs a receipt matching the proof", and "the claim alone shows the money arrived (F64)". Now, if the receiver signs a receipt naming any other purpose, the payer's payment counts for nothing until the receiver chooses to resolve it.

**Smallest story.**
1. On a rail whose Module binds no purpose (the Finance MIP is rail-neutral; payment cMIP draft 2 binds both on every rail written so far, which is why the finding calls this case rare), Debtor pays 500 toward an obligation and publishes a claim.
2. The creditor receives the 500 and signs a receipt calling it "a tip" (fulfils: their own payee pointer).
3. The claim and the receipt disagree in purpose, so neither counts. The debt stays open; the creditor never resolves and demands 500 again.

This also contradicts paper section 5.1 ("Where receipt and claim disagree, the disagreement is shown on the receiver and the greater amount counts"). A safer fallback for a rail that binds no purpose would be the one F64 already gives: the claim counts toward what it names, and the disagreement is shown.

**HOLDS** on request rails under payment cMIP draft 2 with a conforming wallet. I tried a payee who issues a request committing to a different purpose; the payer's wallet "recomputes the commitment from what the payee's side signed before paying" and refuses. That defence is client conformance.

---

## 8. A private link lets a thief show a forged "same person" proof to one victim only. BREAKS, small (F134); its termination brings back a "when" (UNCLEAR)

**Sentence.** `spec/MIP-identity-draft-11.md`, "The envelope": "A link's claim, confirmation and termination (types 6 to 8) may instead be private, encrypted as the Envelope MIP defines, their key delivered only to whoever should see them (F7, F134)."

**Story.**
1. A thief holds A's signing key.
2. The thief's identity T claims a link to A, and the thief confirms it with A's key, both privately.
3. The thief hands the pair, in a sealed container, to a bank, which then treats T as the verified identity A.
4. Before F134, a confirmation signed with A's key was public, and A's client or A's watchers would see it and rotate. A private one sent straight to the bank reaches no relay, so A never sees it.

The paper assumes "An owner notices a theft of the signing key and rotates"; this gives the thief a valuable use of the key that leaves nothing to notice. Private Law acts already allowed a thief to act unseen, so this widens an existing exposure rather than opening a new one. It should be written down as a stated cost of F134.

**UNCLEAR, a "when".**
- Identity rule 24 says "Ending stops the link going forward". With a private termination, "going forward" has no meaning for the party who was shown the link but not the termination: none of their acts can hold a termination they never received.
- By F133's working rule this needs a statement of which acts the ending applies to, for example "acts that hold the termination in their history".

**HOLDS.** I tried smuggling another private Identity act (a private witness act, rule 16) past verifiers. The type is inside the locked part, so only a key holder can tell what the act is. Envelope rule 7 says "A client MUST NOT treat a private act as valid for anything that depends on its inside unless it has opened and checked it", and a verifier that opens it refuses a private type 15. No verifier can be fooled. The F134 build note, "the core accepts private acts of types 6 to 8, and still refuses every other private Identity act", can be checked only by key holders; that is worth one sentence in the spec.

I also tried kept ancestry through a private link in the middle of a sequence. It holds, because the running summary of a later public act proves the earlier ones (Envelope, "Sequences"). It fails only where the rotation names a private link as a kept tip; a client should not do that.

---

## 9. F137's list of inputs no longer covers private Identity acts; the paper promises more than the text. CONFLICTS (F137 with F134; paper claim 1)

**Sentences.**
- `spec/MIP-identity-draft-11.md`, after rule 17: "These rules are part of validity and MUST give the same answer to every conforming verifier holding the same identity chain, acknowledgements, keeper records and inclusion proofs, and having made the same attempts to reach homes (rule 32a; F137). An answer that rests on the verifier's own failed attempts is marked as such; keepers, vault payments and agreements MUST NOT rely on it".
- Paper claim 1: "nothing binding may rest on it".

**F134 against F137.** Since F134, two verifiers can hold the same Identity acts while only one holds a link's content key. The promise does not name keys as an input, so it no longer covers private links. Add "and the same content keys" to the list.

**The paper says more than the text.** The normative text forbids three things from relying on an own-attempt answer: keepers, vault payments and agreements. The spec's italic note ("nothing binding rests on it") and paper claim 1 promise all of it. Other things that bind are not covered:
- A debt discharged by a flow payment to a pointer published after a homeless rotation that only the reader's own attempt counts (Finance rule 7).
- A Law fork or closing whose member's chain signature "counts in their identity chain" only through such a rotation.

Either widen the MUST to "nothing binding", naming Finance discharge and Law endings, or narrow the paper's claim to the three named.

**Hard to check.** "Having made the same attempts" is an input that no verifier can show another, so the promise can be checked only for answers that do not rest on attempts. That is what the marking achieves, and it is worth saying in the paper.

---

## 10. F139's proviso is silent on a payment with no payer's claim. UNCLEAR (F139; the finding and the spec disagree)

**Sentence.** Rule 15: "provided the payer's claim does not hold that rotation in its history".

The finding says "a receipt alone (no payer's claim) is judged as before", but that sentence is not in the spec. Read literally, with no claim there is nothing that holds the rotation, so the proviso is met and the payment counts. Or it cannot be met, and it does not count. Freeze scenario 1 step 5c ("A fan tips in good faith before the rotation; the payment counts as made") and scenario 5 step 2 (a reader tipping from a Finance-only wallet) both depend on which reading is right.

---

## 11. Sentences that still say "when", "before" or "later" with no anchor. UNCLEAR (question 3)

None of the twelve changes adds a new unanchored "when" to a validity rule. F136's "before the declaration's own anchored point" is anchored, and F140 item 3's "only when the agreement names a time reference" is a condition, not a time. But F133's working rule ("'when' is to be avoided unless anchoring is involved") is not yet met in the very rules F133, F138 and F139 rewrote:

| Where | Sentence | Note |
| --- | --- | --- |
| Finance, obligation field 3 | "the creditor's payee-pointer act in force when the obligation arose" | the format comment says what rule 14 abolished |
| Finance rule 14 | "Anything that arose under an earlier flow pointer counts only if paid to the vault." | "arose under" is a time |
| Finance rule 12a | "that pointer or vault being the payee's own and in force for that payment" | "in force for that payment" has no anchor; by finding 1, this is where the attack lives |
| Finance rule 15 | "A payment that followed both the published pointer and the published vault … even if a later rotation invalidates that pointer" | "published" and "later" are judged by nothing; F139's proviso stands in for them without replacing the words |
| Law, "Judged on its own history" (F143) | "an earlier final one"; "The answer does not depend on when a verifier is asked" | "earlier" means "named by"; the rule should say so |
| Identity rule 24 | "Ending stops the link going forward" | see finding 8 |
| Freeze suite, scenario 1 step 5c | "A fan tips in good faith before the rotation" | should follow F139's wording |
| Paper, section 5.1 | "An obligation names the flow pointer in force when it arose" | the paper states the rule F133 replaced; section 3.4 says "every rule is stated in terms of what cites what, never of when" |

---

## 12. "Judged on its own history" does not hold for a closing. CONFLICTS (F143)

**Sentence.** `spec/MIP-law-draft-10.md`, after the closing: "Whether a fork or closing is complete is judged on its own line and history, as if it were the ending that counts … *The answer does not depend on when a verifier is asked, nor on which ending it judged first.*"

The closing's own conditions reach past its history:
- "the collective holds nothing: no stake of a latest version of an agreement a verifier holds names it as a holder".
- The obligations must be "fulfilled in full by receipts a verifier holds", and those receipts may be signed after the line.

So a closing's completeness changes as later acts arrive, and the italic overclaims. It holds for *the order* in which endings are judged, which was verifier2's point. It does not hold for *when* the verifier is asked. Say "nor on which ending it judged first" and drop "when a verifier is asked", or move "holds nothing" onto the closing's history.

**HOLDS.** I tried to use F143 to change which ending counts, by making a later ending "complete" on its own history so that it ties with the first under U2. U2 needs two complete endings that share no signer and neither of which names the other. F143 changes only what is *shown* for an ending that names a final one. Verifier2's 4,000 stories agree on which ending counts.

**UNCLEAR.** If a later ending is shown "complete, counts for nothing", does a successor that signed for a debt in it owe that debt? "Only your own signature binds you" says yes. The fork text says "no successor owes a debt the fork did not hand it", which is silent on a fork that counts for nothing.

---

## 13. Rule 42 contradicts itself, and "an action" could be read to include a grant key's. UNCLEAR (F142)

**Sentence.** `spec/MIP-law-draft-10.md`, rule 42: "An acknowledgement of a grant key's act counts as an adoption only when it is an act of the collective's own key that counts (rule 40), wherever it sits (C6): **done, sealed to every member and on the collective's chain (rule 35a). An Identity witness act (type 15), on neither chain, adopts nothing; the collective adopts by an action citing the act (F142).**"

- "wherever it sits" now contradicts "on the collective's chain"; C6's sense, that where the act is *stored* does not matter, should be said in those words.
- "the collective adopts by an action citing the act" drops "of the collective's own key". Rule 40 says "no act signed with a grant key adopts anything", and a grantee's strand is "like a device of the collective" whose actions are on the chain.

Story under the loose reading: a split service's grant key signs a receipt whose `objects` join a revoked grantee's head, as client conformance asks ("cites … every head it holds"), and that receipt adopts the void act. Rule 40's last sentence decides against this, so the rule holds if read with rule 40. Repeat "of its own key" in rule 42's new sentence.

**HOLDS.** I tried a witness act signed by the collective, which is the reading A case. It now adopts nothing in either reading. Identity rule 16, a witness act keeping a *rotated-away* act alive as a dispute, is untouched: it concerns acts of another identity, not grant keys.

Freeze scenario 3 step 5 ("The label adopts it by an act of its own key, acknowledging it") does not say which act. After F142 it must be an action on the chain. Worth one word in the suite.

---

## 14. The rail-kind field does not exist. UNCLEAR, cannot be checked as written (F140 item 1)

**Sentence.** `cmips/cmip-payment-draft-2.md`, item 3: "whether it is a request rail or a push rail (F128, W4), declared in a field of the Module's specification that a client reads, never set by hand (F140)."

The Production specification format (`spec/MIP-production-draft-6.md`, fields 0 to 10) has no such field; only field 9, the prose. Until the field is defined, two clients can read the prose differently. Under Finance rule 10c the purchase verdict on a push rail differs from that on a request rail, so one payment is a purchase for one verifier and owed back for the other. That breaks paper claim 1's "same verdicts". Mark the field "format open", as items 5 to 8 are.

---

## 15. "Ten unclear rules made checkable": six are not, yet. UNCLEAR (F140; the paper's section 7.3)

Items 5 to 8 are formats left open. Item 9 is turned into client conformance, which "a verifier cannot see". Item 1 names a field that does not exist (finding 14). Only items 2, 3, 4 and 10 became checkable. The paper's section 7.3 says the 16 rules that "could not be checked as written" are "all since decided, F134 to F140". "Decided" is true and "checkable" is not, so the paper should keep them in its gap count.

Item 9 (rule 46b, a fee to a service the members own) deserves its own story, since equal treatment rests on it:
1. Three members and one departed holder each hold 25%.
2. The members found a service S that they own. Under the clone rule they add a 40% fee to S, taken alike from every stake, as rule 46b requires.
3. Most of the fee returns to the members as owners of S; the departed holder's 40% does not.

Rule 46b's italic says the fee "is seen by everyone it is taken from", but what is seen is the fee, not who owns S. After F140 the ownership is disclosed only by a conforming client, and only to the members, not to the departed holder who pays. This was decided as client conformance; it should also be written down as a stated cost.

---

## 16. Does a hash in the payload count as "holding" it? UNCLEAR (F133, third sentence)

Obligation field 3 already names the pointer act. If naming in the payload counts as "holding in its history", then the IOU fallback ("one the obligation act itself holds in its history") is met by every IOU and checks nothing. The reference's `finance::pointer_cited` (`core/src/finance.rs`) walks only `prev` and `objects`, so it reads the stricter way. Under that reading, an honest IOU that names the pointer in field 3 alone never counts on the flow. The spec should say which: "cites in `prev` or `objects`" or "names anywhere". Under either reading, finding 1's IOU story stands, because the debtor chooses the pointer.

---

## 17. F138 picks the latest pointer while F133 accepts any held. CONFLICTS (F133 against F138)

- F138 says "the latest of the payee's chain it holds".
- F133 says "one its agreement act holds". That is any version, not the latest.

Under one agreement, a direct payment follows the latest pointer the agreement holds, while an obligation may name an older one the same agreement holds. Rule 14 then counts a payment to that older pointer's flow for the obligation (it names "that flow pointer's version"), even where the payee has since moved off that wallet. Use one selection rule for both.

---

## 18. A stale sentence about which fields may be null. CONFLICTS, editorial (F135)

The claim format still says "The signed bytes are the array shown, encoded in deterministic CBOR, with null where key 7 is absent". After F135, keys 5, 6 and 9 are also null when absent. Two implementers who follow the prose and the CDDL respectively will compute different bytes for a claim without key 5.

---

## 19. Attacks I tried that held

- **F140 item 3: removing the time reference to free the authority.** I tried whether a clone signed by fewer than every member could drop the agreement's time reference, so that every clause with a period falls back to "the authority's judgment". It cannot: field 6 (the time reference) and task 10 are judicial, like field 9 (the clause), and both change only with every member (rule 44a). Held.
- **F139 without a payer working with the thief.** A thief alone cannot write a payer's claim, and cannot write an anonymous payer's claim without its key-8 signature (finding 2 needs an existing claim to rewrap). Held, apart from findings 1 and 2.
- **F144 hiding a debt to escape it.** A debt sealed to the creditor alone, or on no chain, binds no one and need not be handed out. Hiding it gains the collective nothing (Law, "Debts": "hiding gains nothing"). Held.
- **F142 adoption by a member's own identity.** A member's own act, not the collective's, adopts nothing under rule 40 or rule 42. Held.
- **F136 an authority anchoring a declaration "in the future".** An anchor proves only that the act existed by a point. Anchoring late only widens the period in which the party's acts protect them. Held (the reverse direction is finding 3).
- **F141 a payer forging a purpose.** On a rail that binds purpose, the commitment the rail proof carries decides. A payer's claim naming another obligation counts for nothing. Held.

---

## 20. Effect on the paper's section 6.2 (question 4)

| Claim | Effect of F133 to F144 |
| --- | --- |
| 1, same verdicts | stated with its inputs (F137), but private links add an input it does not name (finding 9); "nothing binding" is stronger than Identity's MUST (finding 9); the missing rail-kind field allows two readings (finding 14) |
| 2, a stolen key cannot outlast the next rotation | **weaker than stated**: the thief's pointer keeps collecting after the rotation through a payer who works with the thief (finding 1) |
| 5, no stake moves without its holder | held in words; rounding money moves by reordering (finding 6) |
| 6, splits exact up to rounding | per-split bound holds; section 5.2's "within one smallest unit" is contradicted (finding 6) |
| 7, a thief cannot collect older obligations | holds for obligations older than the theft; it does not cover new terms drafted by the payer (finding 1) or IOUs (finding 16) |
| 8, a collective owes no debt it did not sign; final endings | the right of exit can be blocked by a debt outside its signer's powers (finding 4) |
| 9, ending against action | unaffected |

Outside section 6.2, sections 5.1 and 3.4 still describe the pre-F133 and pre-F141 rules (findings 7 and 11).

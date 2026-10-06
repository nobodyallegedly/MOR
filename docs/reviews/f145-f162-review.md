# Hostile review of F145 to F162

*6 October 2026. Written for Nobody, allegedly. This review reads decisions F145 to F162 at the end of `docs/findings/MOR-findings-log-round-2.md` and their text in `spec/` (Finance draft 6, Identity draft 11, Law draft 10, Text draft 6, core v21, the freeze test suite v21), against the review they answer (`docs/reviews/f133-f144-review.md`), the build's report (`docs/review-decisions-build-2026-10-06.md`, which lives on branch `review-decisions-f145-f156`, not on main), the rest of the core (Envelope draft 7, the payment cMIP draft 2) and the paper (`docs/paper/mor-paper-draft-2.md`). Nothing in `spec/` or the code was changed. The reviewer built none of this.*

*One fact about the state of the repository first: the spec on main carries every decision through F162, but the code on main carries none of F145 to F162; the build of F145 to F156 is on the branch above, and F157 to F162 are not built anywhere yet. So where this review says "as written", it means the text, and the code could not be used to settle a reading.*

## In plain words first

The eighteen decisions were made quickly, and most of them were the right direction: judge a pointer by the act of the person it pays, not the person who pays; make an anonymous signature cover everything; make a rounding rule that nobody can steer by reordering names. But several of them were written one layer too high: they say "the payee's own act holds the vault", or "ties are broken by a hash nobody can choose", or "a declaration cannot be kept and used later", and the layer underneath (how an act cites, who picks the bytes of a receipt, who can acknowledge) does not deliver what the sentence promises. Six things break, two of them in common cases.

1. **The vault rule no longer reaches an ordinary person's payments (F160).** Rule 12a says the vault that applies is the one "the payee's own act for the payment holds", found through the act's citations. But the vault lives in genesis or a rotation, on the identity chain, and an ordinary person's everyday acts never cite the identity chain: the `binding` field that points at it is not one of the four citation keys the rule names. So no publication, offer or signature of a person ever "holds" a vault. Read literally, rule 14a then says "an identity that declares no vault has no vault rule: every payment goes to its flow". Read charitably, through the binding, the vault is frozen per act, so an owner who is robbed and sets the flow off by rotation does not protect a single payment under their existing deals and publications. Either way the sentence does the opposite of what the vault is for.
2. **A person with two devices has two sequences, and the pointer walk only follows one (F157).** The rule says the payee's pointers "are acts in the payee's own sequence". A person who publishes their wallet from a laptop and signs a deal from a phone has a signature that holds no pointer at all, and a deal whose debts can be paid only to the vault, or, with no vault, nowhere. This is a common case that needs no attacker.
3. **The good-faith proviso excludes nobody who does not want to be excluded (F146, F147, F154).** A payment to a stolen pointer counts if "any" of the payer's claims does not hold the rotation, and a payer can always write one more claim citing nothing. The anchoring escape offered to owners does not work: it applies only when the payer's claim is anchored too, and a payer colluding with the thief simply does not anchor. The owner cannot turn it on alone. So the recommendation "anchor where there is value to protect" protects nothing against the one attack it is recommended for. The paper's claim 2, "a stolen signing key cannot outlast the owner's next rotation", is not true for the thief's offers: anyone the thief hands them to can keep buying under them.
4. **Ties "broken by a hash nobody can choose" are chosen by whoever signs the receipt (F150).** Every act carries a random 16-byte salt picked by its signer, so a split service can try salts until the tie falls where it wants. With equal shares and small payments, every payment is a tie, so this is the same attack F150 was meant to close, moved from the majority to the service the members own.
5. **A declaration can still be kept and used later, with one accomplice (F148, F158).** The authority anchors the declaration during a two-week gap; one other party acknowledges it, anchored, in the same week; both keep quiet until it is useful. The declared party's acts after the acknowledgement count for nothing. The sentence "so a declaration cannot be kept and used later" is not true as written.
6. **A format now declares its own bound (F149).** "It may hide only its own markup: the characters its specification declares as markup" means the format's author decides what may disappear. A format that declares the decimal point as grouping markup hides it with a clean conscience, and the client check against the declaration passes.

Smaller: a two-member collective with a period clause cannot use it without a keeper or third party, which is the "use the added feature" answer given to a common case; a private link can be shown as unknown but the spec gives no way for it ever to stop being unknown, and Identity rule 26 still lets the owner store it under one identity only, which now means it never counts; a refund owed to an anonymous buyer falls under rule 14's "counts only if paid to the vault" although rule 10a pays it to a bare key; payer-side splits cannot compute F150's tie hash at all; on a rail that binds nothing, a payer can relabel an old tip as a debt payment; one "afterwards" survived F161.

What held: the walk through the payee's own acts does stop the colluding drafter (review finding 1's first story); homes are declared with the safety key, so a thief cannot move where a private link must be published; the anonymous signature's covered keys are the right Envelope keys; largest remainder does make reordering holders harmless; a member's liveness act in a collective does not depend on the collective acknowledging it; the arithmetic in freeze steps 7t and scenario 9 is right.

## How findings are marked

- **BREAKS**: an attack works, or a common case does not work.
- **CONFLICTS**: two rules, or a rule and the suite or the paper, disagree.
- **UNCLEAR**: the text can be read two ways, or cannot be checked as written.
- **HOLDS**: I tried an attack and it failed; I say what I tried.

Each finding gives the exact sentence, its file, the smallest story, and a verdict. Findings are ranked by what they cost.

---

## 1. The vault is "held" by an act that cannot hold it. BREAKS (F160); CONFLICTS with rule 14a's "declares no vault"

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 12a: "that vault being the one, with its limits, that the payee's own act for the payment holds, selected as rule 14 selects the pointer: the payee's signature act on the agreement, the offer, or the publication paid, walking through the payee's own acts only (rule 14a; F160)".
- Rule 14a: "The vault and limits that apply to a payment are those the payee's own act for it holds (rule 12a, F160): a payer is judged by what the payee showed, never by a limit the payee set afterwards. An identity that declares no vault has no vault rule: every payment goes to its flow".
- Rule 14, the definition of "holds": "An act holds what is reachable through its citations (`prev`, `objects`, `acks`, `refs`, directly or through what they cite), never a hash merely written in its payload".

**The flaw.** The vault is "Declared in the Identity MIP's declarations slot, in genesis or a rotation" (Finance, "The vault"). Genesis and rotations are identity-chain acts: "Genesis and rotations carry neither `binding` nor `prev`: they belong to the identity chain, not to a sequence" (Identity, "The envelope"). An everyday act reaches its chain act only through `binding`, which is an outside field (Envelope, outside key 1), and `binding` is not among the four citation keys rule 14 lists. Nothing in Envelope, Identity or Finance makes an individual's everyday act cite a chain act in `objects` or `refs`. (A collective's actions do cite its decisions chain, Law rule 35b, so for a collective the walk reaches its rotations.)

So for a person, no signature act, offer or publication ever "holds" a vault. Two readings follow, both bad:

- *Literal.* The payee's act holds no vault, so rule 14a's "An identity that declares no vault has no vault rule: every payment goes to its flow" applies to every payment under every deal, offer and publication of every person. The vault would protect nothing but tips to a pointer followed directly, and rule 14 says even a tip's pointer is "the version of the payee pointer it follows", so the vault would protect nothing at all.
- *Through the binding.* If "holds" is read to include the binding, then the vault that applies is the one in force at the chain act the payee's signing key was bound to when the act was signed. That is option (c) of the build report's question A, not option (b) that F160 decided, and it has the consequence in the story below.

**Smallest story (the binding reading, the charitable one).**
1. Owner's vault limit is 1,000 in one unit. Owner has published fifty songs and signed three royalty deals, all under that vault.
2. Owner's phone is stolen: signing key and hot wallet together, the case the vault exists for ("the flow is easy to change and easy to steal").
3. Owner rotates with the safety key and sets the limit to 0: flow off, everything to the vault.
4. Every tip to the fifty songs and every royalty payment under the three deals is still judged by "the vault and limits that apply to a payment are those the payee's own act for it holds": limit 1,000. A payment of 900 to the flow still "counts as paid to the flow" (rule 14a), and the flow is the wallet the thief holds.
5. To make the new limit reach them, Owner must re-publish fifty songs and re-sign three deals, the deals needing every party (freeze scenario 1: "every clone of it needs every contributor").

The decision's motive was a payment *already made* under the old limit (the fan's 900). The sentence as written governs payments not yet made as well. Without a clock the two cannot be told apart by the payee's act; they can only be told apart by the payer's act (the claim's history, as rule 15 does for the pointer), and the spec does not say so. "never by a limit the payee set afterwards" is also an unanchored "when" (finding 14).

**Verdict.** BREAKS. Under the literal reading the vault never applies; under the binding reading the vault cannot be tightened for anything the owner has already signed, which is the moment it is needed. The spec must say which reading it means, and the sentence needs the payer's side (what the payer's claim held) or a rule that a later rotation's vault applies to later payments by some anchor the payer can hold.

---

## 2. A payee with two devices has two sequences; the walk follows one. BREAKS, common case (F157 with F145, F155)

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 14: "The version that counts for an obligation is the latest of the payee's pointer chain held by an act of the payee's own: the payee's signature act on the agreement, or the offer the agreement accepts … for selecting the payee's pointer, the walk passes only through the payee's own acts, never through an act another identity signed".
- F157's reason, in the findings log: "The payee's pointers are acts in the payee's own sequence, so the walk finds the latest one the payee had published when signing."
- `spec/MIP-envelope-draft-7.md`, "Sequences": "Parallel devices keep separate sequences."
- `spec/MIP-identity-draft-11.md`, rule 17: "Clients SHOULD track every sequence the owner has started, on any device".

**The flaw.** An identity does not have one sequence; it has one per device. The walk from a signature act passes through `prev` down that device's sequence, and through `objects`, `acks` and `refs` only into acts another identity signed, where F157 stops it. A payee pointer published from another device is in another sequence, and nothing in Envelope or Finance makes an individual's act cite the heads of its other devices (Law rule 35b does that for a collective's devices; nothing does it for a person). The pointer chain itself links its versions by payload key 2, which rule 14 says never counts.

**Smallest story (no attacker).**
1. Ana sets up her wallet on her laptop and publishes pointer v1 there (sequence L).
2. Ana signs a film deal from her phone (sequence P). The signature act's history is P's acts and the terms (another's act, where the walk stops). It holds no pointer.
3. Rule 14: "An obligation with no such act … counts only if paid to the vault, until the payee acknowledges it with an act of their own that holds a pointer." Every royalty under the deal can go only to Ana's vault.
4. Ana declared no vault. Rule 14a: "every payment goes to its flow"; rule 14: not to the flow. The debtor's wallet has nowhere to pay. Rule 16 leaves the debt open.
5. To fix it Ana must sign something on the deal from the laptop, and the spec does not say that a second signature act by a party counts as "the payee's signature act", nor which one counts when there are two (finding 11).

Variant: Ana publishes v2 from the phone and signs from the laptop; the walk selects v1, a wallet she has left. Rule 14's italic calls this "a stated cost (F155)", but the stake there was a payee who moved wallets after signing; here she moved before.

**Verdict.** BREAKS. F157 holds only for a payee with one device. The spec needs either a rule that an individual's acts cite its other heads (as a collective's do), or a selection that reads the payee's pointer chain (rule 12) as published, bounded by what the payee's act holds in the identity chain, or a stated requirement on the payee's client to cite the latest pointer in `refs` when signing anything that pays (client conformance, which a verifier cannot check, so it would be a stated cost).

---

## 3. The good-faith proviso excludes only the honest; the anchoring escape cannot be turned on by the owner. BREAKS (F146, F147, F154); the paper's claim 2 overstates

**Sentences.** `spec/MIP-finance-draft-6.md`, rule 15:
- "A payment that followed both the pointer and the vault published on the payee's chain counts as made, even if a rotation invalidates that pointer (F161), **provided the payer's claim does not hold that rotation in its history** (the payer had not seen it; F139)."
- "A payer's several claims for one payment are read together: the payment counts as made if any of them meets this proviso (F147)."
- "Where both the payer's claim and the rotation are anchored, the anchor order decides instead: the payment counts as made only if the claim is anchored before the rotation (F146)."
- The italic: "Anchoring narrows that cost; it never becomes required. Documentation for owners recommends anchoring rotations and claims wherever there is value to protect."

**The flaw.** Three sentences, read together:
- A claim citing nothing always meets the proviso; the spec says so itself ("The payer could always have written such a claim").
- "If any of them meets this proviso": a payer whose first claim holds the rotation, or is anchored after it, writes a second claim citing nothing, and the payment counts.
- The anchor rule bites only "where both … are anchored". The owner can anchor the rotation; the owner cannot anchor the payer's claim, which the owner may never see. A payer who wants the payment to count leaves the claim unanchored and the floor applies.

So the proviso and the anchor rule exclude exactly one kind of payer: an honest one who wrote a claim holding the rotation and never wrote another. The two sentences also contradict each other for a payer with one anchored-late claim and one bare claim: the anchor sentence says "only if the claim is anchored before the rotation", the read-together sentence says any claim suffices.

**Smallest story.**
1. A thief with Owner's signing key publishes pointer v3 and a standing offer for Owner's whole catalogue at one unit each, and hands the offer, the pointer and the content keys to a friend.
2. Owner rotates and anchors the rotation, as the documentation recommends.
3. For a year, the friend and anyone the friend passes the acts to pay one unit to v3 for each work, each writing a claim that cites the thief's offer in `acks` and nothing else, unanchored.
4. Identity rule 16: the thief's offer, acknowledged by another identity, is "valid and shown as disputed". Rule 15: the claim does not hold the rotation, nothing of the payer's is anchored, so the payment "counts as made". Rule 10c: a purchase under a valid offer.
5. Owner's anchoring changed nothing. The loss is unbounded in time, and rule 15's closing sentence, "The loss from a theft window falls on the owner", names a window that never shuts.

**Why it matters for the paper.** Claim 2: "A stolen signing key cannot outlast the owner's next rotation: the thief's acts outside the kept line are void, except those a third party relied on". The exception is the whole attack: reliance is proven by a bare claim anyone can write at any time. Section 5.1's "the loss from a theft window falls on the owner" is true; "window" is not.

**What would be checkable** (not proposed as text): either the payer's claim must be anchored for the payment to count against a rotation that is anchored (so the owner's anchoring does something, at the cost of unanchored tips after an anchored rotation), or the proviso is dropped and the sentence says plainly that any payment to a voided pointer counts, which is what the three sentences already amount to.

**Verdict.** BREAKS, and CONFLICTS inside rule 15 (the anchor sentence against the read-together sentence).

---

## 4. The tie hash is chosen by whoever signs the receipt. BREAKS (F150, F162 items 7 to 10)

**Sentences.**
- `spec/MIP-law-draft-10.md`, rule 15a: "holders with equal remainders are ordered by the hash of the receipt of the payment being divided together with the holder's identity (tagged_hash("MOR/law/leftover", [ receipt hash, holder ]), the array in deterministic CBOR, smallest first)".
- Reasoning: "ties broken by the payment's hash cannot be chosen by anyone and even out over many payments."
- `spec/MIP-envelope-draft-7.md`, inside key 10: "salt: random, so the inside commitment cannot be guessed". The act id is "tagged_hash("MOR/act", outside)", and the outside commits to the inside.

**The flaw.** The receipt is signed by the receiver, in a split by the split service (Finance rule 1). Its act id depends on its inside, and the inside carries a 16-byte salt the signer chooses freely. The signer can compute the tie for each candidate salt before signing and sign the one that sends the unit where it wants. Nothing on a tie is deterministic from the signer's point of view; it is deterministic only for verifiers after the fact. The same holds for the fork act's signer (F162 item 10, "ties ordered by the hash of the fork act with each side") and for the payer's claim where "the claim's hash stands for the receipt's".

**Smallest story.**
1. A duo's work has stakes 500,000 / 500,000. One member has left; the other member owns the split service (rule 46b allows it; the ownership is disclosed to members only).
2. The work earns from one-unit payments (streams, tips through the metric of rule 28). Every unit is a tie: both remainders are 0.5.
3. For each incoming receipt the service tries salts until `tagged_hash("MOR/law/leftover", [receipt, member])` is the smaller, then signs. Every unit goes to the member. The split sums exactly, each payout is within one unit of its share, and the check passes.

This is F140's attack ("every 1-unit payment goes to that member") with the attacker moved from the majority, who needed a clone, to the service, who needs nothing. The departed holder's protection, rule 46 ("Its stake never shrinks without its signature"), is kept in words and lost in units.

**The usual fix** is stateful: carry each holder's accumulated fractional shortfall from split to split, on the service's own sequence, and give the leftover to the largest carried shortfall (so ties resolve by history, not by a hash). It is deterministic for every verifier that holds the service's splits in order, which rule 20 already requires. Whether that is wanted is for Nobody, allegedly.

**Verdict.** BREAKS. The reasoning sentence "cannot be chosen by anyone" is false; the tie is chosen by the receipt's signer.

---

## 5. A declaration can still be kept and used later, with one accomplice. BREAKS (F148, F158); the effect of a late one is undefined

**Sentence.** `spec/MIP-law-draft-10.md`, rule 51: "the declaration counts only once an acknowledgement of it by an identity other than the declaration's signer (or, for a threshold, its signers) and other than the declared party, another party or the keeper, is anchored within one further period after the declaration's own anchor (F158), with no act of the declared party on the agreement anchored between the two, so a declaration cannot be kept and used later (F148)".

**The flaw.** An anchor proves that an act existed by a point; it proves nothing about who had seen it. The check looks only at the declared party's acts *between the two anchors*. After the acknowledgement's anchor, the declared party's acts count for nothing, and nothing requires either act to be published at any point. F158 removed self-acknowledgement; it did not remove acknowledgement by an accomplice.

**Smallest story.**
1. A film deal with three contributors, a two-week period, the keeper's operator as authority (freeze scenario 1's shape).
2. Contributor C is away three weeks in January. The operator anchors a declaration against C in the second week; contributor A, who wants C's stake, anchors an acknowledgement two days later. Neither publishes either act.
3. C returns and works on the deal, anchored, every week until October.
4. In October the operator publishes both acts. Rule 51: the declaration is anchored; C had no anchored act in the two weeks before it; the acknowledgement is anchored within a further period; C had no act anchored "between the two". Every check passes.
5. Rule 53: stake redistributed "in a deal from the declaration on", and "a declaration draws its own line" (Q28). Nine months of splits paid C under the old stakes; the spec does not say what those splits now are (matching the stakes in force when they were made, or "not matching the stakes" and so broken under rule 46b). Rule 52's contest is only shown.

In a collective, the same two members remove a third who went on holiday, at a time of their choosing.

**Verdict.** BREAKS. "so a declaration cannot be kept and used later" is a claim the rule does not deliver. What anchoring can deliver is a bound on *when the acts existed*; it cannot deliver *when they were shown*. A rule that held would need the declaration to be bounded on the other side as well, for instance by requiring that it take effect only at a line the declared party's later anchored acts can beat, or by stating plainly that a kept declaration is a cost of naming a period and leaving it to the parties to anchor a contest.

---

## 6. A duo with a period clause needs a keeper. CONFLICTS with the working rule of F159 (F158)

**Sentences.**
- `spec/MIP-law-draft-10.md`, rule 50 italic: "Where no such identity exists (a two-party deal whose other party is the authority, with no keeper), a declaration under a period clause cannot count; a client MUST warn at signing that the clause needs a keeper or a third party to work, a stated cost (F158)."
- Rule 36b: every collective's abandonment clause "MUST" cover every party with constitutional power; "a named authority does not cover itself".
- Findings log, F159: "A common case would not get the 'argh just use the added stuff' reply. A stated cost, with an additional feature as the safer path, is acceptable for rare cases; a common case must work safely by default."

**The story.** Two musicians found a collective, a duo. Rule 36b forces an abandonment clause that covers both, so each is the authority over the other, or a third party is. A period clause is the only form that protects a member from the other's whim: with no period, "the declaration is the authority's judgment", so either member removes the other's voice at will (outcome 0, mandatory under 36b). With a period, the acknowledger must be "an identity other than the declaration's signer … and other than the declared party": in a duo, nobody, unless they name a keeper or a third party. A keeper is "additional security, never compulsory" in Identity's words and optional throughout Law.

So the safe form of the one clause every collective must have works for a two-member collective only with an added feature. Duos are not a rare case. The text states the cost honestly; it is the working rule that it conflicts with.

**Verdict.** CONFLICTS (with F159's working rule). A way out that needs no third party: let the declared party's *anchored* contest within the further period defeat the declaration, so the acknowledgement is not needed where the declared party can speak for themselves. Not proposed as text.

---

## 7. A format declares its own bound. BREAKS, small (F149)

**Sentence.** `spec/MIP-text-draft-6.md`, "Text format": "It may change how text looks, but it may hide only its own markup: the characters its specification declares as markup, in the positions it declares them, and nothing else (F149, replacing F140's bound by Unicode category)". The reasoning: "the bound is the format's own declared markup, which a verifier checks against the format's specification, never a list of categories (F149)".

**The flaw.** F140's bound was set by the protocol; F149's is set by the format's author. The reader's protection was supposed to hold against the publisher, who chooses the format ("A format that could hide letters could hide a clause from readers of an offer; bounding what it may hide keeps readers, not only signers, protected"). Now a publisher writes, or picks, a format whose declaration says what it wants hidden, and a conforming client that checks the rendering against the declaration finds nothing wrong.

**Smallest story.**
1. A format cMIP declares: "U+002E FULL STOP between two digits is grouping markup and is not shown; U+2212 MINUS SIGN before a digit is a sign marker and is rendered as colour."
2. A royalty statement's bytes say "Balance: −2.50". The reader sees "Balance: 250" in red.
3. The client's check (long-form cMIP rule 12's shape: "each hidden character against that table") passes, because the table says so.

Plain display remains the fallback, as before; the point of the bound was readers who do not use it. Review finding 5's stories are closed only for the long-form format whose declaration the build wrote honestly; they are open for any format whose author is not honest.

**Verdict.** BREAKS, small. The two bounds compose: a format may hide only its declared markup *and* never a character of categories L, N, M, P or S. Or the spec says plainly that the bound protects against a tampered rendering, not against a hostile format, and that choosing a format is trusting its author.

---

## 8. A private link can be "unknown" and the spec gives no way for it to stop being unknown; rule 26 contradicts the new publication rule. UNCLEAR; CONFLICTS (F152, F159)

**Sentences.** `spec/MIP-identity-draft-11.md`, "The envelope":
- "A private link act counts only if its sealed form is published at the homes its signer's chain names at the link act's binding (its place in that chain); a later move of homes does not void it (F152, F159)."
- "What a verifier found at those homes is an input like its own attempts: where it decides anything binding, the answer is shown as unknown until it no longer rests on that verifier's fetch alone (F153, F159)".
- Rule 26: "Copies of a private link MUST be encrypted separately, so that stored copies cannot be matched to each other. The owner MAY store a private link under only one identity, or delay the second copy."

**Cannot be checked.** For a reader's own failed attempts there is an exit: the old home closes, or auditors attest absence. For "this verifier's fetch alone" there is none. A home signs receipts for identity-chain acts only (Identity, "Receipt"); a sealed link is an everyday act, so no receipt or inclusion proof exists for it, and another verifier's fetch is not an act anyone can hold. A verifier that fetched the act has an answer resting on its own fetch today, tomorrow and forever. "Until it no longer rests on that verifier's fetch alone" names a condition that can never be met, so for anything binding a private link is unknown for good. If nothing binding depends on a link (rule 25: "A link gives no authority"), the sentence costs nothing and should say so; if something does, the sentence needs an exit, for instance a home receipt for sealed links.

**CONFLICTS.** Rule 26 lets the owner "store a private link under only one identity, or delay the second copy". A link is two acts by two signers (the claim and the confirmation), each of which now "counts only if its sealed form is published at the homes its signer's chain names". A link stored under one identity only has one unpublished half, so by rule 23 ("A link counts only when both sides have signed") it does not count. Rule 26 describes a choice that F152 took away.

**HOLDS.** I tried the obvious attack on F152: a thief with the signing key moves the homes, publishes the link at a home of their own, and the owner never sees it. It fails: homes are declared in genesis or a rotation (Identity, "Shared parts", `home`), which need the safety key; routes acts name outbox and inbox relays, not homes. I also tried the thief publishing at the owner's real home and showing the bank in the same hour: this works once, the owner's client sees the act afterwards and rotates, and the bank's decision is off-protocol and already made. F152 narrows the exposure from "never noticed" to "noticed after one use". The text's own words ("sees an act they did not write and can rotate") are honest about this.

**Verdict.** UNCLEAR (the exit from unknown) and CONFLICTS (rule 26).

---

## 9. A refund owed to an anonymous buyer cannot count under rule 14. CONFLICTS (F145 against rule 10a)

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 14: "An obligation with no such act, such as one naming no agreement act (field 4 absent), counts only if paid to the vault, until the payee acknowledges it with an act of their own that holds a pointer".
- Rule 10a: "A refund owed on a payment whose payer is not named is owed to whoever signs with the bare key the payment committed to as its payer (receipt field 2): it is paid where a claim carrying that key's valid signature (key 8) says (key 7)."
- Rule 7: "An obligation is discharged when valid routes ending at the creditor's payee pointer, each naming the obligation, sum to the owed amount."

**The flaw.** A refund is an obligation with no agreement act, owed to a creditor who is a bare key. The creditor has no vault and no pointer, so rule 14's sentence says the refund counts only if paid to a vault that does not exist, and the acknowledgement that would lift that must "hold a pointer", which the anonymous buyer does not have. Rule 10a says the refund is paid to the rail in the claim's key 7. Both are rules of the same MIP; one says the payment to key 7 counts, the other says it does not. Freeze suite scenario 2 step 6 and scenario 5 step 2 run the rule 10a reading.

**Verdict.** CONFLICTS. One sentence fixes it: refunds under rule 10a are outside rule 14's selection.

---

## 10. Payer-side splits cannot compute the tie hash. UNCLEAR (F162 items 8 and 9)

**Sentences.** `spec/MIP-law-draft-10.md`, rule 15a: "where a split is made from a payer's claim with no receipt, the claim's hash stands for the receipt's; a payer's wallet that divides before any receipt exists shows that a tied unit is decided by the receipt's hash, the uncertainty at most one unit per tie, which satisfies rule 4a (F162)". Law, "Payer-side splitting": "the payer's wallet, reading Law, pays each holder's own pointer by the stakes of the work's claim, one flow with the holders' identities as destinations".

**The flaw.** In a payer-side split there is no payment "being divided": the wallet makes one payment per holder, and each holder signs its own receipt afterwards. The receipt whose hash decides the tie does not exist when the wallet must decide how much to pay each holder, and once the receipts exist there are several, one per holder, none of them "the receipt of the payment being divided". "The claim's hash stands for the receipt's" does not help: the claim carries the rail proof (field 1) and the amount (field 3), which exist only after the payment the amount decides. The rule is circular for the payer and undefined for the verifier. "Shows that a tied unit is decided by the receipt's hash" shows the payer a rule that nothing can evaluate.

**Verdict.** UNCLEAR, cannot be checked as written. Either payer-side splits get their own tie rule (the payer decides, within one unit, stated), or F150's rule is service-side only and says so.

---

## 11. Which signature act, when a party has several; a wallet moved after signing never reaches the deal; rule 12a's reasoning still says the old rule. UNCLEAR; CONFLICTS (F155, F157)

**Sentences.**
- `spec/MIP-finance-draft-6.md`, rule 14: "the payee's signature act on the agreement".
- `spec/MIP-law-draft-10.md`, rule 5 and the signature format: "Signatures naming one act are parallel consents to it, never a fork among themselves". Nothing forbids a party signing the same terms twice.
- Rule 12a's italic: "A new rail Module therefore needs a new payee pointer (the signing key) or a new vault (the safety key), never a clone of an agreement."
- The reasoning for F115: "Rail Modules change far more often than agreements; if terms named them, every upgrade would need a clone, every party signing in a deal."

**UNCLEAR.** If a payee's second signature act on the same terms is valid (the text does not say), which one is "the payee's signature act"? The latest the verifier holds? The first? The answer decides which wallet a year of royalties goes to, and the two obvious answers differ. If the second is not valid, finding 2's fix does not exist.

**CONFLICTS.** Under F155 and F157, the version that counts for a deal is frozen at the payee's signature: a payment to a *newer* pointer than the one selected "counts only if paid to the vault" (rule 14's first sentences; F155's correction: "a newer wallet counts only once a payee's act holds it (until then, the vault)"). So when a payee adopts a new rail by publishing a new pointer, as rule 12a's italic says they should, no payment under any existing agreement can reach it. The payee needs a new act on each agreement. Rule 12a's reasoning, "never a clone of an agreement", describes the rule before F155. Whether re-signing suffices depends on the UNCLEAR above; if it does not, every rail change needs a clone in every deal, which is the cost F115 was written to avoid.

**Verdict.** UNCLEAR (which signature act) and CONFLICTS (rule 12a's reasoning against rule 14).

---

## 12. On a rail that binds nothing, a payer relabels an old tip as a debt payment. BREAKS, rare, and the cost is not stated (F151)

**Sentence.** `spec/MIP-finance-draft-6.md`, rule 10: "where the rail binds no payee or purpose, the payer's claim decides what the payment fulfils and the receiver's contrary receipt stays shown as a dispute on the receiver (F64, F151, replacing F141's 'neither counts')". Its italic: "the payer chose its purpose in paying; a receiver cannot rename it afterwards".

**The flaw.** On a rail that binds nothing, nothing records what the payer "chose in paying". The claim can be written later: "A payer MAY publish one at any time" (rule 10). F141 gave the receiver a veto; F151 gives the payer a pen.

**Smallest story.**
1. Fan tips Owner 500 on such a rail; Owner signs a receipt: fulfils Owner's pointer (a tip).
2. Fan later owes Owner 500 under a deal. Fan writes a claim: the same rail proof fulfils the obligation.
3. The claim decides. The debt is discharged; Owner's receipt is a dispute shown on Owner. Owner gave the work for a gift received a year earlier.

The case is rare, as F151 says: every rail under payment cMIP draft 2 binds both. But "where the rail binds no payee or purpose" is also not checkable: no field says whether a rail binds them (F140 item 1 is still FORMAT OPEN, and the payment cMIP's item 3 declares request or push, not binding). The build states it as a caller's input.

**Verdict.** BREAKS where such a rail exists; UNCLEAR as to how a verifier knows it does. A stated cost would be acceptable under the working rule; the italic claims the opposite ("A payer who lies gains nothing hidden") instead of stating it.

---

## 13. An offer that is not the payee's. UNCLEAR (F145)

**Sentence.** `spec/MIP-finance-draft-6.md`, rule 14: "the latest of the payee's pointer chain held by an act of the payee's own: the payee's signature act on the agreement, or the offer the agreement accepts".

A standing offer is terms with one signer, and nothing makes the signer the payee: a buyer may publish a bounty ("I pay 100 for a remix") that a creator accepts. The offer is then the payer's act, and the payee's own act is their acceptance, which the sentence does not name. F145's reason assumed "an offer … is already the payee's". The build read it as "an offer is the payee's own act only when the payee signed it", which is the sensible reading, and the text should say it, and say what the payee's act is otherwise (their signature act accepting the offer, presumably).

**Verdict.** UNCLEAR.

---

## 14. Sentences that still order by time without an anchor, and small inconsistencies left by F161 and F162. UNCLEAR, editorial

| Where | Sentence | Note |
| --- | --- | --- |
| Finance rule 14a | "never by a limit the payee set afterwards" | "afterwards" has no anchor; it is the one time word F161 missed, and it sits in the one rule (finding 1) where the order it asserts cannot be judged |
| Finance rule 14 | "counts only if paid to the vault, until the payee acknowledges it" | "until" reads as a time; the rule means "unless", and once the acknowledgement exists, payments to the flow it selects count whenever they were made. Say "unless" |
| Finance rule 15 | "A payer's client MUST write the payer's claim at the moment it pays, before anything else can be cited" | a MUST that no verifier can check (the text says "client conformance") and that the read-together sentence makes pointless (finding 3) |
| Freeze suite, scenario 1 step 9 | "the keeper's operator the clause names as the authority signs an abandonment declaration" | after F158 the operator cannot acknowledge its own declaration; the step does not say who does, so the pass condition "a declaration counts only if acknowledged within one further period" has no actor. Name the acknowledging contributor |
| Freeze suite, scenario 1 | "the anchored liveness act prevents a wrongful declaration" | rule 51 says no period declaration "can count (FORMAT OPEN)" until the anchoring and time-reference formats exist; the suite should say the step runs on stated anchors (F162 item 2) |
| Paper, claim 6 | "none above it by as many units as the stake has holders" | F162 item 11 tightened the check to one unit where the default rule applies; the paper states the old tolerance |
| Paper, section 5.1 | "Where receipt and claim disagree, the disagreement is shown on the receiver and the greater amount counts." | true for amounts; silent on payee and purpose, where F141 and F151 now give two different rules. Not wrong, incomplete |
| Law, "Judged on its own history" italic | "A closing's own conditions (receipts that fulfil its debts, 'holds nothing') may still change as a verifier comes to hold more acts." | this is right and answers the earlier review's finding 12; recorded here as held |

---

## 15. Attacks I tried that held

- **F157, the colluding drafter (review finding 1, first story).** Debtor drafts terms citing the thief's pointer; Owner signs. The walk from Owner's signature act reaches the terms (another identity's act) and stops; it continues only through `prev` into Owner's own sequence. The thief's pointer is not reached. Held, for a payee with one device (finding 2 is the other case).
- **F157, the thief's pointer in the owner's own sequence.** During the window the thief publishes v3 from the stolen device, which is another sequence of the same identity. Owner's signature act on another device never cites it. After the rotation, v3 lies outside the kept ancestry and is void; a pointer the owner publishes later with the same version is settled by the rotation ("A fork behind an act the owner's later rotation kept is settled by that rotation"), and the paper's claim 7 states the cost until then. Held.
- **F152, moving the homes.** Homes are declared with the safety key (finding 8). Held.
- **F147, re-wrapping an anonymous claim.** The signed array's "inside key 3 or null, inside key 7 or null, inside key 8 or null" are Envelope's `objects`, `acks` and `refs`, the three keys whose change re-wrapping needs; `prev` is excluded on purpose and does not count as history. Held. (Finding 3 is about what the covered history then buys, not about the signature.)
- **F150, reordering holders.** Largest remainder ignores order; 801 at 40/30/30 gives 320.4, 240.3, 240.3, so the unit goes to the first (freeze 7t's "321, 240 and 240"); one quarter against two gives 333,333.33 and 666,666.67, so the unit goes to the second (scenario 9's "333,333 and 666,667"). Both right. The remaining attack is on ties (finding 4), not on order.
- **F156 and F162 item 5, presence in a collective at the collective's mercy.** I tried a majority refusing to acknowledge a member's acts so that the member could never show presence. It fails: a liveness act is the member's own act "naming any version of [the agreement]", counts as presence once anchored, and needs no placement on the collective's line. Held.
- **F156, a member's signature placed by a witness act.** Now placed only by an action on the chain acknowledging it, or a record or rotation naming it. The two verifiers agree on 4,000 histories after the build. Held.
- **F153, a censored owner.** A homeless rotation that counts only on a reader's own attempts leaves everything binding about that owner "unknown" until the old home closes or auditors attest. The owner cannot be paid meanwhile ("payment" is in the list). This is the rare case the working rule allows, and rule 35 already tells owners with one home to name auditors. Held, cost noted.
- **F160, a thief changing the vault.** The vault changes only with the safety key; a thief with the signing key cannot widen a limit. Held. (Finding 1 is about the owner not being able to narrow one.)
- **F158, the declared party acknowledging itself.** Excluded by the text. Held.
- **F162 item 3, inclusive bounds.** An act anchored at the declaration's own point protects its party. The safe side. Held.
- **F148, an authority anchoring a declaration "late".** Anchoring late only widens the period in which the party's acts protect them. Held (finding 5 is the other direction).
- **F143 and F161, "Judged on its own history".** The italic now claims only independence from the order of judging, and admits that a closing's conditions change as acts arrive. Held.

---

## 16. Effect on the paper's claims (section 6.2)

| Claim | Effect of F145 to F162 |
| --- | --- |
| 1, same verdicts | inputs now name content keys and what was found at homes (F159); but "until it no longer rests on that verifier's fetch alone" has no exit (finding 8), so a private link's binding standing is unknown for every verifier for good |
| 2, a stolen key cannot outlast the next rotation | **overstated**: the thief's offers keep selling to anyone holding them, through bare claims, and the owner's anchoring does not stop it (finding 3) |
| 5, no stake moves without its holder | held in words; on ties, units move by the service's choice of salt (finding 4) |
| 6, splits exact up to rounding | the per-holder bound is now one unit (F150), tighter than the claim states (finding 14) |
| 7, a thief cannot collect older obligations | holds for a payee with one device; with two devices the rule may select no pointer or an abandoned one (finding 2); the vault half of the claim depends on finding 1's reading |
| 8, a collective owes no debt it did not sign | unaffected by F145 to F162; F144's reword by reason (the earlier review's finding 4) is in the text |
| 9, ending against action | unaffected |

Outside 6.2: section 5.1 is rewritten as F161 proposed and is accurate for one device and one claim; section 3.4's "every rule is stated in terms of what cites what, never of when" is still true of validity rules save rule 14a's "afterwards".

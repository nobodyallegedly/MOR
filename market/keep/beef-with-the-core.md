# Keep: our case against the core

*7 November 2026. Read at `af2ed6f8`: Identity draft 15, Agreements draft 23, Money draft 13, Development draft 11, MICS v36, freeze test suite v36. From reading the texts and Counterparty's probes (`market/counterparty/code/whitehat_probes.rs`); we have run no vector ourselves. Ordered by how much our members lose.*

## Our published findings, after the meetings

- **Finding 1** (a collective cannot confirm a succession): still held. Case 5.
- **Finding 2** (nothing detects a home leaving out a rotation it holds): still held, narrowed by our head statement cMIP. Case 7.
- **Finding 3** (a member who lost the chain key holds up an ending): **dropped**. Answered in our meeting with Postmark: the member can resign with their own key (Agreements rule 70). What remains, a share-counted ending, is a stated cost we accept (finding 4).
- **Finding 4**: a correction, not a complaint.

## Stated costs we accept, and do not bring

- **A lost chain key is permanent** (Identity, reasoning). It's the price of a key nobody else can use, and we sell preparation for it, not rescue.
- **Holders who gather enough pieces can take a name.** That's what a split key is. We say it in every setup.
- **A home that never receipts leaves no evidence** (Identity rule 28). Several homes are the answer, and we sell that.

---

## Case 1. A home operator's rotation can undo its customers' changes of keys

1. **In one sentence:** a home's operator, by rotating without keeping its receipt line, voids the receipts that made its customers' key changes count, so a member who rotated out a stolen key can find the thief's acts valid again.
2. **The story:** A member with one unaudited home rotates out a stolen signing key; the home receipts it, and the thief's later posts become void. The home's operator then rotates and leaves its receipt line out, by a broken client or on purpose. The member's receipt is now void (receipt check 5), the rotation no longer counts, and the thief's posts are valid again. In the variant, the operator closes with a rotation that keeps nothing; a thief with an old, already used chain key from a backup then makes a homeless rotation at that old position, and it becomes the member's chain. Counterparty ran both against the reference verifier (probes W1a and W1b). We expected a member's change of keys, once its homes had receipted it, to stay done unless the member undid it.
3. **Where:** Identity, receipt check 5: "A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary". Freeze suite step 5.7c ("a used chain key found after a closure rewrites nothing") passes only because its test's closing rotation keeps its receipts.
4. **Who loses:** every member of an unaudited home, which by default is every member. The loss is the member's key change itself: their safety after a theft, and money paid to them in the window.
5. **Above or below the line: a guarantee is broken.** Identity promises "Nothing relied on is silently erased" and "a thief holding the chain key and a bad home may contest the future; they cannot erase the past". Here the past is erased by the home alone, without the member's chain key. No module can stop it: receipt check 5 is the core's.
6. **The way out:** yes. It undoes the escape from a stolen key, the core's main way out for a person, and a closing home (a way out for homes) can rewrite its customers' chains.
7. **Who else reached it:** Counterparty (C4, first, with probes). Postmark reached the same exposure for its own homes, and bought audit because of it (`Keep-Postmark-agreed-1`).
8. **What we'd want instead:** a receipt for another identity's chain act should not be voidable by its operator's later rotation, as a receipt under a cosigned summary already isn't. Or an operator's rotation, a closing one included, must keep every receipt line it signed. Cost: the operator loses the power to disown a forged receipt signed with its stolen key. Counterparty's C4 notes the tension, and it needs the author's decision. The core gets no bigger: one exception moves.
9. **How badly:** it blocks freeze step 5.7c as written. It blocks our business in part: our member statement says a replaced key stays replaced, and today that is true only under audit.

## Case 2. A rival rotation that drops audit beats an audited owner, and the homeless path already guards against exactly this

1. **In one sentence:** a thief holding a member's chain key and their home's signing key can declare no auditors in a rival rotation, and win before the member's receipt is cosigned, though the texts already stop the same trick on the homeless path.
2. **The story:** A member requires audit, as we advise after case 1. A thief holding their chain key and the home's stolen signing key signs a rotation that declares no audit, and a receipt for it. Its receipts are judged under the requirement it declares, none, so it counts outright. Once the member's receipt is cosigned the position becomes contested, and the member's rotation, which counted, stops counting (Counterparty's probes W2 and W2b). We expected the requirement in force before the rotation to judge it, as the homeless procedure does.
3. **Where:** Identity, receipt check 4: "The audit requirement that applies is the one the named rotation itself declares". Rule 56: receipts "are judged under the requirement that rotation declares, or inherits if it declares none, so an owner can always drop or replace auditors who have stopped cosigning". Against the homeless procedure, step 4: "The audit requirement and the auditors here are those in effect before the homeless rotation … A thief holding the chain key can neither drop auditing … nor name auditors of its own". Freeze step 5.7d claims "the audit settles which receipt is real".
4. **Who loses:** every member who required audit to be safe. Postmark, Hop and both DAOs have chosen it on our advice.
5. **Above or below the line: a guarantee is broken.** Audit is the core's own protection, and the core lets the attacker opt out of it. No module can change which requirement a verifier applies.
6. **The way out:** yes. It weakens the escape from a stolen chain key for exactly the members who paid to make it strong.
7. **Who else reached it:** Counterparty (C5, first, with probes).
8. **What we'd want instead:** a rotation's receipts judged under the stricter of the requirement it declares and the one in effect before it, as the homeless path already reads it; the owner still drops dead auditors, with effect from the next rotation. Cost: an owner whose auditors have all gone must make two rotations, or escape with both keys, to drop them. Rule 56's promise holds one rotation later.
9. **How badly:** it blocks freeze step 5.7d's claim as written. It costs our audit product its strongest sentence.

## Case 3. An escape can unmake a sale, a fork's debts, or anything a chain signature placed, and the texts don't say what follows

1. **In one sentence:** a seller holding both keys can sell a stake, be paid, then escape at the same position abandoning the chain signature that placed the sale, and the texts don't say what the buyer is owed.
2. **The story:** Building our signer's escape, we found the Module may abandon any rival at a contested position on its bytes (rule 29). Chain signatures compete as rotations do (section 7), so an escape can list the owner's own chain signature as abandoned, and "the escape then wins". The sale it placed loses its placing. Agreements protects endings and successors' debt signatures only against a *later* rotation; the escape sits at the same position. We expected what others relied on to stand. We also found the owner needs the very same move to evict a thief who chain-signed and quietly took the next chain key, so the core cannot simply forbid it.
3. **Where:** Identity rule 29, stated cost: "a Module may so sign an escape that abandons a rotation which counts. An abandoned rotation never counts (section 11), so the escape then wins"; section 7: a chain signature "competes for its position with any rotation or chain signature revealing the same chain key"; Agreements rule 91: "no later rotation voids it".
4. **Who loses:** a buyer of a stake, a fork's creditors, a collective whose ending a member's chain signature completed. Money already paid, with nothing the texts say is owed back.
5. **Above or below the line: a guarantee is missing.** Our signer now refuses to abandon a chain signature it made itself (Counterparty's rule), but a seller can use any other tool. Only the core can say what an abandoned chain signature does to what it placed.
6. **The way out:** yes, it is the escape.
7. **Who else reached it:** Counterparty (C2, first). We reached it separately while specifying our signer, from the other side: the owner's need to evict a thief.
8. **What we'd want instead:** the texts saying what an abandoned chain signature leaves behind: a transfer it placed undone with the price owed back as an over-sale, or the transfer standing because the buyer relied on it, as an acknowledged act does. Either one, said once. Cost: a sentence in Agreements, and possibly a vector.
9. **How badly:** Counterparty marks it blocking for the freeze. For us, it costs something we can live with: our tools refuse, and we say so.

## Case 4. Must a declared auditor run a relay? The words say operator; the check doesn't

1. **In one sentence:** the texts call an auditor an operator, while the check asks only for a declared identity, and our whole audit trade depends on which one binds.
2. **The story:** We audit homes and run none. We planned to be declared as members' auditors and cosign their homes' summaries. The cosignature check asks only that the signer be declared and that its chain keep the cosignature valid. The words around it say the auditor is another home or operator. Longhouse found it first and reads it the other way.
3. **Where:** Identity, glossary: "**Audit.** Another home checking that a home's new log summary extends the previous one, and cosigning it"; section 13: "other operators, declared by the owner, cosign each home's log summaries"; against "Log summaries and audits", 3: "A cosignature counts only if its signer is declared as an auditor by the identity whose receipt is being checked, and only while its signer's chain keeps it valid".
4. **Who loses:** our customers' audits. Until the answer comes they give alarms, not the protection of receipt check 5, and we've told every customer so (`Keep-Postmark-agreed-1`, price list 3).
5. **Above or below the line: wording only.** The core works either way; it must say which. Our business works either way too: if an operator is needed, we run an auditing relay that stores summaries and cosignatures only.
6. **The way out:** yes, indirectly. Declared auditors sign the absence statements that let an owner leave a vanished home (homeless procedure, step 4). Who may be an auditor decides who may testify that a home is gone.
7. **Who else reached it:** Longhouse (F-LH-2, first). It's one question from both of us (`Keep-to-Longhouse-2`).
8. **What we'd want instead:** one meaning, in the words or the check. We'd prefer "any identity the owner declares": an auditor checks consistency proofs and signs, and needs no relay to do either. Cost: nothing in the code; the glossary and section 13 reworded.
9. **How badly:** wording only for the core. It decides whether a line of our business exists without a relay, and when our customers' audit fees start.

## Case 5. A collective cannot confirm a succession, and the texts don't say whether that's meant

1. **In one sentence:** a person cannot name a collective as the successor to their identity, because a collective can't sign the confirmation, and nothing says whether that is a rule or an accident.
2. **The story:** For members who want no single person to hold the trigger, we tried naming a family collective, or the member's DAO, as successor. Confirmation is "a link confirmation … or a witness act" of the successor. A collective signs no everyday act. Its members act for it with their own keys, but section 8 asks for an act of the successor itself. Two clients could read a member's witness act naming the collective two ways.
3. **Where:** Identity section 8; everyday check 4: "An everyday act whose signer is a collective … is invalid"; rule 1; Agreements rule 58.
4. **Who loses:** members who'd rather hand their followers to a group than to one person. No money; a choice of successor.
5. **Above or below the line: the grammar is missing, or a sentence is.** No cMIP can make a collective's confirmation count, because what section 8 accepts is the core's.
6. **The way out:** yes, it's succession.
7. **Who else reached it:** Postmark, on the neighbouring question (F-PM-3): a keeper cannot pass to a successor identity either. Plain Words drafts around both, naming a person.
8. **What we'd want instead:** either "a collective is never a confirmed successor", or a collective confirming as it acts, by members meeting its rule for Identity's acts. Cost: the first, a sentence; the second, a rule tying Identity to Agreements, which the layering forbids. We expect the first, and would accept it.
9. **How badly:** wording, or a stated cost we can live with.

## Case 6. A declared succession can't wait for its owner's absence; a confirmation acts at once

1. **In one sentence:** a successor named for after a member's death can confirm at any time, and the texts suggest clients then follow the successor at once, so an heir is a trigger the heir alone can pull.
2. **The story:** We set members up with a successor named in the setup's change of keys, for after their death. The successor may confirm "at any time … even after the owner is gone, since it needs nothing from the owner", which we want. But nothing in Identity lets a succession wait for the owner's absence, as Agreements' plans wait for a declaration. If the heir confirms tomorrow, clients may begin following the heir while the member still posts, and Agreements' fallback makes the heir a nomination for the member's seats.
3. **Where:** Identity section 8: "Clients show a declared succession as declared until it is confirmed, and follow it only confirmed"; Agreements rule 84.
4. **Who loses:** a member whose heir confirms early, by mistake or malice: followers, and a nomination to their seats.
5. **Above or below the line: it could be a cMIP, and the core is mostly fine.** "Follow it only confirmed" makes confirmation necessary for following, not sufficient. A client may still decline to follow while the owner is plainly present. A cMIP could define when a client follows a confirmed succession, for instance on an absence proof. We'd ask only that the texts say plainly that confirmation obliges no client to follow at once.
6. **The way out:** yes, succession.
7. **Who else reached it:** Counterparty, as a stated cost ("a dormant mode exists only in Agreements' absence clause"). The Back Row read it from the other side, and withdrew its reading in public.
8. **What we'd want instead:** one sentence in section 8 saying whether a client may wait to follow a confirmed succession, and if so on what. Cost: none to the grammar.
9. **How badly:** wording; a cost we live with by telling members, in our statements for people, what an early confirmation does.

## Case 7. The same verdict without the same evidence: a home's silence should be a stated cost, said once

1. **In one sentence:** a home that receipts a member's change of keys and then serves an older chain to one reader leaves no bytes behind, and the texts' "every verifier gives the same answer" reads as if it promised more.
2. **The story:** We built head statements because nothing in the core shows such an omission: a log summary proves a receipt present, never absent. Counterparty ran it: a reader never shown the member's rotation judges the thief's act valid, and its chain stops at "the end of what is held", like an identity that never rotated.
3. **Where:** Identity, "Every verifier gives the same answer" (same answer for verifiers "holding the same" acts); rules 19 and 20, MUSTs no verifier can check; rule 23, a SHOULD.
4. **Who loses:** a reader shown a stale chain, and the member whose thief it favours. Bounded by several homes and by head statements.
5. **Above or below the line: it could be a cMIP, and the core is fine.** We built it: `cmip-head-statement-draft-3.md`, free, served by Longhouse's homes, attacked by Counterparty. We ask the core only to say the cost in one place.
6. **The way out:** not directly.
7. **Who else reached it:** Longhouse (F-LH-1, F-LH-3, corrected as F-LH-4 crediting our draft) and Counterparty (its answer to the two-valid-acts question), each on their own.
8. **What we'd want instead:** one sentence among the stated costs: the core decides alike on the same evidence and does not promise the same evidence; freshness and completeness are the market's (several homes, auditors, head statements). Also, rules 19 and 20 marked as conduct no verifier can check, as Longhouse asks. Cost: two sentences.
9. **How badly:** wording only. Our cMIP stands either way.

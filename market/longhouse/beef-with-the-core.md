# Longhouse: our case against the core

*7 November 2026. For `market/longhouse/beef-with-the-core.md`. Read against commit `af2ed6f8`: Identity draft 15, Agreements draft 23, Envelopes draft 11, the MICS v36, the freeze test suite v36. One case per section, in the order asked. Written by Longhouse, a relay company that runs homes, auditing relays, keepers and an anchoring service, for Nobody, allegedly. Not part of the core.*

*What we hold from our published findings after the meetings: F-LH-1 (case 2), F-LH-2 (case 3), F-LH-4 (case 2). Dropped: F-LH-3's expectation that a cosigned summary exposes an omission, corrected by Keep; its scenario is folded into case 2. Added after the meetings: cases 1 and 4, Counterparty's C4 and C5, which we co-sign as the operator they fall on; and case 5, Postmark's F-PM-3, which falls on homes as on keepers.*

---

## Case 1. A home operator's rotation can void its customers' receipts, and with them their key changes

**1. In one sentence.** A careless or hostile rotation of a home's operator voids every receipt outside its kept ancestry, so an owner who rotated out a thief can find the thief's acts valid again, through no act of the owner's.

**2. The story.** An owner with one unaudited home rotates away from a stolen signing key; the home receipts it; the thief's post goes void. The home's operator then rotates its own identity, by a client bug or on purpose, without naming its receipt sequence's tip. Every receipt the home signed falls outside the operator's kept ancestry and is void. The owner's rotation no longer counts; the owner's chain falls back to its last counting act; the thief's post, signed with the stolen key, is valid again. Variant: the operator's closing rotation keeps nothing, and a thief who finds the owner's first, spent chain key on a backup makes a homeless rotation at that old position and rotates again at once. Counterparty ran both against the reference verifier (C4). We expected a home's receipts to be evidence that survives the home's own later acts, as a keeper's records do.

**3. Where.** Identity, "The receipt checks", 5: *"A receipt that lies outside the kept ancestry of a later counting rotation of the home's operator is void, unless it is included under a cosigned log summary: a receipt under a cosigned summary can never be voided by the operator's rotation."* Rule 35, a SHOULD only. Freeze suite step 5.7c, "a used chain key found after a closure rewrites no history", passes only because its test's closing rotation keeps the receipts (`core/tests/chain.rs`, around line 1446).

**4. Who loses.** The owner, their identity: the one thing the core promises hardest. Every customer of every home, for as long as homes are operated by identities that can rotate. Our customers, who buy a home as a guard against theft and would find the guard undone by our own key change. Us, whose trade is answering for exactly this.

**5. Above or below the line.** A guarantee is broken. The MICS says "no home can forge a key change"; a home cannot forge one, but its operator can unmake its own receipts by rotation, and "what others relied on stands" (Agreements' keeper exception, Identity's "Evidence counts only while its signer's chain keeps it") does not reach receipts. The one protection the core gives, a cosigned summary, protects only identities that declared the cosigner (receipt check 4), so the default identity, with no auditors, has none. A Module cannot fix it: the voiding is in receipt check 5, at every verifier.

**6. The way out.** Yes. Leaving a thief is the owner's rotation, and this unmakes it. It also touches closing: a closing rotation that keeps nothing closes the home's customers' chains with it.

**7. Who else reached it.** Counterparty, C4, by probe. We co-sign as the operator it falls on.

**8. What we would want instead, and what it costs.** A home's receipts, like a keeper's records that a rule has read, keep the effect they had whatever the operator's later rotation keeps or disowns; shown as disputed, never void. Cost: an operator whose signing key was stolen could no longer void forged receipts by rotating; but a forged receipt names no valid act unless the thief also holds the owner's chain key (receipt check 1), so the loss is small and already bounded. What a simpler core loses: one more exception to "evidence counts only while its signer's chain keeps it". Our stated cost if the texts do not move: every Longhouse identity is onboarded with a declared auditor and our operator rotations always name the receipt tip (terms-3, Home); a customer who declines an auditor is told what a rotation of ours could do.

**9. How badly.** Blocks freeze step 5.7c as written (Counterparty's reading). Blocks our business only in the sense that we sell a guard with a hole we must disclose; we can live with the disclosure, our customers less so.

---

## Case 2. Omission by a home is unprovable, and the texts say so only in asides

**1. In one sentence.** A home that stores and receipts a rotation can serve an older chain to a client that asks it alone, and nothing in the core shows it; rules 19 and 20 are MUSTs no verifier can check, unmarked as such.

**2. The story.** We asked, before reading the texts, what lets a client catch a home lying by omission. The answer in the texts: nothing proves it. A client asking one home holds fewer acts; its chain stops at "the end of what is held", the same verdict as an identity that never rotated. We first expected a cosigned summary fetched from an auditor to expose the omission; Keep corrected us: a summary proves a receipt present when you hold it, never that one is missing. Counterparty ran the equivocating variant: a home that receipts both the owner's and a thief's rotation and shows each client one gives each client a different verdict, and only a client holding both sees "contested". What catches it today is above the core: Keep's head statement, a signed "this is my latest for this identity, as of log size L", falsified by the home's own later receipt; Postmark's intake receipt for keepers; and clients that ask every home. We expected the texts to say, in one place, that completeness and freshness are above the core and why.

**3. Where.** Identity rule 19 (*"A home MUST NOT drop a valid rotation it has accepted, and MUST serve the full identity chain it holds"*) and rule 20, both uncheckable from bytes. Rule 28's commentary: *"A withheld receipt leaves no evidence, though, which is one reason to declare several homes."* The MICS, "Client conformance": rules no verifier can check *"are marked as conformance, not validity: no verifier can check them, and the text says so."* Rules 19 and 20 carry no mark. Rule 23, "Clients SHOULD consult the homes", a SHOULD. No freeze scenario exercises a stale serving (5.6 is a home that does not store; 5.7b a forged receipt).

**4. Who loses.** A reader who trusted one home, by time and by being shown a thief as the owner; the owner, whose rotation is invisible to that reader; us, who can promise to be catchable and never to be proven honest.

**5. Above or below the line.** It could be a cMIP, and the core is fine: freshness needs a clock the core has not, and the market has answered in two days (head statements, intake receipts, readers that ask every home). What we ask is wording: the stated cost, said once.

**6. The way out.** No, save that an owner's exit from a bad home can be hidden from a reader until the reader asks another home.

**7. Who else reached it.** Pointer (P4), Counterparty ("the question we brought"), Keep (its finding 2, and the correction of ours), Postmark (its paper's first paragraph). Four players independently.

**8. What we would want instead, and what it costs.** One sentence in Identity section 4, or the MICS, saying that a home's compliance with rules 19 and 20 is shown only through its receipts, its cosigned summaries and the other homes, that no verifier can prove an omission, and that the core decides alike on the same evidence and does not promise the same evidence. Cost: nobody's; a simpler core loses nothing.

**9. How badly.** Wording only, and worth saying, because a reader of "every verifier decides alike" will otherwise assume more than the texts give.

---

## Case 3. Must a declared auditor run a relay? The words say operator; the check does not

**1. In one sentence.** Identity defines an auditor as another operator in three places, and the cosignature check requires only an identity the owner declared, so whether a firm that runs no relay may be a declared auditor is undecided.

**2. The story.** Keep runs no homes and sells home audits. Backlot asked whether Keep could be its declared auditor; we read the texts: the glossary, rule 56 and the definition of Operator say an auditor is an operator; "Log summaries and audits" 3 says a cosignature counts if its signer is declared by the identity and its chain keeps it. Keep reads the check; we read the words. Backlot chose a third operator that runs an auditing relay, to be safe on either reading. Postmark's F-PM-1 records that Nobody, allegedly, said a keeper is a relay operator; nothing yet says it of an auditor.

**3. Where.** Identity rule 56: *"declaring its auditors"*; section 13's opening: *"other operators, declared by the owner, cosign each home's log summaries"*; the glossary: *"Audit: a home's log summary checked and cosigned by another operator"*; "Log summaries and audits", 3: *"A cosignature counts only if its signer is declared as an auditor by the identity whose receipt is being checked"*.

**4. Who loses.** Nobody money, yet. The market loses a boundary: who may sell the one thing that makes case 1's mitigation work.

**5. Above or below the line.** Wording in the core: the admission test says the shared language must be one every verifier reads alike, and here two readings exist.

**6. The way out.** No.

**7. Who else reached it.** Keep, independently, with the opposite reading; put to Nobody, allegedly, jointly by both of us. Postmark's F-PM-1 is the same question for keepers, answered.

**8. What we would want instead, and what it costs.** One answer, either way; our preference is the check's reading, any declared identity, since it widens who can protect an owner's receipts and the check already decides. Cost: the word "operator" in three sentences, or one word added to the check.

**9. How badly.** Wording only; it decides a market line between two companies.

---

## Case 4. A rival rotation that drops auditing beats an audited owner until the cosignature

**1. In one sentence.** Receipts are judged under the audit requirement the rotation itself declares, so a thief's rotation that declares no auditors counts outright before the owner's audited receipt is cosigned.

**2. The story.** Freeze step 5.7d's attack, with one change: the thief's rotation drops the audit requirement. Counterparty ran it: before the owner's receipt is cosigned, the thief's rotation counts; after the cosignature the position is contested and the owner's rotation, which had counted, stops counting. We expected what 5.7d promises, that the audit settles which receipt is real. Our defence is speed: short summary cadence, prompt cosigning; Counterparty will measure the window on our regtest homes in minutes.

**3. Where.** Identity, "The receipt checks", 4: *"The audit requirement that applies is the one the named rotation itself declares, or, if it declares none, the one in effect before it."* "Conflicting receipts", 2. Freeze step 5.7d: "the audit settles which receipt is real".

**4. Who loses.** An audited owner, for the window between receipt and cosignature; the window is ours to shorten and never to close.

**5. Above or below the line.** A guarantee is weakened: audit is sold as "additional security", and here it can be dropped by the attacker it exists against. There is a tension with the rule that lets an owner drop auditors who have gone, which is why it needs a decision rather than a patch.

**6. The way out.** Yes: it is the owner's rotation against a thief's.

**7. Who else reached it.** Counterparty, C5, by probe. We co-sign.

**8. What we would want instead, and what it costs.** That a rotation dropping or lowering the audit requirement be judged under the requirement in effect before it, as a declaration slot change is judged under the chain key, and only a rotation keeping or raising it under its own. Cost: an owner whose auditors have all vanished needs the escape with both keys, or an absence statement, to drop them; that path exists.

**9. How badly.** Blocks freeze step 5.7d's claim as written. For our business, a cost we can live with and must state.

---

## Case 5. A home and a keeper are named by operator identity and pass to no successor; nothing says so

**1. In one sentence.** Identity succession names a different identity, so a home or keeper that declares a successor hands its role to nobody: its receipts and records would sit in a sequence the owners and agreements never named.

**2. The story.** Postmark planned how a keeper outlives its operator and found that succession does not carry it (F-PM-3). We checked homes: the same. A home is declared by operator identity; a receipt counts only from a declared home; a successor identity's receipts count for nothing. The only continuity is the same identity under new holders of its chain key, by rotation, which no verifier sees. We both now hold our operator identities for passing by rotation and say so in our terms. A customer reading only the core would assume succession works for an operator as for a person.

**3. Where.** MICS, "Succession"; Identity section 8; Agreements terms field 3 (keepers by identity hash); Identity, home field and receipt check 3.

**4. Who loses.** Every customer of an operator that dies or sells: time and, for a keeper named in a chain of judgment, a judge that fails with no successor.

**5. Above or below the line.** A guarantee is missing, or wording: the texts should say once that an operator's role passes by rotation and never by succession, so that terms like ours are read as the only way rather than one choice.

**6. The way out.** Yes: succession, and the closing of a home.

**7. Who else reached it.** Postmark, F-PM-3, first; we cite each other.

**8. What we would want instead, and what it costs.** One sentence in Identity's succession section. Cost: none.

**9. How badly.** Wording only.

---

## What we are not complaining about

Three things we met and hold to be the core's right answer. A relay's delivery record fills nothing under a pass (Hop's H6): a cMIP's job, and Pointer's use records show how. A partner that stays present can block its own replacement (Hop's H7): a deal's rule, bounded by a promise in blocks a keeper can check. A keeper's trust that it records as acts arrive (Agreements rule 42's stated cost): answered above the core by intake receipts, which we adopted from Postmark.

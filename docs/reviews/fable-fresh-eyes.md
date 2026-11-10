# A first reading of MOR, by a reader who had never seen it

*Fable, 10 November 2026. Written for Nobody, allegedly. This review changes no text, code or vector and decides nothing.*

## What I read, and what I did not

Sections 1 to 7 were written before I opened anything in `docs/`. Section 8 was added afterwards.

The eight current texts hold about 212,000 words. I did not read all of them, and my judgments are only as wide as my reading:

- **Read in full:** `spec/README.md`; the MICS document v37; Text draft 11 (parts one, two and four); Identity draft 16, parts one and two (rules 1 to 56 and every check beside them).
- **Read in part:** Envelopes draft 12 (sections 1 to 11); Money draft 14 (purpose, dependencies, rules 1 to 6 and 15 to 18); Development draft 12 (purpose, rules 10 to 13 and 18 to 27); Agreements draft 24 (how to read, purpose, dependencies, the words on ending and on collectives, "Termination", all of rules 69 to 71, 81, 82, 85 to 89, 91 and 98, and the freeze scenarios "The way out, walked" and "Termination, walked"); the freeze test suite v37 (purpose, scenario 9, the freeze procedure).
- **Not read:** the act formats (every "Part three" and Agreements' Part five); Agreements' parts one and two beyond what the MICS document maps of them, and rules 93 and 99; scenarios 1 to 8 of the suite; `core/` and `core/vectors/`.

So where I say "I found no flaw", it means in what I read. Agreements is more than half of the six MIRs by words, and I read perhaps a fifth of it closely. A second fresh reader should start there.

Every quotation below is copied from the text named beside it.

## 1. What MOR is, in my own words

**MOR is a rulebook for signed records.** A person, or a group, is a permanent name that never changes, with keys that can be replaced when lost or stolen. Everything they do (a message, an upload, a payment record, a contract, a vote) is a small signed, usually locked, record called an act, kept on servers that nobody has to trust. On that ground the rulebook stacks five more layers: plain text every program can read; the common shape of every act; payments, recorded by both the payer and the payee whatever network carried the money; agreements, which say who agreed to what, who owns which share of a work or of a group, and how each sale is divided; and the way outsiders publish add-on rules. Where arithmetic can settle a question (was this signed, which came first on this chain, do the shares add up), every program must give the same answer. Where it cannot (was the price fair, was the promise kept), MOR settles nothing and only keeps the signed record in view. The rulebook is meant to be frozen once and never changed; everything that evolves lives in the add-ons.

**Where the texts made that hard.**

- The MICS document opens with its densest sentence. The first paragraph of "Purpose" is one sentence of well over a hundred words, and its second sentence uses "collective", "line" and "placed" as terms of art before any of them is explained: "the one move behind a collective's line, behind what a line placed staying placed". A stranger meets the conclusion of a long argument before the subject.
- The texts never say what MOR is for. The name is given once, "MOR (Media Over Relays)", and the document then says "The core names no particular use of MOR." I worked out the intended use (people publishing media, selling it, and being paid by shares) from "From bake to publication" and from one quoted line about piracy. A stranger should not have to infer it.
- "Agnostic" is claimed and not kept. "It describes identities, media, money, agreements and specifications, never what anyone does with them" sits a few lines above a pipeline of bake, claim, ownership agreement, publication, price tag, partners, split service and tips. That is a use. It may be the right one; the text should own it.

## 2. Can it be understood without its history?

**In plain words: the lower layers, yes; Agreements, not yet.** Identity, Text and Envelopes can be read cold by a patient reader. They say what a rule is, what it costs, and often why. Agreements still reads as the minutes of a long negotiation: its order, its numbering and several of its sentences only make sense if you know what was there before.

**History that is still in the texts.** The README says of the eight: "No history, no finding numbers, no review labels". The finding numbers are gone. The history is not:

- Agreements, "How to read this MIR": "Rules keep their numbers wherever they stand, so the numbers do not run in reading order." Rule 45 follows rule 14; rule 65 follows rule 75; rule 36 opens part two; rule 98 comes before rule 67, which comes before rule 47. A stranger cannot find a rule by its number, and the only reason given is loyalty to older citations that the stranger will never see.
- Agreements section 23 is titled "Numbers kept as history" and holds nine rule numbers with nothing in them. The MICS says of one outside cMIP that it "keeps the rule numbers Agreements once held, which Agreements keeps as history."
- "Outcome 2, a stake transferred to parties named, is struck from MOR 1." The outcomes are then numbered 0, 1, 3 and 4. The glossary has an entry whose whole meaning is "Retired: the field is withdrawn." Envelopes keeps rules 24 and 28 and types 2 and 3 as named holes.
- A frozen core that will outlive its author quotes him: "In Nobody, allegedly's words", and ends "Every point the texts left open is a question put to Nobody, allegedly". Development rule 22 speaks of "the first wave". None of this can mean anything to a reader in thirty years.

**Where a careful stranger would read a rule two ways.**

1. *Which abandonment clause judges someone who is no longer a member.* Rule 85: "A declaration against a holder who is no party is judged under the abandonment clause of the version that holder last signed as a party". Rule 87: "a party whose voice was removed before a judicial change is judged by the clause in force." A member who resigned has had their voice removed and is a departed holder. Are they "a party whose voice was removed" (the clause in force today, which they never signed) or "a holder who is no party" (the clause they accepted)? Rule 70 says the remaining members "clone its agreement without the departed party", which suggests a window between the line and that clone in which the person is both. The two answers move a person's share under different authorities.
2. *How many outcomes absence has.* The MICS: "a vanished party's two outcomes". Rule 89 lists four that "may be combined", one of them "agreement closed". I believe "two" means the two that move a stake, but the sentence does not say so.
3. *Whether a deal can change without everyone.* The MICS glossary: "it exists and changes only with every party's signature." The body: "It changes only with every party's signature, save a terminating act under its termination rule". A literal reader who looks the word up gets the version without the exception.
4. *How often a chain key signs.* The MICS: "committed in advance by its hash and used exactly once". Identity rule 29 then gives "Two exceptions, each allowed once", and a third case where "the owner MAY sign again with the same chain key". The summary is stricter than the rule.
5. *What "pending" means.* "*Pending* has one meaning in every layer", followed by four different things to wait on. One word, yes; one meaning, arguable.
6. *How a collective ends.* Rule 91 is titled "four shapes". Shape A "keeps its identity" and shape C is "a plain collective, nothing new". Two of the four endings end nothing; the rule's own last paragraph has to add that "\"A fork closes the original\" holds for shape B only."

**Ordinary words doing technical work.** *Counts, holds, placed, kept, done, stands, relied on, line, voice.* Each is defined somewhere, but "holds" alone means four things: a verifier holds an act; a home holds a rotation; a holder holds a stake; and, in Money rule 17, "An act holds what is reachable through its citations". Identity admits the problem for one word: "**Contested.** The word names four things". The README says the single-meaning glossary lives in `docs/freeze-ready-glossary.md`, which is outside the eight texts that are meant to stand alone.

**Where I could not tell why a rule exists.** The italic commentary is good where it exists and I relied on it throughout. But the README points to `docs/freeze-provenance.md` for "Why each rule exists". If the reasons are not in the frozen texts, the stranger who inherits the core inherits rules without reasons. And the phrase "Money first" appears eight times across the MICS and Agreements as if it were a known principle; it is never stated as one.

**What decides when two texts differ.** Each MIR says its normal text beats its italics. The suite says "Where a step and a MIR differ, the MIR decides." I found no sentence saying what happens when the MICS document and a MIR differ. Development rule 26 makes the six MIR texts the one root, and the MICS document says of itself "This document is the map". Yet the admission test, the guiding question and the four design rules appear only in the map; I searched the six MIRs for "admission test" and found nothing. The standard the core is judged by is not part of the law it judges.

## 3. Does the core stay within its own admission test?

The test: "Something belongs in the core only if it is part of the shared language every act is written in, or a guarantee no module may be able to break."

**In plain words: Identity, Text and Envelopes pass. Money mostly passes. Agreements does not, and neither does the amount of advice written into every text.**

**What I would take out** (to a companion text, or to a founding cMIP; none of it would change a verdict):

- **Client conformance.** The texts say of these rules that "no verifier can check them". By the test's own words, a rule no verifier can check is neither the language acts are written in nor a guarantee no module can break. By my count there are about 48 such passages in Agreements, 13 in the MICS document, 8 in Identity and 7 in Money. They are valuable; they are a builders' code, and should be called one. The sharpest case: rule 70 fixes an English sentence that a client "MUST" show "in these words". A frozen multilingual protocol cannot mean that literally.
- **The commerce model in Agreements.** Partners, split services and their backups, role shares, metric shares, the measurer, fee payouts, "the reposter who led to the sale". The guarantees underneath (a split sums exactly; only the signed plan pays; no share shrinks without its holder) pass the test. The particular shape of a publishing business does not: it is one model of distribution, and the MICS itself says "Ownership is one thing, distribution another".
- **Advice.** "Choose keepers as carefully as homes." "*Keep your keys separate.*" "someone with stakes in works worth keeping does not resign." Shapes A and C of rule 91. All true; none is a rule.
- **Everything about the freeze itself.** "Freeze scenarios", "Parameters", "Reasoning" and notes "for MOR 2" inside texts whose every line will be hashed.
- **A named product.** The MICS says "The core names no control cMIP as default" and names `cmip-collective-control` in the same paragraph; Agreements names it 17 times. A core that names one outside specification, however carefully, has given it a standing no competitor can have.

**What is missing.**

- A sentence saying which text decides when the map and a MIR differ, and whether the admission test binds anything.
- The glossary and the reasons, inside the frozen set or openly declared outside it.
- One page, for a person and not for "the founding team", that walks each exit. It exists, and it is the clearest writing I read: suite scenario 9. But the suite says of itself "It is for the founding team, not for readers of the protocol."
- A plain statement of who may draw the line that registers one's own resignation (section 4).

**What is said more than once.** The MICS document is called a map, but at about 23,000 words it restates rules at full length (its paragraph on two complete versions of one deal alone runs to several hundred words). Small examples from one reading: "Unless there is a publication…" twice in the MICS, again in Envelopes and Agreements; "A one-way door in the format, written knowing it" twice in the MICS and once in Identity; "A debt ends by payment or by its creditor's word" as a heading twice in the MICS; "Receipts are signed by receivers and claims by payers" twice within one section; the bake-to-publication paragraph in both the MICS and Agreements; "What you sign is what you saw" in two sections of the MICS and in Text; the last resort stated three times in the MICS before Agreements states it as rule 98. Each repeat is a place where two wordings can drift apart after the freeze, with nobody allowed to fix it.

## 4. The way out

**In plain words: it holds, and it is the best-built part of what I read.** I could follow every exit from the texts, and each one says honestly where it stops.

**Leaving one's homes, keeping one's identity.** Three doors, in rising strength. Homes that are gone: "A homeless rotation lets an owner holding the current chain key leave homes that are gone". Homes that are hostile: "An owner holding both keys can always leave homes that refuse them." And a thief cannot use the first door to make a theft permanent: "Rule 55. Re-homed without audit is never final by the next rotation". The no-clock argument for finality ("Nobody can name an act before it exists") convinced me.

Where it stops, said plainly by the text: "An owner who loses the chain key can never rotate or leave; back up both seeds." A device-bound home "can mean losing the identity". At a self-hosted identity a thief's rival rotation leaves the position "contested for good" unless the owner still has both keys. These are costs, not holes.

**Carrying what is one's own.** The identity carries, since "The identity hash is the identity. It never changes." The owner's history carries only if the owner kept it: "Stated cost: proofs the owner never kept are lost with the home", and "nothing forces propagation, and delivery is the signer's interest". A stranger should understand that MOR lets you leave with your name, and with your papers only if you held copies.

**Leaving a group.** "A party to a collective's agreement gives up its voice by a resignation act (type 16), without anyone else's signature." The share stays: "Leaving costs the vote and the right to act, never a stake unless it is sold." This is the sentence a person afraid of confrontation needs, and it is there.

One gap. The resignation "takes effect for the collective at the collective's line registering it", and "Any member's client draws that line in its next act for the collective". The commentary reassures: "the collective that delays drawing the line only delays itself." But until the line, "the departed member still counts". The texts I read never say that the leaver may draw that record themselves. I think they may, since they are still a member until the line and "any member draws it". A literal reader would not dare assume it, and would wait on the very people they are trying to leave.

**Leaving a work.** "A share's payouts become its buyer's once the transfer is complete, both signatures placed", and the other owners are "notified, not asked". Clear.

**Leaving a deal.** Here I am unsure. "A deal: every party whose voice remains, by the clone of rule 47; each party's own way out is its transfer." A party who holds a share can sell it. A party to a deal who holds no share (a service agreement, say) seems to have no exit the core keeps, only what termination terms they negotiated. If that is intended, it should be a stated cost; if I missed the rule, the map did not lead me to it.

**Succession.** Language, not answers, and the text says so: "*The core gives the language; death is left to the parties and their named authorities.*" The requirement that a successor confirm ("Nobody can be made a successor … without agreeing to it") is right.

**Forking and closing.** Hold as written. A fork needs the constitutional rule, "By default that is every member", so a minority cannot fork; it leaves one by one and keeps its shares. Debts must all be handed out "or it does not take effect". A collective "cannot close while it owes anything".

**Where the way out ends, by the texts' own account.** All of these are stated costs, and I list them because together they are the real boundary:

- "when the last voice has left, the collective's works freeze as they stand", for good, with not even a release to the public domain possible.
- A broken collective's repair can be held hostage: "a member whose signature the rollback needs can ask a price for it; holders of enough of the chain key can break the collective on purpose and refuse the repair."
- Owners who vote out the operators but do not hold the key: "the owners' vote stands complete and unexecuted".
- "Stated cost: a thief holding a member's signing key can resign the member", and the resignation stays registered whatever is disowned later.
- Termination terms with a veto: "what the parties signed is theirs."

## 5. Who the rules serve

Picture the person asked about: reads rules literally, does not negotiate, does not see the trap nobody names, and needs to leave without a confrontation.

**Where the texts protect that person.**

- **Leaving is one act, alone, with no permission and no meeting.** Rule 70. This is the single most important protection for them and it is unconditional.
- **The defaults are the safe choice.** "the default is always one of the declared options, never a third, weaker rule." With nothing negotiated, a collective changes only with "every member by default" and homes decide by majority. The person who signs the standard form is not on the weak option.
- **Nothing binds without their own signature.** "no rule ever decides that someone owes something they did not sign." "Any act that changes a share needs its holder's signature."
- **The traps are named.** I counted about 125 passages marked as a stated cost across the six MIRs and the map. For someone who does not see the unnamed trap, a text that names its own is rare and worth keeping exactly as it is.
- **"Unknown" is never rounded up to "fine".** "answers unknown, never valid, void or invalid".
- **They must be told.** "a declaration naming a party MUST always be shown to that party, broken collective or not, with the way to contest it."

**Where the texts quietly favour whoever is stronger, better advised or more willing to play.**

- **Most of the protections that reach this person are the ones no one can check.** Being shown the plain text, the worked example, who may declare them absent, the veto warning, the last-voice warning: all are client conformance. Whether they happen depends on the software in front of them, which the other side may have recommended. The verifiable guarantees protect property; the unverifiable ones protect understanding. This person's weakness is understanding.
- **What is signed at founding binds for good, and the hard clauses are the ones a non-negotiator signs unread.** The abandonment clause names who may declare them gone, and then: "the declaration is the authority's judgment, a stated cost the party accepted by signing the clause". The remedy: "A contest shows a declaration, it does not void it: a wrongly declared member regains their voice only by a later version of the agreement naming them." That is, only if the others agree to take them back.
- **Silence is read as absence.** "Absence means absence from duty: no act by the party on the agreement". A person who withdraws to avoid a conflict, and does not know to sign a liveness act, is the person an abandonment clause removes.
- **A contest "changes nothing".** What bytes cannot prove is left "to the people, their courts and their reputation". That is an honest design, and it hands every hard case to the party with a lawyer and the stomach for a dispute.
- **Consent given once, by buying, reaches far.** A holder is bound by "a rule of the collective's control model the holder accepted, by signing or by buying". On issuance: "a holder who accepted a rule allowing issuance at a price it sets accepted that price". And "value, not percentage". The literal reader hears "my share cannot shrink without me"; the adviser hears "its value can".
- **Staying in costs nothing; leaving keeps you exposed.** A departed holder "has no control and no veto: the collective's current rules and judges apply to them". Their pay cannot be cut unlike the others', which is a real floor. But the people they left now choose the split service and run the collective, with the leaver as a silent passenger.
- **Leverage is priced in.** "can ask a price for it" is the text describing, accurately, that whoever is willing to hold out gets paid.
- **Theft losses fall on the unprepared.** "name your clock, anchor or bear the loss". Sound for the system; it means the person without an anchoring setup carries what the well-equipped do not.
- **Length is itself a tilt.** A rulebook of 212,000 words is read by the side that can pay someone to read it.

None of these is hidden; nearly every one is a quoted stated cost. The texts do not deceive this person. They do rely, more than they admit, on a good client standing between this person and the terms.

## 6. The size

**In plain words: no, the core is not as small as what it must do.** The guiding question is "what is the least the core needs to know to make this work?" Measured against it:

| Text | Words |
| --- | --- |
| MICS document | 23,357 |
| Identity | 21,933 |
| Text | 3,591 |
| Envelopes | 10,075 |
| Money | 14,519 |
| Agreements | 81,516 |
| Development | 9,427 |
| Freeze test suite | 48,146 |

Agreements is 58 percent of the six MIRs. Text, at 3,591 words, shows what a layer looks like when it only does what it must.

**If it had to be said in half the words, this would go, in this order:**

1. **The map shrinks to a map.** The MICS document to roughly a fifth of its size: the test, the layers, the conventions, one paragraph per MIR, the glossary. Every rule it restates is said in its MIR.
2. **Client conformance moves to one companion text** for builders, cited by the core and not part of it.
3. **Reasoning, parameters, freeze scenarios and history move out** of the hashed texts: section 23, retired entries, "for MOR 2" notes.
4. **The distribution model moves to a founding cMIP**: partners, role and metric shares, backups, fee rules. The core keeps conservation, "only the plan", and no stake moved without its holder.
5. **What remains about control models is cut to the boundary**: what a model may never decide, and how its answer is checked.

What I would not cut by a word: Identity's part two, the verdict vocabulary, Text's part two, and every stated cost.

## 7. My view on freezing it

**Ready after named changes.** Not "ready", and not "not ready".

Why not "not ready": in what I read I found no guarantee that breaks, no exit that fails, and no rule whose verdict I could show to be wrong. The lower three layers are careful and, to my reading, complete. The way out holds.

Why not "ready": the aim given for this reading is a core that people who never met its authors can build on, and the texts cannot yet be read that way. A frozen text cannot be clarified afterwards, so every ambiguity below is frozen with it. And I read too little of Agreements to vouch for it; nobody without the history has yet read it whole.

**The changes I would want before the freeze** (text only; I propose no change to any verdict):

1. **Say what decides.** One sentence on the MICS document against the MIRs, and on whether the admission test and the four design rules are law or commentary.
2. **Settle the two-way readings of section 2**, above all rule 85 against rule 87, since it decides under whose authority a departed person's share can be moved.
3. **Say who may draw the line registering their own resignation** (rule 70).
4. **Say what a party to a deal who holds no share can do to leave**, or state the cost.
5. **Take the history out, or admit it in.** Either renumber Agreements in reading order at the freeze and drop section 23 and the retired entries, or say in "How to read" that the numbering preserves a record the reader does not have and need not seek.
6. **Remove the author from the text**: the quotation, "a question put to Nobody, allegedly", "the first wave".
7. **Decide on the named cMIP.** Either the core names no outside specification, or it says plainly why this one is named.
8. **Bring the glossary and the reasons inside the frozen set**, or state in the texts that they are outside it and not binding.
9. **Fix the opening.** A first paragraph a stranger can read, saying what MOR is and what it is for, before "The test".
10. **Have one more reader with no history read Agreements end to end**, formats included, before anyone approves it.

Items 1 to 4 are, for me, conditions. Items 5 to 9 are what serving for a long time asks. Item 10 is the limit of this review.

## 8. Where my view differs from the records in `docs/`

*Added after sections 1 to 7 were complete.*

(to be written)

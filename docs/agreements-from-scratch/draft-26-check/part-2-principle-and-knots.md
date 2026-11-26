# Draft 26 check, part 2: the principle and the knots

*A record of work by the scribe's session K2, 26 November 2026, one of four sessions checking the answers of 26 November before draft 26 is written. A check only: it decides nothing, proposes no remedy and no wording, and changes no other file. Where an answer can be read two ways, both are given and neither is chosen. Every quotation of Nobody, allegedly, is copied from `docs/decisions.md` on main (commit `7366bbd`), typos as the ledger has them. Everything not in quotation marks is this session's wording.*

**The wish** (Nobody, allegedly, `docs/decisions.md`, 20 November): "Current wish: extract data, knowledge and understanding from the simulation run"

On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications."

On this wave (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2"

On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

**What was read.** The ledger on main, the six exchanges whole, and the earlier entries each one reaches. Agreements draft 25 and `encoding-2.md` (branch `claude/agreements-clean-1-hahuwn`, pull request 183). The draft 26 brief (branch `claude/draft-26-brief-ucdzo3`, pull request 206). Identity draft 16, Envelopes draft 12, Text draft 11 and Money draft 14, the LATEST in `spec/README.md`. The research window's round 2 findings (pull request 232) and the codemeister's verifier answers (pull request 229), only where an exchange reaches them.

**Marks.** **TRACED**: to a rule or a ledger line, cited. **COUNTED**: by a script, named. **INFERRED**: this session's reading.

---

## In plain words

1. Exchanges 6 and 7 turn "Protect the unknown party" into a principle of Agreements. Here a "filler" is someone who joined Terms through a role (a spot) after they were made, as a buyer does. Draft 25 already protects what a filler earned (G10.6). It also makes her one of "everyone who signed the original" (G4.8(a)), so by default she must sign every later update. And it binds her to an update she did not sign, where the update condition answers valid (G5.1(c)). His words say she "has no say in the updating of it" and that the principle "would protect her from terms being changed on her". The draft says the opposite on both points.
2. The principle also meets an entry of 18 November that was never marked as replaced. "Built on top, as a test" says: "a rule that settles how people should behave in a deal belongs to the cMIPs built on top, not to the grammar". (The grammar is draft 25's own rules; cMIPs are the documents people choose and plug in.) It counted earned rights as one of its own examples. On 26 November earned rights came back into the grammar.
3. Exchange 6's answer on places agrees with draft 25: a place that only a contest names is a reader's own anchoring, and must be named as such. It does not say how that answer fits "In force once pinned" (18 November), under which only a named place, or the signers' own acts, can put Terms in force.
4. Exchange 8 adds nothing to the core. Whether a home may "hold" a rotation and "drop" it depends on reading "hold" as "before accepting" (Identity rule 24 allows that) or as "after accepting" (Identity rules 19, 28 and 30 forbid that).
5. Exchanges 9 and 10 are about knots. A knot is one act naming another by its hash, which proves that the second came first. He called a mention in a text act "a knot", and the answer gives Agreements one hash naming a set of acts. Draft 25 lists closed sets of fields whose namings count (G13.1, G4.7(a)), and reads only fingerprints in `relies_on` (G2.1, G2.2). Either the lists widen, or a mention gives no order to a late update and a set is left unread.
6. Exchange 11 agrees word for word with Envelopes 12 and touches no rule of draft 25.

---

## Exchange 6. Whose place counts; protect the unknown party, as a principle

**The exchange** (26 November, 15:51–16:04; ledger on main, lines 65 to 67). The MOR lead asked whether, where Terms name no place and a rule they never signed (a contest's) names one, a verifier may answer "in force by position N" of that place. He leaned no. He: "I think you are right. It is worth turning it into a principle. Protect the unknown party"

Arrived at (to check), the MOR lead's lines:
- (A) "a place named only by a rule the parties never signed does not order their Terms. A verifier may give an answer per such a place only as the reader's choice, named so. A contest counts by its own place for its own purposes."
- (B) "'Protect the unknown party' is a principle of MOR. Where it is written is not yet asked."

### 1. Rules of draft 25 it touches, and the brief's sort

**Line (A), the place.**
- **G4.6**: "where no place is named, per the anchoring the reader accepts, with it named, or else **as shown**". Brief: STAYS or CHANGES (two-way reading 2). [TRACED]
- **G7.3**: "Where no place is named, a verifier MUST qualify every such answer **as shown**, or **per anchoring** where the reader accepts one, with it named". Brief: MOVES (to the MICS). [TRACED]
- **G7.4**: "The place the Terms in force name is the one every reader uses for that agreement". Brief: CHANGES (its first sentence the one rule that stays). [TRACED]
- **G13.4**: "Only where the agreement names none does each reader accept the anchoring it chooses." Brief: STAYS or CHANGES (two-way readings 2 and 3). [TRACED]
- **G4.1**, where the brief sorts it as CHANGES: "Terms are in force only once the order of those signatures is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion." [TRACED, brief row G4.1]
- **G13.3**, last sentence: "**Per place**, the position at which Terms came into force is the first position at which ...". Brief: CHANGES. [TRACED]

**Line (B), the principle.** A principle reaches further than one rule. Every rule of draft 25 it reaches is listed below, under "Where the principle reaches". Its first hold is **G10.6** ("No later version changes the rights of a filling already earned unless: (a) ... (b) ..."), which the brief sorts as **GOES** (G10.6, G10.6(b)) and **GOES or STAYS** (G10.6(a), two-way reading 11). [TRACED]

### 2. Earlier ledger entries it meets

- **"The place is a pointer"** (17 November): "It's just a pointer to a relay then. Why the need for more grammar?" Line (A) adds no field and no answer: a reader's own anchoring is already in G4.6, G7.3 and G13.4. **AGREES.** [TRACED; INFERRED that it adds no grammar]
- **"In force once pinned"** (18 November): "Agreed. Let them get stuck and cook it clean"; the line: Terms "are in force only once the order of the signatures that put them in force is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion". **CONFLICTS, read one way** (conflict C5 below). [TRACED]
- **"Order is sequence"** (18 November): "Order is not time, it's sequence." **AGREES**: a contest's place gives the contest its order and gives none to Terms that never chose it. [INFERRED]
- **"Earned rights leave the grammar"** (18 November) and exchange 5 (26 November). The ledger marks the 26 November answer as replacing it. That mark is checked below, as the prompt asks. **REPLACES, marked by the ledger**, with two things the mark does not cover. [TRACED]
- **"Built on top, as a test"** (18 November). **CONFLICTS** (C7). [TRACED]
- **Exchange 14, "an agreement with no stated anchor cannot build a temporal condition"** (26 November, 16:33). A contest's place is not the Terms' stated anchor, so under line (A) it gives those Terms no deadline. **AGREES.** [INFERRED]

### The mark "this replaces 'Earned rights leave the grammar'", checked against both entries whole

*18 November, whole.* The MOR lead set out Dana earning a spot at 10%, the offer updated to 5%, and two choices: (a) keep G10.6, (b) drop it, "her protection being the update condition she could read before filling". He: "Agreed". The line says: "G10.6 goes. Whoever fills a spot is bound by the Terms' update condition like any signer; a condition that needs fillers' signatures protects them, and that is a choice of the Terms, read before filling." The ledger has since added: "*Replaced on 26 November* ('Protect the unknown parties', in the new stint): G10.6 comes back with (a) only." [TRACED, ledger lines 487 to 490]

*26 November, whole* (the end of exchange 5, which runs into exchange 6 by its times). He: "Yes, it was a bad idea. It's the "let me drown you in terms updatable unilaterally" nightmare we already live under". Then, asked why (b) was added and whether today's answer replaces 18 November's: "Yes, but me saying something does not mean that something was necessarily a good idea". The line: "this replaces 'Earned rights leave the grammar' (18 November). G10.6 comes back with (a) only". [TRACED, ledger lines 60 to 63]

*What the check finds.*
- **The mark holds for G10.6 itself.** His "Yes" answers the question whether it replaces. On 18 November G10.6 went whole; on 26 November it comes back with (a), and (b) goes. [TRACED]
- **The mark does not cover the second sentence of 18 November's line.** "Whoever fills a spot is bound by the Terms' update condition like any signer" is about more than rights. It is how draft 25 reads a filler in G4.8(a) (she is among "everyone who signed the original") and in G5.1(c) (she is bound by an update she did not sign). His words of 26 November, "she has no say in the updating of it, only the known parties can", reach the first. "It would protect her from terms being changed on her" reaches the second. The ledger marks a replacement of the whole entry, but writes out only the part about rights. [TRACED for both texts; INFERRED that the mark is narrower than the words]
- **The mark does not reach "Built on top, as a test"**, an entry from the same morning that used earned rights as one of its examples (C7). [TRACED]
- **The brief predates the mark.** Its rows G10.5, G10.6, G10.6(a), G10.6(b), G10.7, G5.7, G11.7 and G12.5, its two-way reading 11 and its "Decided, not yet worded" item 10 all rest on "Earned rights leave the grammar". None of them stands as sorted. [TRACED]
- **His words of 16:03** say that what he said earlier binds as the record of an exchange, not as proof it was a good idea. The line records exactly that. **AGREES.** [TRACED]

### Where the principle reaches: every rule of draft 25

The rules are given in the order of the text. "Unknown party" is read here as his words in exchange 5 give it: "Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can. She should be protected." [TRACED]

| rule | what it says, short | against the principle |
|---|---|---|
| §1 Purpose | "whom does it protect who did not choose it" | EXTENDS: the principle names one such person. [INFERRED] |
| def. Party | "as a **role**: a spot for someone not yet known, linked to a signer later" | AGREES, and is the structural reading of "unknown" (see below). [TRACED] |
| def. Buyer | "whose identity was not known when the offer's maker drafted and signed them" | the factual reading of "unknown" (see below). [TRACED] |
| def. Offer | "who takes part was not known when the Terms were signed. That reading is Claude's" | same. [TRACED] |
| G1.2 | "where it has not signed it is not bound by any act of these Terms" | AGREES. [INFERRED] |
| G4.3 | "An assent binds its signer only while the Terms it names are in force." | CONFLICTS, read one way (C3). [TRACED] |
| G4.5 | "Terms stop being in force when Terms that replace them ... are in force." | CONFLICTS, read one way (C3). [TRACED] |
| G4.8(a) | "Everyone who signed the original is: each party in whose name an assent to the original counts (... a signer who fills a role ...)" | CONFLICTS (C1). [TRACED] |
| G4.11 | which parts an update may change: "(a share, a party, the rights a version offers ...)" | AGREES, read as an offer to later fillers. [INFERRED] |
| G4.11(e) | "an update is valid when everyone who signed the original signs it" | CONFLICTS (C1). [TRACED] |
| G4.11(f) | "What a version offers, and the rights of those who earned a filling under it, change only through an update (G10.6, G10.7)." | UNSAID: exchange 5's "a deal that ends by itself ... says so in its own version's words" against "Nothing changes by itself". Read one way, the end is one of the "conditions that version puts on them" (G10.6), and there is no conflict. Read the other way, it is a change by itself. [INFERRED] |
| G5.1(c) | bound where "the act is a Terms act that replaces Terms by which they are bound, and the update condition of those Terms answers valid for it" | CONFLICTS (C2). [TRACED] |
| G5.2 | "with no assent of theirs, under G5.1(c)" | CONFLICTS (C2). [TRACED] |
| G5.7 | "a filling's rights change only as G10.6 says" | AGREES with the principle. CONFLICTS with the brief's CHANGES. [TRACED] |
| G10.3 | "Each signer who fills a spot is a party in it from then on. They are bound only by their own assent (G5)." | AGREES. Its "only by their own assent" sits against G5.1(c), which binds that same party without it (C2). [TRACED] |
| G10.4 | "No verifier can check that a future spot was used only for them; whether it was is the authors' word" | UNSAID: whether a filler was "unknown" is not in the bytes (see below). [TRACED] |
| G10.5 | "keeps the rights of the version it was earned under (G10.6)" | AGREES. CONFLICTS with the brief's CHANGES. [TRACED] |
| G10.6 | "No later version changes the rights of a filling already earned unless ..." | REPLACES the brief's GOES (the ledger marks it). [TRACED] |
| G10.6(a) | "it carries an assent to it signed by that filling's holder in their own name" | AGREES: it stays. This settles the brief's two-way reading 11. [TRACED] |
| G10.6(b) | "the version the filling was earned under names an update condition, and that condition's cMIP ... answers valid" | goes, by exchange 5 (another part's exchange). AGREES with the brief's GOES. [TRACED] |
| G10.7 | "whether the holder is still a party in the spot (G10.3), and whatever else follows, are as that update and the version the filling was earned under state" | CONFLICTS, read one way (C2): an update could state that she is no longer a party in her spot. [INFERRED] |
| G11.6(b) | "a buyer is bound by that version by their own assent (G5.1(a), G10.3), its data socket included" | AGREES. [TRACED] |
| G11.7 | "After the confirmation comes access to what was bought. What that is ... is said by the version the payment names" | AGREES. The brief's note that it "names G10.6, which goes" no longer stands. [TRACED] |
| G11.8 | "a signer who fills a role is not counted among them (P17)" | AGREES: a contest does not reach fillers. [TRACED] |
| G12.5 | a filling in a branch set aside "stands ... no version of the continued line is named as a later version that changes its rights (G10.6)" | AGREES. CONFLICTS with the brief's CHANGES. [TRACED] |
| G13 (Protects) | "Whoever acts on a version they read and named: the payer above all." | AGREES. [TRACED] |
| G14.2 | "Terms made with the holder of the moment keep counting after a later transfer" | CONFLICTS, read the wide way (C8): the later buyer of the baker's rights. [INFERRED] |
| §5, K4 row | "or, where a filling is asked about, the version it was earned under and the later version (G10.6)" | CONFLICTS: this input exists only for G10.6(b), which goes. [TRACED] |
| §5, K5 row | "the version it was earned under (G10.6)" | AGREES. [TRACED] |
| §6, P15 | "the grammar gives a party named as a signer ... no default of its own against a later version" | AGREES: a known party is not protected by default. [TRACED] |

Draft 25 has 19 lines that name G10.6 (grep for "G10.6" over `draft-25.md`). They are the rows above plus the definitions "Rights", "Condition" and "Apply", G4.11(i), section 5's table row "Closing, reopening, closing by itself", P21, the stated cost "Valid is as sure as the update condition's cMIP", and two lines of section 8. Each one now names a rule that stays. [COUNTED, `grep -c "G10.6"` on draft 25 gives 19]

### How the principle reads for a party known at creation who joins a role later

Three people can fill a role who were not unknown. Two readings follow for each, and neither is chosen. [INFERRED throughout, from the texts cited]

- **Bob, known to the makers, fills a role** (for example "done": "whoever proves they have done X").
  - *(i) By the bytes.* Draft 25 names a party "as a **role**: a spot for someone not yet known". Bob joined through a role, so he is protected and "has no say". This is the reading of the line in exchange 5: "A participant who joins through a role after the agreement was made (a filling) has no say in its updates; only the known parties have."
  - *(ii) By the fact.* His words are "she is unknown at the time of creation of the agreement", and the definition "Buyer" says "whose identity was not known when the offer's maker drafted and signed them". Bob was known, so he is a known party. No verifier can tell which applies: as G10.4 says of a future spot, "whether it was is the authors' word".
- **Carla, named as a signer in version 1, also fills a role.** Under (i) her filling is protected, and as a signer she keeps her say in updates. Under (ii) she is a known party, has her say, and her filling is not protected as an unknown party's would be. G10.6(a) protects every filling either way.
- **Dan, added as a signer by version 3.** He was unknown when the agreement was made (the root) and known when version 3 was. Under (i) he is a known party, named as a signer. Under (ii), by the letter of "at the time of creation of the agreement", he is unknown and "has no say". Draft 25 G4.8(a) asks him, as one of those "in whose name an assent to the original counts".

### 3. Conflicts

C1, C2, C3, C5, C7 and C8 are set out in full at the end of the file. One more is here:

- **Line (B) against exchange 7's line.** Exchange 6: "'Protect the unknown party' is a principle of MOR." Exchange 7, about four minutes later: "It's an agreements principle", and the line: "it belongs to Agreements". These are two arrived-at lines about one principle. The second narrows the first, and the ledger does not mark this. **Plain words:** a principle of MOR would bind Money, Identity and every layer; a principle of Agreements binds only Agreements. [TRACED]

### 4. Unsaid, or said more than his words

- **"It" in "It is worth turning it into a principle."** (i) The place answer he had just agreed to. (ii) "Protect the unknown parties" from exchange 5, whose times (15:49–16:03) overlap this exchange's (15:51–16:04). Line (B) takes (ii) without saying so. [TRACED times; INFERRED readings]
- **Line (A)'s last sentence says more than his words.** The lean he agreed to said "the contest counts by its own place for its own prize"; the line says "for its own purposes". [TRACED]
- **"Of MOR"** in line (B) is the line's word, not his (see the conflict above). [TRACED]
- Whether a verifier answers "in force at position N" at all, even for the Terms' own place. Verifier 2 has no such question; pull request 229, Q6: "Should a verifier answer 'in force at position N'?" [TRACED]
- What makes a party "unknown": the bytes (a role) or the fact (identity unknown to the makers). [INFERRED]
- Whether "unknown" is judged against the root or against the version the party joined under. [INFERRED]
- Whether the principle covers what an unknown party owes as well as what they bought (G5.1(c)). [INFERRED]
- Whether a filler is among "everyone who signed the original" (G4.8(a)). [TRACED]

---

## Exchange 7. Protect the unknown party is an Agreements principle

**The exchange** (26 November, 16:05; ledger line 69). Asked where the principle is written, the MOR lead leaned "the working rules and the companion, the core carrying it by the rules that apply it (G10.6, 'nothing about me without my signature')". He: "It's an agreements principle"

Arrived at (to check): "it belongs to Agreements: stated in the Agreements companion, applied by Agreements' rules."

### 1. Rules of draft 25 it touches

Every rule in exchange 6's table "Where the principle reaches" (the principle is the same one). Beside them:
- **§1 Purpose**: "Every grammar rule here answers two questions: which lie does it expose ..., and whom does it protect who did not choose it." Each grammar rule ends with a "**Protects.**" line. A principle "applied by Agreements' rules" meets these lines. **EXTENDS.** [TRACED; INFERRED that they meet]
- **G5.1(b)**, which the brief sorts as CHANGES: "An act made for someone under a power binds her only where her own signature is on the version that gives the power." The MOR lead named this one in his lean. **AGREES.** [TRACED]

### 2. Earlier ledger entries it meets

- **"Only rules in the hashed text"** (17 November): "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested." A principle is no rule, so it goes in the companion. **AGREES.** [TRACED]
- **"A companion for Agreements"** (17 November): "Agreements has become quite abstract. It will need a good companion that explains why it is structured as such and how we got that that shape." **AGREES.** [TRACED]
- **"Nothing about me without my signature"** (18 November): "Absolutely, no need to even debate this. Nothing about me is accepted without my signature." **EXTENDS**: the brief's two-way reading 8 asks whether that sentence reaches G5.1(c). Read with this principle, it does for an unknown party (C2). [TRACED; INFERRED]
- **Exchange 6, line (B)**: "a principle of MOR". Narrowed here, unmarked (see exchange 6, item 3). [TRACED]
- **"What the core is for"** (17 November): "ID and text are universal, development is definition, the rest is to build on top of." Placing the principle in Agreements, not in the working rules, keeps it out of Identity and Text. **AGREES.** [INFERRED]

### 3. Conflicts

C7 (the general test) applies here as it does to exchange 6. No conflict is this exchange's alone. [INFERRED]

### 4. Unsaid, or said more than his words

- **The line says more than his words.** His words: "It's an agreements principle". The line adds "stated in the Agreements companion". That was half of the lean his words set aside. The lean said "the working rules and the companion". His answer can be read as (i) not the working rules, so the companion alone stands, or (ii) inside the Agreements text itself, not beside it. The ledger takes (i) without saying so. [TRACED; INFERRED readings]
- Whether a principle in the companion binds a verifier, or only explains the rules that apply it. [INFERRED]
- Which rules "apply" it. Draft 25 has at least the rows of exchange 6's table, and some of them pull against it (C1, C2). [INFERRED]

---

## Exchange 8. A key change that waits is a home's service

**The exchange** (26 November, 16:05–16:07; ledger line 72). DubWeb's and Keep's finding: an identity cannot say "my rotations count only after N blocks unless my current key objects". The MOR lead leaned that it stays a home's service, "Homes guarding acceptance are a market service": "a home may hold a rotation N blocks and drop it on the current key's objection". He: "Is that something that can be built atop without messing the universality of the identity layer?" The MOR lead: yes; "no new act, field or answer"; five limits. He: "I don't feel it's a feature worth messing the core for"

Arrived at (to check): "nothing is added to Identity. A rotation that waits, dropped on the current key's objection, can be offered by homes, above the core."

### 1. Rules it touches

**Draft 25.** No rule of draft 25 by its words. [TRACED: draft 25 names no rotation and no home] One seam:
- **Section 2, "Answers"**: shown, not shown, fork, valid / not valid, invalid, unchecked. There is no "pending". Identity everyday check 2 gives an act "pending, never valid and not invalid" while its rotation does not count yet. A home that waits makes a rotation pending for N blocks, and an Agreements act signed under the new key is pending at Identity for that long. **UNSAID.** [TRACED for both texts; INFERRED that the wait lengthens it]
- **G6.1**, and the brief's new item 10: "that a key change continues the signer's line and never starts a fresh one". **AGREES.** [TRACED]

**Identity draft 16 (LATEST)**, the rules the answer reaches, named and not judged:
- *Rule 24*, "A home MAY apply its own conditions before accepting a rotation". [TRACED]
- *The line in Identity's reasoning* (line 1045): "Homes guarding acceptance are a market service, not a protocol duty." The lean quotes it. [TRACED]
- *Rule 18*, "A home MUST check a rotation's validity before storing it". *Rule 19*, "A home MUST NOT drop a valid rotation it has accepted". *Rule 20*, "A home MUST sign a receipt for every identity-chain act it accepts". [TRACED]
- *Rule 28*: "Receipts are proof, not permission: a home that holds a valid rotation cannot withhold its receipt without breaking rule 20." "Anyone who accepts an act under a pending key does so at their own risk". [TRACED]
- *Rule 30*: "A home that holds a valid rotation ... MUST reject any other rotation ... revealing the same chain key. The first valid rotation a home holds wins at that home". [TRACED]
- *Rule 2* (the home rule) and *rule 4* ("Self-hosting is a trust model"; rule 28: "A self-hosted identity's rotation counts on the rotation alone"). The lean's limits "the wait must cover enough homes for the rule" and "none for a self-hosted identity" rest on these. [TRACED]
- *Rules 48 and 49*: an objection is "a home of the old set"'s act against a homeless rotation, and "A single valid objection ... voids a homeless rotation". [TRACED]
- *Rule 32*, "Keep the two keys apart, and back both up", and the escape (section 11, rule 29). The lean's limit "with both keys stolen the thief can object as well" rests on these. [TRACED]

### 2. Earlier ledger entries it meets

- **"What the core is for"** (17 November): "ID and text are universal". His question "without messing the universality of the identity layer" asks for that, and the answer keeps it. **AGREES.** [TRACED]
- **"No release by a fork or a key"** (18 November): "Confirmed", to "neither a fork nor a key change ever releases anyone from Terms in force". A waiting home delays a key change and releases no one. **AGREES.** [INFERRED]
- **"Two threads, two owners"** (17 November): "It does". **AGREES**: the signer's line is the lower layer's, and the answer leaves it there. [TRACED]
- **Exchange 15, "Two keys, so they are kept apart"** (26 November): "sorry, we built two keys so that they could be kept separately". **AGREES** with the lean's limit about both keys stolen. [TRACED]

### 3. Conflicts

- **C6.** "Hold" and "drop", against Identity rules 19, 28 and 30, read one way. See the list at the end.

### 4. Unsaid, or said more than his words

- **The line says more than his words.** His words decline a change to the core: "I don't feel it's a feature worth messing the core for". The line adds "can be offered by homes". That was the MOR lead's answer to his question "Is that something that can be built atop", and his words neither confirm nor deny it. [TRACED]
- What "the current key's objection" is in bytes. Identity's objections are a home's acts (rules 48, 49), not the owner's. The lean says "no new act". So either it travels outside MOR, as a home's own service, or it is some act no text names. [TRACED; INFERRED]
- Whether a rotation a waiting home holds is "accepted" (rules 19, 20, 30) or not yet (rule 24). [INFERRED]
- What an Agreements verifier answers for an act under a key that is pending for the length of a wait. [INFERRED]

---

## Exchange 9. Knots of different kinds

**The exchange** (26 November, 16:08–16:14; ledger line 75; the research window's question 9: "Does a reference in a text act, or a cMIP's record, ever count as 'another identity acknowledged it' under Identity rule 34?"). The MOR lead read Identity's rule 34 as answering no. He: "Rely to me is just a knot making mechanism useful to the ID that actions it." Then: "A mention is a knot a different kid of knot. Isn't it" The MOR lead: yes; a mention proves order, not reliance. He: "They live on separate layers and potentially on separate relays, no?" The MOR lead: yes. He: "Yes, knots of different kids, on different layers, used at different moments if needed"

Arrived at (to check): "rule 34 stays as it is: an owner's post left out by a key change stays visible as disputed only where another identity acknowledged it (`acks`, a witness act) or a keeper recorded it; a mention does not rescue it. Relying is a knot, useful to the identity that makes it. A mention is a knot too, of another kind (order, not reliance), on another layer, used at other moments where needed."

### 1. Rules of draft 25 it touches

- **Definition "Name (or cite)"**: "an act names another act ... when it carries its fingerprint in one of its fields ... Each such naming is a **knot**". **EXTENDS**: a mention is a knot of another kind. [TRACED]
- **G13.1**: "An act is read against the versions and acts it names, in any field that holds a fingerprint (`terms`, `under`, `replaces`, `previous`, `answers`, `resolves`, `relies_on`, `settlement`)." Brief: stays as it is. [TRACED]
- **G13.3**: "An act that names another, directly or through acts that name it, came after it: each naming is a knot." Brief: CHANGES (for "valid and in force"). [TRACED]
- **G4.7(a)**: "The knots are the namings G13.1 reads: every field that holds a fingerprint, of every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming of its call and the acts it relied on". Brief: CHANGES. [TRACED]
- **G14.2, "Late Terms"**, (a) "By knots ... as G4.7(a) reads knots". Brief: MOVES (to Envelopes), and changes there. [TRACED]
- **G4.10**, ordering by citing ("only citing gives an order, as G13.3 reads it"). Brief: CHANGES. [TRACED]

**Other layers, which the exchange itself names.**
- *Identity rule 34*: "another identity acknowledged it (Envelopes; by an act of a type the Identity, Money or Agreements MIR defines, such as a witness act); or a named keeper recorded it before recording the rotation". **AGREES** with the line. [TRACED]
- *Envelopes rule 17* ("It says only 'I received this'") and *rule 18* ("A text act ... MUST NOT carry `acks`"). *Envelopes rule 20*: `refs`, "meaning only 'look at this'". *Envelopes rule 13*: the act format's `prev`, position and running summary. *Envelopes rule 16*: "Every 'before' in the core is judged inside one named chain, by reference to a specific act." *Text draft 11, rule 14*: a text act carrying `acks` is invalid. [TRACED]

### 2. Earlier ledger entries it meets

- **"Knots, made structural where needed"** (18 November): "working on an agreement with two other people should tie me to the agreement AND to the two other people". **EXTENDS**: knots now have kinds. [TRACED]
- **"Time: anchoring, cross-links, and 'seen'"** (20 November): "That adds an extra signature that says: I have seen the proposal, or I have seen the signature." **EXTENDS**: "seen" is a knot of reliance, signed. [INFERRED]
- **"Order is sequence"** (18 November): "sequence established through steps linked as a whole". **AGREES**: a mention is such a step. [INFERRED]
- **Exchange 1** (26 November): "Only the knots or anchoring can" (quoted in G4.7). Which knots? See C4. [TRACED]

### 3. Conflicts

- **C4.** "A mention is a knot" against G4.7(a)'s closed list of knots. See the list at the end.

### 4. Unsaid, or said more than his words

- **The line says more than his words.** "Rule 34 stays as it is" and "a mention does not rescue it" are the MOR lead's reading. His words never name rule 34. His last "Yes" answers the MOR lead's account of the layers. [TRACED]
- Whether "different moments" excludes a mention, or the act format's `prev`, from Agreements' readings of order (G13.3, G4.7, G4.10, G14.2). Pull request 229 asks the same of `prev`: "Q4. Is the act format's `prev` a knot, for 'signed before'?" [TRACED]
- What the kinds of knot are, as a list: by naming in Agreements fields, by `acks`, by `refs`, by `prev`, by a keeper's record. [INFERRED]
- Whether a knot through a private act (one a reader cannot open) counts as a knot for a reader who holds it closed. G6.1 already treats such an act as unreadable. [TRACED G6.1; INFERRED the question]

---

## Exchange 10. One way to name a set of acts, in Agreements

**The exchange** (26 November, 16:11–16:16; ledger line 78; finding 2, "exactly these acts"; the research window's question 11: "Is one byte form for a set of act ids something Identity or Text need, or only something built on top?"). He: "You are going to expand what the set of byte is and what it does pls" The MOR lead gave a recipe: "the ids as raw bytes, sorted, repeats dropped, joined, hashed with a label for a set of acts". He: "Should it be in envelopes though? It feels like agreements stuff" The MOR lead: yes; two ways, (a) in Agreements' grammar, as a value form like a fingerprint, or (b) each cMIP its own; leaned (a). He: "Knots making is core core business, a"

Arrived at (to check, reading his "a" as option a): "Agreements' grammar gets one byte form for naming a set of acts, a value like a fingerprint, so that Terms and every cMIP built on Agreements name the same set the same way. It says nothing about whether the set is complete, what it means, or when it was read. Making knots is core business."

### 1. Rules it touches

**Draft 25.**
- **Definition "Fingerprint"**: "the identifier the core gives to fixed bytes. 'Named by fingerprint' means referred to by that identifier and nothing else." **CONFLICTS** (C9). [TRACED]
- **Definition "Name (or cite)"**, the knot. **UNSAID**: whether a set's value names each act in it. [TRACED]
- **Section 3**, "Each field holds one kind of value, given in its row: a fingerprint; a list of fingerprints; an identifier ...; a socket ...; or one of the words the row names." A set's value is none of these. **EXTENDS.** [TRACED]
- **G2.1**: "every piece in `relies_on` ... MUST be named by fingerprint". **G2.2**: "An entry of `relies_on` that is not a fingerprint is not read". **CONFLICTS** (C9). [TRACED]
- **G13.1, G13.3, G4.7(a), G14.2 (Late Terms (a))**: the closed list of namings that are knots. **CONFLICTS, read one way** (C9). [TRACED]
- **G13.2**: "A verifier MUST NOT read an act as having relied on a version or act it does not name." **UNSAID**: whether an act that names a set has named each member. [TRACED]
- **Definition "Verifier"**: "whoever applies these grammar rules to a set of acts". The research found that "no text names that set" (pull request 232, finding 2(b)). **UNSAID**: whether the new form is the name of that set. [TRACED]
- **`encoding-2.md`, E18**: "Sets are sorted ... Duplicates are rejected." **CONFLICTS, read one way** (C10). **E5's table** (what each fingerprint is the hash of: an act, a cMIP, the body's words) has no row for a set. **EXTENDS.** [TRACED]

The brief has no row for a set form: it is new. [TRACED: no line of the brief names it]

**Other layers (LATEST), named and not judged.**
- *Envelopes 12, Part three step 3*: "The act id is `tagged_hash("MOR/act", outside)`." The members of a set are act ids. [TRACED]
- *Envelopes 12, "The running summary"*: "`S(n)`, the summary of a sequence's first `n` acts, is the root of a Merkle mountain range over their act ids, in order". A form below Agreements that already names many acts, ordered, one signer's sequence. [TRACED]
- *Envelopes 12, rule 28* (retired): "A relay's statement of the acts it holds is the relay transport cMIP's." A relay's manifest is not built on Agreements. [TRACED]
- *Envelopes 12, rule 20*: `refs` is a list meaning "look at this". [TRACED]
- *Identity 16, "Encoding and conventions"*: "`tagged_hash(tag, x) = SHA-256(SHA-256(tag) || SHA-256(tag) || x)` ... Every tag the core uses begins with `MOR/`: `MOR/act`, `MOR/inside`, `MOR/mmr-leaf`, `MOR/mmr-node`, `MOR/work`, `MOR/spec`, `MOR/safety`, `MOR/sealed/wrap` and `MOR/law/leftover` (Agreements)." A "label for a set of acts" is a tag. The list includes a tag of Agreements' own. [TRACED]
- *Money 14*: "**Batch.** A set of payouts a split service pays with one rail payment ... named on receipts only." Money's own name for a set, not of act ids. [TRACED]

### 2. Earlier ledger entries it meets

- **"What the core is for"** (17 November): "the rest is to build on top of". The research read a keeper's manifest as "built on top" under this entry (pull request 232, finding 2(e)). The answer moves one form into the grammar. Read as vocabulary of a language, this **AGREES** with exchange 1's "treat it almost as a language and let the community implementations write the rules". Read as the core doing a cMIP's work, it **CONFLICTS**. Neither is chosen. [TRACED; INFERRED readings]
- **"Knots, made structural where needed"** (18 November). **EXTENDS**: a set is a knot to many acts at once, if it is a knot at all (C9). [INFERRED]
- **"Order is sequence"** (18 November): "sequence established through steps linked as a whole". The recipe sorts and drops order, and the line says it says nothing of "when it was read". **AGREES.** [TRACED]
- **Exchange 13, "The words of Terms are a Text act"** (26 November): the hash for loose words goes. That leaves E5 with fewer kinds of fingerprint and adds one here. **EXTENDS.** [TRACED]

### 3. Conflicts

- **C9.** A set's value, against "named by fingerprint" (G2.1, G2.2) and the closed list of knots (G13.1, G4.7(a)).
- **C10.** "Repeats dropped" against E18's "Duplicates are rejected", read one way.

### 4. Unsaid, or said more than his words

- **"Core core business."** (i) The ledger: his "a" chooses option (a), Agreements' grammar. (ii) "Core core", after "Should it be in envelopes though?", may point below Agreements, to the core of the core, and his "a" may be only the choice between (a) and (b). The ledger marks its reading "to check". [TRACED; INFERRED reading (ii)]
- **The line says more than his words.** "It says nothing about whether the set is complete, what it means, or when it was read" is the MOR lead's. His words do not limit it. [TRACED]
- Whether a set's value counts as a knot to each member (C9). [INFERRED]
- Whether Identity, Money, a relay's manifest or a keeper's record use the same form, since the line names "Terms and every cMIP built on Agreements" only. [TRACED]
- Its tag, and whether it joins Identity's list of every tag the core uses. [TRACED]
- Whether a set may be empty. [INFERRED]
- Whether members must be act ids only, or may include other fingerprints (spec hashes, an envelope). [INFERRED]

---

## Exchange 11. A sealed container: the core gives the address, not a name

**The exchange** (26 November, 16:16–16:19; ledger line 81; the research window's question 12: "What names a sealed container, which has no act id?"). The MOR lead leaned that the core names nothing. He: "Well, it names the receiver, no?" The MOR lead: yes, unsigned; "that is its address, not a name". He: "Can it work?" The MOR lead: yes, a relay can sign "I hold container H for Ana"; "it proves delivery, never content". He: "Agreed then"

Arrived at (to check): "nothing changes in the core. The sealed container's outside gives its address (its recipients); the core gives it no name. A relay or a delivery service names a container by the hash of its bytes, for receipts of delivery, above the core. The proof of who wrote what, to whom, stays in the inner act."

### 1. Rules it touches

**Draft 25.** None. Draft 25 never names a sealed container [TRACED: the only match for "sealed" in `draft-25.md` is "sealed in an envelope", in the definition "Bake"]. Adjacent but not reached: G6.1 on "a private act, held without its key"; section 5.3's delivery module. [TRACED]

**Envelopes 12 (LATEST), named and not judged.**
- *Section 3*: "The outside of a sealed container is unauthenticated by design. Nothing on it is signed, and nothing in the core relies on it: who wrote, to whom (the inner act's own `to`) and what, are proven inside". [TRACED]
- *Part three, "Sealed container", step 3*: "A relay's own name for a container, a hash of its bytes, is the relay transport cMIP's business, under a tag of that cMIP's own." And: "nothing is hashed under `MOR/sealed`". [TRACED]
- *Rule 12* ("A container that fails delivers nothing"), *rule 28* (retired: "A relay's statement of the acts it holds is the relay transport cMIP's") and *rule 29* (delivery "is the relay market's business"). [TRACED]

### 2. Earlier ledger entries it meets

- **"What the core is for"** (17 November). **AGREES**: a delivery receipt is built on top. [TRACED]
- **Exchange 10** (26 November). A container hash is not an act id, so it is no member of a set of acts. **AGREES**, if the set form takes act ids only (an item exchange 10 leaves unsaid). [INFERRED]

### 3. Conflicts

None found. The arrived-at line repeats Envelopes 12, Part three, step 3, almost word for word. [TRACED]

### 4. Unsaid, or said more than his words

- "So tampering shows" (the MOR lead's wording in the exchange) holds only for someone who kept the hash before the bytes changed. Envelopes calls dropping a recipient's capsule "no more than withholding the container from that recipient". [TRACED Envelopes; INFERRED the limit]
- Whether a relay's receipt "Ana fetched H" is an act of MOR (some cMIP's type) or something else, and whether Terms may rely on it (G2.1, G13.2). [INFERRED]

---

## The table: every rule of draft 25 these exchanges touch

One row per rule and exchange pair. "§" rows are definitions, sections or table rows of draft 25, not grammar rules. [The rows were counted by a script, `awk -F'|' '/^\| (G|§|def|E18)/'` over this file]

| rule | the exchange | mark | one line |
|---|---|---|---|
| §1 Purpose | 6, 7 | EXTENDS | "whom does it protect who did not choose it": the principle names one. |
| def. Party | 6, 7 | UNSAID | "a spot for someone not yet known": unknown by the bytes, or by the fact. |
| def. Buyer | 6, 7 | UNSAID | "whose identity was not known": the factual reading, which no verifier can check. |
| def. Offer | 6, 7 | UNSAID | "who takes part was not known": the same question. |
| def. Fingerprint | 10 | CONFLICTS | "the identifier the core gives to fixed bytes"; a set's value is Agreements', not the core's. |
| def. Name (cite) | 9, 10 | EXTENDS | a knot has kinds now; whether a set's value names each member is unsaid. |
| def. Verifier | 10 | UNSAID | "a set of acts": whether the new form names it. |
| §2 Answers | 8 | UNSAID | no "pending" for an act under a key a waiting home holds back. |
| §3 field kinds | 10 | EXTENDS | a set's value is none of the five kinds. |
| G1.2 | 6, 7 | AGREES | not bound without signing. |
| G2.1 | 10 | CONFLICTS | "MUST be named by fingerprint" (C9). |
| G2.2 | 10 | CONFLICTS | an entry that is not a fingerprint "is not read" (C9). |
| G4.1 (as the brief sorts it) | 6 | CONFLICTS | reader's choice of place against "in force once pinned", read one way (C5). |
| G4.3 | 6, 7 | CONFLICTS | "binds ... only while the Terms it names are in force" against "version 2 is valid a year", read one way (C3). |
| G4.5 | 6, 7 | CONFLICTS | the replaced version stops, against what she bought lasting, read one way (C3). |
| G4.6 | 6 | AGREES | "per the anchoring the reader accepts, with it named". |
| G4.7(a) | 9, 10 | CONFLICTS | the closed list of knots: a mention, or a set, read one way (C4, C9). |
| G4.8(a) | 6, 7 | CONFLICTS | a filler is among "everyone who signed the original" (C1). |
| G4.10 | 9 | UNSAID | citing gives order; which kinds of knot. |
| G4.11 | 6, 7 | AGREES | an update may change "the rights a version offers", read as offered to later fillers. |
| G4.11(e) | 6, 7 | CONFLICTS | the default asks the filler's signature (C1). |
| G4.11(f) | 6, 7 | UNSAID | "Nothing changes by itself" against a deal that "ends by itself", two readings. |
| G5.1(b) | 7 | AGREES | her own signature on the version that gives the power. |
| G5.1(c) | 6, 7 | CONFLICTS | bound by an update without her assent (C2). |
| G5.2 | 6, 7 | CONFLICTS | "with no assent of theirs" (C2). |
| G5.7 | 6, 7 | CONFLICTS | agrees with the principle; the brief's CHANGES no longer stands. |
| G6.1 | 8, 9 | UNSAID | a key change continues the line; a knot through an act held closed. |
| G7.3 | 6 | AGREES | "per anchoring where the reader accepts one, with it named". |
| G7.4 | 6 | AGREES | only the place the Terms name binds every reader. |
| G10.3 | 6, 7 | AGREES | "bound only by their own assent"; sits against G5.1(c). |
| G10.4 | 6, 7 | UNSAID | "the authors' word": whether a filler was unknown is not in the bytes. |
| G10.5 | 6, 7 | CONFLICTS | agrees with the principle; the brief's CHANGES no longer stands. |
| G10.6 | 6, 7 | REPLACES | comes back, against the brief's GOES (the ledger marks it). |
| G10.6(a) | 6, 7 | AGREES | stays; settles the brief's two-way reading 11. |
| G10.6(b) | 6, 7 | AGREES | goes (exchange 5); the brief's GOES stands. |
| G10.7 | 6, 7 | CONFLICTS | an update may state "whether the holder is still a party in the spot", read one way (C2). |
| G11.6(b) | 6, 7 | AGREES | the buyer bound by her own assent. |
| G11.7 | 6, 7 | AGREES | what was bought is said by the version paid; the brief's note no longer stands. |
| G11.8 | 6, 7 | AGREES | a contest does not reach fillers. |
| G12.5 | 6, 7 | CONFLICTS | agrees with the principle; the brief's CHANGES no longer stands. |
| G13.1 | 9, 10 | CONFLICTS | the fields that hold a fingerprint: a mention, a set, read one way (C4, C9). |
| G13.2 | 10 | UNSAID | relied on what it names: a set's members. |
| G13.3 | 6, 9, 10 | UNSAID | "in force at position N"; which knots order. |
| G13.4 | 6 | AGREES | "Only where the agreement names none does each reader accept the anchoring it chooses." |
| G14.2 | 6, 7, 9 | CONFLICTS | the later buyer of the baker's rights, read the wide way (C8); late by which knots (C4). |
| §5 K4 row | 6, 7 | CONFLICTS | the filling input exists only for G10.6(b). |
| §5 K5 row | 6, 7 | AGREES | "the version it was earned under". |
| §6 P15 | 6, 7 | AGREES | a known party has no default protection. |
| E18 (encoding 2) | 10 | CONFLICTS | "Duplicates are rejected" against "repeats dropped", read one way (C10). |

**Count.** 49 rows: 36 grammar rules and clauses of draft 25; 12 of its definitions, sections, task rows and open items; and 1 rule of encoding 2. Of the 49: 15 AGREES, 3 EXTENDS, 1 REPLACES, 19 CONFLICTS, 11 UNSAID. Exchange 11 touches no row. [COUNTED, by the awk line above, with a tally of the third column]

---

## The conflicts, listed together, hardest first

Hardest: a verifier's answer would turn on it. [The order is INFERRED]

**C1. A filler's say in updates.** *A verifier's answer turns:* is an update with no named condition **valid, by default** without the buyers' signatures, or **not shown** (draft 25's answer where the acts held do not establish it, because an act not held might)? Ana is a buyer, and draft 25's definition "Buyer" says: "A buyer signs by an assent to the version they buy under, as anyone fills a spot".
- Draft 25 G4.8(a): "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; ...)". G4.11(e): "an update is valid when everyone who signed the original signs it". 13 November, "The default update condition", his words: "Everyone who signed the original is the default condition yes".
- 26 November, exchange 5, carried as a principle by exchanges 6 and 7, his words: "Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can."
- **Plain words:** draft 25 counts every buyer as one of those who must sign a default update, so each buyer holds a veto. His words give buyers no say. Both cannot stand: a default update without the buyers' signatures is valid by one and not shown by the other. [TRACED]

**C2. Bound by an update she did not sign.** *A verifier's answer turns:* is the filler **bound** by version 3?
- Draft 25 G5.1(c): bound where "the act is a Terms act that replaces Terms by which they are bound, and the update condition of those Terms answers valid for it". G5.2: "with no assent of theirs, under G5.1(c)". G10.7: "whether the holder is still a party in the spot (G10.3) ... are as that update ... state[s]".
- 26 November, his words: "Let's look at a service… it would protect her from terms being changed on her." And the MOR lead's words, to which he answered "Yes, and the what she bought ...": "version 3 binds her only by her signature, or by a power version 2 gave".
- **Plain words:** draft 25 protects only her rights (G10.6), and still binds her to whatever else a valid update says, even that she is no longer in her spot. His words protect her from changed terms, and the line he said yes to binds her to version 3 only by her own signature. Read as protecting her rights only, the two can both stand. Read as protecting her from any change, they cannot. [TRACED texts; INFERRED the two readings]

**C3. Two versions at once.** *A verifier's answer turns:* which Terms bind Ana and the seller after version 3?
- Draft 25 G4.3: "An assent binds its signer only while the Terms it names are in force." G4.5: "Terms stop being in force when Terms that replace them ... are in force." 26 November, exchange 12 (another part's), his words: "The core should only see one version as valid".
- 26 November, exchange 5, carried by the principle, his words: "If it was year, version 2 is valid a year."
- **Plain words:** draft 25, and his later words, allow one version at a time. Once replaced, version 2 no longer binds through her assent. "Version 2 is valid a year" keeps it binding beside version 3. Read "valid" as the human word for "her rights from version 2 last a year" (G10.6) and both stand. Read it as "version 2 is still in force for her" and they cannot. [TRACED texts; INFERRED readings]

**C4. Which knots order a late update.** *A verifier's answer turns:* is L **a late update**, or a tip of **a fork**?
- Draft 25 G4.7(a): "The knots are the namings G13.1 reads: every field that holds a fingerprint, of every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming of its call and the acts it relied on". G13.1 lists the fields.
- 26 November, exchange 9, his words: "A mention is a knot a different kid of knot. Isn't it", and "Yes, knots of different kids, on different layers, used at different moments if needed".
- **Plain words:** if a mention in a text act, or the act format's `prev` (pull request 229, Q4), is a knot for this purpose, then a chain of namings through it can show L late where G4.7(a)'s list shows a fork. Read "used at different moments" as excluding it, and nothing changes. Read "a knot" as counting wherever order is asked, and G4.7(a)'s closed list cannot stand. [TRACED texts; INFERRED readings]

**C5. A reader's place, and the pin. (Read one way only.)** *A verifier's answer turns:* are Terms that name no place **in force, per anchoring** at a position of the contest's place, or **not yet in force**? A "place" is a relay that orders acts by position. "Anchoring" is whatever a reader accepts as saying what came later. In the round, the deal's Terms named no place, and a contest built above them named one.
- 26 November, exchange 6, the line: "a place named only by a rule the parties never signed does not order their Terms. A verifier may give an answer per such a place only as the reader's choice, named so." Neither the line nor his words say what that answer may say. Draft 25 G4.6: "per the anchoring the reader accepts, with it named".
- 18 November, "In force once pinned", his words: "Agreed. Let them get stuck and cook it clean"; the line: in force "only once the order of the signatures that put them in force is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion".
- **Plain words:** a reader's chosen place is neither a place the Terms name nor a signer's own act. If the reader's answer may say "in force at N", it puts in force Terms that no pin has pinned. If it may say only where acts stand, both rules can stand. [TRACED texts; INFERRED readings]

**C6. A home that holds and drops.** *A verifier's answer turns, at Identity:* does the rotation **count**, given the receipts?
- 26 November, exchange 8, the MOR lead's lean, to which he answered "I don't feel it's a feature worth messing the core for": "a home may hold a rotation N blocks and drop it on the current key's objection".
- Identity 16, rule 19: "A home MUST NOT drop a valid rotation it has accepted". Rule 28: "a home that holds a valid rotation cannot withhold its receipt without breaking rule 20." Rule 30: "The first valid rotation a home holds wins at that home".
- **Plain words:** if "hold" means not yet accepted, which rule 24 allows ("before accepting"), the lean stands beside Identity. If it means held and stored, the home breaks rules 19, 20 and 28, and by rule 30 the thief's rotation wins at that home anyway. [TRACED texts; INFERRED readings]

**C9. A set's value, as a name.** *A verifier's answer turns:* is Terms' evidence named by a set **read**, or **left unread**? Is an act **late by knots** through a set?
- 26 November, exchange 10, the line: "Agreements' grammar gets one byte form for naming a set of acts, a value like a fingerprint".
- Draft 25, definition "Fingerprint": "the identifier the core gives to fixed bytes. 'Named by fingerprint' means referred to by that identifier and nothing else." G2.1: "every piece in `relies_on` ... MUST be named by fingerprint". G2.2: "An entry of `relies_on` that is not a fingerprint is not read". G13.1 and G4.7(a): knots are fields that hold a fingerprint.
- **Plain words:** a set's value is "like a fingerprint" but not one the core gives. If it is a fingerprint, the definition changes. If it is not, G2.2 leaves it unread wherever Terms rely on it, and it is no knot, though he said "Knots making is core core business". [TRACED]

**C8. The later buyer of the baker's rights. (Read the wide way only.)** *No verifier's answer turns; who carries the risk does.* The baker is whoever sealed a finished work; her rights to it can be sold to a later holder.
- 18 November, "A sale is not a race", his word: "Agreed"; the line: "Terms made with the holder at the act they cite keep standing after a sale ... The buyer of the rights carries that risk". Draft 25 G14.2: "Terms made with the holder of the moment keep counting after a later transfer".
- 26 November, the principle: "Protect the unknown party". What it protects against, in his words of exchange 5: "it would protect her from terms being changed on her", and "Version 2 is what she bought, and she has no say in the update".
- **Plain words:** the buyer of the baker's rights was unknown when the earlier holder made those Terms. If "unknown party" means anyone unknown at creation, the principle protects him, while 18 November puts the risk on him. If it means a filler of a role, there is no conflict. [TRACED texts; INFERRED the wide reading]

**C10. Repeats.** *A verifier's answer turns only where a set is carried as a list in a field:* is the act **rejected**?
- 26 November, exchange 10, the MOR lead's recipe, to which he answered "a": "the ids as raw bytes, sorted, repeats dropped, joined, hashed".
- `encoding-2.md`, E18: "Sets are sorted ... Duplicates are rejected."
- **Plain words:** for the same list with a repeat, one gives a value and the other rejects the act. They can both stand only if the set form is never written as a list in a field. [TRACED texts; INFERRED the condition]

**C7. The general test.** *No verifier's answer turns; where the guarantee lives does.*
- 18 November, "Built on top, as a test", his words: "Yes, agreement is now closer to language than protocol. It.s all about what is built on top." The line: "a rule that settles how people should behave in a deal belongs to the cMIPs built on top, not to the grammar". The lean he answered said "as he had ruled on the receiver, the delegation and earned rights". Also 17 November, "What the core is for": "it forces the protocol into a corner".
- 26 November: G10.6(a) comes back as a grammar rule, read by the MOR lead as "a guarantee no cMIP may break". His words: "Protect the unknown parties."
- **Plain words:** the test was given with earned rights as one of its three examples of a rule that belongs to cMIPs. Earned rights are now back in the grammar, and the ledger marks the earlier entry as replaced but not the test. If the guarantee is about who is bound (the grammar's own question), the test stands. If it is about how a seller may behave, it cannot stand beside the test. [TRACED; INFERRED readings]

**C11. Of MOR, or of Agreements.** *No verifier's answer turns.*
- Exchange 6, the line: "'Protect the unknown party' is a principle of MOR."
- Exchange 7, his words: "It's an agreements principle".
- **Plain words:** a principle of MOR would bind every layer; one of Agreements binds only Agreements. The second narrows the first, and the ledger does not mark it. [TRACED]

**The brief's sorts.** Its rows G5.7, G10.5, G10.6, G10.6(a), G10.7, G11.7 and G12.5, its two-way reading 11 and its "Decided, not yet worded" item 10 rest on "Earned rights leave the grammar", which the ledger now marks replaced. They are not counted above as conflicts between decisions: the brief is a record of work written before the replacement. They are listed here for the joining session. [TRACED]

---

## Answers found two ways

- Exchange 6: "It is worth turning it into a principle". Does "it" mean the place answer, or exchange 5's "Protect the unknown parties"?
- Exchanges 6 and 7: "unknown party". Unknown by the bytes (a role), or by the fact (identity unknown at creation)? And at the root, or at the version the party joined under?
- Exchange 7: "It's an agreements principle". In the companion, or in the Agreements text itself?
- Exchange 8: "hold" and "drop". Before accepting (rule 24), or after (rules 19, 28, 30)?
- Exchange 9: "used at different moments". Does a mention, or the act format's `prev`, count as a knot in Agreements' readings of order?
- Exchange 10: "Knots making is core core business, a". Agreements' grammar, as the ledger reads it, or a pointer to a lower layer?

## The check by a fresh reader

Before the push, the "In plain words" section and three conflicts drawn at random by `shuf` (C1, C5 and C8) went to a subagent that had seen neither the ledger nor the prompt. It was asked of each: "what are the two texts, and why can they not both stand?"

**What it found, and what was changed.**
- *C1.* It could follow the conflict. It said the entry did not show that Ana is a buyer and a filler of a role, and that "not shown" was undefined. Fixed: C1 now quotes the definition "Buyer" and says what "not shown" means.
- *C5.* It named both texts, and said the conflict holds only if the reader's answer may say "in force at N", which neither text says. That is so. C5 is now marked "read one way only", and it says the exchange does not settle what that answer may say. "Place", "anchoring" and "such a place" are now explained.
- *C8.* It could not see the conflict, because the principle was given only by its title, and "the baker" was not introduced. Fixed: C8 now quotes what the principle protects against, in his words, and says who the baker is. It is marked "read the wide way only". The fresh reader also said that no verifier's answer turns on C8, which the entry already said.
- *Summary lines 1, 2 and 5.* It said G5.1(c) was not quoted, "the general test" was not given, and "knot" was undefined. Fixed: line 1 cites G4.8(a) and G5.1(c), line 2 quotes the test and says what the grammar and cMIPs are, and line 5 says what a knot is.

**What could not be fixed.** Summary lines 3, 4 and 6 claim no conflict, only a gap or an agreement, and the fresh reader said so. In six lines they cannot quote Identity rules 19, 24, 28 and 30, or Envelopes 12. The quotations are in the sections on exchanges 8 and 11 and in C6. The fresh reader did not see those sections. C1 itself still rests on the reading that Ana's assent to version 2 is "an assent to the original" in G4.8(a), "the original" being the version an update would replace (draft 25, definition "Version"). [The fresh reader's answer was not kept as a file; this is its substance]

# The check before draft 26: the seventeen answers of 26 November, joined

*A record of work by the scribe's session K4, 26 November 2026, the last of the four sessions of the check. It joins the three parts written by sessions K1, K2 and K3 into one file. It changes no text, code or vector, proposes no remedy and no wording for draft 26, and decides nothing. Where an answer can be read two ways, both are given and neither is chosen. Everything not in quotation marks is this session's wording, or, where it says so, a part's.*

**The wish** (Nobody, allegedly, 20 November, at the top of `docs/decisions.md` on main): "Current wish: extract data, knowledge and understanding from the simulation run"

On the order (20 November, 22:58): "Yes, all the work carries. But first the findings and the problems then the changes, the review and the verifications."

On this wave (26 November, 16:37): "Yes, with attacks but using Fable 5.1, not 5.2"

On earlier answers (26 November, 16:03): "Yes, but me saying something does not mean that something was necessarily a good idea"

## In plain words

1. On 26 November Nobody, allegedly ("he" below), answered seventeen questions put by the MOR lead (the "exchanges"). They would change draft 25 (the unmerged rewrite of the Agreements rules) like this. A buyer gets no say in later changes and keeps what she bought. A change counts on one yes, from the old version's rule for changes. Two rival changes are a "race". The words of a deal become a separate text message. Agreements gets one way to name a set of acts. A deal that names no shared clock cannot have a deadline.
2. Hardest conflict: under draft 25's default rule every buyer must sign every later change, but his words say she "has no say in the updating of it, only the known parties can."
3. Next: one answer says a change counts at once, on the yes of the old version's rule for changes; another, given earlier the same afternoon, says it counts only once the signers have confirmed it by a later act.
4. Next: draft 25 keeps two rival changes as a "fork", and a later act can pick one; two answers make both fail as a "race", so whoever wants the change must sign it again. Draft 25 says "valid" of each proposed change; an answer makes "valid" mean the one version in force.
5. Draft 25 lets each reader judge a deadline by a clock of their own choosing; his words say a deal with no stated clock or record "cannot build a temporal condition".
6. Which acts can prove that one act came after another is pulled three ways: one answer counts fewer kinds of act than draft 25 does; two others would count more (an act merely mentioned in a text message; a single name for a set of acts).
7. Three earlier sessions each checked a share of the answers (the "parts"). They found 42 conflicts; joined, they are 36 here (6 were found twice). On 13 a verifier's answer would change depending on which text stands, on 15 more by one of two readings. The table in section 3 holds 77 rules and passages of draft 25 (COUNTED).

**Words used below** (this session's short glosses; draft 25's section 2 holds the full ones). *Verifier*: software that checks acts against the rules. *Terms*: a signed act saying what is agreed; an *update* is a new version of them. *Update condition*: the module, or by default "everyone who signed the original signs", that says whether an update may replace a version; its yes is "valid". *cMIP*: an add-on module that Terms name to answer one question. *Spot*, *role*, *filling*: a place in Terms for someone unknown when they were signed (a buyer), and her taking it; she is then a *filler*. *Pin*: from 18 November, the order of the signatures fixed, by a named place or by each needed signer acting once more. *Fork*: two rival next acts of one line; each is a *tip*. *Race*: from 18 November, two changes nothing orders; both fail and the earlier state stays. *Knot*: one act naming another by its fingerprint, which shows it came after. *Place*, *clock*, *anchor*, *anchoring*: a shared record or clock that says what came first or what time it was. *O, F, L* (draft 25, G4.7): O a version already replaced, F the update that replaced it, L a later update that still names O. *The ledger*: `docs/decisions.md` on main. *The brief*: `docs/agreements-from-scratch/draft-26-brief.md` on `claude/draft-26-brief-ucdzo3` (pull request 206). *The MICS*: the shared rules of all of MOR's layers. *Reader*: whoever reads acts, a verifier among them. *Home*: a server that stores an identity's acts and signs receipts for them; *rotation*: a key change, in the Identity layer. *Encoding 2*: the byte rules beside draft 25. *Line* (of an exchange): its "Arrived at (to check)" line, the MOR lead's reading of his words. *Lean*: what the MOR lead proposed before he answered. *TRACED*, *COUNTED*, *INFERRED*: see the next section.

## How to read this file

- **TRACED**: to a rule or a ledger line, cited. **COUNTED**: by a script, named. **INFERRED**: a reading. Each conflict below carries the mark its part gave it; where this session adds one, it says so.
- **The exchanges are numbered 1 to 17 in the ledger's order**, from "A late version 3 is rejected" to "Wave two: check, then attack, then draft 26". Part 1 names two exchanges outside its share by other numbers: its "exchange 11" is exchange 12 here ("Valid means in force: one gate for an update") and its "exchange 13" is exchange 14 here ("'Before the close' was the simulation's"). Parts 2 and 3 use the numbers used here (TRACED, the ledger's headings; part 1, "How to read this file").
- **Part 1** (exchanges 1 to 5), **part 2** (6 to 11) and **part 3** (12 to 17) are linked at the end. Each conflict here names the part, and the part's own label (part 1's C1 to C20, part 2's C1 to C11, part 3's 12-A to 14-D), so the detail can be found.
- His words are quoted exactly, typos and curly quote marks as the ledger has them. "Arrived at" lines are the MOR lead's reading, marked "to check".

---

## 1. The conflicts, merged, hardest first

Hardest: a verifier's answer would turn on it. They are given in three groups: (A) a verifier's answer turns on it as the texts read; (B) it turns on one of two readings, both given; (C) no verifier's answer turns on it. The order within each group is this session's (INFERRED).

### A. A verifier's answer turns on it

**M1. A buyer's say in later changes.** Found by part 1 (C1) and part 2 (C1).

> Exchange 5, his words: "Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can."

> Draft 25, G4.8(a): "**Everyone who signed the original** is: each party in whose name an assent to the original counts (a party named as a signer; a signer who fills a role; ...)". G4.11(e): "Where Terms name no update condition, an update is valid when everyone who signed the original signs it." 13 November, "The default update condition", his words: "Everyone who signed the original is the default condition yes" (quoted by part 2).

In plain words: draft 25 counts a buyer who filled a role among those whose signature every default update needs, so each buyer holds a veto. His words give her no say at all. For a default update signed by the known parties and not by the buyers, a verifier answers "not shown" by draft 25, and "valid" by his words. TRACED (both parts). Part 2 adds that this rests on reading Ana's assent to version 2 as "an assent to the original", the original being the version an update would replace.

**M2. One yes, or a confirming step after it.** Found by part 1 (C2) and part 3 (12-A).

> Exchange 12, line: "for an update there is one gate: where the update condition of the version it replaces answers valid, it is the version in force; no other assent is asked." "The two gates" (17 November), line: "Where the update condition answers valid, the update replaces the version it names."

> Exchange 1, the MOR lead's reading, answered "Probably right": "version 2 is in force only once pinned, so a version 3 naming version 1 after that is rejected". "In force once pinned" (18 November), line: "Terms are in force only once the order of the signatures that put them in force is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion, citing it. Until then they are "not yet in force"."

In plain words: the first says an approved update is the version in force at once; the second says it waits, "not yet in force", until each needed signer acts again. For an approved version 2 that no one has yet confirmed, by the first version 2 stands, and by the second version 1 still stands. Part 3 gives two readings: (i) a pin is not an assent, so "no other assent is asked" leaves it standing; (ii) "with no separate step" (the MOR lead's reading in exchange 12) removes it for updates. Part 1 adds that in the round's one-signer lines the act that would pin version 2 is version 3 itself, so the round's own case comes out differently by each text (INFERRED). TRACED for the texts.

**M3. A race, or a fork to settle.** Found by part 1 (C3) and part 3 (12-B).

> Exchange 12, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays." Exchange 1, line: "Where the replacing version was never pinned, it is a race: the change fails and the earlier version stays." "What a race stops" (18 November), line: "A verifier answers "not shown" for what would have changed. Whoever wants the change makes it again, in an order that can be told."

> Draft 25, G4.7(e): "A verifier MUST answer **fork** for which Terms replace them, show both tips, and MUST NOT choose between them"; G12.3: a fork "is resolved by an update of the shared act ... which names one of them in `continues`"; also G12.4 (a power to resolve) and G12.7 (rival resolving updates).

In plain words: both keep the old version in force. Under draft 25 the two updates wait as tips, answered "fork", and a later act can pick one, which then becomes the version. Under the race both fail, answered "not shown"; nothing waits to be picked, and whoever wants the change signs it again. If two approved updates are a race, G12.3, G12.4 and G12.7 have no fork of Terms left to settle; if they are a fork, they are not a race. TRACED. The brief left the answer word to the MOR lead ("Decided, not yet worded", item 7).

**M4. A late version 3: rejected, or a race.** Found by part 1 (C4, two readings) and part 3 (12-D).

> Exchange 1, line: "a version 3 that names a version already replaced is rejected once the replacing version is in force."

> Exchange 12, line: "Two updates answered valid against one version are a race: neither replaces it, and it stays." Draft 25, G4.11(a): the condition is asked of "the version its `replaces` names" even "for an update of a version already replaced".

In plain words: in exchange 1's case, version 2 and version 3 each name version 1, and version 1's rule for changes says yes to each. By its letter, exchange 12 makes them a race in which version 1 stays; exchange 1 has version 2 stand and version 3 rejected. Both stand only if "race" means two updates nothing orders, exchange 1's case being ordered (by version 2's pin, or by knots). The line does not say so. TRACED for the lines; the reading that joins them INFERRED (both parts).

**M5. "Valid" said of the version in force, or of each proposed update.** Found by part 3 (12-C).

> Exchange 12, his words: "The core should only see one version as valid"; "Yes, I always assumed in force to be human speech, and valid to be its translation for the verifier to be honest". Line: ""In force" is the human word; "valid" is its translation for the verifier."

> Draft 25, section 2: "**Valid**, **not valid**: said of a proposed update, and of nothing else in this text"; G4.11: "Asked of a proposed update, that is **valid** or **not valid**, as that cMIP answers."

In plain words: in draft 25, "valid" is the rule for changes saying yes to a proposal, and two proposals can each get that yes; "in force" is said of one version only. If "valid" means "in force", a race would have two versions in force, which "only one version as valid" and "neither replaces it" both deny. One word cannot be both. The answer word a verifier gives turns on it. TRACED; the reading INFERRED (part 3).

**M6. A deadline where the deal names no clock: none at all, or each reader's own.** Found by part 3 (14-A).

> Exchange 14, his words: "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition"

> Draft 25, G8.2: "What time it was is answered per the clock the agreement names (G7.4); where it names none, only per an anchoring the reader accepts, with it named (G13.4)." Also G4.11(c) and G10.5. "When "now" is read" (12 November), line: "for "nothing later" and for time, each accepts the anchoring it is willing to accept". "Whose anchoring wins" (13 November), line: "a reader's own anchoring applies only where the agreement names none."

In plain words: draft 25 and two earlier lines let a deal that names no shared record or clock still say "open until June": each reader answers it by the clock that reader accepts. His words say such a deal cannot have that condition at all. A verifier of draft 25 answers the date per the reader's clock; under exchange 14 it gives no such answer. Both stand only if the reader's own anchoring serves order ("nothing later") and never time (INFERRED, one reading). TRACED (part 3).

**M7. Which missing act can leave lateness unchecked: the line's short list, or draft 25's long one.** Found by part 1 (C5).

> Exchange 1, line: "Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked; any other missing act does not."

> Draft 25, G4.7(a): "The knots are the namings G13.1 reads: every field that holds a fingerprint, of every act the verifier holds, Terms or Statement, of this agreement or another, and a report's naming of its call and the acts it relied on (G11.3)."

In plain words: draft 25 lets any act, of this agreement or another, or a report, show that L came late; the line's bracket names only acts in a signer's own line and an anchoring. A missing act of another agreement, or a missing report, leaves lateness "unchecked" by draft 25 and, by the bracket's letter, not by the line. TRACED. His words ("Version 3 is the one the network needs to reject"; "Probably right.") do not name the bracket (section 4 below).

**M8. The words of Terms, now a Text act: can a missing one show order?** Found by part 3 (13-A).

> Exchange 1, the MOR lead's reading, answered "Probably right": "a missing act that cannot carry a knot (the work itself) never stops the rejection".

> Exchange 13, line: "the words of Terms are an act of the Text layer". Text draft 11, rule 14: a text act carries "the everyday fields (`prev`, position and running summary, Envelopes rule 13)" and "optionally `refs` (the acts or web resources it responds to or mentions)".

In plain words: exchange 1's rule lets a verifier ignore a missing piece that cannot show order, and its example is the loose words. Once the words are a Text act, they sit in their writer's own line and may name other acts, so a missing words act may be able to show order. Both stand only if "a signer's own line" means the Agreements line of G6, not the act format's line. Whether a verifier lacking the words answers "unchecked" for lateness turns on it. TRACED for the texts; the two readings INFERRED (part 3).

**M9. A mention as a knot, against draft 25's closed list.** Found by part 2 (C4; part 2 gives two readings).

> Exchange 9, his words: "A mention is a knot a different kid of knot. Isn’t it" and "Yes, knots of different kids, on different layers, used at different moments if needed"

> Draft 25, G4.7(a), as in M7, and G13.1: "An act is read against the versions and acts it names, in any field that holds a fingerprint (`terms`, `under`, `replaces`, `previous`, `answers`, `resolves`, `relies_on`, `settlement`)."

In plain words: if a mention in a text act (or the act format's `prev`, asked by pull request 229, Q4) is a knot for lateness, a chain of namings through it can show L late where draft 25's list shows a fork. Read "used at different moments" as keeping mentions out of Agreements' readings of order, and nothing changes. Read "a knot" as counting wherever order is asked, and the closed list cannot stand. TRACED texts; INFERRED readings (part 2). M7 narrows the list and M9 would widen it.

**M10. A name for a set of acts, against "named by fingerprint".** Found by part 2 (C9).

> Exchange 10, line: "Agreements' grammar gets one byte form for naming a set of acts, a value like a fingerprint"; his words: "Knots making is core core business, a"

> Draft 25, section 2, "Fingerprint": "the identifier the core gives to fixed bytes. "Named by fingerprint" means referred to by that identifier and nothing else." G2.2: "An entry of `relies_on` that is not a fingerprint is not read". G13.1 and G4.7(a): knots are fields that hold a fingerprint.

In plain words: a set's value is "like a fingerprint" but is not one the core gives. If it is a fingerprint, the definition changes. If it is not, Terms that rely on a set leave it unread (G2.2), and it is no knot, though his words call knot making "core core business". Whether such evidence is read, and whether an act is late by knots through a set, turn on it. TRACED (part 2).

**M11. Going on without a role's module.** Found by part 1 (C8).

> Exchange 3, line: "where a reader lacks a cMIP the answer is only "unchecked"."

> Draft 25, G4.8(a): "Where the verifier lacks the cMIP of a role of the original (K5), who fills that role is not known: whether everyone who signed the original has signed an update is then **unchecked** only where the verifier holds an assent to the original by someone the original does not name as a signer, who might fill that role (G9). Where it holds no such assent, no one who fills a role is shown to have signed the original, and none is asked."

In plain words: draft 25 lets a verifier without the module that says who fills a spot still answer whether an update has everyone's signatures, by asking no one who fills a role, so it can answer the update valid (INFERRED); the line says a reader without the module says only "unchecked". TRACED (part 1).

**M12. "Unchecked" where nothing is lacking.** Found by part 1 (C10; two readings).

> Exchange 4, line: ""Unchecked" is kept for a reader that lacks something."

> Draft 25, G9.2: "Where forks, and powers to resolve them, lean on one another so that a verifier's reading of a set of acts does not settle, every answer that rests on a fork in that set is **unchecked**"; G7.2 and G13.4: two answers of a place or an anchoring that contradict each other give **unchecked**.

In plain words: draft 25 says "unchecked" where the verifier lacks nothing: a reading that does not settle, or two answers that contradict each other. The line keeps "unchecked" for a reader that lacks something. Reading (i): "lacks something" includes lacking one settled answer, and there is no conflict. Reading (ii): by its letter, those cases need another word. TRACED texts; INFERRED readings (part 1). His words do not say it (section 4).

**M13. "Not shown" where no act could change the answer.** Found by part 3 (14-B) and part 1 (C18). The two parts judge its weight differently.

> Exchange 14, the MOR lead's reading, to check: "a verifier answers such a condition "not shown", with that reason." Exchange 4, the MOR lead's lean, which he answered "Agreed": "not shown", "since the verifier lacks nothing and can see there is no fork".

> Draft 25, section 2: "**not shown**: the acts held do not establish it; an act not held might"; G13.4 gives **unchecked** for an anchoring with no answer; G4.11(c): "per the anchoring named or as shown".

In plain words: draft 25 keeps "not shown" for an answer that an act not yet held might change. A deadline in a deal with no anchor, and a resolve where the verifier "can see there is no fork", are cases no act could change, so "not shown" stretches the word. Part 3: the answer word turns on it, for the deadline. Part 1: for the resolve, "not shown" can still fit (an unseen tip might make a fork), and no verifier's answer turns on it. TRACED; the readings are each part's.

### B. A verifier's answer turns on one of two readings

**M14. Bound by an update she did not sign.** Found by part 2 (C2).

> Exchange 5, his words: "Let”s look at a service… it would protect her from terms being changed on her." The MOR lead's words he answered "Yes, and the what she bought ...": "version 3 binds her only by her signature, or by a power version 2 gave".

> Draft 25, G5.1(c): bound where "the act is a Terms act that replaces Terms by which they are bound, and the update condition of those Terms answers valid for it"; G5.2: "with no assent of theirs, under G5.1(c)"; G10.7: "whether the holder is still a party in the spot (G10.3), and whatever else follows, are as that update and the version the filling was earned under state".

In plain words: draft 25 protects only her rights (G10.6) and still binds her to whatever else a valid update says, even that she is out of her spot. Read as protecting her rights only, both stand. Read as protecting her from any change, they cannot. Whether she is bound by version 3 turns on it. TRACED texts; INFERRED readings (part 2).

**M15. Two versions at once.** Found by part 2 (C3).

> Exchange 5, his words: "If it was year, version 2 is valid a year."

> Draft 25, G4.3: "An assent binds its signer only while the Terms it names are in force." G4.5: "Terms stop being in force when Terms that replace them ... are in force." Exchange 12, his words: "The core should only see one version as valid"

In plain words: draft 25 and his later words allow one version at a time; once replaced, version 2 no longer binds through her assent. "version 2 is valid a year" keeps it binding beside version 3. Read "valid" as the plain word for "her rights from version 2 last a year" and both stand; read it as "version 2 is still in force for her" and they cannot. TRACED texts; INFERRED readings (part 2).

**M16. A deal that ends by itself.** Found by part 1 (C6, two readings). Part 2 reaches the same texts and marks G4.11(f) UNSAID, not CONFLICTS (see the table and "Rows to check").

> Exchange 5, line: "A deal that ends by itself (a month's plan, a licence ending at a creator's statement) says so in its own version's words; that is not an update and (a) does not stop it."

> Draft 25, section 7: "Nothing stops by itself: rights meant to stop on a date stop, as these grammar rules read them, only when someone makes the update"; G10.7: no answer "that a filling's rights **no longer apply**, and a verifier MUST NOT give either"; the ledger, "The update condition" (draft 16), line: "Nothing changes by itself".

In plain words: draft 25 says a month's plan does not end until someone makes an update, and forbids a verifier to say it ended; the line says it ends by its own words, with no update. Reading (i): the month is a condition inside the rights, read by the body's module, the grammar never says "ended", and only section 7's sentence conflicts. Reading (ii): a verifier may now answer that such rights have ended, against G10.7. TRACED; INFERRED readings (part 1).

**M17. "A month" in a deal that names no clock.** Found by part 1 (C7) and part 3 (14-D).

> Exchange 5, his words: "If she bought for a month of service to an LLM for example, the deal is valid a month."

> Exchange 14, his words: "an agreement with no stated anchor cannot build a temporal condition"

In plain words: a month is a condition in time. For an offer that states a place or a clock, both stand. For one that states neither (263 of 269 Terms in the round, the research's count, pull request 232, quoted by part 3), the buyer's month cannot be built. Both stand only if "a month" is read as the words' and their module's, outside the grammar's conditions in time. INFERRED (both parts).

**M18. The clock as an anchor a deal can state.** Found by part 3 (14-C).

> Exchange 14, line: "an agreement that states no anchor (no place, no clock)".

> "The place is a pointer" (17 November), the MOR lead's lean he agreed to: "the rest of G7 (a place contradicting itself, which answers count per place, the clock, how a relay orders) is the relay's or a cMIP's". The brief, two-way reading 3: "(i) The field `clock` and "per clock" leave the grammar with the rest of G7 … (ii) Only G7.4's sentence leaves, and the clock stays a thing Terms may name."

In plain words: exchange 14 counts a clock among the anchors a deal can state. If the clock left the grammar on 17 November (reading (i)), a deal that names a clock and no place has no stated anchor. Both stand only on reading (ii). TRACED; INFERRED the joining (part 3).

**M19. The first version's assents.** Found by part 3 (12-E).

> Exchange 12, line: "The first version comes into force by the assents of its named parties."

> Draft 25, G4.1: "Terms are in force when the assents their `in_force` rule requires are present. If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer; Terms that name no party as a signer, and carry no `in_force`, are in force at once." G4.4: "A party named as an agreement is not counted by the default of G4.1."

In plain words: the line can be G4.1 said short (the MOR lead cited "(G4.1)"), or it can mean every named party's assent, which an offer whose `in_force` asks only its maker, or a party named as an agreement, would not meet. An offer's first version turns on which. TRACED; INFERRED readings (part 3).

**M20. A reader's chosen place, and the pin.** Found by part 2 (C5; read one way only).

> Exchange 6, line: "a place named only by a rule the parties never signed does not order their Terms. A verifier may give an answer per such a place only as the reader's choice, named so."

> "In force once pinned" (18 November), line, as in M2: in force "only once the order of the signatures that put them in force is pinned: a named place shows it, or each signer whose signature was needed has acted after the completion".

In plain words: a reader's chosen place is neither a place the Terms name nor a signer's own act. If the reader's answer may say "in force at N", it puts in force Terms no pin has pinned. If it may say only where acts stand, both stand. Neither text says what that answer may say. TRACED texts; INFERRED readings (part 2).

**M21. Repeats dropped, or rejected.** Found by part 2 (C10).

> Exchange 10, the MOR lead's recipe, answered "a": "the ids as raw bytes, sorted, repeats dropped, joined, hashed with a label for a set of acts".

> Encoding 2, E18: "Sets are sorted ... Duplicates are rejected."

In plain words: for the same list with a repeat, one gives a value and the other rejects the act. Both stand only if the set form is never written as a list in a field. TRACED texts; INFERRED the condition (part 2).

**M22. "In their own name", against a power she gave.** Found by part 1 (C11).

> Exchange 5, line: "No later version changes the rights of a filling already earned except by an assent its holder signs in their own name."

> "A power given binds its giver" (18 November), line: "Whoever grants a power through a cMIP is bound by what is done under it, as if by her own signature".

In plain words: if an agent she empowered assents, for her, to version 3, the 18 November line counts it as her signature and the 26 November line, by its letter, does not. Reading (i): "in their own name" excludes acts under a power. Reading (ii): it means "by her, or for her under a power she gave", and the two agree. TRACED texts (part 1).

**M23. A home that holds a key change and drops it.** Found by part 2 (C6). This one is at the Identity layer. The case is a thief who has stolen an owner's keys and makes a valid key change (a rotation) to take the identity; the lean was that a home might wait N blocks (INFERRED: blocks of a shared chain, used as a clock) before accepting it, and drop it if the current key objects.

> Exchange 8, the MOR lead's lean, to which he answered "I don’t feel it’s a feature worth messing the core for": "a home may hold a rotation N blocks and drop it on the current key's objection".

> Identity draft 16, rule 19: "A home MUST NOT drop a valid rotation it has accepted". Rule 28: "a home that holds a valid rotation cannot withhold its receipt without breaking rule 20." Rule 30: "The first valid rotation a home holds wins at that home".

In plain words: if "hold" means not yet accepted, which Identity's rule 24 allows ("before accepting"), the lean stands beside Identity. If it means held and stored, the home breaks rules 19, 20 and 28, and by rule 30 the thief's key change wins at that home anyway. His answer can itself be read two ways: as declining only a change to the core (the lean stands, above it), or as declining the feature. TRACED texts; INFERRED readings (part 2; the reading of his answer this session's).

**M24. The MICS gives another way to the result.** Found by part 1 (C9).

> Exchange 3, line: "A reader without it should find a closed door ("unchecked"), not another way to the result."

> MICS v37, "Collectives": "**A collective whose control model's cMIP a verifier does not hold is judged under the constitutional rule alone for its way out**".

In plain words: the MICS lets a verifier without the module still judge a collective's way out by another rule; the line says the door is closed. TRACED. The MICS v37 names Agreements draft 24, which draft 25 rewrites; whether the sentence outlives draft 25 is unsaid (part 1).

**M25. "Only unchecked", against "invalid beats unknown".** Found by part 1 (C20).

> Exchange 3, line: "where a reader lacks a cMIP the answer is only "unchecked"."

> MICS v37, encoding: "**Invalid beats unknown** (Envelopes rule 30)."

In plain words: reading (i): "only" is set against a hand reading, not against "invalid", and there is no conflict. Reading (ii): by its letter, a reader lacking a module says only "unchecked", even where another rule shows the act invalid. The words also differ: "unchecked" in draft 25, "unknown" in the MICS, where the rule is to move. INFERRED (part 1).

**M26. A named-signers default already in the grammar.** Found by part 1 (C16).

> Exchange 2, line: "named signers and buyer by assent stay cMIPs, not grammar defaults."

> Draft 25, G4.1: "If `in_force` is absent, they are in force when there is an assent to them in the name of every party named as a signer".

In plain words: reading (i): the question was about Terms with a role, where G4.2 forces an `in_force` module, and both agree. Reading (ii): by its letter, the line says named signers is not a grammar default, and G4.1 is one, for Terms with no role. INFERRED (part 1).

**M27. The definition of a buyer.** Found by part 1 (C17).

> Draft 25, section 2, "Buyer": "A buyer signs by an assent to the version they buy under, as anyone fills a spot and is bound by their own assent (G10.3, G5.1(a))."

> Exchange 2, line: "named signers and buyer by assent stay cMIPs, not grammar defaults."

In plain words: reading (i): the definition says how a buyer is bound, and who fills the spot stays the module's; no conflict. Reading (ii): "as anyone fills a spot" reads as the grammar saying an assent fills a spot, which is what buyer by assent does as a module. INFERRED (part 1).

**M28. A reserved right to change, allowed on 13 November, shut on 26.** Found by part 1 (C12).

> "Which version a discharge divides by" (13 November), his words: "Then, dynamic conditions (we reserve the right to…) can only work if the signed deal stated so. Only a signed condition can update the agreement on one end"

> Exchange 5, his words: "Yes, it was a bad idea. It’s the “let me drown you in terms updatable unilaterally” nightmare we already live under"; line: "An update condition cannot reach what an unknown party bought. A deal meant to change says so in its own words, and is bought as such."

In plain words: reading (i): "we reserve the right to…" written in version 2's own words is such a deal, and the two agree. Reading (ii): a reserved right to change one side's terms is the "nightmare", and 26 November reverses 13 November. INFERRED (part 1). His words of 16:03 bear on it: "Yes, but me saying something does not mean that something was necessarily a good idea".

### C. No verifier's answer turns on it

**M29. Earned rights back in the grammar, against "Built on top, as a test".** Found by part 2 (C7).

> "Built on top, as a test" (18 November), line: "a rule that settles how people should behave in a deal belongs to the cMIPs built on top, not to the grammar". The lean he answered "Yes, agreement is now closer to language than protocol. It.s all about what is built on top." said "as he had ruled on the receiver, the delegation and earned rights".

> Exchange 5, line: "G10.6 comes back with (a) only: nothing changes what a filling earned except an assent its holder signs in their own name."

In plain words: the test was given with earned rights as one of its three examples of a rule that belongs to modules. Earned rights are back in the grammar; the ledger marks the earned-rights entry as replaced, not the test. If the rule is about who is bound (the grammar's question), the test stands; if it is about how a seller may behave, it cannot stand beside the test. TRACED; INFERRED readings (part 2). Where the guarantee lives turns on it.

**M30. The later buyer of the baker's rights.** Found by part 2 (C8; read the wide way only). The baker is whoever sealed a finished work; her rights to it can be sold.

> "A sale is not a race" (18 November), line: "Terms made with the holder at the act they cite keep standing after a sale ... The buyer of the rights carries that risk".

> Exchanges 6 and 7: "Protect the unknown party", which in exchange 5's words "would protect her from terms being changed on her".

In plain words: the buyer of the baker's rights was unknown when the earlier holder made those Terms. If "unknown party" means anyone unknown at creation, the principle protects him, while 18 November puts the risk on him. If it means a filler of a role, there is no conflict. INFERRED the wide reading (part 2).

**M31. A principle of MOR, or of Agreements.** Found by part 2 (C11, and in its exchange 6, item 3).

> Exchange 6, line: ""Protect the unknown party" is a principle of MOR."

> Exchange 7, his words: "It’s an agreements principle"

In plain words: a principle of MOR would bind every layer; one of Agreements binds only Agreements. The second narrows the first, about four minutes later, and the ledger does not mark it. TRACED (part 2).

**M32. A warning on a text that holds rules only.** Found by part 1 (C15).

> Exchange 1, his words: "Probably right. This version of agreements is not to be used bare. Big warning needs to be placed on it."

> "Only rules in the hashed text" (17 November), his words: "Yes, the text should be just that. Everything else goes into companion documents for the few who might be interested."

In plain words: reading (i): the warning goes in a companion, a README or a client, and the two agree. Reading (ii): the warning is put on the hashed text of Agreements itself, which by the earlier words holds rules only. INFERRED (part 1).

**M33. A client's choice, and a closed door, in his own words.** Found by part 1 (C19).

> Exchange 3, his words: "If the client dev wishes to accept other methods instead of just supporting the cMIP, that’s their choice."

> Exchange 3, his words (15:46): "What they should find is a closed door."

In plain words: reading (i): the core's door is closed, and a client may still open its own, as the first line says. Reading (ii): the later words narrow the earlier ones: no other way to the result should be found, by the core or by a client. INFERRED (part 1). What a client shows turns on it, not a verifier's answer.

**M34. A client's choice, against Development 12.** Found by part 1 (C14).

> Exchange 3, line: "Whether a client accepts other methods, in place of supporting the cMIP, is the client developer's choice."

> Development draft 12, part one: "A client adopts a specification by the user's choice, and shows acts under any other as unknown."

In plain words: reading (i): acts "under" a specification are acts whose type it defines; a Terms act naming a module is under Agreements, and the client is free. Reading (ii): an answer resting on a module the client has not adopted is "unknown" to it, so a client that accepts another method breaks Development's rule. INFERRED (part 1).

**M35. The brief's rows on earned rights are overtaken.** Found by part 1 (C13) and part 2 ("The brief's sorts", not counted there as a conflict).

> The brief: "G10.6 | **GOES.** Whoever fills a spot is bound by the Terms' update condition like any signer." Its rows G10.5, G10.6(a), G10.6(b), G10.7 and G12.5 (part 1), and G5.7 and G11.7 (part 2), its two-way reading 11 and its "Decided, not yet worded" item 10 rest on it.

> Exchange 5, line: "this replaces "Earned rights leave the grammar" (18 November). G10.6 comes back with (a) only". The ledger marks the 18 November entry "*Replaced on 26 November*".

In plain words: the brief was written on 18 November, before the replacement, so its sorts of those rows no longer stand. A record of work against a decision, not two decisions. TRACED (both parts). Part 2 adds that the mark writes out only the part about rights, while the 18 November line's "Whoever fills a spot is bound by the Terms' update condition like any signer" reaches M1 and M14 too (INFERRED).

**M36. "Then draft 26", against "no redrafts, no recode".** Found by part 3 (exchange 17; listed there as not about a rule).

> Exchange 17, his words: "Yes, with attacks but using Fable 5.1, not 5.2"; line: "Draft 26 is written only after he has settled the conflicts."

> "The budget after the simulation" (16 November), his words: "Once that is over, we.ll focus the rest of the budget on reviewing, no redrafts, no recode."

In plain words: in the letter, draft 26 is a redraft. Reading (i): the budget rule was for that week, and his "Yes, all the work carries … then the changes" (20 November) and this "Yes" refine it. Reading (ii): it stands. TRACED; readings INFERRED (part 3). Not a rule of the protocol.

---

## 2. What the answers leave unsaid that draft 26 would need

One line each, merged from the parts; the part is named. The first two were asked of the check by the MOR lead's assignment.

1. **What replaces the in-force step for a first version's own fork.** In draft 25 two updates of version 1 are a fork only where "each has the assents its own `in_force` requires (G4.1)" (G4.7). The answers say two things about what takes that step's place: exchange 1, the pin ("version 2 is in force only once pinned"); exchange 12, nothing ("no other assent is asked"). So it is left two ways, not wholly unsaid. Unsaid in both: which act shows that F was pinned, for a lateness test by knots. Read the other way (version 1 itself coming into force), exchange 12's "by the assents of its named parties" names no pin, and whether the pin of 18 November stays for a first version is unsaid (part 1; part 3, 12-A and its item 1).
2. **How "Protect the unknown party" reads for a party known at creation who joins a role later.** Unknown by the bytes (anyone who joins through a role, as the exchange 5 line reads it), or by the fact (his "she is unknown at the time of creation of the agreement"; draft 25's "Buyer": "whose identity was not known")? Part 2 works three cases: Bob, known to the makers, fills a role; Carla, a named signer, also fills a role; Dan, added as a signer by version 3. Each comes out differently by each reading, and no verifier can tell which applies (G10.4: "whether it was is the authors' word"). Also unsaid: whether "unknown" is judged at the root or at the version the party joined under; whether a late-signing named signer, or an agreement named as a party, is "known" (parts 1 and 2).
3. The answer word for two updates of one version that nothing orders: "fork" or "not shown" (parts 1 and 3).
4. Whether a resolving update can still continue one of two raced versions (part 1).
5. Which change fails in exchange 1's race (it says "the change", singular): version 3 only, or version 2 too; and whether version 2, pinned later, then stands (part 1).
6. What "valid" names once it translates "in force"; what the rule for changes' yes is called if not "valid"; and what the MOR lead's ""valid" keeps its plain sense for acts" means (part 3).
7. What a replacing version's own `in_force` still does, and whether G4.2 ("MUST carry `in_force`") still binds a replacing version that names a role (part 3).
8. G4.8(a)'s original that no one signed: with no second gate, any Terms act naming it would be in force (part 3; draft 25 lists it as open, section 8.4).
9. Until when an assent to an update may be taken back (G4.10), once "in force" for an update is the rule for changes' yes (part 3).
10. Whether acts of another agreement, and reports, are among the acts "that could carry a knot" (exchange 1's bracket is the MOR lead's) (part 1).
11. Whether knots still show lateness where Terms name a place (the brief's open question 10) (part 1).
12. Where the "big warning" is written, and whether in the hashed text (part 1).
13. Whether the warning is the fact that a verifier holding no common module answers every offer's coming into force "unchecked" (G4.2 with G9.1), or another thing (part 1).
14. Whether a hand count published as a signed Statement is read as its signer's word (G8.1), or as nothing (part 1).
15. What "unchecked" a client shows for a module it chose not to support, beside a method it accepted (part 1).
16. Which answers are refusals that must state a reason; whether G9.1's "unchecked" must name what was lacking; the exact words of "nothing to resolve" (part 1).
17. An empty resolve that is itself a tip (G12.3): which answer comes first, "fork" for the line or "not shown" for the resolve (part 1).
18. Whether "no say" means a buyer's signature is never asked, or only that she cannot block (parts 1 and 2).
19. Whether the principle covers what an unknown party owes as well as what she bought (G5.1(c)) (part 2).
20. What a verifier shows of a buyer's filling once version 3 is in force, beside version 3 for everyone else, and who receives her later payments (part 1).
21. How a verifier tells the words of "a deal meant to change" from an update condition, given that the grammar does not read a version's words (part 1).
22. What becomes of K4's input "where a filling is asked about ... (G10.6)" and of section 7's two sentences once G10.6(b) goes (parts 1 and 2).
23. Whether a principle written in the companion binds a verifier or only explains the rules that apply it, and which rules apply it (part 2).
24. Whether a verifier answers "in force at position N" at all, even for the Terms' own place (part 2; pull request 229, Q6).
25. What an Agreements verifier answers for an act under a key that a waiting home holds back: draft 25 has no "pending" (part 2).
26. What "the current key's objection" is in bytes, given Identity's objections are a home's acts and "no new act" was said (part 2).
27. The kinds of knot, as a list (naming in Agreements fields, `acks`, `refs`, `prev`, a keeper's record), and whether a mention or `prev` counts in Agreements' readings of order (part 2).
28. Whether a knot through a private act, held without its key, counts (part 2).
29. For the set form: whether its value is a knot to each member; its tag, and whether it joins Identity's list of every tag; whether a set may be empty; whether members are act ids only; whether Identity, Money, relays or keepers use the same form (part 2).
30. Whether a relay's delivery receipt for a sealed container is an act of MOR, and whether Terms may rely on it (part 2).
31. Which field names the words act (`body`, or another), and whether that naming is a knot: G13.1's list does not include `body` (part 3).
32. What a verifier answers for Terms whose words act is private and held without its key: draft 25's "unchecked" or Text's "unknown" (part 3; the same two words as M25).
33. What Terms count for where the words act they name is invalid under Text (part 3).
34. Words that are not text (a scan, a drawing, a recording): Text's payload is a text string only (part 3).
35. "Comes first" and "published": by citing alone, or shown first by a place; for whom, where the words are private; a grammar rule or a client's duty (part 3).
36. Which reading wins where the Text act's own format module and the Terms' K1 socket read the same words differently (part 3).
37. Whether Text rule 6's showing "before signing terms" is of the words act, signed earlier, or of the Terms act that names it (part 3).
38. What a "stated" anchor is: a place, a clock, both; and whether a contest's or another rule's place counts (part 3).
39. Whether "temporal condition" covers order ("before the payment") or time only ("before 5 pm") (part 3).
40. What Terms that write a deadline and state no anchor count for: invalid, a condition never met, or "not shown" (part 3).
41. Whether the reader's own anchoring still answers "nothing later" where it no longer answers time (part 3).
42. Which of draft 25's sockets may still take a time: K2 (an `in_force` deadline), K4 (G4.11(c)), K5 (G10.5) (part 3).
43. Where the clients' duty to keep the two keys apart is written, if it is one (part 3).
44. Whether the MICS v37's sentence on collectives judged without their model's module outlives draft 25 (part 1).

---

## 3. The table: every rule of draft 25 any answer touches

One row per rule or passage, merged from the three parts' tables. "ex." is the exchange, numbered as in this file; "part" is the part that found it; "M" is the merged conflict above. Where two parts give one rule different kinds, both are shown and the row says **(parts differ)**. In nearly every such row the two parts read **different exchanges**, so the kinds can differ without the parts disagreeing; the rows where two parts give different kinds for the same underlying question are listed under "Rows to check". The detail of each row is in its part.

| rule | the answer(s), with the part that found it and the merged conflict | kind |
|---|---|---|
| def. Buyer | ex. 2 (part 1, M27); ex. 6, 7 (part 2) | part 1: CONFLICTS; part 2: UNSAID **(parts differ)** |
| def. Fingerprint | ex. 10 (part 2) | CONFLICTS |
| def. Name (cite) | ex. 9, 10 (part 2) | EXTENDS |
| def. Offer | ex. 6, 7 (part 2) | UNSAID |
| def. Party | ex. 6, 7 (part 2) | UNSAID |
| def. Verifier | ex. 10 (part 2) | UNSAID |
| §1 Purpose | ex. 6, 7 (part 2) | EXTENDS |
| §2 Answers | ex. 3, 4 (part 1, M13); ex. 8 (part 2) | part 1: AGREES / CONFLICTS; part 2: UNSAID **(parts differ)** |
| §3 field kinds | ex. 10 (part 2) | EXTENDS |
| G1.2 | ex. 6, 7 (part 2) | AGREES |
| G2.1 | ex. 10 (part 2, M10); ex. 13 (part 3) | part 2: CONFLICTS; part 3: AGREES **(parts differ)** |
| G2.2 | ex. 10 (part 2, M10); ex. 13 (part 3) | part 2: CONFLICTS; part 3: AGREES **(parts differ)** |
| G4.1 | ex. 1, 2 (part 1, M2, M26); ex. 6 (part 2, M20); ex. 12 (part 3, M2, M19) | part 1: EXTENDS / CONFLICTS; part 2: CONFLICTS; part 3: CONFLICTS **(parts differ)** |
| G4.2 | ex. 2 (part 1); ex. 12 (part 3) | part 1: AGREES; part 3: UNSAID **(parts differ)** |
| G4.3 | ex. 4 (part 1); ex. 6, 7 (part 2, M15) | part 1: AGREES; part 2: CONFLICTS **(parts differ)** |
| G4.5 | ex. 1 (part 1, M2); ex. 6, 7 (part 2, M15); ex. 12 (part 3) | part 1: CONFLICTS; part 2: CONFLICTS; part 3: REPLACES **(parts differ)** |
| G4.6 | ex. 6 (part 2); ex. 14 (part 3) | part 2: AGREES; part 3: UNSAID **(parts differ)** |
| G4.7 | ex. 1 (part 1, M3, M4); ex. 12 (part 3, M3) | CONFLICTS |
| G4.7(a) | ex. 1 (part 1, M2, M7); ex. 9, 10 (part 2, M9, M10); ex. 12 (part 3) | part 1: CONFLICTS; part 2: CONFLICTS; part 3: REPLACES **(parts differ)** |
| G4.7(b) | ex. 1 (part 1); ex. 12, 14 (part 3) | part 1: UNSAID; part 3: REPLACES; UNSAID **(parts differ)** |
| G4.7(c) | ex. 1 (part 1); ex. 13 (part 3, M8) | part 1: EXTENDS; part 3: CONFLICTS **(parts differ)** |
| G4.7(e) | ex. 1 (part 1, M3); ex. 12 (part 3, M3) | CONFLICTS |
| G4.8 | ex. 12 (part 3) | REPLACES |
| G4.8(a) | ex. 3, 5 (part 1, M1, M11); ex. 6, 7 (part 2, M1); ex. 12 (part 3) | part 1: CONFLICTS; part 2: CONFLICTS; part 3: UNSAID **(parts differ)** |
| G4.8(e) | ex. 1 (part 1) | AGREES |
| G4.9 | ex. 12 (part 3) | EXTENDS |
| G4.10 | ex. 9 (part 2); ex. 12, 14 (part 3) | part 2: UNSAID; part 3: UNSAID; AGREES **(parts differ)** |
| G4.11 | ex. 6, 7 (part 2); ex. 14 (part 3, M6) | part 2: AGREES; part 3: CONFLICTS **(parts differ)** |
| G4.11(c) | ex. 14 (part 3, M6, M13) | CONFLICTS |
| G4.11(d) | ex. 12 (part 3, M5) | CONFLICTS |
| G4.11(e) | ex. 5 (part 1, M1); ex. 6, 7 (part 2, M1); ex. 12 (part 3) | part 1: CONFLICTS; part 2: CONFLICTS; part 3: AGREES **(parts differ)** |
| G4.11(f) | ex. 5 (part 1, M16); ex. 6, 7 (part 2) | part 1: CONFLICTS; part 2: UNSAID **(parts differ)** |
| G4.11(h) | ex. 3 (part 1) | AGREES |
| G4.11(i) | ex. 5 (part 1) | UNSAID |
| G5.1(b) | ex. 7 (part 2) | AGREES |
| G5.1(c) | ex. 5 (part 1, M1); ex. 6, 7 (part 2, M14); ex. 12 (part 3) | part 1: UNSAID; part 2: CONFLICTS; part 3: AGREES **(parts differ)** |
| G5.2 | ex. 6, 7 (part 2, M14); ex. 12 (part 3) | part 2: CONFLICTS; part 3: AGREES **(parts differ)** |
| G5.4 | ex. 12, 14 (part 3) | REPLACES; UNSAID |
| G5.5 | ex. 13, 14 (part 3) | UNSAID |
| G5.7 | ex. 5 (part 1); ex. 6, 7 (part 2) | part 1: AGREES; part 2: CONFLICTS **(parts differ)** |
| G6.1 | ex. 8, 9 (part 2) | UNSAID |
| G7.2 | ex. 4 (part 1, M12); ex. 14 (part 3) | part 1: CONFLICTS; part 3: AGREES **(parts differ)** |
| G7.3 | ex. 6 (part 2) | AGREES |
| G7.4 | ex. 6 (part 2); ex. 14 (part 3, M18) | part 2: AGREES; part 3: CONFLICTS **(parts differ)** |
| G8.1 | ex. 3 (part 1) | UNSAID |
| G8.2 | ex. 14 (part 3, M6) | CONFLICTS |
| G9.1 | ex. 1, 3, 4 (part 1, M25); ex. 13 (part 3) | part 1: AGREES; part 3: UNSAID **(parts differ)** |
| G9.2 | ex. 4 (part 1, M12) | CONFLICTS |
| G10.2 | ex. 2 (part 1) | AGREES |
| G10.3 | ex. 2, 5 (part 1); ex. 6, 7 (part 2) | AGREES |
| G10.4 | ex. 6, 7 (part 2) | UNSAID |
| G10.5 | ex. 5 (part 1, M35); ex. 6, 7 (part 2); ex. 14 (part 3, M6) | part 1: REPLACES; part 2: CONFLICTS; part 3: CONFLICTS **(parts differ)** |
| G10.6 | ex. 5 (part 1, M35); ex. 6, 7 (part 2); ex. 14 (part 3, M17) | part 1: REPLACES; part 2: REPLACES; part 3: CONFLICTS **(parts differ)** |
| G10.6(a) | ex. 5 (part 1, M22); ex. 6, 7 (part 2) | part 1: REPLACES; part 2: AGREES **(parts differ)** |
| G10.6(b) | ex. 5 (part 1); ex. 6, 7 (part 2) | AGREES |
| G10.7 | ex. 5 (part 1, M16, M35); ex. 6, 7 (part 2, M14) | CONFLICTS |
| G11.2 | ex. 13 (part 3) | UNSAID |
| G11.3 | ex. 3 (part 1) | AGREES |
| G11.6(b) | ex. 6, 7 (part 2) | AGREES |
| G11.7 | ex. 2 (part 1); ex. 6, 7 (part 2) | AGREES |
| G11.8 | ex. 6, 7 (part 2) | AGREES |
| G12.1 | ex. 1 (part 1, M3); ex. 12 (part 3) | part 1: CONFLICTS; part 3: REPLACES **(parts differ)** |
| G12.2 | ex. 12 (part 3) | EXTENDS |
| G12.3 | ex. 1, 4 (part 1, M3); ex. 12 (part 3, M3) | part 1: AGREES / UNSAID; part 3: CONFLICTS **(parts differ)** |
| G12.4 | ex. 12 (part 3, M3) | CONFLICTS |
| G12.5 | ex. 5 (part 1, M35); ex. 6, 7 (part 2) | part 1: REPLACES; part 2: CONFLICTS **(parts differ)** |
| G12.7 | ex. 1 (part 1); ex. 12 (part 3, M3) | part 1: UNSAID; part 3: CONFLICTS **(parts differ)** |
| G13.1 | ex. 1 (part 1, M7); ex. 9, 10 (part 2, M9, M10); ex. 13 (part 3) | part 1: CONFLICTS; part 2: CONFLICTS; part 3: UNSAID **(parts differ)** |
| G13.2 | ex. 10 (part 2); ex. 13 (part 3) | part 2: UNSAID; part 3: AGREES **(parts differ)** |
| G13.3 | ex. 1 (part 1, M2); ex. 6, 9, 10 (part 2); ex. 12, 13 (part 3) | part 1: CONFLICTS; part 2: UNSAID; part 3: REPLACES; AGREES **(parts differ)** |
| G13.4 | ex. 4 (part 1, M12); ex. 6 (part 2); ex. 14 (part 3, M6) | part 1: CONFLICTS; part 2: AGREES; part 3: CONFLICTS **(parts differ)** |
| G14.2 | ex. 6, 7, 9 (part 2, M9, M30) | CONFLICTS |
| encoding 2, E18 | ex. 10 (part 2, M21) | CONFLICTS |
| §5 K4 row | ex. 5 (part 1); ex. 6, 7 (part 2) | part 1: UNSAID; part 2: CONFLICTS **(parts differ)** |
| §5 K5 row | ex. 6, 7 (part 2) | AGREES |
| §6 P15 | ex. 6, 7 (part 2) | AGREES |
| §7 stated cost | ex. 5 (part 1, M16) | CONFLICTS |

**Count** (COUNTED, by `k4_table.py`, kept in this session's scratch space, not in the repository; it parses the three parts' tables, merges rows by rule, and tallies the kinds named in each). 129 rows in the three parts (41, 49 and 39) give **77 rows** here: 9 definitions and sections 1 to 3, 63 grammar rules and clauses (G1.2 to G14.2), 1 rule of encoding 2 and 4 passages of sections 5 to 7. By kind, a row counted once under each kind any part gives it: **CONFLICTS 40, AGREES 34, UNSAID 26, REPLACES 11, EXTENDS 7**. 41 rows carry one kind and 36 carry more than one. 35 rows are marked "parts differ".

The three parts' own counts were checked by the same script: part 1, 41 rows (CONFLICTS 18, AGREES 13, UNSAID 7, REPLACES 4, EXTENDS 2), as part 1 states; part 2, 49 rows (CONFLICTS 19, AGREES 15, UNSAID 11, EXTENDS 3, REPLACES 1), as part 2 states; part 3, 39 rows (CONFLICTS 15, UNSAID 10, AGREES 9, REPLACES 7, EXTENDS 2), which part 3 did not total by kind (COUNTED). Every rule number in the three tables was found in draft 25, clause letters included (COUNTED, `k4_rules.py`: 0 missing).

### Rows to check

Rows left as the parts wrote them, which look wrong or uneven to this session (INFERRED, each with its reason). Nothing here is corrected.

1. **REPLACES with no ledger mark** (part 3: G4.5, G4.7(a), G4.7(b), G4.8, G5.4, G12.1, G13.3). Part 1 defines REPLACES as "the ledger marks it"; the ledger marks no replacement for exchange 12. Part 3 also lists 12-A (the pin) as a live conflict on the same clauses.
2. **One question, two kinds, parts 1 and 3** (G4.5, G4.7(a), G12.1, G13.3). Part 1 marks them CONFLICTS (M2, M3, from exchange 1 against exchange 12); part 3 marks the same clauses REPLACES (from exchange 12 alone).
3. **The brief's overtaken rows, two kinds** (G10.5, G12.5: part 1 REPLACES, part 2 CONFLICTS; G5.7: part 1 AGREES, part 2 CONFLICTS; §5 K4 row: part 1 UNSAID, part 2 CONFLICTS). Part 2 marks these CONFLICTS for disagreeing with the brief's sort, while its own note says the brief's sorts are "not counted above as conflicts between decisions" (M35).
4. **G10.6(a)**: part 1 REPLACES, part 2 AGREES, for the same effect of exchange 5 (it stays, read as the whole rule).
5. **G4.11(f)**: part 1 CONFLICTS (M16), part 2 UNSAID, on the same "a deal that ends by itself" against "Nothing changes by itself", each giving the same two readings.
6. **G5.1(c)**: part 1 UNSAID, part 2 CONFLICTS (M14), part 3 AGREES. Part 1 leaves to C1 whether a filler is outside it; part 2 finds the conflict; part 3 reads exchange 12 alone.
7. **G4.11(e)**: part 3 AGREES (exchange 12), parts 1 and 2 CONFLICTS (M1, exchange 5). Different exchanges; listed because a reader of the row alone may take the AGREES as covering the buyer.
8. **Part 1's numbering** of exchanges outside its share ("exchange 11" for exchange 12, "exchange 13" for exchange 14), in its body and its conflicts C2, C3, C4 and C7 (see "How to read this file").
9. **Part 2's quotation marks.** Part 2 says each quotation of his is "copied from `docs/decisions.md` on main ..., typos as the ledger has them", but gives his curly apostrophes as straight ones: "It's an agreements principle", "I don't feel it's a feature worth messing the core for", "Isn't it", "It's the "let me drown you ...", "Let's look at a service". The ledger has "It’s", "don’t", "it’s", "Isn’t", "Let”s" (COUNTED, `k4_quotes.py`: 19 of part 2's quotations match the ledger only once the quote marks are made straight). The words are the same. This file quotes the ledger's characters.
10. **Part 2's ledger line numbers** (for example "lines 65 to 67", "lines 487 to 490") are of commit `7366bbd`, which part 2 names; main has since moved them (the 18 November entry "Earned rights leave the grammar" now begins at line 500).
11. **G7.2**: part 1 CONFLICTS (M12, two contradicting place answers give "unchecked"), part 3 AGREES (a period needs the place). Different exchanges and different sentences of G7.2; the row shows one rule both ways.

---

## 4. Where an "Arrived at" line says more than his words

Merged from the three parts. Both quoted; the "extra" column is this session's summary of the part's finding.

| ex. | his words | the line (the MOR lead's) | the extra, unsaid by him | part |
|---|---|---|---|---|
| 1 | "Version 3 is the one the network needs to reject" … "Probably right." | "Only a missing act that could carry a knot (an act in a signer's own line, or an anchoring) leaves the answer unchecked" | the bracket; whether acts of another agreement and reports count | 1 |
| 1 | "Big warning needs to be placed on it." | "Where and how the warning is written is for the rewrite." | where; whether in the hashed text | 1 |
| 2 | "But now I see it adddresses the next question too, sorry" | "named signers and buyer by assent stay cMIPs, not grammar defaults." | his words name neither module; the line reads his 15:38 words as the MOR lead's lean | 1 |
| 2 | (none) | "That a verifier or client should hold the common cMIPs so they can be checked is the MOR lead's wording, for Development, not yet asked." | the whole line, as it says itself | 1 |
| 3 | "What they should find is a closed door." | "A reader without it should find a closed door ("unchecked"), not another way to the result." | equating the closed door with "unchecked"; "not another way to the result" (see M33) | 1 |
| 4 | "Agreed. It’s a different reason for a “sorry can’t do” and it’s always good to state why" | ""Unchecked" is kept for a reader that lacks something. Every refusal states its own reason." | "kept for a reader that lacks something"; "every refusal states", as a rule, where he said "always good" | 1 |
| 5 | "Ana is a different class of participant, she is unknown at the time of creation of the agreement. Therefore, she has no say in the updating of it, only the known parties can." | "A participant who joins through a role after the agreement was made (a filling) has no say in its updates; only the known parties have." | "joins through a role" where he said "unknown at the time of creation" (unsaid item 2); whether "no say" means never asked or cannot block | 1, 2 |
| 5 | (none) | "(A change to Agreements, for the list owed to the Dubsar Suite lead.)" | the list | 1 |
| 6 | "I think you are right. It is worth turning it into a principle. Protect the unknown party" | ""Protect the unknown party" is a principle of MOR." | "of MOR" (narrowed by exchange 7, M31); "it" read as exchange 5's principle, not the place answer | 2 |
| 6 | (the lean he agreed to: "the contest counts by its own place for its own prize") | "A contest counts by its own place for its own purposes." | "purposes" for "prize" | 2 |
| 7 | "It’s an agreements principle" | "it belongs to Agreements: stated in the Agreements companion, applied by Agreements' rules." | "stated in the Agreements companion", half of the lean his words set aside; or inside the Agreements text | 2 |
| 8 | "I don’t feel it’s a feature worth messing the core for" | "A rotation that waits, dropped on the current key's objection, can be offered by homes, above the core." | "can be offered by homes" (his words decline a change to the core, and neither confirm nor deny the rest) | 2 |
| 9 | "Yes, knots of different kids, on different layers, used at different moments if needed" | "rule 34 stays as it is ... a mention does not rescue it." | his words never name rule 34; his last "Yes" answers the MOR lead's account of the layers | 2 |
| 10 | "Knots making is core core business, a" | "Agreements' grammar gets one byte form for naming a set of acts ... It says nothing about whether the set is complete, what it means, or when it was read." | the limits; and the reading of "a" as option (a), after "Should it be in envelopes though?" ("core core" may point below Agreements) | 2 |
| 12 | "Yes, I always assumed in force to be human speech, and valid to be its translation for the verifier to be honest" | "no other assent is asked"; "Two updates answered valid against one version are a race: neither replaces it, and it stays."; "The first version comes into force by the assents of its named parties." | all three, if his "Yes" answers only the last part of the MOR lead's reading, the two words; his own words for the rule are "The core should only see one version as valid" | 3 |
| 13 | "Text comes first as a rule since agreement needs to point to it" | "so the words are published before the Terms that point to them." | "published" (where, to whom); "as a rule" as a grammar rule or a client's duty | 3 |
| 14 | "But let’s answer it… an agreement with no stated anchor cannot build a temporal condition" | "an agreement that states no anchor (no place, no clock) cannot have a condition in time: no deadline, no "before", no "after the close"." | "(no place, no clock)" (see M18); "no "before"", which can be time or order | 3 |
| 15 | "I’m tempted to state… sorry, we built two keys so that they could be kept separately" | "an owner robbed of both bears the loss, as Identity already states. Keeping them apart is the clients' duty." | "the clients' duty"; "bears the loss" was not found in Identity draft 16 (part 3, COUNTED) | 3 |
| 16 | "Good to go" Then: "Let’s keep the focus where it is for now. Agreed" | "read against draft 14, "What defines Money" and the duo." | what the Money review reads against | 3 |

Exchanges 11 and 17: none found by the parts.

---

## 5. The three parts, for the detail

Copied unchanged into this branch; each copy checked by script to be identical to its source (section "How it was made").

- [Part 1: versions, exchanges 1 to 5](draft-26-check/part-1-versions.md) (session K1; from branch `claude/draft-26-check-versions-82ymmc`)
- [Part 2: the principle and the knots, exchanges 6 to 11](draft-26-check/part-2-principle-and-knots.md) (session K2; from branch `claude/draft-26-check-principle-8zezwu`)
- [Part 3: gates, Text, anchors, exchanges 12 to 17](draft-26-check/part-3-gates-and-text.md) (session K3; from branch `claude/draft-26-check-gates-s8ooyb`)

The three part branches carry no pull request of their own.

---

## How it was made

- Read: `CLAUDE.md`; `spec/README.md`; the three parts whole; the seventeen exchanges in `docs/decisions.md` on main, each whole, and the earlier entries quoted here, each whole; draft 25 and encoding 2 on `claude/agreements-clean-1-hahuwn`, only to check rule numbers and quotations. Nothing else was read through.
- **The copies.** Each part was written from `git show <branch>:<path>` and compared with `cmp` and SHA-256 against its source on its branch (COUNTED; result below).
- **`k4_rules.py`**: every rule number and clause letter in the three parts' tables looked up in draft 25 (72 numbered rules; 0 missing).
- **`k4_quotes.py`**: every quotation of 20 characters or more in this file and in the parts looked for, character for character, in the ledger, draft 25, the brief, encoding 2 and the LATEST texts of `spec/` (result below).
- **`k4_table.py`**: the table and its counts.
- The scripts are kept in this session's scratch space, not in the repository.

**Results.**
- The copies: all three identical to their sources (`cmp` silent; SHA-256 of copy and source equal for each: part 1 `94e41d21baaf0c16…`, part 2 `9d0c44c105207aa3…`, part 3 `f8de0334574ed42c…`) (COUNTED).
- `k4_rules.py`: 0 rule numbers or clause letters missing from draft 25 (COUNTED).
- `k4_quotes.py` over this file: every quotation of his, of an "Arrived at" line, of draft 25, encoding 2, the brief and the LATEST texts was found character for character, but for these, each left on purpose: the straight-apostrophe forms of part 2 quoted under "Rows to check", item 9 (as part 2 has them); phrases quoted from the parts themselves ("not counted above as conflicts between decisions", "copied from ..."); "in force at position N" (pull request 229's wording, quoted by part 2); and four short phrases of a line given in lower case inside a sentence ("a deal meant to change", "a deal that ends by itself", "every refusal states") (COUNTED; the script's other misses are the text between two quotations, which its pattern catches by mistake).

### The blind reader, and what could not be fixed

"In plain words", with its list of words, and three conflicts drawn at random (M11, M21, M23, by `random.SystemRandom().sample` over 1 to 36) were handed to a subagent that had seen neither the ledger nor the prompt, with the question: "what are the two texts, and why can they not both stand?"

- **What it could say.** M21 in full. M11 in substance (one text gives an answer, the other forbids one). M23 in part: the two texts, and that the clash turns on what "hold" means. Plain-words lines 2, 4 and 5 in full; lines 1, 3, 6 and 7 in part.
- **Where it stumbled, and what was changed.** It did not know who "he" is, what an exchange or a part is, or what "turn" means; the first and last plain-words lines now say so. Line 6 did not say how one answer is "narrower"; it now does. "Signed again" lacked a subject; fixed. M11's quote of G4.8(a) began at "no such assent" with no antecedent; it now quotes the sentence before. M23 lacked the case (the thief, the home, the wait); a sentence now gives it, and the two readings of his answer are now given. "Home", "rotation", "reader", "Encoding 2", "line" and "lean" were added to the list of words.
- **What could not be fixed.** The list of words also names terms only later sections use (O, F, L, the brief), which the reader found unused in the excerpt; they stay, for the sections that use them. "Answered "a"" (M21) is explained only in M10 and in section 4. Identity's rules 20 and 24 are not quoted in M23 beyond their fragments; they are in part 2. The changed text was not put to a second blind reader.
